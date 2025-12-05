@echo off
REM ========================================
REM 🦠 Evolibrary - Production Server
REM Start FastAPI backend (no auto-reload)
REM ========================================

REM Set UTF-8 encoding for emoji support
chcp 65001 >nul 2>&1

echo.
echo ========================================
echo    🦠 Evolibrary Production Server
echo ========================================
echo.

REM Activate virtual environment
if not exist "venv\Scripts\activate.bat" (
    echo ❌ Virtual environment not found!
    pause
    exit /b 1
)

call venv\Scripts\activate.bat

REM Set environment to production
set ENVIRONMENT=production
set DEBUG=false
set LOG_LEVEL=INFO

echo 🚀 Starting Evolibrary in production mode...
echo.
echo 📍 Server will be available at:
echo    - Backend API: http://localhost:8787
echo    - API Docs:    http://localhost:8787/api/docs
echo.

REM Start the server without reload
python -m uvicorn backend.app.main:app --host 0.0.0.0 --port 8787 --workers 4

echo.
echo Server stopped
pause