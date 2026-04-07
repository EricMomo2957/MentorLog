import { useState, useEffect, useCallback } from 'react';

// --- INTERFACES ---
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

interface ManualEntryState {
    date: string;
    clock_in: string;
    clock_out: string;
    status: 'Present' | 'Late' | 'Absent';
}

const StudentDashboard = () => {
    const NODE_API_URL = 'http://localhost:5000/api'; 

    // --- STATES ---
    const [isClockedIn, setIsClockedIn] = useState(false);
    const [currentTime, setCurrentTime] = useState(new Date());
    const [history, setHistory] = useState<AttendanceSession[]>([]);
    const [report, setReport] = useState<WeeklyReport>({ accumulated_hours: 0, days_present: 0, days_late: 0 });
    const [hasCompletedShift, setHasCompletedShift] = useState(false);
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Initial Helper for Date
    const getTodayDate = () => new Date().toISOString().split('T')[0];

    const [manualEntry, setManualEntry] = useState<ManualEntryState>({
        date: getTodayDate(),
        clock_in: '',
        clock_out: '',
        status: 'Present'
    });

    const totalTargetHours = 600;

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
            const token = localStorage.getItem('token');
            const headers = { 'Authorization': `Bearer ${token}` };

            const [historyRes, reportRes] = await Promise.all([
                fetch(`${NODE_API_URL}/attendance/history`, { headers }),
                fetch(`${NODE_API_URL}/attendance/weekly-report`, { headers })
            ]);

            const historyData: AttendanceSession[] = await historyRes.json();
            const reportData = await reportRes.json();

            if (Array.isArray(historyData)) {
                setHistory(historyData);
                const activeSession = historyData.find(log => log.clock_out === null);
                const clockedInStatus = !!activeSession;
                setIsClockedIn(clockedInStatus);

                if (!clockedInStatus) {
                    const todayStr = getTodayDate();
                    const finishedToday = historyData.some(log => 
                        log.date.startsWith(todayStr) && log.clock_out !== null
                    );
                    setHasCompletedShift(finishedToday);
                } else {
                    setHasCompletedShift(false);
                }
            }

            if (reportData) {
                setReport({
                    accumulated_hours: Number(reportData.accumulated_hours) || 0,
                    days_present: reportData.days_present || 0,
                    days_late: reportData.days_late || 0
                });
            }
        } catch (error) {
            console.error("Dashboard sync error:", error);
        }
    }, [NODE_API_URL]);

    useEffect(() => {
    // Define or call logic directly here
    const fetchData = async () => {
        try {
            // Your API calls here
        } catch (err) {
            console.error("Failed to refresh dashboard:", err);
        }
    };

    fetchData();
    
    const clockInterval = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(clockInterval);
}, []); // Empty array if you only want this to run once on mount

    // --- HANDLERS ---
    const handleManualSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Frontend Validation
        if (manualEntry.clock_out <= manualEntry.clock_in) {
            setToast({ message: "Clock-out must be after Clock-in", type: 'error' });
            return;
        }

        try {
            const response = await fetch(`${NODE_API_URL}/attendance/manual-log`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(manualEntry)
            });

            if (response.ok) {
                setToast({ message: "Entry saved successfully!", type: 'success' });
                setIsModalOpen(false);
                // Reset form for next time
                setManualEntry({ date: getTodayDate(), clock_in: '', clock_out: '', status: 'Present' });
                refreshDashboardData();
            } else {
                const data = await response.json();
                setToast({ message: data.message || "Failed to save entry.", type: 'error' });
            }
        } catch {
            setToast({ message: "Connection error.", type: 'error' });
        }
    };

    const handleClockToggle = async (actionOverride?: 'resume') => {
        const action = actionOverride || (isClockedIn ? 'clock-out' : 'clock-in');
        try {
            const response = await fetch(`${NODE_API_URL}/attendance/toggle`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ action })
            });

            if (response.ok) {
                setToast({ 
                    message: action === 'clock-out' ? "Clocked out!" : "Shift started!", 
                    type: 'success' 
                });
                refreshDashboardData();
            }
        } catch {
            setToast({ message: "Network error.", type: 'error' });
        }
    };

    const progressPercentage = Math.min((report.accumulated_hours / totalTargetHours) * 100, 100);

    return (
        <div className="max-w-6xl mx-auto space-y-8 pb-10 px-4">
            {/* Toast System */}
            {toast && (
                <div className={`fixed top-5 right-5 z-50 px-6 py-3 rounded-2xl shadow-xl border transition-all animate-in fade-in slide-in-from-top-4 ${
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
                                <input type="date" required value={manualEntry.date} onChange={e => setManualEntry({...manualEntry, date: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none transition-all"/>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-slate-400 text-xs font-bold uppercase mb-1 block">Clock In</label>
                                    <input type="time" required value={manualEntry.clock_in} onChange={e => setManualEntry({...manualEntry, clock_in: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none transition-all"/>
                                </div>
                                <div>
                                    <label className="text-slate-400 text-xs font-bold uppercase mb-1 block">Clock Out</label>
                                    <input type="time" required value={manualEntry.clock_out} onChange={e => setManualEntry({...manualEntry, clock_out: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none transition-all"/>
                                </div>
                            </div>
                            <div>
                                <label className="text-slate-400 text-xs font-bold uppercase mb-1 block">Status</label>
                                <select value={manualEntry.status} onChange={e => setManualEntry({...manualEntry, status: e.target.value as ManualEntryState['status']})} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none transition-all">
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

            {/* Dashboard Sections (Header, Stats, Table) remains same as previous clean version */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 bg-[#1e293b] p-8 rounded-3xl border border-slate-800 shadow-xl">
                <div className="space-y-1">
                    <h1 className="text-4xl font-black text-white tracking-tight italic">
                        STUDENT<span className="text-blue-500 text-stroke-thin">PORTAL</span>
                    </h1>
                    <p className="text-slate-400 font-medium font-mono uppercase tracking-widest text-sm">
                        {currentTime.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                    </p>
                </div>
                
                <div className="flex flex-wrap gap-3">
                    <button onClick={() => setIsModalOpen(true)} className="px-6 py-4 rounded-xl font-bold text-blue-400 border border-blue-500/30 hover:bg-blue-500/10 transition-all active:scale-95">
                        📝 Manual Entry
                    </button>
                    {hasCompletedShift && !isClockedIn && (
                        <button onClick={() => handleClockToggle('resume')} className="px-8 py-4 rounded-xl font-bold bg-amber-500/10 text-amber-500 border border-amber-500/50 hover:bg-amber-500 transition-all active:scale-95">
                            🔄 Resume Shift
                        </button>
                    )}
                    <button 
                        onClick={() => handleClockToggle()}
                        disabled={!isClockedIn && hasCompletedShift}
                        className={`px-10 py-4 rounded-xl font-bold transition-all shadow-lg text-lg ${
                            isClockedIn 
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-[#1e293b] p-8 rounded-3xl border border-slate-800 shadow-xl group">
                    <p className="text-slate-500 text-xs font-black uppercase tracking-[0.2em]">Total Progress</p>
                    <h3 className="text-5xl font-bold mt-3 text-white tabular-nums">
                        {report.accumulated_hours.toFixed(1)} <span className="text-lg text-slate-500 font-medium">/ {totalTargetHours}h</span>
                    </h3>
                    <div className="w-full bg-slate-900/50 h-3 rounded-full mt-8 overflow-hidden border border-slate-700/50">
                        <div className="bg-linear-to-r from-blue-600 to-emerald-500 h-full rounded-full transition-all duration-1000" style={{ width: `${progressPercentage}%` }}></div>
                    </div>
                </div>

                <div className="bg-[#1e293b] p-8 rounded-3xl border border-slate-800 shadow-xl group">
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
                            {history.length > 0 ? history.map((row) => (
                                <tr key={row.id} className="hover:bg-slate-800/30 transition-colors group">
                                    <td className="px-8 py-5 text-sm font-bold text-slate-300">{row.date}</td>
                                    <td className="px-8 py-5 text-sm font-mono text-emerald-400 group-hover:text-emerald-300 transition-colors">{row.clock_in}</td>
                                    <td className="px-8 py-5 text-sm font-mono text-slate-400">
                                        {row.clock_out ? <span className="text-red-400/80">{row.clock_out}</span> : <span className="italic text-blue-400 animate-pulse font-bold">Active...</span>}
                                    </td>
                                    <td className="px-8 py-5 text-sm font-mono text-slate-300">
                                        {row.total_hours ? `${Number(row.total_hours).toFixed(2)}h` : '--'}
                                    </td>
                                    <td className="px-8 py-5 text-right">
                                        <span className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                                            row.status === 'Present' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 
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