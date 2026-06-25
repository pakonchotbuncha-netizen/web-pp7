/**
 * Web PP7 Backend - Frontend API Adapter
 * Connects the existing frontend to the Google Apps Script backend
 * 
 * @author KiroClaw
 * @date 25 มิ.ย. 2569
 */

/**
 * API Adapter - Handles all communication with the backend
 */
const API = {
  // Base URL for the Google Apps Script Web App
  // Update this after deployment
  BASE_URL: '',
  
  // Current session token
  sessionToken: null,
  
  /**
   * Initialize the API adapter
   */
  init: function(baseUrl) {
    this.BASE_URL = baseUrl;
    // Try to restore session from localStorage
    const saved = localStorage.getItem('pp7_session_token');
    if (saved) {
      this.sessionToken = saved;
    }
  },

  /**
   * Make an API request
   */
  request: async function(method, path, body) {
    const url = this.BASE_URL + '?path=' + encodeURIComponent(path);
    
    const options = {
      method: method,
      headers: {},
      muteHttpExceptions: true
    };

    if (this.sessionToken) {
      options.headers['X-Session-Token'] = this.sessionToken;
    }

    if (body && (method === 'POST' || method === 'PUT')) {
      options.headers['Content-Type'] = 'application/json';
      options.body = JSON.stringify(body);
    }

    try {
      const response = await fetch(url, options);
      const data = await response.json();
      
      if (data.success === false && data.code === 401) {
        // Session expired - redirect to login
        this.logout();
        window.location.href = '#login';
      }
      
      return data;
    } catch (error) {
      console.error('API Error:', error);
      return { success: false, error: error.message };
    }
  },

  // ===== Auth =====
  
  login: async function(email, password) {
    const result = await this.request('POST', 'auth/login', { email, password });
    if (result.success) {
      this.sessionToken = result.data.token;
      localStorage.setItem('pp7_session_token', result.data.token);
      localStorage.setItem('pp7_user', JSON.stringify(result.data.user));
    }
    return result;
  },

  logout: async function() {
    if (this.sessionToken) {
      await this.request('POST', 'auth/logout', {});
    }
    this.sessionToken = null;
    localStorage.removeItem('pp7_session_token');
    localStorage.removeItem('pp7_user');
  },

  getSession: async function() {
    return await this.request('GET', 'auth/session', {});
  },

  getCurrentUser: function() {
    const saved = localStorage.getItem('pp7_user');
    return saved ? JSON.parse(saved) : null;
  },

  isLoggedIn: function() {
    return !!this.sessionToken;
  },

  // ===== Members =====
  
  getMembers: async function(filters, page, limit) {
    return await this.request('GET', 'members', { filters, page, limit });
  },

  getMember: async function(memberId) {
    return await this.request('GET', 'members/' + memberId, {});
  },

  createMember: async function(data) {
    return await this.request('POST', 'members', data);
  },

  updateMember: async function(memberId, data) {
    return await this.request('PUT', 'members/' + memberId, data);
  },

  deleteMember: async function(memberId) {
    return await this.request('DELETE', 'members/' + memberId, {});
  },

  // ===== P1: Headcount =====
  
  getHeadcountRequests: async function(filters, page, limit) {
    return await this.request('GET', 'p1-headcount', { filters, page, limit });
  },

  getHeadcountRequest: async function(requestId) {
    return await this.request('GET', 'p1-headcount/' + requestId, {});
  },

  createHeadcountRequest: async function(data) {
    return await this.request('POST', 'p1-headcount', data);
  },

  updateHeadcountRequest: async function(requestId, data) {
    return await this.request('PUT', 'p1-headcount/' + requestId, data);
  },

  // ===== P1: Recruitment =====
  
  getRecruitments: async function(filters, page, limit) {
    return await this.request('GET', 'p1-recruitment', { filters, page, limit });
  },

  getRecruitment: async function(caseId) {
    return await this.request('GET', 'p1-recruitment/' + caseId, {});
  },

  createRecruitment: async function(data) {
    return await this.request('POST', 'p1-recruitment', data);
  },

  updateRecruitment: async function(caseId, data) {
    return await this.request('PUT', 'p1-recruitment/' + caseId, data);
  },

  // ===== P2: Assessment =====
  
  getAssessments: async function(filters, page, limit) {
    return await this.request('GET', 'p2-assessment', { filters, page, limit });
  },

  getAssessment: async function(assessmentId) {
    return await this.request('GET', 'p2-assessment/' + assessmentId, {});
  },

  createAssessment: async function(data) {
    return await this.request('POST', 'p2-assessment', data);
  },

  updateAssessment: async function(assessmentId, data) {
    return await this.request('PUT', 'p2-assessment/' + assessmentId, data);
  },

  // ===== P3: Matching =====
  
  getMatchings: async function(filters, page, limit) {
    return await this.request('GET', 'p3-matching', { filters, page, limit });
  },

  getMatching: async function(matchId) {
    return await this.request('GET', 'p3-matching/' + matchId, {});
  },

  createMatching: async function(data) {
    return await this.request('POST', 'p3-matching', data);
  },

  updateMatching: async function(matchId, data) {
    return await this.request('PUT', 'p3-matching/' + matchId, data);
  },

  // ===== P4: Performance =====
  
  getPerformanceEvals: async function(filters, page, limit) {
    return await this.request('GET', 'p4-performance', { filters, page, limit });
  },

  getPerformanceEval: async function(evalId) {
    return await this.request('GET', 'p4-performance/' + evalId, {});
  },

  createPerformanceEval: async function(data) {
    return await this.request('POST', 'p4-performance', data);
  },

  updatePerformanceEval: async function(evalId, data) {
    return await this.request('PUT', 'p4-performance/' + evalId, data);
  },

  // ===== P5: Development =====
  
  getDevelopments: async function(filters, page, limit) {
    return await this.request('GET', 'p5-development', { filters, page, limit });
  },

  getDevelopment: async function(devId) {
    return await this.request('GET', 'p5-development/' + devId, {});
  },

  createDevelopment: async function(data) {
    return await this.request('POST', 'p5-development', data);
  },

  updateDevelopment: async function(devId, data) {
    return await this.request('PUT', 'p5-development/' + devId, data);
  },

  // ===== P6: Compensation =====
  
  getCompensations: async function(filters, page, limit) {
    return await this.request('GET', 'p6-compensation', { filters, page, limit });
  },

  getCompensation: async function(compId) {
    return await this.request('GET', 'p6-compensation/' + compId, {});
  },

  createCompensation: async function(data) {
    return await this.request('POST', 'p6-compensation', data);
  },

  updateCompensation: async function(compId, data) {
    return await this.request('PUT', 'p6-compensation/' + compId, data);
  },

  // ===== P7: Welfare =====
  
  getWelfares: async function(filters, page, limit) {
    return await this.request('GET', 'p7-welfare', { filters, page, limit });
  },

  getWelfare: async function(welfareId) {
    return await this.request('GET', 'p7-welfare/' + welfareId, {});
  },

  createWelfare: async function(data) {
    return await this.request('POST', 'p7-welfare', data);
  },

  updateWelfare: async function(welfareId, data) {
    return await this.request('PUT', 'p7-welfare/' + welfareId, data);
  },

  // ===== Dashboard =====
  
  getDashboard: async function() {
    return await this.request('GET', 'dashboard', {});
  },

  // ===== Config =====
  
  getConfig: async function() {
    return await this.request('GET', 'config', {});
  },

  updateConfig: async function(key, value, type) {
    return await this.request('PUT', 'config/' + key, { value, type });
  },

  // ===== Audit =====
  
  getAuditLogs: async function(filters, page, limit) {
    return await this.request('GET', 'audit', { filters, page, limit });
  }
};

/**
 * Data Migration Helper
 * Migrates data from localStorage to the backend API
 */
const DataMigration = {
  /**
   * Migrate all localStorage data to backend
   */
  migrateAll: async function() {
    const results = {};
    
    // Migrate members
    results.members = await this.migrateMembers();
    
    // Migrate headcount
    results.headcount = await this.migrateHeadcount();
    
    // Migrate recruitment
    results.recruitment = await this.migrateRecruitment();
    
    // Migrate compensation
    results.compensation = await this.migrateCompensation();
    
    return results;
  },

  /**
   * Migrate members from localStorage
   */
  migrateMembers: async function() {
    const saved = localStorage.getItem('members_data');
    if (!saved) return { success: true, skipped: true, message: 'No data to migrate' };

    try {
      const members = JSON.parse(saved);
      let success = 0, failed = 0;

      for (const member of members) {
        const result = await API.createMember(member);
        if (result.success) success++;
        else failed++;
      }

      return { success: true, total: members.length, migrated: success, failed };
    } catch (e) {
      return { success: false, error: e.message };
    }
  },

  /**
   * Migrate headcount requests
   */
  migrateHeadcount: async function() {
    const saved = localStorage.getItem('headcount_requests');
    if (!saved) return { success: true, skipped: true };

    try {
      const requests = JSON.parse(saved);
      let success = 0;
      for (const req of requests) {
        const result = await API.createHeadcountRequest(req);
        if (result.success) success++;
      }
      return { success: true, total: requests.length, migrated: success };
    } catch (e) {
      return { success: false, error: e.message };
    }
  },

  /**
   * Migrate recruitment cases
   */
  migrateRecruitment: async function() {
    const saved = localStorage.getItem('recruitments');
    if (!saved) return { success: true, skipped: true };

    try {
      const cases = JSON.parse(saved);
      let success = 0;
      for (const c of cases) {
        const result = await API.createRecruitment(c);
        if (result.success) success++;
      }
      return { success: true, total: cases.length, migrated: success };
    } catch (e) {
      return { success: false, error: e.message };
    }
  },

  /**
   * Migrate compensation records
   */
  migrateCompensation: async function() {
    const saved = localStorage.getItem('compensation_data');
    if (!saved) return { success: true, skipped: true };

    try {
      const records = JSON.parse(saved);
      let success = 0;
      for (const r of records) {
        const result = await API.createCompensation(r);
        if (result.success) success++;
      }
      return { success: true, total: records.length, migrated: success };
    } catch (e) {
      return { success: false, error: e.message };
    }
  }
};
