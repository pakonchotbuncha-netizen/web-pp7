# 📋 คู่มือการ Deploy ระยะที่ 1 - Web PP7 Backend

## 🎯 เป้าหมาย
ทำให้ฟอร์มสมัครงานสามารถบันทึกข้อมูลลง Google Sheets ได้จริง

---

## ✅ สิ่งที่ต้องทำ (4 ขั้นตอน - เหลือ 4 ขั้นตอนเพราะ Sheets พร้อมแล้ว)

### ✅ ขั้นตอนที่ 1: Google Sheets พร้อมแล้ว

**Spreadsheet ID:** `1FfpF4hT7vV-ZIyeHVb31MUJh_3kXMX52x0sYJGUr6kU`

**URL:** https://docs.google.com/spreadsheets/d/1FfpF4hT7vV-ZIyeHVb31MUJh_3kXMX52x0sYJGUr6kU/edit

✅ อัพเดทใน `gas-code.js` เรียบร้อยแล้ว

---

### ขั้นตอนที่ 2: Import CSV Template

1. เปิด Google Sheets: https://docs.google.com/spreadsheets/d/1FfpF4hT7vV-ZIyeHVb31MUJh_3kXMX52x0sYJGUr6kU/edit
2. คลิก **File** → **Import**
3. เลือกไฟล์ `database-template.csv` (อยู่ใน repo นี้)
4. เลือก **Replace current sheet**
5. คลิก **Import data**

---

### ขั้นตอนที่ 3: สร้าง Google Apps Script

1. ไปที่ [Google Apps Script](https://script.google.com)
2. คลิก **New Project**
3. ตั้งชื่อโปรเจคว่า **"Web PP7 - Backend API"**
4. ลบโค้ดเดิมทั้งหมดใน `Code.gs`
5. Copy โค้ดจากไฟล์ `gas-code.js` (อยู่ใน repo นี้) ไปวาง
6. บันทึกโปรเจค (Ctrl+S)

---

### ขั้นตอนที่ 4: Deploy Apps Script

1. คลิก **Deploy** (มุมขวาบน)
2. คลิก **New deployment**
3. คลิกไอคอน ⚙️ → เลือก **Web app**
4. กรอกข้อมูล:
   - **Description:** `Web PP7 Backend API v1.0`
   - **Execute as:** `Me`
   - **Who has access:** `Anyone`
5. คลิก **Deploy**
6. **Copy URL** ที่ได้ (จะขึ้นต้นด้วย `https://script.google.com/macros/s/...`)
   ```
   https://script.google.com/macros/s/AKfycbx.../exec
   ```
7. บันทึก URL นี้ไว้ (จะใช้ในขั้นตอนที่ 5)

---

### ขั้นตอนที่ 5: เชื่อมต่อฟอร์มกับ Backend

1. เปิดไฟล์ `form-register.html`
2. ค้นหาบรรทัดที่ 855:
   ```javascript
   const GAS_URL = 'YOUR_GAS_WEB_APP_URL_HERE';
   ```
3. เปลี่ยนเป็น URL ที่ได้จากขั้นตอนที่ 4:
   ```javascript
   const GAS_URL = 'https://script.google.com/macros/s/AKfycbx.../exec';
   ```
4. บันทึกไฟล์

---

### ขั้นตอนที่ 6: ทดสอบระบบ

1. เปิดฟอร์ม: https://pakonchotbuncha-netizen.github.io/web-pp7/form-register.html
2. กรอกข้อมูลทดสอบ (กรอกให้ครบทุก required field)
3. กดปุ่ม **ส่งใบสมัคร**
4. ตรวจสอบ:
   - ✅ แสดงข้อความ "ส่งใบสมัครสำเร็จ!" พร้อม Applicant ID
   - ✅ เปิด Google Sheets → มีข้อมูลใหม่ใน sheet "Applicants"
   - ✅ Applicant ID เป็นรูปแบบ `APP-xxxxxxxxxx-xxx`

---

## 🔧 การแก้ไขปัญหา

### ปัญหา: "Script function not found: doGet"
**สาเหตุ:** ไม่ได้ deploy เป็น Web app  
**วิธีแก้:** ตรวจสอบว่าเลือก **Web app** ในขั้นตอน Deploy

### ปัญหา: "You do not have permission to call SpreadsheetApp.openById"
**สาเหตุ:** Apps Script ไม่มีสิทธิ์เข้าถึง Google Sheets  
**วิธีแก้:**
1. เปิด Google Sheets
2. คลิก **Share**
3. เพิ่ม email ของ Google Account ที่ใช้รัน Apps Script
4. ตั้งเป็น **Editor**

### ปัญหา: ข้อมูลไม่เข้า Sheets
**สาเหตุ:** SPREADSHEET_ID ผิด หรือ Sheet name ไม่ตรง  
**วิธีแก้:**
1. ตรวจสอบ SPREADSHEET_ID ว่าถูกต้อง
2. ตรวจสอบว่า Sheet name เป็น "Applicants" (ตรงตามโค้ด)
3. ดู Execution log ใน Apps Script (คลิก View → Logs)

### ปัญหา: CORS Error
**สาเหตุ:** Deploy ไม่ถูกต้อง  
**วิธีแก้:**
1. ตรวจสอบว่าเลือก **Who has access: Anyone**
2. Re-deploy ใหม่ (Deploy → Manage deployments → Edit → New version)

---

## 📊 โครงสร้าง Database

### Sheet: Applicants
เก็บข้อมูลผู้สมัครทั้งหมด (74 columns)

**Columns สำคัญ:**
- `Applicant ID` - รหัสผู้สมัคร (auto-generate)
- `Timestamp` - วันที่สมัคร
- `Status` - สถานะ (new/reviewed/interviewed/rejected/hired)
- `Position Open` - ตำแหน่งที่สมัคร
- `First Name (TH)` - ชื่อภาษาไทย
- `First Name (EN)` - ชื่อภาษาอังกฤษ
- `Email` - อีเมล
- `Phone` - เบอร์โทรศัพท์
- ... (ดู CSV template สำหรับ columns ทั้งหมด)

### Sheet: Logs
เก็บ log การทำงานของระบบ

**Columns:**
- `Timestamp` - เวลา
- `Action` - การกระทำ (submitApplication, updateStatus, etc.)
- `Applicant ID` - รหัสผู้สมัคร
- `Message` - ข้อความ

---

## 🚀 ขั้นตอนต่อไป (ระยะที่ 2)

หลังจากระยะที่ 1 เสร็จแล้ว จะทำ:
1. **HR Dashboard** - หน้าจัดการผู้สมัคร
2. **Email Notification** - แจ้งเตือนเมื่อมีผู้สมัครใหม่
3. **File Upload** - อัพโหลดรูปถ่ายและเอกสาร
4. **Status Management** - เปลี่ยนสถานะผู้สมัคร

---

## 📞 ติดต่อ

ถ้ามีปัญหาหรือข้อสงสัย:
- สร้าง Issue ใน GitHub
- หรือติดต่อ PM (KiloClaw)

---

**สร้างโดย:** KiloClaw AI Assistant  
**วันที่:** 2026-08-05  
**เวอร์ชัน:** 1.0
