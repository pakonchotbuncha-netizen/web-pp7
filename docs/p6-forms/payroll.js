// P6 Payroll System - ระบบจ่ายเงินเดือนและค่าตอบแทน
// Web PP7 - ค่าตอบแทนและแรงจูงใจ (LDC-WCD-WI-004, WI-003, WI-006)

const PAYROLL_CONFIG = {
  // อัตราค่าธรรมเนียม/ภาษี (อ้างอิงตามกฎหมายแรงงาน + ระเบียบ PKG)
  tax_rate: 0.03,         // ภาษี ณ ที่จ่าย 3% (ถ้ามี)
  ssf_employee: 0.05,     // ประกันสังคม ฝ่ายพนักงาน 5% (ฐานสูงสุด 15,000)
  ssf_employer: 0.05,     // ประกันสังคม ฝ่ายนายจ้าง 5%
  ssf_base_max: 15000,    // ฐานสูงสุดประกันสังคม
  wcd_max: 15000,         // ฐานสูงสุดค่าป่วยการ (WCD)
  pvd_employee: 0.03,     // กองทุนสำรองเลี้ยงชีพ ฝ่ายพนักงาน 3%
  pvd_employer: 0.03,     // กองทุนสำรองเลี้ยงชีพ ฝ่ายนายจ้าง 3%
  // กำหนดรอบเงินเดือน (ตาม LDC-WCD-WI-004)
  cycle: {
    day_1_5: 'PAO อัปเดตสถานะบริษัท',
    day_1_10: 'อัปเดตข้อมูลสมาชิก + เปิดสิทธิ์ BU คีย์ INC',
    day_10: 'ดึงข้อมูล CU มารวมยอดอัตโนมัติ',
    day_11: 'ปิดสิทธิ์ INC + กระทบยอดอัตโนมัติ'
  }
};

// โหลดข้อมูลสมาชิกจาก P3 (localStorage)
function getP3Members() {
  return JSON.parse(localStorage.getItem('p3_members') || '[]');
}

// คำนวณเงินเดือนสุทธิ (Net Pay)
function calculateNetPay(member) {
  const comp = member.compensation || {};
  const base = comp.salary_confirmed || comp.salary_probation || 0;
  const allowances =
    (comp.local_allowance || 0) +
    (comp.special_bonus || 0) +
    (comp.fuel_allowance || 0) +
    (comp.phone_allowance || 0) +
    (comp.professional_allowance || 0);
  
  const gross = base + allowances;
  
  // คำนวณการหัก
  const ssfBase = Math.min(base, PAYROLL_CONFIG.ssf_base_max);
  const ssfDeduct = ssfBase * PAYROLL_CONFIG.ssf_employee;
  const ssfEmployer = ssfBase * PAYROLL_CONFIG.ssf_employer;
  
  // PVD (ถ้ามี)
  const pvdDeduct = base * PAYROLL_CONFIG.pvd_employee;
  const pvdEmployer = base * PAYROLL_CONFIG.pvd_employer;
  
  // ภาษี (คำนวณอย่างง่าย 3%)
  const taxable = gross - ssfDeduct - pvdDeduct;
  const tax = Math.max(0, taxable) * PAYROLL_CONFIG.tax_rate;
  
  // หักอื่น ๆ (ถ้ามี)
  const otherDeductions =
    (comp.cu_loan_deduction || 0) +
    (comp.welfare_debt || 0) +
    (comp.damage_penalty || 0);
  
  const totalDeductions = ssfDeduct + pvdDeduct + tax + otherDeductions;
  const netPay = gross - totalDeductions;
  
  return {
    member_id: member.member_id,
    name: member.personal?.name || '-',
    company: member.organization?.company || '-',
    department: member.organization?.department || '-',
    position: member.organization?.position || '-',
    base: base,
    allowances: allowances,
    gross: gross,
    ssf: { employee: ssfDeduct, employer: ssfEmployer, base: ssfBase },
    pvd: { employee: pvdDeduct, employer: pvdEmployer },
    tax: tax,
    other_deductions: otherDeductions,
    total_deductions: totalDeductions,
    net: netPay,
    calculated_at: new Date().toISOString()
  };
}

// คำนวณเงินเดือนทั้งองค์กร
function calculateAllPayroll(month) {
  const members = getP3Members().filter(m => m.status?.current === 'active');
  const results = members.map(m => calculateNetPay(m));
  
  const summary = {
    month: month || new Date().toISOString().slice(0, 7),
    total_members: members.length,
    total_gross: results.reduce((s, r) => s + r.gross, 0),
    total_deductions: results.reduce((s, r) => s + r.total_deductions, 0),
    total_net: results.reduce((s, r) => s + r.net, 0),
    total_ssf_employer: results.reduce((s, r) => s + r.ssf.employer, 0),
    total_pvd_employer: results.reduce((s, r) => s + r.pvd.employer, 0),
    results: results
  };
  
  // บันทึกไป localStorage
  localStorage.setItem(`p6_payroll_${summary.month}`, JSON.stringify(summary));
  
  return summary;
}

// คำนวณเงินชดเชยเกษียณ (WI-006)
function calculateRetirement(member) {
  const start = new Date(member.employment?.start_date || new Date());
  const now = new Date();
  const yearsWorked = (now - start) / (1000 * 60 * 60 * 24 * 365.25);
  const lastSalary = member.compensation?.salary_confirmed || member.compensation?.salary_probation || 0;
  
  // เกณฑ์เงินชดเชย (ตามกฎหมายแรงงานไทย)
  let multiplier = 0;
  if (yearsWorked >= 20) multiplier = 400;      // 400 วัน
  else if (yearsWorked >= 15) multiplier = 300; // 300 วัน
  else if (yearsWorked >= 10) multiplier = 240; // 240 วัน
  else if (yearsWorked >= 7) multiplier = 180;  // 180 วัน
  else if (yearsWorked >= 5) multiplier = 120;  // 120 วัน
  else if (yearsWorked >= 3) multiplier = 90;   // 90 วัน
  else if (yearsWorked >= 1) multiplier = 30;   // 30 วัน
  
  const severance = (lastSalary / 30) * multiplier;
  const age = member.personal?.age || 0;
  const retirementEligible = age >= 55;
  
  return {
    member_id: member.member_id,
    name: member.personal?.name || '-',
    age: age,
    yearsWorked: yearsWorked.toFixed(1),
    lastSalary: lastSalary,
    multiplier: multiplier,
    severance: severance,
    retirementEligible: retirementEligible,
    calculated_at: new Date().toISOString()
  };
}

// ตรวจสอบสมาชิกใกล้เกษียณ (อายุ >= 53)
function getNearRetirementMembers(thresholdAge = 53) {
  return getP3Members()
    .filter(m => {
      const age = m.personal?.age || 0;
      return age >= thresholdAge && m.status?.current === 'active';
    })
    .map(m => calculateRetirement(m))
    .sort((a, b) => b.age - a.age);
}

// บันทึก INC (Incentive) จาก BU
function saveIncentive(memberId, month, amount, remark) {
  const key = `p6_inc_${month}`;
  const data = JSON.parse(localStorage.getItem(key) || '[]');
  data.push({
    member_id: memberId,
    amount: amount,
    remark: remark || '',
    saved_at: new Date().toISOString()
  });
  localStorage.setItem(key, JSON.stringify(data));
  return true;
}

// ====== Incentive Point System (MSP App) ======
const INC_CONFIG = {
  // อัตราแปลง Cash → Points (อ้างอิง App MSP)
  cash_to_points_rate: 10,    // 1 บาท = 10 Points
  points_to_cash_rate: 0.1,   // 10 Points = 1 บาท (reverse)
  // ประเภท incentive
  types: [
    { id: 'sales', name: 'ยอดขาย', description: 'ค่าคอมมิชชันจากยอดขาย' },
    { id: 'kpi', name: 'KPI Achievement', description: 'ผลงานตามเป้าหมาย' },
    { id: 'project', name: 'โบนัสโปรเจค', description: 'โบนัสสำหรับโปรเจคพิเศษ' },
    { id: 'attendance', name: 'เบี้ยขยัน', description: 'โบนัสการเข้างาน' },
    { id: 'referral', name: 'แนะนำคน', description: 'โบนัสแนะนำสมาชิกใหม่' },
    { id: 'innovation', name: 'นวัตกรรม', description: 'รางวัลนวัตกรรม' },
    { id: 'customer_service', name: 'บริการลูกค้า', description: 'โบนัสบริการลูกค้า' },
    { id: 'other', name: 'อื่น ๆ', description: 'ประเภทอื่น' }
  ]
};

// คำนวณ Point จากจำนวนเงินสด
function calculatePoints(cashAmount) {
  return Math.round(cashAmount * INC_CONFIG.cash_to_points_rate);
}

// คำนวณเงินสดจาก Point
function calculateCashFromPoints(points) {
  return (points * INC_CONFIG.points_to_cash_rate).toFixed(2);
}

// บันทึก INC เป็น Point (ส่งไป MSP)
function saveIncentivePoints(memberId, month, cashAmount, incType, remark, buCode) {
  const points = calculatePoints(cashAmount);
  const key = `p6_inc_points_${month}`;
  const data = JSON.parse(localStorage.getItem(key) || '[]');
  
  const record = {
    transaction_id: `INC-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
    member_id: memberId,
    month: month,
    cash_amount: cashAmount,
    points: points,
    inc_type: incType || 'other',
    remark: remark || '',
    bu_code: buCode || '',
    status: 'pending_transfer',  // pending_transfer, transferred, cashed_out
    transfer_to_msp_at: null,
    cashout_at: null,
    created_at: new Date().toISOString()
  };
  
  data.push(record);
  localStorage.setItem(key, JSON.stringify(data));
  
  console.log('💰 บันทึก INC Point:', record);
  return record;
}

// จำลองการโอน Point ไป MSP App
function transferToMSP(month) {
  const key = `p6_inc_points_${month}`;
  const data = JSON.parse(localStorage.getItem(key) || '[]');
  
  let transferred = 0;
  data.forEach(rec => {
    if (rec.status === 'pending_transfer') {
      rec.status = 'transferred';
      rec.transfer_to_msp_at = new Date().toISOString();
      transferred++;
    }
  });
  
  localStorage.setItem(key, JSON.stringify(data));
  console.log(`📤 โอน ${transferred} รายการไป MSP App`);
  return { transferred, month };
}

// จำลองสมาชิก cashout ผ่าน MSP App
function simulateCashout(memberId, points) {
  // บันทึกประวัติ cashout
  const key = `p6_cashout_${memberId}`;
  const history = JSON.parse(localStorage.getItem(key) || '[]');
  const cash = calculateCashFromPoints(points);
  
  history.push({
    points: points,
    cash_amount: cash,
    cashout_at: new Date().toISOString(),
    method: 'bank_transfer',  // bank_transfer, gift_card, mobile_payment
    status: 'completed'
  });
  
  localStorage.setItem(key, JSON.stringify(history));
  console.log(`💸 สมาชิก cashout: ${points} points = ${cash} บาท`);
  return { memberId, points, cash, cashout_at: new Date() };
}

// ดูประวัติ INC ของสมาชิก (รวม cashout)
function getIncentiveHistory(memberId) {
  // INC ที่เคยจ่าย
  const allMonths = Object.keys(localStorage)
    .filter(k => k.startsWith('p6_inc_points_'))
    .map(k => k.replace('p6_inc_points_', ''));
  
  const incRecords = [];
  allMonths.forEach(month => {
    const data = JSON.parse(localStorage.getItem(`p6_inc_points_${month}`) || '[]');
    data.forEach(rec => {
      if (rec.member_id === memberId) {
        incRecords.push({ ...rec, month });
      }
    });
  });
  
  // Cashout history
  const cashoutKey = `p6_cashout_${memberId}`;
  const cashoutHistory = JSON.parse(localStorage.getItem(cashoutKey) || '[]');
  
  // สรุป
  const totalPointsEarned = incRecords.reduce((s, r) => s + r.points, 0);
  const totalCashEarned = incRecords.reduce((s, r) => s + r.cash_amount, 0);
  const totalPointsCashedOut = cashoutHistory.reduce((s, r) => s + r.points, 0);
  const totalCashCashedOut = cashoutHistory.reduce((s, r) => s + parseFloat(r.cash_amount), 0);
  
  return {
    memberId,
    totalPointsEarned,
    totalCashEarned,
    totalPointsCashedOut,
    totalCashCashedOut,
    availableBalance: totalPointsEarned - totalPointsCashedOut,
    incRecords: incRecords.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)),
    cashoutHistory: cashoutHistory.sort((a, b) => new Date(b.cashout_at) - new Date(a.cashout_at))
  };
}

// Summary รายเดือน (BU ดูรวม)
function getMonthlyIncentiveSummary(month) {
  const data = JSON.parse(localStorage.getItem(`p6_inc_points_${month}`) || '[]');
  const members = getP3Members();
  
  const byType = {};
  INC_CONFIG.types.forEach(t => { byType[t.id] = { count: 0, cash: 0, points: 0 }; });
  
  data.forEach(rec => {
    if (byType[rec.inc_type]) {
      byType[rec.inc_type].count++;
      byType[rec.inc_type].cash += rec.cash_amount;
      byType[rec.inc_type].points += rec.points;
    }
  });
  
  const totalCash = data.reduce((s, r) => s + r.cash_amount, 0);
  const totalPoints = data.reduce((s, r) => s + r.points, 0);
  
  return {
    month,
    total_records: data.length,
    total_cash: totalCash,
    total_points: totalPoints,
    by_type: byType,
    records: data.map(r => ({
      ...r,
      member_name: members.find(m => m.member_id === r.member_id)?.personal?.name || '-'
    }))
  };
}

// อัปเดต export
window.PayrollSystem = {
  config: PAYROLL_CONFIG,
  incConfig: INC_CONFIG,
  getP3Members,
  calculateNetPay,
  calculateAllPayroll,
  calculateRetirement,
  getNearRetirementMembers,
  // Incentive Points
  calculatePoints,
  calculateCashFromPoints,
  saveIncentivePoints,
  transferToMSP,
  simulateCashout,
  getIncentiveHistory,
  getMonthlyIncentiveSummary
};
