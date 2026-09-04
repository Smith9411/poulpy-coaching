# Source 4 : Application Mobile PWA, Splash Screen & Notifications — Poulpy Coaching

## 1. Pourquoi la technologie PWA ?
Plutôt que d'obliger les utilisateurs à télécharger une lourde application `.apk` ou à passer par les stores, Poulpy Coaching est une **Progressive Web App (PWA)** :
- **Installation en 1 clic** : Ajout direct sur l'écran d'accueil du téléphone depuis Safari ou Chrome.
- **Plein Écran** : Expérience native sans barre d'adresse.
- **Mises à Jour Instantanées** : Chaque amélioration du code ou déploiement est immédiatement disponible sur le téléphone de l'utilisateur sans aucune réinstallation.

## 2. Écran d'Ouverture Néon (Splash Screen)
- Logo Poulpy haute résolution centré dans son squircle.
- Lueur néon ambiante et pulsante aux couleurs violette/cyan/rose.
- Titre avec indicateur lumineux et barre de chargement animée (*shimmer*).
- Disparaît de façon fluide dès le chargement de l'authentification.
- Mémorisation de session (`sessionStorage`) : s'affiche au lancement de l'application mais ne dérange pas la navigation interne entre les pages.

## 3. Notifications Spécifiques Admin "Site Update"
- Détection automatique lorsqu'un nouveau déploiement ou mise à jour est en ligne.
- Réservé exclusivement aux comptes avec le rôle administrateur.
- Message : *"Site update — Le site a été mis à jour avec de nouveaux changements."*
- Remplace automatiquement les anciennes notifications d'update grâce au tag `site-update` et `renotify: true`.

## 4. Pastille Rouge sur l'Icône Mobile (Badging API)
- Lorsque l'application mobile reçoit une notification, une pastille rouge d'alerte apparaît directement sur l'icône de l'application sur le bureau du téléphone.
- La pastille s'efface automatiquement dès que le coach ouvre l'application ou clique sur la notification.
