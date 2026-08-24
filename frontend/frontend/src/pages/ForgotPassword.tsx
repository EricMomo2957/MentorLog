import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
    Mail, 
    Lock, 
    ShieldCheck, 
    Eye, 
    EyeOff, 
    Check, 
    RotateCw, 
    ArrowLeft, 
    KeyRound 
} from 'lucide-react';
import mentorLogLogo from '../assets/mentorlogOption.png';
import ojtPicture from '../assets/ojt-picture.jpg';
import api from '../services/api';

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
        <div className="h-screen w-full flex bg-[#020617] text-slate-200 font-sans overflow-hidden">
            {/* --- LEFT SIDE: VISUAL BRANDING --- */}
            <div className="hidden lg:flex lg:w-1/2 h-full relative overflow-hidden flex-col justify-center p-12 lg:p-16 border-r border-slate-800/50">
                {/* Background Image */}
                <img 
                    src={ojtPicture} 
                    alt="OJT Background" 
                    className="absolute inset-0 w-full h-full object-cover object-center"
                />

                {/* Dark Overlays & Gradients for Contrast */}
                <div className="absolute inset-0 bg-linear-to-t from-[#020617] via-[#020617]/85 to-[#020617]/50" />
                <div className="absolute inset-0 bg-blue-950/30 mix-blend-overlay" />

                {/* Glow Effects */}
                <div className="absolute top-0 left-0 w-96 h-96 bg-blue-600/20 blur-[120px] rounded-full -ml-48 -mt-48 pointer-events-none" />
                <div className="absolute bottom-0 right-0 w-96 h-96 bg-emerald-600/20 blur-[120px] rounded-full -mr-48 -mb-48 pointer-events-none" />

                {/* Content over background */}
                <div className="relative z-10 max-w-lg">
                    <img src={mentorLogLogo} alt="Logo" className="w-16 h-16 mb-8 drop-shadow-2xl" />
                    <h1 className="text-5xl lg:text-6xl font-black tracking-tighter text-white mb-6 leading-tight">
                        Secure your <br />
                        <span className="bg-linear-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent italic">Account Access.</span>
                    </h1>
                    <p className="text-lg text-slate-300 font-medium leading-relaxed">
                        Reset your password and regain seamless access to your MentorLog internship dashboard.
                    </p>
                </div>
            </div>

            {/* --- RIGHT SIDE: MULTI-STEP FORGOT PASSWORD FORM --- */}
            <div className="w-full lg:w-1/2 h-full flex items-center justify-center p-6 sm:p-12 overflow-y-auto [scrollbar-width:thin] [scrollbar-color:#1e293b_transparent]">
                <div className="w-full max-w-md space-y-6">

                    {/* --- STEPPER PROGRESS HEADER --- */}
                    <div className="flex items-center justify-between max-w-md mx-auto mb-6 px-1">
                        {/* Step 1 Badge */}
                        <div className="flex items-center gap-2">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                                step > 1 
                                    ? 'bg-blue-500 text-slate-950 font-black shadow-lg shadow-blue-500/30' 
                                    : 'bg-blue-500/20 text-blue-400 border border-blue-500/50 ring-4 ring-blue-500/10'
                            }`}>
                                {step > 1 ? <Check className="w-4 h-4 stroke-[3]" /> : '1'}
                            </div>
                            <span className={`text-xs font-bold ${step >= 1 ? 'text-blue-400' : 'text-slate-500'}`}>
                                Email
                            </span>
                        </div>

                        {/* Connector 1 -> 2 */}
                        <div className={`flex-1 h-0.5 mx-3 transition-colors ${step > 1 ? 'bg-blue-500' : 'bg-slate-800'}`} />

                        {/* Step 2 Badge */}
                        <div className="flex items-center gap-2">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                                step > 2 
                                    ? 'bg-blue-500 text-slate-950 font-black shadow-lg shadow-blue-500/30' 
                                    : step === 2 
                                    ? 'bg-blue-500/20 text-blue-400 border border-blue-500/50 ring-4 ring-blue-500/10' 
                                    : 'bg-slate-900 text-slate-500 border border-slate-800'
                            }`}>
                                {step > 2 ? <Check className="w-4 h-4 stroke-[3]" /> : '2'}
                            </div>
                            <span className={`text-xs font-bold ${step >= 2 ? 'text-blue-400' : 'text-slate-500'}`}>
                                Verify Code
                            </span>
                        </div>

                        {/* Connector 2 -> 3 */}
                        <div className={`flex-1 h-0.5 mx-3 transition-colors ${step >= 3 ? 'bg-blue-500' : 'bg-slate-800'}`} />

                        {/* Step 3 Badge */}
                        <div className="flex items-center gap-2">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                                step >= 3 
                                    ? 'bg-blue-500 text-slate-950 font-black shadow-lg shadow-blue-500/30' 
                                    : 'bg-slate-900 text-slate-500 border border-slate-800'
                            }`}>
                                {step === 4 ? <Check className="w-4 h-4 stroke-[3]" /> : '3'}
                            </div>
                            <span className={`text-xs font-bold ${step >= 3 ? 'text-blue-400' : 'text-slate-500'}`}>
                                New Password
                            </span>
                        </div>
                    </div>

                    {message && (
                        <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-4 rounded-xl text-sm flex items-center gap-3 animate-in fade-in duration-300">
                            <span>✅</span> {message}
                        </div>
                    )}
                    {error && (
                        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-sm flex items-center gap-3 animate-in fade-in duration-300">
                            <span>⚠️</span> {error}
                        </div>
                    )}

                    {/* ========================================================= */}
                    {/* --- STEP 1: ENTER EMAIL --- */}
                    {/* ========================================================= */}
                    {step === 1 && (
                        <div className="space-y-6">
                            <div className="text-center lg:text-left">
                                <h2 className="text-3xl font-black text-white tracking-tight mb-2">Trouble logging in?</h2>
                                <p className="text-slate-400 font-medium text-sm">Enter your registered email address and we'll send a 6-digit verification code to reset your password.</p>
                            </div>

                            <form onSubmit={handleStep1Submit} className="space-y-4">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1 flex items-center gap-1.5">
                                        <Mail className="w-3.5 h-3.5 text-blue-400" /> Email Address *
                                    </label>
                                    <input 
                                        type="email" 
                                        placeholder="name@university.edu" 
                                        value={email} 
                                        onChange={(e) => setEmail(e.target.value)} 
                                        required 
                                        className="w-full p-4 rounded-2xl bg-slate-900 border border-slate-800 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all text-sm font-medium text-white placeholder:text-slate-600" 
                                    />
                                </div>
                                
                                <button 
                                    type="submit" disabled={loading}
                                    className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-blue-600/20 active:scale-[0.98] disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2 text-sm"
                                >
                                    {loading ? (
                                        <span className="flex items-center gap-2">
                                            <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                            Sending Code...
                                        </span>
                                    ) : (
                                        <span>Send Verification Code →</span>
                                    )}
                                </button>
                            </form>

                            <div className="relative py-2">
                                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-800"></div></div>
                                <div className="relative flex justify-center text-[10px] uppercase"><span className="bg-[#020617] px-4 text-slate-600 font-bold tracking-widest">or</span></div>
                            </div>

                            <Link to="/login" className="block w-full text-center py-3.5 text-sm font-bold text-blue-400 hover:text-blue-300 transition-colors">
                                Back to Login
                            </Link>
                        </div>
                    )}

                    {/* ========================================================= */}
                    {/* --- STEP 2: VERIFY 6-DIGIT OTP --- */}
                    {/* ========================================================= */}
                    {step === 2 && (
                        <div className="bg-slate-900/80 border border-slate-800 p-6 sm:p-8 rounded-3xl shadow-2xl backdrop-blur-md text-center space-y-6 animate-in fade-in duration-300">
                            
                            {/* Shield Icon Badge */}
                            <div className="mx-auto w-16 h-16 bg-blue-500/10 border border-blue-500/30 text-blue-400 rounded-full flex items-center justify-center shadow-inner shadow-blue-500/20">
                                <ShieldCheck className="w-9 h-9 stroke-[2.2]" />
                            </div>

                            {/* Title & Email Subtitle */}
                            <div>
                                <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">Verify Reset Code</h2>
                                <p className="text-slate-400 text-xs sm:text-sm font-medium mt-2">
                                    We sent a 6-digit code to <span className="text-blue-400 font-bold">{email}</span>
                                </p>
                            </div>

                            {/* 6 Digit OTP Inputs */}
                            <form onSubmit={handleStep2Verify} className="space-y-6">
                                <div className="flex items-center justify-center gap-2 sm:gap-3 my-4">
                                    {otpDigits.map((digit, idx) => (
                                        <input 
                                            key={idx}
                                            ref={el => { otpInputRefs.current[idx] = el; }}
                                            type="text"
                                            inputMode="numeric"
                                            maxLength={1}
                                            value={digit}
                                            onChange={(e) => handleOtpChange(idx, e.target.value)}
                                            onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                                            onPaste={handleOtpPaste}
                                            className={`w-11 h-14 sm:w-13 sm:h-16 text-center text-xl sm:text-2xl font-mono font-bold rounded-2xl bg-slate-950 border transition-all outline-none text-white ${
                                                digit 
                                                    ? 'border-blue-500 ring-2 ring-blue-500/30 bg-blue-950/20' 
                                                    : 'border-slate-800 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20'
                                            }`}
                                        />
                                    ))}
                                </div>

                                {/* Timers & Resend Option */}
                                <div className="flex items-center justify-between text-xs font-semibold text-slate-400 px-1 pt-1">
                                    <span>Code expires in <strong className="text-white">{formatTimer(expiryTimer)}</strong></span>

                                    <button
                                        type="button"
                                        disabled={!canResend || resendLoading}
                                        onClick={handleResendOTP}
                                        className={`flex items-center gap-1.5 font-bold transition-colors ${
                                            canResend 
                                                ? 'text-blue-400 hover:text-blue-300 cursor-pointer' 
                                                : 'text-slate-500 cursor-not-allowed'
                                        }`}
                                    >
                                        <RotateCw className={`w-3.5 h-3.5 ${resendLoading ? 'animate-spin' : ''}`} />
                                        {resendLoading ? 'Resending...' : canResend ? 'Resend Code' : `Resend in ${resendTimer}s`}
                                    </button>
                                </div>

                                {/* Verify Button */}
                                <button 
                                    type="submit" 
                                    disabled={loading}
                                    className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-blue-600/20 active:scale-[0.98] disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2 text-sm sm:text-base"
                                >
                                    {loading ? (
                                        <span className="flex items-center gap-2">
                                            <span className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                            Verifying Code...
                                        </span>
                                    ) : (
                                        <span>Verify Code →</span>
                                    )}
                                </button>

                                {/* Back Link */}
                                <button
                                    type="button"
                                    onClick={() => setStep(1)}
                                    className="text-slate-400 text-xs font-semibold hover:text-white transition-colors flex items-center justify-center gap-1.5 mx-auto pt-2 cursor-pointer"
                                >
                                    <ArrowLeft className="w-3.5 h-3.5" /> Change email address
                                </button>
                            </form>
                        </div>
                    )}

                    {/* ========================================================= */}
                    {/* --- STEP 3: SET NEW PASSWORD --- */}
                    {/* ========================================================= */}
                    {step === 3 && (
                        <div className="bg-slate-900/80 border border-slate-800 p-6 sm:p-8 rounded-3xl shadow-2xl backdrop-blur-md space-y-6 animate-in fade-in duration-300">
                            <div className="text-center">
                                <div className="mx-auto w-16 h-16 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-full flex items-center justify-center mb-3 shadow-inner shadow-emerald-500/20">
                                    <KeyRound className="w-8 h-8 stroke-[2.2]" />
                                </div>
                                <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">Set New Password</h2>
                                <p className="text-slate-400 text-xs sm:text-sm font-medium mt-1">
                                    Create a strong password for <span className="text-emerald-400 font-bold">{email}</span>
                                </p>
                            </div>

                            <form onSubmit={handleStep3Reset} className="space-y-4">
                                {/* NEW PASSWORD FIELD */}
                                <div className="space-y-1.5">
                                    <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 ml-1 flex items-center gap-1.5">
                                        <Lock className="w-3.5 h-3.5 text-emerald-400" /> New Password *
                                    </label>
                                    <div className="relative">
                                        <input 
                                            type={showPassword ? "text" : "password"} 
                                            placeholder="••••••••" 
                                            value={newPassword} 
                                            onChange={(e) => setNewPassword(e.target.value)} 
                                            required 
                                            className={`w-full p-3.5 pr-12 rounded-xl bg-slate-950 border transition-all outline-none text-xs font-medium text-white placeholder:text-slate-600 ${
                                                newPassword 
                                                    ? `${strength.borderColor} focus:ring-2 focus:ring-emerald-500/20` 
                                                    : 'border-slate-800 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20'
                                            }`} 
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
                                            title={showPassword ? "Hide password" : "Show password"}
                                        >
                                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>

                                    {/* Password Strength Indicator Bars */}
                                    <div className="grid grid-cols-3 gap-2 mt-2">
                                        <div className={`h-1.5 rounded-full transition-all duration-300 ${strength.score >= 1 ? strength.barColor : 'bg-slate-800'}`} />
                                        <div className={`h-1.5 rounded-full transition-all duration-300 ${strength.score >= 2 ? strength.barColor : 'bg-slate-800'}`} />
                                        <div className={`h-1.5 rounded-full transition-all duration-300 ${strength.score >= 3 ? strength.barColor : 'bg-slate-800'}`} />
                                    </div>

                                    {/* Strength Label */}
                                    {newPassword ? (
                                        <p className={`text-[11px] font-bold mt-1.5 transition-colors ${strength.textColor}`}>
                                            {strength.label}
                                        </p>
                                    ) : (
                                        <p className="text-[10px] text-slate-500 mt-1.5 font-medium">
                                            Minimum 6 characters.
                                        </p>
                                    )}
                                </div>

                                {/* CONFIRM PASSWORD FIELD */}
                                <div className="space-y-1.5">
                                    <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 ml-1 flex items-center gap-1.5">
                                        <Lock className="w-3.5 h-3.5 text-emerald-400" /> Confirm New Password *
                                    </label>
                                    <div className="relative">
                                        <input 
                                            type={showConfirmPassword ? "text" : "password"} 
                                            placeholder="••••••••" 
                                            value={confirmPassword} 
                                            onChange={(e) => setConfirmPassword(e.target.value)} 
                                            required 
                                            className={`w-full p-3.5 pr-12 rounded-xl bg-slate-950 border transition-all outline-none text-xs font-medium text-white placeholder:text-slate-600 ${
                                                confirmPassword && confirmPassword !== newPassword
                                                    ? 'border-red-500/80 focus:border-red-500 focus:ring-2 focus:ring-red-500/20'
                                                    : confirmPassword && confirmPassword === newPassword
                                                    ? 'border-emerald-500/80 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20'
                                                    : 'border-slate-800 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20'
                                            }`} 
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
                                            title={showConfirmPassword ? "Hide password" : "Show password"}
                                        >
                                            {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>

                                    {/* Confirm Indicator */}
                                    {confirmPassword ? (
                                        confirmPassword !== newPassword ? (
                                            <p className="text-[11px] font-bold text-red-400 mt-1.5">
                                                Passwords do not match.
                                            </p>
                                        ) : (
                                            <p className="text-[11px] font-bold text-emerald-400 mt-1.5">
                                                Passwords match.
                                            </p>
                                        )
                                    ) : (
                                        <p className="text-[10px] text-slate-500 mt-1.5 font-medium">
                                            Re-enter your new password.
                                        </p>
                                    )}
                                </div>

                                <button 
                                    type="submit" 
                                    disabled={loading}
                                    className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black py-4 rounded-2xl transition-all shadow-lg shadow-emerald-500/20 active:scale-[0.98] disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2 text-sm sm:text-base mt-2"
                                >
                                    {loading ? (
                                        <span className="flex items-center gap-2">
                                            <span className="w-5 h-5 border-2 border-slate-950/30 border-t-slate-950 rounded-full animate-spin" />
                                            Updating Password...
                                        </span>
                                    ) : (
                                        <span className="flex items-center gap-2">
                                            <ShieldCheck className="w-5 h-5" />
                                            <span>Update Password & Login</span>
                                        </span>
                                    )}
                                </button>
                            </form>
                        </div>
                    )}

                    {/* ========================================================= */}
                    {/* --- STEP 4: PASSWORD CHANGED SUCCESS --- */}
                    {/* ========================================================= */}
                    {step === 4 && (
                        <div className="bg-slate-900/80 border border-slate-800 p-8 sm:p-10 rounded-3xl shadow-2xl backdrop-blur-md text-center space-y-6 animate-in zoom-in-95 duration-300">
                            <div className="mx-auto w-20 h-20 bg-emerald-500/20 border border-emerald-500/50 text-emerald-400 rounded-full flex items-center justify-center shadow-xl shadow-emerald-500/20">
                                <Check className="w-10 h-10 stroke-[3]" />
                            </div>

                            <div>
                                <h2 className="text-3xl font-black text-white tracking-tight">Password Reset Complete!</h2>
                                <p className="text-slate-300 text-sm font-medium mt-2 max-w-sm mx-auto leading-relaxed">
                                    Your password for <strong className="text-emerald-400">{email}</strong> has been updated successfully.
                                </p>
                            </div>

                            <button
                                onClick={() => navigate('/login')}
                                className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black py-4 rounded-2xl transition-all shadow-xl shadow-emerald-500/20 cursor-pointer text-sm sm:text-base block"
                            >
                                Sign In with New Password →
                            </button>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;