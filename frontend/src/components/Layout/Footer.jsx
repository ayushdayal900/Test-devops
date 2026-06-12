import React from 'react';
import { Facebook, Instagram, Phone, MapPin, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const Footer = () => {
    const { t } = useTranslation();
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-brand-charcoal text-brand-ivory pt-16 pb-8">
            <div className="container mx-auto px-4">
                <div className="grid md:grid-cols-4 gap-8 mb-12">
                    {/* Brand & Description */}
                    <div className="space-y-4 flex flex-col items-center text-center md:items-start md:text-left lg:items-center lg:text-center">
                        <img src="/logo.png" alt="Mahalaxmi Tailors" className="h-20 w-auto mx-auto" />
                        <h3 className="text-2xl font-serif text-brand-gold font-bold">{t('brand.name')} {t('brand.suffix')}</h3>
                        <p className="text-sm opacity-80 leading-relaxed max-w-xs">
                            {t('footer.description')}
                        </p>
                        <div className="flex space-x-4 pt-2 justify-center">
                            <a href="#" className="hover:text-brand-gold transition" aria-label="Facebook"><Facebook size={20} /></a>
                            <a href="#" className="hover:text-brand-gold transition" aria-label="Instagram"><Instagram size={20} /></a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div className="space-y-4">
                        <h4 className="text-lg font-serif font-bold text-brand-gold">{t('footer.headers.quickLinks')}</h4>
                        <ul className="space-y-2 text-sm opacity-80">
                            <li><Link to="/" className="hover:text-brand-gold transition">{t('footer.links.home')}</Link></li>
                            <li><Link to="/about" className="hover:text-brand-gold transition">{t('footer.links.about')}</Link></li>
                            <li><Link to="/designs" className="hover:text-brand-gold transition">{t('footer.links.designs')}</Link></li>
                            <li><Link to="/gallery" className="hover:text-brand-gold transition">{t('footer.links.gallery')}</Link></li>
                        </ul>
                    </div>

                    {/* Customer Care */}
                    <div className="space-y-4">
                        <h4 className="text-lg font-serif font-bold text-brand-gold">{t('footer.headers.customerCare')}</h4>
                        <ul className="space-y-2 text-sm opacity-80">
                            <li><Link to="/faq" className="hover:text-brand-gold transition">{t('footer.links.faq')}</Link></li>
                            <li><Link to="/contact" className="hover:text-brand-gold transition">{t('footer.links.contact')}</Link></li>
                            <li><Link to="/login" className="hover:text-brand-gold transition">{t('footer.links.account')}</Link></li>
                            <li><Link to="/admin/dashboard" className="text-xs text-brand-charcoal hover:text-brand-gold">{t('footer.links.admin')}</Link></li>
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div className="space-y-4">
                        <h4 className="text-lg font-serif font-bold text-brand-gold">{t('footer.headers.visitUs')}</h4>
                        <ul className="space-y-3 text-sm opacity-80">
                            <li className="flex items-start gap-3">
                                <MapPin size={18} className="text-brand-gold shrink-0 mt-1" aria-hidden="true" />
                                <span>Kalyani Chawk, Balaji Mandir,<br />Mangrulpir, Maharashtra 444403</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <Phone size={18} className="text-brand-gold shrink-0" aria-hidden="true" />
                                <span>+91 7057164648</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <Mail size={18} className="text-brand-gold shrink-0" aria-hidden="true" />
                                <span>jayashridayal1@gmail.com</span>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-white/10 pt-8 text-center text-xs opacity-60">
                    <p>{t('footer.copyright', { year: currentYear })}</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
