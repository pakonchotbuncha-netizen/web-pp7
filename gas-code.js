/**
 * Web PP7 - Backend API (Phase 1: Simple Version)
 * Google Apps Script สำหรับรับข้อมูลจากฟอร์มสมัครงาน
 * 
 * วิธีใช้:
 * 1. สร้าง Google Sheets ใหม่
 * 2. เปิด Extensions > Apps Script
 * 3. Copy โค้ดนี้ไปวาง
 * 4. Deploy > New deployment > Web app
 * 5. Copy URL ไปใส่ใน form-register.html (บรรทัด GAS_URL)
 * 
 * @version 1.0.0
 * @date 2026-08-05
 */

const SPREADSHEET_ID = '1FfpF4hT7vV-ZIyeHVb31MUJh_3kXMX52x0sYJGUr6kU'; // เปลี่ยนเป็น ID ของ Google Sheets
const SHEET_NAME = 'Applicants';
const LOG_SHEET_NAME = 'Logs';

/**
 * Handle GET requests
 */
function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({
    status: 'ok',
    message: 'Web PP7 Backend API is running',
    timestamp: new Date().toISOString()
  })).setMimeType(ContentService.MimeType.JSON);
}

/**
 * Handle POST requests
 */
function doPost(e) {
  try {
    const action = e.parameter.action;
    const data = JSON.parse(e.postData.contents);
    
    let result;
    
    switch(action) {
      case 'submitApplication':
        result = submitApplication(data);
        break;
      default:
        result = {
          success: false,
          error: 'Unknown action: ' + action
        };
    }
    
    return ContentService.createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    logError('doPost', error);
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Submit new application
 */
function submitApplication(data) {
  // ใบสมัครขอฝึกงาน → ชีท Trainees (แยกจาก Applicants)
  if (data.applicationType === 'trainee') {
    return submitTraineeApplication(data);
  }
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    let sheet = ss.getSheetByName(SHEET_NAME);
    
    // Create sheet if not exists
    if (!sheet) {
      sheet = ss.insertSheet(SHEET_NAME);
      initializeSheet(sheet);
    }
    
    // Generate applicant ID
    const applicantId = generateApplicantId();
    const timestamp = new Date();
    
    // Prepare row data (must match sheet columns)
    const rowData = [
      applicantId,
      timestamp,
      'new', // status
      
      // Section 1: Position
      data.positionOpen || '',
      data.positionOther || '',
      data.salary || '',
      data.applicationChannel || '',
      data.source || '',
      
      // Section 2: Personal Info (Thai)
      data.prefixTh || '',
      data.firstnameTh || '',
      data.lastnameTh || '',
      
      // Personal Info (English)
      data.prefixEn || '',
      data.firstnameEn || '',
      data.lastnameEn || '',
      
      data.nickname || '',
      data.gender || '',
      data.birthdate || '',
      data.age || '',
      data.weight || '',
      data.height || '',
      data.blood || '',
      data.ethnicity || '',
      data.nationality || '',
      data.education || '',
      data.major || '',
      
      // ID Card
      data.idCard || '',
      data.idCardPlace || '',
      data.idCardIssue || '',
      data.idCardExpire || '',
      
      // Section 3: Registration Address
      data.regHouse || '',
      data.regSubdistrict || '',
      data.regDistrict || '',
      data.regProvince || '',
      data.regPostal || '',
      
      // Section 4: Current Address
      data.curHouse || '',
      data.curSubdistrict || '',
      data.curDistrict || '',
      data.curProvince || '',
      data.curPostal || '',
      data.phone || '',
      data.facebook || '',
      data.line || '',
      data.military || '',
      
      // Section 5: Family
      data.marital || '',
      data.children || '',
      data.familyInfo || '',
      data.father || '',
      data.mother || '',
      
      // Section 6: Skills
      data.thaiSkill || '',
      data.engSkill || '',
      data.otherLang || '',
      data.specialSkill || '',
      data.hobby || '',
      data.driving || '',
      data.hasLicense || '',
      data.carLicense || '',
      data.motoLicense || '',
      
      // Section 7: Work Experience
      data.workExp || '',
      data.reference || '',
      data.emergency || '',
      data.allowCheck || '',
      
      // Section 8: General Info
      data.disease || '',
      data.surgery || '',
      data.fired || '',
      data.prevApply || '',
      data.socialSecurity || '',
      data.debt || '',
      data.debtDetail || '',
      data.familyDuty || '',
      data.familyDutyDetail || '',
      data.criminalSelf || '',
      data.criminalCompany || '',
      data.transport || '',
      data.referrer || ''
    ];
    
    // Append to sheet
    sheet.appendRow(rowData);
    
    // Log submission
    logAction('submitApplication', applicantId, 'New application submitted');
    
    return {
      success: true,
      applicantId: applicantId,
      message: 'Application submitted successfully'
    };
    
  } catch (error) {
    logError('submitApplication', error);
    return {
      success: false,
      error: error.toString()
    };
  }
}

/**
 * Generate unique applicant ID
 */
/**
 * Submit trainee (internship) application → sheet 'Trainees'
 * พอร์ตจากฟอร์มเดิม formTraniee.php (23 ฟิลด์) เข้าระบบ Web PP7
 */
const TRAINEE_SHEET_NAME = 'Trainees';

function submitTraineeApplication(data) {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    let sheet = ss.getSheetByName(TRAINEE_SHEET_NAME);

    // Create sheet if not exists
    if (!sheet) {
      sheet = ss.insertSheet(TRAINEE_SHEET_NAME);
      initializeTraineeSheet(sheet);
    }

    const applicantId = generateApplicantId();
    const timestamp = new Date();

    const rowData = [
      applicantId,
      timestamp,
      'new', // status

      // ข้อมูลส่วนตัวของนักศึกษา
      data.prefixTh || '',
      data.firstnameTh || '',
      data.lastnameTh || '',
      data.prefixEn || '',
      data.firstnameEn || '',
      data.lastnameEn || '',
      data.nickname || '',
      data.age || '',
      data.gender || '',
      data.idCard || '',
      data.currentAddress || '',
      data.phone || '',
      data.facebook || '',
      data.line || '',

      // ข้อมูลการศึกษาและการฝึกงาน
      data.apprenticeType || '',
      data.education || '',
      data.school || '',
      data.major || '',
      data.grade || '',
      data.startDate || '',
      data.stopDate || '',
      data.specialSkill || '',
      data.computerSkill || '',

      // อาจารย์ที่ปรึกษาและผู้ปกครอง
      data.advisorName || '',
      data.advisorPhone || '',
      data.parentName || '',
      data.parentPhone || '',

      // Consent (PDPA)
      data.consentGiven === true ? 'yes' : 'no'
    ];

    sheet.appendRow(rowData);
    logAction('submitTraineeApplication', applicantId, 'New trainee application submitted');

    return {
      success: true,
      applicantId: applicantId,
      message: 'Trainee application submitted successfully'
    };
  } catch (error) {
    logError('submitTraineeApplication', error);
    return {
      success: false,
      error: error.toString()
    };
  }
}

/**
 * Initialize trainee sheet with headers
 */
function initializeTraineeSheet(sheet) {
  const headers = [
    'Trainee ID',
    'Timestamp',
    'Status',

    // ข้อมูลส่วนตัวของนักศึกษา
    'Prefix (TH)',
    'First Name (TH)',
    'Last Name (TH)',
    'Prefix (EN)',
    'First Name (EN)',
    'Last Name (EN)',
    'Nickname',
    'Age',
    'Gender',
    'ID Card',
    'Current Address',
    'Phone',
    'Facebook',
    'Line ID',

    // ข้อมูลการศึกษาและการฝึกงาน
    'Internship Type',
    'Education Level',
    'School',
    'Major',
    'GPA',
    'Start Date',
    'End Date',
    'Special Talents',
    'Computer Skills',

    // อาจารย์ที่ปรึกษาและผู้ปกครอง
    'Advisor Name',
    'Advisor Phone',
    'Parent Name',
    'Parent Phone',

    // Consent (PDPA)
    'PDPA Consent'
  ];

  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
  sheet.getRange(1, 1, 1, headers.length).setBackground('#0d9488');
  sheet.getRange(1, 1, 1, headers.length).setFontColor('#ffffff');
  sheet.setFrozenRows(1);
}

function generateApplicantId() {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000);
  return `APP-${timestamp}-${random}`;
}

/**
 * Initialize sheet with headers
 */
function initializeSheet(sheet) {
  const headers = [
    'Applicant ID',
    'Timestamp',
    'Status',
    
    // Section 1: Position
    'Position Open',
    'Position Other',
    'Expected Salary',
    'Application Channel',
    'Source',
    
    // Section 2: Personal Info (Thai)
    'Prefix (TH)',
    'First Name (TH)',
    'Last Name (TH)',
    
    // Personal Info (English)
    'Prefix (EN)',
    'First Name (EN)',
    'Last Name (EN)',
    
    'Nickname',
    'Gender',
    'Birthdate',
    'Age',
    'Weight',
    'Height',
    'Blood Group',
    'Ethnicity',
    'Nationality',
    'Education',
    'Major',
    
    // ID Card
    'ID Card',
    'ID Card Place',
    'ID Card Issue Date',
    'ID Card Expire Date',
    
    // Section 3: Registration Address
    'Reg House No',
    'Reg Subdistrict',
    'Reg District',
    'Reg Province',
    'Reg Postal Code',
    
    // Section 4: Current Address
    'Cur House No',
    'Cur Subdistrict',
    'Cur District',
    'Cur Province',
    'Cur Postal Code',
    'Phone',
    'Facebook',
    'Line ID',
    'Military Status',
    
    // Section 5: Family
    'Marital Status',
    'Children',
    'Family Info',
    'Father Name',
    'Mother Name',
    
    // Section 6: Skills
    'Thai Skills',
    'English Skills',
    'Other Languages',
    'Special Skills',
    'Hobbies',
    'Driving Ability',
    'Has License',
    'Car License No',
    'Moto License No',
    
    // Section 7: Work Experience
    'Work Experience',
    'Reference',
    'Emergency Contact',
    'Allow Check',
    
    // Section 8: General Info
    'Disease',
    'Surgery',
    'Fired',
    'Previous Apply',
    'Social Security',
    'Debt',
    'Debt Detail',
    'Family Duty',
    'Family Duty Detail',
    'Criminal Check Self',
    'Criminal Check Company',
    'Transport',
    'Referrer'
  ];
  
  sheet.appendRow(headers);
  
  // Format header row
  const headerRange = sheet.getRange(1, 1, 1, headers.length);
  headerRange.setBackground('#4a86e8');
  headerRange.setFontColor('#ffffff');
  headerRange.setFontWeight('bold');
  
  // Freeze header row
  sheet.setFrozenRows(1);
  
  // Auto-resize columns
  for (let i = 1; i <= headers.length; i++) {
    sheet.autoResizeColumn(i);
  }
}

/**
 * Log action to log sheet
 */
function logAction(action, applicantId, message) {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    let logSheet = ss.getSheetByName(LOG_SHEET_NAME);
    
    if (!logSheet) {
      logSheet = ss.insertSheet(LOG_SHEET_NAME);
      logSheet.appendRow(['Timestamp', 'Action', 'Applicant ID', 'Message']);
      
      const headerRange = logSheet.getRange(1, 1, 1, 4);
      headerRange.setBackground('#4a86e8');
      headerRange.setFontColor('#ffffff');
      headerRange.setFontWeight('bold');
      logSheet.setFrozenRows(1);
    }
    
    logSheet.appendRow([new Date(), action, applicantId, message]);
  } catch (error) {
    console.error('Log error:', error);
  }
}

/**
 * Log error
 */
function logError(functionName, error) {
  console.error(`Error in ${functionName}:`, error);
  logAction('ERROR', '', `${functionName}: ${error.toString()}`);
}
