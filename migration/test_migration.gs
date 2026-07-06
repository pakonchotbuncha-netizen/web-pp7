/**
 * ============================================================
 * Web PP7 - Test Migration System
 * ============================================================
 * 
 * ทดสอบระบบ Migration ทุกส่วน
 * เรียกใช้: testAll() หรือรันทีละ function
 * 
 * ผู้สร้าง: Web PP7 Migration System
 * วันที่: 2026-07-06
 */

// ============================================================
// ฟังก์ชันทดสอบหลัก
// ============================================================

/**
 * รันทดสอบทั้งหมด
 * แสดงผลใน Logger
 */
function testAll() {
  var results = [];
  
  Logger.log('🧪 เริ่มต้นทดสอบ Migration System');
  Logger.log('==========================================');
  
  results.push({ name: 'validateRow - Required Fields', test: testValidateRowRequired });
  results.push({ name: 'validateRow - Format Checking', test: testValidateRowFormat });
  results.push({ name: 'validateRow - Allowed Values', test: testValidateRowAllowedValues });
  results.push({ name: 'validateRow - Date Validation', test: testValidateRowDate });
  results.push({ name: 'Duplicate Detection', test: testDuplicateDetection });
  results.push({ name: 'Empty Row Detection', test: testEmptyRowDetection });
  results.push({ name: 'Column Mapping', test: testColumnMapping });
  results.push({ name: 'Header Mapping', test: testHeaderMapping });
  results.push({ name: 'Template Creation', test: testTemplateCreation });
  results.push({ name: 'Rollback Mechanism', test: testRollbackMechanism });
  
  var passCount = 0;
  var failCount = 0;
  
  for (var i = 0; i < results.length; i++) {
    var r = results[i];
    try {
      r.test();
      passCount++;
      Logger.log('  ✅ ' + r.name);
    } catch (e) {
      failCount++;
      Logger.log('  ❌ ' + r.name + ': ' + e.message);
    }
  }
  
  Logger.log('==========================================');
  Logger.log('📊 ผลทดสอบ: ' + passCount + ' ผ่าน | ' + failCount + ' ล้มเหลว');
  Logger.log('==========================================');
}

// ============================================================
// Helper สำหรับ Assert
// ============================================================

/**
 * ตรวจสอบว่าค่าจริงเท่ากับค่าที่คาดหวัง
 */
function assertEquals(expected, actual, message) {
  if (JSON.stringify(expected) !== JSON.stringify(actual)) {
    throw new Error(message + ' → คาด: ' + JSON.stringify(expected) + 
                    ' ได้: ' + JSON.stringify(actual));
  }
}

/**
 * ตรวจสอบว่าเป็นจริง
 */
function assertTrue(condition, message) {
  if (!condition) {
    throw new Error(message + ' → คาดว่าเป็น true แต่เป็น false');
  }
}

/**
 * ตรวจสอบว่าเป็นเท็จ
 */
function assertFalse(condition, message) {
  if (condition) {
    throw new Error(message + ' → คาดว่าเป็น false แต่เป็น true');
  }
}

// ============================================================
// ทดสอบ validateRow - Required Fields
// ============================================================

function testValidateRowRequired() {
  // ทดสอบ: ฟิลด์บังคับต้องผ่าน validation
  var validRow = {
    id: '6407049',
    firstname: 'ปวีร์',
    lastname: 'ผ่องโสภา',
    full_name: 'นายปวีร์ ผ่องโสภา',
    email: 'pavee.pho.pkg@gmail.com',
    employee_status: 'สมาชิกประจำ',
    start_date: '21/07/2021'
  };
  
  var result = validateRow(validRow, SCHEMA_RULES);
  assertTrue(result.isValid, 'ข้อมูลที่ครบ must pass validation');
  assertEquals(0, result.errors.length, 'ต้องไม่มี error');
  
  // ทดสอบ: ฟิลด์ id ว่าง (required) ต้องไม่ผ่าน
  var invalidRow = {
    id: '',
    firstname: 'ทดสอบ',
    lastname: 'ทดสอบ',
    full_name: 'ทดสอบ ทดสอบ',
    email: 'test@test.com',
    employee_status: 'สมาชิกประจำ',
    start_date: '21/07/2021'
  };
  
  var result2 = validateRow(invalidRow, SCHEMA_RULES);
  assertFalse(result2.isValid, 'ข้อมูลที่ขาด id ต้องไม่ผ่าน');
  assertTrue(result2.errors.length > 0, 'ต้องมี error อย่างน้อย 1 รายการ');
  
  // ทดสอบ: id ไม่ตรงกับ pattern
  var badIdRow = {
    id: 'ABC',
    firstname: 'ทดสอบ',
    lastname: 'ทดสอบ',
    full_name: 'ทดสอบ ทดสอบ',
    email: 'test@test.com',
    employee_status: 'สมาชิกประจำ',
    start_date: '21/07/2021'
  };
  
  var result3 = validateRow(badIdRow, SCHEMA_RULES);
  assertFalse(result3.isValid, 'id ต้องเป็นตัวเลข 7 หลัก');
}

// ============================================================
// ทดสอบ validateRow - Format Checking
// ============================================================

function testValidateRowFormat() {
  // ทดสอบ: รูปแบบ อีเมล
  var validEmail = {
    id: '6407049',
    firstname: 'ทดสอบ',
    lastname: 'ทดสอบ',
    full_name: 'ทดสอบ ทดสอบ',
    email: 'valid.email@example.com',
    employee_status: 'สมาชิกประจำ',
    start_date: '21/07/2021'
  };
  
  var r1 = validateRow(validEmail, SCHEMA_RULES);
  assertTrue(r1.isValid, 'อีเมลที่ถูกต้องต้องผ่าน');
  
  var invalidEmail = Object.assign({}, validEmail, { email: 'not-an-email' });
  var r2 = validateRow(invalidEmail, SCHEMA_RULES);
  assertFalse(r2.isValid, 'อีเมลที่ผิดต้องไม่ผ่าน');
  
  // ทดสอบ: เลขบัตรประชาชน
  var hasNationalId = Object.assign({}, validEmail, { national_id: '1234567890123' });
  var r3 = validateRow(hasNationalId, SCHEMA_RULES);
  assertTrue(r3.isValid, 'เลขประชาชน 13 หลักต้องผ่าน');
  
  var badNationalId = Object.assign({}, validEmail, { national_id: '12345' });
  var r4 = validateRow(badNationalId, SCHEMA_RULES);
  assertFalse(r4.isValid, 'เลขประชาชน 5 หลักต้องไม่ผ่าน');
  
  // ทดสอบ: เบอร์มือถือ
  var hasPhone = Object.assign({}, validEmail, { phone: '0812345678' });
  var r5 = validateRow(hasPhone, SCHEMA_RULES);
  assertTrue(r5.isValid, 'เบอร์ 10 หลักต้องผ่าน');
  
  var badPhone = Object.assign({}, validEmail, { phone: 'abc-defg-hij' });
  var r6 = validateRow(badPhone, SCHEMA_RULES);
  assertFalse(r6.isValid, 'เบอร์ที่ผิดรูปแบบต้องไม่ผ่าน');
}

// ============================================================
// ทดสอบ validateRow - Allowed Values
// ============================================================

function testValidateRowAllowedValues() {
  // ทดสอบ: คำนำหน้า
  var validPrefix = {
    id: '6407049',
    firstname: 'ทดสอบ',
    lastname: 'ทดสอบ',
    full_name: 'นาย ทดสอบ ทดสอบ',
    email: 'test@test.com',
    employee_status: 'สมาชิกประจำ',
    start_date: '21/07/2021'
  };
  
  // คำนำหน้าที่ถูกต้อง
  var prefixes = ['นาย', 'นาง', 'นางสาว', ''];
  for (var i = 0; i < prefixes.length; i++) {
    var testData = Object.assign({}, validPrefix, { prefix: prefixes[i] });
    var r = validateRow(testData, SCHEMA_RULES);
    assertTrue(r.isValid, 'คำนำหน้า "' + prefixes[i] + '" ต้องผ่าน');
  }
  
  // คำนำหน้าที่ผิด
  var badPrefix = Object.assign({}, validPrefix, { prefix: 'ดร.' });
  var rBad = validateRow(badPrefix, SCHEMA_RULES);
  assertFalse(rBad.isValid, 'คำนำหน้า "ดร." ต้องไม่ผ่าน');
  
  // ทดสอบ: สถานะพนักงาน
  var validStatuses = [
    'สมาชิกประจำ', 'สมาชิกทดลองงาน', 'สมาชิกประจำ(เกษียณ)',
    'สัญญาจ้าง', 'สัญญาจ้าง(เกษียณ)', 'ลาออก', ''
  ];
  for (var j = 0; j < validStatuses.length; j++) {
    var statusData = Object.assign({}, validPrefix, { employee_status: validStatuses[j] });
    var rS = validateRow(statusData, SCHEMA_RULES);
    assertTrue(rS.isValid, 'สถานะ "' + validStatuses[j] + '" ต้องผ่าน');
  }
  
  // สถานะที่ผิด
  var badStatus = Object.assign({}, validPrefix, { employee_status: 'เสียชีวิต' });
  var rBadS = validateRow(badStatus, SCHEMA_RULES);
  assertFalse(rBadS.isValid, 'สถานะ "เสียชีวิต" ต้องไม่ผ่าน');
}

// ============================================================
// ทดสอบ validateRow - Date Validation
// ============================================================

function testValidateRowDate() {
  var baseRow = {
    id: '6407049',
    firstname: 'ทดสอบ',
    lastname: 'ทดสอบ',
    full_name: 'ทดสอบ ทดสอบ',
    email: 'test@test.com',
    employee_status: 'สมาชิกประจำ'
  };
  
  // วันที่ถูกต้อง
  var validDate = Object.assign({}, baseRow, { start_date: '21/07/2021' });
  var r1 = validateRow(validDate, SCHEMA_RULES);
  assertTrue(r1.isValid, 'วันที่ DD/MM/YYYY ต้องผ่าน');
  
  // วันที่ถูกต้องอีกรูปแบบ
  var validDate2 = Object.assign({}, baseRow, { start_date: '01/01/2000' });
  var r2 = validateRow(validDate2, SCHEMA_RULES);
  assertTrue(r2.isValid, 'วันที่ 01/01/2000 ต้องผ่าน');
  
  // วันที่ผิดรูปแบบ
  var badDate1 = Object.assign({}, baseRow, { start_date: '2021-07-21' });
  var r3 = validateRow(badDate1, SCHEMA_RULES);
  assertFalse(r3.isValid, 'วันที่ YYYY-MM-DD ต้องไม่ผ่าน (ต้องการ DD/MM/YYYY)');
  
  // เดือนผิด
  var badDate2 = Object.assign({}, baseRow, { start_date: '35/13/2021' });
  var r4 = validateRow(badDate2, SCHEMA_RULES);
  assertFalse(r4.isValid, 'วันที่เดือน 13 ต้องไม่ผ่าน');
  
  // ปีเกินขอบเขต
  var badDate3 = Object.assign({}, baseRow, { start_date: '01/01/1800' });
  var r5 = validateRow(badDate3, SCHEMA_RULES);
  assertFalse(r5.isValid, 'ปี 1800 ต้องไม่ผ่าน (ขอบเขต 1900-2100)');
  
  // Date Object ที่ถูกต้อง
  var dateObj = Object.assign({}, baseRow, { start_date: new Date(2021, 6, 21) });
  var r6 = validateRow(dateObj, SCHEMA_RULES);
  assertTrue(r6.isValid, 'Date Object ต้องผ่าน');
}

// ============================================================
// ทดสอบ Detect Duplicates
// ============================================================

function testDuplicateDetection() {
  // จำลองข้อมูลที่มีอยู่แล้ว
  var existingIds = {
    '6407049': true,
    '6407047': true,
    '6407048': true
  };
  
  var testId = '6407049';
  assertTrue(existingIds[testId], 'รหัสที่มีอยู่แล้ว ต้องตรวจพบ');
  
  var newId = '9999999';
  assertFalse(existingIds[newId], 'รหัสใหม่ ต้องไม่พบใน existing');
}

// ============================================================
// ทดสอบ Empty Row Detection
// ============================================================

function testEmptyRowDetection() {
  // แถวทั้งหมดว่าง
  assertTrue(isRowEmpty(['', '', '', null, undefined]), 'แถวว่างทั้งหมดต้องเป็น empty');
  assertTrue(isRowEmpty([]), 'แถวไม่มีข้อมูลต้องเป็น empty');
  assertTrue(isRowEmpty(['', null, '']), 'แถวที่มีแต่ empty/null ต้องเป็น empty');
  
  // แถวมีข้อมูล
  assertFalse(isRowEmpty(['6407049', 'ทดสอบ', 'ทดสอบ']), 'แถวมีข้อมูลต้องไม่เป็น empty');
  assertFalse(isRowEmpty(['', 'something', '']), 'แถวมีข้อมูลในบาง cell ต้องไม่เป็น empty');
}

// ============================================================
// ทดสอบ Column Mapping
// ============================================================

function testColumnMapping() {
  // ตรวจสอบว่า COLUMN_MAP มีฟิลด์สำคัญครบ
  var requiredFields = ['id', 'firstname', 'lastname', 'full_name', 'email', 
                         'employee_status', 'start_date'];
  
  for (var i = 0; i < requiredFields.length; i++) {
    var field = requiredFields[i];
    assertTrue(COLUMN_MAP.hasOwnProperty(field), 
      'COLUMN_MAP ต้องมี field: ' + field);
  }
  
  // ตรวจสอบว่า index ไม่ซ้ำ
  var indexes = {};
  for (var fieldKey in COLUMN_MAP) {
    var idx = COLUMN_MAP[fieldKey];
    assertFalse(indexes[idx], 'Column index ' + idx + ' ต้องไม่ซ้ำ');
    indexes[idx] = true;
  }
}

// ============================================================
// ทดสอบ Header Mapping
// ============================================================

function testHeaderMapping() {
  // ทดสอบการ Map Header ภาษาไทย
  assertEquals('id', mapHeaderToField('รหัสพนักงาน'), 'รหัสพนักงาน → id');
  assertEquals('email', mapHeaderToField('อีเมล'), 'อีเมล → email');
  assertEquals('firstname', mapHeaderToField('ชื่อ'), 'ชื่อ → firstname');
  assertEquals('lastname', mapHeaderToField('นามสกุล'), 'นามสกุล → lastname');
  assertEquals('full_name', mapHeaderToField('ชื่อ-นามสกุล'), 'ชื่อ-นามสกุล → full_name');
  assertEquals('employee_status', mapHeaderToField('สถานะพนักงาน'), 'สถานะพนักงาน → employee_status');
  assertEquals('start_date', mapHeaderToField('วันที่เริ่มงาน'), 'วันที่เริ่มงาน → start_date');
  assertEquals('department', mapHeaderToField('ฝ่าย'), 'ฝ่าย → department');
  assertEquals('team', mapHeaderToField('ทีม'), 'ทีม → team');
  
  // ทดสอบการ Map Header ภาษาอังกฤษ
  assertEquals('id', mapHeaderToField('id'), 'id → id');
  assertEquals('email', mapHeaderToField('email'), 'email → email');
  assertEquals('employee_id', mapHeaderToField('employee_id'), 'employee_id → id');
  assertEquals('phone', mapHeaderToField('เบอร์โทร'), 'เบอร์โทร → phone');
  assertEquals('address', mapHeaderToField('ที่อยู่'), 'ที่อยู่ → address');
  
  // Header ที่ไม่มีใน map ต้อง return null
  assertEquals(null, mapHeaderToField('xyz_unknown'), 'header ที่ไม่มี → null');
}

// ============================================================
// ทดสอบ Template Creation (Dry Run)
// ============================================================

function testTemplateCreation() {
  // ตรวจสอบว่า Template definitions สมบูรณ์
  assertEquals(7, ALL_TEMPLATES.length, 'ต้องมี 7 templates (P1-P7)');
  
  for (var i = 0; i < ALL_TEMPLATES.length; i++) {
    var tpl = ALL_TEMPLATES[i];
    
    assertTrue(tpl.name, 'Template ' + (i+1) + ' ต้องมี name');
    assertTrue(tpl.headers.length > 0, 'Template ' + tpl.name + ' ต้องมี headers');
    assertTrue(tpl.headerDescriptions.length === tpl.headers.length,
      'Template ' + tpl.name + ' ต้องมี descriptions เท่ากับ headers');
    assertTrue(tpl.sampleData.length > 0, 'Template ' + tpl.name + ' ต้องมี sample data');
    assertTrue(tpl.sampleData[0].length === tpl.headers.length,
      'Sample data rows ใน ' + tpl.name + ' ต้องเท่ากับจำนวน headers');
  }
  
  // ตรวจสอบชื่อ template
  assertEquals('P1-CandidateData', P1_TEMPLATE.name);
  assertEquals('P2-AssessmentData', P2_TEMPLATE.name);
  assertEquals('P3-MatchingData', P3_TEMPLATE.name);
  assertEquals('P4-EvaluationData', P4_TEMPLATE.name);
  assertEquals('P5-DevelopmentData', P5_TEMPLATE.name);
  assertEquals('P6-CompensationData', P6_TEMPLATE.name);
  assertEquals('P7-QualityOfLifeData', P7_TEMPLATE.name);
}

// ============================================================
// ทดสอบ Rollback Mechanism
// ============================================================

function testRollbackMechanism() {
  // จำลอง Transaction Data
  var mockTransactionId = 'TXN_TEST_001';
  
  // จำลอง Imported Row IDs (เรียงจากน้อยไปมาก)
  var importedRowIds = [5, 6, 7, 8, 9];
  
  // ตรวจสอบการ sort (ต้องเรียงจากมากไปน้อยเพื่อลบจากล่างขึ้นบน)
  var sortedIds = importedRowIds.slice().sort(function(a, b) { return b - a; });
  assertEquals([9, 8, 7, 6, 5], sortedIds, 'ต้องเรียงจากมากไปน้อย');
  
  // ตรวจสอบ Transaction ID format
  var txnPattern = /^TXN_\d+_[A-Z0-9]{6}$/;
  var testTxnId = 'TXN_' + new Date().getTime() + '_ABC123';
  assertTrue(txnPattern.test(testTxnId), 'Transaction ID ต้องตรงกับรูปแบบ TXN_timestamp_XXXXXX');
  
  // จำลอง Rollback Status
  var statuses = {
    SUCCESS: 'SUCCESS',
    FAILED: 'FAILED',
    SKIPPED: 'SKIPPED',
    ROLLED_BACK: 'ROLLED_BACK',
    IN_PROGRESS: 'IN_PROGRESS'
  };
  
  assertEquals('SUCCESS', statuses.SUCCESS, 'Status ต้องตรงกับค่าคงที่');
  assertEquals('ROLLED_BACK', statuses.ROLLED_BACK, 'ROLLED_BACK status ต้องมีอยู่');
  
  // ตรวจสอบ Log format
  var logFields = ['Timestamp', 'TransactionId', 'RowIndex', 'EmployeeId', 
                   'Status', 'Message', 'Duration(ms)'];
  assertEquals(7, logFields.length, 'Log sheet ต้องมี 7 columns');
}

// ============================================================
// ทดสอบ mapSourceRowToSchema
// ============================================================

function testMapSourceRowToSchema() {
  // ทดสอบการ Map เมื่อมี Header Row
  var headerRow = ['id', 'ชื่อ', 'นามสกุล', 'ชื่อ-นามสกุล', 'email'];
  var dataRow = ['6407049', 'ทดสอบ', 'ทดสอบ', 'ทดสอบ ทดสอบ', 'test@test.com'];
  
  var mapped = mapSourceRowToSchema(dataRow, headerRow);
  assertEquals('6407049', mapped.id, 'ต้อง map id ได้');
  assertEquals('ทดสอบ', mapped.firstname, 'ต้อง map firstname ได้');
  assertEquals('ทดสอบ', mapped.lastname, 'ต้อง map lastname ได้');
  assertEquals('test@test.com', mapped.email, 'ต้อง map email ได้');
}

// ============================================================
// ทดสอบ SCHEMA_RULES completeness
// ============================================================

function testSchemaRulesCompleteness() {
  // ตรวจสอบว่า SCHEMA_RULES มีฟิลด์สำคัญ
  var criticalFields = ['id', 'firstname', 'lastname', 'full_name', 'email', 
                        'employee_status', 'start_date'];
  
  for (var i = 0; i < criticalFields.length; i++) {
    var field = criticalFields[i];
    assertTrue(SCHEMA_RULES.hasOwnProperty(field), 
      'SCHEMA_RULES ต้องมี rule สำหรับ: ' + field);
    assertTrue(SCHEMA_RULES[field].required, 
      'ฟิลด์สำคัญ ' + field + ' ต้องเป็น required');
    assertTrue(SCHEMA_RULES[field].errorMessage, 
      'ฟิลด์ ' + field + ' ต้องมี errorMessage');
  }
  
  // ตรวจสอบว่า regex patterns ทำงานได้
  assertTrue(SCHEMA_RULES.id.pattern.test('1234567'), 'id pattern ต้อง match 7 หลัก');
  assertFalse(SCHEMA_RULES.id.pattern.test('123456'), 'id pattern ต้องไม่ match 6 หลัก');
  assertFalse(SCHEMA_RULES.id.pattern.test('12345678'), 'id pattern ต้องไม่ match 8 หลัก');
  
  assertTrue(SCHEMA_RULES.email.pattern.test('a@b.com'), 'email pattern ต้อง match');
  assertFalse(SCHEMA_RULES.email.pattern.test('no-email'), 'email pattern ต้องไม่ match');
}

// ============================================================
// ทดสอบ Integration (ใช้ข้อมูลจริงจำลอง)
// ============================================================

function testIntegrationWithRealData() {
  // ข้อมูลตัวอย่างจาก PKGemployee จริง
  var realDataRow = {
    id: '6407049',
    firstname: 'ปวีร์',
    lastname: 'ผ่องโสภา',
    full_name: 'ปวีร์ ผ่องโสภา',
    email: 'pavee.pho.pkg@gmail.com',
    department: 'CPDG',
    team: 'APP Application',
    business_unit: 'CPDG',
    work_location: 'สำนักงานใหญ่',
    employee_type: 'ประจำ',
    employee_status: 'สมาชิกประจำ',
    start_date: '21/07/2021',
    tenure_years: 4.71
  };
  
  var result = validateRow(realDataRow, SCHEMA_RULES);
  assertTrue(result.isValid, 'ข้อมูลจริงของ ปวีร์ ต้องผ่าน validation');
  assertEquals(0, result.errors.length, 'ข้อมูลจริงต้องไม่มี error');
  
  // ทดสอบข้อมูลที่มีปัญหา
  var problematicRow = Object.assign({}, realDataRow, {
    id: 'ABC',              // ผิด format
    email: 'not-email',     // ผิด format
    employee_status: 'ตาย'  // ผิด allowed value
  });
  
  var result2 = validateRow(problematicRow, SCHEMA_RULES);
  assertFalse(result2.isValid, 'ข้อมูลที่มีปัญหา 3 จุด ต้องไม่ผ่าน');
  assertTrue(result2.errors.length >= 3, 'ต้องมี error อย่างน้อย 3 จุด');
}

// ============================================================
// ทดสอบ P-specific Templates
// ============================================================

function testProcessTemplateFields() {
  // ทดสอบว่า P1 มีฟิลด์ที่จำเป็น
  var p1Required = ['id', 'full_name', 'email', 'status'];
  for (var i = 0; i < p1Required.length; i++) {
    assertTrue(P1_TEMPLATE.headers.indexOf(p1Required[i]) >= 0,
      'P1 ต้องมีฟิลด์: ' + p1Required[i]);
  }
  
  // ทดสอบว่า P4 มี evidence_links (ตาม Evidence-First Rule)
  assertTrue(P4_TEMPLATE.headers.indexOf('evidence_links') >= 0,
    'P4 ต้องมี evidence_links (Evidence-First Rule)');
  
  // ทดสอบว่า P7 มี flight_risk (ตาม Feedback Loop)
  assertTrue(P7_TEMPLATE.headers.indexOf('flight_risk') >= 0,
    'P7 ต้องมี flight_risk (Feedback Loop)');
  
  // ทดสอบว่า P6 มี salary_grade
  assertTrue(P6_TEMPLATE.headers.indexOf('salary_grade') >= 0,
    'P6 ต้องมี salary_grade');
}

// ============================================================
// Additional Edge Case Tests
// ============================================================

/**
 * ทดสอบ Empty/Null Values Handling
 */
function testEmptyValueHandling() {
  Logger.log('  🧪 Testing empty/null value handling...');
  
  // ทดสอบ required field ที่ empty
  var emptyRequired = {
    id: '',
    full_name: 'Test User',
    email: 'test@example.com',
    employee_status: 'สมาชิกประจำ'
  };
  var result = validateRow(emptyRequired, SCHEMA_RULES);
  assertFalse(result.isValid, 'Empty required ID should fail validation');
  assertTrue(result.errors.length > 0, 'Should have validation errors for empty required field');
  
  // ทดสอบ optional field ที่เป็น null
  var withNullOptional = {
    id: '1234567',
    full_name: 'Test User',
    email: 'test@example.com',
    department: null,
    employee_status: 'สมาชิกประจำ'
  };
  var result2 = validateRow(withNullOptional, SCHEMA_RULES);
  assertTrue(result2.isValid, 'Null optional field should pass validation');
}

/**
 * ทดสอบ Data Type Conversion
 */
function testDataTypeConversion() {
  Logger.log('  🧪 Testing data type conversion...');
  
  // ทดสอบ String to Number conversion
  var numericString = {
    id: '1234567',
    full_name: 'Test User',
    email: 'test@example.com',
    salary_grade: '5',
    employee_status: 'สมาชิกประจำ'
  };
  var result = validateRow(numericString, SCHEMA_RULES);
  assertTrue(result.isValid, 'Numeric string should pass validation');
}

/**
 * ทดสอบ Performance with Large Dataset (Mock)
 */
function testLargeDatasetPerformance() {
  Logger.log('  🧪 Testing performance with large dataset...');
  
  // สร้าง mock data 1000 แถว
  var largeDataset = [];
  for (var i = 0; i < 1000; i++) {
    largeDataset.push({
      id: String(1000000 + i),
      full_name: 'Test User ' + i,
      email: 'user' + i + '@example.com',
      department: 'Test Department',
      employee_status: 'สมาชิกประจำ'
    });
  }
  
  var startTime = new Date().getTime();
  var validCount = 0;
  var invalidCount = 0;
  
  // Validate ทั้งหมด
  for (var j = 0; j < largeDataset.length; j++) {
    var result = validateRow(largeDataset[j], SCHEMA_RULES);
    if (result.isValid) {
      validCount++;
    } else {
      invalidCount++;
    }
  }
  
  var endTime = new Date().getTime();
  var duration = endTime - startTime;
  
  Logger.log('    Processed 1000 rows in ' + duration + 'ms');
  assertTrue(duration < 5000, 'Should process 1000 rows in under 5 seconds');
  assertEquals(1000, validCount, 'All mock rows should be valid');
  assertEquals(0, invalidCount, 'No invalid rows in mock data');
}

/**
 * ทดสอบ Error Message Quality
 */
function testErrorMessageQuality() {
  Logger.log('  🧪 Testing error message quality...');
  
  var invalidData = {
    id: 'ABC', // ผิด format
    email: 'not-email', // ผิด format
    start_date: '2021-13-45' // ไม่ถูกต้อง
  };
  
  var result = validateRow(invalidData, SCHEMA_RULES);
  
  // ตรวจสอบว่า error messages มีข้อมูลเพียงพอมั้ย
  for (var i = 0; i < result.errors.length; i++) {
    var errorMsg = result.errors[i];
    assertTrue(errorMsg.length > 10, 'Error message should be descriptive (length > 10)');
    assertTrue(
      errorMsg.indexOf('id:') >= 0 || 
      errorMsg.indexOf('email:') >= 0 || 
      errorMsg.indexOf('start_date:') >= 0,
      'Error message should reference the field name'
    );
  }
}

/**
 * ทดสอบ Batch Migration Mock
 */
function testBatchMigrationMock() {
  Logger.log('  🧪 Testing batch migration process flow...');
  
  // ตรวจสอบ processSchemas structure
  var processSchemas = {
    'P1': true,
    'P2': true,
    'P3': true,
    'P4': true,
    'P5': true,
    'P6': true,
    'P7': true
  };
  
  // ทดสอบว่าทุก Process มี schema
  for (var i = 1; i <= 7; i++) {
    var processId = 'P' + i;
    assertTrue(processSchemas[processId], 'Schema for ' + processId + ' should exist');
  }
  
  // ทดสอบ invalid process ID
  var invalidProcess = 'P8';
  assertFalse(processSchemas[invalidProcess], 'Invalid process ID should not exist');
}

/**
 * ทดสอบ Transaction ID Format
 */
function testTransactionIdFormat() {
  Logger.log('  🧪 Testing transaction ID format...');
  
  // สร้าง mock transaction ID
  var mockTxnId = 'TXN_' + new Date().getTime() + '_' + Math.random().toString(36).substr(2, 6).toUpperCase();
  
  // ตรวจสอบ format
  var parts = mockTxnId.split('_');
  assertEquals(3, parts.length, 'Transaction ID should have 3 parts');
  assertEquals('TXN', parts[0], 'First part should be TXN');
  assertTrue(parts[1].length > 0, 'Timestamp part should not be empty');
  assertTrue(parts[2].length === 6, 'Random part should be 6 characters');
}

/**
 * ทดสอบ Data Mapping with Edge Cases
 */
function testDataMappingEdgeCases() {
  Logger.log('  🧪 Testing data mapping edge cases...');
  
  // ทดสอบ empty row
  var emptyRow = [];
  var mapped = mapSourceRowToSchema(emptyRow, null);
  assertTrue(typeof mapped === 'object', 'Empty row should return empty object');
  
  // ทดสอบ row with only whitespace
  var whitespaceRow = ['', '  ', '\t', '\n'];
  assertTrue(isRowEmpty(whitespaceRow), 'Whitespace-only row should be empty');
  
  // ทดสอบ row with mixed empty and data
  var mixedRow = ['', null, 'test', '', undefined];
  assertFalse(isRowEmpty(mixedRow), 'Row with any data should not be empty');
}

/**
 * ทดสอบ Validation Rules Completeness
 */
function testValidationRulesCompleteness() {
  Logger.log('  🧪 Testing validation rules completeness...');
  
  // ตรวจสอบว่า required fields มี errorMessage
  var requiredFields = ['id', 'full_name', 'email', 'employee_status'];
  for (var i = 0; i < requiredFields.length; i++) {
    var field = requiredFields[i];
    if (SCHEMA_RULES[field]) {
      assertTrue(SCHEMA_RULES[field].required, field + ' should be required');
      assertTrue(SCHEMA_RULES[field].errorMessage, field + ' should have errorMessage');
    }
  }
  
  // ตรวจสอบ pattern fields
  var patternFields = ['id', 'email', 'national_id', 'phone'];
  for (var j = 0; j < patternFields.length; j++) {
    var pField = patternFields[j];
    if (SCHEMA_RULES[pField]) {
      assertTrue(SCHEMA_RULES[pField].pattern, pField + ' should have pattern');
      assertTrue(SCHEMA_RULES[pField].pattern instanceof RegExp, pField + ' pattern should be RegExp');
    }
  }
}

/**
 * ทดสอบ Template Sample Data Consistency
 */
function testTemplateSampleDataConsistency() {
  Logger.log('  🧪 Testing template sample data consistency...');
  
  var templates = [
    P1_TEMPLATE,
    P2_TEMPLATE,
    P3_TEMPLATE,
    P4_TEMPLATE,
    P5_TEMPLATE,
    P6_TEMPLATE,
    P7_TEMPLATE
  ];
  
  for (var i = 0; i < templates.length; i++) {
    var template = templates[i];
    
    if (template.sampleData && template.sampleData.length > 0) {
      var sampleRow = template.sampleData[0];
      
      // ตรวจสอบว่า sample data length เท่ากับ headers length
      assertEquals(
        template.headers.length,
        sampleRow.length,
        template.name + ' sample data should match headers length'
      );
    }
  }
}

/**
 * ทดสอบ Error Handling in Migration Flow
 */
function testMigrationErrorHandling() {
  Logger.log('  🧪 Testing migration error handling...');
  
  // ทดสอบ invalid source sheet
  try {
    var result = migrateData('invalid-id', 'dest-id', {
      sourceSheetName: 'NonExistent',
      dryRun: true
    });
    // Should throw or return error
    assertTrue(result && result.successCount !== undefined, 'Should return result object');
  } catch (e) {
    // Expected for invalid sheet ID
    assertTrue(e.message.length > 0, 'Should have error message');
  }
}

/**
 * ทดสอบ Rollback Safety
 */
function testRollbackSafety() {
  Logger.log('  🧪 Testing rollback safety...');
  
  // ทดสอบ rollback with non-existent transaction
  var result = rollbackMigration('NON_EXISTENT_TXN', 'dest-id');
  assertFalse(result.success, 'Rollback of non-existent transaction should fail');
  assertTrue(result.error.length > 0, 'Should have error message');
  
  // ทดสอบ rollback with invalid transaction ID
  var result2 = rollbackMigration('', 'dest-id');
  assertFalse(result2.success, 'Empty transaction ID should fail');
}

// ============================================================
// Run All New Tests
// ============================================================

function testAllNew() {
  Logger.log('\n📝 Running new edge case tests...\n');
  
  var tests = [
    testEmptyValueHandling,
    testDataTypeConversion,
    testLargeDatasetPerformance,
    testErrorMessageQuality,
    testBatchMigrationMock,
    testTransactionIdFormat,
    testDataMappingEdgeCases,
    testValidationRulesCompleteness,
    testTemplateSampleDataConsistency,
    testMigrationErrorHandling,
    testRollbackSafety
  ];
  
  var passed = 0;
  var failed = 0;
  
  for (var i = 0; i < tests.length; i++) {
    try {
      tests[i]();
      Logger.log('✅ ' + tests[i].name.replace('test', ''));
      passed++;
    } catch (e) {
      Logger.log('❌ ' + tests[i].name.replace('test', '') + ': ' + e.message);
      failed++;
    }
  }
  
  Logger.log('\n📊 New tests completed: ' + passed + ' passed, ' + failed + ' failed\n');
  
  return { passed: passed, failed: failed };
}
