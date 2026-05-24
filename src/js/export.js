// RADAR — export.js
// Silent Export Engine
// Capture creative canvas → simpan ke window.radarCreativeCanvas
// Download hanya dari Menu 2 via downloadCreative()

/* ─────────────────────────────────────────
   Output Dimensions per Platform
   ───────────────────────────────────────── */
var EXPORT_DIMENSIONS = {
  'ig-story':   { w: 1080, h: 1920 },
  'ig-reel':    { w: 1080, h: 1920 },
  'ig-post':    { w: 1080, h: 1350 },
  'ig-feed':    { w: 1080, h: 1350 },
  'tiktok':     { w: 1080, h: 1920 },
  'youtube':    { w: 1080, h: 1920 },
  'meta':       { w: 1080, h: 1350 },
  'meta-reel':  { w: 1080, h: 1920 },
  'meta-story': { w: 1080, h: 1920 }
};

/* ─────────────────────────────────────────
   exportCreativeCanvas()
   Capture .phone-shell → canvas
   Simpan ke window.radarCreativeCanvas
   Return: canvas object atau null
   ───────────────────────────────────────── */
function exportCreativeCanvas() {
  // Feature flag
  if (
    typeof RADAR_CONFIG !== 'undefined' &&
    RADAR_CONFIG.FEATURES &&
    !RADAR_CONFIG.FEATURES.export_creative
  ) {
    return Promise.resolve(null);
  }

  // Tidak ada foto → tidak perlu capture
  if (!uploadedDataURL) {
    return Promise.resolve(null);
  }

  // Cari elemen target: .phone-shell (parent dari #phoneMedia + #phoneStitch)
  var shellEl = document.querySelector('.phone-shell');
  if (!shellEl) {
    console.warn('[export] .phone-shell tidak ditemukan');
    return Promise.resolve(null);
  }

  // Tentukan dimensi output berdasarkan platform aktif
  var platform = (typeof activePlatform !== 'undefined') ? activePlatform : 'ig-story';
  var dim = EXPORT_DIMENSIONS[platform] || EXPORT_DIMENSIONS['ig-story'];

  // Hitung scale: output resolution / rendered size
  var renderedW = shellEl.offsetWidth;
  var renderedH = shellEl.offsetHeight;
  var scaleX = dim.w / (renderedW || 1);
  var scaleY = dim.h / (renderedH || 1);
  // Gunakan scale uniform — ambil yang lebih kecil agar tidak crop
  var scale = Math.min(scaleX, scaleY);
  // Minimal scale 1 untuk hindari capture buram
  if (scale < 1) scale = 1;

  // Log status #phoneStitch sebelum capture
  var stitchEl = shellEl.querySelector('#phoneStitch');
  if (stitchEl) {
    var stitchStyle = window.getComputedStyle(stitchEl);
    console.log('[export] #phoneStitch ditemukan — display:', stitchStyle.display,
      '| opacity:', stitchStyle.opacity,
      '| text:', stitchEl.textContent.slice(0, 60));
  } else {
    console.warn('[export] #phoneStitch TIDAK ditemukan di dalam .phone-shell');
  }

  // Sembunyikan chrome UI agar tidak ikut terkapture (icon TikTok, story bar, dll)
  var chromeEl = document.getElementById('phoneChrome');
  if (chromeEl) chromeEl.style.visibility = 'hidden';

  return html2canvas(shellEl, {
    scale:         scale,
    useCORS:       true,
    allowTaint:    true,
    backgroundColor: null,
    logging:       false,
    width:         renderedW,
    height:        renderedH
  }).then(function(rawCanvas) {
    // Restore chrome setelah capture
    if (chromeEl) chromeEl.style.visibility = '';

    var outCanvas = document.createElement('canvas');
    outCanvas.width  = dim.w;
    outCanvas.height = dim.h;
    var ctx = outCanvas.getContext('2d');

    // Fill background hitam dulu
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, dim.w, dim.h);

    // Hitung area sumber agar aspek rasio output terpenuhi (cover mode, tidak distorsi)
    var srcRatio = rawCanvas.width / rawCanvas.height;
    var dstRatio = dim.w / dim.h;
    var sx, sy, sw, sh;
    if (srcRatio > dstRatio) {
      // Sumber lebih lebar → crop kiri-kanan
      sh = rawCanvas.height;
      sw = Math.round(sh * dstRatio);
      sx = Math.round((rawCanvas.width - sw) / 2);
      sy = 0;
    } else {
      // Sumber lebih tinggi → crop atas-bawah
      sw = rawCanvas.width;
      sh = Math.round(sw / dstRatio);
      sx = 0;
      sy = Math.round((rawCanvas.height - sh) / 2);
    }
    ctx.drawImage(rawCanvas, sx, sy, sw, sh, 0, 0, dim.w, dim.h);

    window.radarCreativeCanvas = outCanvas;
    console.log('[export] canvas selesai — width:', outCanvas.width, '| height:', outCanvas.height,
      '| rawCanvas:', rawCanvas.width, 'x', rawCanvas.height);
    return outCanvas;
  }).catch(function(err) {
    if (chromeEl) chromeEl.style.visibility = '';
    console.error('[export] html2canvas error:', err);
    return null;
  });
}

/* ─────────────────────────────────────────
   downloadCreative()
   Ambil window.radarCreativeCanvas → download .jpg
   HANYA dipanggil dari Menu 2
   ───────────────────────────────────────── */
function downloadCreative() {
  // Feature flag
  if (
    typeof RADAR_CONFIG !== 'undefined' &&
    RADAR_CONFIG.FEATURES &&
    !RADAR_CONFIG.FEATURES.export_creative
  ) {
    return;
  }

  var canvas = window.radarCreativeCanvas;
  if (!canvas) {
    if (typeof showAnToast === 'function') {
      showAnToast('Belum ada creative yang siap. Tayangkan iklan dulu.');
    }
    return;
  }

  // Ambil nama kecamatan untuk filename
  var locEl = document.querySelector('.popup-loc');
  var kecamatan = locEl
    ? locEl.textContent.trim().split(',')[0].trim().toLowerCase().replace(/\s+/g, '-')
    : 'radar';

  // Sanitasi karakter tidak valid di nama file
  kecamatan = kecamatan.replace(/[^a-z0-9\-]/g, '') || 'radar';

  var filename = 'radar-' + kecamatan + '-' + Date.now() + '.jpg';

  // Convert ke JPEG dan trigger download
  var dataUrl = canvas.toDataURL('image/jpeg', 0.9);
  var link = document.createElement('a');
  link.href = dataUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
