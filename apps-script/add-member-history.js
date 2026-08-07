/**
 * เพิ่มข้อมูลจำนวนสมาชิกย้อนหลัง (ปี 2559-2569) ลงชีต
 * 
 * วิธีใช้ (1-2 นาที):
 * 1. เปิดชีต → Extensions → Apps Script
 * 2. ลบโค้ดเก่า วางโค้ดนี้
 * 3. กด Run ▶ runAddMemberHistory → อนุญาตสิทธิ์
 * 4. เสร็จ! ข้อมูลลงชีต "จำนวนสมาชิกย้อนหลัง" อัตโนมัติ
 */
function runAddMemberHistory() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName('จำนวนสมาชิกย้อนหลัง');
  if (!sheet) sheet = ss.insertSheet('จำนวนสมาชิกย้อนหลัง');
  sheet.clear();

  const headers = ['ปีพุทธศักราช','ปีคศ','AAMG','PMSG','PGHG','RPLC&RAFL','RAFCO&AICP','CPDG&LDC','TNRG','ADMC','21CT','KKK','อื่นๆ','รวม PKG','หมายเหตุ'];
  sheet.getRange(1,1,1,headers.length).setValues([headers]);
  sheet.getRange(1,1,1,headers.length).setFontWeight('bold').setBackground('#4a86e8').setFontColor('#fff');

  const data = [
    ['Y2559',2016,204,191,77,31,0,0,0,0,0,7,0,510,'ข้อมูลจากชีตสมาชิกปี59'],
    ['Y2560',2017,206,193,71,31,0,0,0,0,0,7,0,508,'ข้อมูลจากชีตสมาชิกปี60'],
    ['Y2561',2018,219,242,68,55,5,0,1,17,4,1,16,628,'ข้อมูลจากชีตสมาชิกปี61 (AMH/ANT/AGS รวมใน อื่นๆ)'],
    ['Y2562',2019,178,196,76,53,29,15,0,17,4,2,0,570,'ข้อมูลจากชีตสมาชิกปี62 (LDX=15 รวมใน CPDG&LDC)'],
    ['Y2563',2020,176,180,73,53,29,15,0,17,4,0,0,547,'ข้อมูลจากชีตสมาชิกปี63'],
    ['Y2564',2021,168,203,55,46,56,0,0,16,0,0,40,584,'ข้อมูลจากชีตสมาชิกปี64 (RAFCO=56, อื่นๆ=40)'],
    ['Y2565',2022,139,213,53,41,56,0,0,16,0,0,41,559,'ข้อมูลจากชีตสมาชิกปี65 (พี่ปกรณ์กรอกเพิ่ม)'],
    ['Y2566',2023,0,166,0,0,0,0,1,16,0,0,0,183,'ข้อมูลจากชีตสมาชิกปี66 (มีแค่ PMSG+ADM)'],
    ['Y2567',2024,125,253,2,28,33,51,0,1,5,0,0,498,'ข้อมูลจากชีตสมาชิกปี67 (CPDG=51 ปรากฏ)'],
    ['Y2568',2025,50,262,0,25,24,7,4,0,2,0,142,516,'ข้อมูลจากชีตสมาชิกปี68 (แยกย่อยมาก รวมกลับกลุ่มหลัก)'],
    ['Y2569',2026,172,58,0,0,0,45,0,16,6,0,6,303,'ข้อมูลจาก BCT ปัจจุบัน gid=639073785']
  ];

  sheet.getRange(2,1,data.length,data[0].length).setValues(data);
  sheet.getRange(2,1,data.length,data[0].length).setHorizontalAlignment('center');
  for (let i=0;i<data.length;i++){
    const row=2+i;
    if(data[i][0]==='Y2565') sheet.getRange(row,1,1,data[0].length).setBackground('#d9d9d9');
    else if(i%2===0) sheet.getRange(row,1,1,data[0].length).setBackground('#f3f3f3');
  }
  sheet.autoResizeColumns(1,data[0].length);
  sheet.getRange(1,1,data.length+1,data[0].length).setBorder(true,true,true,true,true,true,'#000000',SpreadsheetApp.BorderStyle.SOLID);
  SpreadsheetApp.getUi().alert('✅ เพิ่มข้อมูลจำนวนสมาชิกย้อนหลัง (ปี 2559-2569) เรียบร้อยแล้ว!');
}
