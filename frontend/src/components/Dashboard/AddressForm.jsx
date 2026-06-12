import React, { useState } from 'react';
import api from '../../services/api';
import { Home, Briefcase, MapPin, X, Check } from 'lucide-react';

const AddressForm = ({ onSave, onCancel }) => {
    const [formData, setFormData] = useState({
        type: 'home',
        street: '',
        city: '',
        state: '',
        postalCode: '',
        country: 'India',
        isDefault: false
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleChange = (e) => {
        const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
        setFormData({ ...formData, [e.target.name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const token = localStorage.getItem('token');
            const config = {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
            };

            await api.post('/customers/address', formData, config);
            onSave();
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || 'Failed to save address');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
                <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
                    {error}
                </div>
            )}

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Address Type</label>
                <div className="flex gap-4">
                    <button
                        type="button"
                        onClick={() => setFormData({ ...formData, type: 'home' })}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${formData.type === 'home' ? 'bg-brand-maroon text-white border-brand-maroon' : 'bg-white text-gray-600 border-gray-300'}`}
                    >
                        <Home size={16} /> Home
                    </button>
                    <button
                        type="button"
                        onClick={() => setFormData({ ...formData, type: 'work' })}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${formData.type === 'work' ? 'bg-brand-maroon text-white border-brand-maroon' : 'bg-white text-gray-600 border-gray-300'}`}
                    >
                        <Briefcase size={16} /> Work
                    </button>
                    <button
                        type="button"
                        onClick={() => setFormData({ ...formData, type: 'other' })}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${formData.type === 'other' ? 'bg-brand-maroon text-white border-brand-maroon' : 'bg-white text-gray-600 border-gray-300'}`}
                    >
                        <MapPin size={16} /> Other
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Street Address</label>
                    <input
                        type="text"
                        name="street"
                        value={formData.street}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-maroon focus:border-transparent transition outline-none"
                        placeholder="Flat No, Building, Street Area"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                    <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-maroon focus:border-transparent transition outline-none"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                    <input
                        type="text"
                        name="state"
                        value={formData.state}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-maroon focus:border-transparent transition outline-none"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Postal Code</label>
                    <input
                        type="text"
                        name="postalCode"
                        value={formData.postalCode}
                        onChange={handleChange}
                        required
                        pattern="[0-9]{6}"
                        title="Six digit PIN code"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-maroon focus:border-transparent transition outline-none"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                    <input
                        type="text"
                        name="country"
                        value={formData.country}
                        onChange={handleChange}
                        disabled
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                    />
                </div>
            </div>

            <div className="flex items-center gap-2">
                <input
                    type="checkbox"
                    id="isDefault"
                    name="isDefault"
                    checked={formData.isDefault}
                    onChange={handleChange}
                    className="w-4 h-4 text-brand-maroon border-gray-300 rounded focus:ring-brand-maroon"
                />
                <label htmlFor="isDefault" className="text-sm text-gray-700">Set as default address</label>
            </div>

            <div className="flex gap-4 pt-4">
                <button
                    type="button"
                    onClick={onCancel}
                    className="flex-1 px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 px-6 py-2 bg-brand-maroon text-white rounded-lg hover:bg-red-900 transition flex justify-center items-center gap-2"
                >
                    {loading ? 'Saving...' : <><Check size={18} /> Save Address</>}
                </button>
            </div>
        </form>
    );
};

export default AddressForm;
