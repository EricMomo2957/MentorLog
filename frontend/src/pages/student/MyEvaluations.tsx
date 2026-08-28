import { useState, useEffect, useCallback } from 'react';
import api from '../../services/api';
import { OJTCertificateModal } from '../../components/OJTCertificateModal';
import { getAdminSettings } from '../admin/AdminSettings';
import { 
    Award, Star, Lock, Printer, RefreshCw
} from 'lucide-react';

interface EvaluationRecord {
    id: number;
    evaluation_type: 'Midterm' | 'Final';
    professionalism: number;
    technical_skills: number;
    punctuality: number;
    communication: number;
    overall_score: number;
    comments: string;
    evaluator_name?: string;
    created_at: string;
}

const MyEvaluations = () => {
    const [evaluations, setEvaluations] = useState<EvaluationRecord[]>([]);
    const [accumulatedHours, setAccumulatedHours] = useState<number>(0);
    const [requiredHours, setRequiredHours] = useState<number>(600);
    const [userProfile, setUserProfile] = useState<any>(null);

    const [loading, setLoading] = useState<boolean>(true);
    const [isCertModalOpen, setIsCertModalOpen] = useState<boolean>(false);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const [evalRes, reportRes, profileRes] = await Promise.all([
                api.get('/evaluations/my-evaluations').catch(() => ({ data: { data: [] } })),
                api.get('/attendance/weekly-report').catch(() => ({ data: { accumulated_hours: 0 } })),
                api.get('/auth/profile').catch(() => ({ data: null }))
            ]);

            const evalList = Array.isArray(evalRes.data) ? evalRes.data : (evalRes.data?.data || []);
            const reportData = reportRes.data;
            const profileData = profileRes.data?.user || profileRes.data;

            setEvaluations(evalList);
            setUserProfile(profileData || null);

            const hours = Number(reportData?.accumulated_hours) || 0;
            setAccumulatedHours(hours);

            const adminSettings = getAdminSettings();
            const target = adminSettings.requiredOjtHours || (profileData && Number(profileData.ojt_hours_required)) || 600;
            setRequiredHours(target);
        } catch (err) {
            console.error("Failed to load evaluation scorecards", err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const isCompletionReached = accumulatedHours >= requiredHours;
    const completionPercent = Math.min((accumulatedHours / requiredHours) * 100, 100);

    const midtermEval = evaluations.find(e => e.evaluation_type === 'Midterm');
    const finalEval = evaluations.find(e => e.evaluation_type === 'Final');

    const ScorecardCard = ({ 
        title, 
        evalRecord, 
        badgeBg 
    }: { 
        title: string; 
        evalRecord?: EvaluationRecord; 
        badgeBg: string; 
    }) => (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col justify-between space-y-4">
            <div className="space-y-3">
                <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2">
                        <Award className="w-5 h-5 text-amber-500" />
                        <h3 className="text-base font-extrabold text-slate-900">{title}</h3>
                    </div>
                    {evalRecord ? (
                        <span className={`text-xs font-mono font-extrabold px-3 py-1 rounded-full border ${badgeBg}`}>
                            Score: {Number(evalRecord.overall_score).toFixed(2)} / 5.0
                        </span>
                    ) : (
                        <span className="text-[11px] font-bold text-slate-400 bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200">
                            Pending Evaluation
                        </span>
                    )}
                </div>

                {evalRecord ? (
                    <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-3 text-xs">
                            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/80">
                                <span className="text-[10px] font-bold text-slate-500 block uppercase">Professionalism</span>
                                <div className="flex items-center gap-1 mt-0.5">
                                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                                    <span className="font-bold text-slate-800">{evalRecord.professionalism} / 5</span>
                                </div>
                            </div>

                            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/80">
                                <span className="text-[10px] font-bold text-slate-500 block uppercase">Technical Skills</span>
                                <div className="flex items-center gap-1 mt-0.5">
                                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                                    <span className="font-bold text-slate-800">{evalRecord.technical_skills} / 5</span>
                                </div>
                            </div>

                            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/80">
                                <span className="text-[10px] font-bold text-slate-500 block uppercase">Punctuality & DTR</span>
                                <div className="flex items-center gap-1 mt-0.5">
                                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                                    <span className="font-bold text-slate-800">{evalRecord.punctuality} / 5</span>
                                </div>
                            </div>

                            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/80">
                                <span className="text-[10px] font-bold text-slate-500 block uppercase">Communication</span>
                                <div className="flex items-center gap-1 mt-0.5">
                                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                                    <span className="font-bold text-slate-800">{evalRecord.communication} / 5</span>
                                </div>
                            </div>
                        </div>

                        {evalRecord.comments && (
                            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Supervisor Comments</span>
                                <p className="text-xs text-slate-700 italic leading-relaxed">
                                    "{evalRecord.comments}"
                                </p>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="py-8 text-center text-slate-400 text-xs italic bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
                        {title} scorecard has not been submitted by your supervisor yet.
                    </div>
                )}
            </div>

            {evalRecord && (
                <div className="text-[10px] font-mono text-slate-500 text-right pt-1 border-t border-slate-100">
                    Evaluated by {evalRecord.evaluator_name || 'Supervisor'} on {new Date(evalRecord.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </div>
            )}
        </div>
    );

    return (
        <div className="space-y-6 max-w-7xl mx-auto pb-12">
            {/* Top Title & Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">My OJT Evaluations & Credentials</h1>
                    <p className="text-xs text-slate-500 mt-0.5">Review your Midterm & Final performance scorecards and generate your OJT Certificate of Completion</p>
                </div>

                <button 
                    onClick={fetchData}
                    disabled={loading}
                    className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold px-4 py-2.5 rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer w-fit"
                >
                    <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-blue-600' : ''}`} />
                    <span>Refresh Scorecards</span>
                </button>
            </div>

            {/* Certificate Unlock Banner Card */}
            <div className={`p-6 md:p-8 rounded-3xl border shadow-sm space-y-6 transition-all ${
                isCompletionReached
                ? 'bg-[#fffbeb] border-amber-300'
                : 'bg-white border-slate-200'
            }`}>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-start gap-4">
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-xs ${
                            isCompletionReached
                            ? 'bg-amber-500 text-slate-950'
                            : 'bg-slate-100 text-slate-500'
                        }`}>
                            {isCompletionReached ? <Award className="w-7 h-7" /> : <Lock className="w-7 h-7" />}
                        </div>

                        <div className="space-y-1">
                            <div className="flex items-center gap-2">
                                <span className={`text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                                    isCompletionReached
                                    ? 'bg-amber-100 text-amber-900 border-amber-300'
                                    : 'bg-slate-100 text-slate-600 border-slate-200'
                                }`}>
                                    {isCompletionReached ? '🎉 Credential Unlocked' : 'Credential Locked'}
                                </span>
                            </div>
                            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
                                {isCompletionReached 
                                    ? 'Official Certificate of OJT Completion Ready!' 
                                    : 'Certificate Unlocks Upon 100% OJT Hours Target'
                                }
                            </h2>
                            <p className="text-xs text-slate-600 font-medium">
                                Rendered <strong className="text-slate-900">{accumulatedHours.toFixed(1)}</strong> of <strong className="text-slate-900">{requiredHours} required hours</strong> ({completionPercent.toFixed(1)}% complete).
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={() => setIsCertModalOpen(true)}
                        disabled={!isCompletionReached}
                        className={`px-6 py-3 rounded-2xl text-xs font-extrabold shadow-sm transition-all flex items-center gap-2 justify-center cursor-pointer ${
                            isCompletionReached
                            ? 'bg-amber-500 hover:bg-amber-600 text-slate-950 ring-2 ring-amber-200 active:scale-98'
                            : 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
                        }`}
                    >
                        {isCompletionReached ? (
                            <>
                                <Printer className="w-4 h-4" />
                                <span>Generate OJT Certificate</span>
                            </>
                        ) : (
                            <>
                                <Lock className="w-4 h-4" />
                                <span>Locked ({(requiredHours - accumulatedHours).toFixed(1)} hrs left)</span>
                            </>
                        )}
                    </button>
                </div>

                {/* Progress Bar */}
                <div className="space-y-1.5 pt-2 border-t border-slate-200/70">
                    <div className="w-full bg-slate-200/80 h-3 rounded-full overflow-hidden p-0.5">
                        <div 
                            className={`h-full rounded-full transition-all duration-700 ${
                                isCompletionReached ? 'bg-amber-500' : 'bg-blue-600'
                            }`}
                            style={{ width: `${completionPercent}%` }}
                        ></div>
                    </div>
                </div>
            </div>

            {/* Scorecard Grid (Midterm & Final) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ScorecardCard
                    title="Midterm Evaluation"
                    evalRecord={midtermEval}
                    badgeBg="bg-blue-50 text-blue-800 border-blue-300"
                />

                <ScorecardCard
                    title="Final Evaluation"
                    evalRecord={finalEval}
                    badgeBg="bg-amber-50 text-amber-800 border-amber-300"
                />
            </div>

            {/* Certificate Modal */}
            <OJTCertificateModal
                isOpen={isCertModalOpen}
                onClose={() => setIsCertModalOpen(false)}
                studentName={userProfile?.full_name || localStorage.getItem('userName') || 'Student Intern'}
                studentId={userProfile?.student_id}
                course={userProfile?.course}
                totalHoursRendered={accumulatedHours}
                requiredHours={requiredHours}
            />
        </div>
    );
};

export default MyEvaluations;
