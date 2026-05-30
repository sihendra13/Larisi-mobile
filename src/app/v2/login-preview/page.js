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
        @keyframes spinSlow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes pulseWave {
          0% { transform: scale(0.4); opacity: 0.6; }
          100% { transform: scale(2.5); opacity: 0; }
        }
        @keyframes fluidRotate {
          0% { transform: rotate(0deg) scale(var(--s)); }
          50% { transform: rotate(180deg) scale(calc(var(--s) + 0.15)); }
          100% { transform: rotate(360deg) scale(var(--s)); }
        }
        @keyframes fluidRotateRev {
          0% { transform: rotate(360deg) scale(var(--s)); }
          50% { transform: rotate(180deg) scale(calc(var(--s) - 0.15)); }
          100% { transform: rotate(0deg) scale(var(--s)); }
        }
        @keyframes flowData {
          from { stroke-dashoffset: 40; }
          to { stroke-dashoffset: 0; }
        }
        .flowing-line {
          stroke-dasharray: 8 8;
          animation: flowData 1s linear infinite;
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
          background: '#0a0a0a', zIndex: 999999,
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          transition: 'opacity 0.5s ease',
          opacity: splashFadeOut ? 0 : 1,
          pointerEvents: splashFadeOut ? 'none' : 'auto',
          overflow: 'hidden'
        }}>
          
          {/* Abstract Energetic Fluid Waves (White) */}
          <div style={{ position: 'absolute', width: '100%', height: '100%', zIndex: -1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {[...Array(6)].map((_, i) => (
              <div key={`wave-${i}`} style={{
                position: 'absolute',
                width: '120px', height: '120px',
                border: `${i % 2 === 0 ? '1.5px' : '2.5px'} solid rgba(255, 255, 255, ${0.7 - (i * 0.08)})`,
                borderRadius: i % 2 === 0 ? '40% 60% 70% 30% / 40% 50% 60% 50%' : '60% 40% 50% 50% / 50% 60% 40% 60%',
                '--s': 1 + (i * 0.8),
                animation: `${i % 2 === 0 ? 'fluidRotate' : 'fluidRotateRev'} ${8 + i * 2}s linear infinite`,
                transformOrigin: 'center center'
              }} />
            ))}
          </div>

          {/* Social Media Connection Theme */}
          <div style={{ position: 'absolute', width: '100vw', height: '100vh', zIndex: -1, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            
            {/* Animated Connecting Lines */}
            <svg width="100%" height="100%" style={{ position: 'absolute' }}>
              {/* Lines flowing to center */}
              <line x1="calc(50% - 110px)" y1="calc(50% - 130px)" x2="50%" y2="50%" stroke="rgba(255, 255, 255, 0.9)" strokeWidth="2" className="flowing-line" opacity="0.9" />
              <line x1="calc(50% + 120px)" y1="calc(50% - 110px)" x2="50%" y2="50%" stroke="rgba(255, 255, 255, 0.9)" strokeWidth="2" className="flowing-line" opacity="0.9" />
              <line x1="calc(50% - 100px)" y1="calc(50% + 140px)" x2="50%" y2="50%" stroke="rgba(255, 255, 255, 0.9)" strokeWidth="2" className="flowing-line" opacity="0.9" />
              <line x1="calc(50% + 110px)" y1="calc(50% + 130px)" x2="50%" y2="50%" stroke="rgba(255, 255, 255, 0.9)" strokeWidth="2" className="flowing-line" opacity="0.9" />
            </svg>

            {/* Social Media Nodes */}
            {/* TikTok */}
            <div style={{ position: 'absolute', top: 'calc(50% - 130px)', left: 'calc(50% - 110px)', transform: 'translate(-50%, -50%)', animation: 'float 3s ease-in-out infinite' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#000', border: '1px solid #333', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 24px rgba(255,255,255,0.05)' }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="white"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.01.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.58-.6 3.16-1.57 4.43-1.4 1.83-3.66 3.02-5.96 2.97-2.61-.07-5.06-1.74-6.09-4.14-.99-2.28-.6-5.03 1.05-6.9 1.5-1.7 3.86-2.5 6.07-2.18V15.1c-1.47-.2-3.13.26-4.04 1.48-.68.91-.77 2.18-.21 3.16.53.94 1.63 1.5 2.7 1.48 1.48-.03 2.76-1.14 3.05-2.58.11-.53.1-1.09.1-1.63V.02z"/></svg>
              </div>
            </div>

            {/* Instagram */}
            <div style={{ position: 'absolute', top: 'calc(50% - 110px)', left: 'calc(50% + 120px)', transform: 'translate(-50%, -50%)', animation: 'float 4s ease-in-out infinite reverse' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 24px rgba(225,48,108,0.2)' }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
              </div>
            </div>

            {/* Facebook */}
            <div style={{ position: 'absolute', top: 'calc(50% + 140px)', left: 'calc(50% - 100px)', transform: 'translate(-50%, -50%)', animation: 'float 3.5s ease-in-out infinite' }}>
              <div style={{ width: '52px', height: '52px', borderRadius: '50%', background: '#1877F2', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 24px rgba(24,119,242,0.2)' }}>
                <svg width="26" height="26" viewBox="0 0 24 24" fill="white"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
              </div>
            </div>

            {/* YouTube */}
            <div style={{ position: 'absolute', top: 'calc(50% + 130px)', left: 'calc(50% + 110px)', transform: 'translate(-50%, -50%)', animation: 'float 4.5s ease-in-out infinite reverse' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#FF0000', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 24px rgba(255,0,0,0.2)' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="white"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.5 12 3.5 12 3.5s-7.505 0-9.377.55a3.016 3.016 0 0 0-2.122 2.136C0 8.07 0 12 0 12s0 3.93.498 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.55 9.377.55 9.377.55s7.505 0 9.377-.55a3.016 3.016 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.498-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
              </div>
            </div>
          </div>

          {/* Intense Bright Purple Glow Behind Logo */}
          <div style={{
            position: 'absolute',
            width: '200px', height: '200px',
            background: 'radial-gradient(circle, #E0B0FF 0%, #B026FF 50%, transparent 100%)',
            borderRadius: '50%',
            filter: 'blur(50px)',
            opacity: 0.9,
            animation: 'pulseLogo 2s infinite ease-in-out',
            zIndex: 5
          }} />

          {/* Central Larisi Logo */}
          <div style={{ 
            animation: 'pulseLogo 2s infinite ease-in-out',
            borderRadius: '50%',
            width: '110px',
            height: '110px',
            background: '#0a0a0a',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            boxShadow: '0 0 0 3px rgba(255, 255, 255, 0.3), 0 0 50px 20px rgba(216, 132, 255, 0.6)',
            zIndex: 10
          }}>
            <img src="/logo-dashboard.png" alt="Larisi Icon" style={{ width: '80px', height: '80px', objectFit: 'contain' }} />
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
          <div className="stagger-1" style={{display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '32px'}}>
            <img src="/logo_larisi.svg" alt="Larisi" style={{height: '40px', objectFit: 'contain'}} />
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
            width: '100%', padding: '16px', borderRadius: '16px', background: '#111827', color: '#fff',
            border: 'none', fontFamily: 'inherit', fontSize: '15px', fontWeight: '800',
            cursor: 'pointer', boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
            transition: 'all 0.2s cubic-bezier(0.25, 0.8, 0.25, 1)', transform: 'translateY(0)'
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
