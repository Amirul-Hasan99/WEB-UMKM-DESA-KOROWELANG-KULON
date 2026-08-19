const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const env = require('./config/env');
const logger = require('./utils/logger');
const { apiLimiter } = require('./middleware/rateLimiter');
const { db } = require('./db');
const { syncAllSequences } = require('./db/syncSequences');

if (db) {
  syncAllSequences(db).catch(() => {});
}

const publicRoutes = require('./routes/publicRoutes');
const adminRoutes = require('./routes/adminRoutes');
const superadminRoutes = require('./routes/superadminRoutes');
const authRoutes = require('./routes/authRoutes');

const app = express();
const PORT = env.PORT;

// Helmet HTTP Security Headers
app.use(helmet({
  contentSecurityPolicy: false, // Disables default CSP to allow embedded maps/images if needed
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// Global Rate Limiter for general API protection
app.use('/api', apiLimiter);

// CORS Restriction configuration
const allowedOrigins = [
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'https://umkm-desa-korowelang-kulon.vercel.app',
  ...(env.FRONTEND_URL ? env.FRONTEND_URL.split(',').map((s) => s.trim()) : []),
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || env.NODE_ENV !== 'production') {
      return callback(null, true);
    }
    const normalizedOrigin = origin.replace(/\/$/, '');
    if (allowedOrigins.some((allowed) => allowed.replace(/\/$/, '') === normalizedOrigin)) {
      return callback(null, true);
    }
    if (/^https:\/\/[a-zA-Z0-9-]+(\.vercel\.app)$/.test(normalizedOrigin)) {
      return callback(null, true);
    }
    return callback(new Error(`Akses CORS ditolak untuk origin: ${origin}`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Request logger with performance timing
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.http(req, res, duration);
  });
  next();
});

// Health & Status Check Endpoint
app.get(['/api', '/api/health'], async (req, res) => {
  let dbStatus = 'Disconnected / In-Memory Mock Store';
  if (db) {
    dbStatus = env.DATABASE_URL?.includes('.neon.tech') 
      ? 'Neon PostgreSQL Connected' 
      : 'PostgreSQL Connected';
  }

  res.json({
    status: 'online',
    message: 'API Portal UMKM Desa Korowelang Kulon berjalan dengan lancar.',
    version: '2.1.0',
    environment: env.NODE_ENV,
    database: dbStatus,
    uptime: `${Math.floor(process.uptime())} seconds`,
    memoryUsage: {
      rss: `${Math.round(process.memoryUsage().rss / 1024 / 1024)} MB`,
      heapUsed: `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)} MB`,
    },
    endpoints: {
      health: '/api/health',
      public: '/api/public',
      admin: '/api/admin',
      superadmin: '/api/superadmin',
      upload: '/api/admin/upload',
      export: '/api/admin/export'
    }
  });
});

// Routes
app.use('/api/public', publicRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/superadmin', superadminRoutes);

// 404 Route Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint API tidak ditemukan.'
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  logger.error('Unhandled Server Error:', err);
  res.status(500).json({
    success: false,
    message: 'Terjadi kesalahan internal server.',
    error: env.NODE_ENV === 'development' ? err.message : undefined
  });
});

if (env.NODE_ENV !== 'production' && env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`=================================================`);
    console.log(`🚀 Server Backend UMKM Korowelang Kulon (v2.1) Berjalan!`);
    console.log(`🌐 Port: ${PORT}`);
    console.log(`🔒 Security: Helmet & Rate Limiter Active`);
    console.log(`🔗 Health Check: http://localhost:${PORT}/api/health`);
    console.log(`=================================================`);
  });
}

module.exports = app;

