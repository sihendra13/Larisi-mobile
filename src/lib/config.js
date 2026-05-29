// Supabase config untuk V2 (Next.js)
// Konstanta sama persis dengan V1 (src/js/config.js)

export const SUPABASE_URL      = 'https://mojzmlrdihenvfhrwopd.supabase.co';
export const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1vanptbHJkaWhlbnZmaHJ3b3BkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYxMzY1NTUsImV4cCI6MjA5MTcxMjU1NX0.GVFuu_GcvWQwgGg4rVvzwq1gocUwtqhtTCsl8xja8l8';

/**
 * Baca profil bisnis user dari localStorage.
 * Diisi oleh V1 login flow (supabase.js → getUserProfile → localStorage.setItem('radar_user_profile'))
 * V1 & V2 berbagi domain yang sama → localStorage sama.
 */
export function getProfile() {
  if (typeof window === 'undefined') return null;
  try { return JSON.parse(localStorage.getItem('radar_user_profile') || 'null'); } catch { return null; }
}

/**
 * Baca session_id dari localStorage.
 * Dipakai untuk filter query campaigns (RLS: session_id = eq.{radarSessionId})
 */
export function getSessionId() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('radar_session_id') || null;
}

/**
 * Baca Supabase JWT access_token dari localStorage.
 * Key: sb-{project-ref}-auth-token  →  { access_token, refresh_token, ... }
 */
export function getAccessToken() {
  if (typeof window === 'undefined') return null;
  try {
    const s = JSON.parse(localStorage.getItem('sb-mojzmlrdihenvfhrwopd-auth-token') || 'null');
    return s?.access_token || null;
  } catch { return null; }
}

/** Format angka reach untuk display: 1200 → "1.2rb", 50000 → "50rb" */
export function fmtViews(n) {
  if (!n || n < 1) return '0';
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace('.0', '') + 'jt';
  if (n >= 1_000)     return (n / 1_000).toFixed(1).replace('.0', '')    + 'rb';
  return String(n);
}
