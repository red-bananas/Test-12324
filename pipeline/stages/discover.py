from __future__ import annotations

import re
from datetime import datetime, timedelta, timezone
from typing import Iterable

from sqlalchemy import select

from ..notify import gh_request
from ..state import Candidate, session


_BACKEND_WORDS = re.compile(
    r"\b(api|backend|server|database|auth|oauth|payment|stripe|subscription|saas|crm)\b",
    re.I,
)
_GAME_BACKEND_WORDS = re.compile(
    r"\b(multiplayer|server|matchmak|leaderboard backend|in-app purchase|iap)\b",
    re.I,
)
_GAME_CASUAL_TOPICS = {"puzzle", "casual", "arcade", "2d", "phaser", "minigame"}
_META_REPO_NAME = re.compile(
    r"^(awesome[-_].*|.*-list|.*-lists|.*-resources?|.*-tutorials?|.*-examples?|.*-collections?|.*-curated|.*-cheatsheet.*|.*-handbook|.*-book|.*-roadmap)$",
    re.I,
)
_META_REPO_DESC = re.compile(
    r"\b(awesome list|curated list|cheat ?sheet|tutorial|learning path|roadmap|interview prep|collection of (links|resources))\b",
    re.I,
)


def _is_meta_repo(repo: dict) -> bool:
    name = repo.get("name") or ""
    desc = repo.get("description") or ""
    if _META_REPO_NAME.match(name):
        return True
    if _META_REPO_DESC.search(desc):
        return True
    return False


def _gh_search(query: str, per_page: int = 30) -> list[dict]:
    r = gh_request(
        "GET",
        "/search/repositories",
        params={"q": query, "sort": "stars", "order": "desc", "per_page": per_page},
    )
    if r.status_code >= 300:
        print(f"[discover] gh search failed: {r.status_code} {r.text[:200]}")
        return []
    return r.json().get("items", [])


def _slugify(s: str) -> str:
    return re.sub(r"[^a-z0-9]+", "-", s.lower()).strip("-")[:80]


def _save(rows: Iterable[dict]) -> int:
    n = 0
    with session() as s:
        for row in rows:
            existing = s.scalar(select(Candidate).where(Candidate.slug == row["slug"]))
            if existing:
                continue
            s.add(Candidate(**row))
            n += 1
        s.commit()
    return n


def _score_web(repo: dict) -> tuple[float, float]:
    stars = repo.get("stargazers_count", 0)
    desc = repo.get("description") or ""
    has_backend = bool(_BACKEND_WORDS.search(desc))
    tract = 0.9 if not has_backend else 0.2
    velocity = min(stars / 1000.0, 10.0)
    return velocity, tract


def _score_mobile(repo: dict) -> tuple[float, float]:
    stars = repo.get("stargazers_count", 0)
    desc = repo.get("description") or ""
    topics = set(repo.get("topics") or [])
    has_backend = bool(_GAME_BACKEND_WORDS.search(desc))
    casual = bool(topics & _GAME_CASUAL_TOPICS)
    tract = (0.9 if casual else 0.6) * (0.3 if has_backend else 1.0)
    velocity = min(stars / 500.0, 10.0)
    return velocity, tract


def _row(repo: dict, lane: str, score: float, tract: float) -> dict:
    return {
        "source": "github",
        "lane": lane,
        "slug": f"{lane}-{_slugify(repo['full_name'])}",
        "name": repo["name"],
        "url": repo["html_url"],
        "description": repo.get("description"),
        "license": (repo.get("license") or {}).get("spdx_id"),
        "score": score,
        "tractability": tract,
        "status": "discovered",
    }


def _discover_web(limit: int = 3) -> int:
    since = (datetime.now(timezone.utc) - timedelta(days=60)).strftime("%Y-%m-%d")
    q = f"stars:>200 pushed:>{since} topic:web-app language:TypeScript archived:false"
    repos = _gh_search(q)
    rows: list[dict] = []
    for r in repos:
        if _is_meta_repo(r):
            continue
        score, tract = _score_web(r)
        if tract < 0.5:
            continue
        rows.append(_row(r, "web", score, tract))
    rows.sort(key=lambda c: (c["tractability"], c["score"]), reverse=True)
    return _save(rows[:limit])


def _discover_mobile(limit: int = 3) -> int:
    since = (datetime.now(timezone.utc) - timedelta(days=90)).strftime("%Y-%m-%d")
    q = f"stars:>100 pushed:>{since} topic:game archived:false"
    repos = _gh_search(q)
    rows: list[dict] = []
    for r in repos:
        if _is_meta_repo(r):
            continue
        score, tract = _score_mobile(r)
        if tract < 0.5:
            continue
        rows.append(_row(r, "mobile", score, tract))
    rows.sort(key=lambda c: (c["tractability"], c["score"]), reverse=True)
    return _save(rows[:limit])


def run(lane: str = "all", dry_run: bool = False) -> None:
    if dry_run:
        print(f"[discover] dry-run for lane={lane}")
        return
    if lane in ("web", "all"):
        n = _discover_web()
        print(f"[discover] web: +{n} candidates")
    if lane in ("mobile", "all"):
        n = _discover_mobile()
        print(f"[discover] mobile: +{n} candidates")
