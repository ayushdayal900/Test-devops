import React, { useState, useEffect, useContext } from 'react';
import api from '../../services/api';
import { AuthContext } from '../../context/AuthContext'; // Import AuthContext
import { Ruler, Save, Edit2, CheckCircle } from 'lucide-react';
import AppointmentBooking from './AppointmentBooking';

const MeasurementTab = () => {
    const { token } = React.useContext(AuthContext); // Use token from context
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [measurements, setMeasurements] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [message, setMessage] = useState('');

    const emptyState = {
        profileName: 'My Measurements',
        standardSize: 'Custom',
        shoulder: '', bust: '', chest: '', waist: '', armHole: '',
        sleeveLength: '', bicep: '', hips: '', inseam: '', length: '', thigh: '',
        unit: 'inch'
    };

    const [formData, setFormData] = useState(emptyState);

    useEffect(() => {
        if (token) {
            fetchMeasurements();
        }
    }, [token]);

    const fetchMeasurements = async () => {
        try {
            // Since our backend returns an array, we pick the first one or default
            const res = await api.get('/measurements');

            if (res.data && res.data.length > 0) {
                setMeasurements(res.data[0]);
                setFormData(res.data[0]);
            } else {
                setIsEditing(true); // No measurements found, start in edit mode
            }
        } catch (error) {
            console.error("Error fetching measurements", error);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setMessage('');

        // Clean data: Convert empty strings to null/undefined for numeric fields
        const cleanedData = Object.fromEntries(
            Object.entries(formData).map(([key, value]) => {
                if (key === 'profileName' || key === 'standardSize' || key === 'unit') return [key, value];
                return [key, value === '' ? null : value];
            })
        );

        try {
            const res = await api.post('/measurements', cleanedData);
            setMeasurements(res.data); // Update view with saved data
            setIsEditing(false);
            setMessage('Measurements saved successfully!');
            setTimeout(() => setMessage(''), 3000);
        } catch (error) {
            console.error("Error saving measurements", error);
            const errorMsg = error.response?.data?.message || 'Failed to save. Please try again.';
            setMessage(errorMsg);
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-8 text-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-maroon mx-auto"></div></div>;

    const sizeChart = {
        'XS': { shoulder: 13.5, bust: 32, waist: 28, hips: 34, armHole: 14, sleeveLength: 16, length: 40, inseam: 28, thigh: 20 },
        'S': { shoulder: 14, bust: 34, waist: 30, hips: 36, armHole: 15, sleeveLength: 16.5, length: 41, inseam: 28, thigh: 21 },
        'M': { shoulder: 14.5, bust: 36, waist: 32, hips: 38, armHole: 16, sleeveLength: 17, length: 42, inseam: 29, thigh: 22 },
        'L': { shoulder: 15, bust: 38, waist: 34, hips: 40, armHole: 17, sleeveLength: 17.5, length: 43, inseam: 29, thigh: 23 },
        'XL': { shoulder: 15.5, bust: 40, waist: 36, hips: 42, armHole: 18, sleeveLength: 18, length: 44, inseam: 30, thigh: 24 },
        'XXL': { shoulder: 16, bust: 42, waist: 38, hips: 44, armHole: 19, sleeveLength: 18.5, length: 45, inseam: 30, thigh: 25 },
        'XXXL': { shoulder: 16.5, bust: 44, waist: 40, hips: 46, armHole: 20, sleeveLength: 19, length: 46, inseam: 31, thigh: 26 },
        'Custom': {} // No auto-fill
    };

    const handleSizeSelect = (size) => {
        const defaults = sizeChart[size] || {};
        setFormData(prev => ({
            ...prev,
            ...defaults,
            standardSize: size
        }));
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                <div className="flex items-center gap-3">
                    <div className="bg-brand-gold/10 p-2 rounded-lg text-brand-maroon">
                        <Ruler size={24} />
                    </div>
                    <div>
                        <h2 className="text-xl font-serif font-bold text-gray-800">My Measurements</h2>
                        <p className="text-sm text-gray-500">Save your details for a perfect fit.</p>
                    </div>
                </div>
                {!isEditing && measurements && (
                    <button
                        onClick={() => setIsEditing(true)}
                        className="flex items-center gap-2 text-brand-maroon hover:bg-red-50 px-4 py-2 rounded-lg transition text-sm font-medium"
                    >
                        <Edit2 size={16} /> Edit
                    </button>
                )}
            </div>

            <div className="p-6">
                {message && (
                    <div className={`mb-6 p-4 rounded-lg flex items-center gap-2 ${message.includes('Faile') ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
                        <CheckCircle size={18} /> {message}
                    </div>
                )}

                {isEditing ? (
                    <form onSubmit={handleSubmit}>
                        <div className="mb-8 p-4 bg-gray-50 rounded-lg border border-gray-100">
                            <label className="block text-sm font-bold text-gray-700 mb-3">Select a Standard Size (Auto-fill)</label>
                            <div className="flex flex-wrap gap-2">
                                {Object.keys(sizeChart).map((size) => (
                                    <button
                                        type="button"
                                        key={size}
                                        onClick={() => handleSizeSelect(size)}
                                        className={`px-4 py-2 rounded-md border text-sm font-semibold transition ${formData.standardSize === size
                                            ? 'bg-brand-maroon text-white border-brand-maroon shadow-md transform scale-105'
                                            : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-100'
                                            }`}
                                    >
                                        {size}
                                    </button>
                                ))}
                            </div>
                            <p className="text-xs text-gray-500 mt-2">Selecting a size will auto-fill the measurements below with standard values.</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                            {/* Upper Body */}
                            <div className="col-span-full">
                                <h3 className="font-bold text-gray-800 mb-4 border-b pb-2">Upper Body</h3>
                            </div>

                            <InputField label="Shoulder" name="shoulder" value={formData.shoulder} onChange={handleChange} />
                            <InputField label="Bust / Chest" name="bust" value={formData.bust || formData.chest} onChange={handleChange} placeholder="Bust for women, Chest for men" />
                            <InputField label="Waist" name="waist" value={formData.waist} onChange={handleChange} />
                            <InputField label="Arm Hole" name="armHole" value={formData.armHole} onChange={handleChange} />
                            <InputField label="Sleeve Length" name="sleeveLength" value={formData.sleeveLength} onChange={handleChange} />

                            {/* Lower Body */}
                            <div className="col-span-full mt-4">
                                <h3 className="font-bold text-gray-800 mb-4 border-b pb-2">Lower Body & Lengths</h3>
                            </div>

                            <InputField label="Hips" name="hips" value={formData.hips} onChange={handleChange} />
                            <InputField label="Full Length" name="length" value={formData.length} onChange={handleChange} />
                            <InputField label="Inseam" name="inseam" value={formData.inseam} onChange={handleChange} />
                            <InputField label="Thigh" name="thigh" value={formData.thigh} onChange={handleChange} />
                        </div>

                        <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                            {measurements && (
                                <button
                                    type="button"
                                    onClick={() => { setIsEditing(false); setFormData(measurements); }}
                                    className="px-6 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
                                >
                                    Cancel
                                </button>
                            )}
                            <button
                                type="submit"
                                disabled={saving}
                                className="bg-brand-maroon text-white px-8 py-2 rounded-lg hover:bg-red-900 transition flex items-center gap-2 shadow-lg disabled:opacity-70"
                            >
                                {saving ? 'Saving...' : <><Save size={18} /> Save Measurements</>}
                            </button>
                        </div>
                    </form>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-y-6 gap-x-12">
                        <div className="col-span-full mb-2 pb-4 border-b border-gray-100 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <span className="text-gray-500 font-medium">Standard Size:</span>
                                <span className="bg-brand-maroon text-white px-4 py-1 rounded-full font-bold text-sm shadow-sm">
                                    {measurements.standardSize || 'Custom'}
                                </span>
                            </div>
                        </div>
                        <DisplayField label="Shoulder" value={measurements.shoulder} />
                        <DisplayField label="Bust/Chest" value={measurements.bust || measurements.chest} />
                        <DisplayField label="Waist" value={measurements.waist} />
                        <DisplayField label="Hips" value={measurements.hips} />
                        <DisplayField label="Full Length" value={measurements.length} />
                        <DisplayField label="Sleeve Length" value={measurements.sleeveLength} />
                        <DisplayField label="Arm Hole" value={measurements.armHole} />
                        <DisplayField label="Inseam" value={measurements.inseam} />
                    </div>
                )}
            </div>

            <AppointmentBooking />
        </div>
    );
};

const InputField = ({ label, name, value, onChange, placeholder }) => (
    <div>
        <label className="block text-sm font-medium text-gray-600 mb-1">{label} (inches)</label>
        <input
            type="number"
            name={name}
            value={value || ''}
            onChange={onChange}
            placeholder={placeholder || "0.0"}
            className="w-full p-2 border border-gray-200 rounded-lg focus:ring-brand-gold focus:border-brand-gold transition"
        />
    </div>
);

const DisplayField = ({ label, value }) => (
    <div>
        <span className="block text-xs uppercase tracking-wider text-gray-400 mb-1">{label}</span>
        <span className="text-lg font-medium text-gray-800">{value ? `${value}"` : '-'}</span>
    </div>
);

export default MeasurementTab;
