# HCMUT Smart Parking Management System

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-ISC-green)
![Node](https://img.shields.io/badge/node-18%2B-brightgreen)
![Status](https://img.shields.io/badge/status-development-orange)

An intelligent parking management system for Ho Chi Minh City University of Technology with HCMUT_SSO authentication, real-time IoT monitoring, and integrated billing.

## 🎯 Overview

This system addresses HCMUT's parking challenges through:
- **Smart Authentication**: HCMUT_SSO integration for university members
- **Real-time Monitoring**: IoT sensors for parking slot occupancy
- **Automated Billing**: Integration with BKPay for student payments
- **Traffic Guidance**: Dynamic signage with availability information
- **User Management**: Support for students, faculty, staff, and visitors

## 📖 Documentation

| Document | Purpose | Time |
|----------|---------|------|
| **[QUICKSTART.md](./QUICKSTART.md)** | ⚡ Get running in 5 minutes | 5 min |
| **[RUN_PROJECT.md](./RUN_PROJECT.md)** | 📚 Comprehensive guide | 20 min |
| **[backend/SETUP.md](./backend/SETUP.md)** | 🔧 Backend setup details | 15 min |
| **[frontend/README.md](./frontend/README.md)** | 🎨 Frontend documentation | 10 min |

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ ([Download](https://nodejs.org/))
- Docker & Docker Compose ([Download](https://www.docker.com/))
- Git ([Download](https://git-scm.com/))

### Fastest Setup (30 seconds)

```bash
# Windows
setup.bat

# macOS/Linux
bash setup.sh

# Or with Docker Compose
docker-compose up -d
```

### Manual Setup

```bash
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
