/**
 * Web PP7 — Auth Backend (Google Apps Script)
 * เชื่อม Google Sheets กับระบบ RBAC 5 ระดับ
 * 
 * วิธีใช้:
 * 1. สร้าง Google Sheet ใหม่ ตั้งชื่อ "Web PP7 Auth"
 * 2. สร้าง 4 sheets: users, access_logs, password_recovery, sessions
 * 3. Deploy เป็น Web App (Execute as: Me, Access: Anyone)
 * 4. นำ URL ไปใส่ใน auth-config.js
 */

// ===== CONFIG =====
const SPREADSHEET_ID = 'YOUR_SPREADSHEET_ID_HERE'; // ← เปลี่ยนเป็น ID ของ Sheet
const SHEET_NAMES = {
  users: 'users',
  access_logs: 'access_logs',
  password_recovery: 'password_recovery',
  sessions: 'sessions',
  registrations: 'registrations' // สำหรับลงทะเบียนภายนอก
};

// ===== MAIN ROUTER =====
function doGet(e) {
  const action = e.parameter.action;
  let result;
  
  try {
    switch(action) {
      case 'login':
        result = handleLogin(e.parameter);
        break;
      case 'forgot_password':
        result = handleForgotPassword(e.parameter);
        break;
      case 'verify_otp':
        result = handleVerifyOtp(e.parameter);
        break;
      case 'reset_password':
        result = handleResetPassword(e.parameter);
        break;
      case 'get_users':
        result = handleGetUsers(e.parameter);
        break;
      case 'create_user':
        result = handleCreateUser(e.parameter);
        break;
      case 'update_user':
        result = handleUpdateUser(e.parameter);
        break;
      case 'delete_user':
        result = handleDeleteUser(e.parameter);
        break;
      case 'get_access_logs':
        result = handleGetAccessLogs(e.parameter);
        break;
      case 'log_access':
        result = handleLogAccess(e.parameter);
        break;
      case 'get_stats':
        result = handleGetStats(e.parameter);
        break;
      case 'register_applicant':
        result = handleRegisterApplicant(e.parameter);
        break;
      case 'register_organization':
        result = handleRegisterOrganization(e.parameter);
        break;
      case 'get_pending_registrations':
        result = handleGetPendingRegistrations(e.parameter);
        break;
      case 'approve_registration':
        result = handleApproveRegistration(e.parameter);
        break;
      case 'reject_registration':
        result = handleRejectRegistration(e.parameter);
        break;
      default:
        result = { success: false, error: 'Unknown action' };
    }
  } catch(err) {
    result = { success: false, error: err.toString() };
  }
  
  return ContentService.createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  // Support POST for actions that modify data
  const params = JSON.parse(e.postData.contents);
  const action = params.action;
  let result;
  
  try {
    switch(action) {
      case 'login':
        result = handleLogin(params);
        break;
      case 'create_user':
        result = handleCreateUser(params);
        break;
      case 'update_user':
        result = handleUpdateUser(params);
        break;
      case 'delete_user':
        result = handleDeleteUser(params);
        break;
      case 'log_access':
        result = handleLogAccess(params);
        break;
      case 'reset_password':
        result = handleResetPassword(params);
        break;
      case 'register_applicant':
        result = handleRegisterApplicant(params);
        break;
      case 'register_organization':
        result = handleRegisterOrganization(params);
        break;
      case 'approve_registration':
        result = handleApproveRegistration(params);
        break;
      case 'reject_registration':
        result = handleRejectRegistration(params);
        break;
      default:
        result = { success: false, error: 'Unknown action' };
    }
  } catch(err) {
    result = { success: false, error: err.toString() };
  }
  
  return ContentService.createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}

// ===== AUTH HANDLERS =====

function handleLogin(params) {
  const { employee_id, password } = params;
  if (!employee_id || !password) {
    return { success: false, error: 'Missing credentials' };
  }
  
  const sheet = getSheet(SHEET_NAMES.users);
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const idIdx = headers.indexOf('employee_id');
  const pwIdx = headers.indexOf('password_hash');
  const statusIdx = headers.indexOf('status');
  
  // Find user
  let userRow = -1;
  for (let i = 1; i < data.length; i++) {
    if (data[i][idIdx] === employee_id) {
      userRow = i;
      break;
    }
  }
  
  if (userRow === -1) {
    logAccess(employee_id, 'login', 'failed_user_not_found');
    return { success: false, error: 'ไม่พบ ID นี้ในระบบ' };
  }
  
  const user = rowToObject(data, headers, userRow);
  
  // Check status
  if (user.status === 'resigned') {
    logAccess(employee_id, 'login', 'failed_resigned');
    return { success: false, error: 'บัญชีนี้ถูกปิดแล้ว (ลาออก)' };
  }
  if (user.status === 'suspended') {
    logAccess(employee_id, 'login', 'failed_suspended');
    return { success: false, error: 'บัญชีนี้ถูกระงับชั่วคราว' };
  }
  if (user.status === 'locked') {
    const lockUntil = new Date(user.lock_until || 0).getTime();
    if (Date.now() < lockUntil) {
      const remain = Math.ceil((lockUntil - Date.now()) / 60000);
      return { success: false, error: `บัญชีถูกล็อก กรุณารอ ${remain} นาที` };
    } else {
      // Unlock
      sheet.getRange(userRow + 1, statusIdx + 1).setValue('active');
      sheet.getRange(userRow + 1, headers.indexOf('login_attempts') + 1).setValue(0);
    }
  }
  
  // Check password
  if (user.password_hash !== simpleHash(password)) {
    const attempts = (user.login_attempts || 0) + 1;
    sheet.getRange(userRow + 1, headers.indexOf('login_attempts') + 1).setValue(attempts);
    
    if (attempts >= 5) {
      const lockUntil = new Date(Date.now() + 30 * 60 * 1000).toISOString();
      sheet.getRange(userRow + 1, statusIdx + 1).setValue('locked');
      sheet.getRange(userRow + 1, headers.indexOf('lock_until') + 1).setValue(lockUntil);
      logAccess(employee_id, 'login', 'account_locked');
      return { success: false, error: 'บัญชีถูกล็อก 30 นาที (login ผิด 5 ครั้ง)' };
    }
    
    logAccess(employee_id, 'login', 'failed_wrong_password');
    return { success: false, error: `รหัสผ่านไม่ถูกต้อง (เหลือ ${5 - attempts} ครั้งก่อนล็อก)` };
  }
  
  // Success — reset attempts, update last login
  sheet.getRange(userRow + 1, headers.indexOf('login_attempts') + 1).setValue(0);
  sheet.getRange(userRow + 1, headers.indexOf('last_login') + 1).setValue(new Date().toISOString());
  
  // Create session
  const sessionToken = generateToken();
  const sessionSheet = getSheet(SHEET_NAMES.sessions);
  sessionSheet.appendRow([
    generateId('sess_'),
    employee_id,
    sessionToken,
    new Date(Date.now() + getSessionTimeout(user.role)).toISOString(),
    new Date().toISOString(),
    'active'
  ]);
  
  logAccess(employee_id, 'login', 'success');
  
  return {
    success: true,
    user: {
      employee_id: user.employee_id,
      name: user.name,
      role: user.role,
      department: user.department,
      email: user.email,
      force_change_pw: user.force_change_pw === 'TRUE' || user.force_change_pw === true
    },
    token: sessionToken,
    expires: new Date(Date.now() + getSessionTimeout(user.role)).toISOString()
  };
}

function handleForgotPassword(params) {
  const { employee_id, email } = params;
  if (!employee_id || !email) {
    return { success: false, error: 'กรุณากรอก ID และ Email' };
  }
  
  const sheet = getSheet(SHEET_NAMES.users);
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const idIdx = headers.indexOf('employee_id');
  const emailIdx = headers.indexOf('email');
  
  // Find user
  let userRow = -1;
  for (let i = 1; i < data.length; i++) {
    if (data[i][idIdx] === employee_id && data[i][emailIdx] === email) {
      userRow = i;
      break;
    }
  }
  
  if (userRow === -1) {
    return { success: false, error: 'ไม่พบ ID หรือ email ตรงในระบบ' };
  }
  
  // Generate OTP
  const otp = generateOtp();
  const otpExpires = new Date(Date.now() + 10 * 60 * 1000).toISOString();
  
  // Save to password_recovery sheet
  const recoverySheet = getSheet(SHEET_NAMES.password_recovery);
  recoverySheet.appendRow([
    generateId('R'),
    employee_id,
    'email',
    otp,
    otpExpires,
    'pending',
    new Date().toISOString()
  ]);
  
  // In production: send email via GmailApp
  // GmailApp.sendEmail(email, 'Web PP7 - รหัส OTP', `รหัส OTP ของคุณคือ: ${otp}\nหมดอายุใน 10 นาที`);
  
  logAccess(employee_id, 'request_reset', 'otp_sent');
  
  return {
    success: true,
    otp: otp, // Remove in production — only for demo
    message: 'ส่ง OTP ไปที่ email แล้ว'
  };
}

function handleVerifyOtp(params) {
  const { employee_id, otp } = params;
  if (!employee_id || !otp) {
    return { success: false, error: 'กรุณากรอก OTP' };
  }
  
  const sheet = getSheet(SHEET_NAMES.password_recovery);
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  
  // Find latest pending OTP for this user
  let otpRow = -1;
  for (let i = data.length - 1; i >= 1; i--) {
    if (data[i][headers.indexOf('employee_id')] === employee_id && 
        data[i][headers.indexOf('status')] === 'pending') {
      otpRow = i;
      break;
    }
  }
  
  if (otpRow === -1) {
    return { success: false, error: 'ไม่พบ OTP หรือ OTP หมดอายุแล้ว' };
  }
  
  const record = rowToObject(data, headers, otpRow);
  
  if (new Date(record.otp_expires) < new Date()) {
    sheet.getRange(otpRow + 1, headers.indexOf('status') + 1).setValue('expired');
    return { success: false, error: 'OTP หมดอายุแล้ว' };
  }
  
  if (record.otp_code !== otp) {
    return { success: false, error: 'OTP ไม่ถูกต้อง' };
  }
  
  // Mark as verified
  sheet.getRange(otpRow + 1, headers.indexOf('status') + 1).setValue('verified');
  
  return { success: true, message: 'OTP ถูกต้อง' };
}

function handleResetPassword(params) {
  const { employee_id, otp, new_password } = params;
  if (!employee_id || !otp || !new_password) {
    return { success: false, error: 'ข้อมูลไม่ครบ' };
  }
  
  // Verify OTP first
  const verifyResult = handleVerifyOtp({ employee_id, otp });
  if (!verifyResult.success) {
    return verifyResult;
  }
  
  // Validate password
  const validation = validatePassword(new_password);
  if (!validation.valid) {
    return { success: false, error: validation.errors.join(', ') };
  }
  
  // Update password
  const sheet = getSheet(SHEET_NAMES.users);
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const idIdx = headers.indexOf('employee_id');
  const pwIdx = headers.indexOf('password_hash');
  const forceIdx = headers.indexOf('force_change_pw');
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][idIdx] === employee_id) {
      sheet.getRange(i + 1, pwIdx + 1).setValue(simpleHash(new_password));
      sheet.getRange(i + 1, forceIdx + 1).setValue('FALSE');
      break;
    }
  }
  
  // Mark OTP as used
  const recoverySheet = getSheet(SHEET_NAMES.password_recovery);
  const recData = recoverySheet.getDataRange().getValues();
  for (let i = recData.length - 1; i >= 1; i--) {
    if (recData[i][headers.indexOf('employee_id')] === employee_id && 
        recData[i][headers.indexOf('status')] === 'verified') {
      recoverySheet.getRange(i + 1, headers.indexOf('status') + 1).setValue('used');
      break;
    }
  }
  
  logAccess(employee_id, 'reset_password', 'completed');
  
  return { success: true, message: 'ตั้งรหัสผ่านใหม่สำเร็จ' };
}

// ===== USER MANAGEMENT =====

function handleGetUsers(params) {
  const { role, status, search } = params || {};
  const sheet = getSheet(SHEET_NAMES.users);
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  
  let users = [];
  for (let i = 1; i < data.length; i++) {
    const user = rowToObject(data, headers, i);
    // Remove sensitive data
    delete user.password_hash;
    
    // Filter
    if (role && user.role !== role) continue;
    if (status && user.status !== status) continue;
    if (search) {
      const s = search.toLowerCase();
      if (!user.employee_id.toLowerCase().includes(s) && 
          !user.name.toLowerCase().includes(s) &&
          !(user.email || '').toLowerCase().includes(s)) continue;
    }
    
    users.push(user);
  }
  
  return { success: true, users };
}

function handleCreateUser(params) {
  const { employee_id, name, email, phone, department, role, status, password } = params;
  if (!employee_id || !name || !email || !role) {
    return { success: false, error: 'กรุณากรอกข้อมูลให้ครบ' };
  }
  
  const sheet = getSheet(SHEET_NAMES.users);
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const idIdx = headers.indexOf('employee_id');
  
  // Check duplicate
  for (let i = 1; i < data.length; i++) {
    if (data[i][idIdx] === employee_id) {
      return { success: false, error: 'ID นี้มีอยู่แล้วในระบบ' };
    }
  }
  
  // Add user
  sheet.appendRow([
    employee_id,
    name,
    email,
    phone || '',
    department || '',
    role,
    status || 'active',
    simpleHash(password || 'Pp7@2026'),
    'TRUE', // force_change_pw
    0, // login_attempts
    '', // lock_until
    new Date().toISOString(), // created
    new Date().toISOString(), // updated
    '' // last_login
  ]);
  
  logAccess(employee_id, 'user_created', `by ${params.created_by || 'admin'}`);
  
  return { success: true, message: 'สร้างผู้ใช้สำเร็จ' };
}

function handleUpdateUser(params) {
  const { employee_id, name, email, phone, department, role, status } = params;
  if (!employee_id) {
    return { success: false, error: 'กรุณาระบุ employee_id' };
  }
  
  const sheet = getSheet(SHEET_NAMES.users);
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const idIdx = headers.indexOf('employee_id');
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][idIdx] === employee_id) {
      if (name) sheet.getRange(i + 1, headers.indexOf('name') + 1).setValue(name);
      if (email) sheet.getRange(i + 1, headers.indexOf('email') + 1).setValue(email);
      if (phone !== undefined) sheet.getRange(i + 1, headers.indexOf('phone') + 1).setValue(phone);
      if (department !== undefined) sheet.getRange(i + 1, headers.indexOf('department') + 1).setValue(department);
      if (role) sheet.getRange(i + 1, headers.indexOf('role') + 1).setValue(role);
      if (status) sheet.getRange(i + 1, headers.indexOf('status') + 1).setValue(status);
      sheet.getRange(i + 1, headers.indexOf('updated') + 1).setValue(new Date().toISOString());
      
      logAccess(employee_id, 'user_updated', `by ${params.updated_by || 'admin'}`);
      return { success: true, message: 'อัพเดทสำเร็จ' };
    }
  }
  
  return { success: false, error: 'ไม่พบผู้ใช้' };
}

function handleDeleteUser(params) {
  const { employee_id } = params;
  if (!employee_id) {
    return { success: false, error: 'กรุณาระบุ employee_id' };
  }
  
  // Soft delete — set status to resigned
  return handleUpdateUser({ employee_id, status: 'resigned' });
}

// ===== ACCESS LOGS =====

function handleGetAccessLogs(params) {
  const { employee_id, action, limit } = params || {};
  const sheet = getSheet(SHEET_NAMES.access_logs);
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  
  let logs = [];
  const startIdx = Math.max(1, data.length - (parseInt(limit) || 100));
  
  for (let i = data.length - 1; i >= startIdx; i--) {
    const log = rowToObject(data, headers, i);
    if (employee_id && log.employee_id !== employee_id) continue;
    if (action && log.action !== action) continue;
    logs.push(log);
  }
  
  return { success: true, logs };
}

function handleLogAccess(params) {
  const { employee_id, action, result } = params;
  if (!employee_id || !action) return { success: false };
  
  const sheet = getSheet(SHEET_NAMES.access_logs);
  sheet.appendRow([
    generateId('L'),
    employee_id,
    action,
    '', // ip
    '', // device
    new Date().toISOString(),
    result || ''
  ]);
  
  return { success: true };
}

// ===== STATS =====

function handleGetStats(params) {
  const usersSheet = getSheet(SHEET_NAMES.users);
  const logsSheet = getSheet(SHEET_NAMES.access_logs);
  
  const usersData = usersSheet.getDataRange().getValues();
  const logsData = logsSheet.getDataRange().getValues();
  
  const userHeaders = usersData[0];
  const logHeaders = logsData[0];
  
  // Count by status
  const statusCounts = {};
  for (let i = 1; i < usersData.length; i++) {
    const status = usersData[i][userHeaders.indexOf('status')];
    statusCounts[status] = (statusCounts[status] || 0) + 1;
  }
  
  // Count by role
  const roleCounts = {};
  for (let i = 1; i < usersData.length; i++) {
    const role = usersData[i][userHeaders.indexOf('role')];
    roleCounts[role] = (roleCounts[role] || 0) + 1;
  }
  
  // Today's logins
  const today = new Date().toISOString().split('T')[0];
  let todayLogins = 0;
  let todayActive = new Set();
  for (let i = 1; i < logsData.length; i++) {
    const ts = logsData[i][logHeaders.indexOf('timestamp')];
    if (ts && ts.toString().startsWith(today)) {
      const action = logsData[i][logHeaders.indexOf('action')];
      if (action === 'login') todayLogins++;
      todayActive.add(logsData[i][logHeaders.indexOf('employee_id')]);
    }
  }
  
  return {
    success: true,
    stats: {
      totalUsers: usersData.length - 1,
      statusCounts,
      roleCounts,
      todayLogins,
      todayActiveUsers: todayActive.size,
      totalLogs: logsData.length - 1
    }
  };
}

// ===== HELPER FUNCTIONS =====

function getSheet(name) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  let sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
    // Initialize headers
    switch(name) {
      case 'users':
        sheet.appendRow(['employee_id', 'name', 'email', 'phone', 'department', 'role', 'status', 'password_hash', 'force_change_pw', 'login_attempts', 'lock_until', 'created', 'updated', 'last_login']);
        break;
      case 'access_logs':
        sheet.appendRow(['log_id', 'employee_id', 'action', 'ip', 'device', 'timestamp', 'result']);
        break;
      case 'password_recovery':
        sheet.appendRow(['request_id', 'employee_id', 'method', 'otp_code', 'otp_expires', 'status', 'created']);
        break;
      case 'sessions':
        sheet.appendRow(['session_id', 'employee_id', 'token', 'expires', 'last_active', 'status']);
        break;
      case 'registrations':
        sheet.appendRow(['reg_id', 'type', 'name', 'email', 'phone', 'position', 'organization', 'message', 'otp_code', 'otp_expires', 'status', 'password_hash', 'created', 'reviewed_by', 'reviewed_at', 'notes']);
        break;
    }
  }
  return sheet;
}

function rowToObject(data, headers, rowIdx) {
  const obj = {};
  for (let i = 0; i < headers.length; i++) {
    obj[headers[i]] = data[rowIdx][i];
  }
  return obj;
}

function generateId(prefix) {
  return prefix + Utilities.getUuid().replace(/-/g, '').substring(0, 12);
}

function generateToken() {
  return Utilities.getUuid().replace(/-/g, '');
}

function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function simpleHash(str) {
  const raw = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, str);
  return raw.map(b => ('0' + (b & 0xFF).toString(16)).slice(-2)).join('');
}

function validatePassword(password) {
  const errors = [];
  if (password.length < 8) errors.push('รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร');
  if (!/[A-Z]/.test(password)) errors.push('ต้องมีตัวอักษรพิมพ์ใหญ่');
  if (!/[a-z]/.test(password)) errors.push('ต้องมีตัวอักษรพิมพ์เล็ก');
  if (!/[0-9]/.test(password)) errors.push('ต้องมีตัวเลข');
  return { valid: errors.length === 0, errors };
}

function getSessionTimeout(role) {
  const timeouts = {
    admin: 8 * 60 * 60 * 1000,
    operator: 8 * 60 * 60 * 1000,
    bmc: 8 * 60 * 60 * 1000,
    user: 4 * 60 * 60 * 1000,
    external: 2 * 60 * 60 * 1000
  };
  return timeouts[role] || timeouts.user;
}

function logAccess(employee_id, action, result) {
  try {
    const sheet = getSheet(SHEET_NAMES.access_logs);
    sheet.appendRow([
      generateId('L'),
      employee_id,
      action,
      '', '', new Date().toISOString(), result
    ]);
  } catch(e) {
    // Silently fail — don't block main operation
  }
}

// ===== REGISTRATION HANDLERS =====

function handleRegisterApplicant(params) {
  const { name, email, phone, position, password } = params;
  if (!name || !email || !phone || !position) {
    return { success: false, error: 'กรุณากรอกข้อมูลให้ครบ' };
  }
  
  // Validate email
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { success: false, error: 'Email ไม่ถูกต้อง' };
  }
  
  // Check duplicate email
  const usersSheet = getSheet(SHEET_NAMES.users);
  const usersData = usersSheet.getDataRange().getValues();
  const userHeaders = usersData[0];
  const emailIdx = userHeaders.indexOf('email');
  for (let i = 1; i < usersData.length; i++) {
    if (usersData[i][emailIdx] === email) {
      return { success: false, error: 'Email นี้ถูกใช้แล้วในระบบ' };
    }
  }
  
  // Check pending registrations
  const regSheet = getSheet(SHEET_NAMES.registrations);
  const regData = regSheet.getDataRange().getValues();
  const regHeaders = regData[0];
  for (let i = 1; i < regData.length; i++) {
    if (regData[i][regHeaders.indexOf('email')] === email && 
        regData[i][regHeaders.indexOf('status')] === 'pending') {
      return { success: false, error: 'มีคำขอลงทะเบียนรอตรวจสอบอยู่แล้ว' };
    }
  }
  
  // Generate OTP for email verification
  const otp = generateOtp();
  const otpExpires = new Date(Date.now() + 10 * 60 * 1000).toISOString();
  
  // Save registration
  regSheet.appendRow([
    generateId('REG-APP-'),
    'applicant',
    name,
    email,
    phone,
    position,
    '', // organization
    params.message || '',
    otp,
    otpExpires,
    'pending',
    password ? simpleHash(password) : '',
    new Date().toISOString(),
    '', // reviewed_by
    '', // reviewed_at
    '' // notes
  ]);
  
  // TODO: Send OTP via email
  // GmailApp.sendEmail(email, 'Web PP7 - ยืนยันการลงทะเบียน', `รหัส OTP: ${otp}\nหมดอายุใน 10 นาที`);
  
  return { 
    success: true, 
    message: 'ลงทะเบียนสำเร็จ กรุณาตรวจสอบ email เพื่อยืนยัน',
    otp: otp, // Remove in production
    reg_id: regSheet.getRange(regSheet.getLastRow(), 1).getValue()
  };
}

function handleRegisterOrganization(params) {
  const { name, email, phone, organization, message } = params;
  if (!name || !email || !phone || !organization) {
    return { success: false, error: 'กรุณากรอกข้อมูลให้ครบ' };
  }
  
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { success: false, error: 'Email ไม่ถูกต้อง' };
  }
  
  // Check duplicate
  const usersSheet = getSheet(SHEET_NAMES.users);
  const usersData = usersSheet.getDataRange().getValues();
  const userHeaders = usersData[0];
  for (let i = 1; i < usersData.length; i++) {
    if (usersData[i][userHeaders.indexOf('email')] === email) {
      return { success: false, error: 'Email นี้ถูกใช้แล้วในระบบ' };
    }
  }
  
  const otp = generateOtp();
  const otpExpires = new Date(Date.now() + 10 * 60 * 1000).toISOString();
  
  const regSheet = getSheet(SHEET_NAMES.registrations);
  regSheet.appendRow([
    generateId('REG-GOV-'),
    'organization',
    name,
    email,
    phone,
    '', // position
    organization,
    message || '',
    otp,
    otpExpires,
    'pending',
    '', // password set later
    new Date().toISOString(),
    '', '', ''
  ]);
  
  return { 
    success: true, 
    message: 'ลงทะเบียนสำเร็จ กรุณาตรวจสอบ email เพื่อยืนยัน',
    otp: otp,
    reg_id: regSheet.getRange(regSheet.getLastRow(), 1).getValue()
  };
}

function handleGetPendingRegistrations(params) {
  const { type, status } = params || {};
  const sheet = getSheet(SHEET_NAMES.registrations);
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  
  let registrations = [];
  for (let i = 1; i < data.length; i++) {
    const reg = rowToObject(data, headers, i);
    delete reg.otp_code; // Don't expose OTP
    delete reg.password_hash;
    
    if (type && reg.type !== type) continue;
    if (status && reg.status !== status) continue;
    registrations.push(reg);
  }
  
  return { success: true, registrations };
}

function handleApproveRegistration(params) {
  const { reg_id, approved_by, notes } = params;
  if (!reg_id) {
    return { success: false, error: 'กรุณาระบุ reg_id' };
  }
  
  const regSheet = getSheet(SHEET_NAMES.registrations);
  const regData = regSheet.getDataRange().getValues();
  const regHeaders = regData[0];
  const regIdIdx = regHeaders.indexOf('reg_id');
  
  let regRow = -1;
  for (let i = 1; i < regData.length; i++) {
    if (regData[i][regIdIdx] === reg_id) {
      regRow = i;
      break;
    }
  }
  
  if (regRow === -1) {
    return { success: false, error: 'ไม่พบคำขอนี้' };
  }
  
  const reg = rowToObject(regData, regHeaders, regRow);
  
  if (reg.status !== 'pending') {
    return { success: false, error: 'คำขอนี้ถูกประมวลผลแล้ว' };
  }
  
  // Generate employee_id
  const prefix = reg.type === 'applicant' ? 'EXT-APP-' : 'EXT-GOV-';
  const usersSheet = getSheet(SHEET_NAMES.users);
  const usersData = usersSheet.getDataRange().getValues();
  let maxNum = 0;
  const userHeaders = usersData[0];
  for (let i = 1; i < usersData.length; i++) {
    const uid = usersData[i][userHeaders.indexOf('employee_id')];
    if (uid && uid.startsWith(prefix)) {
      const num = parseInt(uid.replace(prefix, '')) || 0;
      if (num > maxNum) maxNum = num;
    }
  }
  const newId = prefix + String(maxNum + 1).padStart(3, '0');
  
  // Create user account
  const password = reg.password_hash || simpleHash('Pp7@2026');
  usersSheet.appendRow([
    newId,
    reg.name,
    reg.email,
    reg.phone,
    reg.organization || '-',
    'external',
    'active',
    password,
    'TRUE', // force_change_pw
    0, '',
    new Date().toISOString(),
    new Date().toISOString(),
    ''
  ]);
  
  // Update registration status
  regSheet.getRange(regRow + 1, regHeaders.indexOf('status') + 1).setValue('approved');
  regSheet.getRange(regRow + 1, regHeaders.indexOf('reviewed_by') + 1).setValue(approved_by || 'admin');
  regSheet.getRange(regRow + 1, regHeaders.indexOf('reviewed_at') + 1).setValue(new Date().toISOString());
  if (notes) regSheet.getRange(regRow + 1, regHeaders.indexOf('notes') + 1).setValue(notes);
  
  logAccess(newId, 'registration_approved', `by ${approved_by || 'admin'}`);
  
  return { 
    success: true, 
    message: `อนุมัติสำเร็จ — ID: ${newId}`,
    employee_id: newId
  };
}

function handleRejectRegistration(params) {
  const { reg_id, rejected_by, notes } = params;
  if (!reg_id) {
    return { success: false, error: 'กรุณาระบุ reg_id' };
  }
  
  const regSheet = getSheet(SHEET_NAMES.registrations);
  const regData = regSheet.getDataRange().getValues();
  const regHeaders = regData[0];
  const regIdIdx = regHeaders.indexOf('reg_id');
  
  for (let i = 1; i < regData.length; i++) {
    if (regData[i][regIdIdx] === reg_id) {
      regSheet.getRange(i + 1, regHeaders.indexOf('status') + 1).setValue('rejected');
      regSheet.getRange(i + 1, regHeaders.indexOf('reviewed_by') + 1).setValue(rejected_by || 'admin');
      regSheet.getRange(i + 1, regHeaders.indexOf('reviewed_at') + 1).setValue(new Date().toISOString());
      if (notes) regSheet.getRange(i + 1, regHeaders.indexOf('notes') + 1).setValue(notes);
      
      logAccess(reg_id, 'registration_rejected', `by ${rejected_by || 'admin'}`);
      return { success: true, message: 'ปฏิเสธคำขอแล้ว' };
    }
  }
  
  return { success: false, error: 'ไม่พบคำขอนี้' };
}

// ===== SETUP FUNCTION =====
function setup() {
  // Run this once to create all sheets with headers
  getSheet(SHEET_NAMES.users);
  getSheet(SHEET_NAMES.access_logs);
  getSheet(SHEET_NAMES.password_recovery);
  getSheet(SHEET_NAMES.sessions);
  getSheet(SHEET_NAMES.registrations);
  
  // Add demo users
  const sheet = getSheet(SHEET_NAMES.users);
  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) {
    const demoUsers = [
      ['PKG001', 'ปกรณ์', 'pakorn@pkg.co.th', '', 'Executive', 'admin', 'active', simpleHash('pass1234'), 'TRUE', 0, '', new Date().toISOString(), '', ''],
      ['HR001', 'สมชาย ใจดี', 'somchai@pkg.co.th', '', 'HR', 'operator', 'active', simpleHash('pass1234'), 'TRUE', 0, '', new Date().toISOString(), '', ''],
      ['BMC001', 'ดร.สมศักดิ์', 'somsak@pkg.co.th', '', 'BMC', 'bmc', 'active', simpleHash('pass1234'), 'TRUE', 0, '', new Date().toISOString(), '', ''],
      ['EMP001', 'นิพนธ์ รักงาน', 'niphon@pkg.co.th', '', 'Production', 'user', 'active', simpleHash('pass1234'), 'TRUE', 0, '', new Date().toISOString(), '', ''],
      ['EXT-APP-001', 'ผู้สมัคร A', 'applicant.a@gmail.com', '', '-', 'external', 'active', simpleHash('pass1234'), 'TRUE', 0, '', new Date().toISOString(), '', '']
    ];
    demoUsers.forEach(u => sheet.appendRow(u));
  }
  
  Logger.log('Setup complete!');
}
