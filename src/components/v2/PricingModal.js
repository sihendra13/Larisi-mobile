import React, { useState, useEffect } from 'react';

export default function PricingModal({ isOpen, onClose, onSelectPlan, currentPlan = 'freemium', title = "Masa Trial Selesai!", description = "7 hari gratis Anda telah berakhir. Pilih paket untuk mulai berlangganan:" }) {
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
          maxHeight: '90vh',
          overflowY: 'auto',
          boxShadow: '0 -10px 40px rgba(0,0,0,0.1)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drag handle */}
        <div style={{ width: '40px', height: '4px', backgroundColor: '#e5e7eb', borderRadius: '4px', margin: '0 auto 20px' }}></div>
        
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{ fontSize: '40px', marginBottom: '12px' }}>⏰</div>
          <h2 style={{ fontSize: '22px', fontWeight: 700, color: '#1a1a1a', margin: '0 0 8px', letterSpacing: '-0.5px' }}>
            {title}
          </h2>
          <p style={{ fontSize: '14px', color: '#6b7280', margin: '0 0 16px', lineHeight: 1.5 }}>
            {description}
          </p>
          <div style={{ display: 'inline-block', background: '#f4f0ff', color: '#5b17b7', fontSize: '12px', fontWeight: 600, padding: '4px 12px', borderRadius: '20px' }}>
            Paket saat ini: {currentPlan.toUpperCase()}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <button 
            onClick={() => onSelectPlan('pro', 199000)}
            style={{
              background: '#1a1a1a',
              color: '#fff',
              border: 'none',
              borderRadius: '16px',
              padding: '16px',
              fontSize: '15px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
            }}
          >
            <span style={{ marginBottom: '4px' }}>Mulai Berlangganan Pro</span>
            <span style={{ fontSize: '13px', fontWeight: 500, color: '#9ca3af' }}>Rp 199.000 / bulan</span>
          </button>
          
          <button 
            onClick={() => onSelectPlan('starter', 99000)}
            style={{
              background: '#fff',
              color: '#1a1a1a',
              border: '2px solid #e5e7eb',
              borderRadius: '16px',
              padding: '16px',
              fontSize: '15px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center'
            }}
          >
            <span style={{ marginBottom: '4px' }}>Mulai Berlangganan Starter</span>
            <span style={{ fontSize: '13px', fontWeight: 500, color: '#6b7280' }}>Rp 99.000 / bulan</span>
          </button>
          
          <button 
            onClick={onClose}
            style={{
              background: 'transparent',
              color: '#6b7280',
              border: 'none',
              borderRadius: '16px',
              padding: '16px',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer',
              marginTop: '4px'
            }}
          >
            Tetap di Paket Freemium (Gratis)
          </button>
        </div>
        
        <p style={{ fontSize: '12px', color: '#9ca3af', margin: '20px 0 0', textAlign: 'center' }}>
          Tidak ada biaya tersembunyi. Batalkan kapan saja.
        </p>
      </div>
    </div>
  );
}
