/**
 * ===================================================================
 * Web PP7 — Services Layer
 * Business logic and workflow operations per process (P1–P7)
 * ===================================================================
 */

var Services = (function() {
  'use strict';

  // =========================================================================
  // P1: Recruitment — Headcount Request → Candidate Pipeline
  // =========================================================================

  /**
   * Submit a new headcount request
   */
  function submitHeadcount(data, createdBy) {
    Validations.headcount(data);
    data.approval_status = 'pending';
    data.request_date = data.request_date || Utils.timestamp();
    var result = Database.createRecord('p1_headcount', data, createdBy);
    return {
      success: true,
      message: 'Headcount request submitted',
      hc_id: result.id
    };
  }

  /**
   * Approve or reject a headcount request
   */
  function decideHeadcount(hcId, decision, approvedBy) {
    if (['approved', 'rejected', 'on_hold'].indexOf(decision) === -1) {
      throw new Error('Invalid decision: ' + decision + '. Use: approved, rejected, on_hold');
    }
    var hc = Database.getRecord('p1_headcount', hcId);
    if (!hc) throw new Error('Headcount not found: ' + hcId);

    var update = {
      approval_status: decision,
      approved_by: approvedBy,
      approved_date: Utils.timestamp()
    };
    Database.updateRecord('p1_headcount', hcId, update);
    return { success: true, message: 'Headcount ' + decision, hc_id: hcId };
  }

  /**
   * Add a candidate to a headcount request
   */
  function addCandidate(hcId, data) {
    var hc = Database.getRecord('p1_headcount', hcId);
    if (!hc) throw new Error('Headcount not found: ' + hcId);

    data.hc_id = hcId;
    data.stage = data.stage || 'applied';
    data.status = data.status || 'new';
    data.apply_date = data.apply_date || Utils.formatDate(new Date());

    // Auto-populate from headcount
    if (!data.position_applied) data.position_applied = hc.position;
    if (!data.bu) data.bu = hc.bu;

    Validations.candidate(data);
    return Database.createRecord('p1_candidates', data);
  }

  /**
   * Advance candidate to next stage
   * Flow: applied → screened → interview → assessment → offer → hired
   *                                                       └→ rejected
   */
  function advanceCandidate(candidateId, newStage, notes) {
    var validStages = {
      'applied':    ['screened', 'rejected'],
      'screened':   ['interview', 'rejected'],
      'interview':  ['assessment', 'rejected'],
      'assessment': ['offer', 'rejected'],
      'offer':      ['hired', 'rejected']
    };

    var candidate = Database.getRecord('p1_candidates', candidateId);
    if (!candidate) throw new Error('Candidate not found: ' + candidateId);

    var currentStage = (candidate.stage || 'applied').toLowerCase();
    var allowedNext = validStages[currentStage] || [];

    if (allowedNext.indexOf(newStage) === -1) {
      throw new Error('Cannot move from ' + currentStage + ' to ' + newStage +
        '. Allowed: ' + allowedNext.join(', '));
    }

    var update = { stage: newStage, status: newStage };

    // Set milestone dates
    if (newStage === 'interview') {
      update.interview_date = Utils.formatDate(new Date());
    } else if (newStage === 'offer') {
      update.offer_date = Utils.formatDate(new Date());
    } else if (newStage === 'hired') {
      update.hire_date = Utils.formatDate(new Date());
      update.status = 'hired';
    } else if (newStage === 'rejected') {
      update.status = 'rejected';
      if (notes) update.rejected_reason = notes;
    }

    if (notes && newStage !== 'rejected') {
      update.rejected_reason = notes; // reuse field for stage notes
    }

    Database.updateRecord('p1_candidates', candidateId, update);
    return {
      success: true,
      candidate_id: candidateId,
      from: currentStage,
      to: newStage,
      message: 'Candidate moved to ' + newStage + ' stage'
    };
  }

  /**
   * Get full recruitment pipeline summary for a headcount
   */
  function getHcPipeline(hcId) {
    var hc = Database.getRecord('p1_headcount', hcId);
    if (!hc) throw new Error('Headcount not found: ' + hcId);

    var candidates = Database.listRecords('p1_candidates', { hc_id: hcId }, {}).records;

    var summary = {
      total: 0, applied: 0, screened: 0, interview: 0,
      assessment: 0, offer: 0, hired: 0, rejected: 0
    };

    for (var i = 0; i < candidates.length; i++) {
      var stage = (candidates[i].stage || 'applied').toLowerCase();
      summary.total++;
      if (summary.hasOwnProperty(stage)) summary[stage]++;
    }

    return {
      headcount: hc,
      pipeline: summary,
      candidates: candidates
    };
  }

  // =========================================================================
  // P2: Interview & Assessment Scheduling
  // =========================================================================

  /**
   * Schedule an interview
   */
  function scheduleInterview(data) {
    Validations.interview(data);
    data.result = data.result || 'pending';
    data.scheduled_at = Utils.timestamp();
    return Database.createRecord('p2_interviews', data);
  }

  /**
   * Record interview results
   */
  function submitInterviewResult(interviewId, result, score, feedback, notes) {
    var validResults = ['pass', 'fail', 'pending', 'cond_pass'];
    if (validResults.indexOf(result) === -1) {
      throw new Error('Invalid result: ' + result);
    }

    var interview = Database.getRecord('p2_interviews', interviewId);
    if (!interview) throw new Error('Interview not found: ' + interviewId);

    var update = {
      result: result,
      conducted_at: Utils.timestamp()
    };
    if (score !== undefined) update.score = score;
    if (feedback) update.feedback = feedback;
    if (notes) update.notes = notes;

    Database.updateRecord('p2_interviews', interviewId, update);

    // If this is the final interview pass, advance candidate
    if (result === 'pass' && interview.type === 'final') {
      try {
        advanceCandidate(interview.candidate_id, 'assessment', 'Passed final interview');
      } catch (e) {
        // Silently continue; candidate may already be past this stage
      }
    }

    return { success: true, interview_id: interviewId, message: 'Interview result recorded' };
  }

  /**
   * Submit assessment scores
   */
  function submitAssessment(data) {
    Validations.assessment(data);

    // Calculate total if CC scores provided
    var ccResult = Utils.calculateCCTotal(data);
    if (ccResult.count > 0) {
      data.total_score = ccResult.total;
    }

    data.status = data.status || 'completed';
    data.assessment_date = data.assessment_date || Utils.formatDate(new Date());

    // Determine pass/fail if threshold provided
    if (data.total_score && data.pass_threshold) {
      data.result = parseFloat(data.total_score) >= parseFloat(data.pass_threshold) ? 'pass' : 'fail';
    }

    var result = Database.createRecord('p2_assessments', data);

    // Advance candidate based on result
    if (data.candidate_id && data.result === 'pass') {
      try {
        advanceCandidate(data.candidate_id, 'offer', 'Passed assessment');
      } catch (e) {}
    }

    return result;
  }

  // =========================================================================
  // P3: Matching — Match candidates to internal members
  // =========================================================================

  /**
   * Create a match between member and candidate
   */
  function createMatch(data) {
    Validations.matching(data);
    data.match_date = data.match_date || Utils.formatDate(new Date());
    data.status = data.status || 'proposed';
    return Database.createRecord('p3_matching', data);
  }

  /**
   * Auto-generate matches based on position and BU
   */
  function autoMatch(candidateId) {
    var candidate = Database.getRecord('p1_candidates', candidateId);
    if (!candidate) throw new Error('Candidate not found: ' + candidateId);

    // Find internal members with same position + BU
    var members = Database.listRecords('members', {
      position: candidate.position_applied,
      bu: candidate.bu,
      status: 'active'
    }, {}).records;

    var matches = [];
    for (var i = 0; i < members.length; i++) {
      var m = members[i];
      var matchData = {
        member_id: m.member_id,
        candidate_id: candidateId,
        position: candidate.position_applied,
        bu: candidate.bu,
        department: m.department,
        level: m.level,
        match_score: 0,
        cc_fit: m.cc_scores || '',
        status: 'auto_generated',
        auto_import: 'TRUE'
      };

      // Simple scoring: same level = 50 points
      if (m.level === candidate.position_applied) {
        matchData.match_score += 50;
      }
      // BU match = 30 points
      if (m.bu === candidate.bu) {
        matchData.match_score += 30;
      }
      // Department match = 20 points
      matchData.match_score += 20;

      var result = Database.createRecord('p3_matching', matchData);
      matches.push({ match_id: result.id, member_id: m.member_id, score: matchData.match_score });
    }

    return {
      success: true,
      candidate_id: candidateId,
      matches_found: matches.length,
      matches: matches
    };
  }

  /**
   * Confirm/reject a match
   */
  function decideMatch(matchId, decision, notes) {
    if (['confirmed', 'rejected', 'pending'].indexOf(decision) === -1) {
      throw new Error('Invalid decision: ' + decision);
    }

    var update = { status: decision };
    if (notes) update.notes = notes;

    var match = Database.getRecord('p3_matching', matchId);
    if (!match) throw new Error('Match not found: ' + matchId);

    Database.updateRecord('p3_matching', matchId, update);

    // If confirmed and auto_import, create member record from candidate
    if (decision === 'confirmed' && match.auto_import === 'TRUE') {
      importCandidateAsMember(match.candidate_id, match);
    }

    return { success: true, match_id: matchId, status: decision };
  }

  /**
   * Import candidate data into member table (on confirmed match)
   */
  function importCandidateAsMember(candidateId, match) {
    var candidate = Database.getRecord('p1_candidates', candidateId);
    if (!candidate) return null;

    var memberData = {
      emp_code: candidate.emp_code || 'IMP-' + Date.now(),
      full_name: candidate.first_name + ' ' + candidate.last_name,
      nickname: candidate.nickname || '',
      email: candidate.email,
      phone: candidate.phone,
      bu: match ? match.bu : candidate.bu,
      department: match ? match.department : '',
      position: match ? match.position : candidate.position_applied,
      level: match ? match.level : '',
      hire_date: candidate.hire_date || Utils.formatDate(new Date()),
      status: 'active'
    };

    return Database.createRecord('members', memberData);
  }

  // =========================================================================
  // P4: Evaluations — Performance Evaluation Workflow
  // =========================================================================

  /**
   * Start a performance evaluation cycle
   */
  function createEvaluation(data) {
    Validations.evaluation(data);
    data.status = 'in_progress';
    data.created_at = Utils.timestamp();
    return Database.createRecord('p4_evaluations', data);
  }

  /**
   * Submit evaluation scores
   */
  function submitEvalScores(evalId, scores) {
    var eval_ = Database.getRecord('p4_evaluations', evalId);
    if (!eval_) throw new Error('Evaluation not found: ' + evalId);

    // Validate CC scores
    for (var i = 1; i <= 5; i++) {
      var key = 'cc' + i + '_score';
      if (scores[key] !== undefined && scores[key] !== null && scores[key] !== '') {
        if (!Utils.isValidCCScore(scores[key])) {
          throw new Error(key + ' must be integer 1-5');
        }
      }
    }

    // Calculate total score
    var ccResult = Utils.calculateCCTotal(scores);
    scores.total_score = (ccResult.total || 0) + (parseFloat(scores.kpi_score) || 0);

    // Assign grade
    var total = parseFloat(scores.total_score);
    if (!isNaN(total)) {
      scores.grade = assignGrade(total);
    }

    scores.status = 'submitted';
    Database.updateRecord('p4_evaluations', evalId, scores);

    return {
      success: true,
      eval_id: evalId,
      total_score: scores.total_score,
      grade: scores.grade,
      message: 'Evaluation scores submitted'
    };
  }

  /**
   * Approve an evaluation (by manager/HR)
   */
  function approveEvaluation(evalId, comments) {
    var eval_ = Database.getRecord('p4_evaluations', evalId);
    if (!eval_) throw new Error('Evaluation not found: ' + evalId);

    var update = { status: 'approved' };
    if (comments) update.comments = (eval_.comments || '') + '\n[Approved] ' + comments;

    Database.updateRecord('p4_evaluations', evalId, update);
    return { success: true, eval_id: evalId, message: 'Evaluation approved' };
  }

  /**
   * Assign letter grade based on total score
   */
  function assignGrade(totalScore) {
    var s = parseFloat(totalScore);
    if (isNaN(s)) return '';
    if (s >= 90) return 'A';
    if (s >= 80) return 'B+';
    if (s >= 70) return 'B';
    if (s >= 60) return 'C+';
    if (s >= 50) return 'C';
    if (s >= 40) return 'D+';
    if (s >= 30) return 'D';
    return 'F';
  }

  // =========================================================================
  // P5: Development Plans
  // =========================================================================

  /**
   * Create a development plan
   */
  function createDevPlan(data) {
    Validations.development(data);
    data.status = data.status || 'planned';
    data.completion_pct = data.completion_pct || 0;
    return Database.createRecord('p5_development', data);
  }

  /**
   * Update development progress
   */
  function updateDevProgress(devId, completionPct, status, certObtained) {
    var dev = Database.getRecord('p5_development', devId);
    if (!dev) throw new Error('Development record not found: ' + devId);

    if (completionPct !== undefined) {
      var pct = parseFloat(completionPct);
      if (isNaN(pct) || pct < 0 || pct > 100) {
        throw new Error('completion_pct must be 0-100');
      }
      var update = { completion_pct: pct };
      if (pct === 100) {
        update.status = 'completed';
      } else if (pct > 0) {
        update.status = 'in_progress';
      }
      if (status) update.status = status;
      Database.updateRecord('p5_development', devId, update);
    }

    if (certObtained) {
      Database.updateRecord('p5_development', devId, { cert_obtained: certObtained });
    }

    return { success: true, dev_id: devId, message: 'Development progress updated' };
  }

  // =========================================================================
  // P6: Salary Calculations
  // =========================================================================

  /**
   * Create salary record with auto-calculation
   */
  function createSalary(data) {
    Validations.salary(data);

    // Auto-calculate net_salary if not provided
    var base = parseFloat(data.base_salary) || 0;
    var allowances = parseFloat(data.allowances) || 0;
    var deductions = parseFloat(data.deductions) || 0;
    var tax = parseFloat(data.tax_withheld) || 0;
    var socialSec = parseFloat(data.social_security) || 0;
    var provFund = parseFloat(data.provident_fund) || 0;

    var totalDeductions = deductions + tax + socialSec + provFund;
    data.deductions = totalDeductions;
    data.net_salary = base + allowances - totalDeductions;

    data.status = data.status || 'prepared';
    return Database.createRecord('p6_salary', data);
  }

  /**
   * Approve payroll for a period
   */
  function approvePayroll(salaryId) {
    var sal = Database.getRecord('p6_salary', salaryId);
    if (!sal) throw new Error('Salary record not found: ' + salaryId);

    if (sal.status === 'paid') {
      throw new Error('Salary already paid');
    }

    Database.updateRecord('p6_salary', salaryId, { status: 'paid' });
    return { success: true, salary_id: salaryId, message: 'Payroll approved' };
  }

  /**
   * Get salary summary for a member (all periods)
   */
  function getMemberSalaryHistory(memberId) {
    var records = Database.listRecords('p6_salary', { member_id: memberId }, {
      sort: 'pay_date', order: 'desc'
    }).records;

    return {
      member_id: memberId,
      total_records: records.length,
      records: records,
      current: records.length > 0 ? records[0] : null
    };
  }

  // =========================================================================
  // P7: Wellbeing Surveys
  // =========================================================================

  /**
   * Submit wellbeing survey
   */
  function submitWellbeingSurvey(data) {
    Validations.wellbeing(data);

    // Auto-calculate total_score
    var scores = [
      parseFloat(data.health_score) || 0,
      parseFloat(data.wealth_score) || 0,
      parseFloat(data.wellbeing_score) || 0,
      parseFloat(data.heart_score) || 0,
      parseFloat(data.happiness_score) || 0
    ];
    data.total_score = scores.reduce(function(a, b) { return a + b; }, 0);

    data.status = data.status || 'submitted';
    data.survey_date = data.survey_date || Utils.formatDate(new Date());

    return Database.createRecord('p7_wellbeing', data);
  }

  /**
   * Add follow-up action plan to wellbeing record
   */
  function addWellbeingFollowUp(wbId, actionPlan, followUp) {
    var wb = Database.getRecord('p7_wellbeing', wbId);
    if (!wb) throw new Error('Wellbeing record not found: ' + wbId);

    var existingPlans = wb.action_plans ? wb.action_plans + '\n' : '';
    var update = {
      action_plans: existingPlans + '[' + Utils.formatDate(new Date()) + '] ' + actionPlan,
      status: 'action_required'
    };
    if (followUp) update.follow_up = followUp;

    Database.updateRecord('p7_wellbeing', wbId, update);
    return { success: true, wb_id: wbId, message: 'Follow-up action added' };
  }

  /**
   * Get wellbeing trend for a member
   */
  function getWellbeingTrend(memberId) {
    var records = Database.listRecords('p7_wellbeing', { member_id: memberId }, {
      sort: 'survey_date', order: 'asc'
    }).records;

    var trend = records.map(function(r) {
      return {
        survey_date: r.survey_date,
        category: r.category,
        total_score: r.total_score,
        health: r.health_score,
        wealth: r.wealth_score,
        wellbeing: r.wellbeing_score,
        heart: r.heart_score,
        happiness: r.happiness_score
      };
    });

    return {
      member_id: memberId,
      surveys_count: records.length,
      trend: trend,
      latest: records.length > 0 ? records[records.length - 1] : null
    };
  }

  // =========================================================================
  // Cross-process: Full onboarding flow
  // =========================================================================

  /**
   * Onboard a hired candidate: create member + initial evaluations
   */
  function onboardHiredCandidate(candidateId, memberOverrides) {
    var candidate = Database.getRecord('p1_candidates', candidateId);
    if (!candidate) throw new Error('Candidate not found: ' + candidateId);

    if ((candidate.stage || '').toLowerCase() !== 'hired' &&
        (candidate.status || '').toLowerCase() !== 'hired') {
      throw new Error('Candidate must be in "hired" stage to onboard');
    }

    // Create member
    var memberData = {
      emp_code: memberOverrides && memberOverrides.emp_code || 'NEW-' + Date.now(),
      full_name: candidate.first_name + ' ' + candidate.last_name,
      nickname: memberOverrides && memberOverrides.nickname || '',
      email: candidate.email,
      phone: candidate.phone,
      bu: memberOverrides && memberOverrides.bu || candidate.bu || '',
      department: memberOverrides && memberOverrides.department || '',
      position: memberOverrides && memberOverrides.position || candidate.position_applied || '',
      level: memberOverrides && memberOverrides.level || '',
      hire_date: candidate.hire_date || Utils.formatDate(new Date()),
      status: 'probation'
    };

    // Merge any additional overrides
    if (memberOverrides) {
      for (var key in memberOverrides) {
        if (memberOverrides.hasOwnProperty(key) && memberData.hasOwnProperty(key)) {
          memberData[key] = memberOverrides[key];
        }
      }
    }

    var memberResult = Database.createRecord('members', memberData);

    return {
      success: true,
      candidate_id: candidateId,
      member_id: memberResult.id,
      message: 'Candidate onboarded as new member (probation status)',
      member: memberData
    };
  }

  // ===================================================================
  // PUBLIC INTERFACE
  // ===================================================================

  return {
    // P1: Recruitment
    submitHeadcount:    submitHeadcount,
    decideHeadcount:    decideHeadcount,
    addCandidate:       addCandidate,
    advanceCandidate:   advanceCandidate,
    getHcPipeline:      getHcPipeline,

    // P2: Interview & Assessment
    scheduleInterview:      scheduleInterview,
    submitInterviewResult:  submitInterviewResult,
    submitAssessment:       submitAssessment,

    // P3: Matching
    createMatch:        createMatch,
    autoMatch:          autoMatch,
    decideMatch:        decideMatch,
    importCandidateAsMember: importCandidateAsMember,

    // P4: Evaluations
    createEvaluation:   createEvaluation,
    submitEvalScores:   submitEvalScores,
    approveEvaluation:  approveEvaluation,
    assignGrade:        assignGrade,

    // P5: Development
    createDevPlan:      createDevPlan,
    updateDevProgress:  updateDevProgress,

    // P6: Salary
    createSalary:           createSalary,
    approvePayroll:         approvePayroll,
    getMemberSalaryHistory: getMemberSalaryHistory,

    // P7: Wellbeing
    submitWellbeingSurvey:     submitWellbeingSurvey,
    addWellbeingFollowUp:      addWellbeingFollowUp,
    getWellbeingTrend:         getWellbeingTrend,

    // Cross-process
    onboardHiredCandidate:  onboardHiredCandidate
  };

})(); // End Services IIFE
