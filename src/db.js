const knex = require('knex');
require('dotenv').config();

const connectionConfig = process.env.DATABASE_URL 
  ? {
      connectionString: process.env.DATABASE_URL.replace(/(sslmode=)(require|prefer|verify-ca)/, '$1verify-full'),
      ssl: { rejectUnauthorized: false }
    }
  : {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      database: process.env.DB_NAME,
      user: process.env.DB_USER,
      password: process.env.DB_PASS,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    };

const db = knex({
  client: 'pg',
  connection: connectionConfig,
  pool: { min: 2, max: 10 },
});

module.exports = db;
