from __future__ import annotations

import os
from textwrap import dedent

from sqlalchemy import select

from ..notify import open_issue
from ..state import Candidate, session


def _issue_body(c: Candidate) -> str:
    return dedent(f"""\
        ## Candidate: {c.name}

        - **Lane:** `{c.lane}`
        - **Source:** {c.url}
        - **License:** {c.license or "unknown"}
        - **Tractability score:** {c.tractability:.2f}
        - **Trending score:** {c.score:.2f}

        ### Description
        {c.description or "_(none)_"}

        ### How to approve
        Add the `approved` label to this issue OR click Approve in the dashboard.

        ### How to reject
        Close this issue.
    """)


def _approval_repo() -> str | None:
    owner = os.getenv("GH_OWNER")
    repo = os.getenv("GH_REPO", "auto-app")
    if not owner:
        return None
    return f"{owner}/{repo}"


def _pending(s, candidate_id: int | None) -> list[Candidate]:
    if candidate_id is not None:
        c = s.get(Candidate, candidate_id)
        return [c] if c else []
    return list(s.scalars(select(Candidate).where(Candidate.status == "discovered")))


def run(candidate_id: int | None = None) -> None:
    with session() as s:
        candidates = _pending(s, candidate_id)
        if not candidates:
            print("[triage] no pending candidates")
            return
        repo = _approval_repo()
        if not repo:
            print("[triage] GH_OWNER not set — printing issues to stdout instead of GitHub")
        for c in candidates:
            title = f"Candidate: {c.name} ({c.lane})"
            body = _issue_body(c)
            if not repo:
                print(f"\n--- would post issue ---\n{title}\n{body}\n------------------------")
                c.status = "triaged"
                continue
            url = open_issue(repo, title, body, labels=["candidate", c.lane])
            if url:
                c.triage_issue_url = url
                c.status = "triaged"
                print(f"[triage] {c.name}: {url}")
            else:
                print(f"[triage] {c.name}: issue create failed")
        s.commit()
