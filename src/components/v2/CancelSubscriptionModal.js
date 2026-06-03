import React, { useState, useEffect } from 'react';

/**
 * CancelSubscriptionModal
 * Confirmation modal sebelum user membatalkan subscription
 */
export default function CancelSubscriptionModal({
  isOpen,
  onClose,
  onConfirm,
  currentPlan = 'starter',
  isLoading = false
}) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      document.body.style.overflow = 'hidden';
    } else {
      setTimeout(() => setIsVisible(false), 300);
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen && !isVisible) return null;

  const planLabels = {
    freemium: 'Freemium',
    starter: 'Starter',
    pro: 'Pro'
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: isOpen ? 'rgba(0, 0, 0, 0.6)' : 'rgba(0, 0, 0, 0)',
        zIndex: 99999,
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
        transition: 'background-color 0.3s ease',
        fontFamily: 'var(--m-font)'
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '500px',
          backgroundColor: '#fff',
          borderTopLeftRadius: '24px',
          borderTopRightRadius: '24px',
          padding: '24px',
          transform: isOpen ? 'translateY(0)' : 'translateY(100%)',
          transition: 'transform 0.3s cubic-bezier(0.32, 0.72, 0, 1)',
          boxShadow: '0 -10px 40px rgba(0,0,0,0.1)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drag handle */}
        <div style={{ width: '40px', height: '4px', backgroundColor: '#e5e7eb', borderRadius: '4px', margin: '0 auto 20px' }}></div>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{ fontSize: '40px', marginBottom: '12px' }}>⚠️</div>
          <h2 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--m-ink)', margin: '0 0 8px', letterSpacing: '-0.5px' }}>
            Batalkan Subscription?
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--m-ink-sub)', margin: '0', lineHeight: 1.5 }}>
            Paket {planLabels[currentPlan]} Anda akan berakhir dan akses fitur premium akan hilang.
          </p>
        </div>

        {/* Warning box */}
        <div
          style={{
            backgroundColor: 'var(--m-warn-bg)',
            border: '1px solid var(--m-warn-border)',
            borderRadius: 'var(--r-medium)',
            padding: 'var(--sp-12)',
            marginBottom: '24px',
            fontSize: 'var(--text-body-s)',
            color: 'var(--m-warn-text)',
            lineHeight: 1.5
          }}
        >
          ✓ Anda masih bisa menggunakan fitur Freemium setelah pembatalan
          <br />
          ✓ Akses ke data dan kampanye Anda tetap tersimpan
        </div>

        {/* Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-12)' }}>
          {/* Confirm cancel button */}
          <button
            onClick={onConfirm}
            disabled={isLoading}
            style={{
              background: 'var(--m-danger-bg)',
              color: 'var(--m-danger-text)',
              border: `1px solid var(--m-danger-border)`,
              borderRadius: 'var(--r-medium)',
              padding: '16px',
              fontSize: 'var(--text-body-m)',
              fontWeight: 700,
              cursor: isLoading ? 'not-allowed' : 'pointer',
              opacity: isLoading ? 0.6 : 1,
              transition: 'opacity 0.2s',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 'var(--sp-8)'
            }}
          >
            {isLoading ? (
              <>
                <div
                  style={{
                    width: '14px',
                    height: '14px',
                    border: '2px solid var(--m-danger-text)',
                    borderTopColor: 'transparent',
                    borderRadius: '50%',
                    animation: 'spin 0.7s linear infinite'
                  }}
                />
                Memproses...
              </>
            ) : (
              'Ya, Batalkan Subscription'
            )}
          </button>

          {/* Keep subscription button */}
          <button
            onClick={onClose}
            disabled={isLoading}
            style={{
              background: '#1a1a1a',
              color: '#fff',
              border: 'none',
              borderRadius: 'var(--r-medium)',
              padding: '16px',
              fontSize: 'var(--text-body-m)',
              fontWeight: 700,
              cursor: isLoading ? 'not-allowed' : 'pointer',
              opacity: isLoading ? 0.6 : 1,
              transition: 'opacity 0.2s'
            }}
          >
            Tetap Berlangganan
          </button>
        </div>

        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    </div>
  );
}
