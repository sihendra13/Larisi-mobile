import re

with open("src/js/mobile.js", "r", encoding="utf-8") as f:
    content = f.read()

new_ig_svg = '\'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#E1306C" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="0.8" fill="#E1306C" stroke="none"/></svg>\''

content = re.sub(r'instagram:\s*\'<svg.*?radialGradient.*?</svg>\',', f'instagram: {new_ig_svg},', content)

# Also update mobileSelectPlatform to add the dropdown arrow
dropdown_svg = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-left:2px"><path d="m6 9 6 6 6-6"/></svg>'

content = content.replace(
    "badge.innerHTML = icon + label;",
    f"badge.innerHTML = icon + label + '{dropdown_svg}';"
)

with open("src/js/mobile.js", "w", encoding="utf-8") as f:
    f.write(content)
