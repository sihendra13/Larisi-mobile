'use client';

export default function AsetSection() {
  return (
    <div className="panel" id="panel-upload">
      {/* Header card */}
      <div className="panel-header" style={{display:'flex'}}>
        <div className="panel-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
          </svg>
        </div>
        <div>
          <div className="panel-title">Aset Kreatif</div>
          <div className="panel-sub">Maksimal 5 Foto atau 1 Video</div>
        </div>
      </div>

      <div className="panel-body">
        <div id="mobile-section-aset">
          {/* Upload zone */}
          <div className="upload-zone" id="uploadZone" onClick={() => document.getElementById('fileInput')?.click()}>
            <div className="plus-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
                <polyline points="17 8 12 3 7 8"/>
                <line x1="12" y1="3" x2="12" y2="15"/>
              </svg>
            </div>
            <div className="upload-label">Unggah Foto/Video</div>
            <div className="upload-caption">Ketuk untuk pilih dari galeri</div>
          </div>
          <input type="file" id="fileInput" accept="image/*,video/*" multiple style={{display:'none'}} />
          <div className="uploaded-thumbs" id="thumbs" style={{display:'none'}}></div>

          <div className="scanning" id="scanning">
            <div className="scan-dot"/><div className="scan-dot"/><div className="scan-dot"/>
            <div className="scan-text" id="scanText">SiLaris sedang menganalisis kontenmu...</div>
          </div>
        </div>

        {/* Vision conflict nudge */}
        <div className="vision-conflict" id="visionConflict">
          <div className="vc-question" id="conflictQuestion">
            SiLaris mendeteksi foto ini sebagai <strong>Makanan</strong>, tapi fokus bisnismu di <strong>Properti</strong>. Apakah foto ini sudah benar?
          </div>
          <div className="vc-actions">
            <button className="vc-btn vc-btn-biz">Ya, lanjutkan</button>
            <button className="vc-btn vc-btn-ai">Ganti foto</button>
          </div>
        </div>

        {/* Master Persona card */}
        <div className="persona-card" id="personaCard">
          <div className="persona-top">
            <div className="persona-check">
              <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            </div>
            <div className="persona-badge" id="personaBadge">Master Persona</div>
          </div>
          <div className="persona-name" id="personaName">Culinary / Cafe</div>
          <div className="persona-targeting" id="personaTarget">Targeting: Foodies &amp; Urban Professionals</div>
          <div className="persona-age" id="personaAge">Age range: 20–40 · Mixed</div>
          <div className="persona-tags" id="personaTags"></div>
        </div>
      </div>
    </div>
  );
}
