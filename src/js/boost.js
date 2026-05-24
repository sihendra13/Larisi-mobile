// RADAR — boost.js
// Modal Boost Campaign dengan rekomendasi AI
// Arsitektur modular: redirect sekarang, direct API nanti

/* ─── BOOST_HANDLER ─── */
var BOOST_HANDLER = {

  // MODE 1 (aktif sekarang): buka Ads Manager + salin rekomendasi
  redirect: function(boostData) {
    var raw = boostData.platformsRaw || [];
    var isTikTokOnly = raw.length === 1 && raw[0] === 'tiktok';
    var hasTikTok    = raw.indexOf('tiktok') !== -1;
    var hasMetaOrIg  = raw.indexOf('meta') !== -1 || raw.indexOf('ig') !== -1;
    var url = (hasTikTok && !hasMetaOrIg)
      ? 'https://ads.tiktok.com/i18n/creation/campaign'
      : 'https://www.facebook.com/adsmanager/creation';
    window.open(url, '_blank');
  },

  // MODE 2 (uncomment kalau Meta Ads API sudah konek):
  // direct: async function(boostData) {
  //   await _metaProxy('/v1/campaigns', 'POST', {
  //     objective: 'REACH',
  //     location: boostData.location,
  //     audience: boostData.persona,
  //     budget: boostData.budget,
  //     creative_id: boostData.postId
  //   });
  // },

  run: function(boostData) {
    var isMetaAdsConnected = false; // ganti true kalau Meta Ads API sudah konek
    if (isMetaAdsConnected && this.direct) {
      return this.direct(boostData);
    }
    return this.redirect(boostData);
  }
};

/* ─── Format angka ke Rupiah ─── */
function _formatRupiah(n) {
  return 'Rp ' + n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

/* ─── Bangun rekomendasi boost dari data campaign ─── */
function _buildBoostRecommendation(campaign) {
  var platMap = { ig: 'Instagram', meta: 'Facebook', tiktok: 'TikTok', youtube: 'YouTube' };
  var platNames = (campaign.platforms || ['ig']).map(function(p) { return platMap[p] || p.toUpperCase(); }).join(' + ');

  var formatMap = { post: 'Single Image/Video', reel: 'Reels (9:16)', story: 'Stories (9:16)' };
  var formatLabel = formatMap[campaign.format || 'post'] || 'Post';

  var budgetMin = 25000;
  var budgetMax = 50000;
  var reachMin  = Math.round((campaign.reachMin || 3000));
  var reachMax  = Math.round((campaign.reachMax || 8000));

  return {
    platform:     platNames,
    platformsRaw: campaign.platforms || ['ig'],
    location:     campaign.kecamatan || 'Area target',
    radius:       (campaign.radius || 1) + ' km',
    audience:     campaign.kategori || 'General',
    format:       formatLabel,
    budgetMin:    budgetMin,
    budgetMax:    budgetMax,
    reachMin:     reachMin,
    reachMax:     reachMax,
    primeTime:    'Kamis–Sabtu, 18.00–21.00',
    campName:     campaign.nama || campaign.name || 'Campaign'
  };
}

/* ─── Copy teks rekomendasi ke clipboard ─── */
function copyBoostRecommendation(rec) {
  var text =
    '💡 Rekomendasi RADAR — Boost Campaign\n' +
    '━━━━━━━━━━━━━━━━━━━━━━━━\n' +
    '📍 Lokasi     : ' + rec.location + ', radius ' + rec.radius + '\n' +
    '👥 Audience   : ' + rec.audience + '\n' +
    '🎬 Format     : ' + rec.format + '\n' +
    '📱 Platform   : ' + rec.platform + '\n' +
    '⏰ Prime time : ' + rec.primeTime + '\n\n' +
    '💰 Budget harian  : ' + _formatRupiah(rec.budgetMin) + ' – ' + _formatRupiah(rec.budgetMax) + '\n' +
    '📈 Est. reach baru: ' + rec.reachMin.toLocaleString('id-ID') + ' – ' + rec.reachMax.toLocaleString('id-ID') + ' orang\n' +
    '━━━━━━━━━━━━━━━━━━━━━━━━\n' +
    'Dibuat oleh RADAR · radar-laras.app';

  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(function() {
      if (typeof showTopToast === 'function') showTopToast('✓ Rekomendasi disalin ke clipboard!', 'success');
    }).catch(function() {
      _copyFallback(text);
    });
  } else {
    _copyFallback(text);
  }
}

function _copyFallback(text) {
  var ta = document.createElement('textarea');
  ta.value = text;
  ta.style.cssText = 'position:fixed;opacity:0;top:0;left:0;';
  document.body.appendChild(ta);
  ta.select();
  try {
    document.execCommand('copy');
    if (typeof showTopToast === 'function') showTopToast('✓ Rekomendasi disalin!', 'success');
  } catch(e) {
    if (typeof showTopToast === 'function') showTopToast('⚠ Gagal salin — coba manual', 'warning');
  }
  document.body.removeChild(ta);
}

/* ─── Render Modal Boost ─── */
function showBoostModal(campaign) {
  // Hapus modal lama kalau ada
  var old = document.getElementById('boostModalOverlay');
  if (old) old.remove();

  var rec = _buildBoostRecommendation(campaign);

  // Budget slider state
  var currentBudget = rec.budgetMin;

  var overlay = document.createElement('div');
  overlay.id = 'boostModalOverlay';
  overlay.style.cssText =
    'position:fixed;inset:0;background:rgba(0,0,0,0.55);z-index:9950;' +
    'display:flex;align-items:center;justify-content:center;' +
    'font-family:var(--font,sans-serif);backdrop-filter:blur(4px);';
  overlay.onclick = function(e) { if (e.target === overlay) overlay.remove(); };

  overlay.innerHTML =
    '<div style="' +
      'background:#fff;border-radius:20px;padding:0;width:400px;max-width:calc(100vw - 32px);' +
      'box-shadow:0 24px 64px rgba(0,0,0,0.22);overflow:hidden;' +
    '">' +

    // ── Header ──
    '<div style="background:#791ADB;padding:20px 24px 18px;">' +
      '<div style="display:flex;align-items:center;gap:10px;margin-bottom:4px;">' +
        '<div>' +
          '<div style="font-size:16px;font-weight:700;color:#fff;">Boost Iklan</div>' +
          '<div style="font-size:12px;color:rgba(255,255,255,0.75);margin-top:1px;">' + rec.campName + '</div>' +
        '</div>' +
        '<button onclick="document.getElementById(\'boostModalOverlay\').remove()" ' +
          'style="margin-left:auto;background:rgba(255,255,255,0.15);border:none;border-radius:8px;' +
          'width:28px;height:28px;cursor:pointer;color:#fff;font-size:16px;display:flex;' +
          'align-items:center;justify-content:center;">✕</button>' +
      '</div>' +
    '</div>' +

    // ── Body ──
    '<div style="padding:20px 24px;">' +

      // Rekomendasi card
      '<div style="background:#f9fafb;border-radius:12px;padding:16px;margin-bottom:16px;">' +
        '<div style="font-size:11px;font-weight:700;color:#6b7280;letter-spacing:0.05em;margin-bottom:12px;">💡 REKOMENDASI RADAR</div>' +

        '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">' +
          _boostInfoItem('📍', 'Lokasi', rec.location + ', ' + rec.radius) +
          _boostInfoItem('👥', 'Audience', rec.audience) +
          _boostInfoItem('🎬', 'Format', rec.format) +
          _boostInfoItem('📱', 'Platform', rec.platform) +
          _boostInfoItem('⏰', 'Prime Time', rec.primeTime) +
          _boostInfoItem('📈', 'Est. Reach', rec.reachMin.toLocaleString('id-ID') + '–' + rec.reachMax.toLocaleString('id-ID') + ' orang') +
        '</div>' +
      '</div>' +

      // Budget slider
      '<div style="margin-bottom:20px;">' +
        '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">' +
          '<span style="font-size:12px;font-weight:700;color:#374151;">💰 Budget Harian</span>' +
          '<span id="boostBudgetLabel" style="font-size:14px;font-weight:700;color:#791ADB;">' + _formatRupiah(currentBudget) + '</span>' +
        '</div>' +
        '<input type="range" id="boostBudgetSlider" min="10000" max="500000" step="5000" value="' + currentBudget + '" ' +
          'style="width:100%;accent-color:#791ADB;height:4px;cursor:pointer;" ' +
          'oninput="document.getElementById(\'boostBudgetLabel\').textContent=\'Rp \'+parseInt(this.value).toLocaleString(\'id-ID\')">' +
        '<div style="display:flex;justify-content:space-between;font-size:10px;color:#9ca3af;margin-top:4px;">' +
          '<span>Rp 10.000</span><span>Rp 500.000</span>' +
        '</div>' +
      '</div>' +

      // Tombol
      '<div style="display:flex;gap:10px;">' +
        '<button onclick="_onBoostCopy()" ' +
          'style="flex:1;padding:11px;border-radius:12px;border:1.5px solid #111827;' +
          'background:#fff;color:#111827;font-size:13px;font-weight:700;cursor:pointer;' +
          'font-family:var(--font,sans-serif);transition:background 0.15s;" ' +
          'onmouseover="this.style.background=\'#f3f4f6\'" onmouseout="this.style.background=\'#fff\'">' +
          'Salin Rekomendasi' +
        '</button>' +
        '<button onclick="_onBoostOpen()" ' +
          'style="flex:1;padding:11px;border-radius:12px;border:none;' +
          'background:#111827;' +
          'color:#fff;font-size:13px;font-weight:700;cursor:pointer;' +
          'font-family:var(--font,sans-serif);transition:background 0.15s;" ' +
          'onmouseover="this.style.background=\'#374151\'" onmouseout="this.style.background=\'#111827\'">' +
          (rec.platformsRaw.indexOf('tiktok') !== -1 && rec.platformsRaw.indexOf('meta') === -1 && rec.platformsRaw.indexOf('ig') === -1
            ? 'Buka TikTok Ads'
            : 'Buka Meta Ads') +
        '</button>' +
      '</div>' +

      '<div style="text-align:center;margin-top:10px;font-size:10px;color:#9ca3af;">' +
        (rec.platformsRaw.indexOf('tiktok') !== -1 && rec.platformsRaw.indexOf('meta') === -1 && rec.platformsRaw.indexOf('ig') === -1
          ? 'TikTok Ads Manager perlu diisi manual · Salin rekomendasi di atas sebagai panduan'
          : 'Form Ads Manager perlu diisi manual · Salin rekomendasi di atas sebagai panduan') +
      '</div>' +

    '</div></div>';

  // Simpan rec di closure untuk diakses tombol
  overlay._boostRec = rec;
  document.body.appendChild(overlay);
}

function _boostInfoItem(icon, label, value) {
  return '<div style="background:#fff;border-radius:8px;padding:8px 10px;">' +
    '<div style="font-size:10px;color:#9ca3af;margin-bottom:2px;">' + icon + ' ' + label + '</div>' +
    '<div style="font-size:12px;font-weight:600;color:#111827;line-height:1.3;">' + value + '</div>' +
  '</div>';
}

function _onBoostCopy() {
  var overlay = document.getElementById('boostModalOverlay');
  if (overlay && overlay._boostRec) copyBoostRecommendation(overlay._boostRec);
}

function _onBoostOpen() {
  var overlay = document.getElementById('boostModalOverlay');
  if (overlay && overlay._boostRec) {
    copyBoostRecommendation(overlay._boostRec);
    setTimeout(function() { BOOST_HANDLER.run(overlay._boostRec); }, 600);
  }
}

window.showBoostModal        = showBoostModal;
window.copyBoostRecommendation = copyBoostRecommendation;
window.BOOST_HANDLER         = BOOST_HANDLER;
