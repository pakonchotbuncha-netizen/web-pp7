// Positions Data and Functions
// ข้อมูลตำแหน่งงานและฟังก์ชันแสดงผล

// ===== SAMPLE POSITIONS DATA =====
const POSITIONS = [
    {
        id: 'POS-001',
        title: 'นักพัฒนาซอฟต์แวร์ (Software Developer)',
        department: 'IT',
        level: 'junior',
        type: 'fulltime',
        salary: '25,000 - 40,000 บาท',
        location: 'กรุงเทพฯ',
        postedDate: '2026-07-20',
        deadline: '2026-08-20',
        quota: 3,
        description: `
            <h3 class="text-lg font-semibold mb-3">รายละเอียดตำแหน่ง</h3>
            <p class="text-gray-700 mb-4">
                เรากำลังมองหานักพัฒนาซอฟต์แวร์ที่มีความกระตือรือร้นและพร้อมเรียนรู้เทคโนโลยีใหม่ๆ 
                คุณจะได้ทำงานในทีมที่แข็งแกร่งและมีส่วนร่วมในโปรเจกต์ที่น่าสนใจ
            </p>
            
            <h3 class="text-lg font-semibold mb-3">หน้าที่ความรับผิดชอบ</h3>
            <ul class="list-disc list-inside text-gray-700 mb-4 space-y-1">
                <li>พัฒนาและบำรุงรักษาระบบเว็บแอปพลิเคชัน</li>
                <li>ทำงานร่วมกับทีมออกแบบและทีมผลิตภัณฑ์</li>
                <li>เขียนโค้ดที่มีคุณภาพและทดสอบได้</li>
                <li>แก้ไขบั๊กและปรับปรุงประสิทธิภาพระบบ</li>
                <li>เรียนรู้เทคโนโลยีใหม่ๆ และนำมาประยุกต์ใช้</li>
            </ul>
            
            <h3 class="text-lg font-semibold mb-3">คุณสมบัติ</h3>
            <ul class="list-disc list-inside text-gray-700 mb-4 space-y-1">
                <li>ปริญญาตรีสาขาวิทยาการคอมพิวเตอร์, วิศวกรรมซอฟต์แวร์ หรือสาขาที่เกี่ยวข้อง</li>
                <li>มีความรู้พื้นฐานด้าน HTML, CSS, JavaScript</li>
                <li>รู้จักภาษาโปรแกรมอย่างน้อย 1 ภาษา (Python, Java, Node.js)</li>
                <li>สามารถทำงานเป็นทีมได้ดี</li>
                <li>มีทัศนคติเชิงบวกและพร้อมเรียนรู้</li>
            </ul>
            
            <h3 class="text-lg font-semibold mb-3">สิทธิประโยชน์</h3>
            <ul class="list-disc list-inside text-gray-700 space-y-1">
                <li>เงินเดือนเริ่มต้น 25,000 - 40,000 บาท (ขึ้นอยู่กับประสบการณ์)</li>
                <li>โบนัสประจำปี (ตามผลประกอบการ)</li>
                <li>ประกันสุขภาพกลุ่ม</li>
                <li>วันลาพักร้อน 10 วัน/ปี</li>
                <li>กิจกรรมทีมbuilding ประจำไตรมาส</li>
                <li>โอกาสเรียนรู้และพัฒนาตนเอง</li>
            </ul>
        `,
        requirements: [
            'ปริญญาตรีสาขาวิทยาการคอมพิวเตอร์หรือสาขาที่เกี่ยวข้อง',
            'มีความรู้พื้นฐานด้าน HTML, CSS, JavaScript',
            'รู้จักภาษาโปรแกรมอย่างน้อย 1 ภาษา',
            'สามารถทำงานเป็นทีมได้ดี',
            'มีทัศนคติเชิงบวกและพร้อมเรียนรู้'
        ]
    },
    {
        id: 'POS-002',
        title: 'เจ้าหน้าที่ทรัพยากรบุคคล (HR Officer)',
        department: 'HR',
        level: 'junior',
        type: 'fulltime',
        salary: '20,000 - 30,000 บาท',
        location: 'กรุงเทพฯ',
        postedDate: '2026-07-18',
        deadline: '2026-08-18',
        quota: 2,
        description: `
            <h3 class="text-lg font-semibold mb-3">รายละเอียดตำแหน่ง</h3>
            <p class="text-gray-700 mb-4">
                ร่วมงานกับทีม HR ของเราในการดูแลและพัฒนาศักยภาพของบุคลากรในองค์กร
            </p>
            
            <h3 class="text-lg font-semibold mb-3">หน้าที่ความรับผิดชอบ</h3>
            <ul class="list-disc list-inside text-gray-700 mb-4 space-y-1">
                <li>ดูแลกระบวนการสรรหาและคัดเลือกบุคลากร</li>
                <li>จัดการข้อมูลพนักงานและเอกสารที่เกี่ยวข้อง</li>
                <li>ประสานงานด้านการฝึกอบรมและพัฒนา</li>
                <li>ให้คำปรึกษาด้านนโยบายและสวัสดิการพนักงาน</li>
                <li>สนับสนุนกิจกรรมด้านวัฒนธรรมองค์กร</li>
            </ul>
            
            <h3 class="text-lg font-semibold mb-3">คุณสมบัติ</h3>
            <ul class="list-disc list-inside text-gray-700 mb-4 space-y-1">
                <li>ปริญญาตรีสาขาการบริหารทรัพยากรบุคคล หรือสาขาที่เกี่ยวข้อง</li>
                <li>มีประสบการณ์ทำงานด้าน HR 1 ปีขึ้นไป (ยินดีรับเด็กจบใหม่)</li>
                <li>มีความรู้ด้านกฎหมายแรงงาน</li>
                <li>มีทักษะการสื่อสารและการทำงานเป็นทีม</li>
                <li>สามารถใช้ Microsoft Office ได้คล่อง</li>
            </ul>
        `,
        requirements: [
            'ปริญญาตรีสาขาการบริหารทรัพยากรบุคคลหรือสาขาที่เกี่ยวข้อง',
            'มีประสบการณ์ทำงานด้าน HR 1 ปีขึ้นไป',
            'มีความรู้ด้านกฎหมายแรงงาน',
            'มีทักษะการสื่อสารและการทำงานเป็นทีม'
        ]
    },
    {
        id: 'POS-003',
        title: 'นักวิเคราะห์การเงิน (Financial Analyst)',
        department: 'Finance',
        level: 'senior',
        type: 'fulltime',
        salary: '40,000 - 60,000 บาท',
        location: 'กรุงเทพฯ',
        postedDate: '2026-07-15',
        deadline: '2026-08-15',
        quota: 1,
        description: `
            <h3 class="text-lg font-semibold mb-3">รายละเอียดตำแหน่ง</h3>
            <p class="text-gray-700 mb-4">
                มองหานักวิเคราะห์การเงินที่มีประสบการณ์ในการวิเคราะห์ข้อมูลทางการเงินและจัดทำรายงาน
            </p>
            
            <h3 class="text-lg font-semibold mb-3">หน้าที่ความรับผิดชอบ</h3>
            <ul class="list-disc list-inside text-gray-700 mb-4 space-y-1">
                <li>วิเคราะห์ข้อมูลทางการเงินและจัดทำรายงาน</li>
                <li>จัดทำงบประมาณและพยากรณ์การเงิน</li>
                <li>วิเคราะห์ความแปรผันและให้คำแนะนำ</li>
                <li>สนับสนุนการตัดสินใจทางธุรกิจ</li>
                <li>ประสานงานกับผู้ตรวจสอบภายในและภายนอก</li>
            </ul>
            
            <h3 class="text-lg font-semibold mb-3">คุณสมบัติ</h3>
            <ul class="list-disc list-inside text-gray-700 mb-4 space-y-1">
                <li>ปริญญาตรีสาขาการเงิน บัญชี หรือสาขาที่เกี่ยวข้อง</li>
                <li>มีประสบการณ์ทำงานด้านวิเคราะห์การเงิน 3 ปีขึ้นไป</li>
                <li>มีความรู้ด้าน ERP Systems (SAP, Oracle)</li>
                <li>สามารถใช้ Excel ขั้นสูงได้</li>
                <li>มีใบรับรอง CFA หรือ CPA จะพิจารณาเป็นพิเศษ</li>
            </ul>
        `,
        requirements: [
            'ปริญญาตรีสาขาการเงิน บัญชี หรือสาขาที่เกี่ยวข้อง',
            'มีประสบการณ์ทำงานด้านวิเคราะห์การเงิน 3 ปีขึ้นไป',
            'มีความรู้ด้าน ERP Systems',
            'สามารถใช้ Excel ขั้นสูงได้'
        ]
    },
    {
        id: 'POS-004',
        title: 'พนักงานขาย (Sales Representative)',
        department: 'Sales',
        level: 'entry',
        type: 'fulltime',
        salary: '18,000 - 25,000 บาท + ค่าคอมมิชชั่น',
        location: 'กรุงเทพฯ',
        postedDate: '2026-07-22',
        deadline: '2026-08-22',
        quota: 5,
        description: `
            <h3 class="text-lg font-semibold mb-3">รายละเอียดตำแหน่ง</h3>
            <p class="text-gray-700 mb-4">
                ร่วมทีมขายของเราและสร้างรายได้ไม่จำกัดด้วยค่าคอมมิชชั่น
            </p>
            
            <h3 class="text-lg font-semibold mb-3">หน้าที่ความรับผิดชอบ</h3>
            <ul class="list-disc list-inside text-gray-700 mb-4 space-y-1">
                <li>หาลูกค้าใหม่และรักษาลูกค้าเก่า</li>
                <li>นำเสนอผลิตภัณฑ์และบริการ</li>
                <li>เจรจาต่อรองและปิดการขาย</li>
                <li>จัดทำรายงานยอดขาย</li>
                <li>บรรลุเป้าหมายยอดขายที่กำหนด</li>
            </ul>
            
            <h3 class="text-lg font-semibold mb-3">คุณสมบัติ</h3>
            <ul class="list-disc list-inside text-gray-700 mb-4 space-y-1">
                <li>ปริญญาตรีสาขาใดก็ได้</li>
                <li>มีทักษะการสื่อสารและเจรจา</li>
                <li>มีบุคลิกภาพที่ดีและมั่นใจ</li>
                <li>พร้อมทำงานภายใต้แรงกดดัน</li>
                <li>มีใบขับขี่และยานพาหนะ</li>
            </ul>
        `,
        requirements: [
            'ปริญญาตรีสาขาใดก็ได้',
            'มีทักษะการสื่อสารและเจรจา',
            'มีบุคลิกภาพที่ดีและมั่นใจ',
            'มีใบขับขี่และยานพาหนะ'
        ]
    },
    {
        id: 'POS-005',
        title: 'นักการตลาดดิจิทัล (Digital Marketing Specialist)',
        department: 'Marketing',
        level: 'junior',
        type: 'fulltime',
        salary: '25,000 - 35,000 บาท',
        location: 'กรุงเทพฯ',
        postedDate: '2026-07-19',
        deadline: '2026-08-19',
        quota: 2,
        description: `
            <h3 class="text-lg font-semibold mb-3">รายละเอียดตำแหน่ง</h3>
            <p class="text-gray-700 mb-4">
                ร่วมสร้างแคมเปญการตลาดดิจิทัลที่สร้างสรรค์และมีประสิทธิภาพ
            </p>
            
            <h3 class="text-lg font-semibold mb-3">หน้าที่ความรับผิดชอบ</h3>
            <ul class="list-disc list-inside text-gray-700 mb-4 space-y-1">
                <li>วางแผนและดำเนินแคมเปญการตลาดดิจิทัล</li>
                <li>จัดการโซเชียลมีเดียและเนื้อหา</li>
                <li>วิเคราะห์ข้อมูลและรายงานผล</li>
                <li>ประสานงานกับทีมออกแบบ</li>
                <li>ติดตามเทรนด์การตลาดใหม่ๆ</li>
            </ul>
            
            <h3 class="text-lg font-semibold mb-3">คุณสมบัติ</h3>
            <ul class="list-disc list-inside text-gray-700 mb-4 space-y-1">
                <li>ปริญญาตรีสาขาการตลาด การสื่อสาร หรือสาขาที่เกี่ยวข้อง</li>
                <li>มีประสบการณ์ด้าน Digital Marketing 1 ปีขึ้นไป</li>
                <li>มีความรู้ด้าน Facebook Ads, Google Ads</li>
                <li>มีความคิดสร้างสรรค์และติดตามเทรนด์</li>
                <li>สามารถใช้เครื่องมือ Analytics ได้</li>
            </ul>
        `,
        requirements: [
            'ปริญญาตรีสาขาการตลาด การสื่อสาร หรือสาขาที่เกี่ยวข้อง',
            'มีประสบการณ์ด้าน Digital Marketing 1 ปีขึ้นไป',
            'มีความรู้ด้าน Facebook Ads, Google Ads',
            'สามารถใช้เครื่องมือ Analytics ได้'
        ]
    },
    {
        id: 'POS-006',
        title: 'ผู้จัดการโครงการ (Project Manager)',
        department: 'IT',
        level: 'manager',
        type: 'fulltime',
        salary: '50,000 - 80,000 บาท',
        location: 'กรุงเทพฯ',
        postedDate: '2026-07-17',
        deadline: '2026-08-17',
        quota: 1,
        description: `
            <h3 class="text-lg font-semibold mb-3">รายละเอียดตำแหน่ง</h3>
            <p class="text-gray-700 mb-4">
                นำทีมพัฒนาโปรเจกต์และส่งมอบงานที่มีคุณภาพตามเวลาที่กำหนด
            </p>
            
            <h3 class="text-lg font-semibold mb-3">หน้าที่ความรับผิดชอบ</h3>
            <ul class="list-disc list-inside text-gray-700 mb-4 space-y-1">
                <li>วางแผนและจัดการโปรเจกต์</li>
                <li>นำทีมพัฒนาและประสานงาน</li>
                <li>ติดตามความคืบหน้าและรายงานผล</li>
                <li>จัดการความเสี่ยงและปัญหา</li>
                <li>สื่อสารกับผู้มีส่วนได้ส่วนเสีย</li>
            </ul>
            
            <h3 class="text-lg font-semibold mb-3">คุณสมบัติ</h3>
            <ul class="list-disc list-inside text-gray-700 mb-4 space-y-1">
                <li>ปริญญาตรีสาขาวิทยาการคอมพิวเตอร์หรือสาขาที่เกี่ยวข้อง</li>
                <li>มีประสบการณ์จัดการโปรเจกต์ 5 ปีขึ้นไป</li>
                <li>มีใบรับรอง PMP หรือ Scrum Master</li>
                <li>มีทักษะการนำทีมและการสื่อสาร</li>
                <li>มีความรู้ด้าน Agile/Scrum</li>
            </ul>
        `,
        requirements: [
            'ปริญญาตรีสาขาวิทยาการคอมพิวเตอร์หรือสาขาที่เกี่ยวข้อง',
            'มีประสบการณ์จัดการโปรเจกต์ 5 ปีขึ้นไป',
            'มีใบรับรอง PMP หรือ Scrum Master',
            'มีความรู้ด้าน Agile/Scrum'
        ]
    }
];

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', () => {
    loadPositions();
    
    // Add event listeners for filters
    document.getElementById('searchInput')?.addEventListener('input', applyFilters);
    document.getElementById('departmentFilter')?.addEventListener('change', applyFilters);
    document.getElementById('levelFilter')?.addEventListener('change', applyFilters);
    document.getElementById('typeFilter')?.addEventListener('change', applyFilters);
});

// ===== LOAD POSITIONS =====
function loadPositions() {
    displayPositions(POSITIONS);
}

// ===== DISPLAY POSITIONS =====
function displayPositions(positions) {
    const grid = document.getElementById('positionsGrid');
    const noResults = document.getElementById('noResults');
    
    if (positions.length === 0) {
        grid.classList.add('hidden');
        noResults.classList.remove('hidden');
        return;
    }
    
    grid.classList.remove('hidden');
    noResults.classList.add('hidden');
    
    grid.innerHTML = positions.map(position => `
        <div class="bg-white rounded-xl shadow-lg overflow-hidden card-hover cursor-pointer" 
             onclick="showPositionDetail('${position.id}')">
            <div class="gradient-bg p-6 text-white">
                <div class="flex justify-between items-start mb-3">
                    <h3 class="text-xl font-bold">${position.title}</h3>
                    <span class="bg-white text-purple-600 px-3 py-1 rounded-full text-xs font-semibold">
                        ${position.quota} อัตรา
                    </span>
                </div>
                <div class="flex items-center text-sm opacity-90">
                    <i class="fas fa-building mr-2"></i>
                    <span>${getDepartmentName(position.department)}</span>
                </div>
            </div>
            <div class="p-6">
                <div class="space-y-3 mb-4">
                    <div class="flex items-center text-gray-600">
                        <i class="fas fa-money-bill-wave w-6 text-purple-600"></i>
                        <span class="ml-2">${position.salary}</span>
                    </div>
                    <div class="flex items-center text-gray-600">
                        <i class="fas fa-map-marker-alt w-6 text-purple-600"></i>
                        <span class="ml-2">${position.location}</span>
                    </div>
                    <div class="flex items-center text-gray-600">
                        <i class="fas fa-briefcase w-6 text-purple-600"></i>
                        <span class="ml-2">${getLevelName(position.level)}</span>
                    </div>
                    <div class="flex items-center text-gray-600">
                        <i class="fas fa-clock w-6 text-purple-600"></i>
                        <span class="ml-2">${getTypeName(position.type)}</span>
                    </div>
                </div>
                <div class="flex items-center justify-between text-sm text-gray-500 pt-4 border-t">
                    <span><i class="fas fa-calendar-alt mr-1"></i>ปิดรับ: ${formatDate(position.deadline)}</span>
                    <button class="text-purple-600 font-semibold hover:text-purple-800">
                        ดูรายละเอียด <i class="fas fa-arrow-right ml-1"></i>
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

// ===== SHOW POSITION DETAIL =====
function showPositionDetail(positionId) {
    const position = POSITIONS.find(p => p.id === positionId);
    if (!position) return;
    
    document.getElementById('modalTitle').textContent = position.title;
    document.getElementById('modalContent').innerHTML = `
        <div class="space-y-6">
            <div class="grid grid-cols-2 gap-4">
                <div class="bg-purple-50 p-4 rounded-lg">
                    <div class="text-sm text-gray-600 mb-1">แผนก</div>
                    <div class="font-semibold">${getDepartmentName(position.department)}</div>
                </div>
                <div class="bg-purple-50 p-4 rounded-lg">
                    <div class="text-sm text-gray-600 mb-1">ระดับ</div>
                    <div class="font-semibold">${getLevelName(position.level)}</div>
                </div>
                <div class="bg-purple-50 p-4 rounded-lg">
                    <div class="text-sm text-gray-600 mb-1">เงินเดือน</div>
                    <div class="font-semibold">${position.salary}</div>
                </div>
                <div class="bg-purple-50 p-4 rounded-lg">
                    <div class="text-sm text-gray-600 mb-1">ประเภท</div>
                    <div class="font-semibold">${getTypeName(position.type)}</div>
                </div>
            </div>
            
            <div class="bg-gray-50 p-4 rounded-lg">
                <div class="text-sm text-gray-600 mb-2">สถานที่ทำงาน</div>
                <div class="font-semibold"><i class="fas fa-map-marker-alt mr-2 text-purple-600"></i>${position.location}</div>
            </div>
            
            <div>
                ${position.description}
            </div>
            
            <div class="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                <div class="flex items-center">
                    <i class="fas fa-info-circle text-yellow-600 mr-2"></i>
                    <div>
                        <div class="font-semibold text-yellow-800">กำหนดปิดรับสมัคร</div>
                        <div class="text-yellow-700">${formatDate(position.deadline)}</div>
                    </div>
                </div>
            </div>
            
            <div class="flex space-x-4">
                <button onclick="applyPosition('${position.id}')" 
                        class="flex-1 bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 transition">
                    <i class="fas fa-paper-plane mr-2"></i>สมัครงานตำแหน่งนี้
                </button>
                <button onclick="closePositionModal()" 
                        class="px-6 py-3 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition">
                    ปิด
                </button>
            </div>
        </div>
    `;
    
    document.getElementById('positionModal').classList.remove('hidden');
}

// ===== CLOSE POSITION MODAL =====
function closePositionModal() {
    document.getElementById('positionModal').classList.add('hidden');
}

// ===== APPLY POSITION =====
function applyPosition(positionId) {
    const stored = localStorage.getItem(CONFIG.STORAGE_KEY);
    if (!stored) {
        alert('กรุณาเข้าสู่ระบบหรือลงทะเบียนก่อนสมัครงาน');
        closePositionModal();
        showRegister();
        return;
    }
    
    // Redirect to application form
    window.location.href = `form-register.html?position=${positionId}`;
}

// ===== FILTER FUNCTIONS =====
function applyFilters() {
    const search = document.getElementById('searchInput').value.toLowerCase();
    const department = document.getElementById('departmentFilter').value;
    const level = document.getElementById('levelFilter').value;
    const type = document.getElementById('typeFilter').value;
    
    const filtered = POSITIONS.filter(position => {
        const matchSearch = !search || 
            position.title.toLowerCase().includes(search) ||
            position.department.toLowerCase().includes(search);
        const matchDepartment = !department || position.department === department;
        const matchLevel = !level || position.level === level;
        const matchType = !type || position.type === type;
        
        return matchSearch && matchDepartment && matchLevel && matchType;
    });
    
    displayPositions(filtered);
}

function resetFilters() {
    document.getElementById('searchInput').value = '';
    document.getElementById('departmentFilter').value = '';
    document.getElementById('levelFilter').value = '';
    document.getElementById('typeFilter').value = '';
    displayPositions(POSITIONS);
}

// ===== UTILITY FUNCTIONS =====
function getDepartmentName(code) {
    const departments = {
        'IT': 'เทคโนโลยีสารสนเทศ',
        'HR': 'ทรัพยากรบุคคล',
        'Finance': 'การเงิน',
        'Sales': 'การขาย',
        'Marketing': 'การตลาด'
    };
    return departments[code] || code;
}

function getLevelName(code) {
    const levels = {
        'entry': 'ระดับเริ่มต้น',
        'junior': 'ระดับจูเนียร์',
        'senior': 'ระดับอาวุโส',
        'manager': 'ระดับผู้จัดการ'
    };
    return levels[code] || code;
}

function getTypeName(code) {
    const types = {
        'fulltime': 'เต็มเวลา',
        'parttime': 'พาร์ทไทม์',
        'contract': 'สัญญาจ้าง'
    };
    return types[code] || code;
}
