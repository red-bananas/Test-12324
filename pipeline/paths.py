from __future__ import annotations

from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[1]
APPS_ROOT = REPO_ROOT / "apps"
SCAFFOLDS_ROOT = REPO_ROOT / "scaffolds"
DATA_ROOT = REPO_ROOT / "data"
TOOLS_EXTENSIONS_ROOT = REPO_ROOT / "tools" / "extensions"

LANE_DIRS = {"web": "web", "mobile": "mobile", "extension": "extensions"}

SCAFFOLD_NAMES = {"web": "web-nextjs", "mobile": "mobile-expo-game"}


def app_dir(lane: str, slug: str) -> Path:
    folder = LANE_DIRS.get(lane)
    if not folder:
        raise ValueError(f"unknown lane: {lane!r}")
    return APPS_ROOT / folder / slug


def scaffold_dir(lane: str) -> Path:
    name = SCAFFOLD_NAMES.get(lane)
    if not name:
        raise ValueError(f"no scaffold for lane: {lane!r}")
    return SCAFFOLDS_ROOT / name
