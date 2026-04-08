import { useState } from 'react';

const StudentRequest = () => {
    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        const token = localStorage.getItem('token');
        const studentId = localStorage.getItem('userId'); // Ensure this matches your login storage key
        const studentName = localStorage.getItem('userName');

        if (!subject || !message) {
            setToast({ message: "Please fill in all fields", type: 'error' });
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
                    message
                })
            });

            if (response.ok) {
                setToast({ message: "Request sent to Admin!", type: 'success' });
                setSubject('');
                setMessage('');
            } else {
                setToast({ message: "Failed to send request", type: 'error' });
            }
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (error) {
            setToast({ message: "Network error", type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto p-6">
            {toast && (
                <div className={`fixed top-5 right-5 z-50 px-6 py-3 rounded-2xl border ${
                    toast.type === 'success' ? 'bg-emerald-500/10 border-emerald-500 text-emerald-500' : 'bg-red-500/10 border-red-500 text-red-500'
                }`}>
                    {toast.message}
                </div>
            )}

            <div className="bg-[#1e293b] p-8 rounded-3xl border border-slate-800 shadow-xl space-y-6">
                <div>
                    <h1 className="text-3xl font-black text-white italic">SEND <span className="text-blue-500">REQUEST</span></h1>
                    <p className="text-slate-400 text-xs font-mono uppercase tracking-widest mt-1">Direct Line to Admin</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-xs font-black uppercase tracking-widest text-slate-500 ml-1">Subject</label>
                        <input 
                            type="text" 
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                            className="w-full bg-slate-900/50 border border-slate-800 rounded-2xl px-5 py-3 text-white focus:outline-none focus:border-blue-500 transition-all"
                            placeholder="e.g., Schedule Concern, Clearance"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-black uppercase tracking-widest text-slate-500 ml-1">Message</label>
                        <textarea 
                            rows={5}
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            className="w-full bg-slate-900/50 border border-slate-800 rounded-2xl px-5 py-3 text-white focus:outline-none focus:border-blue-500 transition-all resize-none"
                            placeholder="Explain your request in detail..."
                        />
                    </div>

                    <button 
                        type="submit" 
                        disabled={loading}
                        className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-4 rounded-2xl transition-all shadow-lg shadow-blue-600/20 disabled:opacity-50"
                    >
                        {loading ? 'SENDING...' : 'SUBMIT REQUEST ➔'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default StudentRequest;