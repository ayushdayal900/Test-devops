import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { LayoutDashboard, ShoppingBag, Users, Settings, LogOut } from 'lucide-react';

const AdminLayout = () => {
    return (
        <div className="flex min-h-screen bg-gray-100 font-sans">
            {/* Sidebar */}
            <aside className="w-64 bg-brand-charcoal text-white hidden md:flex flex-col">
                <div className="p-6 border-b border-gray-700">
                    <h2 className="text-xl font-serif text-brand-gold font-bold">Admin Panel</h2>
                </div>

                <nav className="flex-1 p-4 space-y-2">
                    <Link to="/admin/dashboard" className="flex items-center gap-3 px-4 py-3 bg-white/5 rounded-lg text-brand-ivory hover:bg-brand-maroon transition">
                        <LayoutDashboard size={20} />
                        <span>Dashboard</span>
                    </Link>
                    <Link to="/admin/orders" className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition">
                        <ShoppingBag size={20} />
                        <span>Orders</span>
                    </Link>
                    <Link to="/admin/customers" className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition">
                        <Users size={20} />
                        <span>Customers</span>
                    </Link>
                    <Link to="/admin/meetings" className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition">
                        <Calendar size={20} />
                        <span>Meetings</span>
                    </Link>
                    <Link to="/admin/settings" className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition">
                        <Settings size={20} />
                        <span>Settings</span>
                    </Link>
                </nav>

                <div className="p-4 border-t border-gray-700">
                    <button className="flex items-center gap-3 px-4 py-2 text-red-400 hover:text-red-300 transition w-full">
                        <LogOut size={20} />
                        <span>Logout</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col">
                <header className="bg-white shadow-sm p-4 flex justify-between items-center md:hidden">
                    <span className="font-bold text-brand-maroon">Admin Panel</span>
                    {/* Mobile menu toggle would go here */}
                </header>
                <main className="flex-1 overflow-auto">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;
