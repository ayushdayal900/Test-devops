import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { getAllAppointments, updateAppointmentStatus } from '../../services/api';
import { Calendar, Video, MapPin, User, CheckCircle, Clock, XCircle, ExternalLink, Copy } from 'lucide-react';

const AdminMeetings = () => {
    const { token } = useContext(AuthContext);
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all'); // all, pending, confirmed, completed

    useEffect(() => {
        fetchAppointments();
    }, [token]);

    const fetchAppointments = async () => {
        try {
            const data = await getAllAppointments(token);
            setAppointments(data);
        } catch (error) {
            console.error("Error fetching appointments:", error);
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        alert("Meeting link copied to clipboard!");
    };

    const handleStatusUpdate = async (id, newStatus) => {
        if (!window.confirm(`Are you sure you want to mark this as ${newStatus}?`)) return;
        try {
            await updateAppointmentStatus(id, newStatus, token);
            fetchAppointments(); // Refresh list
        } catch (error) {
            console.error("Error updating status:", error);
        }
    };

    const filteredAppointments = appointments.filter(appt =>
        filter === 'all' ? true : appt.status === filter
    );

    const getStatusColor = (status) => {
        switch (status) {
            case 'pending': return 'bg-yellow-100 text-yellow-800';
            case 'confirmed': return 'bg-blue-100 text-blue-800';
            case 'completed': return 'bg-green-100 text-green-800';
            case 'cancelled': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getTypeIcon = (type) => {
        switch (type) {
            case 'video': return <Video size={16} className="text-blue-600" />;
            case 'home_visit': return <MapPin size={16} className="text-purple-600" />;
            case 'store_visit': return <MapPin size={16} className="text-orange-600" />;
            default: return <User size={16} />;
        }
    };

    if (loading) return <div className="p-8 text-center">Loading appointments...</div>;

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-serif font-bold text-gray-800">Meetings & Appointments</h1>
                    <p className="text-gray-500">Manage video calls, home visits, and store visits.</p>
                </div>
                <div className="flex gap-2">
                    {['all', 'pending', 'confirmed', 'completed', 'cancelled'].map(status => (
                        <button
                            key={status}
                            onClick={() => setFilter(status)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition capitalize ${filter === status
                                    ? 'bg-brand-maroon text-white'
                                    : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                                }`}
                        >
                            {status}
                        </button>
                    ))}
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th className="px-6 py-4 font-semibold text-gray-700">Customer</th>
                            <th className="px-6 py-4 font-semibold text-gray-700">Type</th>
                            <th className="px-6 py-4 font-semibold text-gray-700">Date & Time</th>
                            <th className="px-6 py-4 font-semibold text-gray-700">Link / Location</th>
                            <th className="px-6 py-4 font-semibold text-gray-700">Status</th>
                            <th className="px-6 py-4 font-semibold text-gray-700">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {filteredAppointments.length === 0 ? (
                            <tr>
                                <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                                    No appointments found for this filter.
                                </td>
                            </tr>
                        ) : (
                            filteredAppointments.map(appt => (
                                <tr key={appt._id} className="hover:bg-gray-50 transition">
                                    <td className="px-6 py-4">
                                        <div className="font-medium text-gray-900">
                                            {appt.user?.firstName} {appt.user?.lastName}
                                        </div>
                                        <div className="text-sm text-gray-500">{appt.user?.email || 'No email'}</div>
                                        <div className="text-sm text-gray-500">{appt.user?.phone || 'No phone'}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            {getTypeIcon(appt.type)}
                                            <span className="capitalize">{appt.type.replace('_', ' ')}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2 text-gray-700">
                                            <Calendar size={14} />
                                            <span>{new Date(appt.date).toLocaleDateString()}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-gray-500 text-sm mt-1">
                                            <Clock size={14} />
                                            <span>{appt.time}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        {appt.type === 'video' && appt.meetingLink ? (
                                            <div className="flex flex-col gap-2 items-start">
                                                <a
                                                    href={`${appt.meetingLink}#userInfo.displayName="Mahalaxmi Tailors"`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-1 text-blue-600 hover:underline font-medium"
                                                >
                                                    Join as Admin <ExternalLink size={14} />
                                                </a>
                                                <button
                                                    onClick={() => copyToClipboard(appt.meetingLink)}
                                                    className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-gray-800 border border-gray-200 px-2 py-1 rounded bg-gray-50 hover:bg-gray-100 transition"
                                                    title="Copy Link for Participants"
                                                >
                                                    <Copy size={12} /> Copy Link
                                                </button>
                                            </div>
                                        ) : (
                                            <span className="text-gray-500 text-sm">
                                                {appt.type === 'home_visit' ? 'Customer Address' : 'Store Location'}
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${getStatusColor(appt.status)}`}>
                                            {appt.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex gap-2">
                                            {appt.status === 'pending' && (
                                                <button
                                                    onClick={() => handleStatusUpdate(appt._id, 'confirmed')}
                                                    className="p-1 text-green-600 hover:bg-green-50 rounded"
                                                    title="Confirm"
                                                >
                                                    <CheckCircle size={18} />
                                                </button>
                                            )}
                                            {appt.status !== 'completed' && appt.status !== 'cancelled' && (
                                                <button
                                                    onClick={() => handleStatusUpdate(appt._id, 'completed')}
                                                    className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                                                    title="Mark Completed"
                                                >
                                                    <CheckCircle size={18} />
                                                </button>
                                            )}
                                            {appt.status !== 'cancelled' && (
                                                <button
                                                    onClick={() => handleStatusUpdate(appt._id, 'cancelled')}
                                                    className="p-1 text-red-600 hover:bg-red-50 rounded"
                                                    title="Cancel"
                                                >
                                                    <XCircle size={18} />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminMeetings;
