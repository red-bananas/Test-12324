#!/usr/bin/env python3
"""Build Chrome Web Store listing images (exact sizes, RGB, no alpha)."""
from __future__ import annotations

import argparse
import shutil
import struct
from pathlib import Path

from PIL import Image

CWS_SCREENSHOT = (1280, 800)
CWS_PROMO = (440, 280)
CWS_ICON = (128, 128)
BG = (26, 26, 26)


def save_cws_image(img: Image.Image, path: Path, *, jpeg_quality: int = 92) -> None:
    """Save RGB image as 24-bit PNG and JPEG (CWS accepts both, no alpha)."""
    rgb = img.convert("RGB")
    if rgb.size != img.size:
        raise ValueError(f"size mismatch after RGB convert: {rgb.size} != {img.size}")

    path.parent.mkdir(parents=True, exist_ok=True)
    rgb.save(path.with_suffix(".png"), "PNG")
    rgb.save(path.with_suffix(".jpg"), "JPEG", quality=jpeg_quality, optimize=True)


def png_info(path: Path) -> str:
    data = path.read_bytes()
    if data[:8] != b"\x89PNG\r\n\x1a\n":
        return "not-png"
    w, h, bit, color, *_ = struct.unpack(">IIBBBBB", data[16:29])
    return f"{w}x{h} bit={bit} type={color}"


def assert_cws_file(path: Path, expected: tuple[int, int]) -> None:
    with Image.open(path) as im:
        if im.size != expected:
            raise SystemExit(f"{path.name}: expected {expected}, got {im.size}")
        if im.mode != "RGB":
            raise SystemExit(f"{path.name}: expected RGB, got {im.mode}")
    info = png_info(path)
    if not info.startswith(f"{expected[0]}x{expected[1]}"):
        raise SystemExit(f"{path.name}: bad PNG header ({info})")


def pad_screenshot(src: Path) -> Image.Image:
    img = Image.open(src).convert("RGBA")
    if img.size == CWS_SCREENSHOT:
        return img.convert("RGB")
    if img.size != (1280, 720):
        img = img.resize((1280, 720), Image.Resampling.LANCZOS)

    canvas = Image.new("RGBA", CWS_SCREENSHOT, BG + (255,))
    x = (CWS_SCREENSHOT[0] - img.width) // 2
    y = (CWS_SCREENSHOT[1] - img.height) // 2
    canvas.paste(img, (x, y), img)
    return canvas.convert("RGB")


def make_promo_from_screenshot(screenshot: Image.Image) -> Image.Image:
    """Derive 440x280 promo tile from screenshot 1 (center crop + resize)."""
    target_w, target_h = CWS_PROMO
    target_ratio = target_w / target_h
    w, h = screenshot.size
    src_ratio = w / h

    if src_ratio > target_ratio:
        new_w = int(h * target_ratio)
        left = (w - new_w) // 2
        cropped = screenshot.crop((left, 0, left + new_w, h))
    else:
        new_h = int(w / target_ratio)
        top = (h - new_h) // 2
        cropped = screenshot.crop((0, top, w, top + new_h))

    return cropped.resize(CWS_PROMO, Image.Resampling.LANCZOS)


def make_icon(icons_dir: Path, logo_src: Path | None) -> Image.Image:
    icon_path = icons_dir / "icon128.png"
    if icon_path.is_file():
        candidate = Image.open(icon_path).convert("RGB")
        colors = candidate.getcolors(maxcolors=256 * 256 * 256)
        # Packaged icon128 is a solid placeholder in this repo — prefer logo art.
        if colors and len(colors) > 4:
            if candidate.size != CWS_ICON:
                candidate = candidate.resize(CWS_ICON, Image.Resampling.LANCZOS)
            return candidate

    if logo_src and logo_src.is_file():
        logo = Image.open(logo_src).convert("RGB")
        side = min(logo.size)
        left = (logo.width - side) // 2
        top = (logo.height - side) // 2
        logo = logo.crop((left, top, left + side, top + side))
        return logo.resize(CWS_ICON, Image.Resampling.LANCZOS)

    raise SystemExit("No logo source or valid icon128.png found")


def build_utc_clock_pro(root: Path) -> None:
    slug = "utc-clock-pro"
    ext_dir = root / "apps" / "extensions" / slug
    src_dir = root / "public" / "images" / "UTC clock pro"
    store_dir = ext_dir / "store"
    source_dir = store_dir / "source"
    upload_dir = store_dir / "upload"

    if upload_dir.exists():
        shutil.rmtree(upload_dir)
    upload_dir.mkdir(parents=True)
    source_dir.mkdir(parents=True, exist_ok=True)

    screenshots = [
        ("UTC main.png", "screenshot-1-icon-clock-multi-view"),
        ("UTC feature 1.png", "screenshot-2-seconds-in-logo"),
    ]

    first_shot: Image.Image | None = None
    for src_name, base_name in screenshots:
        src = src_dir / src_name
        if not src.is_file():
            # Fall back to archived source in store/source
            archived = source_dir / src_name
            if archived.is_file():
                src = archived
            else:
                archived = store_dir / f"{base_name}-source.png"
                if archived.is_file():
                    src = archived
                else:
                    raise SystemExit(f"Missing source: {src_name}")

        shutil.copy2(src, source_dir / src_name)
        shot = pad_screenshot(src)
        if first_shot is None:
            first_shot = shot
        save_cws_image(shot, upload_dir / base_name)
        print(f"OK screenshot {upload_dir / base_name}.png")

    if first_shot is None:
        raise SystemExit("Cannot build promo tile — screenshot 1 missing")
    promo = make_promo_from_screenshot(first_shot)

    save_cws_image(promo, upload_dir / "promo-small-440x280")
    print(f"OK promo {upload_dir / 'promo-small-440x280'}.png")

    logo_src = store_dir / "logo-source.png"
    if logo_src.is_file():
        shutil.copy2(logo_src, source_dir / "logo-source.png")
    icon = make_icon(ext_dir / "icons" / "png", logo_src if logo_src.is_file() else None)
    save_cws_image(icon, upload_dir / "store-icon-128x128")
    print(f"OK icon {upload_dir / 'store-icon-128x128'}.png")

    for path in sorted(upload_dir.glob("*.png")):
        assert_cws_file(path, {
            "screenshot": CWS_SCREENSHOT,
            "promo": CWS_PROMO,
            "store-icon": CWS_ICON,
        }["screenshot" if path.name.startswith("screenshot") else "promo" if path.name.startswith("promo") else "store-icon"])

    manifest = upload_dir / "UPLOAD-THESE.txt"
    manifest.write_text(
        "\n".join(
            [
                "Upload ONLY files from this folder (store/upload/).",
                "",
                "Screenshots (1280 x 800) — upload up to 5:",
                "  screenshot-1-icon-clock-multi-view.jpg  (or .png)",
                "  screenshot-2-seconds-in-logo.jpg        (or .png)",
                "",
                "Small promo tile (440 x 280) — cropped from screenshot 1:",
                "  promo-small-440x280.jpg                 (or .png)",
                "",
                "Store icon (128 x 128):",
                "  store-icon-128x128.jpg                  (or .png)",
                "",
                "DO NOT upload anything from store/source/ — wrong sizes (1280x720 etc.).",
                "",
                "If PNG fails in dashboard, use the .jpg versions (same dimensions).",
            ]
        ),
        encoding="utf-8",
    )
    print(f"OK manifest {manifest.relative_to(root)}")


def main() -> None:
    root = Path(__file__).resolve().parents[2]
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("slug", nargs="?", default="utc-clock-pro")
    args = parser.parse_args()

    if args.slug != "utc-clock-pro":
        raise SystemExit(f"No store image mapping for {args.slug!r}")

    build_utc_clock_pro(root)


if __name__ == "__main__":
    main()
