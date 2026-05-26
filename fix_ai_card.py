import re

with open("index.html", "r", encoding="utf-8") as f:
    content = f.read()

# We will replace the entire #mobile-section-ai div
start_marker = '<div id="mobile-section-ai">'
end_marker = '</div> <!-- end mobile-section-ai -->'

start_idx = content.find(start_marker)
end_idx = content.find(end_marker) + len(end_marker)

if start_idx == -1 or end_idx == -1:
    print("Could not find mobile-section-ai")
    exit(1)

new_html = """<div id="mobile-section-ai" style="padding: 16px;">
            <!-- 1. Publish ke Channel Selector -->
            <div class="opt-mode-row" style="background: #F5F5F7; border-radius: 12px; padding: 10px 14px; margin-bottom: 24px; display: flex; align-items: center; justify-content: space-between;">
              <div class="section-label" style="font-size: 13px; font-weight: 500; color: var(--m-ink-sub); margin: 0; text-transform: none; letter-spacing: 0;">Posting ke</div>
              <div class="preview-label-badge" id="previewLabel" onclick="cycleChannel()" style="cursor:pointer; user-select:none; background: #fff; border: 1px solid rgba(0,0,0,0.12); border-radius: 99px; padding: 6px 12px 6px 10px; font-size: 13px; font-weight: 600; color: var(--m-ink); display: flex; align-items: center; gap: 6px;" title="Klik untuk ganti platform">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#E1306C" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="0.8" fill="#E1306C" stroke="none"/></svg>
                Instagram
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-left:2px"><path d="m6 9 6 6 6-6"/></svg>
              </div>
            </div>

            <!-- 2. Visual Filters -->
            <div>
              <div class="section-label" id="aturTampilanLabel" style="display: none !important;">Atur Tampilan Gambar</div>
              <div style="display:flex;flex-direction:column;gap:16px;margin-bottom:24px;">
                <div class="filter-row" style="display: grid; grid-template-areas: 'label val' 'slider slider'; grid-template-columns: 1fr auto; row-gap: 8px; align-items: center;">
                  <div class="filter-label" style="grid-area: label; font-size: 13px; color: var(--m-ink-sub);">Terang-Gelap</div>
                  <input type="range" min="0" max="100" value="100" oninput="brightnessVal=parseInt(this.value)*2;document.getElementById('bVal').textContent=this.value+'%';applyFilters()" style="grid-area: slider; -webkit-appearance: none; width: 100%; height: 4px; background: var(--m-ink); border-radius: 4px; outline: none; margin: 0;">
                  <div class="filter-val" id="bVal" style="grid-area: val; font-size: 13px; font-weight: 600; color: var(--m-ink);">100%</div>
                </div>
                <div class="filter-row" style="display: grid; grid-template-areas: 'label val' 'slider slider'; grid-template-columns: 1fr auto; row-gap: 8px; align-items: center;">
                  <div class="filter-label" style="grid-area: label; font-size: 13px; color: var(--m-ink-sub);">Ketajaman Warna</div>
                  <input type="range" min="0" max="100" value="100" oninput="contrastVal=parseInt(this.value)*2;document.getElementById('cVal').textContent=this.value+'%';applyFilters()" style="grid-area: slider; -webkit-appearance: none; width: 100%; height: 4px; background: var(--m-ink); border-radius: 4px; outline: none; margin: 0;">
                  <div class="filter-val" id="cVal" style="grid-area: val; font-size: 13px; font-weight: 600; color: var(--m-ink);">100%</div>
                </div>
              </div>
            </div>

            <!-- 3. AI Caption -->
            <div>
              <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;">
                <div class="section-label" style="font-size: 13px; font-weight: 700; color: var(--m-ink); margin: 0; text-transform: none; letter-spacing: 0;">Pesan dioptimalkan AI</div>
                <div id="captionPlatformLabel" style="font-size:11px;font-weight:700;color:#4A3FCC;text-transform:uppercase;letter-spacing:.5px;display:flex;align-items:center;gap:4px;"></div>
              </div>
              <div class="caption-box" style="background: #F5F5F7; border-radius: 12px; padding: 16px; margin-bottom: 16px; display: flex; flex-direction: column;">
                <textarea id="captionArea" placeholder="Tunggu sebentar, AI akan menuliskan pesan untukmu. Kamu bebas mengeditnya kembali agar lebih sesuai." rows="5" style="background: transparent; border: none; font-size: 13px; color: var(--m-ink-sub); line-height: 1.5; resize: none; padding: 0; min-height: 80px; width: 100%; outline: none;"></textarea>
              </div>
              <div class="caption-actions" style="margin-top: 0;">
                <button class="gen-btn" id="genBtn" onclick="generateCaptionAI()" style="width: 100%; padding: 14px; border-radius: 16px; background: var(--m-ink, #111); color: #fff; border: none; font-weight: 600; font-size: 13px; display: flex; align-items: center; justify-content: center; gap: 8px;">
                  <i data-lucide="loader-2" style="width:16px;height:16px;stroke-width:2.2;"></i>Generate ulang
                </button>
              </div>
            </div>
            </div> <!-- end mobile-section-ai -->"""

new_content = content[:start_idx] + new_html + content[end_idx:]

with open("index.html", "w", encoding="utf-8") as f:
    f.write(new_content)

print("Updated index.html successfully.")
