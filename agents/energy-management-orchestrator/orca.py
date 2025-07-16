import json
import asyncio
import logging
from typing import AsyncGenerator, List
from agents import bescom_event_agent,accident_agent, environment_agent

from google.adk.agents import LlmAgent, BaseAgent, Runner
from google.adk.agents.invocation_context import InvocationContext
from google.adk.sessions import InMemorySessionService
from google.adk.events import Event
from google.genai import types

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def load_agent_config(config_file: str = 'agent_config.json'):
    with open(config_file, 'r') as file:
        config = json.load(file)
    # Transform the config list into a dictionary keyed by identifier.
    config_map = {}
    for agent in config.get("agents", []):
        if "BESCOM" in agent["name"]:
            config_map["bescom_event"] = agent
        elif "Accident" in agent["name"]:
            config_map["accident"] = agent
        elif "Environment" in agent["name"]:
            config_map["environment"] = agent
    return config_map



# --- Custom Energy Management Orchestrator Agent ---
class EnergyManagementOrchestratorAgent(BaseAgent):
    """
    This orchestrator concurrently invokes BESCOMEventAgent, AccidentAgent, and EnvironmentAgent.
    """
    bescom_event_agent: LlmAgent
    accident_agent: LlmAgent
    environment_agent: LlmAgent

    def __init__(self,
                 name: str,
                 bescom_event_agent: LlmAgent,
                 accident_agent: LlmAgent,
                 environment_agent: LlmAgent):
        # List sub-agents for reference
        sub_agents = [bescom_event_agent, accident_agent, environment_agent]
        super().__init__(name=name, sub_agents=sub_agents)
        self.bescom_event_agent = bescom_event_agent
        self.accident_agent = accident_agent
        self.environment_agent = environment_agent

    async def _run_async_impl(self, ctx: InvocationContext) -> AsyncGenerator[Event, None]:
        logger.info(f"[{self.name}] Starting energy management workflow.")
        # Run all three agents concurrently using asyncio.gather
        results = await asyncio.gather(
            self._run_agent(self.bescom_event_agent, ctx, details="BESCOM event details"),
            self._run_agent(self.accident_agent, ctx, details="Accident details"),
            self._run_agent(self.environment_agent, ctx, metrics="Temperature, Humidity, Pollution"),
            return_exceptions=True
        )
        # Yield events from each sub-agent sequentially
        for res in results:
            if isinstance(res, Exception):
                logger.error(f"Agent execution error: {res}")
            else:
                for event in res:
                    yield event
        logger.info(f"[{self.name}] Completed energy management workflow.")

    async def _run_agent(self, agent: LlmAgent, ctx: InvocationContext, **kwargs) -> List[Event]:
        events = []
        # The parameters in kwargs are used to format the instruction
        async for event in agent.run_async(ctx, **kwargs):
            events.append(event)
        return events

# --- Create Config, Session, and Runner ---

# Load agent_config.json (ensure it follows the structure expected)
config_map = load_agent_config('agent_config.json')
logger.info(f"Loaded agent configuration: {config_map}")

# Create the orchestrator agent instance
energy_management_agent = EnergyManagementOrchestratorAgent(
    name="EnergyManagementOrchestratorAgent",
    bescom_event_agent=bescom_event_agent,
    accident_agent=accident_agent,
    environment_agent=environment_agent,
)

INITIAL_STATE = {
    "details": "Initial energy management input",
    "metrics": "Initial environmental metrics",
}

async def setup_session_and_runner():
    session_service = InMemorySessionService()
    session = await session_service.create_session(
        app_name="energy_app",
        user_id="user_001",
        session_id="session_001",
        state=INITIAL_STATE
    )
    logger.info(f"Initial session state: {session.state}")
    runner = Runner(
        agent=energy_management_agent,
        app_name="energy_app",
        session_service=session_service
    )
    return session_service, runner

async def call_energy_management_agent_async(user_input: str):
    session_service, runner = await setup_session_and_runner()
    current_session = await session_service.get_session(
        app_name="energy_app",
        user_id="user_001",
        session_id="session_001"
    )
    if not current_session:
        logger.error("Session not found!")
        return

    # Update session with any user-specific input
    current_session.state["user_input"] = user_input
    logger.info(f"User input: {user_input}")

    # Create a dummy content message to trigger execution.
    content = types.Content(role='user', parts=[types.Part(text=f"Process input: {user_input}")])
    events = runner.run_async(user_id="user_001", session_id="session_001", new_message=content)
    
    async for event in events:
        if event.is_final_response() and event.content and event.content.parts:
            logger.info(f"Final response: {event.content.parts[0].text}")
        print(event)

# --- Run the Agent ---
if __name__ == "__main__":
    asyncio.run(call_energy_management_agent_async("Energy management alert: potential outage detected."))