const express = require('express');
const { protectOptional } = require('../middleware/authMain');
const { search, advancedSearch } = require('../controllers/searchControllerMain');

const router = express.Router();

router.get('/', protectOptional, search);
router.get('/advanced', protectOptional, advancedSearch);

module.exports = router;
