'use client';
import { useState, useEffect } from 'react';

const LarisEnergeticLogo = ({ size = 120 }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="100" height="100" rx="20" fill="var(--m-brand)"/>
    
    {/* Thick L with tail */}
    <path d="M 32 35 L 44 35 L 44 53 L 75 53 L 75 65 L 42 65 L 32 80 Z" fill="white"/>
    
    {/* Thin chat bubble outline connecting top to right */}
    <path d="M 48 20 L 65 20 Q 75 20 75 30 L 75 53" fill="none" stroke="white" strokeWidth="6" strokeLinecap="round" />
    
    {/* Sparkles */}
    <path d="M 22 10 Q 22 22 10 22 Q 22 22 22 34 Q 22 22 34 22 Q 22 22 22 10 Z" fill="white"/>
    <path d="M 38 4 Q 38 10 32 10 Q 38 10 38 16 Q 38 10 44 10 Q 38 10 38 4 Z" fill="white"/>
    <path d="M 38 24 Q 38 30 32 30 Q 38 30 38 36 Q 38 30 44 30 Q 38 30 38 24 Z" fill="white"/>
  </svg>
);

export default function LoginPreview() {
  const [showSplash, setShowSplash] = useState(true);
  const [splashFadeOut, setSplashFadeOut] = useState(false);
  const [isFocused, setIsFocused] = useState('');

  useEffect(() => {
    // Show splash for 2.5 seconds, then fade out
    const timer1 = setTimeout(() => setSplashFadeOut(true), 2500);
    // After fade out completes, remove splash
    const timer2 = setTimeout(() => setShowSplash(false), 3000);
    
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);

  return (
    <>
      <style dangerouslySetInnerHTML={{__html: `
        :root {
          --m-brand-glow: rgba(121, 26, 219, 0.5); /* Matching #791ADB */
        }
        @keyframes pulseLogo {
          0% { transform: scale(1); box-shadow: 0 0 0 0 var(--m-brand-glow); }
          50% { transform: scale(1.05); box-shadow: 0 0 40px 10px var(--m-brand-glow); }
          100% { transform: scale(1); box-shadow: 0 0 0 0 var(--m-brand-glow); }
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
        }
        .input-glow:focus-within {
          border-color: var(--m-brand) !important;
          box-shadow: 0 0 0 4px rgba(123, 59, 153, 0.15) !important;
          transform: translateY(-2px);
        }

        .stagger-1 { animation: slideUpFade 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.1s forwards; opacity: 0; }
        .stagger-2 { animation: slideUpFade 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.2s forwards; opacity: 0; }
        .stagger-3 { animation: slideUpFade 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.3s forwards; opacity: 0; }
        .stagger-4 { animation: slideUpFade 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.4s forwards; opacity: 0; }
        .stagger-5 { animation: slideUpFade 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.5s forwards; opacity: 0; }
      `}} />

      {/* --- Splash Screen --- */}
      {showSplash && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: '#fff', zIndex: 999999,
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          transition: 'opacity 0.5s ease',
          opacity: splashFadeOut ? 0 : 1,
          pointerEvents: splashFadeOut ? 'none' : 'auto'
        }}>
          <div style={{ 
            animation: 'pulseLogo 2s infinite ease-in-out',
            borderRadius: '24px',
            marginBottom: '40px'
          }}>
            <LarisEnergeticLogo size={120} />
          </div>
          <div style={{
            fontFamily: 'var(--m-font)', fontWeight: '800', fontSize: '28px', color: 'var(--m-brand)',
            animation: 'float 3s ease-in-out infinite',
            letterSpacing: '-0.5px'
          }}>
            Larisi
          </div>
          <div style={{
            fontFamily: 'var(--m-font)', fontWeight: '500', fontSize: '14px', color: 'var(--m-ink-sub)',
            marginTop: '8px', opacity: 0.8
          }}>
            Mulai suksesmu hari ini
          </div>
        </div>
      )}

      {/* --- Login Screen --- */}
      <div className="bg-animated" style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '24px', position: 'relative', overflow: 'hidden'
      }}>
        
        {/* Background Blobs for extra energy */}
        <div style={{
          position: 'absolute', top: '-10%', left: '-10%', width: '300px', height: '300px',
          background: 'var(--m-brand)', filter: 'blur(100px)', opacity: 0.15, borderRadius: '50%',
          animation: 'float 8s ease-in-out infinite'
        }} />
        <div style={{
          position: 'absolute', bottom: '-10%', right: '-10%', width: '250px', height: '250px',
          background: '#34A853', filter: 'blur(120px)', opacity: 0.1, borderRadius: '50%',
          animation: 'float 6s ease-in-out infinite reverse'
        }} />

        {/* Login Card */}
        <div className="glass-card" style={{
          width: '100%', maxWidth: '420px', borderRadius: '32px', padding: '40px 32px',
          display: 'flex', flexDirection: 'column', position: 'relative', zIndex: 10
        }}>
          
          {/* Logo & Header */}
          <div className="stagger-1" style={{display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '32px', gap: '8px'}}>
            <LarisEnergeticLogo size={40} />
            <span style={{fontFamily: 'var(--m-font)', fontSize: '28px', fontWeight: '800', color: 'var(--m-ink)'}}>Larisi</span>
          </div>

          <div className="stagger-2" style={{marginBottom: '32px', textAlign: 'left'}}>
            <h1 style={{fontFamily: 'var(--m-font)', fontSize: '24px', fontWeight: '800', color: 'var(--m-ink)', marginBottom: '8px', letterSpacing: '-0.5px'}}>
              Selamat Datang Kembali
            </h1>
            <p style={{fontFamily: 'var(--m-font)', fontSize: '14px', color: 'var(--m-ink-sub)', fontWeight: '500'}}>
              Masuk ke akun Larisi kamu
            </p>
          </div>

          {/* Form */}
          <div className="stagger-3" style={{display: 'flex', flexDirection: 'column', gap: '20px'}}>
            <div>
              <label style={{display: 'block', fontFamily: 'var(--m-font)', fontSize: '13px', fontWeight: '700', color: 'var(--m-ink)', marginBottom: '8px'}}>
                Alamat Email
              </label>
              <div className="input-glow" style={{
                background: '#fff', borderRadius: '16px', border: '1.5px solid #E4E4EB',
                padding: '16px', display: 'flex', alignItems: 'center'
              }}>
                <input 
                  type="email" 
                  placeholder="nama@email.com"
                  onFocus={() => setIsFocused('email')}
                  onBlur={() => setIsFocused('')}
                  style={{
                    border: 'none', background: 'transparent', width: '100%', outline: 'none',
                    fontFamily: 'var(--m-font)', fontSize: '15px', color: 'var(--m-ink)', fontWeight: '500'
                  }} 
                />
              </div>
            </div>

            <div>
              <label style={{display: 'block', fontFamily: 'var(--m-font)', fontSize: '13px', fontWeight: '700', color: 'var(--m-ink)', marginBottom: '8px'}}>
                Password
              </label>
              <div className="input-glow" style={{
                background: '#fff', borderRadius: '16px', border: '1.5px solid #E4E4EB',
                padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between'
              }}>
                <input 
                  type="password" 
                  placeholder="Masukkan password"
                  onFocus={() => setIsFocused('password')}
                  onBlur={() => setIsFocused('')}
                  style={{
                    border: 'none', background: 'transparent', width: '100%', outline: 'none',
                    fontFamily: 'var(--m-font)', fontSize: '15px', color: 'var(--m-ink)', fontWeight: '500'
                  }} 
                />
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#A0A0AB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{cursor: 'pointer'}}>
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                </svg>
              </div>
            </div>
          </div>

          <div className="stagger-4" style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '20px', marginBottom: '32px'}}>
            <label style={{display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer'}}>
              <input type="checkbox" style={{width: '18px', height: '18px', accentColor: 'var(--m-brand)', cursor: 'pointer', borderRadius: '4px'}} />
              <span style={{fontFamily: 'var(--m-font)', fontSize: '13px', color: 'var(--m-ink-sub)', fontWeight: '500'}}>Ingat saya</span>
            </label>
            <a href="#" style={{fontFamily: 'var(--m-font)', fontSize: '13px', fontWeight: '700', color: 'var(--m-brand)', textDecoration: 'none'}}>
              Lupa password?
            </a>
          </div>

          <button className="stagger-5" style={{
            width: '100%', padding: '16px', borderRadius: '16px', background: 'var(--m-brand)', color: '#fff',
            border: 'none', fontFamily: 'var(--m-font)', fontSize: '16px', fontWeight: '800',
            cursor: 'pointer', boxShadow: '0 8px 24px rgba(123, 59, 153, 0.4)',
            transition: 'all 0.2s', transform: 'translateY(0)'
          }}
          onMouseDown={(e) => e.currentTarget.style.transform = 'translateY(2px)'}
          onMouseUp={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            Masuk
          </button>

          <div className="stagger-5" style={{textAlign: 'center', marginTop: '24px'}}>
            <span style={{fontFamily: 'var(--m-font)', fontSize: '13px', color: 'var(--m-ink-sub)'}}>Belum punya akun? </span>
            <a href="#" style={{fontFamily: 'var(--m-font)', fontSize: '13px', fontWeight: '800', color: 'var(--m-brand)', textDecoration: 'none'}}>Daftar di sini</a>
          </div>

        </div>
      </div>
    </>
  );
}
