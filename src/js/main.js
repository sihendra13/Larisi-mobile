// RADAR — main.js
// All modules are loaded via <script> tags in index.html
// This file handles any cross-module initialization
document.addEventListener('DOMContentLoaded', function() {
  updateReach();

  // NOTE: _autoSelectFromBizProfile() intentionally NOT called here.
  // Master Persona should only be set when the user uploads a file (AI scan)
  // or manually picks a category — not auto-restored on every page refresh.

  // Sync format default sesuai radio button yang checked di HTML
  var checkedFmt = document.querySelector('input[name="fmt"]:checked');
  if (checkedFmt && typeof selectFormat === 'function') {
    selectFormat(checkedFmt.value);
  }

  // Sync channel default
  if (typeof _updateLivePreviewLabel === 'function') {
    _updateLivePreviewLabel();
  }

  console.log('[init] activeFormat:', activeFormat,
              '| activeChannel:', activeChannel,
              '| activePlatform:', activePlatform);

  // Tier 1: Prefetch campaigns on load.
  // 500ms delay → beri waktu Supabase auth + radarSessionId ter-set.
  // Kalau gagal → silent, existing flow (loadCampaignsFromSupabase on menu click) jadi fallback.
  setTimeout(function() {
    if (typeof _prefetchCampaigns === 'function') _prefetchCampaigns();
  }, 500);

  // Tier 2: Pre-load feed caches dari localStorage → isi _analyticsCache sebelum
  // _loadAnalyticsForCard dipanggil. Synchronous, tidak butuh delay.
  if (typeof _preloadFeedCaches === 'function') _preloadFeedCaches();

  // Tier 3: Supabase Realtime subscription untuk campaign changes.
  // 1000ms delay → pastikan Supabase client + auth sudah siap.
  // Kalau gagal → waitForCampaigns() polling 500ms tetap jalan sebagai fallback.
  setTimeout(function() {
    if (typeof _startRealtimeCampaignSync === 'function') _startRealtimeCampaignSync();
  }, 1000);
});
