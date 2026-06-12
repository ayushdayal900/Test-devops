const MeasurementProfile = require('../models/MeasurementProfile');
const User = require('../models/User');

// @desc    Get current user's measurement profile
// @route   GET /api/customers/measurements
// @access  Private
exports.getMeasurementProfile = async (req, res) => {
    try {
        const profile = await MeasurementProfile.findOne({ user: req.user.id });
        if (profile) {
            res.json(profile);
        } else {
            res.status(404).json({ message: 'No measurement profile found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Create or Update measurement profile
// @route   POST /api/customers/measurements
// @access  Private
exports.createOrUpdateMeasurementProfile = async (req, res) => {
    try {
        const {
            profileName,
            blouseLength,
            blouseWidth,
            sareeLength,
            shoulderWidth,
            waist,
            hip,
            notes,
        } = req.body;

        const profileFields = {
            user: req.user.id,
            profileName,
            blouseLength,
            blouseWidth,
            sareeLength,
            shoulderWidth,
            waist,
            hip,
            notes,
        };

        let profile = await MeasurementProfile.findOne({ user: req.user.id });

        if (profile) {
            // Update
            profile = await MeasurementProfile.findOneAndUpdate(
                { user: req.user.id },
                { $set: profileFields },
                { new: true }
            );
            return res.json(profile);
        }

        // Create
        profile = new MeasurementProfile(profileFields);
        await profile.save();
        res.json(profile);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Add a new address
// @route   POST /api/customers/address
// @access  Private
exports.addAddress = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const newAddress = req.body;
        user.addresses.push(newAddress);
        await user.save();

        res.json(user.addresses);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Delete an address
// @route   DELETE /api/customers/address/:id
// @access  Private
exports.deleteAddress = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.addresses = user.addresses.filter(
            (address) => address._id.toString() !== req.params.id
        );

        await user.save();
        res.json(user.addresses);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};
