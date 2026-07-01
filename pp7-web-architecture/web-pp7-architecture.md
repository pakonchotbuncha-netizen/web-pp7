# 🏗️ Web PP7 — โครงสร้างระบบบริหารบุคลากร
## ออกแบบจากข้อมูลเชื่อมโยงกระบวนการ PM WI SD FM ทั้งหมด

> 📅 ข้อมูลจาก Workshop ทบทวน PM WI (16/05/2569)
> 📊 เอกสารอ้างอิง: 55 รายการ (PAO 31 + PAD 17 + WCD 7)
> 🔗 การเชื่อมโยง: 60 รายการ + 5 Critical Junctions

---

## 📋 สารบัญโครงสร้าง Web PP7

```
┌─────────────────────────────────────────────────────────────┐
│                     WEB PP7 PLATFORM                        │
│                                                             │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌────────────┐  │
│  │ Module 1 │  │ Module 2 │  │ Module 3 │  │ Module 4   │  │
│  │ สรรหา    │  │ ประเมิน  │  │ พัฒนา   │  │ ค่าตอบแทน │  │
│  │ (Recruit)│  │ (Assess) │  │ (Develop)│  │ (Compensate)│ │
│  └──────────┘  └──────────┘  └──────────┘  └────────────┘  │
│                                                             │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌────────────┐  │
│  │ Module 5 │  │ Module 6 │  │ Module 7 │  │ Module 8   │  │
│  │ คุณภาพชีวิต│ │ โครงสร้าง│  │ วินัย    │  │ รายงาน     │  │
│  │ (QoL)    │  │ (Structure│ │ (Discip.)│  │ (Reports)  │  │
│  │          │  │  & Rights)│ │          │  │            │  │
│  └──────────┘  └──────────┘  └──────────┘  └────────────┘  │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐   │
│  │            CENTRAL DATABASE (ข้อมูลสมาชิก = แกน)      │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐   │
│  │         AUTOMATION ENGINE + NOTIFICATION              │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

---

## 🏗️ ส่วนที่ 1: Database Schema

### 1.1 ตารางหลัก (Core Tables)

#### `members` — ข้อมูลสมาชิก (แกนกลาง)
```sql
-- แหล่งข้อมูล: WI-011 นำสมาชิกเข้าระบบ
-- ใช้โดย: ทุกกระบวนการ

members
├── member_id (PK)
├── citizen_id
├── prefix, first_name, last_name
├── birth_date
├── age (computed)
├── gender
├── nationality
├── work_permit_no (for foreign workers)
├── position_id (FK → positions)
├── bu_id (FK → business_units)
├── department_id (FK → departments)
├── employment_type (ประจำ/ทดลองงาน/โอนย้าย/รายวัน/ฝึกงาน/ต่างด้าว)
├── hire_date
├── start_date
├── probation_end_date
├── status (active/probation/transferred/retired/resigned/suspended)
├── seniority_years (computed)
├── salary_base
├── bank_account_no
├── bank_name
├── contact_phone
├── contact_email
├── line_id
├── telegram_id
├── profile_photo
├── created_at
├── updated_at
└── deleted_at (soft delete)
```

#### `positions` — ตำแหน่งงาน
```sql
-- แหล่งข้อมูล: WI-001 ขออัตรากำลัง, WI-009 โครงสร้างองค์กร
-- ใช้โดย: WI-001, WI-004, WI-009, PM-001

positions
├── position_id (PK)
├── position_code
├── position_name
├── department_id (FK → departments)
├── bu_id (FK → business_units)
├── level
├── grade
├── salary_min
├── salary_max
├── required_cc (JSON array — Core Competency ที่ต้องการ)
├── max_headcount
├── current_headcount (computed)
├── is_active
├── created_at
└── updated_at
```

#### `departments` — แผนก/หน่วยงาน
```sql
-- แหล่งข้อมูล: WI-009 โครงสร้างองค์กร
-- ใช้โดย: WI-009, WI-018, WI-019

departments
├── department_id (PK)
├── department_code
├── department_name
├── bu_id (FK → business_units)
├── parent_department_id (self-reference)
├── manager_id (FK → members)
├── lia_config (JSON — สิทธิเข้าถึง)
├── is_active
├── created_at
└── updated_at
```

#### `business_units` — หน่วยธุรกิจ
```sql
business_units
├── bu_id (PK)
├── bu_code
├── bu_name
├── company_code (AMH/LDC/etc.)
├── is_active
├── created_at
└── updated_at
```

---

### 1.2 ตารางสรรหา (Recruitment Tables)

#### `manpower_requests` — ใบขออัตรากำลัง
```sql
-- แหล่งข้อมูล: WI-001 ขออัตรากำลังคน
-- ทริกเกอร์: BU คีย์ขอ → PAO ตรวจสอบ
-- ส่งต่อ: PM-001, WI-002

manpower_requests
├── request_id (PK)
├── request_no (auto-generated)
├── bu_id (FK → business_units)
├── department_id (FK → departments)
├── position_id (FK → positions)
├── request_type (ใหม่/ทดแทน/เพิ่ม)
├── reason
├── headcount_requested
├── job_description (JSON)
├── required_qualifications (JSON)
├── required_cc (JSON — Core Competency)
├── urgency (normal/urgent)
├── status (draft/submitted/approved/rejected/posted/closed)
├── submitted_by (FK → members)
├── approved_by (FK → members)
├── submitted_date
├── approved_date
├── posting_start_date
├── posting_end_date
├── created_at
└── updated_at
```

#### `applications` — ใบสมัครงาน
```sql
-- แหล่งข้อมูล: PM-001 แสวงหา, WI-002 คัดเลือกภายนอก
-- รับจาก: 10 ช่องทาง (Web, JobThai, Line, FB, etc.)
-- ส่งต่อ: WI-003 สรุปผล

applications
├── application_id (PK)
├── request_id (FK → manpower_requests)
├── applicant_name
├── applicant_email
├── applicant_phone
├── resume_url
├── source_channel (web/jobthai/line/fb/referral/walkin/etc.)
├── applied_position_id (FK → positions)
├── screening_status (new/screened/shortlisted/interviewed/accepted/rejected)
├── screening_score (AI-scored)
├── cc_match_score (AI-calculated)
├── interview_round_1_score
├── interview_round_1_date
├── interview_round_1_result
├── interview_round_2_score
├── interview_round_2_date
├── interview_round_2_result
├── final_decision (accept/reject/hold)
├── offer_letter_sent (boolean)
├── offer_accepted (boolean)
├── start_date_agreed
├── rejection_reason
├── created_at
└── updated_at
```

#### `foreign_workers` — แรงงานต่างด้าว
```sql
-- แหล่งข้อมูล: PM-002, WI-006, WI-007, WI-008
-- เชื่อมกับ: WI-011 นำเข้าระบบ

foreign_workers
├── foreign_worker_id (PK)
├── member_id (FK → members)
├── nationality
├── passport_no
├── work_permit_no
├── visa_type
├── visa_expiry_date
├── quota_id (FK → foreign_worker_quotas)
├── immigration_status (pending/approved/rejected)
├── registration_status (pending/registered/card_issued)
├── registration_date
├── card_issue_date
├── documents (JSON — scanned docs)
├── created_at
└── updated_at
```

#### `foreign_worker_quotas` — โควต้าต่างด้าว
```sql
foreign_worker_quotas
├── quota_id (PK)
├── quota_no
├── bu_id
├── department_id
├── nationality
├── headcount_approved
├── headcount_used
├── approval_date
├── expiry_date
├── status (pending/approved/expired)
├── created_at
└── updated_at
```

---

### 1.3 ตารางประเมินผล (Evaluation Tables)

#### `evaluations` — ผลประเมิน
```sql
-- แหล่งข้อมูล: WI-012 ประเมินเครดิต, WI-016 ประเมินทดลองงาน, WI-032 ประเมินรายปี
-- รับจาก: PM-003, WI-004, WI-016
-- ส่งต่อ: PAD-PM004, PAD-PM005, WI-014

evaluations
├── evaluation_id (PK)
├── member_id (FK → members)
├── evaluation_type (probation/transfer/promotion/annual_credit/annual_360)
├── evaluation_period (YYYY-MM)
├── evaluator_id (FK → members)
├── evaluator_role (self/manager/peer/subordinate/customer)
├── cc_scores (JSON — คะแนน CC1-CC5)
├── behavior_score
├── skill_score
├── corporate_capital_score
├── overall_score
├── grade (A/B/C/D/F)
├── comments
├── development_needs (JSON)
├── status (pending/in_progress/completed)
├── submitted_date
├── completed_date
├── created_at
└── updated_at
```

#### `evaluation_templates` — แบบประเมิน
```sql
-- แหล่งข้อมูล: WI-014 เก็บแบบประเมิน
-- ใช้โดย: PM-003, WI-012, WI-016, WI-032

evaluation_templates
├── template_id (PK)
├── template_name
├── evaluation_type (probation/annual_credit/annual_360/transfer)
├── target_role (member/manager/peer/etc.)
├── cc_weights (JSON — น้ำหนัก CC แต่ละด้าน)
├── questions (JSON array)
├── scoring_method (1-5/1-10/percentage)
├── is_active
├── created_at
└── updated_at
```

#### `evaluation_results_summary` — สรุปผลประเมิน
```sql
-- ใช้โดย: WI-015 แบบบรรจุ, WI-004 โอนย้าย
-- รับจาก: evaluations (aggregate)

evaluation_results_summary
├── summary_id (PK)
├── member_id
├── evaluation_type
├── evaluation_period
├── cc_overall_scores (JSON)
├── overall_grade
├── is_passed (boolean)
├── recommendation (confirm/extend_probation/terminate/promote/transfer)
├── approved_by
├── approved_date
├── created_at
└── updated_at
```

---

### 1.4 ตารางพัฒนา (Development Tables)

#### `development_plans` — แผนพัฒนารายบุคคล
```sql
-- แหล่งข้อมูล: PAD-PM004 ระบบ 3 ผ่าน, PAD-PM005 วัดทุนองค์กร
-- รับจาก: WI-012, evaluations
-- ส่งต่อ: PAD-WI001, PAD-WI002, PAD-WI003

development_plans
├── plan_id (PK)
├── member_id (FK → members)
├── plan_period (YYYY)
├── current_cc_scores (JSON)
├── target_cc_scores (JSON)
├── development_areas (JSON)
├── training_programs (JSON array — หลักสูตรที่ต้องเรียน)
├── mentoring_assigned (FK → members — พี่เลี้ยง)
├── status (draft/active/completed)
├── created_by
├── approved_by
├── start_date
├── end_date
├── created_at
└── updated_at
```

#### `training_records` — ประวัติการฝึกอบรม
```sql
-- แหล่งข้อมูล: PAD-WI001 เปิดอบรม, PAD-WI002 Training
-- รับจาก: PAD-PM004, PAD-PM005
-- ส่งต่อ: PAD-WI003 กำกับพัฒนา

training_records
├── record_id (PK)
├── member_id (FK → members)
├── course_id (FK → courses)
├── course_name
├── training_type (internal/external/online/on-job)
├── start_date
├── end_date
├── hours
├── score
├── grade
├── certificate_url
├── cost
├── status (registered/attending/completed/dropped)
├── feedback (JSON)
├── created_at
└── updated_at
```

#### `courses` — หลักสูตรฝึกอบรม
```sql
-- แหล่งข้อมูล: PAD-PM002 ศูนย์พัฒนาฝีมือ, PAD-SD003 มาตรฐานฝึกอบรม

courses
├── course_id (PK)
├── course_code
├── course_name
├── course_category (leadership/innovation/trust/teamwork/professional)
├── cc_mapping (JSON — CC ที่หลักสูตรนี้พัฒนา)
├── duration_hours
├── max_participants
├── target_roles (JSON)
├── is_mandatory (boolean)
├── status (draft/active/archived)
├── created_at
└── updated_at
```

#### `msp_transactions` — ธุรกรรม MSP
```sql
-- แหล่งข้อมูล: PAD-WI004 สร้าง/จ่าย MSP, PAD-WI005 ซื้อ MSP, PAD-WI006 เก็บค่าดำเนินการ
-- รับจาก: PAD-WI003
-- ส่งต่อ: ext_Money, PAD-WI007

msp_transactions
├── transaction_id (PK)
├── member_id (FK → members)
├── transaction_type (create/purchase/usage/cashout/reversal)
├── msp_amount
├── poi_category (JSON — POI 4 หมวด)
├── development_plan_id (FK → development_plans)
├── status (pending/approved/completed/reversed)
├── approved_by
├── approved_date
├── transaction_date
├── notes
├── created_at
└── updated_at
```

#### `bupoint_transactions` — ธุรกรรม BUPOINT
```sql
-- แหล่งข้อมูล: PAD-WI007 ดึง BUPOINT กลับ

bupoint_transactions
├── transaction_id (PK)
├── member_id
├── transaction_type (award/deduct/reversal)
├── amount
├── reason
├── reference_msp_id (FK → msp_transactions)
├── status
├── created_at
└── updated_at
```

---

### 1.5 ตารางค่าตอบแทน (Compensation Tables)

#### `payroll` — เงินเดือน
```sql
-- แหล่งข้อมูล: WCD-WI004 จ่ายเงินเดือน
-- รับจาก: WI-017, WI-013, ext_CU
-- ส่งต่อ: WCD-WI010, WCD-WI005, ext_Money

payroll
├── payroll_id (PK)
├── member_id (FK → members)
├── payroll_period (YYYY-MM)
├── base_salary
├── allowances (JSON)
├── overtime_hours
├── overtime_pay
├── bonus_amount
├── deductions (JSON — หักเงินกู้/สหกรณ์/ค้ำประกัน/งานศพ)
├── tax_amount
├── social_security
├── provident_fund
├── net_salary
├── payment_status (pending/processing/paid/failed)
├── payment_date
├── payment_ref (bank ref)
├── e_slip_sent (boolean)
├── e_slip_sent_date
├── created_at
└── updated_at
```

#### `time_records` — ลงเวลา
```sql
-- แหล่งข้อมูล: WI-013 ลงเวลา
-- ใช้โดย: WCD-WI004, WCD-WI001, WCD-WI003

time_records
├── record_id (PK)
├── member_id (FK → members)
├── record_date
├── check_in
├── check_out
├── total_hours
├── overtime_hours
├── leave_type (none/sick/vacation/personal/maternity/funeral/etc.)
├── leave_hours
├── status (normal/late/absent/half-day)
├── approved_by
├── notes
├── created_at
└── updated_at
```

#### `allowance_records` — เบี้ยเลี้ยง
```sql
-- แหล่งข้อมูล: WCD-WI001 เบี้ยเลี้ยงฝึกงาน
-- รับจาก: WI-013

allowance_records
├── allowance_id (PK)
├── member_id (FK → members)
├── period (YYYY-MM)
├── total_days
├── total_hours
├── daily_rate
├── total_allowance
├── payment_status
├── payment_date
├── created_at
└── updated_at
```

#### `benefits_claims` — เบิกสวัสดิการ
```sql
-- แหล่งข้อมูล: WCD-WI003 เบิกสวัสดิการ
-- รับจาก: WI-013, WI-011 (ตรวจสอบสิทธิ์)
-- ส่งต่อ: ext_BCT, ext_Money

benefits_claims
├── claim_id (PK)
├── member_id (FK → members)
├── benefit_type (basic/health/emergency/etc.)
├── claim_amount
├── claim_date
├── supporting_docs (JSON array)
├── verification_status (pending/verified/rejected)
├── verified_by
├── verified_date
├── vc_no (VC number from BCT)
├── payment_status (pending/processing/paid/rejected)
├── payment_date
├── rejection_reason
├── created_at
└── updated_at
```

#### `bonuses` — โบนัส
```sql
-- แหล่งข้อมูล: WCD-WI005 โบนัสประจำปี
-- รับจาก: ext_HOCC, ext_CU, WCD-WI004

bonuses
├── bonus_id (PK)
├── member_id (FK → members)
├── bonus_year
├── bonus_type (annual/special)
├── base_amount
├── pfs_data (JSON — จาก HOCC)
├── tax_adjustments (JSON)
├── cu_deductions
├── net_bonus
├── bv_no
├── vc_no
├── payment_status
├── payment_date
├── created_at
└── updated_at
```

#### `contributions` — เงินสมทบ
```sql
-- แหล่งข้อมูล: WCD-WI010 นำส่งเงินสมทบ
-- รับจาก: WCD-WI004, WI-013
-- ส่งต่อ: ext_Gov

contributions
├── contribution_id (PK)
├── member_id (FK → members)
├── period (YYYY-MM)
├── salary_base
├── member_contribution (5%)
├── employer_contribution (5%)
├── total_contribution
├── contribution_type (social_security/provident_fund)
├── submission_status (pending/submitted/paid)
├── submission_date
├── payment_date
├── receipt_url
├── created_at
└── updated_at
```

---

### 1.6 ตารางเกษียณ/ลาออก (Retirement/Resignation Tables)

#### `resignations` — ลาออก
```sql
-- แหล่งข้อมูล: FM-001 ใบลาออก
-- ส่งต่อ: WCD-WI002, PAO-WI020

resignations
├── resignation_id (PK)
├── member_id (FK → members)
├── resignation_date
├── last_working_date
├── reason
├── notice_period_days
├── notice_given_date
├── manager_approval (boolean)
├── manager_approval_date
├── replacement_needed (boolean)
├── benefits_owed (JSON — เงินสมทบ/หุ้น/เงินกู้)
├── debts_cleared (boolean)
├── assets_returned (boolean)
├── access_revoked (boolean)
├── status (submitted/under_review/approved/completed)
├── created_at
└── updated_at
```

#### `retirement_records` — เกษียณ
```sql
-- แหล่งข้อมูล: WCD-WI006 ระบบเกษียณ
-- รับจาก: ext_BMC, ext_CU
-- ส่งต่อ: WCD-WI002, ext_Money

retirement_records
├── retirement_id (PK)
├── member_id (FK → members)
├── retirement_date
├── age_at_retirement
├── decision (retire/continue)
├── decision_date
├── severance_amount
├── contribution_savings
├── cu_shares_value
├── gtc_value
├── loan_balance
├── total_payout
├── payment_status
├── payment_date
├── payment_ref
├── bmc_notified (boolean)
├── bmc_notified_date
├── created_at
└── updated_at
```

---

### 1.7 ตารางโครงสร้าง/สิทธิ/วินัย (Structure/Rights/Discipline Tables)

#### `org_structure` — โครงสร้างองค์กร
```sql
-- แหล่งข้อมูล: WI-009 โครงสร้างองค์กร
-- ส่งต่อ: WI-018, WI-019

org_structure
├── structure_id (PK)
├── structure_version
├── bu_id
├── department_id
├── position_id
├── reporting_to (FK → positions)
├── effective_date
├── expiry_date
├── requested_by
├── approved_by
├── status (draft/active/superseded)
├── created_at
└── updated_at
```

#### `access_rights` — สิทธิผู้ใช้งาน
```sql
-- แหล่งข้อมูล: WI-018 กำกับ LIA, WI-019 ทบทวนสิทธิ, WI-020 ยกเลิกสิทธิ
-- รับจาก: WI-009, WI-018
-- ส่งต่อ: ext_IT

access_rights
├── right_id (PK)
├── member_id (FK → members)
├── system_module (recruitment/evaluation/development/payroll/benefits/etc.)
├── access_level (none/view/edit/approve/admin)
├── lia_config (JSON)
├── effective_date
├── expiry_date
├── granted_by
├── revoked_date
├── revoke_reason
├── status (active/expired/revoked)
├── created_at
└── updated_at
```

#### `discipline_records` — วินัย
```sql
-- แหล่งข้อมูล: WI-021 ขออุปกรณ์, WI-022 ใบอนุญาต, WI-023 หนังสือตักเตือน
-- ส่งต่อ: WI-012 (บันทึกประวัติ)

discipline_records
├── record_id (PK)
├── member_id (FK → members)
├── record_type (equipment_warning/permit/warning_letter/violation)
├── description
├── severity (low/medium/high)
├── issued_by
├── issued_date
├── response_required (boolean)
├── response_date
├── response_notes
├── attached_docs (JSON)
├── status (open/acknowledged/closed)
├── created_at
└── updated_at
```

---

### 1.8 ตารางสื่อสาร/แจ้งเตือน (Communication Tables)

#### `notifications` — แจ้งเตือน
```sql
-- ใช้โดย: SD-001, ทุก Automation Rule

notifications
├── notification_id (PK)
├── member_id (FK → members)
├── notification_type (email/line/telegram/in_app)
├── template_id (FK → notification_templates)
├── payload (JSON)
├── status (pending/sent/failed)
├── sent_at
├── read_at
├── created_at
└── updated_at
```

#### `notification_templates` — เทมเพลตแจ้งเตือน
```sql
notification_templates
├── template_id (PK)
├── template_code (sd001_onboarding/eval_reminder/payroll_ready/etc.)
├── template_name
├── channels (JSON — email/line/telegram)
├── subject (for email)
├── body_template
├── variables (JSON)
├── is_active
├── created_at
└── updated_at
```

---

## 🏗️ ส่วนที่ 2: Web Application Modules

### Module 1: 🎯 สรรหา (Recruitment)

```
/saraha (สรรหา)
├── /dashboard — ภาพรวมการสรรหา
│   ├── ตำแหน่งว่าง / อัตราที่ต้องการ
│   ├── ใบสมัครรอสกรีน
│   ├── ผู้ผ่านสัมภาษณ์รอรับเข้า
│   └── สถิติ: อัตราปิด, เวลาเฉลี่ย, ช่องทางที่ดีที่สุด
│
├── /manpower-requests — ขออัตรากำลัง [WI-001]
│   ├── BU คีย์ขอเพิ่มอัตรากำลัง
│   ├── PAO ตรวจสอบ → อนุมัติ/ปฏิเสธ
│   ├── AI ตรวจสอบข้อมูลอัตโนมัติ
│   └── สถานะ: draft → submitted → approved → posted → closed
│
├── /job-postings — ประกาศรับสมัคร [PM-001]
│   ├── สร้างประกาศจากใบขออัตรากำลัง
│   ├── โพสต์อัตโนมัติ 10 ช่องทาง (Web, JobThai, Line, FB, etc.)
│   ├── AI ช่วยเขียนประกาศ
│   └── ติดตามผล: จำนวนผู้สมัคร/ช่องทาง
│
├── /applications — จัดการใบสมัคร [WI-002, PM-001]
│   ├── รวมใบสมัครจากทุกช่องทาง
│   ├── AI คัดกรอง/สกรีนอัตโนมัติ
│   ├── AI ประเมิน CC match
│   ├── จัดเรียงตามคะแนน
│   ├── นัดสัมภาษณ์ (Line/Telegram)
│   └── บันทึกผลสัมภาษณ์
│
├── /selection-results — สรุปผลคัดเลือก [WI-003]
│   ├── สรุปผลการสัมภาษณ์
│   ├── รายชื่อผู้ผ่านคัดเลือก
│   ├── สร้าง offer letter
│   └── ส่ง SD-001 แจ้งก่อนเริ่มงาน
│
├── /foreign-workers — ต่างด้าว [PM-002, WI-006, WI-007, WI-008]
│   ├── ขอโควต้า
│   ├── จัดคิวรับคนงาน (OCR เอกสาร)
│   ├── ยื่นเอกสารออนไลน์ (ตม./ใบอนุญาต)
│   └── ติดตามสถานะ
│
├── /transfer-promotion — โอนย้าย/เลื่อนตำแหน่ง [WI-004]
│   ├── คีย์ขอโอนย้าย/เลื่อนตำแหน่ง
│   ├── เชื่อม PM-003 ประเมินผล
│   └── ติดตามสถานะ
│
└── /onboarding — นำสมาชิกเข้าระบบ [WI-011]
    ├── ข้อมูลผู้สมัครผ่านคัดเลือก → สร้างสมาชิก
    ├── SD-001 แจ้งก่อนเริ่มงาน
    ├── จัดเตรียม IT/สถานที่/พี่เลี้ยง
    ├── แจ้ง WI-013 ลงเวลา, WI-012 ประเมิน, PAD-PM001 พี่เลี้ยง
    └── Checklist วันเริ่มงาน
```

---

### Module 2: 📊 ประเมินผล (Evaluation)

```
/prameen (ประเมิน)
├── /dashboard — ภาพรวมการประเมิน
│   ├── รอบประเมินปัจจุบัน
│   ├── จำนวนผู้ต้องประเมิน/ประเมินแล้ว
│   ├── คะแนนเฉลี่ยราย CC
│   └── แจ้งเตือนรอบประเมินใกล้ครบกำหนด
│
├── /evaluation-templates — จัดการแบบประเมิน [WI-014]
│   ├── สร้าง/แก้ไขแบบประเมิน
│   ├── กำหนด CC weights
│   ├── กำหนดตามบทบาท (member/manager/peer)
│   └── template: probation, annual, 360°, transfer
│
├── /probation-eval — ประเมินทดลองงาน [PM-003, WI-016]
│   ├── รายชื่อสมาชิกทดลองงาน
│   ├── สร้างฟอร์มประเมินอัตโนมัติ
│   ├── แจ้งผู้ประเมิน (manager/mentor)
│   ├── บันทึกผลประเมิน (behavior/skill/capital)
│   ├── สรุปผล → WI-015 แบบบรรจุ
│   └── ผล: confirm / extend / terminate
│
├── /credit-eval — ประเมินเครดิต [WI-012]
│   ├── ประเมินสมาชิกประจำปี
│   ├── 360°: self/manager/peer/subordinate/customer
│   ├── CC1-CC5 scores
│   ├── บันทึกประวัติ: WI-021/WI-022/WI-023
│   └── ส่ง PAD-PM004, PAD-PM005
│
├── /annual-eval — ประเมินผลรายปี [WI-032]
│   ├── แบบประเมินผลรายปี
│   ├── รวบรวมผล 360°
│   ├── สรุปภาพรวมรายบุคคล
│   └── ส่ง WI-012
│
├── /transfer-eval — ประเมินโอนย้าย/เลื่อนตำแหน่ง [WI-016]
│   ├── ประเมินผลหลังโอนย้าย
│   ├── เปรียบเทียบก่อน/หลัง
│   └── ส่ง WI-015
│
├── /evaluation-results — ผลประเมิน [WI-015]
│   ├── ดูผลประเมินทั้งหมด
│   ├── กรองตามช่วงเวลา/ประเภท
│   ├── สรุปภาพรวมองค์กร
│   ├── แจ้งผล WI-015 → WI-017
│   └── Export รายงาน
│
└── /cc-dashboard — แดชบอร์ด CC
    ├── คะแนน CC รายบุคคล/ทีม/องค์กร
    ├── แนวโน้ม CC ตามเวลา
    ├── CC gap analysis
    └── แนะนำพัฒนา
```

---

### Module 3: 🎓 พัฒนา (Development)

```
/pattana (พัฒนา)
├── /dashboard — ภาพรวมการพัฒนา
│   ├── แผนพัฒนาที่ active
│   ├── หลักสูตรที่กำลังเรียน
│   ├── MSP balance
│   └── ความคืบหน้า CC
│
├── /development-plans — แผนพัฒนารายบุคคล [PAD-PM004, PAD-PM005]
│   ├── สร้างจากผลประเมิน (WI-012)
│   ├── กำหนด CC targets
│   ├── เลือกหลักสูตร
│   ├── จับคู่พี่เลี้ยง (PAD-PM001)
│   └── ติดตามความคืบหน้า
│
├── /courses — หลักสูตร [PAD-WI001, PAD-WI002]
│   ├── จัดการหลักสูตรทั้งหมด
│   ├── เปิดอบรมภายใน
│   ├── Training ภายนอก/online
│   ├── บันทึกผลอบรม → PAD-WI003
│   └── Certificate management
│
├── /mentoring — พี่เลี้ยง-น้องเลี้ยง [PAD-PM001]
│   ├── จับคู่พี่เลี้ยง-น้องเลี้ยง
│   ├── บันทึกการพบ
│   ├── ติดตามความคืบหน้า
│   └── ประเมินผลพี่เลี้ยง
│
├── /msp — จัดการ MSP [PAD-WI004, PAD-WI005, PAD-WI006]
│   ├── สร้าง MSP จากแผนพัฒนา
│   ├── ซื้อ MSP
│   ├── ใช้ MSP (POI 4 หมวด)
│   ├── Cashout
│   ├── เก็บค่าดำเนินการ
│   └── ประวัติธุรกรรม
│
├── /bupoint — BUPOINT [PAD-WI007]
│   ├── ดู BUPOINT balance
│   ├── ดึง BUPOINT กลับ (กรณีผิดพลาด)
│   └── ประวัติธุรกรรม
│
└── /training-catalog — Catalog หลักสูตร
    ├── หลักสูตรทั้งหมด
    ├── หมวดหมู่ (CC mapping)
    ├── หลักสูตรบังคับ/เลือก
    └── ลงทะเบียนเรียน
```

---

### Module 4: 💰 ค่าตอบแทน (Compensation)

```
khatoob (ค่าตอบแทน)
├── /dashboard — ภาพรวมค่าตอบแทน
│   ├── เงินเดือนเดือนปัจจุบัน
│   ├── โบนัสประจำปี
│   ├── เงินสมทบค้างส่ง
│   └── Budget overview
│
├── /salary-data — ข้อมูลเงินเดือน [WI-017]
│   ├── คีย์ข้อมูลสมาชิกบรรจุ
│   ├── กำหนดฐานเงินเดือน
│   ├── ปรับเงินเดือน (โอนย้าย/เลื่อนตำแหน่ง)
│   ├── INC (เงินรางวัล/ค่าเช่าบ้าน)
│   └── เปิดสิทธิ์ BU คีย์ INC
│
├── /payroll — จ่ายเงินเดือน [WCD-WI004]
│   ├── Timeline: วันที่ 1-5 ตรวจสอบบริษัท
│   ├── วันที่ 1-10 สมาชิกเข้าใหม่/โอนย้าย
│   ├── วันที่ 5-10 INC
│   ├── วันที่ 10 CU ส่งข้อมูล
│   ├── วันที่ 11 ปิดสิทธิ์ ดึง INC กระทบยอด
│   ├── คำนวณภาษี/เงินเดือนอัตโนมัติ
│   ├── e-slip (วันที่ 15-16)
│   ├── ออกใบ VC → BCT
│   ├── ตั้งโอน H2H Kbank (วันที่ 24)
│   └── โอน PFW บัญชี (วันที่ 25)
│
├── /allowance — เบี้ยเลี้ยง [WCD-WI001]
│   ├── ข้อมูลลงเวลาฝึกงาน/รายวัน
│   ├── คำนวณเบี้ยเลี้ยงอัตโนมัติ
│   ├── รายงานจ่ายสิ้นเดือน
│   └── ตรวจสอบ/อนุมัติ
│
├── /benefits — เบิกสวัสดิการ [WCD-WI003]
│   ├── กรอกฟอร์มเบิก (App MS24)
│   ├── แจ้งเตือน PAO/การเงิน
│   ├── ตรวจสอบหลักฐานอัตโนมัติ
│   ├── ตั้ง VC อัตโนมัติ
│   ├── แจ้งผล Line/TG
│   ├── MSP/Cashout (ยืดหยุ่น)
│   └── Dashboard ติดตาม
│
├── /bonus — โบนัสประจำปี [WCD-WI005]
│   ├── รับข้อมูล PFS จาก HOCC
│   ├── ทำข้อมูลจ่าย PFS
│   ├── บริหารภาษีสมาชิกรายคน
│   ├── ทำ BV จ่ายเงิน
│   ├── ตั้งโอน H2H
│   └── รายงานโบนัส
│
├── /contributions — เงินสมทบ [WCD-WI010]
│   ├── รวบรวมข้อมูลสมาชิก
│   ├── คำนวณ 5% สมาชิก + 5% นายจ้าง
│   ├── นำส่งภงด.1/ประกันสังคม/กยศ.
│   ├── แจ้งผลสมาชิก
│   └── เก็บใบเสร็จ E-filing
│
└── /e-slips — สลิปเงินเดือน
    ├── ดูสลิปย้อนหลัง
    ├── ดาวน์โหลด PDF
    └── แจ้งเตือนสมาชิก
```

---

### Module 5: 🏠 คุณภาพชีวิต (Quality of Life)

```
quality-of-life (คุณภาพชีวิต)
├── /dashboard — ภาพรวม QoL
│   ├── สุขภาพ (Health)
│   ├── ความมั่งคั่ง (Wealth)
│   ├── บรรยากาศ (Well-being)
│   ├── เวลา (Time)
│   └── อารมณ์ขัน (Fun)
│
├── /health — สุขภาพ
│   ├── ข้อมูลสุขภาพสมาชิก
│   ├── สิทธิรักษาพยาบาล
│   ├── ตรวจสุขภาพประจำปี
│   └── โปรแกรมสุขภาพ
│
├── /wealth — ความมั่งคั่ง
│   ├── เงินเดือน + สวัสดิการ
│   ├── ออมหุ้น (CU)
│   ├── เงินกู้
│   ├── MSP balance
│   └── Financial wellness tips
│
├── /wellbeing — บรรยากาศ
│   ├── ความปลอดภัยที่ทำงาน
│   ├── การยอมรับ/feedback
│   ├── Employee engagement survey
│   └── แนะนำปรับปรุง
│
├── /time — เวลา
│   ├── วันลาคงเหลือ
│   ├── เวลาทำงาน/OT
│   ├── Work-life balance score
│   └── จัดตารางยืดหยุ่น
│
└── /fun — อารมณ์ขัน
    ├── กิจกรรมสันทนาการ
    ├── Event Calendar
    ├── แนะนำกิจกรรม
    └── Feedback ความสุข
```

---

### Module 6: 🏢 โครงสร้างและสิทธิ (Structure & Rights)

```
structure-rights (โครงสร้างและสิทธิ)
├── /org-chart — โครงสร้างองค์กร [WI-009]
│   ├── Org chart แบบ interactive
│   ├── เพิ่ม/แก้ไขโครงสร้าง
│   ├── BMC ขอเพิ่ม → PAO ตรวจสอบ
│   ├── Versioning (ประวัติการเปลี่ยนแปลง)
│   └── Export PDF/PNG
│
├── /lia — กำกับ LIA [WI-018]
│   ├── กำหนด LIA จากโครงสร้าง
│   ├── Mapping สิทธิเข้าถึง
│   ├── แจ้ง WI-019
│   └── Audit log
│
├── /access-rights — ทบทวนสิทธิ [WI-019]
│   ├── ดูสิทธิผู้ใช้งานทั้งหมด
│   ├── ปรับปรุง/แก้ไข
│   ├── ส่ง ext_IT
│   └── รายงานสิทธิ
│
├── /revoke-access — ยกเลิกสิทธิ [WI-020]
│   ├── FM-001 ใบลาออก → ทริกเกอร์
│   ├── ยกเลิกสิทธิ IT อัตโนมัติ
│   ├── Checklist: email/system/อาคาร
│   └── ยืนยันยกเลิก
│
└── /lia-audit — ตรวจสอบ LIA
    ├── ตรวจสอบสิทธิผิดปกติ
    ├── รายงานการเข้าถึง
    └── แนะนำปรับปรุง
```

---

### Module 7: ⚖️ วินัย (Discipline)

```
discipline (วินัย)
├── /dashboard — ภาพรวมวินัย
│   ├── บันทึกวินัยทั้งหมด
│   ├── แยกตามประเภท/ระดับ
│   ├── สถิติ: จำนวน/เดือน
│   └── แจ้งเตือนค้างตอบ
│
├── /equipment-requests — ขออุปกรณ์เคลื่อนที่ [WI-021]
│   ├── คีย์ขออุปกรณ์
│   ├── อนุมัติ/ปฏิเสธ
│   ├── บันทึกประวัติ → WI-012
│   └── ติดตามการคืน
│
├── /permits — ใบอนุญาต [WI-022]
│   ├── จัดการใบอนุญาตสมาชิก
│   ├── แจ้งเตือนหมดอายุ
│   ├── บันทึกประวัติ → WI-012
│   └── Export รายงาน
│
├── /warning-letters — หนังสือตักเตือน [WI-023]
│   ├── ออกหนังสือตักเตือน
│   ├── ระดับ: ตักเตือน/เตือน/สุดท้าย
│   ├── บันทึกประวัติ → WI-012
│   ├── Member รับทราบ/ตอบ
│   └── รายงานสถิติ
│
└── /discipline-records — ประวัติวินัย
    ├── ดูประวัติรายบุคคล
    ├── ส่ง WI-012 (บันทึกประวัติ)
    ├── ใช้ประกอบการประเมิน
    └── Export รายงาน
```

---

### Module 8: 📈 รายงาน (Reports)

```
reports (รายงาน)
├── /dashboard — ภาพรวมรายงาน
│   ├── รายงานพร้อม export
│   ├── รายงานกำหนดเวลา
│   └── รายงานที่สร้างบ่อย
│
├── /recruitment — รายงานสรรหา
│   ├── อัตราปิด/เปิด
│   ├── เวลาเฉลี่ยปิดตำแหน่ง
│   ├── ช่องทางได้ผู้สมัครดีที่สุด
│   └── อัตราการรับเข้า
│
├── /evaluation — รายงานประเมิน
│   ├── คะแนน CC รายบุคคล/ทีม/องค์กร
│   ├── แนวโน้ม CC
│   ├── Gap analysis
│   └── รายงาน 360°
│
├── /development — รายงานพัฒนา
│   ├── หลักสูตรที่จัด
│   ├── สมาชิกที่เรียน
│   ├── MSP usage
│   └── ผลพัฒนา CC
│
├── /compensation — รายงานค่าตอบแทน
│   ├── เงินเดือนรายเดือน
│   ├── โบนัสประจำปี
│   ├── เงินสมทบ
│   └── เบี้ยเลี้ยง
│
├── /benefits — รายงานสวัสดิการ
│   ├── การเบิกสวัสดิการ
│   ├── อัตราอนุมัติ/ปฏิเสธ
│   ├── MSP balance
│   └── Cashout
│
├── /retirement-resign — รายงานเกษียณ/ลาออก
│   ├── สถิติลาออก
│   ├── เงินสมทบที่จ่าย
│   ├── เกษียณอายุ
│   └── เงินชดเชย
│
├── /discipline — รายงานวินัย
│   ├── สถิติตักเตือน
│   ├── อุปกรณ์เคลื่อนที่
│   ├── ใบอนุญาต
│   └── แนวโน้ม
│
└── /export — Export
    ├── PDF / Excel / CSV
    ├── รายงานกำหนดเวลา
    └── Auto-send (email/Line)
```

---

## 🏗️ ส่วนที่ 3: Automation Engine

### 3.1 กฎอัตโนมัติ (Automation Rules)

| # | กฎ | ทริกเกอร์ | การกระทำ | กระบวนการที่เกี่ยวข้อง |
|---|---|---|---|---|
| A1 | แจ้งเตือนลงเวลา | WI-011 สร้างสมาชิกใหม่ | แจ้ง WI-013 ให้เริ่มลงเวลา | WI-011 → WI-013 |
| A2 | แจ้งเตือนประเมินทดลองงาน | WI-011 + 90 วัน | แจ้ง PM-003/WI-016 เริ่มประเมิน | WI-011 → PM-003 |
| A3 | คำนวณเงินเดือนอัตโนมัติ | WI-017 คีย์ + WI-013 ลงเวลา | WCD-WI004 คำนวณเงินเดือน | WI-017 + WI-013 → WCD-WI004 |
| A4 | แจ้งเตือนเบิกสวัสดิการ | สมาชิกกรอกฟอร์ม | แจ้ง PAO/การเงิน | WCD-WI003 → PAO/การเงิน |
| A5 | แจ้งเตือนเกษียณ | อายุใกล้ 60 (12 เดือน) | แจ้ง BMC | ext_BMC ← WCD-WI006 |
| A6 | คำนวณเงินสมทบอัตโนมัติ | WCD-WI004 เสร็จ | WCD-WI010 คำนวณ 5% | WCD-WI004 → WCD-WI010 |
| A7 | ยกเลิกสิทธิอัตโนมัติ | FM-001 อนุมัติ | WI-020 → ext_IT | FM-001 → WI-020 → ext_IT |
| A8 | แจ้งเตือนก่อนเริ่มงาน | WI-003 ผู้สมัครผ่าน | SD-001 ส่งรายละเอียด | WI-003 → SD-001 |
| A9 | สร้างแผนพัฒนาอัตโนมัติ | WI-012 ประเมินเสร็จ | PAD-PM004 สร้างแผน | WI-012 → PAD-PM004 |
| A10 | แจ้งเตือนโบนัส | ถึงกำหนดปี | WCD-WI005 เริ่มคำนวณ | WCD-WI005 |
| A11 | แจ้งเตือนนำส่งเงินสมทบ | วันที่ 15 ใกล้ถึง | WCD-WI010 เตรียมข้อมูล | WCD-WI010 |
| A12 | AI คัดกรองใบสมัคร | ใบสมัครใหม่เข้า | PM-001/WI-002 คัดกรอง | PM-001 → WI-002 |
| A13 | จับคู่พี่เลี้ยงอัตโนมัติ | WI-011 สมาชิกใหม่ | PAD-PM001 จับคู่ | WI-011 → PAD-PM001 |
| A14 | คำนวณเบี้ยเลี้ยงอัตโนมัติ | WI-013 ลงเวลาสิ้นเดือน | WCD-WI001 คำนวณ | WI-013 → WCD-WI001 |
| A15 | สร้าง e-slip อัตโนมัติ | WCD-WI004 คำนวณเสร็จ | ส่งสมาชิกวันที่ 15-16 | WCD-WI004 → ext_Member |

---

## 🏗️ ส่วนที่ 4: API Architecture

### 4.1 API Endpoints

```
/api/v1
├── /auth
│   ├── POST /login
│   ├── POST /logout
│   ├── POST /refresh-token
│   └── GET /me
│
├── /members (WI-011, WI-017) — ข้อมูลสมาชิก
│   ├── GET / — รายการสมาชิก (filter: status/bu/department)
│   ├── GET /:id — ข้อมูลรายบุคคล
│   ├── POST / — สร้างสมาชิกใหม่ (จาก WI-003/WI-008)
│   ├── PUT /:id — แก้ไขข้อมูล
│   ├── POST /:id/onboard — นำเข้าระบบ [WI-011]
│   └── POST /:id/revoke — ยกเลิกสิทธิ [WI-020]
│
├── /recruitment (สรรหา)
│   ├── /manpower-requests [WI-001]
│   │   ├── GET / — รายการขออัตรากำลัง
│   │   ├── POST / — สร้างใบขอ
│   │   ├── PUT /:id/approve — อนุมัติ
│   │   └── POST /:id/post — ประกาศรับสมัคร
│   │
│   ├── /job-postings [PM-001]
│   │   ├── GET / — ประกาศทั้งหมด
│   │   ├── POST / — สร้างประกาศ (auto-post 10 channels)
│   │   └── GET /:id/stats — สถิติผู้สมัคร
│   │
│   ├── /applications [WI-002]
│   │   ├── GET / — ใบสมัครทั้งหมด
│   │   ├── POST / — ยื่นใบสมัคร
│   │   ├── PUT /:id/screen — AI คัดกรอง
│   │   ├── PUT /:id/interview — บันทึกผลสัมภาษณ์
│   │   └── PUT /:id/decision — ตัดสินใจ
│   │
│   ├── /selection-results [WI-003]
│   │   ├── GET / — สรุปผล
│   │   ├── POST /:id/offer — สร้าง offer letter
│   │   └── POST /:id/notify — SD-001 แจ้งก่อนเริ่มงาน
│   │
│   └── /foreign-workers [PM-002]
│       ├── /quotas [WI-006] — จัดการโควต้า
│       ├── /immigration [WI-007] — ตม.
│       └── /permits [WI-008] — ใบอนุญาต
│
├── /evaluations (ประเมินผล)
│   ├── /templates [WI-014] — จัดการแบบประเมิน
│   ├── /probation [PM-003, WI-016] — ประเมินทดลองงาน
│   ├── /credit [WI-012] — ประเมินเครดิต
│   ├── /annual [WI-032] — ประเมินรายปี
│   ├── /results [WI-015] — ผลประเมิน
│   └── /cc-dashboard — แดชบอร์ด CC
│
├── /development (พัฒนา)
│   ├── /plans [PAD-PM004, PAD-PM005] — แผนพัฒนา
│   ├── /courses [PAD-WI001, PAD-WI002] — หลักสูตร
│   ├── /mentoring [PAD-PM001] — พี่เลี้ยง
│   ├── /training-records — ประวัติอบรม
│   ├── /msp [PAD-WI004, PAD-WI005, PAD-WI006] — MSP
│   └── /bupoint [PAD-WI007] — BUPOINT
│
├── /compensation (ค่าตอบแทน)
│   ├── /salary-data [WI-017] — ข้อมูลเงินเดือน
│   ├── /payroll [WCD-WI004] — จ่ายเงินเดือน
│   ├── /allowance [WCD-WI001] — เบี้ยเลี้ยง
│   ├── /benefits [WCD-WI003] — เบิกสวัสดิการ
│   ├── /bonus [WCD-WI005] — โบนัส
│   ├── /contributions [WCD-WI010] — เงินสมทบ
│   └── /e-slips — สลิปเงินเดือน
│
├── /qol — คุณภาพชีวิต
│   ├── /health — สุขภาพ
│   ├── /wealth — ความมั่งคั่ง
│   ├── /wellbeing — บรรยากาศ
│   ├── /time — เวลา
│   └── /fun — อารมณ์ขัน
│
├── /structure-rights (โครงสร้าง/สิทธิ)
│   ├── /org-chart [WI-009] — โครงสร้างองค์กร
│   ├── /lia [WI-018] — กำกับ LIA
│   ├── /access-rights [WI-019] — สิทธิ
│   └── /revoke [WI-020] — ยกเลิกสิทธิ
│
├── /discipline (วินัย)
│   ├── /equipment [WI-021] — อุปกรณ์เคลื่อนที่
│   ├── /permits [WI-022] — ใบอนุญาต
│   ├── /warnings [WI-023] — หนังสือตักเตือน
│   └── /records — ประวัติวินัย
│
├── /resignation — ลาออก
│   ├── POST / — ยื่นใบลาออก [FM-001]
│   ├── GET /:id — รายละเอียด
│   ├── PUT /:id/approve — อนุมัติ
│   └── PUT /:id/complete — พ้นสภาพ
│
├── /retirement — เกษียณ [WCD-WI006]
│   ├── GET /upcoming — สมาชิกใกล้เกษียณ
│   ├── POST /:id/notify — แจ้ง BMC
│   ├── PUT /:id/decide — ตัดสินใจเกษียณ/ต่อ
│   └── PUT /:id/payout — จ่ายเงิน
│
├── /notifications — แจ้งเตือน
│   ├── GET / — รายการแจ้งเตือน
│   ├── PUT /:id/read — อ่านแล้ว
│   └── POST /send — ส่งแจ้งเตือน
│
└── /reports — รายงาน
    ├── /recruitment — สรรหา
    ├── /evaluation — ประเมิน
    ├── /development — พัฒนา
    ├── /compensation — ค่าตอบแทน
    ├── /benefits — สวัสดิการ
    ├── /retirement-resign — เกษียณ/ลาออก
    ├── /discipline — วินัย
    └── /export — Export (PDF/Excel/CSV)
```

---

## 🏗️ ส่วนที่ 5: Integration Points

### 5.1 ระบบภายนอกที่เชื่อมต่อ

| ระบบ | เชื่อมโยงกับ | วิธีเชื่อมต่อ | ข้อมูลที่แลกเปลี่ยน |
|---|---|---|---|
| **BCT** | WCD-WI003, WCD-WI004 | REST API | VC numbers, payment confirmation |
| **Kbank H2H** | WCD-WI004, WCD-WI005 | Host-to-Host | โอนเงินเดือน/โบนัส |
| **CU** | WCD-WI004, WCD-WI005, WCD-WI006 | API / Batch | ออมหุ้น, เงินกู้, หุ้น |
| **HOCC** | WCD-WI005 | API | PFS data, tax info |
| **Line/TG** | SD-001, ทุกแจ้งเตือน | Messaging API | แจ้งเตือนสมาชิก |
| **JobThai** | PM-001 | API | โพสต์รับสมัคร, ใบสมัคร |
| **Facebook** | PM-001 | Graph API | โพสต์รับสมัคร |
| **E-filing** | WCD-WI010 | API | ใบเสร็จภาษี |
| **IT System** | WI-019, WI-020 | API / Webhook | จัดการสิทธิ |
| **App MS24** | WCD-WI003 | API | เบิกสวัสดิการ |
| **Government** | WCD-WI010, WI-008 | Portal / API | ภงด.1, ประกันสังคม, กยศ. |

---

## 🏗️ ส่วนที่ 6: UI/UX Flow — Data Flow ระหว่าง Module

### 6.1 Flow: สมาชิกใหม่ตั้งแต่สรรหาถึงจ่ายเงินเดือน

```
[Module 1: สรรหา]
  BU คีย์ WI-001 → PAO อนุมัติ → PM-001 ประกาศรับสมัคร
  → WI-002 รับใบสมัคร → AI คัดกรอง → สัมภาษณ์
  → WI-003 สรุปผล → SD-001 แจ้งก่อนเริ่มงาน

        ↓ (ข้อมูลผู้สมัครผ่าน)

[Module 1: Onboarding]
  WI-011 สร้างสมาชิก → ระบบแจ้งเตือนอัตโนมัติ:
    ├─▶ WI-013 เริ่มลงเวลา
    ├─▶ WI-012 เริ่มประเมินเครดิต
    ├─▶ PM-003 ตั้งประเมินทดลองงาน
    └─▶ PAD-PM001 จับคู่พี่เลี้ยง

        ↓ (หลังทดลองงาน 90 วัน)

[Module 2: ประเมินผล]
  PM-003 ประเมินทดลองงาน → WI-016 บันทึกผล
  → WI-015 แบบบรรจุ (ถ้าผ่าน)

        ↓ (ข้อมูลสมาชิกบรรจุ)

[Module 1: ข้อมูลเงินเดือน]
  WI-017 คีย์ข้อมูลเงินเดือน → กำหนดฐานเงินเดือน

        ↓ (สิ้นเดือน)

[Module 4: ค่าตอบแทน]
  WCD-WI004 คำนวณเงินเดือน (รวม WI-013 ลงเวลา + CU)
  → e-slip สมาชิก → ออก VC → โอน H2H Kbank
  → WCD-WI010 นำส่งเงินสมทบ (ภงด.1/ประกันสังคม/กยศ.)
```

### 6.2 Flow: ประเมิน → พัฒนา → MSP

```
[Module 2: ประเมินผล]
  WI-012 ประเมินเครดิต → CC1-CC5 scores
  WI-032 ประเมินรายปี → 360° results

        ↓ (ผลประเมิน)

[Module 3: พัฒนา]
  PAD-PM004 สร้างแผนพัฒนา (จาก CC gaps)
  → PAD-PM001 จับคู่พี่เลี้ยง
  → PAD-WI001/WI-002 จัดอบรม
  → PAD-WI003 กำกับพัฒนา

        ↓ (แผนพัฒนา)

[Module 3: MSP]
  PAD-WI004 สร้าง MSP (จากแผนพัฒนา + POI)
  → PAD-WI005 ซื้อ MSP
  → PAD-WI006 เก็บค่าดำเนินการ
  → PAD-WI007 ดึง BUPOINT กลับ (ถ้าผิดพลาด)

        ↓ (Feedback Loop)

[Module 2: ประเมินผล] (รอบใหม่)
  ผลพัฒนา → ปรับปรุงประเมิน → วนรอบใหม่
```

### 6.3 Flow: เกษียณ / ลาออก

```
[Module 6: โครงสร้าง]
  ext_BMC แจ้งสมาชิกอายุ 60
  → WCD-WI006 เริ่มกระบวนการเกษียณ

        หรือ

[Module 7: วินัย]
  สมาชิกกรอก FM-001 ใบลาออก
  → PAO อนุมัติ
  → WI-020 ยกเลิกสิทธิ IT

        ↓

[Module 4: ค่าตอบแทน]
  WCD-WI006 คำนวณเงินชดเชย + หุ้น CU GTC + เงินกู้
  WCD-WI002 คำนวณเงินสมทบอายุงาน
  → ext_Money จ่ายเงินเข้าบัญชี

        ↓

[Module 1: สมาชิก]
  อัพเดท status = retired/resigned
  → WI-012 บันทึกประวัติ
```

---

## 🏗️ ส่วนที่ 7: Role-Based Access Control (RBAC)

### 7.1 บทบาทผู้ใช้งาน

| บทบาท | สิทธิ | หมายเหตุ |
|---|---|---|
| **Super Admin** | ทุกอย่าง | ผู้ดูแลระบบสูงสุด |
| **PAO Admin** | สรรหา+ประเมิน+โครงสร้าง | ทีม PAO |
| **PAD Admin** | พัฒนา+หลักสูตร+MSP | ทีม PAD |
| **WCD Admin** | ค่าตอบแทน+สวัสดิการ | ทีม WCD/การเงิน |
| **BU Manager** | ขออัตรากำลัง, INC, อนุมัติทีม | ผู้จัดการ BU |
| **Manager** | ประเมินทีม, อนุมัติลา, เห็นผลทีม | หัวหน้างาน |
| **Mentor** | เห็นข้อมูลน้องเลี้ยง, บันทึกการพบ | พี่เลี้ยง |
| **Member** | ข้อมูลตัวเอง, เบิกสวัสดิการ, ดูสลิป | สมาชิกทั่วไป |
| **IT Admin** | จัดการสิทธิ, ยกเลิกสิทธิ | ทีม IT |
| **BMC** | เห็นข้อมูลสมาชิก, แจ้งเกษียณ | ทีมดูแลสมาชิก |
| **Read Only** | ดูรายงานอย่างเดียว | Auditor/ผู้บริหาร |

### 7.2 สิทธิราย Module

| Module | Member | Manager | PAO | PAD | WCD | BU |
|---|---|---|---|---|---|---|
| สรรหา | ดูประกาศ | ดู+อนุมัติ | ทุกอย่าง | - | - | ขออัตรากำลัง |
| ประเมิน | ประเมินตนเอง | ประเมินทีม | ทุกอย่าง | ดูผล | ดูผล | ดูผลทีม |
| พัฒนา | ดูแผนตัวเอง | ดูแผนทีม | ดูผล | ทุกอย่าง | - | ดูผลทีม |
| MSP | ดู+ใช้ | อนุมัติ | ดูผล | ดูผล | ดู | ดูผลทีม |
| ค่าตอบแทน | ดูสลิปตัวเอง | ดูทีม | ดู | ดู | ทุกอย่าง | INC |
| สวัสดิการ | เบิก | อนุมัติ | ดู | - | ทุกอย่าง | - |
| โครงสร้าง | ดู | ดู | ทุกอย่าง | - | - | ขอเพิ่ม |
| วินัย | ดูของตัวเอง | ดูทีม | ทุกอย่าง | - | - | ดูทีม |

---

## 📎 สรุปสำหรับทีมพัฒนา

### สิ่งที่ต้องสร้าง (เรียงลำดับความสำคัญ):

**Phase 1 — Foundation (เดือน 1-2)**
1. Database schema ทั้งหมด 26 ตาราง
2. Authentication + RBAC
3. Module 1: สรรหา (WI-001 → WI-011)
4. Module 2: ประเมินผล (WI-012 → WI-016)

**Phase 2 — Core Operations (เดือน 3-4)**
5. Module 4: ค่าตอบแทน (WCD-WI004, WI-001, WI-003)
6. Module 3: พัฒนา (PAD-PM004 → PAD-WI006)
7. Automation Engine (A1-A15)
8. Notification system

**Phase 3 — Advanced (เดือน 5-6)**
9. Module 5: คุณภาพชีวิต
10. Module 6: โครงสร้าง/สิทธิ
11. Module 7: วินัย
12. Module 8: รายงาน

**Phase 4 — Integration (เดือน 7-8)**
13. เชื่อม BCT, Kbank, CU, HOCC
14. เชื่อม Line/TG, JobThai, Facebook
15. เชื่อม E-filing, Government portals
16. เชื่อม App MS24, IT System

**Phase 5 — Polish (เดือน 9)**
17. AI screening, CC matching
18. Dashboard, Analytics
19. Mobile responsive
20. Testing + Deploy

---

> ✅ เอกสารฉบับนี้พร้อมให้ทีมพัฒนาใช้สร้าง Web PP7
> 📁 ไฟล์ทั้งหมดอยู่ใน `/root/.openclaw/workspace/pp7-web-architecture/`
> 🔗 อ้างอิงจาก: 55 กระบวนการ + 60 การเชื่อมโยง + 5 Critical Junctions
