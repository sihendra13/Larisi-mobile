/* global React */
// Performa Iklan — mobile screens

const PBRAND = '#6B5BFF';
const PBRAND_SOFT = '#EFECFF';
const PINK = '#0E0E12';
const PINK_SUB = '#6B6B73';
const PLINE = '#ECECF1';
const PBG = '#F5F5F7';
const PCARD = '#FFFFFF';
const PGREEN = '#1A8F4F';
const POR = '#E89B3C';
const PBLUE = '#3B82F6';

const pStroke = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.6, strokeLinecap: 'round', strokeLinejoin: 'round' };
const PIcon = {
  bell:    <svg width="20" height="20" viewBox="0 0 24 24" {...pStroke}><path d="M6 9a6 6 0 0 1 12 0c0 5 2 6 2 7H4c0-1 2-2 2-7Z"/><path d="M10 19a2 2 0 0 0 4 0"/></svg>,
  search:  <svg width="18" height="18" viewBox="0 0 24 24" {...pStroke}><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>,
  info:    <svg width="13" height="13" viewBox="0 0 24 24" {...pStroke}><circle cx="12" cy="12" r="9"/><path d="M12 8h.01M11 12h1v5h1"/></svg>,
  refresh: <svg width="14" height="14" viewBox="0 0 24 24" {...pStroke}><path d="M20 12a8 8 0 1 0-2.5 5.8"/><path d="M20 6v5h-5"/></svg>,
  sparkle: <svg width="16" height="16" viewBox="0 0 24 24" {...pStroke}><path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M6 18l2.5-2.5M15.5 8.5 18 6"/></svg>,
  bulb:    <svg width="14" height="14" viewBox="0 0 24 24" {...pStroke}><path d="M9 18h6M10 22h4M12 2a6 6 0 0 0-4 10.5c.5.5 1 1.5 1 2.5v1h6v-1c0-1 .5-2 1-2.5A6 6 0 0 0 12 2Z"/></svg>,
  target:  <svg width="14" height="14" viewBox="0 0 24 24" {...pStroke}><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.5" fill="currentColor"/></svg>,
  clock:   <svg width="16" height="16" viewBox="0 0 24 24" {...pStroke}><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>,
  cal:     <svg width="16" height="16" viewBox="0 0 24 24" {...pStroke}><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 9h18M8 3v4M16 3v4"/></svg>,
  pin:     <svg width="16" height="16" viewBox="0 0 24 24" {...pStroke}><path d="M12 22s7-6.5 7-12a7 7 0 1 0-14 0c0 5.5 7 12 7 12Z"/><circle cx="12" cy="10" r="2.5"/></svg>,
  film:    <svg width="16" height="16" viewBox="0 0 24 24" {...pStroke}><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 9h18M3 15h18M9 5v14M15 5v14"/></svg>,
  rocket:  <svg width="14" height="14" viewBox="0 0 24 24" {...pStroke}><path d="M14 4s5 1 6 6c0 0-3 0-5 2-2 2-2 5-2 5-5-1-6-6-6-6 0 0 3 0 5-2s2-5 2-5Z"/><path d="M9 15l-3 3M5 13a3 3 0 0 0-2 5 3 3 0 0 0 5-2"/></svg>,
  bars:    <svg width="22" height="22" viewBox="0 0 24 24" {...pStroke}><path d="M4 20h16"/><rect x="6" y="11" width="3" height="7" rx="0.5"/><rect x="11" y="7" width="3" height="11" rx="0.5"/><rect x="16" y="14" width="3" height="4" rx="0.5"/></svg>,
  zoom:    <svg width="16" height="16" viewBox="0 0 24 24" {...pStroke}><circle cx="11" cy="11" r="6"/><path d="m20 20-4.5-4.5M11 8v6M8 11h6"/></svg>,
  bolt:    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M13 2 4 14h6l-1 8 9-12h-6z"/></svg>,
  bookmark:<svg width="16" height="16" viewBox="0 0 24 24" {...pStroke}><path d="M6 4h12v18l-6-4-6 4z"/></svg>,
  chev:    <svg width="16" height="16" viewBox="0 0 24 24" {...pStroke}><path d="m6 9 6 6 6-6"/></svg>,
};

function PLogo({ size = 32 }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: size * 0.28,
      background: `linear-gradient(135deg, ${PBRAND} 0%, #8C7BFF 100%)`,
      display: 'grid', placeItems: 'center', color: '#fff',
      fontWeight: 800, fontSize: size * 0.5,
      letterSpacing: '-0.04em',
      boxShadow: '0 6px 18px -8px rgba(107,91,255,0.6)'
    }}>L</div>
  );
}

function PPhone({ children }) {
  return (
    <div style={{ width: 390, height: 844, background: PBG, position: 'relative', overflow: 'hidden', fontFamily: 'Inter, sans-serif', color: PINK }}>
      <div style={{ height: 50, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', padding: '0 28px 8px', fontSize: 15, fontWeight: 600 }}>
        <span>9:41</span>
        <span style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <svg width="17" height="11" viewBox="0 0 17 11" fill="currentColor"><rect x="0" y="6" width="3" height="5" rx=".5"/><rect x="4.5" y="4" width="3" height="7" rx=".5"/><rect x="9" y="2" width="3" height="9" rx=".5"/><rect x="13.5" y="0" width="3" height="11" rx=".5"/></svg>
          <svg width="16" height="11" viewBox="0 0 16 11" fill="currentColor"><path d="M8 2.2c2.1 0 4 .8 5.3 2.2l1-1A8 8 0 0 0 8 1a8 8 0 0 0-6.3 2.4l1 1A7.4 7.4 0 0 1 8 2.2Z"/><path d="M8 5.5c1.2 0 2.4.5 3.2 1.3l1-1A6 6 0 0 0 8 4.2 6 6 0 0 0 3.8 5.8l1 1A4.6 4.6 0 0 1 8 5.5Z"/><circle cx="8" cy="9.5" r="1.3"/></svg>
          <div style={{ width: 24, height: 11, border: `1px solid ${PINK}`, borderRadius: 3, padding: 1 }}>
            <div style={{ width: '78%', height: '100%', background: PINK, borderRadius: 1 }}/>
          </div>
        </span>
      </div>
      {children}
    </div>
  );
}

const pBtnIcon = {
  width: 36, height: 36, borderRadius: 99, border: `1px solid ${PLINE}`,
  background: PCARD, display: 'grid', placeItems: 'center', color: PINK, cursor: 'pointer'
};

function PHeader({ title = 'Performa Iklan', subtitle = 'Lihat hasil & temukan saran pintar.' }) {
  return (
    <div style={{ padding: '6px 20px 12px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
        <PLogo size={34}/>
        <div style={{ flex: 1 }}/>
        <button style={pBtnIcon}>{PIcon.search}</button>
        <button style={{ ...pBtnIcon, position: 'relative' }}>{PIcon.bell}<span style={{ position: 'absolute', top: 8, right: 9, width: 7, height: 7, borderRadius: 99, background: PBRAND, border: '2px solid #fff' }}/></button>
        <div style={{ width: 34, height: 34, borderRadius: 99, background: '#1A1A1F', color: '#fff', display: 'grid', placeItems: 'center', fontWeight: 700, fontSize: 13 }}>A</div>
      </div>
      <div style={{ fontSize: 24, fontWeight: 700, letterSpacing: '-0.02em' }}>{title}</div>
      <div style={{ fontSize: 12, color: PINK_SUB, marginTop: 3 }}>{subtitle}</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 10, color: PINK_SUB, marginTop: 10 }}>
        <span style={{ width: 6, height: 6, borderRadius: 99, background: PGREEN }}/>
        Diperbarui baru saja
        <span style={{ marginLeft: 'auto', display: 'inline-flex', alignItems: 'center', gap: 4, color: PBRAND, fontWeight: 600 }}>
          {PIcon.refresh} Refresh
        </span>
      </div>
    </div>
  );
}

// Top tabs (Insight / Local Pulse / Tools)
function PTabs({ active = 0 }) {
  const tabs = ['Insight', 'Local Pulse', 'Tools'];
  return (
    <div style={{ padding: '0 20px 14px', display: 'flex', gap: 6 }}>
      {tabs.map((t, i) => (
        <button key={t} style={{
          flex: 1, padding: '9px 8px', borderRadius: 10,
          border: i === active ? 'none' : `1px solid ${PLINE}`,
          background: i === active ? PINK : PCARD,
          color: i === active ? '#fff' : PINK_SUB,
          fontWeight: 600, fontSize: 12, cursor: 'pointer',
        }}>{t}</button>
      ))}
    </div>
  );
}

// Stat card with colored accent
function StatCard({ label, value, sub, accent, big }) {
  return (
    <div style={{
      background: PCARD, borderRadius: 14, padding: '14px 14px 12px',
      border: `1px solid ${PLINE}`, position: 'relative', overflow: 'hidden',
    }}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: accent }}/>
      <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 9, fontWeight: 700, color: PINK_SUB, letterSpacing: '.08em' }}>
        {label}<span style={{ color: '#C7C7CF' }}>{PIcon.info}</span>
      </div>
      <div style={{ fontSize: big ? 30 : 26, fontWeight: 700, letterSpacing: '-0.02em', marginTop: 4, lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 10, color: PINK_SUB, marginTop: 6, lineHeight: 1.35 }}>{sub}</div>
    </div>
  );
}

// SiLaris analysis card
function SiLarisCard() {
  return (
    <div style={{ background: PCARD, border: `1px solid ${PLINE}`, borderRadius: 18, padding: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: PBRAND_SOFT, color: PBRAND, display: 'grid', placeItems: 'center' }}>{PIcon.sparkle}</div>
        <div>
          <div style={{ fontWeight: 700, fontSize: 14, color: PBRAND }}>SiLaris</div>
          <div style={{ fontSize: 11, color: PINK_SUB }}>Social Media Analysis</div>
        </div>
      </div>
      <div style={{ fontSize: 12.5, color: PINK, lineHeight: 1.55 }}>
        Nila Craft, kamu di jalur yang tepat! Kamu telah membuat <strong>2 iklan</strong> dan mencapai <strong>110 orang</strong> secara organik, namun <em>engagement rate</em> belum bisa dihitung karena reach masih terlalu sedikit.
      </div>
      <div style={{ fontSize: 12, color: PINK_SUB, marginTop: 10, lineHeight: 1.5 }}>
        Reach organik Instagram rata-rata hanya 3–4% dari followers. 110 reach di bulan pertama itu <strong style={{ color: PINK }}>normal dan sehat</strong> — fondasi sudah kuat.
      </div>
      <div style={{ fontSize: 10, color: PINK_SUB, fontStyle: 'italic', marginTop: 10 }}>
        Data akan semakin akurat setelah lebih banyak iklan berjalan.
      </div>

      {/* two insight boxes */}
      <div style={{ marginTop: 14, display: 'grid', gap: 10 }}>
        <div style={{ background: '#FFF9EC', border: '1px solid #FCE9B8', borderRadius: 12, padding: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 10, fontWeight: 700, color: '#A8761A', letterSpacing: '.06em' }}>
            💡 ARTINYA UNTUK BISNISMU
          </div>
          <div style={{ fontSize: 12, color: PINK, marginTop: 6, lineHeight: 1.45 }}>
            Kualitas konten sudah terbukti. Tantangan berikutnya: bukan bikin konten lebih bagus, tapi lebih <strong>banyak orang yang melihatnya</strong>.
          </div>
        </div>
        <div style={{ background: '#FEEFEF', border: '1px solid #F6CFCF', borderRadius: 12, padding: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 10, fontWeight: 700, color: '#A8341A', letterSpacing: '.06em' }}>
            🎯 YANG BISA DILAKUKAN SEKARANG
          </div>
          <div style={{ fontSize: 12, color: PINK, marginTop: 6, lineHeight: 1.45 }}>
            Berikan lebih banyak konten menarik di Instagram untuk meningkatkan engagement dan reach.
          </div>
        </div>
      </div>

      {/* tip */}
      <div style={{ marginTop: 12, background: PBG, border: `1px dashed ${PLINE}`, borderRadius: 12, padding: '10px 12px', fontSize: 11, color: PINK_SUB, lineHeight: 1.45 }}>
        💡 <strong style={{ color: PINK }}>Engagement Rate</strong> adalah ukuran seberapa banyak orang tidak sekadar lihat kontenmu — tapi langsung like, komen, atau share.
      </div>

      <button style={{
        marginTop: 14, width: '100%', padding: '13px', borderRadius: 12,
        background: PINK, color: '#fff', border: 'none', fontWeight: 600, fontSize: 13,
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
      }}>{PIcon.rocket} Buat Iklan Baru Sekarang</button>
    </div>
  );
}

// Mood Audiens (emoji grid)
function MoodCard() {
  const moods = [
    { e: '❤️', l: 'Love' },
    { e: '👍', l: 'Like' },
    { e: '😂', l: 'Haha' },
    { e: '😮', l: 'Wow' },
  ];
  return (
    <div style={{ background: PCARD, border: `1px solid ${PLINE}`, borderRadius: 18, padding: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
        <div style={{ width: 32, height: 32, borderRadius: 10, background: '#FFEFE3', display: 'grid', placeItems: 'center', fontSize: 16 }}>😊</div>
        <div>
          <div style={{ fontWeight: 700, fontSize: 14 }}>Mood Audiens Minggu Ini</div>
          <div style={{ fontSize: 11, color: PINK_SUB }}>Breakdown reactions semua iklan</div>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        {moods.map(m => (
          <div key={m.l} style={{ background: PBG, borderRadius: 12, padding: '14px 8px', textAlign: 'center', border: `1px solid ${PLINE}` }}>
            <div style={{ fontSize: 28, lineHeight: 1 }}>{m.e}</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#C7C7CF', marginTop: 4 }}>—</div>
            <div style={{ fontSize: 10, color: PINK_SUB, fontWeight: 600, marginTop: 2 }}>{m.l}</div>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 10, padding: '8px 10px', background: PBRAND_SOFT, borderRadius: 8, fontSize: 11, color: PINK, fontStyle: 'italic' }}>
        Audiens masih belum banyak berinteraksi dengan konten Nila Craft.
      </div>
    </div>
  );
}

// Platform Terkuat
function PlatformCard() {
  const platforms = [
    { l: 'Instagram', c: 'linear-gradient(135deg,#E1306C,#F77737)', count: '2 iklan', used: true },
    { l: 'Facebook',  c: '#1877F2', count: 'belum dipakai', used: false },
    { l: 'TikTok',    c: '#0E0E12', count: 'belum dipakai', used: false },
  ];
  return (
    <div style={{ background: PCARD, border: `1px solid ${PLINE}`, borderRadius: 18, padding: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
        <div style={{ width: 32, height: 32, borderRadius: 10, background: PBRAND_SOFT, color: PBRAND, display: 'grid', placeItems: 'center' }}>{PIcon.bars}</div>
        <div>
          <div style={{ fontWeight: 700, fontSize: 14 }}>Platform Terkuat</div>
          <div style={{ fontSize: 11, color: PINK_SUB }}>Engagement rate per platform</div>
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {platforms.map(p => (
          <div key={p.l} style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '10px 12px', borderRadius: 12,
            background: p.used ? PBG : '#FAFAFB', border: `1px solid ${PLINE}`,
            opacity: p.used ? 1 : 0.55,
          }}>
            <div style={{ width: 32, height: 32, borderRadius: 10, background: p.c, display: 'grid', placeItems: 'center', color: '#fff' }}>
              <span style={{ fontWeight: 800, fontSize: 14 }}>{p.l[0]}</span>
            </div>
            <div style={{ flex: 1, fontSize: 13, fontWeight: 600 }}>{p.l}</div>
            <span style={{ fontSize: 11, color: p.used ? PBRAND : PINK_SUB, fontWeight: 600 }}>{p.count}</span>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 10, padding: '8px 10px', background: PBRAND_SOFT, borderRadius: 8, fontSize: 11, color: PINK, fontStyle: 'italic' }}>
        Instagram paling aktif digunakan oleh Nila Craft.
      </div>
    </div>
  );
}

// Local Pulse row
function PulseRow({ icon, label, value, sub, highlight }) {
  return (
    <div style={{ display: 'flex', gap: 12, padding: 12, background: PBG, borderRadius: 12, border: `1px solid ${PLINE}` }}>
      <div style={{ width: 36, height: 36, borderRadius: 10, background: '#fff', color: PBRAND, display: 'grid', placeItems: 'center', border: `1px solid ${PLINE}`, flexShrink: 0 }}>{icon}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 9, fontWeight: 700, color: PINK_SUB, letterSpacing: '.08em' }}>{label}</div>
        <div style={{ fontSize: 15, fontWeight: 700, marginTop: 2 }}>
          {highlight ? <>"<span style={{ color: PBRAND }}>{value}</span>"</> : value}
        </div>
        {sub && <div style={{ fontSize: 11, color: PINK_SUB, marginTop: 3, lineHeight: 1.4 }}>{sub}</div>}
      </div>
    </div>
  );
}

// Empty rec state
function EmptyRecState() {
  return (
    <div style={{ background: PCARD, border: `1px solid ${PLINE}`, borderRadius: 18, padding: 18 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
        <div style={{ width: 32, height: 32, borderRadius: 10, background: PBRAND_SOFT, color: PBRAND, display: 'grid', placeItems: 'center' }}>{PIcon.target}</div>
        <div style={{ fontWeight: 700, fontSize: 14 }}>Rekomendasi Minggu Ini</div>
      </div>
      <div style={{ textAlign: 'center', padding: '18px 10px' }}>
        <div style={{ width: 48, height: 48, borderRadius: 14, background: PBG, color: PBRAND, display: 'grid', placeItems: 'center', margin: '0 auto 12px' }}>{PIcon.bars}</div>
        <div style={{ fontSize: 13, fontWeight: 600 }}>Butuh minimal 5 iklan</div>
        <div style={{ fontSize: 11, color: PINK_SUB, marginTop: 4 }}>untuk rekomendasi yang akurat.<br/>Tambah iklan & data akan dianalisis otomatis.</div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 14 }}>
          {[0,1,0,0,0].map((on,i) => (
            <div key={i} style={{ width: 18, height: 18, borderRadius: 5, background: on ? PBRAND : PBG, border: `1px solid ${on ? PBRAND : PLINE}`, color: '#fff', fontSize: 10, fontWeight: 700, display: 'grid', placeItems: 'center' }}>
              {on ? '✓' : ''}
            </div>
          ))}
          <span style={{ marginLeft: 8, fontSize: 10, color: PINK_SUB, fontWeight: 600 }}>2 / 5</span>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// SCREEN 7 — Performa Iklan (Insight tab)
// ═══════════════════════════════════════════════════════════════
// Bottom nav (3-tab: Dapur / Kelola / Performa)
function PBottomNav({ active = 2 }) {
  const items = [
    { l: 'Dapur',    ic: <svg width="22" height="22" viewBox="0 0 24 24" {...pStroke}><rect x="4" y="4" width="7" height="7" rx="1.5"/><rect x="13" y="4" width="7" height="7" rx="1.5"/><rect x="4" y="13" width="7" height="7" rx="1.5"/><rect x="13" y="13" width="7" height="7" rx="1.5"/></svg> },
    { l: 'Kelola',   ic: <svg width="22" height="22" viewBox="0 0 24 24" {...pStroke}><path d="M3 6h18M3 12h18M3 18h18"/><circle cx="7" cy="6"  r="2" fill="#fff"/><circle cx="14" cy="12" r="2" fill="#fff"/><circle cx="9" cy="18"  r="2" fill="#fff"/></svg> },
    { l: 'Performa', ic: PIcon.bars },
  ];
  return (
    <div style={{
      position: 'absolute', bottom: 0, left: 0, right: 0,
      height: 78, background: '#fff', borderTop: `1px solid ${PLINE}`,
      display: 'flex', padding: '8px 8px 22px',
    }}>
      {items.map((x, i) => (
        <button key={i} style={{
          flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
          background: 'transparent', border: 'none',
          color: i === active ? PBRAND : PINK_SUB, fontSize: 10, fontWeight: 600,
        }}>{x.ic}{x.l}</button>
      ))}
    </div>
  );
}

function ScreenPerforma() {
  return (
    <PPhone>
      <PHeader/>
      <PTabs active={0}/>
      <div style={{ padding: '0 20px 100px', overflowY: 'auto', height: 'calc(100% - 215px)' }}>
        {/* 4 stats */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
          <StatCard label="TOTAL REACH"     value="110" sub="Orang tahu bisnis kamu · dari 2 iklan bulan ini" accent={PBRAND}/>
          <StatCard label="IKLAN BERJALAN"  value="2"   sub="Bulan pertama, terus semangat!" accent={PGREEN}/>
          <StatCard label="PERFORMA KONTEN" value="0%"  sub="Belum ada data ER" accent={POR}/>
          <StatCard label="IKLAN BERBAYAR"  value="0"   sub="Semua reach dari konten organik" accent={PBLUE}/>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <SiLarisCard/>
          <MoodCard/>
          <PlatformCard/>

          {/* Iklan Terbaik card */}
          <div style={{ background: PCARD, border: `1px solid ${PLINE}`, borderRadius: 18, padding: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <div style={{ width: 32, height: 32, borderRadius: 10, background: '#FFF6E0', color: '#C18A1F', display: 'grid', placeItems: 'center', fontSize: 16 }}>🏆</div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 14 }}>Iklan Terbaik</div>
                <div style={{ fontSize: 11, color: PINK_SUB }}>Performa tertinggi</div>
              </div>
            </div>
            <div style={{ fontSize: 11, color: PINK_SUB, lineHeight: 1.5 }}>
              Dipilih berdasarkan <strong style={{ color: PINK }}>Engagement Rate tertinggi</strong>. Belum ada data engagement — kunjungi <strong style={{ color: PBRAND }}>Kelola Iklan</strong> untuk melihat data performa.
            </div>
          </div>
        </div>
      </div>
      <PBottomNav active={2}/>
    </PPhone>
  );
}

// ═══════════════════════════════════════════════════════════════
// SCREEN 8 — Local Pulse
// ═══════════════════════════════════════════════════════════════
function ScreenLocalPulse() {
  return (
    <PPhone>
      <PHeader/>
      <PTabs active={1}/>
      <div style={{ padding: '0 20px 100px', overflowY: 'auto', height: 'calc(100% - 215px)' }}>
        {/* Local Pulse header */}
        <div style={{ background: PCARD, border: `1px solid ${PLINE}`, borderRadius: 18, padding: 16, marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: PBRAND_SOFT, color: PBRAND, display: 'grid', placeItems: 'center' }}>{PIcon.pin}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: 15 }}>Local Pulse</div>
              <div style={{ fontSize: 11, color: PINK_SUB }}>Pola lokal terbaik</div>
            </div>
            <span style={{ padding: '4px 9px', background: PBRAND_SOFT, color: PBRAND, fontSize: 10, fontWeight: 700, letterSpacing: '.05em', borderRadius: 99 }}>LOKAL</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 14 }}>
            <PulseRow icon={PIcon.clock} label="JAM TERBAIK POSTING" value="09:00 – 11:00" sub="Berdasarkan jam posting iklanmu — akan lebih akurat setelah lebih banyak iklan di hari berbeda."/>
            <PulseRow icon={PIcon.cal}   label="HARI TERKUAT"        value="Minggu" sub="Hari dengan aktivitas iklan tertinggi"/>
            <PulseRow icon={PIcon.pin}   label="SAPAAN LOKAL TERBAIK" value="Sugeng rawuh" highlight sub={
              <span>Sapaan khas <strong style={{ color: PBRAND }}>Bantul</strong>, terbukti meningkatkan engagement lokal</span>
            }/>
            <div style={{ background: '#FFF9EC', border: '1px solid #FCE9B8', borderRadius: 10, padding: '10px 12px', fontSize: 11, color: '#A8761A', lineHeight: 1.45 }}>
              💡 <strong>72% brand engagement</strong> datang dari konten yang bicara bahasa lokal — tambahkan ke caption iklanmu.
            </div>
            <PulseRow icon={PIcon.film}  label="FORMAT TERBAIK"      value="Foto dengan teks" sub="Format dominan dari iklan aktif"/>
          </div>

          {/* stitching text section */}
          <div style={{ marginTop: 14, paddingTop: 14, borderTop: `1px solid ${PLINE}` }}>
            <div style={{ fontSize: 9, fontWeight: 700, color: PINK_SUB, letterSpacing: '.08em', marginBottom: 6 }}>STITCHING TEXT TERBAIK</div>
            <div style={{ fontSize: 12, color: PINK_SUB, lineHeight: 1.5 }}>
              Belum ada caption dengan performa tinggi — terus buat iklan untuk menemukan caption terbaikmu.
            </div>
            <div style={{ marginTop: 10, padding: '10px 12px', background: PBG, borderRadius: 10, fontSize: 11, color: PINK_SUB, fontStyle: 'italic', lineHeight: 1.4 }}>
              Caption yang menarik & relevan dengan kerajinan dapat meningkatkan engagement.
            </div>
          </div>
        </div>

        <div style={{ marginBottom: 12 }}><EmptyRecState/></div>

        {/* dual CTA */}
        <button style={{
          width: '100%', padding: '14px', borderRadius: 14, marginBottom: 8,
          background: PINK, color: '#fff', border: 'none', fontWeight: 600, fontSize: 13,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
        }}>🚀 Buat Iklan Sekarang →</button>
        <button style={{
          width: '100%', padding: '14px', borderRadius: 14,
          background: PCARD, color: PINK, border: `1px solid ${PLINE}`, fontWeight: 600, fontSize: 13,
        }}>Lihat Iklan Aktif →</button>
      </div>
      <PBottomNav active={2}/>
    </PPhone>
  );
}

// ═══════════════════════════════════════════════════════════════
// SCREEN 9 — Tools (Competitor + Strategi)
// ═══════════════════════════════════════════════════════════════
function ScreenTools() {
  const [tab, setTab] = React.useState('Instagram');
  const [open, setOpen] = React.useState(true);
  return (
    <PPhone>
      <PHeader/>
      <PTabs active={2}/>
      <div style={{ padding: '0 20px 100px', overflowY: 'auto', height: 'calc(100% - 215px)' }}>
        {/* Competitor Analysis */}
        <div style={{ background: PCARD, border: `1px solid ${PLINE}`, borderRadius: 18, padding: 16, marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: PBRAND_SOFT, color: PBRAND, display: 'grid', placeItems: 'center' }}>{PIcon.zoom}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: 14 }}>Competitor Analysis</div>
              <div style={{ fontSize: 11, color: PINK_SUB }}>Analisa pesaing instan</div>
            </div>
            <span style={{ padding: '4px 9px', background: '#E3FCEC', color: PGREEN, fontSize: 10, fontWeight: 700, letterSpacing: '.05em', borderRadius: 99 }}>GRATIS</span>
          </div>

          {/* platform tabs */}
          <div style={{ display: 'flex', background: PBG, borderRadius: 10, padding: 3, marginBottom: 12 }}>
            {['Instagram', 'Facebook', 'TikTok'].map(t => (
              <button key={t} onClick={() => setTab(t)} style={{
                flex: 1, padding: '7px 0', border: 'none', borderRadius: 8,
                background: tab === t ? '#fff' : 'transparent',
                color: tab === t ? PINK : PINK_SUB,
                fontWeight: 600, fontSize: 12, cursor: 'pointer',
                boxShadow: tab === t ? '0 1px 3px rgba(0,0,0,.05)' : 'none'
              }}>{t}</button>
            ))}
          </div>

          {/* input */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            border: `1px solid ${PLINE}`, borderRadius: 12, padding: '4px 4px 4px 12px',
            background: PBG,
          }}>
            <div style={{ flex: 1, fontSize: 12, color: PINK_SUB }}>Paste link atau @handle pesaing…</div>
            <button style={{ padding: '9px 14px', background: PINK, color: '#fff', border: 'none', borderRadius: 9, fontWeight: 600, fontSize: 12, display: 'flex', alignItems: 'center', gap: 4 }}>
              Analisa →
            </button>
          </div>

          {/* upgrade hint */}
          <div style={{
            marginTop: 10, padding: '10px 12px', background: PBRAND_SOFT,
            borderRadius: 10, display: 'flex', alignItems: 'flex-start', gap: 8,
          }}>
            <span style={{ color: PBRAND, marginTop: 1 }}>{PIcon.bolt}</span>
            <div style={{ fontSize: 11, color: PINK, lineHeight: 1.4, flex: 1 }}>
              Upgrade <strong>Pro</strong> untuk analisis hingga 3 pesaing sekaligus. <span style={{ color: PBRAND, fontWeight: 600 }}>Lihat paket →</span>
            </div>
          </div>
          <div style={{ marginTop: 10, fontSize: 10, color: PINK_SUB, textAlign: 'center' }}>
            Estimasi berdasarkan data publik · bukan dashboard pesaing
          </div>
        </div>

        {/* Strategi Tersimpan */}
        <div style={{ background: PCARD, border: `1px solid ${PLINE}`, borderRadius: 18, overflow: 'hidden', marginBottom: 12 }}>
          <button onClick={() => setOpen(!open)} style={{
            width: '100%', padding: '14px 16px', display: 'flex', alignItems: 'center',
            gap: 10, background: 'transparent', border: 'none', cursor: 'pointer',
          }}>
            <div style={{ width: 32, height: 32, borderRadius: 10, background: PBRAND_SOFT, color: PBRAND, display: 'grid', placeItems: 'center' }}>{PIcon.bookmark}</div>
            <div style={{ flex: 1, textAlign: 'left' }}>
              <div style={{ fontWeight: 700, fontSize: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                Strategi Tersimpan
                <span style={{ minWidth: 20, height: 20, borderRadius: 99, background: PBRAND, color: '#fff', fontSize: 10, fontWeight: 700, display: 'grid', placeItems: 'center', padding: '0 6px' }}>1</span>
              </div>
              <div style={{ fontSize: 11, color: PINK_SUB }}>Rencana iklan yang kamu simpan</div>
            </div>
            <span style={{ transform: open ? 'rotate(180deg)' : 'none', transition: '.2s', color: PINK_SUB }}>{PIcon.chev}</span>
          </button>
          {open && (
            <div style={{ padding: '0 16px 16px', borderTop: `1px solid ${PLINE}` }}>
              <div style={{ background: PBG, borderRadius: 12, padding: 12, marginTop: 14, display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                <div style={{ width: 4, alignSelf: 'stretch', background: PBRAND, borderRadius: 99 }}/>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 9, fontWeight: 700, color: PBRAND, letterSpacing: '.06em' }}>BANTUL · MINGGU</div>
                  <div style={{ fontSize: 13, fontWeight: 600, marginTop: 2 }}>Sapaan Sugeng Rawuh + Reel kerajinan</div>
                  <div style={{ fontSize: 11, color: PINK_SUB, marginTop: 4, lineHeight: 1.4 }}>Posting 09:00, format foto dengan teks, target warga sekitar 1.0 km.</div>
                  <div style={{ display: 'flex', gap: 6, marginTop: 10 }}>
                    <button style={{ padding: '6px 12px', background: PBRAND, color: '#fff', border: 'none', borderRadius: 8, fontSize: 11, fontWeight: 600 }}>Terapkan</button>
                    <button style={{ padding: '6px 12px', background: 'transparent', color: PINK_SUB, border: `1px solid ${PLINE}`, borderRadius: 8, fontSize: 11, fontWeight: 600 }}>Edit</button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* compact CTA */}
        <button style={{
          width: '100%', padding: '14px', borderRadius: 14,
          background: PINK, color: '#fff', border: 'none', fontWeight: 600, fontSize: 13,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
        }}>🚀 Buat Iklan Sekarang →</button>
      </div>
      <PBottomNav active={2}/>
    </PPhone>
  );
}

Object.assign(window, { ScreenPerforma, ScreenLocalPulse, ScreenTools });
