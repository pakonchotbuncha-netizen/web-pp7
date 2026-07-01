// dev_data.js — ข้อมูลจำลองสำหรับ Tab พัฒนาบุคลากร (P5)
// สร้างเมื่อ 2026-06-11

const DEV_DATA = {
  records: [
    { id: 'D-001', name: 'วรรณ์วิภา จันทร์เพ็ญ', dept: 'Tech', course: 'AWS Solutions Architect', hours: 32, score: 3.4, status: 'กำลังเรียน', completed: '—' },
    { id: 'D-002', name: 'กิตติชัย ศรีจันทร์', dept: 'Sales', course: 'Advanced Sales Strategy', hours: 32, score: 4.7, status: 'เสร็จสิ้น', completed: '2026-03-05' },
    { id: 'D-003', name: 'วิไลวรรณ แก้วประเสริฐ', dept: 'Finance', course: 'Finance Leadership Program', hours: 48, score: 3.4, status: 'เสร็จสิ้น', completed: '2026-02-18' },
    { id: 'D-004', name: 'กิตติ ทองดี', dept: 'Tech', course: 'Machine Learning Specialization', hours: 20, score: 3.8, status: 'กำลังเรียน', completed: '—' },
    { id: 'D-005', name: 'พิชัย ใจดี', dept: 'Tech', course: 'Kubernetes Certification', hours: 28, score: 4.7, status: 'เสร็จสิ้น', completed: '2026-03-04' },
    { id: 'D-006', name: 'ธนพร แก้วประเสริฐ', dept: 'HR', course: 'Agile/Scrum Master', hours: 20, score: 4.8, status: 'เสร็จสิ้น', completed: '2026-03-12' },
    { id: 'D-007', name: 'ธนวัฒน์ รุ่งเรือง', dept: 'Management', course: 'Leadership Excellence', hours: 48, score: 5.0, status: 'กำลังเรียน', completed: '—' },
    { id: 'D-008', name: 'วิทยา ทองประเสริฐ', dept: 'Tech', course: 'Data Analytics with Python', hours: 24, score: 4.4, status: 'เสร็จสิ้น', completed: '2026-01-06' }
  ],
  courses: [
    'AWS Solutions Architect',
    'Advanced Sales Strategy',
    'Finance Leadership Program',
    'Machine Learning Specialization',
    'Kubernetes Certification',
    'Agile/Scrum Master',
    'Leadership Excellence',
    'Data Analytics with Python',
    'Cybersecurity Fundamentals'
  ]
};

// ฟังก์ชันสำหรับเพิ่มข้อมูลใหม่ (Mock API)
function addDevRecord(record) {
  DEV_DATA.records.push(record);
  renderDevTable(); // อัปเดตตารางทันที
  renderDevChart(); // อัปเดตกราฟทันที
}
