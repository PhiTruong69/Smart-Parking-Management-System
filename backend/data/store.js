const fs = require("fs");
const path = require("path");
const seed = require("./seed");

const DATA_FILE = path.join(__dirname, "db.json");

function initStore() {
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(seed, null, 2), "utf-8");
  }
}

function readStore() {
  initStore();
  return JSON.parse(fs.readFileSync(DATA_FILE, "utf-8"));
}

function writeStore(data) {
  data.metadata = {
    ...(data.metadata || {}),
    updatedAt: new Date().toISOString(),
  };
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), "utf-8");
  return data;
}

module.exports = {
  initStore,
  readStore,
  writeStore,
};
