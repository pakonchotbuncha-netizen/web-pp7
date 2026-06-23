// ====== Robust Validation & Auto-Detection System ======
// Web PP7 - ระบบตรวจสอบข้อมูลอัตโนมัติ พร้อม Error Messages ชัดเจน
// รองรับ Google Sheets Export, CSV Upload, Auto-detect format

// ============ Schema Definition ============
const VALIDATION_SCHEMA = {
  // INC Import Schema
  inc: {
    name: 'Incentive (แรงจูงใจ)',
    columns: {
      member_id: {
        required: true,
        label: 'รหัสสมาชิก',
        aliases: ['รหัส', 'id', 'member_id', 'memberid', 'รหัสสมาชิก', 'staff_id', 'employee_id'],
        type: 'string',
        pattern: /^PKG\d{3,}$/i,
        patternError: 'รหัสสมาชิกต้องขึ้นต้นด้วย PKG ตามด้วยตัวเลข 3-4 หลัก (เช่น PKG001, PKG1234)',
        example: 'PKG001'
      },
      name: {
        required: false,
        label: 'ชื่อสมาชิก',
        aliases: ['ชื่อ', 'name', 'ชื่อ-นามสกุล', 'fullname'],
        type: 'string',
        minLength: 2,
        minLengthError: 'ชื่อต้องมีอย่างน้อย 2 ตัวอักษร',
        example: 'สมชาย ใจดี'
      },
      inc_type: {
        required: true,
        label: 'ประเภท INC',
        aliases: ['ประเภท', 'type', 'inc_type', 'inctype', 'ประเภทแรงจูงใจ'],
        type: 'enum',
        enum: ['sales', 'kpi', 'project', 'attendance', 'referral', 'innovation', 'customer_service', 'other'],
        enumLabels: {
          sales: 'ยอดขาย (Sales)',
          kpi: 'ตัวชี้วัด (KPI)',
          project: 'โบนัสโปรเจค',
          attendance: 'เบี้ยขยัน',
          referral: 'แนะนำคน',
          innovation: 'นวัตกรรม',
          customer_service: 'บริการลูกค้า',
          other: 'อื่นๆ'
        },
        enumError: 'ประเภท INC ต้องเป็น: sales, kpi, project, attendance, referral, innovation, customer_service, other'
      },
      amount: {
        required: true,
        label: 'จำนวนเงิน (บาท)',
        aliases: ['จำนวนเงิน', 'amount', 'เงิน', 'money', 'cash', 'บาท', 'salary_amount'],
        type: 'number',
        min: 1,
        max: 500000,
        minError: 'จำนวนเงินต้องมากกว่า 0 บาท',
        maxError: 'จำนวนเงินเกิน 500,000 บาท (ตรวจสอบความถูกต้อง)',
        warnThreshold: 100000,
        warnMessage: 'จำนวนเงินมากกว่า 100,000 บาท — ตรวจสอบว่าถูกต้อง'
      },
      month: {
        required: true,
        label: 'เดือน',
        aliases: ['เดือน', 'month', 'period', 'เดือนที่', 'date', 'วันที่'],
        type: 'date_month',
        formats: ['YYYY-MM', 'MM/YYYY', 'MM-YYYY', 'YYYY/MM'],
        monthError: 'รูปแบบเดือนไม่ถูกต้อง ควรเป็น YYYY-MM (เช่น 2026-06)',
        rangeError: 'เดือนต้องอยู่ในช่วง 12 เดือนที่ผ่านมา ถึง 3 เดือนข้างหน้า'
      },
      bu_code: {
        required: false,
        label: 'BU Code',
        aliases: ['bu', 'bu_code', 'bucode', 'หน่วยงาน', 'unit', 'department_code'],
        type: 'string',
        pattern: /^[A-Z0-9\-_]{2,20}$/i,
        patternError: 'BU Code ต้องเป็นตัวอักษร/ตัวเลข และมีความยาว 2-20 ตัวอักษร',
        example: 'BU-SALES-01'
      },
      remark: {
        required: false,
        label: 'หมายเหตุ',
        aliases: ['remark', 'หมายเหตุ', 'note', 'comment', 'คำอธิบาย', 'description'],
        type: 'string',
        maxLength: 500,
        maxLengthError: 'หมายเหตุต้องไม่เกิน 500 ตัวอักษร'
      }
    }
  },
  
  // Members Import Schema
  members: {
    name: 'สมาชิกใหม่ (Members)',
    columns: {
      name: {
        required: true,
        label: 'ชื่อ-นามสกุล',
        aliases: ['ชื่อ', 'name', 'ชื่อ-นามสกุล', 'fullname', 'full_name'],
        type: 'string',
        minLength: 2,
        minLengthError: 'ชื่อต้องมีอย่างน้อย 2 ตัวอักษร'
      },
      phone: {
        required: false,
        label: 'เบอร์โทร',
        aliases: ['เบอร์โทร', 'โทรศัพท์', 'phone', 'mobile', 'tel', 'เบอร์'],
        type: 'phone',
        phoneError: 'เบอร์โทรต้องเป็นตัวเลข 9-10 หลัก (เช่น 0812345678)'
      },
      company: {
        required: true,
        label: 'บริษัท',
        aliases: ['บริษัท', 'company', 'corp', 'บจก', 'บจ'],
        type: 'string'
      },
      branch: {
        required: true,
        label: 'สาขา',
        aliases: ['สาขา', 'branch', 'branch_code', 'site'],
        type: 'string',
        pattern: /^[A-Z0-9\-_]{2,20}$/i,
        patternError: 'รหัสสาขาต้องเป็นตัวอักษร/ตัวเลข (เช่น BKK-01)'
      },
      department: {
        required: true,
        label: 'ฝ่าย',
        aliases: ['ฝ่าย', 'department', 'dept', 'แผนก'],
        type: 'string'
      },
      team: {
        required: false,
        label: 'ทีม',
        aliases: ['ทีม', 'team', 'กลุ่ม'],
        type: 'string'
      },
      position: {
        required: true,
        label: 'ตำแหน่ง',
        aliases: ['ตำแหน่ง', 'position', 'title', 'job_title'],
        type: 'string'
      },
      salary: {
        required: true,
        label: 'เงินเดือน',
        aliases: ['เงินเดือน', 'salary', 'base_pay', 'base_salary', 'wage'],
        type: 'number',
        min: 1,
        max: 500000,
        minError: 'เงินเดือนต้องมากกว่า 0 บาท',
        maxError: 'เงินเดือนเกิน 500,000 บาท (ตรวจสอบความถูกต้อง)',
        warnThreshold: 200000,
        warnMessage: 'เงินเดือนมากกว่า 200,000 บาท — ตรวจสอบว่าถูกต้อง'
      },
      start_date: {
        required: true,
        label: 'วันเริ่มงาน',
        aliases: ['วันเริ่มงาน', 'start_date', 'startdate', 'hire_date', 'joining_date', 'เริ่มงาน'],
        type: 'date',
        formats: ['YYYY-MM-DD', 'DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY/MM/DD'],
        dateError: 'รูปแบบวันที่ไม่ถูกต้อง (ควรเป็น YYYY-MM-DD เช่น 2026-06-01)',
        rangeError: 'วันเริ่มงานต้องอยู่ในช่วง 5 ปีที่ผ่านมา ถึง 3 เดือนข้างหน้า'
      },
      mentor_1: {
        required: false,
        label: 'พี่เลี้ยงสายงาน 1',
        aliases: ['mentor_1', 'mentor1', 'พี่เลี้ยง 1', 'line_mentor_1'],
        type: 'string'
      },
      mentor_2: {
        required: false,
        label: 'พี่เลี้ยงสายงาน 2',
        aliases: ['mentor_2', 'mentor2', 'พี่เลี้ยง 2', 'line_mentor_2'],
        type: 'string'
      },
      mentor_corp: {
        required: false,
        label: 'พี่เลี้ยงทุนองค์กร',
        aliases: ['mentor_corp', 'mentorcorp', 'พี่เลี้ยงทุน', 'corp_mentor'],
        type: 'string'
      }
    }
  }
};

// ============ Column Auto-Detection ============
function detectColumnMapping(headers, schema) {
  const mapping = {};
  const unmapped = [];
  const suggestions = [];
  
  headers.forEach((header, idx) => {
    const cleanHeader = header.trim().toLowerCase();
    let matched = false;
    
    // Try exact match first
    for (const [colName, colDef] of Object.entries(schema.columns)) {
      if (colDef.aliases.some(alias => alias.toLowerCase() === cleanHeader)) {
        mapping[colName] = { headerIndex: idx, headerName: header, confidence: 'exact' };
        matched = true;
        break;
      }
    }
    
    // Try partial/fuzzy match
    if (!matched) {
      for (const [colName, colDef] of Object.entries(schema.columns)) {
        if (colDef.aliases.some(alias => 
          cleanHeader.includes(alias.toLowerCase()) || 
          alias.toLowerCase().includes(cleanHeader)
        )) {
          mapping[colName] = { headerIndex: idx, headerName: header, confidence: 'fuzzy' };
          matched = true;
          break;
        }
      }
    }
    
    // If no match, suggest manual mapping
    if (!matched) {
      unmapped.push({ headerIndex: idx, headerName: header });
      
      // Find best suggestion
      const bestMatch = findBestColumnSuggestion(cleanHeader, schema);
      if (bestMatch) {
        suggestions.push({ unmappedHeader: header, suggestedColumn: bestMatch.colName, suggestedLabel: bestMatch.label });
      }
    }
  });
  
  // Find missing required columns
  const missing = [];
  for (const [colName, colDef] of Object.entries(schema.columns)) {
    if (colDef.required && !mapping[colName]) {
      missing.push({ column: colName, label: colDef.label, example: colDef.example });
    }
  }
  
  return { mapping, unmapped, suggestions, missing };
}

function findBestColumnSuggestion(header, schema) {
  // Simple heuristic: find column whose label/aliases share words with header
  const words = header.split(/[\s_\-\.,]+/).filter(w => w.length > 1);
  let bestMatch = null;
  let bestScore = 0;
  
  for (const [colName, colDef] of Object.entries(schema.columns)) {
    const allTexts = [colDef.label, ...colDef.aliases].map(t => t.toLowerCase());
    let score = 0;
    
    for (const text of allTexts) {
      for (const word of words) {
        if (text.includes(word)) {
          score += word.length;
        }
      }
    }
    
    if (score > bestScore) {
      bestScore = score;
      bestMatch = { colName, label: colDef.label };
    }
  }
  
  return bestMatch;
}

// ============ Data Cleaning & Validation ============
function cleanValue(value, type) {
  if (value === null || value === undefined) return null;
  
  let cleaned = String(value).trim();
  
  // Remove common artifacts
  cleaned = cleaned.replace(/\u200B/g, ''); // zero-width space
  cleaned = cleaned.replace(/\u00A0/g, ' '); // non-breaking space
  
  if (type === 'number' || type === 'phone') {
    // Remove thousand separators (comma, space)
    cleaned = cleaned.replace(/[, ]/g, '');
    // Remove currency symbols
    cleaned = cleaned.replace(/[฿$€£¥]/g, '');
    // Handle Thai number format (๑๒๓)
    cleaned = thaiToArabicNumbers(cleaned);
  }
  
  return cleaned;
}

function thaiToArabicNumbers(str) {
  const thaiNums = '๐๑๒๓๔๕๖๗๘๙';
  const arabicNums = '0123456789';
  return str.replace(/[๐-๙]/g, c => arabicNums[thaiNums.indexOf(c)]);
}

function validateField(value, colDef, columnName) {
  const errors = [];
  const warnings = [];
  
  // Clean value
  const cleaned = cleanValue(value, colDef.type);
  
  // Required check
  if (colDef.required && (!cleaned || cleaned === '')) {
    return {
      valid: false,
      value: null,
      errors: [`❌ ${colDef.label} ไม่สามารถว่างได้`]
    };
  }
  
  // Skip validation if empty and not required
  if (!cleaned || cleaned === '') {
    return { valid: true, value: null, warnings: [] };
  }
  
  // Type validation
  switch (colDef.type) {
    case 'string':
      if (colDef.minLength && cleaned.length < colDef.minLength) {
        errors.push(`❌ ${colDef.label} "${cleaned}" ต้องมีอย่างน้อย ${colDef.minLength} ตัวอักษร`);
      }
      if (colDef.maxLength && cleaned.length > colDef.maxLength) {
        errors.push(colDef.maxLengthError || `❌ ${colDef.label} ต้องไม่เกิน ${colDef.maxLength} ตัวอักษร`);
      }
      if (colDef.pattern && !colDef.pattern.test(cleaned)) {
        errors.push(colDef.patternError || `❌ ${colDef.label} "${cleaned}" ไม่อยู่ในรูปแบบที่ถูกต้อง`);
      }
      return { valid: errors.length === 0, value: cleaned, errors, warnings };
    
    case 'number':
      const num = parseFloat(cleaned);
      if (isNaN(num)) {
        errors.push(`❌ ${colDef.label} "${cleaned}" ไม่ใช่ตัวเลข (ไม่สามารถแปลงเป็นตัวเลขได้)`);
        return { valid: false, value: null, errors };
      }
      if (colDef.min !== undefined && num < colDef.min) {
        errors.push(`❌ ${colDef.label} ${num.toLocaleString()} ต้องมากกว่า ${colDef.min.toLocaleString()}`);
      }
      if (colDef.max !== undefined && num > colDef.max) {
        errors.push(`❌ ${colDef.label} ${num.toLocaleString()} ${colDef.maxError || `เกิน ${colDef.max.toLocaleString()}`}`);
      }
      if (colDef.warnThreshold && num > colDef.warnThreshold) {
        warnings.push(`⚠️ ${colDef.warnMessage}`);
      }
      return { valid: errors.length === 0, value: num, errors, warnings };
    
    case 'enum':
      const lower = cleaned.toLowerCase();
      const matched = colDef.enum.find(e => e === lower);
      if (!matched) {
        const acceptedList = colDef.enum.map(e => {
          const label = colDef.enumLabels?.[e] || e;
          return `"${e}" (${label})`;
        }).join(', ');
        errors.push(`❌ ${colDef.label} "${cleaned}" ไม่ถูกต้อง — ค่าที่ยอมรับ: ${acceptedList}`);
        return { valid: false, value: null, errors };
      }
      return { valid: true, value: matched, errors, warnings };
    
    case 'phone':
      const phoneCleaned = cleaned.replace(/[\s\-\(\)]/g, '');
      if (!/^\d{9,10}$/.test(phoneCleaned)) {
        errors.push(`❌ ${colDef.phoneError || `เบอร์โทร "${cleaned}" ต้องเป็นตัวเลข 9-10 หลัก`}`);
        return { valid: false, value: null, errors };
      }
      return { valid: true, value: phoneCleaned, errors, warnings };
    
    case 'date':
    case 'date_month':
      const parsed = parseDateFlexible(cleaned, colDef.formats || (colDef.type === 'date' ? ['YYYY-MM-DD'] : ['YYYY-MM']));
      if (!parsed) {
        errors.push(`❌ ${colDef.type === 'date' ? colDef.dateError : colDef.monthError} — ค่าที่ใส่: "${cleaned}", ตัวอย่าง: "${colDef.example || (colDef.type === 'date' ? '2026-06-01' : '2026-06')}"`);
        return { valid: false, value: null, errors };
      }
      // Range check
      const now = new Date();
      if (colDef.type === 'date_month') {
        const monthsDiff = (now.getFullYear() - parsed.year) * 12 + (now.getMonth() - parsed.month);
        if (monthsDiff > 12 || monthsDiff < -3) {
          errors.push(`❌ ${colDef.label} ต้องอยู่ในช่วง 12 เดือนที่ผ่านมา ถึง 3 เดือนข้างหน้า — ค่าที่ใส่: ${cleaned}`);
        }
      } else {
        const dateObj = new Date(parsed.year, parsed.month - 1, parsed.day);
        const daysDiff = (now - dateObj) / (1000 * 60 * 60 * 24);
        if (daysDiff > 365 * 5 || daysDiff < -90) {
          errors.push(`❌ ${colDef.label} ต้องอยู่ในช่วง 5 ปีที่ผ่านมา ถึง 3 เดือนข้างหน้า — ค่าที่ใส่: ${cleaned}`);
        }
      }
      const formatted = colDef.type === 'date' ? `${parsed.year}-${String(parsed.month).padStart(2, '0')}-${String(parsed.day).padStart(2, '0')}` : `${parsed.year}-${String(parsed.month).padStart(2, '0')}`;
      return { valid: errors.length === 0, value: formatted, errors, warnings };
  }
  
  return { valid: true, value: cleaned, errors, warnings };
}

// ============ Flexible Date Parser ============
function parseDateFlexible(str, formats) {
  if (!str || typeof str !== 'string') return null;
  const cleaned = str.trim();
  
  // Try YYYY-MM-DD or YYYY-MM
  let match;
  if (match = cleaned.match(/^(\d{4})[\-\/.](\d{1,2})(?:[\-\/.](\d{1,2}))?$/)) {
    const year = parseInt(match[1]);
    const month = parseInt(match[2]);
    const day = match[3] ? parseInt(match[3]) : 1;
    if (month >= 1 && month <= 12 && day >= 1 && day <= 31) {
      return { year, month, day };
    }
  }
  
  // Try DD/MM/YYYY or DD-MM-YYYY
  if (match = cleaned.match(/^(\d{1,2})[\-\/.](\d{1,2})[\-\/.](\d{4})$/)) {
    const part1 = parseInt(match[1]);
    const part2 = parseInt(match[2]);
    const year = parseInt(match[3]);
    
    // Ambiguous: could be DD/MM or MM/DD
    // If part1 > 12, it must be DD
    let day, month;
    if (part1 > 12) {
      day = part1; month = part2;
    } else if (part2 > 12) {
      month = part1; day = part2;
    } else {
      // Ambiguous — prefer DD/MM (Thai format)
      day = part1; month = part2;
    }
    
    if (month >= 1 && month <= 12 && day >= 1 && day <= 31) {
      return { year, month, day };
    }
  }
  
  // Try MM/YYYY
  if (match = cleaned.match(/^(\d{1,2})[\-\/.](\d{4})$/)) {
    const month = parseInt(match[1]);
    const year = parseInt(match[2]);
    if (month >= 1 && month <= 12) {
      return { year, month, day: 1 };
    }
  }
  
  return null;
}

// ============ Row-by-Row Validation ============
function validateRow(row, mapping, schema, rowIndex) {
  const rowErrors = [];
  const rowWarnings = [];
  const cleanedRow = {};
  const rowNum = rowIndex + 2; // +2 เพราะ header = row 1, data เริ่ม row 2 (ใน CSV/Sheets)
  
  for (const [colName, colMap] of Object.entries(mapping)) {
    const value = row[colMap.headerIndex];
    const colDef = schema.columns[colName];
    
    const result = validateField(value, colDef, colName);
    
    if (!result.valid) {
      rowErrors.push({
        column: colMap.headerName,
        field: colName,
        messages: result.errors,
        cellValue: value
      });
    } else {
      cleanedRow[colName] = result.value;
      if (result.warnings && result.warnings.length > 0) {
        rowWarnings.push({
          column: colMap.headerName,
          field: colName,
          messages: result.warnings
        });
      }
    }
  }
  
  return {
    rowNum,
    valid: rowErrors.length === 0,
    cleanedData: cleanedRow,
    errors: rowErrors,
    warnings: rowWarnings
  };
}

// ============ Full Import Validation ============
function validateImport(csvText, schemaName = 'inc') {
  const schema = VALIDATION_SCHEMA[schemaName];
  if (!schema) {
    return { success: false, error: `ไม่พบ schema "${schemaName}"` };
  }
  
  // Step 1: Parse CSV
  const { headers, rows } = parseRobustCSV(csvText);
  
  if (rows.length === 0) {
    return {
      success: false,
      error: 'ไฟล์ CSV ไม่มีข้อมูล (พบเฉพาะ header หรือไฟล์ว่าง)'
    };
  }
  
  // Step 2: Detect column mapping
  const columnDetection = detectColumnMapping(headers, schema);
  
  // Step 3: Validate rows
  const validRows = [];
  const invalidRows = [];
  const warnings = [];
  
  rows.forEach((row, idx) => {
    // Skip completely empty rows
    if (row.every(cell => !cell || !cell.trim())) return;
    
    const result = validateRow(row, columnDetection.mapping, schema, idx);
    
    if (result.valid) {
      validRows.push({
        ...result.cleanedData,
        _rowNum: result.rowNum,
        _original: row
      });
    } else {
      invalidRows.push(result);
    }
    
    if (result.warnings.length > 0) {
      warnings.push({ rowNum: result.rowNum, warnings: result.warnings });
    }
  });
  
  // Step 4: Generate summary
  const summary = {
    success: true,
    schemaName: schema.name,
    totalRows: rows.length,
    emptyRowsSkipped: 0,
    validCount: validRows.length,
    invalidCount: invalidRows.length,
    columnDetection,
    validRows,
    invalidRows,
    warnings,
    canImport: validRows.length > 0 && columnDetection.missing.length === 0,
    fatalErrors: []
  };
  
  // Fatal error: missing required columns
  if (columnDetection.missing.length > 0) {
    summary.fatalErrors.push({
      type: 'missing_columns',
      message: `❌ ไม่พบ columns จำเป็น: ${columnDetection.missing.map(m => `"${m.label}"`).join(', ')}`,
      details: 'กรุณาตรวจสอบว่าไฟล์ CSV มี headers ครบถ้วน',
      missing: columnDetection.missing
    });
    summary.canImport = false;
  }
  
  // Fatal error: file empty or all rows invalid
  if (rows.length === 0) {
    summary.fatalErrors.push({
      type: 'empty_file',
      message: '❌ ไฟล์ไม่มีข้อมูล',
      details: 'กรุณาตรวจสอบว่าไฟล์มีข้อมูลอย่างน้อย 1 แถว'
    });
    summary.canImport = false;
  }
  
  return summary;
}

// ============ Robust CSV Parser ============
function parseRobustCSV(csvText) {
  // Detect encoding issues (BOM)
  if (csvText.charCodeAt(0) === 0xFEFF) {
    csvText = csvText.slice(1);
  }
  
  // Detect delimiter
  const firstLine = csvText.split('\n')[0];
  const commas = (firstLine.match(/,/g) || []).length;
  const tabs = (firstLine.match(/\t/g) || []).length;
  const semicolons = (firstLine.match(/;/g) || []).length;
  
  let delimiter = ',';
  if (tabs > commas && tabs > semicolons) delimiter = '\t';
  else if (semicolons > commas) delimiter = ';';
  
  // Split lines (handle \r\n and \n)
  const lines = csvText.split(/\r?\n/);
  
  if (lines.length === 0) return { headers: [], rows: [] };
  
  // Parse header
  const headers = parseRobustCSVLine(lines[0], delimiter).map(h => h.trim());
  
  // Parse data rows
  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue; // skip empty lines
    
    const values = parseRobustCSVLine(line, delimiter);
    if (values.length === 0 || values.every(v => !v || !v.trim())) continue;
    
    rows.push(values);
  }
  
  return { headers, rows, delimiter };
}

function parseRobustCSVLine(line, delimiter = ',') {
  const result = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        // Escaped quote
        current += '"';
        i++;
      } else {
        // Toggle quotes
        inQuotes = !inQuotes;
      }
    } else if (char === delimiter && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current);
  
  return result;
}

// ============ Error Report Generator ============
function generateValidationReport(validation) {
  const lines = [];
  
  lines.push(`═══ 📊 รายงานผลการตรวจสอบข้อมูล ═══`);
  lines.push(``);
  lines.push(`📋 ประเภท: ${validation.schemaName}`);
  lines.push(`📥 จำนวนแถวทั้งหมด: ${validation.totalRows.toLocaleString()}`);
  lines.push(`✅ ผ่านการตรวจสอบ: ${validation.validCount} แถว`);
  lines.push(`❌ มีข้อผิดพลาด: ${validation.invalidCount} แถว`);
  lines.push(``);
  
  // Column Detection
  const cd = validation.columnDetection;
  if (cd.missing.length > 0) {
    lines.push(`🚨 FATAL: ไม่พบ columns จำเป็น — ไม่สามารถ import ได้!`);
    lines.push(`   Columns ที่ขาด: ${cd.missing.map(m => m.label).join(', ')}`);
    lines.push(``);
  }
  
  if (cd.unmapped.length > 0) {
    lines.push(`⚠️ Columns ไม่ตรงกับ Schema (${cd.unmapped.length} columns):`);
    cd.unmapped.forEach(u => {
      const suggestion = cd.suggestions.find(s => s.unmappedHeader === u.headerName);
      if (suggestion) {
        lines.push(`   - "${u.headerName}" → แนะนำเป็น "${suggestion.suggestedLabel}"`);
      } else {
        lines.push(`   - "${u.headerName}" (ไม่พบการจับคู่)`);
      }
    });
    lines.push(``);
  }
  
  // Invalid rows detail
  if (validation.invalidRows.length > 0) {
    lines.push(`═══ ❌ รายการที่มีข้อผิดพลาด ═══`);
    validation.invalidRows.slice(0, 50).forEach(invalid => {
      lines.push(``);
      lines.push(`🔸 แถวที่ ${invalid.rowNum}:`);
      invalid.errors.forEach(err => {
        lines.push(`   • Column "${err.column}": ${err.messages.join(', ')} (ค่าเดิม: "${err.cellValue}")`);
      });
    });
    if (validation.invalidRows.length > 50) {
      lines.push(``);
      lines.push(`... และอีก ${validation.invalidRows.length - 50} แถว ที่ไม่ได้แสดง`);
    }
  }
  
  // Warnings
  if (validation.warnings.length > 0) {
    lines.push(``);
    lines.push(`═══ ⚠️ คำเตือน (Import ได้ แต่ควรตรวจสอบ) ═══`);
    validation.warnings.slice(0, 20).forEach(w => {
      lines.push(`🔸 แถวที่ ${w.rowNum}: ${w.warnings.map(ww => ww.messages.join(', ')).join(' | ')}`);
    });
  }
  
  return lines.join('\n');
}

// ============ Export to Window ============
window.ValidationSystem = {
  SCHEMA: VALIDATION_SCHEMA,
  detectColumnMapping,
  validateField,
  validateRow,
  validateImport,
  parseRobustCSV,
  generateValidationReport,
  cleanValue,
  thaiToArabicNumbers,
  parseDateFlexible
};
