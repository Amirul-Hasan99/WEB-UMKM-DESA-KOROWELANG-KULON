const jwt = require('jsonwebtoken');
require('dotenv').config();

// Single source of truth for JWT_SECRET — always read from environment variable
// NEVER use a hardcoded fallback in production
const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  if (process.env.NODE_ENV === 'production') {
    console.error('❌ FATAL: JWT_SECRET environment variable is not set in production!');
    process.exit(1);
  } else {
    console.warn('⚠️  JWT_SECRET not set, using development fallback. Set JWT_SECRET in .env for proper behavior.');
  }
}

const EFFECTIVE_SECRET = JWT_SECRET || 'dev-fallback-jwt-secret-kutoharjo-2026-CHANGE-IN-PROD';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1d';

/**
 * Generate a signed JWT token for a user.
 * @param {Object} user - User object from database
 * @returns {string} Signed JWT token
 */
const generateToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
    EFFECTIVE_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
};

/**
 * Verify and decode a JWT token.
 * @param {string} token - JWT token string
 * @returns {Object} Decoded payload
 * @throws {JsonWebTokenError|TokenExpiredError} If token is invalid or expired
 */
const verifyToken = (token) => {
  return jwt.verify(token, EFFECTIVE_SECRET);
};

module.exports = {
  JWT_SECRET: EFFECTIVE_SECRET,
  JWT_EXPIRES_IN,
  generateToken,
  verifyToken,
};
