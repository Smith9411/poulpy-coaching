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
- `/avis` — Reviews
- `/admin` — Dashboard admin (admin only)
- `/admin/coaching` — Liste élèves avec badges non-lus
- `/admin/coaching/[studentId]` — Conv avec un élève (admin only)
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

- 2026-09-04 (fix erreur serveur réponse admin + mode déroulant) :
  - **Erreur serveur réponse admin corrigée** : suppression du `.select().single()` final dans l'API `/api/reviews/respond` qui pouvait faire échouer l'update si la lecture post-écriture retournait 0 lignes — on renvoie maintenant directement les valeurs écrites
  - **Détection colonnes manquantes** : ajout de la détection "schema cache" dans le message d'erreur si les colonnes `admin_response`/`admin_response_at` n'existent pas
  - **Token expiré géré côté client** : ajout `supabase.auth.refreshSession()` automatique dans `handleAdminResponse` quand le token est expiré, avec message clair "Session expirée, reconnectez-vous"
  - **UI mode déroulant améliorée** : bouton "Réponse de l'équipe Poulpy" avec gradient purple→cyan bien visible, **chevron rotatif** (ChevronDown + rotate-180 quand déployé), animation framer-motion easeInOut, **avatar "Équipe Poulpy" + date de réponse** dans le panneau déplié
  - **Fix build** : `discordUrl` manquant dans `setSettings` de `components/About.tsx` (erreur TS2345)
  - Testé en local : build OK (TS strict), routes API bien générées
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
