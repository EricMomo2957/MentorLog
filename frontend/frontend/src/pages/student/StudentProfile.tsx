import { useState, useEffect } from 'react';
import StudentLayout from './StudentLayout';

interface UserProfile {
    full_name: string;
    email: string;
    phone: string;
    student_id: string; // e.g., "21103456"
    course: string;     // e.g., "BS Information Technology"
    year_level: string;
    ojt_hours_required: number;
    profile_image?: string;
}

const StudentProfile = () => {
    const PHP_BRIDGE_URL = 'http://localhost/MentorLog/php-bridge';
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProfile = async () => {
            const userId = localStorage.getItem('userId');
            try {
                const res = await fetch(`${PHP_BRIDGE_URL}/get-profile.php?user_id=${userId}`);
                const data = await res.json();
                if (data.success) {
                    setProfile(data.user);
                }
            } catch (err) {
                console.error("Error fetching profile:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    if (loading) return (
        <StudentLayout>
            <div className="flex items-center justify-center h-[60vh]">
                <div className="w-10 h-10 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
            </div>
        </StudentLayout>
    );

    return (
        <StudentLayout>
            <div className="max-w-5xl mx-auto space-y-8 pb-12 px-4">
                {/* Profile Header Card */}
                <div className="relative overflow-hidden bg-[#1e293b] rounded-[2.5rem] border border-slate-800 shadow-2xl">
                    {/* Decorative Background Accent */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 blur-[100px] -mr-32 -mt-32"></div>
                    
                    <div className="relative p-8 md:p-12 flex flex-col md:flex-row items-center gap-8">
                        {/* Avatar Section */}
                        <div className="relative">
                            <div className="w-32 h-32 md:w-40 md:h-40 rounded-3xl bg-linear-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-5xl font-black text-white shadow-2xl border-4 border-slate-900">
                                {profile?.full_name?.charAt(0) || 'S'}
                            </div>
                            <div className="absolute -bottom-2 -right-2 bg-emerald-500 w-8 h-8 rounded-full border-4 border-[#1e293b] flex items-center justify-center text-[10px] text-white">
                                ✔️
                            </div>
                        </div>

                        {/* Basic Info */}
                        <div className="text-center md:text-left space-y-2">
                            <h1 className="text-4xl font-black text-white tracking-tight">{profile?.full_name}</h1>
                            <p className="text-blue-400 font-bold tracking-widest uppercase text-xs">{profile?.course} — Year {profile?.year_level}</p>
                            <div className="flex flex-wrap justify-center md:justify-start gap-3 mt-4">
                                <span className="px-4 py-1.5 bg-slate-900/50 border border-slate-700 rounded-full text-xs font-bold text-slate-400">ID: {profile?.student_id}</span>
                                <span className="px-4 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-xs font-bold text-emerald-500">Active OJT</span>
                            </div>
                        </div>

                        {/* Quick Action */}
                        <div className="md:ml-auto">
                            <a href="/settings" className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold text-sm transition-all border border-slate-700">
                                Edit Profile
                            </a>
                        </div>
                    </div>
                </div>

                {/* Detail Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Contact Information */}
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

                    {/* OJT Details / Bio */}
                    <div className="md:col-span-2 bg-[#1e293b] p-8 rounded-3xl border border-slate-800 shadow-xl">
                        <h4 className="text-white font-bold mb-6 flex items-center gap-2">
                            <span>🚀</span> Internship Summary
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                            <div className="p-4 bg-slate-900/40 rounded-2xl border border-slate-700/50">
                                <p className="text-[10px] text-blue-400 font-black uppercase mb-1">Target Hours</p>
                                <p className="text-2xl font-black text-white">{profile?.ojt_hours_required} hrs</p>
                            </div>
                            <div className="p-4 bg-slate-900/40 rounded-2xl border border-slate-700/50">
                                <p className="text-[10px] text-purple-400 font-black uppercase mb-1">OJT Category</p>
                                <p className="text-2xl font-black text-white">Full-Stack Dev</p>
                            </div>
                        </div>

                        <div className="mt-8">
                            <h5 className="text-xs font-black text-slate-500 uppercase mb-4 tracking-widest">Supervisor Note</h5>
                            <p className="text-slate-400 text-sm leading-relaxed italic">
                                "Student is currently assigned to the main office for web development tasks focusing on internal dashboard optimization."
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </StudentLayout>
    );
};

export default StudentProfile;