import { useState, useEffect, useCallback } from 'react';
import AdminLayout from './AdminLayout';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import TaskFeed from './TaskFeed';

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

const COLORS = ['#10b981', '#f59e0b', '#3b82f6', '#ef4444'];

const AdminDashboard = () => {
    const [logs, setLogs] = useState<AttendanceLog[]>([]);
    const [tasks, setTasks] = useState<TaskLog[]>([]);
    const [filter, setFilter] = useState<'All' | 'Present' | 'Late'>('All');
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const fetchAllData = useCallback(async () => {
        setIsLoading(true);
        try {
            const attRes = await fetch('http://localhost:5000/api/attendance/all');
            const attData = await attRes.json();
            
            const taskRes = await fetch('http://localhost:5000/api/tasks/all', {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            const taskData = await taskRes.json();

            if (attData.success) setLogs(attData.data);
            if (taskData.success) setTasks(taskData.data);
        } catch (err) {
            console.error("Error fetching dashboard data:", err);
        } finally {
            setTimeout(() => setIsLoading(false), 600);
        }
    }, []);

    useEffect(() => {
        fetchAllData();
    }, [fetchAllData]);

    // --- LOGIC: SEARCH & FILTER ---
    const filteredLogs = logs.filter(log => {
        const matchesFilter = filter === 'All' || log.status === filter;
        const matchesSearch = log.student_name.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    const handleDownloadCSV = () => {
        const headers = ['Student Name,Clock In,Clock Out,Status,Is Active\n'];
        const csvRows = filteredLogs.map(log => 
            `${log.student_name},${log.clock_in},${log.clock_out || 'N/A'},${log.status},${log.is_active}`
        );
        
        const blob = new Blob([headers + csvRows.join('\n')], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.setAttribute('hidden', '');
        a.setAttribute('href', url);
        a.setAttribute('download', `Attendance_Report_${new Date().toLocaleDateString()}.csv`);
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    // --- DATA PREPARATION ---
    const activeCount = logs.filter(log => log.is_active).length;

    const attendanceStats = [
        { name: 'Present', value: logs.filter(l => l.status === 'Present').length },
        { name: 'Late', value: logs.filter(l => l.status === 'Late').length },
        { name: 'Excused', value: logs.filter(l => l.status === 'Excused').length },
        { name: 'Absent', value: logs.filter(l => l.status === 'Absent').length },
    ].filter(item => item.value > 0);

    const taskPieData = Object.values(tasks.reduce((acc: Record<string, {name: string, value: number}>, curr) => {
        acc[curr.student_name] = { 
            name: curr.student_name, 
            value: (acc[curr.student_name]?.value || 0) + 1 
        };
        return acc;
    }, {}));

    return (
        <AdminLayout>
            {/* --- HEADER --- */}
            <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold bg-linear-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent tracking-tight">
                        Admin Statistics
                    </h1>
                    <p className="text-slate-400 mt-2 font-medium">Visualizing MentorLog OJT Activity.</p>
                </div>

                <div className="flex items-center gap-3">
                    <button 
                        onClick={fetchAllData}
                        disabled={isLoading}
                        className="p-2.5 bg-[#1e293b] border border-slate-700 rounded-xl text-slate-400 hover:text-white hover:border-blue-500 transition-all disabled:opacity-50"
                    >
                        <svg className={`w-5 h-5 ${isLoading ? 'animate-spin text-blue-400' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                    </button>

                    <div className="flex bg-[#1e293b] p-1 rounded-xl border border-slate-700 shadow-inner">
                        {(['All', 'Present', 'Late'] as const).map((type) => (
                            <button
                                key={type}
                                onClick={() => setFilter(type)}
                                className={`px-5 py-2 rounded-lg text-sm font-bold transition-all ${
                                    filter === type ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-200'
                                }`}
                            >
                                {type}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* --- CHARTS SECTION --- */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                <div className="bg-[#1e293b] p-6 rounded-2xl border border-slate-700 h-87.5 shadow-xl">
                    <h3 className="text-slate-400 font-bold uppercase text-xs mb-4 tracking-widest">
                        Attendance Ratio ({activeCount} Active)
                    </h3>
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie data={attendanceStats} innerRadius={70} outerRadius={100} paddingAngle={8} dataKey="value">
                                {attendanceStats.map((_, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '12px', color: '#fff' }} />
                            <Legend iconType="circle" />
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                <div className="bg-[#1e293b] p-6 rounded-2xl border border-slate-700 h-87.5 shadow-xl text-white">
                    <h3 className="text-slate-400 font-bold uppercase text-xs mb-4 tracking-widest">Reports per Student</h3>
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={taskPieData}
                                cx="50%" cy="50%"
                                outerRadius={100}
                                label={({ name, percent = 0 }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                labelLine={false}
                                dataKey="value"
                            >
                                {taskPieData.map((_, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '12px' }} />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* --- SEARCH & ACTIONS --- */}
            <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="relative w-full md:w-96 group">
                    <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-blue-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                        type="text"
                        placeholder="Search for a student..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-[#1e293b] border border-slate-700 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 transition-all"
                    />
                </div>
                
                <button 
                    onClick={handleDownloadCSV}
                    className="flex items-center justify-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold rounded-xl transition-all shadow-lg shadow-emerald-900/20"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Export CSV
                </button>
            </div>

            {/* --- DATA TABLES & FEED --- */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                <div className="lg:col-span-2 bg-[#1e293b] rounded-2xl border border-slate-700 overflow-hidden shadow-2xl relative">
                    {isLoading && (
                        <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px] z-10 flex items-center justify-center" />
                    )}
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-slate-800/40 text-slate-400 text-xs uppercase tracking-widest border-b border-slate-700">
                            <tr>
                                <th className="p-5 font-bold">Student Name</th>
                                <th className="p-5 font-bold">Clock In</th>
                                <th className="p-5 font-bold text-center">Status</th>
                                <th className="p-5 font-bold text-right">Session State</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-700/50">
                            {filteredLogs.length > 0 ? (
                                filteredLogs.map((log) => (
                                    <tr key={log.id} className="hover:bg-blue-500/5 transition-colors group">
                                        <td className="p-5 font-semibold text-white group-hover:text-blue-400 transition-colors">
                                            {log.student_name}
                                        </td>
                                        <td className="p-5 text-slate-300 font-mono text-sm">
                                            {new Date(log.clock_in).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </td>
                                        <td className="p-5 text-center">
                                            <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-tighter border ${
                                                log.status === 'Present' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 
                                                log.status === 'Late' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' : 
                                                'bg-slate-500/10 text-slate-400 border-slate-700'
                                            }`}>
                                                {log.status}
                                            </span>
                                        </td>
                                        <td className="p-5 text-right">
                                            {log.is_active ? (
                                                <span className="inline-flex items-center gap-2 text-emerald-400 text-xs font-bold">
                                                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                                                    Active
                                                </span>
                                            ) : (
                                                <span className="text-slate-500 text-xs italic">
                                                    Ended {log.clock_out ? new Date(log.clock_out).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={4} className="p-20 text-center text-slate-500 italic">No records found matching your search.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="lg:col-span-1">
                    <TaskFeed tasks={tasks} />
                </div>
            </div>
        </AdminLayout>
    );
};

export default AdminDashboard;