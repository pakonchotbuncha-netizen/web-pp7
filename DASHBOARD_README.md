# DASHBOARD README - คู่มือการใช้งาน Dashboard PP7

## 📊 ภาพรวม

Dashboard ของระบบ PP7 ได้รับการปรับปรุงให้รองรับข้อมูลจริง (Real Data) แล้ว โดยยังคงใช้ mock data เป็นค่าเริ่มต้นสำหรับการพัฒนา

### คุณสมบัติหลัก

✅ **สลับข้อมูล Mock/Real** - ใช้ toggle button เพื่อเปลี่ยนระหว่าง mock และ real data  
✅ **Auto-refresh** - รีเฟรชอัตโนมัติทุก 5 นาที  
✅ **Loading States** - แสดง skeleton/spinner ขณะโหลดข้อมูล  
✅ **Error Handling** - แจ้งข้อผิดพลาดและปุ่ม retry  
✅ **Responsive Design** - รองรับ desktop, tablet, mobile  
✅ **Chart.js** - ใช้ Chart.js สำหรับกราฟทั้งหมด  

---

## 🎯 KPI ที่แสดง

### 1. **อัตราลาออก (Turnover Rate)**
- ที่มา: P1 (แสวงหา), P4 (ประเมินผล)
- แสดงแยกตาม BU (Tech, Sales, Operations, Finance, HR, R&D)
- Color-coded: สีแดง (>7%), สีเหลือง (5-7%), สีเขียว (<5%)

### 2. **Performance Trend**
- ที่มา: P4 (ประเมินผล)
- แสดงแนวโน้มคะแนนผลงานรายไตรมาส
- มี target line เพื่อเปรียบเทียบ

### 3. **Engagement Score**
- ที่มา: P7 (คุณภาพชีวิต)
- แสดงคะแนน engagement รายเดือน
- แยกตาม BU และแสดงภาพรวม

### 4. **Headcount by BU**
- ที่มา: P1 (แสวงหา)
- แสดงจำนวนพนักงานแยกตาม Business Unit
- Bar chart แบบ interactive

### 5. **Recruitment Pipeline**
- ที่มา: P1 (แสวงหา)
- Funnel chart แสดงจำนวนผู้สมัครแต่ละขั้นตอน
- ตั้งแต่เปิดรับสมัคร → เข้าทำงาน

### 6. **Compensation Distribution**
- ที่มา: P6 (ค่าตอบแทน)
- Doughnut chart แสดงสัดส่วนค่าตอบแทน/สวัสดิการ
- แยกเป็นหมวด (ประกันสุขภาพ, เบี้ยเลี้ยง, กองทุน, โบนัส, อื่นๆ)

---

## 🔌 การเชื่อมต่อ API

### API Endpoints

สร้าง Google Apps Script endpoints ไว้ใน `Code.gs`:

```
GET /api/dashboard/kpis      → ดึง KPI ทั้งหมด
GET /api/dashboard/trend     → ดึงข้อมูล trend
GET /api/dashboard/headcount → ดึงข้อมูล headcount
GET /api/dashboard/engagement → ดึงข้อมูล engagement
GET /api/dashboard/turnover  → ดึงข้อมูล turnover
```

### ตัวอย่างการเรียก API

```javascript
// ใช้ Dashboard Client
const client = createDashboardClient();
const data = await client.fetchAll();

// หรือเรียก API โดยตรง
const response = await fetch('/api/dashboard/kpis');
const result = await response.json();
```

### โครงสร้าง Response

```json
{
  "success": true,
  "data": {
    "kpis": {
      "headcount": { "total": 487, "active": 446 },
      "turnoverRate": { "overall": 5.2 },
      "performanceScore": { "overall": 3.72 },
      "engagementScore": { "overall": 4.2 },
      "recruitment": { "openPositions": 42 },
      "compensation": { "welfarePayout": 8.2 }
    },
    "trends": { ... },
    "headcount": [ ... ]
  },
  "timestamp": "2026-07-06T03:19:00Z"
}
```

---

## 🔄 วิธีเปลี่ยนจาก Mock → Real Data

### ขั้นตอนที่ 1: แก้ไฟล์ `dashboard/config.js`

```javascript
const DASHBOARD_CONFIG = {
  // เปลี่ยนจาก 'mock' เป็น 'real'
  DATA_SOURCE: 'real',
  
  // อื่นๆ
  AUTO_REFRESH_INTERVAL: 5 * 60 * 1000,
  API_BASE_URL: '/api/dashboard',
  DEBUG_MODE: true
};
```

### ขั้นตอนที่ 2: เตรียมข้อมูลใน Google Sheets

สร้าง Sheets ตามนี้:

1. **Tab-02-แสวงหา** - ข้อมูลผู้สมัคร/พนักงาน
2. **Tab-05-ประเมินผล** - คะแนนผลงาน
3. **Tab-06-ค่าตอบแทน** - ข้อมูลค่าตอบแทน/สวัสดิการ
4. **Tab-08-คุณภาพชีวิต** - Engagement score
5. **Dashboard-Trend** - ข้อมูล trend (ถ้ามี)
6. **Dashboard-Turnover** - ข้อมูล turnover (ถ้ามี)

### ขั้นตอนที่ 3: แก้ไข `Code.gs`

ในไฟล์ `Code.gs` มีฟังก์ชัน `extractRealKPIs()` และ `extract...Data()` ที่ต้อง implement ตามโครงสร้างจริงของ Sheets

```javascript
function extractRealKPIs(p1, p4, p6, p7) {
  // TODO: Implement actual data extraction
  // ตัวอย่าง:
  // const data = p1.getDataRange().getValues();
  // const headcount = data.filter(row => row[0] === 'active').length;
  return { ... };
}
```

### ขั้นตอนที่ 4: Deploy

1. เปิด Google Apps Script
2. Deploy → New deployment
3. เลือก type: Web app
4. Execute as: Me
5. Who has access: Anyone
6. Copy URL
7. ทดสอบ API ด้วย browser

---

## 🎨 การ Customize Charts

### เปลี่ยนสี Chart

แก้ไขไฟล์ `dashboard/config.js`:

```javascript
CHART_COLORS: {
  blue: '#3b82f6',
  emerald: '#10b981',
  violet: '#8b5cf6',
  amber: '#f59e0b',
  red: '#ef4444',
  slate: '#64748b',
  indigo: '#6366f1',
  teal: '#14b8a6',
  pink: '#ec4899',
  orange: '#f97316'
}
```

### ปรับ Threshold

```javascript
THRESHOLDS: {
  turnoverRate: { good: 5, warning: 7, critical: 10 },
  matchRate: { good: 80, warning: 60, critical: 40 },
  performanceScore: { good: 4.0, warning: 3.0, critical: 2.0 },
  engagementScore: { good: 4.0, warning: 3.0, critical: 2.5 }
}
```

### เพิ่ม Chart ใหม่

1. เปิดไฟล์ `dashboard/charts.js`
2. สร้างฟังก์ชันใหม่ เช่น `renderCustomChart()`
3. เพิ่มใน `renderAllCharts()`
4. เพิ่ม canvas ใน `index.html`

```javascript
function renderCustomChart(canvasId, data) {
  if (dashboardChartRegistry[canvasId]) return;
  dashboardChartRegistry[canvasId] = true;

  const ctx = document.getElementById(canvasId);
  if (!ctx) return;

  new Chart(ctx, {
    type: 'bar', // หรือ line, pie, doughnut, etc.
    data: { ... },
    options: { ... }
  });
}
```

---

## 🧪 Development Mode

### ใช้ Mock Data

```javascript
// dashboard/config.js
DATA_SOURCE: 'mock'
```

### เปิด Debug Mode

```javascript
DEBUG_MODE: true
```

จะเห็น console.log ที่ช่วย debug:
```
[Dashboard] Initializing...
[Dashboard] Ready.
[Dashboard] Auto-refresh at 2026-07-06T03:19:00Z
```

### ทดสอบ Loading State

```javascript
showLoadingState('kpi-cards-container', 'skeleton');
// หรือ
showLoadingState('kpi-cards-container', 'spinner');
```

### ทดสอบ Error State

```javascript
showErrorState('kpi-cards-container', 'ไม่สามารถเชื่อมต่อ API');
```

---

## 📱 Responsive Design

### Breakpoints

- **Desktop**: > 768px (grid 4 คอลัมน์)
- **Tablet**: 480-768px (grid 2 คอลัมน์)
- **Mobile**: < 480px (grid 1 คอลัมน์)

### ทดสอบ Responsive

1. เปิด Chrome DevTools
2. Toggle device toolbar
3. เลือก device หรือ custom size
4. เช็ค layout และ chart

---

## 🔧 Troubleshooting

### ไม่แสดง KPI

**สาเหตุ**: ไม่ได้เรียก `initDashboard()`  
**วิธีแก้**: เซ็ตใน `dashboard/charts.js` จะ auto-init ตอน DOMContentLoaded

### Chart ไม่ render

**สาเหตุ**: Canvas element ไม่มีอยู่ หรือ chartRegistry ซ้ำ  
**วิธีแก้**: 
```javascript
// รีเซ็ต registry
delete dashboardChartRegistry['chart-id'];

// หรือล้าง canvas
document.getElementById('chart-id').remove();
```

### API Error

**สาเหตุ**: API endpoint ไม่ทำงาน หรือ CORS error  
**วิธีแก้**:
1. เช็ค Console
2. ทดสอบ API ด้วย browser
3. เช็ค CORS policy ใน Code.gs

### Auto-refresh ไม่ทำงาน

**สาเหตุ**: ไม่ได้เริ่ม auto-refresh  
**วิธีแก้**:
```javascript
// เริ่ม refresh
window.dashboardClient.startAutoRefresh((data) => {
  console.log('Refreshed:', data);
});

// หยุด refresh
window.dashboardClient.stopAutoRefresh();
```

---

## 📝 Notes

- **ไฟล์ที่แก้ไข**: `apps-script/index.html`, `apps-script/Code.gs`
- **ไฟล์ใหม่**: `dashboard/config.js`, `dashboard/mock-data.js`, `dashboard/api-client.js`, `dashboard/charts.js`
- **Backup**: `apps-script/index.html.bak.YYYYMMDD`
- **Compatibility**: Backward compatible กับ mock data เดิม

---

## 🚀 Next Steps

1. Implement `extractRealKPIs()` ใน `Code.gs`
2. ทดสอบกับข้อมูลจริงจาก Sheets
3. เพิ่ม error handling เฉพาะเจาะจง
4. เพิ่ม validation สำหรับข้อมูล
5. เพิ่ม audit log สำหรับ API calls

---

## 📞 Support

หากมีคำถามหรือพบปัญหา:
1. เช็ค Console log
2. อ่านคู่มือนี้
3. ทดสอบด้วย mock data ก่อน
4. ติดต่อทีมพัฒนา

---

**เวอร์ชัน**: 1.0  
**อัปเดตล่าสุด**: 2026-07-06  
**สถานะ**: Production Ready (Mock Data)
