// ============================================================
// [ADDED by KiloClaw 2026-09-08 / REWRITTEN 2026-09-14 readable columns]
// succession-member-* → tab "SP-สมาชิกรายคน" — 1 แถว/สมาชิก (upsert ตามชื่อ)
// เขียนเป็นคอลัมน์อ่านง่าย 34 คอลัมน์ (ข้อมูลดิบ JSON เก็บสำรองคอลัมน์สุดท้าย)
// ============================================================
const SP_MEMBER_TAB = 'SP-สมาชิกรายคน';
const SP_MEMBER_HEADERS = ['เวลาบันทึก','ชื่อ','ชื่อเต็ม','กลุ่ม','บทบาททีม (เดิม/ใหม่)','บทบาทใหม่','รายละเอียดบทบาท',
 'จุดมุ่งหมาย BU','ภาพความสำเร็จ BU','จุดมุ่งหมาย Team','ภาพความสำเร็จ Team','จุดมุ่งหมาย Personal','ภาพความสำเร็จ Personal',
 'หน้าที่รับผิดชอบหลัก (Accountability)','OKR Business','OKR Team','OKR Personal','กลยุทธ์ที่รับผิดชอบ (BSC)',
 'การ cover / ส่งต่อ','หมายเหตุ','บันไดถ่ายทอด (ขั้น)','ระยะเวลาการถ่ายทอด',
 'แผนช่วง 1 (2569)','แผนช่วง 2 (2569–2570)','แผนช่วง 3 (2571–2572)','แผนช่วง 4 (2572–2573)','แผนช่วง 5 (2573)',
 'Co-Ownership','สถานะเงื่อนไขถ่ายทอด','พี่เลี้ยงแนวดิ่ง','พี่เลี้ยงแนวราบ','เป็นพี่เลี้ยงให้','บันทึกเมื่อ (ฟอร์ม)','ข้อมูลดิบสำรอง (JSON)'];

function spParseData_(raw) {
  if (raw && typeof raw === 'object') return raw;
  try { return JSON.parse(raw || '{}'); } catch (e) { return {}; }
}

function spFmtCond_(v) {
  let o = v;
  if (typeof v === 'string') { try { o = JSON.parse(v); } catch (e) { return v; } }
  if (!o || typeof o !== 'object') return '';
  return Object.keys(o).sort(function(a,b){return Number(a)-Number(b);}).map(function(k){ return (Number(k)+1)+'. '+o[k]; }).filter(function(s){ return s.slice(-2) !== '. '; }).join(' · ');
}
function spFmtMap_(v) {
  let o = v;
  if (typeof v === 'string') { try { o = JSON.parse(v); } catch (e) { return v; } }
  if (!o) return '';
  if (Array.isArray(o)) return o.map(function(x){ return (x && x.name) ? (x.name + (x.side ? ' (' + x.side + ')' : '')) : String(x || ''); }).filter(Boolean).join(', ');
  return Object.keys(o).sort(function(a,b){return Number(a)-Number(b);}).map(function(k){ return o[k]; }).filter(Boolean).join(' · ');
}
function spRowFromData_(ts, member, grp, lvl, d) {
  const ph = (d.plan_phases && typeof d.plan_phases === 'string') ? (function(){ try { return JSON.parse(d.plan_phases); } catch(e){ return []; } })() : (d.plan_phases || []);
  const cond = (d.plan_cond && typeof d.plan_cond === 'string') ? d.plan_cond : JSON.stringify(d.plan_cond || {});
  return [ts, member, d.full || '', grp || (d.group || ''), d.teamRole || '', d.roles || '', d.roleOpts || '',
    d.ncass_bu_purpose || '', d.ncass_bu_vision || '', d.ncass_team_purpose || '', d.ncass_team_vision || '',
    d.ncass_per_purpose || '', d.ncass_per_vision || '', d.resp || '', d.okr_b || '', d.okr_t || '', d.okr_p || '',
    d.bsc || '', d.cover || '', d.note || '', d.plan_step || '', d.plan_timeline || '',
    ph[0] || '', ph[1] || '', ph[2] || '', ph[3] || '', ph[4] || '',
    d.plan_coown || '', spFmtCond_(d.plan_cond), spFmtMap_(d.mentor_mv), spFmtMap_(d.mentor_mh), spFmtMap_(d.mentor_my), d.savedAt || '',
    (typeof d === 'string') ? d : JSON.stringify(d)];
}

function spGetMemberTab_() {
  const ss = SpreadsheetApp.openById(SP_SUCCESSION_SS_ID);
  let sheet = ss.getSheetByName(SP_MEMBER_TAB);
  if (!sheet) sheet = ss.insertSheet(SP_MEMBER_TAB);
  const head = sheet.getLastRow() >= 1 ? sheet.getRange(1, 1, 1, Math.max(sheet.getLastColumn(), 1)).getValues()[0] : [];
  const isOld = head.length <= 5 && String(head[4] || '') === 'data_json';
  const isNew = String(head[0] || '') === 'เวลาบันทึก';
  if (!isNew) {
    // migrate: อ่านแถวเดิม (รูปแบบเก่า 5 คอลัมน์ หรือชีตว่าง) แล้วเขียนใหม่เป็นคอลัมน์อ่านง่าย
    let oldRows = [];
    if (isOld && sheet.getLastRow() >= 2) {
      oldRows = sheet.getRange(2, 1, sheet.getLastRow() - 1, 5).getValues();
    }
    sheet.clear();
    sheet.getRange(1, 1, 1, SP_MEMBER_HEADERS.length).setValues([SP_MEMBER_HEADERS]);
    sheet.getRange(1, 1, 1, SP_MEMBER_HEADERS.length).setFontWeight('bold');
    sheet.setFrozenRows(1);
    const out = [];
    for (let i = 0; i < oldRows.length; i++) {
      const r = oldRows[i];
      const d = spParseData_(r[4]);
      out.push(spRowFromData_(r[0], r[1], r[2], r[3], d));
    }
    if (out.length) sheet.getRange(2, 1, out.length, SP_MEMBER_HEADERS.length).setValues(out);
  }
  return sheet;
}

function spSaveMember(body) {
  const member = (body.member || '').trim();
  if (!member) return { success: false, error: 'Missing member' };
  const grp = (body.group || '').trim();
  const lvl = (body.level || '').toString();
  const d = spParseData_(body.data);
  const sheet = spGetMemberTab_();
  const lock = LockService.getScriptLock();
  lock.waitLock(15000);
  try {
    const last = sheet.getLastRow();
    let rowIdx = -1;
    if (last >= 2) {
      const col = sheet.getRange(2, 2, last - 1, 1).getValues();
      for (let i = 0; i < col.length; i++) {
        if (String(col[i][0]).trim() === member) { rowIdx = i + 2; break; }
      }
    }
    const ts = new Date().toISOString();
    const row = spRowFromData_(ts, member, grp, lvl, d);
    if (rowIdx > 0) sheet.getRange(rowIdx, 1, 1, SP_MEMBER_HEADERS.length).setValues([row]);
    else { sheet.appendRow(row); rowIdx = sheet.getLastRow(); }
    return { success: true, row: rowIdx, member: member, message: 'บันทึกสมาชิกลงชีตกลางแล้ว (แถว ' + rowIdx + ')' };
  } finally {
    lock.releaseLock();
  }
}

function spListMembers() {
  const sheet = spGetMemberTab_();
  const last = sheet.getLastRow();
  if (last < 2) return { success: true, members: [] };
  const rows = sheet.getRange(2, 1, last - 1, SP_MEMBER_HEADERS.length).getValues();
  const members = rows.map(function (r) {
    let data = {};
    try { data = JSON.parse(r[SP_MEMBER_HEADERS.length - 1]); } catch (e) { data = {}; }
    return { timestamp: r[0], member: r[1], group: r[3], level: '', data: data };
  });
  return { success: true, members: members, count: members.length };
}
