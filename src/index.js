const express = require('express');
require('dotenv').config();

const fileRoutes = require('./routes/fileRoutes');
const storageRoutes = require('./routes/storageRoutes');

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static('public'));

app.get('/', (req, res) => {
  res.redirect('/login.html');
});

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
if (process.env.NODE_ENV !== 'production') {
  app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
  });
}

module.exports = app;
