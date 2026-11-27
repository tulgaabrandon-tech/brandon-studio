// ================= Modals =================
function field(label, inner, opt){ return '<div class="field"><span class="flabel">'+esc(label)+(opt?' <span class="muted" style="font-weight:400">'+esc(L('optional'))+'</span>':'')+'</span>'+inner+'</div>'; }
function renderModal(){
  var m=$('#modal');
  if(!S.modal){
    // Leave gently: fade the sheet out, then clear it (unless another one opened meanwhile)
    if(m.classList.contains('on') && !m.classList.contains('closing') && !RM){ m.classList.add('closing'); setTimeout(function(){ if(!S.modal){ m.classList.remove('on'); m.innerHTML=''; } m.classList.remove('closing'); },170); }
    else if(RM || !m.firstChild){ m.classList.remove('on'); m.innerHTML=''; }
    return;
  }
  if(m.classList.contains('closing')){ m.classList.remove('closing'); m.innerHTML=''; }
  m.classList.add('on');
  var md=S.modal, body='';
  if(md.kind==='submit'){
    var t=task(md.id), v=last(t), links=md.links||[''];
    body='<h2>'+esc(L('Send your work'))+'</h2><p class="muted s13" style="margin-top:-10px">'+esc(L('{title}. {name} reviews it.',{title:t.title,name:pmOf(t).name}))+'</p>'+
      (window.BO_BRIDGE && typeof demoFile==='function' ? field(L('File'), '<div class="demo-file"><img src="'+esc(demoFile(t).url)+'" alt=""><div><b>'+esc(demoFile(t).name)+'</b><span class="muted s13">'+esc(L('Sample file for the demo. In real work you paste your Drive link here.'))+'</span></div></div>') :
      field(L('Drive link'), links.map(function(l,i){ var pl=parseLink(l); return '<div class="linkrow"><input class="input" data-link="'+i+'" placeholder="'+esc(L('Paste the Google Drive link'))+'" value="'+esc(l)+'" inputmode="url" autocomplete="off">'+(l?'<span class="chip '+(pl?(pl.kind==='drive'?'ok':''):'red')+'">'+(pl?(pl.kind==='drive'?ICON.check+esc(L('Drive file')):pl.kind==='folder'?esc(L('Drive folder')):esc(L('Link'))):'!')+'</span>':'')+(links.length>1?'<button class="icon-btn sm" data-act="rmlink" data-i="'+i+'" aria-label="'+esc(L('Remove'))+'">'+ICON.x+'</button>':'')+'</div>'; }).join('')+
        '<p class="muted s13" style="margin:2px 0 0">'+esc(L('In Drive: Share, then Copy link. Set it so anyone at Brand On can view.'))+'</p><button class="lnk" data-act="addlink" style="align-self:flex-start">'+esc(L('+ Add another link'))+'</button>'))+
      (changesAsked(t)?field(L('Did you fix these?'), '<div class="fixlist">'+v.comments.map(function(c,ci){ return '<label class="fixrow"><input type="checkbox" data-fix="'+ci+'"'+((md.fixes||{})[ci]?' checked':'')+'><span>'+esc(c.text)+'</span></label>'; }).join('')+'</div>'):'')+
      field(L('Anything to say?'), '<input class="input" id="sn" placeholder="'+esc(L('e.g. Opened up the P, tested at small size'))+'" value="'+esc(md.note||'')+'">', true)+
      '<p class="err" id="serr" role="alert"></p><div class="m-a"><button class="btn ghost" data-act="close">'+esc(L('Cancel'))+'</button><button class="btn primary xl" data-act="sendsub">'+esc(L('Send for review'))+'</button></div>';
  }
  if(md.kind==='task'){
    var edit=!!md.id, cands=crew().slice().sort(function(a,b){ return (a.id===S.me?-1:b.id===S.me?1:0) || active(a.id)-active(b.id); });
    if(isPM()) cands=cands.concat(S.people.filter(function(p){return p.role==='pm';}));
    var who=md.who||(isPM()?(cands[0]||{}).id:S.me), whoP=person(who);
    var dueOpts=[[1,L('Tomorrow')],[nextFriday(),L('Friday')],[7,L('Next week')],[14,L('In 2 weeks')]];
    var dueOff=md.due!=null?days(md.due):null;
    body='<h2>'+esc(L(edit?'Edit task':'New task'))+'</h2>'+
      field(L('What needs doing?'), '<input class="input" id="tt" placeholder="'+esc(L('e.g. Logo directions'))+'" value="'+esc(md.title||'')+'">')+
      field(L('Who?'), '<div class="chips">'+cands.map(function(p){ return '<button class="pick" data-act="twho" data-id="'+esc(p.id)+'" aria-pressed="'+(p.id===who)+'">'+av(p)+esc(p.id===S.me?L('Me'):p.name)+(p.role!=='pm'?' <small>'+esc(L('{n} active',{n:active(p.id)}))+'</small>':'')+'</button>'; }).join('')+'</div>')+
      field(L('By when?'), '<div class="chips">'+dueOpts.map(function(o){ return '<button class="pick" data-act="tdue" data-o="'+o[0]+'" aria-pressed="'+(dueOff===o[0])+'">'+esc(o[1])+'</button>'; }).join('')+'<label class="pick datepick'+(dueOff!=null&&!dueOpts.some(function(o){return o[0]===dueOff;})?' on':'')+'">'+ICON.cal+'<input type="date" id="tdate" value="'+esc(md.due||'')+'" aria-label="'+esc(L('Other date'))+'"></label></div>')+
      field(L('Project'), S.projects.length?'<select class="input" id="tp">'+S.projects.map(function(p){ return '<option value="'+esc(p.id)+'"'+(p.id===md.project?' selected':'')+'>'+esc(p.client+': '+p.name)+'</option>'; }).join('')+'</select>':'<p class="err">'+esc(L('Add a project first.'))+'</p>')+
      (whoP.role==='video'?'<label class="fixrow"><input type="checkbox" id="tshoot"'+(md.shootOn?' checked':'')+'><span>'+esc(L('It is a shoot'))+'</span></label>'+(md.shootOn?'<input class="input" id="tshootp" placeholder="'+esc(L('Where is the shoot?'))+'" value="'+esc(md.shoot||'')+'">':''):'')+
      (md.more||md.brief?field(L('Brief'), '<textarea class="input" id="tb" placeholder="'+esc(L('What, for whom, must-haves, reference links'))+'" style="min-height:80px">'+esc(md.brief||'')+'</textarea>', true):'<button class="lnk" data-act="more" style="align-self:flex-start">'+esc(L('+ Add a brief or reference'))+'</button>')+
      '<p class="err" id="terr" role="alert"></p><div class="m-a">'+(edit?'<button class="btn ghost" data-act="rmtask" style="margin-right:auto">'+esc(L('Delete'))+'</button>':'')+'<button class="btn ghost" data-act="close">'+esc(L('Cancel'))+'</button><button class="btn primary xl" data-act="savetask">'+esc(L(edit?'Save':'Create'))+'</button></div>';
  }
  if(md.kind==='event'){
    var wd=[]; for(var i=0;i<14;i++){ var x=new Date(d(S.wk*7)); x.setDate(x.getDate()+i); wd.push(x); }
    var sel=md.date||iso(TODAY), whoSel=md.who||'all';
    body='<h2>'+esc(L(md.id?'Edit':'Add to planner'))+'</h2>'+
      field(L('What'), '<input class="input" id="et" placeholder="'+esc(L('e.g. Client meeting'))+'" value="'+esc(md.title||'')+'">')+
      field(L('Kind'), '<div class="chips">'+Object.keys(KINDS).filter(function(k){return k!=='shoot';}).map(function(k){ return '<button class="pick" data-act="ekind" data-k="'+k+'" aria-pressed="'+((md.k||'meeting')===k)+'"><i class="kdot" style="background:'+KINDS[k].color+'"></i>'+esc(L(KINDS[k].label))+'</button>'; }).join('')+'</div>')+
      field(L('Day'), '<div class="chips">'+wd.map(function(x){ var di=iso(x); return '<button class="pick sm" data-act="eday" data-date="'+di+'" aria-pressed="'+(sel===di)+'">'+esc(dow(x))+' '+x.getDate()+'</button>'; }).join('')+'</div>')+
      '<div style="display:flex;gap:12px;flex-wrap:wrap"><div style="width:150px">'+field(L('Time'), '<input class="input" id="eh" type="time" value="'+esc(md.time||'')+'">', true)+'</div><div style="flex:1;min-width:180px">'+field(L('Place'), '<input class="input" id="ep" placeholder="'+esc(L('Office, client, studio'))+'" value="'+esc(md.place||'')+'">', true)+'</div></div>'+
      field(L('Who'), '<div class="chips"><button class="pick" data-act="ewho" data-id="all" aria-pressed="'+(whoSel==='all')+'">'+esc(L('Everyone'))+'</button>'+S.people.map(function(p){ return '<button class="pick" data-act="ewho" data-id="'+esc(p.id)+'" aria-pressed="'+(whoSel!=='all'&&whoSel.indexOf(p.id)>=0)+'">'+av(p)+esc(p.name)+'</button>'; }).join('')+'</div>')+
      '<p class="err" id="eerr" role="alert"></p><div class="m-a">'+(md.id?'<button class="btn ghost" data-act="rmevent" style="margin-right:auto">'+esc(L('Delete'))+'</button>':'')+'<button class="btn ghost" data-act="close">'+esc(L('Cancel'))+'</button><button class="btn primary xl" data-act="saveevent">'+esc(L('Save'))+'</button></div>';
  }
  if(md.kind==='proj'){
    var pms=S.people.filter(function(p){return p.role==='pm';}), pmSel=md.pm||(isPM()?S.me:(pms[0]||{}).id), ty=md.type||'custom';
    var tp=TEMPLATES[ty]||TEMPLATES.custom, n=tp.tasks.length;
    var preview = md.id ? '' : (ty==='social' ? L('Creates weekly posts and a weekly reel, every {every}.',{every:L((md.every||'week')==='month'?'month':'week')}) : n ? L('Creates {n} tasks, spread until the deadline. You can change them after.',{n:n}) : L('Starts empty. Add tasks yourself.'));
    body='<h2>'+esc(L(md.id?'Edit project':'New project'))+'</h2>'+
      (md.id?'':field(L('What kind of work?'), '<div class="chips">'+Object.keys(TEMPLATES).map(function(k){ return '<button class="pick" data-act="ptype" data-k="'+k+'" aria-pressed="'+(ty===k)+'">'+esc(L(TEMPLATES[k].label))+'</button>'; }).join('')+'</div>'+(preview?'<p class="muted s13" style="margin:2px 0 0">'+esc(preview)+'</p>':'')))+
      (ty==='social'&&!md.id?field(L('Repeat'), '<div class="chips">'+[['week','Every week'],['month','Every month']].map(function(o){ return '<button class="pick" data-act="pevery" data-k="'+o[0]+'" aria-pressed="'+((md.every||'week')===o[0])+'">'+esc(L(o[1]))+'</button>'; }).join('')+'</div>'):'')+
      '<div style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px">'+field(L('Client'), '<input class="input" id="pc" placeholder="'+esc(L('Client or brand'))+'" value="'+esc(md.client||'')+'">')+field(L('Project'), '<input class="input" id="pn" placeholder="'+esc(L('e.g. Brand identity'))+'" value="'+esc(md.name||'')+'">', true)+'</div>'+
      '<div style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px">'+field(L('Final deadline'), '<input class="input" id="pdl" type="date" value="'+esc(md.deadline||'')+'">', ty==='social')+field(L('Client contact'), '<input class="input" id="pct" placeholder="'+esc(L('Name and phone'))+'" value="'+esc(md.contact||'')+'">', true)+'</div>'+
      field('PM', '<div class="chips">'+pms.map(function(p){ return '<button class="pick" data-act="ppm" data-id="'+esc(p.id)+'" aria-pressed="'+(p.id===pmSel)+'">'+av(p)+esc(p.name)+'</button>'; }).join('')+'</div>')+
      field(L('Brief'), '<textarea class="input" id="pbr" placeholder="'+esc(L('What the client wants, for whom, must-haves, references'))+'" style="min-height:84px">'+esc(md.brief||'')+'</textarea>', true)+
      field(L('Drive folder'), '<input class="input" id="pd" placeholder="'+esc(L('Paste the Drive folder link'))+'" value="'+esc(md.drive||'')+'" inputmode="url">', true)+
      '<p class="err" id="perr2" role="alert"></p><div class="m-a">'+(md.id?'<button class="btn ghost" data-act="rmproj" style="margin-right:auto">'+esc(L('Delete project'))+'</button><button class="btn ghost" data-act="archive">'+esc(L(project(md.id).archived?'Restore from archive':'Archive'))+'</button>':'')+'<button class="btn ghost" data-act="close">'+esc(L('Cancel'))+'</button><button class="btn primary xl" data-act="saveproj">'+esc(L(md.id?'Save':'Create'))+'</button></div>';
  }
  if(md.kind==='pin'){ body=pinBody(md); }
  if(md.kind.charAt(0)==='f' && md.kind!=='fx'){ var fb=finModal(md); if(fb) body=fb; }
  if(md.kind==='thread'){
    var tt=task(md.id), th=tt.thread||[], other=isPM()?person(tt.who):pmOf(tt);
    body='<h2>'+esc(L('Questions'))+'</h2><p class="muted s13" style="margin:-10px 0 0">'+esc(tt.title)+' · '+esc(project(tt.project).client)+'</p>'+
      '<div class="thread">'+(th.length?th.map(function(m){ var mine=m.by===S.me; return '<div class="msg'+(mine?' mine':'')+'">'+(mine?'':av(person(m.by)))+'<div><div class="bubble">'+esc(m.text)+'</div><span class="muted s13">'+esc(person(m.by).name)+' · '+esc(short(String(m.at||'').slice(0,10)))+'</span></div></div>'; }).join(''):'<p class="muted" style="text-align:center;margin:12px 0">'+esc(L('No questions yet. Ask {name} anything about this task.',{name:other.name}))+'</p>')+'</div>'+
      (S.readonly?'':'<div class="field"><label class="sr" for="qx">'+esc(L('Your question'))+'</label><textarea class="input" id="qx" placeholder="'+esc(L('Write to {name}',{name:other.name}))+'" style="min-height:70px"></textarea></div>')+
      '<p class="err" id="qerr" role="alert"></p><div class="m-a"><button class="btn ghost" data-act="close">'+esc(L('Close'))+'</button>'+(S.readonly?'':'<button class="btn primary" data-act="sendq">'+esc(L('Send'))+'</button>')+'</div>';
  }
  if(md.kind==='deliver'){
    var dp=project(md.id);
    body='<h2>'+esc(L('Deliver to client'))+'</h2><p class="muted" style="margin:-8px 0 0">'+esc(dp.client)+(dp.name?' · '+esc(dp.name):'')+'</p>'+
      field(L('Final files'), '<input class="input" id="dl" placeholder="'+esc(L('Paste the Drive folder with the final files'))+'" value="'+esc(dp.drive||'')+'" inputmode="url">')+
      '<p class="err" id="derr" role="alert"></p><div class="m-a"><button class="btn ghost" data-act="close">'+esc(L('Cancel'))+'</button><button class="btn primary xl" data-act="savedeliver">'+ICON.check+esc(L('Mark as delivered'))+'</button></div>';
  }
  if(md.kind==='keys'){
    var K=[['Ctrl/⌘ K','Search or jump to'],['1-5','Switch workspace'],['V','Select tool'],['N','New'],['↵','Open the selection'],['E','Edit the selection'],['Space','Open the work full size'],['↑ ↓','Move the selection'],['Shift / Ctrl + click','Select'],['Ctrl/⌘ A','Select all'],['Tab','Hide or show panels'],['[ ]','Previous or next period'],['Ctrl/⌘ Z','Undo'],['Esc','Clear the selection'],['?','Keyboard shortcuts'],['A · S · M','Approve, send back, mark (viewer)'],['← →','Versions'],['1-9','Pick a person']];
    body='<h2>'+esc(L('Keyboard shortcuts'))+'</h2><div class="keys">'+K.map(function(k){ return '<div><span>'+esc(L(k[1]))+'</span><kbd>'+esc(k[0])+'</kbd></div>'; }).join('')+'</div><div class="m-a"><button class="btn" data-act="close">'+esc(L('Close'))+'</button></div>';
  }
  if(md.kind==='join'){
    body='<h2>'+esc(L('Join the team'))+'</h2>'+field(L('Your name'), '<input class="input" id="jn" value="'+esc(md.name||'')+'">')+
      field(L('What do you do?'), '<div class="chips">'+['designer','video','pm'].map(function(r){ return '<button class="pick" data-act="jrole" data-r="'+r+'" aria-pressed="'+((md.role||'designer')===r)+'">'+esc(L(ROLES[r]))+'</button>'; }).join('')+'</div>')+
      '<p class="err" id="jerr" role="alert"></p><div class="m-a"><button class="btn ghost" data-act="close">'+esc(L('Cancel'))+'</button><button class="btn primary xl" data-act="savejoin">'+esc(L('Join the team'))+'</button></div>';
  }
  if(md.kind==='history'){
    body='<h2>'+esc(L('Changes in this session'))+'</h2>'+(S.hist.length?'<div class="hist">'+S.hist.map(function(h,i){ return '<div class="hist-r'+(h.done?' done':'')+'"><span class="hist-t">'+esc(('0'+h.at.getHours()).slice(-2)+':'+('0'+h.at.getMinutes()).slice(-2))+'</span><span class="hist-m">'+esc(h.m)+'</span>'+(h.undo&&!h.done?'<button class="btn sm ghost" data-act="histundo" data-i="'+i+'">'+esc(L('Undo'))+'</button>':h.done?'<span class="muted s13">'+esc(L('Undone'))+'</span>':'')+'</div>'; }).join('')+'</div>':'<p class="muted">'+esc(L('No changes yet in this session.'))+'</p>')+'<div class="m-a"><button class="btn" data-act="close">'+esc(L('Close'))+'</button></div>';
  }
  morph(m,'<div class="modal glass" role="dialog" aria-modal="true">'+body+'</div>');
}
// Keep what's typed when a modal re-renders
function keep(){
  var md=S.modal; if(!md) return;
  if(md.kind==='ftx'||md.kind==='fdeal'||md.kind==='fstaff'){ keepFin(); return; }
  var g=function(id){ var e=document.getElementById(id); return e?e.value:undefined; };
  if(md.kind==='submit'){ md.links=Array.prototype.map.call(document.querySelectorAll('[data-link]'),function(e){return e.value;}); md.note=g('sn'); md.fixes={}; Array.prototype.forEach.call(document.querySelectorAll('[data-fix]'),function(e){ if(e.checked) md.fixes[e.dataset.fix]=true; }); }
  if(md.kind==='task'){ md.title=g('tt'); if(g('tp')!=null) md.project=g('tp'); if(g('tb')!=null) md.brief=g('tb'); if(g('tshootp')!=null) md.shoot=g('tshootp'); var sh=$('#tshoot'); if(sh) md.shootOn=sh.checked; }
  if(md.kind==='event'){ md.title=g('et'); md.time=g('eh'); md.place=g('ep'); }
  if(md.kind==='proj'){ md.client=g('pc'); md.name=g('pn'); md.drive=g('pd'); md.deadline=g('pdl'); md.contact=g('pct'); md.brief=g('pbr'); }
  if(md.kind==='keys'){
    var K=[['Ctrl/⌘ K','Search or jump to'],['1-5','Switch workspace'],['V','Select tool'],['N','New'],['↵','Open the selection'],['E','Edit the selection'],['Space','Open the work full size'],['↑ ↓','Move the selection'],['Shift / Ctrl + click','Select'],['Ctrl/⌘ A','Select all'],['Tab','Hide or show panels'],['[ ]','Previous or next period'],['Ctrl/⌘ Z','Undo'],['Esc','Clear the selection'],['?','Keyboard shortcuts'],['A · S · M','Approve, send back, mark (viewer)'],['← →','Versions'],['1-9','Pick a person']];
    body='<h2>'+esc(L('Keyboard shortcuts'))+'</h2><div class="keys">'+K.map(function(k){ return '<div><span>'+esc(L(k[1]))+'</span><kbd>'+esc(k[0])+'</kbd></div>'; }).join('')+'</div><div class="m-a"><button class="btn" data-act="close">'+esc(L('Close'))+'</button></div>';
  }
  if(md.kind==='join'){ md.name=g('jn'); }
}
function openModal(m){ S.modal=m; S.menu=false; S.fab=false; render(); setTimeout(function(){ var f=document.querySelector('#modal input:not([type=checkbox]):not([type=date]), #modal textarea'); if(f && !f.value) f.focus(); },30); }
function closeModal(){ S.modal=null; if(S.dirty){ S.dirty=false; } render(); }

// ================= Actions =================
var RM=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;
function transition(fn){ if(document.startViewTransition && !RM){ document.startViewTransition(fn); } else fn(); }
function go(v){ transition(function(){ S.view=v; S.modal=null; S.pending=null; S.marking=false; S.compare=false; S.menu=false; render(); window.scrollTo({top:0}); }); }
function pushGo(v){ S.trail.push(S.view); go(v); }
function setSeen(a){ a.seen=a.seen||{}; a.seen[S.me]=true; var s={}; s[S.me]=true; patch('ann', a.id, {seen:s}); }
document.addEventListener('click', function(e){
  if(S.menu && !e.target.closest('.menu-w')){ S.menu=false; render(); }
  if(S.fab && !e.target.closest('.fab-w') && !e.target.closest('.fab-scrim')){ S.fab=false; }
  if(S.fab && e.target.closest('.fab-item')){ S.fab=false; }
  var stage=e.target.closest('.stage.can');
  if(stage && !e.target.closest('.pin')){
    var r=stage.getBoundingClientRect(), im=stage.querySelector('img'); if(im) r=im.getBoundingClientRect();
    S.pending={file:+stage.dataset.stage, x:Math.max(0,Math.min(100,(e.clientX-r.left)/r.width*100)), y:Math.max(0,Math.min(100,(e.clientY-r.top)/r.height*100))};
    render(); var ta=$('#ct'); if(ta) ta.focus({preventScroll:true}); return;
  }
  var pi=e.target.closest('[data-pi]'); if(pi){ runPal(+pi.dataset.pi); return; }
  if(e.target.hasAttribute&&e.target.hasAttribute('data-palov')){ S.palette=null; renderPalette(); return; }
  var b=e.target.closest('[data-act]');
  if(!b){ if(e.target.id==='modal') closeModal(); return; }
  if(b.disabled) return;
  var a=b.dataset.act, id=b.dataset.id, t=id?task(id):null;
  if(a.charAt(0)==='f' && finAction(a,b,id)) return;
  if(a==='finaccess'){ var fp=person(id); fp.finance=!fp.finance; persist('people',fp); render(); return; }
  // sign in
  if(a==='pick'){ S.palette=null; if(S.hosted && S.remember!==id){ openModal({kind:'pin', id:id}); focusPin(); return; } enterAs(id); return; }
  if(a==='switch'){ lockFinance(); if(S.hosted){ S.remember=null; try{ localStorage.removeItem('bo.me'); }catch(x){} } S.me=null; S.menu=false; S.view=null; S.modal=null; S.trail=[]; S.pending=null; S.marking=false; S.compare=false; render(); window.scrollTo({top:0}); return; }
  if(a==='join'){ openModal({kind:'join'}); return; }
  if(a==='jrole'){ keep(); S.modal.role=b.dataset.r; renderModal(); return; }
  if(a==='savejoin'){ keep(); var nm=(S.modal.name||'').trim(); if(!nm){ $('#jerr').textContent=L('Write a name.'); return; }
    var np=add('people',{id:newId('p'), name:nm, role:S.modal.role||'designer', color:COLORS[S.people.length%COLORS.length]}); S.me=np.id; S.modal=null; S.view=home(); render(); return; }
  // palette and shortcuts
  if(a==='palette'){ openPalette(); return; }
  if(a==='fab'){ S.fab=!S.fab; render(); return; }
  if(a==='keys'){ openModal({kind:'keys'}); return; }
  if(a==='clearsample'){ var gone=[]; ['projects','tasks','ann','events'].forEach(function(c){ S[c].filter(function(x){return x.sample;}).forEach(function(x){ gone.push([c,x]); destroy(c,x.id); }); }); render(); toast(L('Sample data cleared'), function(){ gone.forEach(function(g){ add(g[0],g[1]); }); }); return; }
  // shell
  if(a==='menu'){ S.menu=!S.menu; render(); return; }
  if(a==='lang'){ LANG=b.dataset.l; try{ localStorage.setItem('bo.lang',LANG); }catch(x){} document.documentElement.lang=LANG; render(); return; }
  if(a==='theme'){ S.dark=!S.dark; try{ localStorage.setItem('bo.dark',S.dark?'1':'0'); }catch(x){} render(); return; }
  if(a==='go'){ S.trail=[]; go(b.dataset.v); return; }
  if(a==='back'){ go(S.trail.pop()||home()); return; }
  if(a==='hinted'){ S.hintDone=true; try{ localStorage.setItem('bo.hint.'+S.me,'1'); }catch(x){} render(); return; }
  if(a==='openproj'){ S.project=id; pushGo('project'); return; }
  if(a==='openreview'){ S.task=id; S.ver=null; pushGo('review'); return; }
  if(a==='close'){ closeModal(); return; }
  // crew flow
  if(a==='start'){ var before=t.status; t.status='doing'; persist('tasks',t); render(); toast(L('Started. Send it when it is ready.'), function(){ t.status=before; persist('tasks',t); }); return; }
  if(a==='submit'){ openModal({kind:'submit', id:id, links:['']}); return; }
  if(a==='addlink'){ keep(); S.modal.links.push(''); renderModal(); var ls=document.querySelectorAll('[data-link]'); ls[ls.length-1].focus(); return; }
  if(a==='rmlink'){ keep(); S.modal.links.splice(+b.dataset.i,1); renderModal(); return; }
  if(a==='sendsub'){
    keep(); var md=S.modal, tk=task(md.id), files=[], bad=false;
    if(window.BO_BRIDGE && typeof demoFile==='function') files.push(demoFile(tk));
    else md.links.forEach(function(l){ if(!l.trim()) return; var pl=parseLink(l); if(!pl){ bad=true; return; } files.push(pl); });
    if(bad){ $('#serr').textContent=L("That doesn't look like a link."); return; }
    if(!files.length){ $('#serr').textContent=L('Paste a link first.'); return; }
    var lv=last(tk); if(changesAsked(tk) && lv) lv.comments.forEach(function(c,ci){ if(md.fixes&&md.fixes[ci]) c.fixed=true; });
    tk.versions.push({files:files, note:(md.note||'').trim(), by:S.me, date:iso(TODAY), comments:[], decision:null}); tk.status='review';
    persist('tasks',tk); S.modal=null; S.trail=[]; go(home()); toast(L('Sent. {name} reviews it next.',{name:pmOf(tk).name})); return;
  }
  // review
  if(a==='ver'){ S.ver=+b.dataset.i; S.pending=null; S.compare=false; render(); return; }
  if(a==='compare'){ S.compare=!S.compare; S.pending=null; render(); return; }
  if(a==='mark'){ S.marking=!S.marking; render(); return; }
  if(a==='focus'){ var c=$('#'+(b.dataset.cmp==='1'?'pc':'c')+b.dataset.ci); if(c){ c.scrollIntoView({block:'nearest'}); c.classList.add('flash'); setTimeout(function(){c.classList.remove('flash');},900); } return; }
  if(a==='rmnote'){ var tr0=task(S.task), v0=last(tr0); v0.comments.splice(+b.dataset.ci,1); persist('tasks',tr0); render(); return; }
  if(a==='approve'||a==='changes'){
    var tr=task(S.task), v=last(tr); if(a==='changes'&&!v.comments.length) return;
    var snap=clone(tr);
    v.decision=a==='approve'?'approved':'changes'; v.decidedAt=iso(TODAY); tr.status=a==='approve'?'done':'doing'; persist('tasks',tr);
    stamp(a==='approve'?L('APPROVED'):L('TO FIX'), a!=='approve');
    setTimeout(function(){ S.trail=[]; go('needs'); }, RM?0:650);
    toast(a==='approve'?L('Approved. {name} can see it.',{name:person(tr.who).name}):L('Sent back. {name} will fix it.',{name:person(tr.who).name}), function(){ var cur=task(snap.id); Object.keys(snap).forEach(function(k){ cur[k]=snap[k]; }); persist('tasks',cur); });
    return;
  }
  // announcements
  if(a==='allann'){ S.allAnn=true; render(); return; }
  if(a==='gotit'){ var an=S.ann.filter(function(x){return x.id===id;})[0]; if(an) setSeen(an); render(); return; }
  if(a==='aud'){ var at=$('#at').value, ax=$('#ax').value; S.aud=b.dataset.a; render(); $('#at').value=at; $('#ax').value=ax; return; }
  if(a==='rmann'){ var gone=S.ann.filter(function(x){return x.id===id;})[0]; destroy('ann',id); render(); toast(L('Announcement deleted'), function(){ add('ann',gone); }); return; }
  // planner
  if(a==='wk'){ var dd=+b.dataset.d; S.wk = dd===0?0:S.wk+dd; render(); return; }
  if(a==='mo'){ var dm=+b.dataset.d; S.mo = dm===0?0:(S.mo||0)+dm; render(); return; }
  if(a==='calview'){ S.calView=b.dataset.v; if(S.calView==='month' && S.mo==null) S.mo=0; render(); return; }
  if(a==='calweek'){ var tgt=fromIso(b.dataset.date), mon=weekDays(0)[0]; S.wk=Math.floor((tgt-mon)/(7*864e5)); S.calView='week'; render(); return; }
  if(a==='newevent'){ openModal({kind:'event', date:b.dataset.date||null}); return; }
  if(a==='editevent'){ var ev=S.events.filter(function(x){return x.id===id;})[0]; openModal({kind:'event', id:ev.id, title:ev.title, k:ev.kind, date:ev.date, time:ev.time, place:ev.place, who:ev.who==='all'?'all':(ev.who||[]).slice()}); return; }
  if(a==='evauto'){ var st=task(id); if(st && (isPM()||st.who===S.me)) openTask(st); else toast(L('Change a shoot date on its task.')); return; }
  if(a==='ekind'||a==='eday'||a==='ewho'){ keep(); var em=S.modal;
    if(a==='ekind') em.k=b.dataset.k;
    if(a==='eday') em.date=b.dataset.date;
    if(a==='ewho'){ if(id==='all') em.who='all'; else { var w=em.who==='all'||!em.who?[]:em.who.slice(), ix=w.indexOf(id); if(ix>=0) w.splice(ix,1); else w.push(id); em.who=w.length?w:'all'; } }
    renderModal(); return; }
  if(a==='saveevent'){ keep(); var e2=S.modal; if(!e2.title||!e2.title.trim()){ $('#eerr').textContent=L('Write what it is.'); $('#et').focus(); return; }
    var rec={title:e2.title.trim(), kind:e2.k||'meeting', date:e2.date||iso(TODAY), time:e2.time||'', place:(e2.place||'').trim(), who:e2.who||'all'};
    if(e2.id){ var ex=S.events.filter(function(x){return x.id===e2.id;})[0]; Object.assign(ex,rec); persist('events',ex); } else { rec.id=newId('e'); add('events',rec); }
    S.modal=null; render(); toast(L('Saved. The team sees it on their page.')); return; }
  if(a==='rmevent'){ var ge=S.events.filter(function(x){return x.id===S.modal.id;})[0]; destroy('events',ge.id); S.modal=null; render(); toast(L('Removed from the planner'), function(){ add('events',ge); }); return; }
  // tasks
  if(a==='newtask'){ var pid=b.dataset.proj||(S.view==='project'?S.project:null)||(S.view==='review'&&task(S.task)?task(S.task).project:null)||((S.projects.filter(function(p){return p.pm===S.me;})[0]||S.projects[0]||{}).id);
    openModal({kind:'task', project:pid, due:iso(d(nextFriday()))}); return; }
  if(a==='info'){ openTask(t); return; }
  if(a==='twho'){ keep(); S.modal.who=id; renderModal(); return; }
  if(a==='tdue'){ keep(); S.modal.due=iso(d(+b.dataset.o)); renderModal(); return; }
  if(a==='more'){ keep(); S.modal.more=true; renderModal(); var tb=$('#tb'); if(tb) tb.focus(); return; }
  if(a==='savetask'){
    keep(); var m=S.modal; if(!m.title||!m.title.trim()){ $('#terr').textContent=L('Write what needs doing.'); $('#tt').focus(); return; }
    if(!m.project){ $('#terr').textContent=L('Add a project first.'); return; }
    var whoId=m.who||(isPM()?(crew().slice().sort(function(x,y){return active(x.id)-active(y.id);})[0]||me()).id:S.me);
    var fields={title:m.title.trim(), who:whoId, due:m.due||iso(d(nextFriday())), project:m.project, brief:(m.brief||'').trim(), shoot:(person(whoId).role==='video'&&m.shootOn)?((m.shoot||'').trim()||'?'):''};
    if(m.id){ var et=task(m.id); Object.assign(et,fields); persist('tasks',et); S.modal=null; render(); toast(L('Task saved')); return; }
    var nt=add('tasks', Object.assign({id:newId('t'), status:'todo', by:S.me, created:iso(TODAY), versions:[]}, fields));
    S.modal=null; render(); toast(nt.who===S.me?L('Added to your list'):L('Given to {name}',{name:person(nt.who).name})); return;
  }
  if(a==='rmtask'){ var gt=task(S.modal.id); destroy('tasks',gt.id); S.modal=null; if(S.view==='review'&&S.task===gt.id){ S.trail=[]; S.view=home(); } render(); toast(L('Task deleted'), function(){ add('tasks',gt); }); return; }
  // projects
  if(a==='newproj'){ openModal({kind:'proj'}); return; }
  if(a==='editproj'){ var pp=project(id); openModal({kind:'proj', id:pp.id, client:pp.client, name:pp.name, pm:pp.pm, drive:pp.drive, deadline:pp.deadline, contact:pp.contact, brief:pp.brief, type:pp.type}); return; }
  if(a==='ptype'){ keep(); S.modal.type=b.dataset.k; renderModal(); return; }
  if(a==='pevery'){ keep(); S.modal.every=b.dataset.k; renderModal(); return; }
  if(a==='archive'){ var ap=project(S.modal.id); ap.archived=!ap.archived; persist('projects',ap); S.modal=null; S.trail=[]; go('projects'); toast(L(ap.archived?'Moved to the archive':'Restored from the archive')); return; }
  if(a==='deliver'){ openModal({kind:'deliver', id:id}); return; }
  if(a==='savedeliver'){ var dl=$('#dl').value.trim(); if(dl && !safeUrl(dl)){ $('#derr').textContent=L("That doesn't look like a link."); return; } var dpp=project(S.modal.id); dpp.delivered={at:iso(TODAY), by:S.me, link:safeUrl(dl)}; persist('projects',dpp); S.modal=null; render(); stamp(L('DELIVERED'), false); toast(L('Delivered. Nice work, team.')); return; }
  if(a==='undeliver'){ var up=project(id); delete up.delivered; persist('projects',up); render(); return; }
  if(a==='thread'){ openModal({kind:'thread', id:id}); setTimeout(function(){ var th=document.querySelector('.thread'); if(th) th.scrollTop=th.scrollHeight; },40); return; }
  if(a==='sendq'){ var qt=$('#qx').value.trim(); if(!qt){ $('#qx').focus(); return; } var qtk=task(S.modal.id); qtk.thread=(qtk.thread||[]).concat([{by:S.me, text:qt, at:new Date().toISOString()}]); persist('tasks',qtk); renderModal(); setTimeout(function(){ var th=document.querySelector('.thread'); if(th) th.scrollTop=th.scrollHeight; var q=$('#qx'); if(q) q.focus(); },30); return; }
  if(a==='tg'){ connectTelegram(); S.menu=false; render(); return; }
  if(a==='resetpin'){ var rp=person(id); delete rp.pinHash; persist('people',rp); render(); toast(L('PIN reset. {name} creates a new one next time.',{name:rp.name})); return; }
  if(a==='export'){ exportCsv(); return; }
  if(a==='ppm'){ keep(); S.modal.pm=id; renderModal(); return; }
  if(a==='saveproj'){ keep(); var pm2=S.modal, cl=(pm2.client||'').trim(); if(!cl){ $('#perr2').textContent=L('Write the client name.'); $('#pc').focus(); return; }
    var pf={client:cl, name:(pm2.name||'').trim(), pm:pm2.pm||(isPM()?S.me:((S.people.filter(function(p){return p.role==='pm';})[0])||{}).id), drive:safeUrl(pm2.drive), deadline:pm2.deadline||'', contact:(pm2.contact||'').trim(), brief:(pm2.brief||'').trim()};
    if(pm2.id){ var ep=project(pm2.id); Object.assign(ep,pf); persist('projects',ep); S.modal=null; render(); toast(L('Project saved')); return; }
    var ty=pm2.type||'custom', npj=Object.assign({id:newId('p'), color:COLORS[(S.projects.length+1)%COLORS.length], created:iso(TODAY), type:ty}, pf);
    if(ty==='social') npj.recur={every:pm2.every||'week', items:TEMPLATES.social.recur.map(function(r){ return [L(r[0]), r[1]]; }), last:''};
    add('projects', npj);
    var made=templateTasks(ty, pf.deadline, npj.id, npj.pm); made.forEach(function(t){ add('tasks',t); });
    if(npj.recur) runRecurring();
    S.modal=null; S.project=npj.id; pushGo('project'); toast(made.length?L('Project created with {n} tasks',{n:made.length}):L('Project created')); return; }
  if(a==='rmproj'){ var gp=project(S.modal.id), gts=S.tasks.filter(function(x){return x.project===gp.id;});
    destroy('projects',gp.id); gts.forEach(function(x){ destroy('tasks',x.id); }); S.modal=null; S.trail=[]; go('projects');
    toast(L('Project deleted'), function(){ add('projects',gp); gts.forEach(function(x){ add('tasks',x); }); }); return; }
  // team
  if(a==='prole'){ var nv=$('#np').value; S.prole=b.dataset.r; render(); $('#np').value=nv; return; }
  if(a==='rmperson'){ var gpp=person(id); destroy('people',id); render(); toast(L('Removed {name}',{name:gpp.name}), function(){ add('people',gpp); }); return; }
});
function stamp(text, back){
  if(RM) return;
  var w=document.createElement('div'); w.className='stamp-wrap'; w.innerHTML='<div class="stamp'+(back?' back':'')+'">'+esc(text)+'</div>';
  document.body.appendChild(w); setTimeout(function(){ w.style.transition='opacity .25s'; w.style.opacity='0'; setTimeout(function(){ w.remove(); },260); }, 820);
}
function openTask(t){ if(!t) return; openModal({kind:'task', id:t.id, title:t.title, who:t.who, due:t.due, project:t.project, brief:t.brief, shoot:t.shoot, shootOn:!!t.shoot, more:!!t.brief}); }
document.addEventListener('change', function(e){
  if(!S.modal) return;
  if(e.target.id==='tdate'){ keep(); S.modal.due=e.target.value||S.modal.due; renderModal(); return; }
  if(e.target.id==='tshoot'){ keep(); renderModal(); var sp=$('#tshootp'); if(sp) sp.focus(); return; }
});
document.addEventListener('input', function(e){
  if(e.target.dataset && e.target.dataset.link!=null){ // live check of pasted links
    var row=e.target.parentNode, pl=parseLink(e.target.value), ch=row.querySelector('.chip');
    if(!ch){ ch=document.createElement('span'); row.insertBefore(ch, e.target.nextSibling); }
    if(!e.target.value){ ch.remove(); return; }
    ch.className='chip '+(pl?(pl.kind==='drive'?'ok':''):'red');
    ch.innerHTML=pl?(pl.kind==='drive'?ICON.check+esc(L('Drive file')):pl.kind==='folder'?esc(L('Drive folder')):esc(L('Link'))):'!';
  }
});
document.addEventListener('error', function(e){ var el=e.target; if(el && el.hasAttribute && el.hasAttribute('data-fallback')) el.remove(); }, true);
document.addEventListener('submit', function(e){
  var f=e.target.closest('[data-form]'); if(!f) return; e.preventDefault();
  if(f.dataset.form==='fincode'){ var code=$('#fcode').value; if(!code){ $('#fcode').focus(); return; } unlockFinance(code).catch(function(e){ var m=String(e&&e.message||'');
    if(m==='confirm'){ render(); setTimeout(function(){ var x=$('#fcode'); if(x) x.focus(); },30); return; }
    var msg=m==='mismatch'?F('Хоёр код таарсангүй. Дахин эхэлнэ үү.','The two codes did not match. Start again.'):m==='denied'?F('Энэ хуудсан дээр санхүү харах эрх танд алга. Эзэмшигч таныг Editor болгох хэрэгтэй.','You cannot read finance on this page. The owner needs to make you an Editor.'):m==='offline'?F('Санхүү энд нээгдэхгүй.','Finance does not open here.'):F('Код буруу байна.','That code is not right.');
    if(m==='mismatch') render(); var er=$('#fcerr'); if(er) er.textContent=msg; var x=$('#fcode'); if(x){ x.value=''; x.focus(); } }); return; }
  if(f.dataset.form==='studio'){ var pw=$('#spw').value; if(!pw){ $('#spw').focus(); return; } $('#lerr').textContent=''; studioLogin(pw).catch(function(){ $('#lerr').textContent=L('That password is not right.'); }); return; }
  if(f.dataset.form==='ann'){ var ti=$('#at').value.trim(), tx=$('#ax').value.trim(); if(!ti){ $('#aerr').textContent=L('Give it a title.'); $('#at').focus(); return; }
    add('ann',{id:newId('a'), by:S.me, date:iso(TODAY), title:ti, text:tx, aud:S.aud, seen:{}}); render(); toast(L('Announced. It shows at the top of everyone\'s page.')); return; }
  if(f.dataset.form==='person'){ var n=$('#np').value.trim(); if(!n){ $('#perr').textContent=L('Write a name.'); return; }
    add('people',{id:newId('p'), name:n, role:S.prole||'designer', color:COLORS[S.people.length%COLORS.length]}); render(); return; }
  if(f.dataset.form==='comment'){
    var txt=$('#ct').value.trim(); if(!txt){ $('#ct').focus(); return; }
    var tr=task(S.task), v=last(tr), c={by:S.me, text:txt}, ts=$('#cts');
    if(S.pending){ c.x=+S.pending.x.toFixed(2); c.y=+S.pending.y.toFixed(2); c.file=S.pending.file; }
    if(ts && ts.value.trim()) c.t=ts.value.trim();
    v.comments.push(c); S.pending=null; S.marking=false; persist('tasks',tr); render();
  }
});
function openPalette(){ S.menu=false; S.palette={q:'', i:0}; render(); }
function runPal(i){
  var it=(S.palItems||[])[i]; if(!it) return; S.palette=null; renderPalette();
  var fake={dataset:{v:it.arg, l:it.arg, id:it.arg}, disabled:false, closest:function(){return null;}};
  if(it.run==='go'){ S.trail=[]; go(it.arg); return; }
  if(it.run==='lang'){ LANG=it.arg; try{ localStorage.setItem('bo.lang',LANG); }catch(x){} document.documentElement.lang=LANG; render(); return; }
  if(it.run==='openreview'){ S.task=it.arg; S.ver=null; pushGo('review'); return; }
  if(it.run==='openproj'){ S.project=it.arg; pushGo('project'); return; }
  if(it.run==='info'){ openTask(task(it.arg)); return; }
  if(it.run==='pick'){ if(S.hosted){ openModal({kind:'pin', id:it.arg}); focusPin(); return; } enterAs(it.arg); return; }
  var btn=document.createElement('button'); btn.dataset.act=it.run; if(it.arg) btn.dataset.id=it.arg; btn.style.display='none'; document.body.appendChild(btn); btn.click(); btn.remove();
}
function typing(){ var a=document.activeElement; return a && (/INPUT|TEXTAREA|SELECT/.test(a.tagName) || a.isContentEditable); }
document.addEventListener('input', function(e){ if(e.target.id==='palq'){ S.palette.q=e.target.value; S.palette.i=0; renderPalette(); } });
document.addEventListener('keydown', function(e){
  var k=e.key, mod=e.metaKey||e.ctrlKey;
  if(mod && (k==='k'||k==='K')){ e.preventDefault(); if(S.palette){ S.palette=null; renderPalette(); } else if(S.me) openPalette(); return; }
  if(S.palette){
    if(k==='Escape'){ e.preventDefault(); S.palette=null; renderPalette(); return; }
    if(k==='ArrowDown'){ e.preventDefault(); S.palette.i=Math.min((S.palItems||[]).length-1,S.palette.i+1); renderPalette(); return; }
    if(k==='ArrowUp'){ e.preventDefault(); S.palette.i=Math.max(0,S.palette.i-1); renderPalette(); return; }
    if(k==='Enter'){ e.preventDefault(); runPal(S.palette.i); return; }
    return;
  }
  if(k==='Escape'){
    if(S.modal){ closeModal(); return; }
    if(S.menu){ S.menu=false; render(); return; }
    if(S.fab){ S.fab=false; render(); return; }
    if(S.pending||S.marking){ S.pending=null; S.marking=false; render(); return; }
    if(S.view==='review'||S.view==='project'||S.view==='settings'){ go(S.trail.pop()||home()); return; }
    return;
  }
  if(typing() || S.modal || mod || e.altKey) return;
  if(!S.me){ if(/^[1-9]$/.test(k)){ var ps=document.querySelectorAll('.person'); var b=ps[+k-1]; if(b) b.click(); } return; }
  if(k==='/'){ e.preventDefault(); openPalette(); return; }
  if(k==='?'){ openModal({kind:'keys'}); return; }
  if(S.view==='review'){
    var t=task(S.task); if(!t) return;
    if(k==='ArrowLeft'||k==='ArrowRight'){ var vi=S.ver==null?t.versions.length-1:S.ver; vi=Math.max(0,Math.min(t.versions.length-1,vi+(k==='ArrowLeft'?-1:1))); S.ver=vi; S.pending=null; S.compare=false; render(); return; }
    var q=function(sel){ var b=document.querySelector(sel); if(b&&!b.disabled) b.click(); };
    if(k==='a'||k==='A'){ q('[data-act=approve]'); return; }
    if(k==='s'||k==='S'){ q('[data-act=changes]'); return; }
    if(k==='m'||k==='M'){ q('[data-act=mark]'); return; }
    return;
  }
  if((k==='n'||k==='N') && !S.readonly){ openModal({kind:'task', project:(S.view==='project'?S.project:((S.projects.filter(function(p){return p.pm===S.me;})[0]||S.projects[0]||{}).id)), due:iso(d(nextFriday()))}); return; }
  if(k==='Enter' && S.view==='home'){ var hb=document.querySelector('.focus-a .btn.primary'); if(hb){ e.preventDefault(); hb.click(); } }
});
