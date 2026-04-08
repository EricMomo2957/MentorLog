import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const StudentRequest = () => {
    const navigate = useNavigate();
    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');
    const [urgency, setUrgency] = useState('Normal'); // State for urgency
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

    useEffect(() => {
        if (toast) {
            const timer = setTimeout(() => setToast(null), 3000);
            return () => clearTimeout(timer);
        }
    }, [toast]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        const studentId = localStorage.getItem('userId');
        const studentName = localStorage.getItem('userName');

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
                body: JSON.stringify({
                    student_id: studentId,
                    student_name: studentName,
                    subject,
                    message,
                    urgency // Now sending urgency to the backend
                })
            });

            if (response.ok) {
                setToast({ message: "Request filed successfully.", type: 'success' });
                setSubject('');
                setMessage('');
                setUrgency('Normal');
            } else {
                setToast({ message: "Submission failed.", type: 'error' });
            }
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (error) {
            setToast({ message: "Connection error.", type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-4 md:p-0">
            {/* Toast Notification */}
            {toast && (
                <div className={`fixed top-10 right-10 z-50 px-5 py-3 rounded-lg shadow-2xl border transition-all animate-in fade-in slide-in-from-top-4 ${
                    toast.type === 'success' ? 'bg-emerald-900/90 border-emerald-500 text-emerald-200' : 'bg-red-900/90 border-red-500 text-red-200'
                }`}>
                    <p className="text-sm font-bold tracking-wide">{toast.message}</p>
                </div>
            )}

            {/* Header with Navigation */}
            <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-white tracking-tight uppercase">Service Request Form</h1>
                    <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] bg-blue-600 px-2 py-0.5 rounded text-white font-bold uppercase tracking-widest">Official Inquiry</span>
                        <p className="text-slate-500 text-xs font-medium italic">Standard Procedure Ticket</p>
                    </div>
                </div>
                <button 
                    onClick={() => navigate('/student-dashboard')}
                    className="text-xs font-bold text-slate-400 hover:text-white transition-colors flex items-center gap-2 uppercase tracking-widest"
                >
                    ← Back to Dashboard
                </button>
            </div>

            <div className="bg-[#1e293b] rounded-xl border border-slate-700/50 shadow-sm overflow-hidden">
                {/* Section Info */}
                <div className="p-6 border-b border-slate-700/50 bg-slate-800/30 flex items-center justify-between">
                    <h2 className="text-sm font-bold text-slate-300 uppercase tracking-widest flex items-center gap-2">
                        <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
                        New Inquiry Submission
                    </h2>
                    <span className="text-[10px] font-black text-slate-500">FORM-REF: {Math.floor(Math.random() * 10000)}</span>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-8">
                    {/* Information Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-2">
                            <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider">Subject Category</label>
                            <input 
                                type="text" 
                                value={subject}
                                onChange={(e) => setSubject(e.target.value)}
                                className="w-full bg-[#0f172a] border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-medium placeholder:text-slate-600"
                                placeholder="e.g. Schedule Error, Grade Discrepancy"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider">Urgency Level</label>
                            <select 
                                value={urgency}
                                onChange={(e) => setUrgency(e.target.value)}
                                className="w-full bg-[#0f172a] border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-all font-medium cursor-pointer"
                            >
                                <option value="Normal">Normal</option>
                                <option value="Urgent">Urgent</option>
                                <option value="Immediate Attention">Immediate Attention</option>
                            </select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider">Detailed Description</label>
                        <textarea 
                            rows={8}
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            className="w-full bg-[#0f172a] border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all resize-none font-medium leading-relaxed placeholder:text-slate-600"
                            placeholder="Please provide specific details so the admin can assist you better..."
                        />
                    </div>

                    {/* Footer Actions */}
                    <div className="flex items-center justify-between pt-6 border-t border-slate-700/50">
                        <div className="hidden md:flex items-center gap-4 text-slate-500">
                            <span className="text-[10px] font-bold uppercase tracking-tighter italic underline decoration-blue-500/50 underline-offset-4">Read Data Privacy</span>
                        </div>
                        
                        <div className="flex gap-4 w-full md:w-auto">
                            <button 
                                type="button"
                                onClick={() => {setSubject(''); setMessage(''); setUrgency('Normal')}}
                                className="flex-1 md:flex-none px-6 py-3 rounded-lg border border-slate-700 text-slate-400 font-bold text-xs hover:bg-slate-700/50 transition-all uppercase tracking-widest"
                            >
                                Clear
                            </button>
                            <button 
                                type="submit" 
                                disabled={loading}
                                className="flex-1 md:flex-none px-8 py-3 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-black text-xs transition-all shadow-lg shadow-blue-900/20 disabled:opacity-50 uppercase tracking-widest"
                            >
                                {loading ? 'Submitting...' : 'Send Request'}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
            
            <p className="mt-6 text-center text-slate-500 text-[10px] font-bold uppercase tracking-widest">
                System generated form for <span className="text-slate-300">MentorLog Academic Management</span>
            </p>
        </div>
    );
};

export default StudentRequest;