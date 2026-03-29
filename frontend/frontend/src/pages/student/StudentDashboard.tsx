import { useState, useEffect } from 'react';
import StudentLayout from './StudentLayout';

// --- INTERFACES ---
interface Task {
    id: number;
    title: string;
    task_description: string;
    status: 'Pending' | 'In-Progress' | 'Completed';
    due_date: string;
}

interface AttendanceSession {
    id: number;
    date: string;
    clock_in: string;
    clock_out: string | null;
    status: 'Present' | 'Late' | 'Absent';
    total_hours: number;
}

interface WeeklyReport {
    accumulated_hours: number;
    days_present: number;
    days_late: number;
}

const StudentDashboard = () => {
    // --- SETTINGS ---
    const PHP_BRIDGE_URL = 'http://localhost/MentorLog/php-bridge'; 
    const NODE_API_URL = 'http://localhost:5000/api'; 

    // --- STATES ---
    const [isClockedIn, setIsClockedIn] = useState(false);
    const [startTime, setStartTime] = useState('');
    const [currentTime, setCurrentTime] = useState(new Date());
    const [taskDescription, setTaskDescription] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [history, setHistory] = useState<AttendanceSession[]>([]);
    const [assignedTasks, setAssignedTasks] = useState<Task[]>([]);
    const [report, setReport] = useState<WeeklyReport>({ accumulated_hours: 0, days_present: 0, days_late: 0 });
    const [hasCompletedShift, setHasCompletedShift] = useState(false);

    // --- UI FEEDBACK STATES ---
    const [updatingTaskId, setUpdatingTaskId] = useState<number | null>(null);
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

    const totalTargetHours = 600;

    // --- TOAST AUTO-HIDE ---
    useEffect(() => {
        if (toast) {
            const timer = setTimeout(() => setToast(null), 3000);
            return () => clearTimeout(timer);
        }
    }, [toast]);

    // --- HELPER: PARSE TIME STRING ---
    const parseTimeString = (timeStr: string) => {
        if (!timeStr) return null;
        const date = new Date();
        const parts = timeStr.split(' ');
        const timePart = parts[0];
        const modifier = parts[1];
        const timeSplit = timePart.split(':').map(Number);
        let hours = timeSplit[0];
        const minutes = timeSplit[1];

        if (modifier) {
            if (modifier === 'PM' && hours < 12) hours += 12;
            if (modifier === 'AM' && hours === 12) hours = 0;
        }

        date.setHours(hours, minutes, 0, 0);
        return date;
    };

    const getDuration = () => {
        const start = parseTimeString(startTime);
        if (!start || !isClockedIn) return "00:00:00";
        const diff = currentTime.getTime() - start.getTime();
        if (diff < 0) return "00:00:00";
        const seconds = Math.floor((diff / 1000) % 60);
        const minutes = Math.floor((diff / 1000 / 60) % 60);
        const hours = Math.floor((diff / 1000 / 60 / 60));
        return [
            hours.toString().padStart(2, '0'),
            minutes.toString().padStart(2, '0'),
            seconds.toString().padStart(2, '0')
        ].join(':');
    };

    // --- API CALLS ---
    const fetchAssignedTasks = async () => {
        try {
            const userId = localStorage.getItem('userId');
            const response = await fetch(`${PHP_BRIDGE_URL}/get-my-tasks.php?user_id=${userId}`);
            const data = await response.json();
            if (Array.isArray(data)) setAssignedTasks(data);
        } catch (_err) {
            console.error("Failed to fetch tasks via PHP bridge:", _err);
        }
    };

    const fetchHistory = async () => {
        try {
            const response = await fetch(`${NODE_API_URL}/attendance/history`, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            const data = await response.json();
            if (Array.isArray(data)) {
                setHistory(data);
                const todayStr = new Date().toLocaleDateString('en-CA');
                const todayLog = data.find(log => log.date.startsWith(todayStr));
                if (todayLog) {
                    if (todayLog.clock_out) {
                        setIsClockedIn(false);
                        setHasCompletedShift(true);
                    } else {
                        setIsClockedIn(true);
                        setHasCompletedShift(false);
                        setStartTime(todayLog.clock_in);
                    }
                }
            }
        } catch (_err) {
            console.error("Failed to fetch history:", _err);
        }
    };

    const fetchReport = async () => {
        try {
            const response = await fetch(`${NODE_API_URL}/attendance/weekly-report`, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            const data = await response.json();
            if (data) {
                setReport({
                    accumulated_hours: Number(data.accumulated_hours) || 0,
                    days_present: data.days_present || 0,
                    days_late: data.days_late || 0
                });
            }
        } catch (_err) {
            console.error("Connection error:", _err);
        }
    };

    useEffect(() => {
        fetchHistory();
        fetchReport();
        fetchAssignedTasks();
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    // --- HANDLERS ---
    const handleStatusUpdate = async (taskId: number, newStatus: string) => {
        setUpdatingTaskId(taskId);
        try {
            const response = await fetch(`${PHP_BRIDGE_URL}/update-task-status.php`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ taskId, status: newStatus })
            });
            if (response.ok) {
                setToast({ message: "Task marked as completed!", type: 'success' });
                await fetchAssignedTasks();
            } else {
                setToast({ message: "Failed to update task.", type: 'error' });
            }
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (_err) {
            setToast({ message: "Server connection error.", type: 'error' });
        } finally {
            setUpdatingTaskId(null);
        }
    };

    const handleClockToggle = async () => {
        if (!isClockedIn && hasCompletedShift) {
            setToast({ message: "Shift already completed for today.", type: 'error' });
            return;
        }
        const action = isClockedIn ? 'clock-out' : 'clock-in';
        if (isClockedIn && !window.confirm("Are you sure you want to clock out?")) return;

        try {
            const response = await fetch(`${NODE_API_URL}/attendance/toggle`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ action })
            });
            const data = await response.json();
            if (response.ok) {
                if (action === 'clock-in') {
                    setIsClockedIn(true);
                    setStartTime(data.clock_in);
                    setHasCompletedShift(false);
                    setToast({ message: "Clocked in successfully!", type: 'success' });
                } else {
                    setIsClockedIn(false);
                    setHasCompletedShift(true);
                    setToast({ message: "Clocked out successfully!", type: 'success' });
                }
                fetchHistory();
                fetchReport();
            } else {
                setToast({ message: data.message || "Attendance update failed.", type: 'error' });
            }
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (_err) {
            setToast({ message: "Connection error.", type: 'error' });
        }
    };

    const handleUpdateTask = async () => {
        if (!taskDescription.trim()) return setToast({ message: "Please enter a description.", type: 'error' });
        setIsSubmitting(true);
        try {
            const response = await fetch(`${NODE_API_URL}/tasks/submit`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    title: "Daily OJT Update",
                    task_description: taskDescription
                }),
            });
            if (response.ok) {
                setToast({ message: "Daily log submitted!", type: 'success' });
                setTaskDescription('');
                fetchAssignedTasks(); 
            } else {
                const data = await response.json();
                setToast({ message: data.message, type: 'error' });
            }
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (error) {
            setToast({ message: "Connection error.", type: 'error' });
        } finally {
            setIsSubmitting(false);
        }
    };

    const urgentTasks = assignedTasks
        .filter(task => task.status !== 'Completed')
        .sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime())
        .slice(0, 3);

    const progressPercentage = Math.min((report.accumulated_hours / totalTargetHours) * 100, 100);

    return (
        <StudentLayout>
            {/* TOAST NOTIFICATION */}
            {toast && (
                <div className={`fixed top-5 right-5 z-50 px-6 py-3 rounded-2xl shadow-2xl border transition-all animate-bounce ${
                    toast.type === 'success' ? 'bg-emerald-500/10 border-emerald-500 text-emerald-500' : 'bg-red-500/10 border-red-500 text-red-500'
                }`}>
                    <p className="font-bold flex items-center gap-2">
                        {toast.type === 'success' ? '✅' : '❌'} {toast.message}
                    </p>
                </div>
            )}

            <div className="max-w-6xl mx-auto space-y-8 pb-10 px-4">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                    <div className="space-y-1">
                        <h1 className="text-4xl font-black text-white tracking-tight">
                            Student <span className="text-blue-500">Portal</span>
                        </h1>
                        <p className="text-slate-400 font-medium">
                            {currentTime.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                        </p>
                    </div>
                    <button 
                        onClick={handleClockToggle}
                        disabled={!isClockedIn && hasCompletedShift}
                        className={`px-6 py-3 rounded-xl font-bold transition-all shadow-lg ${
                            isClockedIn 
                                ? 'bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white' 
                                : 'bg-emerald-500 text-slate-900'
                        }`}
                    >
                        {!isClockedIn && hasCompletedShift ? '✅ Shift Completed' : isClockedIn ? '⏹ End Shift' : '▶ Begin Shift'}
                    </button>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-[#1e293b] p-8 rounded-3xl border border-slate-800 shadow-xl">
                        <p className="text-slate-500 text-xs font-black uppercase tracking-widest">Total Progress</p>
                        <h3 className="text-4xl font-bold mt-3 text-white">
                            {report.accumulated_hours.toFixed(1)} <span className="text-lg text-slate-500 font-medium">/ {totalTargetHours} hrs</span>
                        </h3>
                        <div className="w-full bg-slate-900/50 h-3 rounded-full mt-6 overflow-hidden border border-slate-700/50">
                            <div className="bg-emerald-500 h-full rounded-full transition-all duration-1000" style={{ width: `${progressPercentage}%` }}></div>
                        </div>
                    </div>

                    <div className={`bg-[#1e293b] p-8 rounded-3xl border transition-all duration-500 shadow-xl ${isClockedIn ? 'border-blue-500/50 ring-4 ring-blue-500/5' : 'border-slate-800'}`}>
                        <p className="text-slate-500 text-xs font-black uppercase tracking-widest">Active Session</p>
                        <h3 className="text-4xl font-mono font-bold mt-3 text-white">{isClockedIn ? getDuration() : '--:--:--'}</h3>
                        <div className="mt-4 flex items-center gap-3 py-2 px-4 bg-slate-900/50 rounded-xl w-fit border border-slate-700/50">
                            <span className={`w-2.5 h-2.5 rounded-full ${isClockedIn ? 'bg-emerald-500 animate-pulse' : 'bg-slate-600'}`}></span>
                            <span className="text-xs font-bold text-slate-300 uppercase">{isClockedIn ? `Started at ${startTime}` : 'Session Inactive'}</span>
                        </div>
                    </div>

                    <div className="bg-[#1e293b] p-8 rounded-3xl border border-slate-800 shadow-xl">
                        <p className="text-slate-500 text-xs font-black uppercase tracking-widest">Attendance Status</p>
                        <h3 className="text-4xl font-bold mt-3 text-white">{report.days_present} <span className="text-lg text-slate-500 font-medium">Days</span></h3>
                        <p className="text-amber-400 text-xs mt-4 font-bold">{report.days_late} Late Arrivals Recorded</p>
                    </div>
                </div>

                {/* Priority Assigned Tasks */}
                <div className="bg-[#1e293b] rounded-3xl border border-slate-800 p-8 shadow-2xl">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-amber-500/10 rounded-2xl flex items-center justify-center text-amber-500 text-xl">🔥</div>
                            <div>
                                <h4 className="text-lg font-bold text-white">Priority Tasks</h4>
                                <p className="text-sm text-slate-500">Most urgent assignments</p>
                            </div>
                        </div>
                        <a href="/tasks" className="text-xs font-bold text-blue-500 hover:text-blue-400 uppercase tracking-widest">View All Tasks →</a>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {urgentTasks.length > 0 ? urgentTasks.map((task) => (
                            <div key={task.id} className={`bg-slate-900/40 border border-slate-700/50 p-5 rounded-2xl flex flex-col justify-between group hover:border-amber-500/30 transition-all ${updatingTaskId === task.id ? 'opacity-50 grayscale' : ''}`}>
                                <div>
                                    <div className="flex justify-between items-start mb-2">
                                         <p className="text-[10px] text-amber-400 font-black uppercase font-mono">Due: {task.due_date}</p>
                                         <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                                    </div>
                                    <h5 className="text-white font-bold mb-1 line-clamp-1">{task.title}</h5>
                                    <p className="text-slate-400 text-xs line-clamp-2 mb-4">{task.task_description}</p>
                                </div>
                                <button 
                                    onClick={() => handleStatusUpdate(task.id, 'Completed')} 
                                    disabled={updatingTaskId !== null}
                                    className="w-full py-2 bg-slate-800 hover:bg-emerald-600 text-slate-300 hover:text-white text-[10px] font-black uppercase rounded-lg transition-all flex justify-center items-center gap-2"
                                >
                                    {updatingTaskId === task.id ? (
                                        <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                                    ) : 'Quick Complete'}
                                </button>
                            </div>
                        )) : (
                            <div className="col-span-3 py-10 text-center bg-slate-900/20 rounded-2xl border border-dashed border-slate-800">
                                <p className="text-slate-500 text-sm italic">No urgent tasks at the moment. Great job!</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Task Logging (Node.js) */}
                <div className={`transition-all duration-700 transform ${isClockedIn ? 'opacity-100 translate-y-0' : 'opacity-40 pointer-events-none translate-y-4'}`}>
                    <div className="bg-[#1e293b] rounded-3xl border border-slate-800 p-8 shadow-2xl">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-12 h-12 bg-blue-600/10 rounded-2xl flex items-center justify-center text-blue-500 text-xl">📝</div>
                            <div>
                                <h4 className="text-lg font-bold text-white">Daily Task Log</h4>
                                <p className="text-sm text-slate-500">Document your daily activities</p>
                            </div>
                        </div>
                        <textarea 
                            value={taskDescription}
                            onChange={(e) => setTaskDescription(e.target.value)}
                            disabled={!isClockedIn}
                            placeholder={isClockedIn ? "Example: Developing the Dashboard UI..." : "Clock in to start logging tasks"}
                            className="w-full bg-slate-900/50 border border-slate-700 rounded-2xl p-5 text-slate-200 focus:outline-none focus:border-blue-500 min-h-32"
                        />
                        <div className="flex justify-end mt-4">
                            <button onClick={handleUpdateTask} disabled={isSubmitting || !isClockedIn} className="px-8 py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 text-white rounded-xl text-sm font-bold transition-all shadow-lg">
                                {isSubmitting ? 'Syncing...' : 'Update Task Description'}
                            </button>
                        </div>
                    </div>
                </div>

                {/* History Table */}
                <div className="bg-[#1e293b] rounded-3xl border border-slate-800 overflow-hidden shadow-2xl">
                    <div className="p-6 border-b border-slate-800 flex justify-between items-center">
                        <h4 className="text-lg font-bold text-white">📅 Recent Attendance</h4>
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-widest font-mono">Real-time Logs</span>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-slate-900/50 text-slate-500 text-[10px] uppercase font-black tracking-widest">
                                <tr>
                                    <th className="px-8 py-4">Date</th>
                                    <th className="px-8 py-4">Clock In</th>
                                    <th className="px-8 py-4">Clock Out</th>
                                    <th className="px-8 py-4">Hours</th>
                                    <th className="px-8 py-4 text-right">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/50">
                                {history.length > 0 ? history.map((row) => (
                                    <tr key={row.id} className="hover:bg-slate-800/30 transition-colors">
                                        <td className="px-8 py-5 text-sm font-bold text-slate-300">{row.date}</td>
                                        <td className="px-8 py-5 text-sm font-mono text-emerald-400 font-bold">{row.clock_in}</td>
                                        <td className="px-8 py-5 text-sm font-mono text-slate-400">
                                            {row.clock_out ? <span className="text-red-400 font-bold">{row.clock_out}</span> : <span className="text-slate-600 italic animate-pulse">Session Active...</span>}
                                        </td>
                                        <td className="px-8 py-5 text-sm font-mono text-slate-300">{row.total_hours ? `${Number(row.total_hours).toFixed(2)}h` : '--'}</td>
                                        <td className="px-8 py-5 text-right">
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${row.status === 'Present' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'}`}>{row.status}</span>
                                        </td>
                                    </tr>
                                )) : <tr><td colSpan={5} className="px-8 py-10 text-center text-slate-500 text-sm italic">No records found.</td></tr>}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </StudentLayout>
    );
};

export default StudentDashboard;