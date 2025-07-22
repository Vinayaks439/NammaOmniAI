"""
orca.py – CLI launcher for BESCOMOutageAgent.
"""

import json
import logging
from energy_coordinator import get_energy_digest
from pubsub import publish_messages

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

if __name__ == "__main__":
    example_prompt = (
        "Provide power-outage information for the next 24 hours in "
        "[Koramangala, HSR Layout, Indiranagar] including official BESCOM notices "
        "and reliable local news reports."
    )
    digest = get_energy_digest(example_prompt)
    payload = json.dumps(digest.model_dump(), indent=2)
    logger.info("Energy digest generated:\n%s", payload)

    # Publish to Pub/Sub (comment out if running locally without GCP creds)
    try:
        publish_messages(payload, lambda e: logger.error("Pub/Sub error: %s", e))
    except Exception as e:
        logger.error("Publish skipped – %s", e)
