# tools.py  –  AI-grade outage scraper (config-driven, with debug instrumentation)
# ────────────────────────────────────────────────────────────────────────────────

from __future__ import annotations
import os
import json
import re
import httpx
import pandas as pd
import asyncio
from pathlib import Path
from datetime import datetime
from typing import Iterable, List, Dict

from pydantic import BaseModel
from readability import Document
from playwright.async_api import async_playwright, TimeoutError as PlaywrightTimeoutError
from google import genai

# ─── Load configuration ─────────────────────────────────────────────
_CONFIG_PATH = Path(__file__).with_name("agent_config.json")
_CFG         = json.loads(_CONFIG_PATH.read_text(encoding="utf-8"))
_TOOLS       = _CFG["tools"]
_AGENT       = _CFG["agents"][0]

_RENDER_TIMEOUT    = _TOOLS.get("render_timeout_ms", 30000)
_RENDER_WAIT_UNTIL = _TOOLS.get("render_wait_until", "networkidle")

# ─── Configure GenAI client ─────────────────────────────────────
genai_client = genai.Client(
    api_key=os.getenv(_AGENT["model"]["api_key_env"], "")
)

_EMBED_QUERY     = _TOOLS["embedding_query"]
_EMBED_THRESHOLD = _TOOLS["embedding_threshold"]
_EMBED_MODEL     = _TOOLS["embedding_model"]

_EXTRACT_PROMPT  = _TOOLS["extract_prompt"]
_EXTRACT_MODEL   = _TOOLS["extract_model"]

# Precompute the embedding of our fixed outage-query once
try:
    qdoc = genai_client.models.embed_content(
        model=_EMBED_MODEL,
        contents=[_EMBED_QUERY]
    )
    _Q_EMB = qdoc.embeddings[0].values
except Exception as e:
    print(f"[debug] failed to precompute query embedding: {e}")
    _Q_EMB = None

# ─── Data model ───────────────────────────────────────────────────
class OutageInfo(BaseModel):
    location: str
    start_time: datetime
    reason: str
    source: str
    latitude: float | None = None
    longitude: float | None = None

# ─── Regexes ───────────────────────────────────────────────────
_LOC_RE  = re.compile(r"\b([A-Z][a-z]+(?: [A-Z][a-z]+)* (?:Bengaluru|Bangalore))\b")
_TIME_RE = re.compile(r"(\d{1,2}[:.]\d{2})\s*(am|pm|AM|PM)?", re.I)

# ─── Utils ────────────────────────────────────────────────────
def _cosine(a: List[float], b: List[float]) -> float:
    dot = sum(x * y for x, y in zip(a, b))
    na  = (sum(x * x for x in a)) ** 0.5
    nb  = (sum(y * y for y in b)) ** 0.5
    return dot / (na * nb + 1e-9)

async def _rendered_html(url: str) -> str:
    """Fetch JS-rendered page; fallback to httpx if timeout."""
    try:
        async with async_playwright() as p:
            browser = await p.chromium.launch()
            page    = await browser.new_page()
            await page.goto(
                url,
                wait_until=_RENDER_WAIT_UNTIL,
                timeout=_RENDER_TIMEOUT
            )
            html = await page.content()
            await browser.close()
        return html
    except PlaywrightTimeoutError:
        try:
            resp = httpx.get(url, timeout=30)
            resp.raise_for_status()
            return resp.text
        except Exception as e:
            print(f"[debug] httpx fallback failed for {url}: {e}")
            return ""

def _extract_article(html: str) -> str:
    """Clean boilerplate via Readability."""
    return Document(html).summary() or ""

def _is_relevant(text: str) -> bool:
    """
    Embed the article once, compare against the precomputed query embedding.
    Prints debug scores and falls back to keyword if embedding fails or is disabled.
    """
    if _Q_EMB is None:
        ok = _EMBED_QUERY.lower() in text.lower()
        print(f"[debug] keyword-only relevance={ok}")
        return ok

    try:
        doc_resp = genai_client.models.embed_content(
            model=_EMBED_MODEL,
            contents=[text]
        )
        emb_doc = doc_resp.embeddings[0].values
        score   = _cosine(emb_doc, _Q_EMB)
        print(f"[debug] relevance score={score:.3f}")
        return score >= _EMBED_THRESHOLD
    except Exception as e:
        ok = _EMBED_QUERY.lower() in text.lower()
        print(f"[debug] embed exception ({e}); keyword fallback relevance={ok}")
        return ok

async def _extract_with_llm(html: str, source_url: str) -> List[OutageInfo]:
    """Use Gemini to parse outage events from HTML, with robust JSON extraction."""
    print(f"[debug] calling LLM on {source_url}")
    prompt = _EXTRACT_PROMPT.replace("{html}", html)
    chat   = genai_client.chats.create(model=_EXTRACT_MODEL)
    resp   = await asyncio.to_thread(chat.send_message, prompt)
    raw    = resp.text
    print(f"[debug] LLM raw response: {raw[:300]}…")

    # 1) Try to pull out a ```json … ``` code-fence
    m = re.search(r"```json\\s*([\\s\\S]+?)\\s*```", raw)
    blob = m.group(1) if m else raw

    # 2) If it doesn’t start with '[' or '{', isolate the first [...] or {...} block
    stripped = blob.strip()
    if not (stripped.startswith("[") or stripped.startswith("{")):
        # attempt to find a JSON array
        start = blob.find("[")
        end   = blob.rfind("]")
        if 0 <= start < end:
            blob = blob[start : end + 1]
        else:
            # or a JSON object
            start = blob.find("{")
            end   = blob.rfind("}")
            if 0 <= start < end:
                blob = blob[start : end + 1]

    # 3) Finally parse
    try:
        items = json.loads(blob)
    except Exception as e:
        print(f"[debug] JSON parse failed after extraction: {e}")
        return []

    results: List[OutageInfo] = []
    for it in items:
        try:
            results.append(
                OutageInfo(
                    location=it["location"],
                    start_time=datetime.fromisoformat(it["start_time"]),
                    reason=it.get("reason", "Power outage"),
                    source=source_url,
                )
            )
        except Exception as e:
            print(f"[debug] invalid item skipped: {e}")
    return results


def _extract_bescom(html: str, url: str) -> List[OutageInfo]:
    """Parse BESCOM’s scheduled-cut tables via pandas."""
    events: List[OutageInfo] = []
    try:
        dfs = pd.read_html(html)
    except ValueError:
        return events

    for df in dfs:
        if {"Cut Date", "Cut Start Time", "Locality"}.issubset(df.columns):
            for _, row in df.iterrows():
                locs = [l.strip() for l in str(row["Locality"]).split(",") if l.strip()]
                try:
                    when = datetime.strptime(
                        f"{row['Cut Date']} {row['Cut Start Time']}",
                        "%d-%b-%Y %H:%M"
                    )
                except Exception:
                    when = datetime.now()
                for loc in locs:
                    if re.search(r"(Bengaluru|Bangalore)$", loc):
                        events.append(
                            OutageInfo(location=loc, start_time=when,
                                       reason="Scheduled power cut", source=url)
                        )
    return events

async def _geocode_stub(names: List[str]) -> List[Dict]:
    """Stub geocoder—replace with real service if desired."""
    return [{"location": n, "latitude": 12.9716, "longitude": 77.5946} for n in names]

async def scrape_outages(
    sources: Iterable[str], merge_geocode: bool = True
) -> List[OutageInfo]:
    """Main pipeline: render → filter → parse → dedupe → (geocode)."""
    all_events: List[OutageInfo] = []
    seen = set()

    for url in sources:
        html = await _rendered_html(url)

        if "bescom" in url:
            extracted = _extract_bescom(html, url)
        else:
            # Extract plain-text summary for relevance checking
            text = _extract_article(html)

            # Relevance filter
            if not _is_relevant(text):
                # regex fallback for literal keywords
                if not any(kw in text.lower() for kw in ["power cut", "load shedding"]):
                    print(f"[debug] regex fallback failed, skipping {url}")
                    continue
                else:
                    print(f"[debug] regex fallback passed for {url}")

            # Feed raw HTML into the LLM prompt for full context
            extracted = await _extract_with_llm(html, url)

        for ev in extracted:
            key = (ev.location.lower(), ev.start_time)
            if key not in seen:
                all_events.append(ev)
                seen.add(key)

    if merge_geocode and all_events:
        geo = await _geocode_stub(list({e.location for e in all_events}))
        gmap = {g["location"].lower(): g for g in geo}
        for ev in all_events:
            if (g := gmap.get(ev.location.lower())):
                ev.latitude, ev.longitude = g["latitude"], g["longitude"]

    return all_events
