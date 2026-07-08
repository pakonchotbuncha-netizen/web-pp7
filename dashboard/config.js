/**
 * Dashboard Configuration
 * =======================
 * ไฟล์จัดการ configuration ของ Dashboard
 * รองรับสลับระหว่าง Mock Data และ Real Data
 * 
 * วิธีใช้:
 * - เปลี่ยน DATA_SOURCE เป็น 'mock' หรือ 'real'
 * - ตั้ง AUTO_REFRESH_INTERVAL (ms) สำหรับ auto-refresh
 * - ตั้ง DEBUG_MODE สำหรับ development
 */

const DASHBOARD_CONFIG = {
  // แหล่งข้อมูล: 'mock' | 'real'
  DATA_SOURCE: 'mock', // เปลี่ยนเป็น 'real' เพื่อใช้ข้อมูลจริง

  // Auto-refresh interval (มิลลิวินาที) - 5 นาที
  AUTO_REFRESH_INTERVAL: 5 * 60 * 1000,

  // Debug mode (แสดง console.log)
  DEBUG_MODE: true,

  // API Base URL (ใช้ตอน DATA_SOURCE = 'real')
  API_BASE_URL: '/api/dashboard',

  // Chart defaults
  CHART_COLORS: {
    blue: '#3b82f6',
    emerald: '#10b981',
    violet: '#8b5cf6',
    amber: '#f59e0b',
    red: '#ef4444',
    slate: '#64748b',
    indigo: '#6366f1',
    teal: '#14b8a6',
    pink: '#ec4899',
    orange: '#f97316'
  },

  // KPI threshold settings
  THRESHOLDS: {
    turnoverRate: { good: 5, warning: 7, critical: 10 },
    matchRate: { good: 80, warning: 60, critical: 40 },
    performanceScore: { good: 4.0, warning: 3.0, critical: 2.0 },
    engagementScore: { good: 4.0, warning: 3.0, critical: 2.5 }
  }
};

// Export สำหรับใช้ใน HTML
if (typeof window !== 'undefined') {
  window.DASHBOARD_CONFIG = DASHBOARD_CONFIG;
}
