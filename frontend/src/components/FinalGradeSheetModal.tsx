import { useState, useEffect, useRef } from 'react';
import { Download, X, FileSpreadsheet, Loader2 } from 'lucide-react';
import api from '../services/api';
// @ts-ignore
import html2pdf from 'html2pdf.js';

interface FinalGradeSheetProps {
    isOpen: boolean;
    onClose: () => void;
    studentId?: number | string;
    studentName?: string;
}

interface GradeSummaryData {
    student: {
        id: number;
        full_name: string;
        student_number: string;
        course: string;
        email: string;
        company_name: string;
        required_hours: number;
        rendered_hours: number;
        is_completed: boolean;
    };
    breakdown: {
        attendance: {
            weight: string;
            max_points: number;
            earned_points: number;
            hours_logged: number;
            required_hours: number;
            percentage: number;
            present_days: number;
            late_days: number;
            absent_days: number;
        };
        evaluations: {
            weight: string;
            max_points: number;
            earned_points: number;
            midterm_score: number | null;
            final_score: number | null;
            average_rating: number;
        };
        tasks_and_deliverables: {
            weight: string;
            max_points: number;
            earned_points: number;
            total_tasks: number;
            completed_tasks: number;
            completion_rate: number;
        };
    };
    final_numerical_grade: number;
    academic_grade_equivalent: string;
    is_eligible_for_certificate: boolean;
    generated_at: string;
}

export const FinalGradeSheetModal = ({
    isOpen,
    onClose,
    studentId,
    studentName
}: FinalGradeSheetProps) => {
    const sheetRef = useRef<HTMLDivElement>(null);
    const [loading, setLoading] = useState(false);
    const [isExporting, setIsExporting] = useState(false);
    const [data, setData] = useState<GradeSummaryData | null>(null);

    useEffect(() => {
        if (isOpen) {
            fetchGradeSummary();
        }
    }, [isOpen, studentId]);

    const fetchGradeSummary = async () => {
        try {
            setLoading(true);
            const endpoint = studentId ? `/evaluations/grade-summary/${studentId}` : `/evaluations/my-grade-summary`;
            const res = await api.get(endpoint);
            if (res.data?.success) {
                setData(res.data.data);
            }
        } catch (err) {
            console.error("Failed to fetch grade summary:", err);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    const handleDownloadPDF = async () => {
        if (!sheetRef.current) return;
        setIsExporting(true);

        const name = (data?.student.full_name || studentName || 'Student').replace(/[^a-zA-Z0-9]/g, '_');
        const filename = `OJT_Grade_Summary_${name}.pdf`;

        const opt = {
            margin: [8, 8, 8, 8] as [number, number, number, number],
            filename: filename,
            image: { type: 'jpeg' as const, quality: 0.98 },
            html2canvas: { scale: 2, useCORS: true, letterRendering: true },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' as const }
        };

        try {
            await html2pdf().set(opt).from(sheetRef.current).save();
        } catch (error) {
            console.error('PDF export error:', error);
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-xs overflow-y-auto animate-in fade-in">
            <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[94vh]">
                
                {/* Modal Header */}
                <div className="p-4 bg-slate-900 text-white flex items-center justify-between gap-3 shrink-0">
                    <div className="flex items-center gap-2">
                        <FileSpreadsheet className="w-5 h-5 text-indigo-400" />
                        <div>
                            <h3 className="text-sm font-bold tracking-tight">Official OJT Final Grade & Competency Sheet</h3>
                            <span className="text-[10px] text-slate-400 font-mono">Academic Practicum Evaluation Summary</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-2.5">
                        <button
                            onClick={handleDownloadPDF}
                            disabled={isExporting || loading}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-3.5 py-1.5 rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                        >
                            {isExporting ? (
                                <>
                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                    <span>Generating PDF...</span>
                                </>
                            ) : (
                                <>
                                    <Download className="w-3.5 h-3.5 text-white" />
                                    <span>Download PDF</span>
                                </>
                            )}
                        </button>

                        <button
                            onClick={onClose}
                            className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Content Body */}
                <div className="p-6 bg-slate-50 overflow-y-auto">
                    {loading ? (
                        <div className="py-20 flex flex-col items-center justify-center gap-3 text-slate-400">
                            <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
                            <p className="text-xs font-semibold">Computing weighted practicum grade components...</p>
                        </div>
                    ) : data ? (
                        <div ref={sheetRef} className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm space-y-6 text-slate-800 text-xs">
                            
                            {/* University Header */}
                            <div className="text-center pb-4 border-b border-slate-200 space-y-1">
                                <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest block font-mono">
                                    Official Practicum Grading Document
                                </span>
                                <h2 className="text-lg font-black text-slate-900 uppercase tracking-tight font-serif">
                                    OJT Completion & Final Evaluation Report
                                </h2>
                                <p className="text-[11px] text-slate-500">
                                    Academic Year {new Date().getFullYear()} • MentorLog Practicum System
                                </p>
                            </div>

                            {/* Student Info Box */}
                            <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
                                <div>
                                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Student Intern</span>
                                    <p className="font-extrabold text-slate-900 text-sm mt-0.5">{data.student.full_name}</p>
                                    <p className="text-slate-500 text-[11px] font-mono mt-0.5">{data.student.student_number || 'ID: --'} • {data.student.course}</p>
                                </div>
                                <div className="text-right">
                                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Host Training Establishment</span>
                                    <p className="font-bold text-slate-900 mt-0.5">{data.student.company_name || 'Assigned Host Partner'}</p>
                                    <p className="text-slate-500 text-[11px] font-mono mt-0.5">
                                        Rendered: <strong>{data.student.rendered_hours}</strong> / {data.student.required_hours} Required Hours
                                    </p>
                                </div>
                            </div>

                            {/* Weighted Rubric Breakdown Table */}
                            <div>
                                <h4 className="font-bold text-slate-900 uppercase tracking-wider mb-2 text-[11px]">
                                    Weighted Practicum Grade Components
                                </h4>
                                <table className="w-full border-collapse border border-slate-200 text-xs">
                                    <thead>
                                        <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200 text-[11px]">
                                            <th className="p-2.5 text-left border-r border-slate-200">Evaluation Component</th>
                                            <th className="p-2.5 text-center border-r border-slate-200">Weight</th>
                                            <th className="p-2.5 text-center border-r border-slate-200">Metric Output</th>
                                            <th className="p-2.5 text-right">Earned Points</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-200">
                                        {/* Component 1: Attendance */}
                                        <tr>
                                            <td className="p-2.5 border-r border-slate-200">
                                                <p className="font-bold text-slate-900">1. DTR & Time Attendance</p>
                                                <p className="text-[10px] text-slate-500">
                                                    Punctuality, duty fulfillment ({data.breakdown.attendance.present_days} present, {data.breakdown.attendance.late_days} late, {data.breakdown.attendance.absent_days} absent)
                                                </p>
                                            </td>
                                            <td className="p-2.5 text-center font-mono font-bold text-slate-700 border-r border-slate-200">
                                                {data.breakdown.attendance.weight}
                                            </td>
                                            <td className="p-2.5 text-center font-mono text-slate-600 border-r border-slate-200">
                                                {data.breakdown.attendance.hours_logged} / {data.breakdown.attendance.required_hours} hrs ({data.breakdown.attendance.percentage}%)
                                            </td>
                                            <td className="p-2.5 text-right font-mono font-bold text-slate-900">
                                                {data.breakdown.attendance.earned_points} / 40.00
                                            </td>
                                        </tr>

                                        {/* Component 2: Mentor Evaluations */}
                                        <tr>
                                            <td className="p-2.5 border-r border-slate-200">
                                                <p className="font-bold text-slate-900">2. Mentor & Supervisor Evaluation</p>
                                                <p className="text-[10px] text-slate-500">
                                                    Technical skills, professionalism, punctuality & communication
                                                </p>
                                            </td>
                                            <td className="p-2.5 text-center font-mono font-bold text-slate-700 border-r border-slate-200">
                                                {data.breakdown.evaluations.weight}
                                            </td>
                                            <td className="p-2.5 text-center font-mono text-slate-600 border-r border-slate-200">
                                                {data.breakdown.evaluations.average_rating > 0 ? `${data.breakdown.evaluations.average_rating} / 5.00 stars` : 'Scorecard Pending'}
                                            </td>
                                            <td className="p-2.5 text-right font-mono font-bold text-slate-900">
                                                {data.breakdown.evaluations.earned_points} / 40.00
                                            </td>
                                        </tr>

                                        {/* Component 3: Tasks & Deliverables */}
                                        <tr>
                                            <td className="p-2.5 border-r border-slate-200">
                                                <p className="font-bold text-slate-900">3. Task Directives & Journal Deliverables</p>
                                                <p className="text-[10px] text-slate-500">
                                                    Submitted output proofs, reports, and task completion rate
                                                </p>
                                            </td>
                                            <td className="p-2.5 text-center font-mono font-bold text-slate-700 border-r border-slate-200">
                                                {data.breakdown.tasks_and_deliverables.weight}
                                            </td>
                                            <td className="p-2.5 text-center font-mono text-slate-600 border-r border-slate-200">
                                                {data.breakdown.tasks_and_deliverables.completed_tasks} / {data.breakdown.tasks_and_deliverables.total_tasks} completed ({data.breakdown.tasks_and_deliverables.completion_rate}%)
                                            </td>
                                            <td className="p-2.5 text-right font-mono font-bold text-slate-900">
                                                {data.breakdown.tasks_and_deliverables.earned_points} / 20.00
                                            </td>
                                        </tr>
                                    </tbody>
                                    <tfoot>
                                        <tr className="bg-indigo-50/80 font-bold border-t-2 border-indigo-200 text-indigo-950">
                                            <td colSpan={3} className="p-3 text-right uppercase tracking-wider text-[11px]">
                                                Total Weighted Numerical Grade:
                                            </td>
                                            <td className="p-3 text-right font-mono text-sm font-black text-indigo-900">
                                                {data.final_numerical_grade}%
                                            </td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>

                            {/* Academic Grade Equivalent Banner */}
                            <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl flex items-center justify-between">
                                <div>
                                    <span className="text-[10px] font-bold uppercase text-emerald-800 tracking-wider block">Official Academic Grade Equivalent</span>
                                    <p className="text-xl font-black text-emerald-950 font-serif mt-0.5">
                                        {data.academic_grade_equivalent}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <span className="text-[10px] font-bold uppercase text-emerald-800 tracking-wider block">Practicum Status</span>
                                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-extrabold mt-0.5 ${
                                        data.is_eligible_for_certificate 
                                            ? 'bg-emerald-600 text-white' 
                                            : 'bg-amber-100 text-amber-800 border border-amber-300'
                                    }`}>
                                        {data.is_eligible_for_certificate ? 'Completed & Passed' : 'In Progress'}
                                    </span>
                                </div>
                            </div>

                            {/* Signatures Footer */}
                            <div className="grid grid-cols-2 gap-8 pt-8 border-t border-slate-200 text-center text-xs">
                                <div className="space-y-1">
                                    <div className="border-t border-slate-400 w-48 mx-auto pt-1 mt-8">
                                        <p className="font-bold text-slate-900">OJT Industry Supervisor</p>
                                        <span className="text-[10px] text-slate-500 uppercase">Host Company Representative</span>
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <div className="border-t border-slate-400 w-48 mx-auto pt-1 mt-8">
                                        <p className="font-bold text-slate-900">Practicum Coordinator</p>
                                        <span className="text-[10px] text-slate-500 uppercase">College of Computer Studies</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <p className="py-12 text-center text-slate-400 italic text-xs">Failed to load grade summary data.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default FinalGradeSheetModal;
