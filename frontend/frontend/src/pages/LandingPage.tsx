import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    FiShield, FiArrowRight, FiCheckCircle, 
    FiDatabase, FiLayers, FiActivity, FiUsers, 
    FiLock, FiCpu, FiMessageSquare, FiFileText, 
    FiServer, FiRefreshCw, FiSearch, FiShieldOff
} from 'react-icons/fi';

const LandingPage = () => {
    const navigate = useNavigate();
    const [hoveredFeature, setHoveredFeature] = useState<number | null>(null);

    useEffect(() => {
        const token = localStorage.getItem('token');
        const role = localStorage.getItem('role'); 

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

    const workflowSteps = [
        { title: "Input Capture", desc: "Students submit inquiries via the terminal.", icon: <FiFileText /> },
        { title: "AI Categorization", desc: "Sentiment analysis prioritizes urgent feedback.", icon: <FiSearch /> },
        { title: "Admin Resolution", desc: "Unified repository for tracking progress.", icon: <FiCheckCircle /> },
        { title: "Data Archiving", desc: "Resolved cases moved to MySQL vault.", icon: <FiDatabase /> }
    ];


    return (
        <div className="min-h-screen bg-[#020617] text-slate-300 font-sans selection:bg-emerald-500/30 overflow-x-hidden">
            {/* Ambient Background */}
            <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-600/10 rounded-full blur-[120px] pointer-events-none" />

            {/* Navigation */}
            <nav className="relative z-50 flex justify-between items-center px-8 py-8 max-w-7xl mx-auto">
                <div className="flex items-center gap-3 group cursor-default">
                    <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:rotate-12 transition-transform duration-500">
                        <FiShield className="text-white text-xl" />
                    </div>
                    <span className="text-xl font-black tracking-tighter text-white uppercase italic">
                        Mentor<span className="text-emerald-500">Log</span>
                    </span>
                </div>
                <button 
                    onClick={() => navigate('/login')}
                    className="px-6 py-2.5 bg-slate-800/50 hover:bg-slate-700 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl border border-slate-700 transition-all flex items-center gap-2"
                >
                    <FiLock className="text-emerald-500" /> Administrative Access
                </button>
            </nav>

            {/* Hero Section */}
            <section className="relative z-10 pt-20 pb-32 px-6 text-center">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-8">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                    <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">CCS Terminal v3.0 Live</span>
                </div>
                <h1 className="text-6xl md:text-8xl font-black text-white tracking-tighter mb-8 leading-[0.9]">
                    Unified Student <br />
                    <span className="bg-gradient-to-r from-emerald-400 via-blue-500 to-emerald-400 bg-size-[200%_auto] animate-gradient bg-clip-text text-transparent">Management.</span>
                </h1>
                <p className="max-w-2xl mx-auto text-slate-400 text-lg mb-12 font-medium leading-relaxed">
                    The ultimate intelligence suite for University Internship management. Built for high-volume data processing and real-time student oversight.
                </p>
                <button 
                    onClick={() => navigate('/login')}
                    className="group flex items-center gap-3 px-10 py-5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black uppercase text-xs tracking-widest rounded-3xl transition-all mx-auto shadow-2xl shadow-emerald-500/20 active:scale-95"
                >
                    Launch Terminal <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
                </button>
            </section>

            {/* Feature Grid */}
            <section className="relative z-10 px-6 pb-20">
                <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
                    {features.map((f, i) => (
                        <div 
                            key={i}
                            onMouseEnter={() => setHoveredFeature(i)}
                            onMouseLeave={() => setHoveredFeature(null)}
                            className="p-8 bg-[#0f172a]/40 border border-slate-800 rounded-4xl transition-all duration-500 hover:border-emerald-500/30 group relative overflow-hidden backdrop-blur-sm"
                        >
                            <div className="w-14 h-14 bg-slate-900 rounded-2xl flex items-center justify-center text-2xl text-emerald-500 border border-slate-800 mb-6 group-hover:bg-emerald-500 group-hover:text-slate-950 transition-all">
                                {f.icon}
                            </div>
                            <h3 className="text-xl font-black text-white uppercase italic mb-3">{f.title}</h3>
                            <p className="text-slate-500 text-sm group-hover:text-slate-300 transition-colors">{f.desc}</p>
                            <div className={`absolute bottom-0 left-0 h-px bg-emerald-500 transition-all duration-700 ${hoveredFeature === i ? 'w-full' : 'w-0'}`} />
                        </div>
                    ))}
                </div>
            </section>

            {/* Security Compliance Section */}
            <section className="relative z-10 px-6 py-20 max-w-7xl mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                    <div>
                        <h2 className="text-4xl font-black text-white uppercase italic tracking-tighter mb-6">Security & <span className="text-emerald-500">Compliance</span></h2>
                        <div className="space-y-6">
                            <div className="flex gap-4 p-4 rounded-2xl bg-slate-900/50 border border-slate-800 hover:border-blue-500/30 transition-all">
                                <div className="text-blue-500 text-2xl pt-1"><FiLock /></div>
                                <div>
                                    <h5 className="text-white font-bold text-sm uppercase tracking-widest">End-to-End Encryption</h5>
                                    <p className="text-slate-500 text-xs mt-1">All data transmitted between the terminal and the server is secured via industry-standard protocols.</p>
                                </div>
                            </div>
                            <div className="flex gap-4 p-4 rounded-2xl bg-slate-900/50 border border-slate-800 hover:border-emerald-500/30 transition-all">
                                <div className="text-emerald-500 text-2xl pt-1"><FiShieldOff /></div>
                                <div>
                                    <h5 className="text-white font-bold text-sm uppercase tracking-widest">Role Isolation</h5>
                                    <p className="text-slate-500 text-xs mt-1">Strict departmental silos prevent unauthorized access between administrative and student environments.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="bg-slate-900/60 border border-slate-800 rounded-[2rem] p-8 relative overflow-hidden">
                         <div className="flex items-center gap-4 mb-6">
                            <div className="w-3 h-3 bg-red-500 rounded-full" />
                            <div className="w-3 h-3 bg-yellow-500 rounded-full" />
                            <div className="w-3 h-3 bg-green-500 rounded-full" />
                            <span className="text-[10px] text-slate-600 font-black uppercase tracking-widest ml-auto">Security_Log_v3.0</span>
                         </div>
                         <div className="font-mono text-[11px] text-emerald-500 space-y-2 opacity-80">
                            <p>{">"} INITIALIZING SECURITY HANDSHAKE...</p>
                            <p>{">"} BOOTING JWT AUTHENTICATION MODULE...</p>
                            <p className="text-white">{">"} STATUS: SECURE CONNECTION ESTABLISHED</p>
                            <p>{">"} MONITORING ACTIVE NODES: 2,412</p>
                            <p className="animate-pulse">{">"} _</p>
                         </div>
                    </div>
                </div>
            </section>

            {/* Workflow Section */}
            <section className="relative z-10 px-6 py-24 max-w-7xl mx-auto bg-slate-950/30 border-y border-slate-900 mb-20">
                <div className="text-center mb-16">
                    <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter mb-2">Operational Workflow</h2>
                    <p className="text-slate-500 text-sm font-medium tracking-tight">How MentorLog processes high-volume student data</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {workflowSteps.map((step, i) => (
                        <div key={i} className="flex flex-col items-center md:items-start group">
                            <div className="text-emerald-500 mb-4 text-xl group-hover:scale-110 transition-transform">{step.icon}</div>
                            <h5 className="text-white font-black text-xs uppercase tracking-tighter mb-2">{step.title}</h5>
                            <p className="text-slate-500 text-xs leading-relaxed">{step.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* System Metrics & Expanded Footer */}
            <footer className="relative z-10 border-t border-slate-800 bg-slate-950/80 backdrop-blur-xl pt-20 pb-10 px-8">
                <div className="max-w-7xl mx-auto">
                    {/* Upper Footer: Metrics */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-12 pb-20 border-b border-slate-900">
                        {[
                            { label: "Active Nodes", val: "2.4k+", icon: <FiUsers /> },
                            { label: "Data Throughput", val: "128-bit", icon: <FiActivity /> },
                            { label: "System Uptime", val: "99.9%", icon: <FiRefreshCw /> },
                            { label: "Security Level", val: "L3-ENC", icon: <FiShield /> }
                        ].map((stat, i) => (
                            <div key={i} className="flex flex-col items-center md:items-start group">
                                <div className="text-emerald-500 mb-3 text-xl opacity-50 group-hover:opacity-100 transition-opacity">
                                    {stat.icon}
                                </div>
                                <span className="text-3xl font-black text-white tracking-tighter">{stat.val}</span>
                                <span className="text-[10px] text-slate-600 font-black uppercase tracking-[0.2em] mt-1">{stat.label}</span>
                            </div>
                        ))}
                    </div>

                    {/* Middle Footer: Links & Info */}
                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-12 py-16">
                        {/* Column 1: Brand */}
                        <div className="space-y-6">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center shadow-lg shadow-emerald-500/20">
                                    <FiShield className="text-slate-950 text-lg" />
                                </div>
                                <span className="text-lg font-black tracking-tighter text-white uppercase italic">
                                    Mentor<span className="text-emerald-500">Log</span>
                                </span>
                            </div>
                            <p className="text-slate-500 text-xs leading-relaxed max-w-xs font-medium">
                                A specialized intelligence terminal designed for the College of Computer Studies to streamline internship monitoring and sentiment analysis.
                            </p>
                        </div>

                        {/* Column 2: Tech Stack */}
                        <div className="space-y-4">
                            <h5 className="text-white font-black uppercase tracking-widest text-[10px]">Infrastructure</h5>
                            <ul className="text-slate-500 text-[10px] font-bold uppercase space-y-2 tracking-widest">
                                <li className="hover:text-emerald-500 transition-colors cursor-default flex items-center gap-2">
                                    <div className="w-1 h-1 bg-emerald-500 rounded-full" /> React 18 + Vite
                                </li>
                                <li className="hover:text-emerald-500 transition-colors cursor-default flex items-center gap-2">
                                    <div className="w-1 h-1 bg-emerald-500 rounded-full" /> Node.js Runtime
                                </li>
                                <li className="hover:text-emerald-500 transition-colors cursor-default flex items-center gap-2">
                                    <div className="w-1 h-1 bg-emerald-500 rounded-full" /> MySQL Database
                                </li>
                                <li className="hover:text-emerald-500 transition-colors cursor-default flex items-center gap-2">
                                    <div className="w-1 h-1 bg-emerald-500 rounded-full" /> Tailwind Engine
                                </li>
                            </ul>
                        </div>

                        {/* Column 3: System Status */}
                        <div className="space-y-4">
                            <h5 className="text-white font-black uppercase tracking-widest text-[10px]">Live Status</h5>
                            <div className="bg-slate-900/50 border border-slate-800 p-4 rounded-xl space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-slate-500 text-[9px] font-bold uppercase tracking-widest">API Gateway</span>
                                    <span className="text-emerald-500 text-[9px] font-black uppercase">Online</span>
                                </div>
                                <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden">
                                    <div className="bg-emerald-500 h-full w-[98%] animate-pulse" />
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-slate-500 text-[9px] font-bold uppercase tracking-widest">DB Sync</span>
                                    <span className="text-emerald-500 text-[9px] font-black uppercase">Stable</span>
                                </div>
                            </div>
                        </div>

                        {/* Column 4: Back to top */}
                        <div className="flex flex-col items-center md:items-end justify-center">
                            <button 
                                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                                className="p-4 bg-slate-900 border border-slate-800 rounded-full hover:border-emerald-500 text-emerald-500 transition-all active:scale-90"
                            >
                                <FiArrowRight className="-rotate-90 text-xl" />
                            </button>
                            <span className="text-[9px] text-slate-600 font-black uppercase tracking-[0.3em] mt-4">Terminal Top</span>
                        </div>
                    </div>

                    {/* Bottom Footer: Credits */}
                    <div className="pt-8 border-t border-slate-900 flex flex-col md:flex-row justify-between items-center gap-6">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                            <span className="text-slate-600 text-[9px] font-black uppercase tracking-[0.3em]">
                                Terminal Security Protocol AES-256 Enabled
                            </span>
                        </div>
                        <p className="text-slate-700 text-[10px] font-black uppercase tracking-[0.4em]">
                            © 2026 UNIVERSITY INFRASTRUCTURE • DEVELOPED BY MOMO & TEAM
                        </p>
                    </div>
                </div>
            </footer>

            <style>{`
                @keyframes gradient { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }
                .animate-gradient { animation: gradient 6s ease infinite; background-size: 200% auto; }
            `}</style>
        </div>
    );
};

export default LandingPage;