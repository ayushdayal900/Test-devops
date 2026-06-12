import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import { Ruler, User, Package, LogOut, MapPin, Plus, Trash2, Settings, Heart, Menu, X } from 'lucide-react';
import { Link } from 'react-router-dom';

// Sub-components (Will extract later if complex)
import MeasurementForm from '../components/Dashboard/MeasurementForm'; // Deprecated? Or reusing name?
import MeasurementTab from '../components/Dashboard/MeasurementTab'; // New Component
import AddressForm from '../components/Dashboard/AddressForm';

const CustomerDashboard = () => {
    const { user, logout, updateUser } = useContext(AuthContext);
    const [activeTab, setActiveTab] = useState('overview');
    const [measurements, setMeasurements] = useState(null);
    const [addresses, setAddresses] = useState([]);
    const [showAddressForm, setShowAddressForm] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    // Profile State
    const [profileData, setProfileData] = useState({ firstName: '', lastName: '', email: '', phone: '', currentPassword: '', newPassword: '' });

    useEffect(() => {
        if (activeTab === 'measurements') {
            fetchMeasurements();
        } else if (activeTab === 'addresses') {
            fetchUserData();
        } else if (activeTab === 'profile') {
            // Pre-fill profile data from user context or fetch fresh
            setProfileData({
                firstName: user?.firstName || '',
                lastName: user?.lastName || '',
                email: user?.email || '',
                phone: user?.phone || '',
                currentPassword: '',
                newPassword: ''
            });
        }
    }, [activeTab, user]);

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                firstName: profileData.firstName,
                lastName: profileData.lastName,
                phone: profileData.phone,
            };
            if (profileData.newPassword) {
                payload.password = profileData.newPassword;
            }

            const res = await api.put('/auth/updatedetails', payload);

            // Update Context
            updateUser(res.data);

            // Update Local State for password fields
            setProfileData(prev => ({ ...prev, currentPassword: '', newPassword: '' }));

            alert("Profile updated successfully!");
        } catch (error) {
            console.error("Update failed", error);
            alert(error.response?.data?.message || "Failed to update profile");
        }
    };

    const fetchUserData = async () => {
        try {
            const res = await api.get('/auth/me');
            if (res.data.addresses) {
                setAddresses(res.data.addresses);
            }
        } catch (error) {
            console.error("Error fetching user data", error);
        }
    };

    const fetchMeasurements = async () => {
        try {
            const res = await api.get('/measurements');
            if (res.data && res.data.length > 0) {
                setMeasurements(res.data[0]);
            } else {
                setMeasurements(null);
            }
        } catch (error) {
            console.log("No measurements found or error fetching");
            setMeasurements(null);
        }
    };

    const [stats, setStats] = useState({ activeOrders: 0, totalSpent: 0 });
    const [recentOrders, setRecentOrders] = useState([]);
    const [allOrders, setAllOrders] = useState([]);

    useEffect(() => {
        if (activeTab === 'overview') {
            fetchDashboardData();
        } else if (activeTab === 'measurements') {
            fetchMeasurements();
        } else if (activeTab === 'addresses') {
            fetchUserData();
        } else if (activeTab === 'orders') {
            fetchAllOrders();
        }
    }, [activeTab]);

    const fetchAllOrders = async () => {
        try {
            const res = await api.get('/orders/myorders');
            setAllOrders(res.data);
        } catch (error) {
            console.error("Error fetching orders", error);
        }
    };

    const fetchDashboardData = async () => {
        try {
            const ordersRes = await api.get('/orders/myorders');
            const orders = ordersRes.data;
            const active = orders.filter(o => o.status !== 'completed' && o.status !== 'cancelled').length;
            const spent = orders.reduce((acc, curr) => acc + curr.totalAmount, 0);

            setStats({ activeOrders: active, totalSpent: spent });
            setRecentOrders(orders.slice(0, 3));
        } catch (error) {
            console.error("Error fetching dashboard data", error);
        }
    };

    const handleDeleteAddress = async (id) => {
        if (!window.confirm('Are you sure using want to delete this address?')) return;
        try {
            const res = await api.delete(`/customers/address/${id}`);
            setAddresses(res.data); // Returns updated list
        } catch (error) {
            console.error("Error deleting address", error);
        }
    };

    const handleAddressSaved = () => {
        setShowAddressForm(false);
        fetchUserData(); // Refresh list
    };

    // Close mobile menu when tab changes
    const handleTabChange = (tab) => {
        setActiveTab(tab);
        setIsMobileMenuOpen(false);
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row relative">
            {/* Mobile Header for Dashboard */}
            <div className="md:hidden bg-white p-4 border-b border-gray-200 flex justify-between items-center sticky top-16 z-20">
                <span className="font-serif font-bold text-brand-maroon text-lg">My Dashboard</span>
                <button
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    className="p-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50"
                >
                    {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
                </button>
            </div>

            {/* Sidebar */}
            <aside className={`
                bg-white border-r border-gray-200
                md:block md:w-72 md:sticky md:top-24 md:h-[calc(100vh-6rem)] md:overflow-y-auto
                fixed inset-0 z-30 pt-20 md:pt-0 overflow-y-auto
                transition-transform duration-300 ease-in-out shadow-[4px_0_24px_rgba(0,0,0,0.02)]
                ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
            `}>
                <div className="p-8 hidden md:block">
                    <div className="flex items-center gap-4 mb-2">
                        <div className="w-12 h-12 rounded-full bg-brand-maroon/10 flex items-center justify-center text-brand-maroon">
                            <User size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-serif text-gray-900 font-bold">My Account</h2>
                            <p className="text-sm text-gray-500">Welcome, {user?.firstName}</p>
                        </div>
                    </div>
                </div>

                <nav className="px-6 space-y-2 pb-8 md:pb-0">
                    <button
                        onClick={() => handleTabChange('overview')}
                        className={`w-full flex items-center gap-4 px-6 py-4 rounded-xl transition-all duration-300 font-medium ${activeTab === 'overview'
                            ? 'bg-brand-maroon text-white shadow-lg shadow-brand-maroon/20 translate-x-2'
                            : 'text-gray-600 hover:bg-gray-50 hover:pl-8'
                            }`}
                    >
                        <User size={20} className={activeTab === 'overview' ? 'opacity-100' : 'opacity-70'} />
                        Overview
                    </button>

                    <button
                        onClick={() => handleTabChange('orders')}
                        className={`w-full flex items-center gap-4 px-6 py-4 rounded-xl transition-all duration-300 font-medium ${activeTab === 'orders'
                            ? 'bg-brand-maroon text-white shadow-lg shadow-brand-maroon/20 translate-x-2'
                            : 'text-gray-600 hover:bg-gray-50 hover:pl-8'
                            }`}
                    >
                        <Package size={20} className={activeTab === 'orders' ? 'opacity-100' : 'opacity-70'} />
                        My Orders
                    </button>

                    <button
                        onClick={() => handleTabChange('measurements')}
                        className={`w-full flex items-center gap-4 px-6 py-4 rounded-xl transition-all duration-300 font-medium ${activeTab === 'measurements'
                            ? 'bg-brand-maroon text-white shadow-lg shadow-brand-maroon/20 translate-x-2'
                            : 'text-gray-600 hover:bg-gray-50 hover:pl-8'
                            }`}
                    >
                        <Ruler size={20} className={activeTab === 'measurements' ? 'opacity-100' : 'opacity-70'} />
                        Measurements
                    </button>



                    <button
                        onClick={() => handleTabChange('addresses')}
                        className={`w-full flex items-center gap-4 px-6 py-4 rounded-xl transition-all duration-300 font-medium ${activeTab === 'addresses'
                            ? 'bg-brand-maroon text-white shadow-lg shadow-brand-maroon/20 translate-x-2'
                            : 'text-gray-600 hover:bg-gray-50 hover:pl-8'
                            }`}
                    >
                        <MapPin size={20} className={activeTab === 'addresses' ? 'opacity-100' : 'opacity-70'} />
                        addresses
                    </button>

                    <button
                        onClick={() => handleTabChange('profile')}
                        className={`w-full flex items-center gap-4 px-6 py-4 rounded-xl transition-all duration-300 font-medium ${activeTab === 'profile'
                            ? 'bg-brand-maroon text-white shadow-lg shadow-brand-maroon/20 translate-x-2'
                            : 'text-gray-600 hover:bg-gray-50 hover:pl-8'
                            }`}
                    >
                        <Settings size={20} className={activeTab === 'profile' ? 'opacity-100' : 'opacity-70'} />
                        Settings
                    </button>

                    <div className="pt-8 mt-4 border-t border-gray-100 mx-2">
                        <button
                            onClick={logout}
                            className="w-full flex items-center gap-4 px-6 py-4 rounded-xl text-red-600 hover:bg-red-50 transition-all duration-300 font-medium hover:pl-8"
                        >
                            <LogOut size={20} className="opacity-70" />
                            Logout
                        </button>
                    </div>
                </nav>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-8">
                {activeTab === 'overview' && (
                    <div className="space-y-8">
                        {/* Welcome Banner */}
                        <div className="bg-brand-maroon text-white p-8 rounded-2xl shadow-lg relative overflow-hidden">
                            <div className="relative z-10">
                                <h1 className="text-3xl font-serif font-bold mb-2">Hello, {user?.firstName}!</h1>
                                <p className="text-brand-beige opacity-90 max-w-xl">
                                    Welcome back to your personalized dashboard. Track your orders, manage your measurements, and explore new designs.
                                </p>
                            </div>
                            <div className="absolute right-0 top-0 h-full w-1/3 bg-white/5 skew-x-12 transform translate-x-12"></div>
                            <Package className="absolute right-10 bottom-4 text-white/10 w-32 h-32 rotate-12" />
                        </div>

                        {/* Stats Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
                                <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center">
                                    <Package size={24} />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 font-medium">Active Orders</p>
                                    <h3 className="text-2xl font-bold text-gray-800">{stats.activeOrders}</h3>
                                </div>
                            </div>
                            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
                                <div className="w-12 h-12 bg-green-50 text-green-600 rounded-full flex items-center justify-center">
                                    <span className="font-bold text-xl">₹</span>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 font-medium">Total Spent</p>
                                    <h3 className="text-2xl font-bold text-gray-800">₹{stats.totalSpent.toLocaleString()}</h3>
                                </div>
                            </div>
                            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
                                <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-full flex items-center justify-center">
                                    <Ruler size={24} />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 font-medium">Profile Status</p>
                                    <h3 className="text-lg font-bold text-gray-800 text-nowrap">{measurements ? 'Completed' : 'Ideally Add'}</h3>
                                </div>
                            </div>
                        </div>

                        {/* Recent Orders */}
                        <div>
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-bold text-gray-800">Recent Orders</h2>
                                <button onClick={() => setActiveTab('orders')} className="text-brand-maroon text-sm font-medium hover:underline">View All</button>
                            </div>
                            <div className="grid gap-4">
                                {recentOrders.length > 0 ? (
                                    recentOrders.map(order => (
                                        <div key={order._id} className="bg-white p-6 rounded-xl border border-gray-100 hover:shadow-md transition flex flex-col md:flex-row justify-between items-center gap-4">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400">
                                                    <Package size={20} />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-gray-800">Order #{order.orderNumber}</p>
                                                    <p className="text-sm text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <span className={`inline - block px - 3 py - 1 rounded - full text - xs font - bold uppercase ${order.status === 'completed' ? 'bg-green-100 text-green-800' :
                                                    order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-blue-100 text-blue-800'
                                                    } `}>
                                                    {order.status}
                                                </span>
                                                <p className="font-bold text-gray-900 mt-1">₹{order.totalAmount}</p>
                                            </div>
                                            <button className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50">
                                                <Link to={`/order/${order._id}`}>View Details</Link>
                                            </button>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-8 bg-white rounded-xl border border-dashed border-gray-300">
                                        <p className="text-gray-500">No recent orders found.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'measurements' && (
                    <div className="max-w-4xl">
                        <MeasurementTab />
                    </div>
                )}
                {activeTab === 'orders' && (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center mb-6">
                            <h1 className="text-2xl font-serif font-bold text-gray-800">My Orders</h1>
                        </div>

                        {allOrders.length > 0 ? (
                            <div className="grid gap-4">
                                {allOrders.map(order => (
                                    <div key={order._id} className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col md:flex-row justify-between items-center gap-6">
                                        <div className="flex items-center gap-6 flex-1">
                                            <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400 flex-shrink-0">
                                                <Package size={28} />
                                            </div>
                                            <div>
                                                <p className="font-bold text-lg text-gray-800">Order #{order.orderNumber}</p>
                                                <div className="flex gap-4 text-sm text-gray-500 mt-1">
                                                    <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                                                    <span>•</span>
                                                    <span>{order.orderItems?.length} Items</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-8 md:text-right w-full md:w-auto justify-between md:justify-end">
                                            <div>
                                                <span className={`inline - block px - 3 py - 1 rounded - full text - xs font - bold uppercase ${order.status === 'completed' ? 'bg-green-100 text-green-800' :
                                                    order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                                                        order.status === 'measurements_confirmed' ? 'bg-blue-100 text-blue-800' :
                                                            'bg-yellow-100 text-yellow-800'
                                                    } `}>
                                                    {order.status.replace('_', ' ')}
                                                </span>
                                                <p className="font-bold text-xl text-gray-900 mt-2">₹{order.totalAmount}</p>
                                            </div>
                                            <Link
                                                to={`/order/${order._id}`}
                                                className="px-6 py-2 bg-brand-maroon text-white rounded-lg hover:bg-red-900 transition text-sm font-medium"
                                            >
                                                View Details
                                            </Link>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 text-center py-20">
                                <Package size={48} className="mx-auto text-gray-300 mb-4" />
                                <h3 className="text-lg font-medium text-gray-900">No Orders Yet</h3>
                                <p className="text-gray-500 mb-6">Start browsing our collection to place your first order.</p>
                                <a href="/designs" className="inline-block bg-brand-maroon text-white px-6 py-2 rounded-full hover:bg-red-900 transition">
                                    Browse Designs
                                </a>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'addresses' && (
                    <div className="max-w-3xl">
                        <div className="flex justify-between items-center mb-6">
                            <h1 className="text-2xl font-serif font-bold text-gray-800">My Addresses</h1>
                            {!showAddressForm && (
                                <button
                                    onClick={() => setShowAddressForm(true)}
                                    className="flex items-center gap-2 bg-brand-maroon text-white px-4 py-2 rounded-lg hover:bg-red-900 transition text-sm"
                                >
                                    <Plus size={16} /> Add New Address
                                </button>
                            )}
                        </div>

                        {showAddressForm ? (
                            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 mb-6">
                                <h3 className="text-lg font-medium text-gray-900 mb-4">Add New Address</h3>
                                <AddressForm
                                    onSave={handleAddressSaved}
                                    onCancel={() => setShowAddressForm(false)}
                                />
                            </div>
                        ) : (
                            <div className="grid gap-4">
                                {addresses.length === 0 ? (
                                    <div className="text-center py-10 bg-white rounded-xl border border-dashed border-gray-300">
                                        <MapPin className="mx-auto text-gray-300 mb-2" size={32} />
                                        <p className="text-gray-500">No addresses saved yet.</p>
                                    </div>
                                ) : (
                                    addresses.map((addr) => (
                                        <div key={addr._id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex justify-between items-start">
                                            <div>
                                                <div className="flex items-center gap-2 mb-2">
                                                    <span className={`px - 2 py - 1 rounded text - xs uppercase font - bold tracking - wider ${addr.type === 'home' ? 'bg-blue-50 text-blue-700' : addr.type === 'work' ? 'bg-purple-50 text-purple-700' : 'bg-gray-100 text-gray-700'} `}>
                                                        {addr.type}
                                                    </span>
                                                    {addr.isDefault && (
                                                        <span className="bg-green-50 text-green-700 px-2 py-1 rounded text-xs font-medium">Default</span>
                                                    )}
                                                </div>
                                                <p className="font-medium text-gray-900">{addr.street}</p>
                                                <p className="text-gray-600">{addr.city}, {addr.state} - {addr.postalCode}</p>
                                                <p className="text-gray-500 text-sm mt-1">{addr.country}</p>
                                            </div>
                                            <button
                                                onClick={() => handleDeleteAddress(addr._id)}
                                                className="text-gray-400 hover:text-red-600 p-2 transition"
                                                title="Delete Address"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    ))
                                )}
                            </div>
                        )}
                    </div>
                )}
                {activeTab === 'profile' && (
                    <div className="max-w-2xl bg-white p-8 rounded-xl shadow-sm border border-gray-100">
                        <h1 className="text-2xl font-serif font-bold text-gray-800 mb-6">Profile Settings</h1>
                        <form onSubmit={handleProfileUpdate} className="space-y-6">
                            <div className="grid md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                                    <input
                                        type="text"
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-brand-maroon focus:border-brand-maroon"
                                        value={profileData.firstName}
                                        onChange={(e) => setProfileData({ ...profileData, firstName: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                                    <input
                                        type="text"
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-brand-maroon focus:border-brand-maroon"
                                        value={profileData.lastName}
                                        onChange={(e) => setProfileData({ ...profileData, lastName: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                                <input
                                    type="email"
                                    disabled
                                    className="w-full p-3 border border-gray-200 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                                    value={profileData.email}
                                />
                                <p className="text-xs text-gray-400 mt-1">Email cannot be changed.</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                                <input
                                    type="tel"
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-brand-maroon focus:border-brand-maroon"
                                    value={profileData.phone}
                                    onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                                />
                            </div>

                            <div className="border-t pt-6 mt-6">
                                <h3 className="font-bold text-gray-800 mb-4">Change Password</h3>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
                                        <input
                                            type="password"
                                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-brand-maroon focus:border-brand-maroon"
                                            value={profileData.currentPassword}
                                            onChange={(e) => setProfileData({ ...profileData, currentPassword: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                                        <input
                                            type="password"
                                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-brand-maroon focus:border-brand-maroon"
                                            value={profileData.newPassword}
                                            onChange={(e) => setProfileData({ ...profileData, newPassword: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>

                            <button type="submit" className="w-full bg-brand-maroon text-white py-3 rounded-lg font-bold hover:bg-red-900 transition">
                                Save Changes
                            </button>
                        </form>
                    </div>
                )}
            </main>
        </div>
    );
};

export default CustomerDashboard;
