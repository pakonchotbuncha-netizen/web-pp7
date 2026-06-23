// P3 Member Database - ฐานข้อมูลสมาชิก
// Web PP7 - ระบบจับคู่คนกับงาน

const MEMBER_STATS = {
  total: 0,
  active: 0,
  probation: 0,
  permanent: 0,
  contract: 0,
  resigned: 0
};

// ฐานข้อมูลสมาชิก (เริ่มต้นว่าง - จะเพิ่มจาก P2 อัตโนมัติ)
let MEMBERS = [];

// โหลดจาก localStorage ถ้ามี
function loadMembers() {
  const saved = localStorage.getItem('p3_members');
  if (saved) {
    MEMBERS = JSON.parse(saved);
  }
  updateStats();
  return MEMBERS;
}

// บันทึกไป localStorage
function saveMembers() {
  localStorage.setItem('p3_members', JSON.stringify(MEMBERS));
  updateStats();
}

// อัปเดตสถิติ
function updateStats() {
  MEMBER_STATS.total = MEMBERS.length;
  MEMBER_STATS.active = MEMBERS.filter(m => m.status?.current === 'active').length;
  MEMBER_STATS.probation = MEMBERS.filter(m => m.employment?.status === 'probation').length;
  MEMBER_STATS.permanent = MEMBERS.filter(m => m.employment?.status === 'permanent').length;
  MEMBER_STATS.contract = MEMBERS.filter(m => m.employment?.status === 'contract').length;
  MEMBER_STATS.resigned = MEMBERS.filter(m => m.status?.current === 'resigned').length;
  
  // บันทึกสถิติ
  localStorage.setItem('p3_member_stats', JSON.stringify(MEMBER_STATS));
}

// เพิ่มสมาชิกใหม่ (จาก P2)
function addMemberFromP2(p2Data) {
  const memberId = generateMemberId();
  
  const newMember = {
    member_id: memberId,
    personal: {
      name: p2Data.applicant_name || '',
      nickname: p2Data.nickname || '',
      phone: p2Data.phone || '',
      age: p2Data.age || 0,
      photo_url: p2Data.photo_url || ''
    },
    organization: {
      company: p2Data.company || '',
      branch_code: p2Data.branch_code || '',
      department: p2Data.department || '',
      team: p2Data.team || '',
      position: p2Data.position || ''
    },
    employment: {
      status: 'probation',
      start_date: new Date().toISOString().split('T')[0],
      probation_end: addDays(new Date(), 30).toISOString().split('T')[0],
      hire_type: 'external',
      salary_probation: p2Data.salary_probation || 0,
      salary_confirmed: p2Data.salary_confirmed || 0
    },
    p2_evaluation: {
      interview_date: p2Data.interview_date || new Date().toISOString(),
      form_type: p2Data.form_type || 'form1',
      tcc_score: p2Data.tcc_score || 0,
      tcc_result: p2Data.tcc_result || '',
      interview_result: p2Data.interview_result || ''
    },
    mentors: {
      line_mentor_1: p2Data.mentor_line_1 || '',
      line_mentor_2: p2Data.mentor_line_2 || '',
      corp_mentor: p2Data.mentor_corporate || ''
    },
    compensation: {
      salary_probation: p2Data.salary_probation || 0,
      salary_confirmed: p2Data.salary_confirmed || 0,
      local_allowance: p2Data.local_allowance || 0,
      special_bonus: p2Data.special_bonus || 0,
      fuel_allowance: p2Data.fuel_allowance || 0,
      phone_allowance: p2Data.phone_allowance || 0,
      professional_allowance: p2Data.professional_allowance || 0
    },
    status: {
      current: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    history: [
      {
        action: 'เพิ่มสมาชิกใหม่',
        timestamp: new Date().toISOString(),
        details: 'นำเข้าจาก P2 หยั่งประเมิน'
      }
    ]
  };
  
  MEMBERS.push(newMember);
  saveMembers();
  return newMember;
}

// สร้าง ID สมาชิกอัตโนมัติ
function generateMemberId() {
  const count = MEMBERS.length;
  const prefix = 'PKG';
  const number = String(count + 1).padStart(4, '0');
  return `${prefix}${number}`;
}

// เพิ่มวัน
function addDays(date, days) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

// ค้นหาสมาชิก
function findMember(id) {
  return MEMBERS.find(m => m.member_id === id);
}

// อัปเดตสมาชิก
function updateMember(memberId, updates) {
  const index = MEMBERS.findIndex(m => m.member_id === memberId);
  if (index === -1) return false;
  
  // Merge updates
  MEMBERS[index] = deepMerge(MEMBERS[index], updates);
  MEMBERS[index].status.updated_at = new Date().toISOString();
  
  saveMembers();
  return MEMBERS[index];
}

// Deep merge helper
function deepMerge(target, source) {
  const result = { ...target };
  for (const key in source) {
    if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
      result[key] = deepMerge(target[key] || {}, source[key]);
    } else {
      result[key] = source[key];
    }
  }
  return result;
}

// โอนย้ายสมาชิก (WI-003)
function transferMember(memberId, transferData) {
  const member = findMember(memberId);
  if (!member) return false;
  
  const updates = {
    organization: {
      company: transferData.new_company || member.organization.company,
      branch_code: transferData.new_branch || member.organization.branch_code,
      department: transferData.new_department || member.organization.department,
      team: transferData.new_team || member.organization.team,
      position: transferData.new_position || member.organization.position
    },
    history: [
      ...(member.history || []),
      {
        action: 'โอนย้าย',
        timestamp: new Date().toISOString(),
        details: transferData.reason || 'โอนย้ายตามคำสั่ง'
      }
    ]
  };
  
  return updateMember(memberId, updates);
}

// เลื่อนตำแหน่ง (WI-004)
function promoteMember(memberId, promoteData) {
  const member = findMember(memberId);
  if (!member) return false;
  
  const updates = {
    organization: {
      position: promoteData.new_position || member.organization.position
    },
    employment: {
      status: promoteData.new_status || member.employment.status,
      salary_confirmed: promoteData.new_salary || member.employment.salary_confirmed
    },
    history: [
      ...(member.history || []),
      {
        action: 'เลื่อนตำแหน่ง',
        timestamp: new Date().toISOString(),
        details: `เลื่อนเป็น ${promoteData.new_position} เงินเดือน ${promoteData.new_salary}`
      }
    ]
  };
  
  return updateMember(memberId, updates);
}

// ลาออก (WI-005)
function resignMember(memberId, resignData) {
  const member = findMember(memberId);
  if (!member) return false;
  
  const updates = {
    status: {
      current: 'resigned',
      resigned_at: new Date().toISOString()
    },
    employment: {
      end_date: resignData.end_date || new Date().toISOString().split('T')[0]
    },
    history: [
      ...(member.history || []),
      {
        action: 'ลาออก',
        timestamp: new Date().toISOString(),
        details: resignData.reason || 'ลาออก'
      }
    ]
  };
  
  const updated = updateMember(memberId, updates);
  
  // แจ้ง P1 ว่ามีตำแหน่งว่าง
  notifyP1Vacancy(updated);
  
  return updated;
}

// แจ้ง P1 ว่ามีตำแหน่งว่าง (กลับไปที่ P1)
function notifyP1Vacancy(member) {
  const notification = {
    type: 'P3_VACANCY',
    timestamp: new Date().toISOString(),
    position: member.organization.position,
    company: member.organization.company,
    branch: member.organization.branch_code,
    department: member.organization.department,
    previous_member: member.member_id,
    status: 'เปิดรับสมัคร'
  };
  
  // บันทึกการแจ้งเตือน
  let notifications = JSON.parse(localStorage.getItem('p3_notifications') || '[]');
  notifications.unshift(notification);
  notifications = notifications.slice(0, 50);
  localStorage.setItem('p3_notifications', JSON.stringify(notifications));
  
  console.log('📤 แจ้ง P1 vacancy:', notification);
  
  return notification;
}

// ดึงข้อมูลสำหรับระบบพี่เลี้ยง (LDC-PAD-PM-001)
function getMentorData() {
  return MEMBERS
    .filter(m => m.status.current === 'active')
    .map(m => ({
      member_id: m.member_id,
      name: m.personal.name,
      company: m.organization.company,
      department: m.organization.department,
      start_date: m.employment.start_date,
      mentor_line_1: m.mentors.line_mentor_1,
      mentor_line_2: m.mentors.line_mentor_2,
      mentor_corporate: m.mentors.corp_mentor
    }));
}

// Export สำหรับใช้งาน
window.MemberDB = {
  loadMembers,
  saveMembers,
  addMemberFromP2,
  findMember,
  updateMember,
  transferMember,
  promoteMember,
  resignMember,
  getMentorData
};

// โหลดข้อมูลเริ่มต้น
loadMembers();
