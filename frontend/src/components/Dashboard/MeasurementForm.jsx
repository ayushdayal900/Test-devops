import React, { useState, useEffect } from 'react';
import api from '../../services/api';

const MeasurementForm = ({ initialData, onSave }) => {
    const [formData, setFormData] = useState({
        profileName: 'My Body Measurements',
        blouseLength: '',
        blouseWidth: '',
        sareeLength: '',
        shoulderWidth: '',
        waist: '',
        hip: '',
        notes: ''
    });
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (initialData) {
            setFormData({
                profileName: initialData.profileName || 'My Body Measurements',
                blouseLength: initialData.blouseLength || '',
                blouseWidth: initialData.blouseWidth || '',
                sareeLength: initialData.sareeLength || '',
                shoulderWidth: initialData.shoulderWidth || '',
                waist: initialData.waist || '',
                hip: initialData.hip || '',
                notes: initialData.notes || ''
            });
        }
    }, [initialData]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const STANDARD_SIZES = {
        'S': { blouseLength: 13.5, blouseWidth: 32, waist: 26, hip: 36, shoulderWidth: 14, sareeLength: 5.5 },
        'M': { blouseLength: 14, blouseWidth: 34, waist: 28, hip: 38, shoulderWidth: 14.5, sareeLength: 5.5 },
        'L': { blouseLength: 14.5, blouseWidth: 36, waist: 30, hip: 40, shoulderWidth: 15, sareeLength: 5.5 },
        'XL': { blouseLength: 15, blouseWidth: 38, waist: 32, hip: 42, shoulderWidth: 15.5, sareeLength: 6 },
        'XXL': { blouseLength: 15.5, blouseWidth: 40, waist: 34, hip: 44, shoulderWidth: 16, sareeLength: 6 },
        'XXXL': { blouseLength: 16, blouseWidth: 42, waist: 36, hip: 46, shoulderWidth: 16.5, sareeLength: 6.3 }
    };

    const handleSizePreset = (size) => {
        const measurements = STANDARD_SIZES[size];
        if (measurements) {
            setFormData({
                ...formData,
                ...measurements,
                profileName: `My Body Measurements (${size})`
            });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');

        try {
            await api.post('/customers/measurements', formData);
            setMessage('Measurements saved successfully!');
            if (onSave) onSave();
        } catch (error) {
            setMessage('Failed to save measurements. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {message && (
                <div className={`p-4 rounded-md ${message.includes('success') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                    {message}
                </div>
            )}

            {/* Standard Size Presets */}
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <label className="block text-sm font-medium text-gray-700 mb-3">Quick Fill (Standard Sizes)</label>
                <div className="flex flex-wrap gap-2">
                    {['S', 'M', 'L', 'XL', 'XXL', 'XXXL'].map((size) => (
                        <button
                            key={size}
                            type="button"
                            onClick={() => handleSizePreset(size)}
                            className="px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-brand-maroon hover:text-white hover:border-brand-maroon transition shadow-sm"
                        >
                            {size}
                        </button>
                    ))}
                </div>
                <p className="text-xs text-gray-500 mt-2">Clicking a size will pre-fill the form with standard measurements. You can still adjust them below.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Blouse Length (inches)</label>
                    <input
                        type="number"
                        step="0.1"
                        name="blouseLength"
                        value={formData.blouseLength}
                        onChange={handleChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-brand-gold focus:border-brand-gold sm:text-sm"
                        placeholder="e.g. 14.5"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Blouse Width / Bust (inches)</label>
                    <input
                        type="number"
                        step="0.1"
                        name="blouseWidth"
                        value={formData.blouseWidth}
                        onChange={handleChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-brand-gold focus:border-brand-gold sm:text-sm"
                        placeholder="e.g. 36"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Waist (inches)</label>
                    <input
                        type="number"
                        step="0.1"
                        name="waist"
                        value={formData.waist}
                        onChange={handleChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-brand-gold focus:border-brand-gold sm:text-sm"
                        placeholder="e.g. 32"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Hips (inches)</label>
                    <input
                        type="number"
                        step="0.1"
                        name="hip"
                        value={formData.hip}
                        onChange={handleChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-brand-gold focus:border-brand-gold sm:text-sm"
                        placeholder="e.g. 38"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Shoulder Width (inches)</label>
                    <input
                        type="number"
                        step="0.1"
                        name="shoulderWidth"
                        value={formData.shoulderWidth}
                        onChange={handleChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-brand-gold focus:border-brand-gold sm:text-sm"
                        placeholder="e.g. 15"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Saree Length (Optional)</label>
                    <input
                        type="number"
                        step="0.1"
                        name="sareeLength"
                        value={formData.sareeLength}
                        onChange={handleChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-brand-gold focus:border-brand-gold sm:text-sm"
                        placeholder="e.g. 5.5 (meters)"
                    />
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700">Additional Notes</label>
                <textarea
                    rows={3}
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-brand-gold focus:border-brand-gold sm:text-sm"
                    placeholder="Specific instructions..."
                />
            </div>

            <div className="flex justify-end">
                <button
                    type="submit"
                    disabled={loading}
                    className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-brand-maroon hover:bg-red-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-gold disabled:opacity-50"
                >
                    {loading ? 'Saving...' : 'Save Measurements'}
                </button>
            </div>
        </form>
    );
};

export default MeasurementForm;
