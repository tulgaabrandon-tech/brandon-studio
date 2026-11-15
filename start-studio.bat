@echo off
title BrandOn Studio
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
  echo Node.js is not installed yet. Opening the download page.
  echo Install the LTS version, then double-click this file again.
  start https://nodejs.org/en/download
  pause
  exit /b
)
if not exist node_modules (
  echo First start: installing, this takes a minute...
  call npm install
)
echo Starting BrandOn Studio. Keep this window open while you work.
call npm run dev -- --open
pause
