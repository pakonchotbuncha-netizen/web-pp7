/**
 * Mock Data Module
 * ================
 * ข้อมูลจำลองสำหรับทดสอบ Dashboard
 * ใช้ตอน DATA_SOURCE = 'mock'
 */

const MOCK_DASHBOARD_DATA = {
  // KPI หลัก
  kpis: {
    headcount: {
      total: 487,
      active: 446,
      probation: 12,
      contract: 21,
      newThisMonth: 12
    },
    turnoverRate: {
      overall: 5.2,
      byBU: {
        'Tech': { rate: 8.5, trend: 'up', status: 'critical' },
        'Sales': { rate: 7.1, trend: 'up', status: 'warning' },
        'Operations': { rate: 3.2, trend: 'down', status: 'good' },
        'Finance': { rate: 4.8, trend: 'stable', status: 'good' },
        'HR': { rate: 6.3, trend: 'up', status: 'warning' },
        'R&D': { rate: 2.1, trend: 'down', status: 'good' }
      }
    },
    performanceScore: {
      overall: 3.72,
      trend: 'up',
      target: 4.0,
      byQuarter: [
        { quarter: 'Q1/25', score: 3.48 },
        { quarter: 'Q2/25', score: 3.52 },
        { quarter: 'Q3/25', score: 3.61 },
        { quarter: 'Q4/25', score: 3.64 },
        { quarter: 'Q1/26', score: 3.72 }
      ]
    },
    engagementScore: {
      overall: 4.2,
      byBU: {
        'Tech': 4.1,
        'Sales': 3.9,
        'Operations': 4.3,
        'Finance': 4.4,
        'HR': 4.0,
        'R&D': 4.5
      },
      trend: [
        { month: 'ต.ค.', score: 3.5 },
        { month: 'พ.ย.', score: 3.6 },
        { month: 'ธ.ค.', score: 3.7 },
        { month: 'ม.ค.', score: 3.8 },
        { month: 'ก.พ.', score: 4.0 },
        { month: 'มี.ค.', score: 4.2 }
      ]
    },
    recruitment: {
      openPositions: 42,
      inPipeline: 186,
      interviewed: 34,
      offerSent: 12,
      hired: 19
    },
    compensation: {
      welfarePayout: 8.2, // ล้านบาท
      budgetUsed: 86, // เปอร์เซ็นต์
      byType: {
        'ประกันสุขภาพ': 35,
        'เบี้ยเลี้ยง': 20,
        'กองทุน': 25,
        'โบนัส': 12,
        'สวัสดิการอื่น': 8
      }
    }
  },

  // Trend data สำหรับ charts
  trends: {
    headcount: [
      { month: 'ม.ค.', headcount: 1180, turnover: 18 },
      { month: 'ก.พ.', headcount: 1195, turnover: 22 },
      { month: 'มี.ค.', headcount: 1210, turnover: 15 },
      { month: 'เม.ย.', headcount: 1222, turnover: 20 },
      { month: 'พ.ค.', headcount: 1235, turnover: 16 },
      { month: 'มิ.ย.', headcount: 1247, turnover: 14 }
    ],
    sourcingChannels: [
      { channel: 'LinkedIn', count: 28 },
      { channel: 'Website', count: 22 },
      { channel: 'Referral', count: 18 },
      { channel: 'Job Board', count: 16 },
      { channel: 'Agency', count: 16 }
    ]
  },

  // Headcount by BU
  headcountByBU: [
    { bu: 'Tech', count: 142, turnover: 8.5, avgScore: 3.6, status: 'warning' },
    { bu: 'Sales', count: 89, turnover: 7.1, avgScore: 3.4, status: 'warning' },
    { bu: 'Operations', count: 156, turnover: 3.2, avgScore: 3.8, status: 'good' },
    { bu: 'Finance', count: 48, turnover: 4.8, avgScore: 4.2, status: 'good' },
    { bu: 'HR', count: 32, turnover: 6.3, avgScore: 3.9, status: 'warning' },
    { bu: 'R&D', count: 20, turnover: 2.1, avgScore: 4.5, status: 'good' }
  ]
};

// Export สำหรับใช้ใน HTML
if (typeof window !== 'undefined') {
  window.MOCK_DASHBOARD_DATA = MOCK_DASHBOARD_DATA;
}
