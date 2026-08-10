#!/usr/bin/env python3
"""Generate bundled demo page images for Play Store screenshot mode."""
from __future__ import annotations

from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

REPO = Path(__file__).resolve().parents[2]
OUT = REPO / "apps/mobile/image-to-pdf/assets/screenshots"
SIZE = (900, 1200)


def _font(size: int) -> ImageFont.ImageFont:
    for name in ("arial.ttf", "Arial.ttf", "DejaVuSans.ttf"):
        try:
            return ImageFont.truetype(name, size)
        except OSError:
            continue
    return ImageFont.load_default()


def receipt_page() -> Image.Image:
    img = Image.new("RGB", SIZE, "#FAFAFA")
    draw = ImageDraw.Draw(img)
    title = _font(42)
    body = _font(28)
    draw.text((72, 80), "INVOICE", fill="#1A1D24", font=title)
    draw.text((72, 150), "Acme Supplies Co.", fill="#4A5160", font=body)
    y = 260
    for label, value in [
        ("Date", "Aug 9, 2026"),
        ("Invoice #", "INV-2048"),
        ("Items", "3"),
        ("Subtotal", "$128.40"),
        ("Tax", "$10.27"),
        ("Total", "$138.67"),
    ]:
        draw.text((72, y), label, fill="#6B7280", font=body)
        draw.text((SIZE[0] - 280, y), value, fill="#111827", font=body)
        y += 58
    draw.rounded_rectangle((72, 900, SIZE[0] - 72, 1080), radius=18, outline="#D1D5DB", width=3)
    draw.text((100, 960), "Paid — thank you", fill="#178A61", font=body)
    return img


def notes_page() -> Image.Image:
    img = Image.new("RGB", SIZE, "#FFFDF8")
    draw = ImageDraw.Draw(img)
    title = _font(40)
    body = _font(30)
    draw.text((72, 90), "Meeting notes", fill="#1A1D24", font=title)
    lines = [
        "• Scan receipts for expense report",
        "• Merge pages before sharing",
        "• Export as PDF — no watermark",
        "• Works fully offline on device",
        "",
        "Action items:",
        "1. Crop skewed photo edges",
        "2. Rotate landscape pages",
        "3. Rename PDF before share",
    ]
    y = 190
    for line in lines:
        draw.text((72, y), line, fill="#374151", font=body)
        y += 52
    return img


def photo_page() -> Image.Image:
    img = Image.new("RGB", SIZE, "#E8EDF5")
    draw = ImageDraw.Draw(img)
    draw.rounded_rectangle((90, 140, SIZE[0] - 90, SIZE[1] - 220), radius=28, fill="#C5D0E0")
    draw.ellipse((220, 320, 680, 760), fill="#9DB0CB")
    draw.rounded_rectangle((180, 860, SIZE[0] - 180, 980), radius=20, fill="#FFFFFF")
    draw.text((220, 900), "Gallery photo → PDF page", fill="#1F2937", font=_font(30))
    return img


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    pages = {
        "demo-page-1.png": receipt_page(),
        "demo-page-2.png": notes_page(),
        "demo-page-3.png": photo_page(),
    }
    for name, image in pages.items():
        path = OUT / name
        image.save(path, "PNG", optimize=True)
        print(f"Wrote {path.relative_to(REPO)}")


if __name__ == "__main__":
    main()
