# Web PP7 Development Backlog (สรุป Task จากกระบวนการใหม่ S4)

เอกสารนี้สรุปรายการงาน (Task) สำหรับทีมพัฒนาโปรแกรม Web PP7 โดยอ้างอิงจากกระบวนการใหม่ (S4) ที่ผ่านการทบทวนและลดความซ้ำซ้อนแล้ว จากชีท "ทบทวน PM WI 16/05/2569"

> **แหล่งที่มา:** Google Sheets Tabs: `กระบวนการใหม่ P1-4`, `กระบวนการใหม่ P5`, `กระบวนการใหม่ P6-7`
> **สถานะ:** รอดำเนินการ (รอการออกแบบ UI/UX และ Development)

---

## 📦 ชุดที่ 1: P1-4 (สรรหาและประเมินผล) - 24 กระบวนการ
**เป้าหมายหลัก:** Single Flow การสรรหา, Auto-screening, Digital Assessment, และ Paperless Onboarding

| รหัส | ชื่อกระบวนการ | Highlight กระบวนการใหม่ (S4) | Task หลักสำหรับ Web PP7 |
|------|---------------|------------------------------|--------------------------|
| WI-002 | การคัดเลือกพนักงานจากภายนอก | AI คัดกรองใบสมัครจาก 10 ช่องทาง, รวมขั้นตอนแสวงหาเป็นฟอร์มเดียว | สร้างระบบ AI Screening และ Centralized Application Form |
| WI-001 | การขออนุมัติจัดหากำลังคน | ตรวจสอบความถูกต้องทันที, กระจาย Ads อัตโนมัติผ่าน SGM | ระบบอนุมัติอัตรากำลังอัตโนมัติ + SGM Integration |
| PM-001 | การแสวงหาผู้สมัครงาน | รวม 22 ขั้นตอนเหลือ 12 ขั้นตอน, แจ้งผลสัมภาษณ์อัตโนมัติ | Dashboard ติดตามสถานะผู้สมัครแบบ Real-time |
| FM-001 | ใบลาออก | แจ้งเตือนพนักงานกรอกใบลาออก + ตรวจสอบความครบถ้วนอัตโนมัติ | Digital Resignation Form + Auto-checklist |
| PM-002 | การนำเข้าแรงงานต่างด้าว | OCR สแกนเอกสาร, จัดคิวและบันทึกข้อมูลทะเบียนกลางอัตโนมัติ | OCR Document Verification + Single Verification Flow |
| PM-003 | การประเมินผลทดลองงาน/โอนย้าย | ระบบเซ็ตข้อมูล สร้างแบบประเมิน และสร้างฟอร์มอัตโนมัติ | Auto-generate Evaluation Forms + 30-day Tracking |
| *อื่นๆ* | WI-003, WI-004, WI-006, WI-007, WI-008, WI-009, WI-011-WI-019 | รวมขั้นตอนการตรวจสอบ, อนุมัติ และแจ้งเตือนเป็นขั้นเดียว | ระบบ Approval Workflow กลาง + Telegram/Line Notification Bot |

---

## 📦 ชุดที่ 2: P5 (บริหารหลักสูตร) - 13 กระบวนการ
**เป้าหมายหลัก:** Automated Training Management, Digital Mentor Tracking, และ MSP Pipeline

| รหัส | ชื่อกระบวนการ | Highlight กระบวนการใหม่ (S4) | Task หลักสำหรับ Web PP7 |
|------|---------------|------------------------------|--------------------------|
| WI-001 | กระบวนการเปิดอบรมภายใน | ตรวจสอบ Checklist หลักสูตรอัตโนมัติ, แจ้งผลวิทยากรทันที | Course Registration System + Auto-Checklist Validation |
| WI-002 | Training (การฝึกอบรม) | รวม 26 ขั้นตอนเหลือ 8 ขั้นตอน, คำนวณค่าใช้จ่ายและเรียกเก็บอัตโนมัติ | Training Cost Calculator + Auto-billing to BU |
| PM-001 | ระบบพี่เลี้ยงและน้องเลี้ยง | ดึงข้อมูล PP7 จัดกลุ่มอัตโนมัติ, ติดตาม DTA รายวันผ่าน Dashboard | Mentor-Mentee Matching Engine + DTA Daily Log |
| PM-004 | ระบบ 3 ผ่าน PKG | ประเมินทฤษฎี+Roleplay ครั้งเดียว, สรุปผล 3 ผ่านอัตโนมัติ | "3-Pass" Evaluation Dashboard + Audit Integration |
| PM-005 | การวัดทุนองค์กรและทุนมนุษย์ | AI ดึงข้อมูลสรุปส่งห้อง L&G, เชื่อมข้อมูลส่ง P4 อัตโนมัติ | Human Capital Metrics Dashboard + Auto-reporting to L&G |
| WI-004, WI-005, WI-006, WI-007 | การจัดการ MSP (สร้าง, จ่าย, ซื้อ) | วงจรชีวิต MSP แบบ Automated Pipeline, ตรวจจับยอดโอนผิดอัตโนมัติ | MSP Lifecycle Management + Wallet/Cashout API Integration |

---

## 📦 ชุดที่ 3: P6-7 (สวัสดิการและค่าตอบแทน) - 7 กระบวนการ
**เป้าหมายหลัก:** Automated Payroll, Instant Welfare Claims, และ Proactive Retirement Planning

| รหัส | ชื่อกระบวนการ | Highlight กระบวนการใหม่ (S4) | Task หลักสำหรับ Web PP7 |
|------|---------------|------------------------------|--------------------------|
| WI-004 | การจ่ายเงินเดือนสมาชิก | Automated Payroll Pipeline (INC/CU → ภาษี → e-slip → H2H) | Payroll Automation Engine + Kbank H2H API + E-filing |
| WI-005 | การทำจ่ายโบนัสประจำปี | รับข้อมูล PFS/CU, คำนวณภาษีหัก ณ ที่จ่าย, กระทบยอดอัตโนมัติ | Bonus Calculation Engine + Auto-VC Generation |
| WI-001, WI-002, WI-003 | การเบิกสวัสดิการ / เงินสมทบลาออก | ตรวจสอบสิทธิ์เบื้องต้นจากเอกสาร, สร้าง VC ส่งการเงินอัตโนมัติ | Welfare Claim Portal + Auto-eligibility Check + VC Generator |
| WI-006 | ระบบเกษียณ | แจ้งเตือนล่วงหน้า (อายุ 55-60), คำนวณเงินชดเชย/หุ้น/เงินกู้ Real-time | Retirement Planner Simulator + Multi-department Auto-payout |
| WI-010 | การเตรียมข้อมูลและการนำส่งเงินสมทบ | รวบรวมและคำนวณเงินสมทบอัตโนมัติ, แจ้งเตือนกำหนดชำระ | Contribution Tracking & Auto-calculation Module |

---

## 🛠️ Next Steps สำหรับทีมพัฒนาโปรแกรม
1. **Prioritization:** จัดลำดับความสำคัญของ Task (แนะนำ: เริ่มจาก P6-7 WI-004 Payroll และ P1-4 WI-002 Recruitment เนื่องจาก Impact สูงสุด)
2. **Schema Design:** ออกแบบ Database Schema ร่วมกันตามข้อเสนอในคอลัมน์ S6 ของแต่ละกระบวนการ
3. **API Mapping:** จัดทำรายการ API ที่ต้องใช้เชื่อมต่อกับระบบภายนอก (BCT, Kbank H2H, SGM, Line/Telegram Bot, CU, HOCC)
4. **Sprint Planning:** แบ่ง Task เหล่านี้เป็น Sprint ย่อยละ 2-3 กระบวนการ เพื่อการส่งมอบที่รวดเร็ว (Agile)

---
*เอกสารนี้สร้างโดย KiloClaw เมื่อ: 2026-06-17 | อ้างอิงจาก Google Sheet ID: 1zgDOqhuWajQyn4c58XN1jmhjxmavqpEdKqpOlouLM5w*