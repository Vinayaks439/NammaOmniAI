"""
agent.py – BESCOMOutageAgent (prompt fixed in agent_config.json).
"""

from __future__ import annotations

import asyncio
import json
import logging
from datetime import datetime
from pathlib import Path
from typing import AsyncGenerator, Iterable, List

from pydantic import BaseModel, ValidationError, ConfigDict
from google.adk.agents.base_agent import BaseAgent
from google.adk.agents.invocation_context import InvocationContext
from google.adk.events import Event
from google.genai.types import Content, Part

from tools import gt

# ── configuration -----------------------------------------------------------
_DEFAULT_PROMPT = json.loads(Path(__file__).with_name("agent_config.json").read_text())[
    "default_prompt"
]

logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)


class OutageSummary(BaseModel):
    location: str
    start_time: datetime
    end_time: datetime | None
    reason: str


def _coerce_location(loc) -> str:
    return ", ".join(loc) if isinstance(loc, list) else str(loc)


def _validate(items: Iterable[dict]) -> List[OutageSummary]:
    good: List[OutageSummary] = []
    for it in items:
        it["location"] = _coerce_location(it.get("location"))
        try:
            good.append(OutageSummary(**it))
        except ValidationError as e:
            logger.warning("Skip invalid item %s – %s", it, e)
    return good


class BESCOMOutageAgent(BaseAgent):
    model_config = ConfigDict(extra="allow")

    def __init__(self) -> None:
        super().__init__(name="BESCOMOutageAgent")
        self.prompt = _DEFAULT_PROMPT

    async def _run_async_impl(
        self, ctx: InvocationContext
    ) -> AsyncGenerator[Event, None]:
        raw = await asyncio.to_thread(gt.ask_json, self.prompt)
        records = _validate(raw)
        payload = json.dumps([r.model_dump() for r in records], indent=2, default=str)
        yield Event(
            author=self.name,
            content=Content(parts=[Part(text=payload)]),
            partial=False,
        )


def make_bescom_agent() -> BESCOMOutageAgent:
    return BESCOMOutageAgent()
