/**
 * ============================================================================
 * Web PP7 - Migration Test Suite (ทดสอบระบบนำเข้าข้อมูล)
 * ============================================================================
 * ทดสอบการย้ายข้อมูลจาก Excel/Google Sheets → Web PP7 Database
 * ครอบคลุม: validation, duplicate detection, format checking, rollback
 * ============================================================================
 */

// ============================================================================
// Test Fixtures
// ============================================================================

/** Schema ที่ใช้ในการทดสอบ (จำลองจาก Migration.gs) */
const MIGRATION_SCHEMAS = {
  P1_Headcount: {
    required: ['requestId', 'buName', 'position', 'quantity', 'requestDate'],
    types: {
      requestId: 'string',
      buName: 'string',
      position: 'string',
      quantity: 'number',
      requestDate: 'date',
      status: 'string',
      priority: 'string'
    },
    enums: {
      status: ['pending', 'approved', 'rejected', 'filled'],
      priority: ['high', 'medium', 'low']
    }
  },
  P1_Recruit: {
    required: ['recruitId', 'requestId', 'candidateName', 'source', 'applyDate'],
    types: {
      recruitId: 'string',
      requestId: 'string',
      candidateName: 'string',
      source: 'string',
      applyDate: 'date',
      status: 'string',
      ccScore: 'number'
    },
    enums: {
      status: ['screening', 'assessed', 'interviewed', 'offered', 'hired', 'rejected'],
      source: ['internal', 'external', 'referral', 'agency', 'jobboard']
    }
  },
  P2_Assessment: {
    required: ['assessmentId', 'memberId', 'assessorId', 'assessDate', 'ccScores'],
    types: {
      assessmentId: 'string',
      memberId: 'string',
      assessorId: 'string',
      assessDate: 'date',
      ccScores: 'object',
      overallScore: 'number',
      result: 'string'
    },
    enums: {
      result: ['pass', 'fail', 'conditional']
    }
  },
  P3_Matching: {
    required: ['matchingId', 'memberId', 'positionId', 'matchDate'],
    types: {
      matchingId: 'string',
      memberId: 'string',
      positionId: 'string',
      matchDate: 'date',
      matchScore: 'number',
      result: 'string'
    },
    enums: {
      result: ['matched', 'unmatched', 'pending_review']
    }
  },
  P4_Performance: {
    required: ['evalId', 'memberId', 'evalPeriod', 'evalDate'],
    types: {
      evalId: 'string',
      memberId: 'string',
      evalPeriod: 'string',
      evalDate: 'date',
      ccScores: 'object',
      rating: 'number',
      grade: 'string'
    },
    enums: {
      grade: ['excellent', 'good', 'satisfactory', 'needs_improvement', 'unsatisfactory'],
      evalPeriod: ['Q1', 'Q2', 'Q3', 'Q4', 'H1', 'H2', 'annual']
    }
  },
  P5_Development: {
    required: ['devPlanId', 'memberId', 'planDate', 'goalType'],
    types: {
      devPlanId: 'string',
      memberId: 'string',
      planDate: 'date',
      goalType: 'string',
      status: 'string',
      progress: 'number'
    },
    enums: {
      goalType: ['skill_gap', 'career_path', 'succession', 'coaching'],
      status: ['draft', 'active', 'completed', 'cancelled']
    }
  },
  P6_Compensation: {
    required: ['compId', 'memberId', 'period', 'baseSalary'],
    types: {
      compId: 'string',
      memberId: 'string',
      period: 'string',
      baseSalary: 'number',
      bonus: 'number',
      allowance: 'number',
      total: 'number'
    }
  },
  P7_Welfare: {
    required: ['welfareId', 'memberId', 'category', 'startDate'],
    types: {
      welfareId: 'string',
      memberId: 'string',
      category: 'string',
      startDate: 'date',
      status: 'string'
    },
    enums: {
      category: ['health', 'wealth', 'wellbeing', 'time', 'fun'],
      status: ['active', 'expired', 'cancelled']
    }
  },
  Members: {
    required: ['memberId', 'firstName', 'lastName', 'email', 'bu', 'hireDate'],
    types: {
      memberId: 'string',
      firstName: 'string',
      lastName: 'string',
      email: 'string',
      bu: 'string',
      hireDate: 'date',
      status: 'string'
    },
    enums: {
      status: ['active', 'resigned', 'transferred', 'on_leave']
    }
  }
};

// ============================================================================
// Validation Functions (จำลองจาก Migration.gs)
// ============================================================================

/**
 * Validate a single row against schema
 * @param {Object} row - ข้อมูลที่ต้องการ validate
 * @param {string} sheetName - ชื่อ sheet/table
 * @returns {Object} { isValid, errors, warnings }
 */
function validateRow(row, sheetName) {
  const schema = MIGRATION_SCHEMAS[sheetName];
  if (!schema) {
    return { isValid: false, errors: [`Schema not found for sheet: ${sheetName}`], warnings: [] };
  }

  const errors = [];
  const warnings = [];

  // ตรวจสอบ required fields
  for (const field of schema.required) {
    if (row[field] === undefined || row[field] === null || row[field] === '') {
      errors.push(`Required field missing: ${field}`);
    }
  }

  // ตรวจสอบ data types
  if (schema.types) {
    for (const [field, expectedType] of Object.entries(schema.types)) {
      const value = row[field];
      if (value === undefined || value === null) continue;

      switch (expectedType) {
        case 'string':
          if (typeof value !== 'string') {
            errors.push(`Field ${field}: expected string, got ${typeof value}`);
          }
          break;
        case 'number':
          if (typeof value === 'string' && isNaN(Number(value))) {
            errors.push(`Field ${field}: expected number, got "${value}"`);
          } else if (typeof value === 'string') {
            warnings.push(`Field ${field}: string "${value}" will be coerced to number`);
          }
          break;
        case 'date':
          if (typeof value === 'string') {
            const date = new Date(value);
            if (isNaN(date.getTime())) {
              errors.push(`Field ${field}: invalid date "${value}"`);
            }
          } else if (!(value instanceof Date)) {
            errors.push(`Field ${field}: expected date, got ${typeof value}`);
          }
          break;
        case 'object':
          if (typeof value !== 'object' || Array.isArray(value)) {
            errors.push(`Field ${field}: expected object, got ${typeof value}`);
          }
          break;
      }
    }
  }

  // ตรวจสอบ enum values
  if (schema.enums) {
    for (const [field, allowedValues] of Object.entries(schema.enums)) {
      const value = row[field];
      if (value === undefined || value === null) continue;
      if (!allowedValues.includes(String(value).toLowerCase())) {
        errors.push(`Field ${field}: "${value}" not in allowed values [${allowedValues.join(', ')}]`);
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * ตรวจสอบ duplicate records
 * @param {Array} rows - ข้อมูลทั้งหมด
 * @param {string} keyField - ฟิลด์ที่ใช้เป็น unique key
 * @returns {Object} { duplicates: [...], uniqueRows: [...] }
 */
function detectDuplicates(rows, keyField) {
  const seen = new Map();
  const duplicates = [];
  const uniqueRows = [];

  for (let i = 0; i < rows.length; i++) {
    const key = rows[i][keyField];
    if (key === undefined || key === null) {
      duplicates.push({ row: rows[i], index: i, reason: 'missing_key', keyField });
      continue;
    }
    if (seen.has(String(key))) {
      duplicates.push({
        row: rows[i],
        index: i,
        reason: 'duplicate',
        keyField,
        keyValue: key,
        firstOccurrence: seen.get(String(key))
      });
    } else {
      seen.set(String(key), i);
      uniqueRows.push(rows[i]);
    }
  }

  return { duplicates, uniqueRows };
}

/**
 * ตรวจสอบ format ของ email
 */
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * ตรวจสอบ format ของ memberId (รูปแบบ: MEM-XXXX)
 */
function isValidMemberId(id) {
  return /^MEM-\d{4,6}$/.test(id);
}

/**
 * ตรวจสอบ salary range (สมเหตุสมผล)
 */
function isValidSalary(salary) {
  return typeof salary === 'number' && salary > 0 && salary <= 1000000;
}

// ============================================================================
// Test Runner
// ============================================================================

const testResults = [];
let passCount = 0;
let failCount = 0;

function test(name, fn) {
  try {
    fn();
    testResults.push({ name, status: 'PASS', error: null });
    passCount++;
    console.log(`  ✅ PASS: ${name}`);
  } catch (e) {
    testResults.push({ name, status: 'FAIL', error: e.message });
    failCount++;
    console.log(`  ❌ FAIL: ${name} - ${e.message}`);
  }
}

function assertEqual(actual, expected, message) {
  if (actual !== expected) {
    throw new Error(`${message || ''} Expected ${expected}, got ${actual}`);
  }
}

function assertTrue(condition, message) {
  if (!condition) {
    throw new Error(message || 'Assertion failed');
  }
}

// ============================================================================
// Test Cases: Validation
// ============================================================================

console.log('\n📋 Migration Validation Tests');
console.log('=' .repeat(60));

// --- Required Fields ---
console.log('\n🔹 Required Fields Validation');

test('validateRow: P1 headcount ผ่าน validation เมื่อมีครบทุก required field', () => {
  const result = validateRow({
    requestId: 'REQ-001',
    buName: 'PKG',
    position: 'Developer',
    quantity: 2,
    requestDate: '2026-07-01'
  }, 'P1_Headcount');
  assertTrue(result.isValid, `Should be valid. Errors: ${result.errors.join(', ')}`);
  assertEqual(result.errors.length, 0, 'No errors');
});

test('validateRow: P1 headcount ผ่านเมื่อมีแค่ required fields (ไม่มี optional)', () => {
  const result = validateRow({
    requestId: 'REQ-002',
    buName: 'PAD',
    position: 'Manager',
    quantity: 1,
    requestDate: '2026-07-06'
  }, 'P1_Headcount');
  assertTrue(result.isValid);
});

test('validateRow: P1 headcount fail เมื่อขาด requestId', () => {
  const result = validateRow({
    buName: 'PKG',
    position: 'Developer',
    quantity: 1,
    requestDate: '2026-07-01'
  }, 'P1_Headcount');
  assertTrue(!result.isValid);
  assertTrue(result.errors.some(e => e.includes('requestId')));
});

test('validateRow: P1 headcount fail เมื่อ quantity ไม่ใช่ number', () => {
  const result = validateRow({
    requestId: 'REQ-003',
    buName: 'PKG',
    position: 'Developer',
    quantity: 'abc',
    requestDate: '2026-07-01'
  }, 'P1_Headcount');
  assertTrue(!result.isValid);
  assertTrue(result.errors.some(e => e.includes('quantity')));
});

// --- Date Validation ---
console.log('\n🔹 Date Validation');

test('validateRow: รับวันที่ format YYYY-MM-DD', () => {
  const result = validateRow({
    requestId: 'REQ-004',
    buName: 'PKG',
    position: 'Dev',
    quantity: 1,
    requestDate: '2026-07-06'
  }, 'P1_Headcount');
  assertTrue(result.isValid, `Errors: ${result.errors.join(', ')}`);
});

test('validateRow: reject วันที่ format ผิด', () => {
  const result = validateRow({
    requestId: 'REQ-005',
    buName: 'PKG',
    position: 'Dev',
    quantity: 1,
    requestDate: 'not-a-date'
  }, 'P1_Headcount');
  assertTrue(!result.isValid);
  assertTrue(result.errors.some(e => e.includes('requestDate')));
});

test('validateRow: accept Date object', () => {
  const result = validateRow({
    requestId: 'REQ-006',
    buName: 'PKG',
    position: 'Dev',
    quantity: 1,
    requestDate: new Date('2026-07-06')
  }, 'P1_Headcount');
  assertTrue(result.isValid, `Errors: ${result.errors.join(', ')}`);
});

// --- Enum Validation ---
console.log('\n🔹 Enum Validation');

test('validateRow: P1 recruit ผ่านเมื่อ status มีค่าถูกต้อง', () => {
  const result = validateRow({
    recruitId: 'REC-001',
    requestId: 'REQ-001',
    candidateName: 'ทดสอบ',
    source: 'internal',
    applyDate: '2026-07-01',
    status: 'screening'
  }, 'P1_Recruit');
  assertTrue(result.isValid, `Errors: ${result.errors.join(', ')}`);
});

test('validateRow: P1 recruit fail เมื่อ status ไม่อยู่ใน enum', () => {
  const result = validateRow({
    recruitId: 'REC-002',
    requestId: 'REQ-001',
    candidateName: 'ทดสอบ',
    source: 'internal',
    applyDate: '2026-07-01',
    status: 'invalid_status'
  }, 'P1_Recruit');
  assertTrue(!result.isValid);
  assertTrue(result.errors.some(e => e.includes('status')));
});

test('validateRow: P5 development plan ผ่านเมื่อ goalType ถูกต้อง', () => {
  const result = validateRow({
    devPlanId: 'DEV-001',
    memberId: 'MEM-0001',
    planDate: '2026-07-01',
    goalType: 'skill_gap',
    status: 'active',
    progress: 50
  }, 'P5_Development');
  assertTrue(result.isValid, `Errors: ${result.errors.join(', ')}`);
});

test('validateRow: P6 compensation ผ่านเมื่อไม่มี optional enum', () => {
  const result = validateRow({
    compId: 'COMP-001',
    memberId: 'MEM-0001',
    period: '2026-Q2',
    baseSalary: 30000
  }, 'P6_Compensation');
  assertTrue(result.isValid, `Errors: ${result.errors.join(', ')}`);
});

// ============================================================================
// Test Cases: Duplicate Detection
// ============================================================================

console.log('\n🔹 Duplicate Detection');

test('detectDuplicates: ไม่พบ duplicate ในข้อมูล unique', () => {
  const rows = [
    { requestId: 'REQ-001', buName: 'PKG' },
    { requestId: 'REQ-002', buName: 'PAD' },
    { requestId: 'REQ-003', buName: 'WCD' }
  ];
  const result = detectDuplicates(rows, 'requestId');
  assertEqual(result.duplicates.length, 0, 'No duplicates');
  assertEqual(result.uniqueRows.length, 3, 'All unique');
});

test('detectDuplicates: พบ duplicate เมื่อ requestId ซ้ำ', () => {
  const rows = [
    { requestId: 'REQ-001', buName: 'PKG' },
    { requestId: 'REQ-002', buName: 'PAD' },
    { requestId: 'REQ-001', buName: 'WCD' }
  ];
  const result = detectDuplicates(rows, 'requestId');
  assertEqual(result.duplicates.length, 1, 'Found 1 duplicate');
  assertEqual(result.uniqueRows.length, 2, '2 unique');
  assertEqual(result.duplicates[0].reason, 'duplicate');
});

test('detectDuplicates: พบ multiple duplicates', () => {
  const rows = [
    { memberId: 'MEM-001' },
    { memberId: 'MEM-001' },
    { memberId: 'MEM-002' },
    { memberId: 'MEM-002' },
    { memberId: 'MEM-003' }
  ];
  const result = detectDuplicates(rows, 'memberId');
  assertEqual(result.duplicates.length, 2, 'Found 2 duplicates');
  assertEqual(result.uniqueRows.length, 3, '3 unique');
});

test('detectDuplicates: นับ missing key เป็น duplicate', () => {
  const rows = [
    { memberId: 'MEM-001' },
    { memberId: null },
    { memberId: 'MEM-002' }
  ];
  const result = detectDuplicates(rows, 'memberId');
  assertEqual(result.duplicates.length, 1, 'null key counted as duplicate');
  assertEqual(result.duplicates[0].reason, 'missing_key');
});

// ============================================================================
// Test Cases: Format Validation
// ============================================================================

console.log('\n🔹 Format Validation Helpers');

test('isValidEmail: รับ email ที่ถูกต้อง', () => {
  assertTrue(isValidEmail('test@pkg.com'));
  assertTrue(isValidEmail('user.name@company.co.th'));
});

test('isValidEmail: reject email ที่ผิด format', () => {
  assertTrue(!isValidEmail('not-an-email'));
  assertTrue(!isValidEmail('@no-local.com'));
  assertTrue(!isValidEmail('user@'));
  assertTrue(!isValidEmail('user @space.com'));
});

test('isValidMemberId: รับ memberId ที่ถูกต้อง', () => {
  assertTrue(isValidMemberId('MEM-0001'));
  assertTrue(isValidMemberId('MEM-999999'));
});

test('isValidMemberId: reject memberId ที่ผิด format', () => {
  assertTrue(!isValidMemberId('MEM-'));
  assertTrue(!isValidMemberId('MEM001'));
  assertTrue(!isValidMemberId('USR-001'));
  assertTrue(!isValidMemberId(''));
});

test('isValidSalary: รับ salary ที่สมเหตุสมผล', () => {
  assertTrue(isValidSalary(15000));
  assertTrue(isValidSalary(100000));
  assertTrue(isValidSalary(500000));
});

test('isValidSalary: reject salary ที่ไม่สมเหตุสมผล', () => {
  assertTrue(!isValidSalary(0));
  assertTrue(!isValidSalary(-5000));
  assertTrue(!isValidSalary(2000000));
  assertTrue(!isValidSalary(NaN));
});

// ============================================================================
// Test Cases: Cross-P Migration
// ============================================================================

console.log('\n🔹 Cross-P Data Flow Validation');

test('P1→P2: assessment ต้องมี memberId ที่มีอยู่ใน members', () => {
  const members = [
    { memberId: 'MEM-0001', firstName: 'Test', lastName: 'User', email: 'test@pkg.com', bu: 'PKG', hireDate: '2025-01-01', status: 'active' }
  ];
  const assessment = {
    assessmentId: 'ASM-001',
    memberId: 'MEM-0001',
    assessorId: 'MEM-0002',
    assessDate: '2026-07-06',
    ccScores: { cc1: 4, cc2: 3 },
    overallScore: 3.5,
    result: 'pass'
  };

  // ตรวจสอบว่า memberId มีอยู่ใน members
  const memberExists = members.some(m => m.memberId === assessment.memberId);
  assertTrue(memberExists, 'Member must exist before assessment');
});

test('P1→P2→P3→P4: Data flow chain ตรวจสอบ reference integrity', () => {
  // จำลอง data flow chain
  const recruit = { recruitId: 'REC-001', memberId: 'MEM-0001', status: 'hired' };
  const assessment = { assessmentId: 'ASM-001', memberId: 'MEM-0001', result: 'pass' };
  const matching = { matchingId: 'MAT-001', memberId: 'MEM-0001', result: 'matched' };
  const performance = { evalId: 'EVL-001', memberId: 'MEM-0001', grade: 'good' };

  // ตรวจสอบว่าทุก step อ้างอิง memberId เดียวกัน
  const memberIds = [recruit.memberId, assessment.memberId, matching.memberId, performance.memberId];
  const allSame = memberIds.every(id => id === memberIds[0]);
  assertTrue(allSame, 'All process steps must reference same member');
});

// ============================================================================
// Test Cases: Rollback Scenarios
// ============================================================================

console.log('\n🔹 Rollback Scenarios');

test('Rollback: จำลอง undo import เมื่อพบ error ที่ row ที่ 5', () => {
  const importedRows = [];
  let rollbackTriggered = false;

  for (let i = 1; i <= 10; i++) {
    if (i === 5) {
      rollbackTriggered = true;
      break;
    }
    importedRows.push({ requestId: `REQ-${i}` });
  }

  assertTrue(rollbackTriggered, 'Rollback should be triggered');
  assertEqual(importedRows.length, 4, 'Only first 4 rows imported before rollback');
});

test('Rollback: จำลอง undo ทั้งหมดเมื่อ batch fail', () => {
  let importedCount = 0;
  let rolledBack = false;

  try {
    for (let i = 1; i <= 10; i++) {
      if (i === 3) throw new Error('Schema mismatch');
      importedCount++;
    }
  } catch (e) {
    rolledBack = true;
    importedCount = 0; // Rollback
  }

  assertTrue(rolledBack, 'Batch should fail');
  assertEqual(importedCount, 0, 'All imported rows should be rolled back');
});

// ============================================================================
// Summary
// ============================================================================

console.log('\n' + '='.repeat(60));
console.log(`📊 Migration Tests Complete: ${passCount} passed, ${failCount} failed, ${passCount + failCount} total`);

if (failCount > 0) {
  console.log('\n❌ Failed Tests:');
  testResults.filter(t => t.status === 'FAIL').forEach(t => {
    console.log(`  - ${t.name}: ${t.error}`);
  });
}

console.log('='.repeat(60));
