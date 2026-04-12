import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

interface ForgotPasswordRequest {
    id: number;
    full_name: string;
    email: string;
    requested_at: string;
    status: 'pending' | 'resolved';
}

const ManageForgotPassword = () => {
    const [requests, setRequests] = useState<ForgotPasswordRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // BASE_URL for easy maintenance
    const API_BASE_URL = 'http://localhost:5000/api/auth';

    const fetchRequests = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            // Updated URL to match your authRoutes definition
            const response = await axios.get(`${API_BASE_URL}/forgot-password-requests`);
            setRequests(response.data);
        } catch (err) {
            console.error("Error fetching requests:", err);
            setError("Could not load requests. Please ensure your Node.js server is running and database is connected.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchRequests();
    }, [fetchRequests]);

    const handleResolve = async (id: number) => {
        try {
            // Updated URL to match your authRoutes definition
            await axios.put(`${API_BASE_URL}/resolve-password/${id}`);
            
            // Optimistically update the UI status without a full reload
            setRequests(prev => 
                prev.map(req => req.id === id ? { ...req, status: 'resolved' } : req)
            );
        } catch (err) {
            console.error("Update error:", err);
            alert("Failed to mark as resolved. Please check your backend connection.");
        }
    };

    return (
        <div className="p-6 bg-[#020617] min-h-screen text-slate-200 font-sans">
            {/* Header Section */}
            <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-white tracking-tight">Manage Password Requests</h1>
                    <p className="text-slate-500 text-sm italic mt-1">Review and resolve student account access issues.</p>
                </div>
                
                <button 
                    onClick={fetchRequests}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold uppercase tracking-widest rounded-xl transition-all border border-slate-700 active:scale-95"
                >
                    Refresh List
                </button>
            </div>

            {/* Error Alert */}
            {error && (
                <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-2xl text-sm italic animate-in fade-in duration-300">
                    ⚠️ {error}
                </div>
            )}

            {/* Requests Table Container */}
            <div className="bg-slate-900/50 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl backdrop-blur-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-900/80 border-b border-slate-800">
                                <th className="p-5 text-[10px] font-bold uppercase tracking-widest text-slate-500">Student Name</th>
                                <th className="p-5 text-[10px] font-bold uppercase tracking-widest text-slate-500">Email Address</th>
                                <th className="p-5 text-[10px] font-bold uppercase tracking-widest text-slate-500">Date Requested</th>
                                <th className="p-5 text-[10px] font-bold uppercase tracking-widest text-slate-500">Status</th>
                                <th className="p-5 text-[10px] font-bold uppercase tracking-widest text-slate-500 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/50">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="p-20 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="w-8 h-8 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
                                            <span className="text-slate-500 text-sm font-medium animate-pulse">Syncing with database...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : requests.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="p-20 text-center">
                                        <div className="text-slate-600 italic">
                                            <p className="text-lg">No requests found</p>
                                            <p className="text-xs mt-1 text-slate-700">All student login issues are currently resolved.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                requests.map((req) => (
                                    <tr key={req.id} className="hover:bg-slate-800/30 transition-colors group">
                                        <td className="p-5 text-sm font-bold text-white tracking-wide">{req.full_name}</td>
                                        <td className="p-5 text-sm font-medium text-slate-400">{req.email}</td>
                                        <td className="p-5 text-sm text-slate-500 font-mono">
                                            {new Date(req.requested_at).toLocaleDateString('en-US', {
                                                month: 'short',
                                                day: 'numeric',
                                                year: 'numeric'
                                            })}
                                        </td>
                                        <td className="p-5">
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter border ${
                                                req.status === 'pending' 
                                                ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' 
                                                : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                            }`}>
                                                {req.status}
                                            </span>
                                        </td>
                                        <td className="p-5 text-center">
                                            {req.status === 'pending' ? (
                                                <button 
                                                    onClick={() => handleResolve(req.id)}
                                                    className="bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-bold py-2 px-5 rounded-xl transition-all shadow-lg shadow-blue-900/20 active:scale-95"
                                                >
                                                    Mark Resolved
                                                </button>
                                            ) : (
                                                <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest flex items-center justify-center gap-1">
                                                    <span className="w-1.5 h-1.5 bg-slate-700 rounded-full"></span>
                                                    Completed
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default ManageForgotPassword;