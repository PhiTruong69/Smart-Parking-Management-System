const fs = require("fs");
const path = require("path");
const seed = require("./seed");

const DATA_FILE = path.join(__dirname, "db.json");

console.log("🔄 Resetting database to initial state...");

try {
  fs.writeFileSync(DATA_FILE, JSON.stringify(seed, null, 2), "utf-8");
  console.log("✅ Database reset successfully!");
  console.log("📁 Data file: " + DATA_FILE);
  console.log("📊 Initial data loaded from seed.js");
} catch (error) {
  console.error("❌ Error resetting database:", error.message);
  process.exit(1);
}
