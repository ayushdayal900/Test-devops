import React, { useEffect, useState, useContext } from 'react';
import { getProducts, getCategories } from '../services/api';
import { Filter, ShoppingBag, X, Heart } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { CartContext } from '../context/CartContext';
import { WishlistContext } from '../context/WishlistContext';

const Designs = () => {
    const { t } = useTranslation();
    const { addToCart } = useContext(CartContext);
    const { user } = useContext(AuthContext);
    const { toggleWishlist, wishlistItems } = useContext(WishlistContext);
    const navigate = useNavigate();

    // State
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showFilters, setShowFilters] = useState(false); // Mobile toggle

    // View Mode: 'categories' | 'products'
    const [viewMode, setViewMode] = useState('categories');

    // Filter State
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [priceRange, setPriceRange] = useState([0, 25000]);
    const [sortBy, setSortBy] = useState('newest');



    // Lightbox State
    const [selectedImage, setSelectedImage] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [productsData, categoriesData] = await Promise.all([getProducts(), getCategories()]);

                // Products
                if (Array.isArray(productsData)) setProducts(productsData);
                else setProducts([]);

                // Categories
                if (Array.isArray(categoriesData)) setCategories(categoriesData);
                else setCategories([]);

                setLoading(false);
            } catch (err) {
                console.error("Error loading data:", err);
                setError('Failed to load designs. Please try again later.');
                setLoading(false);
            }
        };
        fetchData();
    }, []);



    // Handlers
    const handleCategoryClick = (catName) => {
        setSelectedCategories([catName]);
        setViewMode('products');
    };

    const toggleCategory = (cat) => {
        setSelectedCategories(prev =>
            prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
        );
    };

    const handleSort = (a, b) => {
        if (sortBy === 'price-low') return a.price - b.price;
        if (sortBy === 'price-high') return b.price - a.price;
        // if (sortBy === 'popular') return b.rating - a.rating; // Future
        return 0; // Newest (default order from DB usually)
    };

    // Derived State
    const filteredProducts = products.filter(product => {
        // Category Filter
        const catName = product.category?.name || product.category;
        if (selectedCategories.length > 0 && !selectedCategories.includes(catName)) {
            return false;
        }

        // Price Filter
        const pPrice = Number(product.price || 0);
        if (pPrice < priceRange[0] || pPrice > priceRange[1]) {
            return false;
        }

        return true;
    }).sort(handleSort);

    console.log("Total Products:", products.length, "Filtered Count:", filteredProducts.length, "Categories:", categories.length);

    if (loading) return <div className="min-h-screen flex items-center justify-center bg-brand-ivory"><div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-brand-maroon"></div></div>;
    if (error) return <div className="min-h-screen flex items-center justify-center bg-brand-ivory text-red-600"><p>{error}</p></div>;



    return (
        <div className="bg-brand-ivory min-h-screen pt-4 pb-12">
            <div className="container mx-auto px-4">

                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-center mb-8">
                    <div>
                        <h1 className="text-4xl font-serif font-bold text-brand-maroon mb-2">{t('nav.designs')}</h1>
                        <p className="text-brand-charcoal opacity-80">Explore our exclusive handcrafted collection.</p>
                    </div>
                </div>

                {viewMode === 'categories' ? (
                    categories.length === 0 ? (
                        <div className="text-center py-20">
                            <h3 className="text-xl font-serif text-gray-500">No categories found</h3>
                            <p className="text-gray-400">Please add categories in the Admin Dashboard.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                            {categories.map(cat => (
                                <div
                                    key={cat._id}
                                    onClick={() => handleCategoryClick(cat.name)}
                                    className="group cursor-pointer bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 h-64 relative"
                                >
                                    {/* We don't have category images yet, so we'll use a placeholder or try to find a product image from this category */}
                                    <div className="absolute inset-0 bg-brand-maroon/5 group-hover:bg-brand-maroon/10 transition"></div>
                                    <div className="h-full flex flex-col items-center justify-center p-6 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]">
                                        <h3 className="text-2xl font-serif font-bold text-brand-maroon group-hover:scale-110 transition duration-300">{cat.name}</h3>
                                        <span className="mt-2 text-sm text-gray-500 uppercase tracking-widest group-hover:text-brand-gold transition">View Collection</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )
                ) : (
                    /* Product Listing View */
                    <div className="flex flex-col md:flex-row gap-8">
                        {/* Sidebar Filters */}
                        <aside className={`
                            md:w-64 bg-white p-6 rounded-xl shadow-sm border border-gray-100 
                            h-fit md:sticky md:top-24
                            fixed inset-0 z-50 overflow-y-auto w-full md:relative md:z-auto
                            ${showFilters ? 'block' : 'hidden md:block'}
                        `}>
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="font-bold text-lg text-brand-maroon">Filters</h3>
                                <button onClick={() => setViewMode('categories')} className="text-sm underline text-gray-500 hover:text-brand-maroon">Back to Categories</button>
                                <X size={20} className="md:hidden cursor-pointer" onClick={() => setShowFilters(false)} />
                            </div>

                            {/* Category Filter */}
                            <div className="mb-8">
                                <h4 className="font-bold text-sm text-gray-800 mb-3 uppercase tracking-wide">Category</h4>
                                <div className="space-y-2">
                                    {categories.map(cat => (
                                        <label key={cat._id} className="flex items-center gap-2 cursor-pointer hover:text-brand-maroon">
                                            <input
                                                type="checkbox"
                                                checked={selectedCategories.includes(cat.name)}
                                                onChange={() => toggleCategory(cat.name)}
                                                className="rounded text-brand-maroon focus:ring-brand-gold"
                                            />
                                            <span className="text-gray-600 text-sm">{cat.name}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Price Filter */}
                            <div className="mb-8">
                                <h4 className="font-bold text-sm text-gray-800 mb-3 uppercase tracking-wide">Price Range</h4>
                                <input
                                    type="range"
                                    min="0"
                                    max="25000"
                                    step="500"
                                    value={priceRange[1]}
                                    onChange={(e) => setPriceRange([0, parseInt(e.target.value)])}
                                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-brand-maroon"
                                />
                                <div className="flex justify-between text-xs text-gray-500 mt-2">
                                    <span>₹0</span>
                                    <span>₹{priceRange[1]}</span>
                                </div>
                            </div>

                            {/* Sort */}
                            <div className="mb-4">
                                <h4 className="font-bold text-sm text-gray-800 mb-3 uppercase tracking-wide">Sort By</h4>
                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                    className="w-full text-sm border-gray-200 rounded-md focus:ring-brand-gold focus:border-brand-gold"
                                >
                                    <option value="newest">Newest</option>
                                    <option value="price-low">Price: Low to High</option>
                                    <option value="price-high">Price: High to Low</option>
                                </select>
                            </div>
                        </aside>

                        {/* Product Grid */}
                        <div className="flex-1">
                            <div className="flex justify-between items-center mb-4 md:hidden">
                                <button onClick={() => setViewMode('categories')} className="text-gray-600 text-sm flex items-center gap-1">← Categories</button>
                                <button onClick={() => setShowFilters(!showFilters)} className="flex items-center gap-2 px-4 py-2 border border-brand-gold rounded-full text-brand-maroon text-sm">
                                    <Filter size={14} /> Filters
                                </button>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {filteredProducts.map((product) => (
                                    <div key={product._id} className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition duration-300 group border border-gray-100 flex flex-col h-full">
                                        <div className="h-64 overflow-hidden relative cursor-zoom-in" onClick={() => setSelectedImage(product.images?.[0]?.url || product.image)}>
                                            <img
                                                src={product.images?.[0]?.url || product.image}
                                                alt={product.name}
                                                className="w-full h-full object-cover transition duration-700 group-hover:scale-110"
                                            />
                                            {/* Overlay Cart Button */}
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation(); // Prevent card click
                                                    if (user) {
                                                        addToCart(product);
                                                        alert('Added to cart!');
                                                    } else {
                                                        alert('Please login to add items to cart.');
                                                        navigate('/designs');
                                                    }
                                                }}
                                                className="absolute bottom-4 right-4 bg-white text-brand-maroon p-3 rounded-full shadow-lg hover:bg-brand-maroon hover:text-white transition transform translate-y-12 group-hover:translate-y-0 z-10"
                                            >
                                                <ShoppingBag size={20} />
                                            </button>
                                            {/* Wishlist Button */}
                                            <button
                                                onClick={async (e) => {
                                                    e.stopPropagation();
                                                    if (!user) return alert('Please login first');

                                                    // Use Context toggle
                                                    await toggleWishlist(product);
                                                }}
                                                className="absolute top-4 right-4 bg-white/90 p-2 rounded-full text-brand-maroon hover:bg-red-50 transition shadow-sm transform -translate-y-12 group-hover:translate-y-0 z-10"
                                            >
                                                <Heart size={20} className={wishlistItems.some(item => item._id === product._id) ? "fill-current text-red-500" : ""} />
                                            </button>
                                        </div>

                                        <div className="p-5 flex-1 flex flex-col">
                                            <div className="flex justify-between items-start mb-2">
                                                <span className="text-xs font-bold uppercase text-brand-gold bg-brand-maroon/5 px-2 py-1 rounded">
                                                    {product.category?.name || product.category}
                                                </span>
                                            </div>
                                            <h3 className="text-lg font-serif font-bold text-brand-maroon mb-2">{product.name}</h3>
                                            <p className="text-sm text-gray-500 mb-4 line-clamp-2 flex-grow">{product.description}</p>
                                            <div className="flex justify-between items-center pt-4 border-t border-gray-50">
                                                <span className="text-xl font-bold text-brand-maroon">₹{product.price}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            {products.length === 0 ? (
                                <div className="text-center py-20 text-gray-500">
                                    <p className="text-xl font-serif mb-2">Our Collection is Coming Soon/Empty</p>
                                    <p>No designs have been added to the catalog yet.</p>
                                </div>
                            ) : filteredProducts.length === 0 && (
                                <div className="text-center py-20 text-gray-500">
                                    <p>No designs match your filters.</p>
                                    <button onClick={() => { setSelectedCategories([]); setPriceRange([0, 25000]); }} className="text-brand-maroon underline mt-2">Clear Filters</button>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Lightbox Modal */}
            {selectedImage && (
                <div
                    className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4 cursor-zoom-out"
                    onClick={() => setSelectedImage(null)}
                >
                    <button
                        className="absolute top-6 right-6 text-white/70 hover:text-white p-2"
                        onClick={() => setSelectedImage(null)}
                    >
                        <X size={40} />
                    </button>
                    <img
                        src={selectedImage}
                        alt="Zoomed Product"
                        className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl animate-fade-in"
                        onClick={(e) => e.stopPropagation()} // Prevent close when clicking image
                    />
                </div>
            )}
        </div>
    );
};

export default Designs;
