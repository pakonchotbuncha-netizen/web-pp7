# 📋 PM Plan: ขั้นตอนต่อไปสำหรับ Web PP7

**วันที่:** 5 สิงหาคม 2569  
**PM:** KiloClaw AI Assistant  
**สถานะ:** ฟอร์มสมัครงานเสร็จสมบูรณ์ → พร้อมเชื่อมต่อระบบ

---

## ✅ สิ่งที่เสร็จแล้ว

### 1. ฟอร์มสมัครงาน 4 ภาษา
- ✅ `form-register.html` - 8 หัวข้อ ครบถ้วนตามต้นฉบับ
- ✅ รองรับ 4 ภาษา: ไทย, English, ລາວ, ខ្មែរ
- ✅ PDPA Consent ครบข้อ 1-7
- ✅ Responsive Design
- ✅ Auto-fill, Auto-calculate
- ✅ Matrix Radio สำหรับความสามารถภาษา

### 2. เอกสารประกอบ
- ✅ `APPLICATION-FORM-SUMMARY.md` - สรุปโครงสร้างฟอร์ม
- ✅ `i18n/LEGAL-*.md` - คำศัพท์กฎหมาย 4 ภาษา
- ✅ เชื่อมต่อลิงก์ในหน้า P1

---

## 🚀 ขั้นตอนต่อไป (Priority Order)

### Phase 1: Backend Integration (สัปดาห์ที่ 1)

#### 1.1 สร้าง Google Apps Script Backend
**ไฟล์:** `gas-backend.js` หรือ `backend/Code.gs`

**หน้าที่:**
- รับข้อมูลจากฟอร์มสมัครงาน
- บันทึกข้อมูลลง Google Sheets
- จัดการ file upload (รูปถ่าย, วุฒิการศึกษา)
- ส่ง email แจ้งเตือน HR
- สร้าง Applicant ID อัตโนมัติ

**โครงสร้าง Google Sheets:**
```
Sheet 1: Applicants (ข้อมูลผู้สมัครทั้งหมด)
- applicant_id (auto-generate)
- timestamp
- status (new/reviewed/interviewed/rejected/hired)
- position_applied
- fullname_th
- fullname_en
- email
- phone
- ... (ทุกฟิลด์จากฟอร์ม)

Sheet 2: Documents (ไฟล์ที่อัพโหลด)
- applicant_id
- document_type (photo/degree/certificate)
- file_url
- uploaded_at

Sheet 3: Status_Log (ประวัติการเปลี่ยนสถานะ)
- applicant_id
- old_status
- new_status
- changed_by
- changed_at
- notes
```

**API Endpoints:**
```javascript
POST /submitApplication    // ส่งข้อมูลฟอร์ม
POST /uploadDocument       // อัพโหลดไฟล์
GET /getApplicants         // ดึงรายชื่อผู้สมัคร (สำหรับ HR)
GET /getApplicant/:id      // ดึงข้อมูลผู้สมัครรายบุคคล
PUT /updateStatus/:id      // อัพเดทสถานะผู้สมัคร
```

#### 1.2 เชื่อมต่อฟอร์มกับ Backend
**แก้ไข:** `form-register.html`

**เพิ่ม:**
- JavaScript สำหรับส่งข้อมูลไปยัง Apps Script
- File upload handler
- Success/Error notification
- Loading state

```javascript
// ตัวอย่าง code
async function submitApplication() {
  const formData = collectFormData();
  const response = await fetch(GAS_URL + '/submitApplication', {
    method: 'POST',
    body: JSON.stringify(formData)
  });
  
  if (response.success) {
    showNotification('ส่งใบสมัครสำเร็จ!', 'success');
    // Redirect to thank you page
  } else {
    showNotification('เกิดข้อผิดพลาด: ' + response.error, 'error');
  }
}
```

#### 1.3 สร้างระบบ File Upload
**ไฟล์:** `gas-upload.js`

**หน้าที่:**
- รับไฟล์จากฟอร์ม (รูปถ่าย, วุฒิการศึกษา)
- อัพโหลดไปยัง Google Drive
- บันทึก URL ลง Google Sheets
- ตรวจสอบ file type และ size

**โครงสร้าง Google Drive:**
```
📁 Web PP7 - Applicants
  📁 Photos
    📁 [applicant_id]_photo.jpg
  📁 Degrees
    📁 [applicant_id]_degree.pdf
  📁 Certificates
    📁 [applicant_id]_cert.pdf
```

---

### Phase 2: HR Dashboard (สัปดาห์ที่ 2)

#### 2.1 สร้างหน้าจัดการผู้สมัคร
**ไฟล์:** `hr-applicant-management.html`

**Features:**
- ตารางแสดงรายชื่อผู้สมัครทั้งหมด
- Filter โดยสถานะ, ตำแหน่ง, วันที่
- Search โดยชื่อ, email, phone
- ดูรายละเอียดผู้สมัคร
- เปลี่ยนสถานะผู้สมัคร
- Export ข้อมูลเป็น Excel/PDF

**UI Components:**
```
- Header: สรุปจำนวนผู้สมัคร (ทั้งหมด/ใหม่/สัมภาษณ์/จ้าง)
- Filter Bar: สถานะ, ตำแหน่ง, วันที่
- Table: รายชื่อผู้สมัคร (checkbox, ชื่อ, ตำแหน่ง, วันที่, สถานะ, actions)
- Detail Modal: ข้อมูลผู้สมัครแบบเต็ม
- Status Dropdown: เปลี่ยนสถานะ
- Export Button: Export Excel/PDF
```

#### 2.2 สร้างหน้าดูรายละเอียดผู้สมัคร
**ไฟล์:** `hr-applicant-detail.html`

**Features:**
- แสดงข้อมูลผู้สมัครแบบเต็ม
- ดูไฟล์ที่อัพโหลด (รูปถ่าย, วุฒิการศึกษา)
- เพิ่มหมายเหตุจาก HR
- เปลี่ยนสถานะ
- ส่ง email หาผู้สมัคร

**UI Layout:**
```
Left Column (40%):
- รูปถ่าย
- ข้อมูลส่วนตัว
- ข้อมูลติดต่อ

Right Column (60%):
- ข้อมูลตำแหน่งที่สมัคร
- ที่อยู่
- ข้อมูลครอบครัว
- ความสามารถ (matrix)
- ประสบการณ์ทำงาน
- ข้อมูลทั่วไป
- Documents (ไฟล์ที่อัพโหลด)
- Notes (หมายเหตุจาก HR)
- Actions (เปลี่ยนสถานะ, ส่ง email)
```

#### 2.3 สร้างระบบแจ้งเตือน
**ไฟล์:** `gas-notifications.js`

**Features:**
- ส่ง email แจ้งเตือน HR เมื่อมีผู้สมัครใหม่
- ส่ง email แจ้งเตือนผู้สมัครเมื่อสถานะเปลี่ยน
- ส่ง SMS (ถ้าจำเป็น)
- Line notification (ถ้ามี Line API)

**Email Templates:**
```
1. New Application Alert (ส่งถึง HR)
   Subject: มีผู้สมัครใหม่: [ชื่อ] - [ตำแหน่ง]
   Body: ข้อมูลผู้สมัคร, ลิงก์ดูรายละเอียด

2. Application Received (ส่งถึงผู้สมัคร)
   Subject: รับใบสมัครงานแล้ว - [ชื่อบริษัท]
   Body: ขอบคุณที่สมัคร, ขั้นตอนต่อไป, ข้อมูลติดต่อ

3. Status Update (ส่งถึงผู้สมัคร)
   Subject: อัพเดทสถานะใบสมัคร - [ชื่อ]
   Body: สถานะใหม่, ขั้นตอนต่อไป
```

---

### Phase 3: P1 Integration (สัปดาห์ที่ 3)

#### 3.1 เชื่อมต่อกับ P1 (แสวงหา)
**แก้ไข:** `index.html` (Tab P1)

**Features:**
- แสดงจำนวนผู้สมัครใหม่
- Link ไปหน้าจัดการผู้สมัคร
- Dashboard สรุปสถานะการรับสมัคร

**UI Components:**
```
- Card: จำนวนผู้สมัครใหม่ (วันนี้/สัปดาห์นี้/เดือนนี้)
- Card: ตำแหน่งที่เปิดรับ (จำนวนผู้สมัคร/จำนวนที่รับ)
- Button: ไปหน้าจัดการผู้สมัคร
- Chart: แนวโน้มผู้สมัคร (รายวัน/รายสัปดาห์)
```

#### 3.2 สร้างระบบจัดการตำแหน่งงาน
**ไฟล์:** `hr-position-management.html`

**Features:**
- สร้าง/แก้ไข/ลบ ตำแหน่งงาน
- กำหนดจำนวนที่รับ, คุณสมบัติ, เงินเดือน
- เปิด/ปิด รับสมัคร
- ดูจำนวนผู้สมัครแต่ละตำแหน่ง

**Google Sheets Structure:**
```
Sheet: Positions
- position_id
- position_name
- department
- required_count
- qualifications
- salary_range
- status (open/closed)
- created_at
- closed_at
```

---

### Phase 4: P2 Integration (สัปดาห์ที่ 4)

#### 4.1 สร้างระบบประเมินผู้สมัคร (P2)
**ไฟล์:** `hr-assessment.html`

**Features:**
- สร้างแบบประเมิน CC (Core Competency)
- ให้คะแนนผู้สมัคร
- เปรียบเทียบผู้สมัคร
- คัดเลือกผู้ผ่านเข้าสัมภาษณ์

**Assessment Criteria (CC 5 ประการ):**
```
1. Servant Leadership (CC1)
   - การรับฟัง
   - การรับใช้
   - ความรับผิดชอบ

2. Adaptive Innovation (CC2)
   - การปรับตัว
   - การสร้างนวัตกรรม

3. Trust-Based Value Creation (CC3)
   - การสร้างความไว้วางใจ
   - การส่งมอบคุณค่า

4. Consensus-Driven Teamwork (CC4)
   - การทำงานเป็นทีม
   - การตัดสินใจด้วยฉันทมติ

5. Disciplined Professionalism (CC5)
   - วิชาชีพและวินัย
   - คุณภาพงาน
```

**Scoring System:**
```
- 1 = ต่ำมาก
- 2 = ต่ำ
- 3 = ปานกลาง
- 4 = ดี
- 5 = ดีเยี่ยม
```

---

### Phase 5: Testing & Deployment (สัปดาห์ที่ 5)

#### 5.1 Testing
- ✅ ทดสอบฟอร์มสมัครงานทุกภาษา
- ✅ ทดสอบ file upload
- ✅ ทดสอบ backend API
- ✅ ทดสอบ HR dashboard
- ✅ ทดสอบ email notification
- ✅ ทดสอบ responsive design
- ✅ ทดสอบ security (XSS, CSRF)

#### 5.2 Deployment
- Deploy Google Apps Script
- ตั้งค่า Google Sheets permissions
- ตั้งค่า Google Drive permissions
- ตั้งค่า email sending quota
- ตั้งค่า custom domain (ถ้ามี)

#### 5.3 Documentation
- สร้างคู่มือผู้ใช้ (HR)
- สร้างคู่มือผู้ใช้ (ผู้สมัคร)
- สร้าง API documentation
- สร้าง video tutorial

---

## 📊 Timeline

| สัปดาห์ | งาน | Deliverables |
|---------|-----|--------------|
| 1 | Backend Integration | gas-backend.js, Google Sheets, File upload |
| 2 | HR Dashboard | hr-applicant-management.html, hr-applicant-detail.html |
| 3 | P1 Integration | เชื่อมต่อ P1, hr-position-management.html |
| 4 | P2 Integration | hr-assessment.html, CC assessment |
| 5 | Testing & Deployment | Testing report, Deployment, Documentation |

---

## 🔧 Technical Stack

**Frontend:**
- HTML5 + TailwindCSS
- JavaScript (Vanilla)
- Chart.js (สำหรับ dashboard)

**Backend:**
- Google Apps Script
- Google Sheets (Database)
- Google Drive (File storage)
- Gmail API (Email notification)

**Authentication:**
- Google OAuth (สำหรับ HR)
- No auth (สำหรับผู้สมัคร)

**Security:**
- HTTPS only
- Input validation (client + server)
- File type validation
- Rate limiting
- CORS configuration

---

## 📝 Next Action Items

### วันนี้ (5 ส.ค. 2569)
1. ✅ สร้างเอกสารแผนงาน PM (ไฟล์นี้)
2. ⏳ สร้าง Google Apps Script Backend
3. ⏳ สร้าง Google Sheets structure
4. ⏳ ทดสอบ API endpoints

### พรุ่งนี้ (6 ส.ค. 2569)
1. ⏳ เชื่อมต่อฟอร์มกับ Backend
2. ⏳ สร้างระบบ File upload
3. ⏳ ทดสอบ end-to-end flow

### สัปดาห์นี้ (5-9 ส.ค. 2569)
1. ⏳ สร้าง HR Dashboard
2. ⏳ สร้างระบบแจ้งเตือน
3. ⏳ ทดสอบระบบทั้งหมด

---

## 🎯 Success Metrics

**Phase 1 (Backend):**
- ✅ ฟอร์มส่งข้อมูลได้สำเร็จ
- ✅ ข้อมูลบันทึกใน Google Sheets
- ✅ ไฟล์อัพโหลดไป Google Drive
- ✅ Email แจ้งเตือนทำงาน

**Phase 2 (HR Dashboard):**
- ✅ HR ดูรายชื่อผู้สมัครได้
- ✅ HR เปลี่ยนสถานะผู้สมัครได้
- ✅ HR export ข้อมูลได้

**Phase 3 (P1 Integration):**
- ✅ P1 แสดงจำนวนผู้สมัครใหม่
- ✅ HR จัดการตำแหน่งงานได้

**Phase 4 (P2 Integration):**
- ✅ HR ประเมินผู้สมัครได้
- ✅ ระบบคำนวณคะแนน CC

**Phase 5 (Deployment):**
- ✅ ระบบ live บน production
- ✅ เอกสารคู่มือครบถ้วน
- ✅ HR ใช้งานได้จริง

---

## 📞 Contact

**PM:** KiloClaw AI Assistant  
**Executive Sponsor:** ปกรณ์ (PKG)  
**Team:** PADClaw (beta)  
**Chat:** Telegram -5106159211

---

**สร้างโดย:** KiloClaw AI Assistant  
**วันที่:** 5 สิงหาคม 2569  
**Version:** 1.0  
**สถานะ:** ✅ พร้อมดำเนินการ
