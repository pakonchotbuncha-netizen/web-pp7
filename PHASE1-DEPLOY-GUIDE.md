# 🚀 คู่มือ Deploy Backend ระยะที่ 1

**วันที่:** 5 สิงหาคม 2569  
**สถานะ:** ✅ พร้อม deploy

---

## สิ่งที่ต้องทำ (5 ขั้นตอน)

### ขั้นตอนที่ 1: สร้าง Google Sheets

1. ไปที่ https://sheets.google.com
2. สร้าง Spreadsheet ใหม่ → ตั้งชื่อ **"Web PP7 - Applicants Database"**
3. Copy **Spreadsheet ID** จาก URL:
   ```
   https://docs.google.com/spreadsheets/d/[SPREADSHEET_ID]/edit
   ```
4. **บันทึก ID นี้ไว้** (จะใช้ในขั้นตอนที่ 3)

---

### ขั้นตอนที่ 2: สร้าง Google Apps Script

1. ไปที่ https://script.google.com
2. คลิก **"New Project"**
3. ตั้งชื่อโปรเจคว่า **"Web PP7 - Backend"**
4. **ลบโค้ดเดิมทั้งหมด**ในไฟล์ `Code.gs`
5. **Copy โค้ดจากไฟล์ `gas-code.js`** ทั้งหมด (อยู่ใน repo นี้)
6. **Paste** ลงใน Apps Script editor

---

### ขั้นตอนที่ 3: แก้ไข Configuration

ในไฟล์ `Code.gs` แก้ไขบรรทัดแรก:

```javascript
const SPREADSHEET_ID = 'YOUR_SPREADSHEET_ID_HERE';
```

เปลี่ยนเป็น:

```javascript
const SPREADSHEET_ID = 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx';
```

(ใช้ ID ที่ copy จากขั้นตอนที่ 1)

---

### ขั้นตอนที่ 4: Deploy เป็น Web App

1. คลิกปุ่ม **"Deploy"** (มุมขวาบน)
2. เลือก **"New deployment"**
3. คลิกไอคอน ⚙️ → เลือก **"Web app"**
4. กรอกข้อมูล:
   - **Description:** `Web PP7 Backend v1.0`
   - **Execute as:** `Me`
   - **Who has access:** `Anyone`
5. คลิก **"Deploy"**
6. **Copy URL** ที่ได้:
   ```
   https://script.google.com/macros/s/xxxxxxxxxxxxx/exec
   ```

---

### ขั้นตอนที่ 5: เชื่อมต่อฟอร์มกับ Backend

1. เปิดไฟล์ `form-register.html`
2. ค้นหาบรรทัดนี้ (ประมาณบรรทัด 855):
   ```javascript
   const GAS_URL = 'YOUR_GAS_WEB_APP_URL_HERE';
   ```
3. เปลี่ยนเป็น URL ที่ได้จากขั้นตอนที่ 4:
   ```javascript
   const GAS_URL = 'https://script.google.com/macros/s/xxxxxxxxxxxxx/exec';
   ```
4. Save และ push ขึ้น GitHub

---

## ✅ ทดสอบระบบ

1. เปิดฟอร์ม: https://pakonchotbuncha-netizen.github.io/web-pp7/form-register.html
2. กรอกข้อมูลทดสอบ (กรอกให้ครบทุก required field)
3. กด **"ส่งใบสมัคร"**
4. ตรวจสอบ:
   - ✅ แสดง "ส่งใบสมัครสำเร็จ!" พร้อม Applicant ID
   - ✅ เปิด Google Sheets → มีข้อมูลใหม่ใน sheet "Applicants"
   - ✅ เปิด sheet "Logs" → มี log การ submit

---

## 📊 สิ่งที่ได้หลัง deploy

| รายการ | สถานะ |
|--------|-------|
| ฟอร์มสมัครงาน 4 ภาษา | ✅ พร้อม |
| Backend API (Google Apps Script) | ✅ พร้อม |
| Google Sheets Database | ✅ สร้างอัตโนมัติ |
| Applicant ID อัตโนมัติ | ✅ |
| Logging System | ✅ |
| HR Dashboard | ❌ ระยะที่ 2 |
| Email Notification | ❌ ระยะที่ 2 |

---

## 🔧 ปัญหาที่อาจเจอ

### ปัญหา: "Script function not found: doGet"
**วิธีแก้:** ตรวจสอบว่า copy โค้ดครบถ้วน และมี function `doGet` และ `doPost`

### ปัญหา: "You do not have permission to call SpreadsheetApp.openById"
**วิธีแก้:** 
1. รัน function `initializeSheet` ก่อน (คลิก Run)
2. อนุญาต permission ที่ขอ

### ปัญหา: "CORS error" หรือ "Network error"
**วิธีแก้:** 
1. ตรวจสอบว่า Deploy เป็น "Anyone" access
2. ใช้ URL ที่ขึ้นต้นด้วย `https://script.google.com/macros/s/`
3. อย่าใช้ URL ที่ขึ้นต้นด้วย `https://script.google.com/dev/`

### ปัญหา: ข้อมูลไม่เข้า Sheets
**วิธีแก้:**
1. ตรวจสอบ SPREADSHEET_ID ว่าถูกต้อง
2. ตรวจสอบว่า Apps Script มี permission เข้าถึง Sheets
3. ดู Execution log ใน Apps Script

---

## 📞 ต้องการความช่วยเหลือ?

ถ้าติดปัญหาใดๆ แจ้งพี่ปกรณ์ได้เลยครับ ผมจะแก้ไขให้ทันที

**ไฟล์ที่เกี่ยวข้อง:**
- `gas-code.js` - Backend code (copy ไปวางใน Apps Script)
- `form-register.html` - ฟอร์มสมัครงาน (ต้องแก้ GAS_URL)
- `PHASE1-DEPLOY-GUIDE.md` - คู่มือนี้
