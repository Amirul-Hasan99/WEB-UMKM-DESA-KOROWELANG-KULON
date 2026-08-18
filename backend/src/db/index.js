const schema = require('./schema');
require('dotenv').config();

const connectionString =
  process.env.DATABASE_URL ||
  process.env.DATABASE_URI ||
  process.env.POSTGRES_URL ||
  process.env.SUPABASE_DATABASE_URL ||
  process.env.SUPABASE_URL;

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
      // Supabase, Railway, AWS RDS, or Local PostgreSQL
      const { Pool } = require('pg');
      const { drizzle } = require('drizzle-orm/node-postgres');
      const isRemote = !connectionString.includes('localhost') && !connectionString.includes('127.0.0.1');
      const pool = new Pool({
        connectionString,
        ssl: isRemote ? { rejectUnauthorized: false } : false,
      });
      pool.on('error', (err) => {
        console.error('⚠️ Unexpected error on idle pg client:', err.message);
      });
      db = drizzle(pool, { schema });
      console.log('✅ Connected to PostgreSQL database via Drizzle ORM (node-postgres)');
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
