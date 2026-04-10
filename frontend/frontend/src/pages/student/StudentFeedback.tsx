import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const StudentFeedback = () => {
    const navigate = useNavigate();
    const [category, setCategory] = useState('Facility');
    const [content, setContent] = useState('');
    const [rating, setRating] = useState(5);
    const [hover, setHover] = useState(0);
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

        if (!content) {
            setToast({ message: "Please provide your feedback content.", type: 'error' });
            return;
        }

        setLoading(true);
        try {
            const response = await fetch('http://localhost:5000/api/feedback/submit', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ category, content, rating })
            });

            const data = await response.json();

            if (data.success) {
                setToast({ message: "Feedback sent! Thank you for helping us improve.", type: 'success' });
                setContent('');
                setRating(5);
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

    return (
        <div className="max-w-4xl mx-auto p-4 md:p-10 space-y-8 animate-in fade-in duration-500">
            {/* Toast */}
            {toast && (
                <div className={`fixed top-10 right-10 z-50 px-6 py-3 rounded-xl shadow-2xl border transition-all ${
                    toast.type === 'success' ? 'bg-emerald-900 border-emerald-500 text-emerald-200' : 'bg-red-900 border-red-500 text-red-200'
                }`}>
                    <p className="text-xs font-black uppercase tracking-widest">{toast.message}</p>
                </div>
            )}

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-800 pb-6">
                <div>
                    <h1 className="text-3xl font-black text-white tracking-tighter uppercase italic">
                        Student <span className="text-emerald-500">Voice</span>
                    </h1>
                    <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.3em] mt-1">Direct Feedback Channel</p>
                </div>
                <button 
                    onClick={() => navigate('/student-dashboard')}
                    className="text-[10px] font-black text-slate-400 hover:text-white uppercase tracking-widest bg-slate-800 px-5 py-2 rounded-lg border border-slate-700 transition-all"
                >
                    ← Dashboard
                </button>
            </div>

            <div className="bg-[#1e293b] rounded-3xl border border-slate-800 shadow-2xl overflow-hidden">
                <div className="grid grid-cols-1 md:grid-cols-5">
                    {/* Left Info Panel */}
                    <div className="md:col-span-2 bg-slate-900/50 p-8 flex flex-col justify-center border-b md:border-b-0 md:border-r border-slate-800">
                        <div className="space-y-6">
                            <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center border border-emerald-500/20 text-emerald-500 text-xl">
                                📣
                            </div>
                            <h2 className="text-xl font-black text-white leading-tight uppercase italic">Help us make <br/> <span className="text-emerald-500">MentorLog</span> better.</h2>
                            <p className="text-slate-400 text-xs leading-relaxed">Your feedback is sent directly to the administration to improve campus facilities and services.</p>
                        </div>
                    </div>

                    {/* Right Form Panel */}
                    <form onSubmit={handleSubmit} className="md:col-span-3 p-8 space-y-6">
                        <div className="space-y-4">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Select Category</label>
                            <div className="flex flex-wrap gap-2">
                                {['Facility', 'Teaching', 'System', 'Other'].map((cat) => (
                                    <button
                                        key={cat}
                                        type="button"
                                        onClick={() => setCategory(cat)}
                                        className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${
                                            category === cat 
                                            ? 'bg-emerald-600 border-emerald-500 text-white shadow-lg shadow-emerald-600/20' 
                                            : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-500'
                                        }`}
                                    >
                                        {cat}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-4">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Your Rating</label>
                            <div className="flex gap-2">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        key={star}
                                        type="button"
                                        onClick={() => setRating(star)}
                                        onMouseEnter={() => setHover(star)}
                                        onMouseLeave={() => setHover(0)}
                                        className="text-2xl transition-transform hover:scale-125 focus:outline-none"
                                    >
                                        <span className={`${(hover || rating) >= star ? 'text-amber-400' : 'text-slate-700'}`}>
                                            ★
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Share your thoughts</label>
                            <textarea 
                                rows={5}
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                className="w-full bg-[#0f172a] border border-slate-800 rounded-2xl px-5 py-4 text-white focus:border-emerald-500 outline-none transition-all resize-none text-sm italic"
                                placeholder="Tell us what you think..."
                            />
                        </div>

                        <button 
                            type="submit" 
                            disabled={loading}
                            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black text-[10px] py-4 rounded-2xl transition-all uppercase tracking-widest shadow-xl shadow-emerald-900/20 disabled:opacity-50"
                        >
                            {loading ? 'Transmitting...' : 'Submit Anonymous Feedback'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default StudentFeedback;