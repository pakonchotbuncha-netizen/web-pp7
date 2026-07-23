// Application Form Functions
// ฟังก์ชันสำหรับฟอร์มใบสมัคร

let currentStep = 1;
let selectedPosition = null;

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    loadPositionInfo();
    loadUserData();
    
    // File upload handler
    document.getElementById('resumeFile')?.addEventListener('change', handleFileUpload);
});

// ===== CHECK AUTHENTICATION =====
function checkAuth() {
    const stored = localStorage.getItem(CONFIG.STORAGE_KEY);
    if (!stored) {
        alert('กรุณาเข้าสู่ระบบ');
        window.location.href = '../index.html';
        return;
    }
    
    try {
        currentUser = JSON.parse(stored);
    } catch (e) {
        localStorage.removeItem(CONFIG.STORAGE_KEY);
        window.location.href = '../index.html';
    }
}

// ===== LOAD POSITION INFO =====
function loadPositionInfo() {
    const urlParams = new URLSearchParams(window.location.search);
    const positionId = urlParams.get('position');
    
    if (positionId) {
        // Load from positions data
        const positions = JSON.parse(localStorage.getItem('pkg_positions') || '[]');
        selectedPosition = positions.find(p => p.id === positionId);
        
        if (selectedPosition) {
            document.getElementById('positionInfo').innerHTML = `
                <strong>${selectedPosition.title}</strong><br>
                <span class="text-sm opacity-90">
                    <i class="fas fa-building mr-1"></i>${selectedPosition.department} | 
                    <i class="fas fa-money-bill-wave mr-1"></i>${selectedPosition.salary}
                </span>
            `;
        }
    } else {
        document.getElementById('positionInfo').textContent = 'ตำแหน่ง: ไม่ได้ระบุ';
    }
}

// ===== LOAD USER DATA =====
function loadUserData() {
    if (!currentUser) return;
    
    // Pre-fill user data from registration
    document.getElementById('phone').value = currentUser.phone || '';
    document.getElementById('email').value = currentUser.email || '';
    
    // Split name into prefix, first name, last name
    const nameParts = currentUser.name?.split(' ') || [];
    if (nameParts.length >= 3) {
        document.getElementById('prefix').value = nameParts[0];
        document.getElementById('firstName').value = nameParts[1];
        document.getElementById('lastName').value = nameParts.slice(2).join(' ');
    }
}

// ===== NAVIGATION =====
function nextStep(step) {
    // Validate current step
    if (!validateStep(currentStep)) {
        return;
    }
    
    // Hide current step
    document.getElementById(`step${currentStep}`).classList.add('hidden');
    
    // Show next step
    document.getElementById(`step${step}`).classList.remove('hidden');
    
    // Update progress
    updateProgress(step);
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    currentStep = step;
}

function prevStep(step) {
    // Hide current step
    document.getElementById(`step${currentStep}`).classList.add('hidden');
    
    // Show previous step
    document.getElementById(`step${step}`).classList.remove('hidden');
    
    // Update progress
    updateProgress(step);
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    currentStep = step;
}

function updateProgress(step) {
    // Update step indicators
    for (let i = 1; i <= 4; i++) {
        const stepElement = document.querySelector(`.step-${i}`);
        if (stepElement) {
            stepElement.classList.remove('step-active', 'step-completed', 'step-inactive');
            
            if (i < step) {
                stepElement.classList.add('step-completed');
            } else if (i === step) {
                stepElement.classList.add('step-active');
            } else {
                stepElement.classList.add('step-inactive');
            }
        }
    }
}

// ===== VALIDATION =====
function validateStep(step) {
    const stepElement = document.getElementById(`step${step}`);
    const requiredFields = stepElement.querySelectorAll('[required]');
    
    for (let field of requiredFields) {
        if (!field.value.trim()) {
            field.focus();
            field.classList.add('border-red-500');
            alert('กรุณากรอกข้อมูลให้ครบถ้วน');
            return false;
        }
        field.classList.remove('border-red-500');
    }
    
    // Additional validations
    if (step === 1) {
        const idCard = document.getElementById('idCard').value;
        if (idCard.length !== 13 || !/^\d{13}$/.test(idCard)) {
            alert('กรุณากรอกเลขบัตรประชาชนให้ถูกต้อง (13 หลัก)');
            document.getElementById('idCard').focus();
            return false;
        }
        
        const phone = document.getElementById('phone').value;
        if (!/^0\d{9}$/.test(phone.replace(/[-\s]/g, ''))) {
            alert('กรุณากรอกเบอร์โทรศัพท์ให้ถูกต้อง');
            document.getElementById('phone').focus();
            return false;
        }
    }
    
    if (step === 2) {
        const gpa = document.getElementById('gpa').value;
        if (gpa && (parseFloat(gpa) < 0 || parseFloat(gpa) > 4)) {
            alert('GPA ต้องอยู่ระหว่าง 0.00 - 4.00');
            document.getElementById('gpa').focus();
            return false;
        }
    }
    
    return true;
}

// ===== FILE UPLOAD =====
function handleFileUpload(event) {
    const file = event.target.files[0];
    
    if (!file) return;
    
    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
        alert('ขนาดไฟล์เกิน 5 MB');
        event.target.value = '';
        return;
    }
    
    // Validate file type
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
    if (!allowedTypes.includes(file.type)) {
        alert('รองรับเฉพาะไฟล์ PDF, JPG, PNG');
        event.target.value = '';
        return;
    }
    
    // Display file name
    document.getElementById('fileName').textContent = `ไฟล์ที่เลือก: ${file.name}`;
    
    // Store file (in real app, upload to server)
    const reader = new FileReader();
    reader.onload = function(e) {
        localStorage.setItem('temp_resume_file', JSON.stringify({
            name: file.name,
            type: file.type,
            data: e.target.result
        }));
    };
    reader.readAsDataURL(file);
}

// ===== SUBMIT APPLICATION =====
async function submitApplication(event) {
    event.preventDefault();
    
    // Validate final step
    if (!validateStep(4)) {
        return;
    }
    
    // Collect all form data
    const applicationData = {
        id: 'APP-' + Date.now(),
        userId: currentUser.id,
        positionId: selectedPosition?.id || null,
        positionTitle: selectedPosition?.title || 'ไม่ได้ระบุ',
        department: selectedPosition?.department || '',
        location: selectedPosition?.location || '',
        status: 'new',
        appliedAt: new Date().toISOString(),
        
        // Personal data
        personalData: {
            prefix: document.getElementById('prefix').value,
            firstName: document.getElementById('firstName').value,
            lastName: document.getElementById('lastName').value,
            nickname: document.getElementById('nickname').value,
            birthDate: document.getElementById('birthDate').value,
            idCard: document.getElementById('idCard').value,
            phone: document.getElementById('phone').value,
            email: document.getElementById('email').value,
            address: document.getElementById('address').value
        },
        
        // Education
        education: {
            level: document.getElementById('education').value,
            institution: document.getElementById('institution').value,
            major: document.getElementById('major').value,
            gpa: document.getElementById('gpa').value,
            gradYear: document.getElementById('gradYear').value
        },
        
        // Experience
        experience: {
            years: document.getElementById('experienceYears').value,
            history: document.getElementById('workHistory').value,
            skills: document.getElementById('skills').value
        },
        
        // Documents
        documents: {
            resume: localStorage.getItem('temp_resume_file') ? JSON.parse(localStorage.getItem('temp_resume_file')) : null
        }
    };
    
    // Save to localStorage (in real app, send to server)
    const applications = JSON.parse(localStorage.getItem('pkg_applications') || '[]');
    applications.push(applicationData);
    localStorage.setItem('pkg_applications', JSON.stringify(applications));
    
    // Create notification
    createNotification(
        currentUser.id,
        'ส่งใบสมัครสำเร็จ',
        `ใบสมัครตำแหน่ง ${applicationData.positionTitle} ถูกส่งเรียบร้อยแล้ว`,
        'application_success'
    );
    
    // Clean up temp data
    localStorage.removeItem('temp_resume_file');
    
    // Show success message
    showSuccessMessage(applicationData);
}

// ===== CREATE NOTIFICATION =====
function createNotification(userId, title, message, type) {
    const notifications = JSON.parse(localStorage.getItem('pkg_notifications') || '[]');
    
    notifications.push({
        id: 'NOTIF-' + Date.now(),
        userId: userId,
        title: title,
        message: message,
        type: type,
        read: false,
        createdAt: new Date().toISOString()
    });
    
    localStorage.setItem('pkg_notifications', JSON.stringify(notifications));
}

// ===== SHOW SUCCESS MESSAGE =====
function showSuccessMessage(applicationData) {
    // Hide form
    document.getElementById('applicationForm').classList.add('hidden');
    
    // Show success message
    const successHTML = `
        <div class="bg-white rounded-xl shadow-lg p-8 text-center">
            <div class="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <i class="fas fa-check text-green-600 text-4xl"></i>
            </div>
            <h2 class="text-2xl font-bold text-gray-800 mb-4">ส่งใบสมัครสำเร็จ!</h2>
            <p class="text-gray-600 mb-6">
                ใบสมัครของคุณถูกส่งเรียบร้อยแล้ว<br>
                ตำแหน่ง: <strong>${applicationData.positionTitle}</strong>
            </p>
            
            <div class="bg-blue-50 border-l-4 border-blue-400 p-4 text-left mb-6">
                <div class="flex items-start">
                    <i class="fas fa-info-circle text-blue-600 mr-2 mt-1"></i>
                    <div class="text-sm text-blue-700">
                        <p class="font-semibold mb-2">ขั้นตอนถัดไป:</p>
                        <ol class="list-decimal list-inside space-y-1">
                            <li>HR จะตรวจสอบใบสมัครของคุณ</li>
                            <li>หากผ่านการคัดกรอง คุณจะได้รับการแจ้งเตือนให้ทำแบบทดสอบ</li>
                            <li>ทำแบบทดสอบ 4 ชุด (ทัศนคติ, ทักษะ, CC, 3E3P)</li>
                            <li>รอผลการประเมินและนัดสัมภาษณ์</li>
                        </ol>
                    </div>
                </div>
            </div>
            
            <div class="flex space-x-4 justify-center">
                <button onclick="window.location.href='applicant-dashboard.html'" 
                        class="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition">
                    <i class="fas fa-tachometer-alt mr-2"></i>กลับหน้า Dashboard
                </button>
                <button onclick="window.location.href='positions.html'" 
                        class="bg-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-400 transition">
                    <i class="fas fa-search mr-2"></i>ดูตำแหน่งงานอื่น
                </button>
            </div>
        </div>
    `;
    
    document.querySelector('.max-w-4xl').innerHTML = successHTML;
}

// ===== UTILITY FUNCTIONS =====
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('th-TH', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

function formatDateTime(dateString) {
    const date = new Date(dateString);
    return date.toLocaleString('th-TH', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}
