const express = require('express');
const router = express.Router({ mergeParams: true });
const storageController = require('../controllers/storageController');

router.get('/', storageController.getSummary);

module.exports = router;
