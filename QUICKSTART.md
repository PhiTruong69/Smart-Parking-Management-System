# ⚡ Quick Start Guide - HCMUT Smart Parking System

## 🚀 Fastest Way to Get Started (5 Minutes)

### Prerequisites
- Node.js 18+ ([Download](https://nodejs.org/))
- Docker & Docker Compose ([Download](https://www.docker.com/)) - OR manual PostgreSQL setup
- Git ([Download](https://git-scm.com/))

### Option 1: Using Docker Compose (RECOMMENDED)

```bash
# Clone repository (if not already cloned)
git clone <repo-url>
cd Smart_Parking_Management_System

# Start everything with one command
docker-compose up -d

# Wait for services to start (~30 seconds)
docker-compose logs -f

# Stop everything
docker-compose down
```

**Access:**
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000
- Database: http://localhost:5432 (postgres)

### Option 2: Manual Setup (Detailed Steps)

#### Step 1: Start PostgreSQL

**Windows with Docker:**
```bash
docker run --name smart_parking_db -e POSTGRES_USER=parking_user -e POSTGRES_PASSWORD=parking_password -e POSTGRES_DB=smart_parking -p 5432:5432 -d postgres:15
```

**macOS/Linux with Docker:**
```bash
docker run --name smart_parking_db \
  -e POSTGRES_USER=parking_user \
  -e POSTGRES_PASSWORD=parking_password \
  -e POSTGRES_DB=smart_parking \
  -p 5432:5432 -d postgres:15
```

**Or use local PostgreSQL:**
```sql
CREATE USER parking_user WITH PASSWORD 'parking_password';
CREATE DATABASE smart_parking OWNER parking_user;
```

#### Step 2: Run Setup Script

**Windows:**
```bash
setup.bat
```

**macOS/Linux:**
```bash
bash setup.sh
```

Or do it manually:

#### Step 3: Setup Backend (Manual)

```bash
cd backend
npm install
npm run prisma:generate
npm run prisma:migrate
npm run dev
```

#### Step 4: Setup Frontend (New Terminal)

```bash
cd frontend
npm install
npm run dev
```

**Open:** http://localhost:5173

---

## 📋 System Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    User's Browser                            │
│              http://localhost:5173                           │
│  ┌────────────────────────────────────────────────────────┐ │
│  │              Frontend (React + Vite)                   │ │
│  │  • Dashboard & UI Components                           │ │
│  │  • Real-time Parking Status                            │ │
│  │  • User Authentication Flow                            │ │
│  │  • IoT Sensor Monitoring                               │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                          ↓↑ (HTTPS/HTTP)
        ┌─────────────────────────────────┐
        │  Backend API (Node.js + Express) │
        │  http://localhost:5000           │
        │                                   │
        │  Routes:                          │
        │  • /api/auth/* - HCMUT_SSO       │
        │  • /api/parking/* - Zones/Entry  │
        │  • /api/billing/* - Payments     │
        │  • /api/iot/* - Sensors          │
        │  • /api/activity-logs/* - Audit  │
        └─────────────────────────────────┘
                  ↓↑ (TCP)
        ┌─────────────────────────────────┐
        │   PostgreSQL Database            │
        │   localhost:5432                 │
        │                                   │
        │   • Users                         │
        │   • Parking Sessions              │
        │   • Transactions                  │
        │   • Audit Logs                    │
        │   • IoT Sensors                   │
        └─────────────────────────────────┘
```

---

## 🔑 Key Features Implemented

### ✅ Authentication (HCMUT_SSO Integration)
- OAuth2 Authorization Code Flow
- JWT Token Management with Refresh Tokens
- Role-Based Access Control (RBAC)
- Test Users Included for Development

### ✅ Database (Prisma + PostgreSQL)
- User Management with SSO synchronization
- Parking Zone Management
- Session Tracking (Entry/Exit)
- Transaction/Billing Records
- IoT Sensor Data
- Audit Logs for Compliance

### ✅ API Endpoints
- Authentication: `/api/auth/*` (Login, Logout, User Info, Ticket Verification)
- Parking: `/api/parking/*` (Zones, Sessions, Slots, Guidance)
- Billing: `/api/billing/*` (Transactions, Pricing Plans)
- IoT: `/api/iot/*` (Sensors, Status, Events)
- Activity: `/api/activity-logs` (Audit Trail)

### ✅ Frontend Components
- Dashboard with Real-time Stats
- User Management
- Parking Map & Slot Display
- Billing Panel with Transaction History
- Activity Logs
- IoT Monitoring
- Traffic Simulation

---

## 🧪 Test Data Included

When you run migrations with seeding, the system includes:

**Users:**
- Admin: `admin-001` (Admin role)
- Students: `B2124001`, `B2124002` (STUDENT role)
- Graduate: `B2124003` (GRADUATE role)
- Faculty: `F2124001` (FACULTY role)
- Staff: `S2124001` (STAFF role)

**Parking Zones:**
- Zone A-E (50-120 slots each)
- Pre-populated with occupancy data

**Test Transactions:**
- 2 completed/pending transactions
- Sample billing data

---

## 📱 Common Tasks

### View Database Visually
```bash
cd backend
npm run prisma:studio
# Opens: http://localhost:5555
```

### Test an API Endpoint
```bash
curl http://localhost:5000/api/parking/zones
```

### View Logs
```bash
# Backend logs (in terminal)
npm run dev

# Database logs
docker logs smart_parking_db

# Frontend browser console
Press F12 in browser
```

### Reset Database (⚠️ Deletes all data!)
```bash
cd backend
npm run reset:data
```

### Manually Sync HCMUT Data
```bash
cd backend
npm run sync:hcmut
```

---

## 🚨 Troubleshooting

### "Cannot find module" Error
```bash
cd backend
rm -rf node_modules package-lock.json
npm install
```

### Database Connection Error
```bash
# Verify PostgreSQL is running
docker ps | grep smart_parking_db

# Start it if not running
docker start smart_parking_db

# Check connection
psql -U parking_user -d smart_parking -h localhost
```

### Port Already in Use
```bash
# Find what's using the port
netstat -ano | findstr :5000  # Windows
lsof -i :5000                 # macOS/Linux

# Kill the process or use different port
npm run dev -- --port 5001    # Frontend with different port
```

### CORS/API Errors in Frontend
1. Verify backend is running (`npm run dev` in backend terminal)
2. Check browser console for exact error
3. Verify API_BASE in `frontend/src/app/App.tsx` is correct
4. Hard refresh browser (Ctrl+Shift+R)

---

## 📚 Documentation Files

| File | Purpose |
|------|---------|
| `RUN_PROJECT.md` | Comprehensive setup & API documentation |
| `backend/SETUP.md` | Detailed backend configuration |
| `backend/package.json` | Backend dependencies & scripts |
| `frontend/package.json` | Frontend dependencies & scripts |
| `docker-compose.yml` | One-command Docker setup |

---

## 🔐 Important Security Notes

### Development
- Secrets in `.env` are for dev ONLY
- Test users have simple passwords
- CORS is fully open (dev convenience)

### Before Production
1. Change all secrets in `.env`
2. Enable HTTPS
3. Restrict CORS to your domain
4. Setup rate limiting
5. Enable authentication on all sensitive endpoints
6. Configure HCMUT_SSO credentials with IT Center
7. Use strong database passwords
8. Enable database backups

---

## 🎯 What Runs on Each Port

| Port | Service | URL |
|------|---------|-----|
| 5173 | Frontend Dev Server | http://localhost:5173 |
| 5000 | Backend API | http://localhost:5000 |
| 5432 | PostgreSQL Database | localhost:5432 |
| 5555 | Prisma Studio (GUI DB) | http://localhost:5555 |
| 1883 | MQTT (IoT - optional) | localhost:1883 |

---

## ✅ Verification Checklist

After starting, verify:

- [ ] Frontend loads at http://localhost:5173
- [ ] Backend responds at http://localhost:5000/api/health
- [ ] Can see parking zones at http://localhost:5000/api/parking/zones
- [ ] Database has data (check Prisma Studio)
- [ ] No errors in browser console
- [ ] No errors in backend terminal
- [ ] Can click "Get Temporary Access" button

---

## 🚀 Next Steps

1. **Explore the UI** - Click around the dashboard
2. **Test endpoints** - Use Postman or curl to test API
3. **Check database** - Run `npm run prisma:studio`
4. **Review code** - Look at backend routes and components
5. **Integrate HCMUT_SSO** - Get credentials from IT Center
6. **Setup IoT integration** - Configure MQTT/sensor endpoints
7. **Deploy** - Follow production checklist

---

## 📞 Need Help?

1. **Check RUN_PROJECT.md** - Comprehensive documentation
2. **Read error messages** - They often suggest solutions
3. **Check Docker logs** - `docker logs <container>`
4. **Browser console** - F12 in browser for frontend errors
5. **Contact HCMUT IT Center** - For SSO/DATACORE issues

---

## 📊 System Requirements

| Component | Minimum | Recommended |
|-----------|---------|-------------|
| Node.js | 18.x | 20.x LTS |
| npm | 9.x | 10.x |
| RAM | 2GB | 4GB+ |
| Disk | 500MB | 2GB+ |
| PostgreSQL | 12 | 15+ |

---

## 🎉 You're All Set!

The system is now ready to use. Start by:

```bash
# Terminal 1: Backend
cd backend && npm run dev

# Terminal 2: Frontend
cd frontend && npm run dev

# Visit: http://localhost:5173
```

Enjoy! 🚀
