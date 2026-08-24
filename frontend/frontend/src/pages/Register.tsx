import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
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
    ArrowLeft 
} from 'lucide-react'; 
import mentorLogLogo from '../assets/mentorlogOption.png'; 
import ojtPicture from '../assets/ojt-picture.jpg';
import api from '../services/api';

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
                // Auto focus first OTP digit box after slight delay
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
        const char = value.slice(-1); // Only take last character typed
        if (char && !/^[0-9]$/.test(char)) return; // Digits only

        const newOtp = [...otpDigits];
        newOtp[index] = char;
        setOtpDigits(newOtp);

        // Auto-advance to next box if char entered
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
        <div className="h-screen w-screen overflow-hidden flex bg-[#020617] text-slate-200 font-sans">
            {/* --- LEFT SIDE: FIXED BRANDING PANEL --- */}
            <div className="hidden lg:flex lg:w-1/2 h-full relative overflow-hidden flex-col justify-between p-10 lg:p-14 border-r border-slate-800/60 flex-shrink-0">
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

                {/* Header Logo */}
                <div className="relative z-10">
                    <img src={mentorLogLogo} alt="Logo" className="w-16 h-16 drop-shadow-2xl" />
                </div>

                {/* Main Branding Text */}
                <div className="relative z-10 max-w-md my-auto">
                    <h1 className="text-4xl lg:text-5xl font-black tracking-tighter text-white mb-4 leading-tight">
                        Start your <br />
                        <span className="bg-linear-to-r from-emerald-400 to-blue-400 bg-clip-text text-transparent italic">Professional Journey.</span>
                    </h1>
                    <p className="text-sm text-slate-300 font-medium leading-relaxed mb-6">
                        Complete your intern profile verification. Track your OJT hours, manage submissions, and excel in your program.
                    </p>
                    
                    <div className="flex items-center gap-3.5 bg-slate-900/70 backdrop-blur-md p-3.5 rounded-2xl border border-slate-800/80">
                        <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl">
                            <ShieldCheck className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-white uppercase tracking-wider">Profile Verification Ready</p>
                            <p className="text-[11px] text-slate-400">All registered information is securely archived for academic approval.</p>
                        </div>
                    </div>
                </div>

                {/* Footer Tag */}
                <div className="relative z-10 pt-4 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-400 font-medium">
                    <span>MentorLog Internship Platform</span>
                    <span>v2.0 • Cebu City, PH</span>
                </div>
            </div>

            {/* --- RIGHT SIDE: INDEPENDENT SCROLLABLE FORM PANEL --- */}
            <div className="w-full lg:w-1/2 h-full overflow-y-auto p-6 sm:p-10 md:p-12 flex flex-col items-center [scrollbar-width:thin] [scrollbar-color:#1e293b_transparent]">
                <div className="w-full max-w-xl space-y-6 py-4 my-auto">
                    
                    {/* --- STEPPER PROGRESS BAR (Matching Sample Photo) --- */}
                    <div className="flex items-center justify-between max-w-md mx-auto mb-6 px-2">
                        {/* Step 1 Badge */}
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

                        {/* Connector 1 -> 2 */}
                        <div className={`flex-1 h-0.5 mx-3 transition-colors ${step > 1 ? 'bg-emerald-500' : 'bg-slate-800'}`} />

                        {/* Step 2 Badge */}
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

                        {/* Connector 2 -> 3 */}
                        <div className={`flex-1 h-0.5 mx-3 transition-colors ${step === 3 ? 'bg-emerald-500' : 'bg-slate-800'}`} />

                        {/* Step 3 Badge */}
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
                        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-2xl text-xs sm:text-sm flex items-center gap-3 animate-in fade-in duration-300">
                            <span>⚠️</span> {error}
                        </div>
                    )}

                    {successMsg && (
                        <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-4 rounded-2xl text-xs sm:text-sm flex items-center gap-3 animate-in fade-in duration-300">
                            <span>✅</span> {successMsg}
                        </div>
                    )}

                    {/* ========================================================= */}
                    {/* --- STEP 1: ACCOUNT INFORMATION FORM --- */}
                    {/* ========================================================= */}
                    {step === 1 && (
                        <>
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">Create Account</h2>
                                    <p className="text-slate-400 text-xs sm:text-sm font-medium mt-0.5">Personal Information & Profile Verification</p>
                                </div>
                                <span className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-bold rounded-full">
                                    Step 1 of 3
                                </span>
                            </div>

                            <form onSubmit={handleStep1Submit} className="space-y-5">
                                
                                {/* SECTION 1: PERSONAL IDENTIFICATION */}
                                <div className="bg-slate-900/60 border border-slate-800/90 p-5 sm:p-6 rounded-3xl space-y-4 shadow-lg backdrop-blur-xs">
                                    <div className="flex items-center gap-2 pb-2.5 border-b border-slate-800 text-xs font-bold uppercase tracking-widest text-emerald-400">
                                        <UserCircle className="w-4 h-4" /> Personal Identification
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                                        <div>
                                            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 block">
                                                Member Title *
                                            </label>
                                            <select 
                                                name="member_title" 
                                                value={formData.member_title} 
                                                onChange={handleChange} 
                                                required
                                                className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none text-xs font-medium text-white cursor-pointer"
                                            >
                                                <option value="Mr.">Mr.</option>
                                                <option value="Ms.">Ms.</option>
                                                <option value="Mrs.">Mrs.</option>
                                                <option value="Dr.">Dr.</option>
                                                <option value="Engr.">Engr.</option>
                                                <option value="Prof.">Prof.</option>
                                            </select>
                                        </div>

                                        <div className="sm:col-span-2">
                                            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center gap-1.5">
                                                <Hash className="w-3 h-3 text-emerald-400" /> I.D Number *
                                            </label>
                                            <input 
                                                type="text" 
                                                name="id_number" 
                                                placeholder="000-000-000-000 or Student ID" 
                                                value={formData.id_number}
                                                onChange={handleChange} 
                                                required
                                                className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none text-xs font-mono font-medium text-white placeholder:text-slate-600" 
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                                        <div>
                                            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 block">First Name *</label>
                                            <input 
                                                type="text" name="first_name" placeholder="John" 
                                                value={formData.first_name} onChange={handleChange} required 
                                                className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none text-xs font-medium text-white" 
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 block">Middle Name</label>
                                            <input 
                                                type="text" name="middle_name" placeholder="Smith" 
                                                value={formData.middle_name} onChange={handleChange} 
                                                className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none text-xs font-medium text-white" 
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 block">Last Name *</label>
                                            <input 
                                                type="text" name="last_name" placeholder="Doe" 
                                                value={formData.last_name} onChange={handleChange} required 
                                                className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none text-xs font-medium text-white" 
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* SECTION 2: CONTACT & DEMOGRAPHICS */}
                                <div className="bg-slate-900/60 border border-slate-800/90 p-5 sm:p-6 rounded-3xl space-y-4 shadow-lg backdrop-blur-xs">
                                    <div className="flex items-center gap-2 pb-2.5 border-b border-slate-800 text-xs font-bold uppercase tracking-widest text-blue-400">
                                        <Mail className="w-4 h-4" /> Contact & Demographics
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                                        <div>
                                            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center gap-1.5">
                                                <Mail className="w-3 h-3 text-blue-400" /> Email Address *
                                            </label>
                                            <input 
                                                type="email" name="email" placeholder="johndoe@example.com" 
                                                value={formData.email} onChange={handleChange} required 
                                                className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none text-xs font-medium text-white" 
                                            />
                                        </div>

                                        <div>
                                            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center gap-1.5">
                                                <Phone className="w-3 h-3 text-blue-400" /> Phone Number *
                                            </label>
                                            <input 
                                                type="text" name="phone" placeholder="+639123456789" 
                                                value={formData.phone} onChange={handleChange} required 
                                                className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none text-xs font-medium text-white" 
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                                        <div>
                                            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center gap-1.5">
                                                <Calendar className="w-3 h-3 text-blue-400" /> Date of Birth *
                                            </label>
                                            <input 
                                                type="date" name="date_of_birth" 
                                                value={formData.date_of_birth} onChange={handleChange} required 
                                                className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none text-xs font-medium text-white" 
                                            />
                                        </div>

                                        <div>
                                            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 block">
                                                Age (Auto-computed)
                                            </label>
                                            <input 
                                                type="text" name="age" readOnly value={formData.age} placeholder="e.g. 21" 
                                                className="w-full p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs font-bold text-emerald-400 cursor-not-allowed" 
                                            />
                                        </div>

                                        <div>
                                            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 block">
                                                Sex / Gender *
                                            </label>
                                            <select 
                                                name="gender" value={formData.gender} onChange={handleChange} required
                                                className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none text-xs font-medium text-white cursor-pointer"
                                            >
                                                <option value="Male">Male</option>
                                                <option value="Female">Female</option>
                                                <option value="Other">Other</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                                        <div>
                                            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 block">
                                                Civil Status *
                                            </label>
                                            <select 
                                                name="civil_status" value={formData.civil_status} onChange={handleChange} required
                                                className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none text-xs font-medium text-white cursor-pointer"
                                            >
                                                <option value="Single">Single</option>
                                                <option value="Married">Married</option>
                                                <option value="Divorced">Divorced</option>
                                                <option value="Widowed">Widowed</option>
                                                <option value="Separated">Separated</option>
                                            </select>
                                        </div>

                                        <div className="sm:col-span-2">
                                            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center gap-1.5">
                                                <MapPin className="w-3 h-3 text-blue-400" /> Address *
                                            </label>
                                            <input 
                                                type="text" name="address" placeholder="123 Mambaling Street, Cebu City" 
                                                value={formData.address} onChange={handleChange} required 
                                                className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none text-xs font-medium text-white" 
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* SECTION 3: ACADEMIC & SCHOOL DETAILS */}
                                <div className="bg-slate-900/60 border border-slate-800/90 p-5 sm:p-6 rounded-3xl space-y-4 shadow-lg backdrop-blur-xs">
                                    <div className="flex items-center gap-2 pb-2.5 border-b border-slate-800 text-xs font-bold uppercase tracking-widest text-purple-400">
                                        <School className="w-4 h-4" /> Academic & School Track
                                    </div>

                                    <div>
                                        <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center gap-1.5">
                                            <School className="w-3 h-3 text-purple-400" /> Name of School / University *
                                        </label>
                                        <input 
                                            type="text" name="school_name" placeholder="University of Cebu / Cebu Institute of Technology" 
                                            value={formData.school_name} onChange={handleChange} required 
                                            className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none text-xs font-medium text-white placeholder:text-slate-600" 
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                                        <div>
                                            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center gap-1.5">
                                                <BookOpen className="w-3 h-3 text-purple-400" /> Course / Program
                                            </label>
                                            <input 
                                                type="text" name="course" placeholder="BS Information Technology" 
                                                value={formData.course} onChange={handleChange} 
                                                className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none text-xs font-medium text-white" 
                                            />
                                        </div>

                                        <div>
                                            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 block">
                                                Year Level / Batch
                                            </label>
                                            <input 
                                                type="text" name="year_level" placeholder="4th Year" 
                                                value={formData.year_level} onChange={handleChange} 
                                                className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none text-xs font-medium text-white" 
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* SECTION 4: ACCOUNT CREDENTIALS & IT POSITION */}
                                <div className="bg-slate-900/60 border border-slate-800/90 p-5 sm:p-6 rounded-3xl space-y-4 shadow-lg backdrop-blur-xs">
                                    <div className="flex items-center gap-2 pb-2.5 border-b border-slate-800 text-xs font-bold uppercase tracking-widest text-amber-400">
                                        <Lock className="w-4 h-4" /> Account Credentials & Role
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                                        <div>
                                            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 block">
                                                Account Role *
                                            </label>
                                            <select 
                                                name="role" value={formData.role} onChange={handleChange}
                                                className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-none text-xs font-medium text-white cursor-pointer"
                                            >
                                                <option value="student">Student (OJT Intern)</option>
                                                <option value="admin">Administrator / Supervisor</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center gap-1.5">
                                                <Briefcase className="w-3.5 h-3.5 text-amber-400" /> IT Track Specialization *
                                            </label>
                                            <select 
                                                name="it_position" 
                                                value={formData.it_position} 
                                                onChange={handleChange} 
                                                required
                                                className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-none text-xs font-medium text-white cursor-pointer"
                                            >
                                                {IT_POSITIONS.map((pos, idx) => (
                                                    <option key={idx} value={pos}>
                                                        {pos}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    {/* PASSWORD & CONFIRM PASSWORD FIELDS WITH STRENGTH METER */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
                                        {/* PASSWORD FIELD WITH STRENGTH METER */}
                                        <div>
                                            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center gap-1.5">
                                                <Lock className="w-3 h-3 text-amber-400" /> Password *
                                            </label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                                    <Lock className={`w-4 h-4 transition-colors ${formData.password ? strength.textColor : 'text-slate-500'}`} />
                                                </div>
                                                <input 
                                                    type={showPassword ? "text" : "password"} 
                                                    name="password" 
                                                    placeholder="••••••••" 
                                                    value={formData.password} 
                                                    onChange={handleChange} 
                                                    required 
                                                    className={`w-full pl-10 pr-10 p-3 rounded-xl bg-slate-950 border transition-all outline-none text-xs font-medium text-white placeholder:text-slate-600 ${
                                                        formData.password 
                                                            ? `${strength.borderColor} focus:ring-2 focus:ring-amber-500/20` 
                                                            : 'border-slate-800 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20'
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
                                            {formData.password ? (
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
                                        <div>
                                            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center gap-1.5">
                                                <Lock className="w-3 h-3 text-amber-400" /> Confirm Password *
                                            </label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                                    <Lock className={`w-4 h-4 transition-colors ${
                                                        confirmPassword && confirmPassword !== formData.password 
                                                            ? 'text-red-400' 
                                                            : confirmPassword && confirmPassword === formData.password 
                                                            ? 'text-emerald-400' 
                                                            : 'text-slate-500'
                                                    }`} />
                                                </div>
                                                <input 
                                                    type={showConfirmPassword ? "text" : "password"} 
                                                    name="confirmPassword" 
                                                    placeholder="••••••••" 
                                                    value={confirmPassword} 
                                                    onChange={(e) => setConfirmPassword(e.target.value)} 
                                                    required 
                                                    className={`w-full pl-10 pr-10 p-3 rounded-xl bg-slate-950 border transition-all outline-none text-xs font-medium text-white placeholder:text-slate-600 ${
                                                        confirmPassword && confirmPassword !== formData.password
                                                            ? 'border-red-500/80 focus:border-red-500 focus:ring-2 focus:ring-red-500/20'
                                                            : confirmPassword && confirmPassword === formData.password
                                                            ? 'border-emerald-500/80 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20'
                                                            : 'border-slate-800 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20'
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

                                            {/* Confirm Password Indicator / Message */}
                                            {confirmPassword ? (
                                                confirmPassword !== formData.password ? (
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
                                                    Re-enter your password.
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    {formData.role === 'admin' && (
                                        <div className="space-y-2 pt-1 animate-in slide-in-from-top-2 fade-in duration-300">
                                            <label className="text-[11px] font-bold uppercase tracking-wider text-blue-400 flex items-center gap-2">
                                                <Key className="w-4 h-4" /> Admin Reference Code *
                                            </label>
                                            <input 
                                                type="text" 
                                                name="adminCode" 
                                                value={formData.adminCode}
                                                placeholder="Enter ADM-XXXX-XXXX" 
                                                onChange={handleChange} 
                                                required={formData.role === 'admin'}
                                                className="w-full p-3.5 rounded-xl bg-blue-950/40 border border-blue-500/30 focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10 outline-none text-xs font-mono tracking-widest text-blue-200 placeholder:text-blue-700" 
                                            />
                                            <p className="text-[10px] text-slate-400 font-medium">A valid administrator key is required for supervisor accounts.</p>
                                        </div>
                                    )}
                                </div>

                                {/* Submit Button */}
                                <button 
                                    type="submit" disabled={loading}
                                    className={`w-full font-bold py-4 rounded-2xl transition-all shadow-xl active:scale-[0.99] disabled:opacity-50 cursor-pointer text-white flex items-center justify-center gap-2 text-xs sm:text-sm ${
                                        formData.role === 'admin' 
                                        ? 'bg-blue-600 hover:bg-blue-500 shadow-blue-600/20' 
                                        : 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/20'
                                    }`}
                                >
                                    {loading ? (
                                        <span className="flex items-center gap-2">
                                            <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                            Sending Verification Code...
                                        </span>
                                    ) : (
                                        <span className="flex items-center gap-2">
                                            <span>Continue to Email Verification</span>
                                            <span>→</span>
                                        </span>
                                    )}
                                </button>
                            </form>
                        </>
                    )}

                    {/* ========================================================= */}
                    {/* --- STEP 2: VERIFY EMAIL SCREEN (EXACT SAMPLE PHOTO) --- */}
                    {/* ========================================================= */}
                    {step === 2 && (
                        <div className="bg-slate-900/80 border border-slate-800 p-6 sm:p-10 rounded-3xl shadow-2xl backdrop-blur-md text-center space-y-6 animate-in fade-in duration-300">
                            
                            {/* Shield Icon Badge */}
                            <div className="mx-auto w-20 h-20 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-full flex items-center justify-center shadow-inner shadow-emerald-500/20">
                                <ShieldCheck className="w-10 h-10 stroke-[2.2]" />
                            </div>

                            {/* Title & Email Subtitle */}
                            <div>
                                <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">Verify Your Email</h2>
                                <p className="text-slate-400 text-xs sm:text-sm font-medium mt-2">
                                    We sent a 6-digit code to <span className="text-emerald-400 font-bold">{formData.email}</span>
                                </p>
                            </div>

                            {/* 6 Digit OTP Inputs */}
                            <form onSubmit={handleVerifyOTP} className="space-y-6">
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
                                            className={`w-11 h-14 sm:w-14 sm:h-16 text-center text-xl sm:text-2xl font-mono font-bold rounded-2xl bg-slate-950 border transition-all outline-none text-white ${
                                                digit 
                                                    ? 'border-emerald-500 ring-2 ring-emerald-500/30 bg-emerald-950/20' 
                                                    : 'border-slate-800 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20'
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
                                                ? 'text-emerald-400 hover:text-emerald-300 cursor-pointer' 
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
                                    disabled={verifyLoading}
                                    className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black py-4 rounded-2xl transition-all shadow-lg shadow-emerald-500/20 active:scale-[0.99] disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2 text-sm sm:text-base"
                                >
                                    {verifyLoading ? (
                                        <span className="flex items-center gap-2">
                                            <span className="w-5 h-5 border-2 border-slate-950/30 border-t-slate-950 rounded-full animate-spin" />
                                            Verifying Code...
                                        </span>
                                    ) : (
                                        <span className="flex items-center gap-2">
                                            <ShieldCheck className="w-5 h-5" />
                                            <span>Verify & Create Account</span>
                                        </span>
                                    )}
                                </button>

                                {/* Back Link */}
                                <button
                                    type="button"
                                    onClick={() => setStep(1)}
                                    className="text-slate-400 text-xs font-semibold hover:text-white transition-colors flex items-center justify-center gap-1.5 mx-auto pt-2 cursor-pointer"
                                >
                                    <ArrowLeft className="w-3.5 h-3.5" /> Back to registration form
                                </button>
                            </form>
                        </div>
                    )}

                    {/* ========================================================= */}
                    {/* --- STEP 3: REGISTRATION COMPLETE --- */}
                    {/* ========================================================= */}
                    {step === 3 && (
                        <div className="bg-slate-900/80 border border-slate-800 p-8 sm:p-12 rounded-3xl shadow-2xl backdrop-blur-md text-center space-y-6 animate-in zoom-in-95 duration-300">
                            
                            <div className="mx-auto w-24 h-24 bg-emerald-500/20 border border-emerald-500/50 text-emerald-400 rounded-full flex items-center justify-center shadow-xl shadow-emerald-500/20">
                                <Check className="w-12 h-12 stroke-[3]" />
                            </div>

                            <div>
                                <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">Account Verified!</h2>
                                <p className="text-slate-300 text-sm font-medium mt-2 max-w-md mx-auto leading-relaxed">
                                    Your email address <strong className="text-emerald-400">{formData.email}</strong> has been successfully verified and your MentorLog profile is created.
                                </p>
                            </div>

                            <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 text-left text-xs space-y-1.5 max-w-md mx-auto">
                                <p className="text-slate-400"><strong>Name:</strong> {formData.first_name} {formData.last_name}</p>
                                <p className="text-slate-400"><strong>School:</strong> {formData.school_name}</p>
                                <p className="text-slate-400"><strong>Role:</strong> {formData.role === 'admin' ? 'Administrator' : 'Student (OJT Intern)'}</p>
                            </div>

                            <button
                                onClick={() => navigate('/login')}
                                className="w-full max-w-md mx-auto bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black py-4 rounded-2xl transition-all shadow-xl shadow-emerald-500/20 cursor-pointer text-sm sm:text-base block"
                            >
                                Continue to Sign In →
                            </button>
                        </div>
                    )}

                    {step === 1 && (
                        <div className="pt-2 border-t border-slate-800/80 text-center">
                            <p className="text-slate-400 text-xs font-medium">
                                Already registered?{' '}
                                <Link to="/login" className="text-emerald-400 font-bold hover:text-blue-400 transition-colors">
                                    Sign In to Portal
                                </Link>
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Register;