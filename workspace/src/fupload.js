// ================= Finance upload: drop anything in, it gets read, sorted and checked for duplicates =================
// Bank statements (.xlsx, .csv), the studio's own monthly sheets, salary sheets and client sales tables are recognised by their headers.
// Receipt photos are read by Claude and matched to the expense that is waiting for a receipt.
var FUP={items:[], deals:[], pays:[], receipts:[], files:[], busy:'', notes:[], over:false};

// ---------- reading files ----------
function u16(b,o){ return b[o]|(b[o+1]<<8); }
function u32(b,o){ return (b[o]|(b[o+1]<<8)|(b[o+2]<<16))+(b[o+3]*16777216); }
function inflate(bytes){
  if(!window.DecompressionStream) return Promise.reject(new Error('nozip'));
  var ds=new DecompressionStream('deflate-raw');
  return new Response(new Blob([bytes]).stream().pipeThrough(ds)).arrayBuffer().then(function(ab){ return new Uint8Array(ab); });
}
function unzip(buf){
  var b=new Uint8Array(buf), e=-1;
  for(var i=b.length-22;i>=Math.max(0,b.length-70000);i--){ if(b[i]===0x50&&b[i+1]===0x4b&&b[i+2]===5&&b[i+3]===6){ e=i; break; } }
  if(e<0) return Promise.reject(new Error('notzip'));
  var n=u16(b,e+10), off=u32(b,e+16), files={}, jobs=[], dec=new TextDecoder();
  for(var k=0;k<n;k++){
    var method=u16(b,off+10), csize=u32(b,off+20), nl=u16(b,off+28), xl=u16(b,off+30), cl=u16(b,off+32), lo=u32(b,off+42);
    var name=dec.decode(b.subarray(off+46,off+46+nl)); off+=46+nl+xl+cl;
    var start=lo+30+u16(b,lo+26)+u16(b,lo+28), data=b.subarray(start,start+csize);
    (function(name,method,data){ jobs.push((method===0?Promise.resolve(data):inflate(data)).then(function(d){ files[name]=dec.decode(d); })); })(name,method,data);
  }
  return Promise.all(jobs).then(function(){ return files; });
}
function xmlDoc(s){ return new DOMParser().parseFromString(s,'application/xml'); }
function colIdx(ref){ var m=/^([A-Z]+)/.exec(ref), n=0; for(var i=0;i<m[1].length;i++) n=n*26+m[1].charCodeAt(i)-64; return n-1; }
function readXlsx(buf){
  return unzip(buf).then(function(f){
    var shared=[];
    if(f['xl/sharedStrings.xml']) Array.prototype.forEach.call(xmlDoc(f['xl/sharedStrings.xml']).getElementsByTagName('si'), function(si){ var t=''; Array.prototype.forEach.call(si.getElementsByTagName('t'),function(x){ t+=x.textContent; }); shared.push(t); });
    var rels={}; if(f['xl/_rels/workbook.xml.rels']) Array.prototype.forEach.call(xmlDoc(f['xl/_rels/workbook.xml.rels']).getElementsByTagName('Relationship'),function(r){ rels[r.getAttribute('Id')]=r.getAttribute('Target'); });
    var sheets=[];
    Array.prototype.forEach.call(xmlDoc(f['xl/workbook.xml']).getElementsByTagName('sheet'), function(sh){
      var rid=sh.getAttribute('r:id')||sh.getAttributeNS('http://schemas.openxmlformats.org/officeDocument/2006/relationships','id'), t=(rels[rid]||'').replace(/^\/?(xl\/)?/,''), x=f['xl/'+t];
      if(!x) return;
      var rows=[];
      Array.prototype.forEach.call(xmlDoc(x).getElementsByTagName('row'), function(r){
        var ri=(+r.getAttribute('r')||rows.length+1)-1, row=[];
        Array.prototype.forEach.call(r.getElementsByTagName('c'), function(c){
          var ty=c.getAttribute('t'), v=c.getElementsByTagName('v')[0], val=null;
          if(ty==='s') val=v?shared[+v.textContent]:null; else if(ty==='inlineStr'){ var is=c.getElementsByTagName('t'); val=is.length?is[0].textContent:''; } else if(ty==='str'||ty==='e') val=v?v.textContent:null; else if(ty==='b') val=v?v.textContent==='1':null; else val=v&&v.textContent!==''?+v.textContent:null;
          row[colIdx(c.getAttribute('r')||'A1')]=val;
        });
        rows[ri]=row;
      });
      for(var i=0;i<rows.length;i++) if(!rows[i]) rows[i]=[];
      sheets.push({name:sh.getAttribute('name'), rows:rows});
    });
    return sheets;
  });
}
function readCsv(text){
  text=text.replace(/^﻿/,''); var first=text.split(/\r?\n/)[0]||'', d=[',',';','\t'].sort(function(a,b){ return first.split(b).length-first.split(a).length; })[0];
  var rows=[], row=[], cur='', q=false;
  for(var i=0;i<text.length;i++){ var ch=text[i];
    if(q){ if(ch==='"'){ if(text[i+1]==='"'){ cur+='"'; i++; } else q=false; } else cur+=ch; }
    else if(ch==='"') q=true; else if(ch===d){ row.push(cur); cur=''; } else if(ch==='\n'){ row.push(cur); rows.push(row); row=[]; cur=''; } else if(ch!=='\r') cur+=ch; }
  if(cur||row.length){ row.push(cur); rows.push(row); }
  return rows.map(function(r){ return r.map(function(c){ var t=c.trim(); return /^-?[\d\s,]*\.?\d+$/.test(t)&&/\d/.test(t)?+t.replace(/[\s,]/g,''):(t===''?null:t); }); });
}

// ---------- understanding cells ----------
function nrm(s){ return String(s==null?'':s).toLowerCase().replace(/\s+/g,' ').trim(); }
function cellNum(v){ if(typeof v==='number') return v; if(v==null) return 0; var t=String(v).replace(/[^\d.,-]/g,''); if(/,\d{1,2}$/.test(t)&&t.indexOf('.')<0) t=t.replace(',','.'); return +t.replace(/,/g,'')||0; }
function cellDate(v){
  if(typeof v==='number' && v>30000 && v<80000){ var d=new Date(Date.UTC(1899,11,30)+Math.floor(v)*86400000); return d.toISOString().slice(0,10); }
  var s=String(v==null?'':v).trim(), m=/(\d{4})[.\-\/](\d{1,2})[.\-\/](\d{1,2})/.exec(s);
  if(m) return m[1]+'-'+('0'+m[2]).slice(-2)+'-'+('0'+m[3]).slice(-2);
  m=/^(\d{4})\.(\d{1,2})\.?$/.exec(s); if(m){ var last=new Date(+m[1],+m[2],0).getDate(); return m[1]+'-'+('0'+m[2]).slice(-2)+'-'+last; }
  m=/(\d{1,2})[.\/](\d{1,2})[.\/](\d{4})/.exec(s); if(m) return m[3]+'-'+('0'+m[2]).slice(-2)+'-'+('0'+m[1]).slice(-2);
  return null;
}
function findCol(hdr, names){ for(var j=0;j<hdr.length;j++){ var h=nrm(hdr[j]); if(!h) continue; for(var k=0;k<names.length;k++) if(names[k] instanceof RegExp?names[k].test(h):h===names[k]) return j; } return -1; }

// ---------- sorting into categories ----------
// Names the studio has used for each category over the years, plus the short labels written in bank statements
var FALIAS={
  sales:['үйл ажиллагааны орлого','борлуулалт'], boost_in:['бүүст орлого'], other_in:['бусад орлого','хүү','кредит хүү'], loan_in:['түр зээл','зээл орсон'],
  salary:['ажилчдад төлсөн','ажилчдад  төлсөн','цалин','цалингийн зардал','урьдчилгаа цалин'], production:['үйл ажиллагааны зардал','өртөг'], rent:['түрээс','түрээсийн зардал'],
  ndsh:['нд-д төлсөн','нийгмийн даатгал','ндш','ндш-ийн зардал'], tax:['татварт төлсөн','татвар','нөат'], loan:['удирдлагын зардал - зээл төлөлт','удирдлагын зардал-зээл төлөлт','зээл төлөлт'],
  mgmt:['удирдлагын зардал'], utilities:['ашиглалт ус дулаан, цахилгаан, сөх','цахилгаан','цахилгаан төлбөр','сөх','ус дулаан'], software:['вэбсайт, програм төлбөр','вирус програм, вэбсайт','програм'],
  phone:['харилцаа холбоо /утас, интернэт/','утас','интернэт'], food:['хоолны зардал','хоол'], events:['баяр, хүлээн авалтын зардал','баяр'], travel:['аяллын зардал','аялал'], fuel:['бензин зардал','шатахууны зардал','бензин','шатахуун'],
  taxi:['такси, зогсоол, хүргэлт','такси. зогсоол','такси','зогсоол','хүргэлт'], boost:['бүүст зардал','бүүст'], fees:['шимтгэл','банкны шимтгэл'], card:['кредит карт төлөлт'], office:['оффис зардал'],
  cleaning:['цэвэрлэгээ ариутгалын зардал','цэвэрлэгээ'], training:['сургалтын зардал','сургалт'], assets:['үндсэн хөрөнгө'], repair_assets:['засварын зардал үндсэн хөрөнгө'], repair_office:['засварын зардал оффис'],
  cat:['муурны зардал','муур'], print:['хэвлэл'], donation:['хандив тусламжийн зардал','хандив'], fund:['фонд татан авалт'], cash:['касс','kass']
};
function catFromLabel(label, type){
  var h=nrm(label); if(!h) return null;
  var best=null, bestLen=0;
  Object.keys(FALIAS).forEach(function(k){ FALIAS[k].forEach(function(a){ if((h===a||h.indexOf(a)===0) && a.length>bestLen){ best=k; bestLen=a.length; } }); });
  FIN_IN.concat(FIN_OUT).forEach(function(c){ if(nrm(c.mn)===h){ best=c.k; bestLen=99; } });
  if(!best) return null;
  if(best==='cash') return type==='out'?'cash':null;
  var isIn=FIN_IN.some(function(c){ return c.k===best; });
  if(type==='in' && !isIn) return 'other_in'; if(type==='out' && isIn) return null;
  return best;
}
var FRULES=[
  [/шимтгэл|fee|хураамж/i,'fees','out'], [/kass|касс/i,'cash','out'], [/цалин|tsalin|salary/i,'salary','out'], [/нийгмийн даатгал|ндш|6441556 брэнд/i,'ndsh','out'],
  [/татвар|tatvar|нөат|ebarimt/i,'tax','out'], [/turees|түрээс/i,'rent','out'], [/зээл .*төлөв|зээл бэлэн бусаар|даатгалын гэрээ/i,'loan','out'], [/кредит бэлэн бусаар|credit card/i,'card','out'],
  [/сөх|цахилгаан|6104409|дулаан|ус хангамж/i,'utilities','out'], [/unitel|mobicom|skytel|gmobile|univision|интернэт/i,'phone','out'], [/google|adobe|figma|apple\.com|canva|openai|anthropic|claude|webflow|domain|hosting|envato|freepik|capcut/i,'software','out'],
  [/facebook|meta platforms|boost|бүүст/i,'boost','out'], [/ubcab|taxi|такси|зогсоол|parking|хүргэлт|delivery/i,'taxi','out'], [/petrovis|shunkhlai|шунхлай|magnai|бензин|шатахуун|ai-?9/i,'fuel','out'],
  [/хоол|кофе|coffee|cafe|pizza|kfc|burger|restaurant|ресторан|зоог|hot ?pot/i,'food','out'], [/муур/i,'cat','out'], [/сургалт|course|training/i,'training','out'], [/хэвлэл|print/i,'print','out'],
  [/хүү|interest/i,'other_in','in'], [/фонд/i,'fund','out']
];
// Learns from what is already filed: words in past descriptions point to the category they were filed under
function fLearn(){
  var m={in:{},out:{}};
  FIN.data.fin_tx.forEach(function(t){ if(t.type==='move') return; fWords(t.note+' '+(t.client||'')).forEach(function(w){ var o=m[t.type][w]=m[t.type][w]||{}; o[t.cat]=(o[t.cat]||0)+1; }); });
  return m;
}
function fWords(s){ return nrm(s).replace(/[^a-zа-яөүё\s]/g,' ').split(' ').filter(function(w){ return w.length>=4 && !/^(брэнд|креатив|хаус|банк|eb|хаан|гүйлгээ|төлбөр|ххк)$/.test(w); }); }
function guessCat(note, type, hint, learned){
  if(hint){ var c=catFromLabel(hint,type); if(c) return {cat:c, sure:2}; }
  for(var i=0;i<FRULES.length;i++){ var r=FRULES[i]; if(r[0].test(note) && (r[2]===type || (r[1]==='cash'&&type==='out'))) return {cat:r[1], sure:1}; }
  var score={}; fWords(note).forEach(function(w){ var o=learned[type][w]; if(o) Object.keys(o).forEach(function(k){ score[k]=(score[k]||0)+o[k]; }); });
  var ks=Object.keys(score).sort(function(a,b){ return score[b]-score[a]; }), tot=ks.reduce(function(s,k){ return s+score[k]; },0);
  if(ks.length && score[ks[0]]>=2 && score[ks[0]]/tot>=0.55) return {cat:ks[0], sure:1};
  return {cat:type==='in'?'sales':'production', sure:0};
}

// ---------- recognising what a sheet is ----------
function sheetMonth(name, rows){
  var m=/(\d{4}) оны (\d{1,2})-р сар/.exec(rows.slice(0,6).map(function(r){ return r.join(' '); }).join(' '));
  if(m) return m[1]+'-'+('0'+m[2]).slice(-2);
  var mon={jan:1,feb:2,mar:3,apr:4,may:5,jun:6,jul:7,aug:8,sep:9,oct:10,nov:11,dec:12}, n=nrm(name), y=FIN.month.slice(0,4), mm=null;
  Object.keys(mon).forEach(function(k){ if(n.indexOf(k)>=0) mm=mon[k]; });
  var d=/(\d{1,2})\s*(сар|sar|р сар)?$/.exec(n.replace(/^\d{2}(?=[a-z])/,'')); if(!mm && d && +d[1]>=1 && +d[1]<=12) mm=+d[1];
  var yy=/^(\d{2})[a-z]/.exec(n); if(yy) y='20'+yy[1];
  return mm?y+'-'+('0'+mm).slice(-2):null;
}
function parseSheet(sh, file, out){
  var rows=sh.rows, found=false;
  for(var i=0;i<Math.min(rows.length,40);i++){
    var hdr=rows[i]; if(!hdr || hdr.filter(function(x){ return x!=null; }).length<3) continue;
    // Salary sheet
    if(findCol(hdr,['ажилчдын нэрс'])>=0 && findCol(hdr,['үндсэн цалин'])>=0){ var p=parsePayroll(sh,i); if(p){ out.pays.push(p); found=true; } break; }
    var cDate=findCol(hdr,['огноо','он сар','гүйлгээний огноо','date','transaction date',/огноо/]);
    var cNote=findCol(hdr,['гүйлгээний утга','утга','description','тайлбар/утга','гүйлгээний тайлбар',/утга/]);
    var cIn=findCol(hdr,['орлого','дебит','дебит гүйлгээ','credit','орлого (₮)',/^орлого/]), cOut=findCol(hdr,['зарлага','кредит','кредит гүйлгээ','debit','зарлага (₮)',/^зарлага/]);
    var cAmt=findCol(hdr,['дүн','гүйлгээний дүн','amount']);
    if(cDate>=0 && cNote>=0 && ((cIn>=0&&cOut>=0)||cAmt>=0)){
      var cHint=findCol(hdr,['төрөл','ангилал','тайлбар']), cClient=findCol(hdr,['харилцагч']), cReg=findCol(hdr,['регистр']), cWork=findCol(hdr,['ажлын төрөл']), cTag=findCol(hdr,['тэмдэглэл']);
      if(cHint===cNote) cHint=-1;
      var n=0;
      for(var r=i+1;r<rows.length;r++){
        var row=rows[r]; if(!row) continue;
        var date=cellDate(row[cDate]); var note=String(row[cNote]==null?'':row[cNote]).trim();
        var inn=cIn>=0?cellNum(row[cIn]):0, outv=cOut>=0?cellNum(row[cOut]):0;
        if(cAmt>=0 && cIn<0){ var a=cellNum(row[cAmt]); if(a>0) inn=a; else outv=-a; }
        if(!inn && !outv) continue;
        if(!date){ if(note||inn||outv) out.skipped++; continue; }
        if(/^(нийт|total|эхний үлдэгдэл|эцсийн үлдэгдэл)/i.test(nrm(note))) continue;
        var type=inn&&!outv?'in':'out', amt=type==='in'?inn:outv;
        var it={file:file, date:date, type:type, amount:Math.round(amt*100)/100, note:note, hint:cHint>=0?row[cHint]:'', client:cClient>=0&&row[cClient]?String(row[cClient]).trim():'', reg:cReg>=0&&row[cReg]?String(row[cReg]).replace(/\.0$/,''):'', work:cWork>=0&&row[cWork]?String(row[cWork]):''};
        var tag=cTag>=0?String(row[cTag]||''):''; if(/НӨАТ шивсэн/i.test(tag)) it.vat='done'; else if(/НӨАТ шивэх/i.test(tag)) it.vat='todo'; if(/Баримт шивүүлсэн/i.test(tag)) it.receipt='done'; else if(/Баримт шивүүлэх/i.test(tag)) it.receipt='todo';
        out.items.push(it); n++;
      }
      if(n) found=true;
      // Client sales table on the right of the studio's monthly sheets
      var cName=findCol(hdr,['нэр']), cSale=findCol(hdr,['борлуулалт']);
      if(cName>=0 && cSale>=0) parseDeals(sh,i,cName,cSale,out);
      else for(var r2=i;r2<Math.min(rows.length,60);r2++){ var h2=rows[r2]||[], a2=findCol(h2,['нэр']), b2=findCol(h2,['борлуулалт']); if(a2>=0&&b2===a2+1){ parseDeals(sh,r2,a2,b2,out); break; } }
      break;
    }
  }
  if(!found) out.ignored.push(sh.name);
}
function parseDeals(sh, hi, cName, cSale, out){
  var m=sheetMonth(sh.name, sh.rows) || (out.items.length?out.items[out.items.length-1].date.slice(0,7):null); if(!m) return;
  for(var r=hi+1;r<Math.min(sh.rows.length,hi+40);r++){
    var row=sh.rows[r]||[], name=row[cName]; if(name==null){ if(row[cSale]==null) break; continue; }
    name=String(name).trim(); if(/^(нийт|total)/i.test(name)) break;
    var booked=cellNum(row[cSale]), recv=cellNum(row[cSale+1]); if(!booked&&!recv) continue;
    out.deals.push({client:name, month:m, amount:Math.round(booked), received:Math.round(recv), on:true});
  }
}
function parsePayroll(sh, hi){
  var rows=sh.rows, H=rows[hi], S2=rows[hi+1]||[], m=sheetMonth(sh.name, rows); if(!m) return null;
  var c={days:findCol(H,['ажилласан хоног']), base:findCol(H,['үндсэн цалин']), bonus:findCol(H,['нэмэгдэл']), rep:findCol(H,['ндш-д тайлагнах цалин']), gross:findCol(H,['нийт бодогдсон']), pos:findCol(H,['албан тушаал']),
    ndsh:findCol(S2,['ндш']), fund:findCol(S2,['фондын сан']), owed:findCol(S2,['ажиллагсдын авлага']), adv:findCol(H,['урьдчилгаа'])};
  var body=[]; for(var r=hi+2;r<rows.length;r++){ var row=rows[r]||[]; if(nrm(row[0])==='нийт') break; if(typeof row[1]==='string' && row[1].trim()) body.push(row); }
  var wd=Math.max.apply(null, body.map(function(r){ return c.days>=0?cellNum(r[c.days]):0; }).concat([0]))||21;
  var list=body.map(function(row){ var g=function(k){ return c[k]>=0?cellNum(row[c[k]]):0; }, ndsh=g('ndsh'), base=g('base'), bonus=g('bonus'), days=g('days')||wd;
    if(g('gross') && Math.abs(base+bonus-g('gross'))<2) days=wd;
    return {name:row[1].trim(), position:c.pos>=0&&typeof row[c.pos]==='string'?row[c.pos]:'', base:base, days:days, bonus:bonus, reported:g('rep')||(ndsh?Math.round(ndsh/0.115):0), fund:g('fund'), owed:g('owed'), advance:g('adv'), wd:wd}; });
  return list.length?{month:m, rows:list, on:true}:null;
}

// ---------- the flow ----------
function fupFiles(fileList){
  var files=Array.prototype.slice.call(fileList||[]); if(!files.length) return;
  if(!FIN.unlocked){ toast(F('Эхлээд санхүүгээ нээнэ үү.','Open finance first.')); return; }
  FUP.busy=F('Уншиж байна...','Reading...'); FUP.notes=[]; render();
  var out={items:[], deals:[], pays:[], receipts:[], skipped:0, ignored:[]}, jobs=[];
  files.forEach(function(file){
    var n=file.name, low=n.toLowerCase();
    if(/\.xlsx$|\.xlsm$/.test(low)) jobs.push(file.arrayBuffer().then(readXlsx).then(function(sheets){ sheets.forEach(function(sh){ parseSheet(sh,n,out); }); }).catch(function(){ FUP.notes.push(n+': '+F('уншиж чадсангүй','could not read it')); }));
    else if(/\.csv$|\.txt$|\.tsv$/.test(low)) jobs.push(file.text().then(function(t){ parseSheet({name:n, rows:readCsv(t)},n,out); }));
    else if(/\.xls$/.test(low)) FUP.notes.push(n+': '+F('хуучин .xls формат. Excel-ээр нээгээд .xlsx болгож хадгална уу.','old .xls format. Open it in Excel and save as .xlsx.'));
    else if(/^image\//.test(file.type)) out.receipts.push({file:file, name:n, state:'wait'});
    else if(/pdf$/.test(low)) FUP.notes.push(n+': '+F('PDF-ийг уншихгүй. Баримтын зургийг эсвэл банкны хуулгын Excel-ийг оруулна уу.','PDFs are not read. Drop a photo of the receipt, or the bank statement as Excel.'));
    else FUP.notes.push(n+': '+F('танихгүй файл','not a file I know'));
  });
  Promise.all(jobs).then(function(){
    var learned=fLearn(), seen={}, perMonth={};
    FIN.data.fin_tx.forEach(function(t){ var mm=monthOf(t.date); perMonth[mm]=(perMonth[mm]||0)+1; });
    FIN.data.fin_tx.forEach(function(t){ var k=t.date+'|'+(t.type==='move'?'out':t.type)+'|'+Math.round(+t.amount); seen[k]=(seen[k]||0)+1; });
    out.items.sort(function(a,b){ return a.date.localeCompare(b.date); });
    // The same payment can sit in the studio sheet and in the bank statement: count each date, amount and direction once across all files
    var perFile={};
    out.items.forEach(function(it){
      var g=guessCat(it.note+' '+it.client, it.type, it.hint, learned); it.cat=g.cat; it.sure=g.sure;
      if(it.cat==='cash'){ it.type='move'; }
      var k=it.date+'|'+(it.type==='move'?'out':it.type)+'|'+Math.round(it.amount), pf=perFile[it.file]=perFile[it.file]||{};
      pf[k]=(pf[k]||0)+1;
      if(pf[k]<=(seen[k]||0)) it.dup=true; else seen[k]=pf[k];
      // A month that is already filed is left unticked: the bank statement and the studio sheet record the same money in different detail
      if(!it.dup && (perMonth[it.date.slice(0,7)]||0)>=10) it.covered=true;
      it.on=!it.dup && !it.covered;
    });
    out.deals.forEach(function(d){ d.dup=FIN.data.fin_deals.some(function(x){ return monthOf(x.date)===d.month && Math.round(+x.amount)===d.amount && Math.round(+x.received||0)===d.received; }) || out.deals.indexOf(d)>out.deals.findIndex(function(y){ return y.month===d.month && y.amount===d.amount && y.received===d.received && nrm(y.client)===nrm(d.client); }); d.on=!d.dup; });
    out.pays.forEach(function(p){ p.dup=!!payrollFor(p.month); p.on=!p.dup; });
    FUP.items=out.items; FUP.deals=out.deals; FUP.pays=out.pays; FUP.receipts=FUP.receipts.concat(out.receipts);
    if(out.skipped) FUP.notes.push(F(out.skipped+' мөрөнд огноо алга тул алгаслаа.',out.skipped+' rows had no readable date and were skipped.'));
    if(out.ignored.length) FUP.notes.push(F('Таниагүй хуудас: ','Sheets not recognised: ')+out.ignored.slice(0,8).join(', ')+(out.ignored.length>8?'...':''));
    FUP.busy=''; render();
    fupAskClaude(); fupReceipts();
  });
}
// Rows no rule recognised go to Claude in one batch, when the page is allowed to ask
function fupAskClaude(){
  var unsure=FUP.items.filter(function(it){ return !it.sure && !it.dup; }).slice(0,80); if(!unsure.length || !window.claude) return;
  claude.use('sample').then(function(sample){
    if(!sample || !sample.json) return;
    FUP.busy=F('Claude ангилж байна...','Claude is sorting...'); render();
    var cats={in:FIN_IN.map(function(c){ return c.k+': '+c.mn; }), out:FIN_OUT.map(function(c){ return c.k+': '+c.mn; })};
    var prompt='You sort bank transactions of a Mongolian design agency into categories. Money in categories:\n'+cats.in.join('\n')+'\nMoney out categories:\n'+cats.out.join('\n')+
      '\nReturn JSON: {"cats":[category key for each transaction, same order]}. Use only keys from the right list for its type. Transactions:\n'+unsure.map(function(it,i){ return i+'. '+it.type+' '+Math.round(it.amount)+' MNT: '+it.note.slice(0,160); }).join('\n');
    return sample.json(prompt, {modelTier:'quick'}).then(function(res){
      var arr=res&&res.cats||[]; unsure.forEach(function(it,i){ var k=arr[i], ok=(it.type==='in'?FIN_IN:FIN_OUT).some(function(c){ return c.k===k; }); if(ok){ it.cat=k; it.sure=1; it.ai=true; } });
    });
  }).catch(function(){}).then(function(){ FUP.busy=''; if(S.view==='finance') render(); });
}
// Receipt photos: Claude reads date, amount and shop, then the matching expense is marked as having its receipt
function fupReceipts(){
  var wait=FUP.receipts.filter(function(r){ return r.state==='wait'; }); if(!wait.length) return;
  if(!window.claude){ wait.forEach(function(r){ r.state='manual'; }); render(); return; }
  claude.use('sample').then(function(sample){
    if(!sample){ wait.forEach(function(r){ r.state='manual'; }); render(); return; }
    return sample.limits().then(function(lim){
      if(!lim || !lim.images){ wait.forEach(function(r){ r.state='manual'; }); render(); return; }
      return wait.reduce(function(p,r){ return p.then(function(){ r.state='reading'; render();
        return sample.json('This is a photo of a receipt or invoice (likely Mongolian). Return JSON {"date":"YYYY-MM-DD or null","amount":total paid as a number in MNT or null,"vendor":"shop or company name or null"}.', {images:[r.file], modelTier:'quick'})
          .then(function(j){ r.date=j&&j.date||null; r.amount=j&&+j.amount||0; r.vendor=j&&j.vendor||''; r.match=fupMatch(r); r.state='read'; })
          .catch(function(){ r.state='manual'; }); }); }, Promise.resolve()).then(function(){ render(); });
    });
  }).catch(function(){ wait.forEach(function(r){ r.state='manual'; }); render(); });
}
function fupMatch(r){
  if(!r.amount) return '';
  var c=FIN.data.fin_tx.filter(function(t){ return t.type==='out' && Math.abs(+t.amount-r.amount)<1 && t.receipt!=='done'; });
  if(r.date) c.sort(function(a,b){ return Math.abs(fromIso(a.date)-fromIso(r.date))-Math.abs(fromIso(b.date)-fromIso(r.date)); });
  c.sort(function(a,b){ return (b.receipt==='todo')-(a.receipt==='todo'); });
  return c.length?c[0].id:'';
}
function fupCommit(){
  var tx=FUP.items.filter(function(it){ return it.on; }), deals=FUP.deals.filter(function(d){ return d.on; }), pays=FUP.pays.filter(function(p){ return p.on; });
  var docs=[], now=new Date().toISOString();
  tx.forEach(function(it){ docs.push(['fin_tx',{id:newId('f'), created:now, type:it.type, amount:it.amount, cat:it.cat, note:it.note, date:it.date, account:'bank', client:it.client||'', reg:it.reg||'', work:it.work||'', deal:'', vat:it.type==='in'?(it.vat||'none'):'none', receipt:it.type==='out'?(it.receipt||'none'):'none', by:S.me, src:'upload'}]); });
  deals.forEach(function(d){ docs.push(['fin_deals',{id:newId('d'), created:now, client:d.client, title:'', amount:d.amount, received:d.received, date:d.month+'-01', work:'', reg:'', project:'', src:'upload'}]); });
  pays.forEach(function(p){
    var rows=p.rows.map(function(r){ var s=FIN.data.fin_staff.filter(function(x){ return nrm(x.name)===nrm(r.name); })[0];
      if(!s){ s={id:newId('s'), name:r.name, position:r.position, base:r.base, reported:r.reported, fund:r.fund, order:FIN.data.fin_staff.length+1, bonus:false, left:false}; FIN.data.fin_staff.push(s); docs.push(['fin_staff',s]); }
      return {staff:s.id, base:r.base, days:r.days, bonus:r.bonus, reported:r.reported, fund:r.fund, owed:r.owed, advance:r.advance, wd:r.wd}; });
    docs.push(['fin_payroll',{id:p.month, rows:rows, paid:true}]);
  });
  if(!docs.length) return;
  docs.forEach(function(d){ var list=FIN.data[d[0]], ex=list.filter(function(x){ return x.id===d[1].id; })[0]; if(!ex) list.push(d[1]); });
  FUP.items=[]; FUP.deals=[]; FUP.pays=[]; FUP.busy=F('Хадгалж байна...','Saving...'); render();
  // One write at a time, so a big statement does not trip the rate limit
  var done=0;
  docs.reduce(function(p,d){ return p.then(function(){ if(!FDB) return; return FDB.doc(d[0]+'/'+d[1].id).set(body(d[1])).then(function(){ done++; if(done%25===0){ FUP.busy=F('Хадгалж байна... ','Saving... ')+done+'/'+docs.length; softRender(); } }); }); }, Promise.resolve())
    .then(function(){ FUP.busy=''; render(); toast(F(docs.length+' зүйл нэмэгдлээ','Added '+docs.length+' items')); if(tx.length) FIN.month=monthOf(tx[tx.length-1].date); })
    .catch(function(){ FUP.busy=''; render(); toast(F('Зарим нь хадгалагдсангүй. Дахин оролдоно уу.','Some items did not save. Try again.')); });
}
function fupReceiptApply(i, txId){
  var r=FUP.receipts[i], t=FIN.data.fin_tx.filter(function(x){ return x.id===txId; })[0]; if(!r||!t) return;
  t.receipt='done'; t.receiptFile=r.name; fpersist('fin_tx',t); FUP.receipts.splice(i,1); render(); toast(F('Баримт бүртгэгдлээ','Receipt filed'));
}

// ---------- view ----------
function finUpload(){
  var h='<label class="dropz'+(FUP.over?' over':'')+'" data-drop="1"><input type="file" id="fupin" multiple accept=".xlsx,.xlsm,.csv,.txt,.xls,image/*,application/pdf" class="sr">'+
    '<span class="dz-ic">'+ICON.up+'</span><b>'+esc(F('Файлаа энд чирж оруулна уу','Drop files here'))+'</b><span class="muted">'+esc(F('Банкны хуулга (Excel, CSV), сарын санхүүгийн хүснэгт, цалингийн хүснэгт, баримтын зураг. Хэд хэдэн файлыг зэрэг оруулж болно.','Bank statements (Excel, CSV), monthly finance sheets, salary sheets, receipt photos. Several at once is fine.'))+'</span>'+
    '<span class="btn sm">'+esc(F('Эсвэл файл сонгох','Or choose files'))+'</span></label>';
  if(FUP.busy) h+='<div class="fup-busy" role="status"><span class="loader sm"></span>'+esc(FUP.busy)+'</div>';
  FUP.notes.forEach(function(n){ h+='<div class="fin-note">'+esc(n)+'</div>'; });
  var it=FUP.items, on=it.filter(function(x){ return x.on; }), dup=it.filter(function(x){ return x.dup; }).length, cov=it.filter(function(x){ return x.covered; }).length;
  var dOn=FUP.deals.filter(function(x){ return x.on; }).length, pOn=FUP.pays.filter(function(x){ return x.on; }).length, total=on.length+dOn+pOn;
  if(it.length||FUP.deals.length||FUP.pays.length){
    h+='<div class="fup-sum card"><div><b>'+esc(F('Шалгаад нэмнэ үү','Check, then add'))+'</b><span class="muted">'+esc(F(it.length+' гүйлгээ'+(dup?', '+dup+' нь өмнө бүртгэгдсэн':'')+(cov?', '+cov+' нь бүртгэлтэй сард орсон тул сонгоогүй':'')+(FUP.deals.length?' · '+FUP.deals.length+' борлуулалт':'')+(FUP.pays.length?' · '+FUP.pays.length+' сарын цалин':''), it.length+' transactions'+(dup?', '+dup+' already filed':'')+(cov?', '+cov+' fall in months already filed, left unticked':'')+(FUP.deals.length?' · '+FUP.deals.length+' sales':'')+(FUP.pays.length?' · '+FUP.pays.length+' payroll months':'')))+'</span></div>'+
      '<button class="btn ghost" data-act="fupclear">'+esc(L('Cancel'))+'</button><button class="btn primary" data-act="fupgo"'+(total?'':' disabled')+'>'+esc(F(total+' зүйл нэмэх','Add '+total+' items'))+'</button></div>';
  }
  if(FUP.pays.length) h+='<div class="rows fup-list">'+FUP.pays.map(function(p,i){ var tot=p.rows.reduce(function(s,r){ return s+payCalc(r).net; },0);
    return '<label class="fup-r'+(p.dup?' dup':'')+'"><input type="checkbox" data-fup="pay" data-i="'+i+'"'+(p.on?' checked':'')+'><span class="fup-d">'+esc(p.month)+'</span><span class="rw-m"><b>'+esc(F(+p.month.slice(5)+'-р сарын цалин','Payroll '+p.month))+'</b><span class="muted">'+esc(F(p.rows.length+' хүн','for '+p.rows.length+' people'))+(p.dup?' · '+esc(F('энэ сар аль хэдийн бий, нэмбэл солигдоно','this month already exists, adding replaces it')):'')+'</span></span><span class="tx-amt">'+esc(money(tot))+'</span></label>'; }).join('')+'</div>';
  if(FUP.deals.length) h+='<div class="rows fup-list">'+FUP.deals.map(function(d,i){ return '<label class="fup-r'+(d.dup?' dup':'')+'"><input type="checkbox" data-fup="deal" data-i="'+i+'"'+(d.on?' checked':'')+'><span class="fup-d">'+esc(d.month)+'</span><span class="rw-m"><b>'+esc(d.client)+'</b><span class="muted">'+esc(F('Борлуулалт','Sale'))+' · '+esc(F('орсон ','received '))+esc(money(d.received))+(d.dup?' · '+esc(F('өмнө бүртгэгдсэн','already filed')):'')+'</span></span><span class="tx-amt">'+esc(money(d.amount))+'</span></label>'; }).join('')+'</div>';
  if(it.length){
    var opts=function(t,cur){ var cats=t==='in'?FIN_IN:t==='out'?FIN_OUT:[FIN_MOVE]; return cats.map(function(c){ return '<option value="'+c.k+'"'+(c.k===cur?' selected':'')+'>'+esc(LANG==='mn'?c.mn:c.en)+'</option>'; }).join(''); };
    var month='', rows='';
    it.forEach(function(x,i){
      if(x.date.slice(0,7)!==month){ month=x.date.slice(0,7); var dd=fromIso(month+'-01'); rows+='<div class="day-sep">'+esc(LANG==='mn'?dd.getFullYear()+' оны '+(dd.getMonth()+1)+'-р сар':MON_EN[dd.getMonth()]+' '+dd.getFullYear())+'</div>'; }
      rows+='<div class="fup-r'+(x.dup?' dup':x.covered?' cov':'')+'"><input type="checkbox" data-fup="tx" data-i="'+i+'"'+(x.on?' checked':'')+' aria-label="'+esc(F('Нэмэх','Add'))+'"><span class="fup-d">'+esc(x.date.slice(5))+'</span><span class="rw-m"><b title="'+esc(x.note)+'">'+esc(x.note||'(утгагүй)')+'</b><span class="muted">'+(x.dup?esc(F('Өмнө бүртгэгдсэн','Already filed'))+' · ':'')+(x.client?esc(x.client)+' · ':'')+esc(x.file)+'</span></span>'+
        '<select class="input sm fup-c'+(x.sure?'':' unsure')+'" data-fupcat="'+i+'" aria-label="'+esc(F('Ангилал','Category'))+'">'+opts(x.type,x.cat)+'</select>'+(x.sure?'':'<span class="chip warn" title="'+esc(F('Таамаглал, шалгана уу','A guess, please check'))+'">?</span>')+
        '<span class="tx-amt '+(x.type==='in'?'pos':'')+'">'+(x.type==='in'?'+':'-')+esc(money(x.amount))+'</span></div>';
    });
    h+='<div class="rows fup-list">'+rows+'</div>';
  }
  if(FUP.receipts.length){
    h+='<div class="card fin-card" style="margin-top:20px"><div class="fin-card-h"><h3>'+esc(F('Баримтууд','Receipts'))+'</h3></div><div class="mini-rows">'+FUP.receipts.map(function(r,i){
      var cands=FIN.data.fin_tx.filter(function(t){ return t.type==='out' && t.receipt==='todo'; }).slice(-30);
      var m=r.match?FIN.data.fin_tx.filter(function(t){ return t.id===r.match; })[0]:null;
      var info=r.state==='reading'?F('Уншиж байна...','Reading...'):r.state==='read'?((r.vendor?r.vendor+' · ':'')+(r.amount?money(r.amount):'')+(r.date?' · '+r.date:'')):r.state==='manual'?F('Аль зарлагынх вэ? Сонгоно уу.','Which expense is it? Choose one.'):'';
      return '<div class="mini static fup-rc"><span><b>'+esc(r.name)+'</b><em>'+esc(info)+(m?' → '+esc(m.note||fcatName(m.cat))+' ('+esc(m.date)+')':'')+'</em></span>'+
        (m?'<button class="btn sm primary" data-act="fuprc" data-i="'+i+'" data-t="'+esc(m.id)+'">'+esc(F('Тийм, бүртгэх','Yes, file it'))+'</button>':(r.state==='read'||r.state==='manual')?'<select class="input sm" data-fuprc="'+i+'"><option value="">'+esc(F('Зарлага сонгох','Choose expense'))+'</option>'+cands.map(function(t){ return '<option value="'+esc(t.id)+'">'+esc(t.date+' · '+money(t.amount)+' · '+(t.note||'').slice(0,40))+'</option>'; }).join('')+'</select>':'')+
        '<button class="icon-btn sm" data-act="fuprcx" data-i="'+i+'" aria-label="'+esc(L('Remove'))+'">'+ICON.x+'</button></div>'; }).join('')+'</div></div>';
  }
  if(!it.length && !FUP.deals.length && !FUP.pays.length && !FUP.receipts.length && !FUP.busy){
    var src={}; FIN.data.fin_tx.forEach(function(t){ var k=t.src||'manual'; src[k]=(src[k]||0)+1; });
    h+='<p class="muted s13" style="margin-top:16px">'+esc(F('Бүртгэлтэй: ','On file: ')+FIN.data.fin_tx.length+F(' гүйлгээ, ',' transactions, ')+FIN.data.fin_deals.length+F(' борлуулалт, ',' sales, ')+FIN.data.fin_payroll.length+F(' сарын цалин. Давхардсан гүйлгээг (огноо, дүн ижил) автоматаар алгасна.',' payroll months. Duplicates (same date and amount) are skipped for you.'))+'</p>';
  }
  return h;
}
// drag and drop anywhere on the upload tab
document.addEventListener('dragover', function(e){ if(S.view==='finance' && FIN.unlocked && FIN.tab==='upload'){ e.preventDefault(); if(!FUP.over){ FUP.over=true; var z=document.querySelector('.dropz'); if(z) z.classList.add('over'); } } });
document.addEventListener('dragleave', function(e){ if(FUP.over && (!e.relatedTarget || e.relatedTarget===document.documentElement)){ FUP.over=false; var z=document.querySelector('.dropz'); if(z) z.classList.remove('over'); } });
document.addEventListener('drop', function(e){ if(S.view==='finance' && FIN.unlocked && FIN.tab==='upload'){ e.preventDefault(); FUP.over=false; fupFiles(e.dataTransfer&&e.dataTransfer.files); } });
// Dropping files on any finance tab jumps to Upload
document.addEventListener('dragenter', function(e){ if(S.view==='finance' && FIN.unlocked && FIN.tab!=='upload' && e.dataTransfer && Array.prototype.indexOf.call(e.dataTransfer.types||[],'Files')>=0){ FIN.tab='upload'; render(); } });
document.addEventListener('change', function(e){
  var el=e.target;
  if(el.id==='fupin'){ fupFiles(el.files); el.value=''; return; }
  if(el.dataset && el.dataset.fup){ var list=el.dataset.fup==='tx'?FUP.items:el.dataset.fup==='deal'?FUP.deals:FUP.pays; list[+el.dataset.i].on=el.checked; render(); return; }
  if(el.dataset && el.dataset.fupcat!=null){ var x=FUP.items[+el.dataset.fupcat]; x.cat=el.value; x.sure=2; if(x.cat==='cash') x.type='move'; render(); return; }
  if(el.dataset && el.dataset.fuprc!=null && el.value){ fupReceiptApply(+el.dataset.fuprc, el.value); return; }
});
function fupAction(a,b){
  if(a==='fupgo'){ fupCommit(); return true; }
  if(a==='fupclear'){ FUP.items=[]; FUP.deals=[]; FUP.pays=[]; FUP.notes=[]; render(); return true; }
  if(a==='fuprc'){ fupReceiptApply(+b.dataset.i, b.dataset.t); return true; }
  if(a==='fuprcx'){ FUP.receipts.splice(+b.dataset.i,1); render(); return true; }
  return false;
}
