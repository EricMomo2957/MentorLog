import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
    FiArrowLeft 
} from 'react-icons/fi';
import { 
    Eye, 
    EyeOff, 
    Mail, 
    Lock, 
    Pencil, 
    BookOpen, 
    FileText, 
    GraduationCap, 
    ClipboardList, 
    Award, 
    BookMarked,
    PenTool,
    Sparkles,
    ShieldCheck
} from 'lucide-react';
import mentorLogLogo from '../assets/mentorlogOption.png'; 
import api from '../services/api';

const Login = () => {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        
        try {
            const response = await api.post('/auth/login', formData);
            
            if (response.data?.success) {
                const { token, user } = response.data;
                localStorage.setItem('token', token);
                localStorage.setItem('role', user.role);
                localStorage.setItem('userName', user.full_name || user.name); 
                localStorage.setItem('userId', String(user.id)); 

                if (user.role === 'admin') {
                    navigate('/admin-dashboard');
                } else {
                    navigate('/student-dashboard');
                }
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Invalid credentials or connection error');
        } finally { 
            setLoading(false); 
        }
    };

    return (
        <div className="min-h-screen w-full relative bg-[#040812] text-slate-100 font-sans overflow-hidden flex flex-col justify-between items-center p-4 sm:p-6 select-none">
            
            {/* ========================================================= */}
            {/* 1. DYNAMIC FLOATING ANIMATED BACKGROUND ICONS & GLOWS     */}
            {/* ========================================================= */}
            {/* Ambient Background Glows */}
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/10 blur-[140px] rounded-full pointer-events-none animate-pulse-glow" />
            <div className="absolute bottom-10 left-10 w-96 h-96 bg-teal-600/10 blur-[130px] rounded-full pointer-events-none" />
            <div className="absolute top-10 right-10 w-96 h-96 bg-blue-600/10 blur-[130px] rounded-full pointer-events-none" />

            {/* Floating OJT / Education Icons (Pencil, Book, Note, Cap, etc.) */}
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
            <div className="w-full max-w-4xl flex justify-between items-center z-20 pt-2 pb-4">
                {/* Back to Home Button */}
                <button 
                    onClick={() => navigate('/')}
                    className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-xs font-bold uppercase tracking-wider group cursor-pointer bg-slate-900/60 backdrop-blur-md px-3.5 py-2 rounded-xl border border-slate-800/80 hover:border-slate-700"
                >
                    <FiArrowLeft className="text-sm group-hover:-translate-x-1 transition-transform" /> 
                    <span>Back to Home</span>
                </button>
            </div>

            {/* ========================================================= */}
            {/* 3. CENTERED LOGIN MODAL (MATCHING USER'S SAMPLE PHOTO)    */}
            {/* ========================================================= */}
            <div className="w-full flex-1 flex flex-col items-center justify-center z-20 my-auto py-4">
                
                {/* Header above the card */}
                <div className="flex flex-col items-center text-center mb-6">
                    <div className="flex items-center gap-3 mb-2">
                        <img 
                            src={mentorLogLogo} 
                            alt="MentorLog Logo" 
                            className="w-10 h-10 object-contain drop-shadow-[0_0_15px_rgba(16,185,129,0.4)]" 
                        />
                        <span className="text-3xl font-black tracking-tight text-white">
                            Mentor<span className="text-emerald-400">Log</span>
                        </span>
                    </div>
                    <p className="text-[11px] font-extrabold uppercase tracking-[0.25em] text-slate-400">
                        FLOWING CONNECTION. EFFICIENT OJT MANAGEMENT
                    </p>
                </div>

                {/* Centered Login Card Container */}
                <div className="w-full max-w-[420px] bg-[#090e1a]/90 backdrop-blur-2xl border border-slate-800/90 rounded-3xl p-7 sm:p-9 shadow-[0_20px_60px_rgba(0,0,0,0.8)] relative">
                    
                    {/* Inner Subtle Emerald Accent Line at Top */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-[3px] bg-linear-to-r from-transparent via-emerald-500/80 to-transparent rounded-full" />

                    <div className="mb-6">
                        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight mb-1.5">
                            OJT Portal Login
                        </h1>
                        <p className="text-slate-400 text-xs font-medium">
                            Please enter your credentials to access your account.
                        </p>
                    </div>

                    {/* Error Banner */}
                    {error && (
                        <div className="mb-5 bg-red-500/10 border border-red-500/30 text-red-400 p-3.5 rounded-xl text-xs flex items-center gap-2.5 animate-shake">
                            <span className="text-sm">⚠️</span> 
                            <span className="font-medium">{error}</span>
                        </div>
                    )}

                    {/* Login Form */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        
                        {/* EMAIL / USERNAME INPUT */}
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 ml-1">
                                EMAIL ADDRESS / USERNAME
                            </label>
                            <div className="relative">
                                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none">
                                    <Mail className="w-4 h-4" />
                                </div>
                                <input 
                                    type="email" 
                                    name="email" 
                                    placeholder="Enter your email" 
                                    value={formData.email}
                                    onChange={handleChange} 
                                    required 
                                    className="w-full py-3.5 pl-10 pr-4 rounded-xl bg-[#040812] border border-slate-800 text-white placeholder-slate-600 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all text-sm font-medium" 
                                />
                            </div>
                        </div>

                        {/* PASSWORD INPUT */}
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 ml-1">
                                PASSWORD
                            </label>
                            <div className="relative">
                                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none">
                                    <Lock className="w-4 h-4" />
                                </div>
                                <input 
                                    type={showPassword ? "text" : "password"} 
                                    name="password" 
                                    placeholder="••••••••••••" 
                                    value={formData.password}
                                    onChange={handleChange} 
                                    required 
                                    className="w-full py-3.5 pl-10 pr-11 rounded-xl bg-[#040812] border border-slate-800 text-white placeholder-slate-600 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all text-sm font-medium" 
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-200 transition-colors p-1 cursor-pointer"
                                    title={showPassword ? "Hide password" : "Show password"}
                                >
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>

                        {/* FORGOT PASSWORD LINK - RIGHT ALIGNED UNDER PASSWORD */}
                        <div className="flex justify-end pt-0.5">
                            <Link 
                                to="/forgot-password" 
                                className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition-colors"
                            >
                                Forgot Password?
                            </Link>
                        </div>

                        {/* LOGIN BUTTON */}
                        <button 
                            type="submit" 
                            disabled={loading}
                            className="w-full mt-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black py-3.5 rounded-xl transition-all shadow-lg shadow-emerald-500/20 active:scale-[0.99] disabled:opacity-50 cursor-pointer text-sm tracking-wide"
                        >
                            {loading ? 'Authenticating...' : 'Login'}
                        </button>
                    </form>

                    {/* CREATE ACCOUNT SECTION BELOW */}
                    <div className="mt-6 pt-5 border-t border-slate-800/80 text-center">
                        <p className="text-xs font-medium text-slate-400">
                            Don't have an account?{' '}
                            <Link 
                                to="/register" 
                                className="text-emerald-400 hover:text-emerald-300 font-extrabold hover:underline transition-colors"
                            >
                                Create one
                            </Link>
                        </p>
                    </div>

                </div>
            </div>

            {/* ========================================================= */}
            {/* 4. FOOTER CREDITS & SECURITY NOTICE                        */}
            {/* ========================================================= */}
            <div className="w-full max-w-2xl text-center z-20 pt-3 pb-2 space-y-1">
                <div className="flex items-center justify-center gap-1.5 text-[11px] font-medium text-slate-500">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-500/80" />
                    <span>Protected by MentorLog Automated Multi-Key Encryption protocol.</span>
                </div>
                <p className="text-[10px] font-semibold text-slate-600">
                    For support, contact <a href="mailto:support@mentorlog.edu" className="hover:text-slate-400 underline">support@mentorlog.edu</a>
                </p>
            </div>

        </div>
    );
};

export default Login;