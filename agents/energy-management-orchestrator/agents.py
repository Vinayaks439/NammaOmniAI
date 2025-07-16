# --- Define LLM Agents for Energy Management ---
from google.adk.agents import LlmAgent
from orca import load_agent_config  # adjust the import as needed based on your project structure

# Load the entire configuration from agent_config.json
config_map = load_agent_config('agent_config.json')

# Extract individual agent configurations
bescom_config = config_map.get("bescom_event")
accident_config = config_map.get("accident")
environment_config = config_map.get("environment")

# Create LLM agents using attributes from configuration
bescom_event_agent = LlmAgent(
    name=bescom_config["name"],
    model=bescom_config["model"],
    instruction=bescom_config["instruction"],
    input_schema=bescom_config.get("input_schema"),
    output_key=bescom_config["output_key"],
)

accident_agent = LlmAgent(
    name=accident_config["name"],
    model=accident_config["model"],
    instruction=accident_config["instruction"],
    input_schema=accident_config.get("input_schema"),
    output_key=accident_config["output_key"],
)

environment_agent = LlmAgent(
    name=environment_config["name"],
    model=environment_config["model"],
    instruction=environment_config["instruction"],
    input_schema=environment_config.get("input_schema"),
    output_key=environment_config["output_key"],
)