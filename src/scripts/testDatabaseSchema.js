/**
 * Script: testDatabaseSchema.js
 * Description: Connects to the database and retrieves the column names 
 *              for the 'users' table to verify its structure.
 */
const db = require('../db');

async function testDatabaseSchema() {
  try {
    console.log('[INFO] Fetching schema for users table...');
    const result = await db.raw("SELECT column_name FROM information_schema.columns WHERE table_name = 'users'");
    
    const columns = result.rows.map(row => row.column_name);
    
    console.log('[SUCCESS] Current columns in users table:');
    console.log(JSON.stringify(columns, null, 2));
    
  } catch (error) {
    console.error('[ERROR] Failed to fetch schema:', error.message);
  } finally {
    db.destroy();
    process.exit(0);
  }
}

testDatabaseSchema();
