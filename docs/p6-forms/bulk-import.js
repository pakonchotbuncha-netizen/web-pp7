// ====== Bulk Import System for INC & Members ======
// Web PP7 - ระบบนำเข้าข้อมูลจาก Google Sheets (CSV)

const BULK_IMPORT_CONFIG = {
  // Column Mapping สำหรับ INC CSV
  inc_columns: {
    'member_id': { required: true, name: 'รหัสสมาชิก' },
    'name': { required: false, name: 'ชื่อสมาชิก' },
    'inc_type': { required: true, name: 'ประเภท INC' },
    'amount': { required: true, name: 'จำนวนเงิน (บาท)' },
    'month': { required: true, name: 'เดือน (YYYY-MM)' },
    'bu_code': { required: false, name: 'BU Code' },
    'remark': { required: false, name: 'หมายเหตุ' }
  },
  // Column Mapping สำหรับ Members CSV
  member_columns: {
    'name': { required: true, name: 'ชื่อ-นามสกุล' },
    'phone': { required: false, name: 'เบอร์โทร' },
    'company': { required: true, name: 'บริษัท' },
    'branch': { required: true, name: 'สาขา' },
    'department': { required: true, name: 'ฝ่าย' },
    'team': { required: false, name: 'ทีม' },
    'position': { required: true, name: 'ตำแหน่ง' },
    'salary': { required: true, name: 'เงินเดือน' },
    'start_date': { required: true, name: 'วันเริ่มงาน (YYYY-MM-DD)' },
    'mentor_1': { required: false, name: 'พี่เลี้ยงสายงาน 1' },
    'mentor_2': { required: false, name: 'พี่เลี้ยงสายงาน 2' },
    'mentor_corp': { required: false, name: 'พี่เลี้ยงทุนองค์กร' }
  },
  // INC Types (ต้องตรงกับ payroll.js)
  inc_types: ['sales', 'kpi', 'project', 'attendance', 'referral', 'innovation', 'customer_service', 'other']
};

// ============ CSV Parser ============
function parseCSV(csvText) {
  const lines = csvText.split(/\r?\n/).filter(l => l.trim());
  if (lines.length === 0) return { headers: [], rows: [] };
  
  // Parse header
  const headers = parseCSVLine(lines[0]).map(h => h.trim().toLowerCase());
  
  // Parse data rows
  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    if (values.length === 0 || values.every(v => !v)) continue; // skip empty rows
    
    const row = {};
    headers.forEach((h, idx) => {
      row[h] = (values[idx] || '').trim();
    });
    rows.push(row);
  }
  
  return { headers, rows };
}

function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i+1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current);
  return result;
}

// ============ INC Bulk Import ============
function validateINCRows(rows) {
  const columns = BULK_IMPORT_CONFIG.inc_columns;
  const types = BULK_IMPORT_CONFIG.inc_types;
  const errors = [];
  const validRows = [];
  const members = typeof PayrollSystem !== 'undefined' ? PayrollSystem.getP3Members() : [];
  
  rows.forEach((row, idx) => {
    const rowNum = idx + 2; // +2 เพราะ header = row 1, data เริ่ม row 2
    const rowErrors = [];
    
    // Check required fields
    Object.keys(columns).forEach(key => {
      const col = columns[key];
      if (col.required && !row[key]) {
        rowErrors.push(`❌ ขาด ${col.name}`);
      }
    });
    
    // Validate amount
    const amount = parseFloat(row.amount);
    if (isNaN(amount) || amount <= 0) {
      rowErrors.push(`❌ จำนวนเงินไม่ถูกต้อง`);
    }
    
    // Validate month format
    if (row.month && !/^\d{4}-\d{2}$/.test(row.month)) {
      rowErrors.push(`❌ รูปแบบเดือนไม่ถูกต้อง (ควรเป็น YYYY-MM)`);
    }
    
    // Validate INC type
    if (row.inc_type && !types.includes(row.inc_type.toLowerCase())) {
      rowErrors.push(`❌ ประเภท INC ไม่ถูกต้อง`);
    }
    
    // Check member exists
    if (row.member_id) {
      const member = members.find(m => m.member_id === row.member_id);
      if (!member) {
        rowErrors.push(`⚠️ ไม่พบสมาชิก ${row.member_id} ใน P3`);
      } else {
        row._member = member;
      }
    }
    
    if (rowErrors.length > 0) {
      errors.push({ row: rowNum, row_id: row.member_id || '?', errors: rowErrors });
    } else {
      validRows.push({
        ...row,
        _rowNum: rowNum,
        _member: members.find(m => m.member_id === row.member_id),
        amount_num: amount,
        inc_type_lower: row.inc_type.toLowerCase()
      });
    }
  });
  
  return { validRows, errors, total: rows.length };
}

function importINCFromCSV(csvText, options = {}) {
  const { headers, rows } = parseCSV(csvText);
  const validation = validateINCRows(rows);
  
  const month = options.month || new Date().toISOString().slice(0, 7);
  const buCode = options.buCode || 'BULK';
  const points_rate = PayrollSystem?.incConfig?.cash_to_points_rate || 10;
  
  let imported = 0;
  let totalCash = 0;
  let totalPoints = 0;
  
  validation.validRows.forEach(row => {
    const record = PayrollSystem.saveIncentivePoints(
      row.member_id,
      row.month || month,
      row.amount_num,
      row.inc_type_lower,
      row.remark,
      row.bu_code || buCode
    );
    imported++;
    totalCash += row.amount_num;
    totalPoints += record.points;
  });
  
  return {
    success: imported,
    failed: validation.errors.length,
    total_rows: validation.total,
    total_cash: totalCash,
    total_points: totalPoints,
    errors: validation.errors
  };
}

// ============ Members Bulk Import ============
function validateMemberRows(rows) {
  const columns = BULK_IMPORT_CONFIG.member_columns;
  const errors = [];
  const validRows = [];
  
  rows.forEach((row, idx) => {
    const rowNum = idx + 2;
    const rowErrors = [];
    
    // Check required fields
    Object.keys(columns).forEach(key => {
      const col = columns[key];
      if (col.required && !row[key]) {
        rowErrors.push(`❌ ขาด ${col.name}`);
      }
    });
    
    // Validate salary
    const salary = parseFloat(row.salary);
    if (isNaN(salary) || salary < 0) {
      rowErrors.push(`❌ เงินเดือนไม่ถูกต้อง`);
    }
    
    // Validate start_date
    if (row.start_date && !/^\d{4}-\d{2}-\d{2}$/.test(row.start_date)) {
      rowErrors.push(`❌ รูปแบบวันที่ไม่ถูกต้อง (YYYY-MM-DD)`);
    }
    
    if (rowErrors.length > 0) {
      errors.push({ row: rowNum, errors: rowErrors });
    } else {
      validRows.push({ ...row, _rowNum: rowNum, salary_num: salary });
    }
  });
  
  return { validRows, errors, total: rows.length };
}

function importMembersFromCSV(csvText) {
  const { rows } = parseCSV(csvText);
  const validation = validateMemberRows(rows);
  
  let imported = 0;
  
  validation.validRows.forEach(row => {
    const newMember = {
      personal: {
        name: row.name,
        phone: row.phone,
        age: 0
      },
      organization: {
        company: row.company,
        branch_code: row.branch,
        department: row.department,
        team: row.team,
        position: row.position
      },
      compensation: {
        salary_confirmed: row.salary_num,
        salary_probation: row.salary_num
      },
      mentors: {
        line_mentor_1: row.mentor_1 || '',
        line_mentor_2: row.mentor_2 || '',
        corp_mentor: row.mentor_corp || ''
      },
      employment: {
        start_date: row.start_date,
        status: 'probation'
      },
      // P2 data (placeholder)
      p2_evaluation: {
        interview_date: new Date().toISOString(),
        form_type: 'form1',
        tcc_score: 0,
        tcc_result: 'bulk_import'
      }
    };
    
    MemberDB.addMemberFromP2(newMember);
    imported++;
  });
  
  return {
    success: imported,
    failed: validation.errors.length,
    total_rows: validation.total,
    errors: validation.errors
  };
}

// ============ Template Generators ============
function generateINCTemplateCSV() {
  const headers = ['member_id', 'name', 'inc_type', 'amount', 'month', 'bu_code', 'remark'];
  const sample = [
    ['PKG0001', 'สมชาย ใจดี', 'sales', '5000', '2026-06', 'BU-SALES-01', 'ยอดขาย มิ.ย.'],
    ['PKG0002', 'สมหญิง รักดี', 'kpi', '3000', '2026-06', 'BU-MKT-01', 'KPI Q2'],
    ['PKG0003', 'วิชัย สุขสันต์', 'project', '10000', '2026-06', 'BU-TECH-01', 'โบนัสโปรเจค X']
  ];
  return [headers.join(','), ...sample.map(r => r.join(','))].join('\n');
}

function generateMembersTemplateCSV() {
  const headers = ['name', 'phone', 'company', 'branch', 'department', 'team', 'position', 'salary', 'start_date', 'mentor_1', 'mentor_2', 'mentor_corp'];
  const sample = [
    ['สมชาย ใจดี', '0812345678', 'PKG', 'BKK-01', 'Sales', 'Team A', 'Sales Exec', '25000', '2026-06-01', 'PKG-A1', 'PKG-A2', 'PKG-CORP-01']
  ];
  return [headers.join(','), ...sample.map(r => r.join(','))].join('\n');
}

// ============ Export ============
window.BulkImport = {
  config: BULK_IMPORT_CONFIG,
  parseCSV,
  validateINCRows,
  importINCFromCSV,
  validateMemberRows,
  importMembersFromCSV,
  generateINCTemplateCSV,
  generateMembersTemplateCSV
};
