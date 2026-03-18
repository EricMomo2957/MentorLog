import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api'; // Import our Axios instance

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(''); // State for error messages
  const [loading, setLoading] = useState(false); // State for button loading
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // 1. Send request to backend
      const response = await api.post('/auth/login', { email, password });

      // 2. Save JWT Token and User info to LocalStorage
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));

      // 3. Redirect based on user role
      if (response.data.user.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/student/dashboard');
      }
      
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      const message = error.response?.data?.message || 'Login failed. Please check your connection.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md border border-gray-100">
        <h2 className="text-3xl font-extrabold mb-2 text-center text-indigo-600">MentorLog</h2>
        <p className="text-center text-gray-500 mb-8">Sign in to your account</p>

        {/* Display Error Message if it exists */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700">Email Address</label>
            <input 
              type="email" 
              className="mt-1 block w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none"
              placeholder="name@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700">Password</label>
            <input 
              type="password" 
              className="mt-1 block w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className={`w-full py-3 rounded-lg transform active:scale-[0.98] transition-all font-bold shadow-md ${
              loading ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'
            } text-white`}
          >
            {loading ? 'Signing in...' : 'Login'}
          </button>
        </form>
        
        <div className="mt-6 text-center text-sm">
          <span className="text-gray-600">Don't have an account? </span>
          <button 
            onClick={() => navigate('/register')}
            className="text-indigo-600 font-bold hover:underline"
          >
            Register here
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;