// RADAR — config.js
// ═══════════════════════════════════════════════
// Centralized Configuration
// Isi semua konstanta di sini sebelum deploy.
// ═══════════════════════════════════════════════

var RADAR_CONFIG = {

  // ── Supabase ──────────────────────────────────
  // Dari: supabase.com → project → Settings → API
  SUPABASE_URL:      'https://mojzmlrdihenvfhrwopd.supabase.co',
  SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1vanptbHJkaWhlbnZmaHJ3b3BkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYxMzY1NTUsImV4cCI6MjA5MTcxMjU1NX0.GVFuu_GcvWQwgGg4rVvzwq1gocUwtqhtTCsl8xja8l8',

  // ── SiLaris AI (Claude API) ───────────────────
  // Dari: console.anthropic.com → API Keys
  ANTHROPIC_API_KEY: '',

  // ── PostForMe.dev ─────────────────────────────
  // API key TIDAK disimpan di sini — ada di Supabase env var (aman)
  // Semua call ke PostForMe lewat Edge Function postforme-proxy

  // ── App Settings ──────────────────────────────
  LAUNCH_COOLDOWN_MS:  30000,  // 30 detik antar launch
  INSIGHT_COOLDOWN_MS: 10000,  // 10 detik antar AI insight request
  MAX_CAPTION_LENGTH:  2000,
  MAX_STITCH_LENGTH:   200,

  // ── Feature Flags ─────────────────────────────
  // Set false untuk disable fitur tanpa hapus kode
  FEATURES: {
    social_publish:  true,
    ai_insight:      true,
    export_pdf:      true,
    export_creative: true
  }

};

// Expose globally
window.RADAR_CONFIG = RADAR_CONFIG;
