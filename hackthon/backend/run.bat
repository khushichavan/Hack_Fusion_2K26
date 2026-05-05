@echo off
echo ========================================
echo Urban Water Supply Conflict Resolver
echo Backend Setup & Run Script
echo ========================================
echo.

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo Error: Python is not installed or not in PATH
    echo Please install Python 3.8+ and try again
    pause
    exit /b 1
)

echo [1/3] Creating virtual environment...
if not exist venv (
    python -m venv venv
    echo Virtual environment created
) else (
    echo Virtual environment already exists
)
echo.

echo [2/3] Installing dependencies...
call venv\Scripts\activate.bat
pip install -r requirements.txt
echo Dependencies installed
echo.

echo [3/3] Starting FastAPI server...
echo.
echo Server will run at: http://127.0.0.1:8001
echo API Docs at: http://127.0.0.1:8001/docs
echo.
echo Press Ctrl+C to stop the server
echo.

uvicorn app:app --reload --host 127.0.0.1 --port 8001

pause
