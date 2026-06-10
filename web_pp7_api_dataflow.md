# Web PP7 Data Flow & API Design (Draft v1)

เอกสารนี้อธิบายการไหลของข้อมูล (Data Flow) ระหว่างโมดูล P1-P7 และจุดเชื่อมต่อ (Integration Points) กับ AI Core Engine

## 1. ภาพรวม Data Flow (High-Level)
```text
[P1 แสวงหา] → (Candidate Data) → [P2 ประเมินก่อนรบ]
                                     ↓ (Pass Score)
[P7 คุณภาพชีวิต] ← (Feedback Loop) [P6 ค่าตอบแทน] ← (Performance Data) ← [P4 ประเมินผล]
       ↑                                   ↑                              ↑
       └────────── (Retention Insights) ───┴──────── (Dev Plan) ─────── [P5 พัฒนา] ← (Match Data) ← [P3 จับคู่]
       
       ↕ (ทุกขั้นตอนมีการส่งข้อมูลสองทางกับ AI Core Engine เพื่อวิเคราะห์และให้คำแนะนำ)
```

## 2. API Endpoints หลัก (RESTful Design)

### 2.1 Authentication & Base
- `POST /api/v1/auth/login` - JWT Token สำหรับ Admin/Manager/Employee

### 2.2 P4: Performance Evaluation (ตัวอย่างเชิงลึก)
- `GET /api/v1/evaluations/cycles` - ดึงรายการรอบการประเมินที่เปิดอยู่
- `POST /api/v1/evaluations` - สร้างรายการประเมินใหม่สำหรับพนักงาน
- `GET /api/v1/evaluations/{id}/360-items` - ดึงรายละเอียดการประเมิน 360 องศา
- `POST /api/v1/evaluations/{id}/360-items` - บันทึกผลการประเมิน (บังคับใส่ `evidence_links` หากคะแนนต่ำกว่าเกณฑ์)
- `GET /api/v1/evaluations/{id}/ai-insights` - **AI Integration Point**: ดึงสรุปจุดแข็ง-จุดอ่อนจาก AI Core

### 2.3 AI Core Engine Integration Points
- `POST /api/v1/ai/analyze-match` (ใช้โดย P3)
  - **Request**: `{ "candidate_skills": [...], "position_requirements": {...} }`
  - **Response**: `{ "match_score": 85, "gaps": ["CC5"], "recommendation": "..." }`
- `POST /api/v1/ai/generate-dev-plan` (ใช้โดย P5)
  - **Request**: `{ "employee_id": "uuid", "weak_cc": "CC5", "evaluation_notes": "..." }`
  - **Response**: `{ "suggested_actions": ["เข้าอบรม Time Management", "Mentoring กับ Senior"], "estimated_duration": "3 months" }`
- `POST /api/v1/ai/predict-flight-risk` (ใช้โดย P7)
  - **Request**: `{ "employee_id": "uuid", "wellbeing_metrics": {...}, "compensation_history": {...} }`
  - **Response**: `{ "risk_level": "HIGH", "factors": ["Overtime > 20hrs/mo", "No salary adjustment in 2 years"] }`

## 3. กฎการไหลของข้อมูล (Data Flow Rules)
1. **Evidence-First Rule (P4)**: ระบบจะไม่ยอมให้ Submit การประเมิน 360 องศาได้ หากช่อง `evidence_links` ว่างเปล่า และคะแนนต่ำกว่า 3.5 (เพื่อแก้ปัญหาการประเมินจาก "ความรู้สึก")
2. **Cascade Update**: เมื่อ P4 ประเมินเสร็จและสถานะเป็น `Closed` → ระบบจะ Trigger สร้าง Draft `development_plans` (P5) อัตโนมัติผ่าน AI
3. **Feedback Loop**: ข้อมูล `wellbeing_metrics` (P7) ที่แสดงแนวโน้มเชิงลบ จะถูกส่งเป็น Alert ไปยัง Manager Dashboard และแนะนำการปรับ Matching (P3) หรือ Compensation (P6)

## 4. เทคโนโลยีที่แนะนำ (Tech Stack Proposal)
- **Backend**: Node.js (NestJS) หรือ Python (FastAPI) - เหมาะกับงาน Data Processing และ AI Integration
- **Database**: PostgreSQL (รองรับ JSONB สำหรับเก็บ evidence_links และ ai_insights ได้ดี)
- **Frontend**: React.js หรือ Vue.js + Tailwind CSS (ตาม Prototype ที่สร้างไว้)
- **AI Core**: OpenClaw Sub-agent / Custom LLM Pipeline ที่เชื่อมต่อกับฐานข้อมูลผ่าน API