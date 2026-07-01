# 📘 แบบฝึกหัด Google Apps Script — 5 ข้อ (ง่าย → กลาง)

ทำทีละข้อ ไม่เร่ง — เสร็จข้อไหนไปข้อถัดไป

---

## 🛠️ เตรียมตัว

1. เปิด Google Sheet ใหม่ (sheet.new)
2. เมนู **ส่วนขยาย → Apps Script**
3. ลบโค้ดเก่าทิ้ง แล้วเริ่มเขียนใน `function myFunction() { ... }`
4. กด **▶️ เรียกใช้ (Run)** เพื่อดูผล → ดู Log ที่ไอคอน 📝 ด้านล่าง

---

## 📝 ข้อ 1: สวัสดีโลก

**โจทย์:** เขียนฟังก์ชันที่แสดงข้อความ "สวัสดี Apps Script!" ใน Log

**Hint:** ใช้ `Logger.log()`

**เฉลย:**
```javascript
function hello() {
  Logger.log("สวัสดี Apps Script!");
}
```

---

## 📝 ข้อ 2: เขียนข้อมูลลง Sheet

**โจทย์:** เขียนชื่อ "สมชาย" ลงในเซลล์ A1 ของ Sheet ปัจจุบัน

**Hint:** 
- `SpreadsheetApp.getActiveSpreadsheet()` → ได้ไฟล์
- `.getActiveSheet()` → ได้ tab ปัจจุบัน
- `.getRange("A1").setValue("...")` → เขียนค่า

**เฉลย:**
```javascript
function writeName() {
  var sheet = SpreadsheetApp.getActiveSheet();
  sheet.getRange("A1").setValue("สมชาย");
}
```

---

## 📝 ข้อ 3: อ่านข้อมูลจาก Sheet

**โจทย์:** สร้าง Sheet แล้วพิมพ์ข้อมูลดังนี้:
- A1 = "สมชาย"
- A2 = "สมหญิง"
- A3 = "สมศักดิ์"

แล้วเขียนฟังก์ชันที่ **อ่าน A1-A3** และแสดงชื่อทั้งหมดใน Log

**Hint:** `.getRange("A1:A3").getValues()` → ได้ array 2 มิติ `[[ค่า], [ค่า], [ค่า]]`

**เฉลย:**
```javascript
function readNames() {
  var sheet = SpreadsheetApp.getActiveSheet();
  var values = sheet.getRange("A1:A3").getValues();

  for (var i = 0; i < values.length; i++) {
    Logger.log("คนที่ " + (i+1) + ": " + values[i][0]);
  }
}
```

---

## 📝 ข้อ 4: นับจำนวน (Mini Project)

**โจทย์:** สร้างข้อมูลใน Sheet:

| A (ชื่อ) | B (สถานะ) |
|----------|-----------|
| สมชาย    | สาย       |
| สมหญิง   | ปกติ      |
| สมศักดิ์ | สาย       |
| สมใจ     | สาย       |
| สมพร     | ปกติ      |

เขียนฟังก์ชันที่ **นับว่ามีคน "สาย" กี่คน** และแสดงผลลัพธ์ใน Log

**Hint:** ใช้ loop + if เปรียบเทียบ

**เฉลย:**
```javascript
function countLate() {
  var sheet = SpreadsheetApp.getActiveSheet();
  var data = sheet.getRange("A2:B6").getValues();  // เริ่มแถว 2 (ข้าม header)
  var count = 0;

  for (var i = 0; i < data.length; i++) {
    var status = data[i][1];  // Column B = index 1
    if (status == "สาย") {
      count++;
    }
  }

  Logger.log("จำนวนคนที่เข้าสาย: " + count + " คน");
}
```

---

## 📝 ข้อ 5: แจ้งเตือนผ่าน Line/Telegram (Mini Project ขั้นสูง)

**โจทย์:** จากข้อมูลข้อ 4 — ถ้าคนเข้าสาย **มากกว่า 2 คน** ให้สร้างข้อความแจ้งเตือน

**Hint:** ใช้ if ตรวจสอบ count > 2 แล้วสร้างข้อความ

**เฉลย:**
```javascript
function checkAndAlert() {
  var sheet = SpreadsheetApp.getActiveSheet();
  var data = sheet.getRange("A2:B6").getValues();
  var lateNames = [];

  // เก็บชื่อคนสาย
  for (var i = 0; i < data.length; i++) {
    var name = data[i][0];
    var status = data[i][1];
    if (status == "สาย") {
      lateNames.push(name);
    }
  }

  // แจ้งเตือนถ้าเกิน 2 คน
  if (lateNames.length > 2) {
    var msg = "⚠️ เตือน! เดือนนี้มีคนเข้าสาย " + lateNames.length + " คน\n";
    msg += "รายชื่อ: " + lateNames.join(", ");
    Logger.log(msg);
    
    // ถ้าต้องการส่ง Telegram จริง:
    // sendToTelegram(msg);
  } else {
    Logger.log("✅ จำนวนคนสายปกติ: " + lateNames.length + " คน");
  }
}
```

---

## 🎯 เสร็จแล้ว! คุณได้เรียน:
- ✅ แสดงผลใน Log
- ✅ เขียนข้อมูลลง Sheet
- ✅ อ่านข้อมูลจาก Sheet
- ✅ นับจำนวน + เงื่อนไข
- ✅ สร้างข้อความแจ้งเตือนอัตโนมัติ

**ถัดไป:** นำ pattern จากข้อ 4-5 ไปใช้กับข้อมูลจริงของคุณ — นับคนสายในเดือนนี้ → แจ้งเตือนผ่าน Telegram
