const bcrypt = require('bcryptjs');
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
  console.log(`[AUTH DEBUG] Attempting login for email: "${email}"`);
  
  const user = await userModel.findByEmail(email);
  if (!user) {
    console.log(`[AUTH DEBUG] Login failed: User not found in DB for email "${email}"`);
    const err = new Error('Invalid email or password');
    err.status = 401;
    throw err;
  }

  console.log(`[AUTH DEBUG] User found. Comparing password against hash: ${user.password_hash.substring(0, 10)}...`);
  const match = await bcrypt.compare(password, user.password_hash);
  
  if (!match) {
    console.log(`[AUTH DEBUG] Login failed: Password mismatch for email "${email}"`);
    const err = new Error('Invalid email or password');
    err.status = 401;
    throw err;
  }

  console.log(`[AUTH DEBUG] Login successful for email "${email}"`);
  const { password_hash, ...safeUser } = user;
  return safeUser;
}

async function upgradeStorage(userId, trxId) {
  // In a real application with the bKash Merchant API, we would verify the trxId here.
  // Since this is a personal gateway, we auto-grant 1GB immediately upon submisson.
  console.log(`[PAYMENT DEBUG] Upgrading storage for user ${userId} with TrxID: ${trxId}`);
  
  const additionalBytes = 1 * 1024 * 1024 * 1024; // 1 GB
  const updatedUser = await userModel.addStorage(userId, additionalBytes);
  
  if (!updatedUser) {
    const err = new Error('User not found');
    err.status = 404;
    throw err;
  }
  
  const { password_hash, ...safeUser } = updatedUser;
  return { user: safeUser, addedBytes: additionalBytes };
}

module.exports = { createUser, login, upgradeStorage };
