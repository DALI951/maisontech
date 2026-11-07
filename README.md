# MaisonTech

Boutique en ligne d'électroménager — démonstration complète (catalogue, panier, commande, comptes clients, administration), en français, prix en TND.

> **Démo.** Les commandes et les paiements sont **simulés**. Aucun paiement réel n'est traité, aucune donnée réelle n'est collectée. Les 72 produits, les marques et les avis sont fictifs.

**En ligne :** https://modali.powerpme.com/maisontech
**Code :** https://github.com/DALI951/maisontech

---

## Stack

| Couche | Choix |
|---|---|
| Framework | Next.js 16.4.3 (App Router) + React 19.3.1 |
| Langue du code | TypeScript 5.9 (strict) |
| Styles | Tailwind CSS 4.3.3 |
| Données | fichier JSON versionné (`.data/maisontech-db.json`) via `src/lib/db.ts` |
| Auth | `scrypt` + sessions en base + cookie `HttpOnly` `mt_session` |
| Tests | `node --test` (parcours HTTP) + Playwright 1.63 (E2E navigateur) |
| Hébergement | VPS Ubuntu + Apache reverse proxy → `next start` sur `127.0.0.1:3187` |

## Démarrage local

```bash
npm install
npm run dev          # http://localhost:3000
```

Le fichier de base est créé automatiquement au premier chargement depuis `src/data/seed.ts`. Pour repartir de zéro : supprimer `.data/maisontech-db.json` (ou utiliser le bouton « Réinitialiser la démo » dans l'admin).

### Comptes de démonstration

| Rôle | E-mail | Mot de passe |
|---|---|---|
| Client | `client@maisontech.example` | `Client!2345` |
| Administrateur | `admin@maisontech.example` | `Admin!2345` |

L'administration est sur `/admin` — l'accès est vérifié **côté serveur** (`requireAdmin()`), pas seulement dans l'interface.

## Scripts

| Commande | Effet |
|---|---|
| `npm run dev` | serveur de développement sur `:3000` |
| `npm run build` / `npm run start` | build de production / serveur de production sur `:3000` |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` | ESLint 9 (config plate) |
| `npm test` | suite de parcours HTTP (`tests/journey.test.mjs`) |
| `npm run test:e2e` | Playwright (démarre son propre serveur sur `:3021`, base jetable) |
| `npm run battery` | typecheck + lint + build + tests |

Smoke tests contre un déploiement réel :

```bash
PLAYWRIGHT_LIVE_URL=https://modali.powerpme.com/maisontech npx playwright test --config=playwright.live.config.ts
```

## Contenu du site

- **72 produits** dans **12 catégories** (réfrigération, lavage, cuisson, petit électroménager, climatisation, TV, café…), **10 marques** fictives, **180 avis**.
- Liste : filtres (catégorie, marque, prix, disponibilité, classe énergétique), tri, pagination.
- Fiche produit : galerie, caractéristiques groupées, avis, produits liés, ajout au panier / favoris / comparaison.
- Panier : persistant (`localStorage`), codes de réduction, seuil de livraison offerte.
- Commande : formulaire validé en français, récapitulatif, **commande simulée** avec référence `MT-…`, page de confirmation.
- Comptes : inscription, connexion, tableau de bord, commandes, adresses, favoris.
- Admin : tableau de bord (CA, commandes, panier moyen), produits (création/édition/stock), catégories, commandes (changement de statut), codes promo, clients, paramètres, réinitialisation de la démo.
- Pages éditoriales : à propos, livraison, retours, FAQ, contact, CGV, mentions légales, confidentialité, 404 dédiée (site + admin).
- Recherche insensible aux accents, sitemap et `robots.txt`.

## Structure

```
src/
  app/
    (site)/        vitrine (accueil, produits, catégories, panier, commande, compte, pages légales)
    admin/         back-office protégé
    api/           routes REST (produits, panier, recherche, auth, commandes, admin…)
  components/      UI par domaine (product, cart, checkout, account, admin, layout…)
  data/            catalogue, catégories, marques, contenus éditoriaux, seed
  lib/             db.ts, password.ts, auth.ts, base-path.ts, validation.ts, format.ts
  store/           état client (panier, favoris, comparaison, historique)
tests/
  journey.test.mjs parcours HTTP (16 tests)
  e2e/             Playwright local (19 tests)
  live/            Playwright contre le déploiement (3 tests)
```

## Modèle de données

Une seule « base » JSON (`src/lib/types.ts`) : `products`, `categories`, `brands`, `orders`, `users`, `sessions`, `discounts`, `reviews`, `settings`, `subscribers`, `messages`. `src/lib/db.ts` sérialise les écritures (file d'attente en mémoire) et réécrit le fichier de façon atomique.

Limites assumées, documentées pour la démo : **un seul processus** (pas de verrou multi-instance), système de fichiers inscriptible obligatoire, et aucune donnée réelle.

## Déploiement (VPS + Apache)

L'application tourne **sur le serveur**, servie sous un sous-chemin par un reverse proxy Apache.

- Code : `/var/www/modali/public_html/uploads/maisontech` (accès web refusé par un `.htaccess` `Require all denied`)
- Processus : `bash start.sh` → boucle `next start -p 3187 -H 127.0.0.1` (redémarrage automatique)
- Base : `.data/maisontech-db.json` (hors dépôt git, `DEMO_DB_PATH` pour la déplacer)
- Proxy : bloc « MaisonTech (managed) » dans `/var/www/modali/public_html/.htaccess`

Variables utilisées au build (le `basePath` est figé dans le build) :

```bash
NEXT_BASE_PATH=/maisontech \
NEXT_PUBLIC_BASE_PATH=/maisontech \
NEXT_PUBLIC_SITE_URL=https://modali.powerpme.com/maisontech \
NEXT_ACTION_ORIGINS=modali.powerpme.com \
NEXT_TELEMETRY_DISABLED=1 npm run build
```

Mise à jour du site :

```bash
# 1. archive du code (sans node_modules / .next / .git)
tar -czf mt-src.tar.gz --exclude=node_modules --exclude=.next --exclude=.git --exclude=.data .
# 2. envoi par SFTP vers /public_html/mt-src.tar.gz, puis sur le serveur :
pkill -f 'next-serv[e]r'
tar -xzf /var/www/modali/public_html/mt-src.tar.gz -C /var/www/modali/public_html/uploads/maisontech
cd /var/www/modali/public_html/uploads/maisontech
export HOME=/tmp npm_config_cache=/tmp/mt-npm-cache PATH=/usr/local/bin:/usr/bin:/bin
npm ci --no-audit --no-fund
# (build avec les variables ci-dessus)
setsid nohup bash start.sh >/dev/null 2>&1 &
```

Le compte `www-data` doit exporter `HOME=/tmp` et `npm_config_cache`, sinon `npm` échoue sur `/var/www/.npm`.

Points d'attention appris en production :

- Servir sous un sous-chemin impose `basePath` **et** `assetPrefix` ; les `fetch("/api/…")` codés à la main passent par `api()` (`src/lib/base-path.ts`).
- `trailingSlash` doit rester désactivé : couplé au `mod_dir` d'Apache il crée une boucle de redirection. Le bloc proxy mappe donc `^maisontech/?$` vers `/maisontech` **sans** slash final.
- Le proxy change le `Host` vu par Next ; les Server Actions exigent donc `NEXT_ACTION_ORIGINS`.
- Il n'y a ni `root` ni `cron` sur ce compte : le processus survit à la session mais **pas** à un redémarrage du VPS (relancer `start.sh`).

`Dockerfile` et `render.yaml` sont conservés comme alternatives (PaaS) mais ne sont pas utilisés.

## Licence / usage

Projet de démonstration personnel. Marques, produits et avis sont inventés ; les visuels sont des illustrations vectorielles locales (aucune image distante).
