#!/usr/bin/env python3
"""Build MMOA presentation HTML with embedded Thai fonts, then render to PDF."""

import base64
import subprocess
import sys

# Read base64 font data
with open('/tmp/regular.b64') as f:
    regular_b64 = f.read().strip()
with open('/tmp/bold.b64') as f:
    bold_b64 = f.read().strip()

print(f"Read fonts: Regular {len(regular_b64)} chars, Bold {len(bold_b64)} chars")

HTML_TEMPLATE = '''<!DOCTYPE html>
<html lang="th">
<head>
<meta charset="UTF-8">
<title>MMOA Report — Web PP7</title>
<style>
  @font-face {{
    font-family: 'NotoSansThai';
    src: url(data:font/truetype;charset=utf-8;base64,{regular_b64}) format('truetype');
    font-weight: 400;
    font-style: normal;
  }}
  @font-face {{
    font-family: 'NotoSansThai';
    src: url(data:font/truetype;charset=utf-8;base64,{bold_b64}) format('truetype');
    font-weight: 700;
    font-style: normal;
  }}
  
  * {{ margin: 0; padding: 0; box-sizing: border-box; }}
  body {{ 
    font-family: 'NotoSansThai', 'Noto Sans Thai', sans-serif;
    background: #0a0e27;
    color: #fff;
    overflow: hidden;
  }}

  @media print {{
    body {{ overflow: visible; }}
    .slide {{ page-break-after: always; page-break-inside: avoid; }}
  }}

  .slide {{
    width: 297mm;
    height: 167mm;
    padding: 30mm 25mm;
    position: relative;
    display: flex;
    flex-direction: column;
    justify-content: center;
    background: #0a0e27;
    overflow: hidden;
  }}

  .slide::before {{
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0; bottom: 0;
    background: radial-gradient(ellipse at 30% 50%, rgba(59,130,246,0.08) 0%, transparent 70%);
    pointer-events: none;
  }}

  .accent-line {{
    width: 80px;
    height: 4px;
    background: linear-gradient(90deg, #3b82f6, #8b5cf6);
    margin-bottom: 20px;
    border-radius: 2px;
  }}

  h1 {{
    font-size: 42px;
    font-weight: 700;
    line-height: 1.2;
    margin-bottom: 10px;
    background: linear-gradient(135deg, #fff 0%, #93c5fd 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }}

  h2 {{
    font-size: 36px;
    font-weight: 700;
    margin-bottom: 16px;
    color: #e2e8f0;
  }}

  h3 {{
    font-size: 22px;
    font-weight: 700;
    color: #93c5fd;
    margin-bottom: 12px;
  }}

  .subtitle {{
    font-size: 18px;
    color: #94a3b8;
    font-weight: 400;
    margin-bottom: 24px;
  }}

  .grid-2 {{
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
    margin-top: 16px;
  }}

  .grid-3 {{
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 16px;
    margin-top: 16px;
  }}

  .grid-4 {{
    display: grid;
    grid-template-columns: 1fr 1fr 1fr 1fr;
    gap: 14px;
    margin-top: 16px;
  }}

  .card {{
    background: rgba(30, 41, 71, 0.8);
    border: 1px solid rgba(59,130,246,0.2);
    border-radius: 12px;
    padding: 18px;
    backdrop-filter: blur(10px);
  }}

  .card.highlight {{
    border-color: rgba(59,130,246,0.5);
    background: rgba(30, 41, 71, 1);
  }}

  .big-number {{
    font-size: 48px;
    font-weight: 700;
    color: #3b82f6;
    line-height: 1;
    margin-bottom: 4px;
  }}

  .big-number.green {{
    color: #22c55e;
  }}

  .big-number.purple {{
    color: #8b5cf6;
  }}

  .big-number.amber {{
    color: #f59e0b;
  }}

  .card-label {{
    font-size: 13px;
    color: #64748b;
    text-transform: uppercase;
    letter-spacing: 1px;
  }}

  .card-title {{
    font-size: 16px;
    font-weight: 700;
    color: #e2e8f0;
    margin: 6px 0;
  }}

  .card-value {{
    font-size: 14px;
    color: #94a3b8;
    line-height: 1.5;
  }}

  .tag {{
    display: inline-block;
    padding: 4px 12px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 700;
    margin: 2px;
  }}

  .tag-blue {{ background: rgba(59,130,246,0.2); color: #93c5fd; }}
  .tag-green {{ background: rgba(34,197,94,0.2); color: #86efac; }}
  .tag-purple {{ background: rgba(139,92,246,0.2); color: #c4b5fd; }}
  .tag-amber {{ background: rgba(245,158,11,0.2); color: #fcd34d; }}

  .kpi-row {{
    display: flex;
    gap: 12px;
    margin: 8px 0;
    align-items: center;
  }}

  .kpi-icon {{
    font-size: 28px;
    width: 40px;
    text-align: center;
  }}

  .kpi-text {{
    font-size: 15px;
    color: #cbd5e1;
  }}

  .kpi-text strong {{
    color: #fff;
    font-weight: 700;
  }}

  .list-item {{
    font-size: 14px;
    color: #cbd5e1;
    padding: 6px 0;
    border-bottom: 1px solid rgba(255,255,255,0.05);
    display: flex;
    align-items: flex-start;
    gap: 10px;
  }}

  .footer {{
    position: absolute;
    bottom: 15mm;
    left: 25mm;
    right: 25mm;
    font-size: 10px;
    color: #475569;
    display: flex;
    justify-content: space-between;
  }}

  .logo-text {{
    font-weight: 700;
    color: #3b82f6;
  }}

  .cover-title {{
    font-size: 52px;
    font-weight: 700;
    line-height: 1.15;
    margin-bottom: 16px;
  }}

  .cover-title span {{
    background: linear-gradient(135deg, #3b82f6, #8b5cf6, #ec4899);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }}

  .cover-sub {{
    font-size: 16px;
    color: #64748b;
    margin-top: 20px;
  }}

  .quote-box {{
    background: rgba(59,130,246,0.1);
    border-left: 4px solid #3b82f6;
    padding: 16px 20px;
    border-radius: 0 10px 10px 0;
    font-size: 15px;
    color: #e2e8f0;
    font-style: italic;
    margin: 16px 0;
  }}

  .before-after {{
    display: flex;
    align-items: center;
    gap: 16px;
    margin: 12px 0;
  }}

  .ba-box {{
    flex: 1;
    padding: 14px;
    border-radius: 10px;
    text-align: center;
  }}

  .ba-before {{
    background: rgba(239,68,68,0.1);
    border: 1px solid rgba(239,68,68,0.3);
  }}

  .ba-after {{
    background: rgba(34,197,94,0.1);
    border: 1px solid rgba(34,197,94,0.3);
  }}

  .ba-label {{
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 1px;
    margin-bottom: 4px;
  }}

  .ba-before .ba-label {{ color: #fca5a5; }}
  .ba-after .ba-label {{ color: #86efac; }}

  .ba-value {{
    font-size: 22px;
    font-weight: 700;
  }}

  .ba-before .ba-value {{ color: #ef4444; }}
  .ba-after .ba-value {{ color: #22c55e; }}

  .arrow-between {{
    font-size: 28px;
    color: #3b82f6;
  }}

  .section-badge {{
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 6px 16px;
    border-radius: 20px;
    font-size: 14px;
    font-weight: 700;
    margin-bottom: 16px;
  }}

  .badge-m {{ background: rgba(59,130,246,0.2); color: #93c5fd; }}
  .badge-o {{ background: rgba(139,92,246,0.2); color: #c4b5fd; }}
  .badge-a {{ background: rgba(34,197,94,0.2); color: #86efac; }}

  .timeline-item {{
    display: flex;
    gap: 16px;
    align-items: flex-start;
    padding: 10px 0;
    border-bottom: 1px solid rgba(255,255,255,0.05);
  }}

  .timeline-phase {{
    min-width: 80px;
    padding: 6px 12px;
    background: rgba(59,130,246,0.15);
    border-radius: 6px;
    font-size: 13px;
    font-weight: 700;
    color: #93c5fd;
    text-align: center;
  }}

  .timeline-text {{
    font-size: 14px;
    color: #cbd5e1;
    flex: 1;
  }}

  .timeline-status {{
    font-size: 12px;
    padding: 4px 10px;
    border-radius: 12px;
    font-weight: 700;
  }}

  .status-done {{ background: rgba(34,197,94,0.2); color: #86efac; }}
  .status-progress {{ background: rgba(245,158,11,0.2); color: #fcd34d; }}
</style>
</head>
<body>

<!-- Slide 1: Cover -->
<div class="slide">
  <div class="accent-line"></div>
  <div class="subtitle">Web PP7 — AI-Driven HR Platform</div>
  <div class="cover-title">
    <span>MMOA Framework</span><br>
    รายงานผลการดำเนินงาน
  </div>
  <p style="font-size: 16px; color: #94a3b8; margin-top: 12px;">
    Maximize · Minimize · Optimize · Automate
  </p>
  <div class="cover-sub">
    โดย PKG-ปกรณ์(หนึ่ง) + KiloClaw AI<br>
    วันที่ 10 กรกฎาคม 2569
  </div>
  <div class="footer">
    <span class="logo-text">WEB PP7</span>
    <span>1/10</span>
  </div>
</div>

<!-- Slide 2: What is MMOA -->
<div class="slide">
  <div class="accent-line"></div>
  <h2>MMOA คืออะไร?</h2>
  <p class="subtitle">กรอบการทำงาน AI 4 ด้าน สำหรับบริหารบุคลากร</p>
  
  <div class="grid-4">
    <div class="card highlight">
      <div style="font-size: 32px; margin-bottom: 8px;">📈</div>
      <div class="card-title">Maximize</div>
      <div class="card-value">เพิ่มประสิทธิภาพ<br>ทำงานหลายอย่างมากพร้อมกัน</div>
      <div style="margin-top:8px;">
        <span class="tag tag-blue">เพิ่มผลิตภาพ 10-240x</span>
      </div>
    </div>
    <div class="card highlight">
      <div style="font-size: 32px; margin-bottom: 8px;">✂️</div>
      <div class="card-title">Minimize</div>
      <div class="card-value">ลดงานที่ไม่จำเป็น<br>ตัดขั้นตอนซ้ำซ้อน ลด error</div>
      <div style="margin-top:8px;">
        <span class="tag tag-green">ลดงานซ้ำ 85-99.5%</span>
      </div>
    </div>
    <div class="card highlight">
      <div style="font-size: 32px; margin-bottom: 8px;">🎯</div>
      <div class="card-title">Optimize</div>
      <div class="card-value">ปรับให้เหมาะสม<br>Data-driven ลดอคติ</div>
      <div style="margin-top:8px;">
        <span class="tag tag-purple">แม่นยำ +15-35%</span>
      </div>
    </div>
    <div class="card highlight">
      <div style="font-size: 32px; margin-bottom: 8px;">⚡</div>
      <div class="card-title">Automate</div>
      <div class="card-value">ทำอัตโนมัติ<br>กำจัดงานซ้ำๆ ด้วย AI</div>
      <div style="margin-top:8px;">
        <span class="tag tag-amber">ลด manual 98-100%</span>
      </div>
    </div>
  </div>

  <div class="quote-box" style="margin-top: 20px;">
    🚀 เป้าหมายรวม: ลดงาน manual 85-90% · เพิ่ม accuracy +15-35% · เพิ่ม satisfaction → 90-100%
  </div>
  
  <div class="footer">
    <span class="logo-text">WEB PP7</span>
    <span>2/10</span>
  </div>
</div>

<!-- Slide 3: KPIs Overview -->
<div class="slide">
  <div class="accent-line"></div>
  <h2>📊 KPIs รวม — Before vs After</h2>
  <p class="subtitle">ผลลัพธ์ที่วัดได้จากการใช้ MMOA กับ Web PP7</p>
  
  <div style="margin-top: 20px;">
    
    <div class="before-after">
      <div class="ba-box ba-before" style="flex:0.9">
        <div class="ba-label">⏱️ เวลาทำงาน HR</div>
        <div class="ba-value">100%</div>
      </div>
      <div class="arrow-between">→</div>
      <div class="ba-box ba-after" style="flex:0.9">
        <div class="ba-label">After AI</div>
        <div class="ba-value">10-20%</div>
      </div>
      <div style="text-align:center; min-width: 80px;">
        <div style="font-size:20px; font-weight:700; color:#22c55e;">⬇️ 80-90%</div>
      </div>
    </div>

    <div class="before-after">
      <div class="ba-box ba-before" style="flex:0.9">
        <div class="ba-label">🎯 Accuracy</div>
        <div class="ba-value">60-75%</div>
      </div>
      <div class="arrow-between">→</div>
      <div class="ba-box ba-after" style="flex:0.9">
        <div class="ba-label">After AI</div>
        <div class="ba-value">85-95%</div>
      </div>
      <div style="text-align:center; min-width: 80px;">
        <div style="font-size:20px; font-weight:700; color:#22c55e;">⬆️ +15-35%</div>
      </div>
    </div>

    <div class="before-after">
      <div class="ba-box ba-before" style="flex:0.9">
        <div class="ba-label">💰 งาน Manual</div>
        <div class="ba-value">100%</div>
      </div>
      <div class="arrow-between">→</div>
      <div class="ba-box ba-after" style="flex:0.9">
        <div class="ba-label">After AI</div>
        <div class="ba-value">0-10%</div>
      </div>
      <div style="text-align:center; min-width: 80px;">
        <div style="font-size:20px; font-weight:700; color:#22c55e;">⬇️ 90-100%</div>
      </div>
    </div>

    <div class="before-after">
      <div class="ba-box ba-before" style="flex:0.9">
        <div class="ba-label">😊 Employee Satisfaction</div>
        <div class="ba-value">65-75%</div>
      </div>
      <div class="arrow-between">→</div>
      <div class="ba-box ba-after" style="flex:0.9">
        <div class="ba-label">After AI</div>
        <div class="ba-value">90-100%</div>
      </div>
      <div style="text-align:center; min-width: 80px;">
        <div style="font-size:20px; font-weight:700; color:#22c55e;">⬆️ +15-35%</div>
      </div>
    </div>

    <div class="before-after">
      <div class="ba-box ba-before" style="flex:0.9">
        <div class="ba-label">📈 Data-Driven Decision</div>
        <div class="ba-value">30%</div>
      </div>
      <div class="arrow-between">→</div>
      <div class="ba-box ba-after" style="flex:0.9">
        <div class="ba-label">After AI</div>
        <div class="ba-value">80-100%</div>
      </div>
      <div style="text-align:center; min-width: 80px;">
        <div style="font-size:20px; font-weight:700; color:#22c55e;">⬆️ +50-70%</div>
      </div>
    </div>

  </div>

  <div class="footer">
    <span class="logo-text">WEB PP7</span>
    <span>3/10</span>
  </div>
</div>

<!-- Slide 4: Maximize -->
<div class="slide">
  <div class="accent-line"></div>
  <div class="section-badge badge-m">📈 MAXIMIZE — เพิ่มประสิทธิภาพสูงสุด</div>
  <h2>ทำให้ HR ทำได้ 10-240 เท่าในเวลาเท่าเดิม</h2>
  
  <div class="grid-2" style="margin-top: 12px;">
    <div class="card">
      <h3>P1 แสวงหา</h3>
      <div class="kpi-row"><span class="kpi-icon">📨</span><span class="kpi-text">ใบสมัคร: <strong>50-60/วัน → 1,000+/วัน</strong></span></div>
      <div class="kpi-row"><span class="kpi-icon">⏱️</span><span class="kpi-text">เวลา/ใบ: <strong>10-15 นาที → 3.6 วินาที</strong></span></div>
      <div class="kpi-row"><span class="kpi-icon">🎯</span><span class="kpi-text">ความถูกต้อง: <strong>70% → 85%+</strong></span></div>
      <div style="margin-top:8px;">
        <span class="tag tag-blue">YOLO + LLMs + n8n</span>
      </div>
    </div>
    <div class="card">
      <h3>P2 หยั่งประเมิน</h3>
      <div class="kpi-row"><span class="kpi-icon">⏱️</span><span class="kpi-text">เวลา/คน: <strong>2-3 วัน → 5 นาที</strong></span></div>
      <div class="kpi-row"><span class="kpi-icon">👥</span><span class="kpi-text">คน/วัน: <strong>4 คน → 96 คน</strong></span></div>
      <div class="kpi-row"><span class="kpi-icon">🎯</span><span class="kpi-text">ความถูกต้อง: <strong>75% → 90%+</strong></span></div>
      <div style="margin-top:8px;">
        <span class="tag tag-green">LLMs วิเคราะห์ 5 แหล่ง</span>
      </div>
    </div>
    <div class="card">
      <h3>P3 จับคู่</h3>
      <div class="kpi-row"><span class="kpi-icon">⏱️</span><span class="kpi-text">เวลา/ตำแหน่ง: <strong>1-2 วัน → 2 นาที</strong></span></div>
      <div class="kpi-row"><span class="kpi-icon">💼</span><span class="kpi-text">ตำแหน่ง/วัน: <strong>1 → 240</strong></span></div>
      <div class="kpi-row"><span class="kpi-icon">🎯</span><span class="kpi-text">Match Rate: <strong>70% → 88%+</strong></span></div>
      <div style="margin-top:8px;">
        <span class="tag tag-purple">ML Algorithm</span>
      </div>
    </div>
    <div class="card">
      <h3>P4 ประเมินผล</h3>
      <div class="kpi-row"><span class="kpi-icon">⏱️</span><span class="kpi-text">เวลา/คน: <strong>1-2 สัปดาห์ → 10 นาที</strong></span></div>
      <div class="kpi-row"><span class="kpi-icon">👥</span><span class="kpi-text">คน/วัน: <strong>5 → 144</strong></span></div>
      <div class="kpi-row"><span class="kpi-icon">🎯</span><span class="kpi-text">ความถูกต้อง: <strong>60% → 85%+</strong></span></div>
      <div style="margin-top:8px;">
        <span class="tag tag-amber">360° × 5 มุมมอง</span>
      </div>
    </div>
  </div>

  <div class="footer">
    <span class="logo-text">WEB PP7</span>
    <span>4/10</span>
  </div>
</div>

<!-- Slide 5: Minimize -->
<div class="slide">
  <div class="accent-line"></div>
  <div class="section-badge badge-m">✂️ MINIMIZE — ลดงานที่ไม่จำเป็น</div>
  <h2>ไม่มีงานซ้ำซ้อน, ไม่มี human error</h2>
  
  <div style="margin-top: 20px;">
    
    <div class="before-after">
      <div class="ba-box ba-before" style="flex:1">
        <div class="ba-label">⌨️ คีย์ข้อมูลซ้ำซ้อน</div>
        <div class="ba-value">2 ชม./ครั้ง</div>
      </div>
      <div class="arrow-between">→</div>
      <div class="ba-box ba-after" style="flex:1">
        <div class="ba-label">After</div>
        <div class="ba-value">1 นาที/ครั้ง</div>
      </div>
      <div style="text-align:center; min-width:70px;">
        <div style="font-size:18px; font-weight:700; color:#22c55e;">-99.2%</div>
      </div>
    </div>

    <div class="before-after">
      <div class="ba-box ba-before" style="flex:1">
        <div class="ba-label">📄 สร้างเอกสาร</div>
        <div class="ba-value">45 นาที/เอกสาร</div>
      </div>
      <div class="arrow-between">→</div>
      <div class="ba-box ba-after" style="flex:1">
        <div class="ba-label">After</div>
        <div class="ba-value">2 นาที/เอกสาร</div>
      </div>
      <div style="text-align:center; min-width:70px;">
        <div style="font-size:18px; font-weight:700; color:#22c55e;">-95.6%</div>
      </div>
    </div>

    <div class="before-after">
      <div class="ba-box ba-before" style="flex:1">
        <div class="ba-label">✅ อนุมัติหลายชั้น</div>
        <div class="ba-value">7 วัน</div>
      </div>
      <div class="arrow-between">→</div>
      <div class="ba-box ba-after" style="flex:1">
        <div class="ba-label">After (80% auto)</div>
        <div class="ba-value">1 วัน</div>
      </div>
      <div style="text-align:center; min-width:70px;">
        <div style="font-size:18px; font-weight:700; color:#22c55e;">-85.7%</div>
      </div>
    </div>

    <div class="before-after">
      <div class="ba-box ba-before" style="flex:1">
        <div class="ba-label">🔔 แจ้งเตือน</div>
        <div class="ba-value">15 นาที/ครั้ง</div>
      </div>
      <div class="arrow-between">→</div>
      <div class="ba-box ba-after" style="flex:1">
        <div class="ba-label">After</div>
        <div class="ba-value">10 วินาที/ครั้ง</div>
      </div>
      <div style="text-align:center; min-width:70px;">
        <div style="font-size:18px; font-weight:700; color:#22c55e;">-98.9%</div>
      </div>
    </div>

    <div class="before-after">
      <div class="ba-box ba-before" style="flex:1">
        <div class="ba-label">📊 สร้างรายงาน</div>
        <div class="ba-value">1.5 ชม./รายงาน</div>
      </div>
      <div class="arrow-between">→</div>
      <div class="ba-box ba-after" style="flex:1">
        <div class="ba-label">After</div>
        <div class="ba-value">30 วินาที/รายงาน</div>
      </div>
      <div style="text-align:center; min-width:70px;">
        <div style="font-size:18px; font-weight:700; color:#22c55e;">-99.5%</div>
      </div>
    </div>

  </div>

  <div style="margin-top: 12px; color: #94a3b8; font-size: 13px;">
    📊 ลด Human Error: 95-100% · 🔄 Email → n8n auto-extract → Web (ไม่ต้องคีย์เอง)
  </div>
  
  <div class="footer">
    <span class="logo-text">WEB PP7</span>
    <span>5/10</span>
  </div>
</div>

<!-- Slide 6: Optimize -->
<div class="slide">
  <div class="accent-line"></div>
  <div class="section-badge badge-o">🎯 OPTIMIZE — ปรับให้เหมาะสม</div>
  <h2>Data-driven, ไม่มีอคติ, เหมาะสมที่สุด</h2>
  
  <div class="grid-2">
    <div class="card">
      <h3>P2 — BARS-based Evaluation</h3>
      <div class="kpi-row"><span class="kpi-icon">📊</span><span class="kpi-text">Accuracy: <strong>60-70% → 85-90%</strong></span></div>
      <div class="kpi-row"><span class="kpi-icon">🎯</span><span class="kpi-text">ลดอคติ: <strong>-80%</strong></span></div>
      <div style="margin-top:8px; font-size:13px; color:#94a3b8;">
        ตัวอย่าง BARS CC1 ระดับ 5:<br>
        "นำทีมแก้ปัญหาสำเร็จ 3+ ครั้ง, พนักงานพึงพอใจ ≥90%"
      </div>
    </div>
    <div class="card">
      <h3>P3 — Data-driven Matching</h3>
      <div class="kpi-row"><span class="kpi-icon">📊</span><span class="kpi-text">Match Rate: <strong>60-70% → 88%+</strong></span></div>
      <div class="kpi-row"><span class="kpi-icon">🎯</span><span class="kpi-text">ลดอคติ: <strong>-90%</strong></span></div>
      <div style="margin-top:8px; font-size:13px; color:#94a3b8;">
        Match Score = 0.30(skill) + 0.25(experience)<br>+ 0.25(culture) + 0.20(performance)
      </div>
    </div>
    <div class="card">
      <h3>P4 — 360° + AI Analytics</h3>
      <div class="kpi-row"><span class="kpi-icon">📊</span><span class="kpi-text">Accuracy: <strong>60% → 85-90%</strong></span></div>
      <div class="kpi-row"><span class="kpi-icon">🔍</span><span class="kpi-text">Coverage: <strong>1/5 → 5/5 (100%)</strong></span></div>
      <div class="kpi-row"><span class="kpi-icon">⚖️</span><span class="kpi-text">Fairness: <strong>+60%</strong></span></div>
    </div>
    <div class="card">
      <h3>P5 — AI Personalized Plans</h3>
      <div class="kpi-row"><span class="kpi-icon">📊</span><span class="kpi-text">Effectiveness: <strong>50-60% → 85%+</strong></span></div>
      <div class="kpi-row"><span class="kpi-icon">🎯</span><span class="kpi-text">Personalization: <strong>0% → 100%</strong></span></div>
      <div style="margin-top:8px; font-size:13px; color:#94a3b8;">
        CC3 ต่ำ → Trust Communication + Mentor<br>
        CC4 ต่ำ → Teamwork + Cross-functional
      </div>
    </div>
  </div>

  <div class="footer">
    <span class="logo-text">WEB PP7</span>
    <span>6/10</span>
  </div>
</div>

<!-- Slide 7: Automate -->
<div class="slide">
  <div class="accent-line"></div>
  <div class="section-badge badge-a">⚡ AUTOMATE — ทำอัตโนมัติ</div>
  <h2>Zero Manual Work — ทุกอย่างอัตโนมัติ</h2>
  
  <div class="grid-2" style="margin-top: 16px;">
    <div class="card">
      <h3>🤖 Data Collection</h3>
      <div class="kpi-row"><span class="kpi-icon">⏱️</span><span class="kpi-text">2-3 ชม./ครั้ง → <strong>0 manual</strong></span></div>
      <div class="kpi-row"><span class="kpi-icon">🎯</span><span class="kpi-text">Accuracy: <strong>90-95% → 100%</strong></span></div>
      <div style="margin-top:8px;">
        <span class="tag tag-blue">n8n ทุก 1 ชม.</span>
      </div>
      <div style="font-size: 48px; font-weight: 700; color: #22c55e; text-align: right;">100%</div>
      <div style="font-size: 12px; color: #64748b; text-align: right;">Automated Rate</div>
    </div>
    <div class="card">
      <h3>📢 Notifications</h3>
      <div class="kpi-row"><span class="kpi-icon">⏱️</span><span class="kpi-text">15-30 นาที/ครั้ง → <strong>0 manual</strong></span></div>
      <div class="kpi-row"><span class="kpi-icon">🎯</span><span class="kpi-text">Accuracy: <strong>80-90% → 100%</strong></span></div>
      <div style="margin-top:8px;">
        <span class="tag tag-green">Event-based triggers</span>
      </div>
      <div style="font-size: 48px; font-weight: 700; color: #22c55e; text-align: right;">100%</div>
      <div style="font-size: 12px; color: #64748b; text-align: right;">Automated Rate</div>
    </div>
    <div class="card">
      <h3>📊 Report Generation</h3>
      <div class="kpi-row"><span class="kpi-icon">⏱️</span><span class="kpi-text">1-2 ชม./รายงาน → <strong>0 manual</strong></span></div>
      <div class="kpi-row"><span class="kpi-icon">📅</span><span class="kpi-text">Schedule: <strong>08:00, จันทร์, เดือน</strong></span></div>
      <div style="margin-top:8px;">
        <span class="tag tag-purple">Cron auto</span>
      </div>
      <div style="font-size: 48px; font-weight: 700; color: #22c55e; text-align: right;">100%</div>
      <div style="font-size: 12px; color: #64748b; text-align: right;">Automated Rate</div>
    </div>
    <div class="card">
      <h3>💰 Payroll Processing</h3>
      <div class="kpi-row"><span class="kpi-icon">⏱️</span><span class="kpi-text">3-4 วัน/รอบ → <strong>2-3 ชม.</strong></span></div>
      <div class="kpi-row"><span class="kpi-icon">✅</span><span class="kpi-text">Error: <strong>5-10% → &lt;0.5%</strong></span></div>
      <div style="margin-top:8px;">
        <span class="tag tag-amber">Cron วันที่ 1 ทุกเดือน</span>
      </div>
      <div style="font-size: 48px; font-weight: 700; color: #f59e0b; text-align: right;">98%</div>
      <div style="font-size: 12px; color: #64748b; text-align: right;">Automated Rate</div>
    </div>
  </div>

  <div class="footer">
    <span class="logo-text">WEB PP7</span>
    <span>7/10</span>
  </div>
</div>

<!-- Slide 8: Real Deliverables -->
<div class="slide">
  <div class="accent-line"></div>
  <h2>🏆 ผลงานจริงที่สำเร็จแล้ว (Q1-Q2 2569)</h2>
  <p class="subtitle">ไม่ใช่แค่แผน — นี่คือของจริงที่ทำเสร็จแล้ว</p>
  
  <div class="grid-4" style="margin-top: 16px;">
    <div class="card">
      <div class="big-number">56</div>
      <div class="card-label">ไฟล์</div>
      <div class="card-title">Work Instructions</div>
      <div class="card-value">จัดระบบครบทุก P<br>ลดเวลาหา WI ~70%</div>
    </div>
    <div class="card">
      <div class="big-number green">15+</div>
      <div class="card-label">หน้า</div>
      <div class="card-title">UI Prototypes</div>
      <div class="card-value">ทุก P มี UI prototype<br>พร้อม deploy</div>
    </div>
    <div class="card">
      <div class="big-number purple">6</div>
      <div class="card-label">ฟอร์ม</div>
      <div class="card-title">P2 Interview Forms</div>
      <div class="card-value">มาตรฐานเดียวกัน<br>ลดอคติระหว่าง Rater</div>
    </div>
    <div class="card">
      <div class="big-number amber">4</div>
      <div class="card-label">ไฟล์</div>
      <div class="card-title">Backend Apps Script</div>
      <div class="card-value">Auth, DB, Code, Setup<br>Deploy-ready</div>
    </div>
  </div>

  <div class="grid-3" style="margin-top: 14px;">
    <div class="card" style="padding: 14px;">
      <div class="card-title">✅ BARS Infographic</div>
      <div class="card-value">CC5 ระดับ 1-5 ชัดเจน<br>ลดอคติ -80%</div>
    </div>
    <div class="card" style="padding: 14px;">
      <div class="card-title">✅ CEO Dashboard</div>
      <div class="card-value">Real-time ข้อมูล P1-P7<br>Compile 1 วัน → 0</div>
    </div>
    <div class="card" style="padding: 14px;">
      <div class="card-title">✅ Auto-Report Cron</div>
      <div class="card-value">ส่งรายงานทุกวันที่ 9,19,29<br>ลดงาน compile -85%</div>
    </div>
  </div>

  <div class="footer">
    <span class="logo-text">WEB PP7</span>
    <span>8/10</span>
  </div>
</div>

<!-- Slide 9: Demo URLs -->
<div class="slide">
  <div class="accent-line"></div>
  <h2>🔗 Demo Links — ทดลองได้ทันที</h2>
  <p class="subtitle">โปรเจกต์ live ทุกจุด พร้อมให้ทดลอง</p>
  
  <div style="margin-top: 24px;">
    <div class="timeline-item">
      <div class="timeline-phase" style="background: rgba(34,197,94,0.15); color: #86efac;">🌐 LIVE</div>
      <div class="timeline-text">
        <strong style="color:#86efac;">Main Prototype</strong><br>
        <span style="color:#64748b; font-size: 13px;">https://48cd7bb4.web-pp7.pages.dev</span>
      </div>
    </div>
    <div class="timeline-item">
      <div class="timeline-phase">📊</div>
      <div class="timeline-text">
        <strong>Google Sheets PP7</strong> — 12 Tabs ครบทุกกระบวนการ<br>
        <span style="color:#64748b; font-size: 13px;">docs.google.com/spreadsheets/d/1yP_l-WmsnlkMDCkZB7ulhe6oS_AAex8iE3LYdPdg-uc</span>
      </div>
    </div>
    <div class="timeline-item">
      <div class="timeline-phase">📦</div>
      <div class="timeline-text">
        <strong>GitHub Repository</strong> — Source code + Documents<br>
        <span style="color:#64748b; font-size: 13px;">github.com/pakonchotbuncha-netizen/web-pp7</span>
      </div>
    </div>
    <div class="timeline-item">
      <div class="timeline-phase">🎨</div>
      <div class="timeline-text">
        <strong>Canva PP7 Template</strong> — Infographic/Bar Chart มาตรฐาน<br>
        <span style="color:#64748b; font-size: 13px;">Web PP7 Style — Dark Tech / Modern Enterprise</span>
      </div>
    </div>
    <div class="timeline-item">
      <div class="timeline-phase">📋</div>
      <div class="timeline-text">
        <strong>Complete WI Documents</strong> — Work Instructions 56 ไฟล์<br>
        <span style="color:#64748b; font-size: 13px;">WI-Complete/ P1-P7 ครบทุกกระบวนการ</span>
      </div>
    </div>
    <div class="timeline-item">
      <div class="timeline-phase">⚙️</div>
      <div class="timeline-text">
        <strong>Backend Prototype</strong> — Google Apps Script (4 files)<br>
        <span style="color:#64748b; font-size: 13px;">Auth.gs, Database.gs, Code.gs, Setup.gs</span>
      </div>
    </div>
  </div>

  <div class="footer">
    <span class="logo-text">WEB PP7</span>
    <span>9/10</span>
  </div>
</div>

<!-- Slide 10: Closing / Next Steps -->
<div class="slide">
  <div class="accent-line"></div>
  <h2>🗓️ Next Steps & Timeline</h2>
  
  <div style="margin-top: 16px;">
    <div class="timeline-item">
      <div class="timeline-phase" style="background: rgba(34,197,94,0.2);">✅ P1</div>
      <div class="timeline-text">Foundation — DB Schema, Auth, UI Shell</div>
      <span class="timeline-status status-done">เสร็จ มิ.ย.</span>
    </div>
    <div class="timeline-item">
      <div class="timeline-phase">✅ P2</div>
      <div class="timeline-text">Core Modules — P1-P4 CRUD + Data Flow</div>
      <span class="timeline-status status-progress">📅 ก.ค.</span>
    </div>
    <div class="timeline-item">
      <div class="timeline-phase">⏳ P3</div>
      <div class="timeline-text">Remaining — P5-P7 Complete + Reports</div>
      <span class="timeline-status status-progress">📅 ก.ค.</span>
    </div>
    <div class="timeline-item">
      <div class="timeline-phase">⏳ P4</div>
      <div class="timeline-text">Integration + Admin Dashboard + RBAC</div>
      <span class="timeline-status status-progress">📅 ส.ค.</span>
    </div>
    <div class="timeline-item">
      <div class="timeline-phase">⏳ P5</div>
      <div class="timeline-text">Polish, Deploy, Documentation — ทีมเข้าใช้งาน</div>
      <span class="timeline-status status-progress">🎯 12 ส.ค. 2569</span>
    </div>
  </div>

  <div class="quote-box" style="margin-top: 20px; font-size: 16px;">
    🚀 <strong>"ช่วง 6 เดือนที่ผ่านมา เราไม่ได้แค่วางแผน — เราสร้าง prototype 15+ หน้า, จัดระบบ WI 56 ไฟล์, สร้าง BARS ลดอคติ, เขียน backend บน Apps Script, และ Auto-report ทำงานจริงทุกวัน"</strong>
  </div>

  <div style="text-align: center; margin-top: 16px; font-size: 14px; color: #64748b;">
    ขอบคุณครับ 🙏 — PKG-ปกรณ์(หนึ่ง) + KiloClaw AI | 10 กรกฎาคม 2569
  </div>

  <div class="footer">
    <span class="logo-text">WEB PP7</span>
    <span>10/10</span>
  </div>
</div>

</body>
</html>'''

html_content = HTML_TEMPLATE.format(
    regular_b64=regular_b64,
    bold_b64=bold_b64
)

html_path = '/root/.openclaw/workspace/web-pp7/MMOA-PRESENTATION.html'
pdf_path = '/root/.openclaw/workspace/web-pp7/MMOA-PRESENTATION.pdf'

with open(html_path, 'w') as f:
    f.write(html_content)

print(f"HTML written: {len(html_content)} chars")
print(f"Rendering PDF...")

# Render to PDF with Chromium
result = subprocess.run(
    ['chromium', '--headless', '--no-sandbox', '--disable-gpu',
     '--print-to-pdf=' + pdf_path,
     '--print-to-pdf-no-header',
     '--run-all-compositor-stages-before-draw',
     html_path],
    capture_output=True, text=True, timeout=60
)

# Check if PDF was created
import os
if os.path.exists(pdf_path):
    size = os.path.getsize(pdf_path)
    print(f"✅ PDF created: {pdf_path} ({size} bytes, {size/1024:.1f} KB)")
else:
    print("❌ PDF creation failed")
    print("stderr:", result.stderr[-500:])
    sys.exit(1)
