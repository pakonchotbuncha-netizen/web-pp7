/**
 * PP7 Main Layout — Application Logic
 * จัดการ navigation, authentication, RBAC และ sidebar
 */

// ============================================================
// CONFIGURATION
// ============================================================

/**
 * Module map — mapping menu IDs to HTML file paths
 * แต่ละ module จะถูกโหลดใน iframe แยก
 */
const MODULE_MAP = {
  'dashboard':           'modules/p4-dashboard.html',
  'p1-headcount':        'modules/p1-headcount.html',
  'p1-candidates':       'modules/p1-candidates.html',
  'p2-interviews':       'modules/p2-interviews.html',
  'p2-assessment':       'modules/p2-assessment.html',
  'p3-matching':         'modules/p3-matching.html',
  'p4-evaluation':       'modules/p4-evaluation.html',
  'p4-evaluation-360':   'modules/p4-evaluation-360.html',
  'p4-dashboard':        'modules/p4-dashboard.html'
  // P5-P7 จะเพิ่มทีหลังเมื่อสร้าง modules เสร็จ
};

/**
 * Mock User Data สำหรับทดสอบ (Dev Mode)
 * จะใช้เมื่อ API backend ยังไม่พร้อม
 */
const MOCK_USERS = {
  admin: {
    id: 'admin-001',
    name: 'Admin User',
    display_name: 'Admin User',
    email: 'admin@pp7.local',
    role: 'admin',
    bu: 'HR',
    business_unit_id: 'BU-001',
    permissions: ['all']
  },
  hr_manager: {
    id: 'hr-001',
    name: 'HR Manager',
    display_name: 'Somchai HR',
    email: 'hr@pp7.local',
    role: 'hr_manager',
    bu: 'HR',
    business_unit_id: 'BU-001',
    permissions: ['P1', 'P2', 'P3', 'P4', 'P5', 'P6', 'P7', 'dashboard']
  },
  bu_manager: {
    id: 'bu-001',
    name: 'BU Manager',
    display_name: 'Prasit Manager',
    email: 'bu@pp7.local',
    role: 'bu_manager',
    bu: 'IT',
    business_unit_id: 'BU-002',
    permissions: ['P1', 'P2', 'P3', 'P4', 'dashboard']
  },
  employee: {
    id: 'emp-001',
    name: 'Employee',
    display_name: 'Mana Employee',
    email: 'emp@pp7.local',
    role: 'employee',
    bu: 'IT',
    business_unit_id: 'BU-002',
    permissions: ['P4', 'dashboard']
  },
  auditor: {
    id: 'aud-001',
    name: 'Auditor',
    display_name: 'Viriya Auditor',
    email: 'audit@pp7.local',
    role: 'auditor',
    bu: 'HR',
    business_unit_id: 'BU-001',
    permissions: ['dashboard', 'audit_log']
  },
  guest: {
    id: 'guest-001',
    name: 'Guest',
    display_name: 'Guest User',
    email: 'guest@pp7.local',
    role: 'guest',
    bu: null,
    business_unit_id: null,
    permissions: ['dashboard']
  }
};

/**
 * Sidebar Menu Structure
 * menuId → ต้องตรงกับ key ใน MODULE_MAP
 * roles → roles ที่สามารถเข้าถึงได้ (ถ้าไม่มี = ทุก role)
 */
const SIDEBAR_MENU = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: '📊',
    module: 'dashboard',
    section: 'overview'
  },
  // ---- P1: แสวงหา ----
  { type: 'divider' },
  {
    id: 'p1',
    label: 'P1 — แสวงหา',
    icon: '🔍',
    section: 'p1',
    roles: ['admin', 'hr_manager', 'bu_manager', 'auditor'],
    items: [
      {
        id: 'p1-headcount',
        label: 'อัตรากำลัง (HC)',
        module: 'p1-headcount',
        roles: ['admin', 'hr_manager', 'bu_manager', 'employee', 'auditor'],
        badge: { count: 3, type: 'warning' }
      },
      {
        id: 'p1-candidates',
        label: 'ผู้สมัคร',
        module: 'p1-candidates',
        roles: ['admin', 'hr_manager', 'bu_manager', 'auditor'],
        badge: { count: 12, type: 'info' }
      }
    ]
  },
  // ---- P2: หยั่งประเมิน ----
  { type: 'divider' },
  {
    id: 'p2',
    label: 'P2 — หยั่งประเมิน',
    icon: '📝',
    section: 'p2',
    roles: ['admin', 'hr_manager', 'bu_manager', 'auditor'],
    items: [
      {
        id: 'p2-interviews',
        label: 'สัมภาษณ์',
        module: 'p2-interviews',
        roles: ['admin', 'hr_manager', 'bu_manager', 'auditor'],
        badge: { count: 5, type: 'warning' }
      },
      {
        id: 'p2-assessment',
        label: 'ประเมินผล',
        module: 'p2-assessment',
        roles: ['admin', 'hr_manager', 'auditor']
      }
    ]
  },
  // ---- P3: จับคู่คนกับงาน ----
  { type: 'divider' },
  {
    id: 'p3',
    label: 'P3 — จับคู่คนกับงาน',
    icon: '🎯',
    section: 'p3',
    roles: ['admin', 'hr_manager', 'bu_manager', 'auditor'],
    items: [
      {
        id: 'p3-matching',
        label: 'จับคู่ตำแหน่ง',
        module: 'p3-matching',
        roles: ['admin', 'hr_manager', 'auditor']
      }
    ]
  },
  // ---- P4: ประเมินผล ----
  { type: 'divider' },
  {
    id: 'p4',
    label: 'P4 — ประเมินผล',
    icon: '📈',
    section: 'p4',
    roles: ['admin', 'hr_manager', 'bu_manager', 'employee', 'auditor'],
    items: [
      {
        id: 'p4-evaluation',
        label: 'ประเมินผลงาน',
        module: 'p4-evaluation',
        roles: ['admin', 'hr_manager', 'bu_manager', 'auditor']
      },
      {
        id: 'p4-evaluation-360',
        label: 'ประเมิน 360°',
        module: 'p4-evaluation-360',
        roles: ['admin', 'hr_manager', 'bu_manager', 'employee', 'auditor']
      },
      {
        id: 'p4-dashboard',
        label: 'Dashboard ผลงาน',
        module: 'p4-dashboard',
        roles: ['admin', 'hr_manager', 'bu_manager', 'auditor']
      }
    ]
  },
  // ---- P5: พัฒนา (Coming Soon) ----
  { type: 'divider' },
  {
    id: 'p5',
    label: 'P5 — พัฒนา',
    icon: '🎓',
    section: 'p5',
    comingSoon: true,
    roles: ['admin', 'hr_manager', 'employee']
  },
  // ---- P6: ค่าตอบแทน (Coming Soon) ----
  { type: 'divider' },
  {
    id: 'p6',
    label: 'P6 — ค่าตอบแทน',
    icon: '💰',
    section: 'p6',
    comingSoon: true,
    roles: ['admin', 'hr_manager', 'employee']
  },
  // ---- P7: คุณภาพชีวิต (Coming Soon) ----
  { type: 'divider' },
  {
    id: 'p7',
    label: 'P7 — คุณภาพชีวิต',
    icon: '🌿',
    section: 'p7',
    comingSoon: true,
    roles: ['admin', 'hr_manager', 'employee']
  },
  // ---- Admin ----
  { type: 'divider' },
  {
    id: 'admin',
    label: '⚙️ Admin',
    icon: '⚙️',
    section: 'admin',
    roles: ['admin', 'hr_manager'],
    items: [
      {
        id: 'admin-users',
        label: 'จัดการผู้ใช้',
        roles: ['admin'],
        disabled: true
      },
      {
        id: 'admin-settings',
        label: 'ตั้งค่าระบบ',
        roles: ['admin', 'hr_manager'],
        disabled: true
      },
      {
        id: 'admin-audit',
        label: 'Audit Log',
        roles: ['admin', 'auditor'],
        disabled: true
      }
    ]
  }
];

/**
 * Role display names (ภาษาไทย)
 */
const ROLE_LABELS = {
  admin: 'ผู้ดูแลระบบ',
  hr_manager: 'ผู้จัดการ HR',
  bu_manager: 'ผู้จัดการ BU',
  employee: 'พนักงาน',
  auditor: 'ผู้ตรวจสอบ',
  guest: 'ผู้เยี่ยมชม'
};

// ============================================================
// STATE
// ============================================================

/** สถานะปัจจุบันของ application */
let appState = {
  user: null,            // ข้อมูล user ที่ login อยู่
  currentModule: null,   // module ที่กำลังแสดงผล
  sidebarOpen: true,     // สถานะ sidebar (desktop)
  mobileMenuOpen: false, // สถานะ mobile menu
  isDevMode: true        // true = ใช้ mock data
};

// ============================================================
// INITIALIZATION
// ============================================================

/**
 * เริ่มต้น application เมื่อ DOM พร้อม
 */
document.addEventListener('DOMContentLoaded', function() {
  initApp();
});

function initApp() {
  // อัพเดท footer timestamp
  updateFooterTimestamp();
  
  // ตรวจสอบว่ามี token อยู่หรือไม่
  var existingUser = PP7API ? PP7API.getUser() : null;
  var existingToken = PP7API ? PP7API.getToken() : null;
  
  if (existingUser && existingToken) {
    // มี session อยู่แล้ว → เข้าระบบเลย
    appState.user = existingUser;
    showMainApp();
  } else if (appState.isDevMode) {
    // Dev mode → แสดง login screen
    showLoginScreen();
  } else {
    showLoginScreen();
  }
  
  // ปิด dropdown เมื่อ click ภายนอก
  document.addEventListener('click', handleOutsideClick);
  
  // Handle resize
  window.addEventListener('resize', handleResize);
}

// ============================================================
// AUTHENTICATION
// ============================================================

/**
 * แสดง Login Screen
 */
function showLoginScreen() {
  document.getElementById('loginScreen').classList.remove('hidden');
  document.getElementById('mainApp').classList.add('hidden');
}

/**
 * แสดง Main App หลัง login สำเร็จ
 */
function showMainApp() {
  document.getElementById('loginScreen').classList.add('hidden');
  document.getElementById('mainApp').classList.remove('hidden');
  
  // อัพเดท UI ตาม user info
  updateHeaderUserInfo();
  
  // Render sidebar ตาม role
  renderSidebar();
  
  // navigate ไปหน้า dashboard หรือหน้าที่บันทึกไว้
  var savedModule = sessionStorage.getItem('pp7_currentModule');
  var defaultModule = 'dashboard';
  
  // ตรวจสอบว่า user สามารถเข้าถึง default module ได้หรือไม่
  if (appState.user && appState.user.role === 'auditor') {
    defaultModule = 'dashboard';
  }
  
  var targetModule = savedModule || defaultModule;
  navigateTo(targetModule);
}

/**
 * จัดการ Login (real API)
 */
async function handleLogin(event) {
  event.preventDefault();
  
  var email = document.getElementById('loginEmail').value.trim();
  var password = document.getElementById('loginPassword').value;
  
  if (!email || !password) {
    showLoginAlert('กรุณากรอกอีเมลและรหัสผ่าน', 'error');
    return;
  }
  
  // แสดง loading state
  setLoginLoading(true);
  
  try {
    // เรียก API login
    var result = await PP7API.login(email, password);
    
    if (result.success) {
      appState.user = result.user;
      showLoginAlert('เข้าสู่ระบบสำเร็จ!', 'success');
      
      // Delay เล็กน้อยเพื่อแสดง success message
      setTimeout(function() {
        showMainApp();
      }, 500);
    } else {
      showLoginAlert(result.error || 'เข้าสู่ระบบไม่สำเร็จ', 'error');
      setLoginLoading(false);
    }
  } catch (error) {
    showLoginAlert('เกิดข้อผิดพลาดในการเชื่อมต่อ: ' + error.message, 'error');
    setLoginLoading(false);
  }
}

/**
 * Mock Login สำหรับ Dev Mode
 */
function handleMockLogin() {
  var role = 'admin'; // Default mock login as admin
  
  var mockUser = MOCK_USERS[role];
  if (!mockUser) return;
  
  // เก็บข้อมูล user
  appState.user = mockUser;
  
  // เก็บลง localStorage (จำลอง token)
  localStorage.setItem('pp7_auth_token', 'mock_token_' + Date.now());
  localStorage.setItem('pp7_auth_user', JSON.stringify(mockUser));
  
  if (PP7API) {
    PP7API.setToken('mock_token_' + Date.now());
    PP7API.setUser(mockUser);
  }
  
  showMainApp();
}

/**
 * Logout
 */
async function handleLogout() {
  // เรียก API logout (ถ้ามี)
  try {
    if (PP7API && PP7API.getToken() && !PP7API.getToken().startsWith('mock_')) {
      await PP7API.logout();
    }
  } catch (e) {
    // ignore errors
  }
  
  // ลบข้อมูล auth
  appState.user = null;
  appState.currentModule = null;
  
  if (PP7API) {
    PP7API.clearAuth();
  } else {
    localStorage.removeItem('pp7_auth_token');
    localStorage.removeItem('pp7_auth_user');
  }
  
  sessionStorage.removeItem('pp7_currentModule');
  
  // กลับไปหน้า login
  showLoginScreen();
  
  // Reset form
  document.getElementById('loginEmail').value = '';
  document.getElementById('loginPassword').value = '';
  setLoginLoading(false);
  hideLoginAlert();
}

/** แสดง/ซ่อน login alert */
function showLoginAlert(message, type) {
  var alert = document.getElementById('loginAlert');
  alert.classList.remove('hidden');
  alert.className = 'mb-4 p-3 rounded-lg text-sm ';
  
  if (type === 'error') {
    alert.className += 'bg-red-50 text-red-700 border border-red-200';
  } else if (type === 'success') {
    alert.className += 'bg-green-50 text-green-700 border border-green-200';
  } else {
    alert.className += 'bg-blue-50 text-blue-700 border border-blue-200';
  }
  
  alert.textContent = message;
}

function hideLoginAlert() {
  document.getElementById('loginAlert').classList.add('hidden');
}

function setLoginLoading(loading) {
  var btn = document.getElementById('loginBtn');
  var text = document.getElementById('loginBtnText');
  var spinner = document.getElementById('loginSpinner');
  
  if (loading) {
    btn.disabled = true;
    text.textContent = 'กำลังเข้าสู่ระบบ...';
    spinner.classList.remove('hidden');
  } else {
    btn.disabled = false;
    text.textContent = 'เข้าสู่ระบบ';
    spinner.classList.add('hidden');
  }
}

function togglePassword() {
  var input = document.getElementById('loginPassword');
  if (input.type === 'password') {
    input.type = 'text';
  } else {
    input.type = 'password';
  }
}

// ============================================================
// SIDEBAR RENDERING
// ============================================================

/**
 * Render sidebar menu ตาม role ของ user
 */
function renderSidebar() {
  var container = document.getElementById('sidebarMenu');
  var userRole = appState.user ? appState.user.role : 'guest';
  var html = '';
  
  SIDEBAR_MENU.forEach(function(menuItem) {
    // Divider
    if (menuItem.type === 'divider') {
      html += '<div class="sidebar-divider"></div>';
      return;
    }
    
    // ตรวจสอบ role access
    if (menuItem.roles && !menuItem.roles.includes(userRole)) {
      return; // ซ่อน menu ที่ไม่มีสิทธิ์
    }
    
    // Section header (parent menu)
    if (menuItem.items) {
      html += renderMenuSection(menuItem, userRole);
    } else {
      // Single menu item (เช่น Dashboard)
      html += renderSingleMenuItem(menuItem, userRole);
    }
  });
  
  container.innerHTML = html;
}

/**
 * Render menu section ที่มี sub-items
 */
function renderMenuSection(menu, userRole) {
  var html = '';
  
  // Section label
  html += '<div class="sidebar-section-label">';
  html += '<span>' + menu.icon + '</span>';
  html += '<span>' + menu.label + '</span>';
  if (menu.comingSoon) {
    html += '<span class="sidebar-coming-soon">Coming Soon</span>';
  }
  html += '</div>';
  
  // Sub-items
  menu.items.forEach(function(item) {
    // ตรวจสอบ role access สำหรับ sub-item
    if (item.roles && !item.roles.includes(userRole)) {
      return;
    }
    
    var isActive = appState.currentModule === item.module || appState.currentModule === item.id;
    var isDisabled = item.disabled || false;
    
    html += '<div ';
    html += 'class="sidebar-menu-item';
    if (isActive) html += ' active';
    if (isDisabled) html += ' disabled';
    html += '" ';
    
    if (!isDisabled && item.module) {
      html += 'onclick="navigateTo(\'' + item.module + '\')" ';
    } else if (!isDisabled && item.id) {
      html += 'onclick="navigateTo(\'' + item.id + '\')" ';
    }
    
    html += '>';
    
    // Icon (ไม่มีสำหรับ sub-items, ใช้ dot)
    html += '<span class="sidebar-menu-icon text-xs">•</span>';
    
    // Label
    html += '<span class="sidebar-menu-text">' + item.label + '</span>';
    
    // Badge
    if (item.badge && item.badge.count) {
      var badgeClass = item.badge.type === 'info' ? 'info' : 
                       item.badge.type === 'warning' ? 'warning' : '';
      html += '<span class="sidebar-menu-badge ' + badgeClass + '">' + item.badge.count + '</span>';
    }
    
    // Coming Soon
    if (item.comingSoon) {
      html += '<span class="sidebar-coming-soon">Soon</span>';
    }
    
    // Tooltip for collapsed state
    html += '<span class="sidebar-tooltip">' + item.label + '</span>';
    
    html += '</div>';
  });
  
  return html;
}

/**
 * Render single menu item (ไม่มี sub-items)
 */
function renderSingleMenuItem(menu, userRole) {
  var isActive = (appState.currentModule === menu.module || appState.currentModule === menu.id);
  var isComingSoon = menu.comingSoon || false;
  
  var html = '<div ';
  html += 'class="sidebar-menu-item';
  if (isActive) html += ' active';
  if (isComingSoon) html += ' disabled';
  html += '" ';
  
  if (!isComingSoon && menu.module) {
    html += 'onclick="navigateTo(\'' + menu.module + '\')" ';
  }
  
  html += '>';
  html += '<span class="sidebar-menu-icon">' + menu.icon + '</span>';
  html += '<span class="sidebar-menu-text">' + menu.label + '</span>';
  
  if (isComingSoon) {
    html += '<span class="sidebar-coming-soon">Coming Soon</span>';
  }
  
  // Tooltip for collapsed state
  html += '<span class="sidebar-tooltip">' + menu.label + '</span>';
  
  html += '</div>';
  
  return html;
}

// ============================================================
// NAVIGATION
// ============================================================

/**
 * นำทางไปยัง module ที่กำหนด
 * @param {string} moduleId - ID ของ module (ตรงกับ key ใน MODULE_MAP)
 */
function navigateTo(moduleId) {
  var moduleUrl = MODULE_MAP[moduleId];
  
  if (!moduleUrl && !moduleId.startsWith('p5') && !moduleId.startsWith('p6') && !moduleId.startsWith('p7') && !moduleId.startsWith('admin')) {
    console.warn('[PP7] Module not found:', moduleId);
    return;
  }
  
  // อัพเดท state
  appState.currentModule = moduleId;
  sessionStorage.setItem('pp7_currentModule', moduleId);
  
  // อัพเดท active state ใน sidebar
  updateActiveMenuItem(moduleId);
  
  // อัพเดท breadcrumb
  updateBreadcrumb(moduleId);
  
  // อัพเดท page title
  updatePageTitle(moduleId);
  
  // โหลด module ใน iframe
  if (moduleUrl) {
    loadModule(moduleUrl);
  } else {
    // แสดง "Coming Soon" page
    showComingSoonPage(moduleId);
  }
  
  // ปิด mobile menu
  closeSidebar();
  
  // ปิด user dropdown
  document.getElementById('userMenu').classList.add('hidden');
}

/**
 * โหลด module HTML ใน iframe
 */
function loadModule(url) {
  var iframe = document.getElementById('moduleFrame');
  
  // แสดง loading indicator
  showLoadingInFrame();
  
  // Load module
  iframe.src = url;
  
  // Handle iframe load event
  iframe.onload = function() {
    // ปรับขนาด iframe ตาม content
    try {
      var iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
      var contentHeight = iframeDoc.body.scrollHeight;
      iframe.style.height = Math.max(contentHeight, window.innerHeight - 150) + 'px';
    } catch (e) {
      // Cross-origin restriction → ใช้ default height
      iframe.style.height = 'calc(100vh - 7rem)';
    }
  };
}

/**
 * แสดง loading spinner ใน content area
 */
function showLoadingInFrame() {
  var contentArea = document.getElementById('contentArea');
  // ถ้า iframe ยังไม่มี src ให้แสดง loading
  var iframe = document.getElementById('moduleFrame');
  if (!iframe.src || iframe.src === window.location.href) {
    contentArea.innerHTML = `
      <div class="module-loading">
        <div class="spinner"></div>
        <p class="text-sm text-slate-500">กำลังโหลด module...</p>
      </div>
      <iframe 
        id="moduleFrame" 
        class="w-full border-0" 
        style="min-height: calc(100vh - 7rem);"
        sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
        title="Module Content"
      ></iframe>
    `;
  }
}

/**
 * แสดงหน้า "Coming Soon"
 */
function showComingSoonPage(moduleId) {
  var labels = {
    'p5': 'P5 — พัฒนาบุคลากร',
    'p6': 'P6 — ค่าตอบแทน',
    'p7': 'P7 — คุณภาพชีวิต',
    'admin-users': 'จัดการผู้ใช้',
    'admin-settings': 'ตั้งค่าระบบ',
    'admin-audit': 'Audit Log'
  };
  
  var label = labels[moduleId] || moduleId;
  
  var contentArea = document.getElementById('contentArea');
  contentArea.innerHTML = `
    <div class="flex items-center justify-center min-h-[calc(100vh-7rem)] p-8">
      <div class="text-center">
        <div class="text-6xl mb-4">🚧</div>
        <h2 class="text-2xl font-semibold text-slate-700 mb-2">${label}</h2>
        <p class="text-slate-500 mb-6">ฟีเจอร์นี้กำลังพัฒนา มาเร็ว ๆ นี้!</p>
        <button 
          onclick="navigateTo('dashboard')"
          class="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors text-sm"
        >
          ← กลับสู่ Dashboard
        </button>
      </div>
    </div>
  `;
}

/**
 * อัพเดท active state ของ sidebar menu
 */
function updateActiveMenuItem(moduleId) {
  // ลบ active class ทั้งหมด
  var items = document.querySelectorAll('.sidebar-menu-item');
  items.forEach(function(item) {
    item.classList.remove('active');
  });
  
  // เพิ่ม active class ให้กับ item ที่เลือก
  items.forEach(function(item) {
    var onclick = item.getAttribute('onclick');
    if (onclick && onclick.includes("'" + moduleId + "'")) {
      item.classList.add('active');
    }
  });
}

/**
 * อัพเดท breadcrumb
 */
function updateBreadcrumb(moduleId) {
  var breadcrumb = document.getElementById('breadcrumb');
  var sectionEl = document.getElementById('breadcrumbSection');
  var pageEl = document.getElementById('breadcrumbPage');
  var pageSep = document.getElementById('breadcrumbPageSep');
  
  breadcrumb.classList.remove('hidden');
  
  var mapping = getBreadcrumbMapping(moduleId);
  
  if (mapping.section) {
    sectionEl.textContent = mapping.section;
    sectionEl.classList.remove('hidden');
  } else {
    sectionEl.textContent = '';
  }
  
  if (mapping.page) {
    pageEl.textContent = mapping.page;
    pageSep.classList.remove('hidden');
  } else {
    pageEl.textContent = mapping.section || '';
    pageSep.classList.add('hidden');
  }
}

/**
 * Map module ID → breadcrumb labels
 */
function getBreadcrumbMapping(moduleId) {
  var map = {
    'dashboard':          { section: '', page: 'Dashboard' },
    'p1-headcount':       { section: 'P1 แสวงหา', page: 'อัตรากำลัง' },
    'p1-candidates':      { section: 'P1 แสวงหา', page: 'ผู้สมัคร' },
    'p2-interviews':      { section: 'P2 หยั่งประเมิน', page: 'สัมภาษณ์' },
    'p2-assessment':      { section: 'P2 หยั่งประเมิน', page: 'ประเมินผล' },
    'p3-matching':        { section: 'P3 จับคู่', page: 'จับคู่ตำแหน่ง' },
    'p4-evaluation':      { section: 'P4 ประเมินผล', page: 'ประเมินผลงาน' },
    'p4-evaluation-360':  { section: 'P4 ประเมินผล', page: '360°' },
    'p4-dashboard':       { section: 'P4 ประเมินผล', page: 'Dashboard' }
  };
  
  return map[moduleId] || { section: moduleId, page: '' };
}

/**
 * อัพเดท tab/page title
 */
function updatePageTitle(moduleId) {
  var titles = {
    'dashboard':          'Dashboard | PP7',
    'p1-headcount':       'P1 — อัตรากำลัง | PP7',
    'p1-candidates':      'P1 — ผู้สมัคร | PP7',
    'p2-interviews':      'P2 — สัมภาษณ์ | PP7',
    'p2-assessment':      'P2 — ประเมินผล | PP7',
    'p3-matching':        'P3 — จับคู่ | PP7',
    'p4-evaluation':      'P4 — ประเมินผลงาน | PP7',
    'p4-evaluation-360':  'P4 — ประเมิน 360° | PP7',
    'p4-dashboard':       'P4 — Dashboard ผลงาน | PP7'
  };
  
  document.title = titles[moduleId] || 'ระบบบริหารบุคลากร PP7';
}

// ============================================================
// SIDEBAR TOGGLE
// ============================================================

/**
 * Toggle sidebar (mobile/desktop)
 */
function toggleSidebar() {
  var sidebar = document.getElementById('appSidebar');
  var overlay = document.getElementById('sidebarOverlay');
  var isMobile = window.innerWidth < 768;
  
  if (isMobile) {
    // Mobile: toggle overlay
    appState.mobileMenuOpen = !appState.mobileMenuOpen;
    
    if (appState.mobileMenuOpen) {
      sidebar.classList.add('mobile-open');
      overlay.classList.remove('hidden');
    } else {
      sidebar.classList.remove('mobile-open');
      overlay.classList.add('hidden');
    }
  } else {
    // Desktop/Tablet: toggle collapse
    appState.sidebarOpen = !appState.sidebarOpen;
    
    if (appState.sidebarOpen) {
      document.body.classList.remove('sidebar-collapsed');
    } else {
      document.body.classList.add('sidebar-collapsed');
    }
  }
}

/**
 * ปิด sidebar (mobile)
 */
function closeSidebar() {
  var sidebar = document.getElementById('appSidebar');
  var overlay = document.getElementById('sidebarOverlay');
  
  appState.mobileMenuOpen = false;
  sidebar.classList.remove('mobile-open');
  overlay.classList.add('hidden');
}

// ============================================================
// HEADER & USER MENU
// ============================================================

/**
 * อัพเดท Header ข้อมูล User
 */
function updateHeaderUserInfo() {
  if (!appState.user) return;
  
  var user = appState.user;
  var displayName = user.display_name || user.name || user.email;
  var role = ROLE_LABELS[user.role] || user.role;
  var initials = displayName.charAt(0).toUpperCase();
  
  // Header
  document.getElementById('headerUserName').textContent = displayName;
  document.getElementById('headerUserRole').textContent = role;
  document.getElementById('userAvatar').textContent = initials;
  
  // Mobile menu
  document.getElementById('menuUserName').textContent = displayName;
  document.getElementById('menuUserEmail').textContent = user.email || '';
}

/**
 * Toggle User Dropdown
 */
function toggleUserMenu() {
  var menu = document.getElementById('userMenu');
  menu.classList.toggle('hidden');
}

// ============================================================
// NOTIFICATIONS
// ============================================================

/**
 * Toggle notifications panel
 */
function toggleNotifications() {
  var panel = document.getElementById('notifPanel');
  panel.classList.toggle('hidden');
}

/**
 * Clear all notifications
 */
function clearNotifications() {
  document.getElementById('notifBadge').classList.add('hidden');
  document.getElementById('notifList').innerHTML = `
    <div class="px-4 py-6 text-center text-sm text-slate-400">
      ไม่มีการแจ้งเตือน
    </div>
  `;
  document.getElementById('notifPanel').classList.add('hidden');
}

/**
 * อัพเดทจำนวน notification badge
 */
function updateNotifBadge(count) {
  var badge = document.getElementById('notifBadge');
  if (count > 0) {
    badge.textContent = count > 99 ? '99+' : count;
    badge.classList.remove('hidden');
    badge.classList.add('flex');
  } else {
    badge.classList.add('hidden');
    badge.classList.remove('flex');
  }
}

// ============================================================
// UTILITY FUNCTIONS
// ============================================================

/**
 * Handle click outside dropdowns
 */
function handleOutsideClick(event) {
  // User menu
  var userBtn = document.getElementById('userMenuBtn');
  var userMenu = document.getElementById('userMenu');
  if (userBtn && userMenu && !userBtn.contains(event.target) && !userMenu.contains(event.target)) {
    userMenu.classList.add('hidden');
  }
  
  // Notifications
  var notifBtn = document.getElementById('notifBtn');
  var notifPanel = document.getElementById('notifPanel');
  if (notifBtn && notifPanel && !notifBtn.contains(event.target) && !notifPanel.contains(event.target)) {
    notifPanel.classList.add('hidden');
  }
}

/**
 * Handle window resize
 */
function handleResize() {
  var sidebar = document.getElementById('appSidebar');
  var overlay = document.getElementById('sidebarOverlay');
  
  // ถ้า resize จาก mobile → desktop ให้ reset mobile states
  if (window.innerWidth >= 768) {
    sidebar.classList.remove('mobile-open');
    overlay.classList.add('hidden');
    appState.mobileMenuOpen = false;
  }
}

/**
 * อัพเดท Footer timestamp
 */
function updateFooterTimestamp() {
  var now = new Date();
  var formatted = now.toLocaleDateString('th-TH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
  
  document.getElementById('footerUpdated').textContent = formatted;
}

// ============================================================
// ROLE-BASED MENU VISIBILITY (Runtime check)
// ============================================================

/**
 * ตรวจสอบว่า user สามารถเข้าถึง module ได้หรือไม่
 * @param {string} moduleId
 * @returns {boolean}
 */
function canAccessModule(moduleId) {
  if (!appState.user) return false;
  
  var role = appState.user.role;
  
  // Admin เห็นทุกอย่าง
  if (role === 'admin') return true;
  
  // หา menu config สำหรับ moduleId นี้
  var menuConfig = findMenuConfig(moduleId);
  if (!menuConfig) return false;
  
  // ตรวจสอบ role
  if (menuConfig.roles && !menuConfig.roles.includes(role)) {
    return false;
  }
  
  return true;
}

/**
 * หา menu config จาก module ID
 */
function findMenuConfig(moduleId) {
  for (var i = 0; i < SIDEBAR_MENU.length; i++) {
    var menu = SIDEBAR_MENU[i];
    if (menu.type === 'divider') continue;
    
    // Check single items
    if (menu.module === moduleId || menu.id === moduleId) {
      return menu;
    }
    
    // Check sub-items
    if (menu.items) {
      for (var j = 0; j < menu.items.length; j++) {
        if (menu.items[j].module === moduleId || menu.items[j].id === moduleId) {
          return menu.items[j];
        }
      }
    }
  }
  
  return null;
}

// ============================================================
// MOCK DATA HELPERS (Dev Mode)
// ============================================================

/**
 * จำลอง notification badges ขณะพัฒนา
 */
function loadMockNotifications() {
  // จำลอง pending items
  var pendingCount = 0;
  
  if (appState.user && appState.user.role === 'admin') {
    pendingCount = 20; // 3 HC + 5 interviews + 12 candidates
  } else if (appState.user && appState.user.role === 'hr_manager') {
    pendingCount = 15;
  } else if (appState.user && appState.user.role === 'bu_manager') {
    pendingCount = 5;
  }
  
  updateNotifBadge(pendingCount);
}

// ============================================================
// GLOBAL EXPORTS (for inline onclick handlers)
// ============================================================

window.handleLogin = handleLogin;
window.handleMockLogin = handleMockLogin;
window.handleLogout = handleLogout;
window.togglePassword = togglePassword;
window.toggleSidebar = toggleSidebar;
window.closeSidebar = closeSidebar;
window.toggleUserMenu = toggleUserMenu;
window.toggleNotifications = toggleNotifications;
window.clearNotifications = clearNotifications;
window.navigateTo = navigateTo;

// ============================================================
// AUTO-INIT: Load mock notifications after sidebar renders
// ============================================================

// MutationObserver เพื่อตรวจจับเมื่อ sidebar ถูก render
var sidebarObserver = new MutationObserver(function() {
  loadMockNotifications();
  sidebarObserver.disconnect();
});

// เริ่ม observer หลัง DOM ready
document.addEventListener('DOMContentLoaded', function() {
  var sidebarMenu = document.getElementById('sidebarMenu');
  if (sidebarMenu) {
    sidebarObserver.observe(sidebarMenu, { childList: true });
  }
});
