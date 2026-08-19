import { useState } from 'react';
import api from '../../services/api';
import { 
    UploadCloud, FileText, ShieldCheck, 
    X, HardDrive, CheckCircle2, AlertTriangle, 
    FileUp, Fingerprint
} from 'lucide-react';

const StudentSubmission = () => {
    const [file, setFile] = useState<File | null>(null);
    const [docType, setDocType] = useState("Resume");
    const [status, setStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');

    const handleSubmit = async () => {
        if (!file) return;

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
        <div className="min-h-screen bg-[#0a0f1c] text-slate-300 p-6 md:p-12 flex flex-col items-center justify-center antialiased">
            
            {/* Background Branding Decor */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/5 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-500/5 rounded-full blur-[120px]" />
            </div>

            <div className="w-full max-w-2xl z-10 space-y-8">
                
                {/* Header Block */}
                <div className="text-center space-y-2">
                    <div className="flex items-center justify-center gap-2 text-blue-500 font-black tracking-[0.4em] text-[10px] uppercase">
                        <ShieldCheck className="w-4 h-4" />
                        Secure Archive Protocol
                    </div>
                    <h1 className="text-4xl font-black text-white tracking-tighter uppercase italic">
                        Requirement <span className="text-slate-600 font-light">Vault</span>
                    </h1>
                </div>

                <div className="bg-[#0d1424] border border-slate-800 rounded-[2.5rem] overflow-hidden shadow-[0_30px_100px_rgba(0,0,0,0.5)]">
                    
                    {/* Repository Meta Header */}
                    <div className="px-8 py-5 border-b border-slate-800 bg-slate-900/50 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">System Ready: ID_101</span>
                        </div>
                        <Fingerprint className="w-4 h-4 text-slate-700" />
                    </div>

                    <div className="p-10 space-y-8">
                        
                        {/* Document Type Selector */}
                        <div className="space-y-3">
                            <label className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Classification</label>
                            <div className="grid grid-cols-3 gap-3">
                                {['Resume', 'OJT Waiver', 'Clearance'].map((type) => (
                                    <button
                                        key={type}
                                        onClick={() => setDocType(type)}
                                        className={`py-3 px-2 rounded-xl border text-[9px] font-black uppercase tracking-widest transition-all ${
                                            docType === type 
                                            ? 'bg-blue-600/10 border-blue-500 text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.1)]' 
                                            : 'bg-slate-950 border-slate-800 text-slate-600 hover:border-slate-700'
                                        }`}
                                    >
                                        {type}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* File Drop/Upload Zone */}
                        <div className="space-y-3">
                            <label className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Digital Asset</label>
                            {!file ? (
                                <label className="group relative flex flex-col items-center justify-center w-full h-56 border-2 border-dashed border-slate-800 rounded-4xl bg-slate-950/50 hover:bg-slate-900/50 hover:border-blue-500/50 transition-all cursor-pointer overflow-hidden">
                                    <div className="flex flex-col items-center justify-center pt-5 pb-6 space-y-4">
                                        <div className="p-4 bg-slate-900 rounded-2xl group-hover:scale-110 transition-transform duration-500 border border-slate-800 group-hover:border-blue-500/30">
                                            <UploadCloud className="w-8 h-8 text-slate-600 group-hover:text-blue-500 transition-colors" />
                                        </div>
                                        <div className="text-center">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Deploy File to Vault</p>
                                            <p className="text-[9px] text-slate-600 uppercase tracking-tighter mt-1 font-bold">PDF, DOCX up to 10MB</p>
                                        </div>
                                    </div>
                                    <input 
                                        type="file" 
                                        className="hidden" 
                                        onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
                                    />
                                    {/* Scanline Animation Effect */}
                                    <div className="absolute inset-0 bg-linear-to-b from-transparent via-blue-500/5 to-transparent h-1/2 w-full -translate-y-full group-hover:animate-scan" />
                                </label>
                            ) : (
                                <div className="relative p-6 bg-slate-950 border border-blue-500/30 rounded-4xl flex items-center gap-5 animate-in zoom-in-95 duration-300">
                                    <div className="w-14 h-14 bg-blue-500/10 rounded-2xl flex items-center justify-center border border-blue-500/20">
                                        <FileText className="w-7 h-7 text-blue-500" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-black text-white uppercase truncate">{file.name}</p>
                                        <p className="text-[9px] text-slate-500 font-bold uppercase mt-1 tracking-widest">
                                            {(file.size / 1024).toFixed(1)} KB • Ready for Transmission
                                        </p>
                                    </div>
                                    <button 
                                        onClick={() => setFile(null)}
                                        className="p-2 hover:bg-red-500/10 hover:text-red-500 rounded-xl transition-colors text-slate-600"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Submit Button */}
                        <button 
                            onClick={handleSubmit}
                            disabled={!file || status === 'uploading'}
                            className={`w-full relative overflow-hidden py-5 rounded-2xl font-black text-[11px] uppercase tracking-[0.3em] transition-all flex items-center justify-center gap-3 active:scale-[0.98] ${
                                status === 'success' 
                                ? 'bg-emerald-600 text-white' 
                                : status === 'error'
                                ? 'bg-red-600 text-white'
                                : 'bg-blue-600 hover:bg-blue-500 text-white shadow-xl shadow-blue-900/20 disabled:opacity-20 disabled:grayscale'
                            }`}
                        >
                            {status === 'idle' && (
                                <>
                                    Execute Upload <FileUp className="w-4 h-4" />
                                </>
                            )}
                            {status === 'uploading' && (
                                <div className="flex items-center gap-3">
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Encrypting & Sending...
                                </div>
                            )}
                            {status === 'success' && (
                                <>
                                    Archive Confirmed <CheckCircle2 className="w-4 h-4" />
                                </>
                            )}
                            {status === 'error' && (
                                <>
                                    Transmission Failed <AlertTriangle className="w-4 h-4" />
                                </>
                            )}
                        </button>
                    </div>
                </div>

                {/* Secure Footer Tag */}
                <div className="flex items-center justify-between px-6 opacity-30 group cursor-default">
                    <div className="flex items-center gap-2">
                        <HardDrive className="w-3 h-3" />
                        <span className="text-[8px] font-black uppercase tracking-[0.3em]">Storage Node: PH_CEBU_01</span>
                    </div>
                    <span className="text-[8px] font-black uppercase tracking-[0.3em]">v2.0.4-Stable</span>
                </div>
            </div>

            {/* Custom Scan Animation (Add to your Tailwind Config or Global CSS) */}
            <style>{`
                @keyframes scan {
                    from { transform: translateY(-100%); }
                    to { transform: translateY(200%); }
                }
                .animate-scan {
                    animation: scan 2s linear infinite;
                }
            `}</style>
        </div>
    );
};

export default StudentSubmission;