function doGet(e) {
  const mode = (e && e.parameter && e.parameter.mode) || 'health';

  if (mode === 'list') {
    return listRows();
  }

  return ContentService
    .createTextOutput(JSON.stringify({
      ok: true,
      message: 'Web App ทำงานอยู่',
      endpoint: 'PP7 Apps Script',
      modes: ['health', 'list']
    }))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);

    const sheet = SpreadsheetApp
      .openById('1yP_l-WmsnlkMDCkZB7ulhe6oS_AAex8iE3LYdPdg-uc')
      .getSheetByName('task');

    if (sheet.getLastRow() === 0) {
      sheet.appendRow(['created_at', 'process', 'request_id', 'status', 'owner', 'note', 'payload']);
    }

    sheet.appendRow([
      new Date(),
      data.process || '',
      data.request_id || '',
      data.status || '',
      data.owner || '',
      data.note || '',
      JSON.stringify(data)
    ]);

    return ContentService
      .createTextOutput(JSON.stringify({
        ok: true,
        message: 'บันทึกข้อมูลสำเร็จ',
        received: data
      }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({
        ok: false,
        error: err.message
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function listRows() {
  try {
    const sheet = SpreadsheetApp
      .openById('1yP_l-WmsnlkMDCkZB7ulhe6oS_AAex8iE3LYdPdg-uc')
      .getSheetByName('task');

    const lastRow = sheet.getLastRow();
    const lastCol = sheet.getLastColumn();

    if (lastRow < 2) {
      return ContentService
        .createTextOutput(JSON.stringify({ ok: true, rows: [] }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    const values = sheet.getRange(1, 1, lastRow, lastCol).getValues();
    const headers = values[0];
    const rows = values.slice(1).reverse().slice(0, 20).map(function(row) {
      const obj = {};
      headers.forEach(function(header, idx) {
        obj[header] = row[idx];
      });
      return obj;
    });

    return ContentService
      .createTextOutput(JSON.stringify({
        ok: true,
        total: lastRow - 1,
        rows: rows
      }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ ok: false, error: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
