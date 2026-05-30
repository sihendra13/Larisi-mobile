'use client';
import { useState, useEffect } from 'react';

const EyeIcon = ({ crossed }) => crossed
  ? <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
  : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>;

const PLAN_LABELS = {
  freemium: 'Freemium – Gratis selamanya',
  starter:  'Starter – Coba 7 hari gratis',
  pro:      'Pro – Coba 7 hari gratis',
  trial:    'Pro – Coba 7 hari gratis',
};

export default function RegisterPreview() {
  const [email,     setEmail]     = useState('');
  const [password,  setPassword]  = useState('');
  const [showPw,    setShowPw]    = useState(false);
  const [terms,     setTerms]     = useState(false);
  const [isFocused, setIsFocused] = useState('');
  const [plan,      setPlan]      = useState('pro'); // Defaulting to pro for preview purposes

  const canSubmit = terms && email.trim() && password.length >= 8;

  return (
    <>
      <style dangerouslySetInnerHTML={{__html: `
        :root {
          --m-brand: #791ADB;
          --m-brand-glow: rgba(121, 26, 219, 0.5);
          --m-ink: #111827;
          --m-ink-sub: #6b7280;
        }
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
          100% { transform: translateY(0px); }
        }
        @keyframes slideUpFade {
          0% { opacity: 0; transform: translateY(40px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        
        .bg-animated {
          background: linear-gradient(-45deg, #F9F9FB, #EBE8F4, #D5C2E8, #F9F9FB);
          background-size: 400% 400%;
          animation: gradientShift 15s ease infinite;
        }

        .glass-card {
          background: rgba(255, 255, 255, 0.85);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid rgba(255, 255, 255, 0.4);
          box-shadow: 0 16px 40px rgba(108, 92, 231, 0.1);
        }

        .input-glow {
          transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
          background: #fff;
          border-radius: 16px;
          border: 1.5px solid #E4E4EB;
          padding: 16px;
        }
        .input-glow:focus-within {
          border-color: var(--m-brand) !important;
          box-shadow: 0 0 0 4px rgba(121, 26, 219, 0.15) !important;
          transform: translateY(-2px);
        }

        .input-field {
          border: none;
          background: transparent;
          width: 100%;
          outline: none;
          font-family: inherit;
          font-size: 15px;
          color: var(--m-ink);
          font-weight: 500;
        }
        .input-field::placeholder {
          color: #9ca3af;
        }

        .stagger-1 { animation: slideUpFade 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.1s forwards; opacity: 0; }
        .stagger-2 { animation: slideUpFade 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.2s forwards; opacity: 0; }
        .stagger-3 { animation: slideUpFade 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.3s forwards; opacity: 0; }
        .stagger-4 { animation: slideUpFade 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.4s forwards; opacity: 0; }
        .stagger-5 { animation: slideUpFade 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.5s forwards; opacity: 0; }
        .stagger-6 { animation: slideUpFade 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.6s forwards; opacity: 0; }
      `}} />

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

        {/* Register Card */}
        <div className="glass-card" style={{
          width: '100%', maxWidth: '440px', borderRadius: '32px', padding: '40px 32px',
          display: 'flex', flexDirection: 'column', position: 'relative', zIndex: 10
        }}>
          
          {/* Logo */}
          <div className="stagger-1" style={{display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '32px'}}>
            <img src="/logo_larisi.svg" alt="Larisi" style={{height: '36px', objectFit: 'contain'}} />
          </div>

          {/* Heading */}
          <div className="stagger-2" style={{marginBottom: '28px', textAlign: 'left'}}>
            <h1 style={{fontSize: '26px', fontWeight: '800', color: 'var(--m-ink)', marginBottom: '8px', letterSpacing: '-0.5px', margin: 0}}>
              Mulai Uji Coba Gratis
            </h1>
          </div>

          {/* Plan badge */}
          {plan && PLAN_LABELS[plan] && (
            <div className="stagger-3" style={{
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

          {/* Form Fields */}
          <div className="stagger-4" style={{display: 'flex', flexDirection: 'column', gap: '20px'}}>

            {/* Email */}
            <div>
              <label style={{display: 'block', fontSize: '13px', fontWeight: '700', color: 'var(--m-ink)', marginBottom: '8px'}}>
                Alamat Email
              </label>
              <div className="input-glow">
                <input type="email" placeholder="budi@contoh.com" className="input-field"
                  value={email} onChange={e => setEmail(e.target.value)} />
              </div>
            </div>

            {/* Password */}
            <div>
              <label style={{display: 'block', fontSize: '13px', fontWeight: '700', color: 'var(--m-ink)', marginBottom: '8px'}}>
                Password
              </label>
              <div className="input-glow" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <input type={showPw ? 'text' : 'password'} placeholder="Minimal 8 karakter" className="input-field"
                  value={password} onChange={e => setPassword(e.target.value)} />
                <button type="button" onClick={() => setShowPw(p => !p)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: '#A0A0AB', display: 'flex', alignItems: 'center' }}>
                  <EyeIcon crossed={showPw} />
                </button>
              </div>
            </div>

          </div>

          {/* Terms */}
          <div className="stagger-5" style={{ marginTop: '24px', marginBottom: '32px' }}>
            <label style={{
              display: 'flex', alignItems: 'flex-start', gap: '12px', cursor: 'pointer',
            }}>
              <div style={{
                position: 'relative', width: '20px', height: '20px', flexShrink: 0, marginTop: '2px'
              }}>
                <input type="checkbox" checked={terms} onChange={e => setTerms(e.target.checked)}
                  style={{ 
                    width: '100%', height: '100%', accentColor: 'var(--m-brand)', cursor: 'pointer', 
                    borderRadius: '6px', border: '1.5px solid #E4E4EB'
                  }} />
              </div>
              <span style={{ fontSize: '13px', color: 'var(--m-ink-sub)', lineHeight: '1.6', fontWeight: '500' }}>
                Dengan mendaftar, Anda menyetujui{' '}
                <a href="#" style={{ color: 'var(--m-brand)', textDecoration: 'none', fontWeight: '700' }}>Syarat dan Ketentuan</a>
                {' '}serta{' '}
                <a href="#" style={{ color: 'var(--m-brand)', textDecoration: 'none', fontWeight: '700' }}>Kebijakan Privasi</a> kami.
              </span>
            </label>
          </div>

          {/* Submit Button */}
          <button className="stagger-6" style={{
            width: '100%', padding: '16px', borderRadius: '16px', 
            background: canSubmit ? '#111827' : '#E4E4EB', 
            color: canSubmit ? '#fff' : '#9ca3af',
            border: 'none', fontSize: '15px', fontWeight: '800',
            cursor: canSubmit ? 'pointer' : 'not-allowed', 
            boxShadow: canSubmit ? '0 8px 24px rgba(0, 0, 0, 0.15)' : 'none',
            transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)', 
            transform: 'translateY(0)'
          }}
          onMouseDown={(e) => canSubmit && (e.currentTarget.style.transform = 'translateY(2px)')}
          onMouseUp={(e) => canSubmit && (e.currentTarget.style.transform = 'translateY(0)')}
          onMouseLeave={(e) => canSubmit && (e.currentTarget.style.transform = 'translateY(0)')}
          >
            Buat Akun
          </button>

          {/* Login Link */}
          <div className="stagger-6" style={{textAlign: 'center', marginTop: '24px'}}>
            <span style={{fontSize: '14px', color: 'var(--m-ink-sub)', fontWeight: '500'}}>Sudah punya akun? </span>
            <a href="/v2/login-preview" style={{fontSize: '14px', fontWeight: '800', color: 'var(--m-brand)', textDecoration: 'none'}}>
              Masuk di sini
            </a>
          </div>

        </div>
      </div>
    </>
  );
}
