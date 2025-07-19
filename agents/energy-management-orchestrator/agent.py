"""
agent.py – BESCOMOutageAgent (prompt fixed in agent_config.json).
`location` is guaranteed to be List[str] with one element per locality.
"""

from __future__ import annotations

import asyncio, json, logging, re
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
_DEFAULT_PROMPT = json.loads(
    Path(__file__).with_name("agent_config.json").read_text()
)["default_prompt"]

logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)


# ── pydantic model ----------------------------------------------------------
class OutageSummary(BaseModel):
    location: List[str]
    start_time: datetime
    end_time: datetime | None
    reason: str


# ── helpers -----------------------------------------------------------------
_SPLIT_RE = re.compile(r",|\band\b|\b&\b", flags=re.IGNORECASE)


def _normalize_locations(raw_loc) -> List[str]:
    """
    Accept str or list; return list[str] split on commas/and/&.
    """
    if isinstance(raw_loc, list):
        if len(raw_loc) == 1:
            raw_loc = raw_loc[0]
        else:
            tokens = []
            for elem in raw_loc:
                tokens.extend(_SPLIT_RE.split(elem))
            return [tok.strip() for tok in tokens if tok.strip()]

    tokens = _SPLIT_RE.split(str(raw_loc))
    return [tok.strip() for tok in tokens if tok.strip()]


def _validate(items: Iterable[dict]) -> List[OutageSummary]:
    out: List[OutageSummary] = []
    for it in items:
        it["location"] = _normalize_locations(it.get("location"))
        try:
            out.append(OutageSummary(**it))
        except ValidationError as e:
            logger.warning("Skip invalid item %s – %s", it, e)
    return out


# ── agent -------------------------------------------------------------------
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
        payload = json.dumps(
            [r.model_dump() for r in records], indent=2, default=str
        )
        yield Event(
            author=self.name,
            content=Content(parts=[Part(text=payload)]),
            partial=False,
        )


# ── factory -----------------------------------------------------------------
def make_bescom_agent() -> BESCOMOutageAgent:
    return BESCOMOutageAgent()
