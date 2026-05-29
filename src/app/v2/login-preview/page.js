'use client';
import { useState, useEffect } from 'react';

// Custom SVG Logo component matching the attached image
const LarisEnergeticLogo = ({ size = 120 }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="100" height="100" rx="20" fill="var(--m-brand)"/>
    
    {/* The Chat Bubble / L shape */}
    <path d="M70 20H30V35H20V65C20 73.2843 26.7157 80 35 80H45V95L60 80H75C83.2843 80 90 73.2843 90 65V40C90 28.9543 81.0457 20 70 20Z" fill="white"/>
    
    {/* Inner L cutout - we can simulate this by drawing the background color inside */}
    <path d="M45 40V60H75V65H40V40H45Z" fill="var(--m-brand)"/>

    {/* Sparkles */}
    <path d="M15 15L17.5 22.5L25 25L17.5 27.5L15 35L12.5 27.5L5 25L12.5 22.5L15 15Z" fill="white"/>
    <path d="M30 5L31.5 9.5L36 11L31.5 12.5L30 17L28.5 12.5L24 11L28.5 9.5L30 5Z" fill="white"/>
    <path d="M35 25L36 28L39 29L36 30L35 33L34 30L31 29L34 28L35 25Z" fill="white"/>
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
          --m-brand: #7B3B99;
          --m-brand-glow: rgba(123, 59, 153, 0.5);
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
