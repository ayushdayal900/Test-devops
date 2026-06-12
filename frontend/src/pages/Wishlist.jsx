import React, { useState, useEffect, useContext } from 'react';
import { toggleWishlist } from '../services/api';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, Trash2, ArrowRight } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { WishlistContext } from '../context/WishlistContext';

const Wishlist = () => {
    // Rely on context state now
    const { wishlistItems, fetchWishlist, loading: contextLoading } = useContext(WishlistContext);
    const { user, token, loading: authLoading } = useContext(AuthContext);

    // Trigger fetch on mount if empty? Context handles it usually but we can force refresh
    useEffect(() => {
        if (token) fetchWishlist();
    }, [token]);

    const handleRemove = async (productId, type = 'Product') => {
        try {
            await toggleWishlist(productId, token, type);
            fetchWishlist();
        } catch (error) {
            console.error("Error removing item", error);
        }
    };

    if (authLoading) return <div className="min-h-screen pt-32 text-center"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-maroon mx-auto"></div></div>;

    if (!token) {
        return (
            <div className="min-h-[60vh] pt-32 flex flex-col items-center justify-center text-center px-4">
                <Heart size={64} className="text-gray-200 mb-6" />
                <h2 className="text-2xl font-serif font-bold text-gray-800 mb-2">Please Login</h2>
                <p className="text-gray-500 mb-6">Login to view your wishlist.</p>
                <Link to="/login" className="bg-brand-maroon text-white px-8 py-3 rounded-full hover:bg-red-900 transition">
                    Login Now
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pt-24 pb-12">
            <div className="container mx-auto px-4">
                <h1 className="text-3xl font-serif font-bold text-gray-900 mb-8 flex items-center gap-3">
                    <Heart className="text-brand-maroon fill-brand-maroon" /> My Wishlist
                </h1>

                {!wishlistItems?.length ? (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
                        <Heart size={48} className="mx-auto text-gray-300 mb-4" />
                        <h3 className="text-xl font-medium text-gray-900 mb-2">Your wishlist is empty</h3>
                        <p className="text-gray-500 mb-8">Save items you love to revisit later.</p>
                        <Link to="/designs" className="inline-flex items-center gap-2 text-brand-maroon font-bold hover:underline">
                            Explore Designs <ArrowRight size={18} />
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {wishlistItems.map(product => (
                            <div key={product._id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition group">
                                <div className="relative h-64 overflow-hidden">
                                    <img
                                        src={product.images?.[0]?.url || product.imageUrl || product.images?.[0]}
                                        alt={product.name || product.title}
                                        className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                                    />
                                    <button
                                        onClick={() => handleRemove(product._id, product._type)}
                                        className="absolute top-4 right-4 bg-white/90 p-2 rounded-full text-red-500 hover:bg-red-50 transition shadow-sm"
                                        title="Remove from Wishlist"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                                <div className="p-6">
                                    <h3 className="text-lg font-bold text-gray-800 mb-2">{product.name}</h3>
                                    <p className="text-brand-maroon font-bold text-xl mb-4">₹{product.price}</p>

                                    <div className="flex gap-3">
                                        <Link
                                            to={`/product/${product._id}`}
                                            className="flex-1 bg-gray-100 text-gray-800 py-2 rounded-lg font-medium hover:bg-gray-200 transition text-center"
                                        >
                                            View Details
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Wishlist;
