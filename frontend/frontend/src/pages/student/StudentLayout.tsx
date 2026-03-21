import { useNavigate, Link } from 'react-router-dom';

const StudentLayout = ({ children }: { children: React.ReactNode }) => {
    const navigate = useNavigate();
    // Use the logged-in student's name
    const userName = localStorage.getItem('userName') || 'Student';

    const handleLogout = () => {
        localStorage.clear();
        navigate('/login');
    };

    return (
        <div className="flex min-h-screen bg-[#0f172a] text-white font-sans">
            {/* STUDENT SIDE NAV */}
            <aside className="w-64 bg-[#1e293b] border-r border-slate-700 p-6 flex flex-col fixed h-full">
                <div className="mb-10">
                    <h2 className="text-xl font-bold text-emerald-400 tracking-tight">STUDENT PORTAL</h2>
                    <p className="text-xs text-slate-400 mt-1 italic">Welcome, {userName}</p>
                </div>

                <nav className="flex-1 space-y-2">
                    <Link to="/student-dashboard" className="flex items-center gap-3 p-3 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 transition-all hover:bg-emerald-500/20">
                        🏠 Control Center
                    </Link>
                    <Link to="/my-attendance" className="flex items-center gap-3 p-3 rounded-lg text-slate-400 hover:bg-slate-700/50 hover:text-white transition-all">
                        📅 My Attendance
                    </Link>
                    <Link to="/tasks" className="flex items-center gap-3 p-3 rounded-lg text-slate-400 hover:bg-slate-700/50 hover:text-white transition-all">
                        📝 My Tasks
                    </Link>
                </nav>

                <button 
                    onClick={handleLogout} 
                    className="mt-auto flex items-center gap-3 p-3 text-red-400 hover:bg-red-500/10 rounded-lg transition-all text-sm font-semibold"
                >
                    Logout
                </button>
            </aside>

            {/* MAIN CONTENT AREA (Pushed right by sidebar width) */}
            <main className="flex-1 ml-64 p-10">
                {children}
            </main>
        </div>
    );
};

export default StudentLayout;