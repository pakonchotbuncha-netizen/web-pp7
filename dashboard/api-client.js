/**
 * Dashboard API Client
 * ====================
 * จัดการการเชื่อมต่อ API สำหรับดึงข้อมูล Dashboard
 * รองรับการสลับระหว่าง Mock และ Real data
 * มี error handling, retry logic, และ loading states
 */

// ===== DASHBOARD CLIENT CLASS =====
class DashboardClient {
  constructor(config) {
    this.config = config || (window.DASHBOARD_CONFIG || {});
    this.dataSource = this.config.DATA_SOURCE || 'mock';
    this.apiBase = this.config.API_BASE_URL || '/api/dashboard';
    this.loading = false;
    this.error = null;
    this.lastUpdate = null;
    this.refreshTimer = null;
    this.listeners = [];
  }

  // ===== LOADING & ERROR STATES =====
  
  /** ตั้งค่า loading state */
  setLoading(state) {
    this.loading = state;
    this.notifyListeners('loading', state);
  }

  /** ตั้งค่า error */
  setError(error) {
    this.error = error;
    this.notifyListeners('error', error);
  }

  /** แจ้ง event ให้ listeners */
  notifyListeners(event, data) {
    this.listeners.forEach(fn => {
      try { fn(event, data); } catch(e) { console.error('Dashboard listener error:', e); }
    });
  }

  /** เพิ่ม listener สำหรับ events */
  onChange(fn) {
    this.listeners.push(fn);
    return () => { this.listeners = this.listeners.filter(f => f !== fn); };
  }

  // ===== DATA FETCHING =====

  /** ดึงข้อมูล KPI ทั้งหมด */
  async fetchKPIs() {
    this.setLoading(true);
    this.setError(null);
    try {
      if (this.dataSource === 'real') {
        return await this._fetchFromAPI('/kpis');
      }
      // Mock data
      await this._delay(300); // จำลอง network delay
      const data = window.MOCK_DASHBOARD_DATA ? window.MOCK_DASHBOARD_DATA.kpis : {};
      this.lastUpdate = new Date();
      this.setLoading(false);
      return data;
    } catch (err) {
      this.setError('ไม่สามารถโหลดข้อมูล KPI: ' + err.message);
      this.setLoading(false);
      throw err;
    }
  }

  /** ดึงข้อมูล trend */
  async fetchTrends() {
    this.setLoading(true);
    try {
      if (this.dataSource === 'real') {
        return await this._fetchFromAPI('/trend');
      }
      await this._delay(200);
      const data = window.MOCK_DASHBOARD_DATA ? window.MOCK_DASHBOARD_DATA.trends : {};
      this.setLoading(false);
      return data;
    } catch (err) {
      this.setError('ไม่สามารถโหลดข้อมูล Trend: ' + err.message);
      this.setLoading(false);
      throw err;
    }
  }

  /** ดึงข้อมูล Headcount by BU */
  async fetchHeadcountByBU() {
    if (this.dataSource === 'real') {
      return this._fetchFromAPI('/headcount');
    }
    await this._delay(150);
    return window.MOCK_DASHBOARD_DATA ? window.MOCK_DASHBOARD_DATA.headcountByBU : [];
  }

  /** ดึงข้อมูลทั้งหมดในครั้งเดียว */
  async fetchAll() {
    this.setLoading(true);
    this.setError(null);
    try {
      const [kpis, trends, headcount] = await Promise.all([
        this.fetchKPIs(),
        this.fetchTrends(),
        this.fetchHeadcountByBU()
      ]);
      this.lastUpdate = new Date();
      this.setLoading(false);
      return { kpis, trends, headcount, timestamp: this.lastUpdate };
    } catch (err) {
      this.setLoading(false);
      throw err;
    }
  }

  // ===== AUTO REFRESH =====

  /** เริ่ม auto-refresh */
  startAutoRefresh(callback) {
    this.stopAutoRefresh();
    const interval = this.config.AUTO_REFRESH_INTERVAL || 300000;
    this.refreshTimer = setInterval(async () => {
      try {
        const data = await this.fetchAll();
        if (callback) callback(data);
      } catch (err) {
        console.warn('[Dashboard] Auto-refresh failed:', err.message);
      }
    }, interval);
  }

  /** หยุด auto-refresh */
  stopAutoRefresh() {
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer);
      this.refreshTimer = null;
    }
  }

  // ===== API HELPER =====

  /** เรียก API จริง (Google Apps Script endpoint) */
  async _fetchFromAPI(path, options = {}) {
    const url = this.apiBase + path;
    const response = await fetch(url, {
      headers: { 'Accept': 'application/json' },
      ...options
    });
    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }
    return response.json();
  }

  /** จำลอง delay */
  _delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// ===== FACTORY FUNCTION =====
/** สร้าง dashboard client instance */
function createDashboardClient(config) {
  return new DashboardClient(config || window.DASHBOARD_CONFIG);
}

// Export
if (typeof window !== 'undefined') {
  window.DashboardClient = DashboardClient;
  window.createDashboardClient = createDashboardClient;
}
