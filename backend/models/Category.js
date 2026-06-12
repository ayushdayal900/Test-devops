const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
    },
    slug: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
    },
    description: String,
    imageUrl: String,
    basePrice: {
        type: Number,
        required: true,
    },
    isActive: {
        type: Boolean,
        default: true,
    },
    displayOrder: Number,
}, {
    timestamps: true,
});

module.exports = mongoose.model('Category', categorySchema);
