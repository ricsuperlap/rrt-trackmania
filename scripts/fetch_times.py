
import json, urllib.request, time, sys
UA = "ricsuperlap1 | RRT-Trackmania-Classement | GitHub-Actions-Bot"
def get(url):
    req = urllib.request.Request(url, headers={"User-Agent": UA, "Accept": "application/json", "Referer": "https://trackmania.io/"})
    with urllib.request.urlopen(req, timeout=30) as r:
        txt = r.read().decode()
        if txt.strip().startswith("<"):
            raise Exception("HTML returned for "+url+" : "+txt[:200])
        return json.loads(txt)
pilots = json.loads(open("data.json").read())["pilots"]
ids = {p["id"]: p["display"] for p in pilots}
camp = None
for u in ["https://trackmania.io/api/campaigns/0","https://trackmania.io/api/campaign/0","https://trackmania.io/api/campaigns"]:
    try:
        camp = get(u); print("OK campaign", u); break
    except Exception as e:
        print("FAIL", u, e)
if not camp:
    print("CAMPAGNE INTROUVABLE"); sys.exit(1)
pl = camp.get("campaign",{}).get("playlist") or camp.get("playlist") or camp.get("campaigns",[{}])[0].get("playlist") or []
if not pl and isinstance(camp.get("campaigns"), list):
    for c in camp["campaigns"]:
        if c.get("playlist"): pl=c["playlist"]; break
pl = pl[:10]
circuits=[]; times={}
for ci,item in enumerate(pl):
    m=item.get("map") or item
    name=(m.get("name") or "").replace("$","")
    circuits.append(name or f"Circuit {ci+1}")
    times[str(ci)]={}
    mapUid=m.get("mapUid") or m.get("uid") or item.get("mapUid")
    lbUid=item.get("leaderboarduid") or item.get("leaderboardUid") or m.get("leaderboarduid")
    if not mapUid or not lbUid: continue
    try:
        lb=get(f"https://trackmania.io/api/leaderboard/{lbUid}/{mapUid}")
        for t in lb.get("tops",[]):
            pid=(t.get("player") or {}).get("id")
            if pid in ids:
                ms=t["time"]; s=ms//1000; milli=ms%1000; mn=s//60
                times[str(ci)][ids[pid]]=f"{mn}:{s%60:02d}.{milli:03d}"
        print(f"OK circuit {ci+1} {name} -> {times[str(ci)]}")
    except Exception as e:
        print("FAIL leaderboard", ci, e)
    time.sleep(0.5)
out={"circuits":circuits,"times":times,"fetchedAt":time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),"source":"trackmania.io via GitHub Actions"}
open("times.json","w").write_text(json.dumps(out, ensure_ascii=False, indent=2))
print("WROTE times.json")
