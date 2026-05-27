// Ported from radar-larisi/src/js/vision.js
// Groq Vision API wrapper — sama persis logic dengan versi desktop

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://mojzmlrdihenvfhrwopd.supabase.co';
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1vanptbHJkaWhlbnZmaHJ3b3BkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYxMzY1NTUsImV4cCI6MjA5MTcxMjU1NX0.GVFuu_GcvWQwgGg4rVvzwq1gocUwtqhtTCsl8xja8l8';

/* ── Mapping: kategori Groq → personaDB key (sama persis desktop) ── */
const VISION_TO_PERSONA = {
  makanan:    'Kuliner',
  minuman:    'Kafe',
  pakaian:    null,   // ditentukan oleh biz profile
  kendaraan:  'Otomotif',
  elektronik: 'Gadget',
  properti:   'Properti',
  kosmetik:   'Beauty',
  bayi:       'Bayi',
  tanaman:    null,
  hewan:      'Pet',
  manusia:    null,
  dokumen:    'Pendidikan',
  furniture:  null,
  olahraga:   'Olahraga',
  seni:       'Seni',
  general:    null,
};

const VISION_LABELS = {
  makanan:    'Makanan',
  minuman:    'Minuman / Kafe',
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

/**
 * _compressForVision(dataURL, maxPx)
 * Resize gambar ke maxPx × maxPx, kembalikan base64 JPEG string
 * Sama persis dengan versi desktop
 */
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
      resolve(compressed.split(',')[1] || null);
    };
    img.onerror = function() { resolve(null); };
    img.src = dataURL;
  });
}

/**
 * _visionCategoryToPersonaKey(category, bizCategory)
 * Sama persis dengan versi desktop
 */
function _visionCategoryToPersonaKey(category, bizCategory) {
  if (category === 'pakaian') {
    if (bizCategory === 'fashion_muslim')      return 'FashionMuslim';
    if (bizCategory === 'fashion_muslim_pria') return 'FashionMuslimPria';
    if (bizCategory === 'fashion_pria')        return 'FashionPria';
    if (bizCategory === 'fashion' || bizCategory === 'fashion_wanita') return 'FashionWanita';
    return null;
  }
  return VISION_TO_PERSONA[category] || null;
}

/**
 * analyzeImageCategory(dataURL, bizCategory)
 * Sama persis dengan versi desktop — panggil Supabase Edge Function groq-vision
 * Return: { key, label, category }
 */
export async function analyzeImageCategory(dataURL, bizCategory) {
  try {
    var base64 = await _compressForVision(dataURL, 768);
    if (!base64) {
      console.warn('[vision] _compressForVision gagal, skip');
      return { key: null, label: 'Umum', category: 'general' };
    }

    if (!SUPABASE_URL) {
      console.warn('[vision] SUPABASE_URL tidak tersedia');
      return { key: null, label: 'Umum', category: 'general' };
    }

    var endpoint = SUPABASE_URL.replace(/\/$/, '') + '/functions/v1/groq-vision';

    var resp = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + SUPABASE_KEY,
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
    var label = VISION_LABELS[category] || 'Umum';

    console.log('[vision] Groq deteksi:', category, '→ persona key:', key);
    return { key, label, category };

  } catch(e) {
    console.warn('[vision] analyzeImageCategory error:', e.message || e);
    return { key: null, label: 'Umum', category: 'general' };
  }
}
