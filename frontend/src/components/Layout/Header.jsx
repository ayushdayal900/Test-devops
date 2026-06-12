import React, { useState, useContext, useEffect } from 'react';
import { Menu, X, ShoppingBag, User, LogOut, Heart } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import LanguageToggle from '../LanguageToggle';
import { AuthContext } from '../../context/AuthContext';
import { CartContext } from '../../context/CartContext';
import { WishlistContext } from '../../context/WishlistContext';

const Header = () => {
    const [isOpen, setIsOpen] = useState(false);
    const location = useLocation();
    const { t } = useTranslation();
    const { user, logout } = useContext(AuthContext);
    const { cartItems } = useContext(CartContext);
    const { wishlistCount } = useContext(WishlistContext);

    useEffect(() => {
        console.log('Restored Header Loaded: Standard Layout');
    }, []);

    const isActive = (path) => location.pathname === path ? "text-brand-maroon font-bold" : "";

    return (
        <header className="bg-brand-ivory/90 backdrop-blur-md shadow-md sticky top-0 z-50 border-b border-brand-gold/20">
            <div className="container mx-auto px-4 py-4 flex justify-between items-center">
                {/* Logo */}
                <Link to="/" className="flex items-center gap-2">
                    <img src="/logo.png" alt="Mahalaxmi Tailors" className="h-12 w-auto object-contain" />
                    {/* {t('brand.name')} <span className="text-brand-gold">{t('brand.suffix')}</span> */}
                </Link>

                {/* Desktop Nav */}
                <nav className="hidden md:flex space-x-8 font-medium text-brand-charcoal">
                    <Link to="/" className={`hover:text-brand-maroon transition duration-300 ${isActive('/')}`}>{t('nav.home')}</Link>
                    <Link to="/designs" className={`hover:text-brand-maroon transition duration-300 ${isActive('/designs')}`}>{t('nav.designs')}</Link>
                    <Link to="/gallery" className={`hover:text-brand-maroon transition duration-300 ${isActive('/gallery')}`}>{t('nav.gallery')}</Link>
                    <Link to="/about" className={`hover:text-brand-maroon transition duration-300 ${isActive('/about')}`}>{t('nav.about')}</Link>
                    <Link to="/faq" className={`hover:text-brand-maroon transition duration-300 ${isActive('/faq')}`}>{t('nav.faq')}</Link>
                    <Link to="/contact" className={`hover:text-brand-maroon transition duration-300 ${isActive('/contact')}`}>{t('nav.contact')}</Link>
                    {user && (
                        <>
                            <Link to="/wishlist" className={`relative hover:text-brand-maroon transition duration-300 ${isActive('/wishlist')}`} title="My Wishlist">
                                <Heart size={20} />
                                {wishlistCount > 0 && (
                                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[16px] text-center">
                                        {wishlistCount}
                                    </span>
                                )}
                            </Link>
                            <Link to="/cart" className={`relative hover:text-brand-maroon transition duration-300 ${isActive('/cart')}`} title="Cart">
                                <ShoppingBag size={20} />
                                {cartItems.length > 0 && (
                                    <span className="absolute -top-2 -right-2 bg-brand-maroon text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[16px] text-center">
                                        {cartItems.length}
                                    </span>
                                )}
                            </Link>
                        </>
                    )}
                </nav>

                {/* User Actions */}
                <div className="hidden md:flex items-center space-x-4">
                    {user ? (
                        <div className="flex items-center gap-4">
                            <Link to="/customer/dashboard" className="flex items-center gap-2 text-sm font-medium text-brand-maroon hover:text-brand-gold transition">
                                <User size={20} />
                                <span className="hidden lg:inline">{user.firstName}</span>
                            </Link>
                            <button onClick={logout} className="text-gray-500 hover:text-red-500 transition" title="Logout">
                                <LogOut size={20} />
                            </button>
                        </div>
                    ) : (
                        <Link to="/login" className="text-sm font-medium text-brand-teal hover:text-brand-maroon transition">
                            {t('nav.login')}
                        </Link>
                    )}
                    <LanguageToggle />
                </div>

                {/* Mobile Menu Button */}
                <button className="md:hidden text-brand-maroon" onClick={() => setIsOpen(!isOpen)} aria-label="Toggle Menu">
                    {isOpen ? <X size={28} /> : <Menu size={28} />}
                </button>
            </div>

            {/* Mobile Nav */}
            {isOpen && (
                <div className="md:hidden bg-brand-ivory border-t border-gray-100 py-4 absolute w-full shadow-xl">
                    <div className="flex flex-col space-y-4 px-4 text-center">
                        <Link to="/" className="text-brand-charcoal hover:text-brand-maroon" onClick={() => setIsOpen(false)}>{t('nav.home')}</Link>
                        <Link to="/designs" className="text-brand-charcoal hover:text-brand-maroon" onClick={() => setIsOpen(false)}>{t('nav.designs')}</Link>
                        <Link to="/gallery" className="text-brand-charcoal hover:text-brand-maroon" onClick={() => setIsOpen(false)}>{t('nav.gallery')}</Link>
                        <Link to="/about" className="text-brand-charcoal hover:text-brand-maroon" onClick={() => setIsOpen(false)}>{t('nav.about')}</Link>
                        <Link to="/contact" className="text-brand-charcoal hover:text-brand-maroon" onClick={() => setIsOpen(false)}>{t('nav.contact')}</Link>
                        {user && (
                            <>
                                <Link to="/wishlist" className="text-brand-charcoal hover:text-brand-maroon flex items-center justify-center gap-2" onClick={() => setIsOpen(false)}>
                                    <Heart size={18} /> Wishlist
                                </Link>
                                <Link to="/cart" className="text-brand-charcoal hover:text-brand-maroon flex items-center justify-center gap-2" onClick={() => setIsOpen(false)}>
                                    <ShoppingBag size={18} /> Cart
                                </Link>
                            </>
                        )}
                        {user ? (
                            <>
                                <Link to="/customer/dashboard" className="text-brand-maroon font-medium flex items-center justify-center gap-2" onClick={() => setIsOpen(false)}>
                                    <User size={18} /> My Account
                                </Link>
                                <button onClick={() => { logout(); setIsOpen(false); }} className="text-red-500 font-medium flex items-center justify-center gap-2 w-full">
                                    <LogOut size={18} /> Logout
                                </button>
                            </>
                        ) : (
                            <Link to="/login" className="text-brand-teal font-medium" onClick={() => setIsOpen(false)}>{t('nav.login')}</Link>
                        )}
                        <div className="flex justify-center mt-2">
                            <LanguageToggle />
                        </div>
                    </div>
                </div>
            )}
        </header>
    );
};

export default Header;
