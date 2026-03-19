const db = require('../db');

const STORAGE_LIMIT_BYTES = 500 * 1024 * 1024;

async function getUserUsage(userId) {
  const result = await db('files')
    .where({ user_id: userId })
    .whereNull('deleted_at')
    .sum('file_size_bytes as used');

  return Number(result[0].used || 0);
}

async function getStorageSummary(userId) {
  const used = await getUserUsage(userId);

  const count = await db('files')
    .where({ user_id: userId })
    .whereNull('deleted_at')
    .count('* as count')
    .then((r) => Number(r[0].count));

  const user = await db('users').where({ id: userId }).first();
  const limit = user && user.storage_limit_bytes ? Number(user.storage_limit_bytes) : 524288000;

  return {
    used_bytes: used,
    remaining_bytes: Math.max(0, limit - used),
    active_file_count: count,
    total_limit: limit
  };
}

module.exports = {
  getStorageSummary,
};
