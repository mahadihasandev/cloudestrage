const db = require('../db');
const userModel = require('../models/userModel');
const fileModel = require('../models/fileModel');

const STORAGE_LIMIT_BYTES = 500 * 1024 * 1024;

async function uploadFile(userId, payload) {
  return db.transaction(async (trx) => {
    const user = await userModel.findById(userId);
    if (!user) {
      const err = new Error('User not found');
      err.status = 404;
      throw err;
    }

    const existing = await fileModel.findByName(userId, payload.file_name);
    if (existing) {
      const err = new Error('File name already exists');
      err.status = 409;
      throw err;
    }

    const usedResult = await fileModel.getStorageUsage(userId);
    const used = Number(usedResult[0].used || 0);
    const newUsed = used + Number(payload.file_size_bytes);

    if (newUsed > STORAGE_LIMIT_BYTES) {
      const err = new Error('Storage limit exceeded');
      err.status = 400;
      throw err;
    }

    const [created] = await fileModel.createFile(
      {
        user_id: userId,
        file_name: payload.file_name,
        file_size_bytes: payload.file_size_bytes,
        file_hash: payload.file_hash,
      },
      trx
    );

    return created;
  });
}

async function deleteFile(userId, fileId) {
  const file = await fileModel.findById(userId, fileId);
  if (!file) {
    const err = new Error('File not found');
    err.status = 404;
    throw err;
  }

  await fileModel.markDeleted(fileId);
  return file;
}

async function listFiles(userId) {
  const user = await userModel.findById(userId);
  if (!user) {
    const err = new Error('User not found');
    err.status = 404;
    throw err;
  }
  return fileModel.getActiveFiles(userId);
}

module.exports = {
  uploadFile,
  deleteFile,
  listFiles,
};
