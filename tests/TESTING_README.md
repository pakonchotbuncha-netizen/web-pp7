# 🧪 Web PP7 - Automated Testing Framework

## ภาพรวม

ระบบทดสอบอัตโนมัติสำหรับ Web PP7 ครอบคลุม:
- **Schema Validation** — ทดสอบโครงสร้างข้อมูล
- **Data Flow** — ทดสอบการไหลของข้อมูลระหว่าง P1-P7
- **RBAC** — ทดสอบ system การเข้าถึงตามบทบาท
- **Utils** — ทดสอบฟังก์ชันช่วยต่างๆ
- **Migration** — ทดสอบระบบนำเข้าข้อมูล

## 📁 โครงสร้างไฟล์

```
tests/
├── test_schema.js        # ทดสอบ DB schema validation
├── test_dataflow.js      # ทดสอบ data flow P1→P7
├── test_rbac.js          # ทดสอบ role-based access control
├── test_utils.js         # ทดสอบ utility functions
├── test_migration.js     # ทดสอบ migration logic
├── test_runner.gs        # Google Apps Script test runner
└── TESTING_README.md     # ไฟล์นี้
```

## 🚀 วิธีรัน Tests

### ผ่าน Google Apps Script (test_runner.gs)

1. เปิด Google Apps Script project ของ Web PP7
2. เปิดไฟล์ `test_runner.gs`
3. รัน function `runAllTests()`
4. ดูผลลัพธ์ที่ Logger หรือ HTML Report

### ผ่าน Node.js (Development)

```bash
# รัน test ไฟล์เดียว
node tests/test_schema.js

# รันทุก tests
for f in tests/test_*.js; do echo "--- $f ---"; node "$f"; done
```

## 📝 วิธีเขียน Test Case ใหม่

### โครงสร้างพื้นฐาน

```javascript
// เพิ่มในไฟล์ tests/ ที่เกี่ยวข้อง
console.log('\n🔹 Category Name');

test('test_name: อธิบายสิ่งที่ทดสอบ', () => {
  // Arrange: เตรียมข้อมูล
  const input = { ... };
  
  // Act: เรียก function
  const result = someFunction(input);
  
  // Assert: ตรวจสอบผลลัพธ์
  assertTrue(result.isValid, 'Should be valid');
  assertEqual(result.errors.length, 0, 'No errors expected');
});
```

### Helper Functions

| Function | Description |
|----------|-------------|
| `test(name, fn)` | รัน test case |
| `assertEqual(actual, expected, msg)` | ตรวจสอบค่าเท่ากัน |
| `assertTrue(condition, msg)` | ตรวจสอบเงื่อนไขเป็น true |

### Naming Convention

```
ModuleName: description when condition
```

ตัวอย่าง:
- `validateRow: P1 ผ่านเมื่อมี required fields ครบ`
- `detectDuplicates: พบ duplicate เมื่อ memberId ซ้ำ`
- `checkPermission: employee อ่าน P4 ได้เฉพาะข้อมูลตัวเอง`

## 📊 Test Coverage

| Module | Tests | Coverage |
|--------|-------|----------|
| Schema Validation | ~50 | Required fields, types, enums, dates |
| Data Flow | ~40 | P1→P2→P3→P4 chain, cross references |
| RBAC | ~30 | All 6 roles × all P modules |
| Utils | ~25 | Email, ID format, salary validation |
| Migration | ~30 | Validation, duplicates, format, rollback |
| **Total** | **~175** | |

## 🔧 Troubleshooting

### "Schema not found"
- ตรวจสอบว่าชื่อ sheet ตรงกับ schema key ใน MIGRATION_SCHEMAS
- ตรวจสอบตัวพิมพ์เล็ก/ใหญ่

### "Date validation fails"
- ใช้ format `YYYY-MM-DD` หรือ `Date` object
- ตรวจสอบ timezone

### "RBAC test fails unexpectedly"
- ตรวจสอบว่า role ตรงกับ enum (สะกดถูกต้อง)
- ตรวจสอบว่า resource ตรงกับ path structure

## 📌 ข้อควรรู้

- ทุก test file สามารถรันเดี่ยวได้ (standalone)
- Test data ใช้จำลอง ไม่ใช้ข้อมูลจริง
- ถ้าเพิ่ม schema ใหม่ ต้องเพิ่ม test case ด้วย
- Migration tests ใช้ schema เดี่ยวกับ Code.gs

## 🔗 Reference

- Backend: `/apps-script/Code.gs`
- Data Flow: `/web_pp7_api_dataflow.md`
- Migration: `/migration/Migration.gs`

---
จัดทำโดย KiloClaw 🦾 | กรกฎาคม 2569
