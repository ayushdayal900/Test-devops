import React, { useState } from 'react';
import { MapPin, Phone, Mail, Instagram, Facebook } from 'lucide-react';
import api from '../services/api';

const Contact = () => {
    const [formData, setFormData] = useState({ name: '', email: '', phone: '', message: '' });

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/contact', formData);
            alert('Thank you for reaching out! We have received your message.');
            setFormData({ name: '', email: '', phone: '', message: '' });
        } catch (error) {
            console.error('Error sending message:', error);
            alert('Failed to send message. Please try again.');
        }
    };

    return (
        <div className="pt-4 pb-12 bg-gray-50 min-h-screen">
            <div className="container mx-auto px-4">
                <div className="text-center mb-16">
                    <h1 className="text-4xl font-serif font-bold text-brand-maroon mb-4">Get in Touch</h1>
                    <p className="text-gray-600">We'd love to hear from you. Visit our boutique or send us a message.</p>
                </div>

                <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
                    {/* Contact Info */}
                    <div className="space-y-8">
                        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
                            <h3 className="text-xl font-bold text-gray-800 mb-6 border-b pb-2">Contact Information</h3>
                            <div className="space-y-4">
                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 bg-brand-ivory rounded-full flex items-center justify-center text-brand-maroon shrink-0">
                                        <MapPin size={20} />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-800">Visit Us</h4>
                                        <p className="text-gray-600">Kalyani Chauk, Balaji Mandir,<br />Mangrul Pir, Maharashtra - 444403</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 bg-brand-ivory rounded-full flex items-center justify-center text-brand-maroon shrink-0">
                                        <Phone size={20} />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-800">Call Us</h4>
                                        <p className="text-gray-600">+91 7057164648</p>
                                        <p className="text-sm text-gray-500">Mon - Sat, 10am - 8pm</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 bg-brand-ivory rounded-full flex items-center justify-center text-brand-maroon shrink-0">
                                        <Mail size={20} />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-800">Email</h4>
                                        <p className="text-gray-600">jayashridayal1@gmail.com</p>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-8">
                                <h4 className="font-bold text-gray-800 mb-4">Follow Us</h4>
                                <div className="flex gap-4">
                                    <a href="#" className="p-3 bg-gray-100 rounded-full text-brand-maroon hover:bg-brand-maroon hover:text-white transition"><Instagram size={20} /></a>
                                    <a href="#" className="p-3 bg-gray-100 rounded-full text-blue-800 hover:bg-blue-800 hover:text-white transition"><Facebook size={20} /></a>
                                </div>
                            </div>
                        </div>

                        {/* Map Embed */}
                        <div className="bg-gray-200 h-64 rounded-xl overflow-hidden shadow-inner">
                            <iframe
                                width="100%"
                                height="100%"
                                id="gmap_canvas"
                                src="https://maps.google.com/maps?q=Kalyani%20Chauk%2C%20Balaji%20Mandir%2C%20Mangrul%20Pir&t=&z=15&ie=UTF8&iwloc=&output=embed"
                                frameBorder="0"
                                scrolling="no"
                                marginHeight="0"
                                marginWidth="0"
                                title="Laxmi Tailors Location"
                            ></iframe>
                        </div>
                    </div>

                    {/* Contact Form */}
                    <div className="bg-white p-8 rounded-xl shadow-lg border-t-4 border-brand-maroon">
                        <h3 className="text-xl font-bold text-gray-800 mb-6">Send a Message</h3>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-brand-gold focus:border-brand-gold"
                                        placeholder="Your Name"
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                                    <input
                                        type="tel"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-brand-gold focus:border-brand-gold"
                                        placeholder="+91"
                                        value={formData.phone}
                                        onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                <input
                                    type="email"
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-brand-gold focus:border-brand-gold"
                                    placeholder="you@example.com"
                                    value={formData.email}
                                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                                <textarea
                                    rows="4"
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-brand-gold focus:border-brand-gold"
                                    placeholder="How can we help you?"
                                    value={formData.message}
                                    onChange={e => setFormData({ ...formData, message: e.target.value })}
                                ></textarea>
                            </div>
                            <button type="submit" className="w-full bg-brand-maroon text-white py-3 rounded-lg font-bold hover:bg-red-900 transition shadow-md">
                                Send Message
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Contact;
