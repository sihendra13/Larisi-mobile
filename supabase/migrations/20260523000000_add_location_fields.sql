-- Migration: Add kecamatan, kabupaten, provinsi to profiles
-- Dipakai untuk lokasi bisnis user yang lebih spesifik (onboarding step 2)
-- city tetap ada untuk backward compat (user lama)

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS kecamatan TEXT,
  ADD COLUMN IF NOT EXISTS kabupaten TEXT,
  ADD COLUMN IF NOT EXISTS provinsi  TEXT;
