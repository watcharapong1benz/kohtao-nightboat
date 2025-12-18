import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import clsx from 'clsx';
import { UserPlus, Trash2 } from 'lucide-react';
import { format } from 'date-fns';

const StaffManagement = () => {
    const { user } = useAuth();
    const [users, setUsers] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        name: '',
        role: 'STAFF'
    });
    const [message, setMessage] = useState(null);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const res = await api.get('/api/users');
            setUsers(res.data);
        } catch (error) {
            console.error('Failed to fetch users', error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/api/users', formData);
            setMessage({ type: 'success', text: 'เพิ่มผู้ใช้งานสำเร็จ' });
            setIsModalOpen(false);
            setFormData({ username: '', password: '', name: '', role: 'STAFF' });
            fetchUsers();
        } catch (error) {
            setMessage({ type: 'error', text: 'เกิดข้อผิดพลาด: ' + (error.response?.data?.message || error.message) });
        }
    };

    if (user?.role !== 'ADMIN') {
        return <div className="p-8 text-center text-red-500">Access Denied</div>;
    }

    return (
        <div className="space-y-6">
            {message && (
                <div className={clsx(
                    "fixed bottom-4 right-4 px-6 py-3 rounded-lg shadow-lg text-white font-medium z-50 animate-bounce transition-all",
                    message.type === 'success' ? "bg-green-600" : "bg-red-600"
                )}>
                    {message.text}
                </div>
            )}

            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold">จัดการพนักงาน (Staff Management)</h2>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                    <UserPlus size={18} /> เพิ่มพนักงานใหม่
                </button>
            </div>

            <div className="card overflow-hidden p-0 bg-white rounded-xl shadow-sm border border-slate-200">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-50 text-slate-500 text-sm uppercase border-b border-slate-200">
                        <tr>
                            <th className="p-4 font-medium">Username</th>
                            <th className="p-4 font-medium">ชื่อ-นามสกุล</th>
                            <th className="p-4 font-medium">ตำแหน่ง</th>
                            <th className="p-4 font-medium">วันที่สร้าง</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {users.map(u => (
                            <tr key={u.id} className="hover:bg-slate-50">
                                <td className="p-4 font-mono text-slate-700">{u.username}</td>
                                <td className="p-4 font-medium">{u.name}</td>
                                <td className="p-4">
                                    <span className={clsx(
                                        "px-2 py-1 rounded text-xs font-semibold",
                                        u.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' : 'bg-green-100 text-green-700'
                                    )}>
                                        {u.role}
                                    </span>
                                </td>
                                <td className="p-4 text-slate-500 text-sm">
                                    {format(new Date(u.createdAt), 'dd/MM/yyyy HH:mm')}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
                        <div className="px-6 py-4 border-b flex justify-between items-center bg-slate-50">
                            <h3 className="font-bold text-lg">เพิ่มพนักงานใหม่</h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="label text-sm text-slate-600 mb-1 block">Username</label>
                                <input required type="text" className="input-field w-full p-2 border rounded" value={formData.username} onChange={e => setFormData({ ...formData, username: e.target.value })} />
                            </div>
                            <div>
                                <label className="label text-sm text-slate-600 mb-1 block">Password</label>
                                <input required type="password" className="input-field w-full p-2 border rounded" value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} />
                            </div>
                            <div>
                                <label className="label text-sm text-slate-600 mb-1 block">ชื่อ-นามสกุล</label>
                                <input required type="text" className="input-field w-full p-2 border rounded" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                            </div>
                            <div>
                                <label className="label text-sm text-slate-600 mb-1 block">ตำแหน่ง</label>
                                <select className="input-field w-full p-2 border rounded" value={formData.role} onChange={e => setFormData({ ...formData, role: e.target.value })}>
                                    <option value="STAFF">Staff (พนักงานขาย)</option>
                                    <option value="AGENT">Agent (ตัวแทนขาย)</option>
                                    <option value="ADMIN">Admin (ผู้ดูแลระบบ)</option>
                                </select>
                            </div>
                            <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium mt-4">บันทึก</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StaffManagement;
