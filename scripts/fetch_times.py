import json, urllib.request

MAPUID1 = "ypPmohQofd72MyTsIsijKfrJH98"
NICOLAS = "13eb345e-882a-402e-86f8-16db37d54911"

HEADERS = {"User-Agent": "RRT-Trackmania-Bot/1.0", "Accept": "application/json"}

def get_json(url):
    print(f"TEST {url}")
    req = urllib.request.Request(url, headers=HEADERS)
    with urllib.request.urlopen(req, timeout=30) as r:
        text = r.read().decode("utf-8", errors="ignore")
    return json.loads(text)

def main():
    lb = get_json(f"https://trackmania.io/api/leaderboard/map/{MAPUID1}?length=100")
    print(f"CLES : {list(lb.keys())}")
    tops = lb.get("tops") or []
    print(f"Nombre de joueurs dans le classement : {len(tops) if tops else 0}")
    print("PREMIERS JOUEURS :")
    print(json.dumps(tops[:5], indent=2)[:2000])
    print("RECHERCHE NICOLAS :")
    for e in (tops or []):
        player = e.get("player") or {}
        if player.get("accountId") == NICOLAS or e.get("accountId") == NICOLAS:
            print(f"TROUVE NICOLAS ! Temps = {e.get('time')} ms")
            print(json.dumps(e, indent=2)[:1000])
            break
    else:
        print("Nicolas pas dans les 100 premiers, on cherchera autrement")

if __name__ == "__main__":
    main()
