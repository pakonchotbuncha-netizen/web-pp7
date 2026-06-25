/**
 * PP7 Backend — Auth.gs
 * ระบบ Authentication และ Role-Based Access Control (RBAC)
 * 
 * Roles:
 *  - admin: เข้าถึงทุกระบบ P1-P7, จัดการ users/roles, ดู audit_log
 *  - hr_manager: เข้าถึง P1-P7 ทั้งหมด (แต่จัดการ users ไม่ได้)
 *  - bu_manager: เข้าถึง P1-P4 เฉพาะ BU ที่ตัวเองดูแล
 *  - employee: ดูข้อมูลตัวเอง (P4-P7), ขอ headcount (P1)
 *  - auditor: ดูอย่างเดียว (read-only) ทุกระบบ
 *  - guest: ดู Dashboard ได้เท่านั้น
 */

// ============================================================
// TOKEN MANAGEMENT
// ============================================================

var TOKEN_EXPIRY_HOURS = 24;

/**
 * สร้าง hash อย่างง่าย (ไม่ใช้ crypto ใน GAS)
 * @param {string} str - ข้อความที่จะ hash
 * @returns {string} hash string
 */
function simpleHash(str) {
  var hash = 0;
  for (var i = 0; i < str.length; i++) {
    var char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(36) + '_' + str.length.toString(36);
}

/**
 * สร้าง token ใหม่
 * @param {string} email
 * @returns {string} token
 */
function generateToken(email) {
  var timestamp = new Date().getTime();
  var random = Math.random().toString(36).substring(2);
  return simpleHash(email + timestamp + random);
}

/**
 * Login — ตรวจสอบ email/password แล้วคืน token
 * @param {string} email
 * @param {string} password
 * @returns {Object} { success, token, user, error? }
 */
function login(email, password) {
  try {
    var users = dbRead('users', { email: email, status: 'active' });
    
    if (users.length === 0) {
      return { success: false, error: 'ไม่พบบัญชีผู้ใช้นี้ หรือบัญชีถูกปิดใช้งาน' };
    }
    
    var user = users[0];
    var passwordHash = simpleHash(password);
    
    if (user.password_hash !== passwordHash) {
      return { success: false, error: 'รหัสผ่านไม่ถูกต้อง' };
    }
    
    // สร้าง token ใหม่
    var token = generateToken(email);
    var expiry = new Date();
    expiry.setHours(expiry.getHours() + TOKEN_EXPIRY_HOURS);
    
    // อัพเดท token ใน DB
    dbUpdate('users', user.id, {
      login_token: token,
      token_expiry: expiry.toISOString(),
      last_login: new Date().toISOString()
    }, email);
    
    // คืนข้อมูล user (ไม่ส่ง password กลับ)
    var safeUser = {
      id: user.id,
      email: user.email,
      display_name: user.display_name,
      role: user.role,
      employee_id: user.employee_id,
      business_unit_id: user.business_unit_id,
      country: user.country
    };
    
    auditLog(email, 'login', 'users', user.id, null, null);
    
    return { 
      success: true, 
      token: token, 
      user: safeUser,
      expires_at: expiry.toISOString()
    };
    
  } catch (e) {
    return { success: false, error: 'เกิดข้อผิดพลาด: ' + e.message };
  }
}

/**
 * Logout — ลบ token
 * @param {string} token
 * @returns {Object}
 */
function logout(token) {
  try {
    var authInfo = validateToken(token);
    if (!authInfo.success) return authInfo;
    
    dbUpdate('users', authInfo.user.id, {
      login_token: '',
      token_expiry: ''
    }, authInfo.user.email);
    
    auditLog(authInfo.user.email, 'logout', 'users', authInfo.user.id, null, null);
    
    return { success: true, message: 'ออกจากระบบแล้ว' };
    
  } catch (e) {
    return { success: false, error: e.message };
  }
}

/**
 * ตรวจสอบ token ว่ายังใช้ได้หรือไม่
 * @param {string} token
 * @returns {Object} { success, user?, error? }
 */
function validateToken(token) {
  if (!token || token === '') {
    return { success: false, error: 'ไม่มี token' };
  }
  
  try {
    var users = dbRead('users', { status: 'active' });
    
    for (var i = 0; i < users.length; i++) {
      var user = users[i];
      if (user.login_token === token) {
        // ตรวจสอบ expiry
        if (user.token_expiry) {
          var expiry = new Date(user.token_expiry);
          if (expiry < new Date()) {
            return { success: false, error: 'Token หมดอายุแล้ว กรุณาเข้าสู่ระบบใหม่' };
          }
        }
        
        var safeUser = {
          id: user.id,
          email: user.email,
          display_name: user.display_name,
          role: user.role,
          employee_id: user.employee_id,
          business_unit_id: user.business_unit_id,
          country: user.country
        };
        
        return { success: true, user: safeUser };
      }
    }
    
    return { success: false, error: 'Token ไม่ถูกต้อง หรือหมดอายุ' };
    
  } catch (e) {
    return { success: false, error: 'Token validation error: ' + e.message };
  }
}

// ============================================================
// ROLE-BASED ACCESS CONTROL (RBAC)
// ============================================================

/**
 * สิทธิ์การเข้าถึงแต่ละ Module ตาม Role
 * Format: { role: { module: { read: bool, write: bool, own_only: bool } } }
 */
var PERMISSIONS = {
  admin: {
    P1: { read: true, write: true },
    P2: { read: true, write: true },
    P3: { read: true, write: true },
    P4: { read: true, write: true },
    P5: { read: true, write: true },
    P6: { read: true, write: true },
    P7: { read: true, write: true },
    dashboard: { read: true },
    users: { read: true, write: true },
    audit_log: { read: true },
    settings: { read: true, write: true }
  },
  hr_manager: {
    P1: { read: true, write: true },
    P2: { read: true, write: true },
    P3: { read: true, write: true },
    P4: { read: true, write: true },
    P5: { read: true, write: true },
    P6: { read: true, write: true },
    P7: { read: true, write: true },
    dashboard: { read: true },
    users: { read: true, write: false },
    audit_log: { read: false },
    settings: { read: true, write: false }
  },
  bu_manager: {
    P1: { read: true, write: true, bu_scope: true },
    P2: { read: true, write: true, bu_scope: true },
    P3: { read: true, write: true, bu_scope: true },
    P4: { read: true, write: true, bu_scope: true },
    P5: { read: false, write: false },
    P6: { read: false, write: false },
    P7: { read: false, write: false },
    dashboard: { read: true, bu_scope: true },
    users: { read: false, write: false },
    audit_log: { read: false },
    settings: { read: false }
  },
  employee: {
    P1: { read: false, write: false, request_only: true },
    P2: { read: false, write: false },
    P3: { read: false, write: false },
    P4: { read: true, write: false, own_only: true },
    P5: { read: true, write: false, own_only: true },
    P6: { read: true, write: false, own_only: true },
    P7: { read: true, write: false, own_only: true },
    dashboard: { read: true, own_only: true },
    users: { read: false, write: false },
    audit_log: { read: false },
    settings: { read: false }
  },
  auditor: {
    P1: { read: true, write: false },
    P2: { read: true, write: false },
    P3: { read: true, write: false },
    P4: { read: true, write: false },
    P5: { read: true, write: false },
    P6: { read: true, write: false },
    P7: { read: true, write: false },
    dashboard: { read: true },
    users: { read: false, write: false },
    audit_log: { read: true },
    settings: { read: false }
  },
  guest: {
    P1: { read: false, write: false },
    P2: { read: false, write: false },
    P3: { read: false, write: false },
    P4: { read: false, write: false },
    P5: { read: false, write: false },
    P6: { read: false, write: false },
    P7: { read: false, write: false },
    dashboard: { read: true },
    users: { read: false, write: false },
    audit_log: { read: false },
    settings: { read: false }
  }
};

/**
 * ตรวจสอบสิทธิ์ผู้ใช้สำหรับ Module ที่กำหนด
 * @param {Object} user - ข้อมูล user จาก validateToken
 * @param {string} module - ชื่อ module เช่น 'P1', 'P2', 'dashboard'
 * @param {string} action - 'read' หรือ 'write'
 * @returns {Object} { allowed: boolean, reason?: string }
 */
function checkPermission(user, module, action) {
  if (!user || !user.role) {
    return { allowed: false, reason: 'ไม่ระบุ role' };
  }
  
  var role = user.role;
  var perms = PERMISSIONS[role];
  
  if (!perms) {
    return { allowed: false, reason: 'Role ไม่ถูกต้อง: ' + role };
  }
  
  var modulePerms = perms[module];
  if (!modulePerms) {
    return { allowed: false, reason: 'ไม่พบ module: ' + module };
  }
  
  if (action === 'read' && !modulePerms.read) {
    return { allowed: false, reason: 'ไม่มีสิทธิ์ดูข้อมูลใน ' + module };
  }
  
  if (action === 'write' && !modulePerms.write) {
    return { allowed: false, reason: 'ไม่มีสิทธิ์แก้ไขข้อมูลใน ' + module };
  }
  
  return { 
    allowed: true,
    bu_scope: modulePerms.bu_scope || false,
    own_only: modulePerms.own_only || false
  };
}

/**
 * ตรวจสอบและ Authenticate request
 * @param {string} token
 * @param {string} module
 * @param {string} action
 * @returns {Object} { success, user?, permissions?, error? }
 */
function authorize(token, module, action) {
  // ตรวจสอบ token
  var authResult = validateToken(token);
  if (!authResult.success) {
    return authResult;
  }
  
  // ตรวจสอบ permission
  var permResult = checkPermission(authResult.user, module, action);
  if (!permResult.allowed) {
    return { 
      success: false, 
      error: permResult.reason,
      user: authResult.user
    };
  }
  
  return {
    success: true,
    user: authResult.user,
    bu_scope: permResult.bu_scope || false,
    own_only: permResult.own_only || false
  };
}

/**
 * กรองข้อมูลตาม scope ของ user
 * @param {Array} data - ข้อมูลทั้งหมด
 * @param {Object} user - ข้อมูล user
 * @param {Object} scopeOptions - { bu_scope, own_only }
 * @returns {Array} ข้อมูลที่กรองแล้ว
 */
function filterByScope(data, user, scopeOptions) {
  if (!scopeOptions) return data;
  
  // BU Scope: แสดงเฉพาะข้อมูลของ BU ที่ user ดูแล
  if (scopeOptions.bu_scope && user.business_unit_id) {
    return data.filter(function(item) {
      return item.business_unit_id === user.business_unit_id;
    });
  }
  
  // Own Only: แสดงเฉพาะข้อมูลของตัวเอง
  if (scopeOptions.own_only && user.employee_id) {
    return data.filter(function(item) {
      return item.employee_id === user.employee_id;
    });
  }
  
  return data;
}

// ============================================================
// USER MANAGEMENT (admin only)
// ============================================================

/**
 * สร้างผู้ใช้ใหม่
 * @param {Object} userData
 * @param {string} adminEmail - ผู้ดำเนินการ (ต้องเป็น admin)
 */
function createUser(userData, adminEmail) {
  // ตรวจสอบว่าเป็น admin
  var adminAuth = authorize(userData._token, 'users', 'write');
  if (!adminAuth.success) {
    return { success: false, error: 'ไม่มีสิทธิ์สร้างผู้ใช้: ' + (adminAuth.error || 'ต้องเป็น admin') };
  }
  
  // ตรวจสอบ email ซ้ำ
  var existing = dbRead('users', { email: userData.email });
  if (existing.length > 0 && existing[0].status !== 'archived') {
    return { success: false, error: 'อีเมลนี้ถูกใช้แล้ว: ' + userData.email };
  }
  
  // Hash password
  userData.password_hash = simpleHash(userData.password || 'password123');
  delete userData.password;
  delete userData._token;
  
  // สร้าง user
  var newUser = dbCreate('users', userData, adminEmail);
  
  // ลบ password_hash ออกจาก response
  delete newUser.password_hash;
  
  return { success: true, user: newUser };
}

/**
 * อัปเดตข้อมูลผู้ใช้
 */
function updateUser(userId, updates, adminEmail) {
  var adminAuth = authorize(updates._token, 'users', 'write');
  if (!adminAuth.success) {
    return { success: false, error: 'ไม่มีสิทธิ์แก้ไขผู้ใช้' };
  }
  
  delete updates._token;
  
  if (updates.password) {
    updates.password_hash = simpleHash(updates.password);
    delete updates.password;
  }
  
  var updated = dbUpdate('users', userId, updates, adminEmail);
  delete updated.password_hash;
  
  return { success: true, user: updated };
}

/**
 * ดึงรายชื่อผู้ใช้ทั้งหมด
 */
function listUsers(token, filters) {
  var authResult = authorize(token, 'users', 'read');
  if (!authResult.success) {
    return { success: false, error: authResult.error };
  }
  
  var users = dbRead('users', filters);
  
  // ลบ password_hash และ token ออก
  users = users.map(function(u) {
    delete u.password_hash;
    delete u.login_token;
    delete u.token_expiry;
    return u;
  });
  
  return { success: true, users: users };
}
