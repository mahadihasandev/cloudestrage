/**
 * Script: alterDatabaseSchema.js
 * Description: Checks the current 'users' table columns and dynamically adds 
 *              'email' and 'password_hash' columns if they are missing.
 */
const db = require('../db');

async function alterDatabaseSchema() {
  try {
    console.log('[INFO] Checking users table columns...');
    
    const res = await db.raw("SELECT column_name FROM information_schema.columns WHERE table_name = 'users'");
    const columns = res.rows.map(row => row.column_name);
    
    console.log('[INFO] Current columns:', columns.join(', '));

    let altered = false;

    if (!columns.includes('email')) {
      console.log('[INFO] Adding missing column: email...');
      await db.raw("ALTER TABLE users ADD COLUMN email TEXT UNIQUE");
      altered = true;
    }
    
    if (!columns.includes('password_hash')) {
      console.log('[INFO] Adding missing column: password_hash...');
      await db.raw("ALTER TABLE users ADD COLUMN password_hash TEXT");
      altered = true;
    }

    if (!columns.includes('storage_limit_bytes')) {
      console.log('[INFO] Adding missing column: storage_limit_bytes...');
      await db.raw("ALTER TABLE users ADD COLUMN storage_limit_bytes BIGINT DEFAULT 524288000");
      altered = true;
    }

    console.log('[INFO] Checking files table columns...');
    const filesRes = await db.raw("SELECT column_name FROM information_schema.columns WHERE table_name = 'files'");
    const filesColumns = filesRes.rows.map(row => row.column_name);

    if (!filesColumns.includes('file_url')) {
      console.log('[INFO] Adding missing column: file_url to files table...');
      await db.raw("ALTER TABLE files ADD COLUMN file_url TEXT");
      altered = true;
    }

    if (altered) {
      console.log('[SUCCESS] Table alteration completed successfully.');
    } else {
      console.log('[INFO] No alterations needed. Schema is up to date.');
    }
    
  } catch (error) {
    console.error('[ERROR] Failed to alter database schema:', error.message);
  } finally {
    db.destroy();
    process.exit(0);
  }
}

alterDatabaseSchema();
