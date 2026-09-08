import { useState, useEffect, useCallback } from 'react';
import api from '../../services/api';
import { getAdminSettings } from '../admin/AdminSettings';
import { 
    UploadCloud, FileText, ShieldCheck, 
    X, CheckCircle2, AlertTriangle, 
    FileUp, Clock, AlertCircle, RefreshCw, Eye, Paperclip
} from 'lucide-react';

interface SubmissionItem {
    id: number;
    student_id: number;
    student_name: string;
    document_type: string;
    file_path: string;
    status: 'pending' | 'approved' | 'rejected' | 'needs revision';
    submitted_at: string;
    feedback?: string;
    notes?: string;
    original_name?: string;
}

const CHECKLIST_REQUIREMENTS = [
    { type: 'Endorsement Letter', label: 'Dean / Practicum Endorsement Letter', required: true, desc: 'Official endorsement from college faculty' },
    { type: 'Memorandum of Agreement', label: 'MOA / Internship Contract', required: true, desc: 'Bipartite agreement between school and host company' },
    { type: 'Parent / Guardian Consent', label: 'Parent / Guardian Waiver & Consent', required: true, desc: 'Signed waiver permitting on-site OJT hours' },
    { type: 'Medical Clearance', label: 'Medical Clearance / Fit-to-Work', required: true, desc: 'Physician certificate or health clearance' },
    { type: 'Certificate of Registration', label: 'Certificate of Registration (COR)', required: true, desc: 'Study load validation proving enrolled OJT subject' },
    { type: 'Final Practicum Report', label: 'Final Practicum Narrative Portfolio', required: true, desc: 'Compiled comprehensive documentation of completed internship' },
    { type: 'Resume', label: 'Updated Resume / Curriculum Vitae', required: false, desc: 'Professional bio submitted to company' },
    { type: 'Other Clearance', label: 'Barangay / Police Clearance (Optional)', required: false, desc: 'Additional host company onboarding clearances' }
];

const StudentSubmission = () => {
    const [file, setFile] = useState<File | null>(null);
    const [docType, setDocType] = useState("Endorsement Letter");
    const [notes, setNotes] = useState("");
    const [status, setStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
    const [mySubmissions, setMySubmissions] = useState<SubmissionItem[]>([]);
    const [loadingSubmissions, setLoadingSubmissions] = useState(true);
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'warning' } | null>(null);

    const getFullFileUrl = (filePath: string) => {
        if (!filePath) return '#';
        if (filePath.startsWith('http')) return filePath;
        const cleanPath = filePath.replace(/\\/g, '/');
        return cleanPath.startsWith('/') ? `http://localhost:5000${cleanPath}` : `http://localhost:5000/${cleanPath}`;
    };

    const fetchMySubmissions = useCallback(async () => {
        try {
            setLoadingSubmissions(true);
            const res = await api.get('/documents/my-submissions');
            if (res.data?.success && Array.isArray(res.data.data)) {
                setMySubmissions(res.data.data);
            }
        } catch (err) {
            console.error("Fetch submissions error:", err);
        } finally {
            setLoadingSubmissions(false);
        }
    }, []);

    useEffect(() => {
        fetchMySubmissions();
    }, [fetchMySubmissions]);

    useEffect(() => {
        if (toast) {
            const timer = setTimeout(() => setToast(null), 4000);
            return () => clearTimeout(timer);
        }
    }, [toast]);

    const handleSubmit = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!file) {
            setToast({ message: "Please select a document file to upload.", type: 'warning' });
            return;
        }

        const currentSettings = getAdminSettings();
        if (currentSettings.maintenanceMode) {
            setToast({ 
                message: currentSettings.maintenanceNotice || "System is under maintenance. Submissions restricted.", 
                type: 'warning' 
            });
            return;
        }

        setStatus('uploading');

        const userId = localStorage.getItem('userId') || '0'; 
        const userName = localStorage.getItem('userName') || 'OJT Intern';

        const formData = new FormData();
        formData.append('document', file);
        formData.append('student_id', userId); 
        formData.append('student_name', userName); 
        formData.append('document_type', docType);
        formData.append('notes', notes);

        try {
            const res = await api.post('/documents/submit', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            if (res.data?.success || res.status === 200 || res.status === 201) {
                setStatus('success');
                setToast({ message: `"${docType}" uploaded to Document Vault successfully!`, type: 'success' });
                setFile(null);
                setNotes("");
                fetchMySubmissions();
                setTimeout(() => setStatus('idle'), 2500);
            }
        } catch (err: any) {
            console.error("Submission Error:", err);
            setStatus('error');
            setToast({ message: err.response?.data?.message || "Failed to submit document.", type: 'error' });
            setTimeout(() => setStatus('idle'), 4000);
        }
    };

    // Calculate Checklist Compliance
    const requiredItems = CHECKLIST_REQUIREMENTS.filter(r => r.required);
    const approvedTypes = new Set(
        mySubmissions
            .filter(s => s.status?.toLowerCase() === 'approved')
            .map(s => s.document_type)
    );
    const approvedRequiredCount = requiredItems.filter(r => approvedTypes.has(r.type)).length;
    const compliancePercent = Math.round((approvedRequiredCount / requiredItems.length) * 100);

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

            {/* Top Title & Primary Action Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#f0f4fe] p-6 rounded-2xl border border-indigo-200/90 shadow-xs">
                <div>
                    <span className="text-[10px] font-bold text-white bg-indigo-600 px-2.5 py-0.5 rounded-md uppercase tracking-wider inline-block mb-1 shadow-2xs">
                        Academic Practicum Compliance
                    </span>
                    <h1 className="text-2xl font-extrabold text-indigo-950 tracking-tight">OJT Document Submissions & Vault</h1>
                    <p className="text-xs text-indigo-800/80 mt-0.5 font-medium">
                        Upload required institutional documents, waivers, and track mentor verification approvals
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <button 
                        onClick={fetchMySubmissions}
                        disabled={loadingSubmissions}
                        className="bg-white border border-indigo-200 hover:bg-indigo-50 text-indigo-900 text-xs font-bold px-4 py-2 rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer active:scale-98"
                    >
                        <RefreshCw className={`w-3.5 h-3.5 text-indigo-600 ${loadingSubmissions ? 'animate-spin' : ''}`} />
                        <span>Refresh Vault</span>
                    </button>
                </div>
            </div>

            {/* Academic Checklist Compliance Progress Banner */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                            <ShieldCheck className="w-4 h-4 text-indigo-600" />
                            Academic Practicum Requirements Checklist
                        </h3>
                        <p className="text-xs text-slate-500 mt-0.5">
                            Standard institutional documents mandated for official OJT credit validation
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <span className="text-xs font-mono font-bold text-indigo-900 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-200">
                            {approvedRequiredCount} of {requiredItems.length} Required Verified ({compliancePercent}%)
                        </span>
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden border border-slate-200">
                    <div 
                        className={`h-full rounded-full transition-all duration-700 ${
                            compliancePercent === 100 ? 'bg-emerald-500' : 'bg-indigo-600'
                        }`}
                        style={{ width: `${compliancePercent}%` }}
                    ></div>
                </div>

                {/* Checklist Matrix Pills */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
                    {CHECKLIST_REQUIREMENTS.map((req) => {
                        const existingSub = mySubmissions.find(s => s.document_type === req.type);
                        const isApproved = existingSub?.status?.toLowerCase() === 'approved';
                        const isPending = existingSub?.status?.toLowerCase() === 'pending';
                        const isRejected = existingSub?.status?.toLowerCase() === 'rejected' || existingSub?.status?.toLowerCase() === 'needs revision';

                        return (
                            <div 
                                key={req.type}
                                onClick={() => setDocType(req.type)}
                                className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-start justify-between gap-2 ${
                                    docType === req.type ? 'ring-2 ring-indigo-500 bg-indigo-50/40 border-indigo-300' :
                                    isApproved ? 'bg-emerald-50/50 border-emerald-200' :
                                    isRejected ? 'bg-rose-50/50 border-rose-200' :
                                    isPending ? 'bg-amber-50/50 border-amber-200' :
                                    'bg-slate-50/80 border-slate-200 hover:bg-slate-100'
                                }`}
                            >
                                <div className="space-y-0.5">
                                    <div className="flex items-center gap-1.5">
                                        <p className="text-xs font-bold text-slate-900">{req.label}</p>
                                        {req.required && <span className="text-[9px] font-bold text-rose-600 bg-rose-50 px-1.5 py-0.2 rounded border border-rose-200">Mandatory</span>}
                                    </div>
                                    <p className="text-[11px] text-slate-500 line-clamp-1">{req.desc}</p>
                                </div>

                                <div className="shrink-0 mt-0.5">
                                    {isApproved ? (
                                        <span title="Verified & Approved" className="flex items-center text-emerald-600">
                                            <CheckCircle2 className="w-4 h-4 fill-emerald-100 text-emerald-600" />
                                        </span>
                                    ) : isRejected ? (
                                        <span title="Needs Revision / Rejected" className="flex items-center text-rose-600">
                                            <AlertCircle className="w-4 h-4 text-rose-600" />
                                        </span>
                                    ) : isPending ? (
                                        <span title="Pending Mentor Review" className="flex items-center text-amber-600">
                                            <Clock className="w-4 h-4 text-amber-600" />
                                        </span>
                                    ) : (
                                        <span title="Not Yet Uploaded" className="text-[10px] font-bold text-slate-400 bg-white px-2 py-0.5 rounded border border-slate-200">
                                            Missing
                                        </span>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Split Screen: Upload Form + Document Vault */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Left: Upload Card */}
                <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4 h-fit sticky top-20">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                        <div className="flex items-center gap-2">
                            <FileUp className="w-4 h-4 text-indigo-600" />
                            <h3 className="text-sm font-bold text-slate-900">Upload to Document Vault</h3>
                        </div>
                        <span className="text-[10px] font-mono text-slate-400 font-bold">PDF, DOCX, PNG (Max 10MB)</span>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                        {/* Selected Document Classification */}
                        <div className="space-y-1.5">
                            <label className="font-bold text-slate-700 block">Document Classification</label>
                            <select
                                value={docType}
                                onChange={(e) => setDocType(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 outline-none focus:border-indigo-500 focus:bg-white cursor-pointer"
                            >
                                {CHECKLIST_REQUIREMENTS.map(r => (
                                    <option key={r.type} value={r.type}>{r.label}</option>
                                ))}
                            </select>
                        </div>

                        {/* File Dropzone */}
                        <div className="space-y-1.5">
                            <label className="font-bold text-slate-700 block">Choose Document File</label>
                            {!file ? (
                                <label className="group relative flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-indigo-200 rounded-xl bg-indigo-50/20 hover:bg-indigo-50/50 hover:border-indigo-400 transition-all cursor-pointer">
                                    <div className="flex flex-col items-center justify-center space-y-2 text-center p-4">
                                        <div className="p-2.5 bg-white rounded-full border border-indigo-200 group-hover:scale-105 transition-transform shadow-2xs">
                                            <UploadCloud className="w-5 h-5 text-indigo-600" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-indigo-950">Click or drag document to upload</p>
                                            <p className="text-[10px] text-indigo-700/70 mt-0.5">Scanned PDF or clean document format</p>
                                        </div>
                                    </div>
                                    <input 
                                        type="file" 
                                        className="hidden" 
                                        onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
                                    />
                                </label>
                            ) : (
                                <div className="p-3 bg-indigo-50/80 border border-indigo-200 rounded-xl flex items-center gap-3">
                                    <div className="w-9 h-9 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold shrink-0 shadow-2xs">
                                        <FileText className="w-4 h-4" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-bold text-indigo-950 truncate">{file.name}</p>
                                        <p className="text-[10px] text-indigo-700 font-mono">
                                            {(file.size / 1024).toFixed(1)} KB • Ready to submit
                                        </p>
                                    </div>
                                    <button 
                                        type="button"
                                        onClick={() => setFile(null)}
                                        className="p-1 hover:bg-indigo-200 rounded-md text-indigo-700 transition-colors"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Submission Remarks */}
                        <div className="space-y-1.5">
                            <label className="font-bold text-slate-700 block">Student Remarks / Notes (Optional)</label>
                            <textarea
                                rows={3}
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder="Add notes for your advisor or company mentor (e.g. Signed by HR Director Ms. Garcia on Sept 8)..."
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-800 placeholder-slate-400 focus:border-indigo-500 focus:bg-white outline-none resize-none"
                            />
                        </div>

                        <button 
                            type="submit"
                            disabled={!file || status === 'uploading'}
                            className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer ${
                                status === 'success' ? 'bg-emerald-600 text-white' : 
                                status === 'error' ? 'bg-rose-600 text-white' :
                                'bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-50'
                            }`}
                        >
                            {status === 'uploading' ? (
                                <span>Uploading Document...</span>
                            ) : status === 'success' ? (
                                <>
                                    <span>Uploaded to Vault!</span>
                                    <CheckCircle2 className="w-4 h-4" />
                                </>
                            ) : (
                                <>
                                    <span>Submit Document to Vault</span>
                                    <FileUp className="w-4 h-4" />
                                </>
                            )}
                        </button>
                    </form>
                </div>

                {/* Right: Student Document Vault Table */}
                <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs flex flex-col">
                    <div className="p-4 border-b border-slate-100 bg-slate-50/80 flex justify-between items-center">
                        <div>
                            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                                My Vault Submissions & Review Status
                            </h3>
                            <p className="text-[11px] text-slate-500">{mySubmissions.length} Total Submissions Recorded</p>
                        </div>
                    </div>

                    <div className="overflow-x-auto flex-1">
                        <table className="w-full text-left border-collapse text-xs">
                            <thead>
                                <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                                    <th className="py-3 px-4">Document Details</th>
                                    <th className="py-3 px-4">Submitted Date</th>
                                    <th className="py-3 px-4 text-center">Status</th>
                                    <th className="py-3 px-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-slate-700">
                                {mySubmissions.length > 0 ? (
                                    mySubmissions.map((sub) => {
                                        const isApproved = sub.status?.toLowerCase() === 'approved';
                                        const isRejected = sub.status?.toLowerCase() === 'rejected' || sub.status?.toLowerCase() === 'needs revision';

                                        return (
                                            <tr key={sub.id} className="hover:bg-slate-50/80 transition-colors">
                                                <td className="py-3.5 px-4 max-w-[220px]">
                                                    <p className="font-bold text-slate-900 truncate">{sub.document_type}</p>
                                                    {sub.original_name && (
                                                        <p className="text-[10px] text-slate-500 font-mono flex items-center gap-1 mt-0.5 truncate">
                                                            <Paperclip className="w-3 h-3 text-slate-400" />
                                                            {sub.original_name}
                                                        </p>
                                                    )}
                                                    {sub.feedback && (
                                                        <div className="mt-1.5 p-2 rounded-lg bg-amber-50 border border-amber-200 text-[11px] text-amber-900 space-y-0.5">
                                                            <span className="font-bold block text-[10px] uppercase text-amber-800">Mentor Remarks:</span>
                                                            <p className="italic">{sub.feedback}</p>
                                                        </div>
                                                    )}
                                                </td>

                                                <td className="py-3.5 px-4 font-mono text-slate-600 text-[11px]">
                                                    {new Date(sub.submitted_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                </td>

                                                <td className="py-3.5 px-4 text-center">
                                                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 text-[11px] font-bold border rounded-full ${
                                                        isApproved ? 'bg-emerald-50 text-emerald-700 border-emerald-300' :
                                                        isRejected ? 'bg-rose-50 text-rose-700 border-rose-300' :
                                                        'bg-amber-50 text-amber-700 border-amber-300'
                                                    }`}>
                                                        {isApproved ? <CheckCircle2 className="w-3 h-3 text-emerald-600" /> :
                                                         isRejected ? <AlertCircle className="w-3 h-3 text-rose-600" /> :
                                                         <Clock className="w-3 h-3 text-amber-600" />}
                                                        {isApproved ? 'Approved' : isRejected ? 'Needs Revision' : 'Pending Review'}
                                                    </span>
                                                </td>

                                                <td className="py-3.5 px-4 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <a 
                                                            href={getFullFileUrl(sub.file_path)} 
                                                            target="_blank" 
                                                            rel="noopener noreferrer"
                                                            className="p-1.5 text-indigo-600 hover:bg-indigo-50 border border-indigo-200 rounded-lg transition-colors inline-flex items-center gap-1 text-[11px] font-bold"
                                                        >
                                                            <Eye className="w-3.5 h-3.5" />
                                                            <span>View</span>
                                                        </a>
                                                        {isRejected && (
                                                            <button
                                                                onClick={() => {
                                                                    setDocType(sub.document_type);
                                                                    window.scrollTo({ top: 300, behavior: 'smooth' });
                                                                }}
                                                                className="p-1.5 text-rose-700 hover:bg-rose-50 border border-rose-200 rounded-lg transition-colors inline-flex items-center gap-1 text-[11px] font-bold cursor-pointer"
                                                            >
                                                                <RefreshCw className="w-3 h-3" />
                                                                <span>Re-upload</span>
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan={4} className="py-12 text-center text-slate-400 text-xs italic">
                                            No documents submitted to your vault yet. Select a requirement on the left to upload.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudentSubmission;