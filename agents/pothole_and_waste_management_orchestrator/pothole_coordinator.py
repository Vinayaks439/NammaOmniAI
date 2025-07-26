# pothole_orchestrator.py
"""
Library module for the Pothole Detection Coordinator (Google ADK).

Usage in your app:
    from pothole_orchestrator import get_pothole_detection

    result = get_pothole_detection(
        "/path/to/road.jpg 12.92,77.48"
        # or just "/path/to/road.jpg"
        # or just "12.92,77.48"
    )
    print(result.model_dump())

If you run `adk run .` in this directory, ADK will pick up `root_agent`
automatically.
"""

from __future__ import annotations

import asyncio
import json
import logging
import re
import uuid
import warnings
from typing import Any, Optional, List

from concurrent.futures import ThreadPoolExecutor 

from google.adk.agents import LlmAgent
from google.adk.runners import Runner
from google.adk.sessions import InMemorySessionService
from google.adk.tools.agent_tool import AgentTool
from google.genai import types
from pydantic import BaseModel, Field, field_validator

from sub_agents.analysis.agent import analysis_agent
from sub_agents.pothole_street_view.agent import pothole_agent
from prompt import POTHOLE_COORDINATOR_PROMPT

_executor = ThreadPoolExecutor(max_workers=1)

# ── Logging / warnings ───────────────────────────────────────────────────────
logging.basicConfig(level=logging.INFO, format="%(levelname)s | %(name)s | %(message)s")
logger = logging.getLogger("pothole_orchestrator")

warnings.filterwarnings("ignore", message="there are non-text parts in the response:")
logging.getLogger("google.genai").setLevel(logging.ERROR)

MODEL = "gemini-2.5-pro"

# ── Pydantic output schema ───────────────────────────────────────────────────
class PotholeDetectionOutput(BaseModel):
    location: str
    clarity_score: Optional[float] = None
    pothole_confidence: Optional[float] = None
    image_paths: List[str] = Field(default_factory=list)
    streetview_confidence: Optional[float] = None
    validation_confidence: Optional[float] = None
    rationale: str

    @field_validator("image_paths", mode="after")
    @classmethod
    def stringify_paths(cls, v):
        if isinstance(v, dict):
            return json.dumps(v)
        return str(v)
# ── Agent definition ─────────────────────────────────────────────────────────
pothole_coordinator = LlmAgent(
    name="pothole_coordinator",
    model=MODEL,
    description=(
        "Aggregates local image analysis and Street‑View validation to detect potholes "
        "given an image path/URL and/or a location string."
    ),
    instruction=POTHOLE_COORDINATOR_PROMPT,
    output_key="pothole_detection_result",
    tools=[
        AgentTool(agent=analysis_agent),
        AgentTool(agent=pothole_agent),
    ],
)

# Allow `adk run` discovery
root_agent = pothole_coordinator

# ── Runner setup ─────────────────────────────────────────────────────────────
_session_service = InMemorySessionService()
_runner = Runner(
    agent=pothole_coordinator,
    app_name="pothole_orchestrator",
    session_service=_session_service,
)

async def _run_and_clean(user_input: str) -> PotholeDetectionOutput:
    """Internal async helper; creates a fresh ADK session, streams until the
    final response, and returns a validated PotholeDetectionOutput object."""
    session_id = uuid.uuid4().hex
    await _session_service.create_session(
        app_name="pothole_orchestrator",
        user_id="pothole_user",
        session_id=session_id,
    )

    content = types.Content(role="user", parts=[types.Part(text=user_input)])
    raw_response: Optional[str] = None

    async for event in _runner.run_async(
        user_id="pothole_user",
        session_id=session_id,
        new_message=content,
    ):
        if event.is_final_response():
            raw_response = event.content.parts[0].text
            break

    if raw_response is None:
        raise RuntimeError("Agent did not emit a final response")

    # Remove ```json fences (if any) and load JSON
    json_str = re.sub(r"^```json\s*|\s*```$", "", raw_response, flags=re.DOTALL)
    payload = json.loads(json_str)

    return PotholeDetectionOutput.model_validate(payload, strict=False)

# Public, synchronous wrapper (same shape as get_traffic_digest)
def get_pothole_detection(user_input: str) -> PotholeDetectionOutput:
    """
    Thread‑safe wrapper that works whether or not an event loop
    is already running (e.g. inside Cloud Run).
    """
    async def _runner():
        return await _run_and_clean(user_input)

    try:
        loop = asyncio.get_running_loop()
        # If we’re already inside a loop, off‑load to a worker thread
        return _executor.submit(lambda: asyncio.run(_runner())).result()
    except RuntimeError:
        # No event loop yet – safe to start one normally
        return asyncio.run(_runner())
