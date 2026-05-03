# HCMUT Smart Parking Management System - Complete Setup Guide

A comprehensive smart parking system for Ho Chi Minh City University of Technology (HCMUT) with HCMUT_SSO authentication, real-time IoT monitoring, and integrated billing through BKPay.

## 📋 Table of Contents

- [Prerequisites](#prerequisites)
- [Project Structure](#project-structure)
- [Backend Setup](#backend-setup)
- [Frontend Setup](#frontend-setup)
- [Database Setup](#database-setup)
- [Running the Project](#running-the-project)
- [Testing the System](#testing-the-system)
- [Troubleshooting](#troubleshooting)

---

## 📦 Prerequisites

Before you begin, ensure you have the following installed:

### Required
- **Node.js** 18.x or higher ([Download](https://nodejs.org/))
- **npm** 9.x or higher (comes with Node.js)
- **Git** ([Download](https://git-scm.com/))
- **PostgreSQL** 12+ ([Download](https://www.postgresql.org/)) OR **Docker** ([Download](https://www.docker.com/))

### Verify Installation
```bash
node --version        # Should be v18+
npm --version         # Should be 9+
git --version         # Should be 2.x+
```

---

## 📁 Project Structure

```
Smart_Parking_Management_System/
├── backend/                          # Node.js/Express server
│   ├── routes/
│   │   └── auth.js                  # HCMUT SSO authentication
│   ├── jobs/
│   │   └── dataSyncJob.js           # HCMUT_DATACORE sync
│   ├── scripts/
│   │   └── seedData.js              # Database seeding
│   ├── prisma/
│   │   ├── schema.prisma            # Database schema
│   │   └── migrations/              # Database migrations
│   ├── data/
│   │   ├── store.js                 # JSON storage (legacy)
│   │   └── db.json                  # JSON database (legacy)
│   ├── .env                         # Environment variables
│   ├── .env.example                 # Template
│   ├── package.json
│   ├── server.js                    # Main server entry
│   ├── SETUP.md                     # Backend setup guide
│   └── README.md
│
├── frontend/                         # React + Vite + Tailwind CSS
│   ├── src/
│   │   ├── app/
│   │   │   ├── App.tsx              # Main app component
│   │   │   └── components/          # React components
│   │   ├── styles/                  # CSS files
│   │   ├── main.tsx                 # Entry point
│   │   └── vite-env.d.ts
│   ├── vite.config.ts               # Vite configuration
│   ├── package.json
│   ├── tailwind.config.js
│   ├── postcss.config.mjs
│   ├── index.html
│   └── README.md
│
└── README.md                         # This file
```

---

## 🔧 Backend Setup

### Step 1: Navigate to Backend Directory

```bash
cd backend
```

### Step 2: Install Dependencies

```bash
npm install
```

This installs all required packages including:
- **Express** - Web framework
- **Prisma** - ORM for database management
- **JWT** - Token authentication
- **Axios** - HTTP client for HCMUT integration
- **Dotenv** - Environment variable management

### Step 3: Configure Environment Variables

The `.env` file has been created with default values. For development:

```bash
# .env (Already created)
PORT=5000
NODE_ENV=development
DATABASE_URL="postgresql://parking_user:parking_password@localhost:5432/smart_parking"
JWT_SECRET=your_super_secret_jwt_key_change_in_production_12345678
```

**Important for Production:**
- Change `JWT_SECRET` to a strong random string
- Update HCMUT_SSO credentials from IT Center
- Set `NODE_ENV=production`
- Update database credentials

### Step 4: Setup PostgreSQL Database

#### Option A: Using Docker (Recommended)

```bash
# Create and run PostgreSQL container
docker run --name smart_parking_db \
  -e POSTGRES_USER=parking_user \
  -e POSTGRES_PASSWORD=parking_password \
  -e POSTGRES_DB=smart_parking \
  -p 5432:5432 \
  -d postgres:15

# Verify container is running
docker ps | grep smart_parking_db
```

#### Option B: Using Local PostgreSQL

```bash
# Connect to PostgreSQL
psql -U postgres

# In psql prompt:
CREATE USER parking_user WITH PASSWORD 'parking_password';
CREATE DATABASE smart_parking OWNER parking_user;
GRANT ALL PRIVILEGES ON DATABASE smart_parking TO parking_user;
\q
```

#### Option C: Verify Database Connection

```bash
# Test connection
psql -U parking_user -d smart_parking -h localhost -c "SELECT version();"
```

### Step 5: Initialize Database with Prisma

```bash
# Generate Prisma Client
npm run prisma:generate

# Run migrations
npm run prisma:migrate

# Seed test data (optional)
npm run reset:data
```

**What this does:**
- Creates all tables from schema
- Sets up relationships
- Populates test data (5 zones, 6 users, sample transactions)

### Step 6: Verify Backend Setup

```bash
# Check if all dependencies are installed correctly
npm list

# Look for any missing packages (red warnings)
```

---

## 🎨 Frontend Setup

### Step 1: Navigate to Frontend Directory

```bash
cd frontend
```

### Step 2: Install Dependencies

```bash
npm install
```

This installs:
- **React 18** - UI framework
- **Vite** - Fast build tool
- **Tailwind CSS** - Styling
- **Radix UI** - Component library
- **Lucide React** - Icons

### Step 3: Configure API Endpoint

Edit or create `.env.local`:

```bash
# frontend/.env.local
VITE_API_BASE_URL=http://localhost:5000/api
```

Or update it in the React code at `src/app/App.tsx`:

```typescript
const API_BASE = 'http://localhost:5000/api';
```

### Step 4: Verify Frontend Setup

```bash
# Check Node version
node --version

# Check if build works
npm run build

# Check for any warnings
```

---

## 🚀 Running the Project

### Quick Start (All in One)

Open **3 terminal windows**:

**Terminal 1 - PostgreSQL (if using Docker):**
```bash
docker ps  # Verify container is running
# Or start it:
docker start smart_parking_db
```

**Terminal 2 - Backend Server:**
```bash
cd backend
npm run dev
```

Expected output:
```
📅 Sync schedules initialized
   - HCMUT_DATACORE sync: Every 6 hours
   - Token cleanup: Every 1 hour

╔═══════════════════════════════════════════╗
║   SPMS Backend Running at http://localhost:5000  ║
║   🔐 HCMUT SSO Integration: ENABLED      ║
║   📊 Database: Prisma + PostgreSQL        ║
║   📅 Sync Jobs: INITIALIZED              ║
╚═══════════════════════════════════════════╝
```

**Terminal 3 - Frontend Dev Server:**
```bash
cd frontend
npm run dev
```

Expected output:
```
  VITE v4.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  press h to show help
```

### Access the Application

- **Frontend**: http://localhost:5173/
- **Backend API**: http://localhost:5000/api
- **Prisma Studio** (GUI Database): Run `npm run prisma:studio` in backend

---

## 🔑 Backend API Endpoints

### Authentication

#### 1. Login via HCMUT SSO
```bash
POST /api/auth/sso-callback
Content-Type: application/json

{
  "code": "authorization_code_from_hcmut"
}
```

**Response:**
```json
{
  "accessToken": "jwt_token_here",
  "refreshToken": "refresh_token_here",
  "user": {
    "id": "user-id",
    "name": "Nguyễn Văn A",
    "email": "a.nguyen@hcmut.edu.vn",
    "role": "STUDENT"
  }
}
```

#### 2. Get Current User Info
```bash
GET /api/auth/me
Authorization: Bearer <accessToken>
```

#### 3. Guest Access (Temporary Ticket)
```bash
POST /api/auth/guest-access
Content-Type: application/json

{
  "visitorName": "John Doe",
  "gate": "Main Gate",
  "plateNumber": "51A-12345"
}
```

**Response:**
```json
{
  "ticketNo": "TEMP-1714147200000-abc123",
  "expiresAt": "2026-04-27T10:00:00.000Z",
  "message": "Temporary access granted"
}
```

#### 4. Refresh Token
```bash
POST /api/auth/refresh-token
Content-Type: application/json

{
  "refreshToken": "refresh_token_here"
}
```

#### 5. Logout
```bash
POST /api/auth/logout
Authorization: Bearer <accessToken>
```

### Parking Operations

#### Get Parking Zones
```bash
GET /api/parking/zones
```

#### Record Entry
```bash
POST /api/parking/sessions/entry
Content-Type: application/json

{
  "userId": "user-id",
  "zoneId": "A",
  "gate": "Gate A1",
  "vehicleId": "XYZ123",
  "method": "SSO"
}
```

#### Record Exit & Calculate Fee
```bash
POST /api/parking/sessions/:id/exit
Content-Type: application/json

{
  "fee": 10000
}
```

#### Get Dashboard Summary
```bash
GET /api/dashboard/summary
```

---

## 🧪 Testing the System

### Using cURL

**Test Backend Health:**
```bash
curl http://localhost:5000/api/health
```

**Test Parking Zones:**
```bash
curl http://localhost:5000/api/parking/zones
```

**Test Guest Access:**
```bash
curl -X POST http://localhost:5000/api/auth/guest-access \
  -H "Content-Type: application/json" \
  -d '{
    "visitorName": "Test Visitor",
    "gate": "Main",
    "plateNumber": "51A-TEST"
  }'
```

### Using Postman

1. Import the API collection from backend/SETUP.md
2. Set environment variable: `{{BASE_URL}}=http://localhost:5000`
3. Run requests in order

### Manual Testing

1. Open http://localhost:5173 in browser
2. Try the "Get Temporary Access" button (no SSO needed)
3. Check console for API responses
4. Login with test credentials (if database seeded)

---

## 📊 Database Management

### Prisma Studio (GUI)
```bash
cd backend
npm run prisma:studio
```

Opens GUI at http://localhost:5555

### View Database Directly
```bash
# Connect to database
psql -U parking_user -d smart_parking

# List tables
\dt

# View users
SELECT * FROM "User";

# Exit
\q
```

### Reset Database (⚠️ Deletes all data)
```bash
cd backend
npm run reset:data
```

### Run Custom Sync
```bash
cd backend
npm run sync:hcmut
```

---

## 🔄 Data Synchronization

The system automatically syncs from HCMUT_DATACORE every 6 hours.

**Manual trigger:**
```bash
cd backend
npm run sync:hcmut
```

**View sync logs:**
1. Open Prisma Studio: `npm run prisma:studio`
2. Go to "SSOSyncLog" table
3. Check sync history and errors

---

## 🛑 Stopping the Services

### Stop Backend
```bash
# In backend terminal
Press Ctrl+C
```

### Stop Frontend
```bash
# In frontend terminal
Press Ctrl+C
```

### Stop PostgreSQL Container
```bash
docker stop smart_parking_db
```

---

## 🐛 Troubleshooting

### Backend Issues

#### ❌ "Cannot find module 'jsonwebtoken'"
```bash
# Solution: Reinstall dependencies
cd backend
rm -rf node_modules package-lock.json
npm install
```

#### ❌ "Can't reach database server at localhost:5432"
```bash
# Solution 1: Start PostgreSQL container
docker start smart_parking_db

# Solution 2: Verify connection
psql -U parking_user -d smart_parking -h localhost
```

#### ❌ "Prisma migration error"
```bash
# Solution: Reset and re-run migrations
cd backend
npm run prisma:generate
npm run prisma:migrate
```

#### ❌ "Port 5000 already in use"
```bash
# Find process using port 5000
lsof -i :5000  # macOS/Linux
netstat -ano | findstr :5000  # Windows

# Kill process
kill -9 <PID>  # macOS/Linux
taskkill /PID <PID> /F  # Windows
```

### Frontend Issues

#### ❌ "API calls failing (CORS error)"
**Solution:** Backend CORS is enabled. Check:
1. Backend is running on http://localhost:5000
2. API_BASE in App.tsx is correct
3. Browser console for exact error

#### ❌ "Port 5173 already in use"
```bash
# Use different port
npm run dev -- --port 5174
```

#### ❌ "Blank page or 404"
1. Check browser console for errors
2. Verify Vite dev server is running
3. Hard refresh (Ctrl+Shift+R)

### Database Issues

#### ❌ "PostgreSQL connection refused"
```bash
# Check if PostgreSQL is running
docker ps | grep postgres

# Or if local installation:
pg_isready -h localhost -p 5432
```

#### ❌ "Password authentication failed"
```bash
# Verify credentials in .env
DATABASE_URL="postgresql://parking_user:parking_password@localhost:5432/smart_parking"

# Reset PostgreSQL password (Docker)
docker exec smart_parking_db psql -U postgres \
  -c "ALTER USER parking_user PASSWORD 'parking_password';"
```

---

## 📚 Additional Resources

### Backend Documentation
- See `backend/SETUP.md` for detailed backend setup
- See `backend/package.json` for all scripts
- See `backend/prisma/schema.prisma` for database schema

### Frontend Documentation
- See `frontend/README.md` for frontend-specific info
- See `frontend/vite.config.ts` for Vite configuration

### HCMUT Integration
- Contact HCMUT IT Center for SSO credentials
- Documentation: https://datacore.hcmut.edu.vn/docs
- Support: it@hcmut.edu.vn

---

## 🔐 Security Notes

### Development
- Current secrets are for development only
- Change all secrets before production deployment
- Never commit `.env` file to version control

### Production
- Use strong JWT_SECRET (40+ characters)
- Enable HTTPS for all connections
- Restrict database access to application server
- Use environment-specific .env files
- Enable rate limiting on auth endpoints
- Setup monitoring and logging

---

## 📝 Quick Commands Reference

```bash
# Backend
cd backend
npm install              # Install dependencies
npm run dev              # Start dev server
npm run start            # Start production server
npm run prisma:migrate   # Run database migrations
npm run prisma:generate  # Generate Prisma client
npm run prisma:studio    # Open database GUI
npm run reset:data       # Reset database with seed data
npm run sync:hcmut       # Manual data sync from HCMUT

# Frontend
cd frontend
npm install              # Install dependencies
npm run dev              # Start dev server
npm run build            # Build for production
npm run preview          # Preview production build
```

---

## ✅ Checklist for First Run

- [ ] Node.js v18+ installed
- [ ] PostgreSQL running (docker or local)
- [ ] Backend dependencies installed (`npm install`)
- [ ] Frontend dependencies installed (`npm install`)
- [ ] Database migrations run (`npm run prisma:migrate`)
- [ ] Backend server started (`npm run dev`)
- [ ] Frontend server started (`npm run dev`)
- [ ] Can access http://localhost:5173/
- [ ] Can access http://localhost:5000/api/health

---

## 🆘 Getting Help

If you encounter issues:

1. **Check logs** - Look at terminal output for error messages
2. **Read error messages carefully** - They often suggest solutions
3. **Check prerequisites** - Ensure Node.js, PostgreSQL are installed
4. **Review .env file** - Verify all variables are set
5. **Check ports** - Ensure 5000 and 5173 are available
6. **Consult troubleshooting** - See above section

---

## 📞 Support Contacts

- **HCMUT IT Center**: it@hcmut.edu.vn
- **Project Issues**: [GitHub Issues](link-to-repo)
- **Database**: https://datacore.hcmut.edu.vn/docs

---

**Last Updated**: April 26, 2026
**Version**: 1.0.0
