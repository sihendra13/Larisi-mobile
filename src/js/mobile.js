/* ═══════════════════════════════════════════════════
   LARISI MOBILE — mobile.js
   Semua logic khusus mobile. Hanya aktif di ≤ 768px.
   ═══════════════════════════════════════════════════ */

(function() {
  'use strict';

  function isMobile() {
    return window.innerWidth <= 768;
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
     BOTTOM TAB BAR — navigasi
  ───────────────────────────────────────────────── */
  window.mobileTabSwitch = function(tab) {
    if (!isMobile()) return;

    // Update active tab
    document.querySelectorAll('.mobile-tab-item').forEach(function(el) {
      el.classList.toggle('active', el.dataset.tab === tab);
    });

    // Delegate ke switchMenu yang sudah ada
    var menuMap = {
      'dapur':    'command',
      'kelola':   'monitor',
      'performa': 'analytics',
      'profil':   'profil'
    };
    var menuKey = menuMap[tab];
    if (menuKey && typeof switchMenu === 'function') {
      switchMenu(menuKey);
    }

    // Reset ke Screen A saat pindah tab
    if (tab === 'dapur') {
      mobileShowScreenA();
    }
  };

  /* ─────────────────────────────────────────────────
     SCREEN A → SCREEN B NAVIGATION
  ───────────────────────────────────────────────── */
  window.mobileShowScreenB = function() {
    if (!isMobile()) return;

    // Sembunyikan panel kiri (Screen A)
    var panelLeft = document.querySelector('.panel-left');
    if (panelLeft) panelLeft.style.display = 'none';

    // Tampilkan panel kanan (Screen B)
    var panelRight = document.querySelector('.panel-right');
    if (panelRight) {
      panelRight.classList.add('mobile-visible');
      panelRight.style.display = 'flex';
    }

    // Tampilkan header Screen B
    var screenBHeader = document.getElementById('mobile-screen-b-header');
    if (screenBHeader) screenBHeader.style.display = 'flex';

    // Sembunyikan header desktop
    var desktopHeader = document.querySelector('.header');
    if (desktopHeader) desktopHeader.style.display = 'none';

    // Scroll ke atas
    var panels = document.querySelector('.panels');
    if (panels) panels.scrollTop = 0;
  };

  window.mobileShowScreenA = function() {
    if (!isMobile()) return;

    // Tampilkan panel kiri
    var panelLeft = document.querySelector('.panel-left');
    if (panelLeft) panelLeft.style.display = '';

    // Sembunyikan panel kanan
    var panelRight = document.querySelector('.panel-right');
    if (panelRight) {
      panelRight.classList.remove('mobile-visible');
      panelRight.style.display = 'none';
    }

    // Sembunyikan header Screen B
    var screenBHeader = document.getElementById('mobile-screen-b-header');
    if (screenBHeader) screenBHeader.style.display = 'none';

    // Tampilkan header desktop
    var desktopHeader = document.querySelector('.header');
    if (desktopHeader) desktopHeader.style.display = '';
  };

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

  window.mobileSelectPlatform = function(platform) {
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

    // Pastikan Screen A tampil default di Dapur tab
    mobileShowScreenA();

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
      var panelLeft = document.querySelector('.panel-left');
      var panelRight = document.querySelector('.panel-right');
      if (panelLeft) panelLeft.style.display = '';
      if (panelRight) { panelRight.style.display = ''; panelRight.classList.remove('mobile-visible'); }
    }
  });

})();
