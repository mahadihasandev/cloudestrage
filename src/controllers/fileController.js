const fileService = require('../services/fileService');

async function upload(req, res, next) {
  try {
    const userId = Number(req.params.user_id);
    const { file_name, file_size_bytes, file_hash } = req.body;
    
    // Cloudinary URL is in req.file.path
    const file_url = req.file ? req.file.path : null;

    if (!file_name || !file_size_bytes || !file_hash) {
      return res.status(400).json({ message: 'Missing required file fields' });
    }

    const created = await fileService.uploadFile(userId, {
      file_name,
      file_size_bytes: Number(file_size_bytes),
      file_hash,
      file_url,
    });

    res.status(201).json(created);
  } catch (err) {
    next(err);
  }
}

async function remove(req, res, next) {
  try {
    const userId = Number(req.params.user_id);
    const fileId = Number(req.params.file_id);

    const deleted = await fileService.deleteFile(userId, fileId);
    res.json({ message: 'Deleted', file: deleted });
  } catch (err) {
    next(err);
  }
}

async function list(req, res, next) {
  try {
    const userId = Number(req.params.user_id);
    const files = await fileService.listFiles(userId);
    res.json(files);
  } catch (err) {
    next(err);
  }
}

module.exports = { upload, remove, list };
