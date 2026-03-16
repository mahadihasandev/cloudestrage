const db = require('../db');

function findById(id) {
  return db('users').where({ id }).first();
}

function findByUsername(username) {
  return db('users').where({ username }).first();
}

function create(username) {
  return db('users')
    .insert({ username })
    .returning(['id', 'username', 'created_at'])
    .then((rows) => rows[0]);
}

module.exports = { findById, findByUsername, create };
