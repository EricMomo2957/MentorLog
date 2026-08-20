import { useState, useEffect, useCallback } from 'react';
import { 
    CheckCircle2, Clock, XCircle, AlertCircle, 
    Plus, RefreshCw 
} from 'lucide-react';

interface ServiceRequest {
    id: number;
    subject: string;
    message: string;
    urgency: string;
    status: 'Pending' | 'Processing' | 'Accepted' | 'Rejected';
    created_at: string;
}

const StudentRequest = () => {
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
        } catch (error) {
            setToast({ message: "Connection error.", type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = (status: string) => {
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

    return (
        <div className="space-y-6 max-w-7xl mx-auto">
            {/* Toast System */}
            {toast && (
                <div className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl shadow-lg border text-xs font-semibold flex items-center gap-2 animate-in fade-in slide-in-from-bottom-3 ${
                    toast.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-rose-50 border-rose-200 text-rose-800'
                }`}>
                    {toast.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <AlertCircle className="w-4 h-4 text-rose-600" />}
                    <span>{toast.message}</span>
                </div>
            )}

            {/* Top Title & Primary Action Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Service Requests & Applications</h1>
                    <p className="text-xs text-slate-500 mt-0.5">Submit document applications, schedule adjustments, or endorsement requests</p>
                </div>

                <div className="flex items-center gap-3">
                    <button 
                        onClick={fetchMyRequests}
                        disabled={fetching}
                        className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold px-4 py-2.5 rounded-lg shadow-xs transition-all flex items-center gap-2"
                    >
                        <RefreshCw className={`w-3.5 h-3.5 ${fetching ? 'animate-spin text-blue-600' : ''}`} />
                        <span>Refresh Requests</span>
                    </button>
                </div>
            </div>

            {/* Main Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Left Submission Form */}
                <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4 h-fit sticky top-20">
                    <div className="border-b border-slate-100 pb-3">
                        <h2 className="text-base font-bold text-slate-900">File New Request</h2>
                        <p className="text-[11px] text-slate-500">Fill in subject and urgency priority to lodge request</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-slate-600">Request Subject</label>
                            <input 
                                type="text" 
                                value={subject}
                                onChange={(e) => setSubject(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 outline-none focus:border-blue-500 focus:bg-white"
                                placeholder="e.g. Endorsement Letter Copy"
                                required
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-slate-600">Urgency Priority</label>
                            <select 
                                value={urgency}
                                onChange={(e) => setUrgency(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 outline-none focus:border-blue-500 focus:bg-white cursor-pointer"
                            >
                                <option value="Normal">Normal</option>
                                <option value="Urgent">Urgent</option>
                                <option value="Immediate Attention">Immediate Attention</option>
                            </select>
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-slate-600">Detailed Reason</label>
                            <textarea 
                                rows={4}
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 outline-none focus:border-blue-500 focus:bg-white resize-none"
                                placeholder="Describe reason for request..."
                                required
                            />
                        </div>

                        <button 
                            type="submit" 
                            disabled={loading}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs py-2.5 rounded-lg transition-all shadow-xs flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            <Plus className="w-4 h-4" />
                            <span>{loading ? 'Submitting...' : 'Submit Request'}</span>
                        </button>
                    </form>
                </div>

                {/* Right History Table */}
                <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
                    <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                        <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">My Service Request History</h3>
                        <span className="text-xs font-mono text-slate-500">{myRequests.length} Total Requests</span>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-xs">
                            <thead>
                                <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                                    <th className="py-3 px-4">Subject & Reason ↕</th>
                                    <th className="py-3 px-4">Priority ↕</th>
                                    <th className="py-3 px-4">Filed Date ↕</th>
                                    <th className="py-3 px-4 text-right">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-slate-700">
                                {myRequests.length > 0 ? (
                                    myRequests.map((req) => (
                                        <tr key={req.id} className="hover:bg-slate-50/80 transition-colors">
                                            <td className="py-3.5 px-4 max-w-xs">
                                                <p className="font-bold text-slate-900 leading-snug">{req.subject}</p>
                                                <p className="text-slate-500 text-[11px] line-clamp-1 mt-0.5">"{req.message}"</p>
                                            </td>

                                            <td className="py-3.5 px-4">
                                                <span className={`inline-block px-2 py-0.5 text-[10px] font-semibold border rounded-full ${
                                                    req.urgency === 'Immediate Attention' ? 'text-rose-700 bg-rose-50 border-rose-200' :
                                                    req.urgency === 'Urgent' ? 'text-amber-700 bg-amber-50 border-amber-200' :
                                                    'text-slate-600 bg-slate-100 border-slate-200'
                                                }`}>
                                                    {req.urgency}
                                                </span>
                                            </td>

                                            <td className="py-3.5 px-4 font-mono text-slate-600">
                                                {new Date(req.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                            </td>

                                            <td className="py-3.5 px-4 text-right">
                                                {getStatusBadge(req.status)}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={4} className="py-12 text-center text-slate-400 text-xs italic">
                                            No request history entries found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudentRequest;