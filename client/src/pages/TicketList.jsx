import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { format } from 'date-fns';
import { Search, Trash2, Printer, Edit2 } from 'lucide-react';
import { printTicketReceipt } from '../utils/print';
import clsx from 'clsx';

const TicketList = () => {
    const { user } = useAuth();
    const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
    const [tickets, setTickets] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [editingTicket, setEditingTicket] = useState(null);
    const [message, setMessage] = useState(null);
    const [editForm, setEditForm] = useState({
        passengerName: '',
        phone: '',
        price: 0
    });

    useEffect(() => {
        if (message) {
            const timer = setTimeout(() => setMessage(null), 3000);
            return () => clearTimeout(timer);
        }
    }, [message]);

    useEffect(() => {
        fetchTickets();
    }, [date]);

    const fetchTickets = async () => {
        try {
            const res = await api.get(`/api/tickets?date=${date}`);
            setTickets(res.data);
        } catch (error) {
            console.error(error);
        }
    };

    const handleEditClick = (ticket) => {
        setEditingTicket(ticket);
        setEditForm({
            passengerName: ticket.passengerName,
            phone: ticket.phone,
            price: ticket.price
        });
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.put(`/api/tickets/${editingTicket.id}`, {
                ...editForm,
                price: parseFloat(editForm.price)
            });
            setMessage({ type: 'success', text: 'แก้ไขข้อมูลสำเร็จ' });
            setEditingTicket(null);
            fetchTickets();
        } catch (error) {
            setMessage({ type: 'error', text: 'แก้ไขไม่สำเร็จ: ' + (error.response?.data?.message || error.message) });
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('ยืนยันลบตั๋วเรือ? ข้อมูลจะถูกลบถาวร')) return;

        try {
            await api.delete(`/api/tickets/${id}`);
            setTickets(prev => prev.filter(t => t.id !== id));
            setMessage({ type: 'success', text: 'ลบตั๋วเรียบร้อยแล้ว' });
        } catch (error) {
            console.error('Delete error:', error);
            setMessage({ type: 'error', text: 'ไม่สามารถลบได้: ' + (error.response?.data?.message || error.message) });
            fetchTickets();
        }
    };

    const handlePrint = (ticket) => {
        printTicketReceipt(ticket);
    };

    const filteredTickets = tickets.filter(ticket => {
        if (!searchTerm) return true;
        const searchLower = searchTerm.toLowerCase();
        return (
            (ticket.seller?.name || '').toLowerCase().includes(searchLower) ||
            (ticket.passengerName || '').toLowerCase().includes(searchLower)
        );
    });

    return (
        <div className="space-y-4 lg:space-y-6 relative">
            {/* Feedback Message Toast */}
            {message && (
                <div className={clsx(
                    "fixed bottom-4 right-4 px-4 lg:px-6 py-2 lg:py-3 rounded-lg shadow-lg text-white font-medium z-50 animate-bounce transition-all text-sm lg:text-base",
                    message.type === 'success' ? "bg-green-600" : "bg-red-600"
                )}>
                    {message.text}
                </div>
            )}

            {/* Filters - Responsive */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 lg:gap-4">
                <h2 className="text-lg lg:text-xl font-bold">รายการตั๋วเรือ</h2>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 lg:gap-4 w-full sm:w-auto">
                    <input
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="input-field w-full sm:w-auto text-sm lg:text-base"
                    />
                    <div className="relative w-full sm:w-auto">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="ค้นหาพนง.ขาย/ผู้โดยสาร..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="input-field w-full sm:w-48 lg:w-64 pl-10 text-sm lg:text-base"
                        />
                    </div>
                </div>
            </div>

            {/* Table - Responsive with horizontal scroll */}
            <div className="card overflow-hidden p-0">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[800px]">
                        <thead className="bg-slate-50 text-slate-500 text-xs lg:text-sm uppercase border-b border-slate-200">
                            <tr>
                                <th className="p-2 lg:p-4 font-medium">เวลาขาย</th>
                                <th className="p-2 lg:p-4 font-medium">ผู้โดยสาร</th>
                                <th className="p-2 lg:p-4 font-medium hidden md:table-cell">โทรศัพท์</th>
                                <th className="p-2 lg:p-4 font-medium">เส้นทาง</th>
                                <th className="p-2 lg:p-4 font-medium">ที่นั่ง</th>
                                <th className="p-2 lg:p-4 font-medium text-right">ราคา</th>
                                <th className="p-2 lg:p-4 font-medium">พนักงานขาย</th>
                                <th className="p-2 lg:p-4 font-medium text-center sticky right-0 bg-slate-50">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredTickets.length === 0 ? (
                                <tr><td colSpan="8" className="p-6 lg:p-8 text-center text-slate-400 text-sm">ไม่มีรายการขายในช่วงเวลานี้</td></tr>
                            ) : filteredTickets.map(ticket => (
                                <tr key={ticket.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="p-2 lg:p-4 text-slate-600 text-xs lg:text-sm">
                                        {format(new Date(ticket.createdAt), 'HH:mm')}
                                    </td>
                                    <td className="p-2 lg:p-4 font-medium text-xs lg:text-sm">{ticket.passengerName}</td>
                                    <td className="p-2 lg:p-4 text-slate-600 text-xs lg:text-sm hidden md:table-cell">{ticket.phone}</td>
                                    <td className="p-2 lg:p-4 text-xs lg:text-sm">
                                        <span className={ticket.route === 'SURAT_TO_KOHTAO' ? 'text-blue-600' : 'text-orange-600'}>
                                            {ticket.route === 'SURAT_TO_KOHTAO' ? 'สุราษฎร์ → เกาะเต่า' : 'เกาะเต่า → สุราษฎร์'}
                                        </span>
                                    </td>
                                    <td className="p-2 lg:p-4 font-mono text-slate-700 text-xs lg:text-sm">{ticket.seatNumber}</td>
                                    <td className="p-2 lg:p-4 text-right font-medium text-xs lg:text-sm">{ticket.price}</td>
                                    <td className="p-2 lg:p-4 text-xs lg:text-sm text-slate-500">{ticket.seller?.name || '-'}</td>
                                    <td className="p-2 lg:p-4 sticky right-0 bg-white">
                                        <div className="flex justify-center gap-1 lg:gap-2">
                                            <button onClick={() => handlePrint(ticket)} className="p-1.5 lg:p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors" title="พิมพ์ใบเสร็จ">
                                                <Printer size={16} className="lg:w-4 lg:h-4" />
                                            </button>
                                            <button onClick={() => handleEditClick(ticket)} className="p-1.5 lg:p-2 text-slate-400 hover:text-orange-600 hover:bg-orange-50 rounded transition-colors" title="แก้ไข">
                                                <Edit2 size={16} className="lg:w-4 lg:h-4" />
                                            </button>
                                            {user?.role !== 'STAFF' && (
                                                <button onClick={() => handleDelete(ticket.id)} className="p-1.5 lg:p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors" title="ลบ">
                                                    <Trash2 size={16} className="lg:w-4 lg:h-4" />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Edit Modal - Responsive */}
            {editingTicket && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
                        <div className="px-4 lg:px-6 py-3 lg:py-4 border-b flex justify-between items-center bg-slate-50">
                            <h3 className="font-bold text-base lg:text-lg">แก้ไขข้อมูลตั๋ว</h3>
                            <button onClick={() => setEditingTicket(null)} className="text-slate-400 hover:text-slate-600 text-xl">✕</button>
                        </div>
                        <form onSubmit={handleEditSubmit} className="p-4 lg:p-6 space-y-4">
                            <div>
                                <label className="label text-sm text-slate-600 mb-1 block">ชื่อผู้โดยสาร</label>
                                <input
                                    required
                                    type="text"
                                    className="input-field text-sm lg:text-base"
                                    value={editForm.passengerName}
                                    onChange={e => setEditForm({ ...editForm, passengerName: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="label text-sm text-slate-600 mb-1 block">เบอร์โทรศัพท์</label>
                                <input
                                    required
                                    type="tel"
                                    className="input-field text-sm lg:text-base"
                                    value={editForm.phone}
                                    onChange={e => setEditForm({ ...editForm, phone: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="label text-sm text-slate-600 mb-1 block">ราคา (บาท)</label>
                                <input
                                    required
                                    type="number"
                                    className="input-field text-sm lg:text-base"
                                    value={editForm.price}
                                    onChange={e => setEditForm({ ...editForm, price: e.target.value })}
                                />
                            </div>

                            <div className="flex gap-3 pt-4 border-t mt-4">
                                <button type="button" onClick={() => setEditingTicket(null)} className="flex-1 py-2 rounded-lg border border-slate-300 hover:bg-slate-50 transition-colors text-sm lg:text-base">ยกเลิก</button>
                                <button type="submit" className="flex-1 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors font-medium text-sm lg:text-base">บันทึกแก้ไข</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TicketList;
