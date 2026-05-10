/**
 * Analytics helpers — tính toán từ db.sessions và db.billing.transactions thật
 */

/**
 * Daily occupancy pattern: đếm số session active theo từng giờ trong ngày hôm nay
 */
function computeDailyOccupancy(sessions) {
  const hours = Array.from({ length: 24 }, (_, i) => ({
    time: `${String(i).padStart(2, "0")}:00`,
    count: 0,
  }));

  const today = new Date().toISOString().slice(0, 10);

  sessions.forEach((s) => {
    const entry = new Date(s.entryAt);
    if (entry.toISOString().slice(0, 10) !== today) return;

    const exit = s.exitAt ? new Date(s.exitAt) : new Date();
    const startH = entry.getHours();
    const endH = exit.getHours();

    for (let h = startH; h <= Math.min(endH, 23); h++) {
      hours[h].count += 1;
    }
  });

  return hours.filter((h) => h.count > 0 || parseInt(h.time) >= 6 && parseInt(h.time) <= 22);
}

/**
 * Weekly revenue: tổng doanh thu theo ngày trong 7 ngày gần nhất
 */
function computeWeeklyRevenue(transactions) {
  const days = {};
  const now = new Date();

  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    days[key] = { day: d.toLocaleDateString("en-US", { weekday: "short" }), date: key, revenue: 0 };
  }

  transactions
    .filter((t) => t.status === "Paid")
    .forEach((t) => {
      const date = String(t.date || "").slice(0, 10);
      if (days[date]) days[date].revenue += t.amount;
    });

  return Object.values(days);
}

/**
 * Zone usage distribution: % usage theo zone
 */
function computeZoneDistribution(zones) {
  return zones.map((z) => ({
    zone: `Zone ${z.id}`,
    name: z.name,
    occupied: z.occupied,
    total: z.total,
    rate: z.total > 0 ? Math.round((z.occupied / z.total) * 100) : 0,
  }));
}

/**
 * User type distribution: đếm active sessions theo userType
 */
function computeUserTypeDistribution(sessions) {
  const active = sessions.filter((s) => s.status === "ACTIVE");
  const counts = {};
  active.forEach((s) => {
    const t = s.userType || "Unknown";
    counts[t] = (counts[t] || 0) + 1;
  });
  return Object.entries(counts).map(([type, count]) => ({ type, count }));
}

/**
 * Rush hour analysis: top 3 giờ cao điểm dựa trên lịch sử sessions
 */
function computeRushHours(sessions) {
  const hourCounts = Array(24).fill(0);
  sessions.forEach((s) => {
    const h = new Date(s.entryAt).getHours();
    if (!isNaN(h)) hourCounts[h] += 1;
  });
  return hourCounts
    .map((count, h) => ({ hour: `${String(h).padStart(2, "0")}:00`, entries: count }))
    .sort((a, b) => b.entries - a.entries)
    .slice(0, 5);
}

/**
 * Summary stats
 */
function computeSummaryStats(sessions, transactions, zones) {
  const totalSessions = sessions.length;
  const activeSessions = sessions.filter((s) => s.status === "ACTIVE").length;
  const closedSessions = sessions.filter((s) => s.status === "CLOSED");

  const avgDuration =
    closedSessions.length > 0
      ? Math.round(
          closedSessions.reduce((sum, s) => {
            const ms = new Date(s.exitAt) - new Date(s.entryAt);
            return sum + ms / 36e5;
          }, 0) / closedSessions.length
        )
      : 0;

  const totalRevenue = transactions
    .filter((t) => t.status === "Paid")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalSlots = zones.reduce((sum, z) => sum + z.total, 0);
  const totalOccupied = zones.reduce((sum, z) => sum + z.occupied, 0);
  const spaceUtilization = totalSlots > 0 ? Math.round((totalOccupied / totalSlots) * 100) : 0;

  const avgRevenue = closedSessions.length > 0 ? Math.round(totalRevenue / closedSessions.length) : 0;

  return {
    totalSessions,
    activeSessions,
    avgDurationHours: avgDuration,
    avgRevenuePerSession: avgRevenue,
    spaceUtilization,
    totalRevenue,
  };
}

/**
 * Entry point: tính toàn bộ analytics từ db
 */
function computeAnalytics(db) {
  const { sessions = [], billing = {}, zones = [] } = db;
  const transactions = billing.transactions || [];

  return {
    summary: computeSummaryStats(sessions, transactions, zones),
    dailyOccupancy: computeDailyOccupancy(sessions),
    weeklyRevenue: computeWeeklyRevenue(transactions),
    zoneDistribution: computeZoneDistribution(zones),
    userTypeDistribution: computeUserTypeDistribution(sessions),
    rushHours: computeRushHours(sessions),
    generatedAt: new Date().toISOString(),
  };
}

module.exports = { computeAnalytics };