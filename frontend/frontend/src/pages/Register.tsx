import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

// 1. IMPORT YOUR LOGO ASSET (Ensure path is correct)
import mentorLogLogo from '../assets/mentorlogOption.png'; 

const Register = () => {
    const [formData, setFormData] = useState({
        full_name: '',
        email: '',
        password: '',
        role: 'student' // Default remains student
    });
    const [error, setError] = useState('');
    const navigate = useNavigate();

    // Updated to handle both Input and Select elements
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        try {
            const response = await axios.post('http://localhost:5000/api/auth/register', formData);
            if (response.status === 201) {
                alert('Account created successfully!');
                navigate('/login');
            }
        } catch (err: unknown) {
            if (axios.isAxiosError(err)) {
                setError(err.response?.data?.message || 'Registration failed.');
            } else {
                setError('An unexpected error occurred.');
            }
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#0f172a] text-white font-sans px-4">
            <div className="bg-[#1e293b] p-10 rounded-3xl shadow-2xl w-full max-w-lg border border-slate-700 relative overflow-hidden group">
                
                {/* LOGO HEADER SECTION - MATCHES LOGIN */}
                <div className="flex flex-col items-center mb-8 relative z-10 text-center">
                    <div className="w-24 h-24 rounded-2xl flex items-center justify-center p-2 mb-4 bg-slate-900/50 border border-slate-700 shadow-inner group-hover:border-emerald-500/50 transition-colors duration-500">
                        <img 
                            src={mentorLogLogo} 
                            alt="MentorLog Logo" 
                            className="w-full h-full object-contain" 
                        />
                    </div>
                    <h2 className="text-3xl font-black bg-linear-to-r from-emerald-400 via-blue-400 to-emerald-400 bg-clip-text text-transparent tracking-tight">
                        CREATE ACCOUNT
                    </h2>
                    <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mt-1">
                        OJT Management System
                    </p>
                </div>
                
                {error && (
                    <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-3 rounded-xl mb-6 text-sm flex items-center gap-2">
                        <span>⚠️</span> {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="space-y-1.5">
                            <label className="block text-[10px] font-black uppercase text-slate-500 tracking-widest ml-1">Full Name</label>
                            <input type="text" name="full_name" placeholder="Eric Dominic Momo" onChange={handleChange} required 
                                className="w-full p-3.5 rounded-xl bg-[#0f172a] border border-slate-700 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all placeholder:text-slate-700 text-sm" />
                        </div>
                        
                        {/* New Role Selection Dropdown - STYLED */}
                        <div className="space-y-1.5">
                            <label className="block text-[10px] font-black uppercase text-slate-500 tracking-widest ml-1">Register As</label>
                            <div className="relative">
                                <select 
                                    name="role" 
                                    value={formData.role} 
                                    onChange={handleChange}
                                    className="w-full p-3.5 rounded-xl bg-[#0f172a] border border-slate-700 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all appearance-none cursor-pointer text-sm"
                                >
                                    <option value="student">Student</option>
                                    <option value="admin">Admin</option>
                                </select>
                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-600 pointer-events-none text-xs">▼</span>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="block text-[10px] font-black uppercase text-slate-500 tracking-widest ml-1">Email Address</label>
                        <input type="email" name="email" placeholder="eric@example.com" onChange={handleChange} required 
                            className="w-full p-3.5 rounded-xl bg-[#0f172a] border border-slate-700 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all placeholder:text-slate-700 text-sm" />
                    </div>
                    
                    <div className="space-y-1.5">
                        <label className="block text-[10px] font-black uppercase text-slate-500 tracking-widest ml-1">Password</label>
                        <input type="password" name="password" placeholder="••••••••" onChange={handleChange} required 
                            className="w-full p-3.5 rounded-xl bg-[#0f172a] border border-slate-700 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all placeholder:text-slate-700 text-sm" />
                    </div>
                    
                    <button type="submit" 
                        className="w-full bg-linear-to-r from-emerald-600 to-blue-600 hover:from-emerald-500 hover:to-blue-500 text-white font-black uppercase tracking-widest py-4 rounded-xl mt-6 transition-all transform hover:scale-[1.02] active:scale-95 shadow-xl shadow-emerald-500/10">
                        Register Account
                    </button>
                </form>

                <p className="mt-8 text-center text-slate-500 text-xs relative z-10">
                    Already have an account? <Link to="/login" className="text-emerald-400 font-bold hover:text-blue-400 transition-colors">Login here</Link>
                </p>

                {/* DECORATIVE BACKGROUND ELEMENTS - MATCHES LOGIN */}
                <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-600/5 rounded-full blur-[80px] pointer-events-none group-hover:bg-blue-600/10 transition-all duration-700"></div>
                <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-emerald-600/5 rounded-full blur-[80px] pointer-events-none group-hover:bg-emerald-600/10 transition-all duration-700"></div>
            </div>
        </div>
    );
};

export default Register;