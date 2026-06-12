import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Loader, X, ChevronLeft, ChevronRight, ShoppingBag, Heart } from 'lucide-react';
import { CartContext } from '../context/CartContext';
import { WishlistContext } from '../context/WishlistContext';

const Gallery = () => {
    const [filter, setFilter] = useState('All');
    const [galleryItems, setGalleryItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedImageIndex, setSelectedImageIndex] = useState(null);
    const { addToCart } = React.useContext(CartContext);
    const { toggleWishlist, isInWishlist } = React.useContext(WishlistContext);

    useEffect(() => {
        const fetchGallery = async () => {
            try {
                const res = await api.get('/cms/gallery');
                setGalleryItems(res.data);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching gallery:", error);
                setLoading(false);
            }
        };
        fetchGallery();
    }, []);

    // Keyboard Navigation
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (selectedImageIndex === null) return;
            if (e.key === 'ArrowRight') handleNext();
            if (e.key === 'ArrowLeft') handlePrev();
            if (e.key === 'Escape') setSelectedImageIndex(null);
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [selectedImageIndex]);

    // Get unique categories from items
    const categories = ['All', ...new Set(galleryItems.map(item => item.category).filter(Boolean))];

    const filteredItems = filter === 'All' ? galleryItems : galleryItems.filter(item => item.category === filter);

    const handleNext = (e) => {
        e?.stopPropagation();
        setSelectedImageIndex((prev) => (prev + 1) % filteredItems.length);
    };

    const handlePrev = (e) => {
        e?.stopPropagation();
        setSelectedImageIndex((prev) => (prev - 1 + filteredItems.length) % filteredItems.length);
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-50"><Loader className="animate-spin text-brand-maroon" size={40} /></div>;

    return (
        <div className="pt-4 pb-12 bg-gray-50 min-h-screen">
            <div className="container mx-auto px-4">
                <div className="text-left mb-12">
                    <h1 className="text-4xl font-serif font-bold text-brand-maroon mb-4">Customer Gallery</h1>
                    <p className="text-gray-600">See how our creations bring elegance to your special moments.</p>
                </div>

                {/* Filter Tabs */}
                {categories.length > 1 && (
                    <div className="flex flex-wrap justify-center gap-4 mb-12">
                        {categories.map(cat => (
                            <button
                                key={cat}
                                onClick={() => setFilter(cat)}
                                className={`px-6 py-2 rounded-full border transition ${filter === cat
                                    ? 'bg-brand-maroon text-white border-brand-maroon'
                                    : 'bg-white text-gray-600 border-gray-300 hover:border-brand-maroon'
                                    }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                )}

                {/* Masonry Grid */}
                {filteredItems.length === 0 ? (
                    <div className="text-center text-gray-500 py-12">
                        <p>No images found in the gallery yet.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredItems.map((item, index) => (
                            <div
                                key={item._id}
                                onClick={() => setSelectedImageIndex(index)}
                                className="group relative overflow-hidden rounded-xl shadow-md cursor-pointer h-80"
                            >
                                <img
                                    src={item.imageUrl}
                                    alt={item.title}
                                    className="w-full h-full object-cover transition duration-700 group-hover:scale-110"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition duration-300 flex flex-col justify-end p-6">
                                    <div className="absolute top-4 right-4 flex flex-col gap-2 translate-x-10 group-hover:translate-x-0 transition duration-300">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                addToCart({
                                                    _id: item._id || `gallery-${index}`,
                                                    name: item.title || 'Gallery Item',
                                                    price: item.price || 0, // Fallback if no price
                                                    images: [{ url: item.imageUrl }],
                                                    description: item.description
                                                });
                                                alert("Added to cart!");
                                            }}
                                            className="bg-white text-brand-maroon p-2 rounded-full shadow-lg hover:bg-brand-maroon hover:text-white transition transform hover:scale-110"
                                            title="Add to Cart"
                                        >
                                            <ShoppingBag size={20} />
                                        </button>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                toggleWishlist({
                                                    _id: item._id || `gallery-${index}`,
                                                    name: item.title || 'Gallery Item',
                                                    price: item.price || 0,
                                                    images: [{ url: item.imageUrl }]
                                                }, 'CMS');
                                            }}
                                            className={`p-2 rounded-full shadow-lg transition transform hover:scale-110 ${isInWishlist(item._id)
                                                ? 'bg-red-500 text-white'
                                                : 'bg-white text-gray-500 hover:text-red-500'
                                                }`}
                                            title="Add to Wishlist"
                                        >
                                            <Heart size={20} fill={isInWishlist(item._id) ? "currentColor" : "none"} />
                                        </button>
                                    </div>
                                    {item.category && (
                                        <span className="text-brand-gold text-xs font-bold tracking-widest uppercase mb-1">{item.category}</span>
                                    )}
                                    <h3 className="text-white text-lg font-bold">{item.title}</h3>
                                    {item.price && <p className="text-white/90 text-sm font-medium">₹{item.price}</p>}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Lightbox Modal */}
            {selectedImageIndex !== null && filteredItems[selectedImageIndex] && (
                <div className="fixed inset-0 z-[60] bg-black/95 flex items-center justify-center p-4">
                    {/* Close Button */}
                    <button
                        onClick={() => setSelectedImageIndex(null)}
                        className="absolute top-4 right-4 text-white/70 hover:text-white transition p-2 bg-black/20 rounded-full"
                    >
                        <X size={32} />
                    </button>

                    {/* Navigation Buttons */}
                    <button
                        onClick={handlePrev}
                        className="absolute left-4 text-white/70 hover:text-white transition p-2 bg-black/20 rounded-full"
                    >
                        <ChevronLeft size={48} />
                    </button>

                    <button
                        onClick={handleNext}
                        className="absolute right-4 text-white/70 hover:text-white transition p-2 bg-black/20 rounded-full"
                    >
                        <ChevronRight size={48} />
                    </button>

                    {/* Image */}
                    <div className="max-w-5xl max-h-[85vh] flex flex-col items-center">
                        <img
                            src={filteredItems[selectedImageIndex].imageUrl}
                            alt={filteredItems[selectedImageIndex].title}
                            className="max-h-[80vh] w-auto object-contain rounded-lg shadow-2xl"
                        />
                        <div className="mt-4 text-center">
                            <h3 className="text-xl font-bold text-white font-serif">{filteredItems[selectedImageIndex].title}</h3>
                            {filteredItems[selectedImageIndex].category && (
                                <span className="text-brand-gold text-sm tracking-widest uppercase">{filteredItems[selectedImageIndex].category}</span>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Gallery;
