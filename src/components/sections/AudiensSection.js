'use client';
import { useEffect } from 'react';

export default function AudiensSection() {
  useEffect(() => {
    // Init Leaflet map setelah komponen mount
    if (typeof window !== 'undefined' && window.initMap) {
      setTimeout(() => window.initMap?.(), 200);
    }
  }, []);

  return (
    <>
      {/* Card Audiens */}
      <div className="panel" id="panel-audiens-card">
        <div className="panel-body" style={{padding:'0'}}>
          <div id="mobile-section-audiens">
            <div className="section-label">Siapa Target Audiens Kamu?</div>
            <div className="section-sub">Pilih siapa yang akan lihat iklanmu</div>

            {/* Warga Sekitar */}
            <div className="audience-item">
              <div className="aud-icon-wrap" style={{width:'32px',height:'32px',background:'var(--m-brand-soft)',borderRadius:'8px',display:'flex',alignItems:'center',justifyContent:'center',marginRight:'12px',flexShrink:0}}>
                <svg className="aud-icon" viewBox="0 0 24 24" style={{width:'16px',height:'16px',stroke:'var(--m-brand)',fill:'none'}}>
                  <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>
                </svg>
              </div>
              <div style={{flex:1}}>
                <div className="aud-title">Warga Sekitar</div>
                <div className="aud-desc">Penduduk lokal di sekitar lokasi yang kamu pilih.</div>
              </div>
              <button className="m-toggle on" id="toggleLocal"><div className="m-toggle__knob"></div></button>
            </div>

            {/* Pengunjung */}
            <div className="audience-item" id="travelerItem">
              <div className="aud-icon-wrap" style={{width:'32px',height:'32px',background:'var(--m-brand-soft)',borderRadius:'8px',display:'flex',alignItems:'center',justifyContent:'center',marginRight:'12px',flexShrink:0}}>
                <svg className="aud-icon" viewBox="0 0 24 24" style={{width:'16px',height:'16px',stroke:'var(--m-brand)',fill:'none'}}>
                  <path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                  <path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                </svg>
              </div>
              <div style={{flex:1}}>
                <div className="aud-title">Pengunjung</div>
                <div className="aud-desc">Pendatang atau orang yang sedang berkunjung atau baru saja melewati lokasi ini.</div>
              </div>
              <button className="m-toggle" id="toggleTraveler"><div className="m-toggle__knob"></div></button>
            </div>
          </div>
        </div>
      </div>

      {/* Map */}
      <div className="panel" id="panel-map-desktop" style={{padding:'0',position:'relative',overflow:'visible'}}>
        <div className="map-search">
          <svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input id="mapSearchInput" placeholder="Tentukan titik target iklanmu" autoComplete="off" />
          <div id="searchDropdown" style={{position:'absolute',top:'52px',left:0,right:0,background:'#fff',borderRadius:'0 0 12px 12px',boxShadow:'0 8px 24px rgba(0,0,0,0.12)',zIndex:2000,display:'none',maxHeight:'200px',overflowY:'auto'}}></div>
        </div>
        <div id="map" style={{borderRadius:'var(--radius-card)'}}></div>
        <div className="radius-bar">
          <div className="radius-row">
            <div className="radius-label">Target Radius</div>
            <div className="radius-val" id="radiusVal">1.0 KM</div>
          </div>
          <input type="range" min="1" max="25" defaultValue="1" step="0.5" />
          <div className="drag-hint">Geser untuk memperluas jangkauan</div>
        </div>
      </div>
    </>
  );
}
