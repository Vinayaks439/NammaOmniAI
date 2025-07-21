# traffic_update_orchestrator/traffic_coordinator.py

import re
import json
import asyncio
from pydantic import BaseModel, Field, field_validator
from google.adk.agents import LlmAgent
from google.adk.tools.agent_tool import AgentTool
from google.adk.runners import Runner

from .sub_agents.bbmp.agent import bbmp_agent
from .sub_agents.btp.agent import btp_agent
from .sub_agents.social_media.agent import social_media_agent
from .sub_agents.weather.agent import weather_agent
from . import prompt

MODEL = "gemini-2.5-pro"


class WeatherEntry(BaseModel):
    location: str
    temperature: str
    conditions: str
    precipitation: str
    wind: str


class TrafficDigestOutput(BaseModel):
    bengaluru_traffic_digest: list[str] = Field(
        ..., description="Each entry is one traffic-update string"
    )
    location_weather: list[WeatherEntry] = Field(
        ..., description="Structured weather data per location"
    )

    @field_validator("bengaluru_traffic_digest", mode="after")
    @classmethod
    def strip_urls(cls, items: list[str]) -> list[str]:
        url_pattern = re.compile(r"https?://\S+")
        return [url_pattern.sub("", item).strip() for item in items]


traffic_coordinator = LlmAgent(
    name="traffic_coordinator",
    model=MODEL,
    description="Aggregates BBMP, BTP, social feeds, and weather for a Bengaluru traffic snapshot",
    instruction=prompt.TRAFFIC_COORDINATOR_PROMPT,
    output_key="bengaluru_traffic_digest",
    #output_schema=TrafficDigestOutput,
    tools=[
        AgentTool(agent=bbmp_agent),
        AgentTool(agent=btp_agent),
        AgentTool(agent=social_media_agent),
        AgentTool(agent=weather_agent),
    ],
)

root_agent = traffic_coordinator  # for `adk run`


async def _run_and_clean(user_input: str) -> TrafficDigestOutput:
    # Invoke the coordinator (now can call weather_agent internally if prompted)
    result = await Runner.run(traffic_coordinator, user_input)
    raw = result.final_output

    # Extract JSON
    try:
        data = json.loads(raw)
    except json.JSONDecodeError:
        m = re.search(r"(\{.*\})", raw, re.DOTALL)
        if not m:
            raise ValueError("No JSON found in agent output")
        data = json.loads(m.group(1))

    return TrafficDigestOutput.parse_obj(data)


def get_traffic_digest(user_input: str = "City wide summary") -> TrafficDigestOutput:
    return asyncio.run(_run_and_clean(user_input))


if __name__ == "__main__":
    digest = get_traffic_digest("City wide summary")
    print("Traffic Updates:")
    for line in digest.bengaluru_traffic_digest:
        print("  ", line)
    print("\nWeather Data:")
    for w in digest.location_weather:
        print(f"  {w.location}: {w.temperature}, {w.conditions}, precip {w.precipitation}, wind {w.wind}")
