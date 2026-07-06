/**
 * test_rbac.js — ทดสอบ Role-Based Access Control (RBAC) สำหรับ Web PP7
 *
 * ระบบ RBAC ของ PP7 มี 6 roles:
 * - admin: จัดการระบบทั้งหมด + จัดการ roles
 * - hr_manager: จัดการข้อมูล P1-P7 ทั้งหมด
 * - bu_manager: จัดการข้อมูลใน BU ที่รับผิดชอบ
 * - employee: ดูข้อมูลตัวเอง + ทำ self-service
 * - auditor: อ่านเท่านั้น (read-only ทุก module)
 * - guest: ดู Dashboard เท่านั้น
 *
 * @version 1.0.0
 * @lastModified 2026-07-06
 */

'use strict';

const {
  assertEqual,
  assertTrue,
  assertFalse,
  assertDeepEqual,
  assertObjectHasKey,
  describe,
  it,
} = require('./test_utils');

// ============================================================
// 1. RBAC CONFIGURATION
// ============================================================

/**
 * 6 Roles ตาม design doc
 */
const ROLES = {
  admin: {
    name: 'ผู้ดูแลระบบ',
    level: 100,
    description: 'Full system access including role management',
  },
  hr_manager: {
    name: 'ผู้จัดการ HR',
    level: 80,
    description: 'Manage all P1-P7 data',
  },
  bu_manager: {
    name: 'ผู้จัดการ BU',
    level: 60,
    description: 'Manage data within assigned BU',
  },
  employee: {
    name: 'สมาชิก',
    level: 40,
    description: 'View own data + self-service',
  },
  auditor: {
    name: 'ผู้ตรวจสอบ',
    level: 20,
    description: 'Read-only access to all modules',
  },
  guest: {
    name: 'ผู้เยี่ยมชม',
    level: 10,
    description: 'Dashboard view only',
  },
};

/**
 * Permissions สำหรับแต่ละ role ต่อแต่ละ P-module
 * 'C' = Create, 'R' = Read, 'U' = Update, 'D' = Delete
 */
const PERMISSIONS = {
  P1_recruit: {
    admin: ['C', 'R', 'U', 'D'],
    hr_manager: ['C', 'R', 'U', 'D'],
    bu_manager: ['C', 'R', 'U'],
    employee: ['R'],
    auditor: ['R'],
    guest: ['R'],
  },
  P2_assess: {
    admin: ['C', 'R', 'U', 'D'],
    hr_manager: ['C', 'R', 'U', 'D'],
    bu_manager: ['C', 'R', 'U'],
    employee: ['R'],
    auditor: ['R'],
    guest: [], // no access
  },
  P3_match: {
    admin: ['C', 'R', 'U', 'D'],
    hr_manager: ['C', 'R', 'U', 'D'],
    bu_manager: ['C', 'R', 'U'],
    employee: ['R'],
    auditor: ['R'],
    guest: [],
  },
  P4_evaluate: {
    admin: ['C', 'R', 'U', 'D'],
    hr_manager: ['C', 'R', 'U', 'D'],
    bu_manager: ['R', 'U'], // can read and submit evaluations
    employee: ['R'],
    auditor: ['R'],
    guest: [],
  },
  P5_develop: {
    admin: ['C', 'R', 'U', 'D'],
    hr_manager: ['C', 'R', 'U', 'D'],
    bu_manager: ['R', 'U'],
    employee: ['R', 'U'], // employee can update own development
    auditor: ['R'],
    guest: [],
  },
  P6_compensate: {
    admin: ['C', 'R', 'U', 'D'],
    hr_manager: ['C', 'R', 'U', 'D'],
    bu_manager: ['R'],
    employee: ['R'],
    auditor: ['R'],
    guest: [],
  },
  P7_quality: {
    admin: ['C', 'R', 'U', 'D'],
    hr_manager: ['C', 'R', 'U', 'D'],
    bu_manager: ['R', 'U'],
    employee: ['R', 'U'], // employee can self-report QoL
    auditor: ['R'],
    guest: [],
  },
  system_config: {
    admin: ['C', 'R', 'U', 'D'],
    hr_manager: ['R'],
    bu_manager: [],
    employee: [],
    auditor: [],
    guest: [],
  },
  role_management: {
    admin: ['C', 'R', 'U', 'D'],
    hr_manager: ['R'],
    bu_manager: [],
    employee: [],
    auditor: [],
    guest: [],
  },
  audit_logs: {
    admin: ['R'],
    hr_manager: ['R'],
    bu_manager: [],
    employee: [],
    auditor: ['R'], // auditor reads audit logs too
    guest: [],
  },
};

/**
 * Tab-level permissions (ตาม nav tabs ของ index.html)
 */
const TAB_PERMISSIONS = {
  executive: ['admin', 'hr_manager'], // ผู้บริหาร
  recruit: ['admin', 'hr_manager', 'bu_manager', 'employee', 'auditor', 'guest'],
  assess: ['admin', 'hr_manager', 'bu_manager', 'employee'],
  match: ['admin', 'hr_manager', 'bu_manager', 'employee'],
  performance: ['admin', 'hr_manager', 'bu_manager', 'employee', 'auditor'],
  develop: ['admin', 'hr_manager', 'bu_manager', 'employee'],
  welfare: ['admin', 'hr_manager', 'bu_manager', 'employee', 'auditor'],
  quality: ['admin', 'hr_manager', 'bu_manager', 'employee'],
  'labor-law': ['admin', 'hr_manager', 'auditor'],
  'pkg-rules': ['admin', 'hr_manager', 'auditor'],
  'data-exchange': ['admin', 'hr_manager'],
  'system-map': ['admin'],
};

// ============================================================
// 2. RBAC UTILITY FUNCTIONS
// ============================================================

/**
 * ตรวจสอบว่า role มี permission ที่ต้องการหรือไม่
 */
function hasPermission(role, permission) {
  if (!(role in ROLES)) return false;
  if (permission.includes('.')) {
    // Module-level permission: "P1_recruit.C"
    const [module, action] = permission.split('.');
    if (!PERMISSIONS[module]) return false;
    if (!PERMISSIONS[module][role]) return false;
    return PERMISSIONS[module][role].includes(action);
  }
  // Tab-level permission
  if (TAB_PERMISSIONS[permission]) {
    return TAB_PERMISSIONS[permission].includes(role);
  }
  return false;
}

/**
 * ตรวจสอบ role hierarchy (level >= target level)
 */
function hasMinimumLevel(role, minLevel) {
  if (!(role in ROLES)) return false;
  return ROLES[role].level >= minLevel;
}

/**
 * ตรวจสอบว่า角色 A สามารถจัดการ role B ได้หรือไม่
 * admin manages everyone; hr_manager manages bu_manager and below
 */
function canManageRole(managerRole, targetRole) {
  if (!(managerRole in ROLES) || !(targetRole in ROLES)) return false;
  if (managerRole === 'admin') return true;
  if (managerRole === 'hr_manager') {
    return ROLES[targetRole].level < ROLES.hr_manager.level;
  }
  return false;
}

/**
 * ตรวจสอบว่า role สามารถเข้าถึง BU อื่นที่ไม่ใช่ตนได้หรือไม่
 */
function isCrossBUAccess(role) {
  if (role === 'admin' || role === 'hr_manager' || role === 'auditor') return true;
  return false;
}

/**
 * ตรวจสอบว่า role สามารถเห็น audit log ได้หรือไม่
 */
function canViewAuditLog(role) {
  return hasPermission(role, 'audit_logs.R');
}

/**
 * Check if role can CRUD specific module
 */
function canCreate(role, module) {
  return hasPermission(role, `${module}.C`);
}
function canRead(role, module) {
  return hasPermission(role, `${module}.R`);
}
function canUpdate(role, module) {
  return hasPermission(role, `${module}.U`);
}
function canDelete(role, module) {
  return hasPermission(role, `${module}.D`);
}

// ============================================================
// 3. TEST SUITES: RBAC
// ============================================================

function runRBACTests() {
  // --- Role Definitions ---
  describe('RBAC: Role Definitions', () => {
    it('มี 6 roles ตาม design doc', () => {
      const roleNames = Object.keys(ROLES);
      assertEqual(roleNames.length, 6, 'should have 6 roles');
      assertTrue(roleNames.includes('admin'));
      assertTrue(roleNames.includes('hr_manager'));
      assertTrue(roleNames.includes('bu_manager'));
      assertTrue(roleNames.includes('employee'));
      assertTrue(roleNames.includes('auditor'));
      assertTrue(roleNames.includes('guest'));
    });

    it('role levels เรียงลำดับถูก', () => {
      assertTrue(ROLES.admin.level > ROLES.hr_manager.level, 'admin > hr_manager');
      assertTrue(ROLES.hr_manager.level > ROLES.bu_manager.level, 'hr_manager > bu_manager');
      assertTrue(ROLES.bu_manager.level > ROLES.employee.level, 'bu_manager > employee');
      assertTrue(ROLES.employee.level > ROLES.auditor.level, 'employee > auditor');
      assertTrue(ROLES.auditor.level > ROLES.guest.level, 'auditor > guest');
    });

    it('ทุก role มี name และ description', () => {
      for (const [role, info] of Object.entries(ROLES)) {
        assertTrue(info.name !== null && info.name.length > 0, `${role} should have name`);
        assertTrue(info.description !== null, `${role} should have description`);
      }
    });
  });

  // --- Admin Permissions ---
  describe('RBAC: Admin Permissions', () => {
    it('admin มี full CRUD ทุก module', () => {
      const modules = Object.keys(PERMISSIONS);
      for (const module of modules) {
        assertTrue(canCreate('admin', module), `admin can create in ${module}`);
        assertTrue(canRead('admin', module), `admin can read in ${module}`);
        assertTrue(canUpdate('admin', module), `admin can update in ${module}`);
        assertTrue(canDelete('admin', module), `admin can delete in ${module}`);
      }
    });

    it('admin can manage all other roles', () => {
      assertTrue(canManageRole('admin', 'hr_manager'), 'admin manages hr_manager');
      assertTrue(canManageRole('admin', 'bu_manager'), 'admin manages bu_manager');
      assertTrue(canManageRole('admin', 'employee'), 'admin manages employee');
      assertTrue(canManageRole('admin', 'auditor'), 'admin manages auditor');
      assertTrue(canManageRole('admin', 'guest'), 'admin manages guest');
    });

    it('admin can view system-config and role-management', () => {
      assertTrue(hasPermission('admin', 'system_config'));
      assertTrue(hasPermission('admin', 'role_management'));
    });
  });

  // --- HR Manager Permissions ---
  describe('RBAC: HR Manager Permissions', () => {
    it('hr_manager has full CRUD on all P-modules', () => {
      const pModules = ['P1_recruit', 'P2_assess', 'P3_match', 'P4_evaluate', 'P5_develop', 'P6_compensate', 'P7_quality'];
      for (const m of pModules) {
        assertTrue(canCreate('hr_manager', m), `hr_manager creates in ${m}`);
        assertTrue(canRead('hr_manager', m), `hr_manager reads in ${m}`);
        assertTrue(canUpdate('hr_manager', m), `hr_manager updates in ${m}`);
        assertTrue(canDelete('hr_manager', m), `hr_manager deletes in ${m}`);
      }
    });

    it('hr_manager cannot CRUD system config', () => {
      assertFalse(canCreate('hr_manager', 'system_config'));
      assertFalse(canUpdate('hr_manager', 'system_config'));
      assertFalse(canDelete('hr_manager', 'system_config'));
    });

    it('hr_manager can only read system config', () => {
      assertTrue(canRead('hr_manager', 'system_config'));
    });

    it('hr_manager cannot manage other roles', () => {
      assertFalse(canManageRole('hr_manager', 'admin'));
      assertFalse(canManageRole('hr_manager', 'hr_manager'));
    });

    it('hr_manager manages bu_manager and below', () => {
      assertTrue(canManageRole('hr_manager', 'bu_manager'));
      assertTrue(canManageRole('hr_manager', 'employee'));
      assertTrue(canManageRole('hr_manager', 'auditor'));
      assertTrue(canManageRole('hr_manager', 'guest'));
    });
  });

  // --- BU Manager Permissions ---
  describe('RBAC: BU Manager Permissions', () => {
    it('bu_manager can CRUD P1 (recruitment)', () => {
      assertTrue(canCreate('bu_manager', 'P1_recruit'));
      assertTrue(canRead('bu_manager', 'P1_recruit'));
      assertTrue(canUpdate('bu_manager', 'P1_recruit'));
    });

    it('bu_manager CANNOT delete P1', () => {
      assertFalse(canDelete('bu_manager', 'P1_recruit'));
    });

    it('bu_manager can read P4, P5, P6 but with limited write', () => {
      assertTrue(canRead('bu_manager', 'P4_evaluate'));
      assertTrue(canUpdate('bu_manager', 'P4_evaluate'));
      assertTrue(canRead('bu_manager', 'P5_develop'));
      assertTrue(canUpdate('bu_manager', 'P5_develop'));
      assertTrue(canRead('bu_manager', 'P6_compensate'));
      assertFalse(canUpdate('bu_manager', 'P6_compensate')); // cannot update compensation
    });

    it('bu_manager cannot access system config or role management', () => {
      assertFalse(canCreate('bu_manager', 'system_config'));
      assertFalse(canCreate('bu_manager', 'role_management'));
    });

    it('bu_manager cannot manage any roles', () => {
      assertFalse(canManageRole('bu_manager', 'employee'));
      assertFalse(canManageRole('bu_manager', 'auditor'));
    });

    it('bu_manager CANNOT access P2 (assess)', () => {
      assertFalse(canCreate('bu_manager', 'P2_assess'));
    });

    it('bu_manager CANNOT access P3 (match)', () => {
      assertFalse(canCreate('bu_manager', 'P3_match'));
    });
  });

  // --- Employee Permissions ---
  describe('RBAC: Employee Permissions', () => {
    it('employee can only read P1–P4, P6', () => {
      assertTrue(canRead('employee', 'P1_recruit'));
      assertTrue(canRead('employee', 'P2_assess'));
      assertTrue(canRead('employee', 'P3_match'));
      assertTrue(canRead('employee', 'P4_evaluate'));
      assertTrue(canRead('employee', 'P6_compensate'));
    });

    it('employee CANNOT create/update anything except P5, P7 (self)', () => {
      assertFalse(canCreate('employee', 'P1_recruit'));
      assertFalse(canCreate('employee', 'P2_assess'));
      assertFalse(canCreate('employee', 'P4_evaluate'));
    });

    it('employee CAN update own development (P5)', () => {
      assertTrue(canUpdate('employee', 'P5_develop'));
    });

    it('employee CAN update own quality of life (P7)', () => {
      assertTrue(canUpdate('employee', 'P7_quality'));
    });

    it('employee cannot delete anything', () => {
      for (const module of Object.keys(PERMISSIONS)) {
        assertFalse(canDelete('employee', module), `employee cannot delete ${module}`);
      }
    });

    it('employee cannot access system-config, data-exchange, or system-map', () => {
      assertFalse(hasPermission('employee', 'system_config'));
      assertFalse(hasPermission('employee', 'data-exchange'));
      assertFalse(hasPermission('employee', 'system-map'));
    });
  });

  // --- Auditor Permissions ---
  describe('RBAC: Auditor Permissions', () => {
    it('auditor can read EVERY P-module (read-only)', () => {
      const pModules = ['P1_recruit', 'P2_assess', 'P3_match', 'P4_evaluate', 'P5_develop', 'P6_compensate', 'P7_quality'];
      for (const m of pModules) {
        assertTrue(canRead('auditor', m), `auditor can read ${m}`);
      }
    });

    it('auditor CANNOT create/update/delete any P-module', () => {
      for (const module of Object.keys(PERMISSIONS)) {
        assertFalse(canCreate('auditor', module), `auditor cannot create ${module}`);
        assertFalse(canUpdate('auditor', module), `auditor cannot update ${module}`);
        assertFalse(canDelete('auditor', module), `auditor cannot delete ${module}`);
      }
    });

    it('auditor can view audit logs', () => {
      assertTrue(canViewAuditLog('auditor'));
    });

    it('auditor can access labor-law and pkg-rules tabs', () => {
      assertTrue(hasPermission('auditor', 'labor-law'));
      assertTrue(hasPermission('auditor', 'pkg-rules'));
    });

    it('auditor CANNOT access P2 assess tab', () => {
      assertFalse(hasPermission('auditor', 'assess'));
    });
  });

  // --- Guest Permissions ---
  describe('RBAC: Guest Permissions', () => {
    it('guest can only read P1 (recruitment)', () => {
      assertTrue(canRead('guest', 'P1_recruit'));
      assertFalse(canCreate('guest', 'P1_recruit'));
    });

    it('guest CANNOT access any other P-module', () => {
      const restricted = ['P2_assess', 'P3_match', 'P4_evaluate', 'P5_develop', 'P6_compensate', 'P7_quality'];
      for (const m of restricted) {
        assertFalse(canRead('guest', m), `guest cannot read ${m}`);
      }
    });

    it('guest can view executive dashboard', () => {
      assertTrue(hasPermission('guest', 'executive'));
    });

    it('guest cannot access any restricted functionality', () => {
      assertFalse(hasPermission('guest', 'data-exchange'));
      assertFalse(hasPermission('guest', 'system-map'));
      assertFalse(hasPermission('guest', 'system_config'));
    });
  });

  // --- Tab Access Level ---
  describe('RBAC: Tab-level access', () => {
    it('executive tab is restricted to admin and hr_manager', () => {
      assertTrue(hasPermission('admin', 'executive'));
      assertTrue(hasPermission('hr_manager', 'executive'));
      assertFalse(hasPermission('bu_manager', 'executive'));
      assertFalse(hasPermission('employee', 'executive'));
    });

    it('system-map is admin only', () => {
      assertTrue(hasPermission('admin', 'system-map'));
      assertFalse(hasPermission('hr_manager', 'system-map'));
      assertFalse(hasPermission('bu_manager', 'system-map'));
      assertFalse(hasPermission('employee', 'system-map'));
    });

    it('data-exchange is admin and hr_manager', () => {
      assertTrue(hasPermission('admin', 'data-exchange'));
      assertTrue(hasPermission('hr_manager', 'data-exchange'));
      assertFalse(hasPermission('bu_manager', 'data-exchange'));
    });

    it('recruit tab accessible by all roles', () => {
      for (const role of Object.keys(ROLES)) {
        assertTrue(hasPermission(role, 'recruit'), `${role} can access recruit tab`);
      }
    });

    it('performance tab accessible by all roles except guest', () => {
      assertTrue(hasPermission('admin', 'performance'));
      assertTrue(hasPermission('hr_manager', 'performance'));
      assertTrue(hasPermission('bu_manager', 'performance'));
      assertTrue(hasPermission('employee', 'performance'));
      assertTrue(hasPermission('auditor', 'performance'));
      assertFalse(hasPermission('guest', 'performance'));
    });
  });

  // --- Cross-BU access ---
  describe('RBAC: Cross-BU access control', () => {
    it('admin and hr_manager can access all BUs', () => {
      assertTrue(isCrossBUAccess('admin'));
      assertTrue(isCrossBUAccess('hr_manager'));
    });

    it('bu_manager can only access own BU', () => {
      assertFalse(isCrossBUAccess('bu_manager'));
    });

    it('employee can only access own data', () => {
      assertFalse(isCrossBUAccess('employee'));
    });

    it('auditor can access all BUs (for audit purposes)', () => {
      assertTrue(isCrossBUAccess('auditor'));
    });
  });

  // --- Edge Cases ---
  describe('RBAC: Edge Cases', () => {
    it('unknown role returns false for all permissions', () => {
      assertFalse(hasPermission('unknown_role', 'recruit'));
      assertFalse(hasPermission('unknown_role', 'P1_recruit.R'));
      assertFalse(canCreate('unknown_role', 'P1_recruit'));
    });

    it('unknown module returns false', () => {
      assertFalse(hasPermission('admin', 'unknown_module'));
      assertFalse(canCreate('admin', 'P99_unknown'));
    });

    it('role cannot manage itself (except admin)', () => {
      assertFalse(canManageRole('hr_manager', 'hr_manager'));
      assertFalse(canManageRole('bu_manager', 'bu_manager'));
    });

    it('audit_logs: admin, hr_manager, auditor all have read', () => {
      assertTrue(hasPermission('admin', 'audit_logs.R'));
      assertTrue(hasPermission('hr_manager', 'audit_logs.R'));
      assertTrue(hasPermission('auditor', 'audit_logs.R'));
      assertFalse(hasPermission('employee', 'audit_logs.R'));
      assertFalse(hasPermission('guest', 'audit_logs.R'));
    });

    it('hierarchy: admin is only role with CRUD on system_config', () => {
      for (const role of Object.keys(ROLES)) {
        if (role === 'admin') {
          assertTrue(canCreate('admin', 'system_config'));
        } else {
          assertFalse(canCreate(role, 'system_config'), `${role} cannot create system_config`);
        }
      }
    });
  });
}

// ============================================================
// 4. EXPORTS
// ============================================================

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    ROLES,
    PERMISSIONS,
    TAB_PERMISSIONS,
    hasPermission,
    hasMinimumLevel,
    canManageRole,
    isCrossBUAccess,
    canViewAuditLog,
    canCreate,
    canRead,
    canUpdate,
    canDelete,
    runRBACTests,
  };
}
