import React, { useContext, useState, useEffect } from 'react';
import { CartContext } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';
import { MapPin, Ruler, Check, CreditCard } from 'lucide-react';

const Checkout = () => {
    const { cartItems, cartTotal, clearCart } = useContext(CartContext);
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();

    const [addresses, setAddresses] = useState([]);
    const [measurements, setMeasurements] = useState(null);
    const [selectedAddress, setSelectedAddress] = useState(null);
    const [selectedMeasurement, setSelectedMeasurement] = useState(null);
    const [paymentMethod, setPaymentMethod] = useState('Online'); // Default to Online
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (user) {
            fetchUserData();
            fetchMeasurements();
        }
    }, [user]);

    const fetchUserData = async () => {
        try {
            const res = await api.get('/auth/me');
            if (res.data.addresses) {
                setAddresses(res.data.addresses);
                // Auto-select default
                const def = res.data.addresses.find(a => a.isDefault);
                if (def) setSelectedAddress(def);
            }
        } catch (error) {
            console.error(error);
        }
    };

    const fetchMeasurements = async () => {
        try {
            console.log("Fetching measurements in Checkout...");
            const res = await api.get('/measurements');
            console.log("Checkout Measurements Response:", res.data);
            // Backend returns array of profiles.
            if (res.data && res.data.length > 0) {
                setMeasurements(res.data[0]);
                setSelectedMeasurement(res.data[0]._id);
                console.log("Selected Measurement:", res.data[0]._id);
            } else {
                setMeasurements(null);
                console.log("No measurements found in array.");
            }
        } catch (error) {
            console.error("No measurements error:", error);
        }
    };

    const loadRazorpay = () => {
        return new Promise((resolve) => {
            const script = document.createElement('script');
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
        });
    };

    const handlePlaceOrder = async () => {
        if (!selectedAddress) return alert("Please select a delivery address");
        if (!selectedMeasurement) return alert("Please have a valid measurement profile");

        setLoading(true);
        try {

            // 1. Create Local Order
            const orderData = {
                orderItems: cartItems.map(item => ({
                    product: item._id,
                    quantity: item.quantity,
                    unitPrice: item.price,
                    totalPrice: item.price * item.quantity
                })),
                deliveryAddress: selectedAddress,
                measurementProfileId: selectedMeasurement,
                totalAmount: cartTotal,
                paymentMethod: paymentMethod // Pass selected method
            };

            const orderRes = await api.post('/orders', orderData);
            const localOrder = orderRes.data;

            if (!localOrder || !localOrder._id) throw new Error("Order creation failed");

            // Handle COD Flow
            if (paymentMethod === 'COD') {
                alert("Order Placed Successfully via Cash on Delivery!");
                clearCart();
                navigate(`/order/${localOrder._id}`);
                return;
            }

            // Handle Online Payment Flow (Razorpay)
            // 2. Load Razorpay SDK
            const res = await loadRazorpay();
            if (!res) {
                alert('Razorpay SDK failed to load. Are you online?');
                return;
            }

            // 3. Create Razorpay Order
            const paymentRes = await api.post('/payments/create-order', {
                orderId: localOrder._id
            });

            const { razorpay_order_id, amount, currency, key, customer_name, customer_email, customer_contact, description } = paymentRes.data;

            const options = {
                key: key,
                amount: amount,
                currency: currency,
                name: "Mahalaxmi Tailors",
                description: description || "Custom Stitching Order",
                order_id: razorpay_order_id,
                handler: async function (response) {
                    // 4. Verify Payment
                    try {
                        const verifyRes = await api.post('/payments/verify', {
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                            orderId: localOrder._id // Pass local order ID for updating status
                        });

                        if (verifyRes.data.success) {
                            alert("Payment Successful!");
                            clearCart();
                            navigate(`/order/${localOrder._id}`);
                        } else {
                            alert("Payment Verification Failed. Please contact support.");
                        }
                    } catch (error) {
                        console.error("Verification Error", error);
                        alert("Payment verification failed. Please contact support.");
                    }
                },
                prefill: {
                    name: customer_name,
                    email: customer_email,
                    contact: customer_contact
                },
                theme: {
                    color: "#800000"
                },
                modal: {
                    ondismiss: function () {
                        setLoading(false);
                        console.log('Payment checkout cancelled.');
                    }
                }
            };

            const paymentObject = new window.Razorpay(options);
            paymentObject.on('payment.failed', function (response) {
                alert(`Payment Failed: ${response.error.description}`);
                console.error(response.error);
                setLoading(false);
            });
            paymentObject.open();

        } catch (error) {
            console.error("Order process failed", error);
            const msg = error.response?.data?.message || "Failed to initiate payment";
            alert(msg);
            setLoading(false);
        }
    };

    if (cartItems.length === 0) {
        return (
            <div className="min-h-screen pt-32 pb-12 px-4 bg-brand-ivory text-center">
                <h2 className="text-3xl font-serif text-brand-maroon mb-4">Your Cart is Empty</h2>
                <a href="/designs" className="text-brand-gold underline">Browse Designs</a>
            </div>
        );
    }

    return (
        <div className="min-h-screen pt-32 pb-12 bg-gray-50">
            <div className="container mx-auto px-4">
                <h1 className="text-3xl font-serif font-bold text-brand-maroon mb-8">Checkout</h1>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Form Steps */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* 1. Address Selection */}
                        <div className="bg-white p-6 rounded-xl shadow-sm">
                            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                                <MapPin className="text-brand-gold" /> Select Delivery Address
                            </h2>
                            <div className="grid md:grid-cols-2 gap-4">
                                {addresses.map(addr => (
                                    <div
                                        key={addr._id}
                                        onClick={() => setSelectedAddress(addr)}
                                        className={`p-4 border-2 rounded-lg cursor-pointer transition ${selectedAddress?._id === addr._id ? 'border-brand-maroon bg-red-50' : 'border-gray-200 hover:border-gray-300'}`}
                                    >
                                        <div className="font-bold flex justify-between">
                                            {addr.type.toUpperCase()}
                                            {selectedAddress?._id === addr._id && <Check size={16} className="text-brand-maroon" />}
                                        </div>
                                        <div className="text-sm text-gray-600 mt-1">
                                            {addr.street}, {addr.city}
                                        </div>
                                    </div>
                                ))}
                                <button onClick={() => navigate('/customer/dashboard')} className="p-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:bg-gray-50 flex flex-col items-center justify-center">
                                    <span>+ Add New Address</span>
                                </button>
                            </div>
                        </div>

                        {/* 2. Measurement Profile */}
                        <div className="bg-white p-6 rounded-xl shadow-sm">
                            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                                <Ruler className="text-brand-gold" /> Measurement Profile
                            </h2>
                            {measurements ? (
                                <div className="p-4 border-2 border-brand-maroon bg-red-50 rounded-lg">
                                    <h3 className="font-bold text-brand-maroon">{measurements.profileName || 'My Measurements'}</h3>
                                    <p className="text-sm text-gray-600">Profile matches your account.</p>
                                </div>
                            ) : (
                                <div className="text-center p-4">
                                    <p className="text-red-500 mb-2">No measurement profile found.</p>
                                    <button onClick={() => navigate('/customer/dashboard')} className="text-brand-maroon underline">Create Profile</button>
                                </div>
                            )}
                            {/* 3. Payment Method */}
                            <div className="bg-white p-6 rounded-xl shadow-sm">
                                <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                                    <CreditCard className="text-brand-gold" /> Payment Method
                                </h2>
                                <div className="space-y-3">
                                    <div
                                        onClick={() => setPaymentMethod('Online')}
                                        className={`p-4 border-2 rounded-lg cursor-pointer flex items-center justify-between transition ${paymentMethod === 'Online' ? 'border-brand-maroon bg-red-50' : 'border-gray-200'}`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${paymentMethod === 'Online' ? 'border-brand-maroon' : 'border-gray-400'}`}>
                                                {paymentMethod === 'Online' && <div className="w-3 h-3 bg-brand-maroon rounded-full"></div>}
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-800">Online Payment</p>
                                                <p className="text-xs text-gray-500">Credit/Debit Card, UPI, Netbanking (Razorpay)</p>
                                            </div>
                                        </div>
                                        <div className="px-2 py-1 bg-green-100 text-green-700 text-xs font-bold rounded">FAST</div>
                                    </div>

                                    <div
                                        onClick={() => setPaymentMethod('COD')}
                                        className={`p-4 border-2 rounded-lg cursor-pointer flex items-center justify-between transition ${paymentMethod === 'COD' ? 'border-brand-maroon bg-red-50' : 'border-gray-200'}`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${paymentMethod === 'COD' ? 'border-brand-maroon' : 'border-gray-400'}`}>
                                                {paymentMethod === 'COD' && <div className="w-3 h-3 bg-brand-maroon rounded-full"></div>}
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-800">Cash on Delivery</p>
                                                <p className="text-xs text-gray-500">Pay when you receive your order</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Order Summary */}
                    <div className="lg:col-span-1">
                        <div className="bg-white p-6 rounded-xl shadow-sm sticky top-32">
                            <h2 className="text-xl font-bold text-gray-800 mb-4">Order Summary</h2>
                            <div className="space-y-4 mb-6">
                                {cartItems.map(item => (
                                    <div key={item._id} className="flex justify-between items-center text-sm">
                                        <span className="text-gray-600">{item.name} x {item.quantity}</span>
                                        <span className="font-medium">₹{item.price * item.quantity}</span>
                                    </div>
                                ))}
                            </div>
                            <div className="border-t border-gray-200 pt-4 flex justify-between items-center text-lg font-bold text-brand-maroon mb-6">
                                <span>Total</span>
                                <span>₹{cartTotal}</span>
                            </div>

                            <button
                                onClick={handlePlaceOrder}
                                disabled={loading}
                                className="w-full bg-brand-maroon text-white py-3 rounded-lg font-bold hover:bg-red-900 transition disabled:bg-gray-400 flex items-center justify-center gap-2"
                            >
                                {loading ? 'Processing...' : (
                                    paymentMethod === 'COD' ?
                                        <><Check size={20} /> Confirm Cash on Delivery</> :
                                        <><CreditCard size={20} /> Pay Now</>
                                )}
                            </button>
                            <p className="text-xs text-center text-gray-400 mt-4">
                                {paymentMethod === 'COD' ? 'Pay upon receipt of your order' : 'Secure payment via Razorpay'}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Checkout;
