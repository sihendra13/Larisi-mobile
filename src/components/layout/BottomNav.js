'use client';

export default function BottomNav({ activeNav, onSwitch, isGenZ }) {
  const tabs = [
    {
      view: 'command', label: 'Dapur',
      icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>
    },
    {
      view: 'monitor', label: 'Kelola',
      icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
    },
    {
      view: 'analytics', label: 'Performa',
      icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
    },
  ];

  return (
    <nav
      className="mobile-tab-bar"
      role="navigation"
      aria-label="Navigasi utama"
      style={isGenZ ? {
        background: '#0e0e12',
        borderTop: '1px solid #1e1e24',
        boxShadow: '0 -2px 12px rgba(0,0,0,0.4)'
      } : {}}
    >
      {tabs.map(tab => {
        const isActive = activeNav === tab.view;
        return (
          <button
            key={tab.view}
            className={`mobile-nav-tab${isActive ? ' active' : ''}`}
            onClick={() => onSwitch(tab.view)}
            aria-label={tab.label}
            style={isGenZ ? {
              color: isActive ? '#fff' : '#6b7280',
            } : {}}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
