/**
 * ============================================================
 *  GAT Work System — Google Apps Script Backend (BCT Bridge)
 *  ประจำ Google Spreadsheet: BCT (บอร์ดบันทึกรายการตรวจสอบของทีม BU)
 *  วันที่: 2 พ.ย. 2569 — รุ่น v1.0
 *
 *  บทบาท (ตาม gat-workflow-sop.md):
 *   - ทีม BU บันทึกรายการตรวจสอบ (Checklist) ผ่านชีท BCT หรือฟอร์ม
 *   - Web GAT ดึงข้อมูลจากชีทนี้ขึ้น Dashboard เพื่อวิเคราะห์/รายงาน
 *   - GAT ออกใบประเด็น (Issue) กลับลงชีทนี้ → BU เห็นและตอบกลับในชีท
 *
 *  ติดตั้ง:
 *   1) เปิด Google Sheet BCT → Extensions → Apps Script
 *   2) วางโค้ดนี้ทั้งไฟล์ → บันทึก
 *   3) รัน setupSheets() หนึ่งครั้ง (สร้างชีท GAT_* อัตโนมัติ)
 *   4) Deploy → New deployment → Web app
 *      - Execute as: Me
 *      - Who has access: Anyone (หรือ Anyone in organization)
 *   5) คัดลอก Web app URL ไปใส่ใน gat-config.js (BCT_API) บน Web GAT
 * ============================================================
 */

var CONFIG = {
  // รหัสชุดข้อมูล GAT ในสเปรดชีตนี้ (มี prefix GAT_ เพื่อแยกจากชีทเดิมของ BCT)
  SHEETS: {
    REGISTERS: 'GAT_Registers',      // Master Register: รายการตรวจสอบ/ภาระต้องส่ง
    ENTRIES: 'GAT_Entries',          // รายการบันทึกผลตรวจสอบรายครั้ง (BU กรอก)
    ISSUES: 'GAT_Issues',            // ใบประเด็นจาก GAT/OpenClaw (อ้างชีท+แถว)
    AUDIT_LOG: 'GAT_AuditLog'        // audit trail ทุกการเปลี่ยนแปลง
  },
  TZ: 'Asia/Bangkok'
};

/* ================= SETUP (รันครั้งเดียว) ================= */
function setupSheets() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  ensureSheet(ss, CONFIG.SHEETS.REGISTERS, [
    'REG_ID', 'BU', 'PROCESS_TYPE', 'PROCESS_CODE', 'TITLE', 'REGULATOR',
    'LAW_RULE', 'REQUIREMENT', 'DOCUMENT', 'DUE_DATE', 'FREQUENCY',
    'OWNER', 'COMPLIANCE_REVIEWER', 'LEGAL', 'SIGNATORY', 'STATUS',
    'EVIDENCE', 'SOURCE', 'UPDATED_AT', 'UPDATED_BY'
  ]);
  ensureSheet(ss, CONFIG.SHEETS.ENTRIES, [
    'ENTRY_ID', 'REG_ID', 'ENTRY_DATE', 'BU', 'PROCESS_CODE', 'PERIOD',
    'RESULT',           // ส่งแล้ว/ตรงเวลา/ล่าช้า/ยังไม่ส่ง/พบประเด็น
    'SCORE',            // 0-100 ถ้ามี
    'FINDINGS',         // สิ่งที่พบ
    'EVIDENCE_URL',     // ลิงก์หลักฐาน
    'SUBMITTED_BY', 'SUBMITTED_AT', 'STATUS'
  ]);
  ensureSheet(ss, CONFIG.SHEETS.ISSUES, [
    'ISSUE_ID', 'REG_ID', 'CREATED_AT', 'PROCESS_TYPE', 'PROCESS_CODE',
    'SEVERITY',         // 🔴 ขัดกฎหมาย/จำเป็นจริง | 🟢 ข้อเสนอ
    'TITLE', 'DETAIL', 'SHEET_REF',       // อ้าง ชีท+แถว ต้นฉบับ
    'STATUS',           // open / BU ยืนยันแก้ / แก้แล้ว(วันที่) / ยืนยันไม่แก้(เหตุผล) / ปิด
    'BU_RESPONSE', 'BU_RESPONDED_AT', 'GAT_CONFIRMED_AT', 'CLOSED_AT'
  ]);
  ensureSheet(ss, CONFIG.SHEETS.AUDIT_LOG, [
    'LOG_ID', 'TIMESTAMP', 'ACTOR', 'ACTION', 'TARGET', 'DETAIL'
  ]);
  log_('system', 'setup', 'sheets', 'สร้างชีท GAT_* ครบ 4 ชีท');
  return 'OK: ชีทพร้อมใช้งาน — ต่อไป Deploy → Web app';
}

function ensureSheet(ss, name, headers) {
  var sh = ss.getSheetByName(name);
  if (!sh) {
    sh = ss.insertSheet(name);
    sh.getRange(1, 1, 1, headers.length).setValues([headers]).setFontWeight('bold');
    sh.setFrozenRows(1);
  }
  return sh;
}

/* ================= API: GET (Web GAT ดึงข้อมูล) =================
 * ?action=list_registers
 * ?action=list_entries
 * ?action=list_issues
 * ?action=overview
 */
function doGet(e) {
  var action = (e && e.parameter && e.parameter.action) || 'overview';
  try {
    var payload;
    switch (action) {
      case 'list_registers': payload = readAll_(CONFIG.SHEETS.REGISTERS); break;
      case 'list_entries':   payload = readAll_(CONFIG.SHEETS.ENTRIES);   break;
      case 'list_issues':    payload = readAll_(CONFIG.SHEETS.ISSUES);    break;
      case 'overview':       payload = overview_();                       break;
      default: throw new Error('unknown action: ' + action);
    }
    return json_({ ok: true, action: action, generatedAt: now_(), data: payload });
  } catch (err) {
    return json_({ ok: false, error: String(err), action: action });
  }
}

/* ================= API: POST (บันทึกจาก BU หรือฟอร์ม) =================
 * body JSON:
 *  { action:"add_entry",  data:{ REG_ID, ENTRY_DATE, BU, PROCESS_CODE, PERIOD, RESULT, SCORE, FINDINGS, EVIDENCE_URL, SUBMITTED_BY } }
 *  { action:"add_register", data:{ BU, PROCESS_TYPE, PROCESS_CODE, TITLE, REGULATOR, LAW_RULE, REQUIREMENT, DOCUMENT, DUE_DATE, FREQUENCY, OWNER, SIGNATORY } }
 *  { action:"respond_issue", data:{ ISSUE_ID, STATUS, BU_RESPONSE, RESPONDED_BY } }
 */
function doPost(e) {
  try {
    var body = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    var action = body.action;
    var data = body.data || {};
    var id;
    switch (action) {
      case 'add_entry':
        id = 'EN-' + Date.now();
        appendRow_(CONFIG.SHEETS.ENTRIES, [
          id, or_(data.REG_ID), d_(data.ENTRY_DATE), or_(data.BU), or_(data.PROCESS_CODE),
          or_(data.PERIOD), or_(data.RESULT, 'ส่งแล้ว'), or_(data.SCORE, ''), or_(data.FINDINGS),
          or_(data.EVIDENCE_URL), or_(data.SUBMITTED_BY, 'BU'), now_(), 'บันทึกแล้ว'
        ]);
        log_(data.SUBMITTED_BY || 'BU', 'add_entry', id, or_(data.TITLE));
        return json_({ ok: true, id: id });

      case 'add_register':
        id = 'REG-' + Date.now();
        appendRow_(CONFIG.SHEETS.REGISTERS, [
          id, or_(data.BU), or_(data.PROCESS_TYPE), or_(data.PROCESS_CODE), or_(data.TITLE),
          or_(data.REGULATOR), or_(data.LAW_RULE), or_(data.REQUIREMENT), or_(data.DOCUMENT),
          or_(data.DUE_DATE), or_(data.FREQUENCY), or_(data.OWNER), or_(data.COMPLIANCE_REVIEWER),
          or_(data.LEGAL), or_(data.SIGNATORY), or_(data.STATUS, '🟢 ปกติ'), or_(data.EVIDENCE),
          'add_register', now_(), or_(data.BY, 'BU')
        ]);
        log_(data.BY || 'BU', 'add_register', id, or_(data.TITLE));
        return json_({ ok: true, id: id });

      case 'respond_issue':
        var updated = respondIssue_(data);
        log_(data.RESPONDED_BY || 'BU', 'respond_issue', or_(data.ISSUE_ID), or_(data.STATUS));
        return json_({ ok: true, updated: updated });

      default:
        throw new Error('unknown action: ' + action);
    }
  } catch (err) {
    return json_({ ok: false, error: String(err) });
  }
}

/* ===== GAT/OpenClaw เขียนใบประเด็นลงชีท (สำหรับคนขับ/หรือเรียกจากหน้า Web GAT) ===== */
function addIssue(payload) {
  var data = (typeof payload === 'string') ? JSON.parse(payload) : payload;
  var id = 'IS-' + Date.now();
  appendRow_(CONFIG.SHEETS.ISSUES, [
    id, or_(data.REG_ID), now_(), or_(data.PROCESS_TYPE), or_(data.PROCESS_CODE),
    or_(data.SEVERITY, '🟢 ข้อเสนอ'), or_(data.TITLE), or_(data.DETAIL), or_(data.SHEET_REF),
    or_(data.STATUS, 'open'), '', '', '', ''
  ]);
  log_('GAT', 'add_issue', id, or_(data.TITLE));
  return id;
}

/* ================= HELPERS ================= */
function overview_() {
  var regs = readAll_(CONFIG.SHEETS.REGISTERS);
  var ents = readAll_(CONFIG.SHEETS.ENTRIES);
  var issues = readAll_(CONFIG.SHEETS.ISSUES);
  var byBU = {};
  regs.forEach(function(r) {
    var bu = r.BU || '(ไม่ระบุ)';
    if (!byBU[bu]) byBU[bu] = { registers: 0, onTime: 0, late: 0, open: 0 };
    byBU[bu].registers++;
  });
  ents.forEach(function(x) {
    var bu = x.BU || '(ไม่ระบุ)';
    if (!byBU[bu]) byBU[bu] = { registers: 0, onTime: 0, late: 0, open: 0 };
    if (String(x.RESULT).indexOf('ล่าช้า') >= 0) byBU[bu].late++;
    else if (String(x.RESULT).indexOf('ยังไม่ส่ง') < 0) byBU[bu].onTime++;
  });
  issues.forEach(function(x) {
    if (String(x.STATUS).indexOf('open') === 0) {
      var r = regs.filter(function(q){return q.REG_ID === x.REG_ID;})[0];
      var bu = (r && r.BU) || '(ไม่ระบุ)';
      if (!byBU[bu]) byBU[bu] = { registers: 0, onTime: 0, late: 0, open: 0 };
      byBU[bu].open++;
    }
  });
  return { totals: { registers: regs.length, entries: ents.length, issues: issues.length }, byBU: byBU };
}

function respondIssue_(data) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName(CONFIG.SHEETS.ISSUES);
  var rows = sh.getDataRange().getValues();
  var headers = rows[0];
  var ci = function(n){ return headers.indexOf(n); };
  for (var i = 1; i < rows.length; i++) {
    if (rows[i][ci('ISSUE_ID')] === data.ISSUE_ID) {
      sh.getRange(i + 1, ci('STATUS') + 1).setValue(or_(data.STATUS, 'BU ยืนยันแก้'));
      sh.getRange(i + 1, ci('BU_RESPONSE') + 1).setValue(or_(data.BU_RESPONSE));
      sh.getRange(i + 1, ci('BU_RESPONDED_AT') + 1).setValue(now_());
      if (String(data.STATUS).indexOf('ปิด') >= 0) {
        sh.getRange(i + 1, ci('CLOSED_AT') + 1).setValue(now_());
      }
      return true;
    }
  }
  throw new Error('ไม่พบ ISSUE_ID: ' + data.ISSUE_ID);
}

function readAll_(sheetName) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName(sheetName);
  if (!sh) throw new Error('ไม่พบชีท ' + sheetName + ' — รัน setupSheets() ก่อน');
  var rows = sh.getDataRange().getValues();
  if (rows.length < 2) return [];
  var headers = rows[0];
  return rows.slice(1).filter(function(r) {
    return String(r[0]).trim() !== '';
  }).map(function(r) {
    var o = {};
    headers.forEach(function(h, i) { o[h] = r[i]; });
    return o;
  });
}

function appendRow_(sheetName, arr) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName(sheetName);
  sh.appendRow(arr);
}

function log_(actor, action, target, detail) {
  try {
    appendRow_(CONFIG.SHEETS.AUDIT_LOG, ['LG-' + Date.now(), now_, actor, action, target, detail]);
  } catch (e) { /* log พังไม่ให้กระทบงานหลัก */ }
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
function now_() { return Utilities.formatDate(new Date(), CONFIG.TZ, 'yyyy-MM-dd HH:mm:ss'); }
function or_(v, def) { return (v === undefined || v === null || String(v).trim() === '') ? (def || '') : v; }
function d_(v) { return v ? new Date(v) : new Date(); }