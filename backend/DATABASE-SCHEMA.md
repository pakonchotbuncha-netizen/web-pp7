# 🗄️ Web PP7 Database Schema

## Google Sheets Tables

### 1. Config (System Configuration)
| Column | Type | Description |
|--------|------|-------------|
| key | string | Configuration key |
| value | string | Configuration value |
| type | string | Type (string/number/boolean/json) |
| updated_by | string | Last updated by |
| updated_at | datetime | Last updated timestamp |

---

### 2. Users (User Accounts)
| Column | Type | Description |
|--------|------|-------------|
| user_id | string | UUID |
| email | string | Google email |
| display_name | string | Display name |
| role | string | Role (admin/pao/bmc/pad/wcd/member) |
| department | string | Department code |
| position | string | Position |
| status | string | Status (active/inactive) |
| created_at | datetime | Created timestamp |
| last_login | datetime | Last login timestamp |

---

### 3. Sessions (Active Sessions)
| Column | Type | Description |
|--------|------|-------------|
| session_id | string | UUID |
| user_id | string | Reference to Users |
| token | string | Session token |
| created_at | datetime | Created timestamp |
| expires_at | datetime | Expiration timestamp |
| ip_address | string | IP address |
| user_agent | string | User agent |

---

### 4. AuditLog (Audit Trail)
| Column | Type | Description |
|--------|------|-------------|
| log_id | string | UUID |
| user_id | string | User who performed action |
| action | string | Action type (CREATE/UPDATE/DELETE/LOGIN/LOGOUT) |
| entity_type | string | Table name |
| entity_id | string | Record ID |
| old_value | json | Previous value |
| new_value | json | New value |
| timestamp | datetime | Action timestamp |
| ip_address | string | IP address |

---

### 5. Members (Master Member Database - Core Table)
| Column | Type | Description |
|--------|------|-------------|
| member_id | string | UUID (EMP-XXXX) |
| employee_code | string | Employee code |
| title | string | Title (นาย/นาง/นางสาว) |
| first_name | string | First name |
| last_name | string | Last name |
| email | string | Email address |
| phone | string | Phone number |
| id_card | string | ID card number |
| birth_date | date | Birth date |
| gender | string | Gender (M/F) |
| nationality | string | Nationality |
| address | string | Address |
| department | string | Department code |
| position | string | Position |
| level | string | Level |
| start_date | date | Start date |
| status | string | Status (probation/regular/contract/resigned) |
| probation_end | date | Probation end date |
| supervisor_id | string | Supervisor member ID |
| team_id | string | Team code |
| bu | string | Business Unit |
| country | string | Country (TH/LA/KH) |
| photo_url | string | Photo URL |
| documents | json | Document references |
| core_competency | json | Core Competency scores |
| skills | json | Skills list |
| bank_account | string | Bank account |
| bank_name | string | Bank name |
| salary | number | Current salary |
| allowance | number | Allowance |
| created_at | datetime | Created timestamp |
| updated_at | datetime | Updated timestamp |
| created_by | string | Created by user_id |
| updated_by | string | Updated by user_id |

---

### 6. P1_Headcount (Headcount Requests)
| Column | Type | Description |
|--------|------|-------------|
| request_id | string | UUID (HC-XXXX) |
| bu | string | Business Unit |
| department | string | Department code |
| position | string | Position requested |
| level | string | Level |
| quantity | number | Number requested |
| reason | string | Reason |
| urgency | string | Urgency (low/medium/high/critical) |
| status | string | Status (pending/approved/rejected) |
| requested_by | string | Requester user_id |
| approved_by | string | Approver user_id |
| approved_at | datetime | Approval timestamp |
| replacement_for | string | Member ID if replacement |
| salary_range | string | Salary range |
| notes | string | Additional notes |
| created_at | datetime | Created timestamp |
| updated_at | datetime | Updated timestamp |

---

### 7. P1_Recruitment (Recruitment Cases)
| Column | Type | Description |
|--------|------|-------------|
| case_id | string | UUID (REC-XXXX) |
| headcount_id | string | Reference to P1_Headcount |
| position | string | Position |
| department | string | Department |
| source | string | Recruitment source (jobthai/facebook/website/referral/internal) |
| channel | string | Specific channel |
| applicant_name | string | Applicant name |
| applicant_email | string | Email |
| applicant_phone | string | Phone |
| application_date | date | Application date |
| status | string | Status (new/screening/interview/offer/onboarded/rejected) |
| screening_score | number | AI screening score |
| interview_date | datetime | Interview scheduled |
| interviewers | json | Array of interviewer IDs |
| interview_score | number | Interview score |
| assessment_score | number | Assessment score (P2) |
| match_score | number | Job match score (P3) |
| cc_scores | json | Core Competency scores |
| skills_match | json | Skills match result |
| documents | json | Application documents |
| notes | string | Notes |
| assigned_to | string | Assigned staff user_id |
| created_at | datetime | Created timestamp |
| updated_at | datetime | Updated timestamp |

---

### 8. P2_Assessment (Assessment Results)
| Column | Type | Description |
|--------|------|-------------|
| assessment_id | string | UUID (ASM-XXXX) |
| member_id | string | Reference to Members |
| case_id | string | Reference to P1_Recruitment |
| assessment_type | string | Type (pre_employment/annual/360) |
| cc1_servant_leadership | number | CC1 score (0-5) |
| cc2_adaptive_innovation | number | CC2 score (0-5) |
| cc3_trust_based | number | CC3 score (0-5) |
| cc4_consensus | number | CC4 score (0-5) |
| cc5_disciplined | number | CC5 score (0-5) |
| skills_assessment | json | Skills assessment details |
| attitude_assessment | json | Attitude assessment details |
| overall_score | number | Overall score |
| recommendation | string | Recommendation (pass/fail/conditional) |
| evaluator_id | string | Evaluator user_id |
| evaluation_method | string | Method (interview/test/observation) |
| notes | string | Notes |
| created_at | datetime | Created timestamp |
| updated_at | datetime | Updated timestamp |

---

### 9. P3_Matching (Position Matching)
| Column | Type | Description |
|--------|------|-------------|
| match_id | string | UUID (MAT-XXXX) |
| member_id | string | Reference to Members |
| case_id | string | Reference to P1_Recruitment |
| position_id | string | Target position |
| department | string | Target department |
| jd_requirements | json | Job description requirements |
| match_score | number | Match score (0-100) |
| gap_analysis | json | Gap analysis results |
| recommendation | string | Recommendation (match/near_match/no_match) |
| supervisor_notes | string | Supervisor notes |
| decision | string | Decision (approved/rejected/alternative) |
| alternative_position | string | Alternative position if not matched |
| mentor_id | string | Assigned mentor member_id |
| probation_plan | json | Probation evaluation plan |
| approved_by | string | Approver user_id |
| approved_at | datetime | Approval timestamp |
| created_at | datetime | Created timestamp |
| updated_at | datetime | Updated timestamp |

---

### 10. P4_Performance (Performance Evaluation)
| Column | Type | Description |
|--------|------|-------------|
| eval_id | string | UUID (PER-XXXX) |
| member_id | string | Reference to Members |
| eval_period | string | Evaluation period (2026-H1/2026-H2/2026-Annual) |
| eval_type | string | Type (probation/annual/360/credit) |
| cc1_score | number | CC1 score (0-5) |
| cc2_score | number | CC2 score (0-5) |
| cc3_score | number | CC3 score (0-5) |
| cc4_score | number | CC4 score (0-5) |
| cc5_score | number | CC5 score (0-5) |
| kpi_scores | json | KPI scores |
| overall_score | number | Overall score |
| grade | string | Grade (A/B/C/D/E) |
| self_eval | json | Self evaluation |
| manager_eval | json | Manager evaluation |
| peer_eval | json | Peer evaluation |
| subordinate_eval | json | Subordinate evaluation |
| customer_eval | json | Customer evaluation |
| strengths | text | Strengths |
| improvements | text | Areas for improvement |
| development_plan | text | Development plan |
| evaluator_ids | json | Evaluator user IDs |
| reviewed_by | string | Reviewer user_id |
| reviewed_at | datetime | Review timestamp |
| status | string | Status (draft/submitted/reviewed/approved) |
| created_at | datetime | Created timestamp |
| updated_at | datetime | Updated timestamp |

---

### 11. P5_Development (Development Plans)
| Column | Type | Description |
|--------|------|-------------|
| dev_id | string | UUID (DEV-XXXX) |
| member_id | string | Reference to Members |
| performance_id | string | Reference to P4_Performance |
| dev_type | string | Type (training/mentoring/coaching/self_study) |
| program_name | string | Program/course name |
| mentor_id | string | Mentor member_id (for mentoring) |
| start_date | date | Start date |
| end_date | date | End date |
| hours | number | Training hours |
| cost | number | Training cost |
| status | string | Status (planned/in_progress/completed/cancelled) |
| score_before | number | Score before training |
| score_after | number | Score after training |
| improvement | number | Improvement score |
| certificate | string | Certificate reference |
| notes | string | Notes |
| created_at | datetime | Created timestamp |
| updated_at | datetime | Updated timestamp |

---

### 12. P6_Compensation (Compensation Records)
| Column | Type | Description |
|--------|------|-------------|
| comp_id | string | UUID (CMP-XXXX) |
| member_id | string | Reference to Members |
| period | string | Period (2026-06/2026-07) |
| type | string | Type (salary/allowance/bonus/incentive/ot/welfare) |
| amount | number | Amount |
| currency | string | Currency (THB/LAK/KHR) |
| payment_method | string | Payment method (bank_transfer/cash) |
| bank_reference | string | Bank reference |
| status | string | Status (pending/approved/paid) |
| paid_at | datetime | Paid timestamp |
| approved_by | string | Approver user_id |
| notes | string | Notes |
| created_at | datetime | Created timestamp |
| updated_at | datetime | Updated timestamp |

---

### 13. P7_Welfare (Welfare Records)
| Column | Type | Description |
|--------|------|-------------|
| welfare_id | string | UUID (WEL-XXXX) |
| member_id | string | Reference to Members |
| category | string | Category (health/wealth/atmosphere/time/fun) |
| type | string | Welfare type |
| description | string | Description |
| request_date | date | Request date |
| amount | number | Amount (if applicable) |
| status | string | Status (pending/approved/rejected/completed) |
| approved_by | string | Approver user_id |
| notes | string | Notes |
| documents | json | Supporting documents |
| created_at | datetime | Created timestamp |
| updated_at | datetime | Updated timestamp |

---

## 🔗 Data Relationships

```
Users → AuditLog (1:N)
Users → Sessions (1:N)
Users → Members (1:N, created_by/updated_by)
Members → P1_Recruitment (1:N)
Members → P2_Assessment (1:N)
Members → P3_Matching (1:N)
Members → P4_Performance (1:N)
Members → P5_Development (1:N)
Members → P6_Compensation (1:N)
Members → P7_Welfare (1:N)
P1_Headcount → P1_Recruitment (1:N)
P1_Recruitment → P2_Assessment (1:1)
P1_Recruitment → P3_Matching (1:1)
P4_Performance → P5_Development (1:N)
```

---

## 📊 Data Flow

```
P1 (Headcount Request) 
    ↓
P1 (Recruitment) → P2 (Assessment)
    ↓
P3 (Matching) → Members (Onboard)
    ↓
P4 (Performance) → P5 (Development)
    ↓
P6 (Compensation) + P7 (Welfare)
```

---

**Last Updated:** 25 มิ.ย. 2569
