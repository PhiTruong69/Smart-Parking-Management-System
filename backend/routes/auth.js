const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();

const SECRET_KEY = process.env.JWT_SECRET || 'spms-secret-key-change-in-production';
const TOKEN_EXPIRY = '8h'; // Token hết hạn sau 8 giờ

// Middleware xác thực JWT — dùng cho các route cần bảo vệ
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // "Bearer <token>"

  if (!token) {
    return res.status(401).json({ message: 'Access denied: no token provided' });
  }

  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    req.user = decoded; // { userId, role, iat, exp }
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired, please login again' });
    }
    return res.status(403).json({ message: 'Invalid token' });
  }
}

module.exports = router;
module.exports.authenticateToken = authenticateToken;