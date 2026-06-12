import React, { useState, useEffect } from 'react';
import { Star, User } from 'lucide-react';
import { addReview, getProductReviews } from '../../services/api';

const ReviewSection = ({ productId, user }) => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        if (productId) fetchReviews();
    }, [productId]);

    const fetchReviews = async () => {
        try {
            const data = await getProductReviews(productId);
            setReviews(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!user) return alert('Please login to review');
        setSubmitting(true);
        try {
            const token = localStorage.getItem('token');
            await addReview({ productId, rating, comment }, token);
            setMessage('Review added successfully!');
            setComment('');
            setRating(5);
            fetchReviews(); // Refresh list
        } catch (error) {
            setMessage(error.response?.data?.message || 'Failed to add review');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 mt-12">
            <h2 className="text-2xl font-serif font-bold text-gray-800 mb-6">Customer Reviews</h2>

            {/* List Reviews */}
            <div className="space-y-6 mb-8">
                {loading ? <p>Loading reviews...</p> : reviews.length === 0 ? (
                    <p className="text-gray-500 italic">No reviews yet. Be the first to review!</p>
                ) : (
                    reviews.map((review) => (
                        <div key={review._id} className="border-b border-gray-100 pb-6 last:border-0 hover:bg-gray-50 p-4 rounded-lg transition">
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                    <div className="bg-gray-200 rounded-full w-8 h-8 flex items-center justify-center text-gray-500">
                                        <User size={16} />
                                    </div>
                                    <span className="font-bold text-gray-800">{review.name}</span>
                                </div>
                                <span className="text-sm text-gray-400">{new Date(review.createdAt).toLocaleDateString()}</span>
                            </div>
                            <div className="flex text-yellow-400 mb-2">
                                {[...Array(5)].map((_, i) => (
                                    <Star key={i} size={16} fill={i < review.rating ? "currentColor" : "none"} className={i < review.rating ? "text-yellow-400" : "text-gray-300"} />
                                ))}
                            </div>
                            <p className="text-gray-600 leading-relaxed">{review.comment}</p>
                        </div>
                    ))
                )}
            </div>

            {/* Add Review Form */}
            {user ? (
                <div className="bg-gray-50 p-6 rounded-lg border border-gray-100">
                    <h3 className="font-bold text-lg text-gray-800 mb-4">Write a Review</h3>
                    {message && <p className={`mb-4 text-sm ${message.includes('success') ? 'text-green-600' : 'text-red-600'}`}>{message}</p>}
                    <form onSubmit={handleSubmit}>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Rating</label>
                            <div className="flex gap-1">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        type="button"
                                        key={star}
                                        onClick={() => setRating(star)}
                                        className={`transition ${star <= rating ? 'text-yellow-400 scale-110' : 'text-gray-300'}`}
                                    >
                                        <Star size={24} fill={star <= rating ? "currentColor" : "none"} />
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Comment</label>
                            <textarea
                                className="w-full p-3 border border-gray-200 rounded-lg focus:ring-brand-gold focus:border-brand-gold"
                                rows="3"
                                placeholder="Share your experience..."
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                required
                            ></textarea>
                        </div>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="bg-brand-maroon text-white px-6 py-2 rounded-lg font-bold hover:bg-red-900 transition disabled:opacity-70"
                        >
                            {submitting ? 'Submitting...' : 'Submit Review'}
                        </button>
                    </form>
                </div>
            ) : (
                <div className="text-center p-6 bg-gray-50 rounded-lg">
                    <p>Please <a href="/login" className="text-brand-maroon underline font-bold">login</a> to write a review.</p>
                </div>
            )}
        </div>
    );
};

export default ReviewSection;
