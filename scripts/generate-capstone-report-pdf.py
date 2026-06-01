#!/usr/bin/env python3
"""
Generate Thai capstone report PDF from docs/reports/รายงานโครงงาน-การตรวจสอบสิ่งอำนวยความสะดวก.md

Usage (from repo root):
  python scripts/generate-capstone-report-pdf.py

Output:
  docs/reports/รายงานโครงงาน-การตรวจสอบสิ่งอำนวยความสะดวก.pdf
"""

from __future__ import annotations

import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
MD_PATH = ROOT / "docs" / "reports" / "รายงานโครงงาน-การตรวจสอบสิ่งอำนวยความสะดวก.md"
OUT_PATH = MD_PATH.with_suffix(".pdf")

FONT_CANDIDATES = [
    Path(r"C:\Windows\Fonts\LeelawUI.ttf"),
    Path(r"C:\Windows\Fonts\leelawad.ttf"),
    Path(r"C:\Windows\Fonts\tahoma.ttf"),
]


def find_font() -> Path:
    for p in FONT_CANDIDATES:
        if p.exists():
            return p
    raise FileNotFoundError(
        "No Thai-capable TTF found. Install Leelawadee UI or Tahoma on Windows."
    )


def strip_md(line: str) -> str:
    line = line.strip()
    if line.startswith("```"):
        return ""
    line = re.sub(r"\[([^\]]+)\]\([^)]+\)", r"\1", line)
    line = re.sub(r"\*\*([^*]+)\*\*", r"\1", line)
    line = re.sub(r"`([^`]+)`", r"\1", line)
    return line


def parse_blocks(text: str) -> list[tuple[str, str]]:
    """Return list of (style, content). style: title | h1 | h2 | h3 | body | code | hr"""
    blocks: list[tuple[str, str]] = []
    in_code = False
    code_buf: list[str] = []

    for raw in text.splitlines():
        line = raw.rstrip()
        if line.startswith("```"):
            if in_code:
                blocks.append(("code", "\n".join(code_buf)))
                code_buf = []
                in_code = False
            else:
                in_code = True
            continue
        if in_code:
            code_buf.append(line)
            continue

        s = strip_md(line)
        if not s and line.strip() == "":
            continue
        if line.strip() == "---":
            blocks.append(("hr", ""))
            continue
        if line.startswith("# ") and not line.startswith("## "):
            blocks.append(("title", s[2:].strip() if s.startswith("# ") else s))
            continue
        if line.startswith("## "):
            blocks.append(("h1", s[3:].strip() if s.startswith("## ") else s))
            continue
        if line.startswith("### "):
            blocks.append(("h2", s[4:].strip() if s.startswith("### ") else s))
            continue
        if line.startswith("#### "):
            blocks.append(("h3", s[5:].strip() if s.startswith("#### ") else s))
            continue
        if line.startswith("|") and "|" in line[1:]:
            blocks.append(("body", s))
            continue
        if line.startswith("- ") or line.startswith("* "):
            blocks.append(("body", "- " + s[2:].strip()))
            continue
        blocks.append(("body", s))

    return blocks


def build_pdf(blocks: list[tuple[str, str]], font_path: Path) -> None:
    from fpdf import FPDF

    class ReportPDF(FPDF):
        def footer(self):
            self.set_y(-15)
            self.set_font("thai", size=9)
            self.set_text_color(100, 100, 100)
            self.cell(0, 10, f"หน้า {self.page_no()}", align="C")

    pdf = ReportPDF()
    pdf.set_auto_page_break(auto=True, margin=18)
    pdf.add_font("thai", "", str(font_path))
    pdf.add_page()
    pdf.set_font("thai", size=12)

    for style, content in blocks:
        if not content and style != "hr":
            continue
        if style == "hr":
            pdf.ln(4)
            continue
        if style == "title":
            pdf.set_font("thai", size=16)
            pdf.multi_cell(0, 9, content, align="C")
            pdf.ln(4)
            pdf.set_font("thai", size=12)
            continue
        if style == "h1":
            pdf.ln(3)
            pdf.set_font("thai", size=14)
            pdf.multi_cell(0, 8, content)
            pdf.ln(2)
            pdf.set_font("thai", size=12)
            continue
        if style == "h2":
            pdf.ln(2)
            pdf.set_font("thai", size=13)
            pdf.multi_cell(0, 7, content)
            pdf.ln(1)
            pdf.set_font("thai", size=12)
            continue
        if style == "h3":
            pdf.set_font("thai", size=12)
            pdf.multi_cell(0, 7, content)
            pdf.ln(1)
            continue
        if style == "code":
            pdf.set_font("thai", size=10)
            pdf.set_text_color(40, 40, 40)
            pdf.multi_cell(0, 6, content)
            pdf.set_text_color(0, 0, 0)
            pdf.set_font("thai", size=12)
            pdf.ln(2)
            continue
        # body
        pdf.multi_cell(0, 7, content)
        pdf.ln(1)

    pdf.output(str(OUT_PATH))


def main() -> int:
    if not MD_PATH.exists():
        print(f"Missing: {MD_PATH}", file=sys.stderr)
        return 1
    try:
        from fpdf import FPDF  # noqa: F401
    except ImportError:
        print("Install fpdf2: pip install fpdf2", file=sys.stderr)
        return 1

    font = find_font()
    text = MD_PATH.read_text(encoding="utf-8")
    blocks = parse_blocks(text)
    build_pdf(blocks, font)
    print(f"Wrote: {OUT_PATH}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
