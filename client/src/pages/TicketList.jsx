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
        <div className="space-y-6 relative">
            {/* Feedback Message Toast */}
            {message && (
                <div className={clsx(
                    "fixed bottom-4 right-4 px-6 py-3 rounded-lg shadow-lg text-white font-medium z-50 animate-bounce transition-all",
                    message.type === 'success' ? "bg-green-600" : "bg-red-600"
                )}>
                    {message.text}
                </div>
            )}

            <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <h2 className="text-xl font-bold">รายการตั๋วเรือ</h2>
                    <div className="flex gap-2">
                        <input
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            className="input-field w-auto"
                        />
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input
                                type="text"
                                placeholder="ค้นหาพนง.ขาย/ผู้โดยสาร..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="input-field w-64 pl-10"
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div className="card overflow-hidden p-0">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-50 text-slate-500 text-sm uppercas border-b border-slate-200">
                        <tr>
                            <th className="p-4 font-medium">เวลาขาย</th>
                            <th className="p-4 font-medium">ผู้โดยสาร</th>
                            <th className="p-4 font-medium">โทรศัพท์</th>
                            <th className="p-4 font-medium">เส้นทาง</th>
                            <th className="p-4 font-medium">ที่นั่ง</th>
                            <th className="p-4 font-medium text-right">ราคา</th>
                            <th className="p-4 font-medium">พนักงานขาย</th>
                            <th className="p-4 font-medium text-center">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {filteredTickets.length === 0 ? (
                            <tr><td colSpan="8" className="p-8 text-center text-slate-400">ไม่รายการขายในช่วงเวลานี้</td></tr>
                        ) : filteredTickets.map(ticket => (
                            <tr key={ticket.id} className="hover:bg-slate-50 transition-colors">
                                <td className="p-4 text-slate-600">
                                    {format(new Date(ticket.createdAt), 'HH:mm')}
                                </td>
                                <td className="p-4 font-medium">{ticket.passengerName}</td>
                                <td className="p-4 text-slate-600">{ticket.phone}</td>
                                <td className="p-4 text-sm">
                                    <span className={ticket.route === 'SURAT_TO_KOHTAO' ? 'text-blue-600' : 'text-orange-600'}>
                                        {ticket.route === 'SURAT_TO_KOHTAO' ? 'สุราษฎร์ -> เกาะเต่า' : 'เกาะเต่า -> สุราษฎร์'}
                                    </span>
                                </td>
                                <td className="p-4 font-mono text-slate-700">{ticket.seatNumber}</td>
                                <td className="p-4 text-right font-medium">{ticket.price}</td>
                                <td className="p-4 text-sm text-slate-500">{ticket.seller?.name || '-'}</td>
                                <td className="p-4 flex justify-center gap-2">
                                    <button onClick={() => handlePrint(ticket)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded" title="พิมพ์ใบเสร็จ"><Printer size={16} /></button>
                                    <button onClick={() => handleEditClick(ticket)} className="p-2 text-slate-400 hover:text-orange-600 hover:bg-orange-50 rounded" title="แก้ไข"><Edit2 size={16} /></button>
                                    {user?.role !== 'STAFF' && (
                                        <button onClick={() => handleDelete(ticket.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded" title="ลบ"><Trash2 size={16} /></button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Edit Modal */}
            {editingTicket && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
                        <div className="px-6 py-4 border-b flex justify-between items-center bg-slate-50">
                            <h3 className="font-bold text-lg">แก้ไขข้อมูลตั๋ว</h3>
                            <button onClick={() => setEditingTicket(null)} className="text-slate-400 hover:text-slate-600">✕</button>
                        </div>
                        <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="label text-sm text-slate-600 mb-1 block">ชื่อผู้โดยสาร</label>
                                <input
                                    required
                                    type="text"
                                    className="input-field"
                                    value={editForm.passengerName}
                                    onChange={e => setEditForm({ ...editForm, passengerName: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="label text-sm text-slate-600 mb-1 block">เบอร์โทรศัพท์</label>
                                <input
                                    required
                                    type="tel"
                                    className="input-field"
                                    value={editForm.phone}
                                    onChange={e => setEditForm({ ...editForm, phone: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="label text-sm text-slate-600 mb-1 block">ราคา (บาท)</label>
                                <input
                                    required
                                    type="number"
                                    className="input-field"
                                    value={editForm.price}
                                    onChange={e => setEditForm({ ...editForm, price: e.target.value })}
                                />
                            </div>

                            <div className="flex gap-3 pt-4 border-t mt-4">
                                <button type="button" onClick={() => setEditingTicket(null)} className="flex-1 py-2 rounded-lg border border-slate-300 hover:bg-slate-50 transition-colors">ยกเลิก</button>
                                <button type="submit" className="flex-1 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors font-medium">บันทึกแก้ไข</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TicketList;
