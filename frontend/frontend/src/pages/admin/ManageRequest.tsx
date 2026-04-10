import { useState, useEffect, useCallback } from 'react';

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
}

const ManageRequest = () => {
    const REQUEST_API_URL = 'http://localhost:5000/api/requests'; 
    const [requests, setRequests] = useState<ServiceRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<RequestStatus | 'All'>('All');
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

    const fetchRequests = useCallback(async () => {
        const token = localStorage.getItem('token');
        setLoading(true);
        try {
            const response = await fetch(`${REQUEST_API_URL}/all`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();

            if (data.success && Array.isArray(data.data)) {
                setRequests(data.data);
            } else if (Array.isArray(data)) {
                setRequests(data);
            }
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (error) {
            setToast({ message: "Sync failed with server", type: 'error' });
        } finally {
            setLoading(false);
        }
    }, [REQUEST_API_URL]);

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
        const token = localStorage.getItem('token');
        
        // Optimistic UI update (makes the app feel faster)
        const previousRequests = [...requests];
        setRequests(prev => prev.map(req => req.id === requestId ? { ...req, status: newStatus } : req));

        try {
            const response = await fetch(`${REQUEST_API_URL}/${requestId}/status`, {
                method: 'PATCH',
                headers: { 
                    'Content-Type': 'application/json', 
                    'Authorization': `Bearer ${token}` 
                },
                body: JSON.stringify({ status: newStatus })
            });

            const data = await response.json();

            if (response.ok && data.success) {
                setToast({ message: `Request #${requestId} is now ${newStatus}`, type: 'success' });
            } else {
                throw new Error("Update failed");
            }
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (error) {
            // Revert UI if server fails
            setRequests(previousRequests);
            setToast({ message: "Failed to update student status", type: 'error' });
        }
    };

    const getUrgencyColor = (urgency: UrgencyLevel) => {
        if (urgency === 'Immediate Attention') return 'text-red-500 border-red-500/20 bg-red-500/5';
        if (urgency === 'Urgent') return 'text-amber-500 border-amber-500/20 bg-amber-500/5';
        return 'text-slate-400 border-slate-700 bg-slate-800/50';
    };

    const filteredRequests = requests.filter(req => filter === 'All' || req.status === filter);

    return (
        <div className="max-w-7xl mx-auto p-4 md:p-8 animate-in fade-in duration-500">
            {/* Notification Toast */}
            {toast && (
                <div className={`fixed bottom-10 right-10 z-50 px-6 py-4 rounded-xl shadow-2xl border animate-in slide-in-from-bottom-5 transition-all ${
                    toast.type === 'success' ? 'bg-emerald-950 border-emerald-500 text-emerald-400' : 'bg-red-950 border-red-500 text-red-400'
                }`}>
                    <p className="text-xs font-black uppercase tracking-widest flex items-center gap-2">
                        {toast.type === 'success' ? '✓' : '✕'} {toast.message}
                    </p>
                </div>
            )}

            {/* Header Section */}
            <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-800 pb-8">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <span className="h-2 w-2 bg-blue-500 rounded-full animate-pulse"></span>
                        <span className="text-[10px] font-black text-blue-500 uppercase tracking-[0.3em]">Administrator Mode</span>
                    </div>
                    <h1 className="text-4xl font-black text-white tracking-tighter uppercase italic">Student <span className="text-slate-500">Inquiries</span></h1>
                </div>

                {/* Filter Bar */}
                <div className="flex flex-wrap bg-slate-900/80 p-1.5 rounded-xl border border-slate-800 gap-1">
                    {(['All', 'Pending', 'Processing', 'Accepted', 'Rejected'] as const).map((s) => (
                        <button
                            key={s}
                            onClick={() => setFilter(s)}
                            className={`px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${
                                filter === s ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-slate-500 hover:text-white hover:bg-slate-800'
                            }`}
                        >
                            {s}
                        </button>
                    ))}
                </div>
            </div>

            {/* Request List */}
            <div className="space-y-6">
                {loading ? (
                    <div className="py-20 text-center space-y-4">
                        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                        <p className="text-slate-600 font-mono text-xs uppercase tracking-widest">Fetching Student Ledger...</p>
                    </div>
                ) : filteredRequests.length > 0 ? (
                    filteredRequests.map((req) => (
                        <div key={req.id} className="bg-[#1e293b] rounded-2xl border border-slate-800/50 overflow-hidden hover:border-blue-500/30 transition-all group">
                            <div className="grid grid-cols-1 lg:grid-cols-12">
                                
                                {/* Info Column */}
                                <div className="lg:col-span-3 p-6 border-b lg:border-b-0 lg:border-r border-slate-800 bg-slate-900/20 flex flex-col justify-between">
                                    <div>
                                        <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-2">Status & Priority</span>
                                        <div className={`px-3 py-2 rounded-lg text-[9px] font-black text-center border uppercase tracking-widest mb-3 ${getUrgencyColor(req.urgency)}`}>
                                            {req.urgency}
                                        </div>
                                        <div className={`text-[10px] font-bold uppercase tracking-tighter flex items-center gap-2 ${
                                            req.status === 'Accepted' ? 'text-emerald-500' : 
                                            req.status === 'Rejected' ? 'text-red-500' : 'text-blue-400'
                                        }`}>
                                            <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                                            {req.status}
                                        </div>
                                    </div>
                                    <div className="mt-4 pt-4 border-t border-slate-800/50">
                                        <span className="text-[9px] font-black text-slate-500 uppercase block mb-1">Assigned Student</span>
                                        <p className="text-white text-xs font-bold truncate">{req.student_name}</p>
                                    </div>
                                </div>

                                {/* Message Content */}
                                <div className="lg:col-span-6 p-6 space-y-4">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-white font-black text-xl uppercase tracking-tight">{req.subject}</h3>
                                        <span className="text-[10px] text-slate-600 font-mono bg-slate-900 px-2 py-1 rounded">ID: #{req.id}</span>
                                    </div>
                                    <div className="bg-[#0f172a] p-5 rounded-xl border border-slate-800/50">
                                        <p className="text-slate-400 text-sm leading-relaxed font-medium italic">
                                            "{req.message}"
                                        </p>
                                    </div>
                                    <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">
                                        Submitted on: {new Date(req.created_at).toLocaleString()}
                                    </p>
                                </div>

                                {/* Actions (Sending Status to Student) */}
                                <div className="lg:col-span-3 p-6 bg-slate-900/40 flex flex-col justify-center gap-3 border-t lg:border-t-0 lg:border-l border-slate-800">
                                    <span className="text-[9px] font-black text-slate-500 uppercase text-center mb-1 tracking-widest">Update Student</span>
                                    
                                    <button 
                                        onClick={() => handleUpdateStatus(req.id, 'Processing')}
                                        disabled={req.status === 'Processing'}
                                        className="w-full py-3 rounded-xl bg-slate-800 border border-slate-700 text-blue-400 text-[10px] font-black uppercase tracking-[0.2em] hover:bg-blue-600 hover:text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                                    >
                                        Mark Processing
                                    </button>

                                    <div className="grid grid-cols-2 gap-3">
                                        <button 
                                            onClick={() => handleUpdateStatus(req.id, 'Accepted')}
                                            disabled={req.status === 'Accepted'}
                                            className="py-3 rounded-xl bg-slate-800 border border-slate-700 text-emerald-500 text-[10px] font-black uppercase tracking-[0.2em] hover:bg-emerald-600 hover:text-white transition-all disabled:opacity-30"
                                        >
                                            Accept
                                        </button>
                                        <button 
                                            onClick={() => handleUpdateStatus(req.id, 'Rejected')}
                                            disabled={req.status === 'Rejected'}
                                            className="py-3 rounded-xl bg-slate-800 border border-slate-700 text-red-500 text-[10px] font-black uppercase tracking-[0.2em] hover:bg-red-600 hover:text-white transition-all disabled:opacity-30"
                                        >
                                            Reject
                                        </button>
                                    </div>
                                </div>

                            </div>
                        </div>
                    ))
                ) : (
                    <div className="border-2 border-dashed border-slate-800 py-32 rounded-4xl text-center">
                        <div className="mb-4 text-4xl">📁</div>
                        <p className="text-slate-600 font-black uppercase tracking-[0.4em] text-xs">No student requests found in this category</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ManageRequest;