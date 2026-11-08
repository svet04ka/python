/**
 * Приёмник домашек для сайта курса Python.
 * Ученики присылают сюда свой прогресс, а панель тьютора (tutor.html) его читает.
 *
 * Как установить — README.md, раздел «Автоматическая отправка прогресса».
 * Коротко: Google Таблица → Расширения → Apps Script → вставить этот код →
 * поменять PASSWORD → Развернуть → Веб-приложение (доступ: все) → ссылку вписать в config.js.
 */

// Пароль для панели тьютора. Придумайте свой и никому не показывайте.
const PASSWORD = 'поменяйте-этот-пароль';

const SHEET_NAME = 'Сдачи';
const HEADER = ['Обновлено', 'Ученик', 'Урок', 'Домашка', 'Звёзды', 'Из', 'Данные (не редактировать)'];

function sheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(SHEET_NAME);
  if (!sh) {
    sh = ss.insertSheet(SHEET_NAME);
    sh.appendRow(HEADER);
    sh.setFrozenRows(1);
    sh.getRange(1, 1, 1, HEADER.length).setFontWeight('bold');
    sh.setColumnWidth(2, 180);
  }
  return sh;
}

function key_(name) {
  return String(name || '').toLowerCase().replace(/ё/g, 'е').replace(/\s+/g, ' ').trim();
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

// Ученик присылает прогресс (сайт делает это сам).
function doPost(e) {
  let data;
  try { data = JSON.parse(e.postData.contents); } catch (err) { return json_({ ok: false, error: 'bad json' }); }
  if (!data || !data.name || !data.hw || String(data.hw).length > 20) return json_({ ok: false, error: 'no name' });
  const name = String(data.name).slice(0, 60).trim();
  const lock = LockService.getScriptLock();
  lock.waitLock(15000);
  try {
    const sh = sheet_();
    const values = sh.getDataRange().getValues();
    const k = key_(name);
    let row = -1;
    for (let i = 1; i < values.length; i++) {
      if (key_(values[i][1]) === k && String(values[i][3]) === String(data.hw)) { row = i + 1; break; }
    }
    const ts = Number(data.ts) || Date.now();
    if (row > 0) {
      const old = new Date(values[row - 1][0]).getTime();
      if (old && old > ts) return json_({ ok: true, skipped: 'older' });
    }
    const record = [new Date(ts), name, Number(data.lesson) || '', String(data.hw), Number(data.stars) || 0, Number(data.max) || 0, JSON.stringify(data).slice(0, 49000)];
    if (row > 0) sh.getRange(row, 1, 1, record.length).setValues([record]);
    else sh.appendRow(record);
    return json_({ ok: true });
  } finally {
    lock.releaseLock();
  }
}

// Панель тьютора читает все сдачи (нужен пароль).
function doGet(e) {
  const p = (e && e.parameter) || {};
  if (p.key !== PASSWORD) return json_({ ok: false, error: 'key' });
  const sh = sheet_();
  if (p.action === 'delete' && p.name && p.hw) {
    const values = sh.getDataRange().getValues();
    for (let i = values.length - 1; i >= 1; i--) {
      if (key_(values[i][1]) === key_(p.name) && String(values[i][3]) === String(p.hw)) sh.deleteRow(i + 1);
    }
    return json_({ ok: true });
  }
  const values = sh.getDataRange().getValues();
  const rows = values.slice(1).filter(r => r[1]).map(r => ({
    ts: new Date(r[0]).getTime(), name: r[1], lesson: r[2], hw: r[3], stars: r[4], max: r[5], data: r[6],
  }));
  return json_({ ok: true, rows: rows });
}
