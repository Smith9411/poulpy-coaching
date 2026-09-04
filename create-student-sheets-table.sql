-- ==============================================================================
-- Table: student_sheets (Fiches personnalisées de suivi des élèves)
-- À exécuter dans le SQL Editor de votre Dashboard Supabase
-- ==============================================================================

CREATE TABLE IF NOT EXISTS student_sheets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT 'Fiche de suivi & objectifs',
  content TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_by UUID REFERENCES auth.users(id),
  CONSTRAINT unique_student_sheet UNIQUE (student_id)
);

-- Index pour accélérer les requêtes par élève
CREATE INDEX IF NOT EXISTS idx_student_sheets_student_id ON student_sheets(student_id);

-- Activer Row Level Security
ALTER TABLE student_sheets ENABLE ROW LEVEL SECURITY;

-- Politiques RLS :
-- 1. Les administrateurs peuvent tout faire (lecture, écriture, modification, suppression)
DROP POLICY IF EXISTS Admins have full access on student_sheets ON student_sheets;
CREATE POLICY Admins have full access on student_sheets
ON student_sheets
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid() AND profiles.is_admin = true
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid() AND profiles.is_admin = true
  )
);

-- 2. L'élève peut consulter sa propre fiche en lecture seule
DROP POLICY IF EXISTS Students can view their own sheet ON student_sheets;
CREATE POLICY Students can view their own sheet
ON student_sheets
FOR SELECT
TO authenticated
USING (
  student_id = auth.uid()
);

-- Vérification
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'student_sheets';
