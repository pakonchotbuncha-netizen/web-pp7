/**
 * Web PP7 — Succession "ฟอร์ม CEO รายคน" Backend (Google Apps Script)
 *
 * รับคำตอบจาก:
 *   - succession-member-form.html        (ฟอร์ม CEO รายคน v3 — เดิมคู่ใหม่ + แผน 2026-2030 + พี่เลี้ยง)
 *   - succession-member-form-simple.html (ฟอร์มแบบเรียบง่าย 5 ขั้น)
 *
 * เขียนลง Google Sheet: แผนสืบทอดบทบาท PKG — Succession Plan
 *   https://docs.google.com/spreadsheets/d/1MKbtnxe8bYFXhTSDqybQ752mGdIO8UOU-Z41xBjvJSs
 *   → tab "SP-CEOรายคน" (แยกจาก SP-บันทึกประเด็น / SP-สมาชิกรายคน เพื่อไม่ทับข้อมูลเดิม)
 *
 * Deploy: Web app
 *   - Execute as: Me (pakonchotbuncha@gmail.com)
 *   - Who has access: Anyone
 *
 * API:
 *   POST body {action:'saveMemberForm', data:{...}} → append 1 แถว
 *   GET  → {status:'ok', count:N}
 */

// ===== CONFIG =====
const SPREADSHEET_ID = '1MKbtnxe8bYFXhTSDqybQ752mGdIO8UOU-Z41xBjvJSs';
const TAB_NAME = 'SP-CEOรายคน';

// คอลัมน์ (union ของทั้ง 2 ฟอร์ม — append-only)
const HEADERS = [
  'timestamp', 'savedAt', 'formType',
  'nick', 'full', 'group', 'teamRole',
  'roles', 'roleOpts',
  'ncass_bu_purpose', 'ncass_bu_vision',
  'ncass_team_purpose', 'ncass_team_vision',
  'ncass_per_purpose', 'ncass_per_vision',
  'resp', 'purpose',
  'okr_b', 'okr_t', 'okr_p',
  'bsc', 'cover', 'note',
  'plan_cond', 'plan_coown', 'plan_timeline',
  'mentor_mv', 'mentor_mh', 'mentor_my'
];

// ===== SETUP =====
function setup() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  let sheet = ss.getSheetByName(TAB_NAME);
  if (!sheet) sheet = ss.insertSheet(TAB_NAME);
  if (sheet.getLastRow() === 0) {
    sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
    sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold');
    sheet.setFrozenRows(1);
  }
  return { status: 'ok', message: 'Tab พร้อมใช้: ' + TAB_NAME, headers: HEADERS.length };
}

function getOrCreateTab_() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  let sheet = ss.getSheetByName(TAB_NAME);
  if (!sheet) sheet = ss.insertSheet(TAB_NAME);
  if (sheet.getLastRow() === 0) {
    sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
    sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold');
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function normalizeRow_(data) {
  return HEADERS.map(function (h) {
    var v = data[h];
    if (Array.isArray(v)) v = v.join(' | ');
    if (v && typeof v === 'object') v = JSON.stringify(v);
    return (v === undefined || v === null) ? '' : String(v);
  });
}

// ===== MAIN: POST =====
function doPost(e) {
  const out = { status: 'ok', success: true };
  try {
    const body = JSON.parse(e.postData.contents);
    const action = body && body.action;
    if (action !== 'saveMemberForm') {
      throw new Error('Unknown action: ' + action);
    }
    if (body.spreadsheetId && body.spreadsheetId !== SPREADSHEET_ID) {
      throw new Error('spreadsheetId ไม่ตรงกับ backend: ' + body.spreadsheetId);
    }
    const data = body.data || {};
    if (!data.nick && !data.full) {
      throw new Error('ข้อมูลว่างเปล่า — ไม่มี nick/full');
    }
    const row = [new Date().toISOString()].concat(normalizeRow_(data));
    const sheet = getOrCreateTab_();
    const lock = LockService.getScriptLock();
    lock.waitLock(10000);
    try {
      sheet.appendRow(row);
    } finally {
      lock.releaseLock();
    }
    out.row = sheet.getLastRow();
    out.nick = data.nick || '';
    out.formType = data.formType || '';
    out.message = 'บันทึกสำเร็จ แถวที่ ' + out.row;
  } catch (err) {
    out.status = 'error';
    out.success = false;
    out.message = String(err);
    out.error = String(err);
  }
  return ContentService.createTextOutput(JSON.stringify(out))
    .setMimeType(ContentService.MimeType.JSON);
}

// ===== MAIN: GET =====
function doGet(e) {
  const out = { status: 'ok', success: true };
  try {
    const sheet = getOrCreateTab_();
    out.count = Math.max(0, sheet.getLastRow() - 1);
    out.tab = TAB_NAME;
    out.spreadsheetId = SPREADSHEET_ID;
  } catch (err) {
    out.status = 'error';
    out.success = false;
    out.message = String(err);
    out.error = String(err);
  }
  return ContentService.createTextOutput(JSON.stringify(out))
    .setMimeType(ContentService.MimeType.JSON);
}
