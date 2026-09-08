import { useState, useEffect, useCallback } from 'react';
import api from '../../services/api';
import { 
    BarChart3, BookOpen, Star, CheckCircle2, AlertTriangle, 
    Calendar, Clock, Filter, RefreshCw, X, MessageSquare,
    Search, Award
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

const WeeklyReports = () => {
    const [activeTab, setActiveTab] = useState<'telemetry' | 'journals'>('telemetry');
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
                setToast({ message: "Journal review and sign-off saved!", type: 'success' });
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

    const filteredJournals = journals.filter(j => {
        const matchesQuery = !searchQuery || 
            j.student_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            j.student_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            `week ${j.week_number}`.includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === 'All' || j.status === statusFilter;
        return matchesQuery && matchesStatus;
    });

    return (
        <div className="max-w-7xl mx-auto space-y-6 text-slate-200">
            {/* Toast System */}
            {toast && (
                <div className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl shadow-lg border text-xs font-semibold flex items-center gap-2 animate-in fade-in slide-in-from-bottom-3 ${
                    toast.type === 'success' ? 'bg-emerald-950 border-emerald-700 text-emerald-200' : 
                    toast.type === 'warning' ? 'bg-amber-950 border-amber-700 text-amber-200' :
                    'bg-rose-950 border-rose-700 text-rose-200'
                }`}>
                    {toast.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : 
                     toast.type === 'warning' ? <AlertTriangle className="w-4 h-4 text-amber-400" /> :
                     <AlertTriangle className="w-4 h-4 text-rose-400" />}
                    <span>{toast.message}</span>
                </div>
            )}

            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-[#0f172a]/60 backdrop-blur-xl p-8 rounded-3xl border border-slate-800/80 shadow-2xl">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <BarChart3 className="w-4 h-4 text-blue-400" />
                        <span className="text-[10px] font-black text-blue-400 uppercase tracking-[0.3em]">Weekly Performance & Accomplishments</span>
                    </div>
                    <h1 className="text-3xl font-black text-white tracking-tight">Weekly OJT Reports & Journals</h1>
                    <p className="text-xs text-slate-400 mt-1">
                        Monitor student telemetry, track weekly goals, and provide formal mentor sign-offs and star ratings on narrative journals.
                    </p>
                </div>

                {/* Tab Switcher */}
                <div className="flex items-center gap-1.5 bg-slate-900/90 p-1.5 rounded-2xl border border-slate-800">
                    <button
                        onClick={() => setActiveTab('telemetry')}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                            activeTab === 'telemetry'
                                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                        }`}
                    >
                        <BarChart3 className="w-3.5 h-3.5" />
                        <span>Telemetry Summaries</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('journals')}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer relative ${
                            activeTab === 'journals'
                                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                        }`}
                    >
                        <BookOpen className="w-3.5 h-3.5" />
                        <span>Accomplishment Journals</span>
                        {journals.filter(j => j.status === 'Submitted').length > 0 && (
                            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
                        )}
                    </button>
                </div>
            </div>

            {/* TAB 1: TELEMETRY SUMMARIES */}
            {activeTab === 'telemetry' && (
                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {loadingReports ? (
                            Array(3).fill(0).map((_, i) => (
                                <div key={i} className="h-64 bg-[#0f172a]/40 rounded-3xl animate-pulse border border-slate-800"></div>
                            ))
                        ) : reports.length > 0 ? (
                            reports.map((report, index) => (
                                <div key={index} className="bg-[#0f172a]/70 backdrop-blur-xl p-6 rounded-3xl border border-slate-800/80 shadow-xl hover:border-slate-700 transition-all flex flex-col justify-between group">
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h3 className="text-lg font-bold text-white group-hover:text-blue-400 transition-colors">{report.student_name}</h3>
                                                <p className="text-slate-500 text-xs font-mono mt-0.5">{report.total_days} Days Active</p>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-2xl font-black text-blue-400 font-mono">
                                                    {Number(report.total_hours).toFixed(1)}
                                                    <span className="text-xs text-slate-500 font-normal ml-1">hrs</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Progress Bar Container */}
                                        <div className="space-y-2">
                                            <div className="flex justify-between text-xs font-bold">
                                                <span className="text-slate-500">Weekly Goal: 40h</span>
                                                <span className="text-blue-400 font-mono">{Math.min(Math.round((report.total_hours / 40) * 100), 100)}%</span>
                                            </div>
                                            <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-slate-800">
                                                <div 
                                                    className="bg-linear-to-r from-blue-600 via-blue-400 to-emerald-400 h-full rounded-full transition-all duration-700"
                                                    style={{ width: `${Math.min((report.total_hours / 40) * 100, 100)}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Footer Stats */}
                                    <div className="mt-6 pt-4 border-t border-slate-800/60 flex justify-between items-center">
                                        <div className="flex items-center gap-2">
                                            <span className={`w-2 h-2 rounded-full ${report.late_count > 2 ? 'bg-red-400 animate-pulse' : 'bg-emerald-400'}`}></span>
                                            <span className="text-xs font-bold text-slate-400">{report.late_count} Late Clock-Ins</span>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="col-span-full bg-[#0f172a]/70 p-16 rounded-3xl border border-slate-800/80 text-center text-slate-500 text-xs italic">
                                No performance telemetry data found for this week.
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* TAB 2: ACCOMPLISHMENT JOURNALS */}
            {activeTab === 'journals' && (
                <div className="space-y-6">
                    {/* Filter and Search Bar */}
                    <div className="bg-[#0f172a]/70 backdrop-blur-xl p-4 rounded-2xl border border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="relative w-full sm:w-80">
                            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search by student name or week..."
                                className="w-full bg-slate-900/90 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-all"
                            />
                        </div>

                        <div className="flex items-center gap-2 w-full sm:w-auto">
                            <Filter className="w-3.5 h-3.5 text-slate-500" />
                            <div className="flex gap-1 bg-slate-900/90 p-1 rounded-xl border border-slate-800 text-xs">
                                {(['All', 'Submitted', 'Approved', 'Needs Revision'] as const).map((status) => (
                                    <button
                                        key={status}
                                        onClick={() => setStatusFilter(status)}
                                        className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                                            statusFilter === status
                                                ? 'bg-blue-600 text-white'
                                                : 'text-slate-400 hover:text-white'
                                        }`}
                                    >
                                        {status === 'Submitted' ? 'Pending Review' : status}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Journals Grid */}
                    {loadingJournals ? (
                        <div className="py-20 flex flex-col items-center justify-center text-slate-500 gap-3">
                            <RefreshCw className="w-6 h-6 animate-spin text-blue-400" />
                            <span className="text-xs font-semibold">Loading student journals...</span>
                        </div>
                    ) : filteredJournals.length === 0 ? (
                        <div className="bg-[#0f172a]/70 p-16 rounded-3xl border border-slate-800/80 text-center text-slate-500 text-xs italic">
                            No weekly accomplishment journals found matching the selected filters.
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {filteredJournals.map((journal) => (
                                <div 
                                    key={journal.id} 
                                    className="bg-[#0f172a]/80 backdrop-blur-xl p-6 rounded-3xl border border-slate-800/80 shadow-xl hover:border-slate-700 transition-all flex flex-col justify-between space-y-4"
                                >
                                    <div>
                                        {/* Card Header: Student & Week Badge */}
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-blue-600/20 border border-blue-500/30 text-blue-400 flex items-center justify-center font-bold text-sm shrink-0">
                                                    {journal.student_name ? journal.student_name.charAt(0).toUpperCase() : 'S'}
                                                </div>
                                                <div>
                                                    <h3 className="text-sm font-bold text-white leading-tight">{journal.student_name}</h3>
                                                    <p className="text-[11px] text-slate-400 font-mono mt-0.5">{journal.course || 'OJT Intern'}</p>
                                                </div>
                                            </div>

                                            <div className="flex flex-col items-end gap-1">
                                                <span className="px-2.5 py-0.5 bg-blue-950/80 text-blue-300 border border-blue-800/60 rounded-lg text-xs font-mono font-bold">
                                                    Week #{journal.week_number}
                                                </span>
                                                <span className={`px-2 py-0.5 rounded-md text-[9px] font-extrabold uppercase ${
                                                    journal.status === 'Approved'
                                                        ? 'bg-emerald-950/90 text-emerald-300 border border-emerald-800'
                                                        : journal.status === 'Needs Revision'
                                                            ? 'bg-amber-950/90 text-amber-300 border border-amber-800'
                                                            : 'bg-blue-950/90 text-blue-300 border border-blue-800'
                                                }`}>
                                                    {journal.status === 'Submitted' ? 'Pending Review' : journal.status}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Timeline & Hours Info */}
                                        <div className="mt-3 flex items-center gap-4 text-[11px] text-slate-400 font-mono border-t border-b border-slate-800/70 py-2">
                                            <span className="flex items-center gap-1">
                                                <Calendar className="w-3 h-3 text-slate-500" />
                                                {formatDate(journal.start_date)} - {formatDate(journal.end_date)}
                                            </span>
                                            <span className="flex items-center gap-1 text-blue-400 font-bold">
                                                <Clock className="w-3 h-3" />
                                                {journal.total_hours_rendered}h rendered
                                            </span>
                                        </div>

                                        {/* Tasks narrative snippet */}
                                        <div className="mt-3 space-y-2">
                                            <div>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Accomplished Tasks</p>
                                                <p className="text-xs text-slate-200 mt-0.5 line-clamp-3 leading-relaxed">
                                                    {journal.tasks_completed}
                                                </p>
                                            </div>

                                            {journal.skills_acquired && (
                                                <div>
                                                    <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">Skills Acquired</p>
                                                    <p className="text-xs text-slate-300 mt-0.5 line-clamp-2 leading-relaxed">
                                                        {journal.skills_acquired}
                                                    </p>
                                                </div>
                                            )}
                                        </div>

                                        {/* Mentor Feedback & Rating Snippet */}
                                        {journal.mentor_feedback && (
                                            <div className="mt-3 bg-slate-900/90 p-3 rounded-xl border border-slate-800 space-y-1">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-[10px] font-bold text-blue-400 uppercase flex items-center gap-1">
                                                        <MessageSquare className="w-3 h-3" /> Mentor Feedback
                                                    </span>
                                                    {journal.mentor_rating && (
                                                        <div className="flex items-center gap-0.5">
                                                            {Array.from({ length: 5 }).map((_, i) => (
                                                                <Star 
                                                                    key={i} 
                                                                    className={`w-2.5 h-2.5 ${i < (journal.mentor_rating || 0) ? 'text-amber-400 fill-amber-400' : 'text-slate-700'}`} 
                                                                />
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                                <p className="text-xs text-slate-300 italic">"{journal.mentor_feedback}"</p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Action Button */}
                                    <div className="pt-2 border-t border-slate-800/80 flex justify-end">
                                        <button
                                            onClick={() => handleOpenReview(journal)}
                                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-600/20 flex items-center gap-1.5 cursor-pointer"
                                        >
                                            <Award className="w-3.5 h-3.5" />
                                            <span>{journal.status === 'Approved' ? 'Update Sign-Off' : 'Review & Sign-Off'}</span>
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* MENTOR REVIEW & SIGN-OFF MODAL */}
            {selectedJournal && (
                <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
                    <div className="bg-[#0f172a] rounded-3xl max-w-2xl w-full p-6 border border-slate-800 shadow-2xl space-y-5 text-slate-200 animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                            <div>
                                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                    <Award className="w-5 h-5 text-amber-400" />
                                    Review Week #{selectedJournal.week_number} Journal
                                </h3>
                                <p className="text-xs text-slate-400 font-mono mt-0.5">
                                    Student: <span className="text-white font-bold">{selectedJournal.student_name}</span> ({selectedJournal.course || 'OJT Student'})
                                </p>
                            </div>
                            <button
                                onClick={() => setSelectedJournal(null)}
                                className="p-2 text-slate-400 hover:text-white rounded-xl bg-slate-800/60 hover:bg-slate-800 transition-all cursor-pointer"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Student Narrative Summary */}
                        <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800 space-y-3">
                            <div className="flex items-center justify-between text-xs font-mono text-slate-400 pb-2 border-b border-slate-800">
                                <span>Period: {formatDate(selectedJournal.start_date)} - {formatDate(selectedJournal.end_date)}</span>
                                <span className="text-blue-400 font-bold">{selectedJournal.total_hours_rendered} Hours Logged</span>
                            </div>

                            <div>
                                <h4 className="text-[10px] font-bold text-blue-400 uppercase tracking-wider">Accomplished Tasks</h4>
                                <p className="text-xs text-slate-200 mt-1 leading-relaxed whitespace-pre-line">
                                    {selectedJournal.tasks_completed}
                                </p>
                            </div>

                            {selectedJournal.skills_acquired && (
                                <div>
                                    <h4 className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">Skills Acquired</h4>
                                    <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                                        {selectedJournal.skills_acquired}
                                    </p>
                                </div>
                            )}

                            {selectedJournal.challenges_and_solutions && (
                                <div>
                                    <h4 className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">Challenges Encountered & Solutions</h4>
                                    <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                                        {selectedJournal.challenges_and_solutions}
                                    </p>
                                </div>
                            )}

                            {selectedJournal.plan_next_week && (
                                <div>
                                    <h4 className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">Plan for Next Week</h4>
                                    <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                                        {selectedJournal.plan_next_week}
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Mentor Evaluation Form */}
                        <div className="space-y-4 pt-2">
                            {/* Sign-Off Status Selection */}
                            <div>
                                <label className="block text-xs font-bold text-slate-300 uppercase mb-1.5">
                                    Sign-Off Decision
                                </label>
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setReviewStatus('Approved')}
                                        className={`py-2.5 px-4 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-2 cursor-pointer ${
                                            reviewStatus === 'Approved'
                                                ? 'bg-emerald-600 text-white border-emerald-500 shadow-lg shadow-emerald-600/30'
                                                : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                                        }`}
                                    >
                                        <CheckCircle2 className="w-4 h-4" />
                                        <span>Sign-Off & Approve</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setReviewStatus('Needs Revision')}
                                        className={`py-2.5 px-4 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-2 cursor-pointer ${
                                            reviewStatus === 'Needs Revision'
                                                ? 'bg-amber-600 text-white border-amber-500 shadow-lg shadow-amber-600/30'
                                                : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                                        }`}
                                    >
                                        <AlertTriangle className="w-4 h-4" />
                                        <span>Request Revision</span>
                                    </button>
                                </div>
                            </div>

                            {/* 1-5 Star Mentor Rating */}
                            <div>
                                <label className="block text-xs font-bold text-slate-300 uppercase mb-1.5">
                                    Performance Star Rating (1 to 5)
                                </label>
                                <div className="flex items-center gap-2 bg-slate-900/90 p-3 rounded-xl border border-slate-800">
                                    {([1, 2, 3, 4, 5] as const).map((star) => (
                                        <button
                                            key={star}
                                            type="button"
                                            onClick={() => setMentorRating(star)}
                                            className="p-1 hover:scale-110 transition-transform cursor-pointer"
                                        >
                                            <Star 
                                                className={`w-6 h-6 ${star <= mentorRating ? 'text-amber-400 fill-amber-400' : 'text-slate-700'}`} 
                                            />
                                        </button>
                                    ))}
                                    <span className="text-xs font-mono font-bold text-amber-400 ml-2">
                                        {mentorRating} / 5 Stars
                                    </span>
                                </div>
                            </div>

                            {/* Mentor Feedback Textarea */}
                            <div>
                                <label className="block text-xs font-bold text-slate-300 uppercase mb-1.5">
                                    Mentor Feedback & Coaching Notes
                                </label>
                                <textarea
                                    rows={3}
                                    value={mentorFeedback}
                                    onChange={(e) => setMentorFeedback(e.target.value)}
                                    placeholder="Provide constructive feedback, commend accomplishments, or outline required journal revisions..."
                                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-blue-500 transition-all leading-relaxed"
                                />
                            </div>
                        </div>

                        {/* Modal Action Buttons */}
                        <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                            <button
                                type="button"
                                onClick={() => setSelectedJournal(null)}
                                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white bg-slate-800/60 hover:bg-slate-800 transition-all cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleSaveReview}
                                disabled={submittingReview}
                                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-600/30 flex items-center gap-2 cursor-pointer"
                            >
                                {submittingReview ? (
                                    <>
                                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                        <span>Saving Sign-Off...</span>
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle2 className="w-3.5 h-3.5" />
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