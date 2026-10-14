# 🧭 ปรัชญาการออกแบบ Web PP7 (Design Philosophy) — v1.0

> จัดทำ: 14 ตุลาคม 2569 · เจ้าของ: ปกรณ์ (PKG) · Executive Sponsor · จัดทำโดย KiloClaw (PM + Developer)
> ที่มา: สังเคราะห์จากข้อมูลเดิมที่เคยเขียนไว้ (สร้างบ้านรอคนเข้าอยู่ · AI เสนอ มนุษย์ยืนยัน · PAC · MMOA · Build to Last)
> สถานะ: ร่าง — หัวข้อ 9–10 รอยืนยันจากพี่ปกรณ์

**แนวคิดแกนกลาง:** "สร้างบ้านรอคนเข้าอยู่" 🏠 — สร้างระบบให้สมบูรณ์ทุกห้องก่อน แล้วนำเข้าข้อมูลจริงทีหลัง
**หลักการกลางทุกกระบวนการ:** "AI เสนอ มนุษย์ยืนยัน" (Human-in-the-Loop)

---

## 10 หลักการออกแบบ

### 1. Automation level 90%+
งานที่ทำซ้ำและคำนวณได้ ให้ AI/ระบบทำอัตโนมัติ ≥ 90% — **คนทำหน้าที่ตรวจและแก้ไขสิ่งที่ AI ทำมา** (ไม่ใช่ทำเองตั้งแต่ต้น)
- อ้างอิงเดิม: MMOA Strategy (Maximize/Minimize/Optimize/Automate)
- จุดตัดสินของคนชัดเจนเป็น HITL Gate ("AI ช่วยคัด/ช่วยร่าง/ช่วยคำนวณ — คนตัดสิน")

### 2. Log everything
บันทึกการเปลี่ยนแปลงทุกอย่าง (ใคร/ทำอะไร/เมื่อไร/ค่าเดิม→ค่าใหม่) ตรวจสอบย้อนกลับได้ทุกจุด
- อ้างอิงเดิม: Audit Log 100% (Obj.1 KR3)

### 3. AI Natively
มี AI ฝังตั้งแต่กำเนิดของระบบทุก P — ไม่ใช่ AI ที่แปะเพิ่มทีหลัง
- AI Layer ในสถาปัตยกรรม: NLU/NLP ไทย · Scoring Engine (CC) · Matching Engine · Anomaly Detection · Chatbot HR

### 4. ความถูกต้องข้อมูล 100%
ข้อมูลถูกต้อง ครบถ้วน มีแหล่งอ้างอิง — Single Source of Truth, ตรวจสอบก่อนบันทึก, ลดการคีย์ซ้ำ/คีย์สองที่
- อ้างอิงเดิม: Data-Driven + AI Validation Engine

### 5. WaC native 100% (เคลื่อนตาม WaC 100%)
ระบบต้องเคลื่อนตาม WaC ทั้งหมด
- ⚠️ รอนิยาม WaC จากพี่ปกรณ์เพื่อระบุให้ตรง (ยังไม่ยืนยันความหมาย)

### 6. ใช้ PKG Stack (โครงสร้างทาง IT ใหม่จาก AGS)
- Frontend: HTML + TailwindCSS + Chart.js + XLSX
- Backend: Google Apps Script (AGS) · Database: Google Sheets (BCT)
- Auth: Token-based + RBAC (6 roles) · Deploy: Google Web App

### 7. Modular Design
แยกองค์ประกอบให้ทำงานบน Platform แยกส่วน — ไปไหนก็ได้ในรูป API และนำกลับมาใช้ซ้ำได้
- เป้าหมาย reuse: **AMS5 · PMS2 · CPD1**

### 8. Graphic > Text
สื่อสารด้วยภาพก่อนตัวอักษร — Dashboard / Chart / Infographic (เช่น PRG-PDG, bars-infographic, orgchart)

### 9. (รอยืนยัน)
### 10. (รอยืนยัน)

---

## ภาคผนวก — ข้อมูลเดิมที่เกี่ยวข้อง
- **สร้างบ้านรอคนเข้าอยู่** — MEMORY.md, presentation-dashboard.html, WEB_PP7_STATUS_REPORT.md (Build to Last)
- **AI เสนอ มนุษย์ยืนยัน** — docs/PM-PP7-AI-POINTS.html, docs/PM-PP7-FLOW.html, docs/PM-PROCESS-MANUAL-ISO.md
- **หลักการออกแบบ PAC (People Asset Capital)** — คนเป็น Asset · CC เป็นแกน · Data-Driven (13 ส.ค. 2569)
- **MMOA Strategy** — VISION-STRATEGY.md (25 มิ.ย. 2569)
- **หลักการออกแบบโครงสร้าง Web PP7 (§9.1–9.2)** — docs/SMC_HOCC_PM_002_PP7_AI_DIAGRAM.md
- **Documentation Driven Development** — เขียน WI 66 กระบวนการก่อนเขียนโค้ด
