/**
 * Web PP7 — RBAC & Auth Configuration
 * 5 Roles: admin, operator, bmc, user, external
 * Employee ID-based authentication
 */

const AUTH_CONFIG = {
  // Session timeouts (milliseconds)
  sessionTimeout: {
    admin: 8 * 60 * 60 * 1000,     // 8 hours
    operator: 8 * 60 * 60 * 1000,   // 8 hours
    bmc: 8 * 60 * 60 * 1000,        // 8 hours
    user: 4 * 60 * 60 * 1000,       // 4 hours
    external: 2 * 60 * 60 * 1000    // 2 hours
  },

  // Password rules
  password: {
    minLength: 8,
    requireUppercase: true,
    requireLowercase: true,
    requireNumber: true,
    requireSpecial: false,
    maxAge: 90 * 24 * 60 * 60 * 1000  // 90 days
  },

  // Login security
  login: {
    maxAttempts: 5,
    lockDuration: 30 * 60 * 1000  // 30 minutes
  },

  // OTP settings
  otp: {
    length: 6,
    expiryMs: 10 * 60 * 1000,  // 10 minutes
    maxResend: 3
  }
};

// 5 Roles definition
const ROLES = {
  admin: {
    id: 'admin',
    name: 'ผู้ดูแลระบบ',
    nameEn: 'Administrator',
    level: 1,
    color: '#dc2626',
    icon: '👑',
    description: 'เข้าถึงทุกระบบ จัดการผู้ใช้งาน'
  },
  operator: {
    id: 'operator',
    name: 'ผู้ปฏิบัติหน้าที่',
    nameEn: 'Operator',
    level: 2,
    color: '#2563eb',
    icon: '⚙️',
    description: 'จัดการ P1-P7 อ่าน/เขียน'
  },
  bmc: {
    id: 'bmc',
    name: 'BMC / ผู้บริหาร',
    nameEn: 'BMC / Executive',
    level: 3,
    color: '#7c3aed',
    icon: '📊',
    description: 'Dashboard + อ่านข้อมูล P1-P4'
  },
  user: {
    id: 'user',
    name: 'สมาชิกภายใน',
    nameEn: 'Employee',
    level: 4,
    color: '#059669',
    icon: '👤',
    description: 'ดูข้อมูลตัวเอง + Self-service'
  },
  external: {
    id: 'external',
    name: 'ลูกค้าภายนอก',
    nameEn: 'External',
    level: 5,
    color: '#d97706',
    icon: '🌐',
    description: 'ผู้สมัครงาน / หน่วยงานรัฐ'
  }
};

// Access Matrix — who can access what
// r = read, w = read+write, self = own data only, none = no access
const ACCESS_MATRIX = {
  dashboard: {
    admin: 'w', operator: 'w', bmc: 'r', user: 'none', external: 'none'
  },
  user_management: {
    admin: 'w', operator: 'none', bmc: 'none', user: 'none', external: 'none'
  },
  access_logs: {
    admin: 'r', operator: 'none', bmc: 'none', user: 'none', external: 'none'
  },
  P1_recruit: {
    admin: 'w', operator: 'w', bmc: 'r', user: 'none', external: 'apply'
  },
  P2_assess: {
    admin: 'w', operator: 'w', bmc: 'r', user: 'none', external: 'none'
  },
  P3_match: {
    admin: 'w', operator: 'w', bmc: 'r', user: 'none', external: 'none'
  },
  P4_evaluate: {
    admin: 'w', operator: 'w', bmc: 'r', user: 'self', external: 'none'
  },
  P5_develop: {
    admin: 'w', operator: 'w', bmc: 'r', user: 'self', external: 'none'
  },
  P6_compensate: {
    admin: 'w', operator: 'w', bmc: 'r', user: 'self', external: 'none'
  },
  P7_wellbeing: {
    admin: 'w', operator: 'w', bmc: 'r', user: 'self', external: 'none'
  },
  reports: {
    admin: 'w', operator: 'w', bmc: 'r', user: 'none', external: 'none'
  },
  settings: {
    admin: 'w', operator: 'none', bmc: 'none', user: 'none', external: 'none'
  }
};

// User status
const USER_STATUS = {
  active: { label: 'ใช้งาน', color: '#10b981', icon: '🟢' },
  resigned: { label: 'ลาออกแล้ว', color: '#ef4444', icon: '🔴' },
  suspended: { label: 'ระงับ', color: '#f59e0b', icon: '🟡' },
  locked: { label: 'ล็อก (login ผิด)', color: '#ef4444', icon: '🔒' },
  pending: { label: 'รอยืนยัน', color: '#6366f1', icon: '⏳' }
};

// Mock users for development (will be replaced by Google Sheets)
const MOCK_USERS = [
  { employee_id: 'PKG001', name: 'ปกรณ์', email: 'pakorn@pkg.co.th', role: 'admin', status: 'active', department: 'Executive', phone: '08x-xxx-xxxx', created: '2026-01-01', last_login: '2026-07-21 10:00' },
  { employee_id: 'HR001', name: 'สมชาย ใจดี', email: 'somchai@pkg.co.th', role: 'operator', status: 'active', department: 'HR', phone: '08x-xxx-xxxx', created: '2026-02-15', last_login: '2026-07-20 14:30' },
  { employee_id: 'HR002', name: 'วิภา แสงทอง', email: 'wipa@pkg.co.th', role: 'operator', status: 'active', department: 'HR', phone: '08x-xxx-xxxx', created: '2026-03-01', last_login: '2026-07-19 09:15' },
  { employee_id: 'BMC001', name: 'ดร.สมศักดิ์', email: 'somsak@pkg.co.th', role: 'bmc', status: 'active', department: 'BMC', phone: '08x-xxx-xxxx', created: '2026-01-15', last_login: '2026-07-18 16:45' },
  { employee_id: 'EMP001', name: 'นิพนธ์ รักงาน', email: 'niphon@pkg.co.th', role: 'user', status: 'active', department: 'Production', phone: '08x-xxx-xxxx', created: '2026-04-01', last_login: '2026-07-20 08:00' },
  { employee_id: 'EMP002', name: 'สุดา มั่นคง', email: 'suda@pkg.co.th', role: 'user', status: 'active', department: 'Sales', phone: '08x-xxx-xxxx', created: '2026-04-15', last_login: '2026-07-17 11:20' },
  { employee_id: 'EMP003', name: 'ประยุทธ์ เก่าแก่', email: 'prayut@pkg.co.th', role: 'user', status: 'resigned', department: 'Production', phone: '08x-xxx-xxxx', created: '2025-06-01', last_login: '2026-06-30 17:00' },
  { employee_id: 'EXT-APP-001', name: 'ผู้สมัคร A', email: 'applicant.a@gmail.com', role: 'external', status: 'active', department: '-', phone: '09x-xxx-xxxx', created: '2026-07-15', last_login: '2026-07-15 10:00' },
  { employee_id: 'EXT-GOV-001', name: 'หน่วยงานประกันสังคม', email: 'contact@sso.go.th', role: 'external', status: 'active', department: '-', phone: '02-xxx-xxxx', created: '2026-05-01', last_login: '2026-07-10 13:30' }
];

// Check if a role has access to a module
function checkAccess(role, module) {
  const matrix = ACCESS_MATRIX[module];
  if (!matrix) return 'none';
  return matrix[role] || 'none';
}

// Check if user can access module
function canAccess(user, module) {
  if (!user || user.status !== 'active') return false;
  const access = checkAccess(user.role, module);
  return access !== 'none';
}

// Get accessible modules for a role
function getAccessibleModules(role) {
  const modules = [];
  for (const [module, roles] of Object.entries(ACCESS_MATRIX)) {
    if (roles[role] && roles[role] !== 'none') {
      modules.push({ module, access: roles[role] });
    }
  }
  return modules;
}

// Generate unique ID
function generateId(prefix = '') {
  return prefix + Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
}

// Simple hash (for demo — in production, use server-side hashing)
function simpleHash(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36);
}

// Generate OTP
function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Validate password strength
function validatePassword(password) {
  const errors = [];
  if (password.length < AUTH_CONFIG.password.minLength) {
    errors.push(`รหัสผ่านต้องมีอย่างน้อย ${AUTH_CONFIG.password.minLength} ตัวอักษร`);
  }
  if (AUTH_CONFIG.password.requireUppercase && !/[A-Z]/.test(password)) {
    errors.push('ต้องมีตัวอักษรพิมพ์ใหญ่อย่างน้อย 1 ตัว');
  }
  if (AUTH_CONFIG.password.requireLowercase && !/[a-z]/.test(password)) {
    errors.push('ต้องมีตัวอักษรพิมพ์เล็กอย่างน้อย 1 ตัว');
  }
  if (AUTH_CONFIG.password.requireNumber && !/[0-9]/.test(password)) {
    errors.push('ต้องมีตัวเลขอย่างน้อย 1 ตัว');
  }
  return { valid: errors.length === 0, errors };
}
