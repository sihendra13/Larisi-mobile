// RADAR — upload.js
// File upload, thumbnail management, phone preview display

var uploadedDataURLs = [];
var uploadedVideoFile = null; // simpan File object asli untuk video
var currentMediaUrl = null;

// Zoom & Pan state (only active for Story format)
var storyZoomState = {}; // URL -> { z: 1, x: 0, y: 0 }
var isDraggingMedia = false;
var dragStartX = 0;
var dragStartY = 0;
var initialPanX = 0;
var currentMediaIndex = -1; // -1 means none, 0 means master
var blobToBase64Map = {}; // mapping blobUrl -> base64Url for state synchronization

function getStoryZoomKey(url) {
  if (currentMediaIndex === 0) return 'master';
  return (typeof blobToBase64Map !== 'undefined' && blobToBase64Map[url]) ? blobToBase64Map[url] : url;
}

function addThumb(f, thumbs, uz, isMaster, existingUrl) {
  var wrapper = document.createElement('div');
  wrapper.className = 'thumb-item';
  var objUrl = existingUrl || URL.createObjectURL(f);
  var media = f.type.startsWith('video/') ? document.createElement('video') : document.createElement('img');
  media.src = objUrl;
  media.style.borderRadius = '12px';
  if (f.type.startsWith('video/')) { media.muted = true; media.preload = 'metadata'; }
  wrapper.dataset.url = objUrl;
  wrapper.dataset.isVideo = f.type.startsWith('video/') ? '1' : '0';
  wrapper.appendChild(media);
  if (isMaster) {
    var badge = document.createElement('div');
    badge.className = 'thumb-badge';
    badge.textContent = 'Master';
    wrapper.appendChild(badge);
  }
  var xBtn = document.createElement('button');
  xBtn.className = 'thumb-x';
  xBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="none"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>';
  xBtn.onclick = function(e) {
    e.stopPropagation();
    wrapper.remove();
    var remaining = thumbs.querySelectorAll('.thumb-item');
    if (remaining.length === 0) {
      thumbs.style.display = 'none';
      uz.style.display = '';
      uploadMode = null;
      uploadedVideoFile = null;
      masterPersonaLocked = false;
      currentPersona = null;
      // Reset stitch UI ke state awal (foto)
      var _tEl = document.getElementById('toggleStitch');
      var _nEl = document.getElementById('stitchVideoNotice');
      var _dEl = document.getElementById('stitchDesc');
      if (_tEl) { _tEl.classList.add('on'); _tEl.classList.remove('disabled'); }
      if (_nEl) _nEl.style.display = 'none';
      if (_dEl) _dEl.style.display = 'block';
      if (typeof geoStitchVisible !== 'undefined') geoStitchVisible = true;
      captionAltIndex = 0;
      uploadedDataURL = null;
      uploadedDataURLs = [];
      document.getElementById('personaCard').classList.remove('visible');
      document.getElementById('catNudge').classList.remove('visible');
      var _vcEl = document.getElementById('visionConflict');
      if (_vcEl) _vcEl.classList.remove('visible');
      if (typeof _visionConflictData !== 'undefined') _visionConflictData = null;
      document.getElementById('stitchCard').style.display = 'none';
      document.getElementById('scanning').classList.remove('visible');
      document.getElementById('genBtn').style.display = 'none';
      var ca = document.getElementById('captionArea');
      if (ca) ca.value = '';
      /* Reset phone mockup ke placeholder */
      var pm = document.getElementById('phoneMedia');
      if (pm) pm.innerHTML = '<svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>';
      var ps = document.getElementById('phoneStitch');
      if (ps) { ps.style.display = 'none'; ps.textContent = ''; }
      updateCarouselDots(0);
    } else {
      /* Tampilkan foto pertama yang tersisa */
      if (uploadMode === 'photo') showInPhone(remaining[0].dataset.url, false);
      updateCarouselDots(0);
    }
    refreshAddBox(thumbs, uz);
  };
  wrapper.onclick = function() {
    var allThumbs = Array.from(thumbs.querySelectorAll('.thumb-item'));
    var myIdx = allThumbs.indexOf(wrapper);
    showInPhone(objUrl, f.type.startsWith('video/'), myIdx);
  };
  wrapper.appendChild(xBtn);
  thumbs.appendChild(wrapper);
}

function updateCarouselDots(activeIdx) {
  var dotsEl = document.getElementById('carouselDots');
  if (!dotsEl) return;
  var thumbs = document.getElementById('thumbs');
  var items = thumbs ? Array.from(thumbs.querySelectorAll('.thumb-item')) : [];
  dotsEl.innerHTML = '';
  if (items.length <= 1 || uploadMode === 'video') {
    dotsEl.style.display = 'none';
    return;
  }
  dotsEl.style.display = 'flex';
  items.forEach(function(item, i) {
    var dot = document.createElement('div');
    dot.style.cssText = 'width:6px;height:6px;border-radius:50%;cursor:pointer;transition:background .2s,transform .2s;flex-shrink:0;'
      + (i === activeIdx ? 'background:#791ADB;transform:scale(1.3);' : 'background:#d4d4d4;');
    dot.onmouseenter = function() { if (i !== activeIdx) dot.style.background = '#b39ddb'; };
    dot.onmouseleave = function() { if (i !== activeIdx) dot.style.background = '#d4d4d4'; };
    (function(idx, url) {
      dot.onclick = function() { showInPhone(url, false, idx); updateCarouselDots(idx); };
    })(i, item.dataset.url);
    dotsEl.appendChild(dot);
  });
}

function refreshAddBox(thumbs, uz) {
  var existing = thumbs.querySelector('.thumb-add');
  if (existing) existing.remove();
  var total = thumbs.querySelectorAll('.thumb-item').length;
  if (total < 5) {
    var addBox = document.createElement('div');
    addBox.className = 'thumb-add';
    addBox.innerHTML = '<svg viewBox="0 0 24 24" fill="none"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>';
    addBox.onclick = function() { document.getElementById('fileInput').click(); };
    thumbs.appendChild(addBox);
  }
}

function showUploadModal(msg, onConfirm) {
  var existing = document.getElementById('uploadModal');
  if (existing) existing.remove();
  var modal = document.createElement('div');
  modal.id = 'uploadModal';
  modal.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.45);z-index:9999;display:flex;align-items:center;justify-content:center;';
  modal.innerHTML = '<div style="background:#fff;border-radius:16px;padding:28px 24px;max-width:340px;width:90%;box-shadow:0 8px 32px rgba(0,0,0,0.18);">'
    + '<div style="font-size:15px;font-weight:700;color:#222;margin-bottom:8px;">Perhatian</div>'
    + '<div style="font-size:13px;color:#6a6a6a;margin-bottom:20px;line-height:1.5;">'+msg+'</div>'
    + '<div style="display:flex;gap:10px;justify-content:flex-end;">'
    + '<button onclick="var m=document.getElementById(\'uploadModal\');if(m)m.remove();" style="padding:8px 16px;border-radius:8px;border:1px solid #e0e0e0;background:#fff;font-size:12px;font-weight:600;cursor:pointer;">Batal</button>'
    + '<button id="modalConfirm" style="padding:8px 16px;border-radius:8px;border:none;background:#791ADB;color:#fff;font-size:12px;font-weight:700;cursor:pointer;">Ganti</button>'
    + '</div></div>';
  document.body.appendChild(modal);
  document.getElementById('modalConfirm').onclick = function() {
    modal.remove();
    onConfirm();
  };
}

function handleUpload(e) {
  // JANGAN reset uploadedDataURLs di sini — kalau user tambah foto via tombol "+"
  // array lama akan kehilangan base64 foto-foto sebelumnya.
  // Reset hanya dilakukan di clearThumbs() dan xBtn.onclick (lihat di bawah).
  var rawFiles = Array.from(e.target.files);
  if (!rawFiles.length) return;
  e.target.value = '';

  var thumbs = document.getElementById('thumbs');
  var uz = document.getElementById('uploadZone');
  var existingCount = thumbs.querySelectorAll('.thumb-item').length;
  var isFirstUpload = existingCount === 0;
  var newHasVideo = rawFiles.some(function(f){ return f.type.startsWith('video/'); });

  /* Check mixing */
  if (!isFirstUpload && uploadMode === 'photo' && newHasVideo) {
    showUploadModal('Kamu sudah upload foto. Mau ganti dengan video? Semua foto akan dihapus.', function() {
      clearThumbs();
      processFiles(rawFiles, true);
    });
    return;
  }
  if (!isFirstUpload && uploadMode === 'video' && !newHasVideo) {
    showUploadModal('Kamu sudah upload video. Mau ganti dengan foto? Video akan dihapus.', function() {
      clearThumbs();
      processFiles(rawFiles, false);
    });
    return;
  }

  processFiles(rawFiles, newHasVideo);
}

function clearThumbs() {
  var thumbs = document.getElementById('thumbs');
  thumbs.innerHTML = '';
  thumbs.style.display = 'none';
  uploadMode = null;
  uploadedDataURLs = []; // Reset array saat ganti dari video→foto atau foto→video
}

function processFiles(rawFiles, hasVideo) {
  var thumbs = document.getElementById('thumbs');
  var uz = document.getElementById('uploadZone');
  var existingCount = thumbs.querySelectorAll('.thumb-item').length;
  var isFirstUpload = existingCount === 0;
  var files;

  if (hasVideo) {
    files = rawFiles.filter(function(f){ return f.type.startsWith('video/'); }).slice(0,1);
    uploadMode = 'video';
    // Aktifkan kembali tab Reel kalau upload video
    var reelLabel2 = document.querySelector('label.fmt-radio-label input[value="reel"]');
    var reelLabelEl2 = reelLabel2 ? reelLabel2.closest('label') : null;
    if (reelLabelEl2) {
      reelLabelEl2.style.opacity = '1';
      reelLabelEl2.style.pointerEvents = 'auto';
      reelLabelEl2.title = '';
    }
    // Auto-switch ke Reel untuk video
    if (typeof selectFormat === 'function') selectFormat('reel');
    var reelInput = document.querySelector('input[name="fmt"][value="reel"]');
    if (reelInput) reelInput.checked = true;
  } else {
    var remaining = 5 - existingCount;
    files = rawFiles.filter(function(f){ return f.type.startsWith('image/'); }).slice(0, remaining);
    uploadMode = 'photo';
    // Sembunyikan tab Reel kalau upload foto (Reel hanya untuk video)
    var reelLabel = document.querySelector('label.fmt-radio-label input[value="reel"]');
    var reelLabelEl = reelLabel ? reelLabel.closest('label') : null;
    if (reelLabelEl) {
      reelLabelEl.style.opacity = '0.4';
      reelLabelEl.style.pointerEvents = 'none';
      reelLabelEl.title = 'Reel hanya tersedia untuk video';
    }
    // Auto-switch ke Post kalau sebelumnya pilih Reel
    if (typeof activeFormat !== 'undefined' && activeFormat === 'reel') {
      if (typeof selectFormat === 'function') selectFormat('post');
      var postInput = document.querySelector('input[name="fmt"][value="post"]');
      if (postInput) postInput.checked = true;
    }
  }
  if (!files.length) return;

  thumbs.style.display = 'flex';
  uz.style.display = 'none';

  var firstBlobUrl = null;
  files.forEach(function(f, fi) {
    var blobUrl = URL.createObjectURL(f);
    if (fi === 0) firstBlobUrl = blobUrl;
    
    var isMaster = isFirstUpload && fi === 0;
    addThumb(f, thumbs, uz, isMaster, blobUrl);
    
    var capturedIdx = existingCount + fi;
    var r = new FileReader();
    r.onload = function(ev) {
      var base64 = ev.target.result;
      uploadedDataURLs[capturedIdx] = base64;
      blobToBase64Map[blobUrl] = base64;
      // Stop overwriting uploadedDataURL with base64 to maintain stable Blob identity for UI
      console.log('[upload] foto', capturedIdx + 1, 'base64 ok');
    };
    r.readAsDataURL(f);
  });

  /* Video: hide add box always */
  if (hasVideo) {
    var ab = thumbs.querySelector('.thumb-add');
    if (ab) ab.remove();
  } else {
    refreshAddBox(thumbs, uz);
  }

  var first = files[0];
  var isVid = first.type.startsWith('video/');
  if (isVid) {
    uploadedVideoFile = first;
    console.log('[upload] video file tersimpan:', first.name, 'size:', first.size, 'type:', first.type);
  } else {
    uploadedVideoFile = null;
  }

  // Disable stitch toggle untuk video, enable untuk foto
  var toggleEl = document.getElementById('toggleStitch');
  var noticeEl = document.getElementById('stitchVideoNotice');
  var descEl   = document.getElementById('stitchDesc');
  var stitchEl = document.getElementById('phoneStitch');
  if (isVid) {
    if (toggleEl) { toggleEl.classList.remove('on'); toggleEl.classList.add('disabled'); }
    if (noticeEl) noticeEl.style.display = 'block';
    if (descEl)   descEl.style.display   = 'none';
    if (stitchEl) stitchEl.style.display = 'none';
    if (typeof geoStitchVisible !== 'undefined') geoStitchVisible = false;
  } else {
    if (toggleEl) { toggleEl.classList.add('on'); toggleEl.classList.remove('disabled'); }
    if (noticeEl) noticeEl.style.display = 'none';
    if (descEl)   descEl.style.display   = 'block';
    if (typeof geoStitchVisible !== 'undefined') geoStitchVisible = true;
  }
  
  uploadedDataURL = firstBlobUrl;  // Gunakan blob URL yang sama dengan yang didaftarkan di map
  showInPhone(firstBlobUrl, isVid, 0);

  var totalCount = document.getElementById('thumbs').querySelectorAll('.thumb-item').length;
  updateCarouselDots(0);

  if (isFirstUpload) {
    /* First upload: detect persona from filename, set as MASTER — cannot be changed */
    masterPersonaLocked = false;
    startScanWithFile(first.name, totalCount);
  } else {
    /* Subsequent uploads: only show scanning animation briefly, DO NOT change persona */
    showScanningOnly(totalCount);
  }
}

function showInPhone(url, isVid, idx) {
  if (typeof idx !== 'undefined') {
    currentMediaIndex = idx;
  }
  var m = document.getElementById('phoneMedia');
  if (isVid) {
    var wrapper = document.createElement('div');
    wrapper.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;';
    var vid = document.createElement('video');
    vid.src = url;
    vid.autoplay = true;
    vid.loop = true;
    vid.playsInline = true;
    vid.muted = false; /* audio ON by default */
    vid.style.cssText = 'position:relative;width:100%;height:100%;object-fit:cover;object-position:top center;display:block;z-index:2;';

    // Blur Background for Video (using the video itself but blurred)
    var blurVid = document.createElement('video');
    blurVid.id = 'phoneBlurBg';
    blurVid.src = url;
    blurVid.autoplay = true;
    blurVid.loop = true;
    blurVid.playsInline = true;
    blurVid.muted = true;
    blurVid.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;object-fit:cover;filter:blur(20px) brightness(0.6);display:none;z-index:1;';
    // Tombol PAUSE — pojok kiri atas
    var pauseBtn = document.createElement('button');
    pauseBtn.style.cssText =
      'position:absolute;top:10px;left:10px;' +
      'background:rgba(0,0,0,0.55);border:none;border-radius:50%;' +
      'width:36px;height:36px;cursor:pointer;display:flex;' +
      'align-items:center;justify-content:center;z-index:10;' +
      'backdrop-filter:blur(4px);';
    pauseBtn.innerHTML =
      '<svg width="14" height="14" viewBox="0 0 24 24" fill="white">' +
      '<rect x="6" y="4" width="4" height="16"/>' +
      '<rect x="14" y="4" width="4" height="16"/></svg>';

    // Tombol MUTE — pojok kiri atas sebelah pause
    var muteBtn = document.createElement('button');
    muteBtn.style.cssText =
      'position:absolute;top:10px;left:54px;' +
      'background:rgba(0,0,0,0.55);border:none;border-radius:50%;' +
      'width:36px;height:36px;cursor:pointer;display:flex;' +
      'align-items:center;justify-content:center;z-index:10;' +
      'backdrop-filter:blur(4px);';
    muteBtn.innerHTML =
      '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" ' +
      'stroke="white" stroke-width="2" stroke-linecap="round">' +
      '<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>' +
      '<path d="M19.07 4.93a10 10 0 010 14.14M15.54 8.46a5 5 0 010 7.07"/>' +
      '</svg>';

    var isPlaying = true;
    var isMuted = false;

    pauseBtn.onclick = function(e) {
      e.stopPropagation();
      if (isPlaying) {
        vid.pause();
        pauseBtn.innerHTML =
          '<svg width="14" height="14" viewBox="0 0 24 24" fill="white">' +
          '<polygon points="5 3 19 12 5 21 5 3"/></svg>';
      } else {
        vid.play();
        pauseBtn.innerHTML =
          '<svg width="14" height="14" viewBox="0 0 24 24" fill="white">' +
          '<rect x="6" y="4" width="4" height="16"/>' +
          '<rect x="14" y="4" width="4" height="16"/></svg>';
      }
      isPlaying = !isPlaying;
    };

    muteBtn.onclick = function(e) {
      e.stopPropagation();
      isMuted = !isMuted;
      vid.muted = isMuted;
      muteBtn.innerHTML = isMuted
        ? '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" ' +
          'stroke="white" stroke-width="2" stroke-linecap="round">' +
          '<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>' +
          '<line x1="23" y1="9" x2="17" y2="15"/>' +
          '<line x1="17" y1="9" x2="23" y2="15"/></svg>'
        : '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" ' +
          'stroke="white" stroke-width="2" stroke-linecap="round">' +
          '<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>' +
          '<path d="M19.07 4.93a10 10 0 010 14.14M15.54 8.46a5 5 0 010 7.07"/>' +
          '</svg>';
    };

    wrapper.appendChild(blurVid);
    wrapper.appendChild(vid);
    wrapper.appendChild(pauseBtn);
    wrapper.appendChild(muteBtn);
    m.innerHTML = '';
    m.appendChild(wrapper);
  } else {
    m.innerHTML = 
      '<div id="phoneBlurBg" style="position:absolute;top:0;left:0;width:100%;height:100%;background-image:url(\''+url+'\');background-size:cover;background-position:center;filter:blur(20px) brightness(0.6);display:none;z-index:1;"></div>' +
      '<img src="' + url + '" draggable="false" style="position:relative;width:100%;height:100%;object-fit:cover;object-position:center;display:block;transform-origin:center;z-index:2;">';
  }
  
  currentMediaUrl = url;
  var key = getStoryZoomKey(url);
  if (!storyZoomState[key]) {
    storyZoomState[key] = { z: 1, x: 0, y: 0 };
  }
  
  // Attach drag listeners only once to phoneMedia
  if (!m.dataset.dragAttached) {
    m.dataset.dragAttached = 'true';
    m.style.cursor = 'grab';
    m.style.overflow = 'hidden';
    m.style.position = 'relative'; // ensure wrapper boundaries

    var onDragStart = function(e) {
      if (typeof activeFormat === 'undefined' || activeFormat !== 'story') return;
      isDraggingMedia = true;
      var clientX = e.touches ? e.touches[0].clientX : e.clientX;
      var clientY = e.touches ? e.touches[0].clientY : e.clientY;
      dragStartX = clientX;
      dragStartY = clientY;
      
      var k = getStoryZoomKey(currentMediaUrl);
      var st = storyZoomState[k];
      initialPanX = st ? st.x : 0;
      initialPanY = st ? st.y : 0;
      m.style.cursor = 'grabbing';
    };

    var onDragMove = function(e) {
      if (!isDraggingMedia) return;
      if (typeof activeFormat === 'undefined' || activeFormat !== 'story') return;
      e.preventDefault(); // prevent scrolling
      var clientX = e.touches ? e.touches[0].clientX : e.clientX;
      var clientY = e.touches ? e.touches[0].clientY : e.clientY;
      var dx = clientX - dragStartX;
      var dy = clientY - dragStartY;
      
      var k = getStoryZoomKey(currentMediaUrl);
      var st = storyZoomState[k];
      if (st) {
        st.x = initialPanX + (dx / st.z);
        st.y = initialPanY + (dy / st.z);
        applyStoryZoom(true); // true = no transition
      }
    };

    var onDragEnd = function(e) {
      if (isDraggingMedia) {
        isDraggingMedia = false;
        m.style.cursor = 'grab';
        applyStoryZoom(false); // restore transition
      }
    };

    m.addEventListener('mousedown', onDragStart);
    window.addEventListener('mousemove', onDragMove, {passive: false});
    window.addEventListener('mouseup', onDragEnd);

    m.addEventListener('touchstart', onDragStart, {passive: false});
    window.addEventListener('touchmove', onDragMove, {passive: false});
    window.addEventListener('touchend', onDragEnd);
  }

  applyFilters();
  toggleStoryZoomUI(); // Setup initial UI state for this image
}

function applyFilters() {
  var el = document.querySelector('#phoneMedia img, #phoneMedia video');
  if (el) el.style.filter = 'brightness('+brightnessVal+'%) contrast('+contrastVal+'%)';
}

function applyStoryZoom(skipTransition) {
  var el = document.querySelector('#phoneMedia img, #phoneMedia video');
  if (!el || !currentMediaUrl) return;

  var slider = document.getElementById('storyZoomSlider');
  var isStory = (typeof activeFormat !== 'undefined' && activeFormat === 'story');

  var blurBg = document.getElementById('phoneBlurBg');

  if (isStory) {
    // We are in story mode
    el.style.objectFit = 'contain';
    if (blurBg) blurBg.style.display = 'block';
    
    // Gunakan kunci 'master' khusus untuk foto pertama agar sinkronisasi 100% stabil
    var key = getStoryZoomKey(currentMediaUrl);
    
    var st = storyZoomState[key] || { z: 1, x: 0, y: 0 };
    storyZoomState[key] = st;
    // update state from slider if caller is slider
    if (slider && !isDraggingMedia) {
      st.z = parseFloat(slider.value);
    } else if (slider) {
      slider.value = st.z; // sync slider when switching images
    }
    
    // Calculate boundaries to prevent panning beyond image edges
    var nw = el.naturalWidth || el.videoWidth;
    var nh = el.naturalHeight || el.videoHeight;
    if (nw && nh) {
      var cw = el.parentElement.clientWidth;
      var ch = el.parentElement.clientHeight;
      var imgRatio = nw / nh;
      var containerRatio = cw / ch;

      var renderedW, renderedH;
      if (imgRatio > containerRatio) {
        renderedW = cw;
        renderedH = cw / imgRatio;
      } else {
        renderedH = ch;
        renderedW = ch * imgRatio;
      }

      var scaledW = renderedW * st.z;
      var scaledH = renderedH * st.z;

      var maxX = Math.max(0, (scaledW - cw) / 2 / st.z);
      var maxY = Math.max(0, (scaledH - ch) / 2 / st.z);

      if (st.x > maxX) st.x = maxX;
      if (st.x < -maxX) st.x = -maxX;
      if (st.y > maxY) st.y = maxY;
      if (st.y < -maxY) st.y = -maxY;
    }
    
    if (skipTransition) {
      el.style.transition = 'none';
    } else {
      el.style.transition = 'transform 0.1s ease-out';
    }
    el.style.transform = 'scale(' + st.z + ') translate(' + st.x + 'px, ' + st.y + 'px)';
    
    // update the slider input UI
    if (slider) slider.value = st.z;

  } else {
    // Normal mode (Post / Reel)
    el.style.objectFit = 'cover';
    if (blurBg) blurBg.style.display = 'none';
    el.style.transition = 'transform 0.2s';
    el.style.transform = 'translate(0px, 0px) scale(1)';
  }
}

window.applyStoryZoom = applyStoryZoom;

function toggleStoryZoomUI() {
  var ui = document.getElementById('storyZoomControl');
  if (!ui) return;
  var isStory = (typeof activeFormat !== 'undefined' && activeFormat === 'story');
  
  // Hanya tampilkan UI Zoom jika di format Story DAN yang sedang dibuka adalah foto pertama (index 0)
  var isFirst = (currentMediaIndex === 0);
  
  ui.style.display = (isStory && isFirst) ? 'flex' : 'none';
  
  var slider = document.getElementById('storyZoomSlider');
  if (isStory && currentMediaUrl && slider) {
    var key = getStoryZoomKey(currentMediaUrl);
    var st = storyZoomState[key] || { z: 1, x: 0, y: 0 };
    slider.value = st.z;
  }
  applyStoryZoom(false);
}
window.toggleStoryZoomUI = toggleStoryZoomUI;
