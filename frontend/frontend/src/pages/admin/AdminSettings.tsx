import { useState } from 'react';

const AdminSettings = () => {
    const [settings, setSettings] = useState({
        shiftStart: '08:00',
        shiftEnd: '17:00',
        gracePeriod: '15',
        requireLocation: false,
        autoLogout: true
    });

    const handleToggle = (key: string) => {
        setSettings(prev => ({ ...prev, [key]: !prev[key as keyof typeof prev] }));
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-black text-white tracking-tight">System Settings</h1>
                <p className="text-slate-400 mt-1 text-sm font-medium">Configure attendance rules and portal preferences.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Attendance Rules Card */}
                <div className="bg-[#0f172a]/50 border border-slate-800 rounded-3xl p-8 backdrop-blur-md">
                    <div className="flex items-center gap-3 mb-6">
                        <span className="text-2xl">🕒</span>
                        <h3 className="text-lg font-bold text-white">Attendance Rules</h3>
                    </div>
                    
                    <div className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Shift Start</label>
                                <input 
                                    type="time" 
                                    value={settings.shiftStart}
                                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:border-blue-500 outline-none transition-all"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Shift End</label>
                                <input 
                                    type="time" 
                                    value={settings.shiftEnd}
                                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:border-blue-500 outline-none transition-all"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Grace Period (Minutes)</label>
                            <input 
                                type="number" 
                                value={settings.gracePeriod}
                                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:border-blue-500 outline-none transition-all"
                            />
                            <p className="text-[10px] text-slate-500 italic">Students clocking in after this will be marked "Late".</p>
                        </div>
                    </div>
                </div>

                {/* System Permissions Card */}
                <div className="bg-[#0f172a]/50 border border-slate-800 rounded-3xl p-8 backdrop-blur-md">
                    <div className="flex items-center gap-3 mb-6">
                        <span className="text-2xl">🔒</span>
                        <h3 className="text-lg font-bold text-white">Access & Security</h3>
                    </div>

                    <div className="space-y-4">
                        {[
                            { id: 'requireLocation', label: 'Require GPS Location', desc: 'Verify user coordinates on clock-in.' },
                            { id: 'autoLogout', label: 'Force Session Expiry', desc: 'Log out users after 12 hours of inactivity.' }
                        ].map((item) => (
                            <div key={item.id} className="flex items-center justify-between p-4 bg-slate-900/50 border border-slate-800 rounded-2xl">
                                <div>
                                    <p className="text-sm font-bold text-slate-200">{item.label}</p>
                                    <p className="text-xs text-slate-500">{item.desc}</p>
                                </div>
                                <button 
                                    onClick={() => handleToggle(item.id)}
                                    className={`w-12 h-6 rounded-full relative transition-colors duration-300 ${settings[item.id as keyof typeof settings] ? 'bg-blue-600' : 'bg-slate-700'}`}
                                >
                                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-300 ${settings[item.id as keyof typeof settings] ? 'left-7' : 'left-1'}`} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end pt-4">
                <button className="px-8 py-4 bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-2xl font-bold shadow-xl shadow-blue-500/20 transition-all hover:scale-[1.02] active:scale-95">
                    Save Changes
                </button>
            </div>
        </div>
    );
};

export default AdminSettings;