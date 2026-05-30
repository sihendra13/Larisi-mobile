'use client';
import { useState } from 'react';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '@/lib/config';


const EyeIcon = ({ crossed }) => crossed
  ? <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
  : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>;

export default function LoginScreen({ onLoginSuccess, onGoRegister }) {
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

  return (
    <div className="bg-animated" style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '24px', position: 'relative', overflow: 'hidden', fontFamily: '-apple-system, sans-serif'
    }}>
      
      {/* Background Blobs for extra energy */}
      <div style={{
        position: 'absolute', top: '5%', left: '-5%', width: '300px', height: '300px',
        background: 'var(--m-brand)', filter: 'blur(100px)', opacity: 0.15, borderRadius: '50%',
        animation: 'float 8s ease-in-out infinite'
      }} />
      <div style={{
        position: 'absolute', bottom: '5%', right: '-5%', width: '250px', height: '250px',
        background: '#FF007A', filter: 'blur(120px)', opacity: 0.1, borderRadius: '50%',
        animation: 'float 6s ease-in-out infinite reverse'
      }} />

      {/* Login Card */}
      <div className="glass-card stagger-1" style={{
        width: '100%', maxWidth: '440px', borderRadius: '32px', padding: '40px 32px',
        display: 'flex', flexDirection: 'column', position: 'relative', zIndex: 10
      }}>
        
        {/* Logo */}
        <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '32px'}}>
          <img src="/logo_larisi.svg" alt="Larisi" style={{height: '36px', objectFit: 'contain'}} />
        </div>

        {/* Heading */}
        <div style={{marginBottom: '28px', textAlign: 'left'}}>
          <h1 style={{fontSize: '26px', fontWeight: '800', color: 'var(--m-ink)', marginBottom: '8px', letterSpacing: '-0.5px', margin: 0}}>
            Selamat Datang Kembali
          </h1>
          <p style={{fontSize: '15px', color: 'var(--m-ink-sub)', margin: '8px 0 0'}}>
            Masuk ke akun Larisi kamu
          </p>
        </div>

        <form onSubmit={handleLogin} style={{display: 'flex', flexDirection: 'column', gap: '20px'}}>
          
          {/* Email */}
          <div className="stagger-2">
            <label style={{display: 'block', fontSize: '13px', fontWeight: '700', color: 'var(--m-ink)', marginBottom: '8px'}}>
              Alamat Email
            </label>
            <div className="input-glow">
              <input type="email" placeholder="nama@email.com" className="input-field"
                value={email} onChange={e => setEmail(e.target.value)} required autoComplete="email" />
            </div>
          </div>

          {/* Password */}
          <div className="stagger-3">
            <label style={{display: 'block', fontSize: '13px', fontWeight: '700', color: 'var(--m-ink)', marginBottom: '8px'}}>
              Password
            </label>
            <div className="input-glow" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <input type={showPw ? 'text' : 'password'} placeholder="Masukkan password" className="input-field"
                value={password} onChange={e => setPassword(e.target.value)} required autoComplete="current-password" />
              <button type="button" onClick={() => setShowPw(p => !p)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: '#A0A0AB', display: 'flex', alignItems: 'center' }}>
                <EyeIcon crossed={showPw} />
              </button>
            </div>
          </div>

          {/* Remember me & Forgot Password */}
          <div className="stagger-4" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '4px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px', color: 'var(--m-ink-sub)', fontWeight: '500' }}>
              <input type="checkbox" checked={remember} onChange={e => setRemember(e.target.checked)}
                style={{ width: '16px', height: '16px', accentColor: 'var(--m-brand)', cursor: 'pointer', borderRadius: '4px' }} />
              Ingat saya
            </label>
            <a href="/login.html#forgot" style={{ fontSize: '13px', color: 'var(--m-brand)', textDecoration: 'none', fontWeight: '700' }}>
              Lupa password?
            </a>
          </div>

          {/* Error */}
          {error && (
            <div style={{
              background: '#FEF2F2', border: '1px solid #FCA5A5', borderRadius: '12px',
              padding: '12px 16px', marginTop: '8px',
              fontSize: '13px', color: '#DC2626', lineHeight: '1.5', fontWeight: '500'
            }}>
              {error}
            </div>
          )}

          {/* Submit Button */}
          <div className="stagger-5" style={{ marginTop: '12px' }}>
            <button type="submit" disabled={loading || !email || !password} style={{
              width: '100%', padding: '16px', borderRadius: '16px', background: loading || !email || !password ? '#E4E4EB' : '#111827', color: loading || !email || !password ? '#9ca3af' : '#fff',
              border: 'none', fontFamily: 'inherit', fontSize: '15px', fontWeight: '800',
              cursor: loading || !email || !password ? 'not-allowed' : 'pointer', boxShadow: loading || !email || !password ? 'none' : '0 8px 24px rgba(0, 0, 0, 0.15)',
              transition: 'all 0.2s cubic-bezier(0.25, 0.8, 0.25, 1)', transform: 'translateY(0)'
            }}
            onMouseDown={(e) => !(loading || !email || !password) && (e.currentTarget.style.transform = 'translateY(2px)')}
            onMouseUp={(e) => !(loading || !email || !password) && (e.currentTarget.style.transform = 'translateY(0)')}
            onMouseLeave={(e) => !(loading || !email || !password) && (e.currentTarget.style.transform = 'translateY(0)')}
            >
              {loading ? 'Masuk...' : 'Masuk'}
            </button>
          </div>

        </form>

        {/* Register Link */}
        <div className="stagger-6" style={{textAlign: 'center', marginTop: '24px'}}>
          <span style={{fontSize: '14px', color: 'var(--m-ink-sub)', fontWeight: '500'}}>Belum punya akun? </span>
          <button onClick={onGoRegister} style={{
            fontSize: '14px', fontWeight: '800', color: 'var(--m-brand)', textDecoration: 'none',
            background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', padding: 0
          }}>
            Daftar di sini
          </button>
        </div>

      </div>
    </div>
  );
}
