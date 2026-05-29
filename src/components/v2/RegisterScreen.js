'use client';
import { useState, useEffect } from 'react';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '@/lib/config';

const EyeIcon = ({ crossed }) => crossed
  ? <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
  : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>;

const PLAN_LABELS = {
  freemium: 'Freemium – Gratis selamanya',
  starter:  'Starter – Coba 7 hari gratis',
  pro:      'Pro – Coba 7 hari gratis',
  trial:    'Pro – Coba 7 hari gratis',
};

export default function RegisterScreen({ onRegisterSuccess, onGoLogin }) {
  const [firstName, setFirstName] = useState('');
  const [lastName,  setLastName]  = useState('');
  const [email,     setEmail]     = useState('');
  const [password,  setPassword]  = useState('');
  const [showPw,    setShowPw]    = useState(false);
  const [terms,     setTerms]     = useState(false);
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState('');
  const [plan,      setPlan]      = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const p = params.get('plan') || '';
      if (p) {
        setPlan(p);
        localStorage.setItem('larisi_selected_plan', p);
        localStorage.removeItem('larisi_trial_start');
      }
    }
  }, []);

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!terms) return;
    if (password.length < 8) { setError('Password minimal 8 karakter.'); return; }

    setLoading(true);
    setError('');

    try {
      const resp = await fetch(`${SUPABASE_URL}/auth/v1/signup`, {
        method: 'POST',
        headers: {
          'apikey':       SUPABASE_ANON_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.trim(),
          password,
          data: {
            first_name: firstName.trim(),
            last_name:  lastName.trim(),
            full_name:  `${firstName.trim()} ${lastName.trim()}`,
          },
        }),
      });

      const data = await resp.json();

      if (!resp.ok || data.error) {
        const msg = data.error_description || data.msg || data.error || 'Pendaftaran gagal';
        if (msg.includes('already registered') || msg.includes('already been registered'))
          setError('Email ini sudah terdaftar. Silakan masuk.');
        else if (msg.includes('password'))
          setError('Password terlalu lemah. Gunakan minimal 8 karakter.');
        else
          setError(msg);
        setLoading(false);
        return;
      }

      /* Jika email confirmation OFF → session langsung ada */
      if (data.access_token) {
        const session = {
          access_token:  data.access_token,
          token_type:    'bearer',
          expires_in:    data.expires_in || 3600,
          expires_at:    Math.floor(Date.now() / 1000) + (data.expires_in || 3600),
          refresh_token: data.refresh_token || '',
          user:          data.user,
        };
        localStorage.setItem('sb-mojzmlrdihenvfhrwopd-auth-token', JSON.stringify(session));
        onRegisterSuccess({ access_token: data.access_token, user: data.user, email: email.trim(), needsOtp: false });
        return;
      }

      /* Email confirmation ON → session ada di data.session */
      if (data.session?.access_token) {
        const session = {
          access_token:  data.session.access_token,
          token_type:    'bearer',
          expires_in:    data.session.expires_in || 3600,
          expires_at:    Math.floor(Date.now() / 1000) + (data.session.expires_in || 3600),
          refresh_token: data.session.refresh_token || '',
          user:          data.user,
        };
        localStorage.setItem('sb-mojzmlrdihenvfhrwopd-auth-token', JSON.stringify(session));
        onRegisterSuccess({ access_token: data.session.access_token, user: data.user, email: email.trim(), needsOtp: false });
        return;
      }

      /* Email confirmation aktif, belum ada session → masuk ke OTP step
         Supabase mengembalikan user object langsung (bukan di dalam data.user) */
      setError('');
      setLoading(false);
      const userObj = data.user || (data.id ? data : null);
      onRegisterSuccess({ access_token: null, user: userObj, email: email.trim(), needsOtp: true });

    } catch (err) {
      console.error('[register] error:', err);
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
  const labelStyle = {
    display: 'block', fontSize: '13px', fontWeight: '600',
    color: '#374151', marginBottom: '6px',
  };

  const canSubmit = terms && firstName.trim() && lastName.trim() && email.trim() && password.length >= 8;

  return (
    <div style={{
      minHeight: '100dvh', background: '#F9F9FA',
      fontFamily: 'var(--m-font, -apple-system, sans-serif)',
      overflowY: 'auto', display: 'flex',
      alignItems: 'flex-start', justifyContent: 'center',
    }}>
      <div style={{ width: '100%', maxWidth: '440px', padding: '32px 20px 80px' }}>

        {/* Card */}
        <div style={{
          background: '#fff', borderRadius: '20px', padding: '32px 28px',
          border: '1px solid #E4E4EB', boxShadow: '0 4px 32px rgba(0,0,0,0.07)',
          display: 'flex', flexDirection: 'column', gap: '0',
        }}>

          {/* Logo */}
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <img src="/logo_larisi.svg" alt="Larisi" style={{ height: '32px', width: 'auto' }} />
          </div>

          {/* Heading */}
          <div style={{ marginBottom: '20px' }}>
            <h1 style={{ margin: 0, fontSize: '22px', fontWeight: '800', color: '#111827', letterSpacing: '-0.3px' }}>
              Mulai Uji Coba Gratis
            </h1>
          </div>

          {/* Plan badge */}
          {plan && PLAN_LABELS[plan] && (
            <div style={{
              background: '#f4f0ff', border: '1px solid #7c3aed', borderRadius: '10px',
              padding: '10px 14px', marginBottom: '20px',
              fontSize: '13px', color: '#5b17b7',
              display: 'flex', alignItems: 'center', gap: '8px',
            }}>
              <span>🎯</span>
              <span>Paket dipilih: {PLAN_LABELS[plan]}</span>
            </div>
          )}

          <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

            {/* Nama Depan + Belakang */}
            <div style={{ display: 'flex', gap: '12px' }}>
              <div style={{ flex: 1 }}>
                <label style={labelStyle}>Nama Depan</label>
                <input
                  type="text" value={firstName} onChange={e => setFirstName(e.target.value)}
                  placeholder="Misal: Budi" required style={inputStyle}
                />
              </div>
              <div style={{ flex: 1 }}>
                <label style={labelStyle}>Nama Belakang</label>
                <input
                  type="text" value={lastName} onChange={e => setLastName(e.target.value)}
                  placeholder="Misal: Santoso" required style={inputStyle}
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label style={labelStyle}>Alamat Email</label>
              <input
                type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="budi@contoh.com" required autoComplete="email" style={inputStyle}
              />
            </div>

            {/* Password */}
            <div>
              <label style={labelStyle}>Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPw ? 'text' : 'password'}
                  value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="Minimal 8 karakter" required
                  autoComplete="new-password"
                  style={{ ...inputStyle, paddingRight: '44px' }}
                />
                <button
                  type="button" onClick={() => setShowPw(p => !p)}
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

            {/* Terms */}
            <label style={{
              display: 'flex', alignItems: 'flex-start', gap: '8px',
              fontSize: '13px', color: '#6b7280', lineHeight: '1.5', cursor: 'pointer',
            }}>
              <input
                type="checkbox" checked={terms} onChange={e => setTerms(e.target.checked)}
                style={{ width: '15px', height: '15px', marginTop: '2px', accentColor: '#7C3AED', cursor: 'pointer', flexShrink: 0 }}
              />
              <span>
                Dengan mendaftar, Anda menyetujui{' '}
                <a href="https://larisi.id/syarat-ketentuan" target="_blank" rel="noopener noreferrer"
                  style={{ color: '#7C3AED', textDecoration: 'none', fontWeight: '500' }}>
                  Syarat dan Ketentuan
                </a>{' '}serta{' '}
                <a href="https://larisi.id/kebijakan-privasi" target="_blank" rel="noopener noreferrer"
                  style={{ color: '#7C3AED', textDecoration: 'none', fontWeight: '500' }}>
                  Kebijakan Privasi
                </a>{' '}kami.
              </span>
            </label>

            {/* Error */}
            {error && (
              <div style={{
                background: '#FEF2F2', border: '1px solid #FCA5A5', borderRadius: '8px',
                padding: '10px 12px', fontSize: '13px', color: '#DC2626', lineHeight: '1.4',
              }}>
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading || !canSubmit}
              style={{
                width: '100%', padding: '14px', borderRadius: '12px',
                background: loading || !canSubmit ? '#E4E4EB' : '#111827',
                color: loading || !canSubmit ? '#9ca3af' : '#fff',
                border: 'none', fontSize: '15px', fontWeight: '700',
                cursor: loading || !canSubmit ? 'not-allowed' : 'pointer',
                fontFamily: 'inherit', transition: 'background 0.15s',
              }}
            >
              {loading ? 'Memproses...' : 'Create Account'}
            </button>
          </form>

          {/* Login link */}
          <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '13px', color: '#6b7280' }}>
            Sudah punya akun?{' '}
            <button
              onClick={onGoLogin}
              style={{
                background: 'none', border: 'none', padding: 0,
                color: '#7C3AED', fontWeight: '700', fontSize: '13px',
                cursor: 'pointer', fontFamily: 'inherit',
              }}
            >
              Masuk di sini
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
