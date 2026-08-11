const mysql = require("mysql2/promise");

let pool = null;
let isMySqlActive = false;

/**
 * Get or create MySQL connection pool
 * Supports both MYSQL_URL (Railway) and individual env vars
 */
function getPool() {
  if (pool) return pool;

  const connectionUrl =
    process.env.MYSQL_URL ||
    process.env.DATABASE_URL ||
    process.env.MYSQL_PUBLIC_URL;

  if (connectionUrl && !connectionUrl.includes("your_password")) {
    try {
      pool = mysql.createPool({
        uri: connectionUrl,
        waitForConnections: true,
        connectionLimit: 10,
        maxIdle: 5,
        idleTimeout: 60000,
        queueLimit: 0,
        enableKeepAlive: true,
        keepAliveInitialDelay: 10000,
        connectTimeout: 10000,
        // Railway MySQL may need SSL disabled
        ssl: process.env.MYSQL_SSL === "true" ? { rejectUnauthorized: false } : undefined,
      });
      isMySqlActive = true;
      console.log("✅ MySQL connection pool created successfully.");
      return pool;
    } catch (err) {
      console.warn("⚠️ MySQL pool creation failed:", err.message);
      isMySqlActive = false;
      return null;
    }
  }

  // Fallback: individual env vars
  const host = process.env.MYSQL_HOST || process.env.MYSQLHOST;
  const port = parseInt(process.env.MYSQL_PORT || process.env.MYSQLPORT || "3306", 10);
  const user = process.env.MYSQL_USER || process.env.MYSQLUSER;
  const password = process.env.MYSQL_PASSWORD || process.env.MYSQLPASSWORD;
  const database = process.env.MYSQL_DATABASE || process.env.MYSQLDATABASE;

  if (host && user && database) {
    try {
      pool = mysql.createPool({
        host,
        port,
        user,
        password: password || "",
        database,
        waitForConnections: true,
        connectionLimit: 10,
        maxIdle: 5,
        idleTimeout: 60000,
        queueLimit: 0,
        enableKeepAlive: true,
        keepAliveInitialDelay: 10000,
        connectTimeout: 10000,
      });
      isMySqlActive = true;
      console.log("✅ MySQL connection pool created (individual vars).");
      return pool;
    } catch (err) {
      console.warn("⚠️ MySQL pool creation failed:", err.message);
      isMySqlActive = false;
      return null;
    }
  }

  console.warn("⚠️ No MySQL credentials found. Using Local Database Store.");
  return null;
}

/**
 * Execute a MySQL query with prepared statement parameters
 * @param {string} query - SQL query with ? placeholders
 * @param {Array} params - Parameter values
 * @returns {Promise<Array>} Query results
 */
async function mysqlQuery(query, params = []) {
  const p = getPool();
  if (!p) return null;

  try {
    const [rows] = await p.execute(query, params);
    return rows;
  } catch (err) {
    console.error("❌ MySQL query error:", err.message);
    throw err;
  }
}

/**
 * Test MySQL connection
 * @returns {Promise<boolean>}
 */
async function testConnection() {
  try {
    const p = getPool();
    if (!p) return false;
    const [rows] = await p.execute("SELECT 1 AS ok");
    return rows && rows[0] && rows[0].ok === 1;
  } catch (err) {
    console.warn("⚠️ MySQL connection test failed:", err.message);
    return false;
  }
}

/**
 * Get MySQL version string
 * @returns {Promise<string>}
 */
async function getMySqlVersion() {
  try {
    const p = getPool();
    if (!p) return "Local DB (No MySQL)";
    const [rows] = await p.execute("SELECT VERSION() AS version");
    return rows[0]?.version || "Unknown";
  } catch (err) {
    return "MySQL connection error: " + err.message;
  }
}

/**
 * Close MySQL pool gracefully
 */
async function closePool() {
  if (pool) {
    await pool.end();
    pool = null;
    isMySqlActive = false;
    console.log("🔌 MySQL connection pool closed.");
  }
}

function isActive() {
  return isMySqlActive;
}

module.exports = {
  getPool,
  mysqlQuery,
  testConnection,
  getMySqlVersion,
  closePool,
  isActive,
};
