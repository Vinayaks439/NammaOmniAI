"""
agent.py ─ OutageScraperAgent
─────────────────────────────
1. (Optional) LLM builds Google-News search queries
2. Google Custom Search JSON API returns fresh URLs
3. AI-grade scraper (tools.py) extracts structured outage events
4. Gemini geocodes every location
5. Agent yields ONE final Event with a Pydantic FinalOutput model
6. Dumps the final Pydantic FinalOutput JSON to `outages.json`
7. Dumps a summary of all LLM responses to `llm_summary.json`
"""

from __future__ import annotations

# stdlib
import asyncio, json, os, re, logging
from pathlib import Path
from typing import AsyncGenerator, List, Dict, Any

# 3rd-party
import httpx
from pydantic import BaseModel
from google.adk.agents.base_agent import BaseAgent
from google.adk.agents.invocation_context import InvocationContext
from google.adk.events import Event
from google.genai.types import Content, Part
import google.generativeai as genai

# local
from tools import scrape_outages, OutageInfo

logger = logging.getLogger(__name__)

# ─── LLM Response Collector ─────────────────────────────────────────
LLM_RESPONSES: List[Dict[str, Any]] = []

# ─── Config ──────────────────────────────────────────────────────────
_CFG = json.load(open("agent_config.json", encoding="utf-8"))["agents"][0]
STATIC_SOURCES  = _CFG["settings"]["sources"]
DYNAMIC_ENABLED = _CFG["settings"].get("dynamic_sources", False)
GEO_ENABLED     = _CFG["settings"].get("geocode", True)

# Google Search API credentials
GOOGLE_KEY = os.getenv(_CFG["settings"]["google_search_api_key_env"], "")
GOOGLE_CX  = os.getenv(_CFG["settings"]["google_cse_id_env"], "")

# Gemini model configuration
genai.configure(api_key=os.getenv(_CFG["model"]["api_key_env"], ""))
gemini = genai.GenerativeModel(_CFG["model"]["id"])

# Prompt templates
GEOCODE_PROMPT = _CFG["prompts"]["geocode"]

# ─── Pydantic models ─────────────────────────────────────────────────
class LLMSummary(BaseModel):
    total_llm_calls: int
    responses: List[Dict[str, Any]]

class FinalOutput(BaseModel):
    outages: List[OutageInfo]
    llm_summary: LLMSummary

# ─── Discovery helpers ───────────────────────────────────────────────
async def _make_queries(n: int = 8) -> list[str]:
    prompt = (
        f"Suggest {n} concise Google-News queries to discover power outages in Bengaluru today. One per line."
    )
    # use gemini instance, not module
    resp = await asyncio.to_thread(gemini.generate_content, prompt, generation_config={"temperature": 0.3})
    LLM_RESPONSES.append({"type": "query", "prompt": prompt, "response": resp.text})
    return [q.strip("-• ").strip() for q in resp.text.splitlines() if q.strip()]

async def _search_urls(query: str) -> list[str]:
    if not (GOOGLE_KEY and GOOGLE_CX):
        logger.warning("Missing Google Search credentials; skipping discovery.")
        return []
    params = {"key": GOOGLE_KEY, "cx": GOOGLE_CX, "q": query, "num": 10, "gl": "in", "hl": "en", "dateRestrict": "d1"}
    async with httpx.AsyncClient(timeout=20) as client:
        resp = await client.get("https://customsearch.googleapis.com/customsearch/v1", params=params)
    if resp.status_code != 200:
        logger.warning("Search API error %s for '%s'", resp.status_code, query)
        return []
    return [item["link"] for item in resp.json().get("items", [])]

async def _discover_sources() -> list[str]:
    if not DYNAMIC_ENABLED:
        return STATIC_SOURCES
    urls: list[str] = []
    for q in await _make_queries():
        urls.extend(await _search_urls(q))
    seen, uniq = set(), []
    for u in urls + STATIC_SOURCES:
        try:
            host = httpx.URL(u).host
        except Exception:
            continue
        if host not in seen:
            seen.add(host)
            uniq.append(u)
    return uniq[:4]

# ─── Geocode helper ──────────────────────────────────────────────────
async def _geocode(outages: List[OutageInfo]) -> None:
    locs = "\n".join({o.location for o in outages})
    prompt = GEOCODE_PROMPT.replace("{locations}", locs)
    resp = await asyncio.to_thread(gemini.generate_content, prompt)
    LLM_RESPONSES.append({"type": "geocode", "prompt": prompt, "response": resp.text})
    match = re.search(r"```json\s*([\s\S]+?)\s*```", resp.text)
    blob = match.group(1) if match else resp.text
    try:
        data = json.loads(blob)
        for d in data:
            for o in outages:
                if o.location == d.get("location"):
                    o.latitude, o.longitude = d.get("latitude"), d.get("longitude")
    except Exception as e:
        logger.warning("Geocode parse failed: %s", e)


class OutageScraperAgent(BaseAgent):
    def __init__(self) -> None:
        super().__init__(name="OutageScraperAgent")

    async def _run_async_impl(self, ctx: InvocationContext) -> AsyncGenerator[Event, None]:
        sources = await _discover_sources()
        logger.info("Scraping %d sources…", len(sources))
        outages = await scrape_outages(sources)
        logger.info("Extracted %d events.", len(outages))
        if GEO_ENABLED and outages:
            await _geocode(outages)

        summary = LLMSummary(total_llm_calls=len(LLM_RESPONSES), responses=LLM_RESPONSES)
        final_model = FinalOutput(outages=outages, llm_summary=summary)

        Path("outages.json").write_text(
            json.dumps(final_model.model_dump(), indent=2, ensure_ascii=False),
            encoding="utf-8",
        )
        Path("llm_summary.json").write_text(
            json.dumps(summary.model_dump(), indent=2, ensure_ascii=False),
            encoding="utf-8",
        )
        logger.info("Written outages.json and llm_summary.json")

        yield Event(
            author=self.name,
            content=Content(parts=[Part(text=json.dumps(final_model.model_dump(), indent=2, ensure_ascii=False))]),
            partial=False,
        )
        logger.info("Scraper run complete.")


outage_scraper_agent = OutageScraperAgent()

