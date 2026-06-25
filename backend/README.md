# Web PP7 Backend

**Google Apps Script REST API สำหรับระบบบริหารบุคลากร PP7**

วันที่สร้าง: 25 มิ.ย. 2569
ผู้พัฒนา: KiroClaw (AI)

---

## 🏗️ Architecture

```
Frontend (HTML/JS) → Google Apps Script REST API → Google Sheets (Database)
                                                    ↓
                                             LINE/Telegram Notifications
```

### เทคโนโลยี
- **Backend:** Google Apps Script (JavaScript)
- **Database:** Google Sheets (13 tables)
- **Auth:** Token-based sessions
- **Deployment:** Google Apps Script Web App

---

## 📁 Files

| File | Description |
|------|-------------|
| `Code.gs` | Main entry point, request routing |
| `Database.gs` | Google Sheets CRUD operations |
| `Auth.gs` | Authentication & authorization + Audit log |
| `Setup.gs` | Database setup script (run once) |
| `api-adapter.js` | Frontend adapter for API calls |
| `DATABASE-SCHEMA.md` | Database schema documentation |

---

## 🚀 Setup Instructions

### Step 1: Create Google Apps Script Project

1. Go to https://script.google.com
2. Create a new project named "Web PP7 Backend"
3. Upload all `.gs` files to the project

### Step 2: Run Setup

1. Open `Setup.gs` in the script editor
2. Run `setupDatabase()` function
3. Note the Spreadsheet ID from the log
4. Update `CONFIG.SPREADSHEET_ID` in `Code.gs`

### Step 3: Deploy as Web App

1. Click "Deploy" → "New deployment"
2. Type: "Web app"
3. Execute as: "Me"
4. Who has access: "Anyone" (or specific domain)
5. Copy the Web App URL

### Step 4: Configure Frontend

1. Update `API.BASE_URL` in `api-adapter.js` with the Web App URL
2. Include `api-adapter.js` in the frontend HTML

---

## 🔌 API Endpoints

### Authentication
| Method | Path | Description |
|--------|------|-------------|
| POST | `auth/login` | Login |
| POST | `auth/logout` | Logout |
| GET | `auth/session` | Get current session |

### Members (CRUD)
| Method | Path | Description |
|--------|------|-------------|
| GET | `members` | List all members |
| GET | `members/:id` | Get member by ID |
| POST | `members` | Create member |
| PUT | `members/:id` | Update member |
| DELETE | `members/:id` | Delete member |

### P1: Headcount
| Method | Path | Description |
|--------|------|-------------|
| GET | `p1-headcount` | List headcount requests |
| GET | `p1-headcount/:id` | Get request by ID |
| POST | `p1-headcount` | Create request |
| PUT | `p1-headcount/:id` | Update request |

### P1: Recruitment
| Method | Path | Description |
|--------|------|-------------|
| GET | `p1-recruitment` | List recruitment cases |
| GET | `p1-recruitment/:id` | Get case by ID |
| POST | `p1-recruitment` | Create case |
| PUT | `p1-recruitment/:id` | Update case |

### P2: Assessment
| Method | Path | Description |
|--------|------|-------------|
| GET | `p2-assessment` | List assessments |
| GET | `p2-assessment/:id` | Get by ID |
| POST | `p2-assessment` | Create assessment |
| PUT | `p2-assessment/:id` | Update assessment |

### P3: Matching
| Method | Path | Description |
|--------|------|-------------|
| GET | `p3-matching` | List matchings |
| GET | `p3-matching/:id` | Get by ID |
| POST | `p3-matching` | Create matching |
| PUT | `p3-matching/:id` | Update matching |

### P4: Performance
| Method | Path | Description |
|--------|------|-------------|
| GET | `p4-performance` | List evaluations |
| GET | `p4-performance/:id` | Get by ID |
| POST | `p4-performance` | Create evaluation |
| PUT | `p4-performance/:id` | Update evaluation |

### P5: Development
| Method | Path | Description |
|--------|------|-------------|
| GET | `p5-development` | List development plans |
| GET | `p5-development/:id` | Get by ID |
| POST | `p5-development` | Create plan |
| PUT | `p5-development/:id` | Update plan |

### P6: Compensation
| Method | Path | Description |
|--------|------|-------------|
| GET | `p6-compensation` | List compensations |
| GET | `p6-compensation/:id` | Get by ID |
| POST | `p6-compensation` | Create record |
| PUT | `p6-compensation/:id` | Update record |

### P7: Welfare
| Method | Path | Description |
|--------|------|-------------|
| GET | `p7-welfare` | List welfare records |
| GET | `p7-welfare/:id` | Get by ID |
| POST | `p7-welfare` | Create welfare |
| PUT | `p7-welfare/:id` | Update welfare |

### System
| Method | Path | Description |
|--------|------|-------------|
| GET | `health` | Health check |
| GET | `dashboard` | Dashboard data |
| GET | `config` | Get all config |
| PUT | `config/:key` | Update config |
| GET | `audit` | Audit logs (admin only) |

---

## 🔐 User Roles

| Role | Description | Permissions |
|------|-------------|-------------|
| admin | System Administrator | All |
| pao | PAO (HR Admin) | Full CRUD on P1-P4, read P5-P7 |
| bmc | BMC (Business Manager) | Create headcount, update matching/performance |
| pad | PAD (Training) | Full CRUD on P5, read P1-P4 |
| wcd | WCD (Welfare) | Full CRUD on P6-P7, read members |
| member | Regular member | Read own data, create welfare requests |

---

## 📊 Database Sheets

| Sheet | Description | Primary Key |
|-------|-------------|-------------|
| Config | System configuration | key |
| Users | User accounts | user_id |
| Sessions | Active sessions | session_id |
| AuditLog | Audit trail | log_id |
| Members | Master member data | member_id |
| P1_Headcount | Headcount requests | request_id |
| P1_Recruitment | Recruitment cases | case_id |
| P2_Assessment | Assessment results | assessment_id |
| P3_Matching | Position matching | match_id |
| P4_Performance | Performance evaluations | eval_id |
| P5_Development | Development plans | dev_id |
| P6_Compensation | Compensation records | comp_id |
| P7_Welfare | Welfare records | welfare_id |

---

## 🔄 Data Flow

```
P1 (Headcount Request) 
    ↓
P1 (Recruitment) → P2 (Assessment)
    ↓
P3 (Matching) → Members (Onboard)
    ↓
P4 (Performance) → P5 (Development)
    ↓
P6 (Compensation) + P7 (Welfare)
```

---

## 📝 Development Notes

### CORS
The API supports CORS. For development, all origins are allowed. For production, update `CONFIG.CORS_ORIGINS`.

### Limitations
- Google Sheets API quota: ~100 writes/minute
- Apps Script execution time limit: 6 minutes per request
- Max rows per sheet: ~10 million

### Best Practices
1. Batch operations when possible
2. Use pagination for large datasets
3. Cache frequently accessed data
4. Log errors for debugging

### Next Steps
- [ ] Implement real Google OAuth integration
- [ ] Add LINE Notify integration
- [ ] Add Telegram Bot integration
- [ ] Implement file upload (via Google Drive)
- [ ] Add scheduled reports (via time triggers)

---

## 📞 Support

For issues or questions, contact:
- Developer: KiroClaw (AI Assistant)
- Project Owner: PKG-ปกรณ์(หนึ่ง)

---

**Version:** 2.0.0  
**Last Updated:** 25 มิ.ย. 2569
