import { useState, useEffect } from 'react';
import AdminLayout from './AdminLayout';

interface UserProfile {
    full_name: string;
    email: string;
    phone: string;
    employee_id?: string; // Changed from student_id for Admin context
    department?: string;   // Changed from course
    role_title?: string;   // Changed from year_level
}

// Interface for Task to keep the AdminLayout happy
interface Task {
    id: number;
    user_id: number;
    student_name?: string;
    title: string;
    task_description: string;
    status: 'Pending' | 'In-Progress' | 'Completed';
    due_date: string;
}

const AdminProfile = () => {
    const PHP_BRIDGE_URL = 'http://localhost/MentorLog/php-bridge';
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [tasks, setTasks] = useState<Task[]>([]);
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
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        fetchProfile();
        fetchSidebarTasks();
    }, []);

    const fetchSidebarTasks = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/tasks');
            if (response.ok) {
                const data = await response.json();
                setTasks(data);
            }
        } catch (error) {
            console.error("Failed to sync sidebar tasks:", error);
        }
    };

    const fetchProfile = async () => {
        const userId = localStorage.getItem('userId');
        if (!userId) {
            setLoading(false);
            return;
        }

        try {
            const res = await fetch(`${PHP_BRIDGE_URL}/get-profile.php?user_id=${userId}`);
            const data = await res.json();
            
            if (data.success && data.user) {
                const mappedUser: UserProfile = {
                    full_name: data.user.full_name || 'Admin User',
                    email: data.user.email || '',
                    phone: data.user.phone || '',
                    employee_id: data.user.student_id || 'ADM-001', // Reusing student_id field from DB
                    department: data.user.course || 'IT Department',
                    role_title: data.user.year_level || 'System Administrator'
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
                alert("Admin profile updated successfully!");
                setIsEditModalOpen(false);
                await fetchProfile(); 
            } else {
                alert(data.message || "Update failed.");
            }
        } catch (err) {
            console.error("Update error:", err);
            alert("Connection error.");
        } finally {
            setIsSaving(false);
        }
    };

    if (loading) return (
        <AdminLayout tasks={tasks}>
            <div className="flex items-center justify-center h-[60vh]">
                <div className="w-10 h-10 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
            </div>
        </AdminLayout>
    );

    return (
        <AdminLayout tasks={tasks}>
            <div className="max-w-5xl mx-auto space-y-8 pb-12">
                {/* --- HEADER CARD --- */}
                <div className="relative overflow-hidden bg-[#0f172a] rounded-[2.5rem] border border-slate-800 shadow-2xl">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 blur-[100px] -mr-32 -mt-32"></div>
                    
                    <div className="relative p-8 md:p-12 flex flex-col md:flex-row items-center gap-8">
                        <div className="relative group">
                            <div className="w-32 h-32 md:w-40 md:h-40 rounded-3xl bg-linear-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-5xl font-black text-white shadow-2xl border-4 border-slate-900 transition-transform group-hover:scale-105 duration-300">
                                {profile?.full_name?.charAt(0) || 'A'}
                            </div>
                            <div className="absolute -bottom-2 -right-2 bg-blue-500 w-8 h-8 rounded-full border-4 border-[#0f172a] flex items-center justify-center text-[10px] text-white shadow-lg">
                                🛡️
                            </div>
                        </div>

                        <div className="text-center md:text-left space-y-2">
                            <h1 className="text-4xl font-black text-white tracking-tight italic">
                                {profile?.full_name}
                            </h1>
                            <p className="text-blue-400 font-bold tracking-widest uppercase text-xs">
                                {profile?.role_title} — {profile?.department}
                            </p>
                            <div className="flex flex-wrap justify-center md:justify-start gap-3 mt-4">
                                <span className="px-4 py-1.5 bg-slate-900/50 border border-slate-700 rounded-full text-xs font-bold text-slate-400">
                                    ID: {profile?.employee_id}
                                </span>
                                <span className="px-4 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded-full text-xs font-bold text-blue-500">
                                    System Verified
                                </span>
                            </div>
                        </div>

                        <div className="md:ml-auto">
                            <button 
                                onClick={() => setIsEditModalOpen(true)}
                                className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-sm transition-all shadow-lg shadow-blue-600/20 active:scale-95"
                            >
                                Edit Admin Profile
                            </button>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* --- CONTACT INFO --- */}
                    <div className="md:col-span-1">
                        <div className="bg-[#0f172a] p-8 rounded-3xl border border-slate-800 shadow-xl h-full">
                            <h4 className="text-white font-bold mb-6 flex items-center gap-2">
                                <span className="text-blue-500">📧</span> Contact Details
                            </h4>
                            <div className="space-y-6">
                                <div>
                                    <p className="text-[10px] text-slate-500 font-black uppercase mb-1 tracking-tighter">Official Email</p>
                                    <p className="text-slate-200 font-medium text-sm break-all">{profile?.email}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] text-slate-500 font-black uppercase mb-1 tracking-tighter">Phone Extension</p>
                                    <p className="text-slate-200 font-medium text-sm">{profile?.phone || 'Not Configured'}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* --- SYSTEM ROLE SUMMARY --- */}
                    <div className="md:col-span-2 bg-[#0f172a] p-8 rounded-3xl border border-slate-800 shadow-xl">
                        <h4 className="text-white font-bold mb-6 flex items-center gap-2">
                            <span className="text-blue-500">⚙️</span> Administrative Scope
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                            <div className="p-5 bg-slate-900/40 rounded-2xl border border-slate-700/50 hover:border-blue-500/30 transition-colors">
                                <p className="text-[10px] text-blue-400 font-black uppercase mb-1">Access Level</p>
                                <p className="text-2xl font-black text-white">Super Admin</p>
                            </div>
                            <div className="p-5 bg-slate-900/40 rounded-2xl border border-slate-700/50 hover:border-blue-500/30 transition-colors">
                                <p className="text-[10px] text-blue-400 font-black uppercase mb-1">Managed Dept.</p>
                                <p className="text-2xl font-black text-white">IT/Engineering</p>
                            </div>
                        </div>
                        <div className="mt-8 p-4 bg-blue-500/5 rounded-xl border border-blue-500/10 text-[11px] text-slate-400 leading-relaxed">
                            <strong className="text-blue-400 uppercase mr-2">Note:</strong> Profile changes are logged for security auditing purposes. Ensure all contact information remains current for system notifications.
                        </div>
                    </div>
                </div>
            </div>

            {/* --- EDIT MODAL --- */}
            {isEditModalOpen && (
                <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-[#020617]/90 backdrop-blur-md">
                    <div className="bg-[#0f172a] w-full max-w-lg rounded-[2.5rem] border border-slate-800 shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
                        <div className="p-8 md:p-10">
                            <div className="flex justify-between items-center mb-8">
                                <h3 className="text-2xl font-black text-white italic">Update Admin Identity</h3>
                                <button onClick={() => setIsEditModalOpen(false)} className="w-8 h-8 flex items-center justify-center bg-slate-800 rounded-full text-slate-400 hover:text-white transition-colors">✕</button>
                            </div>

                            <form onSubmit={handleUpdate} className="space-y-5">
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-[10px] font-black text-slate-500 uppercase block mb-2 ml-1">Full Name</label>
                                        <input 
                                            type="text" required
                                            className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3.5 text-white focus:border-blue-500/50 outline-none transition-all"
                                            value={formData.full_name}
                                            onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-[10px] font-black text-slate-500 uppercase block mb-2 ml-1">Employee ID</label>
                                            <input 
                                                type="text"
                                                className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3.5 text-white focus:border-blue-500/50 outline-none"
                                                value={formData.employee_id}
                                                onChange={(e) => setFormData({...formData, employee_id: e.target.value})}
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-black text-slate-500 uppercase block mb-2 ml-1">Department</label>
                                            <input 
                                                type="text"
                                                className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3.5 text-white focus:border-blue-500/50 outline-none"
                                                value={formData.department}
                                                onChange={(e) => setFormData({...formData, department: e.target.value})}
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black text-slate-500 uppercase block mb-2 ml-1">Official Email</label>
                                        <input 
                                            type="email" required
                                            className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3.5 text-white focus:border-blue-500/50 outline-none"
                                            value={formData.email}
                                            onChange={(e) => setFormData({...formData, email: e.target.value})}
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black text-slate-500 uppercase block mb-2 ml-1">Phone / Extension</label>
                                        <input 
                                            type="text"
                                            className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3.5 text-white focus:border-blue-500/50 outline-none"
                                            value={formData.phone}
                                            onChange={(e) => setFormData({...formData, phone: e.target.value})}
                                        />
                                    </div>
                                </div>

                                <div className="pt-6 flex gap-3">
                                    <button type="button" onClick={() => setIsEditModalOpen(false)} className="flex-1 px-4 py-4 bg-slate-800 text-slate-400 rounded-2xl font-bold text-sm hover:bg-slate-700 hover:text-white transition-all">Discard</button>
                                    <button type="submit" disabled={isSaving} className="flex-1 px-4 py-4 bg-blue-600 text-white rounded-2xl font-black text-sm hover:bg-blue-500 disabled:opacity-50 shadow-lg shadow-blue-600/20 transition-all">
                                        {isSaving ? 'UPDATING...' : 'SAVE PROFILE'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
};

export default AdminProfile;