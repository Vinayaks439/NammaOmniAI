"""
orca.py – CLI launcher for BESCOMOutageAgent.
"""

import asyncio
import logging
import uuid

from google.adk.sessions import InMemorySessionService
from google.adk.agents.invocation_context import InvocationContext

from agent import make_bescom_agent


async def main() -> None:
    logging.basicConfig(level=logging.INFO)

    agent = make_bescom_agent()

    sess_service = InMemorySessionService()
    session = await sess_service.create_session(
        session_id="session-1",
        app_name="outage-cli",
        user_id="cli",
    )

    ctx = InvocationContext(
        session_service=sess_service,
        agent=agent,
        session=session,
        invocation_id=str(uuid.uuid4()),
    )

    async for ev in agent.run_async(ctx):
        if ev.content and ev.content.parts:
            print(ev.content.parts[0].text)


if __name__ == "__main__":
    asyncio.run(main())
