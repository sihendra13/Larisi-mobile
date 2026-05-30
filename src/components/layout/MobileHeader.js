'use client';

export default function MobileHeader({
  userName      = 'Pengguna',
  userInitials  = 'P',
  isPro         = false,
  onAvatarClick = null,
}) {
  return (
    <header id="mobile-app-header" className="mobile-app-header" aria-label="Header aplikasi"
      style={{
        position: 'sticky', top: 0, zIndex: 200,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '12px 16px', background: '#fff',
        borderBottom: '1px solid #F3F4F6',
      }}
    >
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <img
          src="/logo_larisi.svg"
          alt="Larisi"
          style={{ height: '22px', width: 'auto', display: 'block' }}
        />
      </div>

      {/* Right side */}
      <div className="mobile-app-header__right" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {/* Search */}
        <button
          style={{ width: '38px', height: '38px', borderRadius: '50%', background: '#fff', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}
          aria-label="Cari"
        >
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="var(--m-ink)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
        </button>

        {/* Notif */}
        <button
          style={{ width: '38px', height: '38px', borderRadius: '50%', background: '#fff', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}
          aria-label="Notifikasi"
        >
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="var(--m-ink)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0"/>
          </svg>
        </button>

        {/* Avatar pill */}
        <div
          onClick={onAvatarClick}
          style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            background: '#F4F4F7', borderRadius: '999px',
            padding: '4px 4px 4px 12px',
            cursor: onAvatarClick ? 'pointer' : 'default',
          }}
          role={onAvatarClick ? 'button' : undefined}
          aria-label="Profil saya"
        >
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 0 }}>
            <span style={{ fontFamily: 'var(--m-font)', fontSize: '12px', fontWeight: '700', color: 'var(--m-ink)', lineHeight: '1.2' }}>
              {userName}
            </span>
            {isPro && (
              <span style={{ color: 'var(--m-brand)', fontSize: '10px', fontWeight: '700', lineHeight: '1.2' }}>PRO</span>
            )}
          </div>
          <div style={{
            width: '32px', height: '32px', borderRadius: '50%',
            background: 'var(--m-ink)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}>
            <span style={{ color: '#fff', fontFamily: 'var(--m-font)', fontSize: '13px', fontWeight: '700' }}>
              {userInitials}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
