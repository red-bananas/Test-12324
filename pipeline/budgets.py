from __future__ import annotations

import os
from datetime import datetime, timezone

from sqlalchemy import func, select

from .state import BudgetLedger, Run, session


class BudgetExceeded(Exception):
    pass


class KillSwitchEngaged(Exception):
    pass


def _cap(name: str, default: float) -> float:
    return float(os.getenv(name, default))


def ensure_running() -> None:
    if os.getenv("PIPELINE_PAUSED", "false").lower() == "true":
        raise KillSwitchEngaged("PIPELINE_PAUSED=true — kill switch engaged.")


def _spent_since(s, since: datetime) -> float:
    return (
        s.scalar(
            select(func.coalesce(func.sum(BudgetLedger.cost_usd), 0.0)).where(
                BudgetLedger.occurred_at >= since
            )
        )
        or 0.0
    )


def assert_daily_ok() -> None:
    today = datetime.now(timezone.utc).replace(
        hour=0, minute=0, second=0, microsecond=0, tzinfo=None
    )
    cap = _cap("COST_CAP_DAY_USD", 2.0)
    with session() as s:
        spent = _spent_since(s, today)
    if spent >= cap:
        raise BudgetExceeded(f"Daily cap hit: ${spent:.2f} >= ${cap:.2f}")


def assert_monthly_ok() -> None:
    now = datetime.now(timezone.utc)
    month_start = now.replace(
        day=1, hour=0, minute=0, second=0, microsecond=0, tzinfo=None
    )
    cap = _cap("COST_CAP_MONTH_USD", 35.0)
    with session() as s:
        spent = _spent_since(s, month_start)
    if spent >= cap:
        raise BudgetExceeded(f"Monthly cap hit: ${spent:.2f} >= ${cap:.2f}")


def assert_run_ok(run_id: int) -> None:
    cap = _cap("COST_CAP_RUN_USD", 1.0)
    with session() as s:
        spent = (
            s.scalar(
                select(func.coalesce(func.sum(BudgetLedger.cost_usd), 0.0)).where(
                    BudgetLedger.run_id == run_id
                )
            )
            or 0.0
        )
    if spent >= cap:
        raise BudgetExceeded(
            f"Per-run cap hit on run {run_id}: ${spent:.2f} >= ${cap:.2f}"
        )


def preflight(run_id: int | None = None) -> None:
    ensure_running()
    assert_daily_ok()
    assert_monthly_ok()
    if run_id is not None:
        assert_run_ok(run_id)


def record(
    stage: str,
    cost_usd: float,
    tokens_in: int = 0,
    tokens_out: int = 0,
    run_id: int | None = None,
    note: str | None = None,
) -> None:
    with session() as s:
        s.add(
            BudgetLedger(
                stage=stage,
                cost_usd=cost_usd,
                tokens_in=tokens_in,
                tokens_out=tokens_out,
                run_id=run_id,
                note=note,
            )
        )
        if run_id is not None:
            run = s.get(Run, run_id)
            if run:
                run.cost_usd += cost_usd
                run.tokens_in += tokens_in
                run.tokens_out += tokens_out
                run.heartbeat_at = datetime.utcnow()
        s.commit()
