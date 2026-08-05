/**
 * Google Apps Script Backend for Web PP7 - Application Form
 * 
 * @file gas-backend.js
 * @description Backend API สำหรับรับข้อมูลจากฟอร์มสมัครงาน
 * @version 1.0.0
 * @date 2026-08-05
 */

// Configuration
const CONFIG = {
  SPREADSHEET_ID: 'YOUR_SPREADSHEET_ID_HERE', // TODO: Replace with actual ID
  DRIVE_FOLDER_ID: 'YOUR_DRIVE_FOLDER_ID_HERE', // TODO: Replace with actual ID
  HR_EMAIL: 'hr@prachakij.com', // TODO: Replace with actual HR email
  COMPANY_NAME: 'บริษัท ประชากิจมอเตอร์เซลส์ จำกัด',
  APPLICANT_SHEET: 'Applicants',
  DOCUMENTS_SHEET: 'Documents',
  STATUS_LOG_SHEET: 'Status_Log'
};

/**
 * Main entry point for web app
 */
function doGet(e) {
  return handleRequest(e);
}

function doPost(e) {
  return handleRequest(e);
}

/**
 * Handle incoming requests
 */
function handleRequest(e) {
  const action = e.parameter.action;
  
  try {
    let result;
    
    switch(action) {
      case 'submitApplication':
        result = submitApplication(e);
        break;
      case 'uploadDocument':
        result = uploadDocument(e);
        break;
      case 'getApplicants':
        result = getApplicants(e);
        break;
      case 'getApplicant':
        result = getApplicant(e);
        break;
      case 'updateStatus':
        result = updateStatus(e);
        break;
      default:
        result = { success: false, error: 'Unknown action: ' + action };
    }
    
    return ContentService.createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Submit new application
 */
function submitApplication(e) {
  const data = JSON.parse(e.postData.contents);
  const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
  const sheet = ss.getSheetByName(CONFIG.APPLICANT_SHEET);
  
  // Generate applicant ID
  const applicantId = generateApplicantId();
  const timestamp = new Date();
  
  // Prepare row data
  const rowData = [
    applicantId,
    timestamp,
    'new', // status
    data.positionOpen,
    data.positionOther,
    data.salary,
    data.applicationChannel,
    data.source,
    
    // Personal Info (Thai)
    data.prefixTh,
    data.firstnameTh,
    data.lastnameTh,
    
    // Personal Info (English)
    data.prefixEn,
    data.firstnameEn,
    data.lastnameEn,
    
    data.nickname,
    data.gender,
    data.birthdate,
    data.age,
    data.weight,
    data.height,
    data.blood,
    data.ethnicity,
    data.nationality,
    data.education,
    data.major,
    
    // ID Card
    data.idCard,
    data.idCardPlace,
    data.idCardIssue,
    data.idCardExpire,
    
    // Registration Address
    data.regHouse,
    data.regSubdistrict,
    data.regDistrict,
    data.regProvince,
    data.regPostal,
    
    // Current Address
    data.curHouse,
    data.curSubdistrict,
    data.curDistrict,
    data.curProvince,
    data.curPostal,
    data.phone,
    data.facebook,
    data.line,
    data.military,
    
    // Family
    data.marital,
    data.children,
    data.familyInfo,
    data.father,
    data.mother,
    
    // Skills
    data.thaiSkill, // JSON string
    data.engSkill, // JSON string
    data.otherLang,
    data.specialSkill,
    data.hobby,
    data.driving,
    data.hasLicense,
    data.carLicense,
    data.motoLicense,
    
    // Work Experience
    data.workExp,
    data.reference,
    data.emergency,
    data.allowCheck,
    
    // General Info
    data.disease,
    data.surgery,
    data.fired,
    data.prevApply,
    data.socialSecurity,
    data.debt,
    data.debtDetail,
    data.familyDuty,
    data.familyDutyDetail,
    data.criminalSelf,
    data.criminalCompany,
    data.transport,
    data.referrer
  ];
  
  // Append to sheet
  sheet.appendRow(rowData);
  
  // Send notification email to HR
  sendNewApplicationEmail(applicantId, data);
  
  // Send confirmation email to applicant
  sendConfirmationEmail(data.email, data.firstnameTh, applicantId);
  
  return {
    success: true,
    applicantId: applicantId,
    message: 'Application submitted successfully'
  };
}

/**
 * Generate unique applicant ID
 */
function generateApplicantId() {
  const timestamp = new Date().getTime();
  const random = Math.floor(Math.random() * 1000);
  return 'APP-' + timestamp + '-' + random;
}

/**
 * Upload document (photo, degree, certificate)
 */
function uploadDocument(e) {
  const file = e.postData.contents;
  const filename = e.parameter.filename;
  const applicantId = e.parameter.applicantId;
  const documentType = e.parameter.documentType; // photo, degree, certificate
  
  // Decode base64 file
  const decoded = Utilities.base64Decode(file);
  const blob = Utilities.newBlob(decoded, e.parameter.mimeType, filename);
  
  // Create folder structure
  const folder = getOrCreateApplicantFolder(applicantId, documentType);
  
  // Upload file
  const fileUploaded = folder.createFile(blob);
  const fileUrl = fileUploaded.getUrl();
  
  // Save to Documents sheet
  const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
  const sheet = ss.getSheetByName(CONFIG.DOCUMENTS_SHEET);
  
  sheet.appendRow([
    applicantId,
    documentType,
    filename,
    fileUrl,
    new Date()
  ]);
  
  return {
    success: true,
    fileUrl: fileUrl,
    message: 'Document uploaded successfully'
  };
}

/**
 * Get or create folder for applicant documents
 */
function getOrCreateApplicantFolder(applicantId, documentType) {
  const parentFolder = DriveApp.getFolderById(CONFIG.DRIVE_FOLDER_ID);
  
  // Create applicant folder if not exists
  let applicantFolder;
  const folders = parentFolder.getFoldersByName(applicantId);
  
  if (folders.hasNext()) {
    applicantFolder = folders.next();
  } else {
    applicantFolder = parentFolder.createFolder(applicantId);
  }
  
  // Create document type folder if not exists
  let typeFolder;
  const typeFolders = applicantFolder.getFoldersByName(documentType);
  
  if (typeFolders.hasNext()) {
    typeFolder = typeFolders.next();
  } else {
    typeFolder = applicantFolder.createFolder(documentType);
  }
  
  return typeFolder;
}

/**
 * Get all applicants (for HR)
 */
function getApplicants(e) {
  const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
  const sheet = ss.getSheetByName(CONFIG.APPLICANT_SHEET);
  const data = sheet.getDataRange().getValues();
  
  const headers = data[0];
  const applicants = [];
  
  for (let i = 1; i < data.length; i++) {
    const applicant = {};
    for (let j = 0; j < headers.length; j++) {
      applicant[headers[j]] = data[i][j];
    }
    applicants.push(applicant);
  }
  
  return {
    success: true,
    applicants: applicants
  };
}

/**
 * Get single applicant details
 */
function getApplicant(e) {
  const applicantId = e.parameter.applicantId;
  const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
  const sheet = ss.getSheetByName(CONFIG.APPLICANT_SHEET);
  const data = sheet.getDataRange().getValues();
  
  const headers = data[0];
  const idIndex = headers.indexOf('applicant_id');
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][idIndex] === applicantId) {
      const applicant = {};
      for (let j = 0; j < headers.length; j++) {
        applicant[headers[j]] = data[i][j];
      }
      
      // Get documents
      const documents = getApplicantDocuments(applicantId);
      applicant.documents = documents;
      
      return {
        success: true,
        applicant: applicant
      };
    }
  }
  
  return {
    success: false,
    error: 'Applicant not found'
  };
}

/**
 * Get applicant documents
 */
function getApplicantDocuments(applicantId) {
  const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
  const sheet = ss.getSheetByName(CONFIG.DOCUMENTS_SHEET);
  const data = sheet.getDataRange().getValues();
  
  const headers = data[0];
  const documents = [];
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === applicantId) {
      const doc = {};
      for (let j = 0; j < headers.length; j++) {
        doc[headers[j]] = data[i][j];
      }
      documents.push(doc);
    }
  }
  
  return documents;
}

/**
 * Update applicant status
 */
function updateStatus(e) {
  const applicantId = e.parameter.applicantId;
  const newStatus = e.parameter.status;
  const changedBy = e.parameter.changedBy;
  const notes = e.parameter.notes;
  
  const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
  const sheet = ss.getSheetByName(CONFIG.APPLICANT_SHEET);
  const data = sheet.getDataRange().getValues();
  
  const headers = data[0];
  const idIndex = headers.indexOf('applicant_id');
  const statusIndex = headers.indexOf('status');
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][idIndex] === applicantId) {
      const oldStatus = data[i][statusIndex];
      
      // Update status
      sheet.getRange(i + 1, statusIndex + 1).setValue(newStatus);
      
      // Log status change
      logStatusChange(applicantId, oldStatus, newStatus, changedBy, notes);
      
      // Send email notification to applicant
      sendStatusUpdateEmail(applicantId, oldStatus, newStatus);
      
      return {
        success: true,
        message: 'Status updated successfully'
      };
    }
  }
  
  return {
    success: false,
    error: 'Applicant not found'
  };
}

/**
 * Log status change
 */
function logStatusChange(applicantId, oldStatus, newStatus, changedBy, notes) {
  const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
  const sheet = ss.getSheetByName(CONFIG.STATUS_LOG_SHEET);
  
  sheet.appendRow([
    applicantId,
    oldStatus,
    newStatus,
    changedBy,
    new Date(),
    notes
  ]);
}

/**
 * Send email notification to HR for new application
 */
function sendNewApplicationEmail(applicantId, data) {
  const subject = `🆕 มีผู้สมัครใหม่: ${data.firstnameTh} ${data.lastnameTh} - ${data.positionOpen}`;
  
  const body = `
    <h2>มีผู้สมัครงานใหม่</h2>
    <p><strong>Applicant ID:</strong> ${applicantId}</p>
    <p><strong>ชื่อ:</strong> ${data.prefixTh} ${data.firstnameTh} ${data.lastnameTh}</p>
    <p><strong>ตำแหน่ง:</strong> ${data.positionOpen}</p>
    <p><strong>อีเมล:</strong> ${data.email}</p>
    <p><strong>เบอร์โทร:</strong> ${data.phone}</p>
    <p><strong>วันที่สมัคร:</strong> ${new Date().toLocaleString('th-TH')}</p>
    <hr>
    <p><a href="https://pakonchotbuncha-netizen.github.io/web-pp7/hr-applicant-detail.html?id=${applicantId}">ดูรายละเอียดผู้สมัคร</a></p>
  `;
  
  MailApp.sendEmail({
    to: CONFIG.HR_EMAIL,
    subject: subject,
    htmlBody: body
  });
}

/**
 * Send confirmation email to applicant
 */
function sendConfirmationEmail(email, firstname, applicantId) {
  const subject = `รับใบสมัครงานแล้ว - ${CONFIG.COMPANY_NAME}`;
  
  const body = `
    <h2>ขอบคุณที่สมัครงานกับเรา</h2>
    <p>เรียน คุณ ${firstname}</p>
    <p>เราได้รับใบสมัครงานของคุณเรียบร้อยแล้ว</p>
    <p><strong>Applicant ID:</strong> ${applicantId}</p>
    <hr>
    <h3>ขั้นตอนต่อไป</h3>
    <ol>
      <li>HR จะตรวจสอบใบสมัครของคุณภายใน 3-5 วันทำการ</li>
      <li>หากคุณผ่านเกณฑ์เบื้องต้น เราจะติดต่อกลับเพื่อนัดสัมภาษณ์</li>
      <li>คุณสามารถตรวจสอบสถานะใบสมัครได้โดยติดต่อ HR</li>
    </ol>
    <hr>
    <p><strong>ติดต่อเรา:</strong></p>
    <p>อีเมล: ${CONFIG.HR_EMAIL}</p>
    <p>โทรศัพท์: 039-xxx-xxxx</p>
    <p>${CONFIG.COMPANY_NAME}</p>
  `;
  
  MailApp.sendEmail({
    to: email,
    subject: subject,
    htmlBody: body
  });
}

/**
 * Send status update email to applicant
 */
function sendStatusUpdateEmail(applicantId, oldStatus, newStatus) {
  // Get applicant details
  const applicant = getApplicant({ parameter: { applicantId: applicantId } }).applicant;
  
  const statusText = {
    'new': 'รับใบสมัครแล้ว',
    'reviewed': 'อยู่ระหว่างพิจารณา',
    'interviewed': 'นัดสัมภาษณ์',
    'hired': 'ได้รับการจ้าง',
    'rejected': 'ไม่ผ่านการคัดเลือก'
  };
  
  const subject = `อัพเดทสถานะใบสมัคร - ${CONFIG.COMPANY_NAME}`;
  
  const body = `
    <h2>อัพเดทสถานะใบสมัคร</h2>
    <p>เรียน คุณ ${applicant.firstname_th}</p>
    <p><strong>Applicant ID:</strong> ${applicantId}</p>
    <p><strong>สถานะเดิม:</strong> ${statusText[oldStatus]}</p>
    <p><strong>สถานะใหม่:</strong> ${statusText[newStatus]}</p>
    <hr>
    <p>หากคุณมีคำถาม กรุณาติดต่อ HR</p>
    <p>อีเมล: ${CONFIG.HR_EMAIL}</p>
  `;
  
  MailApp.sendEmail({
    to: applicant.email,
    subject: subject,
    htmlBody: body
  });
}

/**
 * Initialize Google Sheets (run once)
 */
function initializeSheets() {
  const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
  
  // Create Applicants sheet
  let sheet = ss.getSheetByName(CONFIG.APPLICANT_SHEET);
  if (!sheet) {
    sheet = ss.insertSheet(CONFIG.APPLICANT_SHEET);
    sheet.appendRow([
      'applicant_id', 'timestamp', 'status', 'position_open', 'position_other',
      'salary', 'application_channel', 'source',
      'prefix_th', 'firstname_th', 'lastname_th',
      'prefix_en', 'firstname_en', 'lastname_en',
      'nickname', 'gender', 'birthdate', 'age', 'weight', 'height',
      'blood', 'ethnicity', 'nationality', 'education', 'major',
      'id_card', 'id_card_place', 'id_card_issue', 'id_card_expire',
      'reg_house', 'reg_subdistrict', 'reg_district', 'reg_province', 'reg_postal',
      'cur_house', 'cur_subdistrict', 'cur_district', 'cur_province', 'cur_postal',
      'phone', 'facebook', 'line', 'military',
      'marital', 'children', 'family_info', 'father', 'mother',
      'thai_skill', 'eng_skill', 'other_lang', 'special_skill', 'hobby',
      'driving', 'has_license', 'car_license', 'moto_license',
      'work_exp', 'reference', 'emergency', 'allow_check',
      'disease', 'surgery', 'fired', 'prev_apply', 'social_security',
      'debt', 'debt_detail', 'family_duty', 'family_duty_detail',
      'criminal_self', 'criminal_company', 'transport', 'referrer'
    ]);
  }
  
  // Create Documents sheet
  sheet = ss.getSheetByName(CONFIG.DOCUMENTS_SHEET);
  if (!sheet) {
    sheet = ss.insertSheet(CONFIG.DOCUMENTS_SHEET);
    sheet.appendRow([
      'applicant_id', 'document_type', 'filename', 'file_url', 'uploaded_at'
    ]);
  }
  
  // Create Status_Log sheet
  sheet = ss.getSheetByName(CONFIG.STATUS_LOG_SHEET);
  if (!sheet) {
    sheet = ss.insertSheet(CONFIG.STATUS_LOG_SHEET);
    sheet.appendRow([
      'applicant_id', 'old_status', 'new_status', 'changed_by', 'changed_at', 'notes'
    ]);
  }
  
  return 'Sheets initialized successfully';
}

/**
 * Test function
 */
function testSubmitApplication() {
  const testData = {
    positionOpen: 'Software Developer',
    firstnameTh: 'ทดสอบ',
    lastnameTh: 'ระบบ',
    email: 'test@example.com',
    phone: '0812345678'
  };
  
  const e = {
    postData: {
      contents: JSON.stringify(testData)
    }
  };
  
  const result = submitApplication(e);
  Logger.log(result);
}
