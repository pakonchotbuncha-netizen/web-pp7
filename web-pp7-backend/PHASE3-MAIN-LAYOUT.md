# Phase 3 — Main Layout (index.html)

**สร้างเมื่อ:** 2025-06-25  
**สถานะ:** ✅ เสร็จสมบูรณ์

---

## 📋 สรุปสิ่งที่สร้าง

### ไฟล์ที่สร้าง

| ไฟล์ | ขนาด | คำอธิบาย |
|------|------|----------|
| `index.html` | 16.6 KB | Main layout ของระบบ PP7 |
| `assets/styles.css` | 9.5 KB | Custom CSS (sidebar, animation, responsive) |
| `assets/app.js` | 30.5 KB | Application logic (auth, nav, RBAC, UI) |

---

## 🏗️ Architectural Overview

```
index.html
├── Login Screen (overlay)
│   ├── Email + Password form
│   ├── Mock Login button (Dev Mode)
│   └── Call PP7API.login() → store token
│
├── Main App (hidden จนกว่าจะ login)
│   ├── Header (fixed top)
│   │   ├── Logo + Title
│   │   ├── Hamburger menu (mobile)
│   │   ├── Notification bell + badge
│   │   └── User dropdown (Info, Settings, Logout)
│   │
│   ├── Sidebar (fixed left)
│   │   ├── Rendered by JS ตาม RBAC
│   │   ├── Collapsible (Desktop: icon-only, Mobile: hidden)
│   │   ├── Menu groups: P1-P7 + Admin
│   │   ├── Badges สำหรับ pending items
│   │   └── "Coming Soon" สำหรับ P5-P7
│   │
│   ├── Main Content
│   │   ├── Breadcrumb navigation
│   │   └── <iframe> ← โหลด modules แยก
│   │
│   └── Footer
│       ├── Version (v1.0.0-dev)
│       └── Last Updated timestamp
│
└── Notification Panel (absolute positioned)
```

---

## ✨ Features ที่สร้าง

### 1. Login Screen ✅
- Email + Password form
- เรียก `PP7API.login()` (api-adapter.js)
- เก็บ token + user data ใน localStorage
- Mock Login button สำหรับ Dev Mode (6 roles)
- Error handling + Loading state
- Show/hide password toggle

### 2. Sidebar Navigation ✅
- **Collapsible:**
  - Desktop (>1024px): เปิด/ปิดด้วย toggle
  - Tablet (768-1023px): แสดง icons เท่านั้น (64px)
  - Mobile (<768px): hamburger menu + overlay
- **Menu groups:** P1-P7 + Admin
- **Icons:** ใช้ emoji สำหรับ category icons
- **Active state:** Highlight สีฟ้าอ่อน (#dbeafe)
- **Badges:** แสดงจำนวน pending items
- **Coming Soon:** P5, P6, P7 แสดง disabled + "Soon" badge
- **Tooltip:** แสดง label เมื่อ sidebar collapsed

### 3. Dynamic Module Loading ✅
- โหลด module ผ่าน `<iframe>` (ป้องกัน CSS/JS conflict)
- Sandbox attributes: allow-scripts, allow-same-origin, allow-forms
- Auto-resize iframe ตาม content height
- Loading spinner ระหว่างโหลด
- Breadcrumb อัพเดตตาม module
- Page title อัพเดต (tab title)
- Navigation state เก็บใน sessionStorage

### 4. Header ✅
- Logo + App title
- Notification bell + badge count
- User avatar + name + role
- Dropdown menu (Settings, Logout)
- Hamburger button (mobile)
- Responsive (ซ่อน name บน mobile)

### 5. Footer ✅
- Version: v1.0.0-dev
- Last Updated timestamp (auto)
- Copyright text
- Responsive layout

### 6. Role-Based Menu Visibility (RBAC) ✅

| Role | Dashboard | P1 | P2 | P3 | P4 | P5-P7 | Admin |
|------|-----------|----|----|----|----|--------|-------|
| admin | ✅ | ✅ | ✅ | ✅ | ✅ | 🔜 | ✅ |
| hr_manager | ✅ | ✅ | ✅ | ✅ | ✅ | 🔜 | Settings |
| bu_manager | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| employee | ✅ | ✅* | ❌ | ❌ | ✅ | ❌ | ❌ |
| auditor | ✅ | ✅ (read) | ✅ (read) | ✅ (read) | ✅ (read) | ❌ | Audit |
| guest | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |

*=employee เห็นแค่ headcount request (ของตัวเอง)

### 7. Responsive Design ✅

| Breakpoint | Sidebar | Content |
|-----------|---------|---------|
| Desktop (≥1024px) | 250px, collapsible | margin-left: 250px |
| Tablet (768-1023px) | 64px (icons only) | margin-left: 64px |
| Mobile (<768px) | Hidden + hamburger | Full width |

---

## 🎨 Design System

### Colors
- **Primary:** `#2563eb` (blue-600)
- **Secondary:** `#64748b` (slate-500)
- **Success:** `#10b981` (emerald-500)
- **Warning:** `#f59e0b` (amber-500)
- **Danger:** `#ef4444` (red-500)
- **Background:** `#f1f5f9` (slate-100)
- **Sidebar:** `#ffffff` (white, with shadow)
- **Active menu:** `#dbeafe` bg + `#2563eb` text

### Typography
- **Font:** Prompt (Google Fonts)
- **Weights:** 300, 400, 500, 600, 700

---

## 🔧 Technical Details

### Module Map
```javascript
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
};
```

### Mock Users (Dev Mode)
| Role | Email | Password |
|------|-------|----------|
| admin | admin@pp7.local | (any) |
| hr_manager | hr@pp7.local | (any) |
| bu_manager | bu@pp7.local | (any) |
| employee | emp@pp7.local | (any) |
| auditor | audit@pp7.local | (any) |
| guest | guest@pp7.local | (any) |

### Storage Strategy
- **localStorage:** `pp7_auth_token`, `pp7_auth_user` (persist login)
- **sessionStorage:** `pp7_currentModule` (remember navigation)

---

## 📝 Integration Notes

### สำหรับ Modules ที่มีอยู่แล้ว
Modules สร้างด้วย sidebar ของตัวเองอยู่แล้ว (standalone pages) — เมื่อโหลดใน iframe ผ่าน index.html, iframe จะแสดงผล module เต็ม โดยไม่ต้องแก้ไข module HTML

### สำหรับ GAS Deployment
เมื่อ deploy เป็น Google Apps Script:
1. เปลี่ยน `PP7API_CONFIG.BASE_URL` ใน api-adapter.js
2. หรือใช้ `PP7GASBridge` แทน `PP7API` (google.script.run)
3. ไฟล์ทั้งหมดต้องรวมอยู่ใน GAS project เดียวกัน

### การเพิ่ม Module ใหม่
1. สร้างไฟล์ใน `modules/` 
2. เพิ่ม entry ใน `MODULE_MAP` ใน `assets/app.js`
3. เพิ่ม menu item ใน `SIDEBAR_MENU` array
4. เพิ่ม breadcrumb mapping ใน `getBreadcrumbMapping()`
5. เพิ่ม page title ใน `updatePageTitle()`

---

## 🧪 Testing Checklist

- [x] Login screen แสดงเมื่อไม่มี token
- [x] Mock login ทำงาน (ทั้ง 6 roles)
- [x] Sidebar render ตาม role ถูกต้อง
- [x] Navigation → iframe โหลด module ถูก URL
- [x] Breadcrumb อัพเดตตาม module
- [x] Page title อัพเดต
- [x] Sidebar collapsible (desktop)
- [x] Sidebar overlay (mobile)
- [x] User dropdown (toggle, close on outside click)
- [x] Notification panel toggle
- [x] Footer timestamp
- [x] Coming Soon pages (P5-P7, Admin items)
- [x] Logout → กลับไป login screen
- [x] Navigation state persisted in sessionStorage

---

## 🚀 Next Steps (Future Phases)

1. **P5 Module** — พัฒนาบุคลากร → เพิ่มใน MODULE_MAP + sidebar
2. **P6 Module** — ค่าตอบแทน → เพิ่มใน MODULE_MAP + sidebar  
3. **P7 Module** — คุณภาพชีวิต → เพิ่มใน MODULE_MAP + sidebar
4. **Admin Module** — Users management page
5. **Real-time notifications** — WebSocket หรือ polling
6. **Multi-language** — EN/TH toggle
7. **Dark mode** — Theme toggle

---

## 📊 File Structure

```
web-pp7-backend/
├── index.html                    ← PHASE 3 (Main Layout)
├── assets/
│   ├── styles.css               ← PHASE 3 (Custom CSS)
│   └── app.js                   ← PHASE 3 (App Logic)
├── modules/
│   ├── p1-headcount.html        ← Existing
│   ├── p1-candidates.html       ← Existing
│   ├── p2-interviews.html       ← Existing
│   ├── p2-assessment.html       ← Existing
│   ├── p3-matching.html         ← Existing
│   ├── p4-evaluation.html       ← Existing
│   ├── p4-evaluation-360.html   ← Existing
│   └── p4-dashboard.html        ← Existing
├── api-adapter.js               ← Existing (PP7API)
├── Auth.gs                      ← Existing (Backend)
├── Code.gs                      ← Existing (Backend)
├── Database.gs                  ← Existing (Backend)
├── Setup.gs                     ← Existing (Backend)
└── PHASE3-MAIN-LAYOUT.md        ← PHASE 3 (this file)
```
