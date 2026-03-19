const express = require('express');
const router = express.Router({ mergeParams: true });
const fileController = require('../controllers/fileController');
const upload = require('../middleware/upload');

router.post('/', upload.single('file'), fileController.upload);
router.get('/', fileController.list);
router.delete('/:file_id', fileController.remove);

module.exports = router;
