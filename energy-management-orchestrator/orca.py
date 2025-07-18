"""
orca.py – CLI demo runner for OutageScraperAgent
───────────────────────────────────────────────
Streams the final JSON payload from the agent to stdout.
"""

import asyncio
import logging
import uuid

from google.adk.sessions import InMemorySessionService
from google.adk.agents.invocation_context import InvocationContext

from agent import outage_scraper_agent

async def main():
    logging.basicConfig(level=logging.INFO)

    sess_service = InMemorySessionService()
    # await creation so session is a proper object, not a coroutine
    session = await sess_service.create_session(
        session_id="session-1",
        app_name="energy-management-orchestrator",
        user_id="cli-user",
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
