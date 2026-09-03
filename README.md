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
components/                # Composants partagés
context/AuthContext.tsx    # Auth provider
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
- `/auth` — Login/register
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
- (les autres tables existent déjà)

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
