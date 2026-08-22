import { useState, useEffect } from 'react';
import api from '../../services/api';
import { 
    User, Mail, Phone, Award, 
    Edit2, ShieldCheck, Download, X, Upload, Camera 
} from 'lucide-react';

interface UserProfile {
    full_name: string;
    email: string;
    phone: string;
    student_id: string;
    course: string;
    year_level: string;
    profile_pic?: string;
    ojt_hours_required: number;
}

const getInitials = (name?: string) => {
    if (!name) return 'UN';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name.slice(0, 2).toUpperCase();
};

const getFullPicUrl = (path?: string) => {
    if (!path) return '';
    if (path.startsWith('http://') || path.startsWith('https://')) return path;
    return `http://localhost:5000${path}`;
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
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
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
                    profile_pic: userData.profile_pic || undefined,
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

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);

        try {
            const uploadData = new FormData();
            uploadData.append('full_name', formData.full_name);
            uploadData.append('email', formData.email);
            uploadData.append('phone', formData.phone);
            uploadData.append('student_id', formData.student_id);
            uploadData.append('course', formData.course);
            uploadData.append('year_level', formData.year_level);

            if (selectedFile) {
                uploadData.append('profile_pic', selectedFile);
            }

            const res = await api.put('/auth/profile', uploadData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            
            if (res.data?.success) {
                alert("Profile updated successfully!");
                setIsEditModalOpen(false);
                setSelectedFile(null);
                setPreviewUrl(null);
                window.dispatchEvent(new Event('profileUpdated'));
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

    const handleDownloadPic = () => {
        if (!profile?.profile_pic) {
            alert("No profile picture uploaded yet.");
            return;
        }
        const imgUrl = getFullPicUrl(profile.profile_pic);
        const link = document.createElement('a');
        link.href = imgUrl;
        link.download = `${profile.full_name.replace(/\s+/g, '_')}_Profile_Pic.jpg`;
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    if (loading) return (
        <div className="py-20 text-center text-slate-400 text-xs font-medium animate-pulse">
            Loading student profile...
        </div>
    );

    const currentPicUrl = profile?.profile_pic ? getFullPicUrl(profile.profile_pic) : null;

    return (
        <div className="space-y-6 max-w-7xl mx-auto">
            
            {/* Top Title & Primary Action Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Student Account Profile</h1>
                    <p className="text-xs text-slate-500 mt-0.5">Manage your personal identification, course details, phone number, and profile image</p>
                </div>

                <div className="flex items-center gap-3">
                    {currentPicUrl && (
                        <button 
                            onClick={handleDownloadPic}
                            className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold px-4 py-2.5 rounded-lg shadow-xs transition-all flex items-center gap-2"
                        >
                            <Download className="w-4 h-4 text-blue-600" />
                            <span>Download Picture</span>
                        </button>
                    )}

                    <button 
                        onClick={() => {
                            setFormData({
                                full_name: profile?.full_name || '',
                                email: profile?.email || '',
                                phone: profile?.phone || '',
                                student_id: profile?.student_id || '',
                                course: profile?.course || '',
                                year_level: profile?.year_level || ''
                            });
                            setPreviewUrl(null);
                            setSelectedFile(null);
                            setIsEditModalOpen(true);
                        }} 
                        className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2.5 rounded-lg shadow-xs transition-all flex items-center gap-2"
                    >
                        <Edit2 className="w-4 h-4" />
                        <span>Edit Profile</span>
                    </button>
                </div>
            </div>

            {/* Profile Overview SaaS Card */}
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs flex flex-col md:flex-row items-center gap-6">
                
                {/* Profile Picture or Initial Badge */}
                <div className="relative group shrink-0">
                    {currentPicUrl ? (
                        <img 
                            src={currentPicUrl} 
                            alt={profile?.full_name} 
                            className="w-24 h-24 rounded-full object-cover border-4 border-slate-100 shadow-md"
                        />
                    ) : (
                        <div className="w-24 h-24 rounded-full border-4 border-blue-100 bg-blue-50 text-blue-700 font-extrabold text-3xl flex items-center justify-center shadow-xs">
                            {getInitials(profile?.full_name)}
                        </div>
                    )}
                </div>

                <div className="space-y-1.5 text-center md:text-left flex-1">
                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                        <h2 className="text-xl font-extrabold text-slate-900">{profile?.full_name}</h2>
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
                    <div className="bg-white border border-slate-200 w-full max-w-lg rounded-2xl p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                            <h3 className="text-base font-bold text-slate-900">Update Profile Information</h3>
                            <button onClick={() => setIsEditModalOpen(false)} className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100">
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <form onSubmit={handleUpdate} className="space-y-4">
                            
                            {/* Profile Picture Upload Field */}
                            <div className="space-y-2 text-center border-b border-slate-100 pb-4">
                                <label className="text-xs font-semibold text-slate-600 block">Profile Picture</label>
                                <div className="flex items-center justify-center gap-4">
                                    <div className="w-16 h-16 rounded-full border-2 border-slate-200 overflow-hidden bg-slate-50 flex items-center justify-center shrink-0">
                                        {previewUrl ? (
                                            <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                                        ) : currentPicUrl ? (
                                            <img src={currentPicUrl} alt="Current" className="w-full h-full object-cover" />
                                        ) : (
                                            <Camera className="w-6 h-6 text-slate-400" />
                                        )}
                                    </div>
                                    <label className="cursor-pointer bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold px-3 py-2 rounded-lg border border-slate-200 transition-all inline-flex items-center gap-1.5">
                                        <Upload className="w-3.5 h-3.5 text-blue-600" />
                                        <span>Upload New Photo</span>
                                        <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                                    </label>
                                </div>
                            </div>

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
                                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 outline-none focus:border-blue-500 focus:bg-white font-mono"
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
                                        placeholder="e.g. +63 912 345 6789"
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