-- ==============================================================================
-- POULPY COACHING — SCRIPT DE VÉRIFICATION & SÉCURISATION COMPLÈTE (RLS / TABLES)
-- ==============================================================================
-- À exécuter dans le SQL Editor de votre Dashboard Supabase (https://app.supabase.com)
-- Ce script est idempotent (peut être relancé à tout moment sans risque).
-- ==============================================================================

-- 1. VÉRIFICATION & ACTIVATION DU ROW LEVEL SECURITY (RLS) SUR TOUTES LES TABLES
-- ==============================================================================
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'profiles') THEN
    ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'coaching_slots') THEN
    ALTER TABLE coaching_slots ENABLE ROW LEVEL SECURITY;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'coaching_bookings') THEN
    ALTER TABLE coaching_bookings ENABLE ROW LEVEL SECURITY;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'coaching_messages') THEN
    ALTER TABLE coaching_messages ENABLE ROW LEVEL SECURITY;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'student_sheets') THEN
    ALTER TABLE student_sheets ENABLE ROW LEVEL SECURITY;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'vod_clips') THEN
    ALTER TABLE vod_clips ENABLE ROW LEVEL SECURITY;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'vod_annotations') THEN
    ALTER TABLE vod_annotations ENABLE ROW LEVEL SECURITY;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'reviews') THEN
    ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'settings') THEN
    ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;


-- 2. POLITIQUES RLS TABLE 'PROFILES'
-- ==============================================================================
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'profiles') THEN
    DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
    DROP POLICY IF EXISTS "Users can update own profile or admin" ON profiles;
    DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;

    CREATE POLICY "Public profiles are viewable by everyone" ON profiles
      FOR SELECT
      USING (true);

    CREATE POLICY "Users can update own profile or admin" ON profiles
      FOR UPDATE
      TO authenticated
      USING (
        auth.uid() = id
        OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
      )
      WITH CHECK (
        auth.uid() = id
        OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
      );

    CREATE POLICY "Users can insert own profile" ON profiles
      FOR INSERT
      TO authenticated
      WITH CHECK (auth.uid() = id);
  END IF;
END $$;


-- 3. POLITIQUES RLS TABLE 'COACHING_SLOTS'
-- ==============================================================================
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'coaching_slots') THEN
    DROP POLICY IF EXISTS "Public can view active unbooked slots" ON coaching_slots;
    DROP POLICY IF EXISTS "Anyone can view slots" ON coaching_slots;
    DROP POLICY IF EXISTS "Admins can manage slots" ON coaching_slots;

    CREATE POLICY "Anyone can view slots" ON coaching_slots
      FOR SELECT
      USING (true);

    CREATE POLICY "Admins can manage slots" ON coaching_slots
      FOR ALL
      TO authenticated
      USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
      )
      WITH CHECK (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
      );
  END IF;
END $$;


-- 4. POLITIQUES RLS TABLE 'COACHING_BOOKINGS'
-- ==============================================================================
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'coaching_bookings') THEN
    DROP POLICY IF EXISTS "Students can view their own bookings" ON coaching_bookings;
    DROP POLICY IF EXISTS "Students view own bookings or admin" ON coaching_bookings;
    DROP POLICY IF EXISTS "Admins can manage all bookings" ON coaching_bookings;

    CREATE POLICY "Students view own bookings or admin" ON coaching_bookings
      FOR SELECT
      TO authenticated
      USING (
        auth.uid() = user_id
        OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
      );

    CREATE POLICY "Admins can manage all bookings" ON coaching_bookings
      FOR ALL
      TO authenticated
      USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
      )
      WITH CHECK (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
      );
  END IF;
END $$;


-- 5. POLITIQUES RLS TABLE 'COACHING_MESSAGES'
-- ==============================================================================
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'coaching_messages') THEN
    DROP POLICY IF EXISTS "Students can view own messages or admin" ON coaching_messages;
    DROP POLICY IF EXISTS "Students view own messages or admin" ON coaching_messages;
    DROP POLICY IF EXISTS "Admins have full access on messages" ON coaching_messages;

    CREATE POLICY "Students view own messages or admin" ON coaching_messages
      FOR SELECT
      TO authenticated
      USING (
        auth.uid() = student_id
        OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
      );

    CREATE POLICY "Admins have full access on messages" ON coaching_messages
      FOR ALL
      TO authenticated
      USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
      )
      WITH CHECK (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
      );
  END IF;
END $$;


-- 6. POLITIQUES RLS TABLE 'STUDENT_SHEETS'
-- ==============================================================================
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'student_sheets') THEN
    DROP POLICY IF EXISTS "Admins have full access on student_sheets" ON student_sheets;
    DROP POLICY IF EXISTS "Students can view their own sheet" ON student_sheets;

    CREATE POLICY "Students can view their own sheet" ON student_sheets
      FOR SELECT
      TO authenticated
      USING (student_id = auth.uid());

    CREATE POLICY "Admins have full access on student_sheets" ON student_sheets
      FOR ALL
      TO authenticated
      USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
      )
      WITH CHECK (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
      );
  END IF;
END $$;


-- 7. POLITIQUES RLS TABLE 'VOD_CLIPS' & 'VOD_ANNOTATIONS'
-- ==============================================================================
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'vod_clips') THEN
    DROP POLICY IF EXISTS "Students can view own clips or admin" ON vod_clips;
    DROP POLICY IF EXISTS "Students view own clips or admin" ON vod_clips;
    DROP POLICY IF EXISTS "Admins manage vod_clips" ON vod_clips;

    CREATE POLICY "Students view own clips or admin" ON vod_clips
      FOR SELECT
      TO authenticated
      USING (
        student_id = auth.uid()
        OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
      );

    CREATE POLICY "Admins manage vod_clips" ON vod_clips
      FOR ALL
      TO authenticated
      USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
      )
      WITH CHECK (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
      );
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'vod_annotations') THEN
    DROP POLICY IF EXISTS "View annotations for accessible clips" ON vod_annotations;
    DROP POLICY IF EXISTS "Admins manage vod_annotations" ON vod_annotations;

    CREATE POLICY "View annotations for accessible clips" ON vod_annotations
      FOR SELECT
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM vod_clips
          WHERE vod_clips.id = vod_annotations.clip_id
            AND (
              vod_clips.student_id = auth.uid()
              OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
            )
        )
      );

    CREATE POLICY "Admins manage vod_annotations" ON vod_annotations
      FOR ALL
      TO authenticated
      USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
      )
      WITH CHECK (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
      );
  END IF;
END $$;


-- 8. POLITIQUES RLS TABLE 'REVIEWS'
-- ==============================================================================
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'reviews') THEN
    DROP POLICY IF EXISTS "Anyone can read reviews" ON reviews;
    DROP POLICY IF EXISTS "Authenticated users can create reviews" ON reviews;
    DROP POLICY IF EXISTS "Owners or admins can update reviews" ON reviews;
    DROP POLICY IF EXISTS "Owners or admins can delete reviews" ON reviews;

    CREATE POLICY "Anyone can read reviews" ON reviews
      FOR SELECT
      USING (true);

    CREATE POLICY "Authenticated users can create reviews" ON reviews
      FOR INSERT
      TO authenticated
      WITH CHECK (auth.uid() = user_id);

    CREATE POLICY "Owners or admins can update reviews" ON reviews
      FOR UPDATE
      TO authenticated
      USING (
        auth.uid() = user_id
        OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
      )
      WITH CHECK (
        auth.uid() = user_id
        OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
      );

    CREATE POLICY "Owners or admins can delete reviews" ON reviews
      FOR DELETE
      TO authenticated
      USING (
        auth.uid() = user_id
        OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
      );
  END IF;
END $$;


-- 9. POLITIQUES RLS TABLE 'SETTINGS'
-- ==============================================================================
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'settings') THEN
    DROP POLICY IF EXISTS "Anyone can read settings" ON settings;
    DROP POLICY IF EXISTS "Only admins can update settings" ON settings;
    DROP POLICY IF EXISTS "Only admins can insert settings" ON settings;
    DROP POLICY IF EXISTS "Only admins can delete settings" ON settings;

    CREATE POLICY "Anyone can read settings" ON settings
      FOR SELECT
      USING (true);

    CREATE POLICY "Only admins can update settings" ON settings
      FOR UPDATE
      TO authenticated
      USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
      )
      WITH CHECK (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
      );

    CREATE POLICY "Only admins can insert settings" ON settings
      FOR INSERT
      TO authenticated
      WITH CHECK (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
      );

    CREATE POLICY "Only admins can delete settings" ON settings
      FOR DELETE
      TO authenticated
      USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
      );
  END IF;
END $$;

-- 10. RAPPORT FINAL DE STATUT DE SÉCURITÉ
SELECT 
  tablename, 
  rowsecurity AS rls_active 
FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY tablename;
