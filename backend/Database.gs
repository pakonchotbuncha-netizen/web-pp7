/**
 * Web PP7 Backend - Database Layer
 * Google Sheets CRUD Operations
 * 
 * @author KiroClaw
 * @date 25 มิ.ย. 2569
 */

/**
 * Database class - Handles all Google Sheets operations
 */
class Database {
  constructor() {
    this.ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
  }

  /**
   * Get a sheet by name, create if not exists
   */
  getSheet(name) {
    let sheet = this.ss.getSheetByName(name);
    if (!sheet) {
      sheet = this.ss.insertSheet(name);
      // Auto-set headers for known sheets
      this.initializeSheetHeaders(name, sheet);
    }
    return sheet;
  }

  /**
   * Initialize sheet with headers
   */
  initializeSheetHeaders(name, sheet) {
    const headers = HEADERS[name];
    if (headers && headers.length > 0) {
      sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
      sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold').setBackground('#4a86e8').setFontColor('#ffffff');
      sheet.setFrozenRows(1);
    }
  }

  /**
   * Get column index by name
   */
  getColumnIndex(sheetName, column) {
    const headers = HEADERS[sheetName];
    if (!headers) return -1;
    return headers.indexOf(column) + 1; // 1-based
  }

  /**
   * Get all data from a sheet as objects
   */
  getAll(sheetName) {
    const sheet = this.getSheet(sheetName);
    const data = sheet.getDataRange().getValues();
    if (data.length <= 1) return []; // Only headers

    const headers = data[0];
    const rows = [];
    for (let i = 1; i < data.length; i++) {
      if (data[i][0]) { // Skip empty rows
        const row = {};
        for (let j = 0; j < headers.length; j++) {
          row[headers[j]] = this.parseCell(data[i][j]);
        }
        rows.push(row);
      }
    }
    return rows;
  }

  /**
   * Get a record by its primary key
   */
  getById(sheetName, id) {
    const headers = HEADERS[sheetName];
    if (!headers || headers.length === 0) return null;

    const pkField = this.getPrimaryKeyField(sheetName);
    if (!pkField) return null;

    const allData = this.getAll(sheetName);
    return allData.find(row => row[pkField] === id) || null;
  }

  /**
   * Insert a new record
   */
  insert(sheetName, data) {
    const sheet = this.getSheet(sheetName);
    const headers = HEADERS[sheetName];
    if (!headers || headers.length === 0) {
      throw new Error('No headers defined for sheet: ' + sheetName);
    }

    const row = headers.map(header => {
      const value = data[header];
      if (value === undefined) return '';
      if (typeof value === 'object') return JSON.stringify(value);
      return value;
    });

    const lastRow = sheet.getLastRow();
    sheet.getRange(lastRow + 1, 1, 1, row.length).setValues([row]);

    // Flush to ensure data is written
    SpreadsheetApp.flush();
    return data;
  }

  /**
   * Update a record by primary key
   */
  update(sheetName, id, data) {
    const sheet = this.getSheet(sheetName);
    const headers = HEADERS[sheetName];
    const pkField = this.getPrimaryKeyField(sheetName);
    const pkColIdx = this.getColumnIndex(sheetName, pkField);

    if (!pkColIdx) throw new Error('Primary key not found for: ' + sheetName);

    const allData = sheet.getDataRange().getValues();
    let targetRow = -1;

    for (let i = 1; i < allData.length; i++) {
      if (allData[i][pkColIdx - 1] === id) {
        targetRow = i + 1; // 1-based
        break;
      }
    }

    if (targetRow === -1) {
      throw new Error('Record not found: ' + id);
    }

    // Update only provided fields
    for (const [key, value] of Object.entries(data)) {
      const colIdx = this.getColumnIndex(sheetName, key);
      if (colIdx > 0) {
        const cellValue = typeof value === 'object' ? JSON.stringify(value) : value;
        sheet.getRange(targetRow, colIdx).setValue(cellValue);
      }
    }

    SpreadsheetApp.flush();
    
    // Return updated record
    return this.getById(sheetName, id);
  }

  /**
   * Remove a record by primary key
   */
  remove(sheetName, id) {
    const sheet = this.getSheet(sheetName);
    const headers = HEADERS[sheetName];
    const pkField = this.getPrimaryKeyField(sheetName);
    const pkColIdx = this.getColumnIndex(sheetName, pkField);

    if (!pkColIdx) throw new Error('Primary key not found for: ' + sheetName);

    const allData = sheet.getDataRange().getValues();
    let targetRow = -1;

    for (let i = 1; i < allData.length; i++) {
      if (allData[i][pkColIdx - 1] === id) {
        targetRow = i + 1; // 1-based
        break;
      }
    }

    if (targetRow !== -1) {
      sheet.deleteRow(targetRow);
      SpreadsheetApp.flush();
    }

    return true;
  }

  /**
   * Query with filters and pagination
   */
  query(sheetName, filters, page, limit) {
    let allData = this.getAll(sheetName);

    // Apply filters
    if (filters && Object.keys(filters).length > 0) {
      allData = allData.filter(row => {
        for (const [key, value] of Object.entries(filters)) {
          if (row[key] !== value && String(row[key]) !== String(value)) {
            return false;
          }
        }
        return true;
      });
    }

    const total = allData.length;
    const start = (page - 1) * limit;
    const end = start + limit;
    const data = allData.slice(start, end);

    return { data, total, page, limit };
  }

  /**
   * Get configuration value
   */
  getConfig(key) {
    const sheet = this.getSheet(CONFIG.SHEET_NAMES.CONFIG);
    const data = sheet.getDataRange().getValues();
    
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === key) {
        const value = data[i][1];
        const type = data[i][2] || 'string';
        return this.parseConfigValue(value, type);
      }
    }
    return null;
  }

  /**
   * Get all configuration
   */
  getAllConfig() {
    const data = this.getAll(CONFIG.SHEET_NAMES.CONFIG);
    const config = {};
    data.forEach(row => {
      config[row.key] = this.parseConfigValue(row.value, row.type || 'string');
    });
    return config;
  }

  /**
   * Set configuration value
   */
  setConfig(key, value, type, userId) {
    const sheet = this.getSheet(CONFIG.SHEET_NAMES.CONFIG);
    const data = sheet.getDataRange().getValues();

    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === key) {
        // Update existing
        sheet.getRange(i + 1, 2).setValue(value);
        sheet.getRange(i + 1, 3).setValue(type || 'string');
        sheet.getRange(i + 1, 4).setValue(userId);
        sheet.getRange(i + 1, 5).setValue(new Date().toISOString());
        SpreadsheetApp.flush();
        return;
      }
    }

    // Insert new
    const lastRow = sheet.getLastRow();
    sheet.getRange(lastRow + 1, 1, 1, 5).setValues([[
      key, value, type || 'string', userId, new Date().toISOString()
    ]]);
    SpreadsheetApp.flush();
  }

  /**
   * Search records with text matching
   */
  search(sheetName, query, fields) {
    const allData = this.getAll(sheetName);
    const queryLower = query.toLowerCase();

    return allData.filter(row => {
      for (const field of fields) {
        const value = row[field];
        if (value && String(value).toLowerCase().includes(queryLower)) {
          return true;
        }
      }
      return false;
    });
  }

  /**
   * Count records
   */
  count(sheetName, filters) {
    const result = this.query(sheetName, filters || {}, 1, 1);
    return result.total;
  }

  /**
   * Get last inserted record (by timestamp)
   */
  getLast(sheetName) {
    const allData = this.getAll(sheetName);
    if (allData.length === 0) return null;

    return allData.reduce((latest, current) => {
      const latestTime = latest.created_at || latest.updated_at || '';
      const currentTime = current.created_at || current.updated_at || '';
      return currentTime > latestTime ? current : latest;
    });
  }

  // ===== Private Helpers =====

  getPrimaryKeyField(sheetName) {
    const pkMap = {
      'Config': 'key',
      'Users': 'user_id',
      'Sessions': 'session_id',
      'AuditLog': 'log_id',
      'Members': 'member_id',
      'P1_Headcount': 'request_id',
      'P1_Recruitment': 'case_id',
      'P2_Assessment': 'assessment_id',
      'P3_Matching': 'match_id',
      'P4_Performance': 'eval_id',
      'P5_Development': 'dev_id',
      'P6_Compensation': 'comp_id',
      'P7_Welfare': 'welfare_id'
    };
    return pkMap[sheetName] || null;
  }

  parseCell(value) {
    if (value === '' || value === null) return '';
    if (value instanceof Date) return value.toISOString();
    try {
      // Try to parse JSON
      if (typeof value === 'string' && (value.startsWith('{') || value.startsWith('['))) {
        return JSON.parse(value);
      }
    } catch (e) {}
    return value;
  }

  parseConfigValue(value, type) {
    switch (type) {
      case 'number': return Number(value);
      case 'boolean': return value === 'true' || value === true;
      case 'json':
        try { return JSON.parse(value); } catch (e) { return null; }
      default: return value;
    }
  }
}

// ===== Sheet Headers Definitions =====
const HEADERS = {
  'Config': [
    'key', 'value', 'type', 'updated_by', 'updated_at'
  ],
  'Users': [
    'user_id', 'email', 'display_name', 'role', 'department',
    'position', 'status', 'created_at', 'last_login'
  ],
  'Sessions': [
    'session_id', 'user_id', 'token', 'created_at', 'expires_at',
    'ip_address', 'user_agent'
  ],
  'AuditLog': [
    'log_id', 'user_id', 'action', 'entity_type', 'entity_id',
    'old_value', 'new_value', 'timestamp', 'ip_address'
  ],
  'Members': [
    'member_id', 'employee_code', 'title', 'first_name', 'last_name',
    'email', 'phone', 'id_card', 'birth_date', 'gender',
    'nationality', 'address', 'department', 'position', 'level',
    'start_date', 'status', 'probation_end', 'supervisor_id', 'team_id',
    'bu', 'country', 'photo_url', 'documents', 'core_competency',
    'skills', 'bank_account', 'bank_name', 'salary', 'allowance',
    'created_at', 'updated_at', 'created_by', 'updated_by'
  ],
  'P1_Headcount': [
    'request_id', 'bu', 'department', 'position', 'level',
    'quantity', 'reason', 'urgency', 'status', 'requested_by',
    'approved_by', 'approved_at', 'replacement_for', 'salary_range', 'notes',
    'created_at', 'updated_at'
  ],
  'P1_Recruitment': [
    'case_id', 'headcount_id', 'position', 'department', 'source',
    'channel', 'applicant_name', 'applicant_email', 'applicant_phone', 'application_date',
    'status', 'screening_score', 'interview_date', 'interviewers', 'interview_score',
    'assessment_score', 'match_score', 'cc_scores', 'skills_match', 'documents',
    'notes', 'assigned_to', 'created_at', 'updated_at'
  ],
  'P2_Assessment': [
    'assessment_id', 'member_id', 'case_id', 'assessment_type',
    'cc1_servant_leadership', 'cc2_adaptive_innovation', 'cc3_trust_based',
    'cc4_consensus', 'cc5_disciplined', 'skills_assessment',
    'attitude_assessment', 'overall_score', 'recommendation',
    'evaluator_id', 'evaluation_method', 'notes',
    'created_at', 'updated_at'
  ],
  'P3_Matching': [
    'match_id', 'member_id', 'case_id', 'position_id',
    'department', 'jd_requirements', 'match_score', 'gap_analysis',
    'recommendation', 'supervisor_notes', 'decision',
    'alternative_position', 'mentor_id', 'probation_plan',
    'approved_by', 'approved_at', 'created_at', 'updated_at'
  ],
  'P4_Performance': [
    'eval_id', 'member_id', 'eval_period', 'eval_type',
    'cc1_score', 'cc2_score', 'cc3_score', 'cc4_score', 'cc5_score',
    'kpi_scores', 'overall_score', 'grade',
    'self_eval', 'manager_eval', 'peer_eval',
    'subordinate_eval', 'customer_eval',
    'strengths', 'improvements', 'development_plan',
    'evaluator_ids', 'reviewed_by', 'reviewed_at', 'status',
    'created_at', 'updated_at'
  ],
  'P5_Development': [
    'dev_id', 'member_id', 'performance_id', 'dev_type',
    'program_name', 'mentor_id', 'start_date', 'end_date',
    'hours', 'cost', 'status', 'score_before', 'score_after',
    'improvement', 'certificate', 'notes',
    'created_at', 'updated_at'
  ],
  'P6_Compensation': [
    'comp_id', 'member_id', 'period', 'type',
    'amount', 'currency', 'payment_method', 'bank_reference',
    'status', 'paid_at', 'approved_by', 'notes',
    'created_at', 'updated_at'
  ],
  'P7_Welfare': [
    'welfare_id', 'member_id', 'category', 'type',
    'description', 'request_date', 'amount', 'status',
    'approved_by', 'notes', 'documents',
    'created_at', 'updated_at'
  ]
};
