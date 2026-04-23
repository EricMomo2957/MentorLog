import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiTrash2, FiMessageSquare, FiStar, FiFilter } from 'react-icons/fi';

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
        } catch (_error) {
            alert("Delete failed");
        }
    };

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 min-h-screen pb-20">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-6">
                <div>
                    <h1 className="text-4xl font-black text-white tracking-tighter flex items-center gap-3">
                        FEEDBACK <span className="text-emerald-500 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20 text-sm">REPOSITORY</span>
                    </h1>
                    <p className="text-slate-400 mt-2 font-medium flex items-center gap-2">
                        <FiFilter className="text-emerald-500" /> Student Sentiment & Quality Control
                    </p>
                </div>
                
                <button 
                    onClick={() => navigate('/admin-dashboard')}
                    className="flex items-center gap-2 px-6 py-3 bg-slate-800/50 hover:bg-slate-700 text-slate-300 text-xs font-bold uppercase tracking-widest rounded-2xl transition-all border border-slate-700 active:scale-95 shadow-xl"
                >
                    <FiArrowLeft /> Back to Suite
                </button>
            </div>

            {loading ? (
                <div className="flex flex-col items-center py-32">
                    <div className="w-10 h-10 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin"></div>
                    <p className="mt-4 text-slate-500 font-bold uppercase text-[10px] tracking-[0.2em]">Analyzing Sentiment Data...</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {feedbacks.map((f) => (
                        <div key={f.id} className="group bg-[#0f172a]/40 hover:bg-[#0f172a]/80 border border-slate-800 hover:border-emerald-500/30 p-6 rounded-4xl transition-all duration-300 flex flex-col shadow-2xl relative overflow-hidden">
                            
                            {/* Decorative Background Icon */}
                            <FiMessageSquare className="absolute -right-4 -bottom-4 text-slate-800/20 text-8xl rotate-12 group-hover:text-emerald-500/5 transition-colors" />

                            {/* Top Row: Category & Rating */}
                            <div className="flex justify-between items-start mb-6 relative z-10">
                                <span className="bg-emerald-500/10 text-emerald-400 text-[10px] font-black px-4 py-1.5 rounded-xl uppercase tracking-widest border border-emerald-500/20">
                                    {f.category}
                                </span>
                                <div className="flex gap-1 bg-slate-900/80 px-2 py-1 rounded-lg border border-slate-800">
                                    {[...Array(5)].map((_, i) => (
                                        <FiStar 
                                            key={i} 
                                            className={`text-[10px] ${i < f.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-700'}`} 
                                        />
                                    ))}
                                </div>
                            </div>

                            {/* Content */}
                            <div className="flex-1 relative z-10">
                                <p className="text-slate-200 text-base leading-relaxed italic font-medium mb-8">
                                    "{f.content}"
                                </p>
                            </div>

                            {/* Footer: Student Info & Delete */}
                            <div className="flex justify-between items-end border-t border-slate-800/50 pt-5 relative z-10">
                                <div>
                                    <h4 className="text-sm font-black text-white uppercase tracking-tight group-hover:text-emerald-400 transition-colors">
                                        {f.student_name}
                                    </h4>
                                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter mt-1">
                                        Posted on {new Date(f.created_at).toLocaleDateString()}
                                    </p>
                                </div>
                                <button 
                                    onClick={() => deleteFeedback(f.id)}
                                    className="p-3 bg-red-500/5 text-red-500/40 rounded-2xl border border-red-500/10 hover:bg-red-500 hover:text-white hover:border-red-500 transition-all active:scale-90 shadow-lg"
                                    title="Delete Entry"
                                >
                                    <FiTrash2 size={16} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {feedbacks.length === 0 && !loading && (
                <div className="bg-[#0f172a]/60 border border-dashed border-slate-800 rounded-4xl p-24 text-center">
                    <div className="w-20 h-20 bg-slate-900 rounded-full flex items-center justify-center mx-auto mb-6 border border-slate-800">
                        <FiMessageSquare className="text-3xl text-slate-700" />
                    </div>
                    <p className="text-slate-400 font-black uppercase tracking-widest text-sm">The Repository is Empty</p>
                    <p className="text-slate-600 text-xs mt-2 font-medium italic">No student sentiment data found in the system.</p>
                </div>
            )}
        </div>
    );
};

export default ManageFeedback;