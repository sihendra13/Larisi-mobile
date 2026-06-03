import React, { useState, useEffect } from 'react';

/**
 * QuotaWarningBanner
 * Displays warning messages about quota, trial expiry, or payment expiry
 *
 * Types:
 * - 'warning' (yellow): Quota sisa 2-3, atau trial/paid sisa 2-3 hari
 * - 'danger' (red): Quota habis, atau periode sudah expired
 */
export default function QuotaWarningBanner({
  isVisible,
  type = 'warning', // 'warning' or 'danger'
  message,
  onClose,
  onUpgradeClick
}) {
  const [display, setDisplay] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setDisplay(true);
    } else {
      const timer = setTimeout(() => setDisplay(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isVisible]);

  if (!display) return null;

  const isWarning = type === 'warning';
  const bgColor = isWarning ? 'var(--m-warn-bg)' : 'var(--m-danger-bg)';
  const borderColor = isWarning ? 'var(--m-warn-border)' : 'var(--m-danger-border)';
  const textColor = isWarning ? 'var(--m-warn-text)' : 'var(--m-danger-text)';

  return (
    <div
      style={{
        position: 'sticky',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        backgroundColor: bgColor,
        borderBottom: `1px solid ${borderColor}`,
        padding: 'var(--sp-12) var(--sp-16)',
        fontFamily: 'var(--m-font)',
        animation: isVisible ? 'slideDown 0.3s ease-out' : 'slideUp 0.3s ease-in',
      }}
    >
      <style>{`
        @keyframes slideDown {
          from { transform: translateY(-100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes slideUp {
          from { transform: translateY(0); opacity: 1; }
          to { transform: translateY(-100%); opacity: 0; }
        }
      `}</style>

      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-12)' }}>
        {/* Message */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontSize: 'var(--text-body-s)',
              fontWeight: 500,
              color: textColor,
              lineHeight: 1.4,
            }}
            dangerouslySetInnerHTML={{ __html: message }}
          />
        </div>

        {/* Close button (only for warning, not danger) */}
        {isWarning && onClose && (
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: textColor,
              fontSize: '18px',
              cursor: 'pointer',
              padding: 'var(--sp-4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: 0.6,
              transition: 'opacity 0.2s',
            }}
            onMouseEnter={(e) => (e.target.style.opacity = '1')}
            onMouseLeave={(e) => (e.target.style.opacity = '0.6')}
            title="Tutup"
          >
            ✕
          </button>
        )}
      </div>
    </div>
  );
}
