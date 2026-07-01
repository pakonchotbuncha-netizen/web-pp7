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
