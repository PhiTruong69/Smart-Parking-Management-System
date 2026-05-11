const now = new Date("2026-04-21T09:00:00.000Z");

module.exports = {
  users: [
    { id: "admin", password: "admin123", name: "System Admin", role: "Admin", program: "IT Center", status: "Active", parkingPass: "Reserved", balance: 0, entryCount: 0 },
  ],
  zones: [
    { id: "A", name: "Zone A - Main Building", total: 30, occupied: 28 },
    { id: "B", name: "Zone B - Engineering", total: 24, occupied: 17 },
    { id: "C", name: "Zone C - Library", total: 20, occupied: 13 },
    { id: "D", name: "Zone D - Sports Center", total: 16, occupied: 7 },
    { id: "E", name: "Zone E - Visitor", total: 10, occupied: 4 },
  ],
  sessions: [],
  tickets: [],
  iot: {
    gateways: [
      { id: "GW-001", name: "Gateway Zone A", zone: "A", status: "online", sensors: 150, sensorsOnline: 148, uptime: "99.8%", signalStrength: 95, lastUpdate: "2 sec ago" },
      { id: "GW-002", name: "Gateway Zone B", zone: "B", status: "online", sensors: 120, sensorsOnline: 118, uptime: "99.5%", signalStrength: 92, lastUpdate: "3 sec ago" },
      { id: "GW-003", name: "Gateway Zone C", zone: "C", status: "online", sensors: 100, sensorsOnline: 99, uptime: "99.9%", signalStrength: 98, lastUpdate: "1 sec ago" },
      { id: "GW-004", name: "Gateway Zone D", zone: "D", status: "online", sensors: 80, sensorsOnline: 78, uptime: "98.7%", signalStrength: 88, lastUpdate: "4 sec ago" },
      { id: "GW-005", name: "Gateway Zone E", zone: "E", status: "warning", sensors: 50, sensorsOnline: 44, uptime: "95.2%", signalStrength: 65, lastUpdate: "15 sec ago" },
    ],
    sensors: [
      { id: "S-A-001", zone: "A", slot: "A-1", status: "online", battery: 85, signal: 92, lastUpdate: "2 sec ago" },
      { id: "S-A-023", zone: "A", slot: "A-23", status: "offline", battery: 0, signal: 0, lastUpdate: "2 hours ago" },
      { id: "S-B-015", zone: "B", slot: "B-15", status: "online", battery: 92, signal: 88, lastUpdate: "3 sec ago" },
      { id: "S-D-008", zone: "D", slot: "D-8", status: "maintenance", battery: 45, signal: 0, lastUpdate: "1 day ago" },
    ],
    signage: [
      { id: "SIGN-001", location: "Main Entrance", zone: "All", status: "online", message: "Zone A: Full • Zone B: Available", uptime: "99.9%" },
      { id: "SIGN-005", location: "Visitor Entrance", zone: "E", status: "offline", message: "N/A", uptime: "92.3%" },
    ],
  },
  billing: {
    pricingPlans: [
      { category: "Students", monthly: 150000, daily: 10000, hourly: 5000, description: "Undergraduate, Graduate, Doctoral candidates" },
      { category: "Faculty", monthly: 0, daily: 0, hourly: 0, description: "Reserved parking included" },
      { category: "Staff", monthly: 100000, daily: 8000, hourly: 4000, description: "Administration and support staff" },
      { category: "Visitors", monthly: null, daily: 50000, hourly: 10000, description: "Temporary access only" },
    ],
    transactions: [
      { id: "TXN-2026-001234", userId: "1952001", userName: "Nguyen Van A", type: "Monthly Parking", amount: 150000, period: "April 2026", status: "Paid", date: "2026-04-01 10:30", method: "BKPay" },
      { id: "TXN-2026-001235", userId: "1952045", userName: "Tran Thi B", type: "Monthly Parking", amount: 150000, period: "April 2026", status: "Pending", date: "2026-04-01 14:20", method: "BKPay" },
      { id: "TXN-2026-001238", userId: "1951234", userName: "Dang Van G", type: "Monthly Parking", amount: 150000, period: "March 2026", status: "Overdue", date: "2026-03-01 00:00", method: "BKPay" },
    ],
  },
  activityLogs: [
    { id: 1, timestamp: "2026-04-07 10:42:15", type: "entry", user: "Nguyen Van A", userId: "1952001", role: "Student", zone: "Zone B", gate: "Gate B1", vehicleId: "59A-12345", action: "Vehicle entered parking zone" },
    { id: 2, timestamp: "2026-04-07 10:38:42", type: "exit", user: "Tran Thi B", userId: "F2001", role: "Faculty", zone: "Zone A", gate: "Gate A2", vehicleId: "59B-67890", action: "Vehicle exited parking zone", duration: "3h 25m" },
    { id: 3, timestamp: "2026-04-07 10:35:18", type: "ticket", user: "Visitor", userId: "V-2345", role: "Visitor", zone: "Zone E", gate: "Gate E1", vehicleId: "N/A", action: "Temporary ticket issued" },
  ],
  analytics: {
    dailyOccupancy: [
      { time: "08:00", rate: 78 },
      { time: "12:00", rate: 72 },
      { time: "16:00", rate: 92 },
    ],
    weeklyRevenue: [
      { day: "Mon", revenue: 850000 },
      { day: "Tue", revenue: 920000 },
      { day: "Fri", revenue: 1100000 },
    ],
  },
  metadata: {
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
  },
};
