# sub_agents/analysis/agent.py
"""Analysis agent for pothole detection: extracts GPS from image and judges clarity/pothole presence."""

from google.adk import Agent
from .prompt import ANALYSIS_AGENT_PROMPT
from .exif_latlong_extractor import extract_exif_lat_lng

MODEL = "gemini-2.5-pro"

# Define the analysis agent with EXIF-based location extraction as a tool
analysis_agent = Agent(
    model=MODEL,
    name="analysis_agent",
    instruction=ANALYSIS_AGENT_PROMPT,  # Uses EXIF and lat/lng inputs
    output_key="analysis_result",
    tools=[extract_exif_lat_lng],  # EXIF tool to pull GPS from uploaded image
)
