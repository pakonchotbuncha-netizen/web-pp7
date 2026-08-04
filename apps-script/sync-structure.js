/**
 * ระบบ Sync: Google Sheet → JSON → Web
 * 
 * วิธีใช้:
 * 1. เปิด Google Sheet หลัก: https://docs.google.com/spreadsheets/d/1yP_l-WmsnlkMDCkZB7ulhe6oS_AAex8iE3LYdPdg-uc/edit
 * 2. ไปที่ Extensions > Apps Script
 * 3. สร้างไฟล์ใหม่ชื่อ "sync-structure" แล้ว paste code นี้
 * 4. แก้ไข GITHUB_TOKEN และ GITHUB_REPO
 * 5. กด Run > syncStructureToGitHub
 * 6. ตั้ง Trigger: Edit > Current project's triggers > Add Trigger
 *    - Choose which function to run: syncStructureToGitHub
 *    - Choose which deployment should run: Head
 *    - Select event source: Time-driven
 *    - Select type of time based trigger: On change (หรือ On edit)
 * 
 * หรือใช้ manual sync: กดปุ่ม "Sync to Web" ใน Sheet
 */

// ========== CONFIGURATION ==========
const GITHUB_TOKEN = 'YOUR_GITHUB_PERSONAL_ACCESS_TOKEN'; // ใส่ GitHub token ของคุณ
const GITHUB_REPO = 'pakonchotbuncha-netizen/web-pp7';
const GITHUB_BRANCH = 'main';
const JSON_FILE_PATH = 'business-structure-data.json';
const SHEET_NAME = 'โครงสร้างธุรกิจ';
const SS_ID = '1yP_l-WmsnlkMDCkZB7ulhe6oS_AAex8iE3LYdPdg-uc';

// ========== MAIN FUNCTION ==========
function syncStructureToGitHub() {
  try {
    Logger.log('🔄 เริ่ม sync ข้อมูลโครงสร้างธุรกิจ...');
    
    // ดึงข้อมูลจาก Sheet
    const data = extractDataFromSheet();
    
    // อัพเดท timestamp
    data.meta.lastUpdated = Utilities.formatDate(new Date(), 'Asia/Bangkok', 'yyyy-MM-dd HH:mm');
    
    // แปลงเป็น JSON
    const jsonContent = JSON.stringify(data, null, 2);
    
    // Push ไป GitHub
    pushToGitHub(jsonContent);
    
    Logger.log('✅ Sync สำเร็จ!');
    SpreadsheetApp.getUi().alert('✅ Sync ข้อมูลไป Web สำเร็จ!\n\nอัพเดทล่าสุด: ' + data.meta.lastUpdated);
    
  } catch (error) {
    Logger.log('❌ Error: ' + error.toString());
    SpreadsheetApp.getUi().alert('❌ เกิดข้อผิดพลาด: ' + error.toString());
  }
}

// ========== EXTRACT DATA FROM SHEET ==========
function extractDataFromSheet() {
  const ss = SpreadsheetApp.openById(SS_ID);
  const sheet = ss.getSheetByName(SHEET_NAME);
  
  if (!sheet) {
    throw new Error('ไม่พบ Sheet ชื่อ: ' + SHEET_NAME);
  }
  
  const data = {
    meta: {
      lastUpdated: '',
      description: 'Master Data สำหรับ P1 (แสวงหา) - ข้อมูลตั้งต้นในการนำเข้ากระบวนการรับสมัครงาน',
      sources: [
        'ฟอร์มคีย์ขอโครงสร้างบริษัท ภาษี/บริหาร',
        'DATAโครงสร้างบริษัทภายนอก',
        'DATAโครงสร้างบริษัทภายใน',
        'Center BCT โครงสร้าง flowchart ภาษี'
      ]
    },
    taxStructure: extractTaxStructure(sheet),
    adminStructure: extractAdminStructure(sheet),
    externalCompanies: extractExternalCompanies(sheet),
    internalCompanies: extractInternalCompanies(sheet),
    flowchartTax: extractFlowchartTax(sheet)
  };
  
  return data;
}

function extractTaxStructure(sheet) {
  // หาส่วน "ข้อมูลโครงสร้างบริษัท ภาษี"
  const lastRow = sheet.getLastRow();
  const lastCol = sheet.getLastColumn();
  const data = sheet.getRange(1, 1, lastRow, lastCol).getValues();
  
  let startRow = -1;
  for (let i = 0; i < data.length; i++) {
    if (data[i][0] && data[i][0].toString().includes('ข้อมูลโครงสร้างบริษัท ภาษี')) {
      startRow = i + 2; // ข้าม header row
      break;
    }
  }
  
  if (startRow === -1) {
    return { title: 'ข้อมูลโครงสร้างบริษัท ภาษี', headers: [], sampleData: [] };
  }
  
  const headers = data[startRow - 1].filter(h => h);
  const sampleData = [];
  
  for (let i = startRow; i < data.length && i < startRow + 100; i++) {
    const row = data[i];
    if (!row[0] && !row[1]) break; // หยุดเมื่อเจอแถวว่าง
    
    const item = {};
    headers.forEach((h, idx) => {
      if (h && row[idx]) {
        item[h] = row[idx].toString();
      }
    });
    
    if (Object.keys(item).length > 0) {
      sampleData.push(item);
    }
  }
  
  return {
    title: 'ข้อมูลโครงสร้างบริษัท ภาษี',
    headers: headers,
    sampleData: sampleData.slice(0, 10) // จำกัด 10 แถวตัวอย่าง
  };
}

function extractAdminStructure(sheet) {
  const lastRow = sheet.getLastRow();
  const lastCol = sheet.getLastColumn();
  const data = sheet.getRange(1, 1, lastRow, lastCol).getValues();
  
  let startRow = -1;
  for (let i = 0; i < data.length; i++) {
    if (data[i][0] && data[i][0].toString().includes('ข้อมูลโครงสร้างบริษัท บริหาร')) {
      startRow = i + 2;
      break;
    }
  }
  
  if (startRow === -1) {
    return { title: 'ข้อมูลโครงสร้างบริษัท บริหาร', headers: [], sampleData: [] };
  }
  
  const headers = data[startRow - 1].filter(h => h);
  const sampleData = [];
  
  for (let i = startRow; i < data.length && i < startRow + 100; i++) {
    const row = data[i];
    if (!row[0] && !row[1]) break;
    
    const item = {};
    headers.forEach((h, idx) => {
      if (h && row[idx]) {
        item[h] = row[idx].toString();
      }
    });
    
    if (Object.keys(item).length > 0) {
      sampleData.push(item);
    }
  }
  
  return {
    title: 'ข้อมูลโครงสร้างบริษัท บริหาร',
    headers: headers,
    sampleData: sampleData.slice(0, 10)
  };
}

function extractExternalCompanies(sheet) {
  const lastRow = sheet.getLastRow();
  const lastCol = sheet.getLastColumn();
  const data = sheet.getRange(1, 1, lastRow, lastCol).getValues();
  
  let startRow = -1;
  for (let i = 0; i < data.length; i++) {
    if (data[i][0] && data[i][0].toString().includes('DATAโครงสร้างบริษัทภายนอก')) {
      startRow = i + 2;
      break;
    }
  }
  
  if (startRow === -1) {
    return { title: 'DATAโครงสร้างบริษัทภายนอก', companies: [], otherCompanies: [] };
  }
  
  const headers = data[startRow - 1].filter(h => h);
  const companies = [];
  const companyMap = {};
  
  for (let i = startRow; i < data.length && i < startRow + 200; i++) {
    const row = data[i];
    if (!row[0] && !row[1] && !row[2]) break;
    
    const companyName = row[2] ? row[2].toString() : '';
    if (!companyName) continue;
    
    if (!companyMap[companyName]) {
      companyMap[companyName] = {
        code: row[1] ? row[1].toString() : '',
        name: companyName,
        nameEn: row[3] ? row[3].toString() : '',
        country: row[0] ? row[0].toString() : 'ไทย',
        positions: []
      };
      companies.push(companyMap[companyName]);
    }
    
    const position = {
      สาขา: row[4] ? row[4].toString() : '',
      ฝ่าย: row[6] ? row[6].toString() : '',
      แผนก: row[8] ? row[8].toString() : '',
      ตำแหน่ง: row[11] ? row[11].toString() : '',
      ตำแหน่งEn: row[12] ? row[12].toString() : ''
    };
    
    if (position.ตำแหน่ง) {
      companyMap[companyName].positions.push(position);
    }
  }
  
  return {
    title: 'DATAโครงสร้างบริษัทภายนอก',
    companies: companies.slice(0, 5),
    otherCompanies: companies.slice(5).map(c => ({ code: c.code, name: c.name, country: c.country }))
  };
}

function extractInternalCompanies(sheet) {
  const lastRow = sheet.getLastRow();
  const lastCol = sheet.getLastColumn();
  const data = sheet.getRange(1, 1, lastRow, lastCol).getValues();
  
  let startRow = -1;
  for (let i = 0; i < data.length; i++) {
    if (data[i][0] && data[i][0].toString().includes('DATAโครงสร้างบริษัทภายใน')) {
      startRow = i + 2;
      break;
    }
  }
  
  if (startRow === -1) {
    return { title: 'DATAโครงสร้างบริษัทภายใน', teams: [] };
  }
  
  const headers = data[startRow - 1].filter(h => h);
  const teams = [];
  
  for (let i = startRow; i < data.length && i < startRow + 50; i++) {
    const row = data[i];
    if (!row[0] && !row[1] && !row[2]) break;
    
    const team = {};
    headers.forEach((h, idx) => {
      if (h && row[idx]) {
        team[h] = row[idx].toString();
      }
    });
    
    if (Object.keys(team).length > 0) {
      teams.push(team);
    }
  }
  
  return {
    title: 'DATAโครงสร้างบริษัทภายใน',
    teams: teams.slice(0, 10)
  };
}

function extractFlowchartTax(sheet) {
  const lastRow = sheet.getLastRow();
  const lastCol = sheet.getLastColumn();
  const data = sheet.getRange(1, 1, lastRow, lastCol).getValues();
  
  let startRow = -1;
  for (let i = 0; i < data.length; i++) {
    if (data[i][0] && data[i][0].toString().includes('Center BCT')) {
      startRow = i + 2;
      break;
    }
  }
  
  if (startRow === -1) {
    return { title: 'Center BCT โครงสร้าง Flowchart ภาษี', companies: [] };
  }
  
  const headers = data[startRow - 1].filter(h => h);
  const companies = [];
  
  for (let i = startRow; i < data.length && i < startRow + 20; i++) {
    const row = data[i];
    if (!row[0] && !row[1]) break;
    
    const company = {
      code: row[0] ? row[0].toString() : '',
      name: row[1] ? row[1].toString() : '',
      sheetId: row[3] ? row[3].toString() : '',
      sheetUrl: row[2] ? row[2].toString() : '',
      flows: {
        S: row[5] ? row[5].toString() : '',
        XL: row[6] ? row[6].toString() : '',
        S_M: row[7] ? row[7].toString() : '',
        M_M: row[8] ? row[8].toString() : '',
        XL_M: row[9] ? row[9].toString() : ''
      }
    };
    
    if (company.name) {
      companies.push(company);
    }
  }
  
  return {
    title: 'Center BCT โครงสร้าง Flowchart ภาษี',
    companies: companies
  };
}

// ========== PUSH TO GITHUB ==========
function pushToGitHub(content) {
  const url = `https://api.github.com/repos/${GITHUB_REPO}/contents/${JSON_FILE_PATH}`;
  
  // ดึง SHA ของไฟล์เดิม (ถ้ามี)
  let sha = null;
  try {
    const response = UrlFetchApp.fetch(url, {
      method: 'get',
      headers: {
        'Authorization': `token ${GITHUB_TOKEN}`,
        'User-Agent': 'Google-Apps-Script'
      },
      muteHttpExceptions: true
    });
    
    if (response.getResponseCode() === 200) {
      const data = JSON.parse(response.getContentText());
      sha = data.sha;
    }
  } catch (e) {
    // ไฟล์ยังไม่มีใน GitHub
  }
  
  // สร้าง payload สำหรับ update/create
  const payload = {
    message: `🔄 Auto sync: อัพเดทโครงสร้างธุรกิจ ${new Date().toISOString()}`,
    content: Utilities.base64Encode(content),
    branch: GITHUB_BRANCH
  };
  
  if (sha) {
    payload.sha = sha;
  }
  
  // Push ไป GitHub
  const options = {
    method: 'put',
    headers: {
      'Authorization': `token ${GITHUB_TOKEN}`,
      'User-Agent': 'Google-Apps-Script',
      'Content-Type': 'application/json'
    },
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  };
  
  const response = UrlFetchApp.fetch(url, options);
  
  if (response.getResponseCode() !== 200 && response.getResponseCode() !== 201) {
    throw new Error(`GitHub API Error: ${response.getResponseCode()} - ${response.getContentText()}`);
  }
  
  return JSON.parse(response.getContentText());
}

// ========== MANUAL SYNC BUTTON ==========
function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('🔄 Sync')
    .addItem('Sync ไป Web', 'syncStructureToGitHub')
    .addToUi();
}

// ========== TEST FUNCTION ==========
function testExtractData() {
  const data = extractDataFromSheet();
  Logger.log(JSON.stringify(data, null, 2));
  return data;
}
