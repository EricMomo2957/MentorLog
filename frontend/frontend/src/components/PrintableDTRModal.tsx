import { Printer, X, Download } from 'lucide-react';

interface AttendanceRecord {
    id: number;
    student_name: string;
    date: string;
    clock_in: string;
    clock_out: string | null;
    total_hours: number;
    status: 'Present' | 'Late' | 'Absent';
}

interface PrintableDTRModalProps {
    isOpen: boolean;
    onClose: () => void;
    studentName: string;
    studentId?: string;
    course?: string;
    records: AttendanceRecord[];
    monthYear?: string;
}

export const PrintableDTRModal = ({
    isOpen,
    onClose,
    studentName,
    studentId = 'N/A',
    course = 'BS Information Technology',
    records,
    monthYear = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
}: PrintableDTRModalProps) => {
    if (!isOpen) return null;

    const totalRenderedHours = records.reduce((acc, curr) => acc + (Number(curr.total_hours) || 0), 0);

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/75 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
            {/* Modal Box */}
            <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
                
                {/* Modal Top Bar (Non-Printable) */}
                <div className="p-4 bg-slate-900 text-white flex items-center justify-between print:hidden">
                    <div className="flex items-center gap-2">
                        <Printer className="w-4 h-4 text-blue-400" />
                        <h3 className="text-sm font-bold tracking-tight">Printable Daily Time Record (Civil Service Form No. 48)</h3>
                    </div>

                    <div className="flex items-center gap-3">
                        <button 
                            onClick={handlePrint}
                            className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-2 active:scale-95"
                        >
                            <Printer className="w-3.5 h-3.5" />
                            <span>Print / Save as PDF</span>
                        </button>

                        <button 
                            onClick={onClose}
                            className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Printable Document Area */}
                <div className="p-8 sm:p-12 overflow-y-auto flex-1 bg-white text-slate-900 font-serif print:p-0 print:overflow-visible" id="dtr-print-area">
                    
                    {/* Header */}
                    <div className="text-center space-y-1 border-b-2 border-slate-900 pb-4 mb-6">
                        <p className="text-[10px] uppercase font-bold tracking-widest text-slate-500">Civil Service Form No. 48</p>
                        <h1 className="text-2xl font-extrabold uppercase tracking-tight text-slate-900">DAILY TIME RECORD</h1>
                        <p className="text-xs italic text-slate-600">MentorLog OJT Industry Internship Program</p>
                    </div>

                    {/* Student Info Grid */}
                    <div className="grid grid-cols-2 gap-4 text-xs mb-6 bg-slate-50 p-4 rounded-xl border border-slate-200 print:bg-transparent print:border-none print:p-0">
                        <div>
                            <p><span className="font-bold text-slate-700">Name:</span> <span className="font-semibold">{studentName}</span></p>
                            <p><span className="font-bold text-slate-700">Student ID:</span> <span className="font-mono">{studentId}</span></p>
                        </div>
                        <div className="text-right print:text-left">
                            <p><span className="font-bold text-slate-700">Course / Major:</span> <span>{course}</span></p>
                            <p><span className="font-bold text-slate-700">Period Covered:</span> <span className="font-bold text-blue-900">{monthYear}</span></p>
                        </div>
                    </div>

                    {/* DTR Table */}
                    <table className="w-full text-xs text-left border-collapse border border-slate-900 mb-6">
                        <thead>
                            <tr className="bg-slate-100 text-slate-900 uppercase font-bold text-[10px] text-center border-b border-slate-900">
                                <th className="border border-slate-900 py-2 px-2 w-20">Date</th>
                                <th className="border border-slate-900 py-2 px-2">Clock In (AM/PM)</th>
                                <th className="border border-slate-900 py-2 px-2">Clock Out (AM/PM)</th>
                                <th className="border border-slate-900 py-2 px-2 w-24">Hours Rendered</th>
                                <th className="border border-slate-900 py-2 px-2 w-24">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {records.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="text-center py-6 text-slate-400 italic">No attendance records logged for this period.</td>
                                </tr>
                            ) : (
                                records.map((r, i) => (
                                    <tr key={i} className="text-center border-b border-slate-300 font-sans">
                                        <td className="border border-slate-400 py-2 px-2 font-mono font-semibold">{r.date.split('T')[0]}</td>
                                        <td className="border border-slate-400 py-2 px-2 font-mono">{r.clock_in}</td>
                                        <td className="border border-slate-400 py-2 px-2 font-mono">{r.clock_out || '---'}</td>
                                        <td className="border border-slate-400 py-2 px-2 font-mono font-bold text-emerald-800">
                                            {Number(r.total_hours).toFixed(2)} hrs
                                        </td>
                                        <td className="border border-slate-400 py-2 px-2 font-semibold text-[11px]">
                                            {r.status}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                        <tfoot>
                            <tr className="bg-slate-100 font-bold border-t-2 border-slate-900 text-center">
                                <td colSpan={3} className="py-2.5 px-4 text-right uppercase text-[11px]">Total Accumulated Hours Rendered:</td>
                                <td className="py-2.5 px-2 font-mono text-sm text-blue-900 font-black border border-slate-900">
                                    {totalRenderedHours.toFixed(2)} hrs
                                </td>
                                <td className="border border-slate-900"></td>
                            </tr>
                        </tfoot>
                    </table>

                    {/* Certificate & Signatures */}
                    <div className="space-y-8 pt-4 text-xs">
                        <p className="italic text-slate-700 leading-relaxed">
                            I certify on my honor that the above is a true and correct record of the hours of work performed, 
                            record of which was made daily at the time of arrival and departure from office.
                        </p>

                        <div className="grid grid-cols-2 gap-12 pt-8">
                            <div className="text-center border-t border-slate-900 pt-2">
                                <p className="font-bold text-slate-900 uppercase">{studentName}</p>
                                <p className="text-[10px] text-slate-500">Student Intern Signature</p>
                            </div>

                            <div className="text-center border-t border-slate-900 pt-2">
                                <p className="font-bold text-slate-900 uppercase">OJT Supervisor / Mentor</p>
                                <p className="text-[10px] text-slate-500">Authorized Signature & Seal</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Print Styles */}
            <style>{`
                @media print {
                    body * {
                        visibility: hidden;
                    }
                    #dtr-print-area, #dtr-print-area * {
                        visibility: visible;
                    }
                    #dtr-print-area {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100%;
                        padding: 0 !important;
                    }
                }
            `}</style>
        </div>
    );
};
