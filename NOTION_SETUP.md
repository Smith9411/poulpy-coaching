# Guide de Configuration — Synchronisation Notion Calendar & Réservations

Ce guide vous explique comment connecter votre système de réservation Poulpy Coaching à votre calendrier Notion en 3 étapes rapides (environ 3 minutes).

---

## 1. Créer l'intégration Notion (Clé API)

1. Rendez-vous sur [notion.so/my-integrations](https://www.notion.so/my-integrations).
2. Cliquez sur **"+ Nouvelle intégration"** (New integration).
3. Nommez-la : `Poulpy Coaching Calendar`.
4. Sélectionnez votre espace de travail Notion (Workspace).
5. Dans les autorisations (Capabilities) : cochez **Read content**, **Update content**, **Insert content**.
6. Cliquez sur **Enregistrer** (Save).
7. Copiez le **Secret d'intégration interne** (Internal Integration Secret, qui commence par `secret_...`).
   - C'est votre variable `NOTION_API_KEY`.

---

## 2. Créer la base de données Notion & Configurer les propriétés

Dans Notion, créez une nouvelle page avec une **Base de données - Pleine page** (ou vue Calendrier) nommée par exemple `🗓️ Planning Coaching Poulpy`.

Vérifiez que votre base possède les propriétés suivantes (noms exacts sensibles aux majuscules) :

| Nom de la propriété Notion | Type de propriété Notion | Description |
| :--- | :--- | :--- |
| **Name** *(ou Titre)* | `Titre` (Title) | Nom de la page généré automatiquement (`[VALORANT] Coaching - Pseudo`) |
| **Date** | `Date` | Date et heure de début & fin (compatible avec **Notion Calendar**) |
| **Statut** | `Sélection` (Select) | Options : `Confirmé`, `Reporté`, `Annulé`, `Terminé` |
| **Jeu** | `Sélection` (Select) | Options : `Valorant`, `Apex Legends` |
| **Formule** | `Texte` (Text) | Nom de la formule (`Session Unique`, `Pack Pro`, etc.) |
| **Discord** | `Texte` (Text) | Tag / Pseudo Discord de l'élève |
| **Email** | `E-mail` (Email) | Adresse email de l'élève |
| **Notes** | `Texte` (Text) | Notes et objectifs laissés par l'élève |

### Partager la base avec l'intégration :
1. Sur votre page de base de données Notion, cliquez sur le menu **`•••`** en haut à droite.
2. Cliquez sur **"Connexions"** (Connect to).
3. Sélectionnez votre intégration `Poulpy Coaching Calendar`.

### Récupérer l'ID de la base de données :
Copiez l'URL de votre base de données dans votre navigateur.
Exemple d'URL : `https://www.notion.so/monworkspace/a8b9c1d2e3f4a5b6c7d8e9f012345678?v=...`
L'ID est la suite de 32 caractères hexadécimaux située entre le dernier slash et le `?` :
`a8b9c1d2e3f4a5b6c7d8e9f012345678`.
- C'est votre variable `NOTION_BOOKINGS_DATABASE_ID`.

---

## 3. Renseigner les variables d'environnement

### En local (`.env.local`) :
Ajoutez les deux lignes suivantes dans votre fichier `.env.local` :
```env
NOTION_API_KEY=secret_votre_cle_secrete_notion_ici
NOTION_BOOKINGS_DATABASE_ID=votre_id_de_base_notion_ici
```

### Sur Vercel (Production) :
1. Allez sur votre dashboard **Vercel** > Projet `poulpy-coaching` > **Settings** > **Environment Variables**.
2. Ajoutez :
   - `NOTION_API_KEY` = votre clé secrète
   - `NOTION_BOOKINGS_DATABASE_ID` = votre ID de base
3. Redéployez ou laissez Vercel déployer automatiquement le prochain push.

---

## 4. Schéma SQL Supabase

Dans le **SQL Editor** de votre Dashboard Supabase, exécutez le script [add-notion-columns.sql](file:///C:/Users/tborg/.gemini/antigravity/scratch/poulpy-coaching/add-notion-columns.sql) :

```sql
ALTER TABLE coaching_bookings 
  ADD COLUMN IF NOT EXISTS notion_page_id TEXT;

CREATE INDEX IF NOT EXISTS idx_coaching_bookings_notion_page 
  ON coaching_bookings (notion_page_id) 
  WHERE notion_page_id IS NOT NULL;
```

---

## 5. Synchronisation Notion Calendar (Application PC & Mobile)

Pour voir tous vos rendez-vous directement dans l'application **Notion Calendar** (sur Mac, Windows, iOS, Android) :
1. Ouvrez l'application **Notion Calendar**.
2. Dans la barre latérale gauche, cliquez sur **"+ Ajouter une base de données Notion"**.
3. Sélectionnez votre base `🗓️ Planning Coaching Poulpy` (ou `Planning Coaching`).
4. Tous les créneaux s'affichent automatiquement avec l'heure exacte, le jeu et le nom de l'élève !

---

## 6. Synchronisation Bidirectionnelle Temps Réel (Notion ➔ Poulpy Coaching)

Pour que toute modification effectuée sur Notion (déplacement d'un créneau, changement d'heure, suppression) mette à jour le site et alerte l'élève :

1. Rendez-vous sur [notion.so/my-integrations](https://www.notion.so/my-integrations) et ouvrez votre intégration `Poulpy Coaching`.
2. Dans le menu de gauche, cliquez sur **"Webhooks"** (ou *Event Subscriptions*).
3. Renseignez l'URL de votre Webhook :
   `https://votre-domaine-poulpy.com/api/webhooks/notion`
4. Cochez les événements : **Page updated**, **Page deleted**, **Property values updated**.
5. Cliquez sur **Sauvegarder**.
6. Dès lors, tout déplacement dans Notion ou Notion Calendar mettra à jour automatiquement le site et enverra une alerte à l'élève !

