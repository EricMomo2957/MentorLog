import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    FiShield, FiArrowRight, FiCheckCircle, 
    FiDatabase, FiLayers, FiActivity, FiUsers, 
    FiLock, FiCpu, FiMessageSquare, FiFileText, 
    FiServer, FiRefreshCw, FiSearch
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

    const systemSpecs = [
        { label: "Core Processing", icon: <FiCpu />, detail: "Node.js High-Concurrency" },
        { label: "Feedback Engine", icon: <FiMessageSquare />, detail: "NLP Sentiment Mapping" },
        { label: "Central Server", icon: <FiServer />, detail: "Distributed Cloud Nodes" },
        { label: "Live Sync", icon: <FiRefreshCw />, detail: "Real-time State Refresh" }
    ];

    return (
        <div className="min-h-screen bg-[#020617] text-slate-300 font-sans selection:bg-emerald-500/30 overflow-x-hidden">
            {/* Ambient Background */}
            <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-600/10 rounded-full blur-[120px] pointer-events-none" />

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

            <section className="relative z-10 pt-20 pb-32 px-6 text-center">
                <h1 className="text-6xl md:text-8xl font-black text-white tracking-tighter mb-8 leading-[0.9]">
                    Unified Student <br />
                    <span className="bg-gradient-to-r from-emerald-400 via-blue-500 to-emerald-400 bg-size-[200%_auto] animate-gradient bg-clip-text text-transparent">Management.</span>
                </h1>
                <p className="max-w-2xl mx-auto text-slate-400 text-lg mb-12">
                    A high-performance intelligence terminal for monitoring campus-wide sentiment and submission tracking in real-time.
                </p>
                <button 
                    onClick={() => navigate('/login')}
                    className="group flex items-center gap-3 px-10 py-5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black uppercase text-xs tracking-widest rounded-3xl transition-all mx-auto shadow-2xl shadow-emerald-500/20"
                >
                    Launch Terminal <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
                </button>
            </section>

            {/* Feature Grid - Resolves hoveredFeature/setHoveredFeature errors */}
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

            {/* System Details - Resolves FiCpu, FiMessageSquare, FiServer, FiRefreshCw errors */}
            <section className="relative z-10 px-6 py-20 bg-slate-950/30 border-y border-slate-900">
                <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
                    {systemSpecs.map((spec, i) => (
                        <div key={i} className="text-center group">
                            <div className="text-emerald-500 text-3xl mb-4 flex justify-center group-hover:scale-110 transition-transform">{spec.icon}</div>
                            <h4 className="text-white font-bold text-[10px] uppercase tracking-widest">{spec.label}</h4>
                            <p className="text-slate-500 text-[10px] mt-1">{spec.detail}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Workflow - Resolves FiFileText, FiSearch, FiCheckCircle, FiDatabase (re-use) errors */}
            <section className="relative z-10 px-6 py-24 max-w-7xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {workflowSteps.map((step, i) => (
                        <div key={i} className="flex flex-col items-center md:items-start">
                            <div className="text-emerald-500 mb-4 text-xl">{step.icon}</div>
                            <h5 className="text-white font-black text-xs uppercase tracking-tighter mb-2">{step.title}</h5>
                            <p className="text-slate-500 text-xs leading-relaxed">{step.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* System Metrics - Resolves FiUsers, FiActivity, FiShield errors */}
            <footer className="relative z-10 border-t border-slate-900 bg-slate-950/50 py-20 px-8">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-10">
                    <div className="flex gap-12">
                        <div className="flex flex-col"><FiUsers className="text-emerald-500 mb-2"/><span className="text-2xl font-black text-white">2.4k+</span><span className="text-[10px] uppercase text-slate-600">Users</span></div>
                        <div className="flex flex-col"><FiActivity className="text-emerald-500 mb-2"/><span className="text-2xl font-black text-white">12k</span><span className="text-[10px] uppercase text-slate-600">Logs</span></div>
                        <div className="flex flex-col"><FiShield className="text-emerald-500 mb-2"/><span className="text-2xl font-black text-white">AES</span><span className="text-[10px] uppercase text-slate-600">Security</span></div>
                    </div>
                    <p className="text-slate-700 text-[10px] font-black uppercase tracking-[0.5em]">© 2026 UNIVERSITY INFRASTRUCTURE</p>
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