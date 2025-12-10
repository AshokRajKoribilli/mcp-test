#!/bin/bash

# Start Frontend Script
# This script starts the Next.js development server

echo "🚀 Starting Flux Image Generator Frontend..."
echo "📍 Frontend will be available at: http://localhost:3000"
echo ""

cd frontend

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "⚠️  Installing dependencies..."
    npm install
fi

# Start the development server
npm run dev
