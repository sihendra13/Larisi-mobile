import re

with open("index.html", "r", encoding="utf-8") as f:
    c = f.read()

# 1. Padding between title and card (margin-top on opt-mode-row)
old_opt = 'class="opt-mode-row" style="background: #F5F5F7; border-radius: 12px; padding: 10px 14px; margin-bottom: 24px;'
new_opt = 'class="opt-mode-row" style="background: #F5F5F7; border-radius: 12px; padding: 10px 14px; margin-bottom: 24px; margin-top: 24px;'
c = c.replace(old_opt, new_opt)

# 2. Chevron padding (previewLabel)
old_pill = 'id="previewLabel" onclick="cycleChannel()" style="cursor:pointer; user-select:none; background: #fff; border: 1px solid rgba(0,0,0,0.12); border-radius: 99px; padding: 6px 12px 6px 10px; font-size: 13px; font-weight: 600; color: var(--m-ink); display: flex; align-items: center; gap: 6px;"'
new_pill = 'id="previewLabel" onclick="cycleChannel()" style="cursor:pointer; user-select:none; background: #fff; border: 1px solid rgba(0,0,0,0.12); border-radius: 99px; padding: 6px 16px 6px 12px; font-size: 13px; font-weight: 600; color: var(--m-ink); display: flex; align-items: center; gap: 6px;"'
c = c.replace(old_pill, new_pill)

# chevron margin
c = c.replace('stroke-linejoin="round" style="margin-left:2px"><path d="m6 9 6 6 6-6"/></svg>', 'stroke-linejoin="round" style="margin-left:6px"><path d="m6 9 6 6 6-6"/></svg>')

# 3. Textarea box styling (warna dan shadow)
old_box = 'class="caption-box" style="background: #F5F5F7; border-radius: 12px; padding: 16px; margin-bottom: 16px; display: flex; flex-direction: column;"'
new_box = 'class="caption-box" style="background: #F9F9FB; border: 1px solid rgba(0,0,0,0.06); box-shadow: inset 0 2px 4px rgba(0,0,0,0.02); border-radius: 12px; padding: 16px; margin-bottom: 16px; display: flex; flex-direction: column;"'
c = c.replace(old_box, new_box)

# 4. Generate button rounded shape and remove shadow, change icon back to loader-2
old_btn = 'id="genBtn" onclick="generateCaptionAI()" style="width: 100%; padding: 14px; border-radius: 16px; background: var(--m-ink, #111); color: #fff; border: none; font-weight: 600; font-size: 13px; display: flex; align-items: center; justify-content: center; gap: 8px;">'
new_btn = 'id="genBtn" onclick="generateCaptionAI()" style="width: 100%; padding: 14px; border-radius: 99px; background: var(--m-ink, #111); color: #fff; border: none; font-weight: 600; font-size: 13px; display: flex; align-items: center; justify-content: center; gap: 8px; box-shadow: none;">'
c = c.replace(old_btn, new_btn)

# change loader back to loader-2
c = c.replace('data-lucide="loader"', 'data-lucide="loader-2"')

with open("index.html", "w", encoding="utf-8") as f:
    f.write(c)
print("Updated index.html to match reference exactly.")
