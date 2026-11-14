/**
 * Sunday Solar — Expense Tracker (Apps Script)
 *
 * Paste into the Apps Script project attached to the Spreadsheet owned by
 * sundaypowerprojectspvt@gmail.com.
 *
 * Script Properties (Project Settings → Script properties):
 *   EXPENSE_PASS  — shared team passphrase
 *   SHEET_ID      — Spreadsheet ID (from the Sheet URL)
 *   FOLDER_ID     — Drive folder ID for receipts
 *
 * Deploy → New deployment → Web app
 *   Execute as: Me
 *   Who has access: Anyone
 * After each code change, deploy a NEW version.
 */

var SHEET_NAME = 'Expenses'
var HEADERS = [
  'id',
  'createdAt',
  'person',
  'amount',
  'date',
  'note',
  'receiptFileId',
  'receiptUrl',
]

function jsonOut_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(
    ContentService.MimeType.JSON,
  )
}

function getProp_(key) {
  var v = PropertiesService.getScriptProperties().getProperty(key)
  if (!v) {
    throw new Error('Missing Script Property: ' + key)
  }
  return v
}

function checkPass_(pass) {
  var expected = getProp_('EXPENSE_PASS')
  if (!pass || String(pass) !== expected) {
    throw new Error('Invalid passphrase.')
  }
}

function getSheet_() {
  var ss = SpreadsheetApp.openById(getProp_('SHEET_ID'))
  var sheet = ss.getSheetByName(SHEET_NAME)
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME)
  }
  ensureHeaders_(sheet)
  return sheet
}

function ensureHeaders_(sheet) {
  var lastCol = Math.max(sheet.getLastColumn(), HEADERS.length)
  var existing = sheet.getRange(1, 1, 1, lastCol).getValues()[0]
  var needs = false
  for (var i = 0; i < HEADERS.length; i++) {
    if (String(existing[i] || '') !== HEADERS[i]) {
      needs = true
      break
    }
  }
  if (needs || sheet.getLastRow() === 0) {
    sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS])
  }
}

function parseBody_(e) {
  if (!e || e.postData == null || !e.postData.contents) {
    throw new Error('Missing POST body.')
  }
  try {
    return JSON.parse(e.postData.contents)
  } catch (err) {
    throw new Error('Body must be JSON.')
  }
}

/**
 * GET ?action=list&pass=...
 * Returns { ok: true, rows: [...] }
 */
function doGet(e) {
  try {
    e = e || { parameter: {} }
    var action = (e.parameter && e.parameter.action) || 'list'
    var pass = (e.parameter && e.parameter.pass) || ''
    checkPass_(pass)

    if (action !== 'list') {
      return jsonOut_({ ok: false, error: 'Unknown action.' })
    }

    var sheet = getSheet_()
    var values = sheet.getDataRange().getValues()
    if (values.length <= 1) {
      return jsonOut_({ ok: true, rows: [] })
    }

    var headers = values[0]
    var rows = []
    for (var r = 1; r < values.length; r++) {
      var row = values[r]
      var obj = {}
      for (var c = 0; c < headers.length; c++) {
        obj[headers[c]] = row[c]
      }
      // Skip blank trailing rows
      if (!obj.id && !obj.person && !obj.amount) continue
      rows.push({
        id: String(obj.id || ''),
        createdAt: String(obj.createdAt || ''),
        person: String(obj.person || ''),
        amount: Number(obj.amount) || 0,
        date: formatDate_(obj.date),
        note: String(obj.note || ''),
        receiptFileId: String(obj.receiptFileId || ''),
        receiptUrl: String(obj.receiptUrl || ''),
      })
    }

    return jsonOut_({ ok: true, rows: rows })
  } catch (err) {
    return jsonOut_({ ok: false, error: String(err.message || err) })
  }
}

function formatDate_(v) {
  if (Object.prototype.toString.call(v) === '[object Date]' && !isNaN(v)) {
    return Utilities.formatDate(v, Session.getScriptTimeZone(), 'yyyy-MM-dd')
  }
  return String(v || '')
}

/**
 * POST JSON body:
 * {
 *   pass, id, person, amount, date, note,
 *   receiptBase64, receiptMimeType, receiptFileName
 * }
 */
function doPost(e) {
  try {
    var body = parseBody_(e)
    checkPass_(body.pass)

    var id = String(body.id || '').trim()
    var person = String(body.person || '').trim()
    var amount = Number(body.amount)
    var date = String(body.date || '').trim()
    var note = String(body.note || '').trim()
    var b64 = String(body.receiptBase64 || '')
    var mime = String(body.receiptMimeType || 'image/jpeg')
    var fileName = String(body.receiptFileName || 'receipt.jpg')

    if (!id) throw new Error('id is required.')
    if (!person) throw new Error('person is required.')
    if (!(amount > 0)) throw new Error('amount must be > 0.')
    if (!date) throw new Error('date is required.')

    var sheet = getSheet_()

    // Idempotent: if id already exists, return ok without duplicating.
    var existing = sheet.getDataRange().getValues()
    for (var i = 1; i < existing.length; i++) {
      if (String(existing[i][0]) === id) {
        return jsonOut_({ ok: true, id: id, duplicate: true })
      }
    }

    var fileId = ''
    var receiptUrl = ''
    if (b64) {
      var safePerson = person.replace(/[^\w\- ]+/g, '').replace(/\s+/g, '_')
      var driveName = date + '_' + safePerson + '_' + id + '.jpg'
      var blob = Utilities.newBlob(
        Utilities.base64Decode(b64),
        mime,
        driveName || fileName,
      )
      var folder = DriveApp.getFolderById(getProp_('FOLDER_ID'))
      var file = folder.createFile(blob)
      file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW)
      fileId = file.getId()
      receiptUrl = 'https://drive.google.com/file/d/' + fileId + '/view'
    }

    var createdAt = new Date().toISOString()
    sheet.appendRow([
      id,
      createdAt,
      person,
      amount,
      date,
      note,
      fileId,
      receiptUrl,
    ])

    return jsonOut_({ ok: true, id: id, receiptUrl: receiptUrl })
  } catch (err) {
    return jsonOut_({ ok: false, error: String(err.message || err) })
  }
}
