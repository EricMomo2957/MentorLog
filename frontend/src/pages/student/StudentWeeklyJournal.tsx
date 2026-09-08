import { useState, useEffect, useCallback } from 'react';
import api from '../../services/api';
import { 
    BookOpen, Calendar, Clock, CheckCircle2, AlertCircle, 
    Star, Send, RefreshCw, FileText, ChevronRight, Award, MessageSquare, AlertTriangle
} from 'lucide-react';

interface JournalEntry {
    id: number;
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

const StudentWeeklyJournal = () => {
    const [journals, setJournals] = useState<JournalEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [selectedJournal, setSelectedJournal] = useState<JournalEntry | null>(null);

    // Form states
    const [weekNumber, setWeekNumber] = useState<number>(1);
    const [startDate, setStartDate] = useState<string>(() => {
        const d = new Date();
        const day = d.getDay();
        const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Monday
        return new Date(d.setDate(diff)).toISOString().split('T')[0];
    });
    const [endDate, setEndDate] = useState<string>(() => {
        const d = new Date();
        const day = d.getDay();
        const diff = d.getDate() - day + (day === 0 ? -6 : 1) + 4; // Friday
        return new Date(d.setDate(diff)).toISOString().split('T')[0];
    });
    const [hoursRendered, setHoursRendered] = useState<number>(40);
    const [tasksCompleted, setTasksCompleted] = useState<string>('');
    const [skillsAcquired, setSkillsAcquired] = useState<string>('');
    const [challengesSolutions, setChallengesSolutions] = useState<string>('');
    const [planNextWeek, setPlanNextWeek] = useState<string>('');
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'warning' } | null>(null);

    const fetchJournals = useCallback(async () => {
        try {
            setLoading(true);
            const res = await api.get('/journals/my-journals');
            if (res.data?.success && Array.isArray(res.data.data)) {
                setJournals(res.data.data);
                if (res.data.data.length > 0) {
                    const nextWeek = Math.max(...res.data.data.map((j: JournalEntry) => Number(j.week_number))) + 1;
                    setWeekNumber(nextWeek <= 24 ? nextWeek : 24);
                }
            }
        } catch (err) {
            console.error("Failed to fetch journals", err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchJournals();
    }, [fetchJournals]);

    useEffect(() => {
        if (toast) {
            const timer = setTimeout(() => setToast(null), 4000);
            return () => clearTimeout(timer);
        }
    }, [toast]);

    const handleLoadForEdit = (journal: JournalEntry) => {
        setSelectedJournal(journal);
        setWeekNumber(journal.week_number);
        setStartDate(journal.start_date.split('T')[0]);
        setEndDate(journal.end_date.split('T')[0]);
        setHoursRendered(Number(journal.total_hours_rendered) || 0);
        setTasksCompleted(journal.tasks_completed || '');
        setSkillsAcquired(journal.skills_acquired || '');
        setChallengesSolutions(journal.challenges_and_solutions || '');
        setPlanNextWeek(journal.plan_next_week || '');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleResetForm = () => {
        setSelectedJournal(null);
        setTasksCompleted('');
        setSkillsAcquired('');
        setChallengesSolutions('');
        setPlanNextWeek('');
        const nextWeek = journals.length > 0 ? Math.max(...journals.map(j => Number(j.week_number))) + 1 : 1;
        setWeekNumber(nextWeek <= 24 ? nextWeek : 24);
    };

    const handleSubmitJournal = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!tasksCompleted.trim()) {
            setToast({ message: "Please describe the tasks and activities you completed this week.", type: 'warning' });
            return;
        }

        try {
            setSubmitting(true);
            const res = await api.post('/journals/submit', {
                week_number: weekNumber,
                start_date: startDate,
                end_date: endDate,
                total_hours_rendered: hoursRendered,
                tasks_completed: tasksCompleted.trim(),
                skills_acquired: skillsAcquired.trim(),
                challenges_and_solutions: challengesSolutions.trim(),
                plan_next_week: planNextWeek.trim()
            });

            if (res.data?.success) {
                setToast({ message: res.data.message || "Accomplishment Journal submitted successfully!", type: 'success' });
                handleResetForm();
                fetchJournals();
            } else {
                setToast({ message: res.data?.message || "Submission failed", type: 'error' });
            }
        } catch (err: any) {
            setToast({ message: err.response?.data?.message || err.message || "Failed to submit journal.", type: 'error' });
        } finally {
            setSubmitting(false);
        }
    };

    const formatDate = (dateStr?: string | null) => {
        if (!dateStr) return '--';
        const clean = dateStr.split('T')[0];
        const d = new Date(clean + 'T00:00:00');
        return isNaN(d.getTime()) ? clean : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    return (
        <div className="space-y-6 max-w-7xl mx-auto">
            {/* Toast System */}
            {toast && (
                <div className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl shadow-lg border text-xs font-semibold flex items-center gap-2 animate-in fade-in slide-in-from-bottom-3 ${
                    toast.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 
                    toast.type === 'warning' ? 'bg-amber-50 border-amber-200 text-amber-800' :
                    'bg-rose-50 border-rose-200 text-rose-800'
                }`}>
                    {toast.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : 
                     toast.type === 'warning' ? <AlertTriangle className="w-4 h-4 text-amber-600" /> :
                     <AlertCircle className="w-4 h-4 text-rose-600" />}
                    <span>{toast.message}</span>
                </div>
            )}

            {/* Header Card */}
            <div className="bg-[#f0f4fe] p-6 rounded-2xl border border-indigo-200/90 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <span className="text-[10px] font-bold text-white bg-indigo-600 px-2.5 py-0.5 rounded-md uppercase tracking-wider inline-block mb-1 shadow-2xs">
                        Academic OJT Documentation
                    </span>
                    <h1 className="text-2xl font-extrabold text-indigo-950 tracking-tight flex items-center gap-2">
                        <BookOpen className="w-6 h-6 text-indigo-600" />
                        Weekly Accomplishment Journal
                    </h1>
                    <p className="text-xs text-indigo-800/80 mt-0.5 font-medium">
                        Document weekly tasks, technical competencies, challenges, and receive formal mentor sign-offs & star ratings.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="bg-white px-4 py-2 rounded-xl border border-indigo-200/80 shadow-2xs text-center">
                        <span className="text-[10px] uppercase font-bold text-indigo-800 block">Submitted Journals</span>
                        <span className="text-lg font-black text-indigo-950 font-mono">{journals.length} Entries</span>
                    </div>
                </div>
            </div>

            {/* 2-Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left Form: Draft / Submit Journal (7 cols) */}
                <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-5">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                        <div>
                            <h2 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                                <FileText className="w-4 h-4 text-blue-600" />
                                {selectedJournal ? `Edit Week #${selectedJournal.week_number} Accomplishment Journal` : 'New Weekly Accomplishment Journal'}
                            </h2>
                            <p className="text-[11px] text-slate-500">Record your weekly achievements and progress for OJT faculty review.</p>
                        </div>
                        {selectedJournal && (
                            <button
                                type="button"
                                onClick={handleResetForm}
                                className="text-xs text-blue-600 hover:text-blue-700 font-semibold underline cursor-pointer"
                            >
                                Clear Selection
                            </button>
                        )}
                    </div>

                    <form onSubmit={handleSubmitJournal} className="space-y-4">
                        {/* Row 1: Week Number & Hours Rendered */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <div>
                                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                                    Week Number <span className="text-rose-500">*</span>
                                </label>
                                <select
                                    value={weekNumber}
                                    onChange={(e) => setWeekNumber(Number(e.target.value))}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:bg-white focus:outline-none focus:border-blue-500"
                                >
                                    {Array.from({ length: 24 }, (_, i) => i + 1).map((w) => (
                                        <option key={w} value={w}>Week #{w}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                                    Start Date (Mon) <span className="text-rose-500">*</span>
                                </label>
                                <div className="relative">
                                    <Calendar className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                    <input
                                        type="date"
                                        value={startDate}
                                        onChange={(e) => setStartDate(e.target.value)}
                                        required
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs font-medium text-slate-800 focus:bg-white focus:outline-none focus:border-blue-500"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                                    End Date (Fri/Sat) <span className="text-rose-500">*</span>
                                </label>
                                <div className="relative">
                                    <Calendar className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                    <input
                                        type="date"
                                        value={endDate}
                                        onChange={(e) => setEndDate(e.target.value)}
                                        required
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs font-medium text-slate-800 focus:bg-white focus:outline-none focus:border-blue-500"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Hours Rendered */}
                        <div>
                            <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                                Total Hours Rendered This Week
                            </label>
                            <div className="relative">
                                <Clock className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input
                                    type="number"
                                    min="0"
                                    max="80"
                                    step="0.5"
                                    value={hoursRendered}
                                    onChange={(e) => setHoursRendered(Number(e.target.value))}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs font-medium text-slate-800 focus:bg-white focus:outline-none focus:border-blue-500"
                                    placeholder="e.g. 40.0"
                                />
                            </div>
                        </div>

                        {/* Section 1: Tasks Completed */}
                        <div>
                            <div className="flex justify-between items-center mb-1">
                                <label className="text-[11px] font-bold text-slate-700 uppercase flex items-center gap-1.5">
                                    <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                                    1. Detailed Tasks & Activities Completed <span className="text-rose-500">*</span>
                                </label>
                                <span className="text-[10px] text-slate-400 font-mono">{tasksCompleted.length} chars</span>
                            </div>
                            <textarea
                                rows={4}
                                value={tasksCompleted}
                                onChange={(e) => setTasksCompleted(e.target.value)}
                                required
                                placeholder="Describe daily duties, modules developed, support tickets resolved, reports drafted, or client meetings attended..."
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-blue-500 leading-relaxed"
                            />
                        </div>

                        {/* Section 2: Skills & Competencies */}
                        <div>
                            <div className="flex justify-between items-center mb-1">
                                <label className="text-[11px] font-bold text-slate-700 uppercase flex items-center gap-1.5">
                                    <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                                    2. Technical Skills & Tools Acquired
                                </label>
                                <span className="text-[10px] text-slate-400 font-mono">{skillsAcquired.length} chars</span>
                            </div>
                            <textarea
                                rows={3}
                                value={skillsAcquired}
                                onChange={(e) => setSkillsAcquired(e.target.value)}
                                placeholder="e.g. React.js Hooks, MySQL query indexing, Git rebase workflows, Linux server management..."
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-blue-500 leading-relaxed"
                            />
                        </div>

                        {/* Section 3: Challenges & Solutions */}
                        <div>
                            <div className="flex justify-between items-center mb-1">
                                <label className="text-[11px] font-bold text-slate-700 uppercase flex items-center gap-1.5">
                                    <span className="w-2 h-2 rounded-full bg-amber-600"></span>
                                    3. Challenges Encountered & Solutions Applied
                                </label>
                                <span className="text-[10px] text-slate-400 font-mono">{challengesSolutions.length} chars</span>
                            </div>
                            <textarea
                                rows={3}
                                value={challengesSolutions}
                                onChange={(e) => setChallengesSolutions(e.target.value)}
                                placeholder="e.g. Encountered CORS issues on API endpoint; solved by configuring proxy and verifying JWT tokens..."
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-blue-500 leading-relaxed"
                            />
                        </div>

                        {/* Section 4: Plan Next Week */}
                        <div>
                            <div className="flex justify-between items-center mb-1">
                                <label className="text-[11px] font-bold text-slate-700 uppercase flex items-center gap-1.5">
                                    <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
                                    4. Objectives & Learning Directives for Next Week
                                </label>
                                <span className="text-[10px] text-slate-400 font-mono">{planNextWeek.length} chars</span>
                            </div>
                            <textarea
                                rows={3}
                                value={planNextWeek}
                                onChange={(e) => setPlanNextWeek(e.target.value)}
                                placeholder="e.g. Complete User Profile modal, conduct integration tests, and shadow senior database admin..."
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-blue-500 leading-relaxed"
                            />
                        </div>

                        {/* Submit Button */}
                        <div className="pt-2 flex justify-end">
                            <button
                                type="submit"
                                disabled={submitting}
                                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-2 cursor-pointer"
                            >
                                {submitting ? (
                                    <>
                                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                        <span>Saving Journal...</span>
                                    </>
                                ) : (
                                    <>
                                        <Send className="w-3.5 h-3.5" />
                                        <span>{selectedJournal ? 'Update Journal Entry' : 'Submit Accomplishment Journal'}</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Right Column: Submitted Journals Timeline & Mentor Sign-Offs (5 cols) */}
                <div className="lg:col-span-5 space-y-4">
                    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                            <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                                <Award className="w-4 h-4 text-amber-500" />
                                Journal History & Sign-Offs
                            </h3>
                            <span className="text-[10px] font-mono text-slate-400">{journals.length} Records</span>
                        </div>

                        {loading ? (
                            <div className="py-12 flex flex-col items-center justify-center text-slate-400 gap-2">
                                <RefreshCw className="w-5 h-5 animate-spin text-blue-500" />
                                <span className="text-xs">Loading journal history...</span>
                            </div>
                        ) : journals.length === 0 ? (
                            <div className="py-12 text-center text-slate-400 space-y-2">
                                <BookOpen className="w-10 h-10 mx-auto text-slate-300" />
                                <p className="text-xs font-semibold text-slate-600">No accomplishment journals submitted yet.</p>
                                <p className="text-[11px] text-slate-400">Fill out the form on the left to submit your Week #1 narrative.</p>
                            </div>
                        ) : (
                            <div className="space-y-4 pt-3 max-h-[600px] overflow-y-auto pr-1">
                                {journals.map((journal) => (
                                    <div 
                                        key={journal.id} 
                                        className={`p-4 rounded-xl border transition-all ${
                                            journal.status === 'Approved' 
                                                ? 'bg-emerald-50/50 border-emerald-200' 
                                                : journal.status === 'Needs Revision'
                                                    ? 'bg-amber-50/50 border-amber-200'
                                                    : 'bg-slate-50/80 border-slate-200'
                                        }`}
                                    >
                                        <div className="flex items-start justify-between gap-2">
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs font-black text-slate-900">
                                                        Week #{journal.week_number}
                                                    </span>
                                                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase ${
                                                        journal.status === 'Approved'
                                                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                                            : journal.status === 'Needs Revision'
                                                                ? 'bg-amber-100 text-amber-800 border border-amber-300'
                                                                : 'bg-blue-100 text-blue-800 border border-blue-300'
                                                    }`}>
                                                        {journal.status}
                                                    </span>
                                                </div>
                                                <p className="text-[10px] text-slate-500 font-mono mt-0.5">
                                                    {formatDate(journal.start_date)} - {formatDate(journal.end_date)} ({journal.total_hours_rendered}h)
                                                </p>
                                            </div>

                                            {/* Rating Stars */}
                                            {journal.mentor_rating ? (
                                                <div className="flex items-center gap-0.5 bg-amber-50 px-2 py-1 rounded-lg border border-amber-200">
                                                    {Array.from({ length: 5 }).map((_, i) => (
                                                        <Star 
                                                            key={i} 
                                                            className={`w-3 h-3 ${i < (journal.mentor_rating || 0) ? 'text-amber-500 fill-amber-500' : 'text-slate-300'}`} 
                                                        />
                                                    ))}
                                                </div>
                                            ) : null}
                                        </div>

                                        {/* Tasks snippet */}
                                        <div className="mt-2.5 pt-2 border-t border-slate-200/60">
                                            <p className="text-[11px] text-slate-700 line-clamp-2 leading-relaxed">
                                                <strong className="text-slate-900">Accomplishments: </strong>
                                                {journal.tasks_completed}
                                            </p>
                                        </div>

                                        {/* Mentor Feedback Bubble */}
                                        {journal.mentor_feedback && (
                                            <div className="mt-3 bg-white p-3 rounded-lg border border-slate-200/80 shadow-2xs space-y-1">
                                                <div className="flex items-center gap-1.5 text-[10px] font-bold text-blue-900 uppercase">
                                                    <MessageSquare className="w-3 h-3 text-blue-600" />
                                                    Mentor Evaluation Remarks:
                                                </div>
                                                <p className="text-xs text-slate-700 italic leading-relaxed">
                                                    "{journal.mentor_feedback}"
                                                </p>
                                                {journal.reviewed_at && (
                                                    <p className="text-[9px] text-slate-400 text-right font-mono">
                                                        Reviewed: {formatDate(journal.reviewed_at)}
                                                    </p>
                                                )}
                                            </div>
                                        )}

                                        {/* Action link to edit / re-submit */}
                                        <div className="mt-3 pt-2 border-t border-slate-200/60 flex justify-end">
                                            <button
                                                type="button"
                                                onClick={() => handleLoadForEdit(journal)}
                                                className="text-[11px] font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
                                            >
                                                <span>View & Edit</span>
                                                <ChevronRight className="w-3 h-3" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudentWeeklyJournal;
