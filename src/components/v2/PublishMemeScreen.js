'use client';
import React, { useState, useEffect, useRef } from 'react';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '@/lib/config';

const PLATFORM_ICONS_SM = {
  instagram: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/>
      <circle cx="17.5" cy="6.5" r="0.8" fill="currentColor" stroke="none"/>
    </svg>
  ),
  facebook: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path d="M13.5 8h2V5.5h-2C11.57 5.5 10 7.07 10 9v1.5H8V13h2v7h3v-7h2l.5-2.5H13V9c0-.28.22-.5.5-.5z" fill="currentColor"/>
    </svg>
  ),
  tiktok: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path d="M16 8c.55.73 1.4 1.2 2.35 1.25v2.1a4.55 4.55 0 01-2.35-.65v5.8a4.1 4.1 0 11-4.1-4.1h.27v2.1H12a2 2 0 102 2V8z" fill="currentColor"/>
    </svg>
  ),
};

/* ── PostForMe proxy helper ── */
async function pfmProxy(endpoint, method, body, accessToken) {
  const resp = await fetch(`${SUPABASE_URL}/functions/v1/postforme-proxy`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${accessToken || SUPABASE_ANON_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ endpoint, method: method || 'GET', body }),
  });
  if (!resp.ok) { const t = await resp.text(); throw new Error('Proxy ' + resp.status + ': ' + t); }
  return resp.json();
}

/* ── Buat compressed thumbnail dari blob URL foto ── */
function createThumbFromUrl(blobUrl) {
  return new Promise(resolve => {
    const img = new Image();
    img.onload = () => {
      try {
        const maxW = 600;
        const ratio = maxW / img.naturalWidth;
        const c = document.createElement('canvas');
        c.width  = maxW;
        c.height = Math.round(img.naturalHeight * ratio);
        c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
        resolve(c.toDataURL('image/jpeg', 0.9));
      } catch { resolve(null); }
    };
    img.onerror = () => resolve(null);
    img.src = blobUrl;
  });
}

// ── Reach formula ──
const PLATFORM_PENETRATION_RATES = {
  instagram: 0.731,
  tiktok:    0.632,
  facebook:  0.830,
};

function computeReach(locPop, radius, localOn, platform) {
  const areaFactor  = Math.PI * radius * radius;
  const densityBase = locPop / (Math.PI * 5 * 5);
  const areaPop     = Math.round(densityBase * areaFactor);
  const totalPop    = areaPop;

  const internetUsers = Math.round(totalPop * 0.795);
  const penetration   = PLATFORM_PENETRATION_RATES[platform] || PLATFORM_PENETRATION_RATES.instagram;
  const hi = Math.min(Math.round(internetUsers * penetration), internetUsers);
  const lo = Math.round(hi * 0.65);
  return { lo, hi };
}

function fmtReach(n) {
  if (!n) return '0';
  if (n >= 10000) return Math.round(n / 1000) + 'K';
  return n.toLocaleString('id-ID');
}

export default function PublishMemeScreen({
  imageUrl,
  caption: initialCaption,
  onBack,
  profile,
  isGenZ,
  accessToken,
  sessionId,
  userId,
  files,
  locName,
  locFull,
  locPop,
  radius,
  setRadius,
  localOn,
  travelerOn,
  onLaunchSuccess,
  triggerUpgrade
}) {
  const [caption, setCaption] = useState(initialCaption || '');
  const [platforms, setPlatforms] = useState({ instagram: true, tiktok: false, facebook: false });

  // Launch and Schedule States
  const [posting, setPosting] = useState(false);
  const [launchPhase, setLaunchPhase] = useState(null); // null | 'loading' | 'success'
  const [showConfirm, setShowConfirm] = useState(false);
  const [campName, setCampName] = useState('');
  const [scheduledTime, setScheduledTime] = useState(null);
  const [showScheduleSheet, setShowScheduleSheet] = useState(false);
  const [schedDate, setSchedDate] = useState('');
  const [schedTime, setSchedTime] = useState('');

  const togglePlatform = (p) => {
    setPlatforms(prev => ({ ...prev, [p]: !prev[p] }));
  };

  const showToast = (message, type = 'success') => {
    const existing = document.getElementById('m-top-toast');
    if (existing) existing.remove();
    const toast = document.createElement('div');
    toast.id = 'm-top-toast';
    const bg = type === 'error' ? '#EF4444' : type === 'warning' ? '#F59E0B' : '#10B981';
    toast.style.cssText = `position:fixed;top:20px;left:50%;transform:translateX(-50%) translateY(-80px);background:${bg};color:#fff;padding:12px 20px;border-radius:12px;font-size:14px;font-weight:700;font-family:var(--m-font,sans-serif);box-shadow:0 4px 20px rgba(0,0,0,0.25);z-index:99999;white-space:nowrap;transition:transform 0.35s cubic-bezier(0.34,1.56,0.64,1),opacity 0.35s ease;opacity:0;pointer-events:none;`;
    toast.textContent = message;
    document.body.appendChild(toast);
    requestAnimationFrame(() => requestAnimationFrame(() => {
      toast.style.transform = 'translateX(-50%) translateY(0)';
      toast.style.opacity = '1';
    }));
    setTimeout(() => {
      toast.style.transform = 'translateX(-50%) translateY(-80px)';
      toast.style.opacity = '0';
      setTimeout(() => toast.remove(), 400);
    }, 3500);
  };

  // Quota Calculations
  const plan = profile?.selected_plan || 'freemium';
  const paymentStatus = profile?.payment_status || 'trial';
  const quotaDefaults = { freemium: 10, starter: 50, pro: 999999 };
  const quota = typeof profile?.ai_launch_count === 'number' ? profile.ai_launch_count : (quotaDefaults[plan] || 10);
  const isOutOfQuota = plan !== 'pro' && quota <= 0;
  const quotaMax = plan === 'starter' ? 50 : 10;

  const handleTayangkan = () => {
    if (!caption || posting) return;

    if (isOutOfQuota) {
      if (triggerUpgrade) triggerUpgrade('Kuota Habis', 'Kuota iklan gratis Anda telah habis. Upgrade ke paket premium untuk tayang lebih banyak.');
      return;
    }

    const locShort = locName ? locName.split(',')[0].trim() : '';
    setCampName('Meme Campaign' + (locShort ? ' · ' + locShort : ''));
    setShowConfirm(true);
  };

  const handleJadwalkanClick = () => {
    if (!caption || posting) return;

    if (isOutOfQuota) {
      if (triggerUpgrade) triggerUpgrade('Kuota Habis', 'Kuota iklan gratis Anda telah habis. Upgrade ke paket premium untuk tayang lebih banyak.');
      return;
    }

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setMinutes(0, 0, 0);
    const pad = (n) => n < 10 ? '0' + n : n;
    const defaultDate = tomorrow.getFullYear() + '-' + pad(tomorrow.getMonth() + 1) + '-' + pad(tomorrow.getDate());
    const defaultTime = pad(tomorrow.getHours()) + ':' + pad(tomorrow.getMinutes());
    setSchedDate(defaultDate);
    setSchedTime(defaultTime);

    const locShort = locName ? locName.split(',')[0].trim() : '';
    setCampName('Meme Campaign' + (locShort ? ' · ' + locShort : ''));
    setShowScheduleSheet(true);
  };

  const handleConfirmSchedule = () => {
    if (!schedDate || !schedTime) {
      showToast('⏳ Pilih tanggal dan waktu terlebih dahulu', 'warning');
      return;
    }

    const dateParts = String(schedDate).split('-');
    const timeParts = String(schedTime).split(/:|\./);

    if (dateParts.length < 3 || timeParts.length < 2) {
      showToast('⏳ Format tanggal atau waktu tidak valid', 'warning');
      return;
    }

    const year = parseInt(dateParts[0], 10);
    const month = parseInt(dateParts[1], 10) - 1;
    const day = parseInt(dateParts[2], 10);
    const hours = parseInt(timeParts[0], 10);
    const minutes = parseInt(timeParts[1], 10);

    const schedDateTime = new Date(year, month, day, hours, minutes);
    if (isNaN(schedDateTime.getTime())) {
      showToast('⏳ Format tanggal atau waktu tidak valid', 'warning');
      return;
    }
    if (schedDateTime <= new Date()) {
      showToast('⏳ Waktu jadwal harus di masa depan', 'warning');
      return;
    }

    setShowScheduleSheet(false);
    const isoString = schedDateTime.toISOString();
    setScheduledTime(isoString);
    handleDoLaunch(campName, isoString);
  };

  const handleDoLaunch = async (overrideName, scheduledAt = null) => {
    setShowConfirm(false);
    if (!scheduledAt) setScheduledTime(null);

    const accounts = (() => {
      try { return JSON.parse(localStorage.getItem('radar_social_accounts') || '[]'); } catch { return []; }
    })();

    const activePlatforms = Object.keys(platforms).filter(p => platforms[p]);
    if (activePlatforms.length === 0) {
      showToast('⚠ Pilih minimal satu platform.', 'error');
      return;
    }

    // Check connection of chosen platforms
    const unconnected = activePlatforms.filter(p => !accounts.some(a => a.platform === p));
    if (unconnected.length > 0) {
      showToast(`⚠ Akun ${unconnected.join(', ')} belum terhubung.`, 'error');
      return;
    }

    setPosting(true);
    setLaunchPhase('loading');

    try {
      // Create thumbnail blob from meme visual editor output
      const blobResp = await fetch(imageUrl);
      if (!blobResp.ok) throw new Error('Gagal membaca image meme.');
      const blob = await blobResp.blob();

      // Convert meme image to JPEG for consistent PostForMe upload
      let uploadBlob = blob;
      const jpegDataUrl = await createThumbFromUrl(imageUrl);
      if (jpegDataUrl) {
        const arr = jpegDataUrl.split(',');
        const bstr = atob(arr[1]);
        const u8 = new Uint8Array(bstr.length);
        for (let i = 0; i < bstr.length; i++) u8[i] = bstr.charCodeAt(i);
        uploadBlob = new Blob([u8], { type: 'image/jpeg' });
      }

      // Upload image meme to PostForMe proxy
      const uploadMeta = await pfmProxy('/v1/media/create-upload-url', 'POST', { content_type: 'image/jpeg' }, accessToken);
      if (!uploadMeta?.upload_url) throw new Error('Gagal mendapatkan URL upload.');
      
      const upResp = await fetch(uploadMeta.upload_url, { method: 'PUT', body: uploadBlob, headers: { 'Content-Type': 'image/jpeg' } });
      if (!upResp.ok) throw new Error('Upload media gagal: ' + upResp.status);

      const mediaUrl = uploadMeta.media_url || uploadMeta.url || uploadMeta.file_url || uploadMeta.public_url || null;

      // Loop over chosen platforms and post
      for (const sp of activePlatforms) {
        const acc = accounts.find(a => a.platform === sp);
        if (!acc) continue;

        const payload = {
          caption,
          social_accounts: [acc.id],
          platform_configurations: { [sp]: { placement: 'timeline' } },
        };
        if (mediaUrl) payload.media = [{ url: mediaUrl }];
        if (scheduledAt) payload.scheduled_at = scheduledAt;

        const data = await pfmProxy('/v1/social-posts', 'POST', payload, accessToken);
        const postId  = data?.id || data?.post_id || data?.posts?.[0]?.id || null;
        const postUrl = data?.post_url || data?.platform_url || data?.permalink || data?.posts?.[0]?.post_url || null;

        // Save campaign to Supabase
        const effectiveSessionId = sessionId || localStorage.getItem('radar_session_id');
        const effectiveUserId    = userId    || (() => {
          try { return JSON.parse(atob((accessToken||'').split('.')[1]))?.sub || null; } catch { return null; }
        })();

        if (effectiveSessionId && accessToken) {
          const reachVal = computeReach(locPop, radius, localOn, sp);
          const finalName = (overrideName && overrideName.trim()) ? overrideName.trim() : campName;
          
          await fetch(`${SUPABASE_URL}/rest/v1/campaigns`, {
            method: 'POST',
            headers: {
              'apikey': SUPABASE_ANON_KEY,
              'Authorization': `Bearer ${accessToken || SUPABASE_ANON_KEY}`,
              'Content-Type': 'application/json',
              'Prefer': 'return=minimal'
            },
            body: JSON.stringify({
              user_id:             effectiveUserId,
              session_id:          effectiveSessionId,
              nama_campaign:       finalName || caption.slice(0, 60),
              platforms:           [sp],
              format:              'post',
              status:              scheduledAt ? 'scheduled' : 'active',
              scheduled_at:        scheduledAt || null,
              estimated_reach_min: reachVal?.lo || 0,
              estimated_reach_max: reachVal?.hi || 0,
              post_id:             postId          || null,
              post_url:            postUrl         || null,
              thumb_url:           mediaUrl || null,
              has_video:           false,
              caption,
            }),
          });
        }
      }

      // Success messages
      if (scheduledAt) {
        showToast(`✓ Meme berhasil dijadwalkan!`, 'success');
      } else {
        showToast(`✓ Meme berhasil ditayangkan!`, 'success');
      }

      // Reduce quota if not pro
      if (plan !== 'pro' && profile?.id) {
        const newQuota = Math.max(0, quota - 1);
        profile.ai_launch_count = newQuota;

        fetch(`${SUPABASE_URL}/rest/v1/profiles?id=eq.${profile.id}`, {
          method: 'PATCH',
          headers: { 'apikey': SUPABASE_ANON_KEY, 'Authorization': `Bearer ${accessToken}` },
          body: JSON.stringify({ ai_launch_count: newQuota })
        }).catch(() => {});
      }

      // Success modal trigger
      setTimeout(() => {
        setLaunchPhase('success');
        setTimeout(() => {
          setLaunchPhase(null);
          setPosting(false);
          if (onLaunchSuccess) onLaunchSuccess();
        }, 2000);
      }, 1600);

    } catch (e) {
      setLaunchPhase(null);
      setPosting(false);
      showToast(`⚠ Posting gagal: ${e.message}`, 'error');
    }
  };

  // Compute total estimations
  const totalReach = computeReach(locPop, radius, localOn, 'instagram');
  const reachText = totalReach ? `${fmtReach(totalReach.lo)} – ${fmtReach(totalReach.hi)}` : '0';

  return (
    <div style={{
      display: 'flex', flexDirection: 'column',
      height: '100dvh', background: '#0e0e12',
      color: '#fff', overflow: 'hidden',
      paddingBottom: 'env(safe-area-inset-bottom)'
    }}>
      {/* Header bar */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '12px 16px', borderBottom: '1px solid #1e1e24', flexShrink: 0
      }}>
        <button onClick={onBack} style={{
          width: '36px', height: '36px', borderRadius: '50%',
          background: '#1e1e24', border: '1px solid #2d2d39',
          color: '#fff', cursor: 'pointer', display: 'flex',
          alignItems: 'center', justifyContent: 'center'
        }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <span style={{ fontFamily: 'var(--m-font, sans-serif)', fontSize: '16px', fontWeight: '800' }}>
          Publish Meme
        </span>
        <div style={{ width: '36px' }} />
      </div>

      {/* Scrollable body */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* Preview Frame */}
        <div style={{
          width: '100%', aspectRatio: '1/1', position: 'relative',
          borderRadius: '16px', overflow: 'hidden', background: '#111115',
          border: '1px solid #1e1e24', boxShadow: '0 8px 24px rgba(0,0,0,0.3)'
        }}>
          <img src={imageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          <div style={{
            position: 'absolute', bottom: '12px', left: '12px',
            background: 'rgba(0,0,0,0.6)', padding: '4px 8px', borderRadius: '6px',
            fontSize: '10px', color: '#9ca3af', fontFamily: 'monospace'
          }}>
            Meme Draft #03
          </div>
        </div>

        {/* Caption Card */}
        <div style={{
          background: '#1e1e24', border: '1px solid #2d2d39', borderRadius: '16px', padding: '16px',
          display: 'flex', flexDirection: 'column', gap: '12px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontFamily: 'var(--m-font)', fontSize: '14px', fontWeight: '800' }}>Caption Iklan</span>
            <span style={{ fontSize: '11px', color: '#a5b4fc', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
              ✦ AI Magic
            </span>
          </div>
          <textarea
            value={caption}
            onChange={e => setCaption(e.target.value)}
            style={{
              width: '100%', height: '90px', padding: '12px', borderRadius: '12px',
              background: '#141418', border: '1px solid #2d2d39', color: '#fff',
              fontFamily: 'var(--m-font)', fontSize: '13px', lineHeight: '1.5',
              outline: 'none', resize: 'none'
            }}
            placeholder="Tulis caption Anda..."
          />
        </div>

        {/* Jangkauan Target */}
        <div style={{
          background: '#1e1e24', border: '1px solid #2d2d39', borderRadius: '16px', padding: '16px',
          display: 'flex', flexDirection: 'column', gap: '12px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontFamily: 'var(--m-font)', fontSize: '14px', fontWeight: '800' }}>Jangkauan Target</span>
            <span style={{ fontFamily: 'var(--m-font)', fontSize: '18px', fontWeight: '800', color: '#a78bfa' }}>{radius} km</span>
          </div>
          <input
            type="range"
            min="1"
            max="100"
            value={radius}
            onChange={e => setRadius(parseInt(e.target.value))}
            style={{ width: '100%', accentColor: '#7c3aed', cursor: 'pointer' }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#6b7280', fontWeight: '700', fontFamily: 'var(--m-font)' }}>
            <span>LOKAL (1KM)</span>
            <span>LUAS (100KM)</span>
          </div>
          <div style={{ fontSize: '11px', color: '#9ca3af', marginTop: '4px', textAlign: 'center' }}>
            Estimasi Jangkauan: <span style={{ color: '#a78bfa', fontWeight: '700' }}>{reachText}</span> orang
          </div>
        </div>

        {/* Pilih Platform */}
        <div style={{
          background: '#1e1e24', border: '1px solid #2d2d39', borderRadius: '16px', padding: '16px',
          display: 'flex', flexDirection: 'column', gap: '12px'
        }}>
          <span style={{ fontFamily: 'var(--m-font)', fontSize: '14px', fontWeight: '800' }}>Pilih Platform</span>
          <div style={{ display: 'flex', gap: '16px' }}>
            {[
              { id: 'instagram', label: 'Instagram', brandColor: '#E1306C' },
              { id: 'tiktok', label: 'TikTok', brandColor: '#fff' },
              { id: 'facebook', label: 'Facebook', brandColor: '#1877F2' }
            ].map(p => {
              const active = platforms[p.id];
              return (
                <button
                  key={p.id}
                  onClick={() => togglePlatform(p.id)}
                  style={{
                    width: '44px', height: '44px', borderRadius: '50%',
                    background: '#141418',
                    border: active ? `2px solid ${p.brandColor}` : '1.5px solid #2d2d39',
                    color: active ? p.brandColor : '#4b5563',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer', transition: 'all 0.15s ease'
                  }}
                  title={p.label}
                >
                  {PLATFORM_ICONS_SM[p.id]}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Side-by-side Actions Bar */}
      <div style={{
        padding: '16px',
        paddingBottom: 'calc(16px + 78px + env(safe-area-inset-bottom))',
        borderTop: '1px solid #1e1e24',
        background: '#0e0e12',
        display: 'flex', flexDirection: 'column', gap: '8px', flexShrink: 0
      }}>
        {plan !== 'pro' && (
          <div style={{ fontFamily: 'var(--m-font)', fontSize: '10px', fontWeight: '800', color: isOutOfQuota ? '#EF4444' : '#9ca3af', textAlign: 'right', marginRight: '4px' }}>
            SISA KUOTA: {quota}/{quotaMax}
          </div>
        )}
        <div style={{ display: 'flex', gap: '12px' }}>
          {/* Jadwalkan */}
          <button
            onClick={handleJadwalkanClick}
            disabled={posting || !caption}
            style={{
              flex: 1, padding: '14px', borderRadius: '14px',
              background: '#1e1e24', border: '1.5px solid #2d2d39',
              color: '#fff', fontFamily: 'var(--m-font)', fontSize: '14px', fontWeight: '700',
              cursor: (posting || !caption) ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}
          >
            Jadwalkan
          </button>

          {/* Tayangkan 🚀 */}
          <button
            onClick={handleTayangkan}
            disabled={posting || !caption}
            style={{
              flex: 1.6, padding: '14px', borderRadius: '14px', border: 'none',
              background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)',
              color: '#fff', fontFamily: 'var(--m-font)', fontSize: '14px', fontWeight: '700',
              cursor: (posting || !caption) ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
              boxShadow: '0 4px 16px rgba(124, 58, 237, 0.35)'
            }}
          >
            {posting && <div style={{width:'14px', height:'14px', border:'2px solid rgba(255,255,255,0.4)', borderTopColor:'#fff', borderRadius:'50%', animation:'spin 0.7s linear infinite'}} />}
            Tayangkan 🚀
          </button>
        </div>
      </div>

      {/* Confirm Modal */}
      {showConfirm && (
        <div style={{position:'fixed', inset:0, zIndex:2000, background:'rgba(0,0,0,0.7)', display:'flex', alignItems:'flex-end', justifyContent:'center'}}>
          <div style={{background:'#1e1e24', borderRadius:'24px 24px 0 0', padding:'24px 20px', width:'100%', maxWidth:'480px', borderTop:'1px solid #2d2d39', paddingBottom:'calc(24px + env(safe-area-inset-bottom))'}}>
            <div style={{width:'40px', height:'4px', borderRadius:'2px', background:'#2d2d39', margin:'0 auto 20px'}} />
            <div style={{fontFamily:'var(--m-font)', fontSize:'17px', fontWeight:'800', color:'#fff', marginBottom:'4px'}}>Tayangkan Iklan Meme</div>
            <div style={{fontFamily:'var(--m-font)', fontSize:'13px', color:'#9ca3af', marginBottom:'20px'}}>Pastikan detail iklanmu sudah benar</div>

            {/* Nama iklan editable */}
            <div style={{marginBottom:'24px'}}>
              <label style={{fontFamily:'var(--m-font)', fontSize:'12px', fontWeight:'700', color:'#9ca3af', display:'block', marginBottom:'8px', textTransform:'uppercase', letterSpacing:'0.5px'}}>Nama Iklan</label>
              <input
                type="text"
                value={campName}
                onChange={e => setCampName(e.target.value)}
                style={{width:'100%', padding:'12px 14px', borderRadius:'12px', border:'1px solid #2d2d39', fontFamily:'var(--m-font)', fontSize:'16px', fontWeight:'600', color:'#fff', outline:'none', background:'#141418', boxSizing:'border-box'}}
              />
            </div>

            <button
              onClick={() => handleDoLaunch(campName)}
              style={{width:'100%', padding:'15px', borderRadius:'14px', background:'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)', color:'#fff', border:'none', cursor:'pointer', fontFamily:'var(--m-font)', fontSize:'15px', fontWeight:'800', display:'flex', alignItems:'center', justifyContent:'center', gap:'8px', marginBottom:'10px'}}
            >
              Launch Sekarang
            </button>
            <button
              onClick={() => setShowConfirm(false)}
              style={{width:'100%', padding:'13px', borderRadius:'14px', background:'transparent', color:'#9ca3af', border:'none', cursor:'pointer', fontFamily:'var(--m-font)', fontSize:'14px', fontWeight:'600'}}
            >
              Batal
            </button>
          </div>
        </div>
      )}

      {/* Schedule Sheet Modal */}
      {showScheduleSheet && (
        <div style={{position:'fixed', inset:0, zIndex:2000, background:'rgba(0,0,0,0.7)', display:'flex', alignItems:'flex-end', justifyContent:'center'}}>
          <div style={{position:'relative', background:'#1e1e24', borderRadius:'24px 24px 0 0', padding:'24px 20px', width:'100%', maxWidth:'480px', borderTop:'1px solid #2d2d39', paddingBottom:'calc(24px + env(safe-area-inset-bottom))'}}>
            <button
              onClick={() => setShowScheduleSheet(false)}
              style={{
                position:'absolute', top:'18px', right:'16px',
                width:'30px', height:'30px', borderRadius:'50%',
                background:'#2d2d39', border:'none', cursor:'pointer',
                display:'flex', alignItems:'center', justifyContent:'center',
                zIndex: 10, color: '#fff'
              }}
            >
              ✕
            </button>

            <div style={{width:'40px', height:'4px', borderRadius:'2px', background:'#2d2d39', margin:'0 auto 20px' }} />
            <div style={{fontFamily:'var(--m-font)', fontSize:'17px', fontWeight:'800', color:'#fff', marginBottom:'4px'}}>Jadwalkan Tayang</div>
            <div style={{fontFamily:'var(--m-font)', fontSize:'13px', color:'#9ca3af', marginBottom:'20px'}}>Pilih waktu postingan ini akan ditayangkan</div>

            {/* Input Tanggal */}
            <div style={{marginBottom:'16px'}}>
              <label style={{fontFamily:'var(--m-font)', fontSize:'12px', fontWeight:'700', color:'#9ca3af', display:'block', marginBottom:'8px', textTransform:'uppercase', letterSpacing:'0.5px'}}>Tanggal</label>
              <input
                type="date"
                value={schedDate}
                onChange={e => setSchedDate(e.target.value)}
                style={{
                  width:'100%', padding:'12px 14px', borderRadius:'12px',
                  border:'1px solid #2d2d39', fontFamily:'var(--m-font)',
                  fontSize:'16px', fontWeight:'600', color:'#fff',
                  outline:'none', background:'#141418', boxSizing:'border-box'
                }}
              />
            </div>

            {/* Input Waktu */}
            <div style={{marginBottom:'20px'}}>
              <label style={{fontFamily:'var(--m-font)', fontSize:'12px', fontWeight:'700', color:'#9ca3af', display:'block', marginBottom:'8px', textTransform:'uppercase', letterSpacing:'0.5px'}}>Waktu</label>
              <input
                type="time"
                value={schedTime}
                onChange={e => setSchedTime(e.target.value)}
                style={{
                  width:'100%', padding:'12px 14px', borderRadius:'12px',
                  border:'1px solid #2d2d39', fontFamily:'var(--m-font)',
                  fontSize:'16px', fontWeight:'600', color:'#fff',
                  outline:'none', background:'#141418', boxSizing:'border-box'
                }}
              />
            </div>

            {/* Nama Iklan */}
            <div style={{marginBottom:'24px'}}>
              <label style={{fontFamily:'var(--m-font)', fontSize:'12px', fontWeight:'700', color:'#9ca3af', display:'block', marginBottom:'8px', textTransform:'uppercase', letterSpacing:'0.5px'}}>Nama Iklan</label>
              <input
                type="text"
                value={campName}
                onChange={e => setCampName(e.target.value)}
                style={{width:'100%', padding:'12px 14px', borderRadius:'12px', border:'1px solid #2d2d39', fontFamily:'var(--m-font)', fontSize:'16px', fontWeight:'600', color:'#fff', outline:'none', background:'#141418', boxSizing:'border-box'}}
              />
            </div>

            <button
              onClick={handleConfirmSchedule}
              style={{width:'100%', padding:'15px', borderRadius:'14px', background:'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)', color:'#fff', border:'none', cursor:'pointer', fontFamily:'var(--m-font)', fontSize:'15px', fontWeight:'800', display:'flex', alignItems:'center', justifyContent:'center', gap:'8px'}}
            >
              Konfirmasi Jadwal
            </button>
          </div>
        </div>
      )}

      {/* Launching Loading/Success Overlay */}
      {launchPhase && (
        <div style={{position:'fixed', inset:0, zIndex:2000, background:'rgba(0,0,0,0.8)', display:'flex', alignItems:'center', justifyContent:'center', padding:'24px'}}>
          <div style={{background:'#1e1e24', borderRadius:'24px', padding:'40px 28px', textAlign:'center', maxWidth:'300px', width:'100%', border:'1px solid #2d2d39', boxShadow:'0 20px 60px rgba(0,0,0,0.5)'}}>
            {launchPhase === 'loading' && (
              <>
                <div style={{position:'relative', width:'64px', height:'64px', margin:'0 auto 20px'}}>
                  <svg width="64" height="64" style={{position:'absolute', inset:0, animation:'spin 1s linear infinite'}}>
                    <circle cx="32" cy="32" r="28" fill="none" stroke="#2d2d39" strokeWidth="4"/>
                    <circle cx="32" cy="32" r="28" fill="none" stroke="#7c3aed" strokeWidth="4" strokeDasharray="44 132" strokeLinecap="round"/>
                  </svg>
                  <div style={{position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center'}}>
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="#7c3aed"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                  </div>
                </div>
                <div style={{fontFamily:'var(--m-font)', fontSize:'17px', fontWeight:'800', color:'#fff', marginBottom:'6px'}}>
                  {scheduledTime ? 'Menjadwalkan Iklan…' : 'Meluncurkan Iklan…'}
                </div>
                <div style={{fontFamily:'var(--m-font)', fontSize:'13px', color:'#9ca3af', lineHeight:'1.5'}}>
                  {scheduledTime ? 'Sedang memproses jadwal iklanmu' : 'Sedang mengupload dan memposting kontenmu'}
                </div>
              </>
            )}

            {launchPhase === 'success' && (
              <>
                <div style={{width:'72px', height:'72px', margin:'0 auto 20px'}}>
                  <svg viewBox="0 0 52 52" width="72" height="72">
                    <circle cx="26" cy="26" r="23" fill="none" stroke="#10B981" strokeWidth="3" />
                    <polyline points="14,26 22,34 38,18" fill="none" stroke="#10B981" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <div style={{fontFamily:'var(--m-font)', fontSize:'17px', fontWeight:'800', color:'#fff', marginBottom:'6px'}}>
                  {scheduledTime ? 'Iklan berhasil dijadwalkan!' : 'Iklan berhasil diluncurkan!'}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
