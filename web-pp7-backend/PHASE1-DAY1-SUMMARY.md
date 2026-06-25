# PP7 Web Backend — Phase 1 Day 1 Summary

> สร้างเมื่อ: 2025-06-25
> สถานะ: ✅ สำเร็จ

---

## 📋 ไฟล์ที่สร้างทั้งหมด

| # | ไฟล์ | ขนาด | คำอธิบาย |
|---|------|------|----------|
| 1 | `DATABASE_SCHEMA_FULL.md` | ~22 KB | โครงสร้างข้อมูลทั้งหมด 27 Tables (P1-P7 + Common) |
| 2 | `Database.gs` | ~19 KB | CRUD helper สำหรับ Google Sheets |
| 3 | `Auth.gs` | ~12 KB | Token auth + RBAC 6 roles |
| 4 | `Setup.gs` | ~13 KB | สร้าง sheets + seed data |
| 5 | `Code.gs` | ~13 KB | Main API Router |
| 6 | `api-adapter.js` | ~12 KB | Frontend bridge (fetch API → GAS) |

**รวม: 6 ไฟล์, ~91 KB**

---

## 📊 Database Schema — 27 Tables

### Common Tables (6)
| Sheet Name | Table | คำอธิบาย |
|------------|-------|----------|
| DB_employees | employees | ข้อมูลพนักงานทั้งหมด |
| DB_business_units | business_units | หน่วยธุรกิจ (TH/LA/KH) |
| DB_departments | departments | แผนกภายใน BU |
| DB_users | users | ผู้ใช้งานระบบ |
| DB_roles | roles | สิทธิ์และ permissions |
| DB_audit_log | audit_log | บันทึกการใช้งาน |

### P1 — แสวงหา (3 tables)
| Sheet Name | Table | คำอธิบาย |
|------------|-------|----------|
| P1_headcount_requests | headcount_requests | คำขออัตรากำลัง |
| P1_candidates | candidates | ผู้สมัครงาน |
| P1_recruitment_sources | recruitment_sources | แหล่งที่มาผู้สมัคร |

### P2 — หยั่งประเมิน (3 tables)
| Sheet Name | Table | คำอธิบาย |
|------------|-------|----------|
| P2_interviews | interviews | การจอง/ผลสัมภาษณ์ |
| P2_assessment_results | assessment_results | ผลการทดสอบ |
| P2_competency_scores | competency_scores | คะแนนสมรรถนะ |

### P3 — จับคู่คนกับงาน (2 tables)
| Sheet Name | Table | คำอธิบาย |
|------------|-------|----------|
| P3_position_matching | position_matching | จับคู่ผู้สมัครกับตำแหน่ง |
| P3_employee_assignments | employee_assignments | การมอบหมายงาน |

### P4 — ประเมินผล (3 tables)
| Sheet Name | Table | คำอธิบาย |
|------------|-------|----------|
| P4_performance_evaluations | performance_evaluations | การประเมินผลงาน |
| P4_evaluation_360 | evaluation_360 | ประเมิน 360 องศา |
| P4_annual_credit | annual_credit | เครดิตประจำปี (เงินเดือน/โบนัส) |

### P5 — พัฒนา (3 tables)
| Sheet Name | Table | คำอธิบาย |
|------------|-------|----------|
| P5_development_plans | development_plans | แผนพัฒนาบุคลากร |
| P5_training_records | training_records | บันทึกการอบรม |
| P5_skill_gaps | skill_gaps | ช่องว่างทักษะ |

### P6 — ค่าตอบแทน (3 tables)
| Sheet Name | Table | คำอธิบาย |
|------------|-------|----------|
| P6_salary_records | salary_records | ประวัติเงินเดือน |
| P6_incentives | incentives | โบนัส/แรงจูงใจ |
| P6_benefits | benefits | สวัสดิการ |

### P7 — คุณภาพชีวิต (3 tables)
| Sheet Name | Table | คำอธิบาย |
|------------|-------|----------|
| P7_wellbeing_records | wellbeing_records | บันทึกความเป็นอยู่ |
| P7_health_records | health_records | บันทึกสุขภาพ |
| P7_engagement_surveys | engagement_surveys | แบบสำรวจความผูกพัน |

---

## 🔐 RBAC — Role-Based Access Control

| Role | Dashboard | P1 | P2 | P3 | P4 | P5 | P6 | P7 | Users | Audit | ข้อจำกัด |
|------|-----------|----|----|----|----|----|----|----|-------|-------|---------|
| **admin** | ✅ | ✅RW | ✅RW | ✅RW | ✅RW | ✅RW | ✅RW | ✅RW | ✅RW | ✅R | ไม่มีข้อจำกัด |
| **hr_manager** | ✅ | ✅RW | ✅RW | ✅RW | ✅RW | ✅RW | ✅RW | ✅RW | ❌W | ❌ | จัดการ users ไม่ได้ |
| **bu_manager** | ✅ | ✅RW | ✅RW | ✅RW | ✅RW | ❌ | ❌ | ❌ | ❌ | ❌ | เฉพาะ BU ตัวเอง |
| **employee** | ✅ | ❌ | ❌ | ❌ | ✅R | ✅R | ✅R | ✅R | ❌ | ❌ | ดูเฉพาะตัวเอง |
| **auditor** | ✅ | ✅R | ✅R | ✅R | ✅R | ✅R | ✅R | ✅R | ❌ | ✅R | read-only ทั้งหมด |
| **guest** | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ดู Dashboard เท่านั้น |

---

## 🔧 API Endpoints

### Auth
```
POST  /api/auth/login       → { email, password } → { token, user }
POST  /api/auth/logout      → { token } → { success }
GET   /api/auth/validate    → { token } → { user }
```

### Dashboard
```
GET   /api/dashboard        → summary stats
```

### CRUD (สำหรับทุก module)
```
GET    /api/api/{module}           → list (paginate, filter, search)
GET    /api/api/{module}/{id}      → get one
POST   /api/api/{module}           → create
PUT    /api/api/{module}/{id}      → update
DELETE /api/api/{module}/{id}      → soft delete
```

### Modules:
`headcount_requests`, `candidates`, `recruitment_sources`, `interviews`, `assessment_results`, `competency_scores`, `position_matching`, `employee_assignments`, `performance_evaluations`, `evaluation_360`, `annual_credit`, `development_plans`, `training_records`, `skill_gaps`, `salary_records`, `incentives`, `benefits`, `wellbeing_records`, `health_records`, `engagement_surveys`, `employees`, `business_units`, `departments`, `users`, `audit_log`

---

## 🚀 วิธี Deploy

### 1. สร้าง Project
1. ไปที่ https://script.google.com
2. สร้าง Project ใหม่ "PP7 HRMS Backend"
3. คัดลอก Code.gs, Database.gs, Auth.gs, Setup.gs เข้าไป (แต่ละไฟล์เป็น .gs file)

### 2. สร้าง Frontend Project
1. คัดลอก api-adapter.js ไปที่ frontend project

### 3. สร้าง Database
1. ใน Apps Script Editor → เลือก function `createAllTables`
2. รัน → จะสร้าง Spreadsheet ใหม่พร้อม 27 sheets
3. SPREADSHEET_ID จะถูกบันทึกอัตโนมัติใน Script Properties

### 4. Deploy
1. Deploy → New Deployment → Web App
2. Execute as: Me
3. Who has access: Anyone (or specific domain)
4. คัดลอก Web App URL มาใส่ใน `PP7API_CONFIG.BASE_URL`

### 5. Login ครั้งแรก
- Email: `admin@pp7.local`
- Password: `admin123`

---

## 📐 Architecture

```
┌─────────────────────────────────────────────┐
│              Frontend (HTML + Tailwind)       │
│  ┌─────────────────────────────────────┐    │
│  │         api-adapter.js               │    │
│  │  (PP7API / PP7GASBridge)             │    │
│  └────────────────┬────────────────────┘    │
└───────────────────┼─────────────────────────┘
                    │ fetch / google.script.run
                    ▼
┌─────────────────────────────────────────────┐
│           Google Apps Script Backend         │
│  ┌──────────┐  ┌────────┐  ┌──────────┐   │
│  │ Code.gs  │→ │ Auth.gs│→ │Database.gs│   │
│  │ (Router) │  │  (RBAC)│  │  (CRUD)  │   │
│  └──────────┘  └────────┘  └──────────┘   │
│                      │                       │
│              ┌───────┴──────────┐           │
│              │    Setup.gs      │           │
│              │  (create tables) │           │
│              └───────┬──────────┘           │
└──────────────────────┼──────────────────────┘
                       ▼
┌─────────────────────────────────────────────┐
│           Google Sheets (Database)           │
│  ┌─────┐ ┌─────┐ ┌─────┐     ┌─────┐     │
│  │ DB_ │ │ P1_ │ │ P2_ │ ... │ P7_ │     │
│  │ 27 sheets │                               │
│  └─────┘ └─────┘ └─────┘     └─────┘     │
└─────────────────────────────────────────────┘
```

---

## 📝 Common Fields (ทุก Table)

ทุก record จะมี:
- `id` — UUID (auto-generated)
- `created_at` — ISO datetime
- `updated_at` — ISO datetime
- `created_by` — email ของผู้สร้าง
- `status` — active / inactive / archived / pending
- `country` — TH / LA / KH

---

## ⏭️ Next Steps (Phase 1 Day 2+)

1. **เชื่อม Frontend เดิม** (index.html 4197 lines) กับ api-adapter.js
2. **สร้าง UI สำหรับ Login** + Role-based navigation
3. **ทดสอบ API endpoints** กับ frontend
4. **เพิ่ม Validation** สำหรับแต่ละ module
5. **เชื่อมต่อ Dashboard** (จากเดิมที่ static → dynamic)
6. **Export/Import** ข้อมูลจาก Excel

---

*PP7 Web Backend Foundation — Phase 1 Day 1 Complete ✅*
