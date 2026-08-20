import { useState, useEffect, useCallback } from 'react';
import api from '../../services/api';
import { 
    CheckCircle2, Clock, XCircle, AlertCircle, Search, 
    Filter, Download, ChevronLeft, ChevronRight, Check, X, RefreshCw, Inbox
} from 'lucide-react';

type RequestStatus = 'Pending' | 'Processing' | 'Accepted' | 'Rejected';
type UrgencyLevel = 'Normal' | 'Urgent' | 'Immediate Attention';

interface ServiceRequest {
    id: number;
    student_name: string;
    subject: string;
    message: string;
    status: RequestStatus;
    urgency: UrgencyLevel;
    created_at: string;
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

const ManageRequest = () => {
    const [requests, setRequests] = useState<ServiceRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState<RequestStatus | 'All'>('All');
    const [selectedRequests, setSelectedRequests] = useState<number[]>([]);
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

    const fetchRequests = useCallback(async () => {
        setLoading(true);
        try {
            const response = await api.get('/requests/all');
            const data = response.data;

            if (data?.success && Array.isArray(data.data)) {
                setRequests(data.data);
            } else if (Array.isArray(data)) {
                setRequests(data);
            }
        } catch (error) {
            setToast({ message: "Sync failed with server", type: 'error' });
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchRequests();
    }, [fetchRequests]);

    useEffect(() => {
        if (toast) {
            const timer = setTimeout(() => setToast(null), 3000);
            return () => clearTimeout(timer);
        }
    }, [toast]);

    const handleUpdateStatus = async (requestId: number, newStatus: RequestStatus) => {
        const previousRequests = [...requests];
        setRequests(prev => prev.map(req => req.id === requestId ? { ...req, status: newStatus } : req));

        try {
            const response = await api.put(`/requests/${requestId}/status`, { status: newStatus });

            if (response.data?.success) {
                setToast({ message: `Request #${requestId} set to ${newStatus}`, type: 'success' });
            } else {
                throw new Error("Update failed");
            }
        } catch (error) {
            setRequests(previousRequests);
            setToast({ message: "Failed to update status", type: 'error' });
        }
    };

    const getStatusBadge = (status: RequestStatus) => {
        switch (status) {
            case 'Accepted':
                return <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full"><CheckCircle2 className="w-3 h-3" /> Accepted</span>;
            case 'Rejected':
                return <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-rose-700 bg-rose-50 border border-rose-200 rounded-full"><XCircle className="w-3 h-3" /> Rejected</span>;
            case 'Processing':
                return <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-blue-700 bg-blue-50 border border-blue-200 rounded-full"><Clock className="w-3 h-3" /> Processing</span>;
            default:
                return <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 rounded-full"><AlertCircle className="w-3 h-3" /> Pending</span>;
        }
    };

    const getUrgencyBadge = (urgency: UrgencyLevel) => {
        if (urgency === 'Immediate Attention') return 'text-rose-700 bg-rose-50 border-rose-200';
        if (urgency === 'Urgent') return 'text-amber-700 bg-amber-50 border-amber-200';
        return 'text-slate-600 bg-slate-100 border-slate-200';
    };

    const filteredRequests = requests.filter(req => {
        const matchesSearch = req.student_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
            req.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
            req.message.toLowerCase().includes(searchTerm.toLowerCase());
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

    const pendingCount = requests.filter(r => r.status === 'Pending').length;
    const processingCount = requests.filter(r => r.status === 'Processing').length;
    const acceptedCount = requests.filter(r => r.status === 'Accepted').length;
    const totalCount = requests.length;

    return (
        <div className="space-y-6 max-w-7xl mx-auto">
            
            {/* Toast Notification */}
            {toast && (
                <div className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl shadow-lg border text-xs font-semibold flex items-center gap-2 animate-in fade-in slide-in-from-bottom-3 ${
                    toast.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-rose-50 border-rose-200 text-rose-800'
                }`}>
                    {toast.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <XCircle className="w-4 h-4 text-rose-600" />}
                    <span>{toast.message}</span>
                </div>
            )}

            {/* Top Title & Primary Action Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Service Requests & Inquiries</h1>
                    <p className="text-xs text-slate-500 mt-0.5">Manage, review, and process student service tickets</p>
                </div>

                <div className="flex items-center gap-3">
                    <button 
                        onClick={fetchRequests}
                        disabled={loading}
                        className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold px-4 py-2.5 rounded-lg shadow-xs transition-all flex items-center gap-2"
                    >
                        <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-blue-600' : ''}`} />
                        <span>Refresh Requests</span>
                    </button>

                    <button 
                        onClick={() => alert("Exporting...")}
                        disabled={requests.length === 0}
                        className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2.5 rounded-lg shadow-xs transition-all flex items-center gap-2 disabled:opacity-50"
                    >
                        <Download className="w-4 h-4" />
                        <span>Export CSV</span>
                    </button>
                </div>
            </div>

            {/* Status Metric Cards Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {/* Pending */}
                <div 
                    onClick={() => setFilterStatus(filterStatus === 'Pending' ? 'All' : 'Pending')}
                    className={`bg-white rounded-2xl border p-5 text-center flex flex-col items-center justify-center cursor-pointer transition-all duration-200 hover:shadow-md ${
                        filterStatus === 'Pending' ? 'border-amber-400 ring-2 ring-amber-400/20 shadow-md' : 'border-slate-100 shadow-xs'
                    }`}
                >
                    <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center mb-2.5">
                        <Clock className="w-5 h-5" />
                    </div>
                    <span className="text-[11px] font-extrabold text-slate-400 tracking-wider uppercase mb-1">
                        PENDING
                    </span>
                    <span className="text-3xl font-black text-slate-800">
                        {pendingCount}
                    </span>
                </div>

                {/* Processing */}
                <div 
                    onClick={() => setFilterStatus(filterStatus === 'Processing' ? 'All' : 'Processing')}
                    className={`bg-white rounded-2xl border p-5 text-center flex flex-col items-center justify-center cursor-pointer transition-all duration-200 hover:shadow-md ${
                        filterStatus === 'Processing' ? 'border-blue-400 ring-2 ring-blue-400/20 shadow-md' : 'border-slate-100 shadow-xs'
                    }`}
                >
                    <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center mb-2.5">
                        <RefreshCw className="w-5 h-5" />
                    </div>
                    <span className="text-[11px] font-extrabold text-slate-400 tracking-wider uppercase mb-1">
                        PROCESSING
                    </span>
                    <span className="text-3xl font-black text-slate-800">
                        {processingCount}
                    </span>
                </div>

                {/* Accepted */}
                <div 
                    onClick={() => setFilterStatus(filterStatus === 'Accepted' ? 'All' : 'Accepted')}
                    className={`bg-white rounded-2xl border p-5 text-center flex flex-col items-center justify-center cursor-pointer transition-all duration-200 hover:shadow-md ${
                        filterStatus === 'Accepted' ? 'border-emerald-400 ring-2 ring-emerald-400/20 shadow-md' : 'border-slate-100 shadow-xs'
                    }`}
                >
                    <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-500 flex items-center justify-center mb-2.5">
                        <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <span className="text-[11px] font-extrabold text-slate-400 tracking-wider uppercase mb-1">
                        ACCEPTED
                    </span>
                    <span className="text-3xl font-black text-slate-800">
                        {acceptedCount}
                    </span>
                </div>

                {/* Total Requests */}
                <div 
                    onClick={() => setFilterStatus('All')}
                    className={`bg-white rounded-2xl border p-5 text-center flex flex-col items-center justify-center cursor-pointer transition-all duration-200 hover:shadow-md ${
                        filterStatus === 'All' ? 'border-purple-400 ring-2 ring-purple-400/20 shadow-md' : 'border-slate-100 shadow-xs'
                    }`}
                >
                    <div className="w-11 h-11 rounded-xl bg-purple-50 text-purple-500 flex items-center justify-center mb-2.5">
                        <Inbox className="w-5 h-5" />
                    </div>
                    <span className="text-[11px] font-extrabold text-slate-400 tracking-wider uppercase mb-1">
                        TOTAL REQUESTS
                    </span>
                    <span className="text-3xl font-black text-slate-800">
                        {totalCount}
                    </span>
                </div>
            </div>

            {/* Filter & Control Bar (Automoor Style) */}
            <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
                
                {/* Left Filter Pill Buttons */}
                <div className="flex flex-wrap items-center gap-2">
                    <div className="relative">
                        <select 
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value as RequestStatus | 'All')}
                            className="appearance-none bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 pr-8 text-xs font-medium text-slate-700 outline-none focus:border-blue-500 cursor-pointer"
                        >
                            <option value="All">Status: All Requests</option>
                            <option value="Pending">Pending</option>
                            <option value="Processing">Processing</option>
                            <option value="Accepted">Accepted</option>
                            <option value="Rejected">Rejected</option>
                        </select>
                        <Filter className="w-3 h-3 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>

                    <button className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 transition-all flex items-center gap-1.5">
                        <span>Submitted Date</span>
                        <span className="text-slate-400">▾</span>
                    </button>
                </div>

                {/* Right Search Input */}
                <div className="relative w-full sm:w-64">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input 
                        type="text"
                        placeholder="Search requester or subject..."
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
                        Synchronizing service requests...
                    </div>
                ) : filteredRequests.length === 0 ? (
                    <div className="py-16 text-center text-slate-500 text-xs font-medium">
                        No service requests found.
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
                                    <th className="py-3 px-4">Subject & Message ↕</th>
                                    <th className="py-3 px-4">Priority ↕</th>
                                    <th className="py-3 px-4">Status ↕</th>
                                    <th className="py-3 px-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                                {filteredRequests.map((req) => {
                                    const avatarStyle = getAvatarStyle(req.id);
                                    const initials = getInitials(req.student_name);
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
                                                            alt={req.student_name} 
                                                            className="w-8 h-8 rounded-full object-cover border border-slate-200 shrink-0 shadow-xs" 
                                                        />
                                                    ) : (
                                                        <div className={`w-8 h-8 rounded-full border flex items-center justify-center font-bold text-xs shrink-0 ${avatarStyle}`}>
                                                            {initials}
                                                        </div>
                                                    )}
                                                    <div>
                                                        <p className="font-bold text-slate-900 leading-tight">{req.student_name}</p>
                                                        <p className="text-[10px] text-slate-400 font-mono">Req ID: #{req.id}</p>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Subject & Message */}
                                            <td className="py-3.5 px-4 max-w-xs">
                                                <p className="font-semibold text-slate-900 leading-snug">{req.subject}</p>
                                                <p className="text-slate-500 text-[11px] line-clamp-1 mt-0.5">"{req.message}"</p>
                                            </td>

                                            {/* Priority */}
                                            <td className="py-3.5 px-4">
                                                <span className={`inline-block px-2.5 py-0.5 text-[10px] font-semibold border rounded-full ${getUrgencyBadge(req.urgency)}`}>
                                                    {req.urgency}
                                                </span>
                                            </td>

                                            {/* Status */}
                                            <td className="py-3.5 px-4">
                                                {getStatusBadge(req.status)}
                                            </td>

                                            {/* Action Buttons */}
                                            <td className="py-3.5 px-4 text-right">
                                                <div className="flex items-center justify-end gap-1.5">
                                                    {req.status !== 'Accepted' && (
                                                        <button 
                                                            onClick={() => handleUpdateStatus(req.id, 'Accepted')}
                                                            className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-50 hover:bg-emerald-600 text-emerald-700 hover:text-white border border-emerald-200 hover:border-emerald-600 rounded-md text-[11px] font-semibold transition-all shadow-xs"
                                                            title="Accept Request"
                                                        >
                                                            <Check className="w-3 h-3" />
                                                            <span>Accept</span>
                                                        </button>
                                                    )}
                                                    {req.status !== 'Rejected' && (
                                                        <button 
                                                            onClick={() => handleUpdateStatus(req.id, 'Rejected')}
                                                            className="inline-flex items-center gap-1 px-2 py-1 bg-rose-50 hover:bg-rose-600 text-rose-700 hover:text-white border border-rose-200 hover:border-rose-600 rounded-md text-[11px] font-semibold transition-all shadow-xs"
                                                            title="Reject Request"
                                                        >
                                                            <X className="w-3 h-3" />
                                                            <span>Reject</span>
                                                        </button>
                                                    )}
                                                    {req.status !== 'Processing' && (
                                                        <button 
                                                            onClick={() => handleUpdateStatus(req.id, 'Processing')}
                                                            className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 hover:bg-blue-600 text-blue-700 hover:text-white border border-blue-200 hover:border-blue-600 rounded-md text-[11px] font-semibold transition-all shadow-xs"
                                                            title="Mark Processing"
                                                        >
                                                            <Clock className="w-3 h-3" />
                                                            <span>Process</span>
                                                        </button>
                                                    )}
                                                </div>
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
                        <span>out of {filteredRequests.length} service requests</span>
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

export default ManageRequest;