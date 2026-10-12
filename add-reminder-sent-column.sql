-- ============================================================================
-- Migration : Ajout de la colonne reminder_sent pour les rappels automatiques H-2
-- À exécuter dans le SQL Editor de Supabase Dashboard
-- ============================================================================

ALTER TABLE coaching_bookings ADD COLUMN IF NOT EXISTS reminder_sent BOOLEAN DEFAULT false;

-- Index pour accélérer le balayage du Cron Job toutes les 15 minutes
CREATE INDEX IF NOT EXISTS idx_coaching_bookings_reminder 
  ON coaching_bookings (booking_date, status, reminder_sent);
