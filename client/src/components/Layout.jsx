import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, Ticket, Package, LogOut, Ship } from 'lucide-react';
import clsx from 'clsx';

const Layout = () => {
    const { user, logout } = useAuth();
    const location = useLocation();

    const navItems = [
        { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
        { to: '/tickets', icon: Ship, label: 'ขายตั๋วเรือ' },
        { to: '/tickets/list', icon: Ticket, label: 'รายการตั๋ว' },
        { to: '/parcels', icon: Package, label: 'รับฝากพัสดุ' },
        { to: '/parcels/list', icon: Package, label: 'รายการพัสดุ' },
    ];

    return (
        <div className="flex h-screen bg-slate-100 overflow-hidden">
            {/* Sidebar */}
            <aside className="w-64 bg-slate-900 text-white shadow-2xl flex flex-col">
                <div className="p-6 flex items-center gap-3">
                    <Ship className="w-8 h-8 text-blue-400" />
                    <h1 className="text-xl font-bold tracking-wider">ช.แม่ตาปี</h1>
                </div>

                <div className="px-6 py-4">
                    <div className="text-xs text-slate-400 uppercase tracking-widest mb-2">Menu</div>
                    <nav className="space-y-2">
                        {navItems.map((item) => (
                            <Link
                                key={item.to}
                                to={item.to}
                                className={clsx(
                                    "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group",
                                    location.pathname === item.to
                                        ? "bg-blue-600 text-white shadow-lg shadow-blue-900/20"
                                        : "text-slate-400 hover:bg-slate-800 hover:text-white"
                                )}
                            >
                                <item.icon size={20} className={clsx("transition-transform group-hover:scale-110", location.pathname === item.to ? "text-white" : "text-slate-400 group-hover:text-white")} />
                                <span className="font-medium">{item.label}</span>
                            </Link>
                        ))}
                    </nav>
                </div>

                <div className="mt-auto p-6 border-t border-slate-800">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center font-bold text-lg">
                            {user?.name?.[0] || 'U'}
                        </div>
                        <div>
                            <div className="font-medium">{user?.name}</div>
                            <div className="text-xs text-slate-400 capitalize">{user?.role?.toLowerCase()}</div>
                        </div>
                    </div>
                    <button
                        onClick={logout}
                        className="w-full flex items-center justify-center gap-2 bg-slate-800 hover:bg-red-500/10 hover:text-red-400 text-slate-400 py-2 rounded-lg transition-colors border border-slate-700 hover:border-red-500/50"
                    >
                        <LogOut size={18} />
                        Sign Out
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-auto relative">
                <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-slate-200 px-8 py-4 flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-slate-800">
                        {navItems.find(i => i.to === location.pathname)?.label || 'Dashboard'}
                    </h2>
                    <div className="text-sm text-slate-500">
                        {new Date().toLocaleDateString('th-TH', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </div>
                </header>

                <div className="p-8 pb-20">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default Layout;
