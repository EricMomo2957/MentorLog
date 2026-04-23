import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { 
    FiShield, FiMail, FiClock, FiCheckCircle, 
    FiRefreshCw, FiAlertCircle 
} from 'react-icons/fi'; // Removed FiUser as it was unused

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

    const API_BASE_URL = 'http://localhost:5000/api/auth';

    const fetchRequests = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.get(`${API_BASE_URL}/forgot-password-requests`);
            setRequests(response.data);
        } catch {
            // Changed '_err' to just catch {} to satisfy ESLint
            setError("Could not load requests. Check server connection.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchRequests();
    }, [fetchRequests]);

    const handleResolve = async (id: number) => {
        try {
            await axios.put(`${API_BASE_URL}/resolve-password/${id}`);
            setRequests(prev => 
                prev.map(req => req.id === id ? { ...req, status: 'resolved' } : req)
            );
        } catch {
            // Changed '_err' to just catch {} to satisfy ESLint
            alert("Failed to mark as resolved.");
        }
    };

    const stats = {
        total: requests.length,
        pending: requests.filter(r => r.status === 'pending').length,
        resolved: requests.filter(r => r.status === 'resolved').length,
    };

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 min-h-screen pb-20">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
                <div>
                    <h1 className="text-4xl font-black text-white tracking-tight flex items-center gap-3">
                        Account Recovery <span className="text-blue-500 text-sm bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20">{stats.total}</span>
                    </h1>
                    <p className="text-slate-400 mt-1 font-medium">Verify and resolve student password reset requests.</p>
                </div>
                
                <button 
                    onClick={fetchRequests}
                    className="flex items-center gap-2 px-6 py-3 bg-slate-800/50 hover:bg-slate-700 text-slate-300 text-xs font-bold uppercase tracking-widest rounded-2xl transition-all border border-slate-700 active:scale-95 shadow-xl"
                >
                    <FiRefreshCw className={loading ? "animate-spin" : ""} />
                    Refresh Database
                </button>
            </div>

            {error && (
                <div className="mb-8 p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-2xl flex items-center gap-3 text-sm font-bold">
                    <FiAlertCircle size={20} /> {error}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
                <div className="bg-[#0f172a]/40 border border-slate-800 p-5 rounded-3xl">
                    <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-1">Open Tickets</p>
                    <p className="text-2xl font-black text-amber-500">{stats.pending}</p>
                </div>
                <div className="bg-[#0f172a]/40 border border-slate-800 p-5 rounded-3xl">
                    <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-1">Closed Tickets</p>
                    <p className="text-2xl font-black text-emerald-500">{stats.resolved}</p>
                </div>
                <div className="bg-[#0f172a]/40 border border-slate-800 p-5 rounded-3xl">
                    <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-1">Efficiency Rate</p>
                    <p className="text-2xl font-black text-blue-500">
                        {stats.total > 0 ? Math.round((stats.resolved / stats.total) * 100) : 0}%
                    </p>
                </div>
            </div>

            <div className="space-y-4">
                {loading ? (
                    <div className="flex flex-col items-center py-20">
                        <div className="w-10 h-10 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
                        <p className="mt-4 text-slate-500 font-bold uppercase text-[10px] tracking-[0.2em]">Authenticating...</p>
                    </div>
                ) : requests.length === 0 ? (
                    <div className="bg-[#0f172a]/60 border border-dashed border-slate-800 rounded-4xl p-20 text-center">
                        <div className="w-20 h-20 bg-slate-900 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-800">
                            <FiShield className="text-3xl text-slate-700" />
                        </div>
                        <p className="text-slate-400 font-bold">Inbox clear. No pending password resets.</p>
                    </div>
                ) : (
                    requests.map((req) => (
                        <div key={req.id} className="group bg-[#0f172a]/40 hover:bg-[#0f172a]/80 border border-slate-800 hover:border-blue-500/30 p-5 rounded-4xl transition-all duration-300 flex flex-col md:flex-row items-center gap-6 shadow-2xl">
                            <div className="flex items-center gap-5 flex-1 w-full">
                                <div className="w-14 h-14 bg-linear-to-br from-amber-600/20 to-orange-600/10 rounded-2xl flex items-center justify-center text-2xl border border-amber-500/20 group-hover:scale-110 transition-transform">
                                    <FiShield className="text-amber-400" />
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest">{req.full_name}</p>
                                        <span className="w-1 h-1 bg-slate-700 rounded-full"></span>
                                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter">REQ-ID: #{req.id}</p>
                                    </div>
                                    <h3 className="text-white font-bold text-lg leading-tight group-hover:text-blue-100 transition-colors flex items-center gap-2">
                                        <FiMail className="text-slate-500 text-sm" /> {req.email}
                                    </h3>
                                    <div className="flex items-center gap-3 mt-2">
                                        <span className={`flex items-center gap-1.5 text-[9px] px-2.5 py-1 rounded-lg font-black uppercase border shadow-sm ${
                                            req.status === 'resolved' 
                                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                                            : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                                        }`}>
                                            {req.status === 'resolved' ? <FiCheckCircle /> : <FiClock />}
                                            {req.status}
                                        </span>
                                        <span className="text-[9px] text-slate-500 font-bold flex items-center gap-1">
                                            <FiClock /> {new Date(req.requested_at).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="w-full md:w-auto pt-4 md:pt-0 border-t md:border-t-0 border-slate-800/50">
                                {req.status === 'pending' ? (
                                    <button 
                                        onClick={() => handleResolve(req.id)}
                                        className="w-full md:w-auto px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-black uppercase tracking-widest rounded-2xl transition-all shadow-xl shadow-blue-600/20 active:scale-95"
                                    >
                                        Mark as Resolved
                                    </button>
                                ) : (
                                    <div className="px-6 py-3 bg-slate-800/30 text-slate-500 text-[11px] font-black uppercase tracking-widest rounded-2xl border border-slate-800 flex items-center gap-2">
                                        <FiCheckCircle /> Resolved
                                    </div>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default ManageForgotPassword;