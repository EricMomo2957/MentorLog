import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import mentorLogLogo from '../assets/mentorlogOption.png'; 
import ojtPicture from '../assets/ojt-picture.jpg';

const Login = () => {
    const [formData, setFormData] = useState({ email: '', password: '' });
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
            const response = await axios.post('http://localhost:5000/api/auth/login', formData);
            if (response.data.success) {
                const { token, user } = response.data;
                localStorage.setItem('token', token);
                localStorage.setItem('role', user.role);
                localStorage.setItem('userName', user.name);
                localStorage.setItem('userId', String(user.id));
                // eslint-disable-next-line @typescript-eslint/no-unused-expressions
                user.role === 'admin' ? navigate('/admin-dashboard') : navigate('/student-dashboard');
            }
        } catch (err: unknown) {
            setError(axios.isAxiosError(err) ? err.response?.data?.message || 'Invalid credentials' : 'Error occurred');
        } finally { setLoading(false); }
    };

    return (
        /* Added h-screen and overflow-hidden to lock the page height */
        <div className="h-screen w-full flex bg-[#020617] text-slate-200 font-sans overflow-hidden">
            
            {/* --- LEFT SIDE: VISUAL BRANDING --- */}
            <div className="hidden lg:flex lg:w-1/2 h-full relative overflow-hidden flex-col items-center justify-center p-12 bg-linear-to-br from-[#0f172a] to-[#020617] border-r border-slate-800/50">
                {/* Decorative Background Circles */}
                <div className="absolute top-0 left-0 w-96 h-96 bg-blue-600/10 blur-[120px] rounded-full -ml-48 -mt-48" />
                <div className="absolute bottom-0 right-0 w-96 h-96 bg-emerald-600/10 blur-[120px] rounded-full -mr-48 -mb-48" />

                <div className="relative z-10 max-w-lg">
                    <img src={mentorLogLogo} alt="Logo" className="w-16 h-16 mb-6 drop-shadow-2xl" />
                    <h1 className="text-5xl font-black tracking-tighter text-white mb-4 leading-tight">
                        Experience the <br />
                        <span className="bg-linear-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent italic">Future of OJT.</span>
                    </h1>
                    <p className="text-base text-slate-400 font-medium leading-relaxed mb-8">
                        Streamline your internship journey with MentorLog. Real-time tracking and simplified management.
                    </p>

                    {/* The new Photo - locked with max-height to prevent scrolling */}
                    <div className="relative rounded-3xl overflow-hidden border border-slate-800 shadow-2xl">
                        <img 
                            src={ojtPicture} 
                            alt="OJT Preview" 
                            className="w-full h-auto max-h-80 object-cover"
                        />
                        <div className="absolute inset-0 bg-linear-to-t from-[#020617]/50 to-transparent" />
                    </div>
                </div>
            </div>

            {/* --- RIGHT SIDE: LOGIN FORM --- */}
            <div className="w-full lg:w-1/2 h-full flex items-center justify-center p-6 sm:p-12 overflow-hidden">
                <div className="w-full max-w-md space-y-6">
                    <div className="text-center lg:text-left">
                        <h2 className="text-3xl font-black text-white tracking-tight mb-2">Welcome Back</h2>
                        <p className="text-slate-500 font-medium text-sm">Please enter your details to sign in.</p>
                    </div>

                    {error && (
                        <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-xl text-sm flex items-center gap-3">
                            <span>⚠️</span> {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">Email Address</label>
                            <input 
                                type="email" name="email" placeholder="name@university.edu" 
                                onChange={handleChange} required 
                                className="w-full p-4 rounded-2xl bg-slate-900 border border-slate-800 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all text-sm font-medium" 
                            />
                        </div>
                        <div className="space-y-1.5">
                            <div className="flex justify-between items-center px-1">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Password</label>
                                <button type="button" className="text-[10px] font-bold text-blue-400 hover:text-blue-300 transition-colors uppercase tracking-widest">Forgot?</button>
                            </div>
                            <input 
                                type="password" name="password" placeholder="••••••••" 
                                onChange={handleChange} required 
                                className="w-full p-4 rounded-2xl bg-slate-900 border border-slate-800 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all text-sm font-medium" 
                            />
                        </div>
                        
                        <button 
                            type="submit" disabled={loading}
                            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-blue-600/20 active:scale-[0.98] disabled:opacity-50"
                        >
                            {loading ? 'Authenticating...' : 'Continue to Dashboard'}
                        </button>
                    </form>

                    <div className="relative py-2">
                        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-800"></div></div>
                        <div className="relative flex justify-center text-[10px] uppercase"><span className="bg-[#020617] px-4 text-slate-600 font-bold tracking-widest">or</span></div>
                    </div>

                    <Link 
                        to="/register" 
                        className="block w-full text-center py-4 bg-transparent border border-slate-800 hover:bg-slate-900 text-slate-300 font-bold rounded-2xl transition-all"
                    >
                        Create new account
                    </Link>

                    <p className="text-center text-slate-700 text-[10px] font-bold uppercase tracking-[0.3em] pt-4">
                        © 2026 MentorLog • Cebu City
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;