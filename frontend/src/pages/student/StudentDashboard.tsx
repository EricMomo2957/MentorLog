import { useState, useEffect, useCallback } from 'react';
import api from '../../services/api';
import { getAdminSettings } from '../admin/AdminSettings';
import { PrintableDTRModal } from '../../components/PrintableDTRModal';
import { 
    Clock, Play, Square, CheckCircle2, ShieldCheck, AlertCircle, AlertTriangle, 
    Printer, Filter, X 
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
    const [adminSettings, setAdminSettingsState] = useState(getAdminSettings);

    const [showExtensionModal, setShowExtensionModal] = useState(false);
    const [hasAcceptedExtension, setHasAcceptedExtension] = useState(false);

    const [allTasks, setAllTasks] = useState<TaskItem[]>([]);
    const [pendingTasks, setPendingTasks] = useState<TaskItem[]>([]);
    const [latestAnnouncement, setLatestAnnouncement] = useState<AnnouncementItem | null>(null);

    const [dateRange, setDateRange] = useState<string>('All');
    const [isDTRModalOpen, setIsDTRModalOpen] = useState(false);
    const [isReasonModalOpen, setIsReasonModalOpen] = useState(false);
    const [overtimeReason, setOvertimeReason] = useState('');

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

    const formatTimeString = (timeStr: string | null | undefined): string => {
        if (!timeStr) return '--';
        if (timeStr.includes('T')) {
            const d = new Date(timeStr);
            if (!isNaN(d.getTime())) {
                return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
            }
        }
        const parts = timeStr.trim().split(':');
        if (parts.length >= 2) {
            let hours = parseInt(parts[0], 10);
            const minutes = parts[1];
            const seconds = parts[2] ? parts[2].split(' ')[0] : undefined;
            if (timeStr.toUpperCase().includes('AM') || timeStr.toUpperCase().includes('PM')) {
                return timeStr;
            }
            const ampm = hours >= 12 ? 'PM' : 'AM';
            hours = hours % 12;
            hours = hours ? hours : 12;
            const pad = (n: number) => n.toString().padStart(2, '0');
            return seconds 
                ? `${pad(hours)}:${minutes}:${seconds} ${ampm}`
                : `${pad(hours)}:${minutes} ${ampm}`;
        }
        return timeStr;
    };

    const formatDateString = (dateStr: string | null | undefined): string => {
        if (!dateStr) return '--';
        const cleanDate = dateStr.split('T')[0];
        const dateObj = new Date(cleanDate + 'T00:00:00');
        if (!isNaN(dateObj.getTime())) {
            return dateObj.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: '2-digit' });
        }
        return cleanDate;
    };

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
            const [historyRes, reportRes, profileRes, taskRes, annRes] = await Promise.allSettled([
                api.get('/attendance/history'),
                api.get('/attendance/weekly-report'),
                api.get('/auth/profile'),
                api.get('/tasks/my-tasks'),
                api.get('/announcements/all')
            ]);

            const historyData = historyRes.status === 'fulfilled' ? historyRes.value.data : [];
            const reportData = reportRes.status === 'fulfilled' ? reportRes.value.data : null;
            const profileData = profileRes.status === 'fulfilled' ? (profileRes.value.data?.user || profileRes.value.data) : null;
            const taskData = taskRes.status === 'fulfilled' 
                ? (Array.isArray(taskRes.value.data) ? taskRes.value.data : (taskRes.value.data?.data || [])) 
                : [];
            const annData = annRes.status === 'fulfilled' 
                ? (Array.isArray(annRes.value.data) ? annRes.value.data : (annRes.value.data?.data || [])) 
                : [];

            const currentSettings = getAdminSettings();
            const targetHours = currentSettings.requiredOjtHours || (profileData && Number(profileData.ojt_hours_required)) || 600;
            setTotalTargetHours(targetHours);

            if (Array.isArray(taskData)) {
                setAllTasks(taskData);
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
                    log.date && log.date.includes(todayStr) && log.clock_out !== null
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

        const handleSettingsUpdate = () => {
            setAdminSettingsState(getAdminSettings());
            refreshDashboardData();
        };
        window.addEventListener('mentorlog_settings_updated', handleSettingsUpdate);
        window.addEventListener('storage', handleSettingsUpdate);

        return () => {
            clearInterval(clockInterval);
            window.removeEventListener('mentorlog_settings_updated', handleSettingsUpdate);
            window.removeEventListener('storage', handleSettingsUpdate);
        };
    }, [refreshDashboardData]);

    // Shift Extension & 6:30 PM Cutoff Monitor
    useEffect(() => {
        if (isClockedIn) {
            const now = currentTime;
            const currentMins = now.getHours() * 60 + now.getMinutes();

            // At or after 5:00 PM (1020 mins) up to 6:30 PM (1110 mins), prompt for shift extension if not yet accepted/dismissed
            if (currentMins >= 1020 && currentMins < 1110 && !hasAcceptedExtension && !showExtensionModal) {
                setShowExtensionModal(true);
            }

            // Automatic cutoff at 6:30 PM (1110 mins)
            if (currentMins >= 1110) {
                handleClockToggle('clock-out');
                setShowExtensionModal(false);
                setToast({
                    message: "Shift automatically ended! Maximum overtime limit (6:30 PM) reached.",
                    type: 'warning'
                });
            }
        }
    }, [currentTime, isClockedIn, hasAcceptedExtension, showExtensionModal]);

const isWithinShiftHours = (shiftStartStr: string, shiftEndStr: string): { allowed: boolean; reason?: string; isWeekendRest?: boolean } => {
    const currentSettings = adminSettings;
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const dayOfWeek = now.getDay(); // 0 = Sun, 6 = Sat

    // Check Weekend Attendance setting
    if (!currentSettings.allowWeekendAttendance && (dayOfWeek === 0 || dayOfWeek === 6)) {
        return {
            allowed: false,
            isWeekendRest: true,
            reason: "It's weekend — spend your time with your family and get rest!"
        };
    }

    const [startH, startM] = (shiftStartStr || '08:00').split(':').map(Number);
    const shiftStartMinutes = startH * 60 + (startM || 0);

    // Allow clock-in 30 mins before shiftStart
    const earliestClockInMinutes = Math.max(0, shiftStartMinutes - 30);

    const [endH, endM] = (shiftEndStr || '17:00').split(':').map(Number);
    const shiftEndMinutes = endH * 60 + (endM || 0);

    // Clock-in locks past 6:00 PM (18:00) or 1 hour past shiftEnd
    const latestClockInMinutes = Math.max(18 * 60, shiftEndMinutes + 60);

    if (currentMinutes < earliestClockInMinutes || currentMinutes >= latestClockInMinutes) {
        return {
            allowed: false,
            reason: `Clock-in is restricted outside official duty hours (${shiftStartStr} - ${shiftEndStr}).`
        };
    }

    return { allowed: true };
};

    const handleClockToggle = async (actionOverride?: 'clock-in' | 'clock-out' | 'resume') => {
        const currentSettings = getAdminSettings();
        const action = actionOverride || (isClockedIn ? 'clock-out' : 'clock-in');

        if (action === 'clock-in') {
            if (currentSettings.maintenanceMode) {
                setToast({
                    message: currentSettings.maintenanceNotice || "System is under maintenance. Clock-ins are temporarily restricted.",
                    type: 'warning'
                });
                return;
            }

            const shiftCheck = isWithinShiftHours(currentSettings.shiftStart, currentSettings.shiftEnd);
            const isWeekend = [0, 6].includes(new Date().getDay());
            const isAfterHours = !shiftCheck.allowed;

            if ((isWeekend || isAfterHours) && !overtimeReason.trim()) {
                setIsReasonModalOpen(true);
                return;
            }
        }

        try {
            const response = await api.post('/attendance/toggle', { 
                action,
                shiftStart: currentSettings.shiftStart,
                shiftEnd: currentSettings.shiftEnd,
                gracePeriod: currentSettings.gracePeriod,
                allowWeekendAttendance: currentSettings.allowWeekendAttendance,
                reason: overtimeReason
            });

            if (response.data?.success) {
                if (action === 'clock-out') {
                    setToast({ message: "Shift ended and hours recorded!", type: 'success' });
                } else {
                    const isLate = response.data.status === 'Late';
                    setToast({ 
                        message: isLate 
                            ? `Shift started! (Marked as Late Arrival — Clocked in after grace period of ${currentSettings.gracePeriod} mins)` 
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
    const remainingHours = Math.max(0, totalTargetHours - report.accumulated_hours);

    const presentCount = logs.filter(l => l.status === 'Present').length;
    const lateCount = logs.filter(l => l.status === 'Late').length;
    const absentCount = logs.filter(l => l.status === 'Absent').length;

    const pendingTasksCount = allTasks.filter(t => t.status === 'Pending').length;
    const inProgressTasksCount = allTasks.filter(t => t.status === 'In-Progress' || t.status === 'In-Process').length;
    const completedTasksCount = allTasks.filter(t => t.status === 'Completed').length;

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
            <div className="bg-[#f0f4fe] p-6 rounded-2xl border border-indigo-200/90 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <span className="text-[10px] font-bold text-white bg-indigo-600 px-2.5 py-0.5 rounded-md uppercase tracking-wider inline-block mb-1 shadow-2xs">
                        OJT Time Tracking Portal
                    </span>
                    <h1 className="text-2xl font-extrabold text-indigo-950 tracking-tight">Student Dashboard</h1>
                    <p className="text-xs text-indigo-800/80 mt-0.5 font-medium">
                        {currentTime.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                    </p>
                </div>

                {/* Main Action Button: Begin Shift / End Shift */}
                <div className="flex items-center gap-3 w-full md:w-auto">
                    <button
                        onClick={() => handleClockToggle()}
                        disabled={
                            (!isClockedIn && hasCompletedShift) ||
                            (!isClockedIn && adminSettings.maintenanceMode) ||
                            (!isClockedIn && !isWithinShiftHours(adminSettings.shiftStart, adminSettings.shiftEnd).allowed)
                        }
                        className={`px-6 py-2.5 rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-2 cursor-pointer ${
                            isClockedIn
                                ? 'bg-rose-600 hover:bg-rose-700 text-white'
                                : (!isClockedIn && adminSettings.maintenanceMode)
                                    ? 'bg-amber-100 text-amber-700 cursor-not-allowed border border-amber-300'
                                    : (!isClockedIn && !isWithinShiftHours(adminSettings.shiftStart, adminSettings.shiftEnd).allowed)
                                        ? 'bg-slate-100 text-slate-500 cursor-not-allowed border border-slate-200'
                                        : hasCompletedShift
                                            ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                                            : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                        }`}
                    >
                        {!isClockedIn && adminSettings.maintenanceMode ? (
                            <>
                                <AlertTriangle className="w-4 h-4 text-amber-600" />
                                <span>Maintenance Locked</span>
                            </>
                        ) : !isClockedIn && isWithinShiftHours(adminSettings.shiftStart, adminSettings.shiftEnd).isWeekendRest ? (
                            <>
                                <Clock className="w-4 h-4 text-amber-500" />
                                <span>It's weekend — spend your time with your family and get rest!</span>
                            </>
                        ) : !isClockedIn && !isWithinShiftHours(adminSettings.shiftStart, adminSettings.shiftEnd).allowed ? (
                            <>
                                <Clock className="w-4 h-4 text-slate-500" />
                                <span>Duty Locked (6:00 PM - 7:30 AM)</span>
                            </>
                        ) : !isClockedIn && hasCompletedShift ? (
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
                    hasAcceptedExtension 
                        ? 'bg-amber-600 border border-amber-700'
                        : activeLogItem.status === 'Late' 
                            ? 'bg-amber-500' 
                            : 'bg-emerald-600'
                }`}>
                    <div className="flex items-center gap-3.5">
                        <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                            <Clock className="w-5 h-5 text-white animate-spin" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-white animate-pulse"></span>
                                <span className="text-[10px] font-bold uppercase tracking-wider text-white/90">
                                    {hasAcceptedExtension 
                                        ? 'Extended Shift (Overtime — Max 6:30 PM)'
                                        : activeLogItem.status === 'Late' 
                                            ? 'Active Shift (Marked as Late Arrival — Clocked in after 8:30 AM)' 
                                            : 'Active Shift (On-Time Present — Grace period 7:30 AM - 8:30 AM)'
                                    }
                                </span>
                            </div>
                            <h2 className="text-lg font-bold tracking-tight mt-0.5">
                                Shift In Progress — Clocked In at {activeLogItem.clock_in}
                            </h2>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        {/* If past 5:00 PM and shift is active but not yet marked as extended, offer prompt trigger */}
                        {currentTime.getHours() >= 17 && !hasAcceptedExtension && (
                            <button
                                onClick={() => setShowExtensionModal(true)}
                                className="bg-white text-amber-900 hover:bg-amber-50 px-3.5 py-2 rounded-lg text-xs font-bold shadow-xs transition-all flex items-center gap-1.5 border border-white/30"
                            >
                                <Clock className="w-3.5 h-3.5 text-amber-600" />
                                <span>Extend Shift?</span>
                            </button>
                        )}

                        <div className="bg-white/10 px-6 py-2.5 rounded-lg border border-white/20 text-center font-mono">
                            <span className="text-2xl font-black tracking-wider">{getElapsedTime().formatted}</span>
                            <span className="text-[10px] uppercase block tracking-wider text-white/90 mt-0.5">Elapsed (HH : MM : SS)</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Shift Extension / Urgent Work Modal Prompt */}
            {showExtensionModal && (
                <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
                    <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4 text-center">
                        <div className="w-14 h-14 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-2 shadow-xs">
                            <Clock className="w-7 h-7 text-amber-600" />
                        </div>

                        <div>
                            <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">Do you want to extend your shift time?</h3>
                            <p className="text-xs text-slate-500 mt-1.5 leading-relaxed font-medium">
                                Regular OJT shift ended at <span className="font-bold text-slate-700">5:00 PM</span>. You have an extension allowance of up to <span className="font-bold text-amber-600">1 hr 30 mins (until 6:30 PM max)</span> for urgent tasks or overtime.
                            </p>
                        </div>

                        <div className="bg-amber-50 border border-amber-200/80 rounded-xl p-3.5 text-left text-xs space-y-1.5">
                            <div className="font-bold text-amber-900 flex items-center gap-1.5">
                                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                                Shift Extension Rules:
                            </div>
                            <ul className="text-amber-800 text-[11px] list-disc list-inside space-y-0.5 pt-0.5">
                                <li>Overtime extension is permitted up to <strong>6:30 PM maximum</strong>.</li>
                                <li>Clock-in system completely locks from <strong>6:00 PM</strong> to <strong>7:30 AM</strong>.</li>
                            </ul>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
                            <button
                                onClick={() => {
                                    setHasAcceptedExtension(true);
                                    setShowExtensionModal(false);
                                    setToast({ message: "Shift extended! You may work until 6:30 PM max.", type: 'success' });
                                }}
                                className="w-full sm:w-1/2 py-2.5 px-4 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5"
                            >
                                <Play className="w-3.5 h-3.5 fill-current" />
                                <span>Extend Shift</span>
                            </button>

                            <button
                                onClick={() => {
                                    setShowExtensionModal(false);
                                    handleClockToggle('clock-out');
                                }}
                                className="w-full sm:w-1/2 py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5"
                            >
                                <Square className="w-3.5 h-3.5 fill-current" />
                                <span>End Shift Now</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Metric Cards Grid - Distinct Colors */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* OJT Target Progress Card (Sky Blue Theme) */}
                <div className="bg-[#e0f2fe] p-6 rounded-2xl border border-sky-200/90 shadow-xs space-y-4">
                    <div className="flex justify-between items-center">
                        <span className="text-xs font-extrabold text-sky-900 uppercase tracking-wider">Total OJT Progress</span>
                        <span className="text-xs font-mono font-extrabold text-sky-800 bg-white px-2.5 py-1 rounded-md border border-sky-300 shadow-2xs">
                            {progressPercentage.toFixed(1)}% Complete
                        </span>
                    </div>

                    <div className="flex items-baseline justify-between">
                        <div className="flex items-baseline gap-2">
                            <span className="text-4xl font-extrabold text-sky-950 font-mono tracking-tight">
                                {report.accumulated_hours.toFixed(1)}
                            </span>
                            <span className="text-xs font-bold text-sky-700/90">/ {totalTargetHours} required hrs</span>
                        </div>
                        <div className="text-right">
                            <span className="text-[10px] font-extrabold text-sky-800 uppercase tracking-wider block">Remaining Time</span>
                            <span className="text-base font-extrabold font-mono text-sky-900">
                                {remainingHours.toFixed(1)} <span className="text-xs font-semibold text-sky-700">hrs left</span>
                            </span>
                        </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-sky-200/80 h-3 rounded-full overflow-hidden p-0.5">
                        <div 
                            className="bg-sky-600 h-full rounded-full transition-all duration-700" 
                            style={{ width: `${progressPercentage}%` }}
                        ></div>
                    </div>

                    <div className="flex items-center justify-between text-xs pt-1 border-t border-sky-200/70">
                        <span className="text-sky-800 font-bold flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-sky-600" />
                            Time to Completion
                        </span>
                        <span className="font-mono font-extrabold text-sky-800 bg-white px-3 py-1 rounded-full border border-sky-300 shadow-2xs">
                            {remainingHours === 0 ? 'Target Reached! 🎉' : `${remainingHours.toFixed(1)} hours remaining`}
                        </span>
                    </div>
                </div>

                {/* Attendance Summary Card (Emerald Green Theme) */}
                <div className="bg-[#e6f4ea] p-6 rounded-2xl border border-emerald-200/90 shadow-xs space-y-3">
                    <div className="flex justify-between items-center">
                        <span className="text-xs font-extrabold text-emerald-900 uppercase tracking-wider">Attendance Verification</span>
                        <span className="text-xs font-extrabold text-emerald-800 bg-white px-2.5 py-1 rounded-md border border-emerald-300 shadow-2xs flex items-center gap-1">
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Verified
                        </span>
                    </div>

                    {/* Present, Late, and Absent Breakdown Counters */}
                    <div className="grid grid-cols-3 gap-2.5 text-center pt-1">
                        <div className="bg-white border border-emerald-200/90 p-3.5 rounded-xl shadow-2xs">
                            <span className="text-2xl font-black text-emerald-700 font-mono block">
                                {presentCount}
                            </span>
                            <span className="text-[11px] font-extrabold text-emerald-800 uppercase tracking-wider block mt-0.5">Present</span>
                        </div>

                        <div className="bg-white border border-amber-200/90 p-3.5 rounded-xl shadow-2xs">
                            <span className="text-2xl font-black text-amber-600 font-mono block">
                                {lateCount}
                            </span>
                            <span className="text-[11px] font-extrabold text-amber-800 uppercase tracking-wider block mt-0.5">Late</span>
                        </div>

                        <div className="bg-white border border-rose-200/90 p-3.5 rounded-xl shadow-2xs">
                            <span className="text-2xl font-black text-rose-600 font-mono block">
                                {absentCount}
                            </span>
                            <span className="text-[11px] font-extrabold text-rose-800 uppercase tracking-wider block mt-0.5">Absent</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Overview Grid: Pending Tasks & Office Bulletin */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Task Directives Overview Widget (Soft Purple Theme) */}
                <div className="bg-[#f5f0ff] p-5.5 rounded-2xl border border-purple-200/90 shadow-xs flex flex-col justify-between">
                    <div>
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3 pb-2.5 border-b border-purple-200/70">
                            <h4 className="text-xs font-extrabold text-purple-950 uppercase tracking-wider flex items-center gap-1.5">
                                📌 Assigned Directives & Status
                            </h4>

                            {/* Task Breakdown Badges: Pending, In-Progress, Completed */}
                            <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                                    {pendingTasksCount} Pending
                                </span>
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-300">
                                    {inProgressTasksCount} In-Progress
                                </span>
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                                    {completedTasksCount} Completed
                                </span>
                            </div>
                        </div>

                        {pendingTasks.length > 0 ? (
                            <div className="space-y-2">
                                {pendingTasks.slice(0, 3).map((task) => (
                                    <div key={task.id} className="bg-white p-3 rounded-xl border border-purple-100/90 shadow-2xs flex items-center justify-between">
                                        <div className="space-y-0.5 max-w-[65%]">
                                            <div className="flex items-center gap-2">
                                                <span className={`inline-block px-1.5 py-0.2 text-[9px] font-extrabold border rounded ${
                                                    task.status === 'In-Progress' || task.status === 'In-Process'
                                                        ? 'bg-blue-50 text-blue-700 border-blue-200'
                                                        : 'bg-amber-50 text-amber-700 border-amber-200'
                                                }`}>
                                                    {task.status}
                                                </span>
                                                <p className="text-xs font-bold text-purple-950 truncate">{task.title}</p>
                                            </div>
                                            <p className="text-[11px] text-purple-700/80 truncate">{task.task_description || 'No description'}</p>
                                        </div>
                                        <span className="text-[10px] font-mono font-bold text-purple-800 bg-purple-50 px-2 py-1 rounded-lg border border-purple-200">
                                            Due {task.due_date ? new Date(task.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'N/A'}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-purple-600/70 text-xs italic py-6 text-center">No active task directives assigned.</p>
                        )}
                    </div>
                </div>

                {/* Latest Office Bulletin Widget (Soft Warm Amber Theme) */}
                <div className="bg-[#fffbeb] p-5.5 rounded-2xl border border-amber-200/90 shadow-xs flex flex-col justify-between">
                    <div>
                        <div className="flex justify-between items-center mb-3 pb-2.5 border-b border-amber-200/70">
                            <h4 className="text-xs font-extrabold text-amber-950 uppercase tracking-wider flex items-center gap-1.5">
                                📢 Office Bulletin
                            </h4>
                            <span className="text-[10px] font-bold text-amber-800 bg-white px-2 py-0.5 rounded-full border border-amber-300">Latest Announcement</span>
                        </div>

                        {latestAnnouncement ? (
                            <div className="bg-white p-3.5 rounded-xl border border-amber-200/80 shadow-2xs space-y-1.5">
                                <h5 className="text-xs font-bold text-amber-950">{latestAnnouncement.title}</h5>
                                <p className="text-xs text-amber-800/90 line-clamp-2 leading-relaxed">{latestAnnouncement.content}</p>
                                <p className="text-[10px] font-mono text-amber-700 font-semibold text-right pt-1">
                                    Posted {new Date(latestAnnouncement.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                </p>
                            </div>
                        ) : (
                            <p className="text-amber-700/70 text-xs italic py-6 text-center">No announcements posted yet.</p>
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
                                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">{formatDateString(row.date)}</td>
                                    <td className="py-3.5 px-4 font-mono text-emerald-700 font-semibold">{formatTimeString(row.clock_in)}</td>
                                    <td className="py-3.5 px-4 font-mono text-slate-600">
                                        {row.clock_out ? formatTimeString(row.clock_out) : <span className="italic text-blue-600 font-semibold">Active...</span>}
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
                    date: formatDateString(l.date),
                    clock_in: formatTimeString(l.clock_in),
                    clock_out: l.clock_out ? formatTimeString(l.clock_out) : null,
                    total_hours: Number(l.total_hours) || 0,
                    status: l.status as 'Present' | 'Late' | 'Absent'
                }))}
            />

            {/* Weekend / Overtime Clock-In Reason Modal */}
            {isReasonModalOpen && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
                    <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-100 space-y-4">
                        <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                                <Clock className="w-5 h-5 text-amber-500" />
                                Weekend / Overtime Clock-In Reason
                            </h3>
                            <button onClick={() => setIsReasonModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <p className="text-xs text-slate-500 leading-relaxed">
                            You are clocking in outside regular office hours or on a weekend. Please provide a brief note or reason for your overtime duty:
                        </p>

                        <textarea
                            rows={3}
                            value={overtimeReason}
                            onChange={(e) => setOvertimeReason(e.target.value)}
                            placeholder="e.g. Working on urgent client presentation & server deployment..."
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-800 placeholder-slate-400 focus:border-amber-500 outline-none transition-all"
                        />

                        <div className="flex justify-end gap-2 pt-2">
                            <button
                                onClick={() => setIsReasonModalOpen(false)}
                                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => {
                                    setIsReasonModalOpen(false);
                                    handleClockToggle('clock-in');
                                }}
                                disabled={!overtimeReason.trim()}
                                className="px-4 py-2 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 disabled:opacity-50 rounded-xl transition-all shadow-xs"
                            >
                                Submit & Clock In
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StudentDashboard;