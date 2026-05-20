from __future__ import annotations

import typer
from sqlalchemy import func, select

from . import budgets
from .stages import build as build_stage
from .stages import deploy as deploy_stage
from .stages import digest as digest_stage
from .stages import discover as discover_stage
from .stages import monitor as monitor_stage
from .stages import spec as spec_stage
from .stages import test as test_stage
from .stages import triage as triage_stage


app = typer.Typer(no_args_is_help=True, add_completion=False, help="Auto-App pipeline CLI")


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
