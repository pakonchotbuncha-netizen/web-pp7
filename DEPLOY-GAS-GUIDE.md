# 🚀 คู่มือ Deploy Google Apps Script สำหรับ Web PP7

## สิ่งที่ต้องทำ

### ขั้นตอนที่ 1: เตรียม Google Sheets

1. เปิด Google Sheets ที่ต้องการใช้เป็นฐานข้อมูล
2. คัดลอก **Spreadsheet ID** จาก URL:
   ```
   https://docs.google.com/spreadsheets/d/[SPREADSHEET_ID]/edit
   ```
3. สร้างโฟลเดอร์ใน Google Drive สำหรับเก็บเอกสารผู้สมัคร
4. คัดลอก **Drive Folder ID** จาก URL:
   ```
   https://drive.google.com/drive/folders/[FOLDER_ID]
   ```

### ขั้นตอนที่ 2: สร้าง Google Apps Script Project

1. ไปที่ https://script.google.com/
2. คลิก **"New Project"**
3. ลบโค้ดเดิมทั้งหมด
4. คัดลอกโค้ดจากไฟล์ `gas-backend.js` ไปวาง
5. แก้ไขค่า CONFIG:
   ```javascript
   const CONFIG = {
     SPREADSHEET_ID: 'ใส่_SPREADSHEET_ID_ที่นี่',
     DRIVE_FOLDER_ID: 'ใส่_DRIVE_FOLDER_ID_ที่นี่',
     HR_EMAIL: 'hr@prachakij.com', // เปลี่ยนเป็นอีเมล HR จริง
     COMPANY_NAME: 'บริษัท ประชากิจมอเตอร์เซลส์ จำกัด',
     APPLICANT_SHEET: 'Applicants',
     DOCUMENTS_SHEET: 'Documents',
     STATUS_LOG_SHEET: 'Status_Log'
   };
   ```

### ขั้นตอนที่ 3: Initialize Sheets (รันครั้งแรก)

1. ใน Google Apps Script editor
2. เลือก function `initializeSheets` จาก dropdown
3. คลิก **"Run"**
4. อนุญาตสิทธิ์ (Authorize) เมื่อถูกถาม
5. ตรวจสอบว่า Google Sheets มี tabs: Applicants, Documents, Status_Log

### ขั้นตอนที่ 4: Deploy เป็น Web App

1. คลิก **"Deploy"** → **"New deployment"**
2. คลิกไอคอนฟันเฟือง ️ → เลือก **"Web app"**
3. ตั้งค่า:
   - **Description:** Web PP7 Backend
   - **Execute as:** Me (อีเมลของคุณ)
   - **Who has access:** Anyone
4. คลิก **"Deploy"**
5. คัดลอก **Web App URL** (จะอยู่ในรูปแบบ):
   ```
   https://script.google.com/macros/s/[DEPLOYMENT_ID]/exec
   ```

### ขั้นตอนที่ 5: อัพเดท GAS_URL ใน hr-dashboard.html

1. เปิดไฟล์ `hr-dashboard.html`
2. ค้นหาบรรทัดที่ 269:
   ```javascript
   const GAS_URL = 'https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec';
   ```
3. เปลี่ยน `YOUR_DEPLOYMENT_ID` เป็น Deployment ID ที่ได้จากขั้นตอนที่ 4
4. บันทึกไฟล์
5. Commit ขึ้น GitHub:
   ```bash
   git add hr-dashboard.html
   git commit -m "Update GAS_URL with actual deployment ID"
   git push
   ```

### ขั้นตอนที่ 6: ทดสอบระบบ

1. เปิด https://pakonchotbuncha-netizen.github.io/web-pp7/hr-dashboard.html
2. ควรเห็นข้อมูลผู้สมัคร (ถ้ามี) หรือข้อความ "ไม่มีผู้สมัคร"
3. ทดสอบค้นหา/กรอง
4. ทดสอบเปลี่ยนสถานะ
5. ทดสอบลบผู้สมัคร

### ขั้นตอนที่ 7: ทดสอบ Email Notification

1. เปิดฟอร์มสมัครงาน: https://pakonchotbuncha-netizen.github.io/web-pp7/form-register.html
2. กรอกข้อมูลและ submit
3. ตรวจสอบอีเมล HR ว่าได้รับการแจ้งเตือน
4. ตรวจสอบอีเมลผู้สมัครว่าได้รับ confirmation

---

## 🔧 Troubleshooting

### ปัญหา: "ไม่สามารถโหลดข้อมูลได้"
- ตรวจสอบว่า GAS_URL ถูกต้อง
- ตรวจสอบว่า Web App deploy เป็น "Anyone"
- เปิด Browser Console (F12) ดู error

### ปัญหา: "Permission denied"
- รัน `initializeSheets` อีกครั้ง
- ตรวจสอบว่า Spreadsheet ID ถูกต้อง
- ตรวจสอบว่า Owner ของ Script มีสิทธิ์เข้าถึง Sheets

### ปัญหา: Email ไม่ส่ง
- ตรวจสอบว่า HR_EMAIL ถูกต้อง
- ตรวจสอบว่าอีเมลผู้สมัครถูกต้อง
- ดู Execution Log ใน Google Apps Script

---

## ✅ Checklist

- [ ] สร้าง Google Sheets
- [ ] สร้าง Drive Folder
- [ ] คัดลอก Spreadsheet ID
- [ ] คัดลอก Drive Folder ID
- [ ] สร้าง Google Apps Script Project
- [ ] วางโค้ด gas-backend.js
- [ ] แก้ไข CONFIG
- [ ] รัน initializeSheets
- [ ] Deploy เป็น Web App
- [ ] คัดลอก Web App URL
- [ ] อัพเดท GAS_URL ใน hr-dashboard.html
- [ ] Commit ขึ้น GitHub
- [ ] ทดสอบ Dashboard
- [ ] ทดสอบ Email Notification

---

**พร้อมแล้วครับ!** 

ถ้าติดขัดตรงไหนถามได้เลยนะครับ
