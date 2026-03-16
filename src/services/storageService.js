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

  return {
    used_bytes: used,
    remaining_bytes: Math.max(0, STORAGE_LIMIT_BYTES - used),
    active_file_count: count,
  };
}

module.exports = {
  getStorageSummary,
};
