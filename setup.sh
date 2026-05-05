#!/bin/bash
# HCMUT Smart Parking System - Quick Start Script
# This script sets up the project with JSON-based data storage

set -e

echo "╔═══════════════════════════════════════════════════════════╗"
echo "║   HCMUT Smart Parking Management System - Quick Setup    ║"
echo "║              JSON-Based Data Storage                     ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo ""

# Check Node.js
echo "[1/2] Checking prerequisites..."
if ! command -v node &> /dev/null; then
    echo "[!] Node.js is not installed. Please install Node.js v18+"
    exit 1
fi
NODE_VERSION=$(node -v)
echo "[OK] Node.js $NODE_VERSION found"

# Check npm
if ! command -v npm &> /dev/null; then
    echo "[!] npm is not installed"
    exit 1
fi
NPM_VERSION=$(npm -v)
echo "[OK] npm $NPM_VERSION found"

echo ""
echo "[2/2] Installing dependencies..."

echo ""
echo "Setting up Backend..."
cd backend

if [ ! -d "node_modules" ]; then
    echo "   Installing backend dependencies..."
    npm install
    if [ $? -ne 0 ]; then
        echo "[!] Failed to install backend dependencies"
        exit 1
    fi
    echo "[OK] Backend dependencies installed"
else
    echo "[OK] Backend dependencies already exist"
fi

echo "[OK] Backend setup complete"

echo ""
echo "Setting up Frontend..."
cd ../frontend

if [ ! -d "node_modules" ]; then
    echo "   Installing frontend dependencies..."
    npm install
    if [ $? -ne 0 ]; then
        echo "[!] Failed to install frontend dependencies"
        exit 1
    fi
    echo "[OK] Frontend dependencies installed"
else
    echo "[OK] Frontend dependencies already exist"
fi

echo "[OK] Frontend setup complete"

echo ""
echo "═══════════════════════════════════════════════════════════"
echo "[SUCCESS] Setup Complete!"
echo "═══════════════════════════════════════════════════════════"
echo ""
echo "Next steps: Run the project with"
echo ""
echo "   npm run start-dev"
echo ""
echo "   Or start services separately:"
echo ""
echo "   Terminal 1 - Backend:"
echo "   $ cd backend && npm run dev"
echo ""
echo "   Terminal 2 - Frontend:"
echo "   $ cd frontend && npm run dev"
echo ""
echo "Access the application at http://localhost:5173/"
echo "Backend API at http://localhost:5000/"
echo ""
echo "For more information, see QUICKSTART.md and RUN_PROJECT.md"
echo ""
