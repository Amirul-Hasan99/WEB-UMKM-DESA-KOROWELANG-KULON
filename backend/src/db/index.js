const schema = require('./schema');
require('dotenv').config();

const connectionString = process.env.DATABASE_URL;

let db = null;

if (connectionString) {
  try {
    // Detect if connecting to Neon Serverless Cloud or Local PostgreSQL (TCP)
    if (connectionString.includes('.neon.tech')) {
      const { neon } = require('@neondatabase/serverless');
      const { drizzle } = require('drizzle-orm/neon-http');
      const sql = neon(connectionString);
      db = drizzle(sql, { schema });
      console.log('✅ Connected to Neon Cloud PostgreSQL database via Drizzle ORM');
    } else {
      // Local PostgreSQL or Standard TCP Postgres Connection
      const { Pool } = require('pg');
      const { drizzle } = require('drizzle-orm/node-postgres');
      const pool = new Pool({ connectionString });
      db = drizzle(pool, { schema });
      console.log('✅ Connected to Local PostgreSQL database via Drizzle ORM (node-postgres)');
    }
  } catch (error) {
    console.error('❌ Failed to initialize database connection:', error.message);
  }
} else {
  console.warn('⚠️ DATABASE_URL is not set. Backend running with In-Memory Stateful Mock Data.');
}

module.exports = {
  db,
  schema,
};
