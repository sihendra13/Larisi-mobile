// RADAR — state.js
// Global state and PLATFORMS configuration

var State = {
  map: null, circle: null, marker: null,
  currentRadius: 1,
  currentPersona: null,
  activeTone: 'casual',
  uploadedDataURL: null,
  freeCount: 10,
  brightnessVal: 100,
  contrastVal: 100,
  activePlatform: 'ig-reel',
  platformIdx: 0,
  currentRegion: 'jogja',
  currentLat: -7.7956,
  currentLng: 110.3695,
  currentLocPop: 28000,
  masterPersonaLocked: false,
  uploadMode: null,
  isTyping: false,
  typewriterTimer: null,
  captionAltIndex: 0,
  audLocal: false,
  audTraveler: false
};

// Individual var declarations for backward compatibility (used by all modules)
var map, circle, marker;
var currentRadius = 1, currentPersona = null, activeTone = 'casual';
var uploadedDataURL = null, freeCount = 10, brightnessVal = 100, contrastVal = 100;
var uploadedDataURLs = []; // array base64 semua foto (untuk carousel)
var activePlatform = 'ig-reel', platformIdx = 0;
var currentRegion = 'jogja', currentLat = -7.7956, currentLng = 110.3695, currentLocPop = 28000;
var masterPersonaLocked = false, uploadMode = null;
var isTyping = false, typewriterTimer = null, captionAltIndex = 0;
var audLocal = false, audTraveler = false;

var PLATFORMS = {
  'ig-story':   {label:'Instagram Story (9:16)',  tag:'IG Story',      ratio:'9:16 — Story',   aspect:'9/16', w:130, h:230, chrome:'ig-story',   stitchBottom:'23%'},
  'ig-feed':    {label:'Instagram Feed (4:5)',    tag:'IG Feed',       ratio:'4:5 — IG Feed',  aspect:'4/5',  w:170, h:212, chrome:'ig-feed',    stitchBottom:'20%'},
  'ig-post':    {label:'Instagram Post (4:5)',    tag:'IG Post',       ratio:'4:5 — IG Post',  aspect:'4/5',  w:170, h:212, chrome:'ig-feed',    stitchBottom:'20%'},
  'ig-reel':    {label:'Instagram Reels (9:16)',  tag:'IG Reels',      ratio:'9:16 — Reels',   aspect:'9/16', w:130, h:230, chrome:'ig-reel',    stitchBottom:'23%'},
  'tiktok':     {label:'TikTok For You (9:16)',   tag:'TikTok FYP',    ratio:'9:16 — TikTok',  aspect:'9/16', w:130, h:230, chrome:'tiktok',     stitchBottom:'28%'},
  'youtube':    {label:'YouTube Shorts (9:16)',   tag:'YouTube Shorts',ratio:'9:16 — Shorts',  aspect:'9/16', w:130, h:230, chrome:'youtube',    stitchBottom:'25%'},
  'meta':       {label:'Facebook Post (4:5)',     tag:'FB Post',       ratio:'4:5 — FB Post',  aspect:'4/5',  w:170, h:212, chrome:'meta',       stitchBottom:'20%'},
  'meta-reel':  {label:'Facebook Reels (9:16)',   tag:'FB Reels',      ratio:'9:16 — FB Reels',aspect:'9/16', w:130, h:230, chrome:'meta-reel',  stitchBottom:'23%'},
  'meta-story': {label:'Facebook Story (9:16)',   tag:'FB Story',      ratio:'9:16 — FB Story',aspect:'9/16', w:130, h:230, chrome:'meta-story', stitchBottom:'23%'}
};

/*
 * Platform penetration rates Indonesia (We Are Social / Hootsuite Digital 2024)
 * Source: https://wearesocial.com/id/blog/2024/01/digital-2024/
 * TODO: Replace with real-time Meta/TikTok/Google Ads API data when available
 */
var PLATFORM_KEYS = ['Instagram','TikTok','YouTube','Meta'];

/*
 * Platform penetration rates — We Are Social & Meltwater Digital 2024 Indonesia
 * https://wearesocial.com/id/blog/2024/01/digital-2024/
 * TikTok: TikTok for Business Indonesia Report 2024
 */
var PLATFORM_PENETRATION_RATES = {
  'Instagram': 0.731,
  'TikTok':    0.632,
  'YouTube':   0.877,
  'Meta':      0.830
};

/* ─── Population Provider (swap-ready) ─────────────────
 * Sekarang: BPS Sensus 2020
 * Nanti: ganti POPULATION_PROVIDER.fetch() ke Google Maps API
 * Tidak perlu ubah logika kalkulasi di reach.js
 */
var POPULATION_PROVIDER = {
  source: 'bps', // 'bps' | 'google_maps' (nanti)

  // Ambil populasi berdasarkan lat, lng, radius
  // Sekarang return currentLocPop (BPS)
  // Nanti: fetch dari Google Maps Population API
  fetch: async function(lat, lng, radiusKm) {
    if (this.source === 'google_maps' && this.googleFetch) {
      return await this.googleFetch(lat, lng, radiusKm);
    }
    // Default: BPS data via currentLocPop
    return typeof currentLocPop !== 'undefined' ? currentLocPop : 0;
  },

  // Nanti tinggal uncomment dan isi API key:
  // googleFetch: async function(lat, lng, radiusKm) {
  //   var response = await fetch(
  //     'https://maps.googleapis.com/maps/api/...' +
  //     '?lat=' + lat + '&lng=' + lng +
  //     '&radius=' + (radiusKm * 1000) +
  //     '&key=' + RADAR_CONFIG.GOOGLE_MAPS_API_KEY
  //   );
  //   var data = await response.json();
  //   return data.population || 0;
  // }
};
window.POPULATION_PROVIDER = POPULATION_PROVIDER;

/* Platform SVG paths for footer icons */
var PLAT_ICONS_SVG = {
  'Instagram': 'M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z',
  'TikTok':    'M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.79 1.54V6.78a4.85 4.85 0 01-1.02-.09z',
  'YouTube':   'M23.5 6.19a3 3 0 00-2.12-2.13C19.54 3.5 12 3.5 12 3.5s-7.54 0-9.38.56A3 3 0 00.5 6.19C0 8.03 0 12 0 12s0 3.97.5 5.81a3 3 0 002.12 2.12C4.46 20.5 12 20.5 12 20.5s7.54 0 9.38-.57a3 3 0 002.12-2.12C24 15.97 24 12 24 12s0-3.97-.5-5.81zM9.75 15.02V8.98L15.5 12l-5.75 3.02z',
  'Meta':      'M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z'
};

var _igIcon = '<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#791ADB" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="5"/><path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>';
var _ttIcon = '<svg width="11" height="11" viewBox="0 0 24 24" fill="#791ADB"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.79 1.54V6.78a4.85 4.85 0 01-1.02-.09z"/></svg>';
var _ytIcon = '<svg width="11" height="11" viewBox="0 0 24 24" fill="#791ADB"><path d="M23.5 6.19a3 3 0 00-2.12-2.13C19.54 3.5 12 3.5 12 3.5s-7.54 0-9.38.56A3 3 0 00.5 6.19C0 8.03 0 12 0 12s0 3.97.5 5.81a3 3 0 002.12 2.12C4.46 20.5 12 20.5 12 20.5s7.54 0 9.38-.57a3 3 0 002.12-2.12C24 15.97 24 12 24 12s0-3.97-.5-5.81zM9.75 15.02V8.98L15.5 12l-5.75 3.02z"/></svg>';
var _fbIcon = '<svg width="11" height="11" viewBox="0 0 24 24" fill="#791ADB"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>';

var PLAT_LABEL_MAP = {
  'ig-story':   {icon: _igIcon, label: 'Instagram'},
  'ig-feed':    {icon: _igIcon, label: 'Instagram'},
  'ig-post':    {icon: _igIcon, label: 'Instagram'},
  'ig-reel':    {icon: _igIcon, label: 'Instagram'},
  'tiktok':     {icon: _ttIcon, label: 'TikTok'},
  'youtube':    {icon: _ytIcon, label: 'YouTube'},
  'meta':       {icon: _fbIcon, label: 'Facebook'},
  'meta-reel':  {icon: _fbIcon, label: 'Facebook'},
  'meta-story': {icon: _fbIcon, label: 'Facebook'}
};

var platformOrder = ['ig-story','ig-feed','tiktok','youtube','meta'];

/* ─── Channel / Format state (untuk AI Editor cycler) ──────── */
var activeChannel = 'instagram';  // instagram | meta | tiktok | youtube
var activeFormat  = 'reel';       // post | reel | story
var channelOrder  = ['instagram', 'meta', 'tiktok', 'youtube'];
var channelIdx    = 0;

var CHANNEL_FORMAT_MAP = {
  instagram: { post: 'ig-post',  reel: 'ig-reel',    story: 'ig-story'    },
  meta:      { post: 'meta',     reel: 'meta-reel',  story: 'meta-story'  },
  tiktok:    { single: 'tiktok'                                            },
  youtube:   { single: 'youtube'                                           }
};
