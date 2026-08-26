import React, { useState } from 'react';
import {
    Settings,
    Clock,
    Save,
    ShieldCheck,
    FileText,
    Bell,
    RotateCcw,
    AlertTriangle,
    CheckCircle2,
    Search,
    X,
    MapPin,
    Calendar,
    HardDrive,
    Lock,
    Send,
    Activity,
    Info
} from 'lucide-react';

export interface AdminSettingsState {
    // Attendance & Shift Rules
    shiftStart: string;
    shiftEnd: string;
    gracePeriod: number;
    requiredOjtHours: number;
    allowWeekendAttendance: boolean;

    // Security & GPS
    requireLocation: boolean;
    geofenceRadius: number;
    autoLogout: boolean;
    inactivityTimeoutHours: number;

    // Tasks & Reports
    weeklyReportDeadlineDay: string;
    weeklyReportDeadlineTime: string;
    allowLateSubmissions: boolean;
    maxAttachmentSizeBytes: number;
    requireMentorApprovalForLogs: boolean;

    // Notifications & System
    emailAlertsAbsenteeism: boolean;
    maintenanceMode: boolean;
    maintenanceNotice: string;
}

export const DEFAULT_SETTINGS: AdminSettingsState = {
    shiftStart: '08:00',
    shiftEnd: '17:00',
    gracePeriod: 15,
    requiredOjtHours: 400,
    allowWeekendAttendance: false,

    requireLocation: true,
    geofenceRadius: 100,
    autoLogout: true,
    inactivityTimeoutHours: 12,

    weeklyReportDeadlineDay: 'Friday',
    weeklyReportDeadlineTime: '23:59',
    allowLateSubmissions: true,
    maxAttachmentSizeBytes: 10,
    requireMentorApprovalForLogs: true,

    emailAlertsAbsenteeism: true,
    maintenanceMode: false,
    maintenanceNotice: 'System is currently undergoing scheduled maintenance. Please check back later.'
};

export const STORAGE_KEY = 'mentorlog_admin_settings';

/**
 * Utility function to retrieve current active Admin Settings anywhere in the app
 */
export const getAdminSettings = (): AdminSettingsState => {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        return saved ? { ...DEFAULT_SETTINGS, ...JSON.parse(saved) } : DEFAULT_SETTINGS;
    } catch {
        return DEFAULT_SETTINGS;
    }
};

type CategoryKey = 'attendance' | 'security' | 'submissions' | 'notifications';

interface CategoryTab {
    id: CategoryKey;
    label: string;
    description: string;
    icon: React.ElementType;
}

const CATEGORIES: CategoryTab[] = [
    {
        id: 'attendance',
        label: 'Attendance & Shift',
        description: 'Shift hours, grace limit & OJT target',
        icon: Clock,
    },
    {
        id: 'security',
        label: 'Security & Location',
        description: 'GPS Geo-fencing & session timeouts',
        icon: ShieldCheck,
    },
    {
        id: 'submissions',
        label: 'Tasks & Reports',
        description: 'Report deadlines & attachment caps',
        icon: FileText,
    },
    {
        id: 'notifications',
        label: 'Alerts & System',
        description: 'Email alerts & maintenance mode',
        icon: Bell,
    }
];

const AdminSettings: React.FC = () => {
    const [settings, setSettings] = useState<AdminSettingsState>(getAdminSettings);
    const [savedSettings, setSavedSettings] = useState<AdminSettingsState>(settings);
    const [activeTab, setActiveTab] = useState<CategoryKey>('attendance');
    const [searchQuery, setSearchQuery] = useState('');
    const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'info' | 'error' } | null>(null);
    const [showResetModal, setShowResetModal] = useState(false);
    const [showMaintenanceModal, setShowMaintenanceModal] = useState(false);
    const [testingNotification, setTestingNotification] = useState(false);

    const isDirty = JSON.stringify(settings) !== JSON.stringify(savedSettings);

    const showToast = (text: string, type: 'success' | 'info' | 'error' = 'success') => {
        setToastMessage({ text, type });
        setTimeout(() => setToastMessage(null), 3500);
    };

    const handleSave = () => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
            setSavedSettings(settings);
            // Broadcast event so other components (e.g. Student Dashboard / Clock-in) can update dynamically
            window.dispatchEvent(new CustomEvent('mentorlog_settings_updated', { detail: settings }));
            showToast('System configuration saved & broadcasted!');
        } catch {
            showToast('Failed to save settings.', 'error');
        }
    };

    const handleReset = () => {
        setSettings(DEFAULT_SETTINGS);
        setSavedSettings(DEFAULT_SETTINGS);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_SETTINGS));
        window.dispatchEvent(new CustomEvent('mentorlog_settings_updated', { detail: DEFAULT_SETTINGS }));
        setShowResetModal(false);
        showToast('Reset all parameters to system defaults.', 'info');
    };

    const handleToggle = (key: keyof AdminSettingsState) => {
        if (key === 'maintenanceMode' && !settings.maintenanceMode) {
            setShowMaintenanceModal(true);
            return;
        }

        const updated = { ...settings, [key]: !settings[key] };
        setSettings(updated);

        // Auto-save toggle changes to localStorage and broadcast event across components
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        setSavedSettings(updated);
        window.dispatchEvent(new CustomEvent('mentorlog_settings_updated', { detail: updated }));

        if (key === 'maintenanceMode') {
            showToast('Maintenance Mode deactivated.', 'info');
        } else if (key === 'allowWeekendAttendance') {
            showToast(
                updated.allowWeekendAttendance 
                    ? 'Weekend Attendance Enabled (Interns can clock in on Sat/Sun)' 
                    : 'Weekend Attendance Disabled (Weekend Rest Mode Active)', 
                'info'
            );
        }
    };

    const confirmMaintenanceMode = () => {
        const updated = { ...settings, maintenanceMode: true };
        setSettings(updated);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        setSavedSettings(updated);
        window.dispatchEvent(new CustomEvent('mentorlog_settings_updated', { detail: updated }));
        setShowMaintenanceModal(false);
        showToast('Maintenance Mode activated globally.', 'info');
    };

    const handleTestNotification = () => {
        setTestingNotification(true);
        setTimeout(() => {
            setTestingNotification(false);
            showToast('Test notification successfully sent to admin channel!', 'info');
        }, 1200);
    };

    // Calculate late threshold time string helper
    const getLateThresholdTime = () => {
        try {
            const [h, m] = settings.shiftStart.split(':').map(Number);
            const date = new Date();
            date.setHours(h, m + (settings.gracePeriod || 0), 0);
            return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
        } catch {
            return `${settings.shiftStart} + ${settings.gracePeriod}m`;
        }
    };

    // Switch Control Component
    const SwitchControl = ({
        checked,
        onChange,
        label,
        desc
    }: {
        checked: boolean;
        onChange: () => void;
        label: string;
        desc: string;
    }) => (
        <div className="flex items-center justify-between p-4 bg-white border border-slate-200 rounded-xl hover:border-slate-300 transition-all">
            <div className="space-y-0.5 pr-4">
                <p className="text-xs font-bold text-slate-800">{label}</p>
                <p className="text-[11px] text-slate-500">{desc}</p>
            </div>
            <button
                type="button"
                onClick={onChange}
                className={`w-11 h-6 rounded-full relative transition-colors duration-200 flex-shrink-0 cursor-pointer focus:outline-none ${
                    checked ? 'bg-blue-600' : 'bg-slate-200'
                }`}
            >
                <div
                    className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-200 shadow-sm ${
                        checked ? 'left-6' : 'left-1'
                    }`}
                />
            </button>
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto space-y-6 text-slate-800 pb-12">
            {/* Top Header Grid Box */}
            <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <Settings className="w-4 h-4 text-blue-600" />
                            <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wider">
                                System Preferences
                            </span>
                            {isDirty && (
                                <span className="ml-2 px-2.5 py-0.5 text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 rounded-full animate-pulse">
                                    Unsaved Changes
                                </span>
                            )}
                        </div>
                        <h1 className="text-2xl font-bold text-slate-900">System Configuration</h1>
                        <p className="text-xs text-slate-500 mt-1">
                            Manage attendance shift rules, location verification, and report submission policies across MentorLog.
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={() => setShowResetModal(true)}
                            className="bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 px-4 py-2.5 rounded-xl font-semibold text-xs transition-all flex items-center gap-2 cursor-pointer"
                        >
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>Reset Defaults</span>
                        </button>

                        <button
                            type="button"
                            onClick={handleSave}
                            className={`px-6 py-2.5 rounded-xl font-bold text-xs shadow-sm transition-all flex items-center gap-2 cursor-pointer ${
                                isDirty
                                    ? 'bg-blue-600 hover:bg-blue-700 text-white ring-2 ring-blue-200'
                                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                            }`}
                        >
                            <Save className="w-4 h-4" />
                            <span>Save Configuration</span>
                        </button>
                    </div>
                </div>

                {/* Integrated Search Input & Quick Status Summary Bar */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-2 border-t border-slate-100">
                    <div className="relative max-w-md flex-1">
                        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search settings..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-9 py-2 text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:border-blue-600 outline-none transition-all"
                        />
                        {searchQuery && (
                            <button
                                type="button"
                                onClick={() => setSearchQuery('')}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                            >
                                <X className="w-3.5 h-3.5" />
                            </button>
                        )}
                    </div>

                    {/* Live System Status Badges */}
                    <div className="flex flex-wrap items-center gap-2 text-[11px]">
                        <span className="flex items-center gap-1.5 px-3 py-1 bg-slate-100 text-slate-700 rounded-lg font-medium">
                            <Activity className="w-3.5 h-3.5 text-blue-600" />
                            Status: <strong className={settings.maintenanceMode ? "text-red-600" : "text-emerald-600"}>
                                {settings.maintenanceMode ? "Maintenance Active" : "Operational"}
                            </strong>
                        </span>
                        <span className="flex items-center gap-1 px-3 py-1 bg-slate-100 text-slate-700 rounded-lg font-medium">
                            <Clock className="w-3.5 h-3.5 text-slate-500" />
                            {settings.shiftStart} - {settings.shiftEnd}
                        </span>
                    </div>
                </div>
            </div>

            {/* Notification Toast */}
            {toastMessage && (
                <div
                    className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-xl shadow-lg border text-xs font-bold flex items-center gap-2 animate-in fade-in ${
                        toastMessage.type === 'error'
                            ? 'border-red-200 bg-red-50 text-red-700'
                            : toastMessage.type === 'info'
                            ? 'border-blue-200 bg-blue-50 text-blue-700'
                            : 'border-emerald-200 bg-emerald-50 text-emerald-700'
                    }`}
                >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{toastMessage.text}</span>
                </div>
            )}

            {/* Category Navigation Cards */}
            {!searchQuery && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {CATEGORIES.map((cat) => {
                        const IconComponent = cat.icon;
                        const isActive = activeTab === cat.id;

                        return (
                            <button
                                key={cat.id}
                                type="button"
                                onClick={() => setActiveTab(cat.id)}
                                className={`p-4 rounded-2xl border text-left transition-all cursor-pointer bg-white shadow-sm flex flex-col justify-between space-y-3 ${
                                    isActive
                                        ? 'border-2 border-blue-600 ring-2 ring-blue-50'
                                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
                                }`}
                            >
                                <div className="flex items-center justify-between">
                                    <div className={`p-2 rounded-xl ${isActive ? 'bg-blue-50 text-blue-600' : 'bg-slate-100 text-slate-600'}`}>
                                        <IconComponent className="w-4 h-4" />
                                    </div>
                                    {isActive && <span className="w-2 h-2 rounded-full bg-blue-600" />}
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-slate-900">{cat.label}</p>
                                    <p className="text-[11px] text-slate-500 mt-0.5">{cat.description}</p>
                                </div>
                            </button>
                        );
                    })}
                </div>
            )}

            {/* Main Section Content - White Grid Box */}
            <div className="space-y-6">
                {/* 1. ATTENDANCE & SHIFT */}
                {(activeTab === 'attendance' || searchQuery) && (
                    <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
                        <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
                            <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600">
                                <Clock className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="text-base font-bold text-slate-900">Attendance & Shift Schedule Rules</h3>
                                <p className="text-xs text-slate-500">Define office working hours and late threshold for student attendance.</p>
                            </div>
                        </div>

                        {/* Informative Status Banner for Attendance */}
                        <div className="flex items-center gap-2 p-3.5 bg-blue-50/80 border border-blue-100 rounded-xl text-xs text-blue-800">
                            <Info className="w-4 h-4 text-blue-600 flex-shrink-0" />
                            <span>
                                <strong>Active Shift Rule:</strong> Shift runs from <strong>{settings.shiftStart}</strong> to <strong>{settings.shiftEnd}</strong>. Clock-ins after <strong>{getLateThresholdTime()}</strong> (+{settings.gracePeriod}m grace) will be tagged as <span className="underline font-bold">"Late"</span>.
                            </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Shift Start & End */}
                            <div className="space-y-4 bg-slate-50/60 p-5 rounded-2xl border border-slate-200/80">
                                <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                                    <Calendar className="w-4 h-4 text-blue-600" />
                                    <span>Working Hours</span>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-[11px] font-bold text-slate-600">Shift Start Time</label>
                                        <input
                                            type="time"
                                            value={settings.shiftStart}
                                            onChange={(e) => setSettings({ ...settings, shiftStart: e.target.value })}
                                            className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-slate-800 focus:border-blue-600 outline-none"
                                        />
                                    </div>

                                    <div className="space-y-1">
                                        <label className="text-[11px] font-bold text-slate-600">Shift End Time</label>
                                        <input
                                            type="time"
                                            value={settings.shiftEnd}
                                            onChange={(e) => setSettings({ ...settings, shiftEnd: e.target.value })}
                                            className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-slate-800 focus:border-blue-600 outline-none"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1 pt-1">
                                    <label className="text-[11px] font-bold text-slate-600">Grace Period (Minutes)</label>
                                    <input
                                        type="number"
                                        min={0}
                                        max={120}
                                        value={settings.gracePeriod}
                                        onChange={(e) => setSettings({ ...settings, gracePeriod: parseInt(e.target.value) || 0 })}
                                        className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-slate-800 focus:border-blue-600 outline-none"
                                    />
                                    <p className="text-[11px] text-slate-500 mt-1">
                                        Students clocking in after this limit will be marked as "Late".
                                    </p>
                                </div>
                            </div>

                            {/* OJT Hours Target & Weekend Toggle */}
                            <div className="space-y-4 bg-slate-50/60 p-5 rounded-2xl border border-slate-200/80">
                                <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                                    <Clock className="w-4 h-4 text-emerald-600" />
                                    <span>Target Completion Hours</span>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-[11px] font-bold text-slate-600">Required OJT Target (Hours)</label>
                                    <input
                                        type="number"
                                        min={50}
                                        max={2000}
                                        value={settings.requiredOjtHours}
                                        onChange={(e) => setSettings({ ...settings, requiredOjtHours: parseInt(e.target.value) || 0 })}
                                        className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-slate-800 focus:border-blue-600 outline-none"
                                    />
                                </div>

                                <SwitchControl
                                    checked={settings.allowWeekendAttendance}
                                    onChange={() => handleToggle('allowWeekendAttendance')}
                                    label="Allow Weekend Attendance"
                                    desc="Permit clock-ins on Saturdays & Sundays."
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* 2. SECURITY & GPS */}
                {(activeTab === 'security' || searchQuery) && (
                    <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
                        <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
                            <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600">
                                <ShieldCheck className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="text-base font-bold text-slate-900">Security & Geo-Fencing Policies</h3>
                                <p className="text-xs text-slate-500">Enforce location bounds and session safety.</p>
                            </div>
                        </div>

                        {/* Informative Security Message */}
                        <div className="flex items-center gap-2 p-3.5 bg-emerald-50/80 border border-emerald-100 rounded-xl text-xs text-emerald-800">
                            <Info className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                            <span>
                                <strong>Geo-Fencing Status:</strong> {settings.requireLocation ? (
                                    <>Location verification is <strong className="text-emerald-700">ENFORCED</strong>. Student clock-in required within <strong>{settings.geofenceRadius}m</strong> radius.</>
                                ) : (
                                    <>GPS Location check is currently disabled.</>
                                )}
                            </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4 bg-slate-50/60 p-5 rounded-2xl border border-slate-200/80">
                                <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                                    <MapPin className="w-4 h-4 text-emerald-600" />
                                    <span>GPS Location Limits</span>
                                </div>

                                <SwitchControl
                                    checked={settings.requireLocation}
                                    onChange={() => handleToggle('requireLocation')}
                                    label="Require GPS Geo-Fencing"
                                    desc="Validate student coordinates on clock-in."
                                />

                                <div className="space-y-1 pt-1">
                                    <div className="flex justify-between items-center text-[11px]">
                                        <label className="font-bold text-slate-600">Geofence Radius</label>
                                        <span className="text-emerald-700 font-bold">{settings.geofenceRadius} meters</span>
                                    </div>
                                    <input
                                        type="range"
                                        min={20}
                                        max={500}
                                        step={10}
                                        value={settings.geofenceRadius}
                                        onChange={(e) => setSettings({ ...settings, geofenceRadius: parseInt(e.target.value) || 50 })}
                                        className="w-full h-2 bg-slate-200 rounded-lg accent-emerald-600 cursor-pointer"
                                    />
                                </div>
                            </div>

                            <div className="space-y-4 bg-slate-50/60 p-5 rounded-2xl border border-slate-200/80">
                                <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                                    <Lock className="w-4 h-4 text-indigo-600" />
                                    <span>Session Security</span>
                                </div>

                                <SwitchControl
                                    checked={settings.autoLogout}
                                    onChange={() => handleToggle('autoLogout')}
                                    label="Force Inactivity Timeout"
                                    desc="Automatically logout dormant sessions."
                                />

                                <div className="space-y-1">
                                    <label className="text-[11px] font-bold text-slate-600">Inactivity Timeout (Hours)</label>
                                    <input
                                        type="number"
                                        min={1}
                                        max={72}
                                        value={settings.inactivityTimeoutHours}
                                        onChange={(e) => setSettings({ ...settings, inactivityTimeoutHours: parseInt(e.target.value) || 12 })}
                                        className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-slate-800 focus:border-blue-600 outline-none"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* 3. TASKS & REPORTS */}
                {(activeTab === 'submissions' || searchQuery) && (
                    <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
                        <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
                            <div className="p-2.5 rounded-xl bg-purple-50 text-purple-600">
                                <FileText className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="text-base font-bold text-slate-900">Tasks & Submission Policies</h3>
                                <p className="text-xs text-slate-500">Manage report deadlines and attachment limits.</p>
                            </div>
                        </div>

                        {/* Informative Report Message */}
                        <div className="flex items-center gap-2 p-3.5 bg-purple-50/80 border border-purple-100 rounded-xl text-xs text-purple-800">
                            <Info className="w-4 h-4 text-purple-600 flex-shrink-0" />
                            <span>
                                <strong>Report Policy:</strong> Weekly report submission deadline is <strong>{settings.weeklyReportDeadlineDay} at {settings.weeklyReportDeadlineTime}</strong>. Max attachment size is <strong>{settings.maxAttachmentSizeBytes}MB</strong>.
                            </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4 bg-slate-50/60 p-5 rounded-2xl border border-slate-200/80">
                                <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                                    <Calendar className="w-4 h-4 text-purple-600" />
                                    <span>Weekly Report Deadline</span>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-[11px] font-bold text-slate-600">Deadline Day</label>
                                        <select
                                            value={settings.weeklyReportDeadlineDay}
                                            onChange={(e) => setSettings({ ...settings, weeklyReportDeadlineDay: e.target.value })}
                                            className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 focus:border-blue-600 outline-none"
                                        >
                                            {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
                                                <option key={day} value={day}>{day}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="space-y-1">
                                        <label className="text-[11px] font-bold text-slate-600">Cut-Off Time</label>
                                        <input
                                            type="time"
                                            value={settings.weeklyReportDeadlineTime}
                                            onChange={(e) => setSettings({ ...settings, weeklyReportDeadlineTime: e.target.value })}
                                            className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 focus:border-blue-600 outline-none"
                                        />
                                    </div>
                                </div>

                                <SwitchControl
                                    checked={settings.allowLateSubmissions}
                                    onChange={() => handleToggle('allowLateSubmissions')}
                                    label="Allow Late Report Submissions"
                                    desc="Permit report uploads past deadline."
                                />
                            </div>

                            <div className="space-y-4 bg-slate-50/60 p-5 rounded-2xl border border-slate-200/80">
                                <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                                    <HardDrive className="w-4 h-4 text-pink-600" />
                                    <span>File & Approval Controls</span>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-[11px] font-bold text-slate-600">Max Attachment File Size (MB)</label>
                                    <input
                                        type="number"
                                        min={2}
                                        max={100}
                                        value={settings.maxAttachmentSizeBytes}
                                        onChange={(e) => setSettings({ ...settings, maxAttachmentSizeBytes: parseInt(e.target.value) || 5 })}
                                        className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-slate-800 focus:border-blue-600 outline-none"
                                    />
                                </div>

                                <SwitchControl
                                    checked={settings.requireMentorApprovalForLogs}
                                    onChange={() => handleToggle('requireMentorApprovalForLogs')}
                                    label="Require Mentor Sign-Off"
                                    desc="Daily logbook entries require mentor verification."
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* 4. ALERTS & SYSTEM */}
                {(activeTab === 'notifications' || searchQuery) && (
                    <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
                        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600">
                                    <Bell className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="text-base font-bold text-slate-900">Notifications & System Maintenance</h3>
                                    <p className="text-xs text-slate-500">Configure notifications and system lock parameters.</p>
                                </div>
                            </div>
                            
                            <button
                                type="button"
                                onClick={handleTestNotification}
                                disabled={testingNotification}
                                className="bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                            >
                                <Send className="w-3.5 h-3.5 text-amber-600" />
                                <span>{testingNotification ? "Sending..." : "Test Notification"}</span>
                            </button>
                        </div>

                        {/* Live Maintenance Notice Preview Banner when active */}
                        {settings.maintenanceMode && (
                            <div className="p-4 bg-red-50 border border-red-200 rounded-xl space-y-1">
                                <div className="flex items-center gap-2 text-red-700 font-bold text-xs">
                                    <AlertTriangle className="w-4 h-4" />
                                    <span>Maintenance Mode Active (Public Announcement Banner)</span>
                                </div>
                                <p className="text-xs text-red-600 font-mono bg-white/80 p-2.5 rounded-lg border border-red-100">
                                    "{settings.maintenanceNotice}"
                                </p>
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4 bg-slate-50/60 p-5 rounded-2xl border border-slate-200/80">
                                <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                                    <Bell className="w-4 h-4 text-amber-600" />
                                    <span>Email Notifications</span>
                                </div>

                                <SwitchControl
                                    checked={settings.emailAlertsAbsenteeism}
                                    onChange={() => handleToggle('emailAlertsAbsenteeism')}
                                    label="Email Alerts for Absenteeism"
                                    desc="Send automated email when student misses shift."
                                />
                            </div>

                            <div className="space-y-4 bg-slate-50/60 p-5 rounded-2xl border border-slate-200/80">
                                <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                                    <span>Maintenance Mode</span>
                                </div>

                                <SwitchControl
                                    checked={settings.maintenanceMode}
                                    onChange={() => handleToggle('maintenanceMode')}
                                    label="Enable Maintenance Mode"
                                    desc="Restrict clock-ins temporarily."
                                />

                                <div className="space-y-1">
                                    <label className="text-[11px] font-bold text-slate-600">Public Maintenance Message</label>
                                    <textarea
                                        rows={2}
                                        value={settings.maintenanceNotice}
                                        onChange={(e) => setSettings({ ...settings, maintenanceNotice: e.target.value })}
                                        className="w-full bg-white border border-slate-300 rounded-xl p-3 text-xs text-slate-800 focus:border-blue-600 outline-none resize-none"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Reset Modal */}
            {showResetModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
                    <div className="bg-white border border-slate-200 rounded-3xl max-w-md w-full p-6 shadow-xl space-y-5">
                        <div className="flex items-center gap-3 text-amber-600">
                            <div className="p-2.5 rounded-xl bg-amber-50">
                                <AlertTriangle className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="text-base font-bold text-slate-900">Reset to Defaults?</h3>
                                <p className="text-xs text-slate-500">Revert all settings to factory configuration.</p>
                            </div>
                        </div>

                        <p className="text-xs text-slate-600 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                            Are you sure you want to reset shift hours, grace period, and location policies back to default?
                        </p>

                        <div className="flex items-center justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => setShowResetModal(false)}
                                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleReset}
                                className="bg-amber-600 hover:bg-amber-700 text-white px-5 py-2 rounded-xl text-xs font-bold cursor-pointer"
                            >
                                Confirm Reset
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Maintenance Modal */}
            {showMaintenanceModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
                    <div className="bg-white border border-slate-200 rounded-3xl max-w-md w-full p-6 shadow-xl space-y-5">
                        <div className="flex items-center gap-3 text-red-600">
                            <div className="p-2.5 rounded-xl bg-red-50">
                                <AlertTriangle className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="text-base font-bold text-slate-900">Enable Maintenance Mode?</h3>
                                <p className="text-xs text-slate-500">Restrict student clock-ins.</p>
                            </div>
                        </div>

                        <p className="text-xs text-slate-600 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                            Enabling Maintenance Mode will block new student attendance check-ins.
                        </p>

                        <div className="flex items-center justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => setShowMaintenanceModal(false)}
                                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={confirmMaintenanceMode}
                                className="bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded-xl text-xs font-bold cursor-pointer"
                            >
                                Enable Maintenance
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminSettings;