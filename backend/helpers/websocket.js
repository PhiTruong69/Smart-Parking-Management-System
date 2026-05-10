/**
 * WebSocket server — push zone status tới Electronic Display Board
 * và bất kỳ client nào subscribe (frontend dashboard, signage firmware).
 *
 * Theo đề: Display Board kết nối WebSocket, nhận push sau mỗi entry/exit.
 * Message types:
 *   - ZONE_UPDATE  : trạng thái tất cả zones (broadcast sau entry/exit)
 *   - GUIDANCE     : gợi ý điều hướng (zone nào full, đi đâu thay thế)
 *   - PING/PONG    : keepalive
 */

const { WebSocketServer } = require("ws");

let wss = null;

/**
 * Khởi tạo WebSocket server gắn vào HTTP server của Express
 */
function initWebSocket(httpServer) {
  wss = new WebSocketServer({ server: httpServer, path: "/ws" });

  wss.on("connection", (ws, req) => {
    console.log(`[WS] Client connected: ${req.socket.remoteAddress}`);

    // Gửi ping mỗi 30s để giữ kết nối
    const pingInterval = setInterval(() => {
      if (ws.readyState === ws.OPEN) {
        ws.send(JSON.stringify({ type: "PING", ts: Date.now() }));
      }
    }, 30000);

    ws.on("message", (msg) => {
      try {
        const data = JSON.parse(msg);
        if (data.type === "PONG") return; // client trả lời ping
      } catch (_) {}
    });

    ws.on("close", () => {
      clearInterval(pingInterval);
      console.log("[WS] Client disconnected");
    });

    ws.on("error", (err) => {
      console.error("[WS] Error:", err.message);
    });
  });

  console.log("[WS] WebSocket server initialized at ws://localhost/ws");
  return wss;
}

/**
 * Broadcast message tới tất cả clients đang kết nối
 */
function broadcast(payload) {
  if (!wss) return;
  const msg = JSON.stringify(payload);
  wss.clients.forEach((client) => {
    if (client.readyState === 1) { // OPEN
      client.send(msg);
    }
  });
}

/**
 * Push zone update sau mỗi entry/exit — gọi từ route handler
 */
function pushZoneUpdate(zones) {
  broadcast({
    type: "ZONE_UPDATE",
    ts: Date.now(),
    zones: zones.map((z) => ({
      id: z.id,
      name: z.name,
      total: z.total,
      occupied: z.occupied,
      available: z.total - z.occupied,
      state:
        z.occupied / z.total >= 0.95 ? "full" :
        z.occupied / z.total >= 0.85 ? "nearly_full" : "available",
    })),
  });
}

/**
 * Push guidance (điều hướng) tới Display Board
 */
function pushGuidance(zones) {
  const sorted = [...zones].sort((a, b) => a.occupied / a.total - b.occupied / b.total);
  const guidance = zones.map((z) => {
    const ratio = z.occupied / z.total;
    const state = ratio >= 0.95 ? "full" : ratio >= 0.85 ? "nearly_full" : "available";
    const alt = state === "full" ? sorted.find((x) => x.id !== z.id && x.occupied < x.total) : null;
    return {
      zoneId: z.id,
      state,
      message:
        state === "full" ? `Zone ${z.id}: Đầy → Đến Zone ${alt?.id || "N/A"}`
        : state === "nearly_full" ? `Zone ${z.id}: Gần đầy`
        : `Zone ${z.id}: Còn chỗ`,
      alternativeZoneId: alt?.id || null,
    };
  });

  broadcast({ type: "GUIDANCE", ts: Date.now(), guidance });
}

function getConnectedClients() {
  return wss ? wss.clients.size : 0;
}

module.exports = { initWebSocket, pushZoneUpdate, pushGuidance, getConnectedClients };