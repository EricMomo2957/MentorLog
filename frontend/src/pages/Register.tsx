import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';
import { 
    UserCircle, 
    Mail, 
    Lock, 
    Key, 
    Phone, 
    Calendar, 
    MapPin, 
    School, 
    Hash, 
    BookOpen, 
    ShieldCheck, 
    Briefcase, 
    Eye, 
    EyeOff, 
    Check, 
    RotateCw, 
    Pencil, 
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

const IT_POSITIONS = [
    'Software Engineer / Developer',
    'Frontend Web Developer',
    'Backend Web Developer',
    'Full Stack Web Developer',
    'Mobile App Developer (iOS / Android)',
    'UI/UX Designer & Researcher',
    'Quality Assurance (QA) Tester / Software QA',
    'Data Analyst / Business Intelligence',
    'Data Scientist / AI & ML Engineer',
    'Database Administrator (DBA)',
    'DevOps & Cloud Infrastructure Engineer',
    'Cybersecurity / Information Security Specialist',
    'Network & Systems Administrator',
    'IT Technical Support & Helpdesk',
    'IT Technical Writer & Systems Analyst',
    'IT Project Manager / Scrum Master',
    'Administrator / OJT Supervisor',
    'Other IT Specialization'
];

const Register = () => {
    // Multi-Step Registration State (1: Account Info, 2: Verify Email, 3: Complete)
    const [step, setStep] = useState<1 | 2 | 3>(1);

    const [formData, setFormData] = useState({
        member_title: 'Mr.',
        id_number: '',
        first_name: '',
        middle_name: '',
        last_name: '',
        email: '',
        phone: '',
        date_of_birth: '',
        age: '',
        gender: 'Male',
        civil_status: 'Single',
        address: '',
        school_name: '',
        course: '',
        year_level: '',
        it_position: 'Software Engineer / Developer',
        password: '',
        role: 'student',
        adminCode: '' 
    });
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    // OTP State (6 Digits)
    const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '', '', '']);
    const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);
    const [expiryTimer, setExpiryTimer] = useState<number>(600); // 10 mins (600s)
    const [resendTimer, setResendTimer] = useState<number>(30); // 30s
    const [canResend, setCanResend] = useState<boolean>(false);
    const [resendLoading, setResendLoading] = useState<boolean>(false);
    const [verifyLoading, setVerifyLoading] = useState<boolean>(false);

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

    const strength = getPasswordStrength(formData.password);

    const calculateAge = (dobString: string): string => {
        if (!dobString) return '';
        const birthDate = new Date(dobString);
        if (isNaN(birthDate.getTime())) return '';
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age >= 0 ? String(age) : '';
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        let updatedValue = value;
        
        if (name === 'adminCode') {
            updatedValue = updatedValue.toUpperCase();
        }

        setFormData(prev => {
            const nextData = { ...prev, [name]: updatedValue };
            if (name === 'date_of_birth') {
                nextData.age = calculateAge(updatedValue);
            }
            return nextData;
        });
    };

    // Step 1: Submit Account Info & Request OTP
    const handleStep1Submit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccessMsg('');

        if (formData.password !== confirmPassword) {
            setError('Passwords do not match. Please verify your password.');
            return;
        }

        if (formData.role === 'admin' && !formData.adminCode) {
            setError('Admin Reference Code is required for Administrator accounts.');
            return;
        }

        setLoading(true);

        const fullName = `${formData.first_name} ${formData.middle_name ? formData.middle_name + ' ' : ''}${formData.last_name}`.trim();

        const payload = {
            ...formData,
            full_name: fullName,
            student_id: formData.id_number || undefined
        };

        try {
            const response = await api.post('/auth/send-otp', payload);
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
            setError(err.response?.data?.message || 'Failed to send verification code. Please check your email and try again.');
        } finally {
            setLoading(false);
        }
    };

    // OTP Input Handlers
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

    // Step 2: Verify 6-digit OTP
    const handleVerifyOTP = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccessMsg('');

        const otpCode = otpDigits.join('');
        if (otpCode.length < 6) {
            setError('Please enter the complete 6-digit verification code.');
            return;
        }

        setVerifyLoading(true);

        try {
            const response = await api.post('/auth/verify-otp', {
                email: formData.email,
                otpCode
            });

            if (response.data?.success || response.status === 201) {
                setStep(3);
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Invalid or expired verification code. Please try again.');
        } finally {
            setVerifyLoading(false);
        }
    };

    // Resend OTP
    const handleResendOTP = async () => {
        if (!canResend || resendLoading) return;
        setError('');
        setSuccessMsg('');
        setResendLoading(true);

        try {
            const response = await api.post('/auth/resend-otp', { email: formData.email });
            if (response.data?.success) {
                setSuccessMsg('A new 6-digit verification code has been sent to your email.');
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

    return (
        <div className="min-h-screen w-full relative bg-[#040812] text-slate-100 font-sans overflow-y-auto flex flex-col justify-between items-center p-4 sm:p-6 select-none [scrollbar-width:thin] [scrollbar-color:#1e293b_transparent]">
            
            {/* ========================================================= */}
            {/* 1. DYNAMIC FLOATING ANIMATED BACKGROUND ICONS & GLOWS     */}
            {/* ========================================================= */}
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/10 blur-[140px] rounded-full pointer-events-none animate-pulse-glow" />
            <div className="absolute bottom-10 left-10 w-96 h-96 bg-teal-600/10 blur-[130px] rounded-full pointer-events-none" />
            <div className="absolute top-10 right-10 w-96 h-96 bg-blue-600/10 blur-[130px] rounded-full pointer-events-none" />

            {/* Floating OJT / Education Icons */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-16 left-[8%] text-emerald-400/20 animate-float-slow" style={{ animationDelay: '0s' }}>
                    <Pencil className="w-10 h-10 transform -rotate-12" />
                </div>
                <div className="absolute top-24 right-[10%] text-emerald-400/25 animate-float-reverse" style={{ animationDelay: '1s' }}>
                    <BookOpen className="w-12 h-12 transform rotate-12" />
                </div>
                <div className="absolute top-[42%] left-[6%] text-teal-400/20 animate-float-reverse" style={{ animationDelay: '2s' }}>
                    <FileText className="w-14 h-14 transform -rotate-45" />
                </div>
                <div className="absolute top-[48%] right-[6%] text-emerald-500/20 animate-float-slow" style={{ animationDelay: '1.5s' }}>
                    <GraduationCap className="w-14 h-14 transform rotate-12" />
                </div>
                <div className="absolute bottom-20 left-[12%] text-emerald-400/20 animate-float-slow" style={{ animationDelay: '3s' }}>
                    <ClipboardList className="w-12 h-12 transform rotate-6" />
                </div>
                <div className="absolute bottom-24 right-[12%] text-teal-400/25 animate-float-reverse" style={{ animationDelay: '2.5s' }}>
                    <Award className="w-11 h-11 transform -rotate-12" />
                </div>
                <div className="absolute top-12 left-[30%] text-emerald-400/15 animate-float-slow" style={{ animationDelay: '4s' }}>
                    <PenTool className="w-8 h-8 transform rotate-45" />
                </div>
                <div className="absolute bottom-12 right-[30%] text-emerald-300/15 animate-float-reverse" style={{ animationDelay: '3.5s' }}>
                    <BookMarked className="w-9 h-9 transform -rotate-12" />
                </div>
                <div className="absolute top-1/3 right-[25%] text-emerald-300/20 animate-float-slow" style={{ animationDelay: '0.8s' }}>
                    <Sparkles className="w-7 h-7" />
                </div>
            </div>

            {/* ========================================================= */}
            {/* 2. TOP BAR & BRAND HEADER                                 */}
            {/* ========================================================= */}
            <div className="w-full max-w-4xl flex justify-between items-center z-20 pt-2 pb-4">
                <button 
                    onClick={() => navigate('/')}
                    className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-xs font-bold uppercase tracking-wider group cursor-pointer bg-slate-900/60 backdrop-blur-md px-3.5 py-2 rounded-xl border border-slate-800/80 hover:border-slate-700"
                >
                    <FiArrowLeft className="text-sm group-hover:-translate-x-1 transition-transform" /> 
                    <span>Back to Home</span>
                </button>
            </div>

            {/* ========================================================= */}
            {/* 3. CENTERED REGISTRATION MODAL                            */}
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

                {/* Main Centered Registration Card Container */}
                <div className="w-full max-w-xl bg-[#090e1a]/90 backdrop-blur-2xl border border-slate-800/90 rounded-3xl p-6 sm:p-8 shadow-[0_20px_60px_rgba(0,0,0,0.8)] relative my-auto">
                    
                    {/* Inner Accent Line */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-[3px] bg-linear-to-r from-transparent via-emerald-500/80 to-transparent rounded-full" />

                    {/* Stepper Progress Bar */}
                    <div className="flex items-center justify-between max-w-md mx-auto mb-6 px-2">
                        <div className="flex items-center gap-2">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                                step > 1 
                                    ? 'bg-emerald-500 text-slate-950 font-black shadow-lg shadow-emerald-500/30' 
                                    : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50 ring-4 ring-emerald-500/10'
                            }`}>
                                {step > 1 ? <Check className="w-4 h-4 stroke-[3]" /> : '1'}
                            </div>
                            <span className={`text-xs font-bold ${step >= 1 ? 'text-emerald-400' : 'text-slate-500'}`}>
                                Account Info
                            </span>
                        </div>

                        <div className={`flex-1 h-0.5 mx-3 transition-colors ${step > 1 ? 'bg-emerald-500' : 'bg-slate-800'}`} />

                        <div className="flex items-center gap-2">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                                step > 2 
                                    ? 'bg-emerald-500 text-slate-950 font-black shadow-lg shadow-emerald-500/30' 
                                    : step === 2 
                                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50 ring-4 ring-emerald-500/10' 
                                    : 'bg-slate-900 text-slate-500 border border-slate-800'
                            }`}>
                                {step > 2 ? <Check className="w-4 h-4 stroke-[3]" /> : '2'}
                            </div>
                            <span className={`text-xs font-bold ${step >= 2 ? 'text-emerald-400' : 'text-slate-500'}`}>
                                Verify Email
                            </span>
                        </div>

                        <div className={`flex-1 h-0.5 mx-3 transition-colors ${step === 3 ? 'bg-emerald-500' : 'bg-slate-800'}`} />

                        <div className="flex items-center gap-2">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                                step === 3 
                                    ? 'bg-emerald-500 text-slate-950 font-black shadow-lg shadow-emerald-500/30' 
                                    : 'bg-slate-900 text-slate-500 border border-slate-800'
                            }`}>
                                {step === 3 ? <Check className="w-4 h-4 stroke-[3]" /> : '3'}
                            </div>
                            <span className={`text-xs font-bold ${step === 3 ? 'text-emerald-400' : 'text-slate-500'}`}>
                                Complete
                            </span>
                        </div>
                    </div>

                    {error && (
                        <div className="mb-5 bg-red-500/10 border border-red-500/30 text-red-400 p-3.5 rounded-xl text-xs flex items-center gap-2.5">
                            <span className="text-sm">⚠️</span> 
                            <span className="font-medium">{error}</span>
                        </div>
                    )}

                    {successMsg && (
                        <div className="mb-5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 p-3.5 rounded-xl text-xs flex items-center gap-2.5">
                            <span className="text-sm">✅</span> 
                            <span className="font-medium">{successMsg}</span>
                        </div>
                    )}

                    {/* ========================================================= */}
                    {/* STEP 1: ACCOUNT INFORMATION FORM                          */}
                    {/* ========================================================= */}
                    {step === 1 && (
                        <>
                            <div className="flex items-center justify-between mb-5">
                                <div>
                                    <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">Create Account</h1>
                                    <p className="text-slate-400 text-xs font-medium mt-0.5">Personal Information & Profile Verification</p>
                                </div>
                                <span className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-bold rounded-full">
                                    Step 1 of 3
                                </span>
                            </div>

                            <form onSubmit={handleStep1Submit} className="space-y-4">
                                
                                {/* SECTION 1: PERSONAL IDENTIFICATION */}
                                <div className="bg-[#040812] border border-slate-800/90 p-4 sm:p-5 rounded-2xl space-y-3.5 shadow-inner">
                                    <div className="flex items-center gap-2 pb-2 border-b border-slate-800/80 text-xs font-bold uppercase tracking-widest text-emerald-400">
                                        <UserCircle className="w-4 h-4" /> Personal Identification
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                        <div>
                                            <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1 block">Title *</label>
                                            <select 
                                                name="member_title" value={formData.member_title} onChange={handleChange} required
                                                className="w-full p-3 rounded-xl bg-[#090e1a] border border-slate-800 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none text-xs font-medium text-white cursor-pointer"
                                            >
                                                <option value="Mr.">Mr.</option>
                                                <option value="Ms.">Ms.</option>
                                                <option value="Mrs.">Mrs.</option>
                                                <option value="Dr.">Dr.</option>
                                                <option value="Engr.">Engr.</option>
                                            </select>
                                        </div>

                                        <div className="sm:col-span-2">
                                            <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1 flex items-center gap-1.5">
                                                <Hash className="w-3 h-3 text-emerald-400" /> I.D Number *
                                            </label>
                                            <input 
                                                type="text" name="id_number" placeholder="000-000-000 or Student ID" 
                                                value={formData.id_number} onChange={handleChange} required
                                                className="w-full p-3 rounded-xl bg-[#090e1a] border border-slate-800 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none text-xs font-mono font-medium text-white placeholder:text-slate-600" 
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                        <div>
                                            <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1 block">First Name *</label>
                                            <input 
                                                type="text" name="first_name" placeholder="John" 
                                                value={formData.first_name} onChange={handleChange} required 
                                                className="w-full p-3 rounded-xl bg-[#090e1a] border border-slate-800 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none text-xs font-medium text-white" 
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1 block">Middle Name</label>
                                            <input 
                                                type="text" name="middle_name" placeholder="Smith" 
                                                value={formData.middle_name} onChange={handleChange} 
                                                className="w-full p-3 rounded-xl bg-[#090e1a] border border-slate-800 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none text-xs font-medium text-white" 
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1 block">Last Name *</label>
                                            <input 
                                                type="text" name="last_name" placeholder="Doe" 
                                                value={formData.last_name} onChange={handleChange} required 
                                                className="w-full p-3 rounded-xl bg-[#090e1a] border border-slate-800 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none text-xs font-medium text-white" 
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* SECTION 2: CONTACT & DEMOGRAPHICS */}
                                <div className="bg-[#040812] border border-slate-800/90 p-4 sm:p-5 rounded-2xl space-y-3.5 shadow-inner">
                                    <div className="flex items-center gap-2 pb-2 border-b border-slate-800/80 text-xs font-bold uppercase tracking-widest text-teal-400">
                                        <Mail className="w-4 h-4" /> Contact & Demographics
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        <div>
                                            <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1 flex items-center gap-1.5">
                                                <Mail className="w-3 h-3 text-teal-400" /> Email Address *
                                            </label>
                                            <input 
                                                type="email" name="email" placeholder="johndoe@example.com" 
                                                value={formData.email} onChange={handleChange} required 
                                                className="w-full p-3 rounded-xl bg-[#090e1a] border border-slate-800 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none text-xs font-medium text-white" 
                                            />
                                        </div>

                                        <div>
                                            <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1 flex items-center gap-1.5">
                                                <Phone className="w-3 h-3 text-teal-400" /> Phone Number *
                                            </label>
                                            <input 
                                                type="text" name="phone" placeholder="+639123456789" 
                                                value={formData.phone} onChange={handleChange} required 
                                                className="w-full p-3 rounded-xl bg-[#090e1a] border border-slate-800 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none text-xs font-medium text-white" 
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                        <div>
                                            <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1 flex items-center gap-1.5">
                                                <Calendar className="w-3 h-3 text-teal-400" /> Date of Birth *
                                            </label>
                                            <input 
                                                type="date" name="date_of_birth" 
                                                value={formData.date_of_birth} onChange={handleChange} required 
                                                className="w-full p-3 rounded-xl bg-[#090e1a] border border-slate-800 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none text-xs font-medium text-white" 
                                            />
                                        </div>

                                        <div>
                                            <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1 block">Age</label>
                                            <input 
                                                type="text" name="age" readOnly value={formData.age} placeholder="e.g. 21" 
                                                className="w-full p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs font-bold text-emerald-400 cursor-not-allowed" 
                                            />
                                        </div>

                                        <div>
                                            <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1 block">Gender *</label>
                                            <select 
                                                name="gender" value={formData.gender} onChange={handleChange} required
                                                className="w-full p-3 rounded-xl bg-[#090e1a] border border-slate-800 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none text-xs font-medium text-white cursor-pointer"
                                            >
                                                <option value="Male">Male</option>
                                                <option value="Female">Female</option>
                                                <option value="Other">Other</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                        <div>
                                            <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1 block">Civil Status *</label>
                                            <select 
                                                name="civil_status" value={formData.civil_status} onChange={handleChange} required
                                                className="w-full p-3 rounded-xl bg-[#090e1a] border border-slate-800 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none text-xs font-medium text-white cursor-pointer"
                                            >
                                                <option value="Single">Single</option>
                                                <option value="Married">Married</option>
                                                <option value="Divorced">Divorced</option>
                                            </select>
                                        </div>

                                        <div className="sm:col-span-2">
                                            <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1 flex items-center gap-1.5">
                                                <MapPin className="w-3 h-3 text-teal-400" /> Address *
                                            </label>
                                            <input 
                                                type="text" name="address" placeholder="123 Mambaling Street, Cebu City" 
                                                value={formData.address} onChange={handleChange} required 
                                                className="w-full p-3 rounded-xl bg-[#090e1a] border border-slate-800 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none text-xs font-medium text-white" 
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* SECTION 3: ACADEMIC & SCHOOL DETAILS */}
                                <div className="bg-[#040812] border border-slate-800/90 p-4 sm:p-5 rounded-2xl space-y-3.5 shadow-inner">
                                    <div className="flex items-center gap-2 pb-2 border-b border-slate-800/80 text-xs font-bold uppercase tracking-widest text-emerald-400">
                                        <School className="w-4 h-4" /> Academic Track
                                    </div>

                                    <div>
                                        <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1 flex items-center gap-1.5">
                                            <School className="w-3 h-3 text-emerald-400" /> School / University *
                                        </label>
                                        <input 
                                            type="text" name="school_name" placeholder="University of Cebu" 
                                            value={formData.school_name} onChange={handleChange} required 
                                            className="w-full p-3 rounded-xl bg-[#090e1a] border border-slate-800 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none text-xs font-medium text-white placeholder:text-slate-600" 
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        <div>
                                            <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1 flex items-center gap-1.5">
                                                <BookOpen className="w-3 h-3 text-emerald-400" /> Course / Program
                                            </label>
                                            <input 
                                                type="text" name="course" placeholder="BS Information Technology" 
                                                value={formData.course} onChange={handleChange} 
                                                className="w-full p-3 rounded-xl bg-[#090e1a] border border-slate-800 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none text-xs font-medium text-white" 
                                            />
                                        </div>

                                        <div>
                                            <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1 block">Year Level</label>
                                            <input 
                                                type="text" name="year_level" placeholder="4th Year" 
                                                value={formData.year_level} onChange={handleChange} 
                                                className="w-full p-3 rounded-xl bg-[#090e1a] border border-slate-800 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none text-xs font-medium text-white" 
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* SECTION 4: ACCOUNT CREDENTIALS & IT POSITION */}
                                <div className="bg-[#040812] border border-slate-800/90 p-4 sm:p-5 rounded-2xl space-y-3.5 shadow-inner">
                                    <div className="flex items-center gap-2 pb-2 border-b border-slate-800/80 text-xs font-bold uppercase tracking-widest text-emerald-400">
                                        <Lock className="w-4 h-4" /> Account Credentials & Role
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        <div>
                                            <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1 block">Role *</label>
                                            <select 
                                                name="role" value={formData.role} onChange={handleChange}
                                                className="w-full p-3 rounded-xl bg-[#090e1a] border border-slate-800 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none text-xs font-medium text-white cursor-pointer"
                                            >
                                                <option value="student">Student (OJT Intern)</option>
                                                <option value="admin">Administrator / Supervisor</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1 flex items-center gap-1.5">
                                                <Briefcase className="w-3.5 h-3.5 text-emerald-400" /> IT Track *
                                            </label>
                                            <select 
                                                name="it_position" value={formData.it_position} onChange={handleChange} required
                                                className="w-full p-3 rounded-xl bg-[#090e1a] border border-slate-800 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none text-xs font-medium text-white cursor-pointer"
                                            >
                                                {IT_POSITIONS.map((pos, idx) => (
                                                    <option key={idx} value={pos}>{pos}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    {/* PASSWORDS */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                                        <div>
                                            <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1 flex items-center gap-1.5">
                                                <Lock className="w-3 h-3 text-emerald-400" /> Password *
                                            </label>
                                            <div className="relative">
                                                <input 
                                                    type={showPassword ? "text" : "password"} 
                                                    name="password" placeholder="••••••••" 
                                                    value={formData.password} onChange={handleChange} required 
                                                    className="w-full pl-3.5 pr-10 p-3 rounded-xl bg-[#090e1a] border border-slate-800 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none text-xs font-medium text-white" 
                                                />
                                                <button
                                                    type="button" onClick={() => setShowPassword(!showPassword)}
                                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-200"
                                                >
                                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                                </button>
                                            </div>
                                            <div className="grid grid-cols-3 gap-1.5 mt-2">
                                                <div className={`h-1 rounded-full ${strength.score >= 1 ? strength.barColor : 'bg-slate-800'}`} />
                                                <div className={`h-1 rounded-full ${strength.score >= 2 ? strength.barColor : 'bg-slate-800'}`} />
                                                <div className={`h-1 rounded-full ${strength.score >= 3 ? strength.barColor : 'bg-slate-800'}`} />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1 flex items-center gap-1.5">
                                                <Lock className="w-3 h-3 text-emerald-400" /> Confirm Password *
                                            </label>
                                            <div className="relative">
                                                <input 
                                                    type={showConfirmPassword ? "text" : "password"} 
                                                    name="confirmPassword" placeholder="••••••••" 
                                                    value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required 
                                                    className="w-full pl-3.5 pr-10 p-3 rounded-xl bg-[#090e1a] border border-slate-800 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none text-xs font-medium text-white" 
                                                />
                                                <button
                                                    type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-200"
                                                >
                                                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {formData.role === 'admin' && (
                                        <div className="space-y-1.5 pt-1">
                                            <label className="text-[10px] font-black uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                                                <Key className="w-3.5 h-3.5" /> Admin Reference Code *
                                            </label>
                                            <input 
                                                type="text" name="adminCode" value={formData.adminCode} placeholder="Enter ADM-XXXX-XXXX" 
                                                onChange={handleChange} required={formData.role === 'admin'}
                                                className="w-full p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/40 focus:border-emerald-400 outline-none text-xs font-mono tracking-widest text-emerald-200" 
                                            />
                                        </div>
                                    )}
                                </div>

                                {/* Submit Button */}
                                <button 
                                    type="submit" disabled={loading}
                                    className="w-full mt-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black py-3.5 rounded-xl transition-all shadow-lg shadow-emerald-500/20 active:scale-[0.99] disabled:opacity-50 cursor-pointer text-sm tracking-wide"
                                >
                                    {loading ? 'Sending Verification Code...' : 'Continue to Email Verification →'}
                                </button>
                            </form>
                        </>
                    )}

                    {/* ========================================================= */}
                    {/* STEP 2: VERIFY EMAIL SCREEN                               */}
                    {/* ========================================================= */}
                    {step === 2 && (
                        <div className="text-center space-y-5 py-2">
                            <div className="mx-auto w-16 h-16 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-full flex items-center justify-center shadow-inner shadow-emerald-500/20">
                                <ShieldCheck className="w-8 h-8 stroke-[2.2]" />
                            </div>

                            <div>
                                <h2 className="text-2xl font-black text-white tracking-tight">Verify Your Email</h2>
                                <p className="text-slate-400 text-xs font-medium mt-1">
                                    We sent a 6-digit code to <span className="text-emerald-400 font-bold">{formData.email}</span>
                                </p>
                            </div>

                            <form onSubmit={handleVerifyOTP} className="space-y-5">
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
                                    <span>Code expires: <strong className="text-white">{formatTimer(expiryTimer)}</strong></span>
                                    <button
                                        type="button" disabled={!canResend || resendLoading} onClick={handleResendOTP}
                                        className={`flex items-center gap-1 font-bold ${canResend ? 'text-emerald-400 cursor-pointer' : 'text-slate-500 cursor-not-allowed'}`}
                                    >
                                        <RotateCw className={`w-3.5 h-3.5 ${resendLoading ? 'animate-spin' : ''}`} />
                                        {resendLoading ? 'Resending...' : canResend ? 'Resend' : `${resendTimer}s`}
                                    </button>
                                </div>

                                <button 
                                    type="submit" disabled={verifyLoading}
                                    className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black py-3.5 rounded-xl transition-all shadow-lg shadow-emerald-500/20 active:scale-[0.99] disabled:opacity-50 cursor-pointer text-sm"
                                >
                                    {verifyLoading ? 'Verifying Code...' : 'Verify & Create Account'}
                                </button>
                            </form>
                        </div>
                    )}

                    {/* ========================================================= */}
                    {/* STEP 3: REGISTRATION COMPLETE                             */}
                    {/* ========================================================= */}
                    {step === 3 && (
                        <div className="text-center space-y-5 py-2">
                            <div className="mx-auto w-16 h-16 bg-emerald-500/20 border border-emerald-500/50 text-emerald-400 rounded-full flex items-center justify-center shadow-xl shadow-emerald-500/20">
                                <Check className="w-8 h-8 stroke-[3]" />
                            </div>

                            <div>
                                <h2 className="text-2xl font-black text-white tracking-tight">Account Verified!</h2>
                                <p className="text-slate-300 text-xs font-medium mt-1">
                                    Your email <strong className="text-emerald-400">{formData.email}</strong> has been successfully verified.
                                </p>
                            </div>

                            <button
                                onClick={() => navigate('/login')}
                                className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black py-3.5 rounded-xl transition-all shadow-xl shadow-emerald-500/20 cursor-pointer text-sm block"
                            >
                                Continue to Sign In →
                            </button>
                        </div>
                    )}

                    {/* FOOTER REDIRECT */}
                    {step === 1 && (
                        <div className="mt-5 pt-4 border-t border-slate-800/80 text-center">
                            <p className="text-xs font-medium text-slate-400">
                                Already registered?{' '}
                                <Link to="/login" className="text-emerald-400 font-extrabold hover:underline">
                                    Sign In to Portal
                                </Link>
                            </p>
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

export default Register;