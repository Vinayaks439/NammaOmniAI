# main.py  – Cloud Function for the Pothole Detection Coordinator
# ─────────────────────────────────────────────────────────────────────────────
# Trigger: Pub/Sub event carrying a JSON object encoded as a base64 string.
#
# Expected payload examples
# ────────────────────────
# • Image only:
#     { "image_url": "https://example.com/road.jpg" }
#
# • Location only:
#     { "lat": 12.9716, "lon": 77.5946 }
#
# • Image + location (preferred):
#     {
#       "image_url": "https://example.com/road.jpg",
#       "lat": 12.9716,
#       "lon": 77.5946
#     }
#
# The function passes a compact “raw_input” string to the Gemini‑powered
# pothole coordinator (`get_pothole_detection`) and republishes the validated
# JSON result to another Pub/Sub topic via `publish_messages`.

import base64
import json
import logging
from typing import Any, Dict

import google.cloud.logging
from pothole_coordinator import get_pothole_detection
from pubsub import publish_messages  # project‑local helper

PROJECT_ID = "namm-omni-dev"


def _setup_logging() -> logging.Logger:
    """Initialise Cloud Logging only once per cold start and return a logger."""
    client = google.cloud.logging.Client(project=PROJECT_ID)
    client.setup_logging()  # routes stdlib logs to Cloud Logging
    logging.basicConfig(level=logging.INFO)
    return logging.getLogger(__name__)


# Single module‑level logger (created at import‑time, reused across invocations)
logger = _setup_logging()


def runPotholeDetectionAgent(cloudevent: Any) -> tuple[str, int]:
    """
    Google Cloud Functions entry‑point triggered by Pub/Sub.

    It extracts `image_url`, `lat`, and `lon` (if available) from the event
    payload, builds a concise input string for the coordinator, calls
    `get_pothole_detection`, then publishes the structured result JSON.
    """
    # ── Decode Pub/Sub message ───────────────────────────────────────────────
    logger.info("cloud event data type: %s", type(cloudevent.data))
    logger.info("Received cloudevent data: %s", cloudevent.data)
    try:
       message = base64.b64decode(cloudevent.data["message"]["data"]).decode("utf-8")
       payload = json.loads(message)
    except (KeyError, ValueError, json.JSONDecodeError) as exc:
        logger.error("Malformed CloudEvent: %s", exc)
        return "Bad Request", 400

    logger.info("Received payload: %s", payload)

    image_url: str | None = payload.get("image_url")
    lat: float | None = payload.get("lat")
    lon: float | None = payload.get("lon")

    # ── Validate minimal input ───────────────────────────────────────────────
    if not image_url and (lat is None or lon is None):
        logger.error(
            "Need either image_url or both lat & lon; received: %s", payload
        )
        return "Bad Request", 400

    # ── Build coordinator input & human‑readable prompt ─────────────────────
    if image_url and lat is not None and lon is not None:
        raw_input = f"{image_url} {lat},{lon}"
        example_prompt = (
            f"I took this road‑surface photo ({image_url}) at {lat},{lon}. "
            "Detect potholes, rate image clarity, and validate using "
            "Street View if possible."
        )
    elif image_url:
        raw_input = image_url
        example_prompt = (
            f"Here is a road‑surface photo: {image_url}. "
            "Detect potholes and validate with Street View."
        )
    else:  # coordinates only
        raw_input = f"{lat},{lon}"
        example_prompt = (
            f"At coordinates {lat},{lon}, examine Street View around the point "
            "and assess pothole likelihood."
        )

    logger.info("Human‑readable prompt: %s", example_prompt)
    logger.info("Raw coordinator input:  %s", raw_input)

    # ── Call the orchestrator ───────────────────────────────────────────────
    try:
        detection = get_pothole_detection(example_prompt)
    except Exception as exc:  # pragma: no cover
        logger.exception("Coordinator error: %s", exc)
        return "Internal Server Error", 500

    logger.info("Pothole detection result: %s", detection)

    # ── Publish JSON result ─────────────────────────────────────────────────
    result_json: str = json.dumps(detection.model_dump(), indent=2)
    publish_messages(
        result_json,
        lambda err: logger.error("Publish error: %s", err),
    )

    return "", 200
