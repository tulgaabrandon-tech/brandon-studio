/**
 * BrandOn Studio → Google Sheets
 * Paste this into Extensions > Apps Script of the Google Sheet you want to keep updated.
 * Every change in the Finance section rewrites these tabs:
 *   Гүйлгээ, Борлуулалт, Сар бүр, Төсөв, Цалин
 * Don't type in these tabs by hand: the next update replaces them. Add your own tabs for notes and formulas.
 */

// Change this to your own secret word, and put the same word in Supabase as SHEETS_TOKEN.
var TOKEN = 'change-me';

var IN = {sales:'Үйл ажиллагааны орлого', boost_in:'Бүүст орлого', other_in:'Бусад орлого', loan_in:'Түр зээл'};
var OUT = {salary:'Цалингийн зардал', production:'Үйл ажиллагааны зардал', rent:'Түрээсийн зардал', ndsh:'НДШ-ийн зардал', tax:'Татвар',
  loan:'Удирдлагын зардал-зээл төлөлт', mgmt:'Удирдлагын зардал', utilities:'Ашиглалтын зардал - ус дулаан, цахилгаан, СӨХ', software:'Вирус програм, вэбсайт',
  phone:'Харилцаа холбоо /утас, интернэт/', food:'Хоолны зардал', events:'Баяр, хүлээн авалтын зардал', travel:'Аяллын зардал', fuel:'Шатахууны зардал',
  taxi:'Такси. зогсоол', boost:'Бүүст зардал', fees:'Банкны шимтгэл', card:'Кредит карт төлөлт', office:'Оффис зардал', cleaning:'Цэвэрлэгээ ариутгалын зардал',
  training:'Сургалтын зардал', assets:'Үндсэн хөрөнгө', repair_assets:'Засварын зардал Үндсэн хөрөнгө', repair_office:'Засварын зардал Оффис', cat:'Муурны зардал',
  print:'Хэвлэл', donation:'Хандив тусламжийн зардал', staff_loan:'Ажилчдад зээлсэн'};
var MOVE = {cash:'Касс руу шилжүүлэг'};

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try {
    var body = JSON.parse(e.postData.contents);
    if (body.token !== TOKEN) return out('denied');
    var d = {fin_tx:[], fin_deals:[], fin_staff:[], fin_payroll:[], fin_plan:[]};
    (body.docs || []).forEach(function (r) { if (d[r.col]) { var o = r.data || {}; o.id = r.id; d[r.col].push(o); } });
    writeTransactions(d); writeSales(d); writeMonthly(d); writeBudget(d); writePayroll(d);
    SpreadsheetApp.getActive().getSheetByName('Гүйлгээ').getRange('A1').setNote('Сүүлд шинэчилсэн: ' + new Date().toLocaleString());
    return out('ok');
  } finally { lock.releaseLock(); }
}
function out(s) { return ContentService.createTextOutput(s); }
function sheet(name) { var ss = SpreadsheetApp.getActive(); return ss.getSheetByName(name) || ss.insertSheet(name); }
function put(name, rows, moneyCols) {
  var sh = sheet(name); sh.clear();
  if (!rows.length) return;
  var w = Math.max.apply(null, rows.map(function (r) { return r.length; }));
  rows = rows.map(function (r) { while (r.length < w) r.push(''); return r; });
  sh.getRange(1, 1, rows.length, w).setValues(rows);
  sh.getRange(1, 1, 1, w).setFontWeight('bold').setBackground('#141414').setFontColor('#ffffff');
  sh.setFrozenRows(1);
  (moneyCols || []).forEach(function (c) { if (rows.length > 1) sh.getRange(2, c, rows.length - 1, 1).setNumberFormat('#,##0'); });
  sh.autoResizeColumns(1, w);
}
function cat(k) { return IN[k] || OUT[k] || MOVE[k] || k; }
function paid(d, deal) { return d.fin_tx.filter(function (t) { return t.type === 'in' && t.deal === deal.id; }).reduce(function (s, t) { return s + (+t.amount || 0); }, 0); }

function writeTransactions(d) {
  var deals = {}; d.fin_deals.forEach(function (x) { deals[x.id] = x; });
  var rows = [['Огноо', 'Орлого', 'Зарлага', 'Гүйлгээний утга', 'Ангилал', 'Харилцагч', 'Регистр', 'Данс', 'НӨАТ / Баримт', 'Борлуулалт']];
  d.fin_tx.slice().sort(function (a, b) { return String(a.date).localeCompare(String(b.date)); }).forEach(function (t) {
    var status = t.type === 'in' ? ({todo:'НӨАТ шивэх', done:'НӨАТ шивсэн'}[t.vat] || '') : ({todo:'Баримт шивүүлэх', done:'Баримт шивүүлсэн'}[t.receipt] || '');
    rows.push([t.date, t.type === 'in' ? +t.amount : '', t.type !== 'in' ? +t.amount : '', t.note || '', cat(t.cat), t.client || '', t.reg || '', t.account === 'cash' ? 'Касс' : 'Банк', status, t.deal && deals[t.deal] ? deals[t.deal].client + (deals[t.deal].title ? ' · ' + deals[t.deal].title : '') : '']);
  });
  put('Гүйлгээ', rows, [2, 3]);
}
function writeSales(d) {
  var rows = [['Огноо', 'Харилцагч', 'Регистр', 'Юуны төлөө', 'Ажлын төрөл', 'Гэрээний дүн', 'Орсон', 'Авлага']];
  d.fin_deals.slice().sort(function (a, b) { return String(a.date).localeCompare(String(b.date)); }).forEach(function (x) {
    var p = paid(d, x); rows.push([x.date, x.client || '', x.reg || '', x.title || '', x.work || '', +x.amount || 0, p, Math.max(0, (+x.amount || 0) - p)]);
  });
  put('Борлуулалт', rows, [6, 7, 8]);
}
function writeMonthly(d) {
  var year = String(new Date().getFullYear());
  var plan = d.fin_plan.filter(function (p) { return p.id === year; })[0] || {sales:{}, budget:{}};
  var head = ['Утга']; for (var m = 1; m <= 12; m++) head.push(m + '-р сар'); head.push('Нийт');
  var rows = [head];
  function line(label, fn) { var r = [label], t = 0; for (var m = 1; m <= 12; m++) { var v = fn(year + '-' + ('0' + m).slice(-2), m); r.push(v); t += v; } r.push(t); rows.push(r); }
  line('Борлуулалтын төлөвлөгөө', function (k, m) { return +(plan.sales || {})[m] || 0; });
  line('Борлуулалт (гэрээ)', function (k) { return d.fin_deals.filter(function (x) { return String(x.date).slice(0, 7) === k; }).reduce(function (s, x) { return s + (+x.amount || 0); }, 0); });
  rows.push(['']); rows.push(['ОРЛОГО']);
  Object.keys(IN).forEach(function (c) { line(IN[c], function (k) { return sum(d, k, 'in', c); }); });
  rows.push(['']); rows.push(['ЗАРЛАГА']);
  Object.keys(OUT).forEach(function (c) { line(OUT[c], function (k) { return sum(d, k, 'out', c); }); });
  rows.push(['']);
  line('Нийт орлого', function (k) { return sum(d, k, 'in'); });
  line('Нийт зарлага', function (k) { return sum(d, k, 'out'); });
  line('Цэвэр урсгал', function (k) { return sum(d, k, 'in') - sum(d, k, 'out'); });
  put('Сар бүр', rows, [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14]);
}
function sum(d, monthKey, type, c) { return d.fin_tx.filter(function (t) { return String(t.date).slice(0, 7) === monthKey && t.type === type && (!c || t.cat === c); }).reduce(function (s, t) { return s + (+t.amount || 0); }, 0); }
function writeBudget(d) {
  var year = String(new Date().getFullYear());
  var plan = d.fin_plan.filter(function (p) { return p.id === year; })[0] || {budget:{}};
  var rows = [['Утга', 'Жилийн төсөв', 'Зарцуулсан', 'Боломжит үлдэгдэл', '%']];
  Object.keys(OUT).forEach(function (c) {
    var b = +(plan.budget || {})[c] || 0, used = d.fin_tx.filter(function (t) { return String(t.date).slice(0, 4) === year && t.type === 'out' && t.cat === c; }).reduce(function (s, t) { return s + (+t.amount || 0); }, 0);
    if (b || used) rows.push([OUT[c], b, used, b - used, b ? Math.round(used / b * 100) + '%' : '']);
  });
  put('Төсөв', rows, [2, 3, 4]);
}
function credit(g) { var steps = [[500000,20000],[1000000,18000],[1500000,16000],[2000000,14000],[2500000,12000],[3000000,10000],[3500000,8000],[4000000,6000],[4500000,4000],[5000000,2000]]; for (var i = 0; i < steps.length; i++) if (g <= steps[i][0]) return steps[i][1]; return 0; }
function writePayroll(d) {
  var staff = {}; d.fin_staff.forEach(function (s) { staff[s.id] = s; });
  var rows = [['Сар', 'Ажилтан', 'Албан тушаал', 'Хоног', 'Үндсэн цалин', 'Бонус', 'Нийт бодогдсон', 'НДШ-д тайлагнах', 'НДШ', 'ХХОАТ', 'Фонд', 'Авлага', 'Урьдчилгаа', 'Гарт олгох', 'Байгууллагын НДШ', 'Данс', 'Олгосон']];
  d.fin_payroll.slice().sort(function (a, b) { return String(a.id).localeCompare(String(b.id)); }).forEach(function (p) {
    (p.rows || []).forEach(function (r) {
      var s = staff[r.staff] || {}, rep = +r.reported || 0, gross = Math.round((+r.base || 0) * ((+r.days || 21) / 21) + (+r.bonus || 0));
      var ndsh = Math.round(rep * 0.115), hh = rep ? Math.max(0, Math.round((rep - ndsh) * 0.1) - credit(rep)) : 0;
      var net = gross - ndsh - hh - (+r.fund || 0) - (+r.owed || 0) - (+r.advance || 0);
      rows.push([p.id, s.name || '', s.position || '', +r.days || 21, +r.base || 0, +r.bonus || 0, gross, rep, ndsh, hh, +r.fund || 0, +r.owed || 0, +r.advance || 0, net, Math.round(rep * 0.125), s.account || '', p.paid ? 'Тийм' : '']);
    });
  });
  put('Цалин', rows, [5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]);
}
