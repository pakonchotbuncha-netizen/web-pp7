# สรุปการสร้างฟอร์มสมัครงาน 4 ภาษา

## ✅ สิ่งที่เสร็จสมบูรณ์

### 1. ฟอร์มสมัครงาน (form-register.html)
- **8 หัวข้อครบถ้วน** ตามต้นฉบับ
- **4 ภาษา**: ไทย, English, ລາວ, ខ្មែរ
- **Responsive Design** รองรับทุกอุปกรณ์
- **Auto-fill** ที่อยู่ปัจจุบันจากทะเบียนบ้าน
- **Auto-calculate** อายุจากวันเกิด
- **Matrix Radio** สำหรับความสามารถภาษา
- **File Upload** สำหรับรูปถ่ายและวุฒิการศึกษา

### 2. ไฟล์ JSON สำหรับ 4 ภาษา
- `i18n/form-register-th.json` ✅
- `i18n/form-register-en.json` ✅
- `i18n/form-register-lo.json` ✅
- `i18n/form-register-km.json` ✅

### 3. เอกสารประกอบ
- `i18n/LEGAL-TH.md` - คำศัพท์กฎหมายไทย
- `i18n/LEGAL-EN.md` - คำศัพท์กฎหมายอังกฤษ
- `i18n/LEGAL-LO.md` - คำศัพท์กฎหมายลาว
- `i18n/LEGAL-KM.md` - คำศัพท์กฎหมายเขมร
- `i18n/GRAMMAR-REVIEW.md` - ตรวจสอบไวยากรณ์
- `i18n/LEGAL-TERMINOLOGY.md` - คำศัพท์กฎหมายมาตรฐาน

## 📋 โครงสร้างฟอร์ม 8 หัวข้อ

### 1. 💼 ข้อมูลตำแหน่งที่สมัคร
- ตำแหน่งงานที่เปิดรับ (dropdown)
- ตำแหน่งงานอื่นที่สนใจ (dropdown)
- เงินเดือนที่คาดหวัง (text)
- ช่องทางการสมัคร (radio: website/บริษัท)
- ทราบข่าวจากช่องทางใด (radio 11 ตัวเลือก + sub-options)

### 2. 👤 ข้อมูลส่วนตัวของผู้สมัคร
- ชื่อ-นามสกุล ภาษาไทย (prefix + first + last)
- ชื่อ-นามสกุล ภาษาอังกฤษ (prefix + first + last)
- ชื่อเล่น (text)
- เพศ (radio: ชาย/หญิง)
- วันเกิด (date) + อายุ (auto-calculate)
- น้ำหนัก, ส่วนสูง (number)
- กรุ๊ปเลือด (radio: O/A/B/AB)
- เชื้อชาติ, สัญชาติ (dropdown)
- การศึกษาสูงสุด (dropdown)
- สาขาวิชา (text)
- อัพโหลดวุฒิการศึกษา (file)
- รหัสบัตรประชาชน (text)
- สถานที่ออกบัตร, วันที่ออก, วันหมดอายุ (text/date)
- อัพโหลดรูปผู้สมัคร (file)

### 3. 🏠 ที่อยู่ตามทะเบียนบ้าน
- บ้านเลขที่, ตำบล, อำเภอ, จังหวัด, รหัสไปรษณีย์

### 4. 📍 ที่อยู่ปัจจุบัน
- Checkbox: ที่อยู่ปัจจุบัน = ทะเบียนบ้าน (auto-fill)
- บ้านเลขที่, ตำบล, อำเภอ, จังหวัด, รหัสไปรษณีย์
- เบอร์โทรศัพท์, Facebook, ID Line
- สถานะทางทหาร (radio: 5 ตัวเลือก)

### 5. 👨‍👩‍👧‍👦 ข้อมูลด้านครอบครัว
- สถานะการสมรส (dropdown)
- จำนวนบุตร (dropdown)
- ข้อมูลครอบครัว (textarea)
- ชื่อ-นามสกุล บิดา, มารดา

### 6. 💪 ข้อมูลด้านความสามารถ
- ความสามารถภาษาไทย (matrix: ฟัง/พูด/อ่าน/เขียน × 5 ระดับ)
- ความสามารถภาษาอังกฤษ (matrix: เหมือนกัน)
- ความสามารถภาษาอื่นๆ (text)
- ความสามารถพิเศษ (text)
- งานอดิเรก/สิ่งที่สนใจ (text)
- ความสามารถในการขับขี่ (radio: 6 ตัวเลือก)
- มีใบอนุญาตขับขี่หรือไม่ (radio: มี/ไม่มี)
- เลขที่ใบขับขี่รถยนต์, รถจักรยานยนต์

### 7. 💼 ประสบการณ์ทำงาน
- ประสบการณ์ทำงานที่ผ่านมา (textarea)
- บุคคลอ้างอิงจากที่ทำงานเดิม (text)
- บุคคลติดต่อกรณีฉุกเฉิน (text)
- ยินยอมให้สอบถามที่ทำงานเดิม (radio: ยอม/ไม่ยอม)

### 8. 📋 ข้อมูลทั่วไป
- โรคประจำตัว (text)
- เคยป่วยรุนแรง/ผ่าตัด 5 ปี (text)
- เคยถูกปลดออกจากงาน (radio: เคย/ไม่เคย)
- เคยสมัคร/ทำงานกับบริษัทนี้ (radio: เคย/ไม่เคย)
- เคยเป็นลูกจ้างประกันสังคม (radio: เคย/ไม่เคย)
- ภาระหนี้สิน (radio: มี/ไม่มี) + รายละเอียด
- ภาระดูแลครอบครัว (radio: มี/ไม่มี) + รายละเอียด
- ยินยอมตรวจประวัติอาชญากรรม (2 ข้อ: ดำเนินการเอง/บริษัทดำเนินการ)
- การเดินทางมาทำงาน (radio: 5 ตัวเลือก)
- บุคคลที่แนะนำ (textarea)

## 🔗 ลิงก์เข้าถึง

### ฟอร์มสมัครงาน
- **URL**: https://pakonchotbuncha-netizen.github.io/web-pp7/form-register.html
- **GitHub**: https://github.com/pakonchotbuncha-netizen/web-pp7/blob/main/form-register.html

### เอกสารประกอบ
- **คำศัพท์กฎหมายไทย**: https://pakonchotbuncha-netizen.github.io/web-pp7/i18n/LEGAL-TH.md
- **คำศัพท์กฎหมายอังกฤษ**: https://pakonchotbuncha-netizen.github.io/web-pp7/i18n/LEGAL-EN.md
- **คำศัพท์กฎหมายลาว**: https://pakonchotbuncha-netizen.github.io/web-pp7/i18n/LEGAL-LO.md
- **คำศัพท์กฎหมายเขมร**: https://pakonchotbuncha-netizen.github.io/web-pp7/i18n/LEGAL-KM.md

## 🚀 ขั้นตอนต่อไปสำหรับการเชื่อมต่อระบบ

### 1. Backend Integration
- [ ] สร้าง API endpoint สำหรับรับข้อมูลฟอร์ม
- [ ] เชื่อมต่อกับ Google Apps Script หรือ backend อื่น
- [ ] จัดการ file upload (รูปถ่าย, วุฒิการศึกษา)
- [ ] บันทึกข้อมูลลงฐานข้อมูล

### 2. Data Validation
- [ ] เพิ่ม client-side validation
- [ ] เพิ่ม server-side validation
- [ ] ตรวจสอบความถูกต้องของข้อมูล (email, phone, ID card)

### 3. Workflow Integration
- [ ] ส่งข้อมูลไปยัง P1 (แสวงหา)
- [ ] สร้าง applicant ID อัตโนมัติ
- [ ] แจ้งเตือน HR เมื่อมีผู้สมัครใหม่
- [ ] เชื่อมต่อกับระบบ email notification

### 4. Security & Privacy
- [ ] เพิ่ม HTTPS encryption
- [ ] จัดการ PDPA consent อย่างถูกต้อง
- [ ] ป้องกัน CSRF/XSS attacks
- [ ] จัดการ rate limiting

### 5. Testing
- [ ] ทดสอบฟอร์มทุกภาษา
- [ ] ทดสอบ file upload
- [ ] ทดสอบ auto-fill และ auto-calculate
- [ ] ทดสอบ responsive design

## 📝 หมายเหตุ

- ฟอร์มนี้สร้างตามต้นฉบับจาก `formRegister.php` ของ devdev.prachakij.com
- แปลเป็น 4 ภาษาโดยอ้างอิงจากคำศัพท์กฎหมายที่ตรวจสอบแล้ว
- พร้อมสำหรับการเชื่อมต่อระบบ Web PP7

---

**สร้างโดย**: KiloClaw AI Assistant  
**วันที่**: 2026-08-05  
**สถานะ**: ✅ เสร็จสมบูรณ์ พร้อมเชื่อมต่อระบบ
