import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';
import { 
    Mail, 
    Lock, 
    ShieldCheck, 
    Eye, 
    EyeOff, 
    Check, 
    RotateCw, 
    KeyRound, 
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
import api from '../services/api';
import Footer from '../components/Footer';

const ForgotPassword = () => {
    // Multi-Step State (1: Request Email, 2: Verify OTP, 3: New Password, 4: Complete)
    const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

    const [email, setEmail] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    // 6-digit OTP State
    const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '', '', '']);
    const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);
    const [expiryTimer, setExpiryTimer] = useState<number>(600); // 10 mins (600s)
    const [resendTimer, setResendTimer] = useState<number>(30); // 30s
    const [canResend, setCanResend] = useState<boolean>(false);
    const [resendLoading, setResendLoading] = useState<boolean>(false);

    const navigate = useNavigate();

    // Timers effect for Step 2
    useEffect(() => {
        let interval: any = null;
        if (step === 2) {
            interval = setInterval(() => {
                setExpiryTimer(prev => (prev > 0 ? prev - 1 : 0));
                setResendTimer(prev => {
                    if (prev <= 1) {
                        setCanResend(true);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [step]);

    const formatTimer = (seconds: number): string => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    const getPasswordStrength = (pwd: string) => {
        if (!pwd) return { score: 0, label: '', textColor: 'text-slate-500', barColor: 'bg-slate-800', borderColor: 'border-slate-800' };
        
        let score = 0;
        if (pwd.length >= 6) score++;
        if (pwd.length >= 8 || /[0-9]/.test(pwd)) score++;
        if (pwd.length >= 8 && /[A-Z]/.test(pwd) && (/[0-9]/.test(pwd) || /[^A-Za-z0-9]/.test(pwd))) {
            score = 3;
        }
        
        score = Math.max(1, Math.min(3, score));
        
        if (score === 1) {
            return { score: 1, label: 'Weak', textColor: 'text-red-400', barColor: 'bg-red-500', borderColor: 'border-red-500/80' };
        }
        if (score === 2) {
            return { score: 2, label: 'Normal', textColor: 'text-amber-400', barColor: 'bg-amber-500', borderColor: 'border-amber-500/80' };
        }
        return { score: 3, label: 'Strong', textColor: 'text-emerald-400', barColor: 'bg-emerald-500', borderColor: 'border-emerald-500/80' };
    };

    const strength = getPasswordStrength(newPassword);

    // Step 1: Send OTP to Email
    const handleStep1Submit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage('');
        setError('');

        if (!email) {
            setError('Please enter your email address.');
            return;
        }

        setLoading(true);
        try {
            const response = await api.post('/auth/forgot-password/send-otp', { email });
            if (response.data?.success) {
                setStep(2);
                setExpiryTimer(600); // 10 mins
                setResendTimer(30);  // 30s
                setCanResend(false);
                setOtpDigits(['', '', '', '', '', '']);
                setTimeout(() => {
                    otpInputRefs.current[0]?.focus();
                }, 200);
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'No registered user account found with this email address.');
        } finally {
            setLoading(false);
        }
    };

    // OTP Digit Input Handlers
    const handleOtpChange = (index: number, value: string) => {
        const char = value.slice(-1);
        if (char && !/^[0-9]$/.test(char)) return;

        const newOtp = [...otpDigits];
        newOtp[index] = char;
        setOtpDigits(newOtp);

        if (char && index < 5) {
            otpInputRefs.current[index + 1]?.focus();
        }
    };

    const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Backspace') {
            if (!otpDigits[index] && index > 0) {
                otpInputRefs.current[index - 1]?.focus();
            }
        }
    };

    const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text').trim();
        const digits = pastedData.replace(/\D/g, '').slice(0, 6).split('');
        if (digits.length > 0) {
            const newOtp = ['', '', '', '', '', ''];
            digits.forEach((d, i) => {
                newOtp[i] = d;
            });
            setOtpDigits(newOtp);
            const focusIndex = Math.min(digits.length, 5);
            otpInputRefs.current[focusIndex]?.focus();
        }
    };

    // Step 2: Verify OTP
    const handleStep2Verify = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setMessage('');

        const otpCode = otpDigits.join('');
        if (otpCode.length < 6) {
            setError('Please enter the complete 6-digit verification code.');
            return;
        }

        setLoading(true);
        try {
            const response = await api.post('/auth/forgot-password/verify-otp', {
                email,
                otpCode
            });

            if (response.data?.success) {
                setStep(3);
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Incorrect or expired verification code. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // Resend OTP
    const handleResendOTP = async () => {
        if (!canResend || resendLoading) return;
        setError('');
        setMessage('');
        setResendLoading(true);

        try {
            const response = await api.post('/auth/forgot-password/send-otp', { email });
            if (response.data?.success) {
                setMessage('A new 6-digit verification code has been sent to your email.');
                setResendTimer(30);
                setCanResend(false);
                setExpiryTimer(600);
                setOtpDigits(['', '', '', '', '', '']);
                otpInputRefs.current[0]?.focus();
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to resend code. Please try again.');
        } finally {
            setResendLoading(false);
        }
    };

    // Step 3: Reset Password with OTP
    const handleStep3Reset = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setMessage('');

        if (newPassword !== confirmPassword) {
            setError('Passwords do not match. Please verify your new password.');
            return;
        }

        if (newPassword.length < 6) {
            setError('Password must be at least 6 characters.');
            return;
        }

        setLoading(true);
        const otpCode = otpDigits.join('');

        try {
            const response = await api.post('/auth/forgot-password/reset', {
                email,
                otpCode,
                newPassword
            });

            if (response.data?.success) {
                setStep(4);
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Error updating password. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full relative bg-[#040812] text-slate-100 font-sans overflow-hidden flex flex-col justify-between items-center p-4 sm:p-6 select-none">
            
            {/* ========================================================= */}
            {/* 1. DYNAMIC FLOATING ANIMATED BACKGROUND ICONS & GLOWS     */}
            {/* ========================================================= */}
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/10 blur-[140px] rounded-full pointer-events-none animate-pulse-glow" />
            <div className="absolute bottom-10 left-10 w-96 h-96 bg-teal-600/10 blur-[130px] rounded-full pointer-events-none" />
            <div className="absolute top-10 right-10 w-96 h-96 bg-blue-600/10 blur-[130px] rounded-full pointer-events-none" />

            {/* Floating OJT / Education Icons */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-16 left-[10%] text-emerald-400/20 animate-float-slow" style={{ animationDelay: '0s' }}>
                    <Pencil className="w-10 h-10 transform -rotate-12" />
                </div>
                <div className="absolute top-24 right-[12%] text-emerald-400/25 animate-float-reverse" style={{ animationDelay: '1s' }}>
                    <BookOpen className="w-12 h-12 transform rotate-12" />
                </div>
                <div className="absolute top-[42%] left-[8%] text-teal-400/20 animate-float-reverse" style={{ animationDelay: '2s' }}>
                    <FileText className="w-14 h-14 transform -rotate-45" />
                </div>
                <div className="absolute top-[48%] right-[8%] text-emerald-500/20 animate-float-slow" style={{ animationDelay: '1.5s' }}>
                    <GraduationCap className="w-14 h-14 transform rotate-12" />
                </div>
                <div className="absolute bottom-20 left-[14%] text-emerald-400/20 animate-float-slow" style={{ animationDelay: '3s' }}>
                    <ClipboardList className="w-12 h-12 transform rotate-6" />
                </div>
                <div className="absolute bottom-24 right-[15%] text-teal-400/25 animate-float-reverse" style={{ animationDelay: '2.5s' }}>
                    <Award className="w-11 h-11 transform -rotate-12" />
                </div>
                <div className="absolute top-12 left-[32%] text-emerald-400/15 animate-float-slow" style={{ animationDelay: '4s' }}>
                    <PenTool className="w-8 h-8 transform rotate-45" />
                </div>
                <div className="absolute bottom-12 right-[34%] text-emerald-300/15 animate-float-reverse" style={{ animationDelay: '3.5s' }}>
                    <BookMarked className="w-9 h-9 transform -rotate-12" />
                </div>
                <div className="absolute top-1/3 right-[28%] text-emerald-300/20 animate-float-slow" style={{ animationDelay: '0.8s' }}>
                    <Sparkles className="w-7 h-7" />
                </div>
            </div>

            {/* ========================================================= */}
            {/* 2. TOP BAR & BRAND HEADER                                 */}
            {/* ========================================================= */}
            <div className="w-full max-w-4xl flex justify-between items-center z-20 pt-2 pb-4">
                <button 
                    onClick={() => navigate('/login')}
                    className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-xs font-bold uppercase tracking-wider group cursor-pointer bg-slate-900/60 backdrop-blur-md px-3.5 py-2 rounded-xl border border-slate-800/80 hover:border-slate-700"
                >
                    <FiArrowLeft className="text-sm group-hover:-translate-x-1 transition-transform" /> 
                    <span>Back to Login</span>
                </button>
            </div>

            {/* ========================================================= */}
            {/* 3. CENTERED FORGOT PASSWORD MODAL                         */}
            {/* ========================================================= */}
            <div className="w-full flex-1 flex flex-col items-center justify-center z-20 my-auto py-4">
                
                {/* Header above card */}
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

                {/* Main Centered Forgot Password Card */}
                <div className="w-full max-w-[420px] bg-[#090e1a]/90 backdrop-blur-2xl border border-slate-800/90 rounded-3xl p-7 sm:p-9 shadow-[0_20px_60px_rgba(0,0,0,0.8)] relative">
                    
                    {/* Inner Accent Line */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-[3px] bg-linear-to-r from-transparent via-emerald-500/80 to-transparent rounded-full" />

                    {/* Stepper Header */}
                    <div className="flex items-center justify-between max-w-md mx-auto mb-6 px-1">
                        <div className="flex items-center gap-2">
                            <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                                step > 1 ? 'bg-emerald-500 text-slate-950 font-black' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50'
                            }`}>
                                {step > 1 ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : '1'}
                            </div>
                            <span className={`text-xs font-bold ${step >= 1 ? 'text-emerald-400' : 'text-slate-500'}`}>Email</span>
                        </div>

                        <div className={`flex-1 h-0.5 mx-2 ${step > 1 ? 'bg-emerald-500' : 'bg-slate-800'}`} />

                        <div className="flex items-center gap-2">
                            <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                                step > 2 ? 'bg-emerald-500 text-slate-950 font-black' : step === 2 ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50' : 'bg-slate-900 text-slate-500 border border-slate-800'
                            }`}>
                                {step > 2 ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : '2'}
                            </div>
                            <span className={`text-xs font-bold ${step >= 2 ? 'text-emerald-400' : 'text-slate-500'}`}>Verify</span>
                        </div>

                        <div className={`flex-1 h-0.5 mx-2 ${step >= 3 ? 'bg-emerald-500' : 'bg-slate-800'}`} />

                        <div className="flex items-center gap-2">
                            <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                                step >= 3 ? 'bg-emerald-500 text-slate-950 font-black' : 'bg-slate-900 text-slate-500 border border-slate-800'
                            }`}>
                                {step === 4 ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : '3'}
                            </div>
                            <span className={`text-xs font-bold ${step >= 3 ? 'text-emerald-400' : 'text-slate-500'}`}>Password</span>
                        </div>
                    </div>

                    {message && (
                        <div className="mb-5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 p-3.5 rounded-xl text-xs flex items-center gap-2.5">
                            <span className="text-sm">✅</span> <span className="font-medium">{message}</span>
                        </div>
                    )}
                    {error && (
                        <div className="mb-5 bg-red-500/10 border border-red-500/30 text-red-400 p-3.5 rounded-xl text-xs flex items-center gap-2.5">
                            <span className="text-sm">⚠️</span> <span className="font-medium">{error}</span>
                        </div>
                    )}

                    {/* STEP 1: ENTER EMAIL */}
                    {step === 1 && (
                        <div className="space-y-5">
                            <div>
                                <h1 className="text-2xl font-black text-white tracking-tight mb-1">Forgot Password?</h1>
                                <p className="text-slate-400 text-xs font-medium">Enter your registered email to receive a 6-digit verification code.</p>
                            </div>

                            <form onSubmit={handleStep1Submit} className="space-y-4">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 ml-1">
                                        EMAIL ADDRESS
                                    </label>
                                    <div className="relative">
                                        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none">
                                            <Mail className="w-4 h-4" />
                                        </div>
                                        <input 
                                            type="email" placeholder="Enter your email" value={email} 
                                            onChange={(e) => setEmail(e.target.value)} required 
                                            className="w-full py-3.5 pl-10 pr-4 rounded-xl bg-[#040812] border border-slate-800 text-white placeholder-slate-600 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all text-sm font-medium" 
                                        />
                                    </div>
                                </div>
                                
                                <button 
                                    type="submit" disabled={loading}
                                    className="w-full mt-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black py-3.5 rounded-xl transition-all shadow-lg shadow-emerald-500/20 active:scale-[0.99] disabled:opacity-50 cursor-pointer text-sm tracking-wide"
                                >
                                    {loading ? 'Sending Code...' : 'Send Verification Code →'}
                                </button>
                            </form>

                            <div className="mt-5 pt-4 border-t border-slate-800/80 text-center">
                                <Link to="/login" className="text-xs font-extrabold text-emerald-400 hover:underline">
                                    Remembered your password? Sign In
                                </Link>
                            </div>
                        </div>
                    )}

                    {/* STEP 2: VERIFY 6-DIGIT OTP */}
                    {step === 2 && (
                        <div className="text-center space-y-5">
                            <div className="mx-auto w-14 h-14 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-full flex items-center justify-center shadow-inner shadow-emerald-500/20">
                                <ShieldCheck className="w-7 h-7 stroke-[2.2]" />
                            </div>

                            <div>
                                <h2 className="text-2xl font-black text-white tracking-tight">Verify Reset Code</h2>
                                <p className="text-slate-400 text-xs font-medium mt-1">
                                    Code sent to <span className="text-emerald-400 font-bold">{email}</span>
                                </p>
                            </div>

                            <form onSubmit={handleStep2Verify} className="space-y-5">
                                <div className="flex items-center justify-center gap-2 my-2">
                                    {otpDigits.map((digit, idx) => (
                                        <input 
                                            key={idx}
                                            ref={el => { otpInputRefs.current[idx] = el; }}
                                            type="text" inputMode="numeric" maxLength={1} value={digit}
                                            onChange={(e) => handleOtpChange(idx, e.target.value)}
                                            onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                                            onPaste={handleOtpPaste}
                                            className={`w-11 h-13 text-center text-xl font-mono font-bold rounded-xl bg-[#040812] border transition-all outline-none text-white ${
                                                digit ? 'border-emerald-500 ring-2 ring-emerald-500/20' : 'border-slate-800 focus:border-emerald-500'
                                            }`}
                                        />
                                    ))}
                                </div>

                                <div className="flex items-center justify-between text-xs font-semibold text-slate-400 px-1">
                                    <span>Expires: <strong className="text-white">{formatTimer(expiryTimer)}</strong></span>
                                    <button
                                        type="button" disabled={!canResend || resendLoading} onClick={handleResendOTP}
                                        className={`flex items-center gap-1 font-bold ${canResend ? 'text-emerald-400 cursor-pointer' : 'text-slate-500 cursor-not-allowed'}`}
                                    >
                                        <RotateCw className={`w-3.5 h-3.5 ${resendLoading ? 'animate-spin' : ''}`} />
                                        {resendLoading ? 'Resending...' : canResend ? 'Resend' : `${resendTimer}s`}
                                    </button>
                                </div>

                                <button 
                                    type="submit" disabled={loading}
                                    className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black py-3.5 rounded-xl transition-all shadow-lg shadow-emerald-500/20 active:scale-[0.99] disabled:opacity-50 cursor-pointer text-sm"
                                >
                                    {loading ? 'Verifying Code...' : 'Verify Code →'}
                                </button>
                            </form>
                        </div>
                    )}

                    {/* STEP 3: SET NEW PASSWORD */}
                    {step === 3 && (
                        <div className="space-y-5">
                            <div className="text-center">
                                <div className="mx-auto w-14 h-14 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-full flex items-center justify-center mb-2 shadow-inner shadow-emerald-500/20">
                                    <KeyRound className="w-7 h-7 stroke-[2.2]" />
                                </div>
                                <h2 className="text-2xl font-black text-white tracking-tight">Set New Password</h2>
                                <p className="text-slate-400 text-xs font-medium mt-1">Create a strong password for your account.</p>
                            </div>

                            <form onSubmit={handleStep3Reset} className="space-y-4">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 ml-1">NEW PASSWORD</label>
                                    <div className="relative">
                                        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none">
                                            <Lock className="w-4 h-4" />
                                        </div>
                                        <input 
                                            type={showPassword ? "text" : "password"} placeholder="••••••••••••" 
                                            value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required 
                                            className="w-full py-3.5 pl-10 pr-11 rounded-xl bg-[#040812] border border-slate-800 text-white placeholder-slate-600 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all text-sm font-medium" 
                                        />
                                        <button
                                            type="button" onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-200"
                                        >
                                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                    <div className="grid grid-cols-3 gap-1.5 mt-1.5">
                                        <div className={`h-1 rounded-full ${strength.score >= 1 ? strength.barColor : 'bg-slate-800'}`} />
                                        <div className={`h-1 rounded-full ${strength.score >= 2 ? strength.barColor : 'bg-slate-800'}`} />
                                        <div className={`h-1 rounded-full ${strength.score >= 3 ? strength.barColor : 'bg-slate-800'}`} />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 ml-1">CONFIRM NEW PASSWORD</label>
                                    <div className="relative">
                                        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none">
                                            <Lock className="w-4 h-4" />
                                        </div>
                                        <input 
                                            type={showConfirmPassword ? "text" : "password"} placeholder="••••••••••••" 
                                            value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required 
                                            className="w-full py-3.5 pl-10 pr-11 rounded-xl bg-[#040812] border border-slate-800 text-white placeholder-slate-600 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all text-sm font-medium" 
                                        />
                                        <button
                                            type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-200"
                                        >
                                            {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                </div>

                                <button 
                                    type="submit" disabled={loading}
                                    className="w-full mt-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black py-3.5 rounded-xl transition-all shadow-lg shadow-emerald-500/20 active:scale-[0.99] disabled:opacity-50 cursor-pointer text-sm tracking-wide"
                                >
                                    {loading ? 'Updating Password...' : 'Update Password & Login'}
                                </button>
                            </form>
                        </div>
                    )}

                    {/* STEP 4: PASSWORD CHANGED SUCCESS */}
                    {step === 4 && (
                        <div className="text-center space-y-5 py-2">
                            <div className="mx-auto w-16 h-16 bg-emerald-500/20 border border-emerald-500/50 text-emerald-400 rounded-full flex items-center justify-center shadow-xl shadow-emerald-500/20">
                                <Check className="w-8 h-8 stroke-[3]" />
                            </div>

                            <div>
                                <h2 className="text-2xl font-black text-white tracking-tight">Password Reset Complete!</h2>
                                <p className="text-slate-300 text-xs font-medium mt-1">
                                    Your password for <strong className="text-emerald-400">{email}</strong> has been updated.
                                </p>
                            </div>

                            <button
                                onClick={() => navigate('/login')}
                                className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black py-3.5 rounded-xl transition-all shadow-xl shadow-emerald-500/20 cursor-pointer text-sm block"
                            >
                                Sign In with New Password →
                            </button>
                        </div>
                    )}

                </div>
            </div>

            {/* ========================================================= */}
            {/* 4. FOOTER                                                 */}
            {/* ========================================================= */}
            <div className="w-full mt-10 z-20">
                <Footer />
            </div>

        </div>
    );
};

export default ForgotPassword;