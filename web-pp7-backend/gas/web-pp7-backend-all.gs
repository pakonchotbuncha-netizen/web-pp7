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
/**
 * ===================================================================
 * Web PP7 — Database Layer
 * CRUD operations for Google Sheets
 * Sheet ID: 10x3pRnMvdEI8B3ZsMxpT905rMhtJARx_Wtx7ptcbmVU
 * ===================================================================
 */

var Database = (function() {
  'use strict';

  var ss = null;

  // Initialize spreadsheet connection
  function init() {
    if (!ss) {
      ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    }
    return ss;
  }

  // Get sheet by table name
  function getSheet(table) {
    var sheetName = TABLE_MAP[table];
    if (!sheetName) {
      throw new Error('Unknown table: ' + table);
    }
    var sheet = init().getSheetByName(sheetName);
    if (!sheet) {
      throw new Error('Sheet not found: ' + sheetName);
    }
    return sheet;
  }

  // Get headers for a table
  function getHeaders(table) {
    var sheet = getSheet(table);
    var lastCol = sheet.getLastColumn();
    if (lastCol === 0) return [];
    return sheet.getRange(1, 1, 1, lastCol).getValues()[0];
  }

  // Get column index (1-based) for a header
  function getColumnIndex(headers, colName) {
    var idx = headers.indexOf(colName);
    return idx === -1 ? -1 : idx + 1;
  }

  // Read all rows as array of objects
  function readAll(table, includeDeleted) {
    var sheet = getSheet(table);
    var headers = getHeaders(table);
    var lastRow = sheet.getLastRow();
    var lastCol = sheet.getLastColumn();

    if (lastRow <= 1 || lastCol === 0) {
      return []; // Only headers or empty
    }

    var data = sheet.getRange(2, 1, lastRow - 1, lastCol).getValues();
    var records = [];

    for (var i = 0; i < data.length; i++) {
      var row = data[i];
      var record = {};
      var hasData = false;

      for (var j = 0; j < headers.length; j++) {
        var val = row[j];
        // Convert Date objects to ISO strings
        if (val instanceof Date) {
          val = val.toISOString();
        }
        record[headers[j]] = val;
        if (val !== '' && val !== null && val !== undefined) {
          hasData = true;
        }
      }

      // Skip completely empty rows
      if (!hasData) continue;

      // Filter out soft-deleted records unless explicitly requested
      if (!includeDeleted && hasDeletedColumn(table)) {
        var deletedVal = record['deleted'];
        if (deletedVal === true || deletedVal === 'TRUE' || deletedVal === 'true' || deletedVal === 'Yes') {
          continue;
        }
      }

      records.push(record);
    }

    return records;
  }

  // Check if table has a 'deleted' column
  function hasDeletedColumn(table) {
    var headers = getHeaders(table);
    return headers.indexOf('deleted') !== -1;
  }

  // ===================================================================
  // PUBLIC API
  // ===================================================================

  return {
    /**
     * Get headers for a table
     */
    getHeaders: getHeaders,

    /**
     * List records with filters and options
     */
    listRecords: function(table, filters, options) {
      var allRecords = readAll(table, false); // exclude deleted by default
      var headers = getHeaders(table);

      // Apply filters
      var filtered = allRecords;
      for (var key in filters) {
        filtered = filtered.filter(function(record) {
          var recordVal = String(record[key] || '').toLowerCase();
          var filterVal = String(filters[key]).toLowerCase();
          return recordVal === filterVal;
        });
      }

      // Apply sorting
      if (options.sort) {
        var sortCol = options.sort;
        var sortOrder = options.order === 'desc' ? -1 : 1;
        filtered.sort(function(a, b) {
          var va = a[sortCol];
          var vb = b[sortCol];
          if (va === vb) return 0;
          if (va === null || va === undefined || va === '') return 1;
          if (vb === null || vb === undefined || vb === '') return -1;
          // Try numeric comparison
          var na = parseFloat(va);
          var nb = parseFloat(vb);
          if (!isNaN(na) && !isNaN(nb)) {
            return (na - nb) * sortOrder;
          }
          // String comparison
          return String(va).localeCompare(String(vb)) * sortOrder;
        });
      }

      // Pagination
      var total = filtered.length;
      if (options.offset) {
        filtered = filtered.slice(options.offset);
      }
      if (options.limit) {
        filtered = filtered.slice(0, options.limit);
      }

      return {
        table: table,
        count: filtered.length,
        total: total,
        records: filtered,
        headers: headers
      };
    },

    /**
     * Get a single record by primary key
     */
    getRecord: function(table, id) {
      var pk = PK_MAP[table];
      if (!pk) throw new Error('No primary key defined for table: ' + table);

      var allRecords = readAll(table, true); // include deleted for get
      for (var i = 0; i < allRecords.length; i++) {
        if (String(allRecords[i][pk]) === String(id)) {
          return allRecords[i];
        }
      }
      return null;
    },

    /**
     * Count records with optional filters
     */
    countRecords: function(table, filters) {
      var allRecords = readAll(table, false);
      if (!filters || Object.keys(filters).length === 0) {
        return allRecords.length;
      }

      var filtered = allRecords;
      for (var key in filters) {
        filtered = filtered.filter(function(record) {
          return String(record[key] || '').toLowerCase() === String(filters[key]).toLowerCase();
        });
      }
      return filtered.length;
    },

    /**
     * Create a new record
     */
    createRecord: function(table, data, createdBy) {
      var sheet = getSheet(table);
      var headers = getHeaders(table);
      var pk = PK_MAP[table];

      // Auto-generate primary key if not provided
      if (!data[pk]) {
        data[pk] = generateId(table);
      }

      // Auto-set timestamps
      var now = new Date().toISOString();
      if (headers.indexOf('created_at') !== -1 && !data.created_at) {
        data.created_at = now;
      }
      if (headers.indexOf('updated_at') !== -1) {
        data.updated_at = now;
      }
      if (headers.indexOf('created_by') !== -1 && createdBy) {
        data.created_by = createdBy;
      }

      // Build row array matching header order
      var row = [];
      for (var i = 0; i < headers.length; i++) {
        var col = headers[i];
        var val = data[col];
        if (val === undefined || val === null) {
          val = '';
        }
        row.push(val);
      }

      // Append row to sheet
      sheet.appendRow(row);

      return {
        success: true,
        id: data[pk],
        message: 'Record created successfully',
        record: data
      };
    },

    /**
     * Update an existing record
     */
    updateRecord: function(table, id, data) {
      var sheet = getSheet(table);
      var headers = getHeaders(table);
      var pk = PK_MAP[table];
      var pkCol = getColumnIndex(headers, pk);

      if (pkCol === 0) {
        throw new Error('Primary key column not found: ' + pk);
      }

      // Find the row
      var lastRow = sheet.getLastRow();
      if (lastRow < 2) {
        throw new Error('Table is empty, record not found');
      }

      var idValues = sheet.getRange(2, pkCol, lastRow - 1, 1).getValues();
      var foundRow = -1;

      for (var i = 0; i < idValues.length; i++) {
        if (String(idValues[i][0]) === String(id)) {
          foundRow = i + 2; // +2 because getRange starts at row 2
          break;
        }
      }

      if (foundRow === -1) {
        throw new Error('Record not found: ' + pk + '=' + id);
      }

      // Set updated_at if column exists
      if (headers.indexOf('updated_at') !== -1) {
        data.updated_at = new Date().toISOString();
      }

      // Update only provided fields
      var currentRow = sheet.getRange(foundRow, 1, 1, headers.length).getValues()[0];
      for (var j = 0; j < headers.length; j++) {
        var col = headers[j];
        if (data.hasOwnProperty(col)) {
          var val = data[col];
          if (val === null) val = '';
          currentRow[j] = val;
        }
      }

      sheet.getRange(foundRow, 1, 1, headers.length).setValues([currentRow]);

      return {
        success: true,
        id: id,
        message: 'Record updated successfully',
        updated_fields: Object.keys(data)
      };
    },

    /**
     * Soft delete a record (set deleted=TRUE or status=deleted)
     */
    deleteRecord: function(table, id) {
      var sheet = getSheet(table);
      var headers = getHeaders(table);
      var pk = PK_MAP[table];
      var pkCol = getColumnIndex(headers, pk);

      if (pkCol === 0) {
        throw new Error('Primary key column not found: ' + pk);
      }

      // Find the row
      var lastRow = sheet.getLastRow();
      if (lastRow < 2) {
        throw new Error('Table is empty, record not found');
      }

      var idValues = sheet.getRange(2, pkCol, lastRow - 1, 1).getValues();
      var foundRow = -1;

      for (var i = 0; i < idValues.length; i++) {
        if (String(idValues[i][0]) === String(id)) {
          foundRow = i + 2;
          break;
        }
      }

      if (foundRow === -1) {
        throw new Error('Record not found: ' + pk + '=' + id);
      }

      var currentRow = sheet.getRange(foundRow, 1, 1, headers.length).getValues()[0];

      // Prefer soft delete via 'deleted' column
      if (headers.indexOf('deleted') !== -1) {
        var deletedIdx = headers.indexOf('deleted');
        currentRow[deletedIdx] = 'TRUE';
      } else if (headers.indexOf('status') !== -1) {
        // Fallback: set status to 'deleted'
        var statusIdx = headers.indexOf('status');
        currentRow[statusIdx] = 'deleted';
      }

      // Update updated_at if exists
      if (headers.indexOf('updated_at') !== -1) {
        var updatedIdx = headers.indexOf('updated_at');
        currentRow[updatedIdx] = new Date().toISOString();
      }

      sheet.getRange(foundRow, 1, 1, headers.length).setValues([currentRow]);

      return {
        success: true,
        id: id,
        message: 'Record deleted (soft delete)',
        method: headers.indexOf('deleted') !== -1 ? 'deleted=TRUE' : 'status=deleted'
      };
    },

    /**
     * Restore a soft-deleted record
     */
    restoreRecord: function(table, id) {
      var sheet = getSheet(table);
      var headers = getHeaders(table);
      var pk = PK_MAP[table];
      var pkCol = getColumnIndex(headers, pk);

      if (pkCol === 0) {
        throw new Error('Primary key column not found: ' + pk);
      }

      // Find the row
      var lastRow = sheet.getLastRow();
      if (lastRow < 2) {
        throw new Error('Table is empty, record not found');
      }

      var idValues = sheet.getRange(2, pkCol, lastRow - 1, 1).getValues();
      var foundRow = -1;

      for (var i = 0; i < idValues.length; i++) {
        if (String(idValues[i][0]) === String(id)) {
          foundRow = i + 2;
          break;
        }
      }

      if (foundRow === -1) {
        throw new Error('Record not found: ' + pk + '=' + id);
      }

      var currentRow = sheet.getRange(foundRow, 1, 1, headers.length).getValues()[0];

      // Restore via 'deleted' column
      if (headers.indexOf('deleted') !== -1) {
        var deletedIdx = headers.indexOf('deleted');
        currentRow[deletedIdx] = 'FALSE';
      } else if (headers.indexOf('status') !== -1) {
        // Fallback: set status back to 'active'
        var statusIdx = headers.indexOf('status');
        currentRow[statusIdx] = 'active';
      }

      // Update updated_at if exists
      if (headers.indexOf('updated_at') !== -1) {
        var updatedIdx = headers.indexOf('updated_at');
        currentRow[updatedIdx] = new Date().toISOString();
      }

      sheet.getRange(foundRow, 1, 1, headers.length).setValues([currentRow]);

      return {
        success: true,
        id: id,
        message: 'Record restored successfully'
      };
    }
  };

  // ===================================================================
  // PRIVATE HELPERS
  // ===================================================================

  /**
   * Generate a unique ID for a table
   * Pattern: PREFIX-NNNN (e.g., M-0001, HC-0001, etc.)
   */
  function generateId(table) {
    var prefixMap = {
      'members': 'M',
      'p1_headcount': 'HC',
      'p1_candidates': 'C',
      'p2_interviews': 'IV',
      'p2_assessments': 'AS',
      'p3_matching': 'MA',
      'p4_evaluations': 'EV',
      'p5_development': 'DV',
      'p6_salary': 'SA',
      'p7_wellbeing': 'WB'
    };

    var prefix = prefixMap[table] || 'ID';
    var sheet = getSheet(table);
    var pk = PK_MAP[table];
    var headers = getHeaders(table);
    var pkCol = getColumnIndex(headers, pk);

    if (pkCol === 0) {
      return prefix + '-' + Date.now();
    }

    var lastRow = sheet.getLastRow();
    var maxNum = 0;

    if (lastRow > 1) {
      var idValues = sheet.getRange(2, pkCol, lastRow - 1, 1).getValues();
      for (var i = 0; i < idValues.length; i++) {
        var idStr = String(idValues[i][0]);
        var parts = idStr.split('-');
        if (parts.length >= 2) {
          var num = parseInt(parts[parts.length - 1], 10);
          if (!isNaN(num) && num > maxNum) {
            maxNum = num;
          }
        }
      }
    }

    var nextNum = maxNum + 1;
    var padded = ('0000' + nextNum).slice(-4);
    return prefix + '-' + padded;
  }

})(); // End Database IIFE
/**
 * ===================================================================
 * Web PP7 — Utility Functions
 * Validation, helpers, and common operations
 * ===================================================================
 */

var Utils = (function() {
  'use strict';

  return {
    /**
     * Validate email format
     */
    isValidEmail: function(email) {
      var re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return re.test(email);
    },

    /**
     * Validate phone number (Thai format: 0X-XXX-XXXX or 0XXXXXXXXX)
     */
    isValidThaiPhone: function(phone) {
      var re = /^0\d{1,2}-?\d{3}-?\d{4}$/;
      return re.test(phone);
    },

    /**
     * Validate date format (YYYY-MM-DD or ISO string)
     */
    isValidDate: function(dateStr) {
      if (!dateStr) return false;
      var date = new Date(dateStr);
      return !isNaN(date.getTime());
    },

    /**
     * Format date to YYYY-MM-DD
     */
    formatDate: function(date) {
      if (!date) return '';
      if (typeof date === 'string') date = new Date(date);
      var year = date.getFullYear();
      var month = ('0' + (date.getMonth() + 1)).slice(-2);
      var day = ('0' + date.getDate()).slice(-2);
      return year + '-' + month + '-' + day;
    },

    /**
     * Format date to Thai locale (DD/MM/YYYY)
     */
    formatDateThai: function(date) {
      if (!date) return '';
      if (typeof date === 'string') date = new Date(date);
      var year = date.getFullYear() + 543; // Convert to Buddhist year
      var month = ('0' + (date.getMonth() + 1)).slice(-2);
      var day = ('0' + date.getDate()).slice(-2);
      return day + '/' + month + '/' + year;
    },

    /**
     * Parse comma-separated string to array
     */
    csvToArray: function(csvStr) {
      if (!csvStr || typeof csvStr !== 'string') return [];
      return csvStr.split(',').map(function(item) {
        return item.trim();
      }).filter(function(item) {
        return item.length > 0;
      });
    },

    /**
     * Convert array to comma-separated string
     */
    arrayToCsv: function(arr) {
      if (!Array.isArray(arr)) return '';
      return arr.join(',');
    },

    /**
     * Calculate CC scores total (1-5)
     * CC = Competency & Character scores
     */
    calculateCCTotal: function(scores) {
      var total = 0;
      var count = 0;
      for (var i = 1; i <= 5; i++) {
        var key = 'cc' + i + '_score';
        if (scores[key] !== undefined && scores[key] !== null && scores[key] !== '') {
          var val = parseFloat(scores[key]);
          if (!isNaN(val) && val >= 1 && val <= 5) {
            total += val;
            count++;
          }
        }
      }
      return {
        total: total,
        count: count,
        average: count > 0 ? (total / count).toFixed(2) : 0
      };
    },

    /**
     * Validate CC score (must be 1-5)
     */
    isValidCCScore: function(score) {
      var num = parseFloat(score);
      return !isNaN(num) && num >= 1 && num <= 5 && num % 1 === 0;
    },

    /**
     * Calculate salary components
     */
    calculateNetSalary: function(base, allowances, deductions) {
      base = parseFloat(base) || 0;
      allowances = parseFloat(allowances) || 0;
      deductions = parseFloat(deductions) || 0;
      return {
        base: base,
        allowances: allowances,
        deductions: deductions,
        gross: base + allowances,
        net: base + allowances - deductions
      };
    },

    /**
     * Generate timestamp string
     */
    timestamp: function() {
      return new Date().toISOString();
    },

    /**
     * Deep clone an object
     */
    clone: function(obj) {
      return JSON.parse(JSON.stringify(obj));
    },

    /**
     * Check if value is empty (null, undefined, empty string, or empty array)
     */
    isEmpty: function(val) {
      if (val === null || val === undefined || val === '') return true;
      if (Array.isArray(val) && val.length === 0) return true;
      if (typeof val === 'object' && Object.keys(val).length === 0) return true;
      return false;
    },

    /**
     * Sanitize string (remove special chars, trim)
     */
    sanitize: function(str) {
      if (!str || typeof str !== 'string') return '';
      return str.replace(/[<>\"']/g, '').trim();
    },

    /**
     * Generate a random string
     */
    randomString: function(length) {
      var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      var result = '';
      for (var i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return result;
    },

    /**
     * Parse query string to object
     */
    parseQueryString: function(queryString) {
      var params = {};
      if (!queryString) return params;
      queryString = queryString.replace(/^\?/, '');
      var pairs = queryString.split('&');
      for (var i = 0; i < pairs.length; i++) {
        var pair = pairs[i].split('=');
        var key = decodeURIComponent(pair[0]);
        var value = pair.length > 1 ? decodeURIComponent(pair[1]) : '';
        params[key] = value;
      }
      return params;
    },

    /**
     * Convert object to query string
     */
    toQueryString: function(obj) {
      var parts = [];
      for (var key in obj) {
        if (obj.hasOwnProperty(key) && obj[key] !== null && obj[key] !== undefined) {
          parts.push(encodeURIComponent(key) + '=' + encodeURIComponent(obj[key]));
        }
      }
      return parts.join('&');
    },

    /**
     * Validate that required fields are present
     */
    validateRequired: function(data, requiredFields) {
      var missing = [];
      for (var i = 0; i < requiredFields.length; i++) {
        var field = requiredFields[i];
        if (!data.hasOwnProperty(field) || this.isEmpty(data[field])) {
          missing.push(field);
        }
      }
      return {
        valid: missing.length === 0,
        missing: missing
      };
    },

    /**
     * Merge two objects (shallow merge)
     */
    merge: function(target, source) {
      var result = this.clone(target);
      for (var key in source) {
        if (source.hasOwnProperty(key)) {
          result[key] = source[key];
        }
      }
      return result;
    },

    /**
     * Pick specific keys from an object
     */
    pick: function(obj, keys) {
      var result = {};
      for (var i = 0; i < keys.length; i++) {
        var key = keys[i];
        if (obj.hasOwnProperty(key)) {
          result[key] = obj[key];
        }
      }
      return result;
    },

    /**
     * Omit specific keys from an object
     */
    omit: function(obj, keys) {
      var result = this.clone(obj);
      for (var i = 0; i < keys.length; i++) {
        delete result[keys[i]];
      }
      return result;
    },

    /**
     * Log with timestamp
     */
    log: function(message, data) {
      var timestamp = new Date().toISOString();
      var logMsg = '[' + timestamp + '] ' + message;
      if (data) {
        Logger.log(logMsg + ': ' + JSON.stringify(data));
      } else {
        Logger.log(logMsg);
      }
    },

    /**
     * Error logging
     */
    logError: function(message, error) {
      var timestamp = new Date().toISOString();
      Logger.log('[' + timestamp + '] ERROR: ' + message);
      if (error) {
        Logger.log('Stack: ' + (error.stack || error.message || error));
      }
    }
  };

})(); // End Utils IIFE

// ===================================================================
// Validations — Table-specific validation rules
// ===================================================================

var Validations = {
  /**
   * Validate member data
   */
  member: function(data) {
    var required = ['emp_code', 'full_name', 'bu', 'department', 'position', 'status'];
    var check = Utils.validateRequired(data, required);
    if (!check.valid) {
      throw new Error('Missing required fields: ' + check.missing.join(', '));
    }

    // Validate email if provided
    if (data.email && !Utils.isValidEmail(data.email)) {
      throw new Error('Invalid email format: ' + data.email);
    }

    // Validate phone if provided
    if (data.phone && !Utils.isValidThaiPhone(data.phone)) {
      throw new Error('Invalid phone format: ' + data.phone);
    }

    // Validate status values
    var validStatuses = ['active', 'inactive', 'terminated', 'resigned', 'probation'];
    if (data.status && validStatuses.indexOf(data.status) === -1) {
      throw new Error('Invalid status: ' + data.status + '. Must be one of: ' + validStatuses.join(', '));
    }

    return true;
  },

  /**
   * Validate headcount request
   */
  headcount: function(data) {
    var required = ['bu', 'department', 'position', 'quantity', 'priority'];
    var check = Utils.validateRequired(data, required);
    if (!check.valid) {
      throw new Error('Missing required fields: ' + check.missing.join(', '));
    }

    // Validate quantity is positive integer
    var qty = parseInt(data.quantity, 10);
    if (isNaN(qty) || qty < 1) {
      throw new Error('Quantity must be a positive integer');
    }

    // Validate priority
    var validPriorities = ['high', 'medium', 'low', 'urgent'];
    if (data.priority && validPriorities.indexOf(data.priority) === -1) {
      throw new Error('Invalid priority: ' + data.priority);
    }

    return true;
  },

  /**
   * Validate candidate data
   */
  candidate: function(data) {
    var required = ['first_name', 'last_name', 'email', 'position_applied'];
    var check = Utils.validateRequired(data, required);
    if (!check.valid) {
      throw new Error('Missing required fields: ' + check.missing.join(', '));
    }

    // Validate email
    if (data.email && !Utils.isValidEmail(data.email)) {
      throw new Error('Invalid email format: ' + data.email);
    }

    // Validate stage
    var validStages = ['applied', 'screened', 'interview', 'assessment', 'offer', 'hired', 'rejected'];
    if (data.stage && validStages.indexOf(data.stage) === -1) {
      throw new Error('Invalid stage: ' + data.stage);
    }

    return true;
  },

  /**
   * Validate interview data
   */
  interview: function(data) {
    var required = ['candidate_id', 'interview_date', 'interviewer', 'type'];
    var check = Utils.validateRequired(data, required);
    if (!check.valid) {
      throw new Error('Missing required fields: ' + check.missing.join(', '));
    }

    // Validate date
    if (data.interview_date && !Utils.isValidDate(data.interview_date)) {
      throw new Error('Invalid interview_date format');
    }

    // Validate type
    var validTypes = ['screening', 'technical', 'cultural', 'final', 'panel'];
    if (data.type && validTypes.indexOf(data.type) === -1) {
      throw new Error('Invalid interview type: ' + data.type);
    }

    return true;
  },

  /**
   * Validate assessment data
   */
  assessment: function(data) {
    var required = ['candidate_id', 'assessor', 'assessment_date'];
    var check = Utils.validateRequired(data, required);
    if (!check.valid) {
      throw new Error('Missing required fields: ' + check.missing.join(', '));
    }

    // Validate CC scores (1-5)
    for (var i = 1; i <= 5; i++) {
      var key = 'cc' + i + '_score';
      if (data[key] !== undefined && data[key] !== null && data[key] !== '') {
        if (!Utils.isValidCCScore(data[key])) {
          throw new Error(key + ' must be an integer between 1 and 5');
        }
      }
    }

    return true;
  },

  /**
   * Validate matching data
   */
  matching: function(data) {
    var required = ['member_id', 'candidate_id', 'position', 'bu'];
    var check = Utils.validateRequired(data, required);
    if (!check.valid) {
      throw new Error('Missing required fields: ' + check.missing.join(', '));
    }

    // Validate match_score (0-100)
    if (data.match_score !== undefined && data.match_score !== null) {
      var score = parseFloat(data.match_score);
      if (isNaN(score) || score < 0 || score > 100) {
        throw new Error('match_score must be between 0 and 100');
      }
    }

    return true;
  },

  /**
   * Validate evaluation data
   */
  evaluation: function(data) {
    var required = ['member_id', 'eval_year', 'eval_period', 'evaluator_id', 'eval_type'];
    var check = Utils.validateRequired(data, required);
    if (!check.valid) {
      throw new Error('Missing required fields: ' + check.missing.join(', '));
    }

    // Validate eval_year
    var year = parseInt(data.eval_year, 10);
    if (isNaN(year) || year < 2020 || year > 2099) {
      throw new Error('Invalid eval_year');
    }

    // Validate eval_period
    var validPeriods = ['Q1', 'Q2', 'Q3', 'Q4', 'H1', 'H2', 'annual'];
    if (data.eval_period && validPeriods.indexOf(data.eval_period.toUpperCase()) === -1) {
      throw new Error('Invalid eval_period: ' + data.eval_period);
    }

    // Validate CC scores
    for (var i = 1; i <= 5; i++) {
      var key = 'cc' + i + '_score';
      if (data[key] !== undefined && data[key] !== null && data[key] !== '') {
        if (!Utils.isValidCCScore(data[key])) {
          throw new Error(key + ' must be an integer between 1 and 5');
        }
      }
    }

    return true;
  },

  /**
   * Validate development plan
   */
  development: function(data) {
    var required = ['member_id', 'training_type', 'topic', 'start_date', 'end_date'];
    var check = Utils.validateRequired(data, required);
    if (!check.valid) {
      throw new Error('Missing required fields: ' + check.missing.join(', '));
    }

    // Validate dates
    if (!Utils.isValidDate(data.start_date) || !Utils.isValidDate(data.end_date)) {
      throw new Error('Invalid date format for start_date or end_date');
    }

    // Validate completion_pct (0-100)
    if (data.completion_pct !== undefined && data.completion_pct !== null) {
      var pct = parseFloat(data.completion_pct);
      if (isNaN(pct) || pct < 0 || pct > 100) {
        throw new Error('completion_pct must be between 0 and 100');
      }
    }

    return true;
  },

  /**
   * Validate salary data
   */
  salary: function(data) {
    var required = ['member_id', 'base_salary', 'pay_period', 'pay_date'];
    var check = Utils.validateRequired(data, required);
    if (!check.valid) {
      throw new Error('Missing required fields: ' + check.missing.join(', '));
    }

    // Validate base_salary is positive
    var base = parseFloat(data.base_salary);
    if (isNaN(base) || base < 0) {
      throw new Error('base_salary must be a positive number');
    }

    // Validate pay_date
    if (!Utils.isValidDate(data.pay_date)) {
      throw new Error('Invalid pay_date format');
    }

    return true;
  },

  /**
   * Validate wellbeing data
   */
  wellbeing: function(data) {
    var required = ['member_id', 'category', 'survey_date'];
    var check = Utils.validateRequired(data, required);
    if (!check.valid) {
      throw new Error('Missing required fields: ' + check.missing.join(', '));
    }

    // Validate survey_date
    if (!Utils.isValidDate(data.survey_date)) {
      throw new Error('Invalid survey_date format');
    }

    // Validate scores (1-5 or 1-10 depending on scale)
    var scoreFields = ['health_score', 'wealth_score', 'wellbeing_score', 'heart_score', 'happiness_score'];
    for (var i = 0; i < scoreFields.length; i++) {
      var field = scoreFields[i];
      if (data[field] !== undefined && data[field] !== null && data[field] !== '') {
        var score = parseFloat(data[field]);
        if (isNaN(score) || score < 0 || score > 5) {
          throw new Error(field + ' must be between 0 and 5');
        }
      }
    }

    return true;
  }
};
/**
 * ===================================================================
 * Web PP7 — Services Layer
 * Business logic and workflow operations per process (P1–P7)
 * ===================================================================
 */

var Services = (function() {
  'use strict';

  // =========================================================================
  // P1: Recruitment — Headcount Request → Candidate Pipeline
  // =========================================================================

  /**
   * Submit a new headcount request
   */
  function submitHeadcount(data, createdBy) {
    Validations.headcount(data);
    data.approval_status = 'pending';
    data.request_date = data.request_date || Utils.timestamp();
    var result = Database.createRecord('p1_headcount', data, createdBy);
    return {
      success: true,
      message: 'Headcount request submitted',
      hc_id: result.id
    };
  }

  /**
   * Approve or reject a headcount request
   */
  function decideHeadcount(hcId, decision, approvedBy) {
    if (['approved', 'rejected', 'on_hold'].indexOf(decision) === -1) {
      throw new Error('Invalid decision: ' + decision + '. Use: approved, rejected, on_hold');
    }
    var hc = Database.getRecord('p1_headcount', hcId);
    if (!hc) throw new Error('Headcount not found: ' + hcId);

    var update = {
      approval_status: decision,
      approved_by: approvedBy,
      approved_date: Utils.timestamp()
    };
    Database.updateRecord('p1_headcount', hcId, update);
    return { success: true, message: 'Headcount ' + decision, hc_id: hcId };
  }

  /**
   * Add a candidate to a headcount request
   */
  function addCandidate(hcId, data) {
    var hc = Database.getRecord('p1_headcount', hcId);
    if (!hc) throw new Error('Headcount not found: ' + hcId);

    data.hc_id = hcId;
    data.stage = data.stage || 'applied';
    data.status = data.status || 'new';
    data.apply_date = data.apply_date || Utils.formatDate(new Date());

    // Auto-populate from headcount
    if (!data.position_applied) data.position_applied = hc.position;
    if (!data.bu) data.bu = hc.bu;

    Validations.candidate(data);
    return Database.createRecord('p1_candidates', data);
  }

  /**
   * Advance candidate to next stage
   * Flow: applied → screened → interview → assessment → offer → hired
   *                                                       └→ rejected
   */
  function advanceCandidate(candidateId, newStage, notes) {
    var validStages = {
      'applied':    ['screened', 'rejected'],
      'screened':   ['interview', 'rejected'],
      'interview':  ['assessment', 'rejected'],
      'assessment': ['offer', 'rejected'],
      'offer':      ['hired', 'rejected']
    };

    var candidate = Database.getRecord('p1_candidates', candidateId);
    if (!candidate) throw new Error('Candidate not found: ' + candidateId);

    var currentStage = (candidate.stage || 'applied').toLowerCase();
    var allowedNext = validStages[currentStage] || [];

    if (allowedNext.indexOf(newStage) === -1) {
      throw new Error('Cannot move from ' + currentStage + ' to ' + newStage +
        '. Allowed: ' + allowedNext.join(', '));
    }

    var update = { stage: newStage, status: newStage };

    // Set milestone dates
    if (newStage === 'interview') {
      update.interview_date = Utils.formatDate(new Date());
    } else if (newStage === 'offer') {
      update.offer_date = Utils.formatDate(new Date());
    } else if (newStage === 'hired') {
      update.hire_date = Utils.formatDate(new Date());
      update.status = 'hired';
    } else if (newStage === 'rejected') {
      update.status = 'rejected';
      if (notes) update.rejected_reason = notes;
    }

    if (notes && newStage !== 'rejected') {
      update.rejected_reason = notes; // reuse field for stage notes
    }

    Database.updateRecord('p1_candidates', candidateId, update);
    return {
      success: true,
      candidate_id: candidateId,
      from: currentStage,
      to: newStage,
      message: 'Candidate moved to ' + newStage + ' stage'
    };
  }

  /**
   * Get full recruitment pipeline summary for a headcount
   */
  function getHcPipeline(hcId) {
    var hc = Database.getRecord('p1_headcount', hcId);
    if (!hc) throw new Error('Headcount not found: ' + hcId);

    var candidates = Database.listRecords('p1_candidates', { hc_id: hcId }, {}).records;

    var summary = {
      total: 0, applied: 0, screened: 0, interview: 0,
      assessment: 0, offer: 0, hired: 0, rejected: 0
    };

    for (var i = 0; i < candidates.length; i++) {
      var stage = (candidates[i].stage || 'applied').toLowerCase();
      summary.total++;
      if (summary.hasOwnProperty(stage)) summary[stage]++;
    }

    return {
      headcount: hc,
      pipeline: summary,
      candidates: candidates
    };
  }

  // =========================================================================
  // P2: Interview & Assessment Scheduling
  // =========================================================================

  /**
   * Schedule an interview
   */
  function scheduleInterview(data) {
    Validations.interview(data);
    data.result = data.result || 'pending';
    data.scheduled_at = Utils.timestamp();
    return Database.createRecord('p2_interviews', data);
  }

  /**
   * Record interview results
   */
  function submitInterviewResult(interviewId, result, score, feedback, notes) {
    var validResults = ['pass', 'fail', 'pending', 'cond_pass'];
    if (validResults.indexOf(result) === -1) {
      throw new Error('Invalid result: ' + result);
    }

    var interview = Database.getRecord('p2_interviews', interviewId);
    if (!interview) throw new Error('Interview not found: ' + interviewId);

    var update = {
      result: result,
      conducted_at: Utils.timestamp()
    };
    if (score !== undefined) update.score = score;
    if (feedback) update.feedback = feedback;
    if (notes) update.notes = notes;

    Database.updateRecord('p2_interviews', interviewId, update);

    // If this is the final interview pass, advance candidate
    if (result === 'pass' && interview.type === 'final') {
      try {
        advanceCandidate(interview.candidate_id, 'assessment', 'Passed final interview');
      } catch (e) {
        // Silently continue; candidate may already be past this stage
      }
    }

    return { success: true, interview_id: interviewId, message: 'Interview result recorded' };
  }

  /**
   * Submit assessment scores
   */
  function submitAssessment(data) {
    Validations.assessment(data);

    // Calculate total if CC scores provided
    var ccResult = Utils.calculateCCTotal(data);
    if (ccResult.count > 0) {
      data.total_score = ccResult.total;
    }

    data.status = data.status || 'completed';
    data.assessment_date = data.assessment_date || Utils.formatDate(new Date());

    // Determine pass/fail if threshold provided
    if (data.total_score && data.pass_threshold) {
      data.result = parseFloat(data.total_score) >= parseFloat(data.pass_threshold) ? 'pass' : 'fail';
    }

    var result = Database.createRecord('p2_assessments', data);

    // Advance candidate based on result
    if (data.candidate_id && data.result === 'pass') {
      try {
        advanceCandidate(data.candidate_id, 'offer', 'Passed assessment');
      } catch (e) {}
    }

    return result;
  }

  // =========================================================================
  // P3: Matching — Match candidates to internal members
  // =========================================================================

  /**
   * Create a match between member and candidate
   */
  function createMatch(data) {
    Validations.matching(data);
    data.match_date = data.match_date || Utils.formatDate(new Date());
    data.status = data.status || 'proposed';
    return Database.createRecord('p3_matching', data);
  }

  /**
   * Auto-generate matches based on position and BU
   */
  function autoMatch(candidateId) {
    var candidate = Database.getRecord('p1_candidates', candidateId);
    if (!candidate) throw new Error('Candidate not found: ' + candidateId);

    // Find internal members with same position + BU
    var members = Database.listRecords('members', {
      position: candidate.position_applied,
      bu: candidate.bu,
      status: 'active'
    }, {}).records;

    var matches = [];
    for (var i = 0; i < members.length; i++) {
      var m = members[i];
      var matchData = {
        member_id: m.member_id,
        candidate_id: candidateId,
        position: candidate.position_applied,
        bu: candidate.bu,
        department: m.department,
        level: m.level,
        match_score: 0,
        cc_fit: m.cc_scores || '',
        status: 'auto_generated',
        auto_import: 'TRUE'
      };

      // Simple scoring: same level = 50 points
      if (m.level === candidate.position_applied) {
        matchData.match_score += 50;
      }
      // BU match = 30 points
      if (m.bu === candidate.bu) {
        matchData.match_score += 30;
      }
      // Department match = 20 points
      matchData.match_score += 20;

      var result = Database.createRecord('p3_matching', matchData);
      matches.push({ match_id: result.id, member_id: m.member_id, score: matchData.match_score });
    }

    return {
      success: true,
      candidate_id: candidateId,
      matches_found: matches.length,
      matches: matches
    };
  }

  /**
   * Confirm/reject a match
   */
  function decideMatch(matchId, decision, notes) {
    if (['confirmed', 'rejected', 'pending'].indexOf(decision) === -1) {
      throw new Error('Invalid decision: ' + decision);
    }

    var update = { status: decision };
    if (notes) update.notes = notes;

    var match = Database.getRecord('p3_matching', matchId);
    if (!match) throw new Error('Match not found: ' + matchId);

    Database.updateRecord('p3_matching', matchId, update);

    // If confirmed and auto_import, create member record from candidate
    if (decision === 'confirmed' && match.auto_import === 'TRUE') {
      importCandidateAsMember(match.candidate_id, match);
    }

    return { success: true, match_id: matchId, status: decision };
  }

  /**
   * Import candidate data into member table (on confirmed match)
   */
  function importCandidateAsMember(candidateId, match) {
    var candidate = Database.getRecord('p1_candidates', candidateId);
    if (!candidate) return null;

    var memberData = {
      emp_code: candidate.emp_code || 'IMP-' + Date.now(),
      full_name: candidate.first_name + ' ' + candidate.last_name,
      nickname: candidate.nickname || '',
      email: candidate.email,
      phone: candidate.phone,
      bu: match ? match.bu : candidate.bu,
      department: match ? match.department : '',
      position: match ? match.position : candidate.position_applied,
      level: match ? match.level : '',
      hire_date: candidate.hire_date || Utils.formatDate(new Date()),
      status: 'active'
    };

    return Database.createRecord('members', memberData);
  }

  // =========================================================================
  // P4: Evaluations — Performance Evaluation Workflow
  // =========================================================================

  /**
   * Start a performance evaluation cycle
   */
  function createEvaluation(data) {
    Validations.evaluation(data);
    data.status = 'in_progress';
    data.created_at = Utils.timestamp();
    return Database.createRecord('p4_evaluations', data);
  }

  /**
   * Submit evaluation scores
   */
  function submitEvalScores(evalId, scores) {
    var eval_ = Database.getRecord('p4_evaluations', evalId);
    if (!eval_) throw new Error('Evaluation not found: ' + evalId);

    // Validate CC scores
    for (var i = 1; i <= 5; i++) {
      var key = 'cc' + i + '_score';
      if (scores[key] !== undefined && scores[key] !== null && scores[key] !== '') {
        if (!Utils.isValidCCScore(scores[key])) {
          throw new Error(key + ' must be integer 1-5');
        }
      }
    }

    // Calculate total score
    var ccResult = Utils.calculateCCTotal(scores);
    scores.total_score = (ccResult.total || 0) + (parseFloat(scores.kpi_score) || 0);

    // Assign grade
    var total = parseFloat(scores.total_score);
    if (!isNaN(total)) {
      scores.grade = assignGrade(total);
    }

    scores.status = 'submitted';
    Database.updateRecord('p4_evaluations', evalId, scores);

    return {
      success: true,
      eval_id: evalId,
      total_score: scores.total_score,
      grade: scores.grade,
      message: 'Evaluation scores submitted'
    };
  }

  /**
   * Approve an evaluation (by manager/HR)
   */
  function approveEvaluation(evalId, comments) {
    var eval_ = Database.getRecord('p4_evaluations', evalId);
    if (!eval_) throw new Error('Evaluation not found: ' + evalId);

    var update = { status: 'approved' };
    if (comments) update.comments = (eval_.comments || '') + '\n[Approved] ' + comments;

    Database.updateRecord('p4_evaluations', evalId, update);
    return { success: true, eval_id: evalId, message: 'Evaluation approved' };
  }

  /**
   * Assign letter grade based on total score
   */
  function assignGrade(totalScore) {
    var s = parseFloat(totalScore);
    if (isNaN(s)) return '';
    if (s >= 90) return 'A';
    if (s >= 80) return 'B+';
    if (s >= 70) return 'B';
    if (s >= 60) return 'C+';
    if (s >= 50) return 'C';
    if (s >= 40) return 'D+';
    if (s >= 30) return 'D';
    return 'F';
  }

  // =========================================================================
  // P5: Development Plans
  // =========================================================================

  /**
   * Create a development plan
   */
  function createDevPlan(data) {
    Validations.development(data);
    data.status = data.status || 'planned';
    data.completion_pct = data.completion_pct || 0;
    return Database.createRecord('p5_development', data);
  }

  /**
   * Update development progress
   */
  function updateDevProgress(devId, completionPct, status, certObtained) {
    var dev = Database.getRecord('p5_development', devId);
    if (!dev) throw new Error('Development record not found: ' + devId);

    if (completionPct !== undefined) {
      var pct = parseFloat(completionPct);
      if (isNaN(pct) || pct < 0 || pct > 100) {
        throw new Error('completion_pct must be 0-100');
      }
      var update = { completion_pct: pct };
      if (pct === 100) {
        update.status = 'completed';
      } else if (pct > 0) {
        update.status = 'in_progress';
      }
      if (status) update.status = status;
      Database.updateRecord('p5_development', devId, update);
    }

    if (certObtained) {
      Database.updateRecord('p5_development', devId, { cert_obtained: certObtained });
    }

    return { success: true, dev_id: devId, message: 'Development progress updated' };
  }

  // =========================================================================
  // P6: Salary Calculations
  // =========================================================================

  /**
   * Create salary record with auto-calculation
   */
  function createSalary(data) {
    Validations.salary(data);

    // Auto-calculate net_salary if not provided
    var base = parseFloat(data.base_salary) || 0;
    var allowances = parseFloat(data.allowances) || 0;
    var deductions = parseFloat(data.deductions) || 0;
    var tax = parseFloat(data.tax_withheld) || 0;
    var socialSec = parseFloat(data.social_security) || 0;
    var provFund = parseFloat(data.provident_fund) || 0;

    var totalDeductions = deductions + tax + socialSec + provFund;
    data.deductions = totalDeductions;
    data.net_salary = base + allowances - totalDeductions;

    data.status = data.status || 'prepared';
    return Database.createRecord('p6_salary', data);
  }

  /**
   * Approve payroll for a period
   */
  function approvePayroll(salaryId) {
    var sal = Database.getRecord('p6_salary', salaryId);
    if (!sal) throw new Error('Salary record not found: ' + salaryId);

    if (sal.status === 'paid') {
      throw new Error('Salary already paid');
    }

    Database.updateRecord('p6_salary', salaryId, { status: 'paid' });
    return { success: true, salary_id: salaryId, message: 'Payroll approved' };
  }

  /**
   * Get salary summary for a member (all periods)
   */
  function getMemberSalaryHistory(memberId) {
    var records = Database.listRecords('p6_salary', { member_id: memberId }, {
      sort: 'pay_date', order: 'desc'
    }).records;

    return {
      member_id: memberId,
      total_records: records.length,
      records: records,
      current: records.length > 0 ? records[0] : null
    };
  }

  // =========================================================================
  // P7: Wellbeing Surveys
  // =========================================================================

  /**
   * Submit wellbeing survey
   */
  function submitWellbeingSurvey(data) {
    Validations.wellbeing(data);

    // Auto-calculate total_score
    var scores = [
      parseFloat(data.health_score) || 0,
      parseFloat(data.wealth_score) || 0,
      parseFloat(data.wellbeing_score) || 0,
      parseFloat(data.heart_score) || 0,
      parseFloat(data.happiness_score) || 0
    ];
    data.total_score = scores.reduce(function(a, b) { return a + b; }, 0);

    data.status = data.status || 'submitted';
    data.survey_date = data.survey_date || Utils.formatDate(new Date());

    return Database.createRecord('p7_wellbeing', data);
  }

  /**
   * Add follow-up action plan to wellbeing record
   */
  function addWellbeingFollowUp(wbId, actionPlan, followUp) {
    var wb = Database.getRecord('p7_wellbeing', wbId);
    if (!wb) throw new Error('Wellbeing record not found: ' + wbId);

    var existingPlans = wb.action_plans ? wb.action_plans + '\n' : '';
    var update = {
      action_plans: existingPlans + '[' + Utils.formatDate(new Date()) + '] ' + actionPlan,
      status: 'action_required'
    };
    if (followUp) update.follow_up = followUp;

    Database.updateRecord('p7_wellbeing', wbId, update);
    return { success: true, wb_id: wbId, message: 'Follow-up action added' };
  }

  /**
   * Get wellbeing trend for a member
   */
  function getWellbeingTrend(memberId) {
    var records = Database.listRecords('p7_wellbeing', { member_id: memberId }, {
      sort: 'survey_date', order: 'asc'
    }).records;

    var trend = records.map(function(r) {
      return {
        survey_date: r.survey_date,
        category: r.category,
        total_score: r.total_score,
        health: r.health_score,
        wealth: r.wealth_score,
        wellbeing: r.wellbeing_score,
        heart: r.heart_score,
        happiness: r.happiness_score
      };
    });

    return {
      member_id: memberId,
      surveys_count: records.length,
      trend: trend,
      latest: records.length > 0 ? records[records.length - 1] : null
    };
  }

  // =========================================================================
  // Cross-process: Full onboarding flow
  // =========================================================================

  /**
   * Onboard a hired candidate: create member + initial evaluations
   */
  function onboardHiredCandidate(candidateId, memberOverrides) {
    var candidate = Database.getRecord('p1_candidates', candidateId);
    if (!candidate) throw new Error('Candidate not found: ' + candidateId);

    if ((candidate.stage || '').toLowerCase() !== 'hired' &&
        (candidate.status || '').toLowerCase() !== 'hired') {
      throw new Error('Candidate must be in "hired" stage to onboard');
    }

    // Create member
    var memberData = {
      emp_code: memberOverrides && memberOverrides.emp_code || 'NEW-' + Date.now(),
      full_name: candidate.first_name + ' ' + candidate.last_name,
      nickname: memberOverrides && memberOverrides.nickname || '',
      email: candidate.email,
      phone: candidate.phone,
      bu: memberOverrides && memberOverrides.bu || candidate.bu || '',
      department: memberOverrides && memberOverrides.department || '',
      position: memberOverrides && memberOverrides.position || candidate.position_applied || '',
      level: memberOverrides && memberOverrides.level || '',
      hire_date: candidate.hire_date || Utils.formatDate(new Date()),
      status: 'probation'
    };

    // Merge any additional overrides
    if (memberOverrides) {
      for (var key in memberOverrides) {
        if (memberOverrides.hasOwnProperty(key) && memberData.hasOwnProperty(key)) {
          memberData[key] = memberOverrides[key];
        }
      }
    }

    var memberResult = Database.createRecord('members', memberData);

    return {
      success: true,
      candidate_id: candidateId,
      member_id: memberResult.id,
      message: 'Candidate onboarded as new member (probation status)',
      member: memberData
    };
  }

  // ===================================================================
  // PUBLIC INTERFACE
  // ===================================================================

  return {
    // P1: Recruitment
    submitHeadcount:    submitHeadcount,
    decideHeadcount:    decideHeadcount,
    addCandidate:       addCandidate,
    advanceCandidate:   advanceCandidate,
    getHcPipeline:      getHcPipeline,

    // P2: Interview & Assessment
    scheduleInterview:      scheduleInterview,
    submitInterviewResult:  submitInterviewResult,
    submitAssessment:       submitAssessment,

    // P3: Matching
    createMatch:        createMatch,
    autoMatch:          autoMatch,
    decideMatch:        decideMatch,
    importCandidateAsMember: importCandidateAsMember,

    // P4: Evaluations
    createEvaluation:   createEvaluation,
    submitEvalScores:   submitEvalScores,
    approveEvaluation:  approveEvaluation,
    assignGrade:        assignGrade,

    // P5: Development
    createDevPlan:      createDevPlan,
    updateDevProgress:  updateDevProgress,

    // P6: Salary
    createSalary:           createSalary,
    approvePayroll:         approvePayroll,
    getMemberSalaryHistory: getMemberSalaryHistory,

    // P7: Wellbeing
    submitWellbeingSurvey:     submitWellbeingSurvey,
    addWellbeingFollowUp:      addWellbeingFollowUp,
    getWellbeingTrend:         getWellbeingTrend,

    // Cross-process
    onboardHiredCandidate:  onboardHiredCandidate
  };

})(); // End Services IIFE
