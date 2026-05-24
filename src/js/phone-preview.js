// RADAR — phone-preview.js
// Phone shell chrome: realistic platform UI per platform
// Setiap platform menampilkan chrome yang akurat sesuai tampilan asli

/* ─── Helper: ambil username akun yang terhubung ─────────── */
function _previewUsername(platform) {
  try {
    var accounts = JSON.parse(localStorage.getItem('radar_social_accounts') || '[]');
    var platMap  = { 'ig-story': 'instagram', 'ig-feed': 'instagram', 'tiktok': 'tiktok', 'youtube': 'youtube', 'meta': 'facebook' };
    var target   = platMap[platform] || 'instagram';
    var found    = accounts.filter(function(a) { return a.platform === target; })[0];
    return found && found.username ? found.username : 'yourname';
  } catch(e) { return 'yourname'; }
}

/* ─── Helper: ambil caption untuk preview ────────────────── */
function _previewCaption() {
  try {
    var el = document.getElementById('captionArea');
    if (el && el.value) return el.value.split('\n')[0].slice(0, 60) + (el.value.length > 60 ? '…' : '');
  } catch(e) {}
  return 'Caption campaign kamu...';
}

/* ─── Chrome HTML per platform ──────────────────────────── */
function getChromeHTML(platform) {
  var user = _previewUsername(platform);

  if (platform === 'ig-story') {
    // ── Instagram Story / Reels ──
    return (
      // Top: progress bars + profile
      '<div class="pf-ig-story-top">' +
        '<div class="pf-ig-prog-row">' +
          '<div class="pf-ig-prog-filled"></div>' +
          '<div class="pf-ig-prog"></div>' +
          '<div class="pf-ig-prog"></div>' +
        '</div>' +
        '<div class="pf-ig-story-profile">' +
          '<div class="pf-ig-story-avatar"></div>' +
          '<span class="pf-ig-story-name">' + user + '</span>' +
          '<span class="pf-ig-time">2m</span>' +
          '<span class="pf-ig-close">✕</span>' +
        '</div>' +
      '</div>' +
      // Bottom: send message + icons
      '<div class="pf-ig-story-bottom">' +
        '<div class="pf-ig-story-msg-row">' +
          '<div class="pf-ig-msg-input">Kirim pesan</div>' +
          '<span class="pf-ig-story-icon">&#9825;</span>' +
          '<span class="pf-ig-story-icon">&#10148;</span>' +
        '</div>' +
      '</div>'
    );
  }

  if (platform === 'ig-feed') {
    // ── Instagram Feed ──
    return (
      // Top: profile header
      '<div class="pf-ig-feed-top">' +
        '<div class="pf-ig-feed-avatar"></div>' +
        '<span class="pf-ig-feed-user">' + user + '</span>' +
        '<span class="pf-ig-feed-more">···</span>' +
      '</div>' +
      // Bottom: engagement row
      '<div class="pf-ig-feed-bottom">' +
        '<svg class="pf-feed-icon" viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>' +
        '<svg class="pf-feed-icon" viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>' +
        '<svg class="pf-feed-icon" viewBox="0 0 24 24"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>' +
        '<div class="pf-feed-spacer"></div>' +
        '<svg class="pf-feed-icon" viewBox="0 0 24 24"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>' +
      '</div>'
    );
  }

  if (platform === 'tiktok') {
    // ── TikTok For You Page ──
    var caption = _previewCaption();
    return (
      // Top nav: Following | For You | Search
      '<div class="pf-tt-top">' +
        '<span class="pf-tt-nav">Following</span>' +
        '<span class="pf-tt-nav pf-tt-nav-active">For You</span>' +
        '<svg class="pf-tt-search" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>' +
      '</div>' +
      // Right side: avatar + action icons + music disc
      '<div class="pf-tt-right">' +
        '<div class="pf-tt-avatar"><div class="pf-tt-plus">+</div></div>' +
        '<div class="pf-tt-icon">' +
          '<svg viewBox="0 0 24 24" fill="white"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>' +
          '<span>0</span>' +
        '</div>' +
        '<div class="pf-tt-icon">' +
          '<svg viewBox="0 0 24 24" fill="white"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>' +
          '<span>0</span>' +
        '</div>' +
        '<div class="pf-tt-icon">' +
          '<svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon fill="white" stroke="none" points="22 2 15 22 11 13 2 9 22 2"/></svg>' +
          '<span>Share</span>' +
        '</div>' +
        '<div class="pf-tt-disc">&#9835;</div>' +
      '</div>' +
      // Bottom info: username + caption
      '<div class="pf-tt-bottom">' +
        '<div class="pf-tt-user">@' + user + '</div>' +
        '<div class="pf-tt-desc">' + caption + '</div>' +
        '<div class="pf-tt-music">&#9835; Original sound · ' + user + '</div>' +
      '</div>'
    );
  }

  if (platform === 'youtube') {
    // ── YouTube Shorts ──
    return (
      // Top bar
      '<div class="pf-yt-top">' +
        '<svg class="pf-yt-logo" viewBox="0 0 24 24" fill="#FF0000"><path d="M23.5 6.19a3 3 0 00-2.12-2.13C19.54 3.5 12 3.5 12 3.5s-7.54 0-9.38.56A3 3 0 00.5 6.19C0 8.03 0 12 0 12s0 3.97.5 5.81a3 3 0 002.12 2.12C4.46 20.5 12 20.5 12 20.5s7.54 0 9.38-.57a3 3 0 002.12-2.12C24 15.97 24 12 24 12s0-3.97-.5-5.81zM9.75 15.02V8.98L15.5 12l-5.75 3.02z"/></svg>' +
        '<span class="pf-yt-shorts-label">Shorts</span>' +
      '</div>' +
      // Right: like, dislike, comment, share
      '<div class="pf-yt-right">' +
        '<div class="pf-yt-avatar"></div>' +
        '<div class="pf-yt-icon">' +
          '<svg viewBox="0 0 24 24" fill="white"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14z"/></svg>' +
          '<span>Like</span>' +
        '</div>' +
        '<div class="pf-yt-icon">' +
          '<svg viewBox="0 0 24 24" fill="white" style="transform:rotate(180deg)"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14z"/></svg>' +
          '<span>Dislike</span>' +
        '</div>' +
        '<div class="pf-yt-icon">' +
          '<svg viewBox="0 0 24 24" fill="white"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>' +
          '<span>0</span>' +
        '</div>' +
        '<div class="pf-yt-icon">' +
          '<svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>' +
          '<span>Share</span>' +
        '</div>' +
      '</div>' +
      // Bottom: channel info
      '<div class="pf-yt-bottom">' +
        '<div class="pf-yt-channel">@' + user + ' <button class="pf-yt-sub">Subscribe</button></div>' +
        '<div class="pf-yt-desc">' + _previewCaption() + '</div>' +
      '</div>'
    );
  }

  if (platform === 'ig-reel') {
    // ── Instagram Reels ── (tanpa progress bar story, pakai Reels label di bottom)
    return (
      '<div class="pf-tt-right" style="bottom:60px;">' +
        '<div class="pf-tt-icon">' +
          '<svg viewBox="0 0 24 24" fill="white"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>' +
          '<span>0</span>' +
        '</div>' +
        '<div class="pf-tt-icon">' +
          '<svg viewBox="0 0 24 24" fill="white"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>' +
          '<span>0</span>' +
        '</div>' +
        '<div class="pf-tt-icon">' +
          '<svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon fill="white" stroke="none" points="22 2 15 22 11 13 2 9 22 2"/></svg>' +
          '<span>Share</span>' +
        '</div>' +
      '</div>' +
      '<div class="pf-ig-story-bottom" style="flex-direction:column;gap:6px;">' +
        '<div style="font-size:11px;font-weight:600;color:white;letter-spacing:0.5px;">&#9654; Reels</div>' +
        '<div class="pf-ig-story-msg-row">' +
          '<div class="pf-ig-msg-input" style="flex:1;">Kirim pesan</div>' +
          '<span class="pf-ig-story-icon">&#9825;</span>' +
          '<span class="pf-ig-story-icon">&#10148;</span>' +
        '</div>' +
      '</div>'
    );
  }

  if (platform === 'meta-story') {
    // ── Facebook Story ──
    return (
      '<div class="pf-ig-story-top">' +
        '<div class="pf-ig-prog-row">' +
          '<div class="pf-ig-prog-filled"></div>' +
          '<div class="pf-ig-prog"></div>' +
        '</div>' +
        '<div class="pf-ig-story-profile">' +
          '<div class="pf-ig-story-avatar" style="background:#1877F2;"></div>' +
          '<span class="pf-ig-story-name">' + user + '</span>' +
          '<span class="pf-ig-time">2m</span>' +
          '<span class="pf-ig-close">✕</span>' +
        '</div>' +
      '</div>' +
      '<div class="pf-ig-story-bottom">' +
        '<div class="pf-ig-story-msg-row">' +
          '<div class="pf-ig-msg-input">Kirim pesan</div>' +
          '<span class="pf-ig-story-icon">&#9825;</span>' +
          '<span class="pf-ig-story-icon">&#10148;</span>' +
        '</div>' +
      '</div>'
    );
  }

  if (platform === 'meta-reel') {
    // ── Facebook Reels ──
    var caption = _previewCaption();
    return (
      '<div class="pf-ig-story-top">' +
        '<div class="pf-ig-prog-row">' +
          '<div class="pf-ig-prog-filled"></div>' +
          '<div class="pf-ig-prog"></div>' +
        '</div>' +
        '<div class="pf-ig-story-profile">' +
          '<div class="pf-ig-story-avatar" style="background:#1877F2;"></div>' +
          '<span class="pf-ig-story-name">' + user + '</span>' +
          '<span class="pf-ig-time">2m</span>' +
          '<span class="pf-ig-close">✕</span>' +
        '</div>' +
      '</div>' +
      '<div class="pf-tt-right" style="bottom:60px;">' +
        '<div class="pf-tt-icon">' +
          '<svg viewBox="0 0 24 24" fill="white"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14z"/></svg>' +
          '<span>Suka</span>' +
        '</div>' +
        '<div class="pf-tt-icon">' +
          '<svg viewBox="0 0 24 24" fill="white"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>' +
          '<span>Komen</span>' +
        '</div>' +
        '<div class="pf-tt-icon">' +
          '<svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon fill="white" stroke="none" points="22 2 15 22 11 13 2 9 22 2"/></svg>' +
          '<span>Bagikan</span>' +
        '</div>' +
      '</div>' +
      '<div class="pf-tt-bottom">' +
        '<div class="pf-tt-user">@' + user + '</div>' +
        '<div class="pf-tt-desc">' + caption + '</div>' +
      '</div>'
    );
  }

  if (platform === 'meta') {
    // ── Meta / Facebook Feed ──
    return (
      // Top: FB profile header
      '<div class="pf-meta-top">' +
        '<div class="pf-meta-avatar"></div>' +
        '<div class="pf-meta-info">' +
          '<div class="pf-meta-name">' + user + '</div>' +
          '<div class="pf-meta-sponsored">Sponsored · <svg width="7" height="7" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="#1877F2"/><path d="M12 8v4l3 3" stroke="white" stroke-width="2" stroke-linecap="round" fill="none"/></svg></div>' +
        '</div>' +
        '<span class="pf-meta-more">···</span>' +
      '</div>' +
      // Bottom: Like / Comment / Share + Boost
      '<div class="pf-meta-bottom">' +
        '<div class="pf-meta-actions">' +
          '<div class="pf-meta-action">' +
            '<svg viewBox="0 0 24 24" fill="none" stroke="#606770" stroke-width="1.5"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14z"/></svg>' +
            '<span>Suka</span>' +
          '</div>' +
          '<div class="pf-meta-action">' +
            '<svg viewBox="0 0 24 24" fill="none" stroke="#606770" stroke-width="1.5"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>' +
            '<span>Komentar</span>' +
          '</div>' +
          '<div class="pf-meta-action">' +
            '<svg viewBox="0 0 24 24" fill="none" stroke="#606770" stroke-width="1.5"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2" stroke="#606770" fill="none"/></svg>' +
            '<span>Bagikan</span>' +
          '</div>' +
        '</div>' +
        '<button class="pf-meta-boost">Boost post</button>' +
      '</div>'
    );
  }

  return '';
}

/* ─── Apply shell: aspect ratio + chrome + stitch position ── */
function applyShell(k) {
  var p = PLATFORMS[k]; if (!p) return;
  var s = document.getElementById('phoneShell');
  s.style.aspectRatio  = p.aspect;
  s.style.width        = (p.aspect === '4/5') ? '185px' : '160px';
  s.style.borderRadius = (p.aspect === '9/16') ? '20px' : '10px';

  document.getElementById('phoneChrome').innerHTML = getChromeHTML(p.chrome || k);
  document.getElementById('ratioLabel').textContent = p.ratio;

  var liveLabel = document.getElementById('livePreviewPlatformLabel');
  if (liveLabel) liveLabel.textContent = p.tag;

  // Reset stitch text ke safe zone (di atas bottom chrome)
  var stitch = document.getElementById('phoneStitch');
  if (stitch) {
    stitch.style.top       = '';
    stitch.style.left      = '50%';
    stitch.style.bottom    = p.stitchBottom || '23%';
    stitch.style.transform = 'translateX(-50%)';
  }
}

/* ─── Preview chips — single select ────────────────────────── */
function selectPreview(el) {
  document.querySelectorAll('#previewChips .chip-preview').forEach(function(c){ c.classList.remove('active'); });
  el.classList.add('active');
  activePlatform = el.getAttribute('data-platform');
  platformIdx = platformOrder.indexOf(activePlatform);
  applyShell(activePlatform);
}

function cyclePreview() {
  updateCaptionPlatformLabel();
  platformIdx = (platformIdx + 1) % platformOrder.length;
  var key = platformOrder[platformIdx];
  var chips = document.querySelectorAll('#previewChips .chip-preview');
  chips.forEach(function(c){ c.classList.remove('active'); });
  chips.forEach(function(c){ if(c.getAttribute('data-platform') === key) c.classList.add('active'); });
  activePlatform = key;
  applyShell(key);
  captionAltIndex = 0;
  generateCaption(false);
  updateCaptionPlatformLabel();
}

/* ─── Helper: update "#livePreviewPlatformLabel" (channel + format) ── */
function _updateLivePreviewLabel() {
  var channelNames = { instagram: 'Instagram', meta: 'Facebook', tiktok: 'TikTok', youtube: 'YouTube' };
  var formatNames  = { post: 'Post', reel: 'Reel', story: 'Story' };
  var ch  = channelNames[activeChannel] || activeChannel;
  var fmt = (activeChannel === 'instagram' || activeChannel === 'meta')
              ? ' ' + (formatNames[activeFormat] || '')
              : '';
  var el = document.getElementById('livePreviewPlatformLabel');
  if (el) el.textContent = ch + fmt;
}

/* ─── Channel cycler (AI Editor "Publish ke Channel") ────── */
function cycleChannel() {
  channelIdx = (channelIdx + 1) % channelOrder.length;
  activeChannel = channelOrder[channelIdx];

  var labels = { instagram: 'Instagram', meta: 'Facebook', tiktok: 'TikTok', youtube: 'YouTube' };
  var badge  = document.getElementById('previewLabel');
  if (badge) badge.textContent = labels[activeChannel];

  // Tampilkan/sembunyikan format selector
  var hasFmt = (activeChannel === 'instagram' || activeChannel === 'meta');
  var fmtSel = document.getElementById('formatSelector');
  if (fmtSel) fmtSel.style.display = hasFmt ? 'flex' : 'none';

  // Update Live Preview label (channel + format)
  _updateLivePreviewLabel();

  // Tentukan platform key berdasarkan channel + format aktif
  var fmtMap = CHANNEL_FORMAT_MAP[activeChannel];
  var key    = fmtMap.single || fmtMap[activeFormat] || fmtMap.reel || fmtMap.post;
  activePlatform = key;
  applyShell(key);

  captionAltIndex = 0;
  if (typeof generateCaption === 'function')       generateCaption(false);
  if (typeof updateCaptionPlatformLabel === 'function') updateCaptionPlatformLabel();
  if (typeof updateReach === 'function') updateReach();
  if (typeof toggleStoryZoomUI === 'function') toggleStoryZoomUI();
}

/* ─── Format selector (Post / Reel / Story) ────────────────── */
function selectFormat(fmt) {
  activeFormat = fmt;
  var fmtMap = CHANNEL_FORMAT_MAP[activeChannel];
  var key    = fmtMap && (fmtMap[fmt] || fmtMap.single);
  if (!key) return;
  activePlatform = key;
  applyShell(key);
  // Update label kanan (e.g. "Instagram Reel")
  _updateLivePreviewLabel();
  if (typeof updateCaptionPlatformLabel === 'function') updateCaptionPlatformLabel();
  if (typeof toggleStoryZoomUI === 'function') toggleStoryZoomUI();
}

/* ─── Channel chips — multi select, controls reach ─────────── */
function toggleChannel(el) {
  el.classList.toggle('active');
  updateReach();
}
