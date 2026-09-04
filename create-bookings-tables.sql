-- ============================================================================
-- Script de création des tables pour le système de réservations de coaching
-- À exécuter UNE FOIS dans le SQL Editor de Supabase Dashboard
-- ============================================================================
-- Ce script est idempotent : il peut être ré-exécuté sans risque d'erreur.

-- 1) Table des créneaux horaires configurés par le coach
CREATE TABLE IF NOT EXISTS coaching_slots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL,
  start_time TEXT NOT NULL, -- Format 'HH:MM' ex: '14:00'
  is_active BOOLEAN NOT NULL DEFAULT true, -- true = ouvert par le coach, false = fermé
  is_booked BOOLEAN NOT NULL DEFAULT false, -- true = déjà réservé par un élève
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT unique_slot_date_time UNIQUE (date, start_time)
);

-- Index pour accélérer la recherche des créneaux disponibles futurs
CREATE INDEX IF NOT EXISTS idx_coaching_slots_date_active 
  ON coaching_slots (date, is_active, is_booked);

-- 2) Table des réservations de coaching
CREATE TABLE IF NOT EXISTS coaching_bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  slot_id UUID REFERENCES coaching_slots(id) ON DELETE SET NULL,
  plan_id TEXT NOT NULL, -- 'session', 'pro', 'performance'
  plan_name TEXT NOT NULL,
  plan_price TEXT NOT NULL,
  plan_duration TEXT NOT NULL,
  booking_date DATE NOT NULL,
  booking_time TEXT NOT NULL,
  student_name TEXT NOT NULL,
  student_email TEXT NOT NULL,
  student_discord TEXT NOT NULL,
  game TEXT NOT NULL,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'completed', 'rescheduled', 'cancelled')),
  admin_notes TEXT,
  read_by_admin BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour les recherches par élève, par statut et par date
CREATE INDEX IF NOT EXISTS idx_coaching_bookings_user 
  ON coaching_bookings (user_id);
CREATE INDEX IF NOT EXISTS idx_coaching_bookings_email 
  ON coaching_bookings (student_email);
CREATE INDEX IF NOT EXISTS idx_coaching_bookings_status_date 
  ON coaching_bookings (status, booking_date);
CREATE INDEX IF NOT EXISTS idx_coaching_bookings_unread 
  ON coaching_bookings (read_by_admin) WHERE read_by_admin = false;

-- 3) Activer Row Level Security (RLS)
ALTER TABLE coaching_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE coaching_bookings ENABLE ROW LEVEL SECURITY;

-- 4) Nettoyage des anciennes policies
DROP POLICY IF EXISTS "Public can view active unbooked slots" ON coaching_slots;
DROP POLICY IF EXISTS "Admins can view all slots" ON coaching_slots;
DROP POLICY IF EXISTS "Admins can manage slots" ON coaching_slots;
DROP POLICY IF EXISTS "Students can view their own bookings" ON coaching_bookings;
DROP POLICY IF EXISTS "Admins can manage all bookings" ON coaching_bookings;
DROP POLICY IF EXISTS "Service role can do everything on slots" ON coaching_slots;
DROP POLICY IF EXISTS "Service role can do everything on bookings" ON coaching_bookings;

-- 5) Policies coaching_slots
-- Tout le monde peut voir les créneaux ouverts pour réserver
CREATE POLICY "Public can view active unbooked slots" ON coaching_slots
  FOR SELECT
  USING (true);

-- Les admins ont tous les droits
CREATE POLICY "Admins can manage slots" ON coaching_slots
  FOR ALL
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
  );

-- 6) Policies coaching_bookings
-- Les élèves peuvent voir leurs propres réservations
CREATE POLICY "Students can view their own bookings" ON coaching_bookings
  FOR SELECT
  USING (
    auth.uid() = user_id
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
  );

-- Les admins ont tous les droits sur les réservations
CREATE POLICY "Admins can manage all bookings" ON coaching_bookings
  FOR ALL
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
  );

-- 7) Vérification
SELECT count(*) AS total_slots FROM coaching_slots;
SELECT count(*) AS total_bookings FROM coaching_bookings;
