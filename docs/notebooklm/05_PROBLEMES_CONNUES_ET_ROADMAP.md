# Source 5 : Problèmes Connus, Limitations & Roadmap — Poulpy Coaching

## 1. Problèmes Actuels et Points d'Attention
1. **OAuth Discord non finalisé côté Discord Developer Portal** :
   - Le code applicatif est opérationnel.
   - Il reste à vérifier la Redirect URL exacte : `https://[ID-PROJET].supabase.co/auth/v1/callback` dans le portail développeur Discord et à coller les clés secrètes dans Supabase.
2. **Absence de Paiement Automatique Intégré** :
   - Le système de réservation (`Booking`) enregistre les choix du client, mais le paiement doit s'effectuer de gré à gré via Discord ou PayPal.
3. **Statistiques Administrateur Épurées** :
   - `/admin/stats` dénombre actuellement les utilisateurs mais n'offre pas encore de courbes d'évolution financière ou d'heures de coaching.
4. **Formulaire de Contact Réorienté** :
   - La page `/contact` incite à rejoindre le Discord officiel plutôt que de proposer un formulaire email classique.

## 2. Roadmap & Améliorations Futures
- **Paiement Stripe Automatisé** : Règlement par carte bancaire ou Apple Pay directement lors de la réservation avec confirmation instantanée.
- **Leaderboard des Élèves** : Classement mensuel des progressions de rang (ex: +3 rangs ce mois-ci).
- **Journal de Progression Quotidien** : Graphiques d'évolution des scores de visée et du ratio K/D.
- **Calendrier de Réservation Interactif** : Synchronisation avec l'agenda Google du coach pour réservation directe de créneaux.
- **Notifications Push Généralisées aux Élèves** : Alertes dès qu'un nouveau message du coach ou une nouvelle annotation VOD est disponible.
