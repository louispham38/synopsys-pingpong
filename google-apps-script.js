// ============================================================
// Google Apps Script — Deploy as Web App
// Paste this entire code into Google Apps Script editor
// (Extensions > Apps Script in your Google Sheet)
// ============================================================

function doGet(e) {
  var lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Data');
    if (!sheet) {
      sheet = SpreadsheetApp.getActiveSpreadsheet().insertSheet('Data');
      sheet.getRange('A1').setValue('[]');
      sheet.getRange('A2').setValue('[]');
      sheet.getRange('A3').setValue('[]');
    }

    var response = {
      players: JSON.parse(sheet.getRange('A1').getValue() || '[]'),
      matches: JSON.parse(sheet.getRange('A2').getValue() || '[]'),
      users:   JSON.parse(sheet.getRange('A3').getValue() || '[]'),
      chat:    JSON.parse(sheet.getRange('A4').getValue() || '[]')
    };

    return ContentService
      .createTextOutput(JSON.stringify(response))
      .setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Data');
    if (!sheet) {
      sheet = SpreadsheetApp.getActiveSpreadsheet().insertSheet('Data');
    }

    var payload = JSON.parse(e.postData.contents);

    if (payload.players !== undefined)
      sheet.getRange('A1').setValue(JSON.stringify(payload.players));
    if (payload.matches !== undefined)
      sheet.getRange('A2').setValue(JSON.stringify(payload.matches));
    if (payload.users !== undefined)
      sheet.getRange('A3').setValue(JSON.stringify(payload.users));
    if (payload.chat !== undefined)
      sheet.getRange('A4').setValue(JSON.stringify(payload.chat));

    return ContentService
      .createTextOutput(JSON.stringify({ success: true, timestamp: new Date().toISOString() }))
      .setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}
