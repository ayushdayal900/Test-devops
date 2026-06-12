const express = require('express');
const router = express.Router();
const { getCMSItems, getAdminCMSItems, createCMSItem, updateCMSItem, deleteCMSItem } = require('../controllers/cmsController');
const { protect, admin } = require('../middleware/authMiddleware');

router.get('/:type', getCMSItems);
router.get('/admin/:type', protect, admin, getAdminCMSItems);
router.post('/', protect, admin, createCMSItem);
router.route('/:id')
    .put(protect, admin, updateCMSItem)
    .delete(protect, admin, deleteCMSItem);

module.exports = router;
