import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

interface ServiceRequest {
    id: number;
    subject: string;
    message: string;
    urgency: string;
    status: 'Pending' | 'Processing' | 'Accepted' | 'Rejected';
    created_at: string;
}

const StudentRequest = () => {
    const navigate = useNavigate();
    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');
    const [urgency, setUrgency] = useState('Normal');
    const [loading, setLoading] = useState(false);
    const [myRequests, setMyRequests] = useState<ServiceRequest[]>([]);
    const [fetching, setFetching] = useState(false);
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

    useEffect(() => {
        if (toast) {
            const timer = setTimeout(() => setToast(null), 3000);
            return () => clearTimeout(timer);
        }
    }, [toast]);

    const fetchMyRequests = useCallback(async () => {
        const token = localStorage.getItem('token');
        setFetching(true);
        try {
            const response = await fetch('http://localhost:5000/api/requests/my-requests', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (data.success) {
                setMyRequests(data.data);
            }
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (error) {
            console.error("Failed to sync status history.");
        } finally {
            setFetching(false);
        }
    }, []);

    useEffect(() => {
        fetchMyRequests();
    }, [fetchMyRequests]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const token = localStorage.getItem('token');

        if (!subject || !message) {
            setToast({ message: "All fields are required.", type: 'error' });
            return;
        }

        setLoading(true);
        try {
            const response = await fetch('http://localhost:5000/api/requests/submit', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ subject, message, urgency })
            });

            const data = await response.json();

            if (response.ok && data.success) {
                setToast({ message: "Request filed successfully.", type: 'success' });
                setSubject('');
                setMessage('');
                setUrgency('Normal');
                fetchMyRequests(); 
            } else {
                setToast({ message: data.message || "Submission failed.", type: 'error' });
            }
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (error) {
            setToast({ message: "Connection error.", type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'Accepted': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
            case 'Rejected': return 'bg-red-500/10 text-red-500 border-red-500/20';
            case 'Processing': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
            default: return 'bg-slate-700/50 text-slate-400 border-slate-600';
        }
    };

    return (
        <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-10 animate-in fade-in duration-700">
            {/* Toast Notification */}
            {toast && (
                <div className={`fixed top-10 right-10 z-50 px-6 py-3 rounded-xl shadow-2xl border transition-all animate-bounce ${
                    toast.type === 'success' ? 'bg-emerald-950 border-emerald-500 text-emerald-200' : 'bg-red-950 border-red-500 text-red-200'
                }`}>
                    <p className="text-xs font-black uppercase tracking-widest">{toast.message}</p>
                </div>
            )}

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-800 pb-8">
                <div>
                    <h1 className="text-4xl font-black text-white tracking-tighter uppercase italic">
                        Service <span className="text-blue-500">Center</span>
                    </h1>
                    <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.3em] mt-1">Official Inquiry Management System</p>
                </div>
                <button 
                    onClick={() => navigate('/student-dashboard')}
                    className="group text-[10px] font-black text-slate-400 hover:text-white transition-all flex items-center gap-3 uppercase tracking-widest bg-slate-900 px-6 py-3 rounded-xl border border-slate-800 hover:border-slate-600"
                >
                    <span className="group-hover:-translate-x-1 transition-transform">←</span> Return to Dashboard
                </button>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
                {/* SUBMISSION FORM */}
                <div className="xl:col-span-1">
                    <div className="bg-[#1e293b] rounded-2xl border border-slate-800 shadow-xl overflow-hidden sticky top-8">
                        <div className="p-5 border-b border-slate-800 bg-slate-900/50">
                            <h2 className="text-[10px] font-black text-blue-500 uppercase tracking-widest flex items-center gap-2">
                                <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
                                New Request
                            </h2>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-5">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Subject</label>
                                <input 
                                    type="text" 
                                    value={subject}
                                    onChange={(e) => setSubject(e.target.value)}
                                    className="w-full bg-[#0f172a] border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none transition-all text-sm"
                                    placeholder="e.g. Schedule Conflict"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Priority</label>
                                <select 
                                    value={urgency}
                                    onChange={(e) => setUrgency(e.target.value)}
                                    className="w-full bg-[#0f172a] border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none transition-all text-sm cursor-pointer"
                                >
                                    <option value="Normal">Normal</option>
                                    <option value="Urgent">Urgent</option>
                                    <option value="Immediate Attention">Immediate</option>
                                </select>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Message</label>
                                <textarea 
                                    rows={4}
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    className="w-full bg-[#0f172a] border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none transition-all resize-none text-sm"
                                    placeholder="Describe your issue..."
                                />
                            </div>
                            <button 
                                type="submit" 
                                disabled={loading}
                                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black text-[10px] py-4 rounded-xl transition-all uppercase tracking-widest disabled:opacity-50 shadow-lg shadow-blue-600/10"
                            >
                                {loading ? 'Processing...' : 'Submit Request'}
                            </button>
                        </form>
                    </div>
                </div>

                {/* DATA TABLE SECTION */}
                <div className="xl:col-span-3 space-y-6">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                        <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Personal Request Ledger</h3>
                        <button onClick={fetchMyRequests} className="text-[9px] font-black text-blue-500 hover:text-white transition-colors uppercase tracking-widest">
                            {fetching ? 'Syncing...' : '↻ Refresh Ledger'}
                        </button>
                    </div>

                    <div className="bg-[#1e293b] rounded-2xl border border-slate-800 shadow-xl overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-900/50 border-b border-slate-800">
                                        <th className="p-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">ID</th>
                                        <th className="p-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Subject</th>
                                        <th className="p-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Message</th>
                                        <th className="p-5 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">Priority</th>
                                        <th className="p-5 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">Admin Response</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-800">
                                    {myRequests.length > 0 ? (
                                        myRequests.map((req) => (
                                            <tr key={req.id} className="hover:bg-slate-800/30 transition-colors group">
                                                <td className="p-5 text-xs font-mono text-slate-500">#{req.id.toString().padStart(4, '0')}</td>
                                                <td className="p-5">
                                                    <div className="text-sm font-bold text-white uppercase tracking-tight">{req.subject}</div>
                                                    <div className="text-[9px] text-slate-600 font-bold uppercase mt-1">{new Date(req.created_at).toLocaleDateString()}</div>
                                                </td>
                                                <td className="p-5 max-w-xs">
                                                    <p className="text-slate-400 text-xs italic line-clamp-2">"{req.message}"</p>
                                                </td>
                                                <td className="p-5 text-center">
                                                    <span className={`text-[9px] font-black px-3 py-1 rounded-full border ${
                                                        req.urgency === 'Immediate Attention' ? 'text-red-500 border-red-500/20 bg-red-500/5' :
                                                        req.urgency === 'Urgent' ? 'text-amber-500 border-amber-500/20 bg-amber-500/5' :
                                                        'text-slate-400 border-slate-700 bg-slate-800'
                                                    }`}>
                                                        {req.urgency}
                                                    </span>
                                                </td>
                                                <td className="p-5">
                                                    <div className={`mx-auto w-32 py-2 rounded-lg border text-[10px] font-black text-center uppercase tracking-widest ${getStatusStyle(req.status)}`}>
                                                        {req.status === 'Pending' ? 'Waiting...' : req.status}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={5} className="p-20 text-center">
                                                <p className="text-slate-600 text-[10px] font-black uppercase tracking-[0.4em]">No active entries found</p>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudentRequest;