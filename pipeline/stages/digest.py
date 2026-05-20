from __future__ import annotations

from datetime import datetime, timedelta

from sqlalchemy import func, select

from ..notify import send_email
from ..state import BudgetLedger, Clone, Run, session


def _build_html() -> str:
    week_ago = datetime.utcnow() - timedelta(days=7)
    with session() as s:
        clones = list(
            s.scalars(select(Clone).order_by(Clone.created_at.desc()).limit(10))
        )
        spend_week = (
            s.scalar(
                select(func.coalesce(func.sum(BudgetLedger.cost_usd), 0.0)).where(
                    BudgetLedger.occurred_at >= week_ago
                )
            )
            or 0.0
        )
        runs_week = (
            s.scalar(select(func.count(Run.id)).where(Run.started_at >= week_ago)) or 0
        )
        ok_runs = (
            s.scalar(
                select(func.count(Run.id)).where(
                    Run.started_at >= week_ago, Run.status == "ok"
                )
            )
            or 0
        )

    rows = ""
    for c in clones:
        url = c.deploy_url or c.repo_url
        rows += (
            f"<li><a href='{url}'>{url}</a> "
            f"<span style='color:#888'>({c.lane})</span></li>"
        )
    return f"""
    <h2>Auto-App weekly digest</h2>
    <ul>
      <li>Runs (7d): <b>{runs_week}</b> (ok: <b>{ok_runs}</b>)</li>
      <li>Spend (7d): <b>${spend_week:.2f}</b></li>
    </ul>
    <h3>Recent clones</h3>
    <ul>{rows or '<li>no clones yet</li>'}</ul>
    """


def run() -> None:
    html = _build_html()
    resp = send_email("Auto-App weekly digest", html)
    print(f"[digest] sent: {bool(resp)}")
