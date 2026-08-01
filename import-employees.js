// import-employees.js — ระบบนำเข้าข้อมูลพนักงาน
// Web PP7 - รองรับ 3 ประเทศ: ไทย, ลาว, กัมพูชา

let uploadedData = [];
let fileColumns = [];

// ===== File Upload Handling =====
const dropZone = document.getElementById('dropZone');
const fileInput = document.getElementById('fileInput');

dropZone.addEventListener('click', () => fileInput.click());

dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.classList.add('dragover');
});

dropZone.addEventListener('dragleave', () => {
    dropZone.classList.remove('dragover');
});

dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.classList.remove('dragover');
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
});

fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) handleFile(file);
});

function handleFile(file) {
    // Validate file type
    const validTypes = [
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-excel',
        'text/csv'
    ];
    const ext = file.name.split('.').pop().toLowerCase();
    
    if (!['xlsx', 'xls', 'csv'].includes(ext)) {
        alert('กรุณาเลือกไฟล์ Excel (.xlsx, .xls) หรือ CSV (.csv)');
        return;
    }

    if (file.size > 10 * 1024 * 1024) {
        alert('ไฟล์มีขนาดใหญ่เกิน 10 MB');
        return;
    }

    // Show file info
    document.getElementById('fileName').textContent = file.name;
    document.getElementById('fileSize').textContent = formatFileSize(file.size);
    document.getElementById('fileInfo').classList.remove('hidden');

    // Read file
    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
            const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });

            if (jsonData.length < 2) {
                alert('ไฟล์ไม่มีข้อมูล');
                return;
            }

            fileColumns = jsonData[0];
            uploadedData = jsonData.slice(1).filter(row => row.length > 0);

            populateMappingSelects();
            document.getElementById('mappingSection').classList.remove('hidden');
            document.getElementById('mappingSection').scrollIntoView({ behavior: 'smooth' });
        } catch (err) {
            console.error(err);
            alert('ไม่สามารถอ่านไฟล์ได้: ' + err.message);
        }
    };
    reader.readAsArrayBuffer(file);
}

function clearFile() {
    document.getElementById('fileInfo').classList.add('hidden');
    document.getElementById('mappingSection').classList.add('hidden');
    document.getElementById('previewSection').classList.add('hidden');
    fileInput.value = '';
    uploadedData = [];
    fileColumns = [];
}

function formatFileSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

// ===== Field Mapping =====
function populateMappingSelects() {
    const selects = [
        'map_employee_id', 'map_full_name', 'map_country',
        'map_department', 'map_position', 'map_email',
        'map_phone', 'map_start_date', 'map_status'
    ];

    selects.forEach(id => {
        const select = document.getElementById(id);
        select.innerHTML = '<option value="">-- เลือกคอลัมน์ --</option>';
        fileColumns.forEach((col, idx) => {
            const option = document.createElement('option');
            option.value = idx;
            option.textContent = col || `คอลัมน์ ${idx + 1}`;
            select.appendChild(option);
        });
    });

    // Auto-map common column names
    autoMap('map_employee_id', ['รหัสพนักงาน', 'employee_id', 'emp_id', 'id', 'รหัส', 'ID']);
    autoMap('map_full_name', ['ชื่อ-นามสกุล', 'ชื่อ', 'name', 'fullname', 'full_name', 'ชื่อพนักงาน']);
    autoMap('map_country', ['ประเทศ', 'country', 'nation']);
    autoMap('map_department', ['แผนก', 'department', 'dept', 'ฝ่าย', 'หน่วยงาน']);
    autoMap('map_position', ['ตำแหน่ง', 'position', 'title', 'job_title']);
    autoMap('map_email', ['email', 'อีเมล์', 'อีเมล', 'e-mail']);
    autoMap('map_phone', ['เบอร์โทร', 'phone', 'telephone', 'tel', 'มือถือ', 'mobile']);
    autoMap('map_start_date', ['วันที่เข้าทำงาน', 'start_date', 'hire_date', 'วันที่เริ่มงาน', 'join_date']);
    autoMap('map_status', ['สถานะ', 'status', 'employment_status']);
}

function autoMap(selectId, keywords) {
    const select = document.getElementById(selectId);
    for (let i = 0; i < fileColumns.length; i++) {
        const col = (fileColumns[i] || '').toString().toLowerCase();
        if (keywords.some(kw => col.includes(kw.toLowerCase()))) {
            select.value = i;
            break;
        }
    }
}

// ===== Validation & Preview =====
function validateMapping() {
    const required = ['map_employee_id', 'map_full_name', 'map_country', 'map_department', 'map_position'];
    const missing = required.filter(id => !document.getElementById(id).value);

    if (missing.length > 0) {
        alert('กรุณาจับคู่ฟิลด์ที่จำเป็นทั้งหมด (รหัสพนักงาน, ชื่อ-นามสกุล, ประเทศ, แผนก, ตำแหน่ง)');
        return;
    }

    showPreview();
}

function showPreview() {
    const mapping = getMapping();
    const previewData = uploadedData.slice(0, 10);

    // Count by country
    let thCount = 0, laCount = 0, khCount = 0;
    uploadedData.forEach(row => {
        const country = normalizeCountry(row[mapping.country]);
        if (country === 'TH') thCount++;
        else if (country === 'LA') laCount++;
        else if (country === 'KH') khCount++;
    });

    document.getElementById('totalCount').textContent = uploadedData.length;
    document.getElementById('thCount').textContent = thCount;
    document.getElementById('laCount').textContent = laCount;
    document.getElementById('khCount').textContent = khCount;
    document.getElementById('totalPreview').textContent = uploadedData.length;

    // Build preview table
    const tbody = document.getElementById('previewTable');
    tbody.innerHTML = '';

    previewData.forEach(row => {
        const tr = document.createElement('tr');
        tr.className = 'border-b hover:bg-gray-50';

        const country = normalizeCountry(row[mapping.country]);
        const countryBadge = getCountryBadge(country);
        const status = row[mapping.status] || 'active';

        tr.innerHTML = `
            <td class="px-4 py-2 text-sm">${row[mapping.employee_id] || '-'}</td>
            <td class="px-4 py-2 text-sm">${row[mapping.full_name] || '-'}</td>
            <td class="px-4 py-2 text-sm">${countryBadge}</td>
            <td class="px-4 py-2 text-sm">${row[mapping.department] || '-'}</td>
            <td class="px-4 py-2 text-sm">${row[mapping.position] || '-'}</td>
            <td class="px-4 py-2 text-sm"><span class="px-2 py-1 rounded text-xs ${status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}">${status}</span></td>
        `;
        tbody.appendChild(tr);
    });

    // Validate data
    const errors = validateData(mapping);
    if (errors.length > 0) {
        document.getElementById('validationErrors').classList.remove('hidden');
        const errorList = document.getElementById('errorList');
        errorList.innerHTML = '';
        errors.slice(0, 10).forEach(err => {
            const li = document.createElement('li');
            li.textContent = err;
            errorList.appendChild(li);
        });
        if (errors.length > 10) {
            const li = document.createElement('li');
            li.textContent = `... และอีก ${errors.length - 10} รายการ`;
            errorList.appendChild(li);
        }
        document.getElementById('importBtn').disabled = true;
        document.getElementById('importBtn').className = 'bg-gray-400 text-white px-6 py-3 rounded-lg cursor-not-allowed font-semibold';
    } else {
        document.getElementById('validationErrors').classList.add('hidden');
        document.getElementById('importBtn').disabled = false;
        document.getElementById('importBtn').className = 'bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 font-semibold';
    }

    document.getElementById('previewSection').classList.remove('hidden');
    document.getElementById('previewSection').scrollIntoView({ behavior: 'smooth' });
}

function getMapping() {
    return {
        employee_id: parseInt(document.getElementById('map_employee_id').value),
        full_name: parseInt(document.getElementById('map_full_name').value),
        country: parseInt(document.getElementById('map_country').value),
        department: parseInt(document.getElementById('map_department').value),
        position: parseInt(document.getElementById('map_position').value),
        email: document.getElementById('map_email').value ? parseInt(document.getElementById('map_email').value) : -1,
        phone: document.getElementById('map_phone').value ? parseInt(document.getElementById('map_phone').value) : -1,
        start_date: document.getElementById('map_start_date').value ? parseInt(document.getElementById('map_start_date').value) : -1,
        status: document.getElementById('map_status').value ? parseInt(document.getElementById('map_status').value) : -1,
    };
}

function normalizeCountry(value) {
    if (!value) return 'UNKNOWN';
    const v = value.toString().toLowerCase().trim();
    if (['th', 'thailand', 'ไทย', 'ประเทศไทย'].includes(v)) return 'TH';
    if (['la', 'laos', 'ลาว', 'สปป.ลาว'].includes(v)) return 'LA';
    if (['kh', 'cambodia', 'กัมพูชา', 'kampuchea', 'kamphucha'].includes(v)) return 'KH';
    return 'UNKNOWN';
}

function getCountryBadge(country) {
    switch (country) {
        case 'TH': return '<span class="country-badge country-th">🇹🇭 ไทย</span>';
        case 'LA': return '<span class="country-badge country-la">🇱🇦 ลาว</span>';
        case 'KH': return '<span class="country-badge country-kh">🇰🇭 กัมพูชา</span>';
        default: return '<span class="country-badge bg-gray-100 text-gray-800">❓ ไม่ระบุ</span>';
    }
}

function validateData(mapping) {
    const errors = [];
    const empIds = new Set();

    uploadedData.forEach((row, idx) => {
        const rowNum = idx + 2; // +2 เพราะ header = row 1, data เริ่ม row 2

        // Check required fields
        if (!row[mapping.employee_id]) {
            errors.push(`แถว ${rowNum}: ไม่มีรหัสพนักงาน`);
        } else if (empIds.has(row[mapping.employee_id].toString())) {
            errors.push(`แถว ${rowNum}: รหัสพนักงานซ้ำ (${row[mapping.employee_id]})`);
        } else {
            empIds.add(row[mapping.employee_id].toString());
        }

        if (!row[mapping.full_name]) {
            errors.push(`แถว ${rowNum}: ไม่มีชื่อ-นามสกุล`);
        }

        const country = normalizeCountry(row[mapping.country]);
        if (country === 'UNKNOWN') {
            errors.push(`แถว ${rowNum}: ประเทศไม่ถูกต้อง (${row[mapping.country] || 'ว่าง'}) — ต้องเป็น ไทย/ลาว/กัมพูชา`);
        }
    });

    return errors;
}

// ===== Import Data =====
async function importData() {
    const mapping = getMapping();

    document.getElementById('progressSection').classList.remove('hidden');
    document.getElementById('previewSection').classList.add('hidden');
    document.getElementById('progressSection').scrollIntoView({ behavior: 'smooth' });

    const employees = uploadedData.map((row, idx) => {
        const progress = Math.round(((idx + 1) / uploadedData.length) * 100);
        document.getElementById('progressBar').style.width = progress + '%';
        document.getElementById('progressText').textContent = `กำลังประมวลผล ${idx + 1} / ${uploadedData.length}...`;

        return {
            employee_id: row[mapping.employee_id]?.toString() || '',
            full_name: row[mapping.full_name]?.toString() || '',
            country: normalizeCountry(row[mapping.country]),
            department: row[mapping.department]?.toString() || '',
            position: row[mapping.position]?.toString() || '',
            email: mapping.email >= 0 ? (row[mapping.email]?.toString() || '') : '',
            phone: mapping.phone >= 0 ? (row[mapping.phone]?.toString() || '') : '',
            start_date: mapping.start_date >= 0 ? (row[mapping.start_date]?.toString() || '') : '',
            status: mapping.status >= 0 ? (row[mapping.status]?.toString() || 'active') : 'active',
            created_at: new Date().toISOString(),
            imported_by: 'admin'
        };
    });

    // Save to localStorage (for prototype)
    const existing = JSON.parse(localStorage.getItem('pp7_employees') || '[]');
    const merged = [...existing, ...employees];
    localStorage.setItem('pp7_employees', JSON.stringify(merged));

    // Save import log
    const importLog = JSON.parse(localStorage.getItem('pp7_import_log') || '[]');
    importLog.unshift({
        timestamp: new Date().toISOString(),
        count: employees.length,
        by_country: {
            TH: employees.filter(e => e.country === 'TH').length,
            LA: employees.filter(e => e.country === 'LA').length,
            KH: employees.filter(e => e.country === 'KH').length,
        }
    });
    localStorage.setItem('pp7_import_log', JSON.stringify(importLog));

    // Show success
    setTimeout(() => {
        document.getElementById('progressSection').classList.add('hidden');
        document.getElementById('successSection').classList.remove('hidden');
        document.getElementById('successCount').textContent = employees.length;
        document.getElementById('successSection').scrollIntoView({ behavior: 'smooth' });
    }, 500);
}

// ===== Download Template =====
function downloadTemplate() {
    const template = [
        ['รหัสพนักงาน', 'ชื่อ-นามสกุล', 'ประเทศ', 'แผนก', 'ตำแหน่ง', 'Email', 'เบอร์โทร', 'วันที่เข้าทำงาน', 'สถานะ'],
        ['PKG001', 'สมชาย ใจดี', 'ไทย', 'IT', 'Software Engineer', 'somchai@pkg.com', '0812345678', '2024-01-15', 'active'],
        ['PKG002', 'สมหญิง รักเรียน', 'ไทย', 'HR', 'HR Coordinator', 'somying@pkg.com', '0823456789', '2024-02-01', 'active'],
        ['LAO001', 'ທອງໃຈ ດີ', 'ลาว', 'Sales', 'Sales Executive', 'thongjai@pkg.la', '0201234567', '2024-03-01', 'active'],
        ['KHM001', 'សុខ ដារា', 'กัมพูชา', 'Operations', 'Operations Manager', 'sokdara@pkg.kh', '012345678', '2024-01-20', 'active'],
    ];

    const ws = XLSX.utils.aoa_to_sheet(template);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Employee_Template');

    // Set column widths
    ws['!cols'] = [
        { wch: 15 }, { wch: 25 }, { wch: 12 }, { wch: 15 },
        { wch: 20 }, { wch: 25 }, { wch: 15 }, { wch: 15 }, { wch: 10 }
    ];

    XLSX.writeFile(wb, 'PP7_Employee_Import_Template.xlsx');
}
