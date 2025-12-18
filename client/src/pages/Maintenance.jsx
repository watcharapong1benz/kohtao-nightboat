import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { format } from 'date-fns';
import { Plus, Wrench, CheckCircle, Clock } from 'lucide-react';
import clsx from 'clsx';

const Maintenance = () => {
    const [records, setRecords] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({
        date: format(new Date(), 'yyyy-MM-dd'),
        details: '',
        imageUrl: '',
        status: 'WAITING',
        repairDate: '',
        technician: ''
    });

    useEffect(() => {
        fetchRecords();
    }, []);

    const fetchRecords = async () => {
        try {
            const res = await api.get('/api/maintenances');
            setRecords(res.data);
        } catch (error) {
            console.error(error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingId) {
                await api.put(`/api/maintenances/${editingId}`, formData);
            } else {
                await api.post('/api/maintenances', formData);
            }
            fetchRecords();
            closeModal();
        } catch (error) {
            alert('Error saving record');
        }
    };

    const openModal = (record = null) => {
        if (record) {
            setEditingId(record.id);
            setFormData({
                date: format(new Date(record.date), 'yyyy-MM-dd'),
                details: record.details,
                imageUrl: record.imageUrl || '',
                status: record.status,
                repairDate: record.repairDate ? format(new Date(record.repairDate), 'yyyy-MM-dd') : '',
                technician: record.technician || ''
            });
        } else {
            setEditingId(null);
            setFormData({
                date: format(new Date(), 'yyyy-MM-dd'),
                details: '',
                imageUrl: '',
                status: 'WAITING',
                repairDate: '',
                technician: ''
            });
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingId(null);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold flex items-center gap-2">
                    <Wrench className="text-orange-500" />
                    บันทึกการซ่อมบำรุง (Maintenance Log)
                </h2>
                <button
                    onClick={() => openModal()}
                    className="flex items-center gap-2 bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors"
                >
                    <Plus size={18} /> บันทึกรายการซ่อม
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {records.map(record => (
                    <div key={record.id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow">
                        {record.imageUrl && (
                            <div className="h-48 bg-slate-100 relative">
                                <img src={record.imageUrl} alt="Maintenance" className="w-full h-full object-cover" onError={(e) => e.target.src = 'https://via.placeholder.com/400x200?text=No+Image'} />
                                <div className={clsx(
                                    "absolute top-2 right-2 px-2 py-1 rounded text-xs font-bold shadow-sm",
                                    record.status === 'REPAIRED' ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                                )}>
                                    {record.status === 'REPAIRED' ? 'ซ่อมแล้ว' : 'รอซ่อม'}
                                </div>
                            </div>
                        )}
                        <div className="p-4 space-y-3">
                            {!record.imageUrl && (
                                <div className="flex justify-between items-start">
                                    <span className={clsx(
                                        "px-2 py-1 rounded text-xs font-bold",
                                        record.status === 'REPAIRED' ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                                    )}>
                                        {record.status === 'REPAIRED' ? 'ซ่อมแล้ว' : 'รอซ่อม'}
                                    </span>
                                </div>
                            )}

                            <h3 className="font-medium text-slate-800 line-clamp-2">{record.details}</h3>

                            <div className="text-sm text-slate-500 space-y-1">
                                <div className="flex items-center gap-2">
                                    <Clock size={14} />
                                    <span>แจ้งเมื่อ: {format(new Date(record.date), 'dd/MM/yyyy')}</span>
                                </div>
                                {record.repairDate && (
                                    <div className="flex items-center gap-2 text-green-600">
                                        <CheckCircle size={14} />
                                        <span>ซ่อมเมื่อ: {format(new Date(record.repairDate), 'dd/MM/yyyy')}</span>
                                    </div>
                                )}
                                {record.technician && (
                                    <div className="flex items-center gap-2">
                                        <Wrench size={14} />
                                        <span>ช่าง: {record.technician}</span>
                                    </div>
                                )}
                            </div>

                            <button
                                onClick={() => openModal(record)}
                                className="w-full mt-2 py-2 text-sm text-slate-600 bg-slate-50 hover:bg-slate-100 rounded border border-slate-200"
                            >
                                แก้ไข / อัปเดตสถานะ
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden max-h-[90vh] overflow-y-auto">
                        <div className="px-6 py-4 border-b flex justify-between items-center bg-slate-50">
                            <h3 className="font-bold text-lg">{editingId ? 'แก้ไขรายการ' : 'บันทึกรายการใหม่'}</h3>
                            <button onClick={closeModal} className="text-slate-400 hover:text-slate-600">✕</button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="label text-sm text-slate-600 mb-1 block">วันที่แจ้ง</label>
                                    <input required type="date" className="input-field w-full p-2 border rounded" value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })} />
                                </div>
                                <div>
                                    <label className="label text-sm text-slate-600 mb-1 block">สถานะ</label>
                                    <select className="input-field w-full p-2 border rounded" value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })}>
                                        <option value="WAITING">รอซ่อม</option>
                                        <option value="REPAIRED">ซ่อมแล้ว</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="label text-sm text-slate-600 mb-1 block">รายละเอียดอาการเสีย</label>
                                <textarea required rows="3" className="input-field w-full p-2 border rounded" value={formData.details} onChange={e => setFormData({ ...formData, details: e.target.value })}></textarea>
                            </div>

                            <div>
                                <label className="label text-sm text-slate-600 mb-1 block">รูปภาพ (URL)</label>
                                <input type="url" placeholder="https:// example.com/image.jpg" className="input-field w-full p-2 border rounded" value={formData.imageUrl} onChange={e => setFormData({ ...formData, imageUrl: e.target.value })} />
                                <p className="text-xs text-slate-400 mt-1">วางลิงก์รูปภาพจากเว็บ หรือฝากรูปไว้ที่อื่น</p>
                            </div>

                            <div className="border-t pt-4 mt-4 bg-slate-50 p-4 rounded-lg">
                                <h4 className="font-medium text-slate-700 mb-2">ส่วนของการซ่อม (เมื่อซ่อมเสร็จ)</h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="label text-sm text-slate-600 mb-1 block">วันที่ซ่อมเสร็จ</label>
                                        <input type="date" className="input-field w-full p-2 border rounded" value={formData.repairDate} onChange={e => setFormData({ ...formData, repairDate: e.target.value })} />
                                    </div>
                                    <div>
                                        <label className="label text-sm text-slate-600 mb-1 block">ช่างที่ซ่อม</label>
                                        <input type="text" className="input-field w-full p-2 border rounded" value={formData.technician} onChange={e => setFormData({ ...formData, technician: e.target.value })} />
                                    </div>
                                </div>
                            </div>

                            <button type="submit" className="w-full bg-orange-600 text-white py-2 rounded-lg hover:bg-orange-700 transition-colors font-medium mt-4">บันทึกข้อมูล</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Maintenance;
