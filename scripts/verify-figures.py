import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
MAP = json.loads((ROOT / "lib/standards/figure-map.json").read_text(encoding="utf-8"))
FIG_DIR = ROOT / "public/standards/figures"

clause_to_figure = {}
for entry in MAP["figures"].values():
    for clause in entry.get("clauses", []):
        clause_to_figure[clause.replace(" ", "")] = entry["file"]

def resolve_figure(value):
    if not value:
        return None
    m = __import__("re").match(r"^figure[_-]?(\d+)$", str(value).strip(), __import__("re").I)
    if m:
        return f"/standards/figures/figure_{int(m.group(1)):02d}.png"
    return None

samples = [
    ("reference figure_23", resolve_figure("figure_23")),
    ("clause 3.1.1.2", clause_to_figure.get("3.1.1.2")),
    ("clause 3.1.5.1", clause_to_figure.get("3.1.5.1")),
]

png_count = len(list(FIG_DIR.glob("figure_*.png")))
print("png_count", png_count)
print("figure_map", MAP["count"])
print("clause_links", len(clause_to_figure))
for label, path in samples:
    exists = (ROOT / "public" / path.lstrip("/")).exists() if path else False
    print(label, path, "exists" if exists else "missing")
