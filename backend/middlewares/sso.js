/**
 * HCMUT_SSO Simulation Middleware
 * Giả lập xác thực SSO cho university members khi vào/ra bãi xe.
 *
 * Trong thực tế: gọi OAuth2 endpoint của HCMUT_SSO
 * Ở đây: lookup db.users với điều kiện ssoVerified + status Active
 */

const { readStore } = require("../data/store");

// Các role được coi là "University Member" — cần qua SSO
const SSO_REQUIRED_ROLES = ["Student", "Graduate", "Doctoral", "Faculty", "Staff"];

// Role nào bị block hoàn toàn (ví dụ tài khoản bị suspended)
const BLOCKED_STATUSES = ["Suspended", "Inactive"];

/**
 * Giả lập gọi HCMUT_SSO để xác thực cardID (= studentId / staffId).
 * Trả về { success, user, reason }
 */
function simulateSSO(cardId, db) {
  const user = db.users.find((u) => u.id === cardId);

  if (!user) {
    return { success: false, reason: "SSO_USER_NOT_FOUND" };
  }

  if (BLOCKED_STATUSES.includes(user.status)) {
    return { success: false, reason: "SSO_ACCOUNT_SUSPENDED" };
  }

  // Visitor không qua SSO — xử lý riêng bằng temporary ticket
  if (!SSO_REQUIRED_ROLES.includes(user.role)) {
    return { success: false, reason: "SSO_NOT_APPLICABLE" };
  }

  return { success: true, user };
}

/**
 * Middleware: xác thực SSO trước khi tạo parking session cho university member.
 *
 * Đọc `userId` từ req.body:
 *   - Nếu không có userId → coi là Visitor, skip SSO, next()
 *   - Nếu có userId → bắt buộc pass SSO, fail thì 403
 *
 * Sau khi pass, gắn req.ssoUser = user object để route handler dùng.
 */
function requireSSOForMember(req, res, next) {
  const { userId } = req.body;

  // Không có userId = Visitor flow → không cần SSO
  if (!userId) {
    req.ssoUser = null;
    req.isVisitor = true;
    return next();
  }

  const db = readStore();
  const result = simulateSSO(userId, db);

  if (result.reason === "SSO_NOT_APPLICABLE") {
    // userId được truyền nhưng role là Visitor/Unknown → vẫn cho qua
    req.ssoUser = null;
    req.isVisitor = true;
    return next();
  }

  if (!result.success) {
    // Log thất bại vào activityLogs
    db.activityLogs.unshift({
      id: Date.now(),
      timestamp: new Date().toISOString().replace("T", " ").slice(0, 19),
      type: "auth_failure",
      user: userId,
      userId,
      role: "Unknown",
      zone: req.body.zoneId ? `Zone ${req.body.zoneId}` : "N/A",
      gate: req.body.gate || "N/A",
      vehicleId: req.body.vehicleId || "N/A",
      action: `SSO authentication failed: ${result.reason}`,
    });

    const { writeStore } = require("../data/store");
    writeStore(db);

    return res.status(403).json({
      message: "SSO authentication failed",
      reason: result.reason,
      // Gợi ý frontend hiển thị đúng thông báo
      displayMessage:
        result.reason === "SSO_USER_NOT_FOUND"
          ? "Thẻ không hợp lệ hoặc không tồn tại trong hệ thống HCMUT."
          : "Tài khoản đã bị tạm khóa. Vui lòng liên hệ nhân viên.",
    });
  }

  // SSO pass — gắn user vào request
  req.ssoUser = result.user;
  req.isVisitor = false;
  next();
}

/**
 * Utility: lấy thông tin SSO status cho integration endpoint
 */
function getSSOStatus(userId, db) {
  if (!userId) return { checked: false };
  const result = simulateSSO(userId, db);
  return {
    checked: true,
    userId,
    ssoPass: result.success,
    reason: result.reason || null,
    role: result.user?.role || null,
  };
}

module.exports = { requireSSOForMember, simulateSSO, getSSOStatus, SSO_REQUIRED_ROLES };