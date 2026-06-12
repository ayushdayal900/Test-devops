const Wishlist = require('../models/wishlistModel');
const CMS = require('../models/CMS'); // Ensure model is registered for populate

// @desc    Get user wishlist
// @route   GET /api/wishlist
// @access  Private
const getWishlist = async (req, res) => {
    try {
        // Log query
        console.log("Fetching wishlist for user:", req.user._id);

        let wishlistRaw = await Wishlist.findOne({ user: req.user._id });
        console.log("Raw Wishlist (Unpopulated):", wishlistRaw);

        let wishlist = await Wishlist.findOne({ user: req.user._id })
            .populate('products')
            .populate('galleryItems');

        console.log("Populated Wishlist - galleryItems:", wishlist?.galleryItems);

        if (!wishlist) {
            wishlist = await Wishlist.create({ user: req.user._id, products: [], galleryItems: [] });
        }

        res.status(200).json(wishlist);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Add or Remove product/item from wishlist
// @route   POST /api/wishlist/toggle
// @access  Private
const toggleWishlist = async (req, res) => {
    try {
        const { productId, type = 'Product' } = req.body;
        const userId = req.user._id;

        // 1. Check if item is already in wishlist to determine action (Add vs Remove)
        // We rely on the specific array presence
        const queryField = type === 'CMS' ? 'galleryItems' : 'products';

        const exists = await Wishlist.findOne({
            user: userId,
            [queryField]: productId
        });

        let update;
        let message;

        if (exists) {
            // Remove
            update = { $pull: { [queryField]: productId } };
            message = 'Removed from wishlist';
        } else {
            // Add (addToSet prevents duplicates if any race condition)
            update = { $addToSet: { [queryField]: productId } };
            message = 'Added to wishlist';
        }

        // 2. Perform Atomic Update
        // upsert: true ensures document creation if missing
        const wishlist = await Wishlist.findOneAndUpdate(
            { user: userId },
            update,
            { new: true, upsert: true }
        )
            .populate('products')
            .populate('galleryItems'); // Ensure we return populated data for verification

        res.status(200).json({ message, wishlist });

    } catch (error) {
        console.error("Error in atomic toggleWishlist:", error);
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getWishlist,
    toggleWishlist
};
