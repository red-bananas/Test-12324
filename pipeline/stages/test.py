from __future__ import annotations

from datetime import datetime
from pathlib import Path

from .build import _run_tests
from ..state import Clone, Run, session


def run(clone_id: int) -> None:
    """Re-run the lane's test command on a Clone's workdir as a deploy gate."""
    with session() as s:
        clone = s.get(Clone, clone_id)
        if not clone:
            print(f"[test] clone {clone_id} not found")
            return
        run_row = Run(candidate_id=clone.candidate_id, lane=clone.lane, stage="test")
        s.add(run_row)
        s.commit()
        run_id = run_row.id
        workdir = Path(clone.repo_url)
        lane = clone.lane

    if not workdir.exists():
        with session() as s:
            r = s.get(Run, run_id)
            r.status = "failed"
            r.error = f"workdir missing: {workdir}"
            r.finished_at = datetime.utcnow()
            s.commit()
        print(f"[test] workdir does not exist: {workdir}")
        return

    print(f"[test] running tests in {workdir} ...")
    ok, log = _run_tests(workdir, lane)
    with session() as s:
        r = s.get(Run, run_id)
        r.status = "ok" if ok else "failed"
        r.finished_at = datetime.utcnow()
        if not ok:
            r.error = log[-512:]
        s.commit()
    print(f"[test] {'PASS' if ok else 'FAIL'}")
    if not ok:
        print(f"[test] log tail:\n{log[-1500:]}")
