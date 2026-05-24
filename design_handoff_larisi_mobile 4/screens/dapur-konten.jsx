/* global React */
const { useState } = React;

// ─── Brand tokens ───────────────────────────────────────────────
const BRAND = '#6B5BFF';
const BRAND_SOFT = '#EFECFF';
const INK = '#0E0E12';
const INK_SUB = '#6B6B73';
const LINE = '#ECECF1';
const BG = '#F5F5F7';
const CARD = '#FFFFFF';

// ─── Tiny icon set (stroke-based, line=1.6) ─────────────────────
const stroke = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.6, strokeLinecap: 'round', strokeLinejoin: 'round' };
const Icon = {
  bell:    <svg width="20" height="20" viewBox="0 0 24 24" {...stroke}><path d="M6 9a6 6 0 0 1 12 0c0 5 2 6 2 7H4c0-1 2-2 2-7Z"/><path d="M10 19a2 2 0 0 0 4 0"/></svg>,
  search:  <svg width="18" height="18" viewBox="0 0 24 24" {...stroke}><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>,
  plus:    <svg width="20" height="20" viewBox="0 0 24 24" {...stroke}><path d="M12 5v14M5 12h14"/></svg>,
  upload:  <svg width="22" height="22" viewBox="0 0 24 24" {...stroke}><path d="M12 16V4m0 0-4 4m4-4 4 4"/><path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2"/></svg>,
  user:    <svg width="18" height="18" viewBox="0 0 24 24" {...stroke}><circle cx="12" cy="8" r="3.5"/><path d="M5 20c1.5-3.5 4-5 7-5s5.5 1.5 7 5"/></svg>,
  pin:     <svg width="18" height="18" viewBox="0 0 24 24" {...stroke}><path d="M12 22s7-6.5 7-12a7 7 0 1 0-14 0c0 5.5 7 12 7 12Z"/><circle cx="12" cy="10" r="2.5"/></svg>,
  sparkle: <svg width="18" height="18" viewBox="0 0 24 24" {...stroke}><path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M6 18l2.5-2.5M15.5 8.5 18 6"/></svg>,
  chevron: <svg width="16" height="16" viewBox="0 0 24 24" {...stroke}><path d="m9 6 6 6-6 6"/></svg>,
  chevDown:<svg width="14" height="14" viewBox="0 0 24 24" {...stroke}><path d="m6 9 6 6 6-6"/></svg>,
  play:    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>,
  home:    <svg width="22" height="22" viewBox="0 0 24 24" {...stroke}><path d="M3 11.5 12 4l9 7.5"/><path d="M5 10v10h14V10"/></svg>,
  grid:    <svg width="22" height="22" viewBox="0 0 24 24" {...stroke}><rect x="4" y="4" width="7" height="7" rx="1.5"/><rect x="13" y="4" width="7" height="7" rx="1.5"/><rect x="4" y="13" width="7" height="7" rx="1.5"/><rect x="13" y="13" width="7" height="7" rx="1.5"/></svg>,
  chat:    <svg width="22" height="22" viewBox="0 0 24 24" {...stroke}><path d="M4 6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-7l-4 3v-3H6a2 2 0 0 1-2-2Z"/></svg>,
  chart:   <svg width="22" height="22" viewBox="0 0 24 24" {...stroke}><path d="M4 20h16"/><rect x="6" y="11" width="3" height="7" rx="0.5"/><rect x="11" y="7" width="3" height="11" rx="0.5"/><rect x="16" y="14" width="3" height="4" rx="0.5"/></svg>,
  ig:      <svg width="14" height="14" viewBox="0 0 24 24" {...stroke}><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="0.8" fill="currentColor"/></svg>,
  cog:     <svg width="16" height="16" viewBox="0 0 24 24" {...stroke}><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1Z"/></svg>,
  check:   <svg width="14" height="14" viewBox="0 0 24 24" {...stroke}><path d="m5 12 4 4L19 7"/></svg>,
  image:   <svg width="22" height="22" viewBox="0 0 24 24" {...stroke}><rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="9" cy="11" r="1.5"/><path d="m3 17 5-4 4 3 4-4 5 5"/></svg>,
  heart:   <svg width="20" height="20" viewBox="0 0 24 24" {...stroke}><path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10Z"/></svg>,
  send:    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M5 4v16l15-8z"/></svg>,
  close:   <svg width="14" height="14" viewBox="0 0 24 24" {...stroke}><path d="m6 6 12 12M18 6 6 18"/></svg>,
};

// ─── Logo: purple "L" tile ──────────────────────────────────────
function Logo({ size = 32 }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: size * 0.28,
      background: `linear-gradient(135deg, ${BRAND} 0%, #8C7BFF 100%)`,
      display: 'grid', placeItems: 'center', color: '#fff',
      fontWeight: 800, fontSize: size * 0.5, fontFamily: 'Inter, sans-serif',
      letterSpacing: '-0.04em',
      boxShadow: '0 6px 18px -8px rgba(107,91,255,0.6)'
    }}>L</div>
  );
}

// ─── Shared card wrapper ────────────────────────────────────────
function Card({ children, style }) {
  return (
    <div style={{
      background: CARD, borderRadius: 20, padding: 18,
      border: `1px solid ${LINE}`, ...style
    }}>{children}</div>
  );
}

// ─── Phone shell (no real iOS frame — flat mobile artboard) ─────
function Phone({ children, label }) {
  return (
    <div style={{ width: 390, height: 844, background: BG, position: 'relative', overflow: 'hidden', fontFamily: 'Inter, sans-serif', color: INK }}>
      {/* status bar */}
      <div style={{ height: 50, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', padding: '0 28px 8px', fontSize: 15, fontWeight: 600 }}>
        <span>9:41</span>
        <span style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <svg width="17" height="11" viewBox="0 0 17 11" fill="currentColor"><rect x="0" y="6" width="3" height="5" rx=".5"/><rect x="4.5" y="4" width="3" height="7" rx=".5"/><rect x="9" y="2" width="3" height="9" rx=".5"/><rect x="13.5" y="0" width="3" height="11" rx=".5"/></svg>
          <svg width="16" height="11" viewBox="0 0 16 11" fill="currentColor"><path d="M8 2.2c2.1 0 4 .8 5.3 2.2l1-1A8 8 0 0 0 8 1a8 8 0 0 0-6.3 2.4l1 1A7.4 7.4 0 0 1 8 2.2Z"/><path d="M8 5.5c1.2 0 2.4.5 3.2 1.3l1-1A6 6 0 0 0 8 4.2 6 6 0 0 0 3.8 5.8l1 1A4.6 4.6 0 0 1 8 5.5Z"/><circle cx="8" cy="9.5" r="1.3"/></svg>
          <div style={{ width: 24, height: 11, border: `1px solid ${INK}`, borderRadius: 3, padding: 1, position: 'relative' }}>
            <div style={{ width: '78%', height: '100%', background: INK, borderRadius: 1 }}/>
          </div>
        </span>
      </div>
      {children}
      {label && <div style={{ position: 'absolute', bottom: -28, left: 0, right: 0, textAlign: 'center', fontSize: 12, color: INK_SUB, fontFamily: 'ui-monospace, monospace' }}>{label}</div>}
    </div>
  );
}

// ─── App header (logo + bell + avatar) ──────────────────────────
function AppHeader() {
  return (
    <div style={{ padding: '6px 20px 14px', display: 'flex', alignItems: 'center', gap: 12 }}>
      <Logo size={36}/>
      <div style={{ flex: 1 }}/>
      <button style={btnIcon}>{Icon.search}</button>
      <button style={{ ...btnIcon, position: 'relative' }}>
        {Icon.bell}
        <span style={{ position: 'absolute', top: 8, right: 9, width: 7, height: 7, borderRadius: 99, background: BRAND, border: '2px solid #fff' }}/>
      </button>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 4px 4px 10px', border: `1px solid ${LINE}`, borderRadius: 99, background: CARD }}>
        <div style={{ fontSize: 11, lineHeight: 1.1, textAlign: 'right' }}>
          <div style={{ fontWeight: 600 }}>Nila Craft</div>
          <div style={{ color: BRAND, fontWeight: 700, fontSize: 9, letterSpacing: '.05em' }}>PRO</div>
        </div>
        <div style={{ width: 30, height: 30, borderRadius: 99, background: '#1A1A1F', color: '#fff', display: 'grid', placeItems: 'center', fontWeight: 700, fontSize: 13 }}>A</div>
      </div>
    </div>
  );
}

const btnIcon = {
  width: 38, height: 38, borderRadius: 99, border: `1px solid ${LINE}`,
  background: CARD, display: 'grid', placeItems: 'center', color: INK, cursor: 'pointer'
};

// ─── Page title block ───────────────────────────────────────────
function PageTitle() {
  return (
    <div style={{ padding: '0 20px 18px' }}>
      <div style={{ fontSize: 26, fontWeight: 700, letterSpacing: '-0.02em' }}>Dapur Konten</div>
      <div style={{ fontSize: 13, color: INK_SUB, marginTop: 4, lineHeight: 1.4 }}>
        Siapkan foto, video, dan pesan terbaikmu di sini untuk tampil maksimal.
      </div>
    </div>
  );
}

// ─── Step pill row ──────────────────────────────────────────────
function StepRow({ active = 1 }) {
  const steps = ['Aset', 'Audiens', 'AI', 'Preview'];
  return (
    <div style={{ display: 'flex', gap: 6, padding: '0 20px 16px', overflowX: 'auto' }}>
      {steps.map((s, i) => (
        <div key={s} style={{
          padding: '8px 14px', borderRadius: 99, fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap',
          background: i === active ? INK : CARD,
          color: i === active ? '#fff' : INK_SUB,
          border: i === active ? 'none' : `1px solid ${LINE}`,
          display: 'flex', alignItems: 'center', gap: 6,
        }}>
          <span style={{
            width: 18, height: 18, borderRadius: 99, display: 'grid', placeItems: 'center',
            background: i === active ? BRAND : (i < active ? '#E3FCEC' : BG),
            color: i === active ? '#fff' : (i < active ? '#1A8F4F' : INK_SUB),
            fontSize: 10, fontWeight: 700,
          }}>{i < active ? '✓' : i + 1}</span>
          {s}
        </div>
      ))}
    </div>
  );
}

// ─── Aset Kreatif card ──────────────────────────────────────────
function AsetCard() {
  return (
    <Card>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
        <div style={{ width: 32, height: 32, borderRadius: 10, background: BRAND_SOFT, color: BRAND, display: 'grid', placeItems: 'center' }}>{Icon.image}</div>
        <div>
          <div style={{ fontWeight: 600, fontSize: 14 }}>Aset Kreatif</div>
          <div style={{ fontSize: 11, color: INK_SUB }}>Maksimal 5 Foto atau 1 Video</div>
        </div>
      </div>
      <div style={{
        border: `1.5px dashed #D7D7DE`, borderRadius: 14, padding: '22px 16px', textAlign: 'center',
        background: 'repeating-linear-gradient(135deg, #FAFAFC 0 8px, #F4F4F7 8px 16px)'
      }}>
        <div style={{ width: 44, height: 44, borderRadius: 14, background: '#fff', border: `1px solid ${LINE}`, display: 'grid', placeItems: 'center', margin: '0 auto 10px', color: BRAND }}>{Icon.upload}</div>
        <div style={{ fontSize: 14, fontWeight: 600 }}>Unggah Foto/Video</div>
        <div style={{ fontSize: 11, color: INK_SUB, marginTop: 3 }}>Ketuk untuk pilih dari galeri</div>
      </div>
      <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
        {[0, 1, 2, 3, 4].map(i => (
          <div key={i} style={{
            flex: 1, aspectRatio: '1', borderRadius: 10,
            background: i === 0 ? BRAND_SOFT : '#F4F4F7',
            border: `1px solid ${LINE}`,
            display: 'grid', placeItems: 'center', color: i === 0 ? BRAND : '#C7C7CF', fontSize: 10
          }}>{i === 0 ? Icon.plus : (i + 1)}</div>
        ))}
      </div>
    </Card>
  );
}

// ─── Audiens card ───────────────────────────────────────────────
function Toggle({ on }) {
  return (
    <div style={{
      width: 36, height: 22, borderRadius: 99,
      background: on ? BRAND : '#E2E2E8', position: 'relative', transition: '.2s'
    }}>
      <div style={{ position: 'absolute', top: 2, left: on ? 16 : 2, width: 18, height: 18, borderRadius: 99, background: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,.2)' }}/>
    </div>
  );
}
function AudiensCard() {
  return (
    <Card>
      <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 4 }}>Siapa Target Audiens Kamu?</div>
      <div style={{ fontSize: 11, color: INK_SUB, marginBottom: 14 }}>Pilih siapa yang akan lihat iklanmu</div>
      {[
        { icon: Icon.user, title: 'Warga Sekitar', desc: 'Penduduk lokal di sekitar lokasi yang kamu pilih.', on: true },
        { icon: Icon.pin,  title: 'Pengunjung',   desc: 'Orang yang baru saja melewati lokasi ini.', on: false },
      ].map((r, i) => (
        <div key={i} style={{
          display: 'flex', alignItems: 'flex-start', gap: 12, padding: '12px 0',
          borderTop: i === 0 ? 'none' : `1px solid ${LINE}`
        }}>
          <div style={{ width: 32, height: 32, borderRadius: 10, background: r.on ? BRAND_SOFT : '#F4F4F7', color: r.on ? BRAND : INK_SUB, display: 'grid', placeItems: 'center', flexShrink: 0 }}>{r.icon}</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 600, fontSize: 13 }}>{r.title}</div>
            <div style={{ fontSize: 11, color: INK_SUB, marginTop: 2, lineHeight: 1.4 }}>{r.desc}</div>
          </div>
          <Toggle on={r.on}/>
        </div>
      ))}
    </Card>
  );
}

// ─── Map + radius card ──────────────────────────────────────────
function MapCard() {
  return (
    <Card style={{ padding: 0, overflow: 'hidden' }}>
      <div style={{ padding: '14px 18px 10px', display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 32, height: 32, borderRadius: 10, background: BRAND_SOFT, color: BRAND, display: 'grid', placeItems: 'center' }}>{Icon.pin}</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 600, fontSize: 14 }}>Titik Target Iklan</div>
          <div style={{ fontSize: 11, color: INK_SUB }}>Sumbersari, Bantul · 1.0 km</div>
        </div>
        <button style={{ ...btnIcon, width: 32, height: 32 }}>{Icon.cog}</button>
      </div>
      {/* faux map */}
      <div style={{ height: 180, position: 'relative', background: '#EEF1F3', overflow: 'hidden' }}>
        <svg width="100%" height="100%" viewBox="0 0 354 180" preserveAspectRatio="xMidYMid slice">
          <rect width="354" height="180" fill="#EEF1F3"/>
          {/* roads */}
          <path d="M0 60 Q120 50 200 80 T354 70" stroke="#fff" strokeWidth="14" fill="none"/>
          <path d="M0 60 Q120 50 200 80 T354 70" stroke="#D9DEE3" strokeWidth="1" fill="none"/>
          <path d="M40 0 L80 180" stroke="#fff" strokeWidth="8" fill="none"/>
          <path d="M180 0 L210 180" stroke="#fff" strokeWidth="8" fill="none"/>
          <path d="M300 0 L280 180" stroke="#fff" strokeWidth="6" fill="none"/>
          <path d="M0 130 L354 140" stroke="#fff" strokeWidth="10" fill="none"/>
          <path d="M0 130 L354 140" stroke="#D9DEE3" strokeWidth=".8" fill="none" strokeDasharray="4 3"/>
          {/* blocks */}
          {[[95,85,28,22],[130,90,30,18],[230,30,40,25],[240,100,35,28],[110,150,40,20],[260,150,50,22],[20,90,30,30]].map((b,i)=>(
            <rect key={i} x={b[0]} y={b[1]} width={b[2]} height={b[3]} fill="#E3E7EA" rx="2"/>
          ))}
          {/* greens */}
          <circle cx="60" cy="40" r="14" fill="#DCE7DA"/>
          <circle cx="310" cy="110" r="18" fill="#DCE7DA"/>
          {/* radius */}
          <circle cx="177" cy="95" r="60" fill={BRAND} fillOpacity="0.12" stroke={BRAND} strokeWidth="1.5"/>
          <circle cx="177" cy="95" r="6" fill={BRAND}/>
          <circle cx="177" cy="95" r="12" fill={BRAND} fillOpacity="0.3"/>
        </svg>
        {/* zoom controls */}
        <div style={{ position: 'absolute', top: 12, right: 12, background: '#fff', borderRadius: 10, border: `1px solid ${LINE}`, overflow: 'hidden' }}>
          <button style={mapBtn}>+</button>
          <div style={{ height: 1, background: LINE }}/>
          <button style={mapBtn}>−</button>
        </div>
      </div>
      {/* radius slider */}
      <div style={{ padding: '14px 18px 16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 8 }}>
          <span style={{ color: INK_SUB }}>Target Radius</span>
          <span style={{ fontWeight: 700, color: BRAND }}>1.0 KM</span>
        </div>
        <div style={{ height: 4, background: '#EFEFF3', borderRadius: 4, position: 'relative' }}>
          <div style={{ position: 'absolute', left: 0, top: 0, height: 4, width: '22%', background: BRAND, borderRadius: 4 }}/>
          <div style={{ position: 'absolute', left: '22%', top: -7, width: 18, height: 18, marginLeft: -9, borderRadius: 99, background: '#fff', border: `2px solid ${BRAND}`, boxShadow: '0 2px 6px rgba(107,91,255,.3)' }}/>
        </div>
      </div>
    </Card>
  );
}
const mapBtn = { width: 28, height: 28, border: 'none', background: '#fff', fontSize: 16, color: INK, cursor: 'pointer' };

// ─── AI assistant card ──────────────────────────────────────────
function AICard() {
  return (
    <Card>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
        <div style={{ width: 32, height: 32, borderRadius: 10, background: BRAND_SOFT, color: BRAND, display: 'grid', placeItems: 'center' }}>{Icon.sparkle}</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 600, fontSize: 14 }}>Asisten AI Pintar</div>
          <div style={{ fontSize: 11, color: INK_SUB }}>Bikin konten lebih menarik real-time</div>
        </div>
      </div>
      {/* posting to */}
      <div style={{ background: BG, borderRadius: 12, padding: '12px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <span style={{ fontSize: 12, color: INK_SUB }}>Posting ke</span>
        <button style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', background: '#fff', border: `1px solid ${LINE}`, borderRadius: 99, fontSize: 12, fontWeight: 600 }}>
          <span style={{ color: '#E1306C' }}>{Icon.ig}</span> Instagram {Icon.chevDown}
        </button>
      </div>
      {/* sliders */}
      {[{l:'Terang-Gelap', v: 1}, {l:'Ketajaman Warna', v: 1}].map((s, i) => (
        <div key={i} style={{ marginBottom: i === 0 ? 12 : 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 6 }}>
            <span style={{ color: INK_SUB }}>{s.l}</span>
            <span style={{ fontWeight: 600 }}>100%</span>
          </div>
          <div style={{ height: 4, background: '#EFEFF3', borderRadius: 4, position: 'relative' }}>
            <div style={{ position: 'absolute', left: 0, top: 0, height: 4, width: '100%', background: INK, borderRadius: 4 }}/>
            <div style={{ position: 'absolute', right: 0, top: -6, width: 16, height: 16, marginRight: -8, borderRadius: 99, background: INK }}/>
          </div>
        </div>
      ))}
      {/* AI textarea */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <span style={{ fontSize: 12, fontWeight: 600 }}>Pesan dioptimalkan AI</span>
        <span style={{ fontSize: 10, color: BRAND, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>{Icon.ig} INSTAGRAM</span>
      </div>
      <div style={{ background: BG, borderRadius: 12, padding: 12, fontSize: 12, color: INK_SUB, lineHeight: 1.5, minHeight: 80 }}>
        Tunggu sebentar, AI akan menuliskan pesan untukmu. Kamu bebas mengeditnya kembali agar lebih sesuai.
      </div>
      <button style={{ marginTop: 10, width: '100%', padding: '11px', borderRadius: 12, background: INK, color: '#fff', border: 'none', fontWeight: 600, fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
        {Icon.sparkle} Generate ulang
      </button>
    </Card>
  );
}

// ─── Live preview card ──────────────────────────────────────────
function PreviewCard() {
  const [tab, setTab] = useState('Reel');
  return (
    <Card style={{ padding: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <div style={{ fontWeight: 600, fontSize: 14 }}>Live Preview</div>
        <div style={{ fontSize: 11, color: INK_SUB }}>IG Story</div>
      </div>
      {/* segmented */}
      <div style={{ display: 'flex', background: BG, borderRadius: 10, padding: 3, marginBottom: 14 }}>
        {['Post', 'Reel', 'Story'].map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            flex: 1, padding: '7px 0', border: 'none', borderRadius: 8,
            background: tab === t ? INK : 'transparent',
            color: tab === t ? '#fff' : INK_SUB,
            fontWeight: 600, fontSize: 12, cursor: 'pointer'
          }}>{t}</button>
        ))}
      </div>
      {/* phone mockup */}
      <div style={{ background: '#000', borderRadius: 18, height: 280, padding: 12, color: '#fff', position: 'relative', overflow: 'hidden' }}>
        <div style={{ height: 2, background: 'rgba(255,255,255,.3)', borderRadius: 2, marginBottom: 10 }}>
          <div style={{ width: '35%', height: '100%', background: '#fff', borderRadius: 2 }}/>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
          <div style={{ width: 26, height: 26, borderRadius: 99, background: 'linear-gradient(135deg,#E1306C,#F77737)' }}/>
          <div style={{ flex: 1, fontSize: 11, fontWeight: 600 }}>tesakuniarisi</div>
          <span style={{ fontSize: 10, opacity: .7 }}>2m</span>
          <span style={{ opacity: .7 }}>{Icon.close}</span>
        </div>
        <div style={{ height: 170, borderRadius: 8, background: 'rgba(255,255,255,.05)', display: 'grid', placeItems: 'center', color: 'rgba(255,255,255,.3)' }}>
          {Icon.image}
        </div>
        <div style={{ position: 'absolute', bottom: 12, left: 12, right: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ flex: 1, padding: '8px 12px', borderRadius: 99, border: '1px solid rgba(255,255,255,.4)', fontSize: 11, opacity: .8 }}>Kirim pesan</div>
          <span style={{ opacity: .9 }}>{Icon.heart}</span>
          <span style={{ opacity: .9 }}>{Icon.send}</span>
        </div>
      </div>
    </Card>
  );
}

// ─── Sticky CTA bar (floats above bottom nav) ───────────────────
function CTABar() {
  return (
    <div style={{
      position: 'absolute', left: 0, right: 0, bottom: 78,
      padding: '14px 16px 10px', background: 'linear-gradient(180deg, rgba(245,245,247,0) 0%, #F5F5F7 50%)',
      pointerEvents: 'none',
    }}>
      <div style={{ background: CARD, borderRadius: 18, padding: 12, border: `1px solid ${LINE}`, display: 'flex', alignItems: 'center', gap: 12, boxShadow: '0 10px 30px -10px rgba(15,15,30,.18)', pointerEvents: 'auto' }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 10, color: INK_SUB }}>Estimasi Jangkauan</div>
          <div style={{ fontSize: 15, fontWeight: 700 }}><span style={{ color: BRAND }}>0</span> warga · Sumbersari</div>
        </div>
        <button style={{
          padding: '12px 18px', borderRadius: 12, background: INK, color: '#fff',
          border: 'none', fontWeight: 600, fontSize: 13, display: 'flex', alignItems: 'center', gap: 6
        }}>{Icon.play} Tayangkan</button>
      </div>
    </div>
  );
}

// ─── Bottom nav (used in screen 1) ──────────────────────────────
function BottomNav({ active = 0 }) {
  const listIcon = <svg width="22" height="22" viewBox="0 0 24 24" {...stroke}><path d="M4 6h16M4 12h16M4 18h16"/><circle cx="7" cy="6" r="1.6" fill="#fff"/><circle cx="14" cy="12" r="1.6" fill="#fff"/><circle cx="9" cy="18" r="1.6" fill="#fff"/></svg>;
  const items = [
    { i: Icon.grid,  l: 'Dapur' },
    { i: listIcon,   l: 'Kelola' },
    { i: Icon.chart, l: 'Performa' },
  ];
  return (
    <div style={{
      position: 'absolute', bottom: 0, left: 0, right: 0,
      height: 78, background: '#fff', borderTop: `1px solid ${LINE}`,
      display: 'flex', padding: '8px 8px 22px',
    }}>
      {items.map((x, i) => (
        <button key={i} style={{
          flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
          background: 'transparent', border: 'none',
          color: i === active ? BRAND : INK_SUB, fontSize: 10, fontWeight: 600,
        }}>{x.i}{x.l}</button>
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// SCREEN 1 — Home / Dashboard overview
// ═══════════════════════════════════════════════════════════════
function ScreenHome() {
  return (
    <Phone>
      <div style={{ padding: '6px 20px 14px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <Logo size={36}/>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 12, color: INK_SUB }}>Halo,</div>
          <div style={{ fontSize: 15, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
            Nila <span style={{ background: BRAND_SOFT, color: BRAND, fontSize: 9, padding: '2px 6px', borderRadius: 4, fontWeight: 700, letterSpacing: '.05em' }}>PRO</span>
          </div>
        </div>
        <button style={{ ...btnIcon, position: 'relative' }}>{Icon.bell}<span style={{ position: 'absolute', top: 8, right: 9, width: 7, height: 7, borderRadius: 99, background: BRAND, border: '2px solid #fff' }}/></button>
        <div style={{ width: 38, height: 38, borderRadius: 99, background: '#1A1A1F', color: '#fff', display: 'grid', placeItems: 'center', fontWeight: 700, fontSize: 14 }}>A</div>
      </div>

      <div style={{ padding: '0 20px 200px', overflowY: 'auto', height: 'calc(100% - 60px - 78px)' }}>
        {/* hero create card */}
        <div style={{
          borderRadius: 22, padding: 22, marginBottom: 18, color: '#fff',
          background: `linear-gradient(135deg, ${BRAND} 0%, #4A3FCC 100%)`,
          position: 'relative', overflow: 'hidden'
        }}>
          <div style={{ position: 'absolute', right: -30, top: -30, width: 150, height: 150, borderRadius: 99, background: 'rgba(255,255,255,.08)' }}/>
          <div style={{ position: 'absolute', right: 30, bottom: -40, width: 100, height: 100, borderRadius: 99, background: 'rgba(255,255,255,.06)' }}/>
          <div style={{ fontSize: 11, opacity: .85, marginBottom: 4, position: 'relative' }}>Mulai iklan baru</div>
          <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1.15, marginBottom: 14, position: 'relative' }}>
            Buka Dapur Konten<br/>buat iklan dalam menit
          </div>
          <button style={{
            background: '#fff', color: INK, border: 'none', padding: '10px 16px',
            borderRadius: 99, fontWeight: 600, fontSize: 12, display: 'inline-flex', alignItems: 'center', gap: 6, position: 'relative'
          }}>{Icon.plus} Iklan Baru</button>
        </div>

        {/* stats grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 18 }}>
          {[
            { l: 'Iklan Aktif', v: '3', sub: '+1 minggu ini', c: BRAND },
            { l: 'Jangkauan', v: '12.4k', sub: 'Warga Sumbersari', c: INK },
            { l: 'Klik', v: '892', sub: '↑ 18% vs minggu lalu', c: '#1A8F4F' },
            { l: 'Aset', v: '24', sub: '5 belum dipakai', c: INK },
          ].map((s, i) => (
            <div key={i} style={{ background: '#fff', border: `1px solid ${LINE}`, borderRadius: 16, padding: 14 }}>
              <div style={{ fontSize: 11, color: INK_SUB }}>{s.l}</div>
              <div style={{ fontSize: 22, fontWeight: 700, color: s.c, letterSpacing: '-0.02em', marginTop: 2 }}>{s.v}</div>
              <div style={{ fontSize: 10, color: INK_SUB, marginTop: 2 }}>{s.sub}</div>
            </div>
          ))}
        </div>

        {/* recent ads */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <div style={{ fontSize: 15, fontWeight: 700 }}>Iklan Terakhir</div>
          <button style={{ background: 'none', border: 'none', color: BRAND, fontSize: 12, fontWeight: 600 }}>Semua →</button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[
            { t: 'Promo Kopi Sore', s: 'Tayang · 4 hari lagi', r: '2.1k warga', c: '#1A8F4F', d: '#E3FCEC' },
            { t: 'Diskon Bakso Bu Tini', s: 'Tayang · 2 hari lagi', r: '1.4k warga', c: '#1A8F4F', d: '#E3FCEC' },
            { t: 'Workshop Batik', s: 'Draf · Belum tayang', r: 'Estimasi 800', c: INK_SUB, d: '#F4F4F7' },
          ].map((a, i) => (
            <div key={i} style={{ background: '#fff', border: `1px solid ${LINE}`, borderRadius: 14, padding: 12, display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 44, height: 44, borderRadius: 10, background: BRAND_SOFT, display: 'grid', placeItems: 'center', color: BRAND, flexShrink: 0 }}>{Icon.image}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: 13 }}>{a.t}</div>
                <div style={{ fontSize: 11, color: INK_SUB, marginTop: 2, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ display: 'inline-block', width: 6, height: 6, borderRadius: 99, background: a.d === '#E3FCEC' ? '#1A8F4F' : '#C7C7CF' }}/>
                  {a.s} · {a.r}
                </div>
              </div>
              <span style={{ color: INK_SUB }}>{Icon.chevron}</span>
            </div>
          ))}
        </div>
      </div>

      <BottomNav active={-1}/>
    </Phone>
  );
}

// ═══════════════════════════════════════════════════════════════
// SCREEN 2 — Dapur Konten (assets + audience + map)
// ═══════════════════════════════════════════════════════════════
function ScreenDapur() {
  return (
    <Phone>
      <AppHeader/>
      <PageTitle/>
      <StepRow active={1}/>
      <div style={{ padding: '0 20px 200px', overflowY: 'auto', height: 'calc(100% - 280px)', display: 'flex', flexDirection: 'column', gap: 14 }}>
        <AsetCard/>
        <AudiensCard/>
        <MapCard/>
      </div>
      <CTABar/>
      <BottomNav active={0}/>
    </Phone>
  );
}

// ═══════════════════════════════════════════════════════════════
// SCREEN 3 — AI Assistant + Live Preview
// ═══════════════════════════════════════════════════════════════
function ScreenAI() {
  return (
    <Phone>
      <AppHeader/>
      <PageTitle/>
      <StepRow active={2}/>
      <div style={{ padding: '0 20px 200px', overflowY: 'auto', height: 'calc(100% - 280px)', display: 'flex', flexDirection: 'column', gap: 14 }}>
        <AICard/>
        {/* social accounts */}
        <Card>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <div style={{ fontWeight: 600, fontSize: 14 }}>Akun Media Sosial</div>
            <button style={{ background: 'none', border: 'none', color: INK_SUB }}>{Icon.cog}</button>
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <div style={{ position: 'relative', width: 52, height: 52 }}>
              <div style={{ width: 52, height: 52, borderRadius: 99, background: 'linear-gradient(135deg,#E1306C,#F77737)', padding: 2 }}>
                <div style={{ width: '100%', height: '100%', borderRadius: 99, background: '#FFF6E8', display: 'grid', placeItems: 'center', color: '#E1306C', fontWeight: 700, fontSize: 18 }}>N</div>
              </div>
              <div style={{ position: 'absolute', bottom: -2, right: -2, width: 18, height: 18, borderRadius: 99, background: '#fff', display: 'grid', placeItems: 'center', color: '#E1306C' }}>{Icon.ig}</div>
            </div>
            <button style={{ width: 52, height: 52, borderRadius: 99, border: `1.5px dashed #D7D7DE`, background: 'transparent', color: INK_SUB, display: 'grid', placeItems: 'center' }}>{Icon.plus}</button>
            <div style={{ flex: 1, fontSize: 11, color: INK_SUB, lineHeight: 1.4 }}>Tambah akun untuk publikasi ke beberapa platform sekaligus.</div>
          </div>
        </Card>
        <PreviewCard/>
        {/* budget hint */}
        <div style={{ background: BRAND_SOFT, borderRadius: 16, padding: 14, display: 'flex', gap: 10, alignItems: 'flex-start' }}>
          <div style={{ width: 28, height: 28, borderRadius: 8, background: '#fff', color: BRAND, display: 'grid', placeItems: 'center', flexShrink: 0 }}>{Icon.sparkle}</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 600, fontSize: 13, color: BRAND }}>Atur Budget Lebih Pintar</div>
            <div style={{ fontSize: 11, color: INK, marginTop: 3, lineHeight: 1.45 }}>Segera hadir: rekomendasi platform terbaik berdasarkan performa iklan aktifmu.</div>
          </div>
        </div>
      </div>
      <CTABar/>
      <BottomNav active={0}/>
    </Phone>
  );
}

// Expose
Object.assign(window, { ScreenHome, ScreenDapur, ScreenAI });
