# Kijaide — Contexte projet

## Vision produit

Kijaide est une plateforme d'échange de services entre particuliers, ancrée localement et portée par des collectivités (communautés de communes, associations, municipalités). L'esprit est anticapitaliste : 1 service rendu = 1 service reçu, peu importe la nature du service. Pas d'argent, pas de hiérarchie entre les compétences.

Le cœur du produit est le **partage de savoirs et le lien social** — pas une plateforme d'utilité transactionnelle. Les catégories utilitaires (Courses & mobilité, Garde & animaux) restent présentes mais ne sont pas mises en avant.

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

```sql
organization  -- le client SaaS (comcom, asso, ville...)
  id, name, slug, primary_color,
  credit_policy (open|warn|block),  -- comportement quand solde ≤ 0
  starting_credits                  -- crédits offerts à l'inscription (défaut: 1)

resident      -- l'habitant / utilisateur final
  id, first_name, email, organization_id, bio, credit_balance,
  availability, address, city, lat, lng,
  email_digest (boolean, default true),  -- opt-in mail hebdomadaire
  created_at

skill         -- compétences déclarées par le résident à l'onboarding
  id, resident_id, category, subcategory, comment
  -- subcategory NOT NULL (on sait précisément ce qu'on propose)
  -- subcategory = 'autre' → texte libre, comment stocke "titre\ndescription" (split \n)
  -- pour les autres subcategories, comment = détail facultatif

interest      -- ce que le résident aimerait apprendre / recevoir
  id, resident_id, category, subcategory, created_at
  -- subcategory NULLABLE (on peut être intéressé par toute une catégorie)
  -- pas de subcategory "Autre" sur interest (pas de sens)

exchange      -- mise en relation entre deux résidents
  id, skill_id, requester_id, provider_id,
  status (pending|confirmed|completed|cancelled),
  duration_minutes, credits_transferred, message,
  completed_at, created_at
  -- message = message d'introduction one-shot du requester
  -- validation par le receveur → déclenche transfer_credits(requester_id, provider_id, 1)
  -- rappel mail J+2 si pas de validation
  -- validation automatique J+14 si toujours pas de réponse

appreciation  -- adjectifs donnés après un échange complété
  id, exchange_id, giver_id, receiver_id, adjective, created_at
  -- adjective = valeur parmi une liste prédéfinie (enum TypeScript Adjective)
  -- un donneur peut laisser plusieurs adjectifs différents par échange
  -- UNIQUE (exchange_id, giver_id, adjective) — pas de doublon exact
  -- affiché sur le profil uniquement si 3+ personnes ont donné le même adjectif
  -- seuil configurable dans apps/api/src/lib/constants.ts (APPRECIATION_DISPLAY_THRESHOLD)
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

### Flow de mise en relation
1. Le requester envoie un message d'introduction one-shot via `POST /api/exchanges`
2. Le provider reçoit une notification mail avec le message + prénom + ville du requester
3. Le provider accepte (`confirmed`) → les deux reçoivent les coordonnées de l'autre par mail
4. Ils s'organisent en dehors de la plateforme
5. Le receveur du service valide (`completed`) → déclenche `transfer_credits`
6. Rappel mail au receveur à J+2 si pas de validation
7. Validation automatique à J+14 si toujours pas de réponse

---

## Appréciation post-échange

Après validation d'un échange, le requester peut tagger le provider avec des adjectifs prédéfinis.

- Liste de 10 adjectifs dans `apps/front/src/constants/adjectives.ts` (type `AdjectiveId`) : ponctuel, pedagogue, genereux, creatif, patient, fiable, chaleureux, bienveillant, enthousiaste, curieux
- Sélection multiple — soumis en une seule requête `POST /exchanges/:id/appreciation { adjectives: string[] }`
- `giver_id` et `receiver_id` sont déduits côté API depuis la table `exchange` (requester → giver, provider → receiver)
- Combiné avec la validation : le requester marque l'échange comme "réalisé" et choisit les adjectifs dans le même formulaire
- Appréciation rétroactive possible depuis `/exchanges` pour les échanges déjà complétés
- Affiché sur le profil public uniquement si 3+ personnes ont donné le même adjectif (seuil `APPRECIATION_DISPLAY_THRESHOLD` dans `apps/api/src/lib/constants.ts`)
- Laisser une appréciation est facultatif
- Les chips d'adjectifs s'affichent sur la fiche compétence (`/skills/[id]`) dans le bloc "Proposé par"

---

## Mail hebdomadaire (digest)

- Opt-in explicite à l'onboarding (checkbox cochée par défaut, visible)
- Stocké dans `email_digest` sur `resident`
- Contenu : nouvelles compétences à proximité, ciblées par les intérêts déclarés du résident
- Si le résident a des intérêts sur une catégorie entière (subcategory NULL), il reçoit toutes les nouvelles compétences de cette catégorie
- À implémenter : job hebdomadaire (cron), template mail, logique de matching intérêts × nouvelles skills × proximité

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
GET  /api/organizations/:id              → config org (credit_policy, starting_credits, ...)

GET  /api/skills                         → liste (filtres: category, subcategory) avec resident embedé
GET  /api/skills?match_resident_id=:id   → skills qui matchent les intérêts d'un résident
GET  /api/skills/:id                     → détail avec resident embedé (id, first_name, credit_balance, bio, availability, city, lat, lng) + appreciations du resident (seuil APPRECIATION_DISPLAY_THRESHOLD)

GET  /api/residents                      → liste avec skills count + address
GET  /api/residents/:id                  → profil complet + services_given + services_received + appreciations (seuil APPRECIATION_DISPLAY_THRESHOLD)
GET  /api/residents/:id/skills           → compétences du résident
GET  /api/residents/:id/interests        → intérêts déclarés du résident
GET  /api/residents/:id/exchanges        → échanges reçus et envoyés (avec skill, requester, provider)
POST /api/residents                      → créer un résident (onboarding) { first_name, organization_id, email, email_digest, lat, lng, address, city, availability }
PATCH /api/residents/:id                 → mettre à jour (first_name, lat, lng, address, availability)
POST /api/residents/:id/skills           → bulk replace des compétences
POST /api/residents/:id/interests        → bulk replace des intérêts

POST /api/exchanges                      → créer un échange { skill_id, requester_id, provider_id, message }
POST /api/exchanges/:id/status           → confirmed | completed | cancelled
POST /api/exchanges/:id/appreciation     → { adjectives: string[] } — après completed uniquement, giver/receiver déduits de l'exchange
```

---

## Pages Next.js

```
/                     → home feed (redirect /login si non connecté)
/login                → faux login démo : liste tous les résidents de la BDD, clic = connexion instantanée + bouton "Nouvel utilisateur" → /onboarding
/onboarding           → création de compte (flow swipe complet)
/profile              → mon profil tabbé : "Mes compétences" (défaut) + "Mes intérêts" + "Mes infos" — onglet initial via `?tab=` (competences | interests | infos)
/skills/[id]          → fiche compétence d'un autre résident + mise en relation + appréciations du provider
/exchanges            → mes échanges en cours (reçus / envoyés)
```

---

## Home (/)

Layout responsive (desktop-first) :
- Header sticky, `max-w-6xl`, nom de l'org en badge
- Bandeau vert : compteur "X voisins proposent leur aide" + 2 boutons (sm+) : "Mes compétences" → `/profile?tab=competences`, "Mes intérêts" → `/profile?tab=interests`
- Si l'user a des intérêts déclarés et des matches → section "Voisins qui peuvent vous apprendre" en premier, cards highlightées (bordure verte + badge "✦ Correspond à tes intérêts"), exclues du catalogue principal
- Catalogue complet de skills filtré en mémoire (pas de re-fetch API), grille 2 colonnes sur md+
- Filtres catégories : toujours visibles sur desktop (md+), derrière bouton "Filtrer" sur mobile

### Performance
- 3 appels parallèles au chargement : `fetchResidents`, `fetchSkills`, `fetchSkills({ match_resident_id })`
- ServiceExplorer filtre en mémoire depuis `initialSkills` — aucun appel API sur changement de filtre
- `GET /api/skills/:id` embed les appréciations directement → une seule requête sur la fiche compétence

---

## Onboarding (implémenté)

Flow conversationnel en 6 phases :
1. **identity** — prénom + adresse (autocomplete via api-adresse.data.gouv.fr) + email
2. **swipe** — carte par catégorie, swipe droite (oui) / gauche (non) + boutons Oui/Non
3. **subcats** — sélection des sous-compétences (chips) pour chaque catégorie acceptée
   - Chip "Autre" séparé visuellement (ligne dédiée) avec champ titre obligatoire + description optionnelle
4. **details** — commentaires facultatifs par sous-compétence (hors "Autre" déjà traité) + disponibilités (chips + champ libre)
5. **interests** — "Qu'est-ce que tu aimerais apprendre ?" — chips catégories + affinement subcategory optionnel (sans "Autre")
6. **recap** — résumé du profil + checkbox opt-in mail hebdomadaire (cochée par défaut)

À la validation : `POST /api/residents` → `POST /api/residents/:id/skills` → `POST /api/residents/:id/interests` → redirect `/`.

---

## Composants principaux

```
src/components/
  ResidentCard.tsx        → avatar + prénom + ville + disponibilités + stats services donnés/reçus
  services/
    ServiceExplorer.tsx   → filtres toujours visibles sur md+, bouton "Filtrer" sur mobile + ServiceList
    CategoryGrid.tsx      → chips de filtrage (flex-wrap)
    ServiceList.tsx       → grille 2 colonnes (md+), triée par distance croissante
    ServiceCard.tsx       → carte cliquable d'une skill — prop highlighted pour cards matchant les intérêts
                            subcategory "autre" → affiche comment.split('\n')[0] comme titre
```

## Typage

Enums TypeScript dans `apps/front/src/lib/types.ts` :
- `ExchangeStatus` — `Pending | Confirmed | Completed | Cancelled`
- `CreditPolicy` — `Open | Warn | Block`

Constantes dans `apps/front/src/constants/adjectives.ts` :
- `ADJECTIVES` — tableau `{ id, label }[]` de 10 adjectifs
- `AdjectiveId` — union type des 10 ids

Interfaces : `Organization`, `Resident` (avec `appreciations?: Adjective[]`), `Skill`, `Exchange`, `Interest`, `Appreciation`

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

Chaque catégorie dispose d'une subcategory **"Autre"** (`AUTRE_SUBCAT_ID = 'autre'`) :
- Affiché sur une ligne séparée dans le sélecteur de subcategories
- Champ titre obligatoire + description optionnelle
- Stocké en base : `subcategory = 'autre'`, `comment = "titre\ndescription"` (split sur `\n`)
- Dans ServiceCard : titre = première ligne, description = deuxième ligne
- N'existe pas sur `interest`

---

## Révélation progressive de l'identité

Pour éviter les discriminations :
- Niveau 1 public : prénom + commune + badge vérifié + nb services rendus + adjectifs (si seuil 3 atteint)
- Niveau 2 après premier contact : bio visible
- Niveau 3 après confirmation d'échange : coordonnées directes (email ou téléphone)

Pas d'étoiles ni de notes — uniquement le compteur "services rendus" et les adjectifs.

---

## Ce qui reste à faire (par priorité)

1. **Flow exchange** — notification mail provider, révélation coordonnées après confirmation, rappel J+2, validation auto J+14
2. **Mail hebdomadaire** — cron job, template, logique matching intérêts × skills × proximité
3. **Dashboard comcom** — métriques clés pour l'agent territorial
4. **Auth** — Supabase Auth, à ajouter en dernier
5. **Multi-tenant** — routing par `[slug]` d'organization
6. **Marque blanche** — logo + couleur primaire par organization

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
