import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { Ticket, Calendar, User, Phone, Anchor } from 'lucide-react';
import clsx from 'clsx';
import { format } from 'date-fns';

const TicketSales = () => {
    const [layoutType, setLayoutType] = useState('LAYOUT_50'); // 'LAYOUT_50', 'LAYOUT_30'
    const [route, setRoute] = useState('SURAT_TO_KOHTAO');
    const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
    const [selectedSeat, setSelectedSeat] = useState(null);
    const [bookedSeats, setBookedSeats] = useState([]);

    const [formData, setFormData] = useState({
        passengerName: '',
        phone: '',
        price: 700, // Default price?
    });

    // Calculate layout Grid
    const seats50 = Array.from({ length: 50 }, (_, i) => `A${i + 1}`);
    const seats30 = Array.from({ length: 30 }, (_, i) => `B${i + 1}`);
    const currentSeats = layoutType === 'LAYOUT_50' ? seats50 : seats30;

    useEffect(() => {
        fetchBookedSeats();
    }, [date, route, layoutType]);

    const fetchBookedSeats = async () => {
        try {
            const res = await api.get(`/api/tickets?date=${date}`);
            if (Array.isArray(res.data)) {
                const taken = res.data
                    .filter(t => t.route === route && t.seatLayout === layoutType)
                    .map(t => t.seatNumber);
                setBookedSeats(taken);
            } else {
                console.error("Invalid data format for tickets", res.data);
                setBookedSeats([]);
            }
        } catch (error) {
            console.error("Error fetching tickets:", error);
            setBookedSeats([]);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedSeat) return alert('กรุณาเลือกที่นั่ง');

        try {
            await api.post('/api/tickets', {
                ...formData,
                seatNumber: selectedSeat,
                seatLayout: layoutType,
                route,
                travelDate: date,
                price: Number(formData.price) // Should be dynamic?
            });
            alert('ขายตั๋วสำเร็จ!');
            setSelectedSeat(null);
            setFormData(prev => ({ ...prev, passengerName: '', phone: '' }));
            fetchBookedSeats();
        } catch (error) {
            alert(error.response?.data?.message || 'Error selling ticket');
        }
    };

    return (
        <div className="flex flex-col lg:flex-row gap-4 lg:gap-8 h-full">
            {/* Left: Seat Map */}
            <div className="flex-1 card overflow-y-auto">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 lg:mb-6 gap-3">
                    <h3 className="text-base lg:text-lg font-bold flex items-center gap-2">
                        <Anchor className="text-blue-500" size={20} />
                        เลือกเตียง ({layoutType === 'LAYOUT_50' ? '50 ที่นั่ง' : '30 ที่นั่ง'})
                    </h3>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setLayoutType('LAYOUT_50')}
                            className={clsx("px-3 py-1.5 rounded text-xs lg:text-sm font-medium transition-colors", layoutType === 'LAYOUT_50' ? "bg-blue-600 text-white" : "bg-slate-200 hover:bg-slate-300")}
                        >เตียงเดียว</button>
                        <button
                            onClick={() => setLayoutType('LAYOUT_30')}
                            className={clsx("px-3 py-1.5 rounded text-xs lg:text-sm font-medium transition-colors", layoutType === 'LAYOUT_30' ? "bg-blue-600 text-white" : "bg-slate-200 hover:bg-slate-300")}
                        >เตียงคู่</button>
                    </div>
                </div>

                {/* Legend */}
                <div className="flex flex-wrap gap-3 lg:gap-4 mb-6 lg:mb-8 text-xs lg:text-sm justify-center">
                    <div className="flex items-center gap-2"><div className="w-4 h-4 rounded bg-slate-200 border border-slate-300"></div> ว่าง</div>
                    <div className="flex items-center gap-2"><div className="w-4 h-4 rounded bg-blue-500 border border-blue-600"></div> เลือก</div>
                    <div className="flex items-center gap-2"><div className="w-4 h-4 rounded bg-red-200 border border-red-300 opacity-50"></div> ขายแล้ว</div>
                </div>

                {/* Grid - Responsive columns */}
                <div className="grid grid-cols-4 sm:grid-cols-5 lg:grid-cols-5 gap-2 lg:gap-3 max-w-lg mx-auto p-3 lg:p-4 bg-slate-50 rounded-xl border border-slate-200">
                    {currentSeats.map(seat => {
                        const isBooked = bookedSeats.includes(seat);
                        const isSelected = selectedSeat === seat;
                        return (
                            <button
                                key={seat}
                                disabled={isBooked}
                                onClick={() => setSelectedSeat(seat)}
                                className={clsx(
                                    "h-10 lg:h-12 rounded-lg font-medium text-xs lg:text-sm transition-all relative group",
                                    isBooked
                                        ? "bg-red-100 text-red-400 cursor-not-allowed border border-red-200"
                                        : isSelected
                                            ? "bg-blue-500 text-white shadow-lg shadow-blue-500/30 scale-105 border border-blue-600"
                                            : "bg-white text-slate-600 border border-slate-200 hover:border-blue-400 hover:bg-blue-50"
                                )}
                            >
                                {seat}
                                {!isBooked && !isSelected && <div className="absolute inset-0 bg-blue-400/0 group-hover:bg-blue-400/5 rounded-lg transition-colors" />}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Right: Booking Form */}
            <div className="w-full lg:w-96">
                <div className="card h-auto lg:sticky lg:top-4">
                    <h3 className="font-bold text-base lg:text-lg mb-4 border-b pb-3 lg:pb-4">รายละเอียดตั๋ว</h3>
                    <form onSubmit={handleSubmit} className="space-y-3 lg:space-y-4">

                        <div className="space-y-1">
                            <label className="text-xs lg:text-sm font-medium text-slate-600">วันที่เดินทาง</label>
                            <div className="relative">
                                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input
                                    type="date"
                                    className="input-field pl-10 text-sm lg:text-base"
                                    value={date}
                                    onChange={(e) => setDate(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs lg:text-sm font-medium text-slate-600">เส้นทาง</label>
                            <select
                                className="input-field text-sm lg:text-base"
                                value={route}
                                onChange={(e) => setRoute(e.target.value)}
                            >
                                <option value="SURAT_TO_KOHTAO">สุราษฎร์ธานี &rarr; เกาะเต่า</option>
                                <option value="KOHTAO_TO_SURAT">เกาะเต่า &rarr; สุราษฎร์ธานี</option>
                            </select>
                        </div>

                        <div className="p-3 lg:p-4 bg-blue-50/50 rounded-lg border border-blue-100">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-xs lg:text-sm text-slate-500">ที่นั่งที่เลือก</span>
                                <span className="text-lg lg:text-xl font-bold text-blue-600">{selectedSeat || '-'}</span>
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs lg:text-sm font-medium text-slate-600">ชื่อผู้โดยสาร</label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input
                                    type="text"
                                    className="input-field pl-10 text-sm lg:text-base"
                                    placeholder="ระบุชื่อ-นามสกุล"
                                    value={formData.passengerName}
                                    onChange={e => setFormData({ ...formData, passengerName: e.target.value })}
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs lg:text-sm font-medium text-slate-600">เบอร์โทรศัพท์</label>
                            <div className="relative">
                                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input
                                    type="tel"
                                    className="input-field pl-10 text-sm lg:text-base"
                                    placeholder="08x-xxx-xxxx"
                                    value={formData.phone}
                                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs lg:text-sm font-medium text-slate-600">ราคาตั๋ว (บาท)</label>
                            <input
                                type="number"
                                className="input-field font-bold text-right text-sm lg:text-base"
                                value={formData.price}
                                onChange={e => setFormData({ ...formData, price: e.target.value })}
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            className="w-full btn-primary py-2.5 lg:py-3 mt-4 flex items-center justify-center gap-2 text-sm lg:text-base"
                            disabled={!selectedSeat}
                        >
                            <Ticket size={20} />
                            ยืนยันการขาย
                        </button>

                    </form>
                </div>
            </div>
        </div>
    );
};

export default TicketSales;
