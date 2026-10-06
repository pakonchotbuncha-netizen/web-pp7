const sharp = require('sharp');
const fs = require('fs');

const W = 1360, PAD = 44;
const CONTENT = W - PAD * 2;
const COL = {
  ai: '#0b62d6', aiBg: '#f0f6ff', okBg: '#eaf2ff',
  hl: '#e8930c', hlBg: '#fff7ea',
  sys: '#17a05e', sysBg: '#eef8f2',
  plain: '#7c8b9d', border: '#d7dee8',
  title: '#132743', text: '#3c4a5c', who: '#657286', sla: '#54606e',
};

const wrap = (s, fontPx, maxPx) => {
  const cpl = Math.floor(maxPx / (fontPx * 0.55));
  const lines = []; let cur = '';
  for (const ch of s) { cur += ch; if (cur.length >= cpl) { lines.push(cur); cur = ''; } }
  if (cur) lines.push(cur);
  return lines;
};

const add = [
  { n:'A', title:'ขั้น 01 — AI ตรวจฟอร์มขออัตรากำลังทันทีที่กรอก', tag:'เสริมใหม่',
    body:'ตรวจฟอร์มขออัตราว่าครบ/ถูก format ทันที (คุณสมบัติ · จำนวน · เงื่อนไข) แล้วเด้งให้หน่วยงานแก้ภายใน 5-10 นาที',
    why:'ที่มาของคุณสมบัติ = JOB_POSTING — ถ้าไม่ครบ ทั้งสายขั้น 03-07 ต้องตามถามซ้ำ (ลดงานตามแก้ต้นทาง)' },
  { n:'B', title:'ขั้น 02 — AI ช่วยวางแผนการสรรหา (P1)', tag:'เสริมใหม่',
    body:'วิเคราะห์ข้อมูลการจ้างงานในอดีต + อัตราลาออก + การเคลื่อนที่ของทีม → ช่วย PAO ตั้งจำนวนเสนอ + ช่องทางที่เหมาะกับตำแหน่ง',
    why:'เปลี่ยนจากอาศัยประสบการณ์ล้วน → ใช้ข้อมูลจริงประกอบการตัดสิน (Data-Driven)' },
  { n:'C', title:'ขั้น 05 — AI จับคู่โอนย้ายภายใน', tag:'เสริมใหม่',
    body:'เทียบ Core Competency ปัจจุบันของสมาชิกกับงานที่เปิดโอนย้าย + ชี้เคส "คนนี้ fit งานอื่นมากกว่า"',
    why:'ลด 7 วันของขั้นตอนโอนย้ายที่ต้องเปิดไฟล์ข้อมูลเก่าทีละไฟล์ด้วยมือ' },
  { n:'D', title:'ขั้น 10-11 — AI สรุป Executive Summary หน้าเดียว ให้ HITL ตัดสินไว', tag:'เสริมใหม่',
    body:'สรุปผู้สมัครแต่ละคนเป็นหน้าเดียว: ผลคัดกรอง / ตัวเลขทุกแบบทดสอบ / ธงเตือน / quote สำคัญ',
    why:'HITL Gate ที่ 10-11 มีเวลาแค่ 4 ชม. — decision-ready ทำให้ตัดสินเร็ว + ไม่ต้องเปิดเอกสารซ้อนหลายชั้น' },
  { n:'E', title:'ผล 3E3P → AI แปลเป็นบทบาท/สไตล์การดูแลที่เหมาะ', tag:'เสริมใหม่',
    body:'แปลโปรไฟล์แรงจูงใจ 3E3P เป็นข้อเสนอบทบาทและสไตล์การดูแลของหัวหน้าที่ fit กับลักษณะคน',
    why:'ให้การจับคู่เป็น "เหมาะกับงาน + คน" ไม่ใช่แค่คุณสมบัติบนกระดาษ' },
  { n:'F', title:'Chatbot ฝั่งผู้สมัคร + ลงทะเบียน + เห็นสถานะตัวเอง', tag:'Web PP7 Task 6 (รอประชุม 7 ต.ค.)',
    body:'Chatbot ตอบคำถามผู้สมัครบนหน้าเว็บ + ระบบลงทะเบียน + หน้าสถานะตนเอง (ต้องทำอะไรต่อบ้าง)',
    why:'ตามสั่งพี่ปกรณ์ 1 ต.ค. 69 — ผูกแผนนี้กับ Web PP7 Phase 2 ได้ทันทีเมื่ออนุมัติ' },
];

const H_HEAD = 150;
const LINE_H = 23, ROW_PAD = 12, ROW_TXT = 21;
let y = PAD + H_HEAD + 20;
const tops = [];
for (const s of add) {
  let h = 50;
  h += wrap(s.body, 14.5, CONTENT - 160).length * LINE_H;
  h += 12 + wrap(s.why, 14, CONTENT - 190).length * LINE_H;
  h += 14;
  tops.push(y); s._h = Math.round(h); y += h + 14;
}
const TOTAL_H = Math.round(y + 16);
const esc = s => s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
const P = [];

P.push(`<rect width="${W}" height="${TOTAL_H}" fill="#f4f7fb"/>`);
P.push(`<defs><linearGradient id="hdr" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#4a2a04"/><stop offset="1" stop-color="#a35a06"/></linearGradient>
<filter id="soft" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="0" dy="2" stdDeviation="4" flood-color="#e8930c" flood-opacity="0.15"/></filter></defs>`);

P.push(`<rect x="${PAD}" y="${PAD}" width="${CONTENT}" height="${H_HEAD-24}" rx="16" fill="url(#hdr)"/>`);
P.push(`<text x="${PAD+36}" y="${PAD+54}" font-family="Sarabun" font-weight="700" font-size="29" fill="#fff">จุดเสริม AI เพิ่มเติม — นอกเหนือจาก 6 จุดในผังเดิม</text>`);
P.push(`<text x="${PAD+36}" y="${PAD+88}" font-family="Sarabun" font-weight="700" font-size="19" fill="#ffe1b3">ตอบโจทย์ "เสริมจุดที่นำ AI เข้ามาเพิ่มผลผลิต" — ครอบคลุมทั้งกระบวนการ 01-12 (อ้างบทเรียนจาก Bug Log ระบบเดิม)</text>`);
P.push(`<text x="${PAD+36}" y="${PAD+114}" font-family="Sarabun" font-size="14.5" fill="#ffd9a0">เอกสาร LDC-PAO-PM-001-AI-ENHANCEMENT · จัดทำโดย KiloClaw · 6 ต.ค. 2569</text>`);

for (let i=0;i<add.length;i++) {
  const s = add[i], ty = tops[i];
  // left letter circle (orange theme)
  P.push(`<circle cx="${PAD+26}" cy="${ty+26}" r="24" fill="#e8930c"/>`);
  P.push(`<text x="${PAD+26}" y="${ty+33}" text-anchor="middle" font-family="Sarabun" font-weight="700" font-size="19" fill="#fff">${s.n}</text>`);
  const cardX = PAD+62, cardW = CONTENT-62;
  P.push(`<rect x="${cardX}" y="${ty}" width="${cardW}" height="${s._h}" rx="12" fill="#fff" stroke="#f0c987" stroke-width="2" filter="url(#soft)"/>`);
  // tag chip right
  const tw = Math.round(s.tag.length*7.2)+28;
  P.push(`<rect x="${cardX+cardW-20-tw}" y="${ty+13}" width="${tw}" height="25" rx="12" fill="${COL.hlBg}" stroke="${COL.hl}" stroke-width="1.3"/>`);
  P.push(`<text x="${cardX+cardW-20-tw/2}" y="${ty+30}" text-anchor="middle" font-family="Sarabun" font-weight="700" font-size="12" fill="#c66a00">${esc(s.tag)}</text>`);
  // title + body
  let dy = ty+38;
  P.push(`<text x="${cardX+22}" y="${dy}" font-family="Sarabun" font-weight="700" font-size="17.5" fill="${COL.title}">${esc(s.title)}</text>`);
  dy += 26;
  for (const ln of wrap(s.body, 14.5, cardW-160)) {
    P.push(`<text x="${cardX+22}" y="${dy}" font-family="Sarabun" font-size="14.5" fill="${COL.text}">${esc(ln)}</text>`);
    dy += LINE_H;
  }
  // why row
  const wl = wrap(s.why, 13.8, cardW-190);
  const whyH = 8 + wl.length*LINE_H;
  P.push(`<rect x="${cardX+22}" y="${dy}" width="${cardW-44}" height="${whyH}" rx="7" fill="#eef4ff" stroke="#dbe8fa"/>`);
  let wy = dy + 22;
  for (let k=0;k<wl.length;k++) {
    if (k===0) {
      P.push(`<text x="${cardX+36}" y="${wy}" font-family="Sarabun" font-weight="700" font-size="13.8" fill="${COL.ai}">ทำไมจึงต้องเสริม:</text>`);
      P.push(`<text x="${cardX+36+160}" y="${wy}" font-family="Sarabun" font-size="13.8" fill="#1c3a5e">${esc(wl[0])}</text>`);
    } else {
      P.push(`<text x="${cardX+36}" y="${wy}" font-family="Sarabun" font-size="13.8" fill="#1c3a5e">${esc(wl[k])}</text>`);
    }
    wy += LINE_H;
  }
}

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${TOTAL_H}" viewBox="0 0 ${W} ${TOTAL_H}" font-family="Sarabun">` + P.join('') + `</svg>`;
fs.writeFileSync('extra.svg', svg);
console.log('svg', W+'x'+TOTAL_H);
sharp('extra.svg', { density:150 }).png().toFile('extra_full.png')
  .then(m=>console.log('PNG', m.width+'x'+m.height, m.size,'bytes'))
  .catch(e=>{console.log('ERR', e.message); process.exit(1);});
