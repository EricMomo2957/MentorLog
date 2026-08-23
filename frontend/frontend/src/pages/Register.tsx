import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { UserCircle, Mail, Lock, Key, Phone, Calendar, MapPin, School, Hash, BookOpen, ShieldCheck, Briefcase } from 'lucide-react'; 
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
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        if (formData.role === 'admin' && !formData.adminCode) {
            setError('Admin Reference Code is required for Administrator accounts.');
            setLoading(false);
            return;
        }

        const fullName = `${formData.first_name} ${formData.middle_name ? formData.middle_name + ' ' : ''}${formData.last_name}`.trim();

        const payload = {
            ...formData,
            full_name: fullName,
            student_id: formData.id_number || undefined
        };

        try {
            const response = await api.post('/auth/register', payload);
            if (response.status === 201 || response.data?.success) {
                navigate('/login');
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Registration failed. Please try again.');
        } finally {
            setLoading(false);
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
                    
                    {/* Header Title */}
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">Create Account</h2>
                            <p className="text-slate-400 text-xs sm:text-sm font-medium mt-0.5">Personal Information & Profile Verification</p>
                        </div>
                        <span className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-bold rounded-full">
                            Registration Form
                        </span>
                    </div>

                    {error && (
                        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-2xl text-xs sm:text-sm flex items-center gap-3 animate-in fade-in duration-300">
                            <span>⚠️</span> {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        
                        {/* --- SECTION 1: PERSONAL IDENTIFICATION --- */}
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

                        {/* --- SECTION 2: CONTACT & DEMOGRAPHICS --- */}
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

                        {/* --- SECTION 3: ACADEMIC & SCHOOL DETAILS --- */}
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

                        {/* --- SECTION 4: ACCOUNT CREDENTIALS & IT POSITION --- */}
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
                                        <Lock className="w-3 h-3 text-amber-400" /> Password *
                                    </label>
                                    <input 
                                        type="password" name="password" placeholder="••••••••" 
                                        value={formData.password} onChange={handleChange} required 
                                        className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-none text-xs font-medium text-white" 
                                    />
                                </div>
                            </div>

                            {/* IT Position / Specialization Dropdown */}
                            <div>
                                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center gap-1.5">
                                    <Briefcase className="w-3.5 h-3.5 text-amber-400" /> IT Position / Track Specialization *
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
                            className={`w-full font-bold py-3.5 rounded-2xl transition-all shadow-xl active:scale-[0.99] disabled:opacity-50 cursor-pointer text-white flex items-center justify-center gap-2 text-xs sm:text-sm ${
                                formData.role === 'admin' 
                                ? 'bg-blue-600 hover:bg-blue-500 shadow-blue-600/20' 
                                : 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/20'
                            }`}
                        >
                            {loading ? (
                                <span className="flex items-center gap-2">
                                    <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                    Creating Account...
                                </span>
                            ) : formData.role === 'admin' ? (
                                'Register as Administrator'
                            ) : (
                                'Submit Profile & Register Account'
                            )}
                        </button>
                    </form>

                    <div className="pt-2 border-t border-slate-800/80 text-center">
                        <p className="text-slate-400 text-xs font-medium">
                            Already registered?{' '}
                            <Link to="/login" className="text-emerald-400 font-bold hover:text-blue-400 transition-colors">
                                Sign In to Portal
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;