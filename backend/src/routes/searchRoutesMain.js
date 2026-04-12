const express = require('express');
const router = express.Router();
const { search, advancedSearch } = require('../controllers/searchControllerMain');

router.get('/', search);
router.get('/advanced', advancedSearch);

module.exports = router;
