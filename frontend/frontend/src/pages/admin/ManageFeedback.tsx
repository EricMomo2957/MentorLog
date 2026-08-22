import { useState, useEffect } from 'react';
import api from '../../services/api';
import { 
    Star, Trash2, Search, Filter, Download, ChevronLeft, ChevronRight, MessageSquare, Heart, Bug 
} from 'lucide-react';

interface Feedback {
    id: number;
    student_name: string;
    category: string;
    content: string;
    rating: number;
    created_at: string;
    profile_pic?: string;
}

const getFullPicUrl = (path?: string) => {
    if (!path) return '';
    if (path.startsWith('http://') || path.startsWith('https://')) return path;
    return `http://localhost:5000${path}`;
};

const pastelAvatarStyles = [
    'bg-purple-100 text-purple-700 border-purple-200',
    'bg-blue-100 text-blue-700 border-blue-200',
    'bg-pink-100 text-pink-700 border-pink-200',
    'bg-emerald-100 text-emerald-700 border-emerald-200',
    'bg-amber-100 text-amber-700 border-amber-200',
    'bg-rose-100 text-rose-700 border-rose-200',
    'bg-indigo-100 text-indigo-700 border-indigo-200',
];
const getAvatarStyle = (id: number) => pastelAvatarStyles[id % pastelAvatarStyles.length];

const getInitials = (name?: string) => {
    if (!name) return 'UN';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name.slice(0, 2).toUpperCase();
};

const ManageFeedback = () => {
    const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState<string>('All');
    const [selectedFeedbacks, setSelectedFeedbacks] = useState<number[]>([]);

    const fetchFeedbacks = async () => {
        setLoading(true);
        try {
            const response = await api.get('/feedback/all');
            const data = response.data;
            if (data?.success) setFeedbacks(data.data);
            else if (Array.isArray(data)) setFeedbacks(data);
        } catch (error) {
            console.error("Fetch error:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchFeedbacks(); }, []);

    const deleteFeedback = async (id: number) => {
        if (!window.confirm("Delete this feedback entry?")) return;
        try {
            await api.delete(`/feedback/${id}`);
            setFeedbacks(feedbacks.filter(f => f.id !== id));
        } catch (_error) {
            console.error("Delete failed");
        }
    };

    const categories = Array.from(new Set(feedbacks.map(f => f.category)));

    const filteredFeedbacks = feedbacks.filter(f => {
        const matchesSearch = f.student_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            f.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
            f.category.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = filterCategory === 'All' || f.category === filterCategory;
        return matchesSearch && matchesCategory;
    });

    const toggleSelectAll = () => {
        if (selectedFeedbacks.length === filteredFeedbacks.length) {
            setSelectedFeedbacks([]);
        } else {
            setSelectedFeedbacks(filteredFeedbacks.map(f => f.id));
        }
    };

    const toggleSelectFeedback = (id: number) => {
        if (selectedFeedbacks.includes(id)) {
            setSelectedFeedbacks(prev => prev.filter(item => item !== id));
        } else {
            setSelectedFeedbacks(prev => [...prev, id]);
        }
    };

    const fiveStarCount = feedbacks.filter(f => f.rating === 5).length;
    const avgRating = feedbacks.length > 0 ? (feedbacks.reduce((acc, curr) => acc + curr.rating, 0) / feedbacks.length).toFixed(1) : '5.0';
    const totalCount = feedbacks.length;
    const bugCount = feedbacks.filter(f => f.category.toLowerCase().includes('bug') || f.category.toLowerCase().includes('issue')).length;

    return (
        <div className="space-y-6 max-w-7xl mx-auto">
            
            {/* Top Title & Primary Action Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">OJT Program Feedback & Ratings</h1>
                    <p className="text-xs text-slate-500 mt-0.5">Review student evaluation ratings, suggestions, and program feedback</p>
                </div>

                <div className="flex items-center gap-3">
                    <button 
                        onClick={() => alert("Exporting feedback records...")} 
                        className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold px-4 py-2.5 rounded-lg shadow-xs transition-all flex items-center gap-2"
                    >
                        <Download className="w-4 h-4" />
                        <span>Export Feedback</span>
                    </button>
                </div>
            </div>

            {/* Status Metric Cards Grid with Light Earth Tone Colors */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {/* 5-Star Reviews */}
                <div 
                    onClick={() => setFilterCategory('All')}
                    className="bg-[#fcf8f1] border-[#f5e6d2] hover:border-[#e6cb9f] rounded-2xl border p-5 text-center flex flex-col items-center justify-center shadow-xs transition-all hover:shadow-xs cursor-pointer active:scale-98"
                >
                    <div className="w-11 h-11 rounded-xl bg-[#f8ead7] border border-[#edd6b6] text-[#996825] flex items-center justify-center mb-2.5">
                        <Star className="w-5 h-5 fill-[#996825]" />
                    </div>
                    <span className="text-[11px] font-extrabold text-[#946e38] tracking-wider uppercase mb-1">
                        5-STAR REVIEWS
                    </span>
                    <span className="text-3xl font-black text-[#6e4614]">
                        {fiveStarCount}
                    </span>
                </div>

                {/* Average Rating */}
                <div 
                    onClick={() => setFilterCategory('All')}
                    className="bg-[#f2f6f3] border-[#d4e2d6] hover:border-[#b0c7b3] rounded-2xl border p-5 text-center flex flex-col items-center justify-center shadow-xs transition-all hover:shadow-xs cursor-pointer active:scale-98"
                >
                    <div className="w-11 h-11 rounded-xl bg-[#e0ece2] border border-[#c0d6c3] text-[#2d4a34] flex items-center justify-center mb-2.5">
                        <Heart className="w-5 h-5 fill-[#2d4a34]" />
                    </div>
                    <span className="text-[11px] font-extrabold text-[#486650] tracking-wider uppercase mb-1">
                        AVERAGE RATING
                    </span>
                    <span className="text-3xl font-black text-[#243c2a]">
                        {avgRating} <span className="text-xs font-bold text-[#946e38]">★</span>
                    </span>
                </div>

                {/* Bug / Issue Reports */}
                <div 
                    onClick={() => setFilterCategory(filterCategory === 'Bug Report' ? 'All' : 'Bug Report')}
                    className={`rounded-2xl border p-5 text-center flex flex-col items-center justify-center cursor-pointer transition-all duration-200 hover:shadow-xs active:scale-98 bg-[#faf2f4] ${
                        filterCategory === 'Bug Report' ? 'border-[#9c4b60] ring-2 ring-[#9c4b60]/20 shadow-xs' : 'border-[#f3d7df] hover:border-[#e2b4c2]'
                    }`}
                >
                    <div className="w-11 h-11 rounded-xl bg-[#f6e1e6] border border-[#ebc8d1] text-[#9c4b60] flex items-center justify-center mb-2.5">
                        <Bug className="w-5 h-5" />
                    </div>
                    <span className="text-[11px] font-extrabold text-[#995364] tracking-wider uppercase mb-1">
                        BUG REPORTS
                    </span>
                    <span className="text-3xl font-black text-[#6e2f3e]">
                        {bugCount}
                    </span>
                </div>

                {/* Total Feedback */}
                <div 
                    onClick={() => setFilterCategory('All')}
                    className="bg-[#f6f4f8] border-[#e4dfed] hover:border-[#c7bed8] rounded-2xl border p-5 text-center flex flex-col items-center justify-center shadow-xs transition-all hover:shadow-xs cursor-pointer active:scale-98"
                >
                    <div className="w-11 h-11 rounded-xl bg-[#eae5f3] border border-[#d6cdcf] text-[#59516e] flex items-center justify-center mb-2.5">
                        <MessageSquare className="w-5 h-5" />
                    </div>
                    <span className="text-[11px] font-extrabold text-[#645b7d] tracking-wider uppercase mb-1">
                        TOTAL FEEDBACKS
                    </span>
                    <span className="text-3xl font-black text-[#3c364c]">
                        {totalCount}
                    </span>
                </div>
            </div>

            {/* Filter & Control Bar (Automoor Style) */}
            <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
                
                {/* Left Filter Pill Buttons */}
                <div className="flex flex-wrap items-center gap-2">
                    <div className="relative">
                        <select 
                            value={filterCategory}
                            onChange={(e) => setFilterCategory(e.target.value)}
                            className="appearance-none bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 pr-8 text-xs font-medium text-slate-700 outline-none focus:border-blue-500 cursor-pointer"
                        >
                            <option value="All">Category: All Categories</option>
                            {categories.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                        <Filter className="w-3 h-3 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>

                    <button className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 transition-all flex items-center gap-1.5">
                        <span>Rating ★</span>
                        <span className="text-slate-400">▾</span>
                    </button>
                </div>

                {/* Right Search Input */}
                <div className="relative w-full sm:w-64">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input 
                        type="text"
                        placeholder="Search feedback or student..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 outline-none focus:bg-white focus:border-blue-500 transition-all"
                    />
                </div>
            </div>

            {/* SaaS Table Container */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
                {loading ? (
                    <div className="py-20 text-center text-slate-400 text-xs font-medium animate-pulse">
                        Analyzing student feedback...
                    </div>
                ) : filteredFeedbacks.length === 0 ? (
                    <div className="py-16 text-center text-slate-500 text-xs font-medium">
                        No feedback records found.
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                                    <th className="py-3 px-4 w-10 text-center">
                                        <input 
                                            type="checkbox"
                                            checked={selectedFeedbacks.length === filteredFeedbacks.length && filteredFeedbacks.length > 0}
                                            onChange={toggleSelectAll}
                                            className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                        />
                                    </th>
                                    <th className="py-3 px-4">Student Contact ↕</th>
                                    <th className="py-3 px-4">Category ↕</th>
                                    <th className="py-3 px-4">Rating ↕</th>
                                    <th className="py-3 px-4">Feedback Content ↕</th>
                                    <th className="py-3 px-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                                {filteredFeedbacks.map((f) => {
                                    const avatarStyle = getAvatarStyle(f.id);
                                    const initials = getInitials(f.student_name);
                                    const isChecked = selectedFeedbacks.includes(f.id);

                                    return (
                                        <tr key={f.id} className={`hover:bg-slate-50/80 transition-colors ${isChecked ? 'bg-blue-50/30' : ''}`}>
                                            <td className="py-3.5 px-4 text-center">
                                                <input 
                                                    type="checkbox"
                                                    checked={isChecked}
                                                    onChange={() => toggleSelectFeedback(f.id)}
                                                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                                />
                                            </td>
                                            
                                            {/* Student Contact with Photo or Pastel Initial Avatar */}
                                            <td className="py-3.5 px-4">
                                                <div className="flex items-center gap-3">
                                                    {f.profile_pic ? (
                                                        <img 
                                                            src={getFullPicUrl(f.profile_pic)} 
                                                            alt={f.student_name} 
                                                            className="w-8 h-8 rounded-full object-cover border border-slate-200 shrink-0 shadow-xs" 
                                                        />
                                                    ) : (
                                                        <div className={`w-8 h-8 rounded-full border flex items-center justify-center font-bold text-xs shrink-0 ${avatarStyle}`}>
                                                            {initials}
                                                        </div>
                                                    )}
                                                    <div>
                                                        <p className="font-bold text-slate-900 leading-tight">{f.student_name || 'Anonymous Intern'}</p>
                                                        <p className="text-[10px] text-slate-400 font-mono">
                                                            {new Date(f.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Category */}
                                            <td className="py-3.5 px-4">
                                                <span className="inline-block px-2.5 py-0.5 text-[11px] font-semibold text-blue-700 bg-blue-50 border border-blue-200 rounded-full">
                                                    {f.category}
                                                </span>
                                            </td>

                                            {/* Rating Stars */}
                                            <td className="py-3.5 px-4">
                                                <div className="flex items-center gap-0.5">
                                                    {[...Array(5)].map((_, i) => (
                                                        <Star 
                                                            key={i} 
                                                            className={`w-3.5 h-3.5 ${i < f.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`} 
                                                        />
                                                    ))}
                                                    <span className="text-[11px] font-semibold text-slate-600 ml-1.5">{f.rating}/5</span>
                                                </div>
                                            </td>

                                            {/* Content */}
                                            <td className="py-3.5 px-4 max-w-md">
                                                <p className="text-slate-700 text-xs italic font-medium leading-relaxed">
                                                    "{f.content}"
                                                </p>
                                            </td>

                                            {/* Actions */}
                                            <td className="py-3.5 px-4 text-right">
                                                <button 
                                                    onClick={() => deleteFeedback(f.id)}
                                                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-all"
                                                    title="Delete Feedback"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Table Footer Pagination */}
                <div className="bg-slate-50/50 border-t border-slate-200 px-4 py-3 flex items-center justify-between text-xs text-slate-500">
                    <div className="flex items-center gap-2">
                        <span>Displaying</span>
                        <select className="bg-white border border-slate-200 rounded px-2 py-1 text-xs text-slate-700 outline-none">
                            <option value="10">10</option>
                            <option value="20">20</option>
                            <option value="50">50</option>
                        </select>
                        <span>out of {filteredFeedbacks.length} feedback entries</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                        <button className="p-1 rounded border border-slate-200 hover:bg-white disabled:opacity-50" disabled>
                            <ChevronLeft className="w-3.5 h-3.5 text-slate-600" />
                        </button>
                        <button className="px-2.5 py-1 rounded bg-blue-600 text-white font-semibold text-xs">1</button>
                        <button className="p-1 rounded border border-slate-200 hover:bg-white disabled:opacity-50" disabled>
                            <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ManageFeedback;