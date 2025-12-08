@echo off
REM ========================================
REM 🦠 Evolibrary - Frontend Setup
REM Copy frontend files and start dev server
REM ========================================

echo.
echo ========================================
echo    🦠 Evolibrary Frontend Setup
echo ========================================
echo.

cd frontend

echo 📦 Installing dependencies...
call npm install

echo.
echo.
echo 🚀 Starting development server...
echo.
echo 📍 Frontend will be available at:
echo    http://localhost:3000
echo.
echo 💡 Press CTRL+C to stop
echo.

call npm run dev

pause
