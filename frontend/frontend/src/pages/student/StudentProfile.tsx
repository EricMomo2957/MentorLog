import { useState, useEffect } from 'react';
import StudentLayout from './StudentLayout';

interface UserProfile {
    full_name: string;
    email: string;
    phone: string;
    student_id: string;
    course: string;
    year_level: string;
    ojt_hours_required: number;
}

const StudentProfile = () => {
    const PHP_BRIDGE_URL = 'http://localhost/MentorLog/php-bridge';
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    
    // MODAL & FORM STATES
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        full_name: '',
        email: '',
        phone: ''
    });
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        const userId = localStorage.getItem('userId');
        try {
            const res = await fetch(`${PHP_BRIDGE_URL}/get-profile.php?user_id=${userId}`);
            const data = await res.json();
            if (data.success) {
                setProfile(data.user);
                // Initialize form data with current profile values
                setFormData({
                    full_name: data.user.full_name,
                    email: data.user.email,
                    phone: data.user.phone || ''
                });
            }
        } catch (err) {
            console.error("Error fetching profile:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        const userId = localStorage.getItem('userId');

        try {
            const res = await fetch(`${PHP_BRIDGE_URL}/update-profile.php`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ user_id: userId, ...formData })
            });
            const data = await res.json();
            if (data.success) {
                alert("Profile updated successfully!");
                setIsEditModalOpen(false);
                fetchProfile(); // Refresh data
            } else {
                alert(data.message || "Update failed.");
            }
        } catch (err) {
            console.error("Update error:", err);
        } finally {
            setIsSaving(false);
        }
    };

    if (loading) return (
        <StudentLayout>
            <div className="flex items-center justify-center h-[60vh]">
                <div className="w-10 h-10 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin"></div>
            </div>
        </StudentLayout>
    );

    return (
        <StudentLayout>
            <div className="max-w-5xl mx-auto space-y-8 pb-12 px-4">
                {/* Profile Header Card */}
                <div className="relative overflow-hidden bg-[#1e293b] rounded-[2.5rem] border border-slate-800 shadow-2xl">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-600/10 blur-[100px] -mr-32 -mt-32"></div>
                    
                    <div className="relative p-8 md:p-12 flex flex-col md:flex-row items-center gap-8">
                        <div className="relative">
                            <div className="w-32 h-32 md:w-40 md:h-40 rounded-3xl bg-linear-to-br from-emerald-600 to-teal-700 flex items-center justify-center text-5xl font-black text-white shadow-2xl border-4 border-slate-900">
                                {profile?.full_name?.charAt(0) || 'S'}
                            </div>
                            <div className="absolute -bottom-2 -right-2 bg-emerald-500 w-8 h-8 rounded-full border-4 border-[#1e293b] flex items-center justify-center text-[10px] text-white">
                                ✔️
                            </div>
                        </div>

                        <div className="text-center md:text-left space-y-2">
                            <h1 className="text-4xl font-black text-white tracking-tight">{profile?.full_name}</h1>
                            <p className="text-emerald-400 font-bold tracking-widest uppercase text-xs">{profile?.course} — Year {profile?.year_level}</p>
                            <div className="flex flex-wrap justify-center md:justify-start gap-3 mt-4">
                                <span className="px-4 py-1.5 bg-slate-900/50 border border-slate-700 rounded-full text-xs font-bold text-slate-400">ID: {profile?.student_id}</span>
                                <span className="px-4 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-xs font-bold text-emerald-500">Active OJT</span>
                            </div>
                        </div>

                        <div className="md:ml-auto">
                            <button 
                                onClick={() => setIsEditModalOpen(true)}
                                className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold text-sm transition-all shadow-lg shadow-emerald-500/20"
                            >
                                Edit Profile
                            </button>
                        </div>
                    </div>
                </div>

                {/* Detail Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-1 space-y-6">
                        <div className="bg-[#1e293b] p-8 rounded-3xl border border-slate-800 shadow-xl">
                            <h4 className="text-white font-bold mb-6 flex items-center gap-2">
                                <span>📞</span> Contact Info
                            </h4>
                            <div className="space-y-4">
                                <div>
                                    <p className="text-[10px] text-slate-500 font-black uppercase mb-1">Email</p>
                                    <p className="text-slate-200 font-medium text-sm">{profile?.email}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] text-slate-500 font-black uppercase mb-1">Phone</p>
                                    <p className="text-slate-200 font-medium text-sm">{profile?.phone || 'Not provided'}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="md:col-span-2 bg-[#1e293b] p-8 rounded-3xl border border-slate-800 shadow-xl">
                        <h4 className="text-white font-bold mb-6 flex items-center gap-2">
                            <span>🚀</span> Internship Summary
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                            <div className="p-4 bg-slate-900/40 rounded-2xl border border-slate-700/50">
                                <p className="text-[10px] text-emerald-400 font-black uppercase mb-1">Target Hours</p>
                                <p className="text-2xl font-black text-white">{profile?.ojt_hours_required} hrs</p>
                            </div>
                            <div className="p-4 bg-slate-900/40 rounded-2xl border border-slate-700/50">
                                <p className="text-[10px] text-emerald-400 font-black uppercase mb-1">OJT Category</p>
                                <p className="text-2xl font-black text-white">Full-Stack Dev</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* EDIT PROFILE MODAL */}
            {isEditModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-[#1e293b] w-full max-w-md rounded-4xl border border-slate-700 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-8">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-black text-white">Edit Profile</h3>
                                <button onClick={() => setIsEditModalOpen(false)} className="text-slate-400 hover:text-white transition-colors">✕</button>
                            </div>

                            <form onSubmit={handleUpdate} className="space-y-5">
                                <div>
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2 ml-1">Full Name</label>
                                    <input 
                                        type="text"
                                        required
                                        className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all"
                                        value={formData.full_name}
                                        onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                                    />
                                </div>

                                <div>
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2 ml-1">Email Address</label>
                                    <input 
                                        type="email"
                                        required
                                        className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all"
                                        value={formData.email}
                                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                                    />
                                </div>

                                <div>
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2 ml-1">Phone Number</label>
                                    <input 
                                        type="text"
                                        placeholder="e.g. 0912 345 6789"
                                        className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                                    />
                                </div>

                                <div className="pt-4 flex gap-3">
                                    <button 
                                        type="button"
                                        onClick={() => setIsEditModalOpen(false)}
                                        className="flex-1 px-4 py-3 bg-slate-800 text-slate-300 rounded-xl font-bold text-sm hover:bg-slate-700 transition-all"
                                    >
                                        Cancel
                                    </button>
                                    <button 
                                        type="submit"
                                        disabled={isSaving}
                                        className="flex-1 px-4 py-3 bg-emerald-500 text-white rounded-xl font-bold text-sm hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50"
                                    >
                                        {isSaving ? 'Saving...' : 'Save Changes'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </StudentLayout>
    );
};

export default StudentProfile;