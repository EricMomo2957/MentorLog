import { useState, useEffect } from 'react';
import api from '../../services/api';
import { 
    User, Lock, CheckCircle2, AlertCircle 
} from 'lucide-react';

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
                setMessage({ text: data.message || "Account settings updated successfully!", type: 'success' });
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
        <div className="space-y-6 max-w-4xl mx-auto">
            
            {/* Top Title & Primary Action Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Account & Security Settings</h1>
                    <p className="text-xs text-slate-500 mt-0.5">Update personal preferences, contact details, and account security password</p>
                </div>
            </div>

            {/* Notification Banner */}
            {message && (
                <div className={`p-3.5 rounded-xl border text-xs font-semibold flex items-center gap-2 ${
                    message.type === 'success' 
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
                    : 'bg-rose-50 border-rose-200 text-rose-800'
                }`}>
                    {message.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <AlertCircle className="w-4 h-4 text-rose-600" />}
                    <span>{message.text}</span>
                </div>
            )}

            {/* Main Form Container */}
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-6">
                <form onSubmit={handleUpdate} className="space-y-6">
                    
                    {/* Section: Profile Information */}
                    <div className="space-y-4">
                        <div className="border-b border-slate-100 pb-2.5">
                            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                                <User className="w-4 h-4 text-blue-600" /> Profile Information
                            </h2>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-slate-600">Full Name</label>
                                <input 
                                    type="text" 
                                    value={formData.full_name}
                                    onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 outline-none focus:border-blue-500 focus:bg-white"
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-slate-600">Email Address (Read-only)</label>
                                <input 
                                    type="email" 
                                    value={formData.email}
                                    disabled
                                    className="w-full bg-slate-100 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-400 cursor-not-allowed font-mono"
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-slate-600">Phone Number</label>
                            <input 
                                type="text" 
                                value={formData.phone}
                                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 outline-none focus:border-blue-500 focus:bg-white"
                            />
                        </div>
                    </div>

                    {/* Section: Password Security */}
                    <div className="space-y-4 pt-2">
                        <div className="border-b border-slate-100 pb-2.5">
                            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                                <Lock className="w-4 h-4 text-blue-600" /> Account Password Security
                            </h2>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-slate-600">Current Password</label>
                                <input 
                                    type="password" 
                                    placeholder="Enter current password"
                                    value={formData.currentPassword}
                                    onChange={(e) => setFormData({...formData, currentPassword: e.target.value})}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 outline-none focus:border-blue-500 focus:bg-white"
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-slate-600">New Password</label>
                                <input 
                                    type="password" 
                                    placeholder="Enter new password"
                                    value={formData.newPassword}
                                    onChange={(e) => setFormData({...formData, newPassword: e.target.value})}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 outline-none focus:border-blue-500 focus:bg-white"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Submit Action */}
                    <div className="flex justify-end pt-4 border-t border-slate-100">
                        <button 
                            type="submit" 
                            disabled={loading}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs px-6 py-2.5 rounded-lg shadow-xs transition-all disabled:opacity-50"
                        >
                            {loading ? 'Saving...' : 'Save Settings'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default StudentSettings;