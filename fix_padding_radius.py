import re

with open("index.html", "r", encoding="utf-8") as f:
    c = f.read()

# Add the new CSS rules into the existing <style> block
new_css = """
  /* EXACT PADDING TO MATCH REFERENCE ALIGNMENT */
  @media (max-width: 768px) {
    #panel-caption .panel-header {
      padding: 32px 24px 12px 24px !important;
    }
    #mobile-section-ai {
      padding: 12px 24px 32px 24px !important;
    }
    /* EXACT BORDER RADIUS TO MATCH TAYANGKAN BUTTON (12px) */
    #mobile-section-ai .gen-btn {
      border-radius: 12px !important;
    }
  }
"""

if "/* EXACT PADDING" not in c:
    c = c.replace("</style>", new_css + "\n</style>")

# Since the previous fix_final_ui.py injected a padding-top override, let's remove it if it exists so we don't have conflicting rules
c = re.sub(r'@media \(max-width: 768px\) \{\s*#panel-caption \.panel-header \{\s*padding-top: 24px !important;\s*\}\s*\}', '', c)

with open("index.html", "w", encoding="utf-8") as f:
    f.write(c)

print("Injected exact padding and border-radius rules.")
