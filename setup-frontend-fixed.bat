@echo off
REM ========================================
REM Evolibrary - Frontend Setup
REM Copy frontend files and start dev server
REM ========================================

REM Set UTF-8 encoding
chcp 65001 >nul 2>&1

echo.
echo ========================================
echo    Evolibrary Frontend Setup
echo ========================================
echo.

cd frontend

echo Installing dependencies...
call npm install

echo.
echo Dependencies installed!
echo.
echo Starting development server...
echo.
echo Frontend will be available at:
echo    http://localhost:3000
echo.
echo Press CTRL+C to stop
echo.

call npm run dev

pause
