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
    web/    → Next.js 14 (App Router, TypeScript, Tailwind) — pur front, Client Components
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
- Appels API via `apps/web/src/lib/api.ts`
- Variables d'env dans `apps/web/.env.local`

---

## Modèle de données (Supabase)

5 tables MVP :

```sql
organization  -- le client SaaS (comcom, asso, ville...)
  id, name, slug, primary_color

location      -- commune ou quartier, appartient à une organization
  id, name, city, zip_code, address, country, organization_id, lat, lng

resident      -- l'habitant / utilisateur final
  id, first_name, location_id, bio, credit_balance, availability, created_at

skill         -- compétences déclarées par le résident à l'onboarding
  id, resident_id, category, subcategory, comment

service       -- offre ou demande de service
  id, resident_id, title, description, category, subcategory,
  type (offer|request), status (active|paused|archived),
  lat, lng, created_at

exchange      -- mise en relation entre deux résidents
  id, service_id, requester_id, provider_id,
  status (pending|confirmed|completed|cancelled),
  duration_minutes, credits_transferred, message,
  completed_at, created_at
```

### Points importants
- `availability` est sur `resident`, pas sur `service`
- `duration_minutes` est sur `exchange`, pas sur `service` — c'est négocié entre les deux personnes
- `credits_transferred` vaut toujours `1` (modèle 1 service = 1 service rendu)
- Pas d'auth pour le MVP — `DEMO_RESIDENT_ID` hardcodé dans `apps/web/src/constants/demo.ts`

---

## Modèle d'échange

**1 service rendu = 1 service reçu**, quelle que soit la durée ou la nature.

- Unité appelée "services rendus" dans l'UI (pas "crédits", pas "points")
- `credit_balance` sur `resident` = nombre de services rendus
- La colonne existe en base pour pouvoir changer de modèle plus tard
- Fonction RPC Supabase `transfer_credits(from_id, to_id, amount)` — toujours appelée avec `amount = 1`

---

## Organisation de démo

Pour le MVP, une seule organization hardcodée :
- Slug : `cc-landivisiau`
- Nom : Communauté de Communes du Pays de Landivisiau
- 4 locations : Landivisiau, Lampaul-Guimiliau, Plougar, Saint-Thégonnec
- 8 résidents fictifs avec services et échanges (voir `seed.sql`)
- Résident démo : `DEMO_RESIDENT_ID = 'c1000000-0000-0000-0000-000000000001'` (Jean-Pierre)

---

## Routes API Fastify

```
GET  /api/services                    → liste (filtres: category, subcategory, type)
GET  /api/services/:id                → détail avec resident + location
POST /api/services                    → créer un service
PATCH /api/services/:id/status        → changer le statut

GET  /api/residents/:id               → profil avec location
GET  /api/residents/:id/skills        → compétences du résident
GET  /api/residents/:id/exchanges     → échanges reçus et envoyés

POST /api/exchanges                   → créer un échange (mise en relation)
PATCH /api/exchanges/:id/status       → confirmed | completed | cancelled
```

---

## Pages Next.js

```
/                         → exploration des services (ServiceExplorer)
/services/new             → création d'un service (NewServiceForm)
/services/[id]            → fiche service + mise en relation
/exchanges                → mes échanges en cours (reçus / envoyés)
```

---

## Composants principaux

```
src/components/services/
  ServiceExplorer.tsx     → mode toggle + CategoryGrid + subcategories + ServiceList
  CategoryGrid.tsx        → grille 4 colonnes des catégories
  ServiceList.tsx         → liste avec skeleton loading
  ServiceCard.tsx         → carte cliquable avec meta (location, durée, services rendus)
  NewServiceForm.tsx      → 3 steps : skill → details → preview
```

---

## Taxonomie des compétences (onboarding)

9 familles, utilisées dans l'onboarding swipe :

1. Jardinage & nature
2. Bricolage & réparations
3. Cuisine & préparation (inclut lacto-fermentation)
4. Savoirs traditionnels & artisanat
5. Compétences artistiques (musique, arts visuels, dessin, peinture)
6. Compétences sportives & bien-être
7. Compétences numériques
8. Compétences intellectuelles & admin
9. Mobilité & logistique

Fichier : `apps/web/src/constants/categories.ts`

---

## Onboarding utilisateur (à implémenter)

Flow conversationnel style Tinder :
1. Carte par famille → swipe droite (oui) / swipe gauche (non)
2. Si oui → sélection des sous-compétences (chips)
3. Fin → récap du profil + call to action

Prototype réalisé, pas encore intégré dans le front.

Questions de vie → familles détectées :
- "Tu as un jardin ?" → Jardinage & nature
- "Tu bricoles ?" → Bricolage & réparations
- "Tu cuisines avec plaisir ?" → Cuisine & préparation
- "Tu joues d'un instrument ?" → Musique
- "Tu crées des choses artistiques ?" → Arts & artisanat
- "Tu as une voiture ?" → Mobilité & logistique
- "Tu es à l'aise avec le numérique ?" → Compétences numériques
- "Tu peux aider quelqu'un à apprendre ?" → Enseignement & admin
- "Tu es à l'aise avec les enfants ?" → Garde & accompagnement
- "Tu pratiques un sport ?" → Sport & bien-être

---

## Révélation progressive de l'identité

Pour éviter les discriminations :
- Niveau 1 public : prénom + commune + badge vérifié + nb services rendus (pas de photo, pas de nom de famille)
- Niveau 2 après premier contact : bio visible
- Niveau 3 après confirmation d'échange : coordonnées directes

Pas d'étoiles ni de notes — uniquement le compteur "services rendus".

---

## Ce qui reste à faire (par priorité)

1. **Intégrer l'onboarding swipe** dans le front (`/onboarding`)
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