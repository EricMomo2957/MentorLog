import { useNavigate, Link, useLocation } from 'react-router-dom';

const StudentLayout = ({ children }: { children: React.ReactNode }) => {
    const navigate = useNavigate();
    const location = useLocation(); // To highlight active links
    
    // Use the logged-in student's name
    const userName = localStorage.getItem('userName') || 'Student';

    const handleLogout = () => {
        if (window.confirm("Are you sure you want to log out?")) {
            // This removes EVERYTHING: token, role, userName, and userId
            localStorage.clear(); 
            
            // Optional: If you use window.location.href instead of navigate, 
            // it forces a full page reload which clears any remaining React state.
            navigate('/login');
        }
    };

    // Helper to check if a link is active
    const isActive = (path: string) => location.pathname === path;

    return (
        <div className="flex min-h-screen bg-[#0f172a] text-white font-sans">
            {/* STUDENT SIDE NAV */}
            <aside className="w-64 bg-[#1e293b] border-r border-slate-700 p-6 flex flex-col fixed h-full shadow-2xl">
                <div className="mb-10">
                    <h2 className="text-xl font-black text-emerald-400 tracking-tight">MENTOR<span className="text-white">LOG</span></h2>
                    <div className="mt-4 p-3 bg-slate-900/50 rounded-xl border border-slate-700/50">
                        <p className="text-[10px] uppercase font-black text-slate-500 tracking-widest">Logged in as</p>
                        <p className="text-sm text-emerald-400 font-bold truncate">{userName}</p>
                    </div>
                </div>

                <nav className="flex-1 space-y-2">
                    <Link to="/student-dashboard" className={`flex items-center gap-3 p-3 rounded-lg transition-all border ${
                        isActive('/student-dashboard') 
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 font-bold' 
                        : 'text-slate-400 border-transparent hover:bg-slate-700/50 hover:text-white'
                    }`}>
                        🏠 Control Center
                    </Link>
                    
                    <Link to="/my-attendance" className={`flex items-center gap-3 p-3 rounded-lg transition-all border ${
                        isActive('/my-attendance') 
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 font-bold' 
                        : 'text-slate-400 border-transparent hover:bg-slate-700/50 hover:text-white'
                    }`}>
                        📅 My Attendance
                    </Link>

                    <Link to="/tasks" className={`flex items-center gap-3 p-3 rounded-lg transition-all border ${
                        isActive('/tasks') 
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 font-bold' 
                        : 'text-slate-400 border-transparent hover:bg-slate-700/50 hover:text-white'
                    }`}>
                        📝 My Tasks
                    </Link>
                </nav>

                <button 
                    onClick={handleLogout} 
                    className="mt-auto flex items-center justify-center gap-3 p-3 w-full bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white rounded-xl transition-all text-sm font-bold border border-red-500/20"
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
        </div>
    );
};

export default StudentLayout;