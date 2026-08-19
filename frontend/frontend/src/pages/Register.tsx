import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { UserCircle, Mail, Lock, Key } from 'lucide-react'; 
import mentorLogLogo from '../assets/mentorlogOption.png'; 
import api from '../services/api';

const Register = () => {
    const [formData, setFormData] = useState({
        full_name: '',
        email: '',
        password: '',
        role: 'student',
        adminCode: '' 
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        let value = e.target.value;
        
        if (e.target.name === 'adminCode') {
            value = value.toUpperCase();
        }
        
        setFormData({ ...formData, [e.target.name]: value });
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

        try {
            const response = await api.post('/auth/register', formData);
            if (response.status === 201 || response.data?.success) {
                navigate('/login');
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Registration failed.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex bg-[#020617] text-slate-200 font-sans">
            {/* --- LEFT SIDE: BRANDING --- */}
            <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden flex-col items-center justify-center p-12 bg-linear-to-br from-[#0f172a] to-[#020617] border-r border-slate-800/50">
                <div className="absolute top-0 left-0 w-96 h-96 bg-blue-600/10 blur-[120px] rounded-full -ml-48 -mt-48" />
                <div className="absolute bottom-0 right-0 w-96 h-96 bg-emerald-600/10 blur-[120px] rounded-full -mr-48 -mb-48" />

                <div className="relative z-10 max-w-lg">
                    <img src={mentorLogLogo} alt="Logo" className="w-20 h-20 mb-8 drop-shadow-2xl" />
                    <h1 className="text-6xl font-black tracking-tighter text-white mb-6 leading-tight">
                        Start your <br />
                        <span className="bg-linear-to-r from-emerald-400 to-blue-400 bg-clip-text text-transparent">Professional Journey.</span>
                    </h1>
                    <p className="text-lg text-slate-400 font-medium leading-relaxed mb-10">
                        Join the platform designed for modern OJT programs. Manage your tasks, track your hours, and excel in your internship.
                    </p>
                    
                    <div className="flex items-center gap-6">
                        <div className="flex -space-x-3">
                            {[1, 2, 3, 4].map((i) => (
                                <div key={i} className="w-10 h-10 rounded-full border-2 border-[#020617] bg-slate-800 flex items-center justify-center text-xs font-bold">
                                    {String.fromCharCode(64 + i)}
                                </div>
                            ))}
                        </div>
                        <p className="text-sm text-slate-500 font-bold tracking-wide">TRUSTED BY 500+ INTERNS</p>
                    </div>
                </div>
            </div>

            {/* --- RIGHT SIDE: REGISTER FORM --- */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12">
                <div className="w-full max-w-md space-y-8">
                    <div className="text-center lg:text-left">
                        <h2 className="text-3xl font-black text-white tracking-tight mb-2">Create Account</h2>
                        <p className="text-slate-500 font-medium">Join the MentorLog community today.</p>
                    </div>

                    {error && (
                        <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-xl text-sm flex items-center gap-3 animate-in fade-in zoom-in duration-300">
                            <span>⚠️</span> {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-widest text-slate-500 ml-1 flex items-center gap-2">
                                    <UserCircle className="w-3 h-3" /> Full Name
                                </label>
                                <input 
                                    type="text" name="full_name" placeholder="Eric Momo" 
                                    onChange={handleChange} required 
                                    className="w-full p-4 rounded-2xl bg-slate-900 border border-slate-800 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all text-sm font-medium" 
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-widest text-slate-500 ml-1 flex items-center gap-2">
                                    Role
                                </label>
                                <div className="relative">
                                    <select 
                                        name="role" value={formData.role} onChange={handleChange}
                                        className="w-full p-4 rounded-2xl bg-slate-900 border border-slate-800 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all appearance-none cursor-pointer text-sm font-medium"
                                    >
                                        <option value="student">Student</option>
                                        <option value="admin">Admin</option>
                                    </select>
                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-600 pointer-events-none text-xs">▼</span>
                                </div>
                            </div>
                        </div>

                        {formData.role === 'admin' && (
                            <div className="space-y-2 animate-in slide-in-from-top-2 fade-in duration-300">
                                <label className="text-xs font-bold uppercase tracking-widest text-blue-500 ml-1 flex items-center gap-2">
                                    <Key className="w-3 h-3" /> Admin Reference Code
                                </label>
                                <input 
                                    type="text" 
                                    name="adminCode" 
                                    value={formData.adminCode}
                                    placeholder="Enter ADM-XXXX-XXXX" 
                                    onChange={handleChange} 
                                    required={formData.role === 'admin'}
                                    className="w-full p-4 rounded-2xl bg-blue-500/5 border border-blue-500/20 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all text-sm font-mono tracking-widest text-blue-100 placeholder:text-blue-900" 
                                />
                                <p className="text-[10px] text-slate-500 ml-1 uppercase font-bold">A valid administrator key is required for this role.</p>
                            </div>
                        )}

                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-widest text-slate-500 ml-1 flex items-center gap-2">
                                <Mail className="w-3 h-3" /> Email Address
                            </label>
                            <input 
                                type="email" name="email" placeholder="name@university.edu" 
                                onChange={handleChange} required 
                                className="w-full p-4 rounded-2xl bg-slate-900 border border-slate-800 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all text-sm font-medium" 
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-widest text-slate-500 ml-1 flex items-center gap-2">
                                <Lock className="w-3 h-3" /> Password
                            </label>
                            <input 
                                type="password" name="password" placeholder="••••••••" 
                                onChange={handleChange} required 
                                className="w-full p-4 rounded-2xl bg-slate-900 border border-slate-800 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all text-sm font-medium" 
                            />
                        </div>
                        
                        <button 
                            type="submit" disabled={loading}
                            className={`w-full font-bold py-4 rounded-2xl transition-all shadow-lg active:scale-[0.98] disabled:opacity-50 mt-4 ${
                                formData.role === 'admin' 
                                ? 'bg-blue-600 hover:bg-blue-500 shadow-blue-600/20' 
                                : 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/20'
                            } text-white`}
                        >
                            {loading ? 'Processing...' : formData.role === 'admin' ? 'Register as Admin' : 'Register Account'}
                        </button>
                    </form>

                    <p className="text-center text-slate-500 text-sm font-medium pt-4">
                        Already have an account? <Link to="/login" className="text-emerald-400 font-bold hover:text-blue-400 transition-colors">Sign In</Link>
                    </p>

                    <p className="text-center text-slate-600 text-[10px] font-bold uppercase tracking-[0.2em] pt-8">
                        MentorLog v2.0 • Cebu City, PH
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Register;