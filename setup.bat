@echo off
REM HCMUT Smart Parking System - Quick Start Script for Windows
REM This script sets up the project with JSON-based data storage

setlocal enabledelayedexpansion

echo.
echo ╔═══════════════════════════════════════════════════════════╗
echo ║   HCMUT Smart Parking Management System - Quick Setup    ║
echo ║              JSON-Based Data Storage                     ║
echo ╚═══════════════════════════════════════════════════════════╝
echo.

REM Check Node.js
echo [1/2] Checking prerequisites...
where node >nul 2>nul
if errorlevel 1 (
    echo [!] Node.js is not installed. Please install Node.js v18+
    echo    Download from: https://nodejs.org/
    pause
    exit /b 1
)
for /f "tokens=*" %%i in ('node -v') do set NODE_VERSION=%%i
echo [OK] Node.js %NODE_VERSION% found

REM Check npm
where npm >nul 2>nul
if errorlevel 1 (
    echo [!] npm is not installed
    pause
    exit /b 1
)
for /f "tokens=*" %%i in ('npm -v') do set NPM_VERSION=%%i
echo [OK] npm %NPM_VERSION% found

echo.
echo [2/2] Installing dependencies...

REM Backend setup
echo.
echo Setting up Backend...
cd backend

if not exist "node_modules" (
    echo    Installing backend dependencies...
    call npm install
    if errorlevel 1 (
        echo [!] Failed to install backend dependencies
        pause
        exit /b 1
    )
    echo [OK] Backend dependencies installed
) else (
    echo [OK] Backend dependencies already exist
)

echo [OK] Backend setup complete

REM Frontend setup
echo.
echo Setting up Frontend...
cd ..\frontend

if not exist "node_modules" (
    echo    Installing frontend dependencies...
    call npm install
    if errorlevel 1 (
        echo [!] Failed to install frontend dependencies
        pause
        exit /b 1
    )
    echo [OK] Frontend dependencies installed
) else (
    echo [OK] Frontend dependencies already exist
)

echo [OK] Frontend setup complete

echo.
echo ═══════════════════════════════════════════════════════════
echo [SUCCESS] Setup Complete!
echo ═══════════════════════════════════════════════════════════
echo.
echo Next steps: Run the project with
echo.
echo   Windows Command Prompt:
echo   ^> npm run start-dev
echo.
echo   Or start services separately:
echo.
echo   Terminal 1 - Backend:
echo   ^> cd backend ^&^& npm run dev
echo.
echo   Terminal 2 - Frontend:
echo   ^> cd frontend ^&^& npm run dev
echo.
echo Access the application at http://localhost:5173/
echo Backend API at http://localhost:5000/
echo.
echo For more information, see QUICKSTART.md and RUN_PROJECT.md
echo.
pause
