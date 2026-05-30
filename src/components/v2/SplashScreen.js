'use client';
import React, { useEffect, useState } from 'react';

export default function SplashScreen() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
      background: '#09090b', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center',
      overflow: 'hidden'
    }}>
      {/* Social Media Connection Theme */}
      <div style={{ position: 'absolute', width: '100vw', height: '100vh', zIndex: -1, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        
        {/* Glow behind logo */}
        <div style={{
          position: 'absolute', width: '160px', height: '160px', background: 'var(--m-brand)',
          borderRadius: '50%', filter: 'blur(60px)', opacity: 0.6,
          animation: 'pulseLogo 3s ease-in-out infinite'
        }} />

        {/* Fluid Orbits */}
        {[...Array(5)].map((_, i) => (
          <div key={`wave-${i}`} style={{
            position: 'absolute',
            width: '120px', height: '120px',
            border: `1px solid rgba(121, 26, 219, ${0.15 - (i * 0.02)})`,
            '--s': 1 + (i * 0.8),
            animation: `fluidRotate ${10 + (i * 2)}s linear infinite ${i % 2 === 0 ? 'reverse' : 'normal'}`,
            transformOrigin: 'center center'
          }} />
        ))}

        {/* Circular Orbits */}
        <div className="orbit-line" style={{ width: '220px', height: '220px', opacity: 0.3 }} />
        <div className="orbit-line" style={{ width: '380px', height: '380px', opacity: 0.15 }} />
        <div className="orbit-line" style={{ width: '540px', height: '540px', opacity: 0.08 }} />

        {/* Orbiting Icons */}
        <div style={{ position: 'absolute', width: '100%', height: '100%', pointerEvents: 'none' }}>
          {/* TikTok */}
          <div style={{ position: 'absolute', top: 'calc(50% - 130px)', left: 'calc(50% - 110px)', animation: 'float 6s ease-in-out infinite' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#1A1A24', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 32px rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.05)' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M19.589 6.686a4.793 4.793 0 0 1-3.97-5.615H11.48v16.472a3.328 3.328 0 0 1-3.323 3.323 3.328 3.328 0 0 1-3.323-3.323 3.328 3.328 0 0 1 3.323-3.323c.337 0 .66.05.962.145V10.15a7.483 7.483 0 0 0-.962-.062 7.474 7.474 0 0 0-7.465 7.465 7.474 7.474 0 0 0 7.465 7.465 7.474 7.474 0 0 0 7.465-7.465V10.51a8.922 8.922 0 0 0 3.967 1.954V8.31a4.78 4.78 0 0 1-1.996-1.624" fill="#fff"/>
              </svg>
            </div>
          </div>
          {/* Instagram */}
          <div style={{ position: 'absolute', top: 'calc(50% - 110px)', left: 'calc(50% + 120px)', animation: 'float 7s ease-in-out infinite reverse' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 32px rgba(220, 39, 67, 0.4)' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
            </div>
          </div>
          {/* Facebook */}
          <div style={{ position: 'absolute', top: 'calc(50% + 140px)', left: 'calc(50% - 100px)', animation: 'float 5s ease-in-out infinite 1s' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#1877F2', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 32px rgba(24, 119, 242, 0.4)' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
            </div>
          </div>
          {/* YouTube */}
          <div style={{ position: 'absolute', top: 'calc(50% + 130px)', left: 'calc(50% + 110px)', animation: 'float 8s ease-in-out infinite 0.5s' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#FF0000', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 32px rgba(255, 0, 0, 0.4)' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"/><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"/></svg>
            </div>
          </div>
          
          {/* Connecting Lines */}
          <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0.2 }}>
            <line x1="calc(50% - 110px)" y1="calc(50% - 130px)" x2="50%" y2="50%" stroke="white" strokeWidth="1" strokeDasharray="4 4" />
            <line x1="calc(50% + 120px)" y1="calc(50% - 110px)" x2="50%" y2="50%" stroke="white" strokeWidth="1" strokeDasharray="4 4" />
            <line x1="calc(50% - 100px)" y1="calc(50% + 140px)" x2="50%" y2="50%" stroke="white" strokeWidth="1" strokeDasharray="4 4" />
            <line x1="calc(50% + 110px)" y1="calc(50% + 130px)" x2="50%" y2="50%" stroke="white" strokeWidth="1" strokeDasharray="4 4" />
          </svg>
        </div>
      </div>

      {/* Main Logo Container */}
      <div style={{ position: 'relative', zIndex: 10, animation: 'pulseLogo 3s ease-in-out infinite' }}>
        <div style={{
          background: 'var(--m-brand)',
          padding: '24px',
          borderRadius: '28px',
          boxShadow: '0 20px 40px rgba(0,0,0,0.4), inset 0 2px 4px rgba(255,255,255,0.2)',
          border: '1px solid rgba(255,255,255,0.1)'
        }}>
          {/* Custom White Larisi Logo for Dark Mode */}
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
          </svg>
          <div style={{ position: 'absolute', top: '-10px', right: '-10px' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
              <path d="M12 0l2 8 8 2-8 2-2 8-2-8-8-2 8-2z" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
