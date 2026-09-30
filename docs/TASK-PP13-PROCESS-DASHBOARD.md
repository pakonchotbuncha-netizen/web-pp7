# Task PP1-3 (ไก่จัง) — สรุปกระบวนการอย่างละเอียดสำหรับทีมพัฒนา
> แหล่งข้อมูล: ชีต "Task PP1-3 ไก่จัง" (spreadsheet 1FiKLcmMw7a1Q1Td2KiSfGJmQBrI6Fteup9SXntbfono)
> Dashboard HTML: https://pakonchotbuncha-netizen.github.io/web-pp7/task-pp13-process-dashboard.html
> อัปเดต: 30 ก.ย. 2569

## Task 1 — ปรับหน้า Web PP7 สำหรับบุคคลภายนอก
1. หน้า "ร่วมงานกับ PKG Group" → เมนูระบบรับสมัครงาน แยก FU:
   - 🇹🇭 THAI (ฟอร์มภาษาไทย) — 29+ บริษัท (ประชากิจมอเตอร์เซลส์, เอเอเอ็ม แคปปิตอลเซอร์วิส +6 สาขา, พีเอ็มเอส, เกษตรไทย ลิสซิ่ง ฯลฯ)
   - 🇱🇦 RPLCG (ภาษาลาว) — 7 บริษัท/ร้าน
   - 🇰🇭 RAFCOG (เขมร & อังกฤษ) — 4 บริษัท
   - ทุก FU โชว์ตำแหน่งงานว่าง → form-register.html
2. เมนูเพิ่ม/ลบบริษัท (เปิด-ปิด) — ใช้ ACTIVE/INACTIVE ห้ามลบข้อมูลจริง (soft-close + Audit Log)
3. Theme สีตาม FU: THAI=ส้ม / RPLCG=เหลือง / RAFCOG=แดง-น้ำเงิน (Dynamic Theme ระบบเดียว FU_ID ควบคุม ไม่สร้างเว็บแยก 3 ชุด)
   - ⚠️ **ทุก FU ต้องมี "สมัครนักศึกษาฝึกงาน" ด้วย** (comment พี่ปกรณ์ 30 ก.ย. 69) — ปุ่มใต้การ์ดแต่ละ FU → form-trainee.html?fu=FUxx&lang=th/lo/km · form-trainee รองรับ ?lang= auto-set ภาษา + ส่ง fu/formLang เข้า backend แล้ว · ทำจริงใน recruit-landing-fu.html แล้ว
4. หน้ารับสมัครเปิดให้บุคคลทั่วไป + สมาชิก PKG ใช้ได้เลย
5. เมนู 🔄 Flow การสรรหา 10 ขั้นตอน: สมาชิก PKG ดูได้เท่านั้น / ใช้งานเฉพาะ HR BMC ADM + ผู้รับใช้ทีม

### DB Design
- Key chain: FU_ID → COMPANY_ID → BRANCH_ID → JOB_ID → APPLICANT_ID → APPLICATION_ID
- DB1 = APPLICANT (stock: PROFILE/ADDRESS/EDUCATION/SKILL/LANGUAGE/EXPERIENCE/FAMILY/REFERENCE/DOCUMENT/PDPA_CONSENT)
- APPLICATION แยกการสมัครแต่ละครั้ง (1 คนสมัครหลายตำแหน่งได้)
- MASTER: M_FU, M_COMPANY, M_BRANCH, M_TEAM, M_POSITION, M_LANGUAGE, M_RECRUITMENT_SOURCE
- RECRUITMENT: JOB_POSTING, APPLICATION, SCREENING, AI_ANALYSIS, INTERVIEW_SCHEDULE, INTERVIEW, INTERVIEW_SUMMARY, BACKGROUND_CHECK, JOB_OFFER, ONBOARDING
- AUDIT: USER, ROLE, PERMISSION, AUDIT_LOG
- เชื่อม Flow 10 steps ด้วย APPLICATION_ID: 01 BU REQUEST → 02 HEADCOUNT/STRUCTURE → 03 JOB POSTING → 04 APPLICATION → 05 SCREENING → 06 INTERVIEW SCHEDULE → 07 INTERVIEW → 08 BACKGROUND CHECK → 09 OFFER/START DATE → 10 ONBOARDING → P4 PAO

### ข้อควรแก้ก่อนพัฒนา
ข้อมูลต้นทาง: เลขบริษัทไม่ต่อเนื่อง, พีซีแอลฯ ซ้ำ 2 ครั้ง, เลข 1.1.24/1.1.26 หาย, สาขาปลวกแดงซ้ำ → ใช้ COMPANY_ID เป็นรหัสระบบแทนเลขลำดับหน้าเว็บ

### RBAC
- บุคคลทั่วไป/สมาชิก PKG: หน้ารับสมัคร, FU, บริษัท, ตำแหน่ง, สมัครงาน, Dashboard ผู้สมัคร (เฉพาะข้อมูลตนเอง)
- สมาชิก PKG: ดู Flow 10 ขั้นตอน
- HR/BMC/ADM: FULL ACCESS (จัดการ Company/Job/Applicant DB/Screening/Interview/BG Check/Offer) + ผู้รับใช้ทีมตามสิทธิ์
- Pattern: PKG MEMBER → Authentication → Role/Permission → Resource Access

## Task 2 — Flow การสรรหา 10 ขั้นตอน · STEP 1 โครงสร้างองค์กร
คลิก "1. โครงสร้างองค์กร" → เพิ่ม 4 เมนูย่อย:
1. **คีย์ขอโครงสร้าง** (เฉพาะ BMC) — embed ฟอร์ม GAS (create_structure, spreadsheet 1S_0IO-Hu5T0_kGaor0kmnMayH-4ek2sLYq4rwiFi5v8) ในหน้า PP7 (BMC ไม่ต้องออกจากระบบ) — ฟิลด์: BU/บริษัท/หน่วยงาน/ตำแหน่ง/จำนวนอัตรา/โครงสร้างเดิม/โครงสร้างที่ต้องการ/เหตุผล/รายละเอียด — Submit → REQUEST_ID + STATUS=REQUEST → ส่ง PAO
2. **DATAโครงสร้างบริษัทภายนอก** (เฉพาะ PAO) — set แทนบอร์ดจากคำขอ BU — แหล่งข้อมูล sheet 1liNuQStJOoFfidKa4yMwV0wOVntR5FlUKfcoYhc-vAA (gid=1829103723) — ฟิลด์ set: บริษัท/BU/หน่วยงาน/ตำแหน่ง/จำนวน/ผู้รับใช้ทีม/สายบังคับบัญชา/ระดับตำแหน่ง/โครงสร้างเงินเดือน → SAVE → APPROVE
3. **DATAโครงสร้างบริษัทภายใน** (เฉพาะ PAO) — flow เหมือนข้อ 2 แต่แยก dataset EXTERNAL/INTERNAL ห้ามปนกัน — sheet 1ZGQF_AuixYziDmYeZcaSxBeBQEgGdYJbkX5JgpeIkaw (gid=1481031524)
4. **Flowchart** — เลือก BU (AAMG/PMSG/CPDG/RPLCG/RAFCOG) → เลือกบริษัท → ดึง Structure ล่าสุดที่ APPROVED → แสดง flowchart ตามโครงสร้างเงินเดือน (รูปแบบอ้างอิง sheet 1vX3CErpU0OuYqkr3apVw_PFSlTdNw1CsIF_XB6lAdEI gid=1755774749) — Flowchart ไม่คีย์ซ้ำ เปลี่ยนตาม DB อัตโนมัติ

### เชื่อมต่อ Step 2 — ขออัตรากำลังคน
STRUCTURE APPROVED → ดึงไป Step 2 → BMC เลือก BU/บริษัท/หน่วยงาน/ตำแหน่ง/โครงสร้างเงินเดือน (ระบบดึงจาก APPROVED STRUCTURE ห้ามคีย์ใหม่) → กรอกเฉพาะจำนวนอัตรา → MANPOWER REQUEST → บันทึก DB → Step 3

### DB Relationship
FU_MASTER → BU_MASTER → COMPANY_MASTER → BRANCH_MASTER → DEPARTMENT_MASTER → POSITION_MASTER → STRUCTURE_MASTER
- STRUCTURE_MASTER: STRUCTURE_REQUEST (BMC) / STRUCTURE_EXTERNAL (PAO) / STRUCTURE_INTERNAL (PAO) / STRUCTURE_VERSION → FLOWCHART → MANPOWER_REQUEST → STEP 2
- Keys: BU_ID, COMPANY_ID, BRANCH_ID, DEPARTMENT_ID, POSITION_ID, STRUCTURE_REQUEST_ID, STRUCTURE_ID, STRUCTURE_VERSION, FLOWCHART_ID, MANPOWER_REQUEST_ID

### สิทธิ์ STEP 1
| เมนู | BMC | PAO | บุคคลทั่วไป |
|---|---|---|---|
| 1. โครงสร้างองค์กร | 👁️ | ✅ | ❌ |
| คีย์ขอโครงสร้าง | ✅ | 👁️ | ❌ |
| DATA ภายนอก/ภายใน | ❌ | ✅ | ❌ |
| Flowchart / เลือก BU-บริษัท | 👁️ | ✅ | 👁️ |
| แก้ไขโครงสร้าง | ❌ | ✅ | ❌ |
| 2. ขออัตรากำลังคน | ✅ | 👁️ | ❌ |

### หัวใจของระบบ
STRUCTURE DATABASE = Single Source of Truth — PAO set/อนุมัติครั้งเดียว ใช้ทั้ง Flowchart และ Step 2 ไม่ต้องคีย์ซ้ำ ลดความผิดพลาดระหว่างเมนู

## Task 3 — ใบสมัครงาน: Upload เอกสาร + AI ดึงข้อมูลอัตโนมัติ (ทั้ง 3 ประเทศ)
1. PDPA Consent Gate — ต้องคลิกยอมรับก่อนเข้าฟอร์ม ทั้ง 3 ประเทศ (เก็บ consent_id, application_id, country, consent_status, consent_version, consent_datetime, ip_address, user_agent)
2. Upload บัตรประชาชน → OCR/Document AI → Mapping (เลขบัตร/ชื่อ/สกุล/วันเกิด/ที่อยู่/จังหวัด) → auto-fill → ผู้สมัครตรวจ/แก้ไข → Confirm → Save DB (ห้าม auto-save)
3. Upload ทะเบียนบ้าน → OCR → เติม "ที่อยู่ตามทะเบียนบ้าน" (บ้านเลขที่/ตำบล/อำเภอ/จังหวัด/รหัสไปรษณีย์)
4. รูปผู้สมัคร → ตรวจไฟล์/ขนาด/เป็นภาพบุคคล → Crop/Resize → เก็บ File/Object Storage (DB เก็บ file_id/url เท่านั้น)
5. AI Translation ทุกช่อง: 🇹🇭 TH→EN · 🇱🇦 LA→TH · 🇰🇭 KH→EN+TH — ไม่แปลทับต้นฉบับ (เก็บ source_value + translation_en/th/km/lo + status PENDING/SUCCESS/FAILED/REVIEW) — ทั้งหมดลงฐานข้อมูลรองรับ 3 ประเทศ
6. Submit → Validate → Application ID → Save DB/Documents/Translation → สร้าง Application URL จาก application_id จริง (ห้าม hard-code) → Telegram API ผ่าน Backend (ห้ามเปิด token ใน frontend):
   - 📣 Super สรรหา PKG (chat id -1001237535741): "New Candidate มีผู้สมัครงานใหม่ คุณ : {ชื่อ} สมัครตำแหน่ง : {job_code}##{ตำแหน่ง} ดูรายละเอียดได้ที่ >>> {Application URL}"
   - 👥 ชุมชนคนหางาน (chat id -1001528940221): ข้อความสรุปสั้น (ชื่อ XXXXXXX บางส่วน) — ห้องนี้สมาชิกเยอะ ห้ามส่งข้อมูลส่วนบุคคลละเอียด
   - Notification Log ทุกครั้ง (สำเร็จ/ล้มเหลว)
7. หน้า "เริ่มสมัครงาน" แยก 2 เมนู: สมัครทั่วไป / สมัครขอฝึกงาน (ฟอร์มฝึกงานพอร์ตจาก formTraniee.php → form-trainee.html แล้ว) — ฝึกงาน submit → Trainee Application ID → DB (ชีท Trainees) → Telegram ห้อง super สรรหา: "New Candidate คุณ: {ชื่อ} / ประเภทฝึก / การศึกษา / สถานศึกษา / สาขาวิชา"
8. Application Status กลาง: NEW → CONSENTED → APPLICATION_COMPLETED → DOCUMENT_PENDING → DOCUMENT_VERIFIED → AI_TRANSLATED → READY_FOR_SCREENING → SCREENING → INTERVIEW → BACKGROUND_CHECK → OFFER → HIRED (ไม่ผ่าน: NOT_SELECTED) — ต่อ P1–P4 ได้ทันที
9. DB1 Applicant แตกเป็น: Applicant / Personal Data / Job Application / Address / Education / Experience / Family / Skills / Documents / Translation / Consent / Notification Log
10. Security: ข้อมูลบัตรประชาชน+ทะเบียนบ้าน = อ่อนไหว → encryption, access control, audit log, retention policy · สมัครเสร็จส่งเลข Application ID + สถานะกลับผู้สมัครทันที

โครงสร้างหลัก: ผู้สมัคร → เลือกประเทศ → เลือกประเภทสมัคร → Consent → Form → Upload → OCR → Auto Fill → AI Translation → ตรวจสอบ → Submit → DB1 → Telegram → HR Screening → P1/P2/P3/P4
