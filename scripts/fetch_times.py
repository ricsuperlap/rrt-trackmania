import json, urllib.request, sys

CAMPAIGN_ID = "157584"

PLAYERS = {
    "13eb345e-882a-402e-86f8-16db37d54911": "Nicolas",
    "07c32c91-3051-40cd-96ed-8e60b8a24c90": "Mathy",
    "761bfc7c-484b-42a0-80c2-4612531d83ba": "m0ugg",
    "761c5673-1518-42fd-8100-f36d0879d618": "Deuxfrai",
    "f941396b-3ede-4cc3-88d7-c0893f9a44f0": "Strakiste",
    "d98837a3-51bc-47d5-88ab-0b2ceec0ae09": "Esyole",
}

HEADERS = {"User-Agent": "RRT-Trackmania-Bot/1.0", "Accept": "application/json"}

def get_json(url):
    print(f"GET {url}")
    req = urllib.request.Request(url, headers=HEADERS)
    with urllib.request.urlopen(req, timeout=30) as r:
        text = r.read().decode("utf-8", errors="ignore")
    if text.strip().startswith("<"):
        print(f"FAIL {url} HTML returned")
        return None
    return json.loads(text)

def find_maps(obj, depth=0):
    if isinstance(obj, dict):
        print(f"KEYS niveau {depth} : {list(obj.keys())[:20]}")
        for k, v in obj.items():
            if isinstance(v, list) and v and isinstance(v[0], dict):
                first = v[0]
                if any(x in first for x in ("mapUid", "uid", "map_uid", "mapId", "map")):
                    print(f"MAPS trouves sous la cle '{k}' : {len(v)} circuits")
                    return v
            found = find_maps(v, depth + 1) if depth < 3 else None
            if found:
                return found
    if isinstance(obj, list) and obj and isinstance(obj[0], dict):
        first = obj[0]
        if any(x in first for x in ("mapUid", "uid", "map_uid", "mapId")):
            return obj
    return None

def main():
    url = f"https://trackmania.io/api/campaigns/seasonal/{CAMPAIGN_ID}"
    campaign = get_json(url)
    if not campaign:
        print("CAMPAGNE INTROUVABLE")
        sys.exit(1)
    print(f"OK campagne trouvee via {url}")
    print("DEBUT JSON campagne (2000 premiers caracteres) :")
    print(json.dumps(campaign, indent=2)[:2000])

    maps = find_maps(campaign) or []
    print(f"Nombre de circuits trouves : {len(maps)}")
    maps = maps[:10]

    result = {}
    for pid in PLAYERS:
        result[pid] = [None] * 10

    for idx, m in enumerate(maps):
        uid = m.get("mapUid") or m.get("uid") or m.get("map_uid") or (m.get("map") or {}).get("uid") if isinstance(m.get("map"), dict) else None
        if not uid and isinstance(m.get("map"), dict):
            uid = m["map"].get("mapUid") or m["map"].get("uid")
        name = m.get("name") or (m.get("map") or {}).get("name") if isinstance(m.get("map"), dict) else m.get("name")
        print(f"Circuit {idx+1} : {name} uid={uid}")
        if not uid:
            continue
        lb = None
        for lurl in [f"https://trackmania.io/api/leaderboard/map/{uid}", f"https://trackmania.io/api/leaderboard/map/{uid}?length=10000"]:
            try:
                data = get_json(lurl)
                if data:
                    lb = data
                    print(f"Leaderboard {uid} KEYS : {list(lb.keys())[:20] if isinstance(lb, dict) else type(lb)}")
                    break
            except Exception as e:
                print(f"FAIL leaderboard {uid} : {e}")
        if not lb:
            continue
        tops = lb.get("tops") or lb.get("leaderboard") or lb.get("results") or []
        print(f"Leaderboard {uid} : {len(tops)} lignes")
        for entry in tops:
            player = entry.get("player") or {}
            acc = player.get("accountId") or entry.get("accountId") or player.get("id")
            if acc in result:
                t = entry.get("time") or entry.get("score")
                if t:
                    result[acc][idx] = int(t)

    out = {"campaignId": CAMPAIGN_ID, "times": result}
    with open("times.json", "w", encoding="utf-8") as f:
        json.dump(out, f, indent=2)
    print("OK times.json ecrit")

if __name__ == "__main__":
    main()
