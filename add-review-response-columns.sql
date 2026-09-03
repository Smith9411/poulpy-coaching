-- Script SQL pour ajouter les colonnes de réponse admin à la table reviews
-- À exécuter dans le SQL Editor de Supabase Dashboard

-- Ajouter la colonne pour la réponse admin
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS admin_response TEXT;

-- Ajouter la colonne pour la date de réponse admin
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS admin_response_at TIMESTAMP WITH TIME ZONE;

-- Vérifier que les colonnes ont été ajoutées
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'reviews' 
AND column_name IN ('admin_response', 'admin_response_at');
