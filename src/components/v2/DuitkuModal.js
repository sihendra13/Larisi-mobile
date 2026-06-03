import React, { useState, useEffect } from 'react';

const DUITKU_BANK_NAMES = {
  'BT': 'Permata Bank', 'BC': 'BCA', 'M2': 'Bank Mandiri', 'VC': 'CIMB Niaga',
  'BV': 'BSI', 'I1': 'BNI', 'B1': 'CIMB Niaga VA', 'M3': 'Maybank',
  'AG': 'Bank Artha Graha', 'BNC': 'Bank Neo Commerce',
};

export default function DuitkuModal({ isOpen, onClose, paymentDetails }) {
  const [isVisible, setIsVisible] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60 * 60); // 1 hour in seconds
  const [isCopied, setIsCopied] = useState(false);
  const [showDetail, setShowDetail] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      document.body.style.overflow = 'hidden';
      setTimeLeft(60 * 60);
    } else {
      setTimeout(() => setIsVisible(false), 300);
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Countdown timer
  useEffect(() => {
    if (!isOpen || timeLeft <= 0) return;
    const timerId = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);
    return () => clearInterval(timerId);
  }, [isOpen, timeLeft]);

  if (!isOpen && !isVisible) return null;
  if (!paymentDetails) return null;

  const formatRupiah = (n) => 'Rp ' + parseInt(n).toLocaleString('id-ID');
  
  const vaNumber = paymentDetails.vaNumber || '';
  const amount = paymentDetails.amount || 0;
  const originalAmount = paymentDetails.originalAmount || paymentDetails.amount || 0;
  const svcFee = Math.max(0, parseInt(amount) - parseInt(originalAmount));
  const bankCode = paymentDetails.paymentCode || paymentDetails.bankCode || '';
  const bankName = DUITKU_BANK_NAMES[bankCode] || 'Virtual Account';
  const plan = paymentDetails.plan || '';
  const orderId = paymentDetails.orderId || '';

  const today = new Date();
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const dateStr = `${today.getDate()}-${months[today.getMonth()]}-${today.getFullYear()}`;

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const timeString = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const handleCopy = () => {
    if (vaNumber) {
      navigator.clipboard.writeText(vaNumber);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 1500);
    }
  };

  return (
    <div 
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: isOpen ? 'rgba(0, 0, 0, 0.4)' : 'rgba(0, 0, 0, 0)',
        backdropFilter: isOpen ? 'blur(4px)' : 'none',
        zIndex: 99999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        transition: 'all 0.3s ease',
        fontFamily: 'var(--m-font)'
      }}
      onClick={onClose}
    >
      <div 
        style={{
          width: '100%',
          maxWidth: '400px',
          backgroundColor: '#fff',
          borderRadius: '20px',
          transform: isOpen ? 'scale(1)' : 'scale(0.95)',
          opacity: isOpen ? 1 : 0,
          transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
          overflow: 'hidden',
          boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ background: '#111827', padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ color: '#fff', fontSize: '18px', fontWeight: 700 }}>LARISI</div>
            <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: '13px', marginTop: '4px' }}>
              Langganan Paket {plan.toUpperCase()}
            </div>
          </div>
          <button 
            onClick={onClose}
            style={{
              background: 'rgba(255,255,255,0.15)',
              border: 'none',
              color: '#fff',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              fontSize: '18px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            ✕
          </button>
        </div>

        {/* Amount & Timer */}
        <div style={{ padding: '24px', borderBottom: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ color: '#6b7280', fontSize: '13px', marginBottom: '4px' }}>Jumlah Pembayaran</div>
            <div style={{ fontSize: '24px', fontWeight: 700, color: '#111827' }}>{formatRupiah(amount)}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ color: '#6b7280', fontSize: '12px', marginBottom: '4px' }}>Sisa Waktu</div>
            <div style={{ fontSize: '18px', fontWeight: 700, color: timeLeft > 0 ? 'var(--m-brand)' : '#ef4444', fontVariantNumeric: 'tabular-nums' }}>
              {timeLeft > 0 ? timeString : '00:00'}
            </div>
          </div>
        </div>

        {/* VA Info */}
        <div style={{ padding: '20px 24px', borderBottom: '1px solid #f3f4f6' }}>
          <div style={{ color: '#6b7280', fontSize: '13px', marginBottom: '4px' }}>Metode Pembayaran</div>
          <div style={{ fontWeight: 600, fontSize: '15px', color: '#111827', marginBottom: '16px' }}>{bankName}</div>
          
          <div style={{ color: '#6b7280', fontSize: '13px', marginBottom: '6px' }}>Nomor Virtual Account</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ fontSize: '20px', fontWeight: 700, color: '#111827', letterSpacing: '2px', flex: 1, wordBreak: 'break-all' }}>
              {vaNumber || '...'}
            </div>
            <button 
              onClick={handleCopy}
              style={{
                background: isCopied ? '#10b981' : '#111827',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                padding: '8px 16px',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'background 0.2s'
              }}
            >
              {isCopied ? 'Tersalin' : 'Salin'}
            </button>
          </div>
        </div>

        {/* Status */}
        <div style={{ padding: '24px' }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            gap: '8px', 
            padding: '12px', 
            background: timeLeft > 0 ? '#fef3c7' : '#fee2e2', 
            borderRadius: '12px', 
            fontSize: '14px', 
            fontWeight: 600, 
            color: timeLeft > 0 ? '#92400e' : '#991b1b' 
          }}>
            <span style={{ 
              width: '10px', 
              height: '10px', 
              borderRadius: '50%', 
              background: timeLeft > 0 ? '#f59e0b' : '#ef4444',
              display: 'inline-block' 
            }}></span>
            {timeLeft > 0 ? 'Menunggu Pembayaran...' : 'Invoice Kadaluarsa'}
          </div>
          
          {/* Detail Transaksi Button */}
          <button
            onClick={() => setShowDetail(true)}
            style={{
              width: '100%',
              marginTop: '12px',
              padding: '12px',
              border: '1.5px solid #111827',
              borderRadius: '10px',
              background: '#fff',
              color: '#111827',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: 'var(--m-font)'
            }}
          >
            Lihat Detail Transaksi
          </button>

          <div style={{ textAlign: 'center', marginTop: '16px' }}>
            <span style={{ fontSize: '12px', color: '#6b7280' }}>
              Pembayaran diproses otomatis oleh Duitku
            </span>
          </div>
        </div>
      </div>

      {/* Detail Transaksi Modal */}
      {showDetail && (
        <div
          onClick={() => setShowDetail(false)}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
            zIndex: 100001, display: 'flex', alignItems: 'center',
            justifyContent: 'center', padding: '16px'
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{ background: '#fff', borderRadius: '12px', width: '100%', maxWidth: '380px', overflow: 'hidden', fontFamily: 'var(--m-font)' }}
          >
            {/* Header */}
            <div style={{ background: '#f5f5f5', padding: '14px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 700, fontSize: '15px' }}>Detail Transaksi</span>
              <button onClick={() => setShowDetail(false)} style={{ background: 'none', border: 'none', fontSize: '22px', cursor: 'pointer', color: '#888', lineHeight: 1 }}>×</button>
            </div>
            {/* Identity */}
            <div style={{ padding: '20px', textAlign: 'center', background: '#f0ecf8' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: '#111827', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 8px', overflow: 'hidden' }}>
                <img src="/logo-dashboard.png" alt="Larisi" style={{ width: '38px', height: '38px', objectFit: 'contain' }} />
              </div>
              <div style={{ fontWeight: 700, fontSize: '14px', marginBottom: '16px' }}>LARISI</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', textAlign: 'left', gap: '8px' }}>
                <div>
                  <div style={{ color: '#888', fontSize: '11px' }}>Invoice number</div>
                  <div style={{ fontWeight: 600, fontSize: '12px', wordBreak: 'break-all' }}>{orderId}</div>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ color: '#888', fontSize: '11px' }}>Transaction Date</div>
                  <div style={{ fontWeight: 600, fontSize: '12px' }}>{dateStr}</div>
                </div>
              </div>
            </div>
            {/* Breakdown */}
            <div style={{ padding: '0 20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #f0f0f0' }}>
                <span style={{ color: '#555', fontSize: '14px' }}>Sub Total</span>
                <span style={{ fontWeight: 600, fontSize: '14px' }}>{formatRupiah(originalAmount)}</span>
              </div>
              {svcFee > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #f0f0f0' }}>
                  <div>
                    <div style={{ color: '#555', fontSize: '14px' }}>Biaya Layanan</div>
                    <div style={{ color: '#aaa', fontSize: '11px' }}>Biaya Virtual Account Duitku</div>
                  </div>
                  <span style={{ fontWeight: 600, fontSize: '14px' }}>{formatRupiah(svcFee)}</span>
                </div>
              )}
            </div>
            {/* Total */}
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '14px 20px', background: '#111827' }}>
              <span style={{ color: '#fff', fontWeight: 700, fontSize: '14px' }}>Total Amount</span>
              <span style={{ color: '#fff', fontWeight: 700, fontSize: '14px' }}>{formatRupiah(amount)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
