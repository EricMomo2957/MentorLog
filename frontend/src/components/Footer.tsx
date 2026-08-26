import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Globe, Mail, ShieldCheck, FileText, Info, X, CheckCircle2, Lock, Sparkles, UserCheck } from 'lucide-react';
import mentorLogLogo from '../assets/mentorlogOption.png';

interface FeatureModalInfo {
    title: string;
    description: string;
    targetRoute: {
        student: string;
        admin: string;
    };
    icon: React.ReactNode;
}

const Footer: React.FC = () => {
    const navigate = useNavigate();
    const [activeModal, setActiveModal] = useState<'terms' | 'privacy' | 'about' | null>(null);
    const [featureInfo, setFeatureInfo] = useState<FeatureModalInfo | null>(null);

    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    const isLoggedIn = Boolean(token && role);

    const handleFeatureClick = (info: FeatureModalInfo) => {
        if (isLoggedIn) {
            // Smart navigation depending on role - NEVER logs the user out!
            if (role === 'student') {
                navigate(info.targetRoute.student);
            } else if (role === 'admin') {
                navigate(info.targetRoute.admin);
            } else {
                navigate('/login');
            }
        } else {
            // Show informative modal for unauthenticated visitors
            setFeatureInfo(info);
        }
    };

    return (
        <>
            <footer className="w-full bg-[#02050c] text-slate-300 border-t border-slate-800/80 font-sans pt-14 pb-8 px-6 sm:px-12 relative z-30 select-none">
                <div className="max-w-7xl mx-auto space-y-10">
                    
                    {/* Top Content Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                        
                        {/* Brand & Description Column (Left - 5 Cols) */}
                        <div className="lg:col-span-5 space-y-4">
                            <div className="flex items-center gap-3">
                                <img src={mentorLogLogo} alt="MentorLog" className="w-9 h-9 drop-shadow-md" />
                                <span className="text-2xl font-black text-white tracking-tight">
                                    Mentor<span className="text-emerald-400">Log</span>
                                </span>
                            </div>

                            <p className="text-xs text-slate-400 font-medium leading-relaxed max-w-md">
                                Transparent internship tracking, automated daily time records (DTR), accomplishment log management, and intern progress tracking for <strong className="text-white font-bold">OJT Programs, Supervisors, & Universities.</strong>
                            </p>

                            {/* Social & Contact Circular Buttons */}
                            <div className="flex items-center gap-3 pt-2">
                                <button 
                                    onClick={() => setActiveModal('about')}
                                    className="w-9 h-9 rounded-full bg-[#090e1a] border border-slate-800 hover:border-emerald-500/50 text-slate-400 hover:text-white flex items-center justify-center transition-all cursor-pointer shadow-md"
                                    title="About MentorLog OJT"
                                >
                                    <Globe className="w-4 h-4" />
                                </button>
                                <a 
                                    href="mailto:support@mentorlog.edu" 
                                    className="w-9 h-9 rounded-full bg-[#090e1a] border border-slate-800 hover:border-emerald-500/50 text-slate-400 hover:text-white flex items-center justify-center transition-all cursor-pointer shadow-md"
                                    title="Contact Email Support"
                                >
                                    <Mail className="w-4 h-4" />
                                </a>
                            </div>
                        </div>

                        {/* Navigation Columns (Right - 7 Cols) */}
                        <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-8 text-xs">
                            
                            {/* Column 1: PLATFORM FEATURES */}
                            <div className="space-y-3">
                                <h4 className="font-black text-white uppercase tracking-wider text-[11px]">PLATFORM FEATURES</h4>
                                <ul className="space-y-2.5 text-slate-400 font-medium">
                                    <li>
                                        <button 
                                            onClick={() => handleFeatureClick({
                                                title: "Task Management Directive",
                                                description: "View, organize, and complete assigned OJT tasks with real-time status updates and attachment submissions.",
                                                targetRoute: { student: '/tasks', admin: '/manage-tasks' },
                                                icon: <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                                            })}
                                            className="hover:text-emerald-400 transition-colors text-left cursor-pointer"
                                        >
                                            Task Management
                                        </button>
                                    </li>
                                    <li>
                                        <button 
                                            onClick={() => handleFeatureClick({
                                                title: "DTR & Attendance Log",
                                                description: "Automated daily clock-in/out records with hour computation and printable DTR report export.",
                                                targetRoute: { student: '/student-dashboard', admin: '/manage-attendance' },
                                                icon: <UserCheck className="w-6 h-6 text-emerald-400" />
                                            })}
                                            className="hover:text-emerald-400 transition-colors text-left cursor-pointer"
                                        >
                                            DTR & Attendance Log
                                        </button>
                                    </li>
                                    <li>
                                        <button 
                                            onClick={() => handleFeatureClick({
                                                title: "Progress Tracker",
                                                description: "Monitor total rendered OJT hours, verified accomplishments, and remaining quota required by your university.",
                                                targetRoute: { student: '/student-dashboard', admin: '/admin-dashboard' },
                                                icon: <Sparkles className="w-6 h-6 text-emerald-400" />
                                            })}
                                            className="hover:text-emerald-400 transition-colors text-left cursor-pointer"
                                        >
                                            Progress Tracker
                                        </button>
                                    </li>
                                    <li>
                                        <button 
                                            onClick={() => handleFeatureClick({
                                                title: "Document Submissions",
                                                description: "Upload and archive weekly logbooks, accomplishment reports, and internship paper submissions.",
                                                targetRoute: { student: '/submissions', admin: '/manage-submissions' },
                                                icon: <FileText className="w-6 h-6 text-emerald-400" />
                                            })}
                                            className="hover:text-emerald-400 transition-colors text-left cursor-pointer"
                                        >
                                            Document Submissions
                                        </button>
                                    </li>
                                </ul>
                            </div>

                            {/* Column 2: INTERN SERVICES */}
                            <div className="space-y-3">
                                <h4 className="font-black text-white uppercase tracking-wider text-[11px]">INTERN SERVICES</h4>
                                <ul className="space-y-2.5 text-slate-400 font-medium">
                                    <li>
                                        <button 
                                            onClick={() => handleFeatureClick({
                                                title: "Student Portal Dashboard",
                                                description: "Central command center for student interns to clock in, view announcements, and track progress.",
                                                targetRoute: { student: '/student-dashboard', admin: '/admin-dashboard' },
                                                icon: <UserCheck className="w-6 h-6 text-teal-400" />
                                            })}
                                            className="hover:text-emerald-400 transition-colors text-left cursor-pointer"
                                        >
                                            Student Dashboard
                                        </button>
                                    </li>
                                    <li>
                                        <button 
                                            onClick={() => handleFeatureClick({
                                                title: "Intern Q&A & Support Desk",
                                                description: "Direct 1-on-1 thread communication desk to send inquiries to your OJT advisor or company supervisor.",
                                                targetRoute: { student: '/StudentAsk', admin: '/admin/ask-question' },
                                                icon: <Info className="w-6 h-6 text-teal-400" />
                                            })}
                                            className="hover:text-emerald-400 transition-colors text-left cursor-pointer"
                                        >
                                            Intern Q&A & Support
                                        </button>
                                    </li>
                                    <li>
                                        <button 
                                            onClick={() => handleFeatureClick({
                                                title: "Feedback & Ratings",
                                                description: "Share feedback regarding your internship deployment, company environment, and mentor guidance.",
                                                targetRoute: { student: '/submit-feedback', admin: '/manage-feedback' },
                                                icon: <Sparkles className="w-6 h-6 text-teal-400" />
                                            })}
                                            className="hover:text-emerald-400 transition-colors text-left cursor-pointer"
                                        >
                                            Feedback & Ratings
                                        </button>
                                    </li>
                                    <li>
                                        <button 
                                            onClick={() => handleFeatureClick({
                                                title: "Weekly Activity Reports",
                                                description: "Compile and summarize weekly OJT accomplishments for advisor verification.",
                                                targetRoute: { student: '/student-dashboard', admin: '/weekly-reports' },
                                                icon: <FileText className="w-6 h-6 text-teal-400" />
                                            })}
                                            className="hover:text-emerald-400 transition-colors text-left cursor-pointer"
                                        >
                                            Weekly Activity Reports
                                        </button>
                                    </li>
                                </ul>
                            </div>

                            {/* Column 3: MENTORLOG */}
                            <div className="space-y-3">
                                <h4 className="font-black text-white uppercase tracking-wider text-[11px]">MENTORLOG</h4>
                                <ul className="space-y-2.5 text-slate-400 font-medium">
                                    <li>
                                        <button 
                                            onClick={() => setActiveModal('about')}
                                            className="hover:text-emerald-400 transition-colors text-left cursor-pointer"
                                        >
                                            About MentorLog OJT
                                        </button>
                                    </li>
                                    <li>
                                        <a href="mailto:support@mentorlog.edu" className="hover:text-emerald-400 transition-colors">
                                            Office & Contact Info
                                        </a>
                                    </li>
                                    <li>
                                        <button 
                                            onClick={() => setActiveModal('terms')}
                                            className="hover:text-emerald-400 transition-colors text-left cursor-pointer"
                                        >
                                            Terms & Conditions
                                        </button>
                                    </li>
                                </ul>
                            </div>

                        </div>
                    </div>

                    {/* Bottom Line Divider */}
                    <div className="border-t border-slate-800/80 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500 font-medium">
                        <div className="space-y-1 text-center sm:text-left">
                            <p>© 2026 MentorLog OJT Platform. All rights reserved.</p>
                            <p className="flex items-center justify-center sm:justify-start gap-1.5 text-slate-400 font-semibold">
                                <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                                Engineered & Maintained by <strong className="text-white font-bold">MentorLog Solutions</strong>
                            </p>
                        </div>

                        {/* Terms & Privacy Action Links */}
                        <div className="flex items-center gap-6 text-slate-400 font-semibold">
                            <button 
                                onClick={() => setActiveModal('terms')}
                                className="hover:text-emerald-400 transition-colors cursor-pointer"
                            >
                                Terms
                            </button>
                            <button 
                                onClick={() => setActiveModal('privacy')}
                                className="hover:text-emerald-400 transition-colors cursor-pointer"
                            >
                                Privacy
                            </button>
                        </div>
                    </div>
                </div>
            </footer>

            {/* ========================================================= */}
            {/* FEATURE INFORMATION MODAL (FOR VISITORS)                   */}
            {/* ========================================================= */}
            {featureInfo && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
                    <div className="bg-[#090e1a] border border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl relative">
                        <button 
                            onClick={() => setFeatureInfo(null)}
                            className="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-900 border border-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                        >
                            <X className="w-4 h-4" />
                        </button>

                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-3 bg-slate-900 rounded-2xl border border-slate-800">
                                {featureInfo.icon}
                            </div>
                            <div>
                                <h3 className="text-base font-black text-white">{featureInfo.title}</h3>
                                <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                                    Feature Overview
                                </span>
                            </div>
                        </div>

                        <p className="text-slate-300 text-xs leading-relaxed font-medium mb-6">
                            {featureInfo.description}
                        </p>

                        <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 text-[11px] text-slate-400 mb-6 flex items-center gap-2">
                            <Lock className="w-4 h-4 text-emerald-400 shrink-0" />
                            <span>Sign in to your student or mentor portal account to access live data.</span>
                        </div>

                        <div className="flex items-center gap-3">
                            <button 
                                onClick={() => setFeatureInfo(null)}
                                className="w-1/2 py-2.5 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 rounded-xl font-bold text-xs transition-colors cursor-pointer"
                            >
                                Close
                            </button>
                            <button 
                                onClick={() => {
                                    setFeatureInfo(null);
                                    navigate('/login');
                                }}
                                className="w-1/2 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl font-black text-xs transition-all cursor-pointer shadow-lg shadow-emerald-500/20"
                            >
                                Sign In →
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ========================================================= */}
            {/* POLICY & TERMS & ABOUT MODALS                             */}
            {/* ========================================================= */}
            {activeModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
                    <div className="bg-[#090e1a] border border-slate-800 rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl relative max-h-[85vh] overflow-y-auto">
                        
                        {/* Close Button */}
                        <button 
                            onClick={() => setActiveModal(null)}
                            className="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-900 border border-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                        >
                            <X className="w-4 h-4" />
                        </button>

                        {/* TERMS & CONDITIONS MODAL */}
                        {activeModal === 'terms' && (
                            <div className="space-y-4">
                                <div className="flex items-center gap-3 text-emerald-400 mb-2">
                                    <FileText className="w-6 h-6" />
                                    <h3 className="text-xl font-black text-white">Terms & Conditions</h3>
                                </div>
                                <p className="text-slate-400 text-xs leading-relaxed">
                                    Welcome to <strong className="text-white">MentorLog OJT Platform</strong>. By registering or using our system, student interns, supervisors, and administrators agree to abide by the following terms:
                                </p>
                                <div className="space-y-3 text-xs text-slate-300 font-medium">
                                    <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800">
                                        <h4 className="font-bold text-emerald-400 mb-1">1. Accurate Attendance Logging</h4>
                                        <p className="text-slate-400 text-[11px]">Interns must record authentic clock-in and clock-out entries. Falsification of daily time records (DTR) is strictly prohibited.</p>
                                    </div>
                                    <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800">
                                        <h4 className="font-bold text-emerald-400 mb-1">2. Accomplishment Journals</h4>
                                        <p className="text-slate-400 text-[11px]">Daily and weekly logbook entries should accurately reflect tasks rendered during official OJT hours.</p>
                                    </div>
                                    <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800">
                                        <h4 className="font-bold text-emerald-400 mb-1">3. Institutional Compliance</h4>
                                        <p className="text-slate-400 text-[11px]">All submissions are subject to audit and verification by designated academic advisors and company supervisors.</p>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => setActiveModal(null)}
                                    className="w-full mt-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black py-3 rounded-xl transition-all cursor-pointer text-xs"
                                >
                                    I Understand & Agree
                                </button>
                            </div>
                        )}

                        {/* PRIVACY POLICY MODAL */}
                        {activeModal === 'privacy' && (
                            <div className="space-y-4">
                                <div className="flex items-center gap-3 text-teal-400 mb-2">
                                    <ShieldCheck className="w-6 h-6" />
                                    <h3 className="text-xl font-black text-white">Privacy Policy</h3>
                                </div>
                                <p className="text-slate-400 text-xs leading-relaxed">
                                    MentorLog is committed to safeguarding student data and institutional records under strict data protection protocols:
                                </p>
                                <div className="space-y-3 text-xs text-slate-300 font-medium">
                                    <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800">
                                        <h4 className="font-bold text-teal-400 mb-1">🔒 Password & Credential Security</h4>
                                        <p className="text-slate-400 text-[11px]">Passwords are stored using industry-standard bcrypt salt hashing. OTP verifications use automated 256-bit keys.</p>
                                    </div>
                                    <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800">
                                        <h4 className="font-bold text-teal-400 mb-1">📂 DTR & Document Privacy</h4>
                                        <p className="text-slate-400 text-[11px]">Submitted accomplishment reports and attendance logs are accessible only to verified student owners and authorized administrators.</p>
                                    </div>
                                    <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800">
                                        <h4 className="font-bold text-teal-400 mb-1">🛡️ No Third-Party Sales</h4>
                                        <p className="text-slate-400 text-[11px]">Student personal details and institutional records are never shared or sold to third parties.</p>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => setActiveModal(null)}
                                    className="w-full mt-4 bg-teal-500 hover:bg-teal-400 text-slate-950 font-black py-3 rounded-xl transition-all cursor-pointer text-xs"
                                >
                                    Close Privacy Policy
                                </button>
                            </div>
                        )}

                        {/* ABOUT MENTORLOG OJT MODAL */}
                        {activeModal === 'about' && (
                            <div className="space-y-4">
                                <div className="flex items-center gap-3 text-emerald-400 mb-2">
                                    <Info className="w-6 h-6" />
                                    <h3 className="text-xl font-black text-white">About MentorLog OJT</h3>
                                </div>
                                <p className="text-slate-300 text-xs leading-relaxed font-medium">
                                    <strong className="text-white font-bold">MentorLog</strong> is an all-in-one digital internship management system engineered to streamline Daily Time Records (DTR), accomplishment journal tracking, and advisor oversight.
                                </p>
                                <div className="p-4 bg-slate-900/80 rounded-2xl border border-slate-800 space-y-2 text-xs">
                                    <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                                        <span className="text-slate-400">Platform Version</span>
                                        <strong className="text-emerald-400 font-bold">v1.0.0 (Production)</strong>
                                    </div>
                                    <div className="flex items-center justify-between border-b border-slate-800 pb-2 pt-1">
                                        <span className="text-slate-400">Engineered By</span>
                                        <strong className="text-white font-bold">MentorLog Solutions</strong>
                                    </div>
                                    <div className="flex items-center justify-between pt-1">
                                        <span className="text-slate-400">Support Contact</span>
                                        <strong className="text-slate-300 font-bold">support@mentorlog.edu</strong>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => setActiveModal(null)}
                                    className="w-full mt-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black py-3 rounded-xl transition-all cursor-pointer text-xs"
                                >
                                    Close
                                </button>
                            </div>
                        )}

                    </div>
                </div>
            )}
        </>
    );
};

export default Footer;
