const db = require('../db');

function getActiveFiles(userId) {
  return db('files')
    .where({ user_id: userId })
    .whereNull('deleted_at')
    .select('id', 'file_name', 'file_size_bytes', 'file_hash', 'created_at');
}

function getStorageUsage(userId) {
  return db('files')
    .where({ user_id: userId })
    .whereNull('deleted_at')
    .sum('file_size_bytes as used');
}

function findByName(userId, fileName) {
  return db('files')
    .where({ user_id: userId, file_name: fileName })
    .whereNull('deleted_at')
    .first();
}

function createFile(data, trx) {
  const query = trx ? trx('files') : db('files');
  return query
    .insert(data)
    .returning(['id', 'file_name', 'file_size_bytes', 'file_hash', 'created_at']);
}

function markDeleted(fileId) {
  return db('files')
    .where({ id: fileId })
    .update({ deleted_at: db.fn.now() });
}

function findById(userId, fileId) {
  return db('files')
    .where({ id: fileId, user_id: userId })
    .whereNull('deleted_at')
    .first();
}

module.exports = {
  getActiveFiles,
  getStorageUsage,
  findByName,
  createFile,
  markDeleted,
  findById,
};
