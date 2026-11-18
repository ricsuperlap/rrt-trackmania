
const BAREME=[32,26,22,19,17,15,13,11,9,7,5,4,3,2,1,0];
const PILOTS=["[CORT] Nicolas Richard","mathYeuu2.0","m0ugg","Deuxfrai","Strakiste","Esyole"];
function parse(t){if(!t)return null;t=String(t).trim().replace(',','.');let m=t.match(/^(?:(\d+):)?(\d+)\.(\d{1,3})$/);if(!m)return null;let min=parseInt(m[1]||0),sec=parseInt(m[2]),ms=parseInt((m[3]+'000').slice(0,3));return ((min*60)+sec)*1000+ms;}
function fmt(ms){if(ms==null)return '-';let s=Math.floor(ms/1000),milli=ms%1000,min=Math.floor(s/60);return min+':'+String(s%60).padStart(2,'0')+'.'+String(milli).padStart(3,'0');}
async function load(){
  let times=[];
  try{let r=await fetch('times.json');let j=await r.json();times=j.times||j||[];}catch(e){}
  // times est par circuit : times[ci] = { "Pilote": "0:20.168" }
  let perPilot=PILOTS.map(name=>{
    let cells=[],total=0;
    for(let ci=0;ci<10;ci++){
      let raw=(times[ci]||{})[name];
      let ms=parse(raw);
      cells.push({ms,pts:0,raw});
    }
    return {name,cells,total};
  });
  // points par circuit
  for(let ci=0;ci<10;ci++){
    let arr=perPilot.map((p,i)=>({i,ms:p.cells[ci].ms})).filter(x=>x.ms!=null).sort((a,b)=>a.ms-b.ms);
    arr.forEach((x,pos)=>{perPilot[x.i].cells[ci].pts=BAREME[pos]||0;});
  }
  perPilot.forEach(p=>{p.total=p.cells.reduce((s,c)=>s+c.pts,0);});
  perPilot.sort((a,b)=>b.total-a.total);
  let tbody=document.getElementById('rows');
  tbody.innerHTML=perPilot.map((p,idx)=>{
    let cells=p.cells.map(c=> c.ms==null?'<td class="empty">—</td>':'<td><span class="time">'+fmt(c.ms)+'</span><span class="pts">'+c.pts+' pts</span></td>').join('');
    return '<tr class="'+(idx===0?'leader':'')+'"><td>'+(idx+1)+'</td><td class="pilot">'+p.name+'</td>'+cells+'<td class="total">'+p.total+'</td></tr>';
  }).join('');
  // bouton Discord
  let btn=document.getElementById('copyDiscord');
  if(btn) btn.onclick=async()=>{
    let lines=['🏁 RRT - Fall 2026'];
    perPilot.forEach((p,i)=>{lines.push((i+1)+'. '+p.name+' - '+p.total+' pts');});
    let txt=lines.join('\n');
    try{await navigator.clipboard.writeText(txt);document.getElementById('copyMsg').textContent='Copié ! Colle dans Discord.';}catch(e){prompt('Copie ce texte dans Discord :',txt);}
  };
}
load();
