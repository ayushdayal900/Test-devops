import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Search, Filter, Eye, ChevronRight, ChevronLeft, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';

const AdminOrders = () => {
    const [orders, setOrders] = useState([]);
    const [filteredOrders, setFilteredOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    useEffect(() => {
        fetchOrders();
    }, []);

    useEffect(() => {
        filterOrders();
    }, [orders, statusFilter, searchTerm]);

    const fetchOrders = async () => {
        try {
            const token = localStorage.getItem('token');
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const res = await api.get('/admin/orders', config);
            setOrders(res.data);
            setFilteredOrders(res.data);
        } catch (error) {
            console.error("Error fetching orders:", error);
        } finally {
            setLoading(false);
        }
    };

    const filterOrders = () => {
        let temp = [...orders];

        if (statusFilter !== 'all') {
            temp = temp.filter(order => order.status === statusFilter);
        }

        if (searchTerm) {
            const lowerSearch = searchTerm.toLowerCase();
            temp = temp.filter(order =>
                order.orderNumber.toLowerCase().includes(lowerSearch) ||
                order.customer?.firstName?.toLowerCase().includes(lowerSearch) ||
                order.customer?.email?.toLowerCase().includes(lowerSearch)
            );
        }

        setFilteredOrders(temp);
        setCurrentPage(1);
    };

    // Pagination Logic
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredOrders.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);

    const getStatusColor = (status) => {
        switch (status) {
            case 'completed': return 'bg-green-100 text-green-700';
            case 'pending': return 'bg-yellow-100 text-yellow-700';
            case 'cancelled': return 'bg-red-100 text-red-700';
            case 'dispatched': return 'bg-blue-100 text-blue-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    if (loading) return <div className="p-8"><div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-brand-maroon"></div></div>;

    return (
        <div className="p-8 bg-gray-50 min-h-screen">
            <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                <h1 className="text-3xl font-serif font-bold text-brand-maroon">Order Management</h1>

                <div className="flex gap-4 w-full md:w-auto">
                    <div className="relative flex-1 md:w-64">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search order #, customer..."
                            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-maroon focus:border-transparent"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <select
                        className="bg-white border border-gray-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-brand-maroon"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <option value="all">All Status</option>
                        <option value="pending">Pending</option>
                        <option value="measurements_confirmed">Measurements Confirmed</option>
                        <option value="in_stitching">In Stitching</option>
                        <option value="ready">Ready</option>
                        <option value="dispatched">Dispatched</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                    </select>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 text-gray-600 text-xs uppercase font-semibold">
                            <tr>
                                <th className="px-6 py-4">Order #</th>
                                <th className="px-6 py-4">Customer</th>
                                <th className="px-6 py-4">Date</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Payment</th>
                                <th className="px-6 py-4">Total</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {currentItems.length > 0 ? (
                                currentItems.map(order => (
                                    <tr key={order._id} className="hover:bg-gray-50 transition">
                                        <td className="px-6 py-4 font-medium text-gray-800">{order.orderNumber}</td>
                                        <td className="px-6 py-4">
                                            <p className="font-medium text-gray-900">{order.customer?.firstName} {order.customer?.lastName}</p>
                                            <p className="text-xs text-gray-400">{order.customer?.email}</p>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            {new Date(order.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${getStatusColor(order.status)}`}>
                                                {order.status.replace('_', ' ')}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded text-xs font-semibold
                                                ${order.paymentStatus === 'paid' ? 'text-green-700 bg-green-50' :
                                                    order.paymentStatus === 'pending' ? 'text-orange-700 bg-orange-50' : 'text-red-700 bg-red-50'}`}>
                                                {order.paymentStatus}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 font-bold text-gray-800">₹{order.totalAmount}</td>
                                        <td className="px-6 py-4 text-right">
                                            <Link
                                                to={`/admin/orders/${order._id}`}
                                                className="inline-flex items-center gap-1 text-brand-maroon hover:text-red-800 bg-red-50 hover:bg-red-100 px-3 py-1 rounded-lg transition text-sm font-medium"
                                            >
                                                <Eye size={16} /> View
                                            </Link>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                                        No orders found matching your criteria.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="px-6 py-4 border-t border-gray-100 flex justify-between items-center bg-gray-50">
                        <button
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                            className={`p-2 rounded-lg ${currentPage === 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-200'}`}
                        >
                            <ChevronLeft size={20} />
                        </button>
                        <span className="text-sm text-gray-600">
                            Page <span className="font-bold">{currentPage}</span> of {totalPages}
                        </span>
                        <button
                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages}
                            className={`p-2 rounded-lg ${currentPage === totalPages ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-200'}`}
                        >
                            <ChevronRight size={20} />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminOrders;
