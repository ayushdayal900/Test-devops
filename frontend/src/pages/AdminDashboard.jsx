import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Package, Users, DollarSign, Clock, Scissors, Activity, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import AnalyticsDashboard from '../components/Analytics/AnalyticsDashboard';

const AdminDashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const token = localStorage.getItem('token');
            const config = { headers: { Authorization: `Bearer ${token}` } };
            // Ensure api endpoint matches backend route
            const res = await api.get('/admin/stats', config);
            setStats(res.data);
        } catch (error) {
            console.error("Error fetching admin stats", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="p-8"><div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-brand-maroon"></div></div>;
    if (!stats) return <div className="p-8">Error loading dashboard.</div>;

    // Helper for Revenue Chart Max Value
    const maxRevenue = stats.revenueTrend?.length > 0
        ? Math.max(...stats.revenueTrend.map(d => d.total)) * 1.2
        : 10000;

    return (
        <div className="p-8 bg-gray-50 min-h-screen">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-serif font-bold text-gray-800">Dashboard Overview</h1>
                    <p className="text-gray-500">Real-time business performance metrics.</p>
                </div>
                <div className="flex gap-4">
                    <button onClick={fetchStats} className="text-brand-maroon hover:bg-red-50 px-4 py-2 rounded-lg transition">
                        Refresh
                    </button>
                    <Link to="/admin/orders" className="bg-brand-maroon text-white px-6 py-2 rounded-lg hover:bg-red-900 transition">
                        Manage Orders
                    </Link>
                </div>
            </div>

            {/* Metric Cards Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <MetricCard
                    label="Total Revenue"
                    value={`₹${stats.totalSales?.toLocaleString()}`}
                    icon={DollarSign}
                    color="text-green-600"
                    bg="bg-green-50"
                />
                <MetricCard
                    label="Total Orders"
                    value={stats.totalOrders}
                    icon={Package}
                    color="text-blue-600"
                    bg="bg-blue-50"
                />
                <MetricCard
                    label="Pending Payment"
                    value={stats.pendingPaymentCount}
                    icon={Clock}
                    color="text-orange-600"
                    bg="bg-orange-50"
                />
                <MetricCard
                    label="In Stitching"
                    value={stats.inStitchingCount}
                    icon={Scissors}
                    color="text-purple-600"
                    bg="bg-purple-50"
                />
            </div>

            {/* Analytics Dashboard */}
            <div className="mb-8">
                <AnalyticsDashboard />
            </div>

            {/* Recent Orders Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                    <h3 className="font-bold text-gray-800">Recent Orders</h3>
                    <Link to="/admin/orders" className="text-sm text-brand-maroon hover:underline">View All</Link>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                            <tr>
                                <th className="px-6 py-4">Order #</th>
                                <th className="px-6 py-4">Customer</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Amount</th>
                                <th className="px-6 py-4">Date</th>
                                <th className="px-6 py-4 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {stats.recentOrders?.map(order => (
                                <tr key={order._id} className="hover:bg-gray-50 transition">
                                    <td className="px-6 py-4 font-medium text-gray-900">{order.orderNumber}</td>
                                    <td className="px-6 py-4">{order.customer?.firstName} {order.customer?.lastName}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase
                                            ${order.status === 'completed' ? 'bg-green-100 text-green-700' :
                                                order.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                                    'bg-blue-100 text-blue-700'}`}>
                                            {order.status.replace('_', ' ')}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 font-medium">₹{order.totalAmount}</td>
                                    <td className="px-6 py-4 text-sm text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</td>
                                    <td className="px-6 py-4 text-right">
                                        <Link to={`/admin/orders/${order._id}`} className="text-brand-maroon hover:underline text-sm font-medium">
                                            View
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

const MetricCard = ({ label, value, icon: Icon, color, bg }) => (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
        <div className={`w-12 h-12 ${bg} ${color} rounded-full flex items-center justify-center`}>
            <Icon size={24} />
        </div>
        <div>
            <p className="text-sm text-gray-500 font-medium">{label}</p>
            <h3 className="text-2xl font-bold text-gray-800">{value}</h3>
        </div>
    </div>
);

export default AdminDashboard;
