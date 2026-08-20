import { useState, useEffect } from 'react';
import api from '../../services/api';
import { Camera, Upload, Download } from 'lucide-react';

interface UserProfile {
    full_name: string;
    email: string;
    phone: string;
    employee_id?: string;
    department?: string;
    role_title?: string;
    profile_pic?: string;
}

const getFullPicUrl = (path?: string) => {
    if (!path) return '';
    if (path.startsWith('http://') || path.startsWith('https://')) return path;
    return `http://localhost:5000${path}`;
};

const AdminProfile = () => {
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        full_name: '',
        email: '',
        phone: '',
        employee_id: '',
        department: '',
        role_title: ''
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
                    full_name: userData.full_name || 'Admin User',
                    email: userData.email || '',
                    phone: userData.phone || '',
                    employee_id: userData.student_id || 'ADM-001',
                    department: userData.course || 'IT Department',
                    role_title: userData.year_level || 'System Administrator',
                    profile_pic: userData.profile_pic || undefined
                };

                setProfile(mappedUser);
                setFormData({
                    full_name: mappedUser.full_name,
                    email: mappedUser.email,
                    phone: mappedUser.phone,
                    employee_id: mappedUser.employee_id || '',
                    department: mappedUser.department || '',
                    role_title: mappedUser.role_title || ''
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
            uploadData.append('student_id', formData.employee_id);
            uploadData.append('course', formData.department);

            if (selectedFile) {
                uploadData.append('profile_pic', selectedFile);
            }

            const res = await api.put('/auth/profile', uploadData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            
            if (res.data?.success) {
                alert("Admin profile updated successfully!");
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
        link.download = `${profile.full_name.replace(/\s+/g, '_')}_Admin_Pic.jpg`;
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    if (loading) return (
        <div className="flex items-center justify-center h-[60vh]">
            <div className="w-10 h-10 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
        </div>
    );

    const currentPicUrl = profile?.profile_pic ? getFullPicUrl(profile.profile_pic) : null;

    return (
        <>
            <div className="max-w-6xl mx-auto space-y-8 text-slate-200">
                {/* --- HEADER CARD --- */}
                <div className="relative overflow-hidden bg-[#0f172a]/70 backdrop-blur-xl rounded-3xl border border-slate-800/80 shadow-2xl p-8 md:p-12">
                    <div className="absolute top-0 right-0 w-80 h-80 bg-blue-600/10 blur-[100px] -mr-40 -mt-40 pointer-events-none"></div>
                    
                    <div className="relative flex flex-col md:flex-row items-center gap-8">
                        <div className="relative group">
                            {currentPicUrl ? (
                                <img 
                                    src={currentPicUrl} 
                                    alt={profile?.full_name} 
                                    className="w-32 h-32 md:w-36 md:h-36 rounded-3xl object-cover shadow-2xl border-4 border-slate-900 transition-transform group-hover:scale-105 duration-300"
                                />
                            ) : (
                                <div className="w-32 h-32 md:w-36 md:h-36 rounded-3xl bg-linear-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-5xl font-black text-white shadow-2xl border-4 border-slate-900 transition-transform group-hover:scale-105 duration-300">
                                    {profile?.full_name?.charAt(0) || 'A'}
                                </div>
                            )}
                            <div className="absolute -bottom-2 -right-2 bg-blue-500 w-9 h-9 rounded-2xl border-4 border-[#0f172a] flex items-center justify-center text-xs text-white shadow-lg">
                                🛡️
                            </div>
                        </div>

                        <div className="text-center md:text-left space-y-2">
                            <div className="flex items-center justify-center md:justify-start gap-2">
                                <span className="h-2 w-2 bg-emerald-500 rounded-full animate-pulse"></span>
                                <span className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.3em]">Verified Admin Account</span>
                            </div>
                            <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">
                                {profile?.full_name}
                            </h1>
                            <p className="text-blue-400 font-bold text-xs uppercase tracking-wider">
                                {profile?.role_title} — {profile?.department}
                            </p>
                            <div className="flex flex-wrap justify-center md:justify-start gap-2 pt-2">
                                <span className="px-3.5 py-1 bg-slate-900 border border-slate-800 rounded-xl text-xs font-mono text-slate-400">
                                    ID: #{profile?.employee_id}
                                </span>
                                <span className="px-3.5 py-1 bg-blue-500/10 border border-blue-500/20 rounded-xl text-xs font-bold text-blue-400">
                                    Full Authorization
                                </span>
                            </div>
                        </div>

                        <div className="md:ml-auto flex flex-wrap items-center gap-3">
                            {currentPicUrl && (
                                <button 
                                    onClick={handleDownloadPic}
                                    className="px-4 py-3.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 rounded-2xl font-bold text-xs transition-all flex items-center gap-2"
                                >
                                    <Download className="w-4 h-4 text-blue-400" />
                                    <span>Download Pic</span>
                                </button>
                            )}

                            <button 
                                onClick={() => {
                                    setPreviewUrl(null);
                                    setSelectedFile(null);
                                    setIsEditModalOpen(true);
                                }}
                                className="px-6 py-3.5 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-bold text-xs transition-all shadow-lg shadow-blue-600/20 active:scale-95"
                            >
                                Edit Profile Details
                            </button>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-1">
                        <div className="bg-[#0f172a]/70 backdrop-blur-xl p-8 rounded-3xl border border-slate-800/80 shadow-xl h-full space-y-6">
                            <h4 className="text-white font-bold text-sm flex items-center gap-2">
                                <span className="text-blue-400">📧</span> Contact Details
                            </h4>
                            <div className="space-y-4">
                                <div className="bg-slate-900/60 p-4 rounded-2xl border border-slate-800/60">
                                    <p className="text-[10px] text-slate-500 font-bold uppercase mb-1">Official Email</p>
                                    <p className="text-slate-200 font-medium text-xs break-all">{profile?.email}</p>
                                </div>
                                <div className="bg-slate-900/60 p-4 rounded-2xl border border-slate-800/60">
                                    <p className="text-[10px] text-slate-500 font-bold uppercase mb-1">Phone Extension</p>
                                    <p className="text-slate-200 font-medium text-xs">{profile?.phone || 'Not Configured'}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="md:col-span-2 bg-[#0f172a]/70 backdrop-blur-xl p-8 rounded-3xl border border-slate-800/80 shadow-xl space-y-6">
                        <h4 className="text-white font-bold text-sm flex items-center gap-2">
                            <span className="text-blue-400">⚙️</span> System Administrative Scope
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="p-6 bg-slate-900/60 rounded-2xl border border-slate-800/60 hover:border-slate-700 transition-colors space-y-1">
                                <p className="text-[10px] text-blue-400 font-bold uppercase tracking-wider">Access Privilege</p>
                                <p className="text-2xl font-black text-white">Super Admin</p>
                                <p className="text-xs text-slate-500">Unrestricted system control</p>
                            </div>
                            <div className="p-6 bg-slate-900/60 rounded-2xl border border-slate-800/60 hover:border-slate-700 transition-colors space-y-1">
                                <p className="text-[10px] text-blue-400 font-bold uppercase tracking-wider">Department</p>
                                <p className="text-2xl font-black text-white">{profile?.department || 'IT Department'}</p>
                                <p className="text-xs text-slate-500">Active administration scope</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* --- EDIT MODAL --- */}
            {isEditModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#020617]/80 backdrop-blur-md animate-in fade-in duration-200">
                    <div className="bg-[#0f172a] w-full max-w-lg rounded-3xl border border-slate-800 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
                        <div className="p-8 space-y-6">
                            <div className="flex justify-between items-center">
                                <h3 className="text-xl font-bold text-white">Update Profile Details</h3>
                                <button onClick={() => setIsEditModalOpen(false)} className="w-8 h-8 flex items-center justify-center bg-slate-900 border border-slate-800 rounded-xl text-slate-400 hover:text-white transition-colors">✕</button>
                            </div>

                            <form onSubmit={handleUpdate} className="space-y-4">
                                <div className="space-y-2 text-center border-b border-slate-800 pb-4">
                                    <label className="text-xs font-bold text-slate-400 block">Admin Profile Photo</label>
                                    <div className="flex items-center justify-center gap-4">
                                        <div className="w-16 h-16 rounded-2xl border-2 border-slate-800 overflow-hidden bg-slate-900 flex items-center justify-center shrink-0">
                                            {previewUrl ? (
                                                <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                                            ) : currentPicUrl ? (
                                                <img src={currentPicUrl} alt="Current" className="w-full h-full object-cover" />
                                            ) : (
                                                <Camera className="w-6 h-6 text-slate-500" />
                                            )}
                                        </div>
                                        <label className="cursor-pointer bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-bold px-4 py-2.5 rounded-xl border border-slate-800 transition-all inline-flex items-center gap-2">
                                            <Upload className="w-3.5 h-3.5 text-blue-400" />
                                            <span>Upload Photo</span>
                                            <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                                        </label>
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-400">Full Name</label>
                                    <input 
                                        type="text" required
                                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white focus:border-blue-500 outline-none"
                                        value={formData.full_name}
                                        onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-slate-400">Employee ID</label>
                                        <input 
                                            type="text"
                                            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white focus:border-blue-500 outline-none font-mono"
                                            value={formData.employee_id}
                                            onChange={(e) => setFormData({...formData, employee_id: e.target.value})}
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-slate-400">Department</label>
                                        <input 
                                            type="text"
                                            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white focus:border-blue-500 outline-none"
                                            value={formData.department}
                                            onChange={(e) => setFormData({...formData, department: e.target.value})}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-400">Official Email</label>
                                    <input 
                                        type="email" required
                                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white focus:border-blue-500 outline-none"
                                        value={formData.email}
                                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-400">Phone Extension</label>
                                    <input 
                                        type="text"
                                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white focus:border-blue-500 outline-none"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                                    />
                                </div>

                                <div className="pt-4 flex gap-3 border-t border-slate-800">
                                    <button type="button" onClick={() => setIsEditModalOpen(false)} className="w-1/2 py-3 rounded-xl bg-slate-900 text-slate-400 font-bold text-xs hover:bg-slate-800 transition-all">Cancel</button>
                                    <button type="submit" disabled={isSaving} className="w-1/2 bg-blue-600 py-3 rounded-xl text-white font-bold text-xs hover:bg-blue-500 disabled:opacity-50 transition-all shadow-lg shadow-blue-600/20 active:scale-95">
                                        {isSaving ? 'Updating...' : 'Save Profile'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default AdminProfile;