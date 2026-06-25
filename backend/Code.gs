/**
 * Web PP7 Backend - Main Entry Point
 * Google Apps Script REST API
 * 
 * @author KiroClaw
 * @date 25 มิ.ย. 2569
 */

// Configuration
const CONFIG = {
  SPREADSHEET_ID: '', // Will be set after creating the spreadsheet
  SHEET_NAMES: {
    CONFIG: 'Config',
    USERS: 'Users',
    SESSIONS: 'Sessions',
    AUDIT_LOG: 'AuditLog',
    MEMBERS: 'Members',
    P1_HEADCOUNT: 'P1_Headcount',
    P1_RECRUITMENT: 'P1_Recruitment',
    P2_ASSESSMENT: 'P2_Assessment',
    P3_MATCHING: 'P3_Matching',
    P4_PERFORMANCE: 'P4_Performance',
    P5_DEVELOPMENT: 'P5_Development',
    P6_COMPENSATION: 'P6_Compensation',
    P7_WELFARE: 'P7_Welfare'
  },
  SESSION_EXPIRY_HOURS: 8,
  CORS_ORIGINS: ['*'], // Allow all origins for development
  API_VERSION: 'v1'
};

/**
 * Handle GET requests
 */
function doGet(e) {
  return handleRequest(e, 'GET');
}

/**
 * Handle POST requests
 */
function doPost(e) {
  return handleRequest(e, 'POST');
}

/**
 * Handle PUT requests
 */
function doPut(e) {
  return handleRequest(e, 'PUT');
}

/**
 * Handle DELETE requests
 */
function doDelete(e) {
  return handleRequest(e, 'DELETE');
}

/**
 * Main request handler - Router
 */
function handleRequest(e, method) {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Session-Token',
    'Access-Control-Max-Age': '3600'
  };

  // Handle CORS preflight
  if (e.parameter.method === 'OPTIONS' || method === 'OPTIONS') {
    return ContentService.createTextOutput('').setMimeType(ContentService.MimeType.JSON);
  }

  try {
    // Parse request
    const path = e.parameter.path || '/';
    const body = e.postData ? JSON.parse(e.postData.contents) : {};
    const headers = e.parameter || {};
    const sessionId = headers['X-Session-Token'] || e.parameter.sessionToken;

    // Route the request
    const response = routeRequest(method, path, body, sessionId);

    // Return JSON response
    return ContentService
      .createTextOutput(JSON.stringify(response))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({
        success: false,
        error: error.message,
        stack: error.stack
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Route requests to appropriate handlers
 */
function routeRequest(method, path, body, sessionId) {
  // Parse path segments
  const segments = path.split('/').filter(s => s);
  const resource = segments[0] || '';
  const resourceId = segments[1] || '';
  const subResource = segments[2] || '';

  // Public endpoints (no auth required)
  if (resource === 'auth' && segments[1] === 'login') {
    return Auth.handleLogin(body);
  }
  if (resource === 'health') {
    return { success: true, status: 'ok', version: CONFIG.API_VERSION };
  }

  // Protected endpoints (auth required)
  const session = Auth.validateSession(sessionId);
  if (!session) {
    return { success: false, error: 'Unauthorized', code: 401 };
  }

  // Route to handlers
  switch (resource) {
    case 'auth':
      if (segments[1] === 'logout') return Auth.handleLogout(sessionId);
      if (segments[1] === 'session') return Auth.handleGetSession(session);
      if (segments[1] === 'users') return handleUsers(method, resourceId, body, session);
      break;

    case 'members':
      return handleMembers(method, resourceId, body, session);

    case 'headcount':
    case 'p1-headcount':
      return handleHeadcount(method, resourceId, body, session);

    case 'recruitment':
    case 'p1-recruitment':
      return handleRecruitment(method, resourceId, body, session);

    case 'assessment':
    case 'p2-assessment':
      return handleAssessment(method, resourceId, body, session);

    case 'matching':
    case 'p3-matching':
      return handleMatching(method, resourceId, body, session);

    case 'performance':
    case 'p4-performance':
      return handlePerformance(method, resourceId, body, session);

    case 'development':
    case 'p5-development':
      return handleDevelopment(method, resourceId, body, session);

    case 'compensation':
    case 'p6-compensation':
      return handleCompensation(method, resourceId, body, session);

    case 'welfare':
    case 'p7-welfare':
      return handleWelfare(method, resourceId, body, session);

    case 'dashboard':
      return handleDashboard(method, resourceId, body, session);

    case 'config':
      return handleConfig(method, resourceId, body, session);

    case 'audit':
      return handleAudit(method, resourceId, body, session);

    default:
      return { success: false, error: 'Not found', code: 404 };
  }
}

/**
 * Handle Members CRUD
 */
function handleMembers(method, id, body, session) {
  const db = new Database();

  switch (method) {
    case 'GET':
      if (id) {
        const member = db.getById('Members', id);
        if (!member) return { success: false, error: 'Member not found', code: 404 };
        return { success: true, data: member };
      } else {
        // List with filters
        const filters = body.filters || {};
        const page = parseInt(body.page) || 1;
        const limit = parseInt(body.limit) || 50;
        const result = db.query('Members', filters, page, limit);
        return { success: true, data: result.data, total: result.total, page: page, limit: limit };
      }

    case 'POST':
      if (!Auth.hasPermission(session, 'members', 'create')) {
        return { success: false, error: 'Permission denied', code: 403 };
      }
      body.created_by = session.user_id;
      body.created_at = new Date().toISOString();
      body.updated_at = new Date().toISOString();
      body.updated_by = session.user_id;
      if (!body.member_id) body.member_id = 'EMP-' + generateId();
      const newMember = db.insert('Members', body);
      AuditLog.log(session.user_id, 'CREATE', 'Members', newMember.member_id, null, body);
      return { success: true, data: newMember };

    case 'PUT':
      if (!Auth.hasPermission(session, 'members', 'update')) {
        return { success: false, error: 'Permission denied', code: 403 };
      }
      if (!id) return { success: false, error: 'Member ID required', code: 400 };
      const existing = db.getById('Members', id);
      if (!existing) return { success: false, error: 'Member not found', code: 404 };
      body.updated_at = new Date().toISOString();
      body.updated_by = session.user_id;
      // Remove protected fields
      delete body.member_id;
      delete body.created_at;
      delete body.created_by;
      const updated = db.update('Members', id, body);
      AuditLog.log(session.user_id, 'UPDATE', 'Members', id, existing, updated);
      return { success: true, data: updated };

    case 'DELETE':
      if (!Auth.hasPermission(session, 'members', 'delete')) {
        return { success: false, error: 'Permission denied', code: 403 };
      }
      if (!id) return { success: false, error: 'Member ID required', code: 400 };
      const deleted = db.getById('Members', id);
      if (!deleted) return { success: false, error: 'Member not found', code: 404 };
      db.remove('Members', id);
      AuditLog.log(session.user_id, 'DELETE', 'Members', id, deleted, null);
      return { success: true, message: 'Member deleted' };

    default:
      return { success: false, error: 'Method not allowed', code: 405 };
  }
}

/**
 * Handle Headcount Requests CRUD
 */
function handleHeadcount(method, id, body, session) {
  const db = new Database();

  switch (method) {
    case 'GET':
      if (id) {
        const record = db.getById('P1_Headcount', id);
        if (!record) return { success: false, error: 'Record not found', code: 404 };
        return { success: true, data: record };
      } else {
        const filters = body.filters || {};
        const page = parseInt(body.page) || 1;
        const limit = parseInt(body.limit) || 50;
        const result = db.query('P1_Headcount', filters, page, limit);
        return { success: true, data: result.data, total: result.total, page: page, limit: limit };
      }

    case 'POST':
      if (!Auth.hasPermission(session, 'headcount', 'create')) {
        return { success: false, error: 'Permission denied', code: 403 };
      }
      body.created_at = new Date().toISOString();
      body.updated_at = new Date().toISOString();
      body.requested_by = session.user_id;
      if (!body.request_id) body.request_id = 'HC-' + generateId();
      const newRecord = db.insert('P1_Headcount', body);
      AuditLog.log(session.user_id, 'CREATE', 'P1_Headcount', newRecord.request_id, null, body);
      return { success: true, data: newRecord };

    case 'PUT':
      if (!id) return { success: false, error: 'Request ID required', code: 400 };
      body.updated_at = new Date().toISOString();
      const updated = db.update('P1_Headcount', id, body);
      AuditLog.log(session.user_id, 'UPDATE', 'P1_Headcount', id, null, body);
      return { success: true, data: updated };

    default:
      return { success: false, error: 'Method not allowed', code: 405 };
  }
}

/**
 * Handle Recruitment CRUD
 */
function handleRecruitment(method, id, body, session) {
  const db = new Database();

  switch (method) {
    case 'GET':
      if (id) {
        const record = db.getById('P1_Recruitment', id);
        if (!record) return { success: false, error: 'Record not found', code: 404 };
        return { success: true, data: record };
      } else {
        const filters = body.filters || {};
        const page = parseInt(body.page) || 1;
        const limit = parseInt(body.limit) || 50;
        const result = db.query('P1_Recruitment', filters, page, limit);
        return { success: true, data: result.data, total: result.total, page: page, limit: limit };
      }

    case 'POST':
      body.created_at = new Date().toISOString();
      body.updated_at = new Date().toISOString();
      if (!body.case_id) body.case_id = 'REC-' + generateId();
      const newRecord = db.insert('P1_Recruitment', body);
      AuditLog.log(session.user_id, 'CREATE', 'P1_Recruitment', newRecord.case_id, null, body);
      return { success: true, data: newRecord };

    case 'PUT':
      if (!id) return { success: false, error: 'Case ID required', code: 400 };
      body.updated_at = new Date().toISOString();
      const updated = db.update('P1_Recruitment', id, body);
      AuditLog.log(session.user_id, 'UPDATE', 'P1_Recruitment', id, null, body);
      return { success: true, data: updated };

    default:
      return { success: false, error: 'Method not allowed', code: 405 };
  }
}

/**
 * Handle Assessment CRUD
 */
function handleAssessment(method, id, body, session) {
  const db = new Database();

  switch (method) {
    case 'GET':
      if (id) {
        const record = db.getById('P2_Assessment', id);
        if (!record) return { success: false, error: 'Record not found', code: 404 };
        return { success: true, data: record };
      } else {
        const filters = body.filters || {};
        const result = db.query('P2_Assessment', filters, 1, 100);
        return { success: true, data: result.data, total: result.total };
      }

    case 'POST':
      body.created_at = new Date().toISOString();
      body.updated_at = new Date().toISOString();
      if (!body.assessment_id) body.assessment_id = 'ASM-' + generateId();
      return { success: true, data: db.insert('P2_Assessment', body) };

    case 'PUT':
      if (!id) return { success: false, error: 'Assessment ID required', code: 400 };
      body.updated_at = new Date().toISOString();
      return { success: true, data: db.update('P2_Assessment', id, body) };

    default:
      return { success: false, error: 'Method not allowed', code: 405 };
  }
}

/**
 * Handle Matching CRUD
 */
function handleMatching(method, id, body, session) {
  const db = new Database();

  switch (method) {
    case 'GET':
      if (id) {
        return { success: true, data: db.getById('P3_Matching', id) };
      } else {
        const result = db.query('P3_Matching', body.filters || {}, 1, 100);
        return { success: true, data: result.data, total: result.total };
      }

    case 'POST':
      body.created_at = new Date().toISOString();
      body.updated_at = new Date().toISOString();
      if (!body.match_id) body.match_id = 'MAT-' + generateId();
      return { success: true, data: db.insert('P3_Matching', body) };

    case 'PUT':
      if (!id) return { success: false, error: 'Match ID required', code: 400 };
      body.updated_at = new Date().toISOString();
      return { success: true, data: db.update('P3_Matching', id, body) };

    default:
      return { success: false, error: 'Method not allowed', code: 405 };
  }
}

/**
 * Handle Performance CRUD
 */
function handlePerformance(method, id, body, session) {
  const db = new Database();

  switch (method) {
    case 'GET':
      if (id) {
        return { success: true, data: db.getById('P4_Performance', id) };
      } else {
        const result = db.query('P4_Performance', body.filters || {}, 1, 100);
        return { success: true, data: result.data, total: result.total };
      }

    case 'POST':
      body.created_at = new Date().toISOString();
      body.updated_at = new Date().toISOString();
      if (!body.eval_id) body.eval_id = 'PER-' + generateId();
      return { success: true, data: db.insert('P4_Performance', body) };

    case 'PUT':
      if (!id) return { success: false, error: 'Eval ID required', code: 400 };
      body.updated_at = new Date().toISOString();
      return { success: true, data: db.update('P4_Performance', id, body) };

    default:
      return { success: false, error: 'Method not allowed', code: 405 };
  }
}

/**
 * Handle Development CRUD
 */
function handleDevelopment(method, id, body, session) {
  const db = new Database();

  switch (method) {
    case 'GET':
      if (id) {
        return { success: true, data: db.getById('P5_Development', id) };
      } else {
        const result = db.query('P5_Development', body.filters || {}, 1, 100);
        return { success: true, data: result.data, total: result.total };
      }

    case 'POST':
      body.created_at = new Date().toISOString();
      body.updated_at = new Date().toISOString();
      if (!body.dev_id) body.dev_id = 'DEV-' + generateId();
      return { success: true, data: db.insert('P5_Development', body) };

    case 'PUT':
      if (!id) return { success: false, error: 'Dev ID required', code: 400 };
      body.updated_at = new Date().toISOString();
      return { success: true, data: db.update('P5_Development', id, body) };

    default:
      return { success: false, error: 'Method not allowed', code: 405 };
  }
}

/**
 * Handle Compensation CRUD
 */
function handleCompensation(method, id, body, session) {
  const db = new Database();

  switch (method) {
    case 'GET':
      if (id) {
        return { success: true, data: db.getById('P6_Compensation', id) };
      } else {
        const result = db.query('P6_Compensation', body.filters || {}, 1, 100);
        return { success: true, data: result.data, total: result.total };
      }

    case 'POST':
      body.created_at = new Date().toISOString();
      body.updated_at = new Date().toISOString();
      if (!body.comp_id) body.comp_id = 'CMP-' + generateId();
      return { success: true, data: db.insert('P6_Compensation', body) };

    case 'PUT':
      if (!id) return { success: false, error: 'Comp ID required', code: 400 };
      body.updated_at = new Date().toISOString();
      return { success: true, data: db.update('P6_Compensation', id, body) };

    default:
      return { success: false, error: 'Method not allowed', code: 405 };
  }
}

/**
 * Handle Welfare CRUD
 */
function handleWelfare(method, id, body, session) {
  const db = new Database();

  switch (method) {
    case 'GET':
      if (id) {
        return { success: true, data: db.getById('P7_Welfare', id) };
      } else {
        const result = db.query('P7_Welfare', body.filters || {}, 1, 100);
        return { success: true, data: result.data, total: result.total };
      }

    case 'POST':
      body.created_at = new Date().toISOString();
      body.updated_at = new Date().toISOString();
      if (!body.welfare_id) body.welfare_id = 'WEL-' + generateId();
      return { success: true, data: db.insert('P7_Welfare', body) };

    case 'PUT':
      if (!id) return { success: false, error: 'Welfare ID required', code: 400 };
      body.updated_at = new Date().toISOString();
      return { success: true, data: db.update('P7_Welfare', id, body) };

    default:
      return { success: false, error: 'Method not allowed', code: 405 };
  }
}

/**
 * Handle Dashboard requests
 */
function handleDashboard(method, id, body, session) {
  const db = new Database();

  const dashboard = {
    total_members: db.query('Members', { status: 'regular' }, 1, 1).total,
    active_recruitments: db.query('P1_Recruitment', { status: 'screening' }, 1, 1).total,
    pending_headcount: db.query('P1_Headcount', { status: 'pending' }, 1, 1).total,
    pending_assessments: db.query('P2_Assessment', { status: 'pending' }, 1, 1).total,
    upcoming_evaluations: db.query('P4_Performance', { status: 'draft' }, 1, 1).total
  };

  return { success: true, data: dashboard };
}

/**
 * Handle Config
 */
function handleConfig(method, id, body, session) {
  if (!Auth.hasPermission(session, 'config', 'manage')) {
    return { success: false, error: 'Permission denied', code: 403 };
  }
  const db = new Database();

  switch (method) {
    case 'GET':
      if (id) return { success: true, data: db.getConfig(id) };
      return { success: true, data: db.getAllConfig() };

    case 'PUT':
      if (!id) return { success: false, error: 'Config key required', code: 400 };
      db.setConfig(id, body.value, body.type || 'string', session.user_id);
      return { success: true, message: 'Config updated' };

    default:
      return { success: false, error: 'Method not allowed', code: 405 };
  }
}

/**
 * Handle Audit Log
 */
function handleAudit(method, id, body, session) {
  if (!Auth.isAdmin(session)) {
    return { success: false, error: 'Admin only', code: 403 };
  }
  const db = new Database();

  switch (method) {
    case 'GET':
      const page = parseInt(body.page) || 1;
      const limit = parseInt(body.limit) || 100;
      const result = db.query('AuditLog', body.filters || {}, page, limit);
      return { success: true, data: result.data, total: result.total };

    default:
      return { success: false, error: 'Method not allowed', code: 405 };
  }
}

/**
 * Handle Users CRUD
 */
function handleUsers(method, id, body, session) {
  if (!Auth.isAdmin(session)) {
    return { success: false, error: 'Admin only', code: 403 };
  }
  const db = new Database();

  switch (method) {
    case 'GET':
      if (id) {
        return { success: true, data: db.getById('Users', id) };
      } else {
        const result = db.query('Users', body.filters || {}, 1, 100);
        return { success: true, data: result.data, total: result.total };
      }

    case 'POST':
      body.created_at = new Date().toISOString();
      if (!body.user_id) body.user_id = generateUUID();
      return { success: true, data: db.insert('Users', body) };

    case 'PUT':
      if (!id) return { success: false, error: 'User ID required', code: 400 };
      return { success: true, data: db.update('Users', id, body) };

    default:
      return { success: false, error: 'Method not allowed', code: 405 };
  }
}

// ===== Helper Functions =====

/**
 * Generate a short unique ID
 */
function generateId() {
  return Utilities.getUuid().replace(/-/g, '').substring(0, 8).toUpperCase();
}

/**
 * Generate a standard UUID
 */
function generateUUID() {
  return Utilities.getUuid();
}
