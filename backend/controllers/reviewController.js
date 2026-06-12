const Review = require('../models/reviewModel');
const Product = require('../models/Product');

// @desc    Create a new review
// @route   POST /api/reviews
// @access  Private (Customer)
const addReview = async (req, res) => {
    try {
        const { productId, rating, comment } = req.body;

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        const alreadyReviewed = await Review.findOne({
            product: productId,
            user: req.user._id
        });

        if (alreadyReviewed) {
            return res.status(400).json({ message: 'You have already reviewed this product' });
        }

        const review = await Review.create({
            product: productId,
            user: req.user._id,
            name: req.user.firstName + ' ' + req.user.lastName,
            rating: Number(rating),
            comment
        });

        res.status(201).json(review);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get reviews for a product
// @route   GET /api/reviews/:productId
// @access  Public
const getProductReviews = async (req, res) => {
    try {
        const reviews = await Review.find({ product: req.params.productId }).sort({ createdAt: -1 });
        res.status(200).json(reviews);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    addReview,
    getProductReviews
};
