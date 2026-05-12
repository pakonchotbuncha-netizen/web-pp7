/**
 * Web PP7 - Google Apps Script Web App
 * Backend: doGet serve HTML + API functions เชื่อมต่อ Sheet "แทน PP7"
 */

const SPREADSHEET_ID = '1FApsV5ZfLngePhF3kcYTYi128orW8rjCBNlTfa_aJ4w';

/**
 * Serve Web App
 */
function doGet(e) {
  return HtmlService.createTemplateFromFile('index')
    .evaluate()
    .setTitle('Web PP7 - ระบบบริหารบุคลากร')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

/**
 * Get all process data (P1-P7) from the summary tab
 */
function getSummaryData() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName('ชีต1');
  if (!sheet) return { error: 'ไม่พบชีต1' };
  
  const data = sheet.getDataRange().getValues();
  const headers = data.shift(); // remove header row
  
  const result = data.map(function(row) {
    const obj = {};
    headers.forEach(function(h, i) {
      obj[h] = row[i];
    });
    return obj;
  });
  
  return result;
}

/**
 * Get detailed data for a specific P tab
 */
function getProcessDetail(processTab) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName(processTab);
  if (!sheet) return { error: 'ไม่พบ tab: ' + processTab };
  
  const data = sheet.getDataRange().getValues();
  const result = [];
  
  for (let i = 1; i < data.length; i++) { // skip header
    if (data[i][0] && data[i][1]) {
      result.push({
        topic: data[i][0],
        detail: data[i][1]
      });
    }
  }
  
  return result;
}

/**
 * Get all tab names
 */
function getTabNames() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  return ss.getSheets().map(function(s) { return s.getName(); });
}

/**
 * Include HTML sub-files
 */
function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}
