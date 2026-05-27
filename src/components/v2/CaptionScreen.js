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
  caption, setCaption,
  onBack, onUbahAset,
}) {
  const [stitchOn,   setStitchOn]   = useState(true);
  const [generating, setGenerating] = useState(false);

  const reach     = computeReach(locPop, radius, localOn, travelerOn);
  const reachText = fmtReach(reach);
  const maxChar   = MAX_CHAR[platform] || 2200;

  /* Simulate AI generation */
  const handleGenerate = () => {
    setGenerating(true);
    setCaption('');
    const base = DEMO_CAPTIONS[platform] || DEMO_CAPTIONS.instagram;
    let i = 0;
    const interval = setInterval(() => {
      i++;
      setCaption(base.slice(0, i * 3));
      if (i * 3 >= base.length) { clearInterval(interval); setGenerating(false); setCaption(base); }
    }, 30);
  };

  /* Auto-generate on first mount if caption is empty */
  const [hasGenerated, setHasGenerated] = useState(false);
  if (!hasGenerated) {
    setHasGenerated(true);
    setTimeout(handleGenerate, 400);
  }

  /* Thumbnail for mini preview */
  const thumb = files[0] || null;
  const fmtLabel = FORMAT_LABELS[format] || 'Reel';
  const platLabel = PLATFORM_LABELS[platform] || 'Instagram';
  const assetInfo = `${files.length > 0 ? files.length + ' foto' : 'Belum ada foto'} · ${locFull || locName}`;

  return (
    <div style={{display:'flex', flexDirection:'column', flex:1, overflow:'hidden', background:'var(--m-bg)'}}>

      {/* ── Screen header ── */}
      <div style={{background:'var(--m-bg)', paddingTop:'12px'}}>
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
        flex:1, overflowY:'auto', padding:'14px 16px 0',
        paddingBottom:'calc(88px + env(safe-area-inset-bottom) + 60px)',
        display:'flex', flexDirection:'column', gap:'12px',
      }}>

        {/* ── Mini preview card ── */}
        <div className="panel" style={{boxShadow:'none', border:'1px solid #E4E4EB', padding:'14px'}}>
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

        {/* ── Caption card ── */}
        <div className="panel" style={{boxShadow:'none', border:'1px solid #E4E4EB', padding:'14px'}}>
          {/* Header */}
          <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'12px'}}>
            <div style={{display:'flex', alignItems:'center', gap:'8px'}}>
              <div style={{
                width:'30px', height:'30px', borderRadius:'8px',
                background:'var(--m-brand-soft)', display:'flex',
                alignItems:'center', justifyContent:'center',
              }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--m-brand)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 3a6 6 0 009 9 9 9 0 11-9-9z"/>
                  <path d="M19 3v4M21 5h-4"/>
                </svg>
              </div>
              <span style={{fontFamily:'var(--m-font)', fontSize:'14px', fontWeight:'700', color:'var(--m-ink)'}}>Caption otomatis</span>
            </div>
            <span style={{fontFamily:'var(--m-font)', fontSize:'11px', fontWeight:'700', color:'var(--m-brand)', background:'var(--m-brand-soft)', padding:'3px 8px', borderRadius:'6px'}}>
              AI · ID
            </span>
          </div>

          {/* Textarea */}
          <div style={{
            background:'#F5F5F7', borderRadius:'10px', padding:'12px',
            marginBottom:'8px', position:'relative',
          }}>
            <textarea
              value={caption}
              onChange={e => setCaption(e.target.value)}
              rows={4}
              placeholder="AI akan menuliskan caption untukmu…"
              style={{
                width:'100%', background:'transparent', border:'none', outline:'none',
                fontFamily:'var(--m-font)', fontSize:'13px', color:'var(--m-ink)',
                lineHeight:'1.6', resize:'none', minHeight:'80px',
              }}
            />
            <div style={{textAlign:'right', fontFamily:'var(--m-font)', fontSize:'11px', color: caption.length > maxChar * 0.9 ? '#E53E3E' : 'var(--m-ink-sub)'}}>
              {caption.length}/{maxChar}
            </div>
          </div>

          {/* Generate button */}
          <button
            onClick={handleGenerate}
            disabled={generating}
            style={{
              width:'100%', padding:'14px', borderRadius:'12px',
              background: generating ? '#888' : 'var(--m-ink)',
              color:'#fff', border:'none', cursor: generating ? 'not-allowed' : 'pointer',
              fontFamily:'var(--m-font)', fontSize:'14px', fontWeight:'700',
              display:'flex', alignItems:'center', justifyContent:'center', gap:'8px',
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
              style={{animation: generating ? 'spin 1s linear infinite' : 'none'}}>
              <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 11-7.778 7.778 5.5 5.5 0 017.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/>
            </svg>
            {generating ? 'Menulis caption…' : 'Generate ulang'}
          </button>
        </div>

        {/* ── Smart Geo Stitching card ── */}
        <div className="panel" style={{boxShadow:'none', border:'1px solid #E4E4EB', padding:'14px'}}>
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
            <div style={{flex:1}}>
              <div style={{display:'flex', alignItems:'center', gap:'7px'}}>
                <span style={{fontFamily:'var(--m-font)', fontSize:'14px', fontWeight:'700', color:'var(--m-ink)'}}>Smart Geo Stitching</span>
                <span style={{
                  fontFamily:'var(--m-font)', fontSize:'10px', fontWeight:'700', color:'var(--m-brand)',
                  background:'var(--m-brand-soft)', padding:'2px 7px', borderRadius:'6px',
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
                <strong style={{color:'var(--m-ink)', fontWeight:'700'}}>"Sugeng rawuh"</strong>{' '}
                akan otomatis ditambahkan di caption.
              </span>
            </div>
          )}
        </div>
      </main>

      {/* ── Sticky bottom bar: Estimasi + Tayangkan ── */}
      <div style={{
        position:'fixed',
        bottom:'calc(60px + env(safe-area-inset-bottom))',
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

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
