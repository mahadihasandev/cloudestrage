const express = require('express');
require('dotenv').config();

const fileRoutes = require('./routes/fileRoutes');
const storageRoutes = require('./routes/storageRoutes');

const app = express();
app.use(express.json());

app.get('/', (req, res) => res.json({ status: 'ok' }));

app.use('/users', require('./routes/userRoutes'));
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
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
