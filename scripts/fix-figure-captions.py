import json
import re
from pathlib import Path

import fitz

ROOT = Path(__file__).resolve().parents[1]
PDF = ROOT / "standards-source" / "maypho6301.pdf"
MAP_PATH = ROOT / "lib" / "standards" / "figure-map.json"

# PDF text often inserts spaces before Thai vowel marks / ำ
REPLACEMENTS = [
    ("ส าหรับ", "สำหรับ"),
    ("ส ำหรับ", "สำหรับ"),
    ("ต ่า", "ต่ำ"),
    ("ต าแหน่ง", "ตำแหน่ง"),
    ("จ ากัด", "จำกัด"),
    ("ช าระ", "ชำระ"),
    ("อาบน ้ำ", "อาบน้ำ"),
    ("ห ้องอาบน ้ำ", "ห้องอาบน้ำ"),
    ("ห้องอาบน ้ำ", "ห้องอาบน้ำ"),
    ("ห ้องส ้วม", "ห้องส้วม"),
    ("ห้องส ้วม", "ห้องส้วม"),
    ("ส ้วม", "ส้วม"),
    ("ส าหรับผู้", "สำหรับผู้"),
    ("ขั้นต ่า", "ขั้นต่ำ"),
    ("ที่อยู่ต ่า", "ที่อยู่ต่ำ"),
    ("ราวจับส าหรับ", "ราวจับสำหรับ"),
    ("ที่ว่างส าหรับ", "ที่ว่างสำหรับ"),
    ("พื้นที่ส าหรับ", "พื้นที่สำหรับ"),
    ("ความสูงต ่าสุด", "ความสูงต่ำสุด"),
    ("ก ำหนด", "กำหนด"),
    ("(ต่อ)", "(ต่อ)"),
    ("22(ต่อ)", "22 (ต่อ)"),
    ("ด้านผาย", "ด้านลาด"),
    ("55 (ต่อ)", "55 (ต่อ)"),
    ("19 (ต่อ)", "19 (ต่อ)"),
    ("64 (ต่อ)", "64 (ต่อ)"),
]


def fix_thai_pdf_spacing(text: str) -> str:
    text = re.sub(r"\s+", " ", text).strip()
    for old, new in REPLACEMENTS:
        text = text.replace(old, new)
    # Space before Thai combining marks (ส ำ -> สำ)
    text = re.sub(
        r"([\u0E00-\u0E2E]) ([\u0E31\u0E34-\u0E3A\u0E47-\u0E4E])",
        r"\1\2",
        text,
    )
    text = re.sub(
        r"([\u0E00-\u0E2E]) ([\u0E38-\u0E3A])",
        r"\1\2",
        text,
    )
    return re.sub(r"\s+", " ", text).strip()


def load_index_titles() -> dict[int, str]:
    """Titles from สารบัญรูปภาพ (pages ~11-13)."""
    doc = fitz.open(PDF)
    titles: dict[int, str] = {}
    index_line = re.compile(r"^\s*(\d+)\.\s+(.+?)\s+\d{1,3}\s*$")

    for page_index in range(10, 13):
        for line in doc[page_index].get_text("text").splitlines():
            line = fix_thai_pdf_spacing(line)
            match = index_line.match(line)
            if not match:
                continue
            num = int(match.group(1))
            title = match.group(2).strip()
            if title and num not in titles:
                titles[num] = title

    return titles


def main() -> None:
    data = json.loads(MAP_PATH.read_text(encoding="utf-8"))
    index_titles = load_index_titles()

    for key, entry in data["figures"].items():
        num = int(key)
        if num in index_titles:
            entry["caption"] = f"รูปที่ {num} {index_titles[num]}"
        else:
            caption = entry.get("caption", f"รูปที่ {num}")
            caption = re.sub(r"^รูปที่\s*\d+\s*", "", caption)
            entry["caption"] = f"รูปที่ {num} {fix_thai_pdf_spacing(caption)}"

    MAP_PATH.write_text(
        json.dumps(data, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )

    print("updated", len(data["figures"]), "captions")
    print("from_index", len(index_titles))
    print("sample_4", data["figures"]["4"]["caption"])


if __name__ == "__main__":
    main()
