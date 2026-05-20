from __future__ import annotations

from sqlalchemy import select

from ..state import Candidate, session


FIRST_TARGETS: list[dict] = [
    {
        "source": "curated",
        "lane": "web",
        "slug": "web-excalidraw-first-target",
        "name": "Excalidraw",
        "url": "https://github.com/excalidraw/excalidraw",
        "description": (
            "Virtual whiteboard / drawing tool with a hand-drawn aesthetic. "
            "Frontend-only, no backend required. MIT licensed."
        ),
        "license": "MIT",
        "score": 10.0,
        "tractability": 0.95,
        "status": "discovered",
    },
    {
        "source": "curated",
        "lane": "mobile",
        "slug": "mobile-2048-first-target",
        "name": "2048",
        "url": "https://github.com/gabrielecirulli/2048",
        "description": (
            "Classic 4x4 sliding-tile puzzle game. Single-player, no backend, "
            "no multiplayer. Bounded state machine — sweet spot for codegen. "
            "MIT licensed."
        ),
        "license": "MIT",
        "score": 10.0,
        "tractability": 0.95,
        "status": "discovered",
    },
]


def run() -> None:
    n = 0
    with session() as s:
        for row in FIRST_TARGETS:
            if s.scalar(select(Candidate).where(Candidate.slug == row["slug"])):
                continue
            s.add(Candidate(**row))
            n += 1
        s.commit()
    print(f"[seed] inserted {n} curated first-target candidate(s)")
    for row in FIRST_TARGETS:
        print(f"  - {row['lane']:7} {row['name']:14} {row['url']}")
