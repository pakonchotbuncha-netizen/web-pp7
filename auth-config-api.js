/**
 * Web PP7 — Auth Configuration (API Version)
 * ใช้ Google Apps Script เป็น backend
 */

// ===== API CONFIG =====
const API_BASE_URL = 'YOUR_GAS_WEB_APP_URL'; // ← เปลี่ยนเป็น URL ของ GAS Web App

// ===== ROLES =====
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

// ===== USER STATUS =====
const USER_STATUS = {
  active: { label: 'ใช้งาน', color: '#10b981', icon: '🟢' },
  resigned: { label: 'ลาออกแล้ว', color: '#ef4444', icon: '🔴' },
  suspended: { label: 'ระงับ', color: '#f59e0b', icon: '🟡' },
  locked: { label: 'ล็อก (login ผิด)', color: '#ef4444', icon: '🔒' },
  pending: { label: 'รอยืนยัน', color: '#6366f1', icon: '⏳' }
};

// ===== ACCESS MATRIX =====
const ACCESS_MATRIX = {
  dashboard: { admin: 'w', operator: 'w', bmc: 'r', user: 'none', external: 'none' },
  user_management: { admin: 'w', operator: 'none', bmc: 'none', user: 'none', external: 'none' },
  access_logs: { admin: 'r', operator: 'none', bmc: 'none', user: 'none', external: 'none' },
  P1_recruit: { admin: 'w', operator: 'w', bmc: 'r', user: 'none', external: 'apply' },
  P2_assess: { admin: 'w', operator: 'w', bmc: 'r', user: 'none', external: 'none' },
  P3_match: { admin: 'w', operator: 'w', bmc: 'r', user: 'none', external: 'none' },
  P4_evaluate: { admin: 'w', operator: 'w', bmc: 'r', user: 'self', external: 'none' },
  P5_develop: { admin: 'w', operator: 'w', bmc: 'r', user: 'self', external: 'none' },
  P6_compensate: { admin: 'w', operator: 'w', bmc: 'r', user: 'self', external: 'none' },
  P7_wellbeing: { admin: 'w', operator: 'w', bmc: 'r', user: 'self', external: 'none' },
  reports: { admin: 'w', operator: 'w', bmc: 'r', user: 'none', external: 'none' },
  settings: { admin: 'w', operator: 'none', bmc: 'none', user: 'none', external: 'none' }
};

// ===== API CALLS =====
async function apiCall(action, params = {}) {
  try {
    const url = `${API_BASE_URL}?action=${action}&${new URLSearchParams(params).toString()}`;
    const response = await fetch(url);
    const data = await response.json();
    return data;
  } catch (err) {
    console.error('API Error:', err);
    return { success: false, error: 'Connection error: ' + err.message };
  }
}

async function apiPost(action, params = {}) {
  try {
    const response = await fetch(API_BASE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, ...params })
    });
    const data = await response.json();
    return data;
  } catch (err) {
    console.error('API Error:', err);
    return { success: false, error: 'Connection error: ' + err.message };
  }
}

// ===== AUTH FUNCTIONS =====
async function login(employee_id, password) {
  const result = await apiPost('login', { employee_id, password });
  if (result.success) {
    // Store session
    const session = {
      employee_id: result.user.employee_id,
      name: result.user.name,
      role: result.user.role,
      department: result.user.department,
      email: result.user.email,
      token: result.token,
      expires: result.expires,
      force_change_pw: result.user.force_change_pw
    };
    localStorage.setItem('pp7_session', JSON.stringify(session));
  }
  return result;
}

async function forgotPassword(employee_id, email) {
  return await apiCall('forgot_password', { employee_id, email });
}

async function verifyOtp(employee_id, otp) {
  return await apiCall('verify_otp', { employee_id, otp });
}

async function resetPassword(employee_id, otp, new_password) {
  return await apiPost('reset_password', { employee_id, otp, new_password });
}

async function getUsers(filters = {}) {
  return await apiCall('get_users', filters);
}

async function createUser(userData) {
  return await apiPost('create_user', userData);
}

async function updateUser(userData) {
  return await apiPost('update_user', userData);
}

async function deleteUser(employee_id) {
  return await apiPost('delete_user', { employee_id });
}

async function getAccessLogs(filters = {}) {
  return await apiCall('get_access_logs', filters);
}

async function getStats() {
  return await apiCall('get_stats');
}

function logout() {
  localStorage.removeItem('pp7_session');
  window.location.href = 'auth-login.html';
}

function getSession() {
  const session = JSON.parse(localStorage.getItem('pp7_session') || 'null');
  if (!session) return null;
  
  // Check expiry
  if (new Date(session.expires) < new Date()) {
    localStorage.removeItem('pp7_session');
    return null;
  }
  
  return session;
}

function requireAuth(allowedRoles = []) {
  const session = getSession();
  if (!session) {
    window.location.href = 'auth-login.html';
    return null;
  }
  if (allowedRoles.length > 0 && !allowedRoles.includes(session.role)) {
    alert('⛔ ไม่มีสิทธิ์เข้าถึง');
    window.location.href = 'auth-login.html';
    return null;
  }
  return session;
}

// ===== ACCESS CONTROL =====
function checkAccess(role, module) {
  const matrix = ACCESS_MATRIX[module];
  if (!matrix) return 'none';
  return matrix[role] || 'none';
}

function canAccess(user, module) {
  if (!user || user.status !== 'active') return false;
  const access = checkAccess(user.role, module);
  return access !== 'none';
}

function getAccessibleModules(role) {
  const modules = [];
  for (const [module, roles] of Object.entries(ACCESS_MATRIX)) {
    if (roles[role] && roles[role] !== 'none') {
      modules.push({ module, access: roles[role] });
    }
  }
  return modules;
}

// ===== UTILITIES =====
function generateId(prefix = '') {
  return prefix + Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
}

function validatePassword(password) {
  const errors = [];
  if (password.length < 8) errors.push('รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร');
  if (!/[A-Z]/.test(password)) errors.push('ต้องมีตัวอักษรพิมพ์ใหญ่อย่างน้อย 1 ตัว');
  if (!/[a-z]/.test(password)) errors.push('ต้องมีตัวอักษรพิมพ์เล็กอย่างน้อย 1 ตัว');
  if (!/[0-9]/.test(password)) errors.push('ต้องมีตัวเลขอย่างน้อย 1 ตัว');
  return { valid: errors.length === 0, errors };
}

// ===== REGISTRATION FUNCTIONS =====
async function registerApplicant(data) {
  return await apiPost('register_applicant', data);
}

async function registerOrganization(data) {
  return await apiPost('register_organization', data);
}

async function getPendingRegistrations(filters = {}) {
  return await apiCall('get_pending_registrations', filters);
}

async function approveRegistration(reg_id, approved_by, notes) {
  return await apiPost('approve_registration', { reg_id, approved_by, notes });
}

async function rejectRegistration(reg_id, rejected_by, notes) {
  return await apiPost('reject_registration', { reg_id, rejected_by, notes });
}
