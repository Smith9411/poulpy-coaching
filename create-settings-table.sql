-- ============================================================================
-- Script de création de la table 'settings' pour les paramètres du site
-- À exécuter UNE FOIS dans le SQL Editor de Supabase Dashboard
-- ============================================================================
-- Ce script est idempotent : il peut être ré-exécuté sans erreur.

-- 1) Créer la table si elle n'existe pas
CREATE TABLE IF NOT EXISTS settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  value TEXT NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2) Insérer les valeurs par défaut (uniquement si la clé n'existe pas déjà)
INSERT INTO settings (key, value) VALUES
  ('site_name', 'Poulpy Coaching'),
  ('description', 'Coaching compétitif pour joueurs Valorant, Apex Legends et passionnés d''aim.'),
  ('contact_email', 'poulpy.coaching@gmail.com'),
  ('discord_url', 'https://discord.gg/rJMg3ZZRkp'),
  ('youtube_url', 'https://www.youtube.com/watch?v=4gfWbGCA5q0'),
  ('twitch_url', 'https://www.twitch.tv/poulpy_coaching')
ON CONFLICT (key) DO NOTHING;

-- 3) Activer RLS
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- 4) Supprimer les anciennes policies pour les recréer proprement
DROP POLICY IF EXISTS "Anyone can read settings" ON settings;
DROP POLICY IF EXISTS "Only admins can update settings" ON settings;
DROP POLICY IF EXISTS "Only admins can insert settings" ON settings;
DROP POLICY IF EXISTS "Only admins can delete settings" ON settings;

-- 5) Lecture publique (les visiteurs ont besoin de lire les paramètres)
CREATE POLICY "Anyone can read settings" ON settings
  FOR SELECT
  USING (true);

-- 6) Écriture réservée aux admins
-- Note: le service_role de Supabase bypass RLS automatiquement,
-- donc l'API backend peut toujours écrire même avec une policy stricte.
CREATE POLICY "Only admins can update settings" ON settings
  FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
  );

CREATE POLICY "Only admins can insert settings" ON settings
  FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
  );

CREATE POLICY "Only admins can delete settings" ON settings
  FOR DELETE
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
  );

-- 7) Vérification
SELECT key, value, updated_at FROM settings ORDER BY key;