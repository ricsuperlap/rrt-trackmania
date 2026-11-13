# RRT - Classement Trackmania
Rocket Racing Team — ricsuperlap1, m0ugg, Esyole, Deuxfrai

## Déploiement Vercel
1. Glisser ce dossier sur vercel.com/new OU `vercel` dans ce dossier
2. Framework: Other / Static — aucun build nécessaire
3. Le site est 100% statique, données sauvegardées dans le navigateur (localStorage)

## Utilisation
- Onglet Classement : classement général cumulé sur les 10 circuits
- Onglet Circuits : saisir / importer les temps par circuit
- Import CSV : colonnes `circuit,pilote,temps` — temps au format m:ss.mmm ou ss.mmm
- Exemple : `01,ricsuperlap1,0:42.123`
- Export CSV / Copier le classement pour Discord
- Bouton Reset pour repartir à zéro

## Barème par circuit (20 joueurs)
32-26-22-19-17-15-13-11-9-7-5-4-3-2-1-0
1er = 32 pts, 2e = 26, 3e = 22, 4e = 19, 5e = 17, 6e = 15, 7e = 13, 8e = 11, 9e = 9, 10e = 7, 11e = 5, 12e = 4, 13e = 3, 14e = 2, 15e = 1, 16e-20e = 0
En cas d'égalité de temps : mêmes points, ex-aequo.
