// RADAR — launch.js
// Audience toggles and RADAR launch

function toggleLocalFn() {
  audLocal = !audLocal;
  var t = document.getElementById('toggleLocal');
  if (audLocal) t.classList.add('on'); else t.classList.remove('on');
  updateReach();
}

function toggleTravelerFn() {
  audTraveler = !audTraveler;
  var t = document.getElementById('toggleTraveler');
  if (audTraveler) t.classList.add('on'); else t.classList.remove('on');
  updateReach();
}

var geoStitchVisible = true;
function toggleStitchFn() {
  geoStitchVisible = !geoStitchVisible;
  var t = document.getElementById('toggleStitch');
  var stitch = document.getElementById('phoneStitch');
  if (geoStitchVisible) {
    t.classList.add('on');
    if (stitch) stitch.style.display = 'block';
  } else {
    t.classList.remove('on');
    if (stitch) stitch.style.display = 'none';
  }
}

function showLaunchModal() {
  var hasAsset    = !!uploadedDataURL;
  var hasAudience = audLocal || audTraveler;
  var hasChannel  = typeof activeChannel !== 'undefined' && !!activeChannel;

  var chLabels = { instagram:'Instagram', meta:'Facebook', tiktok:'TikTok', youtube:'YouTube' };
  var fmtLabels = { post:'Post', reel:'Reel', story:'Story' };
  var chText = hasChannel
    ? 'Channel: ' + (chLabels[activeChannel] || activeChannel) + (activeFormat ? ' · ' + (fmtLabels[activeFormat] || activeFormat) : '')
    : 'Pilih channel publish';

  var checks = [
    { ok: hasAsset,    text: 'Upload foto atau video kreasi kamu' },
    { ok: hasAudience, text: 'Pilih target audiens (Warga Sekitar dan/atau Pengunjung)' },
    { ok: hasChannel,  text: chText }
  ];

  var okSVG   = '<svg viewBox="0 0 12 12"><polyline points="2,6 5,9 10,3" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  var failSVG = '<svg viewBox="0 0 10 10"><line x1="2" y1="2" x2="8" y2="8" stroke-linecap="round"/><line x1="8" y1="2" x2="2" y2="8" stroke-linecap="round"/></svg>';

  var html = '';
  checks.forEach(function(c) {
    html +=
      '<div class="lm-check-item">'
      + '<div class="lm-check-icon ' + (c.ok ? 'ok' : 'fail') + '">' + (c.ok ? okSVG : failSVG) + '</div>'
      + '<div class="lm-check-text' + (c.ok ? '' : ' fail') + '">' + c.text + '</div>'
      + '</div>';
  });

  document.getElementById('lmChecklist').innerHTML = html;
  document.getElementById('launchModal').style.display = 'flex';
}

function closeLaunchModal(e) {
  if (e && e.target !== document.getElementById('launchModal')) return;
  document.getElementById('launchModal').style.display = 'none';
}

/* ─────────────────────────────────────────
   P2 — Toast Notifikasi Posisi ATAS
   Copy spesifik per platform+format
   ───────────────────────────────────────── */
function showTopToast(message, type) {
  // Hapus toast lama kalau masih ada
  var existing = document.getElementById('radarTopToast');
  if (existing) existing.remove();

  var toast = document.createElement('div');
  toast.id = 'radarTopToast';

  var bgColor  = type === 'error'   ? '#ef4444'
               : type === 'warning' ? '#f59e0b'
               : '#10b981'; // success default

  toast.style.cssText =
    'position:fixed;top:20px;left:50%;transform:translateX(-50%) translateY(-80px);' +
    'background:' + bgColor + ';color:#fff;' +
    'padding:12px 20px;border-radius:12px;' +
    'font-size:14px;font-weight:600;font-family:var(--font,sans-serif);' +
    'box-shadow:0 4px 20px rgba(0,0,0,0.25);' +
    'z-index:99999;white-space:nowrap;' +
    'transition:transform 0.35s cubic-bezier(0.34,1.56,0.64,1),opacity 0.35s ease;' +
    'opacity:0;pointer-events:none;';

  toast.textContent = message;
  document.body.appendChild(toast);

  // Slide in
  requestAnimationFrame(function() {
    requestAnimationFrame(function() {
      toast.style.transform = 'translateX(-50%) translateY(0)';
      toast.style.opacity   = '1';
    });
  });

  // Slide out setelah 3.5 detik
  setTimeout(function() {
    toast.style.transform = 'translateX(-50%) translateY(-80px)';
    toast.style.opacity   = '0';
    setTimeout(function() { toast.remove(); }, 400);
  }, 3500);
}

/**
 * Bangun copy toast yang spesifik berdasarkan channel + format
 * Contoh: "✓ Story Instagram berhasil dipublish!"
 */
function _buildPublishToastCopy(channel, format) {
  var chLabels  = { instagram: 'Instagram', meta: 'Facebook', tiktok: 'TikTok', youtube: 'YouTube' };
  var fmtLabels = { post: 'Post', reel: 'Reel', story: 'Story' };

  var chName  = chLabels[channel]   || channel   || 'Konten';
  var fmtName = fmtLabels[format]   || '';

  // YouTube special case (formatnya "Shorts")
  if (channel === 'youtube') fmtName = 'Shorts';

  var label = fmtName ? fmtName + ' ' + chName : chName;
  return '✓ ' + label + ' berhasil dipublish!';
}

/* ─────────────────────────────────────────
   P1 — Modal Konfirmasi Launch + Nama Campaign
   ───────────────────────────────────────── */

/**
 * _buildConfirmModal()
 * Inject HTML modal konfirmasi ke DOM (sekali saja).
 */
function _ensureConfirmModal() {
  if (document.getElementById('launchConfirmModal')) return;

  var chLabels  = { instagram: 'Instagram', meta: 'Facebook', tiktok: 'TikTok', youtube: 'YouTube' };
  var fmtLabels = { post: 'Post', reel: 'Reel', story: 'Story' };

  // Platform icon map (emoji fallback, bisa ganti img)
  var chIcons = {
    instagram: '📸',
    meta:      '📘',
    tiktok:    '🎵',
    youtube:   '▶️'
  };

  var modal = document.createElement('div');
  modal.id = 'launchConfirmModal';
  modal.style.cssText =
    'display:none;position:fixed;inset:0;background:rgba(0,0,0,0.55);' +
    'z-index:9900;align-items:center;justify-content:center;' +
    'font-family:var(--font,sans-serif);backdrop-filter:blur(4px);';

  modal.innerHTML = `
    <div id="lcmCard" style="
      background:#fff;border-radius:20px;padding:28px 28px 24px;
      width:360px;max-width:calc(100vw - 40px);
      box-shadow:0 20px 60px rgba(0,0,0,0.2);
      display:flex;flex-direction:column;gap:20px;
    ">
      <!-- Header -->
      <div style="display:flex;align-items:center;gap:12px;">
        <div style="
          width:40px;height:40px;border-radius:12px;
          background:#7C3AED;
          display:flex;align-items:center;justify-content:center;
          font-size:20px;flex-shrink:0;">🚀</div>
        <div>
          <div style="font-size:16px;font-weight:700;color:#111;">Konfirmasi</div>
          <div style="font-size:12px;color:#6b7280;margin-top:1px;">Cek dulu sebelum tayang</div>
        </div>
        <button id="lcmClose" onclick="closeLaunchConfirmModal()"
          style="margin-left:auto;background:none;border:none;cursor:pointer;
          color:#9ca3af;font-size:20px;line-height:1;padding:4px;">✕</button>
      </div>

      <!-- Input nama campaign -->
      <div style="display:flex;flex-direction:column;gap:6px;">
        <label style="font-size:12px;font-weight:600;color:#374151;letter-spacing:0.02em;">
          Nama Iklan
        </label>
        <input id="lcmCampName" type="text"
          style="border:1.5px solid #e5e7eb;border-radius:10px;
          padding:10px 14px;font-size:14px;font-weight:500;color:#111;
          font-family:var(--font,sans-serif);outline:none;
          transition:border-color 0.2s;"
          onfocus="this.style.borderColor='#791ADB'"
          onblur="this.style.borderColor='#e5e7eb'"
          placeholder="Nama iklan..." />
        <div style="font-size:11px;color:#9ca3af;">Terisi otomatis dari kategori usaha & lokasimu</div>
      </div>

      <!-- Ringkasan publish -->
      <div style="background:#f9fafb;border-radius:12px;padding:14px 16px;
        display:flex;flex-direction:column;gap:10px;">
        <div style="font-size:11px;font-weight:700;color:#6b7280;letter-spacing:0.05em;">
          Akan Diposting Ke
        </div>
        <div id="lcmPlatformSummary" style="display:flex;align-items:center;gap:10px;">
          <!-- Diisi JS -->
        </div>
        <div id="lcmFormatSummary" style="font-size:12px;color:#6b7280;">
          <!-- Format info -->
        </div>
      </div>

      <!-- Tombol -->
      <div style="display:flex;gap:10px;">
        <button onclick="closeLaunchConfirmModal()"
          style="flex:1;padding:12px;border-radius:12px;border:1.5px solid #e5e7eb;
          background:#fff;color:#374151;font-size:14px;font-weight:600;
          cursor:pointer;font-family:var(--font,sans-serif);
          transition:background 0.15s;"
          onmouseover="this.style.background='#f3f4f6'"
          onmouseout="this.style.background='#fff'">
          Batal
        </button>
        <button id="lcmLaunchBtn" onclick="_confirmAndLaunch()"
          style="flex:2;padding:12px;border-radius:12px;border:none;
          background:#111827;
          color:#fff;font-size:14px;font-weight:700;
          cursor:pointer;font-family:var(--font,sans-serif);
          display:flex;align-items:center;justify-content:center;gap:8px;
          transition:background 0.2s;"
          onmouseover="this.style.background='#7C3AED'"
          onmouseout="this.style.background='#111827'">
          Tayangkan Sekarang
        </button>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  // Tutup saat klik backdrop
  modal.addEventListener('click', function(e) {
    if (e.target === modal) closeLaunchConfirmModal();
  });
}

function openLaunchConfirmModal(campName, channel, format) {
  _ensureConfirmModal();

  var chLabels  = { instagram: 'Instagram', meta: 'Facebook', tiktok: 'TikTok', youtube: 'YouTube' };
  var fmtLabels = { post: 'Post', reel: 'Reel', story: 'Story' };
  var chColors  = { instagram: '#e1306c', meta: '#1877f2', tiktok: '#010101', youtube: '#ff0000' };
  var chIcons   = { instagram: '📸', meta: '📘', tiktok: '🎵', youtube: '▶️' };

  // Pre-fill nama campaign
  var input = document.getElementById('lcmCampName');
  if (input) input.value = campName;

  // Platform summary
  var chName  = chLabels[channel]  || channel  || 'Platform';
  var fmtName = fmtLabels[format]  || format   || '';
  if (channel === 'youtube') fmtName = 'Shorts';

  var summaryEl = document.getElementById('lcmPlatformSummary');
  if (summaryEl) {
    var color = chColors[channel] || '#791ADB';
    var icon  = chIcons[channel]  || '📡';
    summaryEl.innerHTML =
      '<div style="' +
        'background:' + color + '15;border:1.5px solid ' + color + '40;' +
        'border-radius:10px;padding:8px 14px;' +
        'display:flex;align-items:center;gap:8px;' +
      '">' +
        '<span style="font-size:18px;">' + icon + '</span>' +
        '<span style="font-size:13px;font-weight:700;color:' + color + ';">' + chName + '</span>' +
      '</div>';
  }

  var fmtEl = document.getElementById('lcmFormatSummary');
  if (fmtEl) {
    fmtEl.innerHTML = fmtName
      ? '<span style="' +
          'display:inline-flex;align-items:center;gap:4px;' +
          'background:#791ADB15;color:#791ADB;' +
          'border-radius:6px;padding:3px 10px;font-size:12px;font-weight:600;' +
        '">📐 Format: ' + fmtName + '</span>'
      : '';
  }

  var modal = document.getElementById('launchConfirmModal');
  modal.style.display = 'flex';
  // Focus input nama
  setTimeout(function() { if (input) { input.focus(); input.select(); } }, 80);
}

function closeLaunchConfirmModal() {
  var modal = document.getElementById('launchConfirmModal');
  if (modal) modal.style.display = 'none';
}

/**
 * Dipanggil tombol "Launch Sekarang →" di modal konfirmasi
 * Ambil nama campaign dari input, lalu lanjut ke proceedToLaunch
 */
function _confirmAndLaunch() {
  var input = document.getElementById('lcmCampName');
  var overrideName = input ? input.value.trim() : '';
  closeLaunchConfirmModal();
  // Panggil launch dengan nama override dari user
  _doLaunch(overrideName);
}

/* ─────────────────────────────────────────
   Rate Limiting
   ───────────────────────────────────────── */
function checkLaunchRateLimit() {
  var cooldown = (typeof RADAR_CONFIG !== 'undefined')
    ? RADAR_CONFIG.LAUNCH_COOLDOWN_MS
    : 30000;

  var last = localStorage.getItem('radar_last_launch');
  if (!last) return true;

  var elapsed = Date.now() - parseInt(last);
  if (elapsed < cooldown) {
    var sisa = Math.ceil((cooldown - elapsed) / 1000);
    showTopToast('⏳ Tunggu ' + sisa + ' detik sebelum launch lagi', 'warning');
    return false;
  }
  return true;
}

/* ─────────────────────────────────────────
   launchRadar()
   Sekarang hanya validasi + buka modal konfirmasi
   Actual launch → _doLaunch(campNameOverride)
   ───────────────────────────────────────── */
async function launchRadar() {
  // ── Validasi awal ──
  var hasAsset    = !!uploadedDataURL;
  var hasAudience = audLocal || audTraveler;
  var hasChannel  = typeof activeChannel !== 'undefined' && !!activeChannel;
  if (!hasAsset || !hasAudience || !hasChannel) { showLaunchModal(); return; }

  // ── Cek Status Berlangganan & Gembok (Paywall) ──
  const profile = JSON.parse(localStorage.getItem('radar_user_profile') || '{}');
  const userEmail = (profile && profile.email) ? profile.email.toLowerCase().trim() : '';
  const isTester = (userEmail === 'halo@larisi.id');

  if (!isTester) {
    const paymentStatus = (profile.payment_status || 'trial').toLowerCase();
    const plan = (profile.selected_plan || 'freemium').toLowerCase();
    const quota = typeof window.freeCount !== 'undefined' ? window.freeCount : 10;
    
    const startDate = profile.trial_start ? new Date(profile.trial_start) : new Date(profile.created_at || Date.now());
    const trialDays = profile.trial_days || 7;
    const now = new Date();
    const diffDays = Math.floor((now - startDate) / (1000 * 60 * 60 * 24));
    const isResetDay = now.getDate() === 1;

    // A. KHUSUS PAKET FREE / FREEMIUM
    // Siapa pun yang bukan Pro atau Starter dianggap Free
    if (plan !== 'pro' && plan !== 'starter') {
      if (quota <= 0 && !isResetDay) {
        console.log('[Paywall] Free/Freemium: Jatah habis.');
        if (typeof showTrialModalManual === 'function') { showTrialModalManual(); }
        return;
      }
    }
    // B. PAKET BERBAYAR (Starter / Pro)
    else if (plan === 'starter' || plan === 'pro') {
      // 1. Cek Kuota (Khusus Starter wajib kena gembok kuota, tidak peduli paid/trial)
      if (plan === 'starter' && quota <= 0 && !isResetDay) {
        console.log('[Paywall] Starter: Kuota habis.');
        if (typeof showTrialModalManual === 'function') { showTrialModalManual(); }
        return;
      }

      // 2. Jika masih status TRIAL (7 Hari Pertama)
      if (paymentStatus === 'trial') {
        if (diffDays >= trialDays) {
          console.log('[Paywall] Starter/Pro: Masa trial habis.');
          if (typeof showTrialModalManual === 'function') { showTrialModalManual(); }
          return;
        }
      } 
      // 3. Jika status sudah PAID (Langganan Aktif)
      else if (paymentStatus === 'paid') {
        // Cek Waktu (30 Hari)
        if (diffDays >= 30) {
          console.log('[Paywall] Langganan EXPIRED (30 hari).');
          if (typeof showTrialModalManual === 'function') { showTrialModalManual(); }
          return;
        }
      }
    }
  }

  // ── Rate limiting ──
  if (!checkLaunchRateLimit()) return;

  // ── Build nama campaign pre-filled ──
  var personaEl = document.getElementById('personaName');
  var locEl     = document.querySelector('.popup-loc');
  var personaName = personaEl ? personaEl.textContent.trim() : 'Iklan Baru';
  var locFull     = locEl ? locEl.textContent.trim() : '';
  var locShort    = locFull ? locFull.split(',')[0].trim() : '';
  var campName    = personaName + (locShort ? ' · ' + locShort : '');

  // ── Cek akun sosial — harus akun platform YANG DIPILIH yang terhubung ──
  var _platformConnected = typeof isPlatformAccountConnected === 'function'
    ? isPlatformAccountConnected(activeChannel)
    : (typeof isBufferConnected === 'function' && isBufferConnected());

  if (!_platformConnected) {
    var _platformNames = { instagram: 'Instagram', meta: 'Facebook', tiktok: 'TikTok', youtube: 'YouTube' };
    var _selectedPlatformName = _platformNames[activeChannel] || 'Media Sosial';
    _showSocialWarning(_selectedPlatformName);
    return;
  }

  // ── Buka modal konfirmasi (P1) ──
  openLaunchConfirmModal(campName, activeChannel, activeFormat);
}

/* ─────────────────────────────────────────
   _createThumbDataUrl(dataUrl)
   Kompres foto asli menjadi thumbnail kecil (max 300px lebar, JPEG 65%)
   untuk disimpan ke Supabase (bukan localStorage).
   Return: compressed data:image/jpeg string, atau null
   ───────────────────────────────────────── */
function _createThumbDataUrl(dataUrl) {
  return new Promise(function(resolve) {
    if (!dataUrl || !dataUrl.startsWith('data:image')) { resolve(null); return; }
    var img = new Image();
    img.onload = function() {
      try {
        var maxW   = 600;
        var ratio  = maxW / img.naturalWidth;
        var targetW = maxW;
        var targetH = Math.round(img.naturalHeight * ratio);
        var c = document.createElement('canvas');
        c.width  = targetW;
        c.height = targetH;
        c.getContext('2d').drawImage(img, 0, 0, targetW, targetH);
        resolve(c.toDataURL('image/jpeg', 0.9));
      } catch(e) {
        console.warn('[launch] _createThumbDataUrl error:', e.message);
        resolve(null);
      }
    };
    img.onerror = function() { resolve(null); };
    img.src = dataUrl;
  });
}

/* ─────────────────────────────────────────
   captureVideoFrame(videoFile)
   Capture JPEG thumbnail dari frame 0.5s video yang di-upload
   Return: data:image/jpeg base64 string, atau null jika gagal
   ───────────────────────────────────────── */
function captureVideoFrame(videoFile) {
  return new Promise(function(resolve) {
    var video = document.createElement('video');
    video.preload = 'metadata';
    video.muted   = true;
    var url = URL.createObjectURL(videoFile);
    video.src = url;

    video.addEventListener('loadeddata', function() {
      video.currentTime = Math.min(0.5, video.duration || 0.5);
    });

    video.addEventListener('seeked', function() {
      try {
        var canvas = document.createElement('canvas');
        canvas.width  = 480;
        canvas.height = 270;
        var ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        URL.revokeObjectURL(url);
        var dataUrl = canvas.toDataURL('image/jpeg', 0.8);
        console.log('[launch] captureVideoFrame success, size:', dataUrl.length);
        resolve(dataUrl);
      } catch(e) {
        console.warn('[launch] captureVideoFrame canvas error:', e.message);
        URL.revokeObjectURL(url);
        resolve(null);
      }
    });

    video.addEventListener('error', function() {
      console.warn('[launch] captureVideoFrame video load error');
      URL.revokeObjectURL(url);
      resolve(null);
    });

    // Timeout fallback — 5 detik
    setTimeout(function() {
      URL.revokeObjectURL(url);
      resolve(null);
    }, 5000);

    video.load();
  });
}

/* ─────────────────────────────────────────
   _doLaunch(campNameOverride)
   Dipanggil setelah user klik "Launch Sekarang →"
   5-step flow: collect → export → save → buffer → animate
   ───────────────────────────────────────── */
async function _doLaunch(campNameOverride) {
  const profile = JSON.parse(localStorage.getItem('radar_user_profile') || '{}');
  const paymentStatus = (profile.payment_status || 'trial').toLowerCase();
  const plan = (profile.selected_plan || 'freemium').toLowerCase();
  
  // LOGIKA PENGURANGAN JATAH:
  // 1. Paket Starter/Pro yang sudah BAYAR (paid) -> Kurangi Jatah.
  // 2. Paket Freemium (Gratis) -> SELALU Kurangi Jatah (Tidak ada bebas tayang).
  // 3. Paket Starter/Pro yang masih TRIAL -> BEBAS TAYANG (Jangan kurangi jatah).
  
  const isPaid = (paymentStatus === 'paid');
  const isFree = (plan === 'freemium');
  const shouldDecrement = isPaid || isFree;

  if (shouldDecrement) {
    window.freeCount = Math.max(0, (window.freeCount || 10) - 1);
    const fcEl = document.getElementById('freeCount');
    if (fcEl) fcEl.textContent = window.freeCount;

    try {
      console.log(`[Database] Mengurangi jatah iklan untuk paket ${plan.toUpperCase()}...`);
      await window.updateUserProfile({ ai_launch_count: window.freeCount });
      
      profile.ai_launch_count = window.freeCount;
      localStorage.setItem('radar_user_profile', JSON.stringify(profile));
    } catch (err) {
      console.error('[Database] GAGAL update jatah:', err.message);
    }
  } else {
    console.log('[Database] Mode TRIAL (Starter/Pro): Bebas Tayang aktif.');
  }

  // ── Capture state dari Menu 1 ──
  var personaEl   = document.getElementById('personaName');
  var locEl       = document.querySelector('.popup-loc');
  var reachEl     = document.getElementById('reachNum');

  var personaName = personaEl ? personaEl.textContent.trim() : 'Iklan Baru';
  var locFull     = locEl ? locEl.textContent.trim() : '';
  var locShort    = locFull ? locFull.split(',')[0].trim() : '';

  // Gunakan nama dari input modal jika ada
  var campName = (campNameOverride && campNameOverride.length > 0)
    ? campNameOverride
    : personaName + (locShort ? ' · ' + locShort : '');

  // Active platform dari cycler "Publish ke Channel"
  var platMap   = { instagram: 'ig', tiktok: 'tiktok', youtube: 'youtube', meta: 'meta' };
  var activePlats = activeChannel && platMap[activeChannel] ? [platMap[activeChannel]] : ['ig'];

  // Parse reach
  var reachText      = reachEl ? reachEl.textContent.trim() : '10K';
  var reachTextClean = reachText.replace(/,/g, '');
  var reachLow   = 10000;
  var reachHigh  = 50000;
  var matchLow   = reachTextClean.match(/^(\d+(?:\.\d+)?)(K|M)?/i);
  var matchHigh  = reachTextClean.match(/[–\-]\s*(\d+(?:\.\d+)?)(K|M)?/i);
  function parseReach(val, unit) {
    var n = parseFloat(val);
    return Math.round(unit && unit.toUpperCase() === 'M' ? n * 1000000 : (unit && unit.toUpperCase() === 'K' ? n * 1000 : n));
  }
  if (matchLow)  reachLow  = parseReach(matchLow[1],  matchLow[2]);
  if (matchHigh) reachHigh = parseReach(matchHigh[1], matchHigh[2]);
  else           reachHigh = reachLow * 2;

  var platLabel = activePlats.map(function(p) { return p.toUpperCase(); }).join(', ');

  // ── STEP 1: Kumpulkan campaignData ──
  var captionEl    = document.getElementById('captionArea');
  var stitchEl     = document.getElementById('phoneStitch');
  var campaignData = {
    nama:        campName,
    kecamatan:   locShort,
    radius:      (typeof currentRadius !== 'undefined') ? currentRadius : 1,
    kategori:    (typeof currentPersona !== 'undefined' && currentPersona) ? currentPersona : 'General',
    platforms:   activePlats,
    format:      (typeof activeFormat !== 'undefined') ? activeFormat : 'post',
    personaName: personaName,
    personaTags: [],
    reachMin:    reachLow,
    reachMax:    reachHigh,
    caption:     captionEl ? captionEl.value : '',
    stitchText:  stitchEl  ? stitchEl.innerText : '',
    budget:      null,
    thumbUrl:    compressedThumb  // compressed JPEG untuk disimpan ke Supabase
  };

  console.log('[launch] DEBUG state saat launch:', {
    activeChannel:  activeChannel,
    activeFormat:   activeFormat,
    activePlatform: activePlatform,
    campaignFormat: campaignData.format,
    campaignPlats:  campaignData.platforms,
    campName:       campName
  });

  // ── Capture thumbnail dari video (jika ada uploadedVideoFile) ──
  // JANGAN pakai uploadedDataURL langsung — setiap kali processFiles dipanggil (tambah foto),
  // uploadedDataURL di-reset ke blob URL untuk preview. Gunakan uploadedDataURLs[0] (base64 stabil).
  var thumbUrl;
  if (typeof uploadedDataURLs !== 'undefined' && uploadedDataURLs[0] &&
      uploadedDataURLs[0].startsWith('data:')) {
    thumbUrl = uploadedDataURLs[0]; // base64 foto pertama — stabil, tidak ter-reset
  } else if (typeof uploadedDataURL !== 'undefined' && uploadedDataURL) {
    thumbUrl = uploadedDataURL; // fallback: blob URL (valid current session saja)
  } else {
    thumbUrl = null;
  }
  if (typeof uploadedVideoFile !== 'undefined' && uploadedVideoFile) {
    var frameBase64 = await captureVideoFrame(uploadedVideoFile);
    if (frameBase64) {
      thumbUrl = frameBase64;
      console.log('[launch] video thumbnail captured, using frame as thumbUrl');
    }
  }

  // ── Buat compressed thumbnail untuk disimpan ke Supabase ──
  // thumbUrl bisa jadi full-res base64 (besar) → kompres dulu ke ~15-25KB
  var compressedThumb = null;
  var thumbSourceUrl = (thumbUrl && thumbUrl.startsWith('data:image')) ? thumbUrl
    : (typeof uploadedDataURLs !== 'undefined' && uploadedDataURLs[0] && uploadedDataURLs[0].startsWith('data:image'))
      ? uploadedDataURLs[0] : null;
  if (thumbSourceUrl) {
    compressedThumb = await _createThumbDataUrl(thumbSourceUrl);
    console.log('[launch] compressed thumb size:', compressedThumb ? compressedThumb.length : 0);
  }

  // Campaign object untuk CAMPAIGNS array (Monitor)
  var newCamp = {
    id:           Date.now(),
    name:         campName,
    status:       'running',
    platforms:    activePlats,
    format:       (typeof activeFormat !== 'undefined') ? activeFormat : 'post',
    post_id:      null,
    reach:        0,
    reachTarget:  reachHigh,
    budget:       0,
    budgetUsed:   0,
    sparkData:    [0, 0, 0, 0, 0, 0],
    thumbColor:   '#791ADB',
    thumbUrl:     thumbUrl,
    launchTime:   'Baru saja',
    aiOpening:    'Iklan <strong>' + campName + '</strong> sudah live!\n\nAudiens tersedia: <strong>' + reachText + '</strong> di area kamu, jangkauan mulai dihitung begitu iklan ditayangkan.\n\nSaya pantau tren di <strong>' + (locShort || 'area target') + '</strong> via <strong>' + platLabel + '</strong> dan akan notify kamu kalau ada yang perlu dioptimalkan.',
    aiChips:      ['Lihat proyeksi', 'Optimalkan targeting', 'Bagikan ke tim'],
    aiChipResponses: {
      'Lihat proyeksi': 'Berdasarkan pengaturan iklan kamu:\n\nTarget reach: <strong>' + reachText + '</strong>\nEstimasi waktu: 24–48 jam dengan burn rate optimal\nPlatform: <strong>' + platLabel + '</strong>\n\nRekomendasi: pantau 2 jam pertama untuk validasi performa awal. Saya akan highlight anomali kalau ada.',
      'Optimalkan targeting': 'Untuk area <strong>' + (locShort || 'target kamu') + '</strong>, langkah optimasi:\n\n1. Buka platform ads (' + platLabel + ')\n2. Cek Audience Insights setelah 200+ impressi pertama\n3. Narrow ke usia & interest dengan CTR tertinggi\n\nBegitu akun terhubung ke RADAR, saya bisa rekomendasikan otomatis.',
      'Bagikan ke tim': 'Untuk bagikan status iklan ke tim:\n\n1. Screenshot halaman monitor ini\n2. Kirim via WhatsApp grup tim kamu\n\nMau saya siapkan ringkasan performa singkat untuk di-share?'
    }
  };

  // ── Export canvas (untuk download di Monitor — bukan untuk upload PostForMe) ──
  // Stitch burn ke PostForMe dilakukan via _compositeStitchOnDataUrl() di buffer.js
  var canvasPromise = (typeof exportCreativeCanvas === 'function')
    ? exportCreativeCanvas().catch(function(e) {
        console.warn('[launch] exportCreativeCanvas error (lanjut):', e.message);
        return null;
      })
    : Promise.resolve(null);

  // ── Push ke CAMPAIGNS + animasi launch ──
  CAMPAIGNS.unshift(newCamp);
  localStorage.setItem('radar_last_launch', Date.now().toString());

  // FIX 2: jika iklan berasal dari strategi kompetitor → update status ke 'selesai'
  if (window._strategyContext) {
    var _sHandle = (window._strategyContext.handle || '').replace(/^@/, '').toLowerCase();
    var _sId     = window._strategyContext.strategyId || null;
    if (_sHandle && typeof _anGetSavedStrategies === 'function') {
      var _saves = _anGetSavedStrategies();
      var _match = _saves.find(function(x) {
        if (_sId) return x.id === _sId;
        return (x.handle || '').replace(/^@/, '').toLowerCase() === _sHandle;
      });
      if (_match) {
        _match.status = 'selesai';
        if (typeof _anPersistStrategies === 'function')       _anPersistStrategies(_saves);
        if (typeof _anRenderSavedStrategies === 'function')   _anRenderSavedStrategies();
      }
    }
    window._strategyContext = null; // clear context setelah publish
  }

  // ── P2: Toast spesifik platform SEBELUM modal launching ──
  var toastCopy = _buildPublishToastCopy(activeChannel, activeFormat);
  showTopToast(toastCopy, 'success');

  // ── Launching modal → pindah ke Monitor ──
  showLaunchingModal(campName, function() {
    switchMenu('monitor');
  });

  // ── Save ke Supabase + Publish via PostForMe (paralel, publish tunggu supabase_id) ──
  var savePromise = (typeof saveCampaign === 'function')
    ? saveCampaign(campaignData).catch(function(e) {
        console.warn('[launch] saveCampaign error (lanjut):', e);
        return null;
      })
    : Promise.resolve(null);

  Promise.all([canvasPromise, savePromise]).then(function(results) {
    var canvas     = results[0];
    var saveResult = results[1];

    // Simpan supabase_id ke KEDUA object (newCamp untuk Monitor, campaignData untuk updateCampaignPostId)
    if (saveResult && saveResult.success && saveResult.id) {
      newCamp.supabase_id      = saveResult.id;
      campaignData.supabase_id = saveResult.id;
      console.log('[launch] supabase_id ready:', saveResult.id);
      // Upload thumbnail ke Supabase Storage → URL permanen, tidak expire
      if (compressedThumb && typeof uploadThumbToStorage === 'function') {
        uploadThumbToStorage(saveResult.id, compressedThumb).then(function(storageUrl) {
          if (storageUrl) {
            newCamp.thumbUrl = storageUrl;
            updateCampaignThumbUrl(saveResult.id, storageUrl);
            try { localStorage.setItem('radar_thumb_' + saveResult.id, storageUrl); } catch(e) {}
          } else {
            // Fallback: simpan base64 ke localStorage kalau Storage gagal
            try { localStorage.setItem('radar_thumb_' + saveResult.id, compressedThumb); } catch(e) {}
          }
        });
      }
    }

    if (typeof publishViaBuffer === 'function') {
      // Pastikan format selalu ter-isi sebelum publish (guard terakhir)
      campaignData.format = campaignData.format
        || (typeof activeFormat !== 'undefined' ? activeFormat : 'post');
      console.log('[launch] campaignData.format sebelum publishViaBuffer:', campaignData.format);
      publishViaBuffer(canvas, campaignData).then(function(result) {
        if (result && result.postId) {
          // Simpan post_id ke newCamp — JANGAN set post_url dari initial response
          // karena PostForMe bisa mengembalikan URL post sebelumnya sebelum post baru live
          // post_url akan di-set oleh polling di buffer.js saat post confirmed published
          newCamp.post_id  = result.postId;
          console.log('[launch] post_id saved:', result.postId, '(post_url ditunggu dari polling)');

          // Update chip di DOM card yang sudah dirender
          var cardEl = document.getElementById('campaign-card-' + newCamp.id);
          if (cardEl) {
            var chip = cardEl.querySelector('.cc-ts-chip');
            if (chip) {
              // Prioritas: postUrl langsung dari PostForMe (URL asli IG/TikTok/dll)
              var href = result.postUrl || null;

              // Fallback: construct dari postId (hanya reliable untuk TikTok/YouTube/Meta)
              if (!href) {
                var plat = (newCamp.platforms || [])[0] || 'ig';
                var fmt2 = newCamp.format || 'post';
                var pid  = result.postId;
                var accs = (typeof _getStoredAccounts === 'function') ? _getStoredAccounts() : [];
                var matchAcc = accs.find(function(a) {
                  var pm = { ig:'instagram', tiktok:'tiktok', meta:'facebook', youtube:'youtube' };
                  return a.platform === (pm[plat] || plat);
                });
                var uname = matchAcc ? (matchAcc.username || '') : '';

                if (plat === 'tiktok' && uname) {
                  href = 'https://www.tiktok.com/@' + uname + '/video/' + pid;
                } else if (plat === 'meta') {
                  href = 'https://www.facebook.com/permalink.php?story_fbid=' + pid;
                } else if (plat === 'youtube') {
                  href = 'https://www.youtube.com/shorts/' + pid;
                }
                // IG: TIDAK construct dari postId — PostForMe ID bukan shortcode IG
              }

              if (href) {
                chip.href = href;
                chip.style.pointerEvents = 'auto';
                console.log('[launch] chip updated:', href);
              }
            }
          }
        }
      }).catch(function(e) {
        console.warn('[launch] publishViaBuffer error:', e);
      });
    }
  });
}

/* ─── Inline Social Warning ──────────────────────────────────── */
function _showSocialWarning(platformName) {
  var isSpecific = !!platformName;
  var title = isSpecific
    ? 'Akun ' + platformName + ' belum terhubung'
    : 'Belum ada akun sosial terhubung';
  var desc = isSpecific
    ? 'Kamu memilih publish ke ' + platformName + ', tapi akun ' + platformName + ' belum dihubungkan. Hubungkan dulu sebelum tayangkan.'
    : 'Hubungkan minimal 1 akun untuk bisa publish otomatis ke Instagram, TikTok, Facebook, atau YouTube.';

  var modal = document.getElementById('socialWarningModal');
  if (modal) {
    var titleEl = document.getElementById('swmTitle');
    var descEl  = document.getElementById('swmDesc');
    if (titleEl) titleEl.textContent = title;
    if (descEl)  descEl.textContent  = desc;
    modal.style.display = 'flex';
  }
}

function showLaunchingModal(campName, onDone) {
  var modal   = document.getElementById('launchingModal');
  var loading = document.getElementById('llLoading');
  var success = document.getElementById('llSuccess');

  document.getElementById('llCampName').textContent = campName;
  document.getElementById('llSuccessCampName').textContent = campName;

  loading.style.display = 'flex';
  success.style.display = 'none';
  modal.style.display   = 'flex';

  // Phase 1: loading (1.6s) → Phase 2: success
  setTimeout(function() {
    loading.style.display = 'none';
    success.style.display = 'flex';

    // Phase 2: success (2s) → redirect
    setTimeout(function() {
      modal.style.display = 'none';
      onDone();
    }, 2000);
  }, 1600);
}
