/**
 * PP7 Backend — Database.gs
 * Google Sheets CRUD Helper สำหรับ PP7 HRMS
 * 
 * หน้าที่: อ่าน/เขียน/อัปเดต/ลบ ข้อมูลใน Google Sheets
 * ทุก function รองรับ multi-country (TH/LA/KH)
 */

// ============================================================
// CONFIG & CONSTANTS
// ============================================================

// Sheet prefix สำหรับแต่ละ module
var SHEET_PREFIX = {
  COMMON: 'DB_',
  P1: 'P1_',
  P2: 'P2_',
  P3: 'P3_',
  P4: 'P4_',
  P5: 'P5_',
  P6: 'P6_',
  P7: 'P7_'
};

// รายการ Sheets ทั้งหมด
var ALL_SHEETS = {
  // Common
  'employees': { prefix: 'DB_', headers: ['id','employee_code','first_name_th','last_name_th','first_name_en','last_name_en','email','phone','gender','birth_date','national_id','passport_no','hire_date','probation_end','employment_type','position','level','department_id','business_unit_id','manager_id','base_salary','currency','bank_name','bank_account','address','emergency_contact_name','emergency_contact_phone','profile_photo_url','resignation_date','termination_reason','country','created_at','updated_at','created_by','status'] },
  'business_units': { prefix: 'DB_', headers: ['id','bu_code','bu_name_th','bu_name_en','bu_head_id','parent_bu_id','sort_order','color','country','created_at','updated_at','created_by','status'] },
  'departments': { prefix: 'DB_', headers: ['id','dept_code','dept_name_th','dept_name_en','business_unit_id','dept_head_id','parent_dept_id','sort_order','country','created_at','updated_at','created_by','status'] },
  'users': { prefix: 'DB_', headers: ['id','email','password_hash','display_name','employee_id','role','business_unit_id','last_login','login_token','token_expiry','country','created_at','updated_at','created_by','status'] },
  'roles': { prefix: 'DB_', headers: ['id','role_name','description_th','permissions','menu_access','country','created_at','updated_at','created_by','status'] },
  'audit_log': { prefix: 'DB_', headers: ['id','user_email','action','module','table_name','record_id','old_value','new_value','ip_address','user_agent','country','created_at','updated_at','created_by','status'] },
  // P1 — Recruitment
  'headcount_requests': { prefix: 'P1_', headers: ['id','request_no','request_date','business_unit_id','department_id','position','level','quantity','urgency','reason','replacement_for','approved_by','approved_date','approval_status','budget_range_min','budget_range_max','job_description','qualifications','target_start_date','country','created_at','updated_at','created_by','status'] },
  'candidates': { prefix: 'P1_', headers: ['id','candidate_code','first_name','last_name','email','phone','linkedin_url','resume_url','cover_letter','headcount_request_id','recruitment_source_id','applied_position','current_company','current_salary','expected_salary','years_experience','education_level','education_field','skills','stage','applied_date','notes','country','created_at','updated_at','created_by','status'] },
  'recruitment_sources': { prefix: 'P1_', headers: ['id','source_name','source_type','cost_per_hire','total_applicants','total_hired','notes','country','created_at','updated_at','created_by','status'] },
  // P2 — Assessment
  'interviews': { prefix: 'P2_', headers: ['id','candidate_id','interview_type','interviewer_ids','interview_date','duration_minutes','location','questions','answers','rating','feedback','decision','next_round_type','notes','country','created_at','updated_at','created_by','status'] },
  'assessment_results': { prefix: 'P2_', headers: ['id','candidate_id','assessment_type','test_name','test_date','score','max_score','percentile','result_summary','raw_data','assessed_by','country','created_at','updated_at','created_by','status'] },
  'competency_scores': { prefix: 'P2_', headers: ['id','candidate_id','competency_name','competency_category','score','evidence','assessor_id','assessment_date','notes','country','created_at','updated_at','created_by','status'] },
  // P3 — Position Matching
  'position_matching': { prefix: 'P3_', headers: ['id','candidate_id','headcount_request_id','match_score','skills_match','experience_match','culture_match','salary_match','overall_recommendation','recommended_position','recommended_level','decision','decision_date','notes','country','created_at','updated_at','created_by','status'] },
  'employee_assignments': { prefix: 'P3_', headers: ['id','employee_id','assignment_type','position','department_id','business_unit_id','manager_id','start_date','end_date','reason','previous_assignment_id','approved_by','effective_date','country','created_at','updated_at','created_by','status'] },
  // P4 — Performance
  'performance_evaluations': { prefix: 'P4_', headers: ['id','employee_id','evaluation_period','evaluation_type','review_date','kpi_scores','goal_achievement','overall_rating','rating_label','strengths','areas_for_improvement','reviewer_id','review_comments','employee_comments','calibration_score','final_rating','country','created_at','updated_at','created_by','status'] },
  'evaluation_360': { prefix: 'P4_', headers: ['id','employee_id','evaluation_period','evaluator_id','relationship','competency_scores','behavioral_feedback','overall_score','is_anonymous','submission_date','country','created_at','updated_at','created_by','status'] },
  'annual_credit': { prefix: 'P4_', headers: ['id','employee_id','year','credit_type','calculated_amount','approved_amount','percentage','justification','approved_by','approved_date','country','created_at','updated_at','created_by','status'] },
  // P5 — Development
  'development_plans': { prefix: 'P5_', headers: ['id','employee_id','plan_year','plan_type','goal','current_level','target_level','target_date','action_items','progress','mentor_id','manager_comments','country','created_at','updated_at','created_by','status'] },
  'training_records': { prefix: 'P5_', headers: ['id','employee_id','training_name','training_type','provider','start_date','end_date','duration_hours','cost','score','passed','certificate_url','development_plan_id','feedback','country','created_at','updated_at','created_by','status'] },
  'skill_gaps': { prefix: 'P5_', headers: ['id','employee_id','skill_name','skill_category','current_level','required_level','gap','priority','action_plan','target_date','country','created_at','updated_at','created_by','status'] },
  // P6 — Compensation
  'salary_records': { prefix: 'P6_', headers: ['id','employee_id','effective_date','base_salary','currency','salary_grade','step','change_type','change_reason','previous_salary','approved_by','approved_date','country','created_at','updated_at','created_by','status'] },
  'incentives': { prefix: 'P6_', headers: ['id','employee_id','incentive_type','period','amount','currency','calculation_basis','performance_rating','approved_by','paid_date','notes','country','created_at','updated_at','created_by','status'] },
  'benefits': { prefix: 'P6_', headers: ['id','employee_id','benefit_type','benefit_name','description','monthly_amount','annual_amount','enrollment_date','expiry_date','provider','notes','country','created_at','updated_at','created_by','status'] },
  // P7 — Wellbeing
  'wellbeing_records': { prefix: 'P7_', headers: ['id','employee_id','record_type','record_date','score','category','description','action_taken','follow_up_date','notes','country','created_at','updated_at','created_by','status'] },
  'health_records': { prefix: 'P7_', headers: ['id','employee_id','record_type','record_date','facility','diagnosis','treatment','fitness_status','next_checkup_date','notes','country','created_at','updated_at','created_by','status'] },
  'engagement_surveys': { prefix: 'P7_', headers: ['id','survey_name','survey_type','launch_date','close_date','total_invited','total_responded','response_rate','overall_score','dimension_scores','top_strengths','top_concerns','action_plans','country','created_at','updated_at','created_by','status'] }
};

// ============================================================
// UTILITY FUNCTIONS
// ============================================================

/**
 * สร้าง UUID แบบง่าย
 */
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0;
    var v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

/**
 * ได้ Sheet Name เต็มจาก table name
 */
function getSheetName(tableName) {
  var config = ALL_SHEETS[tableName];
  if (!config) {
    throw new Error('Unknown table: ' + tableName);
  }
  return config.prefix + tableName;
}

/**
 * เปิด Spreadsheet
 */
function getSpreadsheet() {
  var ssId = PropertiesService.getScriptProperties().getProperty('SPREADSHEET_ID');
  if (!ssId) {
    throw new Error('SPREADSHEET_ID not set. Run setup first.');
  }
  return SpreadsheetApp.openById(ssId);
}

/**
 * เปิด Sheet จาก table name
 */
function getSheet(tableName) {
  var ss = getSpreadsheet();
  var sheetName = getSheetName(tableName);
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    throw new Error('Sheet not found: ' + sheetName + '. Run createAllTables() first.');
  }
  return sheet;
}

/**
 * แปลง Sheet เป็น Array of Objects
 */
function sheetToObjects(sheet) {
  var data = sheet.getDataRange().getValues();
  if (data.length < 2) return [];
  
  var headers = data[0];
  var rows = [];
  
  for (var i = 1; i < data.length; i++) {
    var row = {};
    for (var j = 0; j < headers.length; j++) {
      row[headers[j]] = data[i][j];
    }
    // Skip empty rows
    if (!row['id']) continue;
    rows.push(row);
  }
  
  return rows;
}

/**
 * แปลง Object เป็น Array (ตาม headers)
 */
function objectToRow(obj, headers) {
  var row = [];
  for (var i = 0; i < headers.length; i++) {
    var val = obj[headers[i]];
    row.push(val !== undefined ? val : '');
  }
  return row;
}

// ============================================================
// CRUD OPERATIONS
// ============================================================

/**
 * CREATE — เพิ่ม record ใหม่
 * @param {string} tableName - ชื่อ table เช่น 'employees', 'candidates'
 * @param {Object} data - ข้อมูลที่จะเพิ่ม
 * @param {string} userEmail - ผู้สร้าง (สำหรับ audit)
 * @returns {Object} record ที่สร้างพร้อม id
 */
function dbCreate(tableName, data, userEmail) {
  var sheet = getSheet(tableName);
  var config = ALL_SHEETS[tableName];
  var headers = config.headers;
  
  // Set system fields
  var now = new Date().toISOString();
  if (!data.id) {
    data.id = generateUUID();
  }
  data.created_at = data.created_at || now;
  data.updated_at = now;
  data.created_by = data.created_by || userEmail || 'system';
  data.status = data.status || 'active';
  
  // เพิ่ม row ใหม่
  var row = objectToRow(data, headers);
  sheet.appendRow(row);
  
  // Audit log
  auditLog(userEmail, 'create', tableName, data.id, null, data);
  
  return data;
}

/**
 * READ — อ่าน record ทั้งหมด หรือ filter ตามเงื่อนไข
 * @param {string} tableName - ชื่อ table
 * @param {Object} [filters] - เงื่อนไข filter เช่น {status: 'active', country: 'TH'}
 * @returns {Array} รายการ records
 */
function dbRead(tableName, filters) {
  var sheet = getSheet(tableName);
  var rows = sheetToObjects(sheet);
  
  // Apply filters
  if (filters && typeof filters === 'object') {
    rows = rows.filter(function(row) {
      for (var key in filters) {
        if (filters.hasOwnProperty(key)) {
          if (String(row[key]) !== String(filters[key])) {
            return false;
          }
        }
      }
      return true;
    });
  }
  
  return rows;
}

/**
 * READ ONE — อ่าน record เดียวตาม id
 * @param {string} tableName - ชื่อ table
 * @param {string} id - ID ของ record
 * @returns {Object|null} record ที่ gevonden หรือ null
 */
function dbReadOne(tableName, id) {
  var rows = dbRead(tableName);
  for (var i = 0; i < rows.length; i++) {
    if (rows[i].id === id) {
      return rows[i];
    }
  }
  return null;
}

/**
 * UPDATE — แก้ไข record ตาม id
 * @param {string} tableName - ชื่อ table
 * @param {string} id - ID ของ record
 * @param {Object} data - ข้อมูลใหม่ (merge กับของเดิม)
 * @param {string} userEmail - ผู้แก้ไข
 * @returns {Object} record ที่อัปเดตแล้ว
 */
function dbUpdate(tableName, id, data, userEmail) {
  var sheet = getSheet(tableName);
  var config = ALL_SHEETS[tableName];
  var headers = config.headers;
  var allRows = sheet.getDataRange().getValues();
  
  if (allRows.length < 2) {
    throw new Error('No records in ' + tableName);
  }
  
  // หา row index (1-based for sheet, 0-based for data array)
  var rowIndex = -1;
  var oldData = null;
  for (var i = 1; i < allRows.length; i++) {
    if (allRows[i][0] === id) {  // id is always column 0
      rowIndex = i + 1;  // 1-based for sheet
      // Get old data
      oldData = {};
      for (var j = 0; j < headers.length; j++) {
        oldData[headers[j]] = allRows[i][j];
      }
      break;
    }
  }
  
  if (rowIndex === -1) {
    throw new Error('Record not found: ' + id + ' in ' + tableName);
  }
  
  // Merge data
  var updatedData = {};
  for (var key in oldData) {
    if (oldData.hasOwnProperty(key)) {
      updatedData[key] = oldData[key];
    }
  }
  for (var key in data) {
    if (data.hasOwnProperty(key)) {
      updatedData[key] = data[key];
    }
  }
  updatedData.updated_at = new Date().toISOString();
  
  // Write back
  var row = objectToRow(updatedData, headers);
  sheet.getRange(rowIndex, 1, 1, headers.length).setValues([row]);
  
  // Audit log
  auditLog(userEmail, 'update', tableName, id, oldData, updatedData);
  
  return updatedData;
}

/**
 * DELETE — ลบ record (soft delete = set status to 'archived')
 * @param {string} tableName - ชื่อ table
 * @param {string} id - ID ของ record
 * @param {string} userEmail - ผู้ลบ
 * @returns {boolean} true ถ้าสำเร็จ
 */
function dbDelete(tableName, id, userEmail) {
  return dbUpdate(tableName, id, { status: 'archived' }, userEmail);
}

/**
 * DELETE HARD — ลบ record ออกจาก sheet จริง (ใช้ด้วยความระมัดระวัง!)
 * @param {string} tableName
 * @param {string} id
 * @param {string} userEmail
 */
function dbDeleteHard(tableName, id, userEmail) {
  var sheet = getSheet(tableName);
  var allRows = sheet.getDataRange().getValues();
  
  for (var i = 1; i < allRows.length; i++) {
    if (allRows[i][0] === id) {
      sheet.deleteRow(i + 1);
      auditLog(userEmail, 'delete_hard', tableName, id, allRows[i], null);
      return true;
    }
  }
  return false;
}

/**
 * COUNT — นับจำนวน records
 * @param {string} tableName
 * @param {Object} [filters]
 * @returns {number}
 */
function dbCount(tableName, filters) {
  var rows = dbRead(tableName, filters);
  return rows.length;
}

/**
 * SEARCH — ค้นหาแบบ text match
 * @param {string} tableName
 * @param {string} query - ข้อความค้นหา
 * @param {string[]} [fields] - ฟิลด์ที่จะค้นหา (default: ทุก string field)
 * @returns {Array}
 */
function dbSearch(tableName, query, fields) {
  var rows = dbRead(tableName);
  var q = query.toLowerCase();
  
  return rows.filter(function(row) {
    var searchFields = fields || Object.keys(row);
    for (var i = 0; i < searchFields.length; i++) {
      var val = row[searchFields[i]];
      if (typeof val === 'string' && val.toLowerCase().indexOf(q) !== -1) {
        return true;
      }
    }
    return false;
  });
}

/**
 * PAGINATE — แบ่งหน้าผลลัพธ์
 * @param {string} tableName
 * @param {Object} [filters]
 * @param {number} [page=1]
 * @param {number} [pageSize=20]
 * @param {string} [sortBy='created_at']
 * @param {string} [sortOrder='desc']
 * @returns {Object} { data, total, page, pageSize, totalPages }
 */
function dbPaginate(tableName, filters, page, pageSize, sortBy, sortOrder) {
  page = page || 1;
  pageSize = pageSize || 20;
  sortBy = sortBy || 'created_at';
  sortOrder = sortOrder || 'desc';
  
  var rows = dbRead(tableName, filters);
  
  // Sort
  rows.sort(function(a, b) {
    var va = a[sortBy] || '';
    var vb = b[sortBy] || '';
    var cmp = va < vb ? -1 : va > vb ? 1 : 0;
    return sortOrder === 'desc' ? -cmp : cmp;
  });
  
  var total = rows.length;
  var totalPages = Math.ceil(total / pageSize);
  var start = (page - 1) * pageSize;
  var data = rows.slice(start, start + pageSize);
  
  return {
    data: data,
    total: total,
    page: page,
    pageSize: pageSize,
    totalPages: totalPages
  };
}

// ============================================================
// AUDIT LOG
// ============================================================

/**
 * บันทึก Audit Log
 */
function auditLog(userEmail, action, tableName, recordId, oldValue, newValue) {
  try {
    var logData = {
      user_email: userEmail || 'system',
      action: action,
      module: getModuleFromTable(tableName),
      table_name: tableName,
      record_id: recordId || '',
      old_value: oldValue ? JSON.stringify(oldValue) : '',
      new_value: newValue ? JSON.stringify(newValue) : '',
      ip_address: '',
      user_agent: ''
    };
    
    // Avoid infinite loop: create directly without audit
    var sheet = getSheet('audit_log');
    var headers = ALL_SHEETS['audit_log'].headers;
    logData.id = generateUUID();
    logData.created_at = new Date().toISOString();
    logData.updated_at = logData.created_at;
    logData.created_by = userEmail || 'system';
    logData.status = 'active';
    logData.country = 'TH';
    
    var row = objectToRow(logData, headers);
    sheet.appendRow(row);
  } catch (e) {
    // ถ้า audit_log sheet ยังไม่มี ให้ข้าม
    Logger.log('Audit log error: ' + e.message);
  }
}

/**
 * หา module จาก table name
 */
function getModuleFromTable(tableName) {
  if (tableName.indexOf('P1_') === 0) return 'P1';
  if (tableName.indexOf('P2_') === 0) return 'P2';
  if (tableName.indexOf('P3_') === 0) return 'P3';
  if (tableName.indexOf('P4_') === 0) return 'P4';
  if (tableName.indexOf('P5_') === 0) return 'P5';
  if (tableName.indexOf('P6_') === 0) return 'P6';
  if (tableName.indexOf('P7_') === 0) return 'P7';
  return 'system';
}

// ============================================================
// RELATIONSHIP HELPERS
// ============================================================

/**
 * ดึงข้อมูล employee พร้อม department และ BU
 */
function getEmployeeWithRelations(employeeId) {
  var emp = dbReadOne('employees', employeeId);
  if (!emp) return null;
  
  if (emp.department_id) {
    emp._department = dbReadOne('departments', emp.department_id);
  }
  if (emp.business_unit_id) {
    emp._business_unit = dbReadOne('business_units', emp.business_unit_id);
  }
  if (emp.manager_id) {
    emp._manager = dbReadOne('employees', emp.manager_id);
  }
  
  return emp;
}

/**
 * ดึง candidates ของ headcount request เดียว
 */
function getCandidatesByRequest(headcountRequestId) {
  return dbRead('candidates', { headcount_request_id: headcountRequestId });
}

/**
 * ดึn performance evaluations ของพนักงาน
 */
function getEvaluationsByEmployee(employeeId) {
  return dbRead('performance_evaluations', { employee_id: employeeId });
}

/**
 * ดึง salary history ของพนักงาน
 */
function getSalaryHistory(employeeId) {
  var records = dbRead('salary_records', { employee_id: employeeId });
  // เรียงตาม effective_date
  records.sort(function(a, b) {
    return a.effective_date < b.effective_date ? -1 : 1;
  });
  return records;
}
