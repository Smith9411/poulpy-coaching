-- Ajout des colonnes pour les réseaux sociaux des élèves (Discord, Twitch, YouTube, TikTok)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS discord TEXT DEFAULT NULL;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS twitch TEXT DEFAULT NULL;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS youtube TEXT DEFAULT NULL;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS tiktok TEXT DEFAULT NULL;
