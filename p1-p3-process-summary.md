# สรุปกระบวนการ P1-P3: ระบบรับสมัครงาน (Recruitment System)
**วันที่:** 31 กรกฎาคม 2569  
**โครงการ:** Web PP7 — ระบบบริหารบุคลากร PKG Group

---

## 📋 ภาพรวมกระบวนการ (End-to-End Flow)

```
┌─────────────────────────────────────────────────────────────────────────┐
│  P1: แสวงหา (Recruit) → P2: หยั่งประเมิน (Assess) → P3: จับคู่ (Match)  │
└─────────────────────────────────────────────────────────────────────────┘
```

### Flow หลัก 10 ขั้นตอน
1. **ขออัตรากำลังคน** (Headcount Request)
2. **เปิดรับสมัคร** (Job Posting)
3. **ผู้สมัครกรอกใบสมัคร** (Application Form)
4. **ทำแบบทดสอบ 4 ชุด** (Assessment Tests)
5. **AI วิเคราะห์คุณสมบัติ** (AI Analysis)
6. **คัดกรองผู้สมัคร** (Screening)
7. **นัดสัมภาษณ์** (Interview Scheduling)
8. **สัมภาษณ์** (Interview Execution)
9. **สรุปผลการสัมภาษณ์** (Interview Summary)
10. **ตัดสินใจรับ/ไม่รับ** (Hiring Decision)

---

## 🎯 P1: แสวงหา (Recruit / People Sourcing)

### วัตถุประสงค์
ค้นหาสมาชิกที่มี **Core Competency (CC)** ตรงกับความต้องการขององค์กร

### กระบวนการย่อย

#### 1.1 ขออัตรากำลังคน (Headcount Request)
**Input:**
- BU/Department: ตำแหน่งที่ต้องการ
- จำนวนอัตรา
- คุณสมบัติที่ต้องการ (Skills, CC, Experience)
- งบประมาณ (Salary Range)
- Urgency Level (ด่วน/ปกติ)

**Output:**
- ใบขออัตรากำลัง (Headcount Request Form)
- Approval Flow (Manager → HR → Director)

**Database Schema:**
```sql
P1_Headcount (
  id, bu_name, position, quantity, required_skills,
  required_cc, experience_years, salary_min, salary_max,
  urgency, status, request_date, approved_by, approved_date
)
```

#### 1.2 เปิดรับสมัคร (Job Posting)
**Input:**
- รายละเอียดตำแหน่ง (Job Description)
- คุณสมบัติ (Qualifications)
- สวัสดิการ (Benefits)
- สถานที่ทำงาน (Location)
- ช่องทางการรับสมัคร (Online/Offline)

**Output:**
- ประกาศตำแหน่งงาน (Job Posting)
- QR Code สำหรับสมัคร
- Link ไปที่หน้าสมัคร

**Database Schema:**
```sql
P1_JobPosting (
  id, headcount_id, title, description, qualifications,
  benefits, location, apply_url, qr_code, post_date,
  close_date, status, view_count, apply_count
)
```

#### 1.3 ผู้สมัครกรอกใบสมัคร (Application Form)
**Input:**
- ข้อมูลส่วนตัว (ชื่อ, อายุ, ที่อยู่, เบอร์โทร, อีเมล)
- การศึกษา (ระดับ, สถาบัน, สาขา, GPA)
- ประสบการณ์ทำงาน (บริษัท, ตำแหน่ง, ระยะเวลา)
- ทักษะ (Languages, Software, Certificates)
- เอกสารแนบ (Resume, Transcript, Certificate)

**Output:**
- ใบสมัครงาน (Application Form)
- Application ID
- สถานะ: "รอทำแบบทดสอบ"

**Database Schema:**
```sql
P1_Candidates (
  id, application_id, full_name, age, address, phone, email,
  education_level, institution, major, gpa, work_experience,
  skills, certificates, resume_url, transcript_url,
  apply_date, status, source
)
```

---

## 🎯 P2: หยั่งประเมิน (Assess / People Assessment)

### วัตถุประสงค์
ประเมินว่าผู้สมัครมี **CC (Core Competency)** ตรงกับองค์กรหรือไม่

### กระบวนการย่อย

#### 2.1 ทำแบบทดสอบ 4 ชุด (Assessment Tests)

**แบบทดสอบที่ 1: ทัศนคติ (Attitude Test)**
- จำนวน: 30 ข้อ
- เวลา: 30 นาที
- วัด: Growth Mindset, Service Mind, Teamwork, Integrity
- คะแนน: 0-100

**แบบทดสอบที่ 2: ทักษะ (Skill Test)**
- จำนวน: 40 ข้อ (ปรับตามตำแหน่ง)
- เวลา: 60 นาที
- วัด: Technical Skills, Problem Solving, Communication
- คะแนน: 0-100

**แบบทดสอบที่ 3: Core Competency 7 ด้าน (CC Test)**
- จำนวน: 70 ข้อ (10 ข้อ/CC)
- เวลา: 45 นาที
- วัด:
  - CC1: Servant Leadership
  - CC2: Adaptive Innovation
  - CC3: Trust-Based Value Creation
  - CC4: Consensus-Driven Teamwork
  - CC5: Disciplined Professionalism
  - CC6: Technology Mastery
  - CC7: Humor & Joy
- คะแนน: 0-100 (แต่ละ CC)

**แบบทดสอบที่ 4: 3E3P (Engagement, Empowerment, Enablement + Purpose, Passion, Pride)**
- จำนวน: 30 ข้อ
- เวลา: 20 นาที
- วัด:
  - 3E: Engagement, Empowerment, Enablement
  - 3P: Purpose, Passion, Pride
- คะแนน: 0-100

**Database Schema:**
```sql
P2_Assessments (
  id, candidate_id, test_type, test_date, start_time, end_time,
  total_questions, correct_answers, score, cc1_score, cc2_score,
  cc3_score, cc4_score, cc5_score, cc6_score, cc7_score,
  attitude_score, skill_score, e3p_score, status, ai_analysis
)
```

#### 2.2 AI วิเคราะห์คุณสมบัติ (AI Analysis)

**Input:**
- คะแนนแบบทดสอบ 4 ชุด
- ข้อมูลใบสมัคร
- Job Requirements

**AI Processing:**
```python
# Pseudo-code
def analyze_candidate(candidate, assessments, job_requirements):
    # 1. คำนวณ Overall Score
    overall_score = weighted_average(
        attitude=0.2, skill=0.3, cc=0.3, e3p=0.2
    )
    
    # 2. วิเคราะห์ CC Match
    cc_match = calculate_cc_alignment(
        candidate_cc_scores, job_required_cc
    )
    
    # 3. วิเคราะห์ Skill Gap
    skill_gap = identify_skill_gaps(
        candidate_skills, job_required_skills
    )
    
    # 4. สร้าง Recommendation
    recommendation = generate_recommendation(
        overall_score, cc_match, skill_gap
    )
    
    return {
        "overall_score": overall_score,
        "cc_match": cc_match,
        "skill_gap": skill_gap,
        "recommendation": recommendation,  # "ผ่าน" / "พิจารณา" / "ไม่ผ่าน"
        "strengths": [...],
        "concerns": [...],
        "suggested_interview_questions": [...]
    }
```

**Output:**
- Overall Score: 0-100
- CC Match Score: 0-100
- Skill Gap Analysis
- Recommendation: "ผ่าน" / "พิจารณา" / "ไม่ผ่าน"
- จุดแข็ง (Strengths)
- จุดที่ต้องพิจารณา (Concerns)
- คำถามสัมภาษณ์ที่แนะนำ

**Database Schema:**
```sql
P2_AIAnalysis (
  id, candidate_id, overall_score, cc_match_score,
  skill_gap_analysis, recommendation, strengths_json,
  concerns_json, suggested_questions_json, analysis_date,
  ai_model_version
)
```

#### 2.3 คัดกรองผู้สมัคร (Screening)

**Input:**
- AI Analysis Result
- Minimum Threshold (กำหนดโดย HR)
  - Overall Score ≥ 70
  - CC Match ≥ 75
  - Skill Gap ≤ 3 items

**Screening Logic:**
```python
def screen_candidate(ai_analysis, thresholds):
    if (ai_analysis.overall_score >= thresholds.min_overall and
        ai_analysis.cc_match >= thresholds.min_cc_match and
        len(ai_analysis.skill_gap) <= thresholds.max_skill_gap):
        return "ผ่าน"
    elif (ai_analysis.overall_score >= thresholds.min_overall - 10):
        return "พิจารณาเพิ่มเติม"
    else:
        return "ไม่ผ่าน"
```

**Output:**
- Status: "ผ่าน" / "พิจารณาเพิ่มเติม" / "ไม่ผ่าน"
- HR Review Notes
- Decision: "นัดสัมภาษณ์" / "รอ" / "ปฏิเสธ"

**Database Schema:**
```sql
P2_Screening (
  id, candidate_id, screening_date, screener_id,
  overall_score, cc_match_score, skill_gap_count,
  screening_result, hr_notes, decision, decision_date
)
```

#### 2.4 นัดสัมภาษณ์ (Interview Scheduling)

**Input:**
- Candidate ID
- Interviewer List (HR Manager, BU Manager, Team Lead)
- Available Time Slots
- Interview Type (Online/Onsite)
- Location/Meeting Link

**Output:**
- Interview Schedule
- Notification (Email + SMS + Telegram)
- Calendar Invitation

**Database Schema:**
```sql
P2_InterviewSchedule (
  id, candidate_id, interview_date, start_time, end_time,
  interviewer_ids, interview_type, location, meeting_link,
  status, reminder_sent, reschedule_count
)
```

#### 2.5 สัมภาษณ์ (Interview Execution)

**ฟอร์มสัมภาษณ์ (Interview Form):**

**ส่วนที่ 1: ข้อมูลทั่วไป**
- ชื่อผู้สมัคร
- ตำแหน่งที่สมัคร
- วันที่สัมภาษณ์
- ผู้สัมภาษณ์

**ส่วนที่ 2: ประเมินตาม CC 7 ด้าน**
- CC1: Servant Leadership (1-5 คะแนน)
- CC2: Adaptive Innovation (1-5 คะแนน)
- CC3: Trust-Based Value Creation (1-5 คะแนน)
- CC4: Consensus-Driven Teamwork (1-5 คะแนน)
- CC5: Disciplined Professionalism (1-5 คะแนน)
- CC6: Technology Mastery (1-5 คะแนน)
- CC7: Humor & Joy (1-5 คะแนน)

**ส่วนที่ 3: ประเมินทักษะ**
- Technical Skills (1-5 คะแนน)
- Communication Skills (1-5 คะแนน)
- Problem Solving (1-5 คะแนน)
- Teamwork (1-5 คะแนน)

**ส่วนที่ 4: คำถามพฤติกรรม (Behavioral Questions)**
- เล่าประสบการณ์การทำงานเป็นทีม
- เล่าประสบการณ์การแก้ปัญหาที่ยาก
- เล่าประสบการณ์การปรับตัวกับการเปลี่ยนแปลง
- เล่าประสบการณ์การให้บริการลูกค้า

**ส่วนที่ 5: คำถามตามตำแหน่ง (Position-Specific Questions)**
- (ปรับตามตำแหน่งที่สมัคร)

**ส่วนที่ 6: ทัศนคติและวัฒนธรรม**
- ความเข้าใจในค่านิยมองค์กร
- แรงจูงใจในการทำงาน
- เป้าหมายอาชีพ

**ส่วนที่ 7: สรุปผลการสัมภาษณ์**
- จุดแข็ง
- จุดที่ต้องพัฒนา
- ความเหมาะสมกับตำแหน่ง (1-10)
- ความเหมาะสมกับวัฒนธรรมองค์กร (1-10)
- คำแนะนำ (รับ/ไม่รับ/พิจารณาเพิ่มเติม)
- ความคิดเห็นเพิ่มเติม

**Database Schema:**
```sql
P2_Interviews (
  id, candidate_id, interview_date, interviewer_id,
  cc1_score, cc2_score, cc3_score, cc4_score, cc5_score,
  cc6_score, cc7_score, technical_score, communication_score,
  problem_solving_score, teamwork_score, behavioral_notes,
  position_questions_notes, attitude_score, culture_fit_score,
  overall_recommendation, strengths, concerns, final_notes,
  interview_status
)
```

#### 2.6 สรุปผลการสัมภาษณ์ (Interview Summary)

**Input:**
- Interview Form Results (จากผู้สัมภาษณ์ทุกคน)
- Assessment Test Scores
- AI Analysis

**Summary Report:**
```markdown
# สรุปผลการสัมภาษณ์

## ข้อมูลผู้สมัคร
- ชื่อ: [ชื่อ]
- ตำแหน่ง: [ตำแหน่ง]
- วันที่สัมภาษณ์: [วันที่]
- ผู้สัมภาษณ์: [รายชื่อ]

## คะแนนรวม
- แบบทดสอบ: 85/100
- สัมภาษณ์ (CC): 4.2/5.0
- สัมภาษณ์ (ทักษะ): 4.5/5.0
- Overall Score: 87/100

## จุดแข็ง
- [จุดแข็ง 1]
- [จุดแข็ง 2]
- [จุดแข็ง 3]

## จุดที่ต้องพิจารณา
- [จุดที่ต้องพิจารณา 1]
- [จุดที่ต้องพิจารณา 2]

## ความเหมาะสม
- กับตำแหน่ง: 9/10
- กับวัฒนธรรมองค์กร: 8/10

## คำแนะนำ
✅ รับเข้าทำงาน
⚠️ พิจารณาเพิ่มเติม
❌ ไม่รับ

## ความคิดเห็นเพิ่มเติม
[ความคิดเห็นจากผู้สัมภาษณ์]
```

**Database Schema:**
```sql
P2_InterviewSummary (
  id, candidate_id, summary_date, test_score_avg,
  interview_cc_avg, interview_skill_avg, overall_score,
  strengths_json, concerns_json, position_fit_score,
  culture_fit_score, recommendation, interviewer_comments,
  final_decision, decided_by, decided_date
)
```

---

## 🎯 P3: จับคู่คนกับงาน (Match / Position Matching)

### วัตถุประสงค์
ประเมินว่าผู้สมัครที่ผ่าน P2 แล้ว เหมาะกับงานนี้หรือไม่ (ประเมินก่อนทำงาน)

### กระบวนการย่อย

#### 3.1 วิเคราะห์ความเหมาะสม (Fit Analysis)

**Input:**
- Candidate Profile (จาก P1, P2)
- Job Description (JD)
- Level of Interaction & Authority (LIA)

**Fit Analysis:**
```python
def analyze_fit(candidate, job_description, lia):
    # 1. Skills Match
    skills_match = calculate_skills_match(
        candidate.skills, job_description.required_skills
    )
    
    # 2. CC Match
    cc_match = calculate_cc_match(
        candidate.cc_scores, job_description.required_cc
    )
    
    # 3. Experience Match
    experience_match = calculate_experience_match(
        candidate.experience_years, job_description.min_experience
    )
    
    # 4. LIA Compatibility
    lia_compatibility = check_lia_compatibility(
        candidate.personality, lia
    )
    
    # 5. Calculate Match Score
    match_score = weighted_average(
        skills=0.3, cc=0.4, experience=0.2, lia=0.1
    )
    
    return {
        "match_score": match_score,
        "skills_match": skills_match,
        "cc_match": cc_match,
        "experience_match": experience_match,
        "lia_compatibility": lia_compatibility,
        "gap_analysis": identify_gaps(),
        "recommendation": generate_recommendation()
    }
```

**Output:**
- Match Score: 0-100
- Skills Match: 0-100
- CC Match: 0-100
- Experience Match: 0-100
- LIA Compatibility: High/Medium/Low
- Gap Analysis
- Recommendation: "เหมาะสมมาก" / "เหมาะสม" / "ควรพิจารณา" / "ไม่เหมาะสม"

**Database Schema:**
```sql
P3_Matching (
  id, candidate_id, job_id, match_date, match_score,
  skills_match_score, cc_match_score, experience_match_score,
  lia_compatibility, gap_analysis_json, recommendation,
  hr_notes, approval_status, approved_by, approved_date
)
```

#### 3.2 เสนอตำแหน่ง (Job Offer)

**Input:**
- Match Result
- Salary Range (จาก Headcount Request)
- Benefits Package
- Start Date

**Output:**
- Job Offer Letter
- Salary & Benefits Details
- Start Date
- Reporting To

**Database Schema:**
```sql
P3_JobOffer (
  id, candidate_id, matching_id, offer_date, position,
  salary, benefits_json, start_date, reporting_to,
  offer_status, accepted_date, rejected_reason,
  expiry_date
)
```

#### 3.3 ตรวจสอบประวัติ (Background Check)

**Input:**
- Candidate Consent
- Education Verification
- Employment Verification
- Reference Check
- Criminal Record Check (ถ้ามี)

**Output:**
- Background Check Report
- Pass/Fail Status
- Notes

**Database Schema:**
```sql
P3_BackgroundCheck (
  id, candidate_id, check_date, education_verified,
  employment_verified, reference_check_result,
  criminal_check_result, overall_status, notes,
  checked_by, checked_date
)
```

#### 3.4 นัดเริ่มงาน (Onboarding Schedule)

**Input:**
- Accepted Offer
- Onboarding Schedule
- Required Documents
- Orientation Program

**Output:**
- Onboarding Schedule
- Document Checklist
- Welcome Package

**Database Schema:**
```sql
P3_Onboarding (
  id, candidate_id, job_offer_id, start_date,
  orientation_date, documents_required_json,
  documents_submitted_json, onboarding_status,
  assigned_buddy, training_schedule_json
)
```

---

## 📊 สถิติ Funnel (Conversion Metrics)

```
ผู้สมัครทั้งหมด: 100%
    ↓
ผ่านแบบทดสอบ: 65%
    ↓
ผ่าน AI Analysis: 45%
    ↓
ผ่าน Screening: 30%
    ↓
นัดสัมภาษณ์: 25%
    ↓
ผ่านสัมภาษณ์: 18%
    ↓
รับเข้าทำงาน: 12.4% (Conversion Rate)
```

**KPIs:**
- Conversion Rate: 12.4%
- Avg Time-to-Hire: 18 วัน
- Offer Accept Rate: 82.4%
- Background Check Pass: 94%

---

## 🔗 Data Flow ระหว่าง P

```
P1 (แสวงหา)
    ↓
    ├── Headcount Request → P1_Headcount
    ├── Job Posting → P1_JobPosting
    └── Candidates → P1_Candidates
         ↓
P2 (หยั่งประเมิน)
    ├── Assessments → P2_Assessments
    ├── AI Analysis → P2_AIAnalysis
    ├── Screening → P2_Screening
    ├── Interview Schedule → P2_InterviewSchedule
    ├── Interviews → P2_Interviews
    └── Interview Summary → P2_InterviewSummary
         ↓
P3 (จับคู่คนกับงาน)
    ├── Matching → P3_Matching
    ├── Job Offer → P3_JobOffer
    ├── Background Check → P3_BackgroundCheck
    └── Onboarding → P3_Onboarding
         ↓
P4 (ประเมินผล) — หลังทำงาน
```

---

## 🎨 UI/UX Requirements

### หน้าผู้สมัคร (Candidate Portal)
1. **Landing Page**
   - Hero: "ร่วมงานกับ PKG Group"
   - 3 จุดเด่น (AI คัดกรอง, รวดเร็ว, ติดตามสถานะ)
   - 4 ขั้นตอนการสมัคร
   - ปุ่ม "สมัครงานออนไลน์"

2. **Application Form**
   - Multi-step form (4 steps)
   - Progress bar
   - Auto-save
   - File upload (Resume, Transcript)

3. **Assessment Tests**
   - Timer
   - Progress indicator
   - Auto-submit เมื่อหมดเวลา
   - Cannot go back (ป้องกันการโกง)

4. **Dashboard ผู้สมัคร**
   - Timeline สถานะ (สมัคร → ทำแบบทดสอบ → สัมภาษณ์ → ผล)
   - คะแนน AI (แสดงเป็น %)
   - สถานะการนัดสัมภาษณ์
   - Notification (Email + SMS + Telegram)

### หน้า HR (HR Portal)
1. **Dashboard HR**
   - สรุปจำนวนผู้สมัคร (ทั้งหมด, รอทำแบบทดสอบ, รอสัมภาษณ์, รับแล้ว)
   - Funnel Chart
   - Pending Tasks
   - Upcoming Interviews

2. **คัดกรองผู้สมัคร**
   - List ผู้สมัครทั้งหมด
   - Filter by Status, Position, Score
   - Sort by Score, Date
   - AI Recommendation Badge (ผ่าน/พิจารณา/ไม่ผ่าน)

3. **นัดสัมภาษณ์**
   - Calendar View
   - Drag & Drop to Schedule
   - Auto-send Notification
   - Assign Interviewers

4. **ฟอร์มสัมภาษณ์**
   - Digital Form (7 ส่วน)
   - Real-time scoring
   - Auto-calculate average
   - Save & Submit

5. **สรุปผลการสัมภาษณ์**
   - Summary Report
   - Comparison Chart (ผู้สมัครหลายคน)
   - Decision Buttons (รับ/ไม่รับ/พิจารณาเพิ่มเติม)
   - Generate Offer Letter

---

## 🔐 Security & Privacy

1. **Data Encryption**
   - ข้อมูลส่วนตัว: Encrypt at rest
   - Password: Hash with bcrypt
   - API: HTTPS only

2. **Access Control**
   - ผู้สมัคร: ดูข้อมูลตัวเองเท่านั้น
   - HR: ดู/แก้ไขข้อมูลผู้สมัครทั้งหมด
   - Interviewer: ดูข้อมูลผู้สมัครที่สัมภาษณ์เท่านั้น
   - Manager: ดูรายงานสรุปเท่านั้น

3. **Privacy Compliance**
   - PDPA (Thailand)
   - Consent Management
   - Data Retention Policy (1 ปี)
   - Right to Erasure

---

## 📝 สิ่งที่ต้องทำต่อ

### Phase 1: Database & Backend
- [ ] สร้าง Database Schema ทั้งหมด
- [ ] สร้าง API Endpoints
- [ ] Implement AI Analysis Logic
- [ ] Implement Screening Logic
- [ ] Implement Fit Analysis Logic

### Phase 2: Frontend
- [ ] สร้าง Landing Page
- [ ] สร้าง Application Form
- [ ] สร้าง Assessment Tests
- [ ] สร้าง Candidate Dashboard
- [ ] สร้าง HR Dashboard
- [ ] สร้าง Interview Form
- [ ] สร้าง Interview Summary

### Phase 3: Integration
- [ ] เชื่อมต่อ Google Sheets (Import/Export)
- [ ] ส่ง Email Notification
- [ ] ส่ง SMS Notification
- [ ] ส่ง Telegram Notification
- [ ] สร้าง Calendar Integration

### Phase 4: Testing
- [ ] Unit Testing
- [ ] Integration Testing
- [ ] User Acceptance Testing (UAT)
- [ ] Performance Testing
- [ ] Security Testing

### Phase 5: Deployment
- [ ] Deploy to Production
- [ ] Training HR Team
- [ ] Training Interviewers
- [ ] User Documentation
- [ ] Go Live

---

## 📚 เอกสารอ้างอิง

1. **Core Competency (CC) 7 ด้าน** — ดูที่ MEMORY.md
2. **3E3P Framework** — Engagement, Empowerment, Enablement + Purpose, Passion, Pride
3. **LIA (Level of Interaction & Authority)** — ระดับการติดต่อสื่อสารและอำนาจตัดสินใจ
4. **PDPA (Personal Data Protection Act)** — พ.ร.บ. คุ้มครองข้อมูลส่วนบุคคล

---

**สรุปโดย:** KiloClaw 🦾  
**วันที่:** 31 กรกฎาคม 2569
