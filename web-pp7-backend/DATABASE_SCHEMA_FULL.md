# PP7 Database Schema — Full Specification

> ระบบบริหารบุคลากร PP7 — โครงสร้างข้อมูลทั้งหมด
> Backend: Google Apps Script + Google Sheets
> รองรับ Multi-Country: TH (ไทย), LA (ลาว), KH (กัมพูชา)

---

## Common Fields (ทุก Table มีฟิลด์เหล่านี้)

| Field | Type | Description |
|-------|------|-------------|
| id | string (UUID) | Primary Key |
| created_at | datetime | วันที่สร้างบันทึก |
| updated_at | datetime | วันที่แก้ไขล่าสุด |
| created_by | string (email) | ผู้สร้างบันทึก |
| status | string | active / inactive / archived / pending |
| country | string | TH / LA / KH |

---

## 1. Common Tables (โครงสร้างพื้นฐาน)

### 1.1 employees — ข้อมูลพนักงาน

| Field | Type | Description |
|-------|------|-------------|
| id | string | รหัสพนักงาน (EMP-XXXXXX) |
| employee_code | string | รหัสพนักงาน |
| first_name_th | string | ชื่อจริง (ภาษาไทย) |
| last_name_th | string | นามสกุล (ภาษาไทย) |
| first_name_en | string | First Name (English) |
| last_name_en | string | Last Name (English) |
| email | string | อีเมลบริษัท |
| phone | string | เบอร์โทรศัพท์ |
| gender | string | male / female / other |
| birth_date | date | วันเกิด |
| national_id | string | เลขบัตรประชาชน |
| passport_no | string | เลขพาสปอร์ต |
| hire_date | date | วันที่เริ่มงาน |
| probation_end | date | วันสิ้นโปร |
| employment_type | string | full_time / part_time / contract / intern |
| position | string | ตำแหน่ง |
| level | string | ระดับ (P1-P10, M1-M5) |
| department_id | string | FK → departments.id |
| business_unit_id | string | FK → business_units.id |
| manager_id | string | FK → employees.id (หัวหน้างาน) |
| base_salary | number | เงินเดือนพื้นฐาน |
| currency | string | THB / LAK / KHR |
| bank_name | string | ชื่อธนาคาร |
| bank_account | string | เลขที่บัญชี |
| address | string | ที่อยู่ |
| emergency_contact_name | string | ผู้ติดต่อฉุกเฉิน |
| emergency_contact_phone | string | เบอร์ผู้ติดต่อฉุกเฉิน |
| profile_photo_url | string | URL รูปโปรไฟล์ |
| resignation_date | date | วันที่ลาออก |
| termination_reason | string | เหตุผลที่ออก |
| country | string | TH / LA / KH |
| created_at, updated_at, created_by, status | — | Common fields |

### 1.2 business_units — หน่วยธุรกิจ

| Field | Type | Description |
|-------|------|-------------|
| id | string | รหัส BU |
| bu_code | string | รหัสหน่วยธุรกิจ |
| bu_name_th | string | ชื่อหน่วยธุรกิจ (ไทย) |
| bu_name_en | string | ชื่อหน่วยธุรกิจ (EN) |
| bu_head_id | string | FK → employees.id |
| parent_bu_id | string | FK → business_units.id |
| sort_order | number | ลำดับแสดงผล |
| color | string | สีแสดง (hex) |
| country | string | TH / LA / KH |
| created_at, updated_at, created_by, status | — | Common fields |

### 1.3 departments — แผนก

| Field | Type | Description |
|-------|------|-------------|
| id | string | รหัสแผนก |
| dept_code | string | รหัสแผนก |
| dept_name_th | string | ชื่อแผนก (ไทย) |
| dept_name_en | string | ชื่อแผนก (EN) |
| business_unit_id | string | FK → business_units.id |
| dept_head_id | string | FK → employees.id |
| parent_dept_id | string | FK → departments.id |
| sort_order | number | ลำดับแสดงผล |
| country | string | TH / LA / KH |
| created_at, updated_at, created_by, status | — | Common fields |

### 1.4 users — ผู้ใช้งานระบบ

| Field | Type | Description |
|-------|------|-------------|
| id | string | รหัสผู้ใช้ |
| email | string | อีเมล (ใช้ login) |
| password_hash | string | รหัสผ่าน (hashed) |
| display_name | string | ชื่อที่แสดง |
| employee_id | string | FK → employees.id |
| role | string | admin / hr_manager / bu_manager / employee / auditor / guest |
| business_unit_id | string | FK → business_units.id (สำหรับ BU Manager) |
| last_login | datetime | ล็อกอินล่าสุด |
| login_token | string | Token ปัจจุบัน |
| token_expiry | datetime | Token หมดอายุ |
| country | string | TH / LA / KH |
| created_at, updated_at, created_by, status | — | Common fields |

### 1.5 roles — สิทธิ์การเข้าถึง

| Field | Type | Description |
|-------|------|-------------|
| id | string | รหัส Role |
| role_name | string | admin / hr_manager / bu_manager / employee / auditor / guest |
| description_th | string | รายละเอียดภาษาไทย |
| permissions | string (JSON) | สิทธิ์ที่อนุญาต (JSON array) |
| menu_access | string (JSON) | เมนูที่เข้าถึงได้ |
| country | string | TH / LA / KH |
| created_at, updated_at, created_by, status | — | Common fields |

### 1.6 audit_log — บันทึกการใช้งาน

| Field | Type | Description |
|-------|------|-------------|
| id | string | รหัส Log |
| user_email | string | ผู้กระทำ |
| action | string | create / read / update / delete / login / logout / export |
| module | string | P1 / P2 / P3 / P4 / P5 / P6 / P7 / system |
| table_name | string | ชื่อ Sheet/Table ที่กระทบ |
| record_id | string | ID ของ record ที่แก้ไข |
| old_value | string (JSON) | ค่าเดิม |
| new_value | string (JSON) | ค่าใหม่ |
| ip_address | string | IP Address |
| user_agent | string | browser info |
| country | string | TH / LA / KH |
| created_at, updated_at, created_by, status | — | Common fields |

---

## 2. P1 — แสวงหา (Recruitment)

### 2.1 headcount_requests — คำขออัตรากำลัง

| Field | Type | Description |
|-------|------|-------------|
| id | string | รหัสคำขอ (HC-XXXXXX) |
| request_no | string | เลขที่คำขอ |
| request_date | date | วันที่ขอ |
| business_unit_id | string | FK → business_units.id |
| department_id | string | FK → departments.id |
| position | string | ตำแหน่งที่ต้องการ |
| level | string | ระดับ |
| quantity | number | จำนวนที่ขอ |
| urgency | string | high / medium / low |
| reason | string | เหตุผล |
| replacement_for | string | FK → employees.id (แทนคนที่ออก) |
| approved_by | string | ผู้อนุมัติ |
| approved_date | date | วันที่อนุมัติ |
| approval_status | string | pending / approved / rejected |
| budget_range_min | number | งบประมาณต่ำสุด |
| budget_range_max | number | งบประมาณสูงสุด |
| job_description | string | รายละเอียดงาน |
| qualifications | string | คุณสมบัติ |
| target_start_date | date | วันที่ต้องการเริ่มงาน |
| country | string | TH / LA / KH |
| created_at, updated_at, created_by, status | — | Common fields |

### 2.2 candidates — ผู้สมัครงาน

| Field | Type | Description |
|-------|------|-------------|
| id | string | รหัสผู้สมัคร (CAND-XXXXXX) |
| candidate_code | string | รหัสผู้สมัคร |
| first_name | string | ชื่อ |
| last_name | string | นามสกุล |
| email | string | อีเมล |
| phone | string | โทรศัพท์ |
| linkedin_url | string | LinkedIn |
| resume_url | string | URL เรซูเม่ |
| cover_letter | string | จดหมายแนะนำตัว |
| headcount_request_id | string | FK → headcount_requests.id |
| recruitment_source_id | string | FK → recruitment_sources.id |
| applied_position | string | ตำแหน่งที่สมัคร |
| current_company | string | บริษัทปัจจุบัน |
| current_salary | number | เงินเดือนปัจจุบัน |
| expected_salary | number | เงินเดือนที่คาดหวัง |
| years_experience | number | จำนวนปีประสบการณ์ |
| education_level | string | ต่ำกว่าปริญญา / ปริญญาตรี / โท / เอก |
| education_field | string | สาขาวิชา |
| skills | string (JSON) | ทักษะ (array) |
| stage | string | screening / phone_screen / interview / assessment / offer / hired / rejected |
| applied_date | date | วันที่สมัคร |
| notes | string | หมายเหตุ |
| country | string | TH / LA / KH |
| created_at, updated_at, created_by, status | — | Common fields |

### 2.3 recruitment_sources — แหล่งที่มาผู้สมัคร

| Field | Type | Description |
|-------|------|-------------|
| id | string | รหัสแหล่ง |
| source_name | string | ชื่อแหล่ง (JobBKK, LinkedIn, JobThai, etc.) |
| source_type | string | online / offline / referral / agency / campus / internal |
| cost_per_hire | number | ค่าใช้จ่ายต่อการจ้าง |
| total_applicants | number | จำนวนผู้สมัครทั้งหมด |
| total_hired | number | จำนวนที่จ้างได้ |
| notes | string | หมายเหตุ |
| country | string | TH / LA / KH |
| created_at, updated_at, created_by, status | — | Common fields |

---

## 3. P2 — หยั่งประเมิน (Assessment)

### 3.1 interviews — การสัมภาษณ์

| Field | Type | Description |
|-------|------|-------------|
| id | string | รหัสการสัมภาษณ์ |
| candidate_id | string | FK → candidates.id |
| interview_type | string | phone / technical / behavioral / panel / final |
| interviewer_ids | string (JSON) | รายการผู้สัมภาษณ์ (array of employee IDs) |
| interview_date | datetime | วันที่สัมภาษณ์ |
| duration_minutes | number | ระยะเวลา (นาที) |
| location | string | สถานที่ / Online |
| questions | string (JSON) | รายการคำถาม |
| answers | string (JSON) | คำตอบ |
| rating | number | คะแนน (1-10) |
| feedback | string | ข้อเสนอแนะ |
| decision | string | pass / fail / hold / next_round |
| next_round_type | string | ประเภทรอบถัดไป |
| notes | string | หมายเหตุ |
| country | string | TH / LA / KH |
| created_at, updated_at, created_by, status | — | Common fields |

### 3.2 assessment_results — ผลการทดสอบ

| Field | Type | Description |
|-------|------|-------------|
| id | string | รหัสผลการทดสอบ |
| candidate_id | string | FK → candidates.id |
| assessment_type | string | cognitive / personality / technical / english / iq / eq |
| test_name | string | ชื่อแบบทดสอบ |
| test_date | date | วันที่ทดสอบ |
| score | number | คะแนนที่ได้ |
| max_score | number | คะแนนเต็ม |
| percentile | number | เปอร์เซ็นต์ไทล์ |
| result_summary | string | สรุปผล |
| raw_data | string (JSON) | ข้อมูลดิบ |
| assessed_by | string | ผู้ทดสอบ |
| country | string | TH / LA / KH |
| created_at, updated_at, created_by, status | — | Common fields |

### 3.3 competency_scores — คะแนนสมรรถนะ

| Field | Type | Description |
|-------|------|-------------|
| id | string | รหัสคะแนน |
| candidate_id | string | FK → candidates.id |
| competency_name | string | ชื่อสมรรถนะ |
| competency_category | string | core / functional / leadership / technical |
| score | number | คะแนน (1-5) |
| evidence | string | หลักฐาน/ตัวอย่าง |
| assessor_id | string | FK → employees.id (ผู้ประเมิน) |
| assessment_date | date | วันที่ประเมิน |
| notes | string | หมายเหตุ |
| country | string | TH / LA / KH |
| created_at, updated_at, created_by, status | — | Common fields |

---

## 4. P3 — จับคู่คนกับงาน (Position Matching)

### 4.1 position_matching — จับคู่ตำแหน่ง

| Field | Type | Description |
|-------|------|-------------|
| id | string | รหัสจับคู่ |
| candidate_id | string | FK → candidates.id |
| headcount_request_id | string | FK → headcount_requests.id |
| match_score | number | คะแนนความเหมาะสม (0-100) |
| skills_match | number | คะแนนทักษะตรง (0-100) |
| experience_match | number | คะแนนประสบการณ์ (0-100) |
| culture_match | number | คะแนนวัฒนธรรม (0-100) |
| salary_match | number | ค่าตอบแทนตรง (0-100) |
| overall_recommendation | string | strong_match / match / partial / no_match |
| recommended_position | string | ตำแหน่งที่แนะนำ |
| recommended_level | string | ระดับที่แนะนำ |
| decision | string | accept / reject / negotiate |
| decision_date | date | วันที่ตัดสินใจ |
| notes | string | หมายเหตุ |
| country | string | TH / LA / KH |
| created_at, updated_at, created_by, status | — | Common fields |

### 4.2 employee_assignments — การมอบหมายงาน

| Field | Type | Description |
|-------|------|-------------|
| id | string | รหัสการมอบหมาย |
| employee_id | string | FK → employees.id |
| assignment_type | string | permanent / temporary / project / secondment / promotion / transfer |
| position | string | ตำแหน่ง |
| department_id | string | FK → departments.id |
| business_unit_id | string | FK → business_units.id |
| manager_id | string | FK → employees.id |
| start_date | date | วันที่เริ่ม |
| end_date | date | วันที่สิ้นสุด (ถ้ามี) |
| reason | string | เหตุผล |
| previous_assignment_id | string | FK → employee_assignments.id |
| approved_by | string | อนุมัติโดย |
| effective_date | date | วันที่มีผล |
| country | string | TH / LA / KH |
| created_at, updated_at, created_by, status | — | Common fields |

---

## 5. P4 — ประเมินผล (Performance)

### 5.1 performance_evaluations — การประเมินผลงาน

| Field | Type | Description |
|-------|------|-------------|
| id | string | รหัสการประเมิน |
| employee_id | string | FK → employees.id |
| evaluation_period | string | Q1-2024 / H1-2024 / Annual-2024 |
| evaluation_type | string | self / manager / probation / annual / mid_year |
| review_date | date | วันที่ประเมิน |
| kpi_scores | string (JSON) | คะแนน KPI |
| goal_achievement | number | ผลสำเร็จเป้าหมาย (%) |
| overall_rating | number | คะแนนรวม (1-5) |
| rating_label | string | outstanding / exceeds / meets / needs_improvement / unsatisfactory |
| strengths | string | จุดแข็ง |
| areas_for_improvement | string | จุดที่ควรพัฒนา |
| reviewer_id | string | FK → employees.id |
| review_comments | string | ความคิดเห็นผู้ประเมิน |
| employee_comments | string | ความคิดเห็นพนักงาน |
| calibration_score | number | คะแนนหลัง calibration |
| final_rating | number | คะแนนสุดท้าย |
| country | string | TH / LA / KH |
| created_at, updated_at, created_by, status | — | Common fields |

### 5.2 evaluation_360 — ประเมิน 360 องศา

| Field | Type | Description |
|-------|------|-------------|
| id | string | รหัสประเมิน 360 |
| employee_id | string | FK → employees.id |
| evaluation_period | string | ช่วงการประเมิน |
| evaluator_id | string | FK → employees.id |
| relationship | string | self / manager / peer / subordinate / customer |
| competency_scores | string (JSON) | คะแนนตามสมรรถนะ |
| behavioral_feedback | string | ข้อเสนอแนะเชิงพฤติกรรม |
| overall_score | number | คะแนนรวม |
| is_anonymous | boolean | ไม่แสดงชื่อ |
| submission_date | date | วันที่ส่ง |
| country | string | TH / LA / KH |
| created_at, updated_at, created_by, status | — | Common fields |

### 5.3 annual_credit — เครดิตประจำปี

| Field | Type | Description |
|-------|------|-------------|
| id | string | รหัสเครดิต |
| employee_id | string | FK → employees.id |
| year | number | ปี |
| credit_type | string | salary_increase / bonus / promotion_credit |
| calculated_amount | number | จำนวนที่คำนวณ |
| approved_amount | number | จำนวนที่อนุมัติ |
| percentage | number | เปอร์เซ็นต์ |
| justification | string | เหตุผล |
| approved_by | string | อนุมัติโดย |
| approved_date | date | วันที่อนุมัติ |
| country | string | TH / LA / KH |
| created_at, updated_at, created_by, status | — | Common fields |

---

## 6. P5 — พัฒนา (Development)

### 6.1 development_plans — แผนพัฒนา

| Field | Type | Description |
|-------|------|-------------|
| id | string | รหัสแผนพัฒนา (IDP-XXXXXX) |
| employee_id | string | FK → employees.id |
| plan_year | number | ปีแผน |
| plan_type | string | idp / pip / career_path / succession |
| goal | string | เป้าหมาย |
| current_level | string | ระดับปัจจุบัน |
| target_level | string | ระดับเป้าหมาย |
| target_date | date | วันที่เป้าหมาย |
| action_items | string (JSON) | รายการกิจกรรม |
| progress | number | ความคืบหน้า (%) |
| mentor_id | string | FK → employees.id |
| manager_comments | string | ความคิดเห็นหัวหน้า |
| country | string | TH / LA / KH |
| created_at, updated_at, created_by, status | — | Common fields |

### 6.2 training_records — บันทึกการอบรม

| Field | Type | Description |
|-------|------|-------------|
| id | string | รหัสการอบรม |
| employee_id | string | FK → employees.id |
| training_name | string | ชื่อการอบรม |
| training_type | string | internal / external / online / workshop / certification |
| provider | string | ผู้จัด |
| start_date | date | วันที่เริ่ม |
| end_date | date | วันที่สิ้นสุด |
| duration_hours | number | ระยะเวลา (ชั่วโมง) |
| cost | number | ค่าใช้จ่าย |
| score | number | คะแนน |
| passed | boolean | ผ่าน/ไม่ผ่าน |
| certificate_url | string | URL ใบประกาศ |
| development_plan_id | string | FK → development_plans.id |
| feedback | string | ข้อเสนอแนะ |
| country | string | TH / LA / KH |
| created_at, updated_at, created_by, status | — | Common fields |

### 6.3 skill_gaps — ช่องว่างทักษะ

| Field | Type | Description |
|-------|------|-------------|
| id | string | รหัสช่องว่างทักษะ |
| employee_id | string | FK → employees.id |
| skill_name | string | ชื่อทักษะ |
| skill_category | string | technical / soft / leadership / language / digital |
| current_level | number | ระดับปัจจุบัน (1-5) |
| required_level | number | ระดับที่ต้องการ (1-5) |
| gap | number | ช่องว่าง (required - current) |
| priority | string | high / medium / low |
| action_plan | string | แผนแก้ไข |
| target_date | date | วันที่เป้าหมาย |
| country | string | TH / LA / KH |
| created_at, updated_at, created_by, status | — | Common fields |

---

## 7. P6 — ค่าตอบแทน (Compensation)

### 7.1 salary_records — บันทึกเงินเดือน

| Field | Type | Description |
|-------|------|-------------|
| id | string | รหัสบันทึก |
| employee_id | string | FK → employees.id |
| effective_date | date | วันที่มีผล |
| base_salary | number | เงินเดือนพื้นฐาน |
| currency | string | THB / LAK / KHR |
| salary_grade | string | เกรดเงินเดือน |
| step | number | ขั้น |
| change_type | string | new_hire / annual_adjustment / promotion / transfer / correction |
| change_reason | string | เหตุผล |
| previous_salary | number | เงินเดือนเดิม |
| approved_by | string | อนุมัติโดย |
| approved_date | date | วันที่อนุมัติ |
| country | string | TH / LA / KH |
| created_at, updated_at, created_by, status | — | Common fields |

### 7.2 incentives — แรงจูงใจ/โบนัส

| Field | Type | Description |
|-------|------|-------------|
| id | string | รหัสแรงจูงใจ |
| employee_id | string | FK → employees.id |
| incentive_type | string | annual_bonus / performance_bonus / project_bonus / spot_award / commission |
| period | string | ช่วงเวลาที่จ่าย |
| amount | number | จำนวนเงิน |
| currency | string | THB / LAK / KHR |
| calculation_basis | string | หลักเกณฑ์การคำนวณ |
| performance_rating | number | คะแนนผลงาน |
| approved_by | string | อนุมัติโดย |
| paid_date | date | วันที่จ่าย |
| notes | string | หมายเหตุ |
| country | string | TH / LA / KH |
| created_at, updated_at, created_by, status | — | Common fields |

### 7.3 benefits — สวัสดิการ

| Field | Type | Description |
|-------|------|-------------|
| id | string | รหัสสวัสดิการ |
| employee_id | string | FK → employees.id |
| benefit_type | string | insurance / provident / stock / allowance / leave_extra / flexible |
| benefit_name | string | ชื่อสวัสดิการ |
| description | string | รายละเอียด |
| monthly_amount | number | จำนวนเงิน/เดือน |
| annual_amount | number | จำนวนเงิน/ปี |
| enrollment_date | date | วันลงทะเบียน |
| expiry_date | date | วันหมดอายุ |
| provider | string | ผู้ให้บริการ |
| notes | string | หมายเหตุ |
| country | string | TH / LA / KH |
| created_at, updated_at, created_by, status | — | Common fields |

---

## 8. P7 — คุณภาพชีวิต (Wellbeing)

### 8.1 wellbeing_records — บันทึกความเป็นอยู่

| Field | Type | Description |
|-------|------|-------------|
| id | string | รหัสบันทึก |
| employee_id | string | FK → employees.id |
| record_type | string | work_life_balance / stress / satisfaction / engagement |
| record_date | date | วันที่บันทึก |
| score | number | คะแนน (1-10) |
| category | string | physical / mental / social / financial |
| description | string | รายละเอียด |
| action_taken | string | การดำเนินการ |
| follow_up_date | date | วันติดตามผล |
| notes | string | หมายเหตุ |
| country | string | TH / LA / KH |
| created_at, updated_at, created_by, status | — | Common fields |

### 8.2 health_records — บันทึกสุขภาพ

| Field | Type | Description |
|-------|------|-------------|
| id | string | รหัสบันทึกสุขภาพ |
| employee_id | string | FK → employees.id |
| record_type | string | annual_checkup / vaccination / illness / accident / mental_health |
| record_date | date | วันที่บันทึก |
| facility | string | สถานพยาบาล |
| diagnosis | string | ผลการวินิจฉัย |
| treatment | string | การรักษา |
| fitness_status | string | fit / fit_with_restriction / unfit |
| next_checkup_date | date | นัดตรวจครั้งต่อไป |
| notes | string | หมายเหตุ |
| country | string | TH / LA / KH |
| created_at, updated_at, created_by, status | — | Common fields |

### 8.3 engagement_surveys — แบบสำรวจความผูกพัน

| Field | Type | Description |
|-------|------|-------------|
| id | string | รหัสแบบสำรวจ |
| survey_name | string | ชื่อแบบสำรวจ |
| survey_type | string | annual / pulse / onboarding / exit |
| launch_date | date | วันที่เริ่ม |
| close_date | date | วันที่ปิด |
| total_invited | number | จำนวนที่เชิญ |
| total_responded | number | จำนวนที่ตอบ |
| response_rate | number | อัตราตอบ (%) |
| overall_score | number | คะแนนรวม |
| dimension_scores | string (JSON) | คะแนนแยกมิติ |
| top_strengths | string (JSON) | จุดแข็งอันดับต้น |
| top_concerns | string (JSON) | ข้อกังวลอันดับต้น |
| action_plans | string (JSON) | แผนดำเนินการ |
| country | string | TH / LA / KH |
| created_at, updated_at, created_by, status | — | Common fields |

---

## Role-Based Access Control (RBAC)

| Role | Access Level |
|------|-------------|
| admin | เข้าถึงทุกระบบ P1-P7 + จัดการผู้ใช้ + ดู audit_log |
| hr_manager | เข้าถึง P1-P7 ทั้งหมด (แต่แก้ไข users/roles ไม่ได้) |
| bu_manager | เข้าถึง P1-P4 ของ BU ที่ตัวเองดูแล |
| employee | ดูข้อมูลตัวเอง (P4-P7) + ขอ P1 headcount |
| auditor | ดูอย่างเดียว (read-only) ทุกระบบ |
| guest | ดู Dashboard ได้เท่านั้น |

---

## Google Sheet Names

แต่ละ Table จะเป็น 1 Sheet ใน Google Spreadsheet:
- `employees` → Sheet "DB_employees"
- `business_units` → Sheet "DB_business_units"
- `departments` → Sheet "DB_departments"
- `users` → Sheet "DB_users"
- `roles` → Sheet "DB_roles"
- `audit_log` → Sheet "DB_audit_log"
- `headcount_requests` → Sheet "P1_headcount_requests"
- `candidates` → Sheet "P1_candidates"
- `recruitment_sources` → Sheet "P1_recruitment_sources"
- `interviews` → Sheet "P2_interviews"
- `assessment_results` → Sheet "P2_assessment_results"
- `competency_scores` → Sheet "P2_competency_scores"
- `position_matching` → Sheet "P3_position_matching"
- `employee_assignments` → Sheet "P3_employee_assignments"
- `performance_evaluations` → Sheet "P4_performance_evaluations"
- `evaluation_360` → Sheet "P4_evaluation_360"
- `annual_credit` → Sheet "P4_annual_credit"
- `development_plans` → Sheet "P5_development_plans"
- `training_records` → Sheet "P5_training_records"
- `skill_gaps` → Sheet "P5_skill_gaps"
- `salary_records` → Sheet "P6_salary_records"
- `incentives` → Sheet "P6_incentives"
- `benefits` → Sheet "P6_benefits"
- `wellbeing_records` → Sheet "P7_wellbeing_records"
- `health_records` → Sheet "P7_health_records"
- `engagement_surveys` → Sheet "P7_engagement_surveys"

---

*เอกสารสร้างเมื่อ: 2025-06-25 — PP7 Web Backend Foundation*
