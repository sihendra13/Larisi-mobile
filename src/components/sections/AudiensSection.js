'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { ID_LOCATIONS } from '@/data/locations';

const DEFAULT_LAT = -7.7956;
const DEFAULT_LNG = 110.3695;

/* ── Reach formula (sama persis desktop reach.js) ── */
function computeReach(locPop, radius, localOn, travelerOn) {
  if (!localOn && !travelerOn) return 0;
  const areaFactor  = Math.PI * radius * radius;
  const densityBase = locPop / (Math.PI * 5 * 5);
  const areaPop     = Math.round(densityBase * areaFactor);
  const localPop    = localOn    ? areaPop                    : 0;
  const travPop     = travelerOn ? Math.round(areaPop * 0.22) : 0;
  return localPop + travPop;
}

function fmtReach(n) {
  if (!n || n === 0) return '0';
  if (n >= 10000) return Math.round(n / 1000) + 'K';
  return n.toLocaleString('id-ID');
}

/* ── Toggle button ── */
const Toggle = ({ on, onToggle }) => (
  <button
    onClick={onToggle}
    style={{
      width:'40px', height:'22px', borderRadius:'99px', border:'none',
      background: on ? 'var(--m-brand)' : '#D7D7DE',
      cursor:'pointer', position:'relative', flexShrink:0,
      transition:'background .2s', padding:0,
    }}
  >
    <div style={{
      position:'absolute', top:'3px',
      left: on ? 'calc(100% - 19px)' : '3px',
      width:'16px', height:'16px', borderRadius:'50%', background:'#fff',
      transition:'left .2s', boxShadow:'0 1px 3px rgba(0,0,0,0.2)',
    }} />
  </button>
);

export default function AudiensSection() {
  const [lat,       setLat]       = useState(DEFAULT_LAT);
  const [lng,       setLng]       = useState(DEFAULT_LNG);
  const [locName,   setLocName]   = useState('Sumbersari, Sleman');
  const [locPop,    setLocPop]    = useState(50000);
  const [radius,    setRadius]    = useState(1.0);
  const [localOn,   setLocalOn]   = useState(true);
  const [travelerOn,setTravelerOn]= useState(false);
  const [searchVal, setSearchVal] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showDropdown, setShowDropdown]   = useState(false);
  const [isBottomSheet, setIsBottomSheet] = useState(false);
  const [animateSheet, setAnimateSheet]   = useState(false);

  const openSheet = () => {
    setIsBottomSheet(true);
    setTimeout(() => setAnimateSheet(true), 10);
  };

  const closeSheet = () => {
    setAnimateSheet(false);
    setTimeout(() => setIsBottomSheet(false), 300);
  };

  /* refs */
  const mapRef               = useRef(null);
  const leafletMapRef        = useRef(null);
  const markerRef            = useRef(null);
  const circleRef            = useRef(null);
  const bottomSheetMapRef    = useRef(null);
  const bottomSheetLeafRef   = useRef(null);
  const searchTimerRef       = useRef(null);
  /* snapshot ref so bottom-sheet effect can read latest state */
  const snapRef = useRef({ lat: DEFAULT_LAT, lng: DEFAULT_LNG, locName: 'Sumbersari, Sleman', locPop: 50000, radius: 1.0 });

  /* keep snapshot up-to-date */
  useEffect(() => {
    snapRef.current = { lat, lng, locName, locPop, radius };
  });

  /* ── Derived reach ── */
  const reach     = computeReach(locPop, radius, localOn, travelerOn);
  const reachText = reach === 0 ? 'Jangkauan: 0 orang' : `Jangkauan: ${fmtReach(reach)} orang`;

  /* ── Update Leaflet popup whenever locName / reach changes ── */
  useEffect(() => {
    if (!markerRef.current) return;
    markerRef.current.setPopupContent(popupHtml(locName, reachText));
  }, [locName, reachText]);

  /* ── Helpers ── */
  function popupHtml(name, rText) {
    return `<div style="text-align:center;padding:2px 4px;min-width:130px;">
      <div style="font-family:'Plus Jakarta Sans',sans-serif;font-size:12px;font-weight:700;color:#1C1C28;">${name}</div>
      <div style="font-family:'Plus Jakarta Sans',sans-serif;font-size:11px;font-weight:700;color:#6d28d9;margin-top:2px;">${rText}</div>
    </div>`;
  }

  const findNearest = useCallback((latitude, longitude) => {
    let nearest = null, minDist = Infinity;
    ID_LOCATIONS.forEach(loc => {
      const d = Math.hypot(loc.lat - latitude, loc.lng - longitude);
      if (d < minDist) { minDist = d; nearest = loc; }
    });
    return nearest;
  }, []);

  const reverseGeocode = useCallback(async (latitude, longitude) => {
    try {
      const r = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&accept-language=id`
      );
      const d = await r.json();
      const a = d.address || {};
      const name = a.village || a.suburb || a.neighbourhood || a.city_district || a.city || a.county || '';
      const city = a.city || a.county || a.state || '';
      const loc  = name + (city && name !== city ? ', ' + city : '');
      if (loc) setLocName(loc);
    } catch (_) { /* ignore */ }
  }, []);

  const movePinTo = useCallback((latitude, longitude) => {
    if (markerRef.current) markerRef.current.setLatLng([latitude, longitude]);
    if (circleRef.current) circleRef.current.setLatLng([latitude, longitude]);
    if (leafletMapRef.current) leafletMapRef.current.flyTo([latitude, longitude], 13, { duration: 1.2 });
    setLat(latitude);
    setLng(longitude);
    const nearest = findNearest(latitude, longitude);
    if (nearest?.pop) setLocPop(nearest.pop);
  }, [findNearest]);

  const moveToUserLocation = useCallback(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        movePinTo(latitude, longitude);
        reverseGeocode(latitude, longitude);
      },
      (err) => console.warn('[map] geolocation:', err.message),
      { timeout: 8000, maximumAge: 60000 }
    );
  }, [movePinTo, reverseGeocode]);

  /* ── Build main map ── */
  useEffect(() => {
    const buildMap = () => {
      if (!mapRef.current || leafletMapRef.current) return;
      const L = window.L;
      const map = L.map(mapRef.current, {
        center: [DEFAULT_LAT, DEFAULT_LNG], zoom: 13,
        zoomControl: true, attributionControl: false,
      });
      L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        subdomains: 'abcd', maxZoom: 19,
      }).addTo(map);

      const icon = L.divIcon({
        className: '',
        html: `<div style="width:14px;height:14px;border-radius:50%;background:#6d28d9;border:2px solid #fff;box-shadow:0 0 0 3px rgba(109,40,217,0.35)"></div>`,
        iconSize: [14, 14], iconAnchor: [7, 7],
      });
      markerRef.current = L.marker([DEFAULT_LAT, DEFAULT_LNG], { icon })
        .addTo(map)
        .bindPopup(popupHtml('Sumbersari, Sleman', 'Jangkauan: 0 orang'),
          { closeButton: false, autoClose: false, closeOnClick: false, offset: [0, -4] })
        .openPopup();

      circleRef.current = L.circle([DEFAULT_LAT, DEFAULT_LNG], {
        radius: 1000, color: '#6d28d9',
        fillColor: '#6d28d9', fillOpacity: 0.12, weight: 1.5,
      }).addTo(map);

      /* Click map → move pin + reverse geocode */
      map.on('click', (e) => {
        const { lat: cLat, lng: cLng } = e.latlng;
        movePinTo(cLat, cLng);
        reverseGeocode(cLat, cLng);
      });

      /* Locate Me button */
      const locBtn = L.control({ position: 'topleft' });
      locBtn.onAdd = () => {
        const btn = L.DomUtil.create('button', '');
        btn.title = 'Gunakan lokasi saya';
        btn.style.cssText = 'width:34px;height:34px;background:#fff;border:2px solid rgba(0,0,0,.2);border-radius:4px;cursor:pointer;font-size:16px;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 6px rgba(0,0,0,.15);';
        btn.innerHTML = '📍';
        L.DomEvent.on(btn, 'click', (e) => {
          L.DomEvent.stopPropagation(e);
          moveToUserLocation();
        });
        return btn;
      };
      locBtn.addTo(map);

      leafletMapRef.current = map;
      moveToUserLocation();
    };

    /* Load Leaflet CSS + JS */
    if (!document.getElementById('leaflet-css')) {
      const css = document.createElement('link');
      css.id = 'leaflet-css'; css.rel = 'stylesheet';
      css.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(css);
    }
    if (window.L) {
      buildMap();
    } else if (!document.getElementById('leaflet-js')) {
      const s = document.createElement('script');
      s.id = 'leaflet-js'; s.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      s.onload = buildMap;
      document.head.appendChild(s);
    } else {
      document.getElementById('leaflet-js').addEventListener('load', buildMap);
    }

    return () => {
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
        markerRef.current = null;
        circleRef.current = null;
      }
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  /* ── Update circle radius ── */
  useEffect(() => {
    if (circleRef.current) circleRef.current.setRadius(radius * 1000);
  }, [radius]);

  /* ── Bottom sheet map ── */
  useEffect(() => {
    if (!isBottomSheet) {
      if (bottomSheetLeafRef.current) {
        bottomSheetLeafRef.current.remove();
        bottomSheetLeafRef.current = null;
      }
      document.body.style.overflow = '';
      return;
    }
    document.body.style.overflow = 'hidden';
    const { lat: bLat, lng: bLng, locName: bName, locPop: bPop, radius: bRad } = snapRef.current;
    const reach2  = computeReach(bPop, bRad, localOn, travelerOn);
    const rText2  = reach2 === 0 ? 'Jangkauan: 0 orang' : `Jangkauan: ${fmtReach(reach2)} orang`;

    const timer = setTimeout(() => {
      if (!bottomSheetMapRef.current || bottomSheetLeafRef.current) return;
      const L = window.L;
      if (!L) return;
      const map = L.map(bottomSheetMapRef.current, {
        center: [bLat, bLng], zoom: 14,
        zoomControl: true, attributionControl: false,
      });
      L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        subdomains: 'abcd', maxZoom: 19,
      }).addTo(map);

      const icon = L.divIcon({
        className: '',
        html: `<div style="width:14px;height:14px;border-radius:50%;background:#6d28d9;border:2px solid #fff;box-shadow:0 0 0 3px rgba(109,40,217,0.35)"></div>`,
        iconSize: [14, 14], iconAnchor: [7, 7],
      });
      L.marker([bLat, bLng], { icon })
        .addTo(map)
        .bindPopup(popupHtml(bName, rText2),
          { closeButton: false, autoClose: false, closeOnClick: false, offset: [0, -4] })
        .openPopup();

      L.circle([bLat, bLng], {
        radius: bRad * 1000, color: '#6d28d9',
        fillColor: '#6d28d9', fillOpacity: 0.12, weight: 1.5,
      }).addTo(map);

      bottomSheetLeafRef.current = map;
      setTimeout(() => map.invalidateSize(), 100);
    }, 80);

    return () => clearTimeout(timer);
  }, [isBottomSheet]); // eslint-disable-line react-hooks/exhaustive-deps

  /* ── Search ── */
  const handleSearchInput = (val) => {
    setSearchVal(val);
    if (!val || val.length < 2) { setShowDropdown(false); setSearchResults([]); return; }
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    searchTimerRef.current = setTimeout(() => {
      const lower = val.toLowerCase();
      const results = ID_LOCATIONS.filter(loc => loc.n.toLowerCase().includes(lower)).slice(0, 7);
      setSearchResults(results);
      setShowDropdown(results.length > 0);
    }, 350);
  };

  const selectCity = (loc) => {
    setShowDropdown(false);
    setSearchVal(loc.n.split(',')[0]);
    const short = loc.n.split(',').slice(0, 2).join(', ');
    setLocName(short);
    if (loc.pop) setLocPop(loc.pop);
    if (markerRef.current) markerRef.current.setLatLng([loc.lat, loc.lng]);
    if (circleRef.current) circleRef.current.setLatLng([loc.lat, loc.lng]);
    if (leafletMapRef.current) leafletMapRef.current.flyTo([loc.lat, loc.lng], 13, { duration: 1.2 });
    setLat(loc.lat);
    setLng(loc.lng);
  };

  const sliderPercent = ((radius - 0.5) / 9.5) * 100;

  const renderSearchBar = () => (
    <div style={{padding:'12px 16px 0', position:'relative'}} onClick={e => e.stopPropagation()}>
      <div style={{
        display:'flex', alignItems:'center', gap:'8px',
        background:'#F4F4F7', borderRadius:'8px',
        padding:'0 12px', height:'38px',
      }}>
        <svg viewBox="0 0 24 24" fill="none" stroke="var(--m-ink-sub)" strokeWidth="2"
             strokeLinecap="round" strokeLinejoin="round" style={{width:'14px', height:'14px', flexShrink:0}}>
          <circle cx="11" cy="11" r="8"/>
          <line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <input
          value={searchVal}
          onChange={e => handleSearchInput(e.target.value)}
          onFocus={() => searchResults.length > 0 && setShowDropdown(true)}
          placeholder="Cari kecamatan atau kota..."
          style={{
            border:'none', background:'none', outline:'none', flex:1,
            fontFamily:'var(--m-font)', fontSize:'13px', color:'var(--m-ink)',
          }}
        />
        {searchVal && (
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); e.preventDefault(); setSearchVal(''); setShowDropdown(false); setSearchResults([]); }}
            style={{background:'none', border:'none', cursor:'pointer', color:'var(--m-ink-sub)', lineHeight:1, padding:0, fontSize:'16px', zIndex: 10}}
          >×</button>
        )}
      </div>

      {showDropdown && searchResults.length > 0 && (
        <div style={{
          position:'absolute', top:'100%', left:'16px', right:'16px',
          background:'#fff', borderRadius:'8px',
          boxShadow:'0 4px 16px rgba(0,0,0,0.12)', zIndex:500,
          overflow:'hidden', marginTop:'4px',
        }}>
          {searchResults.map((loc, i) => (
            <div
              key={i}
              onClick={() => selectCity(loc)}
              style={{
                padding:'10px 14px', fontSize:'12px', cursor:'pointer',
                fontFamily:'var(--m-font)', color:'var(--m-ink)',
                borderBottom: i < searchResults.length - 1 ? '1px solid #F4F4F7' : 'none',
                transition:'background .1s',
              }}
              onMouseOver={e => e.currentTarget.style.background = '#F3EBFF'}
              onMouseOut={e => e.currentTarget.style.background = ''}
            >
              {loc.n}
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderRadiusSlider = () => (
    <div style={{padding:'16px'}}>
      <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'10px'}}>
        <span style={{fontFamily:'var(--m-font)', fontSize:'12px', fontWeight:'600', color:'var(--m-ink)'}}>
          Target Radius
        </span>
        <span style={{fontFamily:'var(--m-font)', fontSize:'12px', fontWeight:'700', color:'var(--m-brand)'}}>
          {radius.toFixed(1)} KM
        </span>
      </div>
      <input
        type="range" min="0.5" max="10" step="0.5"
        className="larisi-slider"
        value={radius}
        onChange={e => setRadius(parseFloat(e.target.value))}
        style={{
          width:'100%',
          background: `linear-gradient(to right, var(--m-brand) 0%, var(--m-brand) ${sliderPercent}%, #E4E4EB ${sliderPercent}%, #E4E4EB 100%)`
        }}
      />
      <div style={{textAlign:'center', marginTop:'8px'}}>
        <span style={{fontFamily:'var(--m-font)', fontSize:'11px', color:'var(--m-ink-sub)'}}>
          Geser untuk memperluas jangkauan
        </span>
      </div>
    </div>
  );

  /* ═══════════════════════ RENDER ═══════════════════════ */
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* ──────────── Card 1: Target Audiens ──────────── */}
      <div className="panel" style={{
        boxShadow:'none', border:'1px solid #E4E4EB', overflow:'hidden',
      }}>
        {/* Header — sama persis layout Aset Kreatif */}
        <div style={{display:'flex', alignItems:'center', gap:'12px', padding:'16px 16px 0'}}>
          <div style={{
            width:'36px', height:'36px', borderRadius:'10px',
            background:'var(--m-brand-soft)', display:'flex',
            alignItems:'center', justifyContent:'center', flexShrink:0,
          }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="var(--m-brand)" strokeWidth="2"
                 strokeLinecap="round" strokeLinejoin="round" style={{width:'18px', height:'18px'}}>
              <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
          </div>
          <div>
            <div style={{fontFamily:'var(--m-font)', fontSize:'16px', fontWeight:'700', color:'var(--m-ink)'}}>
              Siapa Target Audiens Kamu?
            </div>
            <div style={{fontFamily:'var(--m-font)', fontSize:'12px', color:'var(--m-ink-sub)', marginTop:'2px'}}>
              Pilih siapa yang akan lihat iklanmu
            </div>
          </div>
        </div>

        {/* Audience items */}
        <div style={{padding:'0 16px 16px'}}>
          {/* Warga Sekitar */}
          <div style={{display:'flex', alignItems:'center', padding:'14px 0', borderBottom:'1px solid #F0F0F5'}}>
            <div style={{flex:1}}>
              <div style={{fontFamily:'var(--m-font)', fontSize:'14px', fontWeight:'600', color:'var(--m-ink)'}}>Warga Sekitar</div>
              <div style={{fontFamily:'var(--m-font)', fontSize:'12px', color:'var(--m-ink-sub)', marginTop:'2px'}}>
                Penduduk lokal di sekitar lokasi yang kamu pilih
              </div>
            </div>
            <Toggle on={localOn} onToggle={() => setLocalOn(v => !v)} />
          </div>

          {/* Pengunjung */}
          <div style={{display:'flex', alignItems:'center', padding:'14px 0'}}>
            <div style={{flex:1}}>
              <div style={{fontFamily:'var(--m-font)', fontSize:'14px', fontWeight:'600', color:'var(--m-ink)'}}>Pengunjung</div>
              <div style={{fontFamily:'var(--m-font)', fontSize:'12px', color:'var(--m-ink-sub)', marginTop:'2px'}}>
                Pendatang atau orang yang baru saja melewati lokasi ini
              </div>
            </div>
            <Toggle on={travelerOn} onToggle={() => setTravelerOn(v => !v)} />
          </div>
        </div>
      </div>

      {/* ──────────── Card 2: Lokasi Kampanye (map) ──────────── */}
      <div className="panel" style={{
        boxShadow:'none', border:'1px solid #E4E4EB', overflow:'visible',
      }}>
        {/* Header */}
        <div style={{display:'flex', alignItems:'center', gap:'12px', padding:'16px 16px 0'}}>
          <div style={{
            width:'36px', height:'36px', borderRadius:'10px',
            background:'var(--m-brand-soft)', display:'flex',
            alignItems:'center', justifyContent:'center', flexShrink:0,
          }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="var(--m-brand)" strokeWidth="2"
                 strokeLinecap="round" strokeLinejoin="round" style={{width:'18px', height:'18px'}}>
              <path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
              <path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
            </svg>
          </div>
          <div>
            <div style={{fontFamily:'var(--m-font)', fontSize:'16px', fontWeight:'700', color:'var(--m-ink)'}}>
              Tentukan Titik Target Iklanmu
            </div>
            <div style={{fontFamily:'var(--m-font)', fontSize:'12px', color:'var(--m-ink-sub)', marginTop:'2px'}}>
              Klik peta atau cari kecamatan / kota
            </div>
          </div>
        </div>

        {renderSearchBar()}

        {/* Map container */}
        <div style={{padding:'12px 16px 0', position:'relative'}}>
          <div
            ref={mapRef}
            style={{width:'100%', height:'230px', borderRadius:'12px', overflow:'hidden'}}
          />
          {/* Expand button — bottom-right corner of map */}
          <button
            onClick={openSheet}
            title="Perbesar peta"
            style={{
              position:'absolute', bottom:'12px', right:'28px', zIndex:400,
              width:'34px', height:'34px', borderRadius:'50%',
              background:'#fff', border:'none',
              boxShadow:'0 2px 8px rgba(0,0,0,0.18)',
              display:'flex', alignItems:'center', justifyContent:'center',
              cursor:'pointer',
            }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="var(--m-ink)" strokeWidth="2"
                 strokeLinecap="round" strokeLinejoin="round" style={{width:'16px', height:'16px'}}>
              <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/>
            </svg>
          </button>
        </div>

        {renderRadiusSlider()}
      </div>

      {/* ──────────── Bottom Sheet: Peta Diperbesar ──────────── */}
      {isBottomSheet && (
        <>
          {/* Backdrop */}
          <div
            style={{
              position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', zIndex:9998,
              opacity: animateSheet ? 1 : 0, transition: 'opacity 0.3s ease-out'
            }}
            onClick={closeSheet}
          />
          {/* Sheet */}
          <div style={{
            position:'fixed', bottom:0, left:0, right:0, zIndex:9999,
            background:'#fff', borderRadius:'20px 20px 0 0',
            height:'72vh', display:'flex', flexDirection:'column',
            overflow:'hidden',
            transform: animateSheet ? 'translateY(0)' : 'translateY(100%)',
            transition: 'transform 0.3s ease-out'
          }}>
            {/* Drag handle */}
            <div style={{display:'flex', justifyContent:'center', paddingTop:'10px'}}>
              <div style={{width:'40px', height:'4px', borderRadius:'2px', background:'#E4E4EB'}} />
            </div>

            {/* Sheet header */}
            <div style={{
              display:'flex', alignItems:'center', justifyContent:'space-between',
              padding:'10px 16px 12px',
            }}>
              <div style={{display:'flex', alignItems:'center', gap:'12px'}}>
                <div style={{
                  width:'36px', height:'36px', borderRadius:'10px',
                  background:'var(--m-brand-soft)', display:'flex',
                  alignItems:'center', justifyContent:'center', flexShrink:0,
                }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="var(--m-brand)" strokeWidth="2"
                       strokeLinecap="round" strokeLinejoin="round" style={{width:'18px', height:'18px'}}>
                    <path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                    <path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                  </svg>
                </div>
                <div>
                  <div style={{fontFamily:'var(--m-font)', fontSize:'15px', fontWeight:'700', color:'var(--m-ink)'}}>
                    Tentukan Titik Target Iklanmu
                  </div>
                  <div style={{fontFamily:'var(--m-font)', fontSize:'11px', color:'var(--m-ink-sub)', marginTop:'2px'}}>
                    Radius {radius.toFixed(1)} KM · {locName}
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); e.preventDefault(); closeSheet(); }}
                style={{
                  width:'32px', height:'32px', borderRadius:'50%',
                  background:'#F4F4F7', border:'none',
                  display:'flex', alignItems:'center', justifyContent:'center',
                  cursor:'pointer', zIndex: 50
                }}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="var(--m-ink)" strokeWidth="2.5"
                     strokeLinecap="round" strokeLinejoin="round" style={{width:'16px', height:'16px'}}>
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>

            {renderSearchBar()}
            <div style={{ height: '8px' }} />

            {/* Bottom sheet map */}
            <div ref={bottomSheetMapRef} style={{flex:1, position: 'relative'}} />

            <div style={{ background: '#fff', borderTop: '1px solid #E4E4EB' }}>
              {renderRadiusSlider()}
            </div>
          </div>
        </>
      )}

      {/* Close search dropdown on outside click */}
      {showDropdown && (
        <div
          style={{position:'fixed', inset:0, zIndex:499}}
          onClick={() => setShowDropdown(false)}
        />
      )}
    </div>
  );
}
