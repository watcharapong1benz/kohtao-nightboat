import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { format } from 'date-fns';
import { Ship, Package, DollarSign, Clock } from 'lucide-react';

const Dashboard = () => {
    const [stats, setStats] = useState({
        ticketsSoldToday: 0,
        parcelsdepositedToday: 0,
        totalRevenue: 0,
        parcelsWaiting: 0,
        recentTickets: [],
        recentParcels: []
    });

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await api.get('/api/dashboard');
                setStats(res.data);
            } catch (error) {
                console.error(error);
            }
        };
        fetchStats();
        // Poll every 30s
        const interval = setInterval(fetchStats, 30000);
        return () => clearInterval(interval);
    }, []);

    const StatCard = ({ title, value, icon: Icon, color }) => (
        <div className="card flex items-center gap-4 hover:scale-105 transition-transform duration-300">
            <div className={`p-4 rounded-full ${color} bg-opacity-10 text-${color.split('-')[1]}-600`}>
                {/* Tailwind dynamic colors can be tricky, using concrete classes */}
                <Icon size={32} className={color.replace('bg-', 'text-').replace('-500', '-600')} />
                {/* Note: The above is hacky for dynamic classes. Better to pass exact class strings. */}
            </div>
            <div>
                <div className="text-slate-500 text-sm font-medium">{title}</div>
                <div className="text-3xl font-bold text-slate-800">{value.toLocaleString()}</div>
            </div>
        </div>
    );

    return (
        <div className="space-y-6 lg:space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
                <div className="card flex items-center gap-4">
                    <div className="p-3 lg:p-4 rounded-full bg-blue-100 text-blue-600">
                        <Ship size={28} className="lg:w-8 lg:h-8" />
                    </div>
                    <div>
                        <div className="text-slate-500 text-xs lg:text-sm font-medium">ตั๋วเรือที่ขายวันนี้</div>
                        <div className="text-2xl lg:text-3xl font-bold text-slate-800">{stats.ticketsSoldToday}</div>
                    </div>
                </div>

                <div className="card flex items-center gap-4">
                    <div className="p-3 lg:p-4 rounded-full bg-purple-100 text-purple-600">
                        <Package size={28} className="lg:w-8 lg:h-8" />
                    </div>
                    <div>
                        <div className="text-slate-500 text-xs lg:text-sm font-medium">พัสดุรับฝากวันนี้</div>
                        <div className="text-2xl lg:text-3xl font-bold text-slate-800">{stats.parcelsdepositedToday}</div>
                    </div>
                </div>

                <div className="card flex items-center gap-4">
                    <div className="p-3 lg:p-4 rounded-full bg-green-100 text-green-600">
                        <DollarSign size={28} className="lg:w-8 lg:h-8" />
                    </div>
                    <div>
                        <div className="text-slate-500 text-xs lg:text-sm font-medium">รายได้วันนี้</div>
                        <div className="text-2xl lg:text-3xl font-bold text-slate-800">{stats.totalRevenue} THB</div>
                    </div>
                </div>

                <div className="card flex items-center gap-4">
                    <div className="p-3 lg:p-4 rounded-full bg-orange-100 text-orange-600">
                        <Clock size={28} className="lg:w-8 lg:h-8" />
                    </div>
                    <div>
                        <div className="text-slate-500 text-xs lg:text-sm font-medium">พัสดุรอส่ง</div>
                        <div className="text-2xl lg:text-3xl font-bold text-slate-800">{stats.parcelsWaiting}</div>
                    </div>
                </div>
            </div>

            {/* Charts or other visuals could go here */}
            {/* Recent Transactions */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
                {/* Recent Tickets */}
                <div className="card">
                    <h3 className="font-bold text-base lg:text-lg mb-4 flex items-center gap-2">
                        <Ship size={20} className="text-blue-600" />
                        ตั๋วที่ขายล่าสุดวันนี้
                    </h3>
                    <div className="overflow-x-auto -mx-4 sm:mx-0">
                        <div className="inline-block min-w-full align-middle">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-slate-50 text-slate-500 uppercase text-xs">
                                    <tr>
                                        <th className="p-2 lg:p-3">เวลา</th>
                                        <th className="p-2 lg:p-3">เส้นทาง</th>
                                        <th className="p-2 lg:p-3 text-right">ราคา</th>
                                        <th className="p-2 lg:p-3 hidden sm:table-cell">ผู้ขาย</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {stats.recentTickets?.length === 0 ? (
                                        <tr><td colSpan="4" className="p-4 text-center text-slate-400 text-xs lg:text-sm">ยังไม่มีการขายวันนี้</td></tr>
                                    ) : stats.recentTickets?.map(ticket => (
                                        <tr key={ticket.id} className="hover:bg-slate-50">
                                            <td className="p-2 lg:p-3 font-mono text-slate-600 text-xs lg:text-sm">
                                                {format(new Date(ticket.createdAt), 'HH:mm')}
                                            </td>
                                            <td className="p-2 lg:p-3 text-xs lg:text-sm">
                                                <span className={ticket.route === 'SURAT_TO_KOHTAO' ? 'text-blue-600' : 'text-orange-600'}>
                                                    {ticket.route === 'SURAT_TO_KOHTAO' ? 'สุราษฎร์ ➝ เกาะเต่า' : 'เกาะเต่า ➝ สุราษฎร์'}
                                                </span>
                                            </td>
                                            <td className="p-2 lg:p-3 text-right font-medium text-xs lg:text-sm">{ticket.price}</td>
                                            <td className="p-2 lg:p-3 text-slate-500 hidden sm:table-cell text-xs lg:text-sm">{ticket.seller?.name}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Recent Parcels */}
                <div className="card">
                    <h3 className="font-bold text-base lg:text-lg mb-4 flex items-center gap-2">
                        <Package size={20} className="text-purple-600" />
                        พัสดุรับฝากล่าสุดวันนี้
                    </h3>
                    <div className="overflow-x-auto -mx-4 sm:mx-0">
                        <div className="inline-block min-w-full align-middle">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-slate-50 text-slate-500 uppercase text-xs">
                                    <tr>
                                        <th className="p-2 lg:p-3">เวลา</th>
                                        <th className="p-2 lg:p-3">ผู้ส่ง</th>
                                        <th className="p-2 lg:p-3 text-right">ราคา</th>
                                        <th className="p-2 lg:p-3 text-center">สถานะ</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {stats.recentParcels?.length === 0 ? (
                                        <tr><td colSpan="4" className="p-4 text-center text-slate-400 text-xs lg:text-sm">ยังไม่มีการฝากวันนี้</td></tr>
                                    ) : stats.recentParcels?.map(parcel => (
                                        <tr key={parcel.id} className="hover:bg-slate-50">
                                            <td className="p-2 lg:p-3 font-mono text-slate-600 text-xs lg:text-sm">
                                                {format(new Date(parcel.createdAt), 'HH:mm')}
                                            </td>
                                            <td className="p-2 lg:p-3 font-medium text-xs lg:text-sm">{parcel.senderName}</td>
                                            <td className="p-2 lg:p-3 text-right font-medium text-xs lg:text-sm">{parcel.price}</td>
                                            <td className="p-2 lg:p-3 text-center">
                                                <span className={`px-2 py-0.5 rounded text-xs font-bold ${parcel.paymentStatus === 'PAID' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                                                    {parcel.paymentStatus}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
