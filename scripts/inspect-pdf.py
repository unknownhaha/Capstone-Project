import fitz
import re
from pathlib import Path

PDF = Path(__file__).resolve().parents[1] / "standards-source" / "maypho6301.pdf"
OUT = Path(__file__).resolve().parents[1] / "standards-source" / "inspect-output.txt"

doc = fitz.open(PDF)
lines = [f"pages={doc.page_count}"]

for i, page in enumerate(doc):
    text = page.get_text("text")
    hits = re.findall(r"(?:รูป|ภาพ|Figure|Fig\.?)\s*[^\n]{0,40}", text, re.I)
    nums = re.findall(r"\b3\.\d+(?:\.\d+)*\b", text)
    if hits or len(nums) > 3:
        lines.append(f"\n=== page {i+1} ===")
        if hits:
            lines.append("hits: " + " | ".join(hits[:8]))
        if nums:
            lines.append("clause nums sample: " + ", ".join(nums[:12]))
        lines.append(text[:600].replace("\n", " "))

OUT.write_text("\n".join(lines), encoding="utf-8")
print("wrote", OUT)
