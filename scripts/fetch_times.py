import json, urllib.request

UID1 = "28ccb484-72ab-40d5-bb3c-653ca554ceb0"
NICOLAS = "13eb345e-882a-402e-86f8-16db37d54911"

HEADERS = {"User-Agent": "RRT-Trackmania-Bot/1.0", "Accept": "application/json"}

def get_json(url):
    print(f"TEST {url}")
    req = urllib.request.Request(url, headers=HEADERS)
    with urllib.request.urlopen(req, timeout=30) as r:
        text = r.read().decode("utf-8", errors="ignore")
    if text.strip().startswith("<"):
        print(f"  -> HTML, pas bon")
        return None
    data = json.loads(text)
    if isinstance(data, dict):
        print(f"  -> JSON OK, cles : {list(data.keys())[:20]}")
    else:
        print(f"  -> JSON OK, liste de {len(data)} elements")
    return data

def main():
    for url in [
        f"https://trackmania.io/api/leaderboard/map/{UID1}",
        f"https://trackmania.io/api/leaderboard/map/{UID1}?length=100",
        f"https://trackmania.io/api/maps/{UID1}",
        f"https://trackmania.io/api/map/{UID1}",
    ]:
        try:
            data = get_json(url)
            if not data:
                continue
            print("  DEBUT JSON :")
            print(json.dumps(data, indent=2)[:2000])
        except Exception as e:
            print(f"  -> Erreur : {e}")
    print("FIN TEST CIRCUIT 1")

if __name__ == "__main__":
    main()
