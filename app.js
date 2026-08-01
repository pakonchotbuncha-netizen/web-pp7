// PKG Recruitment - Main Application
// ระบบรับสมัครงานระดับสากล

// ===== CONFIGURATION =====
const CONFIG = {
    API_URL: 'https://script.google.com/macros/s/AKfycbz...', // จะเปลี่ยนเป็น URL จริงเมื่อ deploy GAS
    STORAGE_KEY: 'pkg_recruitment_user',
    OTP_EXPIRY: 5 * 60 * 1000 // 5 นาที
};

// ===== STATE =====
let currentUser = null;
let otpSent = false;
let otpExpiry = null;

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', () => {
    checkLoginStatus();
});

// ===== AUTH FUNCTIONS =====
function checkLoginStatus() {
    const stored = localStorage.getItem(CONFIG.STORAGE_KEY);
    if (stored) {
        try {
            currentUser = JSON.parse(stored);
            // Redirect to dashboard if logged in
            if (currentUser.role === 'applicant') {
                window.location.href = 'applicant-dashboard.html';
            } else if (currentUser.role === 'hr') {
                window.location.href = 'hr-dashboard.html';
            }
        } catch (e) {
            localStorage.removeItem(CONFIG.STORAGE_KEY);
        }
    }
}

function showLogin() {
    document.getElementById('loginModal').classList.remove('hidden');
    document.getElementById('registerModal').classList.add('hidden');
}

function showRegister() {
    document.getElementById('registerModal').classList.remove('hidden');
    document.getElementById('loginModal').classList.add('hidden');
}

function closeModals() {
    document.getElementById('loginModal').classList.add('hidden');
    document.getElementById('registerModal').classList.add('hidden');
}

// ===== OTP SYSTEM =====
function sendOTP() {
    const phone = document.getElementById('regPhone').value;
    if (!phone || phone.length < 9) {
        alert('กรุณากรอกเบอร์โทรศัพท์ให้ถูกต้อง');
        return;
    }

    // Generate OTP (ใน production ต้องส่ง SMS จริง)
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Store OTP with expiry
    localStorage.setItem('temp_otp', otp);
    localStorage.setItem('temp_phone', phone);
    otpExpiry = Date.now() + CONFIG.OTP_EXPIRY;
    localStorage.setItem('otp_expiry', otpExpiry);
    
    // แสดง OTP (ใน production จะส่ง SMS)
    alert(`รหัส OTP ของคุณคือ: ${otp}\n(ระบบจะส่ง SMS ในเวอร์ชันจริง)`);
    
    otpSent = true;
    document.getElementById('regOTP').focus();
}

function verifyOTP(inputOTP) {
    const storedOTP = localStorage.getItem('temp_otp');
    const expiry = parseInt(localStorage.getItem('otp_expiry'));
    
    if (!storedOTP || !expiry) {
        alert('กรุณาส่ง OTP ก่อน');
        return false;
    }
    
    if (Date.now() > expiry) {
        alert('OTP หมดอายุ กรุณาส่งใหม่');
        return false;
    }
    
    if (inputOTP !== storedOTP) {
        alert('OTP ไม่ถูกต้อง');
        return false;
    }
    
    return true;
}

// ===== REGISTRATION =====
async function handleRegister(event) {
    event.preventDefault();
    
    const phone = document.getElementById('regPhone').value;
    const otp = document.getElementById('regOTP').value;
    const password = document.getElementById('regPassword').value;
    const name = document.getElementById('regName').value;
    const email = document.getElementById('regEmail').value;
    
    // Verify OTP
    if (!verifyOTP(otp)) {
        return;
    }
    
    // Check if phone already exists
    const users = JSON.parse(localStorage.getItem('pkg_users') || '[]');
    if (users.find(u => u.phone === phone)) {
        alert('เบอร์โทรศัพท์นี้ถูกลงทะเบียนแล้ว');
        return;
    }
    
    // Create user
    const newUser = {
        id: 'USR-' + Date.now(),
        phone: phone,
        password: btoa(password), // Base64 encode (ใน production ต้อง hash)
        name: name,
        email: email,
        role: 'applicant',
        createdAt: new Date().toISOString(),
        status: 'active'
    };
    
    users.push(newUser);
    localStorage.setItem('pkg_users', JSON.stringify(users));
    
    // Auto login
    currentUser = newUser;
    localStorage.setItem(CONFIG.STORAGE_KEY, JSON.stringify(newUser));
    
    // Clean up OTP
    localStorage.removeItem('temp_otp');
    localStorage.removeItem('temp_phone');
    localStorage.removeItem('otp_expiry');
    
    alert('ลงทะเบียนสำเร็จ! กำลังเข้าสู่ระบบ...');
    
    // Redirect to applicant dashboard
    setTimeout(() => {
        window.location.href = 'applicant-dashboard.html';
    }, 1000);
}

// ===== LOGIN =====
async function handleLogin(event) {
    event.preventDefault();
    
    const phone = document.getElementById('loginPhone').value;
    const password = document.getElementById('loginPassword').value;
    
    const users = JSON.parse(localStorage.getItem('pkg_users') || '[]');
    const user = users.find(u => u.phone === phone && u.password === btoa(password));
    
    if (!user) {
        alert('เบอร์โทรศัพท์หรือรหัสผ่านไม่ถูกต้อง');
        return;
    }
    
    if (user.status !== 'active') {
        alert('บัญชีนี้ถูกปิดใช้งาน กรุณาติดต่อ HR');
        return;
    }
    
    // Login success
    currentUser = user;
    localStorage.setItem(CONFIG.STORAGE_KEY, JSON.stringify(user));
    
    alert('เข้าสู่ระบบสำเร็จ!');
    
    // Redirect based on role
    setTimeout(() => {
        if (user.role === 'applicant') {
            window.location.href = 'applicant-dashboard.html';
        } else if (user.role === 'hr') {
            window.location.href = 'hr-dashboard.html';
        }
    }, 1000);
}

// ===== LOGOUT =====
function logout() {
    if (confirm('ต้องการออกจากระบบหรือไม่?')) {
        localStorage.removeItem(CONFIG.STORAGE_KEY);
        currentUser = null;
        window.location.href = 'index.html';
    }
}

// ===== CREATE HR ACCOUNT =====
function createHR() {
    const phone = prompt('กรอกเบอร์โทร HR:');
    if (!phone) return;
    
    const password = prompt('กรอกรหัสผ่าน:');
    if (!password) return;
    
    const name = prompt('กรอกชื่อ-นามสกุล:');
    if (!name) return;
    
    const email = prompt('กรอก Email:');
    if (!email) return;
    
    const users = JSON.parse(localStorage.getItem('pkg_users') || '[]');
    
    if (users.find(u => u.phone === phone)) {
        alert('เบอร์โทรศัพท์นี้ถูกลงทะเบียนแล้ว');
        return;
    }
    
    const newHR = {
        id: 'HR-' + Date.now(),
        phone: phone,
        password: btoa(password),
        name: name,
        email: email,
        role: 'hr',
        createdAt: new Date().toISOString(),
        status: 'active'
    };
    
    users.push(newHR);
    localStorage.setItem('pkg_users', JSON.stringify(users));
    
    alert(`สร้างบัญชี HR สำเร็จ!\n\nเบอร์: ${phone}\nรหัสผ่าน: ${password}\n\nกรุณาเข้าสู่ระบบเพื่อใช้งาน HR Dashboard`);
}

// ===== NAVIGATION =====
function showPositions() {
    window.location.href = 'pages/positions.html';
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

function getStatusBadge(status) {
    const badges = {
        'new': { class: 'bg-blue-100 text-blue-800', text: 'ใหม่' },
        'screened': { class: 'bg-yellow-100 text-yellow-800', text: 'คัดกรองแล้ว' },
        'test_sent': { class: 'bg-orange-100 text-orange-800', text: 'ส่งแบบทดสอบแล้ว' },
        'test_done': { class: 'bg-purple-100 text-purple-800', text: 'ทำแบบทดสอบเสร็จ' },
        'interview_scheduled': { class: 'bg-indigo-100 text-indigo-800', text: 'นัดสัมภาษณ์' },
        'interviewed': { class: 'bg-green-100 text-green-800', text: 'สัมภาษณ์แล้ว' },
        'hired': { class: 'bg-green-600 text-white', text: 'จ้างงาน' },
        'rejected': { class: 'bg-red-100 text-red-800', text: 'ไม่ผ่าน' }
    };
    
    const badge = badges[status] || badges['new'];
    return `<span class="px-3 py-1 rounded-full text-sm font-medium ${badge.class}">${badge.text}</span>`;
}
