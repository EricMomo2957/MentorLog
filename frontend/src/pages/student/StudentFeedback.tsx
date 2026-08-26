import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    Star, ArrowLeft, Send, 
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
                setToast({ message: "Feedback submitted successfully!", type: 'success' });
                setContent('');
                setRating(5);
            } else {
                setToast({ message: data.message || "Registry Error", type: 'error' });
            }
        } catch (error) {
            setToast({ message: "Network connection error", type: 'error' });
        } finally {
            setLoading(false);
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
                    <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Student Program Feedback</h1>
                    <p className="text-xs text-slate-500 mt-0.5">Submit confidential evaluation and program feedback to university coordinators</p>
                </div>

                <div className="flex items-center gap-3">
                    <button 
                        onClick={() => navigate('/student-dashboard')} 
                        className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold px-4 py-2.5 rounded-lg shadow-xs transition-all flex items-center gap-2"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span>Back to Dashboard</span>
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Left Security Info */}
                <div className="lg:col-span-4 bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4 h-fit">
                    <div className="w-12 h-12 bg-blue-50 border border-blue-100 rounded-xl flex items-center justify-center text-blue-600">
                        <ShieldCheck className="w-6 h-6" />
                    </div>
                    <div className="space-y-1">
                        <h2 className="text-base font-bold text-slate-900">Protected Feedback</h2>
                        <p className="text-xs text-slate-500 leading-relaxed">
                            Your feedback helps improve the OJT program. Data submitted is encrypted and reviewed directly by university coordinators.
                        </p>
                    </div>

                    <div className="pt-3 border-t border-slate-100 space-y-2 text-xs font-semibold text-slate-600">
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                            <span>Direct Coordinator Review</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                            <span>Confidential Evaluation System</span>
                        </div>
                    </div>
                </div>

                {/* Right Form Card */}
                <form onSubmit={handleSubmit} className="lg:col-span-8 bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-6">
                    
                    {/* Category Selector */}
                    <div className="space-y-2">
                        <label className="text-xs font-semibold text-slate-600">Select Category</label>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                            {categories.map(({ id, icon: Icon }) => (
                                <button
                                    key={id}
                                    type="button"
                                    onClick={() => setCategory(id)}
                                    className={`flex items-center justify-center gap-2 p-3 rounded-lg border text-xs font-semibold transition-all ${
                                        category === id 
                                        ? 'bg-blue-50 border-blue-300 text-blue-700 shadow-2xs' 
                                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                                    }`}
                                >
                                    <Icon className="w-4 h-4 text-blue-600" />
                                    <span>{id}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Rating Stars */}
                    <div className="space-y-2">
                        <label className="text-xs font-semibold text-slate-600">Overall Rating (1 to 5 Stars)</label>
                        <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
                            <div className="flex gap-1">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        key={star}
                                        type="button"
                                        onClick={() => setRating(star)}
                                        onMouseEnter={() => setHover(star)}
                                        onMouseLeave={() => setHover(0)}
                                        className="transition-transform hover:scale-110 focus:outline-none"
                                    >
                                        <Star 
                                            className={`w-7 h-7 ${
                                                (hover || rating) >= star 
                                                ? 'fill-amber-400 text-amber-400' 
                                                : 'text-slate-300'
                                            }`} 
                                        />
                                    </button>
                                ))}
                            </div>
                            <span className="text-xs font-bold font-mono text-slate-700 ml-auto">{rating} / 5 Stars</span>
                        </div>
                    </div>

                    {/* Detailed Content */}
                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-600">Feedback Details</label>
                        <textarea 
                            rows={5}
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder="Enter detailed feedback or suggestions for improvement..."
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 outline-none focus:border-blue-500 focus:bg-white resize-none"
                        />
                    </div>

                    {/* Submit Button */}
                    <button 
                        type="submit" 
                        disabled={loading}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs py-2.5 rounded-lg transition-all shadow-xs flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        <span>{loading ? 'Submitting...' : 'Submit Program Feedback'}</span>
                        <Send className="w-3.5 h-3.5" />
                    </button>
                </form>
            </div>
        </div>
    );
};

export default StudentFeedback;