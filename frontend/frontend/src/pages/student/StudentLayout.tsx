import { useState } from 'react';
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
        <div className="flex min-h-screen bg-[#0f172a] text-white font-sans">
            {/* STUDENT SIDE NAV */}
            <aside className="w-64 bg-[#1e293b] border-r border-slate-700 p-6 flex flex-col fixed h-full shadow-2xl z-40">
                <div className="mb-10">
                    <img src={logoPhoto} alt="MentorLog Logo" className="h-12 w-auto object-contain mb-4 mx-auto block" />
                    
                    <h2 className="text-xl font-black text-emerald-400 tracking-tight text-center">MENTOR<span className="text-white">LOG</span></h2>
                    <div className="mt-4 p-3 bg-slate-900/50 rounded-xl border border-slate-700/50">
                        <p className="text-[10px] uppercase font-black text-slate-500 tracking-widest">Logged in as</p>
                        <p className="text-sm text-emerald-400 font-bold truncate">{userName}</p>
                    </div>
                </div>

                <nav className="flex-1 space-y-2">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2 ml-1">Menu</p>
                    
                    <Link to="/student-dashboard" className={`flex items-center gap-3 p-3 rounded-lg transition-all border ${
                        isActive('/student-dashboard') 
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 font-bold' 
                        : 'text-slate-400 border-transparent hover:bg-slate-700/50 hover:text-white'
                    }`}>
                        🏠 Control Center
                    </Link>
                    

                    <Link to="/tasks" className={`flex items-center gap-3 p-3 rounded-lg transition-all border ${
                        isActive('/tasks') 
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 font-bold' 
                        : 'text-slate-400 border-transparent hover:bg-slate-700/50 hover:text-white'
                    }`}>
                        📝 My Tasks
                    </Link>

                    <Link to="/campus-events" className={`flex items-center gap-3 p-3 rounded-lg transition-all border ${
                        isActive('/campus-events') 
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 font-bold' 
                        : 'text-slate-400 border-transparent hover:bg-slate-700/50 hover:text-white'
                    }`}>
                        🗓️ Campus Events
                    </Link>

                    {/* ADDED: STUDENT REQUEST LINK */}
                    <Link to="/student-request" className={`flex items-center gap-3 p-3 rounded-lg transition-all border ${
                        isActive('/student-request') 
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 font-bold' 
                        : 'text-slate-400 border-transparent hover:bg-slate-700/50 hover:text-white'
                    }`}>
                        📩 Service Request
                    </Link>

                    <div className="pt-6 mt-6 border-t border-slate-800">
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2 ml-1">Account</p>
                        
                        <Link to="/student-profile" className={`flex items-center gap-3 p-3 rounded-lg transition-all border ${
                            isActive('/student-profile') 
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 font-bold' 
                            : 'text-slate-400 border-transparent hover:bg-slate-700/50 hover:text-white'
                        }`}>
                            👤 My Profile
                        </Link>

                        <Link to="/settings" className={`flex items-center gap-3 p-3 rounded-lg transition-all border ${
                            isActive('/settings') 
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 font-bold' 
                            : 'text-slate-400 border-transparent hover:bg-slate-700/50 hover:text-white'
                        }`}>
                            ⚙️ Settings
                        </Link>
                    </div>
                </nav>

                <button 
                    onClick={handleLogout} 
                    className="mt-8 flex items-center justify-center gap-3 p-3 w-full bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white rounded-xl transition-all text-sm font-bold border border-red-500/20"
                >
                    <span className="text-lg">🚪</span> Logout
                </button>
            </aside>

            {/* MAIN CONTENT AREA */}
            <main className="flex-1 ml-64 p-10 bg-[#0f172a]">
                <div className="max-w-7xl mx-auto">
                    {children}
                </div>
            </main>

            {/* LOGOUT CONFIRMATION MODAL */}
            {isLogoutModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
                    <div className="bg-[#1e293b] w-full max-w-sm rounded-4xl border border-slate-700 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-8 text-center">
                            <div className="w-20 h-20 bg-red-500/10 rounded-3xl flex items-center justify-center mx-auto text-3xl border border-red-500/20 mb-6">
                                👋
                            </div>
                            
                            <h3 className="text-2xl font-black text-white mb-2 italic tracking-tight">Ready to leave?</h3>
                            <p className="text-slate-400 text-sm font-medium mb-8">Are you sure you want to log out of <span className="text-emerald-400 font-bold">MentorLog</span>?</p>

                            <div className="flex gap-3">
                                <button 
                                    onClick={confirmLogout}
                                    className="flex-1 py-4 bg-red-500 hover:bg-red-600 text-white rounded-2xl font-black text-sm transition-all shadow-lg shadow-red-500/20"
                                >
                                    YES, LOG ME OUT
                                </button>
                                <button 
                                    onClick={() => setIsLogoutModalOpen(false)}
                                    className="flex-1 py-4 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-2xl font-bold text-sm transition-all"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StudentLayout;