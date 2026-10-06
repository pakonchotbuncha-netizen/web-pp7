const sharp = require('sharp');
const fs = require('fs');

const W = 1360, PAD = 44;
const CONTENT = W - PAD * 2;
const NUMC = PAD + 26;
const CARDX = PAD + 52 + 18;
const CARDW = CONTENT - 70;
const COL = {
  ai: '#0b62d6', aiBg: '#f0f6ff', noteBg: '#fff7ea', noteBd: '#e0b96a',
  hl: '#e8930c', hlBg: '#fff7ea',
  sys: '#17a05e', sysBg: '#eef8f2',
  plain: '#7c8b9d', border: '#d7dee8',
  title: '#132743', text: '#3c4a5c', who: '#657286', sla: '#54606e',
};

// wrap thai/latin text: approx 8.0px per char at font 14.5, 8.6 at 15, safe width limit
const wrap = (s, fontPx, maxPx) => {
  const cpl = Math.floor(maxPx / (fontPx * 0.55));
  const words = s.split('');
  const lines = [];
  let cur = '';
  for (const ch of words) {
    cur += ch;
    if (cur.length >= cpl) { lines.push(cur); cur = ''; }
  }
  if (cur) lines.push(cur);
  return lines;
};

const steps = [
  { n:'01', type:'plain', title:'แจ้งขออัตรากำลัง', who:'หน่วยงาน', sla:'SLA 24 ชม.',
    lines:['หน่วยงานแจ้งความต้องการ + กรอกแบบฟอร์มใบขออัตรากำลังคนลง BCT Spreadsheet'] },
  { n:'02', type:'plain', title:'P1 แสวงหา', who:'PAO', sla:'SLA 2 วัน',
    lines:['จัดทำแผนการแสวงหาอัตรากำลังคน วางแผนแบ่งกรณีภายใน / ภายนอก'] },
  { n:'03', type:'ai', title:'ประกาศรับสมัคร', who:'PAO / AI Draft', sla:'SLA 45 วัน (รอบเปิดรับ)',
    lines:['กระบวนการเดิมคงเดิม: เผยแพร่ประกาศรับสมัครตามช่องทางต่าง ๆ รวมกว่า 10+ ช่องทาง'],
    aiRows:[
      { lead:'AI Draft:', text:'ร่างข้อความประกาศจากใบขออัตราอัตโนมัติ + ตรวจให้ทุกช่องทางข้อมูลตรงกัน (คุณสมบัติ / จำนวน / วันปิดรับ)' },
      { lead:'ช่องทาง:', text:'ปรับภาษา-ความยาวอัตโนมัติ: Facebook แบบเห็นภาพ · LINE แบบสั้น · เว็บประกาศแบบเต็ม · LinkedIn เน้นคุณสมบัติ' },
      { lead:'HITL:', text:'PAO รีวิวร่างเหลือ ๆ ละ 15 นาที แล้วกดเผยแพร่เองทุกครั้ง (ไม่ auto-post)' },
    ]},
  { n:'04', type:'sys', title:'ช่องทาง (Gateway)', who:'System / Rule Engine', sla:'SLA 30 นาที',
    lines:['ระบบตรวจสอบเงื่อนไข + เลือกเส้นทาง: ย้ายภายใน / รับสมัครภายนอก',
           'เป็นกฎเชิงตรรกะ (ไม่ใช่ AI) — ผังเดิมออกแบบถูกต้องแล้ว'] },
  { n:'05', type:'plain', title:'ภายใน (โอนย้าย)', who:'PAO', sla:'SLA 7 วัน',
    lines:['กรณีภายใน: ดำเนินการโอนย้ายและจัดคนให้เหมาะกับงาน ผ่าน OnePage และ Telegram Bot'] },
  { n:'06', type:'ai', title:'ภายนอก (ใบสมัคร)', who:'PAO / AI Validator', sla:'SLA 45 วัน (ช่วงเปิดรับ)',
    lines:['กระบวนการเดิมคงเดิม: เปิดรับและบันทึกใบสมัครจาก 10 ช่องทางลง BCT Spreadsheet'],
    aiRows:[
      { lead:'AI Validator:', text:'ตรวจความครบถ้วนของฟิลด์ + format เลขบัตร / เบอร์โทร / อีเมล' },
      { lead:'กันซ้ำ + OCR:', text:'กันสมัครซ้ำด้วยเลขบัตรประชาชน + OCR บัตรประชาชน / ใบประกาศ เติมฟิลด์อัตโนมัติ (ลดการคีย์มือ)' },
      { lead:'ข้อมูลเดียว:', text:'รวม 10 ช่องทางเป็นโครงสร้างเดียว (Single Source of Truth) — ตามเป้าลดงาน Manual HR 60%+' },
    ]},
  { n:'07', type:'ai', title:'คัดเลือกใบสมัคร (Gateway)', who:'System / AI Screening', sla:'SLA 30 นาที',
    lines:['กระบวนการเดิมคงเดิม: ระบบคัดเลือก + ตรวจความครบถ้วนสมบูรณ์ของเอกสารในใบสมัคร'],
    aiRows:[
      { lead:'AI Screening (ตรงกับ Task 4 ของ Web PP7):', text:'วิเคราะห์เทียบใบสมัครกับคุณสมบัติตำแหน่ง (JOB_POSTING)' },
      { lead:'คะแนน + เหตุผล:', text:'คะแนนความเหมาะสมรายข้อ + รวมผล 3 แบบทดสอบ (ทัศนคติ · ทุนองค์กร-บริการลูกค้า · แรงจูงใจ 3E3P)' },
      { lead:'ขยายโอกาส:', text:'เสนอตำแหน่งทางเลือกที่คุณสมบัติตรง — หลักการ: "AI ช่วยคัด คนตัดสิน"' },
    ]},
  { n:'08', type:'ai', title:'P2 หยั่งประเมิน', who:'PAO / AI Scoring', sla:'SLA 14 วัน',
    lines:['กระบวนการเดิมคงเดิม: ประเมินผู้สมัครด้วยการสัมภาษณ์ + ทดสอบทักษะ CMC + วัดทัศนคติ'],
    aiRows:[
      { lead:'AI Scoring:', text:'รวมคะแนนทุกแบบเป็นโปรไฟล์เดียวต่อผู้สมัคร (ทัศนคติ / ทุนองค์กร / แรงจูงใจ / ทักษะ CMC)' },
      { lead:'เจาะลึก CC:', text:'วิเคราะห์คำตอบอิสระโยงกับ Core Competency (CC1-CC7) พร้อม quote ต้นทางให้ทีมสัมภาษณ์อ้าง' },
      { lead:'ตรวจจับ:', text:'ธงเตือนคำตอบที่ขัดกันเองให้สัมภาษณ์ถามต่อ — ทีมลดเวลาสรุปตัวเลข เหลือเวลาวิเคราะห์นัยต่อคน' },
    ]},
  { n:'09', type:'ai', title:'P3 จับคู่', who:'PAO / AI Matching Algorithm', sla:'SLA 7 วัน',
    lines:['กระบวนการเดิมคงเดิม: จับคู่ผู้สมัครที่ผ่านการประเมินเข้ากับตำแหน่งและทีมงานที่เหมาะสม'],
    aiRows:[
      { lead:'AI Matching:', text:'จัดอันดับผู้สมัครกับตำแหน่งที่เปิดทุกตำแหน่ง พร้อมเหตุผลที่อ่านได้ (คะแนน CC ตรงทีมไหน)' },
      { lead:'ขยายโอกาส:', text:'แนะนำตำแหน่งทางเลือก (P1-A6) หากไม่ผ่านตำแหน่งหลัก' },
      { lead:'ข้อสังเกต (นิยาม 3 ต.ค. 69):', text:'จบ P2 แล้ว P3 = บันทึกผลลงฐานข้อมูล — AI เป็นผู้เสนออันดับ + จัดเก็บ ไม่ใช่ผู้ตัดสิน', note:true },
    ]},
  { n:'10', type:'hl', title:'พิจารณาโดย ผรช.', who:'ผรช.', sla:'SLA 4 ชม.',
    lines:['HITL Gate: ตรวจสอบทักษะ ทัศนคติ และตัดสินใจเลือกผู้สมัคร ผ่าน Telegram Bot / OnePage',
           'AI ไม่เข้าแทรกการตัดสิน (มี Executive Summary ช่วยให้อ่านจบใน 1 นาที)'] },
  { n:'11', type:'hl', title:'อนุมัติขั้นสุดท้าย', who:'ผรช. / PAO Lead', sla:'SLA 4 ชม.',
    lines:['HITL Gate: ตรวจภาพรวม + ความเสี่ยงด้าน Compliance + อนุมัติขั้นสุดท้าย',
           'ทุกการตัดสินถูกบันทึก audit log (OKR Obj.1 KR3: Audit Log ครบ 100%)'] },
  { n:'12', type:'ai', title:'สร้างกลุ่ม + สัญญา', who:'AI System', sla:'SLA 30 นาที',
    lines:['กระบวนการเดิมคงเดิม: เข้าสู่กระบวนการ Onboarding'],
    aiRows:[
      { lead:'AI System:', text:'ออกเอกสารสัญญาอัตโนมัติผ่าน OCR/APIs + สร้างกลุ่ม Telegram รับใช้พร้อมเชิญสมาชิก' },
      { lead:'สิทธิ์อัตโนมัติ:', text:'เปิดสิทธิ์ตามตำแหน่ง (ไม่ whitelist มือ) + เข้าสู่ Onboarding pipeline' },
      { lead:'ความเร็ว:', text:'จาก "อนุมัติเสร็จ" ถึง "เริ่มงาน" ภายใน 30 นาที' },
    ]},
];

const H_HEAD = 150, H_LEG = 56;
const FOOT = [
  'หลักการเดียวกับ Web PP7: AI ช่วยคัด · ช่วยร่าง · ช่วยคำนวณ — คนตัดสิน คนอนุมัติ (HITL)',
  'ผังคงโครงสร้างกระบวนการเดิม 12 ขั้น + ผู้รับผิดชอบเดิมทุกจุด — แทรกบทบาท AI: ขั้น 03/06/08/09 ช่วยงาน PAO คนละส่วน · ขั้น 07/12 เป็นอัตโนมัติล้วน',
  'ผลรวม: งานมือของ PAO ลดลงราว 70-80% (ร่างประกาศ / คีย์ใบสมัคร / สรุปคะแนน) — รอบเปิดรับ 45 วันคงเดิมตามตลาด',
  'ตัววัด: ลด Manual HR >=60% · Self-Service >=90% · Audit Log 100% — สอดคล้อง OKR Web PP7',
];
const H_FOOT = 46 + FOOT.length * 26 + 16;

// layout: compute step heights deterministically
const LINE_H = 24, ROW_LEAD = 6, ROW_PAD = 12, ROW_TXT = 21;
let y = PAD + H_HEAD + H_LEG + 12;
const cardTops = [];
for (const s of steps) {
  let h = 52; // title row zone
  h += s.lines.length * LINE_H;
  if (s.aiRows) {
    for (const r of s.aiRows) {
      const t = r.lead + ' ' + r.text;
      const nLines = wrap(t, 14.5, CARDW - 60).length;
      h += ROW_LEAD + ROW_PAD + nLines * ROW_TXT + ROW_PAD;
    }
    h += 4;
  }
  h += 14;
  cardTops.push(y);
  s._h = Math.round(h);
  y += h + 14;
}
const TOTAL_H = Math.round(y + H_FOOT + 20);

const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const P = [];

P.push(`<rect width="${W}" height="${TOTAL_H}" fill="#f4f7fb"/>`);
P.push(`<defs>
<linearGradient id="hdr" x1="0" y1="0" x2="1" y2="1">
  <stop offset="0" stop-color="#0d2b52"/><stop offset="1" stop-color="#14406e"/>
</linearGradient>
<filter id="soft" x="-20%" y="-20%" width="140%" height="140%">
  <feDropShadow dx="0" dy="2" stdDeviation="4" flood-color="#0b62d6" flood-opacity="0.12"/>
</filter>
</defs>`);

// connector
P.push(`<line x1="${NUMC}" y1="${cardTops[0] + 26}" x2="${NUMC}" y2="${cardTops[cardTops.length - 1] + 26}" stroke="#c8d2dd" stroke-width="6" stroke-linecap="round" opacity="0.5"/>`);

// header
P.push(`<rect x="${PAD}" y="${PAD}" width="${CONTENT}" height="${H_HEAD - 24}" rx="16" fill="url(#hdr)"/>`);
P.push(`<text x="${PAD + 36}" y="${PAD + 54}" font-family="Sarabun" font-weight="700" font-size="30" fill="#fff">การแสวงหาผู้สมัครงาน (สรรหา)</text>`);
P.push(`<text x="${PAD + 36}" y="${PAD + 88}" font-family="Sarabun" font-weight="700" font-size="20" fill="#cfe0f5">กระบวนการเดิม + จุดที่ AI เข้ามาเพิ่มผลผลิต — ยึดขั้นตอนเดิม 12 ขั้นทุกประการ</text>`);
P.push(`<text x="${PAD + 36}" y="${PAD + 114}" font-family="Sarabun" font-size="14.5" fill="#a9c2e2">หลักการ: AI ช่วยคัด / ช่วยร่าง / ช่วยคำนวณ — คนเป็นผู้ตัดสิน (Human-in-the-Loop)</text>`);
const xr = PAD + CONTENT - 36;
P.push(`<text x="${xr}" y="${PAD + 50}" text-anchor="end" font-family="Sarabun" font-size="15" fill="#a9c2e2">เอกสาร LDC-PAO-PM-001</text>`);
P.push(`<text x="${xr}" y="${PAD + 78}" text-anchor="end" font-family="Sarabun" font-weight="700" font-size="19" fill="#fff">Cycle Time รวม 45 วัน</text>`);
P.push(`<text x="${xr}" y="${PAD + 104}" text-anchor="end" font-family="Sarabun" font-size="14" fill="#a9c2e2">จัดทำโดย KiloClaw · 6 ต.ค. 2569</text>`);

// legend
const legend = [
  { t:'AI ช่วย (Draft/Validator/Screening/Scoring/Matching)', col: COL.ai, bg:'#e3f0ff' },
  { t:'HITL Gate — คนตัดสิน', col: COL.hl, bg:'#fff3e0' },
  { t:'System / Rule Engine', col: COL.sys, bg:'#e8f5ee' },
  { t:'กระบวนการเดิม ไม่แทรก AI', col: '#5a6472', bg:'#eceff3' },
];
let lx = PAD + 4;
for (const c of legend) {
  const w = Math.round(c.t.length * 7.6) + 40;
  P.push(`<rect x="${lx}" y="${PAD + H_HEAD + 2}" width="${w}" height="34" rx="17" fill="${c.bg}" stroke="${c.col}" stroke-width="1.5"/>`);
  P.push(`<circle cx="${lx + 19}" cy="${PAD + H_HEAD + 19}" r="7" fill="${c.col}"/>`);
  P.push(`<text x="${lx + 33}" y="${PAD + H_HEAD + 24}" font-family="Sarabun" font-weight="600" font-size="14" fill="${c.col}">${esc(c.t)}</text>`);
  lx += w + 14;
}

// cards
const TYPE = {
  ai: { num: COL.ai, border: '#0b62d6', badge: 'AI ช่วย', badgeBg: COL.ai },
  hl: { num: COL.hl, border: '#e8930c', badge: 'HITL — คนตัดสิน', badgeBg: COL.hl },
  sys: { num: COL.sys, border: '#17a05e', badge: 'System/Rule', badgeBg: COL.sys },
  plain: { num: COL.plain, border: COL.border, badge: 'กระบวนการเดิม', badgeBg: '#8a97a6' },
};
for (let i = 0; i < steps.length; i++) {
  const s = steps[i], ty = cardTops[i], T = TYPE[s.type];
  P.push(`<circle cx="${NUMC}" cy="${ty + 26}" r="26" fill="${T.num}"/>`);
  P.push(`<text x="${NUMC}" y="${ty + 33}" text-anchor="middle" font-family="Sarabun" font-weight="700" font-size="18" fill="#fff">${s.n}</text>`);
  P.push(`<rect x="${CARDX}" y="${ty}" width="${CARDW}" height="${s._h}" rx="12" fill="#fff" stroke="${T.border}" stroke-width="${s.type === 'plain' ? 1.5 : 2}" ${s.type === 'ai' ? 'filter="url(#soft)"' : ''}/>`);
  const tx = CARDX + 22;
  // badge right
  const bw = Math.round(s.who.length * 7.9) + 30;
  P.push(`<rect x="${CARDX + CARDW - 22 - bw}" y="${ty + 14}" width="${bw}" height="26" rx="13" fill="${T.badgeBg}"/>`);
  P.push(`<text x="${CARDX + CARDW - 22 - bw / 2}" y="${ty + 31}" text-anchor="middle" font-family="Sarabun" font-weight="700" font-size="12.5" fill="#fff">${esc(T.badge)}</text>`);
  // title + who
  P.push(`<text x="${tx}" y="${ty + 36}" font-family="Sarabun" font-weight="700" font-size="19" fill="${COL.title}">${esc(s.title)}</text>`);
  P.push(`<text x="${tx + Math.round(s.title.length * 10.6) + 14}" y="${ty + 34}" font-family="Sarabun" font-size="14.5" fill="${COL.who}">${esc('(ผู้รับผิดชอบ: ' + s.who + ')')}</text>`);
  // SLA chip below badge, left
  let dy = ty + 62;
  for (const ln of s.lines) {
    P.push(`<text x="${tx}" y="${dy}" font-family="Sarabun" font-size="15" fill="${COL.text}">${esc(ln)}</text>`);
    dy += LINE_H;
  }
  if (s.aiRows) {
    for (const r of s.aiRows) {
      const full = r.lead + ' ' + r.text;
      const wl = wrap(full, 14.5, CARDW - 60);
      const rowH = ROW_PAD + wl.length * ROW_TXT + ROW_PAD;
      const bg = r.note ? COL.noteBg : COL.aiBg;
      const bd = r.note ? COL.noteBd : '#dbe8fa';
      P.push(`<rect x="${tx}" y="${dy}" width="${CARDW - 44}" height="${rowH}" rx="8" fill="${bg}" stroke="${bd}" stroke-width="${r.note ? 1.5 : 1}"/>`);
      let ry = dy + ROW_PAD + 16;
      let leadDone = false;
      // first line: bold lead
      {
        const first = wl[0];
        const li = r.note ? -1 : first.indexOf(r.lead.trim());
        if (li === 0) {
          P.push(`<text x="${tx + 16}" y="${ry}" font-family="Sarabun" font-weight="700" font-size="14.5" fill="${COL.ai}">${esc(r.lead)}</text>`);
          P.push(`<text x="${tx + 16 + Math.round(r.lead.length * 8.0) + 4}" y="${ry}" font-family="Sarabun" font-size="14.5" fill="#1c3a5e">${esc(first.slice(r.lead.length + 1))}</text>`);
          leadDone = true;
        } else {
          P.push(`<text x="${tx + 16}" y="${ry}" font-family="Sarabun" ${r.note ? 'font-weight="700"' : ''} font-size="14.5" fill="${r.note ? '#8a6d1c' : '#1c3a5e'}">${esc(first)}</text>`);
          leadDone = true;
        }
      }
      ry += ROW_TXT;
      for (let k = 1; k < wl.length; k++) {
        P.push(`<text x="${tx + 16}" y="${ry}" font-family="Sarabun" font-size="14.5" fill="#1c3a5e">${esc(wl[k])}</text>`);
        ry += ROW_TXT;
      }
      // ensure the lead fully drawn when it spans its own line
      if (!leadDone) leadDone = true;
      dy += rowH + 10;
    }
    dy -= 2;
  }
  dy += 4;
}

// footer
const fy = TOTAL_H - H_FOOT - 20;
P.push(`<rect x="${PAD}" y="${fy}" width="${CONTENT}" height="${H_FOOT}" rx="12" fill="#fff" stroke="${COL.border}" stroke-width="1.5"/>`);
let fyy = fy + 36;
FOOT.forEach((ln, i) => {
  P.push(`<text x="${PAD + 26}" y="${fyy}" font-family="Sarabun" ${i === 0 ? 'font-weight="700" font-size="15.5" fill="' + COL.title + '"' : 'font-size="14" fill="' + COL.text + '"'}>${esc(ln)}</text>`);
  fyy += 26;
});

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${TOTAL_H}" viewBox="0 0 ${W} ${TOTAL_H}" font-family="Sarabun">` + P.join('') + `</svg>`;
fs.writeFileSync('flow.svg', svg);
console.log('svg', W + 'x' + TOTAL_H, 'bytes', svg.length);
sharp('flow.svg', { density: 150 }).png({ compressionLevel: 9 }).toFile('flow_full.png')
  .then(m => console.log('PNG', m.width + 'x' + m.height, m.size, 'bytes'))
  .catch(e => { console.log('ERR', e.message); process.exit(1); });
