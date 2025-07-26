# sub_agents/pothole_street_view/agent.py
"""Pothole Street View Agent: validates pothole presence via geo snapshots."""

import os
import subprocess
import glob
from google.adk import Agent
from google.adk.tools.agent_tool import AgentTool
from . import prompt

MODEL = "gemini-2.5-pro"

# Tool function: runs the pothole_street_view script in geotag mode
# and collects generated image paths, confidence, and rationale.
def run_pothole_street_view(location: str, samples: int = 8) -> dict:
    """
    Runs `pothole_street_view.py` in geotag mode for the given location,
    returns dict with image paths, confidence, and rationale.
    """
    base_out = "street_view_images"
    if os.path.exists(base_out):
        for root, _, files in os.walk(base_out):
            for f in files:
                os.remove(os.path.join(root, f))

    cmd = [
        "python3", "pothole_street_view.py",
        location,
        "--mode", "geotag",
        "--samples", str(samples)
    ]
    subprocess.check_call(cmd)

    paths = glob.glob(os.path.join(base_out, "**", "*.jpg"), recursive=True)
    count = len(paths)
    streetview_confidence = min(1.0, count / samples)
    rationale = f"Retrieved {count} snapshot(s) around {location}"

    return {
        "location": location,
        "image_paths": paths,
        "streetview_confidence": streetview_confidence,
        "rationale": rationale
    }

# Wrap the tool with AgentTool, providing name and description
pothole_agent = Agent(
    model=MODEL,
    name="pothole_agent",
    instruction=prompt.POTHOLE_AGENT_PROMPT,
    output_key="pothole_validation_result",
    tools=[
        # AgentTool expects 'agent' rather than 'tool' kwarg, so wrap as a sub-agent
        AgentTool(agent=Agent(
            model=MODEL,
            name="run_pothole_street_view",
            description="Fetch Street View snapshots in geotag mode and compute confidence",
            tools=[],
            instruction="Use the Python function run_pothole_street_view as a tool",
            output_key="run_output"
        ))
    ],
)
