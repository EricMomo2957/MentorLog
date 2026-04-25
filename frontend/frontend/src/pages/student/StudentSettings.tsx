import { useState, useEffect } from 'react';

const StudentSettings = () => {
    const PHP_BRIDGE_URL = 'http://localhost/MentorLog/php-bridge';
    
    const [formData, setFormData] = useState({
        full_name: '',
        email: '',
        phone: '',
        currentPassword: '',
        newPassword: ''
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

    // Fetch current user data on load
    useEffect(() => {
        const fetchUserData = async () => {
            const userId = localStorage.getItem('userId');
            if (!userId) return;

            try {
                const res = await fetch(`${PHP_BRIDGE_URL}/get-profile.php?user_id=${userId}`);
                const data = await res.json();
                if (data.success) {
                    setFormData(prev => ({
                        ...prev,
                        full_name: data.user.full_name || '',
                        email: data.user.email || '',
                        phone: data.user.phone || ''
                    }));
                }
            } catch (err) {
                console.error("Failed to load profile", err);
            }
        };
        fetchUserData();
    }, [PHP_BRIDGE_URL]);

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        // Get the user ID from storage
        const userId = localStorage.getItem('userId');

        try {
            const response = await fetch(`${PHP_BRIDGE_URL}/update-profile.php`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user_id: userId,
                    full_name: formData.full_name,
                    phone: formData.phone,
                    currentPassword: formData.currentPassword,
                    newPassword: formData.newPassword,
                })
            });

            const data = await response.json();
            
            if (data.success) {
                setMessage({ text: "Profile updated successfully!", type: 'success' });
                // Clear password fields after success for security
                setFormData(prev => ({ ...prev, currentPassword: '', newPassword: '' }));
            } else {
                setMessage({ text: data.message || "Update failed.", type: 'error' });
            }
        } catch (err: any) {
            console.error("Connection error:", err.message);
            setMessage({ text: "Connection error to PHP Bridge.", type: 'error' });
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
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase">Phone Number</label>
                            <input 
                                type="text" 
                                value={formData.phone}
                                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                                className="w-full bg-slate-900/50 border border-slate-700 rounded-xl p-3 text-white focus:border-blue-500 outline-none"
                            />
                        </div>
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
                                placeholder="New Password (optional)"
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