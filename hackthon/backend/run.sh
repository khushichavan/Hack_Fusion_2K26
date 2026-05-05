#!/bin/bash

echo "========================================"
echo "Urban Water Supply Conflict Resolver"
echo "Backend Setup & Run Script"
echo "========================================"
echo ""

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "Error: Python 3 is not installed"
    echo "Please install Python 3.8+ and try again"
    exit 1
fi

echo "[1/3] Creating virtual environment..."
if [ ! -d "venv" ]; then
    python3 -m venv venv
    echo "Virtual environment created"
else
    echo "Virtual environment already exists"
fi
echo ""

echo "[2/3] Installing dependencies..."
source venv/bin/activate
pip install -r requirements.txt
echo "Dependencies installed"
echo ""

echo "[3/3] Starting FastAPI server..."
echo ""
echo "Server will run at: http://127.0.0.1:8001"
echo "API Docs at: http://127.0.0.1:8001/docs"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

uvicorn app:app --reload --host 127.0.0.1 --port 8001
