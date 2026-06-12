const mongoose = require('mongoose');

const wishlistSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    products: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
    }],
    galleryItems: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'CMS'
    }]
}, {
    timestamps: true
});

module.exports = mongoose.model('Wishlist', wishlistSchema);
