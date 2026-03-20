const bcrypt = require('bcryptjs');
const { OAuth2Client } = require('google-auth-library');
const userModel = require('../models/userModel');

const SALT_ROUNDS = 10;
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

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

async function verifyGoogleToken(credential) {
  const ticket = await googleClient.verifyIdToken({
    idToken: credential,
    audience: process.env.GOOGLE_CLIENT_ID,
  });
  return ticket.getPayload();
}

async function googleLogin({ credential }) {
  const payload = await verifyGoogleToken(credential);
  const { sub: googleId, email, name } = payload;

  let user = await userModel.findByGoogleId(googleId);
  if (!user) {
    user = await userModel.findByEmail(email.toLowerCase());
    if (!user) {
      const err = new Error('No account found for this Google account. Please register first.');
      err.status = 404;
      throw err;
    }
  }

  const { password_hash, google_id, ...safeUser } = user;
  return safeUser;
}

async function googleRegister({ credential }) {
  const payload = await verifyGoogleToken(credential);
  const { sub: googleId, email, name } = payload;

  const existingByGoogleId = await userModel.findByGoogleId(googleId);
  if (existingByGoogleId) {
    const err = new Error('An account with this Google account already exists. Please log in instead.');
    err.status = 409;
    throw err;
  }

  const existingByEmail = await userModel.findByEmail(email.toLowerCase());
  if (existingByEmail) {
    const err = new Error('An account with this email already exists. Please log in instead.');
    err.status = 409;
    throw err;
  }

  const baseUsername = (name || email.split('@')[0]).replace(/\s+/g, '').toLowerCase();
  let username = baseUsername;
  let suffix = 1;
  while (await userModel.findByUsername(username)) {
    username = `${baseUsername}${suffix++}`;
  }

  return userModel.createGoogleUser({ username, email: email.toLowerCase(), googleId });
}

module.exports = { createUser, login, upgradeStorage, googleLogin, googleRegister };
