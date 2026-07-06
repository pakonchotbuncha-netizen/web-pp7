/**
 * Web PP7 - Data Migration System
 * ระบบย้ายข้อมูลระหว่าง Google Sheets
 */

// ============================================
// SCHEMA DEFINITIONS - ตรงกับ Code.gs และโครงสร้างฐานข้อมูล
// ============================================

const MIGRATION_SCHEMAS = {
  // P1 - แสวงหาผู้สมัครงาน
  'P1-แสวงหา': {
    requiredFields: ['id', 'candidate_name', 'position', 'department', 'email', 'status'],
    optionalFields: ['phone', 'applied_date', 'source', 'resume_url', 'pdpa_consent', 'notes'],
    validation: {
      'id': { type: 'string', pattern: /^[A-Za-z0-9-]+$/, required: true },
      'candidate_name': { type: 'string', minLength: 2, required: true },
      'position': { type: 'string', required: true },
      'department': { type: 'string', required: true },
      'email': { type: 'email', required: true },
      'status': { 
        type: 'enum', 
        values: ['New', 'Screening', 'Passed_to_P2', 'Rejected'],
        required: true 
      },
      'pdpa_consent': { type: 'boolean', required: true }
    }
  },
  
  // P2 - หยั่งประเมิน
  'P2-ประเมิน': {
    requiredFields: ['candidate_id', 'evaluation_date', 'evaluator', 'score', 'result'],
    optionalFields: ['criteria', 'comments', 'evidence_links'],
    validation: {
      'candidate_id': { type: 'string', required: true },
      'evaluation_date': { type: 'date', required: true },
      'evaluator': { type: 'string', required: true },
      'score': { type: 'number', min: 0, max: 5, required: true },
      'result': { 
        type: 'enum',
        values: ['ผ่าน', 'ไม่ผ่าน', 'รออนุมัติ'],
        required: true
      }
    }
  },
  
  // P3 - จับคู่คนกับงาน
  'P3-จับคู่': {
    requiredFields: ['candidate_id', 'position_id', 'match_score', 'match_date'],
    optionalFields: ['ai_analysis', 'recommendations', 'priority'],
    validation: {
      'candidate_id': { type: 'string', required: true },
      'position_id': { type: 'string', required: true },
      'match_score': { type: 'number', min: 0, max: 100, required: true },
      'match_date': { type: 'date', required: true }
    }
  },
  
  // P4 - ประเมินผล
  'P4-ประเมินผล': {
    requiredFields: ['employee_id', 'evaluation_period', 'evaluator', 'kpi_score', 'evidence_links'],
    optionalFields: ['competency_scores', 'feedback', 'goals', 'development_needs'],
    validation: {
      'employee_id': { type: 'string', required: true },
      'evaluation_period': { type: 'string', pattern: /^Q[1-4]\/\d{2,4}$/, required: true },
      'evaluator': { type: 'string', required: true },
      'kpi_score': { type: 'number', min: 0, max: 5, required: true },
      'evidence_links': { type: 'json_array', required: true }
    }
  },
  
  // P5 - พัฒนา
  'P5-พัฒนา': {
    requiredFields: ['employee_id', 'plan_start', 'plan_end', 'goals', 'status'],
    optionalFields: ['training_activities', 'mentor', 'resources', 'progress'],
    validation: {
      'employee_id': { type: 'string', required: true },
      'plan_start': { type: 'date', required: true },
      'plan_end': { type: 'date', required: true },
      'goals': { type: 'json_array', required: true },
      'status': { 
        type: 'enum',
        values: ['วางแผน', 'กำลังดำเนินการ', 'เสร็จสิ้น', 'ยกเลิก'],
        required: true
      }
    }
  },
  
  // P6 - ค่าตอบแทน
  'P6-ค่าตอบแทน': {
    requiredFields: ['employee_id', 'salary', 'allowances', 'payment_date'],
    optionalFields: ['bonus', 'overtime', 'deductions', 'benefits'],
    validation: {
      'employee_id': { type: 'string', required: true },
      'salary': { type: 'number', min: 0, required: true },
      'allowances': { type: 'number', min: 0, required: true },
      'payment_date': { type: 'date', required: true }
    }
  },
  
  // P7 - คุณภาพชีวิต
  'P7-คุณภาพชีวิต': {
    requiredFields: ['employee_id', 'survey_date', 'engagement_score', 'satisfaction_areas'],
    optionalFields: ['comments', 'improvement_suggestions', 'work_life_balance'],
    validation: {
      'employee_id': { type: 'string', required: true },
      'survey_date': { type: 'date', required: true },
      'engagement_score': { type: 'number', min: 0, max: 5, required: true },
      'satisfaction_areas': { type: 'json_array', required: true }
    }
  }
};

// ============================================
// MAIN MIGRATION FUNCTION
// ============================================

/**
 * ย้ายข้อมูลจาก Sheet หนึ่งไปยังอีก Sheet หนึ่ง
 * @param {string} sourceSheetId - ID ของ Google Sheet ต้นทาง
 * @param {string} destSheetId - ID ของ Google Sheet ปลายทาง
 * @param {string} processType - ประเภทกระบวนการ (P1, P2, P3, P4, P5, P6, P7)
 * @param {object} options - ตัวเลือกเพิ่มเติม
 */
function migrateData(sourceSheetId, destSheetId, processType, options = {}) {
  const txId = generateTransactionId();
  const log = [];
  
  try {
    log.push(`[${txId}] เริ่ม migration: ${processType}`);
    log.push(`ต้นทาง: ${sourceSheetId}`);
    log.push(`ปลายทาง: ${destSheetId}`);
    
    // เปิด Sheet ต้นทางและปลายทาง
    const sourceSS = SpreadsheetApp.openById(sourceSheetId);
    const destSS = SpreadsheetApp.openById(destSheetId);
    
    // หา sheet ที่ตรงกับ processType
    const sourceSheet = findSheetByProcess(sourceSS, processType);
    if (!sourceSheet) {
      throw new Error(`ไม่พบ sheet สำหรับ ${processType} ในต้นทาง`);
    }
    
    const destSheetName = sourceSheet.getName();
    let destSheet = destSS.getSheetByName(destSheetName);
    
    // ถ้ายังไม่มี sheet ในปลายทาง ให้สร้างใหม่
    if (!destSheet) {
      destSheet = destSS.insertSheet(destSheetName);
      log.push(`สร้าง sheet ใหม่: ${destSheetName}`);
    }
    
    // อ่านข้อมูลจากต้นทาง
    const sourceData = sourceSheet.getDataRange().getValues();
    if (sourceData.length <= 1) {
      log.push(`ไม่มีข้อมูลใน ${processType}`);
      return createMigrationResult(txId, 'success', 0, 0, 0, log);
    }
    
    const headers = sourceData[0];
    const rows = sourceData.slice(1);
    
    log.push(`พบข้อมูล ${rows.length} รายการ`);
    
    // Validate และ import ทีละ row
    let successCount = 0;
    let failCount = 0;
    let skipCount = 0;
    const failedRows = [];
    
    for (let i = 0; i < rows.length; i++) {
      const rowData = rowArrayToObject(headers, rows[i]);
      const rowNum = i + 2; // +2 เพราะเริ่มจาก row 2 (หลัง header)
      
      try {
        // Validate row
        const validation = validateRow(rowData, processType);
        
        if (!validation.valid) {
          log.push(`Row ${rowNum}: ไม่ผ่าน validation - ${validation.errors.join(', ')}`);
          failedRows.push({ row: rowNum, data: rowData, errors: validation.errors });
          failCount++;
          continue;
        }
        
        // ตรวจ duplicate
        if (options.checkDuplicates !== false) {
          const isDuplicate = checkDuplicate(rowData, destSheet, processType);
          if (isDuplicate) {
            log.push(`Row ${rowNum}: ข้ามเพราะเป็น duplicate`);
            skipCount++;
            continue;
          }
        }
        
        // Import row
        importRow(rowData, destSheet);
        successCount++;
        
        if (successCount % 50 === 0) {
          log.push(`Import แล้ว ${successCount} รายการ...`);
        }
        
      } catch (err) {
        log.push(`Row ${rowNum}: ผิดพลาด - ${err.message}`);
        failedRows.push({ row: rowNum, data: rowData, error: err.message });
        failCount++;
      }
    }
    
    log.push(`Migration เสร็จสิ้น: สำเร็จ ${successCount}, ผิดพลาด ${failCount}, ข้าม ${skipCount}`);
    
    return createMigrationResult(txId, 'success', successCount, failCount, skipCount, log, failedRows);
    
  } catch (err) {
    log.push(`MIGRATION FAILED: ${err.message}`);
    
    // Rollback ถ้ามี error ร้ายแรง
    try {
      rollbackMigration(txId, destSheetId);
      log.push('ROLLBACK สำเร็จ');
    } catch (rollbackErr) {
      log.push(`ROLLBACK FAILED: ${rollbackErr.message}`);
    }
    
    return createMigrationResult(txId, 'failed', 0, 0, 0, log);
  }
}

// ============================================
// VALIDATION FUNCTIONS
// ============================================

/**
 * ตรวจสอบความถูกต้องของข้อมูล
 * @param {object} row - ข้อมูลที่ต้องการตรวจสอบ
 * @param {string} processType - ประเภทกระบวนการ
 * @returns {object} ผลการตรวจสอบ
 */
function validateRow(row, processType) {
  const schema = MIGRATION_SCHEMAS[processType + '-' + getProcessName(processType)];
  
  if (!schema) {
    return { valid: false, errors: [`ไม่พบ schema สำหรับ ${processType}`] };
  }
  
  const errors = [];
  
  // ตรวจสอบ required fields
  schema.requiredFields.forEach(field => {
    if (!row[field] && row[field] !== 0 && row[field] !== false) {
      errors.push(`ขาดฟิลด์บังคับ: ${field}`);
    }
  });
  
  // ตรวจสอบ validation rules
  Object.keys(schema.validation).forEach(field => {
    const rule = schema.validation[field];
    const value = row[field];
    
    if (value === undefined || value === null || value === '') {
      if (rule.required) {
        errors.push(`${field} เป็นฟิลด์บังคับ`);
      }
      return;
    }
    
    // ตรวจสอบ type
    switch (rule.type) {
      case 'string':
        if (typeof value !== 'string') {
          errors.push(`${field} ต้องเป็น string`);
        } else {
          if (rule.pattern && !rule.pattern.test(value)) {
            errors.push(`${field} ไม่ถูกต้องตามรูปแบบ`);
          }
          if (rule.minLength && value.length < rule.minLength) {
            errors.push(`${field} สั้นเกินไป (ขั้นต่ำ ${rule.minLength} ตัวอักษร)`);
          }
        }
        break;
        
      case 'number':
        const num = Number(value);
        if (isNaN(num)) {
          errors.push(`${field} ต้องเป็นตัวเลข`);
        } else {
          if (rule.min !== undefined && num < rule.min) {
            errors.push(`${field} น้อยเกินไป (ขั้นต่ำ ${rule.min})`);
          }
          if (rule.max !== undefined && num > rule.max) {
            errors.push(`${field} มากเกินไป (สูงสุด ${rule.max})`);
          }
        }
        break;
        
      case 'email':
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(value)) {
          errors.push(`${field} ไม่ถูกต้องตามรูปแบบอีเมล`);
        }
        break;
        
      case 'date':
        const date = new Date(value);
        if (isNaN(date.getTime())) {
          errors.push(`${field} ไม่ถูกต้องตามรูปแบบวันที่`);
        }
        break;
        
      case 'boolean':
        if (typeof value !== 'boolean' && value !== 'TRUE' && value !== 'FALSE' && value !== 0 && value !== 1) {
          errors.push(`${field} ต้องเป็น boolean`);
        }
        break;
        
      case 'enum':
        if (!rule.values.includes(value)) {
          errors.push(`${field} ต้องเป็นค่าใดค่าหนึ่งใน: ${rule.values.join(', ')}`);
        }
        break;
        
      case 'json_array':
        if (typeof value === 'string') {
          try {
            const parsed = JSON.parse(value);
            if (!Array.isArray(parsed)) {
              errors.push(`${field} ต้องเป็น JSON array`);
            }
          } catch (e) {
            errors.push(`${field} ต้องเป็น JSON array ที่ถูกต้อง`);
          }
        } else if (!Array.isArray(value)) {
          errors.push(`${field} ต้องเป็น JSON array`);
        }
        break;
    }
  });
  
  return {
    valid: errors.length === 0,
    errors: errors
  };
}

/**
 * ตรวจสอบว่าข้อมูลซ้ำกับที่已有在ปลายทางหรือไม่
 */
function checkDuplicate(row, destSheet, processType) {
  const destData = destSheet.getDataRange().getValues();
  if (destData.length <= 1) return false;
  
  const destHeaders = destData[0];
  const destRows = destData.slice(1);
  
  // หา unique key สำหรับ processType นี้
  const uniqueKey = getUniqueKey(processType);
  const keyValue = row[uniqueKey];
  
  if (!keyValue) return false;
  
  const keyIndex = destHeaders.indexOf(uniqueKey);
  if (keyIndex === -1) return false;
  
  // ตรวจว่า已有ค่านี้ในปลายทางหรือไม่
  for (let i = 0; i < destRows.length; i++) {
    if (String(destRows[i][keyIndex]) === String(keyValue)) {
      return true;
    }
  }
  
  return false;
}

// ============================================
// IMPORT FUNCTIONS
// ============================================

/**
 * Import ข้อมูลทีละ row vào ปลายทาง
 */
function importRow(row, sheet) {
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  
  // สร้าง row ใหม่ตามลำดับ column
  const newRow = headers.map(header => row[header] || '');
  
  // เพิ่ม row ที่ท้าย sheet
  sheet.appendRow(newRow);
}

/**
 * Rollback migration ที่ล้มเหลว
 * ลบข้อมูลที่เพิ่มเข้ามาในช่วง transaction นี้
 */
function rollbackMigration(txId, destSheetId, startRow = null, endRow = null) {
  const destSS = SpreadsheetApp.openById(destSheetId);
  const sheets = destSS.getSheets();
  
  // ลบข้อมูลที่เพิ่มเข้ามาในแต่ละ sheet
  sheets.forEach(sheet => {
    if (startRow && endRow) {
      sheet.deleteRows(startRow, endRow - startRow + 1);
    }
    // ถ้าไม่ระบุ range ให้ทำ log ไว้
  });
  
  Logger.log(`Rollback transaction ${txId}`);
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * สร้าง transaction ID
 */
function generateTransactionId() {
  const timestamp = new Date().getTime();
  const random = Math.floor(Math.random() * 10000);
  return `TX-${timestamp}-${random}`;
}

/**
 * หา sheet ที่ตรงกับ processType
 */
function findSheetByProcess(ss, processType) {
  const sheetNames = [
    `${processType}-${getProcessName(processType)}`,
    `Tab-${getProcessName(processType)}`,
    processType
  ];
  
  for (const name of sheetNames) {
    const sheet = ss.getSheetByName(name);
    if (sheet) return sheet;
  }
  
  return null;
}

/**
 * แปลงชื่อ processType เป็นชื่อเต็ม
 */
function getProcessName(type) {
  const names = {
    'P1': 'แสวงหา',
    'P2': 'ประเมิน',
    'P3': 'จับคู่',
    'P4': 'ประเมินผล',
    'P5': 'พัฒนา',
    'P6': 'ค่าตอบแทน',
    'P7': 'คุณภาพชีวิต'
  };
  return names[type] || type;
}

/**
 * แปลง array เป็น object ตาม headers
 */
function rowArrayToObject(headers, row) {
  const obj = {};
  headers.forEach((header, index) => {
    obj[header] = row[index];
  });
  return obj;
}

/**
 * หา unique key สำหรับแต่ละ processType
 */
function getUniqueKey(processType) {
  const keys = {
    'P1': 'id',
    'P2': 'candidate_id',
    'P3': 'candidate_id',
    'P4': 'employee_id',
    'P5': 'employee_id',
    'P6': 'employee_id',
    'P7': 'employee_id'
  };
  return keys[processType] || 'id';
}

/**
 * สร้างผลการ migration
 */
function createMigrationResult(txId, status, successCount, failCount, skipCount, log, failedRows = []) {
  return {
    transactionId: txId,
    status: status,
    summary: {
      success: successCount,
      failed: failCount,
      skipped: skipCount,
      total: successCount + failCount + skipCount
    },
    log: log,
    failedRows: failedRows,
    timestamp: new Date().toISOString()
  };
}
