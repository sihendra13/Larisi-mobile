var _dkPollTimer = null;
var _dkCountdownTimer = null;

var _DUITKU_BANK_NAMES = {
  'BT': 'Permata Bank', 'BC': 'BCA', 'M2': 'Bank Mandiri', 'VC': 'CIMB Niaga',
  'BV': 'BSI', 'I1': 'BNI', 'B1': 'CIMB Niaga VA', 'M3': 'Maybank',
  'AG': 'Bank Artha Graha', 'BNC': 'Bank Neo Commerce',
};

function _formatRupiah(n) {
  return 'Rp ' + parseInt(n).toLocaleString('id-ID');
}

function _copyVA(text, btn) {
  navigator.clipboard.writeText(text).then(function() {
    var orig = btn.textContent;
    btn.textContent = 'Tersalin!';
    setTimeout(function() { btn.textContent = orig; }, 1500);
  });
}

function _showPendingBanner(orderId, plan) {
  var existing = document.getElementById('dk-pending-banner');
  if (existing) return;

  var banner = document.createElement('div');
  banner.id = 'dk-pending-banner';
  banner.style.cssText = [
    'position:fixed;top:0;left:0;right:0;z-index:99998;',
    'background:#fffbeb;border-bottom:2px solid #f59e0b;',
    'padding:10px 16px;display:flex;align-items:center;gap:12px;',
    'font-family:sans-serif;font-size:13px;'
  ].join('');

  banner.innerHTML = [
    '<span style="font-size:18px;flex-shrink:0;">💳</span>',
    '<div style="flex:1;line-height:1.4;">',
      '<strong style="color:#92400e;">Pembayaran sedang diproses</strong>',
      '<div style="color:#78350f;">Invoice <code style="background:#fef3c7;padding:1px 4px;border-radius:3px;">' + orderId + '</code> — Paket ' + plan.toUpperCase() + '. Akun akan otomatis aktif setelah transfer dikonfirmasi.</div>',
    '</div>',
    '<button id="dk-banner-close" style="background:none;border:none;font-size:20px;cursor:pointer;color:#92400e;flex-shrink:0;padding:4px;">&#215;</button>',
  ].join('');

  document.body.appendChild(banner);

  // Geser .main ke bawah agar header tidak tertimpa banner
  requestAnimationFrame(function() {
    var mainEl = document.querySelector('.main');
    if (mainEl) mainEl.style.paddingTop = banner.offsetHeight + 'px';
  });

  document.getElementById('dk-banner-close').onclick = function() {
    banner.remove();
    var mainEl = document.querySelector('.main');
    if (mainEl) mainEl.style.paddingTop = '';
  };
}

function _dismissPendingBanner() {
  var b = document.getElementById('dk-pending-banner');
  if (b) {
    b.remove();
    var mainEl = document.querySelector('.main');
    if (mainEl) mainEl.style.paddingTop = '';
  }
}

function _addDkNotification(message) {
  // Toast
  if (typeof window.showAnToast === 'function') {
    window.showAnToast(message, 'success');
  }
  // Notification bell badge
  var bell = document.querySelector('.notif-btn');
  if (bell) {
    var badge = bell.querySelector('#dk-notif-badge');
    if (!badge) {
      badge = document.createElement('span');
      badge.id = 'dk-notif-badge';
      badge.style.cssText = 'position:absolute;top:-4px;right:-4px;background:#ef4444;color:#fff;font-size:10px;font-weight:700;min-width:16px;height:16px;border-radius:8px;display:flex;align-items:center;justify-content:center;padding:0 3px;';
      bell.style.position = 'relative';
      bell.appendChild(badge);
    }
    var count = parseInt(badge.textContent || '0') + 1;
    badge.textContent = count;
  }
  // Simpan ke localStorage
  var notifs = JSON.parse(localStorage.getItem('larisi_notifs') || '[]');
  notifs.unshift({ msg: message, time: Date.now(), read: false });
  localStorage.setItem('larisi_notifs', JSON.stringify(notifs.slice(0, 20)));
}

function _dkOnPaymentSuccess(plan) {
  if (_dkPollTimer)     { clearInterval(_dkPollTimer);     _dkPollTimer = null; }
  if (_dkCountdownTimer){ clearInterval(_dkCountdownTimer); _dkCountdownTimer = null; }

  // Update status pill
  var pill = document.getElementById('dk-status-pill');
  if (pill) {
    pill.innerHTML = '<span style="font-size:16px;">✅</span> Pembayaran Berhasil!';
    pill.style.background = '#d1fae5';
    pill.style.color = '#065f46';
  }

  // Dismiss banner pending jika ada
  _dismissPendingBanner();

  // Notification ke bell
  _addDkNotification('Pembayaran berhasil! Akun diupgrade ke Paket ' + plan.toUpperCase() + '.');

  // Update plan badge langsung tanpa reload
  var badge = document.getElementById('plan-badge');
  if (badge) {
    badge.textContent = plan.toUpperCase();
    badge.style.display = 'inline-block';
    badge.style.background = plan === 'pro' ? '#791ADB' : '#10b981';
    badge.style.color = 'white';
  }
  var freeBadge = document.getElementById('freeBadgeContainer');
  if (freeBadge) freeBadge.style.display = 'none';

  // Update localStorage agar konsisten
  var profile = JSON.parse(localStorage.getItem('radar_user_profile') || '{}');
  profile.selected_plan = plan;
  localStorage.setItem('radar_user_profile', JSON.stringify(profile));

  // Tutup trial modal jika masih terbuka
  var trialModal = document.getElementById('trial-modal');
  if (trialModal) trialModal.style.display = 'none';

  // Tutup Duitku modal setelah 3.5 detik
  setTimeout(function() {
    var overlay = document.getElementById('dk-modal-overlay');
    if (overlay) overlay.remove();
  }, 3500);
}

function _startDkPolling(userId, plan) {
  if (_dkPollTimer) clearInterval(_dkPollTimer);
  var currentPlan = (window.userBizProfile || JSON.parse(localStorage.getItem('radar_user_profile') || '{}')).selected_plan || 'freemium';

  _dkPollTimer = setInterval(async function() {
    try {
      if (!window.getSupabaseClient) return;
      var client = window.getSupabaseClient();
      var res = await client.from('profiles').select('selected_plan').eq('id', userId).single();
      if (res.data && res.data.selected_plan && res.data.selected_plan !== currentPlan) {
        _dkOnPaymentSuccess(res.data.selected_plan);
      }
    } catch(e) {}
  }, 15000);
}

// ── Detail Transaction Popup ──────────────────────────────────────────────────
function _showDkDetailPopup(orderId, totalAmount, originalAmount) {
  var existing = document.getElementById('dk-detail-overlay');
  if (existing) existing.remove();

  var svc = Math.max(0, parseInt(totalAmount) - parseInt(originalAmount));
  var today = new Date();
  var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  var dateStr = today.getDate() + '-' + months[today.getMonth()] + '-' + today.getFullYear();

  var pop = document.createElement('div');
  pop.id = 'dk-detail-overlay';
  pop.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.5);z-index:100001;display:flex;align-items:center;justify-content:center;padding:16px;box-sizing:border-box;';

  pop.innerHTML = [
    '<div style="background:#fff;border-radius:12px;width:100%;max-width:380px;overflow:hidden;font-family:sans-serif;">',

      // Header
      '<div style="background:#f5f5f5;padding:14px 16px;display:flex;justify-content:space-between;align-items:center;">',
        '<span style="font-weight:700;font-size:15px;">Detail Transaksi</span>',
        '<button id="dk-det-close" style="background:none;border:none;font-size:22px;line-height:1;cursor:pointer;color:#888;">&times;</button>',
      '</div>',

      // Identity
      '<div style="padding:20px;text-align:center;background:#f0ecf8;">',
        '<img src="Assets/logo_duitku.png" alt="Larisi" style="width:56px;height:56px;border-radius:50%;object-fit:cover;margin:0 auto 8px;display:block;">',
        '<div style="font-weight:700;font-size:14px;margin-bottom:16px;">LARISI</div>',
        '<div style="display:flex;justify-content:space-between;text-align:left;gap:8px;">',
          '<div>',
            '<div style="color:#888;font-size:11px;">Invoice number</div>',
            '<div style="font-weight:600;font-size:12px;word-break:break-all;">' + orderId + '</div>',
          '</div>',
          '<div style="text-align:right;flex-shrink:0;">',
            '<div style="color:#888;font-size:11px;">Transaction Date</div>',
            '<div style="font-weight:600;font-size:12px;">' + dateStr + '</div>',
          '</div>',
        '</div>',
      '</div>',

      // Breakdown
      '<div style="padding:0 20px;">',
        '<div style="display:flex;justify-content:space-between;padding:12px 0;border-bottom:1px solid #f0f0f0;">',
          '<span style="color:#555;font-size:14px;">Sub Total</span>',
          '<span style="font-weight:600;font-size:14px;">' + _formatRupiah(originalAmount) + '</span>',
        '</div>',
        svc > 0 ? [
          '<div style="display:flex;justify-content:space-between;align-items:center;padding:12px 0;border-bottom:1px solid #f0f0f0;">',
            '<div>',
              '<div style="color:#555;font-size:14px;">Biaya Layanan</div>',
              '<div style="color:#aaa;font-size:11px;">Biaya Virtual Account Duitku</div>',
            '</div>',
            '<span style="font-weight:600;font-size:14px;">' + _formatRupiah(svc) + '</span>',
          '</div>',
        ].join('') : '',
      '</div>',

      // Total footer
      '<div style="display:flex;justify-content:space-between;padding:14px 20px;background:#1a0533;">',
        '<span style="color:#fff;font-weight:700;font-size:14px;">Total Amount</span>',
        '<span style="color:#fff;font-weight:700;font-size:14px;">' + _formatRupiah(totalAmount) + '</span>',
      '</div>',

    '</div>'
  ].join('');

  document.body.appendChild(pop);
  document.getElementById('dk-det-close').onclick = function() { pop.remove(); };
  pop.addEventListener('click', function(e) { if (e.target === pop) pop.remove(); });
}

// ── Main Modal ────────────────────────────────────────────────────────────────
function _showDuitkuModal(result, plan, originalAmount, orderId, userId) {
  var existing = document.getElementById('dk-modal-overlay');
  if (existing) existing.remove();
  if (_dkPollTimer)     { clearInterval(_dkPollTimer);      _dkPollTimer = null; }
  if (_dkCountdownTimer){ clearInterval(_dkCountdownTimer); _dkCountdownTimer = null; }

  var vaNumber  = result.vaNumber || '';
  var amount    = result.amount || originalAmount;
  var bankCode  = result.paymentCode || '';
  var bankName  = _DUITKU_BANK_NAMES[bankCode] || 'Virtual Account';

  var overlay = document.createElement('div');
  overlay.id = 'dk-modal-overlay';
  overlay.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.25);backdrop-filter:blur(3px);-webkit-backdrop-filter:blur(3px);z-index:99999;display:flex;align-items:center;justify-content:center;padding:16px;box-sizing:border-box;';

  overlay.innerHTML = [
    '<div style="background:#fff;border-radius:16px;width:100%;max-width:420px;overflow:hidden;font-family:sans-serif;">',

      // Header
      '<div style="background:#1a0533;padding:20px 24px;display:flex;align-items:center;justify-content:space-between;">',
        '<div>',
          '<div style="color:#fff;font-size:18px;font-weight:700;">LARISI</div>',
          '<div style="color:#c9a7f7;font-size:12px;margin-top:2px;">Langganan Paket ' + plan.toUpperCase() + '</div>',
        '</div>',
        '<button id="dk-close" style="background:rgba(255,255,255,0.15);border:none;color:#fff;border-radius:50%;width:32px;height:32px;font-size:20px;cursor:pointer;line-height:1;">&#215;</button>',
      '</div>',

      // Amount + Countdown
      '<div style="padding:20px 24px;border-bottom:1px solid #f0f0f0;display:flex;align-items:flex-start;justify-content:space-between;">',
        '<div>',
          '<div style="color:#888;font-size:12px;margin-bottom:4px;">Jumlah Pembayaran</div>',
          '<div style="font-size:26px;font-weight:700;color:#1a0533;">' + _formatRupiah(amount) + '</div>',
        '</div>',
        '<div style="text-align:right;">',
          '<div style="color:#888;font-size:11px;margin-bottom:4px;">Sisa Waktu</div>',
          '<div id="dk-countdown" style="font-size:20px;font-weight:700;color:#7c3aed;font-variant-numeric:tabular-nums;">60:00</div>',
        '</div>',
      '</div>',

      // VA Info
      '<div style="padding:16px 24px;border-bottom:1px solid #f0f0f0;">',
        '<div style="color:#888;font-size:12px;margin-bottom:4px;">Metode Pembayaran</div>',
        '<div style="font-weight:600;font-size:14px;color:#333;margin-bottom:12px;">' + bankName + '</div>',
        '<div style="color:#888;font-size:12px;margin-bottom:6px;">Nomor Virtual Account</div>',
        '<div style="display:flex;align-items:center;gap:10px;">',
          '<div id="dk-va-num" style="font-size:22px;font-weight:700;color:#1a0533;letter-spacing:2px;flex:1;">' + vaNumber + '</div>',
          '<button id="dk-copy" style="background:#1a1a1a;color:#fff;border:none;border-radius:8px;padding:8px 14px;font-size:13px;font-weight:600;cursor:pointer;">Salin</button>',
        '</div>',
      '</div>',

      // BCA Warning
      '<div style="margin:12px 24px 0;padding:10px 12px;background:#fff8e1;border:1px solid #ffe082;border-radius:8px;display:flex;gap:8px;align-items:flex-start;">',
        '<span style="font-size:15px;flex-shrink:0;">⚠️</span>',
        '<span style="font-size:12px;color:#7a5c00;line-height:1.5;">Pengguna <strong>Bank BCA</strong> belum dapat melakukan transfer ke Virtual Account ini. Gunakan bank lain seperti Mandiri, BNI, BRI, CIMB, atau mobile banking selain BCA.</span>',
      '</div>',

      // Status Pill
      '<div style="padding:12px 24px 0;">',
        '<div id="dk-status-pill" style="display:flex;align-items:center;justify-content:center;gap:8px;padding:10px;background:#f5f5f5;border-radius:10px;font-size:13px;font-weight:600;color:#92400e;">',
          '<span style="width:8px;height:8px;border-radius:50%;background:#f59e0b;flex-shrink:0;display:inline-block;"></span>',
          'Menunggu Pembayaran...',
        '</div>',
      '</div>',

      // Footer buttons
      '<div style="padding:16px 24px 12px;">',
        '<button id="dk-detail-btn" style="width:100%;padding:12px;border:1.5px solid #1a1a1a;border-radius:10px;color:#1a1a1a;background:#fff;font-weight:600;font-size:14px;cursor:pointer;">Lihat Detail Transaksi</button>',
      '</div>',

      // Duitku info
      '<div style="padding:0 24px 16px;text-align:center;">',
        '<span style="font-size:11px;color:#555;">Pembayaran diproses oleh Duitku payment gateway resmi mitra Larisi</span>',
      '</div>',

    '</div>'
  ].join('');

  document.body.appendChild(overlay);

  // ── Hover effects ────────────────────────────────────────────
  function _hoverBlackPurple(btn, bordered) {
    btn.onmouseenter = function() {
      this.style.background = '#7c3aed';
      this.style.color = '#fff';
      if (bordered) this.style.borderColor = '#7c3aed';
    };
    btn.onmouseleave = function() {
      this.style.background = bordered ? '#fff' : '#1a1a1a';
      this.style.color = bordered ? '#1a1a1a' : '#fff';
      if (bordered) this.style.borderColor = '#1a1a1a';
    };
  }
  _hoverBlackPurple(document.getElementById('dk-copy'), false);
  _hoverBlackPurple(document.getElementById('dk-detail-btn'), true);

  // ── Event handlers ───────────────────────────────────────────
  function _isPaid() {
    var pill = document.getElementById('dk-status-pill');
    return pill && pill.textContent.indexOf('Berhasil') !== -1;
  }
  function _closeModal() {
    if (_dkCountdownTimer){ clearInterval(_dkCountdownTimer); _dkCountdownTimer = null; }
    // Tutup trial modal agar tidak muncul lagi setelah Duitku modal ditutup
    var trialModal = document.getElementById('trial-modal');
    if (trialModal) trialModal.style.display = 'none';
    // Jika masih PENDING saat ditutup: tampilkan banner + lanjutkan polling
    if (!_isPaid()) {
      _showPendingBanner(orderId, plan);
    } else {
      if (_dkPollTimer) { clearInterval(_dkPollTimer); _dkPollTimer = null; }
    }
    overlay.remove();
  }
  document.getElementById('dk-close').onclick = _closeModal;
  overlay.addEventListener('click', function(e) { if (e.target === overlay) _closeModal(); });

  document.getElementById('dk-copy').onclick = function() { _copyVA(vaNumber, this); };

  document.getElementById('dk-detail-btn').onclick = function() {
    _showDkDetailPopup(orderId, amount, originalAmount);
  };

  // ── Countdown timer ──────────────────────────────────────────
  var endTime = Date.now() + 60 * 60 * 1000;
  var cdEl = document.getElementById('dk-countdown');
  _dkCountdownTimer = setInterval(function() {
    var rem = Math.max(0, endTime - Date.now());
    var m = Math.floor(rem / 60000);
    var s = Math.floor((rem % 60000) / 1000);
    if (cdEl) cdEl.textContent = String(m).padStart(2,'0') + ':' + String(s).padStart(2,'0');
    if (rem <= 0) {
      clearInterval(_dkCountdownTimer); _dkCountdownTimer = null;
      if (cdEl) { cdEl.textContent = '00:00'; cdEl.style.color = '#ef4444'; }
      var pill = document.getElementById('dk-status-pill');
      if (pill) { pill.innerHTML = '❌ Invoice kadaluarsa — buat invoice baru'; pill.style.background = '#fee2e2'; pill.style.color = '#991b1b'; }
    }
  }, 1000);

  // ── Polling (setiap 15 detik cek Supabase) ──────────────────
  if (userId) _startDkPolling(userId, plan);
}

// ── Notification Panel ────────────────────────────────────────────────────────
function _dkFormatRelTime(ts) {
  var diff = Date.now() - ts;
  var m = Math.floor(diff / 60000);
  if (m < 1)  return 'Baru saja';
  if (m < 60) return m + ' menit lalu';
  var h = Math.floor(m / 60);
  if (h < 24) return h + ' jam lalu';
  return Math.floor(h / 24) + ' hari lalu';
}

function _dkRenderNotifPanel(panel) {
  var notifs = JSON.parse(localStorage.getItem('larisi_notifs') || '[]');

  var header = [
    '<div style="padding:14px 16px;border-bottom:1px solid #f0f0f0;display:flex;align-items:center;justify-content:space-between;">',
      '<span style="font-weight:700;font-size:14px;color:#1a0533;">Notifikasi</span>',
      notifs.length ? '<button id="dk-notif-clear" style="background:none;border:none;font-size:12px;color:#7c3aed;cursor:pointer;font-weight:600;padding:0;">Hapus semua</button>' : '',
    '</div>',
  ].join('');

  var body;
  if (notifs.length === 0) {
    body = '<div style="padding:32px 16px;text-align:center;color:#aaa;font-size:13px;">Tidak ada notifikasi</div>';
  } else {
    body = '<div style="max-height:340px;overflow-y:auto;">' +
      notifs.map(function(n) {
        return [
          '<div style="padding:12px 16px;border-bottom:1px solid #f7f7f7;',
            n.read ? '' : 'background:#faf5ff;',
          '">',
            '<div style="font-size:13px;color:#1a1a1a;line-height:1.5;margin-bottom:3px;">' + n.msg + '</div>',
            '<div style="font-size:11px;color:#aaa;">' + _dkFormatRelTime(n.time) + '</div>',
          '</div>',
        ].join('');
      }).join('') +
    '</div>';
  }

  panel.innerHTML = header + body;

  var clearBtn = document.getElementById('dk-notif-clear');
  if (clearBtn) {
    clearBtn.onclick = function(e) {
      e.stopPropagation();
      localStorage.removeItem('larisi_notifs');
      var badge = document.getElementById('dk-notif-badge');
      if (badge) badge.remove();
      _dkRenderNotifPanel(panel);
    };
  }
}

function _dkOpenNotifPanel() {
  var bell = document.querySelector('.notif-btn');
  if (!bell) return;

  var rect = bell.getBoundingClientRect();

  var panel = document.createElement('div');
  panel.id = 'dk-notif-panel';
  panel.style.cssText = [
    'position:fixed;',
    'top:' + (rect.bottom + 8) + 'px;',
    'right:' + (window.innerWidth - rect.right) + 'px;',
    'background:#fff;border:1px solid #e5e7eb;border-radius:12px;',
    'box-shadow:0 8px 28px rgba(0,0,0,0.14);width:300px;z-index:10000;',
    'font-family:sans-serif;overflow:hidden;',
    'animation:dkFadeIn 0.15s ease;',
  ].join('');

  // Inject keyframe once
  if (!document.getElementById('dk-notif-style')) {
    var s = document.createElement('style');
    s.id = 'dk-notif-style';
    s.textContent = '@keyframes dkFadeIn{from{opacity:0;transform:translateY(-6px)}to{opacity:1;transform:translateY(0)}}';
    document.head.appendChild(s);
  }

  _dkRenderNotifPanel(panel);
  document.body.appendChild(panel);

  // Close on outside click
  setTimeout(function() {
    function _outside(e) {
      var p = document.getElementById('dk-notif-panel');
      var b = document.querySelector('.notif-btn');
      if (p && !p.contains(e.target) && b && !b.contains(e.target)) {
        p.remove();
        document.removeEventListener('click', _outside);
      }
    }
    document.addEventListener('click', _outside);
  }, 0);
}

function _initNotifPanel() {
  var bell = document.querySelector('.notif-btn');
  if (!bell) return;
  bell.style.cursor = 'pointer';
  bell.onclick = function() {
    var existing = document.getElementById('dk-notif-panel');
    if (existing) { existing.remove(); return; }

    // Mark all as read and clear badge
    var notifs = JSON.parse(localStorage.getItem('larisi_notifs') || '[]');
    if (notifs.some(function(n) { return !n.read; })) {
      localStorage.setItem('larisi_notifs', JSON.stringify(
        notifs.map(function(n) { return Object.assign({}, n, { read: true }); })
      ));
      var badge = document.getElementById('dk-notif-badge');
      if (badge) badge.remove();
    }

    _dkOpenNotifPanel();
  };
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', _initNotifPanel);
} else {
  _initNotifPanel();
}

// ── Entry point ───────────────────────────────────────────────────────────────
window.startDuitkuPayment = async function(plan, amount) {
  try {
    var user = (typeof window.getCurrentUser === 'function') ? await window.getCurrentUser() : null;
    var profile = window.userBizProfile || JSON.parse(localStorage.getItem('radar_user_profile') || '{}');
    var email   = (user && user.email ? user.email : (profile.email || '')).toLowerCase().trim();
    var name    = profile.business_name || profile.full_name || (user && user.user_metadata && user.user_metadata.full_name) || 'Pelanggan Larisi';
    var phone   = profile.phone || profile.phone_number || '081234567890';
    var orderId = 'LARISI-' + Date.now();

    if (window.showAnToast) window.showAnToast('Menghubungkan ke Duitku...', 'info');

    var resp = await fetch(window.RADAR_CONFIG.SUPABASE_URL + '/functions/v1/duitku-invoice', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + window.RADAR_CONFIG.SUPABASE_ANON_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ plan, amount, email, name, phone, orderId, userId: user ? user.id : '' })
    });

    var result = await resp.json();
    console.log('[Duitku] Response:', result);

    if (result.vaNumber || result.paymentUrl) {
      _showDuitkuModal(result, plan, amount, orderId, user ? user.id : '');
    } else {
      throw new Error(result.error || 'Gagal membuat invoice Duitku');
    }

  } catch(err) {
    console.error('Duitku Error:', err);
    alert('Maaf, ' + err.message);
  }
};
