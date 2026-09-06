import { useState, useRef } from 'react';
import { Award, Download, X, ShieldCheck, Loader2 } from 'lucide-react';
// @ts-ignore
import html2pdf from 'html2pdf.js';

interface CertificateProps {
    isOpen: boolean;
    onClose: () => void;
    studentName: string;
    studentId?: string;
    course?: string;
    companyName?: string;
    renderedHours: number;
    requiredHours?: number;
    completionDate?: string;
    supervisorName?: string;
    supervisorSignature?: string | null;
}

export const CertificateOfCompletionModal = ({
    isOpen,
    onClose,
    studentName,
    studentId,
    course = 'Bachelor of Science in Information Technology',
    companyName = 'Industry Partner Host Company',
    renderedHours = 600,
    requiredHours: _requiredHours = 600,
    completionDate = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
    supervisorName = 'OJT Industry Mentor & Supervisor',
    supervisorSignature
}: CertificateProps) => {
    const certificateRef = useRef<HTMLDivElement>(null);
    const [isExporting, setIsExporting] = useState(false);

    if (!isOpen) return null;

    const certSerial = `ML-OJT-${new Date().getFullYear()}-${String(studentId || '789').padStart(4, '0')}`;

    const handleDownloadPDF = async () => {
        if (!certificateRef.current) return;
        setIsExporting(true);

        const cleanName = studentName.replace(/[^a-zA-Z0-9]/g, '_');
        const filename = `Certificate_Of_Completion_${cleanName}.pdf`;

        const opt = {
            margin: [8, 8, 8, 8] as [number, number, number, number],
            filename: filename,
            image: { type: 'jpeg' as const, quality: 0.98 },
            html2canvas: { scale: 2, useCORS: true, letterRendering: true },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'landscape' as const }
        };

        try {
            await html2pdf().set(opt).from(certificateRef.current).save();
        } catch (error) {
            console.error('Certificate PDF export error:', error);
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-xs overflow-y-auto animate-in fade-in">
            <div className="bg-white w-full max-w-5xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[94vh]">
                
                {/* Modal Header */}
                <div className="p-4 bg-slate-900 text-white flex items-center justify-between gap-3 shrink-0">
                    <div className="flex items-center gap-2">
                        <Award className="w-5 h-5 text-amber-400" />
                        <div>
                            <h3 className="text-sm font-bold tracking-tight">Official Certificate of OJT Practicum Completion</h3>
                            <span className="text-[10px] text-slate-400 font-mono">Verified Credential Serial #{certSerial}</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-2.5">
                        <button
                            onClick={handleDownloadPDF}
                            disabled={isExporting}
                            className="bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                        >
                            {isExporting ? (
                                <>
                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                    <span>Generating PDF...</span>
                                </>
                            ) : (
                                <>
                                    <Download className="w-3.5 h-3.5 text-slate-950" />
                                    <span>Download Certificate (PDF)</span>
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

                {/* Printable Certificate Canvas */}
                <div className="p-6 bg-slate-100 overflow-y-auto flex items-center justify-center">
                    <div 
                        ref={certificateRef}
                        className="bg-[#fefdfa] text-slate-900 w-full max-w-[950px] p-10 rounded-xl border-8 border-double border-amber-600/80 shadow-lg relative overflow-hidden"
                        style={{ minHeight: '620px' }}
                    >
                        {/* Decorative Corner Accents */}
                        <div className="absolute top-2 left-2 w-16 h-16 border-t-4 border-l-4 border-amber-600/70"></div>
                        <div className="absolute top-2 right-2 w-16 h-16 border-t-4 border-r-4 border-amber-600/70"></div>
                        <div className="absolute bottom-2 left-2 w-16 h-16 border-b-4 border-l-4 border-amber-600/70"></div>
                        <div className="absolute bottom-2 right-2 w-16 h-16 border-b-4 border-r-4 border-amber-600/70"></div>

                        {/* Top Watermark Badge */}
                        <div className="text-center space-y-2">
                            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-amber-50 border-2 border-amber-500 shadow-xs mb-1">
                                <Award className="w-8 h-8 text-amber-600" />
                            </div>
                            <p className="text-[11px] font-bold tracking-[0.3em] uppercase text-amber-700">
                                On-the-Job Training Practicum Program
                            </p>
                            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight uppercase font-serif">
                                Certificate of Completion
                            </h1>
                            <p className="text-xs text-slate-500 font-medium italic">
                                This official certificate is proudly presented and conferred upon
                            </p>
                        </div>

                        {/* Recipient Name */}
                        <div className="text-center my-6 py-2 border-b-2 border-amber-600/40 max-w-xl mx-auto">
                            <h2 className="text-2xl sm:text-3xl font-extrabold text-indigo-950 font-serif tracking-wide">
                                {studentName}
                            </h2>
                            {studentId && (
                                <p className="text-[11px] text-slate-500 font-mono mt-1">
                                    Student ID: {studentId} • {course}
                                </p>
                            )}
                        </div>

                        {/* Certificate Body Paragraph */}
                        <div className="text-center max-w-2xl mx-auto space-y-3 text-xs leading-relaxed text-slate-700">
                            <p>
                                for satisfactorily and successfully rendering and completing <strong className="text-indigo-950 font-bold">{renderedHours.toFixed(1)} official credit hours</strong> of professional On-the-Job Training (OJT) & Industry Practicum at
                            </p>
                            <p className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                                {companyName}
                            </p>
                            <p className="text-[11px] text-slate-600">
                                having demonstrated commendable dedication, technical proficiency, professional workplace ethics, and academic compliance in fulfillment of degree curriculum requirements.
                            </p>
                        </div>

                        {/* Footer Signatures & Date */}
                        <div className="grid grid-cols-3 gap-6 mt-12 pt-6 border-t border-slate-200 text-center items-end text-xs">
                            {/* Issue Date */}
                            <div className="space-y-1">
                                <p className="font-semibold text-slate-900 font-serif">{completionDate}</p>
                                <div className="border-t border-slate-400 w-36 mx-auto pt-1">
                                    <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-bold">Date of Conformance</span>
                                </div>
                            </div>

                            {/* Center Official Seal */}
                            <div className="flex flex-col items-center">
                                <div className="w-16 h-16 rounded-full border-2 border-amber-500/80 bg-amber-50 flex items-center justify-center shadow-xs">
                                    <ShieldCheck className="w-8 h-8 text-amber-600" />
                                </div>
                                <span className="text-[9px] font-mono font-bold text-amber-800 uppercase tracking-widest mt-1">Official Seal</span>
                            </div>

                            {/* Supervisor Signature */}
                            <div className="space-y-1">
                                <div className="h-10 flex items-center justify-center">
                                    {supervisorSignature ? (
                                        <img src={supervisorSignature} alt="Supervisor Signature" className="max-h-9 max-w-[140px] object-contain" />
                                    ) : (
                                        <span className="font-serif italic text-indigo-900 text-sm font-bold">Verified Digital Sign-Off</span>
                                    )}
                                </div>
                                <div className="border-t border-slate-400 w-44 mx-auto pt-1">
                                    <p className="font-bold text-slate-900 truncate">{supervisorName}</p>
                                    <span className="text-[10px] text-slate-500 uppercase tracking-wider block">OJT Industry Mentor</span>
                                </div>
                            </div>
                        </div>

                        {/* Serial Footer */}
                        <div className="mt-8 flex justify-between items-center text-[9px] font-mono text-slate-400 pt-2 border-t border-slate-100">
                            <span>System Issued via MentorLog OJT Management System</span>
                            <span>Credential ID: {certSerial}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CertificateOfCompletionModal;
