import { useState, useEffect, useCallback } from 'react';
import api from '../../services/api';

// --- INTERFACES ---
interface AttendanceLog {
    id: number;
    user_id: number;
    date: string;
    clock_in: string;
    clock_out: string | null;
    status: 'Present' | 'Late' | 'Absent';
    total_hours: number;
    is_active: boolean;
}

interface WeeklyReport {
    accumulated_hours: number;
    days_present: number;
    days_late: number;
}

interface ManualEntryState {
    date: string;
    clock_in: string;
    clock_out: string;
    status: 'Present' | 'Late' | 'Absent';
}

interface TaskItem {
    id: number;
    title: string;
    task_description: string;
    due_date: string;
    status: string;
}

interface AnnouncementItem {
    id: number;
    title: string;
    content: string;
    created_at: string;
}

const StudentDashboard = () => {
    // --- STATES ---
    const [isClockedIn, setIsClockedIn] = useState(false);
    const [currentTime, setCurrentTime] = useState(new Date());
    const [logs, setLogs] = useState<AttendanceLog[]>([]);
    const [report, setReport] = useState<WeeklyReport>({ accumulated_hours: 0, days_present: 0, days_late: 0 });
    const [totalTargetHours, setTotalTargetHours] = useState<number>(600);
    const [hasCompletedShift, setHasCompletedShift] = useState(false);
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const [pendingTasks, setPendingTasks] = useState<TaskItem[]>([]);
    const [latestAnnouncement, setLatestAnnouncement] = useState<AnnouncementItem | null>(null);

    // --- HELPERS ---
    const getTodayDate = useCallback(() => new Date().toISOString().split('T')[0], []);

    const [manualEntry, setManualEntry] = useState<ManualEntryState>({
        date: getTodayDate(),
        clock_in: '',
        clock_out: '',
        status: 'Present'
    });

    // --- TOAST AUTO-HIDE ---
    useEffect(() => {
        if (toast) {
            const timer = setTimeout(() => setToast(null), 3000);
            return () => clearTimeout(timer);
        }
    }, [toast]);
    

    // --- DATA FETCHING ---
    const refreshDashboardData = useCallback(async () => {
        try {
            const [historyRes, reportRes, profileRes, taskRes, annRes] = await Promise.all([
                api.get('/attendance/history'),
                api.get('/attendance/weekly-report'),
                api.get('/auth/profile'),
                api.get('/tasks/my-tasks').catch(() => ({ data: [] })),
                api.get('/announcements').catch(() => ({ data: [] }))
            ]);

            const historyData = historyRes.data;
            const reportData = reportRes.data;
            const profileData = profileRes.data?.user || profileRes.data;
            const taskData = Array.isArray(taskRes.data) ? taskRes.data : (taskRes.data?.data || []);
            const annData = Array.isArray(annRes.data) ? annRes.data : (annRes.data?.data || []);

            if (profileData && profileData.ojt_hours_required) {
                setTotalTargetHours(Number(profileData.ojt_hours_required) || 600);
            }

            if (Array.isArray(taskData)) {
                setPendingTasks(taskData.filter((t: TaskItem) => t.status !== 'Completed'));
            }

            if (Array.isArray(annData) && annData.length > 0) {
                setLatestAnnouncement(annData[0]);
            }

            if (Array.isArray(historyData)) {
                setLogs(historyData);
                
                // Check for an active session (clock_out is null)
                const activeSession = historyData.find((log: AttendanceLog) => log.clock_out === null);
                setIsClockedIn(!!activeSession);

                // Check if shift is finished for today
                const todayStr = getTodayDate();
                const finishedToday = historyData.some((log: AttendanceLog) =>
                    log.date.includes(todayStr) && log.clock_out !== null
                );
                setHasCompletedShift(finishedToday);
            }

            if (reportData) {
                setReport({
                    accumulated_hours: Number(reportData.accumulated_hours) || 0,
                    days_present: reportData.days_present || 0,
                    days_late: reportData.days_late || 0
                });
            }
        } catch (error) {
            console.error("Failed to refresh data", error);
        }
    }, [getTodayDate]);
 

    useEffect(() => {
        refreshDashboardData();

        const clockInterval = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(clockInterval);
    }, [refreshDashboardData]);

    // --- HANDLERS ---
    const handleManualSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (manualEntry.clock_out <= manualEntry.clock_in) {
            setToast({ message: "Clock-out must be after Clock-in", type: 'error' });
            return;
        }

        const isDuplicate = logs.some(log => log.date.includes(manualEntry.date));
        if (isDuplicate) {
            setToast({ message: `A record for ${manualEntry.date} already exists.`, type: 'error' });
            return;
        }

        try {
            const response = await api.post('/attendance/manual-log', manualEntry);

            if (response.data?.success) {
                setToast({ message: "Entry saved successfully!", type: 'success' });
                setIsModalOpen(false);
                setManualEntry({ date: getTodayDate(), clock_in: '', clock_out: '', status: 'Present' });
                refreshDashboardData();
            } else {
                setToast({ message: response.data?.message || "Failed to save entry.", type: 'error' });
            }
        } catch (err: any) {
            setToast({ message: err.response?.data?.message || "Connection error.", type: 'error' });
        }
    };

    const handleClockToggle = async (actionOverride?: 'resume') => {
        const action = actionOverride || (isClockedIn ? 'clock-out' : 'clock-in');
        try {
            const response = await api.post('/attendance/toggle', { action });

            if (response.data?.success) {
                setToast({
                    message: action === 'clock-out' ? "Clocked out!" : "Shift started!",
                    type: 'success'
                });
                refreshDashboardData();
            } else {
                setToast({ message: response.data?.message || "Action failed", type: 'error' });
            }
        } catch (err: any) {
            setToast({ message: err.response?.data?.message || "Network error.", type: 'error' });
        }
    };

    const getElapsedTime = () => {
        if (!isClockedIn) return { formatted: '00:00:00' };
        const activeLog = logs.find(l => l.clock_out === null);
        if (!activeLog) return { formatted: '00:00:00' };

        let startTime: Date;
        if (activeLog.clock_in.includes('-') || activeLog.clock_in.includes('T')) {
            startTime = new Date(activeLog.clock_in);
        } else {
            const datePart = activeLog.date.split('T')[0];
            startTime = new Date(`${datePart} ${activeLog.clock_in}`);
        }

        if (isNaN(startTime.getTime())) {
            startTime = new Date();
        }

        const diffInMs = Math.max(0, currentTime.getTime() - startTime.getTime());
        const totalSecs = Math.floor(diffInMs / 1000);
        const hours = Math.floor(totalSecs / 3600);
        const minutes = Math.floor((totalSecs % 3600) / 60);
        const seconds = totalSecs % 60;

        const pad = (n: number) => n.toString().padStart(2, '0');
        return {
            formatted: `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`
        };
    };

    const progressPercentage = Math.min((report.accumulated_hours / totalTargetHours) * 100, 100);

    return (
        <div className="max-w-6xl mx-auto space-y-8 pb-10 px-4">
            {/* Toast System */}
            {toast && (
                <div className={`fixed top-5 right-5 z-100 px-6 py-3 rounded-2xl shadow-xl border transition-all animate-in fade-in slide-in-from-top-4 ${
                    toast.type === 'success' ? 'bg-emerald-500/10 border-emerald-500 text-emerald-500' : 'bg-red-500/10 border-red-500 text-red-500'
                }`}>
                    <p className="font-bold flex items-center gap-2">
                        {toast.type === 'success' ? '✅' : '❌'} {toast.message}
                    </p>
                </div>
            )}

            {/* Manual Log Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
                    <div className="bg-[#1e293b] w-full max-w-md p-8 rounded-3xl border border-slate-700 shadow-2xl">
                        <h2 className="text-2xl font-bold text-white mb-6 tracking-tight">Manual Log</h2>
                        <form onSubmit={handleManualSubmit} className="space-y-4">
                            <div>
                                <label className="text-slate-400 text-xs font-bold uppercase mb-1 block">Date</label>
                                <input type="date" required value={manualEntry.date} onChange={e => setManualEntry({ ...manualEntry, date: e.target.value })} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none transition-all" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-slate-400 text-xs font-bold uppercase mb-1 block">Clock In</label>
                                    <input type="time" required value={manualEntry.clock_in} onChange={e => setManualEntry({ ...manualEntry, clock_in: e.target.value })} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none transition-all" />
                                </div>
                                <div>
                                    <label className="text-slate-400 text-xs font-bold uppercase mb-1 block">Clock Out</label>
                                    <input type="time" required value={manualEntry.clock_out} onChange={e => setManualEntry({ ...manualEntry, clock_out: e.target.value })} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none transition-all" />
                                </div>
                            </div>
                            <div>
                                <label className="text-slate-400 text-xs font-bold uppercase mb-1 block">Status</label>
                                <select value={manualEntry.status} onChange={e => setManualEntry({ ...manualEntry, status: e.target.value as ManualEntryState['status'] })} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none transition-all">
                                    <option value="Present">Present</option>
                                    <option value="Late">Late</option>
                                    <option value="Absent">Absent</option>
                                </select>
                            </div>
                            <div className="flex gap-3 pt-6">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-6 py-3 rounded-xl font-bold text-slate-400 hover:bg-slate-800 transition-colors">Cancel</button>
                                <button type="submit" className="flex-1 px-6 py-3 rounded-xl font-bold bg-blue-600 text-white hover:bg-blue-500 shadow-lg shadow-blue-600/20 transition-all active:scale-95">Save Entry</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 bg-[#1e293b] p-8 rounded-3xl border border-slate-800 shadow-xl">
                <div className="space-y-1">
                    <h1 className="text-4xl font-black text-white tracking-tight italic">
                        STUDENT<span className="text-blue-500">PORTAL</span>
                    </h1>
                    <p className="text-slate-400 font-medium font-mono uppercase tracking-widest text-sm">
                        {currentTime.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                    </p>
                </div>

                <div className="flex flex-wrap gap-3">
                    <button
                        onClick={() => setIsModalOpen(true)}
                        disabled={isClockedIn || hasCompletedShift}
                        className={`px-6 py-4 rounded-xl font-bold border transition-all active:scale-95 ${isClockedIn || hasCompletedShift
                                ? 'opacity-40 cursor-not-allowed border-slate-700 text-slate-500'
                                : 'text-blue-400 border-blue-500/30 hover:bg-blue-500/10'
                            }`}
                    >
                        📝 Manual Entry
                    </button>

                    <button
                        onClick={() => handleClockToggle()}
                        disabled={!isClockedIn && hasCompletedShift}
                        className={`px-10 py-4 rounded-xl font-bold transition-all shadow-lg text-lg ${isClockedIn
                                ? 'bg-red-500/10 text-red-500 border border-red-500 hover:bg-red-500 hover:text-white'
                                : hasCompletedShift
                                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                                    : 'bg-emerald-500 text-slate-900 hover:scale-105 active:scale-95'
                            }`}
                    >
                        {!isClockedIn && hasCompletedShift ? '✅ Shift Done' : isClockedIn ? '⏹ End Shift' : '▶ Begin Shift'}
                    </button>
                </div>
            </div>

            {/* Live Active Shift Banner Widget */}
            {isClockedIn && (
                <div className="bg-gradient-to-r from-emerald-950/60 via-slate-900 to-blue-950/60 border border-emerald-500/40 rounded-3xl p-6 shadow-2xl shadow-emerald-950/40 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
                        <div className="flex items-center gap-4">
                            <div className="relative flex items-center justify-center">
                                <span className="animate-ping absolute inline-flex h-10 w-10 rounded-full bg-emerald-400 opacity-40"></span>
                                <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/50 flex items-center justify-center text-xl">
                                    ⏱️
                                </div>
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                                    <span className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.3em]">Shift In Progress</span>
                                </div>
                                <h2 className="text-xl font-bold text-white tracking-tight mt-0.5">Active OJT Session</h2>
                            </div>
                        </div>

                        <div className="flex items-center gap-6 bg-slate-900/80 px-8 py-4 rounded-2xl border border-emerald-500/30 backdrop-blur-md shadow-inner">
                            <div className="text-center">
                                <span className="text-3xl font-black text-emerald-400 font-mono tracking-wider tabular-nums">
                                    {getElapsedTime().formatted}
                                </span>
                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] block mt-0.5">
                                    Elapsed (HH : MM : SS)
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            )}


            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-[#1e293b] p-8 rounded-3xl border border-slate-800 shadow-xl">
                    <p className="text-slate-500 text-xs font-black uppercase tracking-[0.2em]">Total Progress</p>
                    <h3 className="text-5xl font-bold mt-3 text-white tabular-nums">
                        {report.accumulated_hours.toFixed(1)} <span className="text-lg text-slate-500 font-medium">/ {totalTargetHours}h</span>
                    </h3>
                    <div className="w-full bg-slate-900/50 h-3 rounded-full mt-8 overflow-hidden border border-slate-700/50">
                        <div className="bg-linear-to-r from-blue-600 to-emerald-500 h-full rounded-full transition-all duration-1000" style={{ width: `${progressPercentage}%` }}></div>
                    </div>
                </div>

                <div className="bg-[#1e293b] p-8 rounded-3xl border border-slate-800 shadow-xl">
                    <p className="text-slate-500 text-xs font-black uppercase tracking-[0.2em]">Attendance Summary</p>
                    <div className="flex justify-between items-center mt-3">
                        <h3 className="text-5xl font-bold text-white tabular-nums">{report.days_present} <span className="text-lg text-slate-500 font-medium uppercase tracking-widest">Days</span></h3>
                        <div className="text-right">
                            <p className="text-amber-400 text-sm font-black italic">{report.days_late} LATE ARRIVALS</p>
                            <p className="text-slate-600 text-[10px] uppercase font-bold">System Verified</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Overview Widgets: Pending Tasks & Office Bulletin */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Pending Tasks Widget */}
                <div className="bg-[#1e293b] p-6 rounded-3xl border border-slate-800 shadow-xl flex flex-col justify-between">
                    <div>
                        <div className="flex justify-between items-center mb-4 border-b border-slate-800 pb-3">
                            <h4 className="text-base font-bold text-white flex items-center gap-2">
                                📌 My Pending Tasks 
                                {pendingTasks.length > 0 && (
                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-blue-500/20 text-blue-400 border border-blue-500/30">
                                        {pendingTasks.length}
                                    </span>
                                )}
                            </h4>
                        </div>
                        {pendingTasks.length > 0 ? (
                            <div className="space-y-3">
                                {pendingTasks.slice(0, 3).map((task) => (
                                    <div key={task.id} className="bg-slate-900/60 p-3 rounded-2xl border border-slate-800/80 flex items-center justify-between">
                                        <div className="space-y-0.5 max-w-[70%]">
                                            <p className="text-xs font-bold text-white truncate">{task.title}</p>
                                            <p className="text-[10px] text-slate-400 truncate">{task.task_description || 'No description'}</p>
                                        </div>
                                        <span className="text-[9px] font-mono font-bold text-amber-400 bg-amber-500/10 px-2 py-1 rounded-lg border border-amber-500/20">
                                            Due {task.due_date ? new Date(task.due_date).toLocaleDateString() : 'N/A'}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-slate-500 text-xs italic py-6 text-center font-mono">No pending tasks assigned.</p>
                        )}
                    </div>
                </div>

                {/* Latest Office Bulletin Widget */}
                <div className="bg-[#1e293b] p-6 rounded-3xl border border-slate-800 shadow-xl flex flex-col justify-between">
                    <div>
                        <div className="flex justify-between items-center mb-4 border-b border-slate-800 pb-3">
                            <h4 className="text-base font-bold text-white flex items-center gap-2">
                                📢 Office Bulletin
                            </h4>
                            <span className="text-[9px] font-black uppercase text-blue-400 tracking-wider">Latest News</span>
                        </div>
                        {latestAnnouncement ? (
                            <div className="bg-slate-900/60 p-4 rounded-2xl border border-slate-800/80 space-y-2">
                                <h5 className="text-sm font-bold text-white">{latestAnnouncement.title}</h5>
                                <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed">{latestAnnouncement.content}</p>
                                <p className="text-[9px] font-mono text-slate-500 text-right">
                                    Posted {new Date(latestAnnouncement.created_at).toLocaleDateString()}
                                </p>
                            </div>
                        ) : (
                            <p className="text-slate-500 text-xs italic py-6 text-center font-mono">No announcements posted yet.</p>
                        )}
                    </div>
                </div>
            </div>

            {/* History Table */}
            <div className="bg-[#1e293b] rounded-3xl border border-slate-800 overflow-hidden shadow-2xl">
                <div className="p-6 border-b border-slate-800 bg-slate-900/20 flex justify-between items-center">
                    <h4 className="text-lg font-bold text-white">📅 Attendance History</h4>
                    <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-slate-900/50 text-slate-500 text-[10px] uppercase font-black tracking-[0.15em]">
                            <tr>
                                <th className="px-8 py-5">Date</th>
                                <th className="px-8 py-5">Clock In</th>
                                <th className="px-8 py-5">Clock Out</th>
                                <th className="px-8 py-5">Total Hours</th>
                                <th className="px-8 py-5 text-right">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/50">
                            {logs.length > 0 ? logs.map((row) => (
                                <tr key={row.id} className="hover:bg-slate-800/30 transition-colors group">
                                    <td className="px-8 py-5 text-sm font-bold text-slate-300">{row.date}</td>
                                    <td className="px-8 py-5 text-sm font-mono text-emerald-400">{row.clock_in}</td>
                                    <td className="px-8 py-5 text-sm font-mono text-slate-400">
                                        {row.clock_out ? <span className="text-red-400/80">{row.clock_out}</span> : <span className="italic text-blue-400 animate-pulse font-bold">Active...</span>}
                                    </td>
                                    <td className="px-8 py-5 text-sm font-mono text-slate-300">
                                        {row.total_hours ? `${Number(row.total_hours).toFixed(2)}h` : '--'}
                                    </td>
                                    <td className="px-8 py-5 text-right">
                                        <span className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${row.status === 'Present' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' :
                                                row.status === 'Late' ? 'bg-amber-500/10 text-amber-400 border border-amber-400/20' :
                                                    'bg-red-500/10 text-red-500 border border-red-500/20'
                                            }`}>
                                            {row.status}
                                        </span>
                                    </td>
                                </tr>
                            )) : (
                                <tr><td colSpan={5} className="px-8 py-16 text-center text-slate-500 text-sm italic font-mono">No records found.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default StudentDashboard;