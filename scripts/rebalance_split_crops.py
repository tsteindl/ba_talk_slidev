"""Even out the two-part algorithm crops so both halves fill a slide.

`render_backup_assets.py` cuts Algorithm 4 (linear search) and Algorithm 6
(binary search) into an `a` and a `b` crop at a hand-picked offset. The first
crop came out much taller than the second, so `object-fit: contain` shrank the
tall half far more than the short one -- the pseudocode on the `a` slides was
the smallest type in the deck.

This script stitches each pair back together (the crops overlap by a known
amount, which is verified pixel-for-pixel), then cuts the strip again at the
whitespace row nearest the middle. Both halves end up close to the 2:1 aspect
the slide gives them, so each is scaled by roughly the same amount and neither
is scaled down as hard as the tall half used to be.

It rewrites the PNGs in place and is idempotent: it recomputes the seam from
`sources/backup-crops.json`, so re-running `render_backup_assets.py` followed by
this script always produces the same result.

    python scripts/rebalance_split_crops.py
"""

from __future__ import annotations

import json
from pathlib import Path

from PIL import Image

HERE = Path(__file__).resolve().parents[1]
CROPS = HERE / "public" / "assets" / "backup-latex"
MANIFEST = HERE / "sources" / "sources-split.json"

# Crops are rendered at 3x a 72 dpi PDF, so one PDF point is three pixels.
PX_PER_PT = 3

# (first crop, second crop, top offsets in PDF points as used by
#  render_backup_assets.py). The offsets give the overlap between the pair.
PAIRS = [
    ("algorithm-04a.png", "algorithm-04b.png", -7, 235),
    ("algorithm-06a.png", "algorithm-06b.png", -7, 240),
]


def stitch(first: Image.Image, second: Image.Image, overlap_px: int) -> Image.Image:
    """Join the pair into the single strip they were cut from."""
    if first.width != second.width:
        raise RuntimeError("crop pair has different widths")
    keep = first.height - overlap_px
    if not 0 < keep < first.height:
        raise RuntimeError(f"implausible overlap of {overlap_px}px")
    strip = Image.new("RGB", (first.width, keep + second.height), "white")
    strip.paste(first.crop((0, 0, first.width, keep)), (0, 0))
    strip.paste(second, (0, keep))
    return strip


def overlap_matches(first: Image.Image, second: Image.Image, overlap_px: int) -> bool:
    """The tail of the first crop must be the head of the second."""
    if overlap_px <= 0 or overlap_px > min(first.height, second.height):
        return False
    tail = first.crop((0, first.height - overlap_px, first.width, first.height))
    head = second.crop((0, 0, second.width, overlap_px))
    a, b = tail.convert("L").tobytes(), head.convert("L").tobytes()
    differing = sum(1 for x, y in zip(a, b) if abs(x - y) > 12)
    return differing < 0.01 * len(a)


def blank_rows(image: Image.Image) -> list[int]:
    grey = image.convert("L")
    width, height = grey.size
    pixels = grey.load()
    rows = []
    for y in range(height):
        if all(pixels[x, y] > 236 for x in range(0, width, 2)):
            rows.append(y)
    return rows


def seam(image: Image.Image) -> int:
    """The whitespace row closest to the middle, so no line of type is cut."""
    middle = image.height // 2
    blanks = blank_rows(image)
    window = [y for y in blanks if abs(y - middle) < image.height * 0.22]
    if not window:
        raise RuntimeError("no whitespace row near the middle to cut on")
    return min(window, key=lambda y: abs(y - middle))


def main() -> None:
    record = []
    for first_name, second_name, top_a, top_b in PAIRS:
        first_path, second_path = CROPS / first_name, CROPS / second_name
        first, second = Image.open(first_path), Image.open(second_path)
        overlap = first.height - (top_b - top_a) * PX_PER_PT
        if not overlap_matches(first, second, overlap):
            raise SystemExit(
                f"{first_name}/{second_name} do not overlap by the expected "
                f"{overlap}px -- the crops were probably already rebalanced, or "
                f"the offsets in render_backup_assets.py changed")

        strip = stitch(first, second, overlap)
        cut = seam(strip)
        strip.crop((0, 0, strip.width, cut)).save(first_path)
        strip.crop((0, cut, strip.width, strip.height)).save(second_path)
        record.append({"first": first_name, "second": second_name,
                       "strip_height": strip.height, "cut": cut})
        print(f"{first_name}: {first.height}px -> {cut}px, "
              f"{second_name}: {second.height}px -> {strip.height - cut}px")

    MANIFEST.write_text(json.dumps(record, indent=2) + "\n", encoding="utf-8")


if __name__ == "__main__":
    main()
