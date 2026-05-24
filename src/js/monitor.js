// RADAR — monitor.js
// Campaign Live Monitor: view switching, campaign cards, AI chat

/* ─── Campaign Data ─── */
var CAMPAIGNS = [];

/* ─── State ─── */
var activeCampaignId = null;
var campaignFilter = 'all';
var _analyticsCache = {};
var _analyticsFetching = {};
var _analyticsCacheTime = {}; // timestamp kapan cache diisi (untuk invalidasi)
var ANALYTICS_CACHE_TTL = 120000; // 2 menit
var ANALYTICS_AUTO_REFRESH_INTERVAL = 5 * 60 * 1000; // 5 menit
var _analyticsRefreshTimer = null;

/* Buka URL postingan dari card — dipanggil saat timestamp diklik */
function _openCampaignPost(campId) {
  var cardEl = document.getElementById('campaign-card-' + campId);
  if (!cardEl) return;
  var chip = cardEl.querySelector('.cc-ts-chip');
  var href = chip ? chip.getAttribute('href') : null;
  if (href && href !== '#') {
    window.open(href, '_blank', 'noopener');
  }
}
var campaignReachIntervals = {};
var chatHistory = {};

/* ─── SiLaris AI Session (Scoped Conversation Memory) ─── */
var silarisSession = {
  campaign_id:    null,
  campaign_data:  null,
  chat_history:   [],
  is_initialized: false
};

var SILARIS_MAX_HISTORY = 6;

/* ─── buildSilarisContext() — Priority fallback logic ─── */
function buildSilarisContext() {
  // PRIORITY 1: Data dari Supabase Profile (hasil onboarding)
  var profile = null;
  try {
    profile = JSON.parse(localStorage.getItem('radar_user_profile') || '{}');
  } catch(e) {}

  if (profile && profile.business_name) {
    return {
      mode:             'FULL',
      businessName:     profile.business_name,
      businessCategory: profile.category || 'Umum',
      region:           profile.city || 'default',
      regionLabel:      profile.city || 'Indonesia',
      greeting:         'Halo!',
      cta:              profile.delivery_service ? 'Siap kirim ke seluruh Indonesia!' : 'Mampir ke toko kami!',
      dialekStyle:      'default',
      owner:            profile.full_name || ''
    };
  }

  // PRIORITY 2: Region dari GPS (currentRegion + REGION_DIALEK) yang sudah jalan di map.js
  var region = (typeof currentRegion !== 'undefined' && currentRegion) ? currentRegion : 'default';
  var dialek = (typeof REGION_DIALEK !== 'undefined' && REGION_DIALEK[region])
    ? REGION_DIALEK[region]
    : { greeting: 'Halo Sahabat!', cta: 'Cek Sekarang!', style: 'default' };
  var persona = (typeof currentPersona !== 'undefined' && currentPersona) ? currentPersona : null;

  if (region && region !== 'default') {
    // Buat label kota yang readable
    var regionLabels = {
      jogja: 'Yogyakarta', solo: 'Solo / Jawa Tengah', surabaya: 'Surabaya / Jawa Timur',
      malang: 'Malang / Jawa Timur', jakarta: 'Jakarta', bandung: 'Bandung / Jawa Barat',
      medan: 'Medan / Sumatera Utara', medan_area: 'Medan / Sumatera Utara',
      makassar: 'Makassar / Sulawesi Selatan', bali: 'Bali', manado: 'Manado / Sulawesi Utara',
      palembang: 'Palembang / Sumatera Selatan', semarang: 'Semarang / Jawa Tengah',
      pontianak: 'Pontianak / Kalimantan Barat', banjarmasin: 'Banjarmasin / Kalimantan Selatan',
      lampung: 'Lampung', ambon: 'Ambon / Maluku', lombok: 'Lombok / NTB', papua: 'Papua'
    };
    return {
      mode:             persona ? 'PERSONA_ONLY' : 'REGION_ONLY',
      businessName:     null,
      businessCategory: persona || null,
      region:           region,
      regionLabel:      regionLabels[region] || region,
      greeting:         dialek.greeting,
      cta:              dialek.cta,
      dialekStyle:      dialek.style
    };
  }

  // PRIORITY 3: Pure fallback — tidak ada data lokasi sama sekali
  return {
    mode:             'GENERIC',
    businessName:     null,
    businessCategory: null,
    region:           'default',
    regionLabel:      'Indonesia',
    greeting:         'Halo Sahabat!',
    cta:              'Cek Sekarang!',
    dialekStyle:      'default'
  };
}

/* ─── buildSilarisSystemPrompt() — Dynamic prompt berdasarkan context ─── */
function buildSilarisSystemPrompt() {
  var ctx = buildSilarisContext();

  var baseRules = [
    'KARAKTER & TONE, COACH BUKAN REPORTER:',
    'Bicara dengan semangat dan hangat seperti coach yang peduli, bukan laporan audit kering.',
    'Urutan selalu: rayakan yang bagus dulu → WHY di balik angka → aksi konkret.',
    '',
    'FORMAT, DUA MODE BERBEDA:',
    '',
    'MODE 1, AUTO-INSIGHT (saat pertama kali analisa campaign):',
    'WAJIB buka dengan kalimat ini persis (ganti [nama] dengan nama campaign yang sedang dibuka):',
    '  Hei! Saya udah cek data iklan "[nama]" kamu nih 👋',
    'Lanjutkan dengan struktur 3 seksi di bawah ini, isi tiap seksi dengan bahasa coach yang mengalir:',
    '',
    '📊 PERFORMA SEKARANG',
    '• Engagement Rate: [angka]% — [interpretasi coach, bukan sekedar label]',
    '• Paling kuat: [metric + artinya bagi bisnis dengan bahasa santai]',
    '• Perlu diperhatiin: [metric + kenapa penting]',
    '',
    '💡 INSIGHT UTAMA',
    '[1-2 kalimat mengalir, jelaskan WHY di balik angka, artinya apa untuk bisnis ini]',
    '',
    '🎯 SARAN LANGSUNG',
    '[1 action konkret spesifik yang bisa dilakukan hari ini, dengan angka/contoh nyata]',
    '',
    'Tutup dengan: "Ada yang mau kamu tanyain lebih dalam?"',
    '',
    'Contoh isi yang BENAR untuk MODE 1:',
    'Hei! Saya udah cek data iklan "TEs FB" kamu nih 👋',
    '',
    '📊 PERFORMA SEKARANG',
    '• Engagement Rate: 200%, luar biasa! Artinya setiap orang yang lihat langsung interact.',
    '• Paling kuat: reactions + comments solid, artinya konten ini resonan ke audiensmu.',
    '• Perlu diperhatiin: reach baru 1 orang, konten bagusnya belum banyak yang tahu.',
    '',
    '💡 INSIGHT UTAMA',
    'Engagement-nya top, tapi reach-nya masih sangat lokal. Kontennya sudah bagus,',
    'tinggal distribusinya yang perlu diperluas supaya lebih banyak orang bisa lihat.',
    '',
    '🎯 SARAN LANGSUNG',
    'Tambahkan #VespaJogja #SkuterJogja #VespaIndonesia di caption, lalu boost Rp 20rb',
    'selama 3 hari, targetkan radius 5km dari lokasi bisnis kamu.',
    '',
    'Ada yang mau kamu tanyain lebih dalam?',
    '',
    'MODE 2, CHAT LANJUTAN (saat user tanya sesuatu):',
    'Jawab dengan paragraf mengalir natural, JANGAN pakai header seksi 📊 💡 🎯.',
    'Jangan pakai kalimat pembuka "Hei! Saya udah cek..." di chat lanjutan.',
    'Langsung ke poin, coach style, dengan saran spesifik di akhir.',
    '',
    'Contoh BENAR untuk MODE 2:',
    '  Engagement rate 200% itu sinyal bagus, kontennya sudah resonan ke orang yang lihat.',
    '  Masalahnya reach-nya masih kecil, jadi tinggal perluas distribusinya.',
    '  Untuk Facebook di Jogja, coba tambahkan #JogjaLokal #KomunitasLokal dan boost',
    '  Rp 20rb dulu buat test, post jam 7 malam karena orang lagi santai dan lebih aktif scroll.',
    '',
    'ANALISIS CAPTION (berlaku untuk KEDUA mode):',
    'Kalau data campaign menyertakan caption (field "caption" di data), kamu WAJIB:',
    '1. Baca captionnya.',
    '2. Nilai apakah captionnya sudah optimal untuk engagement (hook, CTA, hashtag, panjang).',
    '3. Kalau bisa diperbaiki, tulis versi caption yang lebih kuat, bukan hanya saran abstrak.',
    'Contoh:',
    '  Caption sekarang: "Sugeng rawuh, Ada yang baru di Sumbersari, 1.0km dari kamu! Mampir yuk!"',
    '  Caption yang lebih kuat: "Ada yang baru buat kamu di Sumbersari! 🔥 Mampir sekarang sebelum kehabisan.',
    '  📍 1km dari kamu. #JogjaLokal #KulinerJogja #Sumbersari"',
    'Kalau caption sudah bagus, bilang apa yang sudah kuat dan kenapa.',
    '',
    'BENCHMARK INTERPRETASI DATA:',
    'Engagement Rate:',
    '  < 1%     → sangat rendah, konten perlu dievaluasi',
    '  1% - 3%  → normal',
    '  3% - 10% → bagus, di atas rata-rata',
    '  > 10%    → luar biasa, konten sangat resonan',
    'Reach:',
    '  < 100    → masih sangat lokal, perlu boost',
    '  100-1000 → growing, arah sudah benar',
    '  > 1000   → sudah luas untuk bisnis lokal',
    'Organic vs Paid:',
    '  100% organik → konten kuat tapi reach terbatas → saran: boost kecil untuk amplify',
    '  Ada paid     → cek cost per reach, apakah efisien?',
    'Video (kalau ada data):',
    '  avg_watch > 50% durasi → konten engaging',
    '  avg_watch < 25% durasi → hook awal perlu diperkuat',
    '',
    'SARAN WAJIB SPESIFIK (bukan generik):',
    '- Hashtag: kasih 3-5 contoh nyata sesuai nama bisnis + platform + lokasi campaign',
    '- Jam posting: kasih jam spesifik + alasan dikaitkan data (contoh: "Post jam 7 malam karena...")',
    '- Budget boost: angka konkret (contoh: "Rp 20rb-50rb per hari selama 3 hari")',
    '',
    'PERTANYAAN YANG BOLEH DIJAWAB:',
    '- Best practice jam posting untuk platform campaign ini',
    '- Tips hashtag lokal yang relevan',
    '- Rekomendasi format konten (Reel vs Post vs Story)',
    '- Estimasi budget boost',
    'Jawab berdasarkan pengetahuan umum + kaitkan dengan data campaign yang sedang dibuka.',
    '',
    'ATURAN KETAT:',
    '- HANYA analisa campaign yang sedang dibuka user',
    '- JANGAN bandingkan dengan campaign lain',
    '- JANGAN berasumsi data yang tidak tersedia di context',
    '- Kalau user tanya di luar topik: "Hei, saya hanya bisa bantu analisa iklan yang lagi kamu buka ya!"',
    '',
    'ATURAN KERAS: DILARANG gunakan tanda em-dash (—) dalam semua output. Ganti dengan koma.',
    '',
    'DILARANG:',
    '- Saran generik tanpa angka atau contoh konkret',
    '- Laporan angka tanpa interpretasi artinya bagi bisnis',
    '- Jawaban tanpa action item',
    '- Menolak pertanyaan best practice yang relevan dengan campaign'
  ].join('\n');

  if (ctx.mode === 'FULL') {
    return [
      'Kamu adalah SiLaris, Asisten Iklan AI yang semangat dan inspiratif untuk bisnis lokal Indonesia.',
      '',
      'KONTEKS USER:',
      '- Bisnis: ' + (ctx.businessName || '(belum diisi)'),
      '- Kategori: ' + ctx.businessCategory,
      '- Region: ' + ctx.regionLabel,
      '- Sapaan khas: ' + ctx.greeting,
      '- CTA lokal: ' + ctx.cta,
      '',
      'CARA BICARA:',
      '- Semangat dan inspiratif, bukan laporan audit kering',
      '- Gunakan sapaan lokal secara natural: "' + ctx.greeting + '"',
      '- Sesuaikan insight dengan industri: ' + ctx.businessCategory,
      '- Selalu ada 1 quick action konkret',
      '- Suggest copy baru kalau caption bisa diperbaiki',
      '',
      baseRules
    ].join('\n');
  }

  if (ctx.mode === 'PERSONA_ONLY' || ctx.mode === 'REGION_ONLY') {
    var personaLine = ctx.businessCategory
      ? '- Kategori bisnis terdeteksi: ' + ctx.businessCategory
      : '- Kategori bisnis belum diisi';
    return [
      'Kamu adalah SiLaris, Asisten Iklan AI yang semangat dan inspiratif untuk bisnis lokal Indonesia.',
      '',
      'KONTEKS USER (dari lokasi GPS):',
      '- Region: ' + ctx.regionLabel,
      '- Sapaan khas: ' + ctx.greeting,
      '- CTA lokal: ' + ctx.cta,
      personaLine,
      '',
      'CARA BICARA:',
      '- Semangat dan inspiratif',
      '- Gunakan sapaan lokal secara natural sesekali: "' + ctx.greeting + '"',
      '- Bahasa Indonesia yang hangat dan mudah dimengerti',
      '- Selalu ada 1 quick action konkret di setiap respons',
      '',
      baseRules
    ].join('\n');
  }

  // GENERIC mode
  return [
    'Kamu adalah SiLaris, seorang Senior Social Media Analyst dan Strategist',
    'berpengalaman yang bekerja khusus untuk UMKM Indonesia.',
    '',
    'KARAKTER:',
    '- Bicara santai, bahasa Indonesia yang mudah dimengerti',
    '- Langsung ke poin, tidak bertele-tele',
    '- Kasih saran praktis yang bisa langsung dilakukan',
    '',
    baseRules
  ].join('\n');
}

/* ─── View Switching ─── */
function switchMenu(view) {
  var cmd = document.getElementById('view-command');
  var mon = document.getElementById('view-monitor');
  var an  = document.getElementById('view-analytics');
  var titleEl = document.getElementById('headerTitle');
  var subEl   = document.getElementById('headerSub');
  var icons   = document.querySelectorAll('.sb-icon');

  // Hide all views & clear active states
  cmd.style.display = 'none';
  mon.style.display = 'none';
  if (an) an.style.display = 'none';
  icons.forEach(function(i) { i.classList.remove('active'); });

  if (view === 'monitor') {
    mon.style.display = 'flex';
    if (titleEl) titleEl.textContent = 'Kelola Iklan';
    if (subEl)   subEl.textContent   = 'Pantau dan atur iklanmu yang sedang berjalan secara real-time.';
    if (icons[1]) icons[1].classList.add('active');
    renderCampaigns();
    startReachCounters();
    loadCampaignsFromSupabase();
  } else if (view === 'analytics') {
    if (an) an.style.display = 'flex';
    if (titleEl) titleEl.textContent = 'Performa Iklan';
    if (subEl)   subEl.textContent   = 'Lihat hasil iklanmu & temukan saran pintar untuk jangkau pembeli yang lebih banyak.';
    if (icons[2]) icons[2].classList.add('active');
    stopReachCounters();
    if (typeof initAnalytics === 'function') initAnalytics();
  } else {
    cmd.style.display = 'flex';
    if (titleEl) titleEl.textContent = 'Dapur Konten';
    if (subEl)   subEl.textContent   = 'Siapkan foto, video dan pesan terbaikmu di sini untuk tampil maksimal.';
    if (icons[0]) icons[0].classList.add('active');
    stopReachCounters();
  }
}

/* ─── Filter ─── */
function filterCampaigns(filter, el) {
  campaignFilter = filter;
  document.querySelectorAll('.monitor-tab').forEach(function(t) { t.classList.remove('active'); });
  el.classList.add('active');
  renderCampaigns();
}

function getFilteredCampaigns() {
  if (campaignFilter === 'all') return CAMPAIGNS;
  return CAMPAIGNS.filter(function(c) { return c.status === campaignFilter; });
}

/* ─── Helpers ─── */
function formatReach(n) {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
  if (n >= 1000)    return Math.round(n / 1000) + 'K';
  return n.toString();
}

var PLAT_SVG = {
  ig:      '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>',
  tiktok:  '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.79 1.54V6.78a4.85 4.85 0 01-1.02-.09z"/></svg>',
  meta:    '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>',
  youtube: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M23.5 6.19a3 3 0 00-2.12-2.13C19.54 3.5 12 3.5 12 3.5s-7.54 0-9.38.56A3 3 0 00.5 6.19C0 8.03 0 12 0 12s0 3.97.5 5.81a3 3 0 002.12 2.12C4.46 20.5 12 20.5 12 20.5s7.54 0 9.38-.57a3 3 0 002.12-2.12C24 15.97 24 12 24 12s0-3.97-.5-5.81zM9.75 15.02V8.98L15.5 12l-5.75 3.02z"/></svg>'
};

function generateSparklinePath(data, w, h) {
  if (!data || data.length < 2) return '';
  var min = Math.min.apply(null, data);
  var max = Math.max.apply(null, data);
  var range = max - min || 1;
  var pts = data.map(function(v, i) {
    var x = (i / (data.length - 1)) * w;
    var y = h - ((v - min) / range) * (h - 4) - 2;
    return x.toFixed(1) + ',' + y.toFixed(1);
  });
  return 'M ' + pts.join(' L ');
}

/* ─── Render Campaigns ─── */
function renderCampaigns() {
  var list = document.getElementById('campaign-list');
  if (!list) return;
  list.innerHTML = '';
  // Sort terbaru dulu: campaign baru dari launch punya id = Date.now() (angka besar)
  // Campaign dari Supabase punya created_at string; fallback ke id
  CAMPAIGNS.sort(function(a, b) {
    var ta = a.created_at ? new Date(a.created_at).getTime() : (typeof a.id === 'number' ? a.id : 0);
    var tb = b.created_at ? new Date(b.created_at).getTime() : (typeof b.id === 'number' ? b.id : 0);
    return tb - ta; // descending: terbaru di atas
  });
  var filtered = getFilteredCampaigns();
  if (!filtered.length) {
    // Override display grid → flex agar empty state bisa center penuh
    list.style.display         = 'flex';
    list.style.alignItems      = 'center';
    list.style.justifyContent  = 'center';
    list.innerHTML =
      '<div style="display:flex;flex-direction:column;align-items:center;text-align:center;gap:16px;max-width:400px;">' +
        '<svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">' +
          '<circle cx="60" cy="60" r="50" fill="#f5f3ff"/>' +
          '<rect x="35" y="40" width="50" height="35" rx="8" fill="#e9d5ff"/>' +
          '<rect x="42" y="48" width="20" height="3" rx="2" fill="#7c3aed"/>' +
          '<rect x="42" y="55" width="14" height="3" rx="2" fill="#a78bfa"/>' +
          '<circle cx="72" cy="72" r="14" fill="#7c3aed"/>' +
          '<path d="M68 72h8M72 68v8" stroke="white" stroke-width="2.5" stroke-linecap="round"/>' +
        '</svg>' +
        '<h3 style="font-size:18px;font-weight:600;color:#1a1a2e;margin:0;font-family:var(--font,sans-serif);">Belum ada iklan yang berjalan</h3>' +
        '<p style="font-size:14px;color:#6b7280;line-height:1.6;margin:0;font-family:var(--font,sans-serif);">Tayangkan iklan pertamamu dan pantau performanya secara real-time di sini!</p>' +
        '<button onclick="switchMenu(\'command\')" class="cc-empty-cta">🚀 Buat Iklan Pertama</button>' +
      '</div>';
    return;
  }
  // Reset ke grid (CSS default) saat ada campaign
  list.style.display        = '';
  list.style.alignItems     = '';
  list.style.justifyContent = '';
  filtered.forEach(function(c) {
    list.appendChild(buildCampaignCard(c));
    _loadAnalyticsForCard(c);
  });
  if (activeCampaignId) applyDimming(activeCampaignId);
}

/* ─── Load Campaigns from Supabase ─── */
async function loadCampaignsFromSupabase() {
  if (typeof getCampaigns !== 'function') return;

  var list = document.getElementById('campaign-list');
  if (list && !CAMPAIGNS.length) {
    list.innerHTML = '<div style="text-align:center;padding:32px;color:var(--secondary);font-size:13px;">Memuat campaign...</div>';
  }

  try {
    var rows = await getCampaigns();
    if (!rows || !rows.length) {
      window.CAMPAIGNS_LOADED = true;
      renderCampaigns();
      return;
    }

    var platMap = { ig: 'ig', tiktok: 'tiktok', meta: 'meta', youtube: 'youtube',
                    instagram: 'ig', facebook: 'meta' };

    // JANGAN hapus demo campaign agar user bisa melihat contoh premium
    /* 
    for (var j = CAMPAIGNS.length - 1; j >= 0; j--) {
      if (CAMPAIGNS[j].isDemo) CAMPAIGNS.splice(j, 1);
    }
    */

    rows.forEach(function(row) {
      // Skip if already loaded (by supabase id)
      var exists = CAMPAIGNS.some(function(c) { return c.supabase_id === row.id; });
      if (exists) return;

      var platforms = (row.platforms || []).map(function(p) { return platMap[p] || p; });
      if (!platforms.length) platforms = ['ig'];

      var platLabel = platforms.map(function(p) { return p.toUpperCase(); }).join(', ');
      var dateStr   = row.created_at
        ? new Date(row.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
        : '';

      CAMPAIGNS.unshift({
        id:             row.id,
        supabase_id:    row.id,
        post_id:        row.post_id          || null,
        post_url:       row.post_url         || null,
        platform_post_id: row.platform_post_id || null,
        format:         row.format           || 'post',
        name:        row.nama_campaign || 'Campaign',
        status:      row.status === 'active' ? 'running' : (row.status || 'running'),
        platforms:   platforms,
        reach:       row.estimated_reach_min || 0,
        reachTarget: row.estimated_reach_max || 10000,
        budget:      row.budget_idr || 0,
        budgetUsed:  0,
        sparkData:   [0, 0, 0, 0, 0, 0],
        thumbColor:  '#791ADB',
        // Prioritas: thumb_url dari Supabase (compressed JPEG, reliable antar sesi)
        // Fallback: localStorage (untuk campaign lama sebelum fitur ini)
        thumbUrl:    row.thumb_url || localStorage.getItem('radar_thumb_' + row.id) || null,
        launchTime:  dateStr,
        created_at:  row.created_at || null,
        aiOpening:
          'Campaign <strong>' + (row.nama_campaign || 'Campaign') + '</strong>\n\n' +
          'Lokasi: <strong>' + (row.kecamatan || '—') + '</strong> · Radius ' + (row.radius_km || 1) + ' km\n' +
          'Kategori: <strong>' + (row.kategori || '—') + '</strong>\n' +
          'Platform: <strong>' + platLabel + '</strong>\n' +
          'Estimasi reach: <strong>' + formatReach(row.estimated_reach_min || 0) + ' – ' + formatReach(row.estimated_reach_max || 0) + '</strong>\n' +
          (dateStr ? 'Diluncurkan: ' + dateStr + '\n' : '') +
          '\nAda yang ingin dianalisis dari campaign ini?',
        aiChips:         ['Lihat performa', 'Optimalkan targeting', 'Bagikan ke tim'],
        aiChipResponses: {}
      });
    });

    window.CAMPAIGNS_LOADED = true;
    renderCampaigns();
    startReachCounters();
    startPostUrlPolling();
    startAnalyticsAutoRefresh();
  } catch(e) {
    window.CAMPAIGNS_LOADED = true;
    console.warn('[monitor] loadCampaignsFromSupabase error:', e);
  }
}

/* ─── Auto-refresh engagement metrics setiap 5 menit ─── */
function startAnalyticsAutoRefresh() {
  if (_analyticsRefreshTimer) clearInterval(_analyticsRefreshTimer);

  _analyticsRefreshTimer = setInterval(function() {
    var active = CAMPAIGNS.filter(function(c) {
      return c.status === 'running' && document.getElementById('campaign-card-' + c.id);
    });
    if (!active.length) return;

    // Expire cache semua akun agar fetch ulang dari PostForMe
    Object.keys(_analyticsCacheTime).forEach(function(key) {
      _analyticsCacheTime[key] = 0;
    });

    console.log('[monitor] auto-refresh engagement untuk', active.length, 'campaign...');
    active.forEach(function(c) { _loadAnalyticsForCard(c); });
  }, ANALYTICS_AUTO_REFRESH_INTERVAL);
}
window.startAnalyticsAutoRefresh = startAnalyticsAutoRefresh;

/* ─── Auto-fetch post_url dari PostForMe ─── */

async function fetchAndUpdatePostUrl(campaign, _attempt) {
  if (!campaign.post_id) return;
  if (campaign.post_url) return; // sudah ada, skip

  var attempt = _attempt || 1;
  var MAX_RETRIES = 3;
  var RETRY_DELAY = 5000; // 5 detik

  try {
    var data = await _pfmProxy(
      '/v1/social-posts/' + campaign.post_id,
      'GET', null
    );

    console.log('[monitor] fetchAndUpdatePostUrl keys:', Object.keys(data || {}));
    console.log('[monitor] social_accounts sample:', JSON.stringify(
      (data.social_accounts || []).map(function(a) {
        return { id: a.id, platform: a.platform, post_url: a.post_url, permalink: a.permalink };
      })
    ));

    var url = null;
    // PostForMe menyimpan post_url per akun di social_accounts
    if (data.social_accounts && data.social_accounts.length) {
      for (var i = 0; i < data.social_accounts.length; i++) {
        var sa = data.social_accounts[i];
        url = sa.post_url || sa.permalink || sa.platform_url || sa.url || null;
        if (url) break;
      }
    }
    // Fallback root level
    if (!url) {
      url = data.post_url || data.platform_url || data.permalink || null;
    }

    if (url) {
      campaign.post_url = url;

      if (typeof updateCampaignPostUrl === 'function') {
        updateCampaignPostUrl(campaign.supabase_id, url);
      }

      // Update timestamp link di DOM tanpa rebuild seluruh card
      var card = document.querySelector('[data-id="' + campaign.id + '"]');
      if (card) {
        var tsEl = card.querySelector('.cc-timestamp');
        if (tsEl && tsEl.tagName !== 'A') {
          var a = document.createElement('a');
          a.href = url;
          a.target = '_blank';
          a.rel = 'noopener';
          a.className = 'cc-timestamp';
          a.style.cssText = 'color:#791ADB;text-decoration:underline;text-underline-offset:2px;font-weight:600;';
          a.textContent = tsEl.textContent;
          a.addEventListener('click', function(e) { e.stopPropagation(); });
          tsEl.parentNode.replaceChild(a, tsEl);
        }
      }

      console.log('[monitor] post_url updated:', campaign.name, url);
    }

    // --- SINKRONISASI THUMBNAIL (Agar tidak hilang di komputer lain) ---
    var mediaUrl = null;
    if (data.media && data.media.length) {
      // Prioritas 1: Thumbnail URL dari PostForMe
      mediaUrl = data.media[0].thumb_url || data.media[0].media_url || data.media[0].url || null;
    }
    // Fallback root level media_url
    if (!mediaUrl) mediaUrl = data.media_url || data.thumb_url || null;

    // Jangan timpa thumbnail permanen (base64 atau Supabase Storage) dengan CDN PostForMe yang expire
    var _supabaseStorage = RADAR_CONFIG.SUPABASE_URL + '/storage/';
    var _hasPermThumb = campaign.thumbUrl && (
      campaign.thumbUrl.startsWith('data:') ||
      campaign.thumbUrl.startsWith(_supabaseStorage)
    );
    if (mediaUrl && campaign.thumbUrl !== mediaUrl && !_hasPermThumb) {
      console.log('[monitor] Memperbarui thumbnail ke Supabase:', campaign.name);
      campaign.thumbUrl = mediaUrl;

      // Simpan ke database agar permanen
      if (typeof updateCampaignThumbUrl === 'function') {
        updateCampaignThumbUrl(campaign.supabase_id, mediaUrl);
      }
      // Simpan ke localStorage juga untuk performa instan di browser ini
      localStorage.setItem('radar_thumb_' + campaign.id, mediaUrl);

      // Update gambar di kartu iklan secara instan (DOM)
      var card = document.querySelector('[data-id="' + campaign.id + '"]');
      if (card) {
        var imgWrapper = card.querySelector('.cc-media');
        if (imgWrapper) {
          imgWrapper.innerHTML = '<img src="' + mediaUrl + '" style="width:100%;height:100%;object-fit:cover;" onerror="this.parentNode.innerHTML=\'<div style=\\\'padding:20px;color:#94a3b8;font-size:12px;\\\'>Foto tidak tersedia</div>\'">';
        }
      }
    }
  } catch(e) {
    var msg = e.message || '';

    // 401 → post lama tidak bisa diakses dengan session baru — silent fail
    // Engagement data (endpoint berbeda) tetap bekerja, user TIDAK perlu reconnect
    if (msg.indexOf('401') !== -1) {
      console.warn('[monitor] 401 dari social-posts (silent) — post lama, tidak perlu reconnect');
      campaign._postUrlError = true;
      return;
    }

    // CORS error → log warning saja, jangan crash, jangan retry
    if (msg.toLowerCase().indexOf('cors') !== -1 ||
        msg.toLowerCase().indexOf('failed to fetch') !== -1 ||
        msg.toLowerCase().indexOf('networkerror') !== -1) {
      console.warn('[monitor] fetchAndUpdatePostUrl CORS/network error (skip):', msg);
      return;
    }

    // 503 → retry otomatis maksimal 3x dengan delay 5 detik
    if (msg.indexOf('503') !== -1 || msg.indexOf('SUPABASE_EDGE_RUNTIME') !== -1) {
      if (attempt < MAX_RETRIES) {
        console.warn('[monitor] 503 dari postforme-proxy, retry ' + attempt + '/' + MAX_RETRIES + ' dalam 5 detik...');
        setTimeout(function() {
          fetchAndUpdatePostUrl(campaign, attempt + 1);
        }, RETRY_DELAY);
      } else {
        console.warn('[monitor] fetchAndUpdatePostUrl gagal setelah ' + MAX_RETRIES + ' retry (503):', campaign.name);
        // Tandai campaign sebagai error agar polling interval skip dia
        campaign._postUrlError = true;
        // Tampilkan indikator error di card
        var errCard = document.querySelector('[data-id="' + campaign.id + '"]');
        if (errCard) {
          var tsEl = errCard.querySelector('.cc-timestamp');
          if (tsEl) {
            tsEl.style.color  = '#ef4444';
            tsEl.title        = 'Gagal ambil link postingan (server error). Coba refresh halaman.';
            tsEl.textContent  = (tsEl.textContent || '') + ' ⚠';
          }
        }
      }
      return;
    }

    console.warn('[monitor] fetchAndUpdatePostUrl error:', msg);
  }
}

/* ─── Reconnect Banner (per platform) ─── */
var _reconnectBanners = {};

function _showReconnectBanner(platKey) {
  if (_reconnectBanners[platKey]) return;
  _reconnectBanners[platKey] = true;

  var platLabels   = { ig:'Instagram', meta:'Facebook', tiktok:'TikTok', youtube:'YouTube' };
  var platApiNames = { ig:'instagram', meta:'facebook', tiktok:'tiktok', youtube:'youtube' };
  var platName     = platLabels[platKey]   || platKey;
  var platApi      = platApiNames[platKey] || platKey;
  var bannerId     = 'pfm-reconnect-banner-' + platKey;
  if (document.getElementById(bannerId)) return;

  var list = document.getElementById('campaign-list');
  if (!list) return;

  var banner = document.createElement('div');
  banner.id = bannerId;
  // Insert SEBELUM campaign-list (sibling), bukan di dalam grid
  banner.style.cssText =
    'background:#fffbeb;border:1px solid #fcd34d;border-radius:12px;'
    + 'padding:12px 14px;margin:0 0 10px;display:flex;align-items:center;'
    + 'justify-content:space-between;gap:10px;font-family:var(--font,sans-serif);';
  banner.innerHTML =
    '<div style="display:flex;align-items:center;gap:8px;flex:1;min-width:0;">'
    +   '<span style="font-size:18px;line-height:1;flex-shrink:0;">⚠️</span>'
    +   '<div style="min-width:0;">'
    +     '<div style="font-size:12px;font-weight:700;color:#92400e;">'
    +       'Akun ' + platName + ' perlu dihubungkan ulang'
    +     '</div>'
    +     '<div style="font-size:11px;color:#b45309;margin-top:2px;line-height:1.4;">'
    +       'Token OAuth expired — klik Hubungkan Ulang untuk memperbarui.'
    +     '</div>'
    +   '</div>'
    + '</div>'
    + '<button onclick="_reconnectFromBanner(\'' + platKey + '\',\'' + platApi + '\')" '
    +   'style="flex-shrink:0;padding:7px 14px;border-radius:8px;border:none;'
    +   'background:#f59e0b;color:#fff;font-size:11px;font-weight:700;cursor:pointer;'
    +   'font-family:var(--font,sans-serif);white-space:nowrap;">'
    +   'Hubungkan Ulang'
    + '</button>'
    + '<button onclick="_dismissReconnectBanner(\'' + platKey + '\')" '
    +   'style="flex-shrink:0;padding:4px 6px;background:none;border:none;'
    +   'cursor:pointer;color:#92400e;font-size:16px;line-height:1;" title="Tutup">✕</button>';

  // Insert sebagai sibling SEBELUM campaign-list (di luar grid)
  list.parentNode.insertBefore(banner, list);
}

function _dismissReconnectBanner(platKey) {
  var el = document.getElementById('pfm-reconnect-banner-' + platKey);
  if (el) el.remove();
  delete _reconnectBanners[platKey];
}

function _reconnectFromBanner(platKey, platApi) {
  // Hapus flag expired — setelah reconnect berhasil token fresh lagi
  localStorage.removeItem('radar_pfm_token_expired_' + platKey);
  delete _reconnectBanners[platKey];
  _dismissReconnectBanner(platKey);

  // Reset error flag di semua campaign platform itu agar polling bisa jalan lagi
  CAMPAIGNS.forEach(function(c) {
    if (c.platforms && c.platforms[0] === platKey) {
      c._postUrlError = false;
      c._authError    = false;
    }
  });

  // Buka OAuth popup reconnect
  if (typeof connectPostForMe === 'function') {
    connectPostForMe(platApi);
  }
}
window._dismissReconnectBanner = _dismissReconnectBanner;
window._reconnectFromBanner    = _reconnectFromBanner;

var _postUrlPollInterval = null;

function startPostUrlPolling() {
  if (window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1') {
    console.log('[monitor] polling dinonaktifkan di localhost');
    return;
  }
  // Bersihkan flag expired lama yang mungkin tersimpan dari versi sebelumnya
  ['ig','meta','tiktok','youtube'].forEach(function(p) {
    localStorage.removeItem('radar_pfm_token_expired_' + p);
  });
  // Jalankan sekali langsung untuk semua campaign yang belum punya post_url
  CAMPAIGNS.forEach(function(c) {
    if (!c.post_url && c.post_id) fetchAndUpdatePostUrl(c);
  });

  // Bersihkan interval lama jika ada
  if (_postUrlPollInterval) clearInterval(_postUrlPollInterval);

  _postUrlPollInterval = setInterval(function() {
    var pending = CAMPAIGNS.filter(function(c) {
      return !c.post_url && c.post_id && !c._postUrlError;
    });

    if (!pending.length) {
      clearInterval(_postUrlPollInterval);
      _postUrlPollInterval = null;
      return;
    }

    console.log('[monitor] polling', pending.length, 'campaigns untuk post_url...');
    pending.forEach(function(c) { fetchAndUpdatePostUrl(c); });
  }, 60000);
}
window.startPostUrlPolling = startPostUrlPolling;

function showDeleteConfirmModal(campaign) {
  var old = document.getElementById('deleteConfirmOverlay');
  if (old) old.remove();

  var platLabels = { ig:'Instagram', meta:'Facebook',
                     tiktok:'TikTok', youtube:'YouTube' };
  var platNames = (campaign.platforms || [])
    .map(function(p){ return platLabels[p] || p; }).join(', ');

  var overlay = document.createElement('div');
  overlay.id = 'deleteConfirmOverlay';
  overlay.style.cssText =
    'position:fixed;inset:0;background:rgba(0,0,0,0.55);'
    + 'z-index:9999;display:flex;align-items:center;'
    + 'justify-content:center;font-family:var(--font,sans-serif);'
    + 'backdrop-filter:blur(4px);';
  overlay.onclick = function(e) {
    if (e.target === overlay) overlay.remove();
  };

  overlay.innerHTML =
    '<div style="background:#fff;border-radius:20px;padding:28px;'
    + 'width:380px;max-width:calc(100vw - 32px);'
    + 'box-shadow:0 24px 64px rgba(0,0,0,0.2);">'

    + '<div style="display:flex;align-items:center;gap:12px;margin-bottom:16px;">'
    +   '<div style="width:40px;height:40px;border-radius:12px;'
    +     'background:#fef2f2;display:flex;align-items:center;'
    +     'justify-content:center;flex-shrink:0;">'
    +     '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">'
    +       '<polyline points="3 6 5 6 21 6"/>'
    +       '<path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/>'
    +       '<path d="M10 11v6M14 11v6"/>'
    +       '<path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/>'
    +     '</svg>'
    +   '</div>'
    +   '<div>'
    +     '<div style="font-size:16px;font-weight:700;color:#111827;">Hapus Campaign?</div>'
    +     '<div style="font-size:12px;color:#6b7280;margin-top:1px;">Tindakan ini tidak bisa dibatalkan</div>'
    +   '</div>'
    + '</div>'

    + '<div style="background:#f9fafb;border-radius:10px;padding:12px 14px;margin-bottom:14px;">'
    +   '<div style="font-size:13px;font-weight:700;color:#111827;'
    +     'white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">'
    +     campaign.name
    +   '</div>'
    +   '<div style="font-size:11px;color:#6b7280;margin-top:3px;">'
    +     platNames
    +   '</div>'
    + '</div>'

    + '<div style="background:#fffbeb;border:1px solid #fcd34d;'
    +   'border-radius:10px;padding:12px 14px;margin-bottom:20px;'
    +   'font-size:12px;color:#92400e;line-height:1.6;">'
    +   '⚠️ <strong>Postingan di ' + platNames + ' TIDAK akan terhapus.</strong>'
    +   ' Kamu perlu hapus manual di masing-masing platform.'
    + '</div>'

    + '<div style="display:flex;gap:10px;">'
    +   '<button onclick="document.getElementById(\'deleteConfirmOverlay\').remove()" '
    +     'style="flex:1;padding:11px;border-radius:12px;'
    +     'border:1.5px solid #e5e7eb;background:#fff;'
    +     'color:#374151;font-size:13px;font-weight:600;'
    +     'cursor:pointer;font-family:var(--font,sans-serif);">Batal</button>'
    +   '<button onclick="_confirmDeleteCampaign(\'' + campaign.id + '\',\''
    +     (campaign.supabase_id || campaign.id) + '\')" '
    +     'style="flex:1;padding:11px;border-radius:12px;'
    +     'border:none;background:#ef4444;color:#fff;'
    +     'font-size:13px;font-weight:600;cursor:pointer;'
    +     'font-family:var(--font,sans-serif);">Hapus dari Larisi</button>'
    + '</div>'
    + '</div>';

  document.body.appendChild(overlay);
}

async function _confirmDeleteCampaign(localId, supabaseId) {
  var overlay = document.getElementById('deleteConfirmOverlay');
  if (overlay) overlay.remove();

  if (supabaseId && typeof deleteCampaign === 'function') {
    await deleteCampaign(supabaseId);
  }

  CAMPAIGNS = CAMPAIGNS.filter(function(c) {
    return String(c.id) !== String(localId);
  });

  var cardEl = document.getElementById('campaign-card-' + localId);
  if (cardEl) {
    cardEl.style.transition = 'opacity 0.3s, transform 0.3s';
    cardEl.style.opacity = '0';
    cardEl.style.transform = 'scale(0.95)';
    setTimeout(function() { cardEl.remove(); }, 300);
  }

  if (typeof showTopToast === 'function') {
    showTopToast('✓ Iklan berhasil dihapus dari Larisi', 'success');
  }
}

function buildCampaignCard(c) {
  var isRunning = c.status === 'running';
  var isPaused  = c.status === 'paused';
  var statusColor = isRunning ? '#16a34a' : (isPaused ? '#d97706' : '#9ca3af');
  var statusLbl   = isRunning ? 'Berjalan' : (isPaused ? 'Dihentikan' : 'Selesai');
  var pct = Math.min(100, Math.round((c.reach / (c.reachTarget || 1)) * 100));

  var platColors = { ig:'#E1306C', tiktok:'#010101', meta:'#1877F2', youtube:'#FF0000' };
  var platLabels = { ig:'Instagram', tiktok:'TikTok', meta:'Facebook', youtube:'YouTube' };
  var primaryColor = platColors[c.platforms[0]] || '#791ADB';

  var storedAccounts = typeof _getStoredAccounts === 'function' ? _getStoredAccounts() : [];
  var platApiMap = { ig:'instagram', meta:'facebook', tiktok:'tiktok', youtube:'youtube' };
  var matchedAcc = null;
  for (var i = 0; i < storedAccounts.length; i++) {
    if (storedAccounts[i].platform === (platApiMap[c.platforms[0]] || c.platforms[0])) {
      matchedAcc = storedAccounts[i]; break;
    }
  }
  var avatarUrl = matchedAcc ? (matchedAcc.avatar_url || '') : '';
  var username  = matchedAcc ? (matchedAcc.username || '') : '';
  var usernameDisplay = username ? ('@' + username) : (platLabels[c.platforms[0]] || 'Social');

  var timeDisplay = c.launchTime || '';
  if (c.created_at) {
    try {
      var d = new Date(c.created_at);
      var days = ['Minggu','Senin','Selasa','Rabu','Kamis','Jumat','Sabtu'];
      var months = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'];
      timeDisplay = days[d.getDay()] + ', ' + d.getDate() + ' '
        + months[d.getMonth()] + ' ' + d.getFullYear()
        + ' · ' + String(d.getHours()).padStart(2,'0') + '.'
        + String(d.getMinutes()).padStart(2,'0');
    } catch(e) {}
  }

  var initials = (c.name || 'C').charAt(0).toUpperCase();
  var avatarBg  = c.thumbColor || '#7c3aed';

  var avatarFallbackStyle =
    'width:100%;height:100%;background:' + avatarBg + ';'
    + 'display:flex;align-items:center;justify-content:center;'
    + 'font-size:14px;font-weight:700;color:white;border-radius:50%;';

  var avatarHTML = avatarUrl
    ? '<img src="' + avatarUrl + '" style="width:100%;height:100%;object-fit:cover;" '
    +   'onerror="this.style.display=\'none\';'
    +   'var fb=document.createElement(\'div\');'
    +   'fb.style.cssText=\'' + avatarFallbackStyle.replace(/'/g, '\\\'') + '\';'
    +   'fb.textContent=\'' + initials + '\';'
    +   'this.parentElement.appendChild(fb);">'
    : '<div style="' + avatarFallbackStyle + '">' + initials + '</div>';

  var platSvgContent = (PLAT_SVG[c.platforms[0]] || '')
    .replace(/^<svg[^>]*>/, '').replace(/<\/svg>$/, '');

  var fmt = c.format || 'post';
  var platName = platLabels[c.platforms[0]] || 'Platform';

  // Thumbnail dari thumbUrl (foto yang diupload saat launch)
  // blob: URL tidak valid antar sesi — buang agar tidak tampil blur setelah refresh
  var _thumbRaw = c.thumbUrl || '';
  var _thumb = _thumbRaw.startsWith('blob:') ? '' : _thumbRaw;
  // blob: URLs bisa berupa gambar OR video — cek format campaign untuk menentukan
  var _isActualVideo = _thumb.startsWith('data:video') ||
    (c.format && (c.format === 'reel' || c.format === 'video')) ||
    (typeof uploadedVideoFile !== 'undefined' && uploadedVideoFile && c.id === (window._lastLaunchedId));
  var _isVideoPlaceholder = _isActualVideo && !_thumb.startsWith('data:image') && !_thumb.startsWith('https://');
  // Hanya pakai data: atau https: — blob: sudah dibuang di atas
  var _isImage = _thumb.startsWith('data:image') || _thumb.startsWith('https://');
  var _videoPlaceholderHTML =
    '<div class="cc-thumbnail-container" style="margin:0 12px 8px;height:240px;'
    + 'border-radius:8px;background:' + (c.thumbColor || '#1a1a2e') + ';'
    + 'display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;">'
    + '<span style="font-size:36px;line-height:1;">&#9654;</span>'
    + '<span style="color:white;font-size:12px;font-weight:600;letter-spacing:0.05em;">VIDEO</span>'
    + '</div>';
  var thumbHTML = !_thumb
    ? '<div class="cc-thumbnail-container" style="margin:0 12px 8px;height:240px;'
    +   'border-radius:8px;display:flex;align-items:center;justify-content:center;">'
    +   '<span style="color:#9ca3af;font-size:12px;text-align:center;">Foto tidak tersedia</span>'
    + '</div>'
    : _isVideoPlaceholder
    ? _videoPlaceholderHTML
    : _isImage
    ? '<div class="cc-thumbnail-container" style="margin:0 12px 8px;height:240px;border-radius:8px;overflow:hidden;background:#f3f4f6;">'
    +   '<img src="' + _thumb + '" class="cc-thumbnail-img" style="width:100%;height:100%;'
    +   'object-fit:cover;object-position:top;display:none;"'
    +   ' onload="this.style.display=\'block\'"'
    +   ' onerror="_onThumbError(this,' + (_isActualVideo ? '1' : '0') + ",'" + (c.thumbColor || '#1a1a2e') + "')\""  + '>'
    + '</div>'
    : _videoPlaceholderHTML;

  // View URL untuk timestamp — pakai post_url langsung dari API (bukan konstruksi)
  // Story tidak punya URL permanen, selalu plain text
  var isStory = fmt === 'story';
  var viewUrl = (!isStory && c.post_url) ? c.post_url : null;

  var card = document.createElement('div');
  card.className = 'campaign-card' + (isRunning ? ' running-card' : '')
    + (activeCampaignId === c.id ? ' focused' : '');
  card.id = 'campaign-card-' + c.id;
  card.setAttribute('data-id', c.id);
  card.onclick = function() { selectCampaign(c.id); };

  card.innerHTML =

    // ── Header ──
    '<div style="display:flex;align-items:center;gap:8px;padding:12px 12px 8px;">'

    // Avatar
    + '<div style="position:relative;width:40px;height:40px;flex-shrink:0;">'
    +   '<div style="width:40px;height:40px;border-radius:50%;overflow:hidden;'
    +     'border:1.5px solid ' + primaryColor + '40;">' + avatarHTML + '</div>'
    +   '<div style="position:absolute;bottom:0;right:0;width:16px;height:16px;'
    +     'border-radius:50%;background:white;border:1.5px solid #e5e7eb;'
    +     'display:flex;align-items:center;justify-content:center;'
    +     'box-sizing:border-box;padding:2px;">'
    +     '<svg viewBox="0 0 24 24" fill="' + primaryColor + '" width="10" height="10">'
    +       platSvgContent
    +     '</svg>'
    +   '</div>'
    + '</div>'

    // Info — nama + username + timestamp
    + '<div style="flex:1;min-width:0;">'
    +   '<div style="font-size:13px;font-weight:700;color:#111827;'
    +     'white-space:nowrap;overflow:hidden;text-overflow:ellipsis;letter-spacing:-0.2px;">'
    +     c.name
    +   '</div>'
    +   '<div style="font-size:10px;color:#9ca3af;margin-top:1px;">'
    +     usernameDisplay
    +   '</div>'
    +   '<div style="font-size:10px;margin-top:2px;">'
    +     (viewUrl
    ?       '<a href="' + viewUrl + '" target="_blank" rel="noopener" class="cc-timestamp" '
    +         'style="color:#791ADB;text-decoration:underline;text-underline-offset:2px;font-weight:600;" '
    +         'onclick="event.stopPropagation();">' + timeDisplay + '</a>'
    : isStory
    ?       '<span class="cc-timestamp" style="color:#9ca3af;">' + timeDisplay + '</span>'
    :       '<span class="cc-timestamp" style="color:#9ca3af;cursor:help;" title="Link belum tersedia">' + timeDisplay + '</span>')
    +   '</div>'
    + '</div>'

    // Status + Delete — satu baris kanan
    + '<div style="display:flex;align-items:center;gap:6px;flex-shrink:0;">'
    +   '<span style="width:6px;height:6px;border-radius:50%;'
    +     'background:' + (isRunning ? '#22c55e' : statusColor) + ';'
    +     'display:inline-block;'
    +     (isRunning ? 'animation:pulseDot 2s infinite;' : '') + '"></span>'
    +   '<span style="font-size:10px;font-weight:700;color:' + statusColor + ';">' + statusLbl + '</span>'
    +   '<button onclick="event.stopPropagation();showDeleteConfirmModal('
    +     JSON.stringify({
            id: c.id,
            name: c.name,
            platforms: c.platforms,
            supabase_id: c.supabase_id || c.id
          }).replace(/"/g, '&quot;') + ')" '
    +     'style="background:none;border:none;cursor:pointer;padding:4px;'
    +     'color:#9ca3af;display:flex;align-items:center;'
    +     'border-radius:6px;transition:color 0.2s,background 0.2s;" '
    +     'title="Hapus campaign" '
    +     'onmouseover="this.style.color=\'#ef4444\';this.style.background=\'#fef2f2\'" '
    +     'onmouseout="this.style.color=\'#9ca3af\';this.style.background=\'none\'">'
    +     '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">'
    +       '<polyline points="3 6 5 6 21 6"/>'
    +       '<path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/>'
    +       '<path d="M10 11v6M14 11v6"/>'
    +       '<path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/>'
    +     '</svg>'
    +   '</button>'
    + '</div>'
    + '</div>'

    // ── Thumbnail ──
    + thumbHTML

    // ── Divider ──
    + '<div style="height:1px;background:#f3f4f6;margin:0 12px;"></div>'

    // ── Engagement ──
    + '<div style="padding:8px 12px;">'
    +   '<div style="display:flex;justify-content:space-between;'
    +     'align-items:center;margin-bottom:6px;">'
    +     '<span style="font-size:10px;font-weight:700;color:#374151;'
    +       'letter-spacing:0.03em;">ENGAGEMENTS</span>'
    +     '<span id="eng-total-' + c.id + '" style="font-size:10px;'
    +       'font-weight:700;color:#791ADB;">—</span>'
    +   '</div>'
    +   '<div style="display:flex;flex-direction:column;gap:3px;">'
    +     _engRow2('Reactions', 'likes-'    + c.id)
    +     _engRow2('Comments',  'comments-' + c.id)
    +     _engRow2('Shares',    'shares-'   + c.id)
    +     (c.platforms[0] === 'meta'
            ? _engRowNA('Views', 'views-' + c.id,
                'Post foto & teks Facebook tidak memiliki data Views')
            : _engRow2('Views', 'views-' + c.id,
                (c.views && c.views > 0) ? formatReach(c.views) : '—'))
    +     '<div style="display:flex;align-items:center;justify-content:space-between;padding:2px 0;">'
    +       '<span style="font-size:10px;color:#111827;">Reach</span>'
    +       '<span style="font-size:11px;font-weight:700;color:#111827;display:flex;align-items:center;gap:4px;">'
    +         '<span id="reach-num-' + c.id + '">' + (c._reachReal ? formatReach(c.reach) : '—') + '</span>'
    +         (isRunning ? '<span style="font-size:9px;color:#16a34a;margin-left:3px;">▲</span>' : '')
    +       '</span>'
    +     '</div>'
    +   '</div>'
    + '</div>'

    // ── Progress bar ──
    + '<div style="height:2px;background:#f3f4f6;overflow:hidden;margin:0 12px 8px;">'
    +   '<div id="reach-bar-' + c.id + '" style="height:100%;width:' + pct + '%;'
    +     'background:' + (isRunning ? '#791ADB' : '#d1d5db') + ';'
    +     'transition:width 0.5s ease;border-radius:2px;"></div>'
    + '</div>'

    // ── Boost button ──
    + '<div style="padding:0 12px 12px;">'
    + '<button onclick="event.stopPropagation();showBoostModal('
    + JSON.stringify({
        nama: c.name, name: c.name, platforms: c.platforms,
        kecamatan: c.kecamatan || '', radius: c.radius || 1,
        kategori: c.kategori || 'General', format: fmt,
        reachMin: c.reach || 0, reachMax: c.reachTarget || 10000
      }).replace(/"/g, '&quot;') + ')" '
    + 'style="width:100%;padding:8px;border-radius:8px;border:none;'
    + 'background:#111827;color:white;font-size:11px;font-weight:700;'
    + 'cursor:pointer;font-family:var(--font,sans-serif);'
    + 'display:flex;align-items:center;justify-content:center;gap:5px;'
    + 'transition:background 0.15s;" '
    + 'onmouseover="this.style.background=\'#791ADB\'" '
    + 'onmouseout="this.style.background=\'#111827\'">Boost</button>'
    + '</div>';

  return card;
}

// Helper engagement row
function _engRow2(label, elId, defaultVal, isLive) {
  return '<div style="display:flex;align-items:center;justify-content:space-between;padding:2px 0;">'
    + '<span style="font-size:10px;color:#111827;">' + label + '</span>'
    + '<span style="font-size:11px;font-weight:700;color:#111827;">'
    +   '<span id="' + elId + '">' + (defaultVal || '—') + '</span>'
    +   (isLive ? '<span style="font-size:9px;color:#16a34a;margin-left:3px;">▲</span>' : '')
    + '</span>'
    + '</div>';
}

// Row khusus untuk metrik yang tidak tersedia di platform tertentu
// Tampil "N/A" abu-abu + ikon ⓘ dengan custom tooltip saat hover
function _engRowNA(label, elId, tooltip) {
  return '<div style="display:flex;align-items:center;justify-content:space-between;padding:2px 0;">'
    + '<span style="font-size:10px;color:#111827;">' + label + '</span>'
    + '<span id="' + elId + '" class="eng-na-tip" data-tooltip="' + tooltip + '" '
    +   'style="font-size:11px;font-weight:600;color:#9ca3af;'
    +   'display:flex;align-items:center;gap:3px;cursor:help;position:relative;">'
    +   'N/A'
    +   '<svg width="11" height="11" viewBox="0 0 24 24" fill="none" '
    +     'stroke="#9ca3af" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">'
    +     '<circle cx="12" cy="12" r="9"/>'
    +     '<line x1="12" y1="11" x2="12" y2="16"/>'
    +     '<circle cx="12" cy="8" r="0.5" fill="#9ca3af" stroke="none"/>'
    +   '</svg>'
    + '</span>'
    + '</div>';
}

/* ─── Load Analytics for Card ─── */
async function _loadAnalyticsForCard(campaign) {
  // _authError dari fetchAndUpdatePostUrl (endpoint /v1/social-posts) TIDAK memblokir
  // engagement fetch (endpoint /v1/social-account-feeds) — keduanya independen
  try {
    var accounts = typeof _getStoredAccounts === 'function'
      ? _getStoredAccounts() : [];
    if (!accounts.length) return;

    var platApiMap = { ig:'instagram', meta:'facebook',
                       tiktok:'tiktok', youtube:'youtube' };
    var plat = campaign.platforms[0];
    var sp   = platApiMap[plat] || plat;

    var acc = null;
    for (var j = 0; j < accounts.length; j++) {
      if (accounts[j].platform === sp) { acc = accounts[j]; break; }
    }
    if (!acc || !acc.id) return;

    // Feed cache per AKUN (acc.id) — bukan per campaign
    // Semua campaign dari akun yang sama berbagi SATU fetch ke PostForMe
    // Mencegah concurrent API calls yang menyebabkan rate-limit → beberapa campaign kosong
    var feedKey  = acc.id;
    var now      = Date.now();
    var expired  = !_analyticsCacheTime[feedKey] ||
                   (now - _analyticsCacheTime[feedKey] > ANALYTICS_CACHE_TTL);

    if ((!_analyticsCache[feedKey] || expired) && !_analyticsFetching[feedKey]) {
      _analyticsFetching[feedKey] = true;
      var baseEndpoint = '/v1/social-account-feeds/' + acc.id + '?expand=metrics&limit=50';
      try {
        var data = await _pfmProxy(baseEndpoint, 'GET', null);
        var posts = (data && (
          data.posts || data.data || data.items ||
          data.feeds || data.results || data.feed
        )) || (Array.isArray(data) ? data : []);
        _analyticsCache[feedKey]     = posts;
        _analyticsCacheTime[feedKey] = Date.now();
      } catch(e) {
        _analyticsCache[feedKey] = [];
      }
      _analyticsFetching[feedKey] = false;
    }

    var waited = 0;
    while (_analyticsFetching[feedKey] && waited < 5000) {
      await new Promise(function(r){ setTimeout(r, 100); });
      waited += 100;
    }

    var posts = _analyticsCache[feedKey] || [];
    if (!posts.length) return;

    // Match berdasarkan platform_post_id yang tersimpan di Supabase
    var targetPost   = null;
    var _isExactMatch = false;

    for (var k = 0; k < posts.length; k++) {
      var p = posts[k];
      // Hanya exact match via platform_post_id (ID real dari IG/FB/TikTok/YouTube)
      // JANGAN gunakan p.id === campaign.post_id (PostForMe internal ID)
      // karena initial publish response bisa mengembalikan ID post sebelumnya
      if (campaign.platform_post_id && p.platform_post_id === campaign.platform_post_id) {
        targetPost    = p;
        _isExactMatch = true;
        break;
      }
    }
    // Temporal matching: cari post yang waktunya paling dekat dengan campaign.created_at
    // Digunakan ketika platform_post_id belum tersimpan di Supabase (misal setelah hard refresh)
    // Toleransi ±15 menit — jika cocok, anggap exact match dan simpan platform_post_id ke Supabase
    if (!targetPost && campaign.created_at && posts.length) {
      var _campTime = new Date(campaign.created_at).getTime();
      var _bestPost = null;
      var _bestDiff = Infinity;
      var _MAX_DIFF = 15 * 60 * 1000; // 15 menit

      for (var kt = 0; kt < posts.length; kt++) {
        var pt = posts[kt];
        // Coba semua field waktu yang mungkin ada di PostForMe
        // Field yang confirmed ada di PostForMe feed response: posted_at
        var _postTime = new Date(
          pt.posted_at || pt.published_at || pt.created_at || pt.scheduled_at || pt.post_date || 0
        ).getTime();
        if (!_postTime) continue;
        var _diff = Math.abs(_campTime - _postTime);
        if (_diff < _bestDiff) { _bestDiff = _diff; _bestPost = pt; }
      }

      if (_bestPost && _bestDiff <= _MAX_DIFF) {
        // Cocok dalam 15 menit — perlakukan sebagai exact match
        targetPost    = _bestPost;
        _isExactMatch = true;
        console.log('[monitor] Temporal match:', campaign.name,
          '— diff', Math.round(_bestDiff / 1000) + 's, post:', _bestPost.platform_post_id);

        // Simpan platform_post_id ke Supabase agar hard refresh berikutnya langsung exact match
        if (_bestPost.platform_post_id && !campaign.platform_post_id) {
          campaign.platform_post_id = _bestPost.platform_post_id;
          if (typeof updateCampaignPostId === 'function' && campaign.supabase_id && campaign.post_id) {
            updateCampaignPostId(campaign.supabase_id, campaign.post_id, null, _bestPost.platform_post_id);
          }
        }
      } else if (_bestPost) {
        // Diff > 15 menit — pakai best-effort engagement saja (tanpa URL/thumbnail)
        // Tidak perlu post_id — campaign.created_at sudah cukup sebagai gating
        targetPost    = _bestPost;
        _isExactMatch = false;
        console.warn('[monitor] Temporal fallback (diff terlalu jauh):', campaign.name,
          Math.round(_bestDiff / 1000) + 's');
      }
    }

    // Fallback final: posts[0] hanya jika temporal matching tidak berhasil sama sekali
    // (posts kosong atau tidak ada created_at), dan campaign punya post_id
    if (!targetPost && campaign.post_id && campaign.created_at) {
      targetPost    = posts[0] || null;
      _isExactMatch = false;
      if (targetPost) {
        console.warn('[monitor] Fallback posts[0] (last resort):', campaign.name);
      }
    }
    if (!targetPost) return;
    // Jangan tampilkan engagement dari fallback yang tidak akurat (posts[0] atau temporal > 15 menit)
    if (!_isExactMatch) return;

    // Extract metrics — PostForMe menyimpan di targetPost.metrics
    var m = targetPost.metrics || {};

    // ── Bug Fix 1: FB Likes ──────────────────────────────────────────────────
    // FB: reactions_total = semua reaksi (👍❤️😂😮😢😡) = yang tampil di UI FB — PRIORITAS UTAMA
    //     reactions_by_type.like = hanya 👍 thumbs-up = SUBSET, bukan total
    //     Matt (PostForMe support) konfirmasi reactions_by_type tidak didukung untuk FB posts
    // IG/TikTok/YouTube: pakai m.likes / m.like_count / m.favorite_count
    var _rbt  = (m.reactions_by_type && typeof m.reactions_by_type === 'object')
                ? m.reactions_by_type : {};
    var _likesRaw = (plat === 'meta')
      // Facebook: reactions_total dulu (semua reaksi), baru fallback ke breakdown
      ? ((m.reactions_total != null) ? m.reactions_total :
         (m.reactions_like  != null) ? m.reactions_like  :
         (_rbt.like         != null) ? _rbt.like         :
         (m.like_count      != null) ? m.like_count      :
         (m.reactions       != null) ? m.reactions       : 0)
      // IG / TikTok / YouTube: likes biasa
      : ((_rbt.like         != null) ? _rbt.like         :
         (m.like_count      != null) ? m.like_count      :
         (m.likes           != null) ? m.likes           :
         (m.reactions_total != null) ? m.reactions_total :
         (m.favorite_count  != null) ? m.favorite_count  : 0);
    var likes = parseInt(_likesRaw, 10) || 0;
    var comments = parseInt(m.comments        || m.comment_count   || m.reply_count || 0);
    var shares   = parseInt(m.shares          || m.share_count     || m.retweet_count || 0);
    var views    = parseInt(m.video_views     || m.video_views_unique || m.view_count ||
                            m.views           || m.play_count      || m.impressions || 0);

    // ── Bug Fix 2: FB Reach ──────────────────────────────────────────────────
    // FB Graph API tidak punya satu field 'reach' untuk post — split jadi:
    // organic_reach + paid_reach + viral_reach + fan_reach
    // IG: m.reach tersedia langsung sebagai satu field → tidak perlu sum
    var reachReal;
    if (plat === 'meta') {
      var _or = parseInt(m.organic_reach || 0) || 0;
      var _pr = parseInt(m.paid_reach    || 0) || 0;
      var _vr = parseInt(m.viral_reach   || 0) || 0;
      var _fr = parseInt(m.fan_reach     || 0) || 0;
      var _sumFbReach = _or + _pr + _vr + _fr;
      // Jika semua split null, coba field generic sebagai safety net
      reachReal = _sumFbReach > 0
        ? _sumFbReach
        : parseInt(m.reach || m.total_reach || 0);
    } else {
      reachReal = parseInt(m.reach || m.organic_reach || m.total_reach || 0);
    }

    // ── Simpan engagement ke campaign._engagement — dipakai SiLaris AI ──
    // Level 2 Instagram
    var _saved       = parseInt(m.saved            || 0) || null;
    var _follows     = parseInt(m.follows          || m.new_followers  || 0) || null;
    var _profVisits  = parseInt(m.profile_visits   || m.profile_views  || 0) || null;
    var _totalInter  = parseInt(m.total_interactions || 0) || null;
    var _reelsWatch  = m.ig_reels_avg_watch_time   || null;
    // Level 2 Facebook
    var _organicR    = parseInt(m.organic_reach    || 0) || null;
    var _paidR       = parseInt(m.paid_reach       || 0) || null;
    var _viralR      = parseInt(m.viral_reach      || 0) || null;
    var _fanR        = parseInt(m.fan_reach        || 0) || null;
    var _vidAvgWatch = m.video_avg_time_watched    || null;
    var _rbtFull     = (m.reactions_by_type && typeof m.reactions_by_type === 'object') ? m.reactions_by_type : {};

    campaign._engagement = {
      // Level 1
      likes:     likes,
      comments:  comments,
      shares:    shares,
      views:     views     > 0 ? views     : null,
      reach:     reachReal > 0 ? reachReal : null,
      total:     likes + comments + shares,
      // Level 2 Instagram
      saved:           _saved,
      follows:         _follows,
      profileVisits:   _profVisits,
      totalInteractions: _totalInter,
      reelsAvgWatchMs: _reelsWatch,
      // Level 2 Facebook
      organicReach:    _organicR,
      paidReach:       _paidR,
      viralReach:      _viralR,
      fanReach:        _fanR,
      videoAvgWatchMs: _vidAvgWatch,
      reactionsLove:   _rbtFull.love  || null,
      reactionsHaha:   _rbtFull.haha  || null,
      reactionsWow:    _rbtFull.wow   || null,
      reactionsAngry:  _rbtFull.anger || null,
      // Level 3 — dihitung otomatis
      // Bug Fix 3: TikTok & YouTube tidak punya field 'reach' — denominator ER = views
      // Standar industri: TikTok ER = (likes+comments+shares) / views × 100
      // IG/FB: denominator = reach (sudah difix di Bug Fix 2)
      engagementRate: (function() {
        var _denom = reachReal > 0 ? reachReal : views;
        return _denom > 0
          ? (((likes + comments + shares) / _denom) * 100).toFixed(1) + '%'
          : null;
      })(),
      // Meta
      postTime: targetPost.posted_at || targetPost.published_at || null,
      caption:  targetPost.caption   || campaign.caption        || null,
      platform: (campaign.platforms  || [])[0]                  || null,
      format:   campaign.format      || 'post',
      isExact:  _isExactMatch
    };

    // Ambil thumbnail dari media PostForMe HANYA jika match exact
    var mediaUrl = null;
    if (targetPost.media && targetPost.media.length && targetPost.media[0].url) {
      mediaUrl = targetPost.media[0].url;
      // Update thumbUrl hanya jika exact match dan belum ada thumbnail permanen
      if (campaign.platform_post_id && targetPost.platform_post_id === campaign.platform_post_id) {
        var _sb = RADAR_CONFIG.SUPABASE_URL + '/storage/';
        var _isPerm = campaign.thumbUrl && (campaign.thumbUrl.startsWith('data:') || campaign.thumbUrl.startsWith(_sb));
        if (!_isPerm) campaign.thumbUrl = mediaUrl;
      }
    }

    var fmt = function(n) {
      return n >= 1000 ? (n/1000).toFixed(1)+'K' : n.toString();
    };

    // Update engagement DOM
    var likesEl    = document.getElementById('likes-'     + campaign.id);
    var commentsEl = document.getElementById('comments-'  + campaign.id);
    var sharesEl   = document.getElementById('shares-'    + campaign.id);
    var totalEl    = document.getElementById('eng-total-' + campaign.id);
    if (likesEl)    likesEl.textContent    = fmt(likes);
    if (commentsEl) commentsEl.textContent = fmt(comments);
    if (sharesEl)   sharesEl.textContent   = fmt(shares);
    if (totalEl)    totalEl.textContent    = fmt(likes + comments + shares);

    // Update views DOM
    // FB post biasa tidak punya views → pertahankan N/A yang sudah di-render
    // FB video bisa punya views → timpa dengan angka real jika ada
    // Platform lain: update normal
    var viewsEl = document.getElementById('views-' + campaign.id);
    if (viewsEl) {
      if (plat === 'meta' && views === 0) {
        // N/A sudah di-set saat render — jangan timpa dengan '—'
      } else {
        viewsEl.textContent = views > 0 ? fmt(views) : '—';
      }
    }

    // Update reach DOM dengan data real dari API
    if (reachReal > 0) {
      // Matikan counter animasi simulasi — sudah ada data real, tidak perlu animasi lagi
      if (campaignReachIntervals[campaign.id]) {
        clearInterval(campaignReachIntervals[campaign.id]);
        delete campaignReachIntervals[campaign.id];
      }
      campaign._reachReal = true; // flag agar counter tidak restart
      var reachEl = document.getElementById('reach-num-' + campaign.id);
      if (reachEl) reachEl.textContent = fmt(reachReal);
      // Sembunyikan label estimasi karena sudah dapat data real
      var estEl = document.getElementById('reach-est-' + campaign.id);
      if (estEl) estEl.style.display = 'none';
    }

    // Build post URL dari targetPost
    var postUrl = targetPost.platform_url || targetPost.url || null;
    if (!postUrl) {
      var pid   = targetPost.platform_post_id || null;
      var uname = acc.username || '';
      var fmt2  = campaign.format || 'post';
      if (pid) {
        if (plat === 'ig') {
          postUrl = fmt2 === 'reel'
            ? 'https://www.instagram.com/reel/' + pid + '/'
            : 'https://www.instagram.com/p/' + pid + '/';
        } else if (plat === 'meta') {
          postUrl = 'https://www.facebook.com/permalink.php?story_fbid=' + pid;
        } else if (plat === 'tiktok' && uname) {
          postUrl = 'https://www.tiktok.com/@' + uname + '/video/' + pid;
        } else if (plat === 'youtube') {
          postUrl = 'https://www.youtube.com/shorts/' + pid;
        }
      }
    }

    // Update UI — hanya lakukan jika exact match (bukan fallback)
    var cardEl = document.getElementById('campaign-card-' + campaign.id);
    if (cardEl) {
      // Timestamp → jadi link HANYA jika kita confirmed post yang benar
      // Fallback posts[0] TIDAK boleh set URL — bisa jadi post orang/campaign lain
      if (postUrl && _isExactMatch) {
        campaign.post_url = postUrl; // simpan di memory
        if (typeof updateCampaignPostUrl === 'function' && campaign.supabase_id) {
          updateCampaignPostUrl(campaign.supabase_id, postUrl); // persist ke Supabase
        }
        var tsEl = cardEl.querySelector('.cc-timestamp');
        if (tsEl && tsEl.tagName !== 'A') {
          var tsA = document.createElement('a');
          tsA.href      = postUrl;
          tsA.target    = '_blank';
          tsA.rel       = 'noopener';
          tsA.className = 'cc-timestamp';
          tsA.style.cssText = 'color:#791ADB;text-decoration:underline;'
            + 'text-underline-offset:2px;font-weight:600;font-size:10px;';
          tsA.textContent = tsEl.textContent;
          tsA.addEventListener('click', function(e) { e.stopPropagation(); });
          tsEl.parentNode.replaceChild(tsA, tsEl);
        } else if (tsEl && tsEl.tagName === 'A') {
          tsEl.href = postUrl;
        }
      }

      // Thumbnail update juga hanya jika exact match DAN belum ada thumb permanen
      // Guard penting: jangan timpa Supabase Storage URL atau base64 dengan CDN/video URL dari PostForMe
      var _sbDomCheck = RADAR_CONFIG.SUPABASE_URL + '/storage/';
      var _isPermDom = campaign.thumbUrl && (
        campaign.thumbUrl.startsWith('data:') ||
        campaign.thumbUrl.startsWith(_sbDomCheck)
      );
      // Juga jangan set video URL (mp4/webm) sebagai src img
      var _mediaIsImage = mediaUrl && !mediaUrl.match(/\.(mp4|webm|mov|avi|mkv)(\?|$)/i) &&
        !mediaUrl.includes('video/');
      if (mediaUrl && _isExactMatch && !_isPermDom && _mediaIsImage) {
        var thumbContainer = cardEl.querySelector('.cc-thumbnail-container');
        if (thumbContainer) {
          var img = thumbContainer.querySelector('.cc-thumbnail-img');
          if (img) {
            if (img.src !== mediaUrl) img.src = mediaUrl;
          } else {
            thumbContainer.innerHTML = '<img src="' + mediaUrl + '" class="cc-thumbnail-img" '
              + 'style="width:100%;height:100%;object-fit:cover;object-position:top;display:block;">';
            thumbContainer.style.background = 'none';
            thumbContainer.style.border = 'none';
          }
        }
      }
    }

  } catch(e) { /* silent */ }
}

/* ─── Dimming ─── */
function applyDimming(activeId) {
  document.querySelectorAll('.campaign-card').forEach(function(card) {
    var id = card.getAttribute('data-id');
    if (id === String(activeId)) {
      card.classList.add('focused');
      card.classList.remove('dimmed');
    } else {
      card.classList.remove('focused');
      card.classList.remove('dimmed');
    }
  });
}

function removeDimming() {
  document.querySelectorAll('.campaign-card').forEach(function(card) {
    card.classList.remove('focused', 'dimmed');
  });
}

/* ─── Campaign Selection ─── */
function selectCampaign(id) {
  if (activeCampaignId === id) {
    activeCampaignId = null;
    removeDimming();
    resetChatPanel();
    return;
  }
  activeCampaignId = id;
  applyDimming(id);
  openChatForCampaign(id);
}

/* ─── Chat Panel ─── */
function resetChatPanel() {
  var empty = document.getElementById('chatEmpty');
  var msgs  = document.getElementById('chatMessages');
  if (empty) empty.style.display = '';
  if (msgs)  msgs.style.display  = 'none';
  var pill = document.getElementById('contextPill');
  if (pill) pill.innerHTML =
    '<span class="ctx-dot" id="ctxDot"></span>'
    + '<span style="color:var(--secondary);">Pilih campaign</span>';
}

/* ── SiLaris loading state — tampil saat tunggu analytics selesai ── */
function showSilarisLoadingState(msg) {
  var msgs  = document.getElementById('chatMessages');
  var input = document.getElementById('chatInput');
  var send  = document.getElementById('chatSendBtn');
  if (input) { input.disabled = true; input.style.opacity = '0.5'; }
  if (send)  { send.disabled  = true; send.style.opacity  = '0.5'; }
  if (msgs) {
    var el = document.createElement('div');
    el.id = 'silaris-data-loading';
    el.className = 'chat-msg ai';
    el.innerHTML =
      '<div class="chat-sender ai-label">SiLaris</div>'
      + '<div class="chat-bubble ai-bubble" style="display:flex;align-items:center;gap:8px;">'
      +   '<span class="scan-dot" style="display:inline-block;margin:0 2px;"></span>'
      +   '<span class="scan-dot" style="display:inline-block;margin:0 2px;"></span>'
      +   '<span class="scan-dot" style="display:inline-block;margin:0 2px;"></span>'
      +   '<span style="font-size:12px;color:#6b7280;margin-left:4px;">' + (msg || 'Memuat data campaign...') + '</span>'
      + '</div>';
    msgs.appendChild(el);
    scrollChatToBottom();
  }
}

function hideSilarisLoadingState() {
  var el    = document.getElementById('silaris-data-loading');
  var input = document.getElementById('chatInput');
  var send  = document.getElementById('chatSendBtn');
  if (el)    el.remove();
  if (input) { input.disabled = false; input.style.opacity = ''; }
  if (send)  { send.disabled  = false; send.style.opacity  = ''; }
}

/* ── Helper: bangun campaign_data dari campaign._engagement ── */
function _buildCampaignData(campaign) {
  var eng = campaign._engagement || {};
  var platLabel = { ig:'Instagram', meta:'Facebook', tiktok:'TikTok', youtube:'YouTube' };
  return {
    name:         campaign.name || '-',
    platform:     platLabel[eng.platform] || platLabel[(campaign.platforms||[])[0]] || (campaign.platforms||[]).join(', ') || '-',
    format:       eng.format   || campaign.format || 'post',
    post_time:    eng.postTime  || campaign.launchTime || null,
    caption:      (eng.caption  || campaign.caption || '').slice(0, 300) || null,
    // Level 1
    reactions:    eng.likes    != null ? eng.likes    : null,
    comments:     eng.comments != null ? eng.comments : null,
    shares:       eng.shares   != null ? eng.shares   : null,
    views:        eng.views    != null ? eng.views    : null,
    reach:        eng.reach    != null ? eng.reach    : null,
    total_eng:    eng.total    != null ? eng.total    : null,
    // Level 2 Instagram
    saved:              eng.saved              || null,
    follows:            eng.follows            || null,
    profile_visits:     eng.profileVisits      || null,
    total_interactions: eng.totalInteractions  || null,
    reels_avg_watch_ms: eng.reelsAvgWatchMs    || null,
    // Level 2 Facebook
    organic_reach:      eng.organicReach       || null,
    paid_reach:         eng.paidReach          || null,
    viral_reach:        eng.viralReach         || null,
    video_avg_watch_ms: eng.videoAvgWatchMs    || null,
    reactions_love:     eng.reactionsLove      || null,
    reactions_haha:     eng.reactionsHaha      || null,
    reactions_wow:      eng.reactionsWow       || null,
    reactions_angry:    eng.reactionsAngry     || null,
    // Level 3
    engagement_rate: eng.engagementRate || null,
    data_quality:    eng.isExact ? 'exact_match' : 'estimasi'
  };
}

async function openChatForCampaign(id) {
  var campaign = null;
  for (var i = 0; i < CAMPAIGNS.length; i++) {
    if (CAMPAIGNS[i].id === id) { campaign = CAMPAIGNS[i]; break; }
  }
  if (!campaign) return;

  // Update context pill
  var dotCls = campaign.status === 'running' ? 'running' : 'paused';
  var pill = document.getElementById('contextPill');
  if (pill) pill.innerHTML =
    '<span class="ctx-dot ' + dotCls + '" id="ctxDot"></span>'
    + '<div style="display:flex;flex-direction:column;line-height:1.3;">'
    +   '<span style="font-size:9px;color:var(--secondary);font-weight:500;">Bicara tentang</span>'
    +   '<span style="font-size:11px;font-weight:700;color:#5b21b6;">' + campaign.name + '</span>'
    + '</div>';

  // Show chat
  var empty = document.getElementById('chatEmpty');
  var msgs  = document.getElementById('chatMessages');
  if (empty) empty.style.display = 'none';
  if (msgs)  msgs.style.display  = 'flex';

  // ── FIX Race Condition: tunggu analytics selesai sebelum build session ──
  if (!campaign._engagement && typeof _loadAnalyticsForCard === 'function') {
    msgs.innerHTML = '';
    showSilarisLoadingState('Memuat data campaign...');
    try {
      await _loadAnalyticsForCard(campaign);
    } catch(e) {
      console.warn('[silaris] _loadAnalyticsForCard gagal saat openChat:', e);
    }
    hideSilarisLoadingState();
  }

  // ── SiLaris Session Management ──────────────────────────────────────────
  if (silarisSession.campaign_id !== id) {
    silarisSession = {
      campaign_id:    id,
      campaign_data:  _buildCampaignData(campaign),
      chat_history:   [],
      is_initialized: false
    };

    msgs.innerHTML = '';
    setTimeout(function() { generateAutoInsight(); }, 300);
  } else {
    // Campaign sama — tampilkan ulang history
    msgs.innerHTML = '';
    silarisSession.chat_history.forEach(function(m) {
      appendMsgDOM(m.role, m.text, null, false);
    });
    scrollChatToBottom();
  }
}

async function generateAutoInsight() {
  if (!activeCampaignId) return;
  if (silarisSession.campaign_id !== activeCampaignId) return;
  if (silarisSession.is_initialized) return;

  silarisSession.is_initialized = true;
  showTypingIndicator();

  var supabaseUrl = (typeof RADAR_CONFIG !== 'undefined' && RADAR_CONFIG.SUPABASE_URL)
    || 'https://mojzmlrdihenvfhrwopd.supabase.co';
  var supabaseKey = (typeof RADAR_CONFIG !== 'undefined' && RADAR_CONFIG.SUPABASE_ANON_KEY) || '';
  var edgeUrl = supabaseUrl + '/functions/v1/silaris-chat';

  try {
    var resp = await fetch(edgeUrl, {
      method: 'POST',
      headers: {
        'Content-Type':  'application/json',
        'Authorization': 'Bearer ' + supabaseKey
      },
      body: JSON.stringify({
        systemPrompt: buildSilarisSystemPrompt(),
        campaignData: silarisSession.campaign_data,
        autoInsight:  true,
        messages:     []
      })
    });
    var data = await resp.json();
    console.log('[silaris] generateAutoInsight response:', JSON.stringify(data));
    if (data.error) console.error('[silaris] ❌ Gemini error:', data.error);
    var aiText = data.reply;
    removeTypingIndicator();

    if (aiText) {
      silarisSession.chat_history.push({ role: 'ai', text: aiText });
      addAIMessageSilaris(activeCampaignId, aiText);
    } else {
      // Fallback jika Gemini tidak balik reply
      var noReply = 'Hei! Ada masalah teknis sedikit. Coba ketik pertanyaanmu tentang campaign ini ya!';
      silarisSession.chat_history.push({ role: 'ai', text: noReply });
      addAIMessageSilaris(activeCampaignId, noReply);
    }
  } catch(e) {
    removeTypingIndicator();
    var fallback = 'Gagal konek ke SiLaris. Pastikan koneksi internet kamu stabil, lalu coba lagi.';
    silarisSession.chat_history.push({ role: 'ai', text: fallback });
    addAIMessageSilaris(activeCampaignId, fallback);
    console.error('[silaris] generateAutoInsight fetch error:', e);
  }
}

function addAIMessageSilaris(campaignId, text) {
  if (activeCampaignId !== campaignId) return;
  appendMsgDOM('ai', text, null, false);
  scrollChatToBottom();
}

function addAIMessage(campaignId, text, chips) {
  if (activeCampaignId !== campaignId) return;
  appendMsgDOM('ai', text, chips, false);
  scrollChatToBottom();
}

function appendMsgDOM(role, text, chips, chipsUsed) {
  var msgs = document.getElementById('chatMessages');
  if (!msgs) return;
  var div = document.createElement('div');
  div.className = 'chat-msg ' + role;

  if (role === 'ai') {
    var chipsHTML = '';
    if (chips && chips.length) {
      chipsHTML = '<div class="chat-chips">';
      chips.forEach(function(chip) {
        chipsHTML += '<button class="chat-chip' + (chipsUsed ? ' used' : '') + '" onclick="useChatChip(this,\'' + chip.replace(/'/g, "\\'") + '\')">' + chip + '</button>';
      });
      chipsHTML += '</div>';
    }
    div.innerHTML =
      '<div class="chat-sender ai-label">SiLaris</div>'
      + '<div class="chat-bubble ai-bubble">' + text.replace(/\n/g, '<br>') + '</div>'
      + chipsHTML;
  } else {
    div.innerHTML =
      '<div class="chat-sender">Kamu</div>'
      + '<div class="chat-bubble user-bubble">' + text.replace(/\n/g, '<br>') + '</div>';
  }

  msgs.appendChild(div);
}

function useChatChip(btn, chipText) {
  if (!activeCampaignId) return;
  // Mark clicked chip as used
  btn.classList.add('used');
  // Delegate to sendChatMessage with chip text as override
  sendChatMessage(chipText);
}

function addUserMessage(text) {
  if (!activeCampaignId) return;
  // Simpan ke silarisSession history
  silarisSession.chat_history.push({ role: 'user', text: text });
  appendMsgDOM('user', text, null, false);
  scrollChatToBottom();
}

async function sendChatMessage(overrideText) {
  var input = document.getElementById('chatInput');
  var text;

  if (overrideText) {
    text = overrideText.trim();
    addUserMessage(text);
  } else {
    if (!input) return;
    text = input.value.trim();
    if (!text) return;
    input.value = '';
    input.style.height = '';
    addUserMessage(text);
  }

  showTypingIndicator();

  // ── Build history dari silarisSession (max SILARIS_MAX_HISTORY) ──
  var rawHistory = silarisSession.chat_history.slice(-(SILARIS_MAX_HISTORY));
  // Pesan terakhir (yang baru ditambah user) sudah masuk ke rawHistory via addUserMessage
  // Kirim semua history kecuali pesan user paling akhir (sudah jadi "user message" baru)
  // Gemini butuh format: messages = history sebelum pesan terbaru + pesan terbaru sebagai last item
  var history = rawHistory.map(function(m) {
    return { role: m.role === 'ai' ? 'assistant' : 'user', content: m.text };
  });

  var supabaseUrl = (typeof RADAR_CONFIG !== 'undefined' && RADAR_CONFIG.SUPABASE_URL)
    || 'https://mojzmlrdihenvfhrwopd.supabase.co';
  var supabaseKey = (typeof RADAR_CONFIG !== 'undefined' && RADAR_CONFIG.SUPABASE_ANON_KEY) || '';
  var edgeUrl = supabaseUrl + '/functions/v1/silaris-chat';

  try {
    var resp = await fetch(edgeUrl, {
      method: 'POST',
      headers: {
        'Content-Type':  'application/json',
        'Authorization': 'Bearer ' + supabaseKey
      },
      body: JSON.stringify({
        systemPrompt: buildSilarisSystemPrompt(),
        campaignData: silarisSession.campaign_data,
        messages:     history,
        autoInsight:  false
      })
    });
    var data = await resp.json();
    console.log('[silaris] sendChatMessage response:', JSON.stringify(data));
    if (data.error) console.error('[silaris] ❌ Gemini error:', data.error);
    var aiText = data.reply || 'Maaf, tidak bisa merespons saat ini.';
    removeTypingIndicator();

    // Simpan balasan AI ke session
    silarisSession.chat_history.push({ role: 'ai', text: aiText });
    // Jaga max history
    if (silarisSession.chat_history.length > SILARIS_MAX_HISTORY * 2) {
      silarisSession.chat_history = silarisSession.chat_history.slice(-(SILARIS_MAX_HISTORY * 2));
    }
    addAIMessage(activeCampaignId, aiText, null);
  } catch(e) {
    removeTypingIndicator();
    addAIMessage(activeCampaignId, 'Gagal terhubung ke SiLaris. Coba lagi ya!', null);
    console.error('[silaris-chat] error:', e);
  }
}

// ── defaultAIResponse removed — replaced by Claude API in sendChatMessage() ──

function showTypingIndicator() {
  var msgs = document.getElementById('chatMessages');
  if (!msgs) return;
  var div = document.createElement('div');
  div.className = 'chat-msg ai';
  div.id = 'ai-typing';
  div.innerHTML =
    '<div class="chat-sender ai-label">SiLaris</div>'
    + '<div class="chat-bubble ai-bubble" style="padding:12px 14px;">'
    + '<span class="scan-dot" style="display:inline-block;margin:0 2px;"></span>'
    + '<span class="scan-dot" style="display:inline-block;margin:0 2px;"></span>'
    + '<span class="scan-dot" style="display:inline-block;margin:0 2px;"></span>'
    + '</div>';
  msgs.appendChild(div);
  scrollChatToBottom();
}

function removeTypingIndicator() {
  var el = document.getElementById('ai-typing');
  if (el) el.remove();
}

function scrollChatToBottom() {
  var msgs = document.getElementById('chatMessages');
  if (msgs) setTimeout(function() { msgs.scrollTop = msgs.scrollHeight; }, 50);
}

function handleChatKey(e) {
  if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendChatMessage(); }
}

function autoResizeChat(el) {
  el.style.height = 'auto';
  el.style.height = Math.min(el.scrollHeight, 80) + 'px';
}

/* ─── Live Reach Counters ─── */
function startReachCounters() {
  CAMPAIGNS.forEach(function(c) {
    if (c.status !== 'running') return;
    if (campaignReachIntervals[c.id]) return;
    if (c._reachReal) return;
    return; // Animasi estimasi dimatikan — tampilkan — sampai data real tiba
    // Scale increment to ~0.4–0.8% of target per tick — realistic for any target size
    var baseInc = Math.max(5, Math.round(c.reachTarget * 0.005));
    campaignReachIntervals[c.id] = setInterval(function() {
      if (c.reach >= c.reachTarget) {
        clearInterval(campaignReachIntervals[c.id]);
        delete campaignReachIntervals[c.id];
        return;
      }
      var inc = Math.floor(Math.random() * baseInc) + Math.floor(baseInc * 0.4);
      c.reach = Math.min(c.reach + inc, c.reachTarget);
      var el = document.getElementById('reach-num-' + c.id);
      if (el) {
        el.textContent = formatReach(c.reach);
        el.style.color = '#111827';
        setTimeout(function() { el.style.color = ''; }, 400);
      }
      var pct = Math.min(100, Math.round((c.reach / c.reachTarget) * 100));
      var bar = document.getElementById('reach-bar-' + c.id);
      if (bar) bar.style.width = pct + '%';
    }, 3500 + Math.floor(Math.random() * 2000));
  });
}

function stopReachCounters() {
  Object.keys(campaignReachIntervals).forEach(function(id) {
    clearInterval(campaignReachIntervals[id]);
    delete campaignReachIntervals[id];
  });
}

/* ─── Notification Buttons (WA / Email) ─── */
function appendNotifButtons(campaignId, msgText) {
  var msgs = document.getElementById('chatMessages');
  if (!msgs) return;

  var campaign = null;
  for (var i = 0; i < CAMPAIGNS.length; i++) {
    if (CAMPAIGNS[i].id === campaignId) { campaign = CAMPAIGNS[i]; break; }
  }
  var campName  = campaign ? campaign.name : 'campaign';
  var plainText = msgText.replace(/<[^>]+>/g, '').replace(/\n/g, '\n');
  var waText    = encodeURIComponent('Panduan RADAR untuk campaign "' + campName + '":\n\n' + plainText);
  var emailSubj = encodeURIComponent('Panduan Manual Campaign: ' + campName);
  var emailBody = encodeURIComponent(plainText);

  var linksHTML =
    '<div class="notif-links">'
    + '<a href="https://wa.me/?text=' + waText + '" target="_blank" rel="noopener">'
    + '<svg viewBox="0 0 24 24" fill="currentColor" width="11" height="11"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884"/></svg>'
    + ' Kirim ke WhatsApp</a>'
    + '<a href="mailto:?subject=' + emailSubj + '&body=' + emailBody + '">'
    + '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="11" height="11"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M22 7l-10 7L2 7"/></svg>'
    + ' Kirim ke Email</a>'
    + '</div>';

  // Inject ke dalam ai-bubble terakhir agar jadi satu kesatuan
  var bubbles = msgs.querySelectorAll('.ai-bubble');
  var lastBubble = bubbles[bubbles.length - 1];
  if (lastBubble) {
    lastBubble.insertAdjacentHTML('beforeend', linksHTML);
  }
  scrollChatToBottom();
}

/* ─── AdsPlatformAdapter (extensible for future API integration) ─── */
var AdsPlatformAdapter = {
  /* Set platform key to true after OAuth connected */
  connections: { meta: false, tiktok: false, google: false },
  isConnected: function(platform) {
    return this.connections[platform] || false;
  },
  execute: function(platform, action, params) {
    if (this.isConnected(platform)) {
      /* TODO: replace with real API call per platform
       * Meta:   META_API.campaigns.update(params)
       * TikTok: TIKTOK_API.campaigns.update(params)
       * Google: GOOGLE_ADS_API.campaigns.update(params)
       */
      return null;
    }
    return ManualGuideGenerator.generate(action, params);
  }
};

var ManualGuideGenerator = {
  generate: function(action, params) {
    return 'Panduan manual untuk ' + action + ' telah disiapkan di chat.';
  }
};

/* ─── Window exports ─── */
window.switchMenu = switchMenu;

/* ═══════════════════════════════════════════════════════════════
   TIER 1 — Campaign Prefetch + localStorage Cache
   ─────────────────────────────────────────────────────────────
   Additive only. loadCampaignsFromSupabase() tidak diubah sama sekali.
   Fallback: kalau prefetch/cache gagal → existing flow jalan normal
   saat user klik Menu 2 (loadCampaignsFromSupabase on switchMenu).
   ═══════════════════════════════════════════════════════════════ */
var _CAMP_CACHE_KEY = 'radar_camp_cache_v1';
var _CAMP_CACHE_TTL = 5 * 60 * 1000; // 5 menit

function _saveCampCache(rows) {
  try {
    localStorage.setItem(_CAMP_CACHE_KEY, JSON.stringify({
      rows: rows,
      ts:   Date.now(),
      sid:  window.radarSessionId || ''
    }));
  } catch(e) {}
}

function _readCampCache() {
  try {
    var raw = localStorage.getItem(_CAMP_CACHE_KEY);
    if (!raw) return null;
    var obj = JSON.parse(raw);
    if (!obj || !Array.isArray(obj.rows) || !obj.rows.length) return null;
    if (Date.now() - obj.ts > _CAMP_CACHE_TTL) return null;
    // Invalidate kalau session berbeda (user ganti akun)
    if (obj.sid && window.radarSessionId && obj.sid !== window.radarSessionId) return null;
    return obj.rows;
  } catch(e) { return null; }
}

// Proses raw Supabase rows → campaign objects dan push ke CAMPAIGNS[].
// Logic identik dengan loadCampaignsFromSupabase — dedup via supabase_id dijaga.
// Return: jumlah campaign baru yang ditambahkan (0 = semua sudah ada).
function _processCampRows(rows) {
  var platMap = { ig:'ig', tiktok:'tiktok', meta:'meta', youtube:'youtube',
                  instagram:'ig', facebook:'meta' };
  var added = 0;
  rows.forEach(function(row) {
    var exists = CAMPAIGNS.some(function(c) { return c.supabase_id === row.id; });
    if (exists) return;
    var platforms = (row.platforms || []).map(function(p) { return platMap[p] || p; });
    if (!platforms.length) platforms = ['ig'];
    var platLabel = platforms.map(function(p) { return p.toUpperCase(); }).join(', ');
    var dateStr   = row.created_at
      ? new Date(row.created_at).toLocaleDateString('id-ID', { day:'numeric', month:'short', year:'numeric' })
      : '';
    CAMPAIGNS.unshift({
      id:               row.id,
      supabase_id:      row.id,
      post_id:          row.post_id            || null,
      post_url:         row.post_url           || null,
      platform_post_id: row.platform_post_id   || null,
      format:           row.format             || 'post',
      name:             row.nama_campaign      || 'Campaign',
      status:           row.status === 'active' ? 'running' : (row.status || 'running'),
      platforms:        platforms,
      reach:            row.estimated_reach_min || 0,
      reachTarget:      row.estimated_reach_max || 10000,
      budget:           row.budget_idr          || 0,
      budgetUsed:       0,
      sparkData:        [0,0,0,0,0,0],
      thumbColor:       '#791ADB',
      thumbUrl:         row.thumb_url || localStorage.getItem('radar_thumb_' + row.id) || null,
      launchTime:       dateStr,
      created_at:       row.created_at || null,
      aiOpening:
        'Campaign <strong>' + (row.nama_campaign || 'Campaign') + '</strong>\n\n' +
        'Lokasi: <strong>' + (row.kecamatan || '—') + '</strong> · Radius ' + (row.radius_km || 1) + ' km\n' +
        'Kategori: <strong>' + (row.kategori || '—') + '</strong>\n' +
        'Platform: <strong>' + platLabel + '</strong>\n' +
        'Estimasi reach: <strong>' + formatReach(row.estimated_reach_min || 0) +
        ' – ' + formatReach(row.estimated_reach_max || 0) + '</strong>\n' +
        (dateStr ? 'Diluncurkan: ' + dateStr + '\n' : '') +
        '\nAda yang ingin dianalisis dari campaign ini?',
      aiChips:          ['Lihat performa', 'Optimalkan targeting', 'Bagikan ke tim'],
      aiChipResponses:  {}
    });
    added++;
  });
  if (added > 0) window.CAMPAIGNS_LOADED = true;
  return added;
}

async function _prefetchCampaigns() {
  if (typeof getCampaigns !== 'function') return; // guard: supabase belum siap

  try {
    // ── Fast path: sajikan dari localStorage cache ─────────────────
    var cached = _readCampCache();
    if (cached) {
      var n = _processCampRows(cached);
      if (n > 0) {
        console.log('[prefetch] ' + n + ' campaign(s) dari cache (<5ms)');
        var monEl = document.getElementById('view-monitor');
        if (monEl && monEl.style.display !== 'none') renderCampaigns();
      }
    }

    // ── Background refresh: stale-while-revalidate ─────────────────
    var fresh = await getCampaigns();
    if (fresh && fresh.length) {
      _saveCampCache(fresh);
      var m = _processCampRows(fresh); // dedup: skip yang sudah ada
      if (m > 0) {
        console.log('[prefetch] ' + m + ' campaign(s) baru dari Supabase');
        var monEl2 = document.getElementById('view-monitor');
        if (monEl2 && monEl2.style.display !== 'none') renderCampaigns();
      }
    }

  } catch(e) {
    // Silent fail — fallback ke loadCampaignsFromSupabase() saat user klik Monitor
    console.warn('[prefetch] gagal, fallback ke flow normal:', e.message);
  }
}
window._prefetchCampaigns = _prefetchCampaigns;

/* ═══════════════════════════════════════════════════════════════
   TIER 2 — Persistent Feed Cache (PostForMe → localStorage)
   ─────────────────────────────────────────────────────────────
   Additive only. _loadAnalyticsForCard() tidak diubah sama sekali.
   Strategy: pre-populate _analyticsCache dari localStorage sebelum
   _loadAnalyticsForCard dipanggil → dia menemukan cache terisi,
   skip PostForMe call. Snapshot balik ke localStorage tiap 2 menit.
   Fallback: kalau cache expired/kosong → existing PostForMe fetch jalan normal.
   ═══════════════════════════════════════════════════════════════ */
var _FEED_CACHE_PREFIX = 'radar_feed_v1_';
var _FEED_CACHE_TTL    = 15 * 60 * 1000; // 15 menit

function _saveFeedToStorage(accId, posts) {
  try {
    localStorage.setItem(_FEED_CACHE_PREFIX + accId, JSON.stringify({
      posts: posts,
      ts:    Date.now()
    }));
  } catch(e) {}
}

function _loadFeedFromStorage(accId) {
  try {
    var raw = localStorage.getItem(_FEED_CACHE_PREFIX + accId);
    if (!raw) return null;
    var obj = JSON.parse(raw);
    if (!obj || !Array.isArray(obj.posts) || !obj.posts.length) return null;
    if (Date.now() - obj.ts > _FEED_CACHE_TTL) return null;
    return obj.posts;
  } catch(e) { return null; }
}

// Pre-populate _analyticsCache (in-memory) dari localStorage.
// _loadAnalyticsForCard() cek _analyticsCache sebelum hit PostForMe —
// kalau sudah terisi dan belum expired, dia skip fetch. Ini memanfaatkan
// mekanisme yang sudah ada tanpa menyentuh kodenya.
function _preloadFeedCaches() {
  var accounts = typeof _getStoredAccounts === 'function' ? _getStoredAccounts() : [];
  var loaded = 0;
  accounts.forEach(function(acc) {
    if (!acc || !acc.id) return;
    var posts = _loadFeedFromStorage(acc.id);
    if (!posts) return;
    // Pre-populate in-memory cache ─ _loadAnalyticsForCard akan menemukan ini
    _analyticsCache[acc.id]     = posts;
    // Set timestamp ke "sekarang - 1 detik" agar dianggap fresh (dalam ANALYTICS_CACHE_TTL 2 menit)
    // _loadAnalyticsForCard akan skip fetch PostForMe untuk sesi ini
    _analyticsCacheTime[acc.id] = Date.now() - 1000;
    loaded++;
  });
  if (loaded > 0) console.log('[tier2] pre-loaded ' + loaded + ' feed cache(s) dari localStorage');
}

// Snapshot _analyticsCache yang sudah terisi ke localStorage.
// Dipanggil tiap 2 menit — saat _loadAnalyticsForCard baru saja fetch dari PostForMe,
// hasilnya tersimpan ke _analyticsCache, lalu snapshot ini menulisnya ke localStorage.
function _snapshotFeedCaches() {
  var saved = 0;
  Object.keys(_analyticsCache).forEach(function(accId) {
    var posts = _analyticsCache[accId];
    if (Array.isArray(posts) && posts.length > 0) {
      _saveFeedToStorage(accId, posts);
      saved++;
    }
  });
  if (saved > 0) console.log('[tier2] snapshot ' + saved + ' feed cache(s) ke localStorage');
}

// Snapshot tiap 2 menit (setelah _loadAnalyticsForCard punya waktu untuk fetch)
setInterval(_snapshotFeedCaches, 2 * 60 * 1000);
window._preloadFeedCaches  = _preloadFeedCaches;
window._snapshotFeedCaches = _snapshotFeedCaches;

/* ═══════════════════════════════════════════════════════════════
   TIER 3 — Supabase Realtime Campaign Sync
   ─────────────────────────────────────────────────────────────
   Additive only. waitForCampaigns() polling di analytics.js tidak diubah.
   Strategy: subscribe ke perubahan tabel campaigns — kalau ada campaign
   baru/update, CAMPAIGNS_LOADED langsung di-set dan loadCampaignsFromSupabase
   dipanggil (dedup logic sudah ada di sana).
   Fallback: kalau Realtime disconnect/error → waitForCampaigns() polling
   500ms tetap jalan seperti biasa — tidak ada yang break.
   ═══════════════════════════════════════════════════════════════ */
function _startRealtimeCampaignSync() {
  try {
    var client = typeof getSupabaseClient === 'function' ? getSupabaseClient() : null;
    if (!client || typeof client.channel !== 'function') {
      console.warn('[tier3] Supabase client belum siap, fallback ke polling');
      return;
    }

    // Unsubscribe channel lama sebelum buat baru — cegah subscription numpuk
    if (window._realtimeCampaignChannel) {
      try { window._realtimeCampaignChannel.unsubscribe(); } catch(_) {}
      window._realtimeCampaignChannel = null;
    }

    var channel = client
      .channel('radar-campaigns-' + (window.radarSessionId || 'anon'))
      .on('postgres_changes', {
        event:  '*',
        schema: 'public',
        table:  'campaigns'
      }, function(payload) {
        console.log('[tier3] Realtime campaign change:', payload.eventType);
        // Trigger fresh load — dedup di loadCampaignsFromSupabase mencegah duplikat
        if (typeof loadCampaignsFromSupabase === 'function') {
          loadCampaignsFromSupabase();
        }
        // Update cache setelah data berubah
        if (typeof getCampaigns === 'function') {
          getCampaigns().then(function(rows) {
            if (rows && rows.length) _saveCampCache(rows);
          }).catch(function() {});
        }
      })
      .subscribe(function(status) {
        if (status === 'SUBSCRIBED') {
          console.log('[tier3] Realtime campaigns subscribed');
        } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          console.warn('[tier3] Realtime ' + status + ' — polling fallback aktif');
          // Tidak perlu aksi — waitForCampaigns() polling tetap jalan sebagai fallback
        }
      });

    window._realtimeCampaignChannel = channel;

    // Auto-reconnect jika visibility berubah (tab kembali aktif)
    document.addEventListener('visibilitychange', function() {
      if (document.visibilityState === 'visible' && window._realtimeCampaignChannel) {
        var state = window._realtimeCampaignChannel.state;
        if (state === 'closed' || state === 'errored') {
          console.log('[tier3] Tab aktif kembali, reconnect Realtime...');
          _startRealtimeCampaignSync();
        }
      }
    });

  } catch(e) {
    console.warn('[tier3] _startRealtimeCampaignSync error, fallback ke polling:', e.message);
    // Silent fail — polling tetap jalan
  }
}
window._startRealtimeCampaignSync = _startRealtimeCampaignSync;

function _onThumbError(img, isVideo, thumbColor) {
  var container = img.parentNode;
  if (!container) return;
  if (isVideo) {
    container.style.background = thumbColor || '#1a1a2e';
    container.style.display = 'flex';
    container.style.flexDirection = 'column';
    container.style.alignItems = 'center';
    container.style.justifyContent = 'center';
    container.style.gap = '8px';
    container.innerHTML =
      '<span style="font-size:36px;line-height:1;">&#9654;</span>' +
      '<span style="color:white;font-size:12px;font-weight:600;letter-spacing:0.05em;">VIDEO</span>';
  } else {
    container.style.display = 'flex';
    container.style.alignItems = 'center';
    container.style.justifyContent = 'center';
    container.innerHTML = '<span style="color:#9ca3af;font-size:12px;text-align:center;">Foto tidak tersedia</span>';
  }
}
window._onThumbError = _onThumbError;
