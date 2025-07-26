#!/usr/bin/env python3
"""
event_coordinator.py
────────────────────
Light‑weight coordinator that aggregates Bengaluru cultural‑events
data using Google ADK.  The file intentionally follows the exact same
pattern as `traffic_coordinator.py`, so deploying both as Cloud
Functions or Cloud Run services is symmetrical:

    • flat Pydantic output schema
    • `LlmAgent` with a single sub‑agent tool
    • private async runner helper
    • public sync wrapper (`get_cultural_events`)
"""

from __future__ import annotations

import asyncio
import json
import logging
import re
import uuid
from typing import List

from google.adk.agents import LlmAgent
from google.adk.runners import Runner
from google.adk.sessions import InMemorySessionService
from google.adk.tools.agent_tool import AgentTool
from google.genai import types
from pydantic import BaseModel, Field, field_validator

# — Local imports -----------------------------------------------------------
from sub_agents.cultural_events.agent import cultural_events_agent
import prompt  # expects EVENT_COORDINATOR_PROMPT inside

# — Config ------------------------------------------------------------------
MODEL = "gemini-2.5-pro"

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)
logging.getLogger("google.genai").setLevel(logging.ERROR)

# — Output schema -----------------------------------------------------------
class EventsDigestOutput(BaseModel):
    bengaluru_events_digest: List[str] = Field(
        description="Short bullet‑points summing up upcoming cultural events"
    )

    @field_validator("bengaluru_events_digest", mode="after")
    @classmethod
    def _strip_brackets(cls, items: List[str]):
        """Remove any stray bracketed indices the LLM might insert, e.g. '[12, 34]'."""
        return [re.sub(r"\s*\[\d+,\s*\d+\]", "", txt) for txt in items]


# — Coordinator agent -------------------------------------------------------
event_coordinator = LlmAgent(
    name="event_coordinator",
    model=MODEL,
    description="Aggregates Bengaluru cultural events into a concise digest",
    instruction=prompt.EVENT_COORDINATOR_PROMPT,
    output_key="bengaluru_events_digest",
    tools=[AgentTool(agent=cultural_events_agent)],
)

# Default for `adk run`
root_agent = event_coordinator

# — Runner plumbing ---------------------------------------------------------
_session_service = InMemorySessionService()
_runner = Runner(
    agent=event_coordinator,
    app_name="cultural_event_orchestrator",
    session_service=_session_service,
)

# — Private async helper ----------------------------------------------------
async def _run_and_clean(user_input: str) -> EventsDigestOutput:
    """Create a fresh session, run coordinator, parse JSON, and validate."""
    session_id = uuid.uuid4().hex
    await _session_service.create_session(
        app_name="cultural_event_orchestrator",
        user_id="events_user",
        session_id=session_id,
    )

    content = types.Content(role="user", parts=[types.Part(text=user_input)])

    raw_response = None
    async for ev in _runner.run_async(
        user_id="events_user",
        session_id=session_id,
        new_message=content,
    ):
        if ev.is_final_response():
            raw_response = ev.content.parts[0].text
            break

    if raw_response is None:
        raise RuntimeError("Coordinator did not emit a final response")

    # Strip ```json fences if present
    payload_txt = re.sub(r"^```json\n|```$", "", raw_response, flags=re.DOTALL)

    try:
        data = json.loads(payload_txt)
    except json.JSONDecodeError as e:
        raise ValueError(f"Coordinator returned invalid JSON: {payload_txt}") from e

    return EventsDigestOutput.model_validate(data, strict=False)

# — Public sync wrapper -----------------------------------------------------
def get_cultural_events(
    user_input: str = "Upcoming cultural events in Bengaluru",
) -> EventsDigestOutput:
    """Convenience wrapper for scripts / notebooks / Cloud Functions."""
    return asyncio.run(_run_and_clean(user_input))


# — CLI helper (optional) ---------------------------------------------------
#if __name__ == "__main__":
  #  digest = get_cultural_events()
   # print("Cultural Events Digest:")
    #for line in digest.bengaluru_events_digest:
     #   print("  •", line)
