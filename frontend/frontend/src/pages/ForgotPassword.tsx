import React, { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import mentorLogLogo from '../assets/mentorlogOption.png';
import ojtPicture from '../assets/ojt-picture.jpg';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage('');
        setError('');
        setLoading(true);
        try {
            const response = await axios.post('http://localhost:5000/api/auth/forgot-password', { email });
            setMessage(response.data.message || 'Check your email for reset instructions.');
        } catch (err: unknown) {
            // FIX: Changed 'any' to 'unknown' and added Axios check
            if (axios.isAxiosError(err)) {
                setError(err.response?.data?.message || 'Failed to send reset email.');
            } else {
                setError('An unexpected error occurred.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="h-screen w-full flex bg-[#020617] text-slate-200 font-sans overflow-hidden">
            <div className="hidden lg:flex lg:w-1/2 h-full relative overflow-hidden flex-col items-center justify-center p-12 bg-linear-to-br from-[#0f172a] to-[#020617] border-r border-slate-800/50">
                <div className="absolute top-0 left-0 w-96 h-96 bg-blue-600/10 blur-[120px] rounded-full -ml-48 -mt-48" />
                <div className="relative z-10 max-w-lg">
                    <img src={mentorLogLogo} alt="Logo" className="w-16 h-16 mb-6 drop-shadow-2xl" />
                    <h1 className="text-5xl font-black tracking-tighter text-white mb-4 leading-tight">
                        Secure your <br />
                        <span className="bg-linear-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent italic">Account Access.</span>
                    </h1>
                    <div className="relative rounded-3xl overflow-hidden border border-slate-800 shadow-2xl">
                        {/* FIX: Changed max-h-[320px] to max-h-80 */}
                        <img src={ojtPicture} alt="OJT" className="w-full h-auto max-h-80 object-cover" />
                    </div>
                </div>
            </div>

            <div className="w-full lg:w-1/2 h-full flex items-center justify-center p-6 sm:p-12">
                <div className="w-full max-w-md space-y-6">
                    <div className="text-center lg:text-left">
                        <h2 className="text-3xl font-black text-white tracking-tight mb-2">Trouble logging in?</h2>
                        <p className="text-slate-500 font-medium text-sm">Enter your email and we'll send you a link to get back into your account.</p>
                    </div>

                    {message && <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-4 rounded-xl text-sm italic">✓ {message}</div>}
                    {error && <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-xl text-sm italic">⚠️ {error}</div>}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">Email Address</label>
                            <input 
                                type="email" placeholder="name@university.edu" 
                                value={email} onChange={(e) => setEmail(e.target.value)} required 
                                className="w-full p-4 rounded-2xl bg-slate-900 border border-slate-800 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all text-sm font-medium" 
                            />
                        </div>
                        
                        <button 
                            type="submit" disabled={loading}
                            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-2xl transition-all shadow-lg active:scale-[0.98] disabled:opacity-50"
                        >
                            {loading ? 'Sending...' : 'Send Reset Link'}
                        </button>
                    </form>

                    <div className="relative py-2">
                        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-800"></div></div>
                        <div className="relative flex justify-center text-[10px] uppercase"><span className="bg-[#020617] px-4 text-slate-600 font-bold tracking-widest">or</span></div>
                    </div>

                    <Link to="/" className="block w-full text-center py-4 text-sm font-bold text-blue-400 hover:text-blue-300 transition-colors">
                        Back to Login
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;