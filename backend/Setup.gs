/**
 * Web PP7 Backend - Setup Script
 * Run this once to create the database structure
 * 
 * @author KiroClaw
 * @date 25 มิ.ย. 2569
 */

/**
 * Main setup function - Creates the database
 * Run this from Google Apps Script editor
 */
function setupDatabase() {
  // Create new spreadsheet for database
  const ss = SpreadsheetApp.create('Web PP7 Database');
  const ssId = ss.getId();
  
  Logger.log('Created spreadsheet: ' + ssId);
  Logger.log('URL: ' + ss.getUrl());
  
  // Remove default sheet
  const defaultSheet = ss.getSheetByName('Sheet1');
  
  // Create all required sheets
  createConfigSheet(ss);
  createUsersSheet(ss);
  createSessionsSheet(ss);
  createAuditLogSheet(ss);
  createMembersSheet(ss);
  createP1HeadcountSheet(ss);
  createP1RecruitmentSheet(ss);
  createP2AssessmentSheet(ss);
  createP3MatchingSheet(ss);
  createP4PerformanceSheet(ss);
  createP5DevelopmentSheet(ss);
  createP6CompensationSheet(ss);
  createP7WelfareSheet(ss);
  
  // Remove default sheet
  if (defaultSheet) {
    try { ss.deleteSheet(defaultSheet); } catch(e) {}
  }
  
  // Set default config values
  setDefaultConfig(ss);
  
  // Create admin user
  createDefaultAdmin(ss);
  
  Logger.log('=== SETUP COMPLETE ===');
  Logger.log('Spreadsheet ID: ' + ssId);
  Logger.log('Update CONFIG.SPREADSHEET_ID in Code.gs with this ID');
  Logger.log('Deploy the script as a web app');
  
  return ssId;
}

function createConfigSheet(ss) {
  const sheet = ss.insertSheet('Config');
  const headers = HEADERS['Config'];
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  formatHeader(sheet, headers.length);
  Logger.log('Created Config sheet');
}

function createUsersSheet(ss) {
  const sheet = ss.insertSheet('Users');
  const headers = HEADERS['Users'];
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  formatHeader(sheet, headers.length);
  Logger.log('Created Users sheet');
}

function createSessionsSheet(ss) {
  const sheet = ss.insertSheet('Sessions');
  const headers = HEADERS['Sessions'];
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  formatHeader(sheet, headers.length);
  Logger.log('Created Sessions sheet');
}

function createAuditLogSheet(ss) {
  const sheet = ss.insertSheet('AuditLog');
  const headers = HEADERS['AuditLog'];
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  formatHeader(sheet, headers.length);
  Logger.log('Created AuditLog sheet');
}

function createMembersSheet(ss) {
  const sheet = ss.insertSheet('Members');
  const headers = HEADERS['Members'];
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  formatHeader(sheet, headers.length);
  
  // Set column widths for readability
  sheet.setColumnWidth(1, 130);  // member_id
  sheet.setColumnWidth(4, 120);  // first_name
  sheet.setColumnWidth(5, 120);  // last_name
  sheet.setColumnWidth(6, 200);  // email
  sheet.setColumnWidth(13, 120); // department
  sheet.setColumnWidth(14, 120); // position
  
  Logger.log('Created Members sheet');
}

function createP1HeadcountSheet(ss) {
  const sheet = ss.insertSheet('P1_Headcount');
  const headers = HEADERS['P1_Headcount'];
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  formatHeader(sheet, headers.length);
  Logger.log('Created P1_Headcount sheet');
}

function createP1RecruitmentSheet(ss) {
  const sheet = ss.insertSheet('P1_Recruitment');
  const headers = HEADERS['P1_Recruitment'];
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  formatHeader(sheet, headers.length);
  Logger.log('Created P1_Recruitment sheet');
}

function createP2AssessmentSheet(ss) {
  const sheet = ss.insertSheet('P2_Assessment');
  const headers = HEADERS['P2_Assessment'];
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  formatHeader(sheet, headers.length);
  Logger.log('Created P2_Assessment sheet');
}

function createP3MatchingSheet(ss) {
  const sheet = ss.insertSheet('P3_Matching');
  const headers = HEADERS['P3_Matching'];
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  formatHeader(sheet, headers.length);
  Logger.log('Created P3_Matching sheet');
}

function createP4PerformanceSheet(ss) {
  const sheet = ss.insertSheet('P4_Performance');
  const headers = HEADERS['P4_Performance'];
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  formatHeader(sheet, headers.length);
  Logger.log('Created P4_Performance sheet');
}

function createP5DevelopmentSheet(ss) {
  const sheet = ss.insertSheet('P5_Development');
  const headers = HEADERS['P5_Development'];
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  formatHeader(sheet, headers.length);
  Logger.log('Created P5_Development sheet');
}

function createP6CompensationSheet(ss) {
  const sheet = ss.insertSheet('P6_Compensation');
  const headers = HEADERS['P6_Compensation'];
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  formatHeader(sheet, headers.length);
  Logger.log('Created P6_Compensation sheet');
}

function createP7WelfareSheet(ss) {
  const sheet = ss.insertSheet('P7_Welfare');
  const headers = HEADERS['P7_Welfare'];
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  formatHeader(sheet, headers.length);
  Logger.log('Created P7_Welfare sheet');
}

function setDefaultConfig(ss) {
  const sheet = ss.getSheetByName('Config');
  const now = new Date().toISOString();
  
  const configData = [
    ['app_name', 'Web PP7 - ระบบบริหารบุคลากร', 'string', 'system', now],
    ['app_version', '2.0.0', 'string', 'system', now],
    ['session_expiry_hours', '8', 'number', 'system', now],
    ['auto_register', 'true', 'boolean', 'system', now],
    ['default_role', 'member', 'string', 'system', now],
    ['max_upload_size_mb', '10', 'number', 'system', now],
    ['notification_line_enabled', 'false', 'boolean', 'system', now],
    ['notification_telegram_enabled', 'false', 'boolean', 'system', now],
    ['line_channel_token', '', 'string', 'system', now],
    ['telegram_bot_token', '', 'string', 'system', now],
    ['telegram_chat_id', '', 'string', 'system', now],
    ['countries', 'TH,LA,KH', 'string', 'system', now],
    ['currency_default', 'THB', 'string', 'system', now],
    ['fiscal_year_start', '01', 'string', 'system', now],
    ['created_at', now, 'string', 'system', now]
  ];
  
  if (configData.length > 0) {
    sheet.getRange(2, 1, configData.length, configData[0].length).setValues(configData);
  }
  
  Logger.log('Set default config values');
}

function createDefaultAdmin(ss) {
  const sheet = ss.getSheetByName('Users');
  const now = new Date().toISOString();
  const userId = Utilities.getUuid();
  
  const adminData = [
    [userId, 'admin@pp7.local', 'Admin PP7', 'admin', 'HR', 'System Administrator', 'active', now, now]
  ];
  
  sheet.getRange(2, 1, 1, adminData[0].length).setValues(adminData);
  
  Logger.log('Created default admin user: admin@pp7.local');
  Logger.log('Admin user_id: ' + userId);
}

function formatHeader(sheet, colCount) {
  const headerRange = sheet.getRange(1, 1, 1, colCount);
  headerRange.setFontWeight('bold');
  headerRange.setBackground('#4a86e8');
  headerRange.setFontColor('#ffffff');
  headerRange.setHorizontalAlignment('center');
  sheet.setFrozenRows(1);
}

/**
 * Utility: Reset database (DANGER - deletes all data)
 */
function resetDatabase() {
  if (!CONFIG.SPREADSHEET_ID) {
    Logger.log('ERROR: SPREADSHEET_ID not set');
    return;
  }
  
  const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
  const sheets = ss.getSheets();
  
  // Clear data from all sheets (keep headers)
  for (const sheet of sheets) {
    const lastRow = sheet.getLastRow();
    if (lastRow > 1) {
      sheet.deleteRows(2, lastRow - 1);
    }
    Logger.log('Cleared: ' + sheet.getName());
  }
  
  // Re-set default config and admin
  setDefaultConfig(ss);
  createDefaultAdmin(ss);
  
  Logger.log('=== DATABASE RESET COMPLETE ===');
}

/**
 * Utility: Verify database structure
 */
function verifyDatabase() {
  if (!CONFIG.SPREADSHEET_ID) {
    Logger.log('ERROR: SPREADSHEET_ID not set');
    return;
  }
  
  const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
  const expectedSheets = Object.keys(HEADERS);
  let allOk = true;
  
  for (const sheetName of expectedSheets) {
    const sheet = ss.getSheetByName(sheetName);
    if (!sheet) {
      Logger.log('❌ Missing sheet: ' + sheetName);
      allOk = false;
      continue;
    }
    
    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    const expectedHeaders = HEADERS[sheetName];
    
    const missing = expectedHeaders.filter(h => !headers.includes(h));
    const extra = headers.filter(h => h && !expectedHeaders.includes(h));
    
    if (missing.length > 0 || extra.length > 0) {
      Logger.log('⚠️ ' + sheetName + ':');
      if (missing.length > 0) Logger.log('   Missing: ' + missing.join(', '));
      if (extra.length > 0) Logger.log('   Extra: ' + extra.join(', '));
      allOk = false;
    } else {
      Logger.log('✅ ' + sheetName + ' (OK)');
    }
  }
  
  if (allOk) {
    Logger.log('\n✅ ALL SHEETS VERIFIED SUCCESSFULLY');
  } else {
    Logger.log('\n⚠️ SOME ISSUES FOUND');
  }
}
