from __future__ import annotations

import os
from datetime import datetime
from typing import Optional

from sqlalchemy import (
    DateTime,
    Float,
    ForeignKey,
    Integer,
    String,
    Text,
    create_engine,
)
from sqlalchemy.engine import Engine
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, sessionmaker


class Base(DeclarativeBase):
    pass


class Candidate(Base):
    __tablename__ = "candidates"

    id: Mapped[int] = mapped_column(primary_key=True)
    source: Mapped[str] = mapped_column(String(64))              # producthunt | github | itchio
    lane: Mapped[str] = mapped_column(String(16))                # web | mobile
    slug: Mapped[str] = mapped_column(String(160), unique=True)
    name: Mapped[str] = mapped_column(String(256))
    url: Mapped[str] = mapped_column(String(512))
    description: Mapped[Optional[str]] = mapped_column(Text, default=None)
    license: Mapped[Optional[str]] = mapped_column(String(64), default=None)
    score: Mapped[float] = mapped_column(Float, default=0.0)
    tractability: Mapped[float] = mapped_column(Float, default=0.0)
    status: Mapped[str] = mapped_column(String(32), default="discovered")
    triage_issue_url: Mapped[Optional[str]] = mapped_column(String(512), default=None)
    spec_json: Mapped[Optional[str]] = mapped_column(Text, default=None)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class Run(Base):
    __tablename__ = "runs"

    id: Mapped[int] = mapped_column(primary_key=True)
    candidate_id: Mapped[int] = mapped_column(ForeignKey("candidates.id"))
    lane: Mapped[str] = mapped_column(String(16))
    stage: Mapped[str] = mapped_column(String(32))
    status: Mapped[str] = mapped_column(String(32), default="running")
    started_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    heartbeat_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    finished_at: Mapped[Optional[datetime]] = mapped_column(DateTime, default=None)
    cost_usd: Mapped[float] = mapped_column(Float, default=0.0)
    tokens_in: Mapped[int] = mapped_column(Integer, default=0)
    tokens_out: Mapped[int] = mapped_column(Integer, default=0)
    iterations: Mapped[int] = mapped_column(Integer, default=0)
    transcript_path: Mapped[Optional[str]] = mapped_column(String(512), default=None)
    error: Mapped[Optional[str]] = mapped_column(Text, default=None)


class Clone(Base):
    __tablename__ = "clones"

    id: Mapped[int] = mapped_column(primary_key=True)
    candidate_id: Mapped[int] = mapped_column(ForeignKey("candidates.id"))
    lane: Mapped[str] = mapped_column(String(16))
    repo_url: Mapped[str] = mapped_column(String(512))
    deploy_url: Mapped[Optional[str]] = mapped_column(String(512), default=None)
    artifact_url: Mapped[Optional[str]] = mapped_column(String(512), default=None)  # APK / Expo Go QR
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class MetricDaily(Base):
    __tablename__ = "metrics_daily"

    id: Mapped[int] = mapped_column(primary_key=True)
    clone_id: Mapped[int] = mapped_column(ForeignKey("clones.id"))
    date: Mapped[str] = mapped_column(String(10))                # YYYY-MM-DD
    visits: Mapped[int] = mapped_column(Integer, default=0)
    sessions: Mapped[int] = mapped_column(Integer, default=0)
    extra_json: Mapped[Optional[str]] = mapped_column(Text, default=None)


class Approval(Base):
    __tablename__ = "approvals"

    id: Mapped[int] = mapped_column(primary_key=True)
    candidate_id: Mapped[int] = mapped_column(ForeignKey("candidates.id"))
    gate: Mapped[str] = mapped_column(String(32))                # triage | deploy | improve
    approved_by: Mapped[Optional[str]] = mapped_column(String(128), default=None)
    approved_at: Mapped[Optional[datetime]] = mapped_column(DateTime, default=None)


class BudgetLedger(Base):
    __tablename__ = "budget_ledger"

    id: Mapped[int] = mapped_column(primary_key=True)
    occurred_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    stage: Mapped[str] = mapped_column(String(32))
    run_id: Mapped[Optional[int]] = mapped_column(ForeignKey("runs.id"), default=None)
    cost_usd: Mapped[float] = mapped_column(Float)
    tokens_in: Mapped[int] = mapped_column(Integer, default=0)
    tokens_out: Mapped[int] = mapped_column(Integer, default=0)
    note: Mapped[Optional[str]] = mapped_column(String(256), default=None)


def _build_url() -> str:
    turso_url = os.getenv("TURSO_DATABASE_URL")
    turso_token = os.getenv("TURSO_AUTH_TOKEN")
    if turso_url and turso_token:
        host = turso_url.replace("libsql://", "").replace("https://", "")
        return f"sqlite+libsql://{host}?authToken={turso_token}&secure=true"
    os.makedirs("data", exist_ok=True)
    return "sqlite:///data/local.db"


_engine: Engine | None = None
_Session = None


def get_engine() -> Engine:
    global _engine, _Session
    if _engine is None:
        _engine = create_engine(_build_url(), future=True)
        Base.metadata.create_all(_engine)
        _Session = sessionmaker(bind=_engine, expire_on_commit=False)
    return _engine


def session():
    get_engine()
    return _Session()
