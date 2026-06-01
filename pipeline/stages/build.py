from __future__ import annotations

import json
import os
import shutil
import subprocess
from datetime import datetime
from pathlib import Path
from textwrap import dedent

from .. import budgets
from ..paths import app_dir, scaffold_dir
from ..state import Candidate, Clone, Run, session


def _prepare_workdir(candidate: Candidate) -> Path:
    workdir = app_dir(candidate.lane, candidate.slug)
    if workdir.exists():
        shutil.rmtree(workdir)
    workdir.parent.mkdir(parents=True, exist_ok=True)
    src = scaffold_dir(candidate.lane)
    if not src.exists():
        raise FileNotFoundError(f"scaffold not found: {src}")
    shutil.copytree(src, workdir)
    (workdir / "clone-spec.json").write_text(candidate.spec_json or "{}")
    return workdir


def _test_cmd(lane: str) -> list[str]:
    if lane == "web":
        return [
            "bash", "-c",
            "npm install --no-audit --no-fund --prefer-offline >/dev/null 2>&1 "
            "&& npm test --silent && npx --yes next build",
        ]
    return [
        "bash", "-c",
        "npm install --no-audit --no-fund --prefer-offline >/dev/null 2>&1 "
        "&& npm test --silent",
    ]


def _run_tests(workdir: Path, lane: str, timeout: int = 900) -> tuple[bool, str]:
    try:
        p = subprocess.run(
            _test_cmd(lane),
            cwd=workdir,
            capture_output=True,
            text=True,
            timeout=timeout,
        )
    except subprocess.TimeoutExpired:
        return False, "TIMEOUT (test command exceeded budget)"
    output = (p.stdout + "\n" + p.stderr).strip()
    return p.returncode == 0, output[-6000:]


def _aider_available() -> bool:
    return shutil.which("aider") is not None


def _aider_invoke(workdir: Path, message: str, model: str) -> int:
    if not _aider_available():
        print("[build] aider not installed. Install via: pip install 'auto-app[agent]'")
        return 127
    cmd = [
        "aider",
        "--model", model,
        "--yes",
        "--no-stream",
        "--auto-commits",
        "--map-tokens", "1024",
        "--message", message,
    ]
    return subprocess.call(cmd, cwd=workdir)


def _initial_message(spec: dict, agent_readme: str) -> str:
    return dedent(f"""\
        Build a clone of the target app described below. Read the agent instructions and spec carefully, then make all required edits.

        === AGENT INSTRUCTIONS ===
        {agent_readme}

        === CLONE SPEC ===
        {json.dumps(spec, indent=2)}

        When you are done, the project must satisfy:
          - `npm test` exits 0
          - (web only) `npx next build` exits 0
        Do not modify these test commands; modify the app code to satisfy them.
    """)


def _fix_message(failure_log: str) -> str:
    return dedent(f"""\
        Tests failed. Read the failure output below and fix the code so tests pass.

        === FAILURE OUTPUT (tail) ===
        {failure_log}

        Make minimal changes that get tests green. Do not delete tests or assertions.
    """)


def _finalize_run(run_id: int, *, success: bool, error: str | None = None) -> None:
    with session() as s:
        r = s.get(Run, run_id)
        if r:
            r.status = "ok" if success else "failed"
            r.finished_at = datetime.utcnow()
            if error:
                r.error = error[:512]
            s.commit()


def run(candidate_id: int, max_iter: int | None = None) -> None:
    budgets.preflight()
    max_iter = max_iter or int(os.getenv("ITER_CAP", 6))

    with session() as s:
        cand = s.get(Candidate, candidate_id)
        if not cand:
            print(f"[build] candidate {candidate_id} not found")
            return
        if not cand.spec_json:
            print(f"[build] candidate {candidate_id} has no spec_json — run spec first")
            return
        run_row = Run(candidate_id=candidate_id, lane=cand.lane, stage="build")
        s.add(run_row)
        s.commit()
        run_id = run_row.id
        spec = json.loads(cand.spec_json)
        lane, cand_slug = cand.lane, cand.slug

    try:
        with session() as s:
            workdir = _prepare_workdir(s.get(Candidate, candidate_id))
    except Exception as e:
        _finalize_run(run_id, success=False, error=f"prepare workdir failed: {e}")
        print(f"[build] prepare workdir failed: {e}")
        return

    agent_readme_path = scaffold_dir(lane) / "README-FOR-AGENT.md"
    agent_readme = agent_readme_path.read_text() if agent_readme_path.exists() else ""
    model = os.getenv("AUTO_APP_MODEL", "deepseek/deepseek-chat")

    last_log = ""
    success = False
    for i in range(1, max_iter + 1):
        try:
            budgets.preflight(run_id=run_id)
        except budgets.BudgetExceeded as e:
            _finalize_run(run_id, success=False, error=str(e))
            print(f"[build] aborted on iter {i}: {e}")
            return

        message = _initial_message(spec, agent_readme) if i == 1 else _fix_message(last_log)
        print(f"[build] iter {i}/{max_iter} for {cand_slug} ...")
        rc = _aider_invoke(workdir, message, model)
        if rc == 127:
            _finalize_run(run_id, success=False, error="aider not installed")
            return
        if rc != 0:
            print(f"[build] aider exited with rc={rc} on iter {i}")

        ok, log = _run_tests(workdir, lane)
        last_log = log
        with session() as s:
            r = s.get(Run, run_id)
            if r:
                r.iterations = i
                r.heartbeat_at = datetime.utcnow()
                s.commit()
        if ok:
            success = True
            print(f"[build] tests passed on iter {i}")
            break
        print(f"[build] tests failed on iter {i} — log tail:\n{log[-800:]}")

    if success:
        with session() as s:
            s.add(
                Clone(
                    candidate_id=candidate_id,
                    lane=lane,
                    workdir=str(workdir),
                )
            )
            s.commit()
        _finalize_run(run_id, success=True)
    else:
        _finalize_run(
            run_id, success=False, error=f"max iterations ({max_iter}) without green tests"
        )
    print(f"[build] done: {'success' if success else 'failed'} at workdir {workdir}")
