# AGENTS.md — Contrat de travail obligatoire

> **Si tu es un agent IA (ou un humain) qui modifie ce projet, lis ce fichier ENTIÈREMENT avant de toucher au code.**
> **À la fin de chaque session de modifications, tu DOIS mettre à jour l'historique dans `README.md` section "Historique des modifications".**

---

## 1. Lis `README.md` d'abord

Le README est la source de vérité sur l'état du projet : stack, conventions, sécurité, comptes de test, historique. Tu dois le lire en entier avant de coder.

Si une convention de ce fichier contredit quelque chose dans le README, **le README a raison** (il a été mis à jour après).

## 2. À la fin de chaque session, mets à jour `README.md`

Toute session de modification (bug fix, feature, refactor, audit, etc.) DOIT se terminer par :
1. Un `git push origin main && git push github main` propre
2. Une entrée ajoutée dans la section **"Historique des modifications"** du `README.md`, au format :
   ```
   - YYYY-MM-DD : [résumé en 1 ligne de ce qui a été fait]
   ```
   Avec, si pertinent, la liste des commits (`abc1234`).

**Sans cette mise à jour, la prochaine session sera aveugle sur ce que tu as fait.** C'est non négociable.

## 3. Conventions techniques (rappel)

- **Next.js 16.3.2** + React 19 + Tailwind v4 : APIs différentes des versions en ligne, tester sur un fichier jetable d'abord si tu n'es pas sûr.
- **API sensibles** : `SUPABASE_SERVICE_ROLE_KEY` côté serveur + auth via `supabase.auth.getUser(token)` + check `is_admin` pour les actions admin.
- **Client** : `supabase.from(...)` uniquement pour les lectures qui passent par RLS. Les écritures passent par les routes API.
- **Tokens** : `supabase.auth.getSession()` → `Authorization: Bearer <token>` sur tous les fetch.
- **Session expirée** : refresh `supabase.auth.refreshSession()` avant les requêtes.
- **Auto-cleanup** : tous les `setInterval`/`setTimeout` ont un cleanup dans `useEffect` return (via `useRef`).
- **AbortController** : tous les fetch dans `useEffect` ont un `signal` et abort au cleanup.

## 4. Sécurité (ne JAMAIS régresser)

Bugs critiques déjà corrigés — ne pas les réintroduire :
- Toutes les routes `/api/admin/*` exigent `Authorization: Bearer <token>` ET `is_admin === true`.
- `userId` dans les uploads doit correspondre à `user.id` authentifié.
- `adminId` dans les messages doit correspondre à l'admin authentifié.
- `SUPABASE_SERVICE_ROLE_KEY` ne doit JAMAIS avoir de fallback vers `NEXT_PUBLIC_SUPABASE_ANON_KEY` (bug classique à éviter).
- Un admin ne peut pas supprimer son propre compte.

## 5. Tests à faire avant commit

- `npm run lint` doit passer (sauf erreurs préexistantes non liées)
- Le build Vercel doit passer (TS strict) — commit `4a7cdf2` est un fix typique pour ce genre de problème
- Tester manuellement la fonctionnalité en localhost avant de push

## 6. Remotes

- `origin` → GitLab
- `github` → GitHub (Vercel écoute ici)
- **Toujours** pusher sur les deux : `git push origin main && git push github main`

---

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
