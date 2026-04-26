@echo off
REM HCMUT Smart Parking System - Quick Start Script for Windows
REM This script automates the setup process

setlocal enabledelayedexpansion

echo.
echo ╔═══════════════════════════════════════════════════════════╗
echo ║   HCMUT Smart Parking Management System - Quick Setup    ║
echo ╚═══════════════════════════════════════════════════════════╝
echo.

REM Check Node.js
echo 📋 Checking prerequisites...
where node >nul 2>nul
if errorlevel 1 (
    echo ❌ Node.js is not installed. Please install Node.js v18+
    echo    Download from: https://nodejs.org/
    pause
    exit /b 1
)
for /f "tokens=*" %%i in ('node -v') do set NODE_VERSION=%%i
echo ✅ Node.js %NODE_VERSION% found

REM Check npm
where npm >nul 2>nul
if errorlevel 1 (
    echo ❌ npm is not installed
    pause
    exit /b 1
)
for /f "tokens=*" %%i in ('npm -v') do set NPM_VERSION=%%i
echo ✅ npm %NPM_VERSION% found

REM Check Docker
where docker >nul 2>nul
if errorlevel 1 (
    echo ⚠️  Docker not found - you'll need to set up PostgreSQL manually
    set DOCKER_AVAILABLE=0
) else (
    echo ✅ Docker is installed
    set DOCKER_AVAILABLE=1
)

echo.
echo 🗄️  Setting up PostgreSQL...

if %DOCKER_AVAILABLE% equ 1 (
    REM Check if container exists
    docker ps -a --format "table {{.Names}}" | findstr "smart_parking_db" >nul
    if errorlevel 1 (
        echo    Creating PostgreSQL container...
        docker run --name smart_parking_db ^
          -e POSTGRES_USER=parking_user ^
          -e POSTGRES_PASSWORD=parking_password ^
          -e POSTGRES_DB=smart_parking ^
          -p 5432:5432 ^
          -d postgres:15
        echo ✅ PostgreSQL container created and running
    ) else (
        echo ✅ Container 'smart_parking_db' already exists
        docker ps --format "table {{.Names}}" | findstr "smart_parking_db" >nul
        if errorlevel 1 (
            echo    Starting container...
            docker start smart_parking_db
        ) else (
            echo    Container is already running
        )
    )
) else (
    echo ⚠️  Please ensure PostgreSQL is running on localhost:5432
    echo    User: parking_user
    echo    Password: parking_password
    echo    Database: smart_parking
)

echo.
echo 📦 Setting up Backend...
cd backend

if not exist "node_modules" (
    echo    Installing backend dependencies...
    call npm install
    echo ✅ Backend dependencies installed
) else (
    echo ✅ Backend node_modules already exist
)

echo    Generating Prisma client...
call npm run prisma:generate

echo    Running database migrations...
call npm run prisma:migrate

echo ✅ Backend setup complete

echo.
echo 🎨 Setting up Frontend...
cd ..\frontend

if not exist "node_modules" (
    echo    Installing frontend dependencies...
    call npm install
    echo ✅ Frontend dependencies installed
) else (
    echo ✅ Frontend node_modules already exist
)

echo ✅ Frontend setup complete

echo.
echo ═══════════════════════════════════════════════════════════
echo ✅ Setup Complete!
echo ═══════════════════════════════════════════════════════════
echo.
echo 🚀 To start the development servers, open 3 terminals:
echo.
echo    Terminal 1 (Backend^):
echo    ^> cd backend ^&^& npm run dev
echo.
echo    Terminal 2 (Frontend^):
echo    ^> cd frontend ^&^& npm run dev
echo.
echo    Terminal 3 (Database GUI - Optional^):
echo    ^> cd backend ^&^& npm run prisma:studio
echo.
echo 🌐 Access the application:
echo    Frontend: http://localhost:5173/
echo    Backend:  http://localhost:5000/
echo    Database: http://localhost:5555/ (if running prisma:studio^)
echo.
echo 📚 For detailed information, see RUN_PROJECT.md
echo.
pause
