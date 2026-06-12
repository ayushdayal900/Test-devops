import React, { useContext } from 'react';
import { CartContext } from '../context/CartContext';
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Cart = () => {
    const { cartItems, removeFromCart, updateQuantity, cartTotal } = useContext(CartContext);
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();

    if (cartItems.length === 0) {
        return (
            <div className="min-h-screen pt-32 pb-12 bg-gray-50 flex flex-col items-center justify-center text-center px-4">
                <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-md mb-6">
                    <ShoppingBag size={40} className="text-gray-300" />
                </div>
                <h2 className="text-2xl font-serif font-bold text-gray-800 mb-2">Your Cart is Empty</h2>
                <p className="text-gray-500 mb-8 max-w-sm">
                    Looks like you haven't added any elegant designs to your cart yet.
                </p>
                <Link to="/designs" className="bg-brand-maroon text-white px-8 py-3 rounded-full font-bold hover:bg-red-900 transition shadow-lg">
                    Start Shopping
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen pt-32 pb-12 bg-gray-50">
            <div className="container mx-auto px-4 max-w-6xl">
                <h1 className="text-3xl font-serif font-bold text-brand-maroon mb-8">Shopping Cart</h1>

                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Cart Items List */}
                    <div className="flex-1 space-y-6">
                        {cartItems.map((item) => (
                            <div key={item.uniqueId} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col sm:flex-row gap-6 hover:shadow-md transition">
                                {/* Image */}
                                <div className="w-full sm:w-32 h-32 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden">
                                    <img
                                        src={item.images?.[0]?.url || item.image || 'https://via.placeholder.com/150'}
                                        alt={item.name}
                                        className="w-full h-full object-cover"
                                    />
                                </div>

                                {/* Details */}
                                <div className="flex-1">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="font-serif font-bold text-lg text-brand-maroon">{item.name}</h3>
                                            <p className="text-sm text-gray-500 mb-2">{item.category?.name || item.category}</p>
                                        </div>
                                        <button
                                            onClick={() => removeFromCart(item.uniqueId)}
                                            className="text-gray-400 hover:text-red-600 transition p-1"
                                        >
                                            <Trash2 size={20} />
                                        </button>
                                    </div>

                                    {/* Customizations */}
                                    {item.customization && (
                                        <div className="bg-brand-ivory/50 p-3 rounded-lg text-sm text-gray-700 space-y-1 mb-4 border border-brand-gold/10">
                                            {item.customization.fabric && <p><span className="font-semibold">Fabric:</span> {item.customization.fabric}</p>}
                                            {item.customization.lining && <p><span className="font-semibold">Lining:</span> {item.customization.lining}</p>}
                                            {item.customization.blouseStitching && <p><span className="font-semibold">Blouse:</span> {item.customization.blouseStitching}</p>}
                                        </div>
                                    )}

                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center border border-gray-200 rounded-lg">
                                            <button
                                                onClick={() => updateQuantity(item.uniqueId, item.quantity - 1)}
                                                className="px-3 py-1 text-gray-600 hover:bg-gray-100"
                                            >
                                                <Minus size={14} />
                                            </button>
                                            <span className="px-3 font-medium text-gray-900">{item.quantity}</span>
                                            <button
                                                onClick={() => updateQuantity(item.uniqueId, item.quantity + 1)}
                                                className="px-3 py-1 text-gray-600 hover:bg-gray-100"
                                            >
                                                <Plus size={14} />
                                            </button>
                                        </div>
                                        <p className="font-bold text-lg text-gray-900">₹{item.price * item.quantity}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Order Summary */}
                    <div className="lg:w-96">
                        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 sticky top-32">
                            <h3 className="text-xl font-bold text-gray-900 mb-6">Order Summary</h3>

                            <div className="space-y-4 mb-6 pb-6 border-b border-gray-100">
                                <div className="flex justify-between text-gray-600">
                                    <span>Subtotal</span>
                                    <span>₹{cartTotal}</span>
                                </div>
                                <div className="flex justify-between text-gray-600">
                                    <span>Estimated Tax</span>
                                    <span>₹0</span>
                                </div>
                                <div className="flex justify-between text-gray-600">
                                    <span>Shipping</span>
                                    <span className="text-green-600 text-sm">Calculated at checkout</span>
                                </div>
                            </div>

                            <div className="flex justify-between items-center mb-8">
                                <span className="font-bold text-lg text-gray-900">Total</span>
                                <span className="font-bold text-2xl text-brand-maroon">₹{cartTotal}</span>
                            </div>

                            <button
                                onClick={() => {
                                    if (user) {
                                        navigate('/checkout');
                                    } else {
                                        alert('Please login to proceed to checkout.');
                                        navigate('/login');
                                    }
                                }}
                                className="w-full flex items-center justify-center gap-2 bg-brand-maroon text-white py-4 rounded-lg font-bold shadow-lg hover:bg-red-900 transition"
                            >
                                Proceed to Checkout <ArrowRight size={20} />
                            </button>

                            <div className="mt-6 text-center">
                                <p className="text-xs text-gray-400">
                                    Secure Checkout • 100% Satisfaction Guarantee
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Cart;
