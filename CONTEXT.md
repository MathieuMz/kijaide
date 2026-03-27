# Kijaide — Contexte projet

## Vision produit

Kijaide est une plateforme d'échange de services entre particuliers, ancrée localement et portée par des collectivités (communautés de communes, associations, municipalités). L'esprit est anticapitaliste : 1 service rendu = 1 service reçu, peu importe la nature du service. Pas d'argent, pas de hiérarchie entre les compétences.

Le projet est personnel, développé en side project, pas d'objectif de profit immédiat. Potentiellement open-source ou SCIC plus tard.

---

## Stack technique

### Monorepo
```
kijaide/
  apps/
    front/  → Next.js 14 (App Router, TypeScript, Tailwind) — pur front, Client Components
    api/    → Fastify (TypeScript) + Supabase
```

### API
- Fastify sur `localhost:3001`
- Supabase (PostgreSQL) comme base de données
- Pas de Server Components Next.js — tout passe par l'API Fastify
- Variables d'env dans `apps/api/.env`

### Front
- Next.js 14, App Router, TypeScript, Tailwind CSS
- Tous les composants sont des Client Components (`'use client'`)
- Appels API via `apps/front/src/lib/api.ts`
- Variables d'env dans `apps/front/.env.local`

---

## Modèle de données (Supabase)

4 tables MVP (la table `service` a été supprimée) :

```sql
organization  -- le client SaaS (comcom, asso, ville...)
  id, name, slug, primary_color,
  credit_policy (open|warn|block),  -- comportement quand solde ≤ 0
  starting_credits                  -- crédits offerts à l'inscription (défaut: 1)

resident      -- l'habitant / utilisateur final
  id, first_name, organization_id, bio, credit_balance,
  availability, address, city, lat, lng, created_at

skill         -- compétences déclarées par le résident à l'onboarding
  id, resident_id, category, subcategory, comment

exchange      -- mise en relation entre deux résidents
  id, skill_id, requester_id, provider_id,
  status (pending|confirmed|completed|cancelled),
  duration_minutes, credits_transferred, message,
  completed_at, created_at
```

### Points importants
- La table `service` n'existe plus — les échanges référencent `skill_id` directement
- La table `location` n'existe plus — `resident` a directement `city`, `address`, `lat`, `lng`, `organization_id`
- `availability` est sur `resident`
- `duration_minutes` est sur `exchange` — négocié entre les deux personnes
- `credits_transferred` = toujours `1` par échange complété (pas basé sur la durée)
- Pas d'auth pour le MVP — la page `/login` liste tous les résidents en BDD, cliquer sur l'un d'eux le définit comme utilisateur courant (stocké en localStorage via `CurrentUser` context)
- CORS API autorise GET, POST, PATCH, DELETE
- La liste des skills est triée par distance croissante si l'utilisateur a des coordonnées (`haversineKm` de `geo.ts`)

---

## Modèle d'échange

- Unité appelée "services rendus" dans l'UI (pas "crédits", pas "points")
- `credit_balance` sur `resident` = solde courant (donné - reçu + starting_credits)
- `services_given` / `services_received` calculés à la volée depuis les échanges complétés (exposés par `GET /api/residents/:id`)
- Fonction RPC Supabase `transfer_credits(from_id, to_id, amount)` — toujours appelée avec `amount = 1`
- Chaque échange complété transfère exactement **1 crédit**, quelle que soit la durée

---

## Organisation de démo

Pour le MVP, une seule organization hardcodée :
- Slug : `cc-landivisiau`
- Nom : Communauté de Communes du Pays de Landivisiau
- 8 résidents fictifs avec compétences et échanges (voir `seed.sql`)
- Variable d'env `NEXT_PUBLIC_ORGANIZATION_ID` utilisée à l'onboarding pour rattacher le nouveau résident

---

## Routes API Fastify

```
GET  /api/organizations/:id         → config org (credit_policy, starting_credits, ...)

GET  /api/skills                    → liste (filtres: category, subcategory) avec resident embedé
GET  /api/skills/:id                → détail avec resident (id, first_name, credit_balance, bio, availability, city, lat, lng)

GET  /api/residents                 → liste avec skills count + address
GET  /api/residents/:id             → profil complet + services_given + services_received
GET  /api/residents/:id/skills      → compétences du résident
GET  /api/residents/:id/exchanges   → échanges reçus et envoyés (avec skill, requester, provider)
POST /api/residents                 → créer un résident (onboarding)
PATCH /api/residents/:id            → mettre à jour (first_name, lat, lng, address, availability)
POST /api/residents/:id/skills      → bulk replace des compétences

POST /api/exchanges                 → créer un échange { skill_id, requester_id, provider_id, message }
POST /api/exchanges/:id/status      → confirmed | completed | cancelled
```

---

## Pages Next.js

```
/                     → home feed (redirect /login si non connecté)
/login                → faux login démo : liste tous les résidents de la BDD, clic = connexion instantanée + bouton "Nouvel utilisateur" → /onboarding
/onboarding           → création de compte (flow swipe complet)
/profile              → mon profil tabbé : "Mes compétences" (défaut) + "Mes infos"
/skills/[id]          → fiche compétence d'un autre résident + mise en relation
/exchanges            → mes échanges en cours (reçus / envoyés)
```

---

## Onboarding (implémenté)

Flow conversationnel en 4 phases :
1. **identity** — prénom + adresse (autocomplete via api-adresse.data.gouv.fr)
2. **swipe** — carte par catégorie, swipe droite (oui) / gauche (non)
3. **subcats** — sélection des sous-compétences (chips) pour chaque catégorie acceptée
4. **details** — commentaires facultatifs par sous-compétence + disponibilités (chips + champ libre)
5. **recap** — résumé du profil avant enregistrement

À la validation : `POST /api/residents` puis `POST /api/residents/:id/skills`, puis redirect `/`.

---

## Composants principaux

```
src/components/
  ResidentCard.tsx        → avatar + prénom + ville + disponibilités + stats services donnés/reçus
  services/
    ServiceExplorer.tsx   → filtres catégories (chips flex-wrap) + ServiceList
    CategoryGrid.tsx      → chips de filtrage (flex-wrap, pas de scroll horizontal)
    ServiceList.tsx       → liste de skills triée par distance croissante (résidents sans coords en dernier)
    ServiceCard.tsx       → carte cliquable d'une skill (utilise ResidentCard en bas)
```

## Typage

Enums TypeScript dans `apps/front/src/lib/types.ts` :
- `ExchangeStatus` — `Pending | Confirmed | Completed | Cancelled`
- `CreditPolicy` — `Open | Warn | Block`

Les tabs de `/profile` et `/exchanges` utilisent des enums locaux (`Tab`) dans leur fichier respectif.

---

## Taxonomie des compétences

11 catégories statiques (voir `apps/front/src/constants/categories.ts`) — IDs jamais modifiés :

1. Jardinage & bricolage
2. Garde & animaux
3. Courses & mobilité
4. Cuisine & repas
5. Informatique & admin
6. Soutien scolaire
7. Compagnie
8. Artisanat & création
9. Bien-être & sport
10. Musique & arts
11. Nature & environnement

---

## Révélation progressive de l'identité

Pour éviter les discriminations :
- Niveau 1 public : prénom + commune + badge vérifié + nb services rendus (pas de photo, pas de nom de famille)
- Niveau 2 après premier contact : bio visible
- Niveau 3 après confirmation d'échange : coordonnées directes

Pas d'étoiles ni de notes — uniquement le compteur "services rendus".

---

## Ce qui reste à faire (par priorité)

1. **Ajouter `credit_policy` et `starting_credits` en base** — migration SQL à lancer dans Supabase :
   ```sql
   ALTER TABLE organization ADD COLUMN credit_policy text NOT NULL DEFAULT 'warn';
   ALTER TABLE organization ADD COLUMN starting_credits int NOT NULL DEFAULT 1;
   ```
2. **Dashboard comcom** — métriques clés pour l'agent territorial
3. **Auth** — Supabase Auth, à ajouter en dernier
4. **Multi-tenant** — routing par `[slug]` d'organization (actuellement hardcodé sur `cc-landivisiau`)
5. **Marque blanche** — logo + couleur primaire par organization

---

## Territoire pilote visé

Communauté de Communes Xaintrie Val'Dordogne (Argentat-sur-Dordogne, Corrèze)
- 11 298 habitants, 30 communes, 652 km²
- Problématiques : vieillissement, isolement, rural
- Fibre déployée sur tout le territoire
- Contact local existant

---

## Nom du projet

En cours de décision entre **Kijaide** et **Kikimaide**.
- Kijaide = "qui j'aide" → posture de donneur, 7 lettres
- Kikimaide = "qui me aide" → plus familier, déjà pris (kimaide.fr existe)
- Domaine à réserver dès que nom validé
- Marque à déposer à l'INPI (classe 42 + 45)
