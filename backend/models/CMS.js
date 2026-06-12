const mongoose = require('mongoose');

const cmsSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ['banner', 'testimonial', 'faq', 'gallery', 'feature', 'process', 'page_content', 'contact_info'],
        required: true
    },
    // Generic Fields (Shared across types)
    title: String,
    subTitle: String,
    description: String,
    imageUrl: String,
    link: String,
    icon: String, // Store icon name (e.g., 'Scissors', 'MapPin')

    // Gallery Specific
    category: String, // e.g., 'Wedding', 'Festive'

    // Page Content Specific
    page: String, // e.g., 'home', 'about'
    section: String, // e.g., 'hero', 'story'

    // Testimonial Specific
    author: String,
    role: String,
    rating: {
        type: Number,
        min: 1,
        max: 5
    },
    content: String, // Main text content

    // FAQ Specific
    question: String, // (mapped to title alternatively)

    isActive: {
        type: Boolean,
        default: true
    },
    order: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('CMS', cmsSchema);
