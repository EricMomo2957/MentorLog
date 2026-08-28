import { useState, useEffect, useCallback } from 'react';
import api from '../../services/api';
import { 
    Award, Star, User, Save, Search, RefreshCw, 
    CheckCircle2, AlertCircle, GraduationCap
} from 'lucide-react';

interface Student {
    id: number;
    full_name: string;
    email: string;
    student_id?: string;
    course?: string;
    year_level?: string;
}

interface EvaluationRecord {
    id: number;
    student_id: number;
    student_name: string;
    student_number?: string;
    course?: string;
    evaluator_name?: string;
    evaluation_type: 'Midterm' | 'Final';
    professionalism: number;
    technical_skills: number;
    punctuality: number;
    communication: number;
    overall_score: number;
    comments: string;
    created_at: string;
}

const ManageEvaluations = () => {
    const [students, setStudents] = useState<Student[]>([]);
    const [selectedStudentId, setSelectedStudentId] = useState<number | ''>('');
    const [evaluationType, setEvaluationType] = useState<'Midterm' | 'Final'>('Midterm');
    
    // Ratings (1-5)
    const [professionalism, setProfessionalism] = useState<number>(5);
    const [technicalSkills, setTechnicalSkills] = useState<number>(5);
    const [punctuality, setPunctuality] = useState<number>(5);
    const [communication, setCommunication] = useState<number>(5);
    const [comments, setComments] = useState<string>('');

    const [evaluations, setEvaluations] = useState<EvaluationRecord[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [submitting, setSubmitting] = useState<boolean>(false);
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

    const showToast = (message: string, type: 'success' | 'error' = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3500);
    };

    // Calculate live overall average
    const liveOverallScore = Number(((professionalism + technicalSkills + punctuality + communication) / 4).toFixed(2));

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const [studentsRes, evalRes] = await Promise.all([
                api.get('/admin/students').catch(() => ({ data: [] })),
                api.get('/evaluations/all').catch(() => ({ data: { data: [] } }))
            ]);

            const studentList = Array.isArray(studentsRes.data) ? studentsRes.data : (studentsRes.data?.data || []);
            const evalList = Array.isArray(evalRes.data) ? evalRes.data : (evalRes.data?.data || []);

            setStudents(studentList);
            setEvaluations(evalList);

            if (studentList.length > 0 && selectedStudentId === '') {
                setSelectedStudentId(studentList[0].id);
            }
        } catch (err) {
            console.error("Failed to fetch evaluation data", err);
        } finally {
            setLoading(false);
        }
    }, [selectedStudentId]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!selectedStudentId) {
            showToast("Please select a student intern", 'error');
            return;
        }

        setSubmitting(true);
        try {
            const res = await api.post('/evaluations/submit', {
                student_id: selectedStudentId,
                evaluation_type: evaluationType,
                professionalism,
                technical_skills: technicalSkills,
                punctuality,
                communication,
                comments
            });

            if (res.data?.success) {
                showToast(res.data.message || `${evaluationType} Evaluation saved successfully!`);
                setComments('');
                fetchData();
            } else {
                showToast(res.data?.message || "Failed to submit evaluation", 'error');
            }
        } catch (err: any) {
            showToast(err.response?.data?.message || "Network error submitting evaluation", 'error');
        } finally {
            setSubmitting(false);
        }
    };

    const handleSelectStudentForEdit = (ev: EvaluationRecord) => {
        setSelectedStudentId(ev.student_id);
        setEvaluationType(ev.evaluation_type);
        setProfessionalism(ev.professionalism);
        setTechnicalSkills(ev.technical_skills);
        setPunctuality(ev.punctuality);
        setCommunication(ev.communication);
        setComments(ev.comments || '');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const filteredEvaluations = evaluations.filter(ev => {
        const query = searchQuery.toLowerCase();
        return (
            (ev.student_name && ev.student_name.toLowerCase().includes(query)) ||
            (ev.course && ev.course.toLowerCase().includes(query)) ||
            (ev.evaluation_type && ev.evaluation_type.toLowerCase().includes(query))
        );
    });

    const StarRatingInput = ({ 
        label, 
        value, 
        onChange,
        desc 
    }: { 
        label: string; 
        value: number; 
        onChange: (v: number) => void;
        desc: string;
    }) => (
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
            <div className="flex justify-between items-start">
                <div>
                    <p className="text-xs font-bold text-slate-800">{label}</p>
                    <p className="text-[11px] text-slate-500">{desc}</p>
                </div>
                <span className="text-xs font-mono font-extrabold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                    {value} / 5
                </span>
            </div>

            <div className="flex items-center gap-1.5 pt-1">
                {[1, 2, 3, 4, 5].map((star) => (
                    <button
                        key={star}
                        type="button"
                        onClick={() => onChange(star)}
                        className="transition-transform hover:scale-110 focus:outline-none cursor-pointer"
                    >
                        <Star 
                            className={`w-6 h-6 ${
                                value >= star 
                                ? 'fill-amber-400 text-amber-400' 
                                : 'text-slate-300'
                            }`} 
                        />
                    </button>
                ))}
            </div>
        </div>
    );

    return (
        <div className="space-y-6 max-w-7xl mx-auto pb-12">
            {/* Toast System */}
            {toast && (
                <div className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl shadow-lg border text-xs font-semibold flex items-center gap-2 animate-in fade-in ${
                    toast.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-rose-50 border-rose-200 text-rose-800'
                }`}>
                    {toast.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <AlertCircle className="w-4 h-4 text-rose-600" />}
                    <span>{toast.message}</span>
                </div>
            )}

            {/* Top Title & Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Manage Internship Evaluations</h1>
                    <p className="text-xs text-slate-500 mt-0.5">Submit standardized Midterm & Final performance evaluation rubrics for student interns</p>
                </div>

                <button 
                    onClick={fetchData}
                    disabled={loading}
                    className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold px-4 py-2.5 rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer w-fit"
                >
                    <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-blue-600' : ''}`} />
                    <span>Refresh Data</span>
                </button>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Form Card (Left Column) */}
                <form onSubmit={handleSubmit} className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-6">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                        <div className="flex items-center gap-2">
                            <Award className="w-5 h-5 text-amber-500" />
                            <h2 className="text-base font-extrabold text-slate-900">Intern Performance Scorecard</h2>
                        </div>
                        <span className="text-xs font-mono font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-md border border-blue-200">
                            Overall Grade: {liveOverallScore} / 5.0
                        </span>
                    </div>

                    {/* Student & Evaluation Type Selectors */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                                <User className="w-3.5 h-3.5 text-blue-600" />
                                Select Student Intern
                            </label>
                            <select
                                value={selectedStudentId}
                                onChange={(e) => setSelectedStudentId(Number(e.target.value))}
                                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:bg-white focus:border-blue-600 outline-none cursor-pointer"
                            >
                                <option value="" disabled>-- Choose Intern --</option>
                                {students.map((st) => (
                                    <option key={st.id} value={st.id}>
                                        {st.full_name} {st.student_id ? `(${st.student_id})` : ''} - {st.course || 'Intern'}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                                <Award className="w-3.5 h-3.5 text-amber-500" />
                                Evaluation Type
                            </label>
                            <div className="grid grid-cols-2 gap-2 pt-0.5">
                                <button
                                    type="button"
                                    onClick={() => setEvaluationType('Midterm')}
                                    className={`py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                                        evaluationType === 'Midterm'
                                        ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                                    }`}
                                >
                                    Midterm
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setEvaluationType('Final')}
                                    className={`py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                                        evaluationType === 'Final'
                                        ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-xs'
                                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                                    }`}
                                >
                                    Final Evaluation
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Standardized 1-5 Rating Rubrics */}
                    <div className="space-y-3 pt-2 border-t border-slate-100">
                        <p className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">Rating Rubrics (1 to 5 Stars)</p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <StarRatingInput
                                label="1. Professionalism"
                                desc="Work ethic, responsibility, and attitude"
                                value={professionalism}
                                onChange={setProfessionalism}
                            />

                            <StarRatingInput
                                label="2. Technical Skills"
                                desc="Task output quality & technical competence"
                                value={technicalSkills}
                                onChange={setTechnicalSkills}
                            />

                            <StarRatingInput
                                label="3. Punctuality & DTR"
                                desc="On-time attendance, schedule adherence"
                                value={punctuality}
                                onChange={setPunctuality}
                            />

                            <StarRatingInput
                                label="4. Communication"
                                desc="Team collaboration & reporting clarity"
                                value={communication}
                                onChange={setCommunication}
                            />
                        </div>
                    </div>

                    {/* Feedback Comments */}
                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-700">Supervisor Remarks & Recommendation</label>
                        <textarea
                            rows={3}
                            value={comments}
                            onChange={(e) => setComments(e.target.value)}
                            placeholder="Enter qualitative comments, strengths, or areas for improvement..."
                            className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs text-slate-800 focus:bg-white focus:border-blue-600 outline-none resize-none"
                        />
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={submitting || !selectedStudentId}
                        className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs py-3 rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                        <Save className="w-4 h-4" />
                        <span>{submitting ? 'Saving Evaluation...' : `Save ${evaluationType} Evaluation`}</span>
                    </button>
                </form>

                {/* Right Info & Live Rubric Summary */}
                <div className="lg:col-span-5 space-y-6">
                    <div className="bg-[#f0f4fe] border border-indigo-200/90 rounded-2xl p-6 shadow-xs space-y-4">
                        <div className="flex items-center gap-2">
                            <GraduationCap className="w-5 h-5 text-indigo-600" />
                            <h3 className="text-sm font-extrabold text-indigo-950">Evaluation Guidelines</h3>
                        </div>
                        <p className="text-xs text-indigo-800/90 leading-relaxed font-medium">
                            Evaluations update student academic scorecards instantly. Midterm ratings assess early adaptation, while Final ratings grade overall internship completion.
                        </p>
                        <div className="p-3 bg-white/90 border border-indigo-200 rounded-xl space-y-1 text-xs text-indigo-950 font-medium">
                            <p>⭐ <strong>5.0 - Excellent</strong>: Exceeds all expectations</p>
                            <p>⭐ <strong>4.0 - Very Good</strong>: Meets and occasionally exceeds</p>
                            <p>⭐ <strong>3.0 - Satisfactory</strong>: Meets standard requirements</p>
                            <p>⭐ <strong>2.0 - Needs Work</strong>: Below expected standards</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Evaluation History Log Table */}
            <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
                <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                        <h3 className="text-sm font-bold text-slate-900">Submitted Evaluation Logs</h3>
                        <p className="text-xs text-slate-500">History of Midterm and Final scorecards across all program interns</p>
                    </div>

                    <div className="relative max-w-xs w-full">
                        <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Filter by student name or course..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-800 outline-none focus:border-blue-500"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                        <thead>
                            <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                                <th className="py-3 px-4">Student Intern</th>
                                <th className="py-3 px-4">Type</th>
                                <th className="py-3 px-4">Overall Score</th>
                                <th className="py-3 px-4">Rubric Breakdown</th>
                                <th className="py-3 px-4">Evaluator</th>
                                <th className="py-3 px-4">Date</th>
                                <th className="py-3 px-4 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-slate-700">
                            {filteredEvaluations.length > 0 ? filteredEvaluations.map((ev) => (
                                <tr key={ev.id} className="hover:bg-slate-50/80 transition-colors">
                                    <td className="py-3.5 px-4">
                                        <p className="font-bold text-slate-900">{ev.student_name || 'Student'}</p>
                                        <p className="text-[10px] text-slate-500 font-mono">{ev.course || 'Internship Track'}</p>
                                    </td>
                                    <td className="py-3.5 px-4">
                                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                                            ev.evaluation_type === 'Final'
                                            ? 'bg-amber-50 text-amber-800 border-amber-300'
                                            : 'bg-blue-50 text-blue-800 border-blue-300'
                                        }`}>
                                            {ev.evaluation_type}
                                        </span>
                                    </td>
                                    <td className="py-3.5 px-4 font-mono font-extrabold text-blue-700 text-sm">
                                        {Number(ev.overall_score).toFixed(2)} / 5.0
                                    </td>
                                    <td className="py-3.5 px-4 text-[11px] space-y-0.5 font-mono">
                                        <p>Prof: {ev.professionalism}★ | Tech: {ev.technical_skills}★</p>
                                        <p>Punct: {ev.punctuality}★ | Comm: {ev.communication}★</p>
                                    </td>
                                    <td className="py-3.5 px-4 font-medium text-slate-600">{ev.evaluator_name || 'Admin'}</td>
                                    <td className="py-3.5 px-4 font-mono text-slate-500">
                                        {new Date(ev.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                    </td>
                                    <td className="py-3.5 px-4 text-right">
                                        <button
                                            onClick={() => handleSelectStudentForEdit(ev)}
                                            className="px-3 py-1 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-bold transition-all shadow-2xs cursor-pointer"
                                        >
                                            Edit Ratings
                                        </button>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={7} className="py-12 text-center text-slate-400 text-xs italic">No evaluation logs recorded yet.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default ManageEvaluations;
