const express = require("express");
const cors = require("cors");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const { initStore, readStore, writeStore } = require("./data/store");
const authRoutes = require("./routes/auth");
const { initializeSchedules } = require("./jobs/dataSyncJob");

const app = express();
const PORT = Number(process.env.PORT || 5000);
const JWT_SECRET = process.env.JWT_SECRET || "spms-secret-key-change-in-production";
const JWT_EXPIRY = process.env.JWT_EXPIRY || "8h";

initStore();
app.use(cors());
app.use(express.json());

// ─── Helpers ────────────────────────────────────────────────────────────────

function makeId(prefix) {
  return `${prefix}-${crypto.randomUUID().slice(0, 8)}`;
}

function getCurrentDateString() {
  return new Date().toISOString().slice(0, 10);
}

function calculateFee(entryTime, exitTime, role, db) {
  const durationHours = Math.max(1, Math.ceil((new Date(exitTime) - new Date(entryTime)) / 36e5));
  const normalizedRole = String(role || "Visitor").toLowerCase();
  const plans = db.billing.pricingPlans || [];
  let rate = 10000;

  if (normalizedRole.includes("student") || normalizedRole.includes("graduate") || normalizedRole.includes("doctoral")) {
    rate = plans.find((p) => p.category === "Students")?.hourly || 5000;
  } else if (normalizedRole.includes("staff")) {
    rate = plans.find((p) => p.category === "Staff")?.hourly || 4000;
  } else if (normalizedRole.includes("faculty")) {
    rate = plans.find((p) => p.category === "Faculty")?.hourly || 0;
  } else {
    rate = plans.find((p) => p.category === "Visitors")?.hourly || 10000;
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
  const sorted = [...zones].sort((a, b) => a.occupied / a.total - b.occupied / b.total);
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

// ─── JWT Middleware ──────────────────────────────────────────────────────────

/**
 * Xác thực JWT từ header Authorization: Bearer <token>
 * Sau khi xác thực, gắn req.user = { userId, role, name }
 */
function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Access denied: no token provided" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // { userId, role, name, iat, exp }
    req.actorRole = decoded.role; // tương thích với requireRole
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token expired, please login again" });
    }
    return res.status(403).json({ message: "Invalid token" });
  }
}

/**
 * Kiểm tra role sau khi đã xác thực JWT
 */
function requireRole(roles) {
  return (req, res, next) => {
    const role = req.actorRole || req.user?.role;
    if (!role || !roles.includes(role)) {
      return res.status(403).json({ message: "Forbidden: insufficient role", required: roles, current: role });
    }
    next();
  };
}

// Mount routes từ auth.js (nếu có thêm route khác trong file đó)
app.use("/api/auth", authRoutes);

// Khởi động data sync
initializeSchedules();

// ─── Public Routes ───────────────────────────────────────────────────────────

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", service: "spms-backend", timestamp: new Date().toISOString() });
});

// Login — tạo JWT thật thay vì randomUUID
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

  const actorRole =
    user.role === "Admin" ? "ADMIN"
    : user.role === "Faculty" || user.role === "Staff" ? "OPERATOR"
    : "END_USER";

  const token = jwt.sign(
    { userId: user.id, role: actorRole, name: user.name },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRY }
  );

  return res.json({
    token,
    user: { ...user, password: undefined },
    actorRole,
  });
});

// Register — public, không cần token
app.post("/api/auth/register", (req, res) => {
  const { studentId, password, name, role = "Student", program = "N/A" } = req.body;
  if (!studentId || !password || !name) {
    return res.status(400).json({ message: "studentId, password, name are required" });
  }

  const db = readStore();
  ensureBaselineData(db);

  if (db.users.some((u) => u.id === studentId)) {
    return res.status(409).json({ message: "Account already exists" });
  }

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

// Logout — client tự xóa token, server chỉ confirm
app.post("/api/auth/logout", (req, res) => {
  res.json({ message: "Logged out" });
});

// ─── Protected Routes ────────────────────────────────────────────────────────

// /me — trả về đúng user đang đăng nhập từ JWT
app.get("/api/auth/me", authenticateToken, (req, res) => {
  const db = readStore();
  const user = db.users.find((u) => u.id === req.user.userId);
  if (!user) return res.status(404).json({ message: "User not found" });
  res.json({ ...user, password: undefined });
});

app.get("/api/integrations/sso/status", authenticateToken, (req, res) => {
  res.json({ service: "HCMUT_SSO", status: "connected", checkedAt: new Date().toISOString() });
});

app.get("/api/integrations/datacore/status", authenticateToken, (req, res) => {
  const db = readStore();
  res.json({
    service: "HCMUT_DATACORE",
    mode: "read-only",
    status: "synced",
    syncedUsers: db.users.length,
    lastSyncAt: db.metadata?.updatedAt || new Date().toISOString(),
  });
});

app.post("/api/integrations/datacore/sync", authenticateToken, requireRole(["ADMIN"]), (req, res) => {
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

app.get("/api/dashboard/summary", authenticateToken, (req, res) => {
  const db = readStore();
  res.json(getDashboardSummary(db));
});

app.get("/api/analytics", authenticateToken, (req, res) => {
  const db = readStore();
  res.json(db.analytics);
});

app.get("/api/users", authenticateToken, requireRole(["ADMIN", "OPERATOR"]), (req, res) => {
  const db = readStore();
  const q = String(req.query.q || "").toLowerCase();
  const users = q
    ? db.users.filter((u) => [u.id, u.name, u.program, u.role].join(" ").toLowerCase().includes(q))
    : db.users;
  res.json({ items: users.map((u) => ({ ...u, password: undefined })), total: users.length });
});

app.patch("/api/users/:id/role", authenticateToken, requireRole(["ADMIN"]), (req, res) => {
  const db = readStore();
  const user = db.users.find((u) => u.id === req.params.id);
  if (!user) return res.status(404).json({ message: "User not found" });
  user.role = req.body.role || user.role;
  writeStore(db);
  res.json({ ...user, password: undefined });
});

app.get("/api/admin/pricing-policies", authenticateToken, requireRole(["ADMIN", "OPERATOR"]), (req, res) => {
  const db = readStore();
  res.json(db.billing.pricingPlans);
});

app.patch("/api/admin/pricing-policies/:category", authenticateToken, requireRole(["ADMIN"]), (req, res) => {
  const db = readStore();
  const category = req.params.category.toLowerCase();
  const policy = db.billing.pricingPlans.find((p) => String(p.category).toLowerCase() === category);
  if (!policy) return res.status(404).json({ message: "Policy not found" });
  Object.assign(policy, req.body);
  db.activityLogs.unshift({
    id: Date.now(),
    timestamp: new Date().toISOString().replace("T", " ").slice(0, 19),
    type: "system",
    user: req.user.name || "Admin",
    userId: req.user.userId,
    role: "Admin",
    zone: "N/A",
    gate: "N/A",
    vehicleId: "N/A",
    action: `Pricing policy updated: ${policy.category}`,
  });
  writeStore(db);
  res.json(policy);
});

// ─── Parking Routes ──────────────────────────────────────────────────────────

app.get("/api/parking/slots/all", authenticateToken, (req, res) => {
  const db = readStore();
  ensureBaselineData(db);
  const allZonesData = {};
  const zones = ["A", "B", "C", "D", "E"];

  zones.forEach((zoneId) => {
    const totalSlots = 100;
    const occupiedSlots = db.slotAssignments[zoneId] || [];
    allZonesData[zoneId] = Array.from({ length: totalSlots }, (_, i) => {
      const slotId = `${zoneId}-${i + 1}`;
      return { id: slotId, status: occupiedSlots.includes(slotId) ? "occupied" : "available" };
    });
  });

  res.json(allZonesData);
});

app.get("/api/parking/slots/:zoneId", authenticateToken, (req, res) => {
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

app.get("/api/parking/zones", authenticateToken, (req, res) => {
  const db = readStore();
  const zones = db.zones.map((z) => ({
    ...z,
    available: z.total - z.occupied,
    state: z.occupied / z.total >= 0.95 ? "full" : z.occupied / z.total >= 0.85 ? "nearly_full" : "available",
  }));
  res.json(zones);
});

app.get("/api/parking/sessions/active", authenticateToken, (req, res) => {
  const db = readStore();
  res.json(db.sessions.filter((s) => s.status === "ACTIVE"));
});

app.get("/api/parking/sessions", authenticateToken, (req, res) => {
  const db = readStore();
  res.json(db.sessions);
});

app.post("/api/parking/sessions/entry", authenticateToken, requireRole(["ADMIN", "OPERATOR"]), (req, res) => {
  const { userId, userName, userType, zoneId = "E", slotId, gate = "Unknown", vehicleId = "N/A", method = "CARD" } = req.body;
  const db = readStore();
  ensureBaselineData(db);

  const zone = db.zones.find((z) => z.id === zoneId);
  if (!zone) return res.status(400).json({ message: "Invalid zoneId" });
  if (zone.occupied >= zone.total) return res.status(409).json({ message: "Zone is full" });
  if (!db.slotAssignments) db.slotAssignments = {};
  if (!db.slotAssignments[zoneId]) db.slotAssignments[zoneId] = [];
  if (slotId && db.slotAssignments[zoneId].includes(slotId)) {
    return res.status(409).json({ message: `Slot ${slotId} is already occupied` });
  }

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

app.post("/api/parking/sessions/:id/exit", authenticateToken, requireRole(["ADMIN", "OPERATOR"]), (req, res) => {
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
    db.slotAssignments[session.zoneId] = (db.slotAssignments[session.zoneId] || []).filter((id) => id !== session.slotId);
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

app.post("/api/parking/tickets/issue", authenticateToken, requireRole(["ADMIN", "OPERATOR"]), (req, res) => {
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

app.get("/api/parking/tickets", authenticateToken, (req, res) => {
  const db = readStore();
  res.json(db.tickets);
});

app.post("/api/parking/tickets/:ticketNo/close", authenticateToken, requireRole(["ADMIN", "OPERATOR"]), (req, res) => {
  const db = readStore();
  const ticket = db.tickets.find((t) => t.ticketNo === req.params.ticketNo);
  if (!ticket) return res.status(404).json({ message: "Ticket not found" });
  ticket.status = "CLOSED";
  writeStore(db);
  res.json(ticket);
});

app.get("/api/parking/guidance", authenticateToken, (req, res) => {
  const db = readStore();
  res.json(generateGuidance(db.zones));
});

// ─── IoT Routes ──────────────────────────────────────────────────────────────

app.get("/api/iot/status", authenticateToken, (req, res) => {
  const db = readStore();
  const sensors = db.iot.sensors;

  const gateways = db.zones.map((zone) => {
    const zoneSensors = sensors.filter((s) => s.zone === zone.id);
    const online = zoneSensors.filter((s) => s.status === "online").length || zone.total;
    return {
      id: `GW-${zone.id}`,
      name: `Gateway Zone ${zone.id}`,
      zone: zone.id,
      status: online > 0 ? "online" : "offline",
      sensors: zone.total,
      sensorsOnline: Math.max(0, zone.total - zone.occupied),
      uptime: "99.9%",
      signalStrength: 90 + Math.floor(Math.random() * 10),
      lastUpdate: "just now",
    };
  });

  res.json({
    totalSensors: db.zones.reduce((sum, z) => sum + z.total, 0),
    online: gateways.filter((g) => g.status === "online").length,
    offline: gateways.filter((g) => g.status === "offline").length,
    maintenance: 0,
    gateways,
  });
});

app.get("/api/iot/sensors", authenticateToken, (req, res) => {
  const db = readStore();
  const sensors = [];
  db.zones.forEach((zone) => {
    for (let i = 1; i <= zone.total; i++) {
      const slotId = `${zone.id}-${i}`;
      const slotAssignment = db.slotAssignments[slotId];
      sensors.push({
        id: `S-${slotId}`,
        zone: zone.id,
        slot: slotId,
        status: "online",
        battery: 85 + Math.floor(Math.random() * 15),
        signal: 80 + Math.floor(Math.random() * 20),
        lastUpdate: slotAssignment ? "occupied" : "available",
        occupied: !!slotAssignment,
      });
    }
  });
  res.json(sensors);
});

app.get("/api/iot/signage", authenticateToken, (req, res) => {
  const db = readStore();
  res.json(db.iot.signage);
});

app.post("/api/iot/events/heartbeat", authenticateToken, (req, res) => {
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

app.post("/api/iot/events/slot-occupancy", authenticateToken, (req, res) => {
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

// ─── Billing Routes ───────────────────────────────────────────────────────────

app.get("/api/billing/overview", authenticateToken, requireRole(["ADMIN", "OPERATOR"]), (req, res) => {
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

app.post("/api/billing/reset-daily", authenticateToken, requireRole(["ADMIN"]), (req, res) => {
  const db = readStore();
  const today = getCurrentDateString();
  db.billing.dailyRevenueDate = today;
  db.billing.dailyRevenue = 0;
  db.activityLogs.unshift({
    id: Date.now(),
    timestamp: new Date().toISOString().replace("T", " ").slice(0, 19),
    type: "system",
    user: req.user.name || "Admin",
    userId: req.user.userId,
    role: "Admin",
    zone: "N/A",
    gate: "N/A",
    vehicleId: "N/A",
    action: "Daily revenue reset by Admin",
  });
  writeStore(db);
  res.json({ dailyRevenue: 0, date: today });
});

app.post("/api/billing/reset-monthly", authenticateToken, requireRole(["ADMIN"]), (req, res) => {
  const db = readStore();
  db.billing.transactions = db.billing.transactions.filter(
    (t) => !String(t.period || "").toLowerCase().includes("april")
  );
  db.activityLogs.unshift({
    id: Date.now(),
    timestamp: new Date().toISOString().replace("T", " ").slice(0, 19),
    type: "system",
    user: req.user.name || "Admin",
    userId: req.user.userId,
    role: "Admin",
    zone: "N/A",
    gate: "N/A",
    vehicleId: "N/A",
    action: "Monthly revenue reset by Admin",
  });
  writeStore(db);
  res.json({ message: "Monthly revenue has been reset" });
});

app.get("/api/billing/transactions", authenticateToken, requireRole(["ADMIN", "OPERATOR"]), (req, res) => {
  const db = readStore();
  const q = String(req.query.q || "").toLowerCase();
  const items = q
    ? db.billing.transactions.filter((t) => [t.id, t.userId, t.userName, t.period, t.status].join(" ").toLowerCase().includes(q))
    : db.billing.transactions;
  res.json({ items, total: items.length });
});

app.post("/api/billing/run-cycle", authenticateToken, requireRole(["ADMIN", "OPERATOR"]), (req, res) => {
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
    user: req.user.name || "System",
    userId: req.user.userId,
    role: "System",
    zone: "N/A",
    gate: "N/A",
    vehicleId: "N/A",
    action: `Billing cycle executed for ${learners.length} learners`,
  });
  writeStore(db);
  res.json({ createdInvoices: created.length, sample: created.slice(0, 3) });
});

app.post("/api/billing/calculate", authenticateToken, (req, res) => {
  const { entryTime, exitTime, userType } = req.body;
  if (!entryTime || !exitTime) return res.status(400).json({ message: "entryTime and exitTime are required" });
  const db = readStore();
  const totalFee = calculateFee(entryTime, exitTime, userType || "Visitor", db);
  res.json({ amount: totalFee, status: "Pending", method: "BKPay" });
});

// ─── Payment Routes ───────────────────────────────────────────────────────────

app.post("/api/payments/:transactionId/request", authenticateToken, (req, res) => {
  const db = readStore();
  const txn = db.billing.transactions.find((t) => t.id === req.params.transactionId);
  if (!txn) return res.status(404).json({ message: "Transaction not found" });
  txn.status = "Paid";
  txn.method = "BKPay";
  writeStore(db);
  res.json({ transactionId: txn.id, bkpayRef: makeId("BKPAY"), status: "SUCCESS" });
});

// Webhook từ BKPay — không cần JWT (gọi từ bên ngoài)
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

// ─── Activity Logs ────────────────────────────────────────────────────────────

app.get("/api/activity-logs", authenticateToken, requireRole(["ADMIN", "OPERATOR"]), (req, res) => {
  const db = readStore();
  const q = String(req.query.q || "").toLowerCase();
  const items = q
    ? db.activityLogs.filter((log) => JSON.stringify(log).toLowerCase().includes(q))
    : db.activityLogs;
  res.json({ items, total: items.length });
});

app.delete("/api/activity-logs/:id", authenticateToken, requireRole(["ADMIN"]), (req, res) => {
  const db = readStore();
  const id = req.params.id;
  const index = db.activityLogs.findIndex((log) => String(log.id) === String(id));
  if (index === -1) return res.status(404).json({ message: "Log entry not found" });
  const [removed] = db.activityLogs.splice(index, 1);
  writeStore(db);
  res.json({ deleted: removed.id });
});

// ─── Error Handler ────────────────────────────────────────────────────────────

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Internal server error", detail: err.message });
});

app.listen(PORT, () => {
  console.log(`SPMS backend running at http://localhost:${PORT}`);
});