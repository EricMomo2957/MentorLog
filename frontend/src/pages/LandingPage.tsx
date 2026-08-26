import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
    Clock, CheckCircle2, ShieldCheck, FileText, 
    ArrowRight, Sparkles, BarChart3, ChevronRight, 
    UserCheck, Calendar, Award, Lock, Zap, Globe, Mail,
    Pencil, BookOpen, GraduationCap, ClipboardList, 
    BookMarked, PenTool
} from 'lucide-react';
import mentorLogLogo from '../assets/mentorlogOption.png';
import ojtPicture from '../assets/ojt-picture.jpg';
import api from '../services/api';

const LandingPage = () => {
    const navigate = useNavigate();
    const [liveStats, setLiveStats] = useState<{
        activeInterns: string;
        dtrAccuracy: string;
        journalLogs: string;
        hoursRendered: string;
    }>({
        activeInterns: '0+',
        dtrAccuracy: '100%',
        journalLogs: '0+',
        hoursRendered: '0h'
    });

    useEffect(() => {
        const token = localStorage.getItem('token');
        const role = localStorage.getItem('role'); 

        if (token && role) {
            navigate(role === 'admin' ? '/admin-dashboard' : '/student-dashboard');
        }

        // Fetch live stats from database
        const fetchStats = async () => {
            try {
                const response = await api.get('/auth/public-stats');
                if (response.data?.success && response.data?.stats) {
                    setLiveStats(response.data.stats);
                }
            } catch (err) {
                console.error("Failed to load live stats:", err);
            }
        };
        fetchStats();
    }, [navigate]);

    const stats = [
        { value: liveStats.activeInterns, label: 'Active Interns Tracked', sub: 'Registered student accounts' },
        { value: liveStats.dtrAccuracy, label: 'DTR Accuracy', sub: 'Automated time calculations' },
        { value: liveStats.journalLogs, label: 'Journal Logs Created', sub: 'Verified accomplishment entries' },
        { value: liveStats.hoursRendered, label: 'Hours Rendered', sub: 'Total internship hours logged' },
    ];

    const features = [
        {
            icon: <Clock className="w-6 h-6 text-emerald-400" />,
            title: "Automated DTR & Attendance",
            desc: "Effortlessly clock in and clock out daily. MentorLog automatically calculates total hours worked, tracks punctuality, and maintains accurate attendance history."
        },
        {
            icon: <FileText className="w-6 h-6 text-teal-400" />,
            title: "Journal & Accomplishment Logs",
            desc: "Keep detailed records of daily tasks, key learnings, and internship milestones. Mentors and advisors can review and provide feedback with ease."
        },
        {
            icon: <BarChart3 className="w-6 h-6 text-emerald-400" />,
            title: "Real-Time Admin Oversight",
            desc: "Administrators gain full visibility into student progress, total rendered hours, attendance statuses, and comprehensive audit logs from a single dashboard."
        },
        {
            icon: <ShieldCheck className="w-6 h-6 text-teal-400" />,
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
            icon: <Calendar className="w-5 h-5 text-teal-400" />
        },
        {
            step: '03',
            title: 'Document Progress',
            desc: 'Record daily accomplishment logs and track remaining required OJT hours.',
            icon: <Award className="w-5 h-5 text-emerald-400" />
        },
        {
            step: '04',
            title: 'Export Official Reports',
            desc: 'Generate ready-to-print DTR documents and summary analytics anytime.',
            icon: <Zap className="w-5 h-5 text-teal-400" />
        }
    ];

    return (
        <div className="min-h-screen bg-[#040812] text-slate-100 font-sans selection:bg-emerald-500/30 overflow-x-hidden relative select-none">
            
            {/* ========================================================= */}
            {/* 1. DYNAMIC FLOATING ANIMATED BACKGROUND ICONS & GLOWS     */}
            {/* ========================================================= */}
            {/* Ambient Background Glows */}
            <div className="fixed top-[-10%] left-[-10%] w-[45%] h-[45%] bg-emerald-500/10 rounded-full blur-[140px] pointer-events-none z-0 animate-pulse-glow" />
            <div className="fixed bottom-[-10%] right-[-10%] w-[45%] h-[45%] bg-teal-600/10 rounded-full blur-[140px] pointer-events-none z-0" />

            {/* Floating OJT / Education Icons */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
                <div className="absolute top-20 left-[6%] text-emerald-400/20 animate-float-slow" style={{ animationDelay: '0s' }}>
                    <Pencil className="w-10 h-10 transform -rotate-12" />
                </div>
                <div className="absolute top-28 right-[8%] text-emerald-400/25 animate-float-reverse" style={{ animationDelay: '1s' }}>
                    <BookOpen className="w-12 h-12 transform rotate-12" />
                </div>
                <div className="absolute top-[45%] left-[5%] text-teal-400/20 animate-float-reverse" style={{ animationDelay: '2s' }}>
                    <FileText className="w-14 h-14 transform -rotate-45" />
                </div>
                <div className="absolute top-[52%] right-[5%] text-emerald-500/20 animate-float-slow" style={{ animationDelay: '1.5s' }}>
                    <GraduationCap className="w-14 h-14 transform rotate-12" />
                </div>
                <div className="absolute bottom-28 left-[10%] text-emerald-400/20 animate-float-slow" style={{ animationDelay: '3s' }}>
                    <ClipboardList className="w-12 h-12 transform rotate-6" />
                </div>
                <div className="absolute bottom-32 right-[10%] text-teal-400/25 animate-float-reverse" style={{ animationDelay: '2.5s' }}>
                    <Award className="w-11 h-11 transform -rotate-12" />
                </div>
                <div className="absolute top-16 left-[28%] text-emerald-400/15 animate-float-slow" style={{ animationDelay: '4s' }}>
                    <PenTool className="w-8 h-8 transform rotate-45" />
                </div>
                <div className="absolute bottom-16 right-[28%] text-emerald-300/15 animate-float-reverse" style={{ animationDelay: '3.5s' }}>
                    <BookMarked className="w-9 h-9 transform -rotate-12" />
                </div>
                <div className="absolute top-1/3 right-[22%] text-emerald-300/20 animate-float-slow" style={{ animationDelay: '0.8s' }}>
                    <Sparkles className="w-7 h-7" />
                </div>
            </div>

            {/* ========================================================= */}
            {/* 2. NAVIGATION BAR                                         */}
            {/* ========================================================= */}
            <header className="relative z-50 border-b border-slate-800/80 bg-[#040812]/80 backdrop-blur-xl sticky top-0">
                <nav className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    
                    {/* Brand Logo */}
                    <div className="flex items-center gap-3">
                        <img 
                            src={mentorLogLogo} 
                            alt="MentorLog" 
                            className="w-10 h-10 drop-shadow-[0_0_15px_rgba(16,185,129,0.4)]" 
                        />
                        <span className="text-2xl font-black tracking-tight text-white">
                            Mentor<span className="text-emerald-400">Log</span>
                        </span>
                    </div>

                    {/* Nav Links */}
                    <div className="hidden md:flex items-center gap-8 text-xs font-black uppercase tracking-widest text-slate-400">
                        <a href="#features" className="hover:text-emerald-400 transition-colors">Features</a>
                        <a href="#workflow" className="hover:text-emerald-400 transition-colors">How It Works</a>
                        <a href="#metrics" className="hover:text-emerald-400 transition-colors">Impact</a>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-3">
                        <Link 
                            to="/login"
                            className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-300 hover:text-white bg-[#090e1a] border border-slate-800 hover:border-slate-700 transition-all flex items-center gap-2"
                        >
                            <Lock className="w-3.5 h-3.5 text-emerald-400" /> Sign In
                        </Link>
                        <Link 
                            to="/register"
                            className="px-5 py-2.5 rounded-xl text-xs font-black text-slate-950 bg-emerald-500 hover:bg-emerald-400 transition-all shadow-lg shadow-emerald-500/20 flex items-center gap-2 cursor-pointer"
                        >
                            Get Started <ChevronRight className="w-4 h-4" />
                        </Link>
                    </div>
                </nav>
            </header>

            {/* ========================================================= */}
            {/* 3. HERO SECTION                                           */}
            {/* ========================================================= */}
            <section className="relative z-10 pt-16 pb-24 px-6 max-w-7xl mx-auto">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    
                    {/* Badge */}
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#090e1a] border border-slate-800/90 text-xs font-bold text-slate-300 mb-8 backdrop-blur-md shadow-lg">
                        <Sparkles className="w-4 h-4 text-emerald-400 animate-pulse" />
                        <span>Next-Gen Internship & OJT Management</span>
                    </div>

                    {/* Headline */}
                    <h1 className="text-5xl sm:text-6xl md:text-7xl font-black text-white tracking-tight leading-[1.1] mb-6">
                        Streamline Your OJT Experience with <br className="hidden sm:inline" />
                        <span className="bg-linear-to-r from-emerald-400 via-teal-300 to-emerald-500 bg-clip-text text-transparent italic">
                            Precision & Ease.
                        </span>
                    </h1>

                    {/* Subtitle */}
                    <p className="text-slate-400 text-base sm:text-lg font-medium leading-relaxed mb-10 max-w-2xl mx-auto">
                        MentorLog connects interns, mentors, and administrators in one unified platform. Track DTR attendance, submit weekly journal logs, and monitor progress in real time.
                    </p>

                    {/* Action CTAs */}
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link 
                            to="/register"
                            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm tracking-wide transition-all shadow-xl shadow-emerald-500/25 flex items-center justify-center gap-3 group cursor-pointer"
                        >
                            Get Started Free 
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </Link>
                        <Link 
                            to="/login"
                            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-[#090e1a] hover:bg-slate-900 border border-slate-800 text-white font-bold text-sm tracking-wide transition-all flex items-center justify-center gap-2"
                        >
                            Sign In to Portal
                        </Link>
                    </div>
                </div>

                {/* Hero Mockup Showcase */}
                <div className="relative max-w-5xl mx-auto">
                    <div className="absolute inset-0 bg-linear-to-r from-emerald-500/10 via-teal-500/10 to-emerald-500/10 blur-3xl rounded-3xl -z-10" />

                    <div className="relative rounded-3xl overflow-hidden border border-slate-800/90 bg-[#090e1a]/90 p-3 shadow-2xl backdrop-blur-2xl">
                        <div className="relative rounded-2xl overflow-hidden aspect-16/9 sm:aspect-21/9 border border-slate-800">
                            <img 
                                src={ojtPicture} 
                                alt="MentorLog Dashboard Preview" 
                                className="w-full h-full object-cover object-center brightness-90 hover:brightness-100 transition-all duration-700"
                            />
                            <div className="absolute inset-0 bg-linear-to-t from-[#040812] via-transparent to-[#040812]/40 pointer-events-none" />

                            <div className="absolute top-4 left-4 sm:top-6 sm:left-6 px-4 py-2.5 rounded-2xl bg-[#040812]/90 border border-slate-800 backdrop-blur-md flex items-center gap-3 shadow-xl">
                                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                                <div>
                                    <p className="text-[10px] uppercase font-black tracking-wider text-slate-400">Live Status</p>
                                    <p className="text-xs font-bold text-white">Daily DTR Active</p>
                                </div>
                            </div>

                            <div className="absolute bottom-4 right-4 sm:bottom-6 sm:right-6 px-4 py-2.5 rounded-2xl bg-[#040812]/90 border border-slate-800 backdrop-blur-md flex items-center gap-3 shadow-xl">
                                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                                <div>
                                    <p className="text-[10px] uppercase font-black tracking-wider text-slate-400">Logs Verified</p>
                                    <p className="text-xs font-bold text-white">480 / 500 Hours Completed</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ========================================================= */}
            {/* 4. METRICS / STATS STRIP                                  */}
            {/* ========================================================= */}
            <section id="metrics" className="relative z-10 py-16 border-y border-slate-800/80 bg-[#090e1a]/60 backdrop-blur-md">
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

            {/* ========================================================= */}
            {/* 5. KEY FEATURES SECTION                                   */}
            {/* ========================================================= */}
            <section id="features" className="relative z-10 py-24 px-6 max-w-7xl mx-auto">
                <div className="text-center max-w-2xl mx-auto mb-16">
                    <h2 className="text-xs font-black uppercase tracking-[0.25em] text-emerald-400 mb-3">Designed for Efficiency</h2>
                    <h3 className="text-3xl sm:text-4xl font-black text-white tracking-tight">Everything you need for OJT management.</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {features.map((f, idx) => (
                        <div 
                            key={idx}
                            className="p-8 rounded-3xl bg-[#090e1a]/80 border border-slate-800/90 hover:border-emerald-500/40 transition-all duration-300 backdrop-blur-xl group hover:shadow-[0_10px_30px_rgba(16,185,129,0.1)]"
                        >
                            <div className="w-12 h-12 rounded-2xl bg-[#040812] border border-slate-800 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                {f.icon}
                            </div>
                            <h4 className="text-xl font-black text-white mb-3">{f.title}</h4>
                            <p className="text-slate-400 text-sm font-medium leading-relaxed">{f.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* ========================================================= */}
            {/* 6. HOW IT WORKS (WORKFLOW)                                */}
            {/* ========================================================= */}
            <section id="workflow" className="relative z-10 py-24 px-6 border-t border-slate-800/80 bg-[#090e1a]/40 backdrop-blur-md">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center max-w-2xl mx-auto mb-16">
                        <h2 className="text-xs font-black uppercase tracking-[0.25em] text-teal-400 mb-3">Simple Process</h2>
                        <h3 className="text-3xl sm:text-4xl font-black text-white tracking-tight">How MentorLog Works</h3>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {workflowSteps.map((w, idx) => (
                            <div key={idx} className="p-6 rounded-3xl bg-[#090e1a]/90 border border-slate-800/90 relative flex flex-col justify-between hover:border-emerald-500/40 transition-colors">
                                <div>
                                    <div className="flex items-center justify-between mb-6">
                                        <span className="text-2xl font-black text-slate-600">{w.step}</span>
                                        <div className="p-2.5 rounded-xl bg-[#040812] border border-slate-800">
                                            {w.icon}
                                        </div>
                                    </div>
                                    <h4 className="text-base font-black text-white mb-2">{w.title}</h4>
                                    <p className="text-xs text-slate-400 font-medium leading-relaxed">{w.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ========================================================= */}
            {/* 7. CALL TO ACTION BANNER                                  */}
            {/* ========================================================= */}
            <section className="relative z-10 py-20 px-6 max-w-7xl mx-auto">
                <div className="relative rounded-3xl bg-linear-to-r from-emerald-950/50 via-[#090e1a] to-teal-950/50 border border-slate-800/90 p-10 sm:p-16 text-center overflow-hidden shadow-2xl">
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
                                className="px-8 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm transition-all shadow-lg shadow-emerald-500/20"
                            >
                                Create Account
                            </Link>
                            <Link 
                                to="/login"
                                className="px-8 py-3.5 rounded-xl bg-[#040812] hover:bg-slate-900 border border-slate-800 text-white font-bold text-sm transition-all"
                            >
                                Sign In
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* ========================================================= */}
            {/* 8. FOOTER                                                 */}
            {/* ========================================================= */}
            <footer className="relative z-10 bg-[#02050c] text-slate-300 border-t border-slate-800/80 font-sans pt-16 pb-8 px-6 sm:px-12">
                <div className="max-w-7xl mx-auto space-y-12">
                    
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                        <div className="lg:col-span-5 space-y-4">
                            <div className="flex items-center gap-3">
                                <img src={mentorLogLogo} alt="MentorLog" className="w-8 h-8 drop-shadow-md" />
                                <span className="text-xl font-black text-white tracking-tight">
                                    Mentor<span className="text-emerald-400">Log</span>
                                </span>
                            </div>

                            <p className="text-xs text-slate-400 font-medium leading-relaxed max-w-md">
                                Transparent internship tracking, automated daily time records (DTR), accomplishment log management, and intern progress tracking for <strong className="text-white font-bold">OJT Programs, Supervisors, & Universities.</strong>
                            </p>

                            <div className="flex items-center gap-3 pt-2">
                                <a 
                                    href="#features" 
                                    className="w-9 h-9 rounded-full bg-[#090e1a] border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-all cursor-pointer"
                                    title="Website / Features"
                                >
                                    <Globe className="w-4 h-4" />
                                </a>
                                <a 
                                    href="mailto:support@mentorlog.edu" 
                                    className="w-9 h-9 rounded-full bg-[#090e1a] border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-all cursor-pointer"
                                    title="Contact Email Support"
                                >
                                    <Mail className="w-4 h-4" />
                                </a>
                            </div>
                        </div>

                        <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-8 text-xs">
                            <div className="space-y-3">
                                <h4 className="font-black text-white uppercase tracking-wider text-[11px]">PLATFORM FEATURES</h4>
                                <ul className="space-y-2.5 text-slate-400 font-medium">
                                    <li><a href="#features" className="hover:text-emerald-400 transition-colors">Task Management</a></li>
                                    <li><a href="#features" className="hover:text-emerald-400 transition-colors">DTR & Attendance Log</a></li>
                                    <li><a href="#metrics" className="hover:text-emerald-400 transition-colors">Progress Tracker</a></li>
                                    <li><a href="#features" className="hover:text-emerald-400 transition-colors">Document Submissions</a></li>
                                </ul>
                            </div>

                            <div className="space-y-3">
                                <h4 className="font-black text-white uppercase tracking-wider text-[11px]">INTERN SERVICES</h4>
                                <ul className="space-y-2.5 text-slate-400 font-medium">
                                    <li><Link to="/login" className="hover:text-emerald-400 transition-colors">Student Dashboard</Link></li>
                                    <li><Link to="/login" className="hover:text-emerald-400 transition-colors">Intern Q&A & Support</Link></li>
                                    <li><Link to="/login" className="hover:text-emerald-400 transition-colors">Feedback & Ratings</Link></li>
                                    <li><Link to="/login" className="hover:text-emerald-400 transition-colors">Weekly Activity Reports</Link></li>
                                </ul>
                            </div>

                            <div className="space-y-3">
                                <h4 className="font-black text-white uppercase tracking-wider text-[11px]">MENTORLOG</h4>
                                <ul className="space-y-2.5 text-slate-400 font-medium">
                                    <li><a href="#workflow" className="hover:text-emerald-400 transition-colors">About MentorLog OJT</a></li>
                                    <li><a href="mailto:support@mentorlog.edu" className="hover:text-emerald-400 transition-colors">Office & Contact Info</a></li>
                                    <li><Link to="/login" className="hover:text-emerald-400 transition-colors">Terms & Conditions</Link></li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    <div className="pt-8 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500 font-medium">
                        <div className="space-y-1 text-center sm:text-left">
                            <p>© 2026 MentorLog OJT Platform. All rights reserved.</p>
                            <p className="flex items-center justify-center sm:justify-start gap-1.5 text-slate-400 font-semibold">
                                <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                                Engineered & Maintained by <strong className="text-white font-bold">MentorLog Solutions</strong>
                            </p>
                        </div>

                        <div className="flex items-center gap-6 text-slate-400 font-semibold">
                            <a href="#workflow" className="hover:text-emerald-400 transition-colors">Terms</a>
                            <a href="#workflow" className="hover:text-emerald-400 transition-colors">Privacy</a>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;