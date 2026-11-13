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

def main():
    campaign = None
    for url in [
        f"https://trackmania.io/api/campaigns/{CAMPAIGN_ID}",
        f"https://trackmania.io/api/campaign/{CAMPAIGN_ID}",
        f"https://trackmania.io/api/campaigns/seasonal/{CAMPAIGN_ID}",
        f"https://trackmania.io/api/campaign/seasonal/{CAMPAIGN_ID}",
    ]:
        try:
            data = get_json(url)
            if data:
                campaign = data
                print(f"OK campagne trouvee via {url}")
                break
        except Exception as e:
            print(f"FAIL {url} : {e}")
    if not campaign:
        print("CAMPAGNE INTROUVABLE")
        sys.exit(1)

    # La campagne peut etre sous "campaign", "maps" ou "playlist"
    inner = campaign.get("campaign", campaign)
    maps = inner.get("maps") or inner.get("playlist") or campaign.get("maps") or []
    print(f"Nombre de circuits trouves : {len(maps)}")
    maps = maps[:10]

    result = {}
    for pid in PLAYERS:
        result[pid] = [None] * 10

    for idx, m in enumerate(maps):
        uid = m.get("mapUid") or m.get("uid") or m.get("map_uid")
        name = m.get("name") or m.get("mapName") or f"Circuit {idx+1}"
        print(f"Circuit {idx+1} : {name} uid={uid}")
        if not uid:
            continue
        lb = None
        for url in [
            f"https://trackmania.io/api/leaderboard/map/{uid}",
            f"https://trackmania.io/api/leaderboard/map/{uid}?length=10000",
        ]:
            try:
                data = get_json(url)
                if data:
                    lb = data
                    break
            except Exception as e:
                print(f"FAIL leaderboard {uid} : {e}")
        if not lb:
            continue
        tops = lb.get("tops") or lb.get("leaderboard") or []
        for entry in tops:
            player = entry.get("player") or {}
            acc = player.get("accountId") or entry.get("accountId")
            if acc in result:
                t = entry.get("time") or entry.get("score")
                if t:
                    result[acc][idx] = int(t)

    out = {"campaignId": CAMPAIGN_ID, "times": result}
    with open("times.json", "w", encoding="utf-8") as f:
        json.dump(out, f, indent=2)
    print("OK times.json ecrit")
    print(json.dumps(out, indent=2))

if __name__ == "__main__":
    main()
