"""
agent.py ─ OutageScraperAgent
─────────────────────────────
Orchestrates the grounding-only tool and emits Pydantic-validated JSON.
"""

import json
import logging
import asyncio
from typing import AsyncGenerator
from datetime import datetime

from pydantic import BaseModel
from google.adk.agents.base_agent import BaseAgent
from google.adk.agents.invocation_context import InvocationContext
from google.adk.events import Event
# import LLM content types for the Event payload :contentReference[oaicite:1]{index=1}
from google.genai.types import Content, Part

from tools import fetch_outage_summaries

# ─── Pydantic Model ─────────────────────────────────────────────────
class OutageSummary(BaseModel):
    location: str
    start_time: datetime
    end_time: datetime | None
    reason: str

# ─── Agent Definition ───────────────────────────────────────────────
class OutageScraperAgent(BaseAgent):
    def __init__(self) -> None:
        super().__init__(name="OutageScraperAgent")
        logging.getLogger().setLevel(logging.INFO)

    async def _run_async_impl(
        self, ctx: InvocationContext
    ) -> AsyncGenerator[Event, None]:
        # Fetch raw list of outages from our grounding-only tool
        raw_items = await asyncio.to_thread(fetch_outage_summaries)

        summaries: list[OutageSummary] = []
        for item in raw_items:
            try:
                summaries.append(OutageSummary(**item))
            except Exception as e:
                logging.error("Validation error on item %r: %s", item, e)

        # Serialize to JSON
        payload = [s.dict() for s in summaries]
        payload_json = json.dumps(payload, default=str, ensure_ascii=False, indent=2)

        # Emit as a single Event using google.genai.types.Content & Part
        yield Event(
            author=self.name,
            content=Content(parts=[Part(text=payload_json)]),
            partial=False,
        )

# Singleton export for orca.py
outage_scraper_agent = OutageScraperAgent()
