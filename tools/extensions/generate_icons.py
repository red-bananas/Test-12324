#!/usr/bin/env python3
"""Generate solid-color PNG icons for Chrome extensions (stdlib only)."""

from __future__ import annotations

import struct
import zlib
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[2]
EXTENSIONS = [
    REPO_ROOT / "apps/extensions/utc-clock-pro",
    REPO_ROOT / "apps/extensions/file-info",
    REPO_ROOT / "apps/extensions/formatkit",
]
SIZES = (16, 48, 128)
# Blue accent matching a simple extension brand
RGB = (37, 99, 235)


def _png_chunk(tag: bytes, data: bytes) -> bytes:
    crc = zlib.crc32(tag + data) & 0xFFFFFFFF
    return struct.pack(">I", len(data)) + tag + data + struct.pack(">I", crc)


def write_png(path: Path, width: int, height: int, rgb: tuple[int, int, int]) -> None:
    raw = b""
    row = bytes([rgb[0], rgb[1], rgb[2]] * width)
    for _ in range(height):
        raw += b"\x00" + row
    compressed = zlib.compress(raw, 9)
    ihdr = struct.pack(">IIBBBBB", width, height, 8, 2, 0, 0, 0)
    png = b"\x89PNG\r\n\x1a\n"
    png += _png_chunk(b"IHDR", ihdr)
    png += _png_chunk(b"IDAT", compressed)
    png += _png_chunk(b"IEND", b"")
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_bytes(png)


def main() -> None:
    for ext_dir in EXTENSIONS:
        for size in SIZES:
            out = ext_dir / "icons/png" / f"icon{size}.png"
            write_png(out, size, size, RGB)
            print(f"wrote {out.relative_to(REPO_ROOT)}")


if __name__ == "__main__":
    main()
