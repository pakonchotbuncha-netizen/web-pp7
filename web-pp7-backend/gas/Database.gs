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
