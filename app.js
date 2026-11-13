
let DB=JSON.parse(localStorage.getItem('rrt-v2')||'null');
fetch('data.json').then(r=>r.json()).then(d=>{ if(!DB){ DB=d; DB.times={}; } init(); });
const BAREME=[32,26,22,19,17,15,13,11,9,7,5,4,3,2,1,0];
const P = p => typeof p==='string'? p : p.display;
function parse(t){if(!t)return null;t=String(t).trim().replace(',','.');let m=t.match(/^(?:(\d+):)?(\d+)\.(\d{1,3})$/);if(!m)return null;return (parseInt(m[1]||0)*60+parseInt(m[2]))*1000+parseInt((m[3]+'000').slice(0,3));}
function fmt(ms){if(ms==null)return '-';let s=Math.floor(ms/1000),milli=ms%1000,min=Math.floor(s/60);return min+':'+String(s%60).padStart(2,'0')+'.'+String(milli).padStart(3,'0');}
function save(){localStorage.setItem('rrt-v2',JSON.stringify(DB));render();}
function circuitResults(ci){let arr=DB.pilots.map(p=>({p:P(p),ms:parse((DB.times[ci]||{})[P(p)]||'')})).filter(x=>x.ms!=null).sort((a,b)=>a.ms-b.ms);let pts={};arr.forEach((x,i)=>{let pt=BAREME[i]??0;if(i>0&&x.ms===arr[i-1].ms)pt=pts[arr[i-1].p];pts[x.p]=pt;});return {arr,pts};}
function render(){let totals={};DB.pilots.forEach(pp=>{let p=P(pp);totals[p]={pts:0,win:0,pod:0,top5:0,played:0,best:null};});
DB.circuits.forEach((c,ci)=>{let {arr,pts}=circuitResults(ci);arr.forEach((x,i)=>{let t=totals[x.p];t.pts+=pts[x.p];t.played++;if(i===0)t.win++;if(i<3)t.pod++;if(i<5)t.top5++;if(t.best==null||x.ms<t.best)t.best=x.ms;});});
let order=DB.pilots.map(P).sort((a,b)=>totals[b].pts-totals[a].pts||totals[b].win-totals[a].win);
document.getElementById('standing').innerHTML=order.map((p,i)=>`<tr><td>${i+1}</td><td><b>${p}</b></td><td><b>${totals[p].pts}</b></td><td>${totals[p].win}</td><td>${totals[p].pod}</td><td>${totals[p].top5}</td><td>${totals[p].played}/10</td><td>${fmt(totals[p].best)}</td></tr>`).join('');
document.getElementById('podium').innerHTML=order.slice(0,3).map((p,i)=>`<div><div>${['🥇','🥈','🥉'][i]}</div><b>${p}</b><div>${totals[p].pts} pts</div></div>`).join('');
let mh='<table><thead><tr><th>Circuit</th>'+DB.pilots.map(p=>`<th>${P(p)}</th>`).join('')+'</tr></thead><tbody>'+DB.circuits.map((c,ci)=>{let {arr,pts}=circuitResults(ci);let pos={};arr.forEach((x,i)=>pos[x.p]=i+1);return `<tr><td>${c}</td>`+DB.pilots.map(pp=>{let p=P(pp);return `<td>${pos[p]?`P${pos[p]} • ${pts[p]} pts<br><small>${fmt(parse((DB.times[ci]||{})[p]))}</small>`:'-'}</td>`}).join('')+'</tr>'}).join('')+'</tbody></table>';document.getElementById('matrix').innerHTML=mh;}
function init(){
let sel=document.getElementById('circuitSel');sel.innerHTML=DB.circuits.map((c,i)=>`<option value="${i}">${c}</option>`).join('');
document.getElementById('rename').innerHTML=DB.circuits.map((c,i)=>`<input data-rename="${i}" value="${c}">`).join('');
document.querySelectorAll('[data-rename]').forEach(el=>el.onchange=()=>{DB.circuits[el.dataset.rename]=el.value;save();});
function drawForm(){let ci=+sel.value;document.getElementById('circuitForm').innerHTML='<div class="grid">'+DB.pilots.map(pp=>{let p=P(pp);return `<label>${p}<input data-pilot="${p}" value="${(DB.times[ci]||{})[p]||''}" placeholder="0:00.000"></label>`}).join('')+'</div>';}
sel.onchange=drawForm;drawForm();
document.getElementById('saveCircuit').onclick=()=>{let ci=+sel.value;DB.times[ci]=DB.times[ci]||{};document.querySelectorAll('[data-pilot]').forEach(el=>DB.times[ci][el.dataset.pilot]=el.value);save();alert('Circuit enregistré ✅');};
render();
document.querySelectorAll('nav button').forEach(b=>b.onclick=()=>{document.querySelectorAll('nav button').forEach(x=>x.classList.remove('active'));b.classList.add('active');document.querySelectorAll('.tab').forEach(t=>t.classList.remove('active'));document.getElementById('tab-'+b.dataset.tab).classList.add('active');});
document.getElementById('importCsv').onclick=()=>{let lines=document.getElementById('csv').value.split('\n');let n=0;lines.forEach(l=>{let [ci,p,t]=l.split(',').map(s=>s&&s.trim());if(!ci||!p||!t)return;let idx=parseInt(ci)-1;if(isNaN(idx)||idx<0||idx>9)return;DB.times[idx]=DB.times[idx]||{};DB.times[idx][p]=t;n++;});save();document.getElementById('msg').textContent=n+' temps importés ✅';};
document.getElementById('exportCsv').onclick=()=>{let out=['circuit,pilote,temps'];DB.circuits.forEach((c,ci)=>DB.pilots.map(P).forEach(p=>{let t=(DB.times[ci]||{})[p];if(t)out.push(`${String(ci+1).padStart(2,'0')},${p},${t}`)}));let a=document.createElement('a');a.href=URL.createObjectURL(new Blob([out.join('\n')],{type:'text/csv'}));a.download='rrt-temps.csv';a.click();};
document.getElementById('copyDiscord').onclick=()=>{let totals={};DB.pilots.map(P).forEach(p=>totals[p]=0);DB.circuits.forEach((c,ci)=>{let {pts}=circuitResults(ci);Object.keys(pts).forEach(p=>totals[p]+=pts[p]);});let order=DB.pilots.map(P).sort((a,b)=>totals[b]-totals[a]);let txt='🏆 **RRT — CLASSEMENT TRACKMANIA**\n'+order.map((p,i)=>`${['🥇','🥈','🥉','4️⃣','5️⃣','6️⃣'][i]||''} ${p} — **${totals[p]} pts**`).join('\n');navigator.clipboard.writeText(txt).then(()=>alert('Copié pour Discord ✅'));};
document.getElementById('reset').onclick=()=>{if(confirm('Reset tous les temps ?')){DB.times={};save();}};
const autoBtn=document.getElementById('autoBtn'); if(autoBtn){ autoBtn.onclick=async()=>{ const st=document.getElementById('autoStatus'); st.textContent='⏳ Récupération sur trackmania.io...'; autoBtn.disabled=true; try{ const r=await fetch('/api/refresh'); const j=await r.json(); if(!j.ok) throw new Error(j.error||'Erreur API'); if(j.circuits && j.circuits.length) DB.circuits=j.circuits.slice(0,10); DB.times=j.times||{}; save(); // refresh selectors
 sel.innerHTML=DB.circuits.map((c,i)=>`<option value="${i}">${c}</option>`).join(''); drawForm(); st.textContent='✅ Temps récupérés ! Dernière synchro : '+new Date(j.fetchedAt).toLocaleString('fr-FR'); }catch(e){ st.textContent='❌ '+e.message+' — Tu peux toujours saisir manuellement.'; } autoBtn.disabled=false; }; }
}
