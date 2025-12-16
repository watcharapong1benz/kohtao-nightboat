import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { Package, Calendar, User, Phone, Scale, Banknote } from 'lucide-react';
import { format } from 'date-fns';

const ParcelDeposit = () => {
    const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
    const [formData, setFormData] = useState({
        senderName: '',
        senderPhone: '',
        receiverName: '',
        receiverPhone: '',
        weight: 0,
        price: 30, // Min price
        paymentStatus: 'UNPAID'
    });

    const calculatePrice = (weight) => {
        // 1kg * 10 THB, min 30 THB
        const w = parseFloat(weight) || 0;
        const p = Math.max(30, w * 10);
        return p;
    };

    const handleWeightChange = (e) => {
        const w = e.target.value;
        const p = calculatePrice(w);
        setFormData(prev => ({ ...prev, weight: w, price: p }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/api/parcels', {
                ...formData,
                weight: parseFloat(formData.weight) || 0,
                depositDate: date
            });
            alert('รับฝากพัสดุสำเร็จ!');
            // Reset or navigate could go here
            setFormData({
                senderName: '',
                senderPhone: '',
                receiverName: '',
                receiverPhone: '',
                weight: 0,
                price: 30,
                paymentStatus: 'UNPAID'
            });
        } catch (error) {
            alert('Error depositing parcel: ' + (error.response?.data?.message || error.message));
            console.error(error);
        }
    };

    return (
        <div className="max-w-4xl mx-auto">
            <div className="card">
                <h2 className="text-xl font-bold mb-6 flex items-center gap-2 pb-4 border-b">
                    <Package className="text-blue-500" />
                    รับฝากพัสดุ
                </h2>

                <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-8">

                    {/* Left Col */}
                    <div className="space-y-4">
                        <h3 className="font-semibold text-slate-500 text-sm uppercase tracking-wide">ข้อมูลผู้ส่ง</h3>
                        <div className="space-y-3">
                            <div>
                                <label className="label text-sm text-slate-600 mb-1 block">ชื่อผู้ส่ง</label>
                                <input
                                    required
                                    type="text"
                                    className="input-field"
                                    value={formData.senderName}
                                    onChange={e => setFormData({ ...formData, senderName: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="label text-sm text-slate-600 mb-1 block">เบอร์โทรศัพท์</label>
                                <input
                                    required
                                    type="tel"
                                    className="input-field"
                                    value={formData.senderPhone}
                                    onChange={e => setFormData({ ...formData, senderPhone: e.target.value })}
                                />
                            </div>
                        </div>

                        <h3 className="font-semibold text-slate-500 text-sm uppercase tracking-wide pt-4">ข้อมูลผู้รับ</h3>
                        <div className="space-y-3">
                            <div>
                                <label className="label text-sm text-slate-600 mb-1 block">ชื่อผู้ร้บ</label>
                                <input
                                    required
                                    type="text"
                                    className="input-field"
                                    value={formData.receiverName}
                                    onChange={e => setFormData({ ...formData, receiverName: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="label text-sm text-slate-600 mb-1 block">เบอร์โทรศัพท์</label>
                                <input
                                    required
                                    type="tel"
                                    className="input-field"
                                    value={formData.receiverPhone}
                                    onChange={e => setFormData({ ...formData, receiverPhone: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Right Col */}
                    <div className="space-y-4 bg-slate-50 p-6 rounded-xl border border-slate-200">
                        <h3 className="font-semibold text-slate-500 text-sm uppercase tracking-wide">รายละเอียดพัสดุ</h3>

                        <div>
                            <label className="label text-sm text-slate-600 mb-1 block">วันที่ฝากส่ง</label>
                            <input
                                type="date"
                                className="input-field"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                required
                            />
                        </div>

                        <div>
                            <label className="label text-sm text-slate-600 mb-1 block">น้ำหนัก (กิโลกรัม)</label>
                            <div className="relative">
                                <Scale className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input
                                    type="number"
                                    step="0.1"
                                    className="input-field pl-10"
                                    value={formData.weight}
                                    onChange={handleWeightChange}
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="label text-sm text-slate-600 mb-1 block">ราคาค่าส่ง (บาท)</label>
                            <div className="relative">
                                <Banknote className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input
                                    type="number"
                                    className="input-field pl-10 bg-white font-bold text-blue-600"
                                    value={formData.price}
                                    readOnly
                                />
                            </div>
                            <p className="text-xs text-slate-400 mt-1">*ขั้นต่ำ 30 บาท (10 บาท/กก.)</p>
                        </div>

                        <div>
                            <label className="label text-sm text-slate-600 mb-1 block">สถานะการชำระเงิน</label>
                            <div className="flex gap-4">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="payment"
                                        value="UNPAID"
                                        checked={formData.paymentStatus === 'UNPAID'}
                                        onChange={e => setFormData({ ...formData, paymentStatus: e.target.value })}
                                        className="w-4 h-4 text-blue-600"
                                    />
                                    <span className="text-sm">ยังไม่ชำระ</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="payment"
                                        value="PAID"
                                        checked={formData.paymentStatus === 'PAID'}
                                        onChange={e => setFormData({ ...formData, paymentStatus: e.target.value })}
                                        className="w-4 h-4 text-green-600"
                                    />
                                    <span className="text-sm text-green-600 font-medium">ชำระแล้ว</span>
                                </label>
                            </div>
                        </div>

                        <button type="submit" className="w-full btn-primary mt-8">
                            บันทึกรับฝาก
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
};

export default ParcelDeposit;
