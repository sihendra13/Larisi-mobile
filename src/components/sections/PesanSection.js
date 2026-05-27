'use client';
import { useState } from 'react';

const PLATFORMS = ['instagram', 'facebook', 'tiktok', 'youtube'];
const PLATFORM_LABELS = { instagram: 'Instagram', facebook: 'Facebook', tiktok: 'TikTok', youtube: 'YouTube' };

const PLATFORM_ICONS = {
  instagram: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#E1306C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{flexShrink:0}}>
      <rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="0.8" fill="#E1306C" stroke="none"/>
    </svg>
  ),
  facebook: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{flexShrink:0}}>
      <rect width="24" height="24" rx="6" fill="#1877F2"/>
      <path d="M13.5 8h2V5.5h-2C11.57 5.5 10 7.07 10 9v1.5H8V13h2v7h3v-7h2l.5-2.5H13V9c0-.28.22-.5.5-.5z" fill="white"/>
    </svg>
  ),
  tiktok: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{flexShrink:0}}>
      <rect width="24" height="24" rx="6" fill="#000"/>
      <path d="M16 8c.55.73 1.4 1.2 2.35 1.25v2.1a4.55 4.55 0 01-2.35-.65v5.8a4.1 4.1 0 11-4.1-4.1h.27v2.1H12a2 2 0 102 2V8z" fill="white"/>
    </svg>
  ),
  youtube: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{flexShrink:0}}>
      <rect width="24" height="24" rx="5" fill="#FF0000"/>
      <path d="M9.5 8.5l6 3.5-6 3.5V8.5z" fill="white"/>
    </svg>
  ),
};

const ChevronDown = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginLeft:'2px'}}>
    <path d="m6 9 6 6 6-6"/>
  </svg>
);

export default function PesanSection() {
  const [platform, setPlatform] = useState('instagram');
  const [caption, setCaption] = useState('');

  const cyclePlatform = () => {
    const idx = PLATFORMS.indexOf(platform);
    setPlatform(PLATFORMS[(idx + 1) % PLATFORMS.length]);
  };

  return (
    <div className="panel" id="panel-caption" style={{display:'flex',flexDirection:'column'}}>
      {/* Header */}
      <div className="panel-header" style={{justifyContent:'space-between'}}>
        <div style={{display:'flex',alignItems:'center',gap:'10px'}}>
          <div className="panel-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3"/>
              <path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"/>
            </svg>
          </div>
          <div>
            <div className="panel-title">Asisten AI Pintar</div>
            <div className="panel-sub">Bikin kontenmu lebih menarik secara real-time</div>
          </div>
        </div>
      </div>

      {/* AI Content */}
      <div id="mobile-section-ai" style={{padding:'16px'}}>

        {/* Posting ke */}
        <div className="opt-mode-row" style={{background:'#F5F5F7',borderRadius:'12px',padding:'10px 14px',marginBottom:'24px',marginTop:'24px',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
          <div className="section-label" style={{fontSize:'13px',fontWeight:'500',color:'var(--m-ink-sub)',margin:'0',textTransform:'none',letterSpacing:'0'}}>Posting ke</div>
          <button
            onClick={cyclePlatform}
            style={{background:'#fff',border:'1px solid rgba(0,0,0,0.12)',borderRadius:'99px',padding:'6px 12px 6px 10px',fontSize:'13px',fontWeight:'600',color:'var(--m-ink)',display:'flex',alignItems:'center',gap:'6px',cursor:'pointer',boxShadow:'none'}}
          >
            {PLATFORM_ICONS[platform]}
            {PLATFORM_LABELS[platform]}
            <ChevronDown />
          </button>
        </div>

        {/* Sliders */}
        <div style={{display:'flex',flexDirection:'column',gap:'16px',marginBottom:'24px'}}>
          <div className="filter-row" style={{display:'grid',gridTemplateAreas:'"label val" "slider slider"',gridTemplateColumns:'1fr auto',rowGap:'8px',alignItems:'center'}}>
            <div className="filter-label" style={{gridArea:'label',fontSize:'13px',color:'var(--m-ink-sub)'}}>Terang-Gelap</div>
            <div className="filter-val" style={{gridArea:'val',fontSize:'13px',fontWeight:'600',color:'var(--m-ink)'}}>100%</div>
            <input type="range" min="0" max="100" defaultValue="100" style={{gridArea:'slider',WebkitAppearance:'none',width:'100%',height:'4px',borderRadius:'4px',outline:'none',margin:0,background:'linear-gradient(to right, #0E0E12 100%, #ECECF1 100%)'}} />
          </div>
          <div className="filter-row" style={{display:'grid',gridTemplateAreas:'"label val" "slider slider"',gridTemplateColumns:'1fr auto',rowGap:'8px',alignItems:'center'}}>
            <div className="filter-label" style={{gridArea:'label',fontSize:'13px',color:'var(--m-ink-sub)'}}>Ketajaman Warna</div>
            <div className="filter-val" style={{gridArea:'val',fontSize:'13px',fontWeight:'600',color:'var(--m-ink)'}}>100%</div>
            <input type="range" min="0" max="100" defaultValue="100" style={{gridArea:'slider',WebkitAppearance:'none',width:'100%',height:'4px',borderRadius:'4px',outline:'none',margin:0,background:'linear-gradient(to right, #0E0E12 100%, #ECECF1 100%)'}} />
          </div>
        </div>

        {/* Caption AI */}
        <div>
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'12px'}}>
            <div className="section-label" style={{fontSize:'13px',fontWeight:'700',color:'var(--m-ink)',margin:'0',textTransform:'none',letterSpacing:'0'}}>Pesan dioptimalkan AI</div>
            <div style={{fontSize:'11px',fontWeight:'700',color:'#4A3FCC',textTransform:'uppercase',letterSpacing:'.5px',display:'flex',alignItems:'center',gap:'4px'}}>
              {PLATFORM_ICONS[platform]}
              <span>{PLATFORM_LABELS[platform].toUpperCase()}</span>
            </div>
          </div>
          <div style={{background:'#F5F5F7',borderRadius:'12px',padding:'16px',marginBottom:'6px'}}>
            <textarea
              id="captionArea"
              placeholder="Tunggu sebentar, AI akan menuliskan pesan untukmu. Kamu bebas mengeditnya kembali agar lebih sesuai."
              rows={5}
              value={caption}
              onChange={e => setCaption(e.target.value)}
              style={{background:'transparent',border:'none',fontSize:'13px',color:'var(--m-ink-sub)',lineHeight:'1.5',resize:'none',padding:'0',minHeight:'80px',width:'100%',outline:'none'}}
            />
          </div>
          {/* Character counter */}
          <div style={{textAlign:'right',fontSize:'11px',color: caption.length > 2000 ? '#E53E3E' : 'var(--m-ink-sub)',fontFamily:'var(--m-font)',marginBottom:'16px'}}>
            {caption.length} / 2.200
          </div>
          <button
            style={{width:'100%',padding:'14px',borderRadius:'16px',background:'var(--m-ink)',color:'#fff',border:'none',fontWeight:'600',fontSize:'13px',display:'flex',alignItems:'center',justifyContent:'center',gap:'8px',cursor:'pointer'}}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 11-7.778 7.778 5.5 5.5 0 017.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/>
            </svg>
            Generate ulang
          </button>
        </div>

        {/* Hubungkan Akun */}
        <div id="mobile-section-social" style={{marginTop:'8px'}}>
          <div style={{fontSize:'13px',fontWeight:'700',color:'var(--m-ink)',marginBottom:'12px',fontFamily:'var(--m-font)'}}>Hubungkan Akun</div>

          {/* Connected account example */}
          <div style={{display:'flex',alignItems:'center',gap:'10px',marginBottom:'10px'}}>
            <div style={{width:'40px',height:'40px',borderRadius:'99px',background:'linear-gradient(135deg,#E1306C,#F77737)',padding:'2px',flexShrink:0}}>
              <div style={{width:'100%',height:'100%',borderRadius:'99px',background:'#FFF6E8',display:'grid',placeItems:'center',color:'#E1306C',fontWeight:'700',fontSize:'15px'}}>N</div>
            </div>
            <div style={{flex:1}}>
              <div style={{fontFamily:'var(--m-font)',fontSize:'13px',fontWeight:'600',color:'var(--m-ink)'}}>@nila.craft</div>
              <div style={{fontFamily:'var(--m-font)',fontSize:'11px',color:'var(--m-ink-sub)'}}>Instagram · Terhubung</div>
            </div>
            <div style={{width:'8px',height:'8px',borderRadius:'50%',background:'#22C55E',flexShrink:0}} />
          </div>

          {/* Add account button */}
          <button style={{
            display:'flex', alignItems:'center', gap:'10px',
            width:'100%', padding:'12px 14px',
            border:'1.5px dashed #D7D7DE', borderRadius:'12px',
            background:'transparent', cursor:'pointer',
          }}>
            <div style={{
              width:'36px', height:'36px', borderRadius:'99px',
              border:'1.5px solid #D7D7DE', background:'var(--m-bg)',
              display:'grid', placeItems:'center', flexShrink:0,
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--m-ink-sub)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 5v14M5 12h14"/>
              </svg>
            </div>
            <span style={{fontFamily:'var(--m-font)',fontSize:'13px',fontWeight:'600',color:'var(--m-ink-sub)'}}>
              Tambah akun lain
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
