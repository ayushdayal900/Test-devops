const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getMe, refresh, logout } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/refresh', refresh);
router.post('/logout', logout);
router.get('/me', protect, getMe);
router.put('/updatedetails', protect, require('../controllers/authController').updateDetails);

module.exports = router;
