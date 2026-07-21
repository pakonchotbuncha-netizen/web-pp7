# Web PP7 Auth Backend — Google Apps Script

## 📋 วิธี Deploy

### 1. สร้าง Google Sheet ใหม่
1. ไปที่ [Google Sheets](https://sheets.google.com)
2. สร้าง Sheet ใหม่ ตั้งชื่อ **"Web PP7 Auth"**
3. Copy **Spreadsheet ID** จาก URL
   - URL: `https://docs.google.com/spreadsheets/d/`**`SPREADSHEET_ID`**`/edit`
   - เก็บ ID นี้ไว้

### 2. เปิด Apps Script Editor
1. ใน Google Sheet ที่สร้าง ไปที่ **Extensions > Apps Script**
2. ลบโค้ดเดิมใน `Code.gs` ออก
3. Copy โค้ดจาก `apps-script/Code.gs` ทั้งหมดไปวาง
4. **แก้ `SPREADSHEET_ID`** ในบรรทัดแรกสุด:
   ```javascript
   const SPREADSHEET_ID = 'YOUR_SPREADSHEET_ID_HERE';
   ```
   เปลี่ยนเป็น ID ที่ copy มาจากขั้นตอน 1

### 3. รัน Setup
1. ใน Apps Script Editor เลือก function **`setup`** จาก dropdown
2. กด **Run** (ปุ่ม ▶️)
3. อนุญาตสิทธิ์ที่ขอ (เข้าถึง Google Sheets)
4. ตรวจสอบใน Google Sheet ว่ามี 4 sheets:
   - `users`
   - `access_logs`
   - `password_recovery`
   - `sessions`
5. ตรวจสอบว่ามี demo users 5 คนใน sheet `users`

### 4. Deploy เป็น Web App
1. กด **Deploy > New deployment**
2. เลือก **Type: Web app**
3. ตั้งค่า:
   - **Description**: Web PP7 Auth API
   - **Execute as**: Me (your email)
   - **Who has access**: Anyone
4. กด **Deploy**
5. Copy **Web app URL** ที่ได้จาก popup
   - URL: `https://script.google.com/macros/s/`**`DEPLOYMENT_ID`**`/exec`

### 5. ตั้งค่า Frontend
1. เปิดไฟล์ `auth-config-api.js`
2. แก้บรรทัด:
   ```javascript
   const API_BASE_URL = 'YOUR_GAS_WEB_APP_URL';
   ```
   เปลี่ยนเป็น URL ที่ copy จากขั้นตอน 4

### 6. ทดสอบ
1. เปิด `auth-login.html` ในเบราว์เซอร์
2. ลอง login ด้วย:
   - **ID**: `PKG001`
   - **Password**: `pass1234`
3. ถ้า login สำเร็จ จะไปหน้า Admin Panel

## 🔐 Demo Users

| ID | Password | Role |
|----|----------|------|
| PKG001 | pass1234 | admin |
| HR001 | pass1234 | operator |
| BMC001 | pass1234 | bmc |
| EMP001 | pass1234 | user |
| EXT-APP-001 | pass1234 | external |

## 📊 API Endpoints

### Authentication
- `login` - เข้าสู่ระบบ
- `forgot_password` - ขอลืมรหัสผ่าน (ส่ง OTP)
- `verify_otp` - ยืนยัน OTP
- `reset_password` - ตั้งรหัสผ่านใหม่

### User Management (Admin only)
- `get_users` - ดึงรายชื่อผู้ใช้
- `create_user` - สร้างผู้ใช้ใหม่
- `update_user` - แก้ไขผู้ใช้
- `delete_user` - ลบผู้ใช้ (soft delete)

### Logs & Stats
- `get_access_logs` - ดึงบันทึกการเข้าถึง
- `get_stats` - ดึงสถิติ

## 🛡️ Security Notes

### Production Checklist
- [ ] เปลี่ยน `SPREADSHEET_ID` เป็น Sheet จริง
- [ ] เปลี่ยน `API_BASE_URL` เป็น URL ของ GAS ที่ deploy แล้ว
- [ ] ลบ `otp` ออกจาก response ใน `handleForgotPassword` (บรรทัด `otp: otp`)
- [ ] เปิดใช้ Gmail API สำหรับส่ง OTP จริง (แก้ `handleForgotPassword`)
- [ ] ตั้งค่า CORS ถ้าจำเป็น
- [ ] ใช้ HTTPS เท่านั้น
- [ ] เปลี่ยนรหัสผ่าน demo users ทั้งหมด
- [ ] ตั้งค่า Google Sheet permissions (เฉพาะ owner แก้ไขได้)

### Password Policy
- ขั้นต่ำ 8 ตัวอักษร
- ต้องมีตัวพิมพ์ใหญ่ 1 ตัว
- ต้องมีตัวพิมพ์เล็ก 1 ตัว
- ต้องมีตัวเลข 1 ตัว

### Session Management
- Admin/Operator/BMC: 8 ชั่วโมง
- User: 4 ชั่วโมง
- External: 2 ชั่วโมง

## 📝 Troubleshooting

### "Permission denied" error
- ตรวจสอบว่า deploy ด้วย "Execute as: Me"
- ตรวจสอบว่า "Who has access: Anyone"

### "Sheet not found" error
- รัน function `setup` อีกครั้ง
- ตรวจสอบว่า `SPREADSHEET_ID` ถูกต้อง

### Login ไม่ผ่าน
- ตรวจสอบว่า demo users ถูกสร้างใน sheet `users`
- ตรวจสอบว่า password ถูก hash ด้วย SHA-256

### API call ล้มเหลว
- ตรวจสอบ Console ในเบราว์เซอร์ (F12)
- ตรวจสอบ CORS settings ใน GAS
- ตรวจสอบว่า Web App URL ถูกต้อง

## 🚀 Next Steps

1. **Force Change Password** - บังคับเปลี่ยนรหัสครั้งแรก
2. **Email OTP** - ส่ง OTP ผ่าน Gmail API
3. **Integrate with index.html** - เชื่อม access control กับหน้าหลัก
4. **Audit Log Viewer** - หน้าดู logs แบบละเอียด
5. **Role-based UI** - ซ่อน/แสดงเมนูตาม role

## 📚 Resources

- [Google Apps Script Documentation](https://developers.google.com/apps-script)
- [Web Apps in GAS](https://developers.google.com/apps-script/guides/web)
- [Google Sheets API](https://developers.google.com/sheets/api)

---

**สร้างโดย**: KiloClaw 🦾
**วันที่**: 2026-07-21
