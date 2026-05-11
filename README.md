# HCMUT Smart Parking Management System

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-ISC-green)
![Node](https://img.shields.io/badge/node-18%2B-brightgreen)
![Status](https://img.shields.io/badge/status-development-orange)
![Storage](https://img.shields.io/badge/storage-JSON-blue)

An intelligent parking management system for Ho Chi Minh City University of Technology with HCMUT_SSO authentication, real-time IoT monitoring, and integrated billing. **Now with lightweight JSON-based data storage** - no database setup required!

## 🎯 Overview

This system addresses HCMUT's parking challenges through:
- **Smart Authentication**: HCMUT_SSO integration for university members
- **Real-time Monitoring**: IoT sensors for parking slot occupancy
- **Automated Billing**: Integration with BKPay for student payments
- **Traffic Guidance**: Dynamic signage with availability information
- **User Management**: Support for students, faculty, staff, and visitors
- **Simple Setup**: JSON-based data storage, no database installation needed

## 🚀 Quick Start

### ⚡ Fastest Setup (2 minutes)

```bash
# Clone repository
git clone <repo-url>
cd Smart_Parking_Management_System

```

That's it! The setup script will:
✅ Check Node.js installation
✅ Install backend dependencies
✅ Install frontend dependencies
✅ Initialize JSON data file

### 📖 Documentation

| Document | Purpose | Time |
|----------|---------|------|
| **[RUN_PROJECT.md](./RUN_PROJECT.md)** | Comprehensive guide | 15 min |

## 📋 Prerequisites

- **Node.js** 18+ ([Download](https://nodejs.org/))
- **Git** ([Download](https://git-scm.com/))

That's all you need! No database installation required.

## 🎮 Running the Project

### Option 1: Automated (Recommended)

```bash
# Run all services
npm run start-dev
```

### Option 2: Manual - Open 2 terminals

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

### Access Points

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000
- **Data File**: `backend/data/db.json`

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

## 🔌 JSON Data Structure

The application uses a single `backend/data/db.json` file with the following structure:

```json
{
  "users": [...],           # User accounts
  "zones": [...],           # Parking zones
  "sessions": [...],        # Active parking sessions
  "tickets": [...],         # Parking tickets
  "iot": {                  # IoT devices
    "gateways": [...],
    "sensors": [...],
    "signage": [...]
  },
  "billing": {              # Billing system
    "pricingPlans": [...],
    "transactions": [...]
  },
  "activityLogs": [...],    # System activity logs
  "analytics": {...},       # Analytics data
  "metadata": {...}         # Metadata
}
```

### Reset Data

To reset the database to its initial state:

```bash
cd backend
npm run reset:data
```

This will restore the data file to the seed data.

## 🛠️ Available Scripts

### Backend

```bash
cd backend

npm run start          # Start production server
npm run dev           # Start with nodemon (development)
npm run reset:data    # Reset JSON data to seed
```

### Frontend

```bash
cd frontend

npm run dev           # Start dev server
npm run build         # Build for production
npm run preview       # Preview production build
npm run lint          # Run ESLint
```

## 🌐 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user

### Parking Zones
- `GET /api/zones` - List all zones
- `GET /api/zones/:id` - Get zone details
- `POST /api/zones/:id/entry` - Record entry
- `POST /api/zones/:id/exit` - Record exit

### User Management
- `GET /api/users` - List users (Admin only)
- `GET /api/users/:id` - Get user details
- `PUT /api/users/:id` - Update user (Admin only)

### Billing
- `GET /api/billing/plans` - Get pricing plans
- `GET /api/billing/transactions` - Get transactions

### Analytics
- `GET /api/analytics/occupancy` - Occupancy data
- `GET /api/analytics/revenue` - Revenue data

## 🔐 Test Accounts

```
Username: admin          Password: admin123     (Admin)
Username: 1952001        Password: 123456       (Student)
Username: F2001          Password: 123456       (Faculty)
Username: S1023          Password: 123456       (Staff)
```

## 📦 Dependencies

### Backend
- **express** - Web framework
- **cors** - Cross-origin resource sharing
- **jsonwebtoken** - JWT authentication
- **dotenv** - Environment variables
- **uuid** - Unique IDs

### Frontend
- **react** - UI library
- **vite** - Build tool
- **tailwindcss** - Styling
- **shadcn/ui** - UI components

## 🐳 Docker Support

To run with Docker:

```bash
docker-compose up -d
```

Access:
- Frontend: http://localhost:5173
- Backend: http://localhost:5000

Stop services:
```bash
docker-compose down
```

## 📝 License

ISC

## 👥 Contributing

For development and contribution guidelines, see individual component documentation.

## 📧 Support

For issues and questions, please refer to the documentation or contact the development team.
# Backend
cd backend
npm install
npm run prisma:migrate
npm run dev

# Frontend (new terminal)
cd frontend
npm install
npm run dev

# Visit: http://localhost:5173
```

## 📁 Project Structure

```
.
├── backend/                     # Node.js API Server
│   ├── routes/auth.js          # HCMUT_SSO authentication
│   ├── jobs/dataSyncJob.js     # HCMUT_DATACORE sync
│   ├── prisma/schema.prisma    # Database schema
│   ├── .env                    # Configuration
│   └── server.js               # Entry point
│
├── frontend/                    # React + Vite UI
│   ├── src/app/App.tsx         # Main component
│   ├── src/components/         # React components
│   └── vite.config.ts          # Build config
│
├── QUICKSTART.md               # ⚡ Fast setup guide
├── RUN_PROJECT.md              # 📚 Comprehensive guide
├── docker-compose.yml          # One-command setup
├── setup.sh / setup.bat        # Automated setup
└── README.md                   # This file
```

## 🔑 Key Features

### ✅ Authentication
- HCMUT_SSO OAuth2 integration
- JWT token management
- Role-based access control
- Automatic user sync from HCMUT_DATACORE

### ✅ Parking Management
- Real-time zone and slot tracking
- Entry/exit recording
- Automatic parking fee calculation
- Dynamic guidance based on availability

### ✅ Billing System
- Integration with BKPay payment platform
- Automatic fee generation for learners
- Configurable pricing policies by admin
- Transaction audit trail

### ✅ IoT Integration
- Real-time sensor monitoring
- Parking slot occupancy detection
- Gateway status tracking
- Sensor malfunction alerts

### ✅ User Roles
- **Students, Graduates, Doctorates**: Automatic billing
- **Faculty**: Free parking (configurable)
- **Staff**: Reduced rate parking (configurable)
- **Visitors**: Temporary ticket system
- **Admins**: System configuration & monitoring

### ✅ Compliance
- Comprehensive audit logging
- All user actions tracked
- Financial transaction records
- Role-based access control

## 🛠️ Technology Stack

### Backend
- **Framework**: Express.js 4.18+
- **Database**: PostgreSQL 15 + Prisma ORM
- **Authentication**: JWT + OAuth2
- **Language**: Node.js 18+

### Frontend
- **Framework**: React 18
- **Build Tool**: Vite 4+
- **Styling**: Tailwind CSS + Radix UI
- **Language**: TypeScript

### Infrastructure
- **Container**: Docker & Docker Compose
- **Database**: PostgreSQL
- **API**: RESTful JSON endpoints

## 📊 API Overview

### Authentication Endpoints
- `POST /api/auth/sso-callback` - HCMUT_SSO login
- `GET /api/auth/me` - Current user info
- `POST /api/auth/guest-access` - Temporary tickets
- `POST /api/auth/logout` - User logout

### Parking Endpoints
- `GET /api/parking/zones` - List all zones
- `POST /api/parking/sessions/entry` - Record entry
- `POST /api/parking/sessions/:id/exit` - Record exit
- `GET /api/parking/guidance` - Get parking guidance

### Billing Endpoints
- `GET /api/billing/overview` - Revenue summary
- `GET /api/billing/transactions` - Transaction history
- `POST /api/billing/calculate` - Calculate fee

### IoT Endpoints
- `GET /api/iot/status` - Gateway status
- `GET /api/iot/sensors` - Sensor readings
- `POST /api/iot/events/heartbeat` - Gateway heartbeat

### Activity & Audit
- `GET /api/activity-logs` - System activity
- `GET /api/auth/audit-logs` - Audit trail (admin)

## 🗄️ Database Schema

Core Models:
- **User** - System users (HCMUT members)
- **ParkingZone** - Physical parking areas
- **ParkingSession** - Individual parking instances
- **IoTSensor** - Parking slot sensors
- **Transaction** - Billing records
- **BillingPlan** - Pricing policies
- **AuditLog** - Compliance tracking

See [prisma/schema.prisma](./backend/prisma/schema.prisma) for full schema.

## 🚨 Troubleshooting

### Database Connection Error
```bash
# Start PostgreSQL
docker start smart_parking_db

# Or verify connection
psql -U parking_user -d smart_parking -h localhost
```

### Module Not Found
```bash
cd backend
npm install
```

### Port Already in Use
```bash
# Find process
lsof -i :5000        # macOS/Linux
netstat -ano | findstr :5000  # Windows

# Kill or use different port
npm run dev -- --port 5001
```

For more help, see [Troubleshooting](./RUN_PROJECT.md#-troubleshooting) in RUN_PROJECT.md

## 🔐 Security

### Development
- Simple credentials for testing
- CORS fully open
- Plaintext secrets in .env

### Production Checklist
- [ ] Change all JWT secrets
- [ ] Enable HTTPS
- [ ] Restrict CORS
- [ ] Setup rate limiting
- [ ] Configure HCMUT_SSO credentials
- [ ] Use strong DB passwords
- [ ] Enable database backups
- [ ] Setup monitoring & logging

See [Security Notes](./RUN_PROJECT.md#-security-notes) for details.

## 📚 Additional Resources

- [QUICKSTART.md](./QUICKSTART.md) - 5-minute setup guide
- [RUN_PROJECT.md](./RUN_PROJECT.md) - Comprehensive guide
- [backend/SETUP.md](./backend/SETUP.md) - Backend details
- [frontend/README.md](./frontend/README.md) - Frontend details

## 🔄 HCMUT Integration

### HCMUT_SSO
- OAuth2 authorization code flow
- Automatic user creation on first login
- Role synchronization from HCMUT_DATACORE

### HCMUT_DATACORE
- Read-only user data sync (every 6 hours)
- Role and program information
- Automatic status updates

### BKPay
- Payment processing for student parking fees
- Transaction webhooks
- Automatic billing cycle

**Contact HCMUT IT Center for:**
- `HCMUT_SSO_CLIENT_ID` and `CLIENT_SECRET`
- `HCMUT_DATACORE_API_KEY`
- `BKPay` merchant credentials

## 🎯 Getting Started

1. **Read**: [QUICKSTART.md](./QUICKSTART.md)
2. **Setup**: Run setup script or docker-compose
3. **Verify**: Visit http://localhost:5173
4. **Explore**: Click around dashboard
5. **Code**: Review components and API routes
6. **Integrate**: Configure HCMUT credentials

## 📝 Development Scripts

### Backend
```bash
cd backend

npm run dev                    # Start dev server
npm start                      # Start production
npm run prisma:migrate         # Run migrations
npm run prisma:generate        # Generate client
npm run prisma:studio          # Open database GUI
npm run reset:data             # Reset database
npm run sync:hcmut             # Manual data sync
```

### Frontend
```bash
cd frontend

npm run dev                    # Start dev server
npm run build                  # Build for production
npm run preview                # Preview build
```

## 🤝 Contributing

1. Clone the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📜 License

ISC License - See LICENSE file for details

## 📞 Support

### For Development Issues
- Check [Troubleshooting](./RUN_PROJECT.md#-troubleshooting)
- Review error messages carefully
- Check [RUN_PROJECT.md](./RUN_PROJECT.md) for detailed info

### For HCMUT Integration
- **Email**: it@hcmut.edu.vn
- **Portal**: https://datacore.hcmut.edu.vn
- **Docs**: https://datacore.hcmut.edu.vn/docs

## 📅 Version History

### v1.0.0 (April 26, 2026)
- Initial release
- HCMUT_SSO authentication
- Parking management system
- Real-time IoT monitoring
- Billing integration
- Comprehensive audit logging

## 🙏 Acknowledgments

- HCMUT IT Center for infrastructure integration
- Faculty of Information Technology for requirements
- BKPay team for payment integration

---

**Start here**: [QUICKSTART.md](./QUICKSTART.md) ⚡

Last Updated: April 26, 2026