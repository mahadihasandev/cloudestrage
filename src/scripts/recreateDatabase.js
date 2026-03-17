/**
 * Script: recreateDatabase.js
 * Description: Drops the existing tables and recreates the fresh schema for 'users' 
 *              and 'files', seeding them with initial sample data.
 * WARNING: This is destructive and should only be used in development.
 */
const db = require('../db');

async function recreateDatabase() {
  try {
    console.log('[WARNING] Dropping existing tables...');
    await db.raw('DROP TABLE IF EXISTS files CASCADE;');
    await db.raw('DROP TABLE IF EXISTS users CASCADE;');
    
    console.log('[INFO] Creating users table...');
    await db.raw(`
      CREATE TABLE users (
        id SERIAL PRIMARY KEY,
        username TEXT NOT NULL UNIQUE,
        email TEXT NOT NULL UNIQUE,
        password_hash TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    console.log('[INFO] Creating files table...');
    await db.raw(`
      CREATE TABLE files (
        id SERIAL PRIMARY KEY,
        user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        file_name TEXT NOT NULL,
        file_size_bytes BIGINT NOT NULL CHECK (file_size_bytes >= 0),
        file_hash TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        deleted_at TIMESTAMP WITH TIME ZONE NULL,
        UNIQUE (user_id, file_name, deleted_at)
      );
    `);
    
    console.log('[INFO] Inserting sample users...');
    const samplePasswordHash = '$2b$10$S8apK48QjnwPUWApl/Pi3ez/epDIQ2mpWtW2xxSCJ45kbMisAZzo6'; // 'password'
    await db.raw(`
      INSERT INTO users (username, email, password_hash) 
      VALUES 
      ('Admin User', 'admin@example.com', ?), 
      ('Test User 1', 'test1@example.com', ?), 
      ('Test User 2', 'test2@example.com', ?);
    `, [samplePasswordHash, samplePasswordHash, samplePasswordHash]);
    
    console.log('[SUCCESS] Database recreation and seeding completed successfully.');
  } catch (error) {
    console.error('[ERROR] Failed to recreate database:', error.message);
  } finally {
    db.destroy();
    process.exit(0);
  }
}

recreateDatabase();
