// Applicant Dashboard Functions
// ฟังก์ชันสำหรับ Dashboard ผู้สมัคร

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    loadUserData();
    loadApplications();
    loadNotifications();
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
        if (currentUser.role !== 'applicant') {
            alert('ไม่มีสิทธิ์เข้าถึงหน้านี้');
            window.location.href = '../index.html';
            return;
        }
    } catch (e) {
        localStorage.removeItem(CONFIG.STORAGE_KEY);
        window.location.href = '../index.html';
    }
}

// ===== LOAD USER DATA =====
function loadUserData() {
    if (!currentUser) return;
    
    document.getElementById('userName').textContent = currentUser.name;
    document.getElementById('welcomeName').textContent = currentUser.name.split(' ')[0];
    document.getElementById('userAvatar').textContent = currentUser.name.charAt(0).toUpperCase();
}

// ===== LOAD APPLICATIONS =====
function loadApplications() {
    const applications = JSON.parse(localStorage.getItem('pkg_applications') || '[]');
    const userApplications = applications.filter(app => app.userId === currentUser.id);
    
    document.getElementById('totalApplications').textContent = userApplications.length;
    
    const pending = userApplications.filter(app => 
        ['new', 'screened', 'test_sent'].includes(app.status)
    ).length;
    document.getElementById('pendingApplications').textContent = pending;
    
    const pendingTests = userApplications.filter(app => 
        app.status === 'test_sent' && !app.testCompleted
    ).length;
    document.getElementById('pendingTests').textContent = pendingTests;
    
    const applicationsList = document.getElementById('applicationsList');
    const noApplications = document.getElementById('noApplications');
    
    if (userApplications.length === 0) {
        applicationsList.classList.add('hidden');
        noApplications.classList.remove('hidden');
        return;
    }
    
    applicationsList.classList.remove('hidden');
    noApplications.classList.add('hidden');
    
    applicationsList.innerHTML = userApplications.map(app => `
        <div class="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
            <div class="flex justify-between items-start mb-3">
                <div>
                    <h3 class="text-lg font-semibold text-gray-800">${app.positionTitle}</h3>
                    <p class="text-sm text-gray-500">
                        <i class="fas fa-calendar-alt mr-1"></i>สมัครเมื่อ: ${formatDate(app.appliedAt)}
                    </p>
                </div>
                ${getStatusBadge(app.status)}
            </div>
            <div class="flex space-x-4 text-sm text-gray-600 mb-3">
                <span><i class="fas fa-building mr-1"></i>${app.department}</span>
                <span><i class="fas fa-map-marker-alt mr-1"></i>${app.location}</span>
            </div>
            <div class="flex space-x-2">
                ${getActionButtons(app)}
            </div>
        </div>
    `).join('');
}

// ===== GET ACTION BUTTONS =====
function getActionButtons(app) {
    const buttons = [];
    
    // View details button
    buttons.push(`
        <button onclick="viewApplication('${app.id}')" 
                class="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition text-sm">
            <i class="fas fa-eye mr-1"></i>ดูรายละเอียด
        </button>
    `);
    
    // Take test button
    if (app.status === 'test_sent' && !app.testCompleted) {
        buttons.push(`
            <button onclick="startTest('${app.id}')" 
                    class="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition text-sm">
                <i class="fas fa-pencil-alt mr-1"></i>ทำแบบทดสอบ
            </button>
        `);
    }
    
    // Confirm interview button
    if (app.status === 'interview_scheduled' && !app.interviewConfirmed) {
        buttons.push(`
            <button onclick="confirmInterview('${app.id}')" 
                    class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm">
                <i class="fas fa-check mr-1"></i>ยืนยันนัดสัมภาษณ์
            </button>
        `);
    }
    
    return buttons.join('');
}

// ===== LOAD NOTIFICATIONS =====
function loadNotifications() {
    const notifications = JSON.parse(localStorage.getItem('pkg_notifications') || '[]');
    const userNotifications = notifications.filter(notif => notif.userId === currentUser.id);
    
    document.getElementById('notifications').textContent = userNotifications.filter(n => !n.read).length;
    
    const notificationsList = document.getElementById('notificationsList');
    const noNotifications = document.getElementById('noNotifications');
    
    if (userNotifications.length === 0) {
        notificationsList.classList.add('hidden');
        noNotifications.classList.remove('hidden');
        return;
    }
    
    notificationsList.classList.remove('hidden');
    noNotifications.classList.add('hidden');
    
    notificationsList.innerHTML = userNotifications.slice(0, 5).map(notif => `
        <div class="flex items-start space-x-3 p-3 rounded-lg ${notif.read ? 'bg-gray-50' : 'bg-purple-50'}">
            <div class="w-10 h-10 ${notif.read ? 'bg-gray-200' : 'bg-purple-600'} rounded-full flex items-center justify-center flex-shrink-0">
                <i class="fas ${getNotificationIcon(notif.type)} ${notif.read ? 'text-gray-500' : 'text-white'}"></i>
            </div>
            <div class="flex-1">
                <p class="font-semibold ${notif.read ? 'text-gray-600' : 'text-gray-800'}">${notif.title}</p>
                <p class="text-sm ${notif.read ? 'text-gray-500' : 'text-gray-600'}">${notif.message}</p>
                <p class="text-xs text-gray-400 mt-1">${formatDateTime(notif.createdAt)}</p>
            </div>
            ${!notif.read ? `
                <button onclick="markAsRead('${notif.id}')" class="text-purple-600 hover:text-purple-800">
                    <i class="fas fa-check"></i>
                </button>
            ` : ''}
        </div>
    `).join('');
}

// ===== GET NOTIFICATION ICON =====
function getNotificationIcon(type) {
    const icons = {
        'test_ready': 'fa-tasks',
        'interview_invite': 'fa-calendar-check',
        'result': 'fa-award',
        'message': 'fa-comment'
    };
    return icons[type] || 'fa-bell';
}

// ===== MARK AS READ =====
function markAsRead(notifId) {
    const notifications = JSON.parse(localStorage.getItem('pkg_notifications') || '[]');
    const notif = notifications.find(n => n.id === notifId);
    
    if (notif) {
        notif.read = true;
        localStorage.setItem('pkg_notifications', JSON.stringify(notifications));
        loadNotifications();
    }
}

// ===== VIEW APPLICATION =====
function viewApplication(appId) {
    const applications = JSON.parse(localStorage.getItem('pkg_applications') || '[]');
    const app = applications.find(a => a.id === appId);
    
    if (!app) return;
    
    alert(`
รายละเอียดใบสมัคร
-----------------
ตำแหน่ง: ${app.positionTitle}
สถานะ: ${getStatusText(app.status)}
สมัครเมื่อ: ${formatDateTime(app.appliedAt)}

ข้อมูลผู้สมัคร:
ชื่อ: ${app.personalData.name}
Email: ${app.personalData.email}
เบอร์โทร: ${app.personalData.phone}

การศึกษา: ${app.personalData.education}
ประสบการณ์: ${app.personalData.experience} ปี
    `);
}

// ===== START TEST =====
function startTest(appId) {
    window.location.href = `test.html?applicationId=${appId}`;
}

// ===== CONFIRM INTERVIEW =====
function confirmInterview(appId) {
    if (confirm('ยืนยันการเข้าสัมภาษณ์?')) {
        const applications = JSON.parse(localStorage.getItem('pkg_applications') || '[]');
        const app = applications.find(a => a.id === appId);
        
        if (app) {
            app.interviewConfirmed = true;
            app.status = 'interview_confirmed';
            localStorage.setItem('pkg_applications', JSON.stringify(applications));
            
            alert('ยืนยันการเข้าสัมภาษณ์สำเร็จ');
            loadApplications();
        }
    }
}

// ===== GET STATUS TEXT =====
function getStatusText(status) {
    const statuses = {
        'new': 'ใบสมัครใหม่',
        'screened': 'คัดกรองแล้ว',
        'test_sent': 'ส่งแบบทดสอบแล้ว',
        'test_done': 'ทำแบบทดสอบเสร็จ',
        'interview_scheduled': 'นัดสัมภาษณ์',
        'interview_confirmed': 'ยืนยันการสัมภาษณ์',
        'interviewed': 'สัมภาษณ์แล้ว',
        'hired': 'จ้างงาน',
        'rejected': 'ไม่ผ่าน'
    };
    return statuses[status] || status;
}

// ===== CHATBOT FUNCTIONS =====
function showChatbot() {
    document.getElementById('chatbotModal').classList.remove('hidden');
    loadChatMessages();
}

function closeChatbot() {
    document.getElementById('chatbotModal').classList.add('hidden');
}

function loadChatMessages() {
    const messages = JSON.parse(localStorage.getItem('pkg_chat_messages') || '[]');
    const userMessages = messages.filter(msg => 
        msg.senderId === currentUser.id || msg.receiverId === currentUser.id
    );
    
    const chatMessages = document.getElementById('chatMessages');
    
    if (userMessages.length === 0) {
        chatMessages.innerHTML = `
            <div class="text-center text-gray-500 py-8">
                <i class="fas fa-robot text-4xl mb-3"></i>
                <p>สวัสดี! ฉันคือ PKG Assistant</p>
                <p class="text-sm">มีอะไรให้ช่วยไหม?</p>
            </div>
        `;
        return;
    }
    
    chatMessages.innerHTML = userMessages.map(msg => `
        <div class="flex ${msg.senderId === currentUser.id ? 'justify-end' : 'justify-start'}">
            <div class="max-w-[70%] ${msg.senderId === currentUser.id ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-800'} rounded-lg p-3">
                <p class="text-sm">${msg.message}</p>
                <p class="text-xs ${msg.senderId === currentUser.id ? 'text-purple-200' : 'text-gray-500'} mt-1">
                    ${formatDateTime(msg.createdAt)}
                </p>
            </div>
        </div>
    `).join('');
    
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function sendMessage() {
    const input = document.getElementById('chatInput');
    const message = input.value.trim();
    
    if (!message) return;
    
    const messages = JSON.parse(localStorage.getItem('pkg_chat_messages') || '[]');
    
    // Add user message
    const userMsg = {
        id: 'MSG-' + Date.now(),
        senderId: currentUser.id,
        receiverId: 'HR',
        message: message,
        createdAt: new Date().toISOString()
    };
    
    messages.push(userMsg);
    localStorage.setItem('pkg_chat_messages', JSON.stringify(messages));
    
    input.value = '';
    loadChatMessages();
    
    // Auto reply (simulate chatbot)
    setTimeout(() => {
        const botMsg = {
            id: 'MSG-' + (Date.now() + 1),
            senderId: 'HR',
            receiverId: currentUser.id,
            message: getAutoReply(message),
            createdAt: new Date().toISOString()
        };
        
        messages.push(botMsg);
        localStorage.setItem('pkg_chat_messages', JSON.stringify(messages));
        loadChatMessages();
    }, 1000);
}

function getAutoReply(message) {
    const lowerMsg = message.toLowerCase();
    
    if (lowerMsg.includes('สถานะ') || lowerMsg.includes('ใบสมัคร')) {
        return 'คุณสามารถตรวจสอบสถานะใบสมัครได้ที่หน้า Dashboard ในส่วน "ใบสมัครของฉัน"';
    } else if (lowerMsg.includes('แบบทดสอบ') || lowerMsg.includes('ทดสอบ')) {
        return 'แบบทดสอบประกอบด้วย 4 ส่วน: ทัศนคติ, ทักษะ, CC 7 ด้าน, และ 3E3P ใช้เวลาประมาณ 45 นาที';
    } else if (lowerMsg.includes('สัมภาษณ์') || lowerMsg.includes('นัด')) {
        return 'การสัมภาษณ์จะจัดขึ้นหลังจากคุณทำแบบทดสอบเสร็จแล้ว HR จะแจ้งวันเวลาผ่านทางระบบ';
    } else if (lowerMsg.includes('เงินเดือน') || lowerMsg.includes('ค่าตอบแทน')) {
        return 'เงินเดือนจะขึ้นอยู่กับตำแหน่งและประสบการณ์ คุณสามารถดูรายละเอียดได้ที่หน้าตำแหน่งงาน';
    } else if (lowerMsg.includes('เอกสาร') || lowerMsg.includes('เตรียม')) {
        return 'เอกสารที่ต้องเตรียม: บัตรประชาชน, วุฒิการศึกษา, ใบผ่านงาน (ถ้ามี), รูปถ่าย';
    } else {
        return 'ขอบคุณสำหรับข้อความ HR จะติดต่อกลับโดยเร็วที่สุด หรือคุณสามารถดูข้อมูลเพิ่มเติมได้ที่หน้าคำถามที่พบบ่อย';
    }
}
