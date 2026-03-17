const bcrypt = require('bcrypt');
const userModel = require('../models/userModel');

const SALT_ROUNDS = 10;

async function createUser({ username, email, password }) {
  const existingByUsername = await userModel.findByUsername(username);
  if (existingByUsername) {
    const err = new Error('Username already exists');
    err.status = 409;
    throw err;
  }

  const existingByEmail = await userModel.findByEmail(email);
  if (existingByEmail) {
    const err = new Error('Email already exists');
    err.status = 409;
    throw err;
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  return userModel.create({ username, email, passwordHash });
}

async function login({ email, password }) {
  const user = await userModel.findByEmail(email);
  if (!user) {
    const err = new Error('Invalid email or password');
    err.status = 401;
    throw err;
  }

  const match = await bcrypt.compare(password, user.password_hash);
  if (!match) {
    const err = new Error('Invalid email or password');
    err.status = 401;
    throw err;
  }

  const { password_hash, ...safeUser } = user;
  return safeUser;
}

module.exports = { createUser, login };
