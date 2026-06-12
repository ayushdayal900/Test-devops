const Appointment = require('../models/Appointment');

// @desc    Book a new appointment
// @route   POST /api/appointments
// @access  Private
const createAppointment = async (req, res) => {
    try {
        const { type, date, time } = req.body;

        if (!type || !date || !time) {
            return res.status(400).json({ message: 'Please provide all required fields' });
        }

        // Basic Jitsi Link Generation for Video Calls
        let meetingLink = '';
        if (type === 'video') {
            const uniqueId = Math.random().toString(36).substring(7);
            meetingLink = `https://meet.jit.si/MahalxmiTailors-${req.user._id}-${uniqueId}`;
        }

        const appointment = await Appointment.create({
            user: req.user._id,
            type,
            date,
            time,
            meetingLink
        });

        res.status(201).json(appointment);
    } catch (error) {
        console.error("Error creating appointment:", error);
        res.status(500).json({ message: 'Server error booking appointment' });
    }
};

// @desc    Get my appointments
// @route   GET /api/appointments
// @access  Private
const getMyAppointments = async (req, res) => {
    try {
        const appointments = await Appointment.find({ user: req.user._id }).sort({ date: 1, time: 1 });
        res.json(appointments);
    } catch (error) {
        console.error("Error fetching appointments:", error);
        res.status(500).json({ message: 'Server error fetching appointments' });
    }
};

// (Moved to bottom)

// @desc    Get all appointments (Admin)
// @route   GET /api/appointments/admin/all
// @access  Private/Admin
const getAllAppointments = async (req, res) => {
    try {
        const appointments = await Appointment.find({})
            .populate('user', 'firstName lastName email phone')
            .sort({ date: 1, time: 1 });
        res.json(appointments);
    } catch (error) {
        console.error("Error fetching all appointments:", error);
        res.status(500).json({ message: 'Server error fetching appointments' });
    }
};

// @desc    Update appointment status
// @route   PUT /api/appointments/:id/status
// @access  Private/Admin
const updateAppointmentStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const appointment = await Appointment.findById(req.params.id);

        if (!appointment) {
            return res.status(404).json({ message: 'Appointment not found' });
        }

        appointment.status = status;
        const updatedAppointment = await appointment.save();
        res.json(updatedAppointment);
    } catch (error) {
        console.error("Error updating appointment status:", error);
        res.status(500).json({ message: 'Server error updating appointment' });
    }
};

module.exports = {
    createAppointment,
    getMyAppointments,
    getAllAppointments,
    updateAppointmentStatus
};
