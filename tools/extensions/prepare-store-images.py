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
FORMATKIT_BG = (13, 17, 23)
FILE_INFO_BG = (13, 17, 23)
FORMATKIT_JPEG_QUALITY = 96
RESAMPLE = Image.Resampling.LANCZOS


def save_cws_image(
    img: Image.Image,
    path: Path,
    *,
    jpeg_quality: int = 92,
) -> None:
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
    """Derive 440x280 promo tile from screenshot (center crop + high-quality downscale)."""
    return _crop_and_resize_to_promo(screenshot)


def _crop_and_resize_to_promo(img: Image.Image) -> Image.Image:
    target_w, target_h = CWS_PROMO
    target_ratio = target_w / target_h
    w, h = img.size
    src_ratio = w / h

    if src_ratio > target_ratio:
        new_w = int(h * target_ratio)
        left = (w - new_w) // 2
        cropped = img.crop((left, 0, left + new_w, h))
    else:
        new_h = int(w / target_ratio)
        top = (h - new_h) // 2
        cropped = img.crop((0, top, w, top + new_h))

    return cropped.resize(CWS_PROMO, RESAMPLE)


def make_promo_from_popup_source(src: Path, *, bg: tuple[int, int, int] = FORMATKIT_BG) -> Image.Image:
    """Build promo from high-res popup capture (supersample before final 440×280)."""
    padded = pad_popup_screenshot(src, bg=bg)
    return _crop_and_resize_to_promo(padded)


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


def pad_popup_screenshot(src: Path, *, bg: tuple[int, int, int] = FORMATKIT_BG) -> Image.Image:
    """Fit a popup capture (any size) onto a 1280x800 CWS canvas."""
    img = Image.open(src).convert("RGBA")
    target_w, target_h = CWS_SCREENSHOT
    margin = 80
    max_w = target_w - margin * 2
    max_h = target_h - margin * 2
    scale = min(max_w / img.width, max_h / img.height)
    new_size = (max(1, int(img.width * scale)), max(1, int(img.height * scale)))
    if new_size != img.size:
        img = img.resize(new_size, RESAMPLE)
    canvas = Image.new("RGBA", CWS_SCREENSHOT, bg + (255,))
    x = (target_w - img.width) // 2
    y = (target_h - img.height) // 2
    canvas.paste(img, (x, y), img)
    return canvas.convert("RGB")


def formatkit_store_icon(ext_dir: Path) -> Image.Image:
    """Prefer high-res logo mark, then packaged icon128."""
    candidates = [
        ext_dir / "store/source/logo-icon-mark.png",
        ext_dir / "store/icon-128x128.png",
        ext_dir / "icons/png/icon128.png",
    ]
    for path in candidates:
        if not path.is_file():
            continue
        img = Image.open(path).convert("RGBA")
        if img.width < 64:
            continue
        if img.width != img.height:
            side = min(img.size)
            left = (img.width - side) // 2
            top = (img.height - side) // 2
            img = img.crop((left, top, left + side, top + side))
        flat = Image.new("RGBA", img.size, FORMATKIT_BG + (255,))
        flat.alpha_composite(img)
        return flat.convert("RGB").resize(CWS_ICON, RESAMPLE)
    raise SystemExit("No FormatKit icon source found — run apply-formatkit-logo.py")


def build_formatkit(root: Path) -> None:
    slug = "formatkit"
    ext_dir = root / "apps" / "extensions" / slug
    store_dir = ext_dir / "store"
    source_dir = store_dir / "source"
    upload_dir = store_dir / "upload"

    upload_dir.mkdir(parents=True, exist_ok=True)
    source_dir.mkdir(parents=True, exist_ok=True)

    screenshots = [
        ("screenshot-1-json-formatted-source.png", "screenshot-1-json-formatted"),
        ("screenshot-2-json-to-yaml-source.png", "screenshot-2-json-to-yaml"),
        ("screenshot-3-flow-yaml-source.png", "screenshot-3-flow-yaml"),
        ("screenshot-4-xml-formatted-source.png", "screenshot-4-xml-formatted"),
    ]

    first_shot: Image.Image | None = None
    for src_name, base_name in screenshots:
        src = source_dir / src_name
        if not src.is_file():
            raise SystemExit(
                f"Missing {src_name}. Run: node tools/extensions/capture-formatkit-screenshots.mjs"
            )
        shot = pad_popup_screenshot(src)
        if first_shot is None:
            first_shot = shot
        save_cws_image(shot, upload_dir / base_name, jpeg_quality=FORMATKIT_JPEG_QUALITY)
        print(f"OK screenshot {upload_dir / base_name}.png")

    if first_shot is None:
        raise SystemExit("Cannot build promo tile — screenshot 1 missing")
    first_src = source_dir / screenshots[0][0]
    promo = make_promo_from_popup_source(first_src)
    save_cws_image(promo, upload_dir / "promo-small-440x280", jpeg_quality=FORMATKIT_JPEG_QUALITY)
    print(f"OK promo {upload_dir / 'promo-small-440x280'}.png")

    icon = formatkit_store_icon(ext_dir)
    save_cws_image(icon, upload_dir / "store-icon-128x128", jpeg_quality=FORMATKIT_JPEG_QUALITY)
    print(f"OK icon {upload_dir / 'store-icon-128x128'}.png")

    for path in sorted(upload_dir.glob("*.png")):
        kind = (
            "screenshot"
            if path.name.startswith("screenshot")
            else "promo"
            if path.name.startswith("promo")
            else "store-icon"
        )
        assert_cws_file(
            path,
            {"screenshot": CWS_SCREENSHOT, "promo": CWS_PROMO, "store-icon": CWS_ICON}[kind],
        )

    manifest = upload_dir / "UPLOAD-THESE.txt"
    manifest.write_text(
        "\n".join(
            [
                "Upload ONLY files from this folder (store/upload/).",
                "",
                "Screenshots (1280 x 800):",
                "  screenshot-1-json-formatted.jpg   (or .png)",
                "  screenshot-2-json-to-yaml.jpg     (or .png)",
                "  screenshot-3-flow-yaml.jpg        (or .png)",
                "  screenshot-4-xml-formatted.jpg    (or .png)",
                "",
                "Small promo tile (440 x 280):",
                "  promo-small-440x280.jpg           (or .png)",
                "",
                "Store icon (128 x 128):",
                "  store-icon-128x128.jpg            (or .png)",
                "",
                "Recapture popup shots:",
                "  node tools/extensions/capture-formatkit-screenshots.mjs",
                "  python tools/extensions/prepare-store-images.py formatkit",
            ]
        ),
        encoding="utf-8",
    )
    print(f"OK manifest {manifest.relative_to(root)}")


def file_info_store_icon(ext_dir: Path) -> Image.Image:
    """Use the packaged 128 icon, flattened onto the brand background."""
    candidates = [
        ext_dir / "store/source/logo-icon-mark.png",
        ext_dir / "icons/png/icon128.png",
    ]
    for path in candidates:
        if not path.is_file():
            continue
        img = Image.open(path).convert("RGBA")
        if img.width != img.height:
            side = min(img.size)
            left = (img.width - side) // 2
            top = (img.height - side) // 2
            img = img.crop((left, top, left + side, top + side))
        flat = Image.new("RGBA", img.size, FILE_INFO_BG + (255,))
        flat.alpha_composite(img)
        return flat.convert("RGB").resize(CWS_ICON, RESAMPLE)
    raise SystemExit("No File Info icon source found (icons/png/icon128.png)")


def build_file_info(root: Path) -> None:
    slug = "file-info"
    ext_dir = root / "apps" / "extensions" / slug
    store_dir = ext_dir / "store"
    source_dir = store_dir / "source"
    upload_dir = store_dir / "upload"

    upload_dir.mkdir(parents=True, exist_ok=True)
    source_dir.mkdir(parents=True, exist_ok=True)

    # Drop stale screenshot outputs so renamed/reordered shots never linger.
    for stale in list(upload_dir.glob("screenshot-*.png")) + list(upload_dir.glob("screenshot-*.jpg")):
        stale.unlink()

    screenshots = [
        ("screenshot-1-image-dimensions-source.png", "screenshot-1-image-dimensions"),
        ("screenshot-2-image-exif-gps-source.png", "screenshot-2-image-exif-gps"),
        ("screenshot-3-pdf-file-details-source.png", "screenshot-3-pdf-file-details"),
        ("screenshot-4-video-resolution-source.png", "screenshot-4-video-resolution"),
        ("screenshot-5-webpage-stats-source.png", "screenshot-5-webpage-stats"),
    ]

    for src_name, base_name in screenshots:
        src = source_dir / src_name
        if not src.is_file():
            raise SystemExit(
                f"Missing {src_name}. Run: node tools/extensions/capture-file-info-screenshots.mjs"
            )
        shot = pad_popup_screenshot(src, bg=FILE_INFO_BG)
        save_cws_image(shot, upload_dir / base_name, jpeg_quality=FORMATKIT_JPEG_QUALITY)
        print(f"OK screenshot {upload_dir / base_name}.png")

    first_src = source_dir / screenshots[0][0]
    promo = make_promo_from_popup_source(first_src, bg=FILE_INFO_BG)
    save_cws_image(promo, upload_dir / "promo-small-440x280", jpeg_quality=FORMATKIT_JPEG_QUALITY)
    print(f"OK promo {upload_dir / 'promo-small-440x280'}.png")

    icon = file_info_store_icon(ext_dir)
    save_cws_image(icon, upload_dir / "store-icon-128x128", jpeg_quality=FORMATKIT_JPEG_QUALITY)
    print(f"OK icon {upload_dir / 'store-icon-128x128'}.png")

    for path in sorted(upload_dir.glob("*.png")):
        kind = (
            "screenshot"
            if path.name.startswith("screenshot")
            else "promo"
            if path.name.startswith("promo")
            else "store-icon"
        )
        assert_cws_file(
            path,
            {"screenshot": CWS_SCREENSHOT, "promo": CWS_PROMO, "store-icon": CWS_ICON}[kind],
        )

    manifest = upload_dir / "UPLOAD-THESE.txt"
    manifest.write_text(
        "\n".join(
            [
                "Upload ONLY files from this folder (store/upload/).",
                "",
                "Screenshots (1280 x 800) — upload in this order:",
                "  screenshot-1-image-dimensions.jpg   (or .png)",
                "  screenshot-2-image-exif-gps.jpg     (or .png)",
                "  screenshot-3-pdf-file-details.jpg   (or .png)",
                "  screenshot-4-video-resolution.jpg   (or .png)",
                "  screenshot-5-webpage-stats.jpg      (or .png)",
                "",
                "Small promo tile (440 x 280):",
                "  promo-small-440x280.jpg             (or .png)",
                "",
                "Store icon (128 x 128):",
                "  store-icon-128x128.jpg              (or .png)",
                "",
                "Recapture popup shots:",
                "  node tools/extensions/capture-file-info-screenshots.mjs",
                "  python tools/extensions/prepare-store-images.py file-info",
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

    if args.slug == "utc-clock-pro":
        build_utc_clock_pro(root)
    elif args.slug == "formatkit":
        build_formatkit(root)
    elif args.slug == "file-info":
        build_file_info(root)
    else:
        raise SystemExit(f"No store image mapping for {args.slug!r}")


if __name__ == "__main__":
    main()
