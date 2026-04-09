import { useState, useEffect, useCallback } from 'react';
import { 
    PieChart, Pie, Cell, ResponsiveContainer, Tooltip, 
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
    is_active: boolean | number; 
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

// Fixed type for the reduce accumulator to avoid 'any' error
interface ChartData {
    name: string;
    tasks: number;
}

const PHP_BRIDGE_URL = 'http://localhost/MentorLog/php-bridge';
const LEDGER_THEME = ['#0ea5e9', '#334155', '#475569', '#1e293b']; 

const AdminDashboard = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [logs, setLogs] = useState<AttendanceLog[]>([]);
    const [tasks, setTasks] = useState<TaskLog[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState<User | null>(null);
    const [formData, setFormData] = useState({ title: '', description: '', due_date: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const fetchAllData = useCallback(async () => {
        setIsLoading(true);
        const token = localStorage.getItem('token');
        const headers = { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };
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
            console.error("Fetch Error:", err);
        } finally {
            // Prevent state updates if component unmounts (optional but cleaner)
            setIsLoading(false);
        }
    }, []);

    useEffect(() => { 
        fetchAllData(); 
    }, [fetchAllData]);

    const handleAssignTask = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedStudent) return;
        setIsSubmitting(true);
        try {
            const response = await fetch(`${PHP_BRIDGE_URL}/post-task-admin.php`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user_id: selectedStudent.id,
                    title: formData.title,
                    task_description: formData.description,
                    due_date: formData.due_date
                })
            });
            const resData = await response.json();
            if (resData.status === "success") {
                setShowModal(false);
                setFormData({ title: '', description: '', due_date: '' });
                fetchAllData(); 
            }
        } catch (error) { 
            console.error(error); 
        } finally { 
            setIsSubmitting(false); 
        }
    };

    // Stats Logic
    const activeSessions = logs.filter(l => l.is_active === true || l.is_active === 1).length;
    const totalPresentAndLate = logs.filter(l => l.status === 'Present' || l.status === 'Late').length;
    const attendanceRate = logs.length > 0 ? ((totalPresentAndLate / logs.length) * 100).toFixed(1) : "0.0";
    
    const attendanceStats = [
        { name: 'Present', value: logs.filter(l => l.status === 'Present').length },
        { name: 'Late', value: logs.filter(l => l.status === 'Late').length },
        { name: 'Absent', value: logs.filter(l => l.status === 'Absent').length },
        { name: 'Excused', value: logs.filter(l => l.status === 'Excused').length },
    ].filter(item => item.value > 0);

    // Corrected the 'any' error by providing proper Record types
    const taskBarData = Object.values(tasks.reduce((acc: Record<string, ChartData>, curr) => {
        const name = (curr.student_name || `ID:${curr.user_id}`).split(' ')[0];
        if (!acc[name]) {
            acc[name] = { name, tasks: 0 };
        }
        acc[name].tasks += 1;
        return acc;
    }, {}));

    return (
        <div className="font-mono text-slate-300">
            {/* --- TOP HUD --- */}
            <div className="flex flex-col md:flex-row justify-between items-end mb-12 border-b-2 border-slate-800 pb-6">
                <div className="space-y-1">
                    <div className="text-blue-500 text-[10px] font-black tracking-[0.4em] uppercase">SYSTEM_ANALYTICS_v2.0</div>
                    <h1 className="text-4xl font-black text-white italic tracking-tighter uppercase">Administrative <span className="not-italic text-slate-600">Overview</span></h1>
                </div>
                <button 
                    onClick={fetchAllData}
                    className="p-4 border border-slate-800 bg-slate-900/50 hover:border-blue-500/50 transition-all group"
                >
                    <div className={`w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full ${isLoading ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'}`} />
                </button>
            </div>

            {/* --- METRIC TABLE GRID --- */}
            <div className="grid grid-cols-2 lg:grid-cols-4 border-t border-l border-slate-800 mb-12 shadow-2xl">
                {[
                    { label: 'USER_REGISTRY', val: users.length, unit: 'UID' },
                    { label: 'TASK_PENDING', val: tasks.length, unit: 'LOG' },
                    { label: 'ACTIVE_SESSION', val: activeSessions, unit: 'CUR' },
                    { label: 'COMPLIANCE_IDX', val: `${attendanceRate}%`, unit: 'PCT' }
                ].map((stat, i) => (
                    <div key={i} className="p-8 border-r border-b border-slate-800 hover:bg-slate-900/40 transition-colors group">
                        <p className="text-[10px] text-slate-600 font-black uppercase tracking-widest mb-4 group-hover:text-blue-500">{stat.label}</p>
                        <div className="flex items-baseline gap-2">
                            <span className="text-4xl font-black text-white">{stat.val}</span>
                            <span className="text-[10px] text-slate-700 font-bold uppercase">{stat.unit}</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* --- DATA VISUALIZATION LEDGER --- */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-px bg-slate-800 border border-slate-800 mb-12">
                <div className="bg-[#020617] p-10">
                    <div className="border-l-4 border-blue-500 pl-4 mb-10">
                        <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white">Log: Attendance_Data</h3>
                    </div>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={attendanceStats} innerRadius={60} outerRadius={90} paddingAngle={4} dataKey="value">
                                    {attendanceStats.map((_, index) => <Cell key={`cell-${index}`} fill={LEDGER_THEME[index % LEDGER_THEME.length]} stroke="#020617" strokeWidth={4} />)}
                                </Pie>
                                <Tooltip contentStyle={{ backgroundColor: '#020617', border: '1px solid #1e293b', fontFamily: 'monospace', fontSize: '10px' }} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-[#020617] p-10">
                    <div className="border-l-4 border-slate-700 pl-4 mb-10">
                        <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white">Log: Task_Registry_Volume</h3>
                    </div>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={taskBarData}>
                                <CartesianGrid strokeDasharray="2 2" vertical={false} stroke="#1e293b" />
                                <XAxis dataKey="name" stroke="#475569" fontSize={10} axisLine={false} tickLine={false} />
                                <YAxis stroke="#475569" fontSize={10} axisLine={false} tickLine={false} />
                                <Bar dataKey="tasks" fill="#0ea5e9" barSize={12} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* --- DIRECTORY SECTION --- */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                <div className="lg:col-span-2">
                    <div className="flex items-center justify-between mb-6 border-b border-slate-800 pb-2">
                        <h3 className="text-xs font-black uppercase tracking-widest text-slate-500 underline underline-offset-8">Master_User_Registry</h3>
                        <input 
                            type="text" placeholder="FILTER_BY_IDENTIFIER..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                            className="bg-transparent border border-slate-800 px-4 py-2 text-[10px] text-white focus:border-blue-500 outline-none w-64 font-black uppercase"
                        />
                    </div>
                    
                    <div className="border border-slate-800 bg-slate-900/10">
                        <table className="w-full text-left">
                            <thead className="bg-slate-800/30 text-[9px] uppercase text-slate-500 font-black">
                                <tr className="border-b border-slate-800">
                                    <th className="px-6 py-4">FILE_INDEX</th>
                                    <th className="px-6 py-4">USER_CREDENTIALS</th>
                                    <th className="px-6 py-4 text-right">DIRECTIVE</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/50">
                                {users.filter(u => u.full_name.toLowerCase().includes(searchTerm.toLowerCase())).map((user) => (
                                    <tr key={user.id} className="hover:bg-blue-500/5 group">
                                        <td className="px-6 py-4 text-[10px] text-slate-600 font-bold">#{user.id.toString().padStart(4, '0')}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-black text-slate-200 uppercase tracking-tighter">{user.full_name}</span>
                                                <span className="text-[10px] text-slate-500 italic lowercase">{user.email}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            {user.role === 'student' && (
                                                <button 
                                                    onClick={() => { setSelectedStudent(user); setShowModal(true); }}
                                                    className="border border-slate-800 bg-black px-4 py-2 text-[9px] font-black uppercase text-slate-500 hover:text-white hover:border-blue-500 transition-all"
                                                >
                                                    [ EXECUTE_TASK ]
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
                    <div className="flex items-center gap-2 mb-6 border-b border-slate-800 pb-2">
                        <h3 className="text-xs font-black uppercase tracking-widest text-slate-500 italic">Sequential_Event_Feed</h3>
                    </div>
                    <div className="border border-slate-800 p-4 bg-slate-950/50">
                        <TaskFeed tasks={tasks} />
                    </div>
                </div>
            </div>

            {/* --- MODAL (System Prompt Style) --- */}
            {showModal && selectedStudent && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/95 backdrop-blur-sm">
                    <div className="bg-[#020617] border-2 border-slate-800 w-full max-w-md p-10 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-24 h-px bg-blue-500" />
                        
                        <div className="mb-10">
                            <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter">Directive_Form_001</h2>
                            <p className="text-[10px] text-slate-600 font-black uppercase mt-1">Assign_Target: <span className="text-slate-300">{selectedStudent.full_name}</span></p>
                        </div>
                        
                        <form onSubmit={handleAssignTask} className="space-y-8">
                            <div className="space-y-2">
                                <label className="text-[9px] font-black uppercase text-slate-600 tracking-widest">Obj_Title</label>
                                <input required className="w-full bg-transparent border-b border-slate-800 p-2 text-sm text-white focus:border-blue-500 outline-none uppercase" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} placeholder="REQUIRED_FIELD" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[9px] font-black uppercase text-slate-600 tracking-widest">Obj_Description</label>
                                <textarea required className="w-full bg-slate-950 border border-slate-800 p-4 text-sm text-white h-24 focus:border-blue-500 outline-none resize-none" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} placeholder="INPUT_DATA_STREAM" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[9px] font-black uppercase text-slate-600 tracking-widest">Term_Date</label>
                                <input required type="date" className="w-full bg-transparent border-b border-slate-800 p-2 text-sm text-white focus:border-blue-500 outline-none" value={formData.due_date} onChange={(e) => setFormData({...formData, due_date: e.target.value})} />
                            </div>
                            
                            <div className="flex gap-4 pt-6">
                                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-4 text-[10px] font-black uppercase text-slate-600 hover:text-red-500 transition-colors">Abort</button>
                                <button type="submit" disabled={isSubmitting} className="flex-2 bg-white text-black py-4 text-[10px] font-black uppercase tracking-[0.2em] hover:bg-blue-500 hover:text-white transition-all disabled:opacity-20">
                                    {isSubmitting ? 'PROCESSING...' : 'CONFIRM_DIRECTIVE'}
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