from __future__ import annotations

import json
import os
import shutil
import subprocess
from datetime import datetime
from pathlib import Path

import httpx

from ..notify import gh_request
from ..state import Candidate, Clone, Run, session


def _safe_slug(name: str) -> str:
    out = "".join(c if c.isalnum() or c in "-_" else "-" for c in name).strip("-").lower()
    return out[:50] or "clone"


def _repo_name(cand: Candidate) -> str:
    spec = json.loads(cand.spec_json) if cand.spec_json else {}
    distinct = spec.get("distinct_name") or cand.slug
    return f"clone-{_safe_slug(distinct)}"


def _create_github_repo(name: str, description: str) -> dict | None:
    payload = {
        "name": name,
        "description": (description or "")[:200],
        "private": False,
        "auto_init": False,
        "has_issues": True,
        "has_wiki": False,
    }
    r = gh_request("POST", "/user/repos", json=payload)
    if r.status_code == 422:
        owner = os.getenv("GH_OWNER")
        r2 = gh_request("GET", f"/repos/{owner}/{name}")
        return r2.json() if r2.status_code < 300 else None
    if r.status_code >= 300:
        print(f"[deploy] gh repo create failed: {r.status_code} {r.text[:200]}")
        return None
    return r.json()


def _run_git(cmd: list[str], cwd: Path) -> tuple[int, str]:
    p = subprocess.run(
        cmd, cwd=cwd, capture_output=True, text=True, timeout=180,
        env={**os.environ, "GIT_TERMINAL_PROMPT": "0"},
    )
    return p.returncode, (p.stdout + p.stderr).strip()


def _git_push(workdir: Path, remote_url: str) -> tuple[bool, str]:
    if not (workdir / ".git").exists():
        rc, out = _run_git(["git", "init"], workdir)
        if rc != 0:
            return False, f"git init: {out}"
    _run_git(["git", "config", "user.email", "auto-app@localhost"], workdir)
    _run_git(["git", "config", "user.name", "Auto-App"], workdir)
    _run_git(["git", "add", "-A"], workdir)
    _run_git(["git", "commit", "-m", "initial clone", "--allow-empty"], workdir)
    _run_git(["git", "branch", "-M", "main"], workdir)
    _run_git(["git", "remote", "remove", "origin"], workdir)
    rc, out = _run_git(["git", "remote", "add", "origin", remote_url], workdir)
    if rc != 0:
        return False, f"git remote add: {out}"
    rc, out = _run_git(["git", "push", "-u", "origin", "main", "--force"], workdir)
    if rc != 0:
        return False, f"git push: {out}"
    return True, "ok"


def _vercel_create_project(repo_full_name: str, name: str) -> str | None:
    token = os.getenv("VERCEL_TOKEN")
    if not token:
        return None
    try:
        r = httpx.post(
            "https://api.vercel.com/v10/projects",
            headers={"Authorization": f"Bearer {token}"},
            json={
                "name": name[:52],
                "framework": "nextjs",
                "gitRepository": {"type": "github", "repo": repo_full_name},
            },
            timeout=20,
        )
        if r.status_code == 409:
            return f"https://{name[:52]}.vercel.app"
        if r.status_code >= 300:
            print(f"[deploy] vercel project create: {r.status_code} {r.text[:200]}")
            return None
        data = r.json()
        return f"https://{data.get('name', name)}.vercel.app"
    except Exception as e:
        print(f"[deploy] vercel project create failed: {e}")
        return None


def _eas_publish(workdir: Path) -> tuple[str | None, str | None]:
    if not os.getenv("EXPO_TOKEN") or not shutil.which("eas"):
        if not shutil.which("eas"):
            print("[deploy] eas CLI not installed (npm i -g eas-cli) — skipping mobile publish")
        return None, None
    expo_url: str | None = None
    update_p = subprocess.run(
        ["eas", "update", "--branch", "production",
         "--message", "initial clone", "--non-interactive"],
        cwd=workdir, capture_output=True, text=True, timeout=300,
    )
    for line in (update_p.stdout + update_p.stderr).splitlines():
        if "expo.dev" in line and "/update" in line:
            expo_url = line.strip().split()[-1]
            break

    build_p = subprocess.run(
        ["eas", "build", "--profile", "preview", "--platform", "android",
         "--non-interactive", "--no-wait", "--json"],
        cwd=workdir, capture_output=True, text=True, timeout=180,
    )
    build_id: str | None = None
    try:
        out = json.loads(build_p.stdout)
        if isinstance(out, list) and out:
            build_id = out[0].get("id")
        elif isinstance(out, dict):
            build_id = out.get("id")
    except Exception:
        pass
    return expo_url, build_id


def _finalize(run_id: int, *, success: bool, error: str | None = None) -> None:
    with session() as s:
        r = s.get(Run, run_id)
        if r:
            r.status = "ok" if success else "failed"
            r.finished_at = datetime.utcnow()
            if error:
                r.error = error[:512]
            s.commit()


def run(clone_id: int) -> None:
    with session() as s:
        clone = s.get(Clone, clone_id)
        if not clone:
            print(f"[deploy] clone {clone_id} not found")
            return
        cand = s.get(Candidate, clone.candidate_id)
        run_row = Run(candidate_id=cand.id, lane=clone.lane, stage="deploy")
        s.add(run_row)
        s.commit()
        run_id = run_row.id
        workdir = Path(clone.workdir)
        lane = clone.lane
        cand_desc = cand.description or ""
        repo_name = _repo_name(cand)

    if not workdir.exists():
        _finalize(run_id, success=False, error=f"workdir missing: {workdir}")
        print(f"[deploy] workdir does not exist: {workdir}")
        return

    owner = os.getenv("GH_OWNER")
    if not owner:
        _finalize(run_id, success=False, error="GH_OWNER not set")
        print("[deploy] GH_OWNER not set — cannot create GitHub repo")
        return

    print(f"[deploy] creating GitHub repo {owner}/{repo_name} ...")
    repo = _create_github_repo(repo_name, cand_desc)
    if not repo:
        _finalize(run_id, success=False, error="github repo create failed")
        return

    remote_url = repo["clone_url"]
    token = os.getenv("GH_PAT")
    if token and remote_url.startswith("https://"):
        remote_url = remote_url.replace(
            "https://", f"https://x-access-token:{token}@"
        )

    print(f"[deploy] pushing workdir → {repo['html_url']} ...")
    ok, msg = _git_push(workdir, remote_url)
    if not ok:
        _finalize(run_id, success=False, error=msg)
        print(f"[deploy] push failed: {msg}")
        return

    deploy_url: str | None = None
    artifact_url: str | None = None
    if lane == "web":
        deploy_url = _vercel_create_project(repo["full_name"], repo_name)
        if not deploy_url:
            print(
                "[deploy] no Vercel auto-deploy. Manual import: "
                f"https://vercel.com/new/import?s={repo['html_url']}"
            )
    else:
        expo_url, build_id = _eas_publish(workdir)
        deploy_url = expo_url
        if build_id:
            artifact_url = (
                f"https://expo.dev/accounts/{owner}/projects/{repo_name}/builds/{build_id}"
            )

    with session() as s:
        c = s.get(Clone, clone_id)
        c.repo_url = repo["html_url"]
        if deploy_url:
            c.deploy_url = deploy_url
        if artifact_url:
            c.artifact_url = artifact_url
        s.commit()
    _finalize(run_id, success=True)
    print(
        f"[deploy] done — repo={repo['html_url']} "
        f"deploy={deploy_url or '(none)'} artifact={artifact_url or '(none)'}"
    )
