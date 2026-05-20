from __future__ import annotations

import typer
from sqlalchemy import func, select

from . import budgets
from .stages import build as build_stage
from .stages import deploy as deploy_stage
from .stages import digest as digest_stage
from .stages import discover as discover_stage
from .stages import monitor as monitor_stage
from .stages import seed as seed_stage
from .stages import spec as spec_stage
from .stages import test as test_stage
from .stages import triage as triage_stage


app = typer.Typer(no_args_is_help=True, add_completion=False, help="Auto-App pipeline CLI")


@app.command()
def seed() -> None:
    """Insert curated first-target candidates (Excalidraw / 2048) for the first end-to-end run."""
    seed_stage.run()


@app.command()
def discover(
    lane: str = typer.Option("all", help="web | mobile | all"),
    dry_run: bool = typer.Option(False, "--dry-run"),
) -> None:
    """Pull trending candidates from GitHub / Product Hunt / itch.io into the candidates table."""
    budgets.preflight()
    discover_stage.run(lane=lane, dry_run=dry_run)


@app.command()
def triage(
    candidate_id: int | None = typer.Option(None, help="Only triage a specific candidate"),
) -> None:
    """Open a GitHub issue per pending candidate (human approval gate)."""
    budgets.preflight()
    triage_stage.run(candidate_id=candidate_id)


@app.command()
def spec(candidate_id: int) -> None:
    """Generate clone-spec.json for an approved candidate."""
    budgets.preflight()
    spec_stage.run(candidate_id=candidate_id)


@app.command()
def build(candidate_id: int) -> None:
    """Run Aider against the lane template to build a clone."""
    budgets.preflight()
    build_stage.run(candidate_id=candidate_id)


@app.command()
def test(clone_id: int) -> None:
    """Run tests for a built clone."""
    test_stage.run(clone_id=clone_id)


@app.command()
def deploy(clone_id: int) -> None:
    """Open the deploy PR (Vercel for web, EAS for mobile)."""
    deploy_stage.run(clone_id=clone_id)


@app.command()
def approve(candidate_id: int) -> None:
    """Mark a candidate as approved (skips the GitHub-issue gate)."""
    from .state import Approval, Candidate, session
    from datetime import datetime

    with session() as s:
        c = s.get(Candidate, candidate_id)
        if not c:
            typer.echo(f"candidate {candidate_id} not found")
            raise typer.Exit(1)
        c.status = "approved"
        s.add(
            Approval(
                candidate_id=candidate_id,
                gate="triage",
                approved_by="cli",
                approved_at=datetime.utcnow(),
            )
        )
        s.commit()
    typer.echo(f"approved candidate {candidate_id} ({c.name})")


@app.command(name="run-all")
def run_all(candidate_id: int) -> None:
    """Run spec → build → test → deploy for an approved candidate."""
    from .state import Candidate, Clone, session
    from sqlalchemy import select

    with session() as s:
        c = s.get(Candidate, candidate_id)
        if not c:
            typer.echo(f"candidate {candidate_id} not found")
            raise typer.Exit(1)
        if c.status not in ("approved", "spec-ready"):
            typer.echo(f"candidate {candidate_id} is status={c.status}; approve it first")
            raise typer.Exit(1)

    spec_stage.run(candidate_id=candidate_id)
    build_stage.run(candidate_id=candidate_id)
    with session() as s:
        clone = s.scalar(
            select(Clone).where(Clone.candidate_id == candidate_id)
            .order_by(Clone.id.desc())
        )
        if not clone:
            typer.echo("build did not produce a clone — aborting")
            raise typer.Exit(1)
        clone_id = clone.id
    test_stage.run(clone_id=clone_id)
    deploy_stage.run(clone_id=clone_id)


@app.command()
def monitor() -> None:
    """Pull Plausible + Firebase metrics into metrics_daily."""
    monitor_stage.run()


@app.command()
def digest() -> None:
    """Weekly Friday digest email."""
    digest_stage.run()


@app.command(name="status")
def status_cmd() -> None:
    """Quick health check: candidate / run / clone counts and total spend."""
    from .state import BudgetLedger, Candidate, Clone, Run, session

    with session() as s:
        n_cands = s.scalar(select(func.count(Candidate.id))) or 0
        n_runs = s.scalar(select(func.count(Run.id))) or 0
        n_clones = s.scalar(select(func.count(Clone.id))) or 0
        spent = s.scalar(select(func.coalesce(func.sum(BudgetLedger.cost_usd), 0.0))) or 0.0
    typer.echo(f"candidates: {n_cands}")
    typer.echo(f"runs:       {n_runs}")
    typer.echo(f"clones:     {n_clones}")
    typer.echo(f"total cost: ${spent:.4f}")


if __name__ == "__main__":
    app()
