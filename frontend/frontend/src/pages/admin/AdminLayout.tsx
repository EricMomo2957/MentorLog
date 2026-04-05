import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import TaskFeed from './TaskFeed'; 
import logoPhoto from '../../assets/mentorlogOption.png'; 

interface Task {
    id: number;
    user_id: number;
    student_name?: string;
    title: string;
    task_description: string;
    status: 'Pending' | 'In-Progress' | 'Completed';
    due_date: string;
}

interface AdminLayoutProps {
    children: React.ReactNode;
    tasks?: Task[]; 
}

const AdminLayout = ({ children, tasks = [] }: AdminLayoutProps) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [showLogoutModal, setShowLogoutModal] = useState(false); 
    const userName = localStorage.getItem('userName') || 'Admin';

    const confirmLogout = () => {
        localStorage.clear();
        navigate('/login');
    };

    // --- UPDATED NAVIGATION LINKS (Calendar Added) ---
    const navLinks = [
        { path: '/admin-dashboard', label: 'Control Center', icon: '📊' },
        { path: '/manage-students', label: 'Student Directory', icon: '👥' },
        { path: '/manage-attendance', label: 'Attendance Logs', icon: '📅' },
        { path: '/admin-calendar', label: 'Schedules & Events', icon: '🗓️' }, // Added Calendar
        { path: '/manage-tasks', label: 'Tasks', icon: '📝' },
        { path: '/admin-profile', label: 'My Profile', icon: '👤' },
        { path: '/admin-settings', label: 'Settings', icon: '⚙️' },
    ];

    return (
        <div className="flex min-h-screen bg-[#020617] text-slate-200 font-sans selection:bg-blue-500/30">
            {/* --- SIDEBAR --- */}
            <aside className="w-80 bg-[#0f172a]/80 backdrop-blur-2xl border-r border-slate-800/60 p-6 flex flex-col sticky top-0 h-screen z-50">
                <div className="mb-10 px-2 shrink-0">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="relative group">
                            <div className="absolute -inset-1 bg-blue-500/20 rounded-xl blur opacity-25 group-hover:opacity-50 transition duration-300"></div>
                            <img 
                                src={logoPhoto} 
                                alt="Logo" 
                                className="relative w-12 h-12 object-contain rounded-xl"
                            />
                        </div>
                        <div>
                            <h2 className="text-xl font-black tracking-tight text-white leading-none">MentorLog</h2>
                            <span className="text-[10px] text-blue-400 font-bold uppercase tracking-[0.2em]">Admin Suite</span>
                        </div>
                    </div>

                    <Link 
                        to="/admin-profile" 
                        className={`block p-4 rounded-2xl border transition-all shadow-inner group/profile ${
                            location.pathname === '/admin-profile' 
                            ? 'bg-blue-600/10 border-blue-500/40' 
                            : 'bg-slate-800/40 border-slate-700/50 hover:bg-slate-800/60 hover:border-slate-600'
                        }`}
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-xs group-hover/profile:scale-110 transition-transform">
                                👤
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold group-hover/profile:text-blue-400 transition-colors">System Admin</p>
                                <p className="text-sm font-bold text-slate-200 truncate">{userName}</p>
                            </div>
                            <div className="text-slate-600 group-hover/profile:text-blue-400 transition-colors text-xs">
                                ➔
                            </div>
                        </div>
                    </Link>
                </div>

                {/* --- MAIN NAV --- */}
                <nav className="flex-1 overflow-y-auto space-y-1.5 mb-8 pr-2 custom-scrollbar">
                    {navLinks.map((link) => {
                        const isActive = location.pathname === link.path;
                        return (
                            <Link 
                                key={link.path}
                                to={link.path} 
                                className={`relative flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all group ${
                                    isActive ? 'text-white bg-blue-600/10 border border-blue-500/20' : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/50 border border-transparent'
                                }`}
                            >
                                {isActive && <div className="absolute left-0 top-2 bottom-2 w-1 bg-blue-500 rounded-r-full shadow-[0_0_10px_#3b82f6]" />}
                                <span className="text-lg">{link.icon}</span>
                                {link.label}
                            </Link>
                        );
                    })}
                </nav>

                {/* --- FEED SECTION --- */}
                <div className="h-48 mb-6 shrink-0 border-t border-slate-800/40 pt-4">
                    <TaskFeed tasks={tasks} />
                </div>

                <div className="pt-6 border-t border-slate-800/60 shrink-0">
                    <button 
                        onClick={() => setShowLogoutModal(true)} 
                        className="w-full flex items-center justify-between px-5 py-3.5 rounded-xl text-sm font-bold text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all group border border-transparent hover:border-red-500/20"
                    >
                        <div className="flex items-center gap-3">
                            <svg className="w-5 h-5 transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                            Logout Session
                        </div>
                    </button>
                </div>
            </aside>

            {/* --- CONTENT AREA --- */}
            <main className="flex-1 min-w-0 bg-linear-to-br from-[#020617] via-[#0f172a] to-[#020617] relative overflow-y-auto">
                <div className="absolute top-0 right-0 w-125 h-125 bg-blue-600/5 blur-[120px] rounded-full -mr-64 -mt-64 pointer-events-none" />
                <div className="relative max-w-7xl mx-auto p-8 lg:p-12 min-h-screen">
                    {children}
                </div>
            </main>

            {/* --- LOGOUT MODAL --- */}
            {showLogoutModal && (
                <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-[#020617]/80 backdrop-blur-md animate-in fade-in duration-200">
                    <div className="bg-[#0f172a] w-full max-w-sm rounded-[2.5rem] border border-slate-800 shadow-2xl p-8 text-center animate-in zoom-in-95 duration-200">
                        <div className="w-20 h-20 bg-blue-500/10 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-blue-500/20">
                            <img src={logoPhoto} className="w-10 h-10 object-contain opacity-80" alt="MentorLog" />
                        </div>
                        
                        <h3 className="text-2xl font-black text-white mb-2 italic tracking-tight">End Session?</h3>
                        <p className="text-slate-400 text-sm font-medium mb-8">
                            Are you sure you want to log out of the <span className="text-blue-400 font-bold">Admin Suite</span>?
                        </p>

                        <div className="flex flex-col gap-3">
                            <button 
                                onClick={confirmLogout}
                                className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black text-sm transition-all shadow-lg shadow-blue-600/20"
                            >
                                YES, LOGOUT
                            </button>
                            <button 
                                onClick={() => setShowLogoutModal(false)}
                                className="w-full py-4 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-2xl font-bold text-sm transition-all"
                            >
                                STAY LOGGED IN
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminLayout;