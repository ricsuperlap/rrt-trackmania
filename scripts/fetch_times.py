import json, urllib.request

MAPUID1 = "ypPmohQofd72MyTsIsijKfrJH98"
NICOLAS = "13eb345e-882a-402e-86f8-16db37d54911"

HEADERS = {"User-Agent": "RRT-Trackmania-Bot/1.0", "Accept": "application/json"}

def get_json(url):
    print(f"TEST {url}")
    req = urllib.request.Request(url, headers=HEADERS)
    with urllib.request.urlopen(req, timeout=30) as r:
        text = r.read().decode("utf-8", errors="ignore")
    if text.strip().startswith("<"):
        print(f"  -> HTML")
        return None
    data = json.loads(text)
    print(f"  -> CLES : {list(data.keys())[:10] if isinstance(data, dict) else 'liste'}")
    return data

def find_in(lb):
    tops = (lb or {}).get("tops") or []
    for e in tops:
        player = e.get("player") or {}
        if player.get("id") == NICOLAS or player.get("accountId") == NICOLAS:
            print(f"TROUVE ! Position {e.get('position')}, Temps {e.get('time')} ms")
            return True
    print(f"  Pas trouve dans ce bout, {len(tops)} lignes")
    return False

def main():
    print("=== TEST 1 : 10000 premiers ===")
    lb = get_json(f"https://trackmania.io/api/leaderboard/map/{MAPUID1}?length=10000")
    if lb:
        find_in(lb)
    print("=== TEST 2 : par joueur ===")
    for url in [
        f"https://trackmania.io/api/leaderboard/map/{MAPUID1}/player/{NICOLAS}",
        f"https://trackmania.io/api/leaderboard/map/{MAPUID1}?player={NICOLAS}",
        f"https://trackmania.io/api/player/{NICOLAS}/map/{MAPUID1}",
    ]:
        try:
            data = get_json(url)
            if data:
                print(json.dumps(data, indent=2)[:1500])
        except Exception as e:
            print(f"  -> Erreur : {e}")
    print("=== TEST 3 : par offset 1000 ===")
    lb = get_json(f"https://trackmania.io/api/leaderboard/map/{MAPUID1}?length=100&offset=1000")
    if lb:
        find_in(lb)

if __name__ == "__main__":
    main()
