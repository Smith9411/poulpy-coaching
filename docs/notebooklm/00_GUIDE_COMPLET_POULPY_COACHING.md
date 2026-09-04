# 🐙 Poulpy Coaching — Livre Blanc & Documentation Complète du Projet

> **Projet** : Poulpy Coaching  
> **Plateforme** : Web & Mobile PWA (Progressive Web App)  
> **Stack Technique** : Next.js 16 (Turbopack, App Router), React 19, TypeScript, Tailwind CSS v4, Supabase (Auth, PostgreSQL, Storage), Framer Motion, Web Notifications API, App Badging API.  
> **Auteur / Coach** : Poulpy  
> **Date de référence** : Septembre 2026  

---

## Table des Matières
1. [Vision & Présentation Générale](#1-vision--présentation-générale)
2. [Identité Visuelle & Expérience Utilisateur (UI/UX)](#2-identité-visuelle--expérience-utilisateur-uiux)
3. [Parcours Élève / Joueur (Fonctionnalités Utilisateurs)](#3-parcours-élève--joueur-fonctionnalités-utilisateurs)
4. [Panneau d'Administration & Espace Coach](#4-panneau-dadministration--espace-coach)
5. [Application Mobile & Technologie PWA](#5-application-mobile--technologie-pwa)
6. [Système d'Avis & Preuve Sociale](#6-système-davis--preuve-sociale)
7. [Architecture Technique & Base de Données](#7-architecture-technique--base-de-données)
8. [Problèmes Connus, Limitations & Dépendances Externes](#8-problèmes-connus-limitations--dépendances-externes)
9. [Roadmap & Évolutions Futures](#9-roadmap--évolutions-futures)

---

## 1. Vision & Présentation Générale

### 1.1 Qu'est-ce que Poulpy Coaching ?
**Poulpy Coaching** est une plateforme moderne et immersive de coaching compétitif pour les jeux de tir à la première personne (FPS), spécialisée principalement sur :
- **Valorant** (tactical shooter de Riot Games)
- **Apex Legends** (battle royale nerveux de Respawn/EA)
- **Aim Training** (exercices ciblés de visée : KovaaK's, Aim Labs, micro-ajustements, tracking, flicking).

La plateforme fait le pont entre le joueur cherchant à progresser (rank up, compréhension de jeu, discipline mentale) et son coach dédié (**Poulpy**). Contrairement aux serveurs Discord désorganisés ou aux formulaires Google Sheets austères, Poulpy Coaching offre une interface haut de gamme digne des meilleures applications esport.

### 1.2 La Philosophie de Coaching
Le coaching chez Poulpy repose sur une méthode en 4 piliers :
1. **Diagnostic Initial** : Évaluation du rang actuel, analyse des habitudes en jeu, sensibilité de la souris, posture et matériel.
2. **Analyse VOD Personnalisée** : Découpage image par image des erreurs de placement de viseur (crosshair placement), de prise d'information, et d'utilisation des compétences.
3. **Coaching Live & Exercices Dédiés** : Sessions interactives en direct, parties personnalisées, routines quotidiennes d'aim training adaptées au profil du joueur.
4. **Suivi Continu & Plan de Progression** : Messagerie directe avec le coach, retours sur les sessions, validation des paliers de rangs franchis.

---

## 2. Identité Visuelle & Expérience Utilisateur (UI/UX)

### 2.1 La Charte Graphique & le Thème
- **Thème Sombre Gaming** : Fond profond `#13161e` pour un confort visuel optimal lors de longues sessions de jeu.
- **Accents Néon Cyberpunk** : Dégradés vibrants allant du violet électrique (`#9333ea`) au cyan éclatant (`#06b6d4`), rappelant l'univers esport et néon.
- **Mascotte Poulpy** : Le poulpe charismatique aux couleurs rouge/corail et écharpe bleue, présent sur le logo, la favicon, les icônes de l'application et les éléments décoratifs.
- **Mode Sombre / Mode Clair (Theme Toggle)** : L'utilisateur peut basculer en un clic entre le mode sombre gamer et un mode clair épuré avec persistance dans le `localStorage`.

### 2.2 Composants Clés de la Page d'Accueil (`/`)
- **Hero Section** : Titre percutant avec typographie néon, boutons d'action rapide ("Réserver une session", "Voir les avis"), badge "Coach Certifié".
- **Why Poulpy** : Arguments différenciants (approche personnalisée, pédagogie bienveillante, résultats mesurables).
- **Jeux Couverts** : Cartes interactives présentant Valorant, Apex Legends et les modules d'Aim.
- **Méthode** : Étapes claires du parcours d'apprentissage.
- **Tarifs** : Grille tarifaire transparente (Session Découverte 30 min, Pack Pro 60 min, Performance Max 90 min).
- **Réservation** : Formulaire guidé par étapes (choix du pack, sélection du jeu, créneau horaire souhaité, coordonnées).
- **Avis Défilants** : Carrousel dynamique des retours d'expérience vérifiés d'anciens élèves.
- **FAQ Interactive** : Accordéon des questions fréquentes (déroulement d'une session, remboursements, matériel requis).

---

## 3. Parcours Élève / Joueur (Fonctionnalités Utilisateurs)

### 3.1 Authentification Hybride
Le site supporte 3 modes de connexion :
1. **Connexion par Email & Mot de Passe** : Inscription classique avec email, mot de passe sécurisé et validation d'email via Supabase Auth.
2. **Connexion Sociale Google** : Un clic avec compte Google (`signInWithOAuth: 'google'`), récupération automatique de l'avatar et de l'adresse email.
3. **Connexion Sociale Discord** : Un clic avec compte Discord (`signInWithOAuth: 'discord'`), liaison directe avec la communauté des joueurs.
4. **Flow de complétion de pseudo (`/auth/complete`)** : Si un joueur se connecte via Google ou Discord pour la première fois sans pseudo défini, un écran dédié lui demande de choisir son pseudonyme unique avant d'accéder au reste du site.

### 3.2 Espace Profil (`/profile`)
L'élève dispose d'un tableau de bord personnel comprenant :
- **Avatar Personnalisé** : Téléversement d'image de profil avec vérification de sécurité des "Magic Bytes" (bloque les faux fichiers malveillants), stockage dans Supabase Storage.
- **Modification du Pseudo & Bio** : Possibilité de rédiger sa bio gamer (objectifs, agent/légende favoris).
- **Réseaux Sociaux Minimalistes** : Renseignement de ses liens gamer :
  - Discord (ex: `Poulpy#0001` ou `@poulpy`)
  - Twitch (`twitch.tv/pseudo`)
  - YouTube (`youtube.com/@pseudo`)
  - TikTok (`tiktok.com/@pseudo`)
- **Jeux Favoris** : Sélection de ses jeux de prédilection avec ses rangs actuels.
- **Raccourcis rapides** : Accès direct à son chat de coaching et à ses reviews de clips vidéo.

### 3.3 Espace Suivi Coaching (`/profile/coaching`)
- **Messagerie Instantanée Coach ↔ Élève** : Chat bilatéral temps réel pour poser des questions entre les sessions, partager des ressentis et recevoir les devoirs ou consignes du coach.
- **Lecteur de Messages Audio (`AudioMessagePlayer`)** : Possibilité pour le coach ou l'élève d'écouter des mémos vocaux directement dans l'interface.

### 3.4 Espace Review Vidéo VOD (`/profile/vod`)
- **Soumission de Clips** : L'élève colle simplement un lien YouTube, Twitch Clip ou Medal.tv avec un titre et le contexte de l'action.
- **Lecteur Intégré** : Visionnage automatique de la séquence.
- **Annotations Horodatées** : L'élève visualise les remarques précises du coach minute par minute (ex: à 01:23 : *"Ici mauvais crosshair placement"*).
- **Catégories d'Annotations** : Code couleur par type de conseil (Aim, Positionnement, Communication, Game Sense, Économie).

---

## 4. Panneau d'Administration & Espace Coach

L'accès aux sections administratives est strictement protégé : si l'utilisateur n'a pas `is_admin = true` dans la table `profiles`, la page affiche un message "Accès refusé" avec redirection sécurisée.

### 4.1 Dashboard Central (`/admin`)
- Vue d'ensemble des nouveaux élèves inscrits, des messages en attente et des clips à analyser.
- Compteur dynamique d'utilisateurs actifs.

### 4.2 Gestion des Utilisateurs (`/admin/users`)
- **Liste complète des comptes inscrits** : Consultation de l'email, du pseudo, de la date d'inscription et du rôle.
- **Attribution / Révocation du rôle Admin** : Bouton d'action permettant de promouvoir un utilisateur en administrateur ou de lui retirer ses droits.
- **Consultation des Réseaux Sociaux** : Bouton déroulant "Réseaux" sous chaque joueur affichant ses identifiants Discord, Twitch, YouTube et TikTok.
- **Modération des Réseaux** : Possibilité pour l'admin de supprimer un réseau inapproprié d'un clic.
- **Suppression d'Avatar** : Bouton de modération pour réinitialiser une photo de profil non conforme.

### 4.3 Suivi des Élèves & Chat Coach (`/admin/coaching` & `/admin/coaching/[studentId]`)
- **Inbox Centralisée** : Liste de toutes les conversations actives classées par date du dernier message, avec pastille de messages non lus.
- **Conversation Dédiée par Élève** : Interface de messagerie fluide permettant de répondre en temps réel à chaque joueur.
- **Effacement de l'Historique** : Option permettant de purger les messages d'un fil de discussion si nécessaire.

### 4.4 Analyse VOD Admin (`/admin/coaching/[studentId]/clips`)
- Visualisation des clips envoyés par l'élève.
- Outil d'ajout d'annotations : saisie du timestamp précis en secondes, sélection de la catégorie et rédaction du conseil tactique.

### 4.5 Modération et Réponses aux Avis (`/avis`)
- Lorsque le compte connecté est admin, chaque carte d'avis client s'enrichit d'un bouton **"Répondre en tant que coach"**.
- La réponse du coach s'affiche sous l'avis avec un badge officiel certifié violet/cyan `🐙 Réponse de Poulpy Coaching`.
- Possibilité pour l'admin de modifier ou supprimer sa réponse, ou de modérer un avis diffamatoire.

### 4.6 Paramètres & Cloche de Notifications Admin
- Une cloche dédiée dans la Navbar affiche en temps réel les clips non annotés et les messages non lus de tous les élèves.

---

## 5. Application Mobile & Technologie PWA

Le site est entièrement conçu selon le standard **Progressive Web App (PWA)**, permettant une expérience identique à une application mobile téléchargeable sur l'App Store ou Google Play, mais sans contrainte d'installation lourde.

### 5.1 Installation en 1 Clic
- **Bannière d'installation native** : Sur smartphone (Android ou iPhone), un bandeau stylisé invite l'utilisateur à "Installer l'application Poulpy" pour l'ajouter à son écran d'accueil.
- **Mode Plein Écran (Standalone)** : Une fois installée, l'application s'ouvre sans barre d'adresse ni boutons de navigation du navigateur web.
- **Icônes Dédiées** : Icône haute résolution du poulpe aux formats 192x192 et 512x512, incluant la compatibilité maskable icon pour Android.

### 5.2 Écran d'Ouverture Néon (Splash Screen)
- Au lancement de l'application mobile, un écran de démarrage premium s'affiche :
  - Mascotte Poulpy centrée dans un squircle haute définition.
  - Lueur néon intense pulsante en arrière-plan (gradient violet, rose et cyan).
  - Titre `POULPY` avec indicateur lumineux.
  - Barre de chargement néon animée (effet *shimmer*).
  - Transition douce (fade-out 450ms) dès que la session utilisateur est prête.
  - Protection `sessionStorage` : ne se rejoue pas à chaque changement de page interne pour garantir une navigation instantanée.

### 5.3 Notifications "Site Update" Exclusives Admin
- **Fonctionnement** : Lorsque le site est déployé avec une nouvelle version (commit Git ou nouveau build), l'application mobile détecte le changement de version via `/api/version` et le Service Worker (`public/sw.js`).
- **Condition stricte** : Seul le compte administrateur connecté (`user?.isAdmin`) reçoit cette notification.
- **Texte** : Titre `"Site update"` et message prévenant que de nouvelles modifications sont en ligne.
- **Anti-Doublon & Remplacement** : Utilisation du paramètre `tag: 'site-update'` avec `renotify: true`. Si une ancienne notification de mise à jour n'a pas été consultée, elle est automatiquement **remplacée** par la nouvelle au lieu d'inonder le centre de notification.

### 5.4 Pastille Rouge sur le Bureau (Badging API)
- Grâce à l'API moderne `navigator.setAppBadge(1)`, l'icône de l'application Poulpy sur le bureau du smartphone affiche une pastille rouge dès qu'une notification est reçue.
- La pastille s'efface automatiquement dès que le coach ouvre l'application ou clique sur la notification.

---

## 6. Système d'Avis & Preuve Sociale

Le système d'avis (`/avis`) est un pilier de crédibilité :
- **Notes sur 5 étoiles** : Calcul automatique de la moyenne générale (ex: `4.9 / 5`).
- **Filtres par Jeu** : Classement par Valorant, Apex Legends, Aim Training.
- **Informations Joueur** : Affichage du rang atteint grâce au coaching (ex: *Passé de Gold 2 à Diamant 1*).
- **Fenêtre d'Édition Sécurisée (5 minutes)** : Un élève peut corriger son avis pendant 5 minutes après publication, puis il est figé pour éviter les manipulations.
- **Réponse Officielle du Coach** : Capacité pour Poulpy d'apporter un mot personnalisé à chaque retour.

---

## 7. Architecture Technique & Base de Données

### 7.1 Architecture Frontend & Backend
- **Framework** : Next.js 16 avec Turbopack.
- **Routing** : App Router avec Server Components et Client Components optimisés.
- **Sécurité des API** : Routes sous `/api/...` vérifiant le Bearer Token Supabase (`supabase.auth.getUser(token)`) pour chaque action critique (suppression, modification de profil, modération admin).
- **Style** : Tailwind CSS v4 avec extensions de thèmes customisées.
- **Animations** : Framer Motion avec désactivation du `reactStrictMode` pour fluidifier le rendu sur smartphone sans clignotement.

### 7.2 Tables Principales Supabase (PostgreSQL)
1. `profiles` :
   - `id` (UUID, clé étrangère vers `auth.users`)
   - `username` (Text, pseudonyme unique)
   - `is_admin` (Boolean, droits d'administration)
   - `bio` (Text, présentation)
   - `avatar_url` (Text, URL de la photo de profil)
   - `discord`, `twitch`, `youtube`, `tiktok` (Text, réseaux sociaux de l'élève)
   - `created_at` (Timestamp)
2. `reviews` :
   - `id` (UUID, clé primaire)
   - `user_id` (UUID, auteur)
   - `name`, `game`, `rank`, `text`, `rating`
   - `admin_response`, `admin_response_at`
   - `created_at`, `updated_at`
3. `coaching_messages` :
   - `id`, `student_id`, `sender_id`, `message`, `is_read`, `created_at`
4. `vod_clips` & `vod_annotations` :
   - Gestion des vidéos soumises et des horodatages tactiques du coach.

---

## 8. Problèmes Connus, Limitations & Dépendances Externes

Voici la liste transparente des éléments qui nécessitent une action ou une amélioration :

1. **Configuration OAuth Discord** :
   - L'interface et le code d'authentification Discord sont prêts.
   - Il reste à configurer dans le Discord Developer Portal la Redirect URL pointant vers `https://[ID-PROJET].supabase.co/auth/v1/callback` et à renseigner le Client ID / Client Secret dans Supabase Providers.
2. **Paiement Non Automatisé** :
   - La réservation enregistre les souhaits de l'élève, mais le règlement financier s'effectue manuellement (via Discord / PayPal / virement) au lieu d'un paiement automatique par carte bancaire (ex: Stripe).
3. **Statistiques Administrateur Basiques** :
   - La page `/admin/stats` compte actuellement les utilisateurs inscrits et administrateurs, mais n'affiche pas encore de graphiques de chiffre d'affaires, de taux de rétention ou d'heures de coaching effectuées.
4. **Formulaire de Contact Déporté sur Discord** :
   - La page `/contact` redirige principalement vers le serveur Discord plutôt que de proposer l'envoi d'un email direct via un service comme Resend ou SendGrid.

---

## 9. Roadmap & Évolutions Futures

Les fonctionnalités recommandées pour les prochaines étapes de croissance de Poulpy Coaching :

### Phase 1 : Monétisation & Automatisation
- Intégration de **Stripe Checkout** pour payer directement les séances de coaching en ligne.
- Génération automatique de factures PDF pour les élèves.

### Phase 2 : Engagement & Gamification
- **Leaderboard des Élèves** : Classement mensuel des plus grosses progressions de rang (ex: +3 rangs ce mois-ci).
- **Journal de Progression Quotidien** : Outil permettant à l'élève de consigner ses scores KovaaK's/Aim Lab et ses ratios K/D journaliers avec graphiques d'évolution.
- **Badges & Succès** : Trophées déblocables (ex: *Premier débrief VOD validé*, *Visée d'élite*, *Rank Up Diamant*).

### Phase 3 : Calendrier Interactif
- Intégration d'un calendrier synchronisé avec Google Calendar du coach pour réserver automatiquement des créneaux en direct sans échange préalable sur Discord.

### Phase 4 : Notifications Push Complètes
- Extension du système de notification à tous les élèves : alerte mobile quand le coach envoie un nouveau message ou termine l'analyse d'un clip VOD.
