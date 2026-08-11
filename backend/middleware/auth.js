const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Akses ditolak. Token tidak ditemukan." });
  }

  const token = authHeader.split(" ")[1];
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    console.error("FATAL: JWT_SECRET environment variable is not set!");
    return res.status(500).json({ error: "Konfigurasi server error." });
  }

  try {
    const decoded = jwt.verify(token, secret);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Token tidak valid atau telah kadaluwarsa." });
  }
};

const requireRole = (...roles) => {
  return (req, res, next) => {
    const allowedUpper = roles.map((r) => r.toUpperCase());
    const userRoleUpper = req.user?.role ? req.user.role.toUpperCase() : "";
    if (!req.user || !allowedUpper.includes(userRoleUpper)) {
      return res.status(403).json({ error: "Akses ditolak. Anda tidak memiliki izin." });
    }
    next();
  };
};

module.exports = { authMiddleware, requireRole };
