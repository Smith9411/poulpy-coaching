# Source 2 : Espace Élève, Profil & Analyse Vidéo VOD — Poulpy Coaching

## 1. Gestion du Profil Joueur
- **Authentification Polyvalente** : Connexion par e-mail sécurisé, Google OAuth, ou Discord OAuth.
- **Sélection du Pseudo Unique** : Flow dédié `/auth/complete` pour garantir que chaque joueur possède un pseudo unique sur le site.
- **Avatar Protégé** : Téléchargement d'avatar avec contrôle strict par signatures magiques (Magic Bytes) pour éviter tout fichier corrompu ou dangereux.
- **Réseaux Sociaux Gamer** : Liaison des identifiants Discord, Twitch, YouTube et TikTok. L'interface reste propre et minimaliste.
- **Jeux Favoris & Rangs** : Déclaration des jeux principaux et du rang visé pour orienter les séances.

## 2. Messagerie Coaching Privée (`/profile/coaching`)
- Espace de chat sécurisé direct entre l'élève et son coach Poulpy.
- Support des messages textuels et des messages audio vocaux avec lecteur intégré (`AudioMessagePlayer`).
- Historique conservé pour relire les conseils et consignes entre chaque session.

## 3. Système d'Analyse Vidéo VOD (`/profile/vod`)
- **Partage Simplifié de Clips** : L'élève dépose le lien de son action (YouTube, Twitch, Medal.tv).
- **Lecteur de Clip Intégré** : Permet de revoir l'action directement dans la page.
- **Annotations Horodatées du Coach** : Les remarques s'affichent synchronisées avec le temps de la vidéo :
  - Aim (ajustement de tir)
  - Positionnement (lignes d'angles, couverture)
  - Game Sense (timing, lecture de l'adversaire)
  - Communication & Utilitaires
