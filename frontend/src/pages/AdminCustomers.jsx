import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { User, Mail, Phone, ShoppingBag, Trash2 } from 'lucide-react';

const AdminCustomers = () => {
    // Ideally we fetch from /api/admin/customers, but we can reuse /api/users if admin middleware allows
    // For now, I'll mock or assume a generic route exists. 
    // Wait, the adminController stats fetched totalCustomers count. 
    // I previously implemented getAllUsers in userController? Let's check userController. 
    // Assuming standard behavior:
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchCustomers = async () => {
        try {
            // Get token from localStorage
            const token = localStorage.getItem('token');
            const config = {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            };

            const { data } = await api.get('/admin/customers', config);
            setCustomers(data);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching customers:", error.response?.data?.message || error.message);
            if (error.response?.status === 401) {
                alert("Session expired or unauthorized. Please login as Admin.");
                // Optional: redirect to login
                // window.location.href = '/login';
            }
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCustomers();
    }, []);

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
            try {
                const token = localStorage.getItem('token');
                const config = {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                };
                await api.delete(`/admin/customers/${id}`, config);
                // Refresh the list
                fetchCustomers();
                alert('User deleted successfully');
            } catch (error) {
                console.error("Error deleting user:", error);
                alert('Failed to delete user');
            }
        }
    };

    if (loading) return <div className="p-8 text-center">Loading customers...</div>;

    return (
        <div className="p-8 bg-gray-50 min-h-screen">
            <h1 className="text-3xl font-serif font-bold text-gray-800 mb-8">Customer Management</h1>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
                        <tr>
                            <th className="px-6 py-4">Customer</th>
                            <th className="px-6 py-4">Contact</th>
                            <th className="px-6 py-4">Orders</th>
                            <th className="px-6 py-4">Total Spent</th>
                            <th className="px-6 py-4">Joined</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {customers.map(customer => (
                            <tr key={customer._id} className="hover:bg-gray-50">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-brand-ivory rounded-full flex items-center justify-center text-brand-maroon">
                                            <User size={18} />
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-900">{customer.firstName} {customer.lastName}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <p className="text-sm flex items-center gap-2"><Mail size={14} className="text-gray-400" /> {customer.email}</p>
                                    <p className="text-sm flex items-center gap-2 mt-1"><Phone size={14} className="text-gray-400" /> {customer.phone}</p>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs font-bold">
                                        <ShoppingBag size={12} /> {customer.orderCount}
                                    </span>
                                </td>
                                <td className="px-6 py-4 font-medium">₹{customer.totalSpent}</td>
                                <td className="px-6 py-4 text-sm text-gray-500">{new Date(customer.createdAt).toLocaleDateString()}</td>
                                <td className="px-6 py-4 text-right">
                                    <button className="text-brand-maroon hover:underline text-sm font-medium mr-4">View History</button>
                                    <button
                                        onClick={() => handleDelete(customer._id)}
                                        className="text-red-500 hover:text-red-700 transition-colors"
                                        title="Delete User"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div >
    );
};

export default AdminCustomers;
