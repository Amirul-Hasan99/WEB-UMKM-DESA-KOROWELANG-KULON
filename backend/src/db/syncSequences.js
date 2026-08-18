const { sql } = require('drizzle-orm');

/**
 * Automatically syncs all PostgreSQL serial sequences with MAX(id)
 * Prevents "duplicate key value violates unique constraint *_pkey" errors
 */
async function syncAllSequences(db) {
  if (!db) return;
  const tables = ['feedbacks', 'umkms', 'products', 'users', 'dynamic_content'];
  for (const table of tables) {
    try {
      await db.execute(sql.raw(`
        SELECT setval(
          pg_get_serial_sequence('${table}', 'id'),
          COALESCE((SELECT MAX(id) FROM "${table}"), 0) + 1,
          false
        );
      `));
    } catch (e) {
      try {
        await db.execute(sql.raw(`
          SELECT setval(
            '${table}_id_seq',
            COALESCE((SELECT MAX(id) FROM "${table}"), 0) + 1,
            false
          );
        `));
      } catch (err2) {
        // Ignore if table/sequence doesn't exist yet
      }
    }
  }
}

module.exports = { syncAllSequences };
