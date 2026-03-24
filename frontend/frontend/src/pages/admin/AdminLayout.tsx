import { useNavigate, Link, useLocation } from 'react-router-dom';

const AdminLayout = ({ children }: { children: React.ReactNode }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const userName = localStorage.getItem('userName') || 'Admin';

    const handleLogout = () => {
        localStorage.clear();
        navigate('/login');
    };

    const navLinks = [
        { path: '/admin-dashboard', label: 'Control Center', icon: '📊' },
        { path: '/manage-attendance', label: 'Student Attendance', icon: '📅' },
        { path: '/reports', label: 'Weekly Reports', icon: '📈' },
        { path: '/admin-settings', label: 'Settings', icon: '⚙️' },
    ];

    return (
        <div className="flex min-h-screen bg-[#020617] text-slate-200 font-sans selection:bg-blue-500/30">
            {/* --- SIDEBAR --- */}
            <aside className="w-72 bg-[#0f172a]/80 backdrop-blur-2xl border-r border-slate-800/60 p-6 flex flex-col sticky top-0 h-screen z-50">
                {/* Brand Logo */}
                <div className="mb-10 px-2">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-linear-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-500/20 font-black">
                            ML
                        </div>
                        <div>
                            <h2 className="text-xl font-black tracking-tight text-white leading-none">MentorLog</h2>
                            <span className="text-[10px] text-blue-400 font-bold uppercase tracking-[0.2em]">Admin Suite</span>
                        </div>
                    </div>

                    {/* Compact User Profile Card */}
                    <div className="mt-8 p-4 bg-slate-800/40 rounded-2xl border border-slate-700/50 backdrop-blur-sm group hover:border-blue-500/30 transition-colors">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs border border-slate-600 group-hover:border-blue-400 transition-colors">
                                👤
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">System Admin</p>
                                <p className="text-sm font-bold text-slate-200 truncate group-hover:text-blue-400 transition-colors">{userName}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Navigation Menu */}
                <nav className="flex-1 space-y-1.5">
                    {navLinks.map((link) => {
                        const isActive = location.pathname === link.path;
                        return (
                            <Link 
                                key={link.path}
                                to={link.path} 
                                className={`relative flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all group overflow-hidden ${
                                    isActive 
                                    ? 'text-white bg-blue-600/10' 
                                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/50'
                                }`}
                            >
                                {/* Active Indicator Bar */}
                                {isActive && (
                                    <div className="absolute left-0 top-2 bottom-2 w-1 bg-blue-500 rounded-r-full shadow-[0_0_10px_#3b82f6]" />
                                )}

                                <span className={`text-lg transition-all duration-300 ${
                                    isActive ? 'scale-110 drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]' : 'grayscale group-hover:grayscale-0'
                                }`}>
                                    {link.icon}
                                </span>
                                {link.label}
                            </Link>
                        );
                    })}
                </nav>

                {/* Logout Button */}
                <div className="pt-6 border-t border-slate-800/60">
                    <button 
                        onClick={handleLogout} 
                        className="w-full flex items-center justify-between px-5 py-3.5 rounded-xl text-sm font-bold text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all group border border-transparent hover:border-red-500/20"
                    >
                        <div className="flex items-center gap-3">
                            <svg className="w-5 h-5 transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                            Logout
                        </div>
                        <span className="text-[10px] bg-slate-800 group-hover:bg-red-500/20 px-2 py-0.5 rounded uppercase tracking-tighter">Exit</span>
                    </button>
                </div>
            </aside>

            {/* --- MAIN CONTENT --- */}
            <main className="flex-1 min-w-0 bg-linear-to-br from-[#020617] via-[#0f172a] to-[#020617] relative">
                {/* Background Decor */}
                <div className="absolute top-0 right-0 w-125 h-125 bg-blue-600/5 blur-[120px] rounded-full -mr-64 -mt-64 pointer-events-none" />
                
                <div className="relative max-w-7xl mx-auto p-8 lg:p-12 min-h-screen">
                    {children}
                </div>
            </main>
        </div>
    );
};

export default AdminLayout;