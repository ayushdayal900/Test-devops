const express = require('express');
const router = express.Router();
const { getMeasurements, saveMeasurement, deleteMeasurement } = require('../controllers/measurementController');
const { protect } = require('../middleware/authMiddleware');

router.route('/').get(protect, getMeasurements).post(protect, saveMeasurement);
router.route('/:id').delete(protect, deleteMeasurement);

module.exports = router;
