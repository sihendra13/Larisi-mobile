-- Tambah kolom plan_expires_at ke tabel profiles
-- Diisi otomatis oleh Edge Function duitku-callback setelah pembayaran sukses
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS plan_expires_at timestamptz DEFAULT NULL;
