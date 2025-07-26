#!/usr/bin/env python3
"""
pothole_orchestrator.py – refactored with **generic Any‑field schema**
──────────────────────────────────────────────────────────────────────
Mirrors the output‑schema pattern you used for cultural events: the model now
exposes a single `pothole_event` field typed as `Any`, with a helper validator
that converts nested dicts to JSON strings so downstream consumers can treat
it uniformly.
"""

from __future__ import annotations

import asyncio
import json
import logging
import re
import uuid
from typing import Any, Dict

from google.adk.agents import LlmAgent
from google.adk.runners import Runner
from google.adk.sessions import InMemorySessionService
from google.adk.tools.agent_tool import AgentTool
from google.genai import types
from pydantic import BaseModel, Field, field_validator

# ── Local imports ----------------------------------------------------------
from sub_agents.analysis.agent import analysis_agent
from sub_agents.pothole_street_view.agent import pothole_agent
from prompt import POTHOLE_COORDINATOR_PROMPT

# ── Config ----------------------------------------------------------------
MODEL = "gemini-2.5-pro"

logging.basicConfig(level=logging.INFO, format="%(levelname)s | %(message)s")
logger = logging.getLogger("pothole_orchestrator")
logging.getLogger("google.genai").setLevel(logging.ERROR)

# ── Output schema ----------------------------------------------------------
class PotholeEventOutput(BaseModel):
    pothole_event: Any = Field(
        id=str,
        timestamp=str,
        title=str,
        description=str,
        severity=str,
        category=str,
        location=str,
        lat=float,
        long=float,
        sentiment=str,
    )

    @field_validator("pothole_event", mode="after")
    @classmethod
    def _stringify(cls, v):
        if isinstance(v, Dict):
            return json.dumps(v)
        return str(v)


# ── Coordinator agent ------------------------------------------------------
pothole_coordinator = LlmAgent(
    name="pothole_coordinator",
    model=MODEL,
    description="Aggregates local image analysis and Street‑View validation",
    instruction=POTHOLE_COORDINATOR_PROMPT,
    output_key="pothole_event",
    tools=[AgentTool(agent=analysis_agent), AgentTool(agent=pothole_agent)],
)

root_agent = pothole_coordinator  # for `adk run .`

# ── Runner plumbing --------------------------------------------------------
_session_service = InMemorySessionService()
_runner = Runner(
    agent=pothole_coordinator,
    app_name="pothole_orchestrator",
    session_service=_session_service,
)

# ── Async helper -----------------------------------------------------------
async def _run_and_clean(user_input: str) -> PotholeEventOutput:
    session_id = uuid.uuid4().hex
    await _session_service.create_session(
        app_name="pothole_orchestrator",
        user_id="pothole_user",
        session_id=session_id,
    )

    content = types.Content(role="user", parts=[types.Part(text=user_input)])

    raw_response: str | None = None
    async for ev in _runner.run_async(
        user_id="pothole_user",
        session_id=session_id,
        new_message=content,
    ):
        if ev.is_final_response():
            raw_response = ev.content.parts[0].text
            break

    if raw_response is None:
        raise RuntimeError("Coordinator emitted no final response")

    payload_txt = re.sub(r"^```json\s*|\s*```$", "", raw_response, flags=re.DOTALL)
    try:
        data_dict: Dict[str, Any] = json.loads(payload_txt)
    except json.JSONDecodeError:
        # fallback – treat raw string as event JSON inside the field
        data_dict = {"pothole_event": payload_txt}

    # Ensure structure matches model (wrap if necessary)
    if "pothole_event" not in data_dict:
        data_dict = {"pothole_event": data_dict}

    return PotholeEventOutput.model_validate(data_dict, strict=False)


# ── Public sync wrapper ----------------------------------------------------

def get_pothole_event(user_input: str) -> PotholeEventOutput:
    """Sync convenience wrapper for Cloud Functions / scripts."""
    return asyncio.run(_run_and_clean(user_input))


#__all__ = ["get_pothole_event", "pothole_coordinator", "root_agent"]
