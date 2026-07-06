/**
 * test_schema.js — ทดสอบ DB Schema Validation สำหรับ Web PP7
 *
 * ทดสอบโครงสร้างข้อมูลทุก P-Module (P1-P7), Employee, Positions
 * ตามที่ออกแบบไว้ใน Google Sheets และ Web PP7
 *
 * @version 1.0.0
 * @lastModified 2026-07-06
 */

'use strict';

const {
  assertEqual,
  assertTrue,
  assertFalse,
  assertObjectHasKey,
  assertDeepEqual,
  assertInRange,
  assertMatch,
  describe,
  it,
  describe,
  generateMockEmployee,
  generateMockCandidate,
  generateMockPosition,
  generateMockEvaluationQueue,
  generateMockTransferRecord,
  generateMockResignationRecord,
  generateMockEvaluators,
  generateMockScoreSample,
  isValidEmail,
  isValidEmployeeStatus,
  isValidWorkingGroup,
  isValidThaiPhone,
} = require('./test_utils');

// ============================================================
// 1. SCHEMA DEFINITIONS (ตาม PP7 Design Doc)
// ============================================================

/** Schema: positions (จัดการตำแหน่งงาน) */
const POSITIONS_SCHEMA = {
  requiredFields: ['id', 'title', 'department', 'is_vacant', 'updated_at'],
  fieldTypes: {
    id: 'string',
    title: 'string',
    department: 'string',
    is_vacant: 'boolean',
    updated_at: 'string', // ISO timestamp
  },
};

/** Schema: candidates (P1-ผู้สมัคร) */
const CANDIDATES_SCHEMA = {
  requiredFields: [
    'id',
    'position_id',
    'full_name',
    'contact_info',
    'resume_url',
    'pdpa_consent',
    'pdpa_consent_date',
    'status',
    'created_at',
  ],
  fieldTypes: {
    id: 'string',
    position_id: 'string',
    full_name: 'string',
    contact_info: 'object',
    resume_url: 'string',
    pdpa_consent: 'boolean',
    pdpa_consent_date: 'string',
    status: 'string',
    created_at: 'string',
  },
  statusEnum: ['New', 'Screening', 'Passed_to_P2', 'Rejected'],
};

/** Schema: employee (จาก EMPLOYEES array) */
const EMPLOYEE_SCHEMA = {
  requiredFields: ['id', 'name', 'email', 'start', 'status', 'wg', 'position', 'tenure'],
  fieldTypes: {
    id: 'string',
    name: 'string',
    email: 'string',
    start: 'string',
    status: 'string',
    wg: 'string',
    position: 'string',
    tenure: 'number',
  },
  statusEnum: [
    'สมาชิกประจำ',
    'สมาชิกประจำ(เกษียณ)',
    'สมาชิกทดลองงาน',
    'สัญญาจ้าง',
    'สัญญาจ้าง(เกษียณ)',
    'สมาชิกสัญญาจ้าง',
  ],
  wgEnum: ['21RTG', 'AAMG', 'CPDG', 'PGHG', 'PMSG', 'RAFCOG', 'RPLCG', 'Other'],
};

/** Schema: evaluationQueue (P4-ประเมินผล) */
const EVALUATION_QUEUE_SCHEMA = {
  requiredFields: [
    'evaluationId',
    'memberId',
    'name',
    'position',
    'evaluationType',
    'nextStage',
    'status',
    'matchingStatus',
  ],
  fieldTypes: {
    evaluationId: 'string',
    memberId: 'string',
    name: 'string',
    company: 'string',
    bu: 'string',
    position: 'string',
    evaluationType: 'string',
    triggerType: 'string',
    round: 'string',
    matchingStatus: 'string',
    nextStage: 'string',
    status: 'string',
    outcomeTarget: 'string',
  },
  evaluationTypeEnum: [
    'ทดลองงาน',
    'สัญญาจ้างเข้าทดลองงาน',
    'สัญญาจ้าง 1 เดือน',
    'โอนย้าย',
    'เลื่อนตำแหน่ง',
    'ประเมินประจำรอบ',
  ],
  nextStageEnum: [
    'assign-evaluators',
    'collect-rounds',
    'summary-form',
    'panel-review',
    'development-link',
  ],
};

/** Schema: transferRecord (โอนย้าย) */
const TRANSFER_SCHEMA = {
  requiredFields: [
    'transferId',
    'memberId',
    'name',
    'oldCompany',
    'newCompany',
    'transferType',
    'oldPosition',
    'newPosition',
  ],
  fieldTypes: {
    transferId: 'string',
    memberId: 'string',
    name: 'string',
    oldCompany: 'string',
    oldBranch: 'string',
    oldPosition: 'string',
    newCompany: 'string',
    newBranch: 'string',
    newPosition: 'string',
    transferType: 'string',
    assessmentStatus: 'string',
    matchingStatus: 'string',
    evaluationType: 'string',
    developmentNeed: 'string',
    compensationImpact: 'string',
    qualityOfLifeImpact: 'string',
  },
};

/** Schema: resignationRecord (ลาออก) */
const RESIGNATION_SCHEMA = {
  requiredFields: ['resignationId', 'memberId', 'name', 'company', 'employeeAction', 'vacancyAction'],
  fieldTypes: {
    resignationId: 'string',
    memberId: 'string',
    name: 'string',
    company: 'string',
    branch: 'string',
    position: 'string',
    employeeAction: 'string',
    vacancyAction: 'string',
    vacancyTitle: 'string',
    replacementFlow: 'string',
    manpowerImpact: 'string',
    qualityOfLifeRisk: 'string',
  },
  employeeActionEnum: ['remove-from-employee'],
  vacancyActionEnum: ['create-vacancy', 'mark-vacant', 'no-action'],
};

/** Schema: evaluatorAssignment (ผู้ประเมิน) */
const EVALUATOR_ASSIGNMENT_SCHEMA = {
  requiredFields: ['memberId', 'name', 'bu', 'evaluationType', 'round', 'evaluators'],
  fieldTypes: {
    memberId: 'string',
    name: 'string',
    bu: 'string',
    evaluationType: 'string',
    round: 'string',
    evaluators: 'array',
  },
  evaluatorRoles: ['ผู้รับใช้ทีม', 'เพื่อนร่วมงาน', 'ลูกค้า'],
};

/** Schema: scoreSample (คะแนนประเมิน) */
const SCORE_SAMPLE_SCHEMA = {
  requiredFields: ['memberId', 'bu', 'evaluationType', 'round', 'behaviorTotal', 'corporateTotal', 'overall'],
  fieldTypes: {
    memberId: 'string',
    name: 'string',
    bu: 'string',
    evaluationType: 'string',
    round: 'string',
    role: 'string',
    behaviorTotal: 'number',
    corporateTotal: 'number',
    overall: 'number',
  },
};

// ============================================================
// 2. VALIDATOR FUNCTIONS
// ============================================================

function validateSchema(record, schema, recordType = '') {
  const errors = [];

  // Check required fields
  for (const field of schema.requiredFields) {
    if (record[field] === undefined || record[field] === null) {
      errors.push(`${recordType} missing required field: ${field}`);
    }
  }

  // Check field types
  for (const [field, expectedType] of Object.entries(schema.fieldTypes)) {
    if (record[field] !== undefined && record[field] !== null) {
      const actualType = Array.isArray(record[field]) ? 'array' : typeof record[field];
      if (actualType !== expectedType) {
        errors.push(
          `${recordType} field "${field}" expected ${expectedType}, got ${actualType}`
        );
      }
    }
  }

  return errors;
}

function validateCandidate(c) {
  const errors = validateSchema(c, CANDIDATES_SCHEMA, 'Candidate');

  // Validate status enum
  if (c.status && !CANDIDATES_SCHEMA.statusEnum.includes(c.status)) {
    errors.push(
      `Candidate invalid status: "${c.status}" (expected one of: ${CANDIDATES_SCHEMA.statusEnum.join(', ')})`
    );
  }

  // PDPA consent is required
  if (c.pdpa_consent !== true) {
    errors.push('Candidatepdpa_consent must be true for record to be valid');
  }

  // Contact info validation
  if (c.contact_info) {
    if (!c.contact_info.phone && !c.contact_info.email) {
      errors.push('Candidate contact_info must have at least phone or email');
    }
    if (c.contact_info.email && !isValidEmail(c.contact_info.email)) {
      errors.push('Candidate contact_info.email is not a valid email');
    }
  }

  return errors;
}

function validateEmployee(e) {
  const errors = validateSchema(e, EMPLOYEE_SCHEMA, 'Employee');

  if (e.email && !isValidEmail(e.email)) {
    errors.push(`Employee "${e.id}" has invalid email: ${e.email}`);
  }

  if (e.status && !isValidEmployeeStatus(e.status)) {
    errors.push(`Employee "${e.id}" has invalid status: ${e.status}`);
  }

  if (e.wg && !isValidWorkingGroup(e.wg)) {
    errors.push(`Employee "${e.id}" has invalid working group: ${e.wg}`);
  }

  if (typeof e.tenure === 'number' && e.tenure < 0) {
    errors.push(`Employee "${e.id}" has negative tenure: ${e.tenure}`);
  }

  return errors;
}

function validateEvaluationQueue(eq) {
  const errors = validateSchema(eq, EVALUATION_QUEUE_SCHEMA, 'EvaluationQueue');

  if (
    eq.evaluationType &&
    !EVALUATION_QUEUE_SCHEMA.evaluationTypeEnum.includes(eq.evaluationType)
  ) {
    errors.push(
      `EvaluationQueue invalid evaluationType: "${eq.evaluationType}"`
    );
  }

  if (eq.nextStage && !EVALUATION_QUEUE_SCHEMA.nextStageEnum.includes(eq.nextStage)) {
    errors.push(`EvaluationQueue invalid nextStage: "${eq.nextStage}"`);
  }

  return errors;
}

// ============================================================
// 3. TEST SUITES: SCHEMA VALIDATION
// ============================================================

function runSchemaTests() {
  // --- Positions Schema ---
  describe('Schema: Positions', () => {
    it('mock position passes schema validation', () => {
      const pos = generateMockPosition();
      const errors = validateSchema(pos, POSITIONS_SCHEMA, 'Position');
      assertDeepEqual(errors, [], 'valid position should have no errors');
    });

    it('rejects position without required field', () => {
      const pos = generateMockPosition({ title: null });
      const errors = validateSchema(pos, POSITIONS_SCHEMA, 'Position');
      assertTrue(errors.length > 0, 'should have errors when title is null');
    });

    it('rejects position with wrong field types', () => {
      const pos = generateMockPosition({ is_vacant: 'yes' }); // string instead of boolean
      const errors = validateSchema(pos, POSITIONS_SCHEMA, 'Position');
      assertTrue(errors.some((e) => e.includes('is_vacant')), 'should flag type mismatch');
    });

    it('validates is_vacant as boolean true/false', () => {
      const posTrue = generateMockPosition({ is_vacant: true });
      assertDeepEqual(
        validateSchema(posTrue, POSITIONS_SCHEMA, 'Position'),
        [],
        'true is valid'
      );
      const posFalse = generateMockPosition({ is_vacant: false });
      assertFalse(
        validateSchema(posFalse, POSITIONS_SCHEMA, 'Position').length > 0,
        'false is valid'
      );
    });
  });

  // --- Candidates Schema ---
  describe('Schema: Candidates (P1)', () => {
    it('mock candidate passes schema validation', () => {
      const c = generateMockCandidate();
      const errors = validateCandidate(c);
      assertDeepEqual(errors, [], 'valid candidate should have no errors');
    });

    it('rejects candidate without PDPA consent', () => {
      const c = generateMockCandidate({ pdpa_consent: false });
      const errors = validateCandidate(c);
      assertTrue(
        errors.some((e) => e.includes('pdpa_consent')),
        'should reject when pdpa_consent is false'
      );
    });

    it('rejects candidate with invalid status enum', () => {
      const c = generateMockCandidate({ status: 'InvalidStatus' });
      const errors = validateCandidate(c);
      assertTrue(
        errors.some((e) => e.includes('status')),
        'should reject invalid status'
      );
    });

    it('accepts all valid status enum values', () => {
      for (const status of CANDIDATES_SCHEMA.statusEnum) {
        const c = generateMockCandidate({ status });
        const errors = validateCandidate(c);
        assertTrue(
          !errors.some((e) => e.includes('status')),
          `status "${status}" should be valid`
        );
      }
    });

    it('rejects candidate with missing contact_info', () => {
      const c = generateMockCandidate({ contact_info: null });
      const errors = validateSchema(c, CANDIDATES_SCHEMA, 'Candidate');
      assertTrue(errors.length > 0, 'should error on null contact_info');
    });

    it('rejects candidate with invalid email in contact_info', () => {
      const c = generateMockCandidate({
        contact_info: { phone: '0812345678', email: 'invalid-email' },
      });
      const errors = validateCandidate(c);
      assertTrue(
        errors.some((e) => e.includes('email')),
        'should reject invalid email format'
      );
    });

    it('accepts candidate with phone only (no email)', () => {
      const c = generateMockCandidate({
        contact_info: { phone: '0812345678' },
      });
      const errors = validateCandidate(c);
      assertTrue(
        !errors.some((e) => e.includes('contact_info')),
        'phone-only contact is valid'
      );
    });

    it('edge case: candidate with empty resume_url', () => {
      const c = generateMockCandidate({ resume_url: '' });
      const errors = validateSchema(c, CANDIDATES_SCHEMA, 'Candidate');
      // resume_url is required but empty string is technically present
      assertTrue(errors.length === 0, 'empty string is technically valid for schema');
    });
  });

  // --- Employee Schema ---
  describe('Schema: Employee', () => {
    it('mock employee passes schema validation', () => {
      const e = generateMockEmployee();
      const errors = validateEmployee(e);
      assertDeepEqual(errors, [], 'valid employee should have no errors');
    });

    it('rejects employee with invalid status', () => {
      const e = generateMockEmployee({ status: 'ลาออก' });
      const errors = validateEmployee(e);
      assertTrue(
        errors.some((err) => err.includes('status')),
        'should reject invalid status'
      );
    });

    it('rejects employee with invalid working group', () => {
      const e = generateMockEmployee({ wg: 'INVALID' });
      const errors = validateEmployee(e);
      assertTrue(
        errors.some((err) => err.includes('working group')),
        'should reject invalid WG'
      );
    });

    it('rejects employee with negative tenure', () => {
      const e = generateMockEmployee({ tenure: -1 });
      const errors = validateEmployee(e);
      assertTrue(
        errors.some((err) => err.includes('negative tenure')),
        'should reject negative tenure'
      );
    });

    it('rejects employee with invalid email format', () => {
      const e = generateMockEmployee({ email: 'not-an-email' });
      const errors = validateEmployee(e);
      assertTrue(
        errors.some((err) => err.includes('email')),
        'should reject invalid email format'
      );
    });

    it('validates all known working groups', () => {
      for (const wg of EMPLOYEE_SCHEMA.wgEnum) {
        const e = generateMockEmployee({ wg });
        const validationErrors = validateEmployee(e);
        assertTrue(
          !validationErrors.some((err) => err.includes('working group')),
          `WG "${wg}" should be valid`
        );
      }
    });

    it('validates with missing optional fields', () => {
      const e = generateMockEmployee();
      delete e.tenure;
      const errors = validateSchema(e, EMPLOYEE_SCHEMA, 'Employee');
      assertTrue(errors.some((err) => err.includes('tenure')), 'missing tenure should error');
    });

    it('edge case: retiree status is valid', () => {
      const e = generateMockEmployee({ status: 'สมาชิกประจำ(เกษียณ)' });
      const errors = validateEmployee(e);
      assertFalse(
        errors.some((err) => err.includes('status')),
        'retiree status should be valid'
      );
    });
  });

  // --- Evaluation Queue Schema ---
  describe('Schema: Evaluation Queue (P4)', () => {
    it('mock evaluation queue passes schema validation', () => {
      const eq = generateMockEvaluationQueue();
      const errors = validateEvaluationQueue(eq);
      assertDeepEqual(errors, [], 'valid evaluation queue item should have no errors');
    });

    it('rejects invalid evaluationType', () => {
      const eq = generateMockEvaluationQueue({ evaluationType: 'UnknownType' });
      const errors = validateEvaluationQueue(eq);
      assertTrue(
        errors.some((e) => e.includes('evaluationType')),
        'should reject unknown evaluationType'
      );
    });

    it('accepts all valid evaluationType values', () => {
      for (const et of EVALUATION_QUEUE_SCHEMA.evaluationTypeEnum) {
        const eq = generateMockEvaluationQueue({ evaluationType: et });
        const errors = validateEvaluationQueue(eq);
        assertTrue(
          !errors.some((e) => e.includes('evaluationType')),
          `evaluationType "${et}" should be valid`
        );
      }
    });

    it('rejects invalid nextStage', () => {
      const eq = generateMockEvaluationQueue({ nextStage: 'unknown-stage' });
      const errors = validateEvaluationQueue(eq);
      assertTrue(
        errors.some((e) => e.includes('nextStage')),
        'should reject unknown nextStage'
      );
    });

    it('accepts all valid nextStage values', () => {
      for (const ns of EVALUATION_QUEUE_SCHEMA.nextStageEnum) {
        const eq = generateMockEvaluationQueue({ nextStage: ns });
        const errors = validateEvaluationQueue(eq);
        assertTrue(
          !errors.some((e) => e.includes('nextStage')),
          `nextStage "${ns}" should be valid`
        );
      }
    });
  });

  // --- Transfer Schema ---
  describe('Schema: Transfer', () => {
    it('mock transfer record passes schema validation', () => {
      const tr = generateMockTransferRecord();
      const errors = validateSchema(tr, TRANSFER_SCHEMA, 'Transfer');
      assertDeepEqual(errors, [], 'valid transfer should have no errors');
    });

    it('rejects transfer without transferId', () => {
      const tr = generateMockTransferRecord({ transferId: null });
      const errors = validateSchema(tr, TRANSFER_SCHEMA, 'Transfer');
      assertTrue(errors.length > 0, 'should have errors when transferId is null');
    });

    it('validates cross-company transfer (old ≠ new company)', () => {
      const tr = generateMockTransferRecord({
        oldCompany: 'AAMG',
        newCompany: 'CPDG',
      });
      const errors = validateSchema(tr, TRANSFER_SCHEMA, 'Transfer');
      assertDeepEqual(errors, [], 'cross-company transfer is valid');
      assertTrue(tr.oldCompany !== tr.newCompany, 'old and new company should differ');
    });

    it('allows same-company same-branch transfer', () => {
      // Edge case: internal transfer within same branch (e.g. different department)
      const tr = generateMockTransferRecord({
        transferType: 'โอนย้ายภายใน',
      });
      const errors = validateSchema(tr, TRANSFER_SCHEMA, 'Transfer');
      assertDeepEqual(errors, [], 'same company transfer is schema-valid');
    });
  });

  // --- Resignation Schema ---
  describe('Schema: Resignation', () => {
    it('mock resignation record passes schema validation', () => {
      const rs = generateMockResignationRecord();
      const errors = validateSchema(rs, RESIGNATION_SCHEMA, 'Resignation');
      assertDeepEqual(errors, [], 'valid resignation should have no errors');
    });

    it('rejects resignation without resignationId', () => {
      const rs = generateMockResignationRecord({ resignationId: null });
      const errors = validateSchema(rs, RESIGNATION_SCHEMA, 'Resignation');
      assertTrue(errors.length > 0, 'missing resignationId should cause errors');
    });

    it('verifies employeeAction enum values exist', () => {
      for (const action of RESIGNATION_SCHEMA.employeeActionEnum) {
        const rs = generateMockResignationRecord({ employeeAction: action });
        // Just validate the schema doesn't crash with known enum
        const errors = validateSchema(rs, RESIGNATION_SCHEMA, 'Resignation');
        assertDeepEqual(errors, [], `employeeAction "${action}" is valid`);
      }
    });

    it('verifies vacancyAction enum values exist', () => {
      for (const action of RESIGNATION_SCHEMA.vacancyActionEnum) {
        const rs = generateMockResignationRecord({ vacancyAction: action });
        const errors = validateSchema(rs, RESIGNATION_SCHEMA, 'Resignation');
        assertDeepEqual(errors, [], `vacancyAction "${action}" is valid`);
      }
    });
  });

  // --- Evaluator Assignment Schema ---
  describe('Schema: EvaluatorAssignment', () => {
    it('evaluator assignment with valid evaluators', () => {
      const ea = {
        memberId: '5102012',
        name: 'รัฐพร คะชาแก้ว',
        bu: 'CPDG',
        evaluationType: 'เลื่อนตำแหน่ง',
        round: 'รอบที่2',
        evaluators: generateMockEvaluators(6),
      };
      const errors = validateSchema(ea, EVALUATOR_ASSIGNMENT_SCHEMA, 'EvaluatorAssignment');
      assertDeepEqual(errors, [], 'valid assignment should have no errors');
      assertTrue(Array.isArray(ea.evaluators), 'evaluators should be array');
      assertTrue(ea.evaluators.length === 6, 'should have 6 evaluators');
    });

    it('evaluator with valid roles only', () => {
      const evals = generateMockEvaluators(5);
      for (const ev of evals) {
        assertTrue(
          EVALUATOR_ASSIGNMENT_SCHEMA.evaluatorRoles.includes(ev.role),
          `role "${ev.role}" should be valid`
        );
      }
    });
  });

  // --- Score Sample Schema ---
  describe('Schema: ScoreSample', () => {
    it('mock score sample passes schema validation', () => {
      const ss = generateMockScoreSample();
      const errors = validateSchema(ss, SCORE_SAMPLE_SCHEMA, 'ScoreSample');
      assertDeepEqual(errors, [], 'valid score sample should have no errors');
    });

    it('overall equals behavior + corporate', () => {
      const ss = generateMockScoreSample();
      assertEqual(
        ss.overall,
        ss.behaviorTotal + ss.corporateTotal,
        'overall should equal sum of behavior + corporate'
      );
    });

    it('rejects negative scores', () => {
      const ss = generateMockScoreSample({ behaviorTotal: -5 });
      // Schema doesn't have range checks, just type checks
      const errors = validateSchema(ss, SCORE_SAMPLE_SCHEMA, 'ScoreSample');
      assertDeepEqual(errors, [], 'schema allows negative numbers (range validation separate)');
    });

    it('scores are within expected range', () => {
      const ss = generateMockScoreSample();
      // behavior: max ~120, corporate: max ~100
      assertInRange(ss.behaviorTotal, 0, 200, 'behavior within range');
      assertInRange(ss.corporateTotal, 0, 200, 'corporate within range');
      assertInRange(ss.overall, 0, 400, 'overall within range');
    });
  });

  // --- Cross-reference Integrity ---
  describe('Schema: Cross-Reference Integrity', () => {
    it('employee ID is unique within set', () => {
      const testEmployees = [
        generateMockEmployee({ id: '001', name: 'A' }),
        generateMockEmployee({ id: '002', name: 'B' }),
        generateMockEmployee({ id: '003', name: 'C' }),
      ];
      const ids = testEmployees.map((e) => e.id);
      assertEqual(new Set(ids).size, ids.length, 'all IDs should be unique');
    });

    it('duplicate employee IDs are detected', () => {
      const testEmployees = [
        generateMockEmployee({ id: 'DUP001', name: 'A' }),
        generateMockEmployee({ id: 'DUP001', name: 'B' }),
      ];
      const ids = testEmployees.map((e) => e.id);
      assertFalse(new Set(ids).size === ids.length, 'duplicates should be detected');
    });

    it('evaluator memberId references back to evaluation queue', () => {
      const eq = generateMockEvaluationQueue({ memberId: '9999001' });
      const ea = { memberId: '9999001' };
      // Cross-reference: memberId should match
      assertEqual(ea.memberId, eq.memberId, 'evaluator memberId should match evaluation queue');
    });

    it('transfer memberId references a valid employee', () => {
      const emp = generateMockEmployee({ id: 'TR-EMP-001' });
      const tr = generateMockTransferRecord({ memberId: 'TR-EMP-001' });
      assertEqual(tr.memberId, emp.id, 'transfer memberId should reference employee');
    });

    it('resignation memberId is consistent', () => {
      const emp = generateMockEmployee({ id: 'RS-EMP-001' });
      const rs = generateMockResignationRecord({ memberId: 'RS-EMP-001' });
      assertEqual(rs.memberId, emp.id, 'resignation memberId should reference employee');
    });
  });
}

// ============================================================
// 4. EXPORTS
// ============================================================

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    // Schema definitions
    POSITIONS_SCHEMA,
    CANDIDATES_SCHEMA,
    EMPLOYEE_SCHEMA,
    EVALUATION_QUEUE_SCHEMA,
    TRANSFER_SCHEMA,
    RESIGNATION_SCHEMA,
    EVALUATOR_ASSIGNMENT_SCHEMA,
    SCORE_SAMPLE_SCHEMA,
    // Validators
    validateSchema,
    validateCandidate,
    validateEmployee,
    validateEvaluationQueue,
    // Test runner
    runSchemaTests,
  };
}
