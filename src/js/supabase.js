// RADAR — supabase.js
// Supabase Integration: session management, saveCampaign, getCampaigns

/* ─────────────────────────────────────────
   Init Supabase Client
   ───────────────────────────────────────── */
var _supabaseClient = null;

function getSupabaseClient() {
  if (_supabaseClient) return _supabaseClient;
  if (
    !RADAR_CONFIG.SUPABASE_URL ||
    !RADAR_CONFIG.SUPABASE_ANON_KEY
  ) {
    console.warn('[supabase] SUPABASE_URL atau SUPABASE_ANON_KEY belum diisi di config.js');
    return null;
  }
  _supabaseClient = supabase.createClient(
    RADAR_CONFIG.SUPABASE_URL,
    RADAR_CONFIG.SUPABASE_ANON_KEY
  );
  return _supabaseClient;
}

/* ─────────────────────────────────────────
   Authentication Functions
   ───────────────────────────────────────── */

/**
 * signUp(email, password, metadata)
 */
async function signUp(email, password, metadata) {
    const client = getSupabaseClient();
    const { data, error } = await client.auth.signUp({
        email,
        password,
        options: {
            data: metadata || {},
            emailRedirectTo: window.location.origin + '/onboarding.html'
        }
    });
    return { data, error };
}

/**
 * verifyOtp(email, token, type)
 * type can be 'signup', 'invite', 'magiclink', etc.
 */
async function verifyOtp(email, token, type = 'signup') {
    const client = getSupabaseClient();
    const { data, error } = await client.auth.verifyOtp({
        email,
        token,
        type
    });
    return { data, error };
}

/**
 * resendOtp(email, type)
 */
async function resendOtp(email, type = 'signup') {
    const client = getSupabaseClient();
    const { data, error } = await client.auth.resend({
        type,
        email,
        options: {
            emailRedirectTo: window.location.origin + '/onboarding.html'
        }
    });
    return { data, error };
}

/**
 * signIn(email, password)
 */
async function signIn(email, password) {
    const client = getSupabaseClient();
    const { data, error } = await client.auth.signInWithPassword({
        email,
        password
    });
    if (!error && data.user) {
        // Jika user berbeda dari sesi sebelumnya, bersihkan akun sosial agar tidak bocor
        try {
            const stored = JSON.parse(localStorage.getItem('radar_user_profile') || '{}');
            if (stored.id && stored.id !== data.user.id) {
                localStorage.removeItem('radar_social_accounts');
                localStorage.removeItem('radar_session_id');
            }
        } catch(e) {}
    }
    return { data, error };
}

/**
 * signOut()
 */
async function signOut() {
    const client = getSupabaseClient();
    const { error } = await client.auth.signOut();
    if (!error) {
        // Membersihkan data sesi lokal (keamanan)
        // Tapi data tetap aman di database Supabase
        localStorage.removeItem('radar_user_profile');
        localStorage.removeItem('radar_social_accounts');
        localStorage.removeItem('radar_session_id');
        window.location.href = 'login.html';
    }
    return { error };
}

/**
 * getCurrentUser()
 */
async function getCurrentUser() {
    const client = getSupabaseClient();
    const { data: { user } } = await client.auth.getUser();
    return user;
}

/**
 * getUserProfile(userId)
 */
async function getUserProfile(userId) {
    const client = getSupabaseClient();
    const { data, error } = await client.from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

    if (data) {
        localStorage.setItem('radar_user_profile', JSON.stringify(data));

        // ── Sinkronisasi Akun Sosial dari Database ke Browser ──────
        // Jika DB punya data akun sosial, pasang kembali ke localStorage
        if (data.social_accounts) {
            console.log('[supabase] Memulihkan akun sosial dari database...');
            localStorage.setItem('radar_social_accounts', 
                typeof data.social_accounts === 'string' 
                    ? data.social_accounts 
                    : JSON.stringify(data.social_accounts)
            );
        }

        // ── Sync postforme_external_id ──────────────────────────────
        if (data.postforme_external_id) {
            localStorage.setItem('radar_session_id', data.postforme_external_id);
        } else {
            var existingId = localStorage.getItem('radar_session_id');
            if (!existingId) {
                existingId = 'radar_user_' + Math.random().toString(36).slice(2, 10);
                localStorage.setItem('radar_session_id', existingId);
            }
            client.from('profiles')
                .update({ postforme_external_id: existingId })
                .eq('id', userId)
                .then(function() {
                    data.postforme_external_id = existingId;
                    localStorage.setItem('radar_user_profile', JSON.stringify(data));
                })
                .catch(function() {});
        }
    }
    return { data, error };
}

/**
 * updateUserProfile(profileData)
 */
async function updateUserProfile(profileData) {
    const user = await getCurrentUser();
    if (!user) return { error: 'Not authenticated' };
    
    const client = getSupabaseClient();
    console.log('[supabase] Mencoba update profil:', profileData);
    
    const { data, error } = await client.from('profiles')
        .upsert({
            id: user.id,
            ...profileData
        })
        .select()
        .single();

    if (error) {
        console.error('[supabase] GAGAL update profil:', error.message, error.details);
    } else {
        console.log('[supabase] BERHASIL update profil ke database.');
    }
    
    if (data) {
        localStorage.setItem('radar_user_profile', JSON.stringify(data));
    }
    return { data, error };
}

/**
 * syncSocialAccounts()
 * Menyimpan daftar akun sosial dari localStorage ke database permanen Supabase
 */
async function syncSocialAccounts() {
    try {
        const accountsRaw = localStorage.getItem('radar_social_accounts');
        if (!accountsRaw) return;
        
        const accounts = JSON.parse(accountsRaw);
        console.log('[supabase] Menyinkronkan ' + accounts.length + ' akun sosial ke database...');
        
        await updateUserProfile({
            social_accounts: accounts
        });
    } catch(e) {
        console.warn('[supabase] syncSocialAccounts error:', e.message);
    }
}

/**
 * signInWithSocial(provider)
 * provider: 'google' or 'facebook'
 */
async function signInWithSocial(provider, redirectTo) {
    const client = getSupabaseClient();
    const destination = redirectTo || (window.location.origin + '/onboarding.html');
    const { data, error } = await client.auth.signInWithOAuth({
        provider: provider,
        options: {
            redirectTo: destination
        }
    });
    return { data, error };
}

/**
 * sendPasswordReset(email)
 * Kirim email reset password via Supabase
 */
async function sendPasswordReset(email) {
    const client = getSupabaseClient();
    const { data, error } = await client.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + '/reset-password.html'
    });
    return { data, error };
}

/**
 * updatePassword(newPassword)
 * Ganti password user yang sedang login (setelah klik link reset)
 */
async function updatePassword(newPassword) {
    const client = getSupabaseClient();
    const { data, error } = await client.auth.updateUser({ password: newPassword });
    return { data, error };
}

window.signUp = signUp;
window.signIn = signIn;
window.signOut = signOut;
window.signInWithSocial = signInWithSocial;
window.verifyOtp = verifyOtp;
window.resendOtp = resendOtp;
window.getCurrentUser = getCurrentUser;
window.getUserProfile = getUserProfile;
window.updateUserProfile = updateUserProfile;
window.syncSocialAccounts = syncSocialAccounts; // Ekspos ke global
window.sendPasswordReset = sendPasswordReset;
window.updatePassword = updatePassword;

/* ─────────────────────────────────────────
   Session Management
   Session ID persisten per browser session
   ───────────────────────────────────────── */
(function initSession() {
  var existing = localStorage.getItem('radar_session_id');
  if (!existing) {
    existing = crypto.randomUUID();
    localStorage.setItem('radar_session_id', existing);
  }
  window.radarSessionId = existing;
})();

// Expose Supabase URL dan Key untuk Edge Function calls di analytics.js
window.radarSupabaseUrl  = RADAR_CONFIG.SUPABASE_URL;
window.radarSupabaseKey  = RADAR_CONFIG.SUPABASE_ANON_KEY;

/* ─────────────────────────────────────────
   showAnToast(msg)
   Helper toast — pakai #an-toast yang sudah ada di HTML
   ───────────────────────────────────────── */
function showAnToast(msg, type) {
  var el = document.getElementById('an-toast');
  if (!el) return;

  // Ikon centang hijau untuk pesan sukses
  var iconHtml = (type === 'success')
    ? '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" style="flex-shrink:0"><circle cx="8" cy="8" r="8" fill="#22c55e"/><path d="M4 8.5l2.5 2.5 5-5" stroke="#fff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>'
    : '';

  // Sanitasi msg agar aman untuk innerHTML
  var span = document.createElement('span');
  span.textContent = msg;
  el.innerHTML = iconHtml + span.outerHTML;
  el.style.display = 'flex';
  clearTimeout(el._hideTimer);
  el._hideTimer = setTimeout(function() {
    el.style.display = 'none';
  }, 4500);
}

/* ─────────────────────────────────────────
   validateCampaignData(data)
   Validasi dan sanitasi sebelum INSERT
   ───────────────────────────────────────── */
function validateCampaignData(data) {
  var errors = [];

  // Field wajib
  if (!data.kecamatan || data.kecamatan.trim() === '')
    errors.push('kecamatan');
  if (!data.platforms || data.platforms.length === 0)
    errors.push('platforms');
  if (!data.kategori || data.kategori.trim() === '')
    errors.push('kategori');

  // Batas panjang string
  var MAX = {
    nama:        100,
    kecamatan:   100,
    caption:     2000,
    stitchText:  200,
    personaName: 100
  };

  Object.keys(MAX).forEach(function(field) {
    if (data[field] && data[field].length > MAX[field]) {
      data[field] = data[field].substring(0, MAX[field]);
    }
  });

  // Sanitasi basic XSS prevention
  function sanitize(str) {
    if (!str) return str;
    return str
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/javascript:/gi, '');
  }

  data.caption    = sanitize(data.caption);
  data.stitchText = sanitize(data.stitchText);
  data.nama       = sanitize(data.nama);

  // Validasi tipe angka
  if (data.radius !== undefined && isNaN(parseFloat(data.radius)))
    data.radius = 1;
  if (data.reachMin !== undefined && isNaN(parseInt(data.reachMin)))
    data.reachMin = 0;
  if (data.reachMax !== undefined && isNaN(parseInt(data.reachMax)))
    data.reachMax = 0;

  return {
    isValid:       errors.length === 0,
    errors:        errors,
    sanitizedData: data
  };
}

/* ─────────────────────────────────────────
   saveCampaign(campaignData)
   INSERT ke tabel campaigns di Supabase
   Return: { success: true, id } atau { success: false, error }
   ───────────────────────────────────────── */
async function saveCampaign(campaignData) {
  var client = getSupabaseClient();
  if (!client) return { success: false, error: 'Supabase not configured' };

  // Validasi dulu
  var validation = validateCampaignData(campaignData);
  if (!validation.isValid) {
    console.warn('[supabase] Data tidak valid:', validation.errors);
    return { success: false, error: 'invalid data: ' + validation.errors.join(', ') };
  }

  var d = validation.sanitizedData;

  try {
    var result = await client
      .from('campaigns')
      .insert({
        user_id:             (await getCurrentUser())?.id || null,
        session_id:          window.radarSessionId,
        nama_campaign:       d.nama        || null,
        kecamatan:           d.kecamatan   || null,
        radius_km:           d.radius      || null,
        kategori:            d.kategori    || null,
        platforms:           d.platforms   || [],
        persona_name:        d.personaName || null,
        persona_tags:        d.personaTags || [],
        estimated_reach_min: d.reachMin    || 0,
        estimated_reach_max: d.reachMax    || 0,
        caption:             d.caption     || null,
        stitch_text:         d.stitchText  || null,
        status:              'active',
        budget_idr:          d.budget      || null,
        format:              d.format      || null,
        post_id:             d.postId      || null,
        thumb_url:           d.thumbUrl    || null
      })
      .select()
      .single();

    if (result.error) throw result.error;

    console.log('[supabase] Campaign tersimpan:', result.data.id);
    return { success: true, id: result.data.id };

  } catch (err) {
    console.error('[supabase] saveCampaign error:', err.message);
    showAnToast('⚠ Data tidak tersimpan');
    return { success: false, error: err.message };
  }
}

/* ─────────────────────────────────────────
   getCampaigns()
   SELECT semua campaign milik session ini
   Return: array of campaign objects
   ───────────────────────────────────────── */
async function getCampaigns() {
  var client = getSupabaseClient();
  if (!client) return [];

  try {
    var result = await client
      .from('campaigns')
      .select('*')
      .eq('session_id', window.radarSessionId)
      .order('created_at', { ascending: false })
      .limit(10);

    if (result.error) throw result.error;

    return result.data || [];

  } catch (err) {
    console.error('[supabase] getCampaigns error:', err.message);
    return [];
  }
}

async function updateCampaignPostId(campaignSupabaseId, postId, postUrl, platformPostId) {
  var client = getSupabaseClient();
  if (!client || !campaignSupabaseId || !postId) return;
  try {
    var fields = { post_id: postId };
    if (postUrl)        fields.post_url          = postUrl;
    if (platformPostId) fields.platform_post_id  = platformPostId;
    var result = await client
      .from('campaigns')
      .update(fields)
      .eq('id', campaignSupabaseId)
      .eq('session_id', window.radarSessionId); // RLS: update hanya boleh milik session ini
    if (result.error) throw result.error;
    console.log('[supabase] post_id updated:', postId, '| post_url:', postUrl, '| platform_post_id:', platformPostId);
  } catch(e) {
    console.warn('[supabase] updateCampaignPostId error:', e.message);
  }
}
window.updateCampaignPostId = updateCampaignPostId;

async function deleteCampaign(campaignId) {
  var client = getSupabaseClient();
  if (!client || !campaignId) return { success: false };
  try {
    var result = await client
      .from('campaigns')
      .delete()
      .eq('id', campaignId)
      .eq('session_id', window.radarSessionId);
    if (result.error) throw result.error;
    console.log('[supabase] campaign deleted:', campaignId);
    return { success: true };
  } catch(err) {
    console.error('[supabase] deleteCampaign error:', err.message);
    return { success: false, error: err.message };
  }
}
window.deleteCampaign = deleteCampaign;

async function updateCampaignPostUrl(campaignId, postUrl) {
  var client = getSupabaseClient();
  if (!client || !campaignId || !postUrl) return;
  try {
    var result = await client
      .from('campaigns')
      .update({ post_url: postUrl })
      .eq('id', campaignId)
      .eq('session_id', window.radarSessionId); // RLS: update hanya boleh milik session ini
    if (result.error) throw result.error;
    console.log('[supabase] post_url updated:', campaignId);
  } catch(e) {
    console.warn('[supabase] updateCampaignPostUrl error:', e.message);
  }
}
window.updateCampaignPostUrl = updateCampaignPostUrl;
async function uploadThumbToStorage(supabaseId, dataUrl) {
  if (!supabaseId || !dataUrl || !dataUrl.startsWith('data:image')) return null;
  try {
    var base64 = dataUrl.split(',')[1];
    var binary = atob(base64);
    var bytes  = new Uint8Array(binary.length);
    for (var i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    var blob = new Blob([bytes], { type: 'image/jpeg' });
    var path = supabaseId + '.jpg';
    var res  = await fetch(
      RADAR_CONFIG.SUPABASE_URL + '/storage/v1/object/thumbnails/' + path,
      {
        method:  'POST',
        headers: {
          'Authorization': 'Bearer ' + RADAR_CONFIG.SUPABASE_ANON_KEY,
          'Content-Type':  'image/jpeg',
          'x-upsert':      'true'
        },
        body: blob
      }
    );
    if (!res.ok) {
      console.warn('[supabase] uploadThumbToStorage failed:', res.status, await res.text());
      return null;
    }
    var publicUrl = RADAR_CONFIG.SUPABASE_URL + '/storage/v1/object/public/thumbnails/' + path;
    console.log('[supabase] thumbnail uploaded to Storage:', publicUrl);
    return publicUrl;
  } catch(e) {
    console.warn('[supabase] uploadThumbToStorage error:', e.message);
    return null;
  }
}
window.uploadThumbToStorage = uploadThumbToStorage;

async function updateCampaignThumbUrl(campaignId, thumbUrl) {
  var client = getSupabaseClient();
  if (!client || !campaignId || !thumbUrl) return;
  try {
    var result = await client
      .from('campaigns')
      .update({ thumb_url: thumbUrl })
      .eq('id', campaignId)
      .eq('session_id', window.radarSessionId);
    if (result.error) throw result.error;
    console.log('[supabase] thumb_url updated:', campaignId);
  } catch(e) {
    console.warn('[supabase] updateCampaignThumbUrl error:', e.message);
  }
}
window.updateCampaignThumbUrl = updateCampaignThumbUrl;
window.updateUserProfile = updateUserProfile;
