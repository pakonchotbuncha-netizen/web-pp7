# ระบบย้ายข้อมูล Web PP7 (Data Migration System)

ระบบสำหรับย้ายข้อมูลระหว่าง Google Sheets ใน Web PP7 พร้อม validation, duplicate detection, และ rollback

## 📁 ไฟล์ในระบบ

| ไฟล์ | คำอธิบาย |
|------|-----------|
| `Migration.gs` | ฟังก์ชันหลักสำหรับ migration |
| `Migration_Template.gs` | สร้าง template sheets สำหรับ P1-P7 |
| `test_migration.gs` | Test cases สำหรับระบบ |

## 🚀 วิธีใช้งาน

### 1. เตรียม Google Sheets

#### สร้าง Destination Sheet
```javascript
// 1. เปิด Apps Script
// 2. รันฟังก์ชัน createAllTemplates(sheetId)

function setupDestination() {
  const destSheetId = 'YOUR_DESTINATION_SHEET_ID';
  const results = createAllTemplates(destSheetId);
  console.log(results);
}
```

ระบบจะสร้าง sheets:
- P1-แสวงหา
- P2-หยั่งประเมิน
- P3-จับคู่คนกับงาน
- P4-ประเมินผล
- P5-พัฒนา
- P6-ค่าตอบแทน
- P7-คุณภาพชีวิต

### 2. Checklist เตรียมข้อมูล

#### ✅ ก่อน Import

**ตรวจสอบโครงสร้างข้อมูล:**
- [ ] Headers ตรงกับ template (ชื่อ column ตรงกัน)
- [ ] Data types ถูกต้อง (text, number, date, boolean)
- [ ] ไม่มี empty rows คั่น
- [ ] ไม่มี merged cells
- [ ] ไม่มี special characters แปลกๆ ใน headers

**ตรวจสอบ Required Fields:**

**P1 - แสวงหา:**
- [ ] `id` - UUID ผู้สมัคร
- [ ] `full_name` - ชื่อ-นามสกุล
- [ ] `position` - ตำแหน่งงาน
- [ ] `department` - แผนก
- [ ] `email` - อีเมล (ต้องถูก format)
- [ ] `status` - ต้องเป็น: New, Screening, Passed_to_P2, Rejected
- [ ] `pdpa_consent` - ต้องเป็น TRUE หรือ FALSE

**P2 - หยั่งประเมิน:**
- [ ] `candidate_id` - เชื่อมกับ P1
- [ ] `evaluation_date` - รูปแบบ YYYY-MM-DD
- [ ] `evaluator` - ชื่อผู้ประเมิน
- [ ] `score` - 0-5
- [ ] `result` - ผ่าน, ไม่ผ่าน, รออนุมัติ

**P3 - จับคู่คนกับงาน:**
- [ ] `candidate_id` - เชื่อมกับ P1
- [ ] `position_id` - เชื่อมกับ positions
- [ ] `match_score` - 0-100
- [ ] `match_date` - รูปแบบ YYYY-MM-DD

**P4 - ประเมินผล:**
- [ ] `employee_id` - รหัสพนักงาน
- [ ] `evaluation_period` - รูปแบบ Q1/2026, Q2/2026, ฯลฯ
- [ ] `evaluator` - ชื่อผู้ประเมิน
- [ ] `kpi_score` - 0-5
- [ ] `evidence_links` - **บังคับ** (JSON array) ถ้าคะแนน < 3

**P5 - พัฒนา:**
- [ ] `employee_id` - รหัสพนักงาน
- [ ] `plan_start`, `plan_end` - รูปแบบ YYYY-MM-DD
- [ ] `goals` - JSON array
- [ ] `status` - วางแผน, กำลังดำเนินการ, เสร็จสิ้น, ยกเลิก

**P6 - ค่าตอบแทน:**
- [ ] `employee_id` - รหัสพนักงาน
- [ ] `base_salary`, `allowances` - ตัวเลข ≥ 0
- [ ] `payment_date` - รูปแบบ YYYY-MM-DD

**P7 - คุณภาพชีวิต:**
- [ ] `employee_id` - รหัสพนักงาน
- [ ] `survey_date` - รูปแบบ YYYY-MM-DD
- [ ] `engagement_score` - 0-5
- [ ] `satisfaction_areas` - JSON array

### 3. ขั้นตอน Import ทีละ Process

#### Import P1 - แสวงหา
```javascript
function importP1() {
  const sourceSheetId = 'SOURCE_SHEET_ID';
  const destSheetId = 'DEST_SHEET_ID';
  
  const result = migrateData(sourceSheetId, destSheetId, 'P1', {
    checkDuplicates: true
  });
  
  console.log('Import P1:', result);
  console.log('สำเร็จ:', result.summary.success);
  console.log('ผิดพลาด:', result.summary.failed);
  console.log('ข้าม:', result.summary.skipped);
  
  if (result.failedRows.length > 0) {
    console.log('รายการที่ผิดพลาด:', result.failedRows);
  }
}
```

#### Import P2-P7 (ทำทีละ Process)
```javascript
function importAllProcesses() {
  const sourceSheetId = 'SOURCE_SHEET_ID';
  const destSheetId = 'DEST_SHEET_ID';
  
  const processes = ['P1', 'P2', 'P3', 'P4', 'P5', 'P6', 'P7'];
  const results = [];
  
  processes.forEach(p => {
    console.log(`\n===== Importing ${p} =====`);
    
    const result = migrateData(sourceSheetId, destSheetId, p, {
      checkDuplicates: true
    });
    
    results.push({
      process: p,
      transactionId: result.transactionId,
      success: result.summary.success,
      failed: result.summary.failed,
      skipped: result.summary.skipped
    });
    
    // รอ 2 วินาทีระหว่างแต่ละ process
    Utilities.sleep(2000);
  });
  
  console.log('\n===== SUMMARY =====');
  results.forEach(r => {
    console.log(`${r.process}: สำเร็จ ${r.success}, ผิดพลาด ${r.failed}, ข้าม ${r.skipped}`);
  });
  
  return results;
}
```

### 4. ตรวจสอบผลการ Import

```javascript
function verifyImport() {
  const destSheetId = 'DEST_SHEET_ID';
  const ss = SpreadsheetApp.openById(destSheetId);
  
  const sheets = ['P1-แสวงหา', 'P2-หยั่งประเมิน', 'P3-จับคู่คนกับงาน', 
                  'P4-ประเมินผล', 'P5-พัฒนา', 'P6-ค่าตอบแทน', 'P7-คุณภาพชีวิต'];
  
  sheets.forEach(name => {
    const sheet = ss.getSheetByName(name);
    if (sheet) {
      const lastRow = sheet.getLastRow();
      const dataRows = lastRow - 1; // ลบ header
      console.log(`${name}: ${dataRows} รายการ`);
    } else {
      console.log(`${name}: ไม่พบ sheet`);
    }
  });
}
```

### 5. Rollback ถ้าผิดพลาด

```javascript
function rollbackFailedImport() {
  const txId = 'TX-1234567890-1234'; // จากผลการ migration
  const destSheetId = 'DEST_SHEET_ID';
  
  // ระบุ range ที่ต้องการลบ (ถ้ารู้)
  const startRow = 2;  // เริ่มจาก row 2 (หลัง header)
  const endRow = 51;   // ถึง row 51
  
  rollbackMigration(txId, destSheetId, startRow, endRow);
  
  console.log(`Rollback transaction ${txId} เสร็จสิ้น`);
}
```

## 🔧 Validation Rules

### ข้อมูลที่ถูกตรวจสอบ

| ประเภท | กฎ | ตัวอย่าง |
|--------|-----|----------|
| **Required Fields** | ต้องมีค่า ไม่ว่าง | `id`, `email`, `status` |
| **String** | รูปแบบถูกต้อง | `id` ต้องเป็น alphanumeric |
| **Email** | ถูก format | `name@domain.com` |
| **Number** | อยู่ในช่วง | `score` 0-5, `match_score` 0-100 |
| **Date** | รูปแบบวันที่ | `YYYY-MM-DD` |
| **Boolean** | TRUE/FALSE | `pdpa_consent` |
| **Enum** | ค่าที่กำหนด | `status`: New, Screening, Passed_to_P2, Rejected |
| **JSON Array** | JSON ที่ถูกต้อง | `evidence_links` |

### Duplicate Detection

- **P1**: ตรวจสอบ `id` (candidate id)
- **P2**: ตรวจสอบ `candidate_id`
- **P3**: ตรวจสอบ `candidate_id` + `position_id`
- **P4-P7**: ตรวจสอบ `employee_id`

ถ้าพบ duplicate → ข้าม row นั้น (ไม่นำเข้าซ้ำ)

## 🛠 Troubleshooting

### ❌ "ไม่พบ sheet สำหรับ P1 ในต้นทาง"

**สาเหตุ:** ไม่มี sheet ที่ตรงกับชื่อ `P1-แสวงหา` ในต้นทาง

**แก้ไข:**
```javascript
// ตรวจสอบว่ามี sheet อะไรบ้าง
const ss = SpreadsheetApp.openById(sourceSheetId);
const sheets = ss.getSheets();
sheets.forEach(s => console.log(s.getName()));
```

### ❌ "Row X: ไม่ผ่าน validation - ขาดฟิลด์บังคับ: email"

**สาเหตุ:** ข้อมูล row นั้นขาด required field

**แก้ไข:**
1. ตรวจสอบไฟล์ต้นทาง
2. เติมข้อมูลที่ขาด
3. รัน migration ใหม่ (จะข้าม rows ที่ import แล้ว)

### ❌ "Row X: ข้ามเพราะเป็น duplicate"

**สาเหตุ:** ข้อมูลนี้มีอยู่แล้วในปลายทาง

**แก้ไข:**
- ปกติไม่ใช่ปัญหา (ระบบข้ามให้อัตโนมัติ)
- ถ้าต้องการ import ซ้ำ: ลบข้อมูลเก่าก่อน

### ❌ "MIGRATION FAILED: ... ROLLBACK สำเร็จ"

**สาเหตุ:** เกิด error ร้ายแรงระหว่าง import

**แก้ไข:**
1. ดูปรับปรุัง log ที่ได้
2. แก้ไขข้อมูลต้นทาง
3. รัน migration ใหม่

### ❌ "JSON parse error"

**สาเหตุ:** ข้อมูล JSON array ไม่ถูกต้อง

**แก้ไข:**
```javascript
// ตัวอย่าง JSON ที่ถูกต้อง
'["link1", "link2", "link3"]'
'[{"criteria":"Leadership","score":4}]'

// ตัวอย่าง JSON ที่ผิด
'not-json'
'{invalid json}'
```

## 📊 Data Flow: P1 → P2 → P3

ระบบรักษา Data Flow ตามกฎ:

1. **Evidence-First Rule (P4)**
   - ถ้า `kpi_score < 3` → `evidence_links` ต้องไม่ว่าง

2. **Cascade Update**
   - P4 ประเมินเสร็จ → สร้าง Draft P5 อัตโนมัติ

3. **Feedback Loop (P7)**
   - ข้อมูล P7 เชิงลบ → Alert ไป Manager Dashboard

## 🧪 ทดสอบระบบ

```javascript
// รัน test ทั้งหมด
function testMigration() {
  const results = runAllTests();
  console.log(results);
}
```

Test Cases ครอบคลุม:
- ✅ Required fields validation
- ✅ Email format validation
- ✅ Number range validation
- ✅ Enum values validation
- ✅ Date format validation
- ✅ Boolean type validation
- ✅ JSON array validation
- ✅ Duplicate detection
- ✅ Rollback mechanism
- ✅ Full P1 migration flow
- ✅ Cross-process data flow (P1→P2→P3)

## 📝 หมายเหตุสำคัญ

### 🎯 Best Practices

1. **Backup ก่อน Import**
   ```javascript
   // สำเนา source sheet ก่อน
   const sourceSS = SpreadsheetApp.openById(sourceSheetId);
   sourceSS.copy('BACKUP_' + new Date().getTime());
   ```

2. **Import ทีละ Process**
   - อย่า import ทั้งหมดพร้อมกัน
   - ตรวจผลการ import แต่ละครั้งก่อนไปต่อ

3. **ตรวจสอบ Data Flow**
   - P1 ต้องมี `status: Passed_to_P2` ก่อนส่ง P2
   - P2 ต้องมี `result: ผ่าน` ก่อนส่ง P3

4. **ใช้ Transaction ID**
   - เก็บ `transactionId` จากผลการ migration
   - ใช้สำหรับ rollback ถ้าต้องการ

### ⚠️ ข้อควรระวัง

- **ห้าม** import ข้อมูลที่มี merged cells
- **ห้าม** import ข้าม process (ต้องทำลำดับ P1→P2→P3→...)
- **ระวัง** ข้อมูล PDPA ต้องเป็น TRUE เท่านั้น
- **ระวัง** evidence_links ใน P4 ต้องมีหลักฐานถ้าคะแนนต่ำ

### 🔗 Schema Reference

Schema ทั้งหมดอ้างอิงจาก:
- `PP7_Design_P1_แสวงหา.md`
- `web_pp7_api_dataflow.md`
- `Code.gs` (Dashboard API)

### 📞 ติดต่อ/สอบถาม

ถ้าพบปัญหาหรือต้องการความช่วยเหลือ:
1. ตรวจสอบ log จากผลการ migration
2. รัน test cases (`runAllTests()`)
3. ตรวจสอบว่าตรงกับ schema หรือไม่

---

**เวอร์ชัน:** 1.0  
**วันที่:** 2026-07-06  
**ผู้พัฒนา:** Web PP7 Team
