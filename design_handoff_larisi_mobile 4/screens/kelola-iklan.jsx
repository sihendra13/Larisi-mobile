/* global React */
// Kelola Iklan — mobile screens

// Reuse brand tokens (must match dapur-konten.jsx)
const KBRAND = '#6B5BFF';
const KBRAND_SOFT = '#EFECFF';
const KINK = '#0E0E12';
const KINK_SUB = '#6B6B73';
const KLINE = '#ECECF1';
const KBG = '#F5F5F7';
const KCARD = '#FFFFFF';
const KGREEN = '#1A8F4F';

const kStroke = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.6, strokeLinecap: 'round', strokeLinejoin: 'round' };
const KIcon = {
  bell:    <svg width="20" height="20" viewBox="0 0 24 24" {...kStroke}><path d="M6 9a6 6 0 0 1 12 0c0 5 2 6 2 7H4c0-1 2-2 2-7Z"/><path d="M10 19a2 2 0 0 0 4 0"/></svg>,
  search:  <svg width="18" height="18" viewBox="0 0 24 24" {...kStroke}><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>,
  back:    <svg width="22" height="22" viewBox="0 0 24 24" {...kStroke}><path d="M15 6l-6 6 6 6"/></svg>,
  more:    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><circle cx="5" cy="12" r="1.6"/><circle cx="12" cy="12" r="1.6"/><circle cx="19" cy="12" r="1.6"/></svg>,
  trash:   <svg width="16" height="16" viewBox="0 0 24 24" {...kStroke}><path d="M4 7h16M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2M6 7l1 13a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-13"/></svg>,
  filter:  <svg width="16" height="16" viewBox="0 0 24 24" {...kStroke}><path d="M4 5h16M7 12h10M10 19h4"/></svg>,
  sparkle: <svg width="16" height="16" viewBox="0 0 24 24" {...kStroke}><path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M6 18l2.5-2.5M15.5 8.5 18 6"/></svg>,
  send:    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M3 4l18 8-18 8 4-8z"/></svg>,
  ig:      <svg width="13" height="13" viewBox="0 0 24 24" {...kStroke}><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="0.8" fill="currentColor"/></svg>,
  up:      <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><path d="M12 5l8 10H4z"/></svg>,
  chat:    <svg width="22" height="22" viewBox="0 0 24 24" {...kStroke}><path d="M4 6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-7l-4 3v-3H6a2 2 0 0 1-2-2Z"/></svg>,
  plus:    <svg width="18" height="18" viewBox="0 0 24 24" {...kStroke}><path d="M12 5v14M5 12h14"/></svg>,
  pause:   <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="5" width="4" height="14" rx="1"/><rect x="14" y="5" width="4" height="14" rx="1"/></svg>,
  rocket:  <svg width="14" height="14" viewBox="0 0 24 24" {...kStroke}><path d="M14 4s5 1 6 6c0 0-3 0-5 2-2 2-2 5-2 5-5-1-6-6-6-6 0 0 3 0 5-2s2-5 2-5Z"/><path d="M9 15l-3 3M5 13a3 3 0 0 0-2 5 3 3 0 0 0 5-2"/></svg>,
};

function KLogo({ size = 32 }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: size * 0.28,
      background: `linear-gradient(135deg, ${KBRAND} 0%, #8C7BFF 100%)`,
      display: 'grid', placeItems: 'center', color: '#fff',
      fontWeight: 800, fontSize: size * 0.5, fontFamily: 'Inter, sans-serif',
      letterSpacing: '-0.04em',
      boxShadow: '0 6px 18px -8px rgba(107,91,255,0.6)'
    }}>L</div>
  );
}

// Phone shell — reused style
function KPhone({ children }) {
  return (
    <div style={{ width: 390, height: 844, background: KBG, position: 'relative', overflow: 'hidden', fontFamily: 'Inter, sans-serif', color: KINK }}>
      <div style={{ height: 50, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', padding: '0 28px 8px', fontSize: 15, fontWeight: 600 }}>
        <span>9:41</span>
        <span style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <svg width="17" height="11" viewBox="0 0 17 11" fill="currentColor"><rect x="0" y="6" width="3" height="5" rx=".5"/><rect x="4.5" y="4" width="3" height="7" rx=".5"/><rect x="9" y="2" width="3" height="9" rx=".5"/><rect x="13.5" y="0" width="3" height="11" rx=".5"/></svg>
          <svg width="16" height="11" viewBox="0 0 16 11" fill="currentColor"><path d="M8 2.2c2.1 0 4 .8 5.3 2.2l1-1A8 8 0 0 0 8 1a8 8 0 0 0-6.3 2.4l1 1A7.4 7.4 0 0 1 8 2.2Z"/><path d="M8 5.5c1.2 0 2.4.5 3.2 1.3l1-1A6 6 0 0 0 8 4.2 6 6 0 0 0 3.8 5.8l1 1A4.6 4.6 0 0 1 8 5.5Z"/><circle cx="8" cy="9.5" r="1.3"/></svg>
          <div style={{ width: 24, height: 11, border: `1px solid ${KINK}`, borderRadius: 3, padding: 1 }}>
            <div style={{ width: '78%', height: '100%', background: KINK, borderRadius: 1 }}/>
          </div>
        </span>
      </div>
      {children}
    </div>
  );
}

// Header for Kelola Iklan
function KHeader({ title = 'Kelola Iklan', subtitle = 'Pantau iklanmu secara real-time' }) {
  return (
    <div style={{ padding: '6px 20px 14px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
        <KLogo size={34}/>
        <div style={{ flex: 1 }}/>
        <button style={kBtnIcon}>{KIcon.search}</button>
        <button style={{ ...kBtnIcon, position: 'relative' }}>{KIcon.bell}<span style={{ position: 'absolute', top: 8, right: 9, width: 7, height: 7, borderRadius: 99, background: KBRAND, border: '2px solid #fff' }}/></button>
        <div style={{ width: 34, height: 34, borderRadius: 99, background: '#1A1A1F', color: '#fff', display: 'grid', placeItems: 'center', fontWeight: 700, fontSize: 13 }}>A</div>
      </div>
      <div style={{ fontSize: 24, fontWeight: 700, letterSpacing: '-0.02em' }}>{title}</div>
      <div style={{ fontSize: 12, color: KINK_SUB, marginTop: 3 }}>{subtitle}</div>
    </div>
  );
}
const kBtnIcon = {
  width: 36, height: 36, borderRadius: 99, border: `1px solid ${KLINE}`,
  background: KCARD, display: 'grid', placeItems: 'center', color: KINK, cursor: 'pointer'
};

// Bar dengan filter pills + AI button
function KFilterBar({ active = 'Semua', onAI }) {
  const tabs = ['Semua', 'Berjalan', 'Diarsipkan'];
  return (
    <div style={{ padding: '0 20px 14px', display: 'flex', gap: 8, alignItems: 'center' }}>
      <div style={{ display: 'flex', gap: 6, padding: 4, background: KCARD, border: `1px solid ${KLINE}`, borderRadius: 99 }}>
        {tabs.map(t => (
          <button key={t} style={{
            padding: '7px 14px', borderRadius: 99, border: 'none',
            background: t === active ? KBRAND : 'transparent',
            color: t === active ? '#fff' : KINK_SUB,
            fontWeight: 600, fontSize: 12, cursor: 'pointer',
          }}>{t}</button>
        ))}
      </div>
      <div style={{ flex: 1 }}/>
      <button style={kBtnIcon}>{KIcon.filter}</button>
    </div>
  );
}

// Faux thumbnail image (striped placeholder with tone)
function KThumb({ tone = 'amber' }) {
  const tones = {
    amber:  ['#E8C988', '#A87A3B'],
    indigo: ['#8C7BFF', '#3F33A8'],
    sage:   ['#B8C9A8', '#5A7044'],
  };
  const [a, b] = tones[tone] || tones.amber;
  return (
    <div style={{ width: '100%', height: 180, borderRadius: 12, overflow: 'hidden', position: 'relative', background: `linear-gradient(135deg, ${a} 0%, ${b} 100%)` }}>
      <svg width="100%" height="100%" viewBox="0 0 350 180" preserveAspectRatio="xMidYMid slice" style={{ position: 'absolute', inset: 0 }}>
        <defs>
          <pattern id={`p-${tone}`} width="14" height="14" patternUnits="userSpaceOnUse" patternTransform="rotate(35)">
            <line x1="0" y1="0" x2="0" y2="14" stroke="rgba(255,255,255,.18)" strokeWidth="2"/>
          </pattern>
        </defs>
        <rect width="350" height="180" fill={`url(#p-${tone})`}/>
        {/* faux subject shapes */}
        <circle cx="80" cy="120" r="40" fill="rgba(0,0,0,.15)"/>
        <rect x="180" y="60" width="120" height="80" rx="8" fill="rgba(255,255,255,.12)"/>
        <rect x="200" y="80" width="80" height="40" rx="4" fill="rgba(0,0,0,.1)"/>
      </svg>
      <div style={{ position: 'absolute', bottom: 8, left: 10, padding: '3px 8px', borderRadius: 6, background: 'rgba(0,0,0,.45)', backdropFilter: 'blur(4px)', color: '#fff', fontSize: 10, fontFamily: 'ui-monospace, monospace' }}>
        product photo
      </div>
    </div>
  );
}

// Single ad card
function KAdCard({ title, handle, date, tone, views, reach, reachPct, comments = 0, isReel = false }) {
  return (
    <div style={{ background: KCARD, border: `1px solid ${KLINE}`, borderRadius: 18, padding: 14 }}>
      {/* top row: avatar + title + status */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
        <div style={{ position: 'relative', width: 36, height: 36 }}>
          <div style={{ width: 36, height: 36, borderRadius: 99, background: 'linear-gradient(135deg,#E1306C,#F77737)', padding: 2 }}>
            <div style={{ width: '100%', height: '100%', borderRadius: 99, background: '#FFF6E8', display: 'grid', placeItems: 'center', color: '#E1306C', fontWeight: 700, fontSize: 14 }}>N</div>
          </div>
          <div style={{ position: 'absolute', bottom: -2, right: -2, width: 16, height: 16, borderRadius: 99, background: '#fff', display: 'grid', placeItems: 'center', color: '#E1306C' }}>{KIcon.ig}</div>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 600, fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
            {title}
            {isReel && <span style={{ fontSize: 9, fontWeight: 700, padding: '2px 5px', borderRadius: 4, background: '#F4F4F7', color: KINK_SUB }}>REEL</span>}
          </div>
          <div style={{ fontSize: 11, color: KINK_SUB }}>{handle}</div>
        </div>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '4px 9px', background: '#E3FCEC', color: KGREEN, borderRadius: 99, fontSize: 10, fontWeight: 700 }}>
          <span style={{ width: 6, height: 6, borderRadius: 99, background: KGREEN }}/> Berjalan
        </span>
        <button style={{ background: 'none', border: 'none', color: KINK_SUB, padding: 0 }}>{KIcon.more}</button>
      </div>

      <div style={{ fontSize: 11, color: KBRAND, fontWeight: 600, marginBottom: 10 }}>{date}</div>

      <KThumb tone={tone}/>

      {/* engagements header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: 14, marginBottom: 10 }}>
        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', color: KBRAND }}>ENGAGEMENTS</div>
        <div style={{ fontSize: 18, fontWeight: 700, color: KBRAND }}>{comments + views + reach}</div>
      </div>

      {/* metrics list */}
      <div style={{ display: 'grid', gap: 8, fontSize: 12 }}>
        {[
          { l: 'Reactions', v: 0 },
          { l: 'Comments',  v: comments },
          { l: 'Shares',    v: 0 },
          { l: 'Views',     v: views },
        ].map((m, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: KINK_SUB }}>{m.l}</span>
            <span style={{ fontWeight: 600 }}>{m.v}</span>
          </div>
        ))}
        {/* Reach with progress */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
            <span style={{ color: KINK_SUB }}>Reach</span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontWeight: 600 }}>
              {reach} <span style={{ color: KGREEN }}>{KIcon.up}</span>
            </span>
          </div>
          <div style={{ height: 3, background: '#EFEFF3', borderRadius: 4, overflow: 'hidden' }}>
            <div style={{ width: `${reachPct}%`, height: '100%', background: KBRAND, borderRadius: 4 }}/>
          </div>
        </div>
      </div>

      {/* boost button */}
      <button style={{
        width: '100%', marginTop: 14, padding: '12px', borderRadius: 12,
        background: KINK, color: '#fff', border: 'none', fontWeight: 600, fontSize: 13,
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
      }}>{KIcon.rocket} Boost</button>
    </div>
  );
}

// Floating AI button
function KFloatingAI() {
  return (
    <button style={{
      position: 'absolute', right: 18, bottom: 92, width: 56, height: 56, borderRadius: 99,
      background: `linear-gradient(135deg, ${KBRAND} 0%, #4A3FCC 100%)`,
      color: '#fff', border: 'none', display: 'grid', placeItems: 'center',
      boxShadow: '0 14px 30px -8px rgba(107,91,255,0.55)', cursor: 'pointer',
      zIndex: 5
    }}>
      <div style={{ position: 'relative' }}>
        {KIcon.sparkle}
        <span style={{ position: 'absolute', top: -4, right: -6, width: 8, height: 8, borderRadius: 99, background: '#fff', border: `2px solid ${KBRAND}` }}/>
      </div>
    </button>
  );
}

// Bottom tabs (reused style)
function KBottomNav({ active = 0 }) {
  const items = [
    { l: 'Dapur',    ic: <svg width="22" height="22" viewBox="0 0 24 24" {...kStroke}><rect x="4" y="4" width="7" height="7" rx="1.5"/><rect x="13" y="4" width="7" height="7" rx="1.5"/><rect x="4" y="13" width="7" height="7" rx="1.5"/><rect x="13" y="13" width="7" height="7" rx="1.5"/></svg> },
    { l: 'Kelola',   ic: <svg width="22" height="22" viewBox="0 0 24 24" {...kStroke}><path d="M3 6h18M3 12h18M3 18h18"/><circle cx="7" cy="6"  r="2" fill="#fff"/><circle cx="14" cy="12" r="2" fill="#fff"/><circle cx="9" cy="18"  r="2" fill="#fff"/></svg> },
    { l: 'Performa', ic: <svg width="22" height="22" viewBox="0 0 24 24" {...kStroke}><path d="M4 20h16"/><rect x="6" y="11" width="3" height="7" rx="0.5"/><rect x="11" y="7" width="3" height="11" rx="0.5"/><rect x="16" y="14" width="3" height="4" rx="0.5"/></svg> },
  ];
  return (
    <div style={{
      position: 'absolute', bottom: 0, left: 0, right: 0,
      height: 78, background: '#fff', borderTop: `1px solid ${KLINE}`,
      display: 'flex', padding: '8px 8px 22px',
    }}>
      {items.map((x, i) => (
        <button key={i} style={{
          flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
          background: 'transparent', border: 'none',
          color: i === active ? KBRAND : KINK_SUB, fontSize: 10, fontWeight: 600,
        }}>{x.ic}{x.l}</button>
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// SCREEN 4 — Kelola Iklan list
// ═══════════════════════════════════════════════════════════════
function ScreenKelola() {
  return (
    <KPhone>
      <KHeader title="Kelola Iklan" subtitle="Pantau iklan yang sedang berjalan secara real-time."/>
      <KFilterBar active="Semua"/>
      <div style={{ padding: '0 20px 200px', overflowY: 'auto', height: 'calc(100% - 230px)', display: 'flex', flexDirection: 'column', gap: 14 }}>
        <KAdCard
          title="Post IG foto" handle="@tesakunlarisi"
          date="Minggu, 24 Mei 2026 · 10.54"
          tone="amber" views={2} reach={1} reachPct={3}
        />
        <KAdCard
          title="Reel Pondok Indah Jakarta" handle="@tesakunlarisi"
          date="Minggu, 24 Mei 2026 · 09.37" isReel
          tone="indigo" views={114} reach={109} reachPct={62}
        />
        <KAdCard
          title="Promo Kopi Sore" handle="@tesakunlarisi"
          date="Sabtu, 23 Mei 2026 · 16.20"
          tone="sage" views={68} reach={54} reachPct={31}
        />
      </div>
      <KFloatingAI/>
      <KBottomNav active={1}/>
    </KPhone>
  );
}

// ═══════════════════════════════════════════════════════════════
// SCREEN 5 — Detail iklan focus
// ═══════════════════════════════════════════════════════════════
function ScreenDetail() {
  return (
    <KPhone>
      <div style={{ padding: '6px 20px 12px', display: 'flex', alignItems: 'center', gap: 10 }}>
        <button style={kBtnIcon}>{KIcon.back}</button>
        <div style={{ flex: 1, textAlign: 'center', fontSize: 14, fontWeight: 600 }}>Detail Iklan</div>
        <button style={kBtnIcon}>{KIcon.more}</button>
      </div>

      <div style={{ padding: '0 20px 200px', overflowY: 'auto', height: 'calc(100% - 110px)' }}>
        {/* Hero with image */}
        <div style={{ borderRadius: 18, overflow: 'hidden', marginBottom: 14, background: KCARD, border: `1px solid ${KLINE}` }}>
          <div style={{ padding: 14, display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ position: 'relative', width: 38, height: 38 }}>
              <div style={{ width: 38, height: 38, borderRadius: 99, background: 'linear-gradient(135deg,#E1306C,#F77737)', padding: 2 }}>
                <div style={{ width: '100%', height: '100%', borderRadius: 99, background: '#FFF6E8', display: 'grid', placeItems: 'center', color: '#E1306C', fontWeight: 700, fontSize: 14 }}>N</div>
              </div>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, fontSize: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
                Reel Pondok Indah Jakarta
                <span style={{ fontSize: 9, fontWeight: 700, padding: '2px 5px', borderRadius: 4, background: '#F4F4F7', color: KINK_SUB }}>REEL</span>
              </div>
              <div style={{ fontSize: 11, color: KINK_SUB }}>@tesakunlarisi · Minggu, 24 Mei · 09.37</div>
            </div>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '4px 9px', background: '#E3FCEC', color: KGREEN, borderRadius: 99, fontSize: 10, fontWeight: 700 }}>
              <span style={{ width: 6, height: 6, borderRadius: 99, background: KGREEN }}/> Berjalan
            </span>
          </div>
          <div style={{ padding: '0 14px 14px' }}>
            <KThumb tone="indigo"/>
          </div>
        </div>

        {/* metric tiles */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
          {[
            { l: 'Engagements', v: '223', sub: 'Total interaksi', big: true },
            { l: 'Reach',       v: '109', sub: '↑ 18% hari ini', big: true },
            { l: 'Views',       v: '114', sub: '24 jam terakhir' },
            { l: 'Reactions',   v: '0',   sub: 'Belum ada' },
            { l: 'Comments',    v: '0',   sub: 'Belum ada' },
            { l: 'Shares',      v: '0',   sub: 'Belum ada' },
          ].map((m, i) => (
            <div key={i} style={{ background: KCARD, border: `1px solid ${KLINE}`, borderRadius: 14, padding: 12 }}>
              <div style={{ fontSize: 10, color: KINK_SUB, fontWeight: 600, letterSpacing: '.04em' }}>{m.l.toUpperCase()}</div>
              <div style={{ fontSize: m.big ? 22 : 18, fontWeight: 700, color: m.big ? KBRAND : KINK, letterSpacing: '-0.02em', marginTop: 2 }}>{m.v}</div>
              <div style={{ fontSize: 10, color: KINK_SUB, marginTop: 2 }}>{m.sub}</div>
            </div>
          ))}
        </div>

        {/* mini chart */}
        <div style={{ background: KCARD, border: `1px solid ${KLINE}`, borderRadius: 16, padding: 14, marginBottom: 14 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <div style={{ fontWeight: 600, fontSize: 13 }}>Jangkauan 7 Hari</div>
            <span style={{ fontSize: 10, color: KBRAND, fontWeight: 700 }}>+62%</span>
          </div>
          <svg width="100%" height="80" viewBox="0 0 320 80" preserveAspectRatio="none">
            <defs>
              <linearGradient id="kgrad" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0" stopColor={KBRAND} stopOpacity="0.25"/>
                <stop offset="1" stopColor={KBRAND} stopOpacity="0"/>
              </linearGradient>
            </defs>
            <path d="M0 70 L45 60 L90 65 L135 45 L180 50 L225 28 L270 32 L320 12 L320 80 L0 80 Z" fill="url(#kgrad)"/>
            <path d="M0 70 L45 60 L90 65 L135 45 L180 50 L225 28 L270 32 L320 12" stroke={KBRAND} strokeWidth="2" fill="none" strokeLinecap="round"/>
            <circle cx="320" cy="12" r="4" fill={KBRAND}/>
          </svg>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9, color: KINK_SUB, marginTop: 4 }}>
            {['Sen','Sel','Rab','Kam','Jum','Sab','Min'].map(d => <span key={d}>{d}</span>)}
          </div>
        </div>

        {/* SiLaris insight card */}
        <div style={{
          background: `linear-gradient(135deg, ${KBRAND_SOFT} 0%, #F6F2FF 100%)`,
          border: `1px solid #DCD4FF`, borderRadius: 16, padding: 14, marginBottom: 14,
          display: 'flex', gap: 10
        }}>
          <div style={{ width: 32, height: 32, borderRadius: 10, background: '#fff', color: KBRAND, display: 'grid', placeItems: 'center', flexShrink: 0 }}>{KIcon.sparkle}</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: KBRAND, letterSpacing: '.04em' }}>INSIGHT SiLARIS</div>
            <div style={{ fontSize: 12, color: KINK, marginTop: 4, lineHeight: 1.45 }}>
              Reel ini menarik 109 warga sekitar. Coba <strong>Boost +5km</strong> untuk gandakan jangkauan dalam 24 jam.
            </div>
            <button style={{ marginTop: 10, padding: '7px 12px', borderRadius: 99, background: KBRAND, color: '#fff', border: 'none', fontSize: 11, fontWeight: 600 }}>
              Tanya SiLaris →
            </button>
          </div>
        </div>
      </div>

      {/* sticky action bar */}
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, padding: '14px 16px 28px', background: 'linear-gradient(180deg, rgba(245,245,247,0) 0%, #F5F5F7 30%)' }}>
        <div style={{ display: 'flex', gap: 10 }}>
          <button style={{ flex: 1, padding: '13px', borderRadius: 14, background: KCARD, color: KINK, border: `1px solid ${KLINE}`, fontWeight: 600, fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
            {KIcon.pause} Jeda
          </button>
          <button style={{ flex: 2, padding: '13px', borderRadius: 14, background: KINK, color: '#fff', border: 'none', fontWeight: 600, fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
            {KIcon.rocket} Boost Iklan
          </button>
        </div>
      </div>
    </KPhone>
  );
}

// ═══════════════════════════════════════════════════════════════
// SCREEN 6 — Chat SiLaris
// ═══════════════════════════════════════════════════════════════
function ScreenSiLaris() {
  return (
    <KPhone>
      <div style={{ padding: '6px 20px 12px', display: 'flex', alignItems: 'center', gap: 10, borderBottom: `1px solid ${KLINE}` }}>
        <button style={kBtnIcon}>{KIcon.back}</button>
        <div style={{ width: 38, height: 38, borderRadius: 99, background: KBRAND_SOFT, color: KBRAND, display: 'grid', placeItems: 'center' }}>
          {KIcon.sparkle}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 14, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
            SiLaris
            <span style={{ width: 6, height: 6, borderRadius: 99, background: KGREEN }}/>
          </div>
          <div style={{ fontSize: 10, color: KINK_SUB }}>Asisten cerdas · online</div>
        </div>
        <button style={kBtnIcon}>{KIcon.more}</button>
      </div>

      {/* messages */}
      <div style={{ padding: '18px 20px 18px', overflowY: 'auto', height: 'calc(100% - 80px - 130px)', display: 'flex', flexDirection: 'column', gap: 14 }}>
        {/* AI welcome */}
        <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
          <div style={{ width: 28, height: 28, borderRadius: 99, background: KBRAND_SOFT, color: KBRAND, display: 'grid', placeItems: 'center', flexShrink: 0 }}>{KIcon.sparkle}</div>
          <div style={{
            background: KCARD, border: `1px solid ${KLINE}`, padding: '12px 14px',
            borderRadius: '16px 16px 16px 4px', maxWidth: 270,
          }}>
            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>Halo Nila 👋</div>
            <div style={{ fontSize: 12, color: KINK_SUB, lineHeight: 1.5 }}>
              Aku SiLaris, asisten cerdas yang siap bantu iklan kamu jadi rebutan pelanggan. Pilih iklan di bawah untuk mulai.
            </div>
          </div>
        </div>

        {/* attached ad chip */}
        <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
          <div style={{ width: 28, flexShrink: 0 }}/>
          <div style={{ display: 'flex', gap: 8, padding: 10, background: KCARD, border: `1px solid ${KLINE}`, borderRadius: 14, alignItems: 'center', maxWidth: 270 }}>
            <div style={{ width: 38, height: 38, borderRadius: 8, background: 'linear-gradient(135deg,#8C7BFF,#3F33A8)', flexShrink: 0 }}/>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 11, fontWeight: 600 }}>Reel Pondok Indah Jakarta</div>
              <div style={{ fontSize: 10, color: KINK_SUB }}>Reach 109 · ↑ 62%</div>
            </div>
            <button style={{ padding: '5px 10px', background: KBRAND, color: '#fff', border: 'none', borderRadius: 99, fontSize: 10, fontWeight: 600 }}>Pilih</button>
          </div>
        </div>

        {/* user message */}
        <div style={{ alignSelf: 'flex-end', maxWidth: 270 }}>
          <div style={{
            background: KBRAND, color: '#fff', padding: '10px 14px',
            borderRadius: '16px 16px 4px 16px', fontSize: 13, lineHeight: 1.45,
          }}>
            Iklan reelku kok views naik tapi reaksi nol? Apa yang harus aku perbaiki?
          </div>
          <div style={{ fontSize: 9, color: KINK_SUB, textAlign: 'right', marginTop: 4 }}>10.42 · Terkirim</div>
        </div>

        {/* AI typing answer */}
        <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
          <div style={{ width: 28, height: 28, borderRadius: 99, background: KBRAND_SOFT, color: KBRAND, display: 'grid', placeItems: 'center', flexShrink: 0 }}>{KIcon.sparkle}</div>
          <div style={{ background: KCARD, border: `1px solid ${KLINE}`, padding: '12px 14px', borderRadius: '16px 16px 16px 4px', maxWidth: 270 }}>
            <div style={{ fontSize: 12, color: KINK, lineHeight: 1.5 }}>
              Berdasarkan data 24 jam, viewers <strong>scroll cepat</strong> di detik 3-5. Coba 3 hal ini:
            </div>
            <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 6 }}>
              {[
                { n: 1, t: 'Tambahkan CTA "Ketuk untuk pesan" di detik pertama' },
                { n: 2, t: 'Ganti caption ke pertanyaan: "Sudah coba kulit asli?"' },
                { n: 3, t: 'Boost +5km, target warga umur 25-40' },
              ].map(x => (
                <div key={x.n} style={{ display: 'flex', gap: 8, alignItems: 'flex-start', fontSize: 11, lineHeight: 1.4 }}>
                  <span style={{ width: 18, height: 18, borderRadius: 99, background: KBRAND_SOFT, color: KBRAND, fontSize: 10, fontWeight: 700, display: 'grid', placeItems: 'center', flexShrink: 0, marginTop: 1 }}>{x.n}</span>
                  <span>{x.t}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* suggestion chips */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginLeft: 36 }}>
          {['Terapkan saran #3', 'Lihat audiens', 'Buat caption baru'].map(s => (
            <button key={s} style={{ padding: '7px 12px', borderRadius: 99, background: KCARD, border: `1px solid ${KBRAND}`, color: KBRAND, fontSize: 11, fontWeight: 600 }}>
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* input area */}
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, padding: '14px 16px 28px', background: '#fff', borderTop: `1px solid ${KLINE}` }}>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <button style={{ width: 38, height: 38, borderRadius: 99, border: `1px solid ${KLINE}`, background: '#fff', color: KINK_SUB, display: 'grid', placeItems: 'center' }}>{KIcon.plus}</button>
          <div style={{ flex: 1, padding: '10px 14px', borderRadius: 99, background: KBG, border: `1px solid ${KLINE}`, fontSize: 12, color: KINK_SUB }}>
            Ketik pesan ke SiLaris…
          </div>
          <button style={{ width: 38, height: 38, borderRadius: 99, background: KBRAND, color: '#fff', border: 'none', display: 'grid', placeItems: 'center' }}>{KIcon.send}</button>
        </div>
      </div>
    </KPhone>
  );
}

Object.assign(window, { ScreenKelola, ScreenDetail, ScreenSiLaris });
