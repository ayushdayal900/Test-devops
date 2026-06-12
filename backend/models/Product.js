const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    price: {
        type: Number,
        required: true,
    },
    estimatedDays: {
        type: Number,
        default: 14,
    },
    fabricOptions: [String], // e.g. ['Silk', 'Cotton']
    customizationOptions: {
        type: Map,
        of: mongoose.Schema.Types.Mixed // Flexible JSON structure
    },
    images: [{
        url: String,
        altText: String
    }],
    isActive: {
        type: Boolean,
        default: true,
    },
    rating: {
        type: Number,
        default: 4.5,
    },
    inStock: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true,
});

productSchema.index({ category: 1 }); // Optimize Category Filtering

module.exports = mongoose.model('Product', productSchema);
