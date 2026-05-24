// RADAR — caption.js
// Caption generation, typewriter effect, tone selection

function typewriterEffect(text, callback) {
  if (typewriterTimer) clearInterval(typewriterTimer);
  var area = document.getElementById('captionArea');
  area.value = '';
  isTyping = true;
  var i = 0;
  var speed = text.length > 200 ? 12 : 18; /* faster for long text */
  typewriterTimer = setInterval(function() {
    if (i < text.length) {
      area.value += text.charAt(i);
      area.scrollTop = area.scrollHeight;
      i++;
    } else {
      clearInterval(typewriterTimer);
      isTyping = false;
      area.scrollTop = 0; /* scroll ke atas setelah selesai — user lihat awal caption */
      if (callback) callback();
    }
  }, speed);
}

function getCurrentPlatformKey() {
  /* Map activePlatform to CAPTION_TEMPLATES key */
  if (activePlatform === 'ig-story') return 'ig-story';
  if (activePlatform === 'tiktok')   return 'tiktok';
  if (activePlatform === 'youtube')  return 'youtube';
  if (activePlatform === 'meta')     return 'meta';
  return 'ig-story';
}

/* Mapping: onboarding category → caption template key */
var _BIZ_CAT_TO_CAPTION = {
  /* ── Kuliner ── */
  fnb:                 'Kuliner',
  kafe:                'Kuliner/Cafe',
  /* ── Fashion ── */
  fashion:             'Fashion',          /* legacy fallback */
  fashion_wanita:      'Fashion',
  fashion_pria:        'FashionPria',
  fashion_muslim:      'FashionMuslim',
  fashion_muslim_pria: 'FashionMuslim',
  /* ── Kecantikan & Perawatan ── */
  kesehatan:           'Beauty/Self-care',
  salon:               'Beauty/Self-care',
  barber:              'General',
  /* ── Properti & Pendidikan ── */
  properti:            'Real Estate',
  pendidikan:          'Literature & Education',
  /* ── Gaya Hidup & Hobi ── */
  wisata:              'Tourism',
  olahraga:            'Sports Apparel',
  kerajinan:           'Creative/Arts',
  pet:                 'Pet Supplies',
  /* ── Jasa & Layanan ── */
  jasa:                'JasaProfesional',
  jasa_profesional:    'JasaProfesional',
  catering:            'EventCatering',
  laundry:             'KebersihanLaundry',
  fotografi:           'Fotografi',
  /* ── Produk & Retail ── */
  retail:              'General',
  elektronik:          'Tech/Electronics',
  otomotif:            'Retro Automotive',
  /* ── Fallback ── */
  lainnya:             'General'
};

function getPersonaKey() {
  if (!currentPersona) {
    // Fallback: use business category from onboarding if no persona set yet
    var biz = window.userBizProfile && window.userBizProfile.category;
    if (biz && _BIZ_CAT_TO_CAPTION[biz] && _BIZ_CAT_TO_CAPTION[biz] !== 'General') {
      return _BIZ_CAT_TO_CAPTION[biz];
    }
    return 'General';
  }
  var p = currentPersona.toLowerCase();

  /* Match persona name to caption template key */
  if (p.indexOf('kuliner') !== -1 || p.indexOf('culinary') !== -1) return 'Kuliner';
  if (p.indexOf('cafe') !== -1 || p.indexOf('coffee') !== -1) return 'Kuliner/Cafe';
  if (p.indexOf('muslim') !== -1 || p.indexOf('hijab') !== -1 || p.indexOf('gamis') !== -1 || p.indexOf('syari') !== -1 || p.indexOf('kerudung') !== -1 || p.indexOf('fashionmuslim') !== -1) return 'FashionMuslim';
  if (p === 'fashionpria' || (p.indexOf('pria') !== -1 && p.indexOf('fashion') !== -1)) return 'FashionPria';
  if (p.indexOf('fashion') !== -1 || p.indexOf('modest') !== -1 || p.indexOf('heritage') !== -1 || p.indexOf('wanita') !== -1 || p.indexOf('modern') !== -1 || p.indexOf('trendy') !== -1) return 'Fashion';
  if (p.indexOf('real estate') !== -1 || p.indexOf('properti') !== -1 || p.indexOf('rumah') !== -1) return 'Real Estate';
  if (p.indexOf('beauty') !== -1 || p.indexOf('skincare') !== -1 || p.indexOf('self-care') !== -1) return 'Beauty/Self-care';
  if (p.indexOf('tourism') !== -1 || p.indexOf('wisata') !== -1 || p.indexOf('travel') !== -1) return 'Tourism';
  if (p.indexOf('automotive') !== -1 || p.indexOf('vespa') !== -1 || p.indexOf('motor') !== -1) return 'Retro Automotive';
  if (p.indexOf('fotografi') !== -1 || p.indexOf('photography') !== -1) return 'Fotografi';
  if (p.indexOf('jasaprofesional') !== -1 || p.indexOf('jasa profesional') !== -1) return 'JasaProfesional';
  if (p.indexOf('eventcatering') !== -1 || p.indexOf('event & catering') !== -1 || p.indexOf('event catering') !== -1) return 'EventCatering';
  if (p.indexOf('kebersihanlaundry') !== -1 || p.indexOf('kebersihan & laundry') !== -1 || p.indexOf('laundry') !== -1) return 'KebersihanLaundry';
  if (p.indexOf('general') !== -1) {
    // Even for 'General' persona, try to improve with biz profile category
    var bizFallback = window.userBizProfile && window.userBizProfile.category;
    if (bizFallback && _BIZ_CAT_TO_CAPTION[bizFallback] && _BIZ_CAT_TO_CAPTION[bizFallback] !== 'General') {
      return _BIZ_CAT_TO_CAPTION[bizFallback];
    }
    return 'General';
  }
  // Final fallback: check biz profile before returning General
  var bizFallback = window.userBizProfile && window.userBizProfile.category;
  if (bizFallback && _BIZ_CAT_TO_CAPTION[bizFallback] && _BIZ_CAT_TO_CAPTION[bizFallback] !== 'General') {
    return _BIZ_CAT_TO_CAPTION[bizFallback];
  }
  return 'General';
}

function getUsp() {
  var profile = {};
  try { profile = JSON.parse(localStorage.getItem('radar_user_profile') || '{}'); } catch(e) {}
  if (profile.usp && profile.usp.trim()) return profile.usp.trim();
  var category = profile.category || 'lainnya';
  var fallbacks = {
    fnb:                 'Cita rasa yang bikin balik lagi',
    kafe:                'Tempat ngopi paling nyaman',
    fashion_wanita:      'Koleksi fashion wanita terlengkap',
    fashion_pria:        'Outfit pria yang selalu on point',
    fashion_muslim:      'Koleksi muslimah syari dan stylish',
    fashion_muslim_pria: 'Koleksi koko dan gamis terbaik',
    kesehatan:           'Perawatan kulit yang terbukti',
    salon:               'Perawatan profesional terpercaya',
    barber:              'Cukur rapi dan stylish',
    elektronik:          'Gadget lengkap bergaransi resmi',
    otomotif:            'Servis terpercaya bersertifikat',
    properti:            'Hunian impian keluarga',
    pendidikan:          'Belajar lebih mudah dan menyenangkan',
    wisata:              'Pengalaman wisata tak terlupakan',
    kerajinan:           'Kerajinan tangan otentik lokal',
    retail:              'Kebutuhan sehari-hari lengkap',
    olahraga:            'Peralatan & komunitas olahraga terlengkap',
    laundry:             'Bersih sempurna, antar-jemput tersedia',
    fotografi:           'Foto profesional hasil berkualitas studio',
    catering:            'Masakan lezat, pelayanan bintang lima',
    jasa_profesional:    'Solusi profesional cepat dan terpercaya',
    pet:                 'Perawatan hewan penuh kasih dan profesional',
    lainnya:             'Pilihan terbaik untuk kamu'
  };
  return fallbacks[category] || 'Pilihan terbaik untuk kamu';
}

function _capitalizeLoc(str) {
  /* Kapitalisasi huruf pertama tiap kata: "moyudan, sleman" → "Moyudan, Sleman" */
  return str.replace(/\b\w/g, function(c) { return c.toUpperCase(); });
}

function _getBizLoc() {
  /* Lokasi BISNIS dari profil onboarding — bukan dari peta target */
  var profile = {};
  try { profile = JSON.parse(localStorage.getItem('radar_user_profile') || '{}'); } catch(e) {}
  var kec = _capitalizeLoc((profile.kecamatan || '').trim());
  var kab = _capitalizeLoc((profile.kabupaten || profile.city || '').trim());
  if (kec && kab) return kec + ', ' + kab;
  return kec || kab || 'lokasi kami';
}

function _getTargetArea() {
  /* Area TARGET IKLAN dari peta — bukan lokasi bisnis */
  var popupLoc = document.querySelector('.popup-loc');
  return popupLoc ? popupLoc.textContent.split(',')[0].trim() : _getBizLoc();
}

function getDistText(format) {
  var profile = {};
  try { profile = JSON.parse(localStorage.getItem('radar_user_profile') || '{}'); } catch(e) {}
  var hasDelivery = profile.delivery_service || false;
  var category    = profile.category || '';
  var loc = _getBizLoc(); /* selalu lokasi BISNIS, bukan target map */
  var jasaCategories = ['jasa', 'salon', 'barber', 'pendidikan'];
  var isJasa = jasaCategories.indexOf(category) !== -1;
  if (format === 'short') {
    if (category === 'fnb' || category === 'kafe')      return hasDelivery ? 'Antar ke rumahmu 🛵' : 'Makan di sini 🍽';
    if (category.indexOf('fashion') !== -1)              return hasDelivery ? 'Antar ke rumahmu 🛵' : 'Koleksi baru hadir 🛍';
    if (category === 'otomotif')                         return 'Servis di ' + loc + ' 🔧';
    if (category === 'properti')                         return 'Lokasi strategis 📍';
    if (category === 'wisata')                           return 'Destinasi menunggu kamu 🗺';
    if (isJasa)                                          return 'Booking sekarang 📱';
    if (hasDelivery)                                     return 'Antar ke rumahmu 🛵';
    return 'Di ' + loc + ' 📍';
  }
  if (isJasa)      return 'area ' + loc;
  if (hasDelivery) return loc + ' — melayani pengiriman';
  return loc;
}

function fillCaptionVars(text) {
  var loc  = _getBizLoc();     /* {loc}  = lokasi BISNIS (dari profil) */
  var area = _getTargetArea(); /* {area} = area TARGET IKLAN (dari peta) */
  var dist = getDistText('long');
  var usp  = getUsp();
  var d    = getDialek();

  // Kalau {usp} muncul standalone (setelah titik/newline), bungkus dengan framing
  // supaya tidak terasa mentah copy-paste dari input user
  var uspOut = usp;
  if (/(?:\.|\n)\s*\{usp\}/.test(text)) {
    var u = usp.replace(/\.$/, '');
    var frames = [
      'Keunggulan kami: ' + u,
      'Yang bikin kami beda — ' + u,
      u + ' — itulah yang bikin kami istimewa',
      'Satu hal yang selalu dipuji pelanggan: ' + u,
      'Rahasia kami? ' + u
    ];
    uspOut = frames[captionAltIndex % frames.length];
  }

  return text
    .replace(/\{loc\}/g,      loc)
    .replace(/\{area\}/g,     area)
    .replace(/\{dist\}/g,     dist)
    .replace(/\{usp\}/g,      uspOut)
    .replace(/\{greeting\}/g, d.greeting)
    .replace(/\{cta\}/g,      d.cta);
}

function generateCaption(cycle) {
  if (!currentPersona) return;
  var platKey    = getCurrentPlatformKey();
  var personaKey = getPersonaKey();
  var templates  = CAPTION_TEMPLATES[platKey] || CAPTION_TEMPLATES['ig-story'];
  var alts       = templates[personaKey] || templates['General'];

  if (cycle) {
    captionAltIndex = (captionAltIndex + 1) % alts.length;
  } else {
    captionAltIndex = 0;
  }

  var raw  = alts[captionAltIndex];
  var text = fillCaptionVars(raw);
  typewriterEffect(text);
}

// ── AI Caption Generator ──────────────────────────────────────────────────────
var _aiCallCount = 0; /* Counter naik setiap generateCaptionAI() dipanggil — untuk rotasi hook style */
async function generateCaptionAI() {
  if (!currentPersona) return;
  _aiCallCount++;

  var profile = {};
  try { profile = JSON.parse(localStorage.getItem('radar_user_profile') || '{}'); } catch(e) {}

  var personaName   = currentPersona || 'General';
  var personaTarget = (document.getElementById('personaTarget') || {}).textContent || '';
  personaTarget = personaTarget.replace('Targeting: ', '').trim();
  var personaAge    = (document.getElementById('personaAge') || {}).textContent || '';
  personaAge = personaAge.replace('Age range: ', '').trim();

  var usp          = getUsp();
  var bizName      = profile.business_name || '';
  var category     = profile.category || '';
  var hasDelivery  = profile.delivery_service || false;

  /* Lokasi bisnis — dari profil onboarding, sudah di-capitalize */
  var bizLoc = _getBizLoc();
  var bizKabupaten = profile.kabupaten || profile.city || '';
  var bizKecamatan = profile.kecamatan || '';

  /* Area target iklan — dari peta (bukan lokasi bisnis!) */
  var targetArea = document.querySelector('.popup-loc')
    ? document.querySelector('.popup-loc').textContent.split(',')[0].trim()
    : '';

  /* Deteksi apakah target di luar region bisnis → gunakan lokasi lebih lengkap */
  var _bizRegion   = _kabupatenToRegion(bizKabupaten || bizKecamatan);
  var _popupFull   = document.querySelector('.popup-loc') ? document.querySelector('.popup-loc').textContent.trim() : '';
  var _targetRegion = _kabupatenToRegion(_popupFull);
  var _regionCity  = { jogja:'Yogyakarta', solo:'Solo', semarang:'Semarang', jakarta:'Jakarta',
    bandung:'Bandung', surabaya:'Surabaya', malang:'Malang', medan:'Medan',
    makassar:'Makassar', bali:'Bali', manado:'Manado', palembang:'Palembang',
    pontianak:'Pontianak', banjarmasin:'Banjarmasin', lampung:'Lampung' };
  var _isFarTarget = _bizRegion && _targetRegion && (_bizRegion !== _targetRegion);
  var bizLocDisplay = bizLoc;
  if (_isFarTarget && _bizRegion && _regionCity[_bizRegion]) {
    bizLocDisplay = bizLoc + ', ' + _regionCity[_bizRegion];
  }

  /* Sapaan dialek sesuai area target */
  var _dialek   = getDialek();
  var _greeting = _dialek.greeting || 'Halo';

  /* ── Deteksi positioning luxury/premium dari USP ──────────────────────────
     Level 1 — Strong luxury: kata yang jarang dipakai sembarangan
     Level 2 — Soft premium: kata umum, hanya dapat boost ringan
     Kalau tidak ada match → _positioningLine = null → tidak ada perubahan prompt */
  var _uspLower = usp.toLowerCase();
  var _luxuryWords  = ['luxury','mewah','eksklusif','high-end','high end','branded',
    'limited edition','premium leather','emas','berlian','platinum',
    'prestige','prestise','kelas atas','bespoke','artisan premium'];
  var _premiumWords = ['premium','grade a','kualitas tinggi'];
  var _isLuxury  = _luxuryWords.some(function(w)  { return _uspLower.indexOf(w) !== -1; });
  var _isPremium = !_isLuxury && _premiumWords.some(function(w) { return _uspLower.indexOf(w) !== -1; });
  var _positioningLine = _isLuxury
    ? '- POSITIONING LUXURY: USP menunjukkan produk/layanan premium-luxury — gunakan tone aspirasional, sophisticated, dan eksklusif. Caption harus terasa prestige, bukan sekadar promosi biasa.'
    : _isPremium
    ? '- POSITIONING PREMIUM: USP menunjukkan kualitas di atas rata-rata — caption sedikit lebih polished dan quality-focused, hindari kesan murahan.'
    : null;

  /* Variasi gaya hook — rotasi berdasarkan _aiCallCount supaya tiap panggil AI beda gaya */
  var _n = _aiCallCount % 4;
  var _biz  = bizName || 'kami';
  var _loc  = bizLocDisplay || 'lokasi kami';
  var _area = targetArea || 'sekitar';
  var _u    = usp || 'kualitas terbaik';
  var _hookInstructions = [
    /* 0 — Pertanyaan langsung */
    'Gunakan PERTANYAAN LANGSUNG ke audiens sebagai hook.\n' +
    'Contoh baris hook: "Warga ' + _area + ', belum cobain ' + _biz + ' di ' + _loc + '? Sayang banget kalau dilewatkan!"',

    /* 1 — Pernyataan bold USP */
    'Mulai dengan PERNYATAAN BOLD tentang USP — sebut keunggulan dulu, baru nama bisnis dan lokasi.\n' +
    'Contoh baris hook: "' + _u + ' — itulah yang bikin ' + _biz + ' di ' + _loc + ' jadi pilihan warga ' + _area + '."',

    /* 2 — Cerita/situasi relatable */
    'Mulai dengan CERITA SINGKAT atau situasi yang relate — bayangkan kondisi audiens sebelum tahu bisnis ini.\n' +
    'Contoh baris hook: "Lagi cari kuliner yang beda dari biasanya, ' + _area + '? ' + _biz + ' di ' + _loc + ' jawabannya."',

    /* 3 — Social proof */
    'Mulai dengan SOCIAL PROOF atau fakta menarik — sebut pelanggan setia, reaksi nyata, atau keunikan bisnis.\n' +
    'Contoh baris hook: "Sudah ribuan orang buktikan — ' + _biz + ' di ' + _loc + ' memang beda. Warga ' + _area + ', kapan giliranmu?"',
  ];
  var _hookStyle = _hookInstructions[_n];

  var platformLabel = {
    'ig-post'  : 'Instagram Post — caption bisa 3–5 baris, padat dan engaging',
    'ig-reel'  : 'Instagram Reel — hook kuat di baris pertama, energetik, maks 3 baris',
    'ig-story' : 'Instagram Story — sangat singkat, 1–2 kalimat + CTA',
    'tiktok'   : 'TikTok — casual, fun, relevan dengan tren, maks 3 baris',
    'meta'     : 'Facebook/Meta Ad — informatif, langsung ke poin, ada CTA jelas',
  }[activePlatform] || 'Instagram Post';

  /* Bangun anchor lokasi yang tepat untuk rules */
  var locAnchor = targetArea || bizLoc || 'sekitar sini';

  var systemPrompt = [
    'Kamu adalah copywriter profesional spesialis UMKM lokal Indonesia.',
    'Buat 1 caption media sosial yang segar, autentik, dan efektif untuk bisnis berikut.',
    '',
    'DATA BISNIS:',
    '- Nama: ' + (bizName || 'UMKM'),
    '- Kategori: ' + category,
    '- Keunggulan utama (USP): ' + usp,
    '- Lokasi bisnis: ' + (bizLocDisplay || 'tidak disebutkan'),
    '- Area target iklan: ' + (targetArea || bizLocDisplay || 'sekitar lokasi bisnis'),
    '- Layanan antar: ' + (hasDelivery ? 'ada' : 'tidak ada'),
    '',
    'MASTER PERSONA (target audiens):',
    '- Persona: ' + personaName,
    '- Target: ' + personaTarget,
    '- Usia: ' + personaAge,
    '',
    'PLATFORM: ' + platformLabel,
    '',
    'FORMAT SAPAAN:',
    '- Baris pertama: sapaan saja → "' + _greeting + '"',
    '- Baris kedua: kosong',
    '- Baris ketiga: langsung hook (JANGAN selalu mulai dengan "Warga [area]..." — sesuaikan dengan gaya hook di bawah)',
    '',
    'GAYA HOOK — WAJIB ikuti instruksi berikut:',
    _hookStyle,
    '',
    'ATURAN WAJIB:',
    '- Bahasa Indonesia natural, tidak kaku, tidak terkesan iklan murahan',
    '- Sesuaikan gaya bahasa dengan persona — foodie/anak muda = santai & seru, profesional = informatif & hangat',
    _positioningLine,
    '- USP harus jadi kekuatan utama caption, bukan sekadar disebut',
    '- KRITIS — Lokasi bisnis (' + (bizLocDisplay || 'tidak diketahui') + ') dan area target iklan (' + (targetArea || 'sekitar lokasi') + ') adalah DUA HAL BERBEDA.',
    '- DILARANG KERAS: menulis seolah bisnis berada di area target. Bisnis SELALU di lokasi aslinya (' + (bizLocDisplay || 'lokasi bisnis') + ').',
    '- Yang benar: ajak audiens di area target (' + (targetArea || 'sekitar') + ') untuk datang/memesan ke ' + (bizName || 'bisnis ini') + ' di ' + (bizLocDisplay || 'lokasi kami') + '.',
    '- Contoh hook yang SALAH: "Ada tempat makan baru di ' + (targetArea || 'area target') + '!" — ini SALAH karena bisnis tidak ada di sana.',
    '- Struktur: hook menarik → nilai/cerita → CTA',
    '- Akhiri dengan 3–5 hashtag (mix populer + lokal + niche, termasuk hashtag area target)',
    '- JANGAN mengarang fakta bisnis yang tidak ada di data',
    '- JANGAN gunakan simbol markdown (**bold**, *italic*, _underline_) — Instagram tidak render ini, tulis plain text saja',
    '- Output HANYA caption, tanpa penjelasan atau label tambahan',
  ].filter(function(l) { return l !== null && l !== undefined; }).join('\n');

  // Loading state
  var area   = document.getElementById('captionArea');
  var genBtn = document.getElementById('genBtn');
  if (area)   { area.value = ''; area.placeholder = 'AI sedang menulis caption...'; }
  if (genBtn) { genBtn.disabled = true; genBtn.textContent = 'Menulis...'; }

  var supabaseUrl = (typeof RADAR_CONFIG !== 'undefined' && RADAR_CONFIG.SUPABASE_URL) || '';
  var supabaseKey = (typeof RADAR_CONFIG !== 'undefined' && RADAR_CONFIG.SUPABASE_ANON_KEY) || '';

  try {
    var resp = await fetch(supabaseUrl + '/functions/v1/silaris-chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + supabaseKey
      },
      body: JSON.stringify({
        systemPrompt: systemPrompt,
        messages: [{ role: 'user', content: 'Tulis captionnya sekarang. Pastikan gaya hook sesuai instruksi — jangan gunakan pola yang sama dengan caption sebelumnya.' }]
      })
    });

    var data = await resp.json();
    if (data && data.reply && data.reply.trim()) {
      if (genBtn) { genBtn.disabled = false; genBtn.textContent = 'Generate ulang'; }
      if (area)   area.placeholder = '';
      /* Strip markdown — AI kadang tetap pakai **bold** meski dilarang */
      var cleanReply = data.reply.trim()
        .replace(/\*\*(.*?)\*\*/g, '$1')   /* **bold** → bold */
        .replace(/\*(.*?)\*/g,     '$1')   /* *italic* → italic */
        .replace(/_(.*?)_/g,       '$1'); /* _underline_ → underline */
      typewriterEffect(cleanReply);
      return;
    }
  } catch(e) {
    console.warn('[caption] AI gagal, fallback ke template:', e);
  }

  // Fallback ke template jika AI gagal
  if (genBtn) { genBtn.disabled = false; genBtn.textContent = 'Generate ulang'; }
  if (area)   area.placeholder = '';
  generateCaption(true);
}

function setTone(el, tone) {
  activeTone = tone;
  document.querySelectorAll('.tone-btn').forEach(function(b){ b.classList.remove('active'); });
  el.classList.add('active');
  generateCaptionAI();
}

function updateCaptionPlatformLabel() {
  var el = document.getElementById('captionPlatformLabel');
  if (!el) return;
  var plat = PLAT_LABEL_MAP[activePlatform] || PLAT_LABEL_MAP['ig-story'];
  el.innerHTML = plat.icon + '<span>' + plat.label + '</span>';
}

/* Map kabupaten/kota name → REGION_DIALEK key */
function _kabupatenToRegion(kab) {
  if (!kab) return null;
  var k = kab.toLowerCase()
    .replace(/^kabupaten\s+/i, '')
    .replace(/^regency\s+/i, '')
    .trim();
  if (/sleman|bantul|kulon.?progo|gunungkidul|gunung.?kidul|yogyakarta/.test(k))         return 'jogja';
  if (/surakarta|^solo$|sukoharjo|karanganyar|klaten|wonogiri|boyolali|sragen/.test(k)) return 'solo';
  if (/semarang|kendal|demak|kudus|jepara|pati|rembang|blora|grobogan/.test(k))         return 'semarang';
  if (/jakarta|tangerang|bekasi|depok|bogor|kebayoran|mampang|tebet|setiabudi|pancoran|cilandak|pesanggrahan|pasar minggu|jagakarsa|menteng|gambir|sawah besar|cempaka putih|kemayoran|penjaringan|tanjung priok|kelapa gading|koja|cilincing|grogol|kebon jeruk|palmerah|kembangan|cengkareng|kalideres|tambora|jatinegara|matraman|pulo gadung|duren sawit|kramat jati|pasar rebo|ciracas|cipayung/.test(k)) return 'jakarta';
  if (/bandung|sumedang|garut|tasikmalaya|cianjur|sukabumi|cimahi|majalengka|kuningan|indramayu|subang|purwakarta|karawang|cirebon/.test(k)) return 'bandung';
  if (/surabaya|sidoarjo|gresik|mojokerto|lamongan|tuban|bojonegoro/.test(k))            return 'surabaya';
  if (/malang|pasuruan|probolinggo|lumajang|jember|banyuwangi/.test(k))                  return 'malang';
  if (/medan|deli serdang|serdang bedagai|langkat|binjai|tebing tinggi/.test(k))         return 'medan';
  if (/makassar|gowa|maros|pangkep|takalar|jeneponto/.test(k))                           return 'makassar';
  if (/badung|gianyar|tabanan|buleleng|klungkung|karangasem|jembrana|bangli|denpasar|bali/.test(k)) return 'bali';
  if (/manado|minahasa|bitung|tomohon|kotamobagu/.test(k))                               return 'manado';
  if (/palembang|banyuasin|ogan komering|musi|prabumulih/.test(k))                       return 'palembang';
  if (/pontianak|kubu raya|landak|mempawah|singkawang/.test(k))                          return 'pontianak';
  if (/banjarmasin|banjarbaru|^banjar$|barito|hulu sungai|tapin|tabalong/.test(k))       return 'banjarmasin';
  if (/lampung|bandar lampung|^metro$|pringsewu|pesawaran|tanggamus/.test(k))             return 'lampung';
  if (/ambon|maluku/.test(k))                                                             return 'ambon';
  if (/lombok|mataram|bima|dompu|sumbawa/.test(k))                                        return 'lombok';
  if (/jayapura|sorong|manokwari|mimika|merauke|timika/.test(k))                          return 'papua';
  return null;
}

function getDialek() {
  /* Priority 1: area TARGET IKLAN dari peta — dialek harus cocok dengan audiens */
  /* Pakai FULL text popup-loc ("Kotagede, Yogyakarta") bukan hanya kecamatan ("Kotagede")
     supaya _kabupatenToRegion bisa deteksi kabupaten/kota dengan benar */
  var popupEl = document.querySelector('.popup-loc');
  var fullTargetText = popupEl ? popupEl.textContent.trim() : '';
  var regionFromTarget = fullTargetText ? _kabupatenToRegion(fullTargetText) : null;
  if (regionFromTarget) return REGION_DIALEK[regionFromTarget] || REGION_DIALEK['default'];

  /* Priority 2: currentRegion dari GPS/map (fallback jika popup-loc belum ada) */
  if (currentRegion && REGION_DIALEK[currentRegion]) return REGION_DIALEK[currentRegion];

  /* Priority 3: kabupaten dari profil bisnis (fallback terakhir) */
  var profile = {};
  try { profile = JSON.parse(localStorage.getItem('radar_user_profile') || '{}'); } catch(e) {}
  var kab = profile.kabupaten || profile.city || '';
  var regionFromProfile = _kabupatenToRegion(kab);
  if (regionFromProfile) return REGION_DIALEK[regionFromProfile] || REGION_DIALEK['default'];

  return REGION_DIALEK['default'];
}
