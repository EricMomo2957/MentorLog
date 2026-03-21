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
    ];

    return (
        <div className="flex min-h-screen bg-[#0f172a] text-slate-200 font-sans">
            {/* --- SIDEBAR --- */}
            <aside className="w-64 bg-[#1e293b]/50 backdrop-blur-xl border-r border-slate-800 p-6 flex flex-col sticky top-0 h-screen">
                <div className="mb-10 px-2">
                    <h2 className="text-xl font-black tracking-tighter text-white flex items-center gap-2">
                        <span className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-sm">ML</span>
                        MentorLog
                    </h2>
                    <div className="mt-4 p-3 bg-slate-800/50 rounded-xl border border-slate-700/50">
                        <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Authenticated as</p>
                        <p className="text-sm font-semibold text-blue-400 truncate">{userName}</p>
                    </div>
                </div>

                <nav className="flex-1 space-y-1">
                    {navLinks.map((link) => {
                        const isActive = location.pathname === link.path;
                        return (
                            <Link 
                                key={link.path}
                                to={link.path} 
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all group ${
                                    isActive 
                                    ? 'bg-blue-600/10 text-blue-400 border border-blue-500/20 shadow-[0_0_20px_rgba(59,130,246,0.1)]' 
                                    : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-transparent'
                                }`}
                            >
                                <span className={`text-lg transition-transform group-hover:scale-110 ${isActive ? 'grayscale-0' : 'grayscale'}`}>
                                    {link.icon}
                                </span>
                                {link.label}
                            </Link>
                        );
                    })}
                </nav>

                {/* --- LOGOUT SECTION --- */}
                <div className="pt-6 border-t border-slate-800">
                    <button 
                        onClick={handleLogout} 
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-red-400/80 hover:text-red-400 hover:bg-red-500/5 transition-all group"
                    >
                        <svg className="w-5 h-5 transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        Logout Session
                    </button>
                </div>
            </aside>

            {/* --- MAIN CONTENT --- */}
            <main className="flex-1 min-w-0 overflow-auto">
                <div className="max-w-7xl mx-auto p-8 lg:p-12">
                    {children}
                </div>
            </main>
        </div>
    );
};

export default AdminLayout;