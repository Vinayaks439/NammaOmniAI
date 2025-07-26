# sub_agents/cultural_events_agent.py – minimal search agent
from google.adk import Agent
from google.adk.tools import google_search

from .prompt import CULTURAL_EVENTS_PROMPT  # expects CULTURAL_EVENTS_PROMPT text

MODEL = "gemini-2.5-pro"

cultural_events_agent = Agent(
    model=MODEL,
    name="cultural_events_agent",
    instruction=CULTURAL_EVENTS_PROMPT,
    output_key="cultural_events",
    tools=[google_search],
)
