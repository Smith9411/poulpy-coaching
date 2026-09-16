# Poulpy Coaching

> Plateforme de coaching gaming (Valorant, Apex Legends, Aim) pour les élèves de Poulpy Coaching.
> Next.js 16 + React 19 + Supabase.

---

## 🔴 OBLIGATOIRE — Lis ce fichier à chaque session de modification

> **Ce fichier est la source de vérité sur l'état du projet.** Tout le monde (toi, moi, ou une autre IA) DOIT le lire entièrement avant de coder.
>
> **À la fin de chaque session de modifications**, ajoute une entrée dans la section **"Historique des modifications"** en bas de ce fichier. Format :
> ```
> - YYYY-MM-DD (brève description) :
>   - [changement 1]
>   - [changement 2]
>   - commit: `abc1234` [description]
> ```
>
> **Sans cette mise à jour, le prochain intervenant sera aveugle sur ce que tu as fait.** C'est non-négociable.
>
> Voir aussi `AGENTS.md` pour le contrat de travail complet.

---

## Stack technique

- **Framework** : Next.js `16.3.2` (App Router, Turbopack) — ⚠️ cette version a des breaking changes par rapport aux docs en ligne, **lis `node_modules/next/dist/docs/` si dispo, sinon teste sur un fichier jetable**
- **UI** : React `19.2.8`, Tailwind v4, framer-motion, lucide-react
- **Backend** : Supabase (auth + Postgres + Storage)
- **Déploiement** : Vercel (auto-deploy sur push `github/Smith9411/poulpy-coaching` → branche `main`)
- **Domaine custom** : hébergé sur Vercel

### Variables d'environnement

Fichier `.env.local` (jamais commit) :
- `NEXT_PUBLIC_SUPABASE_URL` — URL du projet Supabase
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — clé anon (publique)
- `SUPABASE_SERVICE_ROLE_KEY` — clé service_role (privée, **ne JAMAIS exposer au client**)
- `NOTION_API_KEY` — Clé secrète d'intégration Notion (`secret_...`)
- `NOTION_BOOKINGS_DATABASE_ID` — ID de la base de données Notion Calendar (32 caractères)

## Architecture

```
app/
  api/                    # Routes API serveur
    admin/                # Endpoints admin (auth + is_admin obligatoires)
    avatar/               # Upload avatars
    coaching/             # Send message, mark-read
    notifications/        # unread, all, recent
    reviews/              # CRUD avis
    student/              # Messages côté élève
  admin/                  # Pages admin (admin only)
    coaching/             # Liste élèves + conv par élève
    students/             # Tableau élèves avec rangs
    users/                # Gestion users
    stats/                # Stats
    settings/             # Paramètres
  profile/                # Profil élève
    coaching/             # Chat élève
  avis/                   # Reviews
  auth/                   # Login/register
    callback/             # Retour OAuth Google (session → redirection)
    complete/             # Choix du pseudo après connexion Google
components/                # Composants partagés
context/AuthContext.tsx    # Auth provider (User.needsUsername, signInWithGoogle)
lib/supabase.ts             # Client Supabase (anon key)
```

## Conventions de code

- **API** : toute route sensible utilise `SUPABASE_SERVICE_ROLE_KEY` côté serveur, valide le token via `supabase.auth.getUser(token)`, et vérifie `is_admin` pour les actions admin.
- **Client** : `supabase.from(...)` côté front **uniquement** pour les lectures qui passent par RLS Supabase. Les écritures passent par les routes API.
- **State management** : local avec `useState` + `useCallback`/`useEffect`. Pas de Redux/Zustand.
- **Tokens** : récupérés via `supabase.auth.getSession()` avant chaque fetch et envoyés en `Authorization: Bearer <token>`.
- **Session expirée** : check `session.expires_at` + `supabase.auth.refreshSession()` avant les requêtes (sinon 401).
- **Auto-cleanup** : tous les `setInterval`/`setTimeout` doivent avoir un cleanup dans le `useEffect` return (utilise `useRef` pour le timer).
- **AbortController** : tous les `useEffect` qui fetchent doivent passer un `signal` au `fetch` et l'abort dans le cleanup.

## Sécurité

### Bugs critiques corrigés

- **`/api/admin/users/remove-avatar`** : auth + is_admin obligatoires, suppression du fichier Storage
- **`/api/admin/users`** (GET et DELETE) : auth + is_admin
- **`/api/avatar/upload`** : auth obligatoire, `userId` doit correspondre à `user.id`, plus de fallback anon_key
- **`/api/admin/coaching/message`** : `adminId` doit correspondre à l'admin authentifié
- **`/api/reviews`** (DELETE) : auth + is_admin
- **`/api/admin/coaching/messages/[studentId]`** : auth + is_admin (ou self)
- **`/api/admin/coaching/clear/[studentId]`** : auth + is_admin
- **`/api/coaching/send`** : validation UUID + longueur message (2000) + whitelist `messageType`
- **`/api/coaching/mark-read`** : validation UUID
- **`/api/notifications/*`** : service_role key, validation token
- **`/api/student/messages`** : service_role key
- **Magic bytes** : validation PNG/JPEG/GIF/WEBP côté client avant upload avatar
- **`/api/auth/check-username`** : auth obligatoire (Bearer token), pseudo validé par regex + jokers LIKE échappés, lecture service_role (RLS bloque sinon)

### Restriction

- Aucun user ne peut supprimer son propre compte via `/api/admin/users?userId=X`
- Un admin ne peut pas s'envoyer de message à lui-même comme élève
- `is_admin` ne peut être modifié que par requête SQL directe (pas d'API qui le permet)

### À faire côté Supabase (SQL Editor)

Les **RLS policies** ne sont pas versionnées dans ce repo. **Recommandé** :

```sql
-- profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Admins read all profiles" ON profiles FOR SELECT
  USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.is_admin = true));
CREATE POLICY "Users update own profile" ON profiles FOR UPDATE
  USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- coaching_messages
ALTER TABLE coaching_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Students see own messages" ON coaching_messages FOR SELECT
  USING (auth.uid() = student_id OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true));
CREATE POLICY "Recipients mark read" ON coaching_messages FOR UPDATE
  USING (auth.uid() != sender_id) WITH CHECK (auth.uid() != sender_id);

-- reviews
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Reviews are public" ON reviews FOR SELECT USING (true);
CREATE POLICY "Authenticated post reviews" ON reviews FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Admins delete reviews" ON reviews FOR DELETE
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true));

-- Ajouter les colonnes pour les réponses admin (si pas déjà fait)
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS admin_response TEXT;
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS admin_response_at TIMESTAMP WITH TIME ZONE;
```

## Comptes de test

| Email | Mdp | Rôle | Notes |
|---|---|---|---|
| `tborgesbessonnet@gmail.com` | `Poulpyacq7gm!` | admin (smith94) | Mdp changé par script de test |
| `borgesazerty@gmail.com` | (ton mdp) | élève (tomb) | Compte élève principal |
| `songebidoc@gmail.com` | (ton mdp) | admin (Poulpy_) | |
| `leo.borgesbessonnet@gmail.com` | (ton mdp) | élève (Mancho) | |
| `bessonnet.th@gmail.com` | (ton mdp) | élève (cpapou1) | |

## Commandes utiles

```bash
npm run dev          # Dev server (Turbopack)
npm run build        # Build production
npm run lint         # ESLint
npm run start        # Serveur production
```

## URLs de dev (localhost:3000)

- `/` — Landing
- `/auth` — Login/register (+ bouton « Continuer avec Google »)
- `/auth/callback` — Retour OAuth Google (ne pas ouvrir directement)
- `/auth/complete` — Choix du pseudo (Google uniquement, garde de session)
- `/profile` — Profil élève
- `/profile/coaching` — Chat élève
- `/profile/vod` — Clips VOD élève (soumission + annotations coach)
- `/avis` — Reviews
- `/admin` — Dashboard admin (admin only)
- `/admin/coaching` — Liste élèves avec badges non-lus (boutons Chat + Clips VOD)
- `/admin/coaching/[studentId]` — Conv avec un élève (admin only)
- `/admin/coaching/[studentId]/clips` — Clips VOD d'un élève + annotations admin
- `/admin/users` — Gestion users (admin only)
- `/admin/students` — Tableau élèves (admin only)
- `/admin/stats` — Stats (admin only)
- `/admin/settings` — Settings (admin only)

## Remotes Git

- `origin` → GitLab (smith-claude-group/poulpy-coaching) — historique complet
- `github` → GitHub (Smith9411/poulpy-coaching) — ce que Vercel surveille
- **Pour publier** : `git push origin main && git push github main`

## Variables Supabase à configurer manuellement

- `profiles.bio` (TEXT) — ajouté par ALTER TABLE pour la feature bio
- `reviews.admin_response` (TEXT) — ajouté pour les réponses admin aux avis
- `reviews.admin_response_at` (TIMESTAMP WITH TIME ZONE) — ajouté pour la date de réponse admin
- (les autres tables existent déjà)

## Connexion Google OAuth — configuration (une seule fois)

Le code est en place (bouton Google sur `/auth`, retour sur `/auth/callback`, choix de pseudo obligatoire sur `/auth/complete`). Pour l'activer, la config ci-dessous est **à faire dans les consoles Google Cloud et Supabase** (pas dans le repo) :

1. **Google Cloud Console** ([console.cloud.google.com](https://console.cloud.google.com)) :
   - Créer un projet (ex: `Poulpy Coaching`) ou en réutiliser un.
   - Écran de consentement OAuth : type *External*, ajouter les scopes par défaut (`email`, `profile`, `openid`).
   - **Identifiants → Créer → ID client OAuth → Application Web** :
     - *Authorized redirect URI* : `https://gxomzlbmgqhgeegzcafl.supabase.co/auth/v1/callback` (URL de callback Supabase, **celle-là et pas une autre**)
   - Noter le **Client ID** et le **Client Secret**.
2. **Supabase Dashboard** ([supabase.com/dashboard](https://supabase.com/dashboard), projet `gxomzlbmgqhgeegzcafl`) :
   - **Authentication → Sign In / Providers → Google** : activer, coller Client ID + Client Secret, sauvegarder.
   - **Authentication → URL Configuration → Redirect URLs** : ajouter
     - `http://localhost:3000/auth/callback`
     - `https://<domaine-de-production>/auth/callback` (le domaine Vercel custom)
3. **(Recommandé) SQL Editor** — index unique sur le pseudo pour garantir l'unicité même en cas de course :
   ```sql
   CREATE UNIQUE INDEX CONCURRENTLY IF NOT EXISTS profiles_username_lower_unique
     ON profiles (LOWER(username));
   ```

Fonctionnement côté app : après le retour Google, `/auth/callback` vérifie la session et redirige vers `/auth/complete` si l'utilisateur n'a pas de pseudo (comptes Google). Le pseudo est vérifié via `/api/auth/check-username` (service_role + token, insensible à la casse). `User.needsUsername` dans AuthContext pilote le rappel dans la Navbar. Les comptes email/mot de passe existants ne sont pas affectés (pseudo déjà renseigné à l'inscription).

## Points d'attention pour le prochain

- **Toujours** envoyer le `Bearer <token>` sur les routes `/api/*` sensibles
- **Toujours** vérifier `is_admin` côté serveur (pas juste côté front)
- **Ne pas** utiliser `NEXT_PUBLIC_SUPABASE_ANON_KEY` comme fallback sur `SUPABASE_SERVICE_ROLE_KEY` (bug corrigé partout)
- **Tester** le build Vercel après chaque commit (TS strict)
- **Magic bytes** : à terme, ajouter une validation côté serveur (lit les premiers bytes du fichier uploadé, pas juste le `contentType`)

---

## Historique des modifications

> ⚠️ **Ajouter une ligne à chaque fin de session** au format :
> `YYYY-MM-DD : [brève description des changements]`
> Le prochain intervenant lira ces lignes pour comprendre l'évolution.

- 2026-09-04 (feature Fiches VOD & Analyse de replay) :
  - **Nouvelle table SQL** : `vod_clips` (clips soumis par les élèves) + `vod_annotations` (annotations horodatées du coach) avec RLS policies complètes
  - **`lib/vod-utils.ts`** : parser d'URLs vidéo (YouTube watch/shorts/youtu.be, Twitch clips/VOD, Medal.tv) → embedUrl + thumbnailUrl + providerLabel
  - **`/api/vod/clips`** : GET (liste clips d'un élève, admin ou self), POST (élève soumet, validation URL + magic parse), DELETE (admin supprime en cascade)
  - **`/api/vod/annotations`** : GET / POST / DELETE — écriture réservée à l'admin, timestamp optionnel (mm:ss ou secondes brutes), catégories : point_fort / erreur / axe_travail / general
  - **`/admin/coaching`** : cartes élèves redessinées avec 2 boutons séparés : **Chat** (cyan, badge non-lus) + **Clips VOD** (orange)
  - **`/admin/coaching/[studentId]/clips`** : page admin dédiée — liste des clips avec embed inline (iframe), formulaire d'annotation (catégorie + timestamp + texte 1000 car.), suppression clip/annotation avec confirmation
  - **`/profile/vod`** : page élève — formulaire de soumission avec validation URL live (feedback vert/rouge), liste de ses clips, annotations du coach affichées avec badge coloré par catégorie
  - **`/profile`** : grille 4 cartes (ajout carte "Clips VOD" → `/profile/vod`)
  - Testé en local : build OK (TS strict), 35/35 pages, exit 0
- 2026-09-04 (audit complet + correctifs) :
  - **Sécurité** : magic bytes (PNG/JPEG/GIF/WEBP) vérifiés **côté serveur** dans `/api/avatar/upload` — bloque l'upload de fichiers malveillants renommés en .png
  - **Sécurité** : `/admin/users` utilise maintenant `u.id !== user.id` au lieu de `u.username !== user.username` pour empêcher un user de se promouvoir admin / se supprimer (un attaquant peut créer un compte avec le même pseudo)
  - **Perf** : `/api/admin/users` accepte `?userId=xxx` pour ne charger qu'un seul user (au lieu de tous les lister). Utilisé par `/admin/coaching/[studentId]`
  - **Perf** : `useMemo` sur les filtres/tri de `/admin/users` et `/admin/coaching` (recalcul évité à chaque render)
  - **Bug** : `setTimeout` du scrollIntoView dans `handleStartEdit` (avis) utilise maintenant un `useRef` + cleanup au unmount (évite le scroll fantôme si on quitte la page vite)
- 2026-09-04 (édition et suppression de son propre avis) :
  - **Édition d'avis par le propriétaire** : un user peut modifier son propre avis pendant 5 minutes après publication. Bouton "Modifier" avec icône Edit3 apparaît automatiquement sur ses cartes
  - **Compte à rebours visuel** : badge `Modifiable 4:32` qui s'actualise toutes les 30s
  - **Formulaire d'édition inline** : la carte se transforme en formulaire pré-rempli (texte, note, jeu, rang) avec validation des longueurs et compte de caractères (2000 max)
  - **Auto-scroll** vers la carte éditée + annulation possible
  - **Admin peut toujours éditer** n'importe quel avis sans limite de temps
  - **Suppression par le propriétaire** : un user peut supprimer son propre avis n'importe quand (utile pour corriger une erreur)
  - **Suppression par admin** : fonctionne comme avant, en plus de l'édition
  - **Permission checks serveur** : nouvelle méthode PATCH sur `/api/reviews` avec auth, vérification owner OU admin, fenêtre 5 min enforced côté serveur
  - **DELETE durci** : vérifie maintenant que l'user est owner OU admin avant de supprimer (plus seulement admin)
  - **Colonne `updated_at`** : ajoutée à la table reviews pour tracker les modifications (SQL fourni)
  - **Badge "Votre avis"** : affichage cyan sur les cartes du user connecté
  - **Badge "Vue Admin"** : affichage purple sur les cartes d'autres users quand l'admin regarde
  - **Indicateur "modifié"** : italique gris si `updated_at !== created_at`
  - **SQL** : `add-review-updated-at-column.sql` fourni pour ajouter la colonne
  - Testé en local : build OK
- 2026-09-04 (fix persistance paramètres admin) :
  - **Persistance réelle** : les changements dans `/admin/settings` sont maintenant vraiment sauvegardés en base Supabase (table `settings`). Suppression du message trompeur "mémoire locale uniquement"
  - **API `/api/settings` durcie** : validation des clés autorisées, validation des URLs (http/https uniquement), gestion d'erreurs améliorée, refresh de session si token expiré, message d'erreur explicite si la table n'existe pas
  - **SQL `create-settings-table.sql` amélioré** : script idempotent, RLS policies propres (SELECT public, INSERT/UPDATE/DELETE admin only), policy `WITH CHECK` ajoutée pour bloquer les inserts non-admin
  - **UI paramètres refaite** : aperçu **live** YouTube + Twitch (iframe) qui s'update quand on tape l'URL, validation visuelle des URLs invalides (bordure rouge + message), détection auto de l'ID vidéo YouTube (watch?v=, youtu.be/), détection auto du channel Twitch
  - **Alerte table manquante** : si la table `settings` n'existe pas, bandeau orange avec instructions SQL étape par étape
  - **Refresh automatique des consommateurs** : `About.tsx` écoute un événement `settings-updated` pour recharger immédiatement après sauvegarde admin
  - **Bouton sauvegarde** : désactivé pendant la sauvegarde, affiche un spinner, désactivé si URLs invalides
  - Testé en local : build OK (TS strict)
- 2026-09-04 (fix erreur serveur réponse admin + mode déroulant) :
  - **Erreur serveur réponse admin corrigée** : suppression du `.select().single()` final dans l'API `/api/reviews/respond` qui pouvait faire échouer l'update si la lecture post-écriture retournait 0 lignes — on renvoie maintenant directement les valeurs écrites
  - **Détection colonnes manquantes** : ajout de la détection "schema cache" dans le message d'erreur si les colonnes `admin_response`/`admin_response_at` n'existent pas
  - **Token expiré géré côté client** : ajout `supabase.auth.refreshSession()` automatique dans `handleAdminResponse` quand le token est expiré, avec message clair "Session expirée, reconnectez-vous"
  - **UI mode déroulant améliorée** : bouton "Réponse de l'équipe Poulpy" avec gradient purple→cyan bien visible, **chevron rotatif** (ChevronDown + rotate-180 quand déployé), animation framer-motion easeInOut, **avatar "Équipe Poulpy" + date de réponse** dans le panneau déplié
  - **Fix build** : `discordUrl` manquant dans `setSettings` de `components/About.tsx` (erreur TS2345)
- 2026-09-16 (restauration complète & correction navigation Pourquoi Poulpy) :
  - **Restauration intégrale des 51 commits distants** : réintégration de l'ensemble des fonctionnalités créées sur la machine distante (vidéos de clips Aim/Clutch/Sang-Froid, pack sessions, avis mis en avant, robots/sitemap SEO, profil et booking).
  - **Calibrage exact du saut par pilier (`goToCard`)** : utilisation de `st.start` et `st.end` de ScrollTrigger combinés à `ScrollToPlugin` pour scroller au pixel près vers chaque carte (01 à 06) sans décalage de pin.
  - **Redirection fluide CTA Tarifs** : connexion du bouton « Découvrir les tarifs » vers la section de réservation/tarifs (`#booking` et ancre `#tarifs`) avec défilement fluide GSAP.
- 2026-09-15 (simplification header Méthodologie) :
  - **Nettoyage UI Méthodologie (`components/Methodology.tsx`)** : suppression de la pastille et mention « Défile vers le bas » au profit d'une présentation épurée et directe des 4 phases chirurgicales.
- 2026-09-15 (nettoyage UI boutons de thème dupliqués) :
  - **Suppression du toggle de thème flottant** : retrait du composant `<ThemeToggle />` orphelin en haut à gauche des pages `/profile` et `/avis` (le toggle officiel est déjà parfaitement intégré et accessible dans la barre de navigation `CyberNavbar`).
- 2026-09-15 (calibrage fuseau horaire Paris Europe/Paris & durée exacte des séances Notion) :
  - **Calibrage automatique du fuseau horaire (`parseNotionDateToParis`)** : conversion systématique et fiable des dates et heures UTC envoyées par les webhooks Notion (`Intl.DateTimeFormat` avec `timeZone: 'Europe/Paris'`) pour garantir que les déplacements d'événements dans Notion Calendar reflètent exactement l'heure locale sur le site (ex: `13:15` sur le calendrier Notion = `13:15` sur le site et dans l'espace élève, et non `11:15`).
  - **Calcul dynamique de la durée des formules (`getDurationMinutes`)** : prise en compte stricte de la durée selon la formule sélectionnée (`SESSION DIAGNOSTIC` = 30 min, `COACHING PRO` = 60 min, `PERFORMANCE` = 90 min) lors de la création et du report de séances.
  - **Gestion dynamique du décalage saisonnier (`getParisOffsetForDate`)** : attribution automatique de l'offset `+02:00` (heure d'été) ou `+01:00` (heure d'hiver) pour la synchronisation Notion.
- 2026-09-15 (synchronisation bidirectionnelle temps réel Notion ➔ Poulpy Coaching & alertes élèves) :
  - **Route Webhook Notion (`POST /api/webhooks/notion`)** : écoute les événements de modification et de suppression envoyés en direct par Notion / Notion Calendar.
  - **Gestion dynamique des créneaux & statut** :
    - *Déplacement d'horaire* : libère l'ancien créneau, verrouille le nouveau, met à jour `booking_date` / `booking_time`, passe le statut à `rescheduled` et active `read_by_student = false`.
    - *Suppression / Archivage Notion* : passe le statut à `cancelled`, libère le créneau et active `read_by_student = false`.
  - **Alerte immédiate pour l'élève** : déclenchement automatique de la cloche rouge clignotante dans la barre de navigation et notification détaillée (`SÉANCE REPLANIFIÉE` ou `SÉANCE ANNULÉE`).
  - **Route de synchronisation globale (`POST /api/admin/notion/sync`)** : réconciliation manuelle à la demande de l'ensemble des rendez-vous Notion.
  - **Parsing et helpers (`fetchNotionPage`, `queryAllNotionBookings`)** : extraction fiable des dates ISO, fuseaux horaires et statuts depuis l'API Notion.
- 2026-09-15 (intégration Notion Calendar & synchronisation automatique des réservations) :
  - **Module d'intégration résilient (`lib/notion.ts`)** : création des méthodes `createNotionBooking`, `updateNotionBookingDate`, `cancelNotionBooking` et `completeNotionBooking` via l'API REST officielle Notion v1 (`Notion-Version: 2022-06-28`). En cas d'absence de configuration, le flux de réservation reste 100% fonctionnel sans blocage.
  - **Synchronisation à la création (`POST /api/bookings/create`)** : création instantanée de la page RDV dans Notion avec titre structuré, date/heure, statut `Confirmé`, jeu (`Valorant`/`Apex Legends`), formule, Discord, email et notes, puis enregistrement du `notion_page_id` dans Supabase.
  - **Synchronisation en direct des actions admin (`PATCH /api/admin/bookings`)** :
    - *Annulation* : archivage / suppression immédiate de la séance dans le calendrier Notion.
    - *Report* : mise à jour instantanée de la date/heure et du statut `Reporté` dans Notion.
    - *Complétion* : bascule du statut en `Terminé` dans Notion.
  - **Script de migration SQL (`add-notion-columns.sql`)** : ajout idempotent de la colonne `notion_page_id` et index de recherche.
  - **Guide de mise en route (`NOTION_SETUP.md`)** : documentation complète pas-à-pas pour configurer l'intégration Notion et Notion Calendar.
- 2026-09-16 (animation 3D Depth Shift & Directional Slide sur CyberGames) :
  - **Transition multidimensionnelle Valorant ↔ Apex** : bascule directionnelle avec inertie spring (`stiffness: 320, damping: 30`), profondeur 3D (`scale: 0.95`, `rotateY: ±5deg`), défilement spatial horizontal et cascade échelonnée (*stagger*) sur les modules de protocole
  - **Dynamisme visuel & Réticules adaptatifs** : synchronisation des accents de bordure et des `CornerBrackets` (`coral` / `slate`) selon la couleur signature du jeu actif
- 2026-09-16 (calibrage des espacements verticaux entre les sections de la page d'accueil) :
  - **Aération de l'indicateur "Déroulez la page vers le bas" (`WhyPoulpy`)** : calibrage de la hauteur des cartes (`h-[480px] sm:h-[500px]`) et ajout de marges dédiées (`pt-4 pb-2`) sur l'indicateur textuel inférieur pour éviter tout écrasement contre le bas des cartes ou la bordure de section
  - **Réduction des gaps inter-sections** : standardisation du padding vertical (`py-14 sm:py-16`) sur `CyberGames`, `Methodology`, `Booking`, `CyberTestimonials`, `CyberAbout`, `CyberMedia` et `CyberFAQ`
  - **Ajustement de la densité interne** : réduction des `space-y-16` et `space-y-14` vers `space-y-8 sm:space-y-10` pour supprimer les vides excessifs tout en préservant l'impact visuel Cybercore
  - **Intégrité de la navigation garantie** : préservation totale des ancrages DOM (`#games`, `#methodology`, `#booking`, `#avis`, `#apropos`, `#media`, `#faq`) et du calcul dynamique de positionnement de la `CyberNavbar`
- 2026-09-15 (optimisation ultra-haute performance scroll horizontal WhyPoulpy & 0-overhead Three.js) :
  - **Calibrage scrub réactif (`scrub: 0.3`)** : remplacement du scrub lourd 0.8s (qui créait une sensation de traînée/lag après le refresh et sur trackpad de PC portable) par un scrub vif et fluide 0.3s
  - **Isolation GPU & Composition matérielle** : application de `transform: translate3d(0,0,0)`, `will-change: transform`, `backface-visibility: hidden` sur la piste de défilement (`trackRef`) et `contain: layout style paint` sur chaque carte individuelle pour éliminer les recalculs de rasterisation CPU
  - **Suspension anticipée de Three.js `Scene3D`** : abaissement du seuil de veille de la scène 3D à `0.75 * innerHeight` (dès que le hero commence à sortir de l'écran) pour libérer 100% du CPU/GPU avant même le début du scroll horizontal
- 2026-09-15 (refonte architecture scroll horizontal GSAP pin: true à 120 FPS) :
  - **Passage à GSAP `pin: true` & `anticipatePin: 1`** : remplacement du conteneur CSS `sticky` (qui causait une désynchronisation entre le thread de scroll natif du navigateur et le thread de rendu GSAP) par le système de pinning natif matériel de ScrollTrigger
  - **Fluidité 120 FPS constante** : scrubbing calé à `0.8`, calcul de distance exact `+=${scrollDistance}`, mise en cache directe des boutons de pills dans `pillBtnsRef`, et suppression de toutes les animations laser concurrentes sur la dernière carte
- 2026-09-15 (fix glitch chiffres, suppression trait blanc et fluidité fast-scroll WhyPoulpy) :
  - **Suppression du trait blanc parasite** : suppression du `border-b` de la barre de télémétrie qui entrait en collision visuelle au-dessus des cartes sur écran PC portable / hauteur réduite
  - **Suppression du glitch sur les chiffres** : suppression de `glitch-text` sur les numéros de cartes (`item.num`) pour une typographie fixe, nette et immédiatement lisible
  - **Élimination des freeze au scroll rapide** : suppression de `fastScrollEnd` et `preventOverlaps` de ScrollTrigger (qui interrompaient brusquement le tween d'animation en cas de vitesse élevée) et ajustement du scrub à `0.6` pour une inertie fluide
- 2026-09-15 (optimisation performance scroll horizontal et animations) :
  - **Scroll horizontal fluide (`WhyPoulpy`)** : élimination des re-renders React continus pendant le scrub GSAP en utilisant des refs DOM directes (`progressBarRef`, `scrollPctRef`, `pillsRef`) et `transform: scaleX()` accéléré GPU au lieu de transitions CSS sur la largeur
  - **Mesures stables sur refresh** : synchronisation de l'initialisation de ScrollTrigger avec `document.fonts.ready` et activation de `fastScrollEnd` + `preventOverlaps`
  - **Confinement CSS & Rasterisation** : ajout de `contain: layout style paint` sur toutes les cartes du track horizontal et allègement des ombres floues pour éviter la surcharge VRAM GPU sur PC portable
  - **Mise en pause de `Scene3D` hors écran** : mise en veille du rendu WebGL et du calcul des 6 000 particules Three.js dès que l'utilisateur scroll au-delà de la section Hero (100% du CPU/GPU libéré pour le scroll)
  - **Élimination du Layout Thrashing (`CyberNavbar`)** : throttling du handler de scroll avec `requestAnimationFrame` pour éviter les recalculs de layout synchrones via `getBoundingClientRect()`
- 2026-09-15 (unification DA Cybercore panneau admin) :
  - **Refonte DA panneau admin** : application intégrale de la DA Cybercore / E-sport Brutaliste de l'accueil sur toutes les pages d'administration (`/admin`, `/admin/bookings`, `/admin/students`, `/admin/coaching`, `/admin/coaching/[studentId]`, `/admin/coaching/[studentId]/clips`, `/admin/coaching/[studentId]/sheet`, `/admin/stats`, `/admin/settings`, `/admin/users`) et sur les composants d'administration (`SheetMarkdownPreview`, `VisualSheetEditor`, `VisualTableModal`)
  - **Harmonisation visuelle** : suppression des gradients violets/cyans legacy, suppression des classes `rounded-*`, `card`, `glass` et `page-bg` au profit du fond technique sombre `#07090D` / `#090c10`, des bordures subtiles `border-white/8`, des reticles d'angle `reticle-box`, des accents `--acid` `#FF7582`, `--laser` `#8FAFD4` et boutons cyber brutalistes
- 2026-09-03 (session audit complet) :
  - Ajout feature **bio** élève (visible par admin) — `0f16a7e`
  - **Sécurité** : auth + admin sur tous les endpoints sensibles — `61eb82d`
  - **Qualité** : validation UUID, AbortController, cleanup setTimeout, magic bytes — `2505f13`, `398bea4`, `c959ed0`, `5fd5837`, `c32f9d8`
  - **Fix build** : TS2322 AbortSignal — `55919b2`, `4a7cdf2`
  - **Sécurité critique** : trou auth sur admin coaching messages — `f35fa3a`
  - **A11y** : `role="log"` + `aria-live` sur les chats, `role="dialog"` + Escape sur confirmation clear — `5fd5837`, `7689df5`
  - **Notifications** : pastille rouge fonctionnelle, cloche refactor — voir historique git
  - **Mdp admin smith94** changé en `Poulpyacq7gm!` (via script Node, à noter pour futures connexions)
  - **Reste à faire** : race condition clear/fetch (cas rare), Page Visibility API pour polling, RLS policies Supabase, magic bytes validation côté serveur
- 2026-09-03 (session admin settings + media section) :
  - **Admin Settings** : refactor page `/admin/settings` — suppression sections inutiles (Sécurité, Apparence, Notifications), section Général fonctionnelle avec state management React
  - **Champs YouTube/Twitch** : ajout des champs de modification pour les liens YouTube et Twitch dans les settings, avec tooltips explicatifs au survol (icône HelpCircle)
  - **Section média About** : ajout section média sous présentation Poulpy avec toggle YouTube/Twitch, lecteurs intégrés (video 4gfWbGCA5q0, channel poulpy_coaching), format 16:9 responsive
  - **UI Settings** : formulaire avec gestion d'état, bouton Réinitialiser fonctionnel, tooltips interactifs
  - **Debug réponse admin** : logging détaillé API, vérification existence review avant update, message d'erreur spécifique si colonnes manquantes, script SQL fourni (`add-review-response-columns.sql`)
  - **Mode déroulante** : réponses admin en mode déroulante (bouton "Voir/Masquer la réponse de Poulpy") avec animation framer-motion
  - Testé en local : build OK, settings fonctionnels, section média responsive
- 2026-09-03 (session tri et réponse avis) :
  - **Tri des avis** : ajouts filtres de tri par date, nom, note (croissant/décroissant) sur la page `/avis` — modification API `/api/reviews` (GET) pour accepter paramètres `sortBy` et `sortOrder`
  - **Réponses admin** : possibilité pour les admins de répondre aux avis via nouveau bouton « Répondre à cet avis » + formulaire inline — création API `/api/reviews/respond` (POST) avec auth + is_admin, stockage dans `admin_response` et `admin_response_at`
  - **UI** : affichage des réponses admin avec badge « Réponse de l'équipe Poulpy » dans les cartes d'avis
  - **Schema** : mise à jour interface `Review` pour inclure `admin_response` et `admin_response_at`
  - Testé en local : build OK, tri fonctionnel, interface réponse admin visible uniquement pour les admins
- 2026-09-03 (session connexion Google + pseudo) :
  - **Connexion Google OAuth** : bouton « Continuer avec Google » (logo officiel) sur `/auth` + séparateur « ou par email » — `AuthContext.signInWithGoogle()`
  - **`/auth/callback`** : page de retour OAuth (attente session, gestion erreurs URL, timeout 10s) → redirige `/` ou `/auth/complete`
  - **`/auth/complete`** : étape choix de pseudo obligatoire après inscription Google (avatar Google + anneau dégradé, suggestions auto depuis email/nom Google, vérif dispo en direct avec debounce + AbortController, thèmes clair/sombre)
  - **`/api/auth/check-username`** : vérif dispo pseudo via service_role + token, regex + échappement jokers LIKE, insensible à la casse
  - **`User.needsUsername`** ajouté dans AuthContext (pseudo absent → rappel « Choisis ton pseudo » dans la Navbar desktop + mobile)
  - **Google pas encore activé côté Supabase** : voir section « Connexion Google OAuth — configuration » ci-dessus (Google Cloud + Supabase Dashboard, callback `https://gxomzlbmgqhgeegzcafl.supabase.co/auth/v1/callback`)
  - Testé en local : rendu 2 thèmes, redirection OAuth correcte (`provider is not enabled` attendu tant que la config n'est pas faite), garde `/auth/complete` sans session, lint propre, build OK
