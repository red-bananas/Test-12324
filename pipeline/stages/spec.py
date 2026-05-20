from __future__ import annotations

import json
import re
from datetime import datetime
from textwrap import dedent

import httpx

from .. import llm
from ..state import Candidate, Run, session


_SPEC_SYSTEM = dedent("""\
    You are a software cloning analyst. Read the target app's landing page or README and emit a JSON spec for a clone.

    Hard rules:
    - Output ONLY a JSON object. No prose, no markdown fences.
    - backend_required = true if the app needs a server, database, auth, or remote API.
    - multiplayer = true if a game is multiplayer or networked.
    - in_lane = true only if backend_required is false (and for games: multiplayer is false).
    - features[] must be 5-12 concrete user-facing features.
    - screens[] (web) or scenes[] (mobile) name the main UI surfaces.
    - distinct_name MUST differ from the original brand. Same for tagline. Never copy logo descriptions or brand colors.

    Schema:
    {
      "lane": "web" | "mobile",
      "target_name": string,
      "distinct_name": string,
      "tagline": string,
      "backend_required": boolean,
      "multiplayer": boolean,
      "in_lane": boolean,
      "features": [string, ...],
      "screens": [string, ...],
      "components": [string, ...],
      "ui_direction": string,
      "brand_distance_notes": string,
      "tech_notes": string
    }
""")


def _fetch_context(url: str, max_chars: int = 12000) -> str:
    try:
        r = httpx.get(
            url,
            follow_redirects=True,
            timeout=15,
            headers={"User-Agent": "auto-app/0.1"},
        )
        if r.status_code >= 400:
            return ""
        text = re.sub(r"<script[\s\S]*?</script>", " ", r.text)
        text = re.sub(r"<style[\s\S]*?</style>", " ", text)
        text = re.sub(r"<[^>]+>", " ", text)
        text = re.sub(r"\s+", " ", text).strip()
        return text[:max_chars]
    except Exception as e:
        print(f"[spec] fetch failed for {url}: {e}")
        return ""


def _parse_json(text: str) -> dict | None:
    text = text.strip()
    if text.startswith("```"):
        text = re.sub(r"^```(?:json)?\s*", "", text)
        text = re.sub(r"\s*```\s*$", "", text)
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        m = re.search(r"\{[\s\S]*\}", text)
        if m:
            try:
                return json.loads(m.group(0))
            except json.JSONDecodeError:
                return None
        return None


def _mark_failed(run_id: int, error: str) -> None:
    with session() as s:
        r = s.get(Run, run_id)
        if r:
            r.status = "failed"
            r.error = error[:512]
            r.finished_at = datetime.utcnow()
            s.commit()


def run(candidate_id: int) -> None:
    with session() as s:
        cand = s.get(Candidate, candidate_id)
        if not cand:
            print(f"[spec] candidate {candidate_id} not found")
            return
        if cand.status not in ("discovered", "triaged", "approved"):
            print(f"[spec] candidate {candidate_id} status={cand.status} — skipping")
            return
        run_row = Run(candidate_id=candidate_id, lane=cand.lane, stage="spec")
        s.add(run_row)
        s.commit()
        run_id = run_row.id
        target_name, target_url, target_desc, lane = (
            cand.name, cand.url, cand.description or "", cand.lane,
        )

    context = _fetch_context(target_url)
    user_prompt = dedent(f"""\
        Target name: {target_name}
        Target lane: {lane}
        Source URL: {target_url}
        One-line description: {target_desc}

        Source page content (truncated):
        ---
        {context}
        ---

        Emit the JSON spec now.
    """)

    try:
        content = llm.chat(
            [
                {"role": "system", "content": _SPEC_SYSTEM},
                {"role": "user", "content": user_prompt},
            ],
            stage="spec",
            run_id=run_id,
            max_tokens=2048,
        )
    except Exception as e:
        _mark_failed(run_id, f"LLM call failed: {e}")
        print(f"[spec] LLM call failed: {e}")
        return

    spec = _parse_json(content)
    if not spec:
        _mark_failed(run_id, "could not parse JSON from LLM response")
        print(f"[spec] could not parse JSON. raw head: {content[:200]}")
        return

    spec.setdefault("lane", lane)
    in_lane = bool(
        spec.get("in_lane", not spec.get("backend_required") and not spec.get("multiplayer"))
    )
    new_status = "spec-ready" if in_lane else "out-of-lane"

    with session() as s:
        cand = s.get(Candidate, candidate_id)
        cand.spec_json = json.dumps(spec, indent=2)
        cand.status = new_status
        r = s.get(Run, run_id)
        r.status = "ok"
        r.finished_at = datetime.utcnow()
        s.commit()

    print(
        f"[spec] {target_name}: {new_status}, "
        f"features={len(spec.get('features', []))}, "
        f"backend_required={spec.get('backend_required')}, "
        f"multiplayer={spec.get('multiplayer')}"
    )
