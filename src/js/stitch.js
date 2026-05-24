// RADAR — stitch.js
// Smart Geo-Stitching: update stitch text and drag-to-reposition IIFE

function updateStitch() {
  if (!currentPersona) return;
  document.getElementById('stitchCard').style.display = 'block';
  /* Look up by key first, then by name fallback */
  var p = personaDB[currentPersona];
  if (!p) {
    var keys = Object.keys(personaDB);
    for (var ki = 0; ki < keys.length; ki++) {
      if (personaDB[keys[ki]].name === currentPersona) { p = personaDB[keys[ki]]; break; }
    }
  }
  if (!p) p = personaDB.General;
  /* {loc} di stitch = lokasi BISNIS (bukan target area)
     Supaya tidak misleading: "di Kotagede" padahal bisnis ada di Moyudan */
  var loc = (typeof _getBizLoc === 'function') ? _getBizLoc() : 'lokasi kami';

  /* Jika target iklan di luar region bisnis → tambah nama kota/provinsi
     Contoh: "Moyudan, Sleman" → "Moyudan, Sleman, Yogyakarta" saat target ke Surabaya */
  var _stitchProfile = {};
  try { _stitchProfile = JSON.parse(localStorage.getItem('radar_user_profile') || '{}'); } catch(e) {}
  var _sBizKab     = _stitchProfile.kabupaten || _stitchProfile.city || '';
  var _sBizKec     = _stitchProfile.kecamatan || '';
  var _sPopupFull  = document.querySelector('.popup-loc') ? document.querySelector('.popup-loc').textContent.trim() : '';
  var _sBizRegion  = (typeof _kabupatenToRegion === 'function') ? _kabupatenToRegion(_sBizKab || _sBizKec) : null;
  var _sTgtRegion  = (typeof _kabupatenToRegion === 'function') ? _kabupatenToRegion(_sPopupFull) : null;
  var _sRegionCity = { jogja:'Yogyakarta', solo:'Solo', semarang:'Semarang', jakarta:'Jakarta',
    bandung:'Bandung', surabaya:'Surabaya', malang:'Malang', medan:'Medan',
    makassar:'Makassar', bali:'Bali', manado:'Manado', palembang:'Palembang',
    pontianak:'Pontianak', banjarmasin:'Banjarmasin', lampung:'Lampung' };
  if (_sBizRegion && _sTgtRegion && (_sBizRegion !== _sTgtRegion) && _sRegionCity[_sBizRegion]) {
    loc = loc + ', ' + _sRegionCity[_sBizRegion];
  }

  var d   = getDialek();
  var usp = (typeof getUsp === 'function') ? getUsp() : '';
  var txt = p.stitch
    .replace(/\{loc\}/g,      loc)
    .replace(/\{dist\}/g,     usp)
    .replace(/\{usp\}/g,      usp)
    .replace(/\{greeting\}/g, d.greeting)
    .replace(/\{cta\}/g,      d.cta);
  var s = document.getElementById('phoneStitch');
  var isVideo = typeof uploadedVideoFile !== 'undefined' && uploadedVideoFile instanceof File;
  if (isVideo) { s.style.display = 'none'; return; }
  s.style.display = 'block'; s.textContent = txt;
}

/* ─── Phone Stitch: Dynamic Position + Inline Edit ─── */
(function initStitchDrag() {
  var stitch = document.getElementById('phoneStitch');
  if (!stitch) return;

  function updateStitchPosition() {
    var fmt = (typeof activeFormat !== 'undefined' ? activeFormat : 'post').toLowerCase();
    var ch  = (typeof activeChannel !== 'undefined' ? activeChannel : 'ig').toLowerCase();
    var isVertical = fmt === 'story' || fmt === 'reel';
    
    stitch.style.position  = 'absolute';
    stitch.style.top       = 'auto';
    stitch.style.left      = '50%';
    stitch.style.transform = 'translateX(-50%)';
    stitch.style.textAlign = 'center';

    if (isVertical) {
      // Story/Reel formats
      if (ch === 'tiktok') {
        stitch.style.bottom = '22%'; // TikTok UI
      } else if (ch === 'meta') {
        stitch.style.bottom = '16%'; // FB Story/Reel
      } else {
        stitch.style.bottom = '16%'; // IG Reel/Story
      }
    } else {
      // Post formats (Square)
      if (ch === 'meta') {
        stitch.style.bottom = '24%'; // FB Post UI (Boost post area) requires more clearance
      } else {
        stitch.style.bottom = '15%'; // IG Post
      }
    }
  }

  updateStitchPosition();

  // Update posisi saat format berubah
  document.addEventListener('formatChanged', updateStitchPosition);
  setInterval(updateStitchPosition, 500);

  // Click → edit text
  stitch.addEventListener('click', function() {
    stitch.classList.add('editing');
    stitch.focus();
    var range = document.createRange();
    range.selectNodeContents(stitch);
    range.collapse(false);
    var sel = window.getSelection();
    sel.removeAllRanges(); sel.addRange(range);
  });

  // Click di luar → selesai edit
  document.addEventListener('mousedown', function(e) {
    if (!stitch.contains(e.target) && stitch.classList.contains('editing')) {
      stitch.classList.remove('editing');
      stitch.blur();
    }
  });

  // Enter → selesai edit
  stitch.addEventListener('keydown', function(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      stitch.classList.remove('editing');
      stitch.blur();
    }
  });
})();
