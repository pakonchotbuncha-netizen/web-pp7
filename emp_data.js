// emp_data.js — ข้อมูลจำลองสำหรับ PP7 Dashboard
// สร้างเมื่อ 2026-05-14
// NOTE: USERS constant is already defined in PP7.html inline script

/* ===== EMP_STATS — ตัวเลขบุคลากร ===== */
const EMP_STATS = {
  total: 1247,
  byDept: { Tech:210, Sales:340, Operations:280, Finance:120, HR:85, R&D:212 },
  byLevel: { Top:180, Solid:420, Develop:480, Exceeds:95, Meets:72 },
  newThisMonth: 12,
  resignedThisMonth: 3,
  transferThisMonth: 5,
};

/* ===== WG_DATA — Working Group รายฝ่าย ===== */
/* keys must match the dept table loop in PP7.html */
const WG_DATA = {
  PMSG:    { name:'PMSG',    count:210, avgScore:3.8, turnover:3.2 },
  AAMG:    { name:'AAMG',    count:340, avgScore:3.4, turnover:7.1 },
  CPDG:    { name:'CPDG',    count:280, avgScore:3.6, turnover:2.8 },
  RPLCG:   { name:'RPLCG',   count:120, avgScore:3.9, turnover:1.5 },
  RAFCOG:  { name:'RAFCOG',  count:85,  avgScore:3.7, turnover:2.0 },
  PGHG:    { name:'PGHG',    count:150, avgScore:3.5, turnover:4.1 },
  21RTG:   { name:'21RTG',   count:95,  avgScore:3.3, turnover:5.2 },
  Other:   { name:'Other',   count:102, avgScore:3.2, turnover:3.8 },
};

/* ===== RECRUIT_CLEAN_DATA — ข้อมูลรับสมัครจาก A1 ===== */
const RECRUIT_CLEAN_DATA = {
  summary: {
    total: 42,
    matchedEmployment: 18,
    openPositions: 42,
    inPipeline: 186,
    interviewed: 34,
    offerSent: 12,
  },
  rows: [
    { running:'A1-001', fullNameNoPrefix:'สมชาย ใจดี', jobPosition1:'Software Engineer', schoolName:'Referral', status_register:'จ้างงาน', employmentStatus:'พบใน employee', applicationDate:'2026-03-15' },
    { running:'A1-002', fullNameNoPrefix:'สมหญิง รักเรียน', jobPosition1:'Sales Executive', schoolName:'LinkedIn', status_register:'จ้างงาน', employmentStatus:'พบใน employee', applicationDate:'2026-03-18' },
    { running:'A1-003', fullNameNoPrefix:'วิชัย สุขสมบูรณ์', jobPosition1:'Operations Supervisor', schoolName:'Job Board', status_register:'มาสัมภาษณ์', employmentStatus:'', applicationDate:'2026-04-01' },
    { running:'A1-004', fullNameNoPrefix:'นภา แสงจันทร์', jobPosition1:'HR Coordinator', schoolName:'Website', status_register:'มาสัมภาษณ์', employmentStatus:'', applicationDate:'2026-04-05' },
    { running:'A1-005', fullNameNoPrefix:'ธนกร เจริญทรัพย์', jobPosition1:'Financial Analyst', schoolName:'Agency', status_register:'รอสัมภาษณ์', employmentStatus:'', applicationDate:'2026-04-10' },
    { running:'A1-006', fullNameNoPrefix:'พิมพ์ใจ ดีงาม', jobPosition1:'UX Designer', schoolName:'LinkedIn', status_register:'รอสัมภาษณ์', employmentStatus:'', applicationDate:'2026-04-12' },
    { running:'A1-007', fullNameNoPrefix:'ประเสริฐ มั่นคง', jobPosition1:'Data Scientist', schoolName:'Referral', status_register:'รอคัดเลือกใบสมัคร', employmentStatus:'', applicationDate:'2026-04-15' },
    { running:'A1-008', fullNameNoPrefix:'อรุณี วงษ์สว่าง', jobPosition1:'Sales Manager', schoolName:'Job Board', status_register:'จ้างงาน', employmentStatus:'พบใน employee', applicationDate:'2026-03-20' },
    { running:'A1-009', fullNameNoPrefix:'สุรชัย กล้าหาญ', jobPosition1:'DevOps Engineer', schoolName:'Website', status_register:'ปิดใบสมัคร', employmentStatus:'', applicationDate:'2026-02-28' },
    { running:'A1-010', fullNameNoPrefix:'กัลยา ธรรมรักษ์', jobPosition1:'QA Engineer', schoolName:'LinkedIn', status_register:'ใบสมัครซ้ำ', employmentStatus:'', applicationDate:'2026-04-18' },
    { running:'A1-011', fullNameNoPrefix:'ชัยวัฒน์ พงศ์ไพบูลย์', jobPosition1:'Product Manager', schoolName:'Referral', status_register:'มาสัมภาษณ์', employmentStatus:'', applicationDate:'2026-04-20' },
    { running:'A1-012', fullNameNoPrefix:'รัตนา จิตต์สว่าง', jobPosition1:'Accountant', schoolName:'Job Board', status_register:'จ้างงาน', employmentStatus:'พบใน employee', applicationDate:'2026-03-25' },
    { running:'A1-013', fullNameNoPrefix:'อนุชา แก้วมณี', jobPosition1:'Network Admin', schoolName:'Website', status_register:'รอสัมภาษณ์', employmentStatus:'', applicationDate:'2026-04-22' },
    { running:'A1-014', fullNameNoPrefix:'จิราภา ศรีสุวรรณ', jobPosition1:'Marketing Specialist', schoolName:'Agency', status_register:'รอคัดเลือกใบสมัคร', employmentStatus:'', applicationDate:'2026-04-25' },
    { running:'A1-015', fullNameNoPrefix:'ธีรเดช อำนวยผล', jobPosition1:'Tech Lead', schoolName:'LinkedIn', status_register:'จ้างงาน', employmentStatus:'พบใน employee', applicationDate:'2026-03-10' },
    { running:'A1-016', fullNameNoPrefix:'พรทิพย์ นาคสุข', jobPosition1:'Customer Service', schoolName:'Job Board', status_register:'มาสัมภาษณ์', employmentStatus:'', applicationDate:'2026-04-28' },
    { running:'A1-017', fullNameNoPrefix:'กิตติศักดิ์ รุ่งเรือง', jobPosition1:'Business Analyst', schoolName:'Referral', status_register:'จ้างงาน', employmentStatus:'พบใน employee', applicationDate:'2026-03-30' },
    { running:'A1-018', fullNameNoPrefix:'สุภาวดี จันทร์เพ็ญ', jobPosition1:'UI Developer', schoolName:'Website', status_register:'รอสัมภาษณ์', employmentStatus:'', applicationDate:'2026-05-01' },
    { running:'A1-019', fullNameNoPrefix:'มนัส วรสาร', jobPosition1:'Warehouse Supervisor', schoolName:'Agency', status_register:'มาสัมภาษณ์', employmentStatus:'', applicationDate:'2026-05-03' },
    { running:'A1-020', fullNameNoPrefix:'ดวงใจ ประสิทธิ์', jobPosition1:'Payroll Admin', schoolName:'Job Board', status_register:'รอคัดเลือกใบสมัคร', employmentStatus:'', applicationDate:'2026-05-05' },
  ]
};
