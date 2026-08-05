// Test submit form directly
const formData = {
  positionOpen: 'it',
  positionOther: 'sales',
  salary: '35000',
  applicationChannel: 'website',
  source: 'facebook',
  prefixTh: 'นาย',
  firstnameTh: 'สมชาย',
  lastnameTh: 'ใจดี',
  prefixEn: 'Mr.',
  firstnameEn: 'Somchai',
  lastnameEn: 'Jaidi',
  nickname: 'ชาย',
  gender: 'male',
  birthdate: '1990-05-15',
  age: '36',
  weight: '70',
  height: '175',
  blood: 'O',
  ethnicity: 'thai',
  nationality: 'thai',
  education: 'bachelor',
  major: 'วิทยาการคอมพิวเตอร์',
  idCard: '1234567890123',
  idCardPlace: 'อำเภอเมือง กรุงเทพฯ',
  idCardIssue: '2015-01-10',
  idCardExpire: '2025-01-10',
  regHouse: '123/45',
  regSubdistrict: 'บางนา',
  regDistrict: 'บางนา',
  regProvince: 'กรุงเทพฯ',
  regPostal: '10260',
  curHouse: '456/78',
  curSubdistrict: 'พระโขนง',
  curDistrict: 'พระโขนง',
  curProvince: 'กรุงเทพฯ',
  curPostal: '10260',
  phone: '0812345678',
  facebook: 'Somchai Jaidi',
  line: 'somchai_j',
  military: 'passed',
  marital: 'single',
  children: '0',
  father: 'นายสมศักดิ์ ใจดี',
  mother: 'นางสมศรี ใจดี',
  thaiSkill: JSON.stringify({listen: '4', speak: '4', read: '4', write: '4'}),
  engSkill: JSON.stringify({listen: '3', speak: '3', read: '3', write: '3'}),
  otherLang: 'จีน (พอใช้)',
  specialSkill: 'เขียนโปรแกรม',
  hobby: 'อ่านหนังสือ',
  driving: 'car',
  hasLicense: 'yes',
  carLicense: 'กข-1234',
  workExp: 'บริษัท ABC (2563-ปัจจุบัน) - Software Developer',
  reference: 'คุณสมศักดิ์ 0811111111',
  emergency: 'นางสมศรี 0822222222',
  allowCheck: 'yes',
  disease: 'ไม่มี',
  surgery: 'ไม่เคย',
  fired: 'no',
  prevApply: 'no',
  socialSecurity: 'yes',
  debt: 'no',
  debtDetail: '-',
  familyDuty: 'no',
  familyDutyDetail: '-',
  criminalSelf: 'yes',
  criminalCompany: 'yes',
  transport: 'car'
};

const GAS_URL = 'https://script.google.com/macros/s/AKfycbyp7f6kX699UhK3e7EHyjQYSQgAzmeTNu4bAJqW2f5n4Zj5AreGoM2TrPqv_AmP3v_r/exec';

fetch(GAS_URL + '?action=submitApplication', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(formData)
})
.then(response => response.json())
.then(data => {
  console.log('Success:', data);
  process.exit(0);
})
.catch(error => {
  console.error('Error:', error);
  process.exit(1);
});
