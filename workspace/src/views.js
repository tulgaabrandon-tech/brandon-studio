// ================= What should this person do next? =================
function rank(t){ if(changesAsked(t)) return 0; if(t.status==='doing') return 1+days(t.due)/100; if(t.status==='todo') return 2+days(t.due)/100; return 9; }
function verb(t){
  if(changesAsked(t)) return {label:L('Send fixed version'), act:'submit'};
  if(t.status==='doing') return {label:L('Send your work'), act:'submit'};
  if(t.status==='todo') return {label:L('Start'), act:'start'};
  return null;
}
function sentence(t){
  if(changesAsked(t)) return L('{name} asked for changes',{name:pmOf(t).name});
  if(t.status==='doing') return L('You are working on this');
  if(t.status==='todo') return L('Not started yet');
  if(t.status==='review') return L('Waiting for {name} to review',{name:pmOf(t).name});
  return L('Approved');
}
function home(){ return isExec()?'dash':isPM()?'needs':'home'; }
function greeting(){
  var h=new Date().getHours();
  if(h>=5&&h<11) return L('Good morning');
  if(h>=11&&h<17) return L('Good afternoon');
  if(h>=17&&h<23) return L('Good evening');
  return L('Working late');
}
function today(){ return dowLong(TODAY)+' · '+md(TODAY); }

// ================= Images =================
function imgUrl(f){ var u=String(f&&f.url||''); return (/^https:\/\//i.test(u)||/^data:image\//i.test(u))?u:''; }
function cover(t){
  var v=last(t); if(!v) return null;
  var f=v.files.filter(function(f){return f.kind==='image'&&imgUrl(f);})[0];
  if(f) return {src:imgUrl(f)};
  var dr=v.files.filter(function(f){return f.kind==='drive';})[0];
  if(dr) return {src:'https://drive.google.com/thumbnail?id='+encodeURIComponent(dr.id)+'&sz=w1200', drive:true};
  return null;
}
function coverHtml(t, ph){
  var c=cover(t);
  if(!c) return ph||'<div class="ph">'+ICON.link+'</div>';
  return (c.drive?'<div class="ph">'+ICON.drive+'</div>':'')+'<img src="'+esc(c.src)+'" alt="" loading="lazy"'+(t.sample?' class="sample"':'')+(c.drive?' data-fallback':'')+'>';
}

// ================= Planner helpers =================
function shootsAsEvents(){ return S.tasks.filter(function(t){return t.shoot&&t.status!=='done';}).map(function(t){ return {id:'s'+t.id, task:t.id, date:t.due, time:'', title:t.title, kind:'shoot', who:[t.who], place:t.shoot, auto:true}; }); }
function allEvents(){ return S.events.concat(shootsAsEvents()).sort(function(a,b){ return (a.date+(a.time||'99')).localeCompare(b.date+(b.time||'99')); }); }
function forMe(e){ return e.who==='all' || (e.who||[]).indexOf(S.me)>=0; }
function whoLine(e){ return e.who==='all'?L('Everyone'):(e.who||[]).map(function(id){return person(id).name;}).join(', '); }
function evChip(e){ var k=KINDS[e.kind]||KINDS.meeting; return '<span class="ev" style="--k:'+k.color+'"><b>'+(e.time?esc(e.time)+' ':'')+esc(e.title)+'</b><span>'+esc(whoLine(e))+(e.place?' · '+esc(e.place):'')+'</span></span>'; }
function annFor(){ var r=me().role; return S.ann.filter(function(a){ return (a.aud==='all'||a.aud===r) && !seenBy(a,S.me) && a.by!==S.me; }).sort(function(a,b){ return b.date.localeCompare(a.date); }); }
function weekDays(off){ var out=[]; var s=d(off||0); var mon=new Date(s); mon.setDate(mon.getDate()-((mon.getDay()+6)%7)); for(var i=0;i<7;i++){ var x=new Date(mon); x.setDate(mon.getDate()+i); out.push(x); } return out; }

// ================= Shell =================
function render(){
  document.body.classList.toggle('dark', S.dark);
  var root=$('#root');
  if(S.mode==='setup'){ root.innerHTML='<div class="login" style="justify-content:center"><div class="login-h"><span class="mark" style="width:52px;height:52px;border-radius:16px">'+LOGO+'</span><h1 class="display">'+esc(L('Almost ready'))+'</h1><p class="lede" style="text-align:center">'+esc(L('BrandOn Studio is not connected to its database yet. Follow SETUP.md, then this page opens the studio.'))+'</p></div></div>'; return; }
  if(S.mode==='login'){ root.innerHTML=vLogin(); renderModal(); renderPalette(); setTimeout(function(){ var x=$('#spw'); if(x&&document.activeElement!==x) x.focus(); },30); return; }
  if(S.mode==='loading' || (S.mode==='live' && !S.ready && !S.people.length)){ root.innerHTML=vLoading(); renderModal(); renderPalette(); return; }
  if(!S.me){ root.innerHTML = S.people.length ? vPick() : vSetup(); renderModal(); renderPalette(); return; }
  if(!S.view) S.view=home();
  var allowed=isExec()?['dash','projects','project','review','finance']:isPM()?null:['home','review','finance'];
  if(allowed && allowed.indexOf(S.view)<0) S.view=home();
  if(S.view==='finance' && !hasFinance()) S.view=home();
  if(S.ready && isPM() && !S.recurDone){ S.recurDone=true; setTimeout(runRecurring,400); }
  var entering = S.lastView!==S.view+'|'+S.me; S.lastView=S.view+'|'+S.me;
  if(S.view==='review'){ root.innerHTML=vReview(); renderModal(); renderPalette(); return; }
  var u=me(), pm=isPM(), h='';
  if(S.mode==='demo') h+='<div class="demo-bar">'+esc(L('Demo mode. Changes are not saved.'))+'</div>';
  if(S.readonly) h+='<div class="demo-bar warn">'+esc(L("You can view this, but you can't make changes. Ask Suvdaa or Reka for access."))+'</div>';
  if(S.slow) h+='<div class="demo-bar warn">'+esc(L("Can't reach the data yet. Check your connection."))+'</div>';
  h+='<header class="topbar"><div class="bar-in"><button class="brand" data-act="go" data-v="'+home()+'" aria-label="BrandOn Studio"><span class="mark">'+LOGO+'</span><b>BrandOn <span>Studio</span></b></button>';
  var tabs=null;
  if(pm){ var n=S.tasks.filter(function(t){return t.status==='review'&&project(t.project).pm===S.me;}).length; tabs=[['needs',L('Review'),n],['projects',L('Projects'),0],['agency',L('Agency'),0]]; }
  else if(isExec()) tabs=[['dash',L('Dashboard'),0],['projects',L('Projects'),0]];
  else if(hasFinance()) tabs=[['home',L('My work'),0]];
  if(tabs && hasFinance()) tabs.push(['finance',L('Finance'),0]);
  if(tabs){
    h+='<nav class="tabs" aria-label="Main">'+tabs.map(function(x){ var cur=S.view===x[0]||(S.view==='project'&&x[0]==='projects'); return '<button data-act="go" data-v="'+x[0]+'"'+(cur?' aria-current="page"':'')+'>'+esc(x[1])+(x[2]?'<span class="count">'+x[2]+'</span>':'')+'</button>'; }).join('')+'</nav>';
  }
  h+='<div class="bar-r"><button class="search" data-act="palette" aria-label="'+esc(L('Search'))+'">'+ICON.search+'<span>'+esc(L('Search or jump to'))+'</span><kbd>'+(IS_MAC?'⌘':'Ctrl')+' K</kbd></button>'+
    '<button class="icon-btn" data-act="switch" title="'+esc(L('Switch person'))+'" aria-label="'+esc(L('Switch person'))+'">'+ICON.swap+'</button>'+
    '<div class="menu-w"><button class="userbtn" data-act="menu" aria-haspopup="true" aria-expanded="'+S.menu+'">'+av(u)+'<span class="hide-s">'+esc(u.name)+'</span>'+ICON.down+'</button>'+(S.menu?vMenu():'')+'</div></div></div></header>';
  var V={home:vHome, needs:vNeeds, projects:vProjects, project:vProject, agency:vAgency, settings:vSettings, finance:vFinance, dash:vDash};
  h+='<main class="page'+(entering?' enter':'')+(S.view==='finance'?' wide':'')+'">'+(V[S.view]||vHome)()+'</main>';
  if(!S.readonly) h+=(S.view==='finance'?(FIN.unlocked?'<div class="fab-w"><button class="fab" data-act="ftxnew" aria-label="'+esc(F('Гүйлгээ нэмэх','Add transaction'))+'">'+ICON.plus+'</button></div>':''):(isExec()?'':fabHtml()));
  root.innerHTML=h;
  renderModal(); renderPalette();
}
function fabHtml(){
  var items=isPM()?[['newtask',ICON.check,L('New task')],['newproj',ICON.folder,L('New project')],['newevent',ICON.cal,L('Add to planner')],['go-agency',ICON.mega,L('Announce')]]:null;
  var h=S.fab&&items?'<div class="fab-scrim" data-act="fab"></div>':'';
  h+='<div class="fab-w">';
  if(S.fab&&items) h+='<div class="fab-menu" role="menu">'+items.map(function(x){ return '<button class="fab-item" role="menuitem" data-act="'+(x[0]==='go-agency'?'go':x[0])+'"'+(x[0]==='go-agency'?' data-v="agency"':'')+'>'+x[1]+esc(x[2])+'</button>'; }).join('')+'</div>';
  h+='<button class="fab'+(S.fab?' open':'')+'" data-act="'+(items?'fab':'newtask')+'" aria-label="'+esc(L('New task'))+'" aria-expanded="'+(!!S.fab)+'" title="'+esc(L('New task'))+' (N)">'+ICON.plus+'</button></div>';
  return h;
}
function vMenu(){
  return '<div class="menu" role="menu">'+
    '<div class="menu-row"><span>'+esc(L('Language'))+'</span>'+langSeg()+'</div>'+
    '<button class="menu-item" data-act="theme" role="menuitemcheckbox" aria-checked="'+S.dark+'">'+ICON.moon+esc(L('Dark mode'))+'<span class="switch'+(S.dark?' on':'')+'" aria-hidden="true"></span></button>'+
    (tgOn()?'<button class="menu-item" data-act="tg" role="menuitem">'+ICON.send+esc(me().tgChat?L('Telegram connected'):L('Connect Telegram'))+(me().tgChat?'<span class="chip ok" style="margin-left:auto">'+ICON.check+'</span>':'')+'</button>':'')+
    '<button class="menu-item" data-act="keys" role="menuitem">'+ICON.key+esc(L('Keyboard shortcuts'))+'<kbd>?</kbd></button>'+
    (isPM()?'<button class="menu-item" data-act="go" data-v="settings" role="menuitem">'+ICON.users+esc(L('Team settings'))+'</button>':'')+
    '<button class="menu-item" data-act="switch" role="menuitem">'+ICON.swap+esc(L('Switch person'))+'</button>'+
  '</div>';
}
function langSeg(){ return '<div class="seg" role="group" aria-label="'+esc(L('Language'))+'"><button data-act="lang" data-l="mn" aria-pressed="'+(LANG==='mn')+'">Монгол</button><button data-act="lang" data-l="en" aria-pressed="'+(LANG==='en')+'">English</button></div>'; }
function vLoading(){ return '<div class="login" style="justify-content:center"><div class="login-h"><div class="loader" role="progressbar" aria-label="'+esc(L('Loading'))+'"></div><p class="muted">'+esc(L(S.slow?"Can't reach the data yet. Check your connection.":'Loading'))+'</p></div></div>'; }
function vPick(){
  var groups=[['exec','Management'],['pm','Project managers'],['designer','Designers'],['video','Video team']], k=0;
  var grid='<div class="people">'+groups.map(function(g){
    var ps=S.people.filter(function(p){return p.role===g[0];}); if(!ps.length) return '';
    return '<div class="group-l">'+esc(L(g[1]))+'</div>'+ps.map(function(p){
      k++; var load='';
      if(p.role==='exec'){ load='<span class="chip">'+esc(L('Agency overview'))+'</span>'; }
      else if(p.role==='pm'){ var r=S.tasks.filter(function(t){return t.status==='review'&&project(t.project).pm===p.id;}).length; load=r?'<span class="chip red">'+esc(L('{n} to review',{n:r}))+'</span>':'<span class="chip ok">'+ICON.check+esc(L('Nothing to review'))+'</span>'; }
      else { var a=active(p.id), ch=S.tasks.filter(function(t){return t.who===p.id&&changesAsked(t);}).length; load='<span class="chip">'+esc(L('{n} active',{n:a}))+'</span>'+(ch?'<span class="chip red">'+esc(L('{n} to fix',{n:ch}))+'</span>':''); }
      return '<button class="person" data-act="pick" data-id="'+esc(p.id)+'">'+av(p,true)+'<div style="min-width:0"><b>'+esc(p.name)+'</b><div class="muted">'+esc(L(ROLES[p.role]))+'</div><div class="load">'+load+'</div></div>'+(k<10?'<kbd>'+k+'</kbd>':'')+'</button>';
    }).join('');
  }).join('')+'</div>';
  return '<div class="login"><div class="login-h"><span class="mark" style="width:52px;height:52px;border-radius:16px">'+LOGO+'</span><div class="eyebrow">BrandOn Studio · '+esc(today())+'</div><h1 class="display">'+esc(L("Who's working today?"))+'</h1><p class="lede" style="text-align:center">'+esc(S.mode==='demo'?L('Demo: tap a name to see their view. Nothing is saved.'):L('Tap your name to go in. The Switch person button at the top brings you back here.'))+'</p></div>'+grid+'<div class="login-f">'+langSeg()+'<button class="btn ghost sm" data-act="theme">'+(S.dark?ICON.sun:ICON.moon)+esc(L(S.dark?'Light mode':'Dark mode'))+'</button></div></div>';
}
function vSetup(){ return '<div class="login"><div class="login-h"><span class="mark" style="width:52px;height:52px;border-radius:16px">'+LOGO+'</span><h1 class="display">'+esc(L('Set up your team'))+'</h1><p class="lede" style="text-align:center">'+esc(L('Nobody is here yet. Add yourself first, then add the team in Team settings.'))+'</p>'+langSeg()+'<button class="btn primary xl" data-act="join">'+esc(L('Join the team'))+'</button></div></div>'; }

// ================= Designer / videographer =================
function vHome(){
  var u=me(), mine=S.tasks.filter(function(t){return t.who===u.id;});
  var todo=mine.filter(function(t){return t.status==='todo'||t.status==='doing';}).sort(function(a,b){return rank(a)-rank(b);});
  var waiting=mine.filter(function(t){return t.status==='review';});
  var done=mine.filter(function(t){return t.status==='done';});
  var next=todo[0], rest=todo.slice(1);
  var lede = !next ? '' : changesAsked(next) ? L('{name} sent notes back. Fix them first, the rest can wait.',{name:pmOf(next).name}) : todo.length===1 ? L('One thing on your desk today.') : L('{n} things on your desk. Start with the one below.',{n:todo.length});
  var h='<header><div class="eyebrow">'+esc(today())+'</div><h1 class="display">'+esc(greeting())+', '+esc(u.name)+'<span class="dot">.</span></h1>'+(lede?'<p class="lede">'+esc(lede)+'</p>':'')+'</header>';
  h+=annBlock();
  if(!next) h+=zeroBlock();
  else {
    var p=project(next.project), due=dueLabel(next.due), vb=verb(next), v=last(next), drive=safeUrl(p.drive), ch=changesAsked(next);
    if(!hinted()) h+='<div class="hint-pop" role="note">'+esc(L('This card is always your next step. Finish it and the next one moves up.'))+'<button class="btn sm" data-act="hinted">'+esc(L('OK'))+'</button></div>';
    h+='<section class="focus" aria-label="'+esc(L('Next task'))+'"><div class="focus-b">'+
      '<div class="focus-top"><span class="pdot" style="background:'+esc(p.color)+'"></span>'+esc(p.client)+'<span class="chip '+due.tone+'">'+esc(due.t)+'</span>'+(drive?'<a class="tp-link" href="'+esc(drive)+'" target="_blank" rel="noopener">'+ICON.folder+esc(L('Drive folder'))+'</a>':'')+'</div>'+
      '<h2 class="h2">'+esc(next.title)+'</h2>'+
      '<p class="state'+(ch?' red':'')+'">'+(ch||next.status==='doing'?'<span class="pulse"></span>':'')+esc(sentence(next))+'</p>'+
      (ch?'<ol class="notes-l">'+v.comments.map(function(c,i){return '<li><span class="num">'+(i+1)+'</span><span>'+esc(c.text)+(c.t?' <span class="chip">'+esc(c.t)+'</span>':'')+'</span></li>';}).join('')+'</ol>':(next.brief?'<p class="brief">'+esc(next.brief)+'</p>':''))+
      (next.shoot?'<div class="shoot">'+ICON.pin+' '+esc(next.shoot)+'</div>':'')+
      '<div class="focus-a">'+(S.readonly?'':'<button class="btn primary xl" data-act="'+vb.act+'" data-id="'+esc(next.id)+'">'+(vb.act==='start'?ICON.play:ICON.upload)+esc(vb.label)+'<kbd>↵</kbd></button>')+
        (v?'<button class="btn ghost xl" data-act="openreview" data-id="'+esc(next.id)+'">'+esc(ch?L('See notes on the image'):L('See last version'))+'</button>':'')+
        '<button class="btn ghost xl" data-act="thread" data-id="'+esc(next.id)+'">'+ICON.chat+esc(L('Ask {name}',{name:pmOf(next).name}))+((next.thread||[]).length?' <span class="chip">'+next.thread.length+'</span>':'')+'</button></div>'+
      '</div>'+
      (v?'<button class="focus-m" data-act="openreview" data-id="'+esc(next.id)+'" aria-label="'+esc(L('See last version'))+'">'+coverHtml(next)+(ch?'<span class="tag red">'+ICON.pin+esc(L('{n} notes',{n:v.comments.length}))+'</span>':'<span class="tag">v'+next.versions.length+'</span>')+'</button>'
        :'<div class="focus-m noart" style="cursor:default"><div class="ph">'+(next.shoot?ICON.cam:ICON.spark)+'<span>'+esc(next.shoot?L('Shoot day'):L('Fresh start. Nothing sent yet.'))+'</span></div></div>')+
    '</section>';
  }
  if(rest.length) h+='<div class="sec"><h3>'+esc(L('Up next'))+'</h3><span class="muted">'+rest.length+'</span></div><div class="rows">'+rest.map(row).join('')+'</div>';
  if(waiting.length) h+='<div class="sec"><h3>'+esc(L('Waiting for review'))+'</h3><span class="muted">'+esc(L("You don't need to do anything"))+'</span></div><div class="rows">'+waiting.map(row).join('')+'</div>';
  h+=agendaBlock();
  h+=wallBlock();
  if(done.length) h+='<details class="done"><summary>'+esc(L('Completed {n}',{n:done.length}))+'</summary><div class="rows">'+done.slice(-20).reverse().map(row).join('')+'</div></details>';
  return h;
}
function annBlock(){
  var anns=annFor(); if(!anns.length) return '';
  var show=S.allAnn?anns:anns.slice(0,1);
  return '<div class="anns">'+show.map(function(a){ return '<div class="ann"><span class="ann-ic">'+ICON.mega+'</span><div style="flex:1;min-width:0"><b>'+esc(a.title)+'</b>'+(a.text?'<p>'+esc(a.text)+'</p>':'')+'<div class="meta">'+esc(person(a.by).name)+' · '+esc(short(a.date))+'</div></div><button class="btn" data-act="gotit" data-id="'+esc(a.id)+'">'+esc(L('Got it'))+'</button></div>'; }).join('')+(anns.length>1&&!S.allAnn?'<button class="lnk" data-act="allann" style="align-self:flex-start">'+esc(L('+ {n} more announcements',{n:anns.length-1}))+'</button>':'')+'</div>';
}
var ZERO_LINES=['Clean desk. Enjoy it while it lasts.','Nothing on your plate. Good time to sketch something for yourself.','All caught up. The studio wall below is partly yours.','Desk is clear. Tea?'];
function zeroBlock(){
  var art=approvedWork().slice(0,3);
  var line=ZERO_LINES[(TODAY.getDate()+(S.me||'').length)%ZERO_LINES.length];
  return '<section class="zero"><div><div class="eyebrow" style="color:inherit;opacity:.6">'+esc(L('All caught up'))+'</div><h2 style="margin-top:12px">'+esc(L('Clean desk.'))+'</h2><p>'+esc(L(line))+'</p></div>'+(art.length?'<div class="zero-art" aria-hidden="true">'+art.map(function(t){ return '<div>'+coverHtml(t,'')+'</div>'; }).join('')+'</div>':'')+'</section>';
}
function approvedWork(){ return S.tasks.filter(function(t){ var v=last(t); return t.status==='done' && v && cover(t); }).sort(function(a,b){ var x=last(a), y=last(b); return (y.decidedAt||y.date).localeCompare(x.decidedAt||x.date); }); }
function wallBlock(){
  var list=approvedWork().slice(0,6); if(!list.length) return '';
  return '<div class="sec"><h3>'+esc(L('Studio wall'))+'</h3><span class="muted">'+esc(L('Recently approved, by the whole team'))+'</span></div><div class="wall">'+list.map(function(t){
    var v=last(t), p=project(t.project);
    return '<figure><button class="wimg" data-act="openreview" data-id="'+esc(t.id)+'" aria-label="'+esc(t.title)+'" style="display:block;width:100%">'+coverHtml(t,'')+'</button><figcaption>'+av(person(t.who))+'<div style="min-width:0"><b>'+esc(t.title)+'</b><span class="muted">'+esc(p.client)+' · '+esc(person(t.who).name)+'</span></div></figcaption></figure>';
  }).join('')+'</div>';
}
function agendaBlock(){
  var ev=allEvents().filter(function(e){ var n=days(e.date); return n>=0&&n<7; });
  ev.sort(function(a,b){ return (forMe(b)&&b.who!=='all')-(forMe(a)&&a.who!=='all') || 0; });
  ev=ev.slice(0,5).sort(function(a,b){ return (a.date+(a.time||'99')).localeCompare(b.date+(b.time||'99')); });
  if(!ev.length) return '';
  return '<div class="sec"><h3>'+esc(L('This week at the agency'))+'</h3></div><div class="agenda">'+ev.map(function(e){ var x=fromIso(e.date), mine=forMe(e)&&e.who!=='all', k=KINDS[e.kind]||KINDS.meeting; return '<div class="ag'+(days(e.date)===0?' today':'')+(forMe(e)?'':' dim')+'"><div class="dt"><b>'+esc(dow(x))+'</b><span>'+x.getDate()+'</span></div>'+evChip(e)+(mine?'<span class="chip">'+esc(L('You'))+'</span>':'')+'</div>'; }).join('')+'</div>';
}
function weekBlock(editable){
  var dd=weekDays(S.wk*7), ev=allEvents();
  var head = editable ? '' : '<div class="sec"><h3>'+esc(L('This week at the agency'))+'</h3></div>';
  return head+'<div class="week">'+dd.map(function(x){
    var di=iso(x), list=ev.filter(function(e){return e.date===di;}), isT=di===iso(TODAY), past=x<TODAY;
    return '<div class="day'+(isT?' today':'')+(past&&!isT?' past':'')+(list.length?'':' none')+'"><div class="day-h"><span>'+esc(dow(x))+'</span><b>'+x.getDate()+'</b></div>'+list.map(function(e){
      var k=KINDS[e.kind]||KINDS.meeting, mine=forMe(e)&&e.who!=='all';
      var inner='<b>'+(e.time?esc(e.time)+' ':'')+esc(e.title)+'</b><span>'+esc(mine?L('You'):whoLine(e))+(e.place?' · '+esc(e.place):'')+'</span>';
      return editable&&!S.readonly ? '<button class="evp" style="--k:'+k.color+'" data-act="'+(e.auto?'evauto':'editevent')+'" data-id="'+esc(e.auto?e.task:e.id)+'">'+inner+'</button>' : '<div class="evp'+(mine?' mine':'')+'" style="--k:'+k.color+'">'+inner+'</div>';
    }).join('')+(editable&&!S.readonly?'<button class="dadd" data-act="newevent" data-date="'+di+'" aria-label="'+esc(L('Add to planner')+' '+md(x))+'">+</button>':'')+'</div>';
  }).join('')+'</div>';
}
function hinted(){ try{ return localStorage.getItem('bo.hint.'+S.me)==='1'; }catch(e){ return !!S.hintDone; } }
function row(t){
  var p=project(t.project), due=dueLabel(t.due), vb=S.readonly?null:verb(t);
  var right = vb ? '<button class="btn'+(vb.act==='submit'?' primary':'')+'" data-act="'+vb.act+'" data-id="'+esc(t.id)+'">'+esc(vb.label)+'</button>'
    : t.status==='review' ? '<span class="chip red hide-s"><span class="dot"></span>'+esc(L('Needs feedback'))+'</span>' : t.status==='done' ? '<span class="chip ok">'+ICON.check+esc(L('Completed'))+'</span>' : '';
  return '<div class="rw"><span class="pdot" style="background:'+esc(p.color)+'"></span><button class="rw-m" data-act="'+(t.versions.length?'openreview':'info')+'" data-id="'+esc(t.id)+'"><b>'+esc(t.title)+'</b><span class="muted">'+esc(p.client)+(t.status==='done'?'':' · <span class="'+(due.tone==='red'?'red':'')+'">'+esc(due.t)+'</span>')+(t.shoot?' · '+esc(t.shoot):'')+'</span></button>'+right+'</div>';
}

// ================= Review: immersive viewer =================
function stageFor(v, fi, f, can, cmp){
  var pins=v.comments.map(function(c,ci){ return (c.file||0)===fi&&c.x!=null?'<button class="pin'+(c.fixed?' fixed':'')+'" style="left:'+c.x+'%;top:'+c.y+'%;animation-delay:'+(ci*40)+'ms" data-act="focus" data-ci="'+ci+'" data-cmp="'+(cmp?1:0)+'" aria-label="'+(ci+1)+'">'+(ci+1)+'</button>':''; }).join('');
  var pend=(!cmp&&S.pending&&S.pending.file===fi)?'<span class="pin new" style="left:'+S.pending.x+'%;top:'+S.pending.y+'%">'+(v.comments.length+1)+'</span>':'';
  if(f.kind==='image'&&imgUrl(f)) return '<div class="stage'+(can?' can':'')+'" data-stage="'+fi+'"><img src="'+esc(imgUrl(f))+'" alt="'+esc(f.name||'')+'" draggable="false"'+(S.curSample?' class="sample"':'')+'>'+pins+pend+'</div>';
  if(f.kind==='drive') return '<div class="stage frame'+(can&&S.marking?' can marking':'')+'" data-stage="'+fi+'"><iframe src="'+esc(f.preview)+'" title="'+esc(fileName(f))+'" allow="autoplay" loading="lazy"></iframe><div class="pinlayer"></div>'+pins+pend+'</div>'+
    '<div class="stage-a">'+(can?'<button class="btn'+(S.marking?' primary':'')+' sm" data-act="mark">'+ICON.pin+esc(L(S.marking?'Done marking':'Mark a spot'))+' <kbd>M</kbd></button>':'')+'<a class="btn sm" href="'+esc(safeUrl(f.url))+'" target="_blank" rel="noopener">'+ICON.ext+esc(L('Open in Drive'))+'</a></div>';
  var u=safeUrl(f.url);
  return '<a class="linkcard" href="'+esc(u)+'" target="_blank" rel="noopener">'+(f.kind==='folder'?ICON.folder:ICON.link)+'<span style="flex:1;min-width:0;overflow-wrap:anywhere;font-weight:700">'+esc(fileName(f))+'<span class="muted s13" style="display:block;font-weight:400">'+esc(u)+'</span></span>'+ICON.ext+'</a>';
}
function vReview(){
  var t=task(S.task); if(!t){ S.view=home(); return ''; }
  var p=project(t.project); S.curSample=!!t.sample;
  var vi=S.ver==null?t.versions.length-1:S.ver, v=t.versions[vi];
  var canComment = !!v && !S.readonly && isPM() && vi===t.versions.length-1 && t.status==='review';
  var prev = S.compare && vi>0 ? t.versions[vi-1] : null;
  var h='<div class="viewer" role="dialog" aria-label="'+esc(t.title)+'"><div class="v-top"><button class="btn sm" data-act="back">'+ICON.back+esc(L('Back'))+' <kbd>Esc</kbd></button>'+
    '<div class="t"><b>'+esc(t.title)+'</b><span>'+esc(p.client)+' · '+esc(person(t.who).name)+(v?' · '+esc(short(v.date)):'')+'</span></div>'+
    '<button class="btn sm" data-act="thread" data-id="'+esc(t.id)+'">'+ICON.chat+esc(L('Questions'))+((t.thread||[]).length?' <span class="chip">'+t.thread.length+'</span>':'')+'</button>'+
    (vi>0?'<button class="btn sm'+(S.compare?' primary':'')+'" data-act="compare">'+esc(S.compare?L('Stop comparing'):L('Compare with v{n}',{n:vi}))+'</button>':'')+
    (t.versions.length>1?'<div class="seg" role="tablist">'+t.versions.map(function(x,i){ return '<button role="tab" data-act="ver" data-i="'+i+'" aria-selected="'+(i===vi)+'">v'+(i+1)+'</button>'; }).join('')+'</div>':'')+
    '</div>';
  if(!v){ return h+'<div class="v-body"><div class="v-stage"><p class="muted">'+esc(L('No notes on this version.'))+'</p></div></div></div>'; }
  if(prev){
    return h+'<div class="v-stage"><div class="cmp"><div><div class="cmp-h">v'+vi+'</div>'+prev.files.map(function(f,fi){ return stageFor(prev,fi,f,false,true); }).join('')+'<div style="margin-top:12px">'+notesList(prev,true)+'</div></div><div><div class="cmp-h">v'+(vi+1)+'</div>'+v.files.map(function(f,fi){ return stageFor(v,fi,f,false,false); }).join('')+'</div></div></div></div>';
  }
  h+='<div class="v-body"><div class="v-stage">'+v.files.map(function(f,fi){ return stageFor(v,fi,f,canComment,false); }).join('')+'</div><aside class="v-side"><div class="v-side-in">';
  if(v.note) h+='<div class="said">'+av(person(v.by))+'<p><b>'+esc(person(v.by).name)+'</b><br>'+esc(v.note)+'</p></div>';
  if(canComment) h+='<p class="muted s13" style="margin:0">'+esc(L('Tap where something should change, then write what.'))+'</p>';
  h+=notesList(v,false,canComment);
  if(canComment){
    var hasVideo=v.files.some(function(f){return f.kind==='drive';});
    h+='<form data-form="comment" class="addnote"><label class="sr" for="ct">'+esc(L('Write a note'))+'</label><textarea class="input" id="ct" placeholder="'+esc(S.pending?L('What should change at pin {n}?',{n:v.comments.length+1}):L('Write a note'))+'"></textarea><div class="addnote-a">'+(hasVideo?'<input class="input sm" id="cts" placeholder="'+esc(L('Time in video, e.g. 0:12'))+'" style="width:170px;background:#17171A;border-color:rgba(255,255,255,.18);color:#F3F2EE">':'<span></span>')+'<button class="btn sm" type="submit">'+esc(L('Add note'))+'</button></div></form>';
  }
  h+='</div><div class="v-foot">';
  if(canComment){
    h+='<div class="row"><button class="btn xl" data-act="changes"'+(v.comments.length?'':' disabled')+'>'+esc(v.comments.length?L('Send back with {n} notes',{n:v.comments.length}):L('Write a note first'))+'</button><button class="btn primary xl" data-act="approve">'+ICON.check+esc(L('Approve'))+'</button></div><div class="hint"><span><kbd>A</kbd> '+esc(L('Approve'))+'</span><span><kbd>S</kbd> '+esc(L('Send back'))+'</span><span><kbd>←</kbd><kbd>→</kbd> '+esc(L('Versions'))+'</span></div>';
  } else if(!isPM() && t.who===S.me && changesAsked(t) && vi===t.versions.length-1 && !S.readonly){
    h+='<button class="btn primary xl" data-act="submit" data-id="'+esc(t.id)+'">'+ICON.upload+esc(L('Send fixed version'))+'</button>';
  } else {
    h+='<div class="v-state'+(v.decision==='approved'?' ok':'')+'">'+esc(v.decision==='approved'?L('Approved'):v.decision==='changes'?L('Sent back with notes'):sentence(t))+'</div>';
  }
  return h+'</div></aside></div></div>';
}
function notesList(v, cmp, canEdit){
  if(!v.comments.length) return canEdit?'<div class="notes"></div>':'<p class="muted s13" style="margin:0">'+esc(L('No notes on this version.'))+'</p>';
  return '<div class="notes">'+v.comments.map(function(c,ci){ return '<div class="nt'+(c.fixed?' is-fixed':'')+'" id="'+(cmp?'pc':'c')+ci+'"><span class="pin static'+(c.fixed?' fixed':'')+'">'+(ci+1)+'</span><p>'+esc(c.text)+(c.t?' <span class="chip">'+esc(c.t)+'</span>':'')+(c.fixed?' <span class="chip ok">'+ICON.check+esc(L('Fixed'))+'</span>':'')+'</p>'+(canEdit?'<button class="icon-btn sm" data-act="rmnote" data-ci="'+ci+'" aria-label="'+esc(L('Delete'))+'">'+ICON.x+'</button>':'')+'</div>'; }).join('')+'</div>';
}

// ================= Manager =================
function weekStats(){
  var since=iso(d(-6)), a=0, b=0;
  S.tasks.forEach(function(t){ t.versions.forEach(function(v){ var when=v.decidedAt||v.date; if(when>=since){ if(v.decision==='approved') a++; if(v.decision==='changes') b++; } }); });
  var late=S.tasks.filter(function(t){return t.status!=='done'&&days(t.due)<0;}).length;
  return {approved:a, back:b, late:late};
}
function waitLabel(v){ var n=days(v.date); return n===0?L('sent today'):L('waiting {n} days',{n:-n}); }
function vNeeds(){
  var mineP=function(t){ return project(t.project).pm===S.me; };
  var fb=S.tasks.filter(function(t){return t.status==='review'&&mineP(t);}).sort(function(a,b){return a.due.localeCompare(b.due);});
  var fbo=S.tasks.filter(function(t){return t.status==='review'&&!mineP(t);});
  var late=S.tasks.filter(function(t){return (t.status==='todo'||t.status==='doing')&&days(t.due)<0&&mineP(t);});
  var st=weekStats();
  var h='<header><div class="eyebrow">'+esc(today())+'</div><h1 class="display">'+esc(greeting())+', '+esc(me().name)+'<span class="dot">.</span></h1><p class="lede">'+esc(fb.length?L('{n} pieces of work are waiting for your eye.',{n:fb.length}):L('Nothing waiting for you. The team is heads down.'))+'</p></header>';
  h+=annBlock();
  h+='<div class="stats"><div class="stat ink"><b>'+st.approved+'</b><span>'+esc(L('approved this week'))+'</span></div><div class="stat"><b>'+st.back+'</b><span>'+esc(L('sent back this week'))+'</span></div><div class="stat"><b'+(st.late?' class="red"':'')+'>'+st.late+'</b><span>'+esc(L('running late'))+'</span></div></div>';
  if(fb.length) h+='<div class="sec"><h3>'+esc(L('Waiting for you'))+'</h3><span class="muted">'+fb.length+'</span></div><div class="queue">'+fb.map(function(t){ var p=project(t.project), v=last(t); return '<button class="qcard" data-act="openreview" data-id="'+esc(t.id)+'"><div class="qimg">'+coverHtml(t)+'<span class="tag">v'+t.versions.length+'</span></div><div class="qb"><span class="tp"><span class="pdot" style="background:'+esc(p.color)+'"></span>'+esc(p.client)+'</span><b class="t">'+esc(t.title)+'</b><span class="qmeta">'+av(person(t.who))+esc(person(t.who).name)+' · '+esc(waitLabel(v))+'</span></div></button>'; }).join('')+'</div>';
  if(late.length) h+='<div class="sec"><h3>'+esc(L('Running late'))+'</h3></div><div class="rows">'+late.map(function(t){ var p=project(t.project); return '<div class="rw"><span class="pdot" style="background:'+esc(p.color)+'"></span><button class="rw-m" data-act="info" data-id="'+esc(t.id)+'"><b>'+esc(t.title)+'</b><span class="muted">'+esc(p.client)+' · '+esc(person(t.who).name)+' · <span class="red">'+esc(dueLabel(t.due).t)+'</span></span></button>'+av(person(t.who))+'</div>'; }).join('')+'</div>';
  var myp=S.projects.filter(function(p){return p.pm===S.me&&!p.archived;}), op=S.projects.filter(function(p){return p.pm!==S.me&&!p.archived;});
  if(myp.length) h+='<div class="sec"><h3>'+esc(L('Your projects'))+'</h3><span class="muted">'+myp.length+'</span></div>'+projRows(myp);
  if(op.length) h+='<details class="done"><summary>'+esc(L('Other projects {n}',{n:op.length}))+'</summary>'+projRows(op)+'</details>';
  return h;
}
function projRows(list){
  return '<div class="rows">'+list.map(function(p){
    var ts=S.tasks.filter(function(t){return t.project===p.id;}), st=projStatus(p.id), dn=ts.filter(function(t){return t.status==='done';}).length;
    var team=[]; ts.forEach(function(t){ if(t.status!=='done' && team.indexOf(t.who)<0) team.push(t.who); });
    return '<button class="rw rw-btn" data-act="openproj" data-id="'+esc(p.id)+'"><span class="pdot" style="background:'+esc(p.color)+'"></span><span class="rw-m"><b>'+esc(p.client)+'</b><span class="muted">'+esc(p.name)+' · '+esc(L('{a}/{b} done',{a:dn,b:ts.length}))+' · PM '+esc(person(p.pm).name)+(p.deadline&&!p.delivered?' · '+esc(dueLabel(p.deadline).t):'')+(p.recur?' · '+esc(L(p.recur.every==='month'?'Every month':'Every week')):'')+'</span></span><span class="avs hide-s">'+team.map(function(id){return av(person(id));}).join('')+'</span>'+(p.delivered?'<span class="chip ok">'+ICON.check+esc(L('Delivered'))+'</span>':chip(st))+'</button>';
  }).join('')+'</div>';
}
function vProjects(){
  var h='<header class="ph-head"><div><div class="eyebrow">'+esc(L('{n} projects',{n:S.projects.length}))+'</div><h1 class="display">'+esc(L('Projects'))+'</h1><p class="lede">'+esc(L('Each project shows where it stands. It updates by itself as work moves.'))+'</p></div>'+(S.readonly?'':'<button class="btn" data-act="newproj">'+ICON.plus+esc(L('New project'))+'</button>')+'</header>';
  var live=S.projects.filter(function(p){return !p.archived;}), arch=S.projects.filter(function(p){return p.archived;});
  ['review','doing','todo','done'].forEach(function(s){
    var list=live.filter(function(p){return projStatus(p.id)===s;});
    if(list.length) h+='<div class="sec"><h3>'+esc(L(STATUS[s]))+'</h3><span class="muted">'+list.length+'</span></div>'+projRows(list);
  });
  if(arch.length) h+='<details class="done"><summary>'+esc(L('Archive {n}',{n:arch.length}))+'</summary>'+projRows(arch)+'</details>';
  if(!S.projects.length) h+='<div class="empty" style="margin-top:28px">'+esc(L('Add a project first.'))+'</div>';
  return h;
}
function vProject(){
  var p=project(S.project); if(!p.id){ S.view=home(); return vNeeds(); }
  var ts=S.tasks.filter(function(t){return t.project===p.id;}), drive=safeUrl(p.drive), dn=ts.filter(function(t){return t.status==='done';}).length;
  var h='<button class="btn ghost sm back" data-act="back">'+ICON.back+esc(L('Back'))+'</button><header class="ph-head"><div><div class="tp"><span class="pdot" style="background:'+esc(p.color)+'"></span>'+esc(p.client)+' '+chip(projStatus(p.id))+'<span class="muted">PM '+esc(person(p.pm).name)+'</span></div><h1 class="display">'+esc(p.name||p.client)+'</h1>'+wavy(ts.length?dn/ts.length:0, L('{a}/{b} done',{a:dn,b:ts.length}))+'</div><div class="ph-tools">'+
    (drive?'<a class="btn ghost" href="'+esc(drive)+'" target="_blank" rel="noopener">'+ICON.folder+esc(L('Open Drive folder'))+'</a>':'')+
    (isPM()&&!S.readonly?'<button class="btn ghost" data-act="editproj" data-id="'+esc(p.id)+'">'+esc(L('Edit'))+'</button>':'')+
    (S.readonly?'':'<button class="btn primary" data-act="newtask" data-proj="'+esc(p.id)+'">'+ICON.plus+esc(L('Add task'))+'</button>')+'</div></header>';
  var allDone=ts.length&&dn===ts.length;
  if(p.delivered) h+='<div class="deliv card"><span class="ann-ic" style="background:var(--ok)">'+ICON.check+'</span><div style="flex:1"><b>'+esc(L('Delivered to the client on {d}',{d:short(p.delivered.at)}))+'</b><div class="muted s13">'+esc(person(p.delivered.by).name)+'</div></div>'+(safeUrl(p.delivered.link)?'<a class="btn" href="'+esc(safeUrl(p.delivered.link))+'" target="_blank" rel="noopener">'+ICON.folder+esc(L('Final files'))+'</a>':'')+(isPM()&&!S.readonly?'<button class="btn ghost sm" data-act="undeliver" data-id="'+esc(p.id)+'">'+esc(L('Undo'))+'</button>':'')+'</div>';
  else if(allDone && isPM() && !S.readonly) h+='<div class="deliv card"><span class="ann-ic">'+ICON.spark+'</span><div style="flex:1"><b>'+esc(L('Everything is approved.'))+'</b><div class="muted s13">'+esc(L('Send it to the client, then mark it delivered here.'))+'</div></div><button class="btn primary" data-act="deliver" data-id="'+esc(p.id)+'">'+esc(L('Deliver to client'))+'</button></div>';
  if(p.brief||p.contact||p.deadline) h+='<div class="pinfo">'+(p.brief?'<div class="pbrief"><div class="eyebrow">'+esc(L('Brief'))+'</div><p>'+esc(p.brief)+'</p></div>':'')+'<div class="pmeta">'+(p.deadline?'<div><div class="eyebrow">'+esc(L('Final deadline'))+'</div><b>'+esc(md(fromIso(p.deadline)))+'</b> <span class="chip '+dueLabel(p.deadline).tone+'">'+esc(dueLabel(p.deadline).t)+'</span></div>':'')+(p.contact?'<div><div class="eyebrow">'+esc(L('Client contact'))+'</div><b>'+esc(p.contact)+'</b></div>':'')+(p.recur?'<div><div class="eyebrow">'+esc(L('Repeat'))+'</div><b>'+esc(L(p.recur.every==='month'?'Every month':'Every week'))+'</b></div>':'')+'</div></div>';
  ['review','doing','todo','done'].forEach(function(s){
    var list=ts.filter(function(t){return t.status===s;});
    if(list.length) h+='<div class="sec"><h3>'+esc(L(STATUS[s]))+'</h3><span class="muted">'+list.length+'</span></div><div class="rows">'+list.map(function(t){ return '<div class="rw">'+av(person(t.who))+'<button class="rw-m" data-act="'+(t.versions.length?'openreview':'info')+'" data-id="'+esc(t.id)+'"><b>'+esc(t.title)+'</b><span class="muted">'+esc(person(t.who).name)+(t.status==='done'?'':' · '+esc(dueLabel(t.due).t))+(changesAsked(t)?' · <span class="red">'+esc(L('changes asked'))+'</span>':'')+'</span></button><button class="icon-btn sm" data-act="info" data-id="'+esc(t.id)+'" aria-label="'+esc(L('Edit task'))+'">'+ICON.dots+'</button></div>'; }).join('')+'</div>';
  });
  if(!ts.length) h+='<div class="empty" style="margin-top:28px">'+esc(L('No tasks yet. Add the first one.'))+'</div>';
  return h;
}

function wavy(frac, label){
  var w=400, pts=[]; for(var x=0;x<=w;x+=4){ pts.push(x+','+(7+4*Math.sin(x/24*2*Math.PI)).toFixed(1)); }
  var d='M'+pts.join(' L'), fw=Math.max(0,Math.min(1,frac))*w;
  return '<div class="wavy" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="'+Math.round(frac*100)+'" aria-label="'+esc(label)+'"><svg viewBox="0 0 '+w+' 14" preserveAspectRatio="none" aria-hidden="true"><line class="track" x1="'+(fw+8)+'" y1="7" x2="'+w+'" y2="7" stroke-width="4" stroke-linecap="round"/>'+(fw>0?'<clipPath id="wc"><rect x="0" y="0" width="'+fw+'" height="14"/></clipPath><path class="fill" d="'+d+'" fill="none" stroke-width="4" stroke-linecap="round" clip-path="url(#wc)" stroke-dasharray="1000 0"/>':'')+'</svg><b>'+esc(label)+'</b></div>';
}

// ================= Management dashboard (Nomin) =================
function vDash(){
  var act=S.projects.filter(function(p){ return !p.archived && !p.delivered; }), rev=S.tasks.filter(function(t){return t.status==='review';}).length;
  var late=S.tasks.filter(function(t){return t.status!=='done'&&days(t.due)<0;}).length, st=weekStats();
  var h='<header><div class="eyebrow">'+esc(today())+'</div><h1 class="display">'+esc(greeting())+', '+esc(me().name)+'<span class="dot">.</span></h1><p class="lede">'+esc(L('Here is how the agency is doing today.'))+'</p></header>';
  h+=annBlock();
  h+='<div class="fin-stats">'+statTile(L('Active projects'), String(act.length), '')+statTile(L('Waiting for review'), String(rev), '')+statTile(L('Running late'), String(late), '', late?'neg':'')+statTile(L('Approved this week'), String(st.approved), '', 'ink')+'</div>';
  var people=S.people.filter(function(p){ return p.role==='designer'||p.role==='video'||p.role==='pm'; });
  var maxA=Math.max(1,Math.max.apply(null,people.map(function(p){ return p.role==='pm'?S.tasks.filter(function(t){return t.status==='review'&&project(t.project).pm===p.id;}).length:active(p.id); })));
  h+='<div class="sec"><h3>'+esc(L('Team'))+'</h3><span class="muted">'+esc(L('What everyone is on'))+'</span></div><div class="rows">'+people.map(function(p){
    var n=p.role==='pm'?S.tasks.filter(function(t){return t.status==='review'&&project(t.project).pm===p.id;}).length:active(p.id);
    var cur=S.tasks.filter(function(t){ return t.who===p.id&&(t.status==='doing'||t.status==='todo'); }).sort(function(a,b){return rank(a)-rank(b);})[0];
    return '<div class="rw">'+av(p)+'<span class="rw-m"><b>'+esc(p.name)+'</b><span class="muted">'+esc(p.role==='pm'?L('{n} to review',{n:n}):cur?cur.title+' · '+project(cur.project).client:L('Nothing to do right now. New tasks show up here.'))+'</span></span><div class="load-bar hide-s"><i style="width:'+Math.round(n/maxA*100)+'%"></i></div><span class="chip">'+esc(p.role==='pm'?n:L('{n} active',{n:n}))+'</span></div>';
  }).join('')+'</div>';
  if(act.length) h+='<div class="sec"><h3>'+esc(L('Projects'))+'</h3><span class="muted">'+act.length+'</span></div>'+projRows(act);
  if(hasFinance()) h+='<div class="sec"><h3>'+esc(L('Finance'))+'</h3></div><button class="card fin-link" data-act="go" data-v="finance"><span class="fin-lock">'+ICON.lock+'</span><span class="rw-m"><b>'+esc(L('Open finance'))+'</b><span class="muted">'+esc(L('Money in and out, sales against the plan, payroll'))+'</span></span>'+ICON.arrow+'</button>';
  h+=agendaBlock();
  h+=wallBlock();
  return h;
}

// ================= Agency (PM) =================
function vAgency(){
  var h='<header><div class="eyebrow">'+esc(today())+'</div><h1 class="display">'+esc(L('Agency'))+'</h1><p class="lede">'+esc(L('Tell everyone something, and plan the week in one place.'))+'</p></header>';
  h+='<div class="sec"><h3>'+esc(L('Announcements'))+'</h3></div>';
  if(!S.readonly) h+='<div class="card"><form data-form="ann" class="annform"><label class="sr" for="at">'+esc(L('Title'))+'</label><input class="input" id="at" placeholder="'+esc(L('Title, e.g. Office closed Friday'))+'"><label class="sr" for="ax">'+esc(L('Message'))+'</label><textarea class="input" id="ax" placeholder="'+esc(L('Message. Everyone sees it at the top of their page until they tap Got it.'))+'"></textarea><div class="annform-a"><div class="chips" role="group" aria-label="'+esc(L('Who sees it'))+'">'+[['all','Everyone'],['designer','Designers'],['video','Video team']].map(function(o){ return '<button type="button" class="pick" data-act="aud" data-a="'+o[0]+'" aria-pressed="'+(S.aud===o[0])+'">'+esc(L(o[1]))+'</button>'; }).join('')+'</div><button class="btn primary" type="submit">'+ICON.mega+esc(L('Announce'))+'</button></div><p class="err" id="aerr" role="alert"></p></form></div>';
  var anns=S.ann.slice().sort(function(a,b){ return b.date.localeCompare(a.date); });
  if(anns.length) h+='<div class="rows" style="margin-top:12px">'+anns.map(function(a){
    var aud=S.people.filter(function(p){ return p.id!==a.by && (a.aud==='all'||a.aud===p.role); });
    var seen=aud.filter(function(p){return seenBy(a,p.id);});
    return '<div class="rw"><span class="ann-ic sm">'+ICON.mega+'</span><span class="rw-m"><b>'+esc(a.title)+'</b><span class="muted">'+esc(L(a.aud==='all'?'Everyone':a.aud==='designer'?'Designers':'Video team'))+' · '+esc(person(a.by).name)+' · '+esc(short(a.date))+'</span></span><span class="seen hide-s" title="'+esc(seen.map(function(p){return p.name;}).join(', '))+'"><span class="avs">'+aud.map(function(p){ return '<span class="'+(seenBy(a,p.id)?'':'unseen')+'">'+av(p)+'</span>'; }).join('')+'</span><span class="muted s13">'+esc(L('{a}/{b} seen',{a:seen.length,b:aud.length}))+'</span></span>'+(S.readonly?'':'<button class="btn ghost sm" data-act="rmann" data-id="'+esc(a.id)+'">'+esc(L('Delete'))+'</button>')+'</div>';
  }).join('')+'</div>';
  var dd=weekDays(S.wk*7);
  h+='<div class="plan-h"><h3>'+esc(L('Planner'))+'</h3><div class="plan-nav"><button class="icon-btn" data-act="wk" data-d="-1" aria-label="'+esc(L('Previous week'))+'">'+ICON.back+'</button><span>'+esc(md(dd[0]))+' - '+esc(md(dd[6]))+'</span><button class="icon-btn" data-act="wk" data-d="1" aria-label="'+esc(L('Next week'))+'" style="transform:scaleX(-1)">'+ICON.back+'</button>'+(S.wk?'<button class="btn ghost sm" data-act="wk" data-d="0">'+esc(L('This week'))+'</button>':'')+'</div>'+(S.readonly?'':'<button class="btn" data-act="newevent">'+ICON.plus+esc(L('Add to planner'))+'</button>')+'</div>';
  h+='<div class="legend">'+Object.keys(KINDS).map(function(k){ return '<span><i style="background:'+KINDS[k].color+'"></i>'+esc(L(KINDS[k].label))+'</span>'; }).join('')+'<span>'+esc(L('Shoots come in from tasks by themselves'))+'</span></div>';
  h+=weekBlock(true);
  return h;
}

// ================= Team settings (PM) =================
function vSettings(){
  var h='<button class="btn ghost sm back" data-act="back">'+ICON.back+esc(L('Back'))+'</button><header><h1 class="display">'+esc(L('Team settings'))+'</h1></header>';
  h+='<div class="sec"><h3>'+esc(L('Team'))+'</h3><span class="muted">'+S.people.length+'</span></div><div class="rows">'+S.people.map(function(p){
    return '<div class="rw">'+av(p)+'<span class="rw-m"><b>'+esc(p.name)+'</b><span class="muted">'+esc(L(ROLES[p.role]))+(tgOn()?' · '+esc(p.tgChat?L('Telegram connected'):L('Telegram not connected')):'')+(S.hosted?' · '+esc(p.pinHash?L('PIN set'):L('No PIN yet')):'')+'</span></span>'+(hasFinance()&&!S.readonly?'<button class="btn ghost sm'+(p.finance?' on':'')+'" data-act="finaccess" data-id="'+esc(p.id)+'" aria-pressed="'+(!!p.finance)+'">'+ICON.lock+esc(p.finance?L('Finance access'):L('No finance'))+'</button>':'')+(S.readonly?'':(S.hosted&&p.pinHash?'<button class="btn ghost sm" data-act="resetpin" data-id="'+esc(p.id)+'">'+esc(L('Reset PIN'))+'</button>':'')+(p.id===S.me?'':'<button class="btn ghost sm" data-act="rmperson" data-id="'+esc(p.id)+'">'+esc(L('Remove'))+'</button>'))+'</div>';
  }).join('')+'</div>';
  if(!S.readonly) h+='<form data-form="person" class="card addp"><b>'+esc(L('Add a person'))+'</b><div class="addp-r"><label class="sr" for="np">'+esc(L('Name'))+'</label><input class="input" id="np" placeholder="'+esc(L('Name'))+'"><div class="chips" role="group" aria-label="'+esc(L('Role'))+'">'+['designer','video','pm','exec'].map(function(r){ return '<button type="button" class="pick" data-act="prole" data-r="'+r+'" aria-pressed="'+((S.prole||'designer')===r)+'">'+esc(L(ROLES[r]))+'</button>'; }).join('')+'</div><button class="btn primary" type="submit">'+ICON.plus+esc(L('Add a person'))+'</button></div><p class="err" id="perr" role="alert"></p></form>';
  var nSample=['projects','tasks','ann','events'].reduce(function(n,c){ return n+S[c].filter(function(x){return x.sample;}).length; },0);
  if(nSample && !S.readonly) h+='<div class="sec"><h3>'+esc(L('Sample data'))+'</h3></div><div class="card addp"><p style="margin:0">'+esc(L('The tool came with {n} sample items so you can see how it feels. Clear them when the team starts for real.',{n:nSample}))+'</p><div><button class="btn" data-act="clearsample">'+ICON.x+esc(L('Clear sample data'))+'</button></div></div>';
  h+='<div class="sec"><h3>'+esc(L('Backup'))+'</h3></div><div class="card addp"><p style="margin:0">'+esc(L('Download every task as a spreadsheet. Do it once a month and keep it in Drive.'))+'</p><div><button class="btn" data-act="export">'+ICON.download+esc(L('Export to spreadsheet'))+'</button></div></div>';
  if(S.mode==='live' && !S.hosted) h+='<div class="sec"><h3>'+esc(L('Who can use this'))+'</h3></div><p class="muted" style="max-width:640px;line-height:1.6;margin:0">'+esc(L('Share this page with the team from the Share button, as Contributor or Editor. Then each person opens it and taps their name.'))+'</p>';
  return h;
}

// ================= Command palette =================
function palItems(){
  var q=(S.palette.q||'').trim().toLowerCase(), out=[];
  function m(s){ return !q || String(s).toLowerCase().indexOf(q)>=0; }
  var acts=[
    {g:'Actions', icon:ICON.plus, label:L('New task'), kbd:'N', run:'newtask'},
    isPM()?{g:'Actions', icon:ICON.folder, label:L('New project'), run:'newproj'}:null,
    isPM()?{g:'Actions', icon:ICON.cal, label:L('Add to planner'), run:'newevent'}:null,
    {g:'Actions', icon:S.dark?ICON.sun:ICON.moon, label:L(S.dark?'Light mode':'Dark mode'), run:'theme'},
    {g:'Actions', icon:ICON.globe, label:LANG==='mn'?'English':'Монгол', run:'lang', arg:LANG==='mn'?'en':'mn'},
    {g:'Actions', icon:ICON.swap, label:L('Switch person'), run:'switch'}
  ].filter(Boolean);
  if(isPM()) [['needs','Review'],['projects','Projects'],['agency','Agency']].forEach(function(x){ acts.push({g:'Go to', icon:ICON.arrow, label:L(x[1]), run:'go', arg:x[0]}); });
  if(hasFinance()) acts.push({g:'Go to', icon:ICON.lock, label:L('Finance'), run:'go', arg:'finance'});
  acts.forEach(function(a){ if(m(a.label)) out.push(a); });
  var tasks=S.tasks.filter(function(t){ return (isPM()||t.who===S.me) && (m(t.title)||m(project(t.project).client)); }).slice(0,8);
  tasks.forEach(function(t){ out.push({g:'Tasks', icon:'<span class="pdot" style="background:'+esc(project(t.project).color)+'"></span>', label:t.title, sub:project(t.project).client+' · '+L(STATUS[t.status]), run:t.versions.length?'openreview':'info', arg:t.id}); });
  if(isPM()) S.projects.filter(function(p){ return m(p.client)||m(p.name); }).slice(0,5).forEach(function(p){ out.push({g:'Projects', icon:'<span class="pdot" style="background:'+esc(p.color)+'"></span>', label:p.client, sub:p.name, run:'openproj', arg:p.id}); });
  if(q) S.people.filter(function(p){ return m(p.name); }).forEach(function(p){ out.push({g:'People', icon:av(p), label:L('View as {name}',{name:p.name}), sub:L(ROLES[p.role]), run:'pick', arg:p.id}); });
  return out;
}
function renderPalette(){
  var el=$('#palette');
  if(!S.palette){ el.innerHTML=''; return; }
  var items=palItems(); S.palItems=items; if(S.palette.i>=items.length) S.palette.i=Math.max(0,items.length-1);
  var g='', list=items.map(function(it,i){ var head=it.g!==g?'<div class="pal-g">'+esc(L(it.g))+'</div>':''; g=it.g; return head+'<button class="pal-it" data-pi="'+i+'" aria-selected="'+(i===S.palette.i)+'" role="option">'+it.icon+'<span>'+esc(it.label)+'</span>'+(it.sub?'<span class="sub">'+esc(it.sub)+'</span>':it.kbd?'<span class="sub"><kbd>'+it.kbd+'</kbd></span>':'')+'</button>'; }).join('');
  var had=$('#palq'), val=had?had.value:S.palette.q||'';
  el.innerHTML='<div class="pal-ov" data-palov><div class="pal" role="dialog" aria-label="'+esc(L('Search'))+'"><div class="pal-in">'+ICON.search+'<input id="palq" placeholder="'+esc(L('Type a task, project, person or action'))+'" autocomplete="off" role="combobox" aria-expanded="true"><kbd>Esc</kbd></div><div class="pal-list" role="listbox">'+(list||'<div class="pal-empty">'+esc(L('Nothing found'))+'</div>')+'</div><div class="pal-f"><span><kbd>↑</kbd><kbd>↓</kbd> '+esc(L('move'))+'</span><span><kbd>↵</kbd> '+esc(L('open'))+'</span><span><kbd>Esc</kbd> '+esc(L('close'))+'</span></div></div></div>';
  var inp=$('#palq'); inp.value=val; inp.focus(); inp.setSelectionRange(val.length,val.length);
  var sel=el.querySelector('[aria-selected="true"]'); if(sel) sel.scrollIntoView({block:'nearest'});
}
