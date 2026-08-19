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
const { sql } = require("drizzle-orm");
const { syncAllSequences } = require("./src/db/syncSequences");

// Run automatic sequence synchronization in background
if (db) {
  syncAllSequences(db).catch(() => {});
}

// ============================================
// Security: Helmet HTTP Headers
// ============================================
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    contentSecurityPolicy: false,
  })
);

// ============================================
// Security: Rate Limiting
// ============================================
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Terlalu banyak permintaan. Silakan coba lagi nanti." },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Terlalu banyak percobaan login. Silakan coba lagi dalam 15 menit." },
});

app.use(generalLimiter);

// ============================================
// CORS Configuration
// ============================================
const allowedOrigins = [
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  "https://umkm-desa-korowelang-kulon.vercel.app",
  ...(process.env.FRONTEND_URL ? process.env.FRONTEND_URL.split(',').map((s) => s.trim()) : []),
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, curl, Postman)
      if (!origin) return callback(null, true);

      const normalizedOrigin = origin.replace(/\/$/, '');

      // Allow exact match or if origin is in allowedOrigins
      if (allowedOrigins.some((allowed) => allowed.replace(/\/$/, '') === normalizedOrigin)) {
        return callback(null, true);
      }

      // Allow any vercel deployment for this project (*.vercel.app)
      if (/^https:\/\/[a-zA-Z0-9-]+(\.vercel\.app)$/.test(normalizedOrigin)) {
        return callback(null, true);
      }

      // In development, allow all
      if (process.env.NODE_ENV !== "production") return callback(null, true);

      return callback(new Error(`CORS: Origin ${origin} tidak diizinkan.`));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Handle preflight OPTIONS globally
app.options("*", cors());

// Body Parsing (50MB limit for video & images)
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Static files for uploads (local dev fallback)
app.use("/uploads", express.static(path.join(__dirname, "public", "uploads")));

// ============================================
// Health Check (for Vercel & Monitoring)
// ============================================
app.get(["/", "/health", "/api", "/api/health"], async (req, res) => {
  let dbStatus = "disconnected";
  const connStr =
    process.env.DATABASE_URL ||
    process.env.DATABASE_URI ||
    process.env.POSTGRES_URL ||
    process.env.SUPABASE_DATABASE_URL ||
    process.env.SUPABASE_URL;

  try {
    if (db) {
      await db.execute(sql`SELECT 1`);
      dbStatus = connStr?.includes(".neon.tech")
        ? "Neon PostgreSQL Connected"
        : connStr?.includes("supabase")
        ? "Supabase PostgreSQL Connected"
        : "PostgreSQL Connected";
    } else {
      dbStatus = "ERROR: DATABASE_URL tidak dikonfigurasi!";
    }
  } catch (e) {
    dbStatus = `error: ${e.message}`;
  }

  res.json({
    status: "online",
    message: "Portal UMKM Desa Korowelang Kulon API Server",
    version: "2.2.0",
    environment: process.env.NODE_ENV || "development",
    database: dbStatus,
    uptime: `${Math.floor(process.uptime())} seconds`,
    endpoints: {
      health: "/api/health",
      auth: "/api/auth/login",
      public: "/api/public",
      admin: "/api/admin",
      superadmin: "/api/superadmin",
      upload: "/api/admin/upload",
    },
  });
});

// ============================================
// API Routers — Correct Mounting Order
// ============================================
const authRoutes = require("./src/routes/authRoutes");
const adminRoutes = require("./src/routes/adminRoutes");
const superadminRoutes = require("./src/routes/superadminRoutes");
const publicRoutes = require("./src/routes/publicRoutes");

// Auth (with rate limiter)
app.use("/api/auth", authLimiter, authRoutes);

// Public (no auth required)
app.use("/api/public", publicRoutes);

// Admin (auth + role middleware inside adminRoutes)
// adminRoutes already includes /upload and /export sub-routes
app.use("/api/admin", adminRoutes);

// SuperAdmin (auth + superadmin role middleware inside superadminRoutes)
app.use("/api/superadmin", superadminRoutes);

// ============================================
// Global Error Handler
// ============================================
app.use((err, req, res, _next) => {
  console.error("❌ Unhandled error:", err.message || err);

  if (err.code === "LIMIT_FILE_SIZE") {
    return res.status(413).json({ success: false, message: "Ukuran file terlalu besar. Maksimal 10MB." });
  }

  if (err.message && err.message.includes("CORS")) {
    return res.status(403).json({ success: false, message: err.message });
  }

  if (err.name === "ZodError") {
    return res.status(400).json({
      success: false,
      message: "Validasi data gagal",
      errors: err.errors,
    });
  }

  if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError") {
    return res.status(401).json({
      success: false,
      message: "Token otentikasi tidak valid atau telah kadaluarsa.",
    });
  }

  return res.status(500).json({
    success: false,
    message:
      process.env.NODE_ENV === "production"
        ? "Terjadi kesalahan pada server."
        : err.message || "Internal Server Error",
  });
});

// 404 handler (must be after all routes)
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Endpoint tidak ditemukan: ${req.method} ${req.originalUrl}`,
  });
});

// ============================================
// Start Server (skipped on Vercel serverless)
// ============================================
if (!process.env.VERCEL && process.env.NODE_ENV !== "test") {
  const server = http.createServer(app);
  server.listen(PORT, () => {
    console.log(`=============================================`);
    console.log(`🚀 Backend UMKM Korowelang Kulon running on http://localhost:${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
    console.log(`🔐 Auth: POST http://localhost:${PORT}/api/auth/login`);
    console.log(`📦 Admin UMKM: GET http://localhost:${PORT}/api/admin/umkm`);
    console.log(`=============================================`);
  });
}

module.exports = app;
