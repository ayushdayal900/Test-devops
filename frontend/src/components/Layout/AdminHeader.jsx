import React, { useState, useContext } from 'react';
import { Menu, X, LayoutDashboard, Package, Scissors, Users, FileText, CreditCard, LogOut, Video } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

const AdminHeader = () => {
    const [isOpen, setIsOpen] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();
    const { logout } = useContext(AuthContext);

    const isActive = (path) => location.pathname.includes(path) ? "text-brand-maroon font-bold" : "text-brand-charcoal hover:text-brand-maroon";

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const navLinks = [
        { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
        { name: 'Orders', path: '/admin/orders', icon: Package },
        { name: 'Products', path: '/admin/products', icon: Scissors },
        { name: 'Customers', path: '/admin/customers', icon: Users },
        { name: 'CMS', path: '/admin/cms', icon: FileText },
        { name: 'Payments', path: '/admin/payments', icon: CreditCard },
        { name: 'Messages', path: '/admin/messages', icon: FileText },
        { name: 'Meetings', path: '/admin/meetings', icon: Video },
    ];

    return (
        <header className="bg-brand-ivory/90 backdrop-blur-md shadow-md sticky top-0 z-50 border-b border-brand-gold/20">
            <div className="container mx-auto px-4 py-4 flex justify-between items-center">

                {/* Brand */}
                <div className="flex items-center gap-3">
                    <Link to="/admin/dashboard" className="text-2xl font-serif font-bold text-brand-maroon tracking-wide flex items-center gap-2">
                        Mahalxmi <span className="text-brand-gold">Admin</span>
                    </Link>
                </div>

                {/* Desktop Nav */}
                <nav className="hidden lg:flex items-center space-x-6 font-medium">
                    {navLinks.map((link) => (
                        <Link
                            key={link.name}
                            to={link.path}
                            className={`flex items-center gap-2 text-sm transition duration-300 ${isActive(link.path)}`}
                        >
                            <link.icon size={18} />
                            {link.name}
                        </Link>
                    ))}
                </nav>

                {/* Actions */}
                <div className="hidden lg:flex items-center gap-4">
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-red-500 transition"
                        title="Logout"
                    >
                        <LogOut size={18} />
                        Logout
                    </button>
                </div>

                {/* Mobile Menu Toggle */}
                <button className="lg:hidden text-brand-maroon" onClick={() => setIsOpen(!isOpen)}>
                    {isOpen ? <X size={28} /> : <Menu size={28} />}
                </button>
            </div>

            {/* Mobile Nav */}
            {isOpen && (
                <div className="lg:hidden bg-brand-ivory border-t border-gray-100 py-4 absolute w-full shadow-xl">
                    <div className="flex flex-col px-4 text-center space-y-4">
                        {navLinks.map((link) => (
                            <Link
                                key={link.name}
                                to={link.path}
                                className={`flex items-center justify-center gap-3 text-base ${isActive(link.path)}`}
                                onClick={() => setIsOpen(false)}
                            >
                                <link.icon size={20} />
                                {link.name}
                            </Link>
                        ))}
                        <div className="pt-2">
                            <button
                                onClick={() => { setIsOpen(false); handleLogout(); }}
                                className="flex items-center justify-center gap-3 text-red-500 w-full font-medium"
                            >
                                <LogOut size={20} />
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </header>
    );
};

export default AdminHeader;
