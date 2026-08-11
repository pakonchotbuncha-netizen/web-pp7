/**
 * PRG/PDG Widget — บทสรุปผู้บริหาร (index.html tab-executive)
 * Reuses window.PKG_PRG_DATA (from prg-pdg-data.js, same dataset as prg-pdg-dashboard.html)
 * PRG = GM ÷ SA | PDG = GM ÷ HRE | ยิ่งสูงยิ่งดี
 */
(function () {
  'use strict';

  const YEARS = ['Y2562','Y2563','Y2564','Y2565','Y2566','Y2567','Y2568','Y2569'];
  const MONTHS = ['ม.ค.','ก.พ.','มี.ค.','เม.ย.','พ.ค.','มิ.ย.','ก.ค.','ส.ค.','ก.ย.','ต.ค.','พ.ย.','ธ.ค.'];
  const MONTHS8 = MONTHS.slice(0, 8);
  const palette = ['#10b981','#3b82f6','#f59e0b','#ef4444','#8b5cf6','#06b6d4','#ec4899','#84cc16','#14b8a6','#6366f1','#f97316','#a855f7','#0ea5e9'];

  const fmtM = (v) => v == null ? '-' : '฿' + Number(v).toFixed(2) + 'M';
  const fmtPct = (v) => v == null ? '-' : (v >= 0 ? '+' : '') + v.toFixed(1) + '%';
  const fmtRatio = (v) => v == null ? '-' : v.toFixed(2);

  function computeDerived(years) {
    const out = {};
    Object.keys(years).forEach((y) => {
      const d = years[y];
      out[y] = {
        gm: d.gm, sa: d.sa, hre: d.hre,
        prg: (d.gm != null && d.sa) ? +(d.gm / d.sa).toFixed(2) : null,
        pdg: (d.gm != null && d.hre) ? +(d.gm / d.hre).toFixed(2) : null,
        pctPRG: d.pctPRG, pctPDG: d.pctPDG, taPDG: d.taPDG
      };
    });
    return out;
  }

  function pillClass(prg, pdg) {
    if (prg == null && pdg == null) return 'bg-gray-100 text-gray-400';
    const p = prg ?? 99, q = pdg ?? 99;
    if (p >= 1.8 && q >= 1.8) return 'bg-emerald-100 text-emerald-700';
    if (p >= 1.3 && q >= 1.3) return 'bg-amber-100 text-amber-700';
    return 'bg-rose-100 text-rose-700';
  }

  function sumMonthly(companies, m) {
    let gm = 0, sa = 0, hre = 0, has = false;
    companies.forEach(c => {
      const md = c.monthly && c.monthly[m];
      if (md) {
        if (md.gm) { gm += md.gm; has = true; }
        if (md.sa) sa += md.sa;
        if (md.hre) hre += md.hre;
      }
    });
    return { gm: has ? +gm.toFixed(2) : 0, sa: has ? +sa.toFixed(2) : 0, hre: has ? +hre.toFixed(2) : 0 };
  }

  function badge(prg, pdg) {
    return `<span class="inline-block px-2 py-0.5 rounded-full text-sm font-semibold ${pillClass(prg, pdg)}">PRG ${fmtRatio(prg)} | PDG ${fmtRatio(pdg)}</span>`;
  }

  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }

  // Chart registry (destroy before recreate to avoid duplicates)
  const charts = {};
  function makeChart(id, config) {
    const el = document.getElementById(id);
    if (!el) return;
    if (charts[id]) { charts[id].destroy(); delete charts[id]; }
    charts[id] = new Chart(el.getContext('2d'), config);
  }

  function buildExecWidget(containerId) {
    const root = document.getElementById(containerId);
    if (!root) return;
    if (!window.PKG_PRG_DATA) { root.innerHTML = '<p class="text-sm text-rose-600">⚠️ ข้อมูล PRG/PDG ยังไม่โหลด</p>'; return; }

    const DATA = window.PKG_PRG_DATA;
    DATA.companies.forEach(c => { c.yearsPRG = computeDerived(c.years); });

    const year = 'Y2568'; // ปีฐานล่าสุดที่มีข้อมูลครบ
    const valid = DATA.companies.filter(c => c.yearsPRG[year]?.prg != null);
    const avgPRG = valid.length ? +(valid.reduce((s,c) => s + c.yearsPRG[year].prg, 0) / valid.length).toFixed(2) : null;
    const avgPDG = valid.length ? +(valid.reduce((s,c) => s + c.yearsPRG[year].pdg, 0) / valid.length).toFixed(2) : null;
    const totalGM = DATA.companies.reduce((s,c) => s + (c.yearsPRG[year]?.gm || 0), 0);
    const totalHRE = DATA.companies.reduce((s,c) => s + (c.yearsPRG[year]?.hre || 0), 0);
    const totalSA = DATA.companies.reduce((s,c) => s + (c.yearsPRG[year]?.sa || 0), 0);

    const prevY = 'Y2567';
    const totalGMPrev = DATA.companies.reduce((s,c) => s + (c.yearsPRG[prevY]?.gm || 0), 0);
    const yoyDelta = totalGMPrev ? ((totalGM - totalGMPrev) / totalGMPrev) * 100 : null;

    // 8-month YTD 2569 (real data Jan–Aug)
    const ytdGM = DATA.companies.reduce((s,c) => s + (c.ytd || []).reduce((ss, m) => ss + (m.gm || 0), 0), 0);
    const ytdHRE = DATA.companies.reduce((s,c) => s + (c.ytd || []).reduce((ss, m) => ss + (m.hre || 0), 0), 0);
    const ytdSA = DATA.companies.reduce((s,c) => s + (c.ytd || []).reduce((ss, m) => ss + (m.sa || 0), 0), 0);
    const ytdPRG = ytdSA ? +(ytdGM / ytdSA).toFixed(2) : null;
    const ytdPDG = ytdHRE ? +(ytdGM / ytdHRE).toFixed(2) : null;

    // YTD same period 2568 (for YoY comparison)
    const ytdGM68 = DATA.companies.reduce((s,c) => s + (c.ytd2568 || []).reduce((ss, m) => ss + (m.gm || 0), 0), 0);
    const ytdHRE68 = DATA.companies.reduce((s,c) => s + (c.ytd2568 || []).reduce((ss, m) => ss + (m.hre || 0), 0), 0);
    const ytdSA68 = DATA.companies.reduce((s,c) => s + (c.ytd2568 || []).reduce((ss, m) => ss + (m.sa || 0), 0), 0);
    const ytdPRG68 = ytdSA68 ? +(ytdGM68 / ytdSA68).toFixed(2) : null;
    const ytdPDG68 = ytdHRE68 ? +(ytdGM68 / ytdHRE68).toFixed(2) : null;
    // Growth: YTD 2569 vs YTD 2568 (same 8 months)
    const ytdGMGrowth = ytdGM68 ? +(((ytdGM - ytdGM68) / ytdGM68) * 100).toFixed(1) : null;
    const ytdPRGGrowth = (ytdPRG != null && ytdPRG68) ? +(((ytdPRG - ytdPRG68) / ytdPRG68) * 100).toFixed(1) : null;
    const ytdPDGGrowth = (ytdPDG != null && ytdPDG68) ? +(((ytdPDG - ytdPDG68) / ytdPDG68) * 100).toFixed(1) : null;
    // The user's formula: เติบโตปีที่แล้ว (Y2568 YoY) ลบกับ เติบโตปีปัจจุบัน (YTD 2569 vs YTD 2568)
    // For PKG (total): Y2568 YoY = yoyDelta (GM)
    // YTD 2569 vs YTD 2568 = ytdGMGrowth (GM)
    // The user asked about PRG growth comparison specifically; use PRG YoY for Y2568 vs YTD 2569 vs 2568 for current.
    // Y2568 PRG YoY = avg pctPRG across companies (or use a representative value)
    const avgPctPRG2568 = valid.length ? +(valid.reduce((s,c) => s + (c.yearsPRG[year].pctPRG || 0), 0) / valid.length).toFixed(1) : null;
    const growthGapPRG = (ytdPRGGrowth != null && avgPctPRG2568 != null) ? +(avgPctPRG2568 - ytdPRGGrowth).toFixed(1) : null;

    const best = valid.slice().sort((a,b) => b.yearsPRG[year].prg - a.yearsPRG[year].prg)[0];
    const worst = valid.slice().sort((a,b) => a.yearsPRG[year].prg - b.yearsPRG[year].prg)[0];
    const declining = valid.filter(c => (c.yearsPRG[year].pctPRG ?? 0) < -10).length;
    const goodCount = valid.filter(c => c.yearsPRG[year].prg >= 1.8).length;
    const tight = valid.filter(c => (c.yearsPRG[year].pdg ?? 99) < 1.5);

    // ===== Auto-generated analysis/insights =====
    // Generate insights from data
    const insights = [];
    
    // 1. Overall trend
    const prgTrend = valid.length ? valid.reduce((s,c) => s + (c.yearsPRG[year].prg || 0), 0) / valid.length : 0;
    const prgPrev = valid.length ? valid.reduce((s,c) => s + (c.yearsPRG[prevY].prg || 0), 0) / valid.length : 0;
    const prgChange = prgPrev ? ((prgTrend - prgPrev) / prgPrev) * 100 : 0;
    
    if (prgChange < -10) {
      insights.push({ type: 'warning', title: '⚠️ PRG ลดลงอย่างมาก', text: `PRG เฉลี่ยลดลง ${prgChange.toFixed(1)}% จากปีก่อน (${prgPrev.toFixed(2)} → ${prgTrend.toFixed(2)}) สะท้อนว่าค่าใช้จ่ายบริหาร (SA) เพิ่มขึ้นเร็วกว่ากำไรขั้นต้น (GM)` });
    } else if (prgChange > 5) {
      insights.push({ type: 'success', title: '✅ PRG ฟื้นตัว', text: `PRG เฉลี่ยเพิ่มขึ้น ${prgChange.toFixed(1)}% จากปีก่อน (${prgPrev.toFixed(2)} → ${prgTrend.toFixed(2)}) แสดงว่าการควบคุมค่าใช้จ่ายบริหารมีประสิทธิภาพ` });
    } else {
      insights.push({ type: 'neutral', title: '📊 PRG คงที่', text: `PRG เฉลี่ยเปลี่ยนแปลงเล็กน้อย (${prgChange.toFixed(1)}%) จากปีก่อน (${prgPrev.toFixed(2)} → ${prgTrend.toFixed(2)})` });
    }
    
    // 2. YTD recovery signal
    if (ytdPRGGrowth > 0) {
      insights.push({ type: 'success', title: '📈 สัญญาณฟื้นตัวใน 2569', text: `YTD 2569 (8 เดือน) PRG เพิ่มขึ้น ${ytdPRGGrowth.toFixed(1)}% เมื่อเทียบกับช่วงเดียวกันของ 2568 แสดงว่าแนวโน้มกำลังฟื้นตัว แต่ต้องติดตามข้อมูลครบปี` });
    } else {
      insights.push({ type: 'warning', title: '⚠️ ยังไม่ฟื้นตัว', text: `YTD 2569 PRG ยังลดลง ${ytdPRGGrowth.toFixed(1)}% เมื่อเทียบกับ 2568 ต้องเร่งปรับปรุงประสิทธิภาพ` });
    }
    
    // 3. Best/worst groups
    const groupPRG = {};
    valid.forEach(c => {
      const g = c.group || 'อื่นๆ';
      if (!groupPRG[g]) groupPRG[g] = { sum: 0, count: 0 };
      groupPRG[g].sum += c.yearsPRG[year].prg;
      groupPRG[g].count++;
    });
    const groupAvg = Object.entries(groupPRG).map(([g, d]) => ({ group: g, avg: d.sum / d.count }));
    const bestGroup = groupAvg.sort((a,b) => b.avg - a.avg)[0];
    const worstGroup = groupAvg.sort((a,b) => a.avg - b.avg)[0];
    
    insights.push({ type: 'info', title: ' กลุ่มที่ดีที่สุด', text: `${bestGroup.group} มี PRG เฉลี่ยสูงสุด (${bestGroup.avg.toFixed(2)}) แสดงว่าจัดการค่าใช้จ่ายบริหารได้ดี` });
    insights.push({ type: 'warning', title: '⚠️ กลุ่มที่ต้องปรับปรุง', text: `${worstGroup.group} มี PRG เฉลี่ยต่ำสุด (${worstGroup.avg.toFixed(2)}) ควรทบทวนโครงสร้างค่าใช้จ่าย` });
    
    // 4. PDG insight
    const pdgAvg = valid.length ? valid.reduce((s,c) => s + (c.yearsPRG[year].pdg || 0), 0) / valid.length : 0;
    if (pdgAvg < 1.5) {
      insights.push({ type: 'warning', title: '⚠️ PDG ต่ำ', text: `PDG เฉลี่ย ${pdgAvg.toFixed(2)} เดือน หมายความว่า GM จ่ายค่าใช้จ่ายสมาชิกได้น้อยกว่า 1.5 เดือน — ความเสี่ยงสูงหาก GM ลดลง` });
    } else if (pdgAvg > 3) {
      insights.push({ type: 'success', title: '✅ PDG สูง', text: `PDG เฉลี่ย ${pdgAvg.toFixed(2)} เดือน แสดงว่า GM สามารถจ่ายค่าใช้จ่ายสมาชิกได้หลายเดือน — ความมั่นคงสูง` });
    }
    
    // 5. Recommendation
    if (ytdGMGrowth > 0 && prgChange < 0) {
      insights.push({ type: 'info', title: '💡 ข้อแนะนำ', text: 'GM เพิ่มขึ้นแต่ PRG ลดลง แสดงว่า SA เพิ่มเร็วกว่า GM ควรทบทวนค่าใช้จ่ายบริหารที่ไม่จำเป็น และเร่งเพิ่มประสิทธิภาพการทำงาน' });
    } else if (ytdGMGrowth < 0) {
      insights.push({ type: 'warning', title: '💡 ข้อแนะนำ', text: 'GM ลดลง ต้องเร่งเพิ่มรายได้หรือลดค่าใช้จ่าย เพื่อรักษาอัตราส่วน PRG/PDG ให้มั่นคง' });
    }
    
    const insightsHtml = insights.map(ins => {
      const colors = {
        success: 'bg-emerald-50 border-emerald-200 text-emerald-800',
        warning: 'bg-amber-50 border-amber-200 text-amber-800',
        info: 'bg-blue-50 border-blue-200 text-blue-800',
        neutral: 'bg-slate-50 border-slate-200 text-slate-800'
      };
      const color = colors[ins.type] || colors.neutral;
      return `<div class="border-l-4 ${color} rounded-r-lg p-3">
        <p class="font-bold text-sm mb-1">${ins.title}</p>
        <p class="text-xs text-slate-700">${ins.text}</p>
      </div>`;
    }).join('');
    const rows = valid.slice().sort((a,b) => b.yearsPRG[year].prg - a.yearsPRG[year].prg).map((c, i) => {
      const d = c.yearsPRG[year];
      const pctPRG = d.pctPRG;
      const pctPDG = d.pctPDG;
      const pctPRGClass = pctPRG == null ? 'text-gray-400' : pctPRG >= 0 ? 'text-emerald-600 font-semibold' : 'text-rose-600 font-semibold';
      const pctPDGClass = pctPDG == null ? 'text-gray-400' : pctPDG >= 0 ? 'text-emerald-600 font-semibold' : 'text-rose-600 font-semibold';
      return `<tr class="border-b border-slate-100 hover:bg-slate-50">
        <td class="px-2 py-1.5 text-sm font-semibold">${i + 1}. ${esc(c.id)}</td>
        <td class="px-2 py-1.5 text-sm text-slate-500">${esc(c.name)}</td>
        <td class="px-2 py-1.5 text-sm text-center">${fmtM(d.gm)}</td>
        <td class="px-2 py-1.5 text-sm text-center">${fmtM(d.sa)}</td>
        <td class="px-2 py-1.5 text-sm text-center">${fmtM(d.hre)}</td>
        <td class="px-2 py-1.5 text-center">${badge(d.prg, d.pdg)}</td>
        <td class="px-2 py-1.5 text-sm text-center ${pctPRGClass}">${pctPRG == null ? '-' : fmtPct(pctPRG)}</td>
        <td class="px-2 py-1.5 text-sm text-center ${pctPDGClass}">${pctPDG == null ? '-' : fmtPct(pctPDG)}</td>
      </tr>`;
    }).join('');

    // ===== ตารางตัวเลขรายปี: GM / S&A / HRE แยกตามปี (2562–2569) =====
    function finTable(metric) {
      const groupBlocks = groupOrder.map(g => {
        const comps = grouped[g];
        const compRows = comps.map(c => {
          const cells = YEARS.map(y => {
            const d = c.yearsPRG[y];
            const isCur = y === 'Y2569';
            if (!d || d[metric] == null) return `<td class="px-2 py-1 text-center text-slate-300 ${isCur ? 'bg-amber-50' : ''}">-</td>`;
            return `<td class="px-2 py-1 text-center text-xs font-mono ${isCur ? 'bg-amber-50 font-semibold' : ''}">${fmtM(d[metric])}</td>`;
          }).join('');
          const v68 = c.yearsPRG['Y2568']?.[metric];
          const v67 = c.yearsPRG['Y2567']?.[metric];
          const yoy = (v68 != null && v67) ? +(((v68 - v67) / v67) * 100).toFixed(1) : null;
          return `<tr class="border-b border-slate-50 hover:bg-slate-50">
            <td class="px-2 py-1 text-xs font-semibold sticky left-0 bg-white">${esc(c.id)}</td>
            <td class="px-2 py-1 text-xs text-slate-500">${esc(c.name)}</td>
            ${cells}
            <td class="px-2 py-1 text-center text-xs font-semibold ${yoy == null ? 'text-slate-300' : yoy >= 0 ? 'text-emerald-600' : 'text-rose-600'}">${yoy != null ? fmtPct(yoy) : '-'}</td>
          </tr>`;
        }).join('');
        const subCells = YEARS.map(y => {
          let sum = 0, has = false;
          comps.forEach(c => { const d = c.yearsPRG[y]; if (d && d[metric] != null) { sum += d[metric]; has = true; } });
          const isCur = y === 'Y2569';
          return `<td class="px-2 py-1 text-center text-xs font-mono font-bold bg-indigo-50/50 ${isCur ? 'bg-amber-50' : ''}">${has ? fmtM(sum) : '-'}</td>`;
        }).join('');
        const sumY = (y) => comps.reduce((s, c) => s + (c.yearsPRG[y]?.[metric] || 0), 0);
        const s68 = sumY('Y2568'), s67 = sumY('Y2567');
        const subYoy = (s68 && s67) ? +(((s68 - s67) / s67) * 100).toFixed(1) : null;
        const subRow = `<tr class="border-b border-indigo-200 bg-indigo-50/40">
          <td class="px-2 py-1 text-xs font-bold text-indigo-800 sticky left-0 bg-indigo-50" colspan="2">📊 รวมกลุ่ม ${esc(g)}</td>
          ${subCells}
          <td class="px-2 py-1 text-center text-xs font-bold ${subYoy == null ? 'text-slate-300' : subYoy >= 0 ? 'text-emerald-700' : 'text-rose-700'}">${subYoy != null ? fmtPct(subYoy) : '-'}</td>
        </tr>`;
        return `<tbody>
          <tr class="bg-slate-100"><td colspan="${YEARS.length + 3}" class="px-2 py-1 text-xs font-bold text-slate-700">▸ ${esc(g)} (${comps.length} บริษัท)</td></tr>
          ${compRows}
          ${subRow}
        </tbody>`;
      }).join('');
      // PKG grand total row
      const totCells = YEARS.map(y => {
        let sum = 0, has = false;
        DATA.companies.forEach(c => { const d = c.yearsPRG[y]; if (d && d[metric] != null) { sum += d[metric]; has = true; } });
        const isCur = y === 'Y2569';
        return `<td class="px-2 py-2 text-center text-sm font-mono font-bold bg-purple-100 ${isCur ? 'bg-amber-100' : ''}">${has ? fmtM(sum) : '-'}</td>`;
      }).join('');
      const totSumY = (y) => DATA.companies.reduce((s, c) => s + (c.yearsPRG[y]?.[metric] || 0), 0);
      const t68 = totSumY('Y2568'), t67 = totSumY('Y2567');
      const totYoy = (t68 && t67) ? +(((t68 - t67) / t67) * 100).toFixed(1) : null;
      const pkgTot = `<tr class="bg-purple-100 border-t-2 border-purple-300">
        <td class="px-2 py-2 text-sm font-bold text-purple-900 sticky left-0 bg-purple-100" colspan="2">🏢 รวมทั้งหมด (PKG)</td>
        ${totCells}
        <td class="px-2 py-2 text-center text-sm font-bold ${totYoy == null ? 'text-slate-300' : totYoy >= 0 ? 'text-emerald-700' : 'text-rose-700'}">${totYoy != null ? fmtPct(totYoy) : '-'}</td>
      </tr>`;
      return `<table class="w-full">
        <thead><tr class="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
          <th class="px-2 py-2 sticky left-0 bg-slate-50">BU</th>
          <th class="px-2 py-2">ชื่อ</th>
          ${YEARS.map(y => `<th class="px-2 py-2 text-center text-xs font-bold ${y === 'Y2569' ? 'bg-amber-100 text-amber-800' : 'text-slate-600'}">${y.replace('Y', '25')}${y === 'Y2569' ? '*' : ''}</th>`).join('')}
          <th class="px-2 py-2 text-center text-xs font-bold text-slate-600">%YoY 68</th>
        </tr></thead>
        ${groupBlocks}
        <tfoot>${pkgTot}</tfoot>
      </table>`;
    }


    // ===== Multi-year matrix: PRG/PDG per year per BU + PKG total =====
    // Sort: group by 'group' field, then put PKG first
    const grouped = {};
    valid.forEach(c => {
      const g = c.group || 'อื่นๆ';
      if (!grouped[g]) grouped[g] = [];
      grouped[g].push(c);
    });
    // Order: กลุ่มแม่ (แม่/รวม) first, then alphabetically
    const groupOrder = Object.keys(grouped).sort((a, b) => {
      if (a === 'แม่') return -1;
      if (b === 'แม่') return 1;
      return a.localeCompare(b);
    });

    const finTablesHtml = `
      <div class="grid grid-cols-1 gap-4">
        <div class="bg-white rounded-xl border border-amber-200 overflow-hidden">
          <div class="px-4 py-3 border-b border-slate-100 flex items-center justify-between flex-wrap gap-2">
            <h4 class="text-sm font-bold text-slate-800">📈 GM (กำไรขั้นต้น) แยกตามปี 2562–2569</h4>
            <span class="text-xs text-slate-500">หน่วย: ล้านบาท (M) | * 2569 = YTD</span>
          </div>
          <div class="overflow-x-auto">${finTable('gm')}</div>
        </div>
        <div class="bg-white rounded-xl border border-purple-200 overflow-hidden">
          <div class="px-4 py-3 border-b border-slate-100 flex items-center justify-between flex-wrap gap-2">
            <h4 class="text-sm font-bold text-slate-800">🏢 S&amp;A (ค่าใช้จ่ายบริหาร) แยกตามปี 2562–2569</h4>
            <span class="text-xs text-slate-500">หน่วย: ล้านบาท (M) | * 2569 = YTD</span>
          </div>
          <div class="overflow-x-auto">${finTable('sa')}</div>
        </div>
        <div class="bg-white rounded-xl border border-rose-200 overflow-hidden">
          <div class="px-4 py-3 border-b border-slate-100 flex items-center justify-between flex-wrap gap-2">
            <h4 class="text-sm font-bold text-slate-800">👥 HRE (ค่าใช้จ่ายสมาชิก) แยกตามปี 2562–2569</h4>
            <span class="text-xs text-slate-500">หน่วย: ล้านบาท (M) | * 2569 = YTD</span>
          </div>
          <div class="overflow-x-auto">${finTable('hre')}</div>
        </div>
      </div>`;

    function cellHtml(v) {
      if (v == null) return '<td class="px-2 py-1 text-center text-slate-300">-</td>';
      const color = v >= 1.8 ? 'text-emerald-700 bg-emerald-50' : v >= 1.3 ? 'text-amber-700 bg-amber-50' : 'text-rose-700 bg-rose-50';
      return `<td class="px-2 py-1 text-center text-xs font-semibold ${color}" title="PRG/PDG = ${v}">${v.toFixed(2)}</td>`;
    }
    function pctCellHtml(v) {
      if (v == null) return '<td class="px-2 py-1 text-center text-slate-300">-</td>';
      const color = v >= 0 ? 'text-emerald-600' : 'text-rose-600';
      return `<td class="px-2 py-1 text-center text-xs font-semibold ${color}">${fmtPct(v)}</td>`;
    }

    // Group subtotals (compute PKG-equivalent per group across years)
    const matrixHtml = groupOrder.map(g => {
      const companies = grouped[g];
      // Group-level aggregated PRG/PDG per year
      const groupRows = companies.map(c => {
        const cells = YEARS.map(y => {
          const d = c.yearsPRG[y];
          if (!d || d.gm == null) return '<td class="px-2 py-1 text-center text-slate-300">-</td>';
          return `<td class="px-2 py-1 text-center text-xs font-mono">
            <div class="font-semibold ${d.prg >= 1.8 ? 'text-emerald-700' : d.prg >= 1.3 ? 'text-amber-700' : 'text-rose-700'}">${d.prg.toFixed(2)}</div>
            <div class="${d.pdg >= 1.8 ? 'text-emerald-600' : d.pdg >= 1.3 ? 'text-amber-600' : 'text-rose-600'}">${d.pdg != null ? d.pdg.toFixed(2) : '-'}</div>
          </td>`;
        }).join('');
        const y2568 = c.yearsPRG['Y2568'];
        const y2567 = c.yearsPRG['Y2567'];
        return `<tr class="border-b border-slate-50 hover:bg-slate-50">
          <td class="px-2 py-1 text-xs font-semibold sticky left-0 bg-white">${esc(c.id)}</td>
          <td class="px-2 py-1 text-xs text-slate-500">${esc(c.name)}</td>
          ${cells}
          <td class="px-2 py-1 text-center text-xs font-semibold ${y2568?.pctPRG >= 0 ? 'text-emerald-600' : 'text-rose-600'}">${y2568?.pctPRG != null ? fmtPct(y2568.pctPRG) : '-'}</td>
        </tr>`;
      }).join('');
      // Group subtotal (sum GM/SA/HRE then compute)
      const subtotalRow = (() => {
        const cells = YEARS.map(y => {
          let gG = 0, gS = 0, gH = 0, has = false;
          companies.forEach(c => {
            const d = c.yearsPRG[y];
            if (d && d.gm != null) {
              gG += d.gm; gS += d.sa; gH += d.hre; has = true;
            }
          });
          if (!has) return '<td class="px-2 py-1 text-center text-slate-300">-</td>';
          const prg = +(gG / gS).toFixed(2);
          const pdg = +(gG / gH).toFixed(2);
          return `<td class="px-2 py-1 text-center text-xs font-mono bg-indigo-50/50">
            <div class="font-bold ${prg >= 1.8 ? 'text-emerald-700' : prg >= 1.3 ? 'text-amber-700' : 'text-rose-700'}">${prg.toFixed(2)}</div>
            <div class="${pdg >= 1.8 ? 'text-emerald-600' : pdg >= 1.3 ? 'text-amber-600' : 'text-rose-600'}">${pdg.toFixed(2)}</div>
          </td>`;
        }).join('');
        // Subtotal YoY change
        const sumG = (y) => companies.reduce((s, c) => s + (c.yearsPRG[y]?.gm || 0), 0);
        const sumS = (y) => companies.reduce((s, c) => s + (c.yearsPRG[y]?.sa || 0), 0);
        const sumH = (y) => companies.reduce((s, c) => s + (c.yearsPRG[y]?.hre || 0), 0);
        const prg68 = sumS('Y2568') ? +(sumG('Y2568') / sumS('Y2568')).toFixed(2) : null;
        const prg67 = sumS('Y2567') ? +(sumG('Y2567') / sumS('Y2567')).toFixed(2) : null;
        const yoyPct = (prg68 != null && prg67) ? +(((prg68 - prg67) / prg67) * 100).toFixed(1) : null;
        return `<tr class="border-b border-indigo-200 bg-indigo-50/40">
          <td class="px-2 py-1 text-xs font-bold text-indigo-800 sticky left-0" colspan="2">📊 รวมกลุ่ม ${esc(g)}</td>
          ${cells}
          <td class="px-2 py-1 text-center text-xs font-bold ${yoyPct >= 0 ? 'text-emerald-700' : 'text-rose-700'}">${yoyPct != null ? fmtPct(yoyPct) : '-'}</td>
        </tr>`;
      })();
      return `<tbody>
        <tr class="bg-slate-100"><td colspan="${YEARS.length + 3}" class="px-2 py-1 text-xs font-bold text-slate-700">▸ ${esc(g)} (${companies.length} บริษัท)</td></tr>
        ${groupRows}
        ${subtotalRow}
      </tbody>`;
    }).join('');

    // PKG grand total row (sum of all companies)
    const pkgRow = (() => {
      const cells = YEARS.map(y => {
        let gG = 0, gS = 0, gH = 0, has = false;
        DATA.companies.forEach(c => {
          const d = c.yearsPRG[y];
          if (d && d.gm != null) { gG += d.gm; gS += d.sa; gH += d.hre; has = true; }
        });
        if (!has) return '<td class="px-2 py-2 text-center text-slate-300">-</td>';
        const prg = +(gG / gS).toFixed(2);
        const pdg = +(gG / gH).toFixed(2);
        return `<td class="px-2 py-2 text-center text-sm font-mono bg-purple-100">
          <div class="font-bold ${prg >= 1.8 ? 'text-emerald-700' : prg >= 1.3 ? 'text-amber-700' : 'text-rose-700'}">${prg.toFixed(2)}</div>
          <div class="${pdg >= 1.8 ? 'text-emerald-600' : pdg >= 1.3 ? 'text-amber-600' : 'text-rose-600'}">${pdg.toFixed(2)}</div>
        </td>`;
      }).join('');
      const sumG = (y) => DATA.companies.reduce((s, c) => s + (c.yearsPRG[y]?.gm || 0), 0);
      const sumS = (y) => DATA.companies.reduce((s, c) => s + (c.yearsPRG[y]?.sa || 0), 0);
      const prg68 = sumS('Y2568') ? +(sumG('Y2568') / sumS('Y2568')).toFixed(2) : null;
      const prg67 = sumS('Y2567') ? +(sumG('Y2567') / sumS('Y2567')).toFixed(2) : null;
      const yoyPct = (prg68 != null && prg67) ? +(((prg68 - prg67) / prg67) * 100).toFixed(1) : null;
      return `<tr class="bg-purple-100 border-t-2 border-purple-300">
        <td class="px-2 py-2 text-sm font-bold text-purple-900 sticky left-0" colspan="2">🏢 รวมทั้งหมด (PKG)</td>
        ${cells}
        <td class="px-2 py-2 text-center text-xs font-bold ${yoyPct >= 0 ? 'text-emerald-700' : 'text-rose-700'}">${yoyPct != null ? fmtPct(yoyPct) : '-'}</td>
      </tr>`;
    })();

    const yearHeaders = YEARS.map(y => {
      const isCurrent = y === 'Y2569';
      return `<th class="px-2 py-2 text-center text-xs font-bold ${isCurrent ? 'bg-amber-100 text-amber-800' : 'text-slate-600'}">${y.replace('Y', '25')}${isCurrent ? '*' : ''}</th>`;
    }).join('');

    root.innerHTML = `
      <div class="space-y-5">
        <!-- Header note -->
        <div class="flex flex-wrap items-center justify-between gap-2">
          <p class="text-sm text-slate-600">📊 <strong>PRG/PDG Dashboard</strong> — สุขภาพธุรกิจบริษัทในเครือ PKG <span class="text-slate-400">(ข้อมูลเดียวกับ prg-pdg-dashboard)</span></p>
          <a href="prg-pdg-dashboard.html" target="_blank" class="text-xs font-medium text-indigo-600 hover:text-indigo-800">เปิด Dashboard เต็ม →</a>
        </div>

        <!-- KPI cards -->
        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          <div class="rounded-xl p-3 bg-gradient-to-br from-emerald-50 to-emerald-100 border border-emerald-200">
            <p class="text-sm text-emerald-600 font-semibold">💰 PRG เฉลี่ย ${year.replace('Y','')}</p>
            <p class="text-2xl font-bold text-emerald-700">${fmtRatio(avgPRG)}</p>
            <p class="text-xs text-slate-500">GM ÷ SA</p>
          </div>
          <div class="rounded-xl p-3 bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200">
            <p class="text-sm text-blue-600 font-semibold">🛡️ PDG เฉลี่ย ${year.replace('Y','')}</p>
            <p class="text-2xl font-bold text-blue-700">${fmtRatio(avgPDG)}</p>
            <p class="text-xs text-slate-500">GM ÷ HRE</p>
          </div>
          <div class="rounded-xl p-3 bg-gradient-to-br from-amber-50 to-amber-100 border border-amber-200">
            <p class="text-sm text-amber-600 font-semibold">📈 GM รวม ${year.replace('Y','')}</p>
            <p class="text-2xl font-bold text-amber-700">${fmtM(totalGM)}</p>
            <p class="text-xs text-slate-500">YoY: ${fmtPct(yoyDelta)}</p>
          </div>
          <div class="rounded-xl p-3 bg-gradient-to-br from-rose-50 to-rose-100 border border-rose-200">
            <p class="text-sm text-rose-600 font-semibold">👥 HRE รวม ${year.replace('Y','')}</p>
            <p class="text-2xl font-bold text-rose-700">${fmtM(totalHRE)}</p>
            <p class="text-xs text-slate-500">ค่าใช้จ่ายสมาชิก</p>
          </div>
          <div class="rounded-xl p-3 bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200">
            <p class="text-sm text-purple-600 font-semibold">🏢 SA รวม ${year.replace('Y','')}</p>
            <p class="text-2xl font-bold text-purple-700">${fmtM(totalSA)}</p>
            <p class="text-xs text-slate-500">ค่าใช้จ่ายบริหาร</p>
          </div>
          <div class="rounded-xl p-3 bg-gradient-to-br ${growthGapPRG >= 0 ? 'from-emerald-50 to-emerald-100 border-emerald-200' : 'from-rose-50 to-rose-100 border-rose-200'} border">
            <p class="text-sm font-semibold ${growthGapPRG >= 0 ? 'text-emerald-600' : 'text-rose-600'}">🔄 ความต่าง %Growth PRG</p>
            <p class="text-2xl font-bold ${growthGapPRG >= 0 ? 'text-emerald-700' : 'text-rose-700'}">${fmtPct(growthGapPRG)}</p>
            <p class="text-xs text-slate-500">%YoY Y2568 (${fmtPct(avgPctPRG2568)}) - %YTD 2569 (${fmtPct(ytdPRGGrowth)})</p>
          </div>
        </div>

        <!-- Charts row -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div class="bg-white rounded-xl border border-slate-200 p-4">
            <div class="flex items-center justify-between mb-2">
              <h4 class="text-sm font-bold text-slate-800">📈 แนวโน้ม PRG/PDG (8 ปี)</h4>
              <select id="prgpdg-trend-mode" onchange="window.PKG_PDG_WIDGET.renderTrend()" class="text-xs px-2 py-1 border border-slate-300 rounded">
                <option value="all">ทุกบริษัท</option>
                <option value="pkg">เฉพาะ PKG</option>
                <option value="top5">Top 5 PRG</option>
              </select>
            </div>
            <div class="h-64"><canvas id="prgpdg-chart-trend"></canvas></div>
          </div>
          <div class="bg-white rounded-xl border border-slate-200 p-4">
            <h4 class="text-sm font-bold text-slate-800 mb-2">📅 GM รายเดือน Y2569 (ม.ค.–ส.ค.)</h4>
            <div class="h-64"><canvas id="prgpdg-chart-monthly"></canvas></div>
          </div>
        </div>

        <!-- YTD + insights -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div class="bg-indigo-50 border border-indigo-200 rounded-xl p-4">
            <p class="text-xs font-bold text-indigo-800 mb-2">📈 YTD 2569 vs YTD 2568 (ม.ค.–ส.ค.)</p>
            <div class="text-sm text-slate-700 space-y-1">
              <p>GM 2569: <span class="font-bold">฿${ytdGM.toFixed(2)}M</span> | 2568: ฿${ytdGM68.toFixed(2)}M | <span class="${ytdGMGrowth>=0?'text-emerald-700':'text-rose-700'} font-semibold">${fmtPct(ytdGMGrowth)}</span></p>
              <p>PRG 2569: <span class="font-bold">${fmtRatio(ytdPRG)}</span> | 2568: ${fmtRatio(ytdPRG68)} | <span class="${ytdPRGGrowth>=0?'text-emerald-700':'text-rose-700'} font-semibold">${fmtPct(ytdPRGGrowth)}</span></p>
              <p>PDG 2569: <span class="font-bold">${fmtRatio(ytdPDG)}</span> | 2568: ${fmtRatio(ytdPDG68)} | <span class="${ytdPDGGrowth>=0?'text-emerald-700':'text-rose-700'} font-semibold">${fmtPct(ytdPDGGrowth)}</span></p>
            </div>
            <p class="text-xs text-slate-500 mt-2">⚠️ ก.ค.–ส.ค. ยังเป็นข้อมูลบางส่วน (ก.ค. มีบางบริษัท, ส.ค. ยังว่าง)</p>
          </div>
          <div class="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
            <p class="text-xs font-bold text-emerald-800 mb-1">🏆 บริษัทที่ดีที่สุด (${year.replace('Y','')})</p>
            <p class="text-lg font-bold text-emerald-700">${esc(best.id)}</p>
            <p class="text-xs text-slate-600">${esc(best.name)} — ${badge(best.yearsPRG[year].prg, best.yearsPRG[year].pdg)}</p>
          </div>
          <div class="bg-rose-50 border border-rose-200 rounded-xl p-4">
            <p class="text-xs font-bold text-rose-800 mb-1">⚠️ ต้องจับตา (${year.replace('Y','')})</p>
            <p class="text-lg font-bold text-rose-700">${esc(worst.id)}</p>
            <p class="text-xs text-slate-600">${esc(worst.name)} — ${badge(worst.yearsPRG[year].prg, worst.yearsPRG[year].pdg)}</p>
            <p class="text-xs text-slate-500 mt-1">🟢 ${goodCount} บริษัทดี | 🔴 ${declining} บริษัท PRG ลด >10% ${tight.length ? '| ⚡ ' + tight.length + ' บริษัท PDG<1.5' : ''}</p>
          </div>
        </div>

        <!-- Auto-generated insights -->
        <div class="bg-white rounded-xl border border-slate-200 p-4">
          <h4 class="text-sm font-bold text-slate-800 mb-3">📝 บทวิเคราะห์อัตโนมัติ (จากข้อมูลจริง)</h4>
          <div class="space-y-2">
            ${insightsHtml}
          </div>
          <p class="text-xs text-slate-400 mt-3 italic">* บทวิเคราะห์นี้สร้างอัตโนมัติจากข้อมูล PRG/PDG อาจไม่ครอบคลุมปัจจัยภายนอก เช่น เศรษฐกิจ, นโยบายรัฐ, การแข่งขัน</p>
        </div>

        <!-- Multi-year matrix: PRG/PDG per year per BU + PKG total -->
        <div class="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div class="px-4 py-3 border-b border-slate-100 flex items-center justify-between flex-wrap gap-2">
            <h4 class="text-sm font-bold text-slate-800">📅 PRG/PDG แยก BU × ทุกปี (2562–2569) — <span class="text-purple-700">PRG/PDG</span></h4>
            <div class="text-xs text-slate-500">* 2569 = YTD (ม.ค.–ส.ค.) | 🟢 ≥1.8 🟡 1.3–1.8 🔴 &lt;1.3 | ตัวบน=PRG, ตัวล่าง=PDG</div>
          </div>
          <div class="overflow-x-auto">
            <table class="w-full">
              <thead>
                <tr class="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                  <th class="px-2 py-2 sticky left-0 bg-slate-50">BU</th>
                  <th class="px-2 py-2">ชื่อ</th>
                  ${yearHeaders}
                  <th class="px-2 py-2 text-center text-xs font-bold text-slate-600">%YoY PRG</th>
                </tr>
              </thead>
              ${matrixHtml}
              <tfoot>${pkgRow}</tfoot>
            </table>
          </div>
        </div>

        <!-- Growth chart -->
        <div class="bg-white rounded-xl border border-slate-200 p-4">
          <h4 class="text-sm font-bold text-slate-800 mb-3">📊 % การเติบโต YoY (${year.replace('Y','')} vs ปีก่อน)</h4>
          <div class="h-64"><canvas id="prgpdg-chart-growth"></canvas></div>
        </div>

        <!-- Company table -->
        <div class="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div class="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
            <h4 class="text-sm font-bold text-slate-800">🏢 เปรียบเทียบรายบริษัท (${year.replace('Y','')})</h4>
            <span class="text-xs text-slate-400">🟢 ดี ≥1.8 | 🟡 พอใช้ 1.3–1.8 | 🔴 ต่ำ &lt;1.3</span>
          </div>
          <div class="overflow-x-auto">
            <table class="w-full">
              <thead><tr class="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                <th class="px-3 py-2">บริษัท</th>
                <th class="px-3 py-2">ชื่อ</th>
                <th class="px-3 py-2 text-center">GM</th>
                <th class="px-3 py-2 text-center">S&amp;A</th>
                <th class="px-3 py-2 text-center">HRE</th>
                <th class="px-3 py-2 text-center">PRG / PDG</th>
                <th class="px-3 py-2 text-center">%Δ PRG</th>
                <th class="px-3 py-2 text-center">%Δ PDG</th>
              </tr></thead>
              <tbody>${rows}</tbody>
            </table>
          </div>
        </div>

        <!-- GM / S&A / HRE แยกตามปี (2562–2569) -->
        <div class="space-y-4">
          <div class="flex items-center justify-between flex-wrap gap-2">
            <h3 class="text-base font-bold text-slate-800">💵 ตัวเลขรายปี: GM / S&amp;A / HRE (2562–2569)</h3>
            <span class="text-xs text-slate-400">หน่วย: ล้านบาท | * 2569 = YTD ม.ค.–ส.ค. | %YoY 68 = เทียบ 2567→2568</span>
          </div>
          ${finTablesHtml}
        </div>
      </div>
    `;
  }

  function renderTrend() {
    const DATA = window.PKG_PRG_DATA;
    if (!DATA) return;
    const mode = document.getElementById('prgpdg-trend-mode')?.value || 'all';
    let chosen = DATA.companies;
    if (mode === 'pkg') chosen = DATA.companies.filter(c => c.id === 'PKG');
    if (mode === 'top5') chosen = DATA.companies
      .filter(c => c.yearsPRG['Y2568']?.prg != null)
      .sort((a,b) => b.yearsPRG['Y2568'].prg - a.yearsPRG['Y2568'].prg).slice(0, 5);

    const datasets = [];
    chosen.forEach((c, i) => {
      const color = palette[i % palette.length];
      datasets.push({
        label: c.id + ' PRG',
        data: YEARS.map(y => c.yearsPRG[y]?.prg ?? null),
        borderColor: color, backgroundColor: color + '20',
        tension: 0.3, pointRadius: 4, borderWidth: 2, yAxisID: 'y'
      });
      datasets.push({
        label: c.id + ' PDG',
        data: YEARS.map(y => c.yearsPRG[y]?.pdg ?? null),
        borderColor: color, borderDash: [5, 5],
        tension: 0.3, pointRadius: 3, borderWidth: 1.5, yAxisID: 'y1'
      });
    });
    makeChart('prgpdg-chart-trend', {
      type: 'line',
      data: { labels: YEARS, datasets },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { position: 'bottom', labels: { font: { size: 10 }, boxWidth: 12 } } },
        scales: {
          y: {
            type: 'linear', display: true, position: 'left',
            title: { display: true, text: 'PRG (เดือน)' }, beginAtZero: true,
            suggestedMax: 2.5
          },
          y1: {
            type: 'linear', display: true, position: 'right',
            title: { display: true, text: 'PDG (เดือน)' }, beginAtZero: true,
            grid: { drawOnChartArea: false }
          }
        }
      }
    });
  }

  function renderMonthly() {
    const DATA = window.PKG_PRG_DATA;
    if (!DATA) return;
    const companies = DATA.companies;
    const gm = [], sa = [], hre = [];
    MONTHS8.forEach(m => {
      const s = sumMonthly(companies, m);
      gm.push(s.gm); sa.push(s.sa); hre.push(s.hre);
    });
    makeChart('prgpdg-chart-monthly', {
      type: 'line',
      data: {
        labels: MONTHS8,
        datasets: [
          { label: 'GM', data: gm, borderColor: '#10b981', backgroundColor: '#10b98120', tension: 0.3, borderWidth: 2.5, pointRadius: 4 },
          { label: 'SA', data: sa, borderColor: '#3b82f6', backgroundColor: '#3b82f620', tension: 0.3, borderWidth: 2, pointRadius: 3 },
          { label: 'HRE', data: hre, borderColor: '#f59e0b', backgroundColor: '#f59e0b20', tension: 0.3, borderWidth: 2, pointRadius: 3 }
        ]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { position: 'bottom' } },
        scales: { y: { title: { display: true, text: 'ล้านบาท' }, beginAtZero: true } }
      }
    });
  }

  function renderGrowth() {
    const DATA = window.PKG_PRG_DATA;
    if (!DATA) return;
    // YoY growth for each company (PRG and PDG)
    // Use the most recent year that has pctPRG (Y2568). Show same-year pct values
    // and also a second-year for comparison if available.
    const data = DATA.companies
      .filter(c => c.yearsPRG['Y2568']?.pctPRG != null)
      .sort((a, b) => a.yearsPRG['Y2568'].pctPRG - b.yearsPRG['Y2568'].pctPRG);
    const labels = data.map(c => c.id);
    const pctPRG = data.map(c => c.yearsPRG['Y2568'].pctPRG);
    const pctPDG = data.map(c => c.yearsPRG['Y2568'].pctPDG);

    makeChart('prgpdg-chart-growth', {
      type: 'bar',
      data: {
        labels,
        datasets: [
          { label: '%Δ PRG (Y2568 vs Y2567)', data: pctPRG, backgroundColor: '#10b981' },
          { label: '%Δ PDG (Y2568 vs Y2567)', data: pctPDG, backgroundColor: '#3b82f6' }
        ]
      },
      options: {
        indexAxis: 'y',
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { position: 'bottom' } },
        scales: {
          x: {
            title: { display: true, text: '% Growth / Decline' },
            ticks: { callback: (v) => v + '%' }
          }
        }
      }
    });
  }

  function init() {
    if (!window.PKG_PRG_DATA) return;
    window.PKG_PRG_DATA.companies.forEach(c => { c.yearsPRG = computeDerived(c.years); });
    buildExecWidget('prg-pdg-widget');
    // Charts are created while the tab may be hidden; re-render when shown
    window.requestAnimationFrame(() => { renderTrend(); renderMonthly(); renderGrowth(); });
  }

  function onShow() {
    if (!window.PKG_PRG_DATA) return;
    if (!window.PKG_PRG_DATA.companies[0].yearsPRG) {
      window.PKG_PRG_DATA.companies.forEach(c => { c.yearsPRG = computeDerived(c.years); });
    }
    renderTrend();
    renderMonthly();
    renderGrowth();
  }

  window.PKG_PDG_WIDGET = { init, onShow, renderTrend, renderMonthly, renderGrowth, buildExecWidget };

  // Auto init after data + DOM ready
  function boot() {
    if (window.PKG_PRG_DATA && document.readyState !== 'loading') {
      if (window.Chart) init();
      else setTimeout(boot, 200);
    } else {
      setTimeout(boot, 200);
    }
  }
  boot();
})();
