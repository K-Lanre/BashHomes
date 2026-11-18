function doPost(event) {
  const respond = (ok) => ContentService.createTextOutput(JSON.stringify({ ok }))
    .setMimeType(ContentService.MimeType.JSON);
  let inquiry;
  try {
    inquiry = JSON.parse(event.postData.contents);
  } catch {
    return respond(false);
  }
  const properties = PropertiesService.getScriptProperties();
  const secret = properties.getProperty('INQUIRY_SECRET');
  const spreadsheetId = properties.getProperty('SPREADSHEET_ID');
  if (!secret || !spreadsheetId || !inquiry || inquiry.secret !== secret ||
      !/^[0-9a-f-]{36}$/i.test(inquiry.id)) {
    return respond(false);
  }

  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const spreadsheet = SpreadsheetApp.openById(spreadsheetId);
    const sheet = spreadsheet.getSheetByName('Inquiries') || spreadsheet.insertSheet('Inquiries');
    const lastRow = sheet.getLastRow();
    if (!lastRow) {
      sheet.appendRow(['ID', 'Received at', 'Name', 'Email', 'Phone', 'Check-in', 'Check-out', 'Message']);
    } else if (lastRow > 1 && sheet.getRange(2, 1, lastRow - 1, 1)
      .createTextFinder(inquiry.id).matchEntireCell(true).findNext()) {
      return respond(true);
    }

    const text = (value) => value ? "'" + String(value) : '';
    sheet.appendRow([
      inquiry.id, new Date(), text(inquiry.name), text(inquiry.email), text(inquiry.phone),
      text(inquiry.arrival), text(inquiry.departure), text(inquiry.message),
    ]);
    SpreadsheetApp.flush();
    return respond(true);
  } finally {
    lock.releaseLock();
  }
}
