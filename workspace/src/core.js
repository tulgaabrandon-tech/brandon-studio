// ================= Dates =================
var TODAY = (function(){ var x=new Date(); x.setHours(0,0,0,0); return x; })();
function d(off){ var x=new Date(TODAY); x.setDate(x.getDate()+off); return x; }
function iso(x){ return x.getFullYear()+'-'+String(x.getMonth()+1).padStart(2,'0')+'-'+String(x.getDate()).padStart(2,'0'); }
function fromIso(s){ var p=String(s||iso(TODAY)).split('-'); return new Date(+p[0],+p[1]-1,+p[2]); }
function days(s){ return Math.round((fromIso(s)-TODAY)/864e5); }
function short(s){ return days(s)===0 ? L('today') : md(fromIso(s)); }
function dueLabel(s){
  var n=days(s);
  if(LANG==='mn'){
    if(n<0) return {t:Math.abs(n)+' хоног хоцорсон', tone:'red'};
    if(n===0) return {t:'Өнөөдөр', tone:'red'};
    if(n===1) return {t:'Маргааш', tone:'warn'};
    if(n<7) return {t:dowLong(fromIso(s))+' гараг', tone:''};
    return {t:md(fromIso(s))+' хүртэл', tone:''};
  }
  if(n<0) return {t:Math.abs(n)+(Math.abs(n)===1?' day':' days')+' late', tone:'red'};
  if(n===0) return {t:'Due today', tone:'red'};
  if(n===1) return {t:'Due tomorrow', tone:'warn'};
  if(n<7) return {t:'Due '+dowLong(fromIso(s)), tone:''};
  return {t:'Due '+md(fromIso(s)), tone:''};
}
function nextFriday(){ var n=(5-TODAY.getDay()+7)%7; return n===0?7:n; }

// ================= State =================
var ROLES = { pm:'Project manager', designer:'Graphic designer', video:'Videographer', exec:'Management' };
var STATUS = { todo:'Not started', doing:'In progress', review:'Needs feedback', done:'Completed' };
var KINDS = { meeting:{label:'Meeting',color:'#2F5DA8'}, shoot:{label:'Shoot',color:'#1F7A5A'}, deadline:{label:'Deadline',color:'#DA1F34'}, off:{label:'Day off',color:'#8A8F99'} };
var COLORS = ['#DA1F34','#2F5DA8','#7A4FB0','#1F7A5A','#B5532A','#8A6D00','#2B6E5B','#C2410C'];
var S = {
  mode:'loading', me:null, uid:null, view:null, project:null, task:null, ver:null, modal:null, pending:null, marking:false, compare:false,
  dark:(function(){ try{ return localStorage.getItem('bo.dark')==='1'; }catch(e){ return false; } })(),
  menu:false, fab:false, palette:null, wk:0, aud:'all', allAnn:false, trail:[], readonly:false, slow:false,
  people:[], projects:[], tasks:[], ann:[], events:[]
};

// ================= Store: live shared data, or demo in memory =================
var DB=null, USER=null, chains={};
var IS_MAC=/Mac|iPhone|iPad/.test(navigator.platform||navigator.userAgent||'');
function clone(o){ return JSON.parse(JSON.stringify(o)); }
function body(o){ var c=clone(o); delete c.id; return c; }
function newId(prefix){ return prefix+Date.now().toString(36)+Math.random().toString(36).slice(2,6); }
function persist(col, obj){
  if(S.mode!=='live') return;
  var path=col+'/'+obj.id, data=body(obj);
  chains[path]=(chains[path]||Promise.resolve()).then(function(){ return DB.doc(path).set(data); }).catch(saveFailed);
}
function patch(col, id, data){
  if(S.mode!=='live') return;
  var path=col+'/'+id;
  chains[path]=(chains[path]||Promise.resolve()).then(function(){ return DB.doc(path).update(data); }).catch(saveFailed);
}
function destroy(col, id){
  S[col]=S[col].filter(function(x){ return x.id!==id; });
  if(S.mode!=='live') return;
  var path=col+'/'+id;
  chains[path]=(chains[path]||Promise.resolve()).then(function(){ return DB.doc(path).delete(); }).catch(saveFailed);
}
function add(col, obj){ S[col].push(obj); persist(col, obj); return obj; }
function saveFailed(e){
  if(e && e.code==='invalid_argument'){ S.readonly=true; toast(L("You can view this, but you can't make changes. Ask Suvdaa or Reka for access.")); render(); return; }
  toast(L('Could not save. Check your connection.'));
}

var COLS=['people','projects','tasks','ann','events'];
function startLive(){
  S.mode='live'; var got={}, timer=setTimeout(function(){ S.slow=true; render(); },10000);
  COLS.forEach(function(col){
    DB.collection(col).onSnapshot(function(snap){
      S[col]=snap.docs.map(function(x){ var o=clone(x.data()); o.id=x.id; return o; });
      if(!snap.metadata.fromCache){ got[col]=true; if(COLS.every(function(c){return got[c];})){ clearTimeout(timer); S.slow=false; if(!S.ready){ S.ready=true; maybeSeed(); setTimeout(openDeepLink,80); } } }
      if(col==='people' && S.me && !S.people.some(function(p){return p.id===S.me;})) S.me=null;
      if(col==='people' && !S.me && S.remember && S.people.some(function(p){return p.id===S.remember;})){ S.me=S.remember; S.view=null; }
      softRender();
    }, function(err){ clearTimeout(timer); S.slow=true; render(); });
  });
}
// Re-render from live data without wiping what someone is typing
function softRender(){
  var a=document.activeElement;
  if(S.modal || (a && /INPUT|TEXTAREA|SELECT/.test(a.tagName) && a.closest('#root'))){ S.dirty=true; return; }
  render();
}
document.addEventListener('focusout', function(){ setTimeout(function(){ if(S.dirty && !S.modal){ var a=document.activeElement; if(!(a && /INPUT|TEXTAREA|SELECT/.test(a.tagName))){ S.dirty=false; render(); } } },50); });

// First visit with an empty store: load the sample set once, guarded by a lease so two viewers can't both do it
function maybeSeed(){
  if(S.readonly || !S.people.length || S.projects.some(function(p){return p.sample;})) return;
  if(S.hosted && !CFG.sampleData) return;
  var ref=DB.doc('meta/seeded');
  ref.get().then(function(snap){
    if(snap.exists) return;
    return ref.acquire({holder:S.uid||'x', ttlMs:60000}).then(function(r){
      if(!r.acquired) return;
      return ref.get().then(function(again){
        if(again.exists && again.data() && again.data().at) return;
        var s=sampleSet(), list=[];
        ['projects','tasks','ann','events'].forEach(function(col){ s[col].forEach(function(o){ list.push([col,o]); }); });
        var p=ref.set({at:new Date().toISOString()});
        list.forEach(function(x){ p=p.then(function(){ return DB.doc(x[0]+'/'+x[1].id).set(body(x[1])); }); });
        return p;
      });
    });
  }).catch(function(){});
}
function boot(){
  render();
  if(CFG.supabaseUrl && window.supabase){ bootHosted(); return; }
  if(window.BO_HOSTED){ S.mode='setup'; render(); return; }
  var c=window.claude;
  if(!c || typeof c.use!=='function'){ startDemo(); return; }
  Promise.all([c.use('db'), c.use('user')]).then(function(r){
    DB=r[0]; USER=r[1];
    if(!DB || !USER){ startDemo(); return; }
    return USER.id().then(function(uid){
      if(!uid){ startDemo(); return; }
      S.uid=uid;
      if(USER.can) USER.can('data.write').then(function(ok){ if(ok===false){ S.readonly=true; softRender(); } }).catch(function(){});
      startLive();
    });
  }).catch(startDemo);
}

// ================= Lookups =================
function $(s){ return document.querySelector(s); }
function esc(s){ return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];}); }
function safeUrl(u){ u=String(u||'').trim(); return /^https:\/\//i.test(u)?u:''; }
var NOBODY={id:'', name:'?', role:'designer', color:'#8A8F99'};
var NOPROJ={id:'', client:'?', name:'', color:'#8A8F99'};
function person(id){ return S.people.filter(function(p){return p.id===id;})[0] || NOBODY; }
function project(id){ return S.projects.filter(function(p){return p.id===id;})[0] || NOPROJ; }
function task(id){ return S.tasks.filter(function(t){return t.id===id;})[0]; }
function me(){ return person(S.me); }
function isPM(){ return me().role==='pm'; }
function pmOf(t){ var p=project(t.project); return person(p.pm); }
function crew(){ return S.people.filter(function(p){return p.role==='designer'||p.role==='video';}); }
function isExec(){ return me().role==='exec'; }
function initials(n){ return String(n||'?').split(/[\s-]+/).map(function(w){return w[0]||'';}).join('').slice(0,2).toUpperCase(); }
function av(p,lg){ var col=esc(p.color||'#8A8F99'); return '<span class="'+(lg?'av-lg':'av')+'" style="background:'+col+';--c:'+col+'" title="'+esc(p.name)+'">'+esc(initials(p.name))+'</span>'; }
var TONE={todo:'',doing:'warn',review:'red',done:'ok'};
function chip(st){ return '<span class="chip '+TONE[st]+'"><span class="dot"></span>'+esc(L(STATUS[st]))+'</span>'; }
function last(t){ return t.versions&&t.versions.length ? t.versions[t.versions.length-1] : null; }
function changesAsked(t){ var v=last(t); return t.status==='doing' && !!v && v.decision==='changes'; }
function projStatus(pid){
  var ts=S.tasks.filter(function(t){return t.project===pid;});
  if(!ts.length || ts.every(function(t){return t.status==='todo';})) return 'todo';
  if(ts.every(function(t){return t.status==='done';})) return 'done';
  if(ts.some(function(t){return t.status==='review';})) return 'review';
  return 'doing';
}
function active(pid){ return S.tasks.filter(function(t){return t.who===pid && t.status!=='done';}).length; }
function seenBy(a,pid){ return !!(a.seen && a.seen[pid]); }

// ================= Drive links =================
function parseLink(u){
  u=String(u||'').trim(); if(!/^https:\/\//i.test(u)) return null;
  var m=u.match(/drive\.google\.com\/(?:file\/d\/|open\?id=|uc\?(?:export=\w+&)?id=)([\w-]{10,})/);
  if(m) return {kind:'drive', id:m[1], url:u, preview:'https://drive.google.com/file/d/'+m[1]+'/preview'};
  m=u.match(/docs\.google\.com\/(document|presentation|spreadsheets)\/d\/([\w-]{10,})/);
  if(m) return {kind:'drive', id:m[2], url:u, preview:'https://docs.google.com/'+m[1]+'/d/'+m[2]+'/preview'};
  if(/drive\.google\.com\/drive\/(?:u\/\d\/)?folders\//.test(u)) return {kind:'folder', url:u};
  return {kind:'link', url:u};
}
function fileName(f){ return f.name || (f.kind==='drive'?L('Drive file'):f.kind==='folder'?L('Drive folder'):L('Link')); }

// ================= Toast with undo =================
function toast(m, undo){
  var t=$('#toast'); t.innerHTML='<span class="tk">'+ICON.check+'</span><span>'+esc(m)+'</span>'+(undo?'<button class="lnk" id="undo">'+esc(L('Undo'))+'</button>':'');
  t.classList.add('on'); t.style.pointerEvents=undo?'auto':'none'; clearTimeout(t._h);
  if(undo) $('#undo').onclick=function(){ undo(); t.classList.remove('on'); render(); };
  t._h=setTimeout(function(){ t.classList.remove('on'); t.style.pointerEvents='none'; }, undo?5000:2600);
}
