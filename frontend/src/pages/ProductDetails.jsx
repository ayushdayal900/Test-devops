import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProductById, toggleWishlist } from '../services/api'; // Need to ensure this exists or use getProducts().find
import { CartContext } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';
import { Minus, Plus, ShoppingBag, ArrowLeft, Upload, Heart } from 'lucide-react';
import ReviewSection from '../components/Products/ReviewSection';

const ProductDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { addToCart } = useContext(CartContext);
    const { user } = useContext(AuthContext);

    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [mainImage, setMainImage] = useState('');

    // Customization State
    const [quantity, setQuantity] = useState(1);
    const [customization, setCustomization] = useState({
        fabric: '',
        lining: 'Cotton', // Default
        blouseStitching: 'No',
        measurementsProfile: 'standard', // or 'custom'
        specialRequests: ''
    });

    const [isWishlisted, setIsWishlisted] = useState(false);

    useEffect(() => {
        const fetchProductAndWishlist = async () => {
            try {
                const data = await getProductById(id);
                setProduct(data);
                setMainImage(data.images[0]?.url || '');
                if (data.fabricOptions?.length > 0) {
                    setCustomization(prev => ({ ...prev, fabric: data.fabricOptions[0] }));
                }

                // Check Wishlist Status
                if (user) {
                    const token = localStorage.getItem('token');
                    if (token) {
                        const { getWishlist } = await import('../services/api');
                        const wData = await getWishlist(token);
                        const ids = wData.products.map(p => typeof p === 'object' ? p._id : p);
                        setIsWishlisted(ids.includes(id));
                    }
                }

                setLoading(false);
            } catch (error) {
                console.error("Failed to load product", error);
                setLoading(false);
            }
        };
        fetchProductAndWishlist();
    }, [id, user]);

    const handleAddToCart = () => {
        const itemToAdd = {
            ...product,
            quantity,
            customization,
            uniqueId: new Date().getTime() // simple unique ID for cart items with diff customizations
        };
        addToCart(itemToAdd);
        navigate('/cart'); // Redirect to cart or open drawer
    };

    if (loading) return <div className="min-h-screen py-32 flex justify-center"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-maroon"></div></div>;
    if (!product) return <div className="min-h-screen py-32 text-center">Product not found.</div>;

    const totalPrice = product.price * quantity; // Base calculation, can add extra costs for lining etc.

    return (
        <div className="bg-white min-h-screen pt-24 pb-12">
            <div className="container mx-auto px-4">
                <button onClick={() => navigate(-1)} className="flex items-center text-gray-500 hover:text-brand-maroon mb-6 transition">
                    <ArrowLeft size={20} className="mr-2" /> Back
                </button>

                <div className="grid md:grid-cols-2 gap-12">
                    {/* Image Gallery */}
                    <div className="space-y-4">
                        <div className="rounded-2xl overflow-hidden shadow-lg border border-gray-100 h-[500px]">
                            <img src={mainImage} alt={product.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex gap-4 overflow-x-auto pb-2">
                            {product.images?.map((img, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setMainImage(img.url)}
                                    className={`w-20 h-20 rounded-lg overflow-hidden border-2 flex-shrink-0 ${mainImage === img.url ? 'border-brand-maroon' : 'border-transparent'}`}
                                >
                                    <img src={img.url} alt="thumbnail" className="w-full h-full object-cover" />
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Product Info & Customization */}
                    <div>
                        <span className="text-brand-gold font-bold uppercase tracking-wider text-sm">{product.category?.name || 'Collection'}</span>
                        <h1 className="text-4xl font-serif font-bold text-brand-maroon mb-4">{product.name}</h1>
                        <div className="flex items-center gap-4 mb-6">
                            <span className="text-2xl font-bold text-gray-900">₹{product.price}</span>
                            <span className="text-green-600 bg-green-50 px-3 py-1 rounded-full text-sm font-medium">In Stock</span>
                        </div>
                        <p className="text-gray-600 leading-relaxed mb-8 border-b border-gray-100 pb-8">
                            {product.description}
                        </p>

                        {/* Customization Form */}
                        <div className="space-y-6 mb-8">
                            <h3 className="font-bold text-lg text-gray-800">Customize Your Order</h3>

                            {/* Fabric Selection */}
                            {product.fabricOptions?.length > 0 && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Select Fabric</label>
                                    <div className="flex flex-wrap gap-3">
                                        {product.fabricOptions.map(fabric => (
                                            <button
                                                key={fabric}
                                                onClick={() => setCustomization({ ...customization, fabric })}
                                                className={`px-4 py-2 rounded-lg border ${customization.fabric === fabric ? 'bg-brand-maroon text-white border-brand-maroon' : 'bg-white text-gray-600 border-gray-200 hover:border-brand-maroon'}`}
                                            >
                                                {fabric}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Lining Option */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Lining Material</label>
                                <select
                                    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-brand-gold focus:border-brand-gold"
                                    value={customization.lining}
                                    onChange={(e) => setCustomization({ ...customization, lining: e.target.value })}
                                >
                                    <option value="Cotton">Cotton (Breathable)</option>
                                    <option value="Satin">Satin (Smooth Finish)</option>
                                    <option value="None">No Lining</option>
                                </select>
                            </div>

                            {/* Special Requests */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Special Requests</label>
                                <textarea
                                    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-brand-gold focus:border-brand-gold"
                                    rows="3"
                                    placeholder="Any specific instructions for the tailor..."
                                    value={customization.specialRequests}
                                    onChange={(e) => setCustomization({ ...customization, specialRequests: e.target.value })}
                                ></textarea>
                            </div>

                            {/* Reference Image (Mock) */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Reference Image (Optional)</label>
                                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-brand-maroon transition cursor-pointer bg-gray-50">
                                    <Upload className="mx-auto text-gray-400 mb-2" />
                                    <p className="text-sm text-gray-500">Click to upload reference image</p>
                                </div>
                            </div>
                        </div>

                        {/* Add to Cart Footer */}
                        <div className="flex flex-col sm:flex-row gap-4 items-center border-t border-gray-100 pt-8">
                            <div className="flex items-center border border-gray-200 rounded-lg">
                                <button
                                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                    className="px-4 py-3 text-gray-600 hover:bg-gray-100"
                                >
                                    <Minus size={16} />
                                </button>
                                <span className="px-4 font-bold text-gray-900">{quantity}</span>
                                <button
                                    onClick={() => setQuantity(quantity + 1)}
                                    className="px-4 py-3 text-gray-600 hover:bg-gray-100"
                                >
                                    <Plus size={16} />
                                </button>
                            </div>

                            <button
                                onClick={handleAddToCart}
                                className="flex-1 bg-brand-maroon text-white h-12 rounded-lg font-bold shadow-lg hover:bg-red-900 transition flex items-center justify-center gap-2"
                            >
                                <ShoppingBag size={20} />
                                Add to Cart - ₹{totalPrice}
                            </button>

                            <button
                                onClick={async () => {
                                    try {
                                        const token = localStorage.getItem('token');
                                        if (!token) return alert('Please login first');

                                        // Optimistic Update
                                        setIsWishlisted(!isWishlisted);

                                        await toggleWishlist(product._id, token);
                                        // alert('Wishlist updated!'); // Removed for smoother UX
                                    } catch (err) {
                                        console.error(err);
                                        setIsWishlisted(!isWishlisted); // Revert
                                    }
                                }}
                                className={`w-12 h-12 border-2 rounded-lg flex items-center justify-center transition ${isWishlisted ? 'border-brand-maroon bg-brand-maroon/10 text-red-500' : 'border-brand-maroon text-brand-maroon hover:bg-red-50'}`}
                                title={isWishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
                            >
                                <Heart size={24} className={isWishlisted ? "fill-current" : ""} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Reviews Section */}
                <div className="mt-16">
                    <ReviewSection productId={id} user={user} />
                </div>
            </div>
        </div>
    );
};

export default ProductDetails;
