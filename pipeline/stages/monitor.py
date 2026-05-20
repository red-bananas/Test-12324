from __future__ import annotations

import os
from datetime import date

import httpx
from sqlalchemy import select

from ..state import Clone, MetricDaily, session


def _plausible_aggregate(site_id: str, api_key: str) -> dict | None:
    try:
        r = httpx.get(
            "https://plausible.io/api/v1/stats/aggregate",
            params={
                "site_id": site_id,
                "period": "day",
                "metrics": "visitors,pageviews",
            },
            headers={"Authorization": f"Bearer {api_key}"},
            timeout=15,
        )
        if r.status_code >= 300:
            return None
        return r.json().get("results") or {}
    except Exception as e:
        print(f"[monitor] plausible fetch failed for {site_id}: {e}")
        return None


def _site_id_from_url(url: str) -> str:
    return (
        url.replace("https://", "").replace("http://", "").split("/")[0].strip()
    )


def run() -> None:
    api_key = os.getenv("PLAUSIBLE_API_KEY")
    if not api_key:
        print("[monitor] PLAUSIBLE_API_KEY not set — skipping web metrics")
        return
    today = date.today().isoformat()
    n = 0
    with session() as s:
        for clone in s.scalars(
            select(Clone).where(Clone.lane == "web", Clone.deploy_url.is_not(None))
        ):
            site_id = _site_id_from_url(clone.deploy_url)
            data = _plausible_aggregate(site_id, api_key)
            if not data:
                continue
            visits = (data.get("visitors") or {}).get("value", 0)
            pageviews = (data.get("pageviews") or {}).get("value", 0)
            s.add(
                MetricDaily(
                    clone_id=clone.id,
                    date=today,
                    visits=visits,
                    sessions=pageviews,
                )
            )
            n += 1
        s.commit()
    print(f"[monitor] wrote metrics for {n} web clone(s)")
