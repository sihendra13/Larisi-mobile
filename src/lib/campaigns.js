import { SUPABASE_URL, SUPABASE_ANON_KEY } from './config';

export function parseSafeDate(dStr) {
  if (!dStr) return new Date(NaN);
  let s = String(dStr).replace(' ', 'T');
  s = s.replace(/\.\d+/, '');
  if (/\+00(:00)?$/.test(s)) {
    s = s.replace(/\+00(:00)?$/, 'Z');
  } else if (!/Z$/.test(s) && !/\+|-/.test(s)) {
    s += 'Z';
  }
  return new Date(s);
}

export function fmtDate(iso) {
  if (!iso) return '';
  const d = parseSafeDate(iso);
  if (isNaN(d.getTime())) return '';
  const m = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Ags','Sep','Okt','Nov','Des'];
  return `${d.getDate()} ${m[d.getMonth()]} ${d.getFullYear()}`;
}

export function platformLabel(platforms) {
  if (!platforms || !platforms.length) return 'IG';
  const map = { ig: 'IG', instagram: 'IG', meta: 'FB', facebook: 'FB', tiktok: 'TikTok', youtube: 'YT' };
  return platforms.map(p => map[p] || p.toUpperCase()).join(', ');
}

export async function fetchCampaigns(sessionId, accessToken) {
  const sid = sessionId || (typeof window !== 'undefined' ? localStorage.getItem('radar_session_id') : null);
  if (!sid && !accessToken) return [];

  try {
    let allRows = [];
    
    if (sid) {
      try {
        const resp = await fetch(
          `${SUPABASE_URL}/rest/v1/campaigns?session_id=eq.${sid}&order=created_at.desc&limit=20`,
          { headers: { 'apikey': SUPABASE_ANON_KEY, 'Authorization': `Bearer ${SUPABASE_ANON_KEY}` } }
        );
        if (resp.ok) {
          const rows = await resp.json();
          allRows = allRows.concat(rows);
        }
      } catch (e) {}
    }

    if (accessToken) {
      let uid = null;
      try { uid = JSON.parse(atob(accessToken.split('.')[1]))?.sub || null; } catch {}
      if (uid) {
        try {
          const resp2 = await fetch(
            `${SUPABASE_URL}/rest/v1/campaigns?user_id=eq.${uid}&order=created_at.desc&limit=20`,
            { headers: { 'apikey': SUPABASE_ANON_KEY, 'Authorization': `Bearer ${accessToken}` } }
          );
          if (resp2.ok) {
            const rows2 = await resp2.json();
            allRows = allRows.concat(rows2);
          }
        } catch (e) {}
      }
    }

    const unique = [];
    const seen = new Set();
    for (const r of allRows) {
      if (!seen.has(r.id)) {
        seen.add(r.id);
        unique.push(r);
      }
    }
    
    unique.sort((a, b) => parseSafeDate(b.created_at).getTime() - parseSafeDate(a.created_at).getTime());
    return unique.slice(0, 20);
    
  } catch { return []; }
}

export async function archiveCampaign(campaignId, sessionId, accessToken) {
  try {
    await fetch(
      `${SUPABASE_URL}/rest/v1/campaigns?id=eq.${campaignId}&session_id=eq.${sessionId}`,
      {
        method: 'PATCH',
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'paused' }),
      }
    );
  } catch {}
}

export async function fetchAnalytics(socialAccountId, accessToken) {
  if (!socialAccountId || !accessToken) return [];
  try {
    const resp = await fetch(
      `${SUPABASE_URL}/functions/v1/postforme-proxy`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          endpoint: `/v1/social-account-feeds/${socialAccountId}?expand=metrics&limit=50`,
          method: 'GET',
        }),
      }
    );
    if (!resp.ok) return [];
    const data = await resp.json();
    return data?.posts || data?.data || data?.items || data?.feeds || data?.results || data?.feed || (Array.isArray(data) ? data : []);
  } catch { return []; }
}

export function extractMetrics(post, platform) {
  const m = post?.metrics || post || {};
  const plat = (platform || '').toLowerCase();

  const _rbt = (m.reactions_by_type && typeof m.reactions_by_type === 'object') ? m.reactions_by_type : {};
  let likes = 0;
  if (plat === 'meta') {
    likes = parseInt(m.reactions_total ?? m.reactions_like ?? _rbt.like ?? m.like_count ?? m.reactions ?? 0) || 0;
  } else {
    likes = parseInt(_rbt.like ?? m.like_count ?? m.likes ?? m.reactions_total ?? m.favorite_count ?? 0) || 0;
  }
  const comments = parseInt(m.comments || m.comment_count || m.reply_count || 0) || 0;
  const shares   = parseInt(m.shares || m.share_count || m.retweet_count || 0) || 0;
  const views    = parseInt(m.video_views || m.video_views_unique || m.view_count || m.views || m.play_count || m.impressions || 0) || 0;
  const saved    = parseInt(m.saved || 0) || 0;

  let reach = 0;
  if (plat === 'meta') {
    const or = parseInt(m.organic_reach || 0) || 0;
    const pr = parseInt(m.paid_reach    || 0) || 0;
    const vr = parseInt(m.viral_reach   || 0) || 0;
    const fr = parseInt(m.fan_reach     || 0) || 0;
    reach = (or + pr + vr + fr) || parseInt(m.reach || m.total_reach || 0) || 0;
  } else {
    reach = parseInt(m.reach || m.organic_reach || m.total_reach || 0) || 0;
  }

  const engagements = likes + comments + shares;
  return { likes, comments, shares, views, saved, reach, engagements };
}
export function matchPost(posts, campaign) {
  if (!posts.length) return null;
  if (campaign.platform_post_id) {
    const exact = posts.find(p => String(p.platform_post_id) === String(campaign.platform_post_id));
    if (exact) return exact;
  }
  if (campaign.post_id) {
    const exactInternal = posts.find(p => String(p.id) === String(campaign.post_id) || String(p.post_id) === String(campaign.post_id));
    if (exactInternal) return exactInternal;
  }
  if (campaign.post_url) {
    const exactUrl = posts.find(p => p.post_url === campaign.post_url || p.permalink === campaign.post_url || p.platform_url === campaign.post_url);
    if (exactUrl) return exactUrl;
  }
  if (campaign.scheduled_at || campaign.created_at) {
    const campTime = parseSafeDate(campaign.scheduled_at || campaign.created_at).getTime();
    let best = null, bestDiff = Infinity;
    for (const p of posts) {
      const pTimeStr = p.posted_at || p.published_at || p.created_at || p.scheduled_at || '';
      const t = parseSafeDate(pTimeStr).getTime();
      if (!t) continue;
      const diff = Math.abs(campTime - t);
      if (diff < bestDiff) { bestDiff = diff; best = p; }
    }
    // Toleransi dinaikkan menjadi 48 jam (48 * 60 * 60 * 1000) karena perbedaan timezone atau keterlambatan auto-post
    if (best && bestDiff <= 48 * 60 * 60 * 1000) return best;
  }

  // Lapis terakhir (sama seperti versi Desktop): Jika semua metode gagal (tidak ada URL/ID/Time yang cocok) 
  // tapi ini campaign yang punya post_id, asumsikan posts[0] (postingan terbaru) adalah iklan tersebut 
  // (Best effort agar data metrics tetap muncul)
  if (campaign.post_id && posts.length > 0) {
    return posts[0];
  }
  return null;
}

