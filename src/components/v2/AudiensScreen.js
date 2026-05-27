'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { ID_LOCATIONS } from '@/data/locations';

const DEFAULT_LAT = -7.7956;
const DEFAULT_LNG = 110.3695;

const PLATFORM_LABELS = { instagram:'Instagram', facebook:'Facebook', tiktok:'TikTok', youtube:'YouTube' };

function computeReach(locPop, radius, localOn, travelerOn) {
  if (!localOn && !travelerOn) return 0;
  const areaFactor  = Math.PI * radius * radius;
  const densityBase = locPop / (Math.PI * 5 * 5);
  const areaPop     = Math.round(densityBase * areaFactor);
  const localPop    = localOn    ? areaPop                    : 0;
  const travPop     = travelerOn ? Math.round(areaPop * 0.22) : 0;
  return localPop + travPop;
}

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

export default function AudiensScreen({
  platform, onBack, onNext,
  locName, setLocName, locFull, setLocFull,
  locPop, setLocPop, radius, setRadius,
  localOn, setLocalOn, travelerOn, setTravelerOn,
}) {
  const [searchVal,     setSearchVal]     = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showDropdown,  setShowDropdown]  = useState(false);

  const mapRef        = useRef(null);
  const leafletMapRef = useRef(null);
  const markerRef     = useRef(null);
  const circleRef     = useRef(null);
  const searchTimer   = useRef(null);
  const snapRef       = useRef({ lat: DEFAULT_LAT, lng: DEFAULT_LNG });

  useEffect(() => { snapRef.current = { lat: snapRef.current.lat, lng: snapRef.current.lng }; });

  function popupHtml(name) {
    return `<div style="text-align:center;padding:2px 4px;min-width:120px;">
      <div style="font-family:'Plus Jakarta Sans',sans-serif;font-size:12px;font-weight:700;color:#1C1C28;">${name}</div>
    </div>`;
  }

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
      const village = a.village || a.suburb || a.neighbourhood || a.city_district || a.city || a.county || '';
      const city    = a.city    || a.county || a.state || '';
      const short   = village + (city && village !== city ? ', ' + city : '');
      if (short) { setLocName(village || short); setLocFull(short); }
    } catch (_) {}
  }, [setLocName, setLocFull]);

  const movePinTo = useCallback((lat, lng) => {
    snapRef.current = { lat, lng };
    if (markerRef.current) markerRef.current.setLatLng([lat, lng]);
    if (circleRef.current) circleRef.current.setLatLng([lat, lng]);
    if (leafletMapRef.current) leafletMapRef.current.flyTo([lat, lng], 13, { duration: 1.2 });
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

  /* ── Build map ── */
  useEffect(() => {
    const buildMap = () => {
      if (!mapRef.current || leafletMapRef.current) return;
      const L = window.L;
      const map = L.map(mapRef.current, {
        center: [DEFAULT_LAT, DEFAULT_LNG], zoom: 13,
        zoomControl: true, attributionControl: false,
      });
      /* Dark tiles */
      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        subdomains: 'abcd', maxZoom: 19,
      }).addTo(map);

      const icon = L.divIcon({
        className: '',
        html: `<div style="width:14px;height:14px;border-radius:50%;background:#a78bfa;border:2px solid #fff;box-shadow:0 0 0 4px rgba(167,139,250,0.4)"></div>`,
        iconSize: [14, 14], iconAnchor: [7, 7],
      });
      markerRef.current = L.marker([DEFAULT_LAT, DEFAULT_LNG], { icon })
        .addTo(map)
        .bindPopup(popupHtml(locName), { closeButton:false, autoClose:false, closeOnClick:false, offset:[0,-4] })
        .openPopup();

      circleRef.current = L.circle([DEFAULT_LAT, DEFAULT_LNG], {
        radius: radius * 1000, color: '#a78bfa',
        fillColor: '#7c3aed', fillOpacity: 0.18, weight: 1.5,
      }).addTo(map);

      map.on('click', (e) => {
        movePinTo(e.latlng.lat, e.latlng.lng);
        reverseGeocode(e.latlng.lat, e.latlng.lng);
      });

      /* Locate Me */
      const locBtn = L.control({ position: 'topleft' });
      locBtn.onAdd = () => {
        const btn = L.DomUtil.create('button', '');
        btn.innerHTML = '📍';
        btn.style.cssText = 'width:34px;height:34px;background:#1a1a2e;border:1px solid rgba(255,255,255,.2);border-radius:4px;cursor:pointer;font-size:16px;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 6px rgba(0,0,0,.4);';
        L.DomEvent.on(btn, 'click', (ev) => { L.DomEvent.stopPropagation(ev); moveToUserLocation(); });
        return btn;
      };
      locBtn.addTo(map);

      leafletMapRef.current = map;
      moveToUserLocation();
    };

    if (!document.getElementById('leaflet-css')) {
      const css = document.createElement('link');
      css.id = 'leaflet-css'; css.rel = 'stylesheet';
      css.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(css);
    }
    if (window.L) { buildMap(); }
    else if (!document.getElementById('leaflet-js')) {
      const s = document.createElement('script');
      s.id = 'leaflet-js'; s.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      s.onload = buildMap; document.head.appendChild(s);
    } else { document.getElementById('leaflet-js').addEventListener('load', buildMap); }

    return () => {
      if (leafletMapRef.current) { leafletMapRef.current.remove(); leafletMapRef.current = null; markerRef.current = null; circleRef.current = null; }
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  /* ── Sync radius to circle ── */
  useEffect(() => { if (circleRef.current) circleRef.current.setRadius(radius * 1000); }, [radius]);

  /* ── Sync popup label ── */
  useEffect(() => { if (markerRef.current) markerRef.current.setPopupContent(popupHtml(locName)); }, [locName]);

  /* ── Search ── */
  const handleSearch = (val) => {
    setSearchVal(val);
    if (!val || val.length < 2) { setShowDropdown(false); setSearchResults([]); return; }
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
      const lower = val.toLowerCase();
      const res = ID_LOCATIONS.filter(l => l.n.toLowerCase().includes(lower)).slice(0, 7);
      setSearchResults(res); setShowDropdown(res.length > 0);
    }, 350);
  };

  const selectCity = (loc) => {
    setShowDropdown(false);
    setSearchVal(loc.n.split(',')[0]);
    const short = loc.n.split(',').slice(0, 2).join(', ');
    setLocName(loc.n.split(',')[0]); setLocFull(short);
    if (loc.pop) setLocPop(loc.pop);
    movePinTo(loc.lat, loc.lng);
  };

  const sliderPct = ((radius - 0.5) / 9.5) * 100;

  return (
    <div style={{display:'flex', flexDirection:'column', flex:1, overflow:'hidden', background:'var(--m-bg)'}}>

      {/* ── Page header ── */}
      <div style={{padding:'16px 16px 0', background:'var(--m-bg)'}}>
        <div style={{display:'flex', alignItems:'center', gap:'14px', marginBottom:'6px'}}>
          <button onClick={onBack} style={{
            width:'38px', height:'38px', borderRadius:'50%',
            background:'#fff', border:'none', cursor:'pointer',
            display:'flex', alignItems:'center', justifyContent:'center',
            boxShadow:'0 1px 4px rgba(0,0,0,0.10)', flexShrink:0,
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--m-ink)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 18l-6-6 6-6"/>
            </svg>
          </button>
          <h1 style={{fontFamily:'var(--m-font)', fontSize:'26px', fontWeight:'800', color:'var(--m-ink)', lineHeight:'1.2'}}>
            Target Audiens
          </h1>
        </div>
        <p style={{fontFamily:'var(--m-font)', fontSize:'14px', color:'var(--m-ink-sub)', paddingLeft:'52px', marginBottom:'16px'}}>
          Tentukan siapa yang akan melihat iklanmu di {PLATFORM_LABELS[platform] || 'Instagram'}
        </p>
      </div>

      {/* ── Scrollable content ── */}
      <main style={{
        flex:1, overflowY:'auto', padding:'0 16px',
        paddingBottom:'calc(80px + env(safe-area-inset-bottom) + 60px)',
        display:'flex', flexDirection:'column', gap:'12px',
      }}>

        {/* Card: Siapa Target Audiens Kamu? */}
        <div className="panel" style={{boxShadow:'none', border:'1px solid #E4E4EB'}}>
          <div style={{display:'flex', alignItems:'center', gap:'10px', padding:'16px 16px 0'}}>
            <div style={{
              width:'32px', height:'32px', borderRadius:'8px',
              background:'var(--m-brand-soft)', display:'flex',
              alignItems:'center', justifyContent:'center', flexShrink:0,
            }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="var(--m-brand)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{width:'16px',height:'16px'}}>
                <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>
              </svg>
            </div>
            <div style={{fontFamily:'var(--m-font)', fontSize:'15px', fontWeight:'700', color:'var(--m-ink)'}}>
              Siapa Target Audiens Kamu?
            </div>
          </div>
          <div style={{padding:'4px 16px 16px'}}>
            <div style={{display:'flex', alignItems:'center', padding:'14px 0', borderBottom:'1px solid #F0F0F5'}}>
              <div style={{flex:1}}>
                <div style={{fontFamily:'var(--m-font)', fontSize:'14px', fontWeight:'600', color:'var(--m-ink)'}}>Warga Sekitar</div>
                <div style={{fontFamily:'var(--m-font)', fontSize:'12px', color:'var(--m-ink-sub)', marginTop:'2px'}}>Orang yang tinggal di area ini</div>
              </div>
              <Toggle on={localOn} onToggle={() => setLocalOn(v => !v)} />
            </div>
            <div style={{display:'flex', alignItems:'center', padding:'14px 0'}}>
              <div style={{flex:1}}>
                <div style={{fontFamily:'var(--m-font)', fontSize:'14px', fontWeight:'600', color:'var(--m-ink)'}}>Pengunjung</div>
                <div style={{fontFamily:'var(--m-font)', fontSize:'12px', color:'var(--m-ink-sub)', marginTop:'2px'}}>Orang yang sedang berada di sini</div>
              </div>
              <Toggle on={travelerOn} onToggle={() => setTravelerOn(v => !v)} />
            </div>
          </div>
        </div>

        {/* Card: Lokasi Kampanye */}
        <div className="panel" style={{boxShadow:'none', border:'1px solid #E4E4EB', overflow:'hidden'}}>
          {/* Card header */}
          <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', padding:'16px 16px 0'}}>
            <div style={{display:'flex', alignItems:'center', gap:'8px'}}>
              <svg viewBox="0 0 24 24" fill="none" stroke="var(--m-brand)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{width:'16px',height:'16px',flexShrink:0}}>
                <path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                <path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
              </svg>
              <span style={{fontFamily:'var(--m-font)', fontSize:'15px', fontWeight:'700', color:'var(--m-ink)'}}>Lokasi Kampanye</span>
            </div>
            <span style={{fontFamily:'var(--m-font)', fontSize:'12px', color:'var(--m-ink-sub)', fontWeight:'500'}}>
              {locFull || locName}
            </span>
          </div>

          {/* Search */}
          <div style={{padding:'10px 16px 0', position:'relative'}}>
            <div style={{
              display:'flex', alignItems:'center', gap:'8px',
              background:'#F4F4F7', borderRadius:'8px', padding:'0 12px', height:'36px',
            }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="var(--m-ink-sub)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{width:'13px',height:'13px',flexShrink:0}}>
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <input
                value={searchVal}
                onChange={e => handleSearch(e.target.value)}
                onFocus={() => searchResults.length > 0 && setShowDropdown(true)}
                placeholder="Cari kecamatan atau kota..."
                style={{border:'none', background:'none', outline:'none', flex:1, fontFamily:'var(--m-font)', fontSize:'12px', color:'var(--m-ink)'}}
              />
              {searchVal && (
                <button onClick={() => { setSearchVal(''); setShowDropdown(false); setSearchResults([]); }}
                  style={{background:'none', border:'none', cursor:'pointer', color:'var(--m-ink-sub)', fontSize:'16px', padding:0, lineHeight:1}}>×</button>
              )}
            </div>
            {showDropdown && searchResults.length > 0 && (
              <div style={{
                position:'absolute', top:'100%', left:'16px', right:'16px',
                background:'#fff', borderRadius:'8px', boxShadow:'0 4px 16px rgba(0,0,0,0.12)',
                zIndex:500, overflow:'hidden', marginTop:'4px',
              }}>
                {searchResults.map((loc, i) => (
                  <div key={i} onClick={() => selectCity(loc)} style={{
                    padding:'10px 14px', fontSize:'12px', cursor:'pointer',
                    fontFamily:'var(--m-font)', color:'var(--m-ink)',
                    borderBottom: i < searchResults.length-1 ? '1px solid #F4F4F7' : 'none',
                  }}
                  onMouseOver={e => e.currentTarget.style.background='#F3EBFF'}
                  onMouseOut={e => e.currentTarget.style.background=''}
                  >
                    {loc.n}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Dark map */}
          <div style={{padding:'10px 16px 0'}}>
            <div ref={mapRef} style={{width:'100%', height:'220px', borderRadius:'12px', overflow:'hidden'}} />
          </div>

          {/* Radius slider */}
          <div style={{padding:'14px 16px 16px'}}>
            <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'10px'}}>
              <span style={{fontFamily:'var(--m-font)', fontSize:'13px', fontWeight:'600', color:'var(--m-ink)'}}>Target Radius</span>
              <span style={{
                fontFamily:'var(--m-font)', fontSize:'12px', fontWeight:'700', color:'var(--m-brand)',
                background:'var(--m-brand-soft)', padding:'3px 10px', borderRadius:'8px',
              }}>
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
                background:`linear-gradient(to right, var(--m-brand) 0%, var(--m-brand) ${sliderPct}%, #E4E4EB ${sliderPct}%, #E4E4EB 100%)`
              }}
            />
          </div>
        </div>
      </main>

      {/* ── Sticky CTA ── */}
      <div style={{
        position:'fixed',
        bottom:'calc(60px + env(safe-area-inset-bottom) + 12px)',
        left:'16px', right:'16px', zIndex:300,
      }}>
        <button onClick={onNext} style={{
          width:'100%', padding:'16px', borderRadius:'16px',
          background:'#1A1A1A', color:'#fff', border:'none',
          fontFamily:'var(--m-font)', fontSize:'15px', fontWeight:'700',
          cursor:'pointer', display:'flex', alignItems:'center',
          justifyContent:'center', gap:'8px',
        }}>
          Lanjut ke Konten
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
          </svg>
        </button>
      </div>

      {/* Close dropdown on outside click */}
      {showDropdown && (
        <div style={{position:'fixed', inset:0, zIndex:499}} onClick={() => setShowDropdown(false)} />
      )}
    </div>
  );
}
