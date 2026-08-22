import { useState, useEffect, useCallback } from 'react';
import api from '../../services/api';
import { 
    Mail, RefreshCw, CheckCircle2, Clock, 
    AlertCircle, Search, Filter, Download, ChevronLeft, ChevronRight, KeyRound 
} from 'lucide-react';

interface ForgotPasswordRequest {
    id: number;
    full_name: string;
    email: string;
    requested_at: string;
    status: 'pending' | 'resolved';
    profile_pic?: string;
}

const getFullPicUrl = (path?: string) => {
    if (!path) return '';
    if (path.startsWith('http://') || path.startsWith('https://')) return path;
    return `http://localhost:5000${path}`;
};

const pastelAvatarStyles = [
    'bg-purple-100 text-purple-700 border-purple-200',
    'bg-blue-100 text-blue-700 border-blue-200',
    'bg-pink-100 text-pink-700 border-pink-200',
    'bg-emerald-100 text-emerald-700 border-emerald-200',
    'bg-amber-100 text-amber-700 border-amber-200',
    'bg-rose-100 text-rose-700 border-rose-200',
    'bg-indigo-100 text-indigo-700 border-indigo-200',
];
const getAvatarStyle = (id: number) => pastelAvatarStyles[id % pastelAvatarStyles.length];

const getInitials = (name?: string) => {
    if (!name) return 'UN';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name.slice(0, 2).toUpperCase();
};

const ManageForgotPassword = () => {
    const [requests, setRequests] = useState<ForgotPasswordRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState<string>('All');
    const [selectedRequests, setSelectedRequests] = useState<number[]>([]);
    const [error, setError] = useState<string | null>(null);

    const fetchRequests = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await api.get('/auth/forgot-password-requests');
            const data = Array.isArray(response.data) ? response.data : (response.data?.data || []);
            setRequests(data);
        } catch {
            setError("Could not load recovery requests. Check server connection.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchRequests();
    }, [fetchRequests]);

    const handleResolve = async (id: number) => {
        try {
            await api.put(`/auth/resolve-password/${id}`);
            setRequests(prev => 
                prev.map(req => req.id === id ? { ...req, status: 'resolved' } : req)
            );
        } catch {
            alert("Failed to mark as resolved.");
        }
    };

    const getStatusBadge = (status: string) => {
        if (status === 'resolved') {
            return <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full"><CheckCircle2 className="w-3 h-3" /> Resolved</span>;
        }
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 rounded-full"><Clock className="w-3 h-3" /> Pending</span>;
    };

    const filteredRequests = requests.filter(req => {
        const matchesSearch = req.full_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
            req.email.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus === 'All' || req.status === filterStatus;
        return matchesSearch && matchesStatus;
    });

    const toggleSelectAll = () => {
        if (selectedRequests.length === filteredRequests.length) {
            setSelectedRequests([]);
        } else {
            setSelectedRequests(filteredRequests.map(r => r.id));
        }
    };

    const toggleSelectReq = (id: number) => {
        if (selectedRequests.includes(id)) {
            setSelectedRequests(prev => prev.filter(item => item !== id));
        } else {
            setSelectedRequests(prev => [...prev, id]);
        }
    };

    const pendingCount = requests.filter(r => r.status === 'pending').length;
    const resolvedCount = requests.filter(r => r.status === 'resolved').length;
    const totalCount = requests.length;

    return (
        <div className="space-y-6 max-w-7xl mx-auto">
            
            {/* Top Title & Primary Action Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Password Reset Queue</h1>
                    <p className="text-xs text-slate-500 mt-0.5">Manage and resolve intern account password recovery tickets</p>
                </div>

                <div className="flex items-center gap-3">
                    <button 
                        onClick={fetchRequests}
                        disabled={loading}
                        className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold px-4 py-2.5 rounded-lg shadow-xs transition-all flex items-center gap-2"
                    >
                        <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-blue-600' : ''}`} />
                        <span>Refresh Queue</span>
                    </button>

                    <button 
                        onClick={() => alert("Exporting password reset logs...")} 
                        className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2.5 rounded-lg shadow-xs transition-all flex items-center gap-2"
                    >
                        <Download className="w-4 h-4" />
                        <span>Export Tickets</span>
                    </button>
                </div>
            </div>

            {/* Status Metric Cards Grid with Light Earth Tone Colors */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Pending */}
                <div 
                    onClick={() => setFilterStatus(filterStatus === 'pending' ? 'All' : 'pending')}
                    className={`rounded-2xl border p-5 text-center flex flex-col items-center justify-center cursor-pointer transition-all duration-200 hover:shadow-xs active:scale-98 bg-[#fcf8f1] ${
                        filterStatus === 'pending' ? 'border-[#996825] ring-2 ring-[#996825]/20 shadow-xs' : 'border-[#f5e6d2] hover:border-[#e6cb9f]'
                    }`}
                >
                    <div className="w-11 h-11 rounded-xl bg-[#f8ead7] border border-[#edd6b6] text-[#996825] flex items-center justify-center mb-2.5">
                        <Clock className="w-5 h-5" />
                    </div>
                    <span className="text-[11px] font-extrabold text-[#946e38] tracking-wider uppercase mb-1">
                        PENDING TICKETS
                    </span>
                    <span className="text-3xl font-black text-[#6e4614]">
                        {pendingCount}
                    </span>
                </div>

                {/* Resolved */}
                <div 
                    onClick={() => setFilterStatus(filterStatus === 'resolved' ? 'All' : 'resolved')}
                    className={`rounded-2xl border p-5 text-center flex flex-col items-center justify-center cursor-pointer transition-all duration-200 hover:shadow-xs active:scale-98 bg-[#f2f6f3] ${
                        filterStatus === 'resolved' ? 'border-[#2d4a34] ring-2 ring-[#2d4a34]/20 shadow-xs' : 'border-[#d4e2d6] hover:border-[#b0c7b3]'
                    }`}
                >
                    <div className="w-11 h-11 rounded-xl bg-[#e0ece2] border border-[#c0d6c3] text-[#2d4a34] flex items-center justify-center mb-2.5">
                        <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <span className="text-[11px] font-extrabold text-[#486650] tracking-wider uppercase mb-1">
                        RESOLVED TICKETS
                    </span>
                    <span className="text-3xl font-black text-[#243c2a]">
                        {resolvedCount}
                    </span>
                </div>

                {/* Total */}
                <div 
                    onClick={() => setFilterStatus('All')}
                    className={`rounded-2xl border p-5 text-center flex flex-col items-center justify-center cursor-pointer transition-all duration-200 hover:shadow-xs active:scale-98 bg-[#f6f4f8] ${
                        filterStatus === 'All' ? 'border-[#59516e] ring-2 ring-[#59516e]/20 shadow-xs' : 'border-[#e4dfed] hover:border-[#c7bed8]'
                    }`}
                >
                    <div className="w-11 h-11 rounded-xl bg-[#eae5f3] border border-[#d6cdcf] text-[#59516e] flex items-center justify-center mb-2.5">
                        <KeyRound className="w-5 h-5" />
                    </div>
                    <span className="text-[11px] font-extrabold text-[#645b7d] tracking-wider uppercase mb-1">
                        TOTAL REQUESTS
                    </span>
                    <span className="text-3xl font-black text-[#3c364c]">
                        {totalCount}
                    </span>
                </div>
            </div>

            {error && (
                <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl flex items-center gap-2.5 text-xs font-semibold">
                    <AlertCircle className="w-4 h-4" /> {error}
                </div>
            )}

            {/* Filter & Control Bar (Automoor Style) */}
            <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
                
                {/* Left Filter Pill Buttons */}
                <div className="flex flex-wrap items-center gap-2">
                    <div className="relative">
                        <select 
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="appearance-none bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 pr-8 text-xs font-medium text-slate-700 outline-none focus:border-blue-500 cursor-pointer"
                        >
                            <option value="All">Status: All Tickets</option>
                            <option value="pending">Pending</option>
                            <option value="resolved">Resolved</option>
                        </select>
                        <Filter className="w-3 h-3 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>

                    <button className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 transition-all flex items-center gap-1.5">
                        <span>Requested Date</span>
                        <span className="text-slate-400">▾</span>
                    </button>
                </div>

                {/* Right Search Input */}
                <div className="relative w-full sm:w-64">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input 
                        type="text"
                        placeholder="Search student or email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 outline-none focus:bg-white focus:border-blue-500 transition-all"
                    />
                </div>
            </div>

            {/* SaaS Table Container */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
                {loading ? (
                    <div className="py-20 text-center text-slate-400 text-xs font-medium animate-pulse">
                        Synchronizing security tickets...
                    </div>
                ) : filteredRequests.length === 0 ? (
                    <div className="py-16 text-center text-slate-500 text-xs font-medium">
                        No password reset tickets found.
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                                    <th className="py-3 px-4 w-10 text-center">
                                        <input 
                                            type="checkbox"
                                            checked={selectedRequests.length === filteredRequests.length && filteredRequests.length > 0}
                                            onChange={toggleSelectAll}
                                            className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                        />
                                    </th>
                                    <th className="py-3 px-4">Student Requester ↕</th>
                                    <th className="py-3 px-4">Email Address ↕</th>
                                    <th className="py-3 px-4">Requested Date ↕</th>
                                    <th className="py-3 px-4">Ticket Status ↕</th>
                                    <th className="py-3 px-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                                {filteredRequests.map((req) => {
                                    const avatarStyle = getAvatarStyle(req.id);
                                    const initials = getInitials(req.full_name);
                                    const isChecked = selectedRequests.includes(req.id);

                                    return (
                                        <tr key={req.id} className={`hover:bg-slate-50/80 transition-colors ${isChecked ? 'bg-blue-50/30' : ''}`}>
                                            <td className="py-3.5 px-4 text-center">
                                                <input 
                                                    type="checkbox"
                                                    checked={isChecked}
                                                    onChange={() => toggleSelectReq(req.id)}
                                                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                                />
                                            </td>
                                            
                                            {/* Student Column with Photo or Pastel Initial Avatar */}
                                            <td className="py-3.5 px-4">
                                                <div className="flex items-center gap-3">
                                                    {req.profile_pic ? (
                                                        <img 
                                                            src={getFullPicUrl(req.profile_pic)} 
                                                            alt={req.full_name} 
                                                            className="w-8 h-8 rounded-full object-cover border border-slate-200 shrink-0 shadow-xs" 
                                                        />
                                                    ) : (
                                                        <div className={`w-8 h-8 rounded-full border flex items-center justify-center font-bold text-xs shrink-0 ${avatarStyle}`}>
                                                            {initials}
                                                        </div>
                                                    )}
                                                    <div>
                                                        <p className="font-bold text-slate-900 leading-tight">{req.full_name}</p>
                                                        <p className="text-[10px] text-slate-400 font-mono">Ticket ID: #{req.id}</p>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Email */}
                                            <td className="py-3.5 px-4 font-mono text-slate-700">
                                                <div className="flex items-center gap-2">
                                                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                                                    <span>{req.email}</span>
                                                </div>
                                            </td>

                                            {/* Requested Date */}
                                            <td className="py-3.5 px-4 font-mono text-slate-600">
                                                {new Date(req.requested_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                            </td>

                                            {/* Status */}
                                            <td className="py-3.5 px-4">
                                                {getStatusBadge(req.status)}
                                            </td>

                                            {/* Actions */}
                                            <td className="py-3.5 px-4 text-right">
                                                {req.status === 'pending' ? (
                                                    <button 
                                                        onClick={() => handleResolve(req.id)}
                                                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold transition-all shadow-xs"
                                                    >
                                                        Mark Resolved
                                                    </button>
                                                ) : (
                                                    <span className="text-[11px] font-semibold text-slate-400 italic">Resolved</span>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Table Footer Pagination */}
                <div className="bg-slate-50/50 border-t border-slate-200 px-4 py-3 flex items-center justify-between text-xs text-slate-500">
                    <div className="flex items-center gap-2">
                        <span>Displaying</span>
                        <select className="bg-white border border-slate-200 rounded px-2 py-1 text-xs text-slate-700 outline-none">
                            <option value="10">10</option>
                            <option value="20">20</option>
                            <option value="50">50</option>
                        </select>
                        <span>out of {filteredRequests.length} tickets</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                        <button className="p-1 rounded border border-slate-200 hover:bg-white disabled:opacity-50" disabled>
                            <ChevronLeft className="w-3.5 h-3.5 text-slate-600" />
                        </button>
                        <button className="px-2.5 py-1 rounded bg-blue-600 text-white font-semibold text-xs">1</button>
                        <button className="p-1 rounded border border-slate-200 hover:bg-white disabled:opacity-50" disabled>
                            <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ManageForgotPassword;