import { useState, useEffect, useCallback } from 'react';
import AdminLayout from './AdminLayout';
import { 
    PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, 
    BarChart, Bar, XAxis, YAxis, CartesianGrid 
} from 'recharts';
import TaskFeed from './TaskFeed';

// Updated interface to match your phpMyAdmin structure
interface User {
    id: number;
    full_name: string;
    email: string;
    password?: string; // Included but usually not used in frontend
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

interface TaskLog {
    id: number;
    student_name: string;
    title: string;
    task_description: string;
    status: string;
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
            // FIXED: Added /admin to the user route
            fetch('http://localhost:5000/api/admin/users/all', { headers }), 
            fetch('http://localhost:5000/api/attendance/all', { headers }),
            fetch('http://localhost:5000/api/tasks/all', { headers })
        ]);

        const userData = await userRes.json();
        const attData = await attRes.json();
        const taskData = await taskRes.json();

        // Check if data exists in the .data property (matching your controller's structure)
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
    
    // Fixed:attendanceStats is now used
    const attendanceStats = [
        { name: 'Present', value: logs.filter(l => l.status === 'Present').length },
        { name: 'Late', value: logs.filter(l => l.status === 'Late').length },
        { name: 'Absent', value: logs.filter(l => l.status === 'Absent').length },
        { name: 'Excused', value: logs.filter(l => l.status === 'Excused').length },
    ].filter(item => item.value > 0);

    const taskBarData = Object.values(tasks.reduce((acc: Record<string, {name: string, tasks: number}>, curr) => {
        const displayName = curr.student_name ? curr.student_name.split(' ')[0] : 'Unknown';
        acc[curr.student_name] = { 
            name: displayName,
            tasks: (acc[curr.student_name]?.tasks || 0) + 1 
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
        <AdminLayout>
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
                    className="p-3 bg-slate-800 rounded-xl border border-slate-700 hover:border-blue-500 transition-all disabled:opacity-50"
                >
                    <svg className={`w-5 h-5 text-blue-400 ${isLoading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                {[
                    { label: 'Total Users', val: totalUsers, color: 'text-blue-500' },
                    { label: 'Total Tasks', val: totalTasks, color: 'text-purple-500' },
                    { label: 'Active Now', val: activeCount, color: 'text-emerald-500' },
                    { label: 'Attendance Rate', val: `${attendanceRate}%`, color: 'text-amber-500' }
                ].map((stat, i) => (
                    <div key={i} className="bg-[#1e293b] p-6 rounded-2xl border border-slate-800 shadow-xl">
                        <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">{stat.label}</p>
                        <h4 className={`text-3xl font-bold mt-2 ${stat.color}`}>
                            {isLoading ? '...' : stat.val}
                        </h4>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                <div className="bg-[#1e293b] p-6 rounded-3xl border border-slate-800 h-96 shadow-2xl">
                    <h3 className="text-white font-bold mb-6 flex items-center gap-2 text-sm uppercase tracking-wider">
                        <span className="w-2 h-2 bg-blue-500 rounded-full"></span> Attendance Distribution
                    </h3>
                    <div className="h-62.5 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            {attendanceStats.length > 0 ? (
                                <PieChart>
                                    <Pie data={attendanceStats} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                                        {attendanceStats.map((_, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
                                        ))}
                                    </Pie>
                                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '12px', color: '#fff' }} />
                                    <Legend verticalAlign="bottom" height={36}/>
                                </PieChart>
                            ) : (
                                <div className="flex items-center justify-center h-full text-slate-500 italic text-sm">No data recorded</div>
                            )}
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-[#1e293b] p-6 rounded-3xl border border-slate-800 h-96 shadow-2xl">
                    <h3 className="text-white font-bold mb-6 flex items-center gap-2 text-sm uppercase tracking-wider">
                        <span className="w-2 h-2 bg-purple-500 rounded-full"></span> Task Submissions
                    </h3>
                    <div className="h-62.5 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={taskBarData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" />
                                <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                                <Tooltip cursor={{fill: '#2d3748'}} contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '12px' }} />
                                <Bar dataKey="tasks" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-white font-bold text-sm uppercase tracking-widest">User Directory</h3>
                        <input
                            type="text"
                            placeholder="Search users..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="bg-[#1e293b] border border-slate-800 rounded-xl px-4 py-2 text-xs text-white focus:border-blue-500 outline-none w-64"
                        />
                    </div>
                    <div className="bg-[#1e293b] rounded-2xl border border-slate-800 overflow-hidden shadow-2xl">
                        <table className="w-full text-left">
                            <thead className="bg-slate-900/50 text-slate-500 text-[10px] uppercase font-black tracking-widest border-b border-slate-800">
                                <tr>
                                    <th className="p-5">Name</th>
                                    <th className="p-5">Email</th>
                                    <th className="p-5">Role</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/50 text-sm">
                                {filteredUsers.length > 0 ? (
                                    filteredUsers.map((user) => (
                                        <tr key={user.id} className="hover:bg-slate-800/30 transition-colors">
                                            <td className="p-5 font-bold text-slate-200">{user.full_name}</td>
                                            <td className="p-5 text-slate-400 font-mono text-xs">{user.email}</td>
                                            <td className="p-5">
                                                <span className={`px-2 py-1 rounded-md text-[9px] font-black uppercase ${
                                                    user.role === 'admin' ? 'bg-purple-500/10 text-purple-400' : 'bg-blue-500/10 text-blue-400'
                                                }`}>
                                                    {user.role}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr><td colSpan={3} className="p-5 text-center text-slate-500">No users found</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="lg:col-span-1">
                    <TaskFeed tasks={tasks} />
                </div>
            </div>
        </AdminLayout>
    );
};

export default AdminDashboard;