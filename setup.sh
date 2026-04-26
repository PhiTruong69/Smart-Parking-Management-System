#!/bin/bash
# HCMUT Smart Parking System - Quick Start Script
# This script automates the setup process

set -e

echo "╔═══════════════════════════════════════════════════════════╗"
echo "║   HCMUT Smart Parking Management System - Quick Setup    ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo ""

# Check Node.js
echo "📋 Checking prerequisites..."
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js v18+"
    exit 1
fi
NODE_VERSION=$(node -v)
echo "✅ Node.js $NODE_VERSION found"

# Check npm
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed"
    exit 1
fi
NPM_VERSION=$(npm -v)
echo "✅ npm $NPM_VERSION found"

# Check Docker
if command -v docker &> /dev/null; then
    echo "✅ Docker is installed"
    DOCKER_AVAILABLE=1
else
    echo "⚠️  Docker not found - you'll need to set up PostgreSQL manually"
    DOCKER_AVAILABLE=0
fi

echo ""
echo "🗄️  Setting up PostgreSQL..."

if [ $DOCKER_AVAILABLE -eq 1 ]; then
    # Check if container already exists
    if docker ps -a --format '{{.Names}}' | grep -q 'smart_parking_db'; then
        echo "✅ Container 'smart_parking_db' already exists"
        if ! docker ps --format '{{.Names}}' | grep -q 'smart_parking_db'; then
            echo "   Starting container..."
            docker start smart_parking_db
        else
            echo "   Container is already running"
        fi
    else
        echo "   Creating PostgreSQL container..."
        docker run --name smart_parking_db \
          -e POSTGRES_USER=parking_user \
          -e POSTGRES_PASSWORD=parking_password \
          -e POSTGRES_DB=smart_parking \
          -p 5432:5432 \
          -d postgres:15
        echo "✅ PostgreSQL container created and running"
    fi
else
    echo "⚠️  Please ensure PostgreSQL is running on localhost:5432"
    echo "   User: parking_user"
    echo "   Password: parking_password"
    echo "   Database: smart_parking"
fi

echo ""
echo "📦 Setting up Backend..."
cd backend

if [ ! -d "node_modules" ]; then
    echo "   Installing backend dependencies..."
    npm install
    echo "✅ Backend dependencies installed"
else
    echo "✅ Backend node_modules already exist"
fi

echo "   Generating Prisma client..."
npm run prisma:generate

echo "   Running database migrations..."
npm run prisma:migrate

echo "✅ Backend setup complete"

echo ""
echo "🎨 Setting up Frontend..."
cd ../frontend

if [ ! -d "node_modules" ]; then
    echo "   Installing frontend dependencies..."
    npm install
    echo "✅ Frontend dependencies installed"
else
    echo "✅ Frontend node_modules already exist"
fi

echo "✅ Frontend setup complete"

echo ""
echo "═══════════════════════════════════════════════════════════"
echo "✅ Setup Complete!"
echo "═══════════════════════════════════════════════════════════"
echo ""
echo "🚀 To start the development servers, open 3 terminals:"
echo ""
echo "   Terminal 1 (Backend):"
echo "   $ cd backend && npm run dev"
echo ""
echo "   Terminal 2 (Frontend):"
echo "   $ cd frontend && npm run dev"
echo ""
echo "   Terminal 3 (Database GUI - Optional):"
echo "   $ cd backend && npm run prisma:studio"
echo ""
echo "🌐 Access the application:"
echo "   Frontend: http://localhost:5173/"
echo "   Backend:  http://localhost:5000/"
echo "   Database: http://localhost:5555/ (if running prisma:studio)"
echo ""
echo "📚 For detailed information, see RUN_PROJECT.md"
echo ""
