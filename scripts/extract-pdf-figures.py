import fitz
import json
import re
from pathlib import Path

PDF = Path(__file__).resolve().parents[1] / "standards-source" / "maypho6301.pdf"
OUT_DIR = Path(__file__).resolve().parents[1] / "public" / "standards" / "figures"
MAP_OUT = Path(__file__).resolve().parents[1] / "lib" / "standards" / "figure-map.json"

CLAUSE = re.compile(r"\(ข้อ\s*([0-9.]+(?:\s*\([0-9.]+\))?)\)")
CAPTION = re.compile(r"รูปที่\s*(\d+)")
HEADER_NOISE = re.compile(
    r"มยผ\.?\s*6301|หน้าที่\s*\d+|สำหรับผู้พิการ|ทุพพลภาพและคนชรา",
    re.I,
)

REPLACEMENTS = [
    ("ส าหรับ", "สำหรับ"),
    ("ต ่า", "ต่ำ"),
    ("ต าแหน่ง", "ตำแหน่ง"),
    ("จ ากัด", "จำกัด"),
    ("ช าระ", "ชำระ"),
    ("อาบน ้ำ", "อาบน้ำ"),
    ("ห้องอาบน ้ำ", "ห้องอาบน้ำ"),
    ("ห้องส ้วม", "ห้องส้วม"),
    ("ส ้วม", "ส้วม"),
    ("ขั้นต ่า", "ขั้นต่ำ"),
    ("พื้นที่ส าหรับ", "พื้นที่สำหรับ"),
    ("ที่ว่างส าหรับ", "ที่ว่างสำหรับ"),
    ("ราวจับส าหรับ", "ราวจับสำหรับ"),
]


def fix_thai_pdf_spacing(text: str) -> str:
    text = re.sub(r"\s+", " ", text).strip()
    for old, new in REPLACEMENTS:
        text = text.replace(old, new)
    text = re.sub(
        r"([\u0E00-\u0E2E]) ([\u0E31\u0E34-\u0E3A\u0E47-\u0E4E])",
        r"\1\2",
        text,
    )
    return re.sub(r"\s+", " ", text).strip()

doc = fitz.open(PDF)
figures: dict[str, dict] = {}


def block_text(block: dict) -> str:
    parts: list[str] = []
    for line in block.get("lines", []):
        for span in line.get("spans", []):
            parts.append(span.get("text", ""))
    return re.sub(r"\s+", " ", "".join(parts)).strip()


def clean_caption(text: str) -> str:
    text = CAPTION.sub(lambda m: f"รูปที่ {m.group(1)}", text, count=1)
    text = HEADER_NOISE.sub("", text)
    return fix_thai_pdf_spacing(text)


def find_captions_on_page(page) -> list[dict]:
    captions: list[dict] = []
    payload = page.get_text("dict")
    for block in payload.get("blocks", []):
        if block.get("type") != 0:
            continue
        text = block_text(block)
        if not CAPTION.search(text):
            continue
        num = int(CAPTION.search(text).group(1))
        bbox = block["bbox"]
        captions.append(
            {
                "num": num,
                "y0": bbox[1],
                "y1": bbox[3],
                "text": clean_caption(text),
            }
        )
    captions.sort(key=lambda c: c["y0"])
    return captions


for page_index, page in enumerate(doc):
    rect = page.rect
    captions = find_captions_on_page(page)
    if not captions:
        continue

    clauses_on_page = [m.group(1).strip() for m in CLAUSE.finditer(page.get_text("text"))]
    content_top = rect.y0 + rect.height * 0.22

    for i, cap in enumerate(captions):
        key = str(cap["num"])
        img_top = content_top if i == 0 else captions[i - 1]["y1"] + 12
        img_bottom = cap["y0"] - 10

        if img_bottom - img_top < 60:
            img_top = max(content_top, cap["y0"] - rect.height * 0.55)
            img_bottom = cap["y0"] - 10

        margin_x = rect.width * 0.06
        clip = fitz.Rect(
            rect.x0 + margin_x,
            img_top,
            rect.x1 - margin_x,
            img_bottom,
        )

        assigned: list[str] = []
        cap_clauses = [m.group(1).strip() for m in CLAUSE.finditer(cap["text"])]
        if cap_clauses:
            assigned = cap_clauses
        elif len(captions) == 1:
            assigned = clauses_on_page
        elif i < len(clauses_on_page):
            assigned = [clauses_on_page[i]]
        elif clauses_on_page:
            assigned = [clauses_on_page[-1]]

        caption_text = cap["text"]
        if not caption_text:
            caption_text = f"รูปที่ {cap['num']}"

        if key not in figures:
            figures[key] = {
                "figure": cap["num"],
                "page": page_index + 1,
                "clauses": [],
                "caption": caption_text,
                "file": f"/standards/figures/figure_{cap['num']:02d}.png",
            }
        else:
            figures[key]["caption"] = caption_text

        for clause in assigned:
            if clause not in figures[key]["clauses"]:
                figures[key]["clauses"].append(clause)

        pix = page.get_pixmap(matrix=fitz.Matrix(2, 2), clip=clip, alpha=False)
        OUT_DIR.mkdir(parents=True, exist_ok=True)
        pix.save(OUT_DIR / f"figure_{cap['num']:02d}.png")

MAP_OUT.write_text(
    json.dumps({"count": len(figures), "figures": figures}, ensure_ascii=False, indent=2),
    encoding="utf-8",
)

# Normalize Thai spacing in all captions
for entry in figures.values():
    if entry.get("caption"):
        entry["caption"] = fix_thai_pdf_spacing(entry["caption"])
        entry["caption"] = entry["caption"].replace("ด้านผาย", "ด้านลาด")

print("figures", len(figures))
print("with_caption", sum(1 for f in figures.values() if f.get("caption")))
print("with_clauses", sum(1 for f in figures.values() if f.get("clauses")))
