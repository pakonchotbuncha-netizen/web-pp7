# Database Schema Extension: PM/WI/SD/FM Documentation System

## Overview
เพิ่มตารางข้อมูลสำหรับระบบเอกสารกระบวนการทำงาน (PM/WI/SD/FM) เพื่อรองรับทีมผู้ปฏิบัติงาน

---

## ตารางที่เพิ่มใหม่

### documents (เอกสารทั้งหมด)
```
document_id        TEXT PRIMARY KEY        -- DOC-P001-WI-01
document_type      TEXT NOT NULL           -- PM | WI | SD | FM
title              TEXT NOT NULL           -- ชื่อเอกสาร
description        TEXT                    -- รายละเอียด
linked_process     TEXT NOT NULL           -- เชื่อมกับ P ไหน (P1-P7)
version            TEXT DEFAULT '1.0'      -- รุ่นเอกสาร
status             TEXT DEFAULT 'Draft'    -- Draft | In Review | Approved | Archived
owner_user_id      TEXT NOT NULL           -- ผู้รับผิดชอบ
created_at         TIMESTAMP
updated_at         TIMESTAMP
created_by         TEXT
file_url           TEXT                    -- Link ไปไฟล์จริง (PDF/DOCX)
file_size_kb       INTEGER
content_summary    TEXT                    -- สรุปเนื้อหา (สำหรับค้นหา)
tags               TEXT                    -- comma-separated tags
approval_status    TEXT                    -- Pending | Approved | Rejected
approver_user_id   TEXT                    -- ผู้อนุมัติ
approved_at        TIMESTAMP
review_count       INTEGER DEFAULT 0       -- จำนวนครั้งที่แก้ไข
archived_at        TIMESTAMP
country            TEXT DEFAULT 'TH'       -- TH | LA | KH
```

**Indexes:**
- idx_documents_type (document_type)
- idx_documents_linked (linked_process)
- idx_documents_status (status)
- idx_documents_owner (owner_user_id)

---

### document_revisions (ประวัติการแก้ไข)
```
revision_id        TEXT PRIMARY KEY        -- REV-001
document_id        TEXT NOT NULL (FK)
version_from       TEXT
version_to         TEXT
changed_by         TEXT NOT NULL
changed_at         TIMESTAMP
change_summary     TEXT                    -- สิ่งที่เปลี่ยน
file_url_before    TEXT
file_url_after     TEXT
```

---

### document_access_log (log การเข้าถึง)
```
log_id             TEXT PRIMARY KEY
document_id        TEXT NOT NULL
user_id            TEXT NOT NULL
action             TEXT                    -- View | Download | Edit | Approve
accessed_at        TIMESTAMP
ip_address         TEXT
```

---

## Mock Data

### PM (Process Manual) ตัวอย่าง:
1. DOC-P001-PM-01: "คู่มือกระบวนการ P1 แสวงหาบุคลากร"
2. DOC-P002-PM-01: "คู่มือกระบวนการ P2 หยั่งประเมิน"
3. DOC-P003-PM-01: "คู่มือกระบวนการ P3 จับคู่คนกับงาน"
4. DOC-P004-PM-01: "คู่มือกระบวนการ P4 ประเมินผล"
5. DOC-P005-PM-01: "คู่มือกระบวนการ P5 พัฒนาบุคลากร"

### WI (Work Instruction) ตัวอย่าง:
1. DOC-P001-WI-01: "วิธีกรอก Headcount Request Form"
2. DOC-P001-WI-02: "วิธีสัมภาษณ์ผู้สมัคร P1"
3. DOC-P002-WI-01: "วิธีประเมิน Core Competency"
4. DOC-P002-WI-02: "วิธีบันทึกผลสัมภาษณ์ P2"
5. DOC-P003-WI-01: "วิธี match พนักงานกับตำแหน่งงาน"
6. DOC-P004-WI-01: "วิธีประเมิน 360 องศา"
7. DOC-P004-WI-02: "วิธีคำนวณ Annual Credit"
8. DOC-P005-WI-01: "วิธีสร้าง Development Plan"

### SD (Standard) ตัวอย่าง:
1. DOC-P001-SD-01: "มาตรฐานการคัดเลือกผู้สมัคร P1"
2. DOC-P002-SD-01: "มาตรฐานการประเมิน Core Competency"
3. DOC-P003-SD-01: "มาตรฐานการจับคู่ตำแหน่งงาน"
4. DOC-P004-SD-01: "มาตรฐานการประเมินผล KPI"
5. DOC-P005-SD-01: "มาตรฐานการฝึกอบรม"
6. DOC-P006-SD-01: "มาตรฐานการจ่ายโบนัส"

### FM (Form) ตัวอย่าง:
1. DOC-P001-FM-01: "ฟอร์มยื่นคำขออัตรากำลัง"
2. DOC-P001-FM-02: "ฟอร์มประเมินผู้สมัคร"
3. DOC-P002-FM-01: "ฟอร์มบันทึกผลสัมภาษณ์"
4. DOC-P002-FM-02: "ฟอร์มประเมิน Core Competency"
5. DOC-P003-FM-01: "ฟอร์มจับคู่พนักงาน-ตำแหน่ง"
6. DOC-P004-FM-01: "ฟอร์มประเมินรายบุคคล"
7. DOC-P004-FM-02: "ฟอร์มประเมิน 360 องศา"
8. DOC-P005-FM-01: "ฟอร์มสร้างแผนพัฒนา"
9. DOC-P006-FM-01: "ฟอร์มปรับเงินเดือน"
10. DOC-P007-FM-01: "ฟอร์มสำรวจความพึงพอใจ 5H"

---

## API Endpoints

```
GET    /api/documents                    -- List all docs (with filters)
GET    /api/documents/:id                -- Get single doc
POST   /api/documents                    -- Create new doc
PUT    /api/documents/:id                -- Update doc
DELETE /api/documents/:id                -- Soft delete (archive)

GET    /api/documents/:id/revisions      -- Get revision history
POST   /api/documents/:id/approve        -- Approve doc
POST   /api/documents/:id/upload         -- Upload file

GET    /api/documents/stats              -- Statistics dashboard
GET    /api/documents/search?q=XXX       -- Search
```

---

## RBAC Matrix

| Role | View | Create | Edit | Delete | Approve |
|------|------|--------|------|--------|---------|
| admin | ✅ | ✅ | ✅ | ✅ | ✅ |
| hr_manager | ✅ | ✅ | ✅ | ❌ archive only | ✅ |
| bu_manager | ✅ BU only | ✅ for BU | ✅ own BU only | ❌ | ❌ |
| employee | ✅ own BU | ❌ | ❌ | ❌ | ❌ |
| auditor | ✅ read-only | ❌ | ❌ | ❌ | ❌ |
| guest | ❌ | ❌ | ❌ | ❌ | ❌ |

---

## Frontend Integration

- Tab ใหม่ใน Sidebar: "📚 เอกสาร (PM/WI/SD/FM)"
- 4 sub-tabs: PM | WI | SD | FM
- Search + Filter by process, type, status, owner
- Mock document viewer (preview PDF)
- Approval workflow UI

---

Created: Phase 4 — Parallel with P5/P6/P7 modules
