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
├── backend/
│   ├── data/
│   │   ├── db.json              # JSON data storage
│   │   ├── store.js             # JSON storage interface
│   │   └── seed.js              # Initial data
│   ├── routes/
│   │   └── auth.js              # Authentication routes
│   ├── jobs/
│   │   └── dataSyncJob.js       # Data synchronization
│   ├── server.js                # Express server
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   ├── components/
│   │   └── styles/
│   ├── vite.config.ts
│   └── package.json
├── setup.bat                    # Windows setup script
├── setup.sh                     # macOS/Linux setup script
├── docker-compose.yml           # Docker setup (optional)
└── README.md
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
npm run dev

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



### Step 3: Verify Frontend Setup

```bash
# Check Node version
node --version

# Check if build works
npm run dev

# Check for any warnings
```

---

## 🚀 Running the Project

### Quick Start (All in One)

Open **2 terminal windows**:

**Terminal 1- Backend Server:**
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
║                                          ║
║   📅 Sync Jobs: INITIALIZED              ║
╚═══════════════════════════════════════════╝
```

**Terminal 2- Frontend Dev Server:**
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

### Manual Testing

1. Open http://localhost:5173 in browser
2. Try the "Get Temporary Access" button (no SSO needed)
3. Check console for API responses
4. Login with test credentials (if database seeded)

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
- [ ] Backend server started (`npm run dev`)
- [ ] Frontend server started (`npm run dev`)
- [ ] Can access http://localhost:5173/
- [ ] Can access http://localhost:5000/api/health

---

