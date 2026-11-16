// Sukoon Market: players -> Google Sheet, and the admin site reads them back.
// Setup steps are in README.md. Paste this whole file into Extensions > Apps Script.
//
// 1) Change ADMIN_KEY below to your own long secret (at least 12 characters).
//    Only someone who knows this key can READ the players list (admin.html asks for it).
// 2) Deploy > New deployment > Web app. Execute as: Me. Who has access: Anyone.
//    After editing this file later: Deploy > Manage deployments > Edit > Version: New version.

var ADMIN_KEY = 'CHANGE-ME-to-a-long-secret';

var HEADERS = ['Joined', 'LastSeen', 'Name', 'Email', 'Phone', 'Age', 'Experience', 'Language',
  'Stage', 'Rank', 'XP', 'Coins', 'MarketDays', 'Stars', 'Badges', 'Streak', 'Academy', 'Readiness', 'Challenge', 'Consent'];

function sheet_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName('Players') || ss.insertSheet('Players');
  if (sh.getLastRow() === 0) sh.appendRow(HEADERS);
  var have = sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0];
  HEADERS.forEach(function (h) { if (have.indexOf(h) < 0) { sh.getRange(1, have.length + 1).setValue(h); have.push(h); } });
  return { sh: sh, cols: have };
}

// The game sends a signup once, then small progress updates. One row per email (updated in place).
function doPost(e) {
  var lock = LockService.getScriptLock(); lock.waitLock(10000);
  try {
    var d = JSON.parse(e.postData.contents);
    if (!d.email) return ContentService.createTextOutput('no email');
    if (d.action === 'delete_request') return deletePlayer_(d);
    if (d.action === 'contact') return logRequest_('contact', d.email, d.note, d.source);
    var t = sheet_(), sh = t.sh, cols = t.cols;
    var email = String(d.email).trim().toLowerCase();
    var emails = sh.getLastRow() > 1 ? sh.getRange(2, cols.indexOf('Email') + 1, sh.getLastRow() - 1, 1).getValues() : [];
    var row = -1;
    for (var i = 0; i < emails.length; i++) if (String(emails[i][0]).trim().toLowerCase() === email) { row = i + 2; break; }
    var now = new Date();
    var vals = { LastSeen: now, Email: email, Stage: d.stage, Rank: d.rank, XP: d.xp, Coins: d.coins,
      MarketDays: d.days, Stars: d.stars, Badges: d.badges, Streak: d.streak, Language: d.lang,
      Academy: d.academy, Readiness: d.readiness, Challenge: d.challenge };
    if (d.name) { vals.Name = d.name; vals.Phone = d.phone; vals.Age = d.age; vals.Experience = d.exp; vals.Consent = d.consent; }
    if (row < 0) { vals.Joined = now; sh.appendRow(cols.map(function (c) { return vals[c] === undefined ? '' : vals[c]; })); }
    else Object.keys(vals).forEach(function (k) { var c = cols.indexOf(k); if (c >= 0 && vals[k] !== undefined && vals[k] !== null) sh.getRange(row, c + 1).setValue(vals[k]); });
    return ContentService.createTextOutput('ok');
  } finally { lock.releaseLock(); }
}

// Data deletion (Play Store requirement): removes the player's row(s). The log keeps only time, source
// and how many rows were removed, never the email, so nothing personal stays behind.
function deletePlayer_(d) {
  var t = sheet_(), sh = t.sh, cols = t.cols, email = String(d.email).trim().toLowerCase(), removed = 0;
  if (sh.getLastRow() > 1) {
    var emails = sh.getRange(2, cols.indexOf('Email') + 1, sh.getLastRow() - 1, 1).getValues();
    for (var i = emails.length - 1; i >= 0; i--) if (String(emails[i][0]).trim().toLowerCase() === email) { sh.deleteRow(i + 2); removed++; }
  }
  logRequest_('delete', '', 'rows removed: ' + removed, d.source);
  return ContentService.createTextOutput('deleted');
}
function logRequest_(type, email, note, source) {
  var ss = SpreadsheetApp.getActiveSpreadsheet(), sh = ss.getSheetByName('Requests') || ss.insertSheet('Requests');
  if (sh.getLastRow() === 0) sh.appendRow(['Time', 'Type', 'Email', 'Note', 'Source']);
  sh.appendRow([new Date(), type, email || '', String(note || '').slice(0, 500), source || '']);
  return ContentService.createTextOutput('ok');
}

// admin.html reads the list here. The key is checked on Google's server, so the list stays private.
function doGet(e) {
  var out = function (o) { return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); };
  if (!e || !e.parameter || e.parameter.key !== ADMIN_KEY || ADMIN_KEY.indexOf('CHANGE-ME') === 0) return out({ ok: false, error: 'wrong key' });
  var t = sheet_(), sh = t.sh, cols = t.cols;
  if (sh.getLastRow() < 2) return out({ ok: true, players: [] });
  var rows = sh.getRange(2, 1, sh.getLastRow() - 1, cols.length).getValues();
  var players = rows.map(function (r) { var o = {}; cols.forEach(function (c, i) { o[c] = r[i] instanceof Date ? r[i].toISOString() : r[i]; }); return o; });
  return out({ ok: true, players: players, at: new Date().toISOString() });
}
