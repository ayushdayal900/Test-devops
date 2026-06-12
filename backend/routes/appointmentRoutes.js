const express = require('express');
const router = express.Router();
const { createAppointment, getMyAppointments, getAllAppointments, updateAppointmentStatus } = require('../controllers/appointmentController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/')
    .post(protect, createAppointment)
    .get(protect, getMyAppointments);

router.get('/admin/all', protect, admin, getAllAppointments);
router.put('/:id/status', protect, admin, updateAppointmentStatus);

module.exports = router;
