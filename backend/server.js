require("dotenv").config();

const http = require("http");
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 5000;

// Initialize Database client (MySQL with automatic Local DB Fallback)
const sql = require("./db/client");

// ============================================
// Security: Helmet HTTP Headers
// ============================================
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
}));

// ============================================
// Security: Rate Limiting
// ============================================
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // max 200 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Terlalu banyak permintaan. Silakan coba lagi nanti." },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // max 20 login attempts per 15 min
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
      // Allow requests with no origin (mobile apps, curl, server-to-server)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else if (process.env.NODE_ENV !== "production") {
        callback(null, true); // permissive in development only
      } else {
        callback(new Error("Akses CORS ditolak oleh kebijakan keamanan server."));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// ============================================
// Body Parsing (limited to 5MB)
// ============================================
app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true, limit: "5mb" }));

// Static files for uploads
app.use("/uploads", express.static(path.join(__dirname, "public", "uploads")));

// ============================================
// Health Check (for Railway)
// ============================================
app.get("/health", async (req, res) => {
  try {
    const result = await sql.query("SELECT 1 AS ok");
    res.json({
      status: "healthy",
      database: result && result[0]?.ok === 1 ? "connected" : "fallback",
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    res.json({
      status: "healthy",
      database: "fallback",
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    });
  }
});

// Database version endpoint
app.get("/version", async (req, res) => {
  try {
    const result = await sql.query("SELECT VERSION() AS version");
    const version = result && result[0] ? result[0].version : "Local DB";
    res.writeHead(200, { "Content-Type": "text/plain" });
    res.end(version);
  } catch (err) {
    res.writeHead(500, { "Content-Type": "text/plain" });
    res.end("Database connection error: " + err.message);
  }
});

// Root endpoint
app.get("/", async (req, res) => {
  try {
    const result = await sql.query("SELECT VERSION() AS version");
    const version = result && result[0] ? result[0].version : "Local DB";
    res.json({
      status: "online",
      message: "Portal UMKM Kutoharjo API Server",
      databaseVersion: version,
    });
  } catch (err) {
    res.json({
      status: "online",
      message: "Portal UMKM Kutoharjo API Server",
      databaseError: err.message,
    });
  }
});

// ============================================
// API Routers
// ============================================
const authRoutes = require("./routes/auth");
const umkmRoutes = require("./routes/umkm");
const categoriesRoutes = require("./routes/categories");
const productsRoutes = require("./routes/products");
const adminRoutes = require("./routes/admin");
const superadminRoutes = require("./routes/superadmin");
const userRoutes = require("./routes/user");
const uploadRoutes = require("./src/routes/uploadRoutes");
const exportRoutes = require("./src/routes/exportRoutes");

app.use("/api/auth", authLimiter, authRoutes(sql));
app.use("/api/umkm", umkmRoutes(sql));
app.use("/api/categories", categoriesRoutes(sql));
app.use("/api/products", productsRoutes(sql));
app.use("/api/admin", adminRoutes(sql));
app.use("/api/superadmin", superadminRoutes(sql));
app.use("/api/user", userRoutes(sql));
app.use("/api/upload", uploadRoutes);
app.use("/api/admin/upload", uploadRoutes);
app.use("/api/export", exportRoutes);
app.use("/api/admin/export", exportRoutes);

// ============================================
// Global Error Handler
// ============================================
app.use((err, req, res, _next) => {
  console.error("❌ Unhandled error:", err);

  // Multer file size error
  if (err.code === "LIMIT_FILE_SIZE") {
    return res.status(413).json({ error: "Ukuran file terlalu besar. Maksimal 5MB." });
  }

  // CORS error
  if (err.message && err.message.includes("CORS")) {
    return res.status(403).json({ error: err.message });
  }

  // Zod validation error
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

// ============================================
// Start Server
// ============================================
if (process.env.NODE_ENV !== "test" && !process.env.VERCEL) {
  const server = http.createServer(app);
  server.listen(PORT, () => {
    console.log(`🚀 Backend Server running at http://localhost:${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/health`);
  });
}

module.exports = app;
