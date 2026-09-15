-- Script SQL pour ajouter la colonne featured (avis affichés sur la page principale)
-- À exécuter dans le SQL Editor de Supabase Dashboard si vous souhaitez la colonne en dur

ALTER TABLE reviews ADD COLUMN IF NOT EXISTS featured BOOLEAN DEFAULT FALSE;

-- Vérification
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'reviews' 
AND column_name = 'featured';
