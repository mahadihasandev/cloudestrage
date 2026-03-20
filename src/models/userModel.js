const db = require('../db');

function findById(id) {
  return db('users').where({ id }).first();
}

function findByUsername(username) {
  return db('users').where({ username }).first();
}

function findByEmail(email) {
  return db('users').where({ email }).first();
}

function create({ username, email, passwordHash }) {
  return db('users')
    .insert({ username, email, password_hash: passwordHash })
    .returning(['id', 'username', 'email', 'storage_limit_bytes', 'created_at'])
    .then((rows) => rows[0]);
}

function addStorage(id, bytesToAdd) {
  return db('users')
    .where({ id })
    .increment('storage_limit_bytes', bytesToAdd)
    .returning(['id', 'username', 'email', 'storage_limit_bytes'])
    .then((rows) => rows[0]);
}

function findByGoogleId(googleId) {
  return db('users').where({ google_id: googleId }).first();
}

function createGoogleUser({ username, email, googleId }) {
  return db('users')
    .insert({ username, email, google_id: googleId })
    .returning(['id', 'username', 'email', 'storage_limit_bytes', 'created_at'])
    .then((rows) => rows[0]);
}

module.exports = { findById, findByUsername, findByEmail, create, addStorage, findByGoogleId, createGoogleUser };
