from __future__ import annotations

import os
from datetime import datetime, timezone
from typing import Any

import litellm
from litellm import completion

from . import budgets


DEFAULT_MODEL = os.getenv("AUTO_APP_MODEL", "deepseek/deepseek-chat")
FALLBACK_MODEL = os.getenv(
    "AUTO_APP_FALLBACK_MODEL",
    "together_ai/Qwen/Qwen2.5-Coder-32B-Instruct",
)


def is_off_peak_utc() -> bool:
    """DeepSeek off-peak window is 16:30–00:30 UTC (50% discount)."""
    now = datetime.now(timezone.utc)
    minutes = now.hour * 60 + now.minute
    return minutes >= (16 * 60 + 30) or minutes < 30


def _track_cost(response: Any, stage: str, run_id: int | None) -> float:
    try:
        cost = float(litellm.completion_cost(completion_response=response))
    except Exception:
        cost = 0.0
    usage = getattr(response, "usage", None)
    tokens_in = getattr(usage, "prompt_tokens", 0) or 0
    tokens_out = getattr(usage, "completion_tokens", 0) or 0
    budgets.record(stage, cost, tokens_in, tokens_out, run_id=run_id)
    return cost


def chat(
    messages: list[dict],
    stage: str,
    *,
    run_id: int | None = None,
    model: str | None = None,
    max_tokens: int = 4096,
    **kw: Any,
) -> str:
    budgets.preflight(run_id=run_id)
    model = model or DEFAULT_MODEL
    try:
        resp = completion(model=model, messages=messages, max_tokens=max_tokens, **kw)
    except Exception as primary_err:
        try:
            resp = completion(
                model=FALLBACK_MODEL, messages=messages, max_tokens=max_tokens, **kw
            )
        except Exception as fallback_err:
            raise RuntimeError(
                f"LLM failed: primary={primary_err}; fallback={fallback_err}"
            )
    _track_cost(resp, stage, run_id)
    return resp.choices[0].message.content or ""
