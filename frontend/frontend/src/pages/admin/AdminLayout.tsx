import { useNavigate, Link } from 'react-router-dom';

const AdminLayout = ({ children }: { children: React.ReactNode }) => {
    const navigate = useNavigate();
    const userName = localStorage.getItem('userName');

    const handleLogout = () => {
        localStorage.clear();
        navigate('/login');
    };

    return (
        <div className="flex min-h-screen bg-[#0f172a] text-white">
            {/* ADMIN ONLY SIDEBAR */}
            <aside className="w-64 bg-[#1e293b] border-r border-slate-700 p-6 flex flex-col">
                <div className="mb-10">
                    <h2 className="text-xl font-bold text-blue-400">ADMIN PANEL</h2>
                    <p className="text-xs text-slate-400">Welcome, {userName}</p>
                </div>
                <nav className="flex-1 space-y-2">
                    <Link to="/admin-dashboard" className="block p-3 rounded-lg hover:bg-blue-600/20 text-blue-400 border border-transparent hover:border-blue-500/50 transition-all">
                        📊 Control Center
                    </Link>
                    <Link to="/manage-attendance" className="block p-3 rounded-lg hover:bg-slate-700 transition-colors">
                        📅 Student Attendance
                    </Link>
                    <Link to="/reports" className="block p-3 rounded-lg hover:bg-slate-700 transition-colors">
                        📈 Weekly Reports
                    </Link>
                </nav>
                <button onClick={handleLogout} className="mt-auto text-red-400 hover:text-red-300 text-left p-3">
                    Logout
                </button>
            </aside>

            {/* MAIN CONTENT AREA */}
            <main className="flex-1 p-10">
                {children}
            </main>
        </div>
    );
};

export default AdminLayout;