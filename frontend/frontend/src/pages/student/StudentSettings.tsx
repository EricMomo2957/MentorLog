import { useState, useEffect } from 'react';
import api from '../../services/api';

const StudentSettings = () => {
    const [formData, setFormData] = useState({
        full_name: '',
        email: '',
        phone: '',
        currentPassword: '',
        newPassword: ''
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const res = await api.get('/auth/profile');
                const data = res.data;
                const userData = data.user || data;
                if (userData) {
                    setFormData(prev => ({
                        ...prev,
                        full_name: userData.full_name || '',
                        email: userData.email || '',
                        phone: userData.phone || ''
                    }));
                }
            } catch (err) {
                console.error("Failed to load profile", err);
            }
        };
        fetchUserData();
    }, []);

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        try {
            const response = await api.put('/auth/profile', {
                full_name: formData.full_name,
                phone: formData.phone,
                current_password: formData.currentPassword,
                new_password: formData.newPassword,
            });

            const data = response.data;
            if (data.success) {
                setMessage({ text: data.message || "Profile updated successfully!", type: 'success' });
            } else {
                setMessage({ text: data.message || "Failed to update profile.", type: 'error' });
            }
        } catch (err: any) {
            setMessage({ text: err.response?.data?.message || "Failed to update profile.", type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-6">
            <h1 className="text-3xl font-black text-white mb-8">
                Account <span className="text-blue-500">Settings</span>
            </h1>

            <div className="bg-[#1e293b] rounded-3xl border border-slate-800 p-8 shadow-2xl">
                {message && (
                    <div className={`mb-6 p-4 rounded-xl border ${
                        message.type === 'success' 
                        ? 'bg-emerald-500/10 border-emerald-500 text-emerald-500' 
                        : 'bg-red-500/10 border-red-500 text-red-500'
                    }`}>
                        {message.text}
                    </div>
                )}

                <form onSubmit={handleUpdate} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase">Full Name</label>
                            <input 
                                type="text" 
                                value={formData.full_name}
                                onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                                className="w-full bg-slate-900/50 border border-slate-700 rounded-xl p-3 text-white focus:border-blue-500 outline-none"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase">Email Address</label>
                            <input 
                                type="email" 
                                value={formData.email}
                                disabled
                                className="w-full bg-slate-800/50 border border-slate-700 rounded-xl p-3 text-slate-500 cursor-not-allowed"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase">Phone Number</label>
                        <input 
                            type="text" 
                            value={formData.phone}
                            onChange={(e) => setFormData({...formData, phone: e.target.value})}
                            className="w-full bg-slate-900/50 border border-slate-700 rounded-xl p-3 text-white focus:border-blue-500 outline-none"
                        />
                    </div>

                    <hr className="border-slate-800" />

                    <div className="space-y-4">
                        <h3 className="text-white font-bold">Change Password</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <input 
                                type="password" 
                                placeholder="Current Password"
                                value={formData.currentPassword}
                                onChange={(e) => setFormData({...formData, currentPassword: e.target.value})}
                                className="w-full bg-slate-900/50 border border-slate-700 rounded-xl p-3 text-white focus:border-blue-500 outline-none"
                            />
                            <input 
                                type="password" 
                                placeholder="New Password"
                                value={formData.newPassword}
                                onChange={(e) => setFormData({...formData, newPassword: e.target.value})}
                                className="w-full bg-slate-900/50 border border-slate-700 rounded-xl p-3 text-white focus:border-blue-500 outline-none"
                            />
                        </div>
                    </div>

                    <div className="flex justify-end pt-4">
                        <button 
                            type="submit" 
                            disabled={loading}
                            className="px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold transition-all disabled:opacity-50"
                        >
                            {loading ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default StudentSettings;