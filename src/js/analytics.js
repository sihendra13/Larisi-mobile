// RADAR — analytics.js v3
// Analytics Dashboard — SiLaris Analytics Hub
// Full dashboard: narasi, stat cards, campaign terbaik, mood, local pulse, platform, rekomendasi, competitor, upgrade

/* ─── Format Helpers ─── */
function _anFmtK(n) {
  if (n == null || isNaN(n) || n === 0) return '—';
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
  if (n >= 1000)    return Math.round(n / 1000) + 'K';
  return String(Math.round(n));
}
function _anFmtPct(v) {
  if (v == null || isNaN(v)) return '—';
  return parseFloat(v).toFixed(1) + '%';
}

/* ─── ER Qualitative Label ─── */
function _anErLabel(er) {
  if (er == null || isNaN(er)) return { label: 'Belum ada data', sub: 'Belum ada data ER' };
  if (er > 100) return { label: 'Luar biasa 🔥',  sub: 'Konten kamu sangat disukai' };
  if (er >= 10) return { label: 'Sangat bagus ⭐', sub: 'Konten kamu bekerja dengan baik' };
  if (er >= 3)  return { label: 'Bagus 👍',        sub: 'Konten kamu mulai dapat perhatian' };
  return              { label: 'Berkembang 🌱',    sub: 'Masih ada ruang untuk tumbuh' };
}

/* ─── Delta vs Last Month ─── */
function _anDelta(current, previous) {
  if (current === 0 && previous === 0) return null;
  if (previous === 0) return { text: 'Bulan pertama, terus semangat!', cls: 'neutral' };
  var pct = Math.round(((current - previous) / previous) * 100);
  if (pct > 0)  return { text: '↑ ' + pct + '% vs bulan lalu', cls: 'up' };
  if (pct < 0)  return { text: '↓ ' + Math.abs(pct) + '% vs bulan lalu', cls: 'down' };
  return              { text: '→ Sama seperti bulan lalu', cls: 'neutral' };
}

/* ─── Platform Config ─── */
var _AN_PLAT = {
  ig:      { name: 'Instagram', color: '#E1306C' },
  meta:    { name: 'Facebook',  color: '#1877F2' },
  tiktok:  { name: 'TikTok',    color: '#010101' },
  youtube: { name: 'YouTube',   color: '#FF0000' }
};

/* ─── Platform SVGs ─── */
function _anPlatSvg(key) {
  var svgs = {
    ig:     '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>',
    meta:   '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>',
    tiktok: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.79 1.54V6.78a4.85 4.85 0 01-1.02-.09z"/></svg>',
    youtube:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M23.5 6.19a3 3 0 00-2.12-2.13C19.54 3.5 12 3.5 12 3.5s-7.54 0-9.38.56A3 3 0 00.5 6.19C0 8.03 0 12 0 12s0 3.97.5 5.81a3 3 0 002.12 2.12C4.46 20.5 12 20.5 12 20.5s7.54 0 9.38-.57a3 3 0 002.12-2.12C24 15.97 24 12 24 12s0-3.97-.5-5.81zM9.75 15.02V8.98L15.5 12l-5.75 3.02z"/></svg>'
  };
  return svgs[key] || '';
}

/* ─── Skeleton Span ─── */
function _anSk(w, h) {
  return '<span class="an-sk" style="width:' + w + ';height:' + h + 'px;display:inline-block;"></span>';
}
function _anSkBlock(w, h) {
  return '<div class="an-sk" style="width:' + w + ';height:' + h + 'px;"></div>';
}

/* ─── Stitch Similarity (Jaccard word-based) ─── */
// Returns 0–1. 1 = identical, 0 = no overlap.
function _stitchSimilarity(a, b) {
  var wa = a.toLowerCase().replace(/[^\w\s]/g, '').split(/\s+/).filter(Boolean);
  var wb = b.toLowerCase().replace(/[^\w\s]/g, '').split(/\s+/).filter(Boolean);
  if (!wa.length || !wb.length) return 0;
  var inter = 0;
  wa.forEach(function(w) { if (wb.indexOf(w) !== -1) inter++; });
  var union = wa.length + wb.length - inter;
  return union > 0 ? inter / union : 0;
}

/* ─── Aggregate Campaign Data ─── */
function _anAggregate(campaigns) {
  var real = (campaigns || []).filter(function(c) { return !c.isDemo; });
  var totalReach = 0, totalPaidReach = 0, activeCount = 0, reachCount = 0;
  var erValues = [], bestCamp = null, bestER = -1;
  var platStats = {};
  var rLove = 0, rLike = 0, rHaha = 0, rWow = 0;
  var hourBuckets   = new Array(24).fill(0);  // count-based (untuk fallback Kondisi B)
  var hourBucketER  = new Array(24).fill(0);  // ER-weighted (untuk Kondisi A)
  var dayBuckets    = new Array(7).fill(0);
  var stitchCandidates = [];
  var formatCount = {};

  // bestCamp: iklan dengan absolute engagements (likes+comments+shares) tertinggi
  // Tanpa threshold reach — absEng sudah cukup sebagai filter natural
  var _bestAbsEng = 0;

  // Month-over-month breakdown
  var _now = new Date();
  var _thisMonthStart = new Date(_now.getFullYear(), _now.getMonth(), 1).getTime();
  var _lastMonthStart = new Date(_now.getFullYear(), _now.getMonth() - 1, 1).getTime();
  var reachThisMonth = 0, reachLastMonth = 0;
  var countThisMonth = 0, countLastMonth = 0;

  real.forEach(function(c) {
    if (c.status === 'running') activeCount++;

    var eng = c._engagement || {};
    var reach = (eng.reach != null && !isNaN(eng.reach)) ? Number(eng.reach) : 0;
    totalReach += reach;
    if (reach > 0) reachCount++;
    totalPaidReach += (eng.paidReach || 0);

    var er = 0;
    if (reach > 0) {
      er = ((eng.likes || 0) + (eng.comments || 0) + (eng.shares || 0)) / reach * 100;
      if (er > 0) erValues.push(er);
    }

    // bestCamp: iklan dengan absolute engagements tertinggi (tanpa syarat reach minimum)
    var absEng = (eng.likes || 0) + (eng.comments || 0) + (eng.shares || 0);
    if (absEng > _bestAbsEng) {
      _bestAbsEng = absEng;
      bestCamp    = c;
      bestER      = er;
    }

    rLove += (eng.reactionsLove || 0);
    rHaha += (eng.reactionsHaha || 0);
    rWow  += (eng.reactionsWow  || 0);
    var totalLikes = eng.likes || 0;
    rLike += Math.max(0, totalLikes - (eng.reactionsLove || 0) - (eng.reactionsHaha || 0) - (eng.reactionsWow || 0));

    (c.platforms || []).forEach(function(p) {
      if (!platStats[p]) platStats[p] = { count: 0, erTotal: 0, erCount: 0 };
      platStats[p].count++;
      if (er > 0) { platStats[p].erTotal += er; platStats[p].erCount++; }
    });

    var fmt = eng.format || c.format || 'post';
    formatCount[fmt] = (formatCount[fmt] || 0) + 1;

    var ts = c.created_at ? new Date(c.created_at) : null;
    if (ts) {
      var h = ts.getHours();
      hourBuckets[h]++;
      if (er > 0) hourBucketER[h] += er;  // akumulasi ER per jam
      dayBuckets[ts.getDay()]++;
      var tsMs = ts.getTime();
      if (tsMs >= _thisMonthStart) {
        reachThisMonth += reach;
        countThisMonth++;
      } else if (tsMs >= _lastMonthStart) {
        reachLastMonth += reach;
        countLastMonth++;
      }
    }

    var caption = eng.caption || c.caption || '';
    if (caption && er > 0) {
      stitchCandidates.push({ text: caption, er: er, campaign: c });
    }
  });

  var avgER = erValues.length
    ? erValues.reduce(function(s, v) { return s + v; }, 0) / erValues.length
    : null;

  var maxHourCount  = Math.max.apply(null, hourBuckets);
  var bestHour      = maxHourCount > 0 ? hourBuckets.indexOf(maxHourCount) : 19;
  var maxHourER     = Math.max.apply(null, hourBucketER);
  var bestHourER    = maxHourER > 0 ? hourBucketER.indexOf(maxHourER) : bestHour;
  var dayNames  = ['Minggu','Senin','Selasa','Rabu','Kamis','Jumat','Sabtu'];
  var maxDayCount  = Math.max.apply(null, dayBuckets);
  var bestDayIdx   = maxDayCount > 0 ? dayBuckets.indexOf(maxDayCount) : 2;
  var distinctDays = dayBuckets.filter(function(v) { return v > 0; }).length;

  // Stitch: sort ER desc → filter threshold → dedup similar captions → top 3
  var STITCH_MIN_ER  = 50;   // Rule 2: hanya caption dengan ER >= 50%
  var STITCH_SIM_THR = 0.8;  // Rule 1: anggap duplikat jika similarity >= 80%
  stitchCandidates.sort(function(a, b) { return b.er - a.er; });
  var stitchFiltered = stitchCandidates.filter(function(s) { return s.er >= STITCH_MIN_ER; });
  var stitchDeduped  = [];
  stitchFiltered.forEach(function(s) {
    var isDup = stitchDeduped.some(function(d) {
      return _stitchSimilarity(s.text, d.text) >= STITCH_SIM_THR;
    });
    if (!isDup) stitchDeduped.push(s);
  });

  var platList = Object.keys(platStats).map(function(p) {
    var s = platStats[p];
    return { key: p, count: s.count, avgER: s.erCount > 0 ? s.erTotal / s.erCount : 0 };
  }).sort(function(a, b) { return b.avgER - a.avgER || b.count - a.count; });

  var topFmt = Object.keys(formatCount).sort(function(a, b) { return formatCount[b] - formatCount[a]; })[0] || 'post';
  var fmtLabels = { reel: 'Video Reel', post: 'Foto dengan teks', story: 'Story 9:16' };

  var totalReact = rLove + rLike + rHaha + rWow;
  var moodData = [
    { emoji: '❤️', label: 'Love',  count: rLove, color: '#ef4444' },
    { emoji: '👍', label: 'Like',  count: Math.max(0, rLike), color: '#3b82f6' },
    { emoji: '😂', label: 'Haha',  count: rHaha, color: '#f59e0b' },
    { emoji: '😮', label: 'Wow',   count: rWow,  color: '#8b5cf6' }
  ];

  return {
    total: real.length,
    active: activeCount,
    totalReach: totalReach,
    totalPaidReach: totalPaidReach,
    reachCount: reachCount,    // jumlah iklan yang punya data reach > 0
    avgER: avgER,
    bestCamp: bestCamp,
    bestER: bestER,
    platList: platList,
    moodData: moodData,
    totalReact: totalReact,
    hasMoodData: totalReact > 0,
    bestHour:   bestHour,    // count-based — dipakai Kondisi B
    bestHourER: bestHourER,  // ER-weighted — dipakai Kondisi A
    bestDay: dayNames[bestDayIdx],
    distinctDays: distinctDays,
    topFormat: fmtLabels[topFmt] || topFmt,
    stitchCandidates: stitchDeduped.slice(0, 3),
    // Month-over-month
    reachThisMonth:  reachThisMonth,
    reachLastMonth:  reachLastMonth,
    countThisMonth:  countThisMonth,
    countLastMonth:  countLastMonth,
    hasPrevPeriod:   reachLastMonth > 0,
    reachTrend:      reachLastMonth > 0
      ? Math.round(((reachThisMonth - reachLastMonth) / reachLastMonth) * 100)
      : null
  };
}

/* ─── Analytics Cache & Auth Helpers ─── */

// Relative time: "baru saja", "5 menit lalu", "2 jam lalu"
function _anRelTime(isoStr) {
  if (!isoStr) return '';
  var diff = Math.floor((Date.now() - new Date(isoStr).getTime()) / 1000);
  if (diff < 60)    return 'baru saja';
  if (diff < 3600)  return Math.floor(diff / 60) + ' menit lalu';
  if (diff < 86400) return Math.floor(diff / 3600) + ' jam lalu';
  return Math.floor(diff / 86400) + ' hari lalu';
}

// Get or create Supabase anon user — returns user_id or null
async function _anEnsureAnonUser() {
  var sb = getSupabaseClient();
  if (!sb) return null;
  try {
    var sessionRes = await sb.auth.getSession();
    if (sessionRes.data && sessionRes.data.session) return sessionRes.data.session.user.id;
    var signInRes = await sb.auth.signInAnonymously();
    return (signInRes.data && signInRes.data.user) ? signInRes.data.user.id : null;
  } catch(e) {
    console.warn('[analytics] anon auth error:', e);
    return null;
  }
}

// Read from analytics_cache — returns row or null (null = miss or expired)
async function _anGetCache(userId, cacheType) {
  var sb = getSupabaseClient();
  if (!sb || !userId) return null;
  try {
    var res = await sb
      .from('analytics_cache')
      .select('*')
      .eq('user_id', userId)
      .eq('cache_type', cacheType)
      .gt('expires_at', new Date().toISOString())
      .maybeSingle();
    return res.data || null;
  } catch(e) {
    console.warn('[analytics] cache get error:', e);
    return null;
  }
}

// Write to analytics_cache — upsert on (user_id, cache_type)
async function _anSetCache(userId, cacheType, payload, aggSnapshot, ttlMinutes) {
  var sb = getSupabaseClient();
  if (!sb || !userId) return;
  try {
    var expiresAt = new Date(Date.now() + ttlMinutes * 60 * 1000).toISOString();
    await sb.from('analytics_cache').upsert(
      { user_id: userId, cache_type: cacheType, payload: payload, agg_snapshot: aggSnapshot, expires_at: expiresAt },
      { onConflict: 'user_id,cache_type' }
    );
  } catch(e) {
    console.warn('[analytics] cache set error:', e);
  }
}

// Invalidate a specific cache type for the current user
async function _anInvalidateCache(userId, cacheType) {
  var sb = getSupabaseClient();
  if (!sb || !userId) return;
  try {
    await sb.from('analytics_cache').delete().eq('user_id', userId).eq('cache_type', cacheType);
  } catch(e) {
    console.warn('[analytics] cache invalidate error:', e);
  }
}

// Returns true if agg has changed >20% (reach OR ER) vs snapshot
// Guard: absolute change must also be significant (>500 reach or >5pp ER)
function _anNeedsRegenerate(agg, snapshot) {
  if (!snapshot) return true;
  var reachDiff = Math.abs(agg.totalReach - (snapshot.totalReach || 0)) / (snapshot.totalReach || 1);
  var erDiff    = Math.abs((agg.avgER || 0) - (snapshot.avgER || 0)) / (snapshot.avgER || 1);
  var reachBig  = Math.abs(agg.totalReach - (snapshot.totalReach || 0)) > 500;
  var erBig     = Math.abs((agg.avgER || 0) - (snapshot.avgER || 0)) > 5;
  return (reachDiff > 0.2 && reachBig) || (erDiff > 0.2 && erBig);
}

// Manual refresh — invalidate narasi cache then re-init
async function refreshAnalyticsData() {
  var btn = document.getElementById('an-refresh-btn');
  if (btn) { btn.style.opacity = '0.5'; btn.style.pointerEvents = 'none'; }
  var userId = await _anEnsureAnonUser();
  if (userId) await _anInvalidateCache(userId, 'narasi');
  localStorage.setItem('radar_last_analytics_refresh', String(Date.now()));
  initAnalytics();
}

// Auto-refresh: cek apakah sudah >24 jam sejak refresh terakhir
// Dipanggil saat analytics dibuka — tidak pakai setInterval
function _anCheckAutoRefresh() {
  var TWENTY_FOUR_H = 24 * 60 * 60 * 1000;
  var last = parseInt(localStorage.getItem('radar_last_analytics_refresh') || '0', 10);
  if (!last || (Date.now() - last) > TWENTY_FOUR_H) {
    refreshAnalyticsData();
    return true; // sedang auto-refresh
  }
  return false;
}

/* ─── Build Analytics System Prompt ─── */
function _buildAnalyticsSystemPrompt(agg) {
  var ctx         = (typeof buildSilarisContext === 'function') ? buildSilarisContext() : {};
  var bizName     = ctx.businessName     || 'Kamu';
  var bizCategory = ctx.businessCategory || null;

  var iklanCount  = agg.countThisMonth > 0 ? agg.countThisMonth : agg.total;
  var erVal       = agg.avgER != null ? agg.avgER : null;
  var erTier      = erVal == null ? 'unknown' : erVal >= 10 ? 'high' : erVal >= 3 ? 'mid' : 'low';
  var erDisplay   = erVal != null ? erVal.toFixed(1) + '%' : 'belum tersedia';

  var topPlatKey  = agg.platList.length ? agg.platList[0].key : 'ig';
  var topPlatName = (_AN_PLAT[topPlatKey] || {}).name || 'Instagram';
  var _bm         = { ig: '0.48%', meta: '0.15%', tiktok: '3.70%' };
  var benchmark   = _bm[topPlatKey] || '0.48%';

  var trendLine   = agg.hasPrevPeriod
    ? 'Reach ' + (agg.reachTrend >= 0 ? '\u2191' : '\u2193') + ' ' + Math.abs(agg.reachTrend) + '% dari bulan lalu.'
    : '\ud83d\udcca Tren mulai terhitung periode depan.';

  var bestIklan   = agg.bestCamp
    ? (agg.bestCamp.name || agg.bestCamp.nama_campaign || 'iklan terbaik')
    : null;

  var reachDisplay = agg.totalReach > 0 ? _anFmtK(agg.totalReach) : '0';
  var bestHourStr  = String(agg.bestHour).padStart(2, '0');

  var platSummary = agg.platList.map(function(p) {
    var pn = (_AN_PLAT[p.key] || {}).name || p.key;
    return pn + ': ' + p.count + ' iklan' + (p.avgER > 0 ? ', avg ER ' + p.avgER.toFixed(1) + '%' : '');
  }).join('; ') || 'belum ada';

  var p2Instruction = erTier === 'high' || erTier === 'mid'
    ? 'Jelaskan KENAPA ER setinggi ini: konten relevan, orang yang lihat langsung bereaksi, bukan scroll lewat.' +
      (bestIklan ? ' Sebutkan iklan "' + bestIklan + '" sebagai contoh konkret, engagement rate-nya jadi bukti nyata.' : ' Tanda sudah bicara ke audiens yang tepat dengan pesan yang tepat.')
    : erTier === 'low'
    ? 'Jelaskan: ER masih bisa ditingkatkan dengan konten lebih relevan ke audiens lokal, coba variasi format atau sapaan lokal khas daerah.'
    : 'Jelaskan: belum cukup data untuk menilai ER karena reach masih sangat sedikit. Ajak tambah lebih banyak iklan.';

  var clueTodoInstruction = bestIklan
    ? 'Tulis langsung ke user: Boost "' + bestIklan + '" dengan Rp 20-50rb selama 3 hari, iklan dengan engagement tertinggi kamu, paling efisien diperkuat minggu ini.'
    : 'Berikan 1 aksi konkret berdasarkan platform ' + topPlatName + ' dengan ER tertinggi.';

  return [
    'Kamu adalah SiLaris, AI Coach untuk UMKM Indonesia.',
    'MODE: ANALYTICS DASHBOARD narasi. Tulis seperti teman yang jujur, optimistik, dan langsung ke poin.',
    'ATURAN KERAS: DILARANG gunakan kata "campaign". Gunakan "iklan".',
    'ATURAN KERAS: DILARANG gunakan tanda em-dash (—). Ganti dengan koma.',
    'ATURAN KERAS: DILARANG gunakan bullet point, header, atau angka daftar.',
    'ATURAN KERAS: DILARANG menyebut kata "bisnis lokal".',
    'ATURAN KERAS: DILARANG hardcode angka yang tidak ada di DATA NYATA USER di bawah.',
    'ATURAN KERAS: JANGAN push paid/boost secara agresif. Framing sebagai pilihan, bukan keharusan.',
    'ATURAN KERAS: JANGAN generate insight yang tidak bisa dibuktikan dari data di bawah.',
    '',
    'DATA NYATA USER:',
    '- Nama bisnis: ' + bizName,
    '- Kategori: ' + (bizCategory || 'Umum'),
    '- Total iklan: ' + agg.total,
    '- Iklan bulan ini: ' + iklanCount,
    '- Total reach REAL (N/A tidak dihitung): ' + reachDisplay,
    '- Avg ER (formula: reactions+comments+shares / reach × 100): ' + erDisplay + ' (tier: ' + erTier + ')',
    '- Benchmark avg ER ' + topPlatName + ': ' + benchmark + ' (Socialinsider 2025)',
    '- Paid reach: ' + (agg.totalPaidReach > 0 ? _anFmtK(agg.totalPaidReach) : '0'),
    '- Iklan terbaik: ' + (bestIklan ? '"' + bestIklan + '"' : 'belum ada'),
    '- Platform aktif: ' + platSummary,
    '- Tren: ' + trendLine,
    '- Periode pertama: ' + (agg.hasPrevPeriod ? 'tidak' : 'ya, belum ada data pembanding'),
    bizCategory ? '- PENTING: Saran dan hashtag WAJIB relevan dengan industri "' + bizCategory + '".' : '',
    '',
    'BENCHMARK INTERNAL (gunakan sebagai konteks dalam narasi, jangan tampilkan sebagai widget tersendiri):',
    '- Instagram avg ER global: 0.48% (Socialinsider, 35 juta post, 2025)',
    '- TikTok avg ER global: 3.70% (Socialinsider 2025)',
    '- Facebook avg ER global: 0.15% (Socialinsider 2025)',
    '- Instagram organic reach: 3-4% dari followers per post (Sprout Social 2025)',
    '',
    'STRUKTUR NARASI YANG HARUS DIIKUTI PERSIS:',
    '',
    'narasi_p1 (maks 2 kalimat):',
    '  Buka PERSIS dengan: "' + bizName + ', kamu di jalur yang tepat! 🎯"',
    '  Kalimat 2: sebutkan ' + iklanCount + ' iklan, ' + reachDisplay + ' orang reach organik,' +
      (erVal != null
        ? ' ER ' + erDisplay + ' jauh di atas rata-rata ' + topPlatName + ' ' + benchmark + '.'
        : ' ER belum bisa dihitung karena data reach masih terlalu sedikit.'),
    '',
    'narasi_p2 (maks 2 kalimat):',
    '  ' + p2Instruction,
    '',
    'narasi_p3 (maks 2 kalimat, konteks jujur + empati):',
    '  Normalize angka kecil: reach organik ' + topPlatName + ' memang terbatas, rata-rata hanya 3-4% dari followers per post.',
    '  ' + reachDisplay + ' reach di bulan pertama itu normal dan sehat. Fondasi sudah kuat.',
    '  WAJIB akhiri narasi_p3 dengan kalimat: "' + trendLine + '"',
    '',
    'clue_potensi (box kiri "Artinya untuk bisnismu", 1 kalimat):',
    '  Kualitas konten sudah terbukti. Tantangan berikutnya bukan buat konten lebih bagus, tapi lebih banyak orang yang melihatnya.',
    '',
    'clue_todo (box kanan "Yang bisa dilakukan sekarang", 1 kalimat):',
    '  ' + clueTodoInstruction,
    '',
    'narasi_footer (teks kecil di bawah kotak, 1 kalimat):',
    '  "Data akan semakin akurat setelah lebih banyak iklan berjalan."',
    '',
    'TUGAS: Buat response JSON persis berikut (tanpa markdown, tanpa teks di luar JSON):',
    '{',
    '  "narasi_p1": "' + bizName + ', kamu di jalur yang tepat + data real. Maks 2 kalimat.",',
    '  "narasi_p2": "penjelasan kenapa performa seperti ini. Maks 2 kalimat.",',
    '  "narasi_p3": "konteks jujur + empati + tutup dengan tren. Maks 2 kalimat.",',
    '  "clue_potensi": "kualitas sudah terbukti, tantangan berikutnya distribusi. 1 kalimat.",',
    '  "clue_todo": "' + (bestIklan ? 'aksi spesifik sebut \\"' + bestIklan + '\\"' : 'aksi berbasis platform') + '. 1 kalimat.",',
    '  "narasi_footer": "Data akan semakin akurat setelah lebih banyak iklan berjalan.",',
    '  "mood_insight": "1 kalimat dari pola reaksi audiens.",',
    '  "platform_insight": "1 kalimat, sebut nama platform.",',
    '  "stitch_insight": "1 kalimat pola caption terkuat.",',
    '  "rekomendasi": [',
    '    {"platform": "' + topPlatKey + '", "hari": "' + agg.bestDay + '", "jam": "' + bestHourStr + ':00", "aksi": "aksi spesifik ' + topPlatName + '", "alasan": "alasan dari data real"},',
    '    {"platform": "meta", "hari": "Rabu", "jam": "12:00", "aksi": "aksi spesifik Facebook", "alasan": "alasan konkret"},',
    '    {"platform": "tiktok", "hari": "Jumat", "jam": "20:00", "aksi": "aksi spesifik TikTok", "alasan": "alasan konkret"}',
    '  ],',
    '  "rekom_cta": "Buat Iklan Baru Sekarang"',
    '}'
  ].join('\n');
}
/* ─── Call SiLaris for Analytics ─── */
async function _callSilarisAnalytics(agg) {
  var supabaseUrl = (typeof RADAR_CONFIG !== 'undefined' && RADAR_CONFIG.SUPABASE_URL) || '';
  var supabaseKey = (typeof RADAR_CONFIG !== 'undefined' && RADAR_CONFIG.SUPABASE_ANON_KEY) || '';
  if (!supabaseUrl) return null;

  try {
    var resp = await fetch(supabaseUrl + '/functions/v1/silaris-chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + supabaseKey },
      body: JSON.stringify({
        systemPrompt: _buildAnalyticsSystemPrompt(agg),
        campaignData: { aggregate: true, total: agg.total, avgER: agg.avgER, active: agg.active },
        autoInsight: true,
        messages: []
      })
    });
    var data = await resp.json();
    if (data && data.reply) {
      var text = data.reply.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      var start = text.indexOf('{'), end = text.lastIndexOf('}');
      if (start !== -1 && end !== -1) text = text.slice(start, end + 1);
      return JSON.parse(text);
    }
  } catch(e) {
    console.warn('[analytics] _callSilarisAnalytics error:', e);
  }
  return null;
}

/* ─── Analytics Fallback ─── */
function _buildAnalyticsFallback(agg) {
  var ctx         = (typeof buildSilarisContext === 'function') ? buildSilarisContext() : {};
  var bizName     = ctx.businessName || 'Kamu';
  var erTier      = agg.avgER == null ? 'unknown' : agg.avgER >= 10 ? 'high' : agg.avgER >= 3 ? 'mid' : 'low';
  var erDisplay   = agg.avgER != null ? agg.avgER.toFixed(1) + '%' : null;
  var iklanCount  = agg.countThisMonth > 0 ? agg.countThisMonth : agg.total;
  var topPlatKey  = agg.platList.length ? agg.platList[0].key : 'ig';
  var topPlatName = (_AN_PLAT[topPlatKey] || {}).name || 'Instagram';
  var _bm         = { ig: '0.48%', meta: '0.15%', tiktok: '3.70%' };
  var benchmark   = _bm[topPlatKey] || '0.48%';
  var reachDisplay = agg.totalReach > 0 ? _anFmtK(agg.totalReach) : '0';
  var bestIklan   = agg.bestCamp
    ? (agg.bestCamp.name || agg.bestCamp.nama_campaign || 'iklan terbaik')
    : null;

  var trendLine = agg.hasPrevPeriod
    ? 'Reach ' + (agg.reachTrend >= 0 ? '\u2191' : '\u2193') + ' ' + Math.abs(agg.reachTrend) + '% dari bulan lalu.'
    : '\ud83d\udcca Tren mulai terhitung periode depan.';

  // narasi_p1
  var p1 = bizName + ', kamu di jalur yang tepat! \ud83c\udfaf ' +
    iklanCount + ' iklan berjalan bulan ini, ' + reachDisplay + ' orang sudah tahu bisnis kamu secara organik' +
    (erDisplay ? ', dan ER kamu ' + erDisplay + ', jauh di atas rata-rata ' + topPlatName + ' ' + benchmark + '.' : '.');

  // narasi_p2
  var p2 = erTier === 'high' || erTier === 'mid'
    ? 'Kenapa ER kamu setinggi ini? Karena konten kamu relevan, orang yang lihat langsung bereaksi, bukan scroll lewat.' +
      (bestIklan ? ' Iklan "' + bestIklan + '" jadi buktinya, engagement rate-nya jauh melampaui rata-rata ' + topPlatName + '.' : ' Ini tanda kamu sudah bicara ke audiens yang tepat dengan pesan yang tepat.')
    : erTier === 'low'
    ? 'ER masih bisa ditingkatkan dengan konten yang lebih relevan ke audiens lokal. Coba variasi format atau tambahkan sapaan lokal untuk meningkatkan engagement.'
    : 'Belum cukup data untuk menilai performa konten karena reach masih sangat sedikit. Tambah lebih banyak iklan agar analisis semakin akurat.';

  // narasi_p3
  var p3 = 'Yang perlu diketahui: reach organik ' + topPlatName + ' memang terbatas, rata-rata hanya 3-4% dari followers per post. ' +
    reachDisplay + ' reach itu normal dan sehat untuk bisnis yang baru aktif di media sosial, fondasi kamu sudah kuat. ' + trendLine;

  // clue_todo
  var clueTodo = bestIklan
    ? 'Boost "' + bestIklan + '" dengan Rp 20-50rb selama 3 hari, iklan dengan engagement tertinggi kamu, paling efisien diperkuat minggu ini.'
    : 'Konsistensi adalah kunci. Terus posting dengan frekuensi yang sama dan pantau konten mana yang paling banyak di-engage.';

  return {
    narasi_p1:      p1,
    narasi_p2:      p2,
    narasi_p3:      p3,
    clue_potensi:   'Kualitas konten sudah terbukti. Tantangan berikutnya bukan buat konten lebih bagus, tapi lebih banyak orang yang melihatnya.',
    clue_todo:      clueTodo,
    narasi_footer:  'Data akan semakin akurat setelah lebih banyak iklan berjalan.',
    mood_insight:   'Audiens kamu merespons dengan baik. Pertahankan tone dan format yang sudah terbukti bekerja.',
    platform_insight: 'Kamu paling aktif di ' + topPlatName + '. Pertahankan konsistensi di platform ini.',
    stitch_insight: 'Caption dengan sapaan lokal dan teks overlay personal terbukti meningkatkan engagement.',
    rekomendasi: [
      { platform: topPlatKey, hari: agg.bestDay || 'Selasa',
        jam: String(agg.bestHour || 19).padStart(2,'0') + ':00',
        aksi: 'Post konten dengan sapaan lokal di caption',
        alasan: 'Jam ' + String(agg.bestHour || 19).padStart(2,'0') + ':00 adalah waktu dengan aktivitas iklan tertinggi kamu' },
      { platform: 'meta', hari: 'Rabu', jam: '12:00',
        aksi: agg.totalPaidReach === 0 ? 'Boost post terbaik dengan budget Rp 30rb selama 3 hari' : 'Post konten edukatif singkat di Facebook',
        alasan: 'Tengah hari adalah waktu scrolling Facebook yang optimal' },
      { platform: 'tiktok', hari: 'Jumat', jam: '20:00',
        aksi: 'Upload video 15-30 detik dengan musik trending lokal',
        alasan: 'Jumat malam adalah waktu engagement TikTok tertinggi sebelum weekend' }
    ],
    rekom_cta: 'Buat Iklan Baru Sekarang'
  };
}
/* ─── Section: SiLaris Narasi ─── */
function _renderSilarisNarasi() {
  return '<div class="an-si-card" id="an-si-section">' +
    '<div class="an-si-header">' +
      '<div class="an-si-avatar">' +
        '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"/></svg>' +
      '</div>' +
      '<div>' +
        '<div class="an-si-name">SiLaris</div>' +
        '<div class="an-si-tag">Social Media Analysis</div>' +
      '</div>' +
    '</div>' +
    '<div id="an-si-narasi-wrap" class="an-si-narasi">' +
      '<div style="display:flex;flex-direction:column;gap:6px;">' +
        _anSkBlock('75%', 14) + _anSkBlock('60%', 14) + _anSkBlock('45%', 14) +
        _anSkBlock('80%', 14) + _anSkBlock('55%', 14) +
      '</div>' +
    '</div>' +
    '<div id="an-si-narasi-footer" class="an-si-narasi-footer"></div>' +
    '<div class="an-si-clue-row">' +
      '<div class="an-si-clue">' +
        '<div class="an-si-clue-label">💡 Artinya untuk bisnismu</div>' +
        '<div id="an-si-clue-potensi">' + _anSkBlock('95%', 11) + '<div style="margin-top:4px;">' + _anSkBlock('70%', 11) + '</div></div>' +
      '</div>' +
      '<div class="an-si-clue">' +
        '<div class="an-si-clue-label">🎯 Yang bisa dilakukan sekarang</div>' +
        '<div id="an-si-clue-todo">' + _anSkBlock('95%', 11) + '<div style="margin-top:4px;">' + _anSkBlock('55%', 11) + '</div></div>' +
      '</div>' +
    '</div>' +
    '<div class="an-er-explainer">' +
      '<span class="an-er-explainer-icon">💡</span>' +
      '<div>' +
        '<span id="an-er-explainer-text">Memuat penjelasan performa...</span>' +
      '</div>' +
    '</div>' +
    '<div id="an-narasi-ts" class="an-narasi-ts"></div>' +
    '<div id="an-si-cta-wrap">' +
      '<button class="an-si-cta" onclick="switchMenu(\'command\')">Buat Iklan Baru Sekarang</button>' +
    '</div>' +
  '</div>';
}

/* ─── Section: Stat Cards Skeleton ─── */
function _renderStatCardsSkeleton() {
  return '<div class="kpi-row" id="an-sc-wrap">' +
    [0,1,2,3].map(function() {
      return '<div class="kpi-card">' +
        '<div class="kpi-label">' + _anSkBlock('55%', 9) + '</div>' +
        _anSkBlock('40%', 24) +
        '<div style="margin-top:6px;">' + _anSkBlock('75%', 10) + '</div>' +
      '</div>';
    }).join('') +
  '</div>';
}

/* ─── Section: Stat Cards Real ─── */
function _renderStatCards(agg) {
  var erLbl      = _anErLabel(agg.avgER);
  var reachDelta = _anDelta(agg.reachThisMonth, agg.reachLastMonth);
  var campDelta  = _anDelta(agg.countThisMonth, agg.countLastMonth);
  var hasPaid    = agg.totalPaidReach > 0;

  // card(colorClass, topLabel, bigVal, midLabel, sub, tip, delta)
  // midLabel = optional second row between value and sub
  function card(colorClass, topLabel, bigVal, midLabel, sub, tip, delta) {
    var midHtml   = midLabel ? '<div class="kpi-mid-label">' + midLabel + '</div>' : '';
    var deltaHtml = delta    ? '<div class="kpi-delta ' + delta.cls + '">' + delta.text + '</div>' : '';
    return '<div class="kpi-card ' + colorClass + '">' +
      '<div class="kpi-label">' + topLabel + '<span class="kpi-info" title="' + tip + '">ⓘ</span></div>' +
      '<div class="kpi-value">' + bigVal + '</div>' +
      midHtml +
      '<div class="kpi-sub">' + sub + '</div>' +
      deltaHtml +
    '</div>';
  }

  // Box 1: reach
  var reachVal = agg.totalReach > 0 ? _anFmtK(agg.totalReach) : '0';

  // Box 3: ER
  var erVal = agg.avgER != null ? agg.avgER.toFixed(1) + '%' : '0%';

  // Box 4: paid reach
  var paidVal, paidMid, paidSub, paidTip;
  if (hasPaid) {
    var paidPct = Math.round(agg.totalPaidReach / agg.totalReach * 100);
    paidVal = paidPct + '%';
    paidMid = _anFmtK(agg.totalPaidReach) + ' orang via iklan';
    paidSub = 'dari boost atau sponsored post';
    paidTip = 'Reach dari konten yang di-boost atau sponsored';
  } else {
    paidVal = '0';
    paidMid = 'Belum ada iklan berbayar';
    paidSub = 'Semua reach dari konten organik';
    paidTip = 'Belum ada iklan berbayar atau boost aktif';
  }

  return '<div class="kpi-row" id="an-sc-wrap">' +
    card('purple', 'Total Reach',
         reachVal,
         'Orang tahu bisnis kamu',
         'dari ' + agg.total + ' iklan bulan ini',
         'Estimasi total orang yang terpapar konten kamu',
         reachDelta) +
    card('green', 'Iklan berjalan',
         String(agg.active),
         null,
         'bulan ini',
         'Iklan dengan status running',
         campDelta) +
    card('amber', 'Performa Konten',
         erVal,
         erLbl.label,
         erLbl.sub,
         'Penilaian berdasarkan Engagement Rate: seberapa banyak yang like, komen, atau share',
         null) +
    card('blue', 'Iklan Berbayar',
         paidVal,
         paidMid,
         paidSub,
         paidTip,
         null) +
  '</div>';
}

/* ─── Section: Two-Col Skeleton ─── */
function _renderTwoColSkeleton(id) {
  return '<div class="an-two-col" id="' + id + '">' +
    '<div class="an-white-card">' +
      '<div class="an-card-header">' + _anSkBlock('55%', 13) + '</div>' +
      '<div class="an-card-body">' +
        _anSkBlock('100%', 11) + '<div style="margin-top:6px;">' + _anSkBlock('80%', 11) + '</div>' +
        '<div style="margin-top:6px;">' + _anSkBlock('65%', 11) + '</div>' +
      '</div>' +
    '</div>' +
    '<div class="an-white-card">' +
      '<div class="an-card-header">' + _anSkBlock('50%', 13) + '</div>' +
      '<div class="an-card-body">' +
        _anSkBlock('100%', 8) + '<div style="margin-top:7px;">' + _anSkBlock('100%', 8) + '</div>' +
        '<div style="margin-top:7px;">' + _anSkBlock('100%', 8) + '</div>' +
        '<div style="margin-top:7px;">' + _anSkBlock('90%', 8) + '</div>' +
      '</div>' +
    '</div>' +
  '</div>';
}

/* ─── Skeleton: Single White Card ─── */
function _renderCardSkeleton(id) {
  return '<div class="an-white-card" id="' + id + '">' +
    '<div class="an-card-header">' + _anSkBlock('52%', 13) + '</div>' +
    '<div class="an-card-body">' +
      _anSkBlock('100%', 11) +
      '<div style="margin-top:8px;">' + _anSkBlock('85%', 11) + '</div>' +
      '<div style="margin-top:8px;">' + _anSkBlock('68%', 11) + '</div>' +
    '</div>' +
  '</div>';
}

/* ─── Section: Campaign Terbaik ─── */
function _renderCampaignBest(agg) {
  var bestCampHTML = '';
  if (agg.bestCamp) {
    var c = agg.bestCamp;
    var eng = c._engagement || {};
    var firstPlat = (c.platforms || [])[0] || '';
    var platLabel = (c.platforms || []).map(function(p) { return (_AN_PLAT[p] || {}).name || p; }).join(', ');
    var launchDate = c.launchTime || (c.created_at ? (function() {
      var _d = new Date(c.created_at);
      return _d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) +
             ' · ' + _d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    })() : '—');
    var postUrl = c.post_url || null;
    var dateEl = postUrl
      ? '<a href="' + postUrl + '" target="_blank" rel="noopener" class="an-camp-date-link">' + launchDate + ' ↗</a>'
      : '<span>' + launchDate + '</span>';
    // Username dari connected accounts (sama seperti monitor.js)
    var _platApiMap = { ig:'instagram', 'ig-reel':'instagram', 'ig-story':'instagram', 'ig-feed':'instagram', 'ig-post':'instagram', meta:'facebook', 'meta-reel':'facebook', 'meta-story':'facebook', tiktok:'tiktok', youtube:'youtube' };
    var _storedAccs = typeof _getStoredAccounts === 'function' ? _getStoredAccounts() : [];
    var _matchedAcc = null;
    for (var _ai = 0; _ai < _storedAccs.length; _ai++) {
      if (_storedAccs[_ai].platform === (_platApiMap[firstPlat] || firstPlat)) { _matchedAcc = _storedAccs[_ai]; break; }
    }
    var campUsername = _matchedAcc ? ('@' + (_matchedAcc.username || '')) : '';

    var platIconEl = firstPlat
      ? '<div class="an-plat-icon ' + firstPlat + ' an-camp-plat-icon">' + _anPlatSvg(firstPlat) + '</div>'
      : '';
    bestCampHTML =
      '<div class="an-best-camp">' +
        '<div class="an-camp-top-row">' +
          platIconEl +
          '<div class="an-camp-top-info">' +
            '<div class="an-camp-name">' + (c.name || '—') + '</div>' +
            '<div class="an-camp-meta">' +
              (campUsername ? '<span class="an-camp-username">' + campUsername + '</span><span style="color:var(--border);">·</span>' : (platLabel ? '<span>' + platLabel + '</span><span style="color:var(--border);">·</span>' : '')) +
              dateEl +
            '</div>' +
          '</div>' +
        '</div>' +
        '<div class="an-camp-badges">' +
          (agg.bestER > 0 ? '<span class="an-badge purple">ER ' + agg.bestER.toFixed(1) + '%</span>' : '') +
          (eng.reach    ? '<span class="an-badge green">Reach ' + _anFmtK(eng.reach) + '</span>' : '') +
          (eng.comments ? '<span class="an-badge blue">' + eng.comments + ' komentar</span>' : '') +
        '</div>' +
        '<div class="an-camp-note" id="an-best-note">Memuat insight...</div>' +
      '</div>';
  } else {
    bestCampHTML =
      '<div style="font-size:12px;color:var(--secondary);padding:12px 0;line-height:1.6;">' +
        'Belum ada data engagement. Kunjungi <strong>Kelola Iklan</strong> untuk melihat data performa.' +
      '</div>';
  }
  return '<div class="an-white-card" id="an-camp-wrap">' +
    '<div class="an-card-header">' +
      '<div class="an-card-icon">' +
        '<svg viewBox="0 0 24 24"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>' +
      '</div>' +
      '<div>' +
        '<div class="an-card-title">Iklan Terbaik</div>' +
        '<div class="an-card-sub">Performa Tertinggi</div>' +
        '<div class="an-best-camp-info">Dipilih berdasarkan Engagement Rate tertinggi, konten yang paling banyak memicu reaksi dari orang yang melihatnya. Reach tinggi tanpa interaksi tidak lebih baik dari reach kecil dengan banyak interaksi.</div>' +
      '</div>' +
    '</div>' +
    '<div class="an-card-body">' + bestCampHTML + '</div>' +
  '</div>';
}

/* ─── Section: Mood Audiens ─── */
function _renderMoodAudiens(agg) {
  var moodHTML = '<div class="an-mood-grid">';
  var totalR = agg.totalReact;
  if (agg.hasMoodData && totalR > 0) {
    agg.moodData.forEach(function(m) {
      var pct = Math.round((m.count / totalR) * 100);
      moodHTML +=
        '<div class="an-mood-cell">' +
          '<span class="an-mood-cell-emoji">' + m.emoji + '</span>' +
          '<span class="an-mood-cell-pct">' + pct + '%</span>' +
          '<span class="an-mood-cell-label">' + m.label + '</span>' +
        '</div>';
    });
  } else {
    [['❤️','Love','—'],['👍','Like','—'],['😂','Haha','—'],['😮','Wow','—']].forEach(function(m) {
      moodHTML +=
        '<div class="an-mood-cell">' +
          '<span class="an-mood-cell-emoji">' + m[0] + '</span>' +
          '<span class="an-mood-cell-pct" style="color:var(--disabled);">' + m[2] + '</span>' +
          '<span class="an-mood-cell-label">' + m[1] + '</span>' +
        '</div>';
    });
  }
  moodHTML += '</div>';
  return '<div class="an-white-card" id="an-mood-wrap">' +
    '<div class="an-card-header">' +
      '<div class="an-card-icon">' +
        '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>' +
      '</div>' +
      '<div><div class="an-card-title">Mood Audiens Minggu Ini</div><div class="an-card-sub">Breakdown Reactions Semua Iklan</div></div>' +
    '</div>' +
    '<div class="an-card-body">' +
      moodHTML +
      '<div class="an-mood-insight" id="an-mood-insight">Memuat insight audiens...</div>' +
    '</div>' +
  '</div>';
}

/* ─── Stitch Previews ─── */
function _buildStitchPreviews(agg) {
  // Rule 5: empty state kalau tidak ada caption yang lolos threshold
  if (!agg.stitchCandidates || !agg.stitchCandidates.length) {
    return '<div style="font-size:12px;color:var(--secondary);padding:8px 0;line-height:1.6;">' +
      'Belum ada caption dengan performa tinggi, terus buat iklan untuk menemukan caption terbaikmu.' +
    '</div>';
  }

  // Platform → API key map untuk cari username dari stored accounts
  var _platApiMap = {
    ig:'instagram', 'ig-reel':'instagram', 'ig-story':'instagram',
    'ig-feed':'instagram', 'ig-post':'instagram',
    meta:'facebook', 'meta-reel':'facebook', 'meta-story':'facebook',
    tiktok:'tiktok', youtube:'youtube'
  };
  var _storedAccs = typeof _getStoredAccounts === 'function' ? _getStoredAccounts() : [];

  return agg.stitchCandidates.map(function(s) {
    var shortText  = s.text.length > 32 ? s.text.slice(0, 32) + '…' : s.text;
    var firstPlat  = (s.campaign.platforms || [])[0] || '';
    var platLabel  = (s.campaign.platforms || []).map(function(p) {
      return (_AN_PLAT[p] || {}).name || p;
    }).join(', ');
    var thumb      = s.campaign.thumbUrl && !s.campaign.thumbUrl.startsWith('blob:') ? s.campaign.thumbUrl : null;
    var thumbColor = s.campaign.thumbColor || '#791ADB';

    // Cari username akun sumber (Rule 4)
    var _apiKey    = _platApiMap[firstPlat] || firstPlat;
    var _acc       = null;
    for (var _i = 0; _i < _storedAccs.length; _i++) {
      if (_storedAccs[_i].platform === _apiKey) { _acc = _storedAccs[_i]; break; }
    }
    var username   = _acc && _acc.username ? '@' + _acc.username : '';
    // Format label: "ER X% · Platform · @namaakun"
    var erLabel    = 'ER ' + s.er.toFixed(1) + '%' +
                     (platLabel ? ' · ' + platLabel : '') +
                     (username  ? ' · ' + username  : '');

    return '<div class="an-stitch-item">' +
      '<div class="an-stitch-thumb">' +
        (thumb
          ? '<img src="' + thumb + '" style="width:100%;height:100%;object-fit:cover;" />'
          : '<div style="width:100%;height:100%;background:' + thumbColor + ';"></div>') +
        '<div class="an-stitch-overlay">' + s.text.slice(0, 14) + '</div>' +
      '</div>' +
      '<div class="an-stitch-detail">' +
        '<div class="an-stitch-text">' + shortText + '</div>' +
        '<div class="an-stitch-er">' + erLabel + '</div>' +
      '</div>' +
    '</div>';
  }).join('');
}

/* ─── Section: Local Pulse ─── */
/*
 * DATA SOURCE — INTERNAL ONLY, JANGAN TAMPILKAN DI UI:
 * Klaim "72% brand engagement dari konten lokal":
 * - SOCi study: local pages account for 72% of brand engagement
 * - CSA Research: 72.4% konsumen lebih likely engage dengan bahasa lokal mereka
 * Gunakan untuk menjawab pertanyaan internal/investor.
 */
function _renderLocalPulse(agg) {
  var ctx   = (typeof buildSilarisContext === 'function') ? buildSilarisContext() : null;
  var reg   = (typeof currentRegion !== 'undefined') ? currentRegion : 'default';
  var dial  = (typeof REGION_DIALEK !== 'undefined' && REGION_DIALEK[reg]) ? REGION_DIALEK[reg] : { greeting: 'Halo Sahabat!', cta: 'Cek Sekarang!' };
  var regLabel = ctx ? ctx.regionLabel : 'Indonesia';

  // Kapital setiap kata ("yogyakarta" → "Yogyakarta", "jawa barat" → "Jawa Barat")
  var regLabelCap = (regLabel || '').replace(/\b\w/g, function(c) { return c.toUpperCase(); });

  // Kondisi A: >=10 iklan, tersebar >=2 hari, ada ER valid → pakai jam ER-weighted
  // Kondisi B: data belum cukup → pakai jam count-based + disclaimer jujur
  var hasEnoughTimeData = agg.total >= 10 && (agg.distinctDays || 0) >= 2;
  var activeHour = hasEnoughTimeData ? agg.bestHourER : agg.bestHour;
  var hStart = String(activeHour).padStart(2,'0');
  var hEnd   = String((activeHour + 2) % 24).padStart(2,'0');
  var bestTimeStr = agg.total > 0 ? hStart + ':00 – ' + hEnd + ':00' : '19:00 – 21:00';
  var jamSubtext = hasEnoughTimeData
    ? 'Berdasarkan performa engagement iklan aktif kamu'
    : 'Berdasarkan jam posting iklan kamu, akan lebih akurat setelah lebih banyak iklan berjalan di hari berbeda';

  var pulseHTML =
    '<div class="an-pulse-list">' +
    '<div class="an-pulse-item">' +
      '<div class="an-pulse-icon-wrap"><span>⏰</span></div>' +
      '<div><div class="an-pulse-key">Jam Terbaik Posting</div>' +
        '<div class="an-pulse-val">' + bestTimeStr + '</div>' +
        '<div class="an-pulse-note">' + jamSubtext + '</div>' +
      '</div>' +
    '</div>' +
    '<div class="an-pulse-item">' +
      '<div class="an-pulse-icon-wrap"><span>📅</span></div>' +
      '<div><div class="an-pulse-key">Hari Terkuat</div>' +
        '<div class="an-pulse-val">' + agg.bestDay + '</div>' +
        '<div class="an-pulse-note">Hari dengan aktivitas iklan tertinggi</div>' +
      '</div>' +
    '</div>' +
    '<div class="an-pulse-item">' +
      '<div class="an-pulse-icon-wrap"><span>📍</span></div>' +
      '<div><div class="an-pulse-key">Sapaan Lokal Terbaik</div>' +
        '<div class="an-pulse-val">"' + dial.greeting + '"</div>' +
        '<div class="an-pulse-note">Sapaan khas <span class="an-pulse-highlight">' + regLabelCap + '</span>, terbukti meningkatkan engagement lokal</div>' +
        '<div class="an-pulse-note" style="margin-top:5px;font-size:12px;font-style:italic;opacity:0.75;">💡 72% brand engagement datang dari konten yang berbicara bahasa lokal audiens, tambahkan ke caption iklanmu</div>' +
      '</div>' +
    '</div>' +
    '<div class="an-pulse-item">' +
      '<div class="an-pulse-icon-wrap"><span>🎬</span></div>' +
      '<div><div class="an-pulse-key">Format Terbaik</div>' +
        '<div class="an-pulse-val" id="an-best-format">' + agg.topFormat + '</div>' +
        '<div class="an-pulse-note">Format dominan dari iklan aktif</div>' +
      '</div>' +
    '</div>' +
    '</div>' +
    '<div class="an-stitch-section">' +
      '<div class="an-stitch-title">Stitching Text Terbaik di Foto</div>' +
      '<div id="an-stitch-previews">' + _buildStitchPreviews(agg) + '</div>' +
      '<div class="an-stitch-insight" id="an-stitch-insight">Memuat pola terkuat...</div>' +
    '</div>';

  return '<div class="an-white-card" id="an-pulse-wrap">' +
    '<div class="an-card-header">' +
      '<div class="an-card-icon" style="background:linear-gradient(135deg,rgba(121,26,219,0.15),rgba(121,26,219,0.05));">' +
        '<svg viewBox="0 0 24 24"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>' +
      '</div>' +
      '<div style="flex:1;"><div class="an-card-title">Local Pulse</div><div class="an-card-sub">Pola Lokal Terbaik</div></div>' +
      '<span class="local-pulse-badge">LOKAL</span>' +
    '</div>' +
    '<div class="an-card-body">' + pulseHTML + '</div>' +
  '</div>';
}

/* ─── Section: Platform Terkuat ─── */
function _renderPlatformTerkuat(agg) {
  var platHTML = '<div class="an-plat-list">';
  if (agg.platList.length > 0) {
    agg.platList.forEach(function(p) {
      var cfg = _AN_PLAT[p.key] || { name: p.key, color: '#666' };
      platHTML +=
        '<div class="an-plat-row">' +
          '<div class="an-plat-icon ' + p.key + '" title="' + cfg.name + '">' + _anPlatSvg(p.key) + '</div>' +
          (p.avgER > 0 ? '<span class="an-plat-badge er">ER ' + p.avgER.toFixed(1) + '%</span>' : '') +
          '<span class="an-plat-badge count">' + p.count + ' iklan</span>' +
        '</div>';
    });
    ['ig','meta','tiktok'].forEach(function(p) {
      var inUse = agg.platList.some(function(pl) { return pl.key === p; });
      if (!inUse) {
        var cfg = _AN_PLAT[p];
        platHTML +=
          '<div class="an-plat-row" style="opacity:0.45;">' +
            '<div class="an-plat-icon ' + p + '" title="' + cfg.name + '">' + _anPlatSvg(p) + '</div>' +
            '<span class="an-plat-badge count" style="color:var(--disabled);">belum dipakai</span>' +
          '</div>';
      }
    });
  } else {
    platHTML += '<div style="font-size:12px;color:var(--secondary);padding:8px 0;">Belum ada data platform.</div>';
  }
  platHTML += '</div>';
  platHTML += '<div class="an-plat-insight" id="an-plat-insight">Memuat insight platform...</div>';

  return '<div class="an-white-card" id="an-plat-wrap">' +
    '<div class="an-card-header">' +
      '<div class="an-card-icon">' +
        '<svg viewBox="0 0 24 24"><rect x="18" y="3" width="4" height="18" rx="1"/><rect x="10" y="8" width="4" height="13" rx="1"/><rect x="2" y="13" width="4" height="8" rx="1"/></svg>' +
      '</div>' +
      '<div><div class="an-card-title">Platform Terkuat</div><div class="an-card-sub">Engagement Rate Per Platform</div></div>' +
    '</div>' +
    '<div class="an-card-body">' + platHTML + '</div>' +
  '</div>';
}

/* ─── Build Data-Driven Rekomendasi ─── */
function _buildRekomendasiData(agg) {
  if (!agg || agg.total < 5) return [];

  var ctx        = typeof buildSilarisContext === 'function' ? buildSilarisContext() : {};
  var bizName    = ctx.businessName || 'bisnismu';
  var regionCap  = (ctx.regionLabel || '').replace(/\b\w/g, function(c) { return c.toUpperCase(); });

  var bestDay      = agg.bestDay || 'Kamis';
  var bestHour     = agg.bestHourER || agg.bestHour || 17;
  var bestHourStr  = String(bestHour).padStart(2, '0') + ':00';
  var bestCampName = agg.bestCamp ? (agg.bestCamp.name || agg.bestCamp.nama_campaign || null) : null;
  var bestCampER   = agg.bestER > 0 ? Math.round(agg.bestER) : null;
  var topCaption   = agg.stitchCandidates && agg.stitchCandidates.length
    ? agg.stitchCandidates[0].text.slice(0, 28) : null;

  var rekoList = [];

  // ── REKO 1: Platform ER tertinggi ──
  if (agg.platList && agg.platList.length) {
    var p1     = agg.platList[0];
    var p1Name = (_AN_PLAT[p1.key] || {}).name || p1.key;
    var aksi1  = bestCampName
      ? 'Buat iklan seperti "' + bestCampName + '"' +
        (topCaption ? ', caption "' + topCaption + '..." terbukti disukai audiens' : '') +
        (bestCampER ? '. ER ' + bestCampER + '% adalah engagement rate tertinggi di semua iklan ' + bizName : '.')
      : 'Buat iklan baru di ' + p1Name + ' dengan format yang sama seperti iklan terbaikmu.';
    rekoList.push({
      platform: p1.key,
      hari:     bestDay,
      jam:      bestHourStr,
      aksi:     aksi1,
      alasan:   p1.avgER > 0
        ? 'ER rata-rata ' + p1Name + ' kamu ' + p1.avgER.toFixed(1) + '%, platform terkuat'
        : 'Platform dengan engagement tertinggi di semua iklanmu'
    });
  }

  // ── REKO 2: Platform campaign terbanyak (beda dari Reko 1) atau boost best camp ──
  if (agg.platList && agg.platList.length) {
    var byCount = agg.platList.slice().sort(function(a, b) { return b.count - a.count; });
    var p2 = null;
    for (var ci = 0; ci < byCount.length; ci++) {
      if (byCount[ci].key !== (rekoList[0] ? rekoList[0].platform : '')) {
        p2 = byCount[ci]; break;
      }
    }
    // 1 platform saja: boost existing (bukan buat baru) sebagai REKO 2
    if (!p2 && agg.bestCamp && agg.totalPaidReach === 0) p2 = agg.platList[0];

    if (p2) {
      var p2Name   = (_AN_PLAT[p2.key] || {}).name || p2.key;
      var onSamePlat = rekoList[0] && p2.key === rekoList[0].platform;
      var bestOnP2 = agg.bestCamp && (agg.bestCamp.platforms || []).indexOf(p2.key) !== -1
        ? agg.bestCamp : null;

      var aksi2, alasan2;
      if (bestOnP2) {
        var _eng    = bestOnP2._engagement || {};
        var engTot  = ((_eng.likes || 0) + (_eng.comments || 0) + (_eng.shares || 0));
        var engReach = _eng.reach || 0;
        var cRef    = bestOnP2.name || bestOnP2.nama_campaign || 'iklan terbaikmu';
        aksi2   = onSamePlat
          ? 'Boost "' + cRef + '" dengan Rp 20-50rb selama 3 hari' +
            (regionCap ? ', jangkau lebih banyak warga ' + regionCap : '') +
            '. Engagement rate-nya sudah terbukti, paid reach tinggal diperkuat.'
          : '"' + cRef + '" sudah dapat ' + engTot + ' engagement dari ' + engReach + ' orang' +
            (regionCap ? ', boost untuk jangkau lebih banyak warga ' + regionCap : '') + '.';
        alasan2 = p2.count + ' iklan di ' + p2Name + ', platform yang paling banyak kamu gunakan';
      } else {
        aksi2   = 'Kamu punya ' + p2.count + ' iklan di ' + p2Name + '. Konsisten posting di platform ini untuk membangun audiens yang lebih luas' +
          (regionCap ? ' di ' + regionCap : '') + '.';
        alasan2 = p2.count + ' iklan di ' + p2Name + ', platform terbanyak iklanmu';
      }

      var reko2Hour = String(Math.max(0, bestHour - 1)).padStart(2, '0') + ':00';
      rekoList.push({
        platform: p2.key,
        hari:     bestDay,
        jam:      reko2Hour,
        aksi:     aksi2,
        alasan:   alasan2
      });
    }
  }

  // ── REKO 3: Coba hari lain (hanya jika semua iklan di 1 hari) ──
  if ((agg.distinctDays || 0) <= 1) {
    var allDays = ['Senin','Selasa','Rabu','Kamis','Jumat','Sabtu'];
    var altDays = allDays.filter(function(d) { return d !== bestDay; }).slice(0, 2).join(' atau ');
    rekoList.push({
      platform: 'all',
      hari:     'Coba ' + altDays,
      jam:      '',
      aksi:     'Seluruh ' + agg.total + ' iklanmu dibuat hari ' + bestDay +
                ', audiens yang aktif di hari lain belum pernah kamu jangkau. ' +
                'Coba posting hari ' + altDays + ' untuk temukan peluang engagement baru.',
      alasan:   'Variasi hari posting bisa membuka segmen audiens baru dengan pola aktif berbeda'
    });
  }

  return rekoList;
}

/* ─── Render Satu Item Rekomendasi (dengan logo platform) ─── */
function _renderRekoItem(r, idx) {
  var platKey  = r.platform || 'ig';
  var isAll    = platKey === 'all';
  var platName = isAll ? 'Semua Platform' : ((_AN_PLAT[platKey] || {}).name || platKey);
  var pillCls  = isAll ? '' : platKey;
  var svgEl    = isAll
    ? '<span style="font-size:10px;margin-right:3px;">&#9889;</span>'
    : '<span class="an-plat-pill-svg">' + _anPlatSvg(platKey) + '</span>';
  var timeStr  = (r.hari || '') + (r.jam ? ', ' + r.jam : '');

  return '<div class="an-rekom-step">' +
    '<div class="an-step-num">' + (idx + 1) + '</div>' +
    '<div class="an-step-content">' +
      '<div class="an-step-top">' +
        '<span class="an-plat-pill ' + pillCls + '">' + svgEl + platName + '</span>' +
        (timeStr ? '<span class="an-step-action">' + timeStr + '</span>' : '') +
      '</div>' +
      '<div class="an-step-desc">' + (r.aksi || '') + '</div>' +
      (r.alasan ? '<div class="an-step-reason">' + r.alasan + '</div>' : '') +
    '</div>' +
  '</div>';
}

/* ─── Section: Rekomendasi Minggu Ini ─── */
function _renderRekomendasiWeek() {
  return '<div class="an-rekom-week-card" id="an-rekom-week-section">' +
    '<div class="an-rekom-week-header">' +
      '<div class="an-rekom-week-title"><span>🎯</span> Rekomendasi Minggu Ini</div>' +
    '</div>' +
    '<div class="an-rekom-week-body" id="an-rekom-week-body">' +
      [1,2,3].map(function(n) {
        return '<div class="an-rekom-step">' +
          '<div class="an-step-num">' + n + '</div>' +
          '<div class="an-step-content">' +
            '<div class="an-step-top">' + _anSkBlock('70px', 14) + '</div>' +
            '<div style="margin-top:5px;">' + _anSkBlock('100%', 10) + '</div>' +
            '<div style="margin-top:4px;">' + _anSkBlock('80%', 10) + '</div>' +
          '</div>' +
        '</div>';
      }).join('') +
    '</div>' +
    '<div class="an-rekom-week-cta">' +
      '<div class="an-rekom-cta-row">' +
        '<button class="an-rekom-week-cta-btn" onclick="switchMenu(\'command\')">🚀 Buat Iklan Sekarang →</button>' +
        '<button class="an-rekom-week-cta-btn an-rekom-week-cta-btn-outline" onclick="switchMenu(\'monitor\')">Lihat Iklan Aktif →</button>' +
      '</div>' +
    '</div>' +
  '</div>';
}

/* ─── Section: Competitor Analysis ─── */
var _anCompActivePlatform  = 'ig';
var _anCurrentCompResult   = null;
var _anCurrentCompHandle   = '';
var _anCurrentCompPlatform = 'ig';
var _anCurrentStrategyData = null;
var _AN_COMP_STRAT_KEY     = 'laras_competitor_strategies';

function _anGetSavedStrategies() {
  try { return JSON.parse(localStorage.getItem(_AN_COMP_STRAT_KEY) || '[]'); } catch(e) { return []; }
}
function _anPersistStrategies(arr) {
  try { localStorage.setItem(_AN_COMP_STRAT_KEY, JSON.stringify(arr)); } catch(e) {}
}

function _renderCompetitorSection() {
  var isPro = typeof RADAR_CONFIG !== 'undefined' && RADAR_CONFIG.FEATURES && RADAR_CONFIG.FEATURES.competitor_pro;
  return '<div class="an-comp-card">' +
    '<div class="an-comp-header">' +
      '<div class="an-comp-title"><span>🔍</span> Competitor Analysis</div>' +
      (isPro ? '<span class="an-comp-pro-badge">PRO</span>' : '<span class="an-comp-free-badge">GRATIS</span>') +
    '</div>' +
    '<div class="an-comp-body">' +
      '<div class="an-comp-plat-tabs">' +
        '<button class="an-comp-plat-tab active" onclick="anSetCompPlatform(this,\'ig\')" data-plat="ig">Instagram</button>' +
        '<button class="an-comp-plat-tab" onclick="anSetCompPlatform(this,\'meta\')" data-plat="meta">Facebook</button>' +
        '<button class="an-comp-plat-tab" onclick="anSetCompPlatform(this,\'tiktok\')" data-plat="tiktok">TikTok</button>' +
      '</div>' +
      '<div class="an-comp-input-row">' +
        '<input class="an-comp-input" id="an-comp-input" placeholder="Paste link atau @handle pesaing..." />' +
        '<button class="an-comp-analyze-btn" id="an-comp-btn" onclick="anAnalyzeCompetitor()">Analisa →</button>' +
      '</div>' +
      '<div id="an-comp-result-area"></div>' +
      (isPro
        ? '<div id="an-comp-pro-landscape"></div>'
        : '<div class="an-comp-upgrade-nudge">⚡ Upgrade ke Pro untuk analisis hingga 3 pesaing sekaligus <button class="an-comp-nudge-btn" onclick="showPricingModal()">Lihat paket →</button></div>'
      ) +
      '<div class="an-comp-disclaimer">Estimasi berdasarkan data publik · bukan angka dashboard pesaing</div>' +
    '</div>' +
    '<div id="an-saved-strategies-wrap"></div>' +
  '</div>';
}

/* ─── Section: Upgrade Pro ─── */
function _renderUpgradePro() {
  // Sembunyikan banner kalau user sudah Pro
  try {
    var _p = JSON.parse(localStorage.getItem('radar_user_profile') || '{}');
    if ((_p.selected_plan || '').toLowerCase() === 'pro') return '';
  } catch(e) {}
  return '<div class="an-pro-banner">' +
    '<div class="an-pro-top">' +
      '<div class="an-pro-icon">🚀</div>' +
      '<div>' +
        '<div class="an-pro-title">Upgrade ke Pro, unlock semua insight</div>' +
        '<div class="an-pro-desc">Jadikan data jadi mesin pertumbuhan bisnis kamu, tanpa batas.</div>' +
      '</div>' +
    '</div>' +
    '<div class="an-pro-features">' +
      '<div class="an-pro-feature">Competitor analysis tanpa batas</div>' +
      '<div class="an-pro-feature">Data real-time per jam</div>' +
      '<div class="an-pro-feature">AI caption generator premium</div>' +
      '<div class="an-pro-feature">Export laporan PDF</div>' +
    '</div>' +
    '<button class="an-pro-cta" onclick="showPricingModal()">Coba Pro Gratis →</button>' +
  '</div>';
}

/* ─── Populate AI Sections ─── */
function _anPopulateAI(ai, narasiTs, agg) {
  if (!ai) return;

  // Narasi
  var narasiWrap = document.getElementById('an-si-narasi-wrap');
  if (narasiWrap) {
    var _pStyle = 'margin:0;font-size:14px;line-height:1.7;color:var(--near-black);';
    var _p1 = (ai.narasi_p1 || '').trim();
    var _p2 = (ai.narasi_p2 || '').trim();
    var _p3 = (ai.narasi_p3 || '').trim();
    var parts = [];
    if (_p1) parts.push('<p style="' + _pStyle + '">' + _p1 + '</p>');
    if (_p2) parts.push('<p style="' + _pStyle + '">' + _p2 + '</p>');
    if (_p3) parts.push('<p style="' + _pStyle + 'opacity:0.85;">' + _p3 + '</p>');
    if (parts.length) {
      narasiWrap.innerHTML = parts.join('<div style="height:10px;"></div>');
    } else if (ai.narasi) {
      // fallback: old single-field format
      narasiWrap.innerHTML = '<p style="' + _pStyle + '">' + ai.narasi + '</p>';
    }
  }

  // Narasi footer
  var nfEl = document.getElementById('an-si-narasi-footer');
  if (nfEl && ai.narasi_footer) {
    nfEl.textContent = ai.narasi_footer;
  }

  // Narasi timestamp
  var ntsEl = document.getElementById('an-narasi-ts');
  if (ntsEl && narasiTs) {
    ntsEl.textContent = 'Analisis diperbarui ' + _anRelTime(narasiTs);
  }

  // Clue cards
  var cp = document.getElementById('an-si-clue-potensi');
  if (cp && ai.clue_potensi) cp.innerHTML = '<span class="an-si-clue-text">' + ai.clue_potensi + '</span>';
  var ct = document.getElementById('an-si-clue-todo');
  if (ct && ai.clue_todo) ct.innerHTML = '<span class="an-si-clue-text">' + ai.clue_todo + '</span>';

  // Mood insight
  var mi = document.getElementById('an-mood-insight');
  if (mi && ai.mood_insight) mi.textContent = ai.mood_insight;

  // Platform insight
  var pi = document.getElementById('an-plat-insight');
  if (pi && ai.platform_insight) pi.textContent = ai.platform_insight;

  // Stitch insight
  var si = document.getElementById('an-stitch-insight');
  if (si && ai.stitch_insight) si.textContent = ai.stitch_insight;

  // Best camp note
  var bn = document.getElementById('an-best-note');
  if (bn) bn.textContent = 'Iklan ini punya engagement rate tertinggi di antara semua iklan kamu. Jadikan sebagai template untuk iklan berikutnya.';

  // CTA buttons: 2 buttons if bestCamp exists, 1 button fallback
  var ctaWrap = document.getElementById('an-si-cta-wrap');
  if (ctaWrap) {
    var _bestC     = agg && agg.bestCamp;
    var _bestCName = _bestC ? (_bestC.name || _bestC.nama_campaign || '') : '';
    if (_bestCName && _bestC) {
      // Simpan objek bestCamp ke window agar bisa diakses dari onclick inline
      window._analyticsBestCamp = _bestC;
      ctaWrap.innerHTML =
        '<div class="an-si-cta-row">' +
          '<button class="an-si-cta" onclick="if(typeof showBoostModal===\'function\')showBoostModal(window._analyticsBestCamp);">' +
            '🚀 Boost ' + _bestCName +
          '</button>' +
          '<button class="an-si-cta an-si-cta-outline" onclick="switchMenu(\'command\')">' +
            '+ Buat Iklan Baru' +
          '</button>' +
        '</div>';
    } else {
      ctaWrap.innerHTML = '<button class="an-si-cta" onclick="switchMenu(\'command\')">Buat Iklan Baru Sekarang</button>';
    }
  }

  // Rekomendasi steps — data-driven dari agg (bukan dari AI)
  var weekBody = document.getElementById('an-rekom-week-body');
  if (weekBody) {
    if (!agg || (agg.total || 0) < 5) {
      weekBody.innerHTML =
        '<div style="padding:16px 4px;text-align:center;color:var(--secondary);font-size:13px;line-height:1.6;">' +
          '<div style="font-size:20px;margin-bottom:8px;">📊</div>' +
          'Butuh minimal 5 iklan untuk rekomendasi akurat.<br>' +
          '<span style="font-size:12px;opacity:0.8;">Tambah iklan dan data akan dianalisis otomatis.</span>' +
        '</div>';
    } else {
      var rekoData = _buildRekomendasiData(agg);
      weekBody.innerHTML = rekoData.length
        ? rekoData.map(function(r, i) { return _renderRekoItem(r, i); }).join('')
        : '<div style="padding:12px 4px;color:var(--secondary);font-size:12px;">Belum cukup variasi data untuk rekomendasi spesifik.</div>';
    }
  }
}

/* ─── Competitor: Set Platform ─── */
function anSetCompPlatform(btn, platform) {
  _anCompActivePlatform  = platform;
  _anCurrentCompPlatform = platform;
  var tabs = document.querySelectorAll('.an-comp-plat-tab');
  tabs.forEach(function(t) { t.classList.remove('active'); });
  btn.classList.add('active');
}
window.anSetCompPlatform = anSetCompPlatform;

/* ─── Competitor: cek apakah kategori user dan pesaing berbeda jauh ─── */
function _anIsCategoryMismatch(userCat, compCat) {
  if (!userCat || !compCat) return false;
  var groups = {
    food:      ['kuliner','fnb','makanan','minuman','restoran','resto','food',
                'catering','bakery','warung','kedai','mie','bakso','nasi','rumah makan','makan'],
    cafe:      ['kafe','cafe','kopi','coffee','boba','minuman','kedai kopi','espresso','tea'],
    fashion:   ['fashion','pakaian','busana','outfit','baju','hijab','batik','clothing','konveksi','thrift'],
    beauty:    ['beauty','kecantikan','skincare','makeup','salon','perawatan','kosmetik','spa','lash','nail'],
    barber:    ['barber','barbershop','cukur','pangkas','potong rambut','hairstyle'],
    retail:    ['retail','toko','jualan','produk','shop','market','belanja','olshop','store'],
    service:   ['jasa','service','layanan','konsultan','reparasi','laundry','sablon','percetakan'],
    health:    ['kesehatan','health','medis','apotek','klinik','dokter','herbal','farmasi','wellness'],
    property:  ['properti','property','rumah','realestate','kontrakan','kost','ruko','kavling','perumahan'],
    accom:     ['hotel','resort','penginapan','villa','homestay','bnb','motel','inn','lodge','akomodasi'],
    travel:    ['wisata','travel','pariwisata','tur','tour','piknik','destinasi','liburan','backpacker'],
    edu:       ['pendidikan','education','kursus','les','belajar','sekolah','training','kampus','bimbel'],
    auto:      ['otomotif','motor','mobil','automotive','bengkel','sparepart','variasi','modifikasi'],
    sport:     ['olahraga','sport','gym','fitness','futsal','badminton','renang','lari','yoga','crossfit'],
    seni:      ['museum','gallery','galeri','art','seni','budaya','film','culture','creative',
                'pertunjukan','teater','kultura','heritage','kebudayaan','pameran',
                'sinema','exhibition','kurasi','arsip','literasi'],
    music:     ['musik','band','dj','hiburan','entertainment','konser','manggung','studio musik'],
    photo:     ['foto','photography','photographer','studio foto','kamera','visual','cinematography'],
    event:     ['wedding','pernikahan','bridal','dekorasi','event organizer','wedding organizer','eo'],
    pet:       ['pet','hewan','anjing','kucing','vet','veteriner','grooming hewan','reptil','burung'],
    komunitas: ['komunitas','community','club','squad','organisasi','yayasan','paguyuban','forum','base'],
    media:     ['media','berita','news','magazine','konten','content creator','podcast','blog','vlog'],
    tech:      ['teknologi','tech','startup','digital','software','app','aplikasi','it','coding','developer'],
  };
  function getGroup(cat) {
    var c = cat.toLowerCase();
    for (var g in groups) {
      if (groups[g].some(function(k) { return c.indexOf(k) !== -1; })) return g;
    }
    return 'other';
  }
  var ug = getGroup(userCat);
  var cg = getGroup(compCat);
  // hanya tampilkan warning kalau kedua kategori teridentifikasi DAN berbeda
  return ug !== 'other' && cg !== 'other' && ug !== cg;
}

/* ─── Competitor: build category-mismatch warning HTML ─── */
// compCat / userCat = raw category string untuk ditampilkan di warning
function _anBuildCatWarning(handle, ctx, compCat, userCat) {
  var regionLabel = (ctx && ctx.regionLabel) ? ctx.regionLabel : '';
  var bizCat      = userCat || (ctx && ctx.businessCategory) || 'bisnismu';
  var compLabel   = compCat || 'kategori berbeda';
  // Capitalize first letter untuk display
  var cap = function(s) { return s ? s.charAt(0).toUpperCase() + s.slice(1) : s; };
  return '<div class="an-comp-cat-warning">' +
    '<div class="an-comp-cat-warn-row">' +
      '<div class="an-comp-cat-warn-body">' +
        '<div class="an-comp-cat-warn-title">⚠️ Kategori berbeda</div>' +
        '<div class="an-comp-cat-warn-text">' + handle + ' sepertinya bergerak di kategori <strong>' + cap(compLabel) + '</strong>, ' +
          'berbeda dari bisnismu (<strong>' + cap(bizCat) + '</strong>). ' +
          'Insight tetap ditampilkan — gunakan sebagai inspirasi, bukan patokan langsung.</div>' +
        (regionLabel ? '<div class="an-comp-cat-suggestion">💡 Untuk perbandingan lebih akurat, coba cari pesaing ' + cap(bizCat) + ' di ' + regionLabel + '</div>' : '') +
      '</div>' +
    '</div>' +
    '<div class="an-comp-cat-warn-btns">' +
      '<button class="an-comp-cat-ok" onclick="this.closest(\'.an-comp-cat-warning\').style.display=\'none\'">Tetap Lanjutkan</button>' +
      '<button class="an-comp-cat-new" onclick="(function(){var a=document.getElementById(\'an-comp-result-area\');if(a)a.innerHTML=\'\';var i=document.getElementById(\'an-comp-input\');if(i){i.value=\'\';i.focus();}})()">Cari Pesaing Lain</button>' +
    '</div>' +
  '</div>';
}

/* ─── Competitor: unknown category warning (AI tidak bisa deteksi kategori pesaing) ─── */
function _anBuildCatUnknownWarning(handle, ctx) {
  var bizCat      = (ctx && ctx.businessCategory) ? ctx.businessCategory : '';
  var regionLabel = (ctx && ctx.regionLabel) ? ctx.regionLabel : '';
  return '<div class="an-comp-cat-warning">' +
    '<div class="an-comp-cat-warn-row">' +
      '<div class="an-comp-cat-warn-body">' +
        '<div class="an-comp-cat-warn-title">⚠️ Kategori tidak terdeteksi</div>' +
        '<div class="an-comp-cat-warn-text">Kategori bisnis ' + handle + ' tidak bisa dideteksi otomatis. ' +
          'Pastikan ini memang pesaing di bidang yang sama sebelum lanjut menganalisa.</div>' +
        (bizCat && regionLabel
          ? '<div class="an-comp-cat-suggestion">💡 Untuk hasil lebih akurat, coba cari pesaing ' + bizCat + ' di ' + regionLabel + '</div>'
          : '') +
      '</div>' +
    '</div>' +
    '<div class="an-comp-cat-warn-btns">' +
      '<button class="an-comp-cat-ok" onclick="this.closest(\'.an-comp-cat-warning\').style.display=\'none\'">Lanjut Saja</button>' +
      '<button class="an-comp-cat-new" onclick="(function(){var a=document.getElementById(\'an-comp-result-area\');if(a)a.innerHTML=\'\';var i=document.getElementById(\'an-comp-input\');if(i){i.value=\'\';i.focus();}})()">Cari Pesaing Lain</button>' +
    '</div>' +
  '</div>';
}

/* ─── Competitor: extract @username from URL or plain handle ─── */
function _anExtractHandle(raw) {
  var s = (raw || '').trim();
  // Instagram: instagram.com/username or /p/ /reel/ (skip those)
  var igM = s.match(/instagram\.com\/([^/?&#\s\/]+)/i);
  if (igM && igM[1] && !/^(p|reel|reels|explore|stories)$/i.test(igM[1])) {
    return '@' + igM[1];
  }
  // TikTok: tiktok.com/@username
  var ttM = s.match(/tiktok\.com\/@?([^/?&#\s\/]+)/i);
  if (ttM && ttM[1]) return '@' + ttM[1];
  // Facebook: facebook.com/username
  var fbM = s.match(/facebook\.com\/([^/?&#\s\/]+)/i);
  if (fbM && fbM[1] && !/^(profile\.php|pages|groups)$/i.test(fbM[1])) {
    return '@' + fbM[1];
  }
  // Already @handle or just a plain handle
  if (s.startsWith('@')) return s;
  if (s.startsWith('http')) return s; // unknown URL — return as-is
  return '@' + s;
}

/* ─── Competitor: parse follower string ("5K"→5000, "1.2M"→1200000) ─── */
function _anParseFollowers(str) {
  if (!str) return null;
  var n = parseFloat(str.replace(/[^0-9.]/g, ''));
  if (isNaN(n)) return null;
  if (/[Mm]/.test(str)) return Math.round(n * 1000000);
  if (/[Kk]/.test(str)) return Math.round(n * 1000);
  return Math.round(n);
}

/*
 * _anEstCompER — Estimasi ER pesaing berbasis benchmark industri follower count
 * Sumber: Socialinsider Social Media Industry Benchmarks 2025
 * https://www.socialinsider.io/blog/social-media-industry-benchmarks/
 *
 * Bracket ER median:
 *   < 1.000 followers  → 6.5%  (nano, engagement sangat tinggi, komunitas kecil)
 *   1.000 – 9.999      → 4.5%  (micro, sweet spot UMKM)
 *   10.000 – 99.999    → 3.0%  (mid-tier)
 *   ≥ 100.000          → 1.5%  (macro/mega, reach besar tapi ER turun)
 *
 * Tambahan: variasi deterministik ±0.3% berdasarkan hash handle
 * supaya angka tidak selalu bulat (lebih realistis).
 */
function _anEstCompER(followerCount, handleStr) {
  var base;
  if (followerCount === null || followerCount === undefined) {
    base = 3.0; // fallback mid-tier
  } else if (followerCount < 1000) {
    base = 6.5;
  } else if (followerCount < 10000) {
    base = 4.5;
  } else if (followerCount < 100000) {
    base = 3.0;
  } else {
    base = 1.5;
  }

  // Variasi deterministik ±0.3 berbasis karakter handle (supaya tidak selalu bulat)
  var h = 0;
  var s = handleStr || '';
  for (var i = 0; i < s.length; i++) { h = (h * 31 + s.charCodeAt(i)) & 0xffff; }
  var variance = ((h % 7) - 3) * 0.1; // −0.3 … +0.3, step 0.1

  return Math.max(0.5, parseFloat((base + variance).toFixed(1)));
}

/* ─── Competitor: Analyze ─── */
async function anAnalyzeCompetitor() {
  var input = document.getElementById('an-comp-input');
  var btn   = document.getElementById('an-comp-btn');
  var area  = document.getElementById('an-comp-result-area');
  if (!input || !area) return;

  var rawInput = input.value.trim();
  if (!rawInput) { input.focus(); input.style.borderColor = '#ef4444'; setTimeout(function() { input.style.borderColor = ''; }, 1500); return; }
  var handle = _anExtractHandle(rawInput);   // bersihkan URL jadi @username
  input.value = handle;                      // tampilkan handle bersih di input

  if (btn) { btn.disabled = true; btn.textContent = 'Menganalisa...'; }
  area.innerHTML =
    '<div class="an-comp-loading">' +
      '<div class="an-comp-loading-dots"><div class="an-comp-loading-dot"></div><div class="an-comp-loading-dot"></div><div class="an-comp-loading-dot"></div></div>' +
      '<span>Sedang menganalisa ' + handle + '...</span>' +
    '</div>';

  var agg = window._anLastAgg || { total: 0, active: 0, avgER: null, totalReach: 0 };

  // Cek cache localStorage (TTL 24 jam) sebelum panggil API
  var _cacheKey = 'radar_comp_cache_' + handle + '_' + _anCompActivePlatform;
  var result = null;
  try {
    var _cached = localStorage.getItem(_cacheKey);
    if (_cached) {
      var _cachedObj = JSON.parse(_cached);
      if (Date.now() - _cachedObj.timestamp < 86400000) {
        result = _cachedObj.result;
      } else {
        localStorage.removeItem(_cacheKey);
      }
    }
  } catch(e) {}

  if (!result) {
    result = await _callSilarisCompetitor(handle, _anCompActivePlatform, agg);
    // Simpan ke cache jika sukses
    if (result && !result.__rateLimitError) {
      try { localStorage.setItem(_cacheKey, JSON.stringify({ result: result, timestamp: Date.now() })); } catch(e) {}
    }
  }

  if (btn) { btn.disabled = false; btn.textContent = 'Analisa →'; }

  if (!result) {
    area.innerHTML = '<div style="font-size:12px;color:var(--secondary);padding:8px 0;">Gagal menganalisa. Pastikan koneksi internet stabil dan coba lagi.</div>';
    return;
  }
  if (result.__rateLimitError) {
    area.innerHTML = '<div style="font-size:12px;color:var(--secondary);padding:8px 0;">⏳ SiLaris sedang istirahat sejenak — kapasitas harian tercapai. Coba lagi dalam <strong>' + (result.waitMsg || 'beberapa menit') + '</strong>.</div>';
    return;
  }

  // Store module state for strategy modal
  _anCurrentCompResult   = result;
  _anCurrentCompHandle   = handle;
  _anCurrentCompPlatform = _anCompActivePlatform;

  var userER    = agg.avgER ? agg.avgER.toFixed(1) : null;
  var userErLbl = _anErLabel(agg.avgER);
  var platName  = (_AN_PLAT[_anCompActivePlatform] || {}).name || _anCompActivePlatform; // untuk label tooltip estimasi

  // Cek relevansi kategori pesaing vs user
  var _userCtxFix2 = (typeof buildSilarisContext === 'function') ? buildSilarisContext() : {};
  var _userBizCat  = (_userCtxFix2.businessCategory || '').toLowerCase();
  var _compBizCat  = (result.comp_category || '').toLowerCase();

  // DEBUG: log apa yang AI kembalikan (bisa dilihat di browser console)
  console.log('[RADAR] competitor category debug:', {
    handle:            handle,
    userCategory:      _userBizCat      || '(kosong)',
    compCategoryRaw:   result.comp_category || '(kosong/null)',
    compCategoryLower: _compBizCat      || '(kosong)',
    compFollowers:     result.comp_followers,
    compFormat:        result.comp_format
  });

  var categoryMismatch = _anIsCategoryMismatch(_userBizCat, _compBizCat);
  // Kategori pesaing tidak terdeteksi sama sekali (AI tidak tahu akun ini)
  var categoryUnknown  = !!_userBizCat && !_compBizCat;

  console.log('[RADAR] warning decision:', {
    categoryMismatch: categoryMismatch,
    categoryUnknown:  categoryUnknown,
    showWarning:      categoryMismatch || categoryUnknown
  });

  // FIX 2: validasi ukuran akun — followers < 1000 dianggap akun kecil
  var followerCount  = _anParseFollowers(result.comp_followers);
  var isSmallAccount = followerCount !== null && followerCount < 1000;

  // FIX ER: override nilai comp_er dari AI dengan benchmark industri berbasis follower count
  // (Socialinsider 2025) — AI sering overestimate karena tidak punya data real-time
  var _benchmarkER = _anEstCompER(followerCount, handle);
  result.comp_er = _benchmarkER.toFixed(1) + '%'; // timpa nilai AI

  var compER    = _benchmarkER;
  var compErLbl = _anErLabel(compER);

  // Prefix "±" untuk data pesaing jika akun kecil (estimasi kurang akurat)
  var _pfx = isSmallAccount ? '±' : '';
  var erDisplay        = _pfx + result.comp_er;
  var followersDisplay = result.comp_followers  ? _pfx + result.comp_followers  : null;
  var freqDisplay      = result.comp_freq       ? _pfx + result.comp_freq       : null;

  area.innerHTML =
    '<div class="an-comp-result">' +

    // Category warning: mismatch (kategori diketahui tapi berbeda) ATAU unknown (tidak terdeteksi)
    (categoryMismatch
      ? _anBuildCatWarning(handle, _userCtxFix2, _compBizCat, _userBizCat)
      : (categoryUnknown ? _anBuildCatUnknownWarning(handle, _userCtxFix2) : '')) +

    // Compare grid
    '<div class="an-comp-compare-grid">' +
      '<div class="an-comp-col">' +
        '<div class="an-comp-col-label">Kamu</div>' +
        (userER
          ? '<div class="an-comp-metric"><span class="an-comp-metric-key">Avg ER</span><span class="an-comp-metric-val accent">' + userER + '%</span></div>' +
            '<div class="an-comp-er-lbl user">' + userErLbl.label + '</div>'
          : '') +
        '<div class="an-comp-metric"><span class="an-comp-metric-key">Iklan aktif</span><span class="an-comp-metric-val">' + agg.active + '</span></div>' +
        '<div class="an-comp-metric"><span class="an-comp-metric-key">Total reach</span><div style="line-height:1.2"><span class="an-comp-metric-val">' + _anFmtK(agg.totalReach) + '</span>' + (agg.reachCount ? '<div class="an-comp-reach-note">dari ' + agg.reachCount + ' iklan</div>' : '') + '</div></div>' +
      '</div>' +
      '<div class="an-comp-col">' +
        '<div class="an-comp-col-label">Pesaing · ' + (result.comp_handle || handle) + '</div>' +
        '<div style="font-size:10px;color:#9ca3af;margin-top:-6px;margin-bottom:6px;">profil estimatif AI · bukan data dashboard</div>' +
        (isSmallAccount
          ? '<div class="an-comp-small-warning">⚠️ Akun kecil — estimasi mungkin kurang akurat</div>'
          : '') +
        (erDisplay
          ? '<div class="an-comp-metric"><span class="an-comp-metric-key">Est. ER <span class="an-comp-est-tip" title="Estimasi berdasarkan pola umum akun sejenis di ' + platName + '. Bukan data real-time.">?</span></span><span class="an-comp-metric-val">' + erDisplay + '</span></div>' +
            (compErLbl ? '<div class="an-comp-er-lbl comp">' + compErLbl.label + '</div>' : '')
          : '') +
        (freqDisplay      ? '<div class="an-comp-metric"><span class="an-comp-metric-key">Freq. posting</span><span class="an-comp-metric-val">' + freqDisplay + '</span></div>' : '') +
        (followersDisplay ? '<div class="an-comp-metric"><span class="an-comp-metric-key">Est. followers <span class="an-comp-est-tip" title="Estimasi berdasarkan data publik — akurasi ±50% untuk akun dengan followers di bawah 10K">?</span></span><span class="an-comp-metric-val">' + followersDisplay + '</span></div>' : '') +
        (result.comp_format    ? '<div class="an-comp-metric"><span class="an-comp-metric-key">Format dominan</span><span class="an-comp-metric-val">' + result.comp_format + '</span></div>' : '') +
      '</div>' +
    '</div>' +

    // ER Bar comparison
    (userER && compER ? (function() {
      var uVal = parseFloat(userER), cVal = compER, maxVal = Math.max(uVal, cVal, 0.1);
      return '<div class="an-comp-bar-section">' +
        '<div class="an-comp-bar-label">Perbandingan Engagement Rate</div>' +
        '<div class="an-comp-bar-wrap"><div style="width:48px;font-size:10px;color:var(--secondary);">Kamu</div>' +
          '<div class="an-comp-bar-bg"><div class="an-comp-bar-fill user" style="width:' + (uVal/maxVal*100).toFixed(0) + '%;"></div></div>' +
          '<span class="an-comp-bar-val" style="color:var(--rausch);">' + uVal.toFixed(1) + '%</span>' +
        '</div>' +
        '<div class="an-comp-bar-wrap"><div style="width:48px;font-size:10px;color:var(--secondary);">Pesaing</div>' +
          '<div class="an-comp-bar-bg"><div class="an-comp-bar-fill comp" style="width:' + (cVal/maxVal*100).toFixed(0) + '%;"></div></div>' +
          '<span class="an-comp-bar-val">' + cVal.toFixed(1) + '%</span>' +
        '</div>' +
        '<div class="an-comp-er-disclaimer">ER kamu dihitung dari data iklan aktif. ER pesaing adalah estimasi berdasarkan benchmark industri — metodologi berbeda, gunakan sebagai referensi saja.</div>' +
      '</div>';
    })() : '') +

    // Insights
    (result.insights && result.insights.length
      ? '<div class="an-comp-insights">' +
          result.insights.map(function(ins) {
            return '<div class="an-comp-insight ' + (ins.type || 'purple') + '">' +
              '<div class="an-comp-insight-dot"></div>' +
              '<span>' + ins.text + '</span>' +
            '</div>';
          }).join('') +
        '</div>'
      : '') +

    // Strategy CTA
    '<button class="an-comp-strat-btn" onclick="anOpenStrategyModal()">✨ Buat strategi khusus untuk kalahkan ' + handle + ' →</button>' +
    '</div>';
}
window.anAnalyzeCompetitor = anAnalyzeCompetitor;

/* ─── Strategy Modal ─── */
function anOpenStrategyModal() {
  if (!_anCurrentCompResult) return;

  var existing = document.getElementById('an-strat-modal');
  if (existing) existing.remove();

  var handle   = _anCurrentCompHandle;
  var platName = (_AN_PLAT[_anCurrentCompPlatform] || {}).name || _anCurrentCompPlatform;
  var agg      = window._anLastAgg || {};
  var result   = _anCurrentCompResult;

  var modal = document.createElement('div');
  modal.id        = 'an-strat-modal';
  modal.className = 'an-strat-overlay';
  modal.innerHTML =
    '<div class="an-strat-sheet">' +
      '<div class="an-strat-header">' +
        '<div>' +
          '<div class="an-strat-title">✨ Strategimu vs ' + (handle.startsWith('@') ? handle : '@' + handle) + '</div>' +
          '<div class="an-strat-sub">' + platName + ' · Dibuat oleh SiLaris</div>' +
        '</div>' +
        '<button class="an-strat-close" onclick="anCloseStrategyModal()">✕</button>' +
      '</div>' +
      '<div id="an-strat-body" class="an-strat-body">' +
        '<div class="an-strat-loading">' +
          '<div class="an-comp-loading-dots"><div class="an-comp-loading-dot"></div><div class="an-comp-loading-dot"></div><div class="an-comp-loading-dot"></div></div>' +
          '<span style="font-size:12px;color:var(--secondary);">SiLaris sedang merancang strategi...</span>' +
        '</div>' +
      '</div>' +
      '<div id="an-strat-footer" class="an-strat-footer"></div>' +
    '</div>';

  document.body.appendChild(modal);
  modal.addEventListener('click', function(e) { if (e.target === modal) anCloseStrategyModal(); });
  var _stratEscFn = function(e) { if (e.key === 'Escape') anCloseStrategyModal(); };
  document.addEventListener('keydown', _stratEscFn);
  modal._stratEscFn = _stratEscFn;

  _anGenerateStrategy(handle, _anCurrentCompPlatform, result, agg)
    .then(function(strat) {
      if (!strat) {
        var body = document.getElementById('an-strat-body');
        if (body) body.innerHTML = '<div style="font-size:12px;color:var(--secondary);padding:8px 0;">Gagal generate strategi. Coba lagi nanti.</div>';
        return;
      }
      _anCurrentStrategyData = { handle: handle, platform: _anCurrentCompPlatform, strategy: strat, compResult: result };
      _renderStrategyContent(strat);
    });
}
window.anOpenStrategyModal = anOpenStrategyModal;

function anCloseStrategyModal() {
  var modal = document.getElementById('an-strat-modal');
  if (!modal) return;
  if (modal._stratEscFn) document.removeEventListener('keydown', modal._stratEscFn);
  modal.style.animation = 'stratFadeOut 0.2s ease forwards';
  setTimeout(function() { if (modal.parentNode) modal.remove(); }, 220);
}
window.anCloseStrategyModal = anCloseStrategyModal;

function _renderStrategyContent(strat) {
  var body   = document.getElementById('an-strat-body');
  var footer = document.getElementById('an-strat-footer');
  if (!body) return;

  // ── Keunggulanmu (hijau) ──
  var keunggulanHtml = strat.keunggulan
    ? '<div class="an-strat-section an-strat-section-green">' +
        '<div class="an-strat-section-label">✅ Keunggulanmu</div>' +
        '<div class="an-strat-section-text">' + strat.keunggulan + '</div>' +
      '</div>'
    : (strat.judul ? '<div class="an-strat-judul">' + strat.judul + '</div>' : '');

  // ── Celah yang Bisa Dimanfaatkan (amber) ──
  var celahHtml = strat.celah
    ? '<div class="an-strat-section an-strat-section-amber">' +
        '<div class="an-strat-section-label">⚡ Celah yang Bisa Dimanfaatkan</div>' +
        '<div class="an-strat-section-text">' + strat.celah + '</div>' +
      '</div>'
    : '';

  // ── Langkah Pertama (ungu) ──
  var _stepPlatform = _anCurrentCompPlatform || 'ig';
  var _stepFormat   = strat.format_rekomendasi || 'reel';
  var _stepHandle   = _anCurrentCompHandle || '';
  var _fmtLabels    = { reel: 'Reel', post: 'Foto/Post', story: 'Story' };
  var _platLabels   = { ig: 'Instagram', meta: 'Facebook', tiktok: 'TikTok', youtube: 'YouTube' };
  var _stepFmtName  = _fmtLabels[_stepFormat]   || _stepFormat;
  var _stepPlatName = _platLabels[_stepPlatform] || _stepPlatform;

  var stepsHtml = (strat.langkah || []).map(function(l, i) {
    return '<div class="an-strat-step">' +
      '<div class="an-strat-step-num">' + (i + 1) + '</div>' +
      '<div class="an-strat-step-body">' +
        '<div class="an-strat-step-text">' + l + '</div>' +
        '<div class="an-strat-step-footer">' +
          '<span class="an-strat-step-meta">📱 ' + _stepPlatName + ' · ' + _stepFmtName + '</span>' +
          '<button class="an-strat-step-btn" onclick="anLaunchFromStratStep(\'' + _stepPlatform + '\',\'' + _stepFormat + '\',\'' + _stepHandle.replace(/'/g,'') + '\')">' +
            'Buat Sekarang →' +
          '</button>' +
        '</div>' +
      '</div>' +
    '</div>';
  }).join('');
  var langkahHtml = stepsHtml
    ? '<div class="an-strat-section an-strat-section-purple">' +
        '<div class="an-strat-section-label">🎯 Langkah Pertama</div>' +
        '<div class="an-strat-steps">' + stepsHtml + '</div>' +
      '</div>'
    : '';

  var waktuHtml = strat.waktu
    ? '<div class="an-strat-waktu">⏱ ' + strat.waktu + '</div>'
    : '';

  body.innerHTML = keunggulanHtml + celahHtml + langkahHtml + waktuHtml;

  if (footer) {
    footer.innerHTML =
      '<button class="an-strat-save-btn" id="an-strat-save-btn" onclick="anSaveCurrentStrategy()">' +
        'Simpan &amp; Mulai Sekarang →' +
      '</button>';
  }
}

/* ─── Generate Strategy via SiLaris ─── */
async function _anGenerateStrategy(handle, platform, compResult, agg) {
  var supabaseUrl = (typeof RADAR_CONFIG !== 'undefined' && RADAR_CONFIG.SUPABASE_URL) || '';
  var supabaseKey = (typeof RADAR_CONFIG !== 'undefined' && RADAR_CONFIG.SUPABASE_ANON_KEY) || '';
  if (!supabaseUrl) return null;

  var platName    = (_AN_PLAT[platform] || {}).name || platform;
  var userER      = agg.avgER ? agg.avgER.toFixed(1) + '%' : 'belum tersedia';
  var compER      = compResult.comp_er     || 'tidak diketahui';
  var compFreq    = compResult.comp_freq   || 'tidak diketahui';
  var compFmt     = compResult.comp_format || 'tidak diketahui';
  var userTopFmt  = agg.topFormat          || 'Foto';

  // Konteks bisnis dari onboarding
  var _sCtx = (typeof buildSilarisContext === 'function') ? buildSilarisContext() : {};
  var bizCat = _sCtx.businessCategory || 'usaha';

  // Tentukan format yang sebaiknya dicoba user berdasarkan gap
  var compFmtLower  = compFmt.toLowerCase();
  var suggestedFmt  = compFmtLower.indexOf('reel') !== -1 || compFmtLower.indexOf('video') !== -1
    ? 'reel' : (compFmtLower.indexOf('story') !== -1 ? 'story' : 'post');

  var sysPrompt = [
    'Kamu SiLaris, AI coach UMKM Indonesia. Buat strategi ' + bizCat + ' unggul dari ' + handle + ' di ' + platName + '.',
    'WAJIB: maks 20 kata/langkah. Tanpa em-dash. Tanpa "bisnis lokal". Bahasa santai. Pakai angka nyata.',
    'Data: ER user=' + userER + ' vs pesaing=' + compER + ', format user=' + userTopFmt + ', format pesaing=' + compFmt + ', freq pesaing=' + compFreq + ', reach=' + _anFmtK(agg.totalReach || 0) + '.',
    'PENTING: "user" = pemilik bisnis ' + bizCat + ' (BUKAN ' + handle + '). "pesaing" = ' + handle + '.',
    'Return JSON: {"keunggulan":"1 kalimat: ER kamu ' + userER + ' vs ER ' + handle + ' ' + compER + ' — pakai angka ini","celah":"1 kalimat gap format/freq konkret yang bisa dimanfaatkan sekarang","langkah":["Langkah 1: buat ' + compFmt + ' tentang ' + bizCat + ' hari ini","Langkah 2: frekuensi optimal vs ' + handle + ' yang posting ' + compFreq + '","Langkah 3: diferensiasi konten dari format ' + handle + '"],"format_rekomendasi":"' + suggestedFmt + '","waktu":"estimasi realistis"}'
  ].join('\n');

  try {
    var resp = await fetch(supabaseUrl + '/functions/v1/silaris-chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + supabaseKey },
      body: JSON.stringify({
        systemPrompt: sysPrompt,
        campaignData: { handle: handle, platform: platform },
        autoInsight: true,
        messages: []
      })
    });
    var data = await resp.json();
    if (data && data.reply) {
      var text  = data.reply.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      var start = text.indexOf('{'), end = text.lastIndexOf('}');
      if (start !== -1 && end !== -1) text = text.slice(start, end + 1);
      return JSON.parse(text);
    }
  } catch(e) {
    console.warn('[analytics] _anGenerateStrategy error:', e);
  }
  return null;
}

/* ─── Save Strategy: internal executor ─── */
function _anDoSaveStrategy(baseList) {
  if (!_anCurrentStrategyData) return;
  var entry = {
    id:         Date.now(),
    handle:     _anCurrentStrategyData.handle,
    platform:   _anCurrentStrategyData.platform,
    dateStr:    new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }),
    status:     'baru',
    strategy:   _anCurrentStrategyData.strategy,
    compResult: _anCurrentStrategyData.compResult
  };
  baseList.unshift(entry);
  if (baseList.length > 10) baseList = baseList.slice(0, 10);
  _anPersistStrategies(baseList);
  var saveBtn = document.getElementById('an-strat-save-btn');
  if (saveBtn) { saveBtn.textContent = '✓ Tersimpan!'; saveBtn.disabled = true; }
  _anRenderSavedStrategies();

  // Set strategy context for Dapur Konten pre-fill (sebelum modal tutup)
  var _sSCtx = (typeof buildSilarisContext === 'function') ? buildSilarisContext() : {};
  var _sPlatform = _anCurrentStrategyData.platform || 'ig';
  var _sFormat   = (_anCurrentStrategyData.strategy && _anCurrentStrategyData.strategy.format_rekomendasi) || 'reel';
  _anSetDapurChannel(_sPlatform, _sFormat);
  window._strategyContext = {
    handle:      _anCurrentStrategyData.handle,
    platform:    _sPlatform,
    format:      _sFormat,
    bizCat:      _sSCtx.businessCategory || '',
    strategy:    _anCurrentStrategyData.strategy || null,
    dateStr:     entry.dateStr,
    strategyId:  entry.id
  };

  // FIX 1: tutup modal segera → switch ke Dapur Konten setelah animasi selesai
  anCloseStrategyModal();
  setTimeout(function() {
    if (typeof switchMenu === 'function') switchMenu('command');
    requestAnimationFrame(function() { _anApplyStrategyContext(); });
  }, 230);
}

/* ─── Save Strategy: replace duplicate ─── */
function _anSaveStratReplace() {
  if (!_anCurrentStrategyData) return;
  var cleanH = (_anCurrentStrategyData.handle || '').replace(/^@/, '').toLowerCase();
  var filtered = _anGetSavedStrategies().filter(function(x) {
    return (x.handle || '').replace(/^@/, '').toLowerCase() !== cleanH;
  });
  _anDoSaveStrategy(filtered);
}
window._anSaveStratReplace = _anSaveStratReplace;

/* ─── Save Strategy: keep both ─── */
function _anSaveStratKeepBoth() {
  _anDoSaveStrategy(_anGetSavedStrategies());
}
window._anSaveStratKeepBoth = _anSaveStratKeepBoth;

/* ─── Save Strategy to localStorage ─── */
function anSaveCurrentStrategy() {
  if (!_anCurrentStrategyData) return;
  var strategies = _anGetSavedStrategies();
  // FIX 5: cek duplikat — handle sama (case-insensitive, strip @)
  var cleanH = (_anCurrentStrategyData.handle || '').replace(/^@/, '').toLowerCase();
  var existing = strategies.find(function(x) {
    return (x.handle || '').replace(/^@/, '').toLowerCase() === cleanH;
  });
  if (existing) {
    // Tampilkan confirm di footer modal
    var footer = document.getElementById('an-strat-footer');
    if (footer) {
      footer.innerHTML =
        '<div class="an-strat-dup-msg">Kamu sudah punya strategi untuk <strong>' + (existing.handle || cleanH) + '</strong>.</div>' +
        '<div class="an-strat-dup-btns">' +
          '<button class="an-strat-dup-btn" onclick="_anSaveStratReplace()">Timpa yang Lama</button>' +
          '<button class="an-strat-dup-btn an-strat-dup-btn-outline" onclick="_anSaveStratKeepBoth()">Simpan Baru</button>' +
        '</div>';
    }
    return;
  }
  _anDoSaveStrategy(strategies);
}
window.anSaveCurrentStrategy = anSaveCurrentStrategy;

/* ─── Delete Saved Strategy ─── */
function anDeleteStrategy(id) {
  var strategies = _anGetSavedStrategies().filter(function(s) { return s.id !== id; });
  _anPersistStrategies(strategies);
  _anRenderSavedStrategies();
}
window.anDeleteStrategy = anDeleteStrategy;

/* ─── Toggle Strategy Status (⚪ baru → 🔵 sedang → ✅ selesai) ─── */
function anToggleStratStatus(id) {
  var strategies = _anGetSavedStrategies();
  var s = strategies.find(function(x) { return x.id === id; });
  if (!s) return;
  var cycle = { baru: 'sedang', sedang: 'selesai', selesai: 'baru' };
  s.status = cycle[s.status || 'baru'] || 'sedang';
  _anPersistStrategies(strategies);
  _anRenderSavedStrategies();
}
window.anToggleStratStatus = anToggleStratStatus;

/* ─── Helper: set Dapur Konten globals dari platform+format ─── */
function _anSetDapurChannel(platform, format) {
  // Map dari _AN_PLAT key (ig/meta/tiktok/youtube) ke activeChannel
  var channelMap = { ig: 'instagram', meta: 'meta', tiktok: 'tiktok', youtube: 'youtube' };
  var ch = channelMap[platform] || 'instagram';
  var fmt = format || 'reel';

  if (typeof activeChannel !== 'undefined') activeChannel = ch;
  if (typeof activeFormat  !== 'undefined') activeFormat  = fmt;
  if (typeof channelIdx !== 'undefined' && typeof channelOrder !== 'undefined') {
    var idx = channelOrder.indexOf(ch);
    channelIdx = idx >= 0 ? idx : 0;
  }
  // Set activePlatform
  var fmtMap = (typeof CHANNEL_FORMAT_MAP !== 'undefined' && CHANNEL_FORMAT_MAP[ch]) || { reel: 'ig-reel', post: 'ig-post', story: 'ig-story' };
  var platKey = fmtMap.single || fmtMap[fmt] || fmtMap.reel || fmtMap.post || 'ig-reel';
  if (typeof activePlatform !== 'undefined') activePlatform = platKey;
  return { ch: ch, fmt: fmt, platKey: platKey };
}

/* ─── Launch Iklan from Saved Strategy ─── */
function anLaunchFromStrat(id) {
  var strategies = _anGetSavedStrategies();
  var s = strategies.find(function(x) { return x.id === id; });

  var platform = (s && s.platform) || 'ig';
  var format   = (s && s.strategy && s.strategy.format_rekomendasi) || 'reel';
  var handle   = (s && s.handle)   || '';
  var _sCtx    = (typeof buildSilarisContext === 'function') ? buildSilarisContext() : {};
  var bizCat   = _sCtx.businessCategory || '';

  _anSetDapurChannel(platform, format);

  // FIX 2: ubah status ke 'sedang' saat user klik "Buat Iklan Sekarang" dari daftar tersimpan
  if (s && s.status === 'baru') {
    s.status = 'sedang';
    _anPersistStrategies(strategies);
    _anRenderSavedStrategies();
  }

  window._strategyContext = {
    handle:     handle,
    platform:   platform,
    format:     format,
    bizCat:     bizCat,
    strategy:   (s && s.strategy)  || null,
    dateStr:    (s && s.dateStr)   || null,
    strategyId: id
  };
  if (typeof switchMenu === 'function') switchMenu('command');
  requestAnimationFrame(function() { _anApplyStrategyContext(); });
}
window.anLaunchFromStrat = anLaunchFromStrat;

/* ─── Launch Iklan from Strategy Step button (inline) ─── */
function anLaunchFromStratStep(platform, format, handle) {
  var _sCtx  = (typeof buildSilarisContext === 'function') ? buildSilarisContext() : {};
  var bizCat = _sCtx.businessCategory || '';
  _anSetDapurChannel(platform, format);
  window._strategyContext = {
    handle:   handle,
    platform: platform,
    format:   format,
    bizCat:   bizCat,
    strategy: _anCurrentStrategyData && _anCurrentStrategyData.strategy || null,
    dateStr:  null  // fresh analysis, dateStr akan di-set oleh _anDoSaveStrategy jika disimpan
  };
  // tutup modal DULU, baru tampilkan Dapur Konten
  anCloseStrategyModal();
  setTimeout(function() {
    if (typeof switchMenu === 'function') switchMenu('command');
    requestAnimationFrame(function() { _anApplyStrategyContext(); });
  }, 230);
}
window.anLaunchFromStratStep = anLaunchFromStratStep;

/* ─── Apply strategy context ke Dapur Konten setelah switchMenu ─── */
function _anApplyStrategyContext() {
  var ctx = window._strategyContext;
  if (!ctx) return;

  // Update channel badge teks
  var chNames = { instagram: 'Instagram', meta: 'Facebook', tiktok: 'TikTok', youtube: 'YouTube' };
  var ch = (typeof activeChannel !== 'undefined') ? activeChannel : 'instagram';
  var badge = document.getElementById('previewLabel');
  if (badge) badge.textContent = chNames[ch] || 'Instagram';

  // Format selector visibility
  var hasFmt = (ch === 'instagram' || ch === 'meta');
  var fmtSel = document.getElementById('formatSelector');
  if (fmtSel) fmtSel.style.display = hasFmt ? 'flex' : 'none';

  // Format buttons active state
  if (hasFmt) {
    var fmt = (typeof activeFormat !== 'undefined') ? activeFormat : 'reel';
    document.querySelectorAll('.format-btn').forEach(function(b) {
      b.classList.toggle('active', b.getAttribute('data-format') === fmt);
    });
  }

  // Phone shell + labels
  if (typeof applyShell === 'function' && typeof activePlatform !== 'undefined') applyShell(activePlatform);
  if (typeof _updateLivePreviewLabel === 'function') _updateLivePreviewLabel();
  if (typeof updateCaptionPlatformLabel === 'function') updateCaptionPlatformLabel();
  if (typeof updateReach === 'function') updateReach();

  // Pre-fill caption (200ms — setelah shell/platform sudah applied)
  setTimeout(function() {
    if (typeof captionAltIndex !== 'undefined') captionAltIndex = 0;
    if (typeof generateCaption === 'function' && typeof currentPersona !== 'undefined' && currentPersona) {
      generateCaption(false);  // pakai template dengan platform yang sudah di-set
    } else {
      // Fallback: isi starter text yang kaya dari strategy context (FIX 3)
      var area = document.getElementById('captionArea');
      if (area) {
        var _fmtNames3 = { reel: 'Reel', post: 'Foto/Post', story: 'Story' };
        var _platNames3 = { ig: 'Instagram', meta: 'Facebook', tiktok: 'TikTok', youtube: 'YouTube' };
        var _d3 = typeof getDialek === 'function' ? getDialek() : { greeting: 'Halo' };
        var _sCtx3 = (typeof buildSilarisContext === 'function') ? buildSilarisContext() : {};
        var _fmtLbl3  = _fmtNames3[ctx.format]   || ctx.format   || 'konten';
        var _platLbl3 = _platNames3[ctx.platform] || ctx.platform || 'Instagram';
        var _bizName3 = _sCtx3.businessName || '';
        var _bizCat3  = ctx.bizCat || _sCtx3.businessCategory || 'usahaku';
        var _locEl3   = document.querySelector('.popup-loc');
        var _kota3    = _locEl3 ? _locEl3.textContent.trim().split(',')[0] : (_sCtx3.regionLabel || '');
        var _kotaSlug = _kota3 ? _kota3.toLowerCase().replace(/\s+/g, '') : '';

        var _richPrompt =
          'Buat caption ' + _platLbl3 + ' ' + _fmtLbl3 + ' untuk ' +
          (_bizName3 ? _bizName3 + ' yang bergerak di bidang ' : '') + _bizCat3 +
          (_kota3 ? ' di ' + _kota3 : '') +
          ' — gunakan sapaan \'' + _d3.greeting + '\' di awal, ' +
          '3-4 kalimat, tone hangat dan mengundang, ' +
          'sertakan 5-7 hashtag campuran lokal ' +
          (_kotaSlug ? '(#' + _kotaSlug + 'food #' + _kotaSlug + 'kuliner) ' : '') +
          'dan umum (#kuliner #makananenak), akhiri dengan call to action';

        area.value = _richPrompt;
      }
    }
  }, 200);

  // FIX 3: tampilkan strategy context modal 300ms setelah Dapur Konten terbuka
  setTimeout(function() { _anShowStrategyContextModal(ctx); }, 300);
}
window._anApplyStrategyContext = _anApplyStrategyContext;

/* ─── FIX 3: Strategy Context Modal (menggantikan banner kuning) ─── */
function _anShowStrategyContextModal(ctx) {
  var existing = document.getElementById('an-strat-ctx-modal');
  if (existing) existing.remove();
  if (!ctx || !ctx.handle) return;

  var handle    = ctx.handle.startsWith('@') ? ctx.handle : '@' + ctx.handle;
  var fmtNames  = { reel: 'Reel', post: 'Foto/Post', story: 'Story' };
  var platNames = { ig: 'Instagram', meta: 'Facebook', tiktok: 'TikTok', youtube: 'YouTube' };
  var fmtName   = fmtNames[ctx.format]   || ctx.format   || 'Konten';
  var platName  = platNames[ctx.platform] || ctx.platform || 'Instagram';
  var bizCat    = ctx.bizCat  || 'usahamu';
  var dateStr   = ctx.dateStr || new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
  var d         = typeof getDialek === 'function' ? getDialek() : { greeting: 'Halo' };

  // Keunggulan: dari strategy data jika tersedia, fallback ke ER
  var agg = window._anLastAgg || {};
  var keunggulan = (ctx.strategy && ctx.strategy.keunggulan)
    ? ctx.strategy.keunggulan
    : (agg.avgER ? 'ER kamu ' + agg.avgER.toFixed(1) + '% — modal yang kuat untuk ungguli pesaing.' : null);

  var modal = document.createElement('div');
  modal.id = 'an-strat-ctx-modal';
  modal.className = 'an-strat-ctx-overlay';
  modal.innerHTML =
    '<div class="an-strat-ctx-sheet">' +
      '<div class="an-strat-ctx-header">' +
        '<div class="an-strat-ctx-title">🎯 Strategi vs ' + handle + '</div>' +
        '<div class="an-strat-ctx-sub">Dibuat oleh SiLaris · ' + dateStr + '</div>' +
      '</div>' +
      '<div class="an-strat-ctx-body">' +
        (keunggulan
          ? '<div class="an-strat-ctx-row green">' +
              '<span class="an-strat-ctx-dot">✅</span>' +
              '<span class="an-strat-ctx-text"><strong>Keunggulanmu:</strong> ' + keunggulan + '</span>' +
            '</div>'
          : '') +
        '<div class="an-strat-ctx-row purple">' +
          '<span class="an-strat-ctx-dot">🎯</span>' +
          '<span class="an-strat-ctx-text"><strong>Langkah hari ini:</strong> Buat <strong>' + fmtName + '</strong> tentang <strong>' + bizCat + '</strong> di <strong>' + platName + '</strong> dengan sapaan &ldquo;<em>' + d.greeting + '</em>&rdquo; &mdash; caption sudah disiapkan untukmu.</span>' +
        '</div>' +
      '</div>' +
      '<div class="an-strat-ctx-footer">' +
        '<button class="an-strat-ctx-btn-primary" onclick="_anStratCtxStart()">Mulai Buat Iklan →</button>' +
        '<button class="an-strat-ctx-btn-secondary" onclick="_anStratCtxSkip()">Lewati</button>' +
      '</div>' +
    '</div>';

  document.body.appendChild(modal);
  // TIDAK bisa ditutup klik overlay — intentional (user harus sadar pakai strategi)
  // ESC = sama dengan Lewati
  var _escFn = function(e) { if (e.key === 'Escape') _anStratCtxSkip(); };
  modal._escFn = _escFn;
  document.addEventListener('keydown', _escFn);
}
window._anShowStrategyContextModal = _anShowStrategyContextModal;

/* ─── Mulai Buat Iklan (dari Strategy Context Modal) ─── */
function _anStratCtxStart() {
  var modal = document.getElementById('an-strat-ctx-modal');
  if (modal) {
    if (modal._escFn) document.removeEventListener('keydown', modal._escFn);
    modal.style.animation = 'stratFadeOut 0.2s ease forwards';
    setTimeout(function() { if (modal.parentNode) modal.remove(); }, 220);
  }
  // FIX 1: override genBtn → gunakan AI caption generator dalam strategy context
  var genBtn = document.getElementById('genBtn');
  if (genBtn) {
    genBtn.disabled = false;
    genBtn.onclick  = function() { _anStratGenerateCaption(); };
  }

  // FIX 4: tampilkan nudge upload foto jika belum ada foto (350ms, setelah modal animasi)
  setTimeout(function() {
    if (!window._strategyContext) return;
    var hasPhoto  = typeof uploadedDataURL  !== 'undefined' && !!uploadedDataURL;
    var hasPhotos = typeof uploadedDataURLs !== 'undefined' && uploadedDataURLs.length > 0;
    if (hasPhoto || hasPhotos) return; // sudah ada foto, tidak perlu nudge

    var uz = document.getElementById('uploadZone');
    if (!uz || document.getElementById('an-strat-upload-nudge')) return;

    var nudge = document.createElement('div');
    nudge.id        = 'an-strat-upload-nudge';
    nudge.className = 'an-strat-upload-nudge';
    nudge.textContent = '📸 Upload foto produkmu untuk hasil caption yang lebih personal dan spesifik. SiLaris akan membantumu membuatnya jadi lebih baik.';
    uz.parentNode.insertBefore(nudge, uz.nextSibling);

    // Auto-hilang ketika user upload foto (MutationObserver pada #thumbs)
    var thumbsEl = document.getElementById('thumbs');
    if (thumbsEl) {
      var _nudgeObs = new MutationObserver(function() {
        var n = document.getElementById('an-strat-upload-nudge');
        if (n) { n.style.animation = 'stratFadeOut 0.2s ease forwards'; setTimeout(function() { if (n.parentNode) n.remove(); }, 220); }
        _nudgeObs.disconnect();
      });
      _nudgeObs.observe(thumbsEl, { childList: true, attributes: true, attributeFilter: ['style'] });
    }
  }, 350);
}
window._anStratCtxStart = _anStratCtxStart;

/* ─── Lewati (dari Strategy Context Modal) ─── */
function _anStratCtxSkip() {
  var modal = document.getElementById('an-strat-ctx-modal');
  if (modal) {
    if (modal._escFn) document.removeEventListener('keydown', modal._escFn);
    modal.style.animation = 'stratFadeOut 0.2s ease forwards';
    setTimeout(function() { if (modal.parentNode) modal.remove(); }, 220);
  }
  // Hapus strategy context + clear caption
  window._strategyContext = null;
  var area = document.getElementById('captionArea');
  if (area) area.value = '';
  // Restore genBtn ke behavior default
  var genBtn = document.getElementById('genBtn');
  if (genBtn) {
    genBtn.disabled = false;
    genBtn.onclick  = function() { if (typeof generateCaption === 'function') generateCaption(true); };
  }
}
window._anStratCtxSkip = _anStratCtxSkip;

/* ─── FIX 1: Generate caption baru via AI dalam strategy context ─── */
async function _anStratGenerateCaption() {
  var area   = document.getElementById('captionArea');
  var genBtn = document.getElementById('genBtn');
  if (!area) return;

  var ctx         = window._strategyContext;
  var currentText = area.value.trim();

  // Jika tidak ada strategy context tapi persona ada: cycle template biasa
  if (!ctx && typeof currentPersona !== 'undefined' && currentPersona) {
    if (typeof generateCaption === 'function') generateCaption(true);
    return;
  }

  var supabaseUrl = (typeof RADAR_CONFIG !== 'undefined' && RADAR_CONFIG.SUPABASE_URL) || '';
  var supabaseKey = (typeof RADAR_CONFIG !== 'undefined' && RADAR_CONFIG.SUPABASE_ANON_KEY) || '';
  if (!supabaseUrl) {
    // Fallback: cycle template
    if (typeof generateCaption === 'function') generateCaption(true);
    return;
  }

  if (genBtn) { genBtn.disabled = true; genBtn.textContent = '⏳ Generating...'; }

  var fmtNames  = { reel: 'Reel', post: 'Foto/Post', story: 'Story' };
  var platNames = { ig: 'Instagram', meta: 'Facebook', tiktok: 'TikTok', youtube: 'YouTube' };
  var fmtName   = ctx ? (fmtNames[ctx.format]   || ctx.format   || 'Konten')    : 'Konten';
  var platName  = ctx ? (platNames[ctx.platform] || ctx.platform || 'Instagram') : 'Instagram';
  var bizCat    = ctx ? (ctx.bizCat  || 'usaha') : 'usaha';
  var handle    = ctx ? (ctx.handle  || '') : '';
  var d = typeof getDialek === 'function' ? getDialek() : { greeting: 'Halo', cta: 'kunjungi' };

  var sysPrompt = [
    'Kamu SiLaris, AI coach UMKM Indonesia. Tulis 1 caption ' + fmtName + ' ' + platName + ' untuk ' + bizCat + '.',
    'WAJIB: teks caption saja, mulai “' + d.greeting + '”, 3-5 hashtag di akhir, bahasa santai, maks 280 karakter.',
    (currentText ? 'Inspirasi: ' + currentText : ''),
    (handle ? 'Bersaing dengan ' + handle + '.' : '')
  ].filter(Boolean).join(' ');

  try {
    var resp = await fetch(supabaseUrl + '/functions/v1/silaris-chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + supabaseKey },
      body: JSON.stringify({
        systemPrompt: sysPrompt,
        campaignData: { format: fmtName, platform: platName },
        autoInsight: true,
        messages: []
      })
    });
    var data = await resp.json();
    if (data && data.reply) {
      var caption = data.reply.trim().replace(/^["']|["']$/g, '');
      if (typeof typewriterEffect === 'function') {
        typewriterEffect(caption);
      } else {
        area.value = caption;
      }
    } else {
      // Fallback: cycle template
      if (typeof generateCaption === 'function') generateCaption(true);
    }
  } catch(e) {
    console.warn('[analytics] _anStratGenerateCaption error:', e);
    if (typeof generateCaption === 'function') generateCaption(true);
  }

  if (genBtn) { genBtn.disabled = false; genBtn.textContent = 'Generate ulang'; }
}
window._anStratGenerateCaption = _anStratGenerateCaption;

/* ─── Inject strategy context banner di Dapur Konten ─── */
function _anInjectStrategyBanner(ctx) {
  var old = document.getElementById('an-strat-banner');
  if (old) old.remove();
  if (!ctx || !ctx.handle) return;

  var fmtNames  = { reel: 'Reel', post: 'Foto/Post', story: 'Story' };
  var platNames = { ig: 'Instagram', meta: 'Facebook', tiktok: 'TikTok', youtube: 'YouTube' };
  var handle    = ctx.handle.startsWith('@') ? ctx.handle : '@' + ctx.handle;
  var fmtName   = fmtNames[ctx.format]   || ctx.format   || 'Konten';
  var platName  = platNames[ctx.platform] || ctx.platform || 'Instagram';
  var bizLabel  = ctx.bizCat || 'usahamu';

  var banner = document.createElement('div');
  banner.id = 'an-strat-banner';
  banner.className = 'an-strat-context-banner';
  banner.innerHTML =
    '<div class="an-strat-banner-inner">' +
      '<span class="an-strat-banner-icon">📋</span>' +
      '<div class="an-strat-banner-content">' +
        '<div class="an-strat-banner-title">Strategi vs ' + handle + '</div>' +
        '<div class="an-strat-banner-text">Buat <strong>' + fmtName + '</strong> tentang <strong>' + bizLabel + '</strong> di <strong>' + platName + '</strong> — ungguli pesaing ini.</div>' +
      '</div>' +
      '<button class="an-strat-banner-close" onclick="_anDismissStrategyBanner()" title="Tutup panduan">✕</button>' +
    '</div>';

  var cmdView = document.getElementById('view-command');
  if (cmdView) cmdView.insertBefore(banner, cmdView.firstChild);
}
window._anInjectStrategyBanner = _anInjectStrategyBanner;

/* ─── Dismiss strategy banner ─── */
function _anDismissStrategyBanner() {
  var banner = document.getElementById('an-strat-banner');
  if (banner) {
    banner.style.animation = 'stratFadeOut 0.2s ease forwards';
    setTimeout(function() { if (banner.parentNode) banner.remove(); }, 220);
  }
  window._strategyContext = null;
}
window._anDismissStrategyBanner = _anDismissStrategyBanner;

/* ─── Render Saved Strategies Card ─── */
var _anStratShowAll = false;
function _anRenderSavedStrategies(showAll) {
  if (showAll !== undefined) _anStratShowAll = !!showAll;
  var wrap = document.getElementById('an-saved-strategies-wrap');
  if (!wrap) return;
  var strategies = _anGetSavedStrategies();
  if (!strategies.length) { wrap.innerHTML = ''; return; }

  var PAGE     = 3;
  var displayed = _anStratShowAll ? strategies : strategies.slice(0, PAGE);
  var hasMore   = !_anStratShowAll && strategies.length > PAGE;

  var statusIcons  = { baru: '⚪', sedang: '🔵', selesai: '✅' };
  var statusLabels = { baru: 'Baru', sedang: 'Berjalan', selesai: 'Selesai' };

  var itemsHtml = displayed.map(function(s) {
    var platName   = (_AN_PLAT[s.platform] || {}).name || s.platform;
    // keunggulan jika AI baru (field baru), fallback ke judul (field lama)
    var judul      = (s.strategy && (s.strategy.keunggulan || s.strategy.judul)) || '';
    var firstStep  = (s.strategy && s.strategy.langkah && s.strategy.langkah[0]) || '';
    var status     = s.status || 'baru';
    var statusIcon  = statusIcons[status]  || '⚪';
    var statusLabel = statusLabels[status] || 'Baru';
    var isSelesai   = status === 'selesai';

    return '<div class="an-saved-strat-item">' +
      '<div class="an-saved-strat-top">' +
        '<span class="an-saved-strat-status" onclick="anToggleStratStatus(' + s.id + ')" title="Klik untuk ubah status">' + statusIcon + ' ' + statusLabel + '</span>' +
        '<span class="an-saved-strat-handle">' + (s.handle || '') + '</span>' +
        '<span class="an-saved-strat-plat">' + platName + '</span>' +
        '<span class="an-saved-strat-date">' + (s.dateStr || '') + '</span>' +
        '<button class="an-saved-strat-del" onclick="anDeleteStrategy(' + s.id + ')" title="Hapus">✕</button>' +
      '</div>' +
      (judul     ? '<div class="an-saved-strat-judul">' + judul + '</div>' : '') +
      (firstStep ? '<div class="an-saved-strat-preview">' + firstStep + '</div>' : '') +
      '<div class="an-saved-strat-actions">' +
        '<button class="an-saved-strat-act-btn an-saved-strat-act-launch" onclick="anLaunchFromStrat(' + s.id + ')">🚀 Buat Iklan Sekarang</button>' +
        '<button class="an-saved-strat-act-btn an-saved-strat-act-done' + (isSelesai ? ' done' : '') + '" onclick="anToggleStratStatus(' + s.id + ')">' +
          (isSelesai ? '✅ Selesai' : '✓ Tandai Selesai') +
        '</button>' +
      '</div>' +
    '</div>';
  }).join('');

  var showMoreHtml = hasMore
    ? '<button class="an-saved-strat-show-more" onclick="_anRenderSavedStrategies(true)">Lihat semua ' + strategies.length + ' strategi →</button>'
    : (_anStratShowAll && strategies.length > PAGE
        ? '<button class="an-saved-strat-show-more" onclick="_anRenderSavedStrategies(false)">← Lebih sedikit</button>'
        : '');

  wrap.innerHTML =
    '<div class="an-saved-strat-card">' +
      '<div class="an-saved-strat-header" onclick="this.parentElement.classList.toggle(\'open\')">' +
        '<div class="an-saved-strat-title">💾 Strategi Tersimpan <span class="an-saved-strat-count">' + strategies.length + '</span></div>' +
        '<svg class="an-saved-strat-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" width="14" height="14"><polyline points="6 9 12 15 18 9"/></svg>' +
      '</div>' +
      '<div class="an-saved-strat-body">' + itemsHtml + showMoreHtml + '</div>' +
    '</div>';
}
window._anRenderSavedStrategies = _anRenderSavedStrategies;

/* ─── Call SiLaris for Competitor ─── */
async function _callSilarisCompetitor(handle, platform, agg) {
  var supabaseUrl = (typeof RADAR_CONFIG !== 'undefined' && RADAR_CONFIG.SUPABASE_URL) || '';
  var supabaseKey = (typeof RADAR_CONFIG !== 'undefined' && RADAR_CONFIG.SUPABASE_ANON_KEY) || '';
  if (!supabaseUrl) return null;

  var platName = (_AN_PLAT[platform] || {}).name || platform;
  var sysPrompt = [
    'Kamu SiLaris, AI coach UMKM Indonesia. Analisa estimatif akun ' + platName + ': ' + handle + '.',
    'WAJIB: maks 20 kata/insight. Tanpa em-dash. Tanpa "bisnis lokal". Bahasa santai.',
    'Data user: campaign=' + (agg.total || 0) + ', ER=' + (agg.avgER ? agg.avgER.toFixed(1) + '%' : '-') + ', reach=' + _anFmtK(agg.totalReach) + '.',
    'comp_category: WAJIB deteksi HANYA dari kata kunci eksplisit di username/handle. DILARANG KERAS menebak dari nama kota (jogja/jakarta/bali/dll), angka (60s/70s/dll), nama orang, atau kata umum yang tidak spesifik. Jika tidak ada keyword kategori yang JELAS di username → WAJIB kosongkan. Cek berurutan: (1) hotel/resort/penginapan/villa/homestay/bnb→"hotel & akomodasi" [BUKAN properti]. (2) resto/warung/food/bakso/nasi/makan/rm/mie→"kuliner" [BUKAN retail]. (3) kafe/coffee/kopi/boba/minuman/espresso→"kafe" [BUKAN kuliner]. (4) fashion/hijab/baju/outfit/clothing/batik/thrift→"fashion" [BUKAN retail]. (5) salon/beauty/skincare/makeup/kosmetik/spa/nail/lash→"beauty" [BUKAN jasa]. (6) barber/barbershop/cukur/pangkas→"barber" [BUKAN beauty atau jasa]. (7) gym/fitness/olahraga/sport/yoga/futsal/badminton→"olahraga" [BUKAN kesehatan]. (8) klinik/dokter/kesehatan/apotek/herbal/wellness/medis→"kesehatan" [BUKAN retail]. (9) wisata/travel/tur/destinasi/liburan/piknik→"wisata" [BUKAN jasa, BUKAN karena nama kota]. (10) properti/rumah/kost/kontrakan/ruko/kavling/realestate→"properti" [BUKAN hotel]. (11) motor/bengkel/mobil/otomotif/sparepart/variasi→"otomotif". (12) kursus/les/sekolah/pendidikan/training/bimbel/kampus→"pendidikan". (13) museum/galeri/art/seni/budaya/pameran/exhibition→"seni budaya" [BUKAN komunitas]. (14) komunitas/community/club/squad/organisasi/yayasan/paguyuban/base→"komunitas" [BUKAN seni budaya]. (15) musik/band/dj/entertainment/konser/manggung→"hiburan". (16) foto/photography/photographer/studio/kamera→"fotografi". (17) wedding/pernikahan/bridal/weddingorganizer/dekorasi→"wedding & event". (18) pet/hewan/anjing/kucing/vet/grooming→"pet". (19) media/berita/news/konten/podcast/contentcreator→"media & konten". (20) teknologi/startup/digital/app/software/developer/it→"teknologi". (21) jasa/konsultan/laundry/reparasi/sablon/percetakan→"jasa". (22) toko/retail/shop/olshop/store/market→"retail". INGAT: nama kota atau angka saja BUKAN kategori → kosongkan.',
    'comp_format: hanya dari jenis post (image/video/reel/carousel). "Tidak tersedia" jika tidak tahu.',
    'Return JSON bersih: {"comp_handle":"@x","comp_category":"","comp_freq":"Nx/week","comp_followers":"XXK","comp_format":"...","insights":[{"type":"green","text":"..."},{"type":"red","text":"..."},{"type":"purple","text":"..."}]}'
  ].join('\n');

  try {
    var resp = await fetch(supabaseUrl + '/functions/v1/silaris-chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + supabaseKey },
      body: JSON.stringify({
        systemPrompt: sysPrompt,
        campaignData: { handle: handle, platform: platform },
        autoInsight: true,
        messages: []
      })
    });
    var data = await resp.json();
    // Log seluruh response (bukan Object — langsung stringify supaya bisa dibaca tanpa expand)
    console.log('[RADAR] silaris-chat HTTP status:', resp.status);
    console.log('[RADAR] silaris-chat full data:', JSON.stringify(data).slice(0, 500));
    if (data && data.error) console.error('[RADAR] silaris-chat error field:', data.error);

    // Coba beberapa field name (berbeda versi silaris-chat bisa return field berbeda)
    var replyText = data && (data.reply || data.message || data.content || data.text || data.result);
    if (replyText) {
      var text = replyText
        .replace(/```json\n?/g, '').replace(/```\n?/g, '')
        .trim();
      var start = text.indexOf('{'), end = text.lastIndexOf('}');
      if (start !== -1 && end !== -1) text = text.slice(start, end + 1);
      var parsed = JSON.parse(text);
      console.log('[RADAR] _callSilarisCompetitor result:', parsed);
      return parsed;
    }
    // Deteksi rate limit error → return sentinel object supaya UI bisa tampilkan pesan spesifik
    var errStr = data && data.error ? String(data.error) : '';
    if (errStr.indexOf('rate_limit') !== -1 || errStr.indexOf('429') !== -1 || errStr.indexOf('Rate Limit') !== -1) {
      // Ambil waktu tunggu dari pesan error jika ada ("try again in Xm Ys")
      var waitMatch = errStr.match(/try again in ([^.]+)/i);
      var waitMsg   = waitMatch ? waitMatch[1].trim() : 'beberapa menit';
      return { __rateLimitError: true, waitMsg: waitMsg };
    }
    console.warn('[RADAR] no usable reply. Full data keys:', data ? Object.keys(data).join(', ') : 'null');
  } catch(e) {
    console.error('[RADAR] _callSilarisCompetitor error:', e.message || e);
  }
  return null;
}

/* ─── Empty State ─── */
function _renderAnalyticsEmpty(container) {
  container.innerHTML =
    '<div style="display:flex;align-items:center;justify-content:center;width:100%;flex:1;min-height:400px;">' +
    '<div style="display:flex;flex-direction:column;align-items:center;text-align:center;gap:16px;max-width:400px;padding:40px 20px;">' +
      '<svg width="120" height="120" viewBox="0 0 120 120" fill="none">' +
        '<circle cx="60" cy="60" r="50" fill="#f5f3ff"/>' +
        '<rect x="30" y="75" width="12" height="20" rx="3" fill="#e9d5ff"/>' +
        '<rect x="48" y="60" width="12" height="35" rx="3" fill="#c4b5fd"/>' +
        '<rect x="66" y="45" width="12" height="50" rx="3" fill="#7c3aed"/>' +
        '<path d="M28 40 Q45 25 60 35 Q75 45 88 28" stroke="#7c3aed" stroke-width="2.5" stroke-linecap="round" fill="none" stroke-dasharray="4 3"/>' +
      '</svg>' +
      '<h3 style="font-size:18px;font-weight:600;color:#1a1a2e;margin:0;font-family:var(--font,sans-serif);">Belum ada data untuk dianalisis</h3>' +
      '<p style="font-size:14px;color:#6b7280;line-height:1.6;margin:0;font-family:var(--font,sans-serif);">Mulai dengan buat iklan pertamamu. SiLaris akan langsung analisis pola dan kasih rekomendasi terbaik!</p>' +
      '<button onclick="switchMenu(\'command\')" class="an-empty-cta">🚀 Buat Iklan Pertama</button>' +
    '</div>' +
    '</div>';
}

/* ─── Helper: safe DOM replace ─── */
function _anReplace(id, html) {
  var el = document.getElementById(id);
  if (!el) return;
  var wrap = document.createElement('div');
  wrap.innerHTML = html;
  var newNode = wrap.firstChild;
  if (newNode) el.parentNode.replaceChild(newNode, el);
}

/* ─── waitForCampaigns — poll until window.CAMPAIGNS is ready ─── */
function waitForCampaigns(callback) {
  var loaded = window.CAMPAIGNS_LOADED === true;
  var hasCampaigns = window.CAMPAIGNS && window.CAMPAIGNS.length > 0;
  if (hasCampaigns || loaded) {
    callback(window.CAMPAIGNS || []);
  } else {
    setTimeout(function() { waitForCampaigns(callback); }, 500);
  }
}

/* ─── initAnalytics() — entry point ─── */
function initAnalytics() {
  var container = document.getElementById('view-analytics');
  if (!container) return;

  // Auto-refresh 24 jam: kalau sudah lewat, refresh dulu (skip render lanjut)
  if (_anCheckAutoRefresh()) return;

  // KPI dulu (full-width), lalu 2-col layout (63% left / 37% right sticky)
  // Left:  SiLaris · Campaign Terbaik · Local Pulse · Rekomendasi · Competitor
  // Right: Mood Audiens · Platform Terkuat (sticky saat scroll)
  // Bottom: Upgrade Pro (full-width, paling bawah)
  container.innerHTML =
    '<div class="an-dashboard-wrap">' +
      '<div class="an-freshness-bar">' +
        '<span class="an-freshness-note">Data diperbarui setiap 15 menit · Metrics baru dari platform bisa butuh hingga 24 jam untuk muncul</span>' +
        '<div class="an-ts-row">' +
          '<span id="an-metrics-ts" class="an-ts-label"></span>' +
          '<button id="an-refresh-btn" class="an-refresh-btn" onclick="refreshAnalyticsData()" title="Refresh data">' +
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="13" height="13"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/></svg>' +
          '</button>' +
        '</div>' +
      '</div>' +
      _renderStatCardsSkeleton() +
      '<div class="an-two-main-cols">' +
        '<div class="an-col-main">' +
          _renderSilarisNarasi() +
          _renderCardSkeleton('an-camp-wrap') +
          _renderCardSkeleton('an-pulse-wrap') +
          _renderRekomendasiWeek() +
          _renderCompetitorSection() +
        '</div>' +
        '<div class="an-col-side">' +
          _renderCardSkeleton('an-mood-wrap') +
          _renderCardSkeleton('an-plat-wrap') +
        '</div>' +
      '</div>' +
      _renderUpgradePro() +
    '</div>';

  waitForCampaigns(async function(campaigns) {
    var hasPublished = campaigns.some(function(c) { return !!c.post_id; });
    if (!campaigns.length || !hasPublished) {
      _renderAnalyticsEmpty(container);
      return;
    }

    var agg = _anAggregate(campaigns);
    window._anLastAgg = agg;

    _anReplace('an-sc-wrap',   _renderStatCards(agg));
    _anReplace('an-camp-wrap', _renderCampaignBest(agg));
    _anReplace('an-mood-wrap', _renderMoodAudiens(agg));
    _anReplace('an-pulse-wrap',_renderLocalPulse(agg));
    _anReplace('an-plat-wrap', _renderPlatformTerkuat(agg));
    _anRenderSavedStrategies();

    // Update ER explainer dengan label kualitatif dari agg
    var erExpEl = document.getElementById('an-er-explainer-text');
    if (erExpEl) {
      var erLblExp = _anErLabel(agg.avgER);
      if (agg.avgER != null) {
        var erPct = agg.avgER.toFixed(1);
        erExpEl.innerHTML = 'Kenapa konten kamu dinilai <strong>' + erLblExp.label + '</strong>? ' +
          'ER ' + erPct + '% artinya dari setiap 100 orang yang melihat, ada ' + erPct + ' interaksi terjadi, ' +
          'ini jauh di atas rata-rata dan sangat positif.';
      } else {
        erExpEl.innerHTML = 'Engagement Rate adalah ukuran seberapa banyak orang yang tidak sekadar lihat kontenmu, ' +
          'tapi langsung like, komen, atau share. Makin tinggi, makin banyak yang tertarik.';
      }
    }

    // Metrics timestamp
    var nowIso = new Date().toISOString();
    var mtsEl = document.getElementById('an-metrics-ts');
    if (mtsEl) mtsEl.textContent = 'Diperbarui ' + _anRelTime(nowIso);

    // Narasi: check Supabase cache (TTL 1 jam), fallback to fresh Groq call
    var userId = await _anEnsureAnonUser();
    var aggSnap = { totalReach: agg.totalReach, avgER: agg.avgER, total: agg.total };

    var narasiCache = await _anGetCache(userId, 'narasi');
    var useCache = narasiCache && !_anNeedsRegenerate(agg, narasiCache.agg_snapshot);

    if (useCache) {
      console.log('[analytics] narasi from cache, created:', narasiCache.created_at);
      _anPopulateAI(narasiCache.payload, narasiCache.created_at, agg);
    } else {
      _callSilarisAnalytics(agg)
        .then(async function(ai) {
          var result = ai || _buildAnalyticsFallback(agg);
          var tsNow = new Date().toISOString();
          _anPopulateAI(result, tsNow, agg);
          await _anSetCache(userId, 'narasi', result, aggSnap, 60);
        })
        .catch(async function() {
          var result = _buildAnalyticsFallback(agg);
          var tsNow = new Date().toISOString();
          _anPopulateAI(result, tsNow, agg);
          await _anSetCache(userId, 'narasi', result, aggSnap, 60);
        });
    }
  });
}

/* ─── Pricing Modal ─── */
function showPricingModal() {
  var existing = document.getElementById('an-pricing-modal');
  if (existing) { existing.style.display = 'flex'; return; }

  var modal = document.createElement('div');
  modal.id = 'an-pricing-modal';
  modal.className = 'an-pricing-overlay';
  modal.innerHTML =
    '<div class="an-pricing-sheet">' +
    '<div class="an-pricing-header">' +
      '<div><div class="an-pricing-title">Pilih Paket Larisi</div><div class="an-pricing-subtitle">Mulai gratis, upgrade kapan saja</div></div>' +
      '<button class="an-pricing-close" onclick="closePricingModal()">✕</button>' +
    '</div>' +
    '<div class="an-pricing-cards">' +
      // Freemium
      (function() {
        var profile = {};
        try { profile = JSON.parse(localStorage.getItem('radar_user_profile') || '{}'); } catch(e) {}
        var isFreemium = !profile.payment_status || profile.payment_status === 'trial' || profile.payment_status === 'free';
        return '<div class="an-pricing-card">' +
          '<div class="an-pc-top"><div class="an-pc-name">Freemium</div><div class="an-pc-price">Gratis <span class="an-pc-period">selamanya</span></div></div>' +
          '<ul class="an-pc-features"><li>10 AI Launch/bulan</li><li>AI Vision &amp; Master Persona</li><li>4 channel publishing</li><li>Geo-Radar Targeting</li><li>Smart Geo Stitching</li></ul>' +
          (isFreemium
            ? '<button class="an-pc-btn an-pc-btn-outline" disabled style="opacity:0.5;cursor:default;">Paket Aktif</button>'
            : '<button class="an-pc-btn an-pc-btn-outline" onclick="closePricingModal()">Mulai Freemium</button>') +
        '</div>';
      })() +
      // Starter
      '<div class="an-pricing-card">' +
        '<div class="an-pc-top"><div class="an-pc-name">Starter</div><div class="an-pc-price">Rp 99rb <span class="an-pc-period">/bulan</span></div><div class="an-pc-badge-free">Coba 7 hari gratis</div></div>' +
        '<ul class="an-pc-features"><li>50 AI Launch/bulan</li><li>Semua fitur Freemium</li><li>Dedicated Generate</li></ul>' +
        '<button class="an-pc-btn an-pc-btn-outline" onclick="closePricingModal()">Coba Gratis 7 Hari</button>' +
      '</div>' +
      // Pro
      '<div class="an-pricing-card an-pricing-card-pro">' +
        '<div class="an-pc-top"><div style="display:flex;align-items:center;gap:8px;"><div class="an-pc-name">Pro</div><div class="an-pc-badge-popular">Paling Populer</div></div><div class="an-pc-price">Rp 199rb <span class="an-pc-period">/bulan</span></div><div class="an-pc-badge-free">Coba 7 hari gratis</div></div>' +
        '<ul class="an-pc-features"><li>Unlimited AI Launch</li><li>Competitor analysis tanpa batas</li><li>Data real-time per jam</li><li>Export laporan PDF</li></ul>' +
        '<button class="an-pc-btn an-pc-btn-pro" onclick="closePricingModal()">Coba Gratis 7 Hari</button>' +
      '</div>' +
      // Enterprise
      '<div class="an-pricing-card">' +
        '<div class="an-pc-top"><div class="an-pc-name">Enterprise</div><div class="an-pc-price">Custom</div></div>' +
        '<ul class="an-pc-features"><li>Unlimited AI Launch</li><li>Multi-akun klien</li><li>White-label dashboard</li><li>Dedicated support</li></ul>' +
        '<button class="an-pc-btn an-pc-btn-dark" onclick="closePricingModal()">Hubungi Kami</button>' +
      '</div>' +
    '</div>' +
    '</div>';

  document.body.appendChild(modal);
  modal.addEventListener('click', function(e) { if (e.target === modal) closePricingModal(); });
}

function closePricingModal() {
  var modal = document.getElementById('an-pricing-modal');
  if (modal) modal.style.display = 'none';
}
window.closePricingModal = closePricingModal;

/* ─── exportPDF() ─── */
async function exportPDF() {
  try {
    var jsPDFLib = (window.jspdf && window.jspdf.jsPDF) || window.jsPDF;
    if (!jsPDFLib) { console.warn('[analytics] jsPDF tidak tersedia'); return; }
    var doc = new jsPDFLib();
    var y = 20, lh = 7;
    var now = new Date();
    var camps = (typeof CAMPAIGNS !== 'undefined') ? CAMPAIGNS.filter(function(c) { return !c.isDemo; }) : [];
    doc.setFontSize(18); doc.setFont('helvetica', 'bold'); doc.setTextColor(0);
    doc.text('RADAR — Analytics Dashboard', 20, y); y += 10;
    doc.setFontSize(10); doc.setFont('helvetica', 'normal'); doc.setTextColor(100);
    doc.text('Dibuat: ' + now.toLocaleDateString('id-ID', { day:'numeric', month:'long', year:'numeric' }), 20, y); y += 12;
    if (camps.length) {
      doc.setFontSize(12); doc.setFont('helvetica', 'bold'); doc.setTextColor(0);
      doc.text('Campaign (' + camps.length + ')', 20, y); y += lh;
      camps.slice(0, 10).forEach(function(c) {
        if (y > 255) { doc.addPage(); y = 20; }
        doc.setFontSize(10); doc.setFont('helvetica', 'bold'); doc.setTextColor(0);
        doc.text(c.name || c.nama_campaign || 'Campaign', 20, y); y += lh - 1;
        doc.setFontSize(9); doc.setFont('helvetica', 'normal'); doc.setTextColor(80);
        doc.text('Platform: ' + (c.platforms || []).join(', ') + ' · Area: ' + (c.kecamatan || '—'), 22, y); y += lh + 1;
      });
    }
    doc.setFontSize(8); doc.setTextColor(150);
    doc.text('Dibuat oleh RADAR · radar.id', 20, 285);
    var df = now.getFullYear() + String(now.getMonth()+1).padStart(2,'0') + String(now.getDate()).padStart(2,'0');
    doc.save('radar-analytics-' + df + '.pdf');
  } catch(e) { console.error('[analytics] exportPDF error:', e); }
}

/* ─── Backward Compat ─── */
function renderAnalytics() { initAnalytics(); }
function handleExport()    { exportPDF(); }
function handleUpgrade()   { showPricingModal(); }
