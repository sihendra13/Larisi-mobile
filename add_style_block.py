with open("index.html", "r", encoding="utf-8") as f:
    content = f.read()

style_block = """
<style>
  /* Slider Track & Thumb Inline Fallback for AI Card */
  #mobile-section-ai input[type="range"]::-webkit-slider-thumb {
    -webkit-appearance: none !important;
    appearance: none !important;
    width: 18px !important;
    height: 18px !important;
    border-radius: 50% !important;
    background: var(--m-ink, #111) !important;
    cursor: pointer !important;
    border: none !important;
    box-shadow: none !important;
    margin-top: -7px !important;
  }
  #mobile-section-ai input[type="range"]::-webkit-slider-runnable-track {
    width: 100% !important;
    height: 4px !important;
    background: var(--m-ink, #111) !important;
    border-radius: 4px !important;
  }
</style>
<div id="mobile-section-ai"
"""

content = content.replace('<div id="mobile-section-ai"', style_block)

with open("index.html", "w", encoding="utf-8") as f:
    f.write(content)

print("Added <style> block successfully.")
