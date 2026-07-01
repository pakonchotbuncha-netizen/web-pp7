/**
 * ===================================================================
 * Web PP7 — Google Apps Script Backend
 * Main Router: doGet / doPost
 * Sheet ID: 10x3pRnMvdEI8B3ZsMxpT905rMhtJARx_Wtx7ptcbmVU
 * ===================================================================
 */

// Global constants
var SPREADSHEET_ID = '10x3pRnMvdEI8B3ZsMxpT905rMhtJARx_Wtx7ptcbmVU';

// CORS headers — allow any origin for frontend dev / production
var CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Max-Age': '3600',
  'Content-Type': 'application/json; charset=utf-8'
};

// Table name → Sheet name mapping
var TABLE_MAP = {
  'members':          'Members',
  'p1_headcount':     'P1_Headcount',
  'p1_candidates':    'P1_Candidates',
  'p2_interviews':    'P2_Interviews',
  'p2_assessments':   'P2_Assessments',
  'p3_matching':      'P3_Matching',
  'p4_evaluations':   'P4_Evaluations',
  'p5_development':   'P5_Development',
  'p6_salary':        'P6_Salary',
  'p7_wellbeing':     'P7_Wellbeing'
};

// Primary key for each table
var PK_MAP = {
  'members':          'member_id',
  'p1_headcount':     'hc_id',
  'p1_candidates':    'candidate_id',
  'p2_interviews':    'interview_id',
  'p2_assessments':   'assessment_id',
  'p3_matching':      'match_id',
  'p4_evaluations':   'eval_id',
  'p5_development':   'dev_id',
  'p6_salary':        'salary_id',
  'p7_wellbeing':     'wb_id'
};

// ===================================================================
// doGet — Read operations via query params
// ===================================================================
function doGet(e) {
  try {
    var params = e.parameter || {};
    var action = (params.action || '').toLowerCase();

    // If no action, show API documentation
    if (!action) {
      return jsonResponse(200, getApiDocs());
    }

    var table = (params.table || '').toLowerCase();
    var id = params.id || null;

    switch (action) {
      case 'list':
        return handleList(table, params);

      case 'get':
        if (!id) return errorResponse(400, 'Missing required parameter: id');
        return handleGet(table, id);

      case 'search':
        return handleSearch(table, params);

      case 'count':
        return handleCount(table, params);

      case 'schema':
        return handleSchema(table);

      case 'tables':
        return jsonResponse(200, {
          tables: Object.keys(TABLE_MAP),
          mappings: TABLE_MAP
        });

      case 'ping':
        return jsonResponse(200, {
          status: 'ok',
          message: 'Web PP7 API is running',
          timestamp: new Date().toISOString(),
          sheet_id: SPREADSHEET_ID
        });

      default:
        return errorResponse(400, 'Unknown action: ' + action +
          '. Supported actions: list, get, search, count, schema, tables, ping');
    }
  } catch (err) {
    return errorResponse(500, 'Server error: ' + err.message, err.stack);
  }
}

// ===================================================================
// doPost — Write operations via JSON body
// ===================================================================
function doPost(e) {
  try {
    var body = parseRequestBody(e);
    var action = (body.action || '').toLowerCase();
    var table = (body.table || '').toLowerCase();

    if (!action) return errorResponse(400, 'Missing required field: action');
    if (!table)  return errorResponse(400, 'Missing required field: table');
    if (!TABLE_MAP[table]) return errorResponse(400,
      'Unknown table: ' + table + '. Use one of: ' + Object.keys(TABLE_MAP).join(', '));

    switch (action) {
      case 'create':
        if (!body.data) return errorResponse(400, 'Missing required field: data');
        return handleCreate(table, body.data, body.created_by || null);

      case 'update':
        if (!body.id)   return errorResponse(400, 'Missing required field: id');
        if (!body.data) return errorResponse(400, 'Missing required field: data');
        return handleUpdate(table, body.id, body.data);

      case 'delete':
        if (!body.id) return errorResponse(400, 'Missing required field: id');
        return handleDelete(table, body.id);

      case 'restore':
        if (!body.id) return errorResponse(400, 'Missing required field: id');
        return handleRestore(table, body.id);

      case 'bulk_create':
        if (!body.records || !Array.isArray(body.records))
          return errorResponse(400, 'Missing or invalid field: records (must be array)');
        return handleBulkCreate(table, body.records, body.created_by || null);

      case 'bulk_update':
        if (!body.updates || !Array.isArray(body.updates))
          return errorResponse(400, 'Missing or invalid field: updates (must be array of {id, data})');
        return handleBulkUpdate(table, body.updates);

      default:
        return errorResponse(400, 'Unknown action: ' + action +
          '. Supported actions: create, update, delete, restore, bulk_create, bulk_update');
    }
  } catch (err) {
    return errorResponse(500, 'Server error: ' + err.message, err.stack);
  }
}

// ===================================================================
// OPTIONS — CORS preflight
// ===================================================================
function doOptions(e) {
  return jsonResponse(204, null);
}

// ===================================================================
// Action Handlers
// ===================================================================

/**
 * List all records from a table
 * Supports: ?filter_col=value&deleted=false&sort=col&order=asc|desc&limit=N&offset=N
 */
function handleList(table, params) {
  // Build filter object from query params (exclude reserved keys)
  var reservedKeys = ['action', 'table', 'id', 'sort', 'order', 'limit', 'offset'];
  var filters = {};
  for (var key in params) {
    if (reservedKeys.indexOf(key) === -1) {
      filters[key] = params[key];
    }
  }

  var options = {
    sort: params.sort || null,
    order: (params.order || 'asc').toLowerCase(),
    limit: params.limit ? parseInt(params.limit, 10) : null,
    offset: params.offset ? parseInt(params.offset, 10) : null
  };

  var result = Database.listRecords(table, filters, options);
  return jsonResponse(200, result);
}

/**
 * Get a single record by primary key
 */
function handleGet(table, id) {
  var record = Database.getRecord(table, id);
  if (!record) {
    return errorResponse(404, 'Record not found: ' + PK_MAP[table] + '=' + id);
  }
  return jsonResponse(200, record);
}

/**
 * Search records with multiple filters
 */
function handleSearch(table, params) {
  var reservedKeys = ['action', 'table'];
  var filters = {};
  for (var key in params) {
    if (reservedKeys.indexOf(key) === -1) {
      filters[key] = params[key];
    }
  }
  var result = Database.listRecords(table, filters, {});
  return jsonResponse(200, result);
}

/**
 * Count records in a table
 */
function handleCount(table, params) {
  var reservedKeys = ['action', 'table'];
  var filters = {};
  for (var key in params) {
    if (reservedKeys.indexOf(key) === -1) {
      filters[key] = params[key];
    }
  }
  var count = Database.countRecords(table, filters);
  return jsonResponse(200, { table: table, count: count });
}

/**
 * Show schema for a table (column names and types)
 */
function handleSchema(table) {
  if (table && !TABLE_MAP[table]) {
    return errorResponse(400, 'Unknown table: ' + table);
  }
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);

  if (table) {
    return jsonResponse(200, {
      table: table,
      sheet: TABLE_MAP[table],
      primary_key: PK_MAP[table],
      headers: Database.getHeaders(table)
    });
  }

  // Return schema for all tables
  var allSchemas = {};
  for (var t in TABLE_MAP) {
    allSchemas[t] = {
      sheet: TABLE_MAP[t],
      primary_key: PK_MAP[t],
      headers: Database.getHeaders(t)
    };
  }
  return jsonResponse(200, allSchemas);
}

/**
 * Create a single record
 */
function handleCreate(table, data, createdBy) {
  var result = Database.createRecord(table, data, createdBy);
  return jsonResponse(201, result);
}

/**
 * Update a single record
 */
function handleUpdate(table, id, data) {
  var result = Database.updateRecord(table, id, data);
  return jsonResponse(200, result);
}

/**
 * Soft delete a record (set deleted=TRUE)
 * For tables without a deleted column, marks status as "deleted"
 */
function handleDelete(table, id) {
  var result = Database.deleteRecord(table, id);
  return jsonResponse(200, result);
}

/**
 * Restore a soft-deleted record
 */
function handleRestore(table, id) {
  var result = Database.restoreRecord(table, id);
  return jsonResponse(200, result);
}

/**
 * Bulk create records
 */
function handleBulkCreate(table, records, createdBy) {
  var results = [];
  var errors = [];
  for (var i = 0; i < records.length; i++) {
    try {
      var r = Database.createRecord(table, records[i], createdBy);
      results.push({ index: i, success: true, id: r.id });
    } catch (err) {
      errors.push({ index: i, success: false, error: err.message });
    }
  }
  return jsonResponse(200, {
    table: table,
    total: records.length,
    created: results.length,
    errors: errors.length,
    results: results,
    error_details: errors
  });
}

/**
 * Bulk update records
 */
function handleBulkUpdate(table, updates) {
  var results = [];
  var errors = [];
  for (var i = 0; i < updates.length; i++) {
    try {
      var u = updates[i];
      if (!u.id || !u.data) {
        throw new Error('Each update must have {id, data}');
      }
      Database.updateRecord(table, u.id, u.data);
      results.push({ index: i, id: u.id, success: true });
    } catch (err) {
      errors.push({ index: i, id: (updates[i] || {}).id, success: false, error: err.message });
    }
  }
  return jsonResponse(200, {
    table: table,
    total: updates.length,
    updated: results.length,
    errors: errors.length,
    results: results,
    error_details: errors
  });
}

// ===================================================================
// API Documentation (returned by doGet with no action)
// ===================================================================
function getApiDocs() {
  return {
    name: 'Web PP7 — Personnel Planning System API',
    version: '1.0.0',
    spreadsheet_id: SPREADSHEET_ID,
    base_url: ScriptApp.getService().getUrl(),
    endpoints: {
      ping:       'GET  /?action=ping',
      tables:     'GET  /?action=tables',
      schema:     'GET  /?action=schema&table=members (or omit table for all)',
      count:      'GET  /?action=count&table=members&bu=Engineering',
      search:     'GET  /?action=search&table=members&bu=Engineering&status=active',
      list:       'GET  /?action=list&table=members & optional: sort, order, limit, offset + any column filter',
      get:        'GET  /?action=get&table=members&id=M001',
      create:     'POST {action:"create", table:"members", data:{...}}',
      update:     'POST {action:"update", table:"members", id:"M001", data:{...}}',
      delete:     'POST {action:"delete", table:"members", id:"M001"}  → soft delete (deleted=TRUE)',
      restore:    'POST {action:"restore", table:"members", id:"M001"}  → undo soft delete',
      bulk_create:'POST {action:"bulk_create", table:"members", records:[{...},{...}]}',
      bulk_update:'POST {action:"bulk_update", table:"members", updates:[{id:"M001",data:{...}}]}'
    },
    tables: Object.keys(TABLE_MAP),
    primary_keys: PK_MAP,
    notes: [
      'GET uses query parameters, POST uses JSON body.',
      'Soft delete sets deleted=TRUE — record stays in sheet.',
      'list supports filters on any column, plus sort/order/limit/offset.',
      'CORS is enabled for all origins.',
      'POST requires Content-Type: application/json header.'
    ]
  };
}

// ===================================================================
// Helpers
// ===================================================================

/**
 * Build a JSON ContentService response
 */
function jsonResponse(statusCode, data) {
  var output = ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);

  // Note: GAS cannot set arbitrary status codes; we embed status in the body
  // The response is always 200 from GAS perspective, but status field tells the client
  if (data && typeof data === 'object' && !Array.isArray(data)) {
    data._status = statusCode;
  }

  // Add CORS headers via CacheControl (limited in GAS)
  return output;
}

/**
 * Build an error response
 */
function errorResponse(statusCode, message, stack) {
  var body = {
    _status: statusCode,
    error: true,
    message: message,
    timestamp: new Date().toISOString()
  };
  if (stack) body.stack = stack;

  return ContentService.createTextOutput(JSON.stringify(body))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Parse JSON body from doPost event
 */
function parseRequestBody(e) {
  if (e.postData && e.postData.contents) {
    try {
      return JSON.parse(e.postData.contents);
    } catch (err) {
      throw new Error('Invalid JSON in request body: ' + err.message);
    }
  }
  if (e.postData && e.postData.type === 'application/json') {
    return JSON.parse(e.postData.contents);
  }
  return {};
}
