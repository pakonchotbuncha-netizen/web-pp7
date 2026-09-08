/**
 * Web PP7 — Succession Form Backend (Google Apps Script)
 *
 * รับคำตอบจาก succession-form-dashboard.html → เขียนลงชีต "SP-บันทึกประเด็น"
 * ใน Google Sheet: แผนสืบทอดบทบาท PKG — Succession Plan
 * https://docs.google.com/spreadsheets/d/1MKbtnxe8bYFXhTSDqybQ752mGdIO8UOU-Z41xBjvJSs
 *
 * Deploy: Web app
 *   - Execute as: Me (pakonchotbuncha@gmail.com)
 *   - Who has access: Anyone
 *
 * API:
 *   POST {action:'submitSuccessionEntry', spreadsheetId, data} → เขียน 1 แถว
 *   GET  → {status:'ok', count:N} จำนวน record ที่มี
 */

// ===== CONFIG =====
const SPREADSHEET_ID = '1MKbtnxe8bYFXhTSDqybQ752mGdIO8UOU-Z41xBjvJSs';
const TAB_NAME = 'SP-บันทึกประเด็น';

// ลำดับคอลัมน์ ตรงกับคีย์ที่หน้า dashboard ส่ง (collectForm)
// หมายเหตุ: append-only — คีย์ใหม่ (2026-09-07 master plan review) ต่อท้ายเสมอ
// ไม่ reorder เดิม เพื่อให้ข้อมูลแถวเก่าที่เขียนไปแล้วยังอ่านตรงคอลัมน์
const HEADERS = [
  'timestamp', 'savedAt', 'id',
  'a1_name', 'a2_company', 'a3_role', 'a4_date',
  'b1_roles', 'b2_text', 'b2_level', 'b3_spof', 'b4_successors',
  'b5_obstacles', 'b5_other',
  'c1_text', 'c1_level', 'c2_period', 'c3_formats', 'c4_readiness', 'c5_gat',
  'c6_systems', 'c6_detail',
  'd1_suggestions', 'd2_willing', 'd3_urgency',
  // เพิ่มเติม 2026-09-07 (ทบทวนฟอร์มตาม master plan)
  'b6_cover_order',
  'c7_conditions', 'c7_detail',
  'c8_skills', 'c8_other',
  'c9_co',
  'c10_veto', 'c10_detail',
  'd4_culture',
  // เพิ่มเติม 2026-09-07 (ทีมบริหารจริง): OAC 3 / GAT 15 (ADM เก่าเปลี่ยนชื่อ) / ADM ใหม่ 4 — คัดตาม BSC
  'a5_bsc',
  'b4_oac', 'b4_gat', 'b4_adm', 'b4_other',
  'b5_names',
  // เพิ่มเติม 2026-09-08 (ตามเกณฑ์ยืนยัน): B5 เปลี่ยนจากอุปสรรค → ช่องทางการถ่ายทอดงาน (append-only — คง b5_obstacles เดิมไว้)
  'b5_channels'
];

// ===== SETUP (รันครั้งแรก) =====
function setup() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  let sheet = ss.getSheetByName(TAB_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(TAB_NAME);
  }
  if (sheet.getLastRow() === 0) {
    sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
    sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold');
    sheet.setFrozenRows(1);
    sheet.setFrozenColumns(0);
  }
  return { status: 'ok', message: 'Tab พร้อมใช้: ' + TAB_NAME, headers: HEADERS.length };
}

// เปิด tab (สร้าง + header ถ้ายังไม่มี)
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

// map record → แถวตาม HEADERS (timestamp เติมแยกตอนเขียน)
function normalizeRow_(data) {
  return HEADERS.map(function (h) {
    var v = data[h];
    if (Array.isArray(v)) v = v.join(' | ');
    return (v === undefined || v === null) ? '' : String(v);
  });
}

// ===== MAIN: POST =====
function doPost(e) {
  const out = { status: 'ok', success: true };
  try {
    const body = JSON.parse(e.postData.contents);
    if (!body || body.action !== 'submitSuccessionEntry') {
      throw new Error('Unknown action: ' + (body && body.action));
    }
    if (body.spreadsheetId && body.spreadsheetId !== SPREADSHEET_ID) {
      throw new Error('spreadsheetId ไม่ตรงกับ backend: ' + body.spreadsheetId);
    }
    const data = body.data || {};
    if (!data.a4_date && !data.a1_name && !data.b1_roles) {
      throw new Error('ข้อมูลว่างเปล่า — ไม่มีคีย์ที่รู้จัก');
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
    out.id = data.id || '';
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

// ===== MAIN: GET (ตรวจจำนวน record) =====
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
