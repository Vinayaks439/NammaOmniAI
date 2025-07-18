"""
tools.py – Gemini + GoogleSearch grounding tool for BESCOM power cuts.
Loads prompt, model_id, and temperature from agent_config.json.
Adds debug logging and strips Markdown fences before parsing JSON.
"""

import json
import logging
import re

from google import genai
from google.genai.types import GenerateContentConfig, GoogleSearch

# ─── Load configuration ───────────────────────────────────────────────
_cfg = json.load(open("agent_config.json"))["agents"][0]
_tool_cfg = _cfg["tools"]["outage_summary"]

# ─── Gemini client setup ─────────────────────────────────────────────
# Auto-picks GEMINI_API_KEY or GOOGLE_API_KEY from env
_client = genai.Client()

# ─── Logger setup ────────────────────────────────────────────────────
logger = logging.getLogger(__name__)
logger.setLevel(logging.DEBUG)

def fetch_outage_summaries() -> list[dict]:
    """
    Calls Gemini-2.5-Pro with GoogleSearch grounding to retrieve
    recent BESCOM power cut events in Bengaluru as JSON.
    Strips any Markdown code fences before parsing.
    Returns a list of dicts.
    """
    resp = _client.models.generate_content(
        model=_tool_cfg["model_id"],
        contents=_tool_cfg["prompt"],
        config=GenerateContentConfig(
            temperature=_tool_cfg["temperature"],
            tools=[GoogleSearch()],
        ),
    )

    raw_text = resp.text
    logger.debug("Gemini grounding raw text:\n%s", raw_text)

    # Strip Markdown fences if present
    match = re.search(r"```(?:json)?\s*([\s\S]+?)\s*```", raw_text)
    if match:
        json_text = match.group(1)
        logger.debug("Stripped fenced JSON:\n%s", json_text)
    else:
        json_text = raw_text

    try:
        return json.loads(json_text)
    except json.JSONDecodeError as e:
        logger.error("Failed to parse JSON from sanitized text: %s\n%s", e, json_text)
        return []
