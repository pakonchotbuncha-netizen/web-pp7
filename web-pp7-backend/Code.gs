/**
 * PP7 Backend — Code.gs
 * Main API Router สำหรับ Google Apps Script
 * 
 * endpoints:
 *   POST /api/auth/login
 *   POST /api/auth/logout
 *   GET  /api/auth/validate
 *   
 *   GET  /api/:module (list)
 *   GET  /api/:module/:id (get one)
 *   POST /api/:module (create)
 *   PUT  /api/:module/:id (update)
 *   DELETE /api/:module/:id (soft delete)
 *   GET  /api/dashboard/summary
 */

// ============================================================
// MAIN ROUTER — doGet / doPost
// ============================================================

/**
 * Handle GET requests
 */
function doGet(e) {
  var path = e.parameter.path || '';
  var params = e.parameter;
  
  try {
    // Routing ตาม path
    var result = routeRequest('GET', path, params, null);
    return jsonResponse(result);
  } catch (err) {
    return jsonResponse({ success: false, error: err.message }, 500);
  }
}

/**
 * Handle POST/PUT/DELETE requests
 */
function doPost(e) {
  var path = e.parameter.path || '';
  var method = e.parameter.method || 'POST';
  
  try {
    var body = null;
    if (e.postData && e.postData.contents) {
      body = JSON.parse(e.postData.contents);
    }
    
    var result = routeRequest(method, path, e.parameter, body);
    return jsonResponse(result);
  } catch (err) {
    return jsonResponse({ success: false, error: err.message }, 500);
  }
}

/**
 * Route request ไปยัง handler ที่ถูกต้อง
 */
function routeRequest(method, path, queryParams, body) {
  // ลบ leading/trailing slash
  path = path.replace(/^\/+|\/+$/g, '');
  var parts = path.split('/');
  
  // ============================================================
  // AUTH ROUTES
  // ============================================================
  
  if (parts[0] === 'api' && parts[1] === 'auth') {
    return handleAuthRoute(method, parts[2], body || queryParams);
  }
  
  // ============================================================
  // API ROUTES
  // ============================================================
  
  if (parts[0] === 'api') {
    var module = parts[1] || '';
    var recordId = parts[2] || null;
    var token = (body && body.token) || queryParams.token || '';
    
    return handleAPIRoute(method, module, recordId, token, body || {}, queryParams);
  }
  
  // ============================================================
  // SETUP ROUTE
  // ============================================================
  
  if (parts[0] === 'setup') {
    return handleSetupRoute(body || queryParams);
  }
  
  return { success: false, error: 'Route not found: ' + path };
}

// ============================================================
// AUTH ROUTES
// ============================================================

function handleAuthRoute(method, action, data) {
  switch (action) {
    case 'login':
      return login(data.email, data.password);
      
    case 'logout':
      return logout(data.token);
      
    case 'validate':
      return validateToken(data.token);
      
    default:
      return { success: false, error: 'Unknown auth action: ' + action };
  }
}

// ============================================================
// API ROUTES (Module-based CRUD)
// ============================================================

function handleAPIRoute(method, module, recordId, token, body, queryParams) {
  
  // === Dashboard ===
  if (module === 'dashboard') {
    return handleDashboard(token, queryParams);
  }
  
  // === Setup ===
  if (module === 'setup') {
    return handleSetupRoute(body);
  }
  
  // === Users Management ===
  if (module === 'users') {
    return handleUsersRoute(method, recordId, token, body, queryParams);
  }
  
  // === Audit Log (read-only) ===
  if (module === 'audit_log') {
    return handleAuditLogRoute(token, queryParams);
  }
  
  // === Generic CRUD for all modules ===
  // ตรวจสอบว่าเป็น module ที่รู้จักหรือไม่
  if (!ALL_SHEETS[module] && !ALL_SHEETS[resolveModuleName(module)]) {
    return { success: false, error: 'Module not found: ' + module };
  }
  
  var tableName = resolveModuleName(module);
  
  // Authorize
  var action = (method === 'GET') ? 'read' : 'write';
  var authResult = authorize(token, getModuleCode(module), action);
  if (!authResult.success) {
    return { success: false, error: authResult.error, code: 403 };
  }
  
  switch (method) {
    case 'GET':
      if (recordId) {
        // Get single record
        var record = dbReadOne(tableName, recordId);
        if (!record) {
          return { success: false, error: 'ไม่พบข้อมูล ID: ' + recordId };
        }
        return { success: true, data: record };
      } else {
        // List records with pagination
        var filters = buildFilters(queryParams, authResult);
        var page = parseInt(queryParams.page) || 1;
        var pageSize = parseInt(queryParams.pageSize || queryParams.limit) || 20;
        var sortBy = queryParams.sortBy || 'created_at';
        var sortOrder = queryParams.sortOrder || 'desc';
        
        // ถ้ามี search
        if (queryParams.search) {
          var searchResults = dbSearch(tableName, queryParams.search);
          return { 
            success: true, 
            data: searchResults,
            total: searchResults.length,
            module: module
          };
        }
        
        return dbPaginate(tableName, filters, page, pageSize, sortBy, sortOrder);
      }
      
    case 'POST':
      return { success: true, data: dbCreate(tableName, body, authResult.user.email) };
      
    case 'PUT':
    case 'PATCH':
      if (!recordId) {
        return { success: false, error: 'ต้องระบุ ID สำหรับ update' };
      }
      return { success: true, data: dbUpdate(tableName, recordId, body, authResult.user.email) };
      
    case 'DELETE':
      if (!recordId) {
        return { success: false, error: 'ต้องระบุ ID สำหรับ delete' };
      }
      dbDelete(tableName, recordId, authResult.user.email);
      return { success: true, message: 'ลบข้อมูลแล้ว' };
      
    default:
      return { success: false, error: 'Method not supported: ' + method };
  }
}

// ============================================================
// DASHBOARD
// ============================================================

function handleDashboard(token, queryParams) {
  var authResult = authorize(token, 'dashboard', 'read');
  if (!authResult.success) {
    return { success: false, error: authResult.error };
  }
  
  var country = queryParams.country || 'TH';
  var filters = { country: country };
  
  var summary = {
    // P1 - Recruitment
    total_headcount_requests: dbCount('headcount_requests', filters),
    pending_headcount: dbCount('headcount_requests', countryFilter(country, { approval_status: 'pending' })),
    active_candidates: dbCount('candidates', countryFilter(country, { status: 'active' })),
    
    // P4 - Performance
    total_employees: dbCount('employees', filters),
    
    // Counts
    total_business_units: dbCount('business_units', filters),
    total_departments: dbCount('departments', filters),
    total_users: dbCount('users', { country: country }),
    
    // System
    module: 'dashboard',
    country: country,
    generated_at: new Date().toISOString()
  };
  
  // เพิ่มข้อมูลเฉพาะ role
  if (authResult.user.role === 'employee' && authResult.user.employee_id) {
    summary.my_evaluations = dbCount('performance_evaluations', { employee_id: authResult.user.employee_id });
    summary.my_training = dbCount('training_records', { employee_id: authResult.user.employee_id });
  }
  
  return { success: true, data: summary };
}

// ============================================================
// USERS ROUTE
// ============================================================

function handleUsersRoute(method, recordId, token, body, queryParams) {
  switch (method) {
    case 'GET':
      if (recordId) {
        var authResult = authorize(token, 'users', 'read');
        if (!authResult.success) return { success: false, error: authResult.error };
        var user = dbReadOne('users', recordId);
        if (user) {
          delete user.password_hash;
          delete user.login_token;
          delete user.token_expiry;
        }
        return { success: true, data: user };
      }
      return listUsers(token, buildFilters(queryParams, null));
      
    case 'POST':
      body._token = token;
      return createUser(body, null);
      
    case 'PUT':
    case 'PATCH':
      body._token = token;
      return updateUser(recordId, body, null);
      
    default:
      return { success: false, error: 'Method not supported for users: ' + method };
  }
}

// ============================================================
// AUDIT LOG ROUTE
// ============================================================

function handleAuditLogRoute(token, queryParams) {
  var authResult = authorize(token, 'audit_log', 'read');
  if (!authResult.success) {
    return { success: false, error: authResult.error };
  }
  
  var filters = buildFilters(queryParams, null);
  var page = parseInt(queryParams.page) || 1;
  var pageSize = parseInt(queryParams.pageSize || queryParams.limit) || 50;
  
  return dbPaginate('audit_log', filters, page, pageSize, 'created_at', 'desc');
}

// ============================================================
// SETUP ROUTE
// ============================================================

function handleSetupRoute(data) {
  if (!data || data.admin_password !== 'setup_pp7_2025') {
    return { success: false, error: 'ต้องใช้ admin password สำหรับ setup' };
  }
  return createAllTables();
}

// ============================================================
// HELPER FUNCTIONS
// ============================================================

/**
 * หาคำตอบ module code จาก module name
 */
function getModuleCode(module) {
  // module = 'headcount_requests' → 'P1'
  // module = 'employees' → 'dashboard' (ไม่ใช่ data module)
  var moduleMap = {
    'headcount_requests': 'P1',
    'candidates': 'P1',
    'recruitment_sources': 'P1',
    'interviews': 'P2',
    'assessment_results': 'P2',
    'competency_scores': 'P2',
    'position_matching': 'P3',
    'employee_assignments': 'P3',
    'performance_evaluations': 'P4',
    'evaluation_360': 'P4',
    'annual_credit': 'P4',
    'development_plans': 'P5',
    'training_records': 'P5',
    'skill_gaps': 'P5',
    'salary_records': 'P6',
    'incentives': 'P6',
    'benefits': 'P6',
    'wellbeing_records': 'P7',
    'health_records': 'P7',
    'engagement_surveys': 'P7',
    'employees': 'dashboard',
    'business_units': 'dashboard',
    'departments': 'dashboard'
  };
  
  return moduleMap[module] || 'dashboard';
}

/**
 * Resolve module name → table name
 * module อาจเป็น 'headcount_requests' หรือ 'P1_headcount_requests'
 */
function resolveModuleName(module) {
  // ถ้าตรงกับ table name ตรง ๆ
  if (ALL_SHEETS[module]) return module;
  
  // ลองหาจาก sheet name
  for (var tName in ALL_SHEETS) {
    if (ALL_SHEETS.hasOwnProperty(tName)) {
      var fullSheetName = ALL_SHEETS[tName].prefix + tName;
      if (fullSheetName === module || tName === module) {
        return tName;
      }
    }
  }
  
  return module;
}

/**
 * สร้าง filter object จาก query parameters
 */
function buildFilters(queryParams, authResult) {
  var filters = {};
  
  // Country filter
  if (queryParams.country) {
    filters.country = queryParams.country;
  }
  
  // Status filter
  if (queryParams.status) {
    filters.status = queryParams.status;
  }
  
  // Custom field filters
  for (var key in queryParams) {
    if (queryParams.hasOwnProperty(key) && 
        key !== 'path' && key !== 'token' && key !== 'method' &&
        key !== 'page' && key !== 'pageSize' && key !== 'limit' &&
        key !== 'sortBy' && key !== 'sortOrder' && key !== 'search' &&
        key !== 'country' && key !== 'status') {
      filters[key] = queryParams[key];
    }
  }
  
  // BU scope filter
  if (authResult && authResult.bu_scope && authResult.user && authResult.user.business_unit_id) {
    filters.business_unit_id = authResult.user.business_unit_id;
  }
  
  // Own only filter
  if (authResult && authResult.own_only && authResult.user && authResult.user.employee_id) {
    filters.employee_id = authResult.user.employee_id;
  }
  
  return filters;
}

/**
 * Country filter helper
 */
function countryFilter(country, extraFilters) {
  var f = { country: country };
  if (extraFilters) {
    for (var key in extraFilters) {
      if (extraFilters.hasOwnProperty(key)) {
        f[key] = extraFilters[key];
      }
    }
  }
  return f;
}

// ============================================================
// RESPONSE HELPERS
// ============================================================

/**
 * สร้าง JSON response
 */
function jsonResponse(data, statusCode) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * CORS Headers ( GAS ไม่รองรับโดยตรง แต่ใส่ไว้ใน comments )
 * ใช้ ContentService แทน
 */

// ============================================================
// WEB APP ENTRY (serves the frontend HTML)
// ============================================================

/**
 * หน้าหลัก — serve HTML frontend
 */
function serveFrontend() {
  return HtmlService.createHtmlOutputFromFile('frontend/index')
    .setTitle('ระบบบริหารบุคลากร PP7')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}
