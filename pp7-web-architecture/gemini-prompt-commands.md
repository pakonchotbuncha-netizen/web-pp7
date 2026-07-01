# 🎨 ชุดคำสั่งสำหรับสร้างภาพความเชื่อมโยงกระบวนการ Web PP7
## สำหรับนำไปใช้กับ Gemini (หรือ AI ภาพอื่นๆ)

> 📅 ข้อมูลจาก Workshop ทบทวน PM WI (16/05/2569)
> 📊 เอกสารรวม: 55 รายการ | 60 การเชื่อมโยง | 8 Modules

---

## 📋 วิธีใช้
คัดลอกแต่ละ "คำสั่ง" ไปวางใน Gemini ทีละคำสั่ง จะได้ภาพที่สมบูรณ์แต่ละชุด

---

## 🖼️ คำสั่งที่ 1: ภาพรวม PP7 Loop — Big Picture

```
สร้างแผนภาพ Data Flow Diagram แบบ infographic ที่สวยงาม แสดงวงจรบริหารบุคลากร Web PP7

องค์ประกอบหลัก 7 ขั้นตอน เรียงเป็นวงกลม (loop):
  P1 แสวงหา (Recruit) → P2 หยั่งประเมิน (Assess) → P3 จับคู่คนกับงาน (Match)
  ↓
  P4 ประเมินผล (Performance) → P5 พัฒนา (Develop)
  ↓
  P6 ค่าตอบแทน (Compensate) + P7 คุณภาพชีวิต (Quality of Life)
  แล้วลูกศรย้อนกลับจาก P7 → P4 (Feedback Loop)

การออกแบบ:
- ใช้สีต่างกันสำหรับแต่ละ P (7 สี)
- มีไอคอนประกอบแต่ละขั้นตอน
- แสดงแกนกลาง: "ข้อมูลสมาชิก = แกนกลาง" ไว้ตรงกลางวงกลม
- แสดงลูกศร Feedback Loop ชัดเจน (เส้นประ)
- มุมล่าง: แสดงเอกสาร 4 ประเภท — PM (Process Manual), WI (Work Instruction), SD (Standard), FM (Form)
- สไตล์: modern infographic, สีสันสดใส, อ่านง่าย

ข้อความประกอบ:
"PP7 — ระบบบริหารบุคลากร ขับเคลื่อนด้วย CC (Core Competency)"
"ข้อมูลไหลวน: ประเมิน → พัฒนา → ค่าตอบแทน → คุณภาพชีวิต → กลับมาประเมินใหม่"
```

---

## 🖼️ คำสั่งที่ 2: แผนผังความเชื่อมโยงระหว่างกระบวนการ — Master Flow Map

```
สร้างแผนภาพ Flowchart ขนาดใหญ่ แสดงความเชื่อมโยงระหว่างกระบวนการทำงานทั้งหมด 55 รายการ

จัดกลุ่มเป็น 3 แผนกหลัก (ใช้สีต่างกัน):

📌 กลุ่ม 1: PAO — สรรหาและประเมินผล (31 เอกสาร) — สีฟ้า
  กระบวนการสำคัญ:
  WI-001 ขออัตรากำลัง → WI-002 คัดเลือกภายนอก + PM-001 แสวงหา → WI-003 สรุปผล → SD-001 แจ้งก่อนเริ่มงาน → WI-011 นำสมาชิกเข้าระบบ
  
  WI-011 → WI-013 ลงเวลา, WI-012 ประเมินเครดิต, PM-003 ประเมินทดลองงาน
  
  PM-003 → WI-016 ประเมินทดลองงาน → WI-015 แบบบรรจุ → WI-017 คีย์เงินเดือน
  
  WI-004 โอนย้าย → PM-003/WI-016
  
  FM-001 ใบลาออก → WI-020 ยกเลิกสิทธิ, WI-002 เงินสมทบลาออก
  
  WI-009 โครงสร้าง → WI-018 LIA → WI-019 ทบทวนสิทธิ → IT
  
  WI-021/022/023 วินัย → WI-012 (บันทึกประวัติ)

📌 กลุ่ม 2: PAD — บริหารหลักสูตร (17 เอกสาร) — สีเขียว
  WI-012 → PAD-PM004 ระบบ 3 ผ่าน → PAD-WI002 Training → PAD-WI003 กำกับพัฒนา → PAD-WI004 สร้าง MSP → PAD-WI005 ซื้อ MSP → PAD-WI006 เก็บค่าดำเนินการ
  
  PAD-WI004 → PAD-WI007 ดึง BUPOINT กลับ → สมาชิก
  
  PAD-PM001 พี่เลี้ยงน้องเลี้ยง (จาก WI-011)
  
  PAD-PM005 วัดทุนองค์กร (จาก WI-012, WI-014)

📌 กลุ่ม 3: WCD — สวัสดิการและค่าตอบแทน (7 เอกสาร) — สีแดง
  WI-017 คีย์เงินเดือน + WI-013 ลงเวลา → WCD-WI004 จ่ายเงินเดือน
  
  WCD-WI004 → WCD-WI010 นำส่งเงินสมทบ → รัฐบาล (ภงด.1/ประกันสังคม/กยศ.)
  
  WCD-WI004 → WCD-WI005 โบนัส → ธนาคาร (H2H Kbank)
  
  WI-013 → WCD-WI001 เบี้ยเลี้ยงฝึกงาน → การเงิน
  
  WI-013 + WI-011 → WCD-WI003 เบิกสวัสดิการ → BCT (VC เบิกเงิน)
  
  ext_BMC → WCD-WI006 เกษียณ → WI-002 เงินสมทบลาออก → การเงิน

การออกแบบ:
- ใช้กล่องสีตามแผนก (PAO=ฟ้า, PAD=เขียว, WCD=แดง)
- ลูกศรเชื่อมระหว่างกล่อง แสดงทิศทางการไหลของข้อมูล
- 5 Critical Junctions ใช้วงกลมสีส้มเน้น: WI-011, WI-017, WI-013, WI-012, FM-001
- หน่วยงานภายนอก (BU, BCT, CU, HOCC, IT, การเงิน, รัฐบาล, สมาชิก) ใช้วงรีสีเหลือง
- Feedback Loops ใช้เส้นประสีเทา
- สไตล์: enterprise architecture diagram, clean, professional

ข้อความประกอบ:
"Web PP7 — แผนผังความเชื่อมโยงระหว่างกระบวนการ 55 รายการ"
"จุดเชื่อมโยงสำคัญ: WI-011 (ต้นทางสมาชิก), WI-017 (สะพานสรรหา→สวัสดิการ)"
```

---

## 🖼️ คำสั่งที่ 3: Flow การสรรหา→ประเมิน→บรรจุ→เงินเดือน (End-to-End)

```
สร้างแผนภาพ Flowchart แนวตั้ง (top-to-bottom) แสดงการไหลของข้อมูลตั้งแต่สรรหาจนจ่ายเงินเดือน

ใช้สีต่างกันสำหรับแต่ละระยะ:

🔵 ระยะ 1: สรรหา (Recruitment) — สีฟ้า
  [BU] ──ขออัตรากำลัง──▶ [WI-001 ขออัตรากำลัง]
                              │
                    ┌─────────┼─────────┐
                    ▼         ▼         ▼
              [PM-001      [WI-002     [WI-004
             แสวงหาผู้สมัคร] คัดเลือกภายนอก] โอนย้าย/เลื่อน]
                    │         │               │
                    ▼         ▼               ▼
              [WI-003 สรุปผลคัดเลือก] ◄──────┘
                    │
                    ▼
              [SD-001 Script แจ้งก่อนเริ่มงาน]
                    │
                    ▼
              [WI-011 นำสมาชิกเข้าระบบ] ★ CRITICAL JUNCTION

🟢 ระยะ 2: ประเมิน (Assessment) — สีเขียว
  [WI-011] ──▶ [WI-013 ลงเวลา]
      │             │
      │         ┌───┴───┐
      │         ▼       ▼
      │   [WI-012   [PAD-PM001
      │    ประเมิน     พี่เลี้ยง
      │    เครดิต]     น้องเลี้ยง]
      │
      └─▶ [PM-003 ประเมินทดลองงาน]
                │
                ▼
          [WI-016 ประเมินทดลองงาน]
                │
                ▼
          [WI-015 แบบบรรจุ] (ถ้าผ่าน)

🟡 ระยะ 3: คีย์เงินเดือน — สีส้ม
  [WI-015] ──▶ [WI-017 คีย์ข้อมูลเงินเดือน] ★ CRITICAL JUNCTION

🔴 ระยะ 4: ค่าตอบแทน (Compensation) — สีแดง
  [WI-017] ──┐
             ├──▶ [WCD-WI004 จ่ายเงินเดือน]
  [WI-013] ──┘         │
                ┌──────┼──────┐
                ▼      ▼      ▼
          [WCD-WI010  [WCD-WI005  [ext_Money
           นำส่งเงิน    โบนัส      H2H Kbank]
           สมทบ]       ประจำปี]
            │
            ▼
          [รัฐบาล
           ภงด.1/ประกันสังคม/กยศ.]

การออกแบบ:
- ใช้กล่องมน (rounded rectangle) สำหรับแต่ละกระบวนการ
- วงกลมสีส้มรอบ WI-011 และ WI-017 (Critical Junctions)
- ลูกศรหนา แสดงทิศทางข้อมูล
- แสดงชื่อเอกสาร (WI-xxx, PM-xxx) ในแต่ละกล่อง
- แสดงหน่วยงานภายนอกเป็นวงรี
- ระยะที่ 1-4 ใช้สีพื้นต่างกันชัดเจน
- สไตล์: professional flowchart, อ่านง่าย, เหมาะนำเสนอ

ข้อความประกอบ:
"End-to-End Flow: ตั้งแต่สรรหา → จ่ายเงินเดือน"
"⭐ = Critical Junction (จุดเชื่อมโยงสำคัญ)"
```

---

## 🖼️ คำสั่งที่ 4: Flow การประเมิน → พัฒนา → MSP (Development Loop)

```
สร้างแผนภาพ Flowchart แบบวงกลม (circular loop) แสดงวงจรประเมิน→พัฒนา→MSP

🟡 จุดเริ่มต้น: [WI-012 ประเมินเครดิต]
  └─▶ CC1-CC5 scores + 360° results

🟢 ระยะพัฒนา:
  WI-012 ──▶ [PAD-PM004 ระบบ 3 ผ่าน] ──▶ [PAD-WI002 Training]
       │                                      │
       ├──▶ [PAD-PM005 วัดทุนองค์กร] ──▶ [PAD-WI003 กำกับพัฒนา]
       │                                      │
       └──▶ [PAD-PM001 พี่เลี้ยงน้องเลี้ยง] ──┘
                                                  │
                                                  ▼
                                            [PAD-WI004 สร้าง MSP]
                                                  │
                                                  ▼
                                            [PAD-WI005 ซื้อ MSP]
                                                  │
                                                  ▼
                                            [PAD-WI006 เก็บค่าดำเนินการ]
                                                  │
                                                  ▼
                                        [PAD-WI007 ดึง BUPOINT กลับ] (กรณีผิดพลาด)
                                                  │
                                                  ▼
                                              [สมาชิก]

🔄 Feedback Loop (เส้นประย้อนกลับ):
  PAD-WI003 ──(ผลพัฒนา)──▶ WI-012 (ปรับปรุงประเมิน)

การออกแบบ:
- จัดวางเป็นวงกลม: ประเมิน → พัฒนา → MSP → วนกลับ
- ใช้สีเหลืองสำหรับจุดเริ่มต้น (WI-012)
- ใช้สีเขียวสำหรับกระบวนการพัฒนา
- ใช้สีส้มสำหรับ MSP
- Feedback Loop ใช้เส้นประสีแดง ชัดเจน
- มีไอคอนประกอบ: 📊 ประเมิน, 🎓 พัฒนา, 💰 MSP
- สไตล์: cycle diagram, modern, สีสันสดใส

ข้อความประกอบ:
"Development Loop: ประเมิน → พัฒนา → MSP → ปรับปรุงประเมิน"
"CC (Core Competency) เป็นแกนขับเคลื่อนทุกขั้นตอน"
```

---

## 🖼️ คำสั่งที่ 5: Flow เกษียณ / ลาออก (Exit Process)

```
สร้างแผนภาพ Flowchart แยก 2 เส้น: เกษียณ (บน) และ ลาออก (ล่าง)

═══════════════════════════════════════════
เส้นที่ 1: 🟠 เกษียณอายุ (Retirement)
═══════════════════════════════════════════

  [BMC ดูแลสมาชิกอายุ 60] ──▶ [WCD-WI006 ระบบเกษียณ]
                                      │
                          ┌───────────┼───────────┐
                          ▼           ▼           ▼
                  [WCD-WI002   [ext_CU หุ้น   [ext_Money
                   เงินสมทบ    CU/GTC/เงินกู้  เงินชดเชย
                   ลาออก]                    เกษียณ]
                    │
                    ▼
                [ext_Money
                 เงินสมทบเข้าบัญชี]

═══════════════════════════════════════════
เส้นที่ 2: 🔴 ลาออก (Resignation)
═══════════════════════════════════════════

  [สมาชิกกรอก FM-001 ใบลาออก]
              │
    ┌─────────┼─────────┐
    ▼         ▼         ▼
[WCD-WI002  [WI-020   [ext_Money
 เงินสมทบ   ยกเลิกสิทธิ เงินสมทบ
 ลาออก]     IT]        ลาออก]
    │         │
    │         └─▶ [IT ปิดสิทธิอัตโนมัติ]
    │                (email/system/อาคาร)
    ▼
[ext_Money
 เงินสมทบเข้าบัญชี]

═══════════════════════════════════════════

การออกแบบ:
- แยก 2 เส้นชัดเจนด้วยเส้นแบ่ง
- เกษียณ: ใช้สีส้ม (warm)
- ลาออก: ใช้สีแดง (alert)
- FM-001 ใบลาออก เป็นจุดเริ่มต้นของลาออก ใช้สีม่วงเน้น
- BMC เป็นทริกเกอร์เกษียณ ใช้สีเหลือง
- หน่วยงานภายนอกใช้วงรี
- ลูกศรหนา แสดงทิศทางการไหล
- สไตล์: split flowchart, clear, เหมาะนำเสนอ

ข้อความประกอบ:
"Exit Process: เกษียณ vs ลาออก — จุดเริ่มต้นต่างกัน แต่เงินสมทบไปที่เดียวกัน"
```

---

## 🖼️ คำสั่งที่ 6: แผนผัง Database Schema — ความสัมพันธ์ตาราง

```
สร้างแผนภาพ Entity Relationship Diagram (ERD) แสดงความสัมพันธ์ของตารางข้อมูล Web PP7

จัดกลุ่มตารางตาม Module:

🔵 กลุ่ม 1: Core (แกนกลาง)
  members (PK: member_id) — ตารางหลัก, ใหญ่ที่สุด
  positions (FK: position_id → members)
  departments (FK: department_id → positions)
  business_units (FK: bu_id → departments)

🔵 กลุ่ม 2: Recruitment
  manpower_requests (FK: position_id, bu_id, department_id)
  applications (FK: request_id → manpower_requests)
  foreign_workers (FK: member_id → members)
  foreign_worker_quotas

🟢 กลุ่ม 3: Evaluation
  evaluations (FK: member_id → members, evaluator_id → members)
  evaluation_templates
  evaluation_results_summary (FK: member_id)

🟢 กลุ่ม 4: Development
  development_plans (FK: member_id)
  training_records (FK: member_id, course_id)
  courses
  msp_transactions (FK: member_id, development_plan_id)
  bupoint_transactions (FK: member_id, reference_msp_id)

🔴 กลุ่ม 5: Compensation
  payroll (FK: member_id)
  time_records (FK: member_id)
  allowance_records (FK: member_id)
  benefits_claims (FK: member_id)
  bonuses (FK: member_id)
  contributions (FK: member_id)

🟠 กลุ่ม 6: Exit
  resignations (FK: member_id)
  retirement_records (FK: member_id)

🟡 กลุ่ม 7: Structure/Rights/Discipline
  org_structure (FK: bu_id, department_id, position_id)
  access_rights (FK: member_id)
  discipline_records (FK: member_id)

🟣 กลุ่ม 8: Communication
  notifications (FK: member_id, template_id)
  notification_templates

การออกแบบ:
- members อยู่ตรงกลาง (ใหญ่ที่สุด) — ตารางอื่นเชื่อมเข้าหา
- แต่ละกลุ่มใช้สีต่างกัน
- แสดงความสัมพันธ์ด้วยลูกศร (one-to-many, one-to-one)
- FK (Foreign Key) แสดงชัดเจน
- สไตล์: ERD diagram, clean, professional

ข้อความประกอบ:
"Web PP7 Database Schema — 26 ตาราง, members = แกนกลาง"
"ทุกตารางเชื่อมกับ members ผ่าน member_id"
```

---

## 🖼️ คำสั่งที่ 7: แผนผัง Web Modules — UI Architecture

```
สร้างแผนภาพ Site Map / UI Architecture แสดงโครงสร้างหน้าจอ Web PP7

จัดเป็น 8 Modules เรียงเป็น grid 4x2:

┌──────────────┬──────────────┬──────────────┬──────────────┐
│ 🎯 Module 1  │ 📊 Module 2  │ 🎓 Module 3  │ 💰 Module 4  │
│ สรรหา        │ ประเมินผล    │ พัฒนา       │ ค่าตอบแทน   │
│              │              │              │              │
│ • ขออัตรากำลัง│ • แบบประเมิน│ • แผนพัฒนา  │ • ข้อมูลเงิน │
│ • ประกาศรับ  │ • ประเมิน    │ • หลักสูตร   │   เดือน      │
│ • ใบสมัคร   │   ทดลองงาน   │ • พี่เลี้ยง  │ • จ่ายเงิน   │
│ • สรุปผล     │ • ประเมิน    │ • MSP       │ • เบี้ยเลี้ยง│
│ • ต่างด้าว  │   เครดิต     │ • BUPOINT   │ • เบิกสวัสดิ│
│ • Onboarding│ • ผลประเมิน │              │ • โบนัส      │
│ • โอนย้าย   │ • CC Dashbd  │              │ • เงินสมทบ   │
├──────────────┼──────────────┼──────────────┼──────────────┤
│ 🏠 Module 5  │ 🏢 Module 6  │ ⚖️ Module 7  │ 📈 Module 8  │
│ คุณภาพชีวิต  │ โครงสร้าง    │ วินัย       │ รายงาน       │
│              │ และสิทธิ     │              │              │
│ • สุขภาพ    │ • Org Chart │ • อุปกรณ์    │ • สรรหา     │
│ • ความมั่งค.│ • LIA       │ • ใบอนุญาต  │ • ประเมิน   │
│ • บรรยากาศ │ • สิทธิ     │ • ตักเตือน  │ • พัฒนา     │
│ • เวลา      │ • ยกเลิก    │ • ประวัติ   │ • ค่าตอบแทน │
│ • อารมณ์ขัน │   สิทธิ     │             │ • สวัสดิการ │
│              │              │              │ • เกษียณ/ลาออก│
│              │              │              │ • วินัย      │
│              │              │              │ • Export     │
└──────────────┴──────────────┴──────────────┴──────────────┘

ด้านล่าง:
┌────────────────────────────────────────────────────────┐
│           CENTRAL DATABASE (26 ตาราง)                   │
│              members = แกนกลาง                         │
├────────────────────────────────────────────────────────┤
│         AUTOMATION ENGINE (15 กฎอัตโนมัติ)              │
│         NOTIFICATION SYSTEM (Line/Telegram/Email)       │
├────────────────────────────────────────────────────────┤
│   EXTERNAL SYSTEMS: BCT | Kbank | CU | HOCC | Line | TG│
│   | JobThai | Facebook | E-filing | MS24 | IT | รัฐบาล  │
└────────────────────────────────────────────────────────┘

การออกแบบ:
- แต่ละ Module ใช้สีต่างกัน (8 สี)
- แสดง sub-pages ในแต่ละ Module
- มี icon ประกอบ
- Database และ Automation Engine อยู่ด้านล่าง
- External systems อยู่ล่างสุด
- สไตล์: architecture diagram, modern, สีสดใส

ข้อความประกอบ:
"Web PP7 — 8 Modules, 60+ หน้า, เชื่อมข้อมูลผ่าน Database กลาง"
```

---

## 🖼️ คำสั่งที่ 8: แผนผัง RBAC — Role-Based Access Control

```
สร้างแผนภาพ Matrix / ตาราง แสดงสิทธิการเข้าถึงตามบทบาทผู้ใช้งาน Web PP7

บทบาท 11 บทบาท (คอลัมน์):
  Member | Manager | PAO Admin | PAD Admin | WCD Admin | BU Manager
  | Mentor | IT Admin | BMC | Super Admin | Read Only

Module 8 Modules (แถว):
  สรรหา | ประเมินผล | พัฒนา | MSP | ค่าตอบแทน | สวัสดิการ
  | โครงสร้าง | วินัย

สิทธิในแต่ละเซลล์:
  👁️ = ดูอย่างเดียว
  ✏️ = แก้ไข
  ✅ = อนุมัติ
  🔧 = จัดการทั้งหมด
  ❌ = ไม่มีสิทธิ
  ⚙️ = ตั้งค่า

ตัวอย่าง:
  สรรหา:  Member=👁️ | Manager=👁️+✅ | PAO=🔧 | อื่นๆ=❌ | BU=ขออัตรากำลัง
  ประเมิน: Member=👁️(ตัวเอง) | Manager=✅(ทีม) | PAO=🔧 | อื่นๆ=👁️
  พัฒนา: Member=👁️(ตัวเอง) | Manager=👁️(ทีม) | PAD=🔧 | อื่นๆ=❌
  ค่าตอบแทน: Member=👁️(สลิป) | Manager=👁️(ทีม) | WCD=🔧 | BU=INC
  สวัสดิการ: Member=เบิก | Manager=✅ | WCD=🔧 | อื่นๆ=❌
  โครงสร้าง: Member=👁️ | Manager=👁️ | PAO=🔧 | BU=ขอเพิ่ม
  วินัย: Member=👁️(ตัวเอง) | Manager=👁️(ทีม) | PAO=🔧

Super Admin: 🔧 ทุกอย่าง
Read Only: 👁️ ทุกอย่าง (รายงาน)
IT Admin: 🔧 เฉพาะ Module 6 (โครงสร้าง/สิทธิ)
BMC: 👁️+✅ เฉพาะ เกษียณ + สมาชิก

การออกแบบ:
- ใช้ตาราง (matrix) ขนาดใหญ่
- ใช้ icon แทนสิทธิ (👁️ ✏️ ✅ 🔧 ❌)
- แต่ละบทบาทใช้สีหัวคอลัมน์ต่างกัน
- แถว Super Admin/IT Admin/BMC แยกสี
- สไตล์: access control matrix, clean, professional

ข้อความประกอบ:
"Web PP7 — RBAC Matrix: 11 บทบาท × 8 Modules"
"Super Admin = ทุกอย่าง, Read Only = ดูอย่างเดียว"
```

---

## 🖼️ คำสั่งที่ 9: แผนการพัฒนา 5 Phases — Timeline

```
สร้างแผนภาพ Gantt Chart / Timeline แสดงแผนการพัฒนา Web PP7 5 Phases (9 เดือน)

🔷 Phase 1: Foundation (เดือน 1-2) — สีฟ้า
  ✅ Database schema 26 ตาราง
  ✅ Authentication + RBAC
  ✅ Module 1: สรรหา (WI-001 → WI-011)
  ✅ Module 2: ประเมินผล (WI-012 → WI-016)

🟢 Phase 2: Core Operations (เดือน 3-4) — สีเขียว
  ✅ Module 4: ค่าตอบแทน (WCD-WI004/WI-001/WI-003)
  ✅ Module 3: พัฒนา (PAD-PM004 → PAD-WI006)
  ✅ Automation Engine (A1-A15)
  ✅ Notification system

🟡 Phase 3: Advanced (เดือน 5-6) — สีเหลือง
  ✅ Module 5: คุณภาพชีวิต
  ✅ Module 6: โครงสร้าง/สิทธิ
  ✅ Module 7: วินัย
  ✅ Module 8: รายงาน

🟠 Phase 4: Integration (เดือน 7-8) — สีส้ม
  ✅ เชื่อม BCT, Kbank, CU, HOCC
  ✅ เชื่อม Line/TG, JobThai, Facebook
  ✅ เชื่อม E-filing, Government portals
  ✅ เชื่อม App MS24, IT System

🔴 Phase 5: Polish (เดือน 9) — สีแดง
  ✅ AI screening, CC matching
  ✅ Dashboard, Analytics
  ✅ Mobile responsive
  ✅ Testing + Deploy

การออกแบบ:
- แสดงเป็น Gantt Chart แนวนอน
- แต่ละ Phase มี colored bar แสดงช่วงเวลา
- มี checklist รายการในแต่ละ Phase
- แสดง里程碑 (milestone) สำคัญ
- สไตล์: project timeline, modern, เหมาะนำเสนอ

ข้อความประกอบ:
"Web PP7 Development Plan — 5 Phases, 9 เดือน"
"Phase 1-2: Foundation + Core | Phase 3: Advanced | Phase 4: Integration | Phase 5: Polish"
```

---

## 🖼️ คำสั่งที่ 10: Infographic สรุปภาพรวมทั้งหมด (One-Pager)

```
สร้าง infographic ขนาด 1 หน้า สรุปโครงสร้าง Web PP7 ทั้งหมด

องค์ประกอบที่ต้องแสดง:

📊 ตัวเลขสำคัญ (บนสุด):
  8 Modules | 55 กระบวนการ | 60 การเชื่อมโยง | 26 ตาราง Database
  100+ API Endpoints | 15 Automation Rules | 11 บทบาท | 11 ระบบภายนอก

🔄 วงจร PP7 (กลางบน):
  P1→P2→P3→P4→P5→P6→P7 → Feedback Loop (แสดงเป็นวงกลม)

🏗️ 8 Modules (กลาง):
  แสดงเป็น grid 4x2 พร้อม icon และชื่อ Module

🔗 จุดเชื่อมโยงสำคัญ (กลางล่าง):
  ⭐ WI-011 นำสมาชิกเข้าระบบ (ต้นทาง)
  ⭐ WI-017 คีย์เงินเดือน (สะพานสรรหา→สวัสดิการ)
  ⭐ WI-013 ลงเวลา (ป้อนสวัสดิการ)
  ⭐ WI-012 ประเมินเครดิต (เชื่อม P4→P5)
  ⭐ FM-001 ใบลาออก (ทริกเกอร์เกษียณ/ยกเลิกสิทธิ)

🔌 ระบบภายนอก (ล่าง):
  BCT | Kbank | CU | HOCC | Line | TG | JobThai | Facebook
  | E-filing | MS24 | รัฐบาล

การออกแบบ:
- สไตล์: modern infographic, สีสันสดใส
- ใช้ icon ประกอบทุกส่วน
- มีตัวเลขใหญ่ชัดเจน
- Flow arrows แสดงความเชื่อมโยง
- เหมาะ print หรือ present
- ใช้สีตามแผนก: PAO=ฟ้า, PAD=เขียว, WCD=แดง, อื่นๆ=สีต่างกัน

ข้อความหลัก:
"Web PP7 — ระบบบริหารบุคลากร ขับเคลื่อนด้วย Core Competency"
"8 Modules | 55 กระบวนการ | ข้อมูลไหลวนต่อเนื่อง"
```

---

## 📎 เคล็ดลับสำหรับ Gemini

1. **ถ้าต้องการภาพละเอียด:** คัดลอกคำสั่งที่ 2, 3, 4, 5 แยกกัน จะได้ภาพแต่ละ Flow
2. **ถ้าต้องการภาพสรุป:** ใช้คำสั่งที่ 1 (วงกลม PP7) หรือ 10 (One-Pager)
3. **ถ้าต้องการภาพเทคนิค:** ใช้คำสั่งที่ 6 (ERD), 7 (UI), 8 (RBAC), 9 (Timeline)
4. **ปรับแต่งได้:** แก้ไขสี, layout, ข้อความ ตามความเหมาะสม
5. **แนะนำ:** ใช้คำสั่งที่ 3 (End-to-End) + 4 (Development Loop) + 5 (Exit Process) สำหรับสื่อสารกับทีม — เข้าใจง่ายที่สุด

---

> ✅ คำสั่งทั้งหมด 10 ชุด พร้อมคัดลอกไปใช้กับ Gemini
> 📁 ไฟล์: `pp7-web-architecture/gemini-prompt-commands.md`
> 🔗 ข้อมูลอ้างอิง: 55 กระบวนการ + 60 การเชื่อมโยง จาก Workshop 16/05/2569
