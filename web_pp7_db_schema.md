# Web PP7 Database Schema (Draft v1)

## 1. Core Tables (ข้อมูลพื้นฐาน)
- **`employees`** (สมาชิก): id, first_name, last_name, email, hire_date, status, current_position_id, bu_id, manager_id
- **`positions`** (ตำแหน่งงาน): id, title, bu_id, job_description, required_cc_scores
- **`business_units`** (หน่วยงาน): id, name, country (TH/LA/KH), head_id

## 2. P1-P3: Recruitment & Matching
- **`candidates`** (ผู้สมัคร - P1): id, name, source_channel, resume_url, status
- **`assessments`** (ประเมินก่อนรบ - P2): id, candidate_id, skill_score, attitude_score, culture_fit_notes, ai_recommendation
- **`job_matches`** (จับคู่ - P3): id, candidate_id, position_id, match_score, gap_analysis, status

## 3. P4: Performance & 360 Evaluation (จุดเน้นหลัก)
- **`performance_cycles`** (รอบการประเมิน): id, year, quarter, start_date, end_date, status
- **`evaluations`** (ผลการประเมินหลัก): id, employee_id, cycle_id, overall_score, ai_summary, status
- **`evaluation_360_items`** (รายการประเมิน 360 องศา): id, evaluation_id, evaluator_type (self/manager/peer/subordinate/customer), evaluator_id, cc1_score to cc5_score, **evidence_links** (JSON Array - บังคับใส่หลักฐาน), comments

## 4. P5-P7: Development, Compensation, Quality of Life
- **`development_plans`** (แผนพัฒนา - P5): id, employee_id, evaluation_id, target_cc, action_items, progress_pct, status
- **`compensation_records`** (ค่าตอบแทน - P6): id, employee_id, year, base_salary, performance_bonus, ai_equity_flag
- **`wellbeing_metrics`** (คุณภาพชีวิต - P7): id, employee_id, month, health_score, wealth_stability_flag, engagement_score, overtime_hours, fun_activity_participation
