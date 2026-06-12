import React from 'react';
import { useTranslation } from 'react-i18next';
import { Languages } from 'lucide-react';

const LanguageToggle = () => {
    const { i18n } = useTranslation();

    const toggleLanguage = () => {
        const newLang = i18n.language === 'en' ? 'mr' : 'en';
        i18n.changeLanguage(newLang);
    };

    return (
        <button
            onClick={toggleLanguage}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-brand-gold/30 text-brand-maroon hover:bg-brand-gold/10 transition-colors text-sm font-medium"
            title="Switch Language"
        >
            <Languages size={16} />
            <span>{i18n.language === 'en' ? 'मराठी' : 'English'}</span>
        </button>
    );
};

export default LanguageToggle;
