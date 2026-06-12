import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

const CookieConsent = () => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const consent = localStorage.getItem('cookieConsent');
        if (!consent) {
            setIsVisible(true);
        }
    }, []);

    const handleAccept = () => {
        localStorage.setItem('cookieConsent', 'true');
        setIsVisible(false);
    };

    if (!isVisible) return null;

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-gray-900 text-white p-4 z-50 shadow-lg">
            <div className="container mx-auto max-w-6xl flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex-1">
                    <p className="text-sm">
                        We use cookies to enhance your experience. By continuing to visit this site you agree to our use of cookies.
                        <a href="/privacy" className="underline ml-1 hover:text-brand-gold">Learn more</a>
                    </p>
                </div>
                <div className="flex items-center gap-4">
                    <button
                        onClick={handleAccept}
                        className="bg-brand-maroon hover:bg-red-800 text-white px-6 py-2 rounded-lg text-sm font-bold transition"
                    >
                        Accept
                    </button>
                    <button onClick={() => setIsVisible(false)} className="text-gray-400 hover:text-white">
                        <X size={20} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CookieConsent;
