-- ═══════════════════════════════════════════════════════
--  Notifikasi campaign tayang: push_subscriptions + notifications
--  Dipakai oleh Edge Function postforme-webhook untuk notify user
--  saat social.post.result.created (campaign berhasil/gagal publish)
-- ═══════════════════════════════════════════════════════

-- ────────────────────────────────────────
--  TABLE: push_subscriptions
--  Simpan Web Push subscription (endpoint + keys) per user per device.
--  Satu user bisa punya banyak device/browser → banyak row.
-- ────────────────────────────────────────
CREATE TABLE public.push_subscriptions (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  endpoint       text NOT NULL,
  p256dh         text NOT NULL,
  auth_key       text NOT NULL,
  user_agent     text,
  created_at     timestamptz NOT NULL DEFAULT now(),
  last_used_at   timestamptz,
  UNIQUE (endpoint)
);

CREATE INDEX idx_push_subscriptions_user_id ON public.push_subscriptions(user_id);

ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "push_subscriptions: authenticated user full access"
  ON public.push_subscriptions FOR ALL
  USING (auth.role() = 'authenticated' AND auth.uid() = user_id)
  WITH CHECK (auth.role() = 'authenticated' AND auth.uid() = user_id);

CREATE POLICY "push_subscriptions: service role full access"
  ON public.push_subscriptions FOR ALL
  USING (auth.role() = 'service_role');


-- ────────────────────────────────────────
--  TABLE: notifications
--  In-app notification log. Di-insert oleh Edge Function (service role),
--  di-subscribe realtime oleh client untuk tampilkan toast.
-- ────────────────────────────────────────
CREATE TABLE public.notifications (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  campaign_id     uuid REFERENCES public.campaigns(id) ON DELETE SET NULL,
  type            text NOT NULL DEFAULT 'campaign_published',
  title           text NOT NULL,
  body            text,
  platform        text,
  post_url        text,
  success         boolean NOT NULL DEFAULT true,
  error_message   text,
  is_read         boolean NOT NULL DEFAULT false,
  created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_notifications_user_id_created ON public.notifications(user_id, created_at DESC);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "notifications: select own"
  ON public.notifications FOR SELECT
  USING (auth.role() = 'authenticated' AND auth.uid() = user_id);

CREATE POLICY "notifications: update own (mark read)"
  ON public.notifications FOR UPDATE
  USING (auth.role() = 'authenticated' AND auth.uid() = user_id)
  WITH CHECK (auth.role() = 'authenticated' AND auth.uid() = user_id);

CREATE POLICY "notifications: service role full access"
  ON public.notifications FOR ALL
  USING (auth.role() = 'service_role');

-- Pastikan table masuk publication realtime supaya client bisa subscribe
-- postgres_changes. Dibungkus try/catch supaya migration tidak gagal kalau
-- publication-nya FOR ALL TABLES (table baru otomatis included) atau nama
-- publication berbeda di project ini — cek manual di Database > Replication
-- kalau realtime listener tidak menerima event setelah deploy.
DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Skip ALTER PUBLICATION: %', SQLERRM;
END $$;
