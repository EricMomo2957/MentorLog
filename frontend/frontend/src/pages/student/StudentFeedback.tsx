import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    MessageSquare, Star, ArrowLeft, Send, 
    ShieldCheck, Building2, GraduationCap, Laptop, HelpCircle,
    CheckCircle2, AlertCircle
} from 'lucide-react';

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

    const categories = [
        { id: 'Facility', icon: Building2 },
        { id: 'Teaching', icon: GraduationCap },
        { id: 'System', icon: Laptop },
        { id: 'Other', icon: HelpCircle },
    ];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const token = localStorage.getItem('token');

        if (!content) {
            setToast({ message: "Content Required for Submission", type: 'error' });
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
                setToast({ message: "Entry Logged Successfully", type: 'success' });
                setContent('');
                setRating(5);
            } else {
                setToast({ message: data.message || "Registry Error", type: 'error' });
            }
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (error) {
            setToast({ message: "Network Link Severed", type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-5xl mx-auto p-6 md:p-12 space-y-10 antialiased min-h-screen">
            {/* Minimalist Toast Notification */}
            {toast && (
                <div className={`fixed top-10 right-10 z-100 px-6 py-4 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] border backdrop-blur-xl animate-in slide-in-from-right-10 duration-300 ${
                    toast.type === 'success' ? 'bg-emerald-950/90 border-emerald-500/50 text-emerald-400' : 'bg-red-950/90 border-red-500/50 text-red-400'
                }`}>
                    <div className="flex items-center gap-3">
                        {toast.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                        <p className="text-[10px] font-black uppercase tracking-[0.2em]">{toast.message}</p>
                    </div>
                </div>
            )}

            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-800 pb-10">
                <div className="space-y-2">
                    <div className="flex items-center gap-2 text-emerald-500 font-bold tracking-[0.3em] text-[10px] uppercase">
                        <MessageSquare className="w-4 h-4" />
                        Anonymous Quality Control
                    </div>
                    <h1 className="text-5xl font-black text-white tracking-tighter uppercase italic">
                        Student <span className="text-slate-500 font-light">Voice</span>
                    </h1>
                </div>
                <button 
                    onClick={() => navigate('/student-dashboard')}
                    className="flex items-center gap-2 text-[10px] font-black text-slate-500 hover:text-white uppercase tracking-widest transition-all group"
                >
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to Dashboard
                </button>
            </div>

            <div className="bg-[#0f172a]/40 border border-slate-800 rounded-[2.5rem] overflow-hidden shadow-2xl">
                <div className="grid grid-cols-1 lg:grid-cols-12">
                    
                    {/* Left Sidebar Info */}
                    <div className="lg:col-span-4 bg-slate-950/50 p-10 space-y-8 border-b lg:border-b-0 lg:border-r border-slate-800">
                        <div className="w-16 h-16 bg-emerald-500/10 rounded-3xl flex items-center justify-center border border-emerald-500/20 shadow-inner">
                            <ShieldCheck className="w-8 h-8 text-emerald-500" />
                        </div>
                        <div className="space-y-4">
                            <h2 className="text-2xl font-black text-white leading-none uppercase italic">Secure <br/> Submission</h2>
                            <p className="text-slate-500 text-xs leading-relaxed font-medium">
                                Your identity remains protected. Data entered here is encrypted and routed directly to campus administration to facilitate service improvements.
                            </p>
                        </div>
                        
                        <div className="pt-6 space-y-4">
                            <div className="flex items-center gap-3 text-[9px] font-bold text-slate-600 uppercase tracking-widest">
                                <div className="w-1 h-1 bg-emerald-500 rounded-full"></div>
                                Direct Admin Access
                            </div>
                            <div className="flex items-center gap-3 text-[9px] font-bold text-slate-600 uppercase tracking-widest">
                                <div className="w-1 h-1 bg-emerald-500 rounded-full"></div>
                                256-bit Identity Masking
                            </div>
                        </div>
                    </div>

                    {/* Right Entry Form */}
                    <form onSubmit={handleSubmit} className="lg:col-span-8 p-10 space-y-10 bg-slate-900/10">
                        
                        {/* Category Grid */}
                        <div className="space-y-4">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Select Entry Domain</label>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                {categories.map(({ id, icon: Icon }) => (
                                    <button
                                        key={id}
                                        type="button"
                                        onClick={() => setCategory(id)}
                                        className={`flex flex-col items-center gap-3 p-4 rounded-2xl border transition-all duration-300 ${
                                            category === id 
                                            ? 'bg-emerald-600/10 border-emerald-500 text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.1)]' 
                                            : 'bg-slate-950/50 border-slate-800 text-slate-600 hover:border-slate-600'
                                        }`}
                                    >
                                        <Icon className="w-5 h-5" />
                                        <span className="text-[9px] font-black uppercase tracking-widest">{id}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Professional Rating */}
                        <div className="space-y-4">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Priority Score</label>
                            <div className="flex items-center gap-4 bg-slate-950/50 p-6 rounded-3xl border border-slate-800">
                                <div className="flex gap-2">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            type="button"
                                            onClick={() => setRating(star)}
                                            onMouseEnter={() => setHover(star)}
                                            onMouseLeave={() => setHover(0)}
                                            className="transition-all hover:scale-125 focus:outline-none"
                                        >
                                            <Star 
                                                className={`w-8 h-8 transition-colors ${
                                                    (hover || rating) >= star 
                                                    ? 'fill-amber-400 text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.4)]' 
                                                    : 'text-slate-800'
                                                }`} 
                                            />
                                        </button>
                                    ))}
                                </div>
                                <div className="ml-auto text-right">
                                    <p className="text-white text-xs font-black uppercase tracking-tighter leading-none">{rating}/5</p>
                                    <p className="text-slate-600 text-[8px] font-bold uppercase tracking-widest">Efficiency Rating</p>
                                </div>
                            </div>
                        </div>

                        {/* Content Area */}
                        <div className="space-y-4">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Detailed Observations</label>
                            <div className="relative group">
                                <textarea 
                                    rows={6}
                                    value={content}
                                    onChange={(e) => setContent(e.target.value)}
                                    className="w-full bg-slate-950/50 border border-slate-800 rounded-3xl px-6 py-6 text-white placeholder:text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/50 transition-all resize-none text-sm font-medium tracking-tight"
                                    placeholder="Begin typing your entry here..."
                                />
                                <div className="absolute bottom-4 right-6 text-[10px] font-bold text-slate-700 uppercase tracking-widest group-focus-within:text-emerald-500/50">
                                    Audit Mode
                                </div>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button 
                            type="submit" 
                            disabled={loading}
                            className="group relative w-full overflow-hidden py-5 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-[11px] rounded-2xl transition-all uppercase tracking-[0.3em] shadow-2xl shadow-emerald-900/40 disabled:opacity-50 active:scale-[0.98]"
                        >
                            <span className="relative z-10 flex items-center justify-center gap-3">
                                {loading ? 'TRANSMITTING DATA...' : (
                                    <>
                                        LOG FEEDBACK ENTRY <Send className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                    </>
                                )}
                            </span>
                        </button>
                    </form>
                </div>
            </div>
            
            {/* Footer Tag */}
            <div className="text-center">
                <p className="text-[9px] text-slate-700 font-black tracking-[0.5em] uppercase">MentorLog_V2_Voice_Registry_System</p>
            </div>
        </div>
    );
};

export default StudentFeedback;