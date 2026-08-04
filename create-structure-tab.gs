/**
 * สร้าง tab "โครงสร้างธุรกิจ" ใน Google Sheet หลัก Web PP7
 * 
 * วิธีใช้:
 * 1. เปิด Google Sheet หลัก: https://docs.google.com/spreadsheets/d/1yP_l-WmsnlkMDCkZB7ulhe6oS_AAex8iE3LYdPdg-uc/edit
 * 2. ไปที่ Extensions > Apps Script
 * 3. ลบ code เดิมออก แล้ว paste code นี้แทน
 * 4. กด Run > createStructureTab
 * 5. อนุญาต access ที่ขอ
 * 6. กลับไปดู Sheet จะมี tab "โครงสร้างธุรกิจ" เพิ่มมา
 */

function createStructureTab() {
  var SS_ID = '1yP_l-WmsnlkMDCkZB7ulhe6oS_AAex8iE3LYdPdg-uc';
  var ss = SpreadsheetApp.openById(SS_ID);
  
  // ลบ tab เก่าถ้ามี (ป้องกันสร้างซ้ำ)
  var existingSheet = ss.getSheetByName('โครงสร้างธุรกิจ');
  if (existingSheet) {
    ss.deleteSheet(existingSheet);
  }
  
  var sheet = ss.insertSheet('โครงสร้างธุรกิจ');
  
  // ============================================================
  // ส่วนที่ 1: ข้อมูลโครงสร้างบริษัท ภาษี
  // ============================================================
  var taxTitleRow = 1;
  var taxHeaderRow = 2;
  
  var taxHeaders = [
    'รหัสสมาชิก',           // A
    'ชื่อสมาชิก',           // B
    'ประเทศ',               // C
    'บริษัท',               // D
    'บริษัทใหม่ (กรอก)',     // E
    'ชื่อภาษาอังกฤษ',       // F
    'ที่อยู่ภาษาไทย',       // G
    'ที่อยู่ภาษาอังกฤษ',     // H
    'สาขา',                 // I
    'สาขาใหม่ (กรอก)',       // J
    'ตัวย่อสาขา',           // K
    'ที่อยู่สาขา ภาษาไทย',   // L
    'ฝ่าย',                 // M
    'ฝ่ายใหม่ (กรอก)',       // N
    'ชื่อฝ่ายภาษาอังกฤษ',   // O
    'ตัวย่อฝ่ายภาษาอังกฤษ', // P
    'แผนก',                 // Q
    'แผนกใหม่ (กรอก)',       // R
    'ชื่อแผนกภาษาอังกฤษ',   // S
    'ตัวย่อแผนกภาษาอังกฤษ', // T
    'ตำแหน่งงาน',           // U
    'ตำแหน่งงานใหม่ (กรอก)', // V
    'ชื่อตำแหน่งงานภาษาอังกฤษ', // W
    'ตัวย่อตำแหน่งงานภาษาอังกฤษ', // X
    'คุณสมบัติ',            // Y
    'อัพเดทข้อมูล (ลิงค์)'  // Z
  ];
  
  var taxColCount = taxHeaders.length; // 26 columns (A-Z)
  
  // Title row
  var titleRange = sheet.getRange(taxTitleRow, 1, 1, taxColCount);
  titleRange.merge();
  titleRange.setValue('📋 ข้อมูลโครงสร้างบริษัท ภาษี')
    .setBackground('#1a73e8')
    .setFontColor('#ffffff')
    .setFontSize(14)
    .setHorizontalAlignment('center')
    .setFontWeight('bold');
  
  // Header row
  var headerRange = sheet.getRange(taxHeaderRow, 1, 1, taxColCount);
  headerRange.setValues([taxHeaders])
    .setBackground('#d2e3fc')
    .setFontWeight('bold')
    .setHorizontalAlignment('center')
    .setFontSize(10);
  
  // ============================================================
  // ส่วนที่ 2: ข้อมูลโครงสร้างบริษัท บริหาร
  // ============================================================
  var adminTitleRow = taxHeaderRow + 2; // row 4 (เว้น row 3)
  var adminHeaderRow = adminTitleRow + 1; // row 5
  
  var adminHeaders = [
    'ประเทศ',                   // A
    'บริษัท',                   // B
    'บริษัทใหม่ (กรอก)',         // C
    'ชื่อบริษัทภาษาอังกฤษ',     // D
    'ตัวย่อบริษัทภาษาอังกฤษ',   // E
    'ทีม',                      // F
    'ทีมใหม่ (กรอก)',            // G
    'ตัวย่อทีมภาษาอังกฤษ',      // H
    'กรุ๊ป',                    // I
    'บทบาท',                    // J
    'บทบาทใหม่ (กรอก)',          // K
    'ชื่อบทบาทภาษาอังกฤษ',      // L
    'ตัวย่อบทบาทภาษาอังกฤษ',    // M
    'ภาพความสำเร็จทีม',         // N
    'RMMทีม(แนบรูป)',           // O
    'จุดมุ่งหมายทีม',           // P
    'เป้าหมายทีม(Objective)',   // Q
    'ตัววัดผลทีม(Key Result)',   // R
    'สถานะวัดผล',               // S
    'หน้าที่ความรับผิดชอบหลักทีม' // T
  ];
  
  var adminColCount = adminHeaders.length; // 20 columns (A-T)
  
  // Title row
  var adminTitleRange = sheet.getRange(adminTitleRow, 1, 1, adminColCount);
  adminTitleRange.merge();
  adminTitleRange.setValue('🏢 ข้อมูลโครงสร้างบริษัท บริหาร')
    .setBackground('#0d652d')
    .setFontColor('#ffffff')
    .setFontSize(14)
    .setHorizontalAlignment('center')
    .setFontWeight('bold');
  
  // Header row
  var adminHeaderRange = sheet.getRange(adminHeaderRow, 1, 1, adminColCount);
  adminHeaderRange.setValues([adminHeaders])
    .setBackground('#ceead6')
    .setFontWeight('bold')
    .setHorizontalAlignment('center')
    .setFontSize(10);
  
  // ============================================================
  // ส่วนที่ 3: หมายเหตุ / คำแนะนำ (วางด้านล่างส่วนบริหาร)
  // ============================================================
  var noteRow = adminHeaderRow + 2; // row 7
  
  sheet.getRange(noteRow, 1).setValue('📌 หมายเหตุ:')
    .setFontWeight('bold').setFontColor('#d93025');
  
  sheet.getRange(noteRow + 1, 1).setValue(
    '• คอลัมน์ที่มี "(กรอก)" = ใช้สำหรับกรอกข้อมูลใหม่เมื่อไม่มีใน dropdown\n' +
    '• "อัพเดทข้อมูล (ลิงค์)" = วางลิงค์หลังจากอัพเดทข้อมูลจาก https://ags.im/fUdeLB\n' +
    '• หากคีย์รอบแรกขึ้น error "SyntaxError" ให้ลบข้อมูลที่คีย์แล้วในชีท B1_Forms_ตอบรับ แล้วคีย์ใหม่\n' +
    '• ตรวจสอบข้อความข้างหลังต้องไม่มีค่าว่างเกินอยู่ (เน้นหัวข้อ คุณสมบัติ กับ หน้าที่ความรับผิดชอบหลักทีม)'
  ).setWrap(true);
  
  // ============================================================
  // จัดรูปแบบ
  // ============================================================
  
  // ปรับความกว้างคอลัมน์อัตโนมัติ
  for (var i = 1; i <= Math.max(taxColCount, adminColCount); i++) {
    sheet.setColumnWidth(i, 160);
  }
  
  // คอลัมน์กว้างพิเศษสำหรับ field ยาว
  sheet.setColumnWidth(25, 250); // คุณสมบัติ
  sheet.setColumnWidth(26, 200); // อัพเดทข้อมูล (ลิงค์)
  sheet.setColumnWidth(14, 200); // ภาพความสำเร็จทีม
  sheet.setColumnWidth(15, 180); // RMMทีม(แนบรูป)
  sheet.setColumnWidth(16, 200); // จุดมุ่งหมายทีม
  sheet.setColumnWidth(17, 200); // เป้าหมายทีม(Objective)
  sheet.setColumnWidth(18, 200); // ตัววัดผลทีม(Key Result)
  sheet.setColumnWidth(20, 300); // หน้าที่ความรับผิดชอบหลักทีม
  
  // Freeze header rows (freeze row 1-2 สำหรับส่วนภาษี)
  sheet.setFrozenRows(taxHeaderRow);
  
  // เพิ่ม border ให้ดูสะอาด
  var taxDataRange = sheet.getRange(taxHeaderRow, 1, 1, taxColCount);
  taxDataRange.setBorder(true, true, true, true, true, true, '#000000', SpreadsheetApp.BorderStyle.SOLID);
  
  var adminDataRange = sheet.getRange(adminHeaderRow, 1, 1, adminColCount);
  adminDataRange.setBorder(true, true, true, true, true, true, '#000000', SpreadsheetApp.BorderStyle.SOLID);
  
  // ============================================================
  // สร้าง Data Validation (Dropdown) สำหรับ field ที่มี dropdown
  // ============================================================
  
  // สร้าง sheet สำหรับ dropdown data (ซ่อนไว้)
  var dropdownSheet = ss.getSheetByName('_dropdown_data');
  if (!dropdownSheet) {
    dropdownSheet = ss.insertSheet('_dropdown_data');
    dropdownSheet.hideSheet();
  }
  
  // ตัวอย่าง dropdown สำหรับ ประเทศ
  dropdownSheet.getRange('A1').setValue('ประเทศ');
  dropdownSheet.getRange('A2:A4').setValues([['ไทย'], ['ลาว'], ['กัมพูชา']]);
  
  var countryRule = SpreadsheetApp.newDataValidation()
    .requireValueInRange(dropdownSheet.getRange('A2:A4'), true)
    .setAllowInvalid(true)
    .setHelpText('เลือกประเทศ หรือพิมพ์ใหม่')
    .build();
  
  // Apply dropdown to tax section column C (ประเทศ)
  sheet.getRange(taxHeaderRow + 1, 3, 100, 1).setDataValidation(countryRule);
  
  // Apply dropdown to admin section column A (ประเทศ)
  sheet.getRange(adminHeaderRow + 1, 1, 100, 1).setDataValidation(countryRule);
  
  // ============================================================
  // สรุปผล
  // ============================================================
  Logger.log('✅ สร้าง tab "โครงสร้างธุรกิจ" สำเร็จ!');
  Logger.log('📋 ส่วนภาษี: ' + taxColCount + ' columns (Row ' + taxTitleRow + '-' + taxHeaderRow + ')');
  Logger.log('🏢 ส่วนบริหาร: ' + adminColCount + ' columns (Row ' + adminTitleRow + '-' + adminHeaderRow + ')');
  Logger.log('📌 หมายเหตุ: Row ' + noteRow);
  
  // แสดง popup แจ้งผล
  SpreadsheetApp.getUi().alert(
    '✅ สร้าง tab "โครงสร้างธุรกิจ" สำเร็จ!\n\n' +
    '📋 ส่วนภาษี: ' + taxColCount + ' columns\n' +
    '🏢 ส่วนบริหาร: ' + adminColCount + ' columns\n\n' +
    'กรุณาตรวจสอบ tab ใหม่ใน Sheet'
  );
}
