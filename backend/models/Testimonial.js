const mongoose = require('mongoose');

const testimonialSchema = new mongoose.Schema({
    customerName: { type: String, required: true },
    quote: { type: String, required: true },
    rating: { type: Number, default: 5 },
    isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Testimonial', testimonialSchema);
