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
    print(f"TEST {url}")
    req = urllib.request.Request(url, headers=HEADERS)
    with urllib.request.urlopen(req, timeout=30) as r:
        text = r.read().decode("utf-8", errors="ignore")
    if text.strip().startswith("<"):
        print(f"  -> HTML, pas bon")
        return None
    try:
        data = json.loads(text)
        if isinstance(data, dict):
            print(f"  -> JSON OK, cles : {list(data.keys())[:15]}")
        else:
            print(f"  -> JSON OK, type : {type(data)}")
        return data
    except Exception as e:
        print(f"  -> JSON invalide : {e}")
        return None

def extract_maps(data):
    if isinstance(data, dict):
        for k in ["maps", "playlist", "tracks", "campaignMaps"]:
            if k in data and isinstance(data[k], list) and data[k]:
                print(f"MAPS trouves sous '{k}' : {len(data[k])}")
                return data[k]
        for k, v in data.items():
            if isinstance(v, dict):
                found = extract_maps(v)
                if found:
                    return found
            if isinstance(v, list) and v and isinstance(v[0], dict) and any(x in v[0] for x in ("mapUid", "uid", "map_uid")):
                print(f"MAPS trouves sous '{k}' : {len(v)}")
                return v
    if isinstance(data, list) and data and isinstance(data[0], dict) and any(x in data[0] for x in ("mapUid", "uid")):
        return data
    return []

def main():
    maps = []
    candidates = [
        f"https://trackmania.io/api/campaigns/seasonal/{CAMPAIGN_ID}/maps",
        f"https://trackmania.io/api/campaigns/{CAMPAIGN_ID}/maps",
        f"https://trackmania.io/api/campaign/{CAMPAIGN_ID}/maps",
        f"https://trackmania.io/api/campaigns/seasonal/{CAMPAIGN_ID}/0",
        f"https://trackmania.io/api/campaigns/{CAMPAIGN_ID}/0",
        f"https://trackmania.io/api/campaigns/seasonal/{CAMPAIGN_ID}?page=0",
        f"https://trackmania.io/api/maps?campaign={CAMPAIGN_ID}",
        f"https://trackmania.io/api/campaigns/{CAMPAIGN_ID}",
    ]
    for url in candidates:
        try:
            data = get_json(url)
            if not data:
                continue
            maps = extract_maps(data)
            if maps:
                print(f"GAGNE ! Circuits trouves via {url}")
                break
        except Exception as e:
            print(f"  -> Erreur {url} : {e}")
    print(f"Nombre de circuits trouves : {len(maps)}")
    maps = maps[:10]
    result = {}
    for pid in PLAYERS:
        result[pid] = [None] * 10
    for idx, m in enumerate(maps):
        uid = m.get("mapUid") or m.get("uid") or m.get("map_uid") or ((m.get("map") or {}).get("uid") if isinstance(m.get("map"), dict) else None)
        if not uid and isinstance(m.get("map"), dict):
            uid = m["map"].get("mapUid") or m["map"].get("uid")
        name = m.get("name") or ((m.get("map") or {}).get("name") if isinstance(m.get("map"), dict) else None) or f"Circuit {idx+1}"
        print(f"Circuit {idx+1} : {name} uid={uid} - GRATUIT, on garde")
        if not uid:
            continue
        for lurl in [f"https://trackmania.io/api/leaderboard/map/{uid}", f"https://trackmania.io/api/leaderboard/map/{uid}?length=10000"]:
            try:
                lb = get_json(lurl)
                if not lb:
                    continue
                tops = lb.get("tops") or lb.get("leaderboard") or lb.get("results") or []
                print(f"  Leaderboard : {len(tops)} lignes")
                for entry in tops:
                    player = entry.get("player") or {}
                    acc = player.get("accountId") or entry.get("accountId") or player.get("id")
                    if acc in result:
                        t = entry.get("time") or entry.get("score")
                        if t:
                            result[acc][idx] = int(t)
                break
            except Exception as e:
                print(f"  FAIL leaderboard {e}")
    out = {"campaignId": CAMPAIGN_ID, "times": result}
    with open("times.json", "w", encoding="utf-8") as f:
        json.dump(out, f, indent=2)
    print("OK times.json ecrit")

if __name__ == "__main__":
    main()
