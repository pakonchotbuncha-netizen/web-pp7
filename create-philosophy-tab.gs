/**
 * สร้าง tab "ปรัชญาการออกแบบ Web PP7 v1.0" ใน Google Sheet หลัก Web PP7
 *
 * วิธีใช้:
 * 1. เปิด Google Sheet หลัก Web PP7
 * 2. ไปที่ Extensions > Apps Script
 * 3. ลบ code เดิมออก แล้ว paste code นี้แทน
 * 4. กด Run > createPhilosophyTab
 * 5. อนุญาต access ที่ขอ
 * 6. กลับไปดู Sheet จะมี tab "ปรัชญาการออกแบบ Web PP7 v1.0" เพิ่มมา
 *
 * หมายเหตุ: สคริปต์นี้รองรับทั้งแบบ Bound (ผูกกับ Sheet โดยตรง)
 * และแบบ Standalone (รันแยก) — ถ้า getActiveSpreadsheet() ใช้ไม่ได้
 * จะ fallback ไปเปิดด้วย TARGET_SS_ID ด้านล่าง
 */

// เปลี่ยนค่านี้ถ้า Sheet หลักย้าย ID (ใช้เฉพาะตอนรันแบบ Standalone)
var TARGET_SS_ID = '1yP_l-WmsnlkMDCkZB7ulhe6oS_AAex8iE3LYdPdg-uc';
var TAB_NAME = 'ปรัชญาการออกแบบ Web PP7 v1.0';
var SHARE_EMAIL = 'pakonchotbuncha@gmail.com';

function getTargetSpreadsheet() {
  var ss = null;
  try {
    ss = SpreadsheetApp.getActiveSpreadsheet();
  } catch (e) {
    ss = null;
  }
  if (!ss) {
    ss = SpreadsheetApp.openById(TARGET_SS_ID); // fallback สำหรับ Standalone
  }
  return ss;
}

function createPhilosophyTab() {
  var ss = getTargetSpreadsheet();

  // ลบ tab เก่าถ้ามี (ป้องกันสร้างซ้ำ)
  var existing = ss.getSheetByName(TAB_NAME);
  if (existing) {
    ss.deleteSheet(existing);
  }

  var sheet = ss.insertSheet(TAB_NAME);

  // ============================================================
  // หัวเรื่อง + ส่วนหัวคอลัมน์
  // ============================================================
  var titleRow = 1;
  var headerRow = 2;

  var titleRange = sheet.getRange(titleRow, 1, 1, 2);
  titleRange.merge();
  titleRange.setValue('🧭 ปรัชญาการออกแบบ Web PP7 (Design Philosophy) — v1.0')
    .setBackground('#1a73e8')
    .setFontColor('#ffffff')
    .setFontSize(14)
    .setHorizontalAlignment('center')
    .setFontWeight('bold');

  var headerRange = sheet.getRange(headerRow, 1, 1, 2);
  headerRange.setValues([['หัวข้อ', 'รายละเอียด']])
    .setBackground('#d2e3fc')
    .setFontWeight('bold')
    .setHorizontalAlignment('center')
    .setFontSize(11);

  // ============================================================
  // เนื้อหา: [หัวข้อ, รายละเอียด, เป็นหัวข้อกลุ่มหรือไม่]
  // ============================================================
  var rows = [
    ['ข้อมูลเอกสาร', 'จัดทำ: 14 ตุลาคม 2569 · เจ้าของ: ปกรณ์ (PKG) · Executive Sponsor · จัดทำโดย KiloClaw (PM + Developer)', true],
    ['ที่มา', 'สังเคราะห์จากข้อมูลเดิมที่เคยเขียนไว้ (สร้างบ้านรอคนเข้าอยู่ · AI เสนอ มนุษย์ยืนยัน · PAC · MMOA · Build to Last)', false],
    ['สถานะ', 'ร่าง — ข้อ 9–10 เป็นข้อเสนอ รอยืนยันจากพี่ปกรณ์ · รอนิยาม WaC (ข้อ 5)', false],
    ['แนวคิดแกนกลาง', '"สร้างบ้านรอคนเข้าอยู่" 🏠 — สร้างระบบให้สมบูรณ์ทุกห้องก่อน แล้วนำเข้าข้อมูลจริงทีหลัง', true],
    ['หลักการกลางทุกกระบวนการ', '"AI เสนอ มนุษย์ยืนยัน" (Human-in-the-Loop)', true],
    ['1. Automation level 90%+', 'งานที่ทำซ้ำและคำนวณได้ ให้ AI/ระบบทำอัตโนมัติ ≥ 90% — คนทำหน้าที่ตรวจและแก้ไขสิ่งที่ AI ทำมา (ไม่ใช่ทำเองตั้งแต่ต้น) · อ้างอิงเดิม: MMOA Strategy (Maximize/Minimize/Optimize/Automate) · จุดตัดสินของคนชัดเจนเป็น HITL Gate ("AI ช่วยคัด/ช่วยร่าง/ช่วยคำนวณ — คนตัดสิน")', true],
    ['2. Log everything', 'บันทึกการเปลี่ยนแปลงทุกอย่าง (ใคร/ทำอะไร/เมื่อไร/ค่าเดิม→ค่าใหม่) ตรวจสอบย้อนกลับได้ทุกจุด · อ้างอิงเดิม: Audit Log 100% (Obj.1 KR3)', true],
    ['3. AI Natively', 'มี AI ฝังตั้งแต่กำเนิดของระบบทุก P — ไม่ใช่ AI ที่แปะเพิ่มทีหลัง · AI Layer ในสถาปัตยกรรม: NLU/NLP ไทย · Scoring Engine (CC) · Matching Engine · Anomaly Detection · Chatbot HR', true],
    ['4. ความถูกต้องข้อมูล 100%', 'ข้อมูลถูกต้อง ครบถ้วน มีแหล่งอ้างอิง — Single Source of Truth, ตรวจสอบก่อนบันทึก, ลดการคีย์ซ้ำ/คีย์สองที่ · อ้างอิงเดิม: Data-Driven + AI Validation Engine', true],
    ['5. WaC native 100% (เคลื่อนตาม WaC 100%)', 'ระบบต้องเคลื่อนตาม WaC ทั้งหมด · ⚠️ รอนิยาม WaC จากพี่ปกรณ์เพื่อระบุให้ตรง (ยังไม่ยืนยันความหมาย)', true],
    ['6. ใช้ PKG Stack (โครงสร้างทาง IT ใหม่จาก AGS)', 'Frontend: HTML + TailwindCSS + Chart.js + XLSX · Backend: Google Apps Script (AGS) · Database: Google Sheets (BCT) · Auth: Token-based + RBAC (6 roles) · Deploy: Google Web App', true],
    ['7. Modular Design', 'แยกองค์ประกอบให้ทำงานบน Platform แยกส่วน — ไปไหนก็ได้ในรูป API และนำกลับมาใช้ซ้ำได้ · เป้าหมาย reuse: AMS5 · PMS2 · CPD1', true],
    ['8. Graphic > Text', 'สื่อสารด้วยภาพก่อนตัวอักษร — Dashboard / Chart / Infographic (เช่น PRG-PDG, bars-infographic, orgchart)', true],
    ['9. Secure & Compliance by Design (เสนอ — รอยืนยัน)', 'ความมั่นคงปลอดภัยและกฎหมาย/ข้อกำหนด ฝังตั้งแต่ต้น ไม่ใช่เพิ่มทีหลัง · PDPA: Consent Gate ก่อนกรอกใบสมัคร (เก็บ consent_id/เวอร์ชัน/เวลา/ip) · encryption · access control · retention policy · RBAC 6 roles (admin / hr_manager / bu_manager / employee / auditor / guest) · หลัก least privilege · ทุกการกระทำตรวจสอบย้อนได้ (เชื่อมกับข้อ 2) · สอดคล้อง ISMS และกฎหมายแรงงาน 3 ประเทศ (LCT)', true],
    ['10. Multi-language & Multi-BU by Design (เสนอ — รอยืนยัน)', 'รองรับหลายภาษาและหลายหน่วยธุรกิจ/หลายประเทศตั้งแต่โครงสร้าง — ขยายเพิ่มโดยไม่รื้อระบบ · 3 ประเทศ: ไทย (FU01/THAI) · ลาว (RPLCG) · กัมพูชา (RAFCOG) · หลายภาษา: ไทย/ลาว/กัมพูชา (+อังกฤษกำกับ) · หลายสกุลเงิน · หลายรูปแบบเอกสาร/กฎหมาย · แยก Theme สี/สิทธิ์/ข้อมูลตาม BU · Responsive ทุกอุปกรณ์ (มือถือ/แท็บเล็ต/เดสก์ท็อป) · ต่อยอดข้อ 7 Modular Design — เพิ่ม BU/ประเทศใหม่ = เสียบโมดูล ไม่ต้องแก้แกน', true],
    ['ภาคผนวก — ข้อมูลเดิมที่เกี่ยวข้อง', 'สร้างบ้านรอคนเข้าอยู่ — MEMORY.md, presentation-dashboard.html, WEB_PP7_STATUS_REPORT.md (Build to Last)', true],
    ['', 'AI เสนอ มนุษย์ยืนยัน — docs/PM-PP7-AI-POINTS.html, docs/PM-PP7-FLOW.html, docs/PM-PROCESS-MANUAL-ISO.md', false],
    ['', 'หลักการออกแบบ PAC (People Asset Capital) — คนเป็น Asset · CC เป็นแกน · Data-Driven (13 ส.ค. 2569)', false],
    ['', 'MMOA Strategy — VISION-STRATEGY.md (25 มิ.ย. 2569)', false],
    ['', 'หลักการออกแบบโครงสร้าง Web PP7 (§9.1–9.2) — docs/SMC_HOCC_PM_002_PP7_AI_DIAGRAM.md', false],
    ['', 'Documentation Driven Development — เขียน WI 66 กระบวนการก่อนเขียนโค้ด', false]
  ];

  var startRow = headerRow + 1;
  for (var i = 0; i < rows.length; i++) {
    var r = startRow + i;
    sheet.getRange(r, 1).setValue(rows[i][0]);
    sheet.getRange(r, 2).setValue(rows[i][1]).setWrap(true);
    if (rows[i][2]) {
      sheet.getRange(r, 1).setFontWeight('bold').setBackground('#fef7e0');
    }
  }
  var lastRow = startRow + rows.length - 1;

  // ============================================================
  // หมายเหตุท้ายตาราง
  // ============================================================
  var noteRow = lastRow + 2;
  sheet.getRange(noteRow, 1).setValue('📌 หมายเหตุ:')
    .setFontWeight('bold').setFontColor('#d93025');
  sheet.getRange(noteRow + 1, 1, 1, 2).merge();
  sheet.getRange(noteRow + 1, 1).setValue(
    '• ข้อ 9–10 เป็นข้อเสนอ รอยืนยันจากพี่ปกรณ์\n' +
    '• ข้อ 5 รอนิยาม WaC จากพี่ปกรณ์เพื่อระบุให้ตรง\n' +
    '• ต้นฉบับเต็ม: docs/DESIGN-PHILOSOPHY-WEB-PP7.md ใน repo web-pp7'
  ).setWrap(true);

  // ============================================================
  // จัดรูปแบบ
  // ============================================================
  sheet.setColumnWidth(1, 320);
  sheet.setColumnWidth(2, 700);
  sheet.setFrozenRows(headerRow);

  var bodyRange = sheet.getRange(headerRow, 1, lastRow - headerRow + 1, 2);
  bodyRange.setBorder(true, true, true, true, true, true, '#000000', SpreadsheetApp.BorderStyle.SOLID);
  sheet.getRange(startRow, 1, rows.length, 2).setVerticalAlignment('top');

  // ============================================================
  // แชร์ Sheet ให้เจ้าของ (ใช้ ID ของไฟล์ปัจจุบัน ไม่ hardcode ซ้ำ)
  // ============================================================
  DriveApp.getFileById(ss.getId()).addEditor(SHARE_EMAIL);

  // ============================================================
  // สรุปผล
  // ============================================================
  Logger.log('✅ สร้าง tab "' + TAB_NAME + '" สำเร็จ! (' + rows.length + ' แถว)');
  Logger.log('📧 แชร์ให้ ' + SHARE_EMAIL + ' แล้ว');

  SpreadsheetApp.getUi().alert(
    '✅ สร้าง tab "' + TAB_NAME + '" สำเร็จ!\n\n' +
    '📝 ' + rows.length + ' แถว (หัวข้อ/รายละเอียด)\n' +
    '📧 แชร์ให้ ' + SHARE_EMAIL + ' แล้ว\n\n' +
    'กรุณาตรวจสอบ tab ใหม่ใน Sheet'
  );
}
