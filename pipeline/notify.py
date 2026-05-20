from __future__ import annotations

import os
from typing import Any

import httpx


GH_API = "https://api.github.com"


def send_email(subject: str, html: str, *, to: str | None = None) -> dict[str, Any] | None:
    api_key = os.getenv("RESEND_API_KEY")
    to = to or os.getenv("NOTIFY_EMAIL_TO")
    if not api_key or not to:
        print(f"[notify] skip email (no creds): {subject}")
        return None
    resp = httpx.post(
        "https://api.resend.com/emails",
        headers={"Authorization": f"Bearer {api_key}"},
        json={
            "from": "onboarding@resend.dev",
            "to": [to],
            "subject": subject,
            "html": html,
        },
        timeout=15,
    )
    resp.raise_for_status()
    return resp.json()


def gh_request(method: str, path: str, **kw: Any) -> httpx.Response:
    token = os.getenv("GH_PAT")
    headers = kw.pop("headers", {}) or {}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    headers.setdefault("Accept", "application/vnd.github+json")
    headers.setdefault("X-GitHub-Api-Version", "2022-11-28")
    return httpx.request(method, f"{GH_API}{path}", headers=headers, timeout=20, **kw)


def open_issue(
    repo: str, title: str, body: str, labels: list[str] | None = None
) -> str | None:
    payload: dict[str, Any] = {"title": title, "body": body}
    if labels:
        payload["labels"] = labels
    r = gh_request("POST", f"/repos/{repo}/issues", json=payload)
    if r.status_code >= 300:
        print(f"[notify] gh issue create failed: {r.status_code} {r.text[:200]}")
        return None
    return r.json().get("html_url")
