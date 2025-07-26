# main_events.py ─ Cloud Function entry point for cultural events (Bengaluru‑only)

import base64
import json
import logging
import google.cloud.logging
from event_coordinator import get_cultural_events
from pubsub import publish_messages
from datetime import datetime, timedelta, timezone

_today = datetime.now(timezone.utc).astimezone().date()
_next_week = _today + timedelta(days=7)

PROJECT_ID = "namm-omni-dev"


def runCulturalEventAgent(cloudevent):
    """
    Pub/Sub‑triggered Cloud Function that fetches a Bengaluru cultural‑events
    digest and republishes it.

    Expected Pub/Sub payload (data base64‑encoded):
        {
          "areas": ["Indiranagar", "MG Road"]   # optional
        }
    """
    # ── Logging setup ─────────────────────────────────────────────────────
    client = google.cloud.logging.Client()
    client.setup_logging()
    logging.basicConfig(level=logging.INFO)
    logger = logging.getLogger(__name__)

    logger.info("Cloud event payload type: %s", type(cloudevent.data))
    logger.info("Raw cloud event: %s", cloudevent.data)

    # ── Decode & parse the Pub/Sub message ────────────────────────────────
    message = base64.b64decode(cloudevent.data["message"]["data"]).decode("utf-8")
    payload = json.loads(message)

    areas = payload.get("areas", [])

    # ── Build the Gemini prompt (city hard‑coded) ─────────────────────────
    area_clause = f"in {', '.join(areas)}" if areas else "across Bengaluru"
    prompt = (
        f"I'm in Bengaluru. Give me a concise bullet‑point digest of upcoming "
        f"cultural events {area_clause} from {_today} to {_next_week}."
    )
    logger.info("Sending prompt to Gemini: %s", prompt)

    # ── Run the coordinator & get the digest ──────────────────────────────
    digest = get_cultural_events(prompt)
    logger.info("Cultural events digest:\n%s", digest)

    # ── Serialize & re‑publish the result ─────────────────────────────────
    try:
        response_json = json.dumps(digest.model_dump(), indent=2)
    except (TypeError, ValueError) as e:
        logger.error("Serialization error: %s", e)
        publish_messages(
            digest.model_dump(),
            lambda err: logger.error("Error publishing message: %s", err),
        )
        return "", 200

    publish_messages(
        response_json,
        lambda err: logger.error("Error publishing message: %s", err),
    )
    return "", 200
