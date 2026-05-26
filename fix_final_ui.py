import re

with open("index.html", "r", encoding="utf-8") as f:
    c = f.read()

# 1. Add padding-top to #panel-caption .panel-header
if "<style>" in c:
    c = c.replace("<style>", "<style>\n  @media (max-width: 768px) {\n    #panel-caption .panel-header {\n      padding-top: 24px !important;\n    }\n  }\n")

# 2. Revert Generate ulang button border-radius to 16px
old_btn = 'border-radius: 99px; background: var(--m-ink, #111); color: #fff; border: none; font-weight: 600; font-size: 13px; display: flex; align-items: center; justify-content: center; gap: 8px; box-shadow: none;">'
new_btn = 'border-radius: 16px; background: var(--m-ink, #111); color: #fff; border: none; font-weight: 600; font-size: 13px; display: flex; align-items: center; justify-content: center; gap: 8px; box-shadow: none;">'
c = c.replace(old_btn, new_btn)

# 3. Revert Tunggu sebentar box back to flat grey #F5F5F7 without borders
old_box = 'class="caption-box" style="background: #F9F9FB; border: 1px solid rgba(0,0,0,0.06); box-shadow: inset 0 2px 4px rgba(0,0,0,0.02); border-radius: 12px; padding: 16px; margin-bottom: 16px; display: flex; flex-direction: column;"'
new_box = 'class="caption-box" style="background: #F5F5F7; border-radius: 12px; padding: 16px; margin-bottom: 16px; display: flex; flex-direction: column; border: none; box-shadow: none;"'
c = c.replace(old_box, new_box)

# 4. Make Terang-Gelap and Ketajaman Warna 1 line
old_label1 = '<div class="filter-label" style="grid-area: label; font-size: 13px; color: var(--m-ink-sub);">'
new_label1 = '<div class="filter-label" style="grid-area: label; font-size: 13px; color: var(--m-ink-sub); white-space: nowrap;">'
c = c.replace(old_label1, new_label1)

with open("index.html", "w", encoding="utf-8") as f:
    f.write(c)
print("Updated index.html based on user feedback.")
