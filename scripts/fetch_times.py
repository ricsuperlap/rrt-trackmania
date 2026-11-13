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
    data = json.loads(text)
    if isinstance(data, dict):
        print(f"  -> CLES : {list(data.keys())[:15]}")
    return data

def main():
    for url in [
        f"https://trackmania.io/api/leaderboard/map/{MAPUID1}/surround/{NICOLAS_ID}",
        f"https://trackmania.io/api/leaderboard/map/{MAPUID1}/surround/{NICOLAS_ID}?length=10",
        f"https://trackmania.io/api/leaderboard/map/{MAPUID1}?accountId={NICOLAS_ID}",
        f"https://trackmania.io/api/leaderboard/map/{MAPUID1}?accountIds={NICOLAS_ID}",
        f"https://trackmania.io/api/player/{NICOLAS_ID}",
        f"https://trackmania.io/api/players?search=ricsuperlap1",
    ]:
        try:
            data = get_json(url)
            if data:
                print(json.dumps(data, indent=2)[:1800])
        except Exception as e:
            print(f"  -> Erreur : {e}")

if __name__ == "__main__":
    main()
