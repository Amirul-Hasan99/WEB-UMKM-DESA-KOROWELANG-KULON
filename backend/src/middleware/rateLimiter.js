const rateLimit = require('express-rate-limit');

/**
 * Strict Rate Limiter for Authentication / Login Routes
 * Prevents Brute-Force Password Guessing Attacks (Max 5 requests per 15 mins)
 */
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 login requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Terlalu banyak percobaan login dari IP ini. Silakan coba lagi setelah 15 menit.',
  },
});

/**
 * Rate Limiter for Public Submissions (Feedback & UMKM Reviews)
 * Prevents Spamming & DoS Attacks (Max 10 submissions per 15 mins)
 */
const publicFormLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Terlalu banyak formulir dikirim dari IP ini. Silakan tunggu beberapa saat.',
  },
});

/**
 * General Rate Limiter for Public API Endpoints
 * (Max 200 requests per 15 mins per IP)
 */
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Batas penggunaan API terlampaui. Silakan perlambat permintaan Anda.',
  },
});

module.exports = {
  loginLimiter,
  publicFormLimiter,
  apiLimiter,
};
