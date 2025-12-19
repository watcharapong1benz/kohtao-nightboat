import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { format } from 'date-fns';
import { CheckCircle, XCircle, Users, Ticket, Calendar, Ship } from 'lucide-react';
import clsx from 'clsx';

const CheckInStatus = () => {
    const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(false);
    const [stats, setStats] = useState({
        total: 0,
        checkedIn: 0,
        notCheckedIn: 0,
        percentage: 0
    });

    useEffect(() => {
        fetchTickets();
    }, [selectedDate]);

    const fetchTickets = async () => {
        setLoading(true);
        try {
            const res = await api.get('/api/tickets', {
                params: { date: selectedDate }
            });
            const ticketsData = res.data;
            setTickets(ticketsData);

            // Calculate statistics
            const total = ticketsData.length;
            const checkedIn = ticketsData.filter(t => t.checkedIn).length;
            const notCheckedIn = total - checkedIn;
            const percentage = total > 0 ? Math.round((checkedIn / total) * 100) : 0;

            setStats({ total, checkedIn, notCheckedIn, percentage });
        } catch (error) {
            console.error('Error fetching tickets:', error);
        } finally {
            setLoading(false);
        }
    };

    // Group tickets by route and layout
    const groupedTickets = tickets.reduce((acc, ticket) => {
        const key = `${ticket.route}-${ticket.seatLayout}`;
        if (!acc[key]) {
            acc[key] = {
                route: ticket.route,
                seatLayout: ticket.seatLayout,
                tickets: []
            };
        }
        acc[key].tickets.push(ticket);
        return acc;
    }, {});

    const getRouteText = (route) => {
        return route === 'SURAT_TO_KOHTAO'
            ? 'สุราษฎร์ธานี → เกาะเต่า'
            : 'เกาะเต่า → สุราษฎร์ธานี';
    };

    const getLayoutText = (layout) => {
        return layout === 'LAYOUT_50' ? 'เรือ 50 ที่นั่ง' : 'เรือ 30 ที่นั่ง';
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h2 className="text-xl font-bold flex items-center gap-2">
                    <Users className="text-blue-500" size={24} />
                    สถานะการ Check-in
                </h2>
                <div className="flex items-center gap-2">
                    <Calendar size={18} className="text-slate-500" />
                    <input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="input-field text-sm"
                    />
                </div>
            </div>

            {loading ? (
                <div className="text-center py-12">
                    <div className="text-slate-400">กำลังโหลดข้อมูล...</div>
                </div>
            ) : (
                <>
                    {/* Statistics Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {/* Total Tickets */}
                        <div className="card p-6 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-blue-600 font-medium">ตั๋วทั้งหมด</p>
                                    <p className="text-3xl font-bold text-blue-700 mt-1">{stats.total}</p>
                                </div>
                                <Ticket className="text-blue-400" size={40} />
                            </div>
                        </div>

                        {/* Checked In */}
                        <div className="card p-6 bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-green-600 font-medium">Check-in แล้ว</p>
                                    <p className="text-3xl font-bold text-green-700 mt-1">{stats.checkedIn}</p>
                                </div>
                                <CheckCircle className="text-green-400" size={40} />
                            </div>
                        </div>

                        {/* Not Checked In */}
                        <div className="card p-6 bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-orange-600 font-medium">ยังไม่ Check-in</p>
                                    <p className="text-3xl font-bold text-orange-700 mt-1">{stats.notCheckedIn}</p>
                                </div>
                                <XCircle className="text-orange-400" size={40} />
                            </div>
                        </div>

                        {/* Percentage */}
                        <div className="card p-6 bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-purple-600 font-medium">อัตรา Check-in</p>
                                    <p className="text-3xl font-bold text-purple-700 mt-1">{stats.percentage}%</p>
                                </div>
                                <Users className="text-purple-400" size={40} />
                            </div>
                        </div>
                    </div>

                    {/* Progress Bar */}
                    {stats.total > 0 && (
                        <div className="card p-6">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-sm font-medium text-slate-700">ความคืบหน้า Check-in</span>
                                <span className="text-sm font-bold text-blue-600">{stats.checkedIn} / {stats.total}</span>
                            </div>
                            <div className="w-full bg-slate-200 rounded-full h-4 overflow-hidden">
                                <div
                                    className="bg-gradient-to-r from-green-500 to-green-600 h-4 rounded-full transition-all duration-500"
                                    style={{ width: `${stats.percentage}%` }}
                                ></div>
                            </div>
                        </div>
                    )}

                    {/* Tickets by Route and Layout */}
                    {Object.keys(groupedTickets).length === 0 ? (
                        <div className="card p-12 text-center">
                            <Ship className="mx-auto text-slate-300 mb-4" size={64} />
                            <p className="text-slate-500">ไม่มีรายการตั๋วในวันที่เลือก</p>
                        </div>
                    ) : (
                        Object.entries(groupedTickets).map(([key, group]) => {
                            const checkedInSeats = group.tickets.filter(t => t.checkedIn).map(t => t.seatNumber).sort((a, b) => a - b);
                            const notCheckedInSeats = group.tickets.filter(t => !t.checkedIn).map(t => t.seatNumber).sort((a, b) => a - b);

                            return (
                                <div key={key} className="card p-6">
                                    <div className="flex items-center gap-3 mb-4 pb-4 border-b">
                                        <Ship className="text-blue-500" size={24} />
                                        <div>
                                            <h3 className="font-bold text-lg">{getRouteText(group.route)}</h3>
                                            <p className="text-sm text-slate-500">{getLayoutText(group.seatLayout)}</p>
                                        </div>
                                        <div className="ml-auto text-right">
                                            <p className="text-sm text-slate-500">Check-in</p>
                                            <p className="text-lg font-bold text-blue-600">
                                                {checkedInSeats.length} / {group.tickets.length}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                        {/* Checked In Seats */}
                                        <div>
                                            <div className="flex items-center gap-2 mb-3">
                                                <CheckCircle className="text-green-500" size={18} />
                                                <h4 className="font-medium text-green-700">Check-in แล้ว ({checkedInSeats.length})</h4>
                                            </div>
                                            {checkedInSeats.length > 0 ? (
                                                <div className="flex flex-wrap gap-2">
                                                    {checkedInSeats.map(seat => (
                                                        <div
                                                            key={seat}
                                                            className="px-3 py-2 bg-green-100 text-green-700 rounded-lg font-medium text-sm border border-green-300"
                                                        >
                                                            {seat}
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <p className="text-sm text-slate-400 italic">ยังไม่มีการ check-in</p>
                                            )}
                                        </div>

                                        {/* Not Checked In Seats */}
                                        <div>
                                            <div className="flex items-center gap-2 mb-3">
                                                <XCircle className="text-orange-500" size={18} />
                                                <h4 className="font-medium text-orange-700">ยังไม่ Check-in ({notCheckedInSeats.length})</h4>
                                            </div>
                                            {notCheckedInSeats.length > 0 ? (
                                                <div className="flex flex-wrap gap-2">
                                                    {notCheckedInSeats.map(seat => (
                                                        <div
                                                            key={seat}
                                                            className="px-3 py-2 bg-orange-100 text-orange-700 rounded-lg font-medium text-sm border border-orange-300"
                                                        >
                                                            {seat}
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <p className="text-sm text-green-600 italic font-medium">✓ Check-in ครบทุกที่นั่งแล้ว!</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </>
            )}
        </div>
    );
};

export default CheckInStatus;
