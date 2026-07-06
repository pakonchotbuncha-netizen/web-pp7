# 📦 ระบบ Migration Web PP7

**คู่มือการนำเข้าข้อมูลเข้าระบบ Web PP7 (PKGemployee)**

---

## 📗 ภาพรวม

ระบบ Migration สำหรับ Web PP7 ประกอบด้วย:

| ไฟล์ | รายละเอียด |
|------|------------|
| `Migration.gs` | สคริปต์หลักสำหรับ Import ข้อมูล พร้อม Validate, Log และ Rollback |
| `Migration_Template.gs` | Template Sheet สำหรับแต่ละ Process (P1-P7) พร้อม Data Validation |
| `test_migration.gs` | ชุดทดสอบระบบ Validate, Duplicate Detection และ Rollback |

### ฟีเจอร์หลัก

- ✅ **Data Validation** - ตรวจ required fields, format, allowed values ก่อน Import
- 🔁 **Duplicate Detection** - ข้ามข้อมูลที่มีรหัสพนักงานซ้ำ
- 📋 **Transaction Logging** - บันทึกการ import ทุกแถว (Success/Failed/Skipped)
- ⏪ **Rollback** - ยกเลิกการ import ที่มีปัญหาได้ด้วย Transaction ID
- 🏷️ **Dry Run** - ทดสอบการ validate โดยไม่เขียนจริง
- 📝 **Template Generator** - สร้าง Sheet P1-P7 พร้อม Dropdown validation อัตโนมัติ

---

## 🚀 เริ่มต้นใช้งาน

### ขั้นตอนที่ 1: ติดตั้งสคริปต์

1. เปิด Google Apps Script Editor ของ Destination Sheet
2. สร้างไฟล์ใหม่:
   - `Migration.gs` (คัดลอกเนื้อหาจากไฟล์ Migration.gs)
   - `Migration_Template.gs`
   - `test_migration.gs`
3. Save Project

### ขั้นตอนที่ 2: สร้าง Template Sheets (ถ้ายังไม่มี)

1. เปิด Google Sheet ที่ต้องการใช้ import
2. เมนู **PP7 Migration** → **📝 สร้าง Template ทั้งหมด** (จาก Template.gs)
3. ระบบจะสร้าง 8 Sheet:
   - `Instructions` - คู่มือการใช้งาน
   - `PKGemployee-Template` - Template ตามโครงสร้างจริง
   - `P1-CandidateData` ถึง `P7-QualityOfLifeData`

### ขั้นตอนที่ 3: กรอกข้อมูล

1. เปิด Sheet ที่ต้องการ (เช่น `P1-CandidateData`)
2. กรอกข้อมูลตั้งแต่ **แถวที่ 4** เป็นต้นไป (แถว 1-3 เป็น Header/Description)
3. ใช้ Data Validation (Dropdown) ที่มีอยู่แล้วใน Column ต่างๆ

---

## ✅ Checklist เตรียมข้อมูลก่อน Import

### ข้อมูลที่ต้องเตรียม

- [ ] Google Sheet ต้นทาง **เปิดสาธารณะ** หรือ **Shared** ให้ Editor สามารถ Access ได้
- [ ] ฟิลด์บังคับ (Required) ครบถ้วนทุกแถว:
  - `id` (7 หลัก), `firstname`, `lastname`, `full_name`, `email`, `employee_status`, `start_date`
- [ ] รูปแบบข้อมูลที่ถูกต้อง:
  - วันที่: `DD/MM/YYYY` (เช่น `21/07/2021`)
  - อีเมล: `name@domain.com`
  - เลขบัตรประชาชน: 13 หลัก
  - มือถือ: 9-10 หลัก หรือรูปแบบ `XXX-XXX-XXXX`
- [ ] สถานะพนักงานต้องเป็นค่าที่ยอมรับ:
  - `สมาชิกประจำ`, `สมาชิกทดลองงาน`, `สมาชิกประจำ(เกษียณ)`, `สัญญาจ้าง`, `สัญญาจ้าง(เกษียณ)`, `ลาออก`
- [ ] คำนำหน้า (ถ้ามี): `นาย`, `นาง`, `นางสาว`, `ด.ช.`, `ด.ญ.`

### แนะนำก่อน Import

- [ ] 🧪 ทดสอบ Dry Run ก่อนเสมอ
- [ ] 🔍 ตรวจสอบ Validation Errors และแก้ไข
- [ ] 💾 **Backup** ข้อมูลโดย Copy Sheet ก่อน import จริง

---

## 📥 ขั้นตอนการ Import ทีละ Process

### วิธีหา Spreadsheet ID

จาก URL: `https://docs.google.com/spreadsheets/d/XXXXX/edit`
ID คือส่วน **XXXXX** (ระหว่าง `/d/` และ `/edit`)

### import ผ่าน Dialog (Google Sheets UI)

1. เปิด Destination Sheet (PKGemployee)
2. เมนู **PP7 Migration** → เลือก:
   - **🔄 Import ข้อมูล (Dry Run)** → ทดสอบ validate เท่านั้น
   - **✅ Import ข้อมูล (จริง)** → Import ข้อมูลจริง

3. กรอก **Source Sheet ID** แล้วกด OK
4. ดูผลการ import ใน Dialog และ Sheet `Migration_Log`

### import ผ่าน Code (Google Apps Script)

```javascript
// ตัวอย่าง: Import ข้อมูล P1 ทั้งหมด
var result = batchMigrate(
  'SOURCE_SPREADSHEET_ID',  // ID ของ Sheet ต้นทาง
  'DESTINATION_SPREADSHEET_ID',  // ID ของ Sheet PKGemployee
  'P1',  // Process ID (P1-P7)
  {
    sourceSheetName: 'P1-CandidateData',
    skipDuplicates: true,
    dryRun: false  // true สำหรับ Dry Run
  }
);

Logger.log('ผลลัพธ์:', JSON.stringify(result));
```

### import แบบ Custom

```javascript
// Import ด้วย options พิเศษ
var result = migrateData(
  'SOURCE_ID',
  'DEST_ID',
  {
    sourceSheetName: 'Sheet1',
    dryRun: true,           // ทดสอบก่อน
    skipDuplicates: true,    // ข้ามข้อมูลที่ซ้ำ
    includeHeader: true      // แถวแรกเป็น Header
  }
);
```

### ลำดับที่แนะนำในการ Import

| ลำดับ | Process | รายละเอียด |
|--------|---------|------------|
| 1 | **P1** | ผู้สมัครงาน → ผู้สมัครที่ผ่านเข้า P2 |
| 2 | **P2** | การประเมินเบื้องต้น → ผู้สมัครที่ผ่าน |
| 3 | **P3** | การจับคู่คนกับงาน → พนักงานใหม่ |
| 4 | **P4** | การประเมินผล (360°) |
| 5 | **P5** | แผนพัฒนาบุคลากร |
| 6 | **P6** | ข้อมูลค่าตอบแทน |
| 7 | **P7** | คุณภาพชีวิตพนักงาน |

---

## ⏪ Rollback (ยกเลิก Import)

### ผ่าน Dialog

1. เรียกดู **Transaction ID** ที่ต้องการยกเลิก (จาก Dialog ผลการ Import หรือ Sheet `Migration_Log`)
2. เมนู **PP7 Migration** → **🔄 Rollback Transaction ล่าสุด**
3. กรอก Transaction ID แล้วกด OK

### ผ่าน Code

```javascript
var result = rollbackMigration('TXN_1720000000000_ABC123', 'DEST_ID');
Logger.log('Rollback:', result);
// { success: true, rolledBackCount: 15, transactionId: '...' }
```

---

## 🔧 Troubleshooting (ปัญหาที่พบบ่อย)

### ❌ ไม่พบ Sheet ในไฟล์ปลายทาง

**ปัญหา:** `ไม่พบ Sheet ชื่อ "PKGemployee" ในไฟล์ปลายทาง`

**แก้ไข:** 
- ตรวจสอบว่า Destination Sheet มี tab ชื่อ `PKGemployee`
- ตรวจว่าสะกดถูกตัวพิมพ์เล็ก/ใหญ่มั้ย

### ❌ Access Denied

**ปัญหา:** `Exception: You do not have permission to access the requested document`

**แก้ไข:**
- ตรวจสอบว่า Google Account ที่ Run Script มี Edit Access ทั้ง Source และ Destination
- Share ไฟล์เป็น "Anyone with the link can Edit" (สำหรับการทดสอบ)

### ❌ Validation Errors หลายแถว

**ปัญหา:** `❌ ล้มเหลว: 50` จำนวนมาก

**แก้ไข:**
1. ดู Log ใน Sheet `Migration_Log` เพื่อตรวจ error แต่ละแถว
2. ตรวจสอบ error ที่พบบ่อย:
   - `id: เป็นฟิลด์บังคับ` → กรอก รหัสพนักงาน (7 หลัก)
   - `email: รูปแบบอีเมลไม่ถูกต้อง` → ตรวจรูปแบบ email
   - `start_date: วันที่ไม่ถูกต้อง` → ใช้รูปแบบ `DD/MM/YYYY`
   - `employee_status: สถานะพนักงานไม่ถูกต้อง` → ใช้ค่าใน Dropdown
3. แก้ไขใน Source Sheet แล้ว Run ใหม่

### ❌ ข้อมูลซ้ำกัน

**ปัญหา:** `รหัสพนักงาน XXXXXXX มีอยู่แล้วในระบบ`

**แก้ไข:**
- ข้อมูลซ้ำจะถูกข้ามอัตโนมัติ (status = SKIPPED ใน Log)
- หากต้องการ overwrite → ตั้ง `skipDuplicates: false` ใน options

### ❌ Import แล้วข้อมูลผิด ต้องยกเลิก

**แก้ไข:**
1. เก็บ `Transaction ID` จากการ import ครั้งนั้น
2. ใช้ Rollback ตามวิธีด้านบน
3. แก้ไข Source Sheet แล้ว import ใหม่

### ❌ ทดสอบ Dry Run ผ่าน แต่ Import จริง Error

**สาเหตุ:** อาจเป็นปัญหา Permission หรือ Sheet ถูก Share ไม่ถูกต้อง

**แก้ไข:**
- ตรวจสอบ permission อีกครั้ง
- ลองเปิด Source Sheet ก่อนเพื่อ "warm up" access
- ดู Logs ใน Apps Script > Executions

---

## 📊 โครงสร้างข้อมูล PKGemployee

ไฟล์ `Migration.gs` Map ข้อมูลตาม Column Order ของ `PKGemployee`:

| Column | Field | คำอธิบาย |
|--------|-------|-----------|
| A | row_number | ลำดับ (Auto) |
| B | id | รหัสพนักงาน (7 หลัก) ⭐ Required |
| C | prefix | คำนำหน้า (นาย/นาง/นางสาว) |
| D | firstname | ชื่อ ⭐ Required |
| E | lastname | นามสกุล ⭐ Required |
| F | full_name | ชื่อ-นามสกุล ⭐ Required |
| G | email | อีเมล ⭐ Required |
| H | department | ฝ่ายงาน |
| I | team | ทีม |
| J | business_unit | หน่วยธุรกิจ |
| K | work_location | สถานที่ทำงาน |
| L | employee_type | ประเภทพนักงาน |
| M | employee_status | สถานะพนักงาน ⭐ Required |
| N | start_date | วันที่เริ่มงาน ⭐ Required |
| O | tenure_years | อายุงาน (ปี) |
| P-AI | ... | ฟิลด์อื่นๆ (ดูใน Migration.gs) |

---

## 🧪 การทดสอบ

### รันทดสอบทั้งหมด

```javascript
testAll();
```

ดูผลลัพธ์ใน **Apps Script > View > Logs**

### การทดสอบแต่ละส่วน

```javascript
testValidateRowRequired();    // ทดสอบ Required Fields
testValidateRowFormat();      // ทดสอบ Format Checking
testValidateRowAllowedValues(); // ทดสอบ Allowed Values
testValidateRowDate();        // ทดสอบ Date Validation
testDuplicateDetection();     // ทดสอบ Duplicate Detection
testEmptyRowDetection();      // ทดสอบ Empty Row Detection
testColumnMapping();          // ทดสอบ Column Mapping
testHeaderMapping();          // ทดสอบ Header to Field Map
testTemplateCreation();       // ทดสอบ Template Structure
testRollbackMechanism();      // ทดสอบ Rollback Logic
testMapSourceRowToSchema();   // ทดสอบ Data Mapping
testSchemaRulesCompleteness(); // ทดสอบ Schema Completeness
testIntegrationWithRealData(); // ทดสอบกับข้อมูลจริง
testProcessTemplateFields();  // ทดสอบ Template Fields ครบถ้วน
```

---

## 🛠️ Developer Notes

### เพิ่ม Field ใหม่

1. เพิ่มใน `COLUMN_MAP` (Migration.gs)
2. เพิ่ม validation rule ใน `SCHEMA_RULES`
3. อัปเดต Template ใน `Migration_Template.gs`
4. เพิ่ม test case ใน `test_migration.gs`

### เพิ่ม Process ใหม่ (P8, P9, ...)

1. เพิ่ม Template object ใน `Migration_Template.gs`
2. เพิ่มใน `ALL_TEMPLATES` array
3. เพิ่ม schema ใน `processSchemas` ของ `batchMigrate()`
4. เพิ่ม test case

---

## 📎 ความสัมพันธ์กับ Data Flow

```
[P1 แสวงหา] → [P2 หยั่งประเมิน] → [P3 จับคู่] → [P4 ประเมินผล]
     ↓                                              ↓
  [P5 พัฒนา] + [P6 ค่าตอบแทน]               ← [P7 คุณภาพชีวิต]
     ↓                                              ↓
  ←────── Feedback Loop / Alert System ────────→
```

- **P1-P3**: ข้อมูลไหลจากซ้ายไปขวา
- **P4**: Evidence-First Rule (ต้องมี evidence_links)
- **P5-P7**: ส่งข้อมูล Feedback กลับไปยังกระบวนการก่อนหน้า

Template แต่ละ Process ออกแบบให้สอดคล้องกับ Data Flow ด้านบน

---

## 📄 License

ระบบนี้เป็นส่วนหนึ่งของ Web PP7 Project  
Developed for Pakorn HRMS (PKG)  
2026-07-06
