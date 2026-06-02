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
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [showPw,   setShowPw]   = useState(false);
  const [terms,    setTerms]    = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');
  const [plan,     setPlan]     = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      /* Baca dari URL param dulu, fallback ke localStorage
         (iOS PWA: localStorage terpisah dari Safari, sudah diset di page.js) */
      const p = params.get('plan') || localStorage.getItem('larisi_selected_plan') || '';
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

      /* Email confirmation OFF → session langsung ada */
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

      /* Email confirmation aktif, belum ada session → OTP step */
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

  const canSubmit = terms && email.trim() && password.length >= 8;

  return (
    <div className="bg-animated" style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '24px', position: 'relative', overflowY: 'auto', fontFamily: '-apple-system, sans-serif'
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

      {/* Register Card */}
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
            Mulai Uji Coba Gratis
          </h1>
          <p style={{ margin: '8px 0 0', fontSize: '14px', color: 'var(--m-ink-sub)', lineHeight: '1.5' }}>
            Daftar sekarang, gratis. Nama dan info bisnis diisi di langkah berikutnya.
          </p>
        </div>

        {/* Plan badge */}
        {plan && PLAN_LABELS[plan] && (
          <div className="stagger-2" style={{
            background: 'linear-gradient(90deg, rgba(121,26,219,0.1) 0%, rgba(121,26,219,0.05) 100%)', 
            border: '1px solid rgba(121,26,219,0.2)', 
            borderRadius: '16px', padding: '12px 16px', marginBottom: '24px',
            fontSize: '14px', color: 'var(--m-brand)', fontWeight: '600',
            display: 'flex', alignItems: 'center', gap: '10px',
          }}>
            <span style={{ fontSize: '18px' }}>🎯</span>
            <span>Paket dipilih: {PLAN_LABELS[plan]}</span>
          </div>
        )}

        <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

          {/* Email */}
          <div className="stagger-3">
            <label style={{display: 'block', fontSize: '13px', fontWeight: '700', color: 'var(--m-ink)', marginBottom: '8px'}}>
              Alamat Email
            </label>
            <div className="input-glow">
              <input type="email" placeholder="nama@email.com" className="input-field"
                value={email} onChange={e => setEmail(e.target.value)} required autoComplete="email" />
            </div>
          </div>

          {/* Password */}
          <div className="stagger-4">
            <label style={{display: 'block', fontSize: '13px', fontWeight: '700', color: 'var(--m-ink)', marginBottom: '8px'}}>
              Password
            </label>
            <div className="input-glow" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <input type={showPw ? 'text' : 'password'} placeholder="Minimal 8 karakter" className="input-field"
                value={password} onChange={e => setPassword(e.target.value)} required autoComplete="new-password" />
              <button type="button" onClick={() => setShowPw(p => !p)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: '#A0A0AB', display: 'flex', alignItems: 'center' }}>
                <EyeIcon crossed={showPw} />
              </button>
            </div>
          </div>

          {/* Terms */}
          <div className="stagger-5" style={{ marginTop: '4px' }}>
            <label style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', cursor: 'pointer' }}>
              <div style={{ position: 'relative', width: '20px', height: '20px', flexShrink: 0, marginTop: '2px' }}>
                <input type="checkbox" checked={terms} onChange={e => setTerms(e.target.checked)}
                  style={{ width: '100%', height: '100%', accentColor: 'var(--m-brand)', cursor: 'pointer', borderRadius: '6px', border: '1.5px solid #E4E4EB' }} />
              </div>
              <span style={{ fontSize: '13px', color: 'var(--m-ink-sub)', lineHeight: '1.6', fontWeight: '500' }}>
                Dengan mendaftar, Anda menyetujui{' '}
                <a href="https://larisi.id/syarat-ketentuan" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--m-brand)', textDecoration: 'none', fontWeight: '700' }}>Syarat dan Ketentuan</a>
                {' '}serta{' '}
                <a href="https://larisi.id/kebijakan-privasi" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--m-brand)', textDecoration: 'none', fontWeight: '700' }}>Kebijakan Privasi</a> kami.
              </span>
            </label>
          </div>

          {/* Error */}
          {error && (
            <div style={{
              background: '#FEF2F2', border: '1px solid #FCA5A5', borderRadius: '12px',
              padding: '12px 16px', fontSize: '13px', color: '#DC2626', lineHeight: '1.5', fontWeight: '500'
            }}>
              {error}
            </div>
          )}

          {/* Submit Button */}
          <div className="stagger-6" style={{ marginTop: '8px' }}>
            <style>{`@keyframes btnSpin { to { transform: rotate(360deg); } }`}</style>
            <button type="submit" disabled={loading || !canSubmit} style={{
              width: '100%', padding: '16px', borderRadius: '16px', 
              background: loading || !canSubmit ? '#E4E4EB' : '#111827', 
              color: loading || !canSubmit ? '#9ca3af' : '#fff',
              border: 'none', fontSize: '15px', fontWeight: '800', fontFamily: 'inherit',
              cursor: loading || !canSubmit ? 'not-allowed' : 'pointer', 
              boxShadow: loading || !canSubmit ? 'none' : '0 8px 24px rgba(0, 0, 0, 0.15)',
              transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)', transform: 'translateY(0)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
            }}
            onMouseDown={(e) => !(loading || !canSubmit) && (e.currentTarget.style.transform = 'translateY(2px)')}
            onMouseUp={(e) => !(loading || !canSubmit) && (e.currentTarget.style.transform = 'translateY(0)')}
            onMouseLeave={(e) => !(loading || !canSubmit) && (e.currentTarget.style.transform = 'translateY(0)')}
            >
              {loading ? (
                <>
                  <span>Memproses...</span>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ animation: 'btnSpin 1s linear infinite' }}>
                    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                  </svg>
                </>
              ) : (
                'Buat Akun'
              )}
            </button>
          </div>

        </form>

        {/* Login Link */}
        <div className="stagger-6" style={{textAlign: 'center', marginTop: '24px'}}>
          <span style={{fontSize: '14px', color: 'var(--m-ink-sub)', fontWeight: '500'}}>Sudah punya akun? </span>
          <button onClick={onGoLogin} style={{
            fontSize: '14px', fontWeight: '800', color: 'var(--m-brand)', textDecoration: 'none',
            background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', padding: 0
          }}>
            Masuk di sini
          </button>
        </div>

      </div>
    </div>
  );
}
