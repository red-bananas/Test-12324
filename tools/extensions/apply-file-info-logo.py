#!/usr/bin/env python3
"""Apply the File Info logo to extension + store icon sizes.

Strips baked checkerboard / dark backgrounds, normalizes to a 1024px master,
then downscales in halving steps with LANCZOS for crisp 16/48/128 toolbar PNGs.
"""
from __future__ import annotations

from collections import deque
from pathlib import Path

from PIL import Image

REPO = Path(__file__).resolve().parents[2]
EXT = REPO / "apps/extensions/file-info"
ASSETS = (
    Path.home()
    / ".cursor/projects/c-Users-tejas-ve-Desktop-Tejas-Dev-Auto-App-tmp-Auto-App/assets"
)
SRC_CANDIDATES = [
    ASSETS
    / "c__Users_tejas.ve_AppData_Roaming_Cursor_User_workspaceStorage_489c3243b61964150dde11b163509bdc_images_ChatGPT_Image_Jun_12__2026__01_50_26_AM-cdb58c34-ba8d-48ae-b4e7-db91f4fcd435.png",
    EXT / "store/source/logo-source.png",
    EXT / "store/source/logo-icon-mark.png",
]
RESAMPLE = Image.Resampling.LANCZOS
MASTER_SIZE = 1024
FILL_RATIO = 0.92
TRIM_PAD_RATIO = 0.03
PNG_COMPRESS = 1


def square(img: Image.Image) -> Image.Image:
    if img.width == img.height:
        return img
    side = min(img.size)
    left = (img.width - side) // 2
    top = (img.height - side) // 2
    return img.crop((left, top, left + side, top + side))


def _is_yellow(r: int, g: int, b: int) -> bool:
    return r > 140 and g > 100 and b < 120 and r >= g


def _is_removable_bg(r: int, g: int, b: int) -> bool:
    if r + g + b < 35:
        return True
    if abs(r - g) <= 12 and abs(g - b) <= 12 and r >= 150:
        return True
    return False


def remove_background(img: Image.Image) -> Image.Image:
    """Make checkerboard / black padding transparent; keep yellow + interior art."""
    if img.mode == "RGBA":
        alpha = img.split()[3]
        corners = [
            alpha.getpixel(p)
            for p in ((0, 0), (img.width - 1, 0), (0, img.height - 1), (img.width - 1, img.height - 1))
        ]
        if min(corners) < 128:
            return img.convert("RGBA")

    rgb = img.convert("RGB")
    w, h = rgb.size
    px = rgb.load()
    outside = [[False] * w for _ in range(h)]
    q: deque[tuple[int, int]] = deque()

    def try_seed(x: int, y: int) -> None:
        if _is_removable_bg(*px[x, y]) and not _is_yellow(*px[x, y]):
            outside[y][x] = True
            q.append((x, y))

    for x in range(w):
        try_seed(x, 0)
        try_seed(x, h - 1)
    for y in range(h):
        try_seed(0, y)
        try_seed(w - 1, y)

    while q:
        x, y = q.popleft()
        for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            nx, ny = x + dx, y + dy
            if 0 <= nx < w and 0 <= ny < h and not outside[ny][nx]:
                r, g, b = px[nx, ny]
                if _is_yellow(r, g, b):
                    continue
                if _is_removable_bg(r, g, b):
                    outside[ny][nx] = True
                    q.append((nx, ny))

    rgba = rgb.convert("RGBA")
    rpx = rgba.load()
    for y in range(h):
        for x in range(w):
            if outside[y][x]:
                rpx[x, y] = (rpx[x, y][0], rpx[x, y][1], rpx[x, y][2], 0)
    return rgba


def trim_to_content(icon: Image.Image, *, pad_ratio: float = TRIM_PAD_RATIO) -> Image.Image:
    rgba = icon.convert("RGBA")
    bbox = rgba.getbbox()
    if not bbox:
        return icon

    content = rgba.crop(bbox)
    side = max(content.width, content.height)
    pad = max(1, int(side * pad_ratio))
    canvas_side = side + pad * 2
    canvas = Image.new("RGBA", (canvas_side, canvas_side), (0, 0, 0, 0))
    ox = (canvas_side - content.width) // 2
    oy = (canvas_side - content.height) // 2
    canvas.paste(content, (ox, oy), content)
    return canvas


def normalize_master(icon: Image.Image, *, size: int = MASTER_SIZE, fill: float = FILL_RATIO) -> Image.Image:
    rgba = icon.convert("RGBA")
    bbox = rgba.getbbox()
    if not bbox:
        return icon

    content = rgba.crop(bbox)
    target = max(1, int(size * fill))
    scale = target / max(content.width, content.height)
    new_w = max(1, int(content.width * scale))
    new_h = max(1, int(content.height * scale))
    scaled = content.resize((new_w, new_h), RESAMPLE)

    canvas = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    ox = (size - new_w) // 2
    oy = (size - new_h) // 2
    canvas.paste(scaled, (ox, oy), scaled)
    return canvas


def high_quality_resize(img: Image.Image, target: int) -> Image.Image:
    out = img
    while out.width // 2 >= target * 2:
        out = out.resize((out.width // 2, out.height // 2), RESAMPLE)
    if out.width != target:
        out = out.resize((target, target), RESAMPLE)
    return out


def save_png(img: Image.Image, path: Path) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    img.save(path, compress_level=PNG_COMPRESS)


def main() -> None:
    src = next((p for p in SRC_CANDIDATES if p.is_file()), None)
    if src is None:
        raise SystemExit(f"Logo source not found. Checked: {SRC_CANDIDATES}")

    raw = square(Image.open(src))
    trimmed = trim_to_content(remove_background(raw))
    master = normalize_master(trimmed)

    store_src = EXT / "store/source"
    store_src.mkdir(parents=True, exist_ok=True)
    raw.save(store_src / "logo-source.png", compress_level=PNG_COMPRESS)
    save_png(master, store_src / "logo-icon-mark.png")

    print(f"source {raw.size} -> master {master.size} ({src.name})")

    for size in (16, 48, 128):
        out = EXT / f"icons/png/icon{size}.png"
        save_png(high_quality_resize(master, size), out)
        print(f"wrote {out.relative_to(REPO)} ({size}x{size}, RGBA)")


if __name__ == "__main__":
    main()
