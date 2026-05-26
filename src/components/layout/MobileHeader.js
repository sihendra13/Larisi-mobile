'use client';

export default function MobileHeader({ userName = 'Pengguna', userInitials = 'P', isPro = false }) {
  return (
    <header id="mobile-app-header" className="mobile-app-header" aria-label="Header aplikasi">
      <div className="m-logo" aria-hidden="true">L</div>
      <div className="mobile-app-header__right">
        <button className="m-icon-btn m-icon-btn--ghost" aria-label="Cari">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
        </button>
        <button className="m-icon-btn m-icon-btn--ghost" aria-label="Notifikasi">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0"/>
          </svg>
        </button>
        <div style={{display:'flex',alignItems:'center',gap:'8px',marginLeft:'4px',background:'#F4F4F7',borderRadius:'999px',padding:'4px 4px 4px 14px',cursor:'pointer'}}>
          <div style={{display:'flex',flexDirection:'column',alignItems:'flex-end',gap:'0'}}>
            <span style={{fontFamily:'var(--m-font)',fontSize:'12px',fontWeight:'700',color:'var(--m-ink)',lineHeight:'1.2'}}>{userName}</span>
            {isPro && <span style={{color:'var(--m-brand)',fontSize:'10px',fontWeight:'700',lineHeight:'1.2'}}>PRO</span>}
          </div>
          <div className="m-avatar" style={{cursor:'pointer',background:'var(--m-ink)',padding:'0'}}>
            <div className="m-avatar__inner" style={{color:'#fff',background:'transparent',border:'none',fontWeight:'600'}}>{userInitials}</div>
          </div>
        </div>
      </div>
    </header>
  );
}
