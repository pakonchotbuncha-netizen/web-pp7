/**
 * 3E3P Backend — Google Apps Script
 * เก็บผลแบบประเมิน 3E3P (Total Motivation) ลง Google Sheets แบบรวมศูนย์
 * ทุกเครื่องที่เปิดแบบทดสอบจะส่งข้อมูลมาที่นี่ และทุกเครื่องเห็นข้อมูลเดียวกัน
 *
 * วิธีติดตั้ง:
 * 1. เปิด Google Sheets (สร้างใหม่ หรือใช้ Sheet เดิมของ PP7)
 * 2. เมนู ส่วนขยาย (Extensions) → Apps Script
 * 3. ลบโค้ดเดิมทิ้ง วางไฟล์นี้ทั้งหมด แล้วกดบันทึก (Ctrl+S)
 * 4. รันฟังก์ชัน setupSheet() ครั้งแรก เพื่อสร้าง tab "3E3P_Results"
 * 5. Deploy → New deployment → Web app
 *    - Execute as: Me
 *    - Who has access: Anyone
 * 6. Copy URL (ลงท้าย /exec) ไปใส่ในหน้าแบบทดสอบ (tab ประวัติ → ตั้งค่า)
 */

// ===== CONFIG =====
// ถ้าเว้นว่าง จะใช้ spreadsheet ปัจจุบันที่ผูกกับ Apps Script นี้
const SPREADSHEET_ID = ''; // เช่น '1yP_l-WmsnlkMDCkZB7ulhe6oS_AAex8iE3LYdPdg-uc'
const SHEET_NAME = '3E3P_Results';

const HEADERS = [
  'timestamp', 'name', 'position', 'bu', 'team',
  'q1', 'q2', 'q3', 'q4', 'q5', 'q6',
  'direct', 'indirect', 'toe', 'status'
];

// ===== ENTRY POINTS =====
function doGet(e) {
  const action = (e && e.parameter && e.parameter.action) || 'list';
  try {
    if (action === 'ping') return jsonOut({ success: true, message: 'pong', time: new Date().toISOString() });
    if (action === 'list') return jsonOut({ success: true, data: listAll() });
    return jsonOut({ success: false, error: 'Unknown action: ' + action });
  } catch (err) {
    return jsonOut({ success: false, error: String(err) });
  }
}

function doPost(e) {
  const action = (e && e.parameter && e.parameter.action) || 'save';
  try {
    let body = {};
    if (e && e.postData && e.postData.contents) {
      try { body = JSON.parse(e.postData.contents); } catch (err) { body = {}; }
    }
    if (action === 'save') return jsonOut(saveRecord(body));
    if (action === 'delete_all') return jsonOut(deleteAll(body));
    return jsonOut({ success: false, error: 'Unknown action: ' + action });
  } catch (err) {
    return jsonOut({ success: false, error: String(err) });
  }
}

// ===== SETUP =====
function setupSheet() {
  const ss = getSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.appendRow(HEADERS);
    sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold').setBackground('#1a237e').setFontColor('#ffffff');
    sheet.setFrozenRows(1);
  }
  return '✅ สร้าง tab "' + SHEET_NAME + '" เรียบร้อย';
}

function getSpreadsheet() {
  if (SPREADSHEET_ID) return SpreadsheetApp.openById(SPREADSHEET_ID);
  return SpreadsheetApp.getActiveSpreadsheet();
}

function getSheet() {
  const ss = getSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) { setupSheet(); sheet = ss.getSheetByName(SHEET_NAME); }
  return sheet;
}

// ===== OPERATIONS =====
function saveRecord(rec) {
  if (!rec || !rec.name) return { success: false, error: 'Missing name' };

  // คำนวณค่าให้ครบถ้าไม่มา (กันข้อมูลจากเวอร์ชันเก่า)
  const scores = rec.scores || {};
  const weights = { 1: 10, 2: 5, 3: 1.66, 4: 1.66, 5: 5, 6: 10 };
  let direct = rec.direct, indirect = rec.indirect, toe = rec.toe;
  if (typeof direct !== 'number') {
    direct = 0;
    for (let i = 1; i <= 3; i++) direct += (scores[i] || 0) * weights[i];
  }
  if (typeof indirect !== 'number') {
    indirect = 0;
    for (let i = 4; i <= 6; i++) indirect += (scores[i] || 0) * weights[i];
  }
  if (typeof toe !== 'number') toe = direct - indirect;
  direct = Math.round(direct * 100) / 100;
  indirect = Math.round(indirect * 100) / 100;
  toe = Math.round(toe * 100) / 100;

  let status;
  if (toe > 40) status = 'Self-driven';
  else if (toe >= 10) status = 'Mixed';
  else if (toe >= -10) status = 'Compliance';
  else status = 'Disengaged';

  const ts = rec.timestamp || new Date().toISOString();
  const row = [
    ts,
    String(rec.name || ''),
    String(rec.position || ''),
    String(rec.bu || ''),
    String(rec.team || ''),
    scores[1] || 0, scores[2] || 0, scores[3] || 0,
    scores[4] || 0, scores[5] || 0, scores[6] || 0,
    direct, indirect, toe, status
  ];

  const sheet = getSheet();
  sheet.appendRow(row);
  return { success: true, saved: true, timestamp: ts, toe: toe, status: status };
}

function listAll() {
  const sheet = getSheet();
  const values = sheet.getDataRange().getValues();
  if (values.length <= 1) return []; // มีแต่ header
  const rows = [];
  for (let i = 1; i < values.length; i++) {
    const v = values[i];
    rows.push({
      timestamp: v[0] || '',
      name: v[1] || '',
      position: v[2] || '',
      bu: v[3] || '',
      team: v[4] || '',
      scores: { 1: v[5] || 0, 2: v[6] || 0, 3: v[7] || 0, 4: v[8] || 0, 5: v[9] || 0, 6: v[10] || 0 },
      direct: v[11] || 0,
      indirect: v[12] || 0,
      toe: v[13] || 0,
      status: v[14] || ''
    });
  }
  return rows;
}

function deleteAll(body) {
  const key = (body && body.key) || '';
  if (key !== 'pp7-admin') return { success: false, error: 'Invalid key' };
  const sheet = getSheet();
  const last = sheet.getLastRow();
  if (last > 1) sheet.deleteRows(2, last - 1);
  return { success: true, deleted: last - 1 };
}

// ===== HELPERS =====
function jsonOut(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
