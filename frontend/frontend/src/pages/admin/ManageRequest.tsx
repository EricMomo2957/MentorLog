import { useState, useEffect, useCallback } from 'react';

type RequestStatus = 'Pending' | 'Processing' | 'Accepted' | 'Rejected';

interface ServiceRequest {
    id: number;
    student_name: string;
    subject: string;
    message: string;
    status: RequestStatus;
    created_at: string;
}

const ManageRequest = () => {
    const REQUEST_API_URL = 'http://localhost:5000/api/requests'; 
    const [requests, setRequests] = useState<ServiceRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<RequestStatus | 'All'>('All');
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

    // Toast Timer
    useEffect(() => {
        if (toast) {
            const timer = setTimeout(() => setToast(null), 3000);
            return () => clearTimeout(timer);
        }
    }, [toast]);

    const fetchRequests = useCallback(async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            setToast({ message: "No authentication token found", type: 'error' });
            return;
        }

        setLoading(true);
        try {
            const response = await fetch(`${REQUEST_API_URL}/all`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (Array.isArray(data)) {
                setRequests(data);
            }
        } catch (error) {
            console.error("Error fetching requests:", error);
            setToast({ message: "Failed to load requests", type: 'error' });
        } finally {
            setLoading(false);
        }
    }, [REQUEST_API_URL]);

    useEffect(() => {
        fetchRequests();
    }, [fetchRequests]);

    const handleUpdateStatus = async (requestId: number, newStatus: RequestStatus) => {
        const token = localStorage.getItem('token');
        try {
            const response = await fetch(`${REQUEST_API_URL}/${requestId}/status`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ status: newStatus })
            });

            if (response.ok) {
                // Optimized UI: Update local state immediately
                setRequests(prev => prev.map(req => 
                    req.id === requestId ? { ...req, status: newStatus } : req
                ));
                setToast({ message: `Request successfully marked as ${newStatus}`, type: 'success' });
            } else {
                const errorData = await response.json();
                setToast({ message: errorData.message || "Update failed", type: 'error' });
            }
        } catch (error) {
            console.error("Update failed:", error);
            setToast({ message: "Network error occurred", type: 'error' });
        }
    };

    const getStatusStyle = (status: RequestStatus) => {
        switch (status) {
            case 'Accepted': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
            case 'Processing': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
            case 'Rejected': return 'bg-red-500/10 text-red-500 border-red-500/20';
            default: return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
        }
    };

    const filteredRequests = requests.filter(req => filter === 'All' || req.status === filter);

    return (
        <div className="max-w-6xl mx-auto p-6 space-y-6 pb-20">
            {/* Toast Notification */}
            {toast && (
                <div className={`fixed top-5 right-5 z-50 px-6 py-3 rounded-2xl shadow-xl border transition-all animate-in fade-in slide-in-from-top-4 ${
                    toast.type === 'success' ? 'bg-emerald-500/10 border-emerald-500 text-emerald-500' : 'bg-red-500/10 border-red-500 text-red-500'
                }`}>
                    <p className="font-bold flex items-center gap-2">
                        {toast.type === 'success' ? '✅' : '❌'} {toast.message}
                    </p>
                </div>
            )}

            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-[#1e293b] p-8 rounded-3xl border border-slate-800 shadow-xl">
                <div>
                    <h1 className="text-3xl font-black text-white italic tracking-tight">
                        MANAGE <span className="text-blue-500">REQUESTS</span>
                    </h1>
                    <p className="text-slate-400 text-sm font-mono uppercase tracking-widest mt-1">
                        Control Center / Inquiries
                    </p>
                </div>
                
                <div className="flex flex-wrap gap-2 bg-slate-900/50 p-1 rounded-2xl border border-slate-800">
                    {(['All', 'Pending', 'Processing', 'Accepted', 'Rejected'] as const).map((s) => (
                        <button
                            key={s}
                            onClick={() => setFilter(s)}
                            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                                filter === s 
                                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' 
                                : 'text-slate-500 hover:text-slate-300'
                            }`}
                        >
                            {s}
                        </button>
                    ))}
                </div>
            </div>

            {/* Content Section */}
            <div className="grid gap-4">
                {loading ? (
                    <div className="bg-[#1e293b] rounded-3xl border border-slate-800 p-20 text-center">
                        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-500 border-r-transparent align-[-0.125em]"></div>
                        <p className="mt-4 text-slate-500 font-mono text-sm uppercase tracking-widest">Synchronizing Data...</p>
                    </div>
                ) : filteredRequests.length > 0 ? (
                    filteredRequests.map((req) => (
                        <div key={req.id} className="bg-[#1e293b] border border-slate-800 p-6 rounded-3xl hover:border-slate-600 transition-all group shadow-lg">
                            <div className="flex flex-col md:flex-row justify-between gap-6">
                                <div className="space-y-3 flex-1">
                                    <div className="flex items-center gap-3">
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${getStatusStyle(req.status)}`}>
                                            {req.status}
                                        </span>
                                        <h3 className="text-white font-bold text-xl tracking-tight">{req.subject}</h3>
                                    </div>
                                    <div className="bg-slate-900/40 p-4 rounded-2xl border border-slate-800/50">
                                        <p className="text-slate-300 text-sm leading-relaxed italic">"{req.message}"</p>
                                    </div>
                                    <div className="flex items-center gap-4 text-slate-500 text-[10px] font-black uppercase tracking-[0.15em]">
                                        <span className="flex items-center gap-1.5"><span className="text-blue-500">👤</span> {req.student_name}</span>
                                        <span className="flex items-center gap-1.5"><span className="text-blue-500">📅</span> {new Date(req.created_at).toLocaleDateString()}</span>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex flex-row md:flex-col justify-end gap-2 shrink-0">
                                    <button 
                                        disabled={req.status === 'Processing'}
                                        onClick={() => handleUpdateStatus(req.id, 'Processing')}
                                        className="flex-1 md:flex-none px-5 py-2.5 rounded-xl bg-blue-600/10 text-blue-400 border border-blue-600/30 font-bold text-xs hover:bg-blue-600 hover:text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                                    >
                                        ⚙️ Process
                                    </button>
                                    <button 
                                        disabled={req.status === 'Accepted'}
                                        onClick={() => handleUpdateStatus(req.id, 'Accepted')}
                                        className="flex-1 md:flex-none px-5 py-2.5 rounded-xl bg-emerald-600/10 text-emerald-400 border border-emerald-600/30 font-bold text-xs hover:bg-emerald-600 hover:text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                                    >
                                        ✅ Accept
                                    </button>
                                    <button 
                                        disabled={req.status === 'Rejected'}
                                        onClick={() => handleUpdateStatus(req.id, 'Rejected')}
                                        className="flex-1 md:flex-none px-5 py-2.5 rounded-xl bg-red-600/10 text-red-400 border border-red-600/30 font-bold text-xs hover:bg-red-600 hover:text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                                    >
                                        ❌ Reject
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="bg-[#1e293b] rounded-3xl border border-slate-800 p-20 text-center shadow-inner">
                        <p className="text-slate-600 font-mono text-sm italic">No {filter !== 'All' ? filter.toLowerCase() : ''} requests found.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ManageRequest;