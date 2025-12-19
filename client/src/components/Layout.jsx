import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, Ticket, Package, LogOut, Ship, Wrench, Users, Menu, X, QrCode } from 'lucide-react';
import clsx from 'clsx';

const Layout = () => {
    const { user, logout } = useAuth();
    const location = useLocation();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const navItems = [
        { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
        { to: '/tickets', icon: Ship, label: 'ขายตั๋วเรือ' },
        { to: '/tickets/list', icon: Ticket, label: 'รายการตั๋ว' },
        { to: '/parcels', icon: Package, label: 'รับฝากพัสดุ' },
        { to: '/parcels/list', icon: Package, label: 'รายการพัสดุ' },
        { to: '/qr-scanner', icon: QrCode, label: 'แสกน QR Code' },
        { to: '/maintenance', icon: Wrench, label: 'แจ้งซ่อม/Maintenance' },
    ];

    if (user?.role === 'ADMIN') {
        navItems.push({ to: '/admin/staff', icon: Users, label: 'จัดการพนักงาน' });
    }

    const filteredNavItems = user?.role === 'AGENT'
        ? navItems.filter(item => ['/tickets', '/tickets/list'].includes(item.to))
        : navItems;

    const closeMobileMenu = () => setMobileMenuOpen(false);

    return (
        <div className="flex h-screen bg-slate-100 overflow-hidden">
            {/* Mobile Overlay */}
            {mobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={closeMobileMenu}
                />
            )}

            {/* Sidebar */}
            <aside className={clsx(
                "fixed lg:static inset-y-0 left-0 z-50 w-64 bg-slate-900 text-white shadow-2xl flex flex-col transition-transform duration-300 ease-in-out",
                mobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
            )}>
                <div className="p-4 lg:p-6 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <Ship className="w-6 h-6 lg:w-8 lg:h-8 text-blue-400" />
                        <h1 className="text-lg lg:text-xl font-bold tracking-wider">ช.แม่ตาปี</h1>
                    </div>
                    {/* Close button for mobile */}
                    <button
                        onClick={closeMobileMenu}
                        className="lg:hidden text-slate-400 hover:text-white"
                    >
                        <X size={24} />
                    </button>
                </div>

                <div className="px-4 lg:px-6 py-4">
                    <div className="text-xs text-slate-400 uppercase tracking-widest mb-2">Menu</div>
                    <nav className="space-y-2">
                        {filteredNavItems.map((item) => (
                            <Link
                                key={item.to}
                                to={item.to}
                                onClick={closeMobileMenu}
                                className={clsx(
                                    "flex items-center gap-3 px-3 lg:px-4 py-2.5 lg:py-3 rounded-xl transition-all duration-200 group",
                                    location.pathname === item.to
                                        ? "bg-blue-600 text-white shadow-lg shadow-blue-900/20"
                                        : "text-slate-400 hover:bg-slate-800 hover:text-white"
                                )}
                            >
                                <item.icon size={20} className={clsx("transition-transform group-hover:scale-110", location.pathname === item.to ? "text-white" : "text-slate-400 group-hover:text-white")} />
                                <span className="font-medium text-sm lg:text-base">{item.label}</span>
                            </Link>
                        ))}
                    </nav>
                </div>

                <div className="mt-auto p-4 lg:p-6 border-t border-slate-800">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-full bg-blue-500 flex items-center justify-center font-bold text-sm lg:text-lg">
                            {user?.name?.[0] || 'U'}
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="font-medium text-sm lg:text-base truncate">{user?.name}</div>
                            <div className="text-xs text-slate-400 capitalize">{user?.role?.toLowerCase()}</div>
                        </div>
                    </div>
                    <button
                        onClick={logout}
                        className="w-full flex items-center justify-center gap-2 bg-slate-800 hover:bg-red-500/10 hover:text-red-400 text-slate-400 py-2 rounded-lg transition-colors border border-slate-700 hover:border-red-500/50 text-sm lg:text-base"
                    >
                        <LogOut size={18} />
                        Sign Out
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-auto relative w-full">
                <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-slate-200 px-4 lg:px-8 py-3 lg:py-4 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        {/* Mobile menu button */}
                        <button
                            onClick={() => setMobileMenuOpen(true)}
                            className="lg:hidden text-slate-600 hover:text-slate-900"
                        >
                            <Menu size={24} />
                        </button>
                        <h2 className="text-lg lg:text-2xl font-bold text-slate-800 truncate">
                            {navItems.find(i => i.to === location.pathname)?.label || 'Dashboard'}
                        </h2>
                    </div>
                    <div className="text-xs lg:text-sm text-slate-500 hidden sm:block">
                        {new Date().toLocaleDateString('th-TH', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </div>
                </header>

                <div className="p-4 lg:p-8 pb-20">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default Layout;
