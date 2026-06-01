import { SUPABASE_URL, SUPABASE_ANON_KEY } from './config';
import { parseSafeDate } from './campaigns';
export function anFmtK(n) {
  if (n == null || isNaN(n) || n === 0) return '—';
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
  if (n >= 1000)    return Math.round(n / 1000) + 'K';
  return String(Math.round(n));
}

export function anFmtPct(v) {
  if (v == null || isNaN(v)) return '—';
  return parseFloat(v).toFixed(1) + '%';
}

export function anErLabel(er) {
  if (er == null || isNaN(er)) return { label: 'Belum ada data', sub: 'Belum ada data ER' };
  if (er > 100) return { label: 'Luar biasa 🔥',  sub: 'Konten kamu sangat disukai' };
  if (er >= 10) return { label: 'Sangat bagus ⭐', sub: 'Konten kamu bekerja dengan baik' };
  if (er >= 3)  return { label: 'Bagus 👍',        sub: 'Konten kamu mulai dapat perhatian' };
  return              { label: 'Berkembang 🌱',    sub: 'Masih ada ruang untuk tumbuh' };
}

export function anDelta(current, previous) {
  if (current === 0 && previous === 0) return null;
  if (previous === 0) return { text: 'Bulan pertama, terus semangat!', cls: 'neutral' };
  const pct = Math.round(((current - previous) / previous) * 100);
  if (pct > 0)  return { text: '↑ ' + pct + '% vs bulan lalu', cls: 'up' };
  if (pct < 0)  return { text: '↓ ' + Math.abs(pct) + '% vs bulan lalu', cls: 'down' };
  return              { text: '→ Sama seperti bulan lalu', cls: 'neutral' };
}

export const AN_PLAT = {
  ig:      { name: 'Instagram', color: '#E1306C' },
  meta:    { name: 'Facebook',  color: '#1877F2' },
  tiktok:  { name: 'TikTok',    color: '#010101' },
  youtube: { name: 'YouTube',   color: '#FF0000' }
};

function stitchSimilarity(a, b) {
  const wa = a.toLowerCase().replace(/[^\w\s]/g, '').split(/\s+/).filter(Boolean);
  const wb = b.toLowerCase().replace(/[^\w\s]/g, '').split(/\s+/).filter(Boolean);
  if (!wa.length || !wb.length) return 0;
  let inter = 0;
  wa.forEach(w => { if (wb.includes(w)) inter++; });
  const union = wa.length + wb.length - inter;
  return union > 0 ? inter / union : 0;
}

export function anAggregate(campaigns) {
  const real = (campaigns || []).filter(c => !c.isDemo);
  let totalReach = 0, totalPaidReach = 0, activeCount = 0, reachCount = 0;
  const erValues = [];
  let bestCamp = null, bestER = -1;
  const platStats = {};
  let rLove = 0, rLike = 0, rHaha = 0, rWow = 0;
  const hourBuckets   = new Array(24).fill(0);
  const hourBucketER  = new Array(24).fill(0);
  const dayBuckets    = new Array(7).fill(0);
  const stitchCandidates = [];
  const formatCount = {};

  let _bestAbsEng = 0;
  const _now = new Date();
  const _thisMonthStart = new Date(_now.getFullYear(), _now.getMonth(), 1).getTime();
  const _lastMonthStart = new Date(_now.getFullYear(), _now.getMonth() - 1, 1).getTime();
  let reachThisMonth = 0, reachLastMonth = 0;
  let countThisMonth = 0, countLastMonth = 0;

  real.forEach(c => {
    if (c.status === 'running') activeCount++;

    const eng = c._engagement || {};
    const reach = (eng.reach != null && !isNaN(eng.reach)) ? Number(eng.reach) : 0;
    totalReach += reach;
    if (reach > 0) reachCount++;
    totalPaidReach += (eng.paidReach || 0);

    let er = 0;
    if (reach > 0) {
      er = ((eng.likes || 0) + (eng.comments || 0) + (eng.shares || 0)) / reach * 100;
      if (er > 0) erValues.push(er);
    }

    const absEng = (eng.likes || 0) + (eng.comments || 0) + (eng.shares || 0);
    if (absEng > _bestAbsEng) {
      _bestAbsEng = absEng;
      bestCamp    = c;
      bestER      = er;
    }

    rLove += (eng.reactionsLove || 0);
    rHaha += (eng.reactionsHaha || 0);
    rWow  += (eng.reactionsWow  || 0);
    const totalLikes = eng.likes || 0;
    rLike += Math.max(0, totalLikes - (eng.reactionsLove || 0) - (eng.reactionsHaha || 0) - (eng.reactionsWow || 0));

    (c.platforms || []).forEach(p => {
      if (!platStats[p]) platStats[p] = { count: 0, erTotal: 0, erCount: 0 };
      platStats[p].count++;
      if (er > 0) { platStats[p].erTotal += er; platStats[p].erCount++; }
    });

    const fmt = eng.format || c.format || 'post';
    formatCount[fmt] = (formatCount[fmt] || 0) + 1;

    const ts = c.created_at ? parseSafeDate(c.created_at) : null;
    if (ts && !isNaN(ts.getTime())) {
      const h = ts.getHours();
      hourBuckets[h]++;
      if (er > 0) hourBucketER[h] += er;
      dayBuckets[ts.getDay()]++;
      const tsMs = ts.getTime();
      if (tsMs >= _thisMonthStart) {
        reachThisMonth += reach;
        countThisMonth++;
      } else if (tsMs >= _lastMonthStart) {
        reachLastMonth += reach;
        countLastMonth++;
      }
    }

    const caption = eng.caption || c.caption || '';
    if (caption && er > 0) {
      stitchCandidates.push({ text: caption, er: er, campaign: c });
    }
  });

  const avgER = erValues.length ? erValues.reduce((s, v) => s + v, 0) / erValues.length : null;
  const maxHourCount  = Math.max(...hourBuckets);
  const bestHour      = maxHourCount > 0 ? hourBuckets.indexOf(maxHourCount) : 19;
  const maxHourER     = Math.max(...hourBucketER);
  const bestHourER    = maxHourER > 0 ? hourBucketER.indexOf(maxHourER) : bestHour;
  const dayNames  = ['Minggu','Senin','Selasa','Rabu','Kamis','Jumat','Sabtu'];
  const maxDayCount  = Math.max(...dayBuckets);
  const bestDayIdx   = maxDayCount > 0 ? dayBuckets.indexOf(maxDayCount) : 2;
  const distinctDays = dayBuckets.filter(v => v > 0).length;

  const STITCH_MIN_ER  = 50;
  const STITCH_SIM_THR = 0.8;
  stitchCandidates.sort((a, b) => b.er - a.er);
  const stitchFiltered = stitchCandidates.filter(s => s.er >= STITCH_MIN_ER);
  const stitchDeduped  = [];
  stitchFiltered.forEach(s => {
    const isDup = stitchDeduped.some(d => stitchSimilarity(s.text, d.text) >= STITCH_SIM_THR);
    if (!isDup) stitchDeduped.push(s);
  });

  const platList = Object.keys(platStats).map(p => {
    const s = platStats[p];
    return { key: p, count: s.count, avgER: s.erCount > 0 ? s.erTotal / s.erCount : 0 };
  }).sort((a, b) => b.avgER - a.avgER || b.count - a.count);

  const topFmt = Object.keys(formatCount).sort((a, b) => formatCount[b] - formatCount[a])[0] || 'post';
  const fmtLabels = { reel: 'Video Reel', post: 'Foto dengan teks', story: 'Story 9:16' };

  const totalReact = rLove + rLike + rHaha + rWow;
  const moodData = [
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
    reachCount: reachCount,
    avgER: avgER,
    bestCamp: bestCamp,
    bestER: bestER,
    platList: platList,
    moodData: moodData,
    totalReact: totalReact,
    hasMoodData: totalReact > 0,
    bestHour:   bestHour,
    bestHourER: bestHourER,
    bestDay: dayNames[bestDayIdx],
    distinctDays: distinctDays,
    topFormat: fmtLabels[topFmt] || topFmt,
    stitchCandidates: stitchDeduped.slice(0, 3),
    reachThisMonth:  reachThisMonth,
    reachLastMonth:  reachLastMonth,
    countThisMonth:  countThisMonth,
    countLastMonth:  countLastMonth,
    hasPrevPeriod:   reachLastMonth > 0,
    reachTrend:      reachLastMonth > 0 ? Math.round(((reachThisMonth - reachLastMonth) / reachLastMonth) * 100) : null
  };
}

export function anRelTime(isoStr) {
  if (!isoStr) return '';
  const d = parseSafeDate(isoStr);
  if (isNaN(d.getTime())) return '';
  const diff = Math.floor((Date.now() - d.getTime()) / 1000);
  if (diff < 60)    return 'baru saja';
  if (diff < 3600)  return Math.floor(diff / 60) + ' menit lalu';
  if (diff < 86400) return Math.floor(diff / 3600) + ' jam lalu';
  return Math.floor(diff / 86400) + ' hari lalu';
}

export async function anGetCache(userId, cacheType) {
  if (!userId) return null;
  try {
    const resp = await fetch(
      `${SUPABASE_URL}/rest/v1/analytics_cache?select=*&user_id=eq.${userId}&cache_type=eq.${cacheType}&expires_at=gt.${new Date().toISOString()}`,
      { headers: { 'apikey': SUPABASE_ANON_KEY, 'Authorization': `Bearer ${SUPABASE_ANON_KEY}` } }
    );
    if (resp.ok) {
      const data = await resp.json();
      return data[0] || null;
    }
  } catch(e) {
    console.warn('[analytics] cache get error:', e);
  }
  return null;
}

export async function anSetCache(userId, cacheType, payload, aggSnapshot, ttlMinutes) {
  if (!userId) return;
  try {
    const expiresAt = new Date(Date.now() + ttlMinutes * 60 * 1000).toISOString();
    await fetch(
      `${SUPABASE_URL}/rest/v1/analytics_cache`,
      {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'resolution=merge-duplicates'
        },
        body: JSON.stringify({ user_id: userId, cache_type: cacheType, payload: payload, agg_snapshot: aggSnapshot, expires_at: expiresAt })
      }
    );
  } catch(e) {
    console.warn('[analytics] cache set error:', e);
  }
}

export function anNeedsRegenerate(agg, snapshot) {
  if (!snapshot) return true;
  const reachDiff = Math.abs(agg.totalReach - (snapshot.totalReach || 0)) / (snapshot.totalReach || 1);
  const erDiff    = Math.abs((agg.avgER || 0) - (snapshot.avgER || 0)) / (snapshot.avgER || 1);
  const reachBig  = Math.abs(agg.totalReach - (snapshot.totalReach || 0)) > 500;
  const erBig     = Math.abs((agg.avgER || 0) - (snapshot.avgER || 0)) > 5;
  return (reachDiff > 0.2 && reachBig) || (erDiff > 0.2 && erBig);
}

function buildAnalyticsSystemPrompt(agg, profile) {
  const bizName     = profile?.business_name || profile?.full_name || 'Kamu';
  const bizCategory = profile?.business_category || null;

  const iklanCount  = agg.countThisMonth > 0 ? agg.countThisMonth : agg.total;
  const erVal       = agg.avgER != null ? agg.avgER : null;
  const erTier      = erVal == null ? 'unknown' : erVal >= 10 ? 'high' : erVal >= 3 ? 'mid' : 'low';
  const erDisplay   = erVal != null ? erVal.toFixed(1) + '%' : 'belum tersedia';

  const topPlatKey  = agg.platList.length ? agg.platList[0].key : 'ig';
  const topPlatName = (AN_PLAT[topPlatKey] || {}).name || 'Instagram';
  const _bm         = { ig: '0.48%', meta: '0.15%', tiktok: '3.70%' };
  const benchmark   = _bm[topPlatKey] || '0.48%';

  const trendLine   = agg.hasPrevPeriod
    ? 'Reach ' + (agg.reachTrend >= 0 ? '\u2191' : '\u2193') + ' ' + Math.abs(agg.reachTrend) + '% dari bulan lalu.'
    : '📊 Tren mulai terhitung periode depan.';

  const bestIklan   = agg.bestCamp
    ? (agg.bestCamp.name || agg.bestCamp.nama_campaign || 'iklan terbaik')
    : null;

  const reachDisplay = agg.totalReach > 0 ? anFmtK(agg.totalReach) : '0';
  const bestHourStr  = String(agg.bestHour).padStart(2, '0');

  const platSummary = agg.platList.map(p => {
    const pn = (AN_PLAT[p.key] || {}).name || p.key;
    return pn + ': ' + p.count + ' iklan' + (p.avgER > 0 ? ', avg ER ' + p.avgER.toFixed(1) + '%' : '');
  }).join('; ') || 'belum ada';

  const p2Instruction = erTier === 'high' || erTier === 'mid'
    ? 'Jelaskan KENAPA ER setinggi ini: konten relevan, orang yang lihat langsung bereaksi, bukan scroll lewat.' +
      (bestIklan ? ` Sebutkan iklan "${bestIklan}" sebagai contoh konkret, engagement rate-nya jadi bukti nyata.` : ' Tanda sudah bicara ke audiens yang tepat dengan pesan yang tepat.')
    : erTier === 'low'
    ? 'Jelaskan: ER masih bisa ditingkatkan dengan konten lebih relevan ke audiens lokal, coba variasi format atau sapaan lokal khas daerah.'
    : 'Jelaskan: belum cukup data untuk menilai ER karena reach masih sangat sedikit. Ajak tambah lebih banyak iklan.';

  const clueTodoInstruction = bestIklan
    ? `Tulis langsung ke user: Boost "${bestIklan}" dengan Rp 20-50rb selama 3 hari, iklan dengan engagement tertinggi kamu, paling efisien diperkuat minggu ini.`
    : `Berikan 1 aksi konkret berdasarkan platform ${topPlatName} dengan ER tertinggi.`;

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
    `- Nama bisnis: ${bizName}`,
    `- Kategori: ${bizCategory || 'Umum'}`,
    `- Total iklan: ${agg.total}`,
    `- Iklan bulan ini: ${iklanCount}`,
    `- Total reach REAL (N/A tidak dihitung): ${reachDisplay}`,
    `- Avg ER (formula: reactions+comments+shares / reach × 100): ${erDisplay} (tier: ${erTier})`,
    `- Benchmark avg ER ${topPlatName}: ${benchmark} (Socialinsider 2025)`,
    `- Paid reach: ${agg.totalPaidReach > 0 ? anFmtK(agg.totalPaidReach) : '0'}`,
    `- Iklan terbaik: ${bestIklan ? `"${bestIklan}"` : 'belum ada'}`,
    `- Platform aktif: ${platSummary}`,
    `- Tren: ${trendLine}`,
    `- Periode pertama: ${agg.hasPrevPeriod ? 'tidak' : 'ya, belum ada data pembanding'}`,
    bizCategory ? `- PENTING: Saran dan hashtag WAJIB relevan dengan industri "${bizCategory}".` : '',
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
    `  Buka PERSIS dengan: "${bizName}, kamu di jalur yang tepat! 🎯"`,
    `  Kalimat 2: sebutkan ${iklanCount} iklan, ${reachDisplay} orang reach organik,` +
      (erVal != null
        ? ` ER ${erDisplay} jauh di atas rata-rata ${topPlatName} ${benchmark}.`
        : ' ER belum bisa dihitung karena data reach masih terlalu sedikit.'),
    '',
    'narasi_p2 (maks 2 kalimat):',
    `  ${p2Instruction}`,
    '',
    'narasi_p3 (maks 2 kalimat, konteks jujur + empati):',
    `  Normalize angka kecil: reach organik ${topPlatName} memang terbatas, rata-rata hanya 3-4% dari followers per post.`,
    `  ${reachDisplay} reach di bulan pertama itu normal dan sehat. Fondasi sudah kuat.`,
    `  WAJIB akhiri narasi_p3 dengan kalimat: "${trendLine}"`,
    '',
    'clue_potensi (box kiri "Artinya untuk bisnismu", 1 kalimat):',
    '  Kualitas konten sudah terbukti. Tantangan berikutnya bukan buat konten lebih bagus, tapi lebih banyak orang yang melihatnya.',
    '',
    'clue_todo (box kanan "Yang bisa dilakukan sekarang", 1 kalimat):',
    `  ${clueTodoInstruction}`,
    '',
    'narasi_footer (teks kecil di bawah kotak, 1 kalimat):',
    '  "Data akan semakin akurat setelah lebih banyak iklan berjalan."',
    '',
    'TUGAS: Buat response JSON persis berikut (tanpa markdown, tanpa teks di luar JSON):',
    '{',
    `  "narasi_p1": "${bizName}, kamu di jalur yang tepat + data real. Maks 2 kalimat.",`,
    '  "narasi_p2": "penjelasan kenapa performa seperti ini. Maks 2 kalimat.",',
    '  "narasi_p3": "konteks jujur + empati + tutup dengan tren. Maks 2 kalimat.",',
    '  "clue_potensi": "kualitas sudah terbukti, tantangan berikutnya distribusi. 1 kalimat.",',
    `  "clue_todo": "${bestIklan ? `aksi spesifik sebut \\"${bestIklan}\\"` : 'aksi berbasis platform'}. 1 kalimat.",`,
    '  "narasi_footer": "Data akan semakin akurat setelah lebih banyak iklan berjalan.",',
    '  "mood_insight": "1 kalimat dari pola reaksi audiens.",',
    '  "platform_insight": "1 kalimat, sebut nama platform.",',
    '  "stitch_insight": "1 kalimat pola caption terkuat.",',
    '  "rekomendasi": [',
    `    {"platform": "${topPlatKey}", "hari": "${agg.bestDay}", "jam": "${bestHourStr}:00", "aksi": "aksi spesifik ${topPlatName}", "alasan": "alasan dari data real"},`,
    '    {"platform": "meta", "hari": "Rabu", "jam": "12:00", "aksi": "aksi spesifik Facebook", "alasan": "alasan konkret"},',
    '    {"platform": "tiktok", "hari": "Jumat", "jam": "20:00", "aksi": "aksi spesifik TikTok", "alasan": "alasan konkret"}',
    '  ],',
    '  "rekom_cta": "Buat Iklan Baru Sekarang"',
    '}'
  ].join('\n');
}

export async function callSilarisAnalytics(agg, profile) {
  try {
    const resp = await fetch(SUPABASE_URL + '/functions/v1/silaris-chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + SUPABASE_ANON_KEY },
      body: JSON.stringify({
        systemPrompt: buildAnalyticsSystemPrompt(agg, profile),
        campaignData: { aggregate: true, total: agg.total, avgER: agg.avgER, active: agg.active },
        autoInsight: true,
        messages: []
      })
    });
    const data = await resp.json();
    if (data && data.reply) {
      let text = data.reply.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      const start = text.indexOf('{');
      const end = text.lastIndexOf('}');
      if (start !== -1 && end !== -1) text = text.slice(start, end + 1);
      return JSON.parse(text);
    }
  } catch(e) {
    console.warn('[analytics] callSilarisAnalytics error:', e);
  }
  return null;
}

export function buildAnalyticsFallback(agg, profile) {
  const bizName     = profile?.business_name || profile?.full_name || 'Kamu';
  const erTier      = agg.avgER == null ? 'unknown' : agg.avgER >= 10 ? 'high' : agg.avgER >= 3 ? 'mid' : 'low';
  const erDisplay   = agg.avgER != null ? agg.avgER.toFixed(1) + '%' : null;
  const iklanCount  = agg.countThisMonth > 0 ? agg.countThisMonth : agg.total;
  const topPlatKey  = agg.platList.length ? agg.platList[0].key : 'ig';
  const topPlatName = (AN_PLAT[topPlatKey] || {}).name || 'Instagram';
  const _bm         = { ig: '0.48%', meta: '0.15%', tiktok: '3.70%' };
  const benchmark   = _bm[topPlatKey] || '0.48%';
  const reachDisplay = agg.totalReach > 0 ? anFmtK(agg.totalReach) : '0';
  const bestIklan   = agg.bestCamp
    ? (agg.bestCamp.name || agg.bestCamp.nama_campaign || 'iklan terbaik')
    : null;

  const trendLine = agg.hasPrevPeriod
    ? 'Reach ' + (agg.reachTrend >= 0 ? '↑' : '↓') + ' ' + Math.abs(agg.reachTrend) + '% dari bulan lalu.'
    : '📊 Tren mulai terhitung periode depan.';

  const p1 = `${bizName}, kamu di jalur yang tepat! 🎯 ${iklanCount} iklan berjalan bulan ini, ${reachDisplay} orang sudah tahu bisnis kamu secara organik` +
    (erDisplay ? `, dan ER kamu ${erDisplay}, jauh di atas rata-rata ${topPlatName} ${benchmark}.` : '.');

  const p2 = erTier === 'high' || erTier === 'mid'
    ? `Kenapa ER kamu setinggi ini? Karena konten kamu relevan, orang yang lihat langsung bereaksi, bukan scroll lewat.` +
      (bestIklan ? ` Iklan "${bestIklan}" jadi buktinya, engagement rate-nya jauh melampaui rata-rata ${topPlatName}.` : ' Ini tanda kamu sudah bicara ke audiens yang tepat dengan pesan yang tepat.')
    : erTier === 'low'
    ? 'ER masih bisa ditingkatkan dengan konten yang lebih relevan ke audiens lokal. Coba variasi format atau tambahkan sapaan lokal untuk meningkatkan engagement.'
    : 'Belum cukup data untuk menilai performa konten karena reach masih sangat sedikit. Tambah lebih banyak iklan agar analisis semakin akurat.';

  const p3 = `Yang perlu diketahui: reach organik ${topPlatName} memang terbatas, rata-rata hanya 3-4% dari followers per post. ${reachDisplay} reach itu normal dan sehat untuk bisnis yang baru aktif di media sosial, fondasi kamu sudah kuat. ${trendLine}`;

  const clueTodo = bestIklan
    ? `Boost "${bestIklan}" dengan Rp 20-50rb selama 3 hari, iklan dengan engagement tertinggi kamu, paling efisien diperkuat minggu ini.`
    : 'Konsistensi adalah kunci. Terus posting dengan frekuensi yang sama dan pantau konten mana yang paling banyak di-engage.';

  return {
    narasi_p1:      p1,
    narasi_p2:      p2,
    narasi_p3:      p3,
    clue_potensi:   'Kualitas konten sudah terbukti. Tantangan berikutnya bukan buat konten lebih bagus, tapi lebih banyak orang yang melihatnya.',
    clue_todo:      clueTodo,
    narasi_footer:  'Data akan semakin akurat setelah lebih banyak iklan berjalan.',
    mood_insight:   'Audiens kamu merespons dengan baik. Pertahankan tone dan format yang sudah terbukti bekerja.',
    platform_insight: `Kamu paling aktif di ${topPlatName}. Pertahankan konsistensi di platform ini.`,
    stitch_insight: 'Caption dengan sapaan lokal dan teks overlay personal terbukti meningkatkan engagement.',
    rekomendasi: [
      { platform: topPlatKey, hari: agg.bestDay || 'Selasa',
        jam: String(agg.bestHour || 19).padStart(2,'0') + ':00',
        aksi: 'Post konten dengan sapaan lokal di caption',
        alasan: `Jam ${String(agg.bestHour || 19).padStart(2,'0')}:00 adalah waktu dengan aktivitas iklan tertinggi kamu` },
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
