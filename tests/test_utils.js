/**
 * test_utils.js — Test Utility Functions สำหรับ Web PP7
 * 
 * ไฟล์นี้รวม test helpers, mock data generators, assertion functions
 * ที่ใช้ร่วมใน tests ทั้งหมด
 * 
 * @version 1.0.0
 * @lastModified 2026-07-06
 */

'use strict';

// ============================================================
// 1. ASSERTION HELPERS
// ============================================================

let _testState = { passed: 0, failed: 0, skipped: 0, errors: [] };

function resetTestState() {
  _testState = { passed: 0, failed: 0, skipped: 0, errors: [] };
}

function getTestState() {
  return { ..._testState };
}

function assertEqual(actual, expected, message = '') {
  const ok = actual === expected;
  if (ok) {
    _testState.passed++;
  } else {
    _testState.failed++;
    _testState.errors.push({
      message: message || `assertEqual failed`,
      expected,
      actual,
    });
  }
  return ok;
}

function assertDeepEqual(actual, expected, message = '') {
  const ok = JSON.stringify(actual) === JSON.stringify(expected);
  if (ok) {
    _testState.passed++;
  } else {
    _testState.failed++;
    _testState.errors.push({
      message: message || 'assertDeepEqual failed',
      expected,
      actual,
    });
  }
  return ok;
}

function assertTrue(condition, message = 'assertTrue failed') {
  if (condition) {
    _testState.passed++;
    return true;
  } else {
    _testState.failed++;
    _testState.errors.push({ message, expected: true, actual: false });
    return false;
  }
}

function assertFalse(condition, message = 'assertFalse failed') {
  return assertTrue(!condition, message);
}

function assertThrows(fn, expectedErrorType, message = '') {
  try {
    fn();
    _testState.failed++;
    _testState.errors.push({
      message: message || `Expected ${expectedErrorType} to be thrown, but no error was thrown`,
      expected: expectedErrorType,
      actual: 'no error',
    });
    return false;
  } catch (e) {
    const ok = expectedErrorType ? e.name === expectedErrorType || e.message.includes(expectedErrorType) : true;
    if (ok) {
      _testState.passed++;
    } else {
      _testState.failed++;
      _testState.errors.push({
        message: message || `Expected ${expectedErrorType}`,
        expected: expectedErrorType,
        actual: e.message,
      });
    }
    return ok;
  }
}

function assertMatch(value, regex, message = '') {
  const ok = regex.test(value);
  if (ok) {
    _testState.passed++;
  } else {
    _testState.failed++;
    _testState.errors.push({
      message: message || `assertMatch failed: "${value}" does not match ${regex}`,
      expected: regex.toString(),
      actual: value,
    });
  }
  return ok;
}

function assertArrayLength(arr, len, message = '') {
  const ok = Array.isArray(arr) && arr.length === len;
  if (ok) {
    _testState.passed++;
  } else {
    _testState.failed++;
    _testState.errors.push({
      message: message || `Expected array length ${len}`,
      expected: len,
      actual: Array.isArray(arr) ? arr.length : typeof arr,
    });
  }
  return ok;
}

function assertObjectHasKey(obj, key, message = '') {
  const ok = obj !== null && typeof obj === 'object' && key in obj;
  if (ok) {
    _testState.passed++;
  } else {
    _testState.failed++;
    _testState.errors.push({
      message: message || `Object missing key "${key}"`,
      expected: key,
      actual: obj ? Object.keys(obj) : String(obj),
    });
  }
  return ok;
}

function assertInRange(value, min, max, message = '') {
  const ok = value >= min && value <= max;
  if (ok) {
    _testState.passed++;
  } else {
    _testState.failed++;
    _testState.errors.push({
      message: message || `Value ${value} out of range [${min}, ${max}]`,
      expected: `[${min}, ${max}]`,
      actual: value,
    });
  }
  return ok;
}

function skipTest(reason = 'Test skipped') {
  _testState.skipped++;
  return true;
}

// ============================================================
// 2. TEST REGISTRY
// ============================================================

const TEST_REGISTRY = {};

function describe(suiteName, fn) {
  const results = [];
  console.log(`\n  📦 ${suiteName}`);
  TEST_REGISTRY[suiteName] = fn;
  return fn;
}

function it(testName, fn) {
  try {
    const before = _testState.failed;
    fn();
    const newFailures = _testState.failed - before;
    if (newFailures === 0) {
      console.log(`    ✅ ${testName}`);
      return true;
    } else {
      console.log(`    ❌ ${testName} (${newFailures} assertion(s) failed)`);
      return false;
    }
  } catch (e) {
    console.log(`    💥 ${testName} — ${e.message}`);
    _testState.failed++;
    _testState.errors.push({ suite: testName, error: e.message });
    return false;
  }
}

function skipIt(testName, reason = '') {
  console.log(`    ⏭️ ${testName} ${reason ? `(${reason})` : ''}`);
  _testState.skipped++;
}

// ============================================================
// 3. MOCK DATA GENERATORS
// ============================================================

function generateMockEmployee(overrides = {}) {
  return {
    id: '9999001',
    name: 'ทดสอบ ระบบ',
    email: 'test@pkg.example.com',
    start: '01/01/2020',
    status: 'สมาชิกประจำ',
    wg: 'AAMG',
    position: 'สมาชิกทดสอบ',
    tenure: 6.5,
    ...overrides,
  };
}

function generateMockCandidate(overrides = {}) {
  return {
    id: 'CAND-TEST-001',
    position_id: 'POS-001',
    full_name: 'ผู้สมัครทดสอบ',
    contact_info: { phone: '0812345678', email: 'candidate@test.com' },
    resume_url: 'https://docs.example.com/resume/test.pdf',
    pdpa_consent: true,
    pdpa_consent_date: '2026-07-06T00:00:00Z',
    status: 'New',
    created_at: '2026-07-06T00:00:00Z',
    ...overrides,
  };
}

function generateMockPosition(overrides = {}) {
  return {
    id: 'POS-TEST-001',
    title: 'ตำแหน่งทดสอบ',
    department: 'AAMG',
    is_vacant: true,
    updated_at: '2026-07-06T00:00:00Z',
    ...overrides,
  };
}

function generateMockEvaluationQueue(overrides = {}) {
  return {
    evaluationId: 'EV-TEST-001',
    source: 'A.5 สมาชิกเข้าประเมินผล',
    memberId: '9999001',
    name: 'ทดสอบ ระบบ',
    company: 'AAMG',
    bu: 'AAMG',
    position: 'สมาชิกทดสอบ',
    evaluationType: 'ทดสอบงาน',
    triggerType: 'เริ่มงาน',
    round: '2026',
    matchingStatus: 'matched',
    nextStage: 'assign-evaluators',
    status: 'รอแต่งตั้งผู้ประเมิน',
    outcomeTarget: 'ผ่านการทดสอบ',
    ...overrides,
  };
}

function generateMockTransferRecord(overrides = {}) {
  return {
    transferId: 'TR-TEST-001',
    memberId: '9999001',
    name: 'ทดสอบ ระบบ',
    oldCompany: 'AAMG',
    oldBranch: 'สำนักงานใหญ่',
    oldPosition: 'สมาชิกทดสอบ',
    newCompany: 'CPDG',
    newBranch: 'สำนักงานใหญ่',
    newPosition: 'สมาชิกทดสอบ CPDG',
    transferType: 'โอนย้ายบริษัท',
    assessmentStatus: 'รอพิจารณา',
    matchingStatus: 'จับคู่กับ BU ใหม่',
    evaluationType: 'โอนย้าย',
    developmentNeed: 'ติดตามหลังโอนย้าย',
    compensationImpact: 'รอ payroll mapping',
    qualityOfLifeImpact: 'ติดตามผลกระทบต่อคุณภาพชีวิต',
    ...overrides,
  };
}

function generateMockResignationRecord(overrides = {}) {
  return {
    resignationId: 'RS-TEST-001',
    memberId: '9999001',
    name: 'ทดสอบ ระบบ',
    company: 'AAMG',
    branch: 'สำนักงานใหญ่',
    position: 'สมาชิกทดสอบ',
    employeeAction: 'remove-from-employee',
    vacancyAction: 'create-vacancy',
    vacancyTitle: 'สมาชิกทดสอบ',
    replacementFlow: 'Recruitment -> Assessment -> Matching -> Evaluation',
    manpowerImpact: 'กระทบกำลังคน',
    qualityOfLifeRisk: 'เสี่ยงภาระงานทีมเพิ่มขึ้น',
    ...overrides,
  };
}

function generateMockEvaluators(count = 3) {
  const roles = ['ผู้รับใช้ทีม', 'เพื่อนร่วมงาน', 'ลูกค้า'];
  return Array.from({ length: count }, (_, i) => ({
    role: roles[i % roles.length],
    id: `EVT-${(i + 1).toString().padStart(3, '0')}`,
    name: `ผู้ประเมิน ${i + 1}`,
  }));
}

function generateMockScoreSample(overrides = {}) {
  return {
    memberId: '9999001',
    name: 'ทดสอบ ระบบ',
    bu: 'AAMG',
    evaluationType: 'ทดสอบงาน',
    round: '2026',
    role: 'ผู้รับใช้ทีม',
    behaviorTotal: 85,
    corporateTotal: 80,
    overall: 165,
    ...overrides,
  };
}

// ============================================================
// 4. UTILITY FUNCTIONS (ที่ระบบ PP7 ใช้จริง)
// ============================================================

/**
 * คำนวณอายุงาน (tenure) จากวันที่เริ่มงาน到今天
 * ใช้รูปแบบ DD/MM/YYYY เหมือนระบบจริง
 */
function calculateTenure(startDateStr, referenceDateStr = null) {
  if (!startDateStr || typeof startDateStr !== 'string') return null;
  const parts = startDateStr.split('/');
  if (parts.length !== 3) return null;
  const [dd, mm, yyyy] = parts.map(Number);
  if (!dd || !mm || !yyyy) return null;
  const start = new Date(yyyy, mm - 1, dd);
  if (isNaN(start.getTime())) return null;
  const ref = referenceDateStr ? parseThaiDate(referenceDateStr) : new Date();
  if (isNaN(ref.getTime())) return null;
  const diffMs = ref - start;
  if (diffMs < 0) return 0;
  return diffMs / (1000 * 60 * 60 * 24 * 365.25);
}

function parseThaiDate(dateStr) {
  if (!dateStr || typeof dateStr !== 'string') return new Date(NaN);
  const parts = dateStr.split('/');
  if (parts.length !== 3) return new Date(NaN);
  const [dd, mm, yyyy] = parts.map(Number);
  const d = new Date(yyyy, mm - 1, dd);
  return isNaN(d.getTime()) ? new Date(NaN) : d;
}

/**
 * ตรวจสอบ email format
 */
function isValidEmail(email) {
  if (!email || typeof email !== 'string') return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * ตรวจสอบเบอร์โทร format (ไทย)
 */
function isValidThaiPhone(phone) {
  if (!phone || typeof phone !== 'string') return false;
  const cleaned = phone.replace(/[\s\-()]/g, '');
  return /^(0[1-9]\d{8}|66[1-9]\d{8}|\+66[1-9]\d{8})$/.test(cleaned);
}

/**
 * Normalize email (lowercase + trim)
 */
function normalizeEmail(email) {
  if (!email || typeof email !== 'string') return '';
  return email.trim().toLowerCase();
}

/**
 * สร้าง UUID format
 */
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * คำนวณคะแนนประเมินรวม
 */
function calculateEvaluationScore(behaviorTotal, corporateTotal) {
  if (typeof behaviorTotal !== 'number' || typeof corporateTotal !== 'number') return null;
  if (behaviorTotal < 0 || corporateTotal < 0) return null;
  return behaviorTotal + corporateTotal;
}

/**
 * ตรวจสอบคะแนนขั้นต่ำ (ผ่าน/ไม่ผ่าน)
 *เกณฑ์: behavior >= 60% (จาก 120) และ corporate >= 60% (จาก 100)
 */
function isEvaluationPass(behaviorTotal, corporateTotal) {
  if (typeof behaviorTotal !== 'number' || typeof corporateTotal !== 'number') return false;
  return behaviorTotal >= 72 && corporateTotal >= 60; // 60% thresholds
}

/**
 * Map สถานะผู้สมัครจากค่าไทยเป็นค่า English enum
 */
const CANDIDATE_STATUS_MAP = {
  'ผู้สมัครใหม่': 'New',
  'รอคัดกรอง': 'Screening',
  'คัดกรองผ่าน': 'Passed_to_P2',
  'ไม่ผ่านคัดกรอง': 'Rejected',
  New: 'New',
  Screening: 'Screening',
  Passed_to_P2: 'Passed_to_P2',
  Rejected: 'Rejected',
};

function normalizeCandidateStatus(status) {
  if (!status || typeof status !== 'string') return null;
  return CANDIDATE_STATUS_MAP[status.trim()] || null;
}

/**
 * Map สถานะพนักงาน
 */
const EMPLOYEE_STATUS_LIST = [
  'สมาชิกประจำ',
  'สมาชิกประจำ(เกษียณ)',
  'สมาชิกทดลองงาน',
  'สัญญาจ้าง',
  'สัญญาจ้าง(เกษียณ)',
  'สมาชิกสัญญาจ้าง',
  'พนักงานบริการลูกค้าสินเชื่อ', // edge case: malformed
];

function isValidEmployeeStatus(status) {
  return Array.isArray(EMPLOYEE_STATUS_LIST) && EMPLOYEE_STATUS_LIST.includes(status);
}

/**
 * Map working group code to name (จาก WG_DATA)
 */
const WG_MAP = {
  '21RTG': 'ทีมวิจัยเทคโนโลยี (21RTG)',
  AAMG: 'ฝ่ายบัญชีและการเงิน (AAMG)',
  CPDG: 'ฝ่ายพัฒนาผลิตภัณฑ์ (CPDG)',
  PGHG: 'ฝ่ายบริหารทั่วไป (PGHG)',
  PMSG: 'ฝ่ายขายและการตลาด (PMSG)',
  RAFCOG: 'ฝ่ายวิเคราะห์ข้อมูล (RAFCOG)',
  RPLCG: 'ฝ่ายวิจัยและวางแผน (RPLCG)',
  Other: 'อื่นๆ',
};

function isValidWorkingGroup(wg) {
  return wg in WG_MAP;
}

// ============================================================
// 5. TEST SUITE: UTILITY FUNCTIONS
// ============================================================

function runUtilTests() {
  describe('Utility: calculateTenure', () => {})(() => {
    it('คำนวณ tenure จากวันที่ในอดีต', () => {
      // 01/01/2020 ถึง 01/01/2026 = ~6 ปี
      const tenure = calculateTenure('01/01/2020', '01/01/2026');
      assertTrue(tenure !== null, 'tenure should not be null');
      assertInRange(tenure, 5.9, 6.1, 'tenure should be approximately 6 years');
    });

    it('ส่งคืน null สำหรับวันที่ invalid', () => {
      assertEqual(calculateTenure('invalid'), null, 'invalid date string should return null');
      assertEqual(calculateTenure(null), null, 'null date should return null');
      assertEqual(calculateTenure(''), null, 'empty string should return null');
      assertEqual(calculateTenure(12345), null, 'non-string should return null');
    });

    it('ส่งคืน 0 สำหรับวันที่ในอนาคต', () => {
      const tenure = calculateTenure('01/01/2099', '01/01/2026');
      assertEqual(tenure, 0, 'future date should return 0');
    });

    it('handle วันที่เริ่มต้นผิด format', () => {
      assertEqual(calculateTenure('2020/01/01', '01/01/2026'), null, 'YYYY/MM/DD should return null');
      assertEqual(calculateTenure('1/1/2020', '01/01/2026'), null, 'single digits with slashes (4 parts) handled');
    });

    it('คำนวณ tenure สำหรับสมาชิกตัวอย่าง', () => {
      // ปวีร์ ผ่องโสภา: start 21/07/2021 tenure: 4.705...
      const tenure = calculateTenure('21/07/2021', '31/03/2026');
      assertTrue(tenure !== null, 'tenure should not be null');
      // 4 years, 8 months, 10 days ≈ 4.69 ปี
      assertInRange(tenure, 4.4, 5.0, 'pavee tenure approx 4.7');
    });
  });

  describe('Utility: parseThaiDate', () => {})(() => {
    it('parse DD/MM/YYYY ได้ถูกต้อง', () => {
      const d = parseThaiDate('21/07/2021');
      assertFalse(isNaN(d.getTime()), 'valid date should be parseable');
      assertEqual(d.getDate(), 21, 'day should be 21');
      assertEqual(d.getMonth(), 6, 'month should be 6 (0-indexed July)');
      assertEqual(d.getFullYear(), 2021, 'year should be 2021');
    });

    it('ส่งคืน Invalid Date สำหรับ input ผิด format', () => {
      assertTrue(isNaN(parseThaiDate('invalid').getTime()), 'invalid string should return NaN');
      assertTrue(isNaN(parseThaiDate('').getTime()), 'empty string should return NaN');
      assertTrue(isNaN(parseThaiDate(null).getTime()), 'null should return NaN');
    });
  });

  describe('Utility: isValidEmail', () => {})(() => {
    it('ยอมรับ email ที่ถูกต้อง', () => {
      assertTrue(isValidEmail('test@example.com'), 'standard email');
      assertTrue(isValidEmail('user.name+tag@domain.co.th'), 'complex email');
    });

    it('ปฏิเสธ email ที่ไม่ถูกต้อง', () => {
      assertFalse(isValidEmail('invalid'), 'no @');
      assertFalse(isValidEmail(''), 'empty');
      assertFalse(isValidEmail(null), 'null');
      assertFalse(isValidEmail('@nodomain.com'), 'no local part');
      assertFalse(isValidEmail('noatsign'), 'no at sign');
    });
  });

  describe('Utility: isValidThaiPhone', () => {})(() => {
    it('ยอมรับเบอร์โทรที่ถูกต้อง', () => {
      assertTrue(isValidThaiPhone('0812345678'), '08x prefix');
      assertTrue(isValidThaiPhone('081-234-5678'), 'with dashes');
      assertTrue(isValidThaiPhone('+66812345678'), 'international');
    });

    it('ปฏิเสธเบอร์โทรที่ไม่ถูกต้อง', () => {
      assertFalse(isValidThaiPhone('12345678'), 'too short');
      assertFalse(isValidThaiPhone(''), 'empty');
      assertFalse(isValidThaiPhone(null), 'null');
      assertFalse(isValidThaiPhone('081234567'), '9 digits');
    });
  });

  describe('Utility: normalizeEmail', () => {})(() => {
    it('เปลี่ยนเป็น lowercase + trim', () => {
      assertEqual(normalizeEmail('  USER@EXAMPLE.COM  '), 'user@example.com', 'should lowercase+trim');
      assertEqual(normalizeEmail('Test@Domain.com'), 'test@domain.com', 'should lowercase only');
    });

    it('ส่งคืน empty string สำหรับ invalid input', () => {
      assertEqual(normalizeEmail(''), '', 'empty string');
      assertEqual(normalizeEmail(null), '', 'null');
    });
  });

  describe('Utility: generateUUID', () => {})(() => {
    it('สร้าง UUID format ถูกต้อง', () => {
      const uuid = generateUUID();
      assertMatch(
        uuid,
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/,
        'UUID format'
      );
    });

    it('สร้าง UUID ที่ไม่ซ้ำกัน', () => {
      const uuids = new Set(Array.from({ length: 100 }, () => generateUUID()));
      assertEqual(uuids.size, 100, '100 UUIDs should all be unique');
    });
  });

  describe('Utility: calculateEvaluationScore', () => {})(() => {
    it('คำนวณคะแนนรวมถูกต้อง', () => {
      assertEqual(calculateEvaluationScore(85, 80), 165, '85 + 80 = 165');
      assertEqual(calculateEvaluationScore(0, 0), 0, 'zero scores');
    });

    it('ส่งคืน null สำหรับ invalid input', () => {
      assertEqual(calculateEvaluationScore('abc', 80), null, 'non-numeric behavior');
      assertEqual(calculateEvaluationScore(85, null), null, 'null corporate');
      assertEqual(calculateEvaluationScore(-1, 80), null, 'negative behavior');
    });
  });

  describe('Utility: isEvaluationPass', () => {})(() => {
    it('ผ่านเกณฑ์เมื่อคะแนน >= 60%', () => {
      assertTrue(isEvaluationPass(72, 60), 'boundary pass (60% exactly)');
      assertTrue(isEvaluationPass(100, 80), 'high scores pass');
      assertTrue(isEvaluationPass(73, 70), 'above threshold');
    });

    it('ไม่ผ่านเมื่อคะแนน < 60%', () => {
      assertFalse(isEvaluationPass(70, 60), 'behavior below 60%');
      assertFalse(isEvaluationPass(72, 59), 'corporate below 60%');
      assertFalse(isEvaluationPass(0, 0), 'zero scores');
    });
  });

  describe('Utility: normalizeCandidateStatus', () => {})(() => {
    it('map สถานะไทยเป็น English ได้ถูกต้อง', () => {
      assertEqual(normalizeCandidateStatus('ผู้สมัครใหม่'), 'New', 'ผู้สมัครใหม่ → New');
      assertEqual(normalizeCandidateStatus('คัดกรองผ่าน'), 'Passed_to_P2', 'คัดกรองผ่าน → Passed_to_P2');
      assertEqual(normalizeCandidateStatus('ไม่ผ่านคัดกรอง'), 'Rejected', 'ไม่ผ่านคัดกรอง → Rejected');
    });

    it('map English enum ได้เหมือนกัน', () => {
      assertEqual(normalizeCandidateStatus('New'), 'New', 'New → New');
      assertEqual(normalizeCandidateStatus('Passed_to_P2'), 'Passed_to_P2');
    });

    it('ส่งคืน null สำหรับค่าที่ไม่รู้จัก', () => {
      assertEqual(normalizeCandidateStatus('Unknown'), null, 'unknown status');
      assertEqual(normalizeCandidateStatus(''), null, 'empty string');
      assertEqual(normalizeCandidateStatus(null), null, 'null');
    });
  });

  describe('Utility: isValidEmployeeStatus', () => {})(() => {
    it('ยอมรับสถานะที่ถูกต้อง', () => {
      assertTrue(isValidEmployeeStatus('สมาชิกประจำ'));
      assertTrue(isValidEmployeeStatus('สมาชิกทดลองงาน'));
      assertTrue(isValidEmployeeStatus('สมาชิกประจำ(เกษียณ)'));
    });

    it('ปฏิเสธสถานะที่ไม่รู้จัก', () => {
      assertFalse(isValidEmployeeStatus('ลาออก'));
      assertFalse(isValidEmployeeStatus(''));
      assertFalse(isValidEmployeeStatus(null));
    });
  });

  describe('Utility: isValidWorkingGroup', () => {})(() => {
    it('ยอมรับ WG code ที่ถูกต้อง', () => {
      assertTrue(isValidWorkingGroup('AAMG'));
      assertTrue(isValidWorkingGroup('CPDG'));
      assertTrue(isValidWorkingGroup('PMSG'));
      assertTrue(isValidWorkingGroup('21RTG'));
    });

    it('ปฏิเสธ WG code ที่ไม่รู้จัก', () => {
      assertFalse(isValidWorkingGroup('UNKNOWN'));
      assertFalse(isValidWorkingGroup(''));
      assertFalse(isValidWorkingGroup(null));
    });
  });
}

// Export สำหรับทั้ง Node.js และ GAS
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    // Assertion functions
    assertEqual,
    assertDeepEqual,
    assertTrue,
    assertFalse,
    assertThrows,
    assertMatch,
    assertArrayLength,
    assertObjectHasKey,
    assertInRange,
    skipTest,
    describe,
    it,
    skipIt,
    getTestState,
    resetTestState,
    // Mock generators
    generateMockEmployee,
    generateMockCandidate,
    generateMockPosition,
    generateMockEvaluationQueue,
    generateMockTransferRecord,
    generateMockResignationRecord,
    generateMockEvaluators,
    generateMockScoreSample,
    // Utility functions
    calculateTenure,
    parseThaiDate,
    isValidEmail,
    isValidThaiPhone,
    normalizeEmail,
    generateUUID,
    calculateEvaluationScore,
    isEvaluationPass,
    normalizeCandidateStatus,
    isValidEmployeeStatus,
    isValidWorkingGroup,
    // Maps/Constants
    CANDIDATE_STATUS_MAP,
    EMPLOYEE_STATUS_LIST,
    WG_MAP,
    // Test runner
    runUtilTests,
  };
}
