# sub_agents/pothole_street_view/agent.py
"""Cloud‑friendly Pothole Street‑View Agent.

Changes vs original:
  • **No subprocess, no local image writes.** Instead imports the in‑memory
    `collect_street_view_images()` helper.
  • Returns fully‑qualified GCS URLs (already public) so the coordinator can
    inspect them directly.
  • Stateless: each call just delegates to the helper and assembles a short
    rationale.

Assumes `collect_street_view_images` is on the Python path (e.g. packaged
alongside the Cloud Function)."""

from __future__ import annotations

from typing import Dict, List

from google.adk import Agent
from google.adk.tools.agent_tool import AgentTool

from pothole_street_view import collect_street_view_images  # in‑memory uploader
from .prompt import POTHOLE_AGENT_PROMPT

MODEL = "gemini-2.5-pro"

# ── Tool wrapper -----------------------------------------------------------

def run_pothole_street_view(location: str, samples: int = 8) -> Dict[str, object]:
    """Call collect_street_view_images and shape the output for the LLM."""
    lat_str, lng_str = location.split(",", 1)
    lat, lng = float(lat_str), float(lng_str)

    urls: List[str] = collect_street_view_images(lat=lat, lng=lng, samples=samples)
    streetview_confidence = min(1.0, len(urls) / samples)
    rationale = f"Retrieved {len(urls)}/{samples} Street View snapshots around {location}."

    return {
        "location": location,
        "image_paths": urls,
        "streetview_confidence": streetview_confidence,
        "rationale": rationale,
    }

# ── ADK Agent --------------------------------------------------------------

pothole_agent = Agent(
    model=MODEL,
    name="pothole_agent",
    instruction=POTHOLE_AGENT_PROMPT,
    output_key="pothole_validation",
    tools=[
        AgentTool(
            name="run_pothole_street_view",
            description="Fetch Street View snapshots for a location and return URLs + confidence",
            tool=run_pothole_street_view,
        )
    ],
)
