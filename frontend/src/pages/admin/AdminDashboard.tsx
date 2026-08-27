import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    PieChart, Pie, Cell, ResponsiveContainer, Tooltip, 
    BarChart, Bar, XAxis, YAxis, CartesianGrid 
} from 'recharts';
import { 
    Users, CheckSquare, Clock, 
    RefreshCw, Search, Plus, Megaphone, 
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
    profile_pic?: string;
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
    const navigate = useNavigate();
    const [users, setUsers] = useState<User[]>([]);
    const [logs, setLogs] = useState<AttendanceLog[]>([]);
    const [tasks, setTasks] = useState<TaskLog[]>([]);
    const [analyticsStats, setAnalyticsStats] = useState<SystemStats | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(false);

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

            {/* 7-Metric Stat Summary Cards with Light Earth Tone Colors & Click Navigation */}
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
                {[
                    { 
                        label: 'Users', 
                        val: analyticsStats?.users ?? users.length, 
                        icon: Users, 
                        path: '/manage-students',
                        cardBg: 'bg-[#f2f6f3] border-[#d4e2d6] hover:border-[#b0c7b3] hover:shadow-xs', 
                        iconColor: 'bg-[#e0ece2] border-[#c0d6c3] text-[#2d4a34]',
                        textColor: 'text-[#243c2a]',
                        labelColor: 'text-[#486650]'
                    },
                    { 
                        label: 'Tasks', 
                        val: analyticsStats?.tasks ?? tasks.length, 
                        icon: CheckSquare, 
                        path: '/manage-tasks',
                        cardBg: 'bg-[#fcf4f1] border-[#f4dcd4] hover:border-[#e6b9ab] hover:shadow-xs', 
                        iconColor: 'bg-[#f7e4dd] border-[#eccdcb] text-[#9c4c36]',
                        textColor: 'text-[#753424]',
                        labelColor: 'text-[#9c5645]'
                    },
                    { 
                        label: 'Attendance', 
                        val: analyticsStats?.attendance ?? logs.length, 
                        icon: Clock, 
                        path: '/manage-attendance',
                        cardBg: 'bg-[#fcf8f1] border-[#f5e6d2] hover:border-[#e6cb9f] hover:shadow-xs', 
                        iconColor: 'bg-[#f8ead7] border-[#edd6b6] text-[#996825]',
                        textColor: 'text-[#6e4614]',
                        labelColor: 'text-[#946e38]'
                    },
                    { 
                        label: 'Services', 
                        val: analyticsStats?.requests ?? 0, 
                        icon: Inbox, 
                        path: '/manage-requests',
                        cardBg: 'bg-[#f6f4f8] border-[#e4dfed] hover:border-[#c7bed8] hover:shadow-xs', 
                        iconColor: 'bg-[#eae5f3] border-[#d6cdcf] text-[#59516e]',
                        textColor: 'text-[#3c364c]',
                        labelColor: 'text-[#645b7d]'
                    },
                    { 
                        label: 'Bulletins', 
                        val: analyticsStats?.announcements ?? 0, 
                        icon: Megaphone, 
                        path: '/manage-announcements',
                        cardBg: 'bg-[#faf6ed] border-[#f2e4c9] hover:border-[#dfc99b] hover:shadow-xs', 
                        iconColor: 'bg-[#f8edd5] border-[#eadbb4] text-[#946b27]',
                        textColor: 'text-[#694a16]',
                        labelColor: 'text-[#917036]'
                    },
                    { 
                        label: 'Events', 
                        val: analyticsStats?.events ?? 0, 
                        icon: CalendarIcon, 
                        path: '/admin-calendar',
                        cardBg: 'bg-[#f2f5f7] border-[#d8e0e4] hover:border-[#b3c2c9] hover:shadow-xs', 
                        iconColor: 'bg-[#e2eaed] border-[#c7d5db] text-[#3d5a6c]',
                        textColor: 'text-[#263b48]',
                        labelColor: 'text-[#4c6a7d]'
                    },
                    { 
                        label: 'Feedbacks', 
                        val: analyticsStats?.feedbacks ?? 0, 
                        icon: MessageSquare, 
                        path: '/manage-feedback',
                        cardBg: 'bg-[#faf2f4] border-[#f3d7df] hover:border-[#e2b4c2] hover:shadow-xs', 
                        iconColor: 'bg-[#f6e1e6] border-[#ebc8d1] text-[#9c4b60]',
                        textColor: 'text-[#6e2f3e]',
                        labelColor: 'text-[#995364]'
                    },
                ].map((stat) => (
                    <div 
                        key={stat.label} 
                        onClick={() => navigate(stat.path)}
                        className={`p-3.5 rounded-xl border transition-all cursor-pointer text-center group active:scale-98 ${stat.cardBg}`}
                    >
                        <div className={`w-7 h-7 mx-auto mb-2 rounded-lg border flex items-center justify-center transition-transform group-hover:scale-110 ${stat.iconColor}`}>
                            <stat.icon className="w-3.5 h-3.5" />
                        </div>
                        <p className={`text-[10px] font-bold uppercase tracking-wider mb-0.5 ${stat.labelColor}`}>{stat.label}</p>
                        <p className={`text-xl font-extrabold ${stat.textColor}`}>{stat.val}</p>
                    </div>
                ))}
            </div>

            {/* 4 Analytics & Status Charts Positioned ABOVE Intern OJT Hours Tracker */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                
                {/* 1. System Module Mix */}
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-2">
                    <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                        <div>
                            <h3 className="text-xs font-bold text-slate-800">System Modules Data Mix</h3>
                            <p className="text-[10px] text-slate-400">Data distribution across entities</p>
                        </div>
                        <span className="text-[9px] font-semibold uppercase bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-full">Overview</span>
                    </div>
                    <div className="h-44 flex items-center justify-center">
                        {moduleMixData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie data={moduleMixData} innerRadius={35} outerRadius={60} paddingAngle={3} dataKey="value">
                                        {moduleMixData.map((_, index) => (
                                            <Cell key={`cell-module-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} stroke="#ffffff" strokeWidth={2} />
                                        ))}
                                    </Pie>
                                    <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0', color: '#0f172a', fontSize: '11px' }} />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <p className="text-slate-400 text-[11px] italic">No telemetry data</p>
                        )}
                    </div>
                </div>

                {/* 2. Attendance Status Breakdown */}
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-2">
                    <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                        <div>
                            <h3 className="text-xs font-bold text-slate-800">Attendance Breakdown</h3>
                            <p className="text-[10px] text-slate-400">Present, Late, Absent ratio</p>
                        </div>
                        <span className="text-[9px] font-semibold uppercase bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full">{attendanceRate}%</span>
                    </div>
                    <div className="h-44 flex items-center justify-center">
                        {attendanceBreakdownData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie data={attendanceBreakdownData} innerRadius={35} outerRadius={60} paddingAngle={3} dataKey="value">
                                        {attendanceBreakdownData.map((entry, index) => (
                                            <Cell key={`cell-att-${index}`} fill={entry.name === 'Present' ? '#10b981' : entry.name === 'Late' ? '#f59e0b' : '#ef4444'} stroke="#ffffff" strokeWidth={2} />
                                        ))}
                                    </Pie>
                                    <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0', color: '#0f172a', fontSize: '11px' }} />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <p className="text-slate-400 text-[11px] italic">No attendance data</p>
                        )}
                    </div>
                </div>

                {/* 3. Task Progress Status */}
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-2">
                    <div className="border-b border-slate-100 pb-2">
                        <h3 className="text-xs font-bold text-slate-800">Task Progress Status</h3>
                        <p className="text-[10px] text-slate-400">Pending, In-Progress, Completed</p>
                    </div>
                    <div className="h-44">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={taskProgressData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="status" stroke="#94a3b8" fontSize={10} axisLine={false} tickLine={false} />
                                <YAxis stroke="#94a3b8" fontSize={10} axisLine={false} tickLine={false} />
                                <Bar dataKey="count" fill="#2563eb" radius={[4, 4, 0, 0]} barSize={18} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* 4. Service Request Status */}
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-2">
                    <div className="border-b border-slate-100 pb-2">
                        <h3 className="text-xs font-bold text-slate-800">Service Request Status</h3>
                        <p className="text-[10px] text-slate-400">Pending, Processing, Accepted, Rejected</p>
                    </div>
                    <div className="h-44">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={requestStatusData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="status" stroke="#94a3b8" fontSize={10} axisLine={false} tickLine={false} />
                                <YAxis stroke="#94a3b8" fontSize={10} axisLine={false} tickLine={false} />
                                <Bar dataKey="count" fill="#8b5cf6" radius={[4, 4, 0, 0]} barSize={18} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

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
                                            <td className="py-3.5 px-4 min-w-[180px]">
                                                <div className="space-y-1.5">
                                                    <div className="flex justify-between items-center text-[10px] font-semibold">
                                                        <span className="flex items-center gap-1.5 font-bold">
                                                            {progressPct >= 90 ? (
                                                                <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 animate-pulse">
                                                                    Near Completion ({progressPct.toFixed(0)}%)
                                                                </span>
                                                            ) : progressPct >= 50 ? (
                                                                <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-blue-100 text-blue-800 border border-blue-300">
                                                                    On Track ({progressPct.toFixed(0)}%)
                                                                </span>
                                                            ) : (
                                                                <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-slate-100 text-slate-700 border border-slate-300">
                                                                    In Progress ({progressPct.toFixed(0)}%)
                                                                </span>
                                                            )}
                                                        </span>
                                                        <span className="font-mono text-slate-600 font-bold">{renderedHours.toFixed(0)} / {requiredHours} hrs</span>
                                                    </div>
                                                    <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden p-0.5 border border-slate-200">
                                                        <div 
                                                            className={`h-full rounded-full transition-all duration-500 ${
                                                                progressPct >= 90 ? 'bg-gradient-to-r from-emerald-500 to-teal-400' : progressPct >= 50 ? 'bg-gradient-to-r from-blue-600 to-indigo-500' : 'bg-slate-500'
                                                            }`} 
                                                            style={{ width: `${progressPct}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Assign Task Action */}
                                            <td className="py-3.5 px-4 text-right">
                                                <button 
                                                    onClick={() => navigate('/manage-tasks', { state: { studentId: user.id, studentName: user.full_name, openModal: true } })}
                                                    className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold text-xs transition-all shadow-xs active:scale-98"
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

            {/* Task Activity Feed */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
                <div className="border-b border-slate-100 pb-3">
                    <h3 className="text-base font-bold text-slate-900">Task Activity Feed</h3>
                    <p className="text-[11px] text-slate-500">Live task status updates across all OJT interns</p>
                </div>
                <TaskFeed tasks={tasks} />
            </div>
        </div>
    );
};

export default AdminDashboard;