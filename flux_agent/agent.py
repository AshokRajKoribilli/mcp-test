# flux_agent/agent.py
from pathlib import Path
from dotenv import load_dotenv
import os
from google.adk.agents import LlmAgent
from google.adk.tools.mcp_tool.mcp_toolset import McpToolset
from google.adk.tools.mcp_tool.mcp_session_manager import StdioConnectionParams
from mcp import StdioServerParameters
from google.adk.models.google_llm import Gemini


# Load environment variables
env_path = Path(__file__).parent.parent / ".env"
if env_path.exists():
    load_dotenv(dotenv_path=env_path)

# Configure the MCP Flux server
mcp_flux_server = McpToolset(
    connection_params=StdioConnectionParams(
        server_params=StdioServerParameters(
            command="python",
            args=[str(Path(__file__).parent.parent / "flux_server.py")],
        ),
        timeout=120,
    ),
    tool_filter=["generate_flux_image", "list_generated_images", "delete_image", "get_image_info"],
)

# Create the root agent - this is what ADK web looks for
root_agent = LlmAgent(
    model=Gemini(model="gemini-2.5-flash-lite"),
    name="flux_image_agent",
    instruction="""You are a helpful AI assistant that can generate images using the Flux model.
    
When a user asks you to create or generate an image, use the generate_flux_image tool with:
- A detailed description of what they want
- Appropriate width and height (default 512x512, but you can adjust based on their needs)
- Number of inference steps (default 4 for quick generation, increase for better quality)

Be creative and helpful in interpreting their requests into detailed prompts for the image generator.""",
    tools=[mcp_flux_server],
)
