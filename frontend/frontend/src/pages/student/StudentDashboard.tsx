import { useState, useEffect } from 'react';
import StudentLayout from './StudentLayout';

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
    const [isClockedIn, setIsClockedIn] = useState(() => localStorage.getItem('isClockedIn') === 'true');
    const [startTime, setStartTime] = useState(localStorage.getItem('startTime') || '');
    const [currentTime, setCurrentTime] = useState(new Date());
    const [taskDescription, setTaskDescription] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [history, setHistory] = useState<AttendanceSession[]>([]);
    const [report, setReport] = useState<WeeklyReport>({ accumulated_hours: 0, days_present: 0, days_late: 0 });
    
    // New state to lock the button after the daily shift is done
    const [hasCompletedShift, setHasCompletedShift] = useState(false);

    const totalTargetHours = 600;

    // --- FETCH ATTENDANCE HISTORY ---
    const fetchHistory = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/attendance/history', {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            const data = await response.json();
            if (Array.isArray(data)) {
                setHistory(data);

                // Check if the user already finished a shift today
                const today = new Date().toISOString().split('T')[0];
                const todayLog = data.find(log => log.date === today);
                
                if (todayLog && todayLog.clock_out) {
                    setHasCompletedShift(true);
                } else {
                    setHasCompletedShift(false);
                }
            }
        } catch (_err) {
            console.error("Failed to fetch history:", _err);
        }
    };

    // --- FETCH WEEKLY PROGRESS ---
    const fetchReport = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/attendance/weekly-report', {
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
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    // --- DATABASE CLOCK IN/OUT LOGIC ---
    const handleClockToggle = async () => {
        if (!isClockedIn && hasCompletedShift) {
            alert("You have already completed your attendance for today.");
            return;
        }

        const action = isClockedIn ? 'clock-out' : 'clock-in';
        if (isClockedIn && !window.confirm("Are you sure you want to clock out?")) return;

        try {
            const response = await fetch(`http://localhost:5000/api/attendance/toggle`, {
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
                    const timeString = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                    setIsClockedIn(true);
                    setStartTime(timeString);
                    localStorage.setItem('isClockedIn', 'true');
                    localStorage.setItem('startTime', timeString);
                } else {
                    setIsClockedIn(false);
                    setStartTime('');
                    setHasCompletedShift(true); // Lock the button immediately after clocking out
                    localStorage.removeItem('isClockedIn');
                    localStorage.removeItem('startTime');
                }
                fetchHistory();
                fetchReport();
            } else {
                alert(data.message || "Attendance update failed.");
            }
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (_err) {
            alert("Connection error. Is the backend running?");
        }
    };

    const handleUpdateTask = async () => {
        if (!taskDescription.trim()) return alert("Please enter a task description.");
        setIsSubmitting(true);
        try {
            const response = await fetch('http://localhost:5000/api/tasks/update', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    title: "Daily OJT Update", 
                    task_description: taskDescription,
                    status: 'In-Progress'
                })
            });
            if (response.ok) {
                alert("Task updated successfully!");
                setTaskDescription('');
            }
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (_err) {
            alert("Connection error.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const progressPercentage = Math.min((report.accumulated_hours / totalTargetHours) * 100, 100);

    return (
        <StudentLayout>
            <div className="max-w-6xl mx-auto space-y-8 pb-10 px-4">
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
                        className={`group relative overflow-hidden px-10 py-4 rounded-2xl font-black uppercase tracking-wider transition-all duration-300 shadow-2xl ${
                            !isClockedIn && hasCompletedShift
                            ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                            : isClockedIn 
                                ? 'bg-red-500/10 border border-red-500/50 text-red-500 hover:bg-red-500 hover:text-white' 
                                : 'bg-emerald-500 text-slate-900 hover:bg-emerald-400 hover:-translate-y-1'
                        }`}
                    >
                        <span className="relative z-10 flex items-center gap-2">
                            {!isClockedIn && hasCompletedShift 
                                ? '✅ Shift Completed' 
                                : isClockedIn ? '⏹ End Shift' : '▶ Begin Shift'}
                        </span>
                    </button>
                </div>

                {/* STATS GRID */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-[#1e293b] p-8 rounded-3xl border border-slate-800 shadow-xl">
                        <p className="text-slate-500 text-xs font-black uppercase tracking-widest">Total Progress</p>
                        <h3 className="text-4xl font-bold mt-3 text-white">
                            {report.accumulated_hours.toFixed(1)} <span className="text-lg text-slate-500 font-medium">/ {totalTargetHours} hrs</span>
                        </h3>
                        <div className="w-full bg-slate-900/50 h-3 rounded-full mt-6 overflow-hidden border border-slate-700/50">
                            <div 
                                className="bg-linear-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-1000 shadow-[0_0_15px_rgba(16,185,129,0.4)]"
                                style={{ width: `${progressPercentage}%` }}
                            ></div>
                        </div>
                    </div>

                    <div className={`bg-[#1e293b] p-8 rounded-3xl border transition-all duration-500 shadow-xl ${
                        isClockedIn ? 'border-blue-500/50 ring-4 ring-blue-500/5' : 'border-slate-800'
                    }`}>
                        <p className="text-slate-500 text-xs font-black uppercase tracking-widest">Active Session</p>
                        <h3 className="text-4xl font-bold mt-3 text-white">
                            {isClockedIn ? currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : '--:--'}
                        </h3>
                        <div className="mt-4 flex items-center gap-3 py-2 px-4 bg-slate-900/50 rounded-xl w-fit border border-slate-700/50">
                            <span className={`w-2.5 h-2.5 rounded-full ${isClockedIn ? 'bg-emerald-500 animate-pulse' : 'bg-slate-600'}`}></span>
                            <span className="text-xs font-bold text-slate-300 uppercase">
                                {isClockedIn ? `Started at ${startTime}` : 'Session Inactive'}
                            </span>
                        </div>
                    </div>

                    <div className="bg-[#1e293b] p-8 rounded-3xl border border-slate-800 shadow-xl">
                        <p className="text-slate-500 text-xs font-black uppercase tracking-widest">Attendance Status</p>
                        <h3 className="text-4xl font-bold mt-3 text-white">
                            {report.days_present} <span className="text-lg text-slate-500 font-medium">Days</span>
                        </h3>
                        <p className="text-amber-400 text-xs mt-4 font-bold">{report.days_late} Late Arrivals Recorded</p>
                    </div>
                </div>

                {/* TASK LOGGING */}
                <div className={`transition-all duration-700 transform ${isClockedIn ? 'opacity-100 translate-y-0' : 'opacity-40 pointer-events-none translate-y-4'}`}>
                    <div className="bg-[#1e293b] rounded-3xl border border-slate-800 p-8 shadow-2xl">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-12 h-12 bg-blue-600/10 rounded-2xl flex items-center justify-center text-blue-500 text-xl border border-blue-500/20">📝</div>
                            <div>
                                <h4 className="text-lg font-bold text-white">Daily Task Log</h4>
                                <p className="text-sm text-slate-500">What are you working on right now?</p>
                            </div>
                        </div>
                        <textarea 
                            value={taskDescription}
                            onChange={(e) => setTaskDescription(e.target.value)}
                            disabled={!isClockedIn}
                            placeholder={isClockedIn ? "Example: Developing the MentorLog Dashboard UI..." : "Clock in to start logging tasks"}
                            className="w-full bg-slate-900/50 border border-slate-700 rounded-2xl p-5 text-slate-200 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 min-h-30 placeholder:text-slate-600 transition-all"
                        />
                        <div className="flex justify-end mt-4">
                            <button 
                                onClick={handleUpdateTask}
                                disabled={isSubmitting || !isClockedIn}
                                className="px-8 py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 text-white rounded-xl text-sm font-bold transition-all shadow-lg shadow-blue-900/20"
                            >
                                {isSubmitting ? 'Syncing...' : 'Update Task Description'}
                            </button>
                        </div>
                    </div>
                </div>

                {/* ATTENDANCE TABLE */}
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
                                    <tr key={row.id} className="hover:bg-slate-800/30 transition-colors group">
                                        <td className="px-8 py-5 text-sm font-bold text-slate-300">{row.date}</td>
                                        <td className="px-8 py-5 text-sm font-mono text-emerald-400 font-bold tracking-tight">{row.clock_in}</td>
                                        <td className="px-8 py-5 text-sm font-mono text-slate-400">
                                            {row.clock_out ? <span className="text-red-400 font-bold">{row.clock_out}</span> : <span className="text-slate-600 italic animate-pulse">Session Active...</span>}
                                        </td>
                                        <td className="px-8 py-5 text-sm font-mono text-slate-300">
                                            {row.total_hours ? `${Number(row.total_hours).toFixed(2)}h` : '--'}
                                        </td>
                                        <td className="px-8 py-5 text-right">
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${row.status === 'Present' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'}`}>
                                                {row.status}
                                            </span>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={5} className="px-8 py-10 text-center text-slate-500 text-sm italic">No attendance records found.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </StudentLayout>
    );
};

export default StudentDashboard;