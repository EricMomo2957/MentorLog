import React, { useRef } from 'react';
import { X, Printer, Award, ShieldCheck, CheckCircle2 } from 'lucide-react';

interface OJTCertificateModalProps {
    isOpen: boolean;
    onClose: () => void;
    studentName: string;
    studentId?: string;
    course?: string;
    totalHoursRendered: number;
    requiredHours: number;
    completionDate?: string;
}

export const OJTCertificateModal: React.FC<OJTCertificateModalProps> = ({
    isOpen,
    onClose,
    studentName,
    studentId,
    course,
    totalHoursRendered,
    requiredHours,
    completionDate
}) => {
    const certificateRef = useRef<HTMLDivElement>(null);

    if (!isOpen) return null;

    const formattedDate = completionDate 
        ? new Date(completionDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
        : new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in">
            {/* Modal Container */}
            <div className="bg-white rounded-3xl max-w-4xl w-full shadow-2xl border border-slate-200 overflow-hidden my-6 flex flex-col">
                
                {/* Modal Header Bar */}
                <div className="bg-slate-900 px-6 py-4 flex items-center justify-between text-white border-b border-slate-800 print:hidden">
                    <div className="flex items-center gap-2">
                        <Award className="w-5 h-5 text-amber-400" />
                        <h2 className="text-sm font-bold tracking-tight">Official Certificate of OJT Completion</h2>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={handlePrint}
                            className="bg-amber-500 hover:bg-amber-600 text-slate-950 px-4 py-2 rounded-xl text-xs font-extrabold shadow-sm transition-all flex items-center gap-2 cursor-pointer"
                        >
                            <Printer className="w-4 h-4" />
                            <span>Print / Save PDF</span>
                        </button>

                        <button
                            onClick={onClose}
                            className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Certificate Print Area */}
                <div className="p-6 md:p-10 bg-slate-100 flex justify-center">
                    
                    <div 
                        ref={certificateRef}
                        id="printable-certificate"
                        className="bg-white max-w-3xl w-full p-8 md:p-12 border-8 border-double border-amber-600/60 rounded-2xl shadow-xl relative text-center space-y-6 text-slate-900 overflow-hidden"
                    >
                        {/* Corner Gold Flourish Accents */}
                        <div className="absolute top-3 left-3 w-8 h-8 border-t-2 border-l-2 border-amber-500"></div>
                        <div className="absolute top-3 right-3 w-8 h-8 border-t-2 border-r-2 border-amber-500"></div>
                        <div className="absolute bottom-3 left-3 w-8 h-8 border-b-2 border-l-2 border-amber-500"></div>
                        <div className="absolute bottom-3 right-3 w-8 h-8 border-b-2 border-r-2 border-amber-500"></div>

                        {/* Certificate Header Branding */}
                        <div className="space-y-2 pt-2">
                            <div className="w-16 h-16 bg-amber-500/10 border-2 border-amber-500 rounded-full flex items-center justify-center mx-auto text-amber-600 shadow-inner">
                                <Award className="w-9 h-9" />
                            </div>
                            <p className="text-xs font-bold text-amber-600 uppercase tracking-widest font-mono">
                                Official Academic Internship Credential
                            </p>
                            <h1 className="text-3xl md:text-4xl font-serif font-black tracking-wide text-slate-900 uppercase">
                                Certificate of Completion
                            </h1>
                        </div>

                        <p className="text-xs text-slate-500 uppercase tracking-widest font-semibold">
                            This is proudly presented to
                        </p>

                        {/* Recipient Name */}
                        <div className="py-2 border-b-2 border-amber-500/80 max-w-md mx-auto">
                            <h2 className="text-2xl md:text-3xl font-serif font-bold text-slate-900 tracking-tight">
                                {studentName}
                            </h2>
                        </div>

                        {studentId && (
                            <p className="text-xs font-mono text-slate-500">
                                Student ID: <strong className="text-slate-800">{studentId}</strong> {course ? `| ${course}` : ''}
                            </p>
                        )}

                        {/* Certificate Body Text */}
                        <p className="text-xs md:text-sm text-slate-700 max-w-xl mx-auto leading-relaxed font-medium">
                            for successfully completing the required <strong className="text-amber-700 font-bold">{requiredHours} Hours</strong> of On-the-Job Training (OJT) Internship, demonstrating outstanding technical competence, professionalism, and dedication throughout the program duration with a total rendered log of <strong className="text-emerald-700 font-bold">{totalHoursRendered.toFixed(1)} Hours</strong>.
                        </p>

                        {/* Program Verification Stamp */}
                        <div className="flex justify-center items-center gap-6 pt-4">
                            <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-200 px-4 py-1.5 rounded-full text-[11px] font-bold text-amber-900">
                                <ShieldCheck className="w-4 h-4 text-amber-600" />
                                <span>Verified 100% Requirement Fulfilled</span>
                            </div>
                            <div className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 px-4 py-1.5 rounded-full text-[11px] font-bold text-emerald-900">
                                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                <span>MentorLog Certified</span>
                            </div>
                        </div>

                        {/* Date & Signatures Block */}
                        <div className="grid grid-cols-2 gap-8 pt-8 border-t border-slate-200/80 max-w-2xl mx-auto">
                            <div className="text-center space-y-1">
                                <div className="h-10 flex items-end justify-center">
                                    <span className="font-serif italic text-base text-slate-800 border-b border-slate-900 px-6 pb-1">
                                        Eric Dominic Momo
                                    </span>
                                </div>
                                <p className="text-xs font-bold text-slate-900 mt-1">OJT Internship Mentor</p>
                                <p className="text-[10px] text-slate-500 uppercase tracking-wider">Industry Supervisor</p>
                            </div>

                            <div className="text-center space-y-1">
                                <div className="h-10 flex items-end justify-center">
                                    <span className="font-serif italic text-base text-slate-800 border-b border-slate-900 px-6 pb-1">
                                        Academic Coordinator
                                    </span>
                                </div>
                                <p className="text-xs font-bold text-slate-900 mt-1">University OJT Coordinator</p>
                                <p className="text-[10px] text-slate-500 uppercase tracking-wider">Academic Head</p>
                            </div>
                        </div>

                        <p className="text-[10px] font-mono text-slate-400 pt-2">
                            Issued on {formattedDate} • MentorLog Verification ID: #{Date.now().toString().slice(-8)}
                        </p>
                    </div>

                </div>
            </div>

            {/* Dedicated Print Media Styles */}
            <style>{`
                @media print {
                    body * {
                        visibility: hidden;
                    }
                    #printable-certificate, #printable-certificate * {
                        visibility: visible;
                    }
                    #printable-certificate {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100%;
                        margin: 0;
                        padding: 40px;
                        border-width: 6px;
                        box-shadow: none;
                    }
                    .print\\:hidden {
                        display: none !important;
                    }
                }
            `}</style>
        </div>
    );
};
