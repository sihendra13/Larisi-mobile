import re

with open("src/js/phone-preview.js", "r", encoding="utf-8") as f:
    content = f.read()

# We need to make cycleChannel use mobileSelectPlatform if on mobile
content = content.replace(
    "if (badge) badge.textContent = labels[activeChannel];",
    "if (badge) {\n    if (window.innerWidth <= 768 && typeof mobileSelectPlatform === 'function') {\n      mobileSelectPlatform(activeChannel);\n    } else {\n      badge.textContent = labels[activeChannel];\n    }\n  }"
)

with open("src/js/phone-preview.js", "w", encoding="utf-8") as f:
    f.write(content)
