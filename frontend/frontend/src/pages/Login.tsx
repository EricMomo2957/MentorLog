import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

const Login = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        
        try {
            const response = await axios.post('http://localhost:5000/api/auth/login', formData);
            
            if (response.status === 200) {
                // Debugging: Crucial to see the object structure in the Console
                console.log("Login Response Data:", response.data);

                // 1. Extract data - handling multiple common naming conventions
                const { token, role, full_name, id, user_id, user } = response.data;

                // 2. Determine which ID to use (checks id, then user_id, then nested user.id)
                const finalUserId = id || user_id || (user && user.id);

                if (!finalUserId) {
                    console.error("Warning: No User ID found in response. Tasks will not load.");
                }

                // 3. Store all necessary info in localStorage
                localStorage.setItem('token', token);
                localStorage.setItem('role', role);
                localStorage.setItem('userName', full_name);
                
                // This is the specific key that MyTasks.tsx looks for
                localStorage.setItem('userId', String(finalUserId));

                alert(`Welcome back, ${full_name}!`);

                // 4. Conditional Redirection based on Role
                if (role === 'admin') {
                    navigate('/admin-dashboard');
                } else {
                    navigate('/student-dashboard');
                }
            }
        } catch (err: unknown) {
            if (axios.isAxiosError(err)) {
                setError(err.response?.data?.message || 'Invalid email or password.');
            } else {
                setError('An unexpected error occurred.');
            }
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#0f172a] text-white font-sans">
            <div className="bg-[#1e293b] p-8 rounded-2xl shadow-2xl w-full max-w-md border border-slate-700">
                <h2 className="text-3xl font-bold mb-6 text-center bg-linear-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
                    Welcome Back
                </h2>
                
                {error && (
                    <p className="bg-red-500/10 border border-red-500 text-red-500 p-3 rounded-lg mb-4 text-sm">
                        {error}
                    </p>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-sm font-medium mb-1 text-slate-300">Email Address</label>
                        <input 
                            type="email" 
                            name="email" 
                            placeholder="eric@example.com" 
                            onChange={handleChange} 
                            required 
                            className="w-full p-3 rounded-lg bg-[#0f172a] border border-slate-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all" 
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1 text-slate-300">Password</label>
                        <input 
                            type="password" 
                            name="password" 
                            placeholder="••••••••" 
                            onChange={handleChange} 
                            required 
                            className="w-full p-3 rounded-lg bg-[#0f172a] border border-slate-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all" 
                        />
                    </div>
                    
                    <button 
                        type="submit" 
                        className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-lg mt-4 transition-all transform hover:scale-[1.02] active:scale-95 shadow-lg shadow-blue-500/20"
                    >
                        Sign In
                    </button>
                </form>

                <p className="mt-6 text-center text-slate-400 text-sm">
                    Don't have an account? <Link to="/register" className="text-blue-400 hover:underline">Register here</Link>
                </p>
            </div>
        </div>
    );
};

export default Login;