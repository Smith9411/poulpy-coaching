-- ============================================================================
-- Ajout de la colonne updated_at à la table reviews
-- Pour la feature d'édition des avis (5 min après publication)
-- À exécuter dans le SQL Editor de Supabase
-- ============================================================================

ALTER TABLE reviews
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE;

-- Initialiser updated_at = created_at pour les avis existants
UPDATE reviews
SET updated_at = created_at
WHERE updated_at IS NULL;

-- Vérification
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'reviews'
ORDER BY ordinal_position;