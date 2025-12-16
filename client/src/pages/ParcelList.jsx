import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { format } from 'date-fns';
import { Search, Trash2, Printer, Edit2, CheckCircle, Clock } from 'lucide-react';
import clsx from 'clsx';
import { printParcelReceipt } from '../utils/print';

const ParcelList = () => {
    const { user } = useAuth();
    const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
    const [parcels, setParcels] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [editingParcel, setEditingParcel] = useState(null);
    const [message, setMessage] = useState(null); // { type: 'success' | 'error', text: '' }
    const [editForm, setEditForm] = useState({
        senderName: '', senderPhone: '',
        receiverName: '', receiverPhone: '',
        weight: 0, price: 0, paymentStatus: 'UNPAID'
    });

    useEffect(() => {
        if (message) {
            const timer = setTimeout(() => setMessage(null), 3000);
            return () => clearTimeout(timer);
        }
    }, [message]);

    useEffect(() => {
        fetchParcels();
    }, [date]);

    const handleEditClick = (parcel) => {
        setEditingParcel(parcel);
        setEditForm({
            senderName: parcel.senderName,
            senderPhone: parcel.senderPhone,
            receiverName: parcel.receiverName,
            receiverPhone: parcel.receiverPhone,
            weight: parcel.weight,
            price: parcel.price,
            paymentStatus: parcel.paymentStatus
        });
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.put(`/api/parcels/${editingParcel.id}`, {
                ...editForm,
                weight: parseFloat(editForm.weight),
                price: parseFloat(editForm.price)
            });
            alert('แก้ไขข้อมูลสำเร็จ');
            setEditingParcel(null);
            fetchParcels();
        } catch (error) {
            alert('Error updating parcel: ' + (error.response?.data?.message || error.message));
        }
    };

    const fetchParcels = async () => {
        try {
            const res = await api.get(`/api/parcels?date=${date}`);
            setParcels(res.data);
        } catch (error) {
            console.error(error);
        }
    };

    const handleStatusChange = async (id, currentStatus) => {
        const newStatus = currentStatus === 'WAITING' ? 'DELIVERED' : 'WAITING';
        try {
            await api.put(`/api/parcels/${id}`, { status: newStatus });
            fetchParcels();
        } catch (error) {
            alert('Error updating status');
        }
    };

    const handleDelete = async (id) => {
        if (!paramsIdValid(id)) {
            setMessage({ type: 'error', text: 'รหัสพัสดุไม่ถูกต้อง' });
            return;
        }

        if (!window.confirm(`ต้องการลบรายการพัสดุนี้ใช่หรือไม่?`)) return;

        console.log('Attempting to delete parcel:', id);
        try {
            await api.delete(`/api/parcels/${id}`);
            // Update UI immediately (Optimistic Update)
            setParcels(prev => prev.filter(p => p.id !== id));
            setMessage({ type: 'success', text: 'ลบข้อมูลเรียบร้อยแล้ว' });
        } catch (error) {
            console.error('Delete error details:', error);
            const errMsg = error.response?.data?.error || error.message || 'เกิดข้อผิดพลาดในการลบ';
            setMessage({ type: 'error', text: `ไม่สามารถลบได้: ${errMsg}` });
            // Re-fetch to sync
            fetchParcels();
        }
    };

    const paramsIdValid = (id) => {
        return id && !isNaN(parseInt(id));
    };

    const handlePrint = (parcel) => {
        printParcelReceipt(parcel);
    };

    const filteredParcels = parcels.filter(parcel => {
        if (!searchTerm) return true;
        const searchLower = searchTerm.toLowerCase();
        return (
            (parcel.seller?.name || '').toLowerCase().includes(searchLower) ||
            (parcel.senderName || '').toLowerCase().includes(searchLower) ||
            (parcel.receiverName || '').toLowerCase().includes(searchLower)
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
                    <h2 className="text-xl font-bold">รายการพัสดุฝากส่ง</h2>
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
                                placeholder="ค้นหาพนง.รับฝาก/ลูกค้า..."
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
                            <th className="p-4 font-medium">ผู้ส่ง</th>
                            <th className="p-4 font-medium">ผู้รับ</th>
                            <th className="p-4 font-medium">น้ำหนัก (Kg)</th>
                            <th className="p-4 font-medium text-right">ราคา</th>
                            <th className="p-4 font-medium text-center">ชำระเงิน</th>
                            <th className="p-4 font-medium text-center">สถานะ</th>
                            <th className="p-4 font-medium">พนง.รับฝาก</th>
                            <th className="p-4 font-medium text-center">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {filteredParcels.length === 0 ? (
                            <tr><td colSpan="8" className="p-8 text-center text-slate-400">ไม่มีรายการพัสดุในช่วงเวลานี้</td></tr>
                        ) : filteredParcels.map(parcel => (
                            <tr key={parcel.id} className="hover:bg-slate-50 transition-colors">
                                <td className="p-4">
                                    <div className="font-medium">{parcel.senderName}</div>
                                    <div className="text-xs text-slate-400">{parcel.senderPhone}</div>
                                </td>
                                <td className="p-4">
                                    <div className="font-medium">{parcel.receiverName}</div>
                                    <div className="text-xs text-slate-400">{parcel.receiverPhone}</div>
                                </td>
                                <td className="p-4 text-slate-600">{parcel.weight}</td>
                                <td className="p-4 text-right font-medium">{parcel.price}</td>
                                <td className="p-4 text-center">
                                    <span className={clsx("px-2 py-1 rounded text-xs font-bold", parcel.paymentStatus === 'PAID' ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600")}>
                                        {parcel.paymentStatus}
                                    </span>
                                </td>
                                <td className="p-4 text-center">
                                    <button
                                        onClick={() => handleStatusChange(parcel.id, parcel.status)}
                                        className={clsx(
                                            "flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold transition-all mx-auto",
                                            parcel.status === 'DELIVERED'
                                                ? "bg-green-500 text-white shadow-green-200 shadow-lg"
                                                : "bg-amber-100 text-amber-600 hover:bg-amber-200"
                                        )}
                                    >
                                        {parcel.status === 'DELIVERED' ? <CheckCircle size={12} /> : <Clock size={12} />}
                                        {parcel.status === 'DELIVERED' ? 'จัดส่งแล้ว' : 'รอส่ง'}
                                    </button>
                                </td>
                                <td className="p-4 text-sm text-slate-500">{parcel.seller?.name || '-'}</td>
                                <td className="p-4 flex justify-center gap-2">
                                    <button onClick={() => handlePrint(parcel)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded" title="พิมพ์ใบเสร็จ"><Printer size={16} /></button>
                                    <button onClick={() => handleEditClick(parcel)} className="p-2 text-slate-400 hover:text-orange-600 hover:bg-orange-50 rounded" title="แก้ไข"><Edit2 size={16} /></button>
                                    {user?.role !== 'STAFF' && (
                                        <button onClick={() => handleDelete(parcel.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded" title="ลบ"><Trash2 size={16} /></button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Edit Modal */}
            {editingParcel && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden">
                        <div className="px-6 py-4 border-b flex justify-between items-center bg-slate-50">
                            <h3 className="font-bold text-lg">แก้ไขพัสดุ</h3>
                            <button onClick={() => setEditingParcel(null)} className="text-slate-400 hover:text-slate-600">✕</button>
                        </div>
                        <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="label text-sm text-slate-600 mb-1 block">ชื่อผู้ส่ง</label>
                                    <input
                                        required
                                        type="text"
                                        className="input-field"
                                        value={editForm.senderName}
                                        onChange={e => setEditForm({ ...editForm, senderName: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="label text-sm text-slate-600 mb-1 block">เบอร์โทรผู้ส่ง</label>
                                    <input
                                        required
                                        type="tel"
                                        className="input-field"
                                        value={editForm.senderPhone}
                                        onChange={e => setEditForm({ ...editForm, senderPhone: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="label text-sm text-slate-600 mb-1 block">ชื่อผู้รับ</label>
                                    <input
                                        required
                                        type="text"
                                        className="input-field"
                                        value={editForm.receiverName}
                                        onChange={e => setEditForm({ ...editForm, receiverName: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="label text-sm text-slate-600 mb-1 block">เบอร์โทรผู้รับ</label>
                                    <input
                                        required
                                        type="tel"
                                        className="input-field"
                                        value={editForm.receiverPhone}
                                        onChange={e => setEditForm({ ...editForm, receiverPhone: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="label text-sm text-slate-600 mb-1 block">น้ำหนัก (กก.)</label>
                                    <input
                                        type="number"
                                        step="0.1"
                                        className="input-field"
                                        value={editForm.weight}
                                        onChange={e => {
                                            const w = parseFloat(e.target.value) || 0;
                                            setEditForm({
                                                ...editForm,
                                                weight: w,
                                                price: Math.max(30, w * 10)
                                            });
                                        }}
                                    />
                                </div>
                                <div>
                                    <label className="label text-sm text-slate-600 mb-1 block">ราคา (บาท)</label>
                                    <input
                                        type="number"
                                        className="input-field bg-slate-50"
                                        readOnly
                                        value={editForm.price}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="label text-sm text-slate-600 mb-2 block">สถานะการชำระเงิน</label>
                                <div className="flex gap-4">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="editPayment"
                                            value="UNPAID"
                                            checked={editForm.paymentStatus === 'UNPAID'}
                                            onChange={e => setEditForm({ ...editForm, paymentStatus: e.target.value })}
                                            className="w-4 h-4 text-blue-600"
                                        />
                                        <span className="text-sm">ยังไม่ชำระ</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="editPayment"
                                            value="PAID"
                                            checked={editForm.paymentStatus === 'PAID'}
                                            onChange={e => setEditForm({ ...editForm, paymentStatus: e.target.value })}
                                            className="w-4 h-4 text-green-600"
                                        />
                                        <span className="text-sm text-green-600 font-medium">ชำระแล้ว</span>
                                    </label>
                                </div>
                            </div>

                            <div className="flex gap-3 pt-4 border-t mt-4">
                                <button type="button" onClick={() => setEditingParcel(null)} className="flex-1 py-2 rounded-lg border border-slate-300 hover:bg-slate-50 transition-colors">ยกเลิก</button>
                                <button type="submit" className="flex-1 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors font-medium">บันทึกแก้ไข</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ParcelList;
