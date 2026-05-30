'use client';
import React, { useEffect, useState } from 'react';

export default function SplashScreen() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <>
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes splashPulseLogo {
          0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(121, 26, 219, 0.5); }
          50% { transform: scale(1.05); box-shadow: 0 0 40px 10px rgba(121, 26, 219, 0.5); }
          100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(121, 26, 219, 0.5); }
        }
        @keyframes splashFloat {
          0% { transform: translateY(0px) translateX(-50%); }
          50% { transform: translateY(-10px) translateX(-50%); }
          100% { transform: translateY(0px) translateX(-50%); }
        }
        @keyframes splashFluidRotate {
          0% { transform: rotate(0deg) scale(var(--s)); }
          50% { transform: rotate(180deg) scale(calc(var(--s) + 0.15)); }
          100% { transform: rotate(360deg) scale(var(--s)); }
        }
        @keyframes splashFluidRotateRev {
          0% { transform: rotate(360deg) scale(var(--s)); }
          50% { transform: rotate(180deg) scale(calc(var(--s) - 0.15)); }
          100% { transform: rotate(0deg) scale(var(--s)); }
        }
        @keyframes splashFlowData {
          from { stroke-dashoffset: 40; }
          to { stroke-dashoffset: 0; }
        }
        .splash-flowing-line {
          stroke-dasharray: 8 8;
          animation: splashFlowData 1s linear infinite;
        }
      `}} />
      <div style={{
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        background: '#0a0a0a', zIndex: 999999,
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
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
              animation: `${i % 2 === 0 ? 'splashFluidRotate' : 'splashFluidRotateRev'} ${8 + i * 2}s linear infinite`,
              transformOrigin: 'center center'
            }} />
          ))}
        </div>

        {/* Social Media Connection Theme */}
        <div style={{ position: 'absolute', width: '100vw', height: '100vh', zIndex: -1, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          
          {/* Animated Connecting Lines — pakai % bukan calc() agar kompatibel iOS Safari */}
          <svg width="100%" height="100%" style={{ position: 'absolute' }} viewBox="0 0 100 100" preserveAspectRatio="none">
            <line x1="22" y1="35" x2="50" y2="50" stroke="rgba(255,255,255,0.9)" strokeWidth="0.4" className="splash-flowing-line" opacity="0.9" />
            <line x1="79" y1="37" x2="50" y2="50" stroke="rgba(255,255,255,0.9)" strokeWidth="0.4" className="splash-flowing-line" opacity="0.9" />
            <line x1="24" y1="67" x2="50" y2="50" stroke="rgba(255,255,255,0.9)" strokeWidth="0.4" className="splash-flowing-line" opacity="0.9" />
            <line x1="78" y1="65" x2="50" y2="50" stroke="rgba(255,255,255,0.9)" strokeWidth="0.4" className="splash-flowing-line" opacity="0.9" />
          </svg>

          {/* Social Media Nodes */}
          <div style={{ position: 'absolute', top: 'calc(50% - 130px)', left: 'calc(50% - 110px)', animation: 'splashFloat 3s ease-in-out infinite' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#000', border: '1px solid #333', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 24px rgba(255,255,255,0.05)' }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="white"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.01.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.58-.6 3.16-1.57 4.43-1.4 1.83-3.66 3.02-5.96 2.97-2.61-.07-5.06-1.74-6.09-4.14-.99-2.28-.6-5.03 1.05-6.9 1.5-1.7 3.86-2.5 6.07-2.18V15.1c-1.47-.2-3.13.26-4.04 1.48-.68.91-.77 2.18-.21 3.16.53.94 1.63 1.5 2.7 1.48 1.48-.03 2.76-1.14 3.05-2.58.11-.53.1-1.09.1-1.63V.02z"/></svg>
            </div>
          </div>

          <div style={{ position: 'absolute', top: 'calc(50% - 110px)', left: 'calc(50% + 120px)', animation: 'splashFloat 4s ease-in-out infinite reverse' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 24px rgba(225,48,108,0.2)' }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
            </div>
          </div>

          <div style={{ position: 'absolute', top: 'calc(50% + 140px)', left: 'calc(50% - 100px)', animation: 'splashFloat 3.5s ease-in-out infinite' }}>
            <div style={{ width: '52px', height: '52px', borderRadius: '50%', background: '#1877F2', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 24px rgba(24,119,242,0.2)' }}>
              <svg width="26" height="26" viewBox="0 0 24 24" fill="white"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
            </div>
          </div>

          <div style={{ position: 'absolute', top: 'calc(50% + 130px)', left: 'calc(50% + 110px)', animation: 'splashFloat 4.5s ease-in-out infinite reverse' }}>
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
          animation: 'splashPulseLogo 2s infinite ease-in-out',
          zIndex: 5
        }} />

        {/* Central Larisi Logo */}
        <div style={{ 
          animation: 'splashPulseLogo 2s infinite ease-in-out',
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
    </>
  );
}
