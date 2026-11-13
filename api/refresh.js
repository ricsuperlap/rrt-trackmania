
export default async function handler(req,res){
  const UA='ricsuperlap1 | RRT-Trackmania-Classement | via RRT';
  const pilots=[
    {display:"[CORT] Nicolas Richard",pseudo:"ricsuperlap1",id:"13eb345e-882a-402e-86f8-16db37d54911"},
    {display:"mathYeuu2.0",pseudo:"Mathy6hj",id:"07c32c91-3051-40cd-96ed-8e60b8a24c90"},
    {display:"m0ugg",pseudo:"m0ugg",id:"761bfc7c-484b-42a0-80c2-4612531d83ba"},
    {display:"Deuxfrai",pseudo:"Deuxfrai",id:"761c5673-1518-42fd-8100-f36d0879d618"},
    {display:"Strakiste",pseudo:"Starkiste",id:"f941396b-3ede-4cc3-88d7-c0893f9a44f0"},
    {display:"Esyole",pseudo:"Esyole",id:"d98837a3-51bc-47d5-88ab-0b2ceec0ae09"},
  ];
  const ids=new Set(pilots.map(p=>p.id));
  async function getJson(url){
    const r=await fetch(url,{headers:{'User-Agent':UA,'Accept':'application/json','Referer':'https://trackmania.io/'}});
    const txt=await r.text();
    if(!r.ok) throw new Error(url+' -> HTTP '+r.status+' : '+txt.slice(0,200));
    if(txt.trim().startsWith('<')) throw new Error(url+' -> a renvoyé du HTML (bloqué / Cloudflare) : '+txt.slice(0,200));
    try{ return JSON.parse(txt); }catch(e){ throw new Error(url+' -> JSON invalide : '+txt.slice(0,200)); }
  }
  const candidates=[
    'https://trackmania.io/api/campaigns/0',
    'https://trackmania.io/api/campaign/0',
    'https://trackmania.io/api/campaigns',
    'https://trackmania.io/api/campaigns/1',
    'https://trackmania.io/api/campaign/1',
  ];
  try{
    let camp=null, errors=[];
    for(const u of candidates){
      try{ camp=await getJson(u); if(camp) break; }catch(e){ errors.push(e.message); }
    }
    if(!camp) return res.status(500).json({ok:false, error:'Campagne introuvable. Essais : '+errors.join(' | ')});
    let playlist = camp?.campaign?.playlist || camp?.playlist || camp?.campaigns?.[0]?.playlist || camp?.[0]?.playlist || camp?.campaigns?.[0]?.campaign?.playlist || [];
    // Some shapes: {campaigns:[{playlist:[...]}]} or {campaign:{playlist}}
    if(!playlist.length && camp.campaigns && Array.isArray(camp.campaigns)){
      // find seasonal campaign (first with playlist)
      for(const c of camp.campaigns){ if(c.playlist?.length){ playlist=c.playlist; break; } }
    }
    if(!playlist.length) return res.status(500).json({ok:false, error:'Campagne trouvée mais playlist vide. Forme reçue : '+JSON.stringify(camp).slice(0,500), debug:errors});
    playlist = playlist.slice(0,10);
    const circuits=[]; const times={}; const debug=[];
    for(let ci=0; ci<playlist.length; ci++){
      const item=playlist[ci];
      const map=item.map||item;
      const mapUid=map.mapUid||map.uid||item.mapUid;
      const lbUid=item.leaderboarduid||item.leaderboardUid||map.leaderboarduid||item.leaderboardUid;
      const name=(map.name||'').replace(/\$[0-9a-fA-F]{3}/g,'').replace(/\$/g,'') || ('Circuit '+(ci+1));
      circuits.push(name);
      times[ci]={};
      if(!mapUid||!lbUid){ debug.push({ci,name,err:'no mapUid/lbUid',item:Object.keys(item||{})}); continue; }
      try{
        const lb=await getJson(`https://trackmania.io/api/leaderboard/${lbUid}/${mapUid}`);
        const tops=lb.tops||lb.top||[];
        for(const t of tops){
          const pid=t.player?.id||t.player?.accountId;
          if(ids.has(pid)){
            const pilot=pilots.find(p=>p.id===pid);
            const ms=t.time;
            const s=Math.floor(ms/1000), milli=ms%1000, min=Math.floor(s/60);
            times[ci][pilot.display]=`${min}:${String(s%60).padStart(2,'0')}.${String(milli).padStart(3,'0')}`;
          }
        }
      }catch(e){ debug.push({ci,name,err:e.message}); }
    }
    res.setHeader('Cache-Control','no-store');
    return res.status(200).json({ok:true, circuits, times, pilots, debug, fetchedAt:new Date().toISOString()});
  }catch(e){
    return res.status(500).json({ok:false, error:String(e.message||e)});
  }
}
