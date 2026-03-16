const storageService = require('../services/storageService');

async function getSummary(req, res, next) {
  try {
    const userId = Number(req.params.user_id);
    const summary = await storageService.getStorageSummary(userId);
    res.json(summary);
  } catch (err) {
    next(err);
  }
}

module.exports = { getSummary };
