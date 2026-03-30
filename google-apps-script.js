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

    var viewers = JSON.parse(sheet.getRange('A6').getValue() || '[]');
    var now = new Date().getTime();
    viewers = viewers.filter(function(v) { return (now - v.t) < 60000; });
    sheet.getRange('A6').setValue(JSON.stringify(viewers));

    var response = {
      players:    JSON.parse(sheet.getRange('A1').getValue() || '[]'),
      matches:    JSON.parse(sheet.getRange('A2').getValue() || '[]'),
      users:      JSON.parse(sheet.getRange('A3').getValue() || '[]'),
      chat:       JSON.parse(sheet.getRange('A4').getValue() || '[]'),
      challenges: JSON.parse(sheet.getRange('A5').getValue() || '[]'),
      viewerCount: viewers.length
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
    if (payload.challenges !== undefined)
      sheet.getRange('A5').setValue(JSON.stringify(payload.challenges));

    if (payload.heartbeat) {
      var viewers = JSON.parse(sheet.getRange('A6').getValue() || '[]');
      var now = new Date().getTime();
      viewers = viewers.filter(function(v) { return (now - v.t) < 60000; });
      var existing = viewers.findIndex(function(v) { return v.id === payload.heartbeat.id; });
      if (existing >= 0) viewers[existing].t = now;
      else viewers.push({ id: payload.heartbeat.id, n: payload.heartbeat.n, t: now });
      sheet.getRange('A6').setValue(JSON.stringify(viewers));
    }

    return ContentService
      .createTextOutput(JSON.stringify({ success: true, timestamp: new Date().toISOString() }))
      .setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}
