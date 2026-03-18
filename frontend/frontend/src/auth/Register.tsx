import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Register: React.FC = () => {
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    password: '',
    role: 'student'
  });
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Registering:", formData);
    // Logic for axios.post('/api/auth/register') goes here
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md border border-gray-100">
        <h2 className="text-3xl font-extrabold mb-2 text-center text-indigo-600">Create Account</h2>
        <p className="text-center text-gray-500 mb-8">Join the MentorLog system</p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700">Full Name</label>
            <input 
              type="text" 
              className="mt-1 block w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 transition-all"
              onChange={(e) => setFormData({...formData, full_name: e.target.value})}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700">Email Address</label>
            <input 
              type="email" 
              className="mt-1 block w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 transition-all"
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700">Password</label>
            <input 
              type="password" 
              className="mt-1 block w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 transition-all"
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700">Role</label>
            <select 
              className="mt-1 block w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 transition-all"
              value={formData.role}
              onChange={(e) => setFormData({...formData, role: e.target.value})}
            >
              <option value="student">Student (OJT)</option>
              <option value="admin">Admin / Supervisor</option>
            </select>
          </div>

          <button 
            type="submit" 
            className="w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 font-bold shadow-md mt-4"
          >
            Create Account
          </button>
        </form>
        
        <div className="mt-6 text-center text-sm">
          <span className="text-gray-600">Already have an account? </span>
          <button 
            onClick={() => navigate('/login')}
            className="text-indigo-600 font-bold hover:underline"
          >
            Login here
          </button>
        </div>
      </div>
    </div>
  );
};

export default Register;