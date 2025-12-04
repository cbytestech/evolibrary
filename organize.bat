@echo off
echo ========================================
echo Evolibrary Project Organization Script
echo ========================================
echo.

cd /d "%~dp0"

echo [1/7] Creating directory structure...
if not exist "docs" mkdir docs
if not exist "docs\design" mkdir docs\design
if not exist "docs\guides" mkdir docs\guides
if not exist "docs\planning" mkdir docs\planning

echo [2/7] Moving evolibrary-docker contents to root...
if exist "evolibrary-docker\backend" (
    echo    - Moving backend folder...
    xcopy /E /I /Y "evolibrary-docker\backend" "backend\" >nul 2>&1
)

if exist "evolibrary-docker\frontend" (
    echo    - Moving frontend folder...
    xcopy /E /I /Y "evolibrary-docker\frontend" "frontend\" >nul 2>&1
)

if exist "evolibrary-docker\docker" (
    echo    - Moving docker folder...
    xcopy /E /I /Y "evolibrary-docker\docker" "docker\" >nul 2>&1
)

echo    - Moving root configuration files...
if exist "evolibrary-docker\Dockerfile" copy /Y "evolibrary-docker\Dockerfile" . >nul 2>&1
if exist "evolibrary-docker\docker-compose.yml" copy /Y "evolibrary-docker\docker-compose.yml" . >nul 2>&1
if exist "evolibrary-docker\.dockerignore" copy /Y "evolibrary-docker\.dockerignore" . >nul 2>&1
if exist "evolibrary-docker\setup.sh" copy /Y "evolibrary-docker\setup.sh" . >nul 2>&1

echo    - Removing evolibrary-docker folder...
rmdir /S /Q "evolibrary-docker" 2>nul

echo [3/7] Organizing main documentation...
if exist "START_HERE.md" move /Y "START_HERE.md" "docs\" >nul 2>&1
if exist "QUICK_START.md" move /Y "QUICK_START.md" "docs\" >nul 2>&1
if exist "CHECKLIST.md" move /Y "CHECKLIST.md" "docs\" >nul 2>&1
if exist "PROJECT_STATUS.md" move /Y "PROJECT_STATUS.md" "docs\" >nul 2>&1
if exist "PROJECT_SUMMARY.md" move /Y "PROJECT_SUMMARY.md" "docs\" >nul 2>&1
if exist "PACKAGE_SUMMARY.md" move /Y "PACKAGE_SUMMARY.md" "docs\" >nul 2>&1
if exist "COMPLETE_PACKAGE_SUMMARY.md" move /Y "COMPLETE_PACKAGE_SUMMARY.md" "docs\" >nul 2>&1
if exist "FILE_INDEX.md" move /Y "FILE_INDEX.md" "docs\" >nul 2>&1
if exist "DIRECTORY_TREE.txt" move /Y "DIRECTORY_TREE.txt" "docs\" >nul 2>&1

echo [4/7] Organizing setup guides...
if exist "WINDOWS_SETUP_GUIDE.md" move /Y "WINDOWS_SETUP_GUIDE.md" "docs\guides\" >nul 2>&1
if exist "REBRANDING_GUIDE.md" move /Y "REBRANDING_GUIDE.md" "docs\guides\" >nul 2>&1

echo [5/7] Organizing design files...
if exist "evolibrary-logo-morpho.html" move /Y "evolibrary-logo-morpho.html" "docs\design\" >nul 2>&1
if exist "LoadingScreen.tsx" move /Y "LoadingScreen.tsx" "docs\design\" >nul 2>&1
if exist "LoadingScreen.css" move /Y "LoadingScreen.css" "docs\design\" >nul 2>&1
if exist "LoadingScreen-Usage.md" move /Y "LoadingScreen-Usage.md" "docs\design\" >nul 2>&1
if exist "loading-screen-guide.md" move /Y "loading-screen-guide.md" "docs\design\" >nul 2>&1
if exist "loading-screens-demo.html" move /Y "loading-screens-demo.html" "docs\design\" >nul 2>&1
if exist "logo-design-spec.md" move /Y "logo-design-spec.md" "docs\design\" >nul 2>&1
if exist "LOGO_ASSETS_GUIDE.md" move /Y "LOGO_ASSETS_GUIDE.md" "docs\design\" >nul 2>&1
if exist "LOGO_DESIGN_BRIEF.md" move /Y "LOGO_DESIGN_BRIEF.md" "docs\design\" >nul 2>&1

echo [6/7] Organizing planning documents...
if exist "evolibrary-planning-doc.md" move /Y "evolibrary-planning-doc.md" "docs\planning\" >nul 2>&1
if exist "README-EVOLIBRARY.md" move /Y "README-EVOLIBRARY.md" "docs\planning\" >nul 2>&1
if exist "README-GITHUB.md" move /Y "README-GITHUB.md" "docs\planning\" >nul 2>&1

echo [7/7] Cleaning up duplicate and unnecessary files...

rem Remove archives
if exist "evolibrary-docker.tar.gz" del /Q "evolibrary-docker.tar.gz" 2>nul
if exist "current_structure.txt" del /Q "current_structure.txt" 2>nul

rem Remove mnt folder (from package creation)
if exist "mnt" rmdir /S /Q "mnt" 2>nul

rem Remove duplicate Python files at root (they should be in backend/app/)
if exist "backend\app\config.py" (
    if exist "config.py" del /Q "config.py" 2>nul
)
if exist "backend\app\db\database.py" (
    if exist "database.py" del /Q "database.py" 2>nul
)
if exist "backend\app\db\models.py" (
    if exist "models.py" del /Q "models.py" 2>nul
)
if exist "backend\app\main.py" (
    if exist "main.py" del /Q "main.py" 2>nul
)
if exist "backend\app\__init__.py" (
    if exist "__init__.py" del /Q "__init__.py" 2>nul
)

rem Remove duplicate frontend files at root
if exist "frontend\package.json" (
    if exist "package.json" del /Q "package.json" 2>nul
)
if exist "frontend\vite.config.ts" (
    if exist "vite.config.ts" del /Q "vite.config.ts" 2>nul
)
if exist "frontend\tailwind.config.js" (
    if exist "tailwind.config.js" del /Q "tailwind.config.js" 2>nul
)

rem Remove duplicate backend requirements at root
if exist "backend\requirements.txt" (
    if exist "requirements.txt" del /Q "requirements.txt" 2>nul
)

rem Remove duplicate docker files at root
if exist "docker\entrypoint.sh" (
    if exist "entrypoint.sh" del /Q "entrypoint.sh" 2>nul
)

rem Remove duplicate docker-compose at root (keep the one from evolibrary-docker)
rem (Already handled - we kept the root one)

echo.
echo Creating final directory tree...
tree /F /A > final_structure.txt

echo.
echo ========================================
echo Organization Complete!
echo ========================================
echo.
echo Final Structure:
echo   - backend/         (Python/FastAPI code)
echo   - frontend/        (React/TypeScript code)
echo   - docker/          (Docker scripts)
echo   - docs/            (All documentation)
echo   - venv/            (Python virtual environment)
echo   - Root files       (Dockerfile, docker-compose.yml, etc.)
echo.
echo Review final_structure.txt to see the complete layout.
echo.
echo Next steps:
echo   1. Review: type final_structure.txt
echo   2. Stage:  git add .
echo   3. Commit: git commit -m "Organize project structure"
echo   4. Push:   git push
echo.
pause
