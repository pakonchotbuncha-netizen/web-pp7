# P1 System Design — ระบบแสวงหา (Recruitment)
**Web PP7 | LDC-PAO**

---

## 1. ภาพรวม System Architecture P1

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                          P1 — แสวงหา (Recruitment Pipeline)                          │
│                                                                                     │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐      │
│  │  Step 1  │───▶│  Step 2  │───▶│  Step 3  │───▶│  Step 4  │───▶│  Step 5  │      │
│  │ ขออัตรา  │    │ เปิดรับ  │    │ รับใบ    │    │ คัดเลือก │    │ สรุปผล+  │      │
│  │ กำลัง    │    │ สมัคร    │    │ สมัคร    │    │          │    │ บรรจุ    │      │
│  └────┬─────┘    └────┬─────┘    └────┬─────┘    └────┬─────┘    └────┬─────┘      │
│       │               │               │               │               │             │
│  ┌────▼─────┐    ┌────▼─────┐    ┌────▼─────┐    ┌────▼─────┐    ┌────▼─────┐      │
│  │ headcount│    │ job_post │    │candidates│    │ stage    │    │ hired    │      │
│  │_requests │    │  (new)   │    │   (new)  │    │ update   │    │ status   │      │
│  └──────────┘    └──────────┘    │ + sources│    │ pipeline │    │ →P2/P4   │      │
│                                  └──────────┘    └──────────┘    └──────────┘      │
│                                                                                     │
│  ═══════════════════ ฐานข้อมูลอ้างอิง ═══════════════════                            │
│  ┌────────────┐  ┌──────────────┐  ┌────────┐  ┌───────┐                           │
│  │business_   │  │ departments  │  │ roles  │  │ users │                           │
│  │  units     │  │              │  │        │  │       │                           │
│  │ (บริษัท/BU)│  │ (แผนก/ทีม)  │  │ (บทบาท)│  │(login)│                           │
│  └────────────┘  └──────────────┘  └────────┘  └───────┘                           │
│                                                                                     │
│  ═══════════════════ Hand-over ═══════════════════                                  │
│  ┌──────────────────────┐     ┌──────────────────────┐                              │
│  │  ส่งต่อ P2 (หยั่ง     │     │  ส่งต่อ P4 (เซ็ต      │                              │
│  │  ประเมิน)            │     │  สมาชิกใหม่)         │                              │
│  │  • candidate data    │     │  • → employees table │                              │
│  │  • screening notes   │     │  • hire_date         │                              │
│  │  • resume/PDPA       │     │  • position/level    │                              │
│  └──────────────────────┘     │  • department_id     │                              │
│                                └──────────────────────┘                              │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

### Flow ตามต้นฉบับ BCT PPP7
```
ใบ kryeer ขออัตตรากำลังพล
    │
    ▼
ฐานข้อมูล kryeer ขออัตรากำลังคน (headcount_requests)
    │
    ▼
ฐานข้อมูล ใบสมัครงาน → ใบสมัครงาน PKG (candidates)
    │
    ▼
ฐานข้อมูล สมาชิก (employees)
    │
    ▼
ส่งต่อ P4 PAO เซ็ตสมาชิกใหม่
```

---

## 2. Step-by-Step Process

### Step 1: ขออัตรากำลัง (Headcount Request)

| รายการ | รายละเอียด |
|--------|------------|
| **WI อ้างอิง** | WI-001: การขออนุมัติจัดหากำลังคน, P1_HC-001: ขออัตรากำลัง |
| **HTML Module** | `p1-headcount.html` (Headcount Request Management) |
| **DB Table** | `headcount_requests` |
| **อ้างอิงข้อมูล** | `business_units`, `departments`, `roles` |

**Process Flow:**
1. Department Head / BU Manager สร้างคำขออัตรากำลัง (HC Request)
2. ระบุตำแหน่ง, ระดับ, จำนวน, เหตุผล, งบประมาณ
3. เลือก BU/Department จากฐานข้อมูลอ้างอิง
4. ระบบสร้าง `headcount_requests` record (status: pending)
5. ผู้อนุมัติ (Approval Chain) อนุมัติ → status: approved/rejected
6. เมื่อ approved → ไป Step 2 ได้

**ข้อมูลใน headcount_requests:**
- request_no, request_date
- business_unit_id → business_units.id (บริษัท/BU)
- department_id → departments.id (แผนก/ทีม)
- position, level, quantity
- urgency (high/medium/low)
- reason, replacement_for
- approved_by, approval_status
- budget_range_min, budget_range_max
- job_description, qualifications
- target_start_date

---

### Step 2: เปิดรับสมัคร (Job Posting)

| รายการ | รายละเอียด |
|--------|------------|
| **WI อ้างอิง** | WI-001 (ต่อเนื่องจากการอนุมัติ) |
| **HTML Module** | `p1-headcount.html` (เพิ่มปุ่ม "เปิดรับสมัคร") |
| **DB Table** | สร้างจาก `headcount_requests` (approved) + `job_postings` (ถ้ามี) |
| **อ้างอิงข้อมูล** | `recruitment_sources` |

**Process Flow:**
1. HR เลือก headcount_request ที่ approved แล้ว
2. ระบบสร้าง Job Posting อัตโนมัติ (ดึงข้อมูลจาก HC Request)
3. HR เลือกแหล่งรับสมัคร (recruitment_sources)
4. กำหนดวันรับสมัคร/ปิดรับสมัคร
5. เผยแพร่ประกาศ (QR Code, Job Board, LinkedIn, etc.)

**หมายเหตุ:** ปัจจุบันยังไม่มี table `job_postings` แยก — สามารถเพิ่ม field `posting_status` ใน `headcount_requests` ได้ หรือสร้าง table ใหม่

---

### Step 3: รับใบสมัคร (Application Intake)

| รายการ | รายละเอียด |
|--------|------------|
| **WI อ้างอิง** | WI-001 (กระบวนการรับใบสมัคร), WI-009 (โครงสร้างองค์กร - อ้างอิง) |
| **HTML Module** | `p1-candidates.html` (Candidate Pipeline — ฟอร์มสมัคร) |
| **DB Table** | `candidates`, `recruitment_sources` |
| **อ้างอิงข้อมูล** | `headcount_requests` (ผ่าน headcount_request_id) |

**Process Flow:**
1. ผู้สมัครกรอกใบสมัคร (ผ่าน QR / Form ออนไลน์)
2. ระบบบันทึกลง `candidates` table
3. ระบบบันทึก PDPA consent
4. อัปโหลด Resume/CV
5. ผู้สมัครถูกจัด stage = "screening" เบื้องต้น
6. บันทึกแหล่งที่มา (recruitment_source_id)

**ข้อมูลใน candidates:**
- candidate_code, first_name, last_name
- email, phone, linkedin_url
- resume_url, cover_letter
- headcount_request_id → FK
- recruitment_source_id → FK
- applied_position, current_company
- current_salary, expected_salary
- years_experience, education_level, education_field
- skills (JSON array)
- stage: screening | phone_screen | interview | assessment | offer | hired | rejected
- applied_date, notes

---

### Step 4: คัดเลือก (Screening & Selection)

| รายการ | รายละเอียด |
|--------|------------|
| **WI อ้างอิง** | WI-002: การคัดเลือกพนักงานจากภายนอก |
| **HTML Module** | `p1-candidates.html` (Pipeline view + stage movement) |
| **DB Table** | `candidates` (update stage), เชื่อม `interviews`, `assessment_results` (P2) |

**Process Flow:**
1. **Screening** — HR ตรวจสอบใบสมัคร + Resume
   - ผ่าน → stage: phone_screen
   - ไม่ผ่าน → stage: rejected
2. **Phone Screen** — สัมภาษณ์ทางโทรศัพท์เบื้องต้น
   - ผ่าน → stage: interview
3. **Interview** — สัมภาษณ์ละเอียด (technical/behavioral/panel)
   - ผ่าน → stage: assessment
4. **Assessment** — ทดสอบ (cognitive/technical/personality)
   - ผ่าน → stage: offer
   - *(ข้อมูล assessment เก็บใน P2 tables: assessment_results, competency_scores)*

**Stage Pipeline:**
```
screening → phone_screen → interview → assessment → offer → hired
                                                              │
                                              (rejection at any stage) → rejected
```

---

### Step 5: สรุปผล+บรรจุ (Offer & Onboarding Handover)

| รายการ | รายละเอียด |
|--------|------------|
| **WI อ้างอิง** | WI-003: การสรุปผลและประกาศผลการคัดเลือก, WI-011: การนำสมาชิกเข้าระบบใหม่ |
| **HTML Module** | `p1-candidates.html` (Hire action) |
| **DB Table** | `candidates` (stage: hired), `employees` (สร้าง record ใหม่) |

**Process Flow:**
1. HR เสนอ Offer Letter (ค่าตอบแทน, วันเริ่มงาน)
2. ผู้สมัครตอบรับ Offer
3. เปลี่ยน stage → "hired"
4. ระบบสร้าง record ใหม่ใน `employees` table (ส่งต่อข้อมูลจาก candidates)
5. Hand-over ไป P4: "เซ็ตสมาชิกใหม่" (ตาม WI-011)

**ข้อมูลส่งต่อ employees:**
| จาก candidates | ไป employees |
|----------------|-------------|
| first_name, last_name | first_name_en, last_name_en |
| email | email |
| phone | phone |
| applied_position | position |
| education_level | (เพิ่มเติมภายหลัง) |
| — | hire_date (ใหม่วันที่เริ่มงาน) |
| — | probation_end (คำนวณ) |
| — | department_id, business_unit_id |
| — | manager_id |

---

## 3. Data Flow Diagram

| Step | Input | Process | Output |
|------|-------|---------|--------|
| **1. ขออัตรา** | ความต้องการ BU/Dept, งบประมาณ | สร้าง HC Request → อนุมัติ | `headcount_requests` (approved) |
| **2. เปิดรับ** | HC Request (approved) | สร้าง Job Posting + เลือกแหล่ง | Job Posting publish, `recruitment_sources` linked |
| **3. รับใบสมัคร** | ใบสมัคร PKG, Resume, PDPA | สร้าง Candidate record | `candidates` (stage: screening) |
| **4. คัดเลือก** | Candidate data, ผลสัมภาษณ์ | Stage advancement/rejection | `candidates` (stage: offer/rejected) |
| **5. สรุปผล** | Candidate (offer), HC Request | สร้าง Employee record | `employees` (new), handover to P4 |

### Data Flow: ปกติ vs Error

```
NORMAL FLOW:
HC Request (pending) → approved → Job Post → Applications → Pipeline → Offer → Hired → P4

ERROR/REJECTION:
HC Request → rejected → (หยุด, ไม่สร้าง Job Post)
Application → screening fail → rejected (หยุด)
Interview fail → rejected (หยุด)
Offer declined → rejected (กลับมา Step 2 เปิดรับใหม่ได้)
```

---

## 4. DB Table Mapping

| DB Table | WI อ้างอิง | UI Module | หน้าที่ |
|----------|-----------|-----------|---------|
| `headcount_requests` | WI-001, P1_HC-001 | p1-headcount.html | คำขออัตรากำลัง — ขอ/อนุมัติ |
| `candidates` | WI-002, WI-003 | p1-candidates.html | ผู้สมัครงาน — Pipeline ทั้งหมด |
| `recruitment_sources` | WI-002 | p1-candidates.html | แหล่งที่มาผู้สมัคร |
| `employees` | WI-011 | (P4 module) | สมาชิกปลายทาง (ปลายทาง P1) |
| `departments` | WI-009, WI-001 | (System Settings) | โครงสร้างแผนก/ทีม |
| `business_units` | WI-009, WI-001 | (System Settings) | โครงสร้างบริษัท/BU |
| `roles` | — | (System Settings) | สิทธิ์การเข้าถึง |
| `users` | — | (Login System) | ผู้ใช้งานระบบ |
| *`job_postings`* | *WI-001* | *p1-headcount.html* | *(TODO: ตารางใหม่สำหรับประกาศรับสมัคร)* |

### Table ↔ Form Mapping

| ฟอร์ม/หน้าจอ | Table(s) | WI |
|--------------|----------|-----|
| ฟอร์มขออัตรากำลัง | `headcount_requests` ← `business_units`, `departments` | WI-001, P1_HC-001 |
| ฟอร์มสมัครงาน (QR) | `candidates` ← `headcount_requests`, `recruitment_sources` | WI-002 |
| หน้าคัดกรอง/สัมภาษณ์ | `candidates` (stage update) | WI-002 |
| หน้าสรุปผล/บรรจุ | `candidates` → `employees` | WI-003, WI-011 |
| หน้าโครงสร้างองค์กร | `departments`, `business_units` | WI-009 |

---

## 5. Hand-over Protocol

### 5.1 P1 → P2 (หยั่งประเมิน)

| ข้อมูล | วิธีส่ง | ปลายทาง P2 |
|--------|---------|------------|
| ข้อมูลผู้สมัคร (candidates record) | Real-time DB read | Dashboard P2 "รอประเมิน" |
| screening notes | candidates.notes | P2 notes |
| Resume URL | candidates.resume_url | P2 attachment viewer |
| PDPA consent | candidates.pdpa_consent | P2 compliance check |
| ผลคัดกรองเบื้องต้น | candidates.stage = "assessment" | P2 triggers assessment |

**Trigger:** เมื่อ stage เปลี่ยนเป็น `assessment` → P2 Dashboard เห็นผู้สมัครพร้อมปุ่ม "เริ่มประเมิน"

**P2 Tables ที่รับข้อมูล:**
- `interviews` — สร้างเมื่อ P2 เริ่มสัมภาษณ์
- `assessment_results` — สร้างเมื่อทำแบบทดสอบ
- `competency_scores` — สร้างเมื่อประเมินสมรรถนะ

### 5.2 P1 → P4 (เซ็ตสมาชิกใหม่)

| ข้อมูล | จาก | ไป `employees` |
|--------|-----|----------------|
| ชื่อ-นามสกุล | candidates.first_name/last_name | first_name_en, last_name_en |
| อีเมล | candidates.email | email |
| เบอร์โทร | candidates.phone | phone |
| ตำแหน่ง | candidates.applied_position | position |
| ระดับ | headcount_requests.level | level |
| แผนก | headcount_requests.department_id | department_id |
| BU | headcount_requests.business_unit_id | business_unit_id |
| วันเริ่มงาน | (ใหม่จาก Offer) | hire_date |
| สิ้นโปร | (คำนวณ 90 วัน) | probation_end |
| ประเภทจ้าง | headcount_requests | employment_type |

**Trigger:** candidates.stage = "hired" → สร้าง employee record → P4 WI-011 กระตุ้น

**WI อ้างอิงการ Handover:**
- WI-003: สรุปผล+ประกาศ (สิ้นสุด P1)
- WI-011: นำสมาชิกเข้าระบบใหม่ (เริ่ม P4)

---

## 6. UI Module Status

### p1-headcount.html

| ความสามารถ | สถานะ | หมายเหตุ |
|------------|--------|---------|
| แสดงรายการ HC Requests | ✅ มี | Table + Sorting |
| สร้าง HC Request ใหม่ | ✅ มี | Modal form |
| อนุมัติ/ปฏิเสธ HC Request | ✅ มี | Action buttons |
| Dashboard สถิติ HC | ✅ มี | Stat cards |
| Export Excel | ✅ มี | XLSX library |
| เชื่อม business_units/departments | ✅ มี | Dropdown selects |
| "เปิดรับสมัคร" จาก approved HC | ⚠️ ขาด | ต้องเพิ่มปุ่ม + flow สร้าง job posting |
| เชื่อม recruitment_sources | ⚠️ ขาด | ยังไม่แสดงใน module นี้ |

### p1-candidates.html

| ความสามารถ | สถานะ | หมายเหตุ |
|------------|--------|---------|
| Pipeline Kanban view | ✅ มี | 7 stages แสดงชัดเจน |
| แสดงรายการผู้สมัคร | ✅ มี | Table + filter |
| เพิ่มผู้สมัครใหม่ | ✅ มี | Modal form |
| เปลี่ยน stage | ✅ มี | Drag/dropdown |
| เชื่อม headcount_request | ⚠️ ขาด | ควรเพิ่ม dropdown เลือก HC |
| เชื่อม recruitment_source | ⚠️ ขาด | ควรเพิ่มแหล่งที่มา |
| Handover action (→ hired → P4) | ⚠️ ขาด | ต้องมีปุ่ม "บรรจุ" ที่สร้าง employee |
| QR Form (ผู้สมัครกรอกเอง) | ⚠️ แยกไฟล์ | p1-recruit-test.html มีอยู่ |
| PDPA consent capture | ⚠️ ขาด | ต้องเพิ่มในฟอร์ม |
| Resume upload | ⚠️ ขาด | ต้องเพิ่ม file upload |

### สรุปสิ่งที่ขาด (Gap Analysis)

1. **Job Posting module** — ยังไม่มี (อาจรวมใน p1-headcount หรือแยก)
2. **Application Form (QR)** — มี p1-recruit-test.html แต่ยังไม่เชื่อม DB
3. **Hire action** — ยังไม่มีปุ่มสร้าง employee record จาก candidate
4. **PDPA consent** — ต้องเพิ่มทั้ง UI + DB field
5. **Audit trail** — candidates ไม่มีการเก็ບ log การเปลี่ยน stage (อาจใช้ audit_log table)

---

## 7. อ้างอิงเอกสาร

| แหล่ง | ตำแหน่ง |
|-------|---------|
| Google Sheet ต้นฉบับ | [โครงสร้าง ระบบ PP7 — Tab P1](https://docs.google.com/spreadsheets/d/1yP_l-WmsnlkMDCkZB7ulhe6oS_AAex8iE3LYdPdg-uc/edit) |
| WI Documents | `WI-Complete/P1-4/WI/` |
| DB Schema | `web-pp7-backend/DATABASE_SCHEMA_FULL.md` |
| HTML Modules | `web-pp7-backend/modules/p1-headcount.html`, `p1-candidates.html` |
| Design Doc | `PP7_Design_P1_แสวงหา.md` |

---

*Document Version: 1.0 | Last Updated: 2026-07-13*
