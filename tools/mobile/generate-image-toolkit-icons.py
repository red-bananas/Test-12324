#!/usr/bin/env python3
"""Generate PixShrink (image-toolkit) launcher icons and splash assets."""

from __future__ import annotations

from pathlib import Path

from PIL import Image, ImageDraw

APP_DIR = Path(__file__).resolve().parents[2] / "apps/mobile/image-toolkit"
ASSETS = APP_DIR / "assets"

BG = (15, 17, 21)        # #0f1115
ACCENT = (61, 220, 151)  # #3ddc97 (mint)
PHOTO = (32, 36, 46)     # #20242e
SKY = (45, 52, 66)       # subtle photo "sky"


def draw_icon(size: int) -> Image.Image:
    img = Image.new("RGBA", (size, size), BG + (255,))
    draw = ImageDraw.Draw(img)

    # Inner "photo" card
    m = size * 0.24
    card = (m, m, size - m, size - m)
    radius = size * 0.06
    draw.rounded_rectangle(card, radius=radius, fill=PHOTO)

    left, top, right, bottom = card
    w = right - left
    h = bottom - top

    # Photo content: sun + mountains
    sun_r = w * 0.10
    sun_cx = left + w * 0.30
    sun_cy = top + h * 0.30
    draw.ellipse(
        (sun_cx - sun_r, sun_cy - sun_r, sun_cx + sun_r, sun_cy + sun_r),
        fill=ACCENT,
    )
    draw.polygon(
        [
            (left + w * 0.08, bottom - h * 0.12),
            (left + w * 0.42, top + h * 0.45),
            (left + w * 0.66, bottom - h * 0.12),
        ],
        fill=SKY,
    )
    draw.polygon(
        [
            (left + w * 0.45, bottom - h * 0.12),
            (left + w * 0.72, top + h * 0.55),
            (left + w * 0.95, bottom - h * 0.12),
        ],
        fill=ACCENT,
    )

    # Corner "shrink" arrows (brackets pointing inward)
    arm = size * 0.10
    thick = max(int(size * 0.022), 3)
    inset = size * 0.10
    corners = [
        (inset, inset, 1, 1),                       # top-left
        (size - inset, inset, -1, 1),               # top-right
        (inset, size - inset, 1, -1),               # bottom-left
        (size - inset, size - inset, -1, -1),       # bottom-right
    ]
    for cx, cy, sx, sy in corners:
        draw.line((cx, cy, cx + sx * arm, cy), fill=ACCENT, width=thick)
        draw.line((cx, cy, cx, cy + sy * arm), fill=ACCENT, width=thick)

    return img


def main() -> None:
    ASSETS.mkdir(parents=True, exist_ok=True)
    icon = draw_icon(1024)
    icon.save(ASSETS / "icon.png")
    icon.save(ASSETS / "adaptive-icon.png")
    draw_icon(512).save(ASSETS / "splash-icon.png")
    print(f"Wrote PixShrink icons under {ASSETS}")


if __name__ == "__main__":
    main()
