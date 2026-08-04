# คู่มือระบบ Sync: Google Sheet → JSON → Web

## 🎯 ภาพรวม

ระบบนี้จะ sync ข้อมูลจาก Google Sheet "โครงสร้างธุรกิจ" ไปเป็นไฟล์ JSON บน GitHub โดยอัตโนมัติ ทำให้ Web อัพเดททันทีเมื่อมีการแก้ไขใน Sheet

```
HR แก้ไขใน Google Sheet
    ↓ (กดปุ่ม Sync หรือ Auto Trigger)
Apps Script อ่านข้อมูล → แปลงเป็น JSON
    ↓ (GitHub API)
Push ไป GitHub → Web อัพเดททันที
```

---

## 📋 สิ่งที่ต้องเตรียม

### 1. GitHub Personal Access Token
- ไปที่: https://github.com/settings/tokens
- กด "Generate new token (classic)"
- เลือก scope: `repo` (full control)
- Copy token ไว้ (จะแสดงครั้งเดียว!)

### 2. Google Sheet พร้อมข้อมูล
- Sheet หลัก: https://docs.google.com/spreadsheets/d/1yP_l-WmsnlkMDCkZB7ulhe6oS_AAex8iE3LYdPdg-uc/edit
- มี tab ชื่อ "โครงสร้างธุรกิจ" ที่สร้างไว้แล้ว

---

## 🚀 วิธีติดตั้ง

### ขั้นตอนที่ 1: เปิด Apps Script
1. เปิด Google Sheet หลัก
2. ไปที่ **Extensions → Apps Script**
3. จะเปิดหน้า Apps Script editor

### ขั้นตอนที่ 2: สร้างไฟล์ sync-structure
1. คลิกไอคอน **+** ข้าง "Files"
2. เลือก **Script**
3. ตั้งชื่อไฟล์: `sync-structure`
4. ลบ code เดิมออก
5. Copy code จากไฟล์ `apps-script/sync-structure.js` ทั้งหมด
6. Paste ลงใน editor

### ขั้นตอนที่ 3: แก้ไข Configuration
```javascript
const GITHUB_TOKEN = 'ghp_YOUR_TOKEN_HERE'; // ใส่ token จากขั้นตอนเตรียมการ
const GITHUB_REPO = 'pakonchotbuncha-netizen/web-pp7';
const GITHUB_BRANCH = 'main';
const JSON_FILE_PATH = 'business-structure-data.json';
const SHEET_NAME = 'โครงสร้างธุรกิจ';
const SS_ID = '1yP_l-WmsnlkMDCkZB7ulhe6oS_AAex8iE3LYdPdg-uc';
```

### ขั้นตอนที่ 4: ทดสอบ Manual Sync
1. กดปุ่ม **▶ Run** (หรือเลือก function `syncStructureToGitHub`)
2. อนุญาตสิทธิ์ที่ขอ (ครั้งแรก)
3. รอจนเสร็จ → จะเห็น log "✅ Sync สำเร็จ!"

### ขั้นตอนที่ 5: ตั้ง Auto Trigger (Optional)
1. คลิกไอคอน **นาฬิกา** ข้าง "Triggers"
2. กด **+ Add Trigger**
3. ตั้งค่า:
   - Choose which function to run: `syncStructureToGitHub`
   - Choose which deployment should run: `Head`
   - Select event source: `From spreadsheet`
   - Select event type: `On change` หรือ `On edit`
4. กด **Save**

---

## 📖 วิธีใช้งาน

### Manual Sync (กดปุ่ม)
1. เปิด Google Sheet
2. จะเห็นเมนู **🔄 Sync** ด้านบน
3. กด **Sync ไป Web**
4. รอจนเสร็จ → Web จะอัพเดทอัตโนมัติ

### Auto Sync (Trigger)
- ทุกครั้งที่แก้ไข Sheet → ระบบจะ sync อัตโนมัติ
- ไม่ต้องกดปุ่มเอง

---

## 🔍 การตรวจสอบ

### ดู Log
- เปิด Apps Script → คลิก **Executions** (ไอคอนด้านซ้าย)
- ดู log การ sync ล่าสุด

### ดู JSON ที่ sync แล้ว
- ไปที่: https://github.com/pakonchotbuncha-netizen/web-pp7/blob/main/business-structure-data.json
- ดู commit history: https://github.com/pakonchotbuncha-netizen/web-pp7/commits/main/business-structure-data.json

### ดู Web
- https://pakonchotbuncha-netizen.github.io/web-pp7/
- กดเมนู **🏗️ โครงสร้างธุรกิจ**

---

## ⚠️ ข้อควรระวัง

1. **GitHub Token** - เก็บเป็นความลับ ห้าม share
2. **Rate Limit** - GitHub API จำกัด 5,000 requests/hour (เพียงพอ)
3. **Sheet Structure** - ห้ามเปลี่ยนชื่อ tab หรือ header ถ้าไม่จำเป็น
4. **Backup** - ควร backup Sheet เป็นระยะ

---

## 🐛 Troubleshooting

### Error: "ไม่พบ Sheet ชื่อ: โครงสร้างธุรกิจ"
- ตรวจสอบว่า tab ชื่อ "โครงสร้างธุรกิจ" มีอยู่จริง
- ตรวจสอบตัวสะกด (ภาษาไทยต้องตรงกัน)

### Error: "GitHub API Error: 401"
- ตรวจสอบ GitHub Token ว่าถูกต้อง
- ตรวจสอบว่า token มี scope `repo`

### Error: "GitHub API Error: 404"
- ตรวจสอบว่า repo name ถูกต้อง
- ตรวจสอบว่า token มีสิทธิ์เข้าถึง repo

### Sync สำเร็จ แต่ Web ไม่อัพเดท
- รอ 1-2 นาที (GitHub Pages ต้อง deploy)
- Hard refresh browser (Ctrl+F5)
- ตรวจสอบ console (F12) ว่ามี error ไหม

---

## 📞 ติดต่อ

หากมีปัญหาหรือต้องการความช่วยเหลือ:
- สร้าง Issue: https://github.com/pakonchotbuncha-netizen/web-pp7/issues
- หรือติดต่อ KiloClaw ในแชท

---

**สร้างโดย:** KiloClaw 🦾  
**อัพเดทล่าสุด:** 2026-08-04
