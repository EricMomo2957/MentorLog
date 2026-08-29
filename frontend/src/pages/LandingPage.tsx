import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
    Clock, ShieldCheck, FileText, 
    ArrowRight, Sparkles, BarChart3, ChevronRight, ChevronLeft,
    UserCheck, Calendar, Award, Zap,
    Pencil, BookOpen, GraduationCap, ClipboardList, 
    BookMarked, PenTool, Star, Quote
} from 'lucide-react';
import mentorLogLogo from '../assets/mentorlogOption.png';
import slideSettings from '../assets/slide_settings.png';
import slideProfile from '../assets/slide_profile.png';
import slideRequests from '../assets/slide_requests.png';
import slideAsk from '../assets/slide_ask.png';
import slideTasks from '../assets/slide_tasks.png';
import api from '../services/api';
import Footer from '../components/Footer';

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

    const defaultReviews = [
        {
            name: "Joshua Mark Tan",
            role: "BS Information Technology Intern",
            avatar: "JT",
            rating: 5,
            content: "MentorLog made tracking my 480 required OJT hours effortless! Clocking in daily takes seconds and exporting my printable DTR for my advisor was super smooth.",
            tag: "DTR Tracking"
        },
        {
            name: "Maria Sophia Santos",
            role: "Software Developer Intern",
            avatar: "MS",
            rating: 5,
            content: "I love the weekly journal and task submission system. My company supervisor can review my accomplishments and provide feedback in real time.",
            tag: "Journal Logs"
        },
        {
            name: "Christian Diaz",
            role: "BS Computer Science Intern",
            avatar: "CD",
            rating: 5,
            content: "The real-time progress tracker and audit log features give complete peace of mind. Highly recommended for all university OJT programs!",
            tag: "Progress Tracking"
        }
    ];

    const [reviews, setReviews] = useState(defaultReviews);

    // 5-Photo Hero Showcase Carousel Data
    const heroSlides = [
        {
            image: slideTasks,
            title: "My Assigned OJT Tasks & Directives",
            subtitle: "Track, view attachments, and update task progress in real-time.",
            badge: "Task Management"
        },
        {
            image: slideAsk,
            title: "Ask a Question & Inquiry Desk",
            subtitle: "1-on-1 thread communication with assigned OJT coordinators & advisors.",
            badge: "Inquiry Desk"
        },
        {
            image: slideRequests,
            title: "Service Requests & Applications",
            subtitle: "Lodge document applications, schedule adjustments, or endorsement requests.",
            badge: "Service Requests"
        },
        {
            image: slideProfile,
            title: "Verified Student Account Profile",
            subtitle: "Comprehensive identification, degree track, and IT specialization details.",
            badge: "Student Profile"
        },
        {
            image: slideSettings,
            title: "Student Portal Configuration & Security",
            subtitle: "Manage profile preferences, contact info, and notification alerts.",
            badge: "Portal Settings"
        }
    ];

    const [currentSlide, setCurrentSlide] = useState(0);
    const [isPaused, setIsPaused] = useState(false);

    // Auto-advance slide every 4.5 seconds unless paused on hover
    useEffect(() => {
        if (isPaused) return;
        const interval = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
        }, 4500);
        return () => clearInterval(interval);
    }, [isPaused, heroSlides.length]);

    const handlePrevSlide = () => {
        setCurrentSlide((prev) => (prev === 0 ? heroSlides.length - 1 : prev - 1));
    };

    const handleNextSlide = () => {
        setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    };

    useEffect(() => {
        const token = localStorage.getItem('token');
        const role = localStorage.getItem('role'); 

        if (token && role) {
            navigate(role === 'admin' ? '/admin-dashboard' : '/student-dashboard');
        }

        // Fetch live stats & student reviews from database
        const fetchStats = async () => {
            try {
                const response = await api.get('/auth/public-stats');
                if (response.data?.success) {
                    if (response.data?.stats) {
                        setLiveStats(response.data.stats);
                    }
                    if (response.data?.feedbacks && response.data.feedbacks.length > 0) {
                        const dbReviews = response.data.feedbacks.map((f: any) => ({
                            name: f.student_name || 'Verified Student Intern',
                            role: f.category || 'OJT Student Intern',
                            avatar: (f.student_name || 'ST').split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase(),
                            rating: f.rating || 5,
                            content: f.content,
                            tag: f.category || 'Intern Feedback'
                        }));
                        setReviews(dbReviews);
                    }
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
                            to="/portal"
                            className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-300 hover:text-white bg-[#090e1a] border border-slate-800 hover:border-emerald-500/50 transition-all flex items-center gap-2"
                        >
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Portals
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
                            to="/portal"
                            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-[#090e1a] hover:bg-slate-900 border border-slate-800 hover:border-emerald-500/40 text-white font-bold text-sm tracking-wide transition-all flex items-center justify-center gap-2"
                        >
                            Access Portals
                        </Link>
                    </div>
                </div>

                {/* Hero Mockup Carousel Showcase */}
                <div 
                    className="relative max-w-5xl mx-auto"
                    onMouseEnter={() => setIsPaused(true)}
                    onMouseLeave={() => setIsPaused(false)}
                >
                    <div className="absolute inset-0 bg-linear-to-r from-emerald-500/10 via-teal-500/10 to-emerald-500/10 blur-3xl rounded-3xl -z-10" />

                    <div className="relative rounded-3xl overflow-hidden border border-slate-800/90 bg-[#090e1a]/90 p-3 shadow-2xl backdrop-blur-2xl">
                        <div className="relative rounded-2xl overflow-hidden aspect-16/9 sm:aspect-21/9 border border-slate-800 bg-slate-950">
                            
                            {/* Slide Images with Smooth Fade Transition */}
                            {heroSlides.map((slide, idx) => (
                                <div 
                                    key={idx}
                                    className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                                        idx === currentSlide ? 'opacity-100 z-10 pointer-events-auto' : 'opacity-0 z-0 pointer-events-none'
                                    }`}
                                >
                                    <img 
                                        src={slide.image} 
                                        alt={slide.title} 
                                        className="w-full h-full object-cover object-top brightness-95 hover:brightness-100 transition-all duration-700"
                                    />
                                    <div className="absolute inset-0 bg-linear-to-t from-[#040812] via-transparent to-[#040812]/30 pointer-events-none" />
                                </div>
                            ))}

                            {/* Top Left Badge - Current Module Info */}
                            <div className="absolute top-4 left-4 sm:top-6 sm:left-6 z-20 px-4 py-2.5 rounded-2xl bg-[#040812]/90 border border-slate-800 backdrop-blur-md flex items-center gap-3 shadow-xl">
                                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                                <div>
                                    <p className="text-[10px] uppercase font-black tracking-wider text-slate-400">PORTAL MODULE</p>
                                    <p className="text-xs font-bold text-white">{heroSlides[currentSlide].badge}</p>
                                </div>
                            </div>

                            {/* Top Right Counter Badge */}
                            <div className="absolute top-4 right-4 sm:top-6 sm:right-6 z-20 px-3.5 py-1.5 rounded-xl bg-[#040812]/90 border border-slate-800 backdrop-blur-md text-[11px] font-black text-emerald-400 shadow-xl">
                                Slide {currentSlide + 1} / {heroSlides.length}
                            </div>

                            {/* Bottom Left Slide Caption */}
                            <div className="absolute bottom-4 left-4 sm:bottom-6 sm:left-6 right-20 sm:right-24 z-20 px-4 py-3 rounded-2xl bg-[#040812]/90 border border-slate-800/90 backdrop-blur-md shadow-xl text-left hidden sm:block">
                                <h4 className="text-xs font-black text-white">{heroSlides[currentSlide].title}</h4>
                                <p className="text-[11px] text-slate-400 font-medium truncate mt-0.5">{heroSlides[currentSlide].subtitle}</p>
                            </div>

                            {/* Prev / Next Navigation Arrow Buttons */}
                            <button
                                onClick={handlePrevSlide}
                                className="absolute left-3 top-1/2 -translate-y-1/2 z-30 w-10 h-10 rounded-full bg-[#040812]/80 border border-slate-800 text-slate-300 hover:text-white hover:bg-emerald-500 hover:border-emerald-400 hover:text-slate-950 flex items-center justify-center transition-all cursor-pointer shadow-2xl backdrop-blur-md"
                                title="Previous Slide"
                            >
                                <ChevronLeft className="w-5 h-5" />
                            </button>

                            <button
                                onClick={handleNextSlide}
                                className="absolute right-3 top-1/2 -translate-y-1/2 z-30 w-10 h-10 rounded-full bg-[#040812]/80 border border-slate-800 text-slate-300 hover:text-white hover:bg-emerald-500 hover:border-emerald-400 hover:text-slate-950 flex items-center justify-center transition-all cursor-pointer shadow-2xl backdrop-blur-md"
                                title="Next Slide"
                            >
                                <ChevronRight className="w-5 h-5" />
                            </button>

                        </div>

                        {/* Bottom Slide Indicator Tabs */}
                        <div className="mt-3 flex items-center justify-center gap-2 overflow-x-auto py-1">
                            {heroSlides.map((slide, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setCurrentSlide(idx)}
                                    className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all cursor-pointer flex items-center gap-2 shrink-0 border ${
                                        idx === currentSlide
                                            ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-md shadow-emerald-500/20'
                                            : 'bg-[#040812] text-slate-400 border-slate-800 hover:text-slate-200 hover:border-slate-700'
                                    }`}
                                >
                                    <span className={`w-1.5 h-1.5 rounded-full ${idx === currentSlide ? 'bg-slate-950' : 'bg-slate-600'}`} />
                                    <span>{slide.badge}</span>
                                </button>
                            ))}
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
            {/* 6.5 STUDENT INTERN RATINGS & REVIEWS                      */}
            {/* ========================================================= */}
            <section id="reviews" className="relative z-10 py-24 px-6 max-w-7xl mx-auto">
                {/* Section Header */}
                <div className="text-center max-w-2xl mx-auto mb-16">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#090e1a] border border-slate-800 text-xs font-bold text-amber-400 mb-4 backdrop-blur-md shadow-lg">
                        <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                        <span>INTERN FEEDBACK & RATINGS</span>
                    </div>
                    <h3 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                        Loved by Student Interns & Mentors
                    </h3>
                    <p className="text-slate-400 text-sm font-medium mt-2">
                        Real feedback from students using MentorLog for daily DTR tracking, journal submissions, and supervisor reviews.
                    </p>
                </div>

                {/* Overall Rating Banner */}
                <div className="mb-14 max-w-4xl mx-auto bg-[#090e1a]/90 border border-slate-800/90 rounded-3xl p-6 sm:p-8 backdrop-blur-xl flex flex-col sm:flex-row items-center justify-between gap-6 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-[2px] bg-linear-to-r from-transparent via-emerald-500/80 to-transparent rounded-full" />
                    
                    <div className="flex items-center gap-5">
                        <div className="text-center sm:text-left">
                            <span className="text-5xl font-black text-white tracking-tight">4.9</span>
                            <span className="text-sm font-bold text-slate-400"> / 5.0</span>
                        </div>
                        <div>
                            <div className="flex items-center gap-1 mb-1">
                                {[...Array(5)].map((_, i) => (
                                    <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />
                                ))}
                            </div>
                            <p className="text-xs font-bold text-slate-300">Overall Student Satisfaction Rating</p>
                            <p className="text-[11px] text-slate-500 font-medium">Based on verified intern logbook entries & attendance reviews</p>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-center sm:justify-end gap-2 text-[11px] font-bold">
                        <span className="px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                            ✓ 100% Verified DTR Logs
                        </span>
                        <span className="px-3 py-1.5 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-400">
                            ⚡ Instant Export
                        </span>
                        <span className="px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400">
                            🛡️ 24/7 Portal Access
                        </span>
                    </div>
                </div>

                {/* Ratings Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {reviews.map((r, idx) => (
                        <div 
                            key={idx}
                            className="p-7 rounded-3xl bg-[#090e1a]/80 border border-slate-800/90 hover:border-emerald-500/40 transition-all duration-300 backdrop-blur-xl flex flex-col justify-between group hover:shadow-[0_10px_30px_rgba(16,185,129,0.1)] relative"
                        >
                            <Quote className="absolute top-6 right-6 w-8 h-8 text-slate-800/40 group-hover:text-emerald-500/20 transition-colors pointer-events-none" />

                            <div>
                                {/* Stars */}
                                <div className="flex items-center gap-1 mb-4">
                                    {[...Array(r.rating)].map((_, i) => (
                                        <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                                    ))}
                                </div>

                                {/* Review Quote */}
                                <p className="text-slate-300 text-xs sm:text-sm font-medium leading-relaxed mb-6 italic">
                                    "{r.content}"
                                </p>
                            </div>

                            {/* Student Profile Info */}
                            <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 font-black text-sm flex items-center justify-center shadow-inner">
                                        {r.avatar}
                                    </div>
                                    <div>
                                        <h5 className="text-xs font-black text-white">{r.name}</h5>
                                        <p className="text-[10px] font-semibold text-slate-400">{r.role}</p>
                                    </div>
                                </div>
                                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                                    {r.tag}
                                </span>
                            </div>
                        </div>
                    ))}
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
            <Footer />
        </div>
    );
};

export default LandingPage;