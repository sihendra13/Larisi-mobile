'use client';
import { useState } from 'react';
import MobileHeader from '@/components/layout/MobileHeader';
import BottomNav from '@/components/layout/BottomNav';
import DapurChips from '@/components/layout/DapurChips';
import AsetSection from '@/components/sections/AsetSection';
import AudiensSection from '@/components/sections/AudiensSection';
import PesanSection from '@/components/sections/PesanSection';
import PreviewSection from '@/components/sections/PreviewSection';

export default function Home() {
  const [activeNav, setActiveNav] = useState('command');
  const [activeChip, setActiveChip] = useState('aset');

  const isCommand = activeNav === 'command';
  const isPreviewChip = activeChip === 'preview';

  return (
    <div id="app-root" className="mobile-app-root">
      {/* ── Header ── */}
      <MobileHeader userName="Nila Craft" userInitials="N" isPro />

      {/* ── Main scroll area ── */}
      <main className="panels" id="panels" role="main">

        {/* ── Dapur view ── */}
        {isCommand && (
          <div id="view-command" className="view-active">

            {/* Dapur header */}
            <div className="mobile-dapur-header">
              <div style={{display:'flex', alignItems:'center', gap:'10px', flexWrap:'wrap'}}>
                <div className="mobile-dapur-title" style={{margin:0}}>Dapur Konten</div>
                <span style={{
                  background:'var(--m-brand-soft)', color:'var(--m-brand)',
                  fontSize:'12px', fontWeight:'700', borderRadius:'99px',
                  padding:'3px 10px', fontFamily:'var(--m-font)',
                }}>
                  Langkah {['aset','audiens','ai','preview'].indexOf(activeChip)+1}/4
                </span>
              </div>
              <div className="mobile-dapur-sub">
                {activeChip === 'aset' && 'Siapkan Foto/Video yang menarik untuk kontenmu'}
                {activeChip === 'audiens' && 'Tentukan siapa yang akan melihat konten iklanmu berdasarkan target lokasi dan radius yang kamu pilih'}
                {activeChip === 'ai' && 'Susun Narasi iklanmu'}
                {activeChip === 'preview' && 'Pratinjau iklanmu sebelum diposting ke platform media sosial yang kamu pilih'}
              </div>
            </div>

            {/* Chip stepper */}
            <DapurChips activeChip={activeChip} onChipChange={setActiveChip} />

            {/* ── Chip 1: Aset ── */}
            {activeChip === 'aset' && <AsetSection onNext={() => setActiveChip('audiens')} />}

            {/* ── Chip 2: Audiens + Map ── */}
            {activeChip === 'audiens' && <AudiensSection />}

            {/* ── Chip 3: Pesan (AI Caption) ── */}
            {activeChip === 'ai' && <PesanSection />}

            {/* ── Chip 4: Preview ── */}
            {activeChip === 'preview' && (
              <div className="panel" id="panel-caption" style={{display:'flex',flexDirection:'column'}}>
                {/* Header */}
                <div className="panel-header" style={{justifyContent:'space-between'}}>
                  <div style={{display:'flex',alignItems:'center',gap:'10px'}}>
                    <div className="panel-icon">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>
                      </svg>
                    </div>
                    <div>
                      <div className="panel-title">Preview Iklan</div>
                      <div className="panel-sub">Lihat tampilan sebelum tayang</div>
                    </div>
                  </div>
                </div>
                {/* Preview body */}
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

      {/* ── CTA Bar — hanya saat Chip 4 (Preview) ── */}
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
