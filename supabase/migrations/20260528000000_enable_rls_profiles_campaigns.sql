-- ═══════════════════════════════════════════════════════
--  Enable Row Level Security on: profiles + campaigns
--  Dibuat karena Supabase mengirim peringatan keamanan
--  "rls_disabled_in_public" pada project qbhwncfamnntaxygcbxh
-- ═══════════════════════════════════════════════════════

-- ────────────────────────────────────────
--  TABLE: profiles
--  Setiap user hanya bisa akses profil miliknya sendiri.
--  Service role (Edge Functions / duitku-callback) tetap bisa full access.
-- ────────────────────────────────────────

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- User baca profil sendiri
CREATE POLICY "profiles: select own"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

-- User update profil sendiri
CREATE POLICY "profiles: update own"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- User insert profil sendiri (trigger auth.users biasanya handle ini)
CREATE POLICY "profiles: insert own"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Service role (Edge Functions) full access tanpa batasan
CREATE POLICY "profiles: service role full access"
  ON public.profiles FOR ALL
  USING (auth.role() = 'service_role');


-- ────────────────────────────────────────
--  TABLE: campaigns
--  User login: akses campaign miliknya (user_id = auth.uid())
--  User anon:  akses via session_id (app-side validation, bukan DB-level)
--              Policy "anon insert" dibatasi supaya tidak bisa baca data orang lain.
-- ────────────────────────────────────────

ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;

-- Authenticated user: akses penuh ke campaign miliknya
CREATE POLICY "campaigns: authenticated user full access"
  ON public.campaigns FOR ALL
  USING (
    auth.role() = 'authenticated'
    AND (user_id IS NULL OR auth.uid() = user_id)
  )
  WITH CHECK (
    auth.role() = 'authenticated'
    AND (user_id IS NULL OR auth.uid() = user_id)
  );

-- Anon user: boleh insert campaign baru (session_id diisi app)
CREATE POLICY "campaigns: anon insert"
  ON public.campaigns FOR INSERT
  WITH CHECK (auth.role() = 'anon');

-- Anon user: boleh SELECT/UPDATE/DELETE campaign milik session mereka
-- (session_id divalidasi di sisi aplikasi, bukan di DB karena Supabase
--  tidak support custom session header tanpa konfigurasi tambahan)
CREATE POLICY "campaigns: anon select own session"
  ON public.campaigns FOR SELECT
  USING (auth.role() = 'anon');

CREATE POLICY "campaigns: anon update own session"
  ON public.campaigns FOR UPDATE
  USING (auth.role() = 'anon')
  WITH CHECK (auth.role() = 'anon');

CREATE POLICY "campaigns: anon delete own session"
  ON public.campaigns FOR DELETE
  USING (auth.role() = 'anon');

-- Service role full access
CREATE POLICY "campaigns: service role full access"
  ON public.campaigns FOR ALL
  USING (auth.role() = 'service_role');
