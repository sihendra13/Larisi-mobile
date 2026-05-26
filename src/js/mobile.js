/* ═══════════════════════════════════════════════════
   LARISI MOBILE — mobile.js
   Semua logic khusus mobile. Hanya aktif di ≤ 768px.
   ═══════════════════════════════════════════════════ */

(function() {
  'use strict';

  function isMobile() {
    return window.innerWidth <= 768;
  }

  function _el(id, display) {
    var el = document.getElementById(id);
    if (el) el.style.display = display;
  }

  /* ─────────────────────────────────────────────────
     INSTALL BANNER (PWA)
  ───────────────────────────────────────────────── */
  var _deferredInstallPrompt = null;

  window.addEventListener('beforeinstallprompt', function(e) {
    e.preventDefault();
    _deferredInstallPrompt = e;
    if (!isMobile()) return;
    var dismissed = localStorage.getItem('larisi_install_dismissed');
    if (!dismissed) {
      setTimeout(showInstallBanner, 3000);
    }
  });

  function showInstallBanner() {
    var banner = document.getElementById('mobile-install-banner');
    if (banner) banner.classList.remove('hidden');
  }

  window.mobileInstall = function() {
    if (!_deferredInstallPrompt) return;
    _deferredInstallPrompt.prompt();
    _deferredInstallPrompt.userChoice.then(function(result) {
      if (result.outcome === 'accepted') {
        dismissInstallBanner();
      }
      _deferredInstallPrompt = null;
    });
  };

  window.dismissInstallBanner = function() {
    var banner = document.getElementById('mobile-install-banner');
    if (banner) banner.classList.add('hidden');
    localStorage.setItem('larisi_install_dismissed', '1');
  };

  /* ─────────────────────────────────────────────────
     BOTTOM NAV — 3-tab (Dapur/Kelola/Performa)
     mobileNavSwitch(view) terima 'command'|'monitor'|'analytics'
  ───────────────────────────────────────────────── */
  window.mobileNavSwitch = function(view) {
    if (!isMobile()) return;

    // Update active tab visual
    document.querySelectorAll('.mobile-nav-tab').forEach(function(tab) {
      tab.classList.toggle('active', tab.dataset.view === view);
    });

    // CTA bar: hanya Dapur
    var ctaBar = document.getElementById('mobile-cta-bar');
    if (ctaBar) ctaBar.style.display = (view === 'command') ? 'block' : 'none';

    // FAB SiLaris: hanya Kelola
    var fab = document.querySelector('.mobile-silaris-fab');
    if (fab) fab.style.display = (view === 'monitor') ? 'flex' : 'none';

    // Dapur header & chips: hanya Dapur
    var dapurHeader = document.getElementById('mobile-dapur-header');
    var dapurChips  = document.getElementById('mobile-dapur-chips');
    if (dapurHeader) dapurHeader.style.display = (view === 'command') ? 'block' : 'none';
    if (dapurChips)  dapurChips.style.display  = (view === 'command') ? 'flex'  : 'none';

    // Delegate ke router yang sudah ada
    if (typeof switchMenu === 'function') switchMenu(view);

    // Reset ke chip Aset saat kembali ke Dapur
    if (view === 'command') mobileDapurChip('aset');
  };

  /* Sync reach dari desktop bottom-bar → mobile CTA bar */
  window.syncMobileCtaBar = function() {
    var srcNum = document.getElementById('reachNum');
    var srcLoc = document.getElementById('reachLocLabel');
    var dstNum = document.getElementById('mobile-cta-reach-num');
    var dstLoc = document.getElementById('mobile-cta-reach-loc');
    if (srcNum && dstNum) dstNum.textContent = srcNum.textContent || '0';
    if (srcLoc && dstLoc && srcLoc.textContent.trim()) {
      dstLoc.textContent = srcLoc.textContent.trim();
    }
  };

  /* Sync avatar initials dari desktop → mobile header */
  function _syncMobileAvatar() {
    var src = document.getElementById('user-initials');
    var dst = document.getElementById('mobile-user-initials');
    if (src && dst && src.textContent.trim() !== '--') {
      dst.textContent = src.textContent.trim();
    }
  }

  /* Legacy — backward compat untuk kode lama yang panggil mobileTabSwitch */
  window.mobileTabSwitch = function(tab) {
    var map = { 'dapur': 'command', 'kelola': 'monitor', 'performa': 'analytics' };
    if (map[tab]) mobileNavSwitch(map[tab]);
  };

  /* ─────────────────────────────────────────────────
     DAPUR CHIP NAVIGATION (Aset → Audiens → AI → Preview)
  ───────────────────────────────────────────────── */
  var _CHIPS = ['aset', 'audiens', 'ai', 'preview'];

  window.mobileDapurChip = function(chip) {
    if (!isMobile()) return;

    // Update chip visuals
    document.querySelectorAll('.mobile-dapur-chip').forEach(function(el) {
      var c = el.dataset.chip;
      var stepEl = el.querySelector('.chip-step');
      var idx = _CHIPS.indexOf(c);
      var activeIdx = _CHIPS.indexOf(chip);
      el.classList.remove('active', 'done');
      if (c === chip) {
        el.classList.add('active');
        if (stepEl) stepEl.textContent = idx + 1;
      } else if (idx < activeIdx) {
        el.classList.add('done');
        if (stepEl) stepEl.textContent = '✓';
      } else {
        if (stepEl) stepEl.textContent = idx + 1;
      }
    });

    var panelUpload  = document.getElementById('panel-upload');
    var panelMap     = document.getElementById('panel-map-desktop');
    var panelCaption = document.getElementById('panel-caption');
    var secAset      = document.getElementById('mobile-section-aset');
    var secAudiens   = document.getElementById('mobile-section-audiens');
    var panels       = document.querySelector('.panels');

    if (chip === 'aset') {
      if (panelUpload)  panelUpload.style.display  = 'block';
      if (secAset)      secAset.style.display      = '';
      if (secAudiens)   secAudiens.style.display   = 'none';
      if (panelMap)     panelMap.style.display     = 'none';
      if (panelCaption) panelCaption.style.display = 'none';

    } else if (chip === 'audiens') {
      if (panelUpload)  panelUpload.style.display  = 'block';
      // Design screen 02: Aset + Audiens keduanya visible saat step Audiens
      if (secAset)      secAset.style.display      = '';
      if (secAudiens)   secAudiens.style.display   = '';
      if (panelMap)     panelMap.style.display     = 'block';
      if (panelCaption) panelCaption.style.display = 'none';
      // Map perlu invalidate size karena sempat hidden
      setTimeout(function() {
        if (window.State && window.State.map) window.State.map.invalidateSize();
      }, 150);

    } else if (chip === 'ai') {
      if (panelUpload)  panelUpload.style.display  = 'none';
      if (panelMap)     panelMap.style.display     = 'none';
      if (panelCaption) panelCaption.style.display = 'flex';

    } else if (chip === 'preview') {
      if (panelUpload)  panelUpload.style.display  = 'none';
      if (panelMap)     panelMap.style.display     = 'none';
      if (panelCaption) panelCaption.style.display = 'flex';
      setTimeout(function() {
        var phone = document.getElementById('phoneShell');
        if (phone) phone.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }

    if (panels && chip !== 'preview') panels.scrollTop = 0;
  };

  // Alias untuk backward compat
  window.mobileShowScreenA = function() { mobileDapurChip('aset'); };
  window.mobileShowScreenB = function() { mobileDapurChip('ai'); };

  /* ─────────────────────────────────────────────────
     MAP MODAL
  ───────────────────────────────────────────────── */
  window.mobileOpenMapModal = function() {
    var modal = document.getElementById('mobile-map-modal');
    if (!modal) return;
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';

    // Trigger resize pada leaflet map agar render ulang
    setTimeout(function() {
      if (window.State && window.State.map) {
        window.State.map.invalidateSize();
      }
    }, 100);
  };

  window.mobileCloseMapModal = function() {
    var modal = document.getElementById('mobile-map-modal');
    if (!modal) return;
    modal.classList.remove('open');
    document.body.style.overflow = '';
  };

  /* ─────────────────────────────────────────────────
     CAPTION BOTTOM SHEET
  ───────────────────────────────────────────────── */
  window.mobileOpenCaptionSheet = function() {
    if (!isMobile()) return;

    // Sync caption dari panel desktop ke sheet
    var desktopCaption = document.getElementById('captionText');
    var sheetTextarea = document.getElementById('mobile-caption-textarea');
    if (desktopCaption && sheetTextarea) {
      sheetTextarea.value = desktopCaption.innerText || desktopCaption.value || '';
      mobileCaptionUpdateCount();
    }

    var overlay = document.getElementById('mobile-caption-sheet-overlay');
    var sheet = document.getElementById('mobile-caption-sheet');
    if (overlay) { overlay.style.display = 'block'; setTimeout(function() { overlay.classList.add('open'); }, 10); }
    if (sheet) setTimeout(function() { sheet.classList.add('open'); }, 10);
    document.body.style.overflow = 'hidden';

    // Focus textarea setelah animasi
    setTimeout(function() {
      if (sheetTextarea) sheetTextarea.focus();
    }, 350);
  };

  window.mobileCloseCaptionSheet = function() {
    var overlay = document.getElementById('mobile-caption-sheet-overlay');
    var sheet = document.getElementById('mobile-caption-sheet');
    if (overlay) overlay.classList.remove('open');
    if (sheet) sheet.classList.remove('open');
    document.body.style.overflow = '';
    setTimeout(function() {
      if (overlay) overlay.style.display = 'none';
    }, 300);
  };

  window.mobileSaveCaption = function() {
    var sheetTextarea = document.getElementById('mobile-caption-textarea');
    var desktopCaption = document.getElementById('captionText');
    if (sheetTextarea && desktopCaption) {
      var newText = sheetTextarea.value;
      if (desktopCaption.tagName === 'TEXTAREA') {
        desktopCaption.value = newText;
      } else {
        desktopCaption.innerText = newText;
      }
    }

    // Update preview di Screen B
    var captionPreview = document.getElementById('mobile-caption-preview');
    if (captionPreview && sheetTextarea) {
      var preview = sheetTextarea.value.substring(0, 100);
      captionPreview.innerText = preview + (sheetTextarea.value.length > 100 ? '...' : '');
    }

    mobileCloseCaptionSheet();
  };

  window.mobileCaptionUpdateCount = function() {
    var textarea = document.getElementById('mobile-caption-textarea');
    var counter = document.getElementById('mobile-caption-char-count');
    if (!textarea || !counter) return;
    var len = textarea.value.length;
    var max = 2200;
    counter.textContent = len + ' / ' + max.toLocaleString();
    counter.className = 'mobile-caption-char-count';
    if (len > max * 0.9) counter.classList.add('near-limit');
    if (len > max) counter.classList.add('over-limit');
  };

  /* ─────────────────────────────────────────────────
     SILARIS FAB + CHAT SCREEN
  ───────────────────────────────────────────────── */
  var _silarisContext = null; // campaign yang di-tap, null = tanya bebas

  window.mobileOpenSiLaris = function(campaignContext) {
    _silarisContext = campaignContext || null;
    var screen = document.getElementById('mobile-silaris-screen');
    if (!screen) return;
    screen.classList.add('open');
    document.body.style.overflow = 'hidden';

    // Auto-trigger insight jika ada context
    if (_silarisContext) {
      var msgContainer = document.getElementById('mobile-silaris-messages');
      if (msgContainer) {
        msgContainer.innerHTML = '';
        var loadingBubble = _createSiLarisBubble('ai', '🔍 Menganalisis kampanye <strong>' + _silarisContext.name + '</strong>...');
        msgContainer.appendChild(loadingBubble);

        // Kirim ke SiLaris via fungsi yang sudah ada
        setTimeout(function() {
          var prompt = 'Berikan insight singkat untuk kampanye "' + _silarisContext.name + '" ' +
            'dengan status ' + (_silarisContext.status === 'running' ? 'aktif berjalan' : 'dijeda') + ', ' +
            'reach ' + (_silarisContext.reach || 0) + ' orang, ' +
            'platform ' + (_silarisContext.platforms || []).join(' dan ') + '. ' +
            'Berikan 2-3 poin insight dan 1 saran konkret. Gunakan bahasa Indonesia yang santai.';
          mobileSendSiLarisMessage(prompt, true);
        }, 500);
      }
    }
  };

  window.mobileCloseSiLaris = function() {
    var screen = document.getElementById('mobile-silaris-screen');
    if (!screen) return;
    screen.classList.remove('open');
    document.body.style.overflow = '';
    _silarisContext = null;
  };

  function _createSiLarisBubble(type, html) {
    var div = document.createElement('div');
    div.className = 'mobile-silaris-bubble ' + type;
    div.innerHTML = html;
    return div;
  }

  window.mobileSendSiLarisMessage = function(overrideText, isAuto) {
    var input = document.getElementById('mobile-silaris-input');
    var msgContainer = document.getElementById('mobile-silaris-messages');
    if (!msgContainer) return;

    var text = overrideText || (input ? input.value.trim() : '');
    if (!text) return;
    if (input && !isAuto) input.value = '';

    // Tampilkan pesan user (kecuali auto-trigger)
    if (!isAuto) {
      msgContainer.appendChild(_createSiLarisBubble('user', text));
    }

    // Loading bubble
    var loading = _createSiLarisBubble('ai', '<em>SiLaris sedang berpikir...</em>');
    if (isAuto) {
      // Ganti loading bubble yang sudah ada
      var existing = msgContainer.querySelector('.mobile-silaris-bubble.ai');
      if (existing) existing.replaceWith(loading);
      else msgContainer.appendChild(loading);
    } else {
      msgContainer.appendChild(loading);
    }

    msgContainer.scrollTop = msgContainer.scrollHeight;

    // Kirim ke SiLaris chat (fungsi dari monitor.js)
    if (typeof sendChatMessage === 'function') {
      // Override input sementara
      var origInput = document.getElementById('silaris-input');
      if (origInput) {
        var origVal = origInput.value;
        origInput.value = text;
        sendChatMessage();
        origInput.value = origVal;
      }
    }

    // Fallback: response sederhana setelah 2s
    setTimeout(function() {
      if (loading.parentNode) {
        loading.innerHTML = '📊 Data kampanye sedang diproses. Pastikan kamu sudah menghubungkan akun sosial media untuk mendapatkan insight yang akurat.';
      }
      msgContainer.scrollTop = msgContainer.scrollHeight;
    }, 2500);
  };

  window.mobileHandleSiLarisKeydown = function(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      mobileSendSiLarisMessage();
    }
  };

  /* ─────────────────────────────────────────────────
     PLATFORM SELECTOR MOBILE (Opsi C)
  ───────────────────────────────────────────────── */
  var MOBILE_PLATFORM_FORMATS = {
    instagram: ['Story', 'Feed', 'Reel'],
    tiktok:    [],
    youtube:   [],
    facebook:  ['Story', 'Feed', 'Reel']
  };

  var MOBILE_FORMAT_TO_STATE = {
    instagram: { Story: 'ig-story', Feed: 'ig-feed', Reel: 'ig-reel' },
    facebook:  { Story: 'meta-story', Feed: 'meta', Reel: 'meta-reel' }
  };

  /* SVG icons untuk previewLabel badge */
  var _PLATFORM_ICONS = {
    instagram: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#E1306C" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="0.8" fill="#E1306C" stroke="none"/></svg>',
    facebook:  '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" style="flex-shrink:0"><rect width="24" height="24" rx="6" fill="#1877F2"/><path d="M13.5 8h2V5.5h-2C11.57 5.5 10 7.07 10 9v1.5H8V13h2v7h3v-7h2l.5-2.5H13V9c0-.28.22-.5.5-.5z" fill="white"/></svg>',
    tiktok:    '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" style="flex-shrink:0"><rect width="24" height="24" rx="6" fill="#000"/><path d="M16 8c.55.73 1.4 1.2 2.35 1.25v2.1a4.55 4.55 0 01-2.35-.65v5.8a4.1 4.1 0 11-4.1-4.1h.27v2.1H12a2 2 0 102 2V8z" fill="white"/></svg>'
  };

  window.mobileSelectPlatform = function(platform) {
    // Update previewLabel badge dengan icon
    var badge = document.getElementById('previewLabel');
    if (badge) {
      var icon = _PLATFORM_ICONS[platform] || '';
      var label = platform.charAt(0).toUpperCase() + platform.slice(1);
      badge.innerHTML = icon + label + '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-left:2px"><path d="m6 9 6 6 6-6"/></svg>';
    }

    // Update tab visual
    document.querySelectorAll('.mobile-platform-tab').forEach(function(el) {
      el.classList.toggle('active', el.dataset.platform === platform);
    });

    // Tampilkan/sembunyikan format pills
    var pillsRow = document.getElementById('mobile-format-pills');
    var formats = MOBILE_PLATFORM_FORMATS[platform] || [];
    if (pillsRow) {
      if (formats.length === 0) {
        pillsRow.style.display = 'none';
      } else {
        pillsRow.style.display = 'flex';
        pillsRow.innerHTML = formats.map(function(f, i) {
          return '<button class="mobile-format-pill' + (i === formats.length - 1 ? ' active' : '') + '" ' +
            'data-format="' + f + '" data-platform="' + platform + '" ' +
            'onclick="mobileSelectFormat(\'' + platform + '\',\'' + f + '\')">' + f + '</button>';
        }).join('');
        // Default ke format terakhir (biasanya Reel)
        mobileSelectFormat(platform, formats[formats.length - 1], true);
      }
    }

    // Update state channel
    if (typeof setActiveChannel === 'function') {
      setActiveChannel(platform === 'facebook' ? 'meta' : platform);
    } else {
      window.activeChannel = (platform === 'facebook' ? 'meta' : platform);
    }
  };

  window.mobileSelectFormat = function(platform, format, skipVisual) {
    if (!skipVisual) {
      document.querySelectorAll('.mobile-format-pill').forEach(function(el) {
        el.classList.toggle('active', el.dataset.format === format && el.dataset.platform === platform);
      });
    }

    // Map ke platform key di state
    var map = MOBILE_FORMAT_TO_STATE[platform];
    var platformKey = map ? (map[format] || platform) : platform;
    if (typeof setActivePlatform === 'function') {
      setActivePlatform(platformKey);
    } else {
      window.activePlatform = platformKey;
    }
  };

  /* ─────────────────────────────────────────────────
     INISIALISASI — jalankan saat DOM siap
  ───────────────────────────────────────────────── */
  function initMobile() {
    if (!isMobile()) return;

    // Force hide panel-caption via inline style (beats HTML inline style)
    var panelCaption = document.getElementById('panel-caption');
    if (panelCaption) panelCaption.style.display = 'none';

    // FAB default tersembunyi — hanya muncul saat Kelola tab aktif
    var fab = document.querySelector('.mobile-silaris-fab');
    if (fab) fab.style.display = 'none';

    // Default state: Dapur tab active
    // (tidak memanggil mobileNavSwitch karena switchMenu belum tentu siap)
    var ctaBar = document.getElementById('mobile-cta-bar');
    if (ctaBar) ctaBar.style.display = 'block';

    // Sync avatar dari desktop initials
    _syncMobileAvatar();

    // Observasi perubahan reach → sync ke CTA bar
    var reachEl = document.getElementById('reachNum');
    if (reachEl) {
      var reachObserver = new MutationObserver(function() { syncMobileCtaBar(); });
      reachObserver.observe(reachEl, { childList: true, subtree: true, characterData: true });
    }
    // Observasi user-initials → sync avatar
    var initialsEl = document.getElementById('user-initials');
    if (initialsEl) {
      var avatarObserver = new MutationObserver(_syncMobileAvatar);
      avatarObserver.observe(initialsEl, { childList: true, characterData: true });
    }

    // Sembunyikan thumb slots statis saat file nyata diupload ke #thumbs
    var thumbsEl = document.getElementById('thumbs');
    var thumbSlots = document.getElementById('mobile-thumb-slots');
    if (thumbsEl && thumbSlots) {
      var thumbObserver = new MutationObserver(function() {
        var hasFiles = thumbsEl.children.length > 0;
        thumbSlots.style.display = hasFiles ? 'none' : '';
      });
      thumbObserver.observe(thumbsEl, { childList: true });
    }

    // Slider fill: update background gradient sesuai nilai
    function updateSliderFill(input) {
      var min = parseFloat(input.min) || 0;
      var max = parseFloat(input.max) || 100;
      var val = parseFloat(input.value) || 0;
      var pct = ((val - min) / (max - min)) * 100;
      input.style.background = 'linear-gradient(to right, var(--m-ink) ' + pct + '%, var(--m-line) ' + pct + '%)';
    }
    document.querySelectorAll('.filter-row input[type="range"]').forEach(function(inp) {
      updateSliderFill(inp);
      inp.addEventListener('input', function() { updateSliderFill(inp); });
    });

    // Default Dapur: chip Aset
    mobileDapurChip('aset');

    // Init platform selector dengan Instagram aktif
    mobileSelectPlatform('instagram');

    // Register Service Worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/service-worker.js').catch(function(e) {
        console.warn('[SW]', e);
      });
    }

    // Tap pada campaign card di Kelola → buka SiLaris
    document.addEventListener('click', function(e) {
      var card = e.target.closest('.campaign-card');
      if (!card) return;
      // Jangan intercept tap pada tombol Lihat
      if (e.target.closest('.campaign-lihat-btn')) return;

      var campaignData = {
        name: card.dataset.name || 'Kampanye',
        status: card.dataset.status || 'running',
        reach: card.dataset.reach || 0,
        platforms: (card.dataset.platforms || '').split(',').filter(Boolean)
      };
      mobileOpenSiLaris(campaignData);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMobile);
  } else {
    initMobile();
  }

  // Handle resize (user rotate HP)
  window.addEventListener('resize', function() {
    if (!isMobile()) {
      // Kembali ke desktop: reset semua mobile state
      var panelUpload = document.getElementById('panel-upload');
      var panelCaption = document.getElementById('panel-caption');
      var bottomBar = document.querySelector('.bottom-bar');
      if (panelUpload) panelUpload.style.display = '';
      if (panelCaption) { panelCaption.style.display = ''; panelCaption.classList.remove('mobile-visible'); }
      if (bottomBar) bottomBar.classList.remove('mobile-screen-b');
    }
  });

})();
