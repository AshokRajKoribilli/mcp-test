# run_agent.py
from pathlib import Path
from dotenv import load_dotenv
import os
from google.adk.agents import LlmAgent
from google.adk.tools.mcp_tool.mcp_toolset import McpToolset
from google.adk.tools.mcp_tool.mcp_session_manager import StdioConnectionParams
from mcp import StdioServerParameters
from google.adk.models.google_llm import Gemini
from google.adk.sessions import InMemorySessionService
from google.adk.runners import Runner
from google.genai import types


env_path = Path(__file__).parent / ".env"
if env_path.exists():
    load_dotenv(dotenv_path=env_path)

# Read the Google API key from environment
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
if not GOOGLE_API_KEY:
    print("Warning: GOOGLE_API_KEY is not set. Add it to .env in the project root if needed.")

mcp_flux_server = McpToolset(
    connection_params=StdioConnectionParams(
        server_params=StdioServerParameters(
            command="python",       # or "python3" depending on OS
            args=["flux_server.py"],  # same folder, so no path needed
        ),
        timeout=120,
    ),
    tool_filter=["generate_flux_image"],
)

agent = LlmAgent(
    model=Gemini(model="gemini-2.5-flash-lite"),
    name="flux_image_agent",
    instruction="You can generate images using the Flux MCP tool.",
    tools=[mcp_flux_server],
)

# Initialize session service and runner
session_service = InMemorySessionService()
runner = Runner(session_service=session_service, app_name="flux_image_agent", agent=agent)


def main():
    import asyncio
    
    user_id = "default_user"
    session_id = "default_session"
    
    # Create the session before using it (async operation)
    asyncio.run(session_service.create_session(user_id=user_id, session_id=session_id, app_name="flux_image_agent"))
    
    print("Flux Image Agent ready! Type 'exit' or 'quit' to stop.")
    
    while True:
        try:
            user_input = input("\nYou: ")
            if user_input.lower() in ["exit", "quit"]:
                print("Goodbye!")
                break
            
            # Create a Content object from the user input
            new_message = types.Content(
                role="user",
                parts=[types.Part(text=user_input)]
            )
            
            # Run the agent using the runner - it returns a generator of events
            events = runner.run(user_id=user_id, session_id=session_id, new_message=new_message)
            
            # Process events and print the response
            print("\nAssistant: ", end="", flush=True)
            response_text = ""
            for event in events:
                # Print agent responses as they come
                if hasattr(event, 'content') and event.content:
                    for part in event.content.parts:
                        if hasattr(part, 'text') and part.text:
                            response_text += part.text
                            print(part.text, end="", flush=True)
            print()  # New line after response
            
        except KeyboardInterrupt:
            print("\n\nGoodbye!")
            break
        except Exception as e:
            print(f"\nError: {e}")
            continue


if __name__ == "__main__":
    main()
