import json, urllib.request, sys

CAMPAIGN_ID = "157584"
NICOLAS = "13eb345e-882a-402e-86f8-16db37d54911"

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
    data = json.loads(text)
    if isinstance(data, dict):
        print(f"  -> JSON OK, cles : {list(data.keys())[:20]}")
    else:
        print(f"  -> JSON OK, liste de {len(data)} elements")
    return data

def main():
    candidates = [
        f"https://trackmania.io/api/player/{NICOLAS}/campaign/{CAMPAIGN_ID}",
        f"https://trackmania.io/api/player/{NICOLAS}/campaigns/{CAMPAIGN_ID}",
        f"https://trackmania.io/api/players/{NICOLAS}/campaign/{CAMPAIGN_ID}",
        f"https://trackmania.io/api/player/{NICOLAS}/records",
        f"https://trackmania.io/api/campaigns/seasonal/{CAMPAIGN_ID}/player/{NICOLAS}",
        f"https://trackmania.io/api/leaderboard/campaign/{CAMPAIGN_ID}/player/{NICOLAS}",
        f"https://trackmania.io/api/player/{NICOLAS}/campaigns/seasonal/{CAMPAIGN_ID}",
        f"https://trackmania.io/api/player/{NICOLAS}/campaigngroups/{CAMPAIGN_ID}",
    ]
    for url in candidates:
        try:
            data = get_json(url)
            if not data:
                continue
            print("  DEBUT JSON :")
            print(json.dumps(data, indent=2)[:1500])
        except Exception as e:
            print(f"  -> Erreur : {e}")
    print("FIN TESTS JOUEUR")

if __name__ == "__main__":
    main()
