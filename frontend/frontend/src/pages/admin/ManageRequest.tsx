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
            if (Array.isArray(data)) setRequests(data);
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (error) {
            setToast({ message: "Sync failed", type: 'error' });
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchRequests(); }, [fetchRequests]);

    const handleUpdateStatus = async (requestId: number, newStatus: RequestStatus) => {
        const token = localStorage.getItem('token');
        try {
            const response = await fetch(`${REQUEST_API_URL}/${requestId}/status`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ status: newStatus })
            });
            if (response.ok) {
                setRequests(prev => prev.map(req => req.id === requestId ? { ...req, status: newStatus } : req));
                setToast({ message: `Status updated to ${newStatus}`, type: 'success' });
            }
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (error) {
            setToast({ message: "Update failed", type: 'error' });
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
            {/* Toast Notification */}
            {toast && (
                <div className="fixed bottom-10 right-10 z-50 bg-[#0f172a] border border-slate-700 px-6 py-4 rounded-xl shadow-2xl animate-bounce">
                    <p className={`text-xs font-black uppercase tracking-widest ${toast.type === 'success' ? 'text-emerald-400' : 'text-red-400'}`}>
                        {toast.message}
                    </p>
                </div>
            )}

            {/* Form Header */}
            <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-800 pb-8">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <span className="h-2 w-2 bg-blue-500 rounded-full"></span>
                        <span className="text-[10px] font-black text-blue-500 uppercase tracking-[0.3em]">System Admin</span>
                    </div>
                    <h1 className="text-4xl font-black text-white tracking-tighter uppercase italic">Request <span className="text-slate-500">Ledger</span></h1>
                </div>

                <div className="flex bg-slate-900/80 p-1 rounded-lg border border-slate-800">
                    {(['All', 'Pending', 'Processing', 'Accepted', 'Rejected'] as const).map((s) => (
                        <button
                            key={s}
                            onClick={() => setFilter(s)}
                            className={`px-4 py-2 rounded-md text-[10px] font-bold uppercase tracking-widest transition-all ${
                                filter === s ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-slate-500 hover:text-white'
                            }`}
                        >
                            {s}
                        </button>
                    ))}
                </div>
            </div>

            {/* The "Form-Style" Table */}
            <div className="space-y-4">
                {loading ? (
                    <div className="py-20 text-center text-slate-600 font-mono text-xs uppercase tracking-widest animate-pulse">Accessing Database...</div>
                ) : filteredRequests.length > 0 ? (
                    filteredRequests.map((req) => (
                        <div key={req.id} className="bg-[#1e293b] rounded-xl border border-slate-800/50 overflow-hidden hover:border-slate-600 transition-all group shadow-sm">
                            {/* Grid Layout for a "Form Row" feel */}
                            <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch">
                                
                                {/* Status & Urgency Column */}
                                <div className="lg:col-span-2 p-6 border-b lg:border-b-0 lg:border-r border-slate-800 flex flex-col justify-center gap-2 bg-slate-900/30">
                                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Priority</span>
                                    <div className={`px-3 py-1.5 rounded text-[9px] font-bold text-center border uppercase tracking-widest ${getUrgencyColor(req.urgency)}`}>
                                        {req.urgency}
                                    </div>
                                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest mt-2">Current Status</span>
                                    <div className="text-[10px] font-bold text-white uppercase tracking-tighter">
                                        {req.status === 'Pending' ? '○ ' : '● '} {req.status}
                                    </div>
                                </div>

                                {/* Content Column */}
                                <div className="lg:col-span-7 p-6 space-y-3">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-white font-black text-lg uppercase tracking-tight">{req.subject}</h3>
                                        <span className="text-[10px] text-slate-600 font-mono">#{req.id.toString().padStart(4, '0')}</span>
                                    </div>
                                    <p className="text-slate-400 text-sm leading-relaxed font-medium bg-slate-900/50 p-4 rounded-lg italic">
                                        {req.message}
                                    </p>
                                    <div className="flex gap-4 pt-2">
                                        <div className="flex items-center gap-2">
                                            <span className="text-[9px] font-black text-blue-500 uppercase">Student:</span>
                                            <span className="text-[10px] font-bold text-slate-300">{req.student_name}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-[9px] font-black text-blue-500 uppercase">Date:</span>
                                            <span className="text-[10px] font-bold text-slate-300">{new Date(req.created_at).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Action Column */}
                                <div className="lg:col-span-3 p-6 bg-slate-900/20 flex flex-col justify-center gap-2 border-t lg:border-t-0 lg:border-l border-slate-800">
                                    <button 
                                        onClick={() => handleUpdateStatus(req.id, 'Processing')}
                                        disabled={req.status === 'Processing'}
                                        className="w-full py-2 rounded bg-slate-800 border border-slate-700 text-blue-400 text-[10px] font-black uppercase tracking-[0.2em] hover:bg-blue-600 hover:text-white transition-all disabled:opacity-20"
                                    >
                                        In-Process
                                    </button>
                                    <div className="grid grid-cols-2 gap-2">
                                        <button 
                                            onClick={() => handleUpdateStatus(req.id, 'Accepted')}
                                            disabled={req.status === 'Accepted'}
                                            className="py-2 rounded bg-slate-800 border border-slate-700 text-emerald-500 text-[10px] font-black uppercase tracking-[0.2em] hover:bg-emerald-600 hover:text-white transition-all disabled:opacity-20"
                                        >
                                            Accept
                                        </button>
                                        <button 
                                            onClick={() => handleUpdateStatus(req.id, 'Rejected')}
                                            disabled={req.status === 'Rejected'}
                                            className="py-2 rounded bg-slate-800 border border-slate-700 text-red-500 text-[10px] font-black uppercase tracking-[0.2em] hover:bg-red-600 hover:text-white transition-all disabled:opacity-20"
                                        >
                                            Reject
                                        </button>
                                    </div>
                                </div>

                            </div>
                        </div>
                    ))
                ) : (
                    <div className="border-2 border-dashed border-slate-800 p-20 rounded-3xl text-center">
                        <p className="text-slate-600 font-black uppercase tracking-[0.4em] text-xs">Ledger Clear / No Entries</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ManageRequest;