# Web PP7 Database Schema (Draft v1)

โครงสร้างฐานข้อมูลเชิงสัมพันธ์ (Relational) ที่ออกแบบมาเพื่อรองรับ Flow P1-P7 โดยเน้นการลดความซ้ำซ้อนและรองรับการประเมินเชิงประจักษ์ (Data-Driven)

## 1. Core Tables (ข้อมูลพื้นฐาน)
- **`employees`** (สมาชิก)
  - `id` (UUID), `first_name`, `last_name`, `email`, `hire_date`, `status` (Active/Inactive)
  - `current_position_id` (FK), `bu_id` (FK), `manager_id` (FK - Self-referencing)
- **`positions`** (ตำแหน่งงาน)
  - `id` (UUID), `title`, `bu_id` (FK), `job_description` (JSON), `required_cc_scores` (JSON - เกณฑ์ CC ขั้นต่ำ)
- **`business_units`** (หน่วยงาน)
  - `id` (UUID), `name`, `country` (TH/LA/KH), `head_id` (FK)

## 2. P1-P3: Recruitment & Matching
- **`candidates`** (ผู้สมัคร - P1)
  - `id`, `name`, `source_channel`, `resume_url`, `status` (Screening/Assessing/Matched/Rejected)
- **`assessments`** (การประเมินก่อนรบ - P2)
  - `id`, `candidate_id` (FK), `skill_score`, `attitude_score`, `culture_fit_notes`, `ai_recommendation` (Text)
- **`job_matches`** (การจับคู่ - P3)
  - `id`, `candidate_id` (FK), `position_id` (FK), `match_score` (0-100), `gap_analysis` (JSON), `status` (Accepted/Declined)

## 3. P4: Performance & 360 Evaluation (จุดเน้นหลัก)
- **`performance_cycles`** (รอบการประเมิน)
  - `id`, `year`, `quarter`, `start_date`, `end_date`, `status` (Draft/Open/Closed)
- **`evaluations`** (ผลการประเมินหลัก - P4)
  - `id`, `employee_id` (FK), `cycle_id` (FK), `overall_score`, `ai_summary` (Text), `status`
- **`evaluation_360_items`** (รายการประเมิน 360 องศา - แยกตามมุมมองเพื่อลดอคติ)
  - `id`, `evaluation_id` (FK)
  - `evaluator_type` (Enum: 'self', 'manager', 'peer', 'subordinate', 'customer')
  - `evaluator_id` (FK -> employees หรือ external)
  - `cc1_score` to `cc5_score` (Decimal 1-5, พร้อมเกณฑ์ Rubric ชัดเจน)
  - `evidence_links` (JSON Array - ลิงก์หลักฐานเชิงประจักษ์ เช่น Jira ticket, Project report)
  - `comments` (Text)

## 4. P5-P7: Development, Compensation, Quality of Life
- **`development_plans`** (แผนพัฒนา - P5)
  - `id`, `employee_id` (FK), `evaluation_id` (FK), `target_cc` (Enum), `action_items` (JSON), `progress_pct`, `status`
- **`compensation_records`** (ค่าตอบแทน - P6)
  - `id`, `employee_id` (FK), `year`, `base_salary`, `performance_bonus` (คำนวณจาก P4), `ai_equity_flag` (Boolean - แจ้งเตือนความไม่เท่าเทียม)
- **`wellbeing_metrics`** (คุณภาพชีวิต - P7)
  - `id`, `employee_id` (FK), `month`, `health_score`, `wealth_stability_flag`, `engagement_score`, `overtime_hours`, `fun_activity_participation`

## 5. AI Core Engine Logs
- **`ai_insights`**
  - `id`, `module` (P1-P7), `target_id` (FK), `insight_type` (e.g., 'flight_risk', 'skill_gap', 'match_recommendation'), `payload` (JSON), `created_at`

---
**หมายเหตุการออกแบบ**: 
- ใช้ `evidence_links` ใน `evaluation_360_items` เพื่อบังคับให้ผู้ประเมินระบุหลักฐานเชิงประจักษ์ แทนการให้คะแนนจาก "ความรู้สึก" ตามปัญหาที่พบในอดีต
- แยก `evaluation_360_items` เป็นแถว (Row-based) เพื่อให้วิเคราะห์คะแนนรายมิติ (CC1-CC5) และรายผู้ประเมินได้ง่าย