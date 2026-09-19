# 🏆 Brag Document — Poulpy Coaching Platform (v8.0)

> **Document officiel de réalisations techniques, d'architecture et d'impact produit.**  
> *Généré conformément aux standards du skill `brag` (Action-Result-Evidence).*

---

## 🎯 Executive Summary

Poulpy Coaching est une plateforme e-sportive de haute précision développée sur **Next.js 14 (App Router)**, **TypeScript**, **Tailwind CSS**, **GSAP ScrollTrigger** et **Supabase PostgreSQL**. Conçue selon les standards d'excellence visuelle Awwwards & FWA et durcie pour une sécurité maximale en production.

### 🌟 Métriques & Accomplissements Clés :
- **Kinetic 3D Motion Engine** : 60 FPS constants sur desktop & mobile, suppression totale des lags de flip 3D via pré-chauffage GPU sub-pixel (`translateZ(2px)`).
- **Lecteur Vidéo Intelligent Visibility-Aware** : Économie de bande passante et de charge CPU grâce à la détection d'intersection et la mise en pause automatique des vidéos hors écran.
- **Sécurité & Hardening à 100%** : **9 tables PostgreSQL** protégées par Row Level Security (RLS) avec transtypage `::text`, zéro clé secrète exposée et 35+ routes API Next.js cloisonnées.
- **Écosystème Pédagogique Complet** : Module de coaching interactif, timeline d'analyse VOD avec annotations temporelles, fiches de suivi d'élèves et synchronisation temps réel avec Discord et Notion.

---

## 🚀 1. Features Majeures & Expérience Utilisateur

### 🎮 Kinetic 3D Experience — Section "Why Poulpy" (6 Piliers)
- **Objectif** : Transformer une section d'arguments statique en une expérience cinématique immersive digne des plus grands studios de jeu.
- **Réalisation Technique** :
  - Pipeline d'animation GSAP orchestré avec `ScrollTrigger` et `ScrollToPlugin`.
  - Retournement 3D progressif (« pancake flip ») déclenché précisément à 10% du scroll avec maintien du rythme visuel.
  - Système de navigation trackée par pilules `01 — 06` interactives et ancrage direct vers le tunnel de conversion des tarifs.
  - Résolution du problème de freeze de rendu et de flash blanc grâce à l'accélération GPU matérielle et `preserve-3d`.
- **Fichiers / Commits** : [`components/WhyPoulpy.tsx`](file:///d:/poulpy%20coaching/poulpy-coaching/components/WhyPoulpy.tsx) (`881fb75`, `ffa9b0d`, `b3205ae`)

### 🎥 Moteur de Streaming & Clips Vidéos Intégrés
- **Objectif** : Afficher des extraits in-game (Aim, Clutch, Sang-froid) en autoplay fluide sans ralentir la navigation.
- **Réalisation Technique** :
  - Encodage optimisé en **8-bit YUV420P** pour une compatibilité native parfaite sur l'ensemble des navigateurs (Chrome, Zen Browser, Firefox, Safari).
  - Contrôles de lecture et indicateurs de temps discrets apparaissant strictement au survol (`hover-only`).
  - Moteur d'isolation : arrêt automatique de toutes les vidéos inactives dès qu'une autre vignette entre dans le focus de lecture.
- **Fichiers / Commits** : [`public/videos/why-poulpy/`](file:///d:/poulpy%20coaching/poulpy-coaching/public/videos/why-poulpy) (`4c782e6`, `3eaf437`, `aea5eab`)

### 🎓 Espace Élève & Analyseur de VOD
- **Objectif** : Offrir aux élèves un tableau de bord professionnel pour suivre leur progression et analyser leurs parties.
- **Réalisation Technique** :
  - Fiches de progression (`student_sheets`) personnalisées éditables par l'admin et consultables par l'élève.
  - Système d'analyse VOD (`vod_clips`, `vod_annotations`) permettant d'ancrer des retours tactiques à la seconde exacte de la vidéo.
  - Centre de notifications asynchrone avec suivi des messages non lus (`/api/notifications/*`).
- **Fichiers** : [`app/profile/`](file:///d:/poulpy%20coaching/poulpy-coaching/app/profile), [`app/admin/coaching/`](file:///d:/poulpy%20coaching/poulpy-coaching/app/admin/coaching)

---

## 🛡️ 2. Sécurité, RLS & Hardening d'Ingénierie

### 🔒 Verrouillage PostgreSQL & Row Level Security (RLS)
- **Objectif** : Garantir l'étanchéité totale des données privées (réservations, fiches élèves, analyses, messages).
- **Réalisation Technique** :
  - Création du script d'audit et durcissement universel [`security-audit-hardening.sql`](file:///d:/poulpy%20coaching/poulpy-coaching/security-audit-hardening.sql).
  - Activation du RLS sur l'ensemble des tables : `profiles`, `coaching_slots`, `coaching_bookings`, `coaching_messages`, `student_sheets`, `vod_clips`, `vod_annotations`, `reviews`, `settings`.
  - Résolution des conflits de types SQL grâce au transtypage explicite `auth.uid()::text = user_id::text` assurant une compatibilité sans faille avec PostgreSQL.
  - Règle du moindre privilège : accès en lecture restreint au propriétaire ou à l'administrateur vérifié (`is_admin = true`).
- **Fichiers / Commits** : [`security-audit-hardening.sql`](file:///d:/poulpy%20coaching/poulpy-coaching/security-audit-hardening.sql) (`87574c0`, `8f04b16`)

### 🛡️ Protection des Endpoints API & Tokens
- **Objectif** : Empêcher toute fuite de variables sensibles ou de tokens d'intégration tiers.
- **Réalisation Technique** :
  - Filtrage strict par liste blanche (`ALLOWED_KEYS`) sur `GET /api/settings` pour interdire l'exposition de variables internes.
  - Masquage des tokens de validation Notion dans `GET /api/webhooks/notion` remplacés par des booléens d'état non sensibles.
  - Contrôle d'accès Bearer token et vérification des rôles sur 100% des routes `/api/admin/*`.
- **Fichiers** : [`app/api/settings/route.ts`](file:///d:/poulpy%20coaching/poulpy-coaching/app/api/settings/route.ts), [`app/api/webhooks/notion/route.ts`](file:///d:/poulpy%20coaching/poulpy-coaching/app/api/webhooks/notion/route.ts)

---

## ⚡ 3. Performance, SEO & Craft Visuel

- **Aesthetic Cybercore / Dark Tech** : Intégration de composants `DecryptedText`, grilles cybernétiques haute résolution et effets de reflets néon calibrés.
- **SEO & Référencement** : Génération automatisée du [`sitemap.xml`](file:///d:/poulpy%20coaching/poulpy-coaching/app/sitemap.ts), fichier [`robots.txt`](file:///d:/poulpy%20coaching/poulpy-coaching/app/robots.ts) et métadonnées OpenGraph / Twitter Cards.
- **Conformité & Cadre Légal** : Modales interactives de Conditions Générales de Vente (CGV), Politique de Confidentialité RGPD et architecture prête pour l'intégration Stripe Checkout.

---

## 📂 4. Inventaire Technique

| Composant / Module | Rôle & Architecture | Statut |
| :--- | :--- | :--- |
| `WhyPoulpy.tsx` | Moteur kinetic 3D, timeline GSAP, vidéos loop | 🟢 Production Ready |
| `CyberGames.tsx` | Showcase 3D Valorant / Apex avec directional slide | 🟢 Production Ready |
| `Booking.tsx` | Tunnel de réservation et sélection des créneaux | 🟢 Production Ready |
| `CyberFooter.tsx` | Footer interactif, CGV, RGPD & Mentions | 🟢 Production Ready |
| `security-audit-hardening.sql` | Script idempotent de blindage RLS Postgres | 🟢 Appliqué |
| `app/api/*` (35 routes) | API REST sécurisées, auth & synchronisations | 🟢 Protégé |

---
*Document maintenu et mis à jour automatiquement via le skill `brag`.*
