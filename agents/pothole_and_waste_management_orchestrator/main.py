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
from pothole_coordinator import get_pothole_event
from pubsub import publish_messages  # project‑local helper

PROJECT_ID = "namm-omni-dev"


def runPotholeDetectionAgent(cloudevent: Any):  # Cloud Functions Gen 2 entry‑point
    """Handle a Pub/Sub push, run the coordinator, publish the JSON result."""
    # ── Cloud Logging hook (one‑time per cold start) ───────────────────────
    client = google.cloud.logging.Client(project=PROJECT_ID)
    client.setup_logging()
    logging.basicConfig(level=logging.INFO)
    logger = logging.getLogger(__name__)

    # ── Decode Pub/Sub message ────────────────────────────────────────────
    try:
        msg_b64: str = cloudevent.data["message"]["data"]
        payload: Dict[str, Any] = json.loads(base64.b64decode(msg_b64).decode("utf-8"))
    except (KeyError, ValueError, json.JSONDecodeError) as exc:
        logger.error("Malformed CloudEvent: %s", exc)
        return "", 400

    logger.info("Received payload: %s", payload)

    image_url: str | None = payload.get("image_url")
    lat: float | None = payload.get("lat")
    lon: float | None = payload.get("lon")

    # ── Basic validation ──────────────────────────────────────────────────
    if not image_url and (lat is None or lon is None):
        logger.error("Need either image_url or both lat & lon; got: %s", payload)
        return "", 400

    # ── Build human‑readable and raw prompts (for logging + coordinator) ─
    if image_url and lat is not None and lon is not None:
        raw_input = f"{image_url} {lat},{lon}"
        prompt = (
            f"I took this road‑surface photo ({image_url}) at {lat},{lon}. "
            "Detect potholes, rate image clarity, and validate using Street View."
        )
    elif image_url:
        raw_input = image_url
        prompt = (
            f"Here is a road‑surface photo: {image_url}. "
            "Detect potholes and validate with Street View."
        )
    else:  # coordinates only
        raw_input = f"{lat},{lon}"
        prompt = (
            f"At coordinates {lat},{lon}, examine Street View around the point "
            "and assess pothole likelihood."
        )

    logger.info("Prompt to Gemini: %s", prompt)

    # ── Call coordinator ─────────────────────────────────────────────────
    try:
        result = get_pothole_event(raw_input)
    except Exception as exc:  # pragma: no cover
        logger.exception("Coordinator error: %s", exc)
        return "", 500

    logger.info("Pothole event: %s", result)

    # ── Publish the JSON response ────────────────────────────────────────
    try:
        response_json = json.dumps(result.model_dump(), indent=2)
    except (TypeError, ValueError) as err:  # should not happen but be safe
        logger.error("JSON serialisation error: %s", err)
        publish_messages(str(result), lambda e: logger.error("Publish error: %s", e))
        return "", 200

    publish_messages(response_json, lambda e: logger.error("Publish error: %s", e))
    return "", 200
