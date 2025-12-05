@echo off
REM ========================================
REM 🦠 Evolibrary - Development Server
REM Start FastAPI backend with auto-reload
REM ========================================

REM Set UTF-8 encoding for emoji support
chcp 65001 >nul 2>&1

echo.
echo ========================================
echo    🦠 Evolibrary Development Server
echo ========================================
echo.

REM Check if virtual environment exists
if not exist "venv\Scripts\activate.bat" (
    echo ❌ Virtual environment not found!
    echo Please run: python -m venv venv
    echo Then run: venv\Scripts\activate
    echo Then run: pip install -r backend\requirements.txt
    echo.
    pause
    exit /b 1
)

REM Activate virtual environment
echo 🔧 Activating virtual environment...
call venv\Scripts\activate.bat

REM Check if packages are installed
python -c "import fastapi" 2>nul
if errorlevel 1 (
    echo ❌ FastAPI not installed!
    echo Please run: pip install -r backend\requirements.txt
    echo.
    pause
    exit /b 1
)

echo ✅ Virtual environment activated
echo.

REM Set environment to development
set ENVIRONMENT=development
set DEBUG=true
set LOG_LEVEL=DEBUG

echo 🚀 Starting Evolibrary backend...
echo.
echo 📍 Server will be available at:
echo    - Backend API: http://localhost:8000
echo    - API Docs:    http://localhost:8000/api/docs
echo    - Health:      http://localhost:8000/api/health
echo.
echo 💡 Press CTRL+C to stop the server
echo.

REM Start the server with auto-reload
python -m uvicorn backend.app.main:app --reload --host 0.0.0.0 --port 8000 --log-level debug

REM If server exits, pause so user can see any errors
echo.
echo ========================================
echo Server stopped
echo ========================================
echo.
pause