-- ==============================================================================
-- POULPY COACHING — SCRIPT DE SÉCURISATION COMPLÈTE (RLS / TABLES)
-- ==============================================================================
-- Instructions : Copier TOUT le contenu et cliquer sur RUN dans le SQL Editor Supabase.
-- ==============================================================================

-- 1. ACTIVATION DU ROW LEVEL SECURITY (RLS) SUR TOUTES LES TABLES
-- ==============================================================================
ALTER TABLE IF EXISTS public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.coaching_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.coaching_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.coaching_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.student_sheets ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.vod_clips ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.vod_annotations ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.settings ENABLE ROW LEVEL SECURITY;


-- 2. POLITIQUES DE SÉCURITÉ : PROFILES
-- ==============================================================================
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile or admin" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;

CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles
  FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile or admin" ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = id
    OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true)
  )
  WITH CHECK (
    auth.uid() = id
    OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true)
  );

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);


-- 3. POLITIQUES DE SÉCURITÉ : COACHING_SLOTS
-- ==============================================================================
DROP POLICY IF EXISTS "Public can view active unbooked slots" ON public.coaching_slots;
DROP POLICY IF EXISTS "Anyone can view slots" ON public.coaching_slots;
DROP POLICY IF EXISTS "Admins can manage slots" ON public.coaching_slots;

CREATE POLICY "Anyone can view slots" ON public.coaching_slots
  FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage slots" ON public.coaching_slots
  FOR ALL
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true)
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true)
  );


-- 4. POLITIQUES DE SÉCURITÉ : COACHING_BOOKINGS
-- ==============================================================================
DROP POLICY IF EXISTS "Students can view their own bookings" ON public.coaching_bookings;
DROP POLICY IF EXISTS "Students view own bookings or admin" ON public.coaching_bookings;
DROP POLICY IF EXISTS "Admins can manage all bookings" ON public.coaching_bookings;

CREATE POLICY "Students view own bookings or admin" ON public.coaching_bookings
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = user_id
    OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true)
  );

CREATE POLICY "Admins can manage all bookings" ON public.coaching_bookings
  FOR ALL
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true)
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true)
  );


-- 5. POLITIQUES DE SÉCURITÉ : COACHING_MESSAGES
-- ==============================================================================
DROP POLICY IF EXISTS "Students can view own messages or admin" ON public.coaching_messages;
DROP POLICY IF EXISTS "Students view own messages or admin" ON public.coaching_messages;
DROP POLICY IF EXISTS "Admins have full access on messages" ON public.coaching_messages;

CREATE POLICY "Students view own messages or admin" ON public.coaching_messages
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = student_id
    OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true)
  );

CREATE POLICY "Admins have full access on messages" ON public.coaching_messages
  FOR ALL
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true)
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true)
  );


-- 6. POLITIQUES DE SÉCURITÉ : STUDENT_SHEETS
-- ==============================================================================
DROP POLICY IF EXISTS "Admins have full access on student_sheets" ON public.student_sheets;
DROP POLICY IF EXISTS "Students can view their own sheet" ON public.student_sheets;

CREATE POLICY "Students can view their own sheet" ON public.student_sheets
  FOR SELECT
  TO authenticated
  USING (student_id = auth.uid());

CREATE POLICY "Admins have full access on student_sheets" ON public.student_sheets
  FOR ALL
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true)
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true)
  );


-- 7. POLITIQUES DE SÉCURITÉ : VOD_CLIPS & VOD_ANNOTATIONS
-- ==============================================================================
DROP POLICY IF EXISTS "Students can view own clips or admin" ON public.vod_clips;
DROP POLICY IF EXISTS "Students view own clips or admin" ON public.vod_clips;
DROP POLICY IF EXISTS "Admins manage vod_clips" ON public.vod_clips;

CREATE POLICY "Students view own clips or admin" ON public.vod_clips
  FOR SELECT
  TO authenticated
  USING (
    student_id = auth.uid()
    OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true)
  );

CREATE POLICY "Admins manage vod_clips" ON public.vod_clips
  FOR ALL
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true)
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true)
  );

DROP POLICY IF EXISTS "View annotations for accessible clips" ON public.vod_annotations;
DROP POLICY IF EXISTS "Admins manage vod_annotations" ON public.vod_annotations;

CREATE POLICY "View annotations for accessible clips" ON public.vod_annotations
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.vod_clips
      WHERE public.vod_clips.id = public.vod_annotations.clip_id
        AND (
          public.vod_clips.student_id = auth.uid()
          OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true)
        )
    )
  );

CREATE POLICY "Admins manage vod_annotations" ON public.vod_annotations
  FOR ALL
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true)
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true)
  );


-- 8. POLITIQUES DE SÉCURITÉ : REVIEWS
-- ==============================================================================
DROP POLICY IF EXISTS "Anyone can read reviews" ON public.reviews;
DROP POLICY IF EXISTS "Authenticated users can create reviews" ON public.reviews;
DROP POLICY IF EXISTS "Owners or admins can update reviews" ON public.reviews;
DROP POLICY IF EXISTS "Owners or admins can delete reviews" ON public.reviews;

CREATE POLICY "Anyone can read reviews" ON public.reviews
  FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create reviews" ON public.reviews
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Owners or admins can update reviews" ON public.reviews
  FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = user_id
    OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true)
  )
  WITH CHECK (
    auth.uid() = user_id
    OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true)
  );

CREATE POLICY "Owners or admins can delete reviews" ON public.reviews
  FOR DELETE
  TO authenticated
  USING (
    auth.uid() = user_id
    OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true)
  );


-- 9. POLITIQUES DE SÉCURITÉ : SETTINGS
-- ==============================================================================
DROP POLICY IF EXISTS "Anyone can read settings" ON public.settings;
DROP POLICY IF EXISTS "Only admins can update settings" ON public.settings;
DROP POLICY IF EXISTS "Only admins can insert settings" ON public.settings;
DROP POLICY IF EXISTS "Only admins can delete settings" ON public.settings;

CREATE POLICY "Anyone can read settings" ON public.settings
  FOR SELECT
  USING (true);

CREATE POLICY "Only admins can update settings" ON public.settings
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true)
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true)
  );

CREATE POLICY "Only admins can insert settings" ON public.settings
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true)
  );

CREATE POLICY "Only admins can delete settings" ON public.settings
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true)
  );


-- 10. RAPPORT FINAL DE STATUT DE SÉCURITÉ
-- ==============================================================================
SELECT 
  tablename, 
  rowsecurity AS rls_active 
FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY tablename;
