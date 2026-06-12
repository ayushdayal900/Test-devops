import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Mail, Phone, Calendar, User, Search } from 'lucide-react';

const AdminMessages = () => {
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchMessages();
    }, []);

    const fetchMessages = async () => {
        try {
            const token = localStorage.getItem('token');
            const config = {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            };
            const res = await api.get('/contact', config);
            setMessages(res.data.data); // Assuming response structure { success: true, data: [...] }
            setLoading(false);
        } catch (error) {
            console.error("Error fetching messages", error);
            setLoading(false);
        }
    };

    const filteredMessages = messages.filter(msg =>
        msg.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        msg.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        msg.message.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return (
        <div className="flex justify-center items-center h-screen">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-maroon"></div>
        </div>
    );

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-serif font-bold text-gray-800">Messages</h1>
                    <p className="text-gray-500 mt-1">View and manage contact form inquiries</p>
                </div>
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Search messages..."
                        className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-brand-gold focus:border-brand-gold w-64"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 text-gray-500 uppercase text-xs font-semibold">
                            <tr>
                                <th className="px-6 py-4">Sender</th>
                                <th className="px-6 py-4">Contact Info</th>
                                <th className="px-6 py-4">Message</th>
                                <th className="px-6 py-4">Date</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredMessages.length > 0 ? (
                                filteredMessages.map((msg) => (
                                    <tr key={msg._id} className="hover:bg-gray-50 transition">
                                        <td className="px-6 py-4 align-top">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-brand-ivory rounded-full flex items-center justify-center text-brand-maroon font-bold shrink-0">
                                                    {msg.name.charAt(0).toUpperCase()}
                                                </div>
                                                <div className="font-medium text-gray-900">{msg.name}</div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 align-top">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2 text-gray-600 text-sm">
                                                    <Mail size={14} /> {msg.email}
                                                </div>
                                                {msg.phone && (
                                                    <div className="flex items-center gap-2 text-gray-600 text-sm">
                                                        <Phone size={14} /> {msg.phone}
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 align-top">
                                            <p className="text-gray-700 text-sm whitespace-pre-wrap max-w-md">{msg.message}</p>
                                        </td>
                                        <td className="px-6 py-4 align-top text-sm text-gray-500 whitespace-nowrap">
                                            <div className="flex items-center gap-2">
                                                <Calendar size={14} />
                                                {new Date(msg.createdAt).toLocaleDateString('en-IN', {
                                                    day: 'numeric', month: 'short', year: 'numeric',
                                                    hour: '2-digit', minute: '2-digit'
                                                })}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="4" className="px-6 py-12 text-center text-gray-400">
                                        <Mail size={48} className="mx-auto mb-3 opacity-20" />
                                        <p>No messages found matching your search.</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminMessages;
