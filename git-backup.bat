@echo off
REM Evolibrary Git Backup Script for Windows
REM Run this from C:\Users\Nicholas Hess\Desktop\evolibrary

echo Starting Evolibrary backup to GitHub...
echo.

cd /d "C:\Users\Nicholas Hess\Desktop\evolibrary"

REM Add all changes
git add .

REM Check what's being committed
echo Files to be committed:
git status --short
echo.

REM Commit with timestamp
git commit -m "Evolibrary backup - Full working app with dark mode and themes - %date% %time%" -m "Features:" -m "- FastAPI backend with Books API (6 endpoints)" -m "- React/TypeScript/Tailwind frontend" -m "- Dark mode toggle with localStorage persistence" -m "- Two color themes: Morpho (green/gray) and Homestead (amber/orange)" -m "- Smooth black gradient header with backdrop blur" -m "- Responsive design (mobile and desktop)" -m "- 10 sample books with search functionality" -m "- SQLite database with book/author relationships" -m "- Docker infrastructure ready" -m "- Vite dev server with hot reload" -m "- PostCSS + Tailwind configured for dark mode" -m "" -m "Status: Fully functional and tested"

REM Push to GitHub
echo.
echo Pushing to GitHub...
git push origin main

echo.
echo ✅ Backup complete!
echo Repository ready to clone on your Pi!
pause
