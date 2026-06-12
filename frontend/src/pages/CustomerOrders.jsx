import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Package, Calendar, ChevronRight, Clock } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

const CustomerOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const { t } = useTranslation();

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const res = await api.get('/orders/myorders');
                setOrders(res.data);
            } catch (error) {
                console.error("Error fetching orders:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen pt-32 pb-12 flex justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-maroon"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen pt-32 pb-12 bg-gray-50">
            <div className="container mx-auto px-4">
                <h1 className="text-3xl font-serif font-bold text-brand-maroon mb-8">My Orders</h1>

                {orders.length === 0 ? (
                    <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                        <Package size={64} className="mx-auto text-gray-300 mb-4" />
                        <h2 className="text-xl font-medium text-gray-900 mb-2">No orders placed yet</h2>
                        <p className="text-gray-500 mb-6">Explore our latest designs and place your first order.</p>
                        <a href="/designs" className="inline-block bg-brand-maroon text-white px-6 py-2 rounded-full hover:bg-red-900 transition">
                            Browse Designs
                        </a>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {orders.map((order) => (
                            <div key={order._id} className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100 hover:shadow-md transition">
                                <div className="p-6">
                                    <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-4 border-b border-gray-100 pb-4">
                                        <div>
                                            <span className="text-sm text-gray-500">Order #</span>
                                            <p className="font-bold text-gray-800">{order.orderNumber}</p>
                                        </div>
                                        <div>
                                            <span className="text-sm text-gray-500">Date Placed</span>
                                            <p className="font-medium flex items-center gap-1">
                                                <Calendar size={14} />
                                                {new Date(order.createdAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <div>
                                            <span className="text-sm text-gray-500">Total Amount</span>
                                            <p className="font-bold text-brand-maroon">₹{order.totalAmount}</p>
                                        </div>
                                        <div>
                                            <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide
                                                ${order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                    order.status === 'completed' ? 'bg-green-100 text-green-800' :
                                                        'bg-blue-100 text-blue-800'}`}>
                                                <Clock size={12} />
                                                {order.status.replace('_', ' ')}
                                            </span>
                                        </div>
                                    </div>

                                    <div>
                                        <h4 className="text-sm font-medium text-gray-500 mb-2">Items</h4>
                                        <div className="space-y-2">
                                            {order.orderItems.map((item, index) => (
                                                <div key={index} className="flex justify-between items-center text-sm">
                                                    <span className="text-gray-800">
                                                        {item.product?.name || `Product ID: ${item.product}`} x {item.quantity}
                                                    </span>
                                                    <span className="text-gray-600">₹{item.totalPrice}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="mt-6 flex justify-end">
                                        <Link to={`/order/${order._id}`} className="text-brand-maroon font-medium text-sm flex items-center hover:underline">
                                            View Details <ChevronRight size={16} />
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default CustomerOrders;
