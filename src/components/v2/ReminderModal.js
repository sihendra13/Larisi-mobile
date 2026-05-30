'use client';
import { useState, useEffect } from 'react';

const STORAGE_KEY = 'larisi_profile_reminder_last';

/* Cek apakah reminder perlu ditampilkan:
   - profile punya field yang kosong (wa / usp / provinsi)
   - belum ditampilkan hari ini */
function needsReminder(profile) {
  if (!profile) return false;
  const missing = !profile.whatsapp || !profile.usp || !profile.provinsi;
  if (!missing) return false;

  const last = localStorage.getItem(STORAGE_KEY);
  if (!last) return true;

  const today = new Date().toISOString().slice(0, 10); // "2024-01-15"
  return last !== today;
}

function getMissingFields(profile) {
  const fields = [];
  if (!profile?.whatsapp) fields.push('no. WhatsApp');
  if (!profile?.usp)      fields.push('keunggulan bisnis');
  if (!profile?.provinsi) fields.push('lokasi yang lengkap');
  return fields;
}

export default function ReminderModal({ profile, onOpenProfile }) {
  const [visible, setVisible] = useState(false);
  const [show,    setShow]    = useState(false); // untuk animasi fade

  useEffect(() => {
    if (!profile) return;
    if (!needsReminder(profile)) return;

    /* Muncul setelah 7 detik */
    const timer = setTimeout(() => {
      setVisible(true);
      setTimeout(() => setShow(true), 10); // trigger CSS transition
    }, 7000);

    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile?.whatsapp, profile?.usp, profile?.provinsi]);

  const dismiss = () => {
    setShow(false);
    setTimeout(() => setVisible(false), 250);
    /* Simpan tanggal hari ini → tidak muncul lagi sampai besok */
    const today = new Date().toISOString().slice(0, 10);
    localStorage.setItem(STORAGE_KEY, today);
  };

  const handleLengkapi = () => {
    dismiss();
    onOpenProfile?.();
  };

  if (!visible) return null;

  const missingFields = getMissingFields(profile);

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={dismiss}
        style={{
          position: 'fixed', inset: 0, zIndex: 450,
          background: 'rgba(0,0,0,0.5)',
          backdropFilter: 'blur(2px)',
          opacity: show ? 1 : 0,
          transition: 'opacity 0.25s',
        }}
      />

      {/* Modal */}
      <div style={{
        position: 'fixed', left: '50%', top: '50%', zIndex: 451,
        transform: show
          ? 'translate(-50%, -50%) scale(1)'
          : 'translate(-50%, -48%) scale(0.97)',
        opacity: show ? 1 : 0,
        transition: 'transform 0.25s cubic-bezier(0.34,1.56,0.64,1), opacity 0.25s',
        width: 'min(340px, 88vw)',
        background: '#fff', borderRadius: '20px',
        padding: '24px 20px 20px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.25)',
        fontFamily: 'var(--m-font, -apple-system, sans-serif)',
      }}>

        {/* Icon */}
        <div style={{ textAlign: 'center', marginBottom: '12px' }}>
          <div style={{
            width: '52px', height: '52px', borderRadius: '14px',
            background: '#FFF7ED', border: '1px solid #FED7AA',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '26px',
          }}>
            📋
          </div>
        </div>

        {/* Judul */}
        <h2 style={{
          margin: '0 0 8px', textAlign: 'center',
          fontSize: '18px', fontWeight: '800', color: '#111827', letterSpacing: '-0.3px',
        }}>
          Profil kamu belum lengkap nih!
        </h2>

        {/* Pesan */}
        <p style={{
          margin: '0 0 14px', textAlign: 'center',
          fontSize: '13px', color: '#6b7280', lineHeight: '1.6',
        }}>
          Biar caption yang dibuatin SiLaris makin akurat dan tepat sasaran, yuk lengkapin dulu:
        </p>

        {/* Missing fields list */}
        <div style={{
          background: '#FFF7ED', border: '1px solid #FED7AA',
          borderRadius: '10px', padding: '10px 14px', marginBottom: '18px',
        }}>
          {missingFields.map((f, i) => (
            <div key={i} style={{
              fontSize: '13px', color: '#92400E', fontWeight: '600',
              paddingBottom: i < missingFields.length - 1 ? '4px' : 0,
            }}>
              • {f}
            </div>
          ))}
        </div>

        {/* CTA */}
        <button
          onClick={handleLengkapi}
          style={{
            width: '100%', padding: '13px', borderRadius: '12px',
            background: '#111827', color: '#fff',
            border: 'none', fontSize: '14px', fontWeight: '700',
            cursor: 'pointer', fontFamily: 'inherit', marginBottom: '8px',
          }}
        >
          Lengkapi Sekarang →
        </button>

        <button
          onClick={dismiss}
          style={{
            width: '100%', padding: '11px', borderRadius: '12px',
            background: 'none', color: '#9ca3af',
            border: '1.5px solid #E4E4EB', fontSize: '13px',
            cursor: 'pointer', fontFamily: 'inherit',
          }}
        >
          Nanti saja
        </button>

        {/* Sub-hint */}
        <p style={{
          margin: '10px 0 0', textAlign: 'center',
          fontSize: '11px', color: '#9ca3af', lineHeight: '1.4',
        }}>
          Kamu bisa ubah kapan saja di ikon profil kanan atas.
        </p>
      </div>
    </>
  );
}
