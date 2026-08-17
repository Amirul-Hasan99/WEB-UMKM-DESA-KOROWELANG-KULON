require("dotenv").config();

const http = require("http");
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to PostgreSQL via Drizzle
const { db } = require("./src/db");

// ============================================
// Security: Helmet HTTP Headers
// ============================================
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);

// ============================================
// Security: Rate Limiting
// ============================================
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Terlalu banyak permintaan. Silakan coba lagi nanti." },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Terlalu banyak percobaan login. Silakan coba lagi dalam 15 menit." },
});

app.use(generalLimiter);

// ============================================
// CORS Configuration
// ============================================
const allowedOrigins = [
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow all origins temporarily to prevent CORS issues in Vercel
      callback(null, true);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Body Parsing (5MB limit)
app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true, limit: "5mb" }));

// Static files for uploads
app.use("/uploads", express.static(path.join(__dirname, "public", "uploads")));

// ============================================
// Health Check (for Vercel & Monitoring)
// ============================================
app.get("/health", async (req, res) => {
  let dbStatus = "disconnected";
  try {
    if (db) {
      // Simple query to check connection
      await db.execute('SELECT 1');
      dbStatus = "connected";
    } else {
      dbStatus = "fallback (mockData)";
    }
  } catch (e) {
    dbStatus = "error";
  }

  res.json({
    status: "healthy",
    database: dbStatus,
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

// Root endpoint
app.get("/", (req, res) => {
  res.json({
    status: "online",
    message: "Portal UMKM Kutoharjo API Server (PostgreSQL + Vercel)",
  });
});

// ============================================
// API Routers
// ============================================
const authRoutes = require("./src/routes/authRoutes");
const adminRoutes = require("./src/routes/adminRoutes");
const superadminRoutes = require("./src/routes/superadminRoutes");
const uploadRoutes = require("./src/routes/uploadRoutes");
const exportRoutes = require("./src/routes/exportRoutes");
const publicRoutes = require("./src/routes/publicRoutes");

app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/public", publicRoutes);

// Admin / SuperAdmin paths 
// (Wait, frontend calls /api/umkm for admin creation, let's mount adminRoutes at /api instead of /api/admin so it maps perfectly to what frontend expects if it calls /api/umkm and /api/products)
app.use("/api", adminRoutes); 
app.use("/api/superadmin", superadminRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/export", exportRoutes);

// ============================================
// Global Error Handler
// ============================================
app.use((err, req, res, _next) => {
  console.error("❌ Unhandled error:", err);

  if (err.code === "LIMIT_FILE_SIZE") {
    return res.status(413).json({ error: "Ukuran file terlalu besar. Maksimal 5MB." });
  }

  if (err.message && err.message.includes("CORS")) {
    return res.status(403).json({ error: err.message });
  }

  if (err.name === "ZodError") {
    return res.status(400).json({
      error: "Validasi data gagal",
      details: err.errors,
    });
  }

  return res.status(500).json({
    error: process.env.NODE_ENV === "production"
      ? "Terjadi kesalahan pada server."
      : err.message || "Internal Server Error",
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Endpoint tidak ditemukan." });
});

// Start Server locally (skipped when running on Vercel or Vitest)
if (process.env.NODE_ENV !== "test" && !process.env.VERCEL) {
  const server = http.createServer(app);
  server.listen(PORT, () => {
    console.log(`🚀 Backend Server running at http://localhost:${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/health`);
  });
}

module.exports = app;
