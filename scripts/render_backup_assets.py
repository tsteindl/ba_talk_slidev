"""Crop exact algorithms and tables from the PDF built by the thesis LaTeX pipeline."""

from __future__ import annotations

import json
from pathlib import Path

import fitz


HERE = Path(__file__).resolve().parents[1]
WORKSPACE = HERE.parent
THESIS_PDF = WORKSPACE / "thesis" / "main-thesis.pdf"
OUTPUT = HERE / "public" / "assets" / "backup-latex"
MANIFEST = HERE / "sources" / "backup-crops.json"

# Each height is measured from the caption anchor in the thesis PDF. The anchor
# is searched globally, so page-number changes do not silently select the wrong page.
CROPS = [
    # Algorithms 1--7.
    ("algorithm", "algorithm-01.png", "Algorithm 1 Simulation", -7, 210),
    ("algorithm", "algorithm-02.png", "Algorithm 2 Simulate", -7, 101),
    ("algorithm", "algorithm-03.png", "Algorithm 3 Estimate", -7, 92),
    ("algorithm", "algorithm-04a.png", "Algorithm 4 Estimate", -7, 255),
    ("algorithm", "algorithm-04b.png", "Algorithm 4 Estimate", 235, 175),
    ("algorithm", "algorithm-05.png", "Algorithm 5 Statistical", -7, 187),
    ("algorithm", "algorithm-06a.png", "Algorithm 6 Simulate", -7, 270),
    ("algorithm", "algorithm-06b.png", "Algorithm 6 Simulate", 240, 210),
    ("algorithm", "algorithm-07.png", "Algorithm 7 Estimate", -7, 147),
    # Every table currently rendered by the thesis, including both tables emitted
    # by the diagnostics generator and both parameter tables.
    ("table", "table-03-01.png", "Table 3.1:", -7, 288),
    ("table", "table-04-01.png", "Table 4.1:", -7, 315),
    ("table", "table-04-02.png", "Table 4.2:", -7, 230),
    ("table", "table-04-03.png", "Table 4.3:", -7, 215),
    ("table", "table-04-04.png", "Table 4.4:", -7, 253),
    ("table", "table-04-05.png", "Table 4.5:", -7, 176),
    ("table", "table-04-06.png", "Table 4.6:", -7, 216),
    ("table", "table-b-01a.png", "Table B.1:", -7, 225),
    ("table", "table-b-01b.png", "Table B.1:", 200, 205),
    ("table", "table-b-02a.png", "Table B.2:", -7, 245),
    ("table", "table-b-02b.png", "Table B.2:", 225, 285),
    ("table", "table-b-03.png", "Table B.3:", -7, 219),
    ("table", "table-c-01.png", "Table C.1:", -7, 153),
    ("table", "table-c-02.png", "Table C.2:", -7, 265),
]


def locate(document: fitz.Document, anchor: str) -> tuple[int, fitz.Rect]:
    matches = []
    for page_index, page in enumerate(document):
        matches.extend((page_index, rect) for rect in page.search_for(anchor))
    if len(matches) != 1:
        raise RuntimeError(f"Expected one PDF match for {anchor!r}, found {len(matches)}")
    return matches[0]


def main() -> None:
    if not THESIS_PDF.exists():
        raise FileNotFoundError(f"Build the thesis first: {THESIS_PDF}")

    OUTPUT.mkdir(parents=True, exist_ok=True)
    for old_crop in OUTPUT.glob("*.png"):
        old_crop.unlink()
    document = fitz.open(THESIS_PDF)
    manifest = []
    for kind, filename, anchor, top_offset, height in CROPS:
        page_index, hit = locate(document, anchor)
        page = document[page_index]
        top = hit.y0 + top_offset
        crop = fitz.Rect(72, top, page.rect.width - 72, min(page.rect.height - 70, top + height))
        pixmap = page.get_pixmap(matrix=fitz.Matrix(3, 3), clip=crop, alpha=False)
        pixmap.save(OUTPUT / filename)
        manifest.append({
            "kind": kind,
            "file": filename,
            "anchor": anchor,
            "thesis_page": page_index + 1,
        })

    MANIFEST.write_text(json.dumps(manifest, indent=2) + "\n", encoding="utf-8")
    print(f"Rendered {len(manifest)} exact LaTeX crops from {THESIS_PDF.name}")


if __name__ == "__main__":
    main()
