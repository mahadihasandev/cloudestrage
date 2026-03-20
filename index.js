const express = require('express');
const path = require('path');
require('dotenv').config();

const fileRoutes = require('./src/routes/fileRoutes');
const storageRoutes = require('./src/routes/storageRoutes');

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.redirect('/login.html');
});

app.get('/api/config', (req, res) => {
  res.json({ googleClientId: process.env.GOOGLE_CLIENT_ID || '' });
});

app.get('/migrate', async (req, res) => {
  try {
    const db = require('./src/db');
    await db.raw('ALTER TABLE files ADD COLUMN IF NOT EXISTS file_url TEXT;');
    await db.raw('ALTER TABLE users ADD COLUMN IF NOT EXISTS storage_limit_bytes BIGINT DEFAULT 524288000;');
    res.send('Migration successful! Added new columns to your Vercel database.');
  } catch (error) {
    if (error.message.includes('already exists')) {
      res.send('Migration already applied or partial success. Check your app.');
    } else {
      res.status(500).send('Migration failed: ' + error.message);
    }
  }
});

app.use('/users', require('./src/routes/userRoutes'));
app.use('/users/:user_id/files', fileRoutes);
app.use('/users/:user_id/storage-summary', storageRoutes);

app.use((err, req, res, next) => {
  if (err && err.status) {
    return res.status(err.status).json({ message: err.message });
  }
  console.error(err);
  res.status(500).json({ message: 'Internal server error' });
});

const port = process.env.PORT || 3000;
if (process.env.NODE_ENV !== 'production') {
  app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
  });
}

module.exports = app;
