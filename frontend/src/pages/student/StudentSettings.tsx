import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import {
    User,
    Lock,
    Bell,
    Sliders,
    Save,
    RotateCcw,
    ShieldCheck,
    CheckCircle2,
    Search,
    X,
    Clock,
    Activity,
    Info,
    AlertCircle,
    Phone,
    Mail,
    BookOpen,
    Hash
} from 'lucide-react';

export interface StudentSettingsState {
    // Profile Details
    full_name: string;
    email: string;
    phone: string;
    student_id: string;
    course: string;
    year_level: string;

    // Security Details
    currentPassword?: string;
    newPassword?: string;
    confirmPassword?: string;
    notifyDeviceLogin: boolean;

    // Notification Preferences
    emailAlertsTask: boolean;
    emailAlertsAnnouncement: boolean;
    shiftReminders: boolean;

    // App Preferences
    autoSaveDrafts: boolean;
    compactDashboard: boolean;
    soundEffects: boolean;
}

export const DEFAULT_STUDENT_SETTINGS: StudentSettingsState = {
    full_name: '',
    email: '',
    phone: '',
    student_id: '',
    course: '',
    year_level: '',

    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    notifyDeviceLogin: true,

    emailAlertsTask: true,
    emailAlertsAnnouncement: true,
    shiftReminders: true,

    autoSaveDrafts: true,
    compactDashboard: false,
    soundEffects: true
};

export const STUDENT_STORAGE_KEY = 'mentorlog_student_settings';

export const getStudentSettings = (): StudentSettingsState => {
    try {
        const saved = localStorage.getItem(STUDENT_STORAGE_KEY);
        return saved ? { ...DEFAULT_STUDENT_SETTINGS, ...JSON.parse(saved) } : DEFAULT_STUDENT_SETTINGS;
    } catch {
        return DEFAULT_STUDENT_SETTINGS;
    }
};

type CategoryKey = 'profile' | 'security' | 'notifications' | 'preferences';

interface CategoryTab {
    id: CategoryKey;
    label: string;
    description: string;
    icon: React.ElementType;
    activeTabBg: string;
    inactiveTabBg: string;
    iconBgActive: string;
    iconBgInactive: string;
    dotColor: string;
}

const CATEGORIES: CategoryTab[] = [
    {
        id: 'profile',
        label: 'Profile & Identity',
        description: 'Personal details, contact info & course track',
        icon: User,
        activeTabBg: 'bg-[#e0e7ff] border-2 border-indigo-600 ring-2 ring-indigo-200/60 shadow-xs text-indigo-950',
        inactiveTabBg: 'bg-[#f0f4fe]/70 border-indigo-200/80 hover:bg-[#f0f4fe] hover:border-indigo-300 text-indigo-900',
        iconBgActive: 'bg-indigo-600 text-white',
        iconBgInactive: 'bg-indigo-200/80 text-indigo-800',
        dotColor: 'bg-indigo-600',
    },
    {
        id: 'security',
        label: 'Security & Credentials',
        description: 'Password updates & account protection',
        icon: Lock,
        activeTabBg: 'bg-[#dcfce7] border-2 border-emerald-600 ring-2 ring-emerald-200/60 shadow-xs text-emerald-950',
        inactiveTabBg: 'bg-[#e6f4ea]/70 border-emerald-200/80 hover:bg-[#e6f4ea] hover:border-emerald-300 text-emerald-900',
        iconBgActive: 'bg-emerald-600 text-white',
        iconBgInactive: 'bg-emerald-200/80 text-emerald-800',
        dotColor: 'bg-emerald-600',
    },
    {
        id: 'notifications',
        label: 'Alerts & Notifications',
        description: 'Task updates, announcements & shift alerts',
        icon: Bell,
        activeTabBg: 'bg-[#f3e8ff] border-2 border-purple-600 ring-2 ring-purple-200/60 shadow-xs text-purple-950',
        inactiveTabBg: 'bg-[#f5f0ff]/70 border-purple-200/80 hover:bg-[#f5f0ff] hover:border-purple-300 text-purple-900',
        iconBgActive: 'bg-purple-600 text-white',
        iconBgInactive: 'bg-purple-200/80 text-purple-800',
        dotColor: 'bg-purple-600',
    },
    {
        id: 'preferences',
        label: 'Portal Preferences',
        description: 'Auto-save drafts, compact layout & sound FX',
        icon: Sliders,
        activeTabBg: 'bg-[#fef3c7] border-2 border-amber-500 ring-2 ring-amber-200/60 shadow-xs text-amber-950',
        inactiveTabBg: 'bg-[#fffbeb]/70 border-amber-200/80 hover:bg-[#fffbeb] hover:border-amber-300 text-amber-900',
        iconBgActive: 'bg-amber-500 text-white',
        iconBgInactive: 'bg-amber-200/80 text-amber-800',
        dotColor: 'bg-amber-500',
    }
];

const StudentSettings: React.FC = () => {
    const [settings, setSettings] = useState<StudentSettingsState>(getStudentSettings);
    const [savedSettings, setSavedSettings] = useState<StudentSettingsState>(settings);
    const [activeTab, setActiveTab] = useState<CategoryKey>('profile');
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(false);
    const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'info' | 'error' } | null>(null);
    const [showResetModal, setShowResetModal] = useState(false);

    const isDirty = JSON.stringify(settings) !== JSON.stringify(savedSettings);

    const showToast = (text: string, type: 'success' | 'info' | 'error' = 'success') => {
        setToastMessage({ text, type });
        setTimeout(() => setToastMessage(null), 3500);
    };

    // Fetch user profile from backend on load
    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const res = await api.get('/auth/profile');
                const data = res.data;
                const userData = data.user || data;

                if (userData) {
                    const loadedProfile: Partial<StudentSettingsState> = {
                        full_name: userData.full_name || '',
                        email: userData.email || '',
                        phone: userData.phone || '',
                        student_id: userData.student_id || '',
                        course: userData.course || '',
                        year_level: userData.year_level || ''
                    };

                    setSettings(prev => {
                        const merged = { ...prev, ...loadedProfile };
                        setSavedSettings(merged);
                        return merged;
                    });
                }
            } catch (err) {
                console.error("Failed to load profile", err);
            }
        };
        fetchUserData();
    }, []);

    const handleSave = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();

        if (settings.newPassword) {
            if (!settings.currentPassword) {
                showToast('Please enter your current password to set a new password.', 'error');
                return;
            }
            if (settings.newPassword !== settings.confirmPassword) {
                showToast('New password and confirmation password do not match.', 'error');
                return;
            }
        }

        setLoading(true);

        try {
            const response = await api.put('/auth/profile', {
                full_name: settings.full_name,
                phone: settings.phone,
                student_id: settings.student_id,
                course: settings.course,
                year_level: settings.year_level,
                current_password: settings.currentPassword || undefined,
                new_password: settings.newPassword || undefined,
            });

            if (response.data?.success) {
                const cleanSettings = {
                    ...settings,
                    currentPassword: '',
                    newPassword: '',
                    confirmPassword: ''
                };
                
                setSettings(cleanSettings);
                setSavedSettings(cleanSettings);
                localStorage.setItem(STUDENT_STORAGE_KEY, JSON.stringify(cleanSettings));

                // Broadcast events for UI components to re-render
                window.dispatchEvent(new Event('profileUpdated'));
                window.dispatchEvent(new CustomEvent('student_settings_updated', { detail: cleanSettings }));

                showToast('Student settings and profile updated successfully!');
            } else {
                showToast(response.data?.message || 'Failed to update profile.', 'error');
            }
        } catch (err: any) {
            showToast(err.response?.data?.message || 'Failed to save settings. Network error.', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleReset = () => {
        setSettings(DEFAULT_STUDENT_SETTINGS);
        setSavedSettings(DEFAULT_STUDENT_SETTINGS);
        localStorage.setItem(STUDENT_STORAGE_KEY, JSON.stringify(DEFAULT_STUDENT_SETTINGS));
        window.dispatchEvent(new CustomEvent('student_settings_updated', { detail: DEFAULT_STUDENT_SETTINGS }));
        setShowResetModal(false);
        showToast('Reset all preferences to system defaults.', 'info');
    };

    const handleToggle = (key: keyof StudentSettingsState) => {
        const updated = { ...settings, [key]: !settings[key] };
        setSettings(updated);
        localStorage.setItem(STUDENT_STORAGE_KEY, JSON.stringify(updated));
        window.dispatchEvent(new CustomEvent('student_settings_updated', { detail: updated }));
        showToast('Preference updated.', 'info');
    };

    // Switch Control Component matching AdminSettings
    const SwitchControl = ({
        checked,
        onChange,
        label,
        desc,
        colorClass = 'bg-blue-600',
        borderColor = 'border-slate-200'
    }: {
        checked: boolean;
        onChange: () => void;
        label: string;
        desc: string;
        colorClass?: string;
        borderColor?: string;
    }) => (
        <div className={`flex items-center justify-between p-4 bg-white border ${borderColor} rounded-xl hover:shadow-xs transition-all`}>
            <div className="space-y-0.5 pr-4">
                <p className="text-xs font-bold text-slate-800">{label}</p>
                <p className="text-[11px] text-slate-500">{desc}</p>
            </div>
            <button
                type="button"
                onClick={onChange}
                className={`w-11 h-6 rounded-full relative transition-colors duration-200 flex-shrink-0 cursor-pointer focus:outline-none ${
                    checked ? colorClass : 'bg-slate-200'
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
                            <User className="w-4 h-4 text-blue-600" />
                            <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wider">
                                Student Preferences
                            </span>
                            {isDirty && (
                                <span className="ml-2 px-2.5 py-0.5 text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 rounded-full animate-pulse">
                                    Unsaved Changes
                                </span>
                            )}
                        </div>
                        <h1 className="text-2xl font-bold text-slate-900">Student Configuration</h1>
                        <p className="text-xs text-slate-500 mt-1">
                            Manage your profile identity, contact information, password security, and portal notification preferences.
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
                            onClick={(e) => handleSave(e)}
                            disabled={loading}
                            className={`px-6 py-2.5 rounded-xl font-bold text-xs shadow-sm transition-all flex items-center gap-2 cursor-pointer ${
                                isDirty
                                    ? 'bg-blue-600 hover:bg-blue-700 text-white ring-2 ring-blue-200'
                                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                            } ${loading ? 'opacity-50 cursor-wait' : ''}`}
                        >
                            <Save className="w-4 h-4" />
                            <span>{loading ? 'Saving...' : 'Save Settings'}</span>
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

                    {/* Live Student Status Badges */}
                    <div className="flex flex-wrap items-center gap-2 text-[11px]">
                        <span className="flex items-center gap-1.5 px-3 py-1 bg-slate-100 text-slate-700 rounded-lg font-medium">
                            <Activity className="w-3.5 h-3.5 text-blue-600" />
                            Account Status: <strong className="text-emerald-600">Active Intern</strong>
                        </span>
                        {settings.student_id && (
                            <span className="flex items-center gap-1 px-3 py-1 bg-slate-100 text-slate-700 rounded-lg font-medium font-mono">
                                <Hash className="w-3.5 h-3.5 text-slate-500" />
                                {settings.student_id}
                            </span>
                        )}
                        {settings.course && (
                            <span className="flex items-center gap-1 px-3 py-1 bg-slate-100 text-slate-700 rounded-lg font-medium">
                                <BookOpen className="w-3.5 h-3.5 text-slate-500" />
                                {settings.course}
                            </span>
                        )}
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
                    {toastMessage.type === 'error' ? <AlertCircle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
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
                                className={`p-4.5 rounded-2xl border text-left transition-all cursor-pointer shadow-xs flex flex-col justify-between space-y-3 ${
                                    isActive
                                        ? cat.activeTabBg
                                        : `${cat.inactiveTabBg}`
                                }`}
                            >
                                <div className="flex items-center justify-between">
                                    <div className={`p-2 rounded-xl transition-colors ${isActive ? cat.iconBgActive : cat.iconBgInactive}`}>
                                        <IconComponent className="w-4 h-4" />
                                    </div>
                                    {isActive && <span className={`w-2.5 h-2.5 rounded-full ${cat.dotColor}`} />}
                                </div>
                                <div>
                                    <p className="text-xs font-extrabold tracking-tight">{cat.label}</p>
                                    <p className="text-[11px] opacity-80 mt-0.5 leading-snug">{cat.description}</p>
                                </div>
                            </button>
                        );
                    })}
                </div>
            )}

            {/* Main Section Content - Distinct Themed Grid Boxes */}
            <div className="space-y-6">
                
                {/* 1. PROFILE & IDENTITY */}
                {(activeTab === 'profile' || searchQuery) && (
                    <div className="bg-[#f0f4fe] border border-indigo-200/90 rounded-3xl p-6 md:p-8 shadow-xs space-y-6">
                        <div className="flex items-center gap-3 pb-4 border-b border-indigo-200/70">
                            <div className="p-2.5 rounded-xl bg-indigo-600 text-white shadow-xs">
                                <User className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="text-base font-extrabold text-indigo-950">Profile & Identity Details</h3>
                                <p className="text-xs text-indigo-700/90">Update your account name, contact details, and academic track information.</p>
                            </div>
                        </div>

                        {/* Informative Status Banner for Profile */}
                        <div className="flex items-center gap-2 p-3.5 bg-white/90 border border-indigo-200 rounded-xl text-xs text-indigo-900 shadow-2xs">
                            <Info className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                            <span>
                                <strong>Academic Record Verification:</strong> Your Email Address and Student ID are linked to your official OJT internship records. Contact your mentor for structural changes.
                            </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Personal Details */}
                            <div className="space-y-4 bg-white p-5 rounded-2xl border border-indigo-100/90 shadow-2xs">
                                <div className="flex items-center gap-2 text-xs font-bold text-indigo-900">
                                    <User className="w-4 h-4 text-indigo-600" />
                                    <span>Personal Information</span>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-[11px] font-bold text-slate-700">Full Name</label>
                                    <input
                                        type="text"
                                        value={settings.full_name}
                                        onChange={(e) => setSettings({ ...settings, full_name: e.target.value })}
                                        className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-slate-800 focus:bg-white focus:border-indigo-600 outline-none transition-all"
                                        placeholder="Enter your full name"
                                    />
                                </div>

                                <div className="space-y-1">
                                    <label className="text-[11px] font-bold text-slate-700">Email Address (Read-only)</label>
                                    <div className="relative">
                                        <Mail className="w-3.5 h-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                                        <input
                                            type="email"
                                            value={settings.email}
                                            disabled
                                            className="w-full bg-slate-100 border border-slate-200 rounded-xl pl-9 pr-3.5 py-2 text-xs text-slate-400 cursor-not-allowed font-mono"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-[11px] font-bold text-slate-700">Phone Number</label>
                                    <div className="relative">
                                        <Phone className="w-3.5 h-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                                        <input
                                            type="text"
                                            value={settings.phone}
                                            onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                                            className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3.5 py-2 text-xs text-slate-800 focus:bg-white focus:border-indigo-600 outline-none transition-all"
                                            placeholder="+63 900 000 0000"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Academic & OJT Track Information */}
                            <div className="space-y-4 bg-white p-5 rounded-2xl border border-indigo-100/90 shadow-2xs">
                                <div className="flex items-center gap-2 text-xs font-bold text-indigo-900">
                                    <BookOpen className="w-4 h-4 text-indigo-600" />
                                    <span>Academic & Internship Details</span>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-[11px] font-bold text-slate-700">Student ID Number</label>
                                    <div className="relative">
                                        <Hash className="w-3.5 h-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                                        <input
                                            type="text"
                                            value={settings.student_id}
                                            onChange={(e) => setSettings({ ...settings, student_id: e.target.value })}
                                            className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3.5 py-2 text-xs text-slate-800 focus:bg-white focus:border-indigo-600 outline-none font-mono transition-all"
                                            placeholder="e.g. 2024-00123"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-[11px] font-bold text-slate-700">Course / Degree Program</label>
                                    <input
                                        type="text"
                                        value={settings.course}
                                        onChange={(e) => setSettings({ ...settings, course: e.target.value })}
                                        className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-slate-800 focus:bg-white focus:border-indigo-600 outline-none transition-all"
                                        placeholder="e.g. BS Information Technology"
                                    />
                                </div>

                                <div className="space-y-1">
                                    <label className="text-[11px] font-bold text-slate-700">Year Level / Batch</label>
                                    <input
                                        type="text"
                                        value={settings.year_level}
                                        onChange={(e) => setSettings({ ...settings, year_level: e.target.value })}
                                        className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-slate-800 focus:bg-white focus:border-indigo-600 outline-none transition-all"
                                        placeholder="e.g. 4th Year - Senior"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* 2. SECURITY & CREDENTIALS */}
                {(activeTab === 'security' || searchQuery) && (
                    <div className="bg-[#e6f4ea] border border-emerald-200/90 rounded-3xl p-6 md:p-8 shadow-xs space-y-6">
                        <div className="flex items-center gap-3 pb-4 border-b border-emerald-200/70">
                            <div className="p-2.5 rounded-xl bg-emerald-600 text-white shadow-xs">
                                <ShieldCheck className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="text-base font-extrabold text-emerald-950">Security & Account Credentials</h3>
                                <p className="text-xs text-emerald-800/90">Update account password and manage device login notifications.</p>
                            </div>
                        </div>

                        {/* Informative Security Message */}
                        <div className="flex items-center gap-2 p-3.5 bg-white/90 border border-emerald-200 rounded-xl text-xs text-emerald-900 shadow-2xs">
                            <Info className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                            <span>
                                <strong>Password Guidelines:</strong> Enter your current password to authorize password changes. Use a strong password containing letters and numbers.
                            </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Password Change Box */}
                            <div className="space-y-4 bg-white p-5 rounded-2xl border border-emerald-100/90 shadow-2xs">
                                <div className="flex items-center gap-2 text-xs font-bold text-emerald-900">
                                    <Lock className="w-4 h-4 text-emerald-600" />
                                    <span>Update Password</span>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-[11px] font-bold text-slate-700">Current Password</label>
                                    <input
                                        type="password"
                                        value={settings.currentPassword || ''}
                                        onChange={(e) => setSettings({ ...settings, currentPassword: e.target.value })}
                                        className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-slate-800 focus:bg-white focus:border-emerald-600 outline-none transition-all"
                                        placeholder="••••••••"
                                    />
                                </div>

                                <div className="space-y-1">
                                    <label className="text-[11px] font-bold text-slate-700">New Password</label>
                                    <input
                                        type="password"
                                        value={settings.newPassword || ''}
                                        onChange={(e) => setSettings({ ...settings, newPassword: e.target.value })}
                                        className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-slate-800 focus:bg-white focus:border-emerald-600 outline-none transition-all"
                                        placeholder="••••••••"
                                    />
                                </div>

                                <div className="space-y-1">
                                    <label className="text-[11px] font-bold text-slate-700">Confirm New Password</label>
                                    <input
                                        type="password"
                                        value={settings.confirmPassword || ''}
                                        onChange={(e) => setSettings({ ...settings, confirmPassword: e.target.value })}
                                        className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-slate-800 focus:bg-white focus:border-emerald-600 outline-none transition-all"
                                        placeholder="••••••••"
                                    />
                                </div>
                            </div>

                            {/* Session & Device Controls */}
                            <div className="space-y-4 bg-white p-5 rounded-2xl border border-emerald-100/90 shadow-2xs">
                                <div className="flex items-center gap-2 text-xs font-bold text-emerald-900">
                                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                                    <span>Session Protection</span>
                                </div>

                                <SwitchControl
                                    checked={settings.notifyDeviceLogin}
                                    onChange={() => handleToggle('notifyDeviceLogin')}
                                    label="New Login Alert"
                                    desc="Receive security notification alerts when a new device accesses your account."
                                    colorClass="bg-emerald-600"
                                    borderColor="border-emerald-100"
                                />

                                <div className="p-4 bg-emerald-50/50 border border-emerald-100 rounded-xl space-y-1">
                                    <p className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                                        <Clock className="w-3.5 h-3.5 text-emerald-600" />
                                        Session Security Timeout
                                    </p>
                                    <p className="text-[11px] text-emerald-700">
                                        Inactive portal sessions automatically terminate after 12 hours for account protection.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* 3. ALERTS & NOTIFICATIONS */}
                {(activeTab === 'notifications' || searchQuery) && (
                    <div className="bg-[#f5f0ff] border border-purple-200/90 rounded-3xl p-6 md:p-8 shadow-xs space-y-6">
                        <div className="flex items-center gap-3 pb-4 border-b border-purple-200/70">
                            <div className="p-2.5 rounded-xl bg-purple-600 text-white shadow-xs">
                                <Bell className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="text-base font-extrabold text-purple-950">Alerts & Notification Preferences</h3>
                                <p className="text-xs text-purple-800/90">Customize how and when you receive portal alerts, announcements, and task updates.</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <SwitchControl
                                checked={settings.emailAlertsTask}
                                onChange={() => handleToggle('emailAlertsTask')}
                                label="Task Assignment Notifications"
                                desc="Receive email alerts whenever mentors assign new OJT tasks or update task statuses."
                                colorClass="bg-purple-600"
                                borderColor="border-purple-100"
                            />

                            <SwitchControl
                                checked={settings.emailAlertsAnnouncement}
                                onChange={() => handleToggle('emailAlertsAnnouncement')}
                                label="Admin Announcement Alerts"
                                desc="Receive instant email updates for official announcements posted by administrative staff."
                                colorClass="bg-purple-600"
                                borderColor="border-purple-100"
                            />

                            <SwitchControl
                                checked={settings.shiftReminders}
                                onChange={() => handleToggle('shiftReminders')}
                                label="Shift & Attendance Reminders"
                                desc="Receive timely notifications prior to shift duty start times and daily time record submissions."
                                colorClass="bg-purple-600"
                                borderColor="border-purple-100"
                            />
                        </div>
                    </div>
                )}

                {/* 4. PORTAL PREFERENCES */}
                {(activeTab === 'preferences' || searchQuery) && (
                    <div className="bg-[#fffbeb] border border-amber-200/90 rounded-3xl p-6 md:p-8 shadow-xs space-y-6">
                        <div className="flex items-center gap-3 pb-4 border-b border-amber-200/70">
                            <div className="p-2.5 rounded-xl bg-amber-500 text-white shadow-xs">
                                <Sliders className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="text-base font-extrabold text-amber-950">Portal Experience & UI Preferences</h3>
                                <p className="text-xs text-amber-800/90">Personalize your student dashboard view and automatic draft behaviors.</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <SwitchControl
                                checked={settings.autoSaveDrafts}
                                onChange={() => handleToggle('autoSaveDrafts')}
                                label="Auto-Save Submission Drafts"
                                desc="Automatically preserve document submission notes and request drafts while typing."
                                colorClass="bg-amber-500"
                                borderColor="border-amber-100"
                            />

                            <SwitchControl
                                checked={settings.compactDashboard}
                                onChange={() => handleToggle('compactDashboard')}
                                label="High-Density Compact View"
                                desc="Use compact card dimensions on the student dashboard for faster navigation."
                                colorClass="bg-amber-500"
                                borderColor="border-amber-100"
                            />

                            <SwitchControl
                                checked={settings.soundEffects}
                                onChange={() => handleToggle('soundEffects')}
                                label="Audio Feedback & Chimes"
                                desc="Play subtle chime sounds upon successful clock-in, clock-out, and task submissions."
                                colorClass="bg-amber-500"
                                borderColor="border-amber-100"
                            />
                        </div>
                    </div>
                )}

            </div>

            {/* Reset Confirmation Modal */}
            {showResetModal && (
                <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
                    <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4 text-center">
                        <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-2">
                            <RotateCcw className="w-6 h-6" />
                        </div>

                        <div>
                            <h3 className="text-lg font-bold text-slate-900">Reset Student Preferences?</h3>
                            <p className="text-xs text-slate-500 mt-1">
                                Are you sure you want to revert all notification alerts, UI preferences, and security settings back to default parameters?
                            </p>
                        </div>

                        <div className="flex gap-3 pt-2">
                            <button
                                type="button"
                                onClick={() => setShowResetModal(false)}
                                className="w-1/2 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleReset}
                                className="w-1/2 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition-all"
                            >
                                Reset Defaults
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StudentSettings;