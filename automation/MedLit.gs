/**
 * ============================================================================
 * MedLit — volunteer intake and metrics tracking
 * ============================================================================
 *
 * WHAT THIS DOES
 *   1. Every time someone submits the volunteer form, it copies them into a
 *      "Volunteers" tab, emails you an alert, and emails them a confirmation.
 *   2. Keeps a "Dashboard" tab of metrics, some counted automatically.
 *   3. Keeps a "Partners" tab for outreach, with a status dropdown and colour
 *      coding.
 *   4. Every Sunday evening, emails you every partner follow-up that is due.
 *   5. Keeps a "Workshop Data" tab for pre/post quiz results, with a column
 *      that writes your results as "16 of 23 ..." so you can paste a real
 *      number and its denominator straight into a report.
 *   6. Adds a "MedLit" menu to the spreadsheet with three logging forms, so
 *      you can enter a workshop, a partner update, or volunteer hours without
 *      typing into the right cells by hand.
 *
 * ----------------------------------------------------------------------------
 * SETUP — about five minutes, once
 * ----------------------------------------------------------------------------
 *   1. Open the spreadsheet your form responses go into.
 *   2. From THAT SPREADSHEET, choose Extensions > Apps Script. Delete whatever
 *      is in Code.gs and paste this whole file in. Rename it MedLit.gs if you
 *      like.
 *
 *      Getting here by opening script.google.com and starting a new project
 *      does not work the same way. A project made that way is not attached to
 *      any spreadsheet, so setup() has nothing to build in, and Google will not
 *      let it add the MedLit menu or open the logging dialogs. If you already
 *      did that, the fix is to paste this into the spreadsheet's own editor as
 *      above. Failing that, fill in SPREADSHEET_ID and accept losing the menu.
 *
 *   3. SET THE TIMEZONE (do this before step 5, or the Sunday email fires at
 *      the wrong hour). In the Apps Script editor: Project Settings, in the
 *      left sidebar > Time zone > (GMT-06:00) Central Time - Chicago.
 *
 *   4. EDIT THE SETTINGS BLOCK below this comment. Every line you need to
 *      touch is marked  <<< EDIT THIS.
 *
 *   5. Run the setup. In the editor toolbar, choose "setup" from the function
 *      dropdown and press Run. Google will ask you to authorise the script —
 *      that is expected; it needs permission to edit the sheet and send mail
 *      as you. Approve it. When it finishes, open the Execution log; it prints
 *      a checklist of everything it created.
 *
 *   6. Reload the spreadsheet tab. A "MedLit" menu appears next to Help, with
 *      "Log a workshop", "Log a partner update" and "Log volunteer hours".
 *
 *   7. Test it. Submit your own form once. You should get two emails (the
 *      alert to you, the confirmation to whatever address you used) and a new
 *      row in the Volunteers tab.
 *
 * You can re-run setup() safely at any time. It never deletes data — it only
 * creates tabs that are missing and reinstalls the triggers.
 *
 * ----------------------------------------------------------------------------
 * IF SOMETHING BREAKS
 * ----------------------------------------------------------------------------
 *   Apps Script editor > Executions, in the left sidebar. Every run is logged
 *   there with its error. A failed email never stops a form submission from
 *   being recorded — the row is written first, and the emails are attempted
 *   afterwards inside their own error handlers.
 *
 *   No "MedLit" menu? Reload the spreadsheet tab. The menu is added when the
 *   spreadsheet opens, so a tab that was already open won't have it.
 *
 *   "Cannot read properties of null" from setup()? The script is not attached
 *   to a spreadsheet. See step 2 above.
 * ============================================================================
 */


/* ============================================================================
 * SETTINGS — everything you need to edit lives between here and "END SETTINGS"
 * ========================================================================== */

/**
 * Leave this EMPTY if the script lives inside the spreadsheet — which is the
 * setup you want. You get that by opening the spreadsheet and choosing
 * Extensions > Apps Script, not by starting a new project at script.google.com.
 *
 * Only fill it in if you deliberately keep this as a standalone project. Paste
 * the long id out of the spreadsheet's own address bar, the part between
 * /d/ and /edit:
 *   docs.google.com/spreadsheets/d/THIS_PART_HERE/edit
 *
 * Be aware of what a standalone project cannot do: no MedLit menu, no logging
 * dialogs, and no "Last updated" stamp. Google only gives those to a script
 * that lives inside the file. Everything else still works.
 */
var SPREADSHEET_ID = '';                                     // <<< EDIT THIS

/** Where volunteer alerts and the weekly partner digest are sent. */
var ALERT_EMAIL = 'medliterateofficial@gmail.com';          // <<< EDIT THIS

/** The name volunteers see in the "From" line of the confirmation email. */
var FROM_NAME = 'MedLit';                                    // <<< EDIT THIS

/**
 * Link to the guide, used in the confirmation email.
 * Paste the direct PDF link, or your site's #guides link once it is live.
 * e.g. https://amarechiokorafor.github.io/MedLit/#guides
 */
var GUIDE_URL = 'PASTE_YOUR_GUIDE_URL_HERE';                 // <<< EDIT THIS

/**
 * Your form's question titles, spelled EXACTLY as they appear on the form —
 * capitals, punctuation and all. If a volunteer's name or email lands in the
 * wrong column, this block is almost always why.
 *
 * To check: open the form, and copy each question title character for
 * character. "Email address" and "Email Address" are different strings.
 */
var FORM_FIELDS = {                                          // <<< EDIT THIS
  name:   'Name',
  school: 'School',
  city:   'City/State',
  email:  'Email',
  role:   'Role interest'
};

/**
 * The confirmation email volunteers receive.
 * Edit freely — {{name}} is replaced with their first name, {{guide}} with
 * GUIDE_URL above. Nothing else in this file needs to change when you edit it.
 */
var CONFIRMATION_SUBJECT = 'Thanks for signing up with MedLit';

var CONFIRMATION_BODY =
'Hi {{name}},\n' +
'\n' +
'Thanks for signing up. We have your form, and a real person is reading it.\n' +
'\n' +
'MedLit runs free workshops on how to read prescription labels, lab results,\n' +
'and insurance letters. We also write free one-page guides in plain language,\n' +
'and a licensed healthcare professional reviews every one before we publish it.\n' +
'\n' +
'Someone from our team will email you within a week about next steps. If you\n' +
'want to see what our materials look like first, this is our guide to reading\n' +
'a prescription label:\n' +
'{{guide}}\n' +
'\n' +
'Thanks again for saying yes to this.\n' +
'\n' +
'The MedLit team\n' +
'medliterateofficial@gmail.com\n' +
'\n' +
'---\n' +
'MedLit provides general health education, not medical advice. Always talk to\n' +
'your doctor or pharmacist about your specific medications.\n';

/**
 * The weekly partner digest goes out Sundays at this hour, in the timezone you
 * set in step 3. 18 = 6pm. Change the number if you want a different time.
 */
var DIGEST_HOUR = 18;                                        // <<< EDIT THIS

/**
 * Should the Sunday email still arrive when nothing is due?
 * false = stay quiet on empty weeks. true = send "0 follow-ups due" anyway.
 */
var DIGEST_WHEN_EMPTY = false;                               // <<< EDIT THIS

/**
 * Statuses the digest leaves out. A partner who said no doesn't need chasing.
 * Set to [] if you'd rather see every overdue row regardless of status.
 * Note that "Booked" is deliberately NOT in this list — a booked workshop
 * usually still has something owed to it, like sending the materials over.
 */
var DIGEST_SKIP_STATUSES = ['Declined', 'Dead'];             // <<< EDIT THIS

/* ============================================================================
 * END SETTINGS — you shouldn't need to edit anything below this line.
 * ========================================================================== */


/* --- Tab names and column layouts ----------------------------------------- */

var TAB = {
  volunteers: 'Volunteers',
  dashboard:  'Dashboard',
  partners:   'Partners',
  workshops:  'Workshop Data',
  hours:      'Volunteer Hours'
};

var VOLUNTEER_HEADERS = [
  'Timestamp', 'Name', 'School', 'City/State', 'Email',
  'Role interest', 'Status', 'Contacted date', 'Notes'
];

var PARTNER_HEADERS = [
  'Organization', 'Contact name', 'Title', 'Email', 'Phone',
  'Date contacted', 'Method', 'Status', 'Next action', 'Next action date'
];

/** Partners: column H is Status, column J is Next action date. */
var PARTNER_COL = { status: 8, nextActionDate: 10 };

var PARTNER_STATUSES = [
  'Not contacted', 'Emailed', 'Followed up', 'Call made',
  'Replied', 'Meeting set', 'Booked', 'Declined', 'Dead'
];

/**
 * "Log volunteer hours" needs somewhere to put them, and there wasn't a tab
 * for it — so setup() creates this one. "Logged at" is when the entry was
 * made, which is not always the day the work happened.
 */
var HOURS_HEADERS = ['Date', 'Volunteer', 'Task', 'Hours', 'Logged at'];

var WORKSHOP_HEADERS = [
  'Date', 'Partner site', 'Attendees', 'Pre-tests completed',
  'Post-tests completed', 'Matched pairs', 'Number improved',
  'Number unchanged', 'Number declined', 'Notes', 'For reports (auto)'
];

/** Dashboard: where the "Last updated" stamp lives, and where metrics start. */
var DASH = { stampRow: 2, stampCol: 2, headerRow: 4, firstMetricRow: 5 };

/**
 * The dashboard metrics, in order.
 *   label  — what shows in column A
 *   auto   — formula for column C, or null when there's nothing to count from
 *   source — plain-English note for column D
 */
function dashboardMetrics_() {
  var W = "'" + TAB.workshops + "'";
  var V = TAB.volunteers;
  return [
    { label: 'Workshops held',      source: 'Counts dated rows in Workshop Data.',
      auto: '=IFERROR(COUNTA(' + W + '!A2:A),0)' },

    { label: 'Total attendees',     source: 'Adds up the Attendees column in Workshop Data.',
      auto: '=IFERROR(SUM(' + W + '!C2:C),0)' },

    { label: 'Recurring partners',  source: 'Partner sites that appear more than once in Workshop Data.',
      auto: '=IFERROR(COUNTA(UNIQUE(FILTER(' + W + '!B2:B,' + W + '!B2:B<>"",COUNTIF(' + W + '!B2:B,' + W + '!B2:B)>1))),0)' },

    { label: 'Guides published',    source: 'Update by hand as you publish.', auto: null },

    { label: 'Languages',           source: 'Update by hand. Count a language once a guide exists in it.', auto: null },

    { label: 'Volunteers signed up', source: 'Counts rows in the Volunteers tab.',
      auto: '=IFERROR(COUNTA(' + V + '!A2:A),0)' },

    { label: 'Volunteer hours granted', source: 'Adds up the Hours column in Volunteer Hours. Log entries with MedLit > Log volunteer hours.',
      auto: '=IFERROR(SUM(' + "'" + TAB.hours + "'" + '!D2:D),0)' },

    { label: 'Instagram followers', source: 'Update by hand. Note the date you checked.', auto: null },

    { label: 'Press mentions',      source: 'Update by hand.', auto: null }
  ];
}

/* --- Colours, matched to the MedLit palette ------------------------------- */
var C = {
  ink:       '#0E1A3C',
  white:     '#FFFFFF',
  butter:    '#FFDDA3',
  butterSoft:'#FFF1DA',
  tint:      '#EAEFF9',
  green:     '#D7EBD3',
  yellow:    '#FFF0BF',
  gray:      '#E4E4E4',
  grayText:  '#7A7A7A'
};


/* ============================================================================
 * SETUP — run this once, by hand, from the editor
 * ========================================================================== */

function setup() {
  var ss  = getSpreadsheet_();
  var log = [];

  log.push('MedLit setup — ' + new Date());
  log.push('Spreadsheet: ' + ss.getName());
  log.push('');

  log.push(buildVolunteersTab_(ss));
  log.push(buildPartnersTab_(ss));
  log.push(buildWorkshopTab_(ss));
  log.push(buildHoursTab_(ss));
  log.push(buildDashboardTab_(ss));
  log.push('');

  log.push(installTrigger_('onVolunteerFormSubmit', function () {
    ScriptApp.newTrigger('onVolunteerFormSubmit').forSpreadsheet(ss).onFormSubmit().create();
  }));
  log.push(installTrigger_('sendWeeklyPartnerDigest', function () {
    ScriptApp.newTrigger('sendWeeklyPartnerDigest')
      .timeBased().onWeekDay(ScriptApp.WeekDay.SUNDAY).atHour(DIGEST_HOUR).create();
  }));
  log.push('');

  // Timezone check — the weekly trigger fires on the PROJECT's timezone, not
  // the spreadsheet's, so a mismatch here is the usual cause of a digest that
  // arrives at the wrong hour.
  var tz = Session.getScriptTimeZone();
  if (tz === 'America/Chicago') {
    log.push('OK   Timezone is America/Chicago. Digest will send Sundays at ' + DIGEST_HOUR + ':00 Central.');
  } else {
    log.push('WARN Timezone is "' + tz + '", not America/Chicago.');
    log.push('     The Sunday digest will fire at ' + DIGEST_HOUR + ':00 ' + tz + ' time.');
    log.push('     Fix: Project Settings > Time zone > Central Time - Chicago, then re-run setup().');
  }

  // Settings you may not have filled in yet.
  if (GUIDE_URL.indexOf('PASTE_') === 0) {
    log.push('WARN GUIDE_URL is still a placeholder. The confirmation email will');
    log.push('     read better once you paste the real link at the top of this file.');
  }

  log.push('');
  if (SpreadsheetApp.getActiveSpreadsheet()) {
    log.push('OK   Menu installed. Reload the spreadsheet tab and look for "MedLit"');
    log.push('     in the menu bar, next to Help.');
  } else {
    log.push('WARN This script is standalone, working on the spreadsheet in');
    log.push('     SPREADSHEET_ID. The tabs, the emails and the Sunday digest all');
    log.push('     work, but there will be no MedLit menu, no logging dialogs and');
    log.push('     no "Last updated" stamp — Google only gives those to a script');
    log.push('     that lives inside the spreadsheet.');
    log.push('     To get them: open the spreadsheet, Extensions > Apps Script,');
    log.push('     paste this file there, and clear SPREADSHEET_ID.');
  }
  log.push('');
  log.push('Setup finished. Submit your form once to test it end to end.');

  var out = log.join('\n');
  Logger.log(out);
  return out;
}

/** Removes any existing triggers for a handler, then installs a fresh one. */
function installTrigger_(handlerName, createFn) {
  var removed = 0;
  ScriptApp.getProjectTriggers().forEach(function (t) {
    if (t.getHandlerFunction() === handlerName) {
      ScriptApp.deleteTrigger(t);
      removed++;
    }
  });
  createFn();
  return 'OK   Trigger installed: ' + handlerName +
         (removed ? ' (replaced ' + removed + ' older one' + (removed > 1 ? 's' : '') + ')' : '');
}


/* ============================================================================
 * TAB BUILDERS — each is safe to run repeatedly; none touch existing rows
 * ========================================================================== */

function buildVolunteersTab_(ss) {
  var existed = !!ss.getSheetByName(TAB.volunteers);
  var sh = getOrCreateSheet_(ss, TAB.volunteers);
  writeHeaders_(sh, VOLUNTEER_HEADERS);

  sh.setColumnWidth(1, 150);   // Timestamp
  sh.setColumnWidth(2, 160);   // Name
  sh.setColumnWidth(3, 170);   // School
  sh.setColumnWidth(4, 140);   // City/State
  sh.setColumnWidth(5, 220);   // Email
  sh.setColumnWidth(6, 180);   // Role interest
  sh.setColumnWidth(9, 300);   // Notes
  sh.getRange('A2:A').setNumberFormat('yyyy-mm-dd hh:mm');
  sh.getRange('H2:H').setNumberFormat('yyyy-mm-dd');

  // Status dropdown, so the tab stays sortable instead of collecting freehand
  // variations of the same word.
  sh.getRange(2, 7, Math.max(sh.getMaxRows() - 1, 1), 1).setDataValidation(
    SpreadsheetApp.newDataValidation()
      .requireValueInList(['New', 'Contacted', 'Onboarded', 'Active', 'Inactive'], true)
      .setAllowInvalid(true)
      .build()
  );

  return (existed ? 'OK   Tab checked: ' : 'OK   Tab created: ') + TAB.volunteers;
}

function buildPartnersTab_(ss) {
  var existed = !!ss.getSheetByName(TAB.partners);
  var sh = getOrCreateSheet_(ss, TAB.partners);
  writeHeaders_(sh, PARTNER_HEADERS);

  sh.setColumnWidth(1, 220);   // Organization
  sh.setColumnWidth(2, 160);   // Contact name
  sh.setColumnWidth(3, 150);   // Title
  sh.setColumnWidth(4, 220);   // Email
  sh.setColumnWidth(5, 130);   // Phone
  sh.setColumnWidth(7, 110);   // Method
  sh.setColumnWidth(9, 280);   // Next action
  sh.getRange('F2:F').setNumberFormat('yyyy-mm-dd');
  sh.getRange('J2:J').setNumberFormat('yyyy-mm-dd');

  var lastRow = Math.max(sh.getMaxRows() - 1, 1);

  sh.getRange(2, PARTNER_COL.status, lastRow, 1).setDataValidation(
    SpreadsheetApp.newDataValidation()
      .requireValueInList(PARTNER_STATUSES, true)
      .setAllowInvalid(false)
      .build()
  );

  // Row colouring driven by the Status column. Rules are rebuilt from scratch
  // each run so re-running setup() doesn't stack duplicates.
  var rows = sh.getRange(2, 1, lastRow, PARTNER_HEADERS.length);
  var rule = function (formula, bg, fontColor) {
    var b = SpreadsheetApp.newConditionalFormatRule()
      .whenFormulaSatisfied(formula).setBackground(bg).setRanges([rows]);
    if (fontColor) b = b.setFontColor(fontColor);
    return b.build();
  };
  sh.setConditionalFormatRules([
    rule('=$H2="Booked"', C.green),
    rule('=OR($H2="Replied",$H2="Meeting set")', C.yellow),
    rule('=OR($H2="Declined",$H2="Dead")', C.gray, C.grayText)
  ]);

  return (existed ? 'OK   Tab checked: ' : 'OK   Tab created: ') + TAB.partners;
}

function buildWorkshopTab_(ss) {
  var existed = !!ss.getSheetByName(TAB.workshops);
  var sh = getOrCreateSheet_(ss, TAB.workshops);
  writeHeaders_(sh, WORKSHOP_HEADERS);

  sh.setColumnWidth(1, 110);   // Date
  sh.setColumnWidth(2, 220);   // Partner site
  sh.setColumnWidth(10, 260);  // Notes
  sh.setColumnWidth(11, 400);  // For reports
  sh.getRange('A2:A').setNumberFormat('yyyy-mm-dd');

  // The reporting string. Always a count against its denominator — a bare
  // percentage with no denominator is not something we publish.
  //
  // One ARRAYFORMULA in K2 covers every row, now and later. Writing a separate
  // formula into all 998 rows would have made getLastRow() report 999 on an
  // empty sheet, which in turn would send appended rows to the bottom.
  var arrayFormula =
    '=ARRAYFORMULA(IF($F2:$F="","",' +
    '$G2:$G&" of "&$F2:$F&" matched pairs improved their comprehension scores"))';
  if (sh.getRange('K2').getFormula() === '') sh.getRange('K2').setFormula(arrayFormula);
  sh.getRange(2, 11, Math.max(sh.getMaxRows() - 1, 1), 1)
    .setBackground(C.butterSoft).setFontStyle('italic');

  return (existed ? 'OK   Tab checked: ' : 'OK   Tab created: ') + TAB.workshops;
}

function buildHoursTab_(ss) {
  var existed = !!ss.getSheetByName(TAB.hours);
  var sh = getOrCreateSheet_(ss, TAB.hours);
  writeHeaders_(sh, HOURS_HEADERS);

  sh.setColumnWidth(1, 110);   // Date
  sh.setColumnWidth(2, 190);   // Volunteer
  sh.setColumnWidth(3, 320);   // Task
  sh.setColumnWidth(4, 90);    // Hours
  sh.setColumnWidth(5, 160);   // Logged at
  sh.getRange('A2:A').setNumberFormat('yyyy-mm-dd');
  sh.getRange('D2:D').setNumberFormat('0.##');
  sh.getRange('E2:E').setNumberFormat('yyyy-mm-dd hh:mm');

  return (existed ? 'OK   Tab checked: ' : 'OK   Tab created: ') + TAB.hours;
}

function buildDashboardTab_(ss) {
  var existed = !!ss.getSheetByName(TAB.dashboard);
  var sh = getOrCreateSheet_(ss, TAB.dashboard);
  var metrics = dashboardMetrics_();

  sh.getRange('A1').setValue('MedLit — metrics')
    .setFontSize(16).setFontWeight('bold').setFontColor(C.ink);

  sh.getRange(DASH.stampRow, 1).setValue('Last updated')
    .setFontWeight('bold').setFontColor(C.ink);
  sh.getRange(DASH.stampRow, DASH.stampCol).setNumberFormat('yyyy-mm-dd hh:mm');

  var headers = ['Metric', 'Current value (you update)', 'Auto-calculated', 'Where the number comes from'];
  sh.getRange(DASH.headerRow, 1, 1, headers.length).setValues([headers])
    .setFontWeight('bold').setFontColor(C.white).setBackground(C.ink);

  for (var i = 0; i < metrics.length; i++) {
    var row = DASH.firstMetricRow + i;
    var m = metrics[i];

    sh.getRange(row, 1).setValue(m.label).setFontWeight('bold');

    // Column C: only write the formula if the cell is empty, so re-running
    // setup() never clobbers a value you've typed over it.
    var autoCell = sh.getRange(row, 3);
    if (m.auto) {
      // "—" is what an earlier version of this script parked in cells that had
      // nothing to count from. If a metric has since gained a source, replace it.
      var current = String(autoCell.getValue());
      if (autoCell.getFormula() === '' && (current === '' || current === '—')) {
        autoCell.setFormula(m.auto);
      }
      autoCell.setBackground(C.butterSoft);
    } else {
      if (autoCell.getValue() === '') autoCell.setValue('—');
      autoCell.setFontColor(C.grayText).setHorizontalAlignment('center');
    }

    sh.getRange(row, 4).setValue(m.source).setFontColor(C.grayText).setFontSize(9);
    sh.getRange(row, 2).setBackground(C.white).setBorder(true, true, true, true, false, false);
  }

  sh.setColumnWidth(1, 210);
  sh.setColumnWidth(2, 190);
  sh.setColumnWidth(3, 150);
  sh.setColumnWidth(4, 360);
  sh.setFrozenRows(DASH.headerRow);

  touchDashboardStamp_(ss);
  return (existed ? 'OK   Tab checked: ' : 'OK   Tab created: ') + TAB.dashboard;
}

/**
 * The spreadsheet this script works on.
 *
 * getActiveSpreadsheet() returns the file a bound script lives in. In a
 * standalone project there is no such file and it returns null, which is where
 * "Cannot read properties of null" comes from. This turns that into an
 * explanation, and lets SPREADSHEET_ID stand in when it's set.
 */
function getSpreadsheet_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();   // null in a standalone project
  if (ss) return ss;

  if (SPREADSHEET_ID) {
    try {
      return SpreadsheetApp.openById(SPREADSHEET_ID);
    } catch (err) {
      throw new Error(
        'SPREADSHEET_ID is set to "' + SPREADSHEET_ID + '", but that spreadsheet ' +
        'could not be opened. Check you copied the id from between /d/ and /edit ' +
        'in the address bar, and that this account can open the file. (' + err.message + ')');
    }
  }

  throw new Error(
    'This script is not attached to a spreadsheet.\n\n' +
    'It looks like it was created as a new project at script.google.com. A ' +
    'project made that way has no spreadsheet of its own, so there is nothing ' +
    'for setup() to build in.\n\n' +
    'The fix, and the one worth doing: open your form-response spreadsheet, ' +
    'choose Extensions > Apps Script, and paste this file in there instead. ' +
    'That version can also add the MedLit menu and the logging dialogs, which ' +
    'a standalone project cannot.\n\n' +
    'If you would rather keep this project where it is, paste the spreadsheet ' +
    'id into SPREADSHEET_ID at the top of this file. Everything except the ' +
    'menu, the dialogs and the "Last updated" stamp will work.');
}

function getOrCreateSheet_(ss, name) {
  return ss.getSheetByName(name) || ss.insertSheet(name);
}

/** Writes the header row and formats it. Leaves every other row alone. */
function writeHeaders_(sh, headers) {
  sh.getRange(1, 1, 1, headers.length).setValues([headers])
    .setFontWeight('bold').setFontColor(C.white).setBackground(C.ink)
    .setVerticalAlignment('middle');
  sh.setFrozenRows(1);
  sh.setRowHeight(1, 32);
}


/* ============================================================================
 * 1 + 2. FORM SUBMISSION — record the volunteer, then send the two emails
 * ==========================================================================
 * Order matters. The row is written first and committed, so if either email
 * fails you still have the signup. Each email is attempted inside its own
 * try/catch, so one failing does not stop the other.
 */

function onVolunteerFormSubmit(e) {
  var ss = getSpreadsheet_();
  var v  = readSubmission_(e);
  var noteParts = [];

  // --- record the volunteer -------------------------------------------------
  var sh = ss.getSheetByName(TAB.volunteers);
  if (!sh) {
    buildVolunteersTab_(ss);
    sh = ss.getSheetByName(TAB.volunteers);
  }

  sh.appendRow([
    v.timestamp, v.name, v.school, v.city, v.email, v.role,
    'New',   // Status
    '',      // Contacted date
    ''       // Notes
  ]);
  var newRow = sh.getLastRow();
  SpreadsheetApp.flush();

  // --- alert you ------------------------------------------------------------
  try {
    MailApp.sendEmail({
      to: ALERT_EMAIL,
      subject: 'New MedLit volunteer signup: ' + (v.name || 'name not given'),
      body: alertBody_(v),
      name: FROM_NAME
    });
  } catch (err) {
    noteParts.push('Alert email failed: ' + err.message);
    Logger.log('Alert email failed: ' + err);
  }

  // --- confirm to the volunteer --------------------------------------------
  if (looksLikeEmail_(v.email)) {
    try {
      MailApp.sendEmail({
        to: v.email,
        subject: CONFIRMATION_SUBJECT,
        body: renderConfirmation_(v),
        name: FROM_NAME,
        replyTo: ALERT_EMAIL
      });
    } catch (err) {
      noteParts.push('Confirmation email failed: ' + err.message);
      Logger.log('Confirmation email to ' + v.email + ' failed: ' + err);
    }
  } else {
    noteParts.push('No usable email address — confirmation not sent.');
  }

  // Anything that went wrong is written into the row's Notes column, so a
  // silent failure can't hide in the execution log.
  if (noteParts.length) {
    try { sh.getRange(newRow, 9).setValue(noteParts.join(' | ')); } catch (ignore) {}
  }

  touchDashboardStamp_(ss);
}

/**
 * Pulls the fields out of the form-submit event.
 * Prefers namedValues (keyed by question title). Falls back to the raw row in
 * the order the questions appear, so a renamed question degrades to
 * "wrong column" rather than "nothing recorded".
 */
function readSubmission_(e) {
  var pick = function (title, fallbackIndex) {
    if (e && e.namedValues && e.namedValues[title] && e.namedValues[title].join('')) {
      return e.namedValues[title].join(', ').trim();
    }
    if (e && e.values && e.values.length > fallbackIndex) {
      return String(e.values[fallbackIndex] || '').trim();
    }
    return '';
  };
  return {
    timestamp: (e && e.values && e.values[0]) ? e.values[0] : new Date(),
    name:   pick(FORM_FIELDS.name,   1),
    school: pick(FORM_FIELDS.school, 2),
    city:   pick(FORM_FIELDS.city,   3),
    email:  pick(FORM_FIELDS.email,  4),
    role:   pick(FORM_FIELDS.role,   5)
  };
}

function alertBody_(v) {
  return [
    'Someone signed up to volunteer.',
    '',
    'Name:          ' + (v.name   || '(not given)'),
    'School:        ' + (v.school || '(not given)'),
    'City/State:    ' + (v.city   || '(not given)'),
    'Email:         ' + (v.email  || '(not given)'),
    'Role interest: ' + (v.role   || '(not given)'),
    '',
    'They have been added to the Volunteers tab with status "New".',
    'They have been sent the confirmation email, which says we will be in',
    'touch within a week.',
    '',
    getSpreadsheet_().getUrl()
  ].join('\n');
}

function renderConfirmation_(v) {
  var first = String(v.name || '').trim().split(/\s+/)[0] || 'there';
  return CONFIRMATION_BODY
    .replace(/\{\{name\}\}/g,  first)
    .replace(/\{\{guide\}\}/g, GUIDE_URL);
}

function looksLikeEmail_(s) {
  return /^[^@\s]+@[^@\s.]+\.[^@\s]+$/.test(String(s || '').trim());
}


/* ============================================================================
 * 3. DASHBOARD — "Last updated" refreshes whenever anyone edits the sheet
 * ==========================================================================
 * This is a simple trigger: Google runs any function named onEdit
 * automatically, so there is nothing to install. Edits the script itself makes
 * do not re-fire it, so there is no loop.
 */

function onEdit(e) {
  try {
    if (!e || !e.range) return;
    var sh = e.range.getSheet();
    // Ignore the stamp writing over itself.
    if (sh.getName() === TAB.dashboard &&
        e.range.getRow() === DASH.stampRow &&
        e.range.getColumn() === DASH.stampCol) return;
    touchDashboardStamp_(e.source);
  } catch (err) {
    // A simple trigger must never throw — it would surface as an error toast
    // on an ordinary edit.
  }
}

function touchDashboardStamp_(ss) {
  try {
    var sh = (ss || getSpreadsheet_()).getSheetByName(TAB.dashboard);
    if (sh) sh.getRange(DASH.stampRow, DASH.stampCol).setValue(new Date());
  } catch (ignore) {}
}


/* ============================================================================
 * 5. WEEKLY PARTNER DIGEST — Sundays, so nothing goes cold
 * ========================================================================== */

function sendWeeklyPartnerDigest() {
  var ss = getSpreadsheet_();
  var sh = ss.getSheetByName(TAB.partners);
  if (!sh) { Logger.log('No "' + TAB.partners + '" tab. Run setup() first.'); return; }

  var lastRow = sh.getLastRow();
  if (lastRow < 2) { Logger.log('Partners tab is empty. Nothing to chase.'); return; }

  var rows = sh.getRange(2, 1, lastRow - 1, PARTNER_HEADERS.length).getValues();
  var tz   = Session.getScriptTimeZone();
  var today = new Date(); today.setHours(23, 59, 59, 999);   // "today or earlier"

  var due = [];
  for (var i = 0; i < rows.length; i++) {
    var r      = rows[i];
    var status = String(r[PARTNER_COL.status - 1] || '').trim();
    var when   = r[PARTNER_COL.nextActionDate - 1];

    if (!(when instanceof Date) || isNaN(when.getTime())) continue;  // no date set
    if (when.getTime() > today.getTime()) continue;                  // not due yet
    if (DIGEST_SKIP_STATUSES.indexOf(status) !== -1) continue;

    due.push({
      row:     i + 2,
      org:     r[0], contact: r[1], email: r[3],
      status:  status || '(no status)',
      action:  r[8] || '(no next action written down)',
      date:    Utilities.formatDate(when, tz, 'yyyy-MM-dd'),
      overdue: Math.floor((today.getTime() - when.getTime()) / 86400000)
    });
  }

  due.sort(function (a, b) { return b.overdue - a.overdue; });

  if (!due.length && !DIGEST_WHEN_EMPTY) {
    Logger.log('No follow-ups due. Digest not sent (DIGEST_WHEN_EMPTY is false).');
    return;
  }

  var lines = [];
  lines.push(due.length
    ? 'These partner follow-ups are due today or overdue.'
    : 'Nothing is due this week. Everything on the Partners tab is either scheduled ahead or closed.');
  lines.push('');

  due.forEach(function (d) {
    lines.push(d.org + (d.contact ? '  —  ' + d.contact : ''));
    lines.push('   Due:         ' + d.date + (d.overdue > 0 ? '  (' + d.overdue + ' day' + (d.overdue > 1 ? 's' : '') + ' ago)' : '  (today)'));
    lines.push('   Status:      ' + d.status);
    lines.push('   Next action: ' + d.action);
    if (d.email) lines.push('   Email:       ' + d.email);
    lines.push('   Row ' + d.row);
    lines.push('');
  });

  lines.push(ss.getUrl());

  try {
    MailApp.sendEmail({
      to: ALERT_EMAIL,
      subject: 'MedLit: ' + due.length + ' partner follow-ups due',
      body: lines.join('\n'),
      name: FROM_NAME
    });
    Logger.log('Digest sent. ' + due.length + ' follow-up(s) due.');
  } catch (err) {
    Logger.log('Digest email failed: ' + err);
  }
}

/** Run this by hand to see this week's digest without waiting for Sunday. */
function testWeeklyDigest() {
  sendWeeklyPartnerDigest();
}


/* ============================================================================
 * THE "MedLit" MENU AND ITS THREE DIALOGS
 * ==========================================================================
 * onOpen is a simple trigger — Google runs any function with that name when
 * the spreadsheet opens, so the menu needs no installation. If you don't see
 * it, reload the spreadsheet tab.
 *
 * The dialogs are built in code rather than in separate .html files, so this
 * stays one file you can paste in one go. buildDialog_() turns a list of field
 * definitions into the form, the client-side checks, and the wiring back to
 * the server, which means all three dialogs share one implementation.
 *
 * Validation runs twice on purpose. The dialog checks the obvious things
 * (required, numeric, whole numbers) so you get an instant answer. The server
 * re-checks everything and owns the rules that involve more than one field —
 * it is the only side that can be trusted, since a dialog can be left open
 * while the sheet changes underneath it.
 * ========================================================================== */

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('MedLit')
    .addItem('Log a workshop', 'openWorkshopDialog')
    .addItem('Log a partner update', 'openPartnerDialog')
    .addItem('Log volunteer hours', 'openHoursDialog')
    .addToUi();
}


/* --- Menu item 1: log a workshop ------------------------------------------ */

function openWorkshopDialog() {
  var html = buildDialog_({
    title: 'Log a workshop',
    intro: 'Everything except the notes ends up in Workshop Data. Leave the test counts blank if you have not scored them yet.',
    serverFn: 'submitWorkshopLog',
    submitLabel: 'Save workshop',
    width: 560,
    height: 700,
    fields: [
      { key: 'date',      label: 'Date',                  type: 'date',     required: true, value: todayIso_() },
      { key: 'site',      label: 'Partner site',          type: 'text',     required: true,
        help: 'The organisation that hosted. Spell it the same way every time so the recurring-partners count works.' },
      { key: 'attendees', label: 'Attendees',             type: 'number',   required: true, min: 0, integer: true },
      { key: 'pre',       label: 'Pre-tests completed',   type: 'number',   min: 0, integer: true },
      { key: 'post',      label: 'Post-tests completed',  type: 'number',   min: 0, integer: true },
      { key: 'matched',   label: 'Matched pairs',         type: 'number',   min: 0, integer: true,
        help: 'People who did both a pre-test and a post-test.' },
      { key: 'improved',  label: 'Number improved',       type: 'number',   min: 0, integer: true },
      { key: 'unchanged', label: 'Number unchanged',      type: 'number',   min: 0, integer: true },
      { key: 'declined',  label: 'Number declined',       type: 'number',   min: 0, integer: true,
        help: 'Improved, unchanged and declined have to add up to matched pairs.' },
      { key: 'notes',     label: 'Notes',                 type: 'textarea' }
    ]
  });
  SpreadsheetApp.getUi().showModalDialog(html, 'Log a workshop');
}

function submitWorkshopLog(d) {
  try {
    var ss = getSpreadsheet_();
    var sh = requireSheet_(ss, TAB.workshops);

    var date = parseIsoDate_(d.date);
    if (!date) return fail_('Pick a date for the workshop.');

    var site = String(d.site || '').trim();
    if (!site) return fail_('Enter the partner site.');

    var attendees = readInt_(d.attendees);
    if (attendees === null) return fail_('Attendees has to be a whole number.');

    var pre       = readInt_(d.pre);
    var post      = readInt_(d.post);
    var matched   = readInt_(d.matched);
    var improved  = readInt_(d.improved);
    var unchanged = readInt_(d.unchanged);
    var declined  = readInt_(d.declined);

    // Cross-field rules. These are the ones that keep the reported numbers
    // honest, so they live on the server where they cannot be skipped.
    if (pre  !== null && pre  > attendees) return fail_('Pre-tests completed (' + pre + ') is more than the number of attendees (' + attendees + ').');
    if (post !== null && post > attendees) return fail_('Post-tests completed (' + post + ') is more than the number of attendees (' + attendees + ').');
    if (matched !== null && pre  !== null && matched > pre)  return fail_('Matched pairs (' + matched + ') cannot be more than pre-tests completed (' + pre + ').');
    if (matched !== null && post !== null && matched > post) return fail_('Matched pairs (' + matched + ') cannot be more than post-tests completed (' + post + ').');

    var scored = [improved, unchanged, declined].filter(function (n) { return n !== null; });
    if (scored.length) {
      if (matched === null) return fail_('Enter the number of matched pairs as well, so the result has a denominator.');
      var sum = (improved || 0) + (unchanged || 0) + (declined || 0);
      if (sum !== matched) {
        return fail_('Improved, unchanged and declined add up to ' + sum +
                     ', but you entered ' + matched + ' matched pairs. Those have to agree.');
      }
    }

    var row = firstEmptyRowByColumn_(sh, 1);
    sh.getRange(row, 1, 1, 10).setValues([[
      date, site, attendees,
      blankIfNull_(pre), blankIfNull_(post), blankIfNull_(matched),
      blankIfNull_(improved), blankIfNull_(unchanged), blankIfNull_(declined),
      String(d.notes || '').trim()
    ]]);

    refreshDashboard_(ss);

    var summary = (matched !== null && improved !== null)
      ? improved + ' of ' + matched + ' improved'
      : attendees + ' attendees';
    ss.toast(site + ' — ' + summary + '. Row ' + row + '.', 'Workshop logged', 6);
    return done_('Saved to ' + TAB.workshops + ', row ' + row + '.');

  } catch (err) {
    Logger.log('submitWorkshopLog failed: ' + err);
    return fail_('Could not save it: ' + err.message);
  }
}


/* --- Menu item 2: log a partner update ------------------------------------ */

function openPartnerDialog() {
  var options = partnerOptions_();
  if (!options.length) {
    SpreadsheetApp.getUi().alert(
      'No organisations yet',
      'Add an organisation to the ' + TAB.partners + ' tab first, then come back here to log updates against it.',
      SpreadsheetApp.getUi().ButtonSet.OK);
    return;
  }

  var html = buildDialog_({
    title: 'Log a partner update',
    intro: 'This updates the status, next action and next action date on the row you pick. Nothing else on that row changes.',
    serverFn: 'submitPartnerUpdate',
    submitLabel: 'Save update',
    width: 560,
    height: 620,
    fields: [
      { key: 'row',        label: 'Organisation', type: 'select', required: true, options: options },
      { key: 'status',     label: 'New status',   type: 'select', required: true,
        options: PARTNER_STATUSES.map(function (v) { return { value: v, label: v }; }) },
      { key: 'nextAction', label: 'Next action',  type: 'text',
        help: 'What has to happen next, and who does it. Required unless the status is ' + DIGEST_SKIP_STATUSES.join(' or ') + '.' },
      { key: 'nextDate',   label: 'Next action date', type: 'date',
        help: 'The Sunday digest emails you every row whose date has passed.' }
    ]
  });
  SpreadsheetApp.getUi().showModalDialog(html, 'Log a partner update');
}

function submitPartnerUpdate(d) {
  try {
    var ss = getSpreadsheet_();
    var sh = requireSheet_(ss, TAB.partners);

    var row = readInt_(d.row);
    if (row === null || row < 2 || row > sh.getLastRow()) {
      return fail_('That organisation is no longer on row ' + d.row + '. Close this and open it again.');
    }

    var status = String(d.status || '').trim();
    if (PARTNER_STATUSES.indexOf(status) === -1) return fail_('Pick a status from the list.');

    var closing    = DIGEST_SKIP_STATUSES.indexOf(status) !== -1;
    var nextAction = String(d.nextAction || '').trim();
    var nextDate   = parseIsoDate_(d.nextDate);

    if (!closing && !nextAction) {
      return fail_('Write down the next action. Without one this row drops off the Sunday digest and goes cold.');
    }
    if (!closing && !nextDate) {
      return fail_('Set a next action date, so the Sunday digest can remind you.');
    }
    if (d.nextDate && !nextDate) return fail_('That next action date is not a real date.');

    var org = sh.getRange(row, 1).getValue();
    sh.getRange(row, PARTNER_COL.status).setValue(status);
    sh.getRange(row, 9).setValue(nextAction);
    sh.getRange(row, PARTNER_COL.nextActionDate).setValue(nextDate || '');

    refreshDashboard_(ss);

    ss.toast(org + ' is now "' + status + '".', 'Partner updated', 6);
    return done_('Updated ' + org + ' on row ' + row + '.');

  } catch (err) {
    Logger.log('submitPartnerUpdate failed: ' + err);
    return fail_('Could not save it: ' + err.message);
  }
}

/** Every organisation on the Partners tab, newest rows last. */
function partnerOptions_() {
  var sh = getSpreadsheet_().getSheetByName(TAB.partners);
  if (!sh || sh.getLastRow() < 2) return [];
  var rows = sh.getRange(2, 1, sh.getLastRow() - 1, PARTNER_HEADERS.length).getValues();
  var out = [];
  for (var i = 0; i < rows.length; i++) {
    var org = String(rows[i][0] || '').trim();
    if (!org) continue;
    var contact = String(rows[i][1] || '').trim();
    var status  = String(rows[i][PARTNER_COL.status - 1] || '').trim();
    out.push({
      value: i + 2,                                        // the sheet row
      label: org + (contact ? ' — ' + contact : '') + (status ? '  (' + status + ')' : '')
    });
  }
  return out;
}


/* --- Menu item 3: log volunteer hours ------------------------------------- */

function openHoursDialog() {
  var options = volunteerOptions_();
  if (!options.length) {
    SpreadsheetApp.getUi().alert(
      'No volunteers yet',
      'The ' + TAB.volunteers + ' tab is empty. It fills up on its own as people submit the form.',
      SpreadsheetApp.getUi().ButtonSet.OK);
    return;
  }

  var html = buildDialog_({
    title: 'Log volunteer hours',
    intro: 'These add up into "Volunteer hours granted" on the Dashboard.',
    serverFn: 'submitVolunteerHours',
    submitLabel: 'Save hours',
    width: 520,
    height: 560,
    fields: [
      { key: 'volunteer', label: 'Volunteer', type: 'select', required: true, options: options },
      { key: 'task',      label: 'What they did', type: 'text', required: true,
        help: 'Short and specific. "Ran the Bellaire library workshop" beats "volunteering".' },
      { key: 'hours',     label: 'Hours', type: 'number', required: true, min: 0, max: 24, step: '0.25',
        help: 'Quarter hours are fine. 1.5 means an hour and a half.' },
      { key: 'date',      label: 'Date worked', type: 'date', required: true, value: todayIso_() }
    ]
  });
  SpreadsheetApp.getUi().showModalDialog(html, 'Log volunteer hours');
}

function submitVolunteerHours(d) {
  try {
    var ss = getSpreadsheet_();
    var sh = requireSheet_(ss, TAB.hours);

    var volunteer = String(d.volunteer || '').trim();
    if (!volunteer) return fail_('Pick a volunteer.');

    var task = String(d.task || '').trim();
    if (!task) return fail_('Write down what they did.');

    var hours = Number(d.hours);
    if (!isFinite(hours))  return fail_('Hours has to be a number.');
    if (hours <= 0)        return fail_('Hours has to be more than zero.');
    if (hours > 24)        return fail_('That is more than a day. Split it across the dates it happened on.');

    var date = parseIsoDate_(d.date);
    if (!date) return fail_('Pick the date the work happened.');

    var row = firstEmptyRowByColumn_(sh, 1);
    sh.getRange(row, 1, 1, 5).setValues([[date, volunteer, task, hours, new Date()]]);

    refreshDashboard_(ss);

    ss.toast(hours + (hours === 1 ? ' hour' : ' hours') + ' logged for ' + volunteer + '.', 'Hours logged', 6);
    return done_('Saved to ' + TAB.hours + ', row ' + row + '.');

  } catch (err) {
    Logger.log('submitVolunteerHours failed: ' + err);
    return fail_('Could not save it: ' + err.message);
  }
}

/** Volunteer names, de-duplicated, alphabetical. */
function volunteerOptions_() {
  var sh = getSpreadsheet_().getSheetByName(TAB.volunteers);
  if (!sh || sh.getLastRow() < 2) return [];
  var names = sh.getRange(2, 2, sh.getLastRow() - 1, 1).getValues();
  var seen = {}, out = [];
  for (var i = 0; i < names.length; i++) {
    var n = String(names[i][0] || '').trim();
    if (!n || seen[n]) continue;
    seen[n] = true;
    out.push({ value: n, label: n });
  }
  out.sort(function (a, b) { return a.label.localeCompare(b.label); });
  return out;
}


/* --- Shared helpers for the three handlers -------------------------------- */

function refreshDashboard_(ss) {
  SpreadsheetApp.flush();          // commit the write so the formulas see it
  touchDashboardStamp_(ss);
}

function requireSheet_(ss, name) {
  var sh = ss.getSheetByName(name);
  if (!sh) throw new Error('There is no "' + name + '" tab. Run setup() from the Apps Script editor.');
  return sh;
}

function done_(message) { return { ok: true,  message: message }; }
function fail_(error)   { return { ok: false, error: error }; }

/** '' and null both mean "not entered". Anything else must be a whole number. */
function readInt_(v) {
  if (v === '' || v === null || typeof v === 'undefined') return null;
  var n = Number(v);
  if (!isFinite(n) || n < 0 || n % 1 !== 0) return null;
  return n;
}

function blankIfNull_(n) { return n === null ? '' : n; }

/**
 * Turns the 'YYYY-MM-DD' an <input type="date"> produces into a local Date.
 * new Date('2026-07-29') parses as UTC midnight, which lands on the 28th once
 * the sheet renders it in Central time. Splitting the parts avoids that.
 */
function parseIsoDate_(s) {
  var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(s || '').trim());
  if (!m) return null;
  var d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  return isNaN(d.getTime()) ? null : d;
}

function todayIso_() {
  return Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd');
}

/**
 * First row whose column `col` is empty, starting at row 2.
 * Used instead of appendRow() because appendRow() goes after the last row with
 * ANY content, and a formula sitting in a far-down cell would push new entries
 * to the bottom of the sheet.
 */
function firstEmptyRowByColumn_(sh, col) {
  var maxRows = sh.getMaxRows();
  var values = sh.getRange(2, col, Math.max(maxRows - 1, 1), 1).getValues();
  for (var i = 0; i < values.length; i++) {
    if (String(values[i][0]).trim() === '') return i + 2;
  }
  sh.insertRowsAfter(maxRows, 20);
  return maxRows + 1;
}


/* ============================================================================
 * DIALOG BUILDER
 * ==========================================================================
 * One implementation behind all three menu items. Give it a list of fields and
 * the name of a server function; it returns the dialog.
 *
 * Field shape:
 *   key       name sent back to the server
 *   label     what the person reads
 *   type      'text' | 'number' | 'date' | 'textarea' | 'select'
 *   required  true to block submission when empty
 *   min, max  numbers only
 *   integer   numbers only, true to reject 2.5
 *   step      numbers only, e.g. '0.25'
 *   value     prefilled value
 *   help      small print under the field
 *   options   selects only, [{value: ..., label: ...}]
 * ========================================================================== */

function buildDialog_(cfg) {
  var h = [];
  h.push('<!DOCTYPE html><html><head><base target="_top"><meta charset="utf-8">');
  h.push('<style>' + dialogCss_() + '</style></head><body>');
  h.push('<h1>' + escapeHtml_(cfg.title) + '</h1>');
  if (cfg.intro) h.push('<p class="intro">' + escapeHtml_(cfg.intro) + '</p>');
  h.push('<div id="msg" class="msg" role="alert" hidden></div>');
  h.push('<form id="form" novalidate>');
  for (var i = 0; i < cfg.fields.length; i++) h.push(fieldHtml_(cfg.fields[i]));
  h.push('</form>');
  h.push('<div class="actions">');
  h.push('<button type="button" class="btn ghost" id="cancel">Cancel</button>');
  h.push('<button type="button" class="btn primary" id="save">' + escapeHtml_(cfg.submitLabel) + '</button>');
  h.push('</div>');
  h.push('<script>');
  h.push('var FIELDS = ' + safeJson_(cfg.fields) + ';');
  h.push('var SERVER_FN = ' + safeJson_(cfg.serverFn) + ';');
  h.push(dialogJs_());
  h.push('<' + '/script></body></html>');

  return HtmlService.createHtmlOutput(h.join('\n'))
    .setWidth(cfg.width || 560)
    .setHeight(cfg.height || 620);
}

function fieldHtml_(f) {
  var id   = 'f_' + f.key;
  var help = f.help ? '<p class="help" id="' + id + '_help">' + escapeHtml_(f.help) + '</p>' : '';
  var described = f.help ? ' aria-describedby="' + id + '_help"' : '';
  var req  = f.required ? ' <span class="req" aria-hidden="true">required</span>' : '';
  var attrs = ' id="' + id + '" name="' + escapeHtml_(f.key) + '"' + described +
              (f.required ? ' aria-required="true"' : '');
  var out = ['<div class="field">'];
  out.push('<label for="' + id + '">' + escapeHtml_(f.label) + req + '</label>');

  if (f.type === 'select') {
    var sel = ['<select' + attrs + '>'];
    sel.push('<option value="">Choose one</option>');
    for (var i = 0; i < (f.options || []).length; i++) {
      var o = f.options[i];
      sel.push('<option value="' + escapeHtml_(String(o.value)) + '">' + escapeHtml_(String(o.label)) + '</option>');
    }
    sel.push('</select>');
    out.push(sel.join(''));

  } else if (f.type === 'textarea') {
    out.push('<textarea rows="3"' + attrs + '>' + escapeHtml_(f.value || '') + '</textarea>');

  } else {
    var extra = '';
    if (f.type === 'number') {
      extra += ' inputmode="decimal"';
      if (typeof f.min !== 'undefined')  extra += ' min="' + f.min + '"';
      if (typeof f.max !== 'undefined')  extra += ' max="' + f.max + '"';
      if (f.step) extra += ' step="' + escapeHtml_(f.step) + '"';
      else if (f.integer) extra += ' step="1"';
    }
    out.push('<input type="' + escapeHtml_(f.type) + '"' + attrs + extra +
             ' value="' + escapeHtml_(f.value || '') + '">');
  }

  out.push(help);
  out.push('</div>');
  return out.join('');
}

function dialogCss_() {
  return [
    // Same palette as the website, so the tools feel like they belong to it.
    ':root{--ink:#0E1A3C;--navy:#083795;--navy-deep:#052A75;--body:#2E4674;',
    '--muted:#4A5C82;--paper:#FBF8F3;--line:#D3DCF0;--butter:#FFDDA3;',
    '--butter-soft:#FFF1DA;--bad:#8C1D18;--bad-bg:#FCE9E7;--good:#0F5132;--good-bg:#E4F1E6;}',
    '*{box-sizing:border-box;}',
    'body{margin:0;padding:20px 22px 90px;background:var(--paper);color:var(--body);',
    'font:16px/1.5 "Segoe UI",Roboto,-apple-system,system-ui,sans-serif;}',
    'h1{margin:0 0 6px;font-size:20px;line-height:1.2;color:var(--ink);letter-spacing:-.01em;}',
    '.intro{margin:0 0 18px;font-size:14px;color:var(--muted);}',
    '.field{margin-bottom:15px;}',
    'label{display:block;font-weight:600;font-size:14px;color:var(--ink);margin-bottom:5px;}',
    '.req{font-weight:400;font-size:11px;color:var(--muted);text-transform:uppercase;letter-spacing:.08em;margin-left:5px;}',
    'input,select,textarea{width:100%;padding:9px 11px;font:inherit;font-size:15px;color:var(--ink);',
    'background:#fff;border:1px solid var(--line);border-radius:8px;}',
    'textarea{resize:vertical;min-height:64px;}',
    'input:focus,select:focus,textarea:focus{outline:3px solid var(--ink);outline-offset:1px;border-color:var(--ink);}',
    'input.bad,select.bad,textarea.bad{border-color:var(--bad);background:var(--bad-bg);}',
    '.help{margin:5px 0 0;font-size:12.5px;color:var(--muted);}',
    '.msg{margin:0 0 16px;padding:11px 13px;border-radius:8px;font-size:14px;}',
    '.msg.bad{background:var(--bad-bg);color:var(--bad);border:1px solid #E9B7B2;}',
    '.msg.good{background:var(--good-bg);color:var(--good);border:1px solid #B6D8BC;}',
    '.actions{position:fixed;left:0;right:0;bottom:0;display:flex;gap:10px;justify-content:flex-end;',
    'padding:14px 22px;background:var(--paper);border-top:1px solid var(--line);}',
    '.btn{font:inherit;font-size:15px;font-weight:700;padding:10px 20px;border-radius:999px;',
    'border:2px solid transparent;cursor:pointer;}',
    '.btn:focus-visible{outline:3px solid var(--ink);outline-offset:2px;}',
    '.primary{background:var(--navy);color:#fff;}',
    '.primary:hover{background:var(--navy-deep);}',
    '.primary[disabled]{background:var(--muted);cursor:progress;}',
    '.ghost{background:transparent;color:var(--navy);border-color:var(--navy);}',
    '.ghost:hover{background:#E6ECFA;}'
  ].join('');
}

/**
 * The client half. Deliberately does only the checks it can do instantly —
 * required, numeric, whole numbers, ranges. Everything that depends on more
 * than one field is the server's job, and its message comes back here.
 */
function dialogJs_() {
  return [
    'var msg = document.getElementById("msg");',
    'var saveBtn = document.getElementById("save");',
    'saveBtn.setAttribute("data-label", saveBtn.textContent);',
    '',
    'function show(text, kind) {',
    '  msg.textContent = text;',
    '  msg.className = "msg " + kind;',
    '  msg.hidden = false;',
    '  msg.scrollIntoView({block:"nearest"});',
    '}',
    'function clearMarks() {',
    '  var marked = document.querySelectorAll(".bad");',
    '  for (var i = 0; i < marked.length; i++) marked[i].classList.remove("bad");',
    '  msg.hidden = true;',
    '}',
    '',
    'function collect() {',
    '  var data = {}, problems = [], firstBad = null;',
    '  for (var i = 0; i < FIELDS.length; i++) {',
    '    var f = FIELDS[i];',
    '    var el = document.getElementById("f_" + f.key);',
    '    var v = (el.value || "").trim();',
    '    var bad = null;',
    '',
    '    if (f.required && !v) {',
    '      bad = f.label + " is required.";',
    '    } else if (f.type === "number" && v !== "") {',
    '      var n = Number(v);',
    '      if (!isFinite(n)) bad = f.label + " has to be a number.";',
    '      else if (f.integer && n % 1 !== 0) bad = f.label + " has to be a whole number.";',
    '      else if (typeof f.min !== "undefined" && n < f.min) bad = f.label + " cannot be less than " + f.min + ".";',
    '      else if (typeof f.max !== "undefined" && n > f.max) bad = f.label + " cannot be more than " + f.max + ".";',
    '    }',
    '',
    '    if (bad) {',
    '      problems.push(bad);',
    '      el.classList.add("bad");',
    '      if (!firstBad) firstBad = el;',
    '    }',
    '    data[f.key] = v;',
    '  }',
    '  return { data: data, problems: problems, firstBad: firstBad };',
    '}',
    '',
    'function save() {',
    '  clearMarks();',
    '  var got = collect();',
    '  if (got.problems.length) {',
    '    show(got.problems[0], "bad");',
    '    if (got.firstBad) got.firstBad.focus();',
    '    return;',
    '  }',
    '  saveBtn.disabled = true;',
    '  saveBtn.textContent = "Saving";',
    '  google.script.run',
    '    .withSuccessHandler(function (res) {',
    '      if (res && res.ok) {',
    '        show(res.message, "good");',
    '        setTimeout(function () { google.script.host.close(); }, 1100);',
    '      } else {',
    '        show((res && res.error) || "Something went wrong. Nothing was saved.", "bad");',
    '        reset();',
    '      }',
    '    })',
    '    .withFailureHandler(function (err) {',
    '      show(err && err.message ? err.message : String(err), "bad");',
    '      reset();',
    '    })',
    '    [SERVER_FN](got.data);',
    '}',
    '',
    'function reset() {',
    '  saveBtn.disabled = false;',
    '  saveBtn.textContent = saveBtn.getAttribute("data-label") || "Save";',
    '}',
    '',
    'saveBtn.addEventListener("click", save);',
    'document.getElementById("cancel").addEventListener("click", function () { google.script.host.close(); });',
    '',
    // Enter submits from any single-line field; the notes box keeps its newlines.
    'document.getElementById("form").addEventListener("keydown", function (e) {',
    '  if (e.key === "Enter" && e.target.tagName !== "TEXTAREA") { e.preventDefault(); save(); }',
    '});',
    '',
    'var firstField = document.querySelector("input, select, textarea");',
    'if (firstField) firstField.focus();'
  ].join('\n');
}

function escapeHtml_(s) {
  return String(s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

/** JSON that is safe to drop inside a <script> block. */
function safeJson_(value) {
  return JSON.stringify(value)
    .replace(/</g, '\\u003c').replace(/>/g, '\\u003e').replace(/&/g, '\\u0026');
}
