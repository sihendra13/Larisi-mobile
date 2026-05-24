// RADAR — persona.js
// Persona detection, scanning, display and editing

function showScanningOnly(fileCount) {
  var scanText = document.getElementById('scanText');
  if (scanText) {
    scanText.textContent = 'SiLaris sedang menganalisis kontenmu...';
  }
  document.getElementById('scanning').classList.add('visible');
  setTimeout(function() {
    document.getElementById('scanning').classList.remove('visible');
    /* Persona card stays as is — master persona unchanged */
  }, 1800);
}

function showPersonaDirect(p, detected) {
  document.getElementById('personaBadge').textContent = 'Master Persona';
  document.getElementById('personaName').textContent = p.name;
  document.getElementById('personaTarget').textContent = 'Targeting: ' + p.target;
  var ageEl = document.getElementById('personaAge');
  if (ageEl) ageEl.textContent = 'Age range: ' + p.age + ' · ' + p.gender;
  document.getElementById('personaCard').classList.add('visible');
  /* Only show Bantu AI card if NOT detected from filename */
  if (!detected) {
    document.getElementById('catNudge').classList.add('visible');
  } else {
    document.getElementById('catNudge').classList.remove('visible');
  }
  document.getElementById('genBtn').style.display = 'inline-block';
  /* Set currentPersona to actual detected persona name for caption mapping */
  currentPersona = p.name;
  captionAltIndex = 0;
  document.getElementById('stitchCard').style.display = 'block';
  updateStitch();
  generateCaptionAI();
}

/* ── Vision conflict state ── */
var _visionConflictData = null;

/**
 * _showVisionConflict(visionKey, visionLabel, bizKey, bizLabel)
 * Tampilkan nudge pilihan ketika AI mendeteksi kategori berbeda dari profil bisnis.
 * Format teks: "Foto terdeteksi: [X], profil bisnismu: [Y]. Promosi apa hari ini?"
 */
function _showVisionConflict(visionKey, visionLabel, bizKey, bizLabel) {
  _visionConflictData = { visionKey: visionKey, bizKey: bizKey };

  var vc = document.getElementById('visionConflict');
  if (!vc) {
    /* Tidak ada UI konflik — langsung pakai hasil AI */
    _applyVisionPersona(visionKey);
    return;
  }

  /* Label profil bisnis: nama persona dari DB, atau label kategori, atau fallback */
  var bizPersonaName = (typeof personaDB !== 'undefined' && bizKey && personaDB[bizKey])
    ? personaDB[bizKey].name
    : (bizLabel || 'Konten Umum');

  /* Render teks sesuai spec */
  var qEl = document.getElementById('conflictQuestion');
  if (qEl) {
    qEl.innerHTML =
      'SiLaris mendeteksi foto ini sebagai <strong>' + visionLabel + '</strong>, ' +
      'tapi fokus bisnismu di <strong>' + bizPersonaName + '</strong>. ' +
      'Apakah foto ini sudah benar?';
  }

  vc.classList.add('visible');
}

/**
 * _applyVisionPersona(key)
 * Terapkan persona dari kunci personaDB, lock master persona.
 */
function _applyVisionPersona(key) {
  var p = (typeof personaDB !== 'undefined' && personaDB[key]) || (personaDB && personaDB.General);
  if (!p) return;
  currentPersona = key;
  captionAltIndex = 0;
  showPersonaDirect({
    name:   p.name,
    target: p.target,
    age:    p.age || (p.tags && p.tags[0]) || 'Usia 18–45',
    gender: p.gender || 'Mixed',
  }, true /* detected = true → sembunyikan catNudge */);
  masterPersonaLocked = true;
}

/**
 * _resolveConflict(useVision)
 * Dipanggil dari tombol di #visionConflict.
 * useVision=true  → pakai hasil AI
 * useVision=false → pakai profil bisnis
 */
function _resolveConflict(useVision) {
  var vc = document.getElementById('visionConflict');
  if (vc) vc.classList.remove('visible');

  if (!_visionConflictData) return;

  var key = useVision
    ? _visionConflictData.visionKey
    : (_visionConflictData.bizKey || 'General'); /* null bizKey = General */
  _visionConflictData = null;
  _applyVisionPersona(key);
}
window._resolveConflict = _resolveConflict;

/**
 * _changePhotoConflict()
 * User memilih "Ganti foto" — hapus foto konflik, reset state upload,
 * lalu buka file picker. Upload berikutnya diperlakukan sebagai first upload
 * sehingga AI scan berjalan lagi dan conflict card bisa muncul ulang bila perlu.
 */
function _changePhotoConflict() {
  /* Tutup conflict panel */
  var vc = document.getElementById('visionConflict');
  if (vc) vc.classList.remove('visible');
  _visionConflictData = null;
  masterPersonaLocked = false;

  /* Hapus semua thumbnail dan reset state upload —
     supaya upload berikutnya dianggap first upload (isFirstUpload = true)
     dan startScanWithFile() terpanggil dengan benar */
  var thumbs = document.getElementById('thumbs');
  var uz     = document.getElementById('uploadZone');
  if (thumbs) { thumbs.innerHTML = ''; thumbs.style.display = 'none'; }
  if (uz)     uz.style.display = '';
  if (typeof uploadedDataURLs !== 'undefined') uploadedDataURLs = [];
  if (typeof uploadMode       !== 'undefined') uploadMode       = null;

  /* Sembunyikan persona card & catNudge */
  var pcEl = document.getElementById('personaCard');
  if (pcEl) pcEl.classList.remove('visible');
  var cnEl = document.getElementById('catNudge');
  if (cnEl) cnEl.classList.remove('visible');

  /* Buka file picker */
  var fi = document.getElementById('fileInput');
  if (fi) fi.click();
}
window._changePhotoConflict = _changePhotoConflict;

/**
 * startScanWithFile(filename, fileCount)
 * Async — tunggu base64 dari FileReader, panggil Groq Vision,
 * lalu tampilkan persona atau conflict nudge.
 * Minimum 2 detik animasi scanning agar UX terasa natural.
 */
async function startScanWithFile(filename, fileCount) {
  if (masterPersonaLocked) {
    showScanningOnly(fileCount);
    return;
  }

  var startTime = Date.now();

  var scanText = document.getElementById('scanText');
  document.getElementById('scanning').classList.add('visible');
  document.getElementById('personaCard').classList.remove('visible');
  document.getElementById('catNudge').classList.remove('visible');
  var vc = document.getElementById('visionConflict');
  if (vc) vc.classList.remove('visible');

  /* ── VIDEO: tidak bisa dianalisis Groq — cek filename dulu, fallback ke profil bisnis ── */
  var isVideo = (typeof uploadMode !== 'undefined' && uploadMode === 'video');
  if (isVideo) {
    if (scanText) scanText.textContent = 'SiLaris sedang menyiapkan kontenmu...';
    await new Promise(function(r) { setTimeout(r, 1000); });
    document.getElementById('scanning').classList.remove('visible');

    var _pVid       = detectPersona(filename);
    var _detVid     = _pVid.name !== 'General Content';
    var _bizCatVid  = window.userBizProfile && window.userBizProfile.category;
    var _bizKeyVid  = _bizCatVid && (typeof _BIZ_CAT_TO_TILE !== 'undefined')
                        ? (_BIZ_CAT_TO_TILE[_bizCatVid] || null) : null;

    if (_detVid) {
      /* Filename mendeteksi kategori spesifik (mis. vespa, hijab, gadget)
         → cari key personaDB yang cocok, lalu cek konflik */
      var _fnKeyVid = null;
      if (typeof personaDB !== 'undefined') {
        var _fkKeys = Object.keys(personaDB);
        for (var _fki = 0; _fki < _fkKeys.length; _fki++) {
          if (personaDB[_fkKeys[_fki]].name === _pVid.name) { _fnKeyVid = _fkKeys[_fki]; break; }
        }
      }

      if (_fnKeyVid && _bizKeyVid && _fnKeyVid !== _bizKeyVid) {
        /* Konflik: filename beda dari profil bisnis → tanya user */
        var _bizLblVid = personaDB[_bizKeyVid] ? personaDB[_bizKeyVid].name : (_bizCatVid || 'Konten Umum');
        _showVisionConflict(_fnKeyVid, _pVid.name, _bizKeyVid, _bizLblVid);
      } else {
        /* Tidak konflik atau profil bisnis tidak dikenali → pakai hasil filename */
        _applyVisionPersona(_fnKeyVid || (_bizKeyVid || null));
        if (!_fnKeyVid && !_bizKeyVid) { showPersonaDirect(_pVid, true); masterPersonaLocked = true; }
      }
    } else {
      /* Filename generik (TEs AI podcast, dll) → pakai profil bisnis */
      if (_bizKeyVid) {
        _applyVisionPersona(_bizKeyVid);
      } else {
        /* Tidak ada profil bisnis juga → catNudge */
        showPersonaDirect(_pVid, false);
        masterPersonaLocked = true;
      }
    }
    return;
  }

  if (scanText) scanText.textContent = 'SiLaris sedang menganalisis kontenmu...';

  /* ── Tunggu base64 dari FileReader (async, max 3 detik) ── */
  var base64 = null;
  if (typeof uploadedDataURLs !== 'undefined') {
    for (var _i = 0; _i < 30; _i++) {
      if (uploadedDataURLs[0]) { base64 = uploadedDataURLs[0]; break; }
      await new Promise(function(r) { setTimeout(r, 100); });
    }
  }

  /* ── Panggil Groq Vision bila tersedia ── */
  var visionKey      = null;
  var visionLabel    = null;

  if (base64 && typeof analyzeImageCategory === 'function') {
    try {
      var bizCat = window.userBizProfile && window.userBizProfile.category;
      var vResult = await analyzeImageCategory(base64, bizCat);
      if (vResult.key) {
        visionKey   = vResult.key;
        visionLabel = vResult.label;
      }
    } catch(e) {
      console.warn('[persona] vision call error:', e);
    }
  }

  /* ── Pastikan animasi minimal 2 detik ── */
  var elapsed   = Date.now() - startTime;
  var remaining = Math.max(0, 2000 - elapsed);
  if (remaining > 0) {
    await new Promise(function(r) { setTimeout(r, remaining); });
  }

  document.getElementById('scanning').classList.remove('visible');

  if (visionKey) {
    /* ── Cek konflik dengan profil bisnis ── */
    var bizCategory = window.userBizProfile && window.userBizProfile.category;

    /* Fallback: kalau userBizProfile belum selesai load dari Supabase,
       baca dari localStorage (cache) agar conflict check tetap bisa jalan */
    if (!bizCategory) {
      try {
        var _cached = JSON.parse(localStorage.getItem('radar_user_profile') || '{}');
        bizCategory = _cached.category || null;
      } catch(e) {}
    }

    if (!bizCategory) {
      /* Benar-benar tidak ada profil bisnis → langsung pakai hasil AI */
      _applyVisionPersona(visionKey);
    } else {
      /* Petakan kategori biz ke persona key.
         Jika kategori biz tidak ada di mapping → null (General) */
      var bizTileKey = (typeof _BIZ_CAT_TO_TILE !== 'undefined')
        ? (_BIZ_CAT_TO_TILE[bizCategory] || null)
        : null;

      /* Label untuk biz: nama persona DB, atau nama kategori biz itu sendiri */
      var bizLabelForUI = bizTileKey && personaDB && personaDB[bizTileKey]
        ? personaDB[bizTileKey].name
        : (bizCategory || 'Konten Umum');

      /* Ada konflik hanya jika biz key TERDEFINISI dan berbeda dari vision key.
         bizTileKey null = kategori bisnis terlalu luas (jasa, retail, dll) → catNudge */
      var hasConflict = bizTileKey !== null && bizTileKey !== visionKey;

      if (hasConflict) {
        _showVisionConflict(visionKey, visionLabel, bizTileKey, bizLabelForUI);
      } else if (bizTileKey === null) {
        /* Biz kategori terlalu luas → tampilkan catNudge, jangan auto-apply */
        var _vp = personaDB[visionKey] || personaDB.General;
        showPersonaDirect({ name: _vp.name, target: _vp.target, age: _vp.age || '18–45', gender: _vp.gender || 'Mixed' }, false);
        masterPersonaLocked = true;
      } else {
        _applyVisionPersona(visionKey);
      }
    }
  } else {
    /* Fallback ke deteksi berbasis nama file */
    var p        = detectPersona(filename);
    var detected = p.name !== 'General Content';

    if (detected) {
      /* Cari personaDB key yang cocok dengan nama yang terdeteksi */
      var filenameKey = null;
      if (typeof personaDB !== 'undefined') {
        var _keys = Object.keys(personaDB);
        for (var _k = 0; _k < _keys.length; _k++) {
          if (personaDB[_keys[_k]].name === p.name) { filenameKey = _keys[_k]; break; }
        }
      }

      /* Jika ada key yang cocok, cek konflik dengan profil bisnis */
      if (filenameKey) {
        var _bizCat2 = window.userBizProfile && window.userBizProfile.category;
        /* localStorage fallback — fix race condition bila Supabase belum selesai load */
        if (!_bizCat2) {
          try {
            var _cached2 = JSON.parse(localStorage.getItem('radar_user_profile') || '{}');
            _bizCat2 = _cached2.category || null;
          } catch(e) {}
        }
        if (_bizCat2) {
          var _bizKey2   = (typeof _BIZ_CAT_TO_TILE !== 'undefined') ? (_BIZ_CAT_TO_TILE[_bizCat2] || null) : null;
          var _bizLbl2   = _bizKey2 && personaDB && personaDB[_bizKey2] ? personaDB[_bizKey2].name : (_bizCat2 || 'Konten Umum');
          var _conflict2 = _bizKey2 !== null && _bizKey2 !== filenameKey;
          if (_conflict2) {
            _showVisionConflict(filenameKey, p.name, _bizKey2, _bizLbl2);
            return;
          }
          if (_bizKey2 === null) {
            /* Biz kategori terlalu luas → catNudge */
            showPersonaDirect(p, false);
            masterPersonaLocked = true;
            return;
          }
          /* Tidak konflik, biz key valid → pakai biz persona */
          _applyVisionPersona(_bizKey2);
          return;
        }
      }

      /* Bug 1 fix: orphan persona (filenameKey null) atau _bizCat2 masih null setelah fallback
         → cek profil bisnis sebelum apply persona dari filename */
      var _bizCatFb = window.userBizProfile && window.userBizProfile.category;
      if (!_bizCatFb) {
        try {
          var _cachedFb = JSON.parse(localStorage.getItem('radar_user_profile') || '{}');
          _bizCatFb = _cachedFb.category || null;
        } catch(e) {}
      }
      var _bizKeyFb = _bizCatFb && (typeof _BIZ_CAT_TO_TILE !== 'undefined')
        ? (_BIZ_CAT_TO_TILE[_bizCatFb] || null) : null;
      if (_bizKeyFb) {
        _applyVisionPersona(_bizKeyFb);
        return;
      }
      /* Tidak ada profil bisnis spesifik → catNudge */
      showPersonaDirect(p, false);
      masterPersonaLocked = true;
      return;
    }

    if (!detected) {
      /* Bug 2 fix: filename generik → cek profil bisnis sebelum fallback ke catNudge */
      var _bizCatGen = window.userBizProfile && window.userBizProfile.category;
      if (!_bizCatGen) {
        try {
          var _cachedGen = JSON.parse(localStorage.getItem('radar_user_profile') || '{}');
          _bizCatGen = _cachedGen.category || null;
        } catch(e) {}
      }
      var _bizKeyGen = _bizCatGen && (typeof _BIZ_CAT_TO_TILE !== 'undefined')
        ? (_BIZ_CAT_TO_TILE[_bizCatGen] || null) : null;
      if (_bizKeyGen) {
        _applyVisionPersona(_bizKeyGen);
        return;
      }
      /* Tidak ada profil bisnis spesifik → catNudge */
      showPersonaDirect(p, false);
      masterPersonaLocked = true;
      return;
    }
  }
}

function startScan() { startScanWithFile(''); }

function selectCat(el, cat) {
  document.querySelectorAll('.cat-tile').forEach(function(t){ t.classList.remove('selected'); });
  el.classList.add('selected');
  document.getElementById('catNudge').classList.remove('visible');
  setTimeout(function(){
    var p = personaDB[cat] || personaDB.General;
    currentPersona = cat; /* set FIRST so updateStitch() and generateCaptionAI() have it */
    captionAltIndex = 0;
    showPersonaFromCat({name:p.name, target:p.target, age:p.tags?p.tags[0]:'Usia 18–45', gender:p.gender||'Mixed'});
    generateCaptionAI();
  }, 300);
}

function showPersonaFromCat(p) {
  /* Called when user manually picks category — show edit btn, hide catNudge permanently until edit clicked */
  document.getElementById('personaBadge').textContent = 'Master Persona';
  document.getElementById('personaName').textContent = p.name;
  document.getElementById('personaTarget').textContent = 'Targeting: ' + p.target;
  var ageEl = document.getElementById('personaAge');
  if (ageEl) ageEl.textContent = 'Age range: ' + p.age + ' · ' + (p.gender || 'Mixed');
  document.getElementById('personaCard').classList.add('visible');
  document.getElementById('catNudge').classList.remove('visible');
  /* Show edit button — outline style, only for manual category pick */
  var editBtn = document.getElementById('personaEditBtn');
  if (editBtn) {
    editBtn.innerHTML = '<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg> Edit';
    editBtn.style.display = 'flex';
  }
  document.getElementById('genBtn').style.display = 'inline-block';
  /* Always show stitchCard + fill phoneStitch when persona is set */
  document.getElementById('stitchCard').style.display = 'block';
  updateStitch();
}

function showPersona(key, boosted) {
  currentPersona = key;
  var p = personaDB[key] || personaDB.General;
  var conf = boosted ? Math.min(p.conf+7, 97) : p.conf;
  if (conf < 70) document.getElementById('catNudge').classList.add('visible');
  document.getElementById('personaBadge').textContent = 'Master Persona';
  document.getElementById('personaName').textContent = p.name;
  document.getElementById('personaTarget').textContent = 'Targeting: ' + p.target;
  var ageEl = document.getElementById('personaAge');
  if (ageEl) ageEl.textContent = 'Age range: ' + (p.age || p.tags[0] || '18–45') + ' · ' + (p.gender || 'Mixed');
  document.getElementById('personaCard').classList.add('visible');
  document.getElementById('genBtn').style.display = 'block';
  generateCaptionAI(); updateStitch();
  document.getElementById('stitchCard').style.display = 'block';
}

function openEditPersona() {
  /* Hide persona card, show Bantu AI for re-pick */
  document.getElementById('personaCard').classList.remove('visible');
  document.getElementById('catNudge').classList.add('visible');
  /* Hide edit btn */
  var editBtn = document.getElementById('personaEditBtn');
  if (editBtn) editBtn.style.display = 'none';
}

/* ── Mapping: onboarding category → cat-tile cat value ── */
var _BIZ_CAT_TO_TILE = {
  fnb:              'Kuliner',
  kafe:             'Kafe',
  fashion:          'FashionWanita',   // legacy fallback
  fashion_wanita:   'FashionWanita',
  fashion_pria:     'FashionPria',
  fashion_muslim:   'FashionMuslim',
  fashion_muslim_pria: 'FashionMuslimPria',
  kesehatan:        'Beauty',
  salon:            'Salon',
  barber:           'Barber',
  elektronik:       'Gadget',
  properti:         'Properti',
  wisata:           'Wisata',
  otomotif:         'Otomotif',
  pendidikan:       'Pendidikan',
  kerajinan:        'Kerajinan',
  olahraga:         'Olahraga',
  /* ── Kategori baru (Opsi A) ── */
  laundry:          'KebersihanLaundry',
  fotografi:        'Fotografi',
  catering:         'EventCatering',
  jasa_profesional: 'JasaProfesional',
  pet:              'Pet'
  // jasa, retail, lainnya → terlalu luas → catNudge manual (user pilih sendiri)
};

/**
 * _autoSelectFromBizProfile()
 * Called on DOMContentLoaded. If user completed onboarding with a business
 * category, pre-select the matching persona tile so caption + stitch are
 * immediately relevant — without requiring a file upload.
 * Only runs if the master persona hasn't been locked yet.
 */
function _autoSelectFromBizProfile() {
  if (masterPersonaLocked) return;
  var biz = window.userBizProfile && window.userBizProfile.category;
  if (!biz) return;
  var tileKey = _BIZ_CAT_TO_TILE[biz];
  if (!tileKey) return;

  /* Find matching tile and simulate click */
  var tiles = document.querySelectorAll('.cat-tile');
  for (var i = 0; i < tiles.length; i++) {
    var onclick = tiles[i].getAttribute('onclick') || '';
    if (onclick.indexOf("'" + tileKey + "'") !== -1 || onclick.indexOf('"' + tileKey + '"') !== -1) {
      selectCat(tiles[i], tileKey);
      return;
    }
  }
}
