# Flux Image Generator MCP Agent

A powerful AI agent that generates images using the Flux model through the Model Context Protocol (MCP). This project integrates Google's ADK (Agent Development Kit) with a custom MCP server to provide image generation capabilities via a conversational interface.

## 🌟 Overview

This project demonstrates how to build an AI agent that can:
- Generate images using the Flux Schnell model
- Manage generated images (list, delete, get info)
- Interact with users through a conversational interface
- Leverage MCP (Model Context Protocol) for tool integration

## 🏗️ Architecture

The project consists of three main components:

1. **MCP Server** (`flux_server.py`) - Exposes image generation tools via MCP
2. **Agent Definition** (`flux_agent/agent.py`) - Defines the AI agent with MCP toolset
3. **Runner** (`run_agents.py`) - Interactive CLI to chat with the agent

```
┌─────────────────┐
│   User Input    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  run_agents.py  │  ◄── Interactive CLI
│   (Runner)      │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   LlmAgent      │  ◄── Google ADK Agent
│  (Gemini 2.5)   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  MCP Toolset    │  ◄── MCP Client
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ flux_server.py  │  ◄── MCP Server
│  (Flux Tools)   │
└─────────────────┘
```

## 📁 Project Structure

```
mcp-test/
├── .env                    # Environment variables (GOOGLE_API_KEY)
├── requirements.txt        # Python dependencies
├── flux_server.py         # MCP server with Flux image generation tools
├── run_agents.py          # Interactive CLI runner
├── inspect_agent.py       # Utility to inspect LlmAgent attributes
├── flux_agent/
│   ├── agent.py           # Agent definition (root_agent)
│   └── .env               # Agent-specific environment variables
└── images/                # Generated images storage
```

## 🔧 Components

### 1. MCP Server (`flux_server.py`)

The MCP server provides four tools:

- **`generate_flux_image`** - Generate images using Flux model
  - Parameters: prompt, width, height, seed, randomize_seed, num_inference_steps
  - Returns: File path of saved image
  
- **`list_generated_images`** - List all generated images
  - Returns: List of image file paths
  
- **`delete_image`** - Delete a specific image
  - Parameters: filename
  - Returns: Confirmation message
  
- **`get_image_info`** - Get image metadata
  - Parameters: filename
  - Returns: Dictionary with width, height, format, mode, size

### 2. Agent Definition (`flux_agent/agent.py`)

Defines the `root_agent` using:
- **Model**: Gemini 2.5 Flash Lite
- **Tools**: MCP Toolset connected to flux_server.py
- **Instruction**: Guides the agent to interpret user requests and generate images

### 3. Runner (`run_agents.py`)

Interactive CLI that:
- Initializes the agent and session service
- Processes user input in a loop
- Streams agent responses in real-time
- Handles session management

## 🚀 Setup Instructions

### Prerequisites

- Python 3.8 or higher
- Google API Key (for Gemini model)

### Installation

1. **Clone or navigate to the project directory**:
   ```bash
   cd /Users/ashokrajkoribilli/Projects/mcp-test
   ```

2. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

3. **Set up environment variables**:
   
   Create a `.env` file in the project root with your Google API key:
   ```bash
   echo "GOOGLE_API_KEY=your_api_key_here" > .env
   ```
   
   > ⚠️ **Security Note**: The current `.env` file contains an exposed API key. Replace it with your own key and never commit API keys to version control.

## 📖 Usage

### Running the Interactive Agent

```bash
python run_agents.py
```

### Example Interactions

**Example 1: Generate an image**
```
You: Generate an image of a sunset over mountains

Assistant: I've generated an image of a sunset over mountains. The image has been saved to: ./images/flux_20251204_113045.png
```

**Example 2: List generated images**
```
You: Show me all the images I've generated

Assistant: Here are all the images you've generated:
- ./images/flux_20251204_113045.png
- ./images/flux_20251203_091523.png
```

**Example 3: Custom dimensions**
```
You: Create a wide landscape image of a futuristic city, 1024x512
Assistant: I'll create a wide landscape image of a futuristic city for you with dimensions 1024x512.

[Agent uses generate_flux_image with width=1024, height=512]

Image saved to: ./images/flux_20251204_113102.png
```

### Exiting the Agent

Type `exit` or `quit` to stop the interactive session, or press `Ctrl+C`.

## 🔍 How It Works

### MCP Communication Flow

1. **User Input**: User types a request in the CLI
2. **Agent Processing**: LlmAgent (Gemini) processes the request
3. **Tool Selection**: Agent decides to use MCP tools
4. **MCP Server Call**: McpToolset communicates with flux_server.py via stdio
5. **Image Generation**: Flux server generates image using Gradio Client
6. **Response**: File path is returned to agent, then to user

### Key Technologies

- **Google ADK**: Agent Development Kit for building AI agents
- **MCP (Model Context Protocol)**: Protocol for tool integration
- **Gemini 2.5 Flash Lite**: Google's LLM for agent intelligence
- **Flux Schnell**: Fast image generation model
- **Gradio Client**: Interface to Flux model API

## 📦 Dependencies

The project uses the following main dependencies (from `requirements.txt`):

- `google-adk` - Google Agent Development Kit
- `modelcontextprotocol` - MCP implementation
- `gradio_client` - Client for Gradio-based models
- `Pillow` - Image processing library
- `anyio` - Async I/O support
- `python-dotenv` - Environment variable management

## 🛠️ Troubleshooting

### Common Issues

**1. "AttributeError: 'LlmAgent' object has no attribute 'run'"**
- **Solution**: Use `Runner` class instead of calling agent directly
- The correct pattern is shown in `run_agents.py`

**2. "GOOGLE_API_KEY is not set"**
- **Solution**: Create a `.env` file with your Google API key
- Get your API key from: https://aistudio.google.com/app/apikey

**3. "Connection timeout to MCP server"**
- **Solution**: Increase timeout in `StdioConnectionParams` (default: 120s)
- Check that `flux_server.py` is in the correct path

**4. "Module not found" errors**
- **Solution**: Ensure all dependencies are installed:
  ```bash
  pip install -r requirements.txt
  ```

**5. Image generation is slow**
- **Solution**: Reduce `num_inference_steps` (default is 4 for speed)
- Lower values = faster generation, higher values = better quality

## 🔐 Security Notes

- **Never commit `.env` files** with API keys to version control
- Add `.env` to your `.gitignore` file
- The current `.env` contains an exposed API key - replace it immediately
- Use environment-specific `.env` files for different deployments

## 📝 Additional Files

### `inspect_agent.py`

Utility script to inspect the `LlmAgent` class attributes:
```bash
python inspect_agent.py
```

This helps understand available methods and properties of the agent.

## 🚀 Advanced Usage

### Running MCP Server Standalone

You can run the MCP server independently for testing:

```bash
python flux_server.py
```

The server will start in stdio mode and wait for MCP protocol messages.

### Customizing the Agent

Edit `flux_agent/agent.py` to:
- Change the model (e.g., to `gemini-2.0-pro`)
- Modify agent instructions
- Add/remove tools from the toolset
- Adjust tool filters

### Adding More Tools

To add more tools to the MCP server:

1. Define a new function in `flux_server.py`
2. Decorate it with `@mcp.tool()`
3. Add the tool name to `tool_filter` in `flux_agent/agent.py`

## 📚 Learn More

- [Google ADK Documentation](https://github.com/google/adk)
- [Model Context Protocol](https://modelcontextprotocol.io/)
- [Flux Model](https://huggingface.co/black-forest-labs/FLUX.1-schnell)
- [Gemini API](https://ai.google.dev/)

## 📄 License

This project is for educational and demonstration purposes.

## 🤝 Contributing

Feel free to fork this project and adapt it for your own use cases!

---

**Created with Google ADK and MCP** 🚀

Assistant: I've generated an image of a sunset over mountains. The image has been saved to: ./images/flux_20251204_113045.png
```

**Example 2: List generated images**
```
You: Show me all the images I've generated
Assistant: Here are all the images you've generated:
- ./images/flux_20251204_113045.png
- ./images/flux_20251203_091523.png
```

**Example 3: Custom dimensions**
```
You: Create a wide landscape image of a futuristic city, 1024x512
Assistant: I'll create a wide landscape image of a futuristic city for you with dimensions 1024x512.

Image saved to: ./images/flux_20251204_113102.png
```

### Exiting the Agent

Type `exit` or `quit` to stop the interactive session, or press `Ctrl+C`.

## 🔍 How It Works

### MCP Communication Flow

1. **User Input**: User types a request in the CLI
2. **Agent Processing**: LlmAgent (Gemini) processes the request
3. **Tool Selection**: Agent decides to use MCP tools
4. **MCP Server Call**: McpToolset communicates with flux_server.py via stdio
5. **Image Generation**: Flux server generates image using Gradio Client
6. **Response**: File path is returned to agent, then to user

### Key Technologies

- **Google ADK**: Agent Development Kit for building AI agents
- **MCP (Model Context Protocol)**: Protocol for tool integration
- **Gemini 2.5 Flash Lite**: Google's LLM for agent intelligence
- **Flux Schnell**: Fast image generation model
- **Gradio Client**: Interface to Flux model API

## 📦 Dependencies

The project uses the following main dependencies (from `requirements.txt`):

- `google-adk` - Google Agent Development Kit
- `modelcontextprotocol` - MCP implementation
- `gradio_client` - Client for Gradio-based models
- `Pillow` - Image processing library
- `anyio` - Async I/O support
- `python-dotenv` - Environment variable management

## 🛠️ Troubleshooting

### Common Issues

**1. "AttributeError: 'LlmAgent' object has no attribute 'run'"**
- **Solution**: Use `Runner` class instead of calling agent directly
- The correct pattern is shown in `run_agents.py`

**2. "GOOGLE_API_KEY is not set"**
- **Solution**: Create a `.env` file with your Google API key
- Get your API key from: https://aistudio.google.com/app/apikey

**3. "Connection timeout to MCP server"**
- **Solution**: Increase timeout in `StdioConnectionParams` (default: 120s)
- Check that `flux_server.py` is in the correct path

**4. "Module not found" errors**
- **Solution**: Ensure all dependencies are installed:
  ```bash
  pip install -r requirements.txt
  ```

**5. Image generation is slow**
- **Solution**: Reduce `num_inference_steps` (default is 4 for speed)
- Lower values = faster generation, higher values = better quality

## 🔐 Security Notes

- **Never commit `.env` files** with API keys to version control
- Add `.env` to your `.gitignore` file
- The current `.env` contains an exposed API key - replace it immediately
- Use environment-specific `.env` files for different deployments

## 📝 Additional Files

### `inspect_agent.py`

Utility script to inspect the `LlmAgent` class attributes:
```bash
python inspect_agent.py
```

This helps understand available methods and properties of the agent.

## 🚀 Advanced Usage

### Running MCP Server Standalone

You can run the MCP server independently for testing:

```bash
python flux_server.py
```

The server will start in stdio mode and wait for MCP protocol messages.

### Customizing the Agent

Edit `flux_agent/agent.py` to:
- Change the model (e.g., to `gemini-2.0-pro`)
- Modify agent instructions
- Add/remove tools from the toolset
- Adjust tool filters

### Adding More Tools

To add more tools to the MCP server:

1. Define a new function in `flux_server.py`
2. Decorate it with `@mcp.tool()`
3. Add the tool name to `tool_filter` in `flux_agent/agent.py`

## 📚 Learn More

- [Google ADK Documentation](https://github.com/google/adk)
- [Model Context Protocol](https://modelcontextprotocol.io/)
- [Flux Model](https://huggingface.co/black-forest-labs/FLUX.1-schnell)
- [Gemini API](https://ai.google.dev/)

## 📄 License

This project is for educational and demonstration purposes.

## 🤝 Contributing

Feel free to fork this project and adapt it for your own use cases!

---

**Created with Google ADK and MCP** 🚀
