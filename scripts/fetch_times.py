import json, urllib.request

MAPUID1 = "ypPmohQofd72MyTsIsijKfrJH98"
NICOLAS_ID = "13eb345e-882a-402e-86f8-16db37d54911"

HEADERS = {"User-Agent": "RRT-Trackmania-Bot/1.0", "Accept": "application/json"}

def get_json(url):
    print(f"TEST {url}")
    req = urllib.request.Request(url, headers=HEADERS)
    with urllib.request.urlopen(req, timeout=30) as r:
        text = r.read().decode("utf-8", errors="ignore")
    if text.strip().startswith("<"):
        print(f"  -> HTML")
        return None
    return json.loads(text)

def main():
    for from_time in [25000, 30000, 35000, 40000]:
        lb = get_json(f"https://trackmania.io/api/leaderboard/map/{MAPUID1}?from={from_time}&length=100")
        if not lb:
            continue
        tops = lb.get("tops") or []
        print(f"  from={from_time} : {len(tops)} lignes, playercount={lb.get('playercount')}")
        if tops:
            print(f"    Premier : position {tops[0].get('position')}, temps {tops[0].get('time')}, nom {(tops[0].get('player') or {}).get('name')}")
            print(f"    Dernier : position {tops[-1].get('position')}, temps {tops[-1].get('time')}, nom {(tops[-1].get('player') or {}).get('name')}")
            for e in tops:
                player = e.get("player") or {}
                if player.get("id") == NICOLAS_ID:
                    print(f"    TROUVE ricsuperlap1 ! Position {e.get('position')}, Temps {e.get('time')} ms")
                    break

if __name__ == "__main__":
    main()
