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
    {id:'nomin', name:'Nomin', role:'exec', color:'#141414', finance:true},
    {id:'suvdaa', name:'Suvdaa', role:'pm', color:'#DA1F34', finance:true}, {id:'reka', name:'Reka', role:'pm', color:'#B5532A'},
    {id:'tulgaa', name:'Tulgaa', role:'designer', color:'#2F5DA8', finance:true}, {id:'khongoroo', name:'Khongoroo', role:'designer', color:'#7A4FB0'},
    {id:'jerry', name:'Jerry', role:'video', color:'#1F7A5A'}, {id:'tumku', name:'Tumku', role:'video', color:'#8A6D00'}
  ];
  var s=sampleSet(); S.projects=s.projects; S.tasks=s.tasks; S.ann=s.ann; S.events=s.events;
  render();
}

