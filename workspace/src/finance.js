// ================= Finance: Brand On's money, custom to how the studio already keeps its books =================
function F(mn,en){ return LANG==='mn'?mn:en; }
// Categories use the exact names from Brand On's sheets, so exports line up with the old files.
var FIN_IN=[
  {k:'sales', mn:'Үйл ажиллагааны орлого', en:'Client payments', c:'#1D7552'},
  {k:'boost_in', mn:'Бүүст орлого', en:'Boost income', c:'#2F5DA8'},
  {k:'other_in', mn:'Бусад орлого', en:'Other income', c:'#7A4FB0'},
  {k:'loan_in', mn:'Түр зээл', en:'Short-term loan', c:'#8A6D00', nopl:true}
];
var FIN_OUT=[
  {k:'salary', mn:'Цалингийн зардал', en:'Salaries', c:'#DA1F34'},
  {k:'production', mn:'Үйл ажиллагааны зардал', en:'Production costs', c:'#B5532A'},
  {k:'rent', mn:'Түрээсийн зардал', en:'Rent', c:'#2F5DA8'},
  {k:'ndsh', mn:'НДШ-ийн зардал', en:'Social insurance', c:'#7A4FB0'},
  {k:'tax', mn:'Татвар', en:'Tax', c:'#5B4636'},
  {k:'loan', mn:'Удирдлагын зардал-зээл төлөлт', en:'Loan repayment', c:'#8A6D00'},
  {k:'mgmt', mn:'Удирдлагын зардал', en:'Management costs', c:'#1F7A5A'},
  {k:'utilities', mn:'Ашиглалтын зардал - ус дулаан, цахилгаан, СӨХ', en:'Utilities', c:'#2B6E5B'},
  {k:'software', mn:'Вирус програм, вэбсайт', en:'Software and websites', c:'#3B67B3'},
  {k:'phone', mn:'Харилцаа холбоо /утас, интернэт/', en:'Phone and internet', c:'#6C6A66'},
  {k:'food', mn:'Хоолны зардал', en:'Food', c:'#C2410C'},
  {k:'events', mn:'Баяр, хүлээн авалтын зардал', en:'Parties and hosting', c:'#A62D7A'},
  {k:'travel', mn:'Аяллын зардал', en:'Travel', c:'#0F766E'},
  {k:'fuel', mn:'Шатахууны зардал', en:'Fuel', c:'#9A6200'},
  {k:'taxi', mn:'Такси. зогсоол', en:'Taxi and parking', c:'#8A8F99'},
  {k:'boost', mn:'Бүүст зардал', en:'Boosts', c:'#3B82F6'},
  {k:'fees', mn:'Банкны шимтгэл', en:'Bank fees', c:'#A8A49C'},
  {k:'card', mn:'Кредит карт төлөлт', en:'Credit card', c:'#6B21A8'},
  {k:'office', mn:'Оффис зардал', en:'Office supplies', c:'#475569'},
  {k:'cleaning', mn:'Цэвэрлэгээ ариутгалын зардал', en:'Cleaning', c:'#0EA5E9'},
  {k:'training', mn:'Сургалтын зардал', en:'Training', c:'#16A34A'},
  {k:'assets', mn:'Үндсэн хөрөнгө', en:'Equipment', c:'#1E293B'},
  {k:'repair_assets', mn:'Засварын зардал Үндсэн хөрөнгө', en:'Equipment repair', c:'#334155'},
  {k:'repair_office', mn:'Засварын зардал Оффис', en:'Office repair', c:'#64748B'},
  {k:'cat', mn:'Муурны зардал', en:'Office cat', c:'#D97706'},
  {k:'print', mn:'Хэвлэл', en:'Printing', c:'#57534E'},
  {k:'donation', mn:'Хандив тусламжийн зардал', en:'Donations', c:'#BE185D'},
  {k:'staff_loan', mn:'Ажилчдад зээлсэн', en:'Loans to staff', c:'#78716C', nopl:true},
  {k:'fund', mn:'Фонд татан авалт', en:'Staff fund payout', c:'#A16207', nopl:true}
];
var FIN_MOVE={k:'cash', mn:'Касс руу шилжүүлэг', en:'Move to cash', c:'#A8A49C'};
function fcat(k){ return FIN_IN.concat(FIN_OUT,[FIN_MOVE]).filter(function(c){ return c.k===k; })[0] || {k:k, mn:k, en:k, c:'#8A8F99'}; }
function fcatName(k){ var c=fcat(k); return LANG==='mn'?c.mn:c.en; }
var WORK_TYPES=['Лого','Брэндинг','Илтгэл','Кампанит ажил, видео','Рийл','Сошиал','Постер','Сторибоард','Бусад'];

// ---------- money formatting ----------
function money(n){ n=Math.round(+n||0); return (n<0?'-':'')+Math.abs(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g,',')+'₮'; }
function moneyShort(n){ n=+n||0; var a=Math.abs(n), s=n<0?'-':''; if(a>=1e9) return s+(a/1e9).toFixed(1).replace(/\.0$/,'')+F(' тэрбум','B'); if(a>=1e6) return s+(a/1e6).toFixed(1).replace(/\.0$/,'')+F(' сая','M'); if(a>=1e3) return s+Math.round(a/1e3)+F(' мянга','K'); return s+Math.round(a); }
function parseMoney(s){ return Math.round(+String(s||'').replace(/[^\d.-]/g,'')||0); }

// ---------- state & store ----------
var FIN={unlocked:false, tab:'overview', month:iso(TODAY).slice(0,7), filter:'all', q:'', ytd:false, data:{fin_tx:[], fin_deals:[], fin_staff:[], fin_payroll:[], fin_plan:[], fin_meta:[]}, preview:false, lastUse:0};
var FCOLS=['fin_tx','fin_deals','fin_staff','fin_payroll','fin_plan','fin_meta'];
var FDB=null, FSB=null;
function hasFinance(){ return !!me().finance; }
function fpersist(col,obj){ if(!FDB) return; var path=col+'/'+obj.id, data=body(obj); chains[path]=(chains[path]||Promise.resolve()).then(function(){ return FDB.doc(path).set(data); }).catch(function(){ toast(L('Could not save. Check your connection.')); }); }
function fadd(col,obj){ FIN.data[col].push(obj); fpersist(col,obj); return obj; }
function fdel(col,id){ FIN.data[col]=FIN.data[col].filter(function(x){ return x.id!==id; }); if(FDB){ var path=col+'/'+id; chains[path]=(chains[path]||Promise.resolve()).then(function(){ return FDB.doc(path).delete(); }).catch(function(){}); } }
var FUNSUB=[];
function fstart(){
  FUNSUB.forEach(function(u){ try{ u(); }catch(e){} }); FUNSUB=[];
  FCOLS.forEach(function(col){
    var u=FDB.collection(col).onSnapshot(function(snap){ FIN.data[col]=snap.docs.map(function(x){ var o=clone(x.data()); o.id=x.id; return o; }); softRender(); }, function(){ toast(F('Санхүүгийн мэдээлэл ачаалж чадсангүй.','Could not load finance data.')); });
    if(typeof u==='function') FUNSUB.push(u);
  });
}
// Unlock: on own hosting the code is the password of a separate finance login, so the database itself guards the money.
// On the Claude page the finance collections are readable only by Editors and the owner (database rules), and the code is a second lock on this device.
function finHash(code){ return sha('brandon-fin:'+code); }
function unlockFinance(code){
  if(S.hosted && CFG.financeEmail){
    FSB=FSB||window.supabase.createClient(CFG.supabaseUrl, CFG.supabaseAnonKey, {auth:{persistSession:false, storageKey:'bo-fin'}});
    return FSB.auth.signInWithPassword({email:CFG.financeEmail, password:code}).then(function(r){ if(r.error) throw r.error; FDB=supaDB(FSB,'finance'); FIN.unlocked=true; FIN.lastUse=Date.now(); fstart(); render(); });
  }
  if(S.hosted) return Promise.reject(new Error('Finance login is not set up yet. See SETUP.md, part 7.'));
  if(S.mode!=='live' || !DB) return Promise.reject(new Error('offline'));
  var ref=DB.doc('fin_meta/lock');
  return Promise.all([ref.get(), finHash(code)]).then(function(r){
    var snap=r[0], h=r[1];
    if(!snap.exists){ // first time: the code typed twice becomes the finance code
      if(FIN.firstCode==null){ FIN.firstCode=h; throw new Error('confirm'); }
      if(FIN.firstCode!==h){ FIN.firstCode=null; throw new Error('mismatch'); }
      FIN.firstCode=null; return ref.set({hash:h, by:S.me, at:new Date().toISOString()});
    }
    if(snap.data().hash!==h) throw new Error('wrong');
  }).then(function(){ FDB=DB; FIN.unlocked=true; FIN.lastUse=Date.now(); fstart(); render(); }, function(e){
    var m=String(e&&(e.code||e.message)||'');
    if(/confirm|mismatch|wrong/.test(m)) throw e;
    throw new Error('denied');
  });
}
function lockFinance(){ FIN.unlocked=false; FDB=null; FIN.firstCode=null; FUP.items=[]; FIN.data={fin_tx:[], fin_deals:[], fin_staff:[], fin_payroll:[], fin_plan:[], fin_meta:[]}; FUNSUB.forEach(function(u){ try{ u(); }catch(e){} }); FUNSUB=[]; if(FSB) FSB.auth.signOut().catch(function(){}); }
// Lock after 15 quiet minutes
setInterval(function(){ if(FIN.unlocked && Date.now()-FIN.lastUse>15*60000){ lockFinance(); if(S.view==='finance') render(); } }, 30000);
document.addEventListener('pointerdown', function(){ if(FIN.unlocked) FIN.lastUse=Date.now(); }, true);

// ---------- calculations ----------
function monthOf(dateStr){ return String(dateStr||'').slice(0,7); }
function txIn(m){ return FIN.data.fin_tx.filter(function(t){ return monthOf(t.date)===m; }); }
function txYear(y){ return FIN.data.fin_tx.filter(function(t){ return String(t.date).slice(0,4)===y; }); }
function sumBy(list, type, plOnly){ return list.filter(function(t){ return t.type===type && (!plOnly || !fcat(t.cat).nopl); }).reduce(function(s,t){ return s+(+t.amount||0); },0); }
function plan(){ var y=FIN.month.slice(0,4); return FIN.data.fin_plan.filter(function(p){ return p.id===y; })[0] || {id:y, sales:{}, budget:{}, opening:0}; }
function balanceAt(m){ // cash on hand at the end of month m
  // Starts from the latest bank statement balance (start of a month) at or before m, then adds the ledger
  var p=plan(), y=m.slice(0,4), cp=p.checkpoints||{}, from=y+'-01', bal=+p.opening||0;
  Object.keys(cp).sort().forEach(function(k){ if(k<=m && k>=from){ from=k; bal=+cp[k]; } });
  FIN.data.fin_tx.forEach(function(t){ var tm=monthOf(t.date); if(tm>=from && tm<=m){ if(t.type==='in') bal+=+t.amount; if(t.type==='out') bal-=+t.amount; } });
  return bal;
}
function dealPaid(d){ return (+d.received||0)+FIN.data.fin_tx.filter(function(t){ return t.type==='in' && t.deal===d.id; }).reduce(function(s,t){ return s+(+t.amount||0); },0); }
function salesBooked(m){ return FIN.data.fin_deals.filter(function(d){ return monthOf(d.date)===m; }).reduce(function(s,d){ return s+dealFinal(d); },0); }
function salesYear(y){ return FIN.data.fin_deals.filter(function(d){ return String(d.date).slice(0,4)===y; }).reduce(function(s,d){ return s+dealFinal(d); },0); }
// What each client still owes: everything booked minus everything received, per client, so a payment logged in a later month still counts
function receivables(){
  var by={};
  FIN.data.fin_deals.forEach(function(d){ var k=d.client||'?', o=by[k]=by[k]||{left:0, d:d}; o.left+=dealFinal(d)-dealPaid(d); if(String(d.date)>=String(o.d.date)) o.d=d; });
  return Object.keys(by).map(function(k){ return by[k]; }).filter(function(x){ return x.left>0.5; }).sort(function(a,b){ return b.left-a.left; });
}
// Mongolian payroll, as in the studio's salary sheets: employee НДШ 11.5%, ХХОАТ 10% after НДШ minus the bracket credit, company НДШ 12.5%
function hhoatCredit(g){ if(g<=500000) return 20000; if(g<=1000000) return 18000; if(g<=1500000) return 16000; if(g<=2000000) return 14000; if(g<=2500000) return 12000; if(g<=3000000) return 10000; if(g<=3500000) return 8000; if(g<=4000000) return 6000; if(g<=4500000) return 4000; if(g<=5000000) return 2000; return 0; }
function payCalc(r){
  var wd=+r.wd||21, gross=(+r.base||0)*((+r.days||wd)/wd)+(+r.bonus||0), rep=+r.reported||0;
  var ndsh=Math.round(rep*0.115), hh=rep?Math.max(0, Math.round((rep-ndsh)*0.1)-hhoatCredit(rep)):0, comp=Math.round(rep*0.125);
  var ded=ndsh+hh+(+r.fund||0)+(+r.owed||0)+(+r.advance||0);
  return {gross:Math.round(gross), ndsh:ndsh, hhoat:hh, company:comp, deductions:ded, net:Math.round(gross-ded)};
}
function payrollFor(m){ return FIN.data.fin_payroll.filter(function(p){ return p.id===m; })[0]; }
function staffSorted(){ return FIN.data.fin_staff.slice().sort(function(a,b){ return (a.left?1:0)-(b.left?1:0) || (a.order||0)-(b.order||0); }); }

// ---------- views ----------
function vFinance(){
  if(!hasFinance()) return '<div class="empty" style="margin-top:40px">'+esc(F('Санхүү зөвхөн эрхтэй хүмүүст харагдана.','Finance is only for people with access.'))+'</div>';
  if(!FIN.unlocked) return finGate();
  var y=FIN.month.slice(0,4), m=FIN.month, tabs=[['overview',F('Тойм','Overview')],['upload',F('Оруулах','Upload')],['tx',F('Гүйлгээ','Transactions')],['sales',F('Ажил, борлуулалт','Jobs and sales')],['clients',F('Харилцагч','Clients')],['reports',F('Тайлан','Reports')],['payroll',F('Цалин','Payroll')],['plan',F('Төлөвлөгөө','Plan')]];
  var dt=fromIso(m+'-01');
  var h='<header class="fin-head"><div><div class="eyebrow">'+esc(F('Санхүү','Finance'))+'</div><h1 class="display">'+esc(F('Мөнгө','Money'))+'</h1></div>'+
    '<div class="ph-tools"><div class="plan-nav"><button class="icon-btn" data-act="fmonth" data-d="-1" aria-label="'+esc(F('Өмнөх сар','Previous month'))+'">'+ICON.back+'</button><b class="fmonth">'+esc(LANG==='mn'?dt.getFullYear()+' оны '+(dt.getMonth()+1)+'-р сар':MON_EN[dt.getMonth()]+' '+dt.getFullYear())+'</b><button class="icon-btn" data-act="fmonth" data-d="1" aria-label="'+esc(F('Дараа сар','Next month'))+'" style="transform:scaleX(-1)">'+ICON.back+'</button></div><button class="btn ghost sm" data-act="flock">'+ICON.lock+esc(F('Түгжих','Lock'))+'</button></div></header>';
  h+='<nav class="seg fin-tabs" role="tablist">'+tabs.map(function(t){ return '<button role="tab" data-act="ftab" data-t="'+t[0]+'" aria-selected="'+(FIN.tab===t[0])+'">'+esc(t[1])+'</button>'; }).join('')+'</nav>';
  var V={overview:finOverview, upload:finUpload, tx:finTx, sales:finSales, clients:finClientView, reports:finReports, payroll:finPayroll, plan:finPlan};
  return h+(V[FIN.tab]||finOverview)();
}
function finGate(){
  return '<div class="fin-gate"><span class="fin-lock">'+ICON.lock+'</span><h1 class="h2">'+esc(F('Санхүү','Finance'))+'</h1><p class="lede" style="text-align:center;margin-top:8px">'+esc(F('Санхүүгийн кодоо оруулна уу. 15 минут хөдөлгөөнгүй бол автоматаар түгжигдэнэ.','Enter the finance code. It locks again after 15 quiet minutes.'))+'</p>'+
    '<form data-form="fincode" class="fin-gate-f"><label class="sr" for="fcode">'+esc(F('Санхүүгийн код','Finance code'))+'</label><input class="input" id="fcode" type="password" autocomplete="off" placeholder="'+esc(F('Санхүүгийн код','Finance code'))+'"><button class="btn primary xl" type="submit">'+esc(F('Нээх','Open'))+'</button></form><p class="err" id="fcerr" role="alert"></p>'+
    (FIN.firstCode!=null?'<p class="muted s13">'+esc(F('Анх удаа нээж байна. Шинэ кодоо дахин оруулж батална уу.','First time here. Type the new code again to confirm it.'))+'</p>':'')+
    (!S.hosted&&S.mode!=='live'?'<p class="muted s13">'+esc(F('Санхүү зөвхөн хуваалцсан Claude хуудас эсвэл өөрийн хостинг дээр нээгдэнэ.','Finance opens only on the shared Claude page or your own hosting.'))+'</p>':'')+'</div>';
}
function statTile(label, val, sub, cls){ return '<div class="stat'+(cls?' '+cls:'')+'"><span>'+esc(label)+'</span><b>'+esc(val)+'</b>'+(sub?'<em>'+esc(sub)+'</em>':'')+'</div>'; }
function finOverview(){
  var m=FIN.month, y=m.slice(0,4), list=txIn(m), inn=sumBy(list,'in'), out=sumBy(list,'out'), p=plan();
  var target=+(p.sales||{})[+m.slice(5)]||0, booked=salesBooked(m), yt=salesYear(y), yTarget=Object.keys(p.sales||{}).reduce(function(s,k){ return s+(+p.sales[k]||0); },0);
  var h='<div class="fin-stats">'+statTile(F('Орж ирсэн','Money in'), moneyShort(inn), money(inn))+statTile(F('Гарсан','Money out'), moneyShort(out), money(out))+statTile(F('Цэвэр урсгал','Net flow'), moneyShort(inn-out), money(inn-out), inn-out<0?'neg':'')+statTile(F('Үлдэгдэл','Cash on hand'), moneyShort(balanceAt(m)), F('сарын эцэст','at month end'), 'ink')+'</div>';
  h+='<div class="fin-grid"><section class="card fin-card"><div class="fin-card-h"><h3>'+esc(F('Борлуулалт ба төлөвлөгөө','Sales vs plan'))+'</h3><button class="lnk" data-act="ftab" data-t="sales">'+esc(F('Бүгд','All'))+'</button></div>'+
    '<div class="big-num">'+esc(moneyShort(booked))+'<span> / '+esc(moneyShort(target))+'</span></div>'+wavy(target?booked/target:0, target?Math.round(booked/target*100)+'%':F('Төлөвлөгөө алга','No target'))+
    '<p class="muted s13" style="margin:14px 0 0">'+esc(F('Оны эхнээс: ','Year to date: '))+'<b>'+esc(moneyShort(yt))+'</b> / '+esc(moneyShort(yTarget))+(yTarget?' ('+Math.round(yt/yTarget*100)+'%)':'')+'</p></section>';
  var rec=receivables(), recSum=rec.reduce(function(s,x){ return s+x.left; },0);
  h+='<section class="card fin-card"><div class="fin-card-h"><h3>'+esc(F('Авлага','Owed to us'))+'</h3><b>'+esc(money(recSum))+'</b></div>'+(rec.length?'<div class="mini-rows">'+rec.slice(0,5).map(function(x){ return '<button class="mini" data-act="fdeal" data-id="'+esc(x.d.id)+'"><span><b>'+esc(x.d.client)+'</b><em>'+esc(x.d.title||md(fromIso(x.d.date)))+'</em></span><span class="amt">'+esc(money(x.left))+'</span></button>'; }).join('')+'</div>':'<p class="muted">'+esc(F('Бүх төлбөр орж ирсэн.','Everything is paid.'))+'</p>')+'</section></div>';
  // budget burn
  var outs={}; list.filter(function(t){ return t.type==='out'; }).forEach(function(t){ outs[t.cat]=(outs[t.cat]||0)+(+t.amount||0); });
  var rows=Object.keys(outs).sort(function(a,b){ return outs[b]-outs[a]; }).slice(0,7);
  h+='<div class="fin-grid"><section class="card fin-card"><div class="fin-card-h"><h3>'+esc(F('Энэ сарын зарлага','Spending this month'))+'</h3><button class="lnk" data-act="ftab" data-t="reports">'+esc(F('Тайлан','Report'))+'</button></div>'+(rows.length?rows.map(function(k){ var b=(+(p.budget||{})[k]||0)/12, pct=b?outs[k]/b:0; return '<div class="bar-row"><div class="bar-l"><span class="pdot" style="background:'+fcat(k).c+'"></span>'+esc(fcatName(k))+'</div><div class="bar-v"><b>'+esc(moneyShort(outs[k]))+'</b>'+(b?'<span class="muted">/ '+esc(moneyShort(b))+'</span>':'')+'</div><div class="bar-t"><i style="width:'+Math.min(100,(b?pct:1)*100)+'%;background:'+(pct>1?'var(--red)':fcat(k).c)+'"></i></div></div>'; }).join(''):'<p class="muted">'+esc(F('Энэ сард зарлага алга.','No spending yet this month.'))+'</p>')+'</section>';
  var vat=FIN.data.fin_tx.filter(function(t){ return t.vat==='todo'; }), rcp=FIN.data.fin_tx.filter(function(t){ return t.receipt==='todo'; });
  var meta=FIN.data.fin_meta.filter(function(x){ return x.id==='sync'; })[0];
  h+='<section class="card fin-card"><div class="fin-card-h"><h3>'+esc(F('Хийх зүйлс','To do'))+'</h3></div><div class="mini-rows">'+
    '<button class="mini" data-act="ffilter" data-f="vat"><span><b>'+esc(F('НӨАТ шивэх','VAT receipts to file'))+'</b><em>'+esc(F('И-баримтад шивээгүй борлуулалт','Sales not yet in e-barimt'))+'</em></span><span class="chip '+(vat.length?'red':'ok')+'">'+vat.length+'</span></button>'+
    '<button class="mini" data-act="ffilter" data-f="receipt"><span><b>'+esc(F('Нийлүүлэгчийн НӨАТ ирээгүй','Supplier VAT missing'))+'</b><em>'+esc(F('Худалдан авалтад НӨАТ баримт хүлээж буй','Purchases waiting for a VAT receipt'))+'</em></span><span class="chip '+(rcp.length?'warn':'ok')+'">'+rcp.length+'</span></button>'+
    '<div class="mini static"><span><b>Google Sheets</b><em>'+esc(meta&&meta.at?F('Сүүлд илгээсэн: ','Last sent: ')+new Date(meta.at).toLocaleString():(S.hosted?F('Тохируулаагүй эсвэл хүлээгдэж байна','Not set up yet or waiting'):F('Өөрийн хостинг дээр ажиллана','Works on your own hosting')))+'</em></span>'+(meta&&meta.ok?'<span class="chip ok">'+ICON.check+'</span>':'<span class="chip">'+ICON.sheet+'</span>')+'</div>'+
  '</div></section></div>';
  return h;
}
function finTx(){
  var m=FIN.month, f=FIN.filter, q=(FIN.q||'').toLowerCase();
  var list=(f==='vat'||f==='receipt')?FIN.data.fin_tx.filter(function(t){ return t[f]==='todo'; }):txIn(m).filter(function(t){ return f==='all'||t.type===f; });
  if(q) list=list.filter(function(t){ return (t.note+' '+(t.client||'')+' '+fcatName(t.cat)).toLowerCase().indexOf(q)>=0; });
  list.sort(function(a,b){ return String(b.date).localeCompare(String(a.date)) || String(b.created||'').localeCompare(String(a.created||'')); });
  var h='<div class="fin-bar"><div class="seg" role="group">'+[['all',F('Бүгд','All')],['in',F('Орлого','In')],['out',F('Зарлага','Out')],['vat',F('НӨАТ шивэх','VAT to file')],['receipt',F('Баримт','Receipts')]].map(function(o){ return '<button data-act="ffilter" data-f="'+o[0]+'" aria-pressed="'+(f===o[0])+'">'+esc(o[1])+'</button>'; }).join('')+'</div><label class="sr" for="fq">'+esc(F('Хайх','Search'))+'</label><input class="input sm" id="fq" placeholder="'+esc(F('Хайх: утга, харилцагч, ангилал','Search: note, client, category'))+'" value="'+esc(FIN.q||'')+'" style="max-width:300px"><button class="btn primary" data-act="ftxnew">'+ICON.plus+esc(F('Гүйлгээ нэмэх','Add transaction'))+'</button></div>';
  if(!list.length) return h+'<div class="empty" style="margin-top:20px">'+esc(F('Гүйлгээ алга.','No transactions.'))+'</div>';
  var day='', rows='';
  list.forEach(function(t){
    if(t.date!==day){ day=t.date; var dd=fromIso(t.date); rows+='<div class="day-sep">'+esc(dowLong(dd)+' · '+md(dd))+'</div>'; }
    var c=fcat(t.cat);
    rows+='<button class="txr" data-act="ftxedit" data-id="'+esc(t.id)+'"><span class="tx-ic" style="background:'+c.c+'">'+(t.type==='in'?ICON.down:t.type==='move'?ICON.swap:ICON.up)+'</span><span class="rw-m"><b>'+esc(t.note||fcatName(t.cat))+'</b><span class="muted">'+esc(fcatName(t.cat))+(t.client?' · '+esc(t.client):'')+(t.account==='cash'?' · '+esc(F('Касс','Cash')):'')+'</span></span>'+(t.vat==='todo'?'<span class="chip red">'+esc(F('НӨАТ','VAT'))+'</span>':'')+(t.receipt==='todo'?'<span class="chip warn">'+esc(F('Баримт','Receipt'))+'</span>':'')+'<span class="tx-amt '+t.type+'">'+(t.type==='in'?'+':t.type==='out'?'-':'')+esc(money(t.amount))+'</span></button>';
  });
  var inn=sumBy(list,'in'), out=sumBy(list,'out');
  return h+'<div class="rows tx-list">'+rows+'</div><div class="tx-tot"><span>'+esc(F('Орлого','In'))+' <b class="pos">'+esc(money(inn))+'</b></span><span>'+esc(F('Зарлага','Out'))+' <b>'+esc(money(out))+'</b></span></div>';
}
function finSales(){
  var deals=FIN.data.fin_deals.slice().sort(function(a,b){ return String(b.date).localeCompare(String(a.date)); });
  var h='<div class="fin-bar"><p class="muted" style="margin:0;flex:1">'+esc(F('Гэрээ, нэхэмжлэл бүрийг энд бүртгэнэ. Төлбөр орж ирэхэд авлага өөрөө буурна.','Log every contract or invoice here. When payments come in, what is owed goes down by itself.'))+'</p><button class="btn primary" data-act="fdealnew">'+ICON.plus+esc(F('Борлуулалт нэмэх','Add sale'))+'</button></div>';
  if(!deals.length) return h+'<div class="empty" style="margin-top:20px">'+esc(F('Борлуулалт алга.','No sales yet.'))+'</div>';
  return h+'<div class="rows">'+deals.map(function(d){ var paid=dealPaid(d), left=(+d.amount||0)-paid, st=left<=0.5?'ok':paid>0?'warn':'red', lbl=left<=0.5?F('Төлөгдсөн','Paid'):paid>0?F('Хэсэгчлэн','Part paid'):F('Хүлээгдэж буй','Waiting');
    return '<button class="rw rw-btn" data-act="fdeal" data-id="'+esc(d.id)+'"><span class="rw-m"><b>'+esc(d.client)+(d.title?' · '+esc(d.title):'')+'</b><span class="muted">'+esc(md(fromIso(d.date)))+(d.work?' · '+esc(d.work):'')+' · '+esc(F('Орсон ','Paid '))+esc(money(paid))+' / '+esc(money(d.amount))+'</span></span><span class="tx-amt">'+esc(money(left>0?left:0))+'</span><span class="chip '+st+'">'+esc(lbl)+'</span></button>'; }).join('')+'</div>';
}
function finReports(){
  var R=perRange(), list=FIN.data.fin_tx.filter(function(t){ return inPer(t.date); }), p=plan(), months=R[2];
  function sums(type){ var o={}; list.filter(function(t){ return t.type===type; }).forEach(function(t){ o[t.cat]=(o[t.cat]||0)+(+t.amount||0); }); return o; }
  var si=sums('in'), so=sums('out'), inPL=0, outPL=0;
  var h='<div class="fin-bar">'+perSeg()+'<b class="per-l">'+esc(perLabel())+'</b></div>';
  h+='<div class="card report"><h3>'+esc(F('Ашиг алдагдлын тайлан','Profit and loss'))+'</h3><table class="rep"><thead><tr><th>'+esc(F('Утга','Item'))+'</th><th class="nr">'+esc(F('Төсөв','Budget'))+'</th><th class="nr">'+esc(F('Гүйцэтгэл','Actual'))+'</th><th class="bar-col"></th></tr></thead><tbody>';
  h+='<tr class="grp"><td colspan="4">'+esc(F('Орлого','Income'))+'</td></tr>';
  FIN_IN.forEach(function(c){ if(c.nopl) return; var v=si[c.k]||0; inPL+=v; h+='<tr><td>'+esc(fcatName(c.k))+'</td><td class="nr muted">'+(c.k==='sales'?esc(money(salesTarget(months))):'')+'</td><td class="nr">'+esc(money(v))+'</td><td></td></tr>'; });
  h+='<tr class="tot"><td>'+esc(F('Нийт орлого','Total income'))+'</td><td></td><td class="nr">'+esc(money(inPL))+'</td><td></td></tr><tr class="grp"><td colspan="4">'+esc(F('Зарлага','Expenses'))+'</td></tr>';
  FIN_OUT.forEach(function(c){ if(c.nopl) return; var v=so[c.k]||0, b=(+(p.budget||{})[c.k]||0)/12*months; if(!v&&!b) return; outPL+=v; var pct=b?v/b:0; h+='<tr><td><span class="pdot" style="background:'+c.c+';display:inline-block;margin-right:8px"></span>'+esc(fcatName(c.k))+'</td><td class="nr muted">'+(b?esc(money(b)):'')+'</td><td class="nr'+(b&&v>b?' red':'')+'">'+esc(money(v))+'</td><td class="bar-col">'+(b?'<div class="bar-t"><i style="width:'+Math.min(100,pct*100)+'%;background:'+(pct>1?'var(--red)':c.c)+'"></i></div>':'')+'</td></tr>'; });
  h+='<tr class="tot"><td>'+esc(F('Нийт зарлага','Total expenses'))+'</td><td></td><td class="nr">'+esc(money(outPL))+'</td><td></td></tr><tr class="net"><td>'+esc(F('Цэвэр ашиг / алдагдал','Net profit / loss'))+'</td><td></td><td class="nr'+(inPL-outPL<0?' red':'')+'">'+esc(money(inPL-outPL))+'</td><td></td></tr></tbody></table></div>';
  var loanIn=si.loan_in||0, staffLoan=so.staff_loan||0, moves=list.filter(function(t){ return t.type==='move'; }).reduce(function(s,t){ return s+(+t.amount||0); },0);
  h+='<div class="card report"><h3>'+esc(F('Мөнгөн гүйлгээ','Cash flow'))+'</h3><table class="rep"><tbody>'+
    '<tr><td>'+esc(F('Эхний үлдэгдэл','Opening balance'))+'</td><td class="nr">'+esc(money((p.checkpoints||{})[R[0]]!=null?+p.checkpoints[R[0]]:R[0].slice(5)==='01'?(+p.opening||0):balanceAt(prevMonth(R[0]))))+'</td></tr>'+
    '<tr><td>'+esc(F('Нийт орсон (зээл орсон)','All money in (incl. loans)'))+'</td><td class="nr">'+esc(money(inPL+loanIn))+'</td></tr>'+
    '<tr><td>'+esc(F('Нийт гарсан (ажилчдад зээлсэн орсон)','All money out (incl. staff loans)'))+'</td><td class="nr">'+esc(money(outPL+staffLoan))+'</td></tr>'+
    '<tr><td class="muted">'+esc(F('Касс руу шилжүүлсэн (зардал биш)','Moved to cash (not spending)'))+'</td><td class="nr muted">'+esc(money(moves))+'</td></tr>'+
    '<tr class="net"><td>'+esc(F('Эцсийн үлдэгдэл','Closing balance'))+'</td><td class="nr">'+esc(money(balanceAt(R[1])))+'</td></tr></tbody></table></div>';
  return h;
}
function prevMonth(m){ var d0=fromIso(m+'-01'); d0.setMonth(d0.getMonth()-1); return iso(d0).slice(0,7); }
function salesTarget(months){ var p=plan(), s=0, mm=+perRange()[1].slice(5); for(var i=mm-months+1;i<=mm;i++) s+=+(p.sales||{})[i]||0; return s; }
function finPayroll(){
  var m=FIN.month, pr=payrollFor(m), staff=staffSorted();
  var h='<div class="fin-bar"><p class="muted" style="margin:0;flex:1">'+esc(F('НДШ 11.5%, ХХОАТ 10% (хөнгөлөлттэй), байгууллагын НДШ 12.5% автоматаар бодогдоно.','Social insurance 11.5%, income tax 10% after the credit, and the company 12.5% are calculated for you.'))+'</p><button class="btn" data-act="fstaff">'+ICON.users+esc(F('Ажилтнууд','Staff'))+'</button>'+(pr?'':'<button class="btn primary" data-act="fpaymake">'+ICON.plus+esc(F('Энэ сарын цалин бодох','Start this month'))+'</button>')+'</div>';
  if(!staff.length) return h+'<div class="empty" style="margin-top:20px">'+esc(F('Эхлээд ажилтнуудаа нэмнэ үү.','Add your staff first.'))+'</div>';
  if(!pr) return h+'<div class="empty" style="margin-top:20px">'+esc(F('Энэ сарын цалин хараахан бодогдоогүй. Өмнөх сарын тоогоор эхлүүлнэ.','This month is not started yet. It starts from last month\'s numbers.'))+'</div>';
  var T={gross:0,ndsh:0,hhoat:0,company:0,deductions:0,net:0};
  var rows=pr.rows.map(function(r,i){ var s=FIN.data.fin_staff.filter(function(x){return x.id===r.staff;})[0]||{name:'?'}, c=payCalc(r); Object.keys(T).forEach(function(k){ T[k]+=c[k]; });
    function cell(f){ return '<td class="nr"><input class="cell" data-pay="'+i+'" data-f="'+f+'" value="'+esc(r[f]?String(Math.round(r[f])).replace(/\B(?=(\d{3})+(?!\d))/g,','):'')+'" inputmode="numeric"'+(pr.paid?' disabled':'')+'></td>'; }
    return '<tr><td><b>'+esc(s.name)+'</b><div class="muted s13">'+esc(s.position||'')+'</div></td>'+cell('base')+'<td class="nr"><input class="cell sm" data-pay="'+i+'" data-f="days" value="'+esc(r.days||21)+'" inputmode="numeric"'+(pr.paid?' disabled':'')+'></td>'+cell('bonus')+cell('reported')+'<td class="nr muted">'+esc(money(c.ndsh))+'</td><td class="nr muted">'+esc(money(c.hhoat))+'</td>'+cell('fund')+cell('owed')+cell('advance')+'<td class="nr"><b>'+esc(money(c.net))+'</b></td></tr>'; }).join('');
  h+='<div class="card report pay"><div class="pay-scroll"><table class="rep paytab"><thead><tr><th>'+esc(F('Ажилтан','Person'))+'</th><th class="nr">'+esc(F('Үндсэн цалин','Base'))+'</th><th class="nr">'+esc(F('Хоног','Days'))+'</th><th class="nr">'+esc(F('Бонус','Bonus'))+'</th><th class="nr">'+esc(F('НДШ-д тайлагнах','Reported'))+'</th><th class="nr">'+esc(F('НДШ','Soc. ins.'))+'</th><th class="nr">'+esc(F('ХХОАТ','Income tax'))+'</th><th class="nr">'+esc(F('Фонд','Fund'))+'</th><th class="nr">'+esc(F('Авлага','Owed'))+'</th><th class="nr">'+esc(F('Урьдчилгаа','Advance'))+'</th><th class="nr">'+esc(F('Гарт олгох','Take home'))+'</th></tr></thead><tbody>'+rows+
    '<tr class="tot"><td>'+esc(F('Нийт','Total'))+'</td><td class="nr">'+esc(money(T.gross))+'</td><td></td><td></td><td></td><td class="nr">'+esc(money(T.ndsh))+'</td><td class="nr">'+esc(money(T.hhoat))+'</td><td></td><td></td><td></td><td class="nr"><b>'+esc(money(T.net))+'</b></td></tr></tbody></table></div>'+
    '<div class="pay-f"><span>'+esc(F('Байгууллагаас төлөх НДШ','Company social insurance'))+': <b>'+esc(money(T.company))+'</b></span><span>'+esc(F('Нийт НДШ','Total social insurance'))+': <b>'+esc(money(T.company+T.ndsh))+'</b></span>'+(pr.paid?'<span class="chip ok">'+ICON.check+esc(F('Олгосон','Paid out'))+'</span><button class="btn ghost sm" data-act="fpayundo">'+esc(F('Засах','Edit'))+'</button>':'<button class="btn primary" data-act="fpaydone">'+ICON.check+esc(F('Цалин олгосон гэж бүртгэх','Mark as paid'))+'</button>')+'</div></div>';
  h+=bonusCard();
  return h;
}
function bonusCard(){
  var mm=+FIN.month.slice(5), q=Math.ceil(mm/3), y=FIN.month.slice(0,4), p=plan(), sales=0, ach=[], team=FIN.data.fin_staff.filter(function(s){ return s.bonus; });
  for(var i=q*3-2;i<=q*3;i++){ var key=y+'-'+String(i).padStart(2,'0'), s=salesBooked(key), t=+(p.sales||{})[i]||0; sales+=s; if(t) ach.push(Math.min(s/t,1.5)); }
  var avg=ach.length?ach.reduce(function(a,b){return a+b;},0)/ach.length:0, pool=sales*0.05*avg, each=team.length?pool/team.length:0;
  return '<div class="card fin-card" style="margin-top:20px"><div class="fin-card-h"><h3>'+esc(F(q+'-р улирлын бонус','Quarter '+q+' bonus'))+'</h3><span class="muted s13">'+esc(F('Улирлын борлуулалтын 5% × дундаж гүйцэтгэл','5% of quarter sales × average achievement'))+'</span></div><div class="bonus"><div><span>'+esc(F('Улирлын борлуулалт','Quarter sales'))+'</span><b>'+esc(money(sales))+'</b></div><div><span>'+esc(F('Дундаж гүйцэтгэл','Average achievement'))+'</span><b>'+Math.round(avg*100)+'%</b></div><div><span>'+esc(F('Олгох бонус','Bonus pool'))+'</span><b>'+esc(money(pool))+'</b></div><div><span>'+esc(F('Хүн тус бүр','Each person'))+' ('+team.length+')</span><b>'+esc(money(each))+'</b></div></div><p class="muted s13" style="margin:8px 0 0">'+esc(F('Бонус авах багийг Ажилтнууд хэсэгт тэмдэглэнэ.','Choose who is in the bonus team under Staff.'))+'</p></div>';
}
function finPlan(){
  var p=plan(), y=p.id, tot=0;
  var h='<div class="card fin-card"><div class="fin-card-h"><h3>'+esc(F(y+' оны борлуулалтын төлөвлөгөө','Sales plan '+y))+'</h3></div><div class="plan-grid">';
  for(var i=1;i<=12;i++){ var v=+(p.sales||{})[i]||0; tot+=v; h+='<label class="plan-cell"><span>'+esc(LANG==='mn'?i+'-р сар':MON_EN[i-1])+'</span><input class="input sm" data-plan="sales" data-k="'+i+'" value="'+esc(v?String(v).replace(/\B(?=(\d{3})+(?!\d))/g,','):'')+'" inputmode="numeric"></label>'; }
  h+='</div><p class="muted" style="margin:12px 0 0">'+esc(F('Нийт: ','Total: '))+'<b>'+esc(money(tot))+'</b></p></div>';
  h+='<div class="card fin-card" style="margin-top:20px"><div class="fin-card-h"><h3>'+esc(F('Жилийн зардлын төсөв','Yearly spending budget'))+'</h3><label class="plan-cell inline"><span>'+esc(F('Оны эхний үлдэгдэл','Opening balance'))+'</span><input class="input sm" data-plan="opening" value="'+esc(p.opening?String(p.opening).replace(/\B(?=(\d{3})+(?!\d))/g,','):'')+'" inputmode="numeric"></label></div><div class="plan-grid wide">';
  var bt=0; FIN_OUT.forEach(function(c){ if(c.nopl) return; var v=+(p.budget||{})[c.k]||0; bt+=v; h+='<label class="plan-cell"><span><i class="pdot" style="background:'+c.c+';display:inline-block;margin-right:6px"></i>'+esc(fcatName(c.k))+'</span><input class="input sm" data-plan="budget" data-k="'+c.k+'" value="'+esc(v?String(v).replace(/\B(?=(\d{3})+(?!\d))/g,','):'')+'" inputmode="numeric"></label>'; });
  return h+'</div><p class="muted" style="margin:12px 0 0">'+esc(F('Нийт төсөв: ','Total budget: '))+'<b>'+esc(money(bt))+'</b></p></div>';
}

// ---------- modals ----------
function finModal(md){
  if(md.kind==='ftx'){
    var type=md.type||'out', cats=type==='in'?FIN_IN:type==='out'?FIN_OUT:[FIN_MOVE], cat=md.cat||cats[0].k;
    var used={}; FIN.data.fin_tx.filter(function(t){return t.type===type;}).forEach(function(t){ used[t.cat]=(used[t.cat]||0)+1; });
    var top=cats.slice().sort(function(a,b){ return (used[b.k]||0)-(used[a.k]||0); }), show=md.allcats?top:top.slice(0,8); if(show.indexOf(fcat(cat))<0) show.push(fcat(cat));
    var open=FIN.data.fin_deals.filter(function(d){ return type==='out' ? (d.status!=='cancelled' || d.id===md.deal) : (dealFinal(d)-dealPaid(d)>0.5 || d.id===md.deal); }).sort(function(a,b){ return String(b.date).localeCompare(String(a.date)); }).slice(0,60);
    if(!md.id && !md.deal && md.dealAuto!==false && (md.note||md.client)){ var sg=suggestDeal((md.note||'')+' '+(md.client||''), md.date); if(sg && open.some(function(d){ return d.id===sg; })) md.deal=sg; }
    return '<h2>'+esc(md.id?F('Гүйлгээ засах','Edit transaction'):F('Гүйлгээ нэмэх','Add transaction'))+'</h2>'+
      '<div class="seg big" role="group">'+[['in',F('Орлого','Money in')],['out',F('Зарлага','Money out')],['move',F('Касс руу','To cash')]].map(function(o){ return '<button data-act="ftype" data-v="'+o[0]+'" aria-pressed="'+(type===o[0])+'">'+esc(o[1])+'</button>'; }).join('')+'</div>'+
      '<div class="amt-in"><label class="sr" for="fa">'+esc(F('Дүн','Amount'))+'</label><input id="fa" class="'+type+'" inputmode="numeric" placeholder="0" value="'+esc(md.amount?String(md.amount).replace(/\B(?=(\d{3})+(?!\d))/g,','):'')+'"><span>₮</span></div>'+
      field(F('Ангилал','Category'), '<div class="chips">'+show.map(function(c){ return '<button class="pick" data-act="fcat" data-k="'+c.k+'" aria-pressed="'+(cat===c.k)+'"><i class="kdot" style="background:'+c.c+'"></i>'+esc(fcatName(c.k))+'</button>'; }).join('')+(!md.allcats&&top.length>8?'<button class="pick" data-act="fallcats">'+esc(F('Бусад...','More...'))+'</button>':'')+'</div>')+
      field(F('Гүйлгээний утга','Description'), '<input class="input" id="fn" placeholder="'+esc(type==='in'?F('жишээ нь: Paradox 50% урьдчилгаа','e.g. Paradox 50% advance'):F('жишээ нь: Камер түрээс','e.g. Camera rental'))+'" value="'+esc(md.note||'')+'">')+
      '<div class="two">'+field(F('Огноо','Date'), '<input class="input" id="fd" type="date" value="'+esc(md.date||iso(TODAY))+'">')+field(F('Данс','Account'), '<div class="seg"><button data-act="facct" data-v="bank" aria-pressed="'+((md.account||'bank')==='bank')+'">'+esc(F('Банк','Bank'))+'</button><button data-act="facct" data-v="cash" aria-pressed="'+(md.account==='cash')+'">'+esc(F('Касс','Cash'))+'</button></div>')+'</div>'+
      (type==='move'?'':'<div class="two">'+field(F('Харилцагч','Client or vendor'), '<input class="input" id="fcl" list="fclients" value="'+esc(md.client||'')+'" placeholder="'+esc(F('Компани эсвэл хүн','Company or person'))+'"><datalist id="fclients">'+finClients().map(function(c){ return '<option value="'+esc(c)+'">'; }).join('')+'</datalist>', true)+field(F('Регистр','Registration no.'), '<input class="input" id="frg" value="'+esc(md.reg||'')+'">', true)+'</div>')+
      (type!=='move'?field(type==='in'?F('Аль ажлын төлбөр вэ?','Which job is this payment for?'):F('Аль ажлын зардал вэ?','Which job is this cost for?'), '<select class="input" id="fdl"><option value="">'+esc(type==='in'?F('Холбохгүй','Not linked'):F('Ерөнхий зардал (ажилд хамаарахгүй)','General cost, not for one job'))+'</option>'+open.map(function(d){ return '<option value="'+esc(d.id)+'"'+(d.id===md.deal?' selected':'')+'>'+esc(d.client+' · '+dshort(d.date)+(d.title?' · '+d.title:'')+(type==='in'?' · '+F('үлдэгдэл ','left ')+money(dealFinal(d)-dealPaid(d)):''))+'</option>'; }).join('')+'</select>', true):'')+
      (type==='move'?'':field(type==='in'?F('Харилцагчид НӨАТ шивж өгсөн үү','VAT receipt filed for the client'):F('Нийлүүлэгч бидэнд НӨАТ шивсэн үү','Did the supplier file VAT for us'), '<div class="seg">'+[['none',F('Шаардлагагүй','Not needed')],['todo',type==='in'?F('Шивэх','To file'):F('Ирээгүй','Not yet')],['done',type==='in'?F('Шивсэн','Filed'):F('Ирсэн','Received')]].map(function(o){ var cur=type==='in'?(md.vat||'none'):(md.receipt||'none'); return '<button data-act="fvat" data-v="'+o[0]+'" aria-pressed="'+(cur===o[0])+'">'+esc(o[1])+'</button>'; }).join('')+'</div>'))+
      '<p class="err" id="ferr" role="alert"></p><div class="m-a">'+(md.id?'<button class="btn ghost" data-act="ftxdel" style="margin-right:auto">'+esc(L('Delete'))+'</button>':'')+'<button class="btn ghost" data-act="close">'+esc(L('Cancel'))+'</button><button class="btn primary xl" data-act="ftxsave">'+esc(L('Save'))+'</button></div>';
  }
  if(md.kind==='flink') return linkModal();
  if(md.kind==='fdeal'){
    var d0=md.id?FIN.data.fin_deals.filter(function(x){return x.id===md.id;})[0]:null, st=md.status||'active', paid=d0?dealPaid(Object.assign({},d0,{received:md.received})):0;
    var finalAmt=(st==='changed'||st==='cancelled')?(+md.final||0):(+md.amount||0), costs=d0?dealCostList(d0):[], cost=costs.reduce(function(s,t){ return s+(+t.amount||0); },0);
    var free=d0?FIN.data.fin_tx.filter(function(t){ return t.type==='out' && !t.deal && !OVERHEAD[t.cat]; }).sort(function(a,b){ return String(b.date).localeCompare(String(a.date)); }).slice(0,80):[];
    var amt=function(v){ return v?String(Math.round(v)).replace(/\B(?=(\d{3})+(?!\d))/g,','):''; };
    return '<h2>'+esc(md.id?F('Ажил','Job'):F('Ажил нэмэх','Add a job'))+'</h2>'+
      (md.id?'<div class="deal-sum five"><div><span>'+esc(F('Гэрээ','Contract'))+'</span><b>'+esc(money(md.amount))+'</b></div><div><span>'+esc(F('Эцсийн','Final'))+'</span><b class="'+(finalAmt<(+md.amount||0)?'red':'')+'">'+esc(money(finalAmt))+'</b></div><div><span>'+esc(F('Орсон','Received'))+'</span><b class="pos">'+esc(money(paid))+'</b></div><div><span>'+esc(F('Зардал','Costs'))+'</span><b>'+esc(money(cost))+'</b></div><div><span>'+esc(F('Ашиг','Profit'))+'</span><b class="'+(paid-cost<0?'red':'')+'">'+esc(money(paid-cost))+'</b></div></div>':'')+
      '<div class="two">'+field(F('Харилцагч','Client'), '<input class="input" id="dc" list="fclients2" value="'+esc(md.client||'')+'"><datalist id="fclients2">'+finClients().map(function(c){ return '<option value="'+esc(c)+'">'; }).join('')+'</datalist>')+field(F('Регистр','Registration no.'), '<input class="input" id="dr" value="'+esc(md.reg||'')+'">', true)+'</div>'+
      field(F('Юуны төлөө','What for'), '<input class="input" id="dt" value="'+esc(md.title||'')+'" placeholder="'+esc(F('жишээ нь: Шаргалжуут TVC','e.g. Shargaljuut TVC'))+'">', true)+
      '<div class="two">'+field(F('Гэрээний дүн','Contract amount'), '<input class="input" id="da" inputmode="numeric" value="'+esc(amt(md.amount))+'">')+field(F('Огноо','Date'), '<input class="input" id="dd" type="date" value="'+esc(String(md.date||iso(TODAY)).slice(0,10))+'">')+'</div>'+
      field(F('Төлөв','Status'), '<div class="seg">'+[['active',F('Явагдаж буй','In progress')],['done',F('Дууссан','Done')],['changed',F('Өөрчилсөн','Amended')],['cancelled',F('Цуцалсан','Cancelled')]].map(function(o){ return '<button data-act="fdst" data-v="'+o[0]+'" aria-pressed="'+(st===o[0])+'">'+esc(o[1])+'</button>'; }).join('')+'</div>')+
      ((st==='changed'||st==='cancelled')?field(st==='cancelled'?F('Цуцлахаас өмнө хийгдсэн ажлын дүн','Value of the work done before cancelling'):F('Өөрчилсөн гэрээний дүн','Amended contract amount'), '<input class="input" id="df" inputmode="numeric" value="'+esc(amt(md.final))+'"><p class="muted s13" style="margin:6px 0 0">'+esc(F('Гэрээнээс хасагдсан дүн: ','Taken off the contract: ')+money(Math.max(0,(+md.amount||0)-(+md.final||0))))+'</p>'):'')+
      '<div class="two">'+field(F('Ажлын төрөл','Type of work'), '<select class="input" id="dw"><option value=""></option>'+WORK_TYPES.map(function(w){ return '<option'+(w===md.work?' selected':'')+'>'+esc(w)+'</option>'; }).join('')+'</select>', true)+field(F('Төсөл','Project'), '<select class="input" id="dp"><option value="">'+esc(F('Холбохгүй','Not linked'))+'</option>'+S.projects.map(function(p){ return '<option value="'+esc(p.id)+'"'+(p.id===md.project?' selected':'')+'>'+esc(p.client+(p.name?' · '+p.name:''))+'</option>'; }).join('')+'</select>', true)+'</div>'+
      (md.received?field(F('Хүснэгтэд бүртгэгдсэн орсон төлбөр','Received, as recorded in the old sheet'), '<input class="input" id="drc" inputmode="numeric" value="'+esc(amt(md.received))+'">', true):'')+
      (md.id?'<div class="cost-box"><div class="fin-card-h"><h3>'+esc(F('Энэ ажлын зардал','Costs on this job'))+'</h3><b>'+esc(money(cost))+'</b></div>'+(costs.length?'<div class="mini-rows">'+costs.map(function(t){ return '<div class="mini static"><span><b>'+esc(t.note||fcatName(t.cat))+'</b><em>'+esc(t.date+' · '+fcatName(t.cat))+'</em></span><span class="amt">'+esc(money(t.amount))+'</span><button class="icon-btn sm" data-act="fcostx" data-id="'+esc(t.id)+'" aria-label="'+esc(F('Салгах','Unlink'))+'">'+ICON.x+'</button></div>'; }).join('')+'</div>':'<p class="muted s13">'+esc(F('Хөлсний ажилтан, камер түрээс, зам, хоол гэх мэт зардлыг энд холбоно.','Link freelancers, camera rental, travel, shoot meals and so on here.'))+'</p>')+
        '<select class="input" id="dcost"><option value="">'+esc(F('+ Зардал холбох','+ Link a cost'))+'</option>'+free.map(function(t){ return '<option value="'+esc(t.id)+'">'+esc(t.date+' · '+money(t.amount)+' · '+(t.note||fcatName(t.cat)).slice(0,48))+'</option>'; }).join('')+'</select></div>':'')+
      '<p class="err" id="derr2" role="alert"></p><div class="m-a">'+(md.id?'<button class="btn ghost" data-act="fdealdel" style="margin-right:auto">'+esc(L('Delete'))+'</button><button class="btn" data-act="fpayin">'+ICON.down+esc(F('Төлбөр бүртгэх','Record a payment'))+'</button>':'')+'<button class="btn ghost" data-act="close">'+esc(L('Cancel'))+'</button><button class="btn primary xl" data-act="fdealsave">'+esc(L('Save'))+'</button></div>';
  }
  if(md.kind==='fstaff'){
    var st=staffSorted();
    return '<h2>'+esc(F('Ажилтнууд','Staff'))+'</h2><p class="muted s13" style="margin:-8px 0 0">'+esc(F('Цалингийн хүснэгт эндээс эхлэнэ. Нэр, данс зөвхөн санхүүд харагдана.','Payroll starts from here. Names and accounts are visible in finance only.'))+'</p>'+
      '<div class="staff-list">'+st.map(function(s){ return '<div class="staff-r"><input class="input sm" data-st="'+esc(s.id)+'" data-f="name" value="'+esc(s.name)+'" placeholder="'+esc(F('Нэр','Name'))+'"><input class="input sm" data-st="'+esc(s.id)+'" data-f="position" value="'+esc(s.position||'')+'" placeholder="'+esc(F('Албан тушаал','Position'))+'"><input class="input sm" data-st="'+esc(s.id)+'" data-f="base" value="'+esc(s.base||'')+'" placeholder="'+esc(F('Үндсэн цалин','Base'))+'" inputmode="numeric"><input class="input sm" data-st="'+esc(s.id)+'" data-f="reported" value="'+esc(s.reported||'')+'" placeholder="'+esc(F('НДШ-д тайлагнах','Reported'))+'" inputmode="numeric"><input class="input sm" data-st="'+esc(s.id)+'" data-f="fund" value="'+esc(s.fund||'')+'" placeholder="'+esc(F('Фонд','Fund'))+'" inputmode="numeric"><input class="input sm" data-st="'+esc(s.id)+'" data-f="account" value="'+esc(s.account||'')+'" placeholder="'+esc(F('Банк, данс','Bank, account'))+'"><label class="fixrow mini-check"><input type="checkbox" data-st="'+esc(s.id)+'" data-f="bonus"'+(s.bonus?' checked':'')+'><span>'+esc(F('Бонус','Bonus'))+'</span></label><label class="fixrow mini-check"><input type="checkbox" data-st="'+esc(s.id)+'" data-f="left"'+(s.left?' checked':'')+'><span>'+esc(F('Гарсан','Left'))+'</span></label><button class="icon-btn sm" data-act="fstaffdel" data-id="'+esc(s.id)+'" aria-label="'+esc(L('Remove'))+'">'+ICON.x+'</button></div>'; }).join('')+'</div>'+
      '<button class="lnk" data-act="fstaffadd" style="align-self:flex-start">'+esc(F('+ Ажилтан нэмэх','+ Add a person'))+'</button><div class="m-a"><button class="btn primary" data-act="fstaffsave">'+esc(L('Save'))+'</button></div>';
  }
  return '';
}
function finClients(){ var o={}; FIN.data.fin_deals.forEach(function(d){ if(d.client) o[d.client]=1; }); FIN.data.fin_tx.forEach(function(t){ if(t.client) o[t.client]=1; }); S.projects.forEach(function(p){ if(p.client) o[p.client]=1; }); return Object.keys(o).sort(); }
function keepFin(){
  var md=S.modal, g=function(id){ var e=document.getElementById(id); return e?e.value:undefined; };
  if(md.kind==='ftx'){ md.amount=parseMoney(g('fa')); md.note=g('fn'); md.date=g('fd'); if(g('fcl')!=null) md.client=g('fcl'); if(g('frg')!=null) md.reg=g('frg'); if(g('fdl')!=null){ md.deal=g('fdl'); md.dealAuto=false; } }
  if(md.kind==='fdeal'){ md.client=g('dc'); md.reg=g('dr'); md.title=g('dt'); md.amount=parseMoney(g('da')); md.date=g('dd'); md.work=g('dw'); md.project=g('dp'); if(g('df')!=null) md.final=parseMoney(g('df')); if(g('drc')!=null) md.received=parseMoney(g('drc')); }
  if(md.kind==='fstaff'){ Array.prototype.forEach.call(document.querySelectorAll('[data-st]'),function(e){ var s=FIN.data.fin_staff.filter(function(x){return x.id===e.dataset.st;})[0]; if(!s) return; var f=e.dataset.f; s[f]=e.type==='checkbox'?e.checked:(/base|reported|fund/.test(f)?parseMoney(e.value):e.value); }); }
}
// ---------- actions ----------
function finAction(a,b,id){
  if(a.indexOf('fup')===0) return fupAction(a,b);
  if(jobsAction(a,b)) return true;
  var md=S.modal;
  if(a==='fmonth'){ var dd=fromIso(FIN.month+'-01'); dd.setMonth(dd.getMonth()+(+b.dataset.d)); FIN.month=iso(dd).slice(0,7); render(); return true; }
  if(a==='ftab'){ FIN.tab=b.dataset.t; if(FIN.tab!=='tx') FIN.filter='all'; render(); return true; }
  if(a==='flock'){ lockFinance(); render(); return true; }
  if(a==='ffilter'){ FIN.tab='tx'; FIN.filter=b.dataset.f; render(); return true; }
  if(a==='fytd'){ FIN.ytd=b.dataset.v==='1'; render(); return true; }
  if(a==='ftxnew'){ openModal({kind:'ftx', type:'out', date:iso(TODAY)}); setTimeout(function(){ var x=$('#fa'); if(x) x.focus(); },40); return true; }
  if(a==='ftxedit'){ var t=FIN.data.fin_tx.filter(function(x){return x.id===id;})[0]; openModal(Object.assign({kind:'ftx'}, clone(t), {id:t.id, type:t.type})); return true; }
  if(a==='ftype'){ keepFin(); md.type=b.dataset.v; md.cat=null; md.allcats=false; renderModal(); return true; }
  if(a==='fcat'){ keepFin(); md.cat=b.dataset.k; renderModal(); return true; }
  if(a==='fallcats'){ keepFin(); md.allcats=true; renderModal(); return true; }
  if(a==='facct'){ keepFin(); md.account=b.dataset.v; renderModal(); return true; }
  if(a==='fvat'){ keepFin(); if(md.type==='in') md.vat=b.dataset.v; else md.receipt=b.dataset.v; renderModal(); return true; }
  if(a==='ftxsave'){ keepFin(); if(!(md.amount>0)){ $('#ferr').textContent=F('Дүнгээ оруулна уу.','Enter the amount.'); $('#fa').focus(); return true; }
    var cats=md.type==='in'?FIN_IN:md.type==='out'?FIN_OUT:[FIN_MOVE];
    var rec={type:md.type, amount:md.amount, cat:md.cat||cats[0].k, note:(md.note||'').trim(), date:md.date||iso(TODAY), account:md.account||'bank', client:(md.client||'').trim(), reg:(md.reg||'').trim(), deal:md.type==='move'?'':(md.deal||''), vat:md.type==='in'?(md.vat||'none'):'none', receipt:md.type==='out'?(md.receipt||'none'):'none', by:S.me};
    if(md.id){ var ex=FIN.data.fin_tx.filter(function(x){return x.id===md.id;})[0]; Object.assign(ex,rec); fpersist('fin_tx',ex); } else fadd('fin_tx', Object.assign({id:newId('f'), created:new Date().toISOString()}, rec));
    S.modal=null; FIN.month=monthOf(rec.date); render(); toast(F('Хадгаллаа','Saved')); return true; }
  if(a==='ftxdel'){ var gone=FIN.data.fin_tx.filter(function(x){return x.id===md.id;})[0]; fdel('fin_tx',md.id); S.modal=null; render(); toast(F('Гүйлгээ устлаа','Transaction deleted'), function(){ fadd('fin_tx',gone); }); return true; }
  if(a==='fdealnew'){ openModal({kind:'fdeal', date:iso(TODAY)}); return true; }
  if(a==='fdeal'){ var d0=FIN.data.fin_deals.filter(function(x){return x.id===id;})[0]; openModal(Object.assign({kind:'fdeal'}, clone(d0), {id:d0.id})); return true; }
  if(a==='fdealsave'){ keepFin(); if(!(md.client||'').trim()){ $('#derr2').textContent=F('Харилцагчийн нэрийг бичнэ үү.','Write the client name.'); return true; } if(!(md.amount>0)){ $('#derr2').textContent=F('Гэрээний дүнгээ оруулна уу.','Enter the contract amount.'); return true; }
    var dr={client:md.client.trim(), reg:(md.reg||'').trim(), title:(md.title||'').trim(), amount:md.amount, date:md.date||iso(TODAY), work:md.work||'', project:md.project||'', status:md.status||'active', final:(md.status==='changed'||md.status==='cancelled')?(+md.final||0):null, received:+md.received||0};
    if(md.id){ var dx=FIN.data.fin_deals.filter(function(x){return x.id===md.id;})[0]; Object.assign(dx,dr); fpersist('fin_deals',dx); } else fadd('fin_deals', Object.assign({id:newId('d'), created:new Date().toISOString()}, dr));
    S.modal=null; render(); toast(F('Хадгаллаа','Saved')); return true; }
  if(a==='fdealdel'){ var gd=FIN.data.fin_deals.filter(function(x){return x.id===md.id;})[0]; fdel('fin_deals',md.id); S.modal=null; render(); toast(F('Борлуулалт устлаа','Sale deleted'), function(){ fadd('fin_deals',gd); }); return true; }
  if(a==='fpayin'){ keepFin(); var dl=FIN.data.fin_deals.filter(function(x){return x.id===md.id;})[0]; openModal({kind:'ftx', type:'in', cat:'sales', deal:dl.id, client:dl.client, reg:dl.reg, note:dl.client+(dl.title?' · '+dl.title:''), amount:Math.max(0,dealFinal(dl)-dealPaid(dl)), vat:'todo', date:iso(TODAY)}); return true; }
  if(a==='fstaff'){ openModal({kind:'fstaff'}); return true; }
  if(a==='fstaffadd'){ keepFin(); FIN.data.fin_staff.push({id:newId('s'), name:'', position:'', base:0, reported:0, fund:0, order:FIN.data.fin_staff.length+1}); renderModal(); return true; }
  if(a==='fstaffdel'){ keepFin(); var sd=FIN.data.fin_staff.filter(function(x){return x.id===id;})[0]; fdel('fin_staff',id); renderModal(); toast(F('Хаслаа','Removed'), function(){ fadd('fin_staff',sd); renderModal(); }); return true; }
  if(a==='fstaffsave'){ keepFin(); FIN.data.fin_staff=FIN.data.fin_staff.filter(function(s){ return (s.name||'').trim(); }); FIN.data.fin_staff.forEach(function(s){ fpersist('fin_staff',s); }); S.modal=null; render(); toast(F('Хадгаллаа','Saved')); return true; }
  if(a==='fpaymake'){ var prev=payrollFor(prevMonth(FIN.month)); var rows=staffSorted().filter(function(s){ return !s.left; }).map(function(s){ var pr=prev&&prev.rows.filter(function(r){return r.staff===s.id;})[0]; return {staff:s.id, base:+s.base||0, days:21, bonus:0, reported:+s.reported||0, fund:+s.fund||0, owed:0, advance:pr?+pr.advance||0:0, wd:pr?+pr.wd||21:21}; }); fadd('fin_payroll',{id:FIN.month, rows:rows, paid:false}); render(); return true; }
  if(a==='fpaydone'){ var pr2=payrollFor(FIN.month), tot=pr2.rows.reduce(function(s,r){ return s+payCalc(r).net; },0), comp=pr2.rows.reduce(function(s,r){ var c=payCalc(r); return s+c.company+c.ndsh; },0); pr2.paid=true; fpersist('fin_payroll',pr2);
    fadd('fin_tx',{id:newId('f'), created:new Date().toISOString(), type:'out', amount:tot, cat:'salary', note:F(FIN.month.slice(5)+'-р сарын цалин','Salaries '+FIN.month), date:iso(TODAY), account:'bank', client:'', reg:'', deal:'', vat:'none', receipt:'none', by:S.me});
    render(); toast(F('Цалинг зарлагад бүртгэлээ. НДШ ('+money(comp)+') төлөхдөө тусад нь бүртгээрэй.','Salaries are logged as spending. Log social insurance ('+money(comp)+') when you pay it.')); return true; }
  if(a==='fpayundo'){ var pr3=payrollFor(FIN.month); pr3.paid=false; fpersist('fin_payroll',pr3); render(); return true; }
  return false;
}
// inline edits: payroll cells and plan inputs save when you leave the field
document.addEventListener('change', function(e){
  var el=e.target;
  if(el.dataset && el.dataset.pay!=null){ var pr=payrollFor(FIN.month); if(!pr) return; pr.rows[+el.dataset.pay][el.dataset.f]=parseMoney(el.value); fpersist('fin_payroll',pr); render(); return; }
  if(el.dataset && el.dataset.plan){ var p=plan(), exists=FIN.data.fin_plan.indexOf(p)>=0; p.sales=p.sales||{}; p.budget=p.budget||{};
    if(el.dataset.plan==='opening') p.opening=parseMoney(el.value); else p[el.dataset.plan][el.dataset.k]=parseMoney(el.value);
    if(!exists) FIN.data.fin_plan.push(p); fpersist('fin_plan',p); render(); return; }
});
document.addEventListener('input', function(e){
  if(e.target.id==='fq'){ FIN.q=e.target.value; var pos=e.target.selectionStart; render(); var x=$('#fq'); if(x){ x.focus(); x.setSelectionRange(pos,pos); } return; }
  if(e.target.id==='fa'||e.target.id==='da'||(e.target.classList&&e.target.classList.contains('cell'))){ var v=e.target.value.replace(/[^\d]/g,''); e.target.value=v?v.replace(/\B(?=(\d{3})+(?!\d))/g,','):''; }
});
