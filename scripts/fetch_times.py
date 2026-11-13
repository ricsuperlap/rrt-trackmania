import json, urllib.request

MAPUID1 = "ypPmohQofd72MyTsIsijKfrJH98"

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
    if isinstance(data, dict):
        print(f"  -> CLES : {list(data.keys())[:20]}")
    return data

def main():
    print("=== 1 : Trouver le club RRT ===")
    for url in [
        "https://trackmania.io/api/clubs?search=RRT",
        "https://trackmania.io/api/club/search/RRT",
        "https://trackmania.io/api/clubs/RRT",
    ]:
        try:
            data = get_json(url)
            if data:
                print(json.dumps(data, indent=2)[:2000])
        except Exception as e:
            print(f"  -> Erreur : {e}")
    print("=== 2 : Classement club pour Circuit 1 ===")
    for url in [
        f"https://trackmania.io/api/leaderboard/map/{MAPUID1}?club=RRT",
        f"https://trackmania.io/api/leaderboard/map/{MAPUID1}/club/RRT",
        f"https://trackmania.io/api/clubs/RRT/leaderboard/map/{MAPUID1}",
    ]:
        try:
            data = get_json(url)
            if data:
                print(json.dumps(data, indent=2)[:2000])
        except Exception as e:
            print(f"  -> Erreur : {e}")

if __name__ == "__main__":
    main()
