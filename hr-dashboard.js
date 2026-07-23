// HR Dashboard Functions
// ระบบจัดการผู้สมัครสำหรับ HR

let currentTab = 'applicants';
let applications = [];
let testResults = [];

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', () => {
    checkHRAuth();
    loadData();
    switchTab('applicants');
});

// ===== CHECK HR AUTH =====
function checkHRAuth() {
    const stored = localStorage.getItem(CONFIG.STORAGE_KEY);
    if (!stored) {
        alert('กรุณาเข้าสู่ระบบ');
        window.location.href = 'index.html';
        return;
    }
    
    try {
        currentUser = JSON.parse(stored);
        if (currentUser.role !== 'hr') {
            alert('ไม่มีสิทธิ์เข้าถึงหน้านี้');
            window.location.href = 'index.html';
            return;
        }
    } catch (e) {
        localStorage.removeItem(CONFIG.STORAGE_KEY);
        window.location.href = 'index.html';
    }
}

// ===== LOAD DATA =====
function loadData() {
    applications = JSON.parse(localStorage.getItem('pkg_applications') || '[]');
    testResults = JSON.parse(localStorage.getItem('pkg_test_results') || '[]');
    updateStats();
}

// ===== UPDATE STATS =====
function updateStats() {
    document.getElementById('stat-total').textContent = applications.length;
    document.getElementById('stat-new').textContent = applications.filter(a => a.status === 'new').length;
    document.getElementById('stat-tested').textContent = applications.filter(a => a.status === 'test_done').length;
    document.getElementById('stat-interview').textContent = applications.filter(a => 
        ['interview_scheduled', 'interview_confirmed', 'interviewed'].includes(a.status)
    ).length;
    document.getElementById('stat-hired').textContent = applications.filter(a => a.status === 'hired').length;
}

// ===== SWITCH TAB =====
function switchTab(tabName) {
    currentTab = tabName;
    
    // Update tab buttons
    document.querySelectorAll('[id^="tab-"]').forEach(tab => {
        tab.className = 'tab-inactive px-4 py-2 rounded-lg font-medium';
    });
    document.getElementById(`tab-${tabName}`).className = 'tab-active px-4 py-2 rounded-lg font-medium';
    
    // Load content
    const content = document.getElementById('tab-content');
    
    switch(tabName) {
        case 'applicants':
            content.innerHTML = renderApplicantsTab();
            break;
        case 'tests':
            content.innerHTML = renderTestsTab();
            break;
        case 'interviews':
            content.innerHTML = renderInterviewsTab();
            break;
        case 'scoring':
            content.innerHTML = renderScoringTab();
            break;
        case 'results':
            content.innerHTML = renderResultsTab();
            break;
        case 'onboarding':
            content.innerHTML = renderOnboardingTab();
            break;
    }
}

// ===== TAB 1: APPLICANTS =====
function renderApplicantsTab() {
    const newApps = applications.filter(a => a.status === 'new');
    
    let html = `
        <div class="bg-white rounded-xl shadow-lg p-6">
            <div class="flex justify-between items-center mb-6">
                <h2 class="text-2xl font-bold text-gray-800">
                    <i class="fas fa-users text-purple-600 mr-2"></i>ผู้สมัครใหม่ (${newApps.length})
                </h2>
                <div class="flex space-x-2">
                    <input type="text" placeholder="ค้นหา..." class="px-4 py-2 border border-gray-300 rounded-lg">
                    <select class="px-4 py-2 border border-gray-300 rounded-lg">
                        <option>ทุกสถานะ</option>
                        <option>ใหม่</option>
                        <option>คัดกรองแล้ว</option>
                        <option>ส่งแบบทดสอบแล้ว</option>
                    </select>
                </div>
            </div>
    `;
    
    if (newApps.length === 0) {
        html += `
            <div class="text-center py-12">
                <i class="fas fa-inbox text-6xl text-gray-300 mb-4"></i>
                <p class="text-gray-500">ยังไม่มีผู้สมัครใหม่</p>
            </div>
        `;
    } else {
        html += `
            <div class="space-y-4">
                ${newApps.map(app => `
                    <div class="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
                        <div class="flex justify-between items-start mb-3">
                            <div>
                                <h3 class="text-lg font-semibold text-gray-800">${app.personalData?.prefix || ''}${app.personalData?.firstName || ''} ${app.personalData?.lastName || ''}</h3>
                                <p class="text-sm text-gray-500">
                                    <i class="fas fa-briefcase mr-1"></i>${app.positionTitle} | 
                                    <i class="fas fa-calendar-alt mr-1"></i>${formatDate(app.appliedAt)}
                                </p>
                            </div>
                            <span class="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">ใหม่</span>
                        </div>
                        <div class="grid grid-cols-3 gap-4 text-sm text-gray-600 mb-3">
                            <div><i class="fas fa-graduation-cap mr-1"></i>${app.education?.level || '-'}</div>
                            <div><i class="fas fa-phone mr-1"></i>${app.personalData?.phone || '-'}</div>
                            <div><i class="fas fa-envelope mr-1"></i>${app.personalData?.email || '-'}</div>
                        </div>
                        <div class="flex space-x-2">
                            <button onclick="viewApplicant('${app.id}')" class="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">
                                <i class="fas fa-eye mr-1"></i>ดูรายละเอียด
                            </button>
                            <button onclick="screenApplicant('${app.id}')" class="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
                                <i class="fas fa-check mr-1"></i>คัดกรอง
                            </button>
                            <button onclick="sendTest('${app.id}')" class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                                <i class="fas fa-paper-plane mr-1"></i>ส่งแบบทดสอบ
                            </button>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }
    
    html += '</div>';
    return html;
}

// ===== TAB 2: TESTS =====
function renderTestsTab() {
    const testedApps = applications.filter(a => a.status === 'test_done');
    
    let html = `
        <div class="bg-white rounded-xl shadow-lg p-6">
            <h2 class="text-2xl font-bold text-gray-800 mb-6">
                <i class="fas fa-tasks text-purple-600 mr-2"></i>ผลแบบทดสอบ (${testedApps.length})
            </h2>
    `;
    
    if (testedApps.length === 0) {
        html += `
            <div class="text-center py-12">
                <i class="fas fa-clipboard-check text-6xl text-gray-300 mb-4"></i>
                <p class="text-gray-500">ยังไม่มีผู้สมัครทำแบบทดสอบเสร็จ</p>
            </div>
        `;
    } else {
        html += `
            <div class="space-y-4">
                ${testedApps.map(app => {
                    const scores = app.testScores || {};
                    return `
                        <div class="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
                            <div class="flex justify-between items-start mb-3">
                                <div>
                                    <h3 class="text-lg font-semibold text-gray-800">${app.personalData?.firstName || ''} ${app.personalData?.lastName || ''}</h3>
                                    <p class="text-sm text-gray-500">${app.positionTitle}</p>
                                </div>
                                <span class="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">ทำแบบทดสอบเสร็จ</span>
                            </div>
                            <div class="grid grid-cols-4 gap-4 mb-3">
                                <div class="text-center p-3 bg-purple-50 rounded-lg">
                                    <p class="text-xs text-gray-600">ทัศนคติ</p>
                                    <p class="text-xl font-bold text-purple-600">${scores.attitude || 0}</p>
                                </div>
                                <div class="text-center p-3 bg-blue-50 rounded-lg">
                                    <p class="text-xs text-gray-600">ทักษะ</p>
                                    <p class="text-xl font-bold text-blue-600">${scores.skill || 0}</p>
                                </div>
                                <div class="text-center p-3 bg-yellow-50 rounded-lg">
                                    <p class="text-xs text-gray-600">CC</p>
                                    <p class="text-xl font-bold text-yellow-600">${scores.cc || 0}</p>
                                </div>
                                <div class="text-center p-3 bg-green-50 rounded-lg">
                                    <p class="text-xs text-gray-600">3E3P</p>
                                    <p class="text-xl font-bold text-green-600">${scores.e3p || 0}</p>
                                </div>
                            </div>
                            <div class="bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-4 rounded-lg mb-3">
                                <div class="flex justify-between items-center">
                                    <span class="font-semibold">คะแนนรวม</span>
                                    <span class="text-3xl font-bold">${scores.overall || 0}</span>
                                </div>
                            </div>
                            <div class="flex space-x-2">
                                <button onclick="viewTestResult('${app.id}')" class="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">
                                    <i class="fas fa-eye mr-1"></i>ดูผลละเอียด
                                </button>
                                <button onclick="selectForInterview('${app.id}')" class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                                    <i class="fas fa-calendar-check mr-1"></i>เลือกสัมภาษณ์
                                </button>
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    }
    
    html += '</div>';
    return html;
}

// ===== TAB 3: INTERVIEWS =====
function renderInterviewsTab() {
    const scheduledApps = applications.filter(a => 
        ['interview_scheduled', 'interview_confirmed'].includes(a.status)
    );
    
    let html = `
        <div class="bg-white rounded-xl shadow-lg p-6">
            <div class="flex justify-between items-center mb-6">
                <h2 class="text-2xl font-bold text-gray-800">
                    <i class="fas fa-calendar-check text-purple-600 mr-2"></i>นัดสัมภาษณ์ (${scheduledApps.length})
                </h2>
                <button onclick="showScheduleInterview()" class="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700">
                    <i class="fas fa-plus mr-2"></i>นัดสัมภาษณ์ใหม่
                </button>
            </div>
    `;
    
    if (scheduledApps.length === 0) {
        html += `
            <div class="text-center py-12">
                <i class="fas fa-calendar text-6xl text-gray-300 mb-4"></i>
                <p class="text-gray-500">ยังไม่มีนัดสัมภาษณ์</p>
            </div>
        `;
    } else {
        html += `
            <div class="space-y-4">
                ${scheduledApps.map(app => `
                    <div class="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
                        <div class="flex justify-between items-start mb-3">
                            <div>
                                <h3 class="text-lg font-semibold text-gray-800">${app.personalData?.firstName || ''} ${app.personalData?.lastName || ''}</h3>
                                <p class="text-sm text-gray-500">${app.positionTitle}</p>
                            </div>
                            <span class="px-3 py-1 ${app.interviewConfirmed ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'} rounded-full text-sm font-medium">
                                ${app.interviewConfirmed ? 'ยืนยันแล้ว' : 'รอสัญญาณ'}
                            </span>
                        </div>
                        <div class="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-3">
                            <div><i class="fas fa-calendar mr-1"></i>${formatDate(app.interviewDate)}</div>
                            <div><i class="fas fa-clock mr-1"></i>${app.interviewTime || '-'}</div>
                        </div>
                        <div class="flex space-x-2">
                            <button onclick="viewInterviewDetails('${app.id}')" class="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">
                                <i class="fas fa-eye mr-1"></i>ดูรายละเอียด
                            </button>
                            <button onclick="generateInterviewForm('${app.id}')" class="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
                                <i class="fas fa-file-alt mr-1"></i>สร้างแบบสัมภาษณ์
                            </button>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }
    
    html += '</div>';
    return html;
}

// ===== TAB 4: SCORING =====
function renderScoringTab() {
    const interviewedApps = applications.filter(a => a.status === 'interviewed');
    
    let html = `
        <div class="bg-white rounded-xl shadow-lg p-6">
            <h2 class="text-2xl font-bold text-gray-800 mb-6">
                <i class="fas fa-star text-purple-600 mr-2"></i>ให้คะแนนสัมภาษณ์ (${interviewedApps.length})
            </h2>
    `;
    
    if (interviewedApps.length === 0) {
        html += `
            <div class="text-center py-12">
                <i class="fas fa-star text-6xl text-gray-300 mb-4"></i>
                <p class="text-gray-500">ยังไม่มีผู้สมัครที่สัมภาษณ์เสร็จ</p>
            </div>
        `;
    } else {
        html += `
            <div class="space-y-4">
                ${interviewedApps.map(app => {
                    const scores = app.interviewScores || {};
                    const avgScore = Object.values(scores).length > 0 
                        ? (Object.values(scores).reduce((a, b) => a + b, 0) / Object.values(scores).length).toFixed(1)
                        : 0;
                    return `
                        <div class="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
                            <div class="flex justify-between items-start mb-3">
                                <div>
                                    <h3 class="text-lg font-semibold text-gray-800">${app.personalData?.firstName || ''} ${app.personalData?.lastName || ''}</h3>
                                    <p class="text-sm text-gray-500">${app.positionTitle}</p>
                                </div>
                                <span class="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">สัมภาษณ์แล้ว</span>
                            </div>
                            <div class="bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-4 rounded-lg mb-3">
                                <div class="flex justify-between items-center">
                                    <span class="font-semibold">คะแนนเฉลี่ยจากคกก.</span>
                                    <span class="text-3xl font-bold">${avgScore}/5</span>
                                </div>
                            </div>
                            <div class="flex space-x-2">
                                <button onclick="viewInterviewScores('${app.id}')" class="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">
                                    <i class="fas fa-eye mr-1"></i>ดูคะแนน
                                </button>
                                <button onclick="finalizeResult('${app.id}')" class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                                    <i class="fas fa-check-circle mr-1"></i>สรุปผล
                                </button>
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    }
    
    html += '</div>';
    return html;
}

// ===== TAB 5: RESULTS =====
function renderResultsTab() {
    const resultApps = applications.filter(a => 
        ['hired', 'rejected'].includes(a.status)
    );
    
    let html = `
        <div class="bg-white rounded-xl shadow-lg p-6">
            <h2 class="text-2xl font-bold text-gray-800 mb-6">
                <i class="fas fa-award text-purple-600 mr-2"></i>สรุปผล (${resultApps.length})
            </h2>
    `;
    
    if (resultApps.length === 0) {
        html += `
            <div class="text-center py-12">
                <i class="fas fa-award text-6xl text-gray-300 mb-4"></i>
                <p class="text-gray-500">ยังไม่มีสรุปผล</p>
            </div>
        `;
    } else {
        html += `
            <div class="space-y-4">
                ${resultApps.map(app => `
                    <div class="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
                        <div class="flex justify-between items-start mb-3">
                            <div>
                                <h3 class="text-lg font-semibold text-gray-800">${app.personalData?.firstName || ''} ${app.personalData?.lastName || ''}</h3>
                                <p class="text-sm text-gray-500">${app.positionTitle}</p>
                            </div>
                            <span class="px-3 py-1 ${app.status === 'hired' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'} rounded-full text-sm font-medium">
                                ${app.status === 'hired' ? 'ผ่าน' : 'ไม่ผ่าน'}
                            </span>
                        </div>
                        <div class="flex space-x-2">
                            <button onclick="viewResult('${app.id}')" class="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">
                                <i class="fas fa-eye mr-1"></i>ดูรายละเอียด
                            </button>
                            ${app.status === 'hired' ? `
                                <button onclick="startOnboarding('${app.id}')" class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                                    <i class="fas fa-handshake mr-1"></i>เริ่มงาน
                                </button>
                            ` : ''}
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }
    
    html += '</div>';
    return html;
}

// ===== TAB 6: ONBOARDING =====
function renderOnboardingTab() {
    const hiredApps = applications.filter(a => a.status === 'hired' && !a.onboarded);
    
    let html = `
        <div class="bg-white rounded-xl shadow-lg p-6">
            <h2 class="text-2xl font-bold text-gray-800 mb-6">
                <i class="fas fa-handshake text-purple-600 mr-2"></i>นัดเริ่มงาน (${hiredApps.length})
            </h2>
    `;
    
    if (hiredApps.length === 0) {
        html += `
            <div class="text-center py-12">
                <i class="fas fa-handshake text-6xl text-gray-300 mb-4"></i>
                <p class="text-gray-500">ยังไม่มีผู้สมัครที่พร้อมเริ่มงาน</p>
            </div>
        `;
    } else {
        html += `
            <div class="space-y-4">
                ${hiredApps.map(app => `
                    <div class="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
                        <div class="flex justify-between items-start mb-3">
                            <div>
                                <h3 class="text-lg font-semibold text-gray-800">${app.personalData?.firstName || ''} ${app.personalData?.lastName || ''}</h3>
                                <p class="text-sm text-gray-500">${app.positionTitle}</p>
                            </div>
                            <span class="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">ผ่าน</span>
                        </div>
                        <div class="flex space-x-2">
                            <button onclick="scheduleOnboarding('${app.id}')" class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                                <i class="fas fa-calendar-check mr-1"></i>นัดวันเริ่มงาน
                            </button>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }
    
    html += '</div>';
    return html;
}

// ===== ACTION FUNCTIONS =====
function viewApplicant(appId) {
    const app = applications.find(a => a.id === appId);
    if (!app) return;
    
    document.getElementById('modal-title').textContent = 'รายละเอียดผู้สมัคร';
    document.getElementById('modal-content').innerHTML = `
        <div class="space-y-4">
            <div class="grid grid-cols-2 gap-4">
                <div><strong>ชื่อ:</strong> ${app.personalData?.prefix || ''}${app.personalData?.firstName || ''} ${app.personalData?.lastName || ''}</div>
                <div><strong>ตำแหน่ง:</strong> ${app.positionTitle}</div>
                <div><strong>เบอร์โทร:</strong> ${app.personalData?.phone || '-'}</div>
                <div><strong>Email:</strong> ${app.personalData?.email || '-'}</div>
                <div><strong>การศึกษา:</strong> ${app.education?.level || '-'}</div>
                <div><strong>สถาบัน:</strong> ${app.education?.institution || '-'}</div>
                <div><strong>สาขา:</strong> ${app.education?.major || '-'}</div>
                <div><strong>GPA:</strong> ${app.education?.gpa || '-'}</div>
            </div>
            <div>
                <strong>ประสบการณ์:</strong>
                <p class="text-gray-600 mt-1">${app.experience?.history || '-'}</p>
            </div>
            <div>
                <strong>ทักษะ:</strong>
                <p class="text-gray-600 mt-1">${app.experience?.skills || '-'}</p>
            </div>
        </div>
    `;
    document.getElementById('modal').classList.remove('hidden');
}

function screenApplicant(appId) {
    if (confirm('คัดกรองผู้สมัครนี้?')) {
        const app = applications.find(a => a.id === appId);
        if (app) {
            app.status = 'screened';
            localStorage.setItem('pkg_applications', JSON.stringify(applications));
            loadData();
            switchTab(currentTab);
            alert('คัดกรองแล้ว');
        }
    }
}

function sendTest(appId) {
    if (confirm('ส่งแบบทดสอบให้ผู้สมัครนี้?')) {
        const app = applications.find(a => a.id === appId);
        if (app) {
            app.status = 'test_sent';
            localStorage.setItem('pkg_applications', JSON.stringify(applications));
            loadData();
            switchTab(currentTab);
            alert('ส่งแบบทดสอบแล้ว');
        }
    }
}

function selectForInterview(appId) {
    const date = prompt('ระบุวันสัมภาษณ์ (วว/ดด/ปปปป):');
    if (!date) return;
    
    const time = prompt('ระบุเวลา (เช่น 10:00 น.):');
    if (!time) return;
    
    const app = applications.find(a => a.id === appId);
    if (app) {
        app.status = 'interview_scheduled';
        app.interviewDate = date;
        app.interviewTime = time;
        localStorage.setItem('pkg_applications', JSON.stringify(applications));
        loadData();
        switchTab(currentTab);
        alert('นัดสัมภาษณ์แล้ว');
    }
}

function finalizeResult(appId) {
    const result = prompt('ผลการสัมภาษณ์ (ผ่าน/ไม่ผ่าน):');
    if (!result || !['ผ่าน', 'ไม่ผ่าน'].includes(result)) {
        alert('กรุณาระบุ "ผ่าน" หรือ "ไม่ผ่าน"');
        return;
    }
    
    const app = applications.find(a => a.id === appId);
    if (app) {
        app.status = result === 'ผ่าน' ? 'hired' : 'rejected';
        localStorage.setItem('pkg_applications', JSON.stringify(applications));
        loadData();
        switchTab(currentTab);
        alert(`สรุปผล: ${result}`);
    }
}

function scheduleOnboarding(appId) {
    const date = prompt('ระบุวันเริ่มงาน (วว/ดด/ปปปป):');
    if (!date) return;
    
    const app = applications.find(a => a.id === appId);
    if (app) {
        app.startDate = date;
        app.onboarded = true;
        localStorage.setItem('pkg_applications', JSON.stringify(applications));
        loadData();
        switchTab(currentTab);
        alert(`นัดเริ่มงาน: ${date}`);
    }
}

// ===== MODAL =====
function closeModal() {
    document.getElementById('modal').classList.add('hidden');
}

// ===== UTILITY =====
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('th-TH', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}
