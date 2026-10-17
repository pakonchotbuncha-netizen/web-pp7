/**
 * GAT BU Pre-Audit Pack — Backend (Google Apps Script)
 * รับข้อมูลจากฟอร์ม gat-bu-preaudit-pack-form.html แล้วบันทึกลง Google Sheet
 *
 * วิธีติดตั้ง (5 นาที)
 *  1) สร้าง Google Sheet ใหม่ชื่อ "GAT-BU-PACK-REGISTRY" → แชร์ pakonchotbuncha@gmail.com (Editor)
 *  2) Extensions > Apps Script → ลบ Code.gs → วางไฟล์นี้ → Save
 *  3) ตั้งค่า SHEET_ID ด้านล่าง (ถ้าเป็นสคริปต์ Standalone) แล้ว Run ฟังก์ชัน setupPack_() หนึ่งครั้ง
 *  4) Deploy > New deployment > Web app → Execute as: Me → Who has access: Anyone → Deploy
 *  5) คัดลอก URL /exec ไปวางในช่อง "Endpoint URL" ของฟอร์ม
 *
 * แท็บที่ระบบสร้างให้
 *  - Submissions : 1 แถว = 1 การส่ง 1 ครั้ง (มี Ref, บริษัท, ผู้ส่ง, เวลา, จำนวนช่องที่กรอก)
 *  - Fields      : แบบยาว (Ref, Section, Key, Value) — ใช้ทำ pivot/รายงานได้ทุกมิติ
 *  - <tableKey>  : 1 แท็บต่อ 1 ตาราง (lctObl, lctLic, ... sumGap, sumRisk) มีคอลัมน์ Ref + Company นำหน้า
 */

var SHEET_ID = ''; // ถ้าเป็น Standalone Script ให้ใส่ ID ของชีต GAT-BU-PACK-REGISTRY

function ss_() {
  if (SHEET_ID) return SpreadsheetApp.openById(SHEET_ID);
  var a = SpreadsheetApp.getActiveSpreadsheet();
  if (!a) throw new Error('ไม่พบ Spreadsheet — กรุณาใส่ SHEET_ID หรือเปิดสคริปต์จาก Extensions > Apps Script ของชีต');
  return a;
}

var TABLE_COLS = {
  lctObl:   ['type','item','agency','due','status','evidence','owner'],
  lctLic:   ['name','no','issuer','expire','renew','owner'],
  lctCon:   ['party','term','signer','lang','review','file'],
  lctCase:  ['case','party','status','risk','lawyer','plan'],
  lctLawyer:['firm','country','scope','contact','contract','backup'],
  lct90:    ['item','due','owner','plan','ready'],
  c1reg:    ['law','duty','owner','status','evidence'],
  c2doc:    ['doc','ver','owner','result','note'],
  c2doa:    ['level','name','since','doc','status'],
  c3asset:  ['data','subject','legal','where','who','cross'],
  c3rbac:   ['system','role','scope','review','risk'],
  c4coi:    ['name','position','related','declare','date'],
  c4vend:   ['vendor','relation','value','process','note'],
  c4case:   ['case','channel','status','action'],
  sumGap:   ['gap','dim','cause','plan','owner','status'],
  sumRisk:  ['risk','impact','like','owner','action','due']
};

function setupPack_() {
  var s = ss_();
  var sub = s.getSheetByName('Submissions') || s.insertSheet('Submissions');
  sub.clear();
  sub.appendRow(['Ref','Company','Period','Sender','Coordinator','AuditDate','SubmittedAt','FieldsFilled','TableRows','Version','JSON']);
  sub.setFrozenRows(1);

  var fl = s.getSheetByName('Fields') || s.insertSheet('Fields');
  fl.clear();
  fl.appendRow(['Ref','Company','Key','Value','SubmittedAt']);
  fl.setFrozenRows(1);

  Object.keys(TABLE_COLS).forEach(function (k) {
    var sh = s.getSheetByName(k) || s.insertSheet(k);
    sh.clear();
    sh.appendRow(['Ref','Company'].concat(TABLE_COLS[k]));
    sh.setFrozenRows(1);
  });
  SpreadsheetApp.flush();
  try { DriveApp.getFileById(s.getId()).addEditor('pakonchotbuncha@gmail.com'); } catch (e) {}
  return 'setup complete';
}

function ref_(company) {
  var now = new Date();
  var yy = String(now.getFullYear() + 543).slice(-2);
  var mm = ('0' + (now.getMonth() + 1)).slice(-2);
  var abbr = String(company || 'BU').replace(/[^A-Za-zก-๙]/g, '').slice(0, 4).toUpperCase() || 'BU';
  var stamp = Utilities.formatDate(now, 'Asia/Bangkok', 'ddHHmmss');
  return 'PACK-' + yy + mm + '-' + abbr + '-' + stamp;
}

function out_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(20000);
    var body = {};
    if (e && e.postData && e.postData.contents) body = JSON.parse(e.postData.contents);
    var s = ss_();

    var sub = s.getSheetByName('Submissions') || s.insertSheet('Submissions');
    if (sub.getLastRow() === 0) {
      sub.appendRow(['Ref','Company','Period','Sender','Coordinator','AuditDate','SubmittedAt','FieldsFilled','TableRows','Version','JSON']);
    }
    var fl = s.getSheetByName('Fields') || s.insertSheet('Fields');
    if (fl.getLastRow() === 0) fl.appendRow(['Ref','Company','Key','Value','SubmittedAt']);

    var company = body.company || '';
    var ref = ref_(company);
    var now = new Date();
    var fields = body.fields || {};
    var tables = body.tables || {};

    var filled = 0, totalRows = 0;
    var fieldRows = [];
    Object.keys(fields).forEach(function (k) {
      var v = fields[k];
      var sv = (v === true ? 'TRUE' : v === false ? 'FALSE' : (v == null ? '' : String(v)));
      if (sv.trim() !== '') filled++;
      fieldRows.push([ref, company, k, sv, now]);
    });
    Object.keys(tables).forEach(function (k) {
      var arr = tables[k] || [];
      totalRows += arr.length;
      var cols = TABLE_COLS[k];
      if (!cols) {
        cols = Object.keys(arr[0] || {});
        var sh0 = s.getSheetByName(k) || s.insertSheet(k);
        if (sh0.getLastRow() === 0) sh0.appendRow(['Ref','Company'].concat(cols));
      }
      var sh = s.getSheetByName(k) || s.insertSheet(k);
      if (sh.getLastRow() === 0) sh.appendRow(['Ref','Company'].concat(cols));
      arr.forEach(function (r) {
        sh.appendRow([ref, company].concat(cols.map(function (c) { return r[c] == null ? '' : r[c]; })));
      });
    });

    if (fieldRows.length) fl.getRange(fl.getLastRow() + 1, 1, fieldRows.length, 5).setValues(fieldRows);

    sub.appendRow([
      ref, company,
      (fields['period'] || ''), (fields['meta.sender'] || ''),
      (fields['coord.name'] || ''), (fields['auditdate'] || ''),
      now, filled, totalRows, (body.version || '1.0'), JSON.stringify(body)
    ]);
    SpreadsheetApp.flush();

    return out_({ ok: true, ref: ref, time: Utilities.formatDate(now, 'Asia/Bangkok', 'dd/MM/yyyy HH:mm:ss'), fields: filled, rows: totalRows });
  } catch (err) {
    return out_({ ok: false, error: String(err) });
  } finally {
    try { lock.releaseLock(); } catch (e2) {}
  }
}

function doGet(e) {
  try {
    var s = ss_();
    var sub = s.getSheetByName('Submissions');
    var n = sub ? Math.max(0, sub.getLastRow() - 1) : 0;
    return out_({ ok: true, service: 'GAT-BU-PACK', submissions: n, time: new Date().toISOString() });
  } catch (err) {
    return out_({ ok: false, error: String(err) });
  }
}
