/**
 * GAT Audit No. — ระบบรันเลขรวมศูนย์ข้ามเครื่อง (Central Sequence)
 * ไฟล์นี้: นำไปวางใน Google Apps Script ของ Google Sheet กลาง (แยกจาก Web PP7)
 *
 * ชื่อ Sheet ที่ต้องมี 2 แท็บ:
 *  1) Seq — เก็บเลขล่าสุดรายเดือน | คอลัมน์ A: YM (เช่น 6910) B: last_seq (ตัวเลข) C: updated_at
 *  2) Log — บันทึกการออกเลขทุกครั้ง | AuditNo | Title | BU | Period | AuditDate | Auditor | Coordinator | Scope | CreatedAt | Source
 *
 * วิธีติดตั้ง (5 นาที):
 *  1. สร้าง Google Sheet ใหม่ (เช่น "GAT-Central-Registry") → แชร์ให้ pakonchotbuncha@gmail.com (Editor)
 *  2. เปิด Extensions > Apps Script → ลบ Code.gs เดิม → วางไฟล์นี้ทั้งหมด → Save
 *  3. รันฟังก์ชัน setup_() หนึ่งครั้ง (กด Run → อนุญาตสิทธิ์) เพื่อสร้างหัวตาราง
 *  4. Deploy > New deployment > แบบ Web app → Execute as: Me → Who has access: Anyone → Deploy → คัดลอก URL /exec
 *  5. นำ URL ไปใส่ในแบบฟอร์ม GAT ช่อง "Central Endpoint URL" + เลือกโหมด "รวมศูนย์ข้ามเครื่อง"
 *
 * รูปแบบเลข: GAT-YY-MM-### (ปี พ.ศ. 2 หลัก - เดือน - ลำดับรายเดือน เริ่ม 001 ทุกเดือน)
 * ตัวอย่าง: GAT-69-10-001, GAT-69-10-002 ...
 */

// ---------- helpers ----------
function thaiYYMM_() {
  var now = new Date();
  var thaiYear = now.getFullYear() + 543;
  var yy = String(thaiYear).slice(-2);
  var mm = ('0' + (now.getMonth() + 1)).slice(-2);
  return { ym: yy + mm, yy: yy, mm: mm };
}
function fmtNo_(yy, mm, seq) {
  return 'GAT-' + yy + '-' + mm + '-' + ('00' + seq).slice(-3);
}
function ss_() { return SpreadsheetApp.getActiveSpreadsheet(); }
function seqSheet_() { return ss_().getSheetByName('Seq'); }
function logSheet_() { return ss_().getSheetByName('Log'); }

/** รันครั้งเดียวเพื่อสร้างหัวตาราง */
function setup_() {
  var s1 = ss_().getSheetByName('Seq') || ss_.insertSheet('Seq');
  var s2 = ss_().getSheetByName('Log') || ss_.insertSheet('Log');
  s1.clear(); s1.appendRow(['YM', 'last_seq', 'updated_at']);
  s2.clear();
  s2.appendRow(['AuditNo', 'Title', 'BU', 'Period', 'AuditDate', 'Auditor', 'Coordinator', 'Scope', 'CreatedAt', 'Source']);
}

/** อ่านเลขล่าสุดของเดือนนี้ */
function peek_() {
  var k = thaiYYMM_();
  var sh = seqSheet_();
  var last = 0;
  if (sh) {
    var vals = sh.getDataRange().getValues();
    for (var i = 1; i < vals.length; i++) {
      if (String(vals[i][0]) === k.ym) { last = Number(vals[i][1]) || 0; break; }
    }
  }
  return { ym: k.ym, yy: k.yy, mm: k.mm, last: last, next: last + 1, nextNo: fmtNo_(k.yy, k.mm, last + 1) };
}

/** ออกเลขใหม่ + บันทึก Log (ใช้ Lock กันเลขชนเมื่อกดพร้อมกัน) */
function reserve_(meta) {
  meta = meta || {};
  var lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    var k = thaiYYMM_();
    var sh = seqSheet_();
    var rowIdx = -1, last = 0;
    var vals = sh.getDataRange().getValues();
    for (var i = 1; i < vals.length; i++) {
      if (String(vals[i][0]) === k.ym) { rowIdx = i + 1; last = Number(vals[i][1]) || 0; break; }
    }
    var next = last + 1;
    var no = fmtNo_(k.yy, k.mm, next);
    var now = new Date();
    if (rowIdx === -1) {
      sh.appendRow([k.ym, next, now]);
    } else {
      sh.getRange(rowIdx, 2).setValue(next);
      sh.getRange(rowIdx, 3).setValue(now);
    }
    logSheet_().appendRow([
      no,
      meta.title || '', meta.bu || '', meta.period || '', meta.auditDate || '',
      meta.auditor || '', meta.coordinator || '', meta.scope || '',
      now, meta.source || 'form'
    ]);
    return { ok: true, auditNo: no, seq: next, ym: k.ym };
  } finally {
    lock.releaseLock();
  }
}

function out_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

// GET: ?action=peek → ดูเลขถัดไปโดยยังไม่ออกเลข | ?action=next → ออกเลขใหม่ทันที
function doGet(e) {
  try {
    var a = (e && e.parameter && e.parameter.action) || 'peek';
    if (a === 'next') {
      var r = reserve_({
        title: e.parameter.title || '',
        bu: e.parameter.bu || '',
        period: e.parameter.period || '',
        auditDate: e.parameter.auditDate || '',
        auditor: e.parameter.auditor || '',
        coordinator: e.parameter.coordinator || '',
        scope: e.parameter.scope || '',
        source: 'get'
      });
      return out_(r);
    }
    var p = peek_();
    return out_({ ok: true, mode: 'peek', nextNo: p.nextNo, next: p.next, last: p.last, ym: p.ym });
  } catch (err) {
    return out_({ ok: false, error: String(err) });
  }
}

// POST: {action:'peek'} หรือ {action:'next', title, bu, period, ...}
function doPost(e) {
  try {
    var body = {};
    if (e && e.postData && e.postData.contents) body = JSON.parse(e.postData.contents);
    if (body.action === 'next') return out_(reserve_(body));
    var p = peek_();
    return out_({ ok: true, mode: 'peek', nextNo: p.nextNo, next: p.next, last: p.last, ym: p.ym });
  } catch (err) {
    return out_({ ok: false, error: String(err) });
  }
}
