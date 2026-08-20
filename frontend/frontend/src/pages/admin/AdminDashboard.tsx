import React, { useState, useEffect, useCallback } from 'react';
import { 
    PieChart, Pie, Cell, ResponsiveContainer, Tooltip, 
    BarChart, Bar, XAxis, YAxis, CartesianGrid 
} from 'recharts';
import { 
    Users, CheckSquare, Clock, 
    RefreshCw, Search, Plus, X, Megaphone, 
    Calendar as CalendarIcon, MessageSquare, Inbox,
    Hourglass
} from 'lucide-react';
import TaskFeed from './TaskFeed';
import api from '../../services/api';

// --- TYPES ---
interface User { 
    id: number; 
    full_name: string; 
    email: string; 
    student_id?: string;
    course?: string;
    profile_pic?: string;
    ojt_hours_required?: number;
    role: 'admin' | 'student'; 
    created_at: string; 
}

const getFullPicUrl = (path?: string) => {
    if (!path) return '';
    if (path.startsWith('http://') || path.startsWith('https://')) return path;
    return `http://localhost:5000${path}`;
};

interface AttendanceLog { 
    id: number; 
    user_id?: number;
    student_name: string; 
    clock_in: string; 
    clock_out: string | null; 
    status: 'Present' | 'Late' | 'Absent' | 'Excused'; 
    total_hours?: number;
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

interface SystemStats {
    announcements: number;
    attendance: number;
    events: number;
    feedbacks: number;
    requests: number; 
    tasks: number;
    users: number;
    attendanceDetails?: {
        present: number;
        late: number;
        absent: number;
    };
    taskDetails?: {
        pending: number;
        inProcess: number; 
        completed: number;
    };
    requestDetails?: {
        pending: number;
        processing: number;
        accepted: number;
        rejected: number;
    };
}

const PIE_COLORS = ['#2563eb', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#64748b']; 

const pastelAvatarStyles = [
    'bg-purple-100 text-purple-700 border-purple-200',
    'bg-blue-100 text-blue-700 border-blue-200',
    'bg-pink-100 text-pink-700 border-pink-200',
    'bg-emerald-100 text-emerald-700 border-emerald-200',
    'bg-amber-100 text-amber-700 border-amber-200',
];
const getAvatarStyle = (id: number) => pastelAvatarStyles[id % pastelAvatarStyles.length];

const getInitials = (name?: string) => {
    if (!name) return 'UN';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name.slice(0, 2).toUpperCase();
};

const AdminDashboard = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [logs, setLogs] = useState<AttendanceLog[]>([]);
    const [tasks, setTasks] = useState<TaskLog[]>([]);
    const [analyticsStats, setAnalyticsStats] = useState<SystemStats | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState<User | null>(null);
    const [formData, setFormData] = useState({ title: '', description: '', due_date: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const fetchAllData = useCallback(async () => {
        setIsLoading(true);
        try {
            const [userRes, attRes, taskRes, analyticsRes] = await Promise.all([
                api.get('/admin/users/all'), 
                api.get('/attendance/all'),
                api.get('/tasks/all'),
                api.get('/analytics/stats').catch(() => ({ data: { success: false } }))
            ]);
            
            if (userRes.data?.success) setUsers(userRes.data.data || []);
            if (attRes.data?.success) setLogs(attRes.data.data || []);
            if (taskRes.data?.success) setTasks(taskRes.data.data || []);
            if (analyticsRes.data?.success) setAnalyticsStats(analyticsRes.data.data);
        } catch (err) {
            console.error("Fetch Error:", err);
        } finally {
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
            await api.post('/tasks/assign', {
                student_id: selectedStudent.id,
                title: formData.title,
                task_description: formData.description,
                due_date: formData.due_date
            });
            alert("Task assigned successfully!");
            setShowModal(false);
            setFormData({ title: '', description: '', due_date: '' });
            fetchAllData(); 
        } catch (error) {
            console.error(error); 
        } finally { 
            setIsSubmitting(false); 
        }
    };

    // Stats Calculations
    const totalPresentAndLate = logs.filter(l => l.status === 'Present' || l.status === 'Late').length;
    const attendanceRate = logs.length > 0 ? ((totalPresentAndLate / logs.length) * 100).toFixed(1) : "0.0";
    const studentUsers = users.filter(u => u.role === 'student');

    // Helper to calculate total hours rendered by an intern
    const getStudentRenderedHours = (userId: number, studentName: string) => {
        return logs
            .filter(l => l.user_id === userId || l.student_name === studentName)
            .reduce((sum, l) => sum + (Number(l.total_hours) || 0), 0);
    };

    // Chart Data
    const moduleMixData = [
        { name: 'Announcements', value: analyticsStats?.announcements || 0 },
        { name: 'Attendance', value: analyticsStats?.attendance || 0 },
        { name: 'Events', value: analyticsStats?.events || 0 },
        { name: 'Feedbacks', value: analyticsStats?.feedbacks || 0 },
        { name: 'Services', value: analyticsStats?.requests || 0 },
        { name: 'Tasks', value: analyticsStats?.tasks || 0 },
        { name: 'Users', value: analyticsStats?.users || 0 }
    ].filter(d => d.value > 0);

    const attendanceBreakdownData = [
        { name: 'Present', value: analyticsStats?.attendanceDetails?.present || logs.filter(l => l.status === 'Present').length },
        { name: 'Late', value: analyticsStats?.attendanceDetails?.late || logs.filter(l => l.status === 'Late').length },
        { name: 'Absent', value: analyticsStats?.attendanceDetails?.absent || logs.filter(l => l.status === 'Absent').length }
    ].filter(d => d.value > 0);

    const taskProgressData = [
        { status: 'Pending', count: analyticsStats?.taskDetails?.pending || tasks.filter(t => t.status === 'Pending').length },
        { status: 'In-Progress', count: analyticsStats?.taskDetails?.inProcess || tasks.filter(t => t.status === 'In-Progress').length },
        { status: 'Completed', count: analyticsStats?.taskDetails?.completed || tasks.filter(t => t.status === 'Completed').length }
    ];

    const requestStatusData = [
        { status: 'Pending', count: analyticsStats?.requestDetails?.pending || 0 },
        { status: 'Processing', count: analyticsStats?.requestDetails?.processing || 0 },
        { status: 'Accepted', count: analyticsStats?.requestDetails?.accepted || 0 },
        { status: 'Rejected', count: analyticsStats?.requestDetails?.rejected || 0 }
    ];

    const filteredStudents = studentUsers.filter(u => 
        u.full_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (u.student_id && u.student_id.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className="space-y-6 max-w-7xl mx-auto">
            
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Control Center Dashboard</h1>
                    <p className="text-xs text-slate-500 mt-0.5">Real-time telemetry, intern performance metrics, and activity summary</p>
                </div>

                <button 
                    onClick={fetchAllData}
                    disabled={isLoading}
                    className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold px-4 py-2.5 rounded-lg shadow-xs transition-all flex items-center gap-2"
                >
                    <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-blue-600' : ''}`} />
                    <span>{isLoading ? 'Syncing...' : 'Refresh Telemetry'}</span>
                </button>
            </div>

            {/* 7-Metric Stat Summary Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
                {[
                    { label: 'Users', val: analyticsStats?.users ?? users.length, icon: Users, color: 'text-blue-600 bg-blue-50 border-blue-200' },
                    { label: 'Tasks', val: analyticsStats?.tasks ?? tasks.length, icon: CheckSquare, color: 'text-pink-600 bg-pink-50 border-pink-200' },
                    { label: 'Attendance', val: analyticsStats?.attendance ?? logs.length, icon: Clock, color: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
                    { label: 'Services', val: analyticsStats?.requests ?? 0, icon: Inbox, color: 'text-violet-600 bg-violet-50 border-violet-200' },
                    { label: 'Bulletins', val: analyticsStats?.announcements ?? 0, icon: Megaphone, color: 'text-amber-600 bg-amber-50 border-amber-200' },
                    { label: 'Events', val: analyticsStats?.events ?? 0, icon: CalendarIcon, color: 'text-sky-600 bg-sky-50 border-sky-200' },
                    { label: 'Feedbacks', val: analyticsStats?.feedbacks ?? 0, icon: MessageSquare, color: 'text-rose-600 bg-rose-50 border-rose-200' },
                ].map((stat) => (
                    <div key={stat.label} className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs text-center hover:border-slate-300 transition-all">
                        <div className={`w-7 h-7 mx-auto mb-2 rounded-lg border flex items-center justify-center ${stat.color}`}>
                            <stat.icon className="w-3.5 h-3.5" />
                        </div>
                        <p className="text-[10px] font-bold uppercase text-slate-400 tracking-wider mb-0.5">{stat.label}</p>
                        <p className="text-xl font-extrabold text-slate-800">{stat.val}</p>
                    </div>
                ))}
            </div>

            {/* OJT Intern Required Hours & Remaining (Minus) Hours Table */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-100 pb-4">
                    <div>
                        <div className="flex items-center gap-2">
                            <Hourglass className="w-4 h-4 text-blue-600" />
                            <h3 className="text-base font-bold text-slate-900">Intern OJT Hours & Remaining Balance Tracker</h3>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">Live list of required hours, rendered hours, and minus (remaining) hours balance per intern</p>
                    </div>

                    <div className="relative w-full sm:w-64">
                        <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input 
                            type="text" 
                            placeholder="Filter by student name or ID..." 
                            value={searchTerm} 
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:border-blue-500 outline-none transition-all"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                        <thead>
                            <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                                <th className="py-3 px-4">OJT Intern Name ↕</th>
                                <th className="py-3 px-4">Required Target Hours ↕</th>
                                <th className="py-3 px-4">Rendered Logged Hours ↕</th>
                                <th className="py-3 px-4">Minus Hours (Remaining) ↕</th>
                                <th className="py-3 px-4">Completion Progress</th>
                                <th className="py-3 px-4 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-slate-700">
                            {filteredStudents.length > 0 ? (
                                filteredStudents.map((user) => {
                                    const avatarStyle = getAvatarStyle(user.id);
                                    const initials = getInitials(user.full_name);
                                    
                                    const requiredHours = Number(user.ojt_hours_required) || 600;
                                    const renderedHours = getStudentRenderedHours(user.id, user.full_name);
                                    const remainingHours = Math.max(0, requiredHours - renderedHours);
                                    const progressPct = Math.min(100, (renderedHours / requiredHours) * 100);

                                    return (
                                        <tr key={user.id} className="hover:bg-slate-50/80 transition-colors">
                                            {/* Intern Avatar & Info */}
                                            <td className="py-3.5 px-4">
                                                <div className="flex items-center gap-3">
                                                    {user.profile_pic ? (
                                                        <img 
                                                            src={getFullPicUrl(user.profile_pic)} 
                                                            alt={user.full_name} 
                                                            className="w-8 h-8 rounded-full object-cover border border-slate-200 shrink-0 shadow-xs" 
                                                        />
                                                    ) : (
                                                        <div className={`w-8 h-8 rounded-full border flex items-center justify-center font-bold text-xs shrink-0 ${avatarStyle}`}>
                                                            {initials}
                                                        </div>
                                                    )}
                                                    <div>
                                                        <p className="font-bold text-slate-900 leading-tight">{user.full_name}</p>
                                                        <p className="text-[10px] text-slate-400 font-mono">
                                                            {user.course || 'OJT Intern'} • ID: {user.student_id || `#${user.id}`}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Required Target Hours */}
                                            <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                                                {requiredHours} hrs
                                            </td>

                                            {/* Rendered Logged Hours */}
                                            <td className="py-3.5 px-4 font-mono font-semibold text-emerald-700">
                                                {renderedHours.toFixed(1)} hrs
                                            </td>

                                            {/* Minus Hours (Remaining Balance) */}
                                            <td className="py-3.5 px-4">
                                                <span className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-mono font-bold border rounded-full ${
                                                    remainingHours === 0 
                                                        ? 'text-emerald-700 bg-emerald-50 border-emerald-200' 
                                                        : 'text-amber-800 bg-amber-50 border-amber-200'
                                                }`}>
                                                    <Hourglass className="w-3 h-3" />
                                                    -{remainingHours.toFixed(1)} hrs left
                                                </span>
                                            </td>

                                            {/* Completion Progress Bar */}
                                            <td className="py-3.5 px-4 min-w-[160px]">
                                                <div className="space-y-1">
                                                    <div className="flex justify-between items-center text-[10px] font-semibold text-slate-500">
                                                        <span>{progressPct.toFixed(1)}%</span>
                                                        <span>{renderedHours.toFixed(0)}/{requiredHours}h</span>
                                                    </div>
                                                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                                                        <div 
                                                            className={`h-full rounded-full transition-all duration-500 ${
                                                                progressPct >= 100 ? 'bg-emerald-500' : 'bg-blue-600'
                                                            }`} 
                                                            style={{ width: `${progressPct}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Assign Task Action */}
                                            <td className="py-3.5 px-4 text-right">
                                                <button 
                                                    onClick={() => { setSelectedStudent(user); setShowModal(true); }}
                                                    className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold text-xs transition-all shadow-xs"
                                                >
                                                    <Plus className="w-3.5 h-3.5" /> Assign Task
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan={6} className="py-12 text-center text-slate-400 text-xs italic">
                                        No matching OJT intern accounts found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Analytics Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* 1. System Module Mix */}
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
                    <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                        <div>
                            <h3 className="text-sm font-bold text-slate-800">System Modules Data Mix</h3>
                            <p className="text-[11px] text-slate-500">Distribution across system entities</p>
                        </div>
                        <span className="text-[10px] font-semibold uppercase bg-blue-50 text-blue-700 border border-blue-200 px-2.5 py-1 rounded-full">Overview</span>
                    </div>
                    <div className="h-56 flex items-center justify-center">
                        {moduleMixData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie data={moduleMixData} innerRadius={50} outerRadius={75} paddingAngle={4} dataKey="value">
                                        {moduleMixData.map((_, index) => (
                                            <Cell key={`cell-module-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} stroke="#ffffff" strokeWidth={2} />
                                        ))}
                                    </Pie>
                                    <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0', color: '#0f172a', fontSize: '12px' }} />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <p className="text-slate-400 text-xs italic">No telemetry data recorded yet.</p>
                        )}
                    </div>
                </div>

                {/* 2. Attendance Status Breakdown */}
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
                    <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                        <div>
                            <h3 className="text-sm font-bold text-slate-800">Attendance Breakdown</h3>
                            <p className="text-[11px] text-slate-500">Ratio of Present, Late, and Absent logs</p>
                        </div>
                        <span className="text-[10px] font-semibold uppercase bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded-full">{attendanceRate}% Rate</span>
                    </div>
                    <div className="h-56 flex items-center justify-center">
                        {attendanceBreakdownData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie data={attendanceBreakdownData} innerRadius={50} outerRadius={75} paddingAngle={4} dataKey="value">
                                        {attendanceBreakdownData.map((entry, index) => (
                                            <Cell key={`cell-att-${index}`} fill={entry.name === 'Present' ? '#10b981' : entry.name === 'Late' ? '#f59e0b' : '#ef4444'} stroke="#ffffff" strokeWidth={2} />
                                        ))}
                                    </Pie>
                                    <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0', color: '#0f172a', fontSize: '12px' }} />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <p className="text-slate-400 text-xs italic">No attendance data logged yet.</p>
                        )}
                    </div>
                </div>

                {/* 3. Task Progress Overview */}
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
                    <div className="border-b border-slate-100 pb-3">
                        <h3 className="text-sm font-bold text-slate-800">Task Progress Status</h3>
                        <p className="text-[11px] text-slate-500">Pending, In-Progress, and Completed tasks</p>
                    </div>
                    <div className="h-56">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={taskProgressData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="status" stroke="#94a3b8" fontSize={11} axisLine={false} tickLine={false} />
                                <YAxis stroke="#94a3b8" fontSize={11} axisLine={false} tickLine={false} />
                                <Bar dataKey="count" fill="#2563eb" radius={[4, 4, 0, 0]} barSize={24} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* 4. Service Request Status */}
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
                    <div className="border-b border-slate-100 pb-3">
                        <h3 className="text-sm font-bold text-slate-800">Service Request Status</h3>
                        <p className="text-[11px] text-slate-500">Pending, Processing, Accepted, and Rejected requests</p>
                    </div>
                    <div className="h-56">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={requestStatusData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="status" stroke="#94a3b8" fontSize={11} axisLine={false} tickLine={false} />
                                <YAxis stroke="#94a3b8" fontSize={11} axisLine={false} tickLine={false} />
                                <Bar dataKey="count" fill="#8b5cf6" radius={[4, 4, 0, 0]} barSize={24} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Task Activity Feed */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
                <div className="border-b border-slate-100 pb-3">
                    <h3 className="text-base font-bold text-slate-900">Task Activity Feed</h3>
                    <p className="text-[11px] text-slate-500">Live task status updates across all OJT interns</p>
                </div>
                <TaskFeed tasks={tasks} />
            </div>

            {/* Task Assignment Modal */}
            {showModal && selectedStudent && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
                    <div className="bg-white border border-slate-200 w-full max-w-md rounded-2xl p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150">
                        <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                            <div>
                                <h3 className="text-base font-bold text-slate-900">Assign Task Directive</h3>
                                <p className="text-xs text-slate-500 mt-0.5">Assignee: <span className="font-semibold text-blue-600">{selectedStudent.full_name}</span></p>
                            </div>
                            <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100">
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                        
                        <form onSubmit={handleAssignTask} className="space-y-4">
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-slate-600">Task Title</label>
                                <input 
                                    required 
                                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 outline-none focus:border-blue-500 focus:bg-white" 
                                    value={formData.title} 
                                    onChange={(e) => setFormData({...formData, title: e.target.value})} 
                                    placeholder="e.g. Prepare Weekly OJT Report" 
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-slate-600">Description</label>
                                <textarea 
                                    required 
                                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 h-24 outline-none focus:border-blue-500 focus:bg-white resize-none" 
                                    value={formData.description} 
                                    onChange={(e) => setFormData({...formData, description: e.target.value})} 
                                    placeholder="Provide detailed instructions..." 
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-slate-600">Due Date</label>
                                <input 
                                    required 
                                    type="date" 
                                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 outline-none focus:border-blue-500 focus:bg-white" 
                                    value={formData.due_date} 
                                    onChange={(e) => setFormData({...formData, due_date: e.target.value})} 
                                />
                            </div>
                            
                            <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                                <button 
                                    type="button" 
                                    onClick={() => setShowModal(false)} 
                                    className="px-4 py-2 rounded-lg bg-slate-100 text-slate-600 font-semibold text-xs hover:bg-slate-200 transition-all"
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit" 
                                    disabled={isSubmitting} 
                                    className="px-4 py-2 bg-blue-600 rounded-lg text-white font-semibold text-xs hover:bg-blue-700 transition-all shadow-xs disabled:opacity-50"
                                >
                                    {isSubmitting ? 'Assigning...' : 'Assign Task'}
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