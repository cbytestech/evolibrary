@echo off
REM Set UTF-8 encoding
chcp 65001 >nul 2>&1

cd frontend
npm run dev
