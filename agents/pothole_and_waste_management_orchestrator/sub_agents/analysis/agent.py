# sub_agents/analysis/agent.py
"""Analysis agent for pothole detection: extracts GPS from image and judges clarity/pothole presence."""

from google.adk import Agent
from . import prompt
from . import exif_latlong_extractor

MODEL = "gemini-2.5-pro"

# Define the analysis agent with EXIF-based location extraction as a tool
analysis_agent = Agent(
    model=MODEL,
    name="analysis_agent",
    instruction=prompt.ANALYSIS_AGENT_PROMPT,  # Uses EXIF and lat/lng inputs
    output_key="analysis_result",
    tools=[exif_latlong_extractor.extract_exif_lat_lng],  # EXIF tool to pull GPS from uploaded image
)
