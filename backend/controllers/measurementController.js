const Measurement = require('../models/measurementModel');

// @desc    Get user measurements
// @route   GET /api/measurements
// @access  Private
const getMeasurements = async (req, res) => {
    try {
        const measurements = await Measurement.find({ user: req.user._id });
        res.status(200).json(measurements);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create or Update measurement profile
// @route   POST /api/measurements
// @access  Private
const saveMeasurement = async (req, res) => {
    try {
        const {
            profileName, shoulder, bust, chest, waist, armHole,
            sleeveLength, bicep, hips, inseam, length, thigh, unit, standardSize
        } = req.body;

        // Check if a profile with this name already exists for the user
        // For simplicity, we might just update if ID is provided, but here let's assume one profile per name or just create new
        // Better logic: if an ID is passed in body, update. If not, create new.

        // For this first version, let's limit to ONE main profile per user to keep it simple, or update if exists
        let measurement = await Measurement.findOne({ user: req.user._id, profileName: profileName || 'My Measurements' });

        if (measurement) {
            // Update existing
            measurement.shoulder = shoulder;
            measurement.bust = bust;
            measurement.chest = chest;
            measurement.waist = waist;
            measurement.armHole = armHole;
            measurement.sleeveLength = sleeveLength;
            measurement.bicep = bicep;
            measurement.hips = hips;
            measurement.inseam = inseam;
            measurement.length = length;
            measurement.thigh = thigh;
            measurement.unit = unit || 'inch';
            measurement.standardSize = standardSize || 'Custom';

            const updatedMeasurement = await measurement.save();
            return res.status(200).json(updatedMeasurement);
        } else {
            // Create new
            const newMeasurement = await Measurement.create({
                user: req.user._id,
                profileName: profileName || 'My Measurements',
                shoulder, bust, chest, waist, armHole, sleeveLength, bicep, hips, inseam, length, thigh, unit,
                standardSize: standardSize || 'Custom'
            });
            return res.status(201).json(newMeasurement);
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Delete measurement profile
// @route   DELETE /api/measurements/:id
// @access  Private
const deleteMeasurement = async (req, res) => {
    try {
        const measurement = await Measurement.findById(req.params.id);

        if (!measurement) {
            return res.status(404).json({ message: 'Measurement profile not found' });
        }

        // Check user
        if (measurement.user.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'User not authorized' });
        }

        await measurement.deleteOne();
        res.status(200).json({ id: req.params.id });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getMeasurements,
    saveMeasurement,
    deleteMeasurement
};
