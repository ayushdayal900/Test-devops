import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { ArrowLeft, Package, User, MapPin, CreditCard, Save, Send, AlertTriangle } from 'lucide-react';

const AdminOrderDetails = () => {
    const { id } = useParams();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [status, setStatus] = useState('');
    const [adminNote, setAdminNote] = useState('');
    const [updating, setUpdating] = useState(false);

    useEffect(() => {
        fetchOrder();
    }, [id]);

    const fetchOrder = async () => {
        try {
            const token = localStorage.getItem('token');
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const res = await api.get(`/orders/${id}`, config); // Using standard order fetch for now
            setOrder(res.data);
            setStatus(res.data.status);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching order:", error);
            setLoading(false);
        }
    };

    const handleStatusUpdate = async () => {
        if (!window.confirm(`Update status to ${status}?`)) return;
        setUpdating(true);
        try {
            const token = localStorage.getItem('token');
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const res = await api.patch(`/admin/orders/${id}/status`,
                { status, note: adminNote },
                config
            );
            setOrder(res.data);
            setAdminNote('');
            alert('Status updated successfully');
        } catch (error) {
            console.error("Error updating status:", error);
            alert("Failed to update status");
        } finally {
            setUpdating(false);
        }
    };

    if (loading) return <div className="p-8"><div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-brand-maroon"></div></div>;
    if (!order) return <div className="p-8 text-center text-red-500">Order not found</div>;

    return (
        <div className="p-8 bg-gray-50 min-h-screen">
            <Link to="/admin/orders" className="inline-flex items-center text-gray-500 hover:text-brand-maroon mb-6 transition">
                <ArrowLeft size={18} className="mr-2" /> Back to Orders
            </Link>

            <div className="flex flex-col lg:flex-row gap-8">
                {/* Left Column: Order Info */}
                <div className="flex-1 space-y-8">
                    {/* Header */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex justify-between items-start">
                        <div>
                            <h1 className="text-2xl font-serif font-bold text-gray-800">Order #{order.orderNumber}</h1>
                            <p className="text-gray-500 text-sm mt-1">
                                Placed on {new Date(order.createdAt).toLocaleString()}
                            </p>
                        </div>
                        <div className="text-right">
                            <p className="text-sm text-gray-500">Total Amount</p>
                            <p className="text-3xl font-bold text-brand-maroon">₹{order.totalAmount}</p>
                        </div>
                    </div>

                    {/* Order Items */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <Package size={20} className="text-brand-maroon" /> Order Items
                        </h3>
                        <div className="space-y-6">
                            {order.orderItems.map((item, idx) => (
                                <div key={idx} className="flex gap-4 border-b border-gray-100 pb-4 last:border-0 last:pb-0">
                                    <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                                        <img src="https://via.placeholder.com/150" alt="Item" className="w-full h-full object-cover" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex justify-between">
                                            <div>
                                                <p className="font-bold text-gray-800">{item.product?.name || 'Unknown Product'}</p>
                                                <p className="text-xs text-gray-500">ID: {item.product?._id || 'N/A'}</p>
                                            </div>
                                            <p className="font-medium">₹{item.totalPrice}</p>
                                        </div>
                                        <div className="text-sm text-gray-500 mt-1">
                                            <p>Qty: {item.quantity} | Unit: ₹{item.unitPrice}</p>
                                            {item.selectedFabric && <p>Fabric: {item.selectedFabric}</p>}
                                        </div>

                                        {item.selectedCustomizations && Object.keys(item.selectedCustomizations).length > 0 && (
                                            <div className="mt-2 text-xs bg-gray-50 p-2 rounded text-gray-600 border border-gray-200">
                                                <span className="font-semibold block mb-1">Customizations:</span>
                                                <pre className="whitespace-pre-wrap font-sans">
                                                    {JSON.stringify(item.selectedCustomizations, null, 2)}
                                                </pre>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Order Timeline */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <h3 className="font-bold text-gray-800 mb-4">Status Timeline</h3>
                        <div className="space-y-4">
                            {order.statusTimeline?.slice().reverse().map((log, idx) => (
                                <div key={idx} className="flex gap-3">
                                    <div className="flex flex-col items-center">
                                        <div className="w-3 h-3 bg-brand-maroon rounded-full"></div>
                                        <div className="w-0.5 bg-gray-200 flex-1 h-full min-h-[20px] last:hidden"></div>
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-800 capitalize text-sm">{log.status.replace('_', ' ')}</p>
                                        <p className="text-xs text-gray-500">{new Date(log.changedAt).toLocaleString()}</p>
                                        {log.notes && <p className="text-xs text-gray-600 italic mt-1">"{log.notes}"</p>}
                                    </div>
                                </div>
                            ))}
                            {(!order.statusTimeline || order.statusTimeline.length === 0) && (
                                <p className="text-sm text-gray-400">No status history available.</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Column: Actions & Details */}
                <div className="lg:w-96 space-y-8">
                    {/* Status Management */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <h3 className="font-bold text-gray-800 mb-4">Update Status</h3>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">New Status</label>
                                <select
                                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-brand-maroon"
                                    value={status}
                                    onChange={(e) => setStatus(e.target.value)}
                                >
                                    <option value="pending">Pending</option>
                                    <option value="measurements_confirmed">Measurements Confirmed</option>
                                    <option value="in_stitching">In Stitching</option>
                                    <option value="ready">Ready</option>
                                    <option value="dispatched">Dispatched</option>
                                    <option value="completed">Completed</option>
                                    <option value="cancelled">Cancelled</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Admin Note</label>
                                <textarea
                                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-brand-maroon"
                                    rows="3"
                                    placeholder="Add reason or tracking info..."
                                    value={adminNote}
                                    onChange={(e) => setAdminNote(e.target.value)}
                                ></textarea>
                            </div>
                            <button
                                onClick={handleStatusUpdate}
                                disabled={updating}
                                className="w-full bg-brand-maroon text-white py-2 rounded-lg font-bold hover:bg-red-900 transition flex items-center justify-center gap-2"
                            >
                                {updating ? 'Updating...' : <><Save size={18} /> Update Order Status</>}
                            </button>
                        </div>
                    </div>

                    {/* Customer Info */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <User size={20} className="text-gray-500" /> Customer
                        </h3>
                        <div className="space-y-3 text-sm">
                            <div>
                                <p className="text-gray-500">Name</p>
                                <p className="font-medium">{order.customer?.firstName} {order.customer?.lastName}</p>
                            </div>
                            <div>
                                <p className="text-gray-500">Email</p>
                                <p className="font-medium break-all">{order.customer?.email}</p>
                            </div>
                            <div>
                                <p className="text-gray-500">Phone</p>
                                <p className="font-medium">{order.customer?.phone || 'N/A'}</p>
                            </div>
                        </div>
                    </div>

                    {/* Delivery Address */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <MapPin size={20} className="text-gray-500" /> Shipping Address
                        </h3>
                        <div className="text-sm text-gray-600 leading-relaxed">
                            <p>{order.deliveryAddress?.street}</p>
                            <p>{order.deliveryAddress?.city}, {order.deliveryAddress?.state}</p>
                            <p>{order.deliveryAddress?.postalCode}</p>
                            <p>{order.deliveryAddress?.country}</p>
                        </div>
                    </div>

                    {/* Payment Info */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <CreditCard size={20} className="text-gray-500" /> Payment
                        </h3>
                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-500">Status</span>
                                <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${order.paymentStatus === 'paid' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                                    {order.paymentStatus}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Method</span>
                                <span className="font-medium">Cash on Delivery</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminOrderDetails;
