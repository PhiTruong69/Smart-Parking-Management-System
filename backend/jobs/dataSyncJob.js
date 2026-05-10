/**
 * Data Sync Job
 * Giả lập đồng bộ dữ liệu từ HCMUT_DATACORE mỗi 30 phút.
 * Trong thực tế: gọi REST API của DATACORE, lấy danh sách users/roles mới nhất.
 * Ở đây: dùng mock fixture, merge vào db.users.
 */

const { readStore, writeStore } = require("../data/store");

// Mock DATACORE fixture — giả lập dữ liệu trả về từ HCMUT_DATACORE REST API
// Trong thực tế thay bằng: const res = await axios.get(process.env.DATACORE_URL)
const DATACORE_MOCK = [
  { id: "1952001", name: "Nguyen Van A",  role: "Student",  program: "Computer Science",      status: "Active" },
  { id: "1952045", name: "Tran Thi B",   role: "Student",  program: "Electrical Engineering", status: "Active" },
  { id: "F2001",   name: "Le Van C",     role: "Faculty",  program: "Mathematics Department", status: "Active" },
  { id: "S1023",   name: "Hoang Van E",  role: "Staff",    program: "Administration",         status: "Active" },
  { id: "2152078", name: "Vo Thi F",     role: "Graduate", program: "Civil Engineering",      status: "Active" },
  { id: "D3001",   name: "Bui Thi H",   role: "Doctoral", program: "Chemical Engineering",   status: "Active" },
  // Thêm user mới từ DATACORE để test sync
  { id: "1952099", name: "Pham Van Sync", role: "Student", program: "Information Systems",    status: "Active" },
];

/**
 * Sync logic:
 * - Nếu user đã tồn tại trong db → cập nhật role, program, status (không đụng password/balance)
 * - Nếu user mới từ DATACORE → thêm vào db với default password
 * Trả về { updated, added, total }
 */
function syncFromDataCore() {
  const db = readStore();
  if (!Array.isArray(db.users)) db.users = [];

  let updated = 0;
  let added = 0;

  DATACORE_MOCK.forEach((dcUser) => {
    const existing = db.users.find((u) => u.id === dcUser.id);
    if (existing) {
      // Chỉ sync các field từ DATACORE, giữ nguyên password/balance/entryCount
      const changed =
        existing.name !== dcUser.name ||
        existing.role !== dcUser.role ||
        existing.program !== dcUser.program ||
        existing.status !== dcUser.status;

      if (changed) {
        existing.name = dcUser.name;
        existing.role = dcUser.role;
        existing.program = dcUser.program;
        existing.status = dcUser.status;
        updated++;
      }
    } else {
      // User mới từ DATACORE
      db.users.push({
        id: dcUser.id,
        password: "123456",
        name: dcUser.name,
        role: dcUser.role,
        program: dcUser.program,
        status: dcUser.status,
        parkingPass: dcUser.role === "Faculty" ? "Reserved" : "Monthly",
        balance: 0,
        entryCount: 0,
        syncedFromDataCore: true,
      });
      added++;
    }
  });

  // Ghi log sync vào activityLogs
  if (!Array.isArray(db.activityLogs)) db.activityLogs = [];
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
    action: `DATACORE sync completed: ${added} added, ${updated} updated (total DATACORE records: ${DATACORE_MOCK.length})`,
  });

  // Cập nhật metadata
  if (!db.metadata) db.metadata = {};
  db.metadata.updatedAt = new Date().toISOString();
  db.metadata.lastDataCoreSync = new Date().toISOString();
  db.metadata.lastSyncStats = { added, updated, total: DATACORE_MOCK.length };

  writeStore(db);

  return { added, updated, total: DATACORE_MOCK.length };
}

const SYNC_INTERVAL_MS = 30 * 60 * 1000; // 30 phút

const initializeSchedules = () => {
  console.log("[Job] Initializing Data Sync Schedules...");

  // Chạy lần đầu ngay khi server start
  try {
    const result = syncFromDataCore();
    console.log(`[Job] Initial DATACORE sync: +${result.added} added, ~${result.updated} updated`);
  } catch (err) {
    console.error("[Job] Initial sync failed:", err.message);
  }

  // Sau đó chạy định kỳ mỗi 30 phút
  setInterval(() => {
    const now = new Date();
    console.log(`[${now.toLocaleString()}] Running scheduled DATACORE sync...`);
    try {
      const result = syncFromDataCore();
      console.log(`[Job] Sync done: +${result.added} added, ~${result.updated} updated`);
    } catch (err) {
      console.error("[Job] Sync failed:", err.message);
    }
  }, SYNC_INTERVAL_MS);

  console.log("[Job] Schedules initialized (interval: 30min).");
};

module.exports = { initializeSchedules, syncFromDataCore };