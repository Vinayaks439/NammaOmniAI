#!/usr/bin/env python3
import re
import json
import uuid
import asyncio
import logging
import sys
import warnings
import argparse
import requests
import tempfile
import os

from pydantic import BaseModel, Field, field_validator
from typing import List, Optional, Any
from google.adk.agents import LlmAgent
from google.adk.tools.agent_tool import AgentTool
from google.adk.runners import Runner
from google.adk.sessions import InMemorySessionService
from google.genai import types

from .sub_agents.analysis.agent import analysis_agent
from .sub_agents.pothole_street_view.agent import pothole_agent
from .prompt import POTHOLE_COORDINATOR_PROMPT

# --- enable debug logging for ADK internals and agent/tool events ---
logging.getLogger("google.adk").setLevel(logging.DEBUG)
logging.getLogger("google.adk").addHandler(logging.StreamHandler(sys.stdout))

MODEL = "gemini-2.5-pro"
logging.getLogger("google.genai").setLevel(logging.ERROR)
warnings.filterwarnings("ignore", message="there are non-text parts in the response:")

class PotholeDetectionOutput(BaseModel):
    location: str = Field(...)
    clarity_score: Optional[float] = Field(default=None)
    pothole_confidence: Optional[float] = Field(default=None)
    image_paths: Any = Field(default_factory=list)
    streetview_confidence: Optional[float] = Field(default=None)
    validation_confidence: Optional[float] = Field(default=None)
    rationale: str = Field(...)

    @field_validator("image_paths", mode="after")
    @classmethod
    def stringify_paths(cls, v):
        return [str(p) for p in v]

pothole_coordinator = LlmAgent(
    name="pothole_coordinator",
    model=MODEL,
    description="Given an image URL and/or a location, detect potholes via analysis and optional Street View validation.",
    instruction=POTHOLE_COORDINATOR_PROMPT,
    output_key="pothole_detection_result",
    tools=[AgentTool(agent=analysis_agent), AgentTool(agent=pothole_agent)],
)

session_service = InMemorySessionService()
runner = Runner(
    agent=pothole_coordinator,
    app_name="pothole_orchestrator",
    session_service=session_service,
)

async def _run_and_clean(user_input: str) -> PotholeDetectionOutput:
    session_id = uuid.uuid4().hex
    await session_service.create_session(
        app_name="pothole_orchestrator",
        user_id="pothole_user",
        session_id=session_id,
    )

    content = types.Content(role="user", parts=[types.Part(text=user_input)])
    raw = None

    async for ev in runner.run_async(
        user_id="pothole_user",
        session_id=session_id,
        new_message=content,
    ):
        # --- debug every ADK event ---
        print("\n=== ADK EVENT ===")
        print(ev)

        # if the event carries model output
        if ev.content:
            for part in ev.content.parts:
                print(">>> MODEL OUTPUT:", part.text)

        # detect tool invocation or response metadata
        if hasattr(ev, "tool_name"):
            print(">>> TOOL INVOCATION:", ev.tool_name, getattr(ev, "tool_args", None))
        if hasattr(ev, "tool_response"):
            print(">>> TOOL RESPONSE:", ev.tool_response)

        if ev.is_final_response():
            raw = ev.content.parts[0].text
            break

    if raw is None:
        raise RuntimeError("No response from orchestrator")

    print("\n=== LLM RAW RESPONSE START ===")
    print(raw)
    print("=== LLM RAW RESPONSE END ===")

    payload = re.sub(r"^```json\s*|\s*```$", "", raw, flags=re.DOTALL)
    print("\n=== JSON PAYLOAD START ===")
    print(payload)
    print("=== JSON PAYLOAD END ===")

    data = json.loads(payload)
    return PotholeDetectionOutput.model_validate(data, strict=False)

def main():
    parser = argparse.ArgumentParser(
        description="Run pothole coordinator with optional image (file or URL) and/or location."
    )
    parser.add_argument("--image", help="Path to the road-surface image file (with EXIF)")
    parser.add_argument("--url", help="URL to download the road-surface image")
    parser.add_argument("location", nargs="?", default="", help="Latitude,Longitude or address (optional)")
    args = parser.parse_args()

    if not args.url and not args.image and re.match(r"^https?://", args.location):
        args.url = args.location
        args.location = ""

    image_path = None
    if args.url:
        resp = requests.get(args.url)
        resp.raise_for_status()
        tmp = tempfile.NamedTemporaryFile(delete=False, suffix=os.path.splitext(args.url)[1] or ".jpg")
        tmp.write(resp.content)
        tmp.flush()
        image_path = tmp.name
    elif args.image:
        image_path = args.image

    if image_path and args.location:
        user_input = f"{image_path} {args.location}"
    elif image_path:
        user_input = image_path
    elif args.location:
        user_input = args.location
    else:
        parser.error("Provide at least an image (--image/--url) or a location (lat,long).")

    result = asyncio.run(_run_and_clean(user_input))
    print("\n=== FINAL PARSED OUTPUT ===")
    print(result.model_dump_json(indent=2))

if __name__ == "__main__":
    main()
root_agent = pothole_coordinator