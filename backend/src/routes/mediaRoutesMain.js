const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMain');
const { uploadMedia, deleteMedia, getMediaByFossil, updateMedia } = require('../controllers/mediaControllerMain');

router.post('/upload', protect, uploadMedia);
router.delete('/:id', protect, deleteMedia);
router.get('/fossil/:fossilId', getMediaByFossil);
router.patch('/:id', protect, updateMedia);

module.exports = router;
