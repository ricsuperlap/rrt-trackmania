
export default async function handler(req,res){
  const UA='RRT-Trackmania-Classement/1.0 (contact: rrt-trackmania.vercel.app)';
  const pilots=[
    {display:"[CORT] Nicolas Richard",pseudo:"ricsuperlap1",id:"13eb345e-882a-402e-86f8-16db37d54911"},
    {display:"mathYeuu2.0",pseudo:"Mathy6hj",id:"07c32c91-3051-40cd-96ed-8e60b8a24c90"},
    {display:"m0ugg",pseudo:"m0ugg",id:"761bfc7c-484b-42a0-80c2-4612531d83ba"},
    {display:"Deuxfrai",pseudo:"Deuxfrai",id:"761c5673-1518-42fd-8100-f36d0879d618"},
    {display:"Strakiste",pseudo:"Starkiste",id:"f941396b-3ede-4cc3-88d7-c0893f9a44f0"},
    {display:"Esyole",pseudo:"Esyole",id:"d98837a3-51bc-47d5-88ab-0b2ceec0ae09"},
  ];
  const ids=new Set(pilots.map(p=>p.id));
  async function get(url){ const r=await fetch(url,{headers:{'User-Agent':UA}}); if(!r.ok) throw new Error(url+' -> '+r.status); return r.json(); }
  try{
    let camp=null, campErr=null;
    for(const u of ['https://trackmania.io/api/campaigns/0','https://trackmania.io/api/campaign/0']){
      try{ camp=await get(u); break; }catch(e){ campErr=e.message; }
    }
    if(!camp) throw new Error('Campagne introuvable: '+campErr);
    // camp shape: {campaign:{playlist:[{map:{mapUid,name,mapId}, leaderboarduid}]}} or {playlist:[...]} or array
    let playlist = camp?.campaign?.playlist || camp?.playlist || camp?.campaigns?.[0]?.playlist || [];
    if(!playlist.length && Array.isArray(camp)) playlist = camp[0]?.playlist || [];
    playlist = playlist.slice(0,10);
    const circuits=[]; const times={}; const debug=[];
    for(let ci=0; ci<playlist.length; ci++){
      const item=playlist[ci];
      const map=item.map||item;
      const mapUid=map.mapUid||map.uid||item.mapUid;
      const lbUid=item.leaderboarduid||item.leaderboardUid||map.leaderboarduid;
      const name=map.name||('Circuit '+(ci+1));
      circuits.push(name);
      times[ci]={};
      if(!mapUid||!lbUid){ debug.push({ci,name,err:'no mapUid/lbUid'}); continue; }
      try{
        const lb=await get(`https://trackmania.io/api/leaderboard/${lbUid}/${mapUid}`);
        const tops=lb.tops||lb.top||[];
        for(const t of tops){
          const pid=t.player?.id||t.player?.accountId;
          if(ids.has(pid)){
            const pilot=pilots.find(p=>p.id===pid);
            const ms=t.time;
            // format ms -> m:ss.mmm
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
