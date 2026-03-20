/**
 * Direct Cloudinary + DB fix for the double extension problem.
 * This script:
 *   1. Lists all files on Cloudinary under cloudspace_uploads with the problematic timestamp
 *   2. Renames them on Cloudinary
 *   3. Updates the DB
 */

const cloudinary = require('cloudinary').v2;
const { Client } = require('pg');
require('dotenv').config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const pgClient = new Client({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'cloudstorage',
  user: process.env.DB_USER || 'clouduser',
  password: process.env.DB_PASS || 'cloudpass',
});

async function fix() {
  await pgClient.connect();
  console.log('[DB] Connected to PostgreSQL.');

  // Show all files in DB
  const allFiles = await pgClient.query('SELECT id, file_name, file_url FROM files ORDER BY id');
  console.log('\n[DB] All files:');
  for (const row of allFiles.rows) {
    console.log(`  ID=${row.id} name="${row.file_name}" url=${row.file_url || 'NULL'}`);
  }

  // Fix DB records with double extension
  const fixRes = await pgClient.query(`
    UPDATE files
    SET file_url = regexp_replace(file_url, '\\.([a-z0-9]+)\\.\\1$', '.\\1', 'i')
    WHERE file_url ~ '\\.([a-z0-9]+)\\.\\1$'
    RETURNING id, file_name, file_url
  `);
  
  if (fixRes.rows.length > 0) {
    console.log('\n[DB] Fixed DB records:');
    fixRes.rows.forEach(r => console.log(`  ID=${r.id} -> NEW URL: ${r.file_url}`));
  } else {
    console.log('\n[DB] No DB records needed updating.');
  }

  // Now check Cloudinary
  console.log('\n[Cloudinary] Listing raw resources in cloudspace_uploads...');
  try {
    const rawRes = await cloudinary.api.resources({ 
      type: 'upload',
      prefix: 'cloudspace_uploads/',
      resource_type: 'raw',
      max_results: 20
    });
    console.log(`Found ${rawRes.resources.length} raw resources:`);
    rawRes.resources.forEach(r => console.log(`  ${r.public_id}  (${r.secure_url})`));
    
    // Rename ones that end in .pdf
    for (const res of rawRes.resources) {
      if (res.public_id.endsWith('.pdf') || res.public_id.endsWith('.png') || res.public_id.endsWith('.jpg')) {
        const ext = res.public_id.split('.').pop();
        const newId = res.public_id.slice(0, -(ext.length + 1)); // Remove ".ext"
        console.log(`\n[Cloudinary] Renaming: "${res.public_id}" -> "${newId}"`);
        try {
          const renamed = await cloudinary.uploader.rename(res.public_id, newId, { resource_type: 'raw', overwrite: false });
          console.log(`  Success! New URL: ${renamed.secure_url}`);
          // Update DB with new URL
          const oldUrl = res.secure_url;
          const newUrl = renamed.secure_url;
          await pgClient.query('UPDATE files SET file_url = $1 WHERE file_url = $2', [newUrl, oldUrl]);
          console.log(`  DB updated.`);
        } catch (e) {
          console.log(`  Rename error: ${e.message}`);
        }
      }
    }
  } catch (e) {
    console.log('Error listing raw resources:', e.message);
  }
  
  console.log('\n[Done]');
  await pgClient.end();
  process.exit(0);
}

fix().catch(err => {
  console.error('Fatal:', err.message);
  pgClient.end().catch(() => {});
  process.exit(1);
});
