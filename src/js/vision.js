// RADAR — vision.js
// Groq Vision API wrapper untuk Master Persona detection
// Dipanggil dari persona.js → startScanWithFile()

/* ─────────────────────────────────────────
   Mapping: kategori Groq → personaDB key
   ───────────────────────────────────────── */
var _VISION_TO_PERSONA = {
  makanan:    'Kuliner',
  minuman:    'Kafe',      // foto minuman → konteks cafe lebih umum dari warung makan
  pakaian:    null,  // ditentukan oleh biz profile via _visionCategoryToPersonaKey
  kendaraan:  'Otomotif',
  elektronik: 'Gadget',
  properti:   'Properti',
  kosmetik:   'Beauty',    // produk kosmetik/skincare → Beauty
  bayi:       'Bayi',
  tanaman:    null,
  hewan:      'Pet',
  manusia:    null,             // selfie/orang → tidak konklusif
  dokumen:    'Pendidikan',  // dokumen/buku/materi → konteks pendidikan
  furniture:  null,
  olahraga:   'Olahraga',
  seni:       'Seni',
  general:    null,
};

/* Label ramah untuk ditampilkan di UI konflik */
var _VISION_LABELS = {
  makanan:    'Makanan',
  minuman:    'Minuman / Minuman',
  pakaian:    'Pakaian / Fashion',
  kendaraan:  'Kendaraan',
  elektronik: 'Elektronik / Gadget',
  properti:   'Properti',
  kosmetik:   'Kosmetik / Beauty',
  bayi:       'Produk Bayi',
  tanaman:    'Tanaman',
  hewan:      'Hewan Peliharaan',
  manusia:    'Orang / Konten Manusia',
  dokumen:    'Dokumen',
  furniture:  'Furniture / Perabot',
  olahraga:   'Olahraga',
  seni:       'Seni / Kreatif',
  general:    'Umum',
};

/* ─────────────────────────────────────────
   _compressForVision(dataURL, maxPx)
   Resize gambar ke maxPx × maxPx, kembalikan
   base64 JPEG string (tanpa prefix data:...)
   ───────────────────────────────────────── */
function _compressForVision(dataURL, maxPx) {
  maxPx = maxPx || 512;
  return new Promise(function(resolve) {
    var img = new Image();
    img.onload = function() {
      var w = img.naturalWidth  || img.width;
      var h = img.naturalHeight || img.height;
      var scale = Math.min(maxPx / w, maxPx / h, 1);
      var canvas = document.createElement('canvas');
      canvas.width  = Math.round(w * scale);
      canvas.height = Math.round(h * scale);
      var ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      var compressed = canvas.toDataURL('image/jpeg', 0.82);
      // Kembalikan hanya bagian base64 (setelah koma)
      resolve(compressed.split(',')[1] || null);
    };
    img.onerror = function() { resolve(null); };
    img.src = dataURL;
  });
}

/* ─────────────────────────────────────────
   _visionCategoryToPersonaKey(category, bizCategory)
   Petakan kategori Groq ke personaDB key,
   dengan pertimbangan biz profile untuk 'pakaian'.
   ───────────────────────────────────────── */
function _visionCategoryToPersonaKey(category, bizCategory) {
  if (category === 'pakaian') {
    if (bizCategory === 'fashion_muslim')      return 'FashionMuslim';
    if (bizCategory === 'fashion_muslim_pria') return 'FashionMuslimPria';
    if (bizCategory === 'fashion_pria')        return 'FashionPria';
    if (bizCategory === 'fashion' || bizCategory === 'fashion_wanita') return 'FashionWanita';
    // Kategori non-fashion (jasa, fnb, dll) → tidak konklusif, fallback ke deteksi filename
    return null;
  }
  return _VISION_TO_PERSONA[category] || null;
}

/* ─────────────────────────────────────────
   analyzeImageCategory(dataURL, bizCategory)
   Main entry point — kompres lalu panggil
   Edge Function groq-vision.
   Return: { key, label, category }
     key      = personaDB key (atau null jika tidak konklusif)
     label    = label ramah untuk UI
     category = kata kategori mentah dari Groq
   ───────────────────────────────────────── */
async function analyzeImageCategory(dataURL, bizCategory) {
  try {
    var base64 = await _compressForVision(dataURL, 768);
    if (!base64) {
      console.warn('[vision] _compressForVision gagal, skip');
      return { key: null, label: 'Umum', category: 'general' };
    }

    // Ambil URL & key dari config global
    var supabaseUrl = (window.radarSupabaseUrl) || '';
    var supabaseKey = (window.radarSupabaseKey) || '';
    if (!supabaseUrl) {
      console.warn('[vision] radarSupabaseUrl tidak tersedia');
      return { key: null, label: 'Umum', category: 'general' };
    }

    var endpoint = supabaseUrl.replace(/\/$/, '') + '/functions/v1/groq-vision';

    var resp = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + supabaseKey,
        'Content-Type':  'application/json',
      },
      body: JSON.stringify({ image: base64, mime: 'image/jpeg' }),
    });

    if (!resp.ok) {
      console.warn('[vision] Edge Function error:', resp.status);
      return { key: null, label: 'Umum', category: 'general' };
    }

    var data = await resp.json();
    var category = (data && data.category) ? data.category : 'general';

    var key   = _visionCategoryToPersonaKey(category, bizCategory);
    var label = _VISION_LABELS[category] || 'Umum';

    console.log('[vision] Groq deteksi:', category, '→ persona key:', key);
    return { key: key, label: label, category: category };

  } catch(e) {
    console.warn('[vision] analyzeImageCategory error:', e.message || e);
    return { key: null, label: 'Umum', category: 'general' };
  }
}

window.analyzeImageCategory = analyzeImageCategory;
