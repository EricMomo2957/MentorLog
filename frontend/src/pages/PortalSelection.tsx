import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
    FiArrowLeft 
} from 'react-icons/fi';
import { 
    Pencil, 
    BookOpen, 
    FileText, 
    GraduationCap, 
    ClipboardList, 
    Award, 
    BookMarked,
    PenTool,
    Sparkles
} from 'lucide-react';
import mentorLogLogo from '../assets/mentorlogOption.png';
import PortalCardSelector from '../components/PortalCardSelector';
import Footer from '../components/Footer';

const PortalSelection: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen w-full relative bg-[#040812] text-slate-100 font-sans overflow-hidden flex flex-col justify-between items-center p-4 sm:p-6 select-none">
            
            {/* ========================================================= */}
            {/* 1. DYNAMIC FLOATING ANIMATED BACKGROUND ICONS & GLOWS     */}
            {/* ========================================================= */}
            {/* Ambient Background Glows */}
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/10 blur-[140px] rounded-full pointer-events-none animate-pulse-glow" />
            <div className="absolute bottom-10 left-10 w-96 h-96 bg-teal-600/10 blur-[130px] rounded-full pointer-events-none" />
            <div className="absolute top-10 right-10 w-96 h-96 bg-blue-600/10 blur-[130px] rounded-full pointer-events-none" />

            {/* Floating OJT / Education Icons */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                {/* Pencil - Top Left */}
                <div className="absolute top-16 left-[10%] text-emerald-400/20 animate-float-slow" style={{ animationDelay: '0s' }}>
                    <Pencil className="w-10 h-10 transform -rotate-12" />
                </div>

                {/* BookOpen - Top Right */}
                <div className="absolute top-24 right-[12%] text-emerald-400/25 animate-float-reverse" style={{ animationDelay: '1s' }}>
                    <BookOpen className="w-12 h-12 transform rotate-12" />
                </div>

                {/* FileText (Note/Logbook) - Middle Left */}
                <div className="absolute top-[42%] left-[8%] text-teal-400/20 animate-float-reverse" style={{ animationDelay: '2s' }}>
                    <FileText className="w-14 h-14 transform -rotate-45" />
                </div>

                {/* GraduationCap - Middle Right */}
                <div className="absolute top-[48%] right-[8%] text-emerald-500/20 animate-float-slow" style={{ animationDelay: '1.5s' }}>
                    <GraduationCap className="w-14 h-14 transform rotate-12" />
                </div>

                {/* ClipboardList - Bottom Left */}
                <div className="absolute bottom-20 left-[14%] text-emerald-400/20 animate-float-slow" style={{ animationDelay: '3s' }}>
                    <ClipboardList className="w-12 h-12 transform rotate-6" />
                </div>

                {/* Award - Bottom Right */}
                <div className="absolute bottom-24 right-[15%] text-teal-400/25 animate-float-reverse" style={{ animationDelay: '2.5s' }}>
                    <Award className="w-11 h-11 transform -rotate-12" />
                </div>

                {/* PenTool - Top Center-Left */}
                <div className="absolute top-12 left-[32%] text-emerald-400/15 animate-float-slow" style={{ animationDelay: '4s' }}>
                    <PenTool className="w-8 h-8 transform rotate-45" />
                </div>

                {/* BookMarked - Bottom Center-Right */}
                <div className="absolute bottom-12 right-[34%] text-emerald-300/15 animate-float-reverse" style={{ animationDelay: '3.5s' }}>
                    <BookMarked className="w-9 h-9 transform -rotate-12" />
                </div>

                {/* Sparkles - Center Floating Details */}
                <div className="absolute top-1/3 right-[28%] text-emerald-300/20 animate-float-slow" style={{ animationDelay: '0.8s' }}>
                    <Sparkles className="w-7 h-7" />
                </div>
            </div>

            {/* ========================================================= */}
            {/* 2. TOP BAR & BRAND HEADER                                 */}
            {/* ========================================================= */}
            <div className="w-full max-w-5xl flex justify-between items-center z-20 pt-2 pb-4">
                {/* Back to Home Button */}
                <button 
                    onClick={() => navigate('/')}
                    className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-xs font-bold uppercase tracking-wider group cursor-pointer bg-slate-900/60 backdrop-blur-md px-3.5 py-2 rounded-xl border border-slate-800/80 hover:border-slate-700"
                >
                    <FiArrowLeft className="text-sm group-hover:-translate-x-1 transition-transform" /> 
                    <span>Back to Home</span>
                </button>

                {/* Top Right Direct Sign In Link */}
                <Link
                    to="/login"
                    className="text-xs font-bold text-slate-400 hover:text-emerald-400 transition-colors uppercase tracking-wider"
                >
                    Direct Sign In →
                </Link>
            </div>

            {/* ========================================================= */}
            {/* 3. CENTERED ROLE SELECTION CONTENT                         */}
            {/* ========================================================= */}
            <div className="w-full flex-1 flex flex-col items-center justify-center z-20 my-auto py-6">
                
                {/* Header above the cards */}
                <div className="flex flex-col items-center text-center mb-8 sm:mb-10">
                    <div className="flex items-center gap-3 mb-3">
                        <img 
                            src={mentorLogLogo} 
                            alt="MentorLog Logo" 
                            className="w-10 h-10 object-contain drop-shadow-[0_0_12px_rgba(16,185,129,0.4)]"
                        />
                        <span className="text-2xl font-black tracking-tight text-white">
                            Mentor<span className="text-emerald-400">Log</span>
                        </span>
                    </div>

                    {/* Badge */}
                    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#090e1a] border border-slate-800/90 text-slate-300 text-xs font-bold uppercase tracking-wider mb-4 backdrop-blur-md shadow-lg">
                        <Sparkles className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                        <span>Role Gateway</span>
                    </div>

                    <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight mb-3">
                        Choose Your <span className="text-emerald-400">Access Portal</span>
                    </h1>
                    <p className="text-slate-400 text-sm sm:text-base max-w-md mx-auto leading-relaxed">
                        Please choose your designated role to enter the secure MentorLog OJT Management System.
                    </p>
                </div>

                {/* Role Cards Component */}
                <PortalCardSelector />

                {/* Quick Registration & Recovery Links */}
                <div className="mt-10 text-center text-xs sm:text-sm text-slate-400 flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-6">
                    <span>
                        New intern?{' '}
                        <Link to="/register" className="font-bold text-emerald-400 hover:text-emerald-300 transition-colors">
                            Create an Account
                        </Link>
                    </span>
                    <span className="hidden sm:inline text-slate-700">•</span>
                    <span>
                        Forgot your password?{' '}
                        <Link to="/forgot-password" className="font-semibold text-slate-400 hover:text-slate-200 transition-colors">
                            Reset Password
                        </Link>
                    </span>
                </div>
            </div>

            {/* ========================================================= */}
            {/* 4. FOOTER                                                 */}
            {/* ========================================================= */}
            <div className="w-full z-20 mt-6">
                <Footer />
            </div>
        </div>
    );
};

export default PortalSelection;
