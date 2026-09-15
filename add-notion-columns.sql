-- ============================================================================
-- Script SQL d'ajout du champ Notion pour la table coaching_bookings
-- À exécuter dans le SQL Editor de Supabase Dashboard
-- ============================================================================

-- Ajoute la colonne notion_page_id pour relier la réservation au calendrier Notion
ALTER TABLE coaching_bookings 
  ADD COLUMN IF NOT EXISTS notion_page_id TEXT;

-- Index optionnel pour accélérer les recherches par page Notion
CREATE INDEX IF NOT EXISTS idx_coaching_bookings_notion_page 
  ON coaching_bookings (notion_page_id) 
  WHERE notion_page_id IS NOT NULL;
