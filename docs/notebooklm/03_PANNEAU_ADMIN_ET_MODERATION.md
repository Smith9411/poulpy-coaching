# Source 3 : Panneau d'Administration & Gestion du Coach — Poulpy Coaching

## 1. Sécurité et Contrôle d'Accès
- Seuls les utilisateurs avec `is_admin = true` dans la table `profiles` peuvent voir et manipuler le panneau d'administration.
- Toute requête API sensible (`/api/admin/...`) est vérifiée côté serveur avec le jeton d'authentification Supabase.

## 2. Gestion Globale des Utilisateurs (`/admin/users`)
- **Tableau de Bord des Utilisateurs** : Consultation de tous les membres inscrits avec leurs pseudos et emails.
- **Rôles Administrateurs** : Promotion et rétrogradation en un clic.
- **Visualisation des Réseaux Sociaux** : Bouton déroulant "Réseaux" sous chaque compte pour vérifier les comptes Discord, Twitch, etc.
- **Modération des Réseaux** : Suppression immédiate des liens non conformes ou abusifs.
- **Suppression d'Avatar** : Nettoyage d'un avatar inapproprié.

## 3. Centre de Coaching & Inbox Multi-Élèves (`/admin/coaching`)
- Liste centralisée de toutes les conversations des élèves avec alertes de messages non lus.
- Possibilité pour le coach de répondre à la volée depuis son smartphone ou PC.
- Outil d'ajout d'annotations sur les clips vidéos des élèves avec choix du timestamp et de la catégorie.

## 4. Réponses et Modération des Avis (`/avis`)
- L'administrateur dispose d'une interface directe sous chaque avis d'élève pour publier une réponse officielle.
- La réponse arbore le badge officiel `🐙 Réponse de Poulpy Coaching`.
- Droit de modification ou suppression des réponses à tout moment.
