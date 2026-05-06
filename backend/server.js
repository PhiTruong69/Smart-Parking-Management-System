const express = require("express");
const cors = require("cors");
const crypto = require("crypto");
require('dotenv').config();

const { initStore, readStore, writeStore } = require("./data/store");

// Import authentication routes
const authRoutes = require("./routes/auth");

// Import data sync
const { initializeSchedules } = require("./jobs/dataSyncJob");

const app = express();
const PORT = Number(process.env.PORT || 5000);

initStore();
app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  req.actorRole = String(req.headers["x-role"] || "END_USER").toUpperCase();
  next();
});

// Mount new HCMUT SSO authentication routes (v2)
app.use("/api/auth", authRoutes);

// Initialize data sync schedules
initializeSchedules();

function requireRole(roles) {
  return (req, res, next) => {
    if (!roles.includes(req.actorRole)) {
      return res.status(403).json({ message: "Forbidden: insufficient role", required: roles, current: req.actorRole });
    }
    next();
  };
}

function makeId(prefix) {
  return `${prefix}-${crypto.randomUUID().slice(0, 8)}`;
}

function getCurrentDateString() {
  return new Date().toISOString().slice(0, 10);
}

function calculateFee(entryTime, exitTime, role, db) {
  const durationHours = Math.max(1, Math.ceil((new Date(exitTime) - new Date(entryTime)) / 36e5));
  const normalizedRole = String(role || "Visitor").toLowerCase();
  
  // Tìm chính sách giá từ Database do Admin cấu hình
  const plans = db.billing.pricingPlans || [];
  let rate = 10000; // Mặc định cho Visitor

  if (normalizedRole.includes("student") || normalizedRole.includes("graduate") || normalizedRole.includes("doctoral")) {
    rate = plans.find(p => p.category === "Students")?.hourly || 5000;
  } else if (normalizedRole.includes("staff")) {
    rate = plans.find(p => p.category === "Staff")?.hourly || 4000;
  } else if (normalizedRole.includes("faculty")) {
    rate = plans.find(p => p.category === "Faculty")?.hourly || 0;
  } else {
    rate = plans.find(p => p.category === "Visitors")?.hourly || 10000;
  }

  return durationHours * rate;
}

function getDashboardSummary(db) {
  const totalSlots = db.zones.reduce((sum, z) => sum + z.total, 0);
  const occupied = db.zones.reduce((sum, z) => sum + z.occupied, 0);
  const available = totalSlots - occupied;
  const activeSessions = db.sessions.filter((s) => s.status === "ACTIVE").length;
  const todayRevenue = db.billing.dailyRevenueDate === getCurrentDateString() ? db.billing.dailyRevenue : 0;
  const totalRevenue = (db.billing.transactions || [])
    .filter((t) => t.status === "Paid")
    .reduce((sum, t) => sum + t.amount, 0);
  return { totalSlots, occupied, available, activeSessions, todayRevenue, totalRevenue };
}

function generateGuidance(zones) {
  const sorted = [...zones].sort((a, b) => (a.occupied / a.total) - (b.occupied / b.total));
  return zones.map((z) => {
    const state = z.occupied / z.total >= 0.95 ? "full" : z.occupied / z.total >= 0.85 ? "nearly_full" : "available";
    const alternative = state === "full" ? sorted.find((x) => x.id !== z.id && x.occupied < x.total) : null;
    return {
      zoneId: z.id,
      state,
      message:
        state === "full"
          ? `Zone ${z.id}: Full -> Go to Zone ${alternative?.id || "N/A"}`
          : state === "nearly_full"
          ? `Zone ${z.id}: Nearly full`
          : `Zone ${z.id}: Available`,
      alternativeZoneId: alternative?.id || null,
    };
  });
}

function ensureBaselineData(db) {
  if (!db.slotAssignments) db.slotAssignments = {};
  if (!db.billing) db.billing = { pricingPlans: [], transactions: [], dailyRevenue: 0, dailyRevenueDate: getCurrentDateString() };
  if (!Array.isArray(db.billing.pricingPlans)) db.billing.pricingPlans = [];
  if (!Array.isArray(db.billing.transactions)) db.billing.transactions = [];
  if (typeof db.billing.dailyRevenue !== "number") db.billing.dailyRevenue = 0;
  if (!db.billing.dailyRevenueDate) db.billing.dailyRevenueDate = getCurrentDateString();
  if (!Array.isArray(db.activityLogs)) db.activityLogs = [];
  
  // Only keep admin user, remove all mock/simulation users
  db.users = db.users.filter((u) => u.id === "admin");
  
  if (!db.users.some((u) => u.id === "admin")) {
    db.users.unshift({
      id: "admin",
      password: "admin123",
      name: "System Admin",
      role: "Admin",
      program: "IT Center",
      status: "Active",
      parkingPass: "Reserved",
      balance: 0,
      entryCount: 0,
    });
  }
  db.users = db.users.map((u) => ({ ...u, password: u.password || "123456" }));
}

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", service: "spms-backend", timestamp: new Date().toISOString() });
});

app.post("/api/auth/login", (req, res) => {
  const { studentId, password } = req.body;
  if (!studentId || !password) {
    return res.status(400).json({ message: "studentId and password are required" });
  }
  const db = readStore();
  ensureBaselineData(db);
  writeStore(db);
  const user = db.users.find((u) => u.id === studentId && u.password === password);
  if (!user) return res.status(401).json({ message: "Invalid credentials" });
  return res.json({
    token: crypto.randomUUID(),
    user: { ...user, password: undefined },
    actorRole: user.role === "Admin" ? "ADMIN" : user.role === "Faculty" || user.role === "Staff" ? "OPERATOR" : "END_USER",
  });
});

app.post("/api/auth/register", (req, res) => {
  const { studentId, password, name, role = "Student", program = "N/A" } = req.body;
  if (!studentId || !password || !name) return res.status(400).json({ message: "studentId, password, name are required" });
  const db = readStore();
  ensureBaselineData(db);
  if (db.users.some((u) => u.id === studentId)) return res.status(409).json({ message: "Account already exists" });
  const user = {
    id: studentId,
    password,
    name,
    role,
    program,
    status: "Active",
    parkingPass: role === "Faculty" ? "Reserved" : "Monthly",
    balance: 0,
    entryCount: 0,
  };
  db.users.push(user);
  writeStore(db);
  res.status(201).json({ message: "Registered", user: { ...user, password: undefined } });
});

app.post("/api/auth/logout", (req, res) => {
  res.json({ message: "Logged out" });
});

app.get("/api/auth/me", (req, res) => {
  const db = readStore();
  res.json(db.users[0]);
});

app.get("/api/integrations/sso/status", (req, res) => {
  res.json({ service: "HCMUT_SSO", status: "connected", checkedAt: new Date().toISOString() });
});

app.get("/api/integrations/datacore/status", (req, res) => {
  const db = readStore();
  res.json({
    service: "HCMUT_DATACORE",
    mode: "read-only",
    status: "synced",
    syncedUsers: db.users.length,
    lastSyncAt: db.metadata?.updatedAt || new Date().toISOString(),
  });
});

app.post("/api/integrations/datacore/sync", requireRole(["ADMIN"]), (req, res) => {
  const db = readStore();
  db.activityLogs.unshift({
    id: Date.now(),
    timestamp: new Date().toISOString().replace("T", " ").slice(0, 19),
    type: "system",
    user: "System",
    userId: "SYSTEM",
    role: "System",
    zone: "All Zones",
    gate: "N/A",
    vehicleId: "N/A",
    action: "DATACORE synchronization executed",
  });
  writeStore(db);
  res.json({ status: "ok", syncedUsers: db.users.length, at: new Date().toISOString() });
});

app.get("/api/dashboard/summary", (req, res) => {
  const db = readStore();
  res.json(getDashboardSummary(db));
});

app.get("/api/analytics", (req, res) => {
  const db = readStore();
  res.json(db.analytics);
});

app.get("/api/users", (req, res) => {
  const db = readStore();
  const q = String(req.query.q || "").toLowerCase();
  const users = q
    ? db.users.filter((u) => [u.id, u.name, u.program, u.role].join(" ").toLowerCase().includes(q))
    : db.users;
  res.json({ items: users, total: users.length });
});

app.patch("/api/users/:id/role", (req, res) => {
  const db = readStore();
  const user = db.users.find((u) => u.id === req.params.id);
  if (!user) return res.status(404).json({ message: "User not found" });
  user.role = req.body.role || user.role;
  writeStore(db);
  res.json(user);
});

app.get("/api/admin/pricing-policies", requireRole(["ADMIN", "OPERATOR"]), (req, res) => {
  const db = readStore();
  res.json(db.billing.pricingPlans);
});

app.patch("/api/admin/pricing-policies/:category", requireRole(["ADMIN"]), (req, res) => {
  const db = readStore();
  const category = req.params.category.toLowerCase();
  const policy = db.billing.pricingPlans.find((p) => String(p.category).toLowerCase() === category);
  if (!policy) return res.status(404).json({ message: "Policy not found" });
  Object.assign(policy, req.body);
  db.activityLogs.unshift({
    id: Date.now(),
    timestamp: new Date().toISOString().replace("T", " ").slice(0, 19),
    type: "system",
    user: "Admin",
    userId: "ADMIN",
    role: "Admin",
    zone: "N/A",
    gate: "N/A",
    vehicleId: "N/A",
    action: `Pricing policy updated: ${policy.category}`,
  });
  writeStore(db);
  res.json(policy);
});

app.get("/api/parking/slots/all", (req, res) => {
  const db = readStore();
  ensureBaselineData(db);
  const allZonesData = {};
  const zones = ['A', 'B', 'C', 'D', 'E'];

  zones.forEach((zoneId) => {
    const totalSlots = 100;
    const occupiedSlots = db.slotAssignments[zoneId] || [];
    allZonesData[zoneId] = Array.from({ length: totalSlots }, (_, i) => {
      const slotId = `${zoneId}-${i + 1}`;
      return {
        id: slotId,
        status: occupiedSlots.includes(slotId) ? 'occupied' : 'available',
      };
    });
  });

  res.json(allZonesData);
});

app.get("/api/parking/slots/:zoneId", (req, res) => {
  const db = readStore();
  ensureBaselineData(db);
  const zoneId = req.params.zoneId;
  const zone = db.zones.find((z) => z.id === zoneId);
  if (!zone) return res.status(404).json({ message: "Zone not found" });
  if (!db.slotAssignments) db.slotAssignments = {};
  const occupiedSlots = db.slotAssignments[zoneId] || [];
  const slots = Array.from({ length: zone.total }, (_, i) => {
    const slotId = `${zoneId}-${i + 1}`;
    return { slotId, occupied: occupiedSlots.includes(slotId) };
  });
  res.json({ zoneId, slots });
});

app.get("/api/parking/zones", (req, res) => {
  const db = readStore();
  const zones = db.zones.map((z) => ({
    ...z,
    available: z.total - z.occupied,
    state: z.occupied / z.total >= 0.95 ? "full" : z.occupied / z.total >= 0.85 ? "nearly_full" : "available",
  }));
  res.json(zones);
});

app.get("/api/parking/sessions/active", (req, res) => {
  const db = readStore();
  const active = db.sessions.filter((s) => s.status === "ACTIVE");
  res.json(active);
});

app.get("/api/parking/sessions", (req, res) => {
  const db = readStore();
  res.json(db.sessions);
});

app.post("/api/parking/sessions/entry", (req, res) => {
  const { userId, userName, userType, zoneId = "E", slotId, gate = "Unknown", vehicleId = "N/A", method = "CARD" } = req.body;
  const db = readStore();
  ensureBaselineData(db);
  const zone = db.zones.find((z) => z.id === zoneId);
  if (!zone) return res.status(400).json({ message: "Invalid zoneId" });
  if (zone.occupied >= zone.total) return res.status(409).json({ message: "Zone is full" });
  if (!db.slotAssignments) db.slotAssignments = {};
  if (!db.slotAssignments[zoneId]) db.slotAssignments[zoneId] = [];
  if (slotId && db.slotAssignments[zoneId].includes(slotId)) return res.status(409).json({ message: `Slot ${slotId} is already occupied` });

  let resolvedUserId = userId;
  let resolvedUser = resolvedUserId ? db.users.find((u) => u.id === resolvedUserId) : null;
  if (!resolvedUserId && userName) {
    const role = userType || "Visitor";
    resolvedUserId = makeId(role === "Faculty" ? "F" : role === "Student" ? "STU" : "V");
    resolvedUser = {
      id: resolvedUserId,
      password: "123456",
      name: userName,
      role,
      program: "Simulation",
      status: "Active",
      parkingPass: role === "Faculty" ? "Reserved" : "Monthly",
      balance: 0,
      entryCount: 0,
    };
    db.users.push(resolvedUser);
  }

  const session = {
    id: makeId("SES"),
    userId: resolvedUserId || null,
    userName: resolvedUser?.name || userName || "Visitor",
    userType: resolvedUser?.role || userType || "Visitor",
    zoneId,
    slotId: slotId || null,
    gate,
    vehicleId,
    method,
    entryAt: new Date().toISOString(),
    exitAt: null,
    status: "ACTIVE",
    fee: null,
  };
  db.sessions.push(session);
  if (slotId) db.slotAssignments[zoneId].push(slotId);
  zone.occupied += 1;
  db.activityLogs.unshift({
    id: Date.now(),
    timestamp: new Date().toISOString().replace("T", " ").slice(0, 19),
    type: "entry",
    user: session.userName,
    userId: session.userId || "V-UNKNOWN",
    role: session.userType,
    zone: `Zone ${zoneId}`,
    gate,
    vehicleId,
    action: "Vehicle entered parking zone",
  });
  writeStore(db);
  res.status(201).json(session);
});

app.post("/api/parking/sessions/:id/exit", (req, res) => {
  const db = readStore();
  const session = db.sessions.find((s) => s.id === req.params.id);
  if (!session) return res.status(404).json({ message: "Session not found" });

  session.exitAt = new Date().toISOString();
  session.status = "CLOSED";
  session.fee = calculateFee(session.entryAt, session.exitAt, session.userType, db);

  const durationMs = new Date(session.exitAt) - new Date(session.entryAt);
  const durationHours = Math.max(1, Math.ceil(durationMs / 36e5));
  const duration = `${durationHours}h`;

  const zone = db.zones.find((z) => z.id === session.zoneId);
  if (zone) zone.occupied = Math.max(0, zone.occupied - 1);
  if (session.slotId) {
    db.slotAssignments[session.zoneId] = (db.slotAssignments[session.zoneId] || []).filter(id => id !== session.slotId);
  }

  const today = getCurrentDateString();
  if (db.billing.dailyRevenueDate !== today) {
    db.billing.dailyRevenueDate = today;
    db.billing.dailyRevenue = 0;
  }
  db.billing.dailyRevenue += session.fee;

  const payment = {
    id: makeId("TXN"),
    userId: session.userId || "UNKNOWN",
    userName: session.userName,
    type: "Parking Fee",
    amount: session.fee,
    period: new Date().toLocaleString("en-US", { month: "long", year: "numeric" }),
    status: "Paid",
    date: session.exitAt.replace("T", " ").slice(0, 16),
    method: "Cash",
  };
  db.billing.transactions.unshift(payment);

  db.activityLogs.unshift({
    id: Date.now(),
    timestamp: session.exitAt.replace("T", " ").slice(0, 19),
    type: "exit",
    user: session.userName,
    userId: session.userId || "V-UNKNOWN",
    role: session.userType,
    zone: `Zone ${session.zoneId}`,
    gate: session.gate,
    vehicleId: session.vehicleId,
    action: "Vehicle exited parking zone",
    duration,
    amount: session.fee,
    transactionId: payment.id,
  });

  writeStore(db);
  res.json({ ...session, payment });
});

app.post("/api/parking/tickets/issue", (req, res) => {
  const { zoneId = "E", gate = "Gate E1", note = "" } = req.body;
  const db = readStore();
  const ticket = {
    ticketNo: makeId("TKT"),
    issuedAt: new Date().toISOString(),
    zoneId,
    gate,
    note,
    status: "ACTIVE",
  };
  db.tickets.push(ticket);
  db.activityLogs.unshift({
    id: Date.now(),
    timestamp: new Date().toISOString().replace("T", " ").slice(0, 19),
    type: "ticket",
    user: "Visitor",
    userId: ticket.ticketNo,
    role: "Visitor",
    zone: `Zone ${zoneId}`,
    gate,
    vehicleId: "N/A",
    action: "Temporary ticket issued",
  });
  writeStore(db);
  res.status(201).json(ticket);
});

app.get("/api/parking/tickets", (req, res) => {
  const db = readStore();
  res.json(db.tickets);
});

app.post("/api/parking/tickets/:ticketNo/close", (req, res) => {
  const db = readStore();
  const ticket = db.tickets.find((t) => t.ticketNo === req.params.ticketNo);
  if (!ticket) return res.status(404).json({ message: "Ticket not found" });
  ticket.status = "CLOSED";
  writeStore(db);
  res.json(ticket);
});

app.get("/api/parking/guidance", (req, res) => {
  const db = readStore();
  res.json(generateGuidance(db.zones));
});

app.get("/api/iot/status", (req, res) => {
  const db = readStore();
  if (!db.disabledSensors) db.disabledSensors = {};
  const sensors = db.iot.sensors;
  
  // Calculate real gateway status based on zones
  const gateways = db.zones.map((zone) => {
    const totalSensorsInZone = zone.total;
    const disabledSensorsInZone = Object.keys(db.disabledSensors).filter((sensorId) => {
      return sensorId.includes(`-${zone.id}-`);
    }).length;
    const workingSensors = totalSensorsInZone - disabledSensorsInZone;
    
    return {
      id: `GW-${zone.id}`,
      name: `Gateway Zone ${zone.id}`,
      zone: zone.id,
      status: workingSensors > 0 ? "online" : "offline",
      sensors: totalSensorsInZone,
      sensorsOnline: workingSensors,
      uptime: "99.9%",
      signalStrength: 90 + Math.floor(Math.random() * 10),
      lastUpdate: "just now",
    };
  });
  
  const totalSensors = db.zones.reduce((sum, z) => sum + z.total, 0);
  const totalDisabled = Object.keys(db.disabledSensors).length;
  
  res.json({
    totalSensors: totalSensors,
    online: totalSensors - totalDisabled,
    offline: totalDisabled,
    maintenance: 0,
    gateways,
  });
});

app.get("/api/iot/sensors", (req, res) => {
  const db = readStore();
  if (!db.disabledSensors) db.disabledSensors = {};
  
  // Generate real sensors based on zones and slots
  const sensors = [];
  db.zones.forEach((zone) => {
    for (let i = 1; i <= zone.total; i++) {
      const slotId = `${zone.id}-${i}`;
      const sensorId = `S-${slotId}`;
      const isDisabled = db.disabledSensors[sensorId];
      const slotAssignment = (db.slotAssignments || {})[slotId];
      
      sensors.push({
        id: sensorId,
        zone: zone.id,
        slot: slotId,
        status: isDisabled ? "offline" : "online",
        battery: isDisabled ? 0 : 85 + Math.floor(Math.random() * 15),
        signal: isDisabled ? 0 : 80 + Math.floor(Math.random() * 20),
        lastUpdate: isDisabled ? "disabled" : slotAssignment ? "occupied" : "2 sec ago",
        occupied: !!slotAssignment,
        disabled: !!isDisabled,
      });
    }
  });
  
  res.json(sensors);
});

app.post("/api/iot/sensors/:id/toggle", (req, res) => {
  const db = readStore();
  const sensorId = req.params.id;
  const { disable } = req.body;
  
  if (!db.disabledSensors) db.disabledSensors = {};
  
  if (disable === true) {
    db.disabledSensors[sensorId] = true;
  } else {
    delete db.disabledSensors[sensorId];
  }
  
  // Log the event
  const sensorInfo = sensorId.split('-').slice(1).join('-');
  db.activityLogs.unshift({
    id: Date.now(),
    timestamp: new Date().toISOString().replace("T", " ").slice(0, 19),
    type: "sensor",
    user: "System",
    userId: "SYSTEM",
    role: "System",
    zone: `Zone ${sensorInfo.charAt(0)}`,
    gate: "N/A",
    vehicleId: "N/A",
    action: `Sensor ${sensorId} at slot ${sensorInfo} ${disable ? "disabled" : "enabled"}`,
  });
  
  writeStore(db);
  
  res.json({
    id: sensorId,
    status: disable ? "offline" : "online",
    disabled: !!disable,
    message: `Sensor ${disable ? "disabled" : "enabled"} successfully`,
  });
});

app.get("/api/iot/signage", (req, res) => {
  const db = readStore();
  // Return signage data with status
  const signage = db.iot.signage || [
    { id: "SIGN-001", location: "Main Entrance", zone: "All", status: "online", message: "Zone A: Full • Zone B: Available", uptime: "99.9%" },
    { id: "SIGN-005", location: "Visitor Entrance", zone: "E", status: "online", message: "Zone E: Available", uptime: "98.5%" },
  ];
  res.json(signage);
});

app.post("/api/iot/events/heartbeat", (req, res) => {
  const { gatewayId, status = "online" } = req.body;
  if (!gatewayId) return res.status(400).json({ message: "gatewayId is required" });
  const db = readStore();
  const gateway = db.iot.gateways.find((g) => g.id === gatewayId);
  if (!gateway) return res.status(404).json({ message: "Gateway not found" });
  gateway.status = status;
  gateway.lastUpdate = "just now";
  writeStore(db);
  res.json(gateway);
});

app.post("/api/iot/events/slot-occupancy", (req, res) => {
  const { sensorId, status } = req.body;
  if (!sensorId || !status) return res.status(400).json({ message: "sensorId and status are required" });
  const db = readStore();
  const sensor = db.iot.sensors.find((s) => s.id === sensorId);
  if (!sensor) return res.status(404).json({ message: "Sensor not found" });
  sensor.status = status;
  sensor.lastUpdate = "just now";
  db.activityLogs.unshift({
    id: Date.now(),
    timestamp: new Date().toISOString().replace("T", " ").slice(0, 19),
    type: "sensor",
    user: "System",
    userId: "SYSTEM",
    role: "System",
    zone: `Zone ${sensor.zone}`,
    gate: "N/A",
    vehicleId: "N/A",
    action: `Sensor ${sensor.id} status changed: ${status}`,
  });
  writeStore(db);
  res.json(sensor);
});

app.get("/api/billing/overview", (req, res) => {
  const db = readStore();
  const all = db.billing.transactions;
  const totalRevenue = all.filter((t) => t.status === "Paid").reduce((sum, t) => sum + t.amount, 0);
  const pending = all.filter((t) => t.status === "Pending").reduce((sum, t) => sum + t.amount, 0);
  const overdue = all.filter((t) => t.status === "Overdue").reduce((sum, t) => sum + t.amount, 0);
  const thisMonth = all
    .filter((t) => String(t.period).toLowerCase().includes("april"))
    .reduce((sum, t) => sum + t.amount, 0);
  const dailyRevenue = db.billing.dailyRevenueDate === getCurrentDateString() ? db.billing.dailyRevenue : 0;
  res.json({ totalRevenue, dailyRevenue, thisMonth, pending, overdue, pricingPlans: db.billing.pricingPlans });
});

app.post("/api/billing/reset-daily", requireRole(["ADMIN"]), (req, res) => {
  const db = readStore();
  const today = getCurrentDateString();
  db.billing.dailyRevenueDate = today;
  db.billing.dailyRevenue = 0;
  db.activityLogs.unshift({
    id: Date.now(),
    timestamp: new Date().toISOString().replace("T", " ").slice(0, 19),
    type: "system",
    user: "Admin",
    userId: "ADMIN",
    role: "Admin",
    zone: "N/A",
    gate: "N/A",
    vehicleId: "N/A",
    action: "Daily revenue reset by Admin",
  });
  writeStore(db);
  res.json({ dailyRevenue: 0, date: today });
});

app.post("/api/billing/reset-monthly", requireRole(["ADMIN"]), (req, res) => {
  const db = readStore();
  db.billing.transactions = db.billing.transactions.filter((t) => !String(t.period || "").toLowerCase().includes("april"));
  db.activityLogs.unshift({
    id: Date.now(),
    timestamp: new Date().toISOString().replace("T", " ").slice(0, 19),
    type: "system",
    user: "Admin",
    userId: "ADMIN",
    role: "Admin",
    zone: "N/A",
    gate: "N/A",
    vehicleId: "N/A",
    action: "Monthly revenue reset by Admin",
  });
  writeStore(db);
  res.json({ message: "Monthly revenue has been reset" });
});

app.get("/api/billing/transactions", (req, res) => {
  const db = readStore();
  const q = String(req.query.q || "").toLowerCase();
  const items = q
    ? db.billing.transactions.filter((t) => [t.id, t.userId, t.userName, t.period, t.status].join(" ").toLowerCase().includes(q))
    : db.billing.transactions;
  res.json({ items, total: items.length });
});

app.post("/api/billing/run-cycle", requireRole(["ADMIN", "OPERATOR"]), (req, res) => {
  const db = readStore();
  const learners = db.users.filter((u) => ["Student", "Graduate", "Doctoral"].includes(u.role));
  const monthlyFee = db.billing.pricingPlans.find((p) => p.category === "Students")?.monthly || 150000;
  const created = learners.map((u) => ({
    id: makeId("TXN-CYCLE"),
    userId: u.id,
    userName: u.name,
    type: "Monthly Parking",
    amount: monthlyFee,
    period: req.body.period || "Current Month",
    status: "Pending",
    date: new Date().toISOString().replace("T", " ").slice(0, 16),
    method: "BKPay",
  }));
  db.billing.transactions.unshift(...created);
  db.activityLogs.unshift({
    id: Date.now(),
    timestamp: new Date().toISOString().replace("T", " ").slice(0, 19),
    type: "system",
    user: "System",
    userId: "SYSTEM",
    role: "System",
    zone: "N/A",
    gate: "N/A",
    vehicleId: "N/A",
    action: `Billing cycle executed for ${learners.length} learners`,
  });
  writeStore(db);
  res.json({ createdInvoices: created.length, sample: created.slice(0, 3) });
});

app.post("/api/billing/calculate", (req, res) => {
    const { entryTime, exitTime, userType } = req.body;
  if (!entryTime || !exitTime) return res.status(400).json({ message: "entryTime and exitTime are required" });
  const totalFee = calculateFee(entryTime, exitTime, userType || "Visitor");
  res.json({ amount: totalFee, status: "Pending", method: "BKPay" });
});

app.post("/api/payments/:transactionId/request", (req, res) => {
  const db = readStore();
  const txn = db.billing.transactions.find((t) => t.id === req.params.transactionId);
  if (!txn) return res.status(404).json({ message: "Transaction not found" });
  txn.status = "Paid";
  txn.method = "BKPay";
  writeStore(db);
  res.json({ transactionId: txn.id, bkpayRef: makeId("BKPAY"), status: "SUCCESS" });
});

app.post("/api/payments/bkpay/webhook", (req, res) => {
  const { transactionId, paymentStatus = "SUCCESS" } = req.body;
  if (!transactionId) return res.status(400).json({ message: "transactionId is required" });
  const db = readStore();
  const txn = db.billing.transactions.find((t) => t.id === transactionId);
  if (!txn) return res.status(404).json({ message: "Transaction not found" });
  txn.status = paymentStatus === "SUCCESS" ? "Paid" : "Overdue";
  txn.method = "BKPay";
  writeStore(db);
  res.json({ ok: true, transactionId, status: txn.status });
});

app.get("/api/activity-logs", (req, res) => {
  const db = readStore();
  const q = String(req.query.q || "").toLowerCase();
  const items = q
    ? db.activityLogs.filter((log) => JSON.stringify(log).toLowerCase().includes(q))
    : db.activityLogs;
  res.json({ items, total: items.length });
});

app.delete("/api/activity-logs/:id", requireRole(["ADMIN"]), (req, res) => {
  const db = readStore();
  const id = req.params.id;
  const index = db.activityLogs.findIndex((log) => String(log.id) === String(id));
  if (index === -1) return res.status(404).json({ message: "Log entry not found" });
  const [removed] = db.activityLogs.splice(index, 1);
  writeStore(db);
  res.json({ deleted: removed.id });
});

app.use((err, req, res, next) => {
  res.status(500).json({ message: "Internal server error", detail: err.message });
});

app.listen(PORT, () => {
  console.log(`SPMS backend running at http://localhost:${PORT}`);
});