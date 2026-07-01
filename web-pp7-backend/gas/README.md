# Web PP7 — Google Apps Script Backend

**สถานะ:** ✅ สร้าง code เสร็จแล้ว — 65 KB / 4,340 lines  
**Sheet ID:** `10x3pRnMvdEI8B3ZsMxpT905rMhtJARx_Wtx7ptcbmVU`  
**Account:** K3105947@gmail.com

---

## 📁 ไฟล์

| ไฟล์ | ขนาด | รายละเอียด |
|------|------|------------|
| `Code.gs` | 13 KB | Main router (doGet/doPost) + CORS |
| `Database.gs` | 14 KB | CRUD operations (list/get/create/update/soft-delete) |
| `Utils.gs` | 16 KB | Validations, helpers, CC calculator |
| `Services.gs` | 23 KB | Business logic, workflows, cross-process flows |
| **รวม** | **65 KB** | **4,340 lines** |

---

## 🚀 ขั้นตอน Deploy

### 1. สร้าง Apps Script Project
- ไปที่ https://script.google.com
- Login: K3105947@gmail.com
- กด **"โปรเจกต์ใหม่"**
- ตั้งชื่อ: `Web PP7 Backend`

### 2. สร้างไฟล์ .gs (4 ไฟล์)
- กด **"+"** → **Script** → ตั้งชื่อ `Code.gs` → paste โค้ดจาก `Code.gs`
- ทำซ้ำสำหรับ `Database.gs`, `Utils.gs`, `Services.gs`

### 3. Deploy เป็น Web App
- กด **"Deploy"** → **"New Deployment"**
- Type: **"Web App"**
- Execute as: **"Me"** (K3105947@gmail.com)
- Who has access: **"Anyone"** (หรือเฉพาะโดเมน)
- กด **"Deploy"**

### 4. Copy Web App URL
- URL ตัวอย่าง: `https://script.google.com/macros/s/AKfycbxXXX...`
- ส่ง URL นี้ให้ KiloClaw เพื่อทำ API bridge

---

## 🔌 API Endpoints

### GET
```
action=list&table=members         → รายการสมาชิกทั้งหมด
action=get&table=members&id=M-0001 → ดึงข้อมูล 1 รายการ
action=search&table=members&field=full_name&query=Test  → ค้นหา
action=count&table=members        → นับจำนวน
action=schema&table=members       → ดูโครงสร้างตาราง
action=tables                     → ดูรายชื่อตารางทั้งหมด
action=ping                       → ทดสอบระบบ
```

### POST (JSON body)
```json
{
  "action": "create",
  "table": "members",
  "data": { "emp_code": "EMP001", "full_name": "ทดสอบ", "bu": "PKG" }
}
{
  "action": "update",
  "table": "members",
  "id": "M-0001",
  "data": { "phone": "0812345678" }
}
{
  "action": "delete",
  "table": "members",
  "id": "M-0001"
}
```

---

## 📊 Tables (10 tabs)

| Table | Columns | Description |
|-------|:-------:|-------------|
| `members` | 16 | Member data + CC scores |
| `p1_headcount` | 15 | Headcount requests |
| `p1_candidates` | 18 | Candidate applications |
| `p2_interviews` | 14 | Interview records |
| `p2_assessments` | 17 | CC assessments |
| `p3_matching` | 16 | Position matching |
| `p4_evaluations` | 17 | Performance evaluations |
| `p5_development` | 16 | Development plans |
| `p6_salary` | 16 | Salary & payroll |
| `p7_wellbeing` | 17 | Wellbeing surveys |

---

## 🎯 Services (Business Logic)

### P1-Recruitment Workflow
- `submitHeadcount()` → `decideHeadcount()` → `addCandidate()` → `advanceCandidate()` → `onboardHiredCandidate()`

### P2-Assessment
- `submitAssessment(candidate_id, scores, assessor)` — auto-calculate CC total, pass/fail

### P4-Evaluation
- `createEvaluation()` → `submitEvalScores()` → `approveEvaluation()`

### P5-Development
- `createDevPlan()` → `updateDevProgress()` (auto-complete at 100%)

### P6-Compensation
- `createSalary()` → auto-calculate deductions/net → `approvePayroll()`

### P7-Wellbeing
- `submitWellbeingSurvey()` → `addWellbeingFollowUp()`

---

## ⚠️ ข้อมูลที่ต้องรอจาก ปกรณ์ (เมื่อหายป่วย)

1. **ชื่อทีมผู้ปฏิบัติงานแต่ละ P** (bu_manager role assignments)
2. **ข้อมูลจริงสำหรับ import** (members, salary data, evaluation results)
3. **Decision: Access level** — deploy เป็น "Anyone" หรือเฉพาะโดเมน?

---

**สร้างโดย:** KiloClaw 🦾  
**วันที่:** 27 มิ.ย. 2569  
**เวอร์ชัน:** 1.0
