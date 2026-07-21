/**
 * Google Apps Script สำหรับดึงข้อมูลผู้สมัครรอสัมภาษณ์
 * Deploy เป็น Web App แล้วเรียกใช้จาก Web PP7
 * 
 * วิธีใช้:
 * 1. เปิด Google Sheets: https://docs.google.com/spreadsheets/d/1dH15UxEDyTldPx4lwU5Y6_BQYbTw_gJRMsC4-HCnXR4
 * 2. Extensions > Apps Script
 * 3. Copy โค้ดนี้ไปวาง
 * 4. Deploy > New deployment > Web app
 * 5. Execute as: Me, Who has access: Anyone
 * 6. Copy URL ที่ได้ไปใช้ใน Web PP7
 */

function doGet(e) {
  const sheetId = '1dH15UxEDyTldPx4lwU5Y6_BQYbTw_gJRMsC4-HCnXR4';
  const sheetName = 'A1_ข้อมูลผู้สมัครทั้งหมด';
  
  const ss = SpreadsheetApp.openById(sheetId);
  const sheet = ss.getSheetByName(sheetName);
  
  if (!sheet) {
    return ContentService.createTextOutput(JSON.stringify({
      error: 'Sheet not found',
      sheetName: sheetName
    })).setMimeType(ContentService.MimeType.JSON);
  }
  
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  
  // ค้นหา column index
  const statusCol = findColumnIndex(headers, ['สถานะขั้นตอนใด', 'สถานะ']);
  const nameCol = findColumnIndex(headers, ['ชื่อ[ภาษาไทย]', 'ชื่อ']);
  const lastNameCol = findColumnIndex(headers, ['นามสกุล[ภาษาไทย]', 'นามสกุล']);
  const nicknameCol = findColumnIndex(headers, ['ชื่อเล่น']);
  const position1Col = findColumnIndex(headers, ['ตำแหน่งงานที่สมัคร1', 'ตำแหน่ง1']);
  const position2Col = findColumnIndex(headers, ['ตำแหน่งงานที่สมัคร2', 'ตำแหน่ง2']);
  const salaryCol = findColumnIndex(headers, ['เงินเดือนที่คาดหวัง', 'เงินเดือน']);
  const phoneCol = findColumnIndex(headers, ['เบอร์โทร', 'โทรศัพท์']);
  const dateCol = findColumnIndex(headers, ['วันที่สมัคร', 'วันที่']);
  
  // Filter เฉพาะสถานะที่ต้องการ
  const targetStatuses = ['รอสัมภาษณ์', 'รอคัดเลือกใบสมัคร', 'รอนัดสัมภาษณ์'];
  
  const applicants = [];
  
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    const status = row[statusCol] ? String(row[statusCol]).trim() : '';
    
    if (targetStatuses.includes(status)) {
      applicants.push({
        no: row[1] || '',
        id: row[2] || '',
        status: status,
        firstName: row[nameCol] || '',
        lastName: row[lastNameCol] || '',
        nickname: row[nicknameCol] || '',
        position1: row[position1Col] || '',
        position2: row[position2Col] || '',
        salary: row[salaryCol] || '',
        phone: row[phoneCol] || '',
        date: row[dateCol] || ''
      });
    }
  }
  
  // สรุปสถิติ
  const summary = {
    total: applicants.length,
    byStatus: {}
  };
  
  applicants.forEach(app => {
    if (!summary.byStatus[app.status]) {
      summary.byStatus[app.status] = 0;
    }
    summary.byStatus[app.status]++;
  });
  
  const result = {
    success: true,
    timestamp: new Date().toISOString(),
    summary: summary,
    applicants: applicants
  };
  
  return ContentService.createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * หา column index จาก header
 */
function findColumnIndex(headers, keywords) {
  for (let i = 0; i < headers.length; i++) {
    const header = String(headers[i] || '').trim();
    for (const keyword of keywords) {
      if (header.includes(keyword)) {
        return i;
      }
    }
  }
  return -1;
}

/**
 * ทดสอบ function
 */
function test() {
  const result = doGet();
  const data = JSON.parse(result.getContent());
  console.log('Total applicants:', data.summary.total);
  console.log('By status:', data.summary.byStatus);
  console.log('First 5 applicants:', data.applicants.slice(0, 5));
}
