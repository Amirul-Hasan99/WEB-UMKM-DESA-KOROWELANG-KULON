const express = require('express');
const cors = require('cors');
require('dotenv').config();

const publicRoutes = require('./routes/publicRoutes');
const adminRoutes = require('./routes/adminRoutes');
const superadminRoutes = require('./routes/superadminRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: '*', // Allow all origins for dev/testing
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logger
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

// Root API Health Check
app.get('/api', (req, res) => {
  res.json({
    status: 'online',
    message: 'API Portal UMKM Desa Korowelang Kulon berjalan dengan lancar.',
    version: '1.0.0',
    endpoints: {
      public: '/api/public',
      admin: '/api/admin',
      superadmin: '/api/superadmin'
    }
  });
});

// Routes
app.use('/api/public', publicRoutes);
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
  console.error('Unhandled Error:', err);
  res.status(500).json({
    success: false,
    message: 'Terjadi kesalahan internal server.',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

app.listen(PORT, () => {
  console.log(`=================================================`);
  console.log(`🚀 Server Backend UMKM Korowelang Kulon Berjalan!`);
  console.log(`🌐 Port: ${PORT}`);
  console.log(`🔗 Health Check: http://localhost:${PORT}/api`);
  console.log(`=================================================`);
});
