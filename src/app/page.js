'use client';
import { useState } from 'react';
import MobileHeader from '@/components/layout/MobileHeader';
import BottomNav from '@/components/layout/BottomNav';
import DapurChips from '@/components/layout/DapurChips';
import AsetSection from '@/components/sections/AsetSection';
import AudiensSection from '@/components/sections/AudiensSection';
import PesanSection from '@/components/sections/PesanSection';
import PreviewSection from '@/components/sections/PreviewSection';

const CHIP_META = {
  aset:    { step:1, sub:'Siapkan Foto/Video yang menarik untuk kontenmu', next:'audiens', cta:'Simpan & Lanjutkan' },
  audiens: { step:2, sub:'Tentukan siapa yang akan melihat konten iklanmu berdasarkan target lokasi dan radius yang kamu pilih', next:'ai', cta:'Lanjutkan ke Pesan' },
  ai:      { step:3, sub:'Susun narasi iklanmu agar lebih persuasif dan menarik', next:'preview', cta:'Simpan & Lanjut' },
  preview: { step:4, sub:'Pratinjau iklanmu sebelum diposting ke platform media sosial yang kamu pilih', next:null, cta:null },
};

export default function Home() {
  const [activeNav, setActiveNav] = useState('command');
  const [activeChip, setActiveChip] = useState('aset');

  const isCommand = activeNav === 'command';
  const isPreviewChip = activeChip === 'preview';
  const meta = CHIP_META[activeChip];

  const goNext = () => {
    if (meta.next) setActiveChip(meta.next);
  };

  return (
    <div id="app-root" className="mobile-app-root">

      {/* ── Header (sticky via CSS) ── */}
      <MobileHeader userName="Nila Craft" userInitials="N" isPro />

      {/* ── Main scroll area ── */}
      <main className="panels" id="panels" role="main" style={{
        paddingBottom: isPreviewChip
          ? 'calc(140px + env(safe-area-inset-bottom))'
          : 'calc(100px + env(safe-area-inset-bottom))',
      }}>

        {/* ── Dapur view ── */}
        {isCommand && (
          <div id="view-command" className="view-active">

            {/* ── STICKY: Dapur header + Chips ── */}
            <div style={{
              position:'sticky',
              top:'0',
              zIndex:100,
              background:'var(--m-bg)',
              paddingTop:'6px',
              paddingBottom:'24px',
              marginTop:'-16px',
            }}>
              {/* Dapur header */}
              <div className="mobile-dapur-header" style={{padding:'0 0 8px 0'}}>
                <div style={{display:'flex', alignItems:'center', gap:'10px', flexWrap:'wrap'}}>
                  <div className="mobile-dapur-title" style={{margin:0}}>Dapur Konten</div>
                  <span style={{
                    background:'var(--m-brand-soft)', color:'var(--m-brand)',
                    fontSize:'12px', fontWeight:'700', borderRadius:'99px',
                    padding:'3px 10px', fontFamily:'var(--m-font)', whiteSpace:'nowrap',
                  }}>
                    Langkah {meta.step}/4
                  </span>
                </div>
                {/* Max 2 baris */}
                <div className="mobile-dapur-sub" style={{
                  display:'-webkit-box',
                  WebkitLineClamp:2,
                  WebkitBoxOrient:'vertical',
                  overflow:'hidden',
                }}>
                  {meta.sub}
                </div>
              </div>

              {/* Chips */}
              <DapurChips activeChip={activeChip} onChipChange={setActiveChip} />
            </div>
            {/* Padding di bawah sticky sebelum konten */}
            <div style={{height:'16px'}} />

            {/* ── Chip sections ── */}
            {activeChip === 'aset'    && <AsetSection />}
            {activeChip === 'audiens' && <AudiensSection />}
            {activeChip === 'ai'      && <PesanSection />}
            {activeChip === 'preview' && (
              <div className="panel" id="panel-caption" style={{display:'flex',flexDirection:'column'}}>
                <div className="panel-header" style={{justifyContent:'space-between'}}>
                  <div style={{display:'flex',alignItems:'center',gap:'10px'}}>
                    <div className="panel-icon">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="2" y="3" width="20" height="14" rx="2"/>
                        <line x1="8" y1="21" x2="16" y2="21"/>
                        <line x1="12" y1="17" x2="12" y2="21"/>
                      </svg>
                    </div>
                    <div>
                      <div className="panel-title">Preview Iklan</div>
                      <div className="panel-sub">Lihat tampilan sebelum tayang</div>
                    </div>
                  </div>
                </div>
                <div style={{padding:'16px'}}>
                  <PreviewSection />
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Kelola view ── */}
        {activeNav === 'monitor' && (
          <div id="view-monitor" className="view-active">
            <div className="panel" style={{padding:'24px',textAlign:'center',color:'var(--m-ink-sub)'}}>
              <div style={{fontSize:'32px',marginBottom:'12px'}}>📋</div>
              <div style={{fontWeight:'700',fontSize:'15px',color:'var(--m-ink)',marginBottom:'8px'}}>Kelola Iklan</div>
              <div style={{fontSize:'13px'}}>Daftar iklan aktif dan riwayat tayangan akan muncul di sini.</div>
            </div>
          </div>
        )}

        {/* ── Performa view ── */}
        {activeNav === 'analytics' && (
          <div id="view-analytics" className="view-active">
            <div className="panel" style={{padding:'24px',textAlign:'center',color:'var(--m-ink-sub)'}}>
              <div style={{fontSize:'32px',marginBottom:'12px'}}>📊</div>
              <div style={{fontWeight:'700',fontSize:'15px',color:'var(--m-ink)',marginBottom:'8px'}}>Performa Iklan</div>
              <div style={{fontSize:'13px'}}>Statistik jangkauan dan engagement iklanmu tampil di sini.</div>
            </div>
          </div>
        )}

      </main>

      {/* ── Floating CTA — chip 1, 2, 3 ── */}
      {isCommand && !isPreviewChip && (
        <div style={{
          position:'fixed',
          bottom:'calc(60px + env(safe-area-inset-bottom) + 12px)',
          left:'16px', right:'16px',
          zIndex:400,
        }}>
          <button onClick={goNext} style={{
            width:'100%', padding:'16px', borderRadius:'16px',
            background:'var(--m-ink)', color:'#fff', border:'none',
            fontFamily:'var(--m-font)', fontSize:'15px', fontWeight:'700',
            cursor:'pointer', display:'flex', alignItems:'center',
            justifyContent:'center', gap:'8px',
            boxShadow:'0 4px 20px rgba(0,0,0,0.18)',
          }}>
            {meta.cta}
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12"/>
              <polyline points="12 5 19 12 12 19"/>
            </svg>
          </button>
        </div>
      )}

      {/* ── CTA Bar chip 4 (Tayangkan + Estimasi) ── */}
      {isCommand && isPreviewChip && (
        <div id="mobile-cta-bar" className="mobile-cta-bar" style={{display:'block'}} aria-live="polite">
          <div className="m-cta-fade" aria-hidden="true"></div>
          <div className="m-cta-card">
            <div className="m-cta-reach">
              <div className="m-cta-label">Estimasi Jangkauan</div>
              <div className="m-cta-value">
                <span id="mobile-cta-reach-num">72K – 119K</span> warga ·{' '}
                <span id="mobile-cta-reach-loc">Sumbersari</span>
              </div>
            </div>
            <button className="m-cta-btn" aria-label="Tayangkan iklan sekarang">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="none">
                <polygon points="5 3 19 12 5 21 5 3"/>
              </svg>
              Tayangkan
            </button>
          </div>
        </div>
      )}

      {/* ── Bottom Nav ── */}
      <BottomNav activeNav={activeNav} onSwitch={nav => setActiveNav(nav)} />
    </div>
  );
}
