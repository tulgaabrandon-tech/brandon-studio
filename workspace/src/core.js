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
var ROLES = { pm:'Project manager', designer:'Graphic designer', video:'Videographer' };
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

// ================= Sample data (demo, and the starter set in live) =================
function sampleSet(){
  var tasks=[];
  function T(o){ o.id=o.id||('s_t'+(tasks.length+1)); o.versions=o.versions||[]; o.by=o.by||'suvdaa'; o.created=o.created||iso(d(-10)); o.brief=o.brief||''; o.shoot=o.shoot||''; o.sample=true; tasks.push(o); }
  function V(files,note,by,off,comments,decision){ return {files:files, note:note||'', by:by, date:iso(d(off||0)), comments:comments||[], decision:decision||null, decidedAt:decision?iso(d((off||0)+1)):null}; }
  function img(k,name){ return {kind:'image', url:ART[k], name:name}; }
  var projects=[
    {id:'s_paradox', pm:'suvdaa', client:'Paradox Food Hall', name:'Brand identity', color:'#2B6E5B'},
    {id:'s_puree', pm:'suvdaa', client:'Kids puree', name:'Logo and packaging', color:'#E08A1E'},
    {id:'s_tsagaan', pm:'reka', client:'Tsagaan Sar 2027', name:'Campaign TVC and social', color:'#7A1F2B'},
    {id:'s_hairan', pm:'reka', client:'Hairan', name:'November social', color:'#3D7A3A'},
    {id:'s_nomad', pm:'suvdaa', client:'Nomad Coffee', name:'Menu redesign', color:'#5B4636'},
    {id:'s_iii', pm:'reka', client:'Orkhon III school', name:'Logo identity', color:'#1F3F7A'}
  ];
  projects.forEach(function(p){ p.sample=true; p.created=iso(d(-20)); });
  T({project:'s_paradox', title:'Logo directions', who:'tulgaa', due:iso(d(0)), status:'doing', brief:'Food hall for a young crowd. Bold, playful, must work on signage.',
    versions:[V([img('logo','paradox-logo-v1.png')],'Three directions: A friendly round, B bold square, C minimal line.','tulgaa',-3,[{by:'suvdaa',text:'B is the one. Make the P more open.',x:50,y:44,file:0},{by:'suvdaa',text:'Test B small, like a favicon.',x:52,y:80,file:0}],'changes')]});
  T({project:'s_paradox', title:'Signage mockup', who:'tulgaa', due:iso(d(-9)), status:'done', versions:[V([img('sign','paradox-sign.png')],'Night view of the entrance sign.','tulgaa',-10,[],'approved')]});
  T({project:'s_paradox', title:'Brandbook: color and type pages', who:'khongoroo', due:iso(d(4)), status:'todo', brief:'After logo approval. Use the client color brief.'});
  T({project:'s_puree', title:'Logo color variations', who:'khongoroo', due:iso(d(1)), status:'review', brief:'Softer, more natural colors. Friendly for kids.',
    versions:[V([img('puree','puree-colors-v2.png')],'Three softer palettes after the client said v1 felt too loud. I like A.','khongoroo',0)]});
  T({project:'s_puree', title:'Pouch packaging mockup', who:'tulgaa', due:iso(d(5)), status:'todo'});
  T({project:'s_puree', title:'Pouch front, first pass', who:'khongoroo', due:iso(d(-4)), status:'done', versions:[V([img('pack','pouch-front.png')],'','khongoroo',-5,[],'approved')]});
  T({project:'s_hairan', title:'Week 4 posts (6)', who:'khongoroo', due:iso(d(-1)), status:'review', by:'reka', versions:[V([img('posts','hairan-week4.png')],'Six posts for week 4. The discount post is the Friday one.','khongoroo',-1)]});
  T({project:'s_hairan', title:'Bakery reels x3', who:'tumku', due:iso(d(3)), status:'todo', by:'reka'});
  T({project:'s_hairan', title:'Reel: morning bake', who:'tumku', due:iso(d(-3)), status:'done', by:'reka', versions:[V([img('reel','hairan-reel.png')],'','tumku',-3,[],'approved')]});
  T({project:'s_tsagaan', title:'TVC shoot: family table', who:'jerry', due:iso(d(2)), status:'todo', by:'reka', shoot:'Studio 2, Sukhbaatar'});
  T({project:'s_tsagaan', title:'Campaign key visual', who:'tulgaa', due:iso(d(-1)), status:'review', by:'reka', versions:[V([img('kv','tsagaan-kv.png')],'Poster ratio 4:5. The gold circle reads as the table from above.','tulgaa',0)]});
  T({project:'s_tsagaan', title:'Teaser edit 15s', who:'tumku', due:iso(d(-2)), status:'review', by:'reka', versions:[V([img('edit','teaser-poster.png')],'Rough cut. Music is temp.','tumku',0)]});
  T({project:'s_nomad', title:'Menu cover', who:'tulgaa', due:iso(d(-6)), status:'done', versions:[V([img('menu','nomad-menu.png')],'','tulgaa',-6,[],'approved')]});
  T({project:'s_nomad', title:'Menu inside spread', who:'khongoroo', due:iso(d(8)), status:'todo'});
  T({project:'s_iii', title:'Logo book A4', who:'tulgaa', due:iso(d(-2)), status:'done', by:'reka', versions:[V([img('school','iii-logo.png')],'','tulgaa',-2,[],'approved')]});
  var ann=[
    {id:'s_a1', by:'suvdaa', date:iso(d(0)), title:'Бүх ажлаа BrandOn Studio-гоор илгээнэ', text:'Өнөөдрөөс эхлэн дизайн, видеогоо Telegram-аар биш энд Drive холбоосоор илгээж хянуулна. Засвар зураг дээр нь шууд ирнэ.', aud:'all', seen:{}},
    {id:'s_a2', by:'reka', date:iso(d(-1)), title:'Баасан гарагийн багийн оройн хоол', text:'Баасан 18:00, Цагаан сарын зураг авалтын дараа. Ирж чадахгүй бол Пүрэв гараг гэхэд хэлээрэй.', aud:'all', seen:{khongoroo:true}}
  ];
  var events=[
    {id:'s_e1', date:iso(d(0)), time:'10:00', title:'Долоо хоногийн уулзалт', kind:'meeting', who:'all', place:'Оффис'},
    {id:'s_e2', date:iso(d(1)), time:'15:00', title:'Paradox: логоны танилцуулга', kind:'meeting', who:['suvdaa','tulgaa'], place:'Paradox оффис'},
    {id:'s_e3', date:iso(d(1)), time:'', title:'Kids puree: өнгө илгээх', kind:'deadline', who:['khongoroo']},
    {id:'s_e4', date:iso(d(1)), time:'14:00', title:'Цагаан сар: зураг авалтын жагсаалт', kind:'meeting', who:['reka','jerry','tumku'], place:'Студи'},
    {id:'s_e5', date:iso(d(3)), time:'', title:'Khongoroo чөлөөтэй', kind:'off', who:['khongoroo']},
    {id:'s_e6', date:iso(d(2)), time:'18:00', title:'Багийн оройн хоол', kind:'meeting', who:'all', place:'Модерн Номадс'},
    {id:'s_e7', date:iso(d(-1)), time:'11:00', title:'Hairan: сарын тайлан', kind:'meeting', who:['reka'], place:'Hairan'}
  ];
  ann.concat(events).forEach(function(x){ x.sample=true; });
  return {projects:projects, tasks:tasks, ann:ann, events:events};
}
function startDemo(){
  S.mode='demo'; S.ready=true;
  S.people=[
    {id:'suvdaa', name:'Suvdaa', role:'pm', color:'#DA1F34'}, {id:'reka', name:'Reka', role:'pm', color:'#B5532A'},
    {id:'tulgaa', name:'Tulgaa', role:'designer', color:'#2F5DA8'}, {id:'khongoroo', name:'Khongoroo', role:'designer', color:'#7A4FB0'},
    {id:'jerry', name:'Jerry', role:'video', color:'#1F7A5A'}, {id:'tumku', name:'Tumku', role:'video', color:'#8A6D00'}
  ];
  var s=sampleSet(); S.projects=s.projects; S.tasks=s.tasks; S.ann=s.ann; S.events=s.events;
  render();
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
function crew(){ return S.people.filter(function(p){return p.role!=='pm';}); }
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
