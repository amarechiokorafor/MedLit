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
 *
 * ----------------------------------------------------------------------------
 * SETUP — about five minutes, once
 * ----------------------------------------------------------------------------
 *   1. Open the spreadsheet your form responses go into.
 *   2. Extensions > Apps Script. Delete whatever is in Code.gs and paste this
 *      whole file in. Rename the file to MedLit.gs if you like.
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
 *   6. Test it. Submit your own form once. You should get two emails (the
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
 * ============================================================================
 */


/* ============================================================================
 * SETTINGS — everything you need to edit lives between here and "END SETTINGS"
 * ========================================================================== */

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
  workshops:  'Workshop Data'
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

    { label: 'Volunteer hours granted', source: 'Update by hand from your hours log.', auto: null },

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
  var ss  = SpreadsheetApp.getActiveSpreadsheet();
  var log = [];

  log.push('MedLit setup — ' + new Date());
  log.push('Spreadsheet: ' + ss.getName());
  log.push('');

  log.push(buildVolunteersTab_(ss));
  log.push(buildPartnersTab_(ss));
  log.push(buildWorkshopTab_(ss));
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
  // Written in R1C1 so each row points at its own cells. (setFormula() with an
  // A1 string would paste the identical text into every row, leaving all 900
  // of them reading row 2.)
  //   RC[-5] = column F, matched pairs
  //   RC[-4] = column G, number improved
  var formula =
    '=IF(OR(RC[-5]="",RC[-4]=""),"",' +
    'RC[-4]&" of "&RC[-5]&" matched pairs improved their comprehension scores")';
  var reportCol = sh.getRange(2, 11, Math.max(sh.getMaxRows() - 1, 1), 1);
  reportCol.setFormulaR1C1(formula);
  reportCol.setBackground(C.butterSoft).setFontStyle('italic');

  return (existed ? 'OK   Tab checked: ' : 'OK   Tab created: ') + TAB.workshops;
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
      if (autoCell.getFormula() === '' && autoCell.getValue() === '') autoCell.setFormula(m.auto);
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
  var ss = SpreadsheetApp.getActiveSpreadsheet();
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
    SpreadsheetApp.getActiveSpreadsheet().getUrl()
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
    touchDashboardStamp_(e.source || SpreadsheetApp.getActiveSpreadsheet());
  } catch (err) {
    // A simple trigger must never throw — it would surface as an error toast
    // on an ordinary edit.
  }
}

function touchDashboardStamp_(ss) {
  try {
    var sh = (ss || SpreadsheetApp.getActiveSpreadsheet()).getSheetByName(TAB.dashboard);
    if (sh) sh.getRange(DASH.stampRow, DASH.stampCol).setValue(new Date());
  } catch (ignore) {}
}


/* ============================================================================
 * 5. WEEKLY PARTNER DIGEST — Sundays, so nothing goes cold
 * ========================================================================== */

function sendWeeklyPartnerDigest() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
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
