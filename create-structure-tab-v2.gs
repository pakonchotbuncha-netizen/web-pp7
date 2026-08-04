/**
 * สร้าง tab "โครงสร้างธุรกิจ" ใน Google Sheet หลัก Web PP7
 * รวมข้อมูลจาก 4 แหล่ง:
 * 1. ฟอร์มคีย์ขอโครงสร้างบริษัท ภาษี/บริหาร
 * 2. DATAโครงสร้างบริษัทภายนอก
 * 3. DATAโครงสร้างบริษัทภายใน
 * 4. Center BCT โครงสร้าง flowchart ภาษี
 * 
 * วิธีใช้:
 * 1. เปิด Google Sheet หลัก: https://docs.google.com/spreadsheets/d/1yP_l-WmsnlkMDCkZB7ulhe6oS_AAex8iE3LYdPdg-uc/edit
 * 2. ไปที่ Extensions > Apps Script
 * 3. ลบ code เดิมออก แล้ว paste code นี้แทน
 * 4. กด Run > createStructureTab
 * 5. อนุญาต access ที่ขอ
 * 6. กลับไปดู Sheet จะมี tab "โครงสร้างธุรกิจ" เพิ่มมา
 */

function createStructureTab() {
  var SS_ID = '1yP_l-WmsnlkMDCkZB7ulhe6oS_AAex8iE3LYdPdg-uc';
  var ss = SpreadsheetApp.openById(SS_ID);
  
  // ลบ tab เก่าถ้ามี (ป้องกันสร้างซ้ำ)
  var existingSheet = ss.getSheetByName('โครงสร้างธุรกิจ');
  if (existingSheet) {
    ss.deleteSheet(existingSheet);
  }
  
  var sheet = ss.insertSheet('โครงสร้างธุรกิจ');
  var currentRow = 1;
  
  // ============================================================
  // ส่วนที่ 1: ข้อมูลโครงสร้างบริษัท ภาษี (Header ตามฟอร์ม)
  // ============================================================
  var taxHeaders = [
    'รหัสสมาชิก', 'ชื่อสมาชิก', 'ประเทศ', 'บริษัท', 'บริษัทใหม่ (กรอก)',
    'ชื่อภาษาอังกฤษ', 'ที่อยู่ภาษาไทย', 'ที่อยู่ภาษาอังกฤษ',
    'สาขา', 'สาขาใหม่ (กรอก)', 'ตัวย่อสาขา', 'ที่อยู่สาขา ภาษาไทย',
    'ฝ่าย', 'ฝ่ายใหม่ (กรอก)', 'ชื่อฝ่ายภาษาอังกฤษ', 'ตัวย่อฝ่ายภาษาอังกฤษ',
    'แผนก', 'แผนกใหม่ (กรอก)', 'ชื่อแผนกภาษาอังกฤษ', 'ตัวย่อแผนกภาษาอังกฤษ',
    'ตำแหน่งงาน', 'ตำแหน่งงานใหม่ (กรอก)', 'ชื่อตำแหน่งงานภาษาอังกฤษ',
    'ตัวย่อตำแหน่งงานภาษาอังกฤษ', 'คุณสมบัติ', 'อัพเดทข้อมูล (ลิงค์)'
  ];
  
  var taxColCount = taxHeaders.length; // 26 columns
  
  // Title row
  var titleRange = sheet.getRange(currentRow, 1, 1, taxColCount);
  titleRange.merge();
  titleRange.setValue('📋 ข้อมูลโครงสร้างบริษัท ภาษี')
    .setBackground('#1a73e8')
    .setFontColor('#ffffff')
    .setFontSize(14)
    .setHorizontalAlignment('center')
    .setFontWeight('bold');
  currentRow++;
  
  // Header row
  var headerRange = sheet.getRange(currentRow, 1, 1, taxColCount);
  headerRange.setValues([taxHeaders])
    .setBackground('#d2e3fc')
    .setFontWeight('bold')
    .setHorizontalAlignment('center')
    .setFontSize(10);
  currentRow += 2; // เว้น 1 แถว
  
  // ============================================================
  // ส่วนที่ 2: ข้อมูลโครงสร้างบริษัท บริหาร (Header ตามฟอร์ม)
  // ============================================================
  var adminHeaders = [
    'ประเทศ', 'บริษัท', 'บริษัทใหม่ (กรอก)', 'ชื่อบริษัทภาษาอังกฤษ',
    'ตัวย่อบริษัทภาษาอังกฤษ', 'ทีม', 'ทีมใหม่ (กรอก)', 'ตัวย่อทีมภาษาอังกฤษ',
    'กรุ๊ป', 'บทบาท', 'บทบาทใหม่ (กรอก)', 'ชื่อบทบาทภาษาอังกฤษ',
    'ตัวย่อบทบาทภาษาอังกฤษ', 'ภาพความสำเร็จทีม', 'RMMทีม(แนบรูป)',
    'จุดมุ่งหมายทีม', 'เป้าหมายทีม(Objective)', 'ตัววัดผลทีม(Key Result)',
    'สถานะวัดผล', 'หน้าที่ความรับผิดชอบหลักทีม'
  ];
  
  var adminColCount = adminHeaders.length; // 20 columns
  
  // Title row
  var adminTitleRange = sheet.getRange(currentRow, 1, 1, adminColCount);
  adminTitleRange.merge();
  adminTitleRange.setValue('🏢 ข้อมูลโครงสร้างบริษัท บริหาร')
    .setBackground('#0d652d')
    .setFontColor('#ffffff')
    .setFontSize(14)
    .setHorizontalAlignment('center')
    .setFontWeight('bold');
  currentRow++;
  
  // Header row
  var adminHeaderRange = sheet.getRange(currentRow, 1, 1, adminColCount);
  adminHeaderRange.setValues([adminHeaders])
    .setBackground('#ceead6')
    .setFontWeight('bold')
    .setHorizontalAlignment('center')
    .setFontSize(10);
  currentRow += 2; // เว้น 1 แถว
  
  // ============================================================
  // ส่วนที่ 3: DATAโครงสร้างบริษัทภายนอก (ข้อมูลจริงจาก CSV)
  // ============================================================
  var extHeaders = [
    'ชื่อประเทศ', 'รหัสประเทศ', 'ชื่อบริษัท', 'รหัสบริษัท',
    'ชื่อสาขา', 'รหัสสาขา', 'ชื่อฝ่าย', 'รหัสฝ่าย',
    'ชื่อแผนกภาษาไทย', 'รหัสแผนก', 'รหัสตำแหน่งงาน',
    'ชื่อตำแหน่งงานภาษาไทย', 'ชื่อตำแหน่งงานภาษาอังกฤษ',
    'ตัวย่อตำแหน่งงานภาษาอังกฤษ', 'ชื่อตำแหน่งงานภาษาลาว',
    'ชื่อตำแหน่งงานภาษากัมพูชา', 'สถานะการใช้งาน', 'เลขที่คำขอ'
  ];
  
  var extColCount = extHeaders.length; // 18 columns
  
  // Title row
  var extTitleRange = sheet.getRange(currentRow, 1, 1, extColCount);
  extTitleRange.merge();
  extTitleRange.setValue('🏭 DATAโครงสร้างบริษัทภายนอก (AGS, 21CT, TYK, PMG, RPLC, RAFCO, LDC)')
    .setBackground('#7b1fa2')
    .setFontColor('#ffffff')
    .setFontSize(14)
    .setHorizontalAlignment('center')
    .setFontWeight('bold');
  currentRow++;
  
  // Header row
  var extHeaderRange = sheet.getRange(currentRow, 1, 1, extColCount);
  extHeaderRange.setValues([extHeaders])
    .setBackground('#e1bee7')
    .setFontWeight('bold')
    .setHorizontalAlignment('center')
    .setFontSize(10);
  currentRow++;
  
  // ข้อมูลตัวอย่างจาก CSV (ใส่เฉพาะบางส่วนเป็นตัวอย่าง)
  var extData = [
    ['ไทย', 1, 'บริษัท แอจจิลซอฟท์ คอร์ปอเรชั่น จำกัด', 1, 'สำนักงานใหญ่', 1, 'ฝ่ายเทคโนโลยีสารสนเทศ', 130, 'แผนกพัฒนาและสนับสนุนโปรแกรม', 1, 1, 'หัวหน้าแผนกพัฒนาและสนับสนุนโปรแกรม', 'System Development Support', '', '', '', 'Y', 'key_20240425_1333037'],
    ['ไทย', 1, 'บริษัท แอจจิลซอฟท์ คอร์ปอเรชั่น จำกัด', 1, 'สำนักงานใหญ่', 1, 'ฝ่ายเทคโนโลยีสารสนเทศ', 130, 'แผนกพัฒนาและสนับสนุนโปรแกรม', 1, 2, 'พนักงานพัฒนาและสนับสนุนโปรแกรม', 'System Development Support', '', '', '', 'Y', ''],
    ['ไทย', 1, 'บริษัท แอจจิลซอฟท์ คอร์ปอเรชั่น จำกัด', 1, 'สำนักงานใหญ่', 1, 'ฝ่ายเทคโนโลยีสารสนเทศ', 130, 'แผนกซ่อมบำรุงคอมพิวเตอร์', 2, 3, 'หัวหน้าแผนกซ่อมบำรุงคอมพิวเตอร์', 'IT Support', '', '', '', 'Y', ''],
    ['ไทย', 1, 'บริษัท แอจจิลซอฟท์ คอร์ปอเรชั่น จำกัด', 1, 'สำนักงานใหญ่', 1, 'ฝ่ายเทคโนโลยีสารสนเทศ', 130, 'แผนกซ่อมบำรุงคอมพิวเตอร์', 2, 4, 'พนักงานซ่อมบำรุงคอมพิวเตอร์', 'IT Support', '', '', '', 'Y', ''],
    ['ไทย', 1, 'บริษัท 21ซีที เวนเจอร์ส จำกัด', 2, 'สำนักงานใหญ่', 3, 'ฝ่ายวิศวกรรมซอฟท์แวร์', 2, 'แผนกวิจัยและพัฒนาธุรกิจ', 6, 9, 'พนักงานการเงินดิจิตอล', 'Digital Finance Staff', '', '', '', 'Y', 'key_20240425_1333037'],
    ['ไทย', 1, 'บริษัท 21ซีที รีเสิร์ท จำกัด', 43, 'สำนักงานใหญ่', 63, '', 3, 'แผนกธุรการบริหาร', 270, 498, 'ผู้ช่วยผู้บริหาร', 'Executive Assistant', '', '', '', 'Y', 'key_20240425_1333037'],
    ['ไทย', 1, 'บริษัท ประชากิจมอเตอร์เซลส์ จำกัด', 4, 'สำนักงานใหญ่', 5, 'ฝ่ายอะไหล่และศูนย์บริการ', 5, 'แผนกกรุ๊ป O/H', 10, 15, 'หัวหน้าช่างกรุ๊ป O/H', 'Head of Over Haul Machnic', '', '', '', 'Y', 'key_20240425_1333037'],
    ['ไทย', 1, 'บริษัท ประชากิจมอเตอร์เซลส์ จำกัด', 4, 'สำนักงานใหญ่', 5, 'ฝ่ายอะไหล่และศูนย์บริการ', 5, 'แผนกกรุ๊ป O/H', 10, 16, 'ช่างกรุ๊ป O/H', 'Over Haul Machnic', '', '', '', 'Y', 'key_20240425_1333037']
  ];
  
  if (extData.length > 0) {
    var extDataRange = sheet.getRange(currentRow, 1, extData.length, extColCount);
    extDataRange.setValues(extData);
    currentRow += extData.length;
  }
  
  currentRow += 2; // เว้น 2 แถว
  
  // ============================================================
  // ส่วนที่ 4: DATAโครงสร้างบริษัทภายใน (ข้อมูลจริง)
  // ============================================================
  var intHeaders = [
    'วันที่ส่ง', 'เลขที่คำขอ', 'รหัสสมาชิก', 'ชื่อสมาชิก', 'ประเทศ',
    'บริษัท', 'บริษัทใหม่', 'ชื่อบริษัทภาษาอังกฤษ', 'ตัวย่อบริษัทภาษาอังกฤษ',
    'ทีม', 'ทีมใหม่', 'กรุ๊ป', 'ตัวย่อทีมภาษาอังกฤษ',
    'บทบาท', 'บทบาทใหม่', 'ชื่อบทบาทภาษาอังกฤษ', 'ตัวย่อบทบาทภาษาอังกฤษ',
    'ภาพความสำเร็จทีม', 'RMMทีม(แนบรูป)', 'จุดมุ่งหมายทีม',
    'เป้าหมายทีม(Objective)', 'ตัววัดผลทีม(Key Result)', 'สถานะวัดผล'
  ];
  
  var intColCount = intHeaders.length; // 23 columns
  
  // Title row
  var intTitleRange = sheet.getRange(currentRow, 1, 1, intColCount);
  intTitleRange.merge();
  intTitleRange.setValue('🏠 DATAโครงสร้างบริษัทภายใน (CPDG, RPLCG, RAFCOG, PMSG)')
    .setBackground('#c62828')
    .setFontColor('#ffffff')
    .setFontSize(14)
    .setHorizontalAlignment('center')
    .setFontWeight('bold');
  currentRow++;
  
  // Header row
  var intHeaderRange = sheet.getRange(currentRow, 1, 1, intColCount);
  intHeaderRange.setValues([intHeaders])
    .setBackground('#ffcdd2')
    .setFontWeight('bold')
    .setHorizontalAlignment('center')
    .setFontSize(10);
  currentRow++;
  
  // ข้อมูลตัวอย่างจากบริษัทภายใน
  var intData = [
    ['02-03/2020', 'key_20240527_1404015', 'X5102012', 'นางสาวรัฐพร คะชาแก้ว', 'ไทย', '26##ทีมธุรกิจ LDC-Leadership Development Co.,Ltd.', '', 'LDC', 'LDC', '0##สร้างใหม่', '', 'CPDG-นวัตกรรมและกระบวนการ', 'CPD', 'gr.INP', '0##สร้างใหม่', 'ผู้รับใช้ทีมนวัตกรรมและกระบวนการ', 'INP', 'Head of Innovation and Process Department', 'Innovative staff and processes', 'สร้างชุมชนแห่งการสร้างสรรค์นวัตกรรม', 'ทุกหน่วยงานปรับปรุงกระบวนการทำงานเป็นอัตโนมัติ', 'ค่า CSI 90%', ''],
    ['31-05-2024', 'key_20240529_1441054', 'X4604033', 'นางสาวกัลรณัฎฐ์ คงดี', 'ลาว', '30##ทีมธุรกิจ RPLC-RPLC', '', 'RPLC', 'RPLC', '0##สร้างใหม่', '', 'ทีม RPLC-บัญชีการเงิน สาขานาเล่า', 'RPLC-NAL-ACC', '0##สร้างใหม่', '', 'ผู้รับใช้ทีมบัญชีการเงิน สาขานาเล่า', 'FAD', 'Head of Financial Accounting Department', 'Financial accounting staff', 'ดูแล กำกับ และ ค่อยตรวจสอบงบให้มีความถูกต้อง', 'มีความเข้าใจในเรื่องของ CBNP', '', ''],
    ['17-06-2024', 'key_20240617_0910005', '5102012', '', 'ไทย', '51##ทีมธุรกิจ CPDG-CPDG', '', 'CPDG', 'CPDG', '0##สร้างใหม่', '', 'ทีมรับใช้ PKG', 'CPD', 'gr.ADM', '0##สร้างใหม่', '', '', 'ทีมรับใช้ PKG CPDG', '', '', '', '', ''],
    ['10-10-2024', 'key_20241010_1046008', '5001026', 'นางอารีย์ เขาจารี', 'ไทย', '51##ทีมธุรกิจ CPDG-CPDG', '', 'CPDG', 'CPDG', '0##สร้างใหม่', '', 'ทีมศูนย์ประสานงานธุรกิจ', 'Business Center', '0##สร้างใหม่', '', 'สมาชิกศูนย์ประสานงานธุรกิจ', 'BCO', 'Business Center Officer', '', 'PKG ได้รับใบอนุญาติทำธุรกิจ Financial Technology TCLMV', 'ใบอนุญาต e-money, fund manager, broker', '', '']
  ];
  
  if (intData.length > 0) {
    var intDataRange = sheet.getRange(currentRow, 1, intData.length, intColCount);
    intDataRange.setValues(intData);
    currentRow += intData.length;
  }
  
  currentRow += 2; // เว้น 2 แถว
  
  // ============================================================
  // ส่วนที่ 5: Center BCT โครงสร้าง Flowchart ภาษี (ข้อมูลจริง 8 บริษัท)
  // ============================================================
  var flowHeaders = [
    'รหัสสาขา', 'ชื่อสาขา', 'ลิงค์คีย์ URL', 'Google Sheet ID',
    'ชื่อ Sheet', 'Flow S', 'Flow XL', 'Flow S_M', 'Flow M_M', 'Flow XL_M'
  ];
  
  var flowColCount = flowHeaders.length; // 10 columns
  
  // Title row
  var flowTitleRange = sheet.getRange(currentRow, 1, 1, flowColCount);
  flowTitleRange.merge();
  flowTitleRange.setValue('📊 Center BCT โครงสร้าง Flowchart ภาษี')
    .setBackground('#e37400')
    .setFontColor('#ffffff')
    .setFontSize(14)
    .setHorizontalAlignment('center')
    .setFontWeight('bold');
  currentRow++;
  
  // Header row
  var flowHeaderRange = sheet.getRange(currentRow, 1, 1, flowColCount);
  flowHeaderRange.setValues([flowHeaders])
    .setBackground('#fce8cd')
    .setFontWeight('bold')
    .setHorizontalAlignment('center')
    .setFontSize(10);
  currentRow++;
  
  // ข้อมูลจริงจาก Center BCT (8 บริษัท)
  var flowData = [
    ['X14', 'AGS', 'https://docs.google.com/spreadsheets/d/1Km5DgK2uE2d2jDAYZFI5baNadnbIW3D5I-FB8MWAvQI/edit?usp=drivesdk', '1Km5DgK2uE2d2jDAYZFI5baNadnbIW3D5I-FB8MWAvQI', 'AGSBCT : โครงสร้าง flowchart ภาษี AGS', 'https://ags.im/sNZlKGM', 'https://ags.im/L5Yh4A', 'https://ags.im/FnLv1o', 'https://ags.im/mOoAnm', 'https://ags.im/NoLq5I'],
    ['X15', 'PMS', 'https://docs.google.com/spreadsheets/d/1bmG6uAyRKkpAsFWuNH09HmOY3papi7JBaORgCvNyCRE/edit?usp=drivesdk', '1bmG6uAyRKkpAsFWuNH09HmOY3papi7JBaORgCvNyCRE', 'PMSBCT : โครงสร้าง flowchart ภาษี PMS', 'https://ags.im/qq72sUM', 'https://ags.im/4xoDtI', 'https://ags.im/I4NKhN', 'https://ags.im/7XeI31', 'https://ags.im/dKGsuT'],
    ['X16', 'PMG', 'https://docs.google.com/spreadsheets/d/1qcMHuhN3eSBuLY6Yot6STVK8Y7jZusMqUS8Z0Hq3Hn4/edit?usp=drivesdk', '1qcMHuhN3eSBuLY6Yot6STVK8Y7jZusMqUS8Z0Hq3Hn4', 'PMGBCT : โครงสร้าง flowchart ภาษี PMG', 'https://ags.im/2oWWSlM', 'https://ags.im/Lex3kc', 'https://ags.im/rvaPpm', 'https://ags.im/rEW1hB', 'https://ags.im/0flzHS'],
    ['X17', 'AAM', 'https://docs.google.com/spreadsheets/d/14wRlb6emwWIKFH4TaLBmSEb90gXL8h7_inAr_69ACdA/edit?usp=drivesdk', '14wRlb6emwWIKFH4TaLBmSEb90gXL8h7_inAr_69ACdA', 'AAMBCT : โครงสร้าง flowchart ภาษี AAM', 'https://ags.im/nYNe7RM', 'https://ags.im/cp5JZZ', 'https://ags.im/R5AaJI', 'https://ags.im/EaNqPJ', 'https://ags.im/8CvJB7'],
    ['X18', '21ct', 'https://docs.google.com/spreadsheets/d/1i9rlAzkL1hv09jqVtRB4pCmgqGPyc8FjLgWYhhkSNEI/edit?usp=drivesdk', '1i9rlAzkL1hv09jqVtRB4pCmgqGPyc8FjLgWYhhkSNEI', 'BCT : โครงสร้าง flowchart ภาษี 21CT', 'https://ags.im/KWMb8QM', 'https://ags.im/quHU1Q', 'https://ags.im/cgYksq', 'https://ags.im/5B377H', 'https://ags.im/19PRs8'],
    ['X19', 'RPLC', 'https://docs.google.com/spreadsheets/d/1EmD7kpslGDOWJbRYv_pCwqDVMD5_Mc8Ws_-8nqrg-98/edit?usp=drivesdk', '1EmD7kpslGDOWJbRYv_pCwqDVMD5_Mc8Ws_-8nqrg-98', 'RPLCBCT : โครงสร้าง flowchart ภาษี RPLC', 'https://ags.im/9MK6LRM', 'https://ags.im/z8cAYJ', 'https://ags.im/q81saa', 'https://ags.im/qa14kN', 'https://ags.im/GbRUCn'],
    ['X20', 'RAFCO', 'https://docs.google.com/spreadsheets/d/1_8pslA94Qh_xbr6m-WgAI5yjKg7CY3dMpG8zPr3xZrQ/edit?usp=drivesdk', '1_8pslA94Qh_xbr6m-WgAI5yjKg7CY3dMpG8zPr3xZrQ', 'RAFCOBCT : โครงสร้าง flowchart ภาษี RAFCO', 'https://ags.im/rlj9QOM', 'https://ags.im/u3KiWX', 'https://ags.im/8MeNXk', 'https://ags.im/98gkId', 'https://ags.im/Od75OK'],
    ['X21', 'LDC', 'https://docs.google.com/spreadsheets/d/1suh8w8Mu5aOQM4f4lLK-ywyQgVinQizBVtez23KdEcM/edit?usp=drivesdk', '1suh8w8Mu5aOQM4f4lLK-ywyQgVinQizBVtez23KdEcM', 'LDC', '', '', '', '', '']
  ];
  
  var flowDataRange = sheet.getRange(currentRow, 1, flowData.length, flowColCount);
  flowDataRange.setValues(flowData);
  currentRow += flowData.length;
  
  currentRow += 2; // เว้น 2 แถว
  
  // ============================================================
  // ส่วนที่ 6: หมายเหตุ / คำแนะนำ
  // ============================================================
  sheet.getRange(currentRow, 1).setValue('📌 หมายเหตุ:')
    .setFontWeight('bold').setFontColor('#d93025');
  currentRow++;
  
  sheet.getRange(currentRow, 1).setValue(
    '• คอลัมน์ที่มี "(กรอก)" = ใช้สำหรับกรอกข้อมูลใหม่เมื่อไม่มีใน dropdown\n' +
    '• "อัพเดทข้อมูล (ลิงค์)" = วางลิงค์หลังจากอัพเดทข้อมูลจาก https://ags.im/fUdeLB\n' +
    '• หากคีย์รอบแรกขึ้น error "SyntaxError" ให้ลบข้อมูลที่คีย์แล้วในชีท B1_Forms_ตอบรับ แล้วคีย์ใหม่\n' +
    '• ตรวจสอบข้อความข้างหลังต้องไม่มีค่าว่างเกินอยู่ (เน้นหัวข้อ คุณสมบัติ กับ หน้าที่ความรับผิดชอบหลักทีม)\n' +
    '• Flow S/XL/S_M/M_M/XL_M = ลิงค์ flowchart ภาษีแต่ละประเภท\n' +
    '• ข้อมูลบริษัทภายนอกและภายในเป็นตัวอย่างบางส่วนเท่านั้น สามารถ import เพิ่มจาก source ได้'
  ).setWrap(true);
  
  // ============================================================
  // จัดรูปแบบ
  // ============================================================
  var maxCol = Math.max(taxColCount, adminColCount, extColCount, intColCount, flowColCount);
  for (var i = 1; i <= maxCol; i++) {
    sheet.setColumnWidth(i, 150);
  }
  
  // คอลัมน์กว้างพิเศษสำหรับ field ยาว
  sheet.setColumnWidth(25, 250); // คุณสมบัติ (ภาษี)
  sheet.setColumnWidth(26, 200); // อัพเดทข้อมูล (ภาษี)
  sheet.setColumnWidth(14, 200); // ภาพความสำเร็จทีม (บริหาร)
  sheet.setColumnWidth(15, 180); // RMMทีม (บริหาร)
  sheet.setColumnWidth(16, 200); // จุดมุ่งหมายทีม (บริหาร)
  sheet.setColumnWidth(17, 200); // เป้าหมายทีม (บริหาร)
  sheet.setColumnWidth(18, 200); // ตัววัดผลทีม (บริหาร)
  sheet.setColumnWidth(20, 300); // หน้าที่ความรับผิดชอบหลักทีม (บริหาร)
  sheet.setColumnWidth(3, 300);  // ลิงค์คีย์ URL (flow)
  sheet.setColumnWidth(5, 250);  // ชื่อ Sheet (flow)
  sheet.setColumnWidth(12, 250); // ชื่อตำแหน่งงานภาษาไทย (ภายนอก)
  sheet.setColumnWidth(13, 200); // ชื่อตำแหน่งงานภาษาอังกฤษ (ภายนอก)
  sheet.setColumnWidth(18, 200); // ภาพความสำเร็จทีม (ภายใน)
  sheet.setColumnWidth(20, 200); // จุดมุ่งหมายทีม (ภายใน)
  sheet.setColumnWidth(21, 200); // เป้าหมายทีม (ภายใน)
  sheet.setColumnWidth(22, 200); // ตัววัดผลทีม (ภายใน)
  
  // Freeze header rows
  sheet.setFrozenRows(2);
  
  // Border สำหรับ header ทุกส่วน
  sheet.getRange(2, 1, 1, taxColCount)
    .setBorder(true, true, true, true, true, true, '#000000', SpreadsheetApp.BorderStyle.SOLID);
  
  // ============================================================
  // Data Validation (Dropdown) สำหรับ ประเทศ
  // ============================================================
  var dropdownSheet = ss.getSheetByName('_dropdown_data');
  if (!dropdownSheet) {
    dropdownSheet = ss.insertSheet('_dropdown_data');
    dropdownSheet.hideSheet();
  }
  
  dropdownSheet.getRange('A1').setValue('ประเทศ');
  dropdownSheet.getRange('A2:A4').setValues([['ไทย'], ['ลาว'], ['กัมพูชา']]);
  
  var countryRule = SpreadsheetApp.newDataValidation()
    .requireValueInRange(dropdownSheet.getRange('A2:A4'), true)
    .setAllowInvalid(true)
    .setHelpText('เลือกประเทศ หรือพิมพ์ใหม่')
    .build();
  
  // Apply dropdown to tax section column C (ประเทศ) - row 3-100
  sheet.getRange(3, 3, 100, 1).setDataValidation(countryRule);
  
  // ============================================================
  // สรุปผล
  // ============================================================
  Logger.log('✅ สร้าง tab "โครงสร้างธุรกิจ" สำเร็จ!');
  Logger.log('📋 ส่วนภาษี: ' + taxColCount + ' columns');
  Logger.log('🏢 ส่วนบริหาร: ' + adminColCount + ' columns');
  Logger.log('🏭 บริษัทภายนอก: ' + extColCount + ' columns, ' + extData.length + ' แถว');
  Logger.log('🏠 บริษัทภายใน: ' + intColCount + ' columns, ' + intData.length + ' แถว');
  Logger.log('📊 Flowchart ภาษี: ' + flowColCount + ' columns, ' + flowData.length + ' บริษัท');
  
  SpreadsheetApp.getUi().alert(
    '✅ สร้าง tab "โครงสร้างธุรกิจ" สำเร็จ!\n\n' +
    '📋 ส่วนภาษี: ' + taxColCount + ' columns\n' +
    '🏢 ส่วนบริหาร: ' + adminColCount + ' columns\n' +
    '🏭 บริษัทภายนอก: ' + extData.length + ' แถว (ตัวอย่าง)\n' +
    '🏠 บริษัทภายใน: ' + intData.length + ' แถว (ตัวอย่าง)\n' +
    '📊 Flowchart ภาษี: ' + flowData.length + ' บริษัท\n\n' +
    'กรุณาตรวจสอบ tab ใหม่ใน Sheet'
  );
}
