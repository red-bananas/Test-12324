#!/usr/bin/env python3
"""Build Google Play Store listing images for mobile apps."""
from __future__ import annotations

import argparse
import shutil
import struct
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

PLAY_PHONE = (1080, 1920)  # 9:16 portrait
PLAY_FEATURE = (1024, 500)
PLAY_ICON = (512, 512)
RESAMPLE = Image.Resampling.LANCZOS

APP_GRAPHICS: dict[str, dict[str, object]] = {
    "tile-merge": {
        "bg": (28, 27, 34),
        "accent": (255, 122, 89),
        "feature_title": "Merge Tiles",
        "feature_subtitle": "Offline puzzle · undo · rewarded resume",
    },
    "image-to-pdf": {
        "bg": (11, 13, 18),
        "accent": (239, 83, 80),
        "feature_title": "Free Image to PDF",
        "feature_subtitle": "Offline · No watermark · No account",
    },
}


def png_info(path: Path) -> str:
    data = path.read_bytes()
    if data[:8] != b"\x89PNG\r\n\x1a\n":
        return "not-png"
    w, h, bit, color, *_ = struct.unpack(">IIBBBBB", data[16:29])
    return f"{w}x{h} bit={bit} type={color}"


def assert_rgb_png(path: Path, expected: tuple[int, int]) -> None:
    with Image.open(path) as im:
        if im.size != expected:
            raise SystemExit(f"{path.name}: expected {expected}, got {im.size}")
        if im.mode != "RGB":
            raise SystemExit(f"{path.name}: expected RGB, got {im.mode}")
    info = png_info(path)
    if not info.startswith(f"{expected[0]}x{expected[1]}"):
        raise SystemExit(f"{path.name}: bad PNG header ({info})")


def phone_screenshot(src: Path, bg: tuple[int, int, int]) -> Image.Image:
    img = Image.open(src).convert("RGBA")
    canvas = Image.new("RGBA", PLAY_PHONE, bg + (255,))
    scale = min(PLAY_PHONE[0] / img.width, PLAY_PHONE[1] / img.height) * 0.92
    new_size = (int(img.width * scale), int(img.height * scale))
    resized = img.resize(new_size, RESAMPLE)
    x = (PLAY_PHONE[0] - new_size[0]) // 2
    y = (PLAY_PHONE[1] - new_size[1]) // 2
    canvas.paste(resized, (x, y), resized)
    return canvas.convert("RGB")


def feature_graphic(
    icon: Path,
    title: str,
    subtitle: str,
    bg: tuple[int, int, int],
    accent: tuple[int, int, int],
) -> Image.Image:
    canvas = Image.new("RGB", PLAY_FEATURE, bg)
    draw = ImageDraw.Draw(canvas)

    icon_img = Image.open(icon).convert("RGBA")
    icon_size = 220
    icon_img = icon_img.resize((icon_size, icon_size), RESAMPLE)
    canvas.paste(icon_img, (48, (PLAY_FEATURE[1] - icon_size) // 2), icon_img)

    try:
        title_font = ImageFont.truetype("arialbd.ttf", 52)
        sub_font = ImageFont.truetype("arial.ttf", 28)
    except OSError:
        title_font = ImageFont.load_default()
        sub_font = ImageFont.load_default()

    draw.text((300, 160), title, fill=(245, 243, 239), font=title_font)
    draw.text((300, 240), subtitle, fill=accent, font=sub_font)

    # Decorative dots
    for i, alpha in enumerate([accent, tuple(min(255, c + 30) for c in accent), (61, 57, 72)]):
        r = 18
        cx = PLAY_FEATURE[0] - 120 - i * 36
        cy = PLAY_FEATURE[1] // 2
        draw.rounded_rectangle(
            (cx - r, cy - r, cx + r, cy + r),
            radius=6,
            fill=alpha,
        )

    return canvas


def save_rgb(img: Image.Image, path: Path) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    rgb = img.convert("RGB")
    rgb.save(path.with_suffix(".png"), "PNG")
    rgb.save(path.with_suffix(".jpg"), "JPEG", quality=95, optimize=True)


def prepare(slug: str) -> None:
    repo = Path(__file__).resolve().parents[2]
    app_dir = repo / "apps/mobile" / slug
    source = app_dir / "store/source"
    upload = app_dir / "store/upload"
    assets = app_dir / "assets/icon.png"

    if not source.exists():
        raise SystemExit(f"Missing {source} — add raw screenshots to store/source/ first")

    upload.mkdir(parents=True, exist_ok=True)

    shots = sorted(source.glob("screenshot-*-source.png"))
    if not shots:
        raise SystemExit(f"No screenshot-*-source.png in {source}")

    graphics = APP_GRAPHICS.get(slug, APP_GRAPHICS["tile-merge"])
    bg = graphics["bg"]  # type: ignore[assignment]
    accent = graphics["accent"]  # type: ignore[assignment]

    for i, src in enumerate(shots[:8], start=1):
        out = upload / f"screenshot-{i}-phone"
        save_rgb(phone_screenshot(src, bg), out)
        assert_rgb_png(out.with_suffix(".png"), PLAY_PHONE)
        print(f"OK  {out.name}.png {PLAY_PHONE}")

    icon_out = upload / "store-icon-512"
    icon = Image.open(assets).convert("RGBA").resize(PLAY_ICON, RESAMPLE)
    save_rgb(icon, icon_out)
    assert_rgb_png(icon_out.with_suffix(".png"), PLAY_ICON)
    print(f"OK  store-icon-512.png {PLAY_ICON}")

    feature = feature_graphic(
        assets,
        str(graphics["feature_title"]),
        str(graphics["feature_subtitle"]),
        bg,
        accent,
    )
    feature_out = upload / "feature-graphic-1024x500"
    save_rgb(feature, feature_out)
    assert_rgb_png(feature_out.with_suffix(".png"), PLAY_FEATURE)
    print(f"OK  feature-graphic-1024x500.png {PLAY_FEATURE}")

    manifest = upload / "UPLOAD-THESE.txt"
    manifest.write_text(
        "\n".join(
            [
                "Upload these files to Google Play Console → Main store listing:",
                "",
                "Graphics:",
                "  store-icon-512.png (512x512 app icon)",
                "  feature-graphic-1024x500.png (1024x500 feature graphic)",
                "",
                "Phone screenshots (portrait):",
                *[f"  {p.name}" for p in sorted(upload.glob("screenshot-*-phone.png"))],
                "",
            ]
        ),
        encoding="utf-8",
    )
    print(f"Wrote {manifest.relative_to(repo)}")


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("slug", nargs="?", default="tile-merge")
    args = parser.parse_args()
    prepare(args.slug)


if __name__ == "__main__":
    main()
