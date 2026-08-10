#!/usr/bin/env python3
"""Backward-compatible wrapper — use generate-mobile-icons.py {slug} instead."""

from __future__ import annotations

import subprocess
import sys
from pathlib import Path

SLUG = "image-to-pdf"


def main() -> None:
    script = Path(__file__).with_name("generate-mobile-icons.py")
    raise SystemExit(subprocess.call([sys.executable, str(script), SLUG]))


if __name__ == "__main__":
    main()
