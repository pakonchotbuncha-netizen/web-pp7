/**
 * ============================================================
 * MASTER DATA — Task PP7 ไก่จัง (ชีตสำเนา Task PP7 ไก่จัง, 22 ก.ย. 69)
 * FU_MASTER / COMPANY_MASTER / BRANCH_MASTER
 * ตาม design ในชีต: FU_ID → COMPANY_ID → BRANCH_ID (ใช้รหัสระบบ ไม่ใช้เลขลำดับ)
 * สถานะ ACTIVE/INACTIVE — ปิดบริษัทไม่ลบข้อมูล
 * ============================================================
 */

const FU_MASTER = [
  { FU_ID: 'FU01', FU: 'THAI',   name: 'THAI',   lang: ['TH','EN'], theme: 'orange',   themeName: 'ส้ม',           flag: '🇹🇭', label: 'สมัครงานภาษาไทย' },
  { FU_ID: 'FU02', FU: 'RPLCG',  name: 'RPLCG',  lang: ['LA'],      theme: 'yellow',   themeName: 'เหลือง',        flag: '🇱🇦', label: 'สมัครงานภาษาลาว' },
  { FU_ID: 'FU03', FU: 'RAFCOG', name: 'RAFCOG', lang: ['KH','EN'], theme: 'redblue',  themeName: 'แดง-น้ำเงิน',   flag: '🇰🇭', label: 'สมัครงานกัมพูชา & อังกฤษ' }
];

// COMPANY_MASTER — STATUS: ACTIVE / INACTIVE (ปิดแล้วข้อมูลเดิมไม่หาย)
const COMPANY_MASTER = [
  // ── FU01 THAI ──
  { COMPANY_ID: 'TH001', FU_ID: 'FU01', BU: 'PMSG',  NAME: 'บริษัท ประชากิจมอเตอร์เซลส์ จำกัด',                              STATUS: 'ACTIVE' },
  { COMPANY_ID: 'TH002', FU_ID: 'FU01', BU: 'AAMG',  NAME: 'บริษัท เอเอเอ็ม แคปปิตอลเซอร์วิส จำกัด',                        STATUS: 'ACTIVE', BRANCHES: ['สำนักงานใหญ่','สาขากบินทร์บุรี','สาขานครนายก','สาขาปลวกแดง','สาขาศรีนครินทร์','สาขาสระบุรี','สาขาวังน้ำเย็น'] },
  { COMPANY_ID: 'TH003', FU_ID: 'FU01', BU: 'AAMG',  NAME: 'บริษัท พีเอ็มเอส คัสตอมเมอร์เซอร์วิส จำกัด',                    STATUS: 'ACTIVE' },
  { COMPANY_ID: 'TH004', FU_ID: 'FU01', BU: 'AAMG',  NAME: 'บริษัท เอเอเอ็ม บุรีรัมย์ จำกัด',                                STATUS: 'ACTIVE' },
  { COMPANY_ID: 'TH005', FU_ID: 'FU01', BU: 'AAMG',  NAME: 'บริษัท เกษตรไทย ลิสซิ่ง จำกัด',                                  STATUS: 'ACTIVE' },
  { COMPANY_ID: 'TH006', FU_ID: 'FU01', BU: 'AAMG',  NAME: 'บริษัท เกษตรไทย ลิสซิ่ง บึงกาฬ จำกัด',                          STATUS: 'ACTIVE' },
  { COMPANY_ID: 'TH007', FU_ID: 'FU01', BU: 'AAMG',  NAME: 'บริษัท เอเอเอ็ม ฉะเชิงเทรา จำกัด',                              STATUS: 'ACTIVE' },
  { COMPANY_ID: 'TH008', FU_ID: 'FU01', BU: 'AAMG',  NAME: 'บริษัท อีเอซี กาญจนบุรี จำกัด',                                  STATUS: 'ACTIVE' },
  { COMPANY_ID: 'TH009', FU_ID: 'FU01', BU: 'AAMG',  NAME: 'บริษัท เอเอเอ็ม ลพบุรี จำกัด',                                    STATUS: 'ACTIVE' },
  { COMPANY_ID: 'TH009B', FU_ID: 'FU01', BU: 'AAMG',  NAME: 'บริษัท เอเอเอ็ม แคปปิตอล เซอร์วิส พัทยา จำกัด',                  STATUS: 'ACTIVE' },
  { COMPANY_ID: 'TH010', FU_ID: 'FU01', BU: 'AAMG',  NAME: 'บริษัท เอเอเอ็ม มุกดาหาร จำกัด',                                  STATUS: 'ACTIVE' },
  { COMPANY_ID: 'TH011', FU_ID: 'FU01', BU: 'AAMG',  NAME: 'บริษัท เอเอเอ็ม แคปปิตอล เซอร์วิส นนทบุรี จำกัด',                STATUS: 'ACTIVE' },
  { COMPANY_ID: 'TH011B', FU_ID: 'FU01', BU: 'AAMG',  NAME: 'บริษัท เอเอเอ็ม ปากช่อง จำกัด',                                    STATUS: 'ACTIVE' },
  { COMPANY_ID: 'TH012', FU_ID: 'FU01', BU: 'AAMG',  NAME: 'บริษัท พีซีแอล แคปปิตอล เซอร์วิส จำกัด',                          STATUS: 'ACTIVE' },
  { COMPANY_ID: 'TH013', FU_ID: 'FU01', BU: 'AAMG',  NAME: 'บริษัท พีเอ็มเอส แคปปิตอล เซอร์วิส จำกัด',                        STATUS: 'ACTIVE' },
  { COMPANY_ID: 'TH014', FU_ID: 'FU01', BU: 'AAMG',  NAME: 'บริษัท พรีเชียส สโตน แอสเซท เมแนจเมนท์ จำกัด',                    STATUS: 'ACTIVE' },
  { COMPANY_ID: 'TH015', FU_ID: 'FU01', BU: 'AAMG',  NAME: 'บริษัท สระแก้วลิสซิ่ง จำกัด',                                      STATUS: 'ACTIVE' },
  { COMPANY_ID: 'TH016', FU_ID: 'FU01', BU: 'AAMG',  NAME: 'บริษัท อาร์วายแอล แคปปิตอล เซอร์วิส จำกัด',                      STATUS: 'ACTIVE' },
  { COMPANY_ID: 'TH017', FU_ID: 'FU01', BU: 'AAMG',  NAME: 'บริษัท อีเอซี ราชบุรี จำกัด',                                      STATUS: 'ACTIVE' },
  { COMPANY_ID: 'TH018', FU_ID: 'FU01', BU: 'AAMG',  NAME: 'บริษัท เอเอเอ็ม ตะเคียนคู่ จำกัด',                                STATUS: 'ACTIVE' },
  { COMPANY_ID: 'TH019', FU_ID: 'FU01', BU: 'AAMG',  NAME: 'บริษัท เอเอเอ็ม สกลนคร จำกัด',                                    STATUS: 'ACTIVE' },
  { COMPANY_ID: 'TH020', FU_ID: 'FU01', BU: 'AAMG',  NAME: 'บริษัท เอเอเอ็ม สุรินทร์ จำกัด',                                  STATUS: 'ACTIVE' },
  { COMPANY_ID: 'TH021', FU_ID: 'FU01', BU: 'AAMG',  NAME: 'บริษัท เอเอเอ็ม แคปปิตอลเซอร์วิส พระยาสัจจา จำกัด',              STATUS: 'ACTIVE' },
  { COMPANY_ID: 'TH022', FU_ID: 'FU01', BU: 'AAMG',  NAME: 'บริษัท เอเอเอ็ม แคปปิตอล เซอร์วิส สอยดาว จำกัด',                  STATUS: 'ACTIVE' },
  { COMPANY_ID: 'TH023', FU_ID: 'FU01', BU: 'AAMG',  NAME: 'บริษัท เอเอเอ็ม แคปปิตอล เซอร์วิส อุดรดุษฎี จำกัด',              STATUS: 'ACTIVE' },
  { COMPANY_ID: 'TH024', FU_ID: 'FU01', BU: 'AAMG',  NAME: 'บริษัท เอเอ็นเอฟ เทรดดิ้ง จำกัด',                                  STATUS: 'ACTIVE' },
  { COMPANY_ID: 'TH025', FU_ID: 'FU01', BU: 'CPDG',  NAME: 'บริษัท แอจจิลซอฟท์ คอร์ปอเรชั่น จำกัด',                          STATUS: 'ACTIVE' },
  { COMPANY_ID: 'TH026', FU_ID: 'FU01', BU: 'CPDG',  NAME: 'บริษัท 21ซีที รีเสิร์ท จำกัด',                                    STATUS: 'ACTIVE' },
  { COMPANY_ID: 'TH027', FU_ID: 'FU01', BU: 'CPDG',  NAME: 'บริษัท ไซฟินเวสท์ ดิจิตอล โบรคเกอร์ จำกัด',                      STATUS: 'ACTIVE' },
  { COMPANY_ID: 'TH027B', FU_ID: 'FU01', BU: 'CPDG',  NAME: 'บริษัท ศูนย์พัฒนาผู้นำ จำกัด',                                    STATUS: 'ACTIVE' },
  { COMPANY_ID: 'TH028', FU_ID: 'FU01', BU: 'CPDG',  NAME: 'บริษัท เล็นด์เอ็กซ์ จำกัด',                                        STATUS: 'ACTIVE' },
  // ── FU02 RPLCG (ลาว) ──
  { COMPANY_ID: 'LA001', FU_ID: 'FU02', BU: 'RPLCG', NAME: 'บริษัท ร่วมพัฒนา เช่าสินเชื่อ จำกัด',                            STATUS: 'ACTIVE', NAME_LA: 'ບໍລິສັດ ຮ່ວມພັດທະນາ ເຊົ່າສິນເຊື່ອ ຈຳກັດ' },
  { COMPANY_ID: 'LA002', FU_ID: 'FU02', BU: 'RPLCG', NAME: 'ร้านจะเลินมอเตอร์ (ส่วนบุคคล)',                                    STATUS: 'ACTIVE', NAME_LA: 'ຮ້ານຈະເລີນມໍເຕີ (ບຸກຄົນດຽວ)' },
  { COMPANY_ID: 'LA002B', FU_ID: 'FU02', BU: 'RPLCG', NAME: 'ร้านหลวงพะบางมอเตอร์เซลล์ (ส่วนบุคคล)',                          STATUS: 'ACTIVE', NAME_LA: 'ຮ້ານຫຼວງພະບາງມໍເຕີເຊວ (ບຸກຄົນດຽວ)' },
  { COMPANY_ID: 'LA003', FU_ID: 'FU02', BU: 'RPLCG', NAME: 'ร้านเวียงมอเตอร์ (ส่วนบุคคล)',                                    STATUS: 'ACTIVE', NAME_LA: 'ຮ້ານວຽງມໍເຕີ (ບຸກຄົນດຽວ)' },
  { COMPANY_ID: 'LA003B', FU_ID: 'FU02', BU: 'RPLCG', NAME: 'ร้านมงคลมอเตอร์ สะหวันเขต',                                        STATUS: 'ACTIVE', NAME_LA: 'ຮ້ານມົງຄົນມໍເຕີ ສະຫວັນນະເຂດ' },
  { COMPANY_ID: 'LA004', FU_ID: 'FU02', BU: 'RPLCG', NAME: 'สถาบันการเงินจุละพากที่ไม่รับฝากเงิน ราฟโค ไฟแนนซ์เชียล ลาว จำกัด (ผู้เดียว)', STATUS: 'ACTIVE', NAME_LA: 'ສະຖາບັນການເງິນຈຸລະພາກທີ່ບໍ່ຮັບເງິນຝາກ ຣາຟໂຄ ຟແນນເຊຍ ລາວ ຈກັດ (ຜູ້ດຽວ)' },
  { COMPANY_ID: 'LA005', FU_ID: 'FU02', BU: 'RPLCG', NAME: 'บริษัท เพ็ดจะเลินบริการ จำกัด (ผู้เดียว)',                        STATUS: 'ACTIVE', NAME_LA: 'ບໍລິສັດ ເພັດຈະເລີນບໍລິການ ຈຳກັດ (ຜູ້ດຽວ)' },
  // ── FU03 RAFCOG (กัมพูชา) ──
  { COMPANY_ID: 'KH001', FU_ID: 'FU03', BU: 'RAFCOG', NAME: 'บริษัท ราฟโค ไฟแนนเซียล (เขมโบเดีย) จำกัดมหาชน',                STATUS: 'ACTIVE', NAME_KH: 'ក្រុមហ៊ុន រាហ្វកូ ហ្វាយណាន់សៀល (ខេមបូឌា) មហាជន' },
  { COMPANY_ID: 'KH002', FU_ID: 'FU03', BU: 'RAFCOG', NAME: 'บริษัท เอไอไอแอล แคปปิตอล พาร์ทเนอร์ จำกัด',                    STATUS: 'ACTIVE', NAME_KH: 'ក្រុមហ៊ុន អេអាយអាយអែល ខេភីថល ផាថណឺ ឯ.ក' },
  { COMPANY_ID: 'KH003', FU_ID: 'FU03', BU: 'RAFCOG', NAME: 'FIV INVESTMENT TRUST KH CO.,LTD.',                                STATUS: 'ACTIVE', NAME_KH: 'FIV INVESTMENT TRUST KH CO.,LTD.' },
  { COMPANY_ID: 'KH004', FU_ID: 'FU03', BU: 'RAFCOG', NAME: 'บริษัท เนทีฟ ไฟแนนเชี่ยล เทคโนโลยี เคเอช จำกัด',                STATUS: 'ACTIVE', NAME_KH: 'ក្រុមហ៊ុន ណេធីវ ហ្វាយណាន់សៀល ថេកណូឡូជី ខេអេច ឯ.ក' }
];

// BRANCH_MASTER — บริษัทที่มีหลายสาขา (อ้างอิง COMPANY_ID)
// ตามชีตไก่จัง: AAM แคปปิตอลเซอร์วิส 7 สาขา · PMSG ประชากิจมอเตอร์เซลส์ 4 สาขา (สำนักงานใหญ่/สอยดาว/นายายอาม/ขลุง)
const BRANCH_MASTER = [
  // เอเอเอ็ม แคปปิตอลเซอร์วิส (TH002)
  { BRANCH_ID: 'BR001', COMPANY_ID: 'TH002', NAME: 'สำนักงานใหญ่',   STATUS: 'ACTIVE' },
  { BRANCH_ID: 'BR002', COMPANY_ID: 'TH002', NAME: 'สาขากบินทร์บุรี', STATUS: 'ACTIVE' },
  { BRANCH_ID: 'BR003', COMPANY_ID: 'TH002', NAME: 'สาขานครนายก',     STATUS: 'ACTIVE' },
  { BRANCH_ID: 'BR004', COMPANY_ID: 'TH002', NAME: 'สาขาปลวกแดง',     STATUS: 'ACTIVE' },
  { BRANCH_ID: 'BR005', COMPANY_ID: 'TH002', NAME: 'สาขาศรีนครินทร์', STATUS: 'ACTIVE' },
  { BRANCH_ID: 'BR006', COMPANY_ID: 'TH002', NAME: 'สาขาสระบุรี',     STATUS: 'ACTIVE' },
  { BRANCH_ID: 'BR007', COMPANY_ID: 'TH002', NAME: 'สาขาวังน้ำเย็น',  STATUS: 'ACTIVE' },
  // ประชากิจมอเตอร์เซลส์ (TH001) — ตามชีต 4.2.2 PMSG
  { BRANCH_ID: 'BR010', COMPANY_ID: 'TH001', NAME: 'สำนักงานใหญ่', STATUS: 'ACTIVE' },
  { BRANCH_ID: 'BR011', COMPANY_ID: 'TH001', NAME: 'สาขาสอยดาว',   STATUS: 'ACTIVE' },
  { BRANCH_ID: 'BR012', COMPANY_ID: 'TH001', NAME: 'สาขานายายอาม', STATUS: 'ACTIVE' },
  { BRANCH_ID: 'BR013', COMPANY_ID: 'TH001', NAME: 'สาขาขลุง',     STATUS: 'ACTIVE' }
];

// THEME ราย FU (Dynamic Theme ตามชีตข้อ 14)
const FU_THEME = {
  FU01: { primary: '#ea580c', grad: 'linear-gradient(135deg,#ea580c,#f59e0b)',  soft: '#fff7ed', ring: 'rgba(234,88,12,.3)' },
  FU02: { primary: '#ca8a04', grad: 'linear-gradient(135deg,#ca8a04,#facc15)',  soft: '#fefce8', ring: 'rgba(202,138,4,.3)' },
  FU03: { primary: '#dc2626', grad: 'linear-gradient(135deg,#1d4ed8,#dc2626)',  soft: '#eff6ff', ring: 'rgba(220,38,38,.3)' }
};

function getCompaniesByFU(fuId) {
  return COMPANY_MASTER.filter(c => c.FU_ID === fuId && c.STATUS === 'ACTIVE');
}
function getBranchesByCompany(companyId) {
  return BRANCH_MASTER.filter(b => b.COMPANY_ID === companyId && b.STATUS === 'ACTIVE');
}
