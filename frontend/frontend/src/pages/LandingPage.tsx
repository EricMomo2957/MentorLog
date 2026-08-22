import { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
    Clock, CheckCircle2, ShieldCheck, FileText, 
    ArrowRight, Sparkles, BarChart3, ChevronRight, 
    UserCheck, Calendar, Award, Lock, Zap
} from 'lucide-react';
import mentorLogLogo from '../assets/mentorlogOption.png';
import ojtPicture from '../assets/ojt-picture.jpg';

const LandingPage = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('token');
        const role = localStorage.getItem('role'); 

        if (token && role) {
            navigate(role === 'admin' ? '/admin-dashboard' : '/student-dashboard');
        }
    }, [navigate]);

    const stats = [
        { value: '500+', label: 'Active Interns Tracked', sub: 'Across top partner organizations' },
        { value: '99.8%', label: 'DTR Accuracy', sub: 'Automated time calculations' },
        { value: '15k+', label: 'Journal Logs Created', sub: 'Verified accomplishment entries' },
        { value: 'Instant', label: 'Report Generation', sub: 'Exportable printable DTRs' },
    ];

    const features = [
        {
            icon: <Clock className="w-6 h-6 text-emerald-400" />,
            title: "Automated DTR & Attendance",
            desc: "Effortlessly clock in and clock out daily. MentorLog automatically calculates total hours worked, tracks punctuality, and maintains accurate attendance history."
        },
        {
            icon: <FileText className="w-6 h-6 text-blue-400" />,
            title: "Journal & Accomplishment Logs",
            desc: "Keep detailed records of daily tasks, key learnings, and internship milestones. Mentors and advisors can review and provide feedback with ease."
        },
        {
            icon: <BarChart3 className="w-6 h-6 text-indigo-400" />,
            title: "Real-Time Admin Oversight",
            desc: "Administrators gain full visibility into student progress, total rendered hours, attendance statuses, and comprehensive audit logs from a single dashboard."
        },
        {
            icon: <ShieldCheck className="w-6 h-6 text-purple-400" />,
            title: "Secure & Role-Based Access",
            desc: "Tailored experience for both Students and Administrators with secure authentication, reference-code admin verification, and robust data protection."
        }
    ];

    const workflowSteps = [
        {
            step: '01',
            title: 'Create Your Account',
            desc: 'Register as a Student or Administrator using your institutional credentials.',
            icon: <UserCheck className="w-5 h-5 text-emerald-400" />
        },
        {
            step: '02',
            title: 'Log Daily Attendance',
            desc: 'Clock in when you start your shift and clock out when finished with one click.',
            icon: <Calendar className="w-5 h-5 text-blue-400" />
        },
        {
            step: '03',
            title: 'Document Progress',
            desc: 'Record daily accomplishment logs and track remaining required OJT hours.',
            icon: <Award className="w-5 h-5 text-indigo-400" />
        },
        {
            step: '04',
            title: 'Export Official Reports',
            desc: 'Generate ready-to-print DTR documents and summary analytics anytime.',
            icon: <Zap className="w-5 h-5 text-purple-400" />
        }
    ];

    return (
        <div className="min-h-screen bg-[#020617] text-slate-200 font-sans selection:bg-emerald-500/30 overflow-x-hidden relative">
            
            {/* Ambient Background Blur Elements */}
            <div className="fixed top-[-10%] left-[-10%] w-[45%] h-[45%] bg-blue-600/10 rounded-full blur-[140px] pointer-events-none z-0" />
            <div className="fixed bottom-[-10%] right-[-10%] w-[45%] h-[45%] bg-emerald-500/10 rounded-full blur-[140px] pointer-events-none z-0" />

            {/* --- NAVIGATION BAR --- */}
            <header className="relative z-50 border-b border-slate-800/60 bg-[#020617]/80 backdrop-blur-xl sticky top-0">
                <nav className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    
                    {/* Brand Logo */}
                    <div className="flex items-center gap-3">
                        <img src={mentorLogLogo} alt="MentorLog" className="w-10 h-10 drop-shadow-md" />
                        <span className="text-xl font-black tracking-tight text-white">
                            Mentor<span className="text-emerald-400">Log</span>
                        </span>
                    </div>

                    {/* Nav Links */}
                    <div className="hidden md:flex items-center gap-8 text-xs font-bold uppercase tracking-widest text-slate-400">
                        <a href="#features" className="hover:text-emerald-400 transition-colors">Features</a>
                        <a href="#workflow" className="hover:text-emerald-400 transition-colors">How It Works</a>
                        <a href="#metrics" className="hover:text-emerald-400 transition-colors">Impact</a>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-3">
                        <Link 
                            to="/login"
                            className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-300 hover:text-white bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all flex items-center gap-2"
                        >
                            <Lock className="w-3.5 h-3.5 text-slate-400" /> Sign In
                        </Link>
                        <Link 
                            to="/register"
                            className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 transition-all shadow-lg shadow-emerald-400/20 flex items-center gap-2"
                        >
                            Get Started <ChevronRight className="w-4 h-4" />
                        </Link>
                    </div>
                </nav>
            </header>

            {/* --- HERO SECTION --- */}
            <section className="relative z-10 pt-20 pb-24 px-6 max-w-7xl mx-auto">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    
                    {/* Badge */}
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900/90 border border-slate-800 text-xs font-bold text-slate-300 mb-8 backdrop-blur-md">
                        <Sparkles className="w-4 h-4 text-emerald-400 animate-pulse" />
                        <span>Next-Gen Internship & OJT Management</span>
                    </div>

                    {/* Headline */}
                    <h1 className="text-5xl sm:text-6xl md:text-7xl font-black text-white tracking-tight leading-[1.1] mb-6">
                        Streamline Your OJT Experience with <br className="hidden sm:inline" />
                        <span className="bg-linear-to-r from-emerald-400 via-blue-400 to-indigo-400 bg-clip-text text-transparent italic">
                            Precision & Ease.
                        </span>
                    </h1>

                    {/* Subtitle */}
                    <p className="text-slate-400 text-base sm:text-lg font-normal leading-relaxed mb-10 max-w-2xl mx-auto">
                        MentorLog connects interns, mentors, and administrators in one unified platform. Track DTR attendance, submit weekly journal logs, and monitor progress in real time.
                    </p>

                    {/* Action CTAs */}
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link 
                            to="/register"
                            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm tracking-wide transition-all shadow-xl shadow-emerald-500/25 flex items-center justify-center gap-3 group"
                        >
                            Get Started Free 
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </Link>
                        <Link 
                            to="/login"
                            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-white font-bold text-sm tracking-wide transition-all flex items-center justify-center gap-2"
                        >
                            Sign In to Portal
                        </Link>
                    </div>
                </div>

                {/* Hero Mockup Showcase */}
                <div className="relative max-w-5xl mx-auto">
                    
                    {/* Glowing background halo */}
                    <div className="absolute inset-0 bg-linear-to-r from-emerald-500/10 via-blue-500/10 to-purple-500/10 blur-3xl rounded-3xl -z-10" />

                    {/* Card Wrapper */}
                    <div className="relative rounded-3xl overflow-hidden border border-slate-800/80 bg-slate-900/60 p-3 shadow-2xl backdrop-blur-xl">
                        <div className="relative rounded-2xl overflow-hidden aspect-16/9 sm:aspect-21/9 border border-slate-800">
                            <img 
                                src={ojtPicture} 
                                alt="MentorLog Dashboard Preview" 
                                className="w-full h-full object-cover object-center brightness-90 hover:brightness-100 transition-all duration-700"
                            />
                            <div className="absolute inset-0 bg-linear-to-t from-[#020617] via-transparent to-[#020617]/30 pointer-events-none" />

                            {/* Floating Overlay Badge 1 */}
                            <div className="absolute top-4 left-4 sm:top-6 sm:left-6 px-4 py-2.5 rounded-2xl bg-slate-950/80 border border-slate-800 backdrop-blur-md flex items-center gap-3 shadow-xl">
                                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                                <div>
                                    <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Live Status</p>
                                    <p className="text-xs font-bold text-white">Daily DTR Active</p>
                                </div>
                            </div>

                            {/* Floating Overlay Badge 2 */}
                            <div className="absolute bottom-4 right-4 sm:bottom-6 sm:right-6 px-4 py-2.5 rounded-2xl bg-slate-950/80 border border-slate-800 backdrop-blur-md flex items-center gap-3 shadow-xl">
                                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                                <div>
                                    <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Logs Verified</p>
                                    <p className="text-xs font-bold text-white">480 / 500 Hours Completed</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* --- METRICS / STATS STRIP --- */}
            <section id="metrics" className="relative z-10 py-16 border-y border-slate-800/60 bg-slate-950/40">
                <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 sm:gap-12">
                    {stats.map((s, idx) => (
                        <div key={idx} className="text-center md:text-left group">
                            <h3 className="text-3xl sm:text-4xl font-black text-white tracking-tight mb-1 group-hover:text-emerald-400 transition-colors">
                                {s.value}
                            </h3>
                            <p className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">{s.label}</p>
                            <p className="text-[11px] text-slate-500 font-medium">{s.sub}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* --- KEY FEATURES SECTION --- */}
            <section id="features" className="relative z-10 py-24 px-6 max-w-7xl mx-auto">
                <div className="text-center max-w-2xl mx-auto mb-16">
                    <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-400 mb-3">Designed for Efficiency</h2>
                    <h3 className="text-3xl sm:text-4xl font-black text-white tracking-tight">Everything you need for OJT management.</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {features.map((f, idx) => (
                        <div 
                            key={idx}
                            className="p-8 rounded-3xl bg-slate-900/40 border border-slate-800/80 hover:border-slate-700 transition-all duration-300 backdrop-blur-md group hover:translate-y-[-2px]"
                        >
                            <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                {f.icon}
                            </div>
                            <h4 className="text-xl font-bold text-white mb-3">{f.title}</h4>
                            <p className="text-slate-400 text-sm leading-relaxed">{f.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* --- HOW IT WORKS (WORKFLOW) --- */}
            <section id="workflow" className="relative z-10 py-24 px-6 border-t border-slate-800/60 bg-slate-950/50">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center max-w-2xl mx-auto mb-16">
                        <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-blue-400 mb-3">Simple Process</h2>
                        <h3 className="text-3xl sm:text-4xl font-black text-white tracking-tight">How MentorLog Works</h3>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {workflowSteps.map((w, idx) => (
                            <div key={idx} className="p-6 rounded-2xl bg-slate-900/30 border border-slate-800/60 relative flex flex-col justify-between">
                                <div>
                                    <div className="flex items-center justify-between mb-6">
                                        <span className="text-2xl font-black text-slate-700">{w.step}</span>
                                        <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                                            {w.icon}
                                        </div>
                                    </div>
                                    <h4 className="text-base font-bold text-white mb-2">{w.title}</h4>
                                    <p className="text-xs text-slate-400 leading-relaxed">{w.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* --- CALL TO ACTION BANNER --- */}
            <section className="relative z-10 py-20 px-6 max-w-7xl mx-auto">
                <div className="relative rounded-3xl bg-linear-to-r from-emerald-950/40 via-slate-900 to-blue-950/40 border border-slate-800 p-10 sm:p-16 text-center overflow-hidden">
                    <div className="relative z-10 max-w-2xl mx-auto">
                        <h3 className="text-3xl sm:text-4xl font-black text-white tracking-tight mb-4">
                            Ready to Upgrade Your Internship Program?
                        </h3>
                        <p className="text-slate-300 text-sm sm:text-base font-medium mb-8">
                            Join student interns and administrators using MentorLog to track DTRs and daily accomplishments seamlessly.
                        </p>
                        <div className="flex flex-col sm:flex-row justify-center gap-4">
                            <Link 
                                to="/register"
                                className="px-8 py-3.5 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-bold text-sm transition-all shadow-lg shadow-emerald-400/20"
                            >
                                Create Account
                            </Link>
                            <Link 
                                to="/login"
                                className="px-8 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-white font-bold text-sm transition-all"
                            >
                                Sign In
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* --- FOOTER --- */}
            <footer className="relative z-10 border-t border-slate-800/80 bg-slate-950 py-12 px-6">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
                    <div className="flex items-center gap-3">
                        <img src={mentorLogLogo} alt="MentorLog" className="w-8 h-8" />
                        <span className="text-lg font-black text-white tracking-tight">
                            Mentor<span className="text-emerald-400">Log</span>
                        </span>
                    </div>
                    
                    <p className="text-xs text-slate-500 font-medium">
                        © 2026 MentorLog • Cebu City. All rights reserved.
                    </p>

                    <div className="flex items-center gap-6 text-xs text-slate-400 font-medium">
                        <Link to="/login" className="hover:text-white transition-colors">Sign In</Link>
                        <Link to="/register" className="hover:text-white transition-colors">Register</Link>
                        <Link to="/forgot-password" className="hover:text-white transition-colors">Forgot Password</Link>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;