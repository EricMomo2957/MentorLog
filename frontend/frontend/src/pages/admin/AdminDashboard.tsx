import { useState, useEffect, useCallback } from 'react';
import { 
    PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, 
    BarChart, Bar, XAxis, YAxis, CartesianGrid 
} from 'recharts';
import TaskFeed from './TaskFeed';

interface User {
    id: number;
    full_name: string;
    email: string;
    role: 'admin' | 'student';
    created_at: string;
}

interface AttendanceLog {
    id: number;
    student_name: string;
    clock_in: string;
    clock_out: string | null;
    status: 'Present' | 'Late' | 'Absent' | 'Excused';
    is_active: boolean;
}

// Updated to match your DB: user_id and strict status enum
interface TaskLog {
    id: number;
    user_id: number; 
    student_name?: string; // Joined from users table in backend
    title: string;
    task_description: string;
    status: 'Pending' | 'In-Progress' | 'Completed';
    due_date: string;
}

const COLORS = ['#10b981', '#f59e0b', '#ef4444', '#3b82f6'];

const AdminDashboard = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [logs, setLogs] = useState<AttendanceLog[]>([]);
    const [tasks, setTasks] = useState<TaskLog[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const fetchAllData = useCallback(async () => {
        setIsLoading(true);
        const token = localStorage.getItem('token');
        const headers = { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        };

        try {
            const [userRes, attRes, taskRes] = await Promise.all([
                fetch('http://localhost:5000/api/admin/users/all', { headers }), 
                fetch('http://localhost:5000/api/attendance/all', { headers }),
                fetch('http://localhost:5000/api/tasks/all', { headers })
            ]);

            const userData = await userRes.json();
            const attData = await attRes.json();
            const taskData = await taskRes.json();

            if (userData.success) setUsers(userData.data || []);
            if (attData.success) setLogs(attData.data || []);
            if (taskData.success) setTasks(taskData.data || []);
            
        } catch (err) {
            console.error("Dashboard Fetch Error:", err);
        } finally {
            setTimeout(() => setIsLoading(false), 400);
        }
    }, []);

    useEffect(() => {
        fetchAllData();
    }, [fetchAllData]);

    // Derived Stats
    const totalUsers = users.length;
    const totalTasks = tasks.length;
    const activeCount = logs.filter(log => log.is_active === true || Number(log.is_active) === 1).length;
    
    const attendanceStats = [
        { name: 'Present', value: logs.filter(l => l.status === 'Present').length },
        { name: 'Late', value: logs.filter(l => l.status === 'Late').length },
        { name: 'Absent', value: logs.filter(l => l.status === 'Absent').length },
        { name: 'Excused', value: logs.filter(l => l.status === 'Excused').length },
    ].filter(item => item.value > 0);

    // Updated Chart Logic: Groups by student_name or user_id
    const taskBarData = Object.values(tasks.reduce((acc: Record<string, {name: string, tasks: number}>, curr) => {
        const identifier = curr.student_name || `ID: ${curr.user_id}`;
        const displayName = identifier.split(' ')[0];
        
        acc[identifier] = { 
            name: displayName,
            tasks: (acc[identifier]?.tasks || 0) + 1 
        };
        return acc;
    }, {}));

    const filteredUsers = users.filter(user => 
        user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalPresentAndLate = logs.filter(l => l.status === 'Present' || l.status === 'Late').length;
    const attendanceRate = logs.length > 0 ? ((totalPresentAndLate / logs.length) * 100).toFixed(0) : 0;

    return (
        <div className="animate-in fade-in duration-500">
            {/* Header Section */}
            <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-white tracking-tight">
                        Admin <span className="text-blue-500">Analytics</span>
                    </h1>
                    <p className="text-slate-400 mt-1">Real-time oversight and user management.</p>
                </div>
                <button 
                    onClick={fetchAllData} 
                    disabled={isLoading}
                    className="p-3 bg-slate-800/50 backdrop-blur-md rounded-xl border border-slate-700 hover:border-blue-500/50 transition-all disabled:opacity-50 group"
                >
                    <svg className={`w-5 h-5 text-blue-400 transition-transform ${isLoading ? 'animate-spin' : 'group-hover:rotate-180'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                {[
                    { label: 'Total Users', val: totalUsers, color: 'text-blue-500', glow: 'shadow-blue-500/10' },
                    { label: 'Total Tasks', val: totalTasks, color: 'text-purple-500', glow: 'shadow-purple-500/10' },
                    { label: 'Active Now', val: activeCount, color: 'text-emerald-500', glow: 'shadow-emerald-500/10' },
                    { label: 'Attendance Rate', val: `${attendanceRate}%`, color: 'text-amber-500', glow: 'shadow-amber-500/10' }
                ].map((stat, i) => (
                    <div key={i} className={`bg-[#1e293b]/50 backdrop-blur-sm p-6 rounded-2xl border border-slate-800 shadow-xl ${stat.glow}`}>
                        <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">{stat.label}</p>
                        <h4 className={`text-3xl font-black mt-2 ${stat.color}`}>
                            {isLoading ? '---' : stat.val}
                        </h4>
                    </div>
                ))}
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                <div className="bg-[#1e293b]/50 backdrop-blur-sm p-8 rounded-4xl border border-slate-800 h-112 shadow-2xl">
                    <h3 className="text-white font-bold mb-8 flex items-center gap-3 text-xs uppercase tracking-[0.2em]">
                        <span className="w-2 h-2 bg-blue-500 rounded-full shadow-[0_0_8px_#3b82f6]"></span> 
                        Attendance Distribution
                    </h3>
                    <div className="h-72 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            {attendanceStats.length > 0 ? (
                                <PieChart>
                                    <Pie data={attendanceStats} innerRadius={70} outerRadius={90} paddingAngle={8} dataKey="value">
                                        {attendanceStats.map((_, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
                                        ))}
                                    </Pie>
                                    <Tooltip 
                                        contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '16px', color: '#fff', fontSize: '12px', fontWeight: 'bold' }} 
                                        itemStyle={{ color: '#94a3b8' }}
                                    />
                                    <Legend verticalAlign="bottom" iconType="circle" wrapperStyle={{ paddingTop: '20px', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '1px' }}/>
                                </PieChart>
                            ) : (
                                <div className="flex items-center justify-center h-full text-slate-500 italic text-sm">No data recorded</div>
                            )}
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-[#1e293b]/50 backdrop-blur-sm p-8 rounded-4xl border border-slate-800 h-112 shadow-2xl">
                    <h3 className="text-white font-bold mb-8 flex items-center gap-3 text-xs uppercase tracking-[0.2em]">
                        <span className="w-2 h-2 bg-purple-500 rounded-full shadow-[0_0_8px_#a855f7]"></span> 
                        Task Submissions
                    </h3>
                    <div className="h-72 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={taskBarData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.5} />
                                <XAxis dataKey="name" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} dy={10} />
                                <YAxis stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} dx={-10} />
                                <Tooltip cursor={{fill: '#334155', opacity: 0.4}} contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px' }} />
                                <Bar dataKey="tasks" fill="#3b82f6" radius={[6, 6, 0, 0]} barSize={30} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Bottom Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between px-2">
                        <h3 className="text-white font-bold text-xs uppercase tracking-[0.2em]">User Directory</h3>
                        <div className="relative group">
                            <input
                                type="text"
                                placeholder="Search records..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="bg-[#1e293b]/80 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/5 outline-none w-64 transition-all"
                            />
                        </div>
                    </div>
                    <div className="bg-[#1e293b]/40 backdrop-blur-md rounded-3xl border border-slate-800 overflow-hidden shadow-2xl">
                        <table className="w-full text-left">
                            <thead className="bg-slate-900/40 text-slate-500 text-[10px] uppercase font-black tracking-[0.2em] border-b border-slate-800">
                                <tr>
                                    <th className="p-6">User Profile</th>
                                    <th className="p-6">System Role</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/40 text-sm">
                                {filteredUsers.length > 0 ? (
                                    filteredUsers.map((user) => (
                                        <tr key={user.id} className="hover:bg-blue-500/2 transition-colors group">
                                            <td className="p-6">
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-slate-200 group-hover:text-blue-400 transition-colors">{user.full_name}</span>
                                                    <span className="text-[11px] text-slate-500 font-mono mt-0.5">{user.email}</span>
                                                </div>
                                            </td>
                                            <td className="p-6">
                                                <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-tighter shadow-sm ${
                                                    user.role === 'admin' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                                                }`}>
                                                    {user.role}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr><td colSpan={2} className="p-10 text-center text-slate-500 italic text-sm">No users found in directory</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="lg:col-span-1">
                    <TaskFeed tasks={tasks} />
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;