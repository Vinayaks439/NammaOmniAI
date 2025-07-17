"""
orca.py – CLI demo runner for OutageScraperAgent
───────────────────────────────────────────────
Streams the final JSON payload from the agent to stdout.
"""

from __future__ import annotations
import asyncio
import logging
import uuid

from google.adk.sessions import InMemorySessionService
from google.adk.agents.invocation_context import InvocationContext

from agent import outage_scraper_agent  # your singleton agent

logging.basicConfig(level=logging.INFO)

async def main() -> None:
    sess_service = InMemorySessionService()
    # Now supply app_name and user_id as keyword-only args
    session = await sess_service.create_session(
        app_name="outage_app",
        user_id="cli"
    )

    ctx = InvocationContext(
        session_service=sess_service,
        agent=outage_scraper_agent,
        session=session,
        invocation_id=str(uuid.uuid4()),
    )

    async for ev in outage_scraper_agent.run_async(ctx):
        if ev.content and ev.content.parts:
            print(ev.content.parts[0].text)

if __name__ == "__main__":
    asyncio.run(main())
