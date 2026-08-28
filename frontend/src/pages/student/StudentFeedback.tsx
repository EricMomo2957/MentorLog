import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { 
    Star, ArrowLeft, Send, 
    ShieldCheck, Building2, GraduationCap, Laptop, HelpCircle,
    CheckCircle2, AlertCircle, Edit3, Trash2, RotateCcw, MessageSquare, Calendar
} from 'lucide-react';

interface FeedbackItem {
    id: number;
    student_id: number;
    student_name: string;
    category: string;
    content: string;
    rating: number;
    created_at: string;
}

const StudentFeedback = () => {
    const navigate = useNavigate();
    const [category, setCategory] = useState('Facility');
    const [content, setContent] = useState('');
    const [rating, setRating] = useState(5);
    const [hover, setHover] = useState(0);
    const [loading, setLoading] = useState(false);
    
    const [editingId, setEditingId] = useState<number | null>(null);
    const [myFeedbacks, setMyFeedbacks] = useState<FeedbackItem[]>([]);
    const [fetchingHistory, setFetchingHistory] = useState(true);
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

    const showToast = (message: string, type: 'success' | 'error' = 'success') => {
        setToast({ message, type });
    };

    useEffect(() => {
        if (toast) {
            const timer = setTimeout(() => setToast(null), 3500);
            return () => clearTimeout(timer);
        }
    }, [toast]);

    const categories = [
        { id: 'Facility', icon: Building2 },
        { id: 'Teaching', icon: GraduationCap },
        { id: 'System', icon: Laptop },
        { id: 'Other', icon: HelpCircle },
    ];

    const fetchMyFeedbacks = useCallback(async () => {
        setFetchingHistory(true);
        try {
            const response = await api.get('/feedback/my-feedback');
            if (response.data?.success && Array.isArray(response.data.data)) {
                setMyFeedbacks(response.data.data);
            }
        } catch (err) {
            console.error("Failed to fetch my feedback history", err);
        } finally {
            setFetchingHistory(false);
        }
    }, []);

    useEffect(() => {
        fetchMyFeedbacks();
    }, [fetchMyFeedbacks]);

    const handleCancelEdit = () => {
        setEditingId(null);
        setCategory('Facility');
        setContent('');
        setRating(5);
    };

    const handleStartEdit = (item: FeedbackItem) => {
        setEditingId(item.id);
        setCategory(item.category);
        setContent(item.content);
        setRating(item.rating);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm("Are you sure you want to delete this feedback submission?")) return;

        try {
            const res = await api.delete(`/feedback/my/${id}`);
            if (res.data?.success) {
                showToast("Feedback deleted successfully!");
                if (editingId === id) handleCancelEdit();
                fetchMyFeedbacks();
            } else {
                showToast(res.data?.message || "Failed to delete feedback.", 'error');
            }
        } catch (err: any) {
            showToast(err.response?.data?.message || "Error deleting feedback.", 'error');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!content.trim()) {
            showToast("Content required for submission", 'error');
            return;
        }

        setLoading(true);
        try {
            if (editingId) {
                // Update Existing Feedback
                const response = await api.put(`/feedback/update/${editingId}`, {
                    category,
                    content,
                    rating
                });

                if (response.data?.success) {
                    showToast("Feedback updated successfully!");
                    handleCancelEdit();
                    fetchMyFeedbacks();
                } else {
                    showToast(response.data?.message || "Failed to update feedback", 'error');
                }
            } else {
                // Create New Feedback
                const response = await api.post('/feedback/submit', {
                    category,
                    content,
                    rating
                });

                if (response.data?.success) {
                    showToast("Feedback submitted successfully!");
                    handleCancelEdit();
                    fetchMyFeedbacks();
                } else {
                    showToast(response.data?.message || "Failed to submit feedback", 'error');
                }
            }
        } catch (error: any) {
            showToast(error.response?.data?.message || "Network connection error", 'error');
        } finally {
            setLoading(false);
        }
    };

    const getCategoryIcon = (catName: string) => {
        switch (catName) {
            case 'Facility': return <Building2 className="w-4 h-4 text-blue-600" />;
            case 'Teaching': return <GraduationCap className="w-4 h-4 text-indigo-600" />;
            case 'System': return <Laptop className="w-4 h-4 text-purple-600" />;
            default: return <HelpCircle className="w-4 h-4 text-amber-600" />;
        }
    };

    return (
        <div className="space-y-6 max-w-7xl mx-auto pb-12">
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
                    <p className="text-xs text-slate-500 mt-0.5">Submit evaluation feedback and review your previously submitted entries</p>
                </div>

                <div className="flex items-center gap-3">
                    <button 
                        onClick={() => navigate('/student-dashboard')} 
                        className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold px-4 py-2.5 rounded-lg shadow-xs transition-all flex items-center gap-2 cursor-pointer"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span>Back to Dashboard</span>
                    </button>
                </div>
            </div>

            {/* Top Form Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Left Security Info */}
                <div className="lg:col-span-4 bg-[#f0f4fe] border border-indigo-200/90 rounded-2xl p-6 shadow-xs space-y-4 h-fit">
                    <div className="w-12 h-12 bg-indigo-600 text-white rounded-xl flex items-center justify-center shadow-xs">
                        <ShieldCheck className="w-6 h-6" />
                    </div>
                    <div className="space-y-1">
                        <h2 className="text-base font-bold text-indigo-950">Protected Feedback</h2>
                        <p className="text-xs text-indigo-800/90 leading-relaxed">
                            Your feedback helps improve the OJT program. Data submitted is encrypted and reviewed directly by university coordinators.
                        </p>
                    </div>

                    <div className="pt-3 border-t border-indigo-200/70 space-y-2 text-xs font-semibold text-indigo-900">
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
                <form onSubmit={handleSubmit} className="lg:col-span-8 bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-6">
                    
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                            <MessageSquare className="w-4 h-4 text-blue-600" />
                            <span>{editingId ? 'Edit Submitted Feedback' : 'Submit Program Evaluation'}</span>
                        </h3>

                        {editingId && (
                            <button
                                type="button"
                                onClick={handleCancelEdit}
                                className="text-xs font-semibold text-slate-500 hover:text-slate-800 flex items-center gap-1 cursor-pointer"
                            >
                                <RotateCcw className="w-3.5 h-3.5" />
                                <span>Cancel Edit</span>
                            </button>
                        )}
                    </div>

                    {/* Category Selector */}
                    <div className="space-y-2">
                        <label className="text-xs font-semibold text-slate-600">Select Category</label>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                            {categories.map(({ id, icon: Icon }) => (
                                <button
                                    key={id}
                                    type="button"
                                    onClick={() => setCategory(id)}
                                    className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                                        category === id 
                                        ? 'bg-blue-600 text-white border-blue-600 shadow-xs' 
                                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                                    }`}
                                >
                                    <Icon className={`w-4 h-4 ${category === id ? 'text-white' : 'text-blue-600'}`} />
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
                                        className="transition-transform hover:scale-110 focus:outline-none cursor-pointer"
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
                            rows={4}
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder="Enter detailed feedback or suggestions for improvement..."
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 outline-none focus:border-blue-500 focus:bg-white resize-none"
                        />
                    </div>

                    {/* Submit / Save Button */}
                    <div className="flex gap-3">
                        {editingId && (
                            <button 
                                type="button" 
                                onClick={handleCancelEdit}
                                className="w-1/3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs py-2.5 rounded-xl transition-all cursor-pointer"
                            >
                                Cancel
                            </button>
                        )}
                        <button 
                            type="submit" 
                            disabled={loading}
                            className={`flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-2.5 rounded-xl transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50`}
                        >
                            <span>{loading ? 'Processing...' : editingId ? 'Update Feedback Entry' : 'Submit Program Feedback'}</span>
                            <Send className="w-3.5 h-3.5" />
                        </button>
                    </div>
                </form>
            </div>

            {/* Bottom History Grid - My Submitted Feedback Entries */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div>
                        <h3 className="text-base font-extrabold text-slate-900 tracking-tight">My Submitted Feedback History</h3>
                        <p className="text-xs text-slate-500">View, update, or remove your previous program evaluations</p>
                    </div>
                    <span className="text-xs font-mono font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
                        {myFeedbacks.length} Submissions
                    </span>
                </div>

                {fetchingHistory ? (
                    <div className="py-12 text-center text-slate-400 text-xs font-medium animate-pulse">
                        Retrieving your feedback history...
                    </div>
                ) : myFeedbacks.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {myFeedbacks.map((item) => (
                            <div 
                                key={item.id}
                                className={`p-4 rounded-xl border transition-all space-y-3 flex flex-col justify-between ${
                                    editingId === item.id 
                                    ? 'bg-blue-50/70 border-blue-300 ring-2 ring-blue-100' 
                                    : 'bg-slate-50/70 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                                }`}
                            >
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-800 shadow-2xs">
                                            {getCategoryIcon(item.category)}
                                            <span>{item.category}</span>
                                        </div>

                                        {/* Render Rating Stars */}
                                        <div className="flex items-center gap-0.5 bg-white px-2 py-0.5 rounded-lg border border-slate-200">
                                            {[1, 2, 3, 4, 5].map((s) => (
                                                <Star 
                                                    key={s} 
                                                    className={`w-3.5 h-3.5 ${
                                                        s <= item.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'
                                                    }`} 
                                                />
                                            ))}
                                            <span className="text-[10px] font-mono font-bold text-slate-600 ml-1">{item.rating}/5</span>
                                        </div>
                                    </div>

                                    <p className="text-xs text-slate-800 leading-relaxed font-medium pt-1">
                                        "{item.content}"
                                    </p>
                                </div>

                                <div className="flex items-center justify-between pt-3 border-t border-slate-200/80">
                                    <span className="text-[10px] font-mono text-slate-500 flex items-center gap-1">
                                        <Calendar className="w-3 h-3 text-slate-400" />
                                        {new Date(item.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                    </span>

                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => handleStartEdit(item)}
                                            className="px-2.5 py-1 bg-white border border-blue-200 hover:bg-blue-50 text-blue-700 rounded-lg text-xs font-bold transition-all shadow-2xs flex items-center gap-1 cursor-pointer"
                                        >
                                            <Edit3 className="w-3 h-3 text-blue-600" />
                                            <span>Edit</span>
                                        </button>

                                        <button
                                            onClick={() => handleDelete(item.id)}
                                            className="px-2.5 py-1 bg-white border border-rose-200 hover:bg-rose-50 text-rose-700 rounded-lg text-xs font-bold transition-all shadow-2xs flex items-center gap-1 cursor-pointer"
                                        >
                                            <Trash2 className="w-3 h-3 text-rose-600" />
                                            <span>Delete</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="py-12 text-center text-slate-400 text-xs italic bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
                        You have not submitted any program feedback entries yet.
                    </div>
                )}
            </div>
        </div>
    );
};

export default StudentFeedback;