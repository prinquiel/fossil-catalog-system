const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMain');
const upload = require('../middleware/upload');
const { uploadMedia, deleteMedia, getMediaByFossil, updateMedia } = require('../controllers/mediaController');

router.post('/upload', protect, upload.array('images', 10), uploadMedia);
router.get('/fossil/:fossilId', getMediaByFossil);
router.patch('/:id', protect, updateMedia);
router.delete('/:id', protect, deleteMedia);

module.exports = router;
