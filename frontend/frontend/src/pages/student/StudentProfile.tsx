import { useState, useEffect } from 'react';
import api from '../../services/api';
import { 
    User, Mail, Phone, BookOpen, Award, 
    Edit2, CheckCircle2, ShieldCheck, Download, X 
} from 'lucide-react';

interface UserProfile {
    full_name: string;
    email: string;
    phone: string;
    student_id: string;
    course: string;
    year_level: string;
    ojt_hours_required: number;
}

const pastelAvatarStyles = [
    'bg-purple-100 text-purple-700 border-purple-200',
    'bg-blue-100 text-blue-700 border-blue-200',
    'bg-pink-100 text-pink-700 border-pink-200',
    'bg-emerald-100 text-emerald-700 border-emerald-200',
];

const getInitials = (name?: string) => {
    if (!name) return 'UN';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name.slice(0, 2).toUpperCase();
};

const StudentProfile = () => {
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        full_name: '',
        email: '',
        phone: '',
        student_id: '',
        course: '',
        year_level: ''
    });
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const res = await api.get('/auth/profile');
            const data = res.data;
            const userData = data.user || data;
            
            if (userData) {
                const mappedUser: UserProfile = {
                    full_name: userData.full_name || 'No Name',
                    email: userData.email || '',
                    phone: userData.phone || '',
                    student_id: userData.student_id || '',
                    course: userData.course || 'BS Information Technology',
                    year_level: userData.year_level || '4',
                    ojt_hours_required: Number(userData.ojt_hours_required) || 600
                };

                setProfile(mappedUser);
                setFormData({
                    full_name: mappedUser.full_name,
                    email: mappedUser.email,
                    phone: mappedUser.phone,
                    student_id: mappedUser.student_id,
                    course: mappedUser.course,
                    year_level: mappedUser.year_level
                });
            }
        } catch (err) {
            console.error("Fetch Error:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);

        try {
            const res = await api.put('/auth/profile', {
                full_name: formData.full_name,
                email: formData.email,
                student_id: formData.student_id,
                course: formData.course
            });
            
            if (res.data?.success) {
                alert("Profile updated successfully!");
                setIsEditModalOpen(false);
                await fetchProfile(); 
            } else {
                alert(res.data?.message || "Update failed.");
            }
        } catch (err) {
            console.error("Update Error:", err);
            alert("Failed to update profile.");
        } finally {
            setIsSaving(false);
        }
    };

    if (loading) return (
        <div className="py-20 text-center text-slate-400 text-xs font-medium animate-pulse">
            Loading student profile...
        </div>
    );

    return (
        <div className="space-y-6 max-w-7xl mx-auto">
            
            {/* Top Title & Primary Action Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Student Account Profile</h1>
                    <p className="text-xs text-slate-500 mt-0.5">Manage your personal identification, course details, and academic info</p>
                </div>

                <div className="flex items-center gap-3">
                    <button 
                        onClick={() => setIsEditModalOpen(true)} 
                        className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2.5 rounded-lg shadow-xs transition-all flex items-center gap-2"
                    >
                        <Edit2 className="w-4 h-4" />
                        <span>Edit Profile</span>
                    </button>
                </div>
            </div>

            {/* Profile Overview SaaS Card */}
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs flex flex-col md:flex-row items-center gap-6">
                <div className="w-20 h-20 rounded-full border-2 border-blue-200 bg-blue-50 text-blue-700 font-extrabold text-2xl flex items-center justify-center shrink-0">
                    {getInitials(profile?.full_name)}
                </div>

                <div className="space-y-1 text-center md:text-left flex-1">
                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                        <h2 className="text-xl font-bold text-slate-900">{profile?.full_name}</h2>
                        <span className="px-2.5 py-0.5 text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full inline-flex items-center gap-1">
                            <ShieldCheck className="w-3 h-3" /> Active OJT Intern
                        </span>
                    </div>

                    <p className="text-xs font-semibold text-blue-600">{profile?.course} — Year {profile?.year_level}</p>
                    <p className="text-xs text-slate-500 font-mono">Student ID: {profile?.student_id || 'Not Set'}</p>
                </div>
            </div>

            {/* Grid Metrics & Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Contact Information */}
                <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
                    <div className="border-b border-slate-100 pb-2.5">
                        <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                            <User className="w-4 h-4 text-blue-600" /> Contact Information
                        </h3>
                    </div>

                    <div className="space-y-3 text-xs">
                        <div className="flex items-center gap-3">
                            <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                            <div>
                                <p className="text-[10px] font-semibold text-slate-400 uppercase">Email Address</p>
                                <p className="font-semibold text-slate-800">{profile?.email}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                            <div>
                                <p className="text-[10px] font-semibold text-slate-400 uppercase">Phone Number</p>
                                <p className="font-semibold text-slate-800">{profile?.phone || 'Not provided'}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Internship Program Metrics */}
                <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
                    <div className="border-b border-slate-100 pb-2.5">
                        <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                            <Award className="w-4 h-4 text-blue-600" /> Internship Requirement Metrics
                        </h3>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-xs">
                        <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200">
                            <p className="text-[10px] font-semibold text-slate-500 uppercase">Required Hours</p>
                            <p className="text-2xl font-extrabold text-slate-900 font-mono mt-0.5">{profile?.ojt_hours_required} hrs</p>
                        </div>

                        <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200">
                            <p className="text-[10px] font-semibold text-slate-500 uppercase">Academic Status</p>
                            <p className="text-sm font-bold text-emerald-700 mt-1">Verified Active</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Edit Profile Modal */}
            {isEditModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
                    <div className="bg-white border border-slate-200 w-full max-w-lg rounded-2xl p-6 shadow-2xl space-y-4">
                        <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                            <h3 className="text-base font-bold text-slate-900">Update Profile Information</h3>
                            <button onClick={() => setIsEditModalOpen(false)} className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100">
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <form onSubmit={handleUpdate} className="space-y-4">
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-slate-600">Full Name</label>
                                <input 
                                    type="text" required
                                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 outline-none focus:border-blue-500 focus:bg-white"
                                    value={formData.full_name}
                                    onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-slate-600">Student ID</label>
                                    <input 
                                        type="text"
                                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 outline-none focus:border-blue-500 focus:bg-white"
                                        value={formData.student_id}
                                        onChange={(e) => setFormData({...formData, student_id: e.target.value})}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-slate-600">Year Level</label>
                                    <select 
                                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 outline-none focus:border-blue-500 focus:bg-white"
                                        value={formData.year_level}
                                        onChange={(e) => setFormData({...formData, year_level: e.target.value})}
                                    >
                                        <option value="1">1st Year</option>
                                        <option value="2">2nd Year</option>
                                        <option value="3">3rd Year</option>
                                        <option value="4">4th Year</option>
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-slate-600">Course / Degree Program</label>
                                <input 
                                    type="text"
                                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 outline-none focus:border-blue-500 focus:bg-white"
                                    value={formData.course}
                                    onChange={(e) => setFormData({...formData, course: e.target.value})}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-slate-600">Email Address</label>
                                    <input 
                                        type="email" required
                                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 outline-none focus:border-blue-500 focus:bg-white"
                                        value={formData.email}
                                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-slate-600">Phone Number</label>
                                    <input 
                                        type="text"
                                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 outline-none focus:border-blue-500 focus:bg-white"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                                <button type="button" onClick={() => setIsEditModalOpen(false)} className="px-4 py-2 rounded-lg bg-slate-100 text-slate-600 font-semibold text-xs hover:bg-slate-200 transition-all">Cancel</button>
                                <button type="submit" disabled={isSaving} className="px-4 py-2 bg-blue-600 text-white font-semibold text-xs rounded-lg hover:bg-blue-700 transition-all shadow-xs disabled:opacity-50">
                                    {isSaving ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StudentProfile;