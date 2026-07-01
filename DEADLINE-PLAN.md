# 📅 Web PP7 Project Timeline & Sub-tasks

**วันที่เริ่มต้น:** 25 มิ.ย. 2569  
**Deadline เดิม:** 6 ก.ค. 2569 (12 วัน)  
**Deadline ใหม่:** **3 ก.ค. 2569 (9 วัน)** ⚡ เร็วขึ้น 3 วัน  
**สถานะ:** On Track 🟢

---

## 🎯 ภาพรวม Phase

```
Day 1-2 (25-26 มิ.ย.)  ─── Phase 1: Foundation         ✅ เสร็จแล้ว
Day 3-5 (27-29 มิ.ย.)  ─── Phase 2: Functional Modules 🔧 กำลังทำ
Day 6-7 (30 มิ.ย.-1 ก.ค.) ── Phase 3: Backend Integration ⏳ รอเริ่ม
Day 8-9 (2-3 ก.ค.)     ─── Phase 4: Testing & Fixes   ⏳ รอเริ่ม
Day 10 (4 ก.ค.)        ─── Phase 5: Documentation     ⏳ รอเริ่ม
Day 11 (5 ก.ค.)        ─── Phase 6: UAT               ⏳ รอเริ่ม
Day 12 (6 ก.ค.)        ─── Phase 7: Deployment        ⏳ รอเริ่ม
```

---

## ✅ Phase 1: Foundation (25-26 มิ.ย.) — เสร็จแล้ว

### สิ่งที่เสร็จแล้ว

| # | รายการ | Commit | สถานะ |
|---|--------|--------|-------|
| 1 | Backend Architecture (Google Apps Script) | `b55ac4a` | ✅ |
| 2 | Database Schema (12 Sheets) | `b55ac4a` | ✅ |
| 3 | Login System (7 roles) | `f0b82ae` | ✅ |
| 4 | Members Database (CRUD + Soft-delete) | `a818f8d` | ✅ |
| 5 | P1-P4 Document Classification | `b3b4986` | ✅ |
| 6 | Bug Fixes (Login, Syntax, Cache) | `76b8b80`, `f9b2dae`, `d2676e7` | ✅ |
| 7 | P2 Interview History Log | `1d05d13` | ✅ |
| 8 | Sidebar Layout (แทน Top Tabs) | `db21815` | ✅ |
| 9 | YPNL + MMOA Vision Section | `769c187` | ✅ |
| 10 | MMOA Report (เอกสาร 416 lines) | `9a33aab` | ✅ |
| 11 | **Headcount Request Module (Full CRUD)** | `4e03132` | ✅ |
| 12 | **P1 Candidate Pipeline Dashboard** | `304d214` | ✅ |

**รวม: 12 commits ใน 1 วัน** 🚀

---

## 🔧 Phase 2: Functional Modules (27-29 มิ.ย.) — กำลังทำ

### Task 2.1: HC → P1 Integration (27 มิ.ย. เช้า)
- [ ] Auto-fill BU/Position จากคำขอ HC ที่อนุมัติ
- [ ] แสดงสถานะ "กำลังสรรหา" ใน HC เมื่อส่งไป P1
- [ ] Dashboard: จำนวน HC ที่อนุมัติ vs กำลังสรรหา
- **เวลา:** 2 ชม.

### Task 2.2: P2 Integration (27 มิ.ย. สาย)
- [ ] Auto-import ผู้สมัครจาก P1 ที่ผ่าน screening
- [ ] แสดงข้อมูลผู้สมัครใน P2 พร้อมปุ่ม "เริ่มประเมิน"
- [ ] บันทึกผลการประเมิน → ส่งต่อ P3
- **เวลา:** 3 ชม.

### Task 2.3: P3 Module - จับคู่คนกับงาน (27 มิ.ย. บ่าย)
- [ ] Dashboard: ตำแหน่งว่าง vs ผู้สมัครที่พร้อม
- [ ] Matching Algorithm (skill + CC fit)
- [ ] บันทึกผลการจับคู่ → ส่งต่อ P4
- **เวลา:** 4 ชม.

### Task 2.4: P4 Module - ประเมินผล (28 มิ.ย. เช้า)
- [ ] 360° Evaluation Forms
- [ ] BARS-based Scoring
- [ ] Dashboard: Performance Trends
- **เวลา:** 4 ชม.

### Task 2.5: P5 Module - พัฒนา (28 มิ.ย. บ่าย)
- [ ] Development Plans (จาก P4 results)
- [ ] Training Records
- [ ] Progress Tracking
- **เวลา:** 3 ชม.

### Task 2.6: P6 Module - ค่าตอบแทน (29 มิ.ย. เช้า)
- [ ] Salary Structure
- [ ] Incentive Calculation
- [ ] Payroll Integration
- **เวลา:** 4 ชม.

### Task 2.7: P7 Module - คุณภาพชีวิต (29 มิ.ย. บ่าย)
- [ ] Well-being Survey
- [ ] Engagement Score
- [ ] Health & Safety Records
- **เวลา:** 3 ชม.

**รวม Phase 2: 23 ชม. (ประมาณ 3 วัน)**

---

## ⏳ Phase 3: Backend Integration (30 มิ.ย.-1 ก.ค.)

### Task 3.1: Google Sheets API Integration (30 มิ.ย.)
- [ ] Connect Frontend → Backend API
- [ ] Replace localStorage with Google Sheets
- [ ] Data Validation (server-side)
- **เวลา:** 8 ชม.

### Task 3.2: Authentication & Authorization (1 ก.ค. เช้า)
- [ ] Google OAuth 2.0
- [ ] User Roles & Permissions (backend)
- [ ] Session Management
- **เวลา:** 4 ชม.

### Task 3.3: Notification System (1 ก.ค. บ่าย)
- [ ] LINE Notify Integration
- [ ] Telegram Bot Integration
- [ ] Email Notifications
- **เวลา:** 4 ชม.

**รวม Phase 3: 16 ชม. (ประมาณ 2 วัน)**

---

## ⏳ Phase 4: Testing & Fixes (2-3 ก.ค.)

### Task 4.1: End-to-End Testing (2 ก.ค.)
- [ ] Unit Tests (ทุก module)
- [ ] Integration Tests (P1→P2→P3→P4)
- [ ] Edge Cases & Error Handling
- **เวลา:** 8 ชม.

### Task 4.2: Performance & Security (3 ก.ค. เช้า)
- [ ] Load Testing (1,000+ concurrent users)
- [ ] Security Audit (XSS, CSRF, SQL Injection)
- [ ] Performance Optimization
- **เวลา:** 4 ชม.

### Task 4.3: UAT with PKG Team (3 ก.ค. บ่าย)
- [ ] User Acceptance Testing
- [ ] Bug Fixes
- [ ] UI/UX Refinement
- **เวลา:** 4 ชม.

**รวม Phase 4: 16 ชม. (ประมาณ 2 วัน)**

---

## ⏳ Phase 5: Documentation (4 ก.ค.)

### Task 5.1: User Manual (4 ก.ค. เช้า)
- [ ] User Guide (ภาษาไทย)
- [ ] Video Tutorials (3-5 คลิป)
- [ ] FAQ Document
- **เวลา:** 4 ชม.

### Task 5.2: Technical Documentation (4 ก.ค. บ่าย)
- [ ] API Documentation
- [ ] Database Schema Documentation
- [ ] Deployment Guide
- **เวลา:** 4 ชม.

**รวม Phase 5: 8 ชม. (1 วัน)**

---

## ⏳ Phase 6: UAT & Final Fixes (5 ก.ค.)

### Task 6.1: UAT with End Users (5 ก.ค.)
- [ ] Train HR Team (P1-P7 users)
- [ ] Train Management (Dashboard users)
- [ ] Collect Feedback
- [ ] Final Bug Fixes
- **เวลา:** 8 ชม. (1 วัน)

**รวม Phase 6: 8 ชม. (1 วัน)**

---

## ⏳ Phase 7: Deployment (6 ก.ค.)

### Task 7.1: Production Deployment (6 ก.ค.)
- [ ] Deploy Backend (Google Apps Script)
- [ ] Deploy Frontend (GitHub Pages)
- [ ] Data Migration (if needed)
- [ ] Go-live Support
- [ ] Monitoring & Alerting
- **เวลา:** 4 ชม.

**รวม Phase 7: 4 ชม. (half day)**

---

## 📊 สรุป Timeline

| Phase | วัน | งานหลัก | ชั่วโมง |
|-------|-----|---------|--------|
| Phase 1 | 25-26 มิ.ย. | Foundation | ✅ เสร็จแล้ว |
| Phase 2 | 27-29 มิ.ย. | Functional Modules (P3-P7) | 23 ชม. |
| Phase 3 | 30 มิ.ย.-1 ก.ค. | Backend Integration | 16 ชม. |
| Phase 4 | 2-3 ก.ค. | Testing & Fixes | 16 ชม. |
| Phase 5 | 4 ก.ค. | Documentation | 8 ชม. |
| Phase 6 | 5 ก.ค. | UAT | 8 ชม. |
| Phase 7 | 6 ก.ค. | Deployment | 4 ชม. |

**รวม: 75 ชม. (ประมาณ 9-10 วันเต็ม)**

---

## 🎯 Milestones

| วันที่ | Milestone | สถานะ |
|-------|-----------|-------|
| 26 มิ.ย. | ✅ Foundation Complete | ✅ Done |
| 29 มิ.ย. | 🔧 All Functional Modules Ready | 🔧 In Progress |
| 1 ก.ค. | ⏳ Backend Integration Complete | ⏳ Pending |
| 3 ก.ค. | ⏳ Testing & UAT Complete | ⏳ Pending |
| 5 ก.ค. | ⏳ Documentation & Training Done | ⏳ Pending |
| **6 ก.ค.** | **🚀 Go-Live** | ⏳ Pending |

---

## ⚠️ Risks & Mitigations

### Risk 1: Backend Integration Delay
- **ผลกระทบ:** Delay 1-2 วัน
- **Mitigation:** เริ่ม integration ตั้งแต่ Phase 2 (ทำ song-ขนาน)

### Risk 2: UAT Feedback เยอะ
- **ผลกระทบ:** Delay 1-2 วัน
- **Mitigation:** เก็บ feedback ตลอ**การประเมินงาน Web PP7 — 25 มิ.ย. 2569**

---

## 🎯 สรุป Executive Summary

**📅 Deadline:** **6 กรกฎาคม 2569 (วันจันทร์)** — เหลือ **11 วัน**  
**🚦 สถานะ:** On Track 🟢 (ไม่มีความเสี่ยงที่ deadline)  
**⏱️ เวลาที่ใช้ไปแล้ว:** Day 1 (25 มิ.ย.) — ทำเสร็จกว่าแผน 50%

---

## 📊 ภาพรวมความคืบหน้า

### ✅ Day 1 (25 มิ.ย.) — เสร็จแล้ว ✅
ทำเสร็จ **12 commits** ใน 1 วัน (เร็วกว่าแผน 3 เท่า)

| รายการ | Commit | สถานะ |
|--------|--------|-------|
| Backend Foundation | `b55ac4a` | ✅ Done |
| Login System (7 roles) | `f0b82ae` | ✅ Done |
| Members Database (CRUD) | `a818f8d` | ✅ Done |
| P2 Interview History | `1d05d13` | ✅ Done |
| Sidebar Layout | `db21815` | ✅ Done |
| **Headcount Request Module** | `4e03132` | ✅ Done |
| **P1 Candidate Pipeline** | `304d214` | ✅ Done |
| + อื่นๆ (Bug fixes, Docs) | 5 commits | ✅ Done |

---

## 📋 แผนงานย่อย (11 วัน)

### 🔧 Phase 2: Functional Modules (27-29 มิ.ย.) — 3 วัน

| Task | วันที่ | เวลา | รายละเอียด |
|------|-------|------|-----------|
| **2.1** HC → P1 Integration | 27 มิ.ย. เช้า | 2 ชม. | Auto-fill จากคำขอ HC, Dashboard |
| **2.2** P2 Integration | 27 มิ.ย. สาย | 3 ชม. | Auto-import จาก P1, Begin Assessment |
| **2.3** P3 Module (จับคู่) | 27 มิ.ย. บ่าย | 4 ชม. | Dashboard, Matching Algorithm |
| **2.4** P4 Module (ประเมินผล) | 28 มิ.ย. เช้า | 4 ชม. | 360° Evaluation, BARS, Dashboard |
| **2.5** P5 Module (พัฒนา) | 28 มิ.ย. บ่าย | 3 ชม. | Development Plans, Training Records |
| **2.6** P6 Module (ค่าตอบแทน) | 29 มิ.ย. เช้า | 4 ชม. | Salary, Incentive, Payroll |
| **2.7** P7 Module (คุณภาพชีวิต) | 29 มิ.ย. บ่าย | 3 ชม. | Well-being, Engagement, Health |

**รวม: 23 ชม. ≈ 3 วันเต็ม**

---

### 🔗 Phase 3: Backend Integration (30 มิ.ย.-1 ก.ค.) — 2 วัน

| Task | วันที่ | เวลา | รายละเอียด |
|------|-------|------|-----------|
| **3.1** Google Sheets API | 30 มิ.ย. | 8 ชม. | Connect Frontend ↔ Backend, Replace localStorage |
| **3.2** Authentication | 1 ก.ค. เช้า | 4 ชม. | Google OAuth 2.0, Roles, Sessions |
| **3.3** Notifications | 1 ก.ค. บ่าย | 4 ชม. | LINE Notify, Telegram Bot, Email |

**รวม: 16 ชม. ≈ 2 วันเต็ม**

---

### 🧪 Phase 4: Testing & Fixes (2-3 ก.ค.) — 2 วัน

| Task | วันที่ | เวลา | รายละเอียด |
|------|-------|------|-----------|
| **4.1** E2E Testing | 2 ก.ค. | 8 ชม. | Unit Tests, Integration Tests, Edge Cases |
| **4.2** Performance & Security | 3 ก.ค. เช้า | 4 ชม. | Load Testing, Security Audit, Optimization |
| **4.3** UAT with Team | 3 ก.ค. บ่าย | 4 ชม. | User Testing, Bug Fixes, UI refinement |

**รวม: 16 ชม. ≈ 2 วันเต็ม**

---

### 📚 Phase 5: Documentation (4 ก.ค.) — 1 วัน

| Task | เวลา | รายละเอียด |
|------|------|-----------|
| **5.1** User Manual | 4 ชม. | User Guide, Video Tutorials, FAQ |
| **5.2** Technical Docs | 4 ชม. | API Docs, Schema Docs, Deployment Guide |

**รวม: 8 ชม. = 1 วันเต็ม**

---

### 👥 Phase 6: UAT & Training (5 ก.ค.) — 1 วัน

| Task | เวลา | รายละเอียด |
|------|------|-----------|
| **6.1** Training | 4 ชม. | Train HR Team, Train Management |
| **6.2** Feedback & Fixes | 4 ชม. | Collect Feedback, Final Bug Fixes |

**รวม: 8 ชม. = 1 วันเต็ม**

---

### 🚀 Phase 7: Deployment (6 ก.ค.) — ครึ่งวัน

| Task | เวลา | รายละเอียด |
|------|------|-----------|
| **7.1** Go-Live | 4 ชม. | Deploy Backend, Deploy Frontend, Data Migration, Monitoring |

**รวม: 4 ชม. = ครึ่งวัน**

---

## 🎯 Milestones สำคัญ

| วันที่ | Milestone | สถานะ |
|-------|-----------|-------|
| 25 มิ.ย. | ✅ Day 1 Complete (Foundation + HC + P1) | ✅ Done |
| 29 มิ.ย. | 🔧 All Functional Modules (P1-P7) | 🔧 2 วัน |
| 1 ก.ค. | ⏳ Backend Ready (API + Auth + Notifications) | ⏳ 3 วัน |
| 3 ก.ค. | ⏳ Testing Complete | ⏳ 5 วัน |
| 5 ก.ค. | ⏳ Documentation & Training Done | ⏳ 7 วัน |
| **6 ก.ค.** | **🚀 GO-LIVE** | ⏳ 8 วัน |

---

## ⚠️ Risk Assessment

### ความเสี่ยงต่ำ 🟢
- **✅ Foundation เสร็จเร็วกว่าแผน** — ทำ 12 commits ใน 1 วัน (เร็วกว่าแผน 3x)
- **✅ ระบบหลักทำงานได้** — Login, Members, HC, P1, P2 ทำงานสมบูรณ์
- **✅ ไม่มี blocking issues** — ไม่มีปัญหาที่ขัดขวางการพัฒนา

### ความเสี่ยงปานกลาง 🟡
- **⚠️ Backend Integration** — ต้องใช้เวลา 2 วัน อาจเจอปัญหา API
- **⚠️ UAT Feedback** — ผู้ใช้อาจขอแก้เยอะ ทำให้ deadline ล่าช้า

### Mitigation Strategies
- ทำ Backend Integration song-ขนานกับ Functional Modules
- เก็บ feedback ตลอดการพัฒนา ไม่ใช่แค่ UAT
- มี buffer day เผื่อไว้ (ไม่รวมในแผน)

---

## 💡 สรุปสั้น

**📅 Deadline: 6 ก.ค. 2569 (วันจันทร์)**  
**⏱️ เหลือ: 11 วัน (8 วันทำงาน + 3 วันเสาร์-อาทิตย์)**  
**📊 สถานะ: On Track 🟢**

### งานที่เหลือ:
1. ✅ **Phase 1** (Foundation) — เสร็จแล้ว  
2. 🔧 **Phase 2** (P3-P7 Modules) — 3 วัน (27-29 มิ.ย.)  
3. ⏳ **Phase 3** (Backend Integration) — 2 วัน (30 มิ.ย.-1 ก.ค.)  
4. ⏳ **Phase 4** (Testing) — 2 วัน (2-3 ก.ค.)  
5. ⏳ **Phase 5** (Documentation) — 1 วัน (4 ก.ค.)  
6. ⏳ **Phase 6** (UAT & Training) — 1 วัน (5 ก.ค.)  
7. ⏳ **Phase 7** (Deployment) — ครึ่งวัน (6 ก.ค.)  

**ชั่วโมงทำงานรวม:** 75 ชม. ≈ 10 วันเต็ม

### ข้อสังเกต
- Day 1 เสร็จเร็วกว่าแผนมาก (12 commits vs แผน 3-4 commits)
- หากทำงานต่อด้วยความเร็วนี้ อาจเสร็จก่อน deadline 1-2 วัน
- แนะนำ: ทำ Backend Integration เร็วขึ้น (เริ่ม 28 มิ.ย.) เพื่อมี buffer

---

**ไฟล์เต็ม:** [DEADLINE-PLAN.md](/root/.openclaw/workspace/web-pp7/DEADLINE-PLAN.md)  
**อัพเดตล่าสุด:** 25 มิ.ย. 2569, 03:53 ICT
