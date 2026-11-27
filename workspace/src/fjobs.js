// ================= Jobs, clients and periods: what each job really earned, and what each company paid =================
// A sale (deal) is one job or one month of work for a client. Its contract amount can change mid-way:
// status 'changed' (amended) or 'cancelled' keeps the original contract and records what was actually agreed in the end (final).
function dealStLabel(s){ var m={paid:F('Төлөгдсөн','Paid'),active:F('Явагдаж буй','In progress'),done:F('Дууссан','Done'),changed:F('Өөрчилсөн','Amended'),cancelled:F('Цуцалсан','Cancelled')}; return m[s||'active']; }
function dealFinal(d){ return (d.status==='changed'||d.status==='cancelled')?(+d.final||0):(+d.amount||0); }
function dealLost(d){ return Math.max(0,(+d.amount||0)-dealFinal(d)); }
function dealCostList(d){ return FIN.data.fin_tx.filter(function(t){ return t.type==='out' && t.deal===d.id; }); }
function dealCosts(d){ return dealCostList(d).reduce(function(s,t){ return s+(+t.amount||0); },0); }

function dshort(s){ return md(fromIso(String(s).slice(0,10))); }
// ---------- periods: month, quarter, half year, year, all counted from the month shown at the top ----------
function perRange(){
  if(FIN.per==='custom'){ var f=FIN.from||FIN.month, t=FIN.to||FIN.month; if(t<f){ var s=f; f=t; t=s; } return [f, t, (+t.slice(0,4)-+f.slice(0,4))*12+(+t.slice(5))-(+f.slice(5))+1]; }
  var y=FIN.month.slice(0,4), m=+FIN.month.slice(5), p=FIN.per||'month', a=m, b=m;
  if(p==='quarter'){ a=Math.floor((m-1)/3)*3+1; b=a+2; } else if(p==='half'){ a=m<=6?1:7; b=a+5; } else if(p==='year'){ a=1; b=12; }
  return [y+'-'+('0'+a).slice(-2), y+'-'+('0'+b).slice(-2), b-a+1];
}
function perLabel(){
  var r=perRange(), y=r[0].slice(0,4), a=+r[0].slice(5), p=FIN.per||'month';
  if(p==='custom'){ var ml=function(s){ return LANG==='mn'?s.slice(0,4)+'.'+s.slice(5):MON_EN[+s.slice(5)-1].slice(0,3)+' '+s.slice(0,4); }; return r[0]===r[1]?ml(r[0]):ml(r[0])+' - '+ml(r[1]); }
  if(p==='quarter') return F(y+' оны '+Math.ceil(a/3)+'-р улирал','Q'+Math.ceil(a/3)+' '+y);
  if(p==='half') return F(y+' оны '+(a===1?'эхний':'сүүлийн')+' хагас жил',(a===1?'H1 ':'H2 ')+y);
  if(p==='year') return F(y+' он','Year '+y);
  return LANG==='mn'?y+' оны '+a+'-р сар':MON_EN[a-1]+' '+y;
}
function inPer(dateStr){ var r=perRange(), m=monthOf(dateStr); return m>=r[0] && m<=r[1]; }
function perSeg(){ return '<div class="seg" role="group" aria-label="'+esc(F('Хугацаа','Period'))+'">'+[['month',F('Сар','Month')],['quarter',F('Улирал','Quarter')],['half',F('Хагас жил','Half year')],['year',F('Жил','Year')],['custom',F('Өөрөө сонгох','Custom')]].map(function(o){ return '<button data-act="fper" data-v="'+o[0]+'" aria-pressed="'+((FIN.per||'month')===o[0])+'">'+esc(o[1])+'</button>'; }).join('')+'</div>'; }

// One period picker instead of a second row of tabs: arrows step, the button opens presets and a custom range
function mShift(m,n){ var d0=fromIso(m+'-01'); d0.setMonth(d0.getMonth()+n); return iso(d0).slice(0,7); }
function perNav(){
  var p=FIN.per||'month', unit={month:F('сар','month'),quarter:F('улирал','quarter'),half:F('хагас жил','half year'),year:F('жил','year'),custom:F('хугацаа','range')}[p];
  var cur=iso(TODAY).slice(0,7), r=perRange();
  var item=function(act,v,label,on){ return '<button class="per-it" role="menuitemradio" aria-checked="'+(on?'true':'false')+'" data-act="'+act+'" data-v="'+v+'"><span class="per-ck">'+(on?ICON.check:'')+'</span>'+esc(label)+'</button>'; };
  var h='<div class="per-pick">';
  h+='<button class="icon-btn" data-act="fmonth" data-d="-1" aria-label="'+esc(F('Өмнөх ','Previous ')+unit)+'">'+ICON.back+'</button>';
  h+='<button class="per-btn" data-act="fperopen" aria-haspopup="true" aria-expanded="'+(FIN.perOpen?'true':'false')+'">'+ICON.cal+'<b class="fmonth">'+esc(perLabel())+'</b>'+ICON.down+'</button>';
  h+='<button class="icon-btn" data-act="fmonth" data-d="1" aria-label="'+esc(F('Дараах ','Next ')+unit)+'">'+ICON.back.replace('M15 6l-6 6 6 6','M9 6l6 6-6 6')+'</button>';
  if(FIN.perOpen){
    h+='<div class="per-pop" role="menu" aria-label="'+esc(F('Хугацаа','Period'))+'">';
    h+='<div class="per-g">'+esc(F('Хугацааны нэгж','Period length'))+'</div>'+
      [['month',F('Сар','Month')],['quarter',F('Улирал','Quarter')],['half',F('Хагас жил','Half year')],['year',F('Жил','Year')]].map(function(x){ return item('fper',x[0],x[1],p===x[0]); }).join('');
    h+='<div class="per-sep"></div><div class="per-g">'+esc(F('Түргэн сонголт','Quick picks'))+'</div>'+
      [['this-month',F('Энэ сар','This month')],['last-month',F('Өнгөрсөн сар','Last month')],['this-quarter',F('Энэ улирал','This quarter')],['this-year',F('Энэ жил','This year')],['last-year',F('Өнгөрсөн жил','Last year')]].map(function(x){
        var on=false;
        if(x[0]==='this-month') on=p==='month'&&FIN.month===cur; else if(x[0]==='last-month') on=p==='month'&&FIN.month===mShift(cur,-1);
        else if(x[0]==='this-quarter') on=p==='quarter'&&Math.ceil(+FIN.month.slice(5)/3)===Math.ceil(+cur.slice(5)/3)&&FIN.month.slice(0,4)===cur.slice(0,4);
        else if(x[0]==='this-year') on=p==='year'&&FIN.month.slice(0,4)===cur.slice(0,4); else on=p==='year'&&+FIN.month.slice(0,4)===+cur.slice(0,4)-1;
        return item('fperpre',x[0],x[1],on); }).join('');
    h+='<div class="per-sep"></div><div class="per-g">'+esc(F('Өөрөө сонгох','Custom range'))+'</div>'+
      '<div class="per-custom"><label><span>'+esc(F('Эхлэх','From'))+'</span><input class="input sm" type="month" id="pfrom" value="'+esc(p==='custom'?(FIN.from||r[0]):r[0])+'"></label><label><span>'+esc(F('Дуусах','To'))+'</span><input class="input sm" type="month" id="pto" value="'+esc(p==='custom'?(FIN.to||r[1]):r[1])+'"></label>'+
      '<button class="btn sm primary" data-act="fperapply">'+esc(F('Хэрэглэх','Apply'))+'</button></div>';
    h+='</div>';
  }
  return h+'</div>';
}
document.addEventListener('click', function(e){ if(FIN.perOpen && !e.target.closest('.per-pick')){ FIN.perOpen=false; render(); } });
document.addEventListener('keydown', function(e){ if(FIN.perOpen && e.key==='Escape'){ e.stopImmediatePropagation(); FIN.perOpen=false; render(); var b=document.querySelector('.per-btn'); if(b) b.focus(); } }, true);
// ---------- matching a description to a client's job ----------
var CLIENT_ALIAS={'pizza hut':['пицца','pizza'],'emart':['имарт','emart','e-mart'],'mobicom':['мобиком','mobicom'],'max group':['макс','max'],'unitel':['юнител','unitel'],'kakumi':['какуми','kakumi'],'hairan':['хайран','hairan'],'milkman':['милкмэн','milkman'],'pinuta':['пинута','pinuta'],'pmc':['pmc'],'sisu':['sisu','сису'],'paradox':['paradox','парадокс','юү кэй эс']};
function clientTokens(name){
  var n=nrm(name), t=(CLIENT_ALIAS[n]||[]).slice();
  n.replace(/[^a-zа-яөүё0-9\s.]/g,' ').split(/\s+/).forEach(function(w){ if(w.length>=3 && !/^(ххк|llc|ltd|групп|group|компани)$/.test(w) && t.indexOf(w)<0) t.push(w); });
  return t.slice(0,3);
}
// A name must start a word; short names (3 letters) must be the whole word, so "шим" never matches "шимтгэл"
function tokenIn(s,w){ var re=new RegExp('(^|[^a-zа-яөүё0-9])'+w.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+(w.length<4?'($|[^a-zа-яөүё0-9])':''),'i'); return re.test(s); }
function suggestDeal(text, date){
  var s=nrm(text); if(!s) return '';
  var best=null, bestScore=-1;
  FIN.data.fin_deals.forEach(function(d){
    var tok=clientTokens(d.client), hit=tok.some(function(w){ return tokenIn(s,w); }); if(!hit) return;
    if((fromIso(String(d.date).slice(0,10))-fromIso(date||iso(TODAY)))/864e5>45) return;
    var gap=Math.abs(fromIso(String(d.date).slice(0,10))-fromIso(date||iso(TODAY)))/864e5, score=1000-gap-(d.status==='cancelled'||d.status==='done'?200:0)-(String(d.date)>String(date)?60:0);
    if(score>bestScore){ bestScore=score; best=d; }
  });
  return best?best.id:'';
}
// Costs that look like they belong to a job but are not linked yet (overheads like rent or salaries are left out)
var OVERHEAD={salary:1,rent:1,ndsh:1,tax:1,loan:1,fees:1,utilities:1,phone:1,software:1,card:1,fund:1,staff_loan:1,cleaning:1,cat:1,mgmt:1};
function costSuggestions(){
  return FIN.data.fin_tx.filter(function(t){ return t.type==='out' && !t.deal && !OVERHEAD[t.cat]; }).map(function(t){ return {t:t, d:suggestDeal(t.note+' '+(t.client||''), t.date)}; }).filter(function(x){ return x.d; });
}

// ---------- Sales and jobs ----------
function finSales(){
  var all=FIN.data.fin_deals.filter(function(d){ return inPer(d.date) && (!FIN.clientF || d.client===FIN.clientF); }).sort(function(a,b){ return String(b.date).localeCompare(String(a.date)); });
  var T={c:0,f:0,l:0,p:0,k:0}; all.forEach(function(d){ T.c+=+d.amount||0; T.f+=dealFinal(d); T.l+=dealLost(d); T.p+=dealPaid(d); T.k+=dealCosts(d); });
  var h='<div class="fin-bar">'+(FIN.clientF?'<button class="chip-x" data-act="fclientf" data-c="">'+esc(FIN.clientF)+' '+ICON.x+'</button>':'')+'<span style="flex:1"></span><button class="btn primary" data-act="fdealnew">'+ICON.plus+esc(F('Ажил нэмэх','Add a job'))+'</button></div>';
  h+='<div class="fin-stats five">'+statTile(F('Гэрээгээр','Contracted'), moneyShort(T.c), money(T.c))+statTile(F('Өөрчлөлт, цуцлалт','Changed or cancelled'), T.l?'-'+moneyShort(T.l):'0', F('гэрээнээс хасагдсан','taken off contracts'), T.l?'neg':'')+statTile(F('Бодит орлого','Actually received'), moneyShort(T.p), money(T.p), 'in')+statTile(F('Ажлын зардал','Job costs'), moneyShort(T.k), money(T.k))+statTile(F('Ашиг','Profit'), moneyShort(T.p-T.k), F('орсон орлого, зардал хассан','received minus costs'), 'ink')+'</div>';
  var sug=costSuggestions();
  if(sug.length) h+='<div class="fin-tip"><span>'+esc(F(sug.length+' зардал аль ажилд хамаарахыг таамагласан. Холбовол ажил бүрийн ашиг гарна.','I matched '+sug.length+' costs to jobs. Link them to see each job\'s profit.'))+'</span><button class="btn sm" data-act="flinksug">'+esc(F('Шалгаад холбох','Check and link'))+'</button></div>';
  if(!all.length) return h+'<div class="empty" style="margin-top:20px">'+esc(F('Энэ хугацаанд ажил алга.','No jobs in this period.'))+'</div>';
  return h+'<div class="card report"><div class="pay-scroll"><table class="rep jobs"><thead><tr><th>'+esc(F('Ажил','Job'))+'</th><th class="nr">'+esc(F('Гэрээ','Contract'))+'</th><th class="nr">'+esc(F('Эцсийн','Final'))+'</th><th class="nr">'+esc(F('Орсон','Received'))+'</th><th class="nr">'+esc(F('Үлдэгдэл','Owed'))+'</th><th class="nr">'+esc(F('Зардал','Costs'))+'</th><th class="nr">'+esc(F('Ашиг','Profit'))+'</th><th>'+esc(F('Төлөв','Status'))+'</th></tr></thead><tbody>'+
    all.map(function(d){ var fin=dealFinal(d), paid=dealPaid(d), cost=dealCosts(d), left=Math.max(0,fin-paid), st=d.status||(left<=0.5?'paid':'active'), cls=st==='cancelled'?'red':st==='changed'?'warn':st==='done'||st==='paid'?'ok':'info';
      return '<tr class="click" data-act="fdeal" data-id="'+esc(d.id)+'" tabindex="0"><td><b>'+esc(d.client)+'</b><div class="muted s13">'+esc([md(fromIso(String(d.date).slice(0,10))), d.work, d.title].filter(Boolean).join(' · '))+'</div></td><td class="nr">'+esc(money(d.amount))+'</td><td class="nr'+(fin<(+d.amount||0)?' red':'')+'">'+esc(money(fin))+'</td><td class="nr pos">'+esc(money(paid))+'</td><td class="nr owed">'+(left?esc(money(left)):'<span class="muted">0</span>')+'</td><td class="nr muted">'+(cost?esc(money(cost)):'')+'</td><td class="nr"><b class="'+(paid-cost<0?'red':'')+'">'+esc(money(paid-cost))+'</b></td><td><span class="chip '+cls+'">'+esc(dealStLabel(st))+'</span></td></tr>'; }).join('')+
    '</tbody></table></div></div>';
}

// ---------- Clients: who paid what, for which work, VAT filed or not ----------
function finClientView(){
  var by={}, work={};
  FIN.data.fin_deals.filter(function(d){ return inPer(d.date); }).forEach(function(d){ var o=by[d.client]=by[d.client]||{c:0,f:0,p:0,k:0,n:0,w:{},vd:0,vt:0}; o.c+=+d.amount||0; o.f+=dealFinal(d); o.p+=dealPaid(d); o.k+=dealCosts(d); o.n++; if(d.work){ o.w[d.work]=1; work[d.work]=(work[d.work]||0)+dealFinal(d); } });
  // VAT on payments that came in during the period, matched to the client by name
  FIN.data.fin_tx.filter(function(t){ return t.type==='in' && t.cat==='sales' && inPer(t.date); }).forEach(function(t){
    var d=t.deal?FIN.data.fin_deals.filter(function(x){ return x.id===t.deal; })[0]:null, name=d?d.client:(t.client||''); if(!name) return;
    var key=Object.keys(by).filter(function(k){ return nrm(k)===nrm(name) || clientTokens(k).some(function(w){ return tokenIn(nrm(name),w); }); })[0]; if(!key) return;
    if(t.vat==='done') by[key].vd+=+t.amount||0; else if(t.vat==='todo') by[key].vt+=+t.amount||0; });
  var names=Object.keys(by).sort(function(a,b){ return by[b].f-by[a].f; });
  var h='';
  h+='<div class="card report"><h3>'+esc(F('Харилцагч бүрээр','By client'))+'</h3>'+(names.length?'<div class="pay-scroll"><table class="rep jobs"><thead><tr><th>'+esc(F('Компани','Company'))+'</th><th>'+esc(F('Ажлын төрөл','Work'))+'</th><th class="nr">'+esc(F('Борлуулалт','Sales'))+'</th><th class="nr">'+esc(F('Орсон','Received'))+'</th><th class="nr">'+esc(F('Үлдэгдэл','Owed'))+'</th><th class="nr">'+esc(F('Ашиг','Profit'))+'</th><th>'+esc(F('НӨАТ','VAT'))+'</th></tr></thead><tbody>'+
    names.map(function(n){ var o=by[n], left=Math.max(0,o.f-o.p), w=Object.keys(o.w).join(', ');
      return '<tr class="click" data-act="fclientf" data-c="'+esc(n)+'" tabindex="0"><td><b>'+esc(n)+'</b><div class="muted s13">'+esc(F(o.n+' ажил',o.n+(o.n===1?' job':' jobs')))+(o.f<o.c?' · '+esc(F('гэрээнээс ','contract was '))+esc(money(o.c)):'')+'</div></td><td class="muted s13">'+esc(w||'')+'</td><td class="nr">'+esc(money(o.f))+'</td><td class="nr pos">'+esc(money(o.p))+'</td><td class="nr">'+(left?esc(money(left)):'<span class="muted">0</span>')+'</td><td class="nr">'+esc(money(o.p-o.k))+'</td><td>'+(o.vt?'<span class="chip warn">'+esc(F('Шивэх ','To file '))+esc(moneyShort(o.vt))+'</span>':o.vd?'<span class="chip ok">'+esc(F('Шивсэн','Filed'))+'</span>':'<span class="muted s13">'+esc(F('Бүртгэлгүй','Not set'))+'</span>')+'</td></tr>'; }).join('')+'</tbody></table></div>':'<p class="muted">'+esc(F('Энэ хугацаанд борлуулалт алга.','No sales in this period.'))+'</p>')+'</div>';
  var wk=Object.keys(work).sort(function(a,b){ return work[b]-work[a]; }), wt=wk.reduce(function(s,k){ return s+work[k]; },0);
  if(wk.length) h+='<div class="card fin-card" style="margin-top:20px"><div class="fin-card-h"><h3>'+esc(F('Ажлын төрлөөр','By type of work'))+'</h3></div>'+wk.map(function(k){ return '<div class="bar-row"><div class="bar-l">'+esc(k)+'</div><div class="bar-v"><b>'+esc(moneyShort(work[k]))+'</b><span class="muted">'+Math.round(work[k]/wt*100)+'%</span></div><div class="bar-t"><i style="width:'+(work[k]/wt*100)+'%;background:var(--ink)"></i></div></div>'; }).join('')+'</div>';
  // Purchases: did the supplier file a VAT receipt to us?
  var pv={}; FIN.data.fin_tx.filter(function(t){ return t.type==='out' && inPer(t.date) && !OVERHEAD[t.cat] && t.receipt && t.receipt!=='none'; }).forEach(function(t){ var k=t.client||F('Нэргүй нийлүүлэгч','Supplier not named'), o=pv[k]=pv[k]||{a:0,got:0,miss:0}; o.a+=+t.amount||0; if(t.receipt==='done') o.got+=+t.amount||0; else o.miss+=+t.amount||0; });
  var vs=Object.keys(pv).sort(function(a,b){ return pv[b].miss-pv[a].miss || pv[b].a-pv[a].a; });
  h+='<div class="card report" style="margin-top:20px"><h3>'+esc(F('Худалдан авалт: нийлүүлэгч НӨАТ шивсэн үү','Purchases: did the supplier file VAT for us'))+'</h3>'+(vs.length?'<table class="rep"><thead><tr><th>'+esc(F('Нийлүүлэгч','Supplier'))+'</th><th class="nr">'+esc(F('Худалдан авсан','Bought'))+'</th><th class="nr">'+esc(F('НӨАТ ирсэн','VAT received'))+'</th><th class="nr">'+esc(F('Ирээгүй','Missing'))+'</th></tr></thead><tbody>'+vs.map(function(k){ var o=pv[k]; return '<tr><td>'+esc(k)+'</td><td class="nr">'+esc(money(o.a))+'</td><td class="nr pos">'+esc(money(o.got))+'</td><td class="nr'+(o.miss?' owed':'')+'">'+esc(money(o.miss))+'</td></tr>'; }).join('')+'</tbody></table>':'<p class="muted">'+esc(F('Зарлага дээр "НӨАТ баримт" сонгосон худалдан авалт энд гарна.','Purchases where you set the VAT receipt field show up here.'))+'</p>')+'</div>';
  return h;
}

// ---------- link suggested costs to jobs ----------
function linkModal(){
  var sug=costSuggestions();
  return '<h2>'+esc(F('Зардлыг ажилд холбох','Link costs to jobs'))+'</h2><p class="muted s13" style="margin:-8px 0 0">'+esc(F('Тайлбар дахь компанийн нэрээр таамагласан. Буруу бол тэмдэглэгээг арилгана уу.','Matched by the company name in the description. Untick any that are wrong.'))+'</p>'+
    '<div class="rows fup-list link-list">'+sug.map(function(x,i){ var d=FIN.data.fin_deals.filter(function(y){ return y.id===x.d; })[0];
      return '<label class="fup-r"><input type="checkbox" data-lnk="'+i+'" checked><span class="fup-d">'+esc(x.t.date.slice(5))+'</span><span class="rw-m"><b>'+esc(x.t.note||fcatName(x.t.cat))+'</b><span class="muted">→ '+esc(d.client+' · '+md(fromIso(String(d.date).slice(0,10))))+'</span></span><span class="tx-amt">-'+esc(money(x.t.amount))+'</span></label>'; }).join('')+'</div>'+
    '<div class="m-a"><button class="btn ghost" data-act="close">'+esc(L('Cancel'))+'</button><button class="btn primary" data-act="flinkgo">'+esc(F('Сонгосныг холбох','Link the ticked ones'))+'</button></div>';
}
function jobsAction(a,b){
  if(a==='fperopen'){ FIN.perOpen=!FIN.perOpen; render(); var f=document.querySelector('.per-it[aria-checked=true]')||document.querySelector('.per-it'); if(FIN.perOpen&&f) f.focus(); return true; }
  if(a==='fper'){ if(FIN.per==='custom') FIN.month=perRange()[1]; FIN.per=b.dataset.v; FIN.perOpen=false; render(); return true; }
  if(a==='fperpre'){ var c=iso(TODAY).slice(0,7), v=b.dataset.v;
    if(v==='this-month'){ FIN.per='month'; FIN.month=c; } else if(v==='last-month'){ FIN.per='month'; FIN.month=mShift(c,-1); }
    else if(v==='this-quarter'){ FIN.per='quarter'; FIN.month=c; } else if(v==='this-year'){ FIN.per='year'; FIN.month=c; } else { FIN.per='year'; FIN.month=(+c.slice(0,4)-1)+'-12'; }
    FIN.perOpen=false; render(); return true; }
  if(a==='fperapply'){ var fv=(document.getElementById('pfrom')||{}).value, tv=(document.getElementById('pto')||{}).value; if(!fv||!tv) return true; if(tv<fv){ var sw=fv; fv=tv; tv=sw; } FIN.per='custom'; FIN.from=fv; FIN.to=tv; FIN.perOpen=false; render(); return true; }
  if(a==='fclientf'){ FIN.clientF=b.dataset.c||''; FIN.tab='sales'; render(); return true; }
  if(a==='flinksug'){ openModal({kind:'flink'}); return true; }
  if(a==='flinkgo'){ var sug=costSuggestions(), n=0; Array.prototype.forEach.call(document.querySelectorAll('[data-lnk]'),function(c){ if(c.checked){ var x=sug[+c.dataset.lnk]; x.t.deal=x.d; fpersist('fin_tx',x.t); n++; } }); S.modal=null; render(); toast(F(n+' зардал холбогдлоо',n+' costs linked')); return true; }
  if(a==='fdst'){ keepFin(); S.modal.status=b.dataset.v; if((b.dataset.v==='changed'||b.dataset.v==='cancelled') && S.modal.final==null) S.modal.final=+S.modal.amount||0; renderModal(); return true; }
  if(a==='fcostx'){ var t=FIN.data.fin_tx.filter(function(x){ return x.id===b.dataset.id; })[0]; if(t){ t.deal=''; fpersist('fin_tx',t); renderModal(); } return true; }
  return false;
}
document.addEventListener('change', function(e){
  var el=e.target;
  if(el.id==='dcost' && el.value && S.modal && S.modal.id){ var t=FIN.data.fin_tx.filter(function(x){ return x.id===el.value; })[0]; if(t){ keepFin(); t.deal=S.modal.id; fpersist('fin_tx',t); renderModal(); } }
});
