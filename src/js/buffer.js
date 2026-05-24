// RADAR — buffer.js
// Social Media Integration via PostForMe.dev API v1
// Semua call ke PostForMe lewat Supabase Edge Function (tidak ada API key di browser)

/* ─── Platform SVG Logos ──────────────────────────────────── */
var _PFM_LOGOS = {
  instagram: '<svg viewBox="0 0 24 24" width="28" height="28" fill="#E1306C"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>',
  tiktok:    '<svg viewBox="0 0 24 24" width="28" height="28" fill="#010101"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.79 1.54V6.78a4.85 4.85 0 01-1.02-.09z"/></svg>',
  facebook:  '<svg viewBox="0 0 24 24" width="28" height="28" fill="#1877F2"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>',
  youtube:   '<svg viewBox="0 0 24 24" width="28" height="28" fill="#FF0000"><path d="M23.5 6.19a3 3 0 00-2.12-2.13C19.54 3.5 12 3.5 12 3.5s-7.54 0-9.38.56A3 3 0 00.5 6.19C0 8.03 0 12 0 12s0 3.97.5 5.81a3 3 0 002.12 2.12C4.46 20.5 12 20.5 12 20.5s7.54 0 9.38-.57a3 3 0 002.12-2.12C24 15.97 24 12 24 12s0-3.97-.5-5.81zM9.75 15.02V8.98L15.5 12l-5.75 3.02z"/></svg>'
};

var _PFM_COLORS = {
  instagram: '#E1306C',
  tiktok:    '#010101',
  facebook:  '#1877F2',
  youtube:   '#FF0000'
};

/* ─── User Identity ────────────────────────────────────────── */

function getUserExternalId() {
  var key = 'radar_session_id';

  // Fast path: cek cached profile dulu (synchronous, tidak butuh network)
  // getUserProfile() menyimpan postforme_external_id ke cache setiap login/load.
  // Ini memastikan external_id selalu konsisten dengan DB meski localStorage dihapus.
  try {
    var profile = JSON.parse(localStorage.getItem('radar_user_profile') || '{}');
    if (profile.postforme_external_id) {
      // Pastikan radar_session_id juga sinkron
      if (localStorage.getItem(key) !== profile.postforme_external_id) {
        localStorage.setItem(key, profile.postforme_external_id);
      }
      return profile.postforme_external_id;
    }
  } catch(e) {}

  // Fallback: pakai radar_session_id dari localStorage atau generate baru
  var id = localStorage.getItem(key);
  if (!id) {
    id = 'radar_user_' + Math.random().toString(36).slice(2, 10);
    localStorage.setItem(key, id);
  }
  return id;
}

/* ─── Supabase Proxy Helper ────────────────────────────────── */
// Semua call ke PostForMe melewati Edge Function ini
// API key PostForMe TIDAK ada di browser

async function _pfmProxy(endpoint, method, body) {
  var supabaseUrl = (typeof RADAR_CONFIG !== 'undefined') ? RADAR_CONFIG.SUPABASE_URL : '';
  var supabaseKey = (typeof RADAR_CONFIG !== 'undefined') ? RADAR_CONFIG.SUPABASE_ANON_KEY : '';

  var resp = await fetch(supabaseUrl + '/functions/v1/postforme-proxy', {
    method:  'POST',
    headers: {
      'Authorization': 'Bearer ' + supabaseKey,
      'Content-Type':  'application/json'
    },
    body: JSON.stringify(
      (method || 'GET') === 'DELETE'
        ? { endpoint: endpoint, method: 'DELETE' }          // DELETE: no body
        : { endpoint: endpoint, method: method || 'GET', body: body }
    )
  });

  if (!resp.ok) {
    var errText = await resp.text();
    throw new Error('Proxy ' + resp.status + ': ' + errText);
  }
  return resp.json();
}

/* ─── localStorage Helpers ─────────────────────────────────── */

function _getStoredAccounts() {
  try { return JSON.parse(localStorage.getItem('radar_social_accounts') || '[]'); }
  catch(e) { return []; }
}

/* ─── Status Check ─────────────────────────────────────────── */

function isBufferConnected() {
  return _getStoredAccounts().length > 0;
}
window.isBufferConnected = isBufferConnected;

/**
 * isPlatformAccountConnected(channel)
 * Cek apakah akun untuk platform SPESIFIK sudah terhubung.
 * channel: 'instagram' | 'meta' | 'tiktok' | 'youtube'
 */
function isPlatformAccountConnected(channel) {
  var accounts = _getStoredAccounts();
  if (!accounts.length) return false;
  var channelToPlatform = {
    instagram: 'instagram',
    meta:      'facebook',
    tiktok:    'tiktok',
    youtube:   'youtube',
  };
  var targetPlatform = channelToPlatform[channel];
  if (!targetPlatform) return accounts.length > 0;
  return accounts.some(function(a) { return a.platform === targetPlatform; });
}
window.isPlatformAccountConnected = isPlatformAccountConnected;

/* ─── Header Indicator ─────────────────────────────────────── */

function updateBufferIndicator() {
  renderConnectChannels();
  var el = document.getElementById('bufferIndicator');
  if (el) el.innerHTML = '';
}

/* ─── Channel Chip Usernames ───────────────────────────────── */

function updateChannelChipsWithUsername() {
  var accounts = _getStoredAccounts();
  var platMap  = { instagram: 'ig', tiktok: 'tiktok', facebook: 'meta', youtube: 'youtube' };
  document.querySelectorAll('.chip-channel').forEach(function(chip) {
    var chipPlat = chip.getAttribute('data-platform') || '';
    var match = null;
    accounts.forEach(function(a) {
      if (platMap[a.platform] === chipPlat || a.platform === chipPlat) match = a;
    });
    var existing = chip.querySelector('.ch-username');
    if (match) {
      if (!existing) {
        existing = document.createElement('div');
        existing.className = 'ch-username';
        existing.style.cssText = 'font-size:9px;color:#9ca3af;margin-top:2px;text-align:center;';
        var label = chip.querySelector('.ch-label');
        if (label) label.insertAdjacentElement('afterend', existing);
        else chip.appendChild(existing);
      }
      existing.textContent = '@' + (match.username || match.id);
    } else if (existing) {
      existing.remove();
    }
  });
}

/* ─── Fetch Username dari PostForMe (background) ──────────── */

async function _fetchConnectedAccounts() {
  try {
    var externalId = getUserExternalId();
    var data = await _pfmProxy('/v1/social-accounts?external_id=' + encodeURIComponent(externalId), 'GET', null);

    var list = data.data || data.accounts || (Array.isArray(data) ? data : []);
    if (!list.length) return;

    // Hanya update username untuk akun yang SUDAH ada di localStorage user ini
    // (jangan tambah akun dari user lain)
    var existing = _getStoredAccounts();
    var changed  = false;

    list.forEach(function(a) {
      var apiPlatform = (a.platform || '').toLowerCase();
      var apiUsername = a.username || a.handle || a.name || '';
      var apiId       = a.id || '';

      // Cari akun yang cocok — prioritaskan by ID (exact match)
      // Jangan update akun berbeda hanya karena platform sama (cegah akun lama overwrite akun baru)
      var idx = -1;
      for (var i = 0; i < existing.length; i++) {
        if (apiId && existing[i].id === apiId) { idx = i; break; } // ID exact match
      }
      if (idx === -1) {
        // Fallback: match by platform HANYA jika stored account belum punya real ID
        for (var i = 0; i < existing.length; i++) {
          var fakePat2 = /^pfm_[a-z]+_\d+$/;
          if (existing[i].platform === apiPlatform && (!existing[i].id || fakePat2.test(existing[i].id))) {
            idx = i; break;
          }
        }
      }
      if (idx === -1) return; // bukan akun user ini, skip

      // Selalu update ID jika API mengembalikan ID real (bukan placeholder)
      if (apiId && existing[idx].id !== apiId) {
        existing[idx].id = apiId;
        changed = true;
      }

      if (apiUsername && existing[idx].username !== apiUsername) {
        existing[idx].username = apiUsername;
        changed = true;

        // Update badge di modal kalau masih terbuka
        var btn = document.getElementById('pfm-btn-' + apiPlatform);
        if (btn) {
          var badge = btn.querySelector('span:last-child');
          if (badge) { badge.textContent = '✓ @' + apiUsername; }
        }
      }

      // Debug: log full object untuk lihat field yang tersedia
      console.log('[postforme] raw account data:', JSON.stringify(a));

      // Field yang benar dari PostForMe API: profile_photo_url
      var apiAvatarUrl = a.profile_photo_url
                       || a.profile_picture_url || a.picture || a.avatar
                       || a.profile_image_url   || a.photo_url || a.image_url
                       || a.profile_photo       || a.profile_pic
                       || (a.user && (a.user.profile_picture_url || a.user.picture))
                       || '';
      if (apiAvatarUrl && !existing[idx].avatar_url) {
        existing[idx].avatar_url = apiAvatarUrl;
        changed = true;
      }
    });

    if (changed) {
      localStorage.setItem('radar_social_accounts', JSON.stringify(existing));
      
      // SINKRONISASI KE DATABASE (Agar permanen)
      if (typeof window.syncSocialAccounts === 'function') {
        window.syncSocialAccounts();
      }

      updateBufferIndicator();
      updateChannelChipsWithUsername();
    }
  } catch(e) {
    console.warn('[postforme] _fetchConnectedAccounts error:', e.message);
  }
}

/* ─── Sync & tambah akun dari PostForMe (untuk kasus already-connected) ── */
// Dipanggil saat PostForMe mengembalikan isSuccess=false.
// Ambil semua connected accounts dari API, cari yang platformnya cocok,
// lalu simpan ke localStorage dan update UI.
// Returns: true jika akun ditemukan & ditambahkan, false jika tidak ada.
async function _syncAndAddAccount(platform) {
  try {
    var externalId = getUserExternalId();
    var data = await _pfmProxy('/v1/social-accounts?external_id=' + encodeURIComponent(externalId), 'GET', null);
    var list = data.data || data.accounts || (Array.isArray(data) ? data : []);

    // Cari akun yang platform-nya cocok
    var match = null;
    for (var i = 0; i < list.length; i++) {
      var apiPlatform = (list[i].platform || list[i].provider || '').toLowerCase();
      if (apiPlatform === platform || apiPlatform.startsWith(platform)) {
        // Ambil yang statusnya connected, atau yang pertama kalau tidak ada info status
        if (!match || list[i].status === 'connected') { match = list[i]; }
      }
    }

    if (!match) {
      console.log('[postforme] _syncAndAddAccount: tidak ada akun', platform, 'di PostForMe');
      return false;
    }

    var accountId  = match.id || match.account_id || '';
    var username   = match.username || match.handle || match.name || '';
    var avatarUrl  = match.profile_photo_url || match.profile_picture_url
                   || match.picture || match.avatar || match.image_url || '';

    console.log('[postforme] _syncAndAddAccount: found', platform, accountId, username);
    _saveAndUpdateUI(platform, accountId, username, avatarUrl);
    if (typeof showAnToast === 'function') showAnToast('Akun ' + platform + ' berhasil disinkronkan!', 'success');
    return true;
  } catch(e) {
    console.warn('[postforme] _syncAndAddAccount error:', e.message);
    return false;
  }
}

/* ─── Simpan akun & update UI seketika ────────────────────── */

function _saveAndUpdateUI(platform, accountId, username, avatarUrl) {
  var accounts = _getStoredAccounts();
  accounts = accounts.filter(function(a) { return a.platform !== platform; });
  accounts.push({ id: accountId, platform: platform, username: username || '', avatar_url: avatarUrl || '' });
  localStorage.setItem('radar_social_accounts', JSON.stringify(accounts));

  // Update tombol di modal
  var btn = document.getElementById('pfm-btn-' + platform);
  if (btn) {
    var badge = btn.querySelector('span:last-child');
    if (badge) {
      badge.textContent    = username ? '✓ @' + username : '✓ Terhubung';
      badge.style.background = '#f3f4f6';
      badge.style.color    = '#374151';
    }
    btn.style.border     = '1.5px solid #e5e7eb';
    btn.style.background = '#f9fafb';
    btn.disabled = false;
    btn.onclick  = function() { _disconnectAccount(platform); };
  }

  // Update header pill & channel chips
  updateBufferIndicator();
  updateChannelChipsWithUsername();

  // Hapus warning bar bawah kalau ada
  var warn = document.getElementById('socialWarning');
  if (warn) warn.remove();

  // Tutup modal otomatis setelah 1.8 detik
  setTimeout(function() { _closePfmModal(); }, 1800);

  if (typeof showAnToast === 'function') showAnToast('Akun ' + platform + ' berhasil terhubung!', 'success');

  // SINKRONISASI KE DATABASE (Agar permanen)
  if (typeof window.syncSocialAccounts === 'function') {
    window.syncSocialAccounts();
  }
}

/* ─── Connect via OAuth ────────────────────────────────────── */

async function connectPostForMe(platform) {
  var btn = document.getElementById('pfm-btn-' + platform);
  if (btn) {
    btn.querySelector('span:last-child').textContent = 'Memproses...';
    btn.disabled = true;
  }

  try {
    var supabaseUrl = (typeof RADAR_CONFIG !== 'undefined') ? RADAR_CONFIG.SUPABASE_URL : '';
    var supabaseKey = (typeof RADAR_CONFIG !== 'undefined') ? RADAR_CONFIG.SUPABASE_ANON_KEY : '';
    var redirectUri = window.location.origin + '/postforme-callback';
    var externalId  = getUserExternalId();

    // Cek akun lama untuk disconnect paralel
    var _existingAccs = _getStoredAccounts();
    var _existingAcc  = _existingAccs.filter(function(a){ return a.platform === platform; })[0];
    // Hapus dari localStorage segera (sebelum popup — hindari duplikat)
    if (_existingAcc) {
      var _remaining = _existingAccs.filter(function(a){ return a.platform !== platform; });
      localStorage.setItem('radar_social_accounts', JSON.stringify(_remaining));
    }

    // Disconnect akun lama secara paralel (tidak blocking popup)
    // window.open() harus tetap dipanggil synchronous dari user gesture
    var _disconnectPromise = null;
    if (_existingAcc && _existingAcc.id && !/^pfm_[a-z]+_\d+$/.test(_existingAcc.id)) {
      console.log('[postforme] disconnect paralel dimulai:', _existingAcc.id);
      _disconnectPromise = _pfmProxy('/v1/social-accounts/' + _existingAcc.id, 'DELETE', {})
        .then(function() { console.log('[postforme] disconnect paralel selesai'); })
        .catch(function(e) { console.warn('[postforme] disconnect paralel gagal:', e.message); });
    }

    // Buka popup SEBELUM await — browser hanya izinkan window.open() dari user gesture langsung
    // Jika dibuka setelah await, browser anggap bukan user gesture → popup diblokir
    var popup = window.open('about:blank', 'postforme_oauth', 'width=600,height=700,left=200,top=80');
    // Tunggu disconnect selesai SETELAH popup dibuka (popup sudah aman terbuka)
    if (_disconnectPromise) await _disconnectPromise;

    var resp = await fetch(supabaseUrl + '/functions/v1/postforme-auth', {
      method:  'POST',
      headers: {
        'Authorization': 'Bearer ' + supabaseKey,
        'Content-Type':  'application/json'
      },
      body: JSON.stringify({
        platform: platform,
        redirect_uri: redirectUri,
        external_id: externalId,
        scopes: platform === 'instagram'
          ? ['instagram_basic', 'instagram_content_publish', 'instagram_manage_insights', 'instagram_manage_comments', 'pages_read_engagement']
          : undefined
      })
    });

    if (!resp.ok) {
      var errText = await resp.text();
      if (popup) popup.close();
      throw new Error('Edge Function error ' + resp.status + ': ' + errText);
    }

    var data    = await resp.json();
    var authUrl = data.url || data.auth_url || data.redirect_url || data.authorization_url;
    if (!authUrl) {
      if (popup) popup.close();
      throw new Error('Tidak ada URL OAuth dari PostForMe');
    }

    // Navigate popup ke auth URL yang sudah dapat
    if (popup) {
      popup.location.href = authUrl;
    } else {
      // Popup sudah diblokir saat about:blank pun — fallback
      window.open(authUrl, 'postforme_oauth', 'width=600,height=700,left=200,top=80');
    }

    // Listen postMessage dari callback page (selalu same-origin setelah redirect fix)
    var msgHandler = function(event) {
      if (event.origin !== window.location.origin) return;
      if (!event.data) return;

      // ── Resync: isSuccess=false → akun sudah ada di PostForMe, sync ulang ──
      if (event.data.type === 'postforme_oauth_resync') {
        window.removeEventListener('message', msgHandler);
        clearInterval(poll);
        console.log('[postforme] resync triggered for platform:', platform);

        // Jika sudah ada akun dengan ID real untuk platform ini,
        // jangan timpa dengan placeholder — cukup refresh UI.
        var _fakePat = /^pfm_[a-z]+_\d+$/;
        var _stored  = _getStoredAccounts();
        var _existing = _stored.filter(function(a) { return a.platform === platform; })[0];
        if (_existing && _existing.id && !_fakePat.test(_existing.id)) {
          console.log('[postforme] resync: akun sudah valid, skip placeholder');
          updateBufferIndicator();
          updateChannelChipsWithUsername();
          setTimeout(function() { _closePfmModal(); }, 1800);
          if (typeof showAnToast === 'function') showAnToast('Akun ' + platform + ' berhasil terhubung!', 'success');
          return;
        }

        // Belum ada ID real → simpan placeholder & coba fetch
        var tempId = 'pfm_' + platform + '_' + Date.now();
        _saveAndUpdateUI(platform, tempId, null);
        setTimeout(function() { _fetchConnectedAccounts(); }, 800);
        return;
      }

      if (event.data.type !== 'postforme_oauth_success') return;
      window.removeEventListener('message', msgHandler);
      clearInterval(poll);

      // ── DEBUG LOGGING LENGKAP — jangan hapus sampai struktur OAuth jelas ──
      console.log('[postforme] ===== OAuth callback diterima =====');
      console.log('[postforme] event.origin:', event.origin);
      console.log('[postforme] event.data (raw):', event.data);
      try {
        console.log('[postforme] event.data (JSON):', JSON.stringify(event.data, null, 2));
      } catch(jsonErr) {
        console.log('[postforme] event.data tidak bisa di-JSON.stringify:', jsonErr.message);
      }
      console.log('[postforme] event.data keys:', Object.keys(event.data || {}));

      // Log semua field yang mungkin berisi accountId
      var _d = event.data || {};
      console.log('[postforme] field check:',{
        type:           _d.type,
        accountIds:     _d.accountIds,
        account_ids:    _d.account_ids,
        accountId:      _d.accountId,
        account_id:     _d.account_id,
        id:             _d.id,
        accounts:       _d.accounts,
        data:           _d.data,
        payload:        _d.payload,
        social_account: _d.social_account,
        social_accounts:_d.social_accounts,
        user:           _d.user,
        token:          _d.token,
        access_token:   _d.access_token
      });
      console.log('[postforme] ==========================================');

      // Coba extract accountId dari semua kemungkinan field
      var accountIds = _d.accountIds
                    || _d.account_ids
                    || (_d.accounts && _d.accounts.map(function(a){ return a.id || a; }))
                    || (_d.data && _d.data.accountIds)
                    || (_d.data && _d.data.account_ids)
                    || (_d.payload && _d.payload.accountIds)
                    || [];
      var accountId  = accountIds[0]
                    || _d.accountId
                    || _d.account_id
                    || _d.id
                    || null;

      console.log('[postforme] accountId extracted:', accountId, '| accountIds:', accountIds);

      if (!accountId) {
        // FALLBACK: simpan dengan ID sementara agar user bisa tetap pakai app
        // ID ini akan terdeteksi sebagai fake oleh fakePat = /^pfm_[a-z]+_\d+$/
        // dan ditandai warning di UI — tapi publish tetap bisa dicoba
        var fallbackId = 'pfm_' + platform + '_' + Date.now();
        console.warn('[postforme] accountId tidak ditemukan — pakai fallback sementara:', fallbackId);
        console.warn('[postforme] PERLU CEK: struktur response OAuth PostForMe di log di atas');
        _saveAndUpdateUI(platform, fallbackId, null);
      } else {
        _saveAndUpdateUI(platform, accountId, null);
      }

      // Fetch username real di background (juga log raw response untuk debug)
      _fetchConnectedAccounts();
    };
    window.addEventListener('message', msgHandler);

    // Fallback poll — jika popup ditutup manual
    var poll = setInterval(function() {
      if (!popup || popup.closed) {
        clearInterval(poll);
        window.removeEventListener('message', msgHandler);
        _fetchConnectedAccounts();
      }
    }, 800);
    setTimeout(function() { clearInterval(poll); window.removeEventListener('message', msgHandler); }, 600000);

  } catch(e) {
    console.error('[postforme] connectPostForMe error:', e.message);
    if (typeof showAnToast === 'function') showAnToast('⚠ Gagal konek: ' + e.message);
    if (btn) {
      btn.querySelector('span:last-child').textContent = 'Hubungkan';
      btn.disabled = false;
    }
  }
}

/* ─── Render Connect Channels section ─────────────────────── */

function renderConnectChannels() {
  var row        = document.getElementById('connectedAvatarsRow');
  var settingsBtn= document.getElementById('connectSettingsBtn');
  if (!row) return;

  var accounts = _getStoredAccounts();

  // Hapus avatar lama (bukan tombol +)
  row.querySelectorAll('.connected-avatar-wrap').forEach(function(el) { el.remove(); });

  var colors = { instagram:'#E1306C', tiktok:'#010101', facebook:'#1877F2', youtube:'#FF0000' };
  var badgeSVG = {
    instagram: '<svg viewBox="0 0 24 24" fill="white" width="12" height="12"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>',
    tiktok: '<svg viewBox="0 0 24 24" fill="white" width="12" height="12"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.79 1.54V6.78a4.85 4.85 0 01-1.02-.09z"/></svg>',
    facebook: '<svg viewBox="0 0 24 24" fill="white" width="12" height="12"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>',
    youtube: '<svg viewBox="0 0 24 24" fill="white" width="12" height="12"><path d="M23.5 6.19a3 3 0 00-2.12-2.13C19.54 3.5 12 3.5 12 3.5s-7.54 0-9.38.56A3 3 0 00.5 6.19C0 8.03 0 12 0 12s0 3.97.5 5.81a3 3 0 002.12 2.12C4.46 20.5 12 20.5 12 20.5s7.54 0 9.38-.57a3 3 0 002.12-2.12C24 15.97 24 12 24 12s0-3.97-.5-5.81zM9.75 15.02V8.98L15.5 12l-5.75 3.02z"/></svg>'
  };

  // Set row style DULU sebelum loop
  if (row) row.style.cssText = 'display:flex;gap:12px;align-items:center;flex-wrap:wrap;';

  var fakePat = /^pfm_[a-z]+_\d+$/;

  accounts.forEach(function(acc) {
    var isInvalid = !acc.id || fakePat.test(acc.id);
    var color     = isInvalid ? '#f59e0b' : (colors[acc.platform] || '#791ADB');
    var borderCol = isInvalid ? '#f59e0b' : color;
    var titleText = isInvalid
      ? '⚠ ' + acc.platform + ' belum terhubung dengan benar — klik untuk hubungkan ulang'
      : '@' + (acc.username || acc.platform);

    var wrap = document.createElement('div');
    wrap.className = 'connected-avatar-wrap';
    wrap.title = titleText;
    wrap.style.cssText = 'position:relative;flex-shrink:0;cursor:pointer;width:56px;height:56px;';

    var box = document.createElement('div');
    box.style.cssText = 'width:56px;height:56px;border-radius:14px;' +
      'border:2.5px solid ' + borderCol + ';background:white;' +
      'display:flex;align-items:center;justify-content:center;overflow:hidden;';

    if (!isInvalid && acc.avatar_url) {
      var img = document.createElement('img');
      img.src = acc.avatar_url;
      img.alt = acc.username || acc.platform;
      img.style.cssText = 'width:100%;height:100%;object-fit:cover;';
      img.onerror = function() {
        box.removeChild(img);
        box.style.background = color + '18';
        box.style.fontSize = '20px';
        box.style.fontWeight = '700';
        box.style.color = color;
        box.textContent = (acc.username || acc.platform).charAt(0).toUpperCase();
      };
      box.appendChild(img);
    } else {
      box.style.background = isInvalid ? '#fef3c7' : (color + '18');
      box.style.fontSize   = isInvalid ? '18px' : '20px';
      box.style.fontWeight = '700';
      box.style.color      = color;
      box.textContent      = isInvalid ? '⚠' : (acc.username || acc.platform).charAt(0).toUpperCase();
    }
    wrap.appendChild(box);

    // Badge: platform icon (hijau) atau warning (kuning)
    var badge = document.createElement('div');
    if (isInvalid) {
      badge.style.cssText = 'position:absolute;bottom:-3px;right:-3px;' +
        'width:20px;height:20px;border-radius:50%;background:#f59e0b;' +
        'display:flex;align-items:center;justify-content:center;border:2px solid white;' +
        'font-size:11px;line-height:1;';
      badge.textContent = '!';
      // Klik → langsung buka reconnect
      wrap.onclick = function() { connectPostForMe(acc.platform); };
    } else {
      badge.style.cssText = 'position:absolute;bottom:-3px;right:-3px;' +
        'width:20px;height:20px;border-radius:50%;background:' + color + ';' +
        'display:flex;align-items:center;justify-content:center;border:2px solid white;';
      badge.innerHTML = badgeSVG[acc.platform] || '';
    }
    wrap.appendChild(badge);

    var addBtn = document.getElementById('addChannelBtn');
    row.insertBefore(wrap, addBtn);
  });

  var addBtn = document.getElementById('addChannelBtn');
  if (addBtn) {
    var isFull = accounts.length >= 4;
    addBtn.style.cssText =
      'width:56px;height:56px;border-radius:14px;' +
      'border:2px dashed ' + (isFull ? '#e5e7eb' : '#d1d5db') + ';' +
      'background:' + (isFull ? '#f9fafb' : 'white') + ';' +
      'display:flex;align-items:center;justify-content:center;' +
      'cursor:' + (isFull ? 'not-allowed' : 'pointer') + ';' +
      'flex-shrink:0;transition:border-color .2s,background .2s;' +
      'padding:0;opacity:' + (isFull ? '0.4' : '1') + ';';
    addBtn.innerHTML =
      '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" ' +
      'stroke="#9ca3af" stroke-width="2" stroke-linecap="round">' +
      '<line x1="12" y1="5" x2="12" y2="19"/>' +
      '<line x1="5" y1="12" x2="19" y2="12"/></svg>';
    addBtn.onclick     = isFull ? null : function() { showConnectAccountsFlow(); };
    addBtn.onmouseenter = isFull ? null : function() {
      addBtn.style.borderColor = '#791ADB';
      addBtn.style.background  = 'rgba(121,26,219,0.04)';
      addBtn.querySelector('svg').setAttribute('stroke', '#791ADB');
    };
    addBtn.onmouseleave = isFull ? null : function() {
      addBtn.style.borderColor = '#d1d5db';
      addBtn.style.background  = 'white';
      addBtn.querySelector('svg').setAttribute('stroke', '#9ca3af');
    };
  }

  // Tampilkan/sembunyikan settings icon
  if (settingsBtn) settingsBtn.style.display = accounts.length ? 'flex' : 'none';
}

/* ─── Modal Kelola (Disconnect) Akun Terhubung ─────────────── */

function showManageChannelsModal() {
  if (document.getElementById('pfmModalOverlay')) { _closePfmModal(); return; }

  var accounts = _getStoredAccounts();
  if (!accounts.length) return;

  var overlay = document.createElement('div');
  overlay.id = 'pfmModalOverlay';
  overlay.style.cssText =
    'position:fixed;inset:0;z-index:9990;background:rgba(0,0,0,0.45);' +
    'display:flex;align-items:center;justify-content:center;';
  overlay.onclick = function(e) { if (e.target === overlay) _closePfmModal(); };

  var card = document.createElement('div');
  card.style.cssText =
    'background:white;border-radius:20px;padding:28px 24px;width:360px;max-width:90vw;' +
    'box-shadow:0 20px 60px rgba(0,0,0,0.25);font-family:var(--font,sans-serif);' +
    'animation:pfmFadeIn 0.2s ease;';

  var _PFM_COLORS_LOCAL = { instagram:'#E1306C', tiktok:'#010101', facebook:'#1877F2', youtube:'#FF0000' };
  var platLabel = { instagram:'Instagram', tiktok:'TikTok', facebook:'Facebook', youtube:'YouTube' };

  card.innerHTML =
    '<style>@keyframes pfmFadeIn{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:none}}</style>' +
    '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:20px;">' +
      '<div>' +
        '<div style="font-size:16px;font-weight:700;color:#111827;">Kelola Akun Terhubung</div>' +
        '<div style="font-size:12px;color:#9ca3af;margin-top:2px;">Pilih akun untuk diputuskan</div>' +
      '</div>' +
      '<button onclick="_closePfmModal()" style="background:none;border:none;cursor:pointer;' +
        'width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;' +
        'color:#9ca3af;font-size:18px;line-height:1;">✕</button>' +
    '</div>' +
    accounts.map(function(acc) {
      var color = _PFM_COLORS_LOCAL[acc.platform] || '#6b7280';
      var logo  = _PFM_LOGOS[acc.platform] || '';
      var label = platLabel[acc.platform] || acc.platform;
      return '<div style="display:flex;align-items:center;gap:14px;padding:12px 16px;' +
        'margin-bottom:10px;border:1.5px solid #e5e7eb;border-radius:12px;' +
        'background:#f9fafb;">' +
        '<div style="width:40px;height:40px;border-radius:10px;background:' +
          (acc.platform === 'tiktok' ? '#f0f0f0' : color + '18') +
          ';display:flex;align-items:center;justify-content:center;flex-shrink:0;">' +
          logo + '</div>' +
        '<div style="flex:1;">' +
          '<div style="font-size:14px;font-weight:600;color:#111827;">' + label + '</div>' +
          '<div style="font-size:12px;color:#6b7280;">@' + (acc.username || acc.id) + '</div>' +
        '</div>' +
        '<button onclick="_disconnectAccount(\'' + acc.platform + '\')" ' +
          'style="font-size:11px;font-weight:600;padding:5px 12px;border-radius:20px;' +
          'border:1.5px solid #fca5a5;background:#fff5f5;color:#dc2626;cursor:pointer;' +
          'font-family:var(--font,sans-serif);transition:all .15s;"' +
          'onmouseenter="this.style.background=\'#dc2626\';this.style.color=\'#fff\'"' +
          'onmouseleave="this.style.background=\'#fff5f5\';this.style.color=\'#dc2626\'">' +
          'Disconnect</button>' +
        '</div>';
    }).join('');

  overlay.appendChild(card);
  document.body.appendChild(overlay);
}

/* ─── Modal Hubungkan Akun (centered, dengan logo) ────────── */

function showConnectAccountsFlow() {
  if (document.getElementById('pfmModalOverlay')) {
    _closePfmModal(); return;
  }

  var storedAccounts = _getStoredAccounts();
  var connectedMap   = {};
  storedAccounts.forEach(function(a) { connectedMap[a.platform] = a; });

  var platforms = [
    { id: 'facebook',  label: 'Facebook'  },
    { id: 'instagram', label: 'Instagram' },
    { id: 'tiktok',    label: 'TikTok'    },
    { id: 'youtube',   label: 'YouTube'   }
  ];

  var overlay = document.createElement('div');
  overlay.id = 'pfmModalOverlay';
  overlay.style.cssText =
    'position:fixed;inset:0;z-index:9990;background:rgba(0,0,0,0.45);' +
    'display:flex;align-items:center;justify-content:center;';
  overlay.onclick = function(e) { if (e.target === overlay) _closePfmModal(); };

  var card = document.createElement('div');
  card.style.cssText =
    'background:white;border-radius:20px;padding:28px 24px;width:360px;max-width:90vw;' +
    'box-shadow:0 20px 60px rgba(0,0,0,0.25);font-family:var(--font,sans-serif);' +
    'animation:pfmFadeIn 0.2s ease;';

  card.innerHTML =
    '<style>' +
    '@keyframes pfmFadeIn{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:none}}' +
    '#pfmModalOverlay .pfm-platform-btn{-webkit-appearance:none;appearance:none;outline:none!important;box-shadow:none;}' +
    '#pfmModalOverlay .pfm-platform-btn:hover{background:#efefef!important;box-shadow:0 2px 8px rgba(0,0,0,0.09)!important;outline:none!important;}' +
    '#pfmModalOverlay .pfm-platform-btn:focus{outline:none!important;background:#efefef!important;}' +
    '#pfmModalOverlay .pfm-platform-btn:active{background:#e5e5e5!important;box-shadow:none!important;}' +
    '</style>' +
    '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:20px;">' +
    '<div>' +
    '<div style="font-size:16px;font-weight:700;color:#111827;">Hubungkan Akun Sosial</div>' +
    '<div style="font-size:12px;color:#9ca3af;margin-top:2px;">via PostForMe.dev · OAuth aman</div>' +
    '</div>' +
    '<button onclick="_closePfmModal()" style="background:none;border:none;cursor:pointer;' +
    'width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;' +
    'color:#9ca3af;font-size:18px;line-height:1;outline:none;">✕</button>' +
    '</div>' +
    platforms.map(function(p) {
      var acc    = connectedMap[p.id];
      var isConn = !!acc;
      var color  = _PFM_COLORS[p.id] || '#6b7280';
      var logo   = _PFM_LOGOS[p.id]  || '';
      var badge  = isConn
        ? ('✓ @' + (acc.username || acc.id))
        : 'Hubungkan';
      var _bgDefault = isConn ? '#f9fafb' : '#fafafa';
      return '<button id="pfm-btn-' + p.id + '" class="pfm-platform-btn" ' +
        'onclick="' + (isConn ? '_disconnectAccount(\'' + p.id + '\')' : 'connectPostForMe(\'' + p.id + '\')') + '" ' +
        'style="display:flex;align-items:center;gap:14px;width:100%;padding:12px 16px;' +
        'margin-bottom:10px;border:1.5px solid ' + (isConn ? '#e5e7eb' : '#f0f0f0') + ';' +
        'border-radius:12px;background:' + _bgDefault + ';' +
        'cursor:pointer;font-family:var(--font,sans-serif);transition:background 0.15s,box-shadow 0.15s;' +
        'outline:none;-webkit-appearance:none;appearance:none;">' +
        '<div style="width:40px;height:40px;border-radius:10px;background:' +
        (p.id === 'tiktok' ? '#f0f0f0' : color + '18') +
        ';display:flex;align-items:center;justify-content:center;flex-shrink:0;">' +
        logo + '</div>' +
        '<span style="flex:1;font-size:14px;font-weight:600;color:#111827;text-align:left;">' + p.label + '</span>' +
        '<span style="font-size:11px;font-weight:500;padding:4px 10px;border-radius:20px;' +
        'background:' + (isConn ? '#f3f4f6' : '#f0f0f0') + ';' +
        'color:' + (isConn ? '#374151' : '#6b7280') + ';">' + badge + '</span>' +
        '</button>';
    }).join('');

  overlay.appendChild(card);
  document.body.appendChild(overlay);
}

function _closePfmModal() {
  var overlay = document.getElementById('pfmModalOverlay');
  if (overlay) overlay.remove();
  var panel = document.getElementById('connectPanel');
  if (panel) panel.remove();
}

function _disconnectAccount(platform) {
  var accounts = _getStoredAccounts();
  var acc = accounts.filter(function(a){ return a.platform === platform; })[0];
  if (!acc) return;

  var platLabel = { instagram:'Instagram', tiktok:'TikTok', facebook:'Facebook', youtube:'YouTube' };

  var old = document.getElementById('disconnectModal');
  if (old) old.remove();

  var overlay = document.createElement('div');
  overlay.id = 'disconnectModal';
  overlay.style.cssText = 'position:fixed;inset:0;z-index:99999;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;font-family:var(--font,sans-serif);';

  var PFM_LOGOS = {
    instagram: '<svg viewBox="0 0 24 24" width="32" height="32" fill="#E1306C"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>',
    facebook: '<svg viewBox="0 0 24 24" width="32" height="32" fill="#1877F2"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>',
    tiktok: '<svg viewBox="0 0 24 24" width="32" height="32" fill="#010101"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.79 1.54V6.78a4.85 4.85 0 01-1.02-.09z"/></svg>',
    youtube: '<svg viewBox="0 0 24 24" width="32" height="32" fill="#FF0000"><path d="M23.5 6.19a3 3 0 00-2.12-2.13C19.54 3.5 12 3.5 12 3.5s-7.54 0-9.38.56A3 3 0 00.5 6.19C0 8.03 0 12 0 12s0 3.97.5 5.81a3 3 0 002.12 2.12C4.46 20.5 12 20.5 12 20.5s7.54 0 9.38-.57a3 3 0 002.12-2.12C24 15.97 24 12 24 12s0-3.97-.5-5.81zM9.75 15.02V8.98L15.5 12l-5.75 3.02z"/></svg>'
  };

  var logo = PFM_LOGOS[platform] || '';
  var name = acc.username || acc.id;
  var label = platLabel[platform] || platform;

  overlay.innerHTML =
    '<div style="background:white;border-radius:16px;padding:32px 28px;' +
    'width:480px;max-width:90vw;box-shadow:0 20px 60px rgba(0,0,0,0.2);">' +
      '<div style="font-size:18px;font-weight:700;color:#111;margin-bottom:20px;">' +
        'Disconnect ' + name + '</div>' +
      '<div style="border:1px solid #e5e7eb;border-radius:12px;padding:14px 16px;' +
        'display:flex;align-items:center;gap:14px;margin-bottom:20px;">' +
        '<div style="position:relative;width:48px;height:48px;flex-shrink:0;">' +
          '<div style="width:48px;height:48px;border-radius:10px;background:#f3f4f6;' +
            'display:flex;align-items:center;justify-content:center;">' + logo + '</div>' +
        '</div>' +
        '<div>' +
          '<div style="font-size:15px;font-weight:600;color:#111;">' + name + '</div>' +
          '<div style="font-size:13px;color:#6b7280;">' + label + ' Professional Account</div>' +
        '</div>' +
      '</div>' +
      '<div style="font-size:14px;color:#374151;line-height:1.6;margin-bottom:20px;">' +
        'Kamu tidak akan bisa lagi memposting ke akun ini. Semua postingan, analitik, tag, ' +
        'dan data yang terkait akan dihapus secara permanen. ' +
        '<strong>Tindakan ini tidak bisa dibatalkan.</strong></div>' +
      '<div style="font-size:13px;font-weight:600;color:#374151;margin-bottom:8px;">' +
        'Ketik "disconnect" untuk konfirmasi.</div>' +
      '<input id="disconnectInput" type="text" placeholder="disconnect" ' +
        'style="width:100%;padding:10px 14px;border:1px solid #d1d5db;' +
        'border-radius:8px;font-size:14px;box-sizing:border-box;margin-bottom:20px;' +
        'font-family:var(--font,sans-serif);outline:none;">' +
      '<div style="display:flex;gap:10px;justify-content:flex-end;">' +
        '<button onclick="document.getElementById(\'disconnectModal\').remove()" ' +
          'style="padding:10px 24px;border-radius:8px;border:2px solid #791ADB;' +
          'background:white;color:#791ADB;font-size:14px;font-weight:600;cursor:pointer;' +
          'font-family:var(--font,sans-serif);">Batal</button>' +
        '<button id="disconnectConfirmBtn" disabled ' +
          'onclick="_confirmDisconnect(\'' + platform + '\',\'' + (acc.id || '') + '\')" ' +
          'style="padding:10px 24px;border-radius:8px;border:none;' +
          'background:#d1d5db;color:#9ca3af;font-size:14px;font-weight:600;' +
          'cursor:not-allowed;font-family:var(--font,sans-serif);">' +
          'Putuskan Akun</button>' +
      '</div>' +
    '</div>';

  document.body.appendChild(overlay);

  var input = document.getElementById('disconnectInput');
  var btn = document.getElementById('disconnectConfirmBtn');
  input.addEventListener('input', function() {
    var ok = input.value.toLowerCase() === 'disconnect';
    btn.disabled = !ok;
    btn.style.background = ok ? '#dc2626' : '#d1d5db';
    btn.style.color = ok ? 'white' : '#9ca3af';
    btn.style.cursor = ok ? 'pointer' : 'not-allowed';
  });
  overlay.onclick = function(e) {
    if (e.target === overlay) overlay.remove();
  };
}

/* ─── Eksekusi disconnect yang benar: hapus dari localStorage + PostForMe + Supabase ── */
async function _confirmDisconnect(platform, accId) {
  // 1. Tutup modal segera → UI responsif
  var modal = document.getElementById('disconnectModal');
  if (modal) modal.remove();
  _closePfmModal();

  // 2. Hapus dari localStorage
  var accs = _getStoredAccounts().filter(function(a) { return a.platform !== platform; });
  localStorage.setItem('radar_social_accounts', JSON.stringify(accs));
  updateBufferIndicator();
  updateChannelChipsWithUsername();

  // 3. Sync ke Supabase (penting! agar login ulang tidak restore akun lama)
  if (typeof window.syncSocialAccounts === 'function') {
    window.syncSocialAccounts();
  }

  // 4. Hapus dari PostForMe API (background, tidak blocking UI)
  var fakePat = /^pfm_[a-z]+_\d+$/;
  if (accId && !fakePat.test(accId)) {
    _pfmProxy('/v1/social-accounts/' + accId, 'DELETE', {})
      .then(function() { console.log('[postforme] disconnect API berhasil:', accId); })
      .catch(function(e) { console.warn('[postforme] disconnect API gagal (tidak masalah):', e.message); });
  }

  if (typeof showAnToast === 'function') showAnToast('Akun ' + platform + ' dilepas', 'success');
}

/* ─── Geo-Stitch Canvas Compositing ───────────────────────── */

// Helper: draw rounded rect path
function _stitchRoundRect(ctx, x, y, w, h, r) {
  var rr = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.lineTo(x + w - rr, y);
  ctx.quadraticCurveTo(x + w, y,     x + w, y + rr);
  ctx.lineTo(x + w, y + h - rr);
  ctx.quadraticCurveTo(x + w, y + h, x + w - rr, y + h);
  ctx.lineTo(x + rr, y + h);
  ctx.quadraticCurveTo(x, y + h,     x, y + h - rr);
  ctx.lineTo(x, y + rr);
  ctx.quadraticCurveTo(x, y,         x + rr, y);
  ctx.closePath();
}

// Helper: word-wrap text to fit maxWidth, returns array of lines
function _stitchWrapText(ctx, text, maxWidth) {
  var rawLines = text.split('\n');
  var result   = [];
  rawLines.forEach(function(raw) {
    var words = raw.trim().split(' ');
    var cur   = '';
    words.forEach(function(word) {
      var test = cur ? cur + ' ' + word : word;
      if (ctx.measureText(test).width > maxWidth && cur) {
        result.push(cur);
        cur = word;
      } else {
        cur = test;
      }
    });
    if (cur) result.push(cur);
  });
  return result.length ? result : [''];
}

// Helper: apakah format ini vertical (9:16)?
// Vertical → stitch bottom-CENTER (hindari area crop Instagram/TikTok)
// Horizontal → stitch bottom-LEFT (aman untuk carousel/post)
function _isVerticalFormat(fmt, platforms) {
  var f = (fmt || '').toLowerCase();
  if (f === 'story' || f === 'reel') return true;
  var plats = Array.isArray(platforms) ? platforms : [];
  return plats.some(function(p) {
    var pl = (p || '').toLowerCase();
    return pl === 'tiktok' || pl === 'youtube';
  });
}

// Composite stitch text onto a dataUrl → returns Blob (or null on error)
// fmt + platforms menentukan posisi stitch:
//   - POST/landscape → bottom-LEFT (5% dari kiri, 8% dari bawah)
//   - STORY/REEL/TIKTOK/YOUTUBE (9:16) → bottom-CENTER (12% dari bawah, hindari UI platform)
async function _compositeStitchOnDataUrl(dataUrl, fmt, platforms, idx) {
  idx = idx || 0;
  return new Promise(function(resolve) {
    var stitchEl = document.getElementById('phoneStitch');
    var text     = stitchEl ? (stitchEl.textContent || stitchEl.innerText || '').trim() : '';
    // text might be empty if stitch is off, but we still proceed to apply zoom/pan/filters

    var vertical = _isVerticalFormat(fmt, platforms);

    var img = new Image();
    img.onload = function() {
      var origW = img.naturalWidth;
      var origH = img.naturalHeight;

      var cw, ch;
      if (vertical) {
        cw = 1080;
        ch = 1920;
      } else {
        var postScale = Math.min(1080 / origW, 1350 / origH, 1);
        cw = Math.round(origW * postScale);
        ch = Math.round(origH * postScale);
      }

      var canvas = document.createElement('canvas');
      canvas.width  = cw;
      canvas.height = ch;
      var ctx = canvas.getContext('2d');

      // Fill background (Story default black, Post white)
      ctx.fillStyle = vertical ? '#000000' : '#ffffff';
      ctx.fillRect(0, 0, cw, ch);

      // --- Apply Filters & Transformations ---
      ctx.save();
      
      // Apply Brightness & Contrast
      var b = (typeof brightnessVal !== 'undefined') ? brightnessVal : 100;
      var c = (typeof contrastVal !== 'undefined') ? contrastVal : 100;
      if (b !== 100 || c !== 100) {
        ctx.filter = 'brightness(' + b + '%) contrast(' + c + '%)';
      }

      if (vertical) {
        // Story: replicate the "contain + transform" logic from preview
        // Use 'master' key for the first photo to ensure 100% stable sync
        var key = (idx === 0) ? 'master' : dataUrl;
        var st = (typeof storyZoomState !== 'undefined' && storyZoomState[key]) 
                 ? storyZoomState[key] : { z: 1, x: 0, y: 0 };
        
        var containScale = Math.min(cw / origW, ch / origH);
        var photoW = origW * containScale;
        var photoH = origH * containScale;

        // 1. Draw Blurred Background (Native IG Style)
        ctx.save();
        var coverScale = Math.max(cw / origW, ch / origH);
        var bgW = origW * coverScale;
        var bgH = origH * coverScale;
        ctx.translate(cw / 2, ch / 2);
        ctx.filter = 'blur(40px) brightness(0.7)';
        ctx.drawImage(img, -bgW / 2, -bgH / 2, bgW, bgH);
        ctx.restore();

        // 2. Draw Main Photo
        ctx.translate(cw / 2, ch / 2);
        
        // Dynamic Ratio Calculation
        var pm = document.getElementById('phoneMedia');
        var previewWidth = (pm && pm.clientWidth) ? pm.clientWidth : 160;
        var dynamicRatio = (fmt === 'story') ? 6.75 : (cw / previewWidth);

        // Apply Zoom THEN Panning to match standard matrix order
        ctx.scale(st.z, st.z);
        ctx.translate(st.x * dynamicRatio, st.y * dynamicRatio);
        
        // Draw image centered
        ctx.drawImage(img, -photoW / 2, -photoH / 2, photoW, photoH);
      } else {
        // Post: simple scale to fit
        ctx.drawImage(img, 0, 0, cw, ch);
      }
      ctx.restore();

      console.log('[process] canvas=' + cw + 'x' + ch + ' vertical=' + vertical);

      // ── Parameter stitch text ──
      var pad = Math.round(cw * 0.018);
      var fontBase = '-apple-system, BlinkMacSystemFont, "Inter", Arial, sans-serif';
      var fontSize, minFont, maxTextW, pillMaxW;

      if (vertical) {
        fontSize  = Math.max(16, Math.round(cw * 0.052));
        minFont   = Math.max(16, Math.round(cw * 0.028));
        maxTextW  = Math.round(cw * 0.80 - pad * 2);
        pillMaxW  = Math.round(cw * 0.80);
      } else {
        fontSize  = Math.max(16, Math.round(cw * 0.038));
        minFont   = Math.max(16, Math.round(cw * 0.018));
        maxTextW  = Math.round(cw * 0.78 - pad * 2);
        pillMaxW  = Math.round(cw * 0.90 - pad * 2);
      }

      // Shrink font sampai muat
      var lines, lineWidths, maxLineW;
      while (fontSize >= minFont) {
        ctx.font = 'bold ' + fontSize + 'px ' + fontBase;
        lines      = _stitchWrapText(ctx, text, maxTextW);
        lineWidths = lines.map(function(l) { return ctx.measureText(l).width; });
        maxLineW   = Math.max.apply(null, lineWidths);
        if (Math.round(maxLineW * 1.08 + pad * 2) <= pillMaxW) break;
        fontSize -= Math.max(1, Math.round(fontSize * 0.06));
      }

      var lineHeight = Math.round(fontSize * 1.5);
      var pillW  = Math.min(Math.round(maxLineW * 1.08 + pad * 2), pillMaxW);
      var pillH  = Math.round(lineHeight * lines.length + pad * 2);
      var radius = Math.round(fontSize * 0.35);

      // ── Posisi pill: selalu relatif ke FOTO, bukan canvas ──
      // Stitch di 82% tinggi foto, dihitung dari photoOffY
      var pillX, textX, textAlign, pillY;

      if (vertical) {
        pillX     = Math.round((cw - pillW) / 2);
        textX     = Math.round(cw / 2);
        textAlign = 'center';
        // pillY relatif ke area foto: 82% dari tinggi foto + offset foto
        // pillY untuk Story diatur di sekitar 68% tinggi layar agar tidak terlalu turun
        pillY = Math.round(ch * 0.68);
      } else {
        pillX     = Math.round(cw * 0.05);
        textX     = pillX + pad;
        textAlign = 'left';
        pillY     = Math.max(ch - Math.round(ch * 0.08) - pillH, 0);
      }

      // Clamp agar tidak keluar canvas
      pillX = Math.max(0, pillX);
      if (pillX + pillW > cw) pillX = Math.max(0, cw - pillW);
      if (vertical) {
        if (pillY + pillH > ch) pillY = Math.max(0, ch - pillH);
      } else {
        if (pillY + pillH > ch) pillY = Math.max(0, ch - pillH);
      }

      if (text) {
        // ── Draw pill background ──
        ctx.globalAlpha = 1.0; // Gunakan 1.0 agar lebih kontras dengan background blur
        ctx.fillStyle   = '#000000';
        _stitchRoundRect(ctx, pillX, pillY, pillW, pillH, radius);
        ctx.fill();
        ctx.globalAlpha = 1.0;

        // ── Draw text ──
        ctx.fillStyle    = '#ffffff';
        ctx.font         = 'bold ' + fontSize + 'px ' + fontBase;
        ctx.textAlign    = textAlign;
        ctx.textBaseline = 'top';
        var textY = pillY + pad;

        lines.forEach(function(line, i) {
          ctx.save();
          ctx.beginPath();
          ctx.rect(pillX, pillY, pillW, pillH);
          ctx.clip();
          ctx.fillText(line, textX, textY + i * lineHeight);
          ctx.restore();
        });
      }

      console.log('[stitch] pill: x=' + pillX + ' y=' + pillY + ' w=' + pillW + ' h=' + pillH + ' fontSize=' + fontSize);

      canvas.toBlob(function(blob) { resolve(blob); }, 'image/jpeg', 0.9);
    };
    img.onerror = function() {
      console.warn('[stitch] gagal load image');
      resolve(null);
    };
    img.src = dataUrl;
  });
}
/* ─── Upload Media via PostForMe ───────────────────────────── */

// Upload raw blob URL (foto ke-2 dst dari carousel) tanpa overlay
async function _uploadBlobUrl(blobUrl) {
  // Fetch blob dari object URL lokal
  var resp = await fetch(blobUrl);
  var blob = await resp.blob();

  // Minta signed URL via proxy
  var data      = await _pfmProxy('/v1/media/create-upload-url', 'POST', { content_type: 'image/jpeg' });
  var uploadUrl = data.upload_url;
  var mediaUrl  = data.media_url || data.url;
  if (!uploadUrl) throw new Error('No upload URL from PostForMe');

  // Upload langsung ke signed URL (tanpa proxy — aman)
  var uploadResp = await fetch(uploadUrl, {
    method:  'PUT',
    body:    blob,
    headers: { 'Content-Type': 'image/jpeg' }
  });
  if (!uploadResp.ok) throw new Error('Upload failed: ' + uploadResp.status);
  return mediaUrl;
}

async function uploadToPostForMe(canvas) {
  var data = await _pfmProxy('/v1/media/create-upload-url', 'POST', { content_type: 'image/jpeg' });
  var uploadUrl = data.upload_url;
  var mediaUrl  = data.media_url || data.url;
  if (!uploadUrl) throw new Error('Tidak dapat upload URL dari PostForMe');

  var fmt = typeof activeFormat !== 'undefined' ? activeFormat : 'post';
  var blob;

  if (fmt === 'post' && canvas) {
    blob = await new Promise(function(resolve) {
      canvas.toBlob(function(b) { resolve(b); }, 'image/jpeg', 0.9);
    });
    console.log('[postforme] Post: canvas 4:5, size:', blob ? blob.size : 0);
  } else if (typeof uploadedDataURL !== 'undefined' && uploadedDataURL &&
             uploadedDataURL.startsWith('data:')) {
    var arr   = uploadedDataURL.split(',');
    var mime  = (arr[0].match(/:(.*?);/) || [])[1] || 'image/jpeg';
    var bstr  = atob(arr[1]);
    var u8arr = new Uint8Array(bstr.length);
    for (var i = 0; i < bstr.length; i++) u8arr[i] = bstr.charCodeAt(i);
    blob = new Blob([u8arr], { type: mime });
    console.log('[postforme] Story/Reel: foto original, size:', blob.size);
  } else {
    blob = await new Promise(function(resolve) {
      canvas.toBlob(function(b) { resolve(b); }, 'image/jpeg', 0.9);
    });
    console.log('[postforme] fallback canvas, size:', blob ? blob.size : 0);
  }

  var uploadResp = await fetch(uploadUrl, {
    method:  'PUT',
    body:    blob,
    headers: { 'Content-Type': 'image/jpeg' }
  });
  if (!uploadResp.ok) throw new Error('Upload media gagal: ' + uploadResp.status);
  return mediaUrl;
}

/* ─── Publish via PostForMe API v1 ────────────────────────── */

async function publishViaPostForMe(canvas, campaignData) {
  var featureOn = typeof RADAR_CONFIG === 'undefined' ||
                  !RADAR_CONFIG.FEATURES ||
                  RADAR_CONFIG.FEATURES.social_publish !== false;
  if (!featureOn) return { success: true, skipped: true };

  // ── DEBUG: log localStorage raw + parsed tepat sebelum build payload ──
  var _rawLS = localStorage.getItem('radar_social_accounts');
  console.log('[postforme] DEBUG localStorage key "radar_social_accounts" raw:', _rawLS);
  try {
    console.log('[postforme] DEBUG localStorage parsed:', JSON.parse(_rawLS || '[]'));
  } catch(e) {
    console.error('[postforme] DEBUG localStorage parse error:', e.message);
  }

  var accounts = _getStoredAccounts();
  console.log('[postforme] DEBUG _getStoredAccounts() result:', JSON.stringify(accounts));
  console.log('[postforme] DEBUG accounts.length:', accounts.length);

  if (!accounts.length) {
    console.error('[postforme] no accounts in localStorage — publish dibatalkan');
    return { success: false, error: 'no_accounts' };
  }

  // Filter sesuai platform yang dipilih user
  var selectedPlatforms = campaignData.platforms || [];
  var platMap = { ig: 'instagram', tiktok: 'tiktok', meta: 'facebook', youtube: 'youtube' };
  console.log('[postforme] DEBUG selectedPlatforms:', selectedPlatforms);
  console.log('[postforme] DEBUG platMap:', platMap);

  var filtered = accounts.filter(function(a) {
    if (!selectedPlatforms.length) return true;
    return selectedPlatforms.some(function(sp) {
      var match = platMap[sp] === a.platform || sp === a.platform;
      console.log('[postforme] DEBUG filter: sp=' + sp + ' platMap[sp]=' + platMap[sp] +
        ' a.platform=' + a.platform + ' a.id=' + a.id + ' → match=' + match);
      return match;
    });
  });
  console.log('[postforme] DEBUG filtered (setelah platform filter):', JSON.stringify(filtered));

  if (!filtered.length) {
    var targetPlatformName = selectedPlatforms.map(function(sp) {
      return { ig: 'Instagram', meta: 'Facebook', tiktok: 'TikTok', youtube: 'YouTube' }[sp] || sp;
    }).join(', ');
    console.error('[postforme] tidak ada akun ' + targetPlatformName + ' terhubung — publish dibatalkan');
    return {
      success: false,
      error: 'platform_not_connected',
      message: 'Akun ' + targetPlatformName + ' belum terhubung. Silakan hubungkan terlebih dahulu.'
    };
  }

  // ── Validasi accountId: tolak ID palsu sebelum request ke PostForMe ──
  var fakePat = /^pfm_[a-z]+_\d+$/;
  var invalidAccounts = filtered.filter(function(a) { return !a.id || fakePat.test(a.id); });
  console.log('[postforme] DEBUG invalidAccounts (fakePat):', JSON.stringify(invalidAccounts));
  if (invalidAccounts.length) {
    var badPlats = invalidAccounts.map(function(a) {
      return a.platform.charAt(0).toUpperCase() + a.platform.slice(1);
    }).join(', ');
    var errMsg = 'Akun ' + badPlats + ' belum terhubung dengan benar. Silakan hubungkan ulang di Connect Channels.';
    console.error('[postforme] accountId tidak valid:', invalidAccounts.map(function(a){ return a.id; }));
    if (typeof showAnToast === 'function') showAnToast('⚠ ' + errMsg);
    return { success: false, error: 'invalid_account_id', message: errMsg };
  }

  var platNames = filtered.map(function(a) { return a.platform; }).join(', ');

  try {
    // Tentukan format SEBELUM upload loop — dipakai _compositeStitchOnDataUrl via _isVerticalFormat
    var fmt = campaignData.format
           || campaignData.activeFormat
           || (typeof activeFormat !== 'undefined' ? activeFormat : null)
           || 'post';
    console.log('[postforme] fmt (early):', fmt, '| campaignData.format:', campaignData.format);

    // Upload semua foto dari uploadedDataURLs array (base64 asli, full resolution)
    var allMediaUrls = [];

    // Upload video langsung dari File object (hindari blob URL re-fetch yang tidak reliable)
    var hasVideoUpload = typeof uploadedVideoFile !== 'undefined' && uploadedVideoFile instanceof File;

    if (hasVideoUpload) {
      // VIDEO: pakai File object langsung
      try {
        var vFile   = uploadedVideoFile;
        var vMime   = vFile.type || 'video/mp4';
        console.log('[postforme] VIDEO upload dari File object:', vFile.name, 'size:', vFile.size, 'type:', vMime);

        var dataUpV = await _pfmProxy('/v1/media/create-upload-url', 'POST', { content_type: vMime });
        var upUrlV  = dataUpV.upload_url;
        var medUrlV = dataUpV.media_url || dataUpV.url;
        if (!upUrlV) throw new Error('No upload URL untuk video');

        var upRespV = await fetch(upUrlV, { method: 'PUT', body: vFile, headers: { 'Content-Type': vMime } });
        if (!upRespV.ok) throw new Error('Upload video gagal: ' + upRespV.status);
        allMediaUrls.push(medUrlV);
        console.log('[postforme] video uploaded, size:', vFile.size);
      } catch(e) {
        console.warn('[postforme] video upload error:', e.message);
      }
    } else {
      // FOTO: pakai uploadedDataURLs[] (base64 asli, full resolution)
      var allPhotoURLs = (typeof uploadedDataURLs !== 'undefined' && uploadedDataURLs.length > 0)
        ? uploadedDataURLs.filter(Boolean)
        : (typeof uploadedDataURL !== 'undefined' && uploadedDataURL ? [uploadedDataURL] : []);

      console.log('[postforme] total foto di-upload:', allPhotoURLs.length,
        '| indices:', allPhotoURLs.map(function(u, i) { return i + ':' + (u ? u.slice(0,20) : 'null'); }));
      if (!allPhotoURLs.length) {
        console.warn('[postforme] ⚠ uploadedDataURLs kosong — cek apakah FileReader selesai sebelum launch');
      }

      // ── Geo-Stitch: foto pertama saja, posisi adaptif berdasarkan format ──
      // Stitch diaktifkan untuk SEMUA format foto, posisi ditentukan oleh _isVerticalFormat():
      // - POST → bottom-LEFT (5% kiri, 8% bawah)
      // - STORY / REEL / TIKTOK / YOUTUBE → bottom-CENTER (12% bawah, hindari UI platform)
      var applyStitch = (typeof geoStitchVisible === 'undefined' || geoStitchVisible === true);

      for (var d = 0; d < allPhotoURLs.length; d++) {
        try {
          var dataUrl = allPhotoURLs[d];
          var blobToUpload = null;

          // Process photo:
          // - For STORY: Always process ALL photos to apply blurred background (Image Expansion style)
          // - For others: Only process the first photo for zoom/pan/stitch
          var shouldProcess = (fmt === 'story') || (d === 0);
          
          if (shouldProcess) {
            var processed = await _compositeStitchOnDataUrl(dataUrl, fmt, campaignData.platforms, d);
            if (processed) {
              blobToUpload = processed;
              console.log('[postforme] foto ' + (d + 1) + ' — processed (fmt=' + fmt + '), size:', processed.size);
            }
          }

          // Foto ke-2 dst (atau fallback jika stitch OFF/gagal): upload original
          if (!blobToUpload) {
            var arrD  = dataUrl.split(',');
            var mimeD = (arrD[0].match(/:(.*?);/) || [])[1] || 'image/jpeg';
            var bstrD = atob(arrD[1]);
            var u8D   = new Uint8Array(bstrD.length);
            for (var k = 0; k < bstrD.length; k++) u8D[k] = bstrD.charCodeAt(k);
            blobToUpload = new Blob([u8D], { type: mimeD });
            console.log('[postforme] foto', d + 1, '— original' + (d > 0 ? ' (stitch hanya di foto 1)' : ' (no stitch)') + ', size:', blobToUpload.size);
          }

          console.log('[postforme] upload foto ' + (d + 1) + ' dari ' + allPhotoURLs.length + ' ...');
          var dataUp = await _pfmProxy('/v1/media/create-upload-url', 'POST', { content_type: 'image/jpeg' });
          var upUrl  = dataUp.upload_url;
          var medUrl = dataUp.media_url || dataUp.url;
          if (!upUrl) throw new Error('No upload URL foto ' + (d + 1));

          var upResp = await fetch(upUrl, { method: 'PUT', body: blobToUpload, headers: { 'Content-Type': 'image/jpeg' } });
          if (!upResp.ok) throw new Error('Upload foto ' + (d + 1) + ' gagal: ' + upResp.status);
          allMediaUrls.push(medUrl);
          console.log('[postforme] ✓ foto ' + (d + 1) + '/' + allPhotoURLs.length + ' uploaded OK, url:', medUrl ? medUrl.slice(0,50) : '—');
        } catch(e) {
          console.warn('[postforme] foto', d + 1, 'error:', e.message);
        }
      }
    }

    var hasVideo = hasVideoUpload;

    var placementMap = {
      post:  'timeline',
      reel:  'reels',
      story: 'stories'
    };
    var placement = placementMap[fmt] || 'timeline';

    console.log('[postforme] fmt:', fmt, '| placement:', placement);

    var igAccounts = filtered.filter(function(a){ return a.platform === 'instagram'; });
    var fbAccounts = filtered.filter(function(a){ return a.platform === 'facebook'; });

    var platformConfigs = {};
    if (igAccounts.length) {
      platformConfigs.instagram = { placement: placement };
      // Pastikan video selalu pakai placement yang sesuai format
      if (hasVideo && platformConfigs.instagram) {
        platformConfigs.instagram.placement = placement;
      }
    }
    if (fbAccounts.length) {
      platformConfigs.facebook = { placement: placement };
      if (hasVideo && platformConfigs.facebook) {
        platformConfigs.facebook.placement = placement;
      }
    }

    var ytAccounts = filtered.filter(function(a){
      return a.platform === 'youtube';
    });

    if (ytAccounts.length) {
      platformConfigs.youtube = {
        title: campaignData.caption
          ? campaignData.caption.split('\n')[0].slice(0, 100)
          : 'Video',
        privacy_status: 'public',
        made_for_kids: false
      };
    }

    console.log('[postforme] platform_configurations:', JSON.stringify(platformConfigs, null, 2));

    // ── Validasi final: social_accounts harus ada dan valid ──
    var socialAccountIds = filtered.map(function(a){ return a.id; }).filter(Boolean);
    console.log('[postforme] DEBUG socialAccountIds (final):', socialAccountIds);
    console.log('[postforme] DEBUG filtered (final, sebelum map):', JSON.stringify(filtered));
    if (!socialAccountIds.length) {
      console.error('[postforme] social_accounts kosong — batalkan publish');
      if (typeof showAnToast === 'function') showAnToast('⚠ Hubungkan akun Instagram dulu di Connect Channels.');
      return { success: false, error: 'no_valid_social_accounts' };
    }

    var payload = {
      caption:         campaignData.caption || '',
      social_accounts: socialAccountIds
    };

    if (allMediaUrls.length) {
      payload.media = allMediaUrls.map(function(u){ return { url: u }; });
    }

    if (Object.keys(platformConfigs).length) {
      payload.platform_configurations = platformConfigs;
    }

    console.log('[postforme] final payload:', JSON.stringify(payload, null, 2));

    var data;
    if (fmt === 'story' && allMediaUrls.length > 1) {
      // Story multi-foto → publish satu per satu sebagai story terpisah
      var storyResults = [];
      for (var s = 0; s < allMediaUrls.length; s++) {
        var storyPayload = {
          caption:                 campaignData.caption || '',
          social_accounts:         filtered.map(function(a){ return a.id; }),
          media:                   [{ url: allMediaUrls[s] }],
          platform_configurations: platformConfigs
        };
        var storyData = await _pfmProxy('/v1/social-posts', 'POST', storyPayload);
        storyResults.push(storyData);
        console.log('[postforme] story', s + 1, 'result:', JSON.stringify(storyData));
      }
      data = storyResults[0] || {};
    } else {
      data = await _pfmProxy('/v1/social-posts', 'POST', payload);
    }

    console.log('[postforme] publish result full:', JSON.stringify(data));
    console.log('[postforme] raw response keys:', Object.keys(data));
    console.log('[postforme] FULL DATA DUMP:', JSON.stringify(data).slice(0, 2000));
    console.log('[postforme] data.posts:', JSON.stringify(data.posts));

    // ── Ekstrak postId dari semua kemungkinan struktur response PostForMe ──
    var postId = data.id
      || data.post_id
      || data.postId
      || (data.posts && data.posts[0] && (data.posts[0].id || data.posts[0].post_id))
      || (data.data && data.data.id)
      || (data.result && data.result.id)
      || null;

    // ── Ekstrak postUrl ──
    var postUrl = null;
    // Coba dari data.posts array
    if (data.posts && Array.isArray(data.posts) && data.posts.length) {
      var pp0 = data.posts[0];
      postUrl = pp0.post_url || pp0.platform_url || pp0.permalink || pp0.url || null;
    }
    // Coba dari root response
    if (!postUrl) {
      postUrl = data.post_url
        || data.platform_url
        || data.permalink
        || data.url
        || (data.data && (data.data.post_url || data.data.permalink || data.data.url))
        || (data.result && (data.result.post_url || data.result.permalink))
        || null;
    }
    // Coba dari account_configurations (PostForMe v1 format baru)
    if (!postUrl && data.account_configurations && Array.isArray(data.account_configurations)) {
      var cfg = data.account_configurations[0];
      if (cfg) postUrl = cfg.post_url || cfg.permalink || cfg.platform_url || null;
    }

    // ── Ekstrak platform_post_id dari social_accounts ──
    var platformPostId = null;
    if (data.social_accounts && data.social_accounts.length) {
      platformPostId = data.social_accounts[0].platform_post_id || null;
    }
    console.log('[postforme] postId:', postId, '| postUrl:', postUrl, '| platformPostId:', platformPostId);

    // ── Polling status post sampai published, lalu ambil post_url ──
    if (postId) {
      (async function pollPostUrl() {
        var maxTry = 10;
        var delay  = 5000; // 5 detik per coba
        for (var t = 0; t < maxTry; t++) {
          await new Promise(function(r){ setTimeout(r, delay); });
          try {
            var statusData = await _pfmProxy('/v1/social-posts/' + postId, 'GET', null);
            console.log('[postforme] poll status', t+1, ':', statusData.status, '| keys:', Object.keys(statusData));
            var resolvedUrl = statusData.post_url
              || statusData.platform_url
              || statusData.permalink
              || (statusData.social_accounts && statusData.social_accounts[0] && statusData.social_accounts[0].post_url)
              || null;
            // Ambil platform_post_id dari polling jika belum ada
            var resolvedPlatformPostId = platformPostId
              || (statusData.social_accounts && statusData.social_accounts[0] && statusData.social_accounts[0].platform_post_id)
              || null;
            if (resolvedUrl || resolvedPlatformPostId) {
              console.log('[postforme] ✅ resolved — post_url:', resolvedUrl, '| platform_post_id:', resolvedPlatformPostId);

              // Simpan ke Supabase
              if (campaignData && campaignData.supabase_id && typeof updateCampaignPostId === 'function') {
                updateCampaignPostId(campaignData.supabase_id, postId, resolvedUrl, resolvedPlatformPostId);
              }

              // Update in-memory CAMPAIGNS — supaya _loadAnalyticsForCard bisa exact match
              if (typeof CAMPAIGNS !== 'undefined') {
                CAMPAIGNS.forEach(function(c) {
                  if (c.supabase_id !== campaignData.supabase_id) return;

                  var _platPostIdUpdated = false;

                  if (resolvedPlatformPostId && c.platform_post_id !== resolvedPlatformPostId) {
                    // Hapus cache lama (key lama pakai post_id/id, bukan platform_post_id baru)
                    // Setelah platform_post_id di-set, _loadAnalyticsForCard akan pakai key baru
                    if (typeof _analyticsCache !== 'undefined' && typeof _getStoredAccounts === 'function') {
                      var _accs = _getStoredAccounts();
                      var _platApiMap = { ig:'instagram', meta:'facebook', tiktok:'tiktok', youtube:'youtube' };
                      var _plat = c.platforms && c.platforms[0];
                      var _sp   = _platApiMap[_plat] || _plat;
                      for (var _ai = 0; _ai < _accs.length; _ai++) {
                        if (_accs[_ai].platform === _sp) {
                          // Hapus semua possible old cache keys untuk campaign ini
                          var _oldKey1 = _accs[_ai].id + '||' + (c.platform_post_id || '');
                          var _oldKey2 = _accs[_ai].id + '||' + (c.post_id || '');
                          var _oldKey3 = _accs[_ai].id + '||' + c.id;
                          delete _analyticsCache[_oldKey1];
                          delete _analyticsCache[_oldKey2];
                          delete _analyticsCache[_oldKey3];
                          delete _analyticsFetching[_oldKey1];
                          delete _analyticsFetching[_oldKey2];
                          delete _analyticsFetching[_oldKey3];
                          break;
                        }
                      }
                    }
                    c.platform_post_id = resolvedPlatformPostId;
                    _platPostIdUpdated = true;
                  }

                  if (resolvedUrl && !c.post_url) {
                    c.post_url = resolvedUrl;
                    // Update timestamp DOM langsung jadi link ungu
                    var cardEl = document.getElementById('campaign-card-' + c.id);
                    if (cardEl) {
                      var tsEl = cardEl.querySelector('.cc-timestamp');
                      if (tsEl && tsEl.tagName !== 'A') {
                        var tsA = document.createElement('a');
                        tsA.href      = resolvedUrl;
                        tsA.target    = '_blank';
                        tsA.rel       = 'noopener';
                        tsA.className = 'cc-timestamp';
                        tsA.style.cssText = 'color:#791ADB;text-decoration:underline;'
                          + 'text-underline-offset:2px;font-weight:600;font-size:10px;';
                        tsA.textContent = tsEl.textContent;
                        tsA.addEventListener('click', function(e) { e.stopPropagation(); });
                        tsEl.parentNode.replaceChild(tsA, tsEl);
                      }
                    }
                  }

                  // Re-trigger analytics setelah platform_post_id di-set
                  // Ini akan fetch dengan exact filter → engagement real + timestamp link
                  if (_platPostIdUpdated && typeof _loadAnalyticsForCard === 'function') {
                    (function(camp) {
                      setTimeout(function() { _loadAnalyticsForCard(camp); }, 800);
                    })(c);
                  }
                });
              }

              if (resolvedUrl) break;
            }
            if (statusData.status === 'failed' || statusData.status === 'error') {
              console.warn('[postforme] post gagal:', statusData.status);
              break;
            }
          } catch(e) {
            console.warn('[postforme] poll error:', e.message);
            break;
          }
        }
      })();
    }

    console.log('[postforme] DEBUG full data keys:', Object.keys(data));
    if (data.account_configurations) {
      console.log('[postforme] account_configurations[0]:', JSON.stringify(data.account_configurations[0]));
    }

    // Simpan post_id + platform_post_id ke Supabase segera setelah publish
    if (postId && campaignData && campaignData.supabase_id) {
      if (typeof updateCampaignPostId === 'function') {
        updateCampaignPostId(campaignData.supabase_id, postId, postUrl, platformPostId);
      }
    }

    if (typeof showAnToast === 'function') {
      showAnToast('Postingan berhasil dikirim ke ' + platNames + '!', 'success');
    }
    return { success: true, postId: postId, postUrl: postUrl };

  } catch(e) {
    console.error('[postforme] publish error:', e.message);
    if (typeof showAnToast === 'function') {
      showAnToast('⚠ Posting gagal: ' + e.message);
    }
    return { success: false, error: e.message };
  }
}

/* ─── Campaign Analytics (PostForMe feed metrics) ─────────── */

async function fetchCampaignAnalytics(socialAccountId) {
  try {
    var data = await _pfmProxy(
      '/v1/social-account-feeds/' + encodeURIComponent(socialAccountId) + '?expand=metrics',
      'GET', null
    );
    var metrics = (data && data.metrics) || data || {};
    return {
      likes:          metrics.likes           || metrics.like_count       || null,
      comments:       metrics.comments        || metrics.comment_count    || null,
      views:          metrics.views           || metrics.view_count       || null,
      shares:         metrics.shares          || metrics.share_count      || null,
      engagementRate: metrics.engagement_rate || metrics.engagementRate   || null
    };
  } catch(e) {
    console.warn('[postforme] fetchCampaignAnalytics error:', e.message);
    return null;
  }
}
window.fetchCampaignAnalytics = fetchCampaignAnalytics;

/* ─── Backward Compat Aliases ──────────────────────────────── */

var connectBuffer    = showConnectAccountsFlow;
var publishViaBuffer = publishViaPostForMe;

/* ─── Init on DOM Ready ────────────────────────────────────── */

document.addEventListener('DOMContentLoaded', function() {
  updateBufferIndicator();
  updateChannelChipsWithUsername();

  // Auto-fix: jika ada akun dengan ID placeholder (pfm_platform_timestamp),
  // langsung fetch real ID dari PostForMe tanpa user harus klik manual.
  // Ini menangani user yang sudah punya placeholder ID di localStorage.
  (function _autoFixFakeIds() {
    var fakePat = /^pfm_[a-z]+_\d+$/;
    var stored  = _getStoredAccounts();
    var hasFake = stored.some(function(a) { return !a.id || fakePat.test(a.id); });
    if (hasFake) {
      setTimeout(function() { _fetchConnectedAccounts(); }, 1500);
    }
  })();
});
