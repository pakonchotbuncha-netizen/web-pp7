/**
 * PP7 Frontend — api-adapter.js
 * Frontend bridge สำหรับเรียก GAS Backend API
 * 
 * ใช้: import ใน HTML หรือ <script src="api-adapter.js">
 * แล้วเรียก PP7API.login(), PP7API.listRecords(), etc.
 */

// ============================================================
// CONFIG
// ============================================================

var PP7API_CONFIG = {
  // URL ของ Web App (Apps Script deployed URL)
  BASE_URL: '', // ต้องเซ็ตตอน deploy เช่น 'https://script.google.com/macros/s/XXXXX/exec'
  
  // Timeout (ms)
  TIMEOUT: 30000,
  
  // Token storage key
  TOKEN_KEY: 'pp7_auth_token',
  USER_KEY: 'pp7_auth_user',
  
  // Default country
  DEFAULT_COUNTRY: 'TH'
};

// ============================================================
// CORE HTTP FUNCTIONS
// ============================================================

/**
 * เรียก API แบบ GET
 * @param {string} path - API path เช่น '/api/employees'
 * @param {Object} [params] - Query parameters
 * @returns {Promise}
 */
async function apiGet(path, params) {
  var token = PP7API.getToken();
  var url = PP7API_CONFIG.BASE_URL + path;
  
  // Build query string
  var queryParts = [];
  queryParts.push('path=' + encodeURIComponent(path));
  
  if (token) {
    queryParts.push('token=' + encodeURIComponent(token));
  }
  
  // เพิ่ม params
  if (params) {
    for (var key in params) {
      if (params.hasOwnProperty(key) && params[key] !== undefined && params[key] !== null) {
        queryParts.push(encodeURIComponent(key) + '=' + encodeURIComponent(params[key]));
      }
    }
  }
  
  // Default country
  if (!params || !params.country) {
    queryParts.push('country=' + PP7API_CONFIG.DEFAULT_COUNTRY);
  }
  
  url = PP7API_CONFIG.BASE_URL + '?' + queryParts.join('&');
  
  var response = await fetch(url, {
    method: 'GET',
    headers: { 'Accept': 'application/json' }
  });
  
  return response.json();
}

/**
 * เรียก API แบบ POST/PUT/DELETE
 * @param {string} method - HTTP method
 * @param {string} path - API path
 * @param {Object} body - Request body
 * @returns {Promise}
 */
async function apiRequest(method, path, body) {
  var token = PP7API.getToken();
  
  var requestBody = {
    path: path,
    method: method,
    token: token,
    ...body
  };
  
  // GAS只能用 POST สำหรับทุก non-GET method
  var url = PP7API_CONFIG.BASE_URL;
  
  var response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify(requestBody)
  });
  
  var data = await response.json();
  
  // Handle auth errors
  if (data.code === 403 || (data.error && data.error.indexOf('Token') !== -1)) {
    PP7API.clearAuth();
    // Trigger login screen
    if (typeof PP7UI !== 'undefined' && PP7UI.showLogin) {
      PP7UI.showLogin('Session หมดอายุ กรุณาเข้าสู่ระบบอีกครั้ง');
    }
  }
  
  return data;
}

// ============================================================
// PP7API OBJECT — Public API
// ============================================================

var PP7API = {
  
  // ---- AUTH ----
  
  /**
   * เข้าสู่ระบบ
   * @param {string} email
   * @param {string} password
   * @returns {Promise<{success, token, user}>}
   */
  login: async function(email, password) {
    var result = await apiRequest('POST', 'api/auth/login', { email: email, password: password });
    
    if (result.success) {
      PP7API.setToken(result.token);
      PP7API.setUser(result.user);
    }
    
    return result;
  },
  
  /**
   * ออกจากระบบ
   */
  logout: async function() {
    var token = PP7API.getToken();
    try {
      await apiRequest('POST', 'api/auth/logout', { token: token });
    } catch (e) {
      // ignore
    }
    PP7API.clearAuth();
  },
  
  /**
   * ตรวจสอบ token ปัจจุบัน
   */
  validateToken: async function() {
    var token = PP7API.getToken();
    if (!token) return { success: false, error: 'ไม่มี token' };
    return apiGet('api/auth/validate', { token: token });
  },
  
  /**
   * ตั้ง token
   */
  setToken: function(token) {
    localStorage.setItem(PP7API_CONFIG.TOKEN_KEY, token);
  },
  
  /**
   * ดึง token
   */
  getToken: function() {
    return localStorage.getItem(PP7API_CONFIG.TOKEN_KEY);
  },
  
  /**
   * ตั้ง user info
   */
  setUser: function(user) {
    localStorage.setItem(PP7API_CONFIG.USER_KEY, JSON.stringify(user));
  },
  
  /**
   * ดึง user info
   */
  getUser: function() {
    var raw = localStorage.getItem(PP7API_CONFIG.USER_KEY);
    try {
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  },
  
  /**
   * ลบ auth data ทั้งหมด
   */
  clearAuth: function() {
    localStorage.removeItem(PP7API_CONFIG.TOKEN_KEY);
    localStorage.removeItem(PP7API_CONFIG.USER_KEY);
  },
  
  /**
   * ตรวจสอบว่า login แล้วหรือยัง
   */
  isLoggedIn: function() {
    return !!PP7API.getToken();
  },
  
  // ---- DASHBOARD ----
  
  getDashboardSummary: function(country) {
    return apiGet('api/dashboard', { country: country || PP7API_CONFIG.DEFAULT_COUNTRY });
  },
  
  // ---- GENERIC CRUD ----
  
  /**
   * ดึงรายการข้อมูล (list)
   * @param {string} module - ชื่อ module เช่น 'employees', 'candidates'
   * @param {Object} [options] - { page, pageSize, sortBy, sortOrder, search, ...filters }
   */
  listRecords: function(module, options) {
    return apiGet('api/api/' + module, options || {});
  },
  
  /**
   * ดึงข้อมูล record เดียว
   * @param {string} module
   * @param {string} id
   */
  getRecord: function(module, id) {
    return apiGet('api/api/' + module + '/' + id);
  },
  
  /**
   * สร้าง record ใหม่
   * @param {string} module
   * @param {Object} data
   */
  createRecord: function(module, data) {
    return apiRequest('POST', 'api/api/' + module, data);
  },
  
  /**
   * แก้ไข record
   * @param {string} module
   * @param {string} id
   * @param {Object} data
   */
  updateRecord: function(module, id, data) {
    return apiRequest('PUT', 'api/api/' + module + '/' + id, data);
  },
  
  /**
   * ลบ record (soft delete)
   * @param {string} module
   * @param {string} id
   */
  deleteRecord: function(module, id) {
    return apiRequest('DELETE', 'api/api/' + module + '/' + id, {});
  },
  
  /**
   * ค้นหา
   * @param {string} module
   * @param {string} query
   */
  searchRecords: function(module, query) {
    return apiGet('api/api/' + module, { search: query });
  },
  
  // ---- MODULE-SPECIFIC HELPERS ----
  
  // ===== P1 — Recruitment =====
  
  getHeadcountRequests: function(options) {
    return PP7API.listRecords('headcount_requests', options);
  },
  
  createHeadcountRequest: function(data) {
    return PP7API.createRecord('headcount_requests', data);
  },
  
  getCandidates: function(options) {
    return PP7API.listRecords('candidates', options);
  },
  
  createCandidate: function(data) {
    return PP7API.createRecord('candidates', data);
  },
  
  updateCandidateStage: function(id, stage) {
    return PP7API.updateRecord('candidates', id, { stage: stage });
  },
  
  // ===== P2 — Assessment =====
  
  getInterviews: function(options) {
    return PP7API.listRecords('interviews', options);
  },
  
  createInterview: function(data) {
    return PP7API.createRecord('interviews', data);
  },
  
  getAssessmentResults: function(options) {
    return PP7API.listRecords('assessment_results', options);
  },

  createAssessmentResult: function(data) {
    return PP7API.createRecord('assessment_results', data);
  },

  updateAssessmentResult: function(id, data) {
    return PP7API.updateRecord('assessment_results', id, data);
  },

  getCompetencyScores: function(options) {
    return PP7API.listRecords('competency_scores', options);
  },

  updateHeadcountRequest: function(id, data) {
    return PP7API.updateRecord('headcount_requests', id, data);
  },
  
  // ===== P3 — Position Matching =====
  
  getPositionMatching: function(options) {
    return PP7API.listRecords('position_matching', options);
  },
  
  createPositionMatch: function(data) {
    return PP7API.createRecord('position_matching', data);
  },
  
  // ===== P4 — Performance =====
  
  getPerformanceEvaluations: function(options) {
    return PP7API.listRecords('performance_evaluations', options);
  },
  
  createEvaluation: function(data) {
    return PP7API.createRecord('performance_evaluations', data);
  },
  
  getEvaluation360: function(options) {
    return PP7API.listRecords('evaluation_360', options);
  },
  
  // ===== P5 — Development =====
  
  getDevelopmentPlans: function(options) {
    return PP7API.listRecords('development_plans', options);
  },
  
  getTrainingRecords: function(options) {
    return PP7API.listRecords('training_records', options);
  },
  
  getSkillGaps: function(options) {
    return PP7API.listRecords('skill_gaps', options);
  },
  
  // ===== P6 — Compensation =====
  
  getSalaryRecords: function(options) {
    return PP7API.listRecords('salary_records', options);
  },
  
  getIncentives: function(options) {
    return PP7API.listRecords('incentives', options);
  },
  
  getBenefits: function(options) {
    return PP7API.listRecords('benefits', options);
  },
  
  // ===== P7 — Wellbeing =====
  
  getWellbeingRecords: function(options) {
    return PP7API.listRecords('wellbeing_records', options);
  },
  
  getHealthRecords: function(options) {
    return PP7API.listRecords('health_records', options);
  },
  
  getEngagementSurveys: function(options) {
    return PP7API.listRecords('engagement_surveys', options);
  },
  
  // ===== Common =====
  
  getEmployees: function(options) {
    return PP7API.listRecords('employees', options);
  },
  
  getEmployee: function(id) {
    return PP7API.getRecord('employees', id);
  },
  
  createEmployee: function(data) {
    return PP7API.createRecord('employees', data);
  },
  
  updateEmployee: function(id, data) {
    return PP7API.updateRecord('employees', id, data);
  },
  
  getBusinessUnits: function() {
    return PP7API.listRecords('business_units');
  },
  
  getDepartments: function(options) {
    return PP7API.listRecords('departments', options);
  },
  
  getAuditLog: function(options) {
    return PP7API.listRecords('audit_log', options);
  },
  
  // ----- USERS MANAGEMENT -----
  
  getUsers: function() {
    return PP7API.listRecords('users');
  },
  
  createUser: function(data) {
    return PP7API.createRecord('users', data);
  },
  
  updateUser: function(id, data) {
    return PP7API.updateRecord('users', id, data);
  },
  
  // ----- SETUP -----
  
  runSetup: async function(adminPassword) {
    return apiRequest('POST', 'api/setup', { admin_password: adminPassword || 'setup_pp7_2025' });
  }
};

// ============================================================
// GOOGLE APPS SCRIPT BRIDGE (for HtmlService mode)
// ============================================================

/**
 * สำหรับ frontend ที่ serve ผ่าน GAS HtmlService
 * ใช้ google.script.run แทน fetch
 */
var PP7GASBridge = {
  
  _callServer: function(functionName, args) {
    return new Promise(function(resolve, reject) {
      google.script.run
        .withSuccessHandler(resolve)
        .withFailureHandler(reject)
        [functionName].apply(google.script.run, args || []);
    });
  },
  
  login: function(email, password) {
    return PP7GASBridge._callServer('login', [email, password]);
  },
  
  listRecords: function(tableName, filters) {
    return PP7GASBridge._callServer('dbRead', [tableName, filters]);
  },
  
  getRecord: function(tableName, id) {
    return PP7GASBridge._callServer('dbReadOne', [tableName, id]);
  },
  
  createRecord: function(tableName, data, email) {
    return PP7GASBridge._callServer('dbCreate', [tableName, data, email]);
  },
  
  updateRecord: function(tableName, id, data, email) {
    return PP7GASBridge._callServer('dbUpdate', [tableName, id, data, email]);
  },
  
  deleteRecord: function(tableName, id, email) {
    return PP7GASBridge._callServer('dbDelete', [tableName, id, email]);
  },
  
  getDashboardSummary: function() {
    return PP7GASBridge._callServer('getDashboardData');
  },
  
  runSetup: function() {
    return PP7GASBridge._callServer('createAllTables');
  }
};

// ============================================================
// EXPORT
// ============================================================

// สำหรับ Node.js / bundler
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { PP7API, PP7GASBridge, PP7API_CONFIG };
}

// สำหรับ browser globals (ใช้งานได้เลย)
if (typeof window !== 'undefined') {
  window.PP7API = PP7API;
  window.PP7GASBridge = PP7GASBridge;
}
