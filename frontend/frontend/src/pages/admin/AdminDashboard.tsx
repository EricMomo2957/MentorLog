import { useState, useEffect, useCallback } from 'react';
import { 
    PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, 
    BarChart, Bar, XAxis, YAxis, CartesianGrid 
} from 'recharts';
import TaskFeed from './TaskFeed';

// --- TYPES ---
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

interface TaskLog {
    id: number;
    user_id: number; 
    student_name?: string; 
    title: string;
    task_description: string;
    status: 'Pending' | 'In-Progress' | 'Completed';
    due_date: string;
}

const COLORS = ['#10b981', '#f59e0b', '#ef4444', '#3b82f6'];
const PHP_BRIDGE_URL = 'http://localhost/MentorLog/php-bridge';

const AdminDashboard = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [logs, setLogs] = useState<AttendanceLog[]>([]);
    const [tasks, setTasks] = useState<TaskLog[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // --- TASK ASSIGNMENT STATE ---
    const [showModal, setShowModal] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState<User | null>(null);
    const [formData, setFormData] = useState({ title: '', description: '', due_date: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);

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

    // --- LOGIC: ASSIGN TASK ---
    const handleAssignTask = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedStudent) {
            console.error("No student selected");
            return;
        }

        setIsSubmitting(true);

        const newTask = {
            user_id: selectedStudent.id,
            title: formData.title,
            task_description: formData.description,
            due_date: formData.due_date
        };

        try {
            const response = await fetch(`${PHP_BRIDGE_URL}/post-task-admin.php`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newTask)
            });
            
            const resText = await response.text();
            const resData = JSON.parse(resText);
            
            if (resData.status === "success") {
                alert(`Task assigned to ${selectedStudent.full_name}!`);
                setShowModal(false);
                setFormData({ title: '', description: '', due_date: '' });
                fetchAllData(); 
            } else {
                alert("Error: " + (resData.message || "Failed to post task"));
            }
        } catch (error) {
            console.error("Assignment failed:", error);
            alert("Connection error. Is the PHP server running?");
        } finally {
            setIsSubmitting(false);
        }
    };

    // --- DERIVED STATS ---
    const totalUsers = users.length;
    const totalTasks = tasks.length;
    const activeCount = logs.filter(log => log.is_active === true || Number(log.is_active) === 1).length;
    
    const attendanceStats = [
        { name: 'Present', value: logs.filter(l => l.status === 'Present').length },
        { name: 'Late', value: logs.filter(l => l.status === 'Late').length },
        { name: 'Absent', value: logs.filter(l => l.status === 'Absent').length },
        { name: 'Excused', value: logs.filter(l => l.status === 'Excused').length },
    ].filter(item => item.value > 0);

    const taskBarData = Object.values(tasks.reduce((acc: Record<string, {name: string, tasks: number}>, curr) => {
        const identifier = curr.student_name || `ID: ${curr.user_id}`;
        const displayName = identifier.split(' ')[0];
        acc[identifier] = { name: displayName, tasks: (acc[identifier]?.tasks || 0) + 1 };
        return acc;
    }, {}));

    const filteredUsers = users.filter(user => 
        user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalPresentAndLate = logs.filter(l => l.status === 'Present' || l.status === 'Late').length;
    const attendanceRate = logs.length > 0 ? ((totalPresentAndLate / logs.length) * 100).toFixed(0) : 0;

    return (
        <div className="animate-in fade-in duration-500 pb-20">
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
                    className="p-3 bg-slate-800/50 backdrop-blur-md rounded-xl border border-slate-700 hover:border-blue-500/50 transition-all disabled:opacity-50"
                >
                    <svg className={`w-5 h-5 text-blue-400 ${isLoading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                        <h4 className={`text-3xl font-black mt-2 ${stat.color}`}>{isLoading ? '---' : stat.val}</h4>
                    </div>
                ))}
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                <div className="bg-[#1e293b]/50 backdrop-blur-sm p-8 rounded-3xl border border-slate-800 h-96 shadow-2xl">
                    <h3 className="text-white font-bold mb-8 text-xs uppercase tracking-[0.2em]">Attendance Distribution</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            {attendanceStats.length > 0 ? (
                                <PieChart>
                                    <Pie data={attendanceStats} innerRadius={60} outerRadius={80} paddingAngle={8} dataKey="value">
                                        {attendanceStats.map((_, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />)}
                                    </Pie>
                                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px' }} />
                                    <Legend verticalAlign="bottom" iconType="circle" wrapperStyle={{ fontSize: '10px' }}/>
                                </PieChart>
                            ) : <div className="text-center py-20 text-slate-500 italic">No logs found</div>}
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-[#1e293b]/50 backdrop-blur-sm p-8 rounded-3xl border border-slate-800 h-96 shadow-2xl">
                    <h3 className="text-white font-bold mb-8 text-xs uppercase tracking-[0.2em]">Task Submissions</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={taskBarData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" />
                                <XAxis dataKey="name" stroke="#64748b" fontSize={10} />
                                <YAxis stroke="#64748b" fontSize={10} />
                                <Tooltip cursor={{fill: '#334155', opacity: 0.4}} contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b' }} />
                                <Bar dataKey="tasks" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={20} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* User Directory + Task Feed */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between px-2">
                        <h3 className="text-white font-bold text-xs uppercase tracking-[0.2em]">User Directory</h3>
                        <input
                            type="text"
                            placeholder="Search students..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="bg-[#1e293b]/80 border border-slate-700 rounded-xl px-4 py-2 text-xs text-white w-64 outline-none"
                        />
                    </div>
                    <div className="bg-[#1e293b]/40 rounded-3xl border border-slate-800 overflow-hidden shadow-2xl">
                        <table className="w-full text-left">
                            <thead className="bg-slate-900/40 text-slate-500 text-[10px] uppercase font-black border-b border-slate-800">
                                <tr>
                                    <th className="p-6">User Profile</th>
                                    <th className="p-6">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/40 text-sm">
                                {filteredUsers.map((user) => (
                                    <tr key={user.id} className="hover:bg-blue-500/5 transition-colors group">
                                        <td className="p-6">
                                            <div className="flex flex-col">
                                                <span className="font-bold text-slate-200">{user.full_name}</span>
                                                <span className="text-[11px] text-slate-500 font-mono">{user.email}</span>
                                            </div>
                                        </td>
                                        <td className="p-6 text-right">
                                            {user.role === 'student' && (
                                                <button 
                                                    onClick={() => { setSelectedStudent(user); setShowModal(true); }}
                                                    className="bg-blue-600/10 text-blue-400 border border-blue-500/20 px-4 py-1.5 rounded-lg text-[10px] font-black uppercase hover:bg-blue-600 hover:text-white transition-all"
                                                >
                                                    Assign Task
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
                <div className="lg:col-span-1">
                    <TaskFeed tasks={tasks} />
                </div>
            </div>

            {/* --- ASSIGN TASK MODAL --- */}
            {showModal && selectedStudent && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-[#1e293b] border border-slate-700 w-full max-w-md rounded-3xl p-8 shadow-2xl">
                        <h2 className="text-xl font-black text-white uppercase tracking-tight mb-2">Assign <span className="text-blue-500">Task</span></h2>
                        <p className="text-slate-400 text-xs mb-6">Assigning to: <span className="text-slate-200 font-bold">{selectedStudent.full_name}</span></p>
                        
                        <form onSubmit={handleAssignTask} className="space-y-4">
                            <div>
                                <label className="text-[10px] font-black uppercase text-slate-500 mb-1.5 block">Task Title</label>
                                <input 
                                    required
                                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:border-blue-500 outline-none"
                                    placeholder="e.g. Weekly Report"
                                    value={formData.title}
                                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-black uppercase text-slate-500 mb-1.5 block">Description</label>
                                <textarea 
                                    required
                                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white h-24 focus:border-blue-500 outline-none"
                                    placeholder="Describe the objective..."
                                    value={formData.description}
                                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-black uppercase text-slate-500 mb-1.5 block">Due Date</label>
                                <input 
                                    required
                                    type="date"
                                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:border-blue-500 outline-none"
                                    value={formData.due_date}
                                    onChange={(e) => setFormData({...formData, due_date: e.target.value})}
                                />
                            </div>
                            <div className="flex gap-3 pt-4">
                                <button 
                                    type="button" 
                                    disabled={isSubmitting}
                                    onClick={() => setShowModal(false)} 
                                    className="flex-1 px-4 py-3 text-xs font-black uppercase text-slate-400 hover:text-white transition-colors disabled:opacity-50"
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit" 
                                    disabled={isSubmitting}
                                    className="flex-1 bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-xl text-xs font-black uppercase tracking-wider shadow-lg shadow-blue-900/40 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isSubmitting ? 'Sending...' : 'Send Task'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;