'use client';
import { useState } from 'react';

const PLATFORM_ICONS = {
  instagram: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#E1306C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/>
      <circle cx="17.5" cy="6.5" r="0.8" fill="#E1306C" stroke="none"/>
    </svg>
  ),
  facebook: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <rect width="24" height="24" rx="6" fill="#1877F2"/>
      <path d="M13.5 8h2V5.5h-2C11.57 5.5 10 7.07 10 9v1.5H8V13h2v7h3v-7h2l.5-2.5H13V9c0-.28.22-.5.5-.5z" fill="white"/>
    </svg>
  ),
  tiktok: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <rect width="24" height="24" rx="6" fill="#000"/>
      <path d="M16 8c.55.73 1.4 1.2 2.35 1.25v2.1a4.55 4.55 0 01-2.35-.65v5.8a4.1 4.1 0 11-4.1-4.1h.27v2.1H12a2 2 0 102 2V8z" fill="white"/>
    </svg>
  ),
  youtube: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <rect width="24" height="24" rx="5" fill="#FF0000"/>
      <path d="M9.5 8.5l6 3.5-6 3.5V8.5z" fill="white"/>
    </svg>
  ),
};

/* Smaller icon variant for inside the caption card header */
const PLATFORM_ICONS_SM = {
  instagram: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#E1306C" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/>
      <circle cx="17.5" cy="6.5" r="0.8" fill="#E1306C" stroke="none"/>
    </svg>
  ),
  facebook: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
      <rect width="24" height="24" rx="6" fill="#1877F2"/>
      <path d="M13.5 8h2V5.5h-2C11.57 5.5 10 7.07 10 9v1.5H8V13h2v7h3v-7h2l.5-2.5H13V9c0-.28.22-.5.5-.5z" fill="white"/>
    </svg>
  ),
  tiktok: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
      <rect width="24" height="24" rx="6" fill="#000"/>
      <path d="M16 8c.55.73 1.4 1.2 2.35 1.25v2.1a4.55 4.55 0 01-2.35-.65v5.8a4.1 4.1 0 11-4.1-4.1h.27v2.1H12a2 2 0 102 2V8z" fill="white"/>
    </svg>
  ),
  youtube: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
      <rect width="24" height="24" rx="5" fill="#FF0000"/>
      <path d="M9.5 8.5l6 3.5-6 3.5V8.5z" fill="white"/>
    </svg>
  ),
};

const PLATFORM_LABELS = { instagram:'Instagram', facebook:'Facebook', tiktok:'TikTok', youtube:'YouTube' };
const FORMAT_LABELS   = { post:'Post', reel:'Reel', story:'Story' };

/* ── Reach formula ── */
function computeReach(locPop, radius, localOn, travelerOn) {
  if (!localOn && !travelerOn) return 0;
  const areaFactor  = Math.PI * radius * radius;
  const densityBase = locPop / (Math.PI * 5 * 5);
  const areaPop     = Math.round(densityBase * areaFactor);
  return (localOn ? areaPop : 0) + (travelerOn ? Math.round(areaPop * 0.22) : 0);
}
function fmtReach(n) {
  if (!n) return '0';
  if (n >= 10000) return Math.round(n / 1000) + 'K';
  return n.toLocaleString('id-ID');
}

/* ── Progress bar ── */
const ProgressBar = ({ step, total }) => (
  <div style={{display:'flex', gap:'4px', padding:'0 16px', marginTop:'2px'}}>
    {Array.from({length:total}).map((_,i) => (
      <div key={i} style={{flex:1, height:'3px', borderRadius:'2px', background: i < step ? 'var(--m-brand)' : '#E4E4EB'}} />
    ))}
  </div>
);

/* ── Demo captions per platform ── */
const DEMO_CAPTIONS = {
  instagram: 'Sugeng rawuh di Nila Craft! Koleksi kerajinan tangan asli Bantul, dijahit satu-satu dengan detail rapi. Hanya minggu ini diskon 50%. Klik link di bio untuk belanja sebelum kehabisan! 🧵✨',
  facebook:  'Halo Sahabat Nila Craft! 👋 Kami hadir dengan koleksi terbaru kerajinan tangan asli Bantul. Kualitas terjamin, harga bersahabat. Hubungi kami atau kunjungi toko sekarang!',
  tiktok:    'POV: Nemu kerajinan batik asli Bantul yang aesthetic banget 😍 Kualitas premium, harga terjangkau! Cek link di bio ya bestie 🛍️ #NilaCraft #BatikBantul #UMKM',
  youtube:   'Temukan koleksi kerajinan tangan eksklusif dari Nila Craft! Setiap produk dibuat dengan penuh cinta oleh pengrajin lokal Bantul. Kunjungi toko kami dan dapatkan penawaran spesial hari ini.',
};

const MAX_CHAR = { instagram:2200, facebook:63206, tiktok:2200, youtube:5000 };

export default function CaptionScreen({
  platform, format, files,
  locName, locFull, locPop, radius, localOn, travelerOn,
  persona,
  caption, setCaption,
  onBack, onUbahAset,
}) {
  const [stitchOn,        setStitchOn]        = useState(true);
  const [generating,      setGenerating]      = useState(false);
  const [hasGenerated,    setHasGenerated]    = useState(false);

  /* ── Edit bottom sheet ── */
  const [showEditSheet,   setShowEditSheet]   = useState(false);
  const [animateEditSheet,setAnimateEditSheet]= useState(false);
  const [editDraft,       setEditDraft]       = useState('');

  const reach     = computeReach(locPop, radius, localOn, travelerOn);
  const reachText = fmtReach(reach);
  const maxChar   = MAX_CHAR[platform] || 2200;

  /* ── Simulate AI generation — only runs when files exist ── */
  const handleGenerate = () => {
    if (files.length === 0) return;
    setGenerating(true);
    setCaption('');
    const base = DEMO_CAPTIONS[platform] || DEMO_CAPTIONS.instagram;
    let i = 0;
    const interval = setInterval(() => {
      i++;
      setCaption(base.slice(0, i * 3));
      if (i * 3 >= base.length) {
        clearInterval(interval);
        setGenerating(false);
        setCaption(base);
      }
    }, 30);
  };

  /* ── Auto-generate on first mount only when files are present ── */
  if (!hasGenerated) {
    setHasGenerated(true);
    if (files.length > 0) setTimeout(handleGenerate, 400);
  }

  /* ── Edit sheet helpers ── */
  const openEditSheet = () => {
    setEditDraft(caption);
    setShowEditSheet(true);
    requestAnimationFrame(() => requestAnimationFrame(() => setAnimateEditSheet(true)));
  };
  const closeEditSheet = () => {
    setAnimateEditSheet(false);
    setTimeout(() => setShowEditSheet(false), 350);
  };
  const saveEditCaption = () => {
    setCaption(editDraft);
    closeEditSheet();
  };

  /* ── Derived display values ── */
  const thumb     = files[0] || null;
  const fmtLabel  = FORMAT_LABELS[format]   || 'Reel';
  const platLabel = PLATFORM_LABELS[platform] || 'Instagram';
  const assetInfo = `${files.length > 0 ? files.length + ' foto' : 'Belum ada foto'} · ${locFull || locName}`;

  return (
    <div style={{display:'flex', flexDirection:'column', flex:1, minHeight:0, overflow:'hidden', background:'var(--m-bg)'}}>

      {/* ── Screen header ── */}
      <div style={{background:'var(--m-bg)', paddingTop:'12px', flexShrink:0}}>
        <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 16px 10px'}}>
          <button onClick={onBack} style={{
            width:'36px', height:'36px', borderRadius:'50%',
            background:'#fff', border:'none', cursor:'pointer',
            display:'flex', alignItems:'center', justifyContent:'center',
            boxShadow:'0 1px 4px rgba(0,0,0,0.10)', flexShrink:0,
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--m-ink)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 18l-6-6 6-6"/>
            </svg>
          </button>

          <div style={{display:'flex', alignItems:'center', gap:'8px'}}>
            {PLATFORM_ICONS[platform]}
            <span style={{fontFamily:'var(--m-font)', fontSize:'16px', fontWeight:'700', color:'var(--m-ink)'}}>
              Caption & Tayang
            </span>
          </div>

          <span style={{fontFamily:'var(--m-font)', fontSize:'13px', fontWeight:'600', color:'var(--m-ink-sub)'}}>2/2</span>
        </div>
        <ProgressBar step={2} total={2} />
      </div>

      {/* ── Scrollable content ── */}
      <main style={{
        flex:1, minHeight:0, overflowY:'auto',
        padding:'14px 16px',
        paddingBottom:'148px',
        display:'flex', flexDirection:'column', gap:'12px',
      }}>

        {/* ── Mini preview card ── */}
        <div className="panel" style={{boxShadow:'none', border:'1px solid #E4E4EB', padding:'14px', flexShrink:0}}>
          <div style={{display:'flex', alignItems:'center', gap:'14px'}}>
            {/* Small phone thumb */}
            <div style={{
              width:'64px', flexShrink:0,
              aspectRatio:'9/16',
              background:'#111', borderRadius:'10px',
              overflow:'hidden', border:'2px solid #1a1a1a',
              boxShadow:'0 4px 12px rgba(0,0,0,0.18)',
            }}>
              {thumb ? (
                thumb.type === 'video' ? (
                  <video src={thumb.url} muted style={{width:'100%', height:'100%', objectFit:'cover'}} />
                ) : (
                  <img src={thumb.url} alt="preview" style={{width:'100%', height:'100%', objectFit:'cover'}} />
                )
              ) : (
                <div style={{width:'100%', height:'100%', background:'linear-gradient(135deg,#f0a58a,#e8845a)'}} />
              )}
            </div>

            {/* Meta info */}
            <div style={{flex:1, minWidth:0}}>
              <div style={{fontFamily:'var(--m-font)', fontSize:'10px', fontWeight:'700', color:'var(--m-ink-sub)', textTransform:'uppercase', letterSpacing:'.5px', marginBottom:'4px'}}>
                PREVIEW
              </div>
              <div style={{fontFamily:'var(--m-font)', fontSize:'15px', fontWeight:'700', color:'var(--m-ink)', marginBottom:'3px'}}>
                {platLabel} · {fmtLabel}
              </div>
              <div style={{fontFamily:'var(--m-font)', fontSize:'12px', color:'var(--m-ink-sub)', marginBottom:'10px', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>
                {assetInfo}
              </div>
              <button onClick={onUbahAset} style={{
                display:'flex', alignItems:'center', gap:'5px',
                padding:'6px 12px', borderRadius:'8px',
                border:'1.5px solid #E4E4EB', background:'transparent',
                cursor:'pointer', fontFamily:'var(--m-font)', fontSize:'12px',
                fontWeight:'600', color:'var(--m-ink)',
              }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M15 18l-6-6 6-6"/>
                </svg>
                Ubah aset
              </button>
            </div>
          </div>
        </div>

        {/* ── Master Persona card — shown below preview, styled like other cards ── */}
        {persona && (
          <div className="panel" style={{boxShadow:'none', border:'1px solid #E4E4EB', padding:'14px', flexShrink:0}}>
            {/* Top row */}
            <div style={{display:'flex', alignItems:'center', gap:'8px', marginBottom:'10px'}}>
              <div style={{
                width:'22px', height:'22px', borderRadius:'50%',
                background:'#22c55e', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0,
              }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{width:'11px', height:'11px'}}>
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              </div>
              <span style={{fontFamily:'var(--m-font)', fontSize:'11px', fontWeight:'700', color:'var(--m-ink-sub)', letterSpacing:'0.4px', textTransform:'uppercase'}}>
                Master Persona Terdeteksi
              </span>
              <svg viewBox="0 0 24 24" fill="none" stroke="var(--m-brand)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{width:'13px', height:'13px', marginLeft:'auto', flexShrink:0}}>
                <path d="M12 2L9.5 9.5 2 12l7.5 2.5L12 22l2.5-7.5L22 12l-7.5-2.5z"/>
              </svg>
            </div>
            {/* Persona name */}
            <div style={{fontFamily:'var(--m-font)', fontSize:'17px', fontWeight:'800', color:'var(--m-ink)', marginBottom:'8px', letterSpacing:'-0.02em'}}>
              {persona.name}
            </div>
            {/* Target & age chips */}
            <div style={{display:'flex', flexWrap:'wrap', gap:'6px'}}>
              <span style={{
                fontFamily:'var(--m-font)', fontSize:'11px', fontWeight:'600', color:'var(--m-ink)',
                background:'#F0F0F5', padding:'3px 10px', borderRadius:'99px',
                border:'1px solid #E4E4EB',
              }}>
                {persona.target}
              </span>
              <span style={{
                fontFamily:'var(--m-font)', fontSize:'11px', fontWeight:'600', color:'var(--m-ink-sub)',
                background:'#F7F7FA', padding:'3px 10px', borderRadius:'99px',
                border:'1px solid #E4E4EB',
              }}>
                {persona.age || '18–45'} · {persona.gender || 'Mixed'}
              </span>
            </div>
            {/* Footer note */}
            <div style={{marginTop:'10px', paddingTop:'10px', borderTop:'1px solid #F0F0F5'}}>
              <span style={{fontFamily:'var(--m-font)', fontSize:'11px', color:'var(--m-ink-sub)'}}>
                Digunakan untuk mengoptimalkan targeting iklanmu
              </span>
            </div>
          </div>
        )}

        {/* ── Caption card ── */}
        <div className="panel" style={{boxShadow:'none', border:'1px solid #E4E4EB', padding:'14px', flexShrink:0}}>
          {/* Header row */}
          <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'12px'}}>
            <div style={{display:'flex', alignItems:'center', gap:'8px'}}>
              {/* AI icon box */}
              <div style={{
                width:'30px', height:'30px', borderRadius:'8px',
                background:'var(--m-brand-soft)', display:'flex',
                alignItems:'center', justifyContent:'center', flexShrink:0,
              }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--m-brand)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 3a6 6 0 009 9 9 9 0 11-9-9z"/>
                  <path d="M19 3v4M21 5h-4"/>
                </svg>
              </div>
              {/* Platform icon + title */}
              <div style={{display:'flex', alignItems:'center', gap:'5px'}}>
                {PLATFORM_ICONS_SM[platform]}
                <span style={{fontFamily:'var(--m-font)', fontSize:'14px', fontWeight:'700', color:'var(--m-ink)'}}>
                  Caption {platLabel}
                </span>
              </div>
            </div>
            <span style={{fontFamily:'var(--m-font)', fontSize:'11px', fontWeight:'700', color:'var(--m-brand)', background:'var(--m-brand-soft)', padding:'3px 8px', borderRadius:'6px', flexShrink:0}}>
              AI · ID
            </span>
          </div>

          {/* Caption display area */}
          <div style={{
            background:'#F5F5F7', borderRadius:'10px', padding:'12px',
            marginBottom:'10px',
          }}>
            {caption ? (
              <p style={{
                margin:0, fontFamily:'var(--m-font)', fontSize:'13px',
                color:'var(--m-ink)', lineHeight:'1.6',
                whiteSpace:'pre-wrap', wordBreak:'break-word',
              }}>
                {caption}
              </p>
            ) : (
              <p style={{
                margin:0, fontFamily:'var(--m-font)', fontSize:'13px',
                color:'var(--m-ink-sub)', lineHeight:'1.6', fontStyle:'italic',
              }}>
                {files.length > 0
                  ? 'AI akan menuliskan caption untukmu…'
                  : 'Upload foto atau video terlebih dahulu untuk menghasilkan caption.'}
              </p>
            )}
            <div style={{
              textAlign:'right', fontFamily:'var(--m-font)', fontSize:'11px', marginTop:'6px',
              color: caption.length > maxChar * 0.9 ? '#E53E3E' : 'var(--m-ink-sub)',
            }}>
              {caption.length}/{maxChar}
            </div>
          </div>

          {/* Action buttons: Generate + Edit side by side */}
          <div style={{display:'flex', gap:'8px'}}>
            {/* Generate ulang */}
            <button
              onClick={handleGenerate}
              disabled={generating || files.length === 0}
              style={{
                flex:1, padding:'13px 10px', borderRadius:'12px',
                background: (generating || files.length === 0) ? '#E4E4EB' : 'var(--m-ink)',
                color: (generating || files.length === 0) ? 'var(--m-ink-sub)' : '#fff',
                border:'none', cursor: (generating || files.length === 0) ? 'not-allowed' : 'pointer',
                fontFamily:'var(--m-font)', fontSize:'13px', fontWeight:'700',
                display:'flex', alignItems:'center', justifyContent:'center', gap:'6px',
                transition:'background .2s',
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"
                style={{animation: generating ? 'spin 1s linear infinite' : 'none', flexShrink:0}}>
                <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 11-7.778 7.778 5.5 5.5 0 017.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/>
              </svg>
              {generating ? 'Menulis…' : 'Generate ulang'}
            </button>

            {/* Edit */}
            <button
              onClick={openEditSheet}
              disabled={!caption}
              style={{
                flex:1, padding:'13px 10px', borderRadius:'12px',
                background: !caption ? '#F5F5F7' : '#fff',
                color: !caption ? 'var(--m-ink-sub)' : 'var(--m-ink)',
                border:`1.5px solid ${!caption ? '#E4E4EB' : 'var(--m-ink)'}`,
                cursor: !caption ? 'not-allowed' : 'pointer',
                fontFamily:'var(--m-font)', fontSize:'13px', fontWeight:'700',
                display:'flex', alignItems:'center', justifyContent:'center', gap:'6px',
                transition:'all .2s',
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{flexShrink:0}}>
                <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
              Edit
            </button>
          </div>
        </div>

        {/* ── Smart Geo Stitching card ── */}
        <div className="panel" style={{boxShadow:'none', border:'1px solid #E4E4EB', padding:'14px', flexShrink:0}}>
          <div style={{display:'flex', alignItems:'center', gap:'10px', marginBottom:'8px'}}>
            <div style={{
              width:'36px', height:'36px', borderRadius:'10px',
              background:'var(--m-brand-soft)', display:'flex',
              alignItems:'center', justifyContent:'center', flexShrink:0,
            }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--m-brand)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/>
                <circle cx="12" cy="10" r="3"/>
              </svg>
            </div>
            <div style={{flex:1, minWidth:0}}>
              <div style={{display:'flex', alignItems:'center', gap:'7px'}}>
                <span style={{fontFamily:'var(--m-font)', fontSize:'14px', fontWeight:'700', color:'var(--m-ink)'}}>Smart Geo Stitching</span>
                <span style={{
                  fontFamily:'var(--m-font)', fontSize:'10px', fontWeight:'700', color:'var(--m-brand)',
                  background:'var(--m-brand-soft)', padding:'2px 7px', borderRadius:'6px', flexShrink:0,
                }}>BETA</span>
              </div>
            </div>
            {/* Toggle */}
            <button onClick={() => setStitchOn(v => !v)} style={{
              width:'44px', height:'24px', borderRadius:'99px', border:'none',
              background: stitchOn ? 'var(--m-brand)' : '#D7D7DE',
              cursor:'pointer', position:'relative', flexShrink:0, padding:0,
              transition:'background .2s',
            }}>
              <div style={{
                position:'absolute', top:'3px',
                left: stitchOn ? 'calc(100% - 21px)' : '3px',
                width:'18px', height:'18px', borderRadius:'50%', background:'#fff',
                transition:'left .2s', boxShadow:'0 1px 3px rgba(0,0,0,0.2)',
              }} />
            </button>
          </div>

          <p style={{fontFamily:'var(--m-font)', fontSize:'12px', color:'var(--m-ink-sub)', lineHeight:'1.6', marginBottom: stitchOn ? '10px' : '0'}}>
            Sambungkan caption dengan dialek &amp; sapaan khas{' '}
            <span style={{color:'var(--m-brand)', fontWeight:'700'}}>{locName}</span>{' '}
            agar iklanmu terasa lebih lokal.
          </p>

          {stitchOn && (
            <div style={{
              background:'#FAFAFA', borderRadius:'8px', padding:'10px 12px',
              border:'1px solid #F0F0F5', display:'flex', alignItems:'flex-start', gap:'8px',
            }}>
              <span style={{fontSize:'14px', flexShrink:0}}>💡</span>
              <span style={{fontFamily:'var(--m-font)', fontSize:'12px', color:'var(--m-ink-sub)', lineHeight:'1.5'}}>
                Sapaan{' '}
                <strong style={{color:'var(--m-ink)', fontWeight:'700'}}>&ldquo;Sugeng rawuh&rdquo;</strong>{' '}
                akan otomatis ditambahkan di caption.
              </span>
            </div>
          )}
        </div>
      </main>

      {/* ── Sticky bottom bar: Estimasi + Tayangkan ── */}
      <div style={{
        position:'fixed',
        bottom:'78px',
        left:0, right:0, zIndex:300,
        background:'#fff',
        borderTop:'1px solid #ECECF1',
        padding:'12px 16px',
        display:'flex', alignItems:'center', gap:'12px',
      }}>
        <div style={{flex:1, minWidth:0}}>
          <div style={{fontFamily:'var(--m-font)', fontSize:'10px', fontWeight:'700', color:'var(--m-ink-sub)', textTransform:'uppercase', letterSpacing:'.5px', marginBottom:'2px'}}>
            ESTIMASI JANGKAUAN
          </div>
          <div style={{fontFamily:'var(--m-font)', fontSize:'15px', fontWeight:'700', color:'var(--m-ink)', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>
            <span style={{color:'var(--m-brand)'}}>{reachText}</span>
            <span style={{fontWeight:'400', color:'var(--m-ink-sub)', fontSize:'13px'}}> warga · {locName}</span>
          </div>
        </div>
        <button style={{
          flexShrink:0, padding:'12px 20px', borderRadius:'14px',
          background:'var(--m-ink)', color:'#fff', border:'none', cursor:'pointer',
          fontFamily:'var(--m-font)', fontSize:'14px', fontWeight:'700',
          display:'flex', alignItems:'center', gap:'7px',
          boxShadow:'0 4px 14px rgba(14,14,18,0.25)',
        }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="none">
            <polygon points="5 3 19 12 5 21 5 3"/>
          </svg>
          Tayangkan
        </button>
      </div>

      {/* ── Edit Caption Bottom Sheet ── */}
      {showEditSheet && (
        <div style={{position:'fixed', inset:0, zIndex:1000}}>
          {/* Backdrop */}
          <div
            onClick={closeEditSheet}
            style={{
              position:'absolute', inset:0,
              background: animateEditSheet ? 'rgba(0,0,0,0.50)' : 'rgba(0,0,0,0)',
              transition:'background 0.35s ease',
            }}
          />
          {/* Sheet */}
          <div style={{
            position:'absolute', bottom:0, left:0, right:0,
            background:'#fff',
            borderRadius:'20px 20px 0 0',
            paddingBottom:'calc(env(safe-area-inset-bottom) + 16px)',
            transform: animateEditSheet ? 'translateY(0)' : 'translateY(100%)',
            transition:'transform 0.35s cubic-bezier(0.32,0.72,0,1)',
            display:'flex', flexDirection:'column',
            maxHeight:'85vh',
          }}>
            {/* Handle */}
            <div style={{padding:'12px 0 4px', display:'flex', justifyContent:'center', flexShrink:0}}>
              <div style={{width:'36px', height:'4px', borderRadius:'2px', background:'#E4E4EB'}} />
            </div>

            {/* Sheet header */}
            <div style={{
              display:'flex', alignItems:'center', justifyContent:'space-between',
              padding:'8px 16px 14px', flexShrink:0,
            }}>
              <div style={{display:'flex', alignItems:'center', gap:'8px'}}>
                {PLATFORM_ICONS_SM[platform]}
                <span style={{fontFamily:'var(--m-font)', fontSize:'16px', fontWeight:'700', color:'var(--m-ink)'}}>
                  Edit Caption {platLabel}
                </span>
              </div>
              <button
                onClick={closeEditSheet}
                style={{
                  width:'30px', height:'30px', borderRadius:'50%',
                  background:'#F0F0F5', border:'none', cursor:'pointer',
                  display:'flex', alignItems:'center', justifyContent:'center',
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--m-ink)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>

            {/* Textarea */}
            <div style={{flex:1, minHeight:0, overflowY:'auto', padding:'0 16px 12px'}}>
              <textarea
                value={editDraft}
                onChange={e => setEditDraft(e.target.value)}
                autoFocus
                style={{
                  width:'100%', minHeight:'160px', maxHeight:'340px',
                  background:'#F5F5F7', border:'1.5px solid #E4E4EB',
                  borderRadius:'12px', padding:'12px',
                  fontFamily:'var(--m-font)', fontSize:'14px',
                  color:'var(--m-ink)', lineHeight:'1.65',
                  resize:'vertical', outline:'none', boxSizing:'border-box',
                  transition:'border-color .15s',
                }}
                onFocus={e => e.target.style.borderColor = 'var(--m-brand)'}
                onBlur={e => e.target.style.borderColor = '#E4E4EB'}
              />
              <div style={{
                textAlign:'right', fontFamily:'var(--m-font)', fontSize:'11px', marginTop:'4px',
                color: editDraft.length > maxChar * 0.9 ? '#E53E3E' : 'var(--m-ink-sub)',
              }}>
                {editDraft.length}/{maxChar}
              </div>
            </div>

            {/* Save button */}
            <div style={{padding:'0 16px 4px', flexShrink:0}}>
              <button
                onClick={saveEditCaption}
                style={{
                  width:'100%', padding:'15px', borderRadius:'14px',
                  background:'var(--m-ink)', color:'#fff',
                  border:'none', cursor:'pointer',
                  fontFamily:'var(--m-font)', fontSize:'15px', fontWeight:'700',
                  display:'flex', alignItems:'center', justifyContent:'center', gap:'8px',
                  boxShadow:'0 4px 14px rgba(14,14,18,0.20)',
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
                Simpan Caption
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
