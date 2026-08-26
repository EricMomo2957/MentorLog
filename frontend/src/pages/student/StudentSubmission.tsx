import { useState } from 'react';
import api from '../../services/api';
import { getAdminSettings } from '../admin/AdminSettings';
import { 
    UploadCloud, FileText, ShieldCheck, 
    X, CheckCircle2, AlertTriangle, 
    FileUp, Download 
} from 'lucide-react';

const StudentSubmission = () => {
    const [file, setFile] = useState<File | null>(null);
    const [docType, setDocType] = useState("Resume");
    const [status, setStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');

    const handleSubmit = async () => {
        if (!file) return;

        const currentSettings = getAdminSettings();
        if (currentSettings.maintenanceMode) {
            alert(currentSettings.maintenanceNotice || "System is currently under maintenance. Document submissions are temporarily restricted.");
            return;
        }

        setStatus('uploading');

        const userId = localStorage.getItem('userId') || '0'; 
        const userName = localStorage.getItem('userName') || 'Unknown Student';

        const formData = new FormData();
        formData.append('document', file);
        formData.append('student_id', userId); 
        formData.append('student_name', userName); 
        formData.append('document_type', docType);

        try {
            await api.post('/documents/submit', formData);

            setStatus('success');
            
            setTimeout(() => {
                setFile(null);
                setStatus('idle');
            }, 3000);

        } catch (err) {
            console.error("Submission Error:", err);
            setStatus('error');
            
            setTimeout(() => {
                setStatus('idle');
            }, 4000);
        }
    };

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            
            {/* Top Title & Primary Action Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">OJT Document Submissions</h1>
                    <p className="text-xs text-slate-500 mt-0.5">Upload required internship documents, waivers, and clearances</p>
                </div>

                <div className="flex items-center gap-3">
                    <button 
                        onClick={() => alert("Exporting submission history...")} 
                        className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold px-4 py-2.5 rounded-lg shadow-xs transition-all flex items-center gap-2"
                    >
                        <Download className="w-4 h-4" />
                        <span>Export Submissions</span>
                    </button>
                </div>
            </div>

            {/* Main Upload Card Container */}
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-6">
                
                {/* Header Badge */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-blue-600" />
                        <span className="text-xs font-bold text-slate-900">Document Upload Portal</span>
                    </div>
                    <span className="text-[10px] font-mono text-slate-400">PDF, DOCX up to 10MB</span>
                </div>

                {/* Document Type Selector */}
                <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-600">Select Document Classification</label>
                    <div className="grid grid-cols-3 gap-3">
                        {['Resume', 'OJT Waiver', 'Clearance'].map((type) => (
                            <button
                                key={type}
                                onClick={() => setDocType(type)}
                                className={`py-2.5 px-3 rounded-lg border text-xs font-semibold transition-all ${
                                    docType === type 
                                    ? 'bg-blue-50 border-blue-300 text-blue-700 shadow-2xs' 
                                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                                }`}
                            >
                                {type}
                            </button>
                        ))}
                    </div>
                </div>

                {/* File Drop/Upload Zone */}
                <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-600">Upload Digital Document File</label>
                    {!file ? (
                        <label className="group relative flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50 hover:bg-slate-100/50 hover:border-blue-400 transition-all cursor-pointer">
                            <div className="flex flex-col items-center justify-center space-y-2">
                                <div className="p-3 bg-white rounded-full border border-slate-200 group-hover:scale-105 transition-transform shadow-2xs">
                                    <UploadCloud className="w-6 h-6 text-blue-600" />
                                </div>
                                <div className="text-center">
                                    <p className="text-xs font-bold text-slate-800">Click or drag file to upload</p>
                                    <p className="text-[11px] text-slate-400 mt-0.5">PDF or Word document file supported</p>
                                </div>
                            </div>
                            <input 
                                type="file" 
                                className="hidden" 
                                onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
                            />
                        </label>
                    ) : (
                        <div className="p-4 bg-slate-50 border border-blue-200 rounded-xl flex items-center gap-4">
                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-blue-700 font-bold shrink-0">
                                <FileText className="w-5 h-5" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-xs font-bold text-slate-900 truncate">{file.name}</p>
                                <p className="text-[11px] text-slate-500 font-mono">
                                    {(file.size / 1024).toFixed(1)} KB • Ready to submit
                                </p>
                            </div>
                            <button 
                                onClick={() => setFile(null)}
                                className="p-1.5 hover:bg-slate-200 rounded-md text-slate-500 hover:text-slate-700 transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    )}
                </div>

                {/* Submit Action */}
                <button 
                    onClick={handleSubmit}
                    disabled={!file || status === 'uploading'}
                    className={`w-full py-2.5 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-2 shadow-xs ${
                        status === 'success' 
                        ? 'bg-emerald-600 text-white' 
                        : status === 'error'
                        ? 'bg-rose-600 text-white'
                        : 'bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50'
                    }`}
                >
                    {status === 'idle' && (
                        <>
                            <span>Submit Document to Vault</span>
                            <FileUp className="w-4 h-4" />
                        </>
                    )}
                    {status === 'uploading' && (
                        <span>Uploading document...</span>
                    )}
                    {status === 'success' && (
                        <>
                            <span>Document Upload Confirmed!</span>
                            <CheckCircle2 className="w-4 h-4" />
                        </>
                    )}
                    {status === 'error' && (
                        <>
                            <span>Upload Failed, Try Again</span>
                            <AlertTriangle className="w-4 h-4" />
                        </>
                    )}
                </button>
            </div>
        </div>
    );
};

export default StudentSubmission;