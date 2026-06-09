'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { ID_LOCATIONS } from '@/data/locations';
import MobileHeader from '@/components/layout/MobileHeader';

const DEFAULT_LAT = -7.7956;
const DEFAULT_LNG = 110.3695;

const PLATFORM_LABELS = { instagram:'Instagram', facebook:'Facebook', tiktok:'TikTok', youtube:'YouTube' };

// Sama persis dengan desktop (state.js)
const PLATFORM_PENETRATION_RATES = {
  instagram: 0.731,
  tiktok:    0.632,
  youtube:   0.877,
  facebook:  0.830,
};

function computeReach(locPop, radius, localOn, travelerOn, platform) {
  if (!localOn && !travelerOn) return { totalPop: 0, lo: 0, hi: 0 };
  const areaFactor    = Math.PI * radius * radius;
  const densityBase   = locPop / (Math.PI * 5 * 5);
  const areaPop       = Math.round(densityBase * areaFactor);
  const totalPop      = (localOn ? areaPop : 0) + (travelerOn ? Math.round(areaPop * 0.22) : 0);
  // Desktop: popup = totalPop, footer = lo–hi setelah platform penetration
  const internetUsers = Math.round(totalPop * 0.795);
  const penetration   = PLATFORM_PENETRATION_RATES[platform] || PLATFORM_PENETRATION_RATES.instagram;
  const hi = Math.min(Math.round(internetUsers * penetration), internetUsers);
  const lo = Math.round(hi * 0.65);
  return { totalPop, lo, hi };
}

function fmtReach(n) {
  if (!n || n === 0) return '0';
  if (n >= 10000) return Math.round(n / 1000) + 'K';
  return n.toLocaleString('id-ID');
}

/* ── Toggle (stable, defined outside) ── */
const Toggle = ({ on, onToggle }) => (
  <button onClick={onToggle} style={{
    width:'44px', height:'24px', borderRadius:'99px', border:'none',
    background: on ? 'var(--m-brand)' : '#D7D7DE',
    cursor:'pointer', position:'relative', flexShrink:0,
    transition:'background .2s', padding:0,
  }}>
    <div style={{
      position:'absolute', top:'3px',
      left: on ? 'calc(100% - 21px)' : '3px',
      width:'18px', height:'18px', borderRadius:'50%', background:'#fff',
      transition:'left .2s', boxShadow:'0 1px 3px rgba(0,0,0,0.2)',
    }} />
  </button>
);

/* ── SearchBar — defined OUTSIDE to prevent remount on parent re-render ── */
function SearchBar({ searchVal, onInput, results, showDropdown, onSelect, onClear, onFocus }) {
  return (
    <div style={{padding:'12px 16px 0', position:'relative'}} onClick={e => e.stopPropagation()}>
      <div style={{display:'flex',alignItems:'center',gap:'8px',background:'#F4F4F7',borderRadius:'8px',padding:'0 12px',height:'42px'}}>
        <svg viewBox="0 0 24 24" fill="none" stroke="var(--m-ink-sub)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{width:'14px',height:'14px',flexShrink:0}}>
          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <input
          value={searchVal}
          onChange={e => onInput(e.target.value)}
          onFocus={onFocus}
          placeholder="Cari kecamatan atau kota..."
          style={{
            border:'none', background:'none', outline:'none', flex:1,
            fontFamily:'var(--m-font)',
            fontSize:'16px', /* 16px prevents mobile auto-zoom */
            color:'var(--m-ink)',
          }}
        />
        {searchVal && (
          <button onClick={e => { e.stopPropagation(); onClear(); }}
            style={{background:'none',border:'none',cursor:'pointer',color:'var(--m-ink-sub)',fontSize:'18px',padding:0,lineHeight:1,flexShrink:0}}>×</button>
        )}
      </div>
      {showDropdown && results.length > 0 && (
        <div style={{
          position:'absolute',top:'calc(100% - 0px)',left:'16px',right:'16px',
          background:'#fff',borderRadius:'8px',
          boxShadow:'0 4px 16px rgba(0,0,0,0.12)',
          zIndex:500,overflow:'hidden',marginTop:'4px',
        }}>
          {results.map((loc, i) => (
            <div key={i} onClick={() => onSelect(loc)}
              style={{
                padding:'10px 14px',fontSize:'13px',cursor:'pointer',
                fontFamily:'var(--m-font)',color:'var(--m-ink)',
                borderBottom: i < results.length-1 ? '1px solid #F4F4F7' : 'none',
              }}
              onMouseOver={e => e.currentTarget.style.background='#F3EBFF'}
              onMouseOut={e => e.currentTarget.style.background=''}
            >{loc.n}</div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── RadiusSlider — defined OUTSIDE to prevent remount on parent re-render ── */
function RadiusSlider({ radius, onChange }) {
  const sliderPct = ((radius - 0.5) / 9.5) * 100;
  return (
    <div style={{padding:'14px 16px 16px'}}>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'10px'}}>
        <span style={{fontFamily:'var(--m-font)',fontSize:'13px',fontWeight:'600',color:'var(--m-ink)'}}>Target Radius</span>
        <span style={{fontFamily:'var(--m-font)',fontSize:'12px',fontWeight:'700',color:'var(--m-brand)',background:'var(--m-brand-soft)',padding:'3px 10px',borderRadius:'8px'}}>
          {radius.toFixed(1)} KM
        </span>
      </div>
      <input type="range" min="0.5" max="10" step="0.5" className="larisi-slider" value={radius}
        onChange={e => onChange(parseFloat(e.target.value))}
        style={{width:'100%',background:`linear-gradient(to right, var(--m-brand) 0%, var(--m-brand) ${sliderPct}%, #E4E4EB ${sliderPct}%, #E4E4EB 100%)`}}
      />
      <div style={{textAlign:'center',marginTop:'8px'}}>
        <span style={{fontFamily:'var(--m-font)',fontSize:'11px',color:'var(--m-ink-sub)'}}>Geser untuk memperluas jangkauan</span>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════ */
export default function AudiensScreen({
  platform, onBack, onNext,
  locName, setLocName, locFull, setLocFull,
  locPop, setLocPop, radius, setRadius,
  localOn, setLocalOn, travelerOn, setTravelerOn,
  profile, onAvatarClick,
}) {
  const [searchVal,     setSearchVal]     = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showDropdown,  setShowDropdown]  = useState(false);
  const [isBottomSheet, setIsBottomSheet] = useState(false);
  const [animateSheet,  setAnimateSheet]  = useState(false);

  const openSheet  = () => { setIsBottomSheet(true);  setTimeout(() => setAnimateSheet(true), 10); };
  const closeSheet = () => { setAnimateSheet(false);  setTimeout(() => setIsBottomSheet(false), 300); };

  /* ── Refs ── */
  const mapRef               = useRef(null);
  const leafletMapRef        = useRef(null);
  const markerRef            = useRef(null);
  const circleRef            = useRef(null);
  const bottomSheetMapRef    = useRef(null);
  const bottomSheetLeafRef   = useRef(null);
  const bottomSheetMarkerRef = useRef(null);
  const bottomSheetCircleRef = useRef(null);
  const searchTimerRef       = useRef(null);
  const snapRef = useRef({ lat: DEFAULT_LAT, lng: DEFAULT_LNG });

  /* keep snapshot fresh */
  useEffect(() => {
    snapRef.current.lat    = snapRef.current.lat;
    snapRef.current.lng    = snapRef.current.lng;
    snapRef.current.locName = locName;
    snapRef.current.locPop  = locPop;
    snapRef.current.radius  = radius;
  });

  /* ── Reach ── */
  const reach     = computeReach(locPop, radius, localOn, travelerOn, platform);
  // Map popup = totalPop (raw), sticky bar = lo–hi (sama dengan desktop)
  const reachText = (!reach.totalPop) ? 'Jangkauan: 0 orang' : `Jangkauan: ${reach.totalPop.toLocaleString('id-ID')} orang`;

  function popupHtml(name, rText) {
    return `<div style="text-align:center;padding:2px 4px;min-width:130px;">
      <div style="font-family:'Plus Jakarta Sans',sans-serif;font-size:12px;font-weight:700;color:#1C1C28;">${name || 'Lokasiku'}</div>
      <div style="font-family:'Plus Jakarta Sans',sans-serif;font-size:11px;font-weight:700;color:#6d28d9;margin-top:2px;">${rText}</div>
    </div>`;
  }

  /* ── Sync popup ── */
  useEffect(() => {
    if (markerRef.current)            markerRef.current.setPopupContent(popupHtml(locName, reachText));
    if (bottomSheetMarkerRef.current) bottomSheetMarkerRef.current.setPopupContent(popupHtml(locName, reachText));
  }, [locName, reachText]); // eslint-disable-line react-hooks/exhaustive-deps

  const findNearest = useCallback((lat, lng) => {
    let nearest = null, minDist = Infinity;
    ID_LOCATIONS.forEach(loc => {
      const d = Math.hypot(loc.lat - lat, loc.lng - lng);
      if (d < minDist) { minDist = d; nearest = loc; }
    });
    return nearest;
  }, []);

  const reverseGeocode = useCallback(async (lat, lng) => {
    try {
      const r = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=id`);
      const d = await r.json();
      const a = d.address || {};
      const name = a.village || a.suburb || a.neighbourhood || a.city_district || '';
      const city = a.city || a.county || a.state_district || a.state || '';
      if (name) {
        /* only build loc string when name is non-empty */
        const loc = name + (city && name !== city ? ', ' + city : '');
        setLocName(name);
        setLocFull(loc || name);
      } else if (city) {
        /* fallback: use city as both name and full */
        setLocName(city);
        setLocFull(city);
      }
    } catch (_) {}
  }, [setLocName, setLocFull]);

  const movePinTo = useCallback((lat, lng) => {
    snapRef.current.lat = lat; snapRef.current.lng = lng;
    if (markerRef.current)             markerRef.current.setLatLng([lat, lng]);
    if (circleRef.current)             circleRef.current.setLatLng([lat, lng]);
    if (leafletMapRef.current)         leafletMapRef.current.flyTo([lat, lng], 13, { duration: 1.2 });
    if (bottomSheetMarkerRef.current)  bottomSheetMarkerRef.current.setLatLng([lat, lng]);
    if (bottomSheetCircleRef.current)  bottomSheetCircleRef.current.setLatLng([lat, lng]);
    if (bottomSheetLeafRef.current)    bottomSheetLeafRef.current.flyTo([lat, lng], 14, { duration: 1.2 });
    const nearest = findNearest(lat, lng);
    if (nearest?.pop) setLocPop(nearest.pop);
  }, [findNearest, setLocPop]);

  const moveToUserLocation = useCallback(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        movePinTo(pos.coords.latitude, pos.coords.longitude);
        reverseGeocode(pos.coords.latitude, pos.coords.longitude);
      },
      (err) => console.warn('[map]', err.message),
      { timeout: 8000, maximumAge: 60000 }
    );
  }, [movePinTo, reverseGeocode]);

  /* ── Build main map ── */
  useEffect(() => {
    const buildMap = () => {
      if (!mapRef.current || leafletMapRef.current) return;
      const L = window.L;

      const initialLoc = (locName && ID_LOCATIONS.find(l => l.n.toLowerCase().includes(locName.toLowerCase())))
                      || ID_LOCATIONS.find(l => l.n.toLowerCase().includes('sumbersari'))
                      || { lat: DEFAULT_LAT, lng: DEFAULT_LNG, pop: 28000 };
      const startLat = initialLoc.lat;
      const startLng = initialLoc.lng;

      const map = L.map(mapRef.current, {
        center:[startLat, startLng], zoom:13,
        zoomControl:true, attributionControl:false,
      });
      L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', { subdomains:'abcd', maxZoom:19 }).addTo(map);

      const icon = L.divIcon({
        className:'',
        html:`<div style="width:14px;height:14px;border-radius:50%;background:#6d28d9;border:2px solid #fff;box-shadow:0 0 0 3px rgba(109,40,217,0.35)"></div>`,
        iconSize:[14,14], iconAnchor:[7,7],
      });
      markerRef.current = L.marker([startLat, startLng], { icon })
        .addTo(map)
        .bindPopup(popupHtml(locName || initialLoc.n.split(',')[0], reachText), { closeButton:false, autoClose:false, closeOnClick:false, offset:[0,-4] })
        .openPopup();

      circleRef.current = L.circle([startLat, startLng], {
        radius:radius * 1000, color:'#6d28d9', fillColor:'#6d28d9', fillOpacity:0.12, weight:1.5,
      }).addTo(map);

      map.on('click', (e) => { movePinTo(e.latlng.lat, e.latlng.lng); reverseGeocode(e.latlng.lat, e.latlng.lng); });

      const locBtn = L.control({ position:'topleft' });
      locBtn.onAdd = () => {
        const btn = L.DomUtil.create('button','');
        btn.title='Gunakan lokasi saya'; btn.innerHTML='📍';
        btn.style.cssText='width:34px;height:34px;background:#fff;border:2px solid rgba(0,0,0,.2);border-radius:4px;cursor:pointer;font-size:16px;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 6px rgba(0,0,0,.15);';
        L.DomEvent.on(btn,'click',(e) => { L.DomEvent.stopPropagation(e); moveToUserLocation(); });
        return btn;
      };
      locBtn.addTo(map);
      leafletMapRef.current = map;

      /* invalidateSize ensures correct zoom on mobile */
      setTimeout(() => { map.invalidateSize(); moveToUserLocation(); }, 200);
    };

    if (!document.getElementById('leaflet-css')) {
      const css = document.createElement('link');
      css.id='leaflet-css'; css.rel='stylesheet';
      css.href='https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(css);
    }
    if (window.L) { buildMap(); }
    else if (!document.getElementById('leaflet-js')) {
      const s = document.createElement('script');
      s.id='leaflet-js'; s.src='https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      s.onload = buildMap; document.head.appendChild(s);
    } else {
      const existing = document.getElementById('leaflet-js');
      if (existing.dataset.loaded) buildMap();
      else existing.addEventListener('load', buildMap);
    }

    return () => {
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current=null; markerRef.current=null; circleRef.current=null;
      }
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  /* ── Sync radius ── */
  useEffect(() => {
    if (circleRef.current)            circleRef.current.setRadius(radius * 1000);
    if (bottomSheetCircleRef.current) bottomSheetCircleRef.current.setRadius(radius * 1000);
  }, [radius]);

  /* ── Bottom sheet map ── */
  useEffect(() => {
    if (!isBottomSheet) {
      if (bottomSheetLeafRef.current) {
        bottomSheetLeafRef.current.remove();
        bottomSheetLeafRef.current=null; bottomSheetMarkerRef.current=null; bottomSheetCircleRef.current=null;
      }
      document.body.style.overflow = '';
      return;
    }
    document.body.style.overflow = 'hidden';
    const { lat:bLat, lng:bLng, locName:bName, locPop:bPop, radius:bRad } = snapRef.current;
    const r2 = computeReach(bPop || locPop, bRad || radius, localOn, travelerOn, platform);
    const rT2 = (!r2.totalPop) ? 'Jangkauan: 0 orang' : `Jangkauan: ${r2.totalPop.toLocaleString('id-ID')} orang`;

    const timer = setTimeout(() => {
      if (!bottomSheetMapRef.current || bottomSheetLeafRef.current) return;
      const L = window.L; if (!L) return;
      const map = L.map(bottomSheetMapRef.current, {
        center:[bLat, bLng], zoom:14, zoomControl:true, attributionControl:false,
      });
      L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', { subdomains:'abcd', maxZoom:19 }).addTo(map);

      const icon = L.divIcon({
        className:'',
        html:`<div style="width:14px;height:14px;border-radius:50%;background:#6d28d9;border:2px solid #fff;box-shadow:0 0 0 3px rgba(109,40,217,0.35)"></div>`,
        iconSize:[14,14], iconAnchor:[7,7],
      });
      const bsMarker = L.marker([bLat, bLng], { icon }).addTo(map)
        .bindPopup(popupHtml(bName || locName, rT2), { closeButton:false, autoClose:false, closeOnClick:false, offset:[0,-4] })
        .openPopup();
      bottomSheetMarkerRef.current = bsMarker;

      const bsCircle = L.circle([bLat, bLng], {
        radius:(bRad || radius)*1000, color:'#6d28d9', fillColor:'#6d28d9', fillOpacity:0.12, weight:1.5,
      }).addTo(map);
      bottomSheetCircleRef.current = bsCircle;

      map.on('click', (e) => { movePinTo(e.latlng.lat, e.latlng.lng); reverseGeocode(e.latlng.lat, e.latlng.lng); });

      const locBtn = L.control({ position:'topleft' });
      locBtn.onAdd = () => {
        const btn = L.DomUtil.create('button','');
        btn.title='Gunakan lokasi saya'; btn.innerHTML='📍';
        btn.style.cssText='width:34px;height:34px;background:#fff;border:2px solid rgba(0,0,0,.2);border-radius:4px;cursor:pointer;font-size:16px;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 6px rgba(0,0,0,.15);';
        L.DomEvent.on(btn,'click',(ev) => { L.DomEvent.stopPropagation(ev); moveToUserLocation(); });
        return btn;
      };
      locBtn.addTo(map);
      bottomSheetLeafRef.current = map;
      setTimeout(() => map.invalidateSize(), 150);
    }, 80);

    return () => clearTimeout(timer);
  }, [isBottomSheet]); // eslint-disable-line react-hooks/exhaustive-deps

  /* ── Search handlers ── */
  const handleSearchInput = useCallback((val) => {
    setSearchVal(val);
    if (!val || val.length < 2) { setShowDropdown(false); setSearchResults([]); return; }
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    searchTimerRef.current = setTimeout(() => {
      const lower = val.toLowerCase();
      const results = ID_LOCATIONS.filter(l => l.n.toLowerCase().includes(lower)).slice(0, 7);
      setSearchResults(results);
      setShowDropdown(results.length > 0);
    }, 300);
  }, []);

  const handleClear = useCallback(() => {
    setSearchVal(''); setShowDropdown(false); setSearchResults([]);
  }, []);

  const handleFocus = useCallback(() => {
    if (searchResults.length > 0) setShowDropdown(true);
  }, [searchResults.length]);

  const selectCity = useCallback((loc) => {
    setShowDropdown(false);
    const shortName = loc.n.split(',')[0].trim();
    const shortFull = loc.n.split(',').slice(0,2).join(', ').trim();
    setSearchVal(shortName);
    setLocName(shortName);
    setLocFull(shortFull);
    if (loc.pop) setLocPop(loc.pop);
    movePinTo(loc.lat, loc.lng);
  }, [movePinTo, setLocName, setLocFull, setLocPop]);

  /* ══════════════════════ RENDER ══════════════════════ */
  return (
    <div style={{display:'flex', flexDirection:'column', flex:1, overflow:'hidden', background:'var(--m-bg)'}}>

      {/* ── Header Larisi ── */}
      <MobileHeader
        userName={profile?.full_name || profile?.business_name || 'Pengguna'}
        userInitials={(profile?.full_name || profile?.business_name || 'P').trim().split(' ').map(w => w[0]).join('').toUpperCase().slice(0,2)}
        isPro={profile?.selected_plan === 'pro'}
        onAvatarClick={onAvatarClick}
      />

      {/* ── Page title ── */}
      <div style={{padding:'20px 16px 12px', background:'var(--m-bg)', flexShrink:0}}>
        <div style={{display:'flex',alignItems:'center',gap:'14px',marginBottom:'4px'}}>
          <button onClick={onBack} style={{
            width:'38px',height:'38px',borderRadius:'50%',background:'#fff',
            border:'none',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',
            boxShadow:'0 1px 4px rgba(0,0,0,0.10)',flexShrink:0,
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--m-ink)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 18l-6-6 6-6"/>
            </svg>
          </button>
          <h1 style={{fontFamily:'var(--m-font)',fontSize:'26px',fontWeight:'800',color:'var(--m-ink)',lineHeight:'1.2'}}>
            Target Audiens
          </h1>
        </div>
        <p style={{fontFamily:'var(--m-font)',fontSize:'13px',color:'var(--m-ink-sub)',paddingLeft:'52px'}}>
          Tentukan siapa yang akan melihat iklanmu di {PLATFORM_LABELS[platform] || 'Instagram'}
        </p>
      </div>

      {/* ── Scrollable content ── */}
      <main style={{
        flex:1, overflowY:'auto',
        padding:'4px 16px',
        paddingBottom:'calc(100px + env(safe-area-inset-bottom) + 60px)',
      }}>

        {/* Card 2: Tentukan Titik Target */}
        <div style={{marginBottom:'12px'}}>
        <div style={{
          background:'#fff', borderRadius:'16px',
          border:'1px solid #E4E4EB',
          overflow:'visible', /* allow search dropdown to show outside card */
          position:'relative',
        }}>
          <div style={{display:'flex',alignItems:'center',gap:'12px',padding:'16px 16px 0'}}>
            <div style={{
              width:'36px',height:'36px',borderRadius:'10px',
              background:'var(--m-brand-soft)',
              display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,
            }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="var(--m-brand)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{width:'18px',height:'18px'}}>
                <path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                <path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
              </svg>
            </div>
            <div>
              <div style={{fontFamily:'var(--m-font)',fontSize:'15px',fontWeight:'700',color:'var(--m-ink)'}}>Tentukan Titik Target Iklanmu</div>
              <div style={{fontFamily:'var(--m-font)',fontSize:'12px',color:'var(--m-ink-sub)',marginTop:'2px'}}>Klik peta atau cari kecamatan / kota</div>
            </div>
          </div>

          <SearchBar
            searchVal={searchVal}
            onInput={handleSearchInput}
            results={searchResults}
            showDropdown={showDropdown}
            onSelect={selectCity}
            onClear={handleClear}
            onFocus={handleFocus}
          />

          {/* Mini map */}
          <div style={{padding:'12px 16px 0',position:'relative'}}>
            <div ref={mapRef} style={{width:'100%',height:'200px',borderRadius:'12px',overflow:'hidden',position:'relative',zIndex:10}} />
            {/* Expand button */}
            <button onClick={openSheet} title="Perbesar peta" style={{
              position:'absolute', bottom:'12px', right:'28px', zIndex:400,
              width:'34px', height:'34px', borderRadius:'50%',
              background:'#fff', border:'none',
              boxShadow:'0 2px 8px rgba(0,0,0,0.18)',
              display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer',
            }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="var(--m-ink)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{width:'16px',height:'16px'}}>
                <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/>
              </svg>
            </button>
          </div>

          <RadiusSlider radius={radius} onChange={setRadius} />

          {/* Reach estimate dipindah ke sticky bar */}
        </div>
        </div>

        {/* Card 1: Target Audiens */}
        <div style={{
          background:'#fff', borderRadius:'16px',
          border:'1px solid #E4E4EB', overflow:'hidden',
        }}>
          <div style={{display:'flex',alignItems:'center',gap:'12px',padding:'16px 16px 0'}}>
            <div style={{
              width:'36px',height:'36px',borderRadius:'10px',
              background:'var(--m-brand-soft)',
              display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,
            }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="var(--m-brand)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{width:'18px',height:'18px'}}>
                <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>
              </svg>
            </div>
            <div>
              <div style={{fontFamily:'var(--m-font)',fontSize:'15px',fontWeight:'700',color:'var(--m-ink)'}}>Siapa Target Audiens Kamu?</div>
              <div style={{fontFamily:'var(--m-font)',fontSize:'12px',color:'var(--m-ink-sub)',marginTop:'2px'}}>Pilih siapa yang akan lihat iklanmu</div>
            </div>
          </div>
          <div style={{padding:'0 16px 16px'}}>
            <div style={{display:'flex',alignItems:'center',padding:'14px 0',borderBottom:'1px solid #F0F0F5'}}>
              <div style={{flex:1}}>
                <div style={{fontFamily:'var(--m-font)',fontSize:'14px',fontWeight:'600',color:'var(--m-ink)'}}>Warga Sekitar</div>
                <div style={{fontFamily:'var(--m-font)',fontSize:'12px',color:'var(--m-ink-sub)',marginTop:'2px'}}>Orang yang tinggal di area ini</div>
              </div>
              <Toggle on={localOn} onToggle={() => setLocalOn(v => !v)} />
            </div>
            <div style={{display:'flex',alignItems:'center',padding:'14px 0 0'}}>
              <div style={{flex:1}}>
                <div style={{fontFamily:'var(--m-font)',fontSize:'14px',fontWeight:'600',color:'var(--m-ink)'}}>Pengunjung</div>
                <div style={{fontFamily:'var(--m-font)',fontSize:'12px',color:'var(--m-ink-sub)',marginTop:'2px'}}>Orang yang sedang berada di sini</div>
              </div>
              <Toggle on={travelerOn} onToggle={() => setTravelerOn(v => !v)} />
            </div>
          </div>
        </div>
      </main>

      {/* ── Sticky CTA Bar ── */}
      <div style={{
        position:'fixed',
        bottom:'calc(60px + env(safe-area-inset-bottom))',
        left:0, right:0, zIndex:950,
        background:'#fff',
        borderTop:'1px solid #E4E4EB',
        padding:'12px 16px',
        display:'flex', alignItems:'center', justifyContent:'space-between',
        boxShadow:'0 -4px 20px rgba(0,0,0,0.03)',
      }}>
        {/* Left: Info */}
        <div style={{display:'flex', flexDirection:'column', flex:1, paddingRight:'8px', minWidth:0}}>
          <div style={{fontFamily:'var(--m-font)', fontSize:'10px', fontWeight:'700', color:'var(--m-ink-sub)', textTransform:'uppercase', letterSpacing:'0.5px'}}>
            Estimasi Jangkauan <span style={{margin:'0 2px'}}>•</span> Radius {radius.toFixed(1)} KM
          </div>
          <div style={{display:'flex', alignItems:'center', gap:'4px', marginTop:'2px', minWidth:0}}>
            <span style={{fontFamily:'var(--m-font)', fontSize:'16px', fontWeight:'800', color:'var(--m-brand)', flexShrink:0}}>
              {reach.hi ? `${fmtReach(reach.lo)}–${fmtReach(reach.hi)}` : '0'}
            </span>
            <span style={{fontFamily:'var(--m-font)', fontSize:'13px', fontWeight:'500', color:'var(--m-ink-sub)', display:'flex', alignItems:'center', flex:1, minWidth:0}}>
              {reach.hi ? (
                <>
                  {localOn && <span style={{whiteSpace:'nowrap', flexShrink:0}}>warga&nbsp;</span>}
                  {localOn && (
                    <span style={{
                      whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis',
                      flexShrink:1, minWidth:0
                    }}>
                      {locName || 'sekitar'}
                    </span>
                  )}
                  {localOn && travelerOn && <span style={{margin:'0 4px', whiteSpace:'nowrap', flexShrink:0}}>·</span>}
                  {travelerOn && <span style={{whiteSpace:'nowrap', flexShrink:0}}>pengunjung</span>}
                </>
              ) : (
                <span>orang</span>
              )}
            </span>
          </div>
        </div>

        {/* Right: Button */}
        <button onClick={onNext} style={{
          padding:'10px 16px', borderRadius:'12px', flexShrink:0,
          background:'#1A1A1A', color:'#fff', border:'none',
          fontFamily:'var(--m-font)', fontSize:'14px', fontWeight:'700',
          cursor:'pointer', display:'flex', alignItems:'center', gap:'6px',
        }}>
          Lanjut
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
          </svg>
        </button>
      </div>

      {/* ── Bottom Sheet: Peta Diperbesar ── */}
      {isBottomSheet && (
        <>
          <div onClick={closeSheet} style={{
            position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', zIndex:9998,
            opacity: animateSheet ? 1 : 0, transition:'opacity 0.3s ease-out',
          }} />
          <div style={{
            position:'fixed', bottom:0, left:0, right:0, zIndex:9999,
            background:'#fff', borderRadius:'20px 20px 0 0',
            height:'80vh', display:'flex', flexDirection:'column', overflow:'hidden',
            transform: animateSheet ? 'translateY(0)' : 'translateY(100%)',
            transition:'transform 0.3s ease-out',
          }}>
            {/* Drag handle */}
            <div style={{display:'flex',justifyContent:'center',paddingTop:'10px',flexShrink:0}}>
              <div style={{width:'40px',height:'4px',borderRadius:'2px',background:'#E4E4EB'}} />
            </div>

            {/* Sheet header */}
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'10px 16px 0',flexShrink:0}}>
              <div style={{display:'flex',alignItems:'center',gap:'12px'}}>
                <div style={{width:'36px',height:'36px',borderRadius:'10px',background:'var(--m-brand-soft)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="var(--m-brand)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{width:'18px',height:'18px'}}>
                    <path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                    <path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                  </svg>
                </div>
                <div>
                  <div style={{fontFamily:'var(--m-font)',fontSize:'15px',fontWeight:'700',color:'var(--m-ink)'}}>Tentukan Titik Target Iklanmu</div>
                  <div style={{fontFamily:'var(--m-font)',fontSize:'11px',color:'var(--m-ink-sub)',marginTop:'2px'}}>Radius {radius.toFixed(1)} KM · {locName || 'Lokasiku'}</div>
                </div>
              </div>
              <button type="button" onClick={e => { e.stopPropagation(); e.preventDefault(); closeSheet(); }} style={{
                width:'32px',height:'32px',borderRadius:'50%',background:'#F4F4F7',
                border:'none',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',flexShrink:0,zIndex:50,
              }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="var(--m-ink)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{width:'16px',height:'16px'}}>
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>

            <SearchBar
              searchVal={searchVal}
              onInput={handleSearchInput}
              results={searchResults}
              showDropdown={showDropdown}
              onSelect={selectCity}
              onClear={handleClear}
              onFocus={handleFocus}
            />

            <div style={{height:'8px',flexShrink:0}} />
            <div ref={bottomSheetMapRef} style={{flex:1,position:'relative',minHeight:0}} />
            <div style={{background:'#fff',borderTop:'1px solid #E4E4EB',flexShrink:0}}>
              <RadiusSlider radius={radius} onChange={setRadius} />
            </div>
          </div>
        </>
      )}

      {/* Backdrop to close dropdown */}
      {showDropdown && (
        <div style={{position:'fixed',inset:0,zIndex:499}} onClick={() => setShowDropdown(false)} />
      )}
    </div>
  );
}
