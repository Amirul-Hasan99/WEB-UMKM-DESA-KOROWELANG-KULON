const { mysqlQuery, isActive } = require("./mysql");
const { executeLocalSql } = require("./local_db");

let mysqlFailed = false;

/**
 * Database query function — MySQL with Local DB fallback
 * Supports two calling patterns:
 *   1. sql`SELECT * FROM users WHERE id = ${id}` (tagged template — converts to prepared statement)
 *   2. sql.query("SELECT * FROM users WHERE id = ?", [id]) (explicit query + params)
 */
async function dbQuery(strings, ...values) {
  // If called as tagged template literal (PostgreSQL neon style)
  if (Array.isArray(strings) && strings.raw) {
    // Convert tagged template to MySQL prepared statement
    let query = "";
    const params = [];
    for (let i = 0; i < strings.length; i++) {
      query += strings[i];
      if (i < values.length) {
        params.push(values[i]);
        query += "?";
      }
    }

    return await executeQuery(query.trim(), params);
  }

  // If called with a string directly (shouldn't happen but handle gracefully)
  if (typeof strings === "string") {
    return await executeQuery(strings, values);
  }

  return await executeLocalSql(strings, values);
}

/**
 * Explicit query method: sql.query("SELECT ...", [param1, param2])
 */
dbQuery.query = async function (query, params = []) {
  return await executeQuery(query, params);
};

/**
 * Core execution: try MySQL first, fallback to local_db
 */
async function executeQuery(query, params = []) {
  if (isActive() && !mysqlFailed) {
    try {
      const result = await mysqlQuery(query, params);
      return result;
    } catch (err) {
      if (!mysqlFailed) {
        console.warn("⚠️ MySQL query failed (" + err.message + "). Switching to Local Database Store.");
        mysqlFailed = true;
      }
    }
  }

  // Fallback to local_db (convert MySQL query to local_db format)
  return await executeLocalSql(buildTaggedTemplate(query, params), params);
}

/**
 * Build a pseudo tagged-template array for local_db compatibility
 */
function buildTaggedTemplate(query, params) {
  // Split query by ? placeholders to create a tagged template strings array
  const parts = query.split("?");
  return parts;
}

module.exports = dbQuery;
