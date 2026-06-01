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

/* ─── Streak Mingguan ─── */
export function anStreak(campaigns) {
  if (!campaigns || !campaigns.length) return { weeks: 0, thisWeek: false, totalWeeks: 0 };
  const getWeekStart = (d) => {
    const date = new Date(d.getTime());
    const day = date.getDay();
    date.setDate(date.getDate() - (day === 0 ? 6 : day - 1));
    date.setHours(0, 0, 0, 0);
    return date.getTime();
  };
  const weekStarts = new Set();
  campaigns.forEach(c => {
    const d = parseSafeDate(c.created_at);
    if (!isNaN(d.getTime())) weekStarts.add(getWeekStart(d));
  });
  const now = new Date();
  const thisWeekStart = getWeekStart(now);
  const WEEK_MS = 7 * 24 * 60 * 60 * 1000;
  const thisWeek = weekStarts.has(thisWeekStart);
  const lastWeek = weekStarts.has(thisWeekStart - WEEK_MS);
  let streak = 0;
  let check = thisWeek ? thisWeekStart : (lastWeek ? thisWeekStart - WEEK_MS : null);
  if (check) { while (weekStarts.has(check)) { streak++; check -= WEEK_MS; } }
  return { weeks: streak, thisWeek, totalWeeks: weekStarts.size };
}

/* ─── Frekuensi Posting ─── */
export function anPostingFreq(agg) {
  const perMonth = agg.countThisMonth || 0;
  const ideal = { ig: 12, meta: 8, tiktok: 20, youtube: 4 };
  const topPlat = agg.platList?.[0]?.key || 'ig';
  return { perMonth, ideal: ideal[topPlat] || 8, platform: topPlat };
}

/* ─── Milestone Definitions ─── */
const MILESTONE_DEFS = [
  { key: 'first_post',    label: 'Iklan Pertama! 🎉',        desc: 'Kamu berhasil buat dan posting iklan pertama lewat Larisi. Perjalanan dimulai dari sini.',             check: a => a.total >= 1,             val: a => a.total },
  { key: 'reach_100',     label: '100 Orang Terjangkau! 🎯', desc: 'Iklan organikmu sudah dilihat lebih dari 100 orang tanpa iklan berbayar. Ini awal yang solid.',      check: a => a.totalReach >= 100,      val: a => a.totalReach },
  { key: 'reach_1000',    label: '1.000 Reach Organik! 🚀',  desc: 'Ribuan orang sudah tahu bisnismu lewat konten organik saja. Saatnya pertimbangkan boost.',           check: a => a.totalReach >= 1000,     val: a => a.totalReach },
  { key: 'first_comment', label: 'Komentar Pertama! 💬',     desc: 'Ada yang meluangkan waktu untuk berkomentar — tanda audiens mulai tertarik dan terlibat.',           check: a => (a.bestCamp?._engagement?.comments || 0) > 0, val: () => 1 },
  { key: 'er_bagus',      label: 'ER di Atas Rata-rata! ⭐', desc: 'Engagement rate kamu melampaui rata-rata platform. Artinya kontenmu relevan dan disukai audiens.',   check: a => a.avgER != null && a.avgER >= 3, val: a => a.avgER },
  { key: 'total_5',       label: '5 Iklan Berjalan! 📱',     desc: '5 iklan sudah tayang — konsistensi mulai terbentuk. Algoritma platform menyukai pebisnis aktif.',   check: a => a.total >= 5,             val: a => a.total },
  { key: 'total_10',      label: '10 Iklan! Konsisten! 🔥',  desc: '10 iklan adalah bukti nyata konsistensi. Kamu termasuk pebisnis yang aktif di platform sosial.',     check: a => a.total >= 10,            val: a => a.total },
];
export function anMilestones(agg) {
  return MILESTONE_DEFS.filter(m => m.check(agg)).map(m => ({ key: m.key, label: m.label, desc: m.desc, value: m.val(agg) }));
}

/* ─── Smart Calendar (3 slot minggu depan) ─── */
export function anSmartCalendar(agg) {
  const dayNames = ['Minggu','Senin','Selasa','Rabu','Kamis','Jumat','Sabtu'];
  const bestDayIdx = dayNames.indexOf(agg?.bestDay || 'Selasa');
  const bestHour = agg?.bestHour || 19;
  const topPlat = agg?.platList?.[0]?.key || 'ig';
  const months = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Ags','Sep','Okt','Nov','Des'];
  const now = new Date();
  const slots = [];
  for (let i = 1; i <= 7 && slots.length < 3; i++) {
    const d = new Date(now); d.setDate(now.getDate() + i);
    const dayIdx = d.getDay();
    const isBestDay = dayIdx === bestDayIdx;
    const isMidWeek = dayIdx === 3 && bestDayIdx !== 3;
    if (isBestDay || isMidWeek || (slots.length === 0 && i === 7)) {
      slots.push({
        label: `${dayNames[dayIdx]}, ${d.getDate()} ${months[d.getMonth()]}`,
        jam: `${String(bestHour).padStart(2,'0')}:00`,
        platform: topPlat,
        isBestDay,
      });
    }
  }
  return slots;
}

/* ─── Data-driven Rekomendasi (port dari desktop) ─── */
export function buildRekomendasiData(agg) {
  if (!agg || agg.total < 5) return null;
  const dayNames = ['Minggu','Senin','Selasa','Rabu','Kamis','Jumat','Sabtu'];
  const bestDay     = agg.bestDay || 'Kamis';
  const bestHour    = agg.bestHourER || agg.bestHour || 17;
  const bestHourStr = String(bestHour).padStart(2,'0') + ':00';
  const bestCamp    = agg.bestCamp;
  const bestName    = bestCamp ? (bestCamp.name || bestCamp.nama_campaign || null) : null;
  const rekoList    = [];

  if (agg.platList?.length) {
    const p1     = agg.platList[0];
    const p1Name = (AN_PLAT[p1.key] || {}).name || p1.key;
    rekoList.push({
      platform: p1.key,
      hari:     bestDay,
      jam:      bestHourStr,
      aksi:     bestName
        ? `Buat iklan seperti "${bestName}" di ${p1Name}`
        : `Buat iklan baru di ${p1Name} dengan format terbaikmu`,
      alasan:   p1.avgER > 0
        ? `ER rata-rata ${p1Name} kamu ${p1.avgER.toFixed(1)}%, platform terkuat`
        : `Platform dengan iklan terbanyak`,
    });

    const p2Candidates = agg.platList.filter(p => p.key !== p1.key);
    const p2 = p2Candidates[0] || (bestName && agg.totalPaidReach === 0 ? p1 : null);
    if (p2) {
      const p2Name = (AN_PLAT[p2.key] || {}).name || p2.key;
      const onSame = p2.key === p1.key;
      rekoList.push({
        platform: p2.key,
        hari:     bestDay,
        jam:      String(Math.max(0, bestHour - 1)).padStart(2,'0') + ':00',
        aksi:     onSame && bestName
          ? `Boost "${bestName}" dengan Rp 20-50rb selama 3 hari`
          : `Pertahankan konsistensi posting di ${p2Name}`,
        alasan:   `${p2.count} iklan di ${p2Name}`,
      });
    }
  }

  if ((agg.distinctDays || 0) <= 1) {
    const allDays = ['Senin','Selasa','Rabu','Kamis','Jumat','Sabtu'];
    const altDays = allDays.filter(d => d !== bestDay).slice(0,2).join(' atau ');
    rekoList.push({
      platform: 'all',
      hari:     `Coba ${altDays}`,
      jam:      '',
      aksi:     `Semua ${agg.total} iklan dibuat hari ${bestDay}. Coba hari ${altDays} untuk jangkau audiens yang aktif di hari berbeda.`,
      alasan:   'Variasi hari posting membuka segmen audiens baru',
    });
  }
  return rekoList;
}

/* ─── Competitor Helpers ─── */
export function anParseFollowers(str) {
  if (!str) return null;
  const n = parseFloat(str.replace(/[^0-9.]/g, ''));
  if (isNaN(n)) return null;
  if (/[Mm]/.test(str)) return Math.round(n * 1_000_000);
  if (/[Kk]/.test(str)) return Math.round(n * 1_000);
  return Math.round(n);
}
export function anEstCompER(followerCount, handle) {
  let base = followerCount == null ? 3.0 : followerCount < 1000 ? 6.5 : followerCount < 10000 ? 4.5 : followerCount < 100000 ? 3.0 : 1.5;
  let h = 0; const s = handle || '';
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) & 0xffff;
  return Math.max(0.5, parseFloat((base + ((h % 7) - 3) * 0.1).toFixed(1)));
}
export function anExtractHandle(raw) {
  const s = (raw || '').trim();
  const igM = s.match(/instagram\.com\/([^/?&#\s/]+)/i);
  if (igM && !/^(p|reel|reels|explore|stories)$/i.test(igM[1])) return '@' + igM[1];
  const ttM = s.match(/tiktok\.com\/@?([^/?&#\s/]+)/i);
  if (ttM) return '@' + ttM[1];
  const fbM = s.match(/facebook\.com\/([^/?&#\s/]+)/i);
  if (fbM && !/^(profile\.php|pages|groups)$/i.test(fbM[1])) return '@' + fbM[1];
  if (s.startsWith('@') || s.startsWith('http')) return s;
  return '@' + s;
}

/* ─── Call SiLaris: Competitor Analysis ─── */
export async function callSilarisCompetitor(handle, platform, agg, profile) {
  const platNames = { ig: 'Instagram', meta: 'Facebook', tiktok: 'TikTok' };
  const platName    = platNames[platform] || platform;
  const bizName     = profile?.business_name || profile?.full_name || 'User';
  const bizCategory = profile?.business_category || 'Umum';
  const systemPrompt = [
    'Kamu adalah SiLaris, AI Coach UMKM Indonesia.',
    `TUGAS: Estimasi profil publik ${handle} di ${platName} berdasarkan pengetahuanmu.`,
    `DATA USER: bisnis ${bizName} (${bizCategory}), avg ER ${agg?.avgER ? agg.avgER.toFixed(1)+'%' : 'belum ada'}.`,
    'ATURAN: Jika tidak tahu akun ini, isi comp_followers/comp_freq/comp_category sebagai null.',
    'ATURAN: JANGAN isi comp_er — akan di-override sistem.',
    'ATURAN: insights WAJIB 3 item: strategi konten mereka, peluang untuk user, hal yang perlu diwaspadai.',
    'Balas JSON persis (tanpa markdown):',
    '{"comp_handle":"' + handle + '","comp_category":null,"comp_followers":null,"comp_freq":null,"comp_format":null,',
    '"insights":[{"type":"purple","text":"..."},{"type":"green","text":"..."},{"type":"amber","text":"..."}]}'
  ].join('\n');
  try {
    const resp = await fetch(SUPABASE_URL + '/functions/v1/silaris-chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + SUPABASE_ANON_KEY },
      body: JSON.stringify({ systemPrompt, messages: [], autoInsight: true, campaignData: {} }),
    });
    const data = await resp.json();
    if (data?.reply) {
      let text = data.reply.replace(/```json\n?/g,'').replace(/```\n?/g,'').trim();
      const s = text.indexOf('{'), e = text.lastIndexOf('}');
      if (s !== -1 && e !== -1) text = text.slice(s, e + 1);
      return JSON.parse(text);
    }
  } catch(e) { console.warn('[analytics] callSilarisCompetitor:', e); }
  return null;
}

/* ─── Supabase: Milestones ─── */
export async function anGetMilestones(userId, accessToken) {
  if (!userId || !accessToken) return [];
  try {
    const r = await fetch(
      `${SUPABASE_URL}/rest/v1/user_milestones?user_id=eq.${userId}&select=milestone_key,value_at_time,created_at`,
      { headers: { 'apikey': SUPABASE_ANON_KEY, 'Authorization': `Bearer ${accessToken}` } }
    );
    if (r.ok) return await r.json();
  } catch {}
  return [];
}
export async function anSetMilestone(userId, milestoneKey, valueAtTime, accessToken) {
  if (!userId || !accessToken) return;
  try {
    await fetch(`${SUPABASE_URL}/rest/v1/user_milestones`, {
      method: 'POST',
      headers: { 'apikey': SUPABASE_ANON_KEY, 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json', 'Prefer': 'resolution=ignore-duplicates' },
      body: JSON.stringify({ user_id: userId, milestone_key: milestoneKey, value_at_time: valueAtTime }),
    });
  } catch {}
}

/* ─── Supabase: Competitor Strategies ─── */
export async function anGetStrategies(userId, accessToken) {
  if (!userId || !accessToken) return [];
  try {
    const r = await fetch(
      `${SUPABASE_URL}/rest/v1/competitor_strategies?user_id=eq.${userId}&order=created_at.desc`,
      { headers: { 'apikey': SUPABASE_ANON_KEY, 'Authorization': `Bearer ${accessToken}` } }
    );
    if (r.ok) return await r.json();
  } catch {}
  return [];
}
export async function anSaveStrategy(userId, { handle, platform, comp_result }, accessToken) {
  if (!userId || !accessToken) {
    console.warn('[anSaveStrategy] missing userId or accessToken', { userId, hasToken: !!accessToken });
    return false;
  }
  try {
    // Coba upsert dulu dengan on_conflict
    const r = await fetch(
      `${SUPABASE_URL}/rest/v1/competitor_strategies?on_conflict=user_id,handle,platform`,
      {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'Prefer': 'resolution=merge-duplicates',
        },
        body: JSON.stringify({
          user_id: userId,
          handle,
          platform,
          comp_result,
          last_refreshed_at: new Date().toISOString(),
        }),
      }
    );
    if (r.ok || r.status === 201) return true;
    // Fallback: coba INSERT biasa tanpa upsert
    const errText = await r.text();
    console.warn('[anSaveStrategy] upsert failed', r.status, errText, '— trying plain INSERT');
    const r2 = await fetch(`${SUPABASE_URL}/rest/v1/competitor_strategies`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'Prefer': 'resolution=ignore-duplicates',
      },
      body: JSON.stringify({
        user_id: userId,
        handle,
        platform,
        comp_result,
        last_refreshed_at: new Date().toISOString(),
      }),
    });
    if (r2.ok || r2.status === 201) return true;
    const err2 = await r2.text();
    console.error('[anSaveStrategy] both attempts failed', r2.status, err2);
    return false;
  } catch(e) {
    console.error('[anSaveStrategy] exception', e);
    return false;
  }
}
export async function anDeleteStrategy(id, accessToken) {
  if (!id || !accessToken) return;
  try {
    await fetch(`${SUPABASE_URL}/rest/v1/competitor_strategies?id=eq.${id}`, {
      method: 'DELETE',
      headers: { 'apikey': SUPABASE_ANON_KEY, 'Authorization': `Bearer ${accessToken}` },
    });
  } catch {}
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
