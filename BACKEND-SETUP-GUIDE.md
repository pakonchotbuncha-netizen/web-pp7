# 📦 คู่มือการติดตั้ง Backend - Web PP7 Application Form

**วันที่:** 5 สิงหาคม 2569  
**Version:** 1.0.0  
**สถานะ:** ✅ พร้อมติดตั้ง

---

## 📋 สิ่งที่ต้องเตรียม

### 1. Google Account
- ✅ Google Account ที่มี Google Drive
- ✅ Google Account ที่มี Google Sheets
- ✅ Google Account ที่มี Google Apps Script access

### 2. ข้อมูลที่ต้องมี
- 📧 Email HR สำหรับรับแจ้งเตือน (เช่น hr@prachakij.com)
- 📁 Google Drive Folder ID สำหรับเก็บไฟล์ผู้สมัคร
- 📊 Google Sheets Spreadsheet ID สำหรับเก็บข้อมูล

---

## 🚀 ขั้นตอนการติดตั้ง

### Step 1: สร้าง Google Sheets

1. ไปที่ [Google Sheets](https://sheets.google.com)
2. สร้าง Spreadsheet ใหม่ ชื่อ "Web PP7 - Applicants Database"
3. Copy **Spreadsheet ID** จาก URL:
   ```
   https://docs.google.com/spreadsheets/d/[SPREADSHEET_ID]/edit
   ```
4. บันทึก ID นี้ไว้ (จะใช้ใน Step 3)

### Step 2: สร้าง Google Drive Folder

1. ไปที่ [Google Drive](https://drive.google.com)
2. สร้าง Folder ใหม่ ชื่อ "Web PP7 - Applicant Documents"
3. คลิกขวาที่ Folder → "Get link" → "Copy link"
4. Extract **Folder ID** จาก URL:
   ```
   https://drive.google.com/drive/folders/[FOLDER_ID]
   ```
5. บันทึก ID นี้ไว้ (จะใช้ใน Step 3)

### Step 3: ตั้งค่า Google Apps Script

1. ไปที่ [Google Apps Script](https://script.google.com)
2. คลิก "New Project"
3. ตั้งชื่อโปรเจคว่า "Web PP7 - Backend API"
4. ลบ code เดิมออกทั้งหมด
5. Copy code จากไฟล์ `gas-backend.js` ทั้งหมด
6. Paste ลงใน Apps Script editor
7. แก้ไข CONFIG ในบรรทัดแรก:

```javascript
const CONFIG = {
  SPREADSHEET_ID: 'YOUR_SPREADSHEET_ID_HERE', // ← ใส่ ID จาก Step 1
  DRIVE_FOLDER_ID: 'YOUR_DRIVE_FOLDER_ID_HERE', // ← ใส่ ID จาก Step 2
  HR_EMAIL: 'hr@prachakij.com', // ← ใส่ email HR จริง
  COMPANY_NAME: 'บริษัท ประชากิจมอเตอร์เซลส์ จำกัด',
  APPLICANT_SHEET: 'Applicants',
  DOCUMENTS_SHEET: 'Documents',
  STATUS_LOG_SHEET: 'Status_Log'
};
```

8. บันทึกโปรเจค (Ctrl+S)

### Step 4: Initialize Google Sheets

1. ใน Apps Script editor เลือก function `initializeSheets` จาก dropdown
2. คลิกปุ่ม "Run" (▶️)
3. ระบบจะขอ permission:
   - คลิก "Review permissions"
   - เลือก Google Account
   - คลิก "Advanced" → "Go to Web PP7 - Backend API (unsafe)"
   - คลิก "Allow"
4. รอจนกว่าจะเสร็จ (ดูที่ Executions log)
5. ตรวจสอบว่าสร้าง Sheets 3 แผ่นแล้ว:
   - ✅ Applicants
   - ✅ Documents
   - ✅ Status_Log

### Step 5: Deploy Web App

1. คลิก "Deploy" → "New deployment"
2. คลิก gear icon ⚙️ → เลือก "Web app"
3. กรอกข้อมูล:
   - **Description:** Web PP7 Backend API v1.0
   - **Execute as:** Me (your email)
   - **Who has access:** Anyone
4. คลิก "Deploy"
5. Copy **Web app URL**:
   ```
   https://script.google.com/macros/s/[DEPLOYMENT_ID]/exec
   ```
6. บันทึก URL นี้ไว้ (จะใช้ใน Step 6)

### Step 6: อัพเดทฟอร์มสมัครงาน

1. เปิดไฟล์ `form-register.html`
2. ค้นหาบรรทัดนี้ (ประมาณบรรทัด 1600):
   ```javascript
   const GAS_URL = 'YOUR_GAS_WEB_APP_URL_HERE';
   ```
3. แทนที่ `YOUR_GAS_WEB_APP_URL_HERE` ด้วย URL จาก Step 5
4. บันทึกไฟล์

### Step 7: ทดสอบระบบ

1. เปิดฟอร์มสมัครงาน:
   ```
   https://pakonchotbuncha-netizen.github.io/web-pp7/form-register.html
   ```
2. กรอกข้อมูลทดสอบ (ใช้ email จริงของคุณ)
3. กด "ส่งใบสมัคร"
4. ตรวจสอบ:
   - ✅ แสดงข้อความ "ส่งใบสมัครสำเร็จ"
   - ✅ ได้รับ email ยืนยัน (ตรวจสอบ inbox)
   - ✅ ข้อมูลปรากฏใน Google Sheets (Applicants sheet)
   - ✅ HR ได้รับ email แจ้งเตือน

### Step 8: ตั้งค่า Permissions (ถ้าจำเป็น)

ถ้าต้องการให้ HR หลายคนเข้าถึงได้:

1. เปิด Google Sheets
2. คลิก "Share"
3. เพิ่ม email ของ HR
4. ตั้ง permission เป็น "Editor"

---

## 🔧 การแก้ไขปัญหา

### ปัญหา: "Script function not found"
**สาเหตุ:** ยังไม่ได้ run `initializeSheets`  
**วิธีแก้:** ทำตาม Step 4 อีกครั้ง

### ปัญหา: "Permission denied"
**สาเหตุ:** ยังไม่ได้ authorize permissions  
**วิธีแก้:**
1. ไปที่ Apps Script editor
2. คลิก "Run" → เลือก function ใดก็ได้
3. อนุญาต permissions ทั้งหมด

### ปัญหา: "File not uploaded"
**สาเหตุ:** Drive folder ID ผิด หรือไม่มี permission  
**วิธีแก้:**
1. ตรวจสอบ Folder ID ว่าถูกต้อง
2. ตรวจสอบว่า Apps Script มี permission เข้าถึง Drive

### ปัญหา: "Email not sent"
**สาเหตุ:** Email quota เต็ม (500 emails/day สำหรับ free account)  
**วิธีแก้:**
1. รอดูวันถัดไป
2. หรือใช้ Google Workspace account (quota สูงกว่า)

---

## 📊 โครงสร้าง Google Sheets

### Sheet 1: Applicants
เก็บข้อมูลผู้สมัครทั้งหมด (70+ columns)

**Columns สำคัญ:**
- `applicant_id` - รหัสผู้สมัคร (auto-generate)
- `timestamp` - วันที่สมัคร
- `status` - สถานะ (new/reviewed/interviewed/rejected/hired)
- `position_open` - ตำแหน่งที่สมัคร
- `firstname_th`, `lastname_th` - ชื่อ-นามสกุล ภาษาไทย
- `email`, `phone` - ข้อมูลติดต่อ
- ... (ดู code สำหรับ columns ทั้งหมด)

### Sheet 2: Documents
เก็บข้อมูลไฟล์ที่อัพโหลด

**Columns:**
- `applicant_id` - รหัสผู้สมัคร
- `document_type` - ประเภท (photo/degree/certificate)
- `filename` - ชื่อไฟล์
- `file_url` - URL ของไฟล์ใน Drive
- `uploaded_at` - วันที่อัพโหลด

### Sheet 3: Status_Log
เก็บประวัติการเปลี่ยนสถานะ

**Columns:**
- `applicant_id` - รหัสผู้สมัคร
- `old_status` - สถานะเดิม
- `new_status` - สถานะใหม่
- `changed_by` - ผู้ที่เปลี่ยน
- `changed_at` - วันที่เปลี่ยน
- `notes` - หมายเหตุ

---

## 📁 โครงสร้าง Google Drive

```
📁 Web PP7 - Applicant Documents
  📁 APP-1234567890-123
    📁 photo
      📄 photo.jpg
    📁 degree
      📄 degree.pdf
    📁 certificate
      📄 cert1.pdf
      📄 cert2.pdf
  📁 APP-1234567891-456
    📁 photo
      📄 photo.jpg
    ...
```

---

## 🎯 Next Steps

### 1. สร้าง HR Dashboard
- ไฟล์: `hr-applicant-management.html`
- Features: ดูรายชื่อ, filter, search, export

### 2. สร้างหน้าดูรายละเอียดผู้สมัคร
- ไฟล์: `hr-applicant-detail.html`
- Features: ดูข้อมูลเต็ม, ดูไฟล์, เปลี่ยนสถานะ

### 3. สร้างระบบแจ้งเตือน
- เพิ่ม Line notification (ถ้ามี Line API)
- เพิ่ม SMS notification (ถ้าจำเป็น)

### 4. สร้างระบบประเมินผู้สมัคร (P2)
- ไฟล์: `hr-assessment.html`
- Features: ให้คะแนน CC, เปรียบเทียบผู้สมัคร

---

## 📞 Support

**ปัญหาในการติดตั้ง?**
- ตรวจสอบ Executions log ใน Apps Script
- ดู Console log ใน browser (F12)
- ตรวจสอบ Google Sheets และ Drive permissions

**ติดต่อ:**
- PM: KiloClaw AI Assistant
- Chat: Telegram PADClaw (beta) -5106159211

---

## ✅ Checklist การติดตั้ง

- [ ] สร้าง Google Sheets และ copy ID
- [ ] สร้าง Google Drive Folder และ copy ID
- [ ] สร้าง Apps Script project
- [ ] Copy code `gas-backend.js`
- [ ] แก้ไข CONFIG (Spreadsheet ID, Drive ID, HR Email)
- [ ] Run `initializeSheets`
- [ ] Deploy Web App
- [ ] Copy Web App URL
- [ ] อัพเดท `form-register.html` (GAS_URL)
- [ ] ทดสอบส่งใบสมัคร
- [ ] ตรวจสอบ email แจ้งเตือน
- [ ] ตรวจสอบข้อมูลใน Google Sheets
- [ ] ตรวจสอบไฟล์ใน Google Drive

---

**สร้างโดย:** KiloClaw AI Assistant  
**วันที่:** 5 สิงหาคม 2569  
**Version:** 1.0.0  
**สถานะ:** ✅ พร้อมใช้งาน
