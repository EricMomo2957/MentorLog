import { useState, useEffect } from 'react';

interface Feedback {
    id: number;
    student_name: string;
    subject: string;
    comment: string;
    rating: number;
    category: string;
    created_at: string;
}

const ManageFeedback = () => {
    const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchFeedbacks = async () => {
        const token = localStorage.getItem('token');
        try {
            const res = await fetch('http://localhost:5000/api/feedback/all', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) setFeedbacks(data.data);
        } catch (err) {
            console.error("Feedback fetch error:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchFeedbacks(); }, []);

    return (
        <div className="font-mono text-slate-300 p-6">
            <div className="mb-10 border-b border-slate-800 pb-4">
                <div className="text-blue-500 text-[10px] font-black tracking-[0.4em] uppercase">USER_VOICE_MOD_v1.0</div>
                <h1 className="text-3xl font-black text-white italic uppercase">Manage <span className="not-italic text-slate-600">Feedback</span></h1>
            </div>

            {loading ? (
                <div className="animate-pulse text-blue-500 text-xs">SYNCHRONIZING_DATA_STREAMS...</div>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {feedbacks.map((f) => (
                        <div key={f.id} className="bg-slate-900/30 border border-slate-800 p-6 hover:border-blue-500/50 transition-all group relative overflow-hidden">
                            {/* Rating Badge */}
                            <div className="absolute top-0 right-0 bg-blue-500 text-black px-4 py-1 text-[10px] font-black">
                                RATING: {f.rating}/5
                            </div>

                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div className="space-y-2">
                                    <div className="flex items-center gap-3">
                                        <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded font-black uppercase tracking-tighter">
                                            {f.category}
                                        </span>
                                        <span className="text-blue-500 text-xs font-black uppercase italic">
                                            {f.student_name}
                                        </span>
                                    </div>
                                    <h3 className="text-lg font-black text-white uppercase tracking-tighter">
                                        {f.subject}
                                    </h3>
                                    <p className="text-sm text-slate-500 leading-relaxed italic border-l-2 border-slate-800 pl-4">
                                        "{f.comment}"
                                    </p>
                                </div>

                                <div className="text-right">
                                    <p className="text-[9px] text-slate-700 font-black uppercase mb-2">Timestamp</p>
                                    <p className="text-[10px] text-slate-500">{new Date(f.created_at).toLocaleString()}</p>
                                    <button className="mt-4 text-[9px] font-black uppercase text-slate-600 hover:text-white transition-colors">
                                        [ ARCHIVE_REPORT ]
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}

                    {feedbacks.length === 0 && (
                        <div className="py-20 border border-dashed border-slate-800 text-center text-slate-700 text-[10px] uppercase font-black">
                            No_Feedback_Logs_Detected_In_Buffer
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default ManageFeedback;