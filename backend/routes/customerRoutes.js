const express = require('express');
const router = express.Router();
const {
    getMeasurementProfile,
    createOrUpdateMeasurementProfile,
    addAddress,
    deleteAddress,
} = require('../controllers/customerController');
const { protect } = require('../middleware/authMiddleware');

router
    .route('/measurements')
    .get(protect, getMeasurementProfile)
    .post(protect, createOrUpdateMeasurementProfile);

router.post('/address', protect, addAddress);
router.delete('/address/:id', protect, deleteAddress);

module.exports = router;
