import { useEffect, useState } from 'react';
import api from '../../services/api';

interface AttendanceRecord {
    id: number;
    student_name: string;
    date: string;
    clock_in: string;
    clock_out: string | null;
    total_hours: number;
    status: 'Present' | 'Late' | 'Absent';
}

const ManageAttendance = () => {
    const [records, setRecords] = useState<AttendanceRecord[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchAllAttendance = async () => {
        setLoading(true);
        try {
            const response = await api.get('/attendance/all');
            if (response.data?.success) {
                setRecords(response.data.data);
            }
        } catch (error) {
            console.error("Error fetching attendance:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAllAttendance();
    }, []);

    const exportToCSV = () => {
        if (!records || records.length === 0) return;
        const headers = ['ID', 'Student Name', 'Date', 'Clock In', 'Clock Out', 'Total Hours', 'Status'];
        const rows = records.map(r => [
            r.id,
            `"${r.student_name || 'N/A'}"`,
            `"${r.date}"`,
            `"${r.clock_in}"`,
            `"${r.clock_out || 'Active'}"`,
            r.total_hours ? Number(r.total_hours).toFixed(2) : '0',
            `"${r.status}"`
        ]);

        const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement('a');
        link.setAttribute('href', encodedUri);
        link.setAttribute('download', `dtr_attendance_report_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'Present': return 'text-emerald-500 border-emerald-500/30 bg-emerald-500/5';
            case 'Late': return 'text-amber-500 border-amber-500/30 bg-amber-500/5';
            default: return 'text-slate-500 border-slate-700 bg-slate-800/20';
        }
    };

    return (
        <div className="max-w-6xl mx-auto py-10 px-4 bg-[#020617] text-slate-200 space-y-8">
            
            {/* LEDGER HEADER */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-[#0f172a] p-8 border border-slate-800 rounded-sm">
                <div className="space-y-1">
                    <h1 className="text-[10px] font-black tracking-[0.4em] text-slate-500 uppercase">Attendance Monitoring System</h1>
                    <h2 className="text-4xl font-light text-white tracking-tighter uppercase">
                        Student <span className="font-bold text-blue-500 italic underline decoration-blue-500/30 underline-offset-8">Attendance</span>
                    </h2>
                    <p className="text-[10px] font-mono text-slate-600 mt-2 uppercase">Real-time verification of student time logs and duration.</p>
                </div>

                <div className="flex flex-wrap gap-3">
                    <button 
                        onClick={exportToCSV}
                        disabled={records.length === 0}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] uppercase tracking-widest px-5 py-3 rounded transition-all shadow-lg shadow-emerald-600/20"
                    >
                        📥 Export DTR (CSV)
                    </button>
                    <button 
                        onClick={fetchAllAttendance}
                        className="border border-slate-700 hover:border-slate-500 text-slate-300 font-bold text-[10px] uppercase tracking-widest px-5 py-3 rounded transition-all"
                    >
                        🔄 Refresh Logs
                    </button>
                </div>
            </div>

            {/* TRANSACTION LOG TABLE */}
            <div className="bg-[#0f172a] border border-slate-800 rounded-sm overflow-hidden shadow-2xl">
                <div className="px-6 py-4 border-b border-slate-800 bg-slate-900/30 flex justify-between items-center">
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Live Entry Ledger</h3>
                    <div className="text-[10px] font-mono text-slate-600 uppercase">{records.length} Logs Active</div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left font-mono">
                        <thead>
                            <tr className="text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-slate-800 bg-slate-900/20">
                                <th className="px-8 py-5">Identity Ref.</th>
                                <th className="px-8 py-5">Date Index</th>
                                <th className="px-8 py-5">Time In / Out</th>
                                <th className="px-8 py-5">Duration</th>
                                <th className="px-8 py-5 text-center">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/50">
                            {loading ? (
                                Array(5).fill(0).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan={5} className="px-8 py-6 bg-slate-900/10">
                                            <div className="h-2 bg-slate-800 rounded-full w-full"></div>
                                        </td>
                                    </tr>
                                ))
                            ) : records.length > 0 ? (
                                records.map((record) => (
                                    <tr key={record.id} className="hover:bg-slate-800/30 transition-colors group">
                                        <td className="px-8 py-5">
                                            <div className="flex items-center gap-4">
                                                <div className="w-8 h-8 rounded-sm bg-slate-900 border border-slate-700 flex items-center justify-center text-[11px] font-black text-blue-500">
                                                    {record.student_name.charAt(0).toUpperCase()}
                                                </div>
                                                <span className="text-xs font-bold text-slate-200 uppercase tracking-tight">{record.student_name}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5">
                                            <div className="text-xs text-slate-400 uppercase">
                                                {new Date(record.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                                            </div>
                                        </td>
                                        <td className="px-8 py-5">
                                            <div className="flex flex-col">
                                                <span className="text-xs text-emerald-500 font-bold">{record.clock_in}</span>
                                                <span className={`text-[10px] ${record.clock_out ? 'text-slate-500' : 'text-blue-500 italic'}`}>
                                                    {record.clock_out || '>> ACTIVE'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5">
                                            <div className="text-xs font-black text-slate-400">
                                                {record.total_hours ? `${Number(record.total_hours).toFixed(2)}H` : '---'}
                                            </div>
                                        </td>
                                        <td className="px-8 py-5">
                                            <div className="flex justify-center">
                                                <span className={`px-4 py-1.5 border rounded-sm text-[9px] font-black uppercase tracking-widest ${getStatusStyle(record.status)}`}>
                                                    {record.status}
                                                </span>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} className="px-8 py-16 text-center text-slate-600 font-mono text-[10px] uppercase tracking-widest">
                                        [ No transaction records found ]
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* FOOTER AUDIT NOTE */}
            <div className="text-[9px] font-mono text-slate-700 uppercase flex justify-between px-2">
                <span>System Time: {new Date().toLocaleTimeString()}</span>
                <span>Verification Status: encrypted-node-500</span>
            </div>
        </div>
    );
};

export default ManageAttendance;