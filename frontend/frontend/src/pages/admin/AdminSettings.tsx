import { useState } from 'react';
import { Settings, Clock, ShieldCheck, Save, MapPin, Lock } from 'lucide-react';

const AdminSettings = () => {
    const [settings, setSettings] = useState({
        shiftStart: '08:00',
        shiftEnd: '17:00',
        gracePeriod: '15',
        requireLocation: false,
        autoLogout: true
    });
    const [savedToast, setSavedToast] = useState(false);

    const handleToggle = (key: string) => {
        setSettings(prev => ({ ...prev, [key]: !prev[key as keyof typeof prev] }));
    };

    const handleSave = () => {
        setSavedToast(true);
        setTimeout(() => setSavedToast(false), 3000);
    };

    return (
        <div className="max-w-7xl mx-auto space-y-8 text-slate-200">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-[#0f172a]/60 backdrop-blur-xl p-8 rounded-3xl border border-slate-800/80 shadow-2xl">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <Settings className="w-4 h-4 text-blue-400" />
                        <span className="text-[10px] font-black text-blue-400 uppercase tracking-[0.3em]">System Preferences</span>
                    </div>
                    <h1 className="text-3xl font-black text-white tracking-tight">System Configuration</h1>
                    <p className="text-xs text-slate-400 mt-1">Configure default attendance shift schedules, security policies, and access controls.</p>
                </div>

                <button 
                    onClick={handleSave}
                    className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-3.5 rounded-2xl font-bold text-xs shadow-lg shadow-blue-600/20 transition-all active:scale-95 flex items-center gap-2"
                >
                    <Save className="w-4 h-4" />
                    <span>Save Configuration</span>
                </button>
            </div>

            {savedToast && (
                <div className="fixed bottom-8 right-8 z-50 px-6 py-4 rounded-2xl shadow-2xl border border-emerald-500/40 bg-emerald-950/90 text-emerald-400 backdrop-blur-md animate-in slide-in-from-bottom-5 transition-all text-xs font-bold flex items-center gap-2">
                    ✓ Configuration saved successfully!
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Attendance Rules Card */}
                <div className="bg-[#0f172a]/70 backdrop-blur-xl border border-slate-800/80 rounded-3xl p-8 shadow-2xl space-y-6">
                    <div className="flex items-center gap-3">
                        <div className="p-3 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
                            <Clock className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="text-base font-bold text-white">Attendance Shift Rules</h3>
                            <p className="text-xs text-slate-400">Define office working hours and late threshold</p>
                        </div>
                    </div>
                    
                    <div className="space-y-5">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-400">Shift Start Time</label>
                                <input 
                                    type="time" 
                                    value={settings.shiftStart}
                                    onChange={(e) => setSettings({...settings, shiftStart: e.target.value})}
                                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white focus:border-blue-500 outline-none transition-all"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-400">Shift End Time</label>
                                <input 
                                    type="time" 
                                    value={settings.shiftEnd}
                                    onChange={(e) => setSettings({...settings, shiftEnd: e.target.value})}
                                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white focus:border-blue-500 outline-none transition-all"
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-400">Grace Period (Minutes)</label>
                            <input 
                                type="number" 
                                value={settings.gracePeriod}
                                onChange={(e) => setSettings({...settings, gracePeriod: e.target.value})}
                                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white focus:border-blue-500 outline-none transition-all"
                            />
                            <p className="text-[11px] text-slate-500 italic">Students clocking in after this grace limit will be logged as "Late".</p>
                        </div>
                    </div>
                </div>

                {/* System Permissions Card */}
                <div className="bg-[#0f172a]/70 backdrop-blur-xl border border-slate-800/80 rounded-3xl p-8 shadow-2xl space-y-6">
                    <div className="flex items-center gap-3">
                        <div className="p-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                            <Lock className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="text-base font-bold text-white">Access & Security Policies</h3>
                            <p className="text-xs text-slate-400">Enforce authentication and geo-location limits</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        {[
                            { id: 'requireLocation', label: 'Require GPS Geo-Fencing', desc: 'Validate student coordinates on attendance clock-in.' },
                            { id: 'autoLogout', label: 'Force Inactivity Timeout', desc: 'Automatically logout inactive sessions after 12 hours.' }
                        ].map((item) => (
                            <div key={item.id} className="flex items-center justify-between p-5 bg-slate-900/60 border border-slate-800/60 rounded-2xl">
                                <div className="space-y-0.5">
                                    <p className="text-xs font-bold text-white">{item.label}</p>
                                    <p className="text-[11px] text-slate-400">{item.desc}</p>
                                </div>
                                <button 
                                    onClick={() => handleToggle(item.id)}
                                    className={`w-12 h-6 rounded-full relative transition-colors duration-300 ${settings[item.id as keyof typeof settings] ? 'bg-blue-600' : 'bg-slate-800'}`}
                                >
                                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-300 ${settings[item.id as keyof typeof settings] ? 'left-7' : 'left-1'}`} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminSettings;