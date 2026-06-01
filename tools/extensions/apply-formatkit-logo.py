#!/usr/bin/env python3
"""Apply FormatKit logo asset to extension and store icon sizes."""

from __future__ import annotations

from pathlib import Path

from PIL import Image

REPO = Path(__file__).resolve().parents[2]
EXT = REPO / "apps/extensions/formatkit"
FORMATKIT_BG = (13, 17, 23)
ASSETS = (
    Path.home()
    / ".cursor/projects/c-Users-tejas-ve-Desktop-Tejas-Dev-Auto-App-tmp-Auto-App/assets"
)
SRC_CANDIDATES = [
    ASSETS
    / "c__Users_tejas.ve_AppData_Roaming_Cursor_User_workspaceStorage_489c3243b61964150dde11b163509bdc_images_image-3edf8f04-7f18-4f10-bc10-1e2131df5f62.png",
    ASSETS
    / "c__Users_tejas.ve_AppData_Roaming_Cursor_User_workspaceStorage_489c3243b61964150dde11b163509bdc_images_image-1b13374c-6f82-4e74-95b8-35e4a0418bfd.png",
    EXT / "store/source/logo-source.png",
]


def _bg_color(img: Image.Image) -> tuple[int, int, int]:
    rgb = img.convert("RGB")
    w, h = rgb.size
    samples = [
        rgb.getpixel((0, 0)),
        rgb.getpixel((w - 1, 0)),
        rgb.getpixel((0, h - 1)),
        rgb.getpixel((w - 1, h - 1)),
        rgb.getpixel((w // 2, 0)),
        rgb.getpixel((w // 2, h - 1)),
    ]
    return max(set(samples), key=samples.count)


def _is_blue_block(pixel: tuple[int, int, int]) -> bool:
    r, g, b = pixel
    return b > 140 and r < 120 and g < 180 and b > r + 40


def _has_bottom_wordmark(img: Image.Image) -> bool:
    """True when the source includes a wide FormatKit wordmark under the mark."""
    w, h = img.size
    band = img.crop((0, int(h * 0.72), w, h))
    for y in range(band.height):
        bright = [x for x in range(band.width) if sum(band.getpixel((x, y))) > 600]
        if bright and (max(bright) - min(bright)) > w * 0.4:
            return True
    return False


def crop_f_mark(img: Image.Image) -> Image.Image:
    w, h = img.size
    points = [
        (x, y)
        for y in range(h)
        for x in range(w)
        if _is_blue_block(img.getpixel((x, y)))
    ]
    if not points:
        side = min(w, h) // 2
        left = (w - side) // 2
        top = int(h * 0.12)
        return img.crop((left, top, left + side, top + side))

    xs = [p[0] for p in points]
    ys = [p[1] for p in points]
    pad = int(min(w, h) * 0.06)
    return img.crop((
        max(0, min(xs) - pad),
        max(0, min(ys) - pad),
        min(w, max(xs) + pad + 1),
        min(h, max(ys) + pad + 1),
    ))


def prepare_source(img: Image.Image) -> Image.Image:
    rgb = img.convert("RGB")
    if rgb.width == rgb.height and not _has_bottom_wordmark(rgb):
        return rgb
    return crop_f_mark(rgb)


def remove_background(img: Image.Image, *, tolerance: int = 36) -> Image.Image:
    """Remove only dark background pixels; keep gold, white, and blue foreground."""
    rgb = img.convert("RGB")
    bg = _bg_color(rgb)
    rgba = rgb.convert("RGBA")
    pixels = rgba.load()
    for y in range(rgba.height):
        for x in range(rgba.width):
            r, g, b = rgb.getpixel((x, y))
            lum = 0.299 * r + 0.587 * g + 0.114 * b
            dist = sum(abs(c - bc) for c, bc in zip((r, g, b), bg))
            is_blue = b > 120 and b > r + 25
            is_gold = r > 170 and g > 120 and b < 120 and r >= g
            is_white = r > 180 and g > 180 and b > 180
            if (dist <= tolerance and lum < 55) or (
                dist <= 18
                and lum < 80
                and not is_blue
                and not is_gold
                and not is_white
            ):
                pixels[x, y] = (r, g, b, 0)
    return rgba


def trim_to_content(icon: Image.Image, *, pad_ratio: float = 0.03) -> Image.Image:
    """Tight-crop transparent padding so the mark fills toolbar icon sizes."""
    rgba = icon.convert("RGBA")
    bbox = rgba.getbbox()
    if not bbox:
        return icon

    content = rgba.crop(bbox)
    side = max(content.width, content.height)
    pad = max(2, int(side * pad_ratio))
    canvas_side = side + pad * 2
    canvas = Image.new("RGBA", (canvas_side, canvas_side), (0, 0, 0, 0))
    ox = (canvas_side - content.width) // 2
    oy = (canvas_side - content.height) // 2
    canvas.paste(content, (ox, oy), content)
    return canvas


def flatten_on_bg(icon: Image.Image, bg: tuple[int, int, int]) -> Image.Image:
    base = Image.new("RGBA", icon.size, bg + (255,))
    base.alpha_composite(icon.convert("RGBA"))
    return base.convert("RGB")


def write_icons(icon: Image.Image) -> None:
    for size in (16, 48, 128):
        out = EXT / f"icons/png/icon{size}.png"
        out.parent.mkdir(parents=True, exist_ok=True)
        icon.resize((size, size), Image.Resampling.LANCZOS).save(out)
        print(f"wrote {out.relative_to(REPO)}")

    icon128 = icon.resize((128, 128), Image.Resampling.LANCZOS)
    icon128.save(EXT / "store/icon-128x128.png")

    upload = EXT / "store/upload"
    upload.mkdir(parents=True, exist_ok=True)
    icon128.save(upload / "store-icon-128x128.png")
    store_flat = flatten_on_bg(icon128, FORMATKIT_BG)
    store_flat.save(upload / "store-icon-128x128.jpg", quality=96)


def main() -> None:
    src = next((p for p in SRC_CANDIDATES if p.is_file()), None)
    if src is None:
        raise SystemExit(f"Logo source not found. Checked: {SRC_CANDIDATES}")

    img = Image.open(src).convert("RGB")
    store_src = EXT / "store/source"
    store_src.mkdir(parents=True, exist_ok=True)
    img.save(store_src / "logo-source.png")

    prepared = prepare_source(img)
    icon = trim_to_content(remove_background(prepared))
    icon.save(store_src / "logo-icon-mark.png")
    write_icons(icon)
    print(f"icon size: {icon.size} (trimmed, transparent background)")


if __name__ == "__main__":
    main()
