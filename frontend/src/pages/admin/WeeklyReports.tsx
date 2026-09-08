import { useState, useEffect, useCallback } from 'react';
import api from '../../services/api';
import { 
    BarChart3, BookOpen, Star, CheckCircle2, AlertTriangle, 
    Calendar, Clock, RefreshCw, X, MessageSquare,
    Search, Award, Sparkles, ChevronRight
} from 'lucide-react';

interface ReportData {
    student_name: string;
    total_hours: number;
    late_count: number;
    total_days: number;
}

interface JournalData {
    id: number;
    student_id: number;
    student_name: string;
    student_number: string;
    course: string;
    school_name: string;
    profile_pic?: string;
    week_number: number;
    start_date: string;
    end_date: string;
    total_hours_rendered: number;
    tasks_completed: string;
    skills_acquired: string | null;
    challenges_and_solutions: string | null;
    plan_next_week: string | null;
    attachment_url: string | null;
    status: 'Submitted' | 'Approved' | 'Needs Revision';
    mentor_feedback: string | null;
    mentor_rating: number | null;
    submitted_at: string;
    reviewed_at: string | null;
}

const pastelAvatarStyles = [
    'bg-blue-100 text-blue-700 border-blue-200',
    'bg-purple-100 text-purple-700 border-purple-200',
    'bg-emerald-100 text-emerald-700 border-emerald-200',
    'bg-amber-100 text-amber-700 border-amber-200',
    'bg-rose-100 text-rose-700 border-rose-200',
    'bg-indigo-100 text-indigo-700 border-indigo-200',
    'bg-cyan-100 text-cyan-700 border-cyan-200',
];

const getAvatarStyle = (id: number) => pastelAvatarStyles[id % pastelAvatarStyles.length];

const getInitials = (name?: string) => {
    if (!name) return 'IN';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name.slice(0, 2).toUpperCase();
};

const getFullPicUrl = (path?: string) => {
    if (!path) return '';
    if (path.startsWith('http://') || path.startsWith('https://')) return path;
    return `http://localhost:5000${path}`;
};

const WeeklyReports = () => {
    const [activeTab, setActiveTab] = useState<'journals' | 'telemetry'>('journals');
    const [reports, setReports] = useState<ReportData[]>([]);
    const [journals, setJournals] = useState<JournalData[]>([]);
    const [loadingReports, setLoadingReports] = useState(true);
    const [loadingJournals, setLoadingJournals] = useState(false);

    // Journal Review Modal states
    const [selectedJournal, setSelectedJournal] = useState<JournalData | null>(null);
    const [reviewStatus, setReviewStatus] = useState<'Approved' | 'Needs Revision'>('Approved');
    const [mentorRating, setMentorRating] = useState<number>(5);
    const [mentorFeedback, setMentorFeedback] = useState<string>('');
    const [submittingReview, setSubmittingReview] = useState(false);

    // Search and filters
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<'All' | 'Submitted' | 'Approved' | 'Needs Revision'>('All');
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'warning' } | null>(null);

    const fetchWeeklyReport = useCallback(async () => {
        try {
            setLoadingReports(true);
            const response = await api.get('/attendance/weekly-report');
            const result = response.data;
            if (result?.success && Array.isArray(result.data)) {
                setReports(result.data);
            } else if (Array.isArray(result)) {
                setReports(result);
            }
        } catch (error) {
            console.error("Error fetching weekly report:", error);
        } finally {
            setLoadingReports(false);
        }
    }, []);

    const fetchJournals = useCallback(async () => {
        try {
            setLoadingJournals(true);
            const response = await api.get('/journals/all');
            if (response.data?.success && Array.isArray(response.data.data)) {
                setJournals(response.data.data);
            }
        } catch (error) {
            console.error("Error fetching journals:", error);
        } finally {
            setLoadingJournals(false);
        }
    }, []);

    useEffect(() => {
        fetchWeeklyReport();
        fetchJournals();
    }, [fetchWeeklyReport, fetchJournals]);

    useEffect(() => {
        if (toast) {
            const timer = setTimeout(() => setToast(null), 4000);
            return () => clearTimeout(timer);
        }
    }, [toast]);

    const handleOpenReview = (journal: JournalData) => {
        setSelectedJournal(journal);
        setReviewStatus(journal.status === 'Needs Revision' ? 'Needs Revision' : 'Approved');
        setMentorRating(journal.mentor_rating || 5);
        setMentorFeedback(journal.mentor_feedback || '');
    };

    const handleSaveReview = async () => {
        if (!selectedJournal) return;
        try {
            setSubmittingReview(true);
            const res = await api.put(`/journals/${selectedJournal.id}/review`, {
                status: reviewStatus,
                mentor_rating: mentorRating,
                mentor_feedback: mentorFeedback.trim()
            });

            if (res.data?.success) {
                setToast({ message: "Journal review and sign-off saved successfully!", type: 'success' });
                setSelectedJournal(null);
                fetchJournals();
            } else {
                setToast({ message: res.data?.message || "Failed to save review", type: 'error' });
            }
        } catch (err: any) {
            setToast({ message: err.response?.data?.message || "Error submitting review", type: 'error' });
        } finally {
            setSubmittingReview(false);
        }
    };

    const formatDate = (dateStr?: string | null) => {
        if (!dateStr) return '--';
        const clean = dateStr.split('T')[0];
        const d = new Date(clean + 'T00:00:00');
        return isNaN(d.getTime()) ? clean : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    // Calculate Summary KPIs
    const totalJournals = journals.length;
    const pendingCount = journals.filter(j => j.status === 'Submitted').length;
    const approvedCount = journals.filter(j => j.status === 'Approved').length;
    const needsRevisionCount = journals.filter(j => j.status === 'Needs Revision').length;
    
    const ratedJournals = journals.filter(j => typeof j.mentor_rating === 'number' && j.mentor_rating > 0);
    const avgRating = ratedJournals.length > 0 
        ? (ratedJournals.reduce((sum, j) => sum + (j.mentor_rating || 0), 0) / ratedJournals.length).toFixed(1)
        : '5.0';

    const filteredJournals = journals.filter(j => {
        const query = searchQuery.toLowerCase();
        const matchesQuery = !searchQuery || 
            j.student_name?.toLowerCase().includes(query) ||
            j.student_number?.toLowerCase().includes(query) ||
            j.course?.toLowerCase().includes(query) ||
            `week ${j.week_number}`.toLowerCase().includes(query);
        const matchesStatus = statusFilter === 'All' || j.status === statusFilter;
        return matchesQuery && matchesStatus;
    });

    const getRatingLabel = (rating: number) => {
        switch (rating) {
            case 5: return '⭐⭐⭐⭐⭐ Outstanding Performance';
            case 4: return '⭐⭐⭐⭐ Very Good Execution';
            case 3: return '⭐⭐⭐ Satisfactory / Met Expectations';
            case 2: return '⭐⭐ Needs Minor Improvement';
            case 1: return '⭐ Unsatisfactory';
            default: return '';
        }
    };

    return (
        <div className="space-y-6 max-w-7xl mx-auto pb-12 font-sans text-slate-800">
            {/* Toast System */}
            {toast && (
                <div className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-2xl shadow-xl border text-xs font-semibold flex items-center gap-2.5 animate-in fade-in slide-in-from-bottom-3 ${
                    toast.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 
                    toast.type === 'warning' ? 'bg-amber-50 border-amber-200 text-amber-800' :
                    'bg-rose-50 border-rose-200 text-rose-800'
                }`}>
                    {toast.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> : 
                     toast.type === 'warning' ? <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" /> :
                     <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />}
                    <span>{toast.message}</span>
                </div>
            )}

            {/* Header Section with subtle branding */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2">
                        <span className="px-2.5 py-1 bg-blue-50 text-blue-700 text-[11px] font-bold rounded-lg uppercase tracking-wider border border-blue-200/70">
                            Internship Performance & Mentorship
                        </span>
                    </div>
                    <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-1.5">Weekly OJT Reports & Journals</h1>
                    <p className="text-xs text-slate-500 mt-0.5">
                        Track intern accomplishments, review weekly narrative journals, and issue formal mentor sign-offs.
                    </p>
                </div>

                {/* Primary Tab Switcher */}
                <div className="flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-2xl border border-slate-200/80 shadow-2xs self-start md:self-auto">
                    <button
                        onClick={() => setActiveTab('journals')}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                            activeTab === 'journals'
                                ? 'bg-white text-blue-600 shadow-sm border border-slate-200/60'
                                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                        }`}
                    >
                        <BookOpen className="w-3.5 h-3.5 text-blue-600" />
                        <span>Accomplishment Journals</span>
                        {pendingCount > 0 && (
                            <span className="px-1.5 py-0.2 bg-amber-500 text-white rounded-full text-[10px] font-black">
                                {pendingCount}
                            </span>
                        )}
                    </button>
                    <button
                        onClick={() => setActiveTab('telemetry')}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                            activeTab === 'telemetry'
                                ? 'bg-white text-blue-600 shadow-sm border border-slate-200/60'
                                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                        }`}
                    >
                        <BarChart3 className="w-3.5 h-3.5 text-slate-600" />
                        <span>Hours Telemetry</span>
                    </button>
                </div>
            </div>

            {/* KPI Metric Cards Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {/* Total Submissions */}
                <div 
                    onClick={() => { setActiveTab('journals'); setStatusFilter('All'); }}
                    className="rounded-2xl border border-[#d6e0fc] bg-[#f0f4fe] p-5 text-center flex flex-col items-center justify-center cursor-pointer transition-all duration-200 hover:shadow-xs active:scale-98"
                >
                    <div className="w-11 h-11 rounded-xl bg-[#e0e8fd] border border-[#cbd8fc] text-[#3b5998] flex items-center justify-center mb-2.5">
                        <BookOpen className="w-5 h-5" />
                    </div>
                    <span className="text-[11px] font-extrabold text-[#4766b0] tracking-wider uppercase mb-1">
                        TOTAL JOURNALS
                    </span>
                    <span className="text-3xl font-black text-[#263e73]">
                        {totalJournals}
                    </span>
                </div>

                {/* Pending Review */}
                <div 
                    onClick={() => { setActiveTab('journals'); setStatusFilter('Submitted'); }}
                    className={`rounded-2xl border p-5 text-center flex flex-col items-center justify-center cursor-pointer transition-all duration-200 hover:shadow-xs active:scale-98 bg-[#fcf8f1] ${
                        statusFilter === 'Submitted' && activeTab === 'journals' ? 'border-[#996825] ring-2 ring-[#996825]/20 shadow-xs' : 'border-[#f5e6d2] hover:border-[#e6cb9f]'
                    }`}
                >
                    <div className="w-11 h-11 rounded-xl bg-[#f8ead7] border border-[#edd6b6] text-[#996825] flex items-center justify-center mb-2.5">
                        <Clock className="w-5 h-5" />
                    </div>
                    <span className="text-[11px] font-extrabold text-[#946e38] tracking-wider uppercase mb-1">
                        PENDING REVIEW
                    </span>
                    <span className="text-3xl font-black text-[#6e4614]">
                        {pendingCount}
                    </span>
                </div>

                {/* Approved & Signed */}
                <div 
                    onClick={() => { setActiveTab('journals'); setStatusFilter('Approved'); }}
                    className={`rounded-2xl border p-5 text-center flex flex-col items-center justify-center cursor-pointer transition-all duration-200 hover:shadow-xs active:scale-98 bg-[#f2f6f3] ${
                        statusFilter === 'Approved' && activeTab === 'journals' ? 'border-[#2d4a34] ring-2 ring-[#2d4a34]/20 shadow-xs' : 'border-[#d4e2d6] hover:border-[#b0c7b3]'
                    }`}
                >
                    <div className="w-11 h-11 rounded-xl bg-[#e0ece2] border border-[#c0d6c3] text-[#2d4a34] flex items-center justify-center mb-2.5">
                        <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <span className="text-[11px] font-extrabold text-[#486650] tracking-wider uppercase mb-1">
                        APPROVED & SIGNED
                    </span>
                    <span className="text-3xl font-black text-[#243c2a]">
                        {approvedCount}
                    </span>
                </div>

                {/* Average Mentor Rating */}
                <div 
                    className="rounded-2xl border border-[#f3e8ff] bg-[#faf5ff] p-5 text-center flex flex-col items-center justify-center transition-all duration-200 hover:shadow-xs"
                >
                    <div className="w-11 h-11 rounded-xl bg-[#ede2fe] border border-[#e0cbfe] text-[#7939b5] flex items-center justify-center mb-2.5">
                        <Star className="w-5 h-5 fill-[#7939b5]" />
                    </div>
                    <span className="text-[11px] font-extrabold text-[#7939b5] tracking-wider uppercase mb-1">
                        AVG MENTOR RATING
                    </span>
                    <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-black text-[#4f207d]">
                            {avgRating}
                        </span>
                        <span className="text-xs font-bold text-[#7939b5]">/ 5.0</span>
                    </div>
                </div>
            </div>

            {/* TAB: ACCOMPLISHMENT JOURNALS */}
            {activeTab === 'journals' && (
                <div className="space-y-5">
                    {/* Filter, Search and Status Bar */}
                    <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
                        <div className="relative w-full sm:w-80">
                            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search by intern name, course, or week..."
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-blue-500 transition-all font-medium"
                            />
                        </div>

                        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
                            <div className="flex gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200/70 text-xs">
                                {(
                                    [
                                        { id: 'All', label: 'All', count: totalJournals },
                                        { id: 'Submitted', label: 'Pending Review', count: pendingCount },
                                        { id: 'Approved', label: 'Approved', count: approvedCount },
                                        { id: 'Needs Revision', label: 'Needs Revision', count: needsRevisionCount },
                                    ] as const
                                ).map((status) => (
                                    <button
                                        key={status.id}
                                        onClick={() => setStatusFilter(status.id)}
                                        className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 cursor-pointer text-xs ${
                                            statusFilter === status.id
                                                ? 'bg-white text-blue-700 shadow-2xs border border-slate-200/60 font-black'
                                                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                                        }`}
                                    >
                                        <span>{status.label}</span>
                                        <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                                            statusFilter === status.id ? 'bg-blue-100 text-blue-700 font-black' : 'bg-slate-200 text-slate-600'
                                        }`}>
                                            {status.count}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Journals Grid */}
                    {loadingJournals ? (
                        <div className="py-20 flex flex-col items-center justify-center text-slate-400 gap-3 bg-white rounded-2xl border border-slate-200/90 shadow-xs">
                            <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
                            <span className="text-xs font-semibold text-slate-600">Loading student accomplishment journals...</span>
                        </div>
                    ) : filteredJournals.length === 0 ? (
                        <div className="bg-white p-16 rounded-2xl border border-slate-200/90 shadow-xs text-center space-y-3">
                            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 mx-auto flex items-center justify-center">
                                <BookOpen className="w-6 h-6" />
                            </div>
                            <h3 className="text-sm font-bold text-slate-800">No Weekly Journals Found</h3>
                            <p className="text-xs text-slate-500 max-w-md mx-auto">
                                No student narrative journals match your filter criteria. When interns submit weekly journals from their portal, they will appear here for sign-off.
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            {filteredJournals.map((journal) => {
                                const avatarStyle = getAvatarStyle(journal.id || 1);
                                return (
                                    <div 
                                        key={journal.id} 
                                        className="bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-md hover:border-blue-300 transition-all p-6 flex flex-col justify-between space-y-4 group"
                                    >
                                        <div className="space-y-4">
                                            {/* Top Card Bar: Student info & Week + Status Badge */}
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="flex items-center gap-3">
                                                    {journal.profile_pic ? (
                                                        <img 
                                                            src={getFullPicUrl(journal.profile_pic)} 
                                                            alt={journal.student_name}
                                                            className="w-11 h-11 rounded-xl object-cover border border-slate-200 shadow-2xs shrink-0" 
                                                        />
                                                    ) : (
                                                        <div className={`w-11 h-11 rounded-xl border flex items-center justify-center font-black text-xs shrink-0 ${avatarStyle}`}>
                                                            {getInitials(journal.student_name)}
                                                        </div>
                                                    )}
                                                    <div>
                                                        <h3 className="text-sm font-bold text-slate-900 leading-tight group-hover:text-blue-600 transition-colors">
                                                            {journal.student_name}
                                                        </h3>
                                                        <div className="flex items-center gap-2 mt-0.5">
                                                            <span className="text-[11px] font-medium text-slate-500">
                                                                {journal.course || 'BS Information Technology'}
                                                            </span>
                                                            {journal.student_number && (
                                                                <>
                                                                    <span className="text-slate-300">•</span>
                                                                    <span className="text-[11px] font-mono text-slate-400">
                                                                        {journal.student_number}
                                                                    </span>
                                                                </>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex flex-col items-end gap-1.5 shrink-0">
                                                    <span className="px-2.5 py-1 bg-blue-50 text-blue-700 border border-blue-200/80 rounded-lg text-xs font-bold font-mono">
                                                        Week #{journal.week_number}
                                                    </span>
                                                    {journal.status === 'Approved' ? (
                                                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200">
                                                            <CheckCircle2 className="w-3 h-3" /> Approved
                                                        </span>
                                                    ) : journal.status === 'Needs Revision' ? (
                                                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200">
                                                            <AlertTriangle className="w-3 h-3" /> Needs Revision
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold text-blue-700 bg-blue-50 border border-blue-200">
                                                            <Clock className="w-3 h-3" /> Pending Review
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Period and Hours Info Pill */}
                                            <div className="flex items-center justify-between text-xs text-slate-600 bg-slate-50 rounded-xl px-3.5 py-2 border border-slate-100 font-medium">
                                                <div className="flex items-center gap-1.5 text-slate-600">
                                                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                                                    <span>{formatDate(journal.start_date)} — {formatDate(journal.end_date)}</span>
                                                </div>
                                                <div className="flex items-center gap-1 font-bold text-blue-700 bg-blue-100/70 px-2 py-0.5 rounded-md text-[11px]">
                                                    <Clock className="w-3 h-3" />
                                                    <span>{Number(journal.total_hours_rendered || 0).toFixed(1)}h logged</span>
                                                </div>
                                            </div>

                                            {/* Structured Journal Preview Blocks */}
                                            <div className="space-y-2.5">
                                                <div className="space-y-1">
                                                    <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                                                        Accomplished Tasks & Key Outputs
                                                    </span>
                                                    <p className="text-xs text-slate-700 line-clamp-3 leading-relaxed bg-slate-50/50 p-2.5 rounded-xl border border-slate-100">
                                                        {journal.tasks_completed || 'No specific task details provided.'}
                                                    </p>
                                                </div>

                                                {journal.skills_acquired && (
                                                    <div className="space-y-1">
                                                        <span className="text-[10px] font-extrabold text-emerald-600 uppercase tracking-wider flex items-center gap-1">
                                                            <Sparkles className="w-3 h-3" /> Skills Acquired
                                                        </span>
                                                        <p className="text-xs text-slate-700 line-clamp-2 leading-relaxed bg-emerald-50/40 p-2.5 rounded-xl border border-emerald-100">
                                                            {journal.skills_acquired}
                                                        </p>
                                                    </div>
                                                )}

                                                {journal.challenges_and_solutions && (
                                                    <div className="space-y-1">
                                                        <span className="text-[10px] font-extrabold text-amber-600 uppercase tracking-wider">
                                                            Challenges & Key Takeaways
                                                        </span>
                                                        <p className="text-xs text-slate-700 line-clamp-2 leading-relaxed bg-amber-50/40 p-2.5 rounded-xl border border-amber-100">
                                                            {journal.challenges_and_solutions}
                                                        </p>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Mentor Feedback & Rating Snippet (if already reviewed) */}
                                            {journal.mentor_feedback && (
                                                <div className="bg-blue-50/50 p-3.5 rounded-xl border border-blue-100 space-y-1.5">
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-[10px] font-bold text-blue-700 uppercase flex items-center gap-1">
                                                            <MessageSquare className="w-3 h-3" /> Mentor Sign-off Remarks
                                                        </span>
                                                        {journal.mentor_rating && (
                                                            <div className="flex items-center gap-0.5 bg-white px-2 py-0.5 rounded-md border border-blue-200/60 shadow-2xs">
                                                                {Array.from({ length: 5 }).map((_, i) => (
                                                                    <Star 
                                                                        key={i} 
                                                                        className={`w-3 h-3 ${i < (journal.mentor_rating || 0) ? 'text-amber-400 fill-amber-400' : 'text-slate-200'}`} 
                                                                    />
                                                                ))}
                                                                <span className="text-[10px] font-black text-slate-700 ml-1">{journal.mentor_rating}.0</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <p className="text-xs text-slate-600 italic">"{journal.mentor_feedback}"</p>
                                                </div>
                                            )}
                                        </div>

                                        {/* Card Action Footer */}
                                        <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                                            <span className="text-[10px] text-slate-400 font-medium">
                                                Submitted {formatDate(journal.submitted_at)}
                                            </span>
                                            <button
                                                onClick={() => handleOpenReview(journal)}
                                                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer ${
                                                    journal.status === 'Approved'
                                                        ? 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200'
                                                        : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-600/20'
                                                }`}
                                            >
                                                <Award className="w-3.5 h-3.5" />
                                                <span>{journal.status === 'Approved' ? 'Modify Sign-Off' : 'Review & Sign-Off'}</span>
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}

            {/* TAB: HOURS TELEMETRY */}
            {activeTab === 'telemetry' && (
                <div className="space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {loadingReports ? (
                            Array(3).fill(0).map((_, i) => (
                                <div key={i} className="h-56 bg-white rounded-2xl animate-pulse border border-slate-200 shadow-xs"></div>
                            ))
                        ) : reports.length > 0 ? (
                            reports.map((report, index) => {
                                const percentage = Math.min(Math.round((report.total_hours / 40) * 100), 100);
                                return (
                                    <div key={index} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md hover:border-blue-300 transition-all flex flex-col justify-between group">
                                        <div className="space-y-4">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{report.student_name}</h3>
                                                    <p className="text-slate-400 text-xs font-medium mt-0.5">{report.total_days} Days Active This Week</p>
                                                </div>
                                                <div className="text-right bg-blue-50 px-3 py-1 rounded-xl border border-blue-100">
                                                    <div className="text-xl font-black text-blue-700 font-mono">
                                                        {Number(report.total_hours).toFixed(1)}
                                                        <span className="text-xs text-slate-500 font-normal ml-1">hrs</span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Progress Bar Container */}
                                            <div className="space-y-1.5">
                                                <div className="flex justify-between text-xs font-bold">
                                                    <span className="text-slate-500 text-[11px]">Weekly Goal (40h)</span>
                                                    <span className={`font-mono text-xs ${percentage >= 100 ? 'text-emerald-600' : 'text-blue-600'}`}>
                                                        {percentage}%
                                                    </span>
                                                </div>
                                                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden border border-slate-200/80">
                                                    <div 
                                                        className={`h-full rounded-full transition-all duration-700 ${
                                                            percentage >= 100 
                                                                ? 'bg-linear-to-r from-emerald-500 to-emerald-400' 
                                                                : 'bg-linear-to-r from-blue-600 to-indigo-500'
                                                        }`}
                                                        style={{ width: `${percentage}%` }}
                                                    ></div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Footer Stats */}
                                        <div className="mt-6 pt-4 border-t border-slate-100 flex justify-between items-center text-xs">
                                            <div className="flex items-center gap-1.5">
                                                <span className={`w-2 h-2 rounded-full ${report.late_count > 0 ? 'bg-amber-500' : 'bg-emerald-500'}`}></span>
                                                <span className="text-slate-500 font-medium">{report.late_count} Late Clock-Ins</span>
                                            </div>
                                            <span className="text-blue-600 font-bold text-[11px] hover:underline cursor-pointer flex items-center gap-0.5">
                                                View Attendance <ChevronRight className="w-3 h-3" />
                                            </span>
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="col-span-full bg-white p-16 rounded-2xl border border-slate-200/90 shadow-xs text-center text-slate-400 text-xs italic">
                                No performance telemetry data found for the current cycle.
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* MENTOR REVIEW & SIGN-OFF MODAL */}
            {selectedJournal && (
                <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
                    <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-7 border border-slate-200 shadow-2xl space-y-5 text-slate-800 animate-in zoom-in-95 max-h-[92vh] overflow-y-auto">
                        
                        {/* Modal Header */}
                        <div className="flex items-start justify-between pb-4 border-b border-slate-100">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center font-black">
                                    <Award className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-black text-slate-900">
                                        Review Week #{selectedJournal.week_number} Accomplishment Journal
                                    </h3>
                                    <p className="text-xs text-slate-500 mt-0.5">
                                        Intern: <strong className="text-slate-800">{selectedJournal.student_name}</strong> • {selectedJournal.course || 'BS Information Technology'}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => setSelectedJournal(null)}
                                className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition-all cursor-pointer"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Student Submission Summary Preview */}
                        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-3.5">
                            <div className="flex items-center justify-between text-xs text-slate-500 pb-2 border-b border-slate-200/60 font-medium">
                                <span className="flex items-center gap-1.5">
                                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                                    Period: <strong>{formatDate(selectedJournal.start_date)} — {formatDate(selectedJournal.end_date)}</strong>
                                </span>
                                <span className="text-blue-700 bg-blue-100/70 px-2 py-0.5 rounded-md font-bold text-[11px]">
                                    {selectedJournal.total_hours_rendered} Hours Rendered
                                </span>
                            </div>

                            <div>
                                <h4 className="text-[10px] font-extrabold text-blue-700 uppercase tracking-wider">
                                    Accomplished Tasks & Key Outputs
                                </h4>
                                <p className="text-xs text-slate-700 mt-1 leading-relaxed whitespace-pre-line bg-white p-3 rounded-xl border border-slate-200/60 font-medium">
                                    {selectedJournal.tasks_completed}
                                </p>
                            </div>

                            {selectedJournal.skills_acquired && (
                                <div>
                                    <h4 className="text-[10px] font-extrabold text-emerald-700 uppercase tracking-wider">
                                        Skills & Technologies Acquired
                                    </h4>
                                    <p className="text-xs text-slate-700 mt-1 leading-relaxed bg-white p-3 rounded-xl border border-slate-200/60 font-medium">
                                        {selectedJournal.skills_acquired}
                                    </p>
                                </div>
                            )}

                            {selectedJournal.challenges_and_solutions && (
                                <div>
                                    <h4 className="text-[10px] font-extrabold text-amber-700 uppercase tracking-wider">
                                        Challenges Encountered & Solutions
                                    </h4>
                                    <p className="text-xs text-slate-700 mt-1 leading-relaxed bg-white p-3 rounded-xl border border-slate-200/60 font-medium">
                                        {selectedJournal.challenges_and_solutions}
                                    </p>
                                </div>
                            )}

                            {selectedJournal.plan_next_week && (
                                <div>
                                    <h4 className="text-[10px] font-extrabold text-indigo-700 uppercase tracking-wider">
                                        Plan for Next Week
                                    </h4>
                                    <p className="text-xs text-slate-700 mt-1 leading-relaxed bg-white p-3 rounded-xl border border-slate-200/60 font-medium">
                                        {selectedJournal.plan_next_week}
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Mentor Evaluation Form */}
                        <div className="space-y-4 pt-1">
                            {/* Sign-off Decision Toggle */}
                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase mb-2">
                                    Sign-Off Decision
                                </label>
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setReviewStatus('Approved')}
                                        className={`py-3 px-4 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-2 cursor-pointer ${
                                            reviewStatus === 'Approved'
                                                ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm shadow-emerald-600/30 font-black'
                                                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                                        }`}
                                    >
                                        <CheckCircle2 className="w-4 h-4" />
                                        <span>Sign-Off & Approve</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setReviewStatus('Needs Revision')}
                                        className={`py-3 px-4 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-2 cursor-pointer ${
                                            reviewStatus === 'Needs Revision'
                                                ? 'bg-amber-600 text-white border-amber-600 shadow-sm shadow-amber-600/30 font-black'
                                                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                                        }`}
                                    >
                                        <AlertTriangle className="w-4 h-4" />
                                        <span>Request Revision</span>
                                    </button>
                                </div>
                            </div>

                            {/* 1-5 Star Mentor Rating */}
                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
                                    Mentor Performance Rating
                                </label>
                                <div className="flex items-center justify-between bg-slate-50 p-3.5 rounded-xl border border-slate-200/80">
                                    <div className="flex items-center gap-1.5">
                                        {([1, 2, 3, 4, 5] as const).map((star) => (
                                            <button
                                                key={star}
                                                type="button"
                                                onClick={() => setMentorRating(star)}
                                                className="p-1 hover:scale-115 transition-transform cursor-pointer"
                                            >
                                                <Star 
                                                    className={`w-6 h-6 ${star <= mentorRating ? 'text-amber-400 fill-amber-400' : 'text-slate-300'}`} 
                                                />
                                            </button>
                                        ))}
                                    </div>
                                    <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
                                        {getRatingLabel(mentorRating)}
                                    </span>
                                </div>
                            </div>

                            {/* Quick Feedback Suggestions */}
                            <div>
                                <div className="flex items-center justify-between mb-1.5">
                                    <label className="text-xs font-bold text-slate-700 uppercase">
                                        Mentor Feedback & Coaching Remarks
                                    </label>
                                    <span className="text-[11px] text-slate-400">Quick Remarks:</span>
                                </div>
                                <div className="flex flex-wrap gap-1.5 mb-2">
                                    {[
                                        "Excellent work and initiative this week! 👏",
                                        "Great problem-solving on the assigned tasks.",
                                        "Solid attendance and task output. Keep it up!",
                                        "Please elaborate more on specific obstacles encountered.",
                                    ].map((canned, i) => (
                                        <button
                                            key={i}
                                            type="button"
                                            onClick={() => setMentorFeedback(canned)}
                                            className="text-[10px] bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-600 px-2.5 py-1 rounded-lg border border-slate-200/60 transition-colors cursor-pointer"
                                        >
                                            {canned}
                                        </button>
                                    ))}
                                </div>
                                <textarea
                                    rows={3}
                                    value={mentorFeedback}
                                    onChange={(e) => setMentorFeedback(e.target.value)}
                                    placeholder="Provide constructive feedback, commend accomplishments, or outline required journal revisions..."
                                    className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 transition-all leading-relaxed"
                                />
                            </div>
                        </div>

                        {/* Modal Action Buttons */}
                        <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                            <button
                                type="button"
                                onClick={() => setSelectedJournal(null)}
                                className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-800 hover:bg-slate-100 transition-all cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleSaveReview}
                                disabled={submittingReview}
                                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-600/20 flex items-center gap-2 cursor-pointer"
                            >
                                {submittingReview ? (
                                    <>
                                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                        <span>Saving Sign-Off...</span>
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle2 className="w-4 h-4" />
                                        <span>Confirm Sign-Off</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default WeeklyReports;