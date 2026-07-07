-- Migration: Add scheduled_at column to campaigns table
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS scheduled_at timestamptz DEFAULT NULL
