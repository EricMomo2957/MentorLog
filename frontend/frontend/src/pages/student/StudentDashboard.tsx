import { useState } from 'react';
import StudentLayout from './StudentLayout';

const StudentDashboard = () => {
    // Persistent state: checks localStorage so the status survives page refreshes
    const [isClockedIn, setIsClockedIn] = useState(() => {
        return localStorage.getItem('isClockedIn') === 'true';
    });
    const [startTime, setStartTime] = useState(localStorage.getItem('startTime') || '');

    const handleClockToggle = () => {
        if (!isClockedIn) {
            // Clocking In logic
            const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            setIsClockedIn(true);
            setStartTime(now);
            localStorage.setItem('isClockedIn', 'true');
            localStorage.setItem('startTime', now);
        } else {
            // Clocking Out logic with a safety check
            if (window.confirm("Are you sure you want to clock out?")) {
                setIsClockedIn(false);
                setStartTime('');
                localStorage.removeItem('isClockedIn');
                localStorage.removeItem('startTime');
                alert("Clock out successful! Session ended.");
            }
        }
    };

    return (
        <StudentLayout>
            <div className="max-w-6xl mx-auto">
                <div className="mb-8 flex justify-between items-end">
                    <div>
                        <h1 className="text-3xl font-bold text-white tracking-tight">Student Portal</h1>
                        <p className="text-slate-400 mt-1">Real-time overview of your OJT progress.</p>
                    </div>
                    
                    {/* DYNAMIC CLOCK BUTTON: Swaps styles based on isClockedIn state */}
                    <button 
                        onClick={handleClockToggle}
                        className={`px-8 py-3 rounded-xl font-bold transition-all duration-300 shadow-lg ${
                            isClockedIn 
                            ? 'bg-red-500/10 border border-red-500 text-red-500 hover:bg-red-500 hover:text-white' 
                            : 'bg-emerald-500 text-slate-900 hover:bg-emerald-400 hover:scale-105'
                        }`}
                    >
                        {isClockedIn ? '⏹ Stop Session (Clock Out)' : '▶ Start Session (Clock In)'}
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Progress Card */}
                    <div className="bg-[#1e293b] p-6 rounded-2xl border border-emerald-500/20 shadow-xl">
                        <p className="text-emerald-400 text-sm font-semibold uppercase tracking-wider">Total Hours</p>
                        <h3 className="text-4xl font-bold mt-2 text-white">120 / 600</h3>
                        <div className="w-full bg-slate-800 h-2 rounded-full mt-4 overflow-hidden">
                            <div className="bg-emerald-500 h-full rounded-full w-[20%] transition-all duration-500"></div>
                        </div>
                    </div>

                    {/* Status Card: Glows emerald when active */}
                    <div className={`bg-[#1e293b] p-6 rounded-2xl border transition-all duration-500 shadow-xl ${
                        isClockedIn ? 'border-emerald-500/50' : 'border-slate-700'
                    }`}>
                        <p className="text-blue-400 text-sm font-semibold uppercase tracking-wider">Status</p>
                        <h3 className="text-3xl font-bold mt-2 text-white">
                            {isClockedIn ? 'Clocked In' : 'Offline'}
                        </h3>
                        <p className="text-slate-400 text-xs mt-2 flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full ${isClockedIn ? 'bg-emerald-500 animate-pulse' : 'bg-slate-500'}`}></span>
                            {isClockedIn ? `Started at ${startTime}` : 'No active session'}
                        </p>
                    </div>
                </div>
            </div>
        </StudentLayout>
    );
};

export default StudentDashboard;