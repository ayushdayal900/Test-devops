const express = require('express');
const router = express.Router();
const { submitContact, getAllMessages } = require('../controllers/contactController');
const { protect, admin } = require('../middleware/authMiddleware');

router.post('/', submitContact);
router.get('/', protect, admin, getAllMessages);

module.exports = router;
