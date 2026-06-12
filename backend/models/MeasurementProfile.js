const mongoose = require('mongoose');

const measurementProfileSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    profileName: { // e.g., "Deepa's Saree Blouse" - helpful if user has multiple
        type: String,
        default: 'Default Profile'
    },
    blouseLength: Number,
    blouseWidth: Number,
    sareeLength: Number,
    shoulderWidth: Number,
    waist: Number,
    hip: Number,
    notes: String,
}, {
    timestamps: true,
});

module.exports = mongoose.model('MeasurementProfile', measurementProfileSchema);
