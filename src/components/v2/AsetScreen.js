'use client';
import { useState, useRef } from 'react';

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

const FORMATS = ['Post', 'Reel', 'Story'];

/* ── Phone aspect ratio per format ── */
const FORMAT_RATIO = { post:'4/5', reel:'9/16', story:'9/16' };

/* ── Progress bar ── */
const ProgressBar = ({ step, total }) => (
  <div style={{display:'flex', gap:'4px', padding:'0 16px', marginTop:'2px'}}>
    {Array.from({length:total}).map((_,i) => (
      <div key={i} style={{flex:1, height:'3px', borderRadius:'2px', background: i < step ? 'var(--m-brand)' : '#E4E4EB', transition:'background .3s'}} />
    ))}
  </div>
);

const AI_STYLES = [
  { id:'studio',    label:'Studio Pro',  desc:'Latar putih bersih, profesional',  emoji:'🏢' },
  { id:'lifestyle', label:'Lifestyle',   desc:'Suasana natural & hangat',          emoji:'☀️' },
  { id:'flatlay',   label:'Flat Lay',    desc:'Tampilan atas, rapi & minimalis',   emoji:'📐' },
];

export default function AsetScreen({ platform, format, onFormatChange, files, onFilesChange, onBack, onNext }) {
  const [selectedIdx,   setSelectedIdx]   = useState(0);
  const [showSheet,     setShowSheet]     = useState(false);  /* action sheet: Galeri / Kamera */

  /* ── AI Kreatif sheet ── */
  const [showAISheet,   setShowAISheet]   = useState(false);
  const [animateAI,     setAnimateAI]     = useState(false);
  const [aiPhoto,       setAiPhoto]       = useState(null);   /* { url, file } */
  const [aiStyle,       setAiStyle]       = useState('studio');

  const openAISheet  = () => { setShowAISheet(true);  setTimeout(() => setAnimateAI(true),  10); };
  const closeAISheet = () => { setAnimateAI(false);   setTimeout(() => setShowAISheet(false), 320); };

  const fileInputRef   = useRef(null);
  const cameraInputRef = useRef(null);
  const aiPhotoRef     = useRef(null);

  const MAX_FILES = 5;

  /* ── Handle file input ── */
  const handleFiles = (e) => {
    const picked = Array.from(e.target.files || []);
    if (!picked.length) return;

    const isVideo = (f) => f.type.startsWith('video/');
    const isPhoto = (f) => f.type.startsWith('image/');

    const newFiles = picked.map(f => ({
      url:  URL.createObjectURL(f),
      type: isVideo(f) ? 'video' : 'photo',
      name: f.name,
    }));

    const combined = [...files, ...newFiles].slice(0, MAX_FILES);
    onFilesChange(combined);
    setSelectedIdx(combined.length - newFiles.length);
    setShowSheet(false);

    /* reset input */
    e.target.value = '';
  };

  /* Thumbnail yang ditampilkan di preview */
  const previewFile = files[selectedIdx] || null;

  const fmtLower = format.toLowerCase();

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
              Aset Kreatif
            </span>
          </div>

          <span style={{fontFamily:'var(--m-font)', fontSize:'13px', fontWeight:'600', color:'var(--m-ink-sub)'}}>1/2</span>
        </div>
        <ProgressBar step={1} total={2} />
      </div>

      {/* ── Scrollable content ── */}
      <main style={{
        flex:1, overflowY:'auto', padding:'16px 16px 0',
      }}>

        {/* Format tabs */}
        <div style={{marginBottom:'14px',
          display:'flex', gap:'0', background:'#F0F0F5',
          borderRadius:'12px', padding:'4px',
        }}>
          {FORMATS.map(f => {
            const active = fmtLower === f.toLowerCase();
            return (
              <button
                key={f}
                onClick={() => onFormatChange(f.toLowerCase())}
                style={{
                  flex:1, padding:'9px 0', borderRadius:'10px', border:'none',
                  cursor:'pointer', fontFamily:'var(--m-font)', fontSize:'14px', fontWeight:'600',
                  background: active ? 'var(--m-brand)' : 'transparent',
                  color: active ? '#fff' : 'var(--m-ink-sub)',
                  transition:'all .2s',
                }}
              >
                {f}
              </button>
            );
          })}
        </div>

        {/* ── Phone preview (hero) ── */}
        <div style={{display:'flex', justifyContent:'center', marginBottom:'14px'}}>
          <div style={{
            position:'relative',
            background:'#111',
            borderRadius:'24px',
            border:'3px solid #1a1a1a',
            overflow:'hidden',
            width:'200px',
            aspectRatio: FORMAT_RATIO[fmtLower] || '9/16',
            boxShadow:'0 12px 40px rgba(0,0,0,0.25)',
          }}>
            {/* Notch */}
            <div style={{
              position:'absolute', top:'8px', left:'50%', transform:'translateX(-50%)',
              width:'60px', height:'6px', background:'#1a1a1a', borderRadius:'3px', zIndex:10,
            }}/>

            {/* Media content */}
            {previewFile ? (
              previewFile.type === 'video' ? (
                <video src={previewFile.url} autoPlay muted loop playsInline
                  style={{width:'100%', height:'100%', objectFit:'cover'}} />
              ) : (
                <img src={previewFile.url} alt="preview"
                  style={{width:'100%', height:'100%', objectFit:'cover'}} />
              )
            ) : (
              <div style={{
                width:'100%', height:'100%',
                background:'linear-gradient(135deg, #f0a58a 0%, #e8845a 100%)',
                display:'flex', flexDirection:'column', justifyContent:'space-between',
                padding:'28px 12px 12px',
              }}>
                {/* Sponsored bar */}
                <div style={{display:'flex', alignItems:'center', justifyContent:'space-between'}}>
                  <div style={{display:'flex', alignItems:'center', gap:'5px'}}>
                    <div style={{width:'14px', height:'14px', borderRadius:'50%', background:'rgba(255,255,255,0.9)'}} />
                    <span style={{fontFamily:'var(--m-font)', fontSize:'9px', fontWeight:'700', color:'#fff'}}>nilacraft.id</span>
                  </div>
                  <span style={{fontFamily:'var(--m-font)', fontSize:'8px', color:'rgba(255,255,255,0.8)'}}>Sponsored</span>
                </div>
                {/* Learn More dihilangkan */}
              </div>
            )}
          </div>
        </div>

        {/* ── AI Kreatif entry ── */}
        <div onClick={openAISheet} style={{
          background:'#fff', borderRadius:'16px', border:'1px solid #E4E4EB',
          padding:'12px 14px', marginBottom:'14px',
          display:'flex', alignItems:'center', gap:'12px', cursor:'pointer',
        }}>
          <div style={{
            width:'44px', height:'44px', borderRadius:'12px', flexShrink:0,
            background:'var(--m-brand-soft)',
            display:'flex', alignItems:'center', justifyContent:'center',
          }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="var(--m-brand)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{width:'22px',height:'22px'}}>
              <path d="M12 2L9.5 9.5 2 12l7.5 2.5L12 22l2.5-7.5L22 12l-7.5-2.5z"/>
            </svg>
          </div>
          <div style={{flex:1}}>
            <div style={{display:'flex', alignItems:'center', gap:'6px', marginBottom:'2px'}}>
              <span style={{fontFamily:'var(--m-font)', fontSize:'14px', fontWeight:'700', color:'var(--m-ink)'}}>AI Kreatif</span>
              <span style={{
                fontFamily:'var(--m-font)', fontSize:'10px', fontWeight:'700',
                color:'#fff', background:'var(--m-brand)',
                padding:'2px 7px', borderRadius:'99px', letterSpacing:'0.3px',
              }}>BARU</span>
            </div>
            <div style={{fontFamily:'var(--m-font)', fontSize:'12px', color:'var(--m-ink-sub)'}}>
              Upload foto → AI bikin 3 variasi profesional
            </div>
          </div>
          <svg viewBox="0 0 24 24" fill="none" stroke="var(--m-ink-sub)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{width:'16px',height:'16px',flexShrink:0}}>
            <path d="M9 18l6-6-6-6"/>
          </svg>
        </div>

        {/* ── Asset selection card ── */}
        <div className="panel" style={{boxShadow:'none', border:'1px solid #E4E4EB', padding:'14px', marginBottom:'14px'}}>
          <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'12px'}}>
            <span style={{fontFamily:'var(--m-font)', fontSize:'14px', fontWeight:'700', color:'var(--m-ink)'}}>
              Maksimal 5 Foto atau 1 Video
            </span>
            <span style={{fontFamily:'var(--m-font)', fontSize:'12px', color:'var(--m-ink-sub)'}}>
              {files.length} foto · maks {MAX_FILES}
            </span>
          </div>

          {/* Thumbnails */}
          <div style={{display:'flex', gap:'8px', overflowX:'auto', paddingBottom:'4px'}}>
            {files.map((f, i) => (
              <div
                key={i}
                onClick={() => setSelectedIdx(i)}
                style={{
                  position:'relative', flexShrink:0,
                  width:'72px', height:'72px', borderRadius:'10px', overflow:'hidden',
                  border: i === selectedIdx ? '2.5px solid var(--m-brand)' : '2px solid transparent',
                  cursor:'pointer',
                }}
              >
                {f.type === 'video' ? (
                  <video src={f.url} style={{width:'100%', height:'100%', objectFit:'cover'}} muted />
                ) : (
                  <img src={f.url} alt={f.name} style={{width:'100%', height:'100%', objectFit:'cover'}} />
                )}
                {/* Checkmark */}
                {i === selectedIdx && (
                  <div style={{
                    position:'absolute', top:'4px', right:'4px',
                    width:'18px', height:'18px', borderRadius:'50%',
                    background:'var(--m-brand)', display:'flex',
                    alignItems:'center', justifyContent:'center',
                  }}>
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                  </div>
                )}
              </div>
            ))}

            {/* Add button */}
            {files.length < MAX_FILES && (
              <button
                onClick={() => setShowSheet(true)}
                style={{
                  flexShrink:0, width:'72px', height:'72px', borderRadius:'10px',
                  border:'1.5px dashed #D7D7DE', background:'#F9F9FB',
                  display:'flex', alignItems:'center', justifyContent:'center',
                  cursor:'pointer', fontSize:'24px', color:'var(--m-ink-sub)',
                }}
              >
                +
              </button>
            )}
          </div>
        </div>
        
        {/* Spacer for sticky CTA */}
        <div style={{ height: 'calc(160px + env(safe-area-inset-bottom))', flexShrink: 0 }} />
      </main>

      {/* ── Sticky CTA ── */}
      <div style={{
        position:'fixed',
        bottom:'calc(60px + env(safe-area-inset-bottom) + 12px)',
        left:'16px', right:'16px', zIndex:950,
      }}>
        <button onClick={onNext} style={{
          width:'100%', padding:'16px', borderRadius:'16px',
          background:'#1A1A1A', color:'#fff', border:'none',
          fontFamily:'var(--m-font)', fontSize:'15px', fontWeight:'700',
          cursor:'pointer', display:'flex', alignItems:'center',
          justifyContent:'center', gap:'8px',
        }}>
          Lanjut ke Caption
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
          </svg>
        </button>
      </div>

      {/* ── Action sheet: Galeri / Kamera ── */}
      {showSheet && (
        <>
          <div style={{position:'fixed', inset:0, background:'rgba(0,0,0,0.45)', zIndex:9998}}
            onClick={() => setShowSheet(false)} />
          <div style={{
            position:'fixed', bottom:0, left:0, right:0, zIndex:9999,
            background:'#fff', borderRadius:'20px 20px 0 0',
            padding:'20px 16px calc(24px + env(safe-area-inset-bottom))',
          }}>
            <div style={{textAlign:'center', marginBottom:'16px'}}>
              <div style={{width:'40px', height:'4px', borderRadius:'2px', background:'#E4E4EB', margin:'0 auto 14px'}} />
              <span style={{fontFamily:'var(--m-font)', fontSize:'15px', fontWeight:'700', color:'var(--m-ink)'}}>
                Tambah Aset
              </span>
            </div>
            <div style={{display:'flex', flexDirection:'column', gap:'10px'}}>
              {/* Galeri */}
              <button
                onClick={() => fileInputRef.current?.click()}
                style={{
                  width:'100%', padding:'16px', borderRadius:'14px',
                  background:'var(--m-brand-soft)', border:'none', cursor:'pointer',
                  display:'flex', alignItems:'center', gap:'14px',
                }}
              >
                <div style={{
                  width:'40px', height:'40px', borderRadius:'10px',
                  background:'var(--m-brand)', display:'flex', alignItems:'center', justifyContent:'center',
                }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="18" height="18" rx="2"/>
                    <circle cx="8.5" cy="8.5" r="1.5"/>
                    <polyline points="21 15 16 10 5 21"/>
                  </svg>
                </div>
                <div style={{textAlign:'left'}}>
                  <div style={{fontFamily:'var(--m-font)', fontSize:'14px', fontWeight:'700', color:'var(--m-ink)'}}>Pilih dari Galeri</div>
                  <div style={{fontFamily:'var(--m-font)', fontSize:'12px', color:'var(--m-ink-sub)'}}>Foto atau video dari perangkatmu</div>
                </div>
              </button>

              {/* Kamera */}
              <button
                onClick={() => cameraInputRef.current?.click()}
                style={{
                  width:'100%', padding:'16px', borderRadius:'14px',
                  background:'#F5F5F7', border:'none', cursor:'pointer',
                  display:'flex', alignItems:'center', gap:'14px',
                }}
              >
                <div style={{
                  width:'40px', height:'40px', borderRadius:'10px',
                  background:'var(--m-ink)', display:'flex', alignItems:'center', justifyContent:'center',
                }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/>
                    <circle cx="12" cy="13" r="4"/>
                  </svg>
                </div>
                <div style={{textAlign:'left'}}>
                  <div style={{fontFamily:'var(--m-font)', fontSize:'14px', fontWeight:'700', color:'var(--m-ink)'}}>Ambil Foto / Video</div>
                  <div style={{fontFamily:'var(--m-font)', fontSize:'12px', color:'var(--m-ink-sub)'}}>Gunakan kamera sekarang</div>
                </div>
              </button>

              {/* Cancel */}
              <button
                onClick={() => setShowSheet(false)}
                style={{
                  width:'100%', padding:'14px', borderRadius:'14px',
                  background:'transparent', border:'1.5px solid #E4E4EB', cursor:'pointer',
                  fontFamily:'var(--m-font)', fontSize:'14px', fontWeight:'600', color:'var(--m-ink-sub)',
                }}
              >
                Batal
              </button>
            </div>
          </div>
        </>
      )}

      {/* Hidden file inputs */}
      <input ref={fileInputRef}    type="file" accept="image/*,video/*" multiple style={{display:'none'}} onChange={handleFiles} />
      <input ref={cameraInputRef}  type="file" accept="image/*,video/*" capture="environment" style={{display:'none'}} onChange={handleFiles} />
      <input ref={aiPhotoRef}      type="file" accept="image/*" style={{display:'none'}}
        onChange={e => {
          const f = e.target.files?.[0]; if (!f) return;
          setAiPhoto({ url: URL.createObjectURL(f), file: f });
          e.target.value = '';
        }}
      />

      {/* ══ AI Kreatif Bottom Sheet ══ */}
      {showAISheet && (
        <>
          {/* Backdrop */}
          <div onClick={closeAISheet} style={{
            position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', zIndex:9998,
            opacity: animateAI ? 1 : 0, transition:'opacity 0.3s ease-out',
          }} />

          {/* Sheet */}
          <div style={{
            position:'fixed', bottom:0, left:0, right:0, zIndex:9999,
            background:'#fff', borderRadius:'20px 20px 0 0',
            display:'flex', flexDirection:'column',
            maxHeight:'88vh', overflow:'hidden',
            transform: animateAI ? 'translateY(0)' : 'translateY(100%)',
            transition:'transform 0.32s cubic-bezier(0.32,0.72,0,1)',
          }}>

            {/* Drag handle */}
            <div style={{display:'flex', justifyContent:'center', padding:'10px 0 0', flexShrink:0}}>
              <div style={{width:'40px', height:'4px', borderRadius:'2px', background:'#E4E4EB'}} />
            </div>

            {/* Header */}
            <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', padding:'12px 16px 0', flexShrink:0}}>
              <div style={{display:'flex', alignItems:'center', gap:'10px'}}>
                <div style={{
                  width:'36px', height:'36px', borderRadius:'10px',
                  background:'var(--m-brand-soft)',
                  display:'flex', alignItems:'center', justifyContent:'center',
                }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="var(--m-brand)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{width:'18px',height:'18px'}}>
                    <path d="M12 2L9.5 9.5 2 12l7.5 2.5L12 22l2.5-7.5L22 12l-7.5-2.5z"/>
                  </svg>
                </div>
                <div>
                  <div style={{fontFamily:'var(--m-font)', fontSize:'15px', fontWeight:'700', color:'var(--m-ink)'}}>AI Kreatif</div>
                  <div style={{fontFamily:'var(--m-font)', fontSize:'11px', color:'var(--m-ink-sub)'}}>Upload foto → AI bikin 3 variasi profesional</div>
                </div>
              </div>
              <button onClick={closeAISheet} style={{
                width:'32px', height:'32px', borderRadius:'50%', background:'#F4F4F7',
                border:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0,
              }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="var(--m-ink)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{width:'16px',height:'16px'}}>
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>

            {/* Scrollable body */}
            <div style={{flex:1, overflowY:'auto', padding:'16px'}}>

              {/* Step 1: Upload foto produk */}
              <div style={{marginBottom:'20px'}}>
                <div style={{fontFamily:'var(--m-font)', fontSize:'13px', fontWeight:'700', color:'var(--m-ink-sub)', marginBottom:'10px', textTransform:'uppercase', letterSpacing:'0.5px'}}>
                  1 · Foto Produkmu
                </div>
                <div
                  onClick={() => aiPhotoRef.current?.click()}
                  style={{
                    border: aiPhoto ? '2px solid var(--m-brand)' : '2px dashed #D7D7DE',
                    borderRadius:'14px', overflow:'hidden',
                    background: aiPhoto ? '#000' : '#F9F9FB',
                    height:'160px', cursor:'pointer',
                    display:'flex', alignItems:'center', justifyContent:'center',
                    position:'relative',
                  }}
                >
                  {aiPhoto ? (
                    <>
                      <img src={aiPhoto.url} alt="produk"
                        style={{width:'100%', height:'100%', objectFit:'contain'}} />
                      <div style={{
                        position:'absolute', top:'8px', right:'8px',
                        background:'rgba(0,0,0,0.55)', borderRadius:'8px', padding:'4px 10px',
                      }}>
                        <span style={{fontFamily:'var(--m-font)', fontSize:'11px', color:'#fff', fontWeight:'600'}}>Ganti</span>
                      </div>
                    </>
                  ) : (
                    <div style={{textAlign:'center'}}>
                      <div style={{
                        width:'44px', height:'44px', borderRadius:'12px',
                        background:'#EBEBF0', display:'flex', alignItems:'center', justifyContent:'center',
                        margin:'0 auto 8px',
                      }}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="var(--m-ink-sub)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{width:'22px',height:'22px'}}>
                          <rect x="3" y="3" width="18" height="18" rx="2"/>
                          <circle cx="8.5" cy="8.5" r="1.5"/>
                          <polyline points="21 15 16 10 5 21"/>
                        </svg>
                      </div>
                      <div style={{fontFamily:'var(--m-font)', fontSize:'13px', fontWeight:'600', color:'var(--m-ink)'}}>Tap untuk upload foto</div>
                      <div style={{fontFamily:'var(--m-font)', fontSize:'11px', color:'var(--m-ink-sub)', marginTop:'2px'}}>JPG atau PNG, max 10MB</div>
                    </div>
                  )}
                </div>
              </div>

              {/* Step 2: Pilih style */}
              <div style={{marginBottom:'24px'}}>
                <div style={{fontFamily:'var(--m-font)', fontSize:'13px', fontWeight:'700', color:'var(--m-ink-sub)', marginBottom:'10px', textTransform:'uppercase', letterSpacing:'0.5px'}}>
                  2 · Pilih Style
                </div>
                <div style={{display:'flex', flexDirection:'column', gap:'8px'}}>
                  {AI_STYLES.map(s => (
                    <div
                      key={s.id}
                      onClick={() => setAiStyle(s.id)}
                      style={{
                        display:'flex', alignItems:'center', gap:'12px',
                        padding:'12px 14px', borderRadius:'12px', cursor:'pointer',
                        border: aiStyle === s.id ? '2px solid var(--m-brand)' : '1.5px solid #E4E4EB',
                        background: aiStyle === s.id ? 'var(--m-brand-soft)' : '#fff',
                        transition:'all .15s',
                      }}
                    >
                      <span style={{fontSize:'22px', flexShrink:0}}>{s.emoji}</span>
                      <div style={{flex:1}}>
                        <div style={{fontFamily:'var(--m-font)', fontSize:'14px', fontWeight:'700', color: aiStyle === s.id ? 'var(--m-brand)' : 'var(--m-ink)'}}>
                          {s.label}
                        </div>
                        <div style={{fontFamily:'var(--m-font)', fontSize:'12px', color:'var(--m-ink-sub)', marginTop:'1px'}}>
                          {s.desc}
                        </div>
                      </div>
                      {aiStyle === s.id && (
                        <div style={{
                          width:'20px', height:'20px', borderRadius:'50%',
                          background:'var(--m-brand)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0,
                        }}>
                          <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{width:'11px',height:'11px'}}>
                            <polyline points="20 6 9 17 4 12"/>
                          </svg>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Generate button (footer) */}
            <div style={{
              padding:'12px 16px', borderTop:'1px solid #F0F0F5',
              background:'#fff', flexShrink:0,
              paddingBottom:'calc(12px + env(safe-area-inset-bottom))',
            }}>
              <button
                disabled={!aiPhoto}
                style={{
                  width:'100%', padding:'16px', borderRadius:'16px', border:'none',
                  background: aiPhoto ? 'var(--m-brand)' : '#E4E4EB',
                  color: aiPhoto ? '#fff' : '#A0A0B0',
                  fontFamily:'var(--m-font)', fontSize:'15px', fontWeight:'700',
                  cursor: aiPhoto ? 'pointer' : 'not-allowed',
                  display:'flex', alignItems:'center', justifyContent:'center', gap:'8px',
                  transition:'background .2s',
                }}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{width:'18px',height:'18px'}}>
                  <path d="M12 2L9.5 9.5 2 12l7.5 2.5L12 22l2.5-7.5L22 12l-7.5-2.5z"/>
                </svg>
                {aiPhoto ? 'Generate 3 Variasi' : 'Upload foto dulu'}
              </button>
            </div>

          </div>
        </>
      )}
    </div>
  );
}
