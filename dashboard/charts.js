/**
 * Dashboard Charts & UI Module
 * =============================
 * จัดการการ render charts, KPI cards, loading states
 * และ toggle ระหว่าง Mock/Real data
 * 
 * ใช้ Chart.js สำหรับ charts
 * รองรับ responsive design (desktop + tablet + mobile)
 */

// ===== CHART REGISTRY =====
const dashboardChartRegistry = {};

// ===== LOADING STATE UI =====

/** แสดง loading state สำหรับ KPI cards */
function showLoadingState(containerId, type = 'skeleton') {
  const container = document.getElementById(containerId);
  if (!container) return;

  if (type === 'skeleton') {
    container.innerHTML = `
      <div class="loading-skeleton" style="display:flex;align-items:center;justify-content:center;min-height:80px;">
        <div class="animate-pulse">
          <div style="width:100px;height:24px;background:#e2e8f0;border-radius:4px;margin:8px auto;"></div>
          <div style="width:60px;height:16px;background:#f1f5f9;border-radius:4px;margin:4px auto;"></div>
        </div>
        <div style="margin-left:12px;color:#64748b;font-size:.8rem;">กำลังโหลด...</div>
      </div>`;
  } else if (type === 'spinner') {
    container.innerHTML = `
      <div style="display:flex;align-items:center;justify-content:center;min-height:80px;">
        <div class="spinner" style="width:24px;height:24px;border:3px solid #e2e8f0;border-top-color:#3b82f6;border-radius:50%;animation:spin 0.8s linear infinite;"></div>
      </div>`;
  }
}

/** แสดง error state */
function showErrorState(containerId, message) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = `
    <div class="error-state" style="padding:1rem;background:#fef2f2;border:1px solid #fecaca;border-radius:8px;text-align:center;">
      <div style="font-size:1.5rem;margin-bottom:.5rem;">⚠️</div>
      <div style="color:#991b1b;font-size:.85rem;font-weight:500;">เกิดข้อผิดพลาด</div>
      <div style="color:#dc2626;font-size:.75rem;margin-top:.25rem;">${message || 'ไม่สามารถโหลดข้อมูล'}</div>
      <button onclick="refreshDashboard()" style="margin-top:.75rem;padding:.35rem .75rem;background:#dc2626;color:#fff;border:none;border-radius:6px;font-size:.75rem;cursor:pointer;">ลองใหม่</button>
    </div>`;
}

// ===== KPI RENDERING =====

/** Render KPI card ด้วยข้อมูลจริง */
function renderKPICard(elementId, data) {
  const el = document.getElementById(elementId);
  if (!el) return;

  // อัพเดทตัวเลข
  if (data.value !== undefined) {
    el.textContent = data.value;
  }

  // อัพเดท trend indicator
  if (data.trend !== undefined && data.trendEl) {
    const trendEl = document.getElementById(data.trendEl);
    if (trendEl) {
      const arrow = data.trend === 'up' ? '▲' : data.trend === 'down' ? '▼' : '●';
      trendEl.textContent = `${arrow} ${data.trendValue || ''}`;
      trendEl.className = data.trend === 'up' ? 'text-xs text-emerald-600 mt-1' :
                          data.trend === 'down' ? 'text-xs text-red-600 mt-1' :
                          'text-xs text-slate-400 mt-1';
    }
  }
}

/** Render Turnover Rate Chart */
function renderTurnoverChart(canvasId, data) {
  if (dashboardChartRegistry[canvasId]) return;
  dashboardChartRegistry[canvasId] = true;

  const ctx = document.getElementById(canvasId);
  if (!ctx) return;

  const labels = data.labels || ['Tech', 'Sales', 'Ops', 'Finance', 'HR', 'R&D'];
  const values = data.values || [8.5, 7.1, 3.2, 4.8, 6.3, 2.1];

  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: 'Turnover Rate (%)',
        data: values,
        backgroundColor: values.map(v =>
          v > 7 ? '#ef4444' : v > 5 ? '#f59e0b' : '#10b981'
        ),
        borderRadius: 6
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        title: {
          display: true,
          text: 'อัตราการลาออกแยกตามฝ่าย (%)',
          font: { family: 'Prompt', size: 14, weight: 'bold' }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            font: { family: 'Prompt', size: 11 },
            callback: v => v + '%'
          },
          grid: { color: '#f1f5f9' }
        },
        x: {
          ticks: { font: { family: 'Prompt', size: 11 } },
          grid: { display: false }
        }
      }
    }
  });
}

/** Render Performance Trend Chart */
function renderPerformanceChart(canvasId, data) {
  if (dashboardChartRegistry[canvasId]) return;
  dashboardChartRegistry[canvasId] = true;

  const ctx = document.getElementById(canvasId);
  if (!ctx) return;

  // ดึงจาก data format ที่มี quarter+score
  const labels = data.map(d => d.quarter);
  const scores = data.map(d => d.score);

  new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [{
        label: 'Avg Performance Score',
        data: scores,
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59,130,246,.08)',
        fill: true,
        tension: 0.4,
        pointBackgroundColor: scores.map(s => s >= 3.5 ? '#10b981' : '#f59e0b'),
        pointRadius: 6
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        title: {
          display: true,
          text: 'Performance Score Trend',
          font: { family: 'Prompt', size: 14, weight: 'bold' }
        },
        legend: { labels: { font: { family: 'Prompt' } } }
      }
    }
  });
}

/** Render Engagement Score Chart */
function renderEngagementChart(canvasId, data) {
  if (dashboardChartRegistry[canvasId]) return;
  dashboardChartRegistry[canvasId] = true;

  const ctx = document.getElementById(canvasId);
  if (!ctx) return;

  const labels = data.map(d => d.month);
  const scores = data.map(d => d.score);

  new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [{
        label: 'Engagement Score',
        data: scores,
        borderColor: '#8b5cf6',
        backgroundColor: 'rgba(139,92,246,.08)',
        fill: true,
        tension: 0.4,
        pointRadius: 4
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        title: {
          display: true,
          text: 'Engagement Score Trend (จาก P7)',
          font: { family: 'Prompt', size: 13, weight: 'bold' }
        },
        legend: { labels: { font: { family: 'Prompt' } } }
      }
    }
  });
}

/** Render Recruitment Pipeline Funnel */
function renderPipelineChart(canvasId, data) {
  if (dashboardChartRegistry[canvasId]) return;
  dashboardChartRegistry[canvasId] = true;

  const ctx = document.getElementById(canvasId);
  if (!ctx) return;

  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['เปิดรับสมัคร', 'Pipeline', 'สัมภาษณ์', 'ส่ง Offer', 'จ้าง'],
      datasets: [{
        label: 'จำนวน',
        data: [
          data.openPositions || 42,
          data.inPipeline || 186,
          data.interviewed || 34,
          data.offerSent || 12,
          data.hired || 19
        ],
        backgroundColor: ['#3b82f6', '#6366f1', '#8b5cf6', '#f59e0b', '#10b981'],
        borderRadius: 4
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      indexAxis: 'y',
      plugins: {
        title: {
          display: true,
          text: 'Recruitment Pipeline (จาก P1)',
          font: { family: 'Prompt', size: 13 }
        },
        legend: { display: false }
      }
    }
  });
}

/** Render Compensation Distribution Chart */
function renderCompensationChart(canvasId, data) {
  if (dashboardChartRegistry[canvasId]) return;
  dashboardChartRegistry[canvasId] = true;

  const ctx = document.getElementById(canvasId);
  if (!ctx) return;

  const colors = ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#64748b'];
  const labels = Object.keys(data);
  const values = Object.values(data);

  new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: labels,
      datasets: [{
        data: values,
        backgroundColor: colors
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        title: {
          display: true,
          text: 'Compensation Distribution (จาก P6)',
          font: { family: 'Prompt', size: 13 }
        },
        legend: {
          position: 'bottom',
          labels: { font: { family: 'Prompt', size: 11 } }
        }
      }
    }
  });
}

/** Render Headcount by BU Chart */
function renderHeadcountChart(canvasId, data) {
  if (dashboardChartRegistry[canvasId]) return;
  dashboardChartRegistry[canvasId] = true;

  const ctx = document.getElementById(canvasId);
  if (!ctx) return;

  const labels = data.map(d => d.bu);
  const counts = data.map(d => d.count);

  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: 'จำนวนคน (Headcount)',
        data: counts,
        backgroundColor: '#3b82f6',
        borderRadius: 4,
        borderSkipped: false
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        title: {
          display: true,
          text: 'Headcount แยกตาม BU (จาก P1)',
          font: { family: 'Prompt', size: 13 }
        },
        legend: { display: false }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: { font: { family: 'Prompt', size: 11 } }
        },
        x: {
          ticks: { font: { family: 'Prompt', size: 11 } }
        }
      }
    }
  });
}

// ===== TOGGLE BETWEEN MOCK/REAL =====

/** สลับโหมดข้อมูล Mock/Real */
function toggleDataSource() {
  const current = DASHBOARD_CONFIG?.DATA_SOURCE || 'mock';
  const next = current === 'mock' ? 'real' : 'mock';
  
  if (DASHBOARD_CONFIG) {
    DASHBOARD_CONFIG.DATA_SOURCE = next;
  }

  // อัพเดท UI
  updateDataSourceUI();
  
  // โหลดข้อมูลใหม่
  refreshDashboard();
}

/** อัพเดท UI ตามโหมดข้อมูล */
function updateDataSourceUI() {
  const toggle = document.getElementById('data-source-toggle');
  const label = document.getElementById('data-source-label');
  
  if (DASHBOARD_CONFIG?.DATA_SOURCE === 'real') {
    if (toggle) toggle.classList.add('active');
    if (label) label.textContent = '🟢 REAL';
  } else {
    if (toggle) toggle.classList.remove('active');
    if (label) label.textContent = '🔵 MOCK';
  }
}

// ===== UPDATE TIMESTAMP =====

/** อัพเดทเวลา "อัปเดตล่าสุด" */
function updateTimestamp(date) {
  const el = document.getElementById('lastUpdate');
  if (!el) return;
  if (!date) date = new Date();
  const h = date.getHours().toString().padStart(2, '0');
  const m = date.getMinutes().toString().padStart(2, '0');
  el.textContent = `วันนี้ ${h}:${m} ICT`;
}

// ===== REFRESH =====

/** ดึงข้อมูลและ render ใหม่ทั้งหมด */
async function refreshDashboard() {
  if (!window.dashboardClient) {
    console.warn('[Dashboard] Client ไม่ทำงาน - กำลังใช้ mock data');
    renderAllCharts();
    return;
  }

  // แสดง loading ใน KPI section
  const kpiContainer = document.getElementById('kpi-cards-container');
  if (kpiContainer) showLoadingState('kpi-cards-container', 'skeleton');

  try {
    const data = await window.dashboardClient.fetchAll();
    
    // ซ่อน loading
    if (kpiContainer) kpiContainer.innerHTML = '';

    // Render charts ใหม่
    renderAllCharts(data);
    updateTimestamp(data.timestamp);

  } catch (err) {
    console.error('[Dashboard] Refresh failed:', err);
    if (kpiContainer) {
      showErrorState('kpi-cards-container', err.message);
    }
  }
}

// ===== RENDER ALL CHARTS =====

/** Render charts ทั้งหมด (ใช้ mock data เป็น fallback) */
function renderAllCharts(data) {
  const mockData = window.MOCK_DASHBOARD_DATA || {};
  const kpis = (data && data.kpis) || mockData.kpis || {};
  const trends = (data && data.trends) || mockData.trends || {};
  const headcount = (data && data.headcount) || mockData.headcountByBU || [];

  // Headcount Trend
  if (trends.headcount) {
    renderHeadcountTrendChart('dashboard-headcount-trend', trends.headcount);
  }

  // Turnover by BU
  if (kpis.turnoverRate) {
    renderTurnoverChart('dashboard-turnover-chart', {
      labels: Object.keys(kpis.turnoverRate.byBU || {}),
      values: Object.values(kpis.turnoverRate.byBU || {}).map(d => d.rate)
    });
  }

  // Performance Trend
  if (kpis.performanceScore && kpis.performanceScore.byQuarter) {
    renderPerformanceChart('dashboard-performance-chart', kpis.performanceScore.byQuarter);
  }

  // Engagement Score
  if (kpis.engagementScore && kpis.engagementScore.trend) {
    renderEngagementChart('dashboard-engagement-chart', kpis.engagementScore.trend);
  }

  // Recruitment Pipeline
  if (kpis.recruitment) {
    renderPipelineChart('dashboard-pipeline-chart', kpis.recruitment);
  }

  // Compensation Distribution
  if (kpis.compensation && kpis.compensation.byType) {
    renderCompensationChart('dashboard-compensation-chart', kpis.compensation.byType);
  }

  // Headcount by BU
  if (headcount && headcount.length > 0) {
    renderHeadcountChart('dashboard-headcount-bu-chart', headcount);
  }
}

/** Chart สำหรับ Headcount Trend แบบ line */
function renderHeadcountTrendChart(canvasId, data) {
  if (dashboardChartRegistry[canvasId]) return;
  dashboardChartRegistry[canvasId] = true;

  const ctx = document.getElementById(canvasId);
  if (!ctx) return;

  const colors = DASHBOARD_CONFIG?.CHART_COLORS || {};
  
  new Chart(ctx, {
    type: 'line',
    data: {
      labels: data.map(d => d.month),
      datasets: [
        {
          label: 'บุคลากร',
          data: data.map(d => d.headcount),
          borderColor: colors.blue || '#3b82f6',
          backgroundColor: 'rgba(59,130,246,.08)',
          fill: true,
          tension: 0.4
        },
        {
          label: 'Turnover',
          data: data.map(d => d.turnover),
          borderColor: colors.red || '#ef4444',
          backgroundColor: 'transparent',
          tension: 0.4
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { labels: { font: { family: 'Prompt' } } } },
      scales: {
        y: { ticks: { font: { family: 'Prompt', size: 11 } } },
        x: { ticks: { font: { family: 'Prompt', size: 11 } } }
      }
    }
  });
}

// ===== INITIALIZATION =====

/** เริ่มทำงาน - เรียกตอน DOMContentLoaded */
function initDashboard() {
  console.log('[Dashboard] Initializing...');

  // สร้าง client
  window.dashboardClient = createDashboardClient();

  // แสดงค่าเริ่มต้นใน KPI section
  updateKPIsFromData();

  // Render charts
  renderAllCharts();

  // เริ่ม auto-refresh
  window.dashboardClient.startAutoRefresh((data) => {
    console.log('[Dashboard] Auto-refresh at', data.timestamp);
    renderAllCharts(data);
    updateTimestamp(data.timestamp);
    updateKPIsFromData(data);
  });

  console.log('[Dashboard] Ready.');
}

/** อัพเดท KPI numbers ที่ header */
function updateKPIsFromData(data) {
  const kpis = (data && data.kpis) || (window.MOCK_DASHBOARD_DATA && window.MOCK_DASHBOARD_DATA.kpis);
  if (!kpis) return;

  const el = (id) => document.getElementById(id);
  
  // บุคลากรทั้งหมด
  if (el('kpi-total') && kpis.headcount) {
    el('kpi-total').textContent = kpis.headcount.total || '...';
  }

  // Match rate → Engagement Score
  if (el('kpi-engagement') && kpis.engagementScore) {
    el('kpi-engagement').textContent = kpis.engagementScore.overall || '...';
  }

  // Avg Performance
  if (el('kpi-performance') && kpis.performanceScore) {
    el('kpi-performance').textContent = kpis.performanceScore.overall || '...';
  }

  // Welfare
  if (el('kpi-welfare') && kpis.compensation) {
    el('kpi-welfare').textContent = '฿' + (kpis.compensation.welfarePayout || 0) + 'M';
  }
}

// Auto-start
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initDashboard);
} else {
  initDashboard();
}

// Export
if (typeof window !== 'undefined') {
  window.renderAllCharts = renderAllCharts;
  window.refreshDashboard = refreshDashboard;
  window.toggleDataSource = toggleDataSource;
  window.updateDataSourceUI = updateDataSourceUI;
}
