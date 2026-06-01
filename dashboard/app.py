from __future__ import annotations

import json
import os
import secrets
from datetime import datetime, timedelta
from pathlib import Path

from fastapi import Depends, FastAPI, HTTPException, Request, status
from fastapi.responses import HTMLResponse, RedirectResponse
from fastapi.security import HTTPBasic, HTTPBasicCredentials
from fastapi.templating import Jinja2Templates
from sqlalchemy import desc, func, select

from pipeline.state import (
    Approval,
    BudgetLedger,
    Candidate,
    Clone,
    MetricDaily,
    Run,
    session,
)


HERE = Path(__file__).resolve().parent
templates = Jinja2Templates(directory=HERE / "views")
security = HTTPBasic(auto_error=False)
app = FastAPI(title="Auto-App dashboard")


def _check_auth(
    credentials: HTTPBasicCredentials | None = Depends(security),
) -> str:
    expected = os.getenv("DASHBOARD_PASSWORD", "")
    if not expected:
        return "anonymous"
    if credentials is None or not secrets.compare_digest(
        credentials.password, expected
    ):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="bad credentials",
            headers={"WWW-Authenticate": "Basic"},
        )
    return credentials.username or "user"


@app.get("/", response_class=HTMLResponse)
def index(request: Request, _: str = Depends(_check_auth)) -> HTMLResponse:
    with session() as s:
        candidates = list(
            s.scalars(select(Candidate).order_by(desc(Candidate.created_at)).limit(50))
        )
        clones = list(
            s.scalars(select(Clone).order_by(desc(Clone.created_at)).limit(20))
        )
        spend_total = (
            s.scalar(select(func.coalesce(func.sum(BudgetLedger.cost_usd), 0.0))) or 0.0
        )
        day_ago = datetime.utcnow() - timedelta(days=1)
        spend_day = (
            s.scalar(
                select(func.coalesce(func.sum(BudgetLedger.cost_usd), 0.0)).where(
                    BudgetLedger.occurred_at >= day_ago
                )
            )
            or 0.0
        )
        month_ago = datetime.utcnow() - timedelta(days=30)
        spend_month = (
            s.scalar(
                select(func.coalesce(func.sum(BudgetLedger.cost_usd), 0.0)).where(
                    BudgetLedger.occurred_at >= month_ago
                )
            )
            or 0.0
        )
    return templates.TemplateResponse(
        request,
        "index.html",
        {
            "candidates": candidates,
            "clones": clones,
            "spend_total": spend_total,
            "spend_day": spend_day,
            "spend_month": spend_month,
        },
    )


@app.post("/approve/{candidate_id}")
def approve(
    candidate_id: int, _: str = Depends(_check_auth)
) -> RedirectResponse:
    with session() as s:
        c = s.get(Candidate, candidate_id)
        if not c:
            raise HTTPException(status_code=404, detail="not found")
        c.status = "approved"
        s.add(
            Approval(
                candidate_id=candidate_id,
                gate="triage",
                approved_by="dashboard",
                approved_at=datetime.utcnow(),
            )
        )
        s.commit()
    return RedirectResponse(url="/", status_code=303)


@app.get("/runs/{run_id}", response_class=HTMLResponse)
def run_detail(
    run_id: int, request: Request, _: str = Depends(_check_auth)
) -> HTMLResponse:
    with session() as s:
        r = s.get(Run, run_id)
        if not r:
            raise HTTPException(status_code=404, detail="not found")
        cand = s.get(Candidate, r.candidate_id)
        spec = json.loads(cand.spec_json) if cand.spec_json else None
    return templates.TemplateResponse(
        request,
        "run.html",
        {"run": r, "candidate": cand, "spec": spec},
    )


@app.get("/candidates/{candidate_id}", response_class=HTMLResponse)
def candidate_detail(
    candidate_id: int, request: Request, _: str = Depends(_check_auth)
) -> HTMLResponse:
    with session() as s:
        c = s.get(Candidate, candidate_id)
        if not c:
            raise HTTPException(status_code=404, detail="not found")
        runs = list(
            s.scalars(
                select(Run).where(Run.candidate_id == candidate_id).order_by(Run.id)
            )
        )
        spec = json.loads(c.spec_json) if c.spec_json else None
    return templates.TemplateResponse(
        request,
        "candidate.html",
        {"candidate": c, "runs": runs, "spec": spec},
    )
