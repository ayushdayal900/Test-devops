import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { DollarSign, CheckCircle, XCircle, Clock } from 'lucide-react';

const AdminPayments = () => {
    // Fetch generic orders for now and filter, or use a specific payments endpoint. 
    // Filtering local orders for 'paymentStatus' is easiest for immediate implementation.
    const [payments, setPayments] = useState([]);
    const [stats, setStats] = useState({ totalRevenue: 0, pendingPayments: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPayments = async () => {
            try {
                const token = localStorage.getItem('token');
                const config = { headers: { Authorization: `Bearer ${token}` } };
                const { data } = await api.get('/admin/payments', config);
                setPayments(data.transactions);
                setStats({
                    totalRevenue: data.totalRevenue,
                    pendingPayments: data.pendingPayments
                });
                setLoading(false);
            } catch (error) {
                console.error("Error fetching payments:", error);
                setLoading(false);
            }
        };
        fetchPayments();
    }, []);

    const getStatusBadge = (status) => {
        switch (status) {
            case 'paid': return <span className="flex items-center gap-1 bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold"><CheckCircle size={12} /> Paid</span>;
            case 'pending': return <span className="flex items-center gap-1 bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-xs font-bold"><Clock size={12} /> Pending</span>;
            case 'failed': return <span className="flex items-center gap-1 bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-bold"><XCircle size={12} /> Failed</span>;
            default: return status;
        }
    };

    return (
        <div className="p-8 bg-gray-50 min-h-screen">
            <h1 className="text-3xl font-serif font-bold text-gray-800 mb-8">Financial Records</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                    <p className="text-gray-500 text-sm">Total Revenue</p>
                    <h3 className="text-2xl font-bold text-gray-900 mt-1">₹{stats.totalRevenue?.toLocaleString()}</h3>
                </div>
                <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                    <p className="text-gray-500 text-sm">Pending Payments</p>
                    <h3 className="text-2xl font-bold text-orange-600 mt-1">₹{stats.pendingPayments?.toLocaleString()}</h3>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
                        <tr>
                            <th className="px-6 py-4">Transaction ID</th>
                            <th className="px-6 py-4">Order Ref</th>
                            <th className="px-6 py-4">Customer</th>
                            <th className="px-6 py-4">Amount</th>
                            <th className="px-6 py-4">Date</th>
                            <th className="px-6 py-4">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {payments.map(pay => (
                            <tr key={pay._id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 font-mono text-xs text-gray-500">TXARZ-{pay._id}</td>
                                <td className="px-6 py-4 font-medium text-gray-900">{pay.orderNumber}</td>
                                <td className="px-6 py-4 text-gray-600">{pay.customer}</td>
                                <td className="px-6 py-4 font-bold">₹{pay.amount}</td>
                                <td className="px-6 py-4 text-sm text-gray-500">{new Date(pay.date).toLocaleDateString()}</td>
                                <td className="px-6 py-4">{getStatusBadge(pay.status)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminPayments;
