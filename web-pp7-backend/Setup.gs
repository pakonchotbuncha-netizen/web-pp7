/**
 * PP7 Backend — Setup.gs
 * สคริปต์สร้าง Sheets ทั้งหมดสำหรับ PP7 HRMS
 * 
 * วิธีใช้: รัน createAllTables() จาก Apps Script Editor
 * จะสร้างทุก Sheet พร้อม Headers และข้อมูลเริ่มต้น
 */

/**
 * สร้างทุก Table = สร้างทุก Sheet พร้อม Headers
 * รันครั้งแรกตอน Deploy ระบบ
 */
function createAllTables() {
  var ss = getOrCreateSpreadsheet();
  var created = [];
  var skipped = [];
  
  // สร้างทุก sheet จาก ALL_SHEETS config
  for (var tableName in ALL_SHEETS) {
    if (!ALL_SHEETS.hasOwnProperty(tableName)) continue;
    
    var config = ALL_SHEETS[tableName];
    var sheetName = config.prefix + tableName;
    var existingSheet = ss.getSheetByName(sheetName);
    
    if (existingSheet) {
      skipped.push(sheetName);
      continue;
    }
    
    // สร้าง sheet ใหม่
    var newSheet = ss.insertSheet(sheetName);
    
    // เขียน headers
    newSheet.getRange(1, 1, 1, config.headers.length).setValues([config.headers]);
    
    // จัดรูปแบบ headers
    formatSheetHeaders(newSheet, config.headers.length);
    
    created.push(sheetName);
  }
  
  // สร้างข้อมูลเริ่มต้น (seed data)
  seedInitialData(ss);
  
  // บันทึกรายงาน
  var report = {
    success: true,
    spreadsheet_id: ss.getId(),
    spreadsheet_url: ss.getUrl(),
    created: created,
    skipped: skipped,
    message: 'สร้าง ' + created.length + ' sheet (ข้าม ' + skipped.length + ' sheet ที่มีอยู่แล้ว)'
  };
  
  // บันทึก Spreadsheet ID
  PropertiesService.getScriptProperties().setProperty('SPREADSHEET_ID', ss.getId());
  
  Logger.log(JSON.stringify(report, null, 2));
  return report;
}

/**
 * ได้ Spreadsheet (สร้างใหม่ถ้ายังไม่มี)
 */
function getOrCreateSpreadsheet() {
  var ssId = PropertiesService.getScriptProperties().getProperty('SPREADSHEET_ID');
  
  if (ssId) {
    try {
      return SpreadsheetApp.openById(ssId);
    } catch (e) {
      Logger.log('Spreadsheet not found, creating new one...');
    }
  }
  
  // สร้าง Spreadsheet ใหม่
  var ss = SpreadsheetApp.create('PP7 HRMS Database');
  PropertiesService.getScriptProperties().setProperty('SPREADSHEET_ID', ss.getId());
  Logger.log('Created new spreadsheet: ' + ss.getUrl());
  
  // ลบ Sheet เดิม (Sheet1) ที่ Google สร้างอัตโนมัติ
  var defaultSheet = ss.getSheetByName('Sheet1');
  if (defaultSheet) {
    // จะลบทีหลังหลังจากมี sheet อื่นแล้ว
    ss.insertSheet('Temp');
  }
  
  return ss;
}

/**
 * จัดรูปแบบ header row ของ sheet
 */
function formatSheetHeaders(sheet, colCount) {
  var headerRange = sheet.getRange(1, 1, 1, colCount);
  
  // Background สีน้ำเงิน
  headerRange.setBackground('#1e40af');
  headerRange.setFontColor('#ffffff');
  headerRange.setFontWeight('bold');
  headerRange.setFontSize(10);
  headerRange.setHorizontalAlignment('center');
  headerRange.setVerticalAlignment('middle');
  
  // ความสูงแถว
  sheet.setRowHeight(1, 30);
  
  // Freeze header row
  sheet.setFrozenRows(1);
  
  // Auto-resize columns (ถ้าทำได้)
  for (var i = 1; i <= colCount; i++) {
    try {
      sheet.autoResizeColumn(i);
    } catch (e) {
      // ข้าม
    }
  }
}

/**
 * สร้างข้อมูลเริ่มต้น (Seed Data)
 */
function seedInitialData(ss) {
  // Seed Roles
  seedRoles(ss);
  
  // Seed Admin User
  seedAdminUser(ss);
  
  // Seed Business Units (ตัวอย่าง)
  seedBusinessUnits(ss);
  
  // Seed Departments (ตัวอย่าง)
  seedDepartments(ss);
  
  // Seed Recruitment Sources
  seedRecruitmentSources(ss);
  
  Logger.log('Seed data completed.');
}

/**
 * Seed: Roles
 */
function seedRoles(ss) {
  var sheet = ss.getSheetByName('DB_roles');
  if (!sheet) return;
  
  // ตรวจสอบว่ามีข้อมูลแล้วหรือยัง
  if (sheet.getLastRow() > 1) return;
  
  var headers = ALL_SHEETS['roles'].headers;
  var now = new Date().toISOString();
  var admin = 'system@pp7.local';
  
  var roles = [
    { id: generateUUID(), role_name: 'admin', description_th: 'ผู้ดูแลระบบ — เข้าใจทุกส่วน', permissions: JSON.stringify(['all']), menu_access: JSON.stringify(['all']), country: 'TH' },
    { id: generateUUID(), role_name: 'hr_manager', description_th: 'ผู้จัดการ HR — จัดการ P1-P7', permissions: JSON.stringify(['P1','P2','P3','P4','P5','P6','P7','dashboard']), menu_access: JSON.stringify(['P1','P2','P3','P4','P5','P6','P7','dashboard']), country: 'TH' },
    { id: generateUUID(), role_name: 'bu_manager', description_th: 'ผู้จัดการ BU — จัดการ P1-P4 ของ BU', permissions: JSON.stringify(['P1','P2','P3','P4','dashboard']), menu_access: JSON.stringify(['P1','P2','P3','P4','dashboard']), country: 'TH' },
    { id: generateUUID(), role_name: 'employee', description_th: 'พนักงาน — ดูข้อมูลตัวเอง', permissions: JSON.stringify(['P4_self','P5_self','P6_self','P7_self','dashboard_self']), menu_access: JSON.stringify(['profile','dashboard']), country: 'TH' },
    { id: generateUUID(), role_name: 'auditor', description_th: 'ผู้ตรวจสอบ — ดูอย่างเดียว', permissions: JSON.stringify(['read_all']), menu_access: JSON.stringify(['all_readonly']), country: 'TH' },
    { id: generateUUID(), role_name: 'guest', description_th: 'ผู้เยี่ยมชม — ดู Dashboard', permissions: JSON.stringify(['dashboard']), menu_access: JSON.stringify(['dashboard']), country: 'TH' }
  ];
  
  for (var i = 0; i < roles.length; i++) {
    var role = roles[i];
    role.created_at = now;
    role.updated_at = now;
    role.created_by = admin;
    role.status = 'active';
    sheet.appendRow(objectToRow(role, headers));
  }
  
  Logger.log('Seeded ' + roles.length + ' roles');
}

/**
 * Seed: Admin User
 */
function seedAdminUser(ss) {
  var sheet = ss.getSheetByName('DB_users');
  if (!sheet) return;
  if (sheet.getLastRow() > 1) return;
  
  var headers = ALL_SHEETS['users'].headers;
  var now = new Date().toISOString();
  
  var admin = {
    id: generateUUID(),
    email: 'admin@pp7.local',
    password_hash: simpleHash('admin123'),
    display_name: 'ผู้ดูแลระบบ PP7',
    employee_id: '',
    role: 'admin',
    business_unit_id: '',
    last_login: '',
    login_token: '',
    token_expiry: '',
    country: 'TH'
  };
  admin.created_at = now;
  admin.updated_at = now;
  admin.created_by = 'system';
  admin.status = 'active';
  
  sheet.appendRow(objectToRow(admin, headers));
  Logger.log('Seeded admin user: admin@pp7.local / admin123');
}

/**
 * Seed: Business Units (ตัวอย่าง)
 */
function seedBusinessUnits(ss) {
  var sheet = ss.getSheetByName('DB_business_units');
  if (!sheet) return;
  if (sheet.getLastRow() > 1) return;
  
  var headers = ALL_SHEETS['business_units'].headers;
  var now = new Date().toISOString();
  var admin = 'system@pp7.local';
  
  var bus = [
    { id: generateUUID(), bu_code: 'PKG-TH', bu_name_th: 'PKG ประเทศไทย', bu_name_en: 'PKG Thailand', sort_order: 1, color: '#1e40af', country: 'TH' },
    { id: generateUUID(), bu_code: 'PKG-LA', bu_name_th: 'PKG ลาว', bu_name_en: 'PKG Laos', sort_order: 2, color: '#7c3aed', country: 'LA' },
    { id: generateUUID(), bu_code: 'PKG-KH', bu_name_th: 'PKG กัมพูชา', bu_name_en: 'PKG Cambodia', sort_order: 3, color: '#dc2626', country: 'KH' }
  ];
  
  for (var i = 0; i < bus.length; i++) {
    var bu = bus[i];
    bu.bu_head_id = '';
    bu.parent_bu_id = '';
    bu.created_at = now;
    bu.updated_at = now;
    bu.created_by = admin;
    bu.status = 'active';
    sheet.appendRow(objectToRow(bu, headers));
  }
  
  Logger.log('Seeded ' + bus.length + ' business units');
}

/**
 * Seed: Departments (ตัวอย่าง)
 */
function seedDepartments(ss) {
  var sheet = ss.getSheetByName('DB_departments');
  if (!sheet) return;
  if (sheet.getLastRow() > 1) return;
  
  var headers = ALL_SHEETS['departments'].headers;
  var now = new Date().toISOString();
  var admin = 'system@pp7.local';
  
  // ดึง BU id
  var bus = sheetToObjects(ss.getSheetByName('DB_business_units'));
  var thBuId = bus.length > 0 ? bus[0].id : '';
  
  var depts = [
    { dept_code: 'HR', dept_name_th: 'ฝ่ายทรัพยากรบุคคล', dept_name_en: 'Human Resources', sort_order: 1 },
    { dept_code: 'FIN', dept_name_th: 'ฝ่ายการเงิน', dept_name_en: 'Finance', sort_order: 2 },
    { dept_code: 'OPS', dept_name_th: 'ฝ่ายปฏิบัติการ', dept_name_en: 'Operations', sort_order: 3 },
    { dept_code: 'IT', dept_name_th: 'ฝ่ายเทคโนโลยีสารสนเทศ', dept_name_en: 'Information Technology', sort_order: 4 },
    { dept_code: 'MKT', dept_name_th: 'ฝ่ายการตลาด', dept_name_en: 'Marketing', sort_order: 5 },
    { dept_code: 'SAL', dept_name_th: 'ฝ่ายขาย', dept_name_en: 'Sales', sort_order: 6 },
    { dept_code: 'ADM', dept_name_th: 'ฝ่ายบริหาร', dept_name_en: 'Administration', sort_order: 7 }
  ];
  
  for (var i = 0; i < depts.length; i++) {
    var dept = depts[i];
    dept.id = generateUUID();
    dept.business_unit_id = thBuId;
    dept.dept_head_id = '';
    dept.parent_dept_id = '';
    dept.country = 'TH';
    dept.created_at = now;
    dept.updated_at = now;
    dept.created_by = admin;
    dept.status = 'active';
    sheet.appendRow(objectToRow(dept, headers));
  }
  
  Logger.log('Seeded ' + depts.length + ' departments');
}

/**
 * Seed: Recruitment Sources
 */
function seedRecruitmentSources(ss) {
  var sheet = ss.getSheetByName('P1_recruitment_sources');
  if (!sheet) return;
  if (sheet.getLastRow() > 1) return;
  
  var headers = ALL_SHEETS['recruitment_sources'].headers;
  var now = new Date().toISOString();
  var admin = 'system@pp7.local';
  
  var sources = [
    { source_name: 'JobBKK', source_type: 'online', cost_per_hire: 5000, country: 'TH' },
    { source_name: 'LinkedIn', source_type: 'online', cost_per_hire: 8000, country: 'TH' },
    { source_name: 'JobThai', source_type: 'online', cost_per_hire: 3000, country: 'TH' },
    { source_name: 'แนะนำจากพนักงาน', source_type: 'referral', cost_per_hire: 2000, country: 'TH' },
    { source_name: 'Agency', source_type: 'agency', cost_per_hire: 15000, country: 'TH' },
    { source_name: 'Walk-in', source_type: 'offline', cost_per_hire: 1000, country: 'TH' },
    { source_name: 'Campus Recruitment', source_type: 'campus', cost_per_hire: 4000, country: 'TH' },
    { source_name: 'ภายในองค์กร', source_type: 'internal', cost_per_hire: 0, country: 'TH' }
  ];
  
  for (var i = 0; i < sources.length; i++) {
    var src = sources[i];
    src.id = generateUUID();
    src.total_applicants = 0;
    src.total_hired = 0;
    src.notes = '';
    src.created_at = now;
    src.updated_at = now;
    src.created_by = admin;
    src.status = 'active';
    sheet.appendRow(objectToRow(src, headers));
  }
  
  Logger.log('Seeded ' + sources.length + ' recruitment sources');
}

// ============================================================
// SETUP MENU (for Apps Script Editor)
// ============================================================

/**
 * ฟังก์ชันที่เรียกอัตโนมัติเมื่อเปิด Apps Script Editor
 */
function onOpen() {
  var ui = SpreadsheetApp.getUi();
  ui.createMenu('PP7 HRMS')
    .addItem('สร้าง Database ทั้งหมด', 'createAllTables')
    .addItem('ลบข้อมูลทั้งหมด (Factory Reset)', 'factoryReset')
    .addSeparator()
    .addItem('ดูข้อมูลระบบ', 'showSystemInfo')
    .addToUi();
}

/**
 * Factory Reset — ลบข้อมูลทั้งหมดใน sheets
 */
function factoryReset() {
  var ui = SpreadsheetApp.getUi();
  var response = ui.alert('ยืนยันการลบข้อมูล', 
    'การดำเนินการนี้จะลบข้อมูลทั้งหมดใน sheets ทุกแผ่น\n\nคุณแน่ใจหรือไม่?', 
    ui.ButtonSet.YES_NO);
  
  if (response !== ui.Button.YES) return;
  
  var ss = getSpreadsheet();
  var sheets = ss.getSheets();
  
  for (var i = 0; i < sheets.length; i++) {
    var sheet = sheets[i];
    var sheetName = sheet.getName();
    
    // ตรวจสอบว่าเป็น sheet ของ PP7 หรือเปล่า
    if (sheetName.indexOf('DB_') === 0 || sheetName.indexOf('P') === 0) {
      // เก็บ header row ไว้ (row 1)
      if (sheet.getLastRow() > 1) {
        sheet.deleteRows(2, sheet.getLastRow() - 1);
      }
    }
  }
  
  // Seed ใหม่
  seedInitialData(ss);
  
  ui.alert('สำเร็จ', 'ลบข้อมูลและสร้างข้อมูลเริ่มต้นใหม่แล้ว', ui.ButtonSet.OK);
}

/**
 * แสดงข้อมูลระบบ
 */
function showSystemInfo() {
  var ss = getSpreadsheet();
  var sheets = ss.getSheets();
  var info = '📊 PP7 HRMS System Info\n\n';
  info += 'Spreadsheet: ' + ss.getName() + '\n';
  info += 'ID: ' + ss.getId() + '\n';
  info += 'URL: ' + ss.getUrl() + '\n\n';
  info += '📋 Sheets (' + sheets.length + '):\n';
  
  for (var i = 0; i < sheets.length; i++) {
    var s = sheets[i];
    var rowCount = s.getLastRow() - 1; // ไม่รวม header
    info += '  • ' + s.getName() + ' (' + rowCount + ' records)\n';
  }
  
  SpreadsheetApp.getUi().alert(info);
}

// ============================================================
// EXPORT FUNCTIONS (for menu)
// ============================================================

/**
 * Export ข้อมูลทั้งหมดเป็น JSON
 */
function exportAllData() {
  var result = {};
  
  for (var tableName in ALL_SHEETS) {
    if (!ALL_SHEETS.hasOwnProperty(tableName)) continue;
    try {
      result[tableName] = dbRead(tableName);
    } catch (e) {
      result[tableName] = { error: e.message };
    }
  }
  
  Logger.log(JSON.stringify(result, null, 2));
  return result;
}
