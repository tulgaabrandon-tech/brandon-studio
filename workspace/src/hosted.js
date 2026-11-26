// ================= Own hosting: Supabase store with the same API the app already uses =================
var CFG = window.BO_CONFIG || {};
function deepMerge(a,b){ Object.keys(b).forEach(function(k){ var v=b[k]; if(v&&typeof v==='object'&&!Array.isArray(v)&&a[k]&&typeof a[k]==='object'&&!Array.isArray(a[k])) deepMerge(a[k],v); else a[k]=v; }); return a; }
function supaDB(sb){
  var cache={}, listeners={};
  function snap(col){ var m=cache[col]||{}; return {docs:Object.keys(m).map(function(id){ var v=m[id]; return {id:id, exists:true, data:function(){ return v; }, metadata:{fromCache:false}}; }), metadata:{fromCache:false, hasPendingWrites:false}}; }
  function emit(col){ (listeners[col]||[]).forEach(function(l){ l(snap(col)); }); }
  function chk(r){ if(r && r.error){ var e=r.error; throw {code:(e.code==='42501'||/permission|policy/i.test(e.message||''))?'invalid_argument':'unavailable', message:e.message}; } return r; }
  sb.channel('docs-live').on('postgres_changes', {event:'*', schema:'public', table:'docs'}, function(p){
    var r=(p.new&&p.new.col)?p.new:p.old; if(!r||!r.col) return;
    cache[r.col]=cache[r.col]||{};
    if(p.eventType==='DELETE') delete cache[r.col][r.id]; else cache[r.col][r.id]=p.new.data;
    emit(r.col);
  }).subscribe();
  function load(col){ return sb.from('docs').select('id,data').eq('col',col).then(function(r){ chk(r); cache[col]={}; (r.data||[]).forEach(function(x){ cache[col][x.id]=x.data; }); emit(col); }); }
  function split(path){ var i=path.indexOf('/'); return [path.slice(0,i), path.slice(i+1)]; }
  function row(col,id,data){ return {col:col, id:id, data:data, updated_at:new Date().toISOString()}; }
  return {
    collection:function(col){ return { onSnapshot:function(cb, err){ (listeners[col]=listeners[col]||[]).push(cb); load(col).catch(function(e){ if(err) err(e); }); return function(){}; } }; },
    doc:function(path){
      var p=split(path), col=p[0], id=p[1];
      return {
        get:function(){ return sb.from('docs').select('data').eq('col',col).eq('id',id).maybeSingle().then(function(r){ chk(r); var v=r.data&&r.data.data; return {exists:!!v, data:function(){ return v; }}; }); },
        set:function(data){ (cache[col]=cache[col]||{})[id]=data; return sb.from('docs').upsert(row(col,id,data)).then(chk); },
        update:function(data){ var cur=clone((cache[col]||{})[id]||{}); deepMerge(cur,data); (cache[col]=cache[col]||{})[id]=cur; return sb.from('docs').upsert(row(col,id,cur)).then(chk); },
        delete:function(){ if(cache[col]) delete cache[col][id]; return sb.from('docs').delete().eq('col',col).eq('id',id).then(chk); },
        acquire:function(){ return sb.from('docs').insert(row('locks', col+':'+id, {at:new Date().toISOString()})).then(function(r){ return {acquired:!r.error}; }); }
      };
    }
  };
}
var SB=null;
function bootHosted(){
  SB=window.supabase.createClient(CFG.supabaseUrl, CFG.supabaseAnonKey, {auth:{persistSession:true, autoRefreshToken:true}});
  S.hosted=true;
  SB.auth.getSession().then(function(r){
    if(r.data && r.data.session) startHosted(); else { S.mode='login'; render(); }
  }).catch(function(){ S.mode='login'; render(); });
}
function startHosted(){
  DB=supaDB(SB); S.uid='studio';
  try{ var rm=localStorage.getItem('bo.me'); if(rm) S.remember=rm; }catch(e){}
  startLive();
}
function studioLogin(pw){
  return SB.auth.signInWithPassword({email:CFG.studioEmail, password:pw}).then(function(r){ if(r.error) throw r.error; S.mode='loading'; render(); startHosted(); });
}
function vLogin(){
  return '<div class="login" style="justify-content:center"><div class="login-h"><span class="mark" style="width:52px;height:52px;border-radius:16px">'+LOGO+'</span><div class="eyebrow">BrandOn Studio</div><h1 class="display">'+esc(L('Studio login'))+'</h1><p class="lede" style="text-align:center">'+esc(L('Enter the studio password once on this device. After that, everyone uses their own PIN.'))+'</p>'+
    '<form data-form="studio" class="card" style="padding:20px;display:flex;flex-direction:column;gap:10px;width:min(380px,100%)"><label class="sr" for="spw">'+esc(L('Studio password'))+'</label><input class="input" id="spw" type="password" autocomplete="current-password" placeholder="'+esc(L('Studio password'))+'"><button class="btn primary xl" type="submit">'+esc(L('Open the studio'))+'</button><p class="err" id="lerr" role="alert"></p></form>'+langSeg()+'</div></div>';
}

// ================= PIN per person =================
function sha(text){
  if(!(window.crypto&&crypto.subtle)) return Promise.resolve(btoa(unescape(encodeURIComponent(text))));
  return crypto.subtle.digest('SHA-256', new TextEncoder().encode(text)).then(function(b){ return Array.prototype.map.call(new Uint8Array(b),function(x){ return ('0'+x.toString(16)).slice(-2); }).join(''); });
}
function pinHash(pid,pin){ return sha('brandon:'+pid+':'+pin); }
function enterAs(pid){
  S.me=pid; S.trail=[]; S.allAnn=false; S.view=null; S.recurDone=false;
  if(S.hosted){ try{ localStorage.setItem('bo.me',pid); }catch(e){} }
  S.modal=null; go(home()); setTimeout(openDeepLink,60);
}
function pinBody(md){
  var p=person(md.id), create=!p.pinHash;
  var title=create?(md.step2?L('Repeat your PIN'):L('Create your 4-digit PIN')):L('Enter your PIN');
  return '<div style="display:flex;flex-direction:column;align-items:center;gap:14px;text-align:center">'+av(p,true)+'<h2>'+esc(p.name)+'</h2><p class="muted" style="margin:-6px 0 0">'+esc(title)+'</p>'+
    '<input class="input pin-in" id="pin" inputmode="numeric" autocomplete="one-time-code" maxlength="4" pattern="[0-9]*" aria-label="PIN" style="width:180px;text-align:center;font-size:28px;letter-spacing:.5em;font-weight:800">'+
    '<p class="err" id="pinerr" role="alert"></p>'+(create?'':'<p class="muted s13" style="margin:0">'+esc(L('Forgot it? Ask Suvdaa or Reka to reset your PIN.'))+'</p>')+'</div><div class="m-a" style="justify-content:center"><button class="btn ghost" data-act="close">'+esc(L('Cancel'))+'</button></div>';
}
function checkPin(val){
  var md=S.modal, p=person(md.id);
  if(!/^\d{4}$/.test(val)) return;
  pinHash(p.id,val).then(function(h){
    if(!p.pinHash){
      if(!md.step2){ md.first=h; md.step2=true; renderModal(); focusPin(); return; }
      if(h!==md.first){ md.step2=false; md.first=null; renderModal(); $('#pinerr').textContent=L('The two PINs did not match. Try again.'); focusPin(); return; }
      p.pinHash=h; patch('people',p.id,{pinHash:h}); enterAs(p.id); toast(L('PIN saved. Use it next time you switch to {name}.',{name:p.name}));
      return;
    }
    if(h===p.pinHash) enterAs(p.id);
    else { $('#pin').value=''; $('#pinerr').textContent=L('Wrong PIN. Try again.'); var m=document.querySelector('#modal .modal'); if(m){ m.classList.remove('shake'); void m.offsetWidth; m.classList.add('shake'); } }
  });
}
function focusPin(){ setTimeout(function(){ var x=$('#pin'); if(x){ x.value=''; x.focus(); } },30); }
document.addEventListener('input', function(e){ if(e.target.id==='pin'){ e.target.value=e.target.value.replace(/\D/g,'').slice(0,4); if(e.target.value.length===4) checkPin(e.target.value); } });

// ================= Deep links from Telegram (#task=ID) =================
function openDeepLink(){
  var m=/task=([\w-]+)/.exec(location.hash||''); if(!m||!S.me) return;
  var t=task(m[1]); try{ history.replaceState(null,'',location.pathname+location.search); }catch(e){ location.hash=''; }
  if(!t) return;
  if(t.versions.length){ S.task=t.id; S.ver=null; pushGo('review'); } else openTask(t);
}

// ================= Telegram =================
function tgOn(){ return !!CFG.botUsername; }
function connectTelegram(){
  var p=me(), code=(Math.random().toString(36).slice(2,8)+Date.now().toString(36).slice(-4));
  p.tgCode=code; patch('people',p.id,{tgCode:code});
  setTimeout(function(){ window.open('https://t.me/'+encodeURIComponent(CFG.botUsername)+'?start='+code,'_blank','noopener'); },300);
  toast(L('Telegram opens. Tap Start and you are connected.'));
}

// ================= Project templates =================
var TEMPLATES={
  logo:{label:'Logo', tasks:[['Research and moodboard','designer',.2],['Logo directions','designer',.5],['Refine the chosen direction','designer',.75],['Logo book','designer',.95]]},
  brand:{label:'Branding', tasks:[['Research and moodboard','designer',.15],['Logo directions','designer',.35],['Color and type','designer',.55],['Applications and mockups','designer',.75],['Brandbook','designer',.95]]},
  deck:{label:'Deck', tasks:[['Content structure','designer',.25],['Design direction, 3 slides','designer',.5],['Full deck','designer',.85],['Final fixes','designer',1]]},
  story:{label:'Storyboard', tasks:[['Idea and script','video',.3],['Storyboard frames','designer',.7],['Final storyboard','designer',1]]},
  video:{label:'Video', tasks:[['Script and shot list','video',.25],['Shoot','video',.5,true],['Edit v1','video',.75],['Color and sound','video',1]]},
  social:{label:'Monthly social', tasks:[], recur:[['Weekly posts','designer'],['Weekly reel','video']]},
  custom:{label:'Custom', tasks:[]}
};
function leastBusy(role){ var c=S.people.filter(function(p){ return p.role===role; }).sort(function(a,b){ return active(a.id)-active(b.id); })[0]; return (c||crew()[0]||me()).id; }
function templateTasks(type, deadline, pid, by){
  var tp=TEMPLATES[type]; if(!tp) return [];
  var span=Math.max(1, days(deadline||iso(d(14)))), load={};
  S.people.forEach(function(p){ load[p.id]=active(p.id); });
  function pickFor(role){ var c=S.people.filter(function(p){ return p.role===role; }).sort(function(a,b){ return load[a.id]-load[b.id]; })[0]; var id=(c||crew()[0]||me()).id; load[id]=(load[id]||0)+1; return id; }
  return tp.tasks.map(function(t){ var off=Math.max(1, Math.round(t[2]*span)); return {id:newId('t'), project:pid, title:L(t[0]), who:pickFor(t[1]), due:iso(d(off)), status:'todo', by:by, created:iso(TODAY), versions:[], brief:'', shoot:t[3]?'?':''}; });
}

// ================= Repeating work for retainers =================
function periodKey(every){ if(every==='month') return 'M'+iso(TODAY).slice(0,7); var mon=new Date(TODAY); mon.setDate(mon.getDate()-((mon.getDay()+6)%7)); return 'W'+iso(mon); }
function periodDue(every){ if(every==='month'){ var x=new Date(TODAY.getFullYear(), TODAY.getMonth()+1, 0); return iso(x); } var f=new Date(TODAY); f.setDate(f.getDate()+((5-f.getDay()+7)%7)); return iso(f); }
function periodLabel(every){ var due=fromIso(periodDue(every)); return every==='month'?(LANG==='mn'?(due.getMonth()+1)+'-р сар':MON_EN[due.getMonth()]):L('week of {d}',{d:md(due)}); }
function runRecurring(){
  S.projects.filter(function(p){ return p.recur && p.recur.items && p.recur.items.length && !p.archived; }).forEach(function(p){
    var key=periodKey(p.recur.every); if(p.recur.last===key) return;
    var make=function(){
      if(p.recur.last===key) return;
      p.recur.items.forEach(function(it){ add('tasks',{id:newId('t'), project:p.id, title:it[0]+' · '+periodLabel(p.recur.every), who:leastBusy(it[1]), due:periodDue(p.recur.every), status:'todo', by:p.pm, created:iso(TODAY), versions:[], brief:'', shoot:'', recurring:true}); });
      p.recur.last=key; persist('projects',p); softRender();
    };
    if(S.mode==='live' && DB) DB.doc('meta/recur-'+p.id+'-'+key).acquire({holder:S.me||'x', ttlMs:600000}).then(function(r){ if(r.acquired) make(); }).catch(function(){});
    else make();
  });
}

// ================= Export to spreadsheet =================
function exportCsv(){
  var rows=[[L('Client'),L('Project'),L('Task'),L('Who'),L('Status'),L('Due'),L('Versions'),L('Last decision')]];
  S.tasks.forEach(function(t){ var p=project(t.project), v=last(t); rows.push([p.client,p.name,t.title,person(t.who).name,L(STATUS[t.status]),t.due,t.versions.length,v&&v.decision?L(v.decision==='approved'?'Approved':'Sent back with notes'):'']); });
  var csv='﻿'+rows.map(function(r){ return r.map(function(c){ c=String(c==null?'':c); return /[",\n]/.test(c)?'"'+c.replace(/"/g,'""')+'"':c; }).join(','); }).join('\n');
  try{ var a=document.createElement('a'); a.href=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8'})); a.download='brandon-studio-'+iso(TODAY)+'.csv'; document.body.appendChild(a); a.click(); a.remove(); toast(L('Spreadsheet downloaded')); }
  catch(e){ toast(L('Could not download here. Open the hosted version to export.')); }
}
