const userModel = require('../models/userModel');

async function createUser(username) {
  const existing = await userModel.findByUsername(username);
  if (existing) {
    const err = new Error('Username already exists');
    err.status = 409;
    throw err;
  }

  return userModel.create(username);
}

module.exports = { createUser };
