import { useState, useEffect, useCallback } from 'react';
import api from '../../services/api';
import { PrintableDTRModal } from '../../components/PrintableDTRModal';
import { 
    Clock, Play, Square, CheckCircle2, ShieldCheck, AlertCircle, AlertTriangle, 
    Calendar, CheckSquare, Megaphone, FileText, ArrowRight, Printer, Filter 
} from 'lucide-react';

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
    const [activeLogItem, setActiveLogItem] = useState<AttendanceLog | null>(null);
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'warning' } | null>(null);

    const [pendingTasks, setPendingTasks] = useState<TaskItem[]>([]);
    const [latestAnnouncement, setLatestAnnouncement] = useState<AnnouncementItem | null>(null);

    const [dateRange, setDateRange] = useState<string>('All');
    const [isDTRModalOpen, setIsDTRModalOpen] = useState(false);

    const filteredLogs = logs.filter(log => {
        let matchesDate = true;
        if (log.date && dateRange !== 'All') {
            const recordDate = new Date(log.date.split('T')[0]);
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            if (dateRange === 'Today') {
                matchesDate = recordDate.toDateString() === today.toDateString();
            } else if (dateRange === 'ThisWeek') {
                const sevenDaysAgo = new Date(today);
                sevenDaysAgo.setDate(today.getDate() - 7);
                matchesDate = recordDate >= sevenDaysAgo;
            } else if (dateRange === 'ThisMonth') {
                matchesDate = recordDate.getMonth() === today.getMonth() && recordDate.getFullYear() === today.getFullYear();
            }
        }
        return matchesDate;
    });

    // --- HELPERS ---
    const getTodayDate = useCallback(() => new Date().toISOString().split('T')[0], []);

    // --- TOAST AUTO-HIDE ---
    useEffect(() => {
        if (toast) {
            const timer = setTimeout(() => setToast(null), 4000);
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
                setActiveLogItem(activeSession || null);

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

    const handleClockToggle = async (actionOverride?: 'resume') => {
        const action = actionOverride || (isClockedIn ? 'clock-out' : 'clock-in');
        try {
            const response = await api.post('/attendance/toggle', { action });

            if (response.data?.success) {
                if (action === 'clock-out') {
                    setToast({ message: "Shift ended and hours recorded!", type: 'success' });
                } else {
                    const isLate = response.data.status === 'Late';
                    setToast({ 
                        message: isLate 
                            ? "Shift started! (Marked as Late Arrival — Clocked in after 8:15 AM)" 
                            : "Shift started! (On-Time Present)", 
                        type: isLate ? 'warning' : 'success' 
                    });
                }
                refreshDashboardData();
            } else {
                setToast({ message: response.data?.message || "Action failed", type: 'error' });
            }
        } catch (err: any) {
            setToast({ message: err.response?.data?.message || "Network error.", type: 'error' });
        }
    };

    const getElapsedTime = () => {
        if (!isClockedIn || !activeLogItem) return { formatted: '00:00:00' };

        let startTime: Date;
        if (activeLogItem.clock_in.includes('-') || activeLogItem.clock_in.includes('T')) {
            startTime = new Date(activeLogItem.clock_in);
        } else {
            const datePart = activeLogItem.date.split('T')[0];
            startTime = new Date(`${datePart} ${activeLogItem.clock_in}`);
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
        <div className="space-y-6 max-w-7xl mx-auto">
            {/* Toast Notification System */}
            {toast && (
                <div className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl shadow-lg border text-xs font-semibold flex items-center gap-2 animate-in fade-in slide-in-from-bottom-3 ${
                    toast.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 
                    toast.type === 'warning' ? 'bg-amber-50 border-amber-200 text-amber-800' :
                    'bg-rose-50 border-rose-200 text-rose-800'
                }`}>
                    {toast.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : 
                     toast.type === 'warning' ? <AlertTriangle className="w-4 h-4 text-amber-600" /> :
                     <AlertCircle className="w-4 h-4 text-rose-600" />}
                    <span>{toast.message}</span>
                </div>
            )}

            {/* Header Action Banner Card */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wider block">OJT Time Tracking Portal</span>
                    <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Student Dashboard</h1>
                    <p className="text-xs text-slate-500 mt-0.5 font-medium">
                        {currentTime.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                    </p>
                </div>

                {/* Main Action Button: Begin Shift / End Shift */}
                <div className="flex items-center gap-3 w-full md:w-auto">
                    <button
                        onClick={() => handleClockToggle()}
                        disabled={!isClockedIn && hasCompletedShift}
                        className={`px-6 py-2.5 rounded-lg text-xs font-bold transition-all shadow-xs flex items-center gap-2 ${
                            isClockedIn
                                ? 'bg-rose-600 hover:bg-rose-700 text-white'
                                : hasCompletedShift
                                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                                    : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                        }`}
                    >
                        {!isClockedIn && hasCompletedShift ? (
                            <>
                                <CheckCircle2 className="w-4 h-4 text-slate-500" />
                                <span>Shift Completed</span>
                            </>
                        ) : isClockedIn ? (
                            <>
                                <Square className="w-3.5 h-3.5 fill-current" />
                                <span>End Shift</span>
                            </>
                        ) : (
                            <>
                                <Play className="w-3.5 h-3.5 fill-current" />
                                <span>Begin Shift</span>
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Live Active Shift Banner Widget */}
            {isClockedIn && activeLogItem && (
                <div className={`rounded-xl p-5 shadow-xs relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-4 text-white ${
                    activeLogItem.status === 'Late' ? 'bg-amber-500' : 'bg-emerald-600'
                }`}>
                    <div className="flex items-center gap-3.5">
                        <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                            <Clock className="w-5 h-5 text-white animate-spin" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-white animate-pulse"></span>
                                <span className="text-[10px] font-bold uppercase tracking-wider text-white/90">
                                    {activeLogItem.status === 'Late' ? 'Active Shift (Marked as Late Arrival)' : 'Active Shift (On-Time Present)'}
                                </span>
                            </div>
                            <h2 className="text-lg font-bold tracking-tight mt-0.5">
                                Shift In Progress — Clocked In at {activeLogItem.clock_in}
                            </h2>
                        </div>
                    </div>

                    <div className="bg-white/10 px-6 py-2.5 rounded-lg border border-white/20 text-center font-mono">
                        <span className="text-2xl font-black tracking-wider">{getElapsedTime().formatted}</span>
                        <span className="text-[10px] uppercase block tracking-wider text-white/90 mt-0.5">Elapsed (HH : MM : SS)</span>
                    </div>
                </div>
            )}

            {/* Metric Cards Grid (Clean Automoor White Cards) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* OJT Target Progress */}
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
                    <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total OJT Progress</span>
                        <span className="text-xs font-mono font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                            {progressPercentage.toFixed(1)}% Complete
                        </span>
                    </div>

                    <div className="flex items-baseline gap-2">
                        <span className="text-4xl font-extrabold text-slate-900 font-mono tracking-tight">
                            {report.accumulated_hours.toFixed(1)}
                        </span>
                        <span className="text-sm font-semibold text-slate-400">/ {totalTargetHours} required hrs</span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                        <div 
                            className="bg-blue-600 h-full rounded-full transition-all duration-700" 
                            style={{ width: `${progressPercentage}%` }}
                        ></div>
                    </div>
                </div>

                {/* Attendance Summary */}
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
                    <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Attendance Verification</span>
                        <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100 flex items-center gap-1">
                            <ShieldCheck className="w-3.5 h-3.5" /> Verified
                        </span>
                    </div>

                    <div className="flex items-center justify-between">
                        <div>
                            <span className="text-4xl font-extrabold text-slate-900 font-mono tracking-tight">
                                {report.days_present}
                            </span>
                            <span className="text-sm font-semibold text-slate-500 ml-2">Days Present</span>
                        </div>

                        <div className="text-right">
                            <span className={`px-3 py-1 rounded-full text-xs font-bold inline-block border ${
                                report.days_late > 0 ? 'text-amber-700 bg-amber-50 border-amber-200' : 'text-slate-600 bg-slate-100 border-slate-200'
                            }`}>
                                {report.days_late} Late Arrivals
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Overview Grid: Pending Tasks & Office Bulletin */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Pending Tasks Widget */}
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
                    <div>
                        <div className="flex justify-between items-center mb-3 pb-2.5 border-b border-slate-100">
                            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                                📌 Pending Assigned Directives
                            </h4>
                            {pendingTasks.length > 0 && (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                                    {pendingTasks.length} Pending
                                </span>
                            )}
                        </div>

                        {pendingTasks.length > 0 ? (
                            <div className="space-y-2">
                                {pendingTasks.slice(0, 3).map((task) => (
                                    <div key={task.id} className="bg-slate-50 p-3 rounded-lg border border-slate-200/80 flex items-center justify-between">
                                        <div className="space-y-0.5 max-w-[70%]">
                                            <p className="text-xs font-bold text-slate-900 truncate">{task.title}</p>
                                            <p className="text-[11px] text-slate-500 truncate">{task.task_description || 'No description'}</p>
                                        </div>
                                        <span className="text-[10px] font-mono font-semibold text-amber-700 bg-amber-50 px-2 py-1 rounded border border-amber-200">
                                            Due {task.due_date ? new Date(task.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'N/A'}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-slate-400 text-xs italic py-6 text-center">No pending tasks assigned.</p>
                        )}
                    </div>
                </div>

                {/* Latest Office Bulletin Widget */}
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
                    <div>
                        <div className="flex justify-between items-center mb-3 pb-2.5 border-b border-slate-100">
                            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                                📢 Office Bulletin
                            </h4>
                            <span className="text-[10px] font-semibold text-blue-600">Latest Announcement</span>
                        </div>

                        {latestAnnouncement ? (
                            <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200/80 space-y-1.5">
                                <h5 className="text-xs font-bold text-slate-900">{latestAnnouncement.title}</h5>
                                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">{latestAnnouncement.content}</p>
                                <p className="text-[10px] font-mono text-slate-400 text-right pt-1">
                                    Posted {new Date(latestAnnouncement.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                </p>
                            </div>
                        ) : (
                            <p className="text-slate-400 text-xs italic py-6 text-center">No announcements posted yet.</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Attendance History SaaS Table */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
                <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Attendance History Logs</h4>
                        <span className="text-[11px] text-slate-500">{filteredLogs.length} Total Logs</span>
                    </div>

                    <div className="flex items-center gap-2">
                        <div className="relative">
                            <select 
                                value={dateRange}
                                onChange={(e) => setDateRange(e.target.value)}
                                className="appearance-none bg-white border border-slate-200 rounded-lg px-3 py-1.5 pr-8 text-xs font-medium text-slate-700 outline-none focus:border-blue-500 cursor-pointer"
                            >
                                <option value="All">Date Range: All Time</option>
                                <option value="Today">Today</option>
                                <option value="ThisWeek">Past 7 Days</option>
                                <option value="ThisMonth">This Month</option>
                            </select>
                            <Filter className="w-3 h-3 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>

                        <button 
                            onClick={() => setIsDTRModalOpen(true)}
                            className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold px-3.5 py-1.5 rounded-lg shadow-xs transition-all flex items-center gap-1.5 active:scale-98"
                        >
                            <Printer className="w-3.5 h-3.5 text-blue-400" />
                            <span>Print My DTR (Form 48)</span>
                        </button>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                        <thead>
                            <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                                <th className="py-3 px-4">Log Date ↕</th>
                                <th className="py-3 px-4">Clock In ↕</th>
                                <th className="py-3 px-4">Clock Out ↕</th>
                                <th className="py-3 px-4">Total Hours ↕</th>
                                <th className="py-3 px-4 text-right">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-slate-700">
                            {filteredLogs.length > 0 ? filteredLogs.map((row) => (
                                <tr key={row.id} className="hover:bg-slate-50/80 transition-colors">
                                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">{row.date}</td>
                                    <td className="py-3.5 px-4 font-mono text-emerald-700 font-semibold">{row.clock_in}</td>
                                    <td className="py-3.5 px-4 font-mono text-slate-600">
                                        {row.clock_out ? row.clock_out : <span className="italic text-blue-600 font-semibold">Active...</span>}
                                    </td>
                                    <td className="py-3.5 px-4 font-mono font-semibold text-slate-700">
                                        {row.total_hours ? `${Number(row.total_hours).toFixed(2)} hrs` : '--'}
                                    </td>
                                    <td className="py-3.5 px-4 text-right">
                                        <span className={`inline-block px-2.5 py-0.5 text-[11px] font-semibold border rounded-full ${
                                            row.status === 'Present' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                                            row.status === 'Late' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                                            'bg-rose-50 text-rose-700 border-rose-200'
                                        }`}>
                                            {row.status}
                                        </span>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={5} className="py-12 text-center text-slate-400 text-xs italic">No attendance records found for this period.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Printable DTR Modal */}
            <PrintableDTRModal 
                isOpen={isDTRModalOpen}
                onClose={() => setIsDTRModalOpen(false)}
                studentName={localStorage.getItem('userName') || 'Student Intern'}
                records={filteredLogs.map(l => ({
                    id: l.id,
                    student_name: localStorage.getItem('userName') || 'Student Intern',
                    date: l.date,
                    clock_in: l.clock_in,
                    clock_out: l.clock_out,
                    total_hours: Number(l.total_hours) || 0,
                    status: l.status as 'Present' | 'Late' | 'Absent'
                }))}
            />
        </div>
    );
};

export default StudentDashboard;