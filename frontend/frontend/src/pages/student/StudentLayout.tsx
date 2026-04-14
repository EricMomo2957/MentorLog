import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import logoPhoto from "../../assets/mentorlogOption.png"; 

const StudentLayout = ({ children }: { children: React.ReactNode }) => {
    const navigate = useNavigate();
    const location = useLocation(); 
    
    const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

    const userName = localStorage.getItem('userName') || 'Student';

    const handleLogout = () => {
        setIsLogoutModalOpen(true);
    };

    const confirmLogout = () => {
        localStorage.clear(); 
        navigate('/login');
    };

    const isActive = (path: string) => location.pathname === path;

    return (
        <div className="flex min-h-screen bg-[#020617] text-slate-200 font-sans">
            {/* --- CSS OVERRIDE TO FORCE REMOVE SCROLLBAR --- */}
            <style>
                {`
                    .no-scrollbar::-webkit-scrollbar {
                        display: none;
                    }
                    .no-scrollbar {
                        -ms-overflow-style: none;
                        scrollbar-width: none;
                    }
                `}
            </style>

            {/* --- SIDE NAVIGATION --- */}
            <aside className="w-72 bg-[#0f172a] border-r border-slate-800/50 flex flex-col fixed h-full shadow-2xl z-40">
                
                {/* Brand Section */}
                <div className="p-8">
                    <div className="flex items-center gap-3 mb-8">
                        <img src={logoPhoto} alt="MentorLog" className="h-10 w-auto drop-shadow-lg" />
                        <h2 className="text-2xl font-black tracking-tighter text-white italic uppercase">
                            MENTOR<span className="text-emerald-400 not-italic">LOG</span>
                        </h2>
                    </div>
                    
                    <div className="p-4 bg-slate-900/80 rounded-2xl border border-slate-800/50 shadow-inner">
                        <p className="text-[10px] uppercase font-bold text-slate-500 tracking-[0.2em] mb-1">Student Session</p>
                        <p className="text-sm text-white font-bold truncate flex items-center gap-2">
                            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                            {userName}
                        </p>
                    </div>
                </div>

                {/* Nav Links - Switched to custom 'no-scrollbar' class */}
                <nav className="flex-1 px-4 space-y-1 overflow-y-auto no-scrollbar">
                    <p className="px-4 text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] mb-4">Main Navigation</p>
                    
                    {[
                        { path: '/student-dashboard', label: 'Control Center', icon: '🏠' },
                        { path: '/tasks', label: 'My Tasks', icon: '📝' },
                        { path: '/campus-events', label: 'Personal Events', icon: '🗓️' },
                        { path: '/submit-feedback', label: 'Student Feedback', icon: '📣' },
                        { path: '/student-request', label: 'Request Paper', icon: '📩' },
                        { path: '/announcements', label: 'Office Bulletin', icon: '📢' },
                    ].map((link) => (
                        <Link 
                            key={link.path}
                            to={link.path} 
                            className={`flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all group border ${
                                isActive(link.path) 
                                ? 'bg-emerald-500/10 text-emerald-400 font-bold border-emerald-500/20 shadow-lg shadow-emerald-500/5' 
                                : 'text-slate-400 border-transparent hover:bg-slate-800/50 hover:text-white'
                            }`}
                        >
                            <span className={`text-lg transition-transform group-hover:scale-110 ${isActive(link.path) ? 'opacity-100' : 'opacity-50'}`}>
                                {link.icon}
                            </span>
                            <span className="text-sm tracking-wide">{link.label}</span>
                        </Link>
                    ))}

                    <div className="pt-8 px-4">
                        <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] mb-4 border-t border-slate-800/50 pt-8">Preference</p>
                    </div>

                    <Link to="/student-profile" className={`flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all border ${isActive('/student-profile') ? 'bg-emerald-500/10 text-emerald-400 font-bold border-emerald-500/20' : 'text-slate-400 border-transparent hover:bg-slate-800/50 hover:text-white'}`}>
                        <span className="text-lg opacity-50">👤</span>
                        <span className="text-sm">My Profile</span>
                    </Link>

                    <Link to="/StudentAsk" className={`flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all border ${isActive('/StudentAsk') ? 'bg-emerald-500/10 text-emerald-400 font-bold border-emerald-500/20' : 'text-slate-400 border-transparent hover:bg-slate-800/50 hover:text-white'}`}>
                        <span className="text-lg opacity-50">❓</span>
                        <span className="text-sm">Ask a Question</span>
                    </Link>

                    <Link to="/settings" className={`flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all border ${isActive('/settings') ? 'bg-emerald-500/10 text-emerald-400 font-bold border-emerald-500/20' : 'text-slate-400 border-transparent hover:bg-slate-800/50 hover:text-white'}`}>
                        <span className="text-lg opacity-50">⚙️</span>
                        <span className="text-sm">Settings</span>
                    </Link>
                </nav>

                {/* Logout Action */}
                <div className="p-4 mt-auto">
                    <button 
                        onClick={handleLogout} 
                        className="flex items-center justify-center gap-3 py-4 w-full bg-slate-900 hover:bg-red-500/10 text-slate-400 hover:text-red-400 rounded-2xl transition-all text-xs font-bold border border-slate-800 hover:border-red-500/20 group uppercase tracking-widest"
                    >
                        <span className="transition-transform group-hover:rotate-12 text-lg">🚪</span> 
                        Sign Out Account
                    </button>
                </div>
            </aside>

            {/* --- MAIN CONTENT --- */}
            <main className="flex-1 ml-72 min-h-screen relative overflow-x-hidden">
                <div className="p-10 max-w-7xl mx-auto">
                    {children}
                </div>
                <div className="fixed top-0 right-0 w-125 h-125 bg-emerald-500/5 blur-[120px] rounded-full -mr-64 -mt-64 pointer-events-none" />
            </main>

            {/* --- LOGOUT MODAL --- */}
            {isLogoutModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-[#0f172a] w-full max-w-sm rounded-[2.5rem] border border-slate-800 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-10 text-center">
                            <div className="w-24 h-24 bg-red-500/10 rounded-full flex items-center justify-center mx-auto text-4xl border border-red-500/20 mb-8 shadow-inner">👋</div>
                            <h3 className="text-2xl font-black text-white mb-3 tracking-tight italic">Leaving so soon?</h3>
                            <p className="text-slate-500 text-sm font-medium mb-10 px-4 leading-relaxed">
                                Make sure your progress is saved before logging out of <span className="text-emerald-400 font-bold">MentorLog</span>.
                            </p>
                            <div className="grid gap-3">
                                <button onClick={confirmLogout} className="w-full py-4 bg-red-600 hover:bg-red-500 text-white rounded-2xl font-black text-xs tracking-widest transition-all shadow-lg shadow-red-600/20 active:scale-95">LOG ME OUT NOW</button>
                                <button onClick={() => setIsLogoutModalOpen(false)} className="w-full py-4 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-2xl font-bold text-xs tracking-widest transition-all active:scale-95">STAY ON DASHBOARD</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StudentLayout;