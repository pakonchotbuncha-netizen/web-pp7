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
  'timestamp', 'emp_id', 'name', 'position', 'bu', 'team',
  'source_p', 'round',
  'q1', 'q2', 'q3', 'q4', 'q5', 'q6',
  'direct', 'indirect', 'toe', 'status'
];

// ===== ENTRY POINTS =====
function doGet(e) {
  const action = (e && e.parameter && e.parameter.action) || 'list';
  try {
    if (action === 'ping') return jsonOut({ success: true, message: 'pong', time: new Date().toISOString() });
    if (action === 'sheet_url') return jsonOut(getSheetUrl());
    if (action === 'lookup_member') return jsonOut(lookupMember(e.parameter && e.parameter.emp_id));
    if (action === 'cleanup') return jsonOut(cleanupData());
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
  const active = SpreadsheetApp.getActiveSpreadsheet();
  if (active) return active;
  // standalone script (ไม่ได้ผูกกับ Sheet): ค้นหาหรือสร้าง Sheet เฉพาะอัตโนมัติ
  const props = PropertiesService.getScriptProperties();
  const savedId = props.getProperty('SS_ID');
  if (savedId) {
    try { return SpreadsheetApp.openById(savedId); } catch (err) {}
  }
  const ss = SpreadsheetApp.create('Web PP7 — 3E3P Results');
  props.setProperty('SS_ID', ss.getId());
  return ss;
}

// คืนลิงก์ Google Sheets ที่เก็บข้อมูล
function getSheetUrl() {
  try {
    const ss = getSpreadsheet();
    return { success: true, url: ss.getUrl(), name: ss.getName(), id: ss.getId() };
  } catch (err) {
    return { success: false, error: String(err) };
  }
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
  
  // แหล่งที่มา P (P1 แสวงหา / P2 หยั่งประเมิน / P4 ประเมินผล / P5 พัฒนา)
  // auto-detect: ถ้ามี emp_id → P4 (สมาชิกปัจจุบัน), ไม่มี → P1 (ผู้สมัคร)
  const empIdStr = String(rec.empId || rec.emp_id || '').trim();
  let sourceP = String(rec.source_p || '').trim();
  if (!sourceP) sourceP = empIdStr ? 'P4' : 'P1';
  
  // รอบที่: นับจากประวัติเดิมของคนนี้ + 1
  const sheet = getSheet();
  const existing = sheet.getDataRange().getValues();
  let round = 1;
  if (empIdStr) {
    for (let i = 1; i < existing.length; i++) {
      if (String(existing[i][1] || '').trim() === empIdStr) round++;
    }
  } else {
    const nameKey = String(rec.name || '').trim();
    for (let i = 1; i < existing.length; i++) {
      if (!String(existing[i][1] || '').trim() && String(existing[i][2] || '').trim() === nameKey) round++;
    }
  }
  
  const row = [
    ts,
    empIdStr,
    String(rec.name || ''),
    String(rec.position || ''),
    String(rec.bu || ''),
    String(rec.team || ''),
    sourceP,
    round,
    scores[1] || 0, scores[2] || 0, scores[3] || 0,
    scores[4] || 0, scores[5] || 0, scores[6] || 0,
    direct, indirect, toe, status
  ];

  sheet.appendRow(row);
  return { success: true, saved: true, timestamp: ts, toe: toe, status: status, source_p: sourceP, round: round };
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
      empId: v[1] || '',
      name: v[2] || '',
      position: v[3] || '',
      bu: v[4] || '',
      team: v[5] || '',
      source_p: v[6] || '',
      round: v[7] || '',
      scores: { 1: v[8] || 0, 2: v[9] || 0, 3: v[10] || 0, 4: v[11] || 0, 5: v[12] || 0, 6: v[13] || 0 },
      direct: v[14] || 0,
      indirect: v[15] || 0,
      toe: v[16] || 0,
      status: v[17] || ''
    });
  }
  return rows;
}

// ===== BCT — ข้อมูลสมาชิกจริง (auto-fill) =====
const BCT_SHEET_ID = '1bclXg8KKfXFAxY1mRucRPyL2hWddRZky4TKkEP6e9B0'; // สำเนา BCT [V3.0]

// ค้นหาสมาชิก: ลอง MEMBERS_DIR (สารบัญฝังใน) ก่อน → BCT → Members sheet
function lookupMember(empId) {
  if (!empId) return { success: false, error: 'Missing emp_id' };
  // 0) สารบัญสมาชิกฝังใน (เร็วสุด — ไม่ต้องอ่าน Sheet)
  if (typeof MEMBERS_DIR !== 'undefined') {
    const m = MEMBERS_DIR[String(empId).trim()];
    if (m) {
      return {
        success: true,
        source: 'Members directory',
        data: {
          emp_id: String(empId).trim(),
          name: m.n || '',
          position: (m.pos && m.pos !== 'no') ? m.pos : (m.nick || ''),
          bu: m.bu || '',
          team: m.co || ''
        }
      };
    }
  }
  // 1) ลองอ่านจาก BCT (ถ้าได้รับสิทธิ์แชร์)
  try {
    const bct = SpreadsheetApp.openById(BCT_SHEET_ID);
    const sheets = bct.getSheets();
    for (const sheet of sheets) {
      const values = sheet.getDataRange().getValues();
      if (values.length <= 1) continue;
      const headers = values[0].map(h => String(h).trim());
      const idIdx = headers.findIndex(h => /รหัส|code|id|เลขที่/i.test(h));
      if (idIdx < 0) continue;
      for (let i = 1; i < values.length; i++) {
        const cell = String(values[i][idIdx] || '').trim();
        if (cell === String(empId).trim()) {
          const get = (re) => {
            const idx = headers.findIndex(h => re.test(h));
            return idx >= 0 ? String(values[i][idx] || '').trim() : '';
          };
          return {
            success: true,
            source: 'BCT',
            data: {
              emp_id: cell,
              name: get(/ชื่อ.*สกุล|ชื่อ|name/i),
              position: get(/ตำแหน่ง|position/i),
              bu: get(/BU|หน่วยธุรกิจ|หน่วยงาน|บริษัท/i),
              team: get(/ทีม|team|แผนก|ฝ่าย|department/i)
            }
          };
        }
      }
    }
  } catch (err) {
    // ไม่มีสิทธิ์อ่าน BCT — ข้ามไปใช้ Members sheet
  }
  // 2) Fallback: Members sheet ของตัวเอง
  try {
    const ss = getSpreadsheet();
    const candidates = ['Members', 'members', 'P1_Recruitment', 'พนักงาน', 'Employee'];
    for (const name of candidates) {
      const sheet = ss.getSheetByName(name);
      if (!sheet) continue;
      const values = sheet.getDataRange().getValues();
      if (values.length <= 1) continue;
      const headers = values[0].map(h => String(h).trim());
      const idIdx = headers.findIndex(h => /member_id|emp_id|employee_id|รหัส/i.test(h));
      if (idIdx < 0) continue;
      for (let i = 1; i < values.length; i++) {
        const cell = String(values[i][idIdx] || '').trim();
        if (cell.toLowerCase() === String(empId).toLowerCase()) {
          const get = (re) => {
            const idx = headers.findIndex(h => re.test(h));
            return idx >= 0 ? String(values[i][idx] || '').trim() : '';
          };
          return {
            success: true,
            data: {
              emp_id: cell,
              name: get(/ชื่อ|name|full_name/i) || (get(/first_name/i) + ' ' + get(/last_name/i)).trim(),
              position: get(/ตำแหน่ง|position/i),
              bu: get(/BU|หน่วยธุรกิจ|bu_id|หน่วยงาน/i),
              team: get(/ทีม|team|แผนก|department/i)
            }
          };
        }
      }
    }
    return { success: false, error: 'Not found' };
  } catch (err) {
    return { success: false, error: String(err) };
  }
}

function deleteAll(body) {
  const key = (body && body.key) || '';
  if (key !== 'pp7-admin') return { success: false, error: 'Invalid key' };
  const sheet = getSheet();
  const last = sheet.getLastRow();
  if (last > 1) sheet.deleteRows(2, last - 1);
  return { success: true, deleted: last - 1 };
}

// แก้ไขข้อมูลผิด: ลบแถวทดสอบ + แก้ BU ของอารีย์
function cleanupData() {
  const sheet = getSheet();
  const values = sheet.getDataRange().getValues();
  const rowsToDelete = [];
  const rowsToFix = [];
  
  // Migrate: ถ้าแถวเก่ามี 16 คอลัมน์ (ก่อนเพิ่ม source_p/round) ให้แทรก 2 คอลัมน์ที่ตำแหน่ง 6-7
  const maxCols = Math.max(...values.map(r => r.length));
  for (let i = 1; i < values.length; i++) {
    const row = values[i];
    while (row.length < maxCols) row.push('');
    if (row.length === 16) {
      row.splice(6, 0, '', '');
    }
  }
  // Header ให้มีครบ 18
  const header = values[0];
  while (header.length < HEADERS.length) header.push(HEADERS[header.length]);
  // เขียนกลับทั้งหมด (ใช้ maxCols ที่อัปเดต)
  const finalCols = Math.max(...values.map(r => r.length));
  sheet.getRange(1, 1, values.length, finalCols).setValues(values);
  
  for (let i = 1; i < values.length; i++) {
    const empId = String(values[i][1] || '').trim();
    const name = String(values[i][2] || '').trim();
    const bu = String(values[i][4] || '').trim();
    
    // ลบแถวที่ชื่อเป็น "1" (ข้อมูลทดสอบ)
    if (name === '1') {
      rowsToDelete.push(i + 1);
    }
    // แก้ BU ของ 5001026 (อารีย์) จาก CPDG เป็น LDC
    else if (empId === '5001026' && bu !== 'LDC') {
      rowsToFix.push({ row: i + 1, bu: 'LDC' });
    }
  }
  
  // ลบแถว (จากล่างขึ้นบนเพื่อไม่ให้ row shift)
  rowsToDelete.sort((a, b) => b - a);
  for (const r of rowsToDelete) {
    sheet.deleteRow(r);
  }
  
  // แก้ไข BU
  for (const fix of rowsToFix) {
    sheet.getRange(fix.row, 5).setValue('LDC'); // column E = BU
  }
  
  // Backfill: เติมชื่อ/ตำแหน่ง/BU/ทีม ที่ขาด จากสารบัญสมาชิก (สำหรับแถวที่เหลือ)
  const after = sheet.getDataRange().getValues();
  let backfilled = 0;
  // 1) เติม P (default P4 ถ้ามี emp_id, P1 ถ้าไม่มี) + นับรอบตามประวัติ
  const empCounts = {};
  for (let i = 1; i < after.length; i++) {
    const empId = String(after[i][1] || '').trim();
    if (empId) empCounts[empId] = (empCounts[empId] || 0) + 1;
  }
  const roundSeen = {};
  for (let i = 1; i < after.length; i++) {
    const empId = String(after[i][1] || '').trim();
    const p = String(after[i][6] || '').trim();
    if (!p) {
      sheet.getRange(i + 1, 7).setValue(empId ? 'P4' : 'P1');
      backfilled++;
    }
    const r = String(after[i][7] || '').trim();
    if (!r) {
      roundSeen[empId] = (roundSeen[empId] || 0) + 1;
      sheet.getRange(i + 1, 8).setValue(roundSeen[empId]);
      backfilled++;
    } else {
      roundSeen[empId] = parseInt(r) || 0;
    }
  }
  // 2) เติมชื่อ/ตำแหน่ง/BU/ทีม ที่ขาด จากสารบัญสมาชิก
  if (typeof MEMBERS_DIR !== 'undefined') {
    for (let i = 1; i < after.length; i++) {
      const empId = String(after[i][1] || '').trim();
      const m = MEMBERS_DIR[empId];
      if (!m) continue;
      const name = String(after[i][2] || '').trim();
      const pos = String(after[i][3] || '').trim();
      const bu = String(after[i][4] || '').trim();
      const team = String(after[i][5] || '').trim();
      if (!name) { sheet.getRange(i + 1, 3).setValue(m.n); backfilled++; }
      if (!pos && m.pos && m.pos !== 'no') { sheet.getRange(i + 1, 4).setValue(m.pos); backfilled++; }
      if (!bu) { sheet.getRange(i + 1, 5).setValue(m.bu); backfilled++; }
      if (!team) { sheet.getRange(i + 1, 6).setValue(m.co); backfilled++; }
    }
  }
  
  return {
    success: true,
    deleted: rowsToDelete.length,
    fixed: rowsToFix.length,
    backfilled: backfilled,
    details: {
      deletedRows: rowsToDelete,
      fixedRows: rowsToFix.map(f => ({ row: f.row, newBU: f.bu }))
    }
  };
}

// ===== HELPERS =====
function jsonOut(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
