const express = require('express');
const router = express.Router();
const { getAnalyticsDashboard } = require('../controllers/analyticsController');
const { protect, admin } = require('../middleware/authMiddleware');

router.get('/dashboard', protect, admin, getAnalyticsDashboard);

module.exports = router;
