# 🏢 PKG Recruitment System - Web PP7

ระบบรับสมัครงานออนไลน์ระดับสากล สำหรับ PKG Group

## 🎯 ภาพรวม

ระบบรับสมัครงานที่ออกแบบมาเพื่อผู้สมัครและ HR โดยเฉพาะ ครอบคลุมกระบวนการ P1 (แสวงหา) จนถึงนัดสัมภาษณ์

## ✨ ฟีเจอร์หลัก

### สำหรับผู้สมัคร
- ✅ ลงทะเบียนด้วยเบอร์โทร + OTP + รหัสผ่าน
- ✅ ค้นหาตำแหน่งงาน (Filter ตามแผนก, ระดับ, ประเภท)
- ✅ กรอกใบสมัครออนไลน์ 4 ขั้นตอน
- ✅ ทำแบบทดสอบ 4 ชุด (ทัศนคติ, ทักษะ, CC, 3E3P)
- ✅ ติดตามสถานะใบสมัครแบบเรียลไทม์
- ✅ Chatbot ผู้ช่วยอัตโนมัติ
- ✅ รับการแจ้งเตือนผ่าน Email และ Web Notification

### สำหรับ HR
- ✅ Dashboard จัดการใบสมัคร
- ✅ คัดกรองผู้สมัครอัตโนมัติ
- ✅ ส่งแบบทดสอบให้ผู้สมัคร
- ✅ AI วิเคราะห์ผลแบบทดสอบ
- ✅ นัดสัมภาษณ์และสร้างแบบฟอร์ม F1
- ✅ สรุปผลอัตโนมัติจากคกก. 5 คน
- ✅ นัดเริ่มงาน

## 📁 โครงสร้างไฟล์

```
web-pp7/
├── index.html                          # หน้า Landing + Auth
├── README.md                           # เอกสารนี้
│
├── js/
│   ├── app.js                         # Auth, OTP, Login/Register
│   ├── positions.js                   # ข้อมูลตำแหน่งงาน
│   ├── applicant-dashboard.js         # Dashboard ผู้สมัคร + Chatbot
│   └── application.js                 # ฟอร์มใบสมัคร 4 ขั้นตอน
│
└── pages/
    ├── positions.html                 # หน้าตำแหน่งงาน
    ├── applicant-dashboard.html       # Dashboard ผู้สมัคร
    └── application.html               # ฟอร์มใบสมัคร
```

## 🚀 การใช้งาน

### 1. เปิดเว็บไซต์
```bash
# เปิดไฟล์ index.html ในเบราว์เซอร์
# หรือ deploy บน GitHub Pages / Cloudflare Pages
```

### 2. ลงทะเบียนผู้สมัคร
- กรอกเบอร์โทร → รับ OTP → ตั้งรหัสผ่าน
- เข้าสู่ระบบด้วยเบอร์โทร + รหัสผ่าน

### 3. สมัครงาน
- ดูตำแหน่งงาน → กดสมัคร → กรอกใบสมัคร 4 ขั้นตอน
- อัพโหลดเอกสาร (Resume, วุฒิการศึกษา)

### 4. ทำแบบทดสอบ
- ทำแบบทดสอบ 4 ชุด (ทัศนคติ, ทักษะ, CC, 3E3P)
- ระบบจับเวลาและบันทึกผลอัตโนมัติ

### 5. ติดตามสถานะ
- ดูสถานะใบสมัครบน Dashboard
- รับการแจ้งเตือนเมื่อสถานะเปลี่ยน

## 🔐 ระบบ Auth

### การลงทะเบียน
1. กรอกเบอร์โทร → กดส่ง OTP
2. กรอก OTP 6 หลัก (หมดอายุใน 5 นาที)
3. ตั้งรหัสผ่าน (อย่างน้อย 6 ตัวอักษร)
4. กรอกชื่อ-นามสกุล, Email

### การเข้าสู่ระบบ
- เบอร์โทร + รหัสผ่าน
- เก็บ session ใน localStorage

## 📊 ข้อมูลตัวอย่าง

### ตำแหน่งงาน (6 ตำแหน่ง)
1. นักพัฒนาซอฟต์แวร์ (Software Developer)
2. เจ้าหน้าที่ทรัพยากรบุคคล (HR Officer)
3. นักวิเคราะห์การเงิน (Financial Analyst)
4. พนักงานขาย (Sales Representative)
5. นักการตลาดดิจิทัล (Digital Marketing Specialist)
6. ผู้จัดการโครงการ (Project Manager)

## 🎨 เทคโนโลยี

- **Frontend:** HTML5 + TailwindCSS + JavaScript (Vanilla)
- **Icons:** Font Awesome 6.4.0
- **Fonts:** Prompt (Google Fonts)
- **Storage:** localStorage (สำหรับ Demo)
- **Hosting:** GitHub Pages / Cloudflare Pages

## 📱 Responsive Design

- ✅ Desktop (1920px+)
- ✅ Laptop (1024px - 1920px)
- ✅ Tablet (768px - 1024px)
- ✅ Mobile (320px - 768px)

## 🔮 Roadmap

### Phase 1 (เสร็จแล้ว) ✅
- [x] Landing Page
- [x] ระบบ Auth (ลงทะเบียน/เข้าสู่ระบบ)
- [x] หน้าตำแหน่งงาน + Filter
- [x] Dashboard ผู้สมัคร
- [x] ฟอร์มใบสมัคร 4 ขั้นตอน
- [x] Chatbot ผู้ช่วย

### Phase 2 (กำลังพัฒนา) 🚧
- [ ] ระบบแบบทดสอบ 4 ชุด
- [ ] AI วิเคราะห์ผลแบบทดสอบ
- [ ] ระบบนัดสัมภาษณ์
- [ ] แบบฟอร์ม F1 (คกก. ให้คะแนน)
- [ ] ระบบสรุปผลอัตโนมัติ

### Phase 3 (วางแผน) 📋
- [ ] Dashboard HR
- [ ] ระบบแจ้งเตือน (Email + Web)
- [ ] Import ข้อมูลจาก Sheet
- [ ] Deploy ขึ้น Production

## 📞 ติดต่อ

**PKG Group**
- Website: https://pakonchotbuncha-netizen.github.io/web-pp7/
- Email: hr@pkg.com
- Phone: 02-xxx-xxxx

## 📄 License

© 2026 PKG Group. All rights reserved.

---

**สร้างโดย:** KiloClaw 🦾
**วันที่:** 23 กรกฎาคม 2569
