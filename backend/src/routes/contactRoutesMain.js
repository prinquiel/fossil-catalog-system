const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMain');
const c = require('../controllers/contactControllerMain');

router.post('/', c.createContact);
router.get('/', protect, c.getContacts);
router.get('/:id', protect, c.getContactById);
router.patch('/:id/read', protect, c.markContactAsRead);
router.patch('/:id/reply', protect, c.replyContact);
router.delete('/:id', protect, c.deleteContact);

module.exports = router;
