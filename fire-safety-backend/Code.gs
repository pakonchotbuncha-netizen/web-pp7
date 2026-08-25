/**
 * Fire Safety Dashboard Backend — Google Apps Script
 * เชื่อมต่อกับ Google Sheet ID: 1gq0KajkWw5_rOd6U_f6lLQETc4CP5cZ0lxXSVWFm_tY
 * 
 * วิธีติดตั้ง:
 * 1. เปิด Sheet: https://docs.google.com/spreadsheets/d/1gq0KajkWw5_rOd6U_f6lLQETc4CP5cZ0lxXSVWFm_tY/edit
 * 2. Extensions → Apps Script
 * 3. ลบโค้ดเดิมทั้งหมด วางโค้ดนี้ลงไป
 * 4. กด Deploy → New deployment → Web app
 *    - Execute as: Me
 *    - Who has access: Anyone
 * 5. Copy URL (ลงท้าย /exec) ไปใส่ใน Dashboard
 */

const SPREADSHEET_ID = '1gq0KajkWw5_rOd6U_f6lLQETc4CP5cZ0lxXSVWFm_tY';
const SHARE_EMAILS = ['pakonchotbuncha@gmail.com'];

// ===== ENTRY POINTS =====
function doGet(e) {
  const action = (e && e.parameter && e.parameter.action) || 'getAll';
  try {
    if (action === 'ping') return jsonOut({ success: true, message: 'pong', time: new Date().toISOString() });
    if (action === 'getAll') return jsonOut(getAllData());
    if (action === 'getTasks') return jsonOut({ success: true, data: getSheetData('Tasks') });
    if (action === 'getEquipment') return jsonOut({ success: true, data: getSheetData('Equipment') });
    if (action === 'getBudget') return jsonOut({ success: true, data: getSheetData('Budget') });
    if (action === 'getLogs') return jsonOut({ success: true, data: getSheetData('Logs') });
    if (action === 'getLinks') return jsonOut({ success: true, data: getSheetData('Links') });
    if (action === 'setup') return jsonOut(setupAllSheets());
    return jsonOut({ success: false, error: 'Unknown action: ' + action });
  } catch (err) {
    return jsonOut({ success: false, error: String(err) });
  }
}

function doPost(e) {
  try {
    let body = {};
    if (e && e.postData && e.postData.contents) {
      try { body = JSON.parse(e.postData.contents); } catch (err) { body = {}; }
    }
    const action = body.action || 'save';
    
    if (action === 'saveTask') return jsonOut(saveTask(body.data));
    if (action === 'deleteTask') return jsonOut(deleteRow('Tasks', body.id));
    if (action === 'saveEquipment') return jsonOut(saveEquipment(body.data));
    if (action === 'deleteEquipment') return jsonOut(deleteRow('Equipment', body.id));
    if (action === 'saveBudget') return jsonOut(saveBudget(body.data));
    if (action === 'deleteBudget') return jsonOut(deleteRow('Budget', body.idx));
    if (action === 'saveLog') return jsonOut(saveLog(body.data));
    if (action === 'deleteLog') return jsonOut(deleteRow('Logs', body.id));
    if (action === 'saveLink') return jsonOut(saveLink(body.data));
    if (action === 'deleteLink') return jsonOut(deleteRow('Links', body.id));
    
    return jsonOut({ success: false, error: 'Unknown action: ' + action });
  } catch (err) {
    return jsonOut({ success: false, error: String(err) });
  }
}

// ===== SETUP =====
function setupAllSheets() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  ensureShared(ss);
  
  // Tasks
  let tasksSheet = ss.getSheetByName('Tasks');
  if (!tasksSheet) {
    tasksSheet = ss.insertSheet('Tasks');
    tasksSheet.appendRow(['id', 'week', 'task', 'owner', 'priority', 'status', 'createdAt', 'updatedAt']);
    tasksSheet.getRange(1, 1, 1, 8).setFontWeight('bold').setBackground('#dc2626').setFontColor('#ffffff');
    tasksSheet.setFrozenRows(1);
  }
  
  // Equipment
  let eqSheet = ss.getSheetByName('Equipment');
  if (!eqSheet) {
    eqSheet = ss.insertSheet('Equipment');
    eqSheet.appendRow(['id', 'type', 'brand', 'location', 'expire', 'status', 'action']);
    eqSheet.getRange(1, 1, 1, 7).setFontWeight('bold').setBackground('#f97316').setFontColor('#ffffff');
    eqSheet.setFrozenRows(1);
  }
  
  // Budget
  let budgetSheet = ss.getSheetByName('Budget');
  if (!budgetSheet) {
    budgetSheet = ss.insertSheet('Budget');
    budgetSheet.appendRow(['item', 'qty', 'price', 'spent', 'date', 'note']);
    budgetSheet.getRange(1, 1, 1, 6).setFontWeight('bold').setBackground('#eab308').setFontColor('#ffffff');
    budgetSheet.setFrozenRows(1);
  }
  
  // Logs
  let logsSheet = ss.getSheetByName('Logs');
  if (!logsSheet) {
    logsSheet = ss.insertSheet('Logs');
    logsSheet.appendRow(['id', 'taskId', 'taskName', 'date', 'detail', 'timestamp']);
    logsSheet.getRange(1, 1, 1, 6).setFontWeight('bold').setBackground('#22c55e').setFontColor('#ffffff');
    logsSheet.setFrozenRows(1);
  }
  
  // Links
  let linksSheet = ss.getSheetByName('Links');
  if (!linksSheet) {
    linksSheet = ss.insertSheet('Links');
    linksSheet.appendRow(['id', 'taskId', 'label', 'url', 'timestamp']);
    linksSheet.getRange(1, 1, 1, 5).setFontWeight('bold').setBackground('#3b82f6').setFontColor('#ffffff');
    linksSheet.setFrozenRows(1);
  }
  
  return { success: true, message: '✅ สร้าง 5 tabs เรียบร้อย (Tasks, Equipment, Budget, Logs, Links)' };
}

function ensureShared(ss) {
  try {
    for (const email of SHARE_EMAILS) {
      ss.addEditor(email);
    }
  } catch (err) { /* ข้ามถ้าไม่มีสิทธิ์ */ }
}

// ===== GET DATA =====
function getAllData() {
  return {
    success: true,
    data: {
      tasks: getSheetData('Tasks'),
      equipment: getSheetData('Equipment'),
      budget: getSheetData('Budget'),
      logs: getSheetData('Logs'),
      links: getSheetData('Links')
    }
  };
}

function getSheetData(sheetName) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName(sheetName);
  if (!sheet) return [];
  const data = sheet.getDataRange().getValues();
  if (data.length < 2) return [];
  const headers = data[0];
  return data.slice(1).map(row => {
    const obj = {};
    headers.forEach((h, i) => { obj[h] = row[i]; });
    return obj;
  });
}

// ===== SAVE/DELETE =====
function saveTask(data) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName('Tasks');
  if (!sheet) setupAllSheets();
  
  const headers = sheet.getRange(1, 1, 1, 8).getValues()[0];
  const id = data.id || new Date().getTime();
  const now = new Date().toISOString();
  
  // หา row ที่มี id ตรงกัน
  const allData = sheet.getDataRange().getValues();
  let found = false;
  for (let i = 1; i < allData.length; i++) {
    if (String(allData[i][0]) === String(id)) {
      // อัปเดต
      const row = headers.map(h => {
        if (h === 'updatedAt') return now;
        return data[h] !== undefined ? data[h] : '';
      });
      sheet.getRange(i + 1, 1, 1, 8).setValues([row]);
      found = true;
      break;
    }
  }
  
  if (!found) {
    // เพิ่มใหม่
    const row = headers.map(h => {
      if (h === 'id') return id;
      if (h === 'createdAt') return now;
      if (h === 'updatedAt') return now;
      return data[h] !== undefined ? data[h] : '';
    });
    sheet.appendRow(row);
  }
  
  return { success: true, id: id };
}

function saveEquipment(data) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName('Equipment');
  if (!sheet) setupAllSheets();
  
  const headers = sheet.getRange(1, 1, 1, 7).getValues()[0];
  const allData = sheet.getDataRange().getValues();
  let found = false;
  
  for (let i = 1; i < allData.length; i++) {
    if (String(allData[i][0]) === String(data.id)) {
      const row = headers.map(h => data[h] !== undefined ? data[h] : '');
      sheet.getRange(i + 1, 1, 1, 7).setValues([row]);
      found = true;
      break;
    }
  }
  
  if (!found) {
    const row = headers.map(h => data[h] !== undefined ? data[h] : '');
    sheet.appendRow(row);
  }
  
  return { success: true, id: data.id };
}

function saveBudget(data) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName('Budget');
  if (!sheet) setupAllSheets();
  
  const headers = sheet.getRange(1, 1, 1, 6).getValues()[0];
  const row = headers.map(h => data[h] !== undefined ? data[h] : '');
  sheet.appendRow(row);
  
  return { success: true };
}

function saveLog(data) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName('Logs');
  if (!sheet) setupAllSheets();
  
  // หาชื่อ task จาก Tasks sheet
  let taskName = '';
  const tasksSheet = ss.getSheetByName('Tasks');
  if (tasksSheet) {
    const tasksData = tasksSheet.getDataRange().getValues();
    for (let i = 1; i < tasksData.length; i++) {
      if (String(tasksData[i][0]) === String(data.taskId)) {
        taskName = tasksData[i][2] || ''; // คอลัมน์ C = task
        break;
      }
    }
  }
  
  const id = new Date().getTime();
  const now = new Date().toISOString();
  sheet.appendRow([id, data.taskId, taskName, data.date, data.detail, now]);
  
  return { success: true, id: id, taskName: taskName };
}

function saveLink(data) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName('Links');
  if (!sheet) setupAllSheets();
  
  const id = new Date().getTime();
  const now = new Date().toISOString();
  sheet.appendRow([id, data.taskId, data.label, data.url, now]);
  
  return { success: true, id: id };
}

function deleteRow(sheetName, id) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName(sheetName);
  if (!sheet) return { success: false, error: 'Sheet not found' };
  
  const data = sheet.getDataRange().getValues();
  const idCol = 0; // คอลัมน์แรกคือ id
  
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][idCol]) === String(id)) {
      sheet.deleteRow(i + 1);
      break;
    }
  }
  
  return { success: true };
}

// ===== HELPER =====
function jsonOut(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
