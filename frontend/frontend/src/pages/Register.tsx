import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

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
        <div className="min-h-screen flex items-center justify-center bg-[#0f172a] text-white font-sans">
            <div className="bg-[#1e293b] p-8 rounded-2xl shadow-2xl w-full max-w-md border border-slate-700">
                <h2 className="text-3xl font-bold mb-6 text-center bg-linear-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
                    Create Account
                </h2>
                
                {error && <p className="bg-red-500/10 border border-red-500 text-red-500 p-3 rounded-lg mb-4 text-sm">{error}</p>}

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-sm font-medium mb-1">Full Name</label>
                        <input type="text" name="full_name" placeholder="Eric Dominic Momo" onChange={handleChange} required 
                            className="w-full p-3 rounded-lg bg-[#0f172a] border border-slate-600 focus:border-blue-500 outline-none transition-all" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Email Address</label>
                        <input type="email" name="email" placeholder="eric@example.com" onChange={handleChange} required 
                            className="w-full p-3 rounded-lg bg-[#0f172a] border border-slate-600 focus:border-blue-500 outline-none transition-all" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Password</label>
                        <input type="password" name="password" placeholder="••••••••" onChange={handleChange} required 
                            className="w-full p-3 rounded-lg bg-[#0f172a] border border-slate-600 focus:border-blue-500 outline-none transition-all" />
                    </div>

                    {/* New Role Selection Dropdown */}
                    <div>
                        <label className="block text-sm font-medium mb-1">Register As</label>
                        <select 
                            name="role" 
                            value={formData.role} 
                            onChange={handleChange}
                            className="w-full p-3 rounded-lg bg-[#0f172a] border border-slate-600 focus:border-blue-500 outline-none transition-all appearance-none cursor-pointer"
                        >
                            <option value="student">Student</option>
                            <option value="admin">Admin</option>
                        </select>
                    </div>
                    
                    <button type="submit" 
                        className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-lg mt-4 transition-all transform hover:scale-[1.02] active:scale-95 shadow-lg shadow-blue-500/20">
                        Register
                    </button>
                </form>

                <p className="mt-6 text-center text-slate-400 text-sm">
                    Already have an account? <Link to="/login" className="text-blue-400 hover:underline">Login here</Link>
                </p>
            </div>
        </div>
    );
};

export default Register;