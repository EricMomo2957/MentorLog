import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface Feedback {
    id: number;
    student_name: string;
    category: string;
    content: string;
    rating: number;
    created_at: string;
}

const ManageFeedback = () => {
    const navigate = useNavigate();
    const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchFeedbacks = async () => {
        const token = localStorage.getItem('token');
        try {
            const response = await fetch('http://localhost:5000/api/feedback/all', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (data.success) setFeedbacks(data.data);
        } catch (error) {
            console.error("Fetch error:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchFeedbacks(); }, []);

    const deleteFeedback = async (id: number) => {
        if (!window.confirm("Delete this feedback entry?")) return;
        const token = localStorage.getItem('token');
        try {
            await fetch(`http://localhost:5000/api/feedback/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setFeedbacks(feedbacks.filter(f => f.id !== id));
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (error) {
            alert("Delete failed");
        }
    };

    return (
        <div className="max-w-7xl mx-auto p-6 md:p-10 space-y-10 bg-[#0f172a] min-h-screen text-slate-200">
            {/* Header */}
            <div className="flex justify-between items-center border-b border-slate-800 pb-8">
                <div>
                    <h1 className="text-4xl font-black uppercase italic tracking-tighter">
                        Feedback <span className="text-emerald-500">Repository</span>
                    </h1>
                    <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.3em] mt-2">Student Sentiment & Quality Control</p>
                </div>
                <button 
                    onClick={() => navigate('/admin-dashboard')}
                    className="bg-slate-800 px-6 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest border border-slate-700 hover:bg-slate-700 transition-all"
                >
                    ← Back
                </button>
            </div>

            {loading ? (
                <div className="py-20 text-center animate-pulse">
                    <p className="text-slate-500 text-xs font-black uppercase tracking-widest">Loading Sentiment Data...</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {feedbacks.map((f) => (
                        <div key={f.id} className="bg-[#1e293b] border border-slate-800 p-6 rounded-2xl hover:border-emerald-500/50 transition-all group relative overflow-hidden">
                            {/* Category Badge */}
                            <div className="flex justify-between items-start mb-4">
                                <span className="bg-emerald-500/10 text-emerald-500 text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest border border-emerald-500/20">
                                    {f.category}
                                </span>
                                <div className="flex gap-1">
                                    {[...Array(5)].map((_, i) => (
                                        <span key={i} className={`text-xs ${i < f.rating ? 'text-amber-400' : 'text-slate-700'}`}>★</span>
                                    ))}
                                </div>
                            </div>

                            <p className="text-slate-300 text-sm leading-relaxed mb-6 italic">"{f.content}"</p>

                            <div className="flex justify-between items-end border-t border-slate-800 pt-4">
                                <div>
                                    <h4 className="text-[11px] font-black text-white uppercase tracking-tight">{f.student_name}</h4>
                                    <p className="text-[9px] text-slate-500 font-bold">{new Date(f.created_at).toLocaleDateString()}</p>
                                </div>
                                <button 
                                    onClick={() => deleteFeedback(f.id)}
                                    className="opacity-0 group-hover:opacity-100 transition-opacity bg-red-500/10 text-red-500 p-2 rounded-lg hover:bg-red-500 hover:text-white"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {feedbacks.length === 0 && !loading && (
                <div className="text-center py-20 border-2 border-dashed border-slate-800 rounded-3xl">
                    <p className="text-slate-600 text-[10px] font-black uppercase tracking-[0.5em]">Inbox Empty</p>
                </div>
            )}
        </div>
    );
};

export default ManageFeedback;