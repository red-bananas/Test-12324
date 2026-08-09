#!/usr/bin/env python3
"""Generate launcher, splash, in-app, and Play Store icons for one mobile app.

All inputs and outputs stay under apps/mobile/{slug}/ — never scaffolds/ or another app.
"""

from __future__ import annotations

import argparse
from pathlib import Path

from PIL import Image

REPO = Path(__file__).resolve().parents[2]

# Android adaptive icons mask the outer ~17%; keep artwork in the safe zone.
ADAPTIVE_SCALE = 0.66
LAUNCHER_SCALE = 0.88
SPLASH_SCALE = 0.52
STORE_SCALE = 0.90
APP_LOGO_SCALE = 0.9
SPLASH_BG = (255, 255, 255)
STORE_BG = (255, 255, 255)

RESAMPLE = Image.Resampling.LANCZOS


def fit_on_canvas(
    logo: Image.Image,
    canvas_size: int,
    content_scale: float,
    *,
    background: tuple[int, int, int] | None = None,
) -> Image.Image:
    if background is None:
        canvas = Image.new("RGBA", (canvas_size, canvas_size), (0, 0, 0, 0))
    else:
        canvas = Image.new("RGBA", (canvas_size, canvas_size), background + (255,))

    target = max(1, round(canvas_size * content_scale))
    resized = logo.resize((target, target), RESAMPLE)
    offset = ((canvas_size - target) // 2, (canvas_size - target) // 2)
    canvas.paste(resized, offset, resized)
    return canvas


def resolve_paths(slug: str, source: Path | None) -> tuple[Path, Path, Path, Path]:
    app_dir = REPO / "apps/mobile" / slug
    if not app_dir.is_dir():
        raise SystemExit(f"Unknown app: {app_dir}")

    logo = source or (app_dir / "store/source/logo.png")
    assets = app_dir / "assets"
    store_icon = app_dir / "store/upload/store-icon-512.png"
    return app_dir, logo, assets, store_icon


def generate(slug: str, source: Path | None = None) -> None:
    app_dir, logo_path, assets, store_icon = resolve_paths(slug, source)
    if not logo_path.is_file():
        raise SystemExit(
            f"Missing icon source: {logo_path}\n"
            f"Place the final square logo at apps/mobile/{slug}/store/source/logo.png"
        )

    logo = Image.open(logo_path).convert("RGBA")
    assets.mkdir(parents=True, exist_ok=True)
    store_icon.parent.mkdir(parents=True, exist_ok=True)

    fit_on_canvas(logo, 1024, LAUNCHER_SCALE).save(assets / "icon.png")
    fit_on_canvas(logo, 1024, ADAPTIVE_SCALE).save(assets / "adaptive-icon.png")
    fit_on_canvas(logo, 512, SPLASH_SCALE, background=SPLASH_BG).save(assets / "splash-icon.png")
    fit_on_canvas(logo, 128, APP_LOGO_SCALE).save(assets / "app-logo.png")
    fit_on_canvas(logo, 512, STORE_SCALE, background=STORE_BG).convert("RGB").save(store_icon)

    print(f"App:    {slug}")
    print(f"Source: {logo_path} ({logo.size[0]}x{logo.size[1]})")
    print(f"Wrote  {assets / 'icon.png'}")
    print(f"Wrote  {assets / 'adaptive-icon.png'}")
    print(f"Wrote  {assets / 'splash-icon.png'}")
    print(f"Wrote  {assets / 'app-logo.png'}")
    print(f"Wrote  {store_icon}")


def main() -> None:
    parser = argparse.ArgumentParser(description="Generate mobile app icons from store/source/logo.png")
    parser.add_argument("slug", help="App slug under apps/mobile/{slug}")
    parser.add_argument(
        "--source",
        type=Path,
        help="Optional override path to a square PNG (default: store/source/logo.png in the app)",
    )
    args = parser.parse_args()
    generate(args.slug, args.source)


if __name__ == "__main__":
    main()
