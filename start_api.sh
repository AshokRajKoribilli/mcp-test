#!/bin/bash

# Start API Server Script
# This script starts the FastAPI server for the Flux Image Generator

echo "🚀 Starting Flux Image Generator API Server..."
echo "📍 Server will be available at: http://localhost:8000"
echo "📚 API Documentation: http://localhost:8000/docs"
echo ""

# Check if required packages are installed
python3 -c "import fastapi, uvicorn" 2>/dev/null
if [ $? -ne 0 ]; then
    echo "⚠️  Installing required packages..."
    pip install -q fastapi uvicorn python-multipart
fi

# Start the server
python3 api_server.py
