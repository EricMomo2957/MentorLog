import { useState, useEffect } from 'react';
import StudentLayout from './StudentLayout';

const StudentDashboard = () => {
    const [isClockedIn, setIsClockedIn] = useState(() => {
        return localStorage.getItem('isClockedIn') === 'true';
    });
    const [startTime, setStartTime] = useState(localStorage.getItem('startTime') || '');
    const [currentTime, setCurrentTime] = useState(new Date());
    const [taskDescription, setTaskDescription] = useState('');

    // --- REAL-TIME TICKER ---
    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const handleClockToggle = () => {
        if (!isClockedIn) {
            const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            setIsClockedIn(true);
            setStartTime(now);
            localStorage.setItem('isClockedIn', 'true');
            localStorage.setItem('startTime', now);
        } else {
            if (window.confirm("Are you sure you want to clock out? Ensure your task log is submitted.")) {
                setIsClockedIn(false);
                setStartTime('');
                localStorage.removeItem('isClockedIn');
                localStorage.removeItem('startTime');
            }
        }
    };

    return (
        <StudentLayout>
            <div className="max-w-6xl mx-auto space-y-8">
                
                {/* --- WELCOME HEADER --- */}
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
                        className={`group relative overflow-hidden px-10 py-4 rounded-2xl font-black uppercase tracking-wider transition-all duration-300 shadow-2xl ${
                            isClockedIn 
                            ? 'bg-red-500/10 border border-red-500/50 text-red-500 hover:bg-red-500 hover:text-white' 
                            : 'bg-emerald-500 text-slate-900 hover:bg-emerald-400 hover:-translate-y-1'
                        }`}
                    >
                        <span className="relative z-10 flex items-center gap-2">
                            {isClockedIn ? '⏹ End Shift' : '▶ Begin Shift'}
                        </span>
                    </button>
                </div>

                {/* --- STATS GRID --- */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    
                    {/* Progress Card */}
                    <div className="bg-[#1e293b] p-8 rounded-3xl border border-slate-800 shadow-xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <svg className="w-20 h-20 text-emerald-500" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14.5v-9l6 4.5-6 4.5z"/></svg>
                        </div>
                        <p className="text-slate-500 text-xs font-black uppercase tracking-widest">Total Progress</p>
                        <h3 className="text-4xl font-bold mt-3 text-white">120 <span className="text-lg text-slate-500 font-medium">/ 600 hrs</span></h3>
                        <div className="w-full bg-slate-900/50 h-3 rounded-full mt-6 overflow-hidden border border-slate-700/50">
                            <div className="bg-linear-to-r from-emerald-500 to-teal-400 h-full rounded-full w-[20%] shadow-[0_0_15px_rgba(16,185,129,0.4)]"></div>
                        </div>
                    </div>

                    {/* Active Session Card */}
                    <div className={`bg-[#1e293b] p-8 rounded-3xl border transition-all duration-500 shadow-xl ${
                        isClockedIn ? 'border-blue-500/50 ring-4 ring-blue-500/5' : 'border-slate-800'
                    }`}>
                        <p className="text-slate-500 text-xs font-black uppercase tracking-widest">Active Session</p>
                        <div className="mt-3 flex items-baseline gap-2">
                            <h3 className="text-4xl font-bold text-white">
                                {isClockedIn ? currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : '--:--'}
                            </h3>
                        </div>
                        <div className="mt-4 flex items-center gap-3 py-2 px-4 bg-slate-900/50 rounded-xl w-fit border border-slate-700/50">
                            <span className={`w-2.5 h-2.5 rounded-full ${isClockedIn ? 'bg-emerald-500 animate-pulse' : 'bg-slate-600'}`}></span>
                            <span className="text-xs font-bold text-slate-300 uppercase">
                                {isClockedIn ? `Started at ${startTime}` : 'Session Inactive'}
                            </span>
                        </div>
                    </div>

                    {/* Daily Target Card */}
                    <div className="bg-[#1e293b] p-8 rounded-3xl border border-slate-800 shadow-xl">
                        <p className="text-slate-500 text-xs font-black uppercase tracking-widest">Today's Goal</p>
                        <h3 className="text-4xl font-bold mt-3 text-white">8 <span className="text-lg text-slate-500 font-medium">hours</span></h3>
                        <p className="text-blue-400 text-xs mt-4 font-bold">+2 hours overtime available</p>
                    </div>
                </div>

                {/* --- TASK LOGGING SECTION --- */}
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
                            placeholder={isClockedIn ? "Example: Developing the MentorLog Dashboard UI using React and Tailwind..." : "Clock in to start logging tasks"}
                            className="w-full bg-slate-900/50 border border-slate-700 rounded-2xl p-5 text-slate-200 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all min-h-30 placeholder:text-slate-600"
                        />
                        
                        <div className="flex justify-end mt-4">
                            <button className="px-6 py-2.5 bg-slate-800 hover:bg-blue-600 text-slate-300 hover:text-white rounded-xl text-sm font-bold transition-all border border-slate-700">
                                Update Task Description
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </StudentLayout>
    );
};

export default StudentDashboard;