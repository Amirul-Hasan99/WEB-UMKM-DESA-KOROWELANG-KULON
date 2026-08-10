/**
 * Centralized Structured Logger for Backend Application
 */
const formatTimestamp = () => new Date().toISOString();

const logger = {
  info: (message, ...args) => {
    console.log(`[${formatTimestamp()}] [INFO] ${message}`, ...args);
  },
  warn: (message, ...args) => {
    console.warn(`[${formatTimestamp()}] [WARN] ⚠️ ${message}`, ...args);
  },
  error: (message, ...args) => {
    console.error(`[${formatTimestamp()}] [ERROR] ❌ ${message}`, ...args);
  },
  http: (req, res, responseTimeMs) => {
    console.log(`[${formatTimestamp()}] [HTTP] ${req.method} ${req.originalUrl} - ${res.statusCode} (${responseTimeMs}ms)`);
  },
};

module.exports = logger;
