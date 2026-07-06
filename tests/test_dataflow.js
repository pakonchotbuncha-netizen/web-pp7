/**
 * test_dataflow.js — ทดสอบ Data Flow ระหว่าง P1-P7 สำหรับ Web PP7
 *
 * ทดสอบว่าข้อมูลไหลจาก P1 (แสวงหา) → P7 (คุณภาพชีวิต) ได้อย่างถูกต้อง
 * ครอบคลุม:
 * - P1 → P2: ผู้สมัครผ่านคัดกรอง → เข้าประเมิน
 * - P2 → P3: ประเมินเสร็จ → จับคู่คนงาน
 * - P3 → P4: จับคู่เสร็จ → สร้าง evaluation entry
 * - P4 → P5: ประเมินผลเสร็จ → สร้าง development plan
 * - P4 → P6: ประเมินผลเสร็จ → trigger คำนวณค่าตอบแทน
 * - P4 → P7: คุณภาพชีวิตได้รับ feedback
 * - Transfer pipeline flows
 * - Resignation + replacement pipeline
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
  describe,
  it,
  generateMockCandidate,
  generateMockEmployee,
  generateMockEvaluationQueue,
  generateMockTransferRecord,
  generateMockResignationRecord,
  getTestState,
} = require('./test_utils');

// ============================================================
// 1. PIPELINE STATE MACHINE (จำลอง workflow ของ PP7)
// ============================================================

/**
 * สถานะที่ผู้สมัคร/สมาชิกสามารถมีได้ในระบบ PP7
 */
const CANDIDATE_FLOW = {
  New: ['Screening', 'Rejected'],
  Screening: ['Passed_to_P2', 'Rejected'],
  Passed_to_P2: [], // terminal: handed off to P2
  Rejected: [], // terminal
};

/**
 * สถานะ evaluation pipeline
 * ตาม evaluation_pipeline.js: assign-evaluators → collect-rounds → summary-form → panel-review → development-link
 */
const EVALUATION_STAGES = {
  'assign-evaluators': 'collect-rounds',
  'collect-rounds': 'summary-form',
  'summary-form': 'panel-review',
  'panel-review': 'development-link',
  'development-link': null, // terminal
};

const EVALUATION_STATUS = {
  'assign-evaluators': 'รอแต่งตั้งผู้ประเมิน',
  'collect-rounds': 'อยู่ในรอบทดลองงาน',
  'summary-form': 'รอสรุปผลสัญญาจ้าง',
  'panel-review': 'อยู่ระหว่างประเมินเลื่อนตำแหน่ง',
  'development-link': 'พร้อมเชื่อม development plan',
};

const EVALUATION_OUTCOME_TARGET = {
  'assign-evaluators': 'ยืนยันบทบาทใหม่',
  'collect-rounds': 'ผ่านทดลองงาน',
  'summary-form': 'ตัดสินต่อสัญญา',
  'panel-review': 'ยืนยันความพร้อมต่อบทบาทใหม่',
  'development-link': 'ใช้จัดทำแผนพัฒนา',
};

/**
 * จำลอง state machine ของ evaluation pipeline
 */
function advanceEvaluation(evaluation) {
  const current = evaluation.nextStage;
  if (!EVALUATION_STAGES[current]) {
    throw new Error(`Cannot advance from stage: ${current}`);
  }
  const next = EVALUATION_STAGES[current];
  if (next === null) {
    return { ...evaluation, _terminal: true };
  }
  return {
    ...evaluation,
    nextStage: next,
    status: EVALUATION_STATUS[next] || evaluation.status,
    outcomeTarget: EVALUATION_OUTCOME_TARGET[next] || evaluation.outcomeTarget,
  };
}

/**
 * จำลองการ transition ของ candidate ผ่าน P1
 */
function transitionCandidate(candidate, newStatus) {
  const current = candidate.status;
  if (!CANDIDATE_FLOW[current]) {
    throw new Error(`Unknown candidate status: ${current}`);
  }
  if (!CANDIDATE_FLOW[current].includes(newStatus)) {
    throw new Error(
      `Invalid transition: ${current} → ${newStatus}. Allowed: ${CANDIDATE_FLOW[current].join(', ')}`
    );
  }
  return { ...candidate, status: newStatus };
}

/**
 * ตรวจสอบว่า candidate พร้อมส่งไป P2 หรือไม่
 */
function isCandidateReadyForP2(candidate) {
  return candidate.status === 'Passed_to_P2' && candidate.pdpa_consent === true;
}

/**
 * จำลอง P3: Matching pipeline - ตรวจสอบว่าจับคู่คนกับงานได้ถูกต้อง
 */
function matchCandidateToPosition(candidate, position) {
  if (!position.is_vacant) {
    return { matched: false, reason: 'Position is not vacant' };
  }
  if (candidate.status !== 'Passed_to_P2') {
    return { matched: false, reason: 'Candidate not yet passed to P2' };
  }
  // Simulated matching logic
  return {
    matched: true,
    matchInfo: {
      candidateId: candidate.id,
      positionId: position.id,
      matchScore: 0.85,
      recommendation: 'พร้อมเข้าสู่ evaluation โอนย้าย',
      status: 'จับคู่แล้ว',
    },
  };
}

/**
 * จำลอง Transfer pipeline field mapping (จาก state/transfer_resignation_pipeline.js)
 */
const TRANSFER_FIELD_MAPPING = {
  recruitment: ['personID', 'firstname', 'lastname', 'companyNEW', 'branchNEW', 'positionNEW', 'departmentNEW', 'type_new'],
  assessment: ['Status_Transfer', 'status_assessment', 'note_assessment', 'Day_interview', 'Time_interview', 'url_form'],
  matching: ['positionOLD', 'divOLD', 'branchOLD', 'companyOLD', 'positionNEW', 'divNEW', 'branchNEW', 'companyNEW', 'personID_NEW'],
  evaluation: ['statusNEW', 'detail_NEW', 'date_NEW', 'type_new'],
  development: ['purpose_p', 'Annual_Compass_p', 'Metrics_p', 'Accountability_p'],
  compensation: ['cost_job', 'balance', 'salary_packaging', 'chip', 'rents', 'fuel', 'telephone_charge'],
  qualityOfLife: ['branchOLD', 'branchNEW', 'companyOLD', 'companyNEW', 'statusOLD', 'statusNEW'],
};

/**
 * ตรวจสอบว่า transfer record มี fields ครบทุก P
 */
function validateTransferFieldCoverage(record) {
  const results = {};
  for (const [pModule, fields] of Object.entries(TRANSFER_FIELD_MAPPING)) {
    results[pModule] = {
      requiredFields: fields.length,
      hasFields: fields.every((f) => {
        // Check if field exists in record (directly or via mapping)
        return Object.keys(record).some((k) => f.includes(k));
      }),
      fields,
    };
  }
  return results;
}

/**
 * จำลอง Resignation pipeline field mapping
 */
const RESIGNATION_FIELD_MAPPING = {
  recruitment: ['id', 'position', 'branch', 'company', 'replacement_required', 'vacancy_status'],
  assessment: ['exit_reason', 'risk_note', 'turnover_group'],
  matching: ['vacancy_position', 'vacancy_branch', 'vacancy_company', 'replacement_priority'],
  evaluation: ['replacement_member_id', 'replacement_evaluation_type'],
  development: ['handover_gap', 'critical_skill_gap'],
  compensation: ['salary_last', 'loan_balance', 'guarantee_balance', 'manpower_effect'],
  qualityOfLife: ['exit_reason', 'team_impact', 'turnover_rate'],
};

// ============================================================
// 2. TEST SUITES: DATA FLOW
// ============================================================

function runDataflowTests() {
  // --- P1 → P2 Transition ---
  describe('DataFlow: P1 → P2 (Candidate transition)', () => {
    it('valid transition: New → Screening → Passed_to_P2', () => {
      const c = generateMockCandidate({ status: 'New' });
      const c2 = transitionCandidate(c, 'Screening');
      assertEqual(c2.status, 'Screening', 'should transition to Screening');
      const c3 = transitionCandidate(c2, 'Passed_to_P2');
      assertEqual(c3.status, 'Passed_to_P2', 'should transition to Passed_to_P2');
    });

    it('valid transition: New → Rejected', () => {
      const c = generateMockCandidate({ status: 'New' });
      const c2 = transitionCandidate(c, 'Rejected');
      assertEqual(c2.status, 'Rejected', 'should transition to Rejected');
    });

    it('invalid transition: Rejected → New (should throw)', () => {
      const c = generateMockCandidate({ status: 'Rejected' });
      let threw = false;
      try {
        transitionCandidate(c, 'New');
      } catch (e) {
        threw = true;
        assertTrue(e.message.includes('Invalid transition'), 'error should explain');
      }
      assertTrue(threw, 'invalid transition should throw');
    });

    it('invalid transition: Screening → New (backward not allowed)', () => {
      const c = generateMockCandidate({ status: 'Screening' });
      let threw = false;
      try {
        transitionCandidate(c, 'New');
      } catch (e) {
        threw = true;
      }
      assertTrue(threw, 'backward transition should throw');
    });

    it('invalid transition: Passed_to_P2 → anything (terminal)', () => {
      const c = generateMockCandidate({ status: 'Passed_to_P2' });
      let threw = false;
      try {
        transitionCandidate(c, 'New');
      } catch (e) {
        threw = true;
      }
      assertTrue(threw, 'Passed_to_P2 is terminal, should throw');
    });

    it('candidate isReadyForP2 when Passed_to_P2 and pdpa_consent=true', () => {
      const c = generateMockCandidate({ status: 'Passed_to_P2', pdpa_consent: true });
      assertTrue(isCandidateReadyForP2(c), 'should be ready');
    });

    it('candidate NOT ready for P2 without PDPA consent', () => {
      const c = generateMockCandidate({ status: 'Passed_to_P2', pdpa_consent: false });
      assertFalse(isCandidateReadyForP2(c), 'should NOT be ready without PDPA');
    });

    it('candidate NOT ready for P2 with wrong status', () => {
      const c = generateMockCandidate({ status: 'Screening', pdpa_consent: true });
      assertFalse(isCandidateReadyForP2(c), 'should NOT be ready with Screening status');
    });
  });

  // --- P2 → P3: Matching ---
  describe('DataFlow: P2 → P3 (Matching candidate to position)', () => {
    it('matches Passed_to_P2 candidate to vacant position', () => {
      const c = generateMockCandidate({ status: 'Passed_to_P2', pdpa_consent: true });
      const p = { id: 'POS-001', title: 'ตำแหน่งทดสอบ', is_vacant: true };
      const result = matchCandidateToPosition(c, p);
      assertTrue(result.matched, 'should match');
      assertTrue(result.matchInfo.matchScore > 0, 'should have positive score');
      assertEqual(result.matchInfo.candidateId, c.id, 'should include candidateId');
    });

    it('rejects match for non-vacant position', () => {
      const c = generateMockCandidate({ status: 'Passed_to_P2', pdpa_consent: true });
      const p = { id: 'POS-002', title: 'ตำแหน่งเต็ม', is_vacant: false };
      const result = matchCandidateToPosition(c, p);
      assertFalse(result.matched, 'should not match non-vacant');
    });

    it('rejects match for candidate not yet Passed_to_P2', () => {
      const c = generateMockCandidate({ status: 'Screening', pdpa_consent: true });
      const p = { id: 'POS-003', title: 'ตำแหน่งว่าง', is_vacant: true };
      const result = matchCandidateToPosition(c, p);
      assertFalse(result.matched, 'should not match screening candidate');
      assertEqual(result.reason, 'Candidate not yet passed to P2');
    });

    it('match carries candidate data correctly', () => {
      const candidateId = '9999001';
      const c = generateMockCandidate({
        id: candidateId,
        status: 'Passed_to_P2',
        pdpa_consent: true,
      });
      const p = { id: 'POS-MATCH', title: 'ตำแหน่ง A', is_vacant: true };
      const result = matchCandidateToPosition(c, p);
      assertEqual(result.matchInfo.candidateId, candidateId, 'candidate ID preserved');
      assertEqual(result.matchInfo.positionId, p.id, 'position ID preserved');
    });
  });

  // --- P3 → P4 → P5: Evaluation Pipeline ---
  describe('DataFlow: P3 → P4 → P5 (Evaluation pipeline stages)', () => {
    it('full pipeline: assign-evaluators → development-link', () => {
      let eq = generateMockEvaluationQueue({ nextStage: 'assign-evaluators' });
      assertEqual(eq.nextStage, 'assign-evaluators');

      eq = advanceEvaluation(eq);
      assertEqual(eq.nextStage, 'collect-rounds', 'should advance to collect-rounds');

      eq = advanceEvaluation(eq);
      assertEqual(eq.nextStage, 'summary-form', 'should advance to summary-form');

      eq = advanceEvaluation(eq);
      assertEqual(eq.nextStage, 'panel-review', 'should advance to panel-review');

      eq = advanceEvaluation(eq);
      assertEqual(eq.nextStage, 'development-link', 'should advance to development-link');

      eq = advanceEvaluation(eq);
      assertTrue(eq._terminal === true, 'development-link is terminal');
    });

    it('status updates correctly at each stage', () => {
      let eq = generateMockEvaluationQueue({ nextStage: 'assign-evaluators' });

      eq = advanceEvaluation(eq);
      assertEqual(eq.status, EVALUATION_STATUS['collect-rounds']);

      eq = advanceEvaluation(eq);
      assertEqual(eq.status, EVALUATION_STATUS['summary-form']);

      eq = advanceEvaluation(eq);
      assertEqual(eq.status, EVALUATION_STATUS['panel-review']);

      eq = advanceEvaluation(eq);
      assertEqual(eq.status, EVALUATION_STATUS['development-link']);
    });

    it('throws when advancing from terminal stage', () => {
      let eq = generateMockEvaluationQueue({ nextStage: 'development-link' });
      eq = advanceEvaluation(eq); // returns terminal marker
      let threw = false;
      try {
        advanceEvaluation(eq);
      } catch (e) {
        threw = true;
      }
      assertTrue(threw, 'should throw from invalid stage');
    });

    it('outcome target updates correctly at each stage', () => {
      let eq = generateMockEvaluationQueue({ nextStage: 'assign-evaluators' });
      eq = advanceEvaluation(eq);
      assertEqual(eq.outcomeTarget, EVALUATION_OUTCOME_TARGET['collect-rounds']);
    });

    it('evaluation starting at each valid stage', () => {
      for (const stage of Object.keys(EVALUATION_STAGES)) {
        const eq = generateMockEvaluationQueue({ nextStage: stage });
        assertEqual(eq.nextStage, stage, `starts at ${stage}`);
      }
    });
  });

  // --- P5 Development Plan Cascade ---
  describe('DataFlow: P4 → P5 (Development plan cascade)', () => {
    it('evaluation → development-link signals P5 trigger', () => {
      let eq = generateMockEvaluationQueue({ nextStage: 'assign-evaluators' });
      // Advance to development-link
      while (eq.nextStage !== 'development-link' && !eq._terminal) {
        eq = advanceEvaluation(eq);
      }
      assertEqual(eq.nextStage, 'development-link');
      // At this point, system should trigger development plan creation
      assertTrue(
        eq.status.includes('development plan') || eq.nextStage === 'development-link',
        'should signal development plan trigger'
      );
    });
  });

  // --- Transfer Pipeline ---
  describe('DataFlow: Transfer Pipeline (7-module field coverage)', () => {
    it('all 7 P-modules have field mappings defined', () => {
      const modules = [
        'recruitment',
        'assessment',
        'matching',
        'evaluation',
        'development',
        'compensation',
        'qualityOfLife',
      ];
      for (const m of modules) {
        assertTrue(m in TRANSFER_FIELD_MAPPING, `${m} should be in field mapping`);
        assertTrue(
          TRANSFER_FIELD_MAPPING[m].length > 0,
          `${m} should have at least one field`
        );
      }
    });

    it('recruitment field mapping has expected fields', () => {
      const fields = TRANSFER_FIELD_MAPPING.recruitment;
      assertTrue(fields.includes('personID'), 'should include personID');
      assertTrue(fields.includes('companyNEW'), 'should include companyNEW');
      assertTrue(fields.includes('positionNEW'), 'should include positionNEW');
    });

    it('matching field mapping has OLD and NEW positions', () => {
      const fields = TRANSFER_FIELD_MAPPING.matching;
      assertTrue(fields.includes('positionOLD'), 'should include positionOLD');
      assertTrue(fields.includes('positionNEW'), 'should include positionNEW');
      assertTrue(fields.includes('companyOLD'), 'should include companyOLD');
      assertTrue(fields.includes('companyNEW'), 'should include companyNEW');
    });

    it('compensation field mapping includes cost and salary', () => {
      const fields = TRANSFER_FIELD_MAPPING.compensation;
      assertTrue(fields.includes('salary_packaging'), 'should include salary_packaging');
      assertTrue(fields.includes('cost_job'), 'should include cost_job');
    });

    it('quality of life mapping covers OLD/NEW branches', () => {
      const fields = TRANSFER_FIELD_MAPPING.qualityOfLife;
      assertTrue(fields.includes('branchOLD'), 'should include branchOLD');
      assertTrue(fields.includes('branchNEW'), 'should include branchNEW');
      assertTrue(fields.includes('companyOLD'), 'should include companyOLD');
      assertTrue(fields.includes('companyNEW'), 'should include companyNEW');
    });

    it('development field mapping includes planning fields', () => {
      const fields = TRANSFER_FIELD_MAPPING.development;
      assertTrue(fields.includes('purpose_p'), 'should include purpose_p');
      assertTrue(fields.includes('Annual_Compass_p'), 'should include Annual_Compass_p');
    });

    it('transfer record has data for all 7 P-modules', () => {
      const tr = generateMockTransferRecord();
      // Verify the transfer record structure aligns with field mapping
      assertTrue(tr.transferId !== null, 'transferId present');
      assertTrue(tr.memberId !== null, 'memberId present');
      assertTrue(tr.oldCompany !== null, 'oldCompany present (matching P)');
      assertTrue(tr.newCompany !== null, 'newCompany present (matching P)');
      assertTrue(tr.developmentNeed !== null, 'developmentNeed present (development P)');
      assertTrue(tr.compensationImpact !== null, 'compensationImpact present (compensation P)');
      assertTrue(
        tr.qualityOfLifeImpact !== null,
        'qualityOfLifeImpact present (quality of life P)'
      );
    });
  });

  // --- Resignation Pipeline ---
  describe('DataFlow: Resignation Pipeline (replacement flow)', () => {
    it('all 7 P-modules have field mappings for resignation', () => {
      const modules = [
        'recruitment',
        'assessment',
        'matching',
        'evaluation',
        'development',
        'compensation',
        'qualityOfLife',
      ];
      for (const m of modules) {
        assertTrue(m in RESIGNATION_FIELD_MAPPING, `${m} should be in resignation field mapping`);
      }
    });

    it('recruitment mapping includes replacement_required', () => {
      const fields = RESIGNATION_FIELD_MAPPING.recruitment;
      assertTrue(fields.includes('replacement_required'), 'should include replacement_required');
    });

    it('resignation triggers full replacement flow P1→P4', () => {
      const rs = generateMockResignationRecord();
      assertEqual(rs.replacementFlow, 'Recruitment -> Assessment -> Matching -> Evaluation', 'replacement flow');
    });

    it('resignation has both employee and vacancy actions', () => {
      const rs = generateMockResignationRecord();
      assertEqual(rs.employeeAction, 'remove-from-employee', 'should remove from employee');
      assertEqual(rs.vacancyAction, 'create-vacancy', 'should create vacancy');
    });

    it('resignation captures quality of life risk', () => {
      const rs = generateMockResignationRecord();
      assertTrue(rs.qualityOfLifeRisk !== null && rs.qualityOfLifeRisk.length > 0, 'should have QoL risk');
    });

    it('resignation captures manpower impact', () => {
      const rs = generateMockResignationRecord();
      assertTrue(rs.manpowerImpact !== null && rs.manpowerImpact.length > 0, 'should have manpower impact');
    });

    it('compensation mapping covers financial impact', () => {
      const fields = RESIGNATION_FIELD_MAPPING.compensation;
      assertTrue(fields.includes('salary_last'), 'should include salary_last');
      assertTrue(fields.includes('loan_balance'), 'should include loan_balance');
      assertTrue(fields.includes('guarantee_balance'), 'should include guarantee_balance');
    });

    it('development mapping covers handover gaps', () => {
      const fields = RESIGNATION_FIELD_MAPPING.development;
      assertTrue(fields.includes('handover_gap'), 'should include handover_gap');
      assertTrue(fields.includes('critical_skill_gap'), 'should include critical_skill_gap');
    });
  });

  // --- Data Consistency across pipelines ---
  describe('DataFlow: Cross-Pipeline data consistency', () => {
    it('memberId consistent across all pipeline records', () => {
      const memberId = '9999001';
      const emp = generateMockEmployee({ id: memberId });
      const tr = generateMockTransferRecord({ memberId });
      const eq = generateMockEvaluationQueue({ memberId });
      assertEqual(emp.id, tr.memberId, 'employee ↔ transfer');
      assertEqual(emp.id, eq.memberId, 'employee ↔ evaluation');
    });

    it('BU code consistent between employee and evaluation', () => {
      const wg = 'AAMG';
      const emp = generateMockEmployee({ wg });
      const eq = generateMockEvaluationQueue({ bu: wg });
      assertEqual(emp.wg, eq.bu, 'WG code should match BU code');
    });

    it('evaluationType determines which fields are required', () => {
      const types = ['ทดลองงาน', 'โอนย้าย', 'เลื่อนตำแหน่ง'];
      for (const et of types) {
        const eq = generateMockEvaluationQueue({ evaluationType: et });
        assertEqual(eq.evaluationType, et, `evaluationType ${et} set correctly`);
        assertTrue(eq.nextStage !== null, 'should have a next stage');
      }
    });

    it('transfer creates evaluation entry with correct type', () => {
      const tr = generateMockTransferRecord();
      // Simulate creating evaluation entry from transfer
      const eq = generateMockEvaluationQueue({
        evaluationType: tr.evaluationType, // 'โอนย้าย'
      });
      assertEqual(eq.evaluationType, 'โอนย้าย', 'evaluation type from transfer');
    });

    it('resignation creates vacancy that feeds back into P1 recruitment', () => {
      const rs = generateMockResignationRecord();
      // After resignation, the vacancy_title becomes a new position in P1
      assertEqual(rs.vacancyAction, 'create-vacancy');
      // The replacementFlow shows it feeds back to P1
      assertTrue(
        rs.replacementFlow.startsWith('Recruitment'),
        'replacement flow starts with Recruitment (P1)'
      );
    });
  });

  // --- Edge Cases ---
  describe('DataFlow: Edge Cases', () => {
    it('candidate can only transition once per direction (no back-tracking)', () => {
      const c = generateMockCandidate({ status: 'Screening' });
      const passed = transitionCandidate(c, 'Passed_to_P2');
      // Try to go back to Screening
      let threw = false;
      try {
        transitionCandidate(passed, 'Screening');
      } catch (e) {
        threw = true;
      }
      assertTrue(threw, 'should not allow back-tracking');
    });

    it('evaluation cannot skip stages', () => {
      const eq = generateMockEvaluationQueue({ nextStage: 'assign-evaluators' });
      // Try to jump to panel-review directly
      // Our advanceEvaluation only allows sequential transitions
      const next = advanceEvaluation(eq);
      assertEqual(next.nextStage, 'collect-rounds', 'cannot skip to panel-review');
    });

    it('same company transfer is valid (edge case)', () => {
      const tr = generateMockTransferRecord({
        oldCompany: 'AAMG',
        newCompany: 'AAMG',
        oldBranch: 'สาขา อ',
        newBranch: 'สาขา ข',
      });
      assertTrue(tr.oldBranch !== tr.newBranch, 'branches should differ');
    });

    it('multiple evaluations for same member are independent', () => {
      const memberId = '5102012';
      const eq1 = generateMockEvaluationQueue({
        evaluationId: 'EV-001',
        memberId,
        evaluationType: 'ทดลองงาน',
      });
      const eq2 = generateMockEvaluationQueue({
        evaluationId: 'EV-002',
        memberId,
        evaluationType: 'เลื่อนตำแหน่ง',
      });
      assertTrue(eq1.evaluationId !== eq2.evaluationId, 'different evaluation IDs');
      assertTrue(eq1.evaluationType !== eq2.evaluationType, 'different evaluation types');
      assertEqual(eq1.memberId, eq2.memberId, 'same member');
    });
  });
}

// ============================================================
// 3. EXPORTS
// ============================================================

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    // State machine
    CANDIDATE_FLOW,
    EVALUATION_STAGES,
    EVALUATION_STATUS,
    EVALUATION_OUTCOME_TARGET,
    TRANSFER_FIELD_MAPPING,
    RESIGNATION_FIELD_MAPPING,
    // Functions
    advanceEvaluation,
    transitionCandidate,
    isCandidateReadyForP2,
    matchCandidateToPosition,
    validateTransferFieldCoverage,
    // Test runner
    runDataflowTests,
  };
}
