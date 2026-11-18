
const BAREME=[32,26,22,19,17,15,13,11,9,7,5,4,3,2,1,0];
const DEFAULT_PILOTS=["[CORT] Nicolas Richard","mathYeuu2.0","m0ugg","Deuxfrai","Strakiste","Esyole"];
let PILOTS=[...DEFAULT_PILOTS];
let CURRENT_CIRCUIT=6;
let ACTIVE_TAB="general";
let TIMES=[]; // TIMES[ci] = { "Pilote": "0:20.168" }
function parse(t){if(!t)return null;t=String(t).trim().replace(',','.');if(!t)return null;let m=t.match(/^(?:(\d+):)?(\d+)\.(\d{1,3})$/);if(!m)return null;let min=parseInt(m[1]||0),sec=parseInt(m[2]),ms=parseInt((m[3]+'000').slice(0,3));return ((min*60)+sec)*1000+ms;}
function fmt(ms){if(ms==null)return '-';let s=Math.floor(ms/1000),milli=ms%1000,min=Math.floor(s/60);return min+':'+String(s%60).padStart(2,'0')+'.'+String(milli).padStart(3,'0');}
function loadLocal(){
  try{
    let saved=JSON.parse(localStorage.getItem('rrt-edit-v1')||'null');
    if(saved && saved.pilots && saved.times){PILOTS=saved.pilots; TIMES=saved.times; if(typeof saved.currentCircuit==='number') CURRENT_CIRCUIT=saved.currentCircuit; return true;}
  }catch(e){}
  return false;
}
function saveLocal(){
  localStorage.setItem('rrt-edit-v1', JSON.stringify({pilots:PILOTS, times:TIMES, currentCircuit:CURRENT_CIRCUIT}));
}
async function load(){
  let fromLocal=loadLocal();
  if(!fromLocal){
    try{let r=await fetch('times.json');let j=await r.json();TIMES=j.times||j||[]; if(j.pilots && Array.isArray(j.pilots) && j.pilots.length) PILOTS=j.pilots; if(typeof j.currentCircuit==='number') CURRENT_CIRCUIT=j.currentCircuit;}catch(e){TIMES=[];}
    while(TIMES.length<10) TIMES.push({});
  }
  render();
}
function compute(){
  let per=PILOTS.map(name=>{
    let cells=[];
    for(let ci=0;ci<10;ci++){let raw=(TIMES[ci]||{})[name]; cells.push({ms:parse(raw),pts:0});}
    return {name,cells,total:0};
  });
  for(let ci=0;ci<10;ci++){
    let arr=per.map((p,i)=>({i,ms:p.cells[ci].ms})).filter(x=>x.ms!=null).sort((a,b)=>a.ms-b.ms);
    arr.forEach((x,pos)=>{per[x.i].cells[ci].pts=BAREME[pos]||0;});
  }
  per.forEach(p=>{p.total=p.cells.reduce((s,c)=>s+c.pts,0);});
  per.sort((a,b)=>b.total-a.total);
  // banner + circuit view
  let b=document.getElementById('bannerCircuit'); if(b) b.textContent='Circuit '+(CURRENT_CIRCUIT+1);
  let ct=document.getElementById('circuitTitle'); if(ct) ct.textContent=String(CURRENT_CIRCUIT+1);
  let cs=document.getElementById('circuitSelect'); if(cs) cs.value=String(CURRENT_CIRCUIT);
  let ccs=document.getElementById('currentCircuitSelect'); if(ccs) ccs.value=String(CURRENT_CIRCUIT);
  renderCircuit();
  let qp=document.getElementById('quickPilot');
  if(qp){ let cur=qp.value; qp.innerHTML=PILOTS.map(n=>'<option>'+n+'</option>').join(''); if(cur) qp.value=cur; }
  return per;
}
function circuitRanking(ci){
  let arr=PILOTS.map(n=>({name:n, ms:parse((TIMES[ci]||{})[n])})).filter(x=>x.ms!=null).sort((a,b)=>a.ms-b.ms);
  arr.forEach((x,pos)=>{ x.pts=BAREME[pos]||0; });
  return arr;
}
function renderCircuit(){
  let el=document.getElementById('circuitRows'); if(!el) return;
  let ci=CURRENT_CIRCUIT; let arr=circuitRanking(ci);
  if(!arr.length){ el.innerHTML='<tr><td colspan="5">Aucun chrono pour le moment sur ce circuit.</td></tr>'; }
  else{
    let best=arr[0].ms;
    el.innerHTML=arr.map((x,i)=>'<tr><td>'+(i+1)+'</td><td class="pilot">'+x.name+'</td><td><b>'+fmt(x.ms)+'</b></td><td>'+x.pts+' pts</td><td>'+(i===0?'— Leader':'+'+((x.ms-best)/1000).toFixed(3)+' s')+'</td></tr>').join('')
    + PILOTS.filter(n=>parse((TIMES[ci]||{})[n])==null).map(n=>'<tr><td>—</td><td class="pilot">'+n+'</td><td class="empty">—</td><td>—</td><td>—</td></tr>').join('');
  }
  let leg=document.getElementById('circuitLegend'); if(leg) leg.textContent='Circuit '+(ci+1)+' - '+arr.length+' / '+PILOTS.length+' joueurs ont fait un chrono. Clôture dimanche 20h00.';
}
function switchTab(tab){
  ACTIVE_TAB=tab;
  document.querySelectorAll('.tab').forEach(bb=>{ bb.classList.toggle('active', bb.dataset.tab===tab); });
  document.getElementById('view-general').classList.toggle('hidden', tab!=='general');
  document.getElementById('view-circuit').classList.toggle('hidden', tab!=='circuit');
}

function render(){
  let per=compute();
  document.getElementById('rows').innerHTML=per.map((p,idx)=>{
    let cells=p.cells.map(c=> c.ms==null?'<td class="empty">—</td>':'<td><span class="time">'+fmt(c.ms)+'</span><span class="pts">'+c.pts+' pts</span></td>').join('');
    return '<tr class="'+(idx===0?'leader':'')+'"><td>'+(idx+1)+'</td><td class="pilot">'+p.name+'</td>'+cells+'<td class="total">'+p.total+'</td></tr>';
  }).join('');
  return per;
}
function openEditor(){
  let ed=document.getElementById('editor'); ed.classList.remove('hidden');
  let html='<table class="edit-table"><thead><tr><th>Pilote</th>';
  for(let i=1;i<=10;i++) html+='<th>C'+i+'</th>';
  html+='<th>Suppr.</th></tr></thead><tbody>';
  PILOTS.forEach((name,pi)=>{
    html+='<tr><td><input class="name" data-p="'+pi+'" value="'+name.replace(/"/g,'&quot;')+'"></td>';
    for(let ci=0;ci<10;ci++){
      let v=(TIMES[ci]||{})[name]||'';
      html+='<td><input data-ci="'+ci+'" data-p="'+pi+'" value="'+v+'" placeholder="—"></td>';
    }
    html+='<td><button type="button" class="del-pilot" data-p="'+pi+'">✕</button></td></tr>';
  });
  html+='</tbody></table>';
  document.getElementById('editGrid').innerHTML=html;
  document.querySelectorAll('.del-pilot').forEach(b=>{
    b.onclick=()=>{
      let pi=parseInt(b.dataset.p);
      let name=PILOTS[pi];
      if(!confirm('Supprimer '+name+' ?')) return;
      PILOTS.splice(pi,1);
      // on enlève ses temps aussi
      TIMES.forEach(t=>{delete t[name];});
      saveLocal(); render(); openEditor();
    };
  });
  ed.scrollIntoView({behavior:'smooth'});
}
function saveEditor(){
  let newPilots=[...PILOTS];
  document.querySelectorAll('input.name').forEach(inp=>{newPilots[parseInt(inp.dataset.p)]=inp.value.trim()||newPilots[parseInt(inp.dataset.p)];});
  let newTimes=[]; for(let ci=0;ci<10;ci++) newTimes.push({});
  document.querySelectorAll('#editGrid input:not(.name)').forEach(inp=>{
    let v=inp.value.trim(); if(!v) return;
    let ci=parseInt(inp.dataset.ci), pi=parseInt(inp.dataset.p);
    newTimes[ci][newPilots[pi]]=v;
  });
  // si un nom a changé, on garde les temps sous le nouveau nom (déjà fait ci-dessus)
  // on enlève les lignes avec un nom vide
  let keep=[]; let remap={};
  newPilots.forEach((n,idx)=>{ if(n.trim()){ remap[idx]=keep.length; keep.push(n); } });
  let cleaned=[]; for(let ci=0;ci<10;ci++){ cleaned.push({}); }
  Object.keys(newTimes).forEach(ci=>{
    Object.entries(newTimes[ci]).forEach(([nm,v])=>{
      let oldIdx=newPilots.indexOf(nm);
      if(oldIdx in remap) cleaned[ci][keep[remap[oldIdx]]]=v;
    });
  });
  let _cc=document.getElementById('currentCircuitSelect'); if(_cc) CURRENT_CIRCUIT=parseInt(_cc.value||'0');
  PILOTS=keep.length?keep:newPilots; TIMES=cleaned; saveLocal(); render();
  document.getElementById('saveMsg').textContent='✅ Enregistré ! Le classement est à jour. Pense à télécharger times.json pour partager sur GitHub.';
}

function askCode(){
  let code=prompt('🔐 Code pour continuer :');
  if(code===null) return false;
  if(code.trim()!=='9645'){ alert('❌ Mauvais code.'); return false; }
  return true;
}
document.querySelectorAll('.tab').forEach(bb=>{ bb.onclick=()=>switchTab(bb.dataset.tab); });
let _cs=document.getElementById('circuitSelect'); if(_cs) _cs.onchange=(e)=>{ CURRENT_CIRCUIT=parseInt(e.target.value); saveLocal(); render(); };
let _qs=document.getElementById('quickSave');
if(_qs) _qs.onclick=()=>{
  if(!askCode()) return;
  let pilot=document.getElementById('quickPilot').value;
  let t=document.getElementById('quickTime').value.trim();
  if(!t){ alert('Tape le chrono, ex : 0:22.456'); return; }
  if(!parse(t)){ alert('Format pas compris. Tape comme dans le jeu : 0:22.456'); return; }
  while(TIMES.length<10) TIMES.push({});
  TIMES[CURRENT_CIRCUIT][pilot]=t;
  saveLocal(); render();
  document.getElementById('quickTime').value='';
  document.getElementById('quickMsg').textContent='✅ '+pilot+' - Circuit '+(CURRENT_CIRCUIT+1)+' : '+t+' enregistré ! Fais ta capture.';
};
document.getElementById('toggleEdit').onclick=()=>{let ed=document.getElementById('editor'); if(!ed.classList.contains('hidden')){ ed.classList.add('hidden'); return; } if(!askCode()) return; openEditor();};
document.getElementById('saveEdit').onclick=saveEditor;
document.getElementById('addPlayerBtn').onclick=()=>{
  // on sauvegarde d'abord ce qui est tapé, pour ne pas perdre
  try{ saveEditor(); }catch(e){}
  document.getElementById('saveMsg').textContent='';
  PILOTS.push('Nouveau pilote');
  saveLocal(); render(); openEditor();
  // on met le curseur sur le nouveau nom
  let inputs=document.querySelectorAll('input.name');
  let last=inputs[inputs.length-1]; if(last){ last.focus(); last.select(); }
};
document.getElementById('cancelEdit').onclick=()=>{document.getElementById('editor').classList.add('hidden');};
document.getElementById('resetEdit').onclick=()=>{if(!confirm('Effacer tous les temps ?')) return; TIMES=[]; for(let i=0;i<10;i++) TIMES.push({}); saveLocal(); render(); openEditor();};
document.getElementById('copyDiscord').onclick=async()=>{ if(!askCode()) return;
  if(ACTIVE_TAB==='circuit'){ let arr=circuitRanking(CURRENT_CIRCUIT); let txt='⏱️ RRT - Circuit '+(CURRENT_CIRCUIT+1)+' - Fall 2026\n'; if(!arr.length) txt+='Aucun chrono pour le moment.'; else arr.forEach((x,i)=>{ txt+=(i+1)+'. '+x.name+' - '+fmt(x.ms)+' - '+x.pts+' pts\n'; }); txt+='\n⏰ Clôture dimanche 20h00'; try{await navigator.clipboard.writeText(txt);document.getElementById('copyMsg').textContent='Copié ! Colle dans Discord.';}catch(e){prompt('Copie ce texte :',txt);} return; } if(!askCode()) return;
  let per=compute(); let lines=['🏁 RRT - Fall 2026'];
  per.forEach((p,i)=>{lines.push((i+1)+'. '+p.name+' - '+p.total+' pts');});
  let txt=lines.join('\n');
  try{await navigator.clipboard.writeText(txt);document.getElementById('copyMsg').textContent='Copié ! Colle dans Discord.';}catch(e){prompt('Copie ce texte :',txt);}
};
document.getElementById('downloadJson').onclick=()=>{ if(!askCode()) return; if(!askCode()) return;
  let data=JSON.stringify({pilots:PILOTS, times:TIMES},null,2);
  let blob=new Blob([data],{type:'application/json'});
  let a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download='times.json'; a.click();
};
load();
