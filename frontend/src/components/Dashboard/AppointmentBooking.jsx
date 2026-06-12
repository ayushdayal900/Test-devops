import React, { useState, useEffect, useContext } from 'react';
import { Calendar, Clock, Video, Home, MapPin, CheckCircle, ExternalLink } from 'lucide-react';
import { bookAppointment, getAppointments } from '../../services/api'; // Ensure correct import path
import { AuthContext } from '../../context/AuthContext';

const AppointmentBooking = () => {
    const { token } = useContext(AuthContext);
    const [step, setStep] = useState(1);
    const [bookingType, setBookingType] = useState('');
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');
    const [loading, setLoading] = useState(false);
    const [myAppointments, setMyAppointments] = useState([]);
    const [message, setMessage] = useState('');

    useEffect(() => {
        if (token) fetchMyAppointments();
    }, [token]);

    const fetchMyAppointments = async () => {
        try {
            const data = await getAppointments(token);
            setMyAppointments(data);
        } catch (error) {
            console.error("Error fetching appointments", error);
        }
    };

    const handleBook = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await bookAppointment({ type: bookingType, date, time }, token);
            setMessage('Appointment booked successfully!');
            fetchMyAppointments();
            setStep(1);
            setBookingType('');
            setDate('');
            setTime('');
            setTimeout(() => setMessage(''), 5000);
        } catch (error) {
            setMessage('Failed to book appointment.');
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            weekday: 'short', year: 'numeric', month: 'short', day: 'numeric'
        });
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 mt-8 overflow-hidden">
            <div className="p-6 bg-brand-gold/5 border-b border-brand-gold/10">
                <h2 className="text-xl font-serif font-bold text-gray-800 flex items-center gap-2">
                    <Calendar className="text-brand-maroon" size={24} />
                    Customize your Patal
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                    Book a consultation for measurements, fabric selection, or design discussion.
                </p>
            </div>

            <div className="p-6">
                {message && (
                    <div className={`mb-6 p-4 rounded-lg flex items-center gap-2 ${message.includes('Failed') ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
                        <CheckCircle size={18} /> {message}
                    </div>
                )}

                {/* Booking Form */}
                <div className="mb-8">
                    <h3 className="font-bold text-gray-700 mb-4">Book a New Session</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <SelectionCard
                            icon={<Video size={24} />}
                            title="Video Call"
                            desc="Virtual measurement guide via Jitsi Meet"
                            active={bookingType === 'video'}
                            onClick={() => setBookingType('video')}
                        />
                        <SelectionCard
                            icon={<MapPin size={24} />}
                            title="Store Visit"
                            desc="Visit our boutique for personal attention"
                            active={bookingType === 'in_person'}
                            onClick={() => setBookingType('in_person')}
                        />
                        <SelectionCard
                            icon={<Home size={24} />}
                            title="Home Visit"
                            desc="We come to your doorstep (Premium)"
                            active={bookingType === 'home_visit'}
                            onClick={() => setBookingType('home_visit')}
                        />
                    </div>

                    {bookingType && (
                        <form onSubmit={handleBook} className="bg-gray-50 p-6 rounded-xl animate-fade-in">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-600 mb-2">Select Date</label>
                                    <input
                                        type="date"
                                        required
                                        min={new Date().toISOString().split('T')[0]}
                                        value={date}
                                        onChange={(e) => setDate(e.target.value)}
                                        className="w-full p-3 border border-gray-200 rounded-lg focus:ring-brand-gold focus:border-brand-gold"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-600 mb-2">Select Time</label>
                                    <input
                                        type="time"
                                        required
                                        value={time}
                                        onChange={(e) => setTime(e.target.value)}
                                        className="w-full p-3 border border-gray-200 rounded-lg focus:ring-brand-gold focus:border-brand-gold"
                                    />
                                </div>
                            </div>
                            <button
                                type="submit"
                                disabled={loading || !date || !time}
                                className="mt-6 w-full bg-brand-maroon text-white py-3 rounded-lg font-medium hover:bg-red-900 transition disabled:opacity-50"
                            >
                                {loading ? 'Booking...' : 'Confirm Appointment'}
                            </button>
                        </form>
                    )}
                </div>

                {/* Upcoming Appointments */}
                {myAppointments.length > 0 && (
                    <div className="border-t border-gray-100 pt-8">
                        <h3 className="font-bold text-gray-700 mb-4">Your Upcoming Sessions</h3>
                        <div className="space-y-4">
                            {myAppointments.map((apt) => (
                                <div key={apt._id} className="flex flex-col md:flex-row md:items-center justify-between p-4 border border-gray-100 rounded-lg hover:border-brand-gold/30 transition bg-white shadow-sm">
                                    <div className="flex items-start gap-4">
                                        <div className={`p-3 rounded-full ${apt.type === 'video' ? 'bg-blue-50 text-blue-600' : 'bg-orange-50 text-orange-600'}`}>
                                            {apt.type === 'video' ? <Video size={20} /> : <MapPin size={20} />}
                                        </div>
                                        <div>
                                            <p className="font-semibold text-gray-800 capitalize">
                                                {apt.type.replace('_', ' ')} Consultation
                                            </p>
                                            <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                                                <span className="flex items-center gap-1"><Calendar size={14} /> {formatDate(apt.date)}</span>
                                                <span className="flex items-center gap-1"><Clock size={14} /> {apt.time}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-4 md:mt-0 flex items-center gap-3">
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${apt.status === 'completed' ? 'bg-green-100 text-green-700' :
                                                apt.status === 'cancelled' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                                            }`}>
                                            {apt.status}
                                        </span>

                                        {apt.type === 'video' && apt.status === 'scheduled' && apt.meetingLink && (
                                            <a
                                                href={apt.meetingLink}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-2 bg-brand-maroon text-white px-4 py-2 rounded-lg text-sm hover:bg-red-900 transition"
                                            >
                                                <Video size={16} /> Join Call
                                            </a>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

const SelectionCard = ({ icon, title, desc, active, onClick }) => (
    <div
        onClick={onClick}
        className={`cursor-pointer p-4 rounded-xl border-2 transition-all duration-200 ${active ? 'border-brand-maroon bg-red-50' : 'border-gray-100 hover:border-gray-200 bg-white'
            }`}
    >
        <div className={`mb-3 ${active ? 'text-brand-maroon' : 'text-gray-400'}`}>{icon}</div>
        <h4 className={`font-bold ${active ? 'text-brand-maroon' : 'text-gray-700'}`}>{title}</h4>
        <p className="text-xs text-gray-500 mt-1 leading-relaxed">{desc}</p>
    </div>
);

export default AppointmentBooking;
