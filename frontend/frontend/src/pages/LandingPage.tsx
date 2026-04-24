import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    FiShield, FiArrowRight, FiCheckCircle, 
    FiDatabase, FiLayers, FiActivity, FiUsers, 
    FiLock, FiCpu, FiMessageSquare, FiFileText} from 'react-icons/fi';

const LandingPage = () => {
    const navigate = useNavigate();
    const [hoveredFeature, setHoveredFeature] = useState<number | null>(null);

    useEffect(() => {
        const token = localStorage.getItem('token');
        const role = localStorage.getItem('role'); // Fixed: changed 'userRole' to 'role' to match your Login.tsx

        if (token && role) {
            navigate(role === 'admin' ? '/admin-dashboard' : '/student-dashboard');
        }
    }, [navigate]);

    const features = [
        {
            icon: <FiDatabase />,
            title: "Data Integrity",
            desc: "Secure logging of student inquiries and feedback with AES-256 encrypted repository storage and MySQL relational mapping."
        },
        {
            icon: <FiLayers />,
            title: "Modular Suite",
            desc: "Clean separation of submission tracking, recovery requests, and automated sentiment analysis for departmental efficiency."
        },
        {
            icon: <FiActivity />,
            title: "Real-time Pulse",
            desc: "Instant synchronization across administrative terminals via high-speed Node.js backplane for seamless student support."
        }
    ];

    const techHighlights = [
        { title: "OCR Integration", detail: "Automated schedule digitization using high-accuracy character recognition engines.", icon: <FiFileText /> },
        { title: "Sentiment Analysis", detail: "AI-driven feedback processing to categorize student concerns and satisfaction levels.", icon: <FiMessageSquare /> },
        { title: "Role-Based Access", detail: "Hierarchical clearance levels ensuring data isolation between Admin and Student nodes.", icon: <FiLock /> },
        { title: "Centralized API", detail: "Unified RESTful architecture built on Express.js for low-latency communication.", icon: <FiCpu /> }
    ];

    return (
        <div className="min-h-screen bg-[#020617] text-slate-300 font-sans selection:bg-emerald-500/30 overflow-x-hidden">
            {/* Ambient Background Elements */}
            <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-600/10 rounded-full blur-[120px] pointer-events-none" />

            {/* Top Navigation */}
            <nav className="relative z-50 flex justify-between items-center px-8 py-8 max-w-7xl mx-auto">
                <div className="flex items-center gap-3 group cursor-default">
                    <div className="w-10 h-10 bg-linear-to-br from-emerald-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:rotate-12 transition-transform duration-500">
                        <FiShield className="text-white text-xl" />
                    </div>
                    <span className="text-xl font-black tracking-tighter text-white uppercase italic">
                        Mentor<span className="text-emerald-500">Log</span>
                    </span>
                </div>
                <div className="flex items-center gap-4">
                    <button 
                        onClick={() => navigate('/login')}
                        className="px-6 py-2.5 bg-slate-800/50 hover:bg-slate-700 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl border border-slate-700 transition-all active:scale-95 shadow-xl backdrop-blur-md flex items-center gap-2"
                    >
                        <FiLock className="text-emerald-500" /> Administrative Access
                    </button>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative z-10 pt-20 pb-32 px-6">
                <div className="max-w-5xl mx-auto text-center">
                    {/* Status Badge */}
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-8 animate-in fade-in slide-in-from-top-4 duration-1000">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </span>
                        <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">CCS Terminal v3.0 Live</span>
                    </div>

                    <h1 className="text-6xl md:text-8xl font-black text-white tracking-tighter mb-8 leading-[0.9] animate-in fade-in slide-in-from-bottom-8 duration-1000">
                        Unified Student <br />
                        <span className="bg-linear-to-r from-emerald-400 via-blue-500 to-emerald-400 bg-size-[200%_auto] animate-gradient bg-clip-text text-transparent">Management.</span>
                    </h1>

                    <p className="max-w-2xl mx-auto text-slate-400 text-lg md:text-xl font-medium leading-relaxed mb-12 animate-in fade-in duration-1000 delay-300">
                        A high-performance intelligence terminal for tracking submissions, resolving inquiries, and monitoring campus-wide sentiment in real-time.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-in fade-in duration-1000 delay-500">
                        <button 
                            onClick={() => navigate('/login')}
                            className="group flex items-center gap-3 px-10 py-5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black uppercase text-xs tracking-widest rounded-3xl transition-all shadow-2xl shadow-emerald-500/20 active:scale-95"
                        >
                            Launch Terminal <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
                        </button>
                        <button 
                            onClick={() => document.getElementById('details')?.scrollIntoView({ behavior: 'smooth' })}
                            className="px-10 py-5 bg-transparent hover:bg-slate-800/30 text-white font-black uppercase text-xs tracking-widest rounded-3xl border border-slate-800 transition-all"
                        >
                            System Specs
                        </button>
                    </div>
                </div>
            </section>

            {/* Feature Grid */}
            <section id="details" className="relative z-10 px-6 pb-20">
                <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
                    {features.map((feature, idx) => (
                        <div 
                            key={idx}
                            onMouseEnter={() => setHoveredFeature(idx)}
                            onMouseLeave={() => setHoveredFeature(null)}
                            className="p-8 bg-[#0f172a]/40 border border-slate-800 rounded-[2.5rem] transition-all duration-500 hover:border-emerald-500/30 hover:bg-[#0f172a]/60 group relative overflow-hidden backdrop-blur-sm"
                        >
                            <div className="w-14 h-14 bg-slate-900 rounded-2xl flex items-center justify-center text-2xl text-emerald-500 border border-slate-800 mb-6 group-hover:scale-110 group-hover:bg-emerald-500 group-hover:text-slate-950 transition-all duration-500">
                                {feature.icon}
                            </div>
                            <h3 className="text-xl font-black text-white uppercase tracking-tight mb-3 italic">
                                {feature.title}
                            </h3>
                            <p className="text-slate-500 font-medium leading-relaxed group-hover:text-slate-300 transition-colors">
                                {feature.desc}
                            </p>
                            
                            <div className={`absolute bottom-0 left-0 h-1 bg-emerald-500 transition-all duration-700 ${hoveredFeature === idx ? 'w-full' : 'w-0'}`} />
                        </div>
                    ))}
                </div>
            </section>

            {/* NEW: TECHNICAL SPECIFICATIONS SECTION */}
            <section className="relative z-10 px-6 py-20 bg-slate-950/20">
                <div className="max-w-7xl mx-auto">
                    <div className="mb-16 text-center lg:text-left">
                        <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter mb-2">Technical Specifications</h2>
                        <p className="text-slate-500 text-sm font-medium">Inside the MentorLog Intelligence Suite Architecture</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {techHighlights.map((tech, i) => (
                            <div key={i} className="p-6 border-l border-slate-800 hover:border-emerald-500 transition-colors group">
                                <div className="text-emerald-500 text-2xl mb-4 group-hover:animate-pulse">
                                    {tech.icon}
                                </div>
                                <h4 className="text-white font-bold uppercase tracking-widest text-xs mb-2">{tech.title}</h4>
                                <p className="text-slate-500 text-xs leading-relaxed font-medium group-hover:text-slate-400 transition-colors">
                                    {tech.detail}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* System Metrics Bar */}
            <section className="border-t border-slate-800/50 bg-slate-950/50 backdrop-blur-xl py-20 px-6 relative z-10">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-12">
                    <div className="flex flex-col gap-2">
                        <h4 className="text-white font-black uppercase italic tracking-widest text-2xl">
                            Verified <span className="text-emerald-500">Metrics</span>
                        </h4>
                        <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.2em]">Operational performance monitoring</p>
                    </div>
                    
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-24">
                        {[
                            { label: "Connected Nodes", val: "2.4k+", icon: <FiUsers /> },
                            { label: "Logs Processed", val: "12k", icon: <FiActivity /> },
                            { label: "Uptime Sync", val: "99.9%", icon: <FiCheckCircle /> },
                            { label: "Protection", val: "AES-256", icon: <FiShield /> }
                        ].map((stat, i) => (
                            <div key={i} className="flex flex-col items-center md:items-start group">
                                <div className="text-emerald-500 mb-2 text-xl opacity-50 group-hover:opacity-100 transition-opacity">{stat.icon}</div>
                                <span className="text-3xl font-black text-white tracking-tighter">{stat.val}</span>
                                <span className="text-[10px] text-slate-600 font-black uppercase tracking-widest mt-1">{stat.label}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-12 border-t border-slate-900 px-8 text-center relative z-10">
                <div className="flex items-center justify-center gap-2 mb-4">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                    <span className="text-slate-500 text-[9px] font-black uppercase tracking-[0.3em]">System encrypted and secured via Node.js Backbone</span>
                </div>
                <p className="text-slate-700 text-[10px] font-black uppercase tracking-[0.5em]">
                    © 2026 UNIVERSITY INFRASTRUCTURE • CEBU CITY • CCS MENTOR LOG TERMINAL
                </p>
            </footer>

            <style>{`
                @keyframes gradient {
                    0% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                    100% { background-position: 0% 50%; }
                }
                .animate-gradient {
                    animation: gradient 6s ease infinite;
                    background-size: 200% auto;
                }
            `}</style>
        </div>
    );
};

export default LandingPage;