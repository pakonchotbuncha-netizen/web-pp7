/**
 * Web PP7 - Migration Template Generator
 * สร้าง template sheet สำหรับ import ข้อมูล P1-P7
 */

// ============================================
// สร้าง Template Sheets ทั้งหมด
// ============================================

/**
 * สร้าง template sheets ทั้งหมดใน Spreadsheet ที่กำหนด
 * @param {string} spreadsheetId - ID ของ Google Spreadsheet
 */
function createAllTemplates(spreadsheetId) {
  const ss = SpreadsheetApp.openById(spreadsheetId);
  const results = [];
  
  // สร้าง template สำหรับแต่ละ Process
  const templates = [
    { name: 'P1-แสวงหา', fn: createP1Template },
    { name: 'P2-หยั่งประเมิน', fn: createP2Template },
    { name: 'P3-จับคู่คนกับงาน', fn: createP3Template },
    { name: 'P4-ประเมินผล', fn: createP4Template },
    { name: 'P5-พัฒนา', fn: createP5Template },
    { name: 'P6-ค่าตอบแทน', fn: createP6Template },
    { name: 'P7-คุณภาพชีวิต', fn: createP7Template }
  ];
  
  templates.forEach(t => {
    try {
      t.fn(ss);
      results.push({ name: t.name, status: 'สำเร็จ' });
    } catch (err) {
      results.push({ name: t.name, status: `ผิดพลาด: ${err.message}` });
    }
  });
  
  return results;
}

// ============================================
// P1 - แสวงหาผู้สมัครงาน
// Schema อ้างอิงจาก PP7_Design_P1_แสวงหา.md
// ============================================

function createP1Template(ss) {
  let sheet = ss.getSheetByName('P1-แสวงหา');
  if (!sheet) {
    sheet = ss.insertSheet('P1-แสวงหา');
  } else {
    sheet.clear();
  }
  
  // Headers
  const headers = [
    'id',                    // UUID ผู้สมัคร
    'full_name',             // ชื่อ-นามสกุล
    'position_id',           // ตำแหน่งงานที่สมัคร (FK -> positions)
    'position_title',        // ชื่อตำแหน่ง
    'department',            // แผนก
    'email',                 // อีเมล
    'phone',                 // เบอร์โทร
    'address',               // ที่อยู่
    'source',                // แหล่งที่มา (LinkedIn, Website, Referral, Job Board, Agency)
    'resume_url',            // ลิงก์ไฟล์ Resume
    'pdpa_consent',          // ยินยอม PDPA (TRUE/FALSE)
    'pdpa_consent_date',     // วันที่กดยินยอม
    'status',                // สถานะ (New, Screening, Passed_to_P2, Rejected)
    'screening_notes',       // หมายเหตุการคัดกรอง
    'applied_date',          // วันที่สมัคร
    'created_at'             // วันที่บันทึก
  ];
  
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  
  // ตัวอย่างข้อมูล
  const sampleData = [
    ['CAND-001', 'สมชาย ใจดี', 'POS-DEV-001', 'Software Developer', 'Tech', 
     'somchai@email.com', '0891234567', 'กรุงเทพฯ',
     'LinkedIn', 'https://drive.google.com/file/xxx', 'TRUE',
     '2026-01-15', 'New', '', '2026-01-15', '2026-01-15 10:00:00'],
    ['CAND-002', 'สมหญิง รักเรียน', 'POS-HR-001', 'HR Specialist', 'HR',
     'somying@email.com', '0819876543', 'เชียงใหม่',
     'Referral', 'https://drive.google.com/file/yyy', 'TRUE',
     '2026-01-20', 'Screening', 'ผ่านเกณฑ์เบื้องต้น', '2026-01-20', '2026-01-20 14:30:00']
  ];
  
  if (sampleData.length > 0) {
    sheet.getRange(2, 1, sampleData.length, headers.length).setValues(sampleData);
  }
  
  // Data Validation
  setValidation(sheet, 2, 11, 1000, 'TRUE,FALSE', 'PDPA ต้องเป็น TRUE หรือ FALSE');
  setValidation(sheet, 2, 13, 1000, 'New,Screening,Passed_to_P2,Rejected', 'สถานะไม่ถูกต้อง');
  
  // จัดรูปแบบ
  formatHeader(sheet, headers.length);
  
  return sheet;
}

// ============================================
// P2 - หยั่งประเมิน
// ============================================

function createP2Template(ss) {
  let sheet = ss.getSheetByName('P2-หยั่งประเมิน');
  if (!sheet) {
    sheet = ss.insertSheet('P2-หยั่งประเมิน');
  } else {
    sheet.clear();
  }
  
  const headers = [
    'id',                    // UUID การประเมิน
    'candidate_id',          // FK -> P1 candidates
    'candidate_name',        // ชื่อผู้สมัคร (denormalized)
    'evaluation_type',       // ประเภท (technical, behavioral, culture_fit)
    'evaluator_name',        // ชื่อผู้ประเมิน
    'evaluation_date',       // วันที่ประเมิน
    'criteria',              // JSON: เกณฑ์การประเมินแต่ละข้อ
    'overall_score',         // คะแนนรวม (0-5)
    'result',                // ผล (ผ่าน, ไม่ผ่าน, รออนุมัติ)
    'evidence_links',        // JSON: ลิงก์หลักฐาน
    'comments',              // ความคิดเห็น
    'passed_to_p3',          // ส่งต่อ P3 หรือไม่
    'created_at'
  ];
  
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  
  const sampleData = [
    ['EVAL-001', 'CAND-001', 'สมชาย ใจดี', 'technical', 'วิชัย สอบสวน',
     '2026-02-01', '[{"criteria":"Programming","score":4},{"criteria":"System Design","score":3}]',
     3.5, 'ผ่าน', '["https://link1.com","https://link2.com"]',
     'มีพื้นฐานดี พัฒนาเพิ่มเติมได้', 'TRUE', '2026-02-01 09:00:00']
  ];
  
  sheet.getRange(2, 1, sampleData.length, headers.length).setValues(sampleData);
  
  setValidation(sheet, 2, 6, 1000, 'ผ่าน,ไม่ผ่าน,รออนุมัติ', 'ผลไม่ถูกต้อง');
  setValidation(sheet, 2, 4, 1000, 'technical,behavioral,culture_fit', 'ประเภทไม่ถูกต้อง');
  
  formatHeader(sheet, headers.length);
}

// ============================================
// P3 - จับคู่คนกับงาน
// ============================================

function createP3Template(ss) {
  let sheet = ss.getSheetByName('P3-จับคู่คนกับงาน');
  if (!sheet) {
    sheet = ss.insertSheet('P3-จับคู่คนกับงาน');
  } else {
    sheet.clear();
  }
  
  const headers = [
    'id',                    // UUID การจับคู่
    'candidate_id',          // FK -> P1
    'position_id',           // FK -> positions
    'candidate_name',        // ชื่อผู้สมัคร
    'position_title',        // ชื่อตำแหน่ง
    'match_score',           // คะแนนการจับคู่ (0-100)
    'match_date',            // วันที่จับคู่
    'ai_analysis',           // JSON: ผลวิเคราะห์จาก AI
    'recommendations',       // ข้อเสนอแนะ
    'priority',              // ลำดับความสำคัญ (high, medium, low)
    'status',                // สถานะ (proposed, accepted, rejected)
    'created_at'
  ];
  
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  
  const sampleData = [
    ['MATCH-001', 'CAND-001', 'POS-DEV-001', 'สมชาย ใจดี', 'Software Developer',
     85, '2026-02-10',
     '{"strengths":["JavaScript","React","5yr experience"],"gaps":["Go","Kubernetes"]}',
     'เหมาะสำหรับตำแหน่ง Senior Developer ควรฝึก Go เพิ่มเติม',
     'high', 'proposed', '2026-02-10 11:00:00']
  ];
  
  sheet.getRange(2, 1, sampleData.length, headers.length).setValues(sampleData);
  
  setValidation(sheet, 2, 4, 1000, 'high,medium,low', 'ลำดับความสำคัญไม่ถูกต้อง');
  setValidation(sheet, 2, 11, 1000, 'proposed,accepted,rejected', 'สถานะไม่ถูกต้อง');
  
  formatHeader(sheet, headers.length);
}

// ============================================
// P4 - ประเมินผล (Performance Evaluation)
// Evidence-First Rule: evidence_links ต้องไม่ว่างถ้าคะแนนต่ำกว่าเกณฑ์
// ============================================

function createP4Template(ss) {
  let sheet = ss.getSheetByName('P4-ประเมินผล');
  if (!sheet) {
    sheet = ss.insertSheet('P4-ประเมินผล');
  } else {
    sheet.clear();
  }
  
  const headers = [
    'id',                    // UUID การประเมิน
    'employee_id',           // รหัสพนักงาน (FK -> emp data)
    'employee_name',         // ชื่อพนักงาน
    'department',            // แผนก
    'evaluation_period',     // รอบประเมิน (Q1/2026)
    'evaluation_type',       // ประเภท (360, self, manager, peer)
    'evaluator',             // ผู้ประเมิน
    'kpi_scores',            // JSON: คะแนน KPI แต่ละข้อ
    'overall_score',         // คะแนนรวม (1-5)
    'competency_assessment',// JSON: ประเมินสมรรถนะ
    'evidence_links',        // JSON: หลักฐาน (บังคับถ้าคะแนน < 3)
    'strengths',             // จุดแข็ง
    'development_needs',     // จุดที่ควรพัฒนา
    'goals_set',             // JSON: เป้าหมายที่ตั้ง
    'submitted',             // Submitted หรือไม่
    'created_at'
  ];
  
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  
  const sampleData = [
    ['PERF-001', '6407049', 'ปวีร์ ผ่องโสภา', 'Tech', 'Q1/2026', '360',
     ' supervisors',
     '[{"kpi":"Project Delivery","score":4},{"kpi":"Innovation","score":3}]',
     3.5,
     '[{"competency":"Leadership","score":4},{"competency":"Teamwork","score":5}]',
     '["https://example.com/project-report"]',
     'มีความคิดสร้างสรรค์ ทำงานเป็นทีมดี',
     'ต้องการพัฒนาทักษะ Management',
     '[{"goal":"Lead project","deadline":"2026-06-30"}]',
     'TRUE', '2026-04-01 15:00:00']
  ];
  
  sheet.getRange(2, 1, sampleData.length, headers.length).setValues(sampleData);
  
  formatHeader(sheet, headers.length);
}

// ============================================
// P5 - พัฒนา (Development Plan)
// Trigger: Cascade จาก P4 เมื่อประเมินเสร็จ
// ============================================

function createP5Template(ss) {
  let sheet = ss.getSheetByName('P5-พัฒนา');
  if (!sheet) {
    sheet = ss.insertSheet('P5-พัฒนา');
  } else {
    sheet.clear();
  }
  
  const headers = [
    'id',                    // UUID แผนพัฒนา
    'employee_id',           // รหัสพนักงาน
    'employee_name',         // ชื่อพนักงาน
    'evaluation_ref',        // FK -> P4 (อ้างอิงการประเมิน)
    'plan_start',            // วันที่เริ่มแผน
    'plan_end',              // วันที่สิ้นสุด
    'goals',                 // JSON: เป้าหมาย
    'training_activities',   // JSON: กิจกรรมอบรม
    'mentor_name',           // ชื่อ Mentor
    'resources',             // JSON: ทรัพยากรที่ใช้
    'milestones',            // JSON: จุดตรวจ
    'progress_pct',          // ความคืบหน้า (%)
    'status',                // สถานะ (วางแผน, กำลังดำเนินการ, เสร็จสิ้น, ยกเลิก)
    'created_at'
  ];
  
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  
  const sampleData = [
    ['DEV-001', '6407049', 'ปวีร์ ผ่องโสภา', 'PERF-001',
     '2026-04-15', '2026-10-15',
     '[{"goal":"พัฒนาทักษะ Management","kpi":"ผ่านหลักสูตร"}]',
     '[{"activity":"Leadership Training","date":"2026-05-01","provider":"PKG Academy"}]',
     'สุภาพร์ ผู้จัดการ', 
     '{"budget":15000,"hours":40}',
     '[{"milestone":"เรียนจบ Module 1","date":"2026-06-01","done":true}]',
     40, 'กำลังดำเนินการ', '2026-04-15 09:00:00']
  ];
  
  sheet.getRange(2, 1, sampleData.length, headers.length).setValues(sampleData);
  
  setValidation(sheet, 2, 13, 1000, 'วางแผน,กำลังดำเนินการ,เสร็จสิ้น,ยกเลิก', 'สถานะไม่ถูกต้อง');
  
  formatHeader(sheet, headers.length);
}

// ============================================
// P6 - ค่าตอบแทน
// ============================================

function createP6Template(ss) {
  let sheet = ss.getSheetByName('P6-ค่าตอบแทน');
  if (!sheet) {
    sheet = ss.insertSheet('P6-ค่าตอบแทน');
  } else {
    sheet.clear();
  }
  
  const headers = [
    'id',                    // UUID
    'employee_id',           // รหัสพนักงาน
    'employee_name',         // ชื่อพนักงาน
    'department',            // แผนก
    'base_salary',           // เงินเดือนฐาน
    'position_allowance',    // เบี้ยเลี้ยงตำแหน่ง
    'housing_allowance',     // ค่าเช่าบ้าน
    'transport_allowance',   // ค่าเดินทาง
    'other_allowances',      // สวัสดิการอื่น
    'total_compensation',    // รวมทั้งหมด
    'bonus',                 // โบนัส
    'overtime_pay',          // ค่าล่วงเวลา
    'deductions',            // หัก
    'net_pay',               // receive
    'payment_date',          // วันจ่ายเงิน
    'payment_period',        // รอบ (ม.ค. 2569)
    'created_at'
  ];
  
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  
  const sampleData = [
    ['COMP-001', '6407049', 'ปวีร์ ผ่องโสภา', 'Tech',
     35000, 5000, 3000, 2000, 1000, 46000,
     15000, 3500, 1500, 49500,
     '2026-01-25', 'มกราคม 2569', '2026-01-25 00:00:00']
  ];
  
  sheet.getRange(2, 1, sampleData.length, headers.length).setValues(sampleData);
  
  formatHeader(sheet, headers.length);
}

// ============================================
// P7 - คุณภาพชีวิต (Employee Wellbeing)
// Feedback Loop: ข้อมูลแนวโน้มเชิงลบ → Alert → Manager Dashboard
// ============================================

function createP7Template(ss) {
  let sheet = ss.getSheetByName('P7-คุณภาพชีวิต');
  if (!sheet) {
    sheet = ss.insertSheet('P7-คุณภาพชีวิต');
  } else {
    sheet.clear();
  }
  
  const headers = [
    'id',                    // UUID
    'employee_id',           // รหัสพนักงาน
    'employee_name',         // ชื่อพนักงาน
    'department',            // แผนก
    'survey_date',           // วันที่สำรวจ
    'engagement_score',      // คะแนน Engagement (1-5)
    'satisfaction_scores',   // JSON: คะแนนความพึงพอใจแต่ละด้าน
    'work_life_balance',     // Work-life balance (1-5)
    'stress_level',          // ความเครียด (1-5, 5=มาก)
    'flight_risk',           // ความเสี่ยงลาออก (low, medium, high)
    'recommendations',       // ข้อเสนอแนะ
    'manager_alert',         // ส่ง alert ให้ manager หรือไม่
    'created_at'
  ];
  
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  
  const sampleData = [
    ['WB-001', '6407049', 'ปวีร์ ผ่องโสภา', 'Tech', '2026-03-01',
     4.2,
     '{"งาน":4,"ทีม":5,"เงินเดือน":3,"สภาพแวดล้อม":4}',
     4, 2, 'low',
     'พนักงานมี Engagement ดี อาจพิจารณาขึ้นเงินเดือน',
     'FALSE', '2026-03-01 10:00:00']
  ];
  
  sheet.getRange(2, 1, sampleData.length, headers.length).setValues(sampleData);
  
  setValidation(sheet, 2, 10, 1000, 'low,medium,high', 'ระดับความเสี่ยงไม่ถูกต้อง');
  
  formatHeader(sheet, headers.length);
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * ตั้ง Data Validation สำหรับ range
 */
function setValidation(sheet, startRow, col, endRow, criteria, helpText) {
  const range = sheet.getRange(startRow, col, endRow, 1);
  const rule = SpreadsheetApp.newDataValidation()
    .requireValueList(criteria.split(','))
    .setHelpText(helpText)
    .setAllowInvalid(false)
    .build();
  range.setDataValidation(rule);
}

/**
 * จัดรูปแบบ header row
 */
function formatHeader(sheet, colCount) {
  const headerRange = sheet.getRange(1, 1, 1, colCount);
  headerRange.setBackground('#4285f4');
  headerRange.setFontColor('#ffffff');
  headerRange.setFontWeight('bold');
  headerRange.setHorizontalAlignment('center');
  
  // คำนวณความกว้างคอลัมน์อัตโนมัติ
  for (let i = 1; i <= colCount; i++) {
    sheet.setColumnWidth(i, 150);
  }
  
  // Freeze header row
  sheet.setFrozenRows(1);
}

/**
 * ฟังก์ชันทดสอบ - สร้าง templates ทั้งหมดใน Spreadsheet ปัจจุบัน
 */
function testCreateAllTemplates() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const results = createAllTemplates(ss.getId());
  Logger.log(results);
  return results;
}
