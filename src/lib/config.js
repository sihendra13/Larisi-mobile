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

/**
 * Refresh access token menggunakan refresh_token dari localStorage.
 * Return access_token baru, atau null kalau gagal.
 */
export async function refreshAccessToken() {
  if (typeof window === 'undefined') return null;
  try {
    const s = JSON.parse(localStorage.getItem('sb-mojzmlrdihenvfhrwopd-auth-token') || 'null');
    if (!s?.refresh_token) return null;
    const resp = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=refresh_token`, {
      method: 'POST',
      headers: { 'apikey': SUPABASE_ANON_KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: s.refresh_token }),
    });
    if (!resp.ok) return null;
    const data = await resp.json();
    if (!data.access_token) return null;
    const newSession = { ...s, access_token: data.access_token, refresh_token: data.refresh_token || s.refresh_token, expires_at: Math.floor(Date.now() / 1000) + (data.expires_in || 3600) };
    localStorage.setItem('sb-mojzmlrdihenvfhrwopd-auth-token', JSON.stringify(newSession));
    return data.access_token;
  } catch { return null; }
}

/**
 * Baca access token — auto refresh kalau expired.
 */
export async function getValidAccessToken() {
  if (typeof window === 'undefined') return null;
  try {
    const s = JSON.parse(localStorage.getItem('sb-mojzmlrdihenvfhrwopd-auth-token') || 'null');
    if (!s?.access_token) return null;
    const expiresAt = s.expires_at || 0;
    const now = Math.floor(Date.now() / 1000);
    if (expiresAt - now > 60) return s.access_token; // masih valid
    return await refreshAccessToken(); // expired → refresh
  } catch { return null; }
}

/** Format angka reach untuk display: 1200 → "1.2rb", 50000 → "50rb" */
export function fmtViews(n) {
  if (!n || n < 1) return '0';
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace('.0', '') + 'jt';
  if (n >= 1_000)     return (n / 1_000).toFixed(1).replace('.0', '')    + 'rb';
  return String(n);
}
