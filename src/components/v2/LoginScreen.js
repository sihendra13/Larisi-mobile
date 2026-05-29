'use client';
import { useState } from 'react';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '@/lib/config';


const EyeIcon = ({ crossed }) => crossed
  ? <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
  : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>;

export default function LoginScreen({ onLoginSuccess }) {
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [showPw,   setShowPw]   = useState(false);
  const [remember, setRemember] = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password) return;
    setLoading(true);
    setError('');

    try {
      /* ── 1. Supabase Auth: sign in with password ── */
      const authResp = await fetch(
        `${SUPABASE_URL}/auth/v1/token?grant_type=password`,
        {
          method: 'POST',
          headers: {
            'apikey':       SUPABASE_ANON_KEY,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email: email.trim(), password }),
        }
      );
      const authData = await authResp.json();

      if (!authResp.ok || authData.error) {
        const msg = authData.error_description || authData.error || 'Login gagal';
        if (msg.includes('Invalid login') || msg.includes('invalid_grant'))
          setError('Email atau password salah. Periksa kembali dan coba lagi.');
        else if (msg.includes('Email not confirmed'))
          setError('Email belum dikonfirmasi. Cek inbox kamu.');
        else
          setError(msg);
        setLoading(false);
        return;
      }

      const { access_token, refresh_token, expires_in, user } = authData;

      /* ── 2. Simpan session ke localStorage (format Supabase JS v2) ── */
      const session = {
        access_token,
        token_type:    'bearer',
        expires_in:    expires_in || 3600,
        expires_at:    Math.floor(Date.now() / 1000) + (expires_in || 3600),
        refresh_token: refresh_token || '',
        user,
      };
      localStorage.setItem('sb-mojzmlrdihenvfhrwopd-auth-token', JSON.stringify(session));

      /* ── 3. Load profil bisnis dari DB ── */
      const profResp = await fetch(
        `${SUPABASE_URL}/rest/v1/profiles?id=eq.${user.id}&select=*`,
        {
          headers: {
            'apikey':        SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${access_token}`,
          },
        }
      );
      const profArr = await profResp.json();
      const profile = Array.isArray(profArr) ? profArr[0] : null;

      if (profile) {
        localStorage.setItem('radar_user_profile', JSON.stringify(profile));
        /* session_id: postforme_external_id atau fallback ke user.id */
        const sid = profile.postforme_external_id || user.id;
        localStorage.setItem('radar_session_id', sid);
        window.radarSessionId = sid;
      }

      onLoginSuccess({ access_token, user, profile });

    } catch (err) {
      console.error('[login] error:', err);
      setError('Terjadi kesalahan. Periksa koneksi internet kamu.');
      setLoading(false);
    }
  };

  const inputStyle = {
    width: '100%', padding: '12px 14px', fontSize: '15px',
    borderRadius: '10px', border: '1.5px solid #E4E4EB',
    outline: 'none', background: '#fff', boxSizing: 'border-box',
    fontFamily: 'inherit', color: '#111827',
    transition: 'border-color 0.15s',
  };

  return (
    <div style={{
      minHeight: '100dvh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      background: '#F9F9FA', padding: '24px 20px',
      fontFamily: 'var(--m-font, -apple-system, sans-serif)',
    }}>

      {/* Card */}
      <div style={{
        width: '100%', maxWidth: '400px',
        background: '#fff', borderRadius: '20px',
        padding: '32px 28px',
        boxShadow: '0 4px 32px rgba(0,0,0,0.07)',
        border: '1px solid #E4E4EB',
      }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <img src="/logo_larisi.svg" alt="Larisi" style={{ height: '32px', width: 'auto' }} />
        </div>

        {/* Heading */}
        <div style={{ marginBottom: '24px' }}>
          <h1 style={{ margin: 0, fontSize: '22px', fontWeight: '800', color: '#111827', letterSpacing: '-0.3px' }}>
            Selamat Datang Kembali
          </h1>
          <p style={{ margin: '6px 0 0', fontSize: '13px', color: '#6b7280' }}>
            Masuk ke akun Larisi kamu
          </p>
        </div>

        <form onSubmit={handleLogin}>

          {/* Email */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>
              Alamat Email
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="nama@email.com"
              required
              autoComplete="email"
              style={inputStyle}
            />
          </div>

          {/* Password */}
          <div style={{ marginBottom: '12px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPw ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Masukkan password"
                required
                autoComplete="current-password"
                style={{ ...inputStyle, paddingRight: '44px' }}
              />
              <button
                type="button"
                onClick={() => setShowPw(p => !p)}
                style={{
                  position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer', padding: '4px',
                  color: '#9ca3af', display: 'flex', alignItems: 'center',
                }}
              >
                <EyeIcon crossed={showPw} />
              </button>
            </div>
          </div>

          {/* Remember me + Lupa password */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px', color: '#374151' }}>
              <input
                type="checkbox"
                checked={remember}
                onChange={e => setRemember(e.target.checked)}
                style={{ width: '15px', height: '15px', accentColor: '#111827', cursor: 'pointer' }}
              />
              Ingat saya
            </label>
            <a
              href="/login.html#forgot"
              style={{ fontSize: '13px', color: '#7C3AED', textDecoration: 'none', fontWeight: '500' }}
            >
              Lupa password?
            </a>
          </div>

          {/* Error */}
          {error && (
            <div style={{
              background: '#FEF2F2', border: '1px solid #FCA5A5', borderRadius: '8px',
              padding: '10px 12px', marginBottom: '16px',
              fontSize: '13px', color: '#DC2626', lineHeight: '1.4',
            }}>
              {error}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading || !email || !password}
            style={{
              width: '100%', padding: '14px', borderRadius: '12px',
              background: loading || !email || !password ? '#E4E4EB' : '#111827',
              color: loading || !email || !password ? '#9ca3af' : '#fff',
              border: 'none', fontSize: '15px', fontWeight: '700',
              cursor: loading || !email || !password ? 'not-allowed' : 'pointer',
              fontFamily: 'inherit', transition: 'background 0.15s',
              letterSpacing: '0.01em',
            }}
          >
            {loading ? 'Masuk...' : 'Masuk'}
          </button>
        </form>

        {/* Register link */}
        <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '13px', color: '#6b7280' }}>
          Belum punya akun?{' '}
          <a href="/register.html" style={{ color: '#7C3AED', fontWeight: '700', textDecoration: 'none' }}>
            Daftar di sini
          </a>
        </div>
      </div>
    </div>
  );
}
