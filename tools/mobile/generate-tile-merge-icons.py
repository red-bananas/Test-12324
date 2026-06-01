#!/usr/bin/env python3
"""Generate Tile Merge launcher icons and splash assets for EAS builds."""

from __future__ import annotations

from pathlib import Path

from PIL import Image, ImageDraw

APP_DIR = Path(__file__).resolve().parents[2] / "apps/mobile/tile-merge"
ASSETS = APP_DIR / "assets"

BG = (28, 27, 34)  # #1c1b22
ACCENT = (255, 122, 89)  # #ff7a59
TILE = (61, 57, 72)
TILE_LIGHT = (255, 154, 122)


def draw_icon(size: int) -> Image.Image:
    img = Image.new("RGBA", (size, size), BG + (255,))
    draw = ImageDraw.Draw(img)
    margin = size * 0.18
    grid = size - margin * 2
    cell = grid / 4
    gap = cell * 0.08
    tile_size = cell - gap

    def tile(x: int, y: int, fill: tuple[int, int, int], label: str | None = None) -> None:
        left = margin + x * cell + gap / 2
        top = margin + y * cell + gap / 2
        right = left + tile_size
        bottom = top + tile_size
        radius = tile_size * 0.12
        draw.rounded_rectangle((left, top, right, bottom), radius=radius, fill=fill)
        if label:
            font_size = max(int(tile_size * 0.42), 12)
            try:
                from PIL import ImageFont

                font = ImageFont.truetype("arial.ttf", font_size)
            except OSError:
                font = ImageFont.load_default()
            bbox = draw.textbbox((0, 0), label, font=font)
            tw = bbox[2] - bbox[0]
            th = bbox[3] - bbox[1]
            draw.text(
                (left + (tile_size - tw) / 2, top + (tile_size - th) / 2 - bbox[1]),
                label,
                fill=(245, 243, 239),
                font=font,
            )

    for x in range(4):
        for y in range(4):
            tile(x, y, TILE)

    tile(0, 3, ACCENT, "2")
    tile(1, 3, TILE_LIGHT, "4")
    tile(2, 2, ACCENT, "8")
    tile(3, 1, TILE_LIGHT, "16")
    return img


def main() -> None:
    ASSETS.mkdir(parents=True, exist_ok=True)
    icon = draw_icon(1024)
    icon.save(ASSETS / "icon.png")
    icon.save(ASSETS / "adaptive-icon.png")
    splash = draw_icon(512)
    splash.save(ASSETS / "splash-icon.png")
    print(f"Wrote icons under {ASSETS}")


if __name__ == "__main__":
    main()
