// ================= Application frame: workspaces, selection, inspector, panels =================
// Adapted from how Photoshop, Illustrator and Premiere Pro work: pick a workspace, select on the canvas,
// edit in the inspector on the right, act from a small bar beside the selection. Spectrum 2 sets behaviour;
// BrandOn's paper, red, Onest and rounded corners set the look.
Object.assign(MN, {
  'Today':'Өнөөдөр', 'Production':'Үйлдвэрлэл', 'Planning':'Төлөвлөлт', 'Money':'Мөнгө', 'Workspaces':'Ажлын орчин',
  'Inspector':'Шинж чанар', 'Nothing selected':'Юу ч сонгоогүй', '{n} selected':'{n} сонгосон', 'Select':'Сонгох', 'Select tool':'Сонгох хэрэгсэл',
  'Browser':'Төслүүд', 'Review queue':'Хянах дараалал', 'Team':'Баг', 'History':'Түүх', 'Shortcuts':'Товчлол', 'Reset workspace':'Ажлын орчныг сэргээх',
  'Hide panel':'Самбар нуух', 'Show panel':'Самбар харуулах', 'Move to the other side':'Нөгөө тал руу зөөх', 'Panel width':'Самбарын өргөн',
  'Synced':'Хадгалагдсан', 'Saving...':'Хадгалж байна...', 'Offline':'Холболтгүй', 'Demo':'Туршилт', 'Saved':'Хадгалсан',
  'Open':'Нээх', 'Open viewer':'Харагч нээх', 'Open thread':'Харилцаа нээх', 'Assignee':'Хариуцагч', 'Due':'Хугацаа', 'Project':'Төсөл', 'Status':'Төлөв',
  'Brief':'Бриф', 'Title':'Гарчиг', 'Client':'Харилцагч', 'Final deadline':'Эцсийн хугацаа', 'Drive folder':'Drive хавтас', 'Contact':'Холбоо барих',
  'Progress':'Явц', 'Reassign':'Хүн солих', 'Move due date':'Хугацаа зөөх', 'Delete':'Устгах', 'Clear':'Цэвэрлэх', 'Apply':'Хэрэглэх',
  'Kind':'Төрөл', 'Date':'Огноо', 'Time':'Цаг', 'Place':'Байршил', 'Who':'Хэн', 'Edit':'Засах', 'Edit all fields':'Бүх талбарыг засах',
  'Assign a task':'Ажил өгөх', 'Active tasks':'Идэвхтэй ажил', 'This week':'Энэ долоо хоног', 'Role':'Үүрэг',
  'Search projects':'Төсөл хайх', 'All projects':'Бүх төсөл', 'Waiting':'Хүлээж буй', 'waited {n} days':'{n} хоног хүлээсэн', 'sent today':'өнөөдөр илгээсэн',
  'Last version':'Сүүлийн хувилбар', 'Sent by':'Илгээсэн', 'Notes':'Тэмдэглэл', 'Locked':'Түгжээтэй', 'Open finance first.':'Эхлээд санхүүгээ нээнэ үү.',
  'Nothing to undo.':'Буцаах зүйл алга.', 'Undone':'Буцаалаа', 'No changes yet in this session.':'Энэ удаад өөрчлөлт алга.',
  'Changes in this session':'Энэ удаагийн өөрчлөлт', 'Layout reset':'Байрлалыг сэргээлээ', 'Panels hidden. Press Tab to bring them back.':'Самбарууд нуугдлаа. Tab дарж буцаана.',
  'Deleted {n} tasks':'{n} ажил устгалаа', 'Updated {n} items':'{n} зүйл шинэчиллээ', 'Only you can change this.':'Зөвхөн эрхтэй хүн өөрчилнө.',
  'Select something to see its details here.':'Ямар нэг зүйл сонгоход дэлгэрэнгүй энд гарна.', 'Double-click or Enter opens it.':'Хоёр дарах эсвэл Enter дарж нээнэ.',
  'Next deadline':'Дараагийн хугацаа', 'Events today':'Өнөөдрийн үйл явдал', 'Waiting for review':'Хянагдахыг хүлээж буй',
  'Active projects':'Идэвхтэй төсөл', 'Delivered':'Хүлээлгэн өгсөн', 'Archived':'Архивласан', 'Events this week':'Энэ долоо хоногийн үйл явдал', 'Shoots':'Зураг авалт',
  'Busiest':'Хамгийн ачаалалтай', 'Oldest wait':'Хамгийн удаан хүлээсэн', 'Money in':'Орж ирсэн', 'Money out':'Гарсан', 'Net':'Цэвэр',
  'New':'Шинэ', 'New project':'Шинэ төсөл', 'Add transaction':'Гүйлгээ нэмэх', 'Thread':'Харилцаа', 'Category':'Ангилал', 'Job':'Ажил',
  'VAT':'НӨАТ', 'Amount':'Дүн', 'Type':'Төрөл', 'Contract':'Гэрээ', 'Received':'Орсон', 'Costs':'Зардал', 'Profit':'Ашиг', 'Owed':'Үлдэгдэл',
  'Mark VAT filed':'НӨАТ шивсэн болгох', 'Link to job':'Ажилтай холбох', 'Change category':'Ангилал солих', 'No job':'Ажилгүй',
  'Not needed':'Шаардлагагүй', 'To file':'Шивэх', 'Filed':'Шивсэн', 'Close':'Хаах', 'Narrow':'Нарийн', 'Regular':'Дунд', 'Wide':'Өргөн',
  'Open the work full size':'Ажлыг томоор харах', 'Previous or next period':'Өмнөх, дараагийн хугацаа', 'Hide or show panels':'Самбар нуух, харуулах',
  'Switch workspace':'Ажлын орчин солих', 'Edit the selection':'Сонгосныг засах', 'Open the selection':'Сонгосныг нээх', 'Select all':'Бүгдийг сонгох',
  'Clear the selection':'Сонголт цэвэрлэх', 'Undo':'Буцаах', 'Move the selection':'Сонголтыг зөөх', 'Pick a person':'Хүн сонгох',
  'Approve':'Батлах', 'Send back':'Буцаах', 'Mark a spot':'Цэг тэмдэглэх', 'Versions':'Хувилбарууд', 'Search or jump to':'Хайх, шууд очих',
  'Keyboard shortcuts':'Товчлуурууд', 'in the review viewer':'хянах харагч дотор',
  'Properties':'Шинж', 'Actions':'Үйлдэл', '{n} messages':'{n} мессеж', 'No messages yet.':'Мессеж алга.', 'Use the bar at the bottom to change them together.':'Доод талын мөрөөр бүгдийг зэрэг өөрчилнө.', 'd':' хоног', 'new':'шинэ',
  'Workspace':'Ажлын орчин', 'Panels':'Самбар', 'Approve, send back, mark (viewer)':'Батлах, буцаах, тэмдэглэх (харагч)', 'New':'Шинэ'
});

var WORKSPACES=[
  {id:'today', icon:'spark', label:'Today', views:['home','dash']},
  {id:'review', icon:'eye', label:'Review', views:['needs','review']},
  {id:'production', icon:'folder', label:'Production', views:['projects','project']},
  {id:'planning', icon:'cal', label:'Planning', views:['agency']},
  {id:'money', icon:'wallet', label:'Money', views:['finance']}
];
S.sel=[]; S.wsLast={}; S.hist=[]; S.layout={}; S.hidePanels=false; S.browseQ='';

// Which workspaces each person has: the same access rules as before, arranged by task
function wsList(){
  return WORKSPACES.filter(function(w){
    if(w.id==='money') return hasFinance();
    if(isPM()) return true;
    if(isExec()) return w.id==='today'||w.id==='production';
    return w.id==='today';
  });
}
function wsOf(view){ var w=WORKSPACES.filter(function(x){ return x.views.indexOf(view)>=0; })[0]; return w?w.id:(S.wsCur||'today'); }
function wsHome(id){
  if(S.wsLast[id]) return S.wsLast[id];
  return {today:isExec()?'dash':'home', review:'needs', production:'projects', planning:'agency', money:'finance'}[id];
}
function wsGo(id){
  var w=wsList().filter(function(x){ return x.id===id; })[0]; if(!w) return;
  // pressing the workspace you are already in goes back to its start, like a phone's tab bar
  if(id===wsOf(S.view)) S.wsLast[id]=null;
  S.trail=[]; S.sel=[]; go(wsHome(id));
}
function wsCount(id){
  if(id==='review') return S.tasks.filter(function(t){ return t.status==='review' && project(t.project).pm===S.me; }).length;
  return 0;
}
function wsSwitcher(){
  var list=wsList(); if(list.length<2) return '';
  var cur=wsOf(S.view);
  return '<nav class="tabs ws-switch" aria-label="'+esc(L('Workspaces'))+'">'+list.map(function(w,i){
    var n=wsCount(w.id);
    return '<button data-act="ws" data-ws="'+w.id+'"'+(w.id===cur?' aria-current="page"':'')+' title="'+esc(L(w.label))+' ('+(i+1)+')">'+esc(L(w.label))+(n?'<span class="count">'+n+'</span>':'')+'</button>';
  }).join('')+'</nav>';
}

// ---------- layout: per person, per workspace, on this device ----------
var LAYOUT_DEF={today:{left:false,insp:true,side:'left',w:'regular'}, review:{left:true,insp:true,side:'left',w:'regular'}, production:{left:true,insp:true,side:'left',w:'regular'}, planning:{left:true,insp:true,side:'left',w:'regular'}, money:{left:false,insp:true,side:'left',w:'regular'}};
function lay(ws){
  ws=ws||wsOf(S.view);
  if(!S.layout[ws]){ var saved=null; try{ saved=JSON.parse(localStorage.getItem('bo.layout.'+S.me+'.'+ws)||'null'); }catch(e){} S.layout[ws]=Object.assign({}, LAYOUT_DEF[ws]||LAYOUT_DEF.today, saved||{}); }
  return S.layout[ws];
}
function saveLay(ws){ try{ localStorage.setItem('bo.layout.'+S.me+'.'+ws, JSON.stringify(S.layout[ws])); }catch(e){} }
function hasLeft(ws){ return ws==='review'||ws==='production'||ws==='planning'; }

// ---------- the frame around a workspace's canvas ----------
function frameHtml(content, entering){
  var ws=wsOf(S.view), l=lay(ws), small=isSmall(), showLeft=hasLeft(ws)&&l.left&&!S.hidePanels, showInsp=l.insp&&!S.hidePanels;
  var cls='frame ws-'+ws+(S.hidePanels?' bare':'')+(l.side==='right'?' left-right':'')+' iw-'+l.w;
  var h='<div class="'+cls+'">';
  if(!small) h+=railHtml(ws);
  if(hasLeft(ws)) h+= showLeft&&!small ? '<aside class="panel lp" aria-label="'+esc(L(leftName(ws)))+'">'+panelHead(leftName(ws),'left')+'<div class="panel-b">'+leftHtml(ws)+'</div></aside>' : (!small&&!S.hidePanels?stripHtml(leftName(ws),'left'):'');
  h+='<div class="canvas" id="canvas">'+(small&&hasLeft(ws)?'<button class="btn ghost sm lp-open" data-act="lpdrawer">'+ICON.folder+esc(L(leftName(ws)))+'</button>':'')+'<main class="page'+(entering?' enter':'')+(S.view==='finance'?' wide':'')+'">'+content+'</main></div>';
  if(!small) h+= showInsp ? '<aside class="panel insp" aria-label="'+esc(L('Inspector'))+'">'+panelHead('Inspector','insp')+'<div class="panel-b" id="insp">'+inspectorHtml(ws)+'</div></aside>' : (!S.hidePanels?stripHtml('Inspector','insp'):'');
  h+='</div>';
  if(!small) h+=statusHtml(ws);
  else {
    if(S.sel.length===1) h+='<div class="sheet-ov" data-act="selclear"></div><div class="insp-sheet glass" role="dialog" aria-label="'+esc(L('Inspector'))+'"><div class="sheet-grip"></div><button class="icon-btn sm sheet-x" data-act="selclear" aria-label="'+esc(L('Close'))+'">'+ICON.x+'</button><div id="insp">'+inspectorHtml(ws)+'</div></div>';
    if(S.lpDrawer && hasLeft(ws)) h+='<div class="sheet-ov" data-act="lpdrawer"></div><aside class="lp-drawer glass">'+'<div class="panel-h"><b>'+esc(L(leftName(ws)))+'</b><button class="icon-btn sm" data-act="lpdrawer" aria-label="'+esc(L('Close'))+'">'+ICON.x+'</button></div><div class="panel-b">'+leftHtml(ws)+'</div></aside>';
    h+=bottomNav();
  }
  h+=selBars();
  return h;
}
function isSmall(){ return window.innerWidth<900; }
function leftName(ws){ return ws==='review'?'Review queue':ws==='planning'?'Team':'Browser'; }
function panelHead(name, which){
  var l=lay();
  return '<div class="panel-h"><b>'+esc(L(name))+'</b><span class="panel-tools">'+
    (which==='left'?'<button class="icon-btn sm" data-act="pside" title="'+esc(L('Move to the other side'))+'" aria-label="'+esc(L('Move to the other side'))+'">'+ICON.swap+'</button>':'<button class="icon-btn sm pw-btn" data-act="pwidth" title="'+esc(L('Panel width'))+'" aria-label="'+esc(L('Panel width'))+': '+esc(L(l.w==='narrow'?'Narrow':l.w==='wide'?'Wide':'Regular'))+'"><span class="pw pw-'+l.w+'"></span></button>')+
    '<button class="icon-btn sm" data-act="ptoggle" data-p="'+which+'" title="'+esc(L('Hide panel'))+'" aria-label="'+esc(L('Hide panel'))+'">'+ICON.x+'</button></span></div>';
}
function stripHtml(name, which){
  return '<button class="strip strip-'+which+'" data-act="ptoggle" data-p="'+which+'" title="'+esc(L('Show panel'))+': '+esc(L(name))+'" aria-label="'+esc(L('Show panel'))+': '+esc(L(name))+'"><span>'+esc(L(name))+'</span></button>';
}
function railHtml(ws){
  var tools=[['tool-select',ICON.cursor,L('Select tool'),'V',true]];
  var nk=newKind(ws); if(nk) tools.push(['tool-new',ICON.plus,nk.label,'N',false]);
  if(ws==='production'&&isPM()&&!S.readonly) tools.push(['newproj',ICON.folder,L('New project'),'',false]);
  tools.push(['palette',ICON.search,L('Search or jump to'),IS_MAC?'⌘K':'Ctrl K',false]);
  var r='<nav class="rail" aria-label="Tools">'+tools.map(function(t){ return '<button class="rail-b'+(t[4]?' on':'')+'" data-act="'+t[0]+'" title="'+esc(t[2])+(t[3]?' ('+t[3]+')':'')+'" aria-label="'+esc(t[2])+'"'+(t[4]?' aria-pressed="true"':'')+'>'+t[1]+'</button>'; }).join('');
  r+='<span class="rail-sp"></span><button class="rail-b" data-act="keys" title="'+esc(L('Shortcuts'))+' (?)" aria-label="'+esc(L('Shortcuts'))+'">'+ICON.key+'</button></nav>';
  return r;
}
function newKind(ws){
  if(S.readonly) return null;
  if(ws==='planning') return isPM()?{label:L('Add to planner'), run:function(){ openModal({kind:'event'}); }}:null;
  if(ws==='money') return FIN.unlocked?{label:L('Add transaction'), run:function(){ var b=document.createElement('button'); b.dataset.act='ftxnew'; finAction('ftxnew',b); }}:null;
  if(isExec()) return null;
  return {label:L('New task'), run:function(){ openModal({kind:'task', project:(S.view==='project'?S.project:((S.projects.filter(function(p){return p.pm===S.me;})[0]||S.projects[0]||{}).id)), due:iso(d(nextFriday()))}); }};
}
function bottomNav(){
  var list=wsList(); if(list.length<2) return '';
  var cur=wsOf(S.view);
  return '<nav class="bnav glass" aria-label="'+esc(L('Workspaces'))+'">'+list.map(function(w){ var n=wsCount(w.id); return '<button data-act="ws" data-ws="'+w.id+'"'+(w.id===cur?' aria-current="page"':'')+'>'+(ICON[w.icon]||ICON.spark)+'<span>'+esc(L(w.label))+'</span>'+(n?'<i class="bn-n">'+n+'</i>':'')+'</button>'; }).join('')+'</nav>';
}
function statusHtml(ws){
  var sync=S.mode==='demo'?L('Demo'):S.slow?L('Offline'):Object.keys(chains).length&&S.saving?L('Saving...'):L('Synced');
  var ctx='';
  if(ws==='money' && FIN.unlocked) ctx=perLabel();
  else if(ws==='planning'){ var dd=weekDays(S.wk*7); ctx=S.calView==='month'?'':md(dd[0])+' - '+md(dd[6]); }
  else if(S.view==='project') ctx=project(S.project).client;
  return '<footer class="statusbar"><span class="sb-i">'+esc(S.sel.length?L('{n} selected',{n:S.sel.length}):L('Nothing selected'))+'</span><span class="sb-i"><i class="sb-dot'+(S.slow?' off':'')+'"></i>'+esc(sync)+'</span>'+(ctx?'<span class="sb-i">'+esc(ctx)+'</span>':'')+
    '<span class="sb-sp"></span><button class="sb-b" data-act="history">'+esc(L('History'))+(S.hist.length?' <b>'+S.hist.length+'</b>':'')+'</button><button class="sb-b" data-act="resetlay">'+esc(L('Reset workspace'))+'</button><button class="sb-b" data-act="keys">? '+esc(L('Shortcuts'))+'</button></footer>';
}

// ---------- left panels ----------
function leftHtml(ws){
  if(ws==='review'){
    var mineP=function(t){ return project(t.project).pm===S.me; };
    var q=S.tasks.filter(function(t){ return t.status==='review'; }).sort(function(a,b){ return (mineP(b)-mineP(a)) || String((last(a)||{}).date||'').localeCompare(String((last(b)||{}).date||'')); });
    if(!q.length) return '<p class="muted s13 pad">'+esc(L('Nothing waiting for you. The team is heads down.'))+'</p>';
    return '<div class="plist">'+q.map(function(t){ var p=project(t.project), v=last(t), n=v?-days(v.date):0;
      return '<button class="pl-r" data-act="openreview" data-id="'+esc(t.id)+'"><span class="pdot" style="background:'+esc(p.color)+'"></span><span class="pl-m"><b>'+esc(t.title)+'</b><span class="muted">'+esc(p.client+' · '+person(t.who).name)+'</span></span><span class="chip '+(n>=3?'warn':'')+'">'+esc(n?n+L('d'):L('new'))+'</span></button>'; }).join('')+'</div>';
  }
  if(ws==='planning'){
    var dd=weekDays(S.wk*7), a=iso(dd[0]), b=iso(dd[6]), ev=allEvents();
    return '<div class="plist">'+S.people.map(function(p){ var n=active(p.id), e=ev.filter(function(x){ return x.date>=a && x.date<=b && (x.who==='all'||(x.who||[]).indexOf(p.id)>=0); }).length;
      return '<button class="pl-r" data-act="selperson" data-id="'+esc(p.id)+'">'+av(p)+'<span class="pl-m"><b>'+esc(p.name)+'</b><span class="muted">'+esc(L(ROLES[p.role]||p.role))+'</span></span><span class="pl-n" title="'+esc(L('Active tasks'))+'">'+n+'</span><span class="pl-n quiet" title="'+esc(L('Events this week'))+'">'+e+'</span></button>'; }).join('')+'</div>';
  }
  // production: projects as bins by client
  var q2=nrm(S.browseQ), live=S.projects.filter(function(p){ return !p.archived && (!q2 || nrm(p.client+' '+p.name).indexOf(q2)>=0); });
  var by={}; live.forEach(function(p){ (by[p.client]=by[p.client]||[]).push(p); });
  var h='<div class="pl-search"><input class="input sm" id="browseq" placeholder="'+esc(L('Search projects'))+'" value="'+esc(S.browseQ)+'" aria-label="'+esc(L('Search projects'))+'"></div>';
  h+='<button class="pl-r'+(S.view==='projects'?' cur':'')+'" data-act="go" data-v="projects" data-nosel="1">'+ICON.folder+'<span class="pl-m"><b>'+esc(L('All projects'))+'</b></span><span class="pl-n">'+live.length+'</span></button>';
  Object.keys(by).sort(function(x,y){ return x.localeCompare(y); }).forEach(function(c){
    h+='<div class="pl-group">'+esc(c)+'</div>'+by[c].map(function(p){ var ts=S.tasks.filter(function(t){ return t.project===p.id; }), dn=ts.filter(function(t){ return t.status==='done'; }).length;
      return '<button class="pl-r'+(S.view==='project'&&S.project===p.id?' cur':'')+'" data-act="openproj" data-id="'+esc(p.id)+'" data-nosel="1"><span class="pdot" style="background:'+esc(p.color)+'"></span><span class="pl-m"><b>'+esc(p.name||p.client)+'</b><span class="muted">'+esc(dn+'/'+ts.length)+' · <span class="pl-st '+(TONE[projStatus(p.id)]||'')+'"><span class="dot"></span>'+esc(L(STATUS[projStatus(p.id)]))+'</span></span></span></button>'; }).join('');
  });
  return h;
}

// ---------- selection ----------
// Existing rows already say what they are (data-act + data-id); the frame reads that, so every list joins the same model
var SEL_KIND={info:'task', openreview:'task', evauto:'task', openproj:'project', editevent:'event', selperson:'person', ftxedit:'tx', fdeal:'deal'};
function selKey(k,id){ return k+':'+id; }
function isSel(k,id){ return S.sel.some(function(s){ return s.k===k && s.id===id; }); }
function selectEl(el, ev){
  var k=SEL_KIND[el.dataset.act], id=el.dataset.id; if(!k||!id) return false;
  if(ev && (ev.shiftKey||ev.metaKey||ev.ctrlKey) && S.sel.length && S.sel[0].k===k){
    if(ev.shiftKey){ var all=selectables(k), a=all.findIndex(function(x){ return x.dataset.id===S.sel[S.sel.length-1].id; }), b=all.findIndex(function(x){ return x===el; });
      if(a>=0&&b>=0){ var lo=Math.min(a,b), hi=Math.max(a,b); all.slice(lo,hi+1).forEach(function(x){ if(!isSel(k,x.dataset.id)) S.sel.push({k:k,id:x.dataset.id}); }); } }
    else if(isSel(k,id)) S.sel=S.sel.filter(function(s){ return !(s.k===k&&s.id===id); });
    else S.sel.push({k:k,id:id});
  } else S.sel=[{k:k,id:id}];
  render(); return true;
}
function selectables(k){
  var acts=Object.keys(SEL_KIND).filter(function(a){ return SEL_KIND[a]===k; });
  var root=document.getElementById('canvas')||document;
  var seen={}, out=[];
  Array.prototype.forEach.call(root.querySelectorAll(acts.map(function(a){ return '[data-act="'+a+'"][data-id]'; }).join(',')), function(x){ if(x.dataset.nosel||seen[x.dataset.id]) return; seen[x.dataset.id]=1; out.push(x); });
  return out;
}
function openSel(){
  if(S.sel.length!==1) return;
  var s=S.sel[0], el=document.querySelector('#canvas [data-id="'+cssEsc(s.id)+'"][data-act]')||document.querySelector('[data-id="'+cssEsc(s.id)+'"][data-act]');
  if(s.k==='task'){ var t=task(s.id); if(!t) return; if(t.versions.length){ S.task=t.id; S.ver=null; pushGo('review'); } else openTask(t); return; }
  if(s.k==='project'){ S.project=s.id; pushGo('project'); return; }
  if(s.k==='person'){ openModal({kind:'task', who:s.id, project:((S.projects.filter(function(p){return p.pm===S.me;})[0]||S.projects[0]||{}).id), due:iso(d(nextFriday()))}); return; }
  if(el){ S.bypass=true; el.click(); S.bypass=false; }
}
function cssEsc(s){ return String(s).replace(/["\\]/g,'\\$&'); }
// After every render: mark what is selected, and place the task bar beside it
function shellAfter(){
  var sels=document.querySelectorAll('.is-sel'); Array.prototype.forEach.call(sels,function(x){ x.classList.remove('is-sel'); x.removeAttribute('aria-selected'); });
  S.sel.forEach(function(s){
    Object.keys(SEL_KIND).filter(function(a){ return SEL_KIND[a]===s.k; }).forEach(function(a){
      Array.prototype.forEach.call(document.querySelectorAll('#canvas [data-act="'+a+'"][data-id="'+cssEsc(s.id)+'"], .lp [data-act="'+a+'"][data-id="'+cssEsc(s.id)+'"]'), function(x){ var r=x.closest('.rw')||x; r.classList.add('is-sel'); x.setAttribute('aria-selected','true'); });
    });
  });
  placeTaskBar();
}
function placeTaskBar(){
  var cv=document.getElementById('canvas'), ab=document.querySelector('.actionbar');
  if(ab&&cv&&!isSmall()){ var cr=cv.getBoundingClientRect(); ab.style.setProperty('--ab-x', (cr.left+cr.width/2)+'px'); }
  var bar=document.getElementById('taskbar'); if(!bar||!cv) return;
  var target=document.querySelector('#canvas .is-sel');
  if(!target){ bar.style.visibility='hidden'; return; }
  var r=target.getBoundingClientRect(), c=cv.getBoundingClientRect(), bw=bar.offsetWidth, bh=bar.offsetHeight;
  // hang the bar from the selected item's bottom edge, so it reads as part of it even in tight lists
  var top=r.bottom-6, left=Math.min(Math.max(r.right-bw-12, c.left+12), c.right-bw-12);
  if(top+bh>c.bottom-12) top=r.top-bh+6;
  if(top<c.top+8 || r.bottom<c.top || r.top>c.bottom){ bar.style.visibility='hidden'; return; }
  bar.style.visibility='visible'; bar.style.top=top+'px'; bar.style.left=left+'px';
}
document.addEventListener('scroll', function(e){ if(e.target && e.target.id==='canvas') requestAnimationFrame(placeTaskBar); }, true);
window.addEventListener('resize', function(){ var was=S._small, now=isSmall(); S._small=now; if(S.me && was!==now) render(); else placeTaskBar(); });

// ---------- task bar (one selected) and action bar (several) ----------
function canEditTask(t){ return !S.readonly && t && (isPM() || t.who===S.me || t.by===S.me); }
function selBars(){
  if(!S.sel.length || isSmall()&&S.sel.length===1) return '';
  if(S.sel.length===1){
    var acts=taskBarActs(S.sel[0]); if(!acts.length) return '';
    return '<div class="taskbar glass" id="taskbar" role="toolbar" aria-label="'+esc(L('Actions'))+'" style="visibility:hidden">'+acts.map(function(a){ return '<button class="tb-b'+(a.primary?' primary':'')+'" '+a.attrs+'>'+esc(a.label)+(a.key?'<kbd>'+esc(a.key)+'</kbd>':'')+'</button>'; }).join('')+'</div>';
  }
  var k=S.sel[0].k, n=S.sel.length, h='<div class="actionbar glass" role="toolbar" aria-label="'+esc(L('{n} selected',{n:n}))+'"><b class="ab-n">'+esc(L('{n} selected',{n:n}))+'</b>';
  if(k==='task' && !S.readonly){
    h+='<label class="ab-f"><span>'+esc(L('Reassign'))+'</span><select class="input sm" id="ab-who"><option value=""></option>'+S.people.filter(function(p){ return p.role!=='exec'; }).map(function(p){ return '<option value="'+esc(p.id)+'">'+esc(p.name)+'</option>'; }).join('')+'</select></label>';
    h+='<label class="ab-f"><span>'+esc(L('Move due date'))+'</span><input class="input sm" type="date" id="ab-due"></label>';
    if(isPM()) h+='<button class="btn sm ghost" data-act="abdel">'+esc(L('Delete'))+'</button>';
  }
  if(k==='tx' && FIN.unlocked){
    var txs=S.sel.map(function(s){ return FIN.data.fin_tx.filter(function(t){ return t.id===s.id; })[0]; }).filter(Boolean), ty=txs.length&&txs.every(function(t){ return t.type===txs[0].type; })?txs[0].type:null;
    if(ty && ty!=='move') h+='<label class="ab-f"><span>'+esc(L('Change category'))+'</span><select class="input sm" id="ab-cat"><option value=""></option>'+(ty==='in'?FIN_IN:FIN_OUT).map(function(c){ return '<option value="'+c.k+'">'+esc(LANG==='mn'?c.mn:c.en)+'</option>'; }).join('')+'</select></label>';
    h+='<label class="ab-f"><span>'+esc(L('Link to job'))+'</span><select class="input sm" id="ab-job"><option value=""></option><option value="-">'+esc(L('No job'))+'</option>'+FIN.data.fin_deals.slice().sort(function(a,b){ return String(b.date).localeCompare(String(a.date)); }).slice(0,60).map(function(d){ return '<option value="'+esc(d.id)+'">'+esc(d.client+' · '+dshort(d.date))+'</option>'; }).join('')+'</select></label>';
    if(ty==='in') h+='<button class="btn sm ghost" data-act="abvat">'+esc(L('Mark VAT filed'))+'</button>';
  }
  h+='<button class="btn sm ghost" data-act="selclear">'+esc(L('Clear'))+' <kbd>Esc</kbd></button></div>';
  return h;
}
function taskBarActs(s){
  var out=[];
  if(s.k==='task'){ var t=task(s.id); if(!t) return out;
    var vb=S.readonly?null:verb(t);
    if(t.versions.length) out.push({label:L(t.status==='review'&&isPM()?'Review':'Open viewer'), attrs:'data-act="openreview" data-id="'+esc(t.id)+'" data-nosel="1"', primary:t.status==='review'&&isPM(), key:'Space'});
    if(vb) out.push({label:vb.label, attrs:'data-act="'+vb.act+'" data-id="'+esc(t.id)+'"', primary:!(t.status==='review'&&isPM())});
    out.push({label:L('Open thread'), attrs:'data-act="thread" data-id="'+esc(t.id)+'"'});
  }
  if(s.k==='project'){ out.push({label:L('Open'), attrs:'data-act="openproj" data-id="'+esc(s.id)+'" data-nosel="1"', primary:true, key:'↵'}); if(!S.readonly) out.push({label:L('New task'), attrs:'data-act="newtask" data-proj="'+esc(s.id)+'"'}); }
  if(s.k==='event' && isPM() && !S.readonly) out.push({label:L('Edit all fields'), attrs:'data-act="editevent" data-id="'+esc(s.id)+'" data-nosel="1"', primary:true, key:'↵'});
  if(s.k==='person' && !S.readonly && !isExec()) out.push({label:L('Assign a task'), attrs:'data-act="selopen"', primary:true, key:'↵'});
  if(s.k==='tx') out.push({label:L('Edit all fields'), attrs:'data-act="ftxedit" data-id="'+esc(s.id)+'" data-nosel="1"', primary:true, key:'↵'});
  if(s.k==='deal') out.push({label:L('Open'), attrs:'data-act="fdeal" data-id="'+esc(s.id)+'" data-nosel="1"', primary:true, key:'↵'});
  return out;
}

// ---------- the inspector ----------
function insRow(label, inner){ return '<div class="ins-r"><span class="ins-l">'+esc(label)+'</span><div class="ins-v">'+inner+'</div></div>'; }
function insSec(name, body, open){ return '<details class="ins-s"'+(open===false?'':' open')+'><summary>'+esc(name)+'</summary><div class="ins-sb">'+body+'</div></details>'; }
function inspectorHtml(ws){
  if(S.sel.length>1) return '<div class="ins-empty"><b>'+esc(L('{n} selected',{n:S.sel.length}))+'</b><p class="muted s13">'+esc(L('Use the bar at the bottom to change them together.'))+'</p></div>';
  if(S.sel.length===1){ var s=S.sel[0], f={task:insTask, project:insProject, event:insEvent, person:insPerson, tx:insTx, deal:insDeal}[s.k]; if(f){ var out=f(s.id); if(out) return out; } }
  if(ws==='production' && S.view==='project') return insProject(S.project, true);
  return insSummary(ws);
}
function insHead(color, kicker, title){ return '<div class="ins-h">'+(color?'<span class="pdot" style="background:'+esc(color)+'"></span>':'')+'<span class="eyebrow">'+esc(kicker)+'</span><h3>'+esc(title)+'</h3></div>'; }
function insTask(id){
  var t=task(id); if(!t) return '';
  var p=project(t.project), ed=canEditTask(t), dis=ed?'':' disabled', v=last(t), due=dueLabel(t.due);
  var people=S.people.filter(function(x){ return x.role!=='exec'; });
  var h=insHead(p.color, p.client, t.title);
  h+='<div class="ins-state">'+chip(t.status)+'<span class="muted s13">'+esc(sentence(t))+'</span></div>';
  if(v) h+='<button class="ins-prev" data-act="openreview" data-id="'+esc(t.id)+'" data-nosel="1" aria-label="'+esc(L('Open the work full size'))+'">'+coverHtml(t)+'<span class="tag">v'+t.versions.length+'</span></button>';
  h+=insSec(L('Properties'),
    insRow(L('Title'), '<input class="input sm" data-ins="task:'+esc(t.id)+':title" value="'+esc(t.title)+'"'+dis+'>')+
    insRow(L('Assignee'), '<select class="input sm" data-ins="task:'+esc(t.id)+':who"'+dis+'>'+people.map(function(x){ return '<option value="'+esc(x.id)+'"'+(x.id===t.who?' selected':'')+'>'+esc(x.name)+'</option>'; }).join('')+'</select>')+
    insRow(L('Due'), '<input class="input sm" type="date" data-ins="task:'+esc(t.id)+':due" value="'+esc(t.due||'')+'"'+dis+'><span class="chip '+due.tone+'">'+esc(due.t)+'</span>')+
    insRow(L('Project'), '<select class="input sm" data-ins="task:'+esc(t.id)+':project"'+dis+'>'+S.projects.filter(function(x){ return !x.archived||x.id===t.project; }).map(function(x){ return '<option value="'+esc(x.id)+'"'+(x.id===t.project?' selected':'')+'>'+esc(x.client+(x.name?': '+x.name:''))+'</option>'; }).join('')+'</select>')+
    (t.shoot?insRow(L('Place'), '<input class="input sm" data-ins="task:'+esc(t.id)+':shoot" value="'+esc(t.shoot)+'"'+dis+'>'):''));
  h+=insSec(L('Brief'), '<textarea class="input sm" rows="4" data-ins="task:'+esc(t.id)+':brief"'+dis+' placeholder="'+esc(L('What, for whom, must-haves, reference links'))+'">'+esc(t.brief||'')+'</textarea>');
  if(v) h+=insSec(L('Last version'), insRow(L('Sent by'), esc(person(t.who).name))+insRow(L('Date'), esc(short(v.date)))+(v.comments&&v.comments.length?insRow(L('Notes'), esc(String(v.comments.length))):'')+((v.files||[]).filter(function(f){ return safeUrl(f.url); }).map(function(f){ return '<a class="ins-link" href="'+esc(safeUrl(f.url))+'" target="_blank" rel="noopener">'+ICON.link+esc(f.name||L('Drive link'))+'</a>'; }).join('')));
  h+=insSec(L('Thread'), '<p class="muted s13">'+esc((t.thread||[]).length?L('{n} messages',{n:t.thread.length}):L('No messages yet.'))+'</p><button class="btn sm" data-act="thread" data-id="'+esc(t.id)+'">'+ICON.chat+esc(L('Open thread'))+'</button>', true);
  h+='<div class="ins-a">'+(ed?'<button class="btn sm ghost" data-act="info" data-id="'+esc(t.id)+'" data-nosel="1">'+esc(L('Edit all fields'))+'</button>':'')+(isPM()&&!S.readonly?'<button class="btn sm ghost danger" data-act="insdel" data-id="'+esc(t.id)+'">'+esc(L('Delete'))+'</button>':'')+'</div>';
  return h;
}
function insProject(id, implicit){
  var p=project(id); if(!p.id) return '';
  var ed=isPM()&&!S.readonly, dis=ed?'':' disabled', ts=S.tasks.filter(function(t){ return t.project===p.id; }), dn=ts.filter(function(t){ return t.status==='done'; }).length;
  var pms=S.people.filter(function(x){ return x.role==='pm'; });
  var h=insHead(p.color, L('Project'), p.client+(p.name?': '+p.name:''));
  h+='<div class="ins-state">'+chip(projStatus(p.id))+'<span class="muted s13">'+esc(L('{a}/{b} done',{a:dn,b:ts.length}))+'</span></div>'+wavy(ts.length?dn/ts.length:0, '');
  h+=insSec(L('Properties'),
    insRow(L('Client'), '<input class="input sm" data-ins="project:'+esc(p.id)+':client" value="'+esc(p.client||'')+'"'+dis+'>')+
    insRow(L('Project'), '<input class="input sm" data-ins="project:'+esc(p.id)+':name" value="'+esc(p.name||'')+'"'+dis+'>')+
    insRow('PM', '<select class="input sm" data-ins="project:'+esc(p.id)+':pm"'+dis+'>'+pms.map(function(x){ return '<option value="'+esc(x.id)+'"'+(x.id===p.pm?' selected':'')+'>'+esc(x.name)+'</option>'; }).join('')+'</select>')+
    insRow(L('Final deadline'), '<input class="input sm" type="date" data-ins="project:'+esc(p.id)+':deadline" value="'+esc(p.deadline||'')+'"'+dis+'>')+
    insRow(L('Contact'), '<input class="input sm" data-ins="project:'+esc(p.id)+':contact" value="'+esc(p.contact||'')+'"'+dis+'>')+
    insRow(L('Drive folder'), '<input class="input sm" data-ins="project:'+esc(p.id)+':drive" value="'+esc(p.drive||'')+'" inputmode="url"'+dis+'>'+(safeUrl(p.drive)?'<a class="icon-btn sm" href="'+esc(safeUrl(p.drive))+'" target="_blank" rel="noopener" aria-label="'+esc(L('Open Drive folder'))+'">'+ICON.link+'</a>':'')));
  h+=insSec(L('Brief'), '<textarea class="input sm" rows="5" data-ins="project:'+esc(p.id)+':brief"'+dis+'>'+esc(p.brief||'')+'</textarea>');
  var team={}; ts.forEach(function(t){ if(t.status!=='done') team[t.who]=(team[t.who]||0)+1; });
  if(Object.keys(team).length) h+=insSec(L('Team'), Object.keys(team).map(function(w){ return '<div class="ins-person">'+av(person(w))+'<span>'+esc(person(w).name)+'</span><span class="muted s13">'+team[w]+'</span></div>'; }).join(''));
  h+='<div class="ins-a">'+(implicit?'':'<button class="btn sm" data-act="openproj" data-id="'+esc(p.id)+'" data-nosel="1">'+esc(L('Open'))+'</button>')+(S.readonly?'':'<button class="btn sm ghost" data-act="newtask" data-proj="'+esc(p.id)+'">'+ICON.plus+esc(L('New task'))+'</button>')+(ed?'<button class="btn sm ghost" data-act="editproj" data-id="'+esc(p.id)+'">'+esc(L('Edit all fields'))+'</button>':'')+'</div>';
  return h;
}
function insEvent(id){
  var e=S.events.filter(function(x){ return x.id===id; })[0]; if(!e) return '';
  var ed=isPM()&&!S.readonly, dis=ed?'':' disabled', k=KINDS[e.kind]||KINDS.meeting;
  var h=insHead(k.color, L(k.label), e.title);
  h+=insSec(L('Properties'),
    insRow(L('Title'), '<input class="input sm" data-ins="event:'+esc(e.id)+':title" value="'+esc(e.title)+'"'+dis+'>')+
    insRow(L('Kind'), '<select class="input sm" data-ins="event:'+esc(e.id)+':kind"'+dis+'>'+Object.keys(KINDS).filter(function(x){ return x!=='shoot'; }).map(function(x){ return '<option value="'+x+'"'+(x===e.kind?' selected':'')+'>'+esc(L(KINDS[x].label))+'</option>'; }).join('')+'</select>')+
    insRow(L('Date'), '<input class="input sm" type="date" data-ins="event:'+esc(e.id)+':date" value="'+esc(e.date)+'"'+dis+'>')+
    insRow(L('Time'), '<input class="input sm" type="time" data-ins="event:'+esc(e.id)+':time" value="'+esc(e.time||'')+'"'+dis+'>')+
    insRow(L('Place'), '<input class="input sm" data-ins="event:'+esc(e.id)+':place" value="'+esc(e.place||'')+'"'+dis+'>')+
    insRow(L('Who'), '<span class="s13">'+esc(whoLine(e))+'</span>'));
  if(ed) h+='<div class="ins-a"><button class="btn sm" data-act="editevent" data-id="'+esc(e.id)+'" data-nosel="1">'+esc(L('Edit all fields'))+'</button><button class="btn sm ghost danger" data-act="insdelev" data-id="'+esc(e.id)+'">'+esc(L('Delete'))+'</button></div>';
  return h;
}
function insPerson(id){
  var p=person(id); if(!p.id) return '';
  var mine=S.tasks.filter(function(t){ return t.who===p.id && t.status!=='done'; }).sort(function(a,b){ return String(a.due).localeCompare(String(b.due)); });
  var dd=weekDays(S.wk*7), a=iso(dd[0]), b=iso(dd[6]), ev=allEvents().filter(function(x){ return x.date>=a && x.date<=b && (x.who==='all'||(x.who||[]).indexOf(p.id)>=0); });
  var h='<div class="ins-h ins-ph">'+av(p,'av-lg')+'<div><span class="eyebrow">'+esc(L(ROLES[p.role]||p.role))+'</span><h3>'+esc(p.name)+'</h3></div></div>';
  h+=insSec(L('Active tasks')+' · '+mine.length, mine.length?mine.map(function(t){ var due=dueLabel(t.due); return '<button class="ins-item" data-act="info" data-id="'+esc(t.id)+'"><b>'+esc(t.title)+'</b><span class="muted">'+esc(project(t.project).client)+' · <span class="'+(due.tone==='red'?'red':'')+'">'+esc(due.t)+'</span></span></button>'; }).join(''):'<p class="muted s13">0</p>');
  h+=insSec(L('This week')+' · '+ev.length, ev.length?ev.map(function(e){ return '<div class="ins-ev" style="--k:'+(KINDS[e.kind]||KINDS.meeting).color+'"><b>'+esc(dshort(e.date)+(e.time?' '+e.time:''))+'</b> '+esc(e.title)+'</div>'; }).join(''):'<p class="muted s13">0</p>');
  if(!S.readonly && !isExec()) h+='<div class="ins-a"><button class="btn sm" data-act="selopen">'+ICON.plus+esc(L('Assign a task'))+'</button></div>';
  return h;
}
function insTx(id){
  if(!FIN.unlocked) return '';
  var t=FIN.data.fin_tx.filter(function(x){ return x.id===id; })[0]; if(!t) return '';
  var cats=t.type==='in'?FIN_IN:t.type==='out'?FIN_OUT:[FIN_MOVE], ro=S.readonly?' disabled':'';
  var h=insHead(fcatColor(t.cat), (t.type==='in'?'+':t.type==='out'?'-':'')+money(t.amount), t.note||fcatName(t.cat));
  h+=insSec(L('Properties'),
    insRow(L('Date'), esc(t.date))+
    insRow(L('Category'), '<select class="input sm" data-ins="tx:'+esc(t.id)+':cat"'+ro+'>'+cats.map(function(c){ return '<option value="'+c.k+'"'+(c.k===t.cat?' selected':'')+'>'+esc(LANG==='mn'?c.mn:c.en)+'</option>'; }).join('')+'</select>')+
    (t.type!=='move'?insRow(L('Job'), '<select class="input sm" data-ins="tx:'+esc(t.id)+':deal"'+ro+'><option value="">'+esc(L('No job'))+'</option>'+FIN.data.fin_deals.slice().sort(function(a,b){ return String(b.date).localeCompare(String(a.date)); }).slice(0,60).map(function(d){ return '<option value="'+esc(d.id)+'"'+(d.id===t.deal?' selected':'')+'>'+esc(d.client+' · '+dshort(d.date))+'</option>'; }).join('')+'</select>'):'')+
    (t.client?insRow(L('Client'), esc(t.client)):'')+
    (t.type!=='move'?insRow(L('VAT'), '<select class="input sm" data-ins="tx:'+esc(t.id)+':'+(t.type==='in'?'vat':'receipt')+'"'+ro+'>'+[['none',L('Not needed')],['todo',t.type==='in'?L('To file'):F('Ирээгүй','Not yet')],['done',t.type==='in'?L('Filed'):F('Ирсэн','Received')]].map(function(o){ var cur=t.type==='in'?t.vat:t.receipt; return '<option value="'+o[0]+'"'+((cur||'none')===o[0]?' selected':'')+'>'+esc(o[1])+'</option>'; }).join('')+'</select>'):''));
  h+='<div class="ins-a"><button class="btn sm" data-act="ftxedit" data-id="'+esc(t.id)+'" data-nosel="1">'+esc(L('Edit all fields'))+'</button></div>';
  return h;
}
function insDeal(id){
  if(!FIN.unlocked) return '';
  var d0=FIN.data.fin_deals.filter(function(x){ return x.id===id; })[0]; if(!d0) return '';
  var fin=dealFinal(d0), paid=dealPaid(d0), cost=dealCosts(d0);
  var h=insHead('', dshort(d0.date)+(d0.work?' · '+d0.work:''), d0.client+(d0.title?': '+d0.title:''));
  h+='<div class="ins-state"><span class="chip">'+esc(dealStLabel(d0.status||(fin-paid<=0.5?'paid':'active')))+'</span></div>';
  h+=insSec(L('Properties'), insRow(L('Contract'), esc(money(d0.amount)))+(fin!==+d0.amount?insRow(F('Эцсийн','Final'), '<span class="red">'+esc(money(fin))+'</span>'):'')+insRow(L('Received'), '<span class="pos">'+esc(money(paid))+'</span>')+insRow(L('Owed'), '<span class="owed">'+esc(money(Math.max(0,fin-paid)))+'</span>')+insRow(L('Costs'), esc(money(cost)))+insRow(L('Profit'), '<b>'+esc(money(paid-cost))+'</b>'));
  var cl=dealCostList(d0);
  if(cl.length) h+=insSec(L('Costs')+' · '+cl.length, cl.map(function(t){ return '<div class="ins-r"><span class="ins-l">'+esc(t.date.slice(5))+'</span><div class="ins-v"><span class="s13">'+esc((t.note||fcatName(t.cat)).slice(0,40))+'</span><b class="s13">'+esc(money(t.amount))+'</b></div></div>'; }).join(''), false);
  h+='<div class="ins-a"><button class="btn sm" data-act="fdeal" data-id="'+esc(d0.id)+'" data-nosel="1">'+esc(L('Open'))+'</button></div>';
  return h;
}
function fcatColor(k){ var c=FIN_IN.concat(FIN_OUT,[FIN_MOVE]).filter(function(x){ return x.k===k; })[0]; return c?c.c:''; }
function insSummary(ws){
  var stat=function(label, val, cls){ return '<div class="ins-stat"><b class="'+(cls||'')+'">'+esc(String(val))+'</b><span>'+esc(label)+'</span></div>'; };
  var h='<div class="ins-empty"><p class="muted s13">'+esc(L('Select something to see its details here.'))+' '+esc(L('Double-click or Enter opens it.'))+'</p></div><div class="ins-stats">';
  if(ws==='today' && isExec()) ws='production';
  if(ws==='today'){
    var mine=S.tasks.filter(function(t){ return t.who===S.me && t.status!=='done'; }), nx=mine.filter(function(t){ return t.status!=='review'; }).sort(function(a,b){ return String(a.due).localeCompare(String(b.due)); })[0];
    h+=stat(L('Active tasks'), mine.filter(function(t){ return t.status!=='review'; }).length)+stat(L('Waiting for review'), mine.filter(function(t){ return t.status==='review'; }).length)+stat(L('Events today'), allEvents().filter(function(e){ return e.date===iso(TODAY) && forMe(e); }).length)+(nx?stat(L('Next deadline'), dueLabel(nx.due).t, dueLabel(nx.due).tone==='red'?'red':''):'');
  } else if(ws==='review'){
    var q=S.tasks.filter(function(t){ return t.status==='review' && project(t.project).pm===S.me; }), old=q.reduce(function(m,t){ var v=last(t); return Math.max(m, v?-days(v.date):0); },0);
    h+=stat(L('Waiting'), q.length, q.length?'warn-t':'')+stat(L('Oldest wait'), old?L('waited {n} days',{n:old}):'0', old>=3?'warn-t':'');
  } else if(ws==='production'){
    h+=stat(L('Active projects'), S.projects.filter(function(p){ return !p.archived && !p.delivered; }).length)+stat(L('Delivered'), S.projects.filter(function(p){ return p.delivered; }).length)+stat(L('Archived'), S.projects.filter(function(p){ return p.archived; }).length);
  } else if(ws==='planning'){
    var dd=weekDays(S.wk*7), a=iso(dd[0]), b=iso(dd[6]), ev=allEvents().filter(function(e){ return e.date>=a && e.date<=b; });
    var busy=S.people.slice().sort(function(x,y){ return active(y.id)-active(x.id); })[0];
    h+=stat(L('Events this week'), ev.length)+stat(L('Shoots'), ev.filter(function(e){ return e.kind==='shoot'; }).length)+(busy?stat(L('Busiest'), busy.name+' · '+active(busy.id)):'');
  } else if(ws==='money'){
    if(!FIN.unlocked) h+=stat(L('Money'), L('Locked'));
    else { var list=FIN.data.fin_tx.filter(function(t){ return inPer(t.date); }), inn=list.filter(function(t){ return t.type==='in'; }).reduce(function(s,t){ return s+(+t.amount||0); },0), out=list.filter(function(t){ return t.type==='out'; }).reduce(function(s,t){ return s+(+t.amount||0); },0);
      h+=stat(L('Money in'), moneyShort(inn), 'pos')+stat(L('Money out'), moneyShort(out))+stat(L('Net'), moneyShort(inn-out), inn-out<0?'red':'pos'); }
  }
  return h+'</div>';
}

// ---------- editing from the inspector: change commits, undo lives in History ----------
document.addEventListener('change', function(e){
  var el=e.target;
  if(el.dataset && el.dataset.ins){
    var parts=el.dataset.ins.split(':'), k=parts[0], id=parts[1], f=parts[2], v=el.value;
    if(k==='task'){ var t=task(id); if(!canEditTask(t)) return; if(f==='title'&&!v.trim()) { el.value=t.title; return; } var was=t[f]; t[f]=f==='title'?v.trim():v; persist('tasks',t); logChange(L('Task saved'), function(){ t[f]=was; persist('tasks',t); }); }
    else if(k==='project'){ var p=project(id); if(!isPM()||S.readonly) return; if(f==='client'&&!v.trim()){ el.value=p.client; return; } var wasP=p[f]; p[f]=f==='drive'?safeUrl(v):v; persist('projects',p); logChange(L('Project saved'), function(){ p[f]=wasP; persist('projects',p); }); }
    else if(k==='event'){ var ev=S.events.filter(function(x){ return x.id===id; })[0]; if(!ev||!isPM()||S.readonly) return; var wasE=ev[f]; ev[f]=v; persist('events',ev); logChange(L('Saved'), function(){ ev[f]=wasE; persist('events',ev); }); }
    else if(k==='tx'){ var tx=FIN.data.fin_tx.filter(function(x){ return x.id===id; })[0]; if(!tx||S.readonly) return; var wasT=tx[f]; tx[f]=v; fpersist('fin_tx',tx); logChange(L('Saved'), function(){ tx[f]=wasT; fpersist('fin_tx',tx); }); }
    render(); return;
  }
  if(el.id==='ab-who' && el.value){ var n=0, back=[]; S.sel.forEach(function(s){ var t=task(s.id); if(canEditTask(t)){ back.push([t,t.who]); t.who=el.value; persist('tasks',t); n++; } }); logChange(L('Updated {n} items',{n:n}), function(){ back.forEach(function(b){ b[0].who=b[1]; persist('tasks',b[0]); }); }, true); render(); return; }
  if(el.id==='ab-due' && el.value){ var n2=0, back2=[]; S.sel.forEach(function(s){ var t=task(s.id); if(canEditTask(t)){ back2.push([t,t.due]); t.due=el.value; persist('tasks',t); n2++; } }); logChange(L('Updated {n} items',{n:n2}), function(){ back2.forEach(function(b){ b[0].due=b[1]; persist('tasks',b[0]); }); }, true); render(); return; }
  if(el.id==='ab-cat' && el.value){ bulkTx(function(t){ return ['cat', el.value]; }); return; }
  if(el.id==='ab-job' && el.value){ bulkTx(function(t){ return t.type==='move'?null:['deal', el.value==='-'?'':el.value]; }); return; }
});
function bulkTx(fn){
  var back=[], n=0;
  S.sel.forEach(function(s){ var t=FIN.data.fin_tx.filter(function(x){ return x.id===s.id; })[0]; if(!t) return; var c=fn(t); if(!c) return; back.push([t,c[0],t[c[0]]]); t[c[0]]=c[1]; fpersist('fin_tx',t); n++; });
  logChange(L('Updated {n} items',{n:n}), function(){ back.forEach(function(b){ b[0][b[1]]=b[2]; fpersist('fin_tx',b[0]); }); }, true); render();
}
document.addEventListener('input', function(e){ if(e.target.id==='browseq'){ S.browseQ=e.target.value; render(); } });

// ---------- History: every change this session, with undo where it exists ----------
var _toast=toast;
toast=function(m, undo){ S.hist.unshift({m:m, at:new Date(), undo:undo||null}); if(S.hist.length>40) S.hist.pop(); _toast(m, undo); };
function logChange(m, undo, loud){ S.hist.unshift({m:m, at:new Date(), undo:undo||null}); if(S.hist.length>40) S.hist.pop(); S.savedAt=Date.now(); if(loud) _toast(m, undo?function(){ undo(); }:null); }
function undoLast(){
  var h=S.hist.filter(function(x){ return x.undo && !x.done; })[0];
  if(!h){ _toast(L('Nothing to undo.')); return; }
  h.undo(); h.done=true; render(); _toast(L('Undone'));
}

// ---------- clicks: select first, open on double-click or Enter ----------
document.addEventListener('click', function(e){
  if(S.bypass || !S.me || S.view==='review') return;
  var b=e.target.closest('[data-act]'); if(!b) return;
  var a=b.dataset.act;
  if(a==='ws'){ e.stopImmediatePropagation(); S.lpDrawer=false; wsGo(b.dataset.ws); return; }
  if(a==='ptoggle'){ e.stopImmediatePropagation(); var ws=wsOf(S.view), l=lay(ws); if(b.dataset.p==='left') l.left=!l.left; else l.insp=!l.insp; saveLay(ws); render(); return; }
  if(a==='pside'){ e.stopImmediatePropagation(); var ws2=wsOf(S.view), l2=lay(ws2); l2.side=l2.side==='right'?'left':'right'; saveLay(ws2); render(); return; }
  if(a==='pwidth'){ e.stopImmediatePropagation(); var ws3=wsOf(S.view), l3=lay(ws3); l3.w=l3.w==='narrow'?'regular':l3.w==='regular'?'wide':'narrow'; saveLay(ws3); render(); return; }
  if(a==='resetlay'){ e.stopImmediatePropagation(); var ws4=wsOf(S.view); S.layout[ws4]=Object.assign({}, LAYOUT_DEF[ws4]); S.hidePanels=false; saveLay(ws4); render(); _toast(L('Layout reset')); return; }
  if(a==='history'){ e.stopImmediatePropagation(); openModal({kind:'history'}); return; }
  if(a==='histundo'){ e.stopImmediatePropagation(); var hx=S.hist[+b.dataset.i]; if(hx&&hx.undo&&!hx.done){ hx.undo(); hx.done=true; render(); _toast(L('Undone')); } return; }
  if(a==='selclear'){ e.stopImmediatePropagation(); S.sel=[]; render(); return; }
  if(a==='selopen'){ e.stopImmediatePropagation(); openSel(); return; }
  if(a==='lpdrawer'){ e.stopImmediatePropagation(); S.lpDrawer=!S.lpDrawer; render(); return; }
  if(a==='tool-select'){ e.stopImmediatePropagation(); var cv=document.getElementById('canvas'); if(cv){ cv.setAttribute('tabindex','-1'); cv.focus({preventScroll:true}); } return; }
  if(a==='tool-new'){ e.stopImmediatePropagation(); var nk=newKind(wsOf(S.view)); if(nk) nk.run(); return; }
  if(a==='insdel'){ e.stopImmediatePropagation(); var gt=task(b.dataset.id); if(!gt||!isPM()) return; destroy('tasks',gt.id); S.sel=[]; render(); toast(L('Task deleted'), function(){ add('tasks',gt); }); return; }
  if(a==='insdelev'){ e.stopImmediatePropagation(); var ge=S.events.filter(function(x){ return x.id===b.dataset.id; })[0]; if(!ge||!isPM()) return; destroy('events',ge.id); S.sel=[]; render(); toast(L('Removed from the planner'), function(){ add('events',ge); }); return; }
  if(a==='abdel'){ e.stopImmediatePropagation(); if(!isPM()) return; var gone=S.sel.map(function(s){ return task(s.id); }).filter(Boolean); gone.forEach(function(t){ destroy('tasks',t.id); }); S.sel=[]; render(); toast(L('Deleted {n} tasks',{n:gone.length}), function(){ gone.forEach(function(t){ add('tasks',t); }); }); return; }
  if(a==='abvat'){ e.stopImmediatePropagation(); bulkTx(function(t){ return t.type==='in'?['vat','done']:null; }); return; }
  // selection: a row's own open action selects instead, when the frame is showing
  if(!SEL_KIND[a] || b.dataset.nosel || b.closest('.taskbar,.actionbar,.insp,.insp-sheet,#modal,.lp-drawer') && !b.closest('.lp')) return;
  if(!b.closest('#canvas') && !b.closest('.lp')) return;
  if(a==='openreview' && b.closest('.lp')){ e.stopImmediatePropagation(); selectEl(b, e); return; }
  e.stopImmediatePropagation(); e.preventDefault(); selectEl(b, e);
}, true);
document.addEventListener('dblclick', function(e){
  if(!S.me || S.view==='review') return;
  var b=e.target.closest('[data-act]'); if(!b || !SEL_KIND[b.dataset.act] || b.dataset.nosel) return;
  if(!b.closest('#canvas') && !b.closest('.lp')) return;
  if(!isSel(SEL_KIND[b.dataset.act], b.dataset.id)) S.sel=[{k:SEL_KIND[b.dataset.act], id:b.dataset.id}];
  e.preventDefault(); openSel();
});

// ---------- keys: Adobe habits, the same in every workspace ----------
document.addEventListener('keydown', function(e){
  if(!S.me || S.palette) return;
  var k=e.key, mod=e.metaKey||e.ctrlKey, typingNow=typing();
  if(mod && (k==='z'||k==='Z') && !typingNow && !S.modal){ e.preventDefault(); e.stopImmediatePropagation(); if(!e.shiftKey) undoLast(); return; }
  if(S.modal || S.view==='review') return;
  if(k==='Escape' && S.sel.length){ e.stopImmediatePropagation(); S.sel=[]; render(); return; }
  if(k==='Escape' && S.lpDrawer){ e.stopImmediatePropagation(); S.lpDrawer=false; render(); return; }
  if(typingNow) return;
  if(mod && (k==='a'||k==='A')){ var kind=S.sel.length?S.sel[0].k:(wsOf(S.view)==='money'?'tx':'task'), els=selectables(kind); if(els.length){ e.preventDefault(); e.stopImmediatePropagation(); S.sel=els.map(function(x){ return {k:kind,id:x.dataset.id}; }); render(); } return; }
  if(mod || e.altKey) return;
  var list=wsList();
  if(/^[1-9]$/.test(k) && +k<=list.length){ e.preventDefault(); e.stopImmediatePropagation(); wsGo(list[+k-1].id); return; }
  if(k==='Tab' && (document.activeElement===document.body || !document.activeElement || document.activeElement.id==='canvas')){ e.preventDefault(); e.stopImmediatePropagation(); S.hidePanels=!S.hidePanels; render(); if(S.hidePanels) _toast(L('Panels hidden. Press Tab to bring them back.')); return; }
  if(k==='v'||k==='V'){ e.stopImmediatePropagation(); var cv=document.getElementById('canvas'); if(cv){ cv.setAttribute('tabindex','-1'); cv.focus({preventScroll:true}); } return; }
  if((k==='n'||k==='N')){ var nk=newKind(wsOf(S.view)); e.stopImmediatePropagation(); if(nk) nk.run(); return; }
  if((k==='e'||k==='E') && S.sel.length===1){ var f=document.querySelector('#insp input:not([disabled]), #insp select:not([disabled]), #insp textarea:not([disabled])'); if(f){ e.preventDefault(); e.stopImmediatePropagation(); f.focus(); } return; }
  var ae=document.activeElement, onSel=ae && ae.dataset && SEL_KIND[ae.dataset.act] && !ae.dataset.nosel && S.sel.length===1 && ae.dataset.id===S.sel[0].id;
  if(k==='Enter' && S.sel.length===1 && (!ae || ae===document.body || ae.id==='canvas' || onSel)){ e.preventDefault(); e.stopImmediatePropagation(); openSel(); return; }
  if(k===' ' && S.sel.length===1 && S.sel[0].k==='task'){ var t=task(S.sel[0].id); if(t && t.versions.length){ e.preventDefault(); e.stopImmediatePropagation(); S.task=t.id; S.ver=null; pushGo('review'); } return; }
  if((k==='ArrowDown'||k==='ArrowUp') && S.sel.length){ var all=selectables(S.sel[0].k), i=all.findIndex(function(x){ return x.dataset.id===S.sel[S.sel.length-1].id; }); if(i<0) return; var j=Math.max(0,Math.min(all.length-1,i+(k==='ArrowDown'?1:-1))); e.preventDefault(); e.stopImmediatePropagation(); S.sel=[{k:S.sel[0].k,id:all[j].dataset.id}]; render(); var sel=document.querySelector('#canvas .is-sel'); if(sel) sel.scrollIntoView({block:'nearest'}); return; }
  if(k==='['||k===']'){ var dir=k===']'?1:-1, ws=wsOf(S.view);
    if(ws==='planning'){ e.stopImmediatePropagation(); if(S.calView==='month') S.mo=(S.mo||0)+dir; else S.wk+=dir; render(); return; }
    if(ws==='money' && FIN.unlocked){ e.stopImmediatePropagation(); var nb=document.querySelector('[data-act=fmonth][data-d="'+dir+'"]'); if(nb) nb.click(); return; }
  }
}, true);

// Changing workspace or view clears the selection and remembers where each workspace was
var _go=go;
go=function(v){ var from=S.view; if(from && from!=='review' && from!=='settings' && wsOf(v)!==wsOf(from)){ S.wsLast[wsOf(from)]=from; } if(wsOf(v)!==wsOf(from)) S.sel=[]; else if(v!==from) S.sel=[]; S.lpDrawer=false; _go(v); var cv=document.getElementById('canvas'); if(cv) cv.scrollTop=0; };
if(window.__store) window.__bo={S:S, task:task, FIN:FIN}; // test hook, only with the local test mock
